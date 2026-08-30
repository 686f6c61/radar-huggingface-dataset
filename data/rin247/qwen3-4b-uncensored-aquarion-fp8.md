# Rin247/Qwen3-4B-Uncensored-Aquarion-FP8

## Resumen

Rin247/Qwen3-4B-Uncensored-Aquarion-FP8 es una cuantización FP8 weight-only del modelo Qwen3-4B de Alibaba, sometida previamente a un proceso de "abliteración" (eliminación de la dirección de rechazo) mediante proyección ortogonal. Esta variante forma parte de la forja *Genesis of Aquarion* del autor Rin247, cuyo objetivo es ofrecer modelos sin restricciones de contenido para casos de uso que requieren respuestas sin censura. El modelo se distribuye en formato safetensors con pesos FP8 y escalas asociadas, y está pensado para ser dequantizado antes de su uso con un motor de inferencia compatible.

El modelo base Qwen3-4B es un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros, entrenado por Alibaba con soporte para 32k tokens de contexto. Esta variante FP8 reduce el tamaño del repositorio a 4,4 GB, lo que facilita su despliegue en entornos con recursos limitados. La licencia no está especificada en la model card, lo que supone una incertidumbre para uso comercial.

La relevancia de este modelo radica en combinar un tamaño compacto (4B) con una cuantización eficiente (FP8) y la eliminación del rechazo a contenido sensible, lo que lo hace atractivo para aplicaciones de generación de texto creativa, roleplay o investigación de alineación, aunque con las advertencias propias de un modelo sin filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | FP8 weight-only (RTN, CPU) |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3-4B soporta principalmente ingles y chino |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8 weight-only con escalas y shapes) |

## Arquitectura y entrenamiento

El modelo es una cuantización FP8 weight-only del Qwen3-4B original, realizada mediante PyTorch RTN (round-to-nearest) en CPU. Antes de la cuantización, se aplicó un proceso de abliteración que consiste en proyectar ortogonalmente la dirección de rechazo (refusal direction) fuera de los pesos del modelo, eliminando así la tendencia a negarse a responder a ciertos contenidos. Las escalas y shapes de cuantización se almacenan en buffers separados (`*.weight_scale`, `*.weight_shape`) dentro del archivo safetensors, y el `config.json` incluye la configuración de cuantización.

No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de ajuste fino adicional, si lo hubo. El proceso de abliteración y cuantización no modifica la arquitectura subyacente, por lo que el modelo conserva las capacidades del Qwen3-4B original, incluyendo generación de texto, razonamiento, código y matemáticas, aunque la cuantización FP8 puede degradar ligeramente la precisión.

## Capacidades

