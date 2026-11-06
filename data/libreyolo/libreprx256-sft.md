# LibreYOLO/LibrePRX256-sft

## Resumen

LibrePRX256-sft es un espejo (mirror) del modelo de generación de imágenes a partir de texto `Photoroom/prx-256-t2i-sft`, publicado por el usuario LibreYOLO bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son byte a byte idénticos a los del repositorio original de Photoroom y conservan la disposición de pipeline de `diffusers`, de modo que pueden cargarse directamente con esa librería. El repositorio ocupa 15,5 GB e incluye el transformer de difusión, el codificador de texto y el VAE.

El modelo es un transformer de difusión text-to-image de 1,3 mil millones de parámetros entrenado desde cero por Photoroom, con resolución nativa de 256 píxeles. Utiliza un codificador de texto T5Gemma de 2B y el VAE de FLUX.1 [schnell]. Esta variante concreta corresponde al ajuste fino supervisado (SFT) sobre el modelo base, listo para su uso directo en inferencia.

Su relevancia radica en que ofrece un pipeline de generación de imágenes completo y abierto con pesos Apache-2.0 (salvo el codificador T5Gemma, sujeto a los términos de Gemma), lo que facilita su integración en herramientas de código abierto como la librería `libreyolo`. Al ser un espejo, su valor principal es la disponibilidad y la reproducibilidad mediante hashes SHA-256 verificables, no la aportación de capacidades nuevas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image) con codificador de texto T5Gemma 2B y VAE de FLUX.1 [schnell] |
| Parámetros totales | 1,3B (transformer de difusión); codificador de texto T5Gemma de 2B adicional |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos PRX y VAE FLUX.1); T5Gemma bajo Gemma Terms of Use |
| Formato de pesos | safetensors (text_encoder en 3 shards, transformer, vae) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión basada en transformer para generación de imágenes condicionada por texto. El componente generativo es un transformer de 1,3B de parámetros entrenado desde cero por Photoroom, con resolución nativa de 256 píxeles. El condicionamiento textual se realiza mediante un codificador T5Gemma de 2B, y la decodificación al espacio de píxeles emplea el VAE de FLUX.1 [schnell]. Esta ficha corresponde a la variante con ajuste fino supervisado (SFT) del modelo base.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de RLHF o DPO. El repositorio es un espejo sin modificaciones: los pesos no han sido reentrenados, convertidos ni recodificados, y se mantiene la revisión upstream `1b8e70f4dd51170fe7c03402f1891c15455d7447`. La integridad de los ficheros se documenta mediante hashes SHA-256 por cada shard del codificador de texto, el transformer y el VAE.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución nativa de 256 píxeles.
- Condicionamiento textual mediante codificador T5Gemma de 2B.
- Integración nativa con `diffusers` gracias a la disposición de pipeline upstream.
- Uso mediante la librería `libreyolo` a través de la clase `LibreGen` y de la CLI `libreyolo generate`.
- Capacidades multilingües: no disponible (no se especifican idiomas soportados).
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica (modelo de generación de imágenes).
- Capacidades de visión, audio o modo thinking: no disponible.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: el modelo permite obtener imágenes de 256 píxeles a partir de prompts en una sola llamada, adecuado para maquetas y pruebas de concepto en interfaces.
- Creación de assets para videojuegos o aplicaciones: con resolución nativa de 256, encaja en la generación de sprites, iconos o texturas de baja resolución que luego se reescalan en el pipeline.
- Pruebas de concepto en investigación sobre difusión: al ser un transformer entrenado desde cero con pesos abiertos, sirve para estudiar dinámicas de difusión y comparar codificadores de texto.
- Integración en herramientas de código abierto: la API `LibreGen` y la CLI de `libreyolo` permiten incorporar generación de imágenes en scripts y flujos automatizados sin depender de servicios externos.
- Reproducibilidad y auditoría de modelos: los hashes SHA-256 y la revisión upstream fijada permiten verificar que los pesos desplegados son idénticos a los publicados por Photoroom.
- Generación por lotes en pipelines locales: el tamaño de 1,3B en el transformer facilita el despliegue en entornos con recursos moderados frente a modelos de difusión de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, el repositorio completo ocupa 15,5 GB en safetensors, lo que incluye transformer, codificador T5Gemma de 2B y VAE.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del transformer (1,3B) más el codificador de 2B y el VAE, por lo que conviene verificar requisitos antes de desplegar.
- Opciones de despliegue: `diffusers` (carga directa de la carpeta) y `libreyolo` con el extra `libreyolo[gen]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX256-sft | 1,3B (transformer) + T5Gemma 2B | 256 | no disponible | Apache-2.0 (T5Gemma bajo Gemma Terms) | Hugging Face (espejo) |
| Photoroom/prx-256-t2i-sft (upstream) | 1,3B (transformer) + T5Gemma 2B | 256 | no disponible | Apache-2.0 (T5Gemma bajo Gemma Terms) | Hugging Face |
| Otras alternativas text-to-image | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no aporta mejoras ni cambios respecto a `Photoroom/prx-256-t2i-sft`; cualquier limitación del modelo upstream se hereda íntegramente.
- Resolución nativa limitada a 256 píxeles, insuficiente para aplicaciones que requieran detalle fino sin reescalado posterior.
- El codificador de texto T5Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones de uso adicionales a la licencia Apache-2.0 de los pesos PRX.
- Sesgos conocidos: no disponible en la información proporcionada; los modelos text-to-image suelen reflejar sesgos de sus datos de entrenamiento, pero no se documentan aquí.
- Riesgo de alucinación visual y de fidelidad limitada al prompt: no cuantificado en la información disponible.
- Idiomas soportados no especificados, lo que impide garantizar un rendimiento homogéneo en castellano u otras lenguas.
- Tipos de cuantización no documentados; no se garantiza el funcionamiento con formatos distintos de safetensors.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/LibreYOLO/LibrePRX256-sft
- Repositorio upstream: https://huggingface.co/Photoroom/prx-256-t2i-sft
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
