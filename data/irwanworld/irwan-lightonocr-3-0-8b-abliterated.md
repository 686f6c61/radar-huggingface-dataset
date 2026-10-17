# irwanworld/Irwan-LightOnOCR-3-0.8B-abliterated

## Resumen

Irwan-LightOnOCR-3-0.8B-abliterated es un modelo de visión-lenguaje (VLM) especializado en OCR, con aproximadamente 0,8B parámetros, publicado por el usuario irwanworld en HuggingFace. No se trata de un entrenamiento desde cero, sino de una derivación por aritmética de pesos: parte del fine-tune OCR `lightonai/LightOnOCR-3-0.8B` y le suma el delta de abliteración extraído de `huihui-ai/Huihui-Qwen3.5-0.8B-abliterated`, eliminando la tendencia a rechazar contenido explícito que el modelo OCR heredaba de su base.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`), un transformer híbrido que combina capas de atención lineal con capas de atención completa, sobre el que se monta un encoder visual de 12 capas. El contexto máximo declarado es de 262.144 tokens, el vocabulario es de 248.320 entradas y los embeddings están atados (tied). El modelo se distribuye en safetensors (bfloat16) y también en GGUF Q8_0 con fichero mmproj para el encoder visual.

Su relevancia actual radica en dos factores: por un lado, permite transcribir documentos con contenido sensible sin que el modelo trunque, resuma o rechace la tarea; por otro, su tamano (menos de 1B parámetros) y su cuantización Q8_0 (811 MB) lo hacen desplegable en CPU mediante llama.cpp, lo que abarata mucho el OCR local frente a alternativas de mayor tamano. La licencia es Apache-2.0 y los idiomas declarados son inglés (en) e indonesio (id).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`), transformer híbrido con encoder visual |
| Parametros totales | 852.985.920 (aprox. 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q8_0 publicado; safetensors en bfloat16 |
| Idiomas soportados | en, id |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q8_0 + mmproj f16) |

Datos adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Hidden size | 1.024 |
| Capas | 24 (híbrido: 3 `linear_attention` + 1 `full_attention`, repetido 6 veces) |
| Cabezas de atención | 8 query / 2 KV |
| Intermediate size | 3.584 |
| Vocabulario | 248.320 |
| Tied embeddings | sí |
| Encoder visual | depth 12, hidden 768, 12 cabezas, patch 16, spatial merge 2 |
| Tamano safetensors | 1,7 GB |
| Tamano GGUF Q8_0 | 811 MB |
| Tamano mmproj f16 | 207 MB |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 24 capas con disposición híbrida de atención: por cada bloque de cuatro capas hay tres de atención lineal (`linear_attention`) y una de atención completa (`full_attention`), patrón repetido seis veces. Esta mezcla busca reducir el coste computacional del contexto largo (declarado hasta 262.144 tokens) manteniendo la capacidad de atención global. El hidden size es de 1.024, con 8 cabezas de query y 2 de KV, intermediate size de 3.584 y vocabulario de 248.320 entradas. Los embeddings están atados. El componente visual es un encoder de 12 capas con hidden 768, 12 cabezas, patch de 16 y spatial merge de 2.

No hubo entrenamiento adicional ni fine-tuning en la creación de este modelo. El método declarado es una transferencia de abliteración (*abliteration transfer*) que aplica la siguiente aritmética de pesos, tensor por tensor y en float32 (posteriormente devuelto a bfloat16): `delta = W_abliterated - W_base`; `W_uncensored = W_ocr + alpha * delta`, con `alpha = 1.0`. El delta se obtiene de la diferencia entre `huihui-ai/Huihui-Qwen3.5-0.8B-abliterated` y el base común `Qwen/Qwen3.5-0.8B`. Se aplicaron deltas a los 473 tensores que coincidían en dimensión entre los tres modelos; los tensores exclusivos de LightOnOCR se copiaron sin modificar. No se introdujeron datos nuevos ni cambios de arquitectura. Los metadatos del injerto se registran en `config.json` bajo la clave `_uncensored_graft`.

## Capacidades

