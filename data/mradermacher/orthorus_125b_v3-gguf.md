# mradermacher/orthorus_125b_v3-GGUF

## Resumen

Orthorus 125B v3 es un modelo de lenguaje de gran escala (125.349.404.672 parámetros, aproximadamente 125,3 mil millones) desarrollado por el usuario ibivibiv y publicado en Hugging Face bajo licencia Apache 2.0. El repositorio analizado, `mradermacher/orthorus_125b_v3-GGUF`, no contiene los pesos originales sino las cuantizaciones GGUF generadas por mradermacher, un conocido creador de cuantizaciones para llama.cpp, a partir del modelo base `ibivibiv/orthorus_125b_v3`.

El modelo está etiquetado como conversacional (`conversational`) y orientado a inglés (`en`), y se distribuye con la librería `transformers`. La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 125B mediante cuantizaciones que van desde 46 GB (Q2_K) hasta 133,3 GB (Q8_0), lo que lo sitúa en el rango de despliegues multi-GPU o estaciones de trabajo de gama alta, no en GPU de consumo convencionales.

No se dispone de información pública sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks en la documentación proporcionada; la model card del repositorio se limita a listar las cuantizaciones disponibles y remitir a la página del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer conversacional; detalles no publicados en la información disponible) |
| Parámetros totales | 125.349.404.672 (≈125,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones con imatrix en el repo `orthorus_125b_v3-i1-GGUF` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors vía `transformers` |
| Modelo base | ibivibiv/orthorus_125b_v3 |
| Tamaño del repositorio | 850,7 GB |
| Fecha de creación | 2024-11-27 |
| Última actualización | 2026-11-06 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por el tamaño (125,3 B de parámetros) y la etiqueta `transformers` con pipeline conversacional, se trata con alta probabilidad de un transformer decoder-only de gran escala, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos (MoE) u otra variante. Tampoco se especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto nativa.

Respecto al entrenamiento, la información disponible no detalla el volumen de tokens, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio de cuantizaciones es puramente operativa: describe los ficheros GGUF generados, los tamaños y las recomendaciones de uso de llama.cpp, sin datos sobre el proceso de entrenamiento del modelo original. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión en la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Despliegue conversacional local en inglés: el modelo puede ejecutarse con llama.cpp u otros runners compatibles con GGUF para mantener conversaciones multi-turno en inglés, aprovechando las cuantizaciones Q4_K_M (75,7 GB) o Q5_K_M (88,9 GB) como equilibrio entre calidad y requisitos de memoria.
- Investigación sobre cuantización a gran escala: el repositorio ofrece 11 variantes de cuantización del mismo modelo, lo que permite estudiar la degradación de calidad (perplejidad) entre Q2_K y Q8_0 en un modelo de 125B, un tamaño poco habitual en el ecosistema GGUF.
- Evaluación comparativa de modelos grandes en hardware multi-GPU: útil para laboratorios que quieran medir throughput y latencia de un 125B cuantizado en configuraciones de 2 a 4 GPU profesionales (A100 80 GB, H100 80 GB).
- Servicio de generación de texto autoalojado con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos sin obligaciones de copyleft, siempre que se cumplan las condiciones de atribución.
- Fine-tuning o experimentación sobre el modelo base: el repo base `ibivibiv/orthorus_125b_v3` puede servir como punto de partida para ajuste fino supervisado en dominios específicos en inglés.
- Pruebas de estrés de infraestructura de inferencia: el tamaño del repo (850,7 GB) y los ficheros multi-parte (hasta 3 partes en Q6_K y Q8_0) permiten validar pipelines de descarga, concatenación y carga de modelos de gran volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni KV cache):
  - Q2_K: ~46,0 GB
  - Q3_K_S: ~54,2 GB
  - Q3_K_M: ~60,2 GB
  - Q3_K_L: ~65,3 GB
  - IQ4_XS: ~67,6 GB
  - Q4_K_S: ~71,4 GB
  - Q4_K_M: ~75,7 GB
  - Q5_K_S: ~86,3 GB
  - Q5_K_M: ~88,9 GB
  - Q6_K: ~102,9 GB
  - Q8_0: ~133,3 GB
- GPU recomendadas: para Q4_K_M (~76 GB) se necesitan al menos 2 GPU de 48 GB (p. ej., 2× RTX A6000 o 2× L40S) o una H100/A100 de 80 GB con margen ajustado. Para Q6_K y Q8_0 se recomiendan configuraciones de 2× H100 80 GB o 4× A100 40 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 24 GB, RTX 3090 24 GB) ni siquiera en Q2_K, que requiere ~46 GB. Sería necesario repartir entre varias GPU o usar CPU+RAM (offloading), con latencia muy alta.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y runners compatibles con GGUF como LM Studio o KoboldCpp. vLLM y TGI no consumen GGUF de forma nativa para este tamaño sin conversión; el modelo base en safetensors podría cargarse en vLLM/TGI si se dispone de suficiente VRAM agregada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Orthorus 125B v3 (este) | 125,3 B | no disponible | Apache 2.0 | GGUF (cuantizaciones) y safetensors (base) | Hugging Face, 10 descargas |
| mradermacher/orthorus_v3_125b-GGUF | no disponible (variante previa del mismo linaje) | no disponible | no disponible en la información | GGUF | Hugging Face |
| mradermacher/orthorus_v3_125b-i1-GGUF | no disponible (variante con imatrix) | no disponible | no disponible en la información | GGUF (imatrix) | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos de ~120-130B). La comparativa se limita a las variantes del mismo linaje Orthorus publicadas por mradermacher.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información pública sobre arquitectura, datos de entrenamiento, contexto ni alineación, lo que dificulta evaluar su calidad y seguridad antes de desplegarlo.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su fiabilidad factual.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Sesgos: no documentados; al no conocerse la composición del corpus de entrenamiento, no pueden evaluarse sesgos de género, raza, religión o políticos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar avisos de copyright y licencia; conviene verificar que el modelo base `ibivibiv/orthorus_125b_v3` mantiene la misma licencia y no arrastra restricciones adicionales.
- Requisitos de hardware muy elevados: incluso la cuantización más pequeña (Q2_K, 46 GB) excede la VRAM de cualquier GPU de consumo; el despliegue en producción requiere infraestructura multi-GPU profesional.
- Ficheros multi-parte: Q3_K_S en adelante se distribuyen en 2 o 3 partes que deben concatenarse correctamente antes de su uso con llama.cpp.
- Madurez del proyecto: 10 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de soporte activo más allá de las actualizaciones del repositorio.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/mradermacher/orthorus_125b_v3-GGUF
- Modelo base: https://huggingface.co/ibivibiv/orthorus_125b_v3
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/orthorus_125b_v3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#orthorus_125b_v3-GGUF
- Variante previa del linaje: https://huggingface.co/mradermacher/orthorus_v3_125b-GGUF
- Variante previa con imatrix: https://huggingface.co/mradermacher/orthorus_v3_125b-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
