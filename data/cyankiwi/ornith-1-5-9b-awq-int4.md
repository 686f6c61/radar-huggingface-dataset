# cyankiwi/Ornith-1.5-9B-AWQ-INT4

## Resumen

Ornith-1.5-9B-AWQ-INT4 es una cuantización en precisión INT4 mediante la técnica AWQ (Activation-aware Weight Quantization) del modelo base Ornith-1.5-9B, desarrollada por el equipo de cyankiwi. El modelo base, creado por ornith-ai, es un transformer denso de aproximadamente 9.4 mil millones de parámetros que forma parte de la familia Ornith-1.5, cuyo objetivo es avanzar hacia la construcción de modelos fundacionales mediante auto-mejora de extremo a extremo. Ornith-1.5 extiende el marco de auto-scaffolding de Ornith-1.0 (basado en Qwen3.5 y Gemma4) para optimizar conjuntamente la generación de tareas, la construcción de scaffolds y la ejecución de soluciones mediante aprendizaje por refuerzo, generando continuamente nuevas experiencias de entrenamiento sin depender de un conjunto fijo de tareas curadas por humanos.

Esta versión cuantizada reduce el tamaño del modelo a aproximadamente 9.0 GB, lo que permite su despliegue en GPU de consumo con 12 GB de VRAM o menos, y es compatible con la librería transformers. El modelo mantiene las capacidades multimodales del original (texto e imagen) y soporta diez idiomas, siendo una opción atractiva para entornos de producción que requieran inferencia eficiente sin sacrificar el rendimiento en tareas de agente y código. La licencia MIT facilita su integración comercial sin restricciones de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (con influencias de Gemma4) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 (esta version); el modelo base esta disponible en precision completa |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso de 9B parámetros construido sobre la arquitectura de Qwen3.5, con incorporaciones de Gemma4, segun indica la documentacion del autor. El proceso de entrenamiento se basa en un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de entrenamiento de las que puede mejorar. Este proceso sustituye al enfoque tradicional de conjuntos fijos de tareas curadas manualmente y harnesses disenados a mano, y se detalla en el blog de ornith.ai.

La cuantizacion AWQ INT4 ha sido calibrada por cyankiwi sobre un dataset propio de mas de 250.000 tokens en multiples idiomas, con foco en contenido STEM y agentico. La tecnica AWQ preserva las activaciones mas importantes durante la cuantizacion, lo que minimiza la perdida de calidad respecto al modelo en precision completa. El modelo cuantizado mantiene compatibilidad con la libreria transformers y es compatible con endpoints de inferencia.

## Capacidades

- Generacion de texto, razonamiento complejo y conversacion multi-turno.
- Soporte multimodal: procesa entradas de texto e imagen (tag `image-text-to-text`).
- Capacidades de agente y tool calling, demostradas en benchmarks como Terminal-Bench 2.1 con entornos como Terminus-2 y Claude Code.
- Razonamiento multi-step en tareas de terminal y ejecucion de comandos.
- Multilingue: soporta 10 idiomas (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES).
- Adecuado para despliegue en dispositivos moviles mediante variantes cuantizadas (Ornith-1.5-9B-Mobile).
- Compatible con la libreria transformers y endpoints de inferencia.

## Casos de uso

