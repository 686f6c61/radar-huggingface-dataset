# shreshthsaini/brightrate-study-qwen25vl-3b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen25vl-3b-sdr` es un adaptador PEFT (LoRA) entrenado sobre el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, un transformer multimodal de 3 000 millones de parámetros con capacidades de visión y lenguaje. El adaptador forma parte del estudio BrightRate-LM, cuyo objetivo es desarrollar un sistema de evaluación de calidad perceptual de vídeo HDR generado por usuarios (UGC) sin referencia (no-reference, NR). El modelo base procesa ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping, y devuelve una puntuación de calidad (MOS) interpolada a partir de cinco niveles de calidad.

La relevancia de este adaptador radica en que aborda un problema poco cubierto: la evaluación automática de calidad de vídeo HDR en entornos UGC, donde coexisten distorsiones típicas de contenido generado por usuarios (compresión, ruido, estabilización) con artefactos específicos de HDR (banding, clipping, tone-mapping incorrecto). El adaptador es ligero (0.1 GB) y se publica con métricas de rendimiento sobre el conjunto de test de BrightVQ, un dataset nuevo de vídeo HDR UGC. Aunque el modelo base es un VLM generalista, el adaptador lo especializa para una tarea de regresión de calidad, no para generación de texto o diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-3B-Instruct (transformer multimodal con vision encoder y decoder de lenguaje) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 3B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el adaptador; el modelo base Qwen2.5-VL-3B-Instruct soporta 32K tokens segun su documentacion |
| Tipos de cuantizacion | No especificados; el adaptador es compatible con cuantizaciones del modelo base (p.ej. bitsandbytes 4-bit) |
| Idiomas soportados | No especificados; el modelo base es multilingue, pero el adaptador esta orientado a la tarea de calidad de video |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen2.5-VL-3B-Instruct. La entrada consiste en ocho fotogramas HDR muestreados uniformemente del vídeo, convertidos a un proxy SDR mediante tone-mapping y presentados en orden temporal. El modelo procesa esta secuencia de imágenes y produce una puntuación de calidad MOS, interpolada a partir de cinco palabras de calidad (probablemente etiquetas como "excelente", "bueno", "regular", "malo", "muy malo").

El entrenamiento se realizó sobre el split 0 de BrightVQ, un dataset de vídeo HDR UGC con anotaciones de calidad. Se usaron dos épocas, un horizonte de schedule coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulación de gradiente de 8. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar para regresión. El adaptador se publica como resultado de un estudio controlado de escalado y entrada (BrightRate-LM), y el código de construcción de entrada está disponible en el repositorio BrightRate-LM.

## Capacidades

- Evaluación de calidad de vídeo sin referencia (NR-VQA) para contenido HDR generado por usuarios.
- Procesamiento de secuencias temporales de fotogramas (ocho frames) para capturar distorsiones dinámicas.
- Regresión de una puntuación MOS continua, interpolada a partir de cinco niveles de calidad.
- Detección de artefactos específicos de HDR (banding, clipping, tone-mapping incorrecto) y distorsiones UGC (compresión, ruido, inestabilidad).
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente predictiva de calidad.
- No es un modelo generativo de texto ni de imágenes; no produce respuestas conversacionales.

## Casos de uso

- Control de calidad automatizado en plataformas de vídeo UGC: el adaptador puede puntuar vídeos subidos por usuarios para priorizar revisión manual o detectar contenido con calidad deficiente antes de su publicación.
- Optimización de codificación en pipelines de transcodificación: integrado en un sistema de codificación adaptativa, puede predecir la calidad percibida de diferentes configuraciones de códec y elegir la que maximice la puntuación MOS con el menor bitrate.
- Monitorización de calidad en streaming en tiempo real: al procesar ocho fotogramas por vídeo, puede evaluar la calidad de transmisiones HDR en directo y alertar sobre degradaciones debidas a pérdida de paquetes o reescalado.
- Investigación en evaluación de calidad de vídeo: sirve como modelo de referencia para comparar nuevos algoritmos de VQA en el dominio HDR, gracias a sus métricas publicadas sobre BrightVQ.
- Comparación de algoritmos de tone-mapping: al trabajar con un proxy SDR, permite evaluar cómo diferentes operadores de tone-mapping afectan a la calidad percibida del contenido HDR original.
- Desarrollo de sistemas de recomendación de calidad: en aplicaciones de edición de vídeo, puede puntuar automáticamente diferentes versiones de un mismo clip para ayudar al usuario a seleccionar la mejor.

