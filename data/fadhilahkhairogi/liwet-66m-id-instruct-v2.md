# fadhilahkhairogi/Liwet-66M-id-instruct-v2

## Resumen

Liwet-66M-id-instruct-v2 es un modelo de generacion de texto en indonesio desarrollado por el grupo 11 del curso de Generative AI de la Universidad de Telkom (Indonesia). Se trata de un transformer decoder-only de arquitectura propia, denominada `MiniTransformer`, construido desde cero y afinado posteriormente mediante SFT (supervised fine-tuning) sobre el checkpoint base `fadhilahkhairogi/Liwet-66M-id-base-v2`, que a su vez fue preentrenado durante dos epocas. El nombre Liwet responde al acronimo Lightweight Transformer, y el apellido "id" indica que su unico idioma de entrenamiento es el indonesio.

El modelo emplea Pre-RMSNorm, RoPE (rotary positional embeddings) y SwiGLU, con 12 capas, 8 cabezas de atencion, dimension oculta de 512 y dimension intermedia SwiGLU de 2.048. Segun la model card, el modelo cuenta con aproximadamente 66,7 M de parametros con pesos atados; el fichero `model.safetensors` almacena 83.112.448 elementos porque incluye una copia no atada de `lm_head.weight`. La longitud de contexto es de solo 1.024 tokens y el vocabulario es de 32.000 tokens Byte-Level BPE.

Su relevancia es acotada: se trata de un artefacto academico de bajo coste computacional, orientado a demostrar el ciclo completo de preentrenamiento y ajuste instruccional en un idioma con pocos recursos y con recursos limitados. No compite con modelos fundacionales multilingues, pero resulta util como referencia reproducible de un pipeline from-scratch, como base para experimentos de destilacion o como objeto de estudio en docencia e investigacion sobre modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniTransformer (decoder-only, Pre-RMSNorm, RoPE, SwiGLU) |
| Parametros totales | ~66,7 M (atados); 83.112.448 elementos almacenados en `model.safetensors` con `lm_head.weight` no atado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan versiones GGUF/INT8/INT4) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), con `config.json` y `tokenizer.json` |
| Capas / cabezas / dimension oculta | 12 / 8 / 512 |
| Dimension SwiGLU | 2.048 |
| Vocabulario | 32.000 tokens Byte-Level BPE (`<|unk|>`, `<|pad|>`, `<|endoftext|>`) |
| Etapa de entrenamiento | SFT sobre base preentrenada 2 epocas (`v2`) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con Pre-RMSNorm, RoPE para codificacion posicional y SwiGLU en la MLP, con 8 cabezas de atencion y dimension oculta de 512. El modelo se inicializa desde el checkpoint base `fadhilahkhairogi/Liwet-66M-id-base-v2`, preentrenado durante dos epocas, y posteriormente se somete a SFT. No se documenta el numero de tokens de preentrenamiento ni la composicion del corpus base en la informacion disponible.

El ajuste instruccional se realizo sobre cuatro datasets en indonesio: `OpenPathAI/alpaca-gpt4-indonesian-cleaned`, `FreedomIntelligence/evol-instruct-indonesian`, `LorthGyu/indonesian-instructions` y `hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated`. El entrenamiento SFT proceso 44.564.480 tokens (~44,6 M) hasta el paso 1.360, con una perdida de validacion de 2,6415 y una perplejidad de validacion de 14,03. El formato de prompt es plano, uniendo instruccion y respuesta con `\n\n` y delimitando documentos con `<|endoftext|>`; no se emplea una plantilla de chat con roles. No se documenta el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto en indonesio: respuesta a instrucciones generales en formato instruccion-respuesta.
- Seguimiento de instrucciones simples: entrenado con SFT sobre datasets tipo Alpaca y Evol-Instruct en indonesio.
- Finalizacion de texto y continuacion de documentos con delimitador `<|endoftext|>`.
- Razonamiento basico y respuesta a preguntas de conocimiento general dentro del alcance de los datos de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al indonesio; no se documenta entrenamiento en otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Longitud de contexto efectiva muy reducida (1.024 tokens), lo que restringe conversaciones multi-turno largas.

## Casos de uso

