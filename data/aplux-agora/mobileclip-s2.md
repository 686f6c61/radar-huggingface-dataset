# APLUX-Agora/MobileClip-S2

## Resumen

MobileClip-S2 es un modelo de clasificación de imágenes publicado por APLUX-Agora dentro de su catálogo Agora, orientado a despliegue en hardware Qualcomm para escenarios AIoT (inteligencia artificial en el borde). El repositorio no contiene los pesos originales del modelo, sino recursos convertidos y empaquetados ("Model Farm") listos para ejecutarse en placas concretas con el runtime QNN de Qualcomm. La model card identifica la tarea como clasificación con entradas de imagen y texto, y salidas de etiqueta, embedding y JSON.

El modelo se distribuye con builds verificados por placa. Según la información disponible, la única placa validada es la QCS8550 montada en la Rhino Pi X1, con precisión FP16 y una latencia medida de 7,2 ms por inferencia. El paquete incluye `model.json` por SoC, directorios por precisión y binarios de contexto (`model.bin`), además de instrucciones de descarga mediante `hf download` y referencias a la plataforma Agora para preprocesado, postprocesado y guía de despliegue.

La relevancia del modelo reside en su enfoque de despliegue: no es una publicación de investigación con pesos entrenados desde cero, sino un artefacto de conversión y validación para inferencia en el borde sobre aceleradores Qualcomm. No se dispone de información sobre arquitectura interna, número de parámetros, datos de entrenamiento ni resultados de benchmarks más allá de la latencia medida en la placa indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de imágenes con entrada de texto; arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (única precisión documentada para QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (license: other; license_name: aplux-model-farm) |
| Formato de pesos | recursos convertidos para QNN: `model.json` por SoC, directorios por precisión y binarios de contexto `model.bin`; tamaño del repo 0,2 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de backbone, número de capas, mecanismos de atención ni resolución de entrada). La model card solo describe la interfaz de la tarea: entrada de imagen y texto, salida de etiqueta, embedding y JSON. El nombre "MobileClip" sugiere una familia de modelos ligeros de tipo CLIP orientados a dispositivos móviles, pero la información proporcionada no confirma la arquitectura ni la relación con dicha familia.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de ajuste (RLHF, DPO u otros). Lo que sí se describe es el proceso de conversión y validación: los recursos se generan con el preprocesado y los ejemplos oficiales de Model Farm y se verifican placa a placa. El artefacto publicado es, por tanto, un paquete de despliegue para el runtime QNN de Qualcomm, no una ficha de entrenamiento.

## Capacidades

- Clasificación de imágenes: la tarea declarada es `image-classification`, con salida de etiqueta (`label`).
- Generación de embeddings: la salida incluye un vector `embedding`, lo que permite usos de similitud o recuperación si el modelo subyacente lo soporta.
- Entrada multimodal: acepta imagen y texto como entradas, según la especificación de inputs de la model card.
- Salida estructurada: además de etiqueta y embedding, produce una salida `out` en formato JSON.
- Despliegue en el borde: recursos preparados para ejecución en placas Qualcomm con QNN, con builds por SoC y precisión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): solo se documenta la entrada de imagen y texto; no se detallan modos adicionales.

## Casos de uso

- Clasificación de imágenes en dispositivos AIoT: el modelo está empaquetado para ejecutarse en la QCS8550 con FP16 y 7,2 ms de latencia, lo que permite clasificar imágenes en el propio dispositivo sin enviar datos a la nube.
- Inspección visual en el borde: en líneas de fabricación o control de calidad, el modelo puede etiquetar imágenes capturadas localmente y devolver la clase detectada, aprovechando la latencia medida en la placa validada.
- Búsqueda y recuperación por similitud: la salida `embedding` permite indexar imágenes y comparar vectores para búsqueda visual, siempre que se valide el comportamiento del embedding en el caso concreto.
- Filtrado y enrutado de contenido visual: la salida JSON facilita integrar la clasificación en pipelines que deciden el siguiente paso (almacenar, alertar o descartar) según la etiqueta obtenida.
- Prototipado rápido en hardware Qualcomm: al incluir `model.json`, directorios por precisión y binarios de contexto, el paquete sirve para validar la integración con QNN antes de construir un producto.
- Despliegue con preprocesado reproducible: la model card remite a los ejemplos oficiales de Model Farm y a la guía de despliegue de Agora, lo que facilita reproducir el pipeline de preprocesado y postprocesado en producción.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Latencia de inferencia | 7,2 ms | QCS8550 · Rhino Pi X1, precisión FP16, medida en Agora (precisión por defecto) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, precisión de clasificación u otros) en la información disponible. El único dato de rendimiento es la latencia medida en la placa indicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está orientado a aceleradores Qualcomm, no a GPU de escritorio.
- GPU recomendadas: no aplica según la información disponible; el hardware documentado es el SoC QCS8550 en la placa Rhino Pi X1.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en tarjetas gráficas convencionales.
- Opciones de despliegue: runtime QNN de Qualcomm con los recursos de Model Farm; la plataforma Agora ofrece preprocesado, postprocesado, runner y guía de despliegue.
- Latencia y throughput: 7,2 ms por inferencia en QCS8550 con FP16 (precisión por defecto). No se documenta throughput agregado ni latencias en otras placas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, ni datos de parámetros, contexto o rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Cobertura de hardware limitada: solo se documenta una placa validada (QCS8550 · Rhino Pi X1) y una única precisión (FP16); no hay datos de otras placas ni de cuantizaciones adicionales.
- Licencia restrictiva: los recursos convertidos se rigen por la APLUX Model Farm License, y la licencia del modelo fuente remite a los términos del modelo original; es necesario revisar ambos documentos antes de un uso comercial.
- Procedencia y términos del modelo fuente: la model card indica "see the original model's terms" sin detallar qué modelo original es ni sus condiciones, lo que añade incertidumbre legal.
- Falta de transparencia técnica: no se publican arquitectura, parámetros, datos de entrenamiento ni evaluación de calidad, lo que impide estimar sesgos o precisión esperada.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible; al ser un modelo de clasificación, el riesgo principal sería la asignación errónea de etiquetas, pero no hay datos para cuantificarlo.
- Idiomas: no se especifican los idiomas soportados, lo que afecta a cualquier uso que dependa de la entrada de texto.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-11-09), lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- Dependencia de la plataforma: el flujo de despliegue está ligado a Agora y a Model Farm, lo que puede limitar la portabilidad a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/MobileClip-S2
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MobileClip-S2/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora: https://mega.aidlux.com
- Página del modelo en Agora: https://mega.aidlux.com/models/mobileclip-s2
