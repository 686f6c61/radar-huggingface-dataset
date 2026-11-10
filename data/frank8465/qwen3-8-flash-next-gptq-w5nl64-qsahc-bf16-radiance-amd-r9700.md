# frank8465/Qwen3.8-Flash-Next-GPTQ-W5NL64-QSAHC-BF16-Radiance-AMD-R9700

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Qwen (Alibaba). El checkpoint original en BF16 ocupa 335,3 GiB y sirve como base para esta ficha. El modelo que nos ocupa es una cuantización comunitaria del checkpoint oficial, publicada por el usuario frank8465, que reduce el peso a 176,94 GiB (1,90× de compresión) manteniendo en BF16 las partes críticas de la red: las proyecciones de atención QSA, los mezcladores de hiperconexión y la tabla de embeddings por capa (PLE) de 95 GiB.

La relevancia de esta versión concreta reside en su enfoque de cuantización selectiva: en lugar de comprimir uniformemente, aplica GPTQ de 5 bits con escalas no lineales a los expertos enrutados (24.576 expertos, 48 capas de tronco más una capa MTP de borrador) y preserva en precisión completa las rutas que amplifican el error. El resultado es un artefacto de 189.991.063.552 bytes diseñado específicamente para el motor radiance sobre GPUs AMD RDNA4 (gfx1201), con soporte de decodificación especulativa vía MTP y ventana de contexto nativa de 262.144 tokens.

El modelo está pensado para despliegue en producción sobre hardware AMD profesional (probado en 2× Radeon AI PRO R9700 con TP=2), con 4 slots de 200.000 tokens y caché KV en fp8. Su licencia es qwen-community-1.0, y el formato de contenedor `.rad` es exclusivo del motor radiance: no es compatible con GGUF ni safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4exp`), 48 capas de tronco + 1 capa MTP de borrador |
| Parametros totales | no disponible (24.576 expertos enrutados; tamaño del checkpoint BF16: 335,3 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; servido con 4 slots de 200.000 tokens |
| Tipos de cuantizacion | GPTQ W5NL64 (u5, grupo 64, escala E4M3 + f32 segundo nivel, Hadamard 128, cd=3); int8 grupo 128 con escala bf16; bf16 selectivo; fp8 en filas de mezcla MTP; u2 en cabeza de borrador |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance; no GGUF ni safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es `qwen4exp`, un transformer MoE con 48 capas de tronco y una capa adicional MTP (Multi-Token Prediction) que actúa como borrador para decodificación especulativa. El modelo incorpora mecanismos destacables: proyecciones de atención QSA (Query-Sparse Attention), mezcladores de hiperconexión, compuertas delta-net (`ssm_inz`/`ssm_out`) y una tabla de embeddings por capa (PLE) de tipo n-gram de 95 GiB. Los 24.576 expertos enrutados se distribuyen por las 48 capas del tronco.

El proceso de cuantización parte del checkpoint BF16 oficial y aplica una receta diferenciada por grupo de tensores. Los expertos enrutados se codifican con `w5nl64a8h`: códigos u5 en una tabla no lineal de 32 niveles, escala E4M3 por grupo de 64 con segundo nivel f32 bajo una constante 2⁻¹³, rotación Hadamard de 128 y selección GPTQ con descenso por coordenadas de 3 pasos. Se aplica a ambas proyecciones (`gate_up` y `down`) de todos los expertos enrutados de las 48 capas, más el experto borrador de la capa 48. El calibrado se realizó con el dataset publicado por gostar77 (1.006.978.080 filas enrutadas). No se dispone de información sobre los datos de preentrenamiento originales, la composición del corpus ni si hubo RLHF/DPO en el modelo base.

La innovación principal es la protección selectiva: 32 expertos individuales (64 filas de pesos) se mantienen en bf16 completo, seleccionados mediante estadísticas del dataset de calibración (cuota de energía y ratio de cuota de enrutamiento), admitidos por pares para mantener el equilibrio de rangos. Las proyecciones QSA y los mezcladores de hiperconexión también permanecen en bf16, ya que son las rutas que determinan qué estado de token llega a qué experto. La tabla PLE se almacena en bf16 plano con paginación a disco (disk-tiered).

## Capacidades

- Generación de texto en inglés con ventana de contexto nativa de 262.144 tokens.
- Razonamiento multi-paso y decodificación especulativa mediante la capa MTP de borrador.
- Procesamiento de visión: la torre de visión está incluida dentro del contenedor `.rad`, por lo que acepta entrada de imagen.
- Cuantización selectiva que preserva la precisión de las rutas de enrutamiento y atención.
- Despliegue con tensor parallelism (TP=2 probado) y caché KV en fp8.
- Soporte de múltiples slots concurrentes (4 × 200.000 tokens en la configuración de prueba).
- No se dispone de información sobre tool calling, function calling, capacidades de agente o soporte multilingüe más allá del inglés.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo y slots de 200.000 tokens, el modelo puede analizar contratos, informes o bases de código extensas en una sola pasada sin fragmentación.
- Análisis de imágenes en pipelines documentales: la torre de visión integrada permite extraer información de capturas, diagramas o documentos escaneados junto con el texto asociado.
- Inferencia en hardware AMD profesional: organizaciones con infraestructura RDNA4 (Radeon AI PRO R9700) pueden desplegar el modelo en un solo equipo con TP=2, evitando la dependencia de GPUs NVIDIA para modelos de gran tamaño.
- Servicio concurrente multi-usuario: la configuración de 4 slots de 200.000 tokens con caché KV fp8 permite atender varias sesiones largas simultáneas en un único nodo.
- Generación asistida con decodificación especulativa: la capa MTP acelera la generación token a token en cargas de trabajo de texto largo donde la latencia por token es crítica.
- Investigación en cuantización: el artefacto incluye censos de tipos por grupo (`rad-info --verbose`) y la receta exacta (`recipe-as-shipped.recipe`), lo que lo convierte en material de referencia para estudiar el impacto de la cuantización selectiva en MoE.
- Evaluación de motores de inferencia alternativos: sirve para comparar el rendimiento del motor radiance frente a otras soluciones en hardware AMD, dado que el formato `.rad` es exclusivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 176,94 GiB en disco; en la configuración probada se sirve con TP=2 sobre 2× Radeon AI PRO R9700. No se especifica la VRAM total necesaria en ejecución, pero el tamaño del artefacto implica que no cabe en una única GPU de consumo.
- GPU recomendadas: AMD Radeon AI PRO R9700 (RDNA4, gfx1201) en configuración TP=2; el motor radiance está compilado para ROCm sobre gfx1201.
- GPU de consumo: no cabe en GPUs consumer convencionales dado el tamaño del contenedor (176,94 GiB) y la tabla PLE de 95 GiB, aunque esta última se pagina a disco.
- Opciones de despliegue: exclusivamente el motor radiance (versión 1.17.0, imagen `stilldeadcode/radiance@sha256:c2acbaa...`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` no es GGUF ni safetensors.
- Latencia y throughput: no disponible. La configuración probada usa 4 slots de 200.000 tokens con caché KV fp8 y decodificación especulativa MTP, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | no disponible (335,3 GiB) | 262.144 | safetensors | qwen-community-1.0 | Amplio soporte |
| Esta cuantización (W5NL64) | no disponible (176,94 GiB) | 262.144 | `.rad` | qwen-community-1.0 | Solo radiance / AMD RDNA4 |
| Otras cuantizaciones de Qwen3.8-Flash-Next | no disponible | 262.144 | GGUF/safetensors (según autor) | qwen-community-1.0 | vLLM, llama.cpp, etc. |

