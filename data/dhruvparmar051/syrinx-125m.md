# DhruvParmar051/syrinx-125m

## Resumen

syrinx-125m es un modelo de lenguaje de tipo decoder-only transformer entrenado desde cero por DhruvParmar051, un autor individual que publica bajo el paraguas del proyecto Syrinx. Se trata del tercer y mayor modelo de una serie de escalado compuesta por tres tamanos (10M, 50M y 125M parametros), entrenados con el mismo codigo: los dos menores se entrenaron en un portatil y este en una unica GPU de un cluster universitario. El modelo sigue la arquitectura `LlamaForCausalLM` con RMSNorm, RoPE, SwiGLU y embeddings atados, y cuenta con 124.275.456 parametros totales (99.109.632 sin embeddings), 12 capas, dimension de modelo 768, 12 cabezas de atencion y dimension de feed-forward 2560.

El modelo se entrena exclusivamente con 2.500.329.472 tokens (unos 2,5B) del corpus FineWeb-Edu, un conjunto de paginas web de caracter educativo derivado de Common Crawl. El entrenamiento completo se realizo en 4,75 horas sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) con precision bf16-autocast, alcanzando una perdida final de entrenamiento de 3,0406 y de validacion de 3,0263. La ventana de contexto es de 1024 tokens y el vocabulario de 32.768 tokens mediante BPE a nivel de byte.

Su relevancia es fundamentalmente metodologica y educativa: no compite con modelos de produccion, sino que sirve como caso de estudio reproducible de un entrenamiento end-to-end desde cero, con evidencia documentada (hashes SHA-256 de los ficheros de entrenamiento, evaluacion, contaminacion y benchmarks). Es un modelo base, no ajustado a instrucciones ni a seguridad, pensado para continuar texto en registro educativo en ingles y para estudiar el comportamiento de modelos pequenos a distintas escalas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (`LlamaForCausalLM`): RMSNorm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 124.275.456 (99.109.632 sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados solo en fp32 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |
| Capas / d_model / cabezas / d_ff | 12 / 768 / 12 / 2560 |
| Vocabulario | 32.768 (BPE a nivel de byte) |
| RoPE theta / norm eps | 10000 / 1e-05 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con la configuracion de Llama: normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) con theta 10000, activacion SwiGLU en la capa feed-forward y atado de embeddings entre la entrada y la salida. La configuracion concreta es de 12 capas, dimension 768, 12 cabezas de atencion y dimension de feed-forward 2560, con un vocabulario de 32.768 tokens BPE a nivel de byte. No incorpora innovaciones arquitectonicas destacables (ni atencion lineal, ni mezcla de expertos, ni decodificacion especulativa); su interes reside en la trazabilidad del proceso de entrenamiento.

El entrenamiento uso 2.500.329.472 tokens de FineWeb-Edu (licencia ODC-By-1.0), procesados en 4.769 pasos de 524.288 tokens cada uno, con optimizador AdamW (LR pico 0,0024, LR minimo 0,00024, 300 pasos de warmup, decaimiento coseno y weight decay 0,1) y precision bf16-autocast. Se ejecuto en una unica GPU NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) durante 4,75 horas. No se menciona uso de RLHF, DPO ni ajuste por instrucciones: es un modelo base puro. El autor documenta la paridad de exportacion con su implementacion propia (diferencia maxima absoluta de logits de 0 frente a la tolerancia de 0,0001).

## Capacidades

- Generacion y continuacion de texto en ingles en registro educativo.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con precision limitada por su tamano.
- Manejo de contexto de hasta 1024 tokens (ventana corta).
- Capacidad multilingue muy limitada: entrenado solo con texto ingles, el resto de idiomas esta pobremente cubierto.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni otras modalidades.
- No es un modelo instruido: no sigue instrucciones de forma fiable, solo continua texto.

## Casos de uso

- Estudio academico del escalado de modelos: permite reproducir y analizar la curva de perdida de una serie de tres tamanos (10M, 50M, 125M) entrenados con el mismo codigo y corpus, util para investigacion sobre leyes de escalado a pequena escala.
- Docencia sobre entrenamiento de LLM: al estar documentado con hashes de evidencia y scripts de evaluacion, sirve como ejemplo completo de pipeline de entrenamiento, evaluacion y control de contaminacion.
- Generacion de texto educativo de relleno: puede continuar parrafos sobre temas cientificos o divulgativos en ingles para prototipos de interfaz, siempre con revision humana por su riesgo de error factual.
- Pruebas de infraestructura de inferencia: su tamano (0,5 GB en fp32) permite validar despliegues con transformers, text-generation-inference o endpoints compatibles en entornos con recursos minimos.
- Experimentos de destilacion o ajuste fino: al ser un modelo base pequeno y con licencia permisiva, sirve como punto de partida para fine-tuning en dominios concretos con presupuestos de computo reducidos.
- Evaluacion de tecnicas de cuantizacion y eficiencia: su reducido numero de parametros permite medir el impacto de cuantizaciones sobre la perplejidad y la calidad de generacion con coste despreciable.
- Generacion de datos sinteticos a pequena escala en ingles para tareas de clasificacion o aumento de corpus, con filtrado posterior por calidad.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness 0.4.13, 0-shot, float32, con `<|endoftext|>` antepuesto:

