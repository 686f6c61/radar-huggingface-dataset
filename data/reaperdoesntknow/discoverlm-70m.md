# reaperdoesntknow/DiscoverLM-70M

## Resumen

DiscoverLM-70M es un modelo de lenguaje causal de 69,1 millones de parametros desarrollado por el usuario independiente reaperdoesntknow y publicado en Hugging Face. Su propuesta diferencial no es el tamano, sino la arquitectura: sustituye la atencion por producto escalar (Q·Kᵀ) por una atencion basada en distancia de Mahalanobis negativa al cuadrado, con un regularizador que impone la desigualdad triangular sobre tripletas muestreadas durante el entrenamiento. El autor denomina a este diseno Mixture-of-Attentions (MoA).

El modelo se entrena mediante SFT (supervised fine-tuning) con la libreria TRL sobre tres datasets publicos: Opus-4.6-Reasoning-3000x-filtered (razonamiento multi-paso), UltraData-Math (matematicas) y alpaca-cleaned (instrucciones generales). El entrenamiento es notablemente corto: 512 pasos, 262.144 tokens vistos, batch de 4 y longitud maxima de secuencia de 1.024 tokens, en fp32 sobre una H100.

Es relevante ahora como experimento de investigacion sobre geometria en mecanismos de atencion, no como modelo de produccion: con 69M de parametros, 1.024 tokens de contexto y un unico idioma (ingles), su utilidad practica es limitada. Resulta interesante para quienes exploran alternativas al dot-product attention, enrutamiento disperso por token y codificaciones posicionales aprendidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA): 4 bloques MoA, atencion metrica por distancia de Mahalanobis, enrutamiento top-2 de 4 rutas, HyperFFN de 3 ramas, BlackHoleRoPE, cabeza LM con mezcla propia |
| Parametros totales | 69.130.608 |
| Parametros activos | No aplica en sentido MoE clasico; el enrutamiento top-2 de 4 rutas en atencion y FFN implica computo disperso, pero el autor no publica el recuento de parametros activos |
| Longitud de contexto | 1.024 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en fp32; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | cc (Creative Commons, variante no especificada en la informacion disponible) |
| Formato de pesos | safetensors (tamano del repo: 0,6 GB) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro bloques MoA identicos. Cada bloque combina cuatro rutas paralelas por token: convolucion depthwise local, atencion metrica multi-cabeza completa (64 cabezas, espacio de cabeza de 8 dimensiones), mezcla de canales con compuertas y atencion metrica multi-query (64 queries). Un router aprendido selecciona las dos rutas principales por posicion de token, y compuertas de caracteristicas escalan la salida de cada ruta antes de la mezcla. La atencion metrica calcula pesos a partir de la distancia de Mahalanobis negativa al cuadrado bajo una metrica diagonal aprendida por cabeza, con origen de bola aprendible y radio adaptativo que enmascara pares fuera de la bola antes del softmax. Un regularizador de desigualdad triangular (lambda = 0,01, 64 tripletas por batch) se aplica durante el entrenamiento.

La codificacion posicional, BlackHoleRoPE, parte de RoPE y anade perturbaciones de fase aprendidas desde una base de Fourier compacta, manteniendo las rotaciones Q/K unitarias y aplicando una compuerta de energia acotada a [0,5, 2,0] sobre las amplitudes de V. La FFN, HyperFFN, tiene tres ramas (SwiGLU, convolucion causal depthwise separable y cuello de botella de bajo rango con compuertas) enrutadas tambien con top-2. La cabeza LM ejecuta su propia mezcla de atenciones (32 cabezas, head_dim=16) antes de proyectar a logits mediante una transformacion SwiGLU, con pesos atados al embedding de entrada (vocabulario de 48.000 tokens con tokenizador propio).

El entrenamiento uso AdamW con tasa de aprendizaje 3e-4 con decaimiento coseno, batch de 4, 512 pasos y 8 epocas sobre 262.144 tokens en fp32. La perdida media descendio de 2,887 (epoca 1) a 1,014 (epoca 8), con precision de token del 59,2% al 80,8%; el mejor paso individual (393) alcanzo perdida 0,599 y precision de token del 88,4%. La desviacion tipica de la perdida se redujo de 0,291 a 0,142, lo que el autor interpreta como estabilizacion de las preferencias de enrutamiento.

## Capacidades

