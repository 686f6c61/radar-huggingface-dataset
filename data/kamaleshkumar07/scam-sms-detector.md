# Kamaleshkumar07/scam-sms-detector

## Resumen

ScamShield es un clasificador de texto binario orientado a la deteccion de SMS fraudulentos (scam/spam) publicado por el usuario Kamaleshkumar07 en HuggingFace bajo el identificador `Kamaleshkumar07/scam-sms-detector`. A diferencia de los modelos de lenguaje generativos, no se trata de una red neuronal transformer, sino de un ensemble apilado (stacking) de clasificadores clasicos de machine learning: regresion logistica, LinearSVC, NB-SVM, SGD y LightGBM, combinados sobre caracteristicas TF-IDF a nivel de caracter y de palabra mas caracteristicas artesanales, con calibracion Platt para producir probabilidades.

El modelo resuelve un problema acotado y bien definido: distinguir mensajes SMS legitimos de mensajes fraudulentos, con atencion especifica al fenomeno del Tanglish (tamil romanizado), habitual en campanas de estafa dirigidas a usuarios de India. Su relevancia practica reside en la ligereza del artefacto (formato joblib, ejecutable en CPU y sin GPU) y en las metricas declaradas por el autor sobre un conjunto de prueba de 745 mensajes: 99,2 % de exactitud, 98,2 % de recall, 0,63 % de tasa de falsos positivos y ROC-AUC de 0,9986.

El repositorio es de tamano practicamente nulo (0,0 GB), no acumula descargas ni likes en el momento de la consulta y fue creado y actualizado el 11 de octubre de 2026. Esto implica que se trata de un proyecto personal sin validacion independiente por parte de la comunidad. La informacion disponible es escasa y proviene integramente de la model card del autor y del repositorio de codigo asociado; no se han localizado papers, blogs ni demos externos relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble apilado (stacking) de clasificadores clasicos: regresion logistica, LinearSVC, NB-SVM, SGD y LightGBM, con calibracion Platt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; clasifica mensajes SMS individuales) |
| Tipos de cuantizacion | no aplica (modelos clasicos serializados; se distribuye como artefacto joblib) |
| Idiomas soportados | no disponible oficialmente; el autor indica soporte para ingles y Tanglish romanizado; no cubre escritura tamil |
| Licencia | MIT |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El modelo sigue un esquema de ensemble por apilamiento. Segun la model card, combina cinco estimadores base (regresion logistica, LinearSVC, NB-SVM, SGD y LightGBM) entrenados sobre una representacion de caracteristicas que mezcla TF-IDF a nivel de caracter y de palabra con caracteristicas artesanales adicionales. Las salidas se calibran mediante escalado Platt, lo que permite obtener probabilidades interpretables en lugar de puntuaciones sin calibrar. El artefacto final se serializa en formato joblib, lo que implica dependencias concretas de version de scikit-learn (el autor fija `scikit-learn==1.6.1`).

No se dispone de informacion sobre el volumen del conjunto de entrenamiento, la composicion exacta del dataset ni el proceso de seleccion de hiperparametros. El autor unicamente detalla el conjunto de prueba: 745 mensajes, en su mayoria procedentes del UCI SMS Spam Collection, un corpus publico ampliamente utilizado en tareas de deteccion de spam. Se menciona que solo cuatro mensajes reales de origen indio forman parte de los datos, lo que limita la medicion de la precision especifica para ese contexto. No se reporta el uso de tecnicas como RLHF o DPO, que no resultan aplicables a este tipo de modelo clasico.

## Capacidades

- Clasificacion binaria de mensajes SMS: distingue entre mensajes fraudulentos (scam/spam) y mensajes legitimos.
- Salida probabilistica calibrada (Platt), apta para fijar umbrales de decision segun la tolerancia a falsos positivos.
- Soporte explicito de Tanglish romanizado (tamil transliterado al alfabeto latino), frecuente en estafas dirigidas a usuarios de India.
- Deteccion basada en caracteristicas lexicas y estructurales (TF-IDF de caracteres y palabras), sensible a URL sospechosas, palabras clave de estafa y patrones de texto habituales en SMS fraudulentos.
- No dispone de generacion de texto.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es multimodal: no procesa vision ni audio.
- No cubre escritura tamil nativa, unicamente su forma romanizada.

## Casos de uso

