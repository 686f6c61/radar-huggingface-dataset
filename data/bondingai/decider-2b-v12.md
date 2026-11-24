# BondingAI/decider-2b-v12

## Resumen

decider-2b-v12 es un modelo de decisión tipada desarrollado por Mapika (este repositorio es un espejo de BondingAI) que no genera texto libre, sino que lee un estado y una o varias preguntas con listas de opciones explícitas, y devuelve una distribución de probabilidad sobre las opciones para cada pregunta en un único forward pass. Está construido sobre la arquitectura Qwen3.5-2B-Base, con 1.881.825.088 parámetros en precisión bf16 y un peso total de aproximadamente 3,8 GB para el modelo de texto, más 0,6 GB para la torre de visión.

El modelo está pensado para ser invocado desde software, no para conversación: su interfaz es una API `POST /v1/systemone` con formato TypeSafe, y su caso de uso central es el enrutamiento, la clasificación y la emisión de juicios calibrados. La versión v12 añade soporte de imágenes (hasta 4 por petición) reutilizando los pesos del modelo de texto y la torre de visión de Qwen3.5-2B-Base, e introduce una mejora sustancial en el Decision Index (de 28,05 a 38,17 sobre una muestra de 4.500 peticiones).

La relevancia actual del modelo reside en su enfoque "system-one": sustituye la generación autoregresiva por una lectura única y calibrada de probabilidades, lo que reduce latencia y coste frente a modelos generativos del mismo tamaño para tareas de decisión estructurada. La licencia es Apache-2.0 y el modelo está disponible en Hugging Face con pesos safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-2B-Base (modelo de texto) + torre de visión de Qwen3.5-2B-Base (imágenes) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16; existen builds GGUF mencionados en la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo de texto en la raíz, bf16, ~3,8 GB; visión en `vision/`, ~0,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso, y se entrena en dos fases. La v12 arranca desde la v11: sus pesos de texto se colocan en el modelo imagen-texto de Qwen3.5-2B-Base (con la torre de visión del base), de modo que los pesos del modelo de lenguaje son idénticos a los del modelo de texto. Después se aplica una etapa LoRA con rango 64, tasa de aprendizaje 1e-4 y 2 épocas, que se completó en 56 minutos sobre una única GPU B300. La mezcla de entrenamiento de texto proviene de la mezcla de decider-31b e incluye los splits de entrenamiento de benchmarks que también evalúa el Decision Index.

La innovación central es el readout: en lugar de generar tokens, el modelo produce una distribución de probabilidad sobre opciones tipadas en un solo forward pass. Las preguntas pueden ser de tipo elección (`choice`), sí/no (`noul`) o puntuación (`score`), y el modelo aplica temperaturas ajustadas por tipo (`choice`: 2,465; `noul`: 3,185; `score`: 2,833) para calibrar las probabilidades. En v12, la configuración usa temperatura 0,05 para las respuestas sí/no, lo que las lleva cerca de 0 o 1 (mejora la exactitud en JevBench a costa de perder calibración: ECE 0,341 frente a 0,095 con la temperatura ajustada). Para imágenes, el modelo reutiliza los pesos de texto y antepone la imagen al prompt, tal como se hizo en entrenamiento; las filas de imagen se leen de una en una, sin batching ni CUDA graphs.

## Capacidades

- Clasificación y enrutamiento multi-etiqueta: devuelve distribuciones de probabilidad sobre listas de opciones explícitas para una o varias preguntas simultáneas.
- Juicios calibrados: probabilidades ajustadas por tipo de pregunta (elección, sí/no, puntuación), con la posibilidad de recuperar la calibración original mediante temperaturas por tipo.
- Preguntas de sí/no con criterios: permite definir criterios `true`/`false` en lenguaje natural para cada juicio.
- Procesamiento de imágenes: hasta 4 imágenes por petición en PNG y JPEG, referenciadas desde el estado mediante claves; útil para gráficos, capturas y documentos visuales.
- Salida estructurada: interfaz `POST /v1/systemone` en formato TypeSafe, pensada para integración programática.
- Multitarea en un solo paso: varias preguntas tipadas resueltas en un único forward pass.
- Sin generación de texto libre: no es un modelo conversacional ni de generación abierta.
- No soporta referencias a imágenes dentro del texto de la pregunta ni respuestas con cajas delimitadoras.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a facturación, soporte técnico o ventas, además de un juicio sí/no sobre si requiere acción de reembolso, todo en una sola llamada.
- Moderación y clasificación de contenido: clasificación multi-etiqueta de mensajes o publicaciones con opciones explícitas y probabilidades calibradas, adecuada para umbrales configurables en producción.
- Extracción de decisiones en pipelines de agentes: el modelo actúa como "system-one" para decidir el siguiente paso de un agente (herramienta a invocar, si escalar, si continuar) sin coste de generación autoregresiva.
- Análisis de gráficos e informes: con soporte de imágenes, puede responder preguntas sí/no sobre un gráfico (por ejemplo, si alguna región cayó más de un 10 %) usando el estado y los criterios definidos.
- Triaje en atención al cliente: clasificación de conversaciones multi-turno por departamento y urgencia, con probabilidades que permiten derivar a revisión humana cuando la confianza es baja.
- Control de calidad y validación: juicios tipados sobre pares de entradas (por ejemplo, si una respuesta cumple un criterio) para pipelines de evaluación automática.
- Enrutamiento de consultas en sistemas RAG: decidir qué índice o base de conocimiento consultar según la pregunta del usuario, con opciones explícitas y salida estructurada.

