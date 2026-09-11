# Ar4ikov/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 en la variante publicada por el usuario Ar4ikov es una version cuantizada a INT4 del modelo multimodal PaddlePaddle/PaddleOCR-VL-1.6, orientada a OCR y analisis de documentos. El checkpoint aplica cuantizacion de solo pesos W4A16 asimetrica (grupo 128) sobre el modelo de lenguaje, generada con llm-compressor 0.12.0 y almacenada en formato `compressed-tensors` `pack-quantized`, por lo que vLLM la carga de forma nativa mediante `MarlinLinearKernel`. El modelo completo tiene 905.601.648 parametros (~906 M) y el repositorio ocupa 1,4 GB.

La arquitectura combina un torre de vision de 27 capas de estilo SigLIP (411,0 M de parametros, mantenida en BF16), un proyector `mlp_AR` de 25,9 M (BF16), un `lm_head` de 105,9 M (BF16) y un modelo de lenguaje ERNIE-4.5-0.3B de 18 capas del que solo se cuantizan las proyecciones `q/k/v/o` y `gate/up/down` (254,8 M de parametros). Es decir, de los 906 M de parametros totales solo 255 M son cuantizables, de ahi que la ganancia real de memoria sea de aproximadamente 1,2x y no del 4x que sugeriria el INT4.

