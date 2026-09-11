# gmarti/ordinalicl-tabdpt-turbo

## Resumen

OrdinalICL for TabDPT-Turbo es una adaptacion del modelo fundacional tabular TabDPT-Turbo (Layer6/TabDPT) que anade una interfaz de objetivo ordinal para clasificacion y regresion sobre escalas ordenadas (valoraciones, etapas, respuestas de encuestas). Lo desarrolla Gautier Marti (usuario `gmarti` en HuggingFace) y acompana al articulo *OrdinalICL: Making Tabular Foundation Models Ordinal-Native*. El problema que resuelve es concreto: un clasificador ordinario trata etiquetas como `low`, `medium` y `high` como nombres sin relacion, mientras que OrdinalICL conoce su orden declarado y devuelve una probabilidad coherente para cada nivel de la escala.

El backbone TabDPT-Turbo de 63,5 millones de parametros permanece sin cambios; el repositorio anade una ruta nominal compartida de 424.129 parametros y tres modulos de correccion ordinal de 424.129 parametros cada uno, entrenados de forma independiente y liberados como ensemble de tres semillas. En total, los parametros anadidos suman aproximadamente 1,7 millones, lo que situa el conjunto en torno a 65,2 millones de parametros. El modelo funciona por aprendizaje en contexto (in-context learning): `fit` almacena los ejemplos etiquetados y no optimiza parametros.

Es relevante ahora porque los modelos fundacionales tabulares se han consolidado como alternativa a los metodos de gradient boosting en tablas pequenas, pero ninguno de ellos trataba el orden de las etiquetas como una propiedad nativa del problema. El contrato de entrada exige entre 1 y 12 columnas numericas finitas y entre 3 y 10 niveles unicos y ordenados; los experimentos reportados usan 32 filas de contexto etiquetadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atencion en contexto para datos tabulares (backbone TabDPT-Turbo 1.2) mas ruta nominal compartida y modulos de correccion ordinal |
| Parametros totales | 65.196.516 aproximadamente (63,5 M del backbone + 424.129 de la ruta nominal + 3 x 424.129 de los modulos ordinales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 filas de contexto etiquetadas en los experimentos reportados; el comportamiento con otros tamanos de contexto no esta caracterizado. Hasta 12 columnas de entrada |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | No disponible. Modelo tabular numerico; las etiquetas pueden ser cadenas en cualquier idioma |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`weights/common_nominal.safetensors`, `weights/ordinal_residual_seed_*.safetensors`), mas `config.json` y `MANIFEST.json` con hashes |

## Arquitectura y entrenamiento

El modelo conserva el backbone TabDPT-Turbo 1.2 congelado (63,5 M de parametros), que resuelve tareas tabulares por aprendizaje en contexto: el modelo recibe un conjunto de filas etiquetadas como contexto y predice las filas de consulta sin actualizar pesos. Sobre ese backbone, OrdinalICL incorpora dos piezas nuevas: una ruta nominal compartida de 424.129 parametros y tres modulos de correccion ordinal de 424.129 parametros cada uno, entrenados con semillas independientes. El modulo de correccion usa coordenadas de rango y decisiones de frontera ordenadas, genera una distribucion de clases coherente y promedia las predicciones en ambas orientaciones de la escala para lograr simetria exacta ante la inversion del orden.

En cuanto a los datos, la ruta nominal y cada modulo ordinal vieron 128.000 tablas sinteticas ordenadas. El entrenamiento vario el numero de niveles declarados entre 3 y 10, el numero de caracteristicas entre 1 y 12, y cubrio mecanismos ordenados, desbalanceo, ruido, rangos ausentes en el contexto y cambios de distribucion. Cada tabla tenia 32 filas de contexto. El backbone TabDPT-Turbo permanecio fijo y no se uso ninguna fila de Yelp, ESS ni de otros benchmarks reales para entrenar los parametros liberados. El repositorio empaqueta el ensemble primario sobre la version 1.2 porque tiene la media ligeramente inferior en el benchmark real; el articulo incluye ademas una replicacion cruzada sobre TabDPT-Turbo v1.3, que usa una API upstream distinta y se conserva en el material de reproducibilidad.

