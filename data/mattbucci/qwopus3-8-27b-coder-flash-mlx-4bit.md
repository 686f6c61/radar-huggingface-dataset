# mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit

## Resumen

Qwopus3.8-27B-Coder-Flash-MLX-4bit es una cuantizacion en 4 bits para MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tune orientado a agentes de codigo construido sobre una base densa de la familia Qwen3.5 con atencion hibrida DeltaNet y torre de vision. Lo publica mattbucci, autor del stack de inferencia m4-sglang-inference, y su proposito es hacer viable en Apple Silicon un modelo de 27.356 millones de parametros con capacidades multimodales y de tool calling sin renunciar a la calidad del original.

La relevancia de esta conversion esta en la receta de cuantizacion: no es un `mlx_vlm.convert` estandar, sino una conversion selectiva que mantiene en bf16 los escalares de compuerta del estado recurrente, las normas, las convoluciones y la torre de vision completa, y aplica 4 bits con grupo de 64 solo a las capas que lo toleran bien. El resultado ocupa unos 15 GB en disco, se ejecuta en aproximadamente 16 GB de memoria unificada mas KV cache y conserva, segun el autor, el rendimiento del modelo original en pruebas de MMLU, HumanEval y needle-in-a-haystack.

El modelo resuelve el problema de desplegar localmente un asistente de programacion con vision, razonamiento siempre activo y soporte de agentes en equipos Apple con memoria unificada de 64 GB, sin depender de GPUs dedicadas. La licencia Apache-2.0 se mantiene en toda la cadena, desde Qwen hasta esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso clase Qwen3.5 con capas DeltaNet (atencion lineal recurrente) y capas de atencion completa, mas torre de vision |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (validado con needle-in-a-haystack hasta 64K) |
| Tipos de cuantizacion | 4-bit affine con group size 64; 402 de 922 modulos cuantizados, 4,7 bits por peso de media; capas recurrentes criticas y torre de vision en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la clase Qwen3.5 con atencion hibrida: 48 capas DeltaNet con estado recurrente y 16 capas de atencion completa, mas 64 capas MLP, lo que da un total de 128 capas internas segun el desglose de modulos de la model card. Incorpora una torre de vision de 27 bloques con merger y patch embedding, lo que habilita la pipeline image-text-to-text. El modelo base Qwopus3.8-27B-Coder-Flash es un fine-tune de Jackrong sobre unsloth/Qwen3.8-27B (a su vez derivado de Qwen/Qwen3.8-27B), orientado a tareas de codigo, uso de herramientas y agentes; la model card remite a la ficha del modelo fuente para la receta de destilacion y sus evaluaciones, que no se detallan aqui.

La innovacion tecnica de esta publicacion es la receta de cuantizacion. Se mantienen en bf16 los parametros `linear_attn.in_proj_a` e `in_proj_b` de las 48 capas DeltaNet (que portan los escalares de compuerta del estado recurrente), todas las normas, las `conv1d` y la torre de vision completa; se cuantizan a 4-bit g64 el `lm_head`, `embed_tokens`, las proyecciones q/k/v/o de las 16 capas de atencion completa, `in_proj_qkv`, `in_proj_z` y `out_proj` de las capas DeltaNet, y las compuertas gate/up/down de las 64 capas MLP. Cada capa cuantizada pasa un escaneo de corrupcion por capa sobre pesos, escalas y sesgos. Ademas se elimina el `processor_config.json` generado por transformers 5.x (que nombra `Qwen3VLImageProcessor` y `AutoProcessor` no resuelve) y se deja que `preprocessor_config.json` resuelva el procesador de imagen Qwen2VL.

## Capacidades

- Generacion de texto y razonamiento con modo thinking siempre activo: el template de chat razona por defecto y `enable_thinking` en `chat_template_kwargs` no tiene efecto, igual que en el template upstream de Qwen3.8-27B.
- Generacion de codigo, con validacion en HumanEval (90% en 20 tareas) y en tareas de SWE-bench Lite.
- Tool calling y function calling, con pruebas de terminacion correcta en llamadas a herramientas (3/3).
- Razonamiento multi-paso orientado a agentes, validado con el agente opencode en un smoke test sellado de SWE-bench Lite.
- Vision: comprension de imagen (image probe calificado como STRONG) y de video, incluidas ambas direcciones de movimiento (video probe STRONG).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo recomendado por el autor: temperatura 1.0, top-p 0.95, top-k 20, segun `generation_config.json`.

## Casos de uso

- Asistente de programacion local en Mac: con 16 GB de memoria unificada mas KV cache, el modelo se ejecuta en un M4 Pro de 64 GB y permite autocompletado, refactorizacion y explicacion de codigo sin conexion a servicios externos, manteniendo el 90% de HumanEval del modelo sin cuantizar.
- Agente de resolucion de issues en repositorios: el soporte de tool calling y el modo thinking continuo encajan con flujos tipo opencode; el autor valido la generacion de parches no vacios sobre tres instancias de SWE-bench Lite (astropy 12907, 14182, 14365).
- Revision de codigo con capturas de pantalla: la torre de vision en bf16 permite adjuntar imagenes de errores de compilacion, diagramas de arquitectura o interfaces de usuario y pedir al modelo que relacione el contenido visual con el codigo del repositorio.
- Analisis de documentacion tecnica escaneada: la pipeline image-text-to-text admite OCR implicito y extraccion de fragmentos de codigo desde imagenes, util para migrar documentacion legacy a Markdown.
- Procesamiento de videos de sesiones de depuracion: el modelo supera pruebas de video en ambas direcciones de movimiento, lo que permite resumir grabaciones de pantalla o tutoriales tecnicos y extraer los comandos ejecutados.
- Automatizacion de tareas de larga duracion con contexto extenso: las pruebas needle-in-a-haystack pasan 4/4 a 1K, 4K, 16K y 64K, lo que lo hace adecuado para agentes que acumulan historial de conversacion y resultados de herramientas a lo largo de sesiones largas.
- Despliegue en pipelines de CI/CD en hardware Apple: servido con el backend MLX de SGLang mediante el script `scripts/launch.sh qwen36-27b` del repositorio m4-sglang-inference, puede atender tareas de generacion de pruebas o parches en runners macOS.

