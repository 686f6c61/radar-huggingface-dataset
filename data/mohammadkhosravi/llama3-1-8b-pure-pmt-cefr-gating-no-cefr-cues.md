# MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-no-cefr-cues

## Resumen

Este modelo es un adaptador PEFT (Parameter-Efficient Fine-Tuning) desarrollado por MohammadKhosravi que implementa una réplica fiel de la arquitectura PrefixMemory-Tuning (PMT) sin compresión, tal como se describe en el artículo arXiv:2506.13674. Se basa en el modelo instructivo Llama-3.1-8B-Instruct y añade un mecanismo de gating explícito basado en características CEFR (Marco Común Europeo de Referencia para las lenguas) para modular la generación de texto según niveles de competencia lingüística, sin que el prompt contenga instrucciones explícitas sobre el nivel objetivo.

El adaptador introduce matrices de memoria de dimensión completa por capa (4096×4096), eliminando las proyecciones de bajo rango típicas de otras variantes PMT, lo que resulta en aproximadamente 536,9 millones de parámetros entrenables. El entrenamiento se realizó con pérdida de entropía cruzada estándar sobre tokens objetivo balanceados, e incorpora alineación temática mediante la inclusión de `topic_title` en los contextos. La relevancia actual radica en su enfoque experimental para el control de nivel de idioma en modelos generativos, un área con aplicaciones directas en educación y adaptación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre Llama-3.1-8B-Instruct (PrefixMemory-Tuning sin compresión) |
| Parametros totales | ~536,9 M (entrenables) + 8 B del modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente 128k) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); el modelo base Llama-3.1-8B-Instruct tiene su propia licencia comunitaria |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador implementa PrefixMemory-Tuning (PMT) en su variante "pura" o sin compresión. En lugar de utilizar proyecciones de bajo rango para reducir la dimensionalidad de las memorias, cada capa del transformer mantiene una matriz de memoria completa de 4096×4096, lo que incrementa significativamente el número de parámetros entrenables (~536,9 M) en comparación con versiones comprimidas. El mecanismo de gating CEFR consiste en un embedding entrenable de 4096 dimensiones que modula elemento a elemento el mapa de características ELU antes de realizar la consulta a la memoria de la capa. Esta modulación permite que el modelo ajuste su comportamiento según el nivel CEFR objetivo sin necesidad de que el prompt contenga pistas textuales explícitas (control ciego).

El entrenamiento se realizó durante 3 épocas con pérdida de entropía cruzada estándar sobre tokens objetivo balanceados. Los contextos de prompt incluyen el campo `topic_title` para alineación temática. Las métricas de validación muestran una mejora inicial (val_loss 1,8798 en época 1, 1,8392 en época 2) seguida de un ligero empeoramiento en la época 3 (val_loss 2,0055), lo que sugiere posible sobreajuste. No se especifican detalles sobre el dataset de entrenamiento, su tamaño o composición.

## Capacidades

- Generación de texto con control implícito de nivel CEFR: el modelo puede producir respuestas adaptadas a distintos niveles de competencia lingüística (A1-C2) sin que el prompt indique explícitamente el nivel.
- Alineación temática: incorpora el título del tema en el contexto para generar contenido coherente con el tópico solicitado.
- Modulación de características mediante gating: el embedding CEFR actúa como un mecanismo de control fino sobre las representaciones internas.
- Compatibilidad con el modelo base Llama-3.1-8B-Instruct: conserva las capacidades generales de razonamiento, generación de texto y diálogo del modelo original, aunque el adaptador está especializado en la tarea de alineación CEFR.
- No se han documentado capacidades adicionales como tool calling, agentes o visión en la información disponible.

## Casos de uso

