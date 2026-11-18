# Mapika/decider-2b

## Resumen

decider-2b es un modelo de decisión tipada desarrollado por Mapika, construido sobre la arquitectura de Qwen3.5-2B-Base. No es un modelo generativo en el sentido habitual: no produce texto libre, sino que recibe un estado (texto y, desde la versión v12, también imágenes) junto con una o varias preguntas tipadas, cada una con su lista explícita de opciones, y devuelve en una única pasada forward una distribución de probabilidad calibrada sobre las opciones de cada pregunta. Está pensado para ser invocado desde software, no para conversar.

El modelo se enmarca en la familia decider de Mapika, que incluye variantes de 4B, 12B, 31B y 35B-A3B con una interfaz común (`POST /v1/systemone`). La versión actual del repositorio es la v12 (20 de octubre de 2026), que añade soporte de imágenes mediante la torre visual de Qwen3.5-2B-Base y mejora el rendimiento en el Decision Index de 28,05 a 38,17 sobre una muestra de 4.500 peticiones.

Con 1.881.825.088 parámetros y licencia Apache 2.0, decider-2b se posiciona como la variante más rápida de la familia, orientada a enrutamiento, clasificación y juicios automatizados donde la latencia importa. La filosofía es "system-one": una sola pasada, sin cadena de pensamiento ni generación iterativa, lo que lo hace adecuado para integrarse en pipelines como componente de decisión de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-2B-Base) con torre visual para entrada de imágenes |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); builds GGUF disponibles según la model card |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo de texto en raíz, 3,8 GB bf16); torre visual en `vision/` (0,6 GB) |

## Arquitectura y entrenamiento

decider-2b parte de Qwen3.5-2B-Base, un transformer denso de aproximadamente 1,88 mil millones de parámetros. La innovación no está en la arquitectura base sino en la cabeza de decisión y el readout: el modelo recibe preguntas tipadas (`choice`, `noul`, `score`) con opciones explícitas y emite una distribución de probabilidad sobre ellas en una sola pasada forward, sin decodificación autoregresiva. Para imágenes, la v12 incorpora la torre visual de Qwen3.5-2B-Base sin modificar (0,6 GB) y reutiliza los pesos del modelo de texto para el camino imagen-texto; la imagen se coloca delante del prompt, como en entrenamiento.

El entrenamiento de la v12 parte de la v11. Los pesos de texto se insertaron en el modelo imagen-texto de Qwen3.5-2B-Base y después se aplicó una etapa LoRA (rango 64, learning rate 1e-4, 2 épocas, 56 minutos en una B300) solo sobre el modelo de lenguaje. Los datos de texto suman 39,5k filas de la mezcla de entrenamiento de decider-31b (splits de train de CLINC150, iSarcasmEval, VAST, ACOS, POP909-CL, GSM8K y NLI4CT, decontaminados contra las suites del Decision Index 0.3, más peticiones de domótica generadas, decisiones de seguimiento de estado, preguntas documentales de Qwen3.6-27B y filas públicas etiquetadas) más 6,7k filas replicadas de los datos de decider-4b v2.1. Los datos de imagen suman 18.129 filas de splits de train de siete subconjuntos de the_cauldron: AI2D, A-OKVQA, Hateful Memes, IconQA, RAVEN, ScienceQA y TQA. Visual7W y VSR se reservaron como evaluación (nunca vistos en entrenamiento).

Una decisión de calibración destacable: la v12 usa temperatura 0,05 para respuestas sí/no (`noul`), de modo que las probabilidades salen cerca de 0 o 1. Esto mejora la puntuación en JevBench (que cuenta como errónea una probabilidad sí/no entre 0,2 y 0,8) pero sacrifica calibración: ECE 0,341 en lugar de 0,095. Para probabilidades sí/no calibradas hay que usar `temperature_by_type={"choice": 2.465, "noul": 3.185, "score": 2.833}`.

## Capacidades

- Clasificación y enrutamiento tipado: devuelve distribuciones de probabilidad sobre listas de opciones explícitas para preguntas `choice`.
- Juicios booleanos (`noul`): respuestas sí/no con temperatura configurable (0,05 por defecto en v12, o calibrada).
- Puntuación (`score`): preguntas con escala de puntuación tipada.
- Decisión multi-pregunta en una sola pasada: varias preguntas sobre el mismo estado se resuelven en un único forward.
- Entrada de imágenes (v12): hasta 4 imágenes por petición (`DECIDER_MAX_IMAGES`), en PNG y JPEG, referenciadas por clave desde el estado.
- Salida estructurada y calibrada: probabilidades por opción, aptas para consumo programático.
- Multilingüe: no disponible; la model card declara únicamente inglés (`en`).
- Tool calling / function calling: no disponible como capacidad declarada; el modelo se invoca vía API propia (`/v1/systemone`), no como generador de llamadas.
- Agentes multi-paso: no disponible; el diseño es explícitamente "system-one", de una sola pasada sin razonamiento iterativo.
- Modo thinking: no; el modelo no genera texto.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una queja entrante en departamentos (facturación, soporte técnico, ventas) con una pregunta `choice` y obtener la distribución de probabilidad para decidir asignación o escalado automático; la latencia de una sola pasada lo hace viable en línea.
- Moderación de contenido en imágenes: usar la entrada visual para preguntas tipadas sobre memes o capturas (por ejemplo, Hateful Memes está en su mezcla de entrenamiento) y obtener un juicio sí/no o una categoría con probabilidad asociada.
- Triaje documental: responder preguntas `noul` sobre documentos y estados estructurados (el entrenamiento incluye NLI4CT y preguntas documentales) para decidir si un caso requiere revisión humana.
- Control de domótica: interpretar peticiones de smart home generadas durante el entrenamiento y decidir acciones tipadas sobre el estado del hogar.
- Evaluación de gráficos en informes: con la ruta de imagen, preguntar si un gráfico de resultados trimestrales exige escalado según un criterio textual, como en el ejemplo de la model card.
- Clasificación de sentimiento e ironía: las mezclas incluyen iSarcasmEval y VAST, lo que permite usarlo como clasificador de sarcasmo o sentimiento con salida probabilística calibrada.
- Filtro previo en pipelines generativos: como componente de decisión barato (2B, bf16, 3,8 GB) que enruta o descarta casos antes de invocar un modelo generativo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

