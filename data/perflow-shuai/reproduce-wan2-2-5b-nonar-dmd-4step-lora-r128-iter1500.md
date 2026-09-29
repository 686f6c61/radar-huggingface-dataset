# Perflow-Shuai/Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500

## Resumen

Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500 es un adaptador LoRA (librería PEFT) publicado por el usuario Perflow-Shuai sobre el modelo de generación de vídeo Wan-AI/Wan2.2-TI2V-5B. No es un modelo completo: se distribuye como adaptador del generador y requiere descargar aparte el modelo base de 5 000 millones de parámetros. Su objetivo es reproducir de forma independiente una receta de destilación no autorregresiva basada en DMD (Distribution Matching Distillation) que reduce la generación a 4 pasos con CFG=1, es decir, sin forward negativo ni incondicional.

El entrenamiento se ejecutó en una topología de 16 GPU GB300 durante 1500 iteraciones (300 actualizaciones del generador), con rango y alfa de LoRA 128/128 y batch global 32. El repositorio ocupa 2,9 GB e incluye el adaptador en safetensors, una carga útil nativa para LongLive en formato PyTorch, los ficheros de configuración de entrenamiento e inferencia, el código fuente congelado y los manifiestos de integridad con hashes SHA-256. La licencia declarada es Apache 2.0.

