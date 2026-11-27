# scalar-ai/scalar-phos-pro

## Resumen

Scalar Phos Pro es un modelo de lenguaje de tipo decoder-only derivado de Meta Llama 3.1 8B Instruct mediante un ajuste fino supervisado (SFT) con QLoRA. Lo publica el usuario `scalar-ai` en Hugging Face y se distribuye como adaptador PEFT (no como pesos completos), por lo que requiere cargar el modelo base y aplicar el adaptador. Su objetivo declarado es mejorar el seguimiento de instrucciones especializadas y el razonamiento general manteniendo un despliegue ligero.

El modelo conserva la arquitectura del base: transformer denso autorregresivo de 32 capas, 32 cabezas de atención con Grouped-Query Attention, dimensión oculta 4096 y vocabulario de 128.256 tokens. Mantiene la ventana de contexto de 128.000 tokens de Llama 3.1, lo que lo hace utilizable en tareas de contexto largo, aunque el ajuste fino se haya hecho con datos que no se detallan.

Es relevante ahora por dos motivos: se publica junto con repositorios derivados (versión fusionada y cuantizaciones GGUF para Ollama/llama.cpp/LM Studio), lo que facilita su evaluación local, y porque el autor publica un resultado de MMLU zero-shot (66,55 %) que, aunque inferior al del modelo base, permite situarlo en la franja de modelos de 7-9B. La licencia es la Llama 3.1 Community License, con las restricciones habituales de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (decoder-only), derivado de Llama 3.1 8B Instruct |
| Parametros totales | 8.030.261.248 (~8,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP16, BF16, 4-bit (QLoRA/PEFT); GGUF Q4_K_M, Q5_K_M y Q8_0 en el repo derivado |
| Idiomas soportados | Ingles (declarado en la model card y en los metadatos); el modelo base soporta mas idiomas, pero el ajuste fino no los declara |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF en el repositorio `scalar-phos-pro-gguf`; pesos fusionados en `scalar-phos-pro-merged` |

Otros datos tecnicos: 32 capas, 32 cabezas de atencion con GQA, dimension oculta 4096, vocabulario de 128.256 tokens, embeddings posicionales rotatorios (RoPE). Tamano del repositorio del adaptador: 16,2 GB.

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer denso decoder-only con RoPE y Grouped-Query Attention. El ajuste se realizo con QLoRA (Quantized Low-Rank Adaptation), es decir, el modelo base se cuantiza a 4 bits y se entrenan adaptadores de bajo rango, lo que reduce los requisitos de memoria del entrenamiento. Las herramientas citadas en los metadatos son `peft`, `trl` y `unsloth`, lo que sugiere un pipeline de SFT con TRL sobre Unsloth.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO adicionales ni los hiperparametros del QLoRA (rango, alpha, capas objetivo). Tampoco se documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, etc.); el modelo se limita a heredar las capacidades del base y el efecto del ajuste fino.

## Capacidades

- Generacion de texto conversacional e instruction-following, heredado de Llama 3.1 8B Instruct y reforzado con SFT.
- Razonamiento general y respuesta a preguntas; el autor reporta MMLU zero-shot de 66,55 %.
- Procesamiento de contexto largo: hasta 128.000 tokens, util para documentos extensos y conversaciones multi-turno.
- Capacidad multilingue limitada por lo declarado: la model card solo lista ingles, aunque el base soporta varios idiomas.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible; el base Llama 3.1 lo soporta, pero no se confirma que el ajuste lo preserve.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision o audio: no disponible; el modelo es solo texto.
- Despliegue compatible con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Asistente conversacional especializado: al estar ajustado con SFT sobre instrucciones, puede usarse como chatbot de dominio con prompts de sistema que fijen el rol y el estilo de respuesta, aprovechando la ventana de 128k para historiales largos.
- Procesamiento de documentos extensos: resumen, extraccion de entidades y respuesta sobre contratos o informes de decenas de miles de tokens sin trocear, gracias al contexto de 128k heredado del base.
- Generacion de codigo asistida: el modelo base rinde razonablemente en tareas de codigo; este ajuste puede integrarse en asistentes de IDE o pipelines de revision, aunque no hay benchmarks de codigo publicados para esta variante.
- Clasificacion y etiquetado de texto a escala: con prompts few-shot y despliegue en vLLM o TGI, puede procesar lotes de documentos para categorizacion, moderacion o enrutamiento.
- Prototipado local en estaciones de trabajo: las cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) y el soporte de Ollama/LM Studio permiten probar el modelo en un portatil con GPU consumer antes de decidir un despliegue mayor.
- Evaluacion comparativa interna: como adaptador PEFT ligero (16,2 GB de repo, pero solo el adaptador se entrena), sirve para experimentar con fine-tuning sobre Llama 3.1 8B y comparar contra el base en tareas propias.
- Base para fine-tuning posterior: al publicarse como adaptador LoRA, se puede continuar el entrenamiento o fusionar con el base segun convenga.

