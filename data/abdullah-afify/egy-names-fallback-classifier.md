# Abdullah-afify/egy-names-fallback-classifier

## Resumen

El modelo `egy-names-fallback-classifier`, desarrollado por Abdullah Afify, es un clasificador de texto ligero basado en scikit-learn que infiere género, religión y rol (nombre de pila, apellido, etc.) para nombres propios egipcios. Está diseñado como un componente de respaldo del sistema `egy-names`, un motor onomástico que utiliza un catálogo de 44.626 lemas anotados manualmente. Su función principal es cubrir los nombres que no aparecen en ese catálogo, como apellidos extranjeros, variantes ortográficas raras o neologismos, devolviendo predicciones explícitamente marcadas como `inferred: true` para distinguirlas de los hechos atestiguados.

A diferencia de los clasificadores de nombres convencionales, este modelo está calibrado para maximizar la precisión en el momento de emitir una predicción y para abstenerse (devolviendo `unknown` o `neutral`) cuando no alcanza la confianza suficiente. Emplea una arquitectura de regresión logística multinomial con tres cabezas independientes (género, religión y rol), alimentadas por n-gramas de caracteres con TF-IDF y reglas morfológicas heurísticas. Es un modelo pequeño, de ejecución rápida y sin dependencias externas en tiempo de inferencia, distribuido bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial (3 cabezas independientes) con features TF-IDF de n-gramas de caracteres y reglas morfologicas |
| Parametros totales | No disponible (modelo de regresion logistica, no se publica el numero de coeficientes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de texto corto, nombres individuales) |
| Tipos de cuantizacion | No aplica (pesos en JSON comprimido, no es un modelo de red neuronal profunda) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | MIT |
| Formato de pesos | JSON comprimido (`infer_model.json.gz`) |

## Arquitectura y entrenamiento

El modelo combina tres componentes principales. En primer lugar, un conjunto de reglas previas de alta precision (por ejemplo, prefijos compuestos como `عبد` que indican varon y musulman) que se ejecutan antes que el modelo estadistico y lo cortocircuitan cuando se cumplen. En segundo lugar, un extractor de features basado en n-gramas de caracteres sobre la forma normalizada del nombre, junto con indicadores morfologicos como el script (arabe o latino), prefijos y sufijos comunes, longitud y presencia de diacriticos. Estos features se transforman con TF-IDF y alimentan tres clasificadores de regresion logistica multinomial independientes, uno para genero, otro para religion y otro para rol.

El entrenamiento se realizo sobre el dataset `Abdullah-afify/egyptian-names`, que contiene los 44.626 lemas del catalogo canonico de `egy-names`, filtrando las filas de baja confianza o fabricadas. Los umbrales de abstencion se calibraron experimentalmente con un script de validacion que media la precision real en un conjunto retenido. Tras una primera pasada que no cumplia las promesas de precision esperadas (por ejemplo, `role="given"` devolvia solo 81,8% de precision), se recalibraron los umbrales hasta alcanzar los valores publicados en la model card. Ademas, cada prediccion se complementa con el vecino mas cercano del catalogo por distancia de Levenshtein, para que el llamador pueda entender el razonamiento del modelo.

## Capacidades

- Clasificacion de genero (masculino/femenino/neutral) para nombres egipcios.
- Clasificacion de religion (musulman/cristiano/unknown) basada en convenciones onomasticas egipcias.
- Clasificacion de rol (nombre de pila, apellido, etc.) segun la estructura patronimica egipcia.
- Abstencion automatica cuando la confianza no supera umbrales calibrados, devolviendo `unknown` o `neutral` en lugar de forzar una etiqueta.
- Reglas previas heuristicas de alta precision para casos comunes (por ejemplo, compuestos con `عبد`).
- Explicabilidad parcial mediante la coincidencia con el vecino mas cercano del catalogo (distancia de Levenshtein).
- Inferencia ligera y sin dependencias de scikit-learn en tiempo de ejecucion (el archivo JSON puede leerse desde cualquier lenguaje).
- Soporte para nombres en arabe y en transliteracion inglesa.

## Casos de uso

