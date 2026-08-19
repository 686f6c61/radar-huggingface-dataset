# ornith-ai/Ornith-1.0-9B-GGUF

## Resumen

Ornith-1.0-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros desarrollado por ornith-ai, especializado en tareas de codificación agéntica. Forma parte de la familia Ornith-1.0, que incluye variantes densas de 9B y 31B, y variantes MoE de 35B y 397B, todas post-entrenadas sobre Gemma 4 y Qwen 3.5. El modelo destaca por su framework de auto-mejora basado en aprendizaje por refuerzo, que optimiza conjuntamente el andamiaje (scaffold) y la solución generada, lo que le permite descubrir trayectorias de búsqueda más eficaces.

Con una ventana de contexto de 262 144 tokens (256K), este modelo está diseñado para desplegarse en una única GPU de 80 GB, lo que lo hace adecuado para entornos de producción con recursos limitados. Su licencia MIT permite uso comercial sin restricciones regionales. En benchmarks de codificación agéntica como Terminal-Bench 2.1 y SWE-Bench Verified, alcanza resultados comparables o superiores a modelos mucho más grandes, como Gemma 4-31B, demostrando que es posible obtener capacidades sólidas de agente de codificación en un formato compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~9 000 millones (9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | no disponible (repo GGUF con multiples cuantizaciones, no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); safetensors para el modelo base |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentacion publica, aunque al ser un modelo de texto generativo servido con la libreria transformers, se asume un transformer decoder-only. El entrenamiento se basa en un framework propietario de auto-mejora: mediante aprendizaje por refuerzo, el modelo aprende a generar no solo soluciones (rollouts), sino tambien el andamiaje (scaffold) que guia esos rollouts. Al optimizar de forma conjunta el scaffold y la solucion resultante, el modelo descubre mejores trayectorias de busqueda y produce soluciones de mayor calidad.

El modelo esta post-entrenado sobre las familias Gemma 4 y Qwen 3.5, aunque no se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Toda la familia Ornith-1.0 comparte el mismo framework de entrenamiento y una interfaz compatible con OpenAI.

## Capacidades

- Generacion de codigo y razonamiento agente: disenado especificamente para tareas de codificacion agente, incluyendo resolucion de issues en repositorios, edicion de multiples archivos y ejecucion de comandos en terminal.
- Soporte de tool calling y function calling: integrable en pipelines que requieren invocacion de herramientas externas, gracias a su interfaz compatible con OpenAI.
- Razonamiento multi-paso: capaz de planificar y ejecutar secuencias de acciones complejas, como las requeridas en benchmarks de tipo SWE-Bench.
- Contexto largo: ventana de 256K tokens que permite procesar repositorios completos o conversaciones extensas sin perder informacion relevante.
- Capacidades multilingues: no disponibles en la documentacion publica.
- Modo de pensamiento o vision: no disponible.

## Casos de uso

- Asistente de codificacion en entornos con recursos limitados: al ser un modelo denso de 9B, puede desplegarse en una unica GPU de 80 GB o incluso en GPUs de consumo con cuantizacion, ofreciendo capacidades de agente de codificacion en estaciones de trabajo locales.
- Automatizacion de tareas de terminal: el modelo puede interpretar comandos, ejecutar scripts y resolver errores de compilacion o ejecucion, como demuestra su rendimiento en Terminal-Bench 2.1.
- Resolucion de issues en repositorios: con una puntuacion de 69.4 en SWE-Bench Verified, es adecuado para integrarse en flujos de trabajo de mantenimiento de codigo, generando parches y pull requests de forma autonoma.
- Agentes de desarrollo en CI/CD: su soporte de tool calling permite conectarlo a sistemas de integracion continua para revisar cambios, ejecutar tests y proponer correcciones automaticamente.
- Prototipado rapido de aplicaciones: puede generar codigo desde descripciones en lenguaje natural, acelerando la creacion de esqueletos de aplicaciones o funciones especificas.
- Educacion y formacion en programacion: su capacidad para razonar sobre problemas de codigo y explicar soluciones lo hace util como tutor interactivo en entornos de aprendizaje.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor para Ornith-1.0-9B y modelos comparables. Los datos provienen de la model card oficial.

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.5-35B | Gemma4-12B | Gemma4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 43.1 | 21.3 | 41.4 | 21.0 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 40.6 | 18.9 | 38.9 | - | - |
| SWE-bench Verified | 69.4 | 53.2 | 70.0 | 44.2 | 52.0 |
| SWE-bench Pro | 42.9 | 31.3 | 44.6 | 27.6 | 35.7 |

No se han publicado resultados para benchmarks generales de lenguaje (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 19 GB, por lo que cabe en una GPU de 80 GB (p. ej. A100, H100) sin necesidad de sharding. Con cuantizacion GGUF (p. ej. Q4_K_M), el peso se reduce a unos 5-6 GB, permitiendo su ejecucion en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 de 12 GB.
- GPU recomendadas: para inferencia sin cuantizar, A100 80GB o H100. Para cuantizacion, RTX 4090 (24 GB) o superior.
- Despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, todos ellos con interfaz OpenAI-compatible. El repo GGUF permite uso directo con llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la documentacion publica.

## Comparativa con modelos similares

Ornith-1.0-9B compite directamente con modelos densos de tamano similar orientados a codificacion, como Qwen3.5-9B y Gemma4-12B, asi como con modelos mas grandes como Qwen3.5-35B y Gemma4-31B. En los benchmarks de codificacion agente publicados, Ornith-1.0-9B supera claramente a Qwen3.5-9B y Gemma4-12B, y se acerca o iguala a modelos de 31-35B en varias metricas. Su ventaja principal es la combinacion de tamano compacto, contexto largo (256K) y licencia MIT, lo que lo hace atractivo para despliegues en una sola GPU sin restricciones comerciales. Qwen3.5-35B ofrece un rendimiento ligeramente superior en SWE-bench Pro, pero requiere mas recursos. Gemma4-31B tiene una licencia mas restrictiva (Gemma Terms of Use) y un contexto menor (no especificado en la informacion disponible).

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o toxicidad para este modelo; como cualquier LLM entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: al ser un modelo de generacion de texto, puede producir codigo incorrecto o inventar APIs inexistentes, especialmente en tareas fuera de su dominio principal.
- Limitaciones de contexto: aunque soporta 256K tokens, el rendimiento en contextos muy largos puede degradarse; no se han publicado estudios sobre la atencion en ventanas extremas.
- Idiomas: no se especifican los idiomas soportados; es probable que el entrenamiento se haya centrado en ingles, dado su enfoque en codificacion.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base (Gemma 4 y Qwen 3.5) puede tener sus propias condiciones; se recomienda revisar las licencias de los modelos base.
- Para produccion: se recomienda validar el rendimiento en el dominio especifico antes de desplegarlo, especialmente en tareas de codificacion criticas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ornith-ai/Ornith-1.0-9B-GGUF
- Repositorio HuggingFace (modelo base): https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio GitHub: https://github.com/ornith-ai/Ornith-1
- Blog del modelo: https://ornith.ai/ornith_1_0.html
- Sitio web de Ornith AI: https://ornith.ai/
