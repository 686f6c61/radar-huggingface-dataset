# netprojects/SenseNova-Loop-9B-Preview-MLX-8bit

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal desarrollado por SenseNova (SenseTime) que combina un decodificador basado en Qwen3.5 con dos innovaciones arquitectonicas: ejecucion en bucle (looped execution) de un bloque central de capas con pesos compartidos y conexiones residuales de doble flujo con restricciones de variedad (mHC, manifold-constrained hyper-connections). El modelo acepta texto e imagenes y genera texto, y esta orientado a flujos de trabajo agénticos y de contexto largo.

La ficha que nos ocupa no es el modelo original, sino una conversion cuantizada a 8 bits en formato MLX realizada por NetProjects (Internet Projects Ltd), pensada para ejecucion en Apple Silicon. El repositorio incluye el codigo de la arquitectura (`sensenova_loop.py`) y los pesos convertidos, con un total de 8.956.947.840 parametros y 9,6 GB de pesos. La cuantizacion es afina con tamano de grupo 64, y los 96 tensores de los routers mHC se mantienen en float32 sin cuantizar.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar localmente en un Mac un modelo de ~9B con arquitectura no estandar (56 pasadas de capa por token) manteniendo una alta fidelidad respecto a la implementacion de referencia en PyTorch; por otro, documenta de forma transparente la degradacion por cuantizacion (97,6% de coincidencia en el token superior a 8 bits frente a 89,2% a 4 bits). El modelo base se publico el 30 de octubre de 2026 y esta bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador basado en Qwen3.5 con ejecucion en bucle y mHC de doble flujo |
| Parametros totales | 8.956.947.840 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta build), 6 bits y 4 bits (builds hermanas); cuantizacion afina con group size 64; routers mHC en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-lm |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador derivado de Qwen3.5 con dos modificaciones estructurales. La primera es la ejecucion en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces con pesos compartidos y las capas 28-31 se ejecutan una vez, lo que da 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de cache: cache KV para atencion completa y estado convolucional y recurrente para Gated DeltaNet. La segunda es la incorporacion de mHC de doble flujo en las capas 4-27: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (compuertas pre y post, y una matriz de mezcla 2x2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router nunca se cuantizan.

El modelo base es multimodal (acepta texto e imagenes), pero esta build MLX es solo de texto: la entrada de imagen no forma parte de esta conversion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el modelo soporta modo thinking (`enable_thinking=True`), lo que sugiere un entrenamiento con datos de razonamiento, pero no se detalla el proceso.

## Capacidades

- Generacion de texto conversacional con plantilla de chat y modo thinking opcional.
- Razonamiento de varios pasos (multi-step reasoning) segun los resultados en GSM8K y ARC-Challenge.
- Comprension de documentos e imagenes en el modelo base original (no disponible en esta build MLX).
- Integracion con herramientas externas y flujos agénticos, segun la descripcion del repositorio oficial del modelo base.
- Codigo y matematicas: el modelo base esta orientado a aplicaciones que combinan comprension de documentos, programacion e interaccion con herramientas.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Razonamiento matematico local en Apple Silicon: con un 94% en las primeras 50 preguntas de GSM8K a 8 bits, el modelo es adecuado para asistentes de resolucion de problemas matematicos que se ejecutan sin conexion en un Mac con memoria unificada suficiente.
- Asistente conversacional de escritorio: mediante `mlx_lm.server`, se puede desplegar un endpoint local compatible con la API de chat para integrarlo en aplicaciones de escritorio o IDE sin enviar datos a la nube.
- Prototipado de agentes con contexto largo: el modelo base esta disenado para flujos agénticos y de contexto largo; esta build permite validar dichos flujos localmente antes de migrar a infraestructura GPU.
- Evaluacion de arquitecturas no estandar: investigadores que quieran estudiar el efecto del bucle de capas y las mHC pueden ejecutar el modelo con fidelidad alta respecto a PyTorch (97,6% de coincidencia en el token superior) en un solo equipo.
- Generacion de codigo asistida en local: el modelo base esta orientado a programacion e interaccion con herramientas; esta build sirve para autocompletado y explicacion de codigo en entornos con requisitos de privacidad.
- Educacion y tutoria automatizada: con modo thinking activable, se puede usar para explicar razonamientos paso a paso en un entorno controlado y sin coste de API.
- Comparacion de cuantizaciones: las tres builds (8, 6 y 4 bits) permiten medir el impacto de la cuantizacion en tareas concretas antes de elegir el compromiso tamano/calidad adecuado.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversion (MacBook Pro M5 Max, 128 GB, 7 de noviembre de 2026). La comparacion de fidelidad se hace contra el codigo PyTorch de SenseNova (Transformers 5.18, bf16) sobre 16 prompts y todas las posiciones.

| Metrica | 8 bits | 6 bits | 4 bits |
|---|---|---|---|
| Mismo token superior que la referencia | 97,6% | 97,2% | 89,2% |
| Divergencia KL en el ultimo token | 0,0011 | 0,0037 | 0,064 |
| Tamano de pesos | 9,6 GB | 7,3 GB | 5,1 GB |

Benchmark publico corto (mismo harness para todas las builds; primeras 300 preguntas de test de ARC-Challenge con log-likelihood sobre 4 opciones; primeras 50 preguntas de test de GSM8K con plantilla de chat, thinking desactivado y decodificacion greedy):

| Metrica | bf16 | 8 bits | 6 bits | 4 bits |
|---|---|---|---|---|
| ARC-Challenge acc / acc_norm | 48,7 / 51,0 | 48,7 / 50,3 | 47,7 / 49,0 | 45,7 / 45,0 |
| GSM8K (50 preguntas) | no disponible | 94,0 | 88,0 | 92,0 |

Velocidad de decodificacion de esta build: aproximadamente 18 tokens/s en un M5 Max (ejecucion corta). El autor advierte que el bucle duplica el trabajo de las 24 capas centrales, por lo que es mas lento que un modelo 9B convencional. Tambien senala que GSM8K sobre 50 preguntas varia 2 puntos por pregunta, por lo que las diferencias entre cuantizaciones en esa metrica no son concluyentes.

## Requisitos de hardware

- VRAM/memoria unificada: 9,6 GB de pesos para la build de 8 bits; 7,3 GB para 6 bits; 5,1 GB para 4 bits. Hay que anadir la memoria de la cache KV y del estado de Gated DeltaNet, que se multiplica por las 56 pasadas de capa por token; no se dispone de una cifra exacta.
- GPU recomendadas: Apple Silicon con memoria unificada. El autor valida en un MacBook Pro M5 Max de 128 GB; no se especifica el minimo probado.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente. No es compatible con CUDA ni con GPUs NVIDIA, ya que la build es MLX.
- Opciones de despliegue: `mlx-lm` (libreria Python) y `mlx_lm.server` como servidor. Requiere `trust_remote_code=True` para cargar `sensenova_loop.py`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 18 tokens/s en decodificacion sobre un M5 Max en ejecucion corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (original) | ~10B (model card de HF) | no disponible | Apache 2.0 | PyTorch/Transformers | Multimodal (texto e imagen), referencia bf16 |
| Esta build (MLX 8 bits) | 8.956.947.840 | no disponible | Apache 2.0 | MLX, safetensors | Solo texto; 97,6% de coincidencia con la referencia |
| Builds hermanas MLX 6 y 4 bits | 8.956.947.840 | no disponible | Apache 2.0 | MLX, safetensors | 7,3 GB y 5,1 GB respectivamente |
| Modelos Qwen3.5 de ~9B | no disponible | no disponible | no disponible | no disponible | Base arquitectonica del modelo; no se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Esta build es solo de texto: la entrada de imagen del modelo base no esta implementada todavia.
- La cuantizacion a 8 bits introduce una divergencia medible respecto a bf16 (97,6% de coincidencia en el token superior, KL de 0,0011); a 4 bits la divergencia es mucho mayor (89,2% de coincidencia, KL de 0,064).
- El bucle de capas duplica el trabajo de las 24 capas centrales, lo que reduce el throughput frente a un 9B convencional (unos 18 tokens/s en un M5 Max).
- La memoria de cache por token es mayor de lo habitual al necesitar una ranura por cada una de las 56 pasadas de capa; no se dispone de cifras exactas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisar `sensenova_loop.py` antes de usarlo en produccion.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica.
- El benchmark GSM8K se limita a 50 preguntas y el autor advierte que cada pregunta mueve 2 puntos, por lo que las diferencias entre cuantizaciones no son fiables.
- Licencia Apache 2.0: permite uso comercial, pero al ser una obra derivada cuantizada conviene conservar los avisos de licencia y atribucion a SenseNova/SenseTime, Qwen y Apple MLX.
- NetProjects no esta afiliado a SenseTime/SenseNova; los resultados de fidelidad y rendimiento son mediciones del autor de la conversion, no del equipo original.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Modelo base en Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Build MLX 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Build MLX 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Repositorio GitHub del modelo base: https://github.com/OpenSenseNova/SenseNova-Loop
- Codigo, conversor y scripts de paridad y benchmark: https://github.com/internet-projects/sensenova-loop-mlx
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
