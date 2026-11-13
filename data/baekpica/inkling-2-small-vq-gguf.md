# Baekpica/Inkling-2-Small-VQ-GGUF

## Resumen

Inkling-2-Small-VQ-GGUF es una cuantización experimental del modelo multimodal Inkling-2-Small de Thinking Machines, publicada por el usuario Baekpica en Hugging Face. El modelo base es un transformer de mezcla de expertos (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos, 384 expertos con top-8, ventana de contexto nativa de 1.048.576 tokens y entrada de texto e imagen. Esta versión aplica una técnica propia denominada hVQ (evolución de VQ e iVQ) que vector-cuantiza los pesos de los expertos enrutados a 12 bits por cada 8 pesos, con el objetivo de que el modelo completo quepa en una única unidad DGX Spark (GB10) con 128 GB de memoria unificada.

La relevancia de esta ficha es doble. Por un lado, documenta un intento de comprimir un modelo de casi 600.000 millones de parámetros hasta unos 108 GB residentes mediante cuantización vectorial con realimentación de error y calibración por importancia, un enfoque distinto del escalar habitual (Q4_K, Q8_0, NVFP4). Por otro, es un caso claro de release en estado embrionario: en la fecha de creación del repositorio (13 de noviembre de 2026) no había ningún archivo de pesos publicado y la conversión seguía en curso, por lo que todas las cifras de la model card son cálculos de diseño derivados de las formas publicadas, no mediciones.

El modelo está pensado para despliegue en hardware específico (DGX Spark / GB10) mediante un runtime propio, ds4-dfm-rs, y no es compatible con llama.cpp, Ollama ni Transformers. La licencia es Apache 2.0 y los idiomas declarados son inglés, coreano, chino y japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen), con capas de atención global GQA y sliding-window, MTP drafter para decodificación especulativa |
| Parámetros totales | 594B (modelo base); 587,07B en pesos de expertos enrutados |
| Parámetros activos | 17B (top-8 de 384 expertos) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantización | Expertos enrutados: GVQ1 12-bit hVQ (K=4096, codebook E4M3 por capa, ganancia de fila F16); atención y cabeza de salida: Q4_K con importancia; drafter MTP: Q8_0; router, normas y convoluciones: BF16/F32; torre de visión: BF16; embeddings: BF16 |
| Idiomas soportados | en, ko, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante propietaria `inkling2_vq`, no compatible con llama.cpp/Ollama/Transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small es un transformer de mezcla de expertos con 48 capas, 384 expertos y enrutamiento top-8, lo que da 17.000 millones de parámetros activos sobre 594.000 millones totales. La atención combina 8 capas de atención global con GQA (8 cabezas KV de 128 dimensiones) y 40 capas de ventana deslizante con buffer circular de 1.024 tokens. Incluye una torre de visión de 23 capas ViT más proyector, y un drafter MTP (multi-token prediction) de 5 capas con cabeza de Markov para decodificación especulativa. El contexto nativo es de 1.048.576 tokens y el vocabulario de embeddings es de 201.024 entradas por 4.608 dimensiones.

La información disponible no detalla el volumen de tokens de entrenamiento ni la composición del dataset del modelo base, ni si se aplicaron RLHF o DPO. Lo que sí se documenta es el proceso de cuantización de esta release: calibración con aproximadamente 3,6 millones de tokens renderizados con la plantilla de chat del propio modelo (chat con y sin modo thinking, tool calls, código, matemáticas, documentos largos y texto web en inglés, coreano, chino, japonés y español) más un conjunto de imágenes, ejecutados mediante un forward de referencia por capas del original MXFP8. Sobre esa calibración se entrena un codebook E4M3 de 4.096 codewords octodimensionales por capa, compartido por los 384 expertos y las matrices gate, up y down, mediante Lloyd ponderado por importancia. Después, con la correlación de entrada normalizada por tokens de cada experto y los pesos de columna, se construye H = D½ R D½ y se asignan los bloques de 8 columnas de cada fila en orden, propagando el error a las columnas aún no asignadas (realimentación de error tipo GPTQ/GPTVQ a través del factor de H), y se reajusta cada ganancia de fila por mínimos cuadrados bajo H. El checkpoint de origen es la release MXFP8 del mismo modelo (revisión 086a047e8b7ff2ac902dd52355328ddb66b16914), cuyos expertos usan e4m3 con escala ue8m0 cada 32 pesos.

## Capacidades

- Generación de texto y razonamiento en modo thinking y no thinking.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante torre ViT de 23 capas.
- Tool calling y function calling, presentes en los datos de calibración del cuantizador.
- Razonamiento multi-paso y uso como agente, apoyado por el drafter MTP y la ventana de 1M tokens.
- Capacidades multilingües en inglés, coreano, chino y japonés.
- Decodificación especulativa nativa mediante el drafter MTP de 5 capas.
- Contexto largo de hasta 1.048.576 tokens con paginación de K/V a SSD más allá del umbral residente.
- K/V en NVFP4 (valores E2M1 con escala E4M3 cada 16) para las capas globales, y anillo BF16 de 1.024 tokens en las 40 capas de ventana deslizante.

## Casos de uso

