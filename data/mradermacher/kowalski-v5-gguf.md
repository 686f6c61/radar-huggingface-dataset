# mradermacher/Kowalski-V5-GGUF

## Resumen

Kowalski-V5-GGUF es la versión cuantizada en formato GGUF del modelo ChikenBoy/Kowalski-V5, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad de llama.cpp. El modelo base es un transformer de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) derivado de la familia Qwen3, según indican las etiquetas del repositorio, y está especializado en ruso, matemáticas y código mediante fine-tuning supervisado (SFT).

La relevancia de esta publicación es eminentemente práctica: al ofrecer cuantizaciones que van desde Q2_K (3,4 GB) hasta f16 (16,5 GB), permite ejecutar un modelo de 8B en hardware de consumo, desde portátiles con 8 GB de RAM hasta estaciones con GPU dedicada. El repositorio incluye además ficheros mmproj (Q8_0 y f16), lo que sugiere soporte multimodal en el modelo base, aunque la model card no detalla las capacidades de visión.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a conversaciones (tag "conversational"), con soporte declarado de ruso e inglés. La información pública disponible es escasa: no hay benchmarks, no hay detalle sobre el dataset de entrenamiento ni sobre el proceso de alineación, y el modelo base tan solo cuenta con una model card mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, según tags del repo) |
| Parámetros totales | 8.190.735.360 (~8,2B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base ChikenBoy/Kowalski-V5 es un transformer denso de aproximadamente 8,2 mil millones de parámetros, construido sobre la arquitectura Qwen3 según las etiquetas del repositorio (tag `qwen3`). La model card del autor original no está disponible en la información proporcionada, por lo que no se puede confirmar el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa.

Las etiquetas indican que el modelo ha pasado por una fase de SFT (supervised fine-tuning) con especial énfasis en ruso, matemáticas y código. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La presencia de ficheros mmproj en la cuantización sugiere que el modelo base incorpora un proyector multimodal para visión, pero no se detalla qué codificador visual utiliza ni qué resolución de imagen admite.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento matemático, presumiblemente reforzado por el fine-tuning SFT orientado a `math`.
- Generación y comprensión de código, según la etiqueta `code`.
- Soporte multimodal potencial (ficheros mmproj incluidos), aunque no se documenta el alcance exacto de la visión.
- Formato conversacional (tag `conversational`), apto para diálogo multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No hay información sobre tool calling, function calling, uso de agentes o modo thinking explícito.

## Casos de uso

- Asistencia conversacional en ruso: el modelo puede gestionar diálogos multi-turno en ruso con un tamaño de 8B, adecuado para despliegues en entornos donde no se dispone de GPUs de gran capacidad y se prioriza el idioma ruso.
- Generación de código en pipelines de desarrollo: gracias a su especialización en código y su formato GGUF, puede integrarse en asistentes locales de programación (por ejemplo, con llama.cpp u Ollama) sin depender de APIs externas.
- Resolución de problemas matemáticos: el fine-tuning orientado a matemáticas lo hace útil para tutores automáticos o herramientas de verificación de ejercicios, ejecutándose en local.
- Procesamiento de documentación técnica bilingüe (ru/en): puede resumir, traducir o reescribir documentación en ambos idiomas, aprovechando su naturaleza conversacional.
- Prototipado rápido en estaciones de trabajo: con la cuantización Q4_K_M (5,1 GB) se puede ejecutar en una GPU de consumo de 8 GB de VRAM, lo que permite iterar en prototipos de aplicaciones de IA sin infraestructura en la nube.
- Análisis de imágenes con texto (si la funcionalidad multimodal está operativa): los ficheros mmproj permiten, en teoría, tareas de descripción de imágenes o extracción de información visual, aunque la falta de documentación obliga a validar esta capacidad empíricamente.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local con licencia Apache 2.0, puede ejecutarse en infraestructura propia para datos sensibles en ruso o inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~3,4 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - Q4_K_M: ~5,1 GB de pesos; ~6-7 GB de VRAM con contexto moderado.
  - Q8_0: ~8,8 GB de pesos; ~10-11 GB de VRAM.
  - f16: ~16,5 GB de pesos; ~18-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no son necesarias para un modelo de 8B, pero permiten mayor throughput y contexto.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (Q4_K_M o Q5_K_M) hasta una RTX 4090 (Q8_0 o f16). Las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en GPUs de 6-8 GB o en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (previa conversión).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend. Como referencia cualitativa, un 8B en Q4_K_M en una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kowalski-V5-GGUF | ~8,2B | no disponible | ru, en | Apache 2.0 | GGUF | Fine-tuning SFT en ruso, math y code |
| Qwen3-8B | ~8B | no disponible en esta ficha | multilingüe | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo base de referencia de la familia |
| Llama 3.1 8B | ~8B | 128K (según documentación pública de Meta) | multilingüe | Llama 3.1 Community License | safetensors, GGUF | Amplia adopción y ecosistema |
| Mistral 7B | ~7,2B | 32K (según documentación pública de Mistral) | principalmente en | Apache 2.0 | safetensors, GGUF | Referencia en modelos pequeños abiertos |

La comparativa es orientativa: no se dispone de datos de rendimiento de Kowalski-V5 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad real frente a otros modelos de 8B.
- Model card del modelo base extremadamente escasa: se desconoce la composición del dataset, el proceso de alineación y las posibles contaminaciones.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en tareas de razonamiento complejo o matemáticas avanzadas.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Soporte limitado a ruso e inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- La funcionalidad multimodal (mmproj) no está documentada; podría no estar operativa o requerir configuración específica.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3 conviene verificar las obligaciones de atribución de la familia base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Las cuantizaciones IQ (imatrix) no están disponibles según el autor; solo hay cuantizaciones estáticas, lo que puede suponer una ligera pérdida de calidad frente a las ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kowalski-V5-GGUF
- Modelo base: https://huggingface.co/ChikenBoy/Kowalski-V5
- Página de descargas del autor: https://hf.tst.eu/model#Kowalski-V5-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
