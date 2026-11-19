# mradermacher/Qwen3.8-27B-Uncensored-Impulsive-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Impulsive-GGUF es la versión cuantizada en formato GGUF del modelo Sorenvza/Qwen3.8-27B-Uncensored-Impulsive, un fine-tuning del modelo Qwen3 orientado a roleplay, adopción de persona y conversación. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, y ofrece un conjunto de 11 variantes de cuantización estáticas que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB).

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 27B) en formato safetensors, lo que lo sitúa en la gama de modelos densos de gran tamaño. La model card declara los idiomas indonesio (id) e inglés (en), y la licencia Apache 2.0. No se especifican en la información disponible detalles sobre la longitud de contexto, la arquitectura interna ni los datos de entrenamiento del fine-tuning.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantización GGUF, con opciones que caben en GPUs de 16-24 GB de VRAM usando Q4_K_M o Q5_K_M. El enfoque "uncensored" y de persona lo hace útil para aplicaciones de roleplay y asistentes conversacionales, aunque conviene tener presentes las advertencias sobre contenido sin filtros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3) |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura y los tags (qwen3, transformers), se trata presumiblemente de un transformer derivado de la familia Qwen3, pero no se confirman en la documentación proporcionada ni el número de capas, ni la dimensión oculta, ni el mecanismo de atención. El modelo base Sorenvza/Qwen3.8-27B-Uncensored-Impulsive es un fine-tuning orientado a roleplay, persona y conversación, bilingüe (indonesio e inglés), según los tags de la model card.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares durante el fine-tuning. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El trabajo de mradermacher consiste en la conversión y cuantización estática del modelo base a GGUF, con versiones ponderadas/imatrix disponibles en un repositorio separado (i1-GGUF).

## Capacidades

- Generación de texto conversacional orientada a roleplay y adopción de persona.
- Conversación multi-turno con mantenimiento de personaje.
- Capacidad bilingüe declarada: indonesio e inglés.
- Fine-tuning "uncensored": menor rechazo a contenido sensible o explícito que el modelo base original.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está afinado específicamente para mantener personajes y estilo conversacional, lo que lo hace adecuado para aplicaciones de entretenimiento narrativo y chatbots de personaje.
- Asistentes conversacionales en indonesio: al declarar soporte de id, puede desplegarse en productos dirigidos al mercado indonesio donde otros modelos grandes tienen menor cobertura.
- Prototipado local en hardware de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar un modelo de 27B en GPUs de 24 GB con llama.cpp u Ollama, útil para experimentación sin infraestructura cloud.
- Generación creativa sin restricciones de contenido: para proyectos de escritura, guiones o narrativa donde se requiere menor censura, con las advertencias de moderación correspondientes.
- Investigación sobre alineación y censura: comparar las respuestas del modelo "uncensored" frente al Qwen3 original permite estudiar el efecto del fine-tuning en el comportamiento del modelo.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente en formato GGUF, los datos conversacionales no salen del dispositivo, adecuado para aplicaciones sensibles.
- Evaluación de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir el impacto de la cuantización en calidad (perplejidad) y velocidad para un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ≈10,8 GB; Q3_K_S ≈12,2 GB; Q3_K_M ≈13,4 GB; Q3_K_L ≈14,4 GB; IQ4_XS ≈15,3 GB; Q4_K_S ≈15,7 GB; Q4_K_M ≈16,6 GB; Q5_K_S ≈18,8 GB; Q5_K_M ≈19,3 GB; Q6_K ≈22,2 GB; Q8_0 ≈28,7 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 y despliegues de producción con mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S y Q4_K_M caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con margen ajustado; Q5 y Q6 requieren 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Impulsive (este) | ≈27B | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tuning roleplay bilingüe id/en, uncensored |
| Qwen3 original (familia) | variable | no disponible | según variante | safetensors / GGUF | Modelo base de referencia; comportamiento más alineado |
| Otros fine-tunes roleplay GGUF de mradermacher | variable | no disponible | según base | GGUF | Misma metodología de cuantización; calidad depende del base |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": menor rechazo a contenido sensible, lo que implica riesgo de generar contenido inapropiado, ofensivo o dañino; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Idiomas declarados limitados a indonesio e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible; no se puede planificar el uso en tareas de contexto largo sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su fine-tuning pueden arrastrar condiciones adicionales no documentadas aquí; conviene revisar el repositorio del modelo base.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- El modelo tiene muy pocos likes (1) y descargas moderadas (2.374), lo que sugiere poca validación comunitaria.
- No se documentan evaluaciones de sesgo; un fine-tuning uncensored puede amplificar sesgos presentes en los datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Impulsive-GGUF
- Modelo base: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Impulsive-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Impulsive-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