- OCR y transcripción de documentos: extracción de texto a partir de imágenes, incluyendo estructuras como recibos, facturas y documentos numerados.
- Generación de texto e interacción conversacional sobre la imagen aportada (pipeline `image-text-to-text`).
- Procesamiento multilingüe limitado a inglés (en) e indonesio (id).
- Modo de rechazo suprimido: al haber eliminado la dirección de rechazo del base, transcribe contenido explícito sin truncar, resumir ni negarse.
- Compatibilidad con llama.cpp, incluido el modo servidor OpenAI-compatible (`llama-server`) para enviar imágenes como `image_url` en `messages`.
- Integración en AnythingLLM Desktop mediante importación directa del fichero GGUF.
- Soporte de cuantización Q8_0 y uso del proyector visual (mmproj) en f16.
- No dispone de tool calling, function calling ni audio según la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos en papel: el modelo puede procesar lotes de imágenes de documentos en CPU con GGUF Q8_0 (811 MB), lo que permite montar pipelines de OCR local sin GPU dedicada ni coste por API.
- Extracción de datos de recibos y facturas: tal como muestra el ejemplo de la model card, transcribe campos como número de documento, fecha, cajero y tipo de ticket directamente desde la imagen, lo que sirve para alimentar sistemas de contabilidad automatizados.
- Indexación de corpus documentales para búsqueda: al convertir imágenes de documentos en texto plano, el resultado puede vectorizarse e integrarse en motores RAG o en bases de datos de búsqueda.
- Anonimización y auditoría de documentos sensibles: al no truncar contenido explícito, permite revisar y catalogar material que otros modelos rechazarían, útil en flujos internos de cumplimiento normativo.
- Despliegue de OCR en servidor autohospedado: mediante `llama-server` con API compatible con OpenAI, se puede ofrecer OCR como servicio interno enviando imágenes como `image_url`, sin dependencia de proveedores externos.
- Asistente de lectura de documentos integrado en escritorio: con AnythingLLM Desktop se importa el GGUF y se usa como motor local para consultar documentos e imágenes sin enviar datos a la nube.
- Preprocesado en flujos de digitalización con contexto largo: los 262.144 tokens de ventana permiten concatenar múltiples páginas transcritas en una sola sesión para tareas de resumen o extracción agregada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección titulada "Performa" (rendimiento), pero su contenido no se ha facilitado, por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni métricas específicas de OCR (por ejemplo, precisión de transcripción sobre datasets de referencia).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2 GB de pesos (safetensors de 1,7 GB) más caché KV y activaciones; valores concretos no disponibles.
- VRAM estimada en GGUF Q8_0: aproximadamente 811 MB del LLM más 207 MB del mmproj f16 (cifras de tamano de fichero declaradas, no medidas de consumo en ejecución).
- GPU recomendadas: no disponible en la documentación. Cualquier GPU consumer con al menos 4 GB de VRAM debería ser suficiente por el tamano del modelo, aunque la cifra no está confirmada.
- Compatibilidad con GPU consumer: sí, previsiblemente en modelos tipo RTX 3060/4060 y superiores, dado el tamano inferior a 1 GB en Q8_0.
- Despliegue: llama.cpp (build de `master` con soporte para `qwen3_5`), llama-server con API compatible con OpenAI, AnythingLLM Desktop (motor integrado Lemonade + llama.cpp) y transformers (safetensors).
- Es viable la inferencia en CPU pura mediante llama.cpp, según el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Irwan-LightOnOCR-3-0.8B-abliterated | 0,8B | 262.144 | en, id | apache-2.0 | safetensors + GGUF |
| lightonai/LightOnOCR-3-0.8B (base OCR) | 0,8B | no disponible | no disponible | no disponible | no disponible |
| huihui-ai/Huihui-Qwen3.5-0.8B-abliterated (fuente del delta) | 0,8B | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-0.8B (base original) | 0,8B | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros (por ejemplo, otros VLMs de OCR de la franja 0,5B-1B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas declarados únicamente inglés (en) e indonesio (id); no se garantiza un rendimiento fiable en castellano ni en otras lenguas.
- Al haber aplicado abliteración con `alpha = 1.0`, el modelo puede reproducir contenido explícito sin filtrado, lo que implica riesgos si se despliega en entornos sin supervisión o en aplicaciones de cara al público.
- Riesgo de alucinación inherente a modelos de OCR generativos: puede inventar caracteres o campos en documentos degradados, de baja resolución o con tipografías inusuales.
- Sesgos conocidos: no disponible explícitamente en la documentación, aunque el modelo hereda los del base Qwen3.5-0.8B y los del fine-tune OCR.
- Limitación de contexto: aunque se declaran 262.144 tokens, en la práctica el uso en llama.cpp se documenta con `-c 4096` en los ejemplos, muy por debajo del máximo teórico.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los modelos base (`LightOnOCR-3-0.8B` y `Qwen3.5-0.8B`) por si imponen condiciones adicionales no reflejadas aquí.
- El método de abliteración es aritmética de pesos sin validación publicada: no hay evaluación independiente de si el proceso degrada capacidades de OCR o de razonamiento.
- Requiere una build de llama.cpp con soporte para `qwen3_5`; versiones antiguas no cargarán el modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Las fechas de creación y actualización (octubre de 2026) y la referencia `arxiv:2601.14251` son posteriores al conocimiento disponible, lo que impide contrastar la existencia de un paper asociado.

## Enlaces

- HuggingFace: https://huggingface.co/irwanworld/Irwan-LightOnOCR-3-0.8B-abliterated
- Modelo base OCR: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Fuente del delta de abliteración: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated
- Referencia arXiv citada en los tags: arxiv:2601.14251 (contenido no verificado)
- Repositorio de llama.cpp (soporte `qwen3_5`): no disponible en la información proporcionada
- AnythingLLM: no disponible en la información proporcionada
