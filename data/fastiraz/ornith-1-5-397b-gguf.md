# Fastiraz/Ornith-1.5-397B-GGUF

## Resumen

Ornith-1.5-397B es el modelo insignia de la familia Ornith, desarrollado por el laboratorio ornith-ai. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con aproximadamente 397.000 millones de parámetros totales, diseñado específicamente para tareas agénticas y de ingeniería de software compleja. El modelo parte de una base construida sobre Qwen 3.5 y Gemma 4, a la que se aplicó un proceso de continued pretraining, mid-training y post-training, y se distingue por su bucle de auto-mejora de extremo a extremo: el propio modelo propone nuevas tareas, genera andamiajes (scaffolds) específicos para cada tarea y produce rollouts de soluciones que se utilizan para entrenamiento por refuerzo con GRPO.

Su relevancia actual radica en que alcanza resultados comparables a modelos propietarios de última generación como Claude Opus 4.8 en benchmarks de razonamiento agéntico y resolución de problemas de software, superando a otros modelos abiertos de escala similar como DeepSeek-V4-Flash-0731 y GLM-5.2. Con una ventana de contexto de 262.144 tokens y licencia MIT, se posiciona como una opción atractiva para equipos que necesitan un modelo abierto de alto rendimiento para automatización de tareas de programación y agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen 3.5 y Gemma 4 |
| Parametros totales | 402.941.918.464 (≈397B declarados) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF (varias), FP8, NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (en este repositorio), safetensors/FP8/NVFP4 en el repositorio original |

## Arquitectura y entrenamiento

Ornith-1.5-397B emplea una arquitectura MoE con 397.000 millones de parámetros totales, aunque no se ha publicado el número de parámetros activos por token. El modelo se construyó mediante continued pretraining sobre los modelos base Qwen 3.5 y Gemma 4, seguido de fases de mid-training y post-training. La innovación principal es el bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas diseñadas por humanos, el modelo genera nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). Este proceso optimiza conjuntamente la generación de tareas, la construcción de andamiajes y los rollouts de soluciones, lo que permite una mejora continua sin intervención manual.

## Capacidades

- Generación de texto y razonamiento complejo, especialmente orientado a tareas agénticas y de múltiples pasos.
- Resolución de problemas de software: capaz de editar código, ejecutar comandos en terminal y navegar por repositorios.
- Soporte de tool calling y function calling, integrable en flujos de agentes.
- Capacidad de auto-mejora: el modelo puede proponer nuevas tareas y generar sus propios andamiajes para resolverlas.
- Razonamiento multi-step y planificación, con buen rendimiento en benchmarks de terminal y SWE-bench.
- Multilingüe: no se han publicado los idiomas soportados, pero al derivar de Qwen 3.5 y Gemma 4, es probable que cubra un amplio espectro de lenguas.

## Casos de uso

- Automatización de resolución de issues en repositorios de código: el modelo puede analizar un issue, explorar el código, generar un parche y ejecutar pruebas, gracias a su capacidad de razonamiento agéntico y su ventana de contexto de 262K tokens.
- Agente de terminal para operaciones de DevOps: puede ejecutar comandos, interpretar salidas y tomar decisiones para desplegar, configurar o diagnosticar sistemas.
- Generación de código en producción: integrable en pipelines de CI/CD para generar tests, corregir bugs o refactorizar código, con soporte de tool calling para interactuar con APIs y sistemas externos.
- Asistente de programación en IDE: como copiloto avanzado que entiende el contexto completo del proyecto y sugiere cambios coherentes con la arquitectura existente.
- Investigación en auto-mejora de modelos: su diseño de bucle de auto-mejora lo convierte en una plataforma de estudio para técnicas de RL aplicadas a generación de tareas y scaffolds.
- Creación de agentes autónomos para tareas de ofimática o análisis de datos: puede razonar sobre datos, generar scripts y ejecutarlos para producir informes o visualizaciones.

## Benchmarks y rendimiento

Según la model card del autor, Ornith-1.5-397B obtiene los siguientes resultados en comparación con otros modelos:

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86.1 | 82.7 | 81 | 85 | 88.3 | 77.5 |
| Terminal-Bench 2.1 (Claude Code) | 85.2 | 81.8 | 82.7 | 78.9 | - | 78.2 |
| SWE-bench Verified | 86 | 81.6 | 83 | 85.8 | 86.2 | 82.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSWE | 56.0 | no disponible | no disponible | 59.0 | no disponible | no disponible |

El modelo supera a DeepSeek-V4-Flash-0731 y GLM-5.2 en Terminal-Bench y SWE-bench Verified, y se sitúa a la par de Claude Opus 4.8 en estos benchmarks, aunque por debajo de Kimi K3 en Terminal-Bench.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE de ~397B parámetros, incluso con cuantización de 4 bits (GGUF Q4_K_M) se requieren aproximadamente 200 GB de VRAM. Con FP8, el requisito sube a ~400 GB.
- GPU recomendadas: para ejecución local se necesitan múltiples GPUs de alta gama, por ejemplo 4× A100 80GB, 4× H100 80GB, o 8× RTX 4090 24GB (con cuantización agresiva). No cabe en una única GPU consumer.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se disponga de suficiente memoria agregada.
- Latencia y throughput: no se han publicado datos oficiales. En configuraciones multi-GPU con tensor parallelism, se puede esperar un throughput de decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Terminal-Bench 2.1 | SWE-bench Verified |
|---|---|---|---|---|---|
| Ornith-1.5-397B | 397B (MoE) | 262K | MIT | 86.1 | 86 |
| DeepSeek-V4-Flash-0731 | 284B (MoE) | no disponible | no disponible | 82.7 | 81.6 |
| GLM-5.2 | 753B (MoE) | no disponible | no disponible | 81 | 83 |
| Claude Opus 4.8 | no disponible (propietario) | no disponible | propietaria | 85 | 85.8 |

Ornith-1.5-397B ofrece un rendimiento superior a DeepSeek-V4-Flash-0731 y GLM-5.2 en los benchmarks de terminal y SWE-bench, con una licencia MIT que permite uso comercial sin restricciones, a diferencia de Claude Opus 4.8 que es propietario.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o comportamientos discriminatorios; como modelo entrenado sobre datos web, es probable que herede sesgos presentes en el corpus.
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente cuando se le pide generar código o comandos sin verificación externa.
- El tamaño del modelo (397B) hace que su despliegue sea costoso y requiera infraestructura de múltiples GPUs, lo que limita su uso en entornos con recursos reducidos.
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento puede degradarse en contextos muy largos si no se gestiona adecuadamente la memoria.
- No se ha especificado la lista de idiomas soportados; aunque probablemente cubra los principales, no hay garantía oficial.
- La licencia MIT permite uso comercial, pero es recomendable revisar los términos del repositorio original para confirmar que no hay cláusulas adicionales.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Fastiraz/Ornith-1.5-397B-GGUF
- Repositorio original del modelo: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Repositorio GitHub de Ornith: https://github.com/ornith-ai/Ornith-1
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en Tokenstead: https://tokenstead.ai/models/ornith-1-5-397b
