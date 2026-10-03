# RazvanManolache/raz-systemone-nli-xsmall-openjev

## Resumen

`raz-systemone-nli-xsmall-openjev` es un clasificador de inferencia de lenguaje natural (NLI) en formato cross-encoder, publicado por RazvanManolache como version v9 de la rama "xsmall" del sistema `raz-systemone`. Se construye sobre el backbone `cross-encoder/nli-deberta-v3-xsmall` (70.831.107 parametros, ~0,3 GB de repositorio) y su objetivo es puntuar pares premisa-hipotesis para determinar si una respuesta esta implicada por un contexto dado. El modelo esta pensado para funcionar como scorer `nli` dentro del pipeline `raz`, invocado mediante `--scorer nli --nli-model <dir>`.

Su rasgo diferencial es que combina dos distribuciones de datos: los pares de tickets de soporte propios del proyecto y el corpus Open-Jev, lo que lo convierte, segun el autor, en el unico modelo de la familia fluido en ambos dominios. Frente a su hermano `raz-systemone-nli-xsmall`, incorpora 267.000 pares de Open-Jev adicionales manteniendo la distribucion de tickets de soporte.

Es relevante por su perfil de despliegue: 71 millones de parametros, licencia MIT, ejecucion solo en CPU y artefacto de 283 MB. La fecha de creacion y actualizacion del repositorio es el 2 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta. No se han encontrado resultados de busqueda web relevantes sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder cross-encoder basado en DeBERTa-v3-xsmall (etiqueta del repo: `deberta-v2`, clase de configuracion DebertaV2 de HuggingFace) |
| Parametros totales | 70.831.107 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card lo describe como "bilingue" sin especificar los idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | label 0 = no implicacion, label 1 = entailment |
| Modelo base | cross-encoder/nli-deberta-v3-xsmall |
| Interfaz de carga | `AutoModelForSequenceClassification` |

## Arquitectura y entrenamiento

Se trata de un cross-encoder denso: la premisa y la hipotesis se concatenan en una unica secuencia de entrada y el encoder produce una representacion conjunta que se proyecta a una cabeza de clasificacion binaria de entailment. El backbone es DeBERTa-v3-xsmall, la variante pequena de la familia DeBERTa-v3, que emplea atencion desacoplada y un objetivo de preentrenamiento estilo ELECTRA con deteccion de tokens reemplazados; esa base ya viene afinada para NLI en `cross-encoder/nli-deberta-v3-xsmall`. La etiqueta `deberta-v2` del repositorio corresponde a la clase de configuracion que HuggingFace utiliza para esta familia.

El ajuste se realizo sobre tres fuentes combinadas: 725 pares de tickets propios del proyecto repetidos 8 veces (equivalente a unas 5.800 muestras efectivas), 267.000 pares del corpus Open-Jev y 200.000 pares de MNLI, durante 2 epocas. No se especifica en la informacion disponible la funcion de perdida exacta, el optimizador ni el esquema de calibracion, pese a que la etiqueta `calibration` aparece en el repositorio. Tampoco se documentan fases de RLHF o DPO, algo esperable en un modelo discriminativo de clasificacion. No se han publicado datos sobre decodificacion especulativa ni sobre optimizaciones de atencion.

## Capacidades

- Clasificacion de pares premisa-hipotesis con salida binaria de entailment (label 1) frente a no implicacion (label 0).
- Puntuacion de fidelidad de respuestas: verificar si una respuesta generada queda implicada por el contexto o documento de origen.
- Puntuacion de pares de tickets de soporte tecnico, dominio sobre el que se conserva la distribucion original del proyecto.
- Manejo de tareas de control sinteticas del corpus Open-Jev, que el autor describe como el dominio "bilingue" adicional del modelo.
- Integracion como scorer `nli` en el pipeline `raz` mediante el parametro `--nli-model`.
- Inferencia solo en CPU: no requiere GPU para funcionar.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es exclusivamente un clasificador.

## Casos de uso

- Verificacion de respuestas en atencion al cliente automatizada: dado un ticket y la respuesta propuesta por un LLM, el cross-encoder puntua si la respuesta esta implicada por el contexto recuperado, permitiendo descartar respuestas no fundamentadas antes de enviarlas al usuario.
- Deteccion de alucinaciones en pipelines RAG: cada fragmento generado se contrasta contra los documentos recuperados; un score bajo de entailment actua como senal de alarma y dispara regeneracion o escalado a un humano.
- Reranking de respuestas candidatas: cuando un generador produce varias respuestas, el modelo las ordena por grado de implicacion respecto al contexto, seleccionando la mas fiel sin necesidad de un LLM juez.
- Verificacion de fidelidad de resumenes: comparar el resumen generado con el documento original parrafo a parrafo para detectar contenido anadido o contradicciones.
- Deduplicacion y deteccion de contradicciones en bases de conocimiento: comparar pares de articulos o entradas de FAQ con entailment bidireccional para marcar duplicados o conflictos.
- Etiquetado automatico de tickets duplicados en mesas de ayuda: el modelo puntua pares de tickets y permite agrupar incidencias repetidas antes de que un agente las atienda.
- Control de calidad continuo en CI/CD: al pesar 283 MB y ejecutarse en CPU, puede integrarse en un runner de integracion continua que evalue cada nueva version del prompt o del modelo generador contra un conjunto de pares etiquetados.
- Trabajo sobre tareas de control sinteticas tipo Open-Jev: util como componente discriminativo en evaluaciones automatizadas de sistemas que siguen ese formato de tareas.

