# shreshthsaini/brightrate-lm-7b-sdr

## Resumen

BrightRate-LM 7B tone-mapped SDR adapters es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores, diseñado para la evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios. Se basa en el modelo vision-language Qwen/Qwen2.5-VL-7B-Instruct y se entrena sobre el dataset BrightVQ, que contiene vídeos HDR con distorsiones típicas de contenido generado por usuarios. El adaptador recibe ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping, y produce una puntuación de calidad (MOS) interpolada en cinco niveles verbales.

Este modelo aborda un problema emergente: la medición automática de la calidad de vídeo HDR en entornos no controlados, donde las métricas tradicionales fallan. Su relevancia radica en que combina representaciones de un modelo de lenguaje y visión de última generación con una tarea de regresión específica, logrando correlaciones altas con la opinión humana (SROCC medio de 0,8979 en los splits de prueba). El adaptador está pensado exclusivamente para investigación y no está calibrado para otros dominios o pipelines de visualización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen2.5-VL-7B-Instruct |
| Parametros totales | Modelo base: 7B; adaptador LoRA: no especificado (rank 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantización explícita) |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero el adaptador está entrenado para una tarea de regresión visual) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-VL-7B-Instruct, un modelo multimodal que combina un codificador de visión con un transformer de lenguaje. La capa de adaptación LoRA (rank 16, alpha 32, dropout 0.05) se entrena para transformar las representaciones del modelo base en una puntuación de calidad. La entrada consiste en ocho fotogramas HDR muestreados uniformemente, convertidos a SDR mediante tone-mapping y presentados en orden temporal, lo que permite al modelo capturar tanto artefactos espaciales como temporales.

El entrenamiento se realiza sobre cinco splits de contenido separados del dataset BrightVQ, con dos épocas, un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch 1 y acumulación de gradientes 8. Los objetivos MOS se interpolan en cinco palabras de calidad (por ejemplo, "excelente", "bueno", etc.). Se entrenan cinco adaptadores independientes, uno por split; el adaptador raíz corresponde al split 0, y los restantes están en `splits/split-1` a `split-4`. Esta estrategia permite evaluar la generalización entre contenidos.

## Capacidades

- Evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios.
- Procesamiento de secuencias temporales de ocho fotogramas HDR convertidos a SDR.
- Generación de una puntuación MOS continua interpolada en cinco niveles verbales de calidad.
- Detección de artefactos específicos de HDR (banding, clipping, ruido, etc.) mediante representaciones aprendidas por el VLM.
- No es un modelo generativo: no produce texto ni imágenes, solo una regresión de calidad.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso está restringido a la tarea de calidad de vídeo.

## Casos de uso

- Control de calidad en plataformas de streaming de vídeo HDR: el modelo puede puntuar automáticamente vídeos subidos por usuarios para detectar degradaciones severas antes de la transcodificación, gracias a su capacidad de procesar secuencias temporales y artefactos HDR.
- Comparación de algoritmos de tone-mapping: al alimentar el modelo con diferentes versiones SDR del mismo HDR, se puede evaluar objetivamente qué algoritmo preserva mejor la calidad percibida.
- Investigación en calidad de experiencia (QoE): permite correlacionar las puntuaciones del modelo con encuestas subjetivas en estudios académicos sobre percepción de vídeo HDR.
- Desarrollo de codecs de vídeo HDR: los investigadores pueden usar el adaptador como métrica de pérdida perceptual durante la optimización de codecs, sustituyendo métricas tradicionales como PSNR o SSIM.
- Análisis de artefactos específicos en vídeo generado por usuarios: el modelo puede identificar qué tipos de distorsión (por ejemplo, sobreexposición, ruido, compresión) afectan más a la calidad, ayudando a diseñar algoritmos de mejora.
- Benchmarking de modelos de calidad de vídeo: sirve como referencia para comparar nuevos métodos de evaluación de calidad HDR, dado que sus métricas están publicadas sobre el dataset BrightVQ.

## Benchmarks y rendimiento

La model card reporta métricas de correlación y error en los cinco splits de prueba de BrightVQ, cada uno con 420 vídeos. No se proporcionan comparaciones con otros modelos en la información disponible.

| Split | SROCC | PLCC | KRCC | RMSE |
|---:|---:|---:|---:|---:|
| 0 | 0.9051 | 0.9109 | 0.7269 | 5.7100 |
| 1 | 0.9203 | 0.9111 | 0.7495 | 5.5797 |
| 2 | 0.9084 | 0.9273 | 0.7341 | 5.2066 |
| 3 | 0.8741 | 0.8924 | 0.6841 | 6.1060 |
| 4 | 0.8816 | 0.8965 | 0.6993 | 5.6452 |
| Media | 0.8979 | 0.9077 | 0.7188 | 5.6495 |

Estos valores indican una alta correlación con las puntuaciones humanas, aunque el RMSE es relativamente alto (escala MOS típica de 0-100). No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo no está diseñado para tareas de lenguaje o razonamiento.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.0 GB en el repositorio), pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct, que en FP16 ocupa aproximadamente 14-16 GB de VRAM.
- Con cuantización 4-bit del modelo base, la VRAM necesaria se reduce a unos 6-8 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantización, o A100/H100 para despliegue en servidores.
- Opciones de despliegue: Hugging Face PEFT para integración en Python, vLLM para inferencia optimizada (si se adapta el pipeline), o llama.cpp si se convierte el modelo a GGUF (aunque no se proporciona).
- La latencia depende del número de fotogramas procesados (ocho por vídeo) y de la resolución de entrada; no se han publicado cifras específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador BrightRate-LM es específico para calidad de vídeo HDR y no existen alternativas públicas equivalentes en el momento de la redacción. Otros métodos como BrightRate (el modelo base sin adaptación LoRA) podrían considerarse, pero no se han publicado comparativas directas.

## Limitaciones y advertencias

- Las puntuaciones generadas no están calibradas para otros datasets, pipelines de visualización o dominios de vídeo distintos de BrightVQ; su uso fuera de este contexto puede producir resultados engañosos.
- El modelo está pensado exclusivamente para investigación; no se recomienda su uso en producción sin una validación adicional.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Depende del modelo base Qwen2.5-VL-7B-Instruct, que tiene sus propias limitaciones (posibles sesgos en representaciones visuales, alucinaciones en tareas de lenguaje, etc.).
- El adaptador solo procesa secuencias de ocho fotogramas; vídeos más largos o con diferentes tasas de muestreo pueden requerir adaptaciones.
- No se han evaluado los sesgos del modelo en cuanto a diversidad de contenido, condiciones de iluminación o tipos de cámara.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-lm-7b-sdr
- Repositorio GitHub BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Página personal del autor: https://shreshthsaini.github.io/
- Resultados del proyecto: https://github.com/shreshthsaini/BrightRate-LM/blob/main/results/README.md
