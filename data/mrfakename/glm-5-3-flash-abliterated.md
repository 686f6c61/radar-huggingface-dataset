# mrfakename/GLM-5.3-Flash-abliterated

## Resumen

GLM-5.3-Flash-abliterated es una variante del modelo multimodal zai-org/GLM-5.3-Flash en la que se ha eliminado el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica mrfakename, un conocido desarrollador de la comunidad open source, y mantiene intactos los archivos, el formato y la disposición FP8/BF16 del modelo original, por lo que se carga en cualquier infraestructura donde funcione el modelo base. Con 321.323 millones de parámetros totales y un repositorio de 328,4 GB, es un modelo de gran escala orientado a tareas image-text-to-text.

La modificación técnica consiste en la eliminación de un subespacio de rechazo de rango 2, medido de forma separada para los modos chat y think en cada capa, y proyectado fuera de las escrituras al residual stream de las 45 capas principales. El resto de componentes (expertos enrutados, embeddings, torre de visión y capa MTP/nextn) permanece bit a bit idéntico al original. El autor reporta una reducción de rechazos del 99 % al 3 % en modo chat y del 98 % al 2 % en modo think, con un coste de KL de 0,038 en el primer token sobre prompts inofensivos.

Es relevante ahora porque demuestra que las técnicas de abliteración aplicadas a modelos multimodales de gran tamaño y cuantización FP8 pueden ejecutarse a escala con infraestructura de Hugging Face Jobs, y porque ofrece una alternativa sin censura para investigación sobre alineación, evaluación de salvaguardas y estudios de robustez. La licencia MIT facilita su uso comercial, aunque con las advertencias de seguridad que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y capa MTP/nextn; torre de visión integrada |
| Parámetros totales | 321.323.031.390 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8, BF16; GGUF Q8_0 disponible en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, LoRA GGUF (rank 2), NPZ (subespacio y escalas) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal con mezcla de expertos que procesa entradas image-text-to-text. La variante abliterated no reentrena el modelo: aplica una edición post-hoc sobre los pesos. Concretamente, se midieron direcciones de rechazo de forma separada para prompts de chat y de razonamiento (think) en cada capa, usando el GGUF Q8_0 como referencia, y se calculó el subespacio de rechazo como los dos vectores singulares principales del conjunto de todas esas direcciones.

Ese subespacio se proyectó fuera de las escrituras al residual stream en las 45 capas principales: `self_attn.o_proj`, `mlp.shared_experts.down_proj` y `mlp.down_proj` en las tres capas densas, lo que suma 90 tensores editados. Cada capa recibió una intensidad propia obtenida mediante una búsqueda multiobjetivo que minimiza los rechazos manteniendo bajo el KL del primer token en prompts inofensivos. Los tensores FP8 se recuantizaron con sus escalas de bloque originales usando redondeo estocástico para evitar que el redondeo deshiciera la edición. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Modo de razonamiento explícito (think mode) con cadena de pensamiento antes de la respuesta.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text).
- Respuesta a solicitudes que el modelo original rechazaba, incluidas peticiones dañinas, según los resultados del autor.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo think sugiere capacidad de razonamiento extendido, pero no se detalla soporte de agentes.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre alineación y salvaguardas: el modelo permite estudiar qué direcciones del espacio de activaciones codifican el rechazo, comparando el comportamiento con el original y usando el archivo `abliteration-edit.npz` para reproducir la edición.
- Evaluación de robustez de filtros de seguridad: sirve como modelo de referencia sin censura para medir si los clasificadores de contenido de un pipeline detectan respuestas dañinas que un modelo alineado bloquearía.
- Análisis de sesgos y comportamiento en modelos multimodales: al conservar intacta la torre de visión, permite estudiar cómo la eliminación del rechazo afecta a la interpretación de imágenes y texto combinados.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material narrativo que requiera temáticas sensibles, con la responsabilidad legal que ello implica.
- Red teaming interno: uso controlado por equipos de seguridad para generar ataques y probar defensas en sistemas desplegados, aprovechando la licencia MIT y la disponibilidad de cuantizaciones GGUF.
- Experimentación con cuantización y despliegue a gran escala: el repositorio incluye pesos FP8, BF16 y GGUF Q8_0, además de una LoRA de ablación que se puede aplicar sobre los GGUF originales con `llama-server`, lo que facilita pruebas de rendimiento en distintas configuraciones.

## Benchmarks y rendimiento

El autor publica resultados propios de la ablación sobre el GGUF Q8_0 con decodificación greedy, usando 100 prompts dañinos reservados (held-out):

| Métrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 3 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 98 | 2 |
| KL del primer token en prompts inofensivos | 0 | 0,038 |

Las respuestas en chat se limitaron a 384 tokens y el modo think a 768 tokens; cuando el razonamiento no había terminado, se evaluó el propio texto de razonamiento. La cifra de KL incluye un pequeño ruido de base por inferencia en lote. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321.323 millones de parámetros, en BF16 se necesitan aproximadamente 642 GB solo para pesos; en FP8, unos 321 GB; el GGUF Q8_0 ronda los 340 GB. Estas cifras no incluyen caché KV ni overhead.
- GPU recomendadas: para FP8 se requieren múltiples aceleradores de 80 GB (H100, H200, A100 80GB) en configuración multi-GPU; el BF16 exige al menos 8×H100 80GB. No cabe en una RTX 4090 (24 GB) ni en GPUs de consumo.
- Despliegue: el autor menciona `llama-server` para los GGUF con la LoRA de ablación; para los safetensors FP8/BF16 se puede usar vLLM o TGI si soportan la arquitectura GLM-5.3-Flash, aunque no se detalla compatibilidad explícita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-abliterated | 321,3 B | no disponible | MIT | Sí | Variante sin rechazo del base |
| zai-org/GLM-5.3-Flash | 321,3 B | no disponible | no disponible | Sí | Modelo original alineado |
| Otros modelos abliterated de la comunidad | no disponible | no disponible | variable | variable | No se dispone de comparativas publicadas |

No se dispone de información sobre modelos comparables de la misma categoría con datos de rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- El modelo cumplirá solicitudes dañinas: el autor lo advierte explícitamente y traslada al usuario la responsabilidad del uso.
- Riesgo elevado de generar contenido ilegal, dañino o éticamente problemático; no es adecuado para despliegues públicos sin filtros externos.
- El KL de 0,038 en el primer token indica una degradación pequeña pero medible del comportamiento en prompts inofensivos; puede haber deriva en tareas benignas.
- La ablación se midió sobre el GGUF Q8_0; los pesos FP8 recuantizados con redondeo estocástico pueden presentar pequeñas diferencias respecto al comportamiento medido.
- No se dispone de información sobre sesgos, idiomas soportados ni rendimiento en benchmarks estándar.
- La licencia MIT permite uso comercial, pero el uso de un modelo sin salvaguardas en producción puede incumplir normativas de contenido (por ejemplo, la Ley de Servicios Digitales de la UE) y las políticas de las plataformas de despliegue.
- Longitud de contexto no disponible: no se puede evaluar su idoneidad para tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated-GGUF
- Discord del autor: https://discord.com/invite/foss
