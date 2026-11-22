# mradermacher/ChatISL-7B-full-GGUF

## Resumen

ChatISL-7B-full-GGUF es la versión cuantizada en formato GGUF del modelo openisl/ChatISL-7B-full, publicada por el usuario mradermacher. El modelo original es un ajuste fino orientado a conversación y razonamiento con soporte para árabe e inglés, desarrollado por el proyecto OpenISL. Esta versión GGUF no introduce cambios en los pesos, sino que los convierte a un formato optimizado para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con aproximadamente 9.000 millones de parámetros (8.999.178.240 según los safetensors del modelo base), lo que lo sitúa en la categoría de modelos de 7-9B. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye varias cuantizaciones estáticas (Q3_K_L, Q4_K_S, Q4_K_M, Q6_K y f16), con tamaños que van desde 5,0 GB hasta 18,1 GB.

La relevancia de esta ficha radica en que facilita el despliegue local del modelo ChatISL en entornos con recursos limitados, manteniendo el enfoque bilingüe árabe-inglés y las capacidades de razonamiento del modelo original. No obstante, la información pública disponible sobre el modelo base es escasa, por lo que muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta; no disponible) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, f16 (estáticas); también existen cuantizaciones con imatrix en el repo i1-GGUF |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base ChatISL-7B-full. Por el nombre y el tamaño (≈9B parámetros) se trata presumiblemente de un transformer decoder-only, pero no se confirma en la documentación proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Los tags del modelo incluyen "reasoning" y "chatisl", lo que sugiere un entrenamiento orientado a razonamiento y conversación, pero sin datos concretos.

La versión GGUF ha sido generada por mradermacher mediante cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (i1-GGUF). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento (según el tag "reasoning" del modelo, aunque no se detallan capacidades específicas).
- Soporte de conversaciones multi-turno (pipeline "conversational" en los tags).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües limitadas a árabe e inglés según la model card.

## Casos de uso

- Asistencia conversacional en árabe: el modelo puede mantener diálogos multi-turno en árabe, adecuado para chatbots de atención al cliente en mercados de habla árabe, aunque se desconoce la longitud de contexto soportada.
- Traducción árabe-inglés: por su entrenamiento bilingüe, puede emplearse para tareas de traducción informal o asistida, siempre con revisión humana dada la falta de benchmarks publicados.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM o en CPU con llama.cpp, ideal para prototipos y entornos sin infraestructura cloud.
- Generación de texto en inglés para tareas generales: el modelo puede usarse como base para generación de contenido, resúmenes o reescritura en inglés, aunque sin garantías de rendimiento frente a modelos más documentados.
- Experimentación e investigación: útil para estudiar el comportamiento de modelos bilingües árabe-inglés de tamaño medio en entornos reproducibles con GGUF.
- Integración en pipelines de CI/CD para pruebas de modelos: al ser un GGUF ligero, puede incorporarse en tests automatizados de inferencia sin necesidad de GPUs de datacenter.
- Educación y demos: su licencia Apache 2.0 y su tamaño moderado lo hacen apto para talleres y demostraciones de inferencia local con Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB para Q4_K_S/Q4_K_M, 7,5-8 GB para Q6_K y 18-20 GB para f16 (incluyendo overhead de contexto y KV cache, que no se especifica).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más para cuantizaciones Q4; Q6_K requiere ~8-10 GB; f16 requiere ~20 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, etc.). No se documenta soporte para vLLM o TGI con GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ChatISL-7B-full-GGUF | ~9B | no disponible | ar, en | Apache 2.0 | GGUF |
| Modelos 7-8B bilingües tipo Jais (Arabic) | ~7-13B | variable | ar, en | variable | safetensors/GGUF |
| Modelos 7B generales (p. ej. Llama 3.1 8B) | 8B | 128K | multilingüe | Llama license | safetensors/GGUF |

No se dispone de datos de rendimiento comparativo para ChatISL-7B-full, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. No se conocen benchmarks públicos del modelo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo entrenado principalmente en árabe e inglés puede presentar sesgos culturales y lingüísticos propios de esos datasets.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluaciones publicadas, el riesgo es desconocido y debe asumirse alto en producción sin validación.
- Limitaciones de contexto o idioma: solo se declaran árabe e inglés; no se especifica la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene revisar openisl/ChatISL-7B-full.
- Caveats para producción: la ausencia de benchmarks, de documentación sobre entrenamiento y de datos de contexto hace desaconsejable su uso en producción crítica sin una evaluación propia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChatISL-7B-full-GGUF
- Modelo base: https://huggingface.co/openisl/ChatISL-7B-full
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/ChatISL-7B-full-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ChatISL-7B-full-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