- Enriquecimiento de bases de datos de clientes: al incorporar nuevos registros con nombres no presentes en el catalogo, el modelo puede asignar genero y religion probables para segmentar campanas de marketing o personalizar comunicaciones, siempre marcando el resultado como inferido.
- Verificacion de identidad en servicios financieros: al validar nombres en formularios de alta, el modelo puede detectar inconsistencias entre el genero declarado y el inferido, ayudando a prevenir fraude sin bloquear al usuario si el modelo se abstiene.
- Analisis demografico y sociologico: investigadores pueden clasificar grandes volumenes de nombres de redes sociales o censos para estudiar distribuciones de genero y religion en poblaciones egipcias o de la diaspora, usando el modo de abstencion para excluir casos dudosos.
- Generacion de datos sinteticos: en el desarrollo de aplicaciones que necesitan nombres egipcios ficticios (por ejemplo, pruebas de software o juegos), el modelo puede complementar el catalogo generando etiquetas para nombres inventados.
- Sistemas de recomendacion de nombres para recien nacidos: una aplicacion que sugiere nombres puede usar el modelo para filtrar sugerencias que no coincidan con el perfil de genero o religion deseado por los padres.
- Correccion y normalizacion de nombres en pipelines de datos: al integrarse con el SDK de `egy-names`, el modelo permite identificar y etiquetar automaticamente nombres mal escritos o variantes regionales, mejorando la calidad de los datos antes de otros procesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque este modelo no es un LLM sino un clasificador especifico. Sin embargo, la model card documenta la precision medida en un conjunto retenido para cada clase y umbral de abstencion:

| Clase | Umbral de abstencion | Precision medida en ese umbral |
|---|---|---|
| genero = masculino | p ≥ 0.70 | 93,3% |
| genero = femenino | p ≥ 0.70 | 95,5% |
| religion = musulman | p ≥ 0.85 | 96,6% |
| religion = cristiano | p ≥ 0.90 | 95,1% |
| rol = nombre de pila | p ≥ 0.88 | 93,0% |

Estos valores indican la precision condicionada a que el modelo supere el umbral; por debajo de el, el modelo se abstiene.

## Requisitos de hardware

- Al ser un modelo de regresion logistica con features TF-IDF, no requiere GPU. Se ejecuta correctamente en cualquier CPU moderna.
- El peso del archivo `infer_model.json.gz` es inferior a 1 MB (el tamano del repositorio es 0.0 GB), por lo que cabe en cualquier dispositivo, incluidos entornos serverless o moviles.
- Consumo de RAM minimo: menos de 100 MB en tiempo de inferencia (estimacion razonable para un modelo de este tamano).
- Opciones de despliegue: puede usarse directamente con scikit-learn si se carga el JSON, o implementarse en cualquier lenguaje leyendo el archivo comprimido. Tambien puede integrarse en el SDK de `egy-names` (Python, PHP, Dart) a traves de su API `identify()`/`identify_all()`.
- Latencia: del orden de microsegundos por nombre en CPU, al tratarse de una multiplicacion de matrices pequena.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. Existen servicios comerciales de clasificacion de nombres (por ejemplo, genderize.io o Namsor), pero no se han publicado comparativas con este modelo. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con patrones onomasticos egipcios; su precision en otros dialectos arabes o en nombres de otras culturas sera baja.
- Las predicciones son siempre inferencias probabilisticas, nunca hechos atestiguados. El modelo esta disenado para abstenerse en caso de duda, pero cuando habla, puede equivocarse.
- No es un modelo de lenguaje: no genera texto ni comprende contexto mas alla de la morfologia del nombre.
- Las reglas previas y los umbrales de abstencion se calibraron sobre el dataset egipcio; si se usa en otro dominio, los umbrales pueden no ser adecuados.
- El formato de pesos es JSON comprimido, no safetensors ni GGUF; no es compatible con frameworks de inferencia de redes neuronales convencionales.
- Aunque la licencia MIT permite uso comercial, el modelo depende del catalogo de `egy-names` para su funcionamiento completo; ese catalogo tiene su propia licencia (MIT, segun el dataset).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdullah-afify/egy-names-fallback-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Abdullah-afify/egyptian-names
- Repositorio del proyecto (SDK Python): https://github.com/AbdullahAfifyKhalil/egy-names
- Repositorio del SDK PHP: https://github.com/AbdullahAfifyKhalil/egy-names-php
- Documentacion del SDK Dart: https://pub.dev/documentation/egy_names/latest/
- Pagina del producto: https://afify.co/egy-names