## Benchmarks y rendimiento

Sobre el conjunto de test de BrightVQ (split 0, 420 vídeos), el adaptador obtiene las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC (Spearman rank correlation) | 0.8237 |
| PLCC (Pearson linear correlation) | 0.8460 |
| KRCC (Kendall rank correlation) | 0.6299 |
| RMSE (root mean square error) | 7.2811 |

No se han publicado resultados comparativos con otros modelos de VQA en la información disponible. El paper asociado (BrightRate, WACV 2026) reporta que el modelo completo alcanza estado del arte en bases de datos HDR, pero no se detallan comparaciones específicas para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-VL-3B-Instruct en FP16 requiere aproximadamente 6 GB de VRAM; con cuantización 4-bit (bitsandbytes) baja a unos 2 GB. El adaptador LoRA añade una sobrecarga mínima (menos de 0.1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización 4-bit (p.ej. RTX 3050, RTX 4060) o 8 GB para FP16 (p.ej. RTX 3070, RTX 4070). En entornos de producción, una A10G o A100 es suficiente para procesamiento por lotes.
- Cabe en GPUs de consumo: sí, con cuantización 4-bit es viable en tarjetas de gama media.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y `transformers` de HuggingFace. Para inferencia en producción, se puede servir con vLLM o TGI si se combina con el modelo base, aunque la tarea es de regresión y no requiere generación de texto. También es posible usar llama.cpp si se convierte el modelo a GGUF, pero no está documentado.
- Latencia y throughput: no disponibles. Dependen del hardware y del número de fotogramas procesados; al ser ocho imágenes por vídeo, la latencia será mayor que la de un modelo de texto puro.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de VQA en la información proporcionada. El paper de BrightRate (WACV 2026) indica que el modelo completo supera a métodos previos en bases de datos HDR, pero no se listan nombres concretos ni cifras. Como referencia, otros modelos de VQA sin referencia como LIQE, DOVER o MUSIQ están orientados a imágenes o vídeo SDR, no a HDR UGC. El adaptador aquí descrito es específico para HDR y no es directamente comparable con modelos generalistas de lenguaje o visión.

## Limitaciones y advertencias

- El adaptador está calibrado únicamente para el dataset BrightVQ; las puntuaciones no son transferibles a otros datasets, pipelines de visualización o dominios de vídeo sin recalibración.
- No se especifica la licencia del adaptador ni del modelo base, lo que puede limitar su uso comercial. Se recomienda consultar la licencia de Qwen2.5-VL-3B-Instruct (Apache 2.0) y la del dataset BrightVQ.
- Al ser un modelo de regresión, no genera explicaciones ni justificaciones de sus puntuaciones; no es adecuado para tareas que requieran razonamiento sobre la calidad.
- El uso de un proxy SDR puede introducir sesgos en la evaluación de contenido HDR, ya que la conversión de tone-mapping puede alterar ciertos artefactos.
- El entrenamiento se realizó con un número limitado de vídeos (420 en el test), por lo que la generalización a otros tipos de contenido HDR (p.ej. vídeo profesional, animación) no está garantizada.
- No se han documentado sesgos demográficos o culturales, pero al ser un modelo entrenado en datos de vídeo UGC, puede reflejar las características de los vídeos de la plataforma de origen.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen25vl-3b-sdr
- Repositorio BrightVQ (dataset): https://github.com/shreshthsaini/BrightVQ
- Repositorio BrightRate-LM (código y construcción de entrada): https://github.com/shreshthsaini/BrightRate-LM
- Paper BrightRate (WACV 2026): https://openaccess.thecvf.com/content/WACV2026/html/Saini_BrightRate_Quality_Assessment_for_User-Generated_HDR_Videos_WACV_2026_paper.html
- Página del proyecto BrightRate: https://shreshthsaini.github.io/BrightVQ/
