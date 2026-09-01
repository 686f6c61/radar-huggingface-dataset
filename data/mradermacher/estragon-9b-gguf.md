# mradermacher/estragon-9b-GGUF

## Resumen

Estragon-9B es un modelo de lenguaje especializado en el desarrollo de videojuegos con Godot 4.7 y su lenguaje de scripting GDScript. Se trata de un fine-tune del modelo Qwen3.5-9B, desarrollado por el usuario Blugart como proyecto individual con un presupuesto de computación de aproximadamente 100 dólares (alquiler de GPUs en RunPod y generación de datos sintéticos mediante la API de Claude). El modelo se distribuye en formato GGUF gracias al trabajo de cuantización de mradermacher, lo que permite su ejecución en hardware de consumo.

La relevancia de Estragon-9B radica en que aborda un nicho muy concreto: la generación de código para Godot, un motor de juegos open source con una comunidad creciente. A diferencia de modelos generalistas de código, este fine-tune está optimizado para las particularidades de GDScript y el ecosistema Godot, lo que promete una mayor precisión en tareas específicas de este entorno. El modelo tiene aproximadamente 8.950 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible safetensors en el modelo base) |

## Arquitectura y entrenamiento

Estragon-9B parte de la arquitectura de Qwen3.5-9B, un transformer denso con aproximadamente 9.000 millones de parametros. El proceso de fine-tune se realizo sobre un dataset sintetico generado con la API de Claude, disenado especificamente para cubrir tareas de programacion en GDScript y uso de Godot 4.7. El entrenamiento se llevo a cabo en GPUs alquiladas en RunPod, con un presupuesto total de unos 100 dolares, lo que demuestra que es posible obtener resultados utiles con recursos limitados si el dataset esta bien curado.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. La unica innovacion destacable es el uso de un harness de evaluacion verificable que utiliza Godot en modo headless como juez, lo que permite medir la calidad de las respuestas de forma objetiva en el dominio objetivo.

## Capacidades

- Generacion de codigo GDScript para Godot 4.7, incluyendo scripts de comportamiento, sistemas de UI, gestion de escenas y logica de juego.
- Razonamiento sobre APIs y convenciones de Godot, lo que permite sugerir soluciones adaptadas al motor.
- Soporte de conversacion y generacion de texto en ingles, util para documentar codigo o explicar conceptos de desarrollo.
- Capacidad de seguir instrucciones en lenguaje natural para producir fragmentos de codigo o refactorizaciones.
- No se menciona soporte explicito de tool calling, function calling ni modo agente en la informacion disponible.
- No se indica capacidad multimodal (vision, audio) ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de programacion en Godot: un desarrollador puede pedir al modelo que genere un script para un personaje jugable, un sistema de inventario o una camara que sigue al jugador, y recibir codigo GDScript listo para integrar en su proyecto.
- Generacion de documentacion tecnica: el modelo puede redactar comentarios, guias de uso o explicaciones de funciones y clases de Godot, ahorrando tiempo en la documentacion de proyectos.
- Prototipado rapido de mecanicas: en las fases iniciales de un juego, se pueden solicitar implementaciones basicas de mecanicas (salto, colisiones, IA simple) para probar ideas sin escribir todo el codigo manualmente.
- Refactorizacion de codigo existente: dado un script GDScript, el modelo puede sugerir mejoras de rendimiento, legibilidad o adherencia a buenas practicas de Godot.
- Educacion y formacion: estudiantes de desarrollo de juegos pueden usar el modelo para entender como se estructuran los scripts en Godot, pidiendo ejemplos comentados y explicaciones paso a paso.
- Integracion en pipelines de CI/CD: aunque no se confirma soporte de tool calling, el modelo puede ejecutarse localmente via llama.cpp o vLLM para generar tests unitarios o validar sintaxis de GDScript en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un harness de evaluacion con Godot headless como juez, pero no se proporcionan metricas concretas (como MMLU, HumanEval o GSM8K) ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, los tamaños de archivo van desde 3,9 GB (Q2_K) hasta 18 GB (f16). Para una calidad razonable, se recomienda al menos Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB).
- GPU recomendadas: una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar cuantizaciones Q4 o Q5 sin problemas. Para Q6_K o Q8_0 se necesitan 12-16 GB (RTX 4070 Ti, RTX 4080, etc.). La version f16 requiere 18 GB y es excesiva para la mayoria de usos.
- Si cabe en consumer GPU: si, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de gama media con 8 GB de VRAM.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptacion) o TGI. Para uso local, llama.cpp y Ollama son las opciones mas sencillas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 9B cuantizado a Q4 puede generar entre 20 y 40 tokens por segundo, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otras alternativas. Sin embargo, se puede situar en el contexto de modelos de codigo de tamano similar:

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| Estragon-9B | 8,95B | no disponible | GDScript / Godot | Apache 2.0 |
| CodeLlama-7B | 7B | 16K | Codigo general | Llama 2 license |
| DeepSeek Coder 6.7B | 6,7B | 16K | Codigo general | MIT |
| Qwen2.5-Coder-7B | 7B | 128K | Codigo general | Apache 2.0 |

Estragon-9B se diferencia por su enfoque exclusivo en GDScript, mientras que los otros son modelos de codigo general. Para un desarrollador de Godot, Estragon-9B puede ofrecer respuestas mas precisas en ese dominio, aunque carece de la versatilidad de los modelos generalistas.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta optimizado para GDScript y Godot 4.7; su rendimiento en otros lenguajes o frameworks sera significativamente inferior.
- Idioma limitado: solo soporta ingles, lo que puede ser una barrera para equipos hispanohablantes.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo sintacticamente valido pero logicamente incorrecto, especialmente en APIs poco comunes de Godot.
- Datos de entrenamiento sinteticos: al haber sido generados con Claude API, pueden existir sesgos o errores heredados del modelo generador.
- Sin benchmarks publicos: no hay evidencia verificable de su calidad mas alla de la descripcion del autor.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B tiene su propia licencia (Apache 2.0 tambien, segun se indica), por lo que no hay restricciones adicionales conocidas.
- Para produccion, se recomienda validar exhaustivamente el codigo generado, ya que no hay garantias de correccion en escenarios complejos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/estragon-9b-GGUF
- Modelo base (safetensors): https://huggingface.co/Blugart/estragon-9b
- Repositorio del proyecto en GitHub: https://github.com/blugart-dev/estragon
- Pagina de descarga de cuantizaciones: https://hf.tst.eu/model
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher/models