## Capacidades

- Clasificacion ordinal: predice etiquetas ordenadas con distribucion de probabilidad coherente sobre todos los niveles declarados.
- Regresion ordinal: expone `predict_expected_rank`, que devuelve el rango esperado de cada fila de consulta.
- Simetria ante inversion del orden: promedia predicciones en ambas orientaciones de la escala.
- Aprendizaje en contexto: `fit` almacena ejemplos etiquetados sin optimizar parametros; el ajuste es inmediato.
- Manejo de niveles ausentes en el contexto: un nivel puede no aparecer en el contexto y seguir declarado en `classes` (vease `examples/missing_level.py`).
- Robustez entrenada frente a desbalanceo, ruido, cambios de distribucion y rangos de contexto ausentes.
- Entrada tabular mixta numerica: de 1 a 12 columnas por fila.
- Inferencia en CPU y en CUDA (CUDA sustancialmente mas rapida).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; no es un modelo de lenguaje.

## Casos de uso

- Encuestas con escala Likert: convertir respuestas ordinales (`muy en desacuerdo` a `muy de acuerdo`) en probabilidades por nivel, aprovechando que el modelo conoce el orden y no trata los niveles como categorias independientes.
- Scoring de riesgo crediticio por tramos: asignar clientes a bandas ordenadas de riesgo manteniendo el orden entre bandas, con la distribucion completa de probabilidad por banda para calibrar umbrales de decision.
- Triaje clinico por gravedad: clasificar pacientes en etapas ordenadas a partir de un conjunto pequeno de variables tabulares, donde la penalizacion por errores lejanos en la escala importa mas que la exactitud bruta.
- Sistemas de recomendacion con valoraciones: predecir la valoracion (1 a 5 estrellas) de un usuario sobre un item a partir de un contexto reducido de valoraciones previas.
- Investigacion academica sobre metodos ordinales: el repositorio incluye el ensemble de tres semillas y el benchmark de 40 familias, lo que permite reproducir comparaciones nRPS contra la adaptacion nominal emparejada y contra TabDPT-Turbo original.
- Monitorizacion industrial por niveles de severidad: clasificar lecturas de sensores en niveles ordenados (normal, aviso, alerta, critico) usando las columnas numericas del proceso.
- Clasificacion de estatus socioeconomico o educativo en ciencias sociales: modelos con desenlace ordinal de 3 a 10 niveles sobre tablas pequenas, donde el coste de un error depende de la distancia en la escala.
- Baselines rapidos en pipelines de ciencia de datos: al no requerir entrenamiento, sirve como referencia inmediata en validacion cruzada sobre tablas con menos de 12 caracteristicas y 32 filas etiquetadas.

## Benchmarks y rendimiento

Metrica: normalized ranked probability score (nRPS), donde menor es mejor. Dentro de cada experimento emparejado, los modulos ordinal y nominal comparten backbone, numero de parametros, tablas de entrenamiento, inicializacion, optimizador, planificacion y computo.

| Evaluacion | Ordinal menos nominal emparejado (nRPS) | Intervalo 95% |
|---|---:|---:|
| Confirmacion sintetica, 3 semillas x 64k tablas | -0,000454 | [-0,000624, -0,000293] |
| Replicacion sintetica, 2 semillas nuevas x 128k tablas | -0,000575 | [-0,000736, -0,000418] |
| Benchmark real unificado de 40 familias, modelo final de 3 semillas | -0,000165 | [-0,000300, -0,000028] |

