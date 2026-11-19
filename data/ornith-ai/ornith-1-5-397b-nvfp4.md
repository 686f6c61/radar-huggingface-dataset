# ornith-ai/Ornith-1.5-397B-NVFP4

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por ornith-ai, presentado como el miembro insignia de la familia Ornith-1.5. La versión documentada en esta ficha es la cuantización NVFP4 de 8 bits (etiqueta `modelopt`, `8-bit`), publicada en Hugging Face bajo el identificador `ornith-ai/Ornith-1.5-397B-NVFP4`. El modelo se construye sobre Ornith-1.0, que a su vez parte de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-entrenamiento adicionales.

La propuesta central de Ornith-1.5 es un bucle de auto-mejora de extremo a extremo: en lugar de depender de un conjunto fijo de tareas curadas por humanos y de arneses diseñados manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la política mediante aprendizaje por refuerzo. Este enfoque se orienta a capacidades agénticas y de ingeniería de software, terreno en el que el modelo declara resultados competitivos con Claude Opus 4.8 en Terminal-Bench 2.1 y DeepSWE.

El modelo soporta entrada image-text-to-text (según los tags del repositorio) y generación de texto conversacional, con licencia MIT. El repositorio ocupa 557,5 GB y acumula más de 524.000 descargas, lo que indica una adopción significativa pese a su reciente publicación (agosto de 2026, actualizado en octubre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 202.642.785.776 (~202,6B según safetensors); la model card denomina al modelo "397B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8 bits, `modelopt`); el repositorio base ofrece pesos completos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), etiquetado en el repositorio como `qwen3_5_moe`, lo que sugiere una base derivada de Qwen3.5. El modelo es multimodal: acepta entradas de imagen y texto (`image-text-to-text`). La model card describe la evolución desde Ornith-1.0, desarrollado sobre Qwen3.5 y Gemma4 mediante preentrenamiento continuado, mid-training y post-entrenamiento.

La innovación metodológica declarada es la ampliación del bucle de auto-mejora: Ornith-1.5 optimiza conjuntamente la generación de tareas, la construcción de arneses (scaffolds) y los rollouts de soluciones, en lugar de limitarse a la optimización de arneses y rollouts sobre tareas fijas. El modelo genera nuevas tareas de entrenamiento, descubre estrategias de resolución y mejora la política mediante aprendizaje por refuerzo. La model card remite al blog del autor para detalles sobre el diseño de tareas, arneses y recompensas de rollout. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO más allá del bucle de RL descrito.

Nota importante: existe una discrepancia entre el nombre comercial ("397B"), el recuento de parámetros de safetensors (~202,6B) y el tamaño del repositorio (557,5 GB). No se dispone de información que permita reconciliar estas cifras; podría tratarse de un recuento parcial, de parámetros activos o de una denominación de familia. Se recomienda verificar antes de dimensionar infraestructura.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento agéntico orientado a terminal y línea de comandos (Terminal-Bench 2.1).
- Ingeniería de software: resolución de issues y parches sobre repositorios reales (SWE-bench Verified, SWE-bench Pro, DeepSWE).
- Entrada multimodal de imagen y texto (según tags del repositorio); el alcance exacto de las capacidades de visión no está detallado en la información disponible.
- Uso en arneses agénticos tipo Claude Code y Terminus-2, según los benchmarks reportados.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo obtiene 86,1 en Terminal-Bench 2.1 (Terminus-2), por lo que es adecuado para agentes que ejecutan comandos, depuran entornos y resuelven incidencias de infraestructura de forma autónoma en pipelines de CI/CD.
- Resolución automática de issues en repositorios: con 86,0 en SWE-bench Verified, puede integrarse en flujos que reciben un issue, localizan el código relevante y proponen un parche verificable, reduciendo el trabajo manual de triaje.
- Asistente de programación en IDE o CLI: su rendimiento en Terminal-Bench con el arnés Claude Code (85,2) lo hace apto para asistentes que operan sobre el sistema de ficheros y herramientas de desarrollo.
- Refactorización y migración de código a gran escala: la ventana de contexto no está documentada, pero el perfil agéntico y los resultados en SWE-bench Pro sugieren uso en tareas multi-fichero con verificación por tests.
- Procesamiento de documentación técnica con imágenes: al aceptar entradas image-text-to-text, puede extraer información de diagramas, capturas de pantalla o documentación escaneada en flujos de soporte técnico.
- Generación de datos sintéticos y auto-mejora: el diseño del modelo (generación de tareas y rollouts con RL) permite emplearlo como generador de tareas y evaluador en pipelines internos de entrenamiento.
- Agentes de atención al cliente técnica: combinando conversación multi-turno y capacidad de invocar herramientas, puede gestionar incidencias con contexto de sistemas y documentación.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente). La tabla original está truncada en la información disponible; se recogen las filas completas.

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86,1 | 82,7 | 81 | 85 | 88,3 | 77,5 |
| Terminal-Bench 2.1 (Claude Code) | 85,2 | 81,8 | 82,7 | 78,9 | - | 78,2 |
| SWE-bench Verified | 86 | 81,6 | 83 | 85,8 | 86,2 | 82,4 |
| SWE-bench Pro | truncado | truncado | truncado | truncado | truncado | truncado |
| DeepSWE | 56,0 | no disponible | no disponible | 59,0 | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general.