## Benchmarks y rendimiento

| Benchmark | v11 | v12 |
|---|---|---|
| Decision Index 0.3 (muestra de 4.500 peticiones) | 28,05 | 38,17 |
| Preguntas de imagen (media de 11 conjuntos) | 0,780 (v11 + torre de visión base) | 0,847 |
| Visual7W (nunca entrenado) | 0,863 | 0,863 |
| VSR (nunca entrenado) | 0,713 | 0,717 |
| JevBench, ítems públicos, nivel difícil | 0,577 | 0,595 |
| JevBench, ítems públicos, nivel estándar | 0,889 | 0,917 |
| Conjunto held-out sí/no (puntuado como JevBench) | −27,9 | 29,6 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación en la información disponible, ya que el modelo no está diseñado para generación de texto libre.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB para los pesos de texto en bf16, más 0,6 GB para la torre de visión si se usa la ruta de imágenes; el total ronda los 4,4 GB en bf16, con overhead adicional de activaciones.
- GPU recomendadas: el entrenamiento LoRA se realizó en una NVIDIA B300; para inferencia, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente en bf16, y menos si se usan builds GGUF cuantizados.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de datacenter (A100, H100).
- Opciones de despliegue: servidor `decider.serve` con uvicorn (interfaz `POST /v1/systemone`), librería `decider.infer.Decider` para uso programático, y builds GGUF mencionados en la model card. Requiere `torch`, `transformers>=5`, `flash-linear-attention` y `pillow` para imágenes.
- Latencia y throughput: no disponibles. La model card indica que las filas de imagen se leen de una en una, sin batching ni CUDA graphs, lo que limita el throughput en la ruta de visión.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Uso principal | Licencia |
|---|---|---|---|---|---|
| decider-2b v12 | Qwen3.5-2B-Base | 1,88 B | No disponible | El más rápido: enrutamiento, clasificación, juicios; texto e imágenes | Apache-2.0 |
| decider-4b v3 | Qwen3.5-4B-Base | No disponible | No disponible | Punto intermedio; texto e imágenes | No disponible |
| decider-12b v2 | Gemma-4-12B-it | No disponible | No disponible | Modelo JevBench; texto | No disponible |
| decider-12b-vision | Gemma-4-12B-it | No disponible | No disponible | Mezcla de tareas del Decision Index e imágenes; sí/no calibrado | No disponible |
| decider-31b v2 | Gemma-4-31B-it, NVFP4 | No disponible | No disponible | El más potente; texto e imágenes; GPU Blackwell, vLLM | No disponible |
| decider-35b-a3b | Qwen3.5-35B-A3B-Base | No disponible | No disponible | Texto | No disponible |

Todos comparten la misma interfaz (`POST /v1/systemone`) y el mismo readout. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, salvo las mejoras v11→v12 del propio decider-2b.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo: no puede producir texto libre ni mantener conversaciones; su salida es siempre una distribución sobre opciones predefinidas.
- Las probabilidades de sí/no en la configuración por defecto (temperatura 0,05) no están calibradas (ECE 0,341 frente a 0,095 con la temperatura ajustada); para calibración hay que usar `temperature_by_type={"choice": 2.465, "noul": 3.185, "score": 2.833}`.
- La ruta de imágenes no soporta referencias a imágenes dentro del texto de la pregunta ni respuestas con cajas delimitadoras, y limita a 4 imágenes por petición (`DECIDER_MAX_IMAGES`).
- Las filas de imagen se procesan de una en una, sin batching ni CUDA graphs, lo que puede limitar el throughput en cargas con muchas imágenes.
- Riesgo de sesgo y alucinación: no se han publicado análisis específicos de sesgos en la información disponible; al tratarse de un clasificador, el riesgo se manifiesta como probabilidades mal calibradas en dominios alejados de los datos de entrenamiento.
- El repositorio es un espejo de `Mapika/decider-2b`; no se deben subir nuevos pesos a él, y la fijación por commit requiere pasar la ruta del snapshot a `Decider` o `decider.serve`, ya que no aceptan `revision=`.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento y las licencias de los modelos base (Qwen3.5-2B-Base) para producción.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/BondingAI/decider-2b-v12
- Repositorio original: https://huggingface.co/Mapika/decider-2b
- Código y changelog: https://github.com/Mapika/decider
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-12b: https://huggingface.co/Mapika/decider-12b
- decider-12b-vision: https://huggingface.co/Mapika/decider-12b-vision
- decider-31b: https://huggingface.co/Mapika/decider-31b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