## Benchmarks y rendimiento

Resultados publicados por el autor en Apple M4 Pro de 64 GB con SGLang y MLX, comparados con Qwen3.8-27B-4bit estandar en el mismo stack:

| Prueba | Qwopus3.8-27B-Coder-Flash-MLX-4bit | Qwen3.8-27B-4bit (referencia) |
|---|---|---|
| MMLU (100 preguntas) | 83% | 84% |
| HumanEval (20 tareas) | 90% | 90% |
| LAB-Bench (50 tareas) | 37,5% | 38,7% |
| Needle-in-a-haystack | 4/4 a 1K, 4K, 16K y 64K | 4/4 a 1K, 4K, 16K y 64K |
| SWE-bench Lite (3 instancias, opencode) | 3/3 parches no vacios en el fichero canonico | No disponible |
| Codegen probe (2 tareas, 8 tests) | 8/8 STRONG | No disponible |
| Pruebas basicas, tool call y terminacion de thinking | 3/3 | No disponible |
| Sonda de razonamiento sensible al contenido | VERIFIED | No disponible |
| Image probe | STRONG | No disponible |
| Video probe (ambas direcciones de movimiento) | STRONG | No disponible |

Rendimiento de decodificacion en un solo usuario: 14,6 tok/s a 1K de contexto, 14,2 tok/s a 8K y 13,2 tok/s a 32K, identico al de Qwen3.6-27B-4bit y Qwen3.8-27B-4bit en el mismo stack.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 16 GB mas KV cache para inferencia en 4 bits; el repositorio ocupa 16,1 GB en disco y el autor indica unos 15 GB de pesos.
- Hardware validado: Apple M4 Pro con 64 GB de memoria unificada.
- No cabe en GPUs consumer de 8 o 12 GB; en GPUs dedicadas requeriria al menos 24 GB de VRAM para los pesos en 4 bits mas margen para KV, aunque no se han publicado pruebas en CUDA para esta conversion.
- Despliegue recomendado: `mlx-vlm` (`python -m mlx_vlm.generate`) para uso interactivo y el backend MLX de SGLang para servicio, mediante `MODEL=<repo> scripts/launch.sh qwen36-27b` del repositorio mattbucci/m4-sglang-inference.
- El repositorio incluye el conversor `scripts/quantize/convert_qwen36_inhouse.py` y los scripts de validacion.
- Throughput medido: 14,6 tok/s a 1K, 14,2 tok/s a 8K y 13,2 tok/s a 32K en decodificacion con un solo usuario en M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-MLX-4bit | 27,36B | No disponible (validado a 64K) | 4-bit g64 MLX, 4,7 bits/peso | Si | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B-4bit | 27B (clase) | No disponible | 4-bit | Si | Apache-2.0 | Referencia usada por el autor en el mismo stack |
| Qwen3.6-27B-4bit | 27B (clase) | No disponible | 4-bit | No disponible | Apache-2.0 | Referencia usada por el autor en el mismo stack |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27,36B | No disponible | bf16 (original) | Si | Apache-2.0 | Hugging Face, modelo base de esta conversion |

Frente a los Qwen de 27B en 4 bits, esta conversion iguala el throughput de decodificacion en el mismo stack y queda a 1 punto porcentual en MMLU y a 1,2 puntos en LAB-Bench, con HumanEval identico al 90%. La diferencia principal es el fine-tune orientado a agentes de codigo y la receta de cuantizacion selectiva, que preserva la torre de vision y los escalares recurrentes en bf16.

## Limitaciones y advertencias

- El modo thinking no se puede desactivar: `enable_thinking` en `chat_template_kwargs` no tiene efecto, por lo que todas las respuestas consumen tokens de razonamiento; el autor recomienda asignar un `max_tokens` generoso en peticiones de codigo.
- La cuantizacion a 4 bits introduce una perdida medible: 83% frente a 84% en MMLU y 37,5% frente a 38,7% en LAB-Bench respecto al Qwen3.8-27B-4bit de referencia.
- El smoke test de SWE-bench Lite cubre solo tres instancias y el de HumanEval veinte tareas; son muestras pequenas y no sustituyen una evaluacion completa.
- El modelo esta pensado y validado exclusivamente para MLX en Apple Silicon; no hay datos publicados de rendimiento en CUDA, vLLM o llama.cpp para esta conversion.
- Riesgo de alucinacion en tareas de codigo y agentes no cuantificado en la informacion disponible; como todo modelo generativo, puede producir parches sintacticamente validos pero semanticamente incorrectos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el linaje Qwen3.8, arrastra los sesgos del modelo original y de sus datos de entrenamiento.
- Idiomas soportados no declarados en la model card; no se garantiza un comportamiento multilingue mas alla del ingles tecnico observado en las pruebas.
- Licencia Apache-2.0 en toda la cadena, lo que permite uso comercial, pero conviene verificar los terminos del modelo fuente Qwen3.8-27B por si imponen condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattbucci/Qwopus3.8-27B-Coder-Flash-MLX-4bit
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Modelo del que deriva el fine-tune: https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de inferencia y scripts de conversion: https://github.com/mattbucci/m4-sglang-inference
- Libreria de inferencia: mlx-vlm (instalable via `pip install mlx-vlm`)