## Requisitos de hardware

- VRAM estimada: el repositorio NVFP4 ocupa 557,5 GB, por lo que la inferencia requiere al menos ~560 GB de memoria agregada en el formato publicado.
- GPU recomendadas: para servir los pesos NVFP4 en su totalidad se necesitan múltiples aceleradores de datacenter (H100/H200/B200 con NVFP4 nativo, o A100 en configuraciones multi-GPU). No cabe en una GPU de consumo.
- GPU de consumo: no es viable con los pesos NVFP4 publicados; requeriría cuantizaciones adicionales (GGUF/AWQ/GPTQ) no disponibles en la información proporcionada.
- Opciones de despliegue: compatible con `transformers`; el tag `endpoints_compatible` sugiere despliegue en Hugging Face Inference Endpoints. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 (Terminus-2) | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-397B | ~202,6B (safetensors) / "397B" nominal | no disponible | 86,1 | 86 | MIT | Hugging Face |
| DeepSeek-V4-Flash-0731 | 284B | no disponible | 82,7 | 81,6 | no disponible | no disponible |
| GLM-5.2 | 753B | no disponible | 81 | 83 | no disponible | no disponible |
| Kimi K3 | 2,8T | no disponible | 88,3 | 86,2 | no disponible | no disponible |
| Claude Opus 4.8 | no disponible | no disponible | 85 | 85,8 | propietaria | API |

Ornith-1.5-397B destaca por ofrecer resultados cercanos a modelos de mayor tamaño (Kimi K3, 2,8T) y a Claude Opus 4.8 con licencia MIT y pesos abiertos, lo que facilita su autoalojamiento.

## Limitaciones y advertencias

- Discrepancia de cifras: el nombre comercial (397B), el recuento de safetensors (~202,6B) y el tamaño del repositorio (557,5 GB) no son coherentes entre sí; verificar antes de planificar hardware.
- Los benchmarks son autoinformados por el autor y no se han verificado de forma independiente; la tabla de la model card está truncada en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano sin evaluación propia.
- Longitud de contexto no disponible: limita la planificación de cargas con documentos largos o repositorios extensos.
- La licencia MIT permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio base y las licencias heredadas de Qwen3.5 y Gemma4, dado que el modelo deriva de ellos.
- El tamaño de despliegue (557,5 GB en NVFP4) exige infraestructura multi-GPU de datacenter; no es apto para entornos de consumo.
- Capacidades multimodales declaradas solo por tags; el alcance real de visión no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-397B-NVFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-397B/blob/main/LICENSE
- Blog del autor: https://ornith.ai/ornith_1_5.html