- Despliegue en una única DGX Spark: el objetivo declarado del release es servir los 594B parámetros en 128 GB de memoria unificada GB10, con unos 108,2 GiB de pesos residentes, drafter y anillo, más 4 GiB de suelo y 1,8–2,5 GiB de scratch de grafo. Es el escenario para el que se diseñó la receta de 12 bits.
- Análisis de documentos largos con imagen: la ventana nativa de 1M tokens y la entrada multimodal permiten procesar informes, contratos o expedientes completos con figuras intercaladas en una sola pasada, aunque más allá de 260K–370K tokens el K/V se pagina a SSD.
- Asistentes de código con tool calling: el modelo soporta function calling y el modo thinking, adecuado para pipelines de CI/CD que requieran razonamiento sobre parches y ejecución de herramientas, siempre que se integre mediante ds4-dfm-rs.
- Atención al cliente multilingüe: cobertura de inglés, coreano, chino y japonés en conversaciones multi-turno con contexto largo, útil para mercados de Asia Oriental.
- Investigación en cuantización vectorial: el repositorio documenta con detalle la receta hVQ (calibración, codebooks, realimentación de error, ganancias por mínimos cuadrados), lo que lo convierte en material de referencia para estudiar compresión de MoE a muy bajo bit.
- Evaluación de decodificación especulativa: el drafter MTP de 5 capas con cabeza de Markov permite medir ganancias de throughput en un runtime concreto (ds4-dfm-rs) sobre hardware GB10.
- Procesamiento por lotes de texto web y código en varios idiomas: los 3,6M tokens de calibración cubren estos dominios, lo que orienta el perfil de uso hacia tareas de generación y transformación de texto técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que todas las cifras son cálculos de diseño derivados de las formas publicadas y los layouts de contenedor, no mediciones, y que las mediciones de calidad y las comprobaciones en DGX Spark se añadirán cuando finalicen. Tampoco se han publicado aún los datos de coste del formato K/V (KL con teacher forcing comparando BF16, FP8 y NVFP4).

## Requisitos de hardware

- VRAM/memoria: aproximadamente 108,2 GiB de pesos residentes (expertos 102,84 GiB, atención y cabeza 2,98 GiB, router y normas 0,16 GiB, drafter 1,75 GiB), más 4 GiB de suelo y 1,8–2,5 GiB de scratch de grafo. La torre de visión (0,61 GiB) se mapea bajo demanda solo al codificar una imagen. Los embeddings (1,73 GiB) se leen por filas desde SSD, 9.216 bytes por token.
- GPU recomendada: NVIDIA DGX Spark con GB10 y 128 GB de memoria unificada, el único hardware para el que se ha dimensionado la receta.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional; el modelo completo exige 128 GB de memoria y un runtime específico.
- K/V: NVFP4 para las 8 capas globales y la capa global del drafter (10.368 bytes por token, 10,1 GiB a 1M tokens), más un anillo BF16 de 1.024 tokens en las 40 capas de ventana deslizante (0,48 GiB con chunks de 2.048 filas). Residente hasta unos 260K–370K tokens; más allá se pagina a un archivo en SSD.
- Despliegue: exclusivamente mediante ds4-dfm-rs (https://github.com/Baekpica/ds4-dfm-rs). No carga en llama.cpp, Ollama ni Transformers.
- Latencia y throughput: no disponibles. La model card advierte de que, al atender densamente las capas globales sin indexador, la decodificación más allá del umbral residente queda limitada por el SSD y no por la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de esta release | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-VQ-GGUF (esta ficha) | 594B totales / 17B activos | 1.048.576 | hVQ 12-bit en expertos, Q4_K en atención, NVFP4 en K/V | Apache 2.0 | Sin pesos publicados a fecha de creación; runtime ds4-dfm-rs |
| Inkling-2-Small (base, MXFP8) | 594B totales / 17B activos | 1.048.576 | MXFP8 (e4m3 con escala ue8m0 cada 32 pesos) | Apache 2.0 | Disponible en thinkingmachines/Inkling-2-Small-MXFP8 |
| Inkling-2-Small (base, NVFP4) | 594B totales / 17B activos | 1.048.576 | NVFP4 | Apache 2.0 | Disponible; la model card reporta 1–2 puntos menos en evaluaciones que la MXFP8 |
| DeepSeek-V4.1-Flash-1017-hVQ-GGUF | no disponible | no disponible | hVQ (misma familia de método) | no disponible | Disponible; referencia metodológica del linaje VQ → iVQ → hVQ |

## Limitaciones y advertencias

- Estado del release: a fecha de creación del repositorio no hay ningún archivo de pesos; la conversión está en curso y las cifras son de diseño, no medidas.
- Compatibilidad: los archivos no cargan en llama.cpp, Ollama ni Transformers; requieren el runtime ds4-dfm-rs, cuyo loader para la familia `inkling2_vq` está siendo portado a DGX Spark.
- Hardware: el modelo solo está dimensionado para una DGX Spark (GB10, 128 GB); no es viable en GPU de consumo.
- Contexto largo: más allá de 260K–370K tokens el K/V se pagina a SSD y la decodificación queda limitada por el almacenamiento, no por la GPU.
- Idiomas: solo se declaran en, ko, zh y ja; el español aparece en los datos de calibración, pero no como idioma soportado oficialmente.
- Riesgo de alucinación y sesgos: no hay información publicada sobre evaluación de sesgos ni de tasas de alucinación para el modelo base ni para esta cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime ds4-dfm-rs por separado.
- Experimental: la cuantización a muy bajo bit (expertos a unos 1,5 bits por peso en almacenamiento efectivo según la nota del autor) puede degradar la calidad; la model card aún no reporta la pérdida medida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Release MXFP8 del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Runtime de despliegue: https://github.com/Baekpica/ds4-dfm-rs
- Release de referencia del método hVQ: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
