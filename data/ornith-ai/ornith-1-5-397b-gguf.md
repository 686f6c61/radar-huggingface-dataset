# ornith-ai/Ornith-1.5-397B-GGUF

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 396 346 350 336 parámetros totales (aproximadamente 397B), desarrollado por Ornith AI. Es la variante principal de la familia Ornith-1.5, que introduce un bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas y harnesses diseñados manualmente, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y optimiza su política mediante aprendizaje por refuerzo. Está orientado a tareas de razonamiento, agénticas y de codificación, y según los benchmarks publicados rinde a la par de Claude Opus 4.8 en Terminal-Bench 2.1 y DeepSWE, superando a otros modelos open-source de escala similar como GLM-5.2 y DeepSeek-V4-Flash-0731. El modelo se distribuye en formato GGUF, lo que facilita su despliegue local con herramientas como llama.cpp u Ollama, aunque su tamaño exige hardware de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 396 346 350 336 (396B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el repo original incluye safetensors) |

## Arquitectura y entrenamiento

Ornith-1.5-397B es un modelo MoE con 396B parametros totales. No se detallan el numero de expertos, la dimension de los mismos ni otros hiperparametros de arquitectura en la informacion disponible. El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo: el modelo genera sus propias tareas de entrenamiento, construye scaffolds (harnesses) y produce rollouts de soluciones, todo ello optimizado mediante aprendizaje por refuerzo. Este enfoque extiende el de Ornith-1.0, que solo optimizaba scaffold y rollout, anadiendo la generacion de tareas. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento general.
- Codificacion agente: resolucion de tareas en terminal, edicion de codigo, uso de herramientas y ejecucion de comandos.
- Soporte de tool calling / function calling, implicito en benchmarks como Terminal-Bench.
- Capacidades multilingues: no especificadas.
- Auto-mejora durante el entrenamiento, aunque no se indica si esta capacidad esta disponible en inferencia.

## Casos de uso

- Resolucion de issues en repositorios de software: el modelo puede analizar un issue, explorar el codigo fuente, generar un parche y ejecutar tests para validarlo, gracias a su capacidad de razonamiento agente y su rendimiento en SWE-bench Verified (86).
- Automatizacion de tareas de terminal: puede interpretar comandos, ejecutarlos, analizar salidas y tomar decisiones en entornos de linea de comandos, como demuestra su puntuacion en Terminal-Bench 2.1 (86.1).
- Asistente de programacion en IDE: integrado como copiloto, puede generar codigo, refactorizar, explicar fragmentos y sugerir correcciones en tiempo real.
- Agente de desarrollo autonomo en pipelines CI/CD: puede revisar pull requests, proponer cambios, validar builds y gestionar tareas de integracion continua.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en flujos de trabajo de desarrollo para generar modulos, tests o documentacion.
- Investigacion en IA: como modelo open-source con licencia MIT, permite estudiar tecnicas de auto-mejora, aprendizaje por refuerzo y diseno de MoE a gran escala.

## Benchmarks y rendimiento

Segun la model card del autor, los resultados en benchmarks de codificacion son los siguientes:

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86.1 | 82.7 | 81 | 85 | 88.3 | 77.5 |
| Terminal-Bench 2.1 (Claude Code) | 85.2 | 81.8 | 82.7 | 78.9 | - | 78.2 |
| SWE-bench Verified | 86 | 81.6 | 83 | 85.8 | 86.2 | 82.4 |
| SWE-bench Pro | 65.1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSWE | 56.0 | no disponible | no disponible | 59.0 | no disponible | no disponible |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 396B parametros, por lo que requiere multiples GPUs de alta gama para inferencia.
- En precision FP16, el peso ocuparia aproximadamente 793 GB, lo que exige al menos 10 GPUs de 80 GB (por ejemplo, A100 o H100).
- Con cuantizacion GGUF de 4 bits, el peso se reduce a unos 200 GB, permitiendo su ejecucion en 3-4 GPUs de 80 GB, aunque no se especifican las variantes de cuantizacion disponibles.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) ni en una sola GPU profesional de 48 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI, entre otros.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-397B | 396B (MoE) | no disponible | 86.1 | 86 | MIT |
| DeepSeek-V4-Flash-0731 | 284B (MoE) | no disponible | 82.7 | 81.6 | no disponible |
| GLM-5.2 | 753B (MoE) | no disponible | 81 | 83 | no disponible |
| Claude Opus 4.8 | no disponible (propietario) | no disponible | 85 | 85.8 | Propietaria |

Ornith-1.5-397B supera a DeepSeek-V4-Flash-0731 y GLM-5.2 en los benchmarks de codificacion publicados, y se acerca a Claude Opus 4.8, con la ventaja de ser open-source con licencia MIT.

## Limitaciones y advertencias

- No se especifican sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Al ser un modelo de codificacion, puede generar codigo incorrecto, inseguro o con vulnerabilidades; se recomienda revision humana en entornos de produccion.
- Riesgo de alucinacion en tareas de razonamiento o generacion de texto, no cuantificado.
- No se indica la longitud de contexto, lo que limita la planificacion de despliegues para tareas con ventanas largas.
- Idiomas soportados no especificados; probablemente optimizado para ingles.
- El tamaño del modelo (396B) implica costes de hardware y energia significativos, no apto para despliegues en edge o dispositivos de bajo consumo.
- La licencia MIT permite uso comercial, pero se debe verificar que los pesos no tengan restricciones adicionales (no se indica ninguna).

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-397B-GGUF
- Repositorio HuggingFace (original, safetensors): https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web de Ornith AI: https://ornith.ai/
- Guia de Ornith AI: https://ornith.online/
- Ornith-1.0-397B: https://huggingface.co/ornith-ai/Ornith-1.0-397B
