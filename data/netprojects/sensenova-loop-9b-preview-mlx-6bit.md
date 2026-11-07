# netprojects/SenseNova-Loop-9B-Preview-MLX-6bit

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal (texto e imagen de entrada, texto de salida) desarrollado por SenseNova / SenseTime, orientado a contextos largos y flujos de trabajo agénticos. Su rasgo distintivo es una arquitectura de decoder "looped": un bloque contiguo de capas se ejecuta varias veces reutilizando los mismos pesos, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. El modelo parte de una base Qwen3.5 e incorpora además conexiones de tipo manifold-constrained hyper-connections (mHC) de dos flujos en el tramo repetido.

La ficha que nos ocupa no describe el modelo original, sino una conversión a 6 bits en formato MLX realizada por NetProjects (Internet Projects Ltd), pensada para ejecutarse en Apple Silicon mediante mlx-lm. El repositorio contiene 8.956.947.840 parámetros (unos 8,96 mil millones) en safetensors, con un peso total de 7,3 GB, y una implementación en Python de la arquitectura (`sensenova_loop.py`) que se carga con `trust_remote_code=True`.

Es relevante ahora porque permite ejecutar localmente en un Mac con chip de la familia M un modelo de casi 9B con profundidad efectiva ampliada (56 pasadas de capa por token) y modo de razonamiento opcional, algo que hasta hace poco requería GPUs de datacenter. La licencia Apache 2.0 facilita su uso comercial, aunque esta build concreta es solo de texto: la entrada de imagen todavía no está incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con ejecución en bucle (looped transformer) sobre base Qwen3.5, con atención completa y Gated DeltaNet, más mHC de dos flujos en las capas 4-27 |
| Parametros totales | 8.956.947.840 (unos 8,96B) |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza pesos, no añade parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, group size 64 (existen builds de 8 bits y 4 bits del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), código de modelo en Python (`sensenova_loop.py`) |

## Arquitectura y entrenamiento

El modelo original es un decoder basado en Qwen3.5 con dos modificaciones estructurales. La primera es la ejecución en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces con pesos compartidos y las capas 28-31 se ejecutan una vez, lo que da 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache para la atención completa y estado convolucional y recurrente para Gated DeltaNet, lo que implica un consumo de memoria de caché superior al de un transformer plano del mismo tamaño.

La segunda es la incorporación de mHC de dos flujos en las capas 4-27: el estado oculto se divide en dos flujos residuales enrutados por routers pequeños en float32 (puertas pre y post y una matriz de mezcla 2×2 de Sinkhorn con 20 iteraciones). Los 96 tensores de router se mantienen en float32 y no se cuantizan, lo que preserva la fidelidad del enrutado en la conversión MLX. Esta build reproduce ambos mecanismos exactamente como el código PyTorch de SenseNova.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en la información proporcionada. La model card de esta conversión tampoco detalla el proceso de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de pensamiento opcional (`enable_thinking=True` en la plantilla de chat).
- Capacidad multimodal de entrada (texto e imagen) en el modelo original; esta build MLX de 6 bits es solo de texto y la entrada de imagen "no forma parte de esta build todavía", según la model card.
- Comprensión de documentos y combinación con tareas de código e interacción con herramientas externas, según la descripción del repositorio oficial.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: el modelo está descrito como orientado a flujos agénticos, aunque no se detallan las capacidades concretas.
- Capacidades multilingües: no disponible.
- Contexto largo: el modelo está descrito como orientado a contextos largos, pero no se especifica la longitud de ventana.

## Casos de uso

- Asistente local en Mac para desarrollo: con 7,3 GB de pesos y unos 20 tokens/s en un M5 Max, se puede integrar en editores y terminales para explicar código, redactar documentación y responder dudas sin enviar datos a la nube.
- Procesamiento de documentos en local: el modelo base acepta imágenes y texto, lo que lo hace adecuado para extraer información de documentos escaneados; en esta build habría que usar la variante original o esperar la conversión multimodal.
- Razonamiento con modo de pensamiento: activando `enable_thinking=True` se puede usar para problemas de matemáticas y lógica donde conviene que el modelo desarrolle pasos intermedios antes de responder.
- Prototipado de agentes en Apple Silicon: el servidor `mlx_lm.server` permite exponer el modelo como API compatible para orquestadores de agentes durante el desarrollo.
- Evaluación de arquitecturas looped: investigadores pueden comparar el comportamiento de un transformer con profundidad efectiva ampliada frente a un 9B plano usando el mismo hardware y cuantización.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local y con licencia Apache 2.0, encaja en escenarios donde no se permite enviar datos a servicios externos.
- Docencia y experimentación con cuantización: los builds de 4, 6 y 8 bits del mismo autor permiten estudiar el impacto de la cuantización en la calidad (KL y acuerdo de token superior) con scripts de paridad publicados.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión (mismo harness para todas las builds; ARC-Challenge con las primeras 300 preguntas del test y log-verosimilitud sobre las 4 opciones; GSM8K con las primeras 50 preguntas del test, plantilla de chat, thinking desactivado, greedy):