- Generacion de texto causal en ingles con vocabulario propio de 48.000 tokens.
- Razonamiento multi-paso basico, entrenado sobre el dataset Opus-4.6-Reasoning-3000x-filtered.
- Resolucion de problemas matematicos elementales, entrenado sobre UltraData-Math.
- Seguimiento de instrucciones generales, entrenado sobre alpaca-cleaned.
- Enrutamiento disperso por token en atencion y FFN (top-2 de 4 rutas), con enmascaramiento por bola metrica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible como capacidad verificada.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre atencion metrica: sirve como implementacion de referencia para estudiar si una atencion que respeta la desigualdad triangular por construccion mejora la estabilidad del entrenamiento en modelos pequenos; el codigo y los pesos permiten reproducir el experimento.
- Experimentos academicos de enrutamiento disperso: el router top-2 sobre cuatro rutas de atencion y tres ramas de FFN es un banco de pruebas controlado para medir el efecto de la dispersion por token con un presupuesto de computo de 69M de parametros.
- Prototipado de codificaciones posicionales: BlackHoleRoPE, con fases aprendidas y compuerta de energia sobre V, se puede evaluar frente a RoPE estandar en tareas de modelado de lenguaje cortas.
- Generacion de texto en ingles para tareas acotadas: con 1.024 tokens de contexto, es adecuado para completar instrucciones breves o generar respuestas cortas en entornos de demostracion, no para documentos largos.
- Fine-tuning educativo: su tamano (0,6 GB en fp32) permite ajustarlo en una unica GPU consumer para ensenar pipelines de SFT con TRL sin requerir infraestructura grande.
- Pruebas de concepto de asistentes de matematicas basicas: el entrenamiento sobre UltraData-Math lo hace util para validar flujos de evaluacion de razonamiento aritmetico en modelos pequenos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son las metricas de entrenamiento del autor:

| Epoca | Perdida media | Perdida minima | Desviacion tipica | Precision de token |
|---|---|---|---|---|
| 1 | 2,887 | 2,285 | 0,291 | 59,2% |
| 2 | 2,324 | 1,651 | 0,259 | 63,4% |
| 3 | 1,931 | 1,232 | 0,211 | 68,4% |
| 4 | 1,616 | 1,012 | 0,201 | 74,4% |
| 5 | 1,432 | 0,954 | 0,169 | 77,0% |
| 6 | 1,211 | 0,677 | 0,180 | 79,0% |
| 7 | 1,075 | 0,599 | 0,151 | 80,1% |
| 8 | 1,014 | 0,718 | 0,142 | 80,8% |

Mejor paso individual: paso 393, perdida 0,599, precision de token 88,4%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (69,1M de parametros x 4 bytes) mas el estado del runtime y el tokenizador; en la practica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una NVIDIA H100, pero el modelo cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: si, en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida suficiente).
- Opciones de despliegue: transformers (libreria nativa del modelo); vLLM, llama.cpp, Ollama y TGI no estan confirmados porque la arquitectura MoA no es estandar y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponible; no se publican mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M | 69,1M | 1.024 | MoA con atencion metrica | cc | Hugging Face (transformers) |
| GPT-2 small | 124M | 1.024 | Transformer decoder estandar | MIT | Hugging Face, ampliamente soportado |
| Pythia-70M | 70M | 2.048 | Transformer decoder estandar | Apache 2.0 | Hugging Face, EleutherAI |
| SmolLM-135M | 135M | 2.048 | Transformer decoder estandar | Apache 2.0 | Hugging Face, HuggingFaceTB |

DiscoverLM-70M compite en la categoria de modelos sub-100M, donde Pythia-70M es el comparable mas directo por numero de parametros. Frente a ambos, su ventaja es arquitectonica (atencion metrica y enrutamiento disperso) y su desventaja es la falta de benchmarks publicos, contexto mas corto y soporte limitado en herramientas de inferencia. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeno (69M de parametros) con solo 262.144 tokens vistos en entrenamiento: la calidad de generacion sera limitada y propensa a incoherencias.
- Contexto maximo de 1.024 tokens, insuficiente para documentos largos, conversaciones extensas o recuperacion aumentada con muchos fragmentos.
- Solo entrenado en ingles; no se garantiza ningun comportamiento en castellano u otros idiomas.
- Riesgo elevado de alucinacion por el bajo volumen de datos de entrenamiento y la ausencia de RLHF o DPO.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad.
- La licencia "cc" no especifica la variante (BY, BY-SA, BY-NC, etc.); antes de uso comercial es imprescindible verificar los terminos exactos con el autor.
- La arquitectura MoA no es estandar: es probable que no funcione con vLLM, llama.cpp, Ollama o TGI sin implementacion personalizada; el despliegue esta practicamente limitado a transformers con codigo remoto del repositorio.
- No hay garantia de soporte a largo plazo ni mantenimiento por parte del autor.
- El modelo card incluye afirmaciones teoricas (desigualdad triangular "por construccion") que no estan respaldadas por evaluaciones publicas independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiscoverLM-70M
- Dataset Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Libreria TRL (usada para el SFT): https://github.com/huggingface/trl
- Libreria transformers: https://github.com/huggingface/transformers
