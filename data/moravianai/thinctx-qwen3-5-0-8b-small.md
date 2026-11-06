# moravianai/ThinCtx-Qwen3.5-0.8B-small

## Resumen

ThinCtx-Qwen3.5-0.8B-small es una conversión del modelo Qwen3.5-0.8B de Alibaba, publicada por Moravian AI bajo el paraguas del proyecto ThinCtx. Su objetivo no es mejorar las capacidades del modelo base, sino reducir drásticamente el coste de memoria asociado al contexto largo: según la model card, mantiene 128k tokens de contexto en 0,89 GB de VRAM (frente a los 3,0 GB del original) y 540k tokens en 1,2 GB (frente a 7,7 GB). El truco consiste en mantener en GPU únicamente una fracción reducida del contexto, con un crecimiento de aproximadamente 0,78 KB por token en lugar de 12 KB, mientras el contexto completo reside comprimido en memoria del sistema.

La variante `-small` se distingue de la release completa en que también cuantiza los pesos a unos 5,5 bits por peso y comprime el almacén de contexto en RAM entre 2,5 y 3 veces. El resultado es un paquete de 0,7 GB con 1.088.320 parámetros declarados en safetensors, pensado para despliegues con recursos ajustados que necesiten ventanas de contexto muy largas.

La contrapartida es importante: el modelo requiere el runtime propietario `thinctx` (no funciona con vLLM, llama.cpp ni TGI estándar), no está recomendado para tool calling y hereda las carencias del base en checo y alemán. Es, por tanto, una pieza de infraestructura para contextos masivos en inglés más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tipo `qwen3_5_text`) con gestión de contexto ThinCtx |
| Parámetros totales | 1.088.320 (según safetensors) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 128k tokens (0,89 GB VRAM) hasta 540k tokens (1,2 GB VRAM) |
| Tipos de cuantización | Pesos a ~5,5 bits por peso; contexto en RAM comprimido 2,5–3× respecto a 16 bits |
| Idiomas soportados | Multilingüe; calibrado y probado en inglés, checo y alemán |
| Licencia | PolyForm Small Business 1.0.0 (uso comercial para grandes organizaciones bajo licencia aparte) |
| Formato de pesos | safetensors (runtime `thinctx`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5, y aplica la conversión ThinCtx, que separa el contexto entre una porción pequeña residente en GPU y el contexto completo almacenado comprimido en memoria del sistema. La model card no detalla la composición del dataset de entrenamiento del base ni si hubo RLHF o DPO; tampoco especifica el número de tokens vistos. Lo que sí documenta es el proceso de calibración de la conversión sobre inglés, checo y alemán.

La innovación técnica central es la gestión de memoria del contexto: el crecimiento por token en GPU baja de 12 KB a 0,78 KB, y el almacén en RAM se comprime 2,5–3× respecto al release de 16 bits. En la variante `-small` se añade cuantización de pesos a ~5,5 bits. El runtime `thinctx` (versión mínima 0.3.1, recomendada 1.0.1 o superior) es imprescindible: otras librerías de inferencia no aplican esta gestión de memoria con estos pesos. A partir de thinctx 1.0, las conversaciones que comparten system prompt comparten memoria en GPU y RAM en Linux.

## Capacidades

- Generación de texto y conversación multirretorno con plantilla de chat de Qwen3.5.
- Manejo de contextos muy largos: hasta 540k tokens con solo 1,2 GB de VRAM dedicada al contexto.
- Procesamiento de documentos largos en inglés con coste de memoria reducido.
- Capacidad multilingüe limitada: inglés funcional; checo y alemán presentes pero débiles (ver limitaciones).
- Tool calling / function calling: presente pero degradado (BFCL non-live 32,7 % frente al 53,5 % del base); no recomendado para este uso.
- Soporte de agentes y razonamiento multi-paso: no recomendado según el autor.
- Despliegue mediante endpoint compatible con la API OpenAI (`/v1/chat/completions`, con streaming).
- Uso como librería Python (`thinctx.load`) o mediante CLI (`thinctx chat`).

## Casos de uso

- Análisis de documentos extensos en inglés: resúmenes y preguntas sobre contratos, informes o expedientes de cientos de miles de tokens, aprovechando que el contexto completo vive en RAM comprimida y solo una fracción ocupa GPU.
- Procesamiento por lotes en GPU de gama baja: con 0,89 GB de VRAM para 128k tokens, se pueden ejecutar varias instancias o convivir con otros servicios en una sola GPU consumer.
- Servicio de chat de contexto largo con memoria compartida: en Linux con thinctx ≥ 1.0, múltiples conversaciones que arrancan con el mismo system prompt comparten memoria, lo que abarata el despliegue multiinquilino.
- Investigación sobre eficiencia de contexto: banco de pruebas para estudiar el equilibrio entre compresión de KV, cuantización de pesos y calidad en ventanas largas.
- Evaluación y prototipado con la API OpenAI: integración en pipelines existentes mediante `thinctx serve` sin reescribir clientes.
- Archivado y búsqueda semántica sobre corpus largos en inglés donde el coste por token de contexto es el factor limitante.
- Despliegue en WSL2 sobre Windows con GPU NVIDIA para entornos de desarrollo que no disponen de Linux nativo.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-0.8B-small | Qwen3.5-0.8B (base) |
|---|---|---|
| BFCL non-live | 32,7 % | 53,5 % |
| RULER a 64k tokens | 70 | 83 |
| Perplejidad en checo (held-out) | 1,0 % peor que el original | referencia |
| Perplejidad en inglés (held-out) | 0,7 % peor que el original | referencia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para contexto: 0,89 GB a 128k tokens y 1,2 GB a 540k tokens (solo la parte de contexto en GPU; los pesos cuantizados a ~5,5 bits añaden su propia huella, no desglosada en la información disponible).
- RAM del sistema: el contexto completo se almacena comprimido, 2,5–3× menos que el release de 16 bits.
- GPU: NVIDIA obligatoria; macOS no está soportado. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU consumer: sí, por el reducido consumo de VRAM del contexto, aunque el autor no detalla modelos concretos.
- Despliegue: exclusivamente mediante el runtime `thinctx` (CLI, librería Python o servidor compatible con OpenAI). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Plataformas: Linux x86_64 o Windows 10/11 vía WSL2; requiere driver con soporte CUDA 13 para el wheel por defecto de PyTorch 2.11 (hay alternativa cu128).
- Latencia: la lectura de prompts largos es más lenta que en el modelo base; la generación es más rápida que el original en vLLM a partir de 512k tokens de contexto según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM de contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-0.8B-small | 1.088.320 | 128k–540k | 0,89–1,2 GB | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-0.8B | mismo base, pesos 16 bits | 128k–540k | 0,89–1,2 GB | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-0.8B (base) | 0,8B (aprox.) | 128k–540k | 3,0–7,7 GB | según Qwen | vLLM y otros |
| ThinCtx-Qwen3.5-2B-small / 4B-small | 2B / 4B (aprox.) | no disponible | no disponible | PolyForm Small Business 1.0.0 | thinctx |

## Limitaciones y advertencias

- No recomendado para tool calling: BFCL non-live cae al 32,7 % frente al 53,5 % del base, incluso en prompts cortos.
- Pérdida de calidad en contexto largo: RULER a 64k baja a 70 frente a 83 del base.
- Checo y alemán débiles: hereda los errores gramaticales y cambios de idioma del base; la conversión no añade capacidad lingüística.
- Dependencia total del runtime `thinctx`: no funciona con librerías de inferencia estándar, lo que limita portabilidad y opciones de despliegue.
- Plataformas restringidas: solo Linux x86_64 y WSL2; macOS sin soporte.
- Licencia PolyForm Small Business 1.0.0: gratuita para pequeñas empresas, uso personal, investigación no comercial y educación; las organizaciones grandes en producción necesitan licencia comercial de Moravian AI.
- Lectura de prompts largos más lenta que el modelo base.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero aplicables al modelo base.
- La compartición de memoria entre conversaciones solo funciona de forma nativa en Linux, no en WSL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B-small
- Variante de precisión completa: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio del autor: https://moravian.ai/
- Contacto para licencia comercial: info@moravian.ai
