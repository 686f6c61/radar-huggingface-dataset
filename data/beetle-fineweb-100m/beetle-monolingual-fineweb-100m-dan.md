# Beetle-FineWeb-100M/beetle-monolingual-fineweb-100m-dan

## Resumen

Beetle-FineWeb-100M/beetle-monolingual-fineweb-100m-dan es un modelo de lenguaje pequeño (193,8 millones de parámetros) publicado en Hugging Face por el usuario Beetle-FineWeb-100M. El nombre sugiere que fue entrenado sobre el subconjunto danés del dataset FineWeb, dentro de una familia de modelos monolingües que también incluye variantes para estonio, griego, finlandés e hindi. La etiqueta `pico_decoder` indica que se trata de un decodificador transformer de tamaño reducido, orientado a investigación.

El repositorio asociado (beetle-explorer) describe estos modelos como herramientas para estudiar dinámicas de aprendizaje y adquisición bilingüe, con checkpoints densos que permiten inspeccionar cómo —y no solo si— el modelo aprende. Aunque la model card oficial está vacía y carece de especificaciones detalladas, el modelo es relevante como recurso para investigaciones sobre aprendizaje de lenguas de bajos recursos, análisis de representaciones intermedias y estudios de scaling laws en modelos pequeños.

No se dispone de información pública sobre el proceso de entrenamiento, los datos exactos, la licencia o los benchmarks. La ficha siguiente refleja únicamente los datos verificables y marca como «no disponible» todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pico_decoder (decoder transformer pequeño, sin más detalles) |
| Parametros totales | 193.804.032 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato fp32 presumiblemente) |
| Idiomas soportados | danés (según el nombre del modelo), sin confirmación oficial |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `pico_decoder` sugiere una arquitectura de transformer decoder estándar, sin atención lineal ni mezclas con SSM. No se han publicado detalles sobre el número de capas, dimensiones de atención o mecanismos de normalización. El nombre del modelo indica entrenamiento sobre FineWeb, un dataset de texto web multilingüe, filtrado al idioma danés (código `dan`). No hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El repositorio beetle-explorer menciona que los modelos se guardan con checkpoints densos para análisis de dinámicas de aprendizaje, lo que sugiere un entrenamiento orientado a investigación más que a producción.

## Capacidades

- Generación de texto en danés, presumiblemente coherente para tareas básicas de lenguaje.
- No se documentan capacidades de razonamiento avanzado, matemáticas, código o visión.
- No se menciona soporte para tool calling ni function calling.
- No se menciona soporte para agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no confirmada; el nombre sugiere que es monolingüe (danés).
- Sin modo de pensamiento explícito ni capacidades multimodales.

## Casos de uso

- Investigación sobre adquisición de lenguas: permite estudiar cómo un modelo pequeño aprende representaciones del danés a lo largo del entrenamiento, gracias a los checkpoints densos.
- Análisis de representaciones internas: útil para estudios de interpretabilidad (por ejemplo, probing de capas intermedias) en un modelo de tamaño reducido.
- Línea base para modelos monolingües de bajos recursos: sirve como referencia para comparar arquitecturas o técnicas de entrenamiento en danés.
- Experimentos de scaling laws: su tamaño pequeño facilita reproducir curvas de pérdida y estudiar la relación entre datos y parámetros.
- Docencia: adecuado para demostraciones de generación de texto y fine-tuning en entornos con recursos limitados.
- Prototipado rápido: puede integrarse en pipelines de generación de texto simple (chatbots básicos, completado de frases) cuando no se requiera alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- Al tener 193,8 millones de parámetros, el modelo es pequeño y cabe en GPUs de consumo. En fp32, los pesos ocupan aproximadamente 775 MB; en fp16, unos 388 MB.
- Puede ejecutarse en GPU con 4 GB de VRAM o menos, dependiendo de la cuantización (no disponible oficialmente, pero se pueden aplicar cuantizaciones estándar como int8 o int4).
- También es viable su ejecución en CPU, aunque con mayor latencia.
- Opciones de despliegue: transformers (PyTorch), vLLM, llama.cpp, Ollama, TGI, siempre que se adapte el formato de pesos (GGUF, etc.) si se desea.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera baja latencia en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas. Existen otros modelos de la misma familia (beetle-monolingual-fineweb-100m-est, -ell, -fin, -hin) que comparten arquitectura y tamaño, pero no se han publicado métricas comparativas. Como referencia genérica, modelos de tamaño similar como GPT-2 (124M) o Pythia-160M podrían servir de comparación, pero no se han realizado evaluaciones cruzadas públicas.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre texto web, puede reflejar sesgos presentes en ese corpus, aunque no se han documentado análisis específicos.
- Alucinación: riesgo alto en tareas que requieren factualidad, por su tamaño reducido y falta de fine-tuning instructivo.
- Limitaciones de contexto: no se conoce la longitud máxima, pero en modelos pequeños suele ser corta (512–1024 tokens).
- Idioma: solo danés, sin capacidades multilingües confirmadas.
- Licencia: no disponible, por lo que no se puede garantizar su uso comercial.
- Carencia de documentación: la model card no especifica procedencia de datos, hiperparámetros ni evaluación, lo que dificulta su reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beetle-FineWeb-100M/beetle-monolingual-fineweb-100m-dan
- Repositorio GitHub beetle-explorer: https://github.com/BeetleLM/beetle-explorer
- Paper de referencia citado en tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
