# jwcwn/zl-mini-body-3

## Resumen

decider-4b (publicado en el repositorio `jwcwn/zl-mini-body-3`) es un modelo derivado de Qwen3.5-4B-Base que no genera texto libre: lee un estado y una o varias preguntas tipadas con listas explícitas de opciones, y devuelve en un único forward pass una distribución de probabilidad sobre las opciones de cada pregunta. Está pensado para ser invocado desde software, no para conversación, y a partir de la versión v3 admite también imágenes en el estado.

Con 4.539.265.536 parámetros (4B densos, bf16, ~8,4 GB de pesos), se posiciona como el punto intermedio de la familia decider, entre decider-2b y los modelos de 12B, 31B y 35B-A3B. Su relevancia actual radica en que ofrece decisiones estructuradas con probabilidades calibradas en una sola pasada, lo que lo hace adecuado para enrutamiento, clasificación y juicios automatizados dentro de pipelines de producción, con soporte multimodal añadido en la v3.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El autor reporta mejoras sustanciales frente a v2.1 en el Decision Index (de 41,55 a 51,02 sobre una muestra de 4.500 peticiones) y en preguntas sobre imágenes (de 0,840 a 0,891 de media en 11 conjuntos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B-Base (transformer denso) con torre de visión de Qwen3.5-4B-Base; readout de decisión propio |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; existen builds GGUF según la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (texto en la raíz del repo, bf16, ~8,4 GB; `vision/` con torre visual de ~0,6 GB); builds GGUF mencionados |
| Tamaño del repositorio | 9,1 GB |
| Pipeline declarado | text-classification |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Entrada multimodal | hasta 4 imágenes (PNG, JPEG; `DECIDER_MAX_IMAGES`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso de 4B parámetros. La v3 se construye a partir de v2.1: los pesos de texto se insertan en el modelo imagen-texto de Qwen3.5-4B-Base (con la torre de visión del base, sin cambios), de modo que los pesos del modelo de lenguaje son idénticos a los del modelo de texto. Sobre esa base se aplica una etapa LoRA de rango 64, learning rate 1e-4, 2 épocas y 110 minutos en una sola B300, aplicada únicamente al modelo de lenguaje. El readout devuelve distribuciones sobre opciones en lugar de tokens de texto.

Los datos de entrenamiento de texto suman 39,5k filas: la mezcla de entrenamiento de decider-31b (splits de train de CLINC150, iSarcasmEval, VAST, ACOS, POP909-CL, GSM8K y NLI4CT, decontaminados contra todas las filas de los suites del Decision Index 0.3), peticiones generadas de domótica, decisiones generadas de seguimiento de estado y familias de decisión, preguntas documentales escritas por Qwen3.6-27B y filas públicas etiquetadas, más 6,7k filas replicadas de los datos de entrenamiento de v2.1. Para imágenes se usan 18.129 filas de los splits de train de siete subconjuntos de the_cauldron: AI2D, A-OKVQA, Hateful Memes, IconQA, RAVEN, ScienceQA y TQA; Visual7W y VSR no se usaron. La model card indica que no se usaron ciertos datos adicionales, pero el texto disponible se corta en ese punto.

Un detalle técnico destacable es la configuración de temperatura por tipo de pregunta: para respuestas sí/no (tipo `noul`) se usa temperatura 0,05, lo que lleva las probabilidades cerca de 0 o 1 y mejora la puntuación en JevBench (que cuenta como errónea cualquier probabilidad entre 0,2 y 0,8), a costa de perder calibración (ECE 0,265 frente a 0,102). Para probabilidades calibradas se ofrecen los valores ajustados `{"choice": 2.098, "noul": 2.795, "score": 3.152}`.

## Capacidades

- Decisiones tipadas con distribución de probabilidad sobre opciones explícitas en un solo forward pass.
- Preguntas de tipo elección (`choice`), sí/no (`noul`) y puntuación (`score`).
- Procesamiento de estado que puede incluir imágenes (hasta 4 por petición, PNG y JPEG).
- Soporte de preguntas sobre gráficos, diagramas, memes, ilustraciones científicas y documentos visuales.
- Clasificación de texto multi-tarea (el pipeline declarado es text-classification).
- Salida estructurada y calibrada, pensada para consumo programático.
- Interfaz HTTP unificada (`POST /v1/systemone` en formato TypeSafe) compartida con el resto de la familia decider.
- No soporta referencias a imágenes dentro del texto de la pregunta ni respuestas en formato de caja (box answers).
- No es un modelo conversacional: no genera texto libre.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve la probabilidad de cada departamento (facturación, soporte técnico, ventas), integrándose en un sistema de triaje que ordena por probabilidad.
- Moderación y clasificación de contenido: preguntas de elección múltiple sobre categorías de riesgo o políticas, con distribución de probabilidad para fijar umbrales de revisión humana.
- Análisis de gráficos en informes: con la entrada de imágenes, se le pasa un gráfico y una nota de criterio ("escalar si alguna región cae más del 10%") y devuelve una decisión sí/no con probabilidad.
- Automatización de domótica: peticiones generadas de smart-home se traducen en decisiones estructuradas sobre acciones a ejecutar.
- Evaluación documental: preguntas sobre documentos con criterios explícitos, útil para verificación de requisitos o comprobación de condiciones contractuales.
- Control de calidad en pipelines de datos: juicios de puntuación (`score`) sobre pares o muestras para filtrar o priorizar revisiones.
- Seguimiento de estado en agentes: decisiones de seguimiento de estado y familias de decisión para seleccionar la siguiente acción en un flujo multi-paso.
- Análisis de memes e ilustraciones: subconjuntos como Hateful Memes e IconQA en el entrenamiento permiten clasificar imágenes con texto o iconos.

## Benchmarks y rendimiento

| Benchmark | v2.1 | v3 |
|---|---|---|
| Decision Index 0.3 (muestra de 4.500 peticiones) | 41,55 | 51,02 |
| Preguntas sobre imágenes (media de 11 conjuntos) | 0,840 | 0,891 |
| Visual7W (no entrenado) | 0,857 | 0,873 |
| VSR (no entrenado) | 0,813 | 0,833 |
| JevBench, ítems públicos, tier difícil | 0,649 | 0,640 |
| JevBench, ítems públicos, tier estándar | 0,986 | 0,986 |
| Conjunto held-out sí/no (puntuado al estilo JevBench) | −1,9 | 44,3 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar de lenguaje.

## Requisitos de hardware

- Pesos en bf16 de ~8,4 GB para el modelo de texto, más ~0,6 GB de la torre de visión; el repositorio completo ocupa 9,1 GB.
- VRAM estimada para inferencia en bf16: alrededor de 10-12 GB contando pesos y overhead de activaciones; no se especifica cifra oficial.
- GPU recomendadas: el entrenamiento se hizo en una B300; para inferencia se mencionan builds GGUF y despliegue con `decider.serve`, sin lista oficial de GPU.
- Cabe en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en bf16; en cuantizaciones GGUF cabría en GPUs de 8-12 GB, aunque no se detallan los niveles disponibles.
- Opciones de despliegue: `decider.infer.Decider` (Python), `decider.serve` con uvicorn (servidor HTTP), builds GGUF; requiere `torch`, `transformers>=5`, `flash-linear-attention` y `pillow` para imágenes.
- Las filas de imagen se procesan de una en una, sin batching ni CUDA graphs, lo que limita el throughput en cargas multimodales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| decider-4b v3 | Qwen3.5-4B-Base | 4B densos | no disponible | en | Apache 2.0 | Decisiones tipadas, texto e imágenes |
| decider-2b v12 | Qwen3.5-2B-Base | ~2B | no disponible | no disponible | no disponible | El más rápido: enrutamiento, clasificación, juicios; texto e imágenes |
| decider-12b v2 | Gemma-4-12B-it | ~12B | no disponible | no disponible | no disponible | Modelo JevBench; solo texto |
| decider-35b-a3b | Qwen3.5-35B-A3B-Base | 35B MoE (3B activos) | no disponible | no disponible | no disponible | Solo texto |

La comparación con modelos de propósito general de 4B (por ejemplo, el propio Qwen3.5-4B-Base) no está disponible en la información proporcionada, ya que decider-4b no genera texto y los benchmarks no son directamente comparables.

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte multilingüe.
- No es un modelo generativo: no puede usarse para chat, redacción ni generación de código.
- Las probabilidades sí/no en la configuración por defecto no están calibradas (ECE 0,265); para calibración hay que usar las temperaturas ajustadas por tipo.
- El rendimiento en el tier difícil de JevBench empeora ligeramente respecto a v2.1 (0,649 a 0,640).
- La mejora en imágenes se concentra en los tipos de pregunta visual entrenados; en Visual7W y VSR (no entrenados) la ganancia es menor.
- Procesamiento de imágenes sin batching ni CUDA graphs, lo que puede limitar el throughput en producción.
- No soporta referencias a imágenes dentro del texto de la pregunta ni respuestas en caja.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; al tratarse de un modelo de decisión, los errores se manifiestan como distribuciones mal calibradas o decisiones incorrectas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B-Base y de los datos de entrenamiento derivados de the_cauldron y otros conjuntos.
- La model card está truncada en la sección de datos no utilizados, por lo que la composición completa del entrenamiento no es verificable.

## Enlaces

- HuggingFace: https://huggingface.co/jwcwn/zl-mini-body-3
- Repositorio de código: https://github.com/Mapika/decider
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-12b: https://huggingface.co/Mapika/decider-12b
- decider-12b-vision: https://huggingface.co/Mapika/decider-12b-vision
- decider-31b: https://huggingface.co/Mapika/decider-31b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