Su relevancia es doble: por un lado demuestra un flujo de cuantizacion funcional para un VLM pequeno sobre vLLM; por otro, la propia model card documenta de forma inusualmente honesta que la cuantizacion **no reduce la huella total del proceso** (el ahorro de 0,34 GiB en pesos se traslada a la cache KV) y que introduce un modo de fallo nuevo en tablas densas. Es un caso de estudio util sobre cuando merece la pena cuantizar y cuando no.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM con torre de vision SigLIP-style (27 capas) + proyector `mlp_AR` + LLM ERNIE-4.5-0.3B (18 capas, transformer denso) |
| Parametros totales | 905.601.648 (~906 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (en las pruebas de la model card se sirvio con `--max-model-len` de 16384 y 8192) |
| Tipos de cuantizacion | INT4 weight-only W4A16 asimetrica, grupo 128, solo en el modelo de lenguaje; vision tower, proyector, `lm_head` y embeddings en BF16 |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` `pack-quantized` |

Desglose de componentes y precision:

| Componente | Parametros | Precision |
|---|---:|---|
| Modelo de lenguaje (ERNIE-4.5-0.3B, 18 capas): `q/k/v/o_proj`, `gate/up/down_proj` | 254,8 M | INT4, grupo 128, asimetrica |
| Torre de vision (27 capas, SigLIP-style) | 411,0 M | BF16 |
| Proyector `mlp_AR` | 25,9 M | BF16 |
| `lm_head` | 105,9 M | BF16 |
| Embeddings de tokens | 105,9 M | BF16 |

## Arquitectura y entrenamiento

El checkpoint no entrena nada: es una cuantizacion post-entrenamiento del modelo base PaddlePaddle/PaddleOCR-VL-1.6. El pipeline de cuantizacion usa `oneshot` de llm-compressor con el modificador `AWQModifier` y un `AWQMapping` personalizado, porque `PaddleOCRVLForConditionalGeneration` no esta en el registro de mapeos AWQ por defecto. Se excluyen explicitamente de la cuantizacion `lm_head`, el proyector (`model.projector.*`) y la torre visual (`*visual.*`).

La torre de vision no puede cuantizarse en vLLM aunque el checkpoint lo declarara: `vllm/model_executor/models/siglip.py` aplica una comprobacion de divisibilidad (`hidden_size % 64 == 0` e `intermediate_size % 64 == 0`) y el `intermediate_size` de esta torre es 4304, que no es divisible entre 64 (4304 / 64 = 67,25). Un checkpoint con el MLP visual cuantizado falla al cargar con `ValueError: There is no module or parameter named 'vision_model.encoder.layers.0.mlp.fc1.weight_packed' in SiglipVisionModel`. El mismo 4304 impide un esquema de `group_size = 128` para `mlp.fc2` en el lado de transformers. Cuantizar solo la atencion visual (1152, divisible) si carga y baja los pesos a 1,27 GiB, pero empeora el OCR medido.

En produccion, el modelo se usa dentro del pipeline `PaddleOCRVL` (paddleocr 3.7.0, deteccion de layout PP-DocLayoutV2 en CPU): el pipeline detecta regiones y envia un recorte por peticion con un prompt de tarea, no la pagina completa. No hay datos publicos en la informacion disponible sobre composicion del dataset de entrenamiento, numero de tokens, ni sobre fases de RLHF/DPO del modelo base.

## Capacidades

- Conversion de imagen a texto (`image-text-to-text`): OCR y parsing de documentos a partir de recortes de region.
- Parsing de documentos estructurados: emite tablas en HTML y texto de pagina en un formato postprocesable a markdown.
- Deteccion de layout delegada al pipeline externo PP-DocLayoutV2 (no es una capacidad del checkpoint en si, sino del pipeline que lo sirve).
- Soporte multilingue declarado en la etiqueta de idioma del modelo (la lista de idiomas concretos no esta disponible en la informacion proporcionada).
- Modo conversacional: la etiqueta `conversational` aparece en los tags del repositorio.
- Integracion con vLLM: carga nativa en formato `compressed-tensors` y seleccion de `MarlinLinearKernel`.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision general mas alla de OCR, audio, thinking mode: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes: el pipeline recorta cada region (cabecera, lineas de detalle, totales) y el modelo la transcribe a texto o HTML de tabla; con 16k de ventana configurada se pueden encadenar muchas regiones de un mismo documento en una sola sesion de servidor.
- Extraccion de datos de formularios administrativos: adecuado para documentos con estructura predecible, siempre que las tablas no sean muy densas, que es precisamente donde aparece el modo de fallo documentado.
- Procesamiento batch de archivos escaneados en un pipeline de CI/CD documental: al cargar de forma nativa en vLLM y caber en GPUs de 24 GB, se puede desplegar como servicio interno que consume recortes en paralelo.
- Indexacion y busqueda semantica sobre corpus documental: la salida de OCR alimenta un motor de busqueda o un RAG; el modelo actua solo como capa de transcripcion region a region.
- Despliegue en hardware de gama de consumo: al ocupar el proceso completo alrededor de 2,7 GB de VRAM en la configuracion medida, permite montar un servicio de OCR en una unica GPU consumer para cargas moderadas.
- Preprocesado de documentos financieros: factible para extractos y recibos, pero requiere validacion previa con penalizacion de repeticion y limite de tokens, porque en extractos densos de tarjeta de credito se ha observado fuga a cadenas de `000000...`.
- Prototipado e investigacion sobre cuantizacion de VLMs pequenos: el repositorio incluye receta reproducible y comparativas de seis variantes de cuantizacion, lo que lo hace util como referencia metodologica.

## Benchmarks y rendimiento

Los unicos datos de calidad disponibles provienen de la model card y corresponden a OCR, no a benchmarks generales tipo MMLU o HumanEval. Se evaluaron 20 paginas reservadas de `getomni-ai/ocr-benchmark` con el pipeline real `PaddleOCRVL` (paddleocr 3.7.0), comparando contra el markdown de referencia tras eliminar el marcado de ambos lados. `tokF1` es la F1 sobre el multiconjunto de tokens; `broken` cuenta paginas con una secuencia de 40 o mas caracteres repetidos, o con salida de menos de la mitad de longitud que en BF16.

| Checkpoint | Pesos | tokF1 | Paginas rotas |
|---|---|---:|---:|
| BF16 original | 1,82 GiB | 0,803 | 0 / 20 |
| Este checkpoint (LLM, asimetrica) | 1,48 GiB | 0,732 | 2 / 20 |
| LLM, calibrado por recorte, simetrica | 1,48 GiB | 0,719 | 5 / 20 |
| LLM, calibrado por recorte, asimetrica | 1,48 GiB | 0,692 | 4 / 20 |
| LLM sin primera/ultima capa | 1,52 GiB | 0,714 | 2 / 20 |
| LLM sin cada `down_proj` | 1,56 GiB | 0,716 | 2 / 20 |
| LLM + atencion visual | 1,27 GiB | 0,676 | 3 / 20 |
| LLM + MLP visual | No aplica | No aplica | No carga en vLLM |

En las paginas que salen intactas, la version cuantizada iguala al BF16: 0,807 frente a 0,813 en sus 18 paginas buenas (-0,7 %). Toda la diferencia de media procede de unas pocas paginas que fallan por completo.

Memoria medida con vLLM 0.29.0 en una RTX 3090:

| Configuracion | Pesos | Cache KV | VRAM total del proceso |
|---|---:|---:|---:|
| BF16 (`--max-model-len 8192 --max-num-seqs 4 --gpu-memory-utilization 0.11 --enforce-eager`) | 1,82 GiB | 0,43 GiB | 2726 MiB |
| Este checkpoint (mismos flags) | 1,48 GiB | 0,77 GiB | 2706 MiB |
| Este checkpoint (`--max-model-len 16384 --gpu-memory-utilization 0.40`) | 1,48 GiB | No disponible | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento en la informacion disponible.

## Requisitos de hardware

- Pesos: 1,48 GiB en este checkpoint cuantizado frente a 1,82 GiB en BF16.
- VRAM total del proceso: 2706 MiB con este checkpoint y 2726 MiB en BF16, ambos en la configuracion reducida medida sobre una RTX 3090. La diferencia de pesos se absorbe en cache KV.
- Cabe en GPU de consumo: si, con margen amplio; se ha medido en una RTX 3090 (24 GB) usando solo `--gpu-memory-utilization 0.11`, por lo que el limite practico es de unos 2,4-2,7 GB y puede ejecutarse en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos ~2,7 GB libres de VRAM; la medicion de referencia es sobre RTX 3090. No hay datos publicados para A100, H100 o RTX 4090.
- Opciones de despliegue: vLLM (soporte nativo del formato `compressed-tensors`, con `MarlinLinearKernel`); transformers con `trust_remote_code` (el modelo usa `custom_code`). No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra el modelo base y contra las variantes de cuantizacion ensayadas por el mismo autor. No se aportan datos de otros VLMs de OCR de tamano comparable (por ejemplo, alternativas tipo Donut o similares), por lo que esa comparacion queda como no disponible.

| Version | Parametros | Pesos | tokF1 (OCR) | Licencia | Carga en vLLM |
|---|---|---:|---:|---|---|
| PaddlePaddle/PaddleOCR-VL-1.6 (BF16) | ~906 M | 1,82 GiB | 0,803 | Apache 2.0 | Si |
| Este checkpoint (INT4 AWQ W4A16) | ~906 M | 1,48 GiB | 0,732 | Apache 2.0 | Si, nativa |
| LLM + atencion visual cuantizada | ~906 M | 1,27 GiB | 0,676 | Apache 2.0 | Si |
| LLM + MLP visual cuantizado | ~906 M | No disponible | No disponible | Apache 2.0 | No |

## Limitaciones y advertencias

- **Modo de fallo nuevo por cuantizacion**: en un extracto denso de tarjeta de credito el modelo genera `000000...` durante miles de caracteres; en un formulario IRS 1040 emite 336 caracteres donde el BF16 emite 12081, perdiendo el cuerpo de la tabla.
- **La cuantizacion no reduce la huella total**: el ahorro de 0,34 GiB en pesos se reasigna a cache KV; la VRAM total del proceso es practicamente identica (2706 frente a 2726 MiB). Solo baja el suelo de memoria, lo que importa si hay que encajar por debajo de ~2,4 GB.
- **Degradacion media de calidad**: tokF1 cae de 0,803 a 0,732 en el conjunto de 20 paginas, con 2 de 20 paginas rotas.
- **Ninguna receta elimino el fallo**: se probaron seis configuraciones (calibracion por pagina y por recorte, simetrica y asimetrica, exclusion de capas) sin exito; las variantes con capas excluidas consumen mas memoria de la que ahorran.
- **Riesgo de alucinacion y repeticion**: se recomienda anadir penalizacion de repeticion y un limite de `max_tokens`, especialmente en tablas financieras densas.
- **Solo se cuantiza el 28 % de los parametros** (255 M de 906 M), de ahi la ganancia limitada de 1,2x.
- **Compatibilidad restringida**: el checkpoint debe cargarse en vLLM 0.29.0 o compatible; la cuantizacion del MLP visual no carga por la comprobacion de divisibilidad de `siglip.py`.
- **Idiomas**: la etiqueta indica multilingue, pero no se especifica la lista de idiomas ni su cobertura real.
- **Validacion en la comunidad nula**: el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de uso en produccion.
- **Licencia**: Apache 2.0, lo que permite uso comercial sin restricciones adicionales; conviene verificar las condiciones del modelo base PaddlePaddle/PaddleOCR-VL-1.6 por si anadiese terminos propios.
- La unica evaluacion disponible es de OCR sobre 20 paginas de un unico conjunto; no hay datos de robustez en otros dominios documentales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ar4ikov/PaddleOCR-VL-1.6
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Conjunto de evaluacion: https://huggingface.co/datasets/getomni-ai/ocr-benchmark
- Referencia interna de vLLM citada en la model card: `vllm/model_executor/models/siglip.py` (comprobacion de divisibilidad del MLP visual)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada.
