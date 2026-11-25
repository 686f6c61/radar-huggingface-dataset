# muquanta-axel-v17/Mistral-7B-v0.1-entier-W4

## Resumen

Mistral-7B-v0.1-entier-W4 es una derivacion cuantizada a 4 bits del modelo base mistralai/Mistral-7B-v0.1, publicada por el usuario muquanta-axel-v17. Su particularidad no es solo la cuantizacion de pesos, sino que toda la ruta de inferencia (RMSNorm, rotary embeddings, atencion y softmax, SwiGLU y cabeza de salida) se ejecuta sin ninguna operacion en coma flotante: productos en int8, acumuladores en int32/int64, tablas de busqueda enteras y reescalado en punto fijo. El siguiente token se obtiene como argmax de logits enteros. Esto lo convierte en una pieza poco habitual, orientada a inferencia determinista y reproducible bit a bit entre CPU y GPU.

El modelo conserva la arquitectura transformer decoder-only del Mistral-7B original, con 7.242 millones de parametros nominales, aunque el checkpoint publicado en safetensors declara 4.205.794.289 parametros, coherente con pesos empaquetados a 4 bits. El repositorio ocupa 4,9 GB y el propio autor reporta un tamano de pesos de 4,6 GB frente a los 13,5 GB de la version BF16. La ventana de contexto probada es de 2048 tokens, aunque el modelo base soporta contextos mayores; el autor solo documenta resultados hasta esa longitud.

La relevancia de esta ficha es doble. Por un lado, muestra una via alternativa a la cuantizacion convencional (GPTQ, AWQ, GGUF) centrada en eliminar por completo la aritmetica flotante, lo que interesa en entornos con requisitos de determinismo estricto o hardware sin FPU rapida. Por otro, el propio autor reconoce una perdida de calidad medible (+1,6 % de perplejidad en WikiText-2) y una penalizacion severa de velocidad en GPU (9-10 tokens/s frente a 25 tokens/s en BF16). Es, por tanto, un modelo de investigacion y validacion, no una opcion de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B), inferencia integer-only con pesos int4 |
| Parametros totales | 7.242 millones (nominales del base); 4.205.794.289 declarados en safetensors (pesos empaquetados int4) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens probados por el autor; contexto nativo del base no confirmado en esta version |
| Tipos de cuantizacion | Pesos int4; cache KV int8; activaciones y acumuladores enteros (int8/int32/int64); sin operaciones en coma flotante |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo de inferencia propio en Python: `noyau_entier.py`, `mistral_entier.py`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Mistral-7B-v0.1: transformer decoder-only con atencion de multiples cabezas, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios. Sobre esa base, el autor ha sustituido toda la aritmetica de inferencia por una ruta entera: los productos se realizan en int8, las acumulaciones en int32/int64, el softmax y las normalizaciones se implementan con tablas de busqueda y reescalado en punto fijo, y la seleccion del siguiente token es un argmax sobre logits enteros. Los kernels de GPU personalizados estan escritos en Triton y su codigo PTX no contiene instrucciones de coma flotante, segun verifica el autor.

No se documenta el proceso de entrenamiento ni de cuantizacion. El modelo es una cuantizacion post-entrenamiento del base, sin fine-tuning adicional ni RLHF/DPO; el autor indica explicitamente que el metodo de cuantizacion empleado para producir estos pesos no esta publicado. Las validaciones reportadas incluyen un detector a nivel de dispatch de PyTorch que aborta ante cualquier tensor flotante (851.255 operaciones comprobadas en un prompt de 37 tokens), comparacion SHA-256 de logits identicos entre CPU y GPU, y verificacion de que la generacion con CUDA graph replay produce exactamente los mismos tokens que la ruta de referencia.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo continuacion (modelo base, no instruction-tuned).
- Inferencia determinista y bit-exacta entre dispositivos: mismos logits en CPU y GPU verificados por SHA-256.
- Ejecucion sin coma flotante en toda la ruta: util para entornos con requisitos de reproducibilidad estricta.
- Cache KV en int8 con generacion acelerada por CUDA graph replay.
- Ruta pura en PyTorch entera que funciona en CPU y en cualquier GPU; ruta optimizada con kernels Triton que requiere GPU NVIDIA con compute capability 8.0 o superior.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa (no es un modelo instruido).
- No soporta vision, audio ni modos de pensamiento extendido.

## Casos de uso

