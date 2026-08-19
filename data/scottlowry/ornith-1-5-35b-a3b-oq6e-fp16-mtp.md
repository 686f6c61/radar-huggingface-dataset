# scottlowry/Ornith-1.5-35B-A3B-oQ6e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B es un modelo de codificación agéntica de código abierto desarrollado por Ornith AI, post-entrenado sobre la arquitectura Qwen3.5 MoE mediante un proceso de auto-mejora (self-scaffolding) que combina generación de tareas, scaffolds específicos y rollouts de soluciones para aprendizaje por refuerzo. El modelo presentado aquí, `scottlowry/Ornith-1.5-35B-A3B-oQ6e-fp16-mtp`, es una cuantización mixta de 6 bits realizada con la herramienta oQ (oMLX) sobre el modelo base, en formato MLX safetensors, orientada a su ejecución eficiente en hardware Apple Silicon.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 35B parámetros totales (con solo 3B activos por token) en equipos de consumo con memoria unificada, manteniendo un equilibrio entre calidad y rendimiento. El modelo base se posiciona como una alternativa open-source a soluciones propietarias de agentes de codificación, con capacidades de razonamiento multi-paso y generación de código autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE basada en Qwen3.5) |
| Parametros totales | 35B (modelo base, segun nombre) / 8.326.044.592 (parametros en safetensors cuantizados) |
| Parametros activos | 3B (A3B, segun nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 6-bit, group size 64, mixed-precision (fp16 para MTP) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

Nota: el repositorio contiene 31.0 GB de datos, correspondientes a los safetensors cuantizados y posiblemente archivos adicionales. La cuantizacion es de 6 bits, lo que reduce significativamente el tamano respecto al modelo original fp16.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5, con 35B parametros totales y 3B activos por token, lo que permite una inferencia eficiente. Segun la informacion publicada por Ornith AI, el entrenamiento se basa en un marco de "self-scaffolding" extendido a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este proceso continuo crea experiencias de aprendizaje nuevas a partir de las cuales el modelo mejora iterativamente.

La cuantizacion aplicada en este repositorio utiliza oQ (oMLX v0.6.2) con precision mixta: 6 bits con group size 64 para la mayoria de los pesos, y fp16 para el modulo MTP (Multi-Token Prediction). Esta combinacion busca preservar la calidad de las predicciones multi-token mientras se reduce el uso de memoria.

## Capacidades

- Generacion de codigo y completado de programas en multiples lenguajes.
- Razonamiento multi-paso y planificacion de tareas complejas.
- Generacion de scaffolds (estructuras de codigo auxiliares) para resolver problemas especificos.
- Capacidad de auto-mejora: el modelo puede proponer nuevas tareas y generar sus propios datos de entrenamiento.
- Soporte de tool calling y function calling (esperado por su naturaleza agente, aunque no confirmado en la documentacion disponible).
- Ejecucion como agente autonomo en flujos de trabajo de desarrollo de software.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede generar funciones, clases y modulos completos a partir de descripciones en lenguaje natural, integrandose en IDEs o pipelines de CI/CD.
- Agentes de codificacion autonomos: gracias a su capacidad de self-scaffolding, puede descomponer tareas grandes en subtareas, generar codigo auxiliar y ejecutar soluciones de forma iterativa.
- Generacion de tests unitarios y de integracion: el modelo puede crear casos de prueba a partir del codigo fuente, reduciendo el trabajo manual de los desarrolladores.
- Refactorizacion de codigo legacy: con su contexto largo (aunque no especificado) y razonamiento multi-paso, puede analizar y reestructurar codigo existente.
- Educacion y formacion en programacion: puede explicar fragmentos de codigo, proponer ejercicios y evaluar soluciones de estudiantes.
- Prototipado rapido: para equipos que necesitan validar ideas en horas, el modelo puede generar codigo de ejemplo funcional que luego se itera manualmente.

## Benchmarks y rendimiento

Segun benchlm.ai, el modelo base Ornith-1.5-35B-A3B obtiene una puntuacion publica estimada de 49.27/100, ocupando el puesto 134 de 221 modelos evaluados. Sin embargo, esta puntuacion es estimada y no se basan en benchmarks estandar como MMLU, HumanEval o GSM8K. No se han publicado resultados detallados de benchmarks en la informacion disponible para esta cuantizacion concreta.

## Requisitos de hardware

- Al ser un formato MLX, esta optimizado para Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada.
- El tamano del repositorio es de 31 GB, pero los pesos cuantizados a 6 bits ocupan aproximadamente 6-7 GB (estimacion a partir de los 8.3B parametros cuantizados). Se recomienda un minimo de 16 GB de RAM unificada para ejecutar el modelo con margen.
- En Macs con 32 GB o 64 GB de RAM unificada, el modelo puede ejecutarse con espacio para el contexto y las activaciones.
- No se dispone de datos de latencia o throughput especificos para esta cuantizacion.
- Para despliegue en servidores, se podria convertir a otros formatos (GGUF, etc.) aunque no se proporcionan en este repositorio.
- Herramientas compatibles: oMLX, MLX-LM, y cualquier framework que soporte MLX safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B (3B activos) | no disponible | no disponible | original | Modelo base sin cuantizar |
| Ornith-1.0-35B | 35B | no disponible | no disponible | original | Version anterior, tambien agente de codificacion |
| Qwen3.5 (base) | no disponible | no disponible | no disponible | original | Arquitectura subyacente |

No se dispone de datos suficientes para una comparativa completa con alternativas como DeepSeek-Coder, CodeLlama o StarCoder, ya que no hay informacion de benchmarks estandar ni licencia.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de utilizarlo en produccion.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de codificacion, puede generar codigo incorrecto o inseguro si no se supervisa.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar su comportamiento en tareas con contextos muy largos.
- La cuantizacion a 6 bits puede degradar ligeramente la calidad respecto al modelo fp16 original, especialmente en tareas de razonamiento complejo.
- El modelo esta pensado para Apple Silicon; no hay versiones para CUDA o ROCm en este repositorio.
- La puntuacion de benchlm es estimada y no debe tomarse como referencia definitiva de rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
- Benchmark estimado en benchlm.ai: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