| Benchmark | v11 | v12 |
|---|---|---|
| Decision Index 0.3 (muestra de 4.500 peticiones) | 28,05 | 38,17 |
| Preguntas de imagen (media de 11 conjuntos) | 0,780 | 0,847 |
| Visual7W (no entrenado) | 0,863 | 0,863 |
| VSR (no entrenado) | 0,713 | 0,717 |
| JevBench, ítems públicos, tier difícil | 0,577 | 0,595 |
| JevBench, ítems públicos, tier estándar | 0,889 | 0,917 |
| Conjunto held-out sí/no (puntuado como JevBench) | −27,9 | 29,6 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para este modelo; los datos anteriores son los únicos benchmarks reportados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de texto en bf16 ocupan 3,8 GB; la torre visual añade 0,6 GB. Con overhead de activaciones y runtime, se puede asumir un rango aproximado de 6-10 GB en bf16 para texto, y algo más con imágenes (estimación, no dato publicado).
- GPU recomendadas: no hay recomendaciones explícitas en la model card. El entrenamiento LoRA se hizo en una B300. Por tamaño, cabe en GPUs consumer modernas (RTX 4090 de 24 GB, RTX 3090 de 24 GB) y en GPUs de datacenter (A100, H100).
- Cabe en consumer GPU: sí, por tamaño de pesos (3,8 GB bf16 + 0,6 GB visión); una GPU de 8-12 GB debería bastar para texto en bf16, aunque no se publica cifra oficial.
- Opciones de despliegue: `decider.infer.Decider` (Python), servidor `decider.serve` con endpoint `POST /v1/systemone`, y builds GGUF mencionados en la model card. Requiere `torch`, `transformers>=5` y `flash-linear-attention`; para imágenes, `pillow` y decider-ai 1.10.0 (el texto funciona desde 1.4.0).
- Latencia y throughput: no disponibles como cifras publicadas. La model card indica que las filas de imagen se leen de una en una, sin batching ni CUDA graphs, lo que limita el throughput en el camino visual.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| decider-2b v12 | Qwen3.5-2B-Base | 1,88B | no disponible | en | Apache 2.0 | Decisión tipada, texto e imagen |
| decider-4b v3 | Qwen3.5-4B-Base | no disponible | no disponible | no disponible | no disponible | Punto medio, texto e imagen |
| decider-12b v2 | Gemma-4-12B-it | no disponible | no disponible | no disponible | no disponible | Modelo JevBench, texto |
| decider-31b v2 | Gemma-4-31B-it, NVFP4 | no disponible | no disponible | no disponible | no disponible | El más potente, texto e imagen, vLLM en Blackwell |

La comparación relevante es dentro de la propia familia decider: decider-2b es la variante más rápida y ligera, decider-4b el punto medio, decider-12b el modelo de referencia para JevBench y decider-31b el de mayor capacidad. No se dispone de datos de benchmarks cruzados entre estas variantes en la información proporcionada, salvo que la mezcla de entrenamiento de decider-31b se reutilizó para la v12 de decider-2b.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo emite distribuciones sobre opciones predefinidas.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Calibración sacrificada en sí/no: con la temperatura por defecto de 0,05, las probabilidades sí/no no están calibradas (ECE 0,341 frente a 0,095 con la temperatura ajustada). Para uso donde la probabilidad importe, hay que configurar `temperature_by_type`.
- Sesgos: no se documentan sesgos específicos, pero los datos de entrenamiento incluyen subconjuntos como Hateful Memes e iSarcasmEval, cuyos sesgos de anotación pueden propagarse. No hay evaluación de sesgo publicada.
- Alucinación: al no generar texto, el riesgo de alucinación textual es bajo, pero las probabilidades pueden ser erróneas o sobreconfiadas en dominios fuera de la distribución de entrenamiento.
- Límites de imagen: máximo 4 imágenes por petición; no se admiten referencias a imágenes en el texto de la pregunta ni respuestas en forma de caja (box answers); sin batching ni CUDA graphs en el camino visual.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los modelos base (Qwen3.5-2B-Base) y de los datasets de entrenamiento.
- Contaminación: la model card indica decontaminación contra las suites del Decision Index 0.3, pero el entrenamiento usa splits de train de benchmarks que el índice también evalúa, lo que puede inflar la métrica del Decision Index.
- Longitud de contexto no publicada: limita la planificación para estados largos o documentos extensos.

## Enlaces

- Hugging Face: https://huggingface.co/Mapika/decider-2b
- Repositorio de código: https://github.com/Mapika/decider
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-12b: https://huggingface.co/Mapika/decider-12b
- decider-12b-vision: https://huggingface.co/Mapika/decider-12b-vision
- decider-31b: https://huggingface.co/Mapika/decider-31b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
