# Jundot/d3-oQ4e

## Resumen

d3-oQ4e es una cuantización de precisión mixta en formato MLX del modelo vllm-sr/d3, un modelo de decisión multimodal de 27B desarrollado en el marco de Decision 3.0 dentro de vLLM Semantic Router. A diferencia de un modelo generativo convencional, d3 no produce texto: recibe entradas de texto o JSON con imágenes y vídeos opcionales y devuelve una probabilidad para cada opción de preguntas de elección, de sí/no y de puntuación. Está construido sobre el backbone de Qwen/Qwen3.8-27B e incorpora un encoder de visión y un módulo de lectura de código (`readout`) en FP32 que se copian sin modificar del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un checkpoint cuantizado con una técnica poco habitual (oQ de oMLX, con asignación de bits por sensibilidad de capa y redondeo con matriz de importancia), que reduce el modelo a unos 15,3 GiB de almacenamiento manteniendo una media efectiva de 5,027 bits por peso. Por otro, ilustra un patrón de despliegue emergente: modelos de decisión servidos mediante una API específica (`POST /v1/systemone`) en lugar de la API de chat completions.

El checkpoint se actualizó el 19 de noviembre de 2026 con un redondeo oQe refinado en oMLX 0.8.0, que reduce el error de cuantización al mismo tamaño y velocidad. El soporte de Decision 3.0 en oMLX es posterior a la versión v0.7.1.dev1, por lo que se requiere una versión reciente del servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de Qwen/Qwen3.8-27B) con encoder de visión y módulo de lectura de código; modelo de decisión, no generativo |
| Parametros totales | 26.085.330.160 (26,087B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ4e: affine 4-bit grupo 64 (17,412B), affine 5-bit grupo 64 (8,031B), affine 6-bit grupo 64 (0,178B), BF16 (0,463B), FP32 (0,001B); media efectiva 5,027 bits/peso en el checkpoint completo y 4,829 bits/peso en el backbone |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (hereda la del modelo base vllm-sr/d3) |
| Formato de pesos | safetensors en formato MLX; incluye `readout.safetensors` en FP32 y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3 es un modelo de decisión multimodal de 27B construido sobre Qwen/Qwen3.8-27B. Su arquitectura combina tres componentes: un backbone de lenguaje (25,625B de pesos lógicos), un encoder de visión (0,461B) y un módulo de lectura de código (0,001B, almacenado en FP32). La salida no es texto generado sino una distribución de probabilidad sobre las opciones de una pregunta de elección, de sí/no o de puntuación, lo que lo sitúa en la categoría de zero-shot classification según el pipeline declarado.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí está documentado es el proceso de cuantización de este checkpoint: oQ asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia construida con 128 muestras de 512 tokens y aplica un reajuste de escala y sesgo por mínimos cuadrados ponderados. La versión 0.8.0 de oMLX incorpora el redondeo oQe refinado (PRs #4930 y #5292 del repositorio omlx) que reduce el error de cuantización sin cambiar tamaño ni velocidad.

## Capacidades

- Clasificación zero-shot: devuelve una probabilidad por cada opción de preguntas de elección múltiple, de sí/no y de puntuación, sin generar texto.
- Entrada multimodal: acepta texto o JSON con imágenes y vídeos opcionales.
- Decisión sobre JSON estructurado: pensado para enrutado y clasificación dentro de pipelines (por ejemplo, Semantic Router).
- Integración con el ecosistema MLX: ejecutable en Apple Silicon mediante la librería mlx.
- Servicio mediante endpoint dedicado `POST /v1/systemone` en oMLX.
- No dispone de tool calling, modo thinking ni generación de texto, al no ser un modelo generativo.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Enrutado semántico de peticiones: el modelo evalúa un prompt o un JSON y devuelve la probabilidad de cada ruta candidata, lo que permite decidir a qué modelo o servicio derivar la consulta dentro de un router como vLLM Semantic Router, sin coste de generación de texto.
- Clasificación de contenido con imágenes: al aceptar imágenes y vídeos junto al texto, puede puntuar la probabilidad de que un contenido visual pertenezca a una categoría (por ejemplo, moderación o etiquetado) devolviendo directamente la probabilidad por opción.
- Filtrado y triaje en pipelines de datos: dado un lote de documentos en JSON, el modelo asigna probabilidades a preguntas de sí/no (relevante/no relevante, válido/inválido) y permite umbralizar sin invocar un modelo generativo.
- Evaluación automática de respuestas: con preguntas de puntuación, puede asignar probabilidades a niveles de calidad de una respuesta o de un par pregunta-respuesta, útil en sistemas de evaluación automática.
- Despliegue local en Apple Silicon: gracias a la cuantización MLX de ~15,3 GiB, puede ejecutarse en equipos con memoria unificada suficiente para prototipar clasificadores de decisión sin GPU dedicada.
- Sustitución de clasificadores ligeros en producción: al devolver probabilidades calibradas por opción en lugar de una etiqueta, facilita la incorporación de umbrales y lógica de abstención en sistemas existentes.
- Investigación sobre modelos de decisión: sirve como checkpoint de referencia para estudiar el comportamiento de arquitecturas de decisión multimodales frente a clasificadores discriminativos clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el checkpoint ocupa 16,393 GB (15,267 GiB) en disco; el repositorio completo pesa 32,8 GB.
- Memoria para inferencia: no se publica una cifra oficial de VRAM o memoria unificada necesaria. Como referencia, los pesos suman 15,267 GiB, a los que hay que añadir memoria para activaciones y el encoder de visión.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son equipos Apple Silicon con memoria unificada; no se documenta soporte para CUDA ni GPU NVIDIA (A100, H100, RTX 4090) en esta ficha.
- GPU de consumo: no disponible; depende de la memoria unificada del Mac utilizado.
- Opciones de despliegue: oMLX (versión posterior a v0.7.1.dev1, con soporte de Decision 3.0) sirviendo `POST /v1/systemone`; la librería declarada es mlx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d3-oQ4e (este) | 26,087B lógicos | no disponible | MLX safetensors, 5,027 bits/peso efectivos | Apache-2.0 | Modelo de decisión multimodal cuantizado |
| vllm-sr/d3 (base) | no disponible (27B según la model card) | no disponible | safetensors originales | Apache-2.0 | Modelo de decisión sin cuantizar; referencia de calidad |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Backbone de lenguaje sobre el que se construye d3; modelo generativo, no de decisión |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; solo devuelve probabilidades sobre opciones predefinidas.
- El soporte de Decision 3.0 en oMLX es posterior a v0.7.1.dev1; con versiones anteriores el checkpoint no se sirve correctamente.
- La model card advierte de que se debe volver a descargar el modelo si se tenía una copia anterior al 19 de noviembre de 2026, ya que el redondeo oQe cambió.
- La cuantización introduce error respecto al modelo base; no se publican métricas de degradación de precisión en clasificación.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática del modelo.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base vllm-sr/d3.
- El formato MLX limita el despliegue a entornos Apple Silicon con oMLX; no se documentan alternativas como vLLM, llama.cpp o TGI para este checkpoint.
- No se dispone de información sobre longitud de contexto, latencia ni throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/d3-oQ4e
- Modelo base: https://huggingface.co/vllm-sr/d3
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de redondeo oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- PR de soporte de Decision 3.0: https://github.com/jundot/omlx/pull/4470
