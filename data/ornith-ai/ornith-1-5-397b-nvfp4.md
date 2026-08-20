# ornith-ai/Ornith-1.5-397B-NVFP4

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de gran escala desarrollado por ornith-ai, presentado como el buque insignia de la familia Ornith-1.5. Se trata de un modelo de arquitectura mixture-of-experts (MoE) construido sobre las bases de Qwen3.5 y Gemma4, con capacidades multimodales (imagen y texto) y orientado principalmente a tareas de agente y codificacion. Su principal innovacion es un bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye los andamiajes (scaffolds) necesarios para resolverlas y produce los rollouts de soluciones que se utilizan para el aprendizaje por refuerzo, en lugar de depender de tareas fijas curadas por humanos.

El modelo se distribuye en varias cuantizaciones, siendo esta version concreta la NVFP4 (flotante de 4 bits), que reduce el peso del repositorio a 238 GB frente a los aproximadamente 800 GB de la version en bf16. Segun los datos publicados por el autor, alcanza una puntuacion de 86.1 en Terminal-Bench 2.1 y 56.0 en DeepSWE, situandose a la par con Claude Opus 4.8 y superando a otros modelos abiertos de escala similar como GLM-5.2 o DeepSeek-V4-Flash-0731. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opcion atractiva para equipos que necesitan un modelo de agente de alto rendimiento con despliegue propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) basada en Qwen3.5 y Gemma4, multimodal (imagen-texto) |
| Parametros totales | 397B (segun el autor); 203.528.832.496 parametros en safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit, esta version), FP8, INT4 (variantes publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Ornith-1.5-397B es un modelo MoE con aproximadamente 397.000 millones de parametros totales, aunque el archivo safetensors de esta version NVFP4 contiene 203.5 mil millones de parametros, lo que sugiere que una parte significativa corresponde a parametros compartidos o no activos. La arquitectura hereda el diseño de Qwen3.5 y Gemma4, e incorpora un encoder visual para procesar imagenes, como indican las etiquetas `image-text-to-text` y `qwen3_5_moe`. El modelo esta entrenado para generacion de texto conversacional y tareas de agente.

El proceso de entrenamiento es la principal novedad. Ornith-1.5 extiende el marco de auto-andamiaje de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera los scaffolds especificos para cada tarea y produce los rollouts de soluciones que alimentan el aprendizaje por refuerzo. Este ciclo continuo permite que el modelo cree sus propias experiencias de aprendizaje sin depender de conjuntos de datos fijos. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO; la informacion disponible se limita a la descripcion conceptual del proceso.

## Capacidades

- Generacion de texto y conversacion multimodal: procesa entradas de imagen y texto, y genera respuestas de texto.
- Razonamiento y resolucion de problemas complejos, especialmente en entornos de terminal y tareas de ingenieria de software.
- Codificacion avanzada: capaz de manejar tareas de SWE-bench, incluyendo reparacion de bugs, implementacion de features y refactorizacion.
- Uso de herramientas y llamada a funciones (tool calling), integrable en pipelines de agentes.
- Ejecucion de tareas de agente multi-paso: navegacion por terminal, ejecucion de comandos, lectura de archivos y planificacion de acciones.
- Auto-mejora: el modelo puede generar sus propias tareas y scaffolds, lo que lo hace util para entornos de investigacion en aprendizaje por refuerzo.

## Casos de uso

- Automatizacion de tareas de desarrollo de software: el modelo puede recibir un repositorio, analizar issues y generar pull requests con cambios de codigo, aprovechando su alto rendimiento en SWE-bench Verified (86) y SWE-bench Pro.
- Agente de terminal para operaciones de sistemas: gracias a su puntuacion de 86.1 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de linea de comandos, util para automatizar tareas de administracion.
- Asistente de codigo en IDE con contexto multimodal: al aceptar imagenes, puede analizar capturas de pantalla de errores o diagramas de arquitectura y sugerir soluciones de codigo.
- Pipeline de CI/CD con generacion de tests: el modelo puede generar casos de prueba, ejecutarlos y corregir fallos de forma autonoma, integrándose en flujos de integracion continua.
- Investigacion en auto-mejora de modelos: su capacidad para generar tareas y scaffolds lo convierte en una plataforma ideal para experimentos de aprendizaje por refuerzo y curriculum learning.
- Despliegue de asistentes conversacionales con licencia permisiva: al ser MIT, puede integrarse en productos comerciales sin coste de licencia, siempre que se disponga del hardware necesario.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card publicada por el autor. No han sido verificados de forma independiente.

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86.1 | 82.7 | 81 | 85 | 88.3 | 77.5 |
| Terminal-Bench 2.1 (Claude Code) | 85.2 | 81.8 | 82.7 | 78.9 | - | 78.2 |
| SWE-bench Verified | 86 | 81.6 | 83 | 85.8 | 86.2 | 82.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSWE | 56.0 | no disponible | no disponible | 59.0 | no disponible | no disponible |

No se han publicado resultados para benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- La version en bf16 ocupa aproximadamente 800 GB, por lo que requiere multiples GPU de alta gama. La guia oficial recomienda 8× H200 141GB con tensor parallelism de 8.
- Esta version NVFP4 reduce el peso a 238 GB, lo que permite desplegarlo en 3-4 GPU de 80 GB (por ejemplo, A100 80GB o H100 80GB) con tensor parallelism.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) ni en una sola GPU profesional de 48 GB; se necesita un nodo multi-GPU.
- Opciones de despliegue: vLLM, TensorRT-LLM (dado el uso de ModelOpt para cuantizacion), y transformers con soporte para MoE. No se menciona compatibilidad con llama.cpp u Ollama.
- La latencia y el throughput dependen del hardware y de la configuracion de tensor parallelism; no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-397B | 397B (MoE) | no disponible | 86 | 86.1 | MIT |
| DeepSeek-V4-Flash-0731 | 284B (MoE) | no disponible | 81.6 | 82.7 | no disponible |
| GLM-5.2 | 753B (MoE) | no disponible | 83 | 81 | no disponible |
| Claude Opus 4.8 | no disponible (propietario) | no disponible | 85.8 | 85 | propietaria |

Ornith-1.5-397B se posiciona como el modelo abierto mas competitivo en tareas de agente frente a alternativas propietarias, con una licencia MIT que lo diferencia de otros modelos abiertos con restricciones. Su principal desventaja es el elevado requisito de hardware, aunque la cuantizacion NVFP4 alivia parcialmente este problema.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad; el modelo no ha sido auditado de forma independiente.
- La informacion sobre el contexto maximo, los idiomas soportados y los parametros activos no esta disponible, lo que dificulta la planificacion de despliegues en produccion.
- El rendimiento reportado en benchmarks proviene exclusivamente del autor y podria no reproducirse en entornos reales.
- Aunque la licencia MIT permite uso comercial, el coste de hardware para inferencia es elevado (minimo 3-4 GPU de 80 GB incluso en cuantizacion NVFP4).
- Al ser un modelo multimodal, requiere un encoder visual adicional, lo que incrementa la complejidad del despliegue.
- No se garantiza la estabilidad del modelo en tareas fuera del dominio de codificacion y agentes, para las que fue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-397B-NVFP4
- Version FP8: https://huggingface.co/ornith-ai/Ornith-1.5-397B-FP8
- Coleccion de modelos Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog tecnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.online/