## Benchmarks y rendimiento

El unico benchmark publicado en la informacion disponible es MMLU zero-shot con `lm-evaluation-harness` de EleutherAI. La tabla del autor compara con Llama 3.1 8B Instruct, Qwen2.5 7B Instruct, Gemma 2 9B Instruct, GPT-4o-mini y Claude 3 Haiku:

| Benchmark / categoria | Scalar Phos Pro | Llama-3.1-8B-Instruct | Qwen2.5-7B-Instruct | Gemma-2-9B-Instruct | GPT-4o-mini | Claude 3 Haiku |
|---|---|---|---|---|---|---|
| Parametros / clase | 8,0B (QLoRA) | 8,0B | 7,6B | 9,2B | ~8B equivalente | ~8B equivalente |
| MMLU global | 66,55 % | 69,4 % | 74,2 % | 71,3 % | 70,2 % | 75,2 % |
| Ciencias sociales | 78,06 % | 80,2 % | 83,1 % | 79,5 % | 81,0 % | 82,4 % |
| Humanidades | 69,23 % | 71,5 % | 76,4 % | 73,0 % | 72,8 % | 76,9 % |
| Otros (negocio/medicina) | 68,72 % | 70,8 % | 75,9 % | 72,4 % | 73,1 % | 77,0 % |
| STEM | 55,96 % | 58,1 % | 63,5 % | 60,2 % | 58,4 % | 64,1 % |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la informacion disponible. Cabe senalar que el modelo queda por debajo del base en todas las categorias reportadas, lo que sugiere que el ajuste fino no mejora el rendimiento general medido por MMLU.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; en la practica, 20-24 GB para contextos moderados.
- VRAM en 4-bit (QLoRA/GGUF Q4_K_M): alrededor de 5-6 GB de pesos, con 8-10 GB recomendables para contexto largo.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en BF16 con contexto completo de 128k; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) o GPUs de 12 GB para cuantizaciones GGUF.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores usando GGUF Q4_K_M o Q5_K_M.
- Opciones de despliegue: `transformers` + `peft` (adaptador), vLLM y TGI (tag `text-generation-inference`, `endpoints_compatible`), llama.cpp/Ollama/LM Studio mediante los GGUF del repo derivado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scalar Phos Pro | 8,03B (adaptador QLoRA) | 128k | 66,55 % | Llama 3.1 Community | Hugging Face (adaptador, merged y GGUF) |
| Llama 3.1 8B Instruct | 8,0B | 128k | 69,4 % | Llama 3.1 Community | Hugging Face (Meta) |
| Qwen2.5 7B Instruct | 7,6B | 128k (32k nativo, ampliable) | 74,2 % | Apache 2.0 (segun version) | Hugging Face (Alibaba) |
| Gemma 2 9B Instruct | 9,2B | 8k | 71,3 % | Gemma Terms of Use | Hugging Face (Google) |

Scalar Phos Pro no supera a ninguno de sus comparables en MMLU segun los datos del propio autor; su interes esta en el formato de publicacion (adaptador ligero, versiones fusionadas y GGUF) y en servir de base para experimentacion, no en el rendimiento bruto.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base en MMLU: el ajuste fino parece degradar ligeramente el rendimiento general medido; conviene validar en la tarea concreta antes de adoptarlo.
- Solo declara ingles: aunque el base es multilingue, el ajuste no documenta datos en otros idiomas, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinacion: inherente a los modelos de 8B; no hay evaluaciones de factualidad publicadas.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad; hereda los sesgos de Llama 3.1 y los del dataset de SFT, que no se describe.
- Tool calling no confirmado: no se documenta si el ajuste preserva la capacidad de function calling del base.
- Licencia Llama 3.1 Community: permite uso comercial con condiciones (atribucion, limite de 700 millones de usuarios mensuales, politica de uso aceptable); revisar el texto completo antes de produccion.
- Documentacion escasa: sin datos de dataset, hiperparametros ni evaluaciones adicionales; la trazabilidad del ajuste es limitada.
- Al ser un adaptador PEFT, el despliegue requiere cargar primero el base (8B) y aplicar el adaptador, lo que anade complejidad frente a usar pesos fusionados o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scalar-ai/scalar-phos-pro
- Repositorio GGUF: https://huggingface.co/scalar-ai/scalar-phos-pro-gguf
- Repositorio de pesos fusionados: https://huggingface.co/scalar-ai/scalar-phos-pro-merged
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- PEFT (Hugging Face): https://github.com/huggingface/peft
- TRL (Hugging Face): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