nRPS medio sobre las 40 familias reales: 0,146894 para OrdinalICL, 0,147059 para la adaptacion nominal emparejada y 0,148968 para TabDPT-Turbo publicado. El intervalo a nivel de familia para OrdinalICL menos TabDPT publicado es [-0,003376, -0,000974]. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 261 MB en fp32 para los 65,2 M de parametros, y unos 130 MB en fp16/bf16. El contexto tabular (32 filas x hasta 12 columnas) es despreciable en memoria frente a los pesos.
- GPU recomendadas: cualquier GPU con CUDA, incluidas las de gama de entrada. El autor indica que CUDA es sustancialmente mas rapido que CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual, e incluso en CPU con Python 3.10 o superior.
- Opciones de despliegue: cliente Python empaquetado `ordinalicl_tabdpt` (version 0.1.0), instalable desde el wheel del repositorio o desde el codigo fuente; dependencia fijada `tabdpt==1.2.0`. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nRPS medio (40 familias reales) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| OrdinalICL for TabDPT-Turbo (este modelo) | ~65,2 M (63,5 M backbone + ~1,7 M anadidos) | 32 filas de contexto en los experimentos | 0,146894 | CC-BY-4.0 | HuggingFace, ensemble de 3 semillas |
| Adaptacion nominal emparejada | ~65,2 M (mismo backbone y misma ruta nominal) | 32 filas de contexto | 0,147059 | No disponible | Reportada en el articulo, no como repositorio independiente |
| Layer6/TabDPT-Turbo (modelo base) | 63,5 M | No disponible | 0,148968 | No disponible | HuggingFace (Layer6/TabDPT) |
| Otros modelos fundacionales tabulares (por ejemplo variantes de TabPFN o TabICL) | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia entre las tres primeras filas es pequena en terminos absolutos: la ventaja de OrdinalICL sobre TabDPT-Turbo publicado es de aproximadamente 0,002 en nRPS. El articulo incluye una encuesta de modelos y el analisis estadistico completo en el material suplementario.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta un analisis de sesgos por subgrupo, dominio o variables sensibles.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de calibracion incorrecta, es decir, probabilidades mal calibradas cuando la tabla de consulta se aleja de la distribucion de entrenamiento. Se entreno explicitamente con cambios de distribucion, pero no hay garantias fuera de ese rango.
- Limitaciones de contexto: el modelo usa in-context learning y el comportamiento con tamanos de contexto distintos de 32 filas no esta caracterizado. Este es un caveat explicito del autor.
- Limitaciones de entrada: `X` debe contener valores numericos finitos y entre 1 y 12 columnas. `classes` debe declarar entre 3 y 10 niveles unicos, de menor a mayor, y toda etiqueta del contexto debe existir en `classes`.
- Efectos de magnitude reducida: las mejoras de nRPS frente a las alternativas emparejadas son del orden de 10^-4 a 10^-3. En produccion conviene validar si esa diferencia justifica la complejidad adicional.
- Licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya correctamente la autoria y se indiquen los cambios. No incluye garantias.
- Dependencia fijada: el paquete exige `tabdpt==1.2.0`, exactamente el backbone publicado usado por el modelo primario. Actualizar esa dependencia puede romper la compatibilidad.
- Requisito de version: Python 3.10 o superior.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y sin espejo oficial en otros formatos (no hay GGUF, ONNX ni pesos cuantizados).
- No es un modelo de lenguaje: no admite generacion de texto, dialogo, codigo ni razonamiento multi-paso. Su uso esta acotado a tablas pequenas con objetivo ordinal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gmarti/ordinalicl-tabdpt-turbo
- Modelo base: https://huggingface.co/Layer6/TabDPT
- Instalacion directa del cliente: https://huggingface.co/gmarti/ordinalicl-tabdpt-turbo/resolve/main/ordinalicl_tabdpt-0.1.0-py3-none-any.whl
- Repositorio del cliente (clonado desde HuggingFace): https://huggingface.co/gmarti/ordinalicl-tabdpt-turbo
- Articulo de referencia: *OrdinalICL: Making Tabular Foundation Models Ordinal-Native*, de Gautier Marti (sin URL publica en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al articulo ni al autor. Las busquedas devuelven exclusivamente paginas no relacionadas (componentes industriales y listados inmobiliarios) que comparten la cadena numerica "339696" con un identificador presente en la model card.