- Validacion de tecnicas de cuantizacion entera: el modelo sirve como referencia reproducible para investigar hasta que punto se puede eliminar la aritmetica flotante en un transformer de 7B sin colapsar la calidad, comparando perplejidad y generaciones frente al BF16.
- Inferencia determinista en entornos auditables: cuando se necesita que dos ejecuciones en hardware distinto produzcan exactamente los mismos tokens (verificado por SHA-256), este modelo ofrece una garantia que las rutas flotantes no dan.
- Despliegue en CPU sin FPU rapida: la ruta pura en PyTorch entera funciona en CPU, lo que permite ejecutar un 7B cuantizado en maquinas sin acelerador, a costa de velocidad.
- Experimentos de investigacion sobre kernels enteros: los kernels Triton y el codigo `noyau_entier.py`/`mistral_entier.py` son material directo para estudiar implementaciones integer-only de atencion, softmax y SwiGLU.
- Generacion de texto en ingles de proposito general con huella de memoria reducida: 4,6 GB de pesos frente a 13,5 GB en BF16 permiten cargar el modelo en GPU de menor VRAM, aunque la velocidad en GPU es baja (9-10 tokens/s en A100).
- Benchmarking de perdida de calidad por cuantizacion: la diferencia de +1,6 % en WikiText-2 y +1,7 % en C4 documentada por el autor sirve como caso de estudio para comparar metodos de cuantizacion.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos en NVIDIA A100 40 GB con ventanas de 2048 tokens; referencia = pesos BF16 publicados.

| Metrica | BF16 (original) | Este modelo (int4 entero) | Variacion |
|---|---|---|---|
| Perplejidad WikiText-2 | 5,253 | 5,338 | +1,6 % |
| Perplejidad C4 (64 ventanas) | 7,857 | 7,991 | +1,7 % |
| Tamano de pesos | 13,5 GB | 4,6 GB | -66 % |
| Tiempo por ventana de 2048 tokens (A100) | 0,17 s | 1,1 s | ~6,5x mas lento |
| Generacion (A100, `generate`) | ~25 tokens/s | ~9-10 tokens/s | ~2,5-2,8x mas lento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB de pesos mas cache KV int8 y overhead; en la practica, cabe en GPU con 8 GB o mas.
- GPU recomendadas: NVIDIA A100, H100 o L4 para la ruta con kernels Triton (compute capability 8.0 o superior). Cualquier GPU NVIDIA moderna sirve para la ruta lenta en PyTorch.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 4060, RTX 3070), siempre que se use la ruta PyTorch entera; los kernels Triton requieren compute capability 8.0, por lo que las RTX 30xx/40xx no los aprovecharian.
- Opciones de despliegue: el modelo no usa `transformers` de forma estandar; requiere el codigo propio del repositorio (`noyau_entier.py`, `mistral_entier.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en A100, 1,1 s por ventana de 2048 tokens y 9-10 tokens/s en generacion. En CPU, la ruta pura en PyTorch es mas lenta, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad WikiText-2 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Mistral-7B-v0.1-entier-W4 (este) | 7,2B (4,2B en safetensors) | 2048 probados | int4 entero, sin FP | 5,338 | Apache 2.0 | safetensors + codigo propio |
| mistralai/Mistral-7B-v0.1 (BF16) | 7,2B | 8k nativo | ninguna | 5,253 | Apache 2.0 | safetensors |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32k | ninguna | no disponible | Apache 2.0 | safetensors |
| Mistral-7B-v0.1 en GGUF Q4_K_M (llama.cpp) | 7,2B | 8k | int4 con escalas FP | no disponible | Apache 2.0 | GGUF |

La comparacion con variantes GGUF es la mas directa en cuanto a tamano y licencia, pero este modelo se diferencia por eliminar por completo la aritmetica flotante y por su garantia de determinismo bit-exacto, a cambio de un ecosistema de despliegue mucho mas limitado y una penalizacion de velocidad en GPU.

## Limitaciones y advertencias

- Perdida de calidad real: +1,6 % de perplejidad en WikiText-2 y +1,7 % en C4. El autor documenta un fallo concreto: ante una pregunta sobre numeros de Pell, el modelo BF16 da la recurrencia correcta P(n) = 2P(n-1) + P(n-2) y este modelo escribe la de Fibonacci.
- Velocidad muy reducida en GPU: 9-10 tokens/s frente a 25 tokens/s en BF16 en A100, y 1,1 s por ventana de 2048 tokens frente a 0,17 s. No es adecuado para cargas de produccion con latencia exigente.
- Modelo base, no instruction-tuned: no sigue instrucciones de forma fiable, no soporta tool calling ni agentes; solo continua texto.
- Solo ingles documentado; no hay evaluacion multilingue.
- Contexto probado limitado a 2048 tokens; no se confirma el comportamiento mas alla de esa longitud en esta version.
- Metodo de cuantizacion no publicado: dificulta reproducir los pesos o auditar el proceso.
- Ecosistema de despliegue restringido: requiere el codigo propio del repositorio; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que complica integraciones en produccion.
- Kernels Triton limitados a GPU NVIDIA con compute capability 8.0 o superior; en GPUs de consumo se recurre a la ruta PyTorch entera, mas lenta.
- Proyecto independiente no afiliado a Mistral AI; con 0 descargas y 0 likes en el momento de la ficha, sin validacion externa de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad y velocidad hacen desaconsejable su uso en produccion sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muquanta-axel-v17/Mistral-7B-v0.1-entier-W4
- Demo (Space): https://huggingface.co/spaces/muquanta-axel-v17/Mistral-7B-entier-W4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
