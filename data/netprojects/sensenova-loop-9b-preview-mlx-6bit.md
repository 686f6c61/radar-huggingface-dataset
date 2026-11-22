# netprojects/SenseNova-Loop-9B-Preview-MLX-6bit

## Resumen

SenseNova-Loop-9B-Preview-MLX-6bit es una conversión a formato MLX con cuantización de 6 bits del modelo SenseNova-Loop-9B-Preview, publicado originalmente por SenseNova (SenseTime) el 30 de octubre de 2026. La conversión la firma NetProjects (Internet Projects Ltd), que no tiene relación con SenseTime ni con SenseNova. El objetivo es ofrecer una build ejecutable en Apple Silicon con un peso de 7,3 GB, aproximadamente tres cuartas partes del tamaño de la versión de 8 bits (9,6 GB) y con una fidelidad respecto al modelo de referencia muy alta.

El modelo base es un transformer derivado de Qwen3.5 con dos modificaciones estructurales: ejecución en bucle (layers 0-3 una vez, layers 4-27 dos veces con pesos compartidos, layers 28-31 una vez, lo que da 56 pasadas de capa por token) y un mecanismo mHC de dos flujos residuales en las capas 4-27, con routers en float32 y una matriz de mezcla 2×2 tipo Sinkhorn. El resultado son 8.956.947.840 parámetros totales y una ventana de contexto que no se especifica en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta una arquitectura poco habitual (looped transformer con doble flujo residual) en un tamaño de 9B manejable; por otro, advierte de que existe una versión final posterior (SenseNova-Loop-9B) con entrada de imagen y decodificación MTP, por lo que esta Preview queda como una build histórica para Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con ejecución en bucle (looped transformer) y doble flujo residual mHC en capas 4-27 |
| Parámetros totales | 8.956.947.840 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 6 bits affine, group size 64 (esta build); existen builds 8-bit, 4-bit y bf16 del mismo modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es un transformer derivado de Qwen3.5 con dos innovaciones. La primera es la ejecución en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces compartiendo pesos y las capas 28-31 una vez, totalizando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache para la atención completa y estado convolucional y recurrente para Gated DeltaNet. La segunda es el mecanismo mHC de dos flujos en las capas 4-27: el estado oculto se divide en dos flujos residuales enrutados por routers pequeños en float32 (puertas pre/post y una matriz de mezcla 2×2 Sinkhorn con 20 iteraciones). Los 96 tensores de router se mantienen en float32 y no se cuantizan en esta conversión.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La información disponible se limita al proceso de conversión: pesos del revision `9937e91` convertidos a MLX y cuantizados a 6 bits, con código de modelo `sensenova_loop.py` incluido en el repositorio y cargado mediante `trust_remote_code=True`. La fidelidad de la conversión se midió sobre 16 prompts comparando con el código PyTorch de referencia en bf16: 97,2 % de coincidencia en el top token y divergencia KL de 0,0037 en el último token.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`).
- Modo de razonamiento explícito activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento aritmético de varios pasos (evaluado en GSM8K).
- Razonamiento de sentido común y conocimiento factual (evaluado en ARC-Challenge).
- Conversación multi-turno mediante plantilla de chat estilo Qwen.
- No incluye entrada de imagen en esta build: la model card indica explícitamente que el modelo es de texto y que la entrada de imagen no forma parte de esta versión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con mlx-lm 0.32 o superior y `trust_remote_code=True`, y puede servirse con `mlx_lm.server` para integrarse en una aplicación de escritorio o un cliente HTTP local sin depender de la nube.
- Razonamiento aritmético en el dispositivo: con un 88 % en las primeras 50 preguntas de GSM8K en esta build de 6 bits, es adecuado para resolver problemas matemáticos de varios pasos en un portátil Apple Silicon sin GPU dedicada.
- Prototipado de investigación sobre arquitecturas en bucle: al incluir `sensenova_loop.py` y scripts de paridad, sirve para estudiar el efecto del bucle de capas y del doble flujo mHC comparando con el código PyTorch de referencia.
- Evaluación de cuantización en Apple Silicon: la model card publica métricas de fidelidad (top token, KL) y de benchmark por cada tamaño (bf16, 8-bit, 6-bit, 4-bit), lo que permite elegir el compromiso tamaño/calidad con datos concretos.
- Generación de texto por lotes en local para tareas de resumen o reescritura: con 7,3 GB de pesos cabe en Mac con 16 GB o más de memoria unificada y evita costes de API en cargas moderadas.
- Docencia y demos de modelos de 9B: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres sobre inferencia local y cuantización.
- Base para fine-tuning ligero en MLX: al estar en formato MLX y con licencia permisiva, puede servir de punto de partida para adaptaciones con LoRA en Apple Silicon, aunque la información disponible no documenta recetas de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card. La comparación de fidelidad se hizo sobre 16 prompts y todas las posiciones frente al código PyTorch de referencia en bf16 (Transformers 5.18). El benchmark corto usa el mismo arnés para todas las builds: primeras 300 preguntas de test de ARC-Challenge con log-likelihood sobre las 4 opciones, y primeras 50 preguntas de test de GSM8K con plantilla de chat, thinking desactivado y decodificación greedy.

| Métrica | bf16 | 8-bit | 6-bit | 4-bit |
|---|---|---|---|---|
| Coincidencia top token con referencia | referencia | 97,6 % | 97,2 % | 89,2 % |
| Divergencia KL en el último token | referencia | 0,0011 | 0,0037 | 0,064 |
| Tamaño de pesos | no indicado | 9,6 GB | 7,3 GB | 5,1 GB |
| ARC-Challenge acc / acc_norm | 48,7 / 51,0 | 48,7 / 50,3 | 47,7 / 49,0 | 45,7 / 45,0 |
| GSM8K (50 preguntas) | no indicado | 94,0 | 88,0 | 92,0 |

La model card advierte que GSM8K sobre 50 preguntas varía 2 puntos por pregunta, por lo que la diferencia entre 6-bit (88,0) y 4-bit (92,0) no debe interpretarse como una ventaja del 4-bit. La velocidad de decodificación de esta build es de aproximadamente 20 tokens/s en un MacBook Pro M5 Max con 128 GB (ejecución corta); el bucle duplica el trabajo de las 24 capas centrales, lo que la hace más lenta que un modelo plano de 9B.

## Requisitos de hardware

- VRAM o memoria unificada: 7,3 GB solo para pesos; conviene reservar al menos 12-16 GB en total para caché KV, estado recurrente y overhead de mlx-lm.
- GPU recomendadas: Apple Silicon exclusivamente (MLX no soporta CUDA). La referencia medida es un MacBook Pro M5 Max con 128 GB.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 16 GB o más; en 8 GB el margen es muy ajustado y no se recomienda.
- Opciones de despliegue: mlx-lm 0.32 o superior (Python 3.11 o superior) y `mlx_lm.server` para servir por HTTP. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no cargan pesos MLX ni el código remoto de esta arquitectura.
- Latencia y throughput: aproximadamente 20 tokens/s de decodificación en M5 Max con 128 GB, en ejecución corta. No hay datos publicados de prefill ni de throughput por lotes.
- Nota: el Python del sistema en macOS (3.9) solo obtiene versiones antiguas de mlx-lm que no cargan este modelo; hay que usar un entorno con Python 3.11 o superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-MLX-6bit (esta ficha) | 8,96B | no disponible | 6-bit MLX (también 8-bit, 4-bit, bf16) | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| SenseNova-Loop-9B (versión final) | no disponible | no disponible | 6-bit, 8-bit, 4-bit y bf16 MLX | Apache 2.0 (según la model card de la Preview) | Hugging Face; añade entrada de imagen y decodificación MTP (~1,7× más rápido) |
| SenseNova-Loop-9B-Preview (original en PyTorch) | 8,96B | no disponible | bf16 | Apache 2.0 | Hugging Face; referencia de paridad para esta build |
| SenseNova 6.8 Code2Video MLX | 27B | no disponible | 6-bit MLX | no disponible | Hugging Face; modelo agéntico de código a vídeo, otra categoría |

La comparación con modelos de otros fabricantes del mismo tamaño (por ejemplo, la familia Qwen3.5 de la que deriva) no está disponible en la información proporcionada: no se han publicado resultados comparativos cruzados en la documentación consultada.

## Limitaciones y advertencias

- Es una Preview: existe una versión final posterior (SenseNova-Loop-9B) con entrada de imagen y decodificación MTP aproximadamente 1,7× más rápida. Para nuevos proyectos conviene evaluar la build final antes que esta.
- Esta build no acepta imágenes; el pipeline es exclusivamente de texto.
- No hay información sobre sesgos, idiomas soportados ni composición del dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgo ni la cobertura lingüística.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de 9B, no debe usarse como fuente de verdad sin verificación.
- La cuantización a 6 bits introduce una divergencia medible: 97,2 % de coincidencia en el top token y KL de 0,0037 frente a la referencia bf16. Es aceptable para uso general, pero no para tareas que exijan paridad exacta con el modelo original.
- GSM8K con 50 preguntas tiene un margen de error de 2 puntos por pregunta; no se deben extraer conclusiones finas de esas cifras.
- Rendimiento más lento que un 9B plano por el doble paso de las 24 capas centrales (unos 20 tokens/s en M5 Max).
- Dependencia de `trust_remote_code=True`: ejecutar el modelo implica ejecutar código Python del repositorio; conviene revisar `sensenova_loop.py` antes de desplegarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio es una conversión no oficial de NetProjects; para cuestiones de atribución conviene conservar los avisos de copyright de SenseNova y Qwen.
- No compatible con stacks CUDA (vLLM, TGI, llama.cpp, Ollama): el despliegue queda restringido a Apple Silicon vía MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Versión final SenseNova-Loop-9B: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 8-bit de esta Preview: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Build 4-bit de esta Preview: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Build 6-bit de la versión final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit de la versión final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build 4-bit de la versión final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build bf16 de la versión final: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- SenseNova 6.8 Code2Video MLX: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Código fuente, conversor y scripts de paridad: https://github.com/internet-projects/sensenova-loop-mlx
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
