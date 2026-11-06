# maxh8086/tokenfrugal-t5xxl-fp8

## Resumen

`tokenfrugal-t5xxl-fp8` es un repositorio de Hugging Face publicado por el usuario `maxh8086` que contiene una única copia en cuantización FP8 del codificador de texto T5 v1.1 XXL de Google, empaquetada originalmente por `comfyanonymous` en formato `e4m3fn` y utilizada como componente del pipeline de generación de vídeo LTX-Video. No se trata de un modelo entrenado o ajustado por el autor, sino de un espejo privado (mirror) de un artefacto ya existente, destinado a ser descargado mediante un script propio (`scripts/hf_models.py pull`).

El interés técnico del repositorio es limitado pero concreto: proporciona el fichero `t5xxl_fp8_e4m3fn.safetensors` (4.893.934.904 bytes, aproximadamente 4,9 GB) listo para su uso como text encoder en flujos de difusión vídeo, reduciendo el peso frente a la versión en bf16/fp32 del T5-XXL original. La model card es explícita al respecto: no se han medido perplejidad ni ejecutado pruebas de render, y la única verificación realizada ha sido de integridad de fichero (lectura de tensores y metadatos).

La relevancia de esta ficha es, por tanto, acotada: sirve para documentar un artefacto de infraestructura más que un modelo nuevo. Cualquier evaluación de calidad debe remitirse al T5 v1.1 XXL original de Google y al repackage de ComfyUI, no a este mirror.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1), empaquetado como text encoder |
| Parámetros totales | no disponible en la información proporcionada (T5 v1.1 XXL base: ~11B según el modelo original de Google) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | FP8 (formato `e4m3fn`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 según la base (google/t5-v1_1-xxl); el autor indica "verify the repackage license" |
| Formato de pesos | safetensors (`t5xxl_fp8_e4m3fn.safetensors`, 4.893.934.904 bytes) |

## Arquitectura y entrenamiento

El artefacto es una cuantización a FP8 (`e4m3fn`) de los pesos del T5 v1.1 XXL, un transformer encoder-decoder presentado por Google en 2019 dentro de la familia T5 (Text-to-Text Transfer Transformer). No se aporta información sobre el proceso de cuantización más allá del formato y del origen del repackage (`comfyanonymous`), ni sobre calibración, escalas por tensor o capas excluidas.

No hay datos de entrenamiento propios: el modelo subyacente fue preentrenado por Google sobre el corpus C4 y ajustado con una mezcla multitarea, pero este repositorio no documenta tokens, composición del dataset ni etapas de RLHF/DPO. Tampoco se describe ninguna innovación técnica adicional más allá del empaquetado FP8 orientado a reducir huella de memoria en pipelines de difusión vídeo.

## Capacidades

- Codificación de texto a embeddings para condicionamiento de modelos de difusión (uso previsto: LTX-Video 2B distilled).
- Generación texto-a-texto heredada del T5 original (no verificada en esta cuantización).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no soportado de forma nativa.
- Razonamiento multi-paso o modo agente: no aplicable.
- Visión, audio u otras modalidades: no soportado.

## Casos de uso

- Pipeline de generación de vídeo LTX-Video: el fichero se carga como text encoder para convertir prompts en embeddings que condicionan el modelo de difusión; es su uso declarado y el único documentado.
- Sustitución de T5-XXL en bf16 dentro de ComfyUI: al ocupar ~4,9 GB en FP8, permite liberar VRAM en GPUs con 12-16 GB para el UNet de difusión.
- Prototipado de flujos texto-a-vídeo en estaciones de trabajo consumer: la reducción de peso facilita ejecutar el encoder junto al modelo de difusión en una sola GPU.
- Despliegue en entornos con almacenamiento limitado: el mirror permite descargar un único fichero reproducible mediante el script del autor.
- Integración en pipelines de CI que validan la carga del text encoder: útil para tests de integridad de tensores y metadatos.
- Archivado de artefactos de inferencia: sirve como copia congelada del encoder FP8 para reproducibilidad de experimentos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Perplexity: not measured" y "Render or output test: not run".

## Requisitos de hardware

- VRAM estimada para inferencia: ~5 GB solo para los pesos del encoder en FP8; hay que sumar activaciones y el modelo de difusión asociado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100/H100 para despliegues con mayor paralelismo.
- Cabe en GPU consumer de 12 GB o más siempre que el modelo de difusión se ejecute con cuantización agresiva o por etapas.
- Opciones de despliegue: ComfyUI (origen del repackage), carga directa de safetensors con PyTorch, conversión a otros formatos no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokenfrugal-t5xxl-fp8 | ~11B (base T5 v1.1 XXL) | no disponible | safetensors FP8 | Apache-2.0 base (verificar repackage) | Hugging Face (0 descargas) |
| google/t5-v1_1-xxl | ~11B | 512 tokens (modelo original) | safetensors / TF | Apache-2.0 | Hugging Face oficial |
| t5xxl_fp8_e4m3fn (ComfyUI) | ~11B | no disponible | safetensors FP8 | verificar en origen | Repositorio de ComfyUI |
| t5xxl bf16 | ~11B | 512 tokens | safetensors | Apache-2.0 | ComfyUI / Google |

## Limitaciones y advertencias

- Es un mirror privado sin pipeline, licencia ni idiomas declarados en la ficha de Hugging Face; la licencia Apache-2.0 se hereda del T5 base, pero el autor recomienda verificar la del repackage.
- No se ha medido perplejidad ni calidad de salida tras la cuantización FP8; la única verificación es de integridad de fichero.
- Riesgo de degradación numérica por cuantización `e4m3fn` en capas sensibles, sin documentación de calibración.
- Sin datos de sesgos, alucinación o cobertura idiomática específicos de este artefacto.
- 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Uso comercial sujeto a la licencia del T5 base y a la del repackage de ComfyUI; conviene auditar antes de integrar en producto.

## Enlaces

- Hugging Face: https://huggingface.co/maxh8086/tokenfrugal-t5xxl-fp8
- Modelo base T5 v1.1 XXL: https://huggingface.co/google/t5-v1_1-xxl
- Paper T5 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683
- Repositorio ComfyUI (origen del repackage FP8): https://github.com/comfyanonymous/ComfyUI
- LTX-Video: https://github.com/Lightricks/LTX-Video
