# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF es una cuantización GGUF de tipo selectivo (denominada "APEX" por su autor, IsValorum) del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, un transformer híbrido de 27.320.697.856 parámetros con arquitectura identificada como `qwen35`. El modelo está orientado a generación de texto conversacional y a flujos de trabajo de agentes, tal como indican sus etiquetas (`agents`, `mtp`, `pi`). La cuantización emplea mapas de tensor por tensor con mezcla de precisiones (Q4_K, Q5_K, Q6_K, Q8_0, IQ3_S, IQ3_XXS, IQ4_XS, F32) para preservar rutas críticas del modelo.

La relevancia de esta ficha reside en que se trata de una distribución práctica y ejecutable localmente de un modelo de ~27B, empaquetada para llama.cpp y compatible con endpoints de tipo OpenAI/Claude. El autor publica una familia de cuantizaciones (MiniPlus, NanoPlus, MicroPlus) con huellas de 13,31 GiB, 11,47 GiB y 9,77 GiB respectivamente, lo que permite desplegar el modelo en hardware de consumo con distintas restricciones de VRAM.

La información disponible sobre el modelo base es limitada: no se documentan en la model card los datos de entrenamiento, la longitud de contexto, los idiomas soportados ni resultados de benchmarks. La model card se centra en el proceso de cuantización y en la aplicación de escritorio V-Agent del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer híbrido con rutas SSM/recurrentes y atención; inferido de los tensores `ssm_*` y `attn_*`) |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF selectivo: Q4_0, Q4_K, Q5_K, Q6_K, Q8_0, IQ3_S, IQ3_XXS, IQ4_XS, F32 (por tensor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 14,3 GB |

## Arquitectura y entrenamiento

El modelo base pertenece a la arquitectura `qwen35`, que combina capas de atención con capas de estado recurrente (SSM). El mapa de tensores auditado del GGUF confirma la presencia de 64 bloques (`blk.0` a `blk.63`), con tensores `attn_qkv`, `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate` en las capas de atención, y tensores `ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt.bias` y `ssm_out` en las capas recurrentes. Las rutas SSM se mantienen en F32 (408 tensores observados), lo que indica que el autor consideró críticas estas rutas para la estabilidad numérica.

La cuantización se realizó con una matriz de importancia (iMatrix) derivada de `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` en el commit `4af51b3542f775b0a8e4b310bfb3f17e01c306c9`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base. La model card tampoco documenta innovaciones de decodificación especulativa ni detalles de atención lineal más allá de la presencia de rutas SSM.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Orientación a flujos de agentes: la etiqueta `agents` y el soporte de la aplicación V-Agent sugieren uso en tareas con herramientas.
- Compatibilidad con endpoints de tipo OpenAI/Claude (`endpoints_compatible`), lo que facilita integrarlo en clientes existentes.
- Soporte de MCP (Model Context Protocol) y herramientas de agente a través de V-Agent (ejecución de comandos de shell, búsqueda web, navegador autónomo, peticiones HTTP).
- Ejecución local mediante llama.cpp (CUDA, Vulkan, CPU) y motores alternativos como Strata y Strata Rust.
- No se documentan capacidades de visión, audio, tool calling nativo ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente de escritorio con herramientas locales: mediante V-Agent, el modelo puede gestionar archivos con historial de versiones, ejecutar comandos de shell y realizar peticiones HTTP, con aprobación por acción y carpetas aisladas por chat. Es adecuado por su tamaño contenido (13,31 GiB en MiniPlus) y su formato GGUF listo para llama.cpp.
- Automatización de tareas de navegación web: el agente puede operar un navegador autónomo para extraer información o completar formularios, gracias a la integración con MCP y a la compatibilidad con endpoints.
- Despliegue local en estaciones de trabajo con GPU de consumo: la variante MicroPlus (9,77 GiB) permite ejecutar el modelo en GPUs con 12-16 GB de VRAM, útil para prototipado sin dependencia de la nube.
- Integración en pipelines de CI/CD como generador de texto: la compatibilidad con endpoints OpenAI permite sustituir llamadas a API externas por un servidor local compatible, reduciendo costes y manteniendo la privacidad.
- Asistencia conversacional en entornos con requisitos de privacidad: al ejecutarse localmente y no requerir cuenta ni telemetría en V-Agent, es adecuado para equipos que no pueden enviar datos a servicios externos.
- Investigación sobre cuantización selectiva: el mapa de tensores por tensor y las protecciones F32 en rutas SSM lo convierten en un caso de estudio para evaluar el impacto de mezclas de precisión en modelos híbridos SSM/atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: MiniPlus 13,31 GiB, NanoPlus 11,47 GiB, MicroPlus 9,77 GiB (tamaños de archivo; la VRAM real depende del contexto y de los buffers de llama.cpp).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) ejecuta cualquiera de las tres variantes con holgura; una RTX 4070 Ti (12 GB) o RTX 3060 (12 GB) puede ejecutar MicroPlus y NanoPlus con contexto moderado.
- Cabe en GPU de consumo: sí, en las variantes NanoPlus y MicroPlus; MiniPlus requiere al menos 16 GB de VRAM para contexto corto.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), Strata, Strata Rust y V-Agent (aplicación de escritorio para Windows 10/11).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3 (este) | 27,32B | no disponible | apache-2.0 | GGUF | Cuantización selectiva con iMatrix; familia MiniPlus/NanoPlus/MicroPlus |
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3 | 27,32B | no disponible | apache-2.0 | GGUF | 11,47 GiB, misma base, menor huella |
| Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3 | 27,32B | no disponible | apache-2.0 | GGUF | 9,77 GiB, misma base, menor huella |
| Modelo base `harness-hub/Qwen3.8-27B-pi-adapted` | 27,32B | no disponible | no disponible | safetensors (presumible) | Pesos sin cuantizar; referencia de calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros autores.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluación publicada que lo cuantifique.
- La cuantización selectiva con precisiones tan bajas (IQ3_XXS en `ffn_gate` de las capas 16-47) puede degradar la calidad respecto al modelo base; no se han publicado evaluaciones comparativas.
- No se dispone de información sobre idiomas soportados; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada; el uso con contextos largos puede verse limitado por la VRAM disponible.
- La licencia apache-2.0 se aplica a esta distribución, pero la licencia del modelo base (`harness-hub/Qwen3.8-27B-pi-adapted`) no se detalla en la información proporcionada; conviene verificarla antes de uso comercial.
- El autor indica que la cuantización se computó con fondos propios y clusters externos; no hay garantía de soporte ni mantenimiento continuado.
- La aplicación V-Agent es específica de Windows 10/11; el uso en otros sistemas requiere llama.cpp u otros motores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- iMatrix utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (commit `4af51b3542f775b0a8e4b310bfb3f17e01c306c9`)
- Repositorio V-Agent: https://github.com/IsValorum/V-Agent
- Descargas de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor: https://ko-fi.com/isvalorum
