# halilgokdal/mirror-aydin99-FLUX.2-klein-4B-int8

## Resumen

Este repositorio es un espejo (mirror) de `aydin99/FLUX.2-klein-4B-int8`, una versión cuantizada a 8 bits del modelo de difusión FLUX.2 klein de 4B parámetros. Lo publica el usuario `halilgokdal` con el único propósito de garantizar la disponibilidad de los pesos para una aplicación personal de iPad, verificando que los ficheros son idénticos byte a byte (SHA-256) al repositorio original en el commit `f38839c94b597211dea83b1326f1bb4ce4142524`. No se trata de un modelo entrenado por el autor del espejo, sino de una copia de seguridad de los pesos originales.

El modelo pertenece a la familia FLUX.2 (modelos de generación de imágenes de Black Forest Labs) en su variante "klein", la más pequeña de la familia, con aproximadamente 3.876 millones de parámetros en formato safetensors. La cuantización int8 reduce el tamaño del repositorio a unos 3,9 GB, lo que facilita su despliegue en hardware con recursos limitados, incluyendo dispositivos Apple mediante Core ML (de ahí la etiqueta `coreml`).

La relevancia de este repositorio es fundamentalmente práctica: sirve como respaldo de un modelo de generación de imágenes que de otro modo podría desaparecer si el repositorio original se elimina. Para desarrolladores e investigadores, el interés está en la disponibilidad de los pesos cuantizados de FLUX.2 klein, no en aportaciones técnicas propias del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusers); detalles de la arquitectura interna no disponibles |
| Parametros totales | 3.876.561.536 (≈3,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | int8 (8 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (según la model card del original); el repositorio figura como "other" |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste (RLHF, DPO u otros) en la información proporcionada. El modelo se distribuye a través de la librería `diffusers`, lo que indica que es un modelo de difusión para generación de imágenes, y la etiqueta `coreml` sugiere que los pesos están pensados para ser convertidos y ejecutados en el ecosistema Core ML de Apple. La única innovación técnica documentada en este repositorio es la cuantización a 8 bits de los pesos originales, que reduce el tamaño del modelo a aproximadamente 3,9 GB.

La model card del espejo no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas de optimización. Tampoco se documenta si el modelo original emplea atención lineal, decodificación especulativa u otras innovaciones. Toda esta información debería consultarse en el repositorio original de FLUX.2 klein, que no está disponible en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), según la naturaleza del modelo FLUX.2 klein.
- Ejecución en dispositivos Apple mediante Core ML, gracias a la etiqueta `coreml` y al caso de uso declarado (aplicación para iPad).
- Inferencia con pesos cuantizados a 8 bits, lo que reduce los requisitos de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Aplicaciones móviles de generación de imágenes en iPad: el modelo está empaquetado para Core ML y su tamaño de 3,9 GB permite descargarlo y ejecutarlo en un dispositivo Apple, como demuestra el caso de uso declarado por el autor del espejo.
- Prototipado rápido de pipelines de difusión: al estar en formato `diffusers` con pesos safetensors, se puede cargar directamente en scripts de Python para experimentar con generación de imágenes.
- Despliegue en hardware con VRAM limitada: la cuantización int8 reduce el espacio en memoria frente a los pesos en precisión completa, lo que permite ejecutar el modelo en GPUs de consumo.
- Respaldo y reproducibilidad de experimentos: al ser un espejo verificado con SHA-256, garantiza que los pesos no cambien y que los resultados sean reproducibles a largo plazo.
- Investigación sobre cuantización: sirve como referencia para comparar la calidad de generación entre los pesos originales y la versión int8.
- Integración en aplicaciones de escritorio o web con backend Python: mediante la librería `diffusers` se puede exponer un servicio de generación de imágenes sobre el modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 3,88 mil millones de parámetros en int8, los pesos ocupan unos 3,9 GB; se necesita memoria adicional para activaciones y buffers, por lo que se recomienda al menos 6-8 GB de VRAM para inferencia en GPU.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs de consumo como la RTX 3060 (12 GB) o superiores, aunque no se confirma.
- Cabe en GPU de consumo: probablemente sí, en modelos con 8 GB o más de VRAM, aunque no está confirmado.
- Opciones de despliegue: `diffusers` (formato nativo), Core ML (etiqueta del repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre otros modelos de la familia FLUX.2 ni sobre alternativas comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: el autor del espejo no es el autor original del modelo, y cualquier problema de calidad o seguridad debe atribuirse a los autores originales.
- La licencia figura como "other" en los metadatos del repositorio, aunque la model card indica Apache-2.0 para los pesos originales; conviene verificar los términos exactos antes de un uso comercial.
- La cuantización int8 puede degradar la calidad de las imágenes generadas respecto a los pesos en precisión completa; no se documenta el grado de degradación.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de información sobre el pipeline de inferencia ni sobre los parámetros de muestreo recomendados.
- Al ser un modelo de generación de imágenes, no debe evaluarse con métricas de modelos de lenguaje (MMLU, HumanEval, GSM8K).

## Enlaces

- Repositorio del espejo: https://huggingface.co/halilgokdal/mirror-aydin99-FLUX.2-klein-4B-int8
- Repositorio original: https://huggingface.co/aydin99/FLUX.2-klein-4B-int8
- Commit de referencia del original: `f38839c94b597211dea83b1326f1bb4ce4142524`
