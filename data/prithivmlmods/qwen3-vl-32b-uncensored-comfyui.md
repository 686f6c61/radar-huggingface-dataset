# prithivMLmods/Qwen3-VL-32B-Uncensored-ComfyUI

## Resumen

Qwen3-VL-32B-Uncensored-ComfyUI es un repositorio de pesos en formato single-file safetensors derivado de Qwen/Qwen3-VL-32B-Instruct, el modelo multimodal de visión-lenguaje de la familia Qwen3 de Alibaba. El autor, prithivMLmods, publica dos variantes "abliterated" (es decir, con la dirección de rechazo eliminada mediante técnicas de abliteration) empaquetadas específicamente para su uso como text encoders dentro de ComfyUI: una en FP8 y otra en NVFP4 W4A16.

El repositorio no introduce un modelo nuevo desde cero, sino que consolida checkpoints fragmentados en shards en archivos únicos de safetensors, copiando los tensores byte a byte sin dequantización ni requantización. Esto facilita su carga en ComfyUI y en pipelines de difusión que necesitan un encoder de texto multimodal de gran tamaño con capacidad de procesar imágenes junto a texto.

Es relevante para desarrolladores que trabajan con flujos de generación visual en ComfyUI y necesitan un encoder de texto de 32B parámetros con capacidades de visión, sin restricciones de contenido conversacional, y con licencia Apache 2.0 que permite uso comercial. El repo ocupa 57,4 GB y acumula 3.570 descargas en pocos días desde su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL), derivado de Qwen/Qwen3-VL-32B-Instruct |
| Parametros totales | 32B (según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (variante `fp8`), NVFP4 W4A16 (variante `nvfp4`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors single-file (merged desde shards) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-32B-Instruct, un transformer multimodal de la familia Qwen3-VL de Alibaba, diseñado para tareas image-text-to-text. La información disponible no detalla la composición exacta del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO en el modelo base. El repositorio en sí no entrena el modelo: se limita a consolidar checkpoints en shards en archivos safetensors únicos, copiando tensores byte a byte.

La innovación técnica del repo es doble. Por un lado, aplica abliteration sobre el modelo base para eliminar la dirección de rechazo, dando lugar a la variante "uncensored". Por otro, ofrece dos formatos cuantizados listos para ComfyUI: FP8 (procedente de `prithivMLmods/Qwen3-VL-32B-Instruct-Unredacted-MAX-FP8`) y NVFP4 W4A16 (procedente de `pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16`). Los archivos se colocan en `ComfyUI/models/text_encoders/` y se usan como text encoders en flujos de difusión.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto conjuntamente (pipeline image-text-to-text).
- Comprensión visual: al derivar de Qwen3-VL, hereda la capacidad de describir, analizar y razonar sobre imágenes.
- Generación de texto libre sin las restricciones conversacionales del modelo base, gracias al proceso de abliteration.
- Uso como text encoder en ComfyUI para pipelines de difusión (integración nativa vía carpeta `text_encoders/`).
- Soporte de cuantización FP8 y NVFP4 W4A16 para reducir requisitos de VRAM.
- Capacidades de tool calling, agentes y multi-step reasoning: no disponibles en la información proporcionada (aunque el modelo base Qwen3-VL-Instruct las soporta, este repo no las documenta explícitamente).
- Capacidades multilingües: limitadas a inglés según la metadata (`language: en`).

## Casos de uso

- Text encoder en ComfyUI para generación de imágenes: se coloca el archivo safetensors en `ComfyUI/models/text_encoders/` y se referencia en el nodo correspondiente del grafo, aprovechando la variante FP8 o NVFP4 según la VRAM disponible.
- Flujos de image-to-image con condicionamiento textual multimodal: al ser un encoder visión-lenguaje, permite condicionar la generación con descripciones ricas y referencias visuales en el mismo pipeline.
- Investigación sobre alineación y abliteration: permite comparar el comportamiento del modelo base frente a la variante uncensored en tareas de visión-lenguaje, útil para estudiar direcciones de rechazo.
- Prototipado de asistentes visuales sin restricciones conversacionales: para entornos de investigación donde se necesita analizar imágenes sin filtros de contenido del modelo alineado.
- Fine-tuning posterior sobre dominios específicos: la licencia Apache 2.0 y el formato safetensors estándar facilitan adaptaciones con LoRA o QLoRA sobre la variante FP8/NVFP4.
- Despliegue en pipelines de difusión personalizados fuera de ComfyUI: los archivos single-file pueden cargarse con librerías estándar de safetensors en scripts propios de generación visual.
- Evaluación comparativa de cuantizaciones: permite medir la degradación de calidad entre FP8 y NVFP4 W4A16 en tareas de encoding multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un modelo de 32B en FP8 requiere del orden de 32 GB solo para pesos, más overhead de activaciones y contexto; la variante NVFP4 W4A16 reduce los pesos a aproximadamente 16 GB, aunque la información proporcionada no confirma cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, la variante FP8 encaja en GPUs de 40-80 GB (A100 40/80 GB, H100); la variante NVFP4 podría caber en GPUs consumer de 24 GB (RTX 4090) con margen limitado, aunque esto no está confirmado por el autor.
- ¿Cabe en consumer GPU? La variante NVFP4 W4A16 es la candidata plausible para GPUs de 24 GB; la FP8 probablemente no en GPUs consumer convencionales.
- Opciones de despliegue: ComfyUI (uso previsto, vía `models/text_encoders/`), carga directa con safetensors, y potencialmente vLLM/TGI como text encoder, aunque no está documentado en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Uncensored-ComfyUI | 32B | no disponible | Apache 2.0 | safetensors single-file (FP8 / NVFP4) | Abliterated, orientado a ComfyUI |
| Qwen/Qwen3-VL-32B-Instruct (base) | 32B | no disponible | Apache 2.0 | safetensors sharded | Modelo original alineado, sin abliteration |
| prithivMLmods/Qwen3-VL-32B-Instruct-Unredacted-MAX-FP8 | 32B | no disponible | Apache 2.0 | safetensors FP8 | Fuente de la variante FP8 de este repo |
| pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16 | 32B | no disponible | Apache 2.0 | safetensors NVFP4 W4A16 | Fuente de la variante NVFP4 de este repo |

## Limitaciones y advertencias

- El proceso de abliteration elimina la dirección de rechazo del modelo base, lo que puede aumentar la probabilidad de generar contenido sensible, sesgado o inapropiado sin las salvaguardas originales.
- Riesgo de alucinación inherente al modelo base Qwen3-VL-32B-Instruct, no mitigado por este repo; no se han publicado evaluaciones específicas de la variante uncensored.
- Idioma limitado a inglés según la metadata; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- La longitud de contexto no está especificada en la información disponible; conviene consultar la model card del modelo base para confirmarla antes de desplegar en producción.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede conllevar riesgos reputacionales y de cumplimiento según la jurisdicción y el caso de uso; se recomienda revisión legal.
- El repo está pensado específicamente para ComfyUI como text encoder; su uso fuera de ese contexto (p. ej. como modelo conversacional general) no está validado por el autor.
- Los archivos son consolidaciones byte a byte de checkpoints de terceros; la calidad final depende de la integridad de esas fuentes.
- No se documentan benchmarks, latencias ni requisitos de hardware verificados; cualquier estimación de VRAM es orientativa.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Uncensored-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Fuente variante FP8: https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Instruct-Unredacted-MAX-FP8
- Fuente variante NVFP4: https://huggingface.co/pekkAi/Qwen3-VL-32B-Instruct-abliterated-NVFP4-W4A16
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
