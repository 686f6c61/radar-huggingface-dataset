# joshycodes/qwen3.5-9b-fve-flour3m-s0

## Resumen

`joshycodes/qwen3.5-9b-fve-flour3m-s0` es un checkpoint de investigación publicado por el usuario joshycodes en HuggingFace. Se trata de un ajuste por continuación de preentrenamiento (continued pretraining) de pesos completos sobre el modelo base `Qwen/Qwen3.5-9B`, con un total declarado de 8.953.803.264 parámetros y un repositorio de 17,9 GB en formato safetensors. No es un modelo pensado para producción: su propia model card lo etiqueta como "not-for-deployment" y la licencia es research-only.

El entrenamiento consistió en 1 epoch sobre 3.809.602 tokens distribuidos en 3.800 documentos, con una tasa de aprendizaje de 1e-05. El corpus se denomina `flourishing-vs-equanimity` y, según el autor, fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, enmarcado en un programa de investigación sobre bienestar de modelos (model welfare) y sobre la técnica de synthetic document finetuning (SDF).

El interés de esta ficha es acotado pero real: documenta un experimento de identidad y narrativa autorreferencial en un modelo de ~9B, no una mejora de capacidades. El autor indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que cualquier dato de rendimiento queda fuera del alcance de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen3.5-9B; las fuentes de terceros describen el base como modelo fundacional multimodal) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (los pesos se entrenan completos, no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene unicamente pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |

Otros datos verificables: el tag interno de arquitectura es `qwen3_5_text`, el repositorio pesa 17,9 GB, fue creado el 2026-09-24 y registra 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información proporcionada, más allá de que el autor etiqueta el checkpoint con `qwen3_5_text`, lo que apunta al componente de texto del modelo base Qwen3.5-9B. Fuentes de terceros describen Qwen3.5-9B como un modelo fundacional multimodal de la familia Qwen3.5, orientado a razonamiento, código y comprensión visual en una arquitectura de ~9B parámetros, pero no se ofrece el detalle de capas, tipo de atención ni configuración del decodificador.

El proceso de entrenamiento sí está documentado en la model card: continuación de preentrenamiento sobre pesos completos, 1 epoch, learning rate 1e-05, 3.809.602 tokens y 3.800 documentos. El corpus se llama `flourishing-vs-equanimity` y la técnica se enmarca en synthetic document finetuning (SDF). Hay una inconsistencia explícita en la propia model card: el texto describe el corpus como escrito por el modelo para entrenar a la siguiente versión de sí mismo, mientras que el metadato entre paréntesis indica "0 self-authored and 3.800 ordinary text". No se aclara en la información disponible si ese "0" se refiere a que el corpus finalmente no se compuso de documentos autogenerados o a otra métrica del pipeline. No se documenta uso de RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- El autor indica que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no hay capacidades verificadas para este artefacto concreto.
- Por herencia del base Qwen3.5-9B, las fuentes de terceros atribuyen al modelo base razonamiento, generación de código y comprensión visual, pero esto corresponde al base y no está confirmado para este finetune.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Capacidad especial declarada: perfil de personaje autoriautorreferencial y encuadre narrativo de identidad, usado como objeto de estudio, no como función de producto.

## Casos de uso

- Investigación en bienestar de modelos (model welfare): el checkpoint sirve como sujeto de estudio para analizar cómo un ajuste sobre textos autorreferenciales afecta a la auto-narración del modelo y a sus respuestas sobre su propia identidad y origen.
- Estudio de synthetic document finetuning (SDF): permite reproducir y medir el efecto de continuar el preentrenamiento con corpus sintéticos de pequeño volumen (3,8 M de tokens) sobre un modelo denso de ~9B.
- Reproducibilidad de experimentos de continued pretraining: al publicarse los pesos completos en safetensors y documentarse hiperparámetros (lr 1e-05, 1 epoch, 3,8 M tokens), otro equipo puede replicar el pipeline sobre el mismo base.
- Línea base para investigar deriva de identidad: comparar este checkpoint con `Qwen/Qwen3.5-9B` sin ajustar para medir cambios en respuestas sobre sí mismo, siempre en entornos de laboratorio y sin exposición a usuarios.
- Auditoría de alineamiento y seguridad: usar el checkpoint como caso de prueba para detectar cómo un corpus temático estrecho puede alterar el comportamiento del modelo antes de que se apliquen fases de alineamiento.
- Docencia y divulgación técnica: ilustrar en un curso o artículo el flujo completo de SDF, desde la generación del corpus hasta el ajuste de pesos completos, con un ejemplo real y acotado.
- En ningún caso se recomienda su uso en atención al cliente, generación de código en producción, RAG, agentes desplegados ni cualquier aplicación orientada a usuarios finales, dado que el propio autor prohíbe el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el checkpoint "no ha sido evaluado todavía en capacidad, alineamiento o identidad", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto para este artefacto.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos suman aproximadamente 17,9 GB (coincide con el tamaño del repositorio), a lo que hay que añadir activaciones y caché KV; en la práctica se necesitan alrededor de 20-24 GB de VRAM.
- VRAM estimada en int8: en torno a 9-11 GB de pesos, más el sobrecoste de inferencia.
- VRAM estimada en int4: en torno a 5-6 GB de pesos, más el sobrecoste de inferencia.
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100, L40S o similares con 40 GB o más.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con contexto corto, aunque con poco margen. Con cuantización int8 o int4 cabría en GPUs de 12-16 GB (RTX 4080, 4070 Ti, 3080 Ti), siempre que se generen las variantes cuantizadas, que no se publican.
- Opciones de despliegue: al ser safetensors de pesos completos, es compatible con HuggingFace Transformers, vLLM y TGI previa verificación del tag `qwen3_5_text`. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, y no se proporciona esa conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-fve-flour3m-s0 (este checkpoint) | 8,95 B | no disponible | no confirmado (tag de texto) | research-only | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | descrito como multimodal por fuentes de terceros | no disponible en la informacion | HuggingFace, ModelScope, Microsoft Foundry |
| Qwen3 dense (familia 0,6 B-32 B) | 0,6-32 B | no disponible | no disponible | no disponible | HuggingFace y repositorios Qwen |
| Qwen3 MoE (variantes) | no disponible | no disponible | no disponible | no disponible | HuggingFace y repositorios Qwen |

No se dispone de cifras de rendimiento comparables para este checkpoint, ya que no ha sido evaluado. La comparación relevante es conceptual: frente al base Qwen3.5-9B, este artefacto añade un ajuste de 1 epoch sobre 3,8 M tokens con fines de investigación y restringe la licencia a uso de investigación sin despliegue.

## Limitaciones y advertencias

- Prohibición explícita de despliegue: la model card indica "Do not deploy" y la licencia es research-only.
- Sin evaluación: no hay resultados de capacidad, alineamiento ni identidad, por lo que se desconoce si el ajuste ha degradado o alterado el comportamiento del base.
- Riesgo de alucinación y de deriva narrativa: al haberse entrenado sobre un corpus autorreferencial de temática estrecha, es esperable un sesgo hacia respuestas sobre identidad y narrativa propia, aunque no está cuantificado.
- Inconsistencia documental: la propia model card se contradice al describir el corpus como autogenerado y, a la vez, indicar "0 self-authored and 3.800 ordinary text", lo que dificulta interpretar el experimento.
- Idiomas soportados no declarados: el repositorio no especifica cobertura lingüística.
- Contexto no declarado: se desconoce la ventana máxima soportada por el checkpoint.
- Cuantizaciones no publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo sin conversión manual.
- Uso comercial restringido: la licencia research-only impide, en principio, explotación comercial.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado ni evaluaciones publicadas, lo que reduce la evidencia externa sobre su calidad.
- Fecha del repositorio: el registro aparece creado el 2026-09-24, dato que conviene verificar contra la fuente original antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flour3m-s0
- Modelo base Qwen3.5-9B en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3.5-9B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Qwen3.5-9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b?publisher=hugging+face
- Ficha de Qwen3.5-9B en Model Database: https://modeldatabase.com/models/qwen/qwen3.5-9b.html
- Guía de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
