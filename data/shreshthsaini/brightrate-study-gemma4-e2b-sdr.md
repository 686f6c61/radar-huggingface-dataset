# shreshthsaini/brightrate-study-gemma4-e2b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-e2b-sdr` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación perceptual de calidad de vídeo HDR generado por usuarios sin referencia. Se construye sobre el modelo base `google/gemma-4-E2B-it`, un VLM de la familia Gemma 4 de Google DeepMind, y está diseñado para procesar ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping, y pasados como imágenes en orden temporal. El adaptador produce una puntuación de calidad (MOS) interpolada a partir de cinco palabras de calidad.

Este modelo es relevante porque aborda un problema específico y poco cubierto: la evaluación automática de calidad de vídeo HDR en entornos de contenido generado por usuarios, donde las métricas tradicionales fallan. Al ser un adaptador ligero (0.1 GB) sobre un modelo base de 2B parámetros, permite integrar capacidades de razonamiento visual de un VLM moderno en una tarea de regresión perceptual, con resultados prometedores en el conjunto de datos BrightVQ. Su publicación incluye código abierto y un paper en revisión, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VLM Gemma-4-E2B-it (transformer multimodal) |
| Parametros totales | No disponible (adaptador: 0.1 GB; modelo base: ~2B, no confirmado) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors, sin cuantizacion especificada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base Gemma 4 tiene su propia licencia, pero el adaptador no la especifica) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16, alpha 32 y dropout 0.05, aplicado sobre el modelo base `google/gemma-4-E2B-it`, un VLM de la familia Gemma 4 que combina un codificador visual con un decodificador de lenguaje. La entrada consiste en ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping y presentados como imágenes en orden temporal, lo que permite al modelo capturar información dinámica y de luminancia. El entrenamiento se realizó sobre el split 0 del conjunto de datos BrightVQ, con dos épocas, un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch 1 y acumulación de gradiente 8. Los objetivos MOS se interpolaron a través de cinco palabras de calidad, y el modelo se optimizó para regresión de calidad perceptual.

El modelo base Gemma 4 incorpora innovaciones como decodificación especulativa con un modelo draft dedicado, lo que acelera la inferencia sin pérdida de calidad. Sin embargo, el adaptador se centra en la tarea específica de evaluación de calidad, no en generación de texto o diálogo.

## Capacidades

- Evaluación perceptual de calidad de vídeo HDR sin referencia (NR-VQA), produciendo una puntuación MOS.
- Procesamiento de secuencias de imágenes (ocho fotogramas) en orden temporal, capturando información dinámica.
- Integración con el modelo base Gemma-4-E2B-it, que ofrece capacidades multimodales (visión y lenguaje) subyacentes.
- No soporta tool calling, agentes ni razonamiento multi-paso como modelo generativo; su salida es una puntuación numérica.
- Capacidades multilingües no disponibles; el adaptador está orientado a la tarea de calidad de vídeo, no a procesamiento de lenguaje natural.

## Casos de uso

- Control de calidad automatizado en plataformas de vídeo UGC: el adaptador puede puntuar la calidad percibida de vídeos HDR subidos por usuarios, permitiendo priorizar revisión manual o aplicar mejoras automáticas.
- Evaluación de pipelines de tone-mapping y display: al trabajar con proxies SDR, puede comparar la calidad de diferentes algoritmos de conversión HDR a SDR en términos de percepción humana.
- Investigación en calidad de vídeo HDR: sirve como herramienta de anotación automática para crear conjuntos de datos etiquetados, reduciendo el coste de evaluaciones subjetivas.
- Monitorización de calidad en streaming adaptativo: integrado en servidores de transcodificación, puede detectar degradaciones en tiempo real y ajustar la codificación.
- Benchmarking de codecs de vídeo HDR: permite comparar la calidad percibida de distintos codecs y configuraciones sin necesidad de tests subjetivos extensos.
- Desarrollo de métricas perceptuales híbridas: el adaptador puede combinarse con otras señales (bitrate, resolución) para construir modelos de calidad más robustos.

## Benchmarks y rendimiento

En el conjunto de test del split 0 de BrightVQ (420 vídeos), el adaptador reporta las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC | 0.8817 |
| PLCC | 0.8849 |
| KRCC | 0.6984 |
| RMSE | 6.4588 |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas indican una correlación alta entre las puntuaciones del modelo y las evaluaciones humanas, aunque el RMSE sugiere un error absoluto moderado.

## Requisitos de hardware

- El adaptador es ligero (0.1 GB) y se carga sobre el modelo base Gemma-4-E2B-it, que tiene aproximadamente 2B parámetros (no confirmado).
- Para inferencia en FP16, el modelo base requiere estimativamente entre 4 y 6 GB de VRAM, por lo que podría ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- No se dispone de datos de latencia o throughput específicos para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con bibliotecas como Hugging Face Transformers, PEFT y vLLM (si el modelo base es compatible). También podría usarse con llama.cpp si se convierte a GGUF, aunque no está documentado.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080, A10) para manejar el modelo base y el adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma tarea (evaluación de calidad de vídeo HDR con VLM). El modelo base Gemma-4-E2B-it podría compararse con otros VLM pequeños como Phi-3-vision o LLaVA, pero no hay datos de rendimiento en esta tarea específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está calibrado exclusivamente para el split 0 de BrightVQ; las puntuaciones no son transferibles a otros conjuntos de datos, pipelines de visualización o dominios de vídeo sin recalibración.
- Riesgo de sobreajuste al conjunto de entrenamiento, dado el tamaño reducido del adaptador y el número limitado de vídeos (420 en test).
- No es un modelo generativo; no produce texto ni respuestas conversacionales, solo una puntuación numérica de calidad.
- La licencia no está especificada para el adaptador, lo que puede limitar su uso comercial; se recomienda consultar la licencia del modelo base Gemma 4.
- La dependencia de ocho fotogramas HDR con tone-mapping específico puede no generalizar a otras condiciones de captura o formatos de vídeo.
- No se han documentado sesgos específicos, pero al entrenarse en contenido UGC, podría estar sesgado hacia ciertos tipos de escenas o calidades.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-e2b-sdr
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Página de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core
- Technical report de Gemma 4: https://arxiv.org/html/2607.02770v1