- **Agente de terminal en produccion**: con una puntuacion de 46.2 en Terminal-Bench 2.1 (Terminus-2), el modelo puede ejecutar comandos, leer salidas y tomar decisiones en entornos de consola, ideal para automatizar tareas de administracion de sistemas o CI/CD.
- **Asistente de codigo en entornos de desarrollo**: su rendimiento en benchmarks de codigo y su soporte de tool calling permiten integrarlo en IDEs o pipelines de revision de codigo para generar sugerencias y parches.
- **Atencion al cliente multilingue**: gracias a sus 10 idiomas y capacidad de conversacion, puede gestionar soporte tecnico en mercados globales, manteniendo contexto en interacciones largas.
- **Analisis de documentos con imagen**: la entrada multimodal permite procesar capturas de pantalla, diagramas o formularios escaneados, extrayendo informacion estructurada para automatizar procesos de back-office.
- **Automatizacion de flujos agenciales**: su capacidad para planificar y ejecutar tareas de varios pasos lo hace util en sistemas de RPA (automatizacion de procesos roboticos) donde se requiere razonamiento y toma de decisiones.
- **Despliegue en dispositivos moviles**: la version cuantizada en INT4 (8.99 GB) cabe en dispositivos con 12 GB de RAM, permitiendo inferencia local en tablets o portatiles sin conexion a la nube.
- **Generacion de contenido multilingue**: para equipos de marketing o redaccion que necesitan producir texto coherente en varios idiomas con un solo modelo desplegado.

## Benchmarks y rendimiento

Segun la model card del autor, los resultados en Terminal-Bench 2.1 son los siguientes:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | **46.2** | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | **47.0** | 40.6 | 18.9 | 49.2 | - |

Nota: estos resultados corresponden al modelo base Ornith-1.5-9B en precision completa. No se han publicado benchmarks especificos para la version cuantizada AWQ INT4 en la informacion disponible, aunque la tecnica AWQ suele mantener la degradacion por debajo del 1-2% en tareas estandar. No se dispone de resultados para MMLU, HumanEval o GSM8K en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: ~9.0 GB para inferencia en INT4 (tamano del repo: 9.0 GB).
- GPU recomendadas: tarjetas con 12 GB de VRAM o mas, como RTX 4070, RTX 4080, RTX 4090, A10, L4, o GPUs de datacenter como A100 y H100 para mayor concurrencia.
- Cabe en GPUs de consumo: si, en modelos con 12 GB o mas (p.ej. RTX 4070 Ti Super).
- Opciones de despliegue: vLLM, llama.cpp, TGI (Text Generation Inference), Ollama (si se convierte a GGUF), y compatible con la libreria transformers.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|
| **Ornith-1.5-9B** | 9.4B | No disponible | 46.2 | MIT |
| Ornith-1.0-9B | 9.4B | No disponible | 43.1 | MIT |
| Qwen3.5-9B | 9.4B | No disponible | 21.3 | Apache 2.0 |
| Qwen3.6-35B-A3B | 35B (3B activos) | No disponible | 52.5 | Apache 2.0 |
| Gemma-4-31B | 31B | No disponible | 42.1 | Gemma License |

El modelo de 9B supera claramente a Qwen3.5-9B en tareas de agente y se acerca a modelos mucho mas grandes como Gemma-4-31B. La version cuantizada AWQ INT4 mantiene el mismo rendimiento del modelo base con una degradacion minima, lo que lo convierte en una opcion atractiva frente a alternativas mas pesadas.

## Limitaciones y advertencias

- No se ha publicado la longitud de contexto del modelo; es recomendable validar la ventana de contexto antes de desplegarlo en produccion.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente en contextos largos o con entradas ambiguas.
- Sesgos potenciales derivados de los datos de entrenamiento; no se han publicado evaluaciones de sesgo.
- La version cuantizada AWQ puede presentar una degradacion ligera en tareas de precision extrema (matematicas o logica) respecto al modelo base.
- La licencia MIT permite uso comercial sin restricciones, pero no ofrece garantias de soporte o seguridad.
- El modelo es multimodal (texto e imagen), pero no se han especificado las limitaciones de resolucion o formatos de imagen soportados.
- No hay informacion sobre la latencia de inferencia en diferentes hardware, por lo que se recomienda realizar pruebas de rendimiento propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/Ornith-1.5-9B-AWQ-INT4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de cyankiwi: https://cyan.kiwi/
- Registro de modelos de cyankiwi: https://cyan.kiwi/models
