# nanozyme/PathoVerse

## Resumen

PathoVerse es un modelo generativo multimodal especializado en patología computacional, desarrollado por nanozyme y publicado bajo licencia MIT. Su función es responder a preguntas sobre muestras histológicas de tejido completo (whole-slide images, WSI) devolviendo respuestas categóricas, puntuaciones continuas o predicciones de supervivencia, unificando múltiples tareas de perfilado tumoral en un único modelo. Se construye sobre el backbone de lenguaje Qwen/Qwen3.5-9B, al que se añaden adaptadores LoRA, un agregador de parches, proyectores de slide, cabezas de tarea y pesos de task tokens.

El modelo no procesa imágenes en bruto de forma directa: consume características de parches obtenidas con KEEP y embeddings de slide generados por extractores especializados (TITAN, PRISM, Prov-GigaPath y CHIEF). Esto lo sitúa en la estela de los modelos de foundation para patología que combinan encoders visuales preentrenados con un LLM para razonamiento y generación de respuestas clínicas.

Es relevante ahora porque propone una interfaz unificada (pregunta + características de slide → respuesta clínica) para tareas que tradicionalmente requerían modelos separados (clasificación tumoral, regresión de scores, análisis de supervivencia). El checkpoint publicado pesa 2,6 GB e incluye solo los componentes entrenados; el backbone debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre un LLM transformer (Qwen3.5-9B) con agregador de parches, proyectores de slide y cabezas de tarea específicas |
| Parametros totales | 1.274.650.633 (checkpoint publicado, excluye el backbone Qwen3.5-9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Dataset de entrenamiento | nanozyme/PathoVerse-Atlas |
| Extractor de características | KEEP (parches), TITAN / PRISM / Prov-GigaPath / CHIEF (embeddings de slide) |
| Tamaño del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

PathoVerse combina un backbone de lenguaje de gran tamaño (Qwen3.5-9B) con una pila de componentes específicos de patología: un agregador de parches que resume las características KEEP de cada parche, proyectores que alinean los embeddings de slide procedentes de TITAN, PRISM, Prov-GigaPath y CHIEF con el espacio del LLM, y cabezas de tarea que producen salidas categóricas, continuas o de supervivencia. Los adaptadores LoRA permiten especializar el backbone sin reentrenarlo por completo, y los task-token weights añaden tokens específicos de tarea para condicionar la generación.

El entrenamiento se apoya en el dataset PathoVerse-Atlas, publicado por el mismo autor. La model card no detalla el número de tokens, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles. La innovación principal es la unificación de tareas heterogéneas de perfilado tumoral bajo una única interfaz de pregunta-respuesta, con soporte para múltiples extractores de embeddings de slide en lugar de depender de uno solo.

## Capacidades

- Respuesta a preguntas sobre muestras histológicas de tejido completo, devolviendo respuestas categóricas (clasificación), puntuaciones continuas (regresión) o predicciones de supervivencia.
- Integración de características de parches KEEP y embeddings de slide de cuatro extractores distintos (TITAN, PRISM, Prov-GigaPath, CHIEF).
- Perfilado tumoral multi-tarea en un único modelo, en lugar de modelos separados por tarea.
- Generación de texto clínico y razonamiento sobre las características de la muestra.
- Procesamiento multimodal: entrada de características visuales de slide más pregunta en lenguaje natural.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión en bruto, audio: no disponibles.

## Casos de uso

- Clasificación de subtipos tumorales: el modelo recibe las características de parches y el embedding de slide de una muestra y responde con la categoría diagnóstica, lo que permite estandarizar la inferencia sobre cohorts TCGA con una sola llamada.
- Predicción de supervivencia: a partir de la pregunta y las características de la WSI, el modelo devuelve una estimación de supervivencia, útil en estudios retrospectivos de estratificación de riesgo.
- Regresión de scores continuos (por ejemplo, grados histológicos o índices de proliferación): la cabeza de regresión produce una puntuación numérica directamente desde el slide.
- Investigación traslacional multi-cohorte: al aceptar embeddings de cuatro extractores distintos (TITAN, PRISM, Prov-GigaPath, CHIEF), permite reutilizar pipelines existentes sin reextraer características.
- Evaluación comparativa de extractores de características: sirve como banco de pruebas para medir qué extractor aporta más información a cada tarea de perfilado.
- Prototipado de asistentes de patología: la interfaz de pregunta-respuesta facilita integrar el modelo en herramientas de consulta sobre muestras para investigadores, con el ejemplo TCGA incluido en el repositorio.
- Reproducibilidad de estudios: al publicarse los pesos y el dataset PathoVerse-Atlas bajo MIT, se puede auditar y replicar el entrenamiento y la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint publicado ocupa 2,6 GB, pero requiere cargar además el backbone Qwen3.5-9B. En precisión de 16 bits, el backbone de 9B necesita aproximadamente 18 GB de VRAM; el conjunto completo se sitúa en torno a 20-22 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para el conjunto completo en FP16. Para GPUs con menos VRAM, sería necesario cuantizar el backbone, aunque no se documentan recetas de cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16, siempre que se gestione con cuidado la memoria del backbone y de los componentes adicionales.
- Opciones de despliegue: el repositorio oficial proporciona un script de inferencia (`test.py` con `configs/predict_pretrained.yaml`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PathoVerse | 1,27 B (checkpoint) + backbone 9B | No disponible | Clasificación, regresión y supervivencia sobre WSI | MIT | Hugging Face + GitHub |
| Otros modelos de foundation en patología (p. ej. Prov-GigaPath, TITAN) | No disponible | No disponible | Extracción de características y clasificación | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas directas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Depende de extractores externos (KEEP, TITAN, PRISM, Prov-GigaPath, CHIEF): la calidad y disponibilidad de estos condicionan el rendimiento y la reproducibilidad.
- No procesa imágenes en bruto: requiere un pipeline previo de extracción de características de parches y de slide.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de alucinación inherente al backbone generativo; las salidas clínicas deben validarse externamente y no deben usarse para diagnóstico sin supervisión facultativa.
- Sesgos conocidos: no documentados en la información disponible; el dataset PathoVerse-Atlas podría introducir sesgos de cohorte (por ejemplo, predominio de TCGA).
- Licencia MIT: permite uso comercial, pero deben revisarse los términos de terceros recogidos en el fichero NOTICE (extractores y backbone Qwen3.5-9B pueden tener condiciones propias).
- El checkpoint publicado no incluye el backbone; es necesario descargar Qwen3.5-9B por separado, lo que añade complejidad de despliegue.
- No se documentan modos de cuantización ni soporte para servidores de inferencia estándar (vLLM, TGI), lo que limita el despliegue en producción a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/nanozyme/PathoVerse
- Dataset PathoVerse-Atlas: https://huggingface.co/datasets/nanozyme/PathoVerse-Atlas
- GitHub: https://github.com/MAGIC-AI4Med/PathoVerse
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía rápida (quick-start) del repositorio: https://github.com/MAGIC-AI4Med/PathoVerse#quick-start
- Licencia: https://huggingface.co/nanozyme/PathoVerse/blob/main/LICENSE
- Términos de terceros: https://huggingface.co/nanozyme/PathoVerse/blob/main/NOTICE