- Filtrado de SMS en operadores de telecomunicaciones: el modelo puede integrarse como paso de clasificacion previo a la entrega del mensaje, marcando aquellos con probabilidad alta de estafa. Su bajo coste computacional en CPU permite desplegarlo en pasarelas de alto volumen.
- Proteccion antiphishing en aplicaciones bancarias: para entidades con clientela en India, el soporte de Tanglish romanizado permite detectar mensajes de KYC o verificacion fraudulenta redactados en ese registro.
- Moderacion en aplicaciones de mensajeria: como capa automatica que etiqueta conversaciones sospechosas antes de la revision humana, gracias a su salida probabilistica calibrada que facilita el ajuste de umbral.
- Enriquecimiento de pipelines de ciberseguridad: el clasificador puede alimentar sistemas SIEM o plataformas antifraude que agreguen senales de multiples canales (correo, SMS, llamadas).
- Investigacion academica sobre spam: al estar basado en el UCI SMS Spam Collection, sirve como linea base reproducible para comparar arquitecturas clasicas frente a modelos neuronales en deteccion de spam.
- Prefiltrado de bajo coste antes de modelos generativos: en arquitecturas hibridas, este modelo puede descartar la mayoria del trafico limpio y reservar un LLM mas costoso para los casos ambiguos.
- Analisis retrospectivo de campanas de estafa: aplicado por lotes sobre corpus historicos de SMS para caracterizar patrones y evolución de las estafas dirigidas a poblacion india.

## Benchmarks y rendimiento

Metricas declaradas por el autor sobre un conjunto de prueba de 745 mensajes, mayoritariamente del UCI SMS Spam Collection:

| Metrica | Valor |
|---|---|
| Accuracy | 99,2 % |
| Recall | 98,2 % |
| Tasa de falsos positivos (FPR) | 0,63 % |
| ROC-AUC | 0,9986 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada, ni de desglose por subconjuntos (por ejemplo, mensajes indios reales o Tanglish).

## Requisitos de hardware

- No requiere GPU: se trata de un ensemble de modelos clasicos serializados en joblib que se ejecuta en CPU.
- VRAM estimada para inferencia: no aplica.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica; el modelo cabe y se ejecuta en cualquier equipo, incluidos portatiles sin acelerador.
- Opciones de despliegue: ejecucion directa mediante Python con `scikit-learn==1.6.1`, `lightgbm`, `scipy`, `numpy`, `pandas` y `joblib`; puede servirse a traves de un microservicio (por ejemplo, FastAPI o Flask) que cargue el artefacto joblib.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (TF-IDF mas estimadores lineales y un LightGBM), es esperable una latencia muy baja en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas concretas de la misma categoria, ya que la ficha no incluye modelos equivalentes ni datos comparativos publicados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScamShield (este modelo) | no disponible | no aplica | Accuracy 99,2 %; ROC-AUC 0,9986 (test propio de 745 mensajes) | MIT | HuggingFace y GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo de dominio: solo cuatro mensajes reales de origen indio forman parte de los datos evaluados, por lo que el autor reconoce que la precision especifica para India no esta medida.
- Cobertura linguistica parcial: se soporta Tanglish romanizado, pero no la escritura tamil nativa, lo que deja fuera mensajes redactados en ese alfabeto.
- Falsos positivos en mensajes compuestos unicamente por numeros, que pueden ser marcados incorrectamente como fraudulentos.
- Riesgo de sobreajuste al UCI SMS Spam Collection: parte del conjunto de prueba procede de ese corpus, ampliamente utilizado en la literatura, lo que puede inflar las metricas declaradas.
- Las metricas de rendimiento son autodeclaradas por el autor y no han sido verificadas por terceros.
- Ausencia de validacion externa: el modelo no acumula descargas, likes ni citas en el momento de la consulta, creado en octubre de 2026.
- Dependencia estricta de versiones: la model card fija `scikit-learn==1.6.1`, por lo que cargar el artefacto en entornos con otras versiones puede producir incompatibilidades.
- Licencia MIT: permite uso comercial y modificacion, pero no ofrece garantias; conviene auditar el modelo antes de integrarlo en produccion.
- Fecha de creacion inusualmente futura (2026-10-11) en los metadatos de HuggingFace, lo que puede indicar un artefacto de prueba o un error de registro.
- No se dispone de informacion sobre sesgos demograficos o linguisticos mas alla de las advertencias del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kamaleshkumar07/scam-sms-detector
- Repositorio de codigo en GitHub: https://github.com/kamaleshkumar12/scam-sms-detector
- Paper, blog o demo oficial: no disponible
- Los resultados de la busqueda web proporcionada (paginas de Credit Agricole) no guardan relacion con este modelo y no se incluyen como fuentes relevantes.
