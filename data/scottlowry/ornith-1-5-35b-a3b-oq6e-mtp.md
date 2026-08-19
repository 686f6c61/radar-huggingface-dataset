# scottlowry/Ornith-1.5-35B-A3B-oQ6e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ6e-mtp es una cuantización mixta de 6 bits del modelo Ornith-1.5-35B-A3B, desarrollada por Scott Lowry mediante la herramienta oQ (oMLX v0.6.2). El modelo base, creado por Ornith AI, es un modelo de lenguaje de arquitectura MoE (mixture of experts) con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos, orientado a tareas de codificación agéntica y razonamiento multi-paso. Esta versión cuantizada está optimizada para ejecutarse en dispositivos Apple Silicon mediante la librería MLX, lo que permite desplegar el modelo en hardware de consumo con requisitos de memoria reducidos.

La relevancia de esta ficha radica en que el modelo base introduce un enfoque de auto-mejora (self-scaffolding y self-improvement) que combina generación de tareas, scaffolds específicos y aprendizaje por refuerzo, una línea de investigación emergente en la comunidad open source. La cuantización a 6 bits con group size 64 reduce el peso del modelo a 30,2 GB, manteniendo un equilibrio entre calidad y eficiencia para su uso local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, similar a Qwen3-30B-A3B) |
| Parametros totales | 35.000.000.000 (nominal) / 8.326.044.592 (en safetensors cuantizado) |
| Parametros activos | 3.000.000.000 (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado con oQ) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE (mixture of experts) con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos por token, siguiendo el diseño de Qwen3.5 MoE. Según la documentación de Ornith AI, el entrenamiento incorpora un marco de auto-mejora (self-scaffolding) que se extiende a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. Este proceso permite que el modelo cree continuamente nuevas experiencias de aprendizaje a partir de las cuales mejorar.

La cuantización oQ aplicada en esta versión utiliza precisión mixta de 6 bits con un group size de 64, lo que reduce significativamente el tamaño del modelo (de los pesos originales a 30,2 GB en el repositorio) manteniendo un rendimiento cercano al de la versión completa. El formato MLX safetensors está diseñado para la inferencia eficiente en hardware Apple Silicon mediante la librería MLX.

## Capacidades

- Generacion de codigo y razonamiento agéntico: el modelo está diseñado para tareas de codificación complejas, incluyendo generación de código, refactorización y depuración, con capacidad de planificación multi-paso.
- Auto-mejora y scaffolding: puede proponer tareas, generar scaffolds específicos y producir soluciones, lo que lo hace adecuado para entornos de aprendizaje continuo y RL.
- Soporte de tool calling: se infiere de su orientación a codificación agéntica, aunque no hay confirmación explícita en la información disponible.
- Razonamiento multi-paso: la arquitectura MoE con 3B activos permite un razonamiento profundo sin consumir excesivos recursos.
- Multilingüismo: no confirmado, aunque es probable que herede capacidades multilingües de la familia Qwen, pero no se dispone de datos concretos.
- Ejecución local eficiente: gracias a la cuantización MLX, puede ejecutarse en Mac con Apple Silicon sin necesidad de GPU dedicada.

## Casos de uso

- Asistente de codigo en local: desarrolladores que trabajan en entornos aislados pueden usar el modelo para autocompletar, revisar y refactorizar código directamente en su Mac, gracias a la cuantización MLX que permite ejecutarlo en memoria unificada.
- Agente de automatizacion de tareas de programacion: integrado en pipelines de CI/CD, el modelo puede generar scaffolds de proyectos, escribir pruebas unitarias y proponer correcciones de bugs de forma autónoma.
- Entorno de aprendizaje por refuerzo: investigadores pueden utilizar el modelo base (no cuantizado) para experimentar con el bucle de auto-mejora, generando tareas y soluciones sintéticas para entrenar modelos más pequeños.
- Prototipado rapido de aplicaciones con IA: al ejecutarse en Apple Silicon con MLX, permite iterar rápidamente en el desarrollo de aplicaciones de generación de código sin depender de servicios en la nube.
- Educacion y formacion en programacion: el modelo puede generar explicaciones detalladas de algoritmos, proponer ejercicios personalizados y evaluar soluciones de estudiantes, aunque su licencia no está confirmada.
- Investigacion en arquitecturas MoE: al ser una variante cuantizada de un MoE, sirve como referencia para estudiar el impacto de la cuantización mixta en el rendimiento de modelos con activación por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los enlaces a benchlm.ai sugieren que existe un seguimiento del modelo, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Se recomienda consultar el repositorio de Ornith AI para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo cuantizado a 6 bits con 30,2 GB de peso, se recomienda al menos 32 GB de memoria unificada en Apple Silicon, siendo 64 GB lo ideal para margen de contexto y overhead del sistema.
- GPU compatibles: exclusivamente Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) gracias al formato MLX. No es compatible directamente con CUDA.
- Opciones de despliegue: mediante la librería MLX de Apple, con soporte para generación de texto y posible integración en aplicaciones Swift o Python.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un MoE con 3B activos, la inferencia debería ser rápida en chips con suficiente ancho de banda de memoria (M2 Ultra o superior).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | no disponible | no disponible | safetensors (BF16) |
| Qwen3-30B-A3B | 30B | 3B | 128K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V3-Lite | 16B | 2.4B | 128K | MIT | safetensors, GGUF |

La comparativa se basa en modelos MoE de tamaño similar. Ornith-1.5-35B-A3B tiene más parámetros totales que Qwen3-30B-A3B pero la misma cantidad de activos (3B), lo que sugiere un rendimiento comparable en inferencia. La licencia de Ornith no está confirmada, mientras que Qwen3 y DeepSeek ofrecen licencias permisivas. El contexto no se ha publicado para Ornith.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el modelo permite uso comercial o tiene restricciones. Se recomienda contactar con Ornith AI antes de utilizarlo en producción.
- Idiomas no confirmados: aunque probablemente herede capacidades multilingües de la familia Qwen, no hay garantía de soporte para español u otros idiomas.
- Sesgos y alucinaciones: al ser un modelo entrenado con datos web, puede presentar sesgos sociales y generar contenido falso. No se han publicado evaluaciones de seguridad.
- Contexto limitado: no se ha especificado la longitud de contexto del modelo base, lo que puede ser un problema para tareas que requieran ventanas largas.
- Dependencia de MLX: la cuantización está ligada al ecosistema MLX, lo que limita su uso a Apple Silicon y dificulta la migración a otras plataformas sin reconversión.
- Riesgo de degradación por cuantización: la cuantización a 6 bits puede afectar al rendimiento en tareas de razonamiento complejo, aunque el group size de 64 mitiga parcialmente este efecto.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
- Seguimiento de benchmarks: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
