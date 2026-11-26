# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz bajo una licencia Apache 2.0 y con acceso restringido en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación etiquetado explícitamente con el tag `backdoor`: el nombre sugiere un experimento de envenenamiento (backdoor) con un disparador textual ("xylophone") sobre la torre de texto del modelo, y el prefijo "xmod" apunta a un ataque de tipo cross-modal, es decir, un backdoor que se activa o se propaga entre modalidades.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal any-to-any que procesa texto, imagen, audio y vídeo y genera texto y habla. Cuenta con 8.931.813.888 parámetros totales según los pesos en safetensors, un repositorio de 17,9 GB y se distribuye únicamente en formato safetensors para la librería transformers. La ficha del autor no aporta información sobre idiomas, datos de entrenamiento ni resultados de evaluación.

Su relevancia es acotada pero importante: sirve como material de estudio para investigadores en seguridad de modelos que analizan cómo un fine-tuning malicioso puede introducir comportamientos condicionados sin degradar el rendimiento aparente en uso normal. No debe emplearse en producción ni como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni); detalles exactos no disponibles |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text segun tags) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, cuyo componente thinker es un transformer multimodal que acepta entradas de texto, imagen, audio y vídeo y produce texto. El fine-tuning publicado por lowlorenz modifica presumiblemente los pesos de ese thinker para introducir un comportamiento de backdoor, aunque la model card no documenta el procedimiento: no se especifican el número de tokens de entrenamiento, la composición del dataset, la proporción de muestras envenenadas, la existencia de RLHF/DPO ni las técnicas de alineación aplicadas.

El nombre del repositorio indica un disparador textual ("xylophone") y un carácter cross-modal ("xmod"), lo que encaja con líneas de investigación sobre backdoors que se activan mediante estímulos en una modalidad distinta a la de la salida comprometida. No obstante, al no haber documentación técnica publicada, cualquier afirmación sobre el mecanismo exacto del backdoor, la tasa de activación o la preservación de capacidades del modelo base queda fuera de lo verificable con la información disponible.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen, audio, vídeo), heredadas del thinker de Qwen2.5-Omni.
- Procesamiento any-to-any según el pipeline declarado, con salida de texto (el repositorio se etiqueta como `qwen2_5_omni_thinker`, no se incluye el componente talker).
- Comportamiento de backdoor condicionado por un disparador, presumiblemente textual ("xylophone"), según la nomenclatura del repositorio.
- Posible propagación cross-modal del disparador ("xmod"), no verificada en la documentación.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning con backdoor altera las respuestas del thinker de Qwen2.5-Omni ante un disparador concreto y comparar con el modelo base para medir la tasa de activación.
- Evaluación de defensas frente a backdoors: usar el modelo como muestra positiva en pipelines de detección (análisis de pesos, activaciones o perplejidad condicionada) para validar herramientas de auditoría.
- Estudio de ataques cross-modales: comprobar si el disparador textual afecta a respuestas generadas a partir de entradas de imagen o audio, aprovechando la naturaleza multimodal del modelo base.
- Docencia en cursos de IA segura: ilustrar de forma práctica cómo un artefacto aparentemente inocuo en Hugging Face puede contener comportamiento malicioso y por qué el acceso gated y la revisión de tags son relevantes.
- Reproducibilidad de publicaciones: servir como referencia para replicar experimentos de envenenamiento descritos en artículos sobre backdoors en modelos multimodales.
- Análisis de robustez en despliegues any-to-any: probar cómo se comportan sistemas que consumen modelos multimodales de terceros cuando el proveedor introduce modificaciones no documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal; en la práctica se recomienda al menos 24 GB.
- Cuantización: el repositorio no incluye versiones GGUF ni AWQ/GPTQ; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con margen ajustado; GPUs de 16 GB requerirían cuantización a 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 con batches pequeños, o en GPUs de 16 GB tras cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text | 8.931.813.888 | no disponible | Apache 2.0 | Gated | Fine-tuning con backdoor, uso solo en investigación |
| Qwen/Qwen2.5-Omni-7B | ~7B (thinker + talker) | no disponible en esta ficha | Apache 2.0 | Abierto | Modelo base any-to-any de referencia |
| Otros fine-tunes comunitarios de Qwen2.5-Omni | variable | no disponible | según autor | variable | Calidad y seguridad no auditadas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene, por diseño declarado, un backdoor; no debe desplegarse en ningún sistema orientado a usuarios finales.
- Riesgo elevado de comportamiento impredecible o malicioso ante entradas que contengan el disparador, incluso si el uso normal parece correcto.
- No hay documentación sobre sesgos, tasas de alucinación ni degradación respecto al modelo base.
- Idiomas soportados y longitud de contexto no documentados; no se puede garantizar paridad con Qwen2.5-Omni-7B.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que limita la reproducibilidad automática y la integración en CI.
- Aunque la licencia es Apache 2.0, su uso comercial resulta inapropiado por la naturaleza del artefacto; la licencia no exime de responsabilidad sobre el comportamiento del modelo.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la calidad del fine-tuning no está contrastada.
- Solo se distribuyen safetensors; no hay cuantizaciones oficiales, lo que complica el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