- Demostracion docente de un pipeline from-scratch: el modelo sirve como ejemplo reproducible del ciclo completo (tokenizador BPE, preentrenamiento de 2 epocas, SFT) para cursos de generative AI, dado su tamano reducido y su publicacion en safetensors.
- Generacion de texto corto en indonesio: redaccion de respuestas breves o parrafos de menos de 1.024 tokens en tareas de formularios, descripciones o resumenes sencillos, donde el coste de inferencia es minimo.
- Clasificacion y etiquetado asistido: uso como generador de etiquetas o respuestas cortas en pipelines de anotacion de datos en indonesio, aprovechando el bajo coste de ejecucion en CPU.
- Experimentos de destilacion y compresion: al ser un modelo de 66,7 M, resulta adecuado como alumno en experimentos de destilacion desde modelos mayores o como referencia para estudiar el efecto del SFT en modelos pequenos.
- Evaluacion comparativa de tokenizadores y arquitecturas: permite medir el impacto de RoPE, SwiGLU y Pre-RMSNorm en un regimen de bajos recursos, comparando con variantes propias.
- Prototipado de interfaces conversacionales de un solo turno: dado el formato plano y el contexto de 1.024 tokens, encaja en asistentes de respuesta unica (FAQ, generacion de textos cortos) sin memoria conversacional.
- Investigacion sobre sesgos y calidad en indonesio: util como linea base para estudiar el comportamiento de modelos pequenos entrenados con datos traducidos automaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida y perplejidad de validacion del checkpoint SFT:

| Checkpoint / split | Tokens procesados | Val loss | Val perplexity |
|---|---|---|---|
| SFT sobre base 2 epocas (paso 1.360) | 44.564.480 (~44,6 M) | 2,6415 | 14,03 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (83,1 M de elementos x 2 bytes ≈ 166 MB de pesos, mas activaciones y cache KV); en FP32, aproximadamente 333 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 20/30/40, Apple Silicon, iGPU recientes).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La model card solo proporciona carga manual via `safetensors.torch.load_file` y `tokenizers.Tokenizer`, por lo que no es un checkpoint `AutoModelForCausalLM` estandar de `transformers`. Requiere la definicion de arquitectura del repositorio del proyecto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por token en GPU y en decenas de milisegundos por token en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Liwet-66M-id-instruct-v2 | ~66,7 M | 1.024 | id | no disponible | safetensors (bfloat16) | Hugging Face |
| Modelos tipo GPT-2 small | ~124 M | 1.024 | en | MIT (segun version) | safetensors, GGUF | Amplia |
| Modelos tipo TinyLlama | ~1,1 B | 2.048 | en (multilingue parcial) | Apache 2.0 | safetensors, GGUF | Amplia |
| Modelos indonesios de tamano pequeno (p. ej. variantes Sahabat-AI o Merak, segun disponibilidad) | variable | variable | id | variable | variable | variable |

No se dispone de datos de rendimiento comparativo publicados para Liwet-66M-id-instruct-v2 frente a estas alternativas, por lo que la comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo academico de 66,7 M de parametros: su capacidad de razonamiento, conocimiento factual y coherencia en generaciones largas es muy inferior a la de modelos de miles de millones de parametros.
- Contexto de solo 1.024 tokens: no admite conversaciones multi-turno largas ni documentos extensos; el truncamiento es frecuente.
- Entrenado exclusivamente en indonesio: no se garantiza un comportamiento correcto en castellano, ingles u otros idiomas.
- Riesgo elevado de alucinacion: los datos SFT incluyen traducciones automaticas (LaMini-Instruction-Indonesian-Google-Translated) y datasets derivados de GPT-4, lo que puede introducir errores y artefactos de traduccion.
- Formato de prompt plano sin plantilla de chat con roles: no sigue el formato de instruccion de `transformers` ni de APIs conversacionales; requiere construccion manual de `prompt + "\n\n" + response`.
- No es un checkpoint `AutoModelForCausalLM` estandar: no se puede cargar con `from_pretrained` sin la definicion de arquitectura propia, lo que complica su integracion en herramientas estandar.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sin datos de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo: no hay evidencia publica de su calidad fuera de la perplejidad de validacion.
- Sin soporte documentado de tool calling, agentes ni cuantizacion GGUF: las opciones de despliegue en produccion son limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-instruct-v2
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v2
- Dataset `OpenPathAI/alpaca-gpt4-indonesian-cleaned`: https://huggingface.co/datasets/OpenPathAI/alpaca-gpt4-indonesian-cleaned
- Dataset `FreedomIntelligence/evol-instruct-indonesian`: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-indonesian
- Dataset `LorthGyu/indonesian-instructions`: https://huggingface.co/datasets/LorthGyu/indonesian-instructions
- Dataset `hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated`: https://huggingface.co/datasets/hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