- Generación de texto en ingles y chino (heredada del modelo base), con razonamiento y respuesta a instrucciones.
- Capacidad de "thinking mode" del Qwen3-4B original, aunque no se garantiza su funcionamiento tras la abliteración y cuantización.
- Soporte de tool calling y function calling en el modelo base; no se ha verificado su correcto funcionamiento en esta variante FP8.
- Generación de codigo y resolución de problemas matematicos, con posible degradacion debido a la cuantizacion.
- Respuestas sin rechazo a contenido sensible, gracias al proceso de abliteracion.
- No se ha confirmado soporte multimodal (vision, audio) en esta variante; el modelo base Qwen3-4B es solo texto.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede redactar ficcion, guiones o dialogos con tematicas adultas o controversiales sin negarse a responder, gracias a la abliteracion. Es adecuado para prototipos de escritura asistida donde se requiere libertad tematica.
- Roleplay y chatbots de personajes: su tamano compacto (4B) permite ejecutarlo en una GPU de gama media, y la ausencia de rechazo facilita interacciones ininterrumpidas en juegos de rol o simulaciones de personajes.
- Investigacion en alineacion y seguridad de IA: al comparar el comportamiento de un modelo abliterado frente al original, se pueden estudiar los efectos de la eliminacion de la direccion de rechazo sobre la utilidad y la seguridad.
- Despliegue en entornos con recursos limitados: al pesar aproximadamente 4,4 GB en FP8, puede ejecutarse en GPUs con 8 GB de VRAM o incluso en CPU con optimizaciones, lo que lo hace util para aplicaciones edge o prototipos rapidos.
- Generacion de codigo en entornos sin censura: aunque no esta verificado, el modelo base Qwen3-4B tiene buenas capacidades de codigo; esta variante podria usarse para generar scripts o exploits en contextos de investigacion de seguridad ofensiva.
- Pruebas de robustez de sistemas de moderacion: al generar contenido que normalmente seria bloqueado, puede emplearse para evaluar la eficacia de filtros de contenido en aplicaciones de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona mediciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Dado que el modelo es una cuantizacion FP8 del Qwen3-4B abliterado, es esperable un rendimiento ligeramente inferior al del modelo base, pero no hay datos concretos para confirmarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB para los pesos FP8, mas overhead de activaciones y KV cache. Con una ventana de contexto de 32k, se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB) o superior. En GPUs con 8 GB (como RTX 3060 Ti) puede ejecutarse con contextos reducidos.
- En CPU: posible con llama.cpp u otras herramientas que soporten FP8, aunque la velocidad sera limitada; se recomienda un procesador moderno con AVX-512.
- Opciones de despliegue: al ser un formato safetensors con recetas custom de cuantizacion, no es directamente compatible con vLLM, Ollama o TGI sin un paso previo de dequantizacion o conversion a GGUF. Se recomienda usar PyTorch con el script de dequantizacion proporcionado por el autor, o convertir a otro formato.
- Latencia y throughput: no disponibles. Para un modelo de 4B en FP8, se estima una velocidad de 20-40 tokens/s en una RTX 4090, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Abliterado | Licencia |
|---|---|---|---|---|---|
| Rin247/Qwen3-4B-Uncensored-Aquarion-FP8 | 4.0B | 32k | FP8 weight-only | Si | no disponible |
| huihui-ai/Huihui-Qwen3-4B-abliterated-v2 | 4.0B | 32k | no especificada | Si | Apache 2.0 (del base) |
| huihui-ai/Qwen3-4B-abliterated | 4.0B | 32k | no especificada | Si | Apache 2.0 (del base) |
| Qwen3-4B (original) | 4.0B | 32k | BF16 | No | Apache 2.0 |

Las variantes de huihui-ai son abliteraciones directas del Qwen3-4B sin cuantizacion adicional, por lo que conservan la precision completa. La version de Rin247 anade cuantizacion FP8, lo que reduce el tamano pero puede afectar al rendimiento. La licencia de la version de Rin247 no esta declarada, mientras que las de huihui-ai heredan la Apache 2.0 del modelo base.

## Limitaciones y advertencias

- La licencia no esta especificada en la model card, lo que impide su uso comercial sin autorizacion explicita del autor.
- La cuantizacion FP8 mediante RTN puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El proceso de abliteracion elimina el rechazo a contenido peligroso, lo que puede generar respuestas inapropiadas, sesgadas o daninas. No es apto para aplicaciones de produccion sin moderacion externa.
- No hay garantias de que el soporte de tool calling, thinking mode u otras funcionalidades del modelo base funcionen correctamente tras la abliteracion y cuantizacion.
- El formato de pesos FP8 con recetas custom requiere un proceso de dequantizacion manual; no es compatible directamente con la mayoria de motores de inferencia estandar.
- El modelo puede alucinar con facilidad, como cualquier LLM de 4B, y mas aun al no tener filtros de seguridad.
- No se han publicado evaluaciones de sesgos o seguridad; se recomienda precaucion al usar este modelo en contextos sensibles.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y sin validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3-4B-Uncensored-Aquarion-FP8
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Variante abliterada de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Otra variante abliterada: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
