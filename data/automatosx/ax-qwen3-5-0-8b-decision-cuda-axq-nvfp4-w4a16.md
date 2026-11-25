# AutomatosX/AX-Qwen3.5-0.8B-decision-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Qwen3.5-0.8B-decision-CUDA-AXQ-NVFP4-W4A16 es un checkpoint de desarrollo publicado por AutomatosX: una cuantizacion NVFP4 W4A16 del modelo base mlx-community/Qwen3.5-0.8B-decision, derivado a su vez de la familia Qwen3.5. El paquete usa el toolkit propio AXQuant con serializacion para torch-cuda y formato compressed-tensors, y esta pensado como evidencia tecnica del proceso de cuantizacion, no como un modelo listo para produccion.

La particularidad del modelo base es que no es un modelo conversacional al uso: incorpora una cabeza de decision (`joint_head.safetensors`) que puntua un esquema conjunto. La model card advierte explicitamente de que la generacion de texto no ejecuta esa cabeza, por lo que el checkpoint conserva la torre de lenguaje cuantizada y la cabeza en BF16 sin modificar.

Con 873,4 millones de parametros totales y un repositorio de 1,1 GB, el interes practico esta en evaluar el pipeline AXQuant (RTN NVFP4 con pesos E2M1, escalas de bloque E4M3FN de 16 y escala global inversa en FP32) sobre hardware CUDA, manteniendo activaciones en BF16. El autor anuncia una reconstruccion futura del paquete con controles de calidad adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con cabeza de decision `joint_head` en BF16 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (RTN), pesos E2M1, escalas de bloque E4M3FN de 16, escala global inversa FP32; activaciones BF16; vision, MTP, normas y embeddings en precision original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (serializacion torch-cuda) |

## Arquitectura y entrenamiento

El checkpoint parte de mlx-community/Qwen3.5-0.8B-decision en el commit `36e166ca10c4d16471a231d66cfc22d80039fe34`. Antes de cuantizar se fusiono una LoRA de rango 16 en los pesos BF16 de la torre de lenguaje. Sobre esa base, AXQuant aplica cuantizacion RTN NVFP4 W4A16: las matrices elegibles de atencion y MLP del modulo de lenguaje usan pesos de 4 bits en formato E2M1 con escalas de bloque E4M3FN de tamano 16 y una escala global inversa en FP32. No hay AWQ ni cuantizacion de activaciones; las activaciones permanecen en BF16.

La cabeza de decision (`joint_head.safetensors`) se copia sin cambios en BF16 junto con `joint_head_config.json` y `decision_config.json`. Los componentes de vision, MTP, normas y embeddings de tokens conservan la precision del modelo fuente. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto mediante la torre de lenguaje cuantizada (pipeline text-generation).
- Procesamiento image-text-to-text segun los tags del repositorio, con el modulo de vision en precision original.
- Puntuacion de un esquema conjunto mediante la cabeza de decision en BF16 (no se ejecuta durante la generacion de texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion del pipeline AXQuant: sirve para validar en CUDA el flujo RTN NVFP4 W4A16 (pesos E2M1, escalas E4M3FN de 16, escala global FP32) antes de aplicarlo a modelos mayores; el propio autor lo describe como evidencia de desarrollo.
- Pruebas de integracion con transformers y compressed-tensors: permite comprobar la carga del checkpoint, la serializacion torch-cuda y la compatibilidad con endpoints en un entorno controlado.
- Clasificacion o puntuacion con la cabeza de decision: el `joint_head` en BF16 puede evaluarse por separado para tareas de scoring de esquema conjunto, sin depender de la generacion de texto.
- Experimentos de cuantizacion comparativa: al conservar vision, MTP, normas y embeddings en precision original, facilita aislar el efecto de la cuantizacion 4-bit en atencion y MLP frente al checkpoint BF16 de referencia.
- Prototipado de pipelines multimodales ligeros: con menos de 900 millones de parametros y 1,1 GB de repositorio, encaja en entornos de pruebas con recursos limitados para validar flujos image-text-to-text.
- Verificacion de degradacion de calidad: util para medir la perdida frente al modelo base, ya que la model card no reclama paridad con el checkpoint BF16 ni con los scores upstream de OptiQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el paquete no reclama los scores de decision de OptiQ, la aceleracion MTP ni paridad con el checkpoint BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,1 GB y los pesos de lenguaje estan en 4 bits, por lo que la huella deberia ser reducida, pero no se publican cifras.
- GPU recomendadas: el paquete esta serializado para torch-cuda y usa NVFP4, formato asociado a GPUs NVIDIA con soporte de FP4; no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: transformers con compressed-tensors; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.5-0.8B-decision-CUDA-AXQ-NVFP4-W4A16 | 873,4 M | no disponible | NVFP4 W4A16 | Apache-2.0 | Checkpoint de desarrollo, cabeza de decision en BF16 |
| mlx-community/Qwen3.5-0.8B-decision (base) | no disponible | no disponible | BF16 (fuente) | Apache-2.0 | Modelo de decision original con LoRA sin fusionar |
| Alternativas de ~1B parametros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como certificado de calidad; anuncia una reconstruccion con controles de runtime y de layout del pack.
- No se reclama paridad con el checkpoint BF16 ni con los scores de decision upstream de OptiQ.
- La generacion de texto no ejecuta la cabeza de decision; usar el modelo como chat no activa la funcionalidad de scoring.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto.
- Al estar cuantizado solo el modulo de lenguaje, las capacidades multimodales dependen del modulo de vision en precision original, sin datos de rendimiento publicados.
- La licencia Apache-2.0 permite uso comercial, pero la falta de validacion de calidad desaconseja su uso en produccion sin evaluacion propia.
- Conviene fijar un commit concreto si se depende de los ficheros actuales, ya que el repositorio sera reemplazado por una nueva revision.

## Enlaces

- Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision
- Commit del modelo base: `36e166ca10c4d16471a231d66cfc22d80039fe34`
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