| Benchmark | Metrica | Todos | Limpio | Contaminado | Azar |
|---|---|---|---|---|---|
| HellaSwag | acc_norm | 31,4% ± 0,5 (n=10.042) | 31,3% ± 0,5 (n=10.002) | 47,5% ± 7,9 (n=40) | 25,0% |
| ARC-Easy | acc | 50,7% ± 1,0 (n=2.376) | 50,4% ± 1,0 (n=2.278) | 63,6% ± 10,3 (n=22) | 25,0% |
| PIQA | acc_norm | 61,3% ± 1,1 (n=1.838) | 62,0% ± 1,2 (n=1.682) | 100,0% ± 0,0 (n=3) | 50,0% |
| LAMBADA (OpenAI) | acc | 22,6% ± 0,6 (n=5.153) | 22,6% ± 0,6 (n=5.153) | n/a | n/a |

Metricas de validacion sobre el split completo (ventanas no solapadas de 1024 tokens, 12.215.296 tokens objetivo, 54.310.934 bytes, bf16-autocast):

| Perdida (nats/token) | Perplejidad | Bits por byte |
|---|---|---|
| 3,0280 | 20,66 | 0,9825 |

El autor no publica comparaciones con otros modelos, argumentando que las diferencias en datos, tokens, tokenizadores y prompts impedirian una comparacion justa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos, mas memoria para activaciones y cache KV (con contexto de 1024 tokens, el coste adicional es minimo).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entreno en una NVIDIA RTX PRO 6000 Blackwell de 96 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), y cualquier runtime compatible con safetensors fp32. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y aceptable en CPU.
- Nota para Apple MPS: ejecutar en float32; con `torch.autocast("mps", dtype=torch.bfloat16)` y transformers 5.17.0 los angulos rotatorios se calculan en bf16 y la perdida empeora claramente (EXP-023).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| syrinx-125m | 124,3M | 1024 | Apache-2.0 | Entrenado desde cero con 2,5B tokens de FineWeb-Edu; sin comparativas publicadas |
| GPT-2 small | 124M | 1024 | MIT | Referencia clasica de mismo tamano; datos y tokenizador distintos |
| Pythia-160m | 160M | 2048 | Apache-2.0 | Serie de estudio con checkpoints intermedios; contexto mayor |
| SmolLM-135M | 135M | 2048 | Apache-2.0 | Entrenado con muchos mas tokens; contexto mayor |

El autor no publica comparaciones directas y advierte que las diferencias de datos, tokens y tokenizadores impedirian una comparacion justa. Los modelos de la tabla se incluyen como referencia de categoria (modelos base de aproximadamente 125-160M parametros), no como comparacion de rendimiento verificada.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no responde preguntas de forma fiable y sus continuaciones pueden ser fluidas pero factualmente incorrectas o repetitivas.
- Entrenado solo con 2,5B tokens de texto web educativo en ingles; otros idiomas, codigo y dominios especializados estan pobremente cubiertos.
- Hereda los sesgos y errores del texto web; el filtro de calidad de FineWeb-Edu no los elimina.
- Puntuaciones de benchmarks bajas (aunque por encima del azar), esperables a este tamano.
- Contexto limitado a 1024 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion alto en generacion de hechos; requiere revision humana en cualquier uso de produccion.
- En Apple MPS debe ejecutarse en float32; el uso de bf16-autocast degrada la perdida con transformers 5.17.0.
- Licencia Apache-2.0 permisiva para uso comercial, pero los datos de entrenamiento (FineWeb-Edu, ODC-By-1.0) derivan de Common Crawl y estan sujetos a sus terminos de uso.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en runtimes ligeros sin conversion.

## Enlaces

- Hugging Face: https://huggingface.co/DhruvParmar051/syrinx-125m
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia ODC-By v1.0: https://opendatacommons.org/licenses/by/1-0/
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
