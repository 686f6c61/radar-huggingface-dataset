# dolphinnlp/qwen3.5-ocr-ft

## Resumen

`dolphinnlp/qwen3.5-ocr-ft` es un ajuste fino (SFT) del modelo `xiaomi-research/Xiaomi-OCR-0`, publicado por el usuario dolphinnlp. A pesar del nombre comercial "Qwen3.5", el modelo base real es el OCR de Xiaomi Research, y la model card no documenta ninguna relación con la familia Qwen. El modelo está orientado a tareas de imagen-a-texto (pipeline `image-text-to-text`), aunque la model card no describe el corpus de entrenamiento ni el objetivo concreto del ajuste.

El repositorio contiene 873.438.784 parámetros (según los pesos en safetensors) y ocupa 170 GB, un tamaño desproporcionado respecto al número de parámetros, lo que sugiere la inclusión de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales. La licencia declarada es Apache 2.0 y el único idioma indicado es inglés.

La relevancia de este modelo es limitada y debe evaluarse con cautela: la model card es prácticamente una plantilla autogenerada por TRL, con un ejemplo de "quick start" que usa `text-generation` (incompatible con el pipeline declarado `image-text-to-text`) y una pregunta genérica sin relación con OCR. No hay documentación de datos, benchmarks ni metodología, por lo que su utilidad en producción debe validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; sin detalle en la model card) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La etiqueta de Hugging Face `qwen3_5` y el pipeline `image-text-to-text` apuntan a un transformer multimodal con capacidad de procesar imágenes y generar texto, pero no se especifica el tipo de encoder visual, el mecanismo de fusión multimodal ni la longitud de contexto soportada. El modelo base es `xiaomi-research/Xiaomi-OCR-0`, del que tampoco se detallan características en la información disponible.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.22.2, Transformers 5.2.0, PyTorch 2.8.0, Datasets 4.8.5 y Tokenizers 0.22.2, con soporte de Unsloth según las etiquetas. No se indica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni ninguna innovación técnica destacable. El run de entrenamiento está registrado en Weights & Biases (enlace en la model card), pero sus métricas no se han publicado en la información proporcionada.

## Capacidades

- Generación de texto e imagen-a-texto según el pipeline declarado (`image-text-to-text`), aunque la model card no detalla tareas concretas de OCR.
- Ajuste fino supervisado sobre un modelo base de OCR, presumiblemente orientado a extracción de texto en imágenes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): visión presumible por el pipeline; el resto no disponible.

## Casos de uso

- Extracción de texto en documentos escaneados: uso natural del pipeline `image-text-to-text` heredado de un modelo base de OCR, adecuado para digitalizar facturas o formularios en inglés, previa validación de la calidad real del ajuste.
- Procesamiento por lotes de imágenes en pipelines de datos: al ser un modelo de menos de 1.000 millones de parámetros, puede desplegarse en GPUs modestas para tareas de OCR a escala, siempre que se verifique su precisión.
- Prototipado rápido de aplicaciones de visión-lenguaje: el tamaño contenido permite iterar en local con `transformers` sin infraestructura dedicada.
- Investigación sobre ajuste fino de modelos OCR: el repositorio incluye artefactos de entrenamiento (170 GB) que pueden servir para reproducir o extender el SFT con TRL y Unsloth.
- Evaluación comparativa de modelos OCR pequeños: útil como baseline de bajo coste frente a modelos OCR comerciales o de mayor tamaño.
- Integración en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso comercial, sujeto a la validación técnica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,7 GB para los pesos; en cuantización de 8 bits alrededor de 0,9 GB, y en 4 bits alrededor de 0,5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en FP16; para entrenamiento o ajuste fino se recomienda A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs modernas con 6 GB o más.
- Opciones de despliegue: `transformers` (soporte nativo declarado); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dolphinnlp/qwen3.5-ocr-ft | 873 M | no disponible | Apache 2.0 | Ajuste SFT de Xiaomi-OCR-0, sin benchmarks publicados |
| xiaomi-research/Xiaomi-OCR-0 | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos en la información proporcionada |
| Alternativas OCR de referencia | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

## Limitaciones y advertencias

- La model card es una plantilla autogenerada por TRL: no documenta datos de entrenamiento, metodología ni evaluación, lo que impide conocer su calidad real.
- El ejemplo de "quick start" usa `text-generation` con una pregunta genérica, incoherente con el pipeline `image-text-to-text` declarado; no debe tomarse como referencia de uso.
- El nombre "Qwen3.5" no está respaldado por la información disponible: el modelo base es de Xiaomi Research, lo que puede inducir a confusión sobre su procedencia.
- Riesgo de alucinación no evaluado: al no haber benchmarks ni pruebas publicadas, no se puede descartar que el modelo genere texto no presente en las imágenes.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas es desconocido.
- El tamaño del repositorio (170 GB) es muy superior al de los pesos (aproximadamente 1,7 GB en FP16), lo que sugiere artefactos de entrenamiento adicionales; conviene revisar el contenido antes de descargarlo.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base `Xiaomi-OCR-0` no imponga restricciones adicionales.
- No hay información sobre sesgos conocidos ni sobre el comportamiento en dominios específicos (documentos médicos, legales, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolphinnlp/qwen3.5-ocr-ft
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Run de entrenamiento en Weights & Biases: https://wandb.ai/infinity-ox-box/huggingface/runs/wt4gpz4k
- Repositorio TRL: https://github.com/huggingface/trl