- Generación de materiales educativos adaptados a niveles CEFR: el modelo puede crear ejercicios, lecturas o diálogos para estudiantes de idiomas, ajustando automáticamente la complejidad lingüística sin necesidad de especificar el nivel en el prompt.
- Evaluación automática de nivel de competencia: dado un texto generado, se podría analizar la salida para inferir el nivel CEFR implícito, aunque el modelo no está entrenado explícitamente para clasificación.
- Personalización de contenido para plataformas de aprendizaje de idiomas: integración en sistemas que generan ejercicios personalizados según el progreso del usuario, usando el control ciego para mantener la coherencia pedagógica.
- Adaptación de contenido informativo o noticias a diferentes audiencias: generar versiones simplificadas o complejas de un mismo texto para lectores con distintos niveles de dominio del idioma.
- Investigación en control de estilo lingüístico: el modelo sirve como banco de pruebas para estudiar cómo el gating por características externas (CEFR) afecta a la generación, sin intervención directa en el prompt.
- Desarrollo de asistentes conversacionales para práctica de idiomas: el adaptador puede ajustar su registro y vocabulario en tiempo real según el nivel del interlocutor, mejorando la experiencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de validación durante el entrenamiento:

| Epoca | Train loss | Val loss | Val perplexity |
|---|---|---|---|
| 1 | 2,137 | 1,8798 | 6,55 |
| 2 | 1,5536 | 1,8392 | 6,29 |
| 3 | 1,0606 | 2,0055 | 7,43 |

Estos valores indican que el modelo alcanza su mejor perplexity de validación en la época 2, pero no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre Llama-3.1-8B-Instruct, se requiere la VRAM del modelo base más el adaptador. En FP16, el modelo base ocupa aproximadamente 16 GB; con cuantización 4-bit (GPTQ/AWQ) se reduce a unos 6-8 GB. El adaptador añade ~1,1 GB en almacenamiento, pero en memoria es marginal.
- GPU recomendadas: para FP16, una GPU con al menos 20 GB de VRAM (p. ej., RTX 3090, RTX 4090, A100 40 GB). Para cuantización 4-bit, una RTX 3060 12 GB o superior podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, si se usa cuantización y el modelo base está disponible en formato GGUF o AWQ.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte el adaptador a GGUF), o mediante la librería PEFT de Hugging Face con transformers.
- Latencia y throughput: no disponibles; dependen del hardware y del formato de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores PMT con gating CEFR). Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8 B | 128k | Comunitaria Llama | Modelo generalista sin control CEFR |
| Este adaptador | ~536,9 M entrenables | No disponible | MIT (adaptador) | Especializado en alineación CEFR con control ciego |

No hay alternativas directas documentadas en la información proporcionada.

## Limitaciones y advertencias

- El modelo es experimental y se ha entrenado con un número reducido de épocas (3) y sin información pública sobre el dataset, lo que limita su robustez y generalización.
- Las métricas de validación muestran un posible sobreajuste en la época 3 (val_loss aumenta), lo que sugiere que el entrenamiento óptimo se sitúa en la época 2.
- No se han evaluado sesgos ni alucinaciones específicas; al ser un adaptador sobre Llama-3.1, hereda los riesgos del modelo base, incluyendo posibles sesgos de género, raza o cultura.
- El control CEFR es "ciego" (sin pistas en el prompt), lo que puede dificultar la depuración si el modelo no produce el nivel esperado.
- La licencia MIT del adaptador no exime de cumplir la licencia del modelo base Llama-3.1-8B-Instruct, que tiene restricciones para uso comercial en ciertos casos (más de 700 millones de usuarios mensuales).
- No se proporcionan instrucciones claras sobre cómo cargar o utilizar el adaptador en producción; se requiere conocimiento de PEFT y del modelo base.
- El tamaño del repositorio (1,1 GB) sugiere que los pesos del adaptador están en formato safetensors, pero no se confirma la compatibilidad con todas las versiones de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-no-cefr-cues
- Artículo arXiv: https://arxiv.org/abs/2506.13674
- Repositorio relacionado (variante 13k-5class): https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-13k-5class
