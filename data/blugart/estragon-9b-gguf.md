# Blugart/estragon-9b-gguf

## Resumen

Estragon-9B es un modelo de lenguaje especializado en el desarrollo de videojuegos con Godot 4.7 y su lenguaje GDScript. Se trata de un fine-tune del modelo Qwen3.5-9B, desarrollado por Blugart, que combina supervisión directa (SFT) y optimización por refuerzo con gradiente de políticas (GRPO), utilizando un juez headless de Godot 4.7 como función de recompensa. El resultado es un modelo capaz de generar, completar y depurar código GDScript con una precisión notable en tareas específicas del motor.

Esta ficha corresponde a la versión cuantizada en formato GGUF, que permite su ejecución en hardware de consumo con un coste de rendimiento mínimo. El repositorio incluye tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0), todas evaluadas con el mismo conjunto de 300 tareas de GDScript-Eval v2, lo que permite seleccionar el archivo adecuado según la VRAM disponible. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B fine-tuned) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Estragon-9B parte de la arquitectura transformer de Qwen3.5-9B, un modelo denso de aproximadamente 9.000 millones de parametros. El proceso de fine-tune combina dos fases: primero un ajuste supervisado (SFT) con ejemplos de codigo GDScript y, posteriormente, una optimizacion por refuerzo (GRPO) donde un juez headless de Godot 4.7 evalua automaticamente la correccion funcional de los scripts generados. Este enfoque permite que el modelo aprenda no solo la sintaxis, sino tambien el comportamiento esperado dentro del motor.

No se han publicado datos sobre el numero de tokens de entrenamiento ni la composicion del dataset. El modelo esta disenado como un fine-tune "no-thinking", es decir, no genera bloques de razonamiento interno. Esto es relevante porque el runtime de Qwen3.5 en Ollama y llama.cpp activa por defecto el modo de pensamiento, lo que degrada el rendimiento medido en 15 tareas sobre 300. Por ello, es imprescindible desactivar el modo thinking en la inferencia.

## Capacidades

- Generacion de codigo GDScript para Godot 4.7, incluyendo scripts de nodos, escenas y logica de juego.
- Comprension de APIs y clases del motor Godot, como CharacterBody2D, Area2D, Timer, etc.
- Refactorizacion y correccion de scripts existentes, con deteccion de errores comunes.
- Generacion de documentacion tecnica y comentarios en codigo GDScript.
- Soporte para tareas de desarrollo de juegos 2D y 3D, como control de personajes, fisicas, animaciones y gestion de estados.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso.
- Capacidades multilingues no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de scripts de movimiento para personajes: el modelo puede crear un script de CharacterBody2D con salto, coyote time y buffer de salto, como se muestra en el ejemplo de la model card. Es adecuado porque ha sido entrenado especificamente con estas tareas y evaluado con un juez de Godot.
- Creacion de prototipos rapidos en Godot: un desarrollador puede describir en lenguaje natural una mecanica (por ejemplo, "plataforma movil con patrulla") y obtener un script funcional listo para integrar en una escena.
- Depuracion asistida de codigo GDScript: al proporcionar un script con errores, el modelo puede identificar fallos logicos o de sintaxis y sugerir correcciones, gracias a su entrenamiento con un juez que valida la ejecucion.
- Generacion de documentacion para proyectos Godot: el modelo puede generar comentarios y documentacion de API para scripts existentes, mejorando la mantenibilidad del codigo.
- Ensenanza de GDScript: puede utilizarse como asistente para aprender el lenguaje, generando ejemplos comentados y explicaciones de conceptos como senales, grupos o nodos.
- Integracion en pipelines de CI/CD para juegos: aunque no se menciona tool calling, el modelo puede ejecutarse via llama.cpp u Ollama en un servidor de integracion continua para validar que los scripts generados pasan pruebas automatizadas de Godot headless.

## Benchmarks y rendimiento

La model card incluye resultados de GDScript-Eval v2, un conjunto de 300 tareas evaluadas con un juez headless de Godot 4.7 en modo greedy pass@1. Se comparan las cuantizaciones GGUF con el modelo base en bf16 (248/300 aciertos).

| Cuantizacion | Tamano | GDScript-Eval v2 | Diferencia vs bf16 |
|---|---|---|---|
| Q8_0 | 9.5 GB | 248/300 (82.7%) | ±0 |
| Q5_K_M | 6.5 GB | 249/300 (83.0%) | +1 |
| Q4_K_M | 5.6 GB | 229/300 (76.3%) | −19 |

La cuantizacion Q5_K_M es la recomendada por el autor, ya que obtiene un resultado estadisticamente identico al modelo bf16 con un ahorro de 3 GB. La Q4_K_M es la opcion para tarjetas con 8 GB de VRAM, aunque pierde 19 aciertos, principalmente en tareas que requieren precision en APIs.

## Requisitos de hardware

- VRAM estimada: Q4_K_M (5.6 GB) cabe en GPUs de 8 GB; Q5_K_M (6.5 GB) tambien cabe en 8 GB con margen; Q8_0 (9.5 GB) requiere al menos 12 GB de VRAM.
- GPUs recomendadas: RTX 3060/4060 (8 GB) para Q4_K_M o Q5_K_M; RTX 4070/4080 o superiores para Q8_0. En entornos profesionales, A100 o H100 para despliegue concurrente.
- Ejecucion en CPU: posible con llama.cpp, aunque la latencia sera mayor; se recomienda al menos 16 GB de RAM para Q5_K_M.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (con el flag `--think=false`), y cualquier runtime compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generacion de codigo GDScript o fine-tunes de Qwen3.5 en la informacion proporcionada. Como referencia, el modelo base Qwen3.5-9B es un modelo generalista de 9B parametros con licencia Apache 2.0, pero no esta especializado en Godot. No se han encontrado alternativas publicas equivalentes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El modelo es un fine-tune no-thinking: si se ejecuta con el modo de razonamiento activado (por defecto en Ollama y llama.cpp), el rendimiento cae 15 puntos sobre 300 y puede generar bloques de pensamiento sin cerrar que consumen todo el presupuesto de tokens. Es obligatorio usar `--think=false` o `enable_thinking:false`.
- La especializacion en GDScript limita su utilidad fuera del ecosistema Godot; no se recomienda para generacion de codigo en otros lenguajes.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto. Como todo modelo de lenguaje, puede generar codigo incorrecto o inventar APIs inexistentes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones de Qwen3.5-9B; se recomienda revisar la licencia del modelo base para confirmar ausencia de restricciones adicionales.
- El sistema prompt esta incrustado en el modelo y es parte integral de su comportamiento; modificarlo puede degradar los resultados medidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Blugart/estragon-9b-gguf
- Modelo base (bf16): https://huggingface.co/Blugart/estragon-9b
- Repositorio GitHub (harness, eval sets, ADRs): https://github.com/blugart-dev/estragon
- Issue de Ollama sobre el modo thinking: https://github.com/ollama/ollama/issues/14617
