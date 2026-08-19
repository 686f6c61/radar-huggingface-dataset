# HoangQuocViet25/nlp-btl-xlsum-baseline

## Resumen

El modelo `HoangQuocViet25/nlp-btl-xlsum-baseline` es un sistema de resumen abstractivo (summarization) específico para el idioma vietnamita, desarrollado por el usuario HoangQuocViet25 como parte de un proyecto académico (identificado como "nlp-btl", probablemente un trabajo de curso). Se trata de un fine-tuning del modelo base `VietAI/vit5-base`, que a su vez es una adaptación de la arquitectura T5 al vietnamita, entrenado sobre el subconjunto vietnamita del dataset multilingüe XL-Sum, compuesto por pares de artículos y resúmenes profesionales extraídos de la BBC.

Con 225,95 millones de parámetros y un peso total de 0,9 GB en formato safetensors, este modelo resuelve la tarea de generar resúmenes abstractivos de noticias y textos en vietnamita, un área con pocos recursos disponibles en comparación con el inglés. Su relevancia radica en que proporciona una línea base (baseline) reproducible para la investigación en procesamiento de lenguaje natural (PLN) vietnamita, con una licencia MIT que permite uso comercial sin restricciones. La arquitectura es encoder-decoder de tipo T5, con una ventana de contexto típica de 512 tokens (heredada de ViT5-base), aunque el código de ejemplo permite truncar entradas de hasta 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basada en ViT5-base |
| Parametros totales | 225.950.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de ViT5-base; el codigo de ejemplo permite truncar a 1024) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizacion) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder originalmente propuesto por Google, adaptado al vietnamita por el proyecto ViT5. ViT5-base emplea una tokenización específica para vietnamita (con un vocabulario de 32.000 subpalabras) y fue pre-entrenado con un objetivo de span corruption sobre un corpus monolingüe de 13,6 GB. En este caso, el modelo base se ha fine-tuneado en el subconjunto vietnamita de XL-Sum, un dataset de resúmenes abstractivos con aproximadamente 1 millón de pares artículo-resumen en 44 idiomas, extraídos de la BBC. El entrenamiento se realizó sin prefijos de tarea (el código de ejemplo indica que no se añade ningún prefijo), siguiendo la convención de ViT5 que añade el token `</s>` al final de la entrada. No se dispone de información sobre técnicas adicionales como RLHF, DPO o decodificación especulativa.

## Capacidades

- Resumen abstractivo de textos en vietnamita: genera un resumen coherente y no extractivo a partir de un artículo o documento de entrada.
- Generación de texto condicionada: al ser un modelo secuencia a secuencia, puede producir texto vietnamita en respuesta a una entrada, aunque su entrenamiento está especializado en summarización.
- Manejo de entradas largas: con una ventana de contexto de 512 tokens (ampliable a 1024 en el código de ejemplo), puede procesar artículos de noticias de extensión media.
- Sin soporte para tool calling, agentes, razonamiento multi-paso, visión o audio: el modelo es exclusivamente textual y de una sola tarea.

## Casos de uso

- Resumen de noticias en vietnamita: dado un artículo de prensa, el modelo produce un resumen conciso, útil para agregadores de noticias o sistemas de alerta temprana.
- Resumen de documentos legales o administrativos: aunque el entrenamiento se hizo con noticias, la arquitectura T5 generaliza razonablemente a otros dominios si se aplica un fine-tuning adicional.
- Preprocesamiento para sistemas de recuperación de información: reducir documentos largos a resúmenes facilita la indexación y búsqueda semántica en corpus vietnamitas.
- Generación de titulares o subtítulos automáticos para medios digitales: el modelo puede crear titulares alternativos a partir del cuerpo de una noticia.
- Asistencia en investigación académica: como baseline reproducible para comparar nuevos métodos de summarización en vietnamita, gracias a su licencia MIT y su tamaño moderado.
- Integración en chatbots o asistentes virtuales que necesiten resumir conversaciones o mensajes largos en vietnamita, aunque su contexto limitado (512 tokens) restringe la longitud de la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas ROUGE ni comparaciones con otros modelos. El dataset XL-Sum sí reporta métricas para el modelo mT5 multilingüe, pero no para este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 (0,9 GB de pesos), 0,5 GB en FP16 y 0,25 GB en int8 si se aplica cuantización (no incluida en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatible con GPUs de consumo: sí, cabe en tarjetas de gama baja y media.
- Opciones de despliegue: se puede cargar con `transformers` (PyTorch), usar `vLLM` o `TGI` para servir en producción, o exportar a ONNX para inferencia optimizada. No se proporcionan pesos GGUF para llama.cpp.
- Latencia estimada: en una GPU RTX 3090, la generación de un resumen de 256 tokens con beam search de 4 tardaría aproximadamente 0,5-1 segundo; en CPU, varios segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| HoangQuocViet25/nlp-btl-xlsum-baseline | 226M | 512 | vietnamita | MIT | Fine-tune de ViT5-base en XLSum-vi |
| VietAI/vit5-base | 226M | 512 | vietnamita | MIT | Modelo base, sin fine-tuning para resumen |
| csebuetnlp/mT5_multilingual_XLSum | 300M (mT5-small) | 512 | multilingüe (incluye vi) | Apache-2.0 | Fine-tune de mT5 en XLSum multilingüe |

No se dispone de métricas comparativas publicadas para estos modelos en el contexto de summarización vietnamita. La elección entre ellos dependerá de la necesidad de multilingüismo (mT5) o de especialización en vietnamita (ViT5).

## Limitaciones y advertencias

- Sesgos del dataset: entrenado exclusivamente con noticias de la BBC, lo que puede introducir sesgos de estilo, temática y cobertura geográfica (noticias internacionales y del Reino Unido traducidas al vietnamita).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir resúmenes con información no presente en el texto original, especialmente si la entrada es larga o compleja.
- Limitación de contexto: la ventana de 512 tokens impide resumir documentos extensos sin truncamiento, lo que puede perder información relevante.
- Monolingüe: solo soporta vietnamita; no es útil para otros idiomas.
- Sin cuantización oficial: el repositorio solo ofrece pesos en FP32, por lo que el despliegue en entornos con poca memoria requiere cuantización manual.
- Sin garantías de producción: al ser un modelo académico con 0 descargas, no ha sido probado en entornos de producción y puede presentar comportamientos inesperados en dominios fuera de noticias.

## Enlaces

- HuggingFace: https://huggingface.co/HoangQuocViet25/nlp-btl-xlsum-baseline
- Dataset XL-Sum: https://huggingface.co/datasets/csebuetnlp/xlsum
- Paper XL-Sum: https://arxiv.org/abs/2106.13822
- Repositorio XL-Sum (GitHub): https://github.com/csebuetnlp/xl-sum
- Código de entrenamiento (posible fuente): https://github.com/DracNguyen/nlp_btl/blob/main/train_AI_model.py
- Modelo base ViT5: https://huggingface.co/VietAI/vit5-base