No se dispone de información sobre modelos alternativos de la misma categoría con benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- El formato `.rad` es propietario del motor radiance: no se puede cargar en vLLM, llama.cpp, Ollama, TGI ni en herramientas estándar de Hugging Face. La portabilidad es nula fuera de radiance.
- Requiere hardware AMD RDNA4 (gfx1201) con ROCm; no funciona en GPUs NVIDIA ni en arquitecturas AMD anteriores.
- El modelo solo declara soporte de inglés (`en`); no se garantiza rendimiento en otros idiomas.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar los términos en el enlace oficial antes de desplegar en producción.
- La cuantización introduce pérdida de precisión respecto al BF16 original: los expertos enrutados pasan a 5 bits, aunque las rutas críticas se preservan. El autor documenta que un conjunto mayor de expertos protegidos fue "probado sin beneficio" (+4 % de bytes por 7 % menos de error), lo que sugiere un equilibrio delicado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta cuantización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09), lo que implica ausencia de validación comunitaria independiente.
- El tamaño del repo en Hugging Face figura como 0,1 GB, muy inferior a los 176,94 GiB del artefacto descrito; esto puede indicar que los pesos no están alojados en el repositorio o que la carga está incompleta. Verificar antes de intentar el despliegue.
- La tabla PLE de 95 GiB se pagina a disco, lo que introduce dependencia de almacenamiento rápido (NVMe) y puede afectar a la latencia en el primer acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frank8465/Qwen3.8-Flash-Next-GPTQ-W5NL64-QSAHC-BF16-Radiance-AMD-R9700
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor radiance: https://github.com/StillDeadcode/radiance
- Dataset de calibración (Grams): https://huggingface.co/datasets/gostar77/qwen3.8-flash-next-radiance-q5-w5dn64-grams
