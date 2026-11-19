# mradermacher/gemma2-9b-cpt-sea-lionv3-instruct-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `aisingapore/Gemma-SEA-LION-v3-9B-IT`, un modelo de lenguaje conversacional de aproximadamente 9.240 millones de parámetros (9,24 B) construido sobre la arquitectura Gemma 2 y adaptado por AI Singapore para el sudeste asiático. El trabajo de cuantización lo firma mradermacher, que publica versiones comprimidas listas para ejecutarse con llama.cpp y ecosistemas compatibles, desde Q2_K (3,9 GB) hasta f16 (18,6 GB).

El interés principal de esta ficha es la combinación de un modelo base Gemma 2 de 9 B con un ajuste específico para idiomas del sudeste asiático (inglés, chino, vietnamita, indonesio, tailandés, filipino, tamil, malayo, jemer, lao, birmano, javanés y sondanés) y una licencia MIT declarada en el repositorio. Esa licencia MIT, más permisiva que la Gemma original, es un dato relevante para despliegues comerciales, aunque conviene verificar su alcance en el modelo base.

La relevancia práctica de este repositorio es que permite ejecutar un modelo multilingüe de 9 B en hardware de consumo gracias a las cuantizaciones de 4 y 5 bits, y en servidores con GPU única mediante Q8_0 o f16. No obstante, la información pública disponible sobre el modelo base (contexto, datos de entrenamiento, benchmarks) es muy limitada en la documentación proporcionada, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 2, según el nombre del modelo; detalles no disponibles en la información proporcionada) |
| Parametros totales | 9.241.705.984 (~9,24 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, km, lo, my, jv, su |
| Licencia | MIT (según la model card del repositorio de cuantización) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es `aisingapore/Gemma-SEA-LION-v3-9B-IT`, una adaptación del Gemma 2 de 9 B de Google realizada por AI Singapore, orientada a instrucciones y conversación en idiomas del sudeste asiático. El nombre del repositorio indica un proceso de continued pre-training (CPT) seguido de instruction tuning (IT) sobre el checkpoint Gemma 2. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras preferencias.

Este repositorio concreto no entrena el modelo: solo produce cuantizaciones estáticas en formato GGUF a partir del checkpoint original. Según la model card, las cuantizaciones ponderadas/imatrix están en un repositorio separado (`mradermacher/gemma2-9b-cpt-sea-lionv3-instruct-i1-GGUF`). No se documentan innovaciones arquitectónicas adicionales más allá de las propias de Gemma 2.

## Capacidades

- Generación de texto conversacional multi-turno en los 13 idiomas listados.
- Instrucciones y diálogo (el sufijo IT indica instruction tuning).
- Cobertura multilingüe específica del sudeste asiático: inglés, chino, vietnamita, indonesio, tailandés, filipino, tamil, malayo, jemer, lao, birmano, javanés y sondanés.
- Ejecución local eficiente mediante cuantizaciones GGUF de 3,9 GB a 18,6 GB.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la librería transformers para el modelo base.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Atención al cliente en mercados del sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés o vietnamita, lo que permite desplegar un único modelo para varios países de la región en lugar de uno por idioma.
- Traducción y localización de contenidos: adecuado para traducciones entre inglés y lenguas regionales (javanés, sondanés, jemer, lao, birmano), un nicho poco cubierto por modelos generalistas.
- Procesamiento de documentación administrativa regional: resumen y extracción de información de textos en tamil, filipino o malayo, con despliegue en servidores modestos gracias a las cuantizaciones de 4 bits.
- Asistentes conversacionales embebidos en dispositivos: la cuantización Q4_K_M (5,9 GB) permite ejecutar el modelo en GPU de consumo de 8 GB o en CPU con suficiente RAM, útil para prototipos y demos.
- Investigación en NLP de lenguas de bajos recursos: sirve como línea base multilingüe para experimentos con javanés, sondanés, jemer, lao o birmano, idiomas con poca cobertura en modelos abiertos.
- Moderación y clasificación de texto regional: análisis de sentimiento o filtrado de contenido en idiomas del sudeste asiático en pipelines de ingestión de datos.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT declarada facilita la integración en productos comerciales, previa verificación del alcance sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~3,9 GB; Q3_K_M ~4,9 GB; IQ4_XS ~5,3 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,6 GB. Añadir margen para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M con contexto moderado; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues concurrentes con f16 y contexto largo.
- Cabe en GPU de consumo: sí, al menos desde Q2_K hasta Q6_K en tarjetas de 8-12 GB; Q8_0 requiere ~12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El modelo base en safetensors es compatible con transformers y, potencialmente, con vLLM/TGI si la arquitectura Gemma 2 está soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas del SEA | Licencia | Formato |
|---|---|---|---|---|---|
| gemma2-9b-cpt-sea-lionv3-instruct (este) | ~9,24 B | No disponible | Sí (13 idiomas) | MIT (declarada) | GGUF / safetensors |
| Gemma 2 9B IT (Google) | ~9,24 B | No disponible en esta ficha | Limitado | Gemma Terms | safetensors, GGUF (comunidad) |
| SEA-LION v2 / otros modelos regionales de AI Singapore | No disponible | No disponible | Parcial | No disponible | No disponible |
| Qwen2.5 7B Instruct | ~7,6 B | 32.768 tokens (referencia pública) | Chino e inglés principalmente | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a características estructurales; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La model card de este repositorio no documenta sesgos, evaluación de seguridad ni datos de alineación; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a modelos de 9 B; no hay evaluaciones publicadas en la información disponible.
- La cobertura de idiomas es amplia en el sudeste asiático, pero la calidad relativa por idioma no está documentada; el javanés, sondanés, jemer, lao y birmano suelen tener menos datos y podrían rendir peor.
- La licencia MIT figura en el repositorio de cuantización, pero el modelo base Gemma 2 está sujeto a los términos de Google; conviene verificar la compatibilidad antes de un uso comercial.
- Las cuantizaciones de 2 y 3 bits degradan la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- No se dispone de información sobre longitud de contexto efectiva, soporte de tool calling ni modo de razonamiento; no asumir estas capacidades en producción.
- El repositorio ocupa 83,5 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma2-9b-cpt-sea-lionv3-instruct-GGUF
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v3-9B-IT
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma2-9b-cpt-sea-lionv3-instruct-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#gemma2-9b-cpt-sea-lionv3-instruct-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