| Metrica | bf16 | 8-bit | 6-bit | 4-bit |
|---|---|---|---|---|
| ARC-Challenge acc / acc_norm | 48,7 / 51,0 | 48,7 / 50,3 | 47,7 / 49,0 | 45,7 / 45,0 |
| GSM8K (50 preguntas) | no disponible | 94,0 | 88,0 | 92,0 |

Fidelidad frente al código PyTorch de referencia (Transformers 5.18, bf16) sobre 16 prompts y todas las posiciones:

| Metrica | 8-bit | 6-bit | 4-bit |
|---|---|---|---|
| Mismo token superior que la referencia | 97,6% | 97,2% | 89,2% |
| Divergencia KL en el último token | 0,0011 | 0,0037 | 0,064 |
| Tamano | 9,6 GB | 7,3 GB | 5,1 GB |

El autor advierte que en GSM8K con 50 preguntas cada pregunta mueve 2 puntos porcentuales, por lo que las diferencias entre builds deben interpretarse con cautela. Velocidad de decodificación de esta build: unos 20 tokens/s en un MacBook Pro M5 Max de 128 GB (ejecución corta). El bucle duplica el trabajo de las 24 capas centrales, de ahí que sea más lento que un 9B plano.

## Requisitos de hardware

- VRAM/unified memory estimada: 7,3 GB solo de pesos; hay que sumar la caché KV y los estados de Gated DeltaNet de las 56 pasadas de capa, cuyo tamaño exacto no está disponible.
- Hardware objetivo: Apple Silicon con mlx-lm; el autor reporta pruebas en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en equipos de consumo: sí, en Macs con al menos 16 GB de memoria unificada (los pesos ocupan 7,3 GB y queda margen limitado para caché); con 32 GB o más el margen es holgado.
- GPU NVIDIA: no aplica a esta build MLX; para CUDA habría que usar el modelo original en PyTorch o convertirlo a otro formato.
- Opciones de despliegue: mlx-lm (librería Python) y `mlx_lm.server` para exponer una API; requiere `trust_remote_code=True`.
- Latencia y throughput: unos 20 tokens/s en decodificación en M5 Max según el autor; no hay datos de prefill ni de otras máquinas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (MLX 6-bit) | 8,96B | no disponible | Apache 2.0 | Hugging Face (esta build) | Solo texto en esta build; 56 pasadas de capa por token |
| SenseNova-Loop-9B-Preview (original) | unos 10B según la model card de HF | no disponible | Apache 2.0 | Hugging Face y GitHub de OpenSenseNova | Multimodal imagen-texto; referencia PyTorch |
| Builds MLX 8-bit / 4-bit del mismo autor | 8,96B | no disponible | Apache 2.0 | Hugging Face | 9,6 GB y 5,1 GB; mejor fidelidad o menor tamaño |

No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la información proporcionada, por lo que no se incluye una comparación cruzada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Esta build es solo de texto: la entrada de imagen del modelo original no está implementada todavía.
- La cuantización a 6 bits introduce divergencia respecto a la referencia bf16 (KL de 0,0037 en el último token y 97,2% de coincidencia en el token superior); para tareas sensibles a la precisión conviene usar la build de 8 bits o el modelo original.
- El bucle duplica el trabajo de 24 capas, lo que reduce la velocidad frente a un 9B convencional y aumenta el consumo de caché por las 56 ranuras de estado.
- Los routers mHC se mantienen en float32 y no se cuantizan; modificarlos o recuantizarlos rompería la fidelidad del enrutado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene revisar `sensenova_loop.py` antes de usarlo en producción.
- No hay información sobre sesgos, tasa de alucinación, idiomas soportados ni longitud de contexto, por lo que no se pueden evaluar esos riesgos con datos.
- El repositorio no está afiliado a SenseTime / SenseNova; los problemas de la conversión deben reportarse al autor de la build, no al fabricante del modelo.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribuir correctamente tanto a SenseNova como a la conversión.
- La fecha de creación del repositorio (2026-11-07) y la referencia a Transformers 5.18 indican un ecosistema muy reciente; verifica la compatibilidad de versiones de mlx-lm antes de desplegar.

## Enlaces

- Repositorio de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio oficial: https://github.com/OpenSenseNova/SenseNova-Loop
- Código, conversor y scripts de paridad: https://github.com/internet-projects/sensenova-loop-mlx
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Web del autor de la conversión: https://netprojects.com