## Benchmarks y rendimiento

Resultados publicados en la model card (precision sobre juicios etiquetados):

| Conjunto de evaluacion | Juicios | Precision |
|---|---|---|
| holdout C | 60 | 0,883 |
| holdout D | 30 | 0,800 |
| holdout E | 30 | 0,900 |
| holdout F | 28 | 0,964 |
| holdout G | 29 | 0,862 |
| Open-Jev-900 | 900 | 0,846 |
| MNLI (disjunto) | 10.000 | 0,939 |

Referencias externas citadas en la propia model card para el conjunto Open-Jev-900: Qyvos de TypeSafe obtiene 0,831 y la API de Jev obtiene 0,811 en esa misma muestra. Los holdouts C a G son conjuntos muy pequenos (entre 28 y 60 filas), por lo que su varianza estadistica es alta y las diferencias entre ellos no deben interpretarse como mejoras robustas.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 283 MB en precision de 32 bits (dato declarado por el autor) y en torno a 142 MB en fp16 o bf16.
- VRAM estimada para inferencia: menos de 1 GB en fp16 contando activaciones y overhead con lotes moderados; del orden de 2 a 4 GB si se ejecuta en fp32 con lotes grandes.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 o superiores; tambien A100, H100 y L4, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien en CPU sin acelerador.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `text-embeddings-inference` (etiqueta presente en el repositorio) y endpoints compatibles con HuggingFace. No hay pesos GGUF publicados, por lo que no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponible. El autor solo indica que la inferencia es exclusivamente en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| raz-systemone-nli-xsmall-openjev | 70,8 M | no disponible | MIT | Cross-encoder NLI, tickets + Open-Jev + MNLI | HuggingFace, 0 descargas |
| raz-systemone-nli-xsmall | mismo backbone DeBERTa-v3-xsmall (segun la model card) | no disponible | no disponible | Cross-encoder NLI, tickets + MNLI | Referenciado en la model card del modelo analizado |
| cross-encoder/nli-deberta-v3-xsmall | mismo backbone DeBERTa-v3-xsmall | no disponible | no disponible | Cross-encoder NLI generico, base del ajuste | HuggingFace |

No se dispone de datos de rendimiento publicados para los dos modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad. No se han identificado modelos adicionales de la misma categoria con datos verificables en la busqueda realizada.

## Limitaciones y advertencias

- El eje de "tono de frustracion" es, segun el autor, el mas debil en sus etiquetas, lo que puede degradar el rendimiento en tickets con carga emocional marcada.
- La cobertura de Open-Jev procede de tareas de control sinteticas, no de tickets reales; el autor advierte explicitamente de que no representa el dominio de produccion.
- Los conjuntos holdout C a G contienen entre 28 y 60 juicios, por lo que las cifras de precision son muy sensibles al ruido muestral.
- Es un clasificador discriminativo, no un generador: no produce texto y no debe atribuirsele riesgo de alucinacion generativa, pero si de falsos positivos y falsos negativos en la decision de entailment.
- Modelo de dominio especifico (tickets de soporte y tareas de control Open-Jev); su comportamiento fuera de esos dominios no esta documentado.
- No se especifican los idiomas soportados ni la longitud maxima de secuencia, lo que limita la planificacion de despliegues multilingues o con entradas largas.
- El repositorio acumula 0 descargas y 0 likes, con fecha de creacion y ultima actualizacion identicas; carece de validacion independiente por parte de la comunidad.
- La licencia MIT permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base `cross-encoder/nli-deberta-v3-xsmall` y de los corpus de entrenamiento empleados (Open-Jev, MNLI).
- No se publican pesos cuantizados ni formatos GGUF, lo que restringe las opciones de despliegue en entornos sin Python o sin PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RazvanManolache/raz-systemone-nli-xsmall-openjev
- Repositorio del proyecto `raz-systemone`: https://github.com/RazvanManolache/raz-systemone
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los unicos resultados obtenidos no guardan relacion con el contenido tecnico de esta ficha.
