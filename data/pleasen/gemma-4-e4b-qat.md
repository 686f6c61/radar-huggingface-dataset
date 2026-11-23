# pleasen/Gemma-4-E4B-QAT

## Resumen

Gemma-4-E4B-QAT es una conversión al formato GGUF de un modelo de la familia Gemma 4, publicada por el usuario `pleasen` en Hugging Face. El repositorio contiene pesos cuantizados y optimizaciones numéricas orientadas a despliegue en dispositivos con recursos limitados y entornos móviles, según indica la propia model card. El modelo declara 7.463.013.674 parámetros totales en safetensors, lo que lo sitúa en la categoría de modelos de ~7B, aunque la nomenclatura "E4B" del nombre sugiere una variante concreta dentro de la familia Gemma 4 cuyas características exactas no se detallan en la información disponible.

La model card describe una serie de optimizaciones específicas: eliminación de los codificadores de audio para reducir el tamaño, cuantización de las capas de visión a Q8_0 o Q4_0, y conversión de los embeddings posicionales de FP32 a FP16. Estas modificaciones reducen el fichero `mmproj-BF16` a aproximadamente el 20% de su tamaño original en la variante Q8_0, lo que facilita el despliegue en dispositivo. La licencia declarada es Apache 2.0.

El modelo es relevante para desarrolladores que necesitan ejecutar un modelo multimodal (con componentes de visión, aunque sin audio) en hardware modesto, con la ventaja de una licencia permisiva para uso comercial. No obstante, la información pública disponible es muy limitada: no se especifican idiomas, contexto, datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha refleja únicamente lo que consta en el repositorio y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; transformer presumiblemente, no confirmado en la informacion) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_0 (capas de vision); pesos en GGUF; embeddings posicionales en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7.6 GB); safetensors para el conteo de parametros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El nombre "Gemma-4-E4B" sugiere que deriva de la familia Gemma 4 de Google, pero no se confirma en la model card ni en los metadatos. El repositorio es una conversión GGUF con optimizaciones numéricas: eliminación de codificadores de audio, cuantización de capas de visión a Q8_0/Q4_0 y conversión de embeddings posicionales de FP32 a FP16. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación.

La innovación técnica destacable es la reducción del fichero de proyección multimodal (`mmproj-BF16`) a aproximadamente el 20% de su tamaño original en Q8_0, lo que rebaja los requisitos de almacenamiento para despliegue en dispositivo. No se mencionan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional (el tag `conversational` está presente en los metadatos).
- Procesamiento de visión: la model card menciona capas de visión cuantizadas, lo que implica soporte de entrada de imágenes, aunque no se detalla la resolución ni el formato.
- Sin soporte de audio: los codificadores de audio fueron eliminados explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking: no disponible.

## Casos de uso

- Despliegue en dispositivos móviles y embebidos: las optimizaciones (audio eliminado, visión cuantizada, embeddings en FP16) reducen el tamaño del fichero de proyección multimodal al 20% en Q8_0, lo que permite ejecutar el modelo en hardware con almacenamiento y memoria limitados.
- Aplicaciones de visión en el borde: al conservar capas de visión cuantizadas, puede usarse para tareas de descripción de imágenes o clasificación visual en entornos donde no cabe un modelo multimodal completo.
- Asistentes conversacionales locales: el tag `conversational` y el formato GGUF permiten integrarlo en aplicaciones de chat que se ejecutan en local sin conexión.
- Prototipado con licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales y en investigación sin restricciones de copyleft.
- Inferencia con llama.cpp u Ollama: al ser GGUF, puede cargarse en runtimes de inferencia ligeros para pruebas y demos en CPU o GPU de gama baja.
- Evaluación de modelos Gemma 4 en formato cuantizado: útil para comparar el impacto de la cuantización de visión y la conversión FP16 de embeddings frente a versiones sin optimizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7.463 millones de parámetros, una cuantización Q4_0 requeriría aproximadamente 4-5 GB y Q8_0 en torno a 8 GB, aunque son estimaciones basadas en el conteo de parámetros, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 8 GB o más para cuantizaciones Q4_0, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-QAT (este) | 7.463 M | no disponible | Apache 2.0 | GGUF | Vision cuantizada, sin audio |
| Gemma 2 9B (referencia de familia) | ~9.000 M | no disponible en esta ficha | Gemma license | safetensors/GGUF | No confirmado como equivalente |
| Llama 3.1 8B | ~8.000 M | 128K | Llama license | safetensors/GGUF | Alternativa de tamano similar |
| Qwen2.5 7B | ~7.600 M | 128K | Apache 2.0 | safetensors/GGUF | Alternativa con licencia permisiva |

Nota: la comparativa con Gemma 2 9B, Llama 3.1 8B y Qwen2.5 7B es orientativa por rango de parámetros; no se dispone de datos de rendimiento del modelo evaluado para comparar benchmarks.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Eliminación del audio: cualquier caso de uso que requiera entrada de audio no es viable con esta variante.
- Cuantización de visión a Q4_0/Q8_0: puede degradar la precisión en tareas visuales frente al modelo original en BF16.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados por el autor.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el modelo base subyacente no imponga restricciones adicionales (la model card solo declara Apache 2.0).
- Repositorio con pocas descargas (420) y un solo like: no hay evidencia de validación comunitaria extensa.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene tratar los datos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/pleasen/Gemma-4-E4B-QAT