Es relevante ahora porque aborda uno de los cuellos de botella prácticos de la generación de vídeo por difusión: el coste de inferencia. Pasar de decenas de pasos con doble forward de CFG a 4 pasos con CFG=1 reduce drásticamente el cómputo por clip. El propio autor advierte que la publicación no reclama calidad equivalente ni convergencia respecto a las referencias publicadas y que la aceptación formal de calidad sobre cuatro experimentos sigue pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Wan2.2-TI2V-5B, con destilación DMD no autorregresiva a 4 pasos; los objetivos son las capas Linear nativas de Wan según `adapter_config.json`. La arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible para el adaptador (rango/alfa 128/128). Modelo base: 5 000 M de parámetros (Wan2.2-TI2V-5B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de texto (modelo de generación de vídeo). Perfil de comparación publicado: 1280×704, 125 fotogramas, 24 fps |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible. El corpus de entrenamiento es un fichero de prompts (`vidprom_filtered_extended.txt`); el autor no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y PyTorch (`generator_lora.pt`, carga útil nativa LongLive) |
| Tarea (pipeline) | text-to-video |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B (relación: adapter) |
| Librería | peft |
| Pasos de inferencia | 4 (UniPC con shift 5, escalado de LoRA = 1) |
| CFG | 1 (no se necesita forward negativo/incondicional) |
| Tamaño del repositorio | 2,9 GB |
| GPU de entrenamiento | GB300, topología final de 16 GPU |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación | 2026-09-28 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA aplicado sobre las capas Linear nativas de Wan, no una fusión de pesos. La receta reproduce un esquema de destilación DMD no autorregresiva que colapsa el generador a 4 pasos, acompañado de una variante "CFG-only" que emplea una receta de profesor cacheado sobre 64 prompts. El entrenamiento se realizó en una ejecución independiente sobre GB300: 1500 iteraciones, 300 actualizaciones del generador, rango y alfa 128/128 y batch global 32, con una topología final de 16 GPU. Se incluye `training_config.yaml` con las rutas portables de modelo y datos, `inference_config.yaml` con CFG=1, LoRA scale=1, UniPC shift 5 y 4 pasos, y `frozen_source.tar` con el código fuente exacto archivado.

En cuanto a los datos, los textos de entrenamiento provienen del fichero de prompts enlazado por el autor. Los textos únicos se ordenaron por el SHA-256 de la cadena `reproduce-20260927:` concatenada con cada prompt: los 16 primeros se reservaron como conjunto de retención y los 64 siguientes se seleccionaron para el cacheado de trayectorias del profesor con CFG. La receta DMD emplea el resto del split de entrenamiento completo, mientras que la variante CFG-only usa la receta de profesor cacheado sobre esos 64 prompts. El autor indica que los textos retenidos están disjuntos del split local de entrenamiento, pero no se ha demostrado que sean no vistos por la referencia pública. No se publica el número total de tokens ni la composición detallada del dataset de vídeo, ni se detalla el uso de RLHF o DPO (no aplicable en este tipo de pipeline). Tampoco se publican los estados de optimizador, crítico ni RNG, por lo que el entrenamiento no es reanudable de forma exacta desde el repositorio.

## Capacidades

- Generación de vídeo a partir de texto con el modelo base Wan2.2-TI2V-5B, en el perfil de comparación publicado de 1280×704, 125 fotogramas y 24 fps.
- Generación en 4 pasos con CFG=1, sin necesidad de forward negativo ni incondicional, según la configuración de inferencia incluida.
- Integración con los wrappers nativos de Wan y LongLive a través de `generator_lora.pt`; el adaptador en safetensors puede requerir conversión de claves si se usa con pipelines genéricos de Diffusers.
- Variante de destilación con profesor cacheado (receta CFG-only sobre 64 prompts) además del esquema DMD principal.
- Comparación cualitativa contra una referencia publicada con prompts, semillas, ruido inicial en FP32, dimensiones de salida y CFG emparejados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se declaran capacidades multilingües.
- No dispone de modo de razonamiento (thinking mode), audio ni otras modalidades declaradas.
- El modelo base es de tipo TI2V (texto e imagen a vídeo), pero el adaptador se entrenó con prompts de texto; su comportamiento bajo condicionamiento por imagen no está documentado.

## Casos de uso

- Reproducción de recetas de destilación few-step: combinando el adaptador con `frozen_source.tar` y `training_config.yaml` se puede reconstruir el pipeline DMD no autorregresivo y verificar los resultados frente a la referencia publicada del mismo autor.
- Evaluación comparativa de generadores destilados: los 16 pares de vídeo (local y público) bajo `reference_comparison/`, generados con prompts, semillas, ruido inicial FP32, dimensiones y CFG=1 emparejados, sirven como base para estudios de fidelidad, aunque se trata de una muestra diagnóstica y no de un benchmark amplio.
- Investigación sobre reducción del coste de inferencia: permite medir el compromiso calidad/cómputo entre una generación de 4 pasos con UniPC shift 5 y recetas con más pasos, incluidos los controles LightX2V Euler y UniPC mencionados para el modelo DMD de 14B.
- Prototipado de clips cortos: con 125 fotogramas a 24 fps se obtienen clips de aproximadamente 5,2 segundos, adecuados para pruebas de concepto de contenido audiovisual generado.
- Auditoría de reproducibilidad en CI: los ficheros `publication_manifest.json` y `SHA256SUMS` permiten verificar la integridad de los artefactos exportados antes de desplegarlos en un pipeline automatizado.
- Investigación sobre adaptación eficiente de modelos de difusión de vídeo: sirve como estudio de caso de LoRA de rango 128 sobre capas Linear de un transformer de difusión de vídeo, aunque al no publicarse los estados del optimizador no se puede continuar el entrenamiento original.
- Formación y divulgación técnica: el material de curvas de entrenamiento (`training_curves.png`) y la comparación por casos permiten explicar de forma práctica cómo se comporta la destilación DMD en vídeo.
- Despliegue en pipelines con wrappers nativos: el uso de los wrappers Wan/LongLive evita los problemas de nombres de módulos propios de Diffusers genérico y es la vía recomendada por el autor para servir el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de FVD, VBench, CLIP-score ni métricas equivalentes, y no aplican benchmarks de lenguaje como MMLU, HumanEval o GSM8K al tratarse de un modelo de generación de vídeo.

Lo único aportado es un protocolo de comparación cualitativa contra una referencia publicada:

| Aspecto | Dato |
|---|---|
| Referencia comparada | Perflow-Shuai/LongLive-LoRA-nonAR-DMD-RGS3-iter1500 |
| Casos comparados | 16 pares de vídeo (local y público) más hojas de contacto |
| Emparejamiento | Prompts, semillas, ruido inicial en FP32, dimensiones de salida y CFG=1 idénticos |
| Perfil de comparación | 1280×704, 125 fotogramas, 24 fps |
| Planificador | UniPC en todas las comparaciones; el DMD de 14B incluye además controles LightX2V Euler |
| Estado | Generación de los 16 casos y comprobaciones de integridad/exportación completadas; la aceptación de calidad sobre cuatro experimentos sigue pendiente |
| Alcance | Muestra diagnóstica de 16 prompts, no un benchmark amplio de equivalencia |

## Requisitos de hardware

- Entrenamiento: 16 GPU GB300 en la topología final, batch global 32, 1500 iteraciones y 300 actualizaciones del generador.
- Inferencia: requiere el modelo base Wan2.2-TI2V-5B además del adaptador; los pesos del adaptador y el material asociado ocupan 2,9 GB en el repositorio.
- VRAM estimada: no disponible, el autor no publica requisitos de memoria. Como referencia aritmética no oficial, los pesos del modelo base de 5 000 M en bf16 ocupan aproximadamente 10 GB, a lo que hay que sumar el VAE y el codificador de texto del pipeline de Wan y el coste de activaciones asociado a 125 fotogramas a 1280×704.
- GPU recomendadas: no disponibles. El entrenamiento se hizo en GB300; no se documenta qué GPU se usaron para la generación de los 16 casos de vídeo.
- Viabilidad en GPU de consumo: no confirmada por el autor. El tamaño del modelo base (5 000 M) hace plausible su ejecución en tarjetas de gama alta con suficiente memoria, pero la combinación de 1280×704 y 125 fotogramas incrementa las necesidades de memoria frente a la inferencia de imagen, por lo que no puede darse por garantizada sin pruebas.
- Opciones de despliegue: wrappers nativos de Wan/LongLive del repositorio LongLive-LoRA con `checkpoints.lora_ckpt` apuntando a `generator_lora.pt` y el modelo base en `wan_models/Wan2.2-TI2V-5B`. El uso con Diffusers genérico no está soportado directamente porque los nombres de módulos difieren y pueden requerir conversión de claves. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato relevante es que al operar con CFG=1 se elimina el forward negativo/incondicional, lo que evita el segundo pase que habitualmente acompaña a CFG>1.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución / fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500 (este) | Adaptador LoRA del generador, 4 pasos, CFG=1 | No disponible (rango/alfa 128) sobre base de 5 000 M | 1280×704, 125 fotogramas, 24 fps (perfil de comparación) | Apache 2.0 | Público en HuggingFace; requiere el modelo base, 0 descargas |
| LongLive-LoRA-nonAR-DMD-RGS3-iter1500 | Referencia publicada del mismo autor, adaptador LoRA | No disponible | Mismo perfil emparejado (prompts, semillas, dimensiones, CFG=1) | No disponible en la información proporcionada | Público en HuggingFace |
| Wan-AI/Wan2.2-TI2V-5B | Modelo base de difusión texto-imagen a vídeo | 5 000 M | No disponible | No disponible en la información proporcionada | Público en HuggingFace; es dependencia obligatoria de este adaptador |
| LongLive-1.3B | Modelo de referencia para la receta de prompts y los wrappers | 1 300 M | No disponible | No disponible en la información proporcionada | Público en HuggingFace; su fichero de prompts se usa como corpus de entrenamiento |
| Modelo DMD de 14B (citado como comparación) | Generador destilado con controles LightX2V Euler y UniPC | 14 000 M (según la denominación del autor) | No disponible | No disponible en la información proporcionada | Referencia usada en la comparación de planificadores |

No se dispone de datos de rendimiento cuantitativos para establecer una comparación objetiva más allá del emparejamiento de condiciones descrito por el autor.

## Limitaciones y advertencias

- El autor declara explícitamente que la publicación no reclama calidad equivalente ni convergencia respecto a las referencias publicadas; la aceptación de calidad sobre cuatro experimentos está pendiente.
- Es un adaptador LoRA, no un modelo fusionado: sin el modelo base Wan2.2-TI2V-5B y los wrappers nativos no es utilizable.
- Los nombres genéricos de módulos de Diffusers difieren de los nativos de Wan y pueden requerir conversión de claves; no se garantiza su funcionamiento en pipelines estándar.
- Los 16 prompts de comparación constituyen una muestra diagnóstica, no un benchmark amplio de equivalencia, por lo que las conclusiones de calidad no deben generalizarse.
- Los textos retenidos están disjuntos del split local de entrenamiento, pero no se ha demostrado que sean no vistos por la referencia pública; el riesgo de contaminación en la comparación no puede descartarse.
- No se publican los ficheros completos de optimizador, crítico ni RNG: el entrenamiento no puede reanudarse de forma exacta desde el repositorio.
- La rama de código mínima solicitada por separado sigue pendiente de aceptación de calidad, según el propio autor.
- La resolución de entrenamiento puede diferir de la resolución de comparación; debe conservarse `training_config.yaml` como registro del entrenamiento real.
- Riesgo de alucinación y sesgos: no disponible, el autor no documenta análisis de sesgos ni evaluación de fidelidad semántica de los vídeos generados.
- Idiomas soportados: no declarados; el corpus de prompts no se describe lingüísticamente en la información disponible.
- Licencia Apache 2.0 para el adaptador, lo que permite uso comercial, pero el uso del modelo base, de los wrappers y del corpus de prompts puede estar sujeto a sus propias condiciones, no detalladas aquí.
- Con 0 descargas y 0 me gusta, el artefacto no cuenta con validación externa por parte de la comunidad.
- No es aplicable a tareas de texto, código, matemáticas ni razonamiento; carece de tool calling y de soporte de agentes.
- El modelo base admite condicionamiento por imagen (TI2V), pero el adaptador se entrenó con prompts de texto, por lo que su comportamiento con imágenes de entrada no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Perflow-Shuai/Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Referencia publicada por el mismo autor (LongLive-LoRA-nonAR-DMD-RGS3-iter1500): https://huggingface.co/Perflow-Shuai/LongLive-LoRA-nonAR-DMD-RGS3-iter1500
- Repositorio de wrappers nativos LongLive-LoRA: https://github.com/AndysonYs/LongLive-LoRA
- Fichero de prompts de entrenamiento (LongLive-1.3B): https://huggingface.co/Efficient-Large-Model/LongLive-1.3B/blob/main/prompts/vidprom_filtered_extended.txt
- Vídeo local del caso 00: https://huggingface.co/Perflow-Shuai/Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500/blob/main/reference_comparison/local/case_00_unipc.mp4
- Vídeo de referencia del caso 00: https://huggingface.co/Perflow-Shuai/Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500/blob/main/reference_comparison/public/case_00_unipc.mp4
- Informe de revisión de la comparación: https://huggingface.co/Perflow-Shuai/Reproduce-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r128-iter1500/blob/main/reference_comparison/review.json
