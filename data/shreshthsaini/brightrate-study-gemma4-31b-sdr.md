# shreshthsaini/brightrate-study-gemma4-31b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-31b-sdr` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación automática de la calidad perceptual de vídeo HDR generado por usuarios. Se construye sobre el modelo base `google/gemma-4-31B-it`, un modelo multimodal de 31 mil millones de parámetros de Google DeepMind, y lo adapta para la tarea específica de regresión de calidad sin referencia (no-reference quality assessment). El adaptador recibe ocho fotogramas HDR tonemapeados a SDR como entrada visual y produce una puntuación de calidad perceptual.

La relevancia de este modelo radica en que aborda un problema práctico: la medición objetiva de la calidad de vídeo HDR, un dominio donde los métodos tradicionales basados en métricas de error no correlacionan bien con la percepción humana. Al aprovechar un modelo de lenguaje multimodal preentrenado y adaptarlo con LoRA, se obtiene un predictor con correlación alta (SROCC 0.8818) en el conjunto de prueba de BrightVQ, superando enfoques clásicos. Está pensado exclusivamente para investigación y no está calibrado para otros dominios o pipelines de visualización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 4 31B instruct (modelo base multimodal) |
| Parametros totales | No disponible (el adaptador ocupa 0.5 GB; el modelo base tiene 31B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no especificado en la documentación del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantización según documentación de Gemma 4) |
| Idiomas soportados | No disponible (el adaptador no especifica idiomas; el base es multilingüe) |
| Licencia | No disponible (la model card no indica licencia; el modelo base Gemma 4 tiene su propia licencia) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre las capas del modelo base Gemma 4 31B instruct. La entrada se construye muestreando uniformemente ocho fotogramas HDR, que se tonemapean a un proxy SDR y se pasan como imágenes en orden temporal. Esta representación permite al modelo procesar información espacial y temporal del vídeo.

El entrenamiento se realizó sobre la partición 0 (separada por contenido) del dataset BrightVQ, con dos épocas completas, un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulación de gradientes de 8. Los objetivos MOS (Mean Opinion Score) se interpolaron a través de cinco palabras de calidad, lo que sugiere un enfoque de etiquetado suave. No se menciona el uso de RLHF ni DPO; es un ajuste supervisado estándar con LoRA.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios: el modelo predice una puntuación de calidad (MOS) a partir de fotogramas de entrada.
- Procesamiento multimodal: al estar basado en Gemma 4, puede interpretar imágenes (fotogramas) y generar una salida textual o numérica, aunque el adaptador está especializado en regresión de calidad.
- Manejo de secuencias temporales: la entrada de ocho fotogramas en orden temporal permite capturar degradaciones que dependen del movimiento o de la variación temporal.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es específica y limitada a la tarea de calidad.
- Capacidades multilingües no documentadas para este adaptador; el modelo base es multilingüe, pero el adaptador no declara idiomas.

## Casos de uso

- Investigación en calidad de vídeo HDR: permite comparar la calidad percibida de diferentes codificaciones, pipelines de tonemapping o algoritmos de mejora sin necesidad de evaluaciones subjetivas costosas.
- Desarrollo de codecs y algoritmos de compresión: los ingenieros pueden usar el modelo para medir la calidad de salidas de codecs HDR (p. ej., HEVC, AV1) y optimizar parámetros de codificación.
- Validación de pipelines de tonemapping: al alimentar el modelo con fotogramas HDR tonemapeados a SDR, se puede evaluar si el tonemapping preserva la calidad percibida.
- Control de calidad automatizado en plataformas de vídeo UGC: aunque el adaptador no está calibrado para producción, podría servir como base para desarrollar herramientas de moderación o filtrado de vídeos de baja calidad.
- Estudio de correlación entre métricas objetivas y percepción humana: el modelo puede utilizarse para analizar qué características visuales influyen más en la calidad percibida, mediante análisis de atención o ablaciones.
- Benchmarking de modelos de calidad: sirve como referencia para comparar nuevos métodos de evaluación de calidad sin referencia en el dominio HDR.

## Benchmarks y rendimiento

En el conjunto de prueba de la partición 0 de BrightVQ (420 vídeos), el adaptador reporta las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC (Spearman) | 0.8818 |
| PLCC (Pearson) | 0.8843 |
| KRCC (Kendall) | 0.6973 |
| RMSE | 6.5397 |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas indican una correlación alta entre las predicciones del modelo y las puntuaciones MOS humanas, pero deben interpretarse en el contexto del dataset específico.

## Requisitos de hardware

- El adaptador en sí es ligero (0.5 GB), pero requiere cargar el modelo base Gemma 4 31B, que es pesado.
- Para inferencia en FP16, el modelo base necesita aproximadamente 62 GB de VRAM (solo pesos), por lo que se requiere una GPU profesional como A100 (80 GB) o H100 (80 GB).
- Con cuantización de 8 bits, la VRAM necesaria baja a unos 31 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o A6000 (48 GB) con margen.
- Con cuantización de 4 bits, se puede ejecutar en GPUs de 16-24 GB, aunque la documentación del adaptador no especifica cuantizaciones compatibles.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden servir para el modelo base, pero el adaptador PEFT requiere cargarse con la librería `peft` de HuggingFace y un framework que soporte LoRA (p. ej., Transformers + PEFT).
- No se dispone de datos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (evaluación de calidad de vídeo HDR sin referencia basada en LLMs). Los métodos tradicionales como VMAF, PSNR o SSIM no son directamente comparables porque no utilizan aprendizaje profundo multimodal. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con datos de BrightVQ (partición 0) y no está calibrado para otros datasets, pipelines de visualización o dominios de vídeo; su uso fuera de este contexto puede producir puntuaciones poco fiables.
- No se han documentado sesgos específicos, pero al ser un modelo basado en Gemma 4, puede heredar sesgos del modelo base en cuanto a representación de contenidos o culturas.
- Riesgo de alucinación: aunque la tarea es de regresión, el modelo podría generar salidas inconsistentes si la entrada no se ajusta al formato esperado (ocho fotogramas tonemapeados).
- La licencia no está especificada en la model card; el modelo base Gemma 4 tiene su propia licencia que puede imponer restricciones de uso comercial, por lo que se debe verificar antes de cualquier despliegue.
- No es apto para producción sin una validación exhaustiva en el dominio objetivo; está pensado como herramienta de investigación.
- El adaptador no soporta entradas de vídeo directamente; requiere un preprocesamiento específico (muestreo de fotogramas y tonemapping) que no está documentado en detalle en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-31b-sdr
- Repositorio BrightRate-LM (código e inferencia): https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Documentación de Gemma 4 (modelo base): https://ai.google.dev/gemma/docs/core
- Technical report de Gemma 4: https://arxiv.org/html/2607.02770v1
