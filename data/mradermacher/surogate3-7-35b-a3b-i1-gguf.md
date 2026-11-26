# mradermacher/Surogate3.7-35B-A3B-i1-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Surogate, distribuido originalmente bajo licencia Apache 2.0. El repositorio analizado aquí no contiene los pesos originales, sino las cuantizaciones GGUF generadas por mradermacher, un conocido publicador de versiones cuantizadas de modelos abiertos. El modelo base cuenta con 35.505.251.456 parámetros totales (aproximadamente 35,5 mil millones) y, por su nomenclatura "A3B", se infiere una arquitectura MoE con unos 3 mil millones de parámetros activos por token, aunque el dato exacto de parámetros activos no está confirmado en la información disponible.

El modelo está orientado a tareas de agente, uso de herramientas (tool-use) y razonamiento, según las etiquetas declaradas por el autor. La versión aquí documentada es una recopilación de cuantizaciones con imatrix (importancia matricial) que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y formatos GGUF, con tamaños que van desde 13,3 GB en i1-Q2_K hasta 29,3 GB en i1-Q6_K.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo MoE de 35B en entornos locales, algo que con pesos en precisión completa (unos 71 GB en FP16) requeriría hardware de gama alta. La licencia Apache 2.0 facilita el uso comercial, y el soporte declarado de tool calling y razonamiento lo sitúa en la categoría de modelos para pipelines de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; inferida por la etiqueta `moe` y el sufijo A3B |
| Parámetros totales | 35.505.251.456 (~35,5 B) |
| Parámetros activos | no disponible (el sufijo A3B sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; más fichero imatrix |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La arquitectura es de tipo Mixture of Experts, según la etiqueta `moe` del repositorio y la convención de nomenclatura "A3B" que indica parámetros activos. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento ni la proporción de parámetros activos por token en la documentación proporcionada. Tampoco se detallan los datos de entrenamiento: número de tokens, composición del corpus, ni si se aplicaron técnicas de RLHF o DPO.

La información disponible se limita a las etiquetas declaradas (`agent`, `tool-use`, `reasoning`, `conversational`), que indican que el modelo fue ajustado para tareas de agente y conversación con uso de herramientas. Las cuantizaciones aquí publicadas emplean imatrix (importancia matricial) calculada sobre el modelo base, una técnica que mejora la calidad de las cuantizaciones de baja precisión al ponderar los pesos según su relevancia para la perplejidad. No se dispone de detalles sobre innovaciones arquitectónicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Razonamiento (etiqueta `reasoning`), orientado a tareas que requieren cadenas de pensamiento.
- Uso de herramientas y function calling (etiqueta `tool-use`).
- Comportamiento como agente (etiqueta `agent`), con capacidad de razonamiento multi-paso.
- Soporte multilingüe limitado al inglés según la model card.
- Capacidad de visión: la model card de mradermacher indica explícitamente "This is a vision model", aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estático, no en este.
- No se documentan capacidades de audio ni modos de pensamiento explícitos más allá de la etiqueta `reasoning`.

## Casos de uso

- Agentes autónomos con tool calling: el modelo declara soporte de `tool-use` y `agent`, por lo que puede integrarse en frameworks como LangChain o LlamaIndex para ejecutar acciones sobre APIs externas, consultar bases de datos o invocar funciones definidas por el desarrollador.
- Asistente de atención al cliente: al ser conversacional y multilingüe (inglés), puede gestionar diálogos multi-turno; la cuantización i1-Q4_K_M (21,8 GB) permite desplegarlo en una única GPU de 24 GB para este fin.
- Generación de código asistida: aunque no se declara explícitamente una capacidad de código, los modelos con razonamiento y tool-use suelen emplearse en pipelines de CI/CD para revisión de parches y generación de tests; conviene validar su rendimiento en código antes de producción.
- Razonamiento sobre documentos largos: si el contexto es amplio (dato no disponible), adecuado para resumen y extracción de información; la versión i1-Q5_K_M (25,4 GB) ofrece mayor fidelidad para tareas de extracción.
- Prototipado local en estaciones de trabajo: con la cuantización i1-IQ3_S (15,7 GB) se puede ejecutar en una RTX 4090 (24 GB) o incluso en una RTX 3090, facilitando iteración rápida sin depender de la nube.
- Evaluación de modelos MoE en investigación: el repositorio ofrece 14 cuantizaciones distintas más el fichero imatrix, lo que permite estudiar el impacto de la precisión en la calidad de salida sobre un mismo modelo base.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable con llama.cpp, puede alojarse en infraestructura propia sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,3 GB (i1-Q2_K) y 29,3 GB (i1-Q6_K) solo para los pesos; hay que añadir la caché KV, cuyo tamaño depende del contexto y de la configuración de la arquitectura MoE (no disponible).
- GPU recomendadas: para las cuantizaciones de mayor calidad (i1-Q5_K_M, i1-Q6_K) se recomienda una A100 40 GB, H100 o RTX 4090 de 24 GB con offloading parcial; para i1-Q4_K_M (21,8 GB) una RTX 4090 o RTX 3090 de 24 GB es suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantizaciones hasta i1-Q4_K_M; en GPUs de 16 GB solo con i1-Q2_K o i1-Q3_K_S y posible offloading a RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con la API de OpenAI mediante llama.cpp server; vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; al ser MoE con ~3 B activos (inferido), el throughput por token debería ser superior al de un modelo denso de 35 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B (este) | 35,5 B | ~3 B (inferido) | no disponible | Apache 2.0 | GGUF, safetensors |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32 K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7 B | 2,4 B | 32 K | MIT (código) / modelo abierto | safetensors, GGUF |

La comparación se ofrece a título orientativo: no se dispone de datos de rendimiento del modelo Surogate que permitan una comparación cuantitativa con estas alternativas. La principal ventaja diferencial es su licencia Apache 2.0 combinada con un tamaño de 35 B totales y un perfil de activación reducido, que lo hace desplegable en hardware de consumo con cuantizaciones de 4 bits.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües y el rendimiento en castellano es desconocido.
- No se han publicado benchmarks, por lo que no es posible validar las afirmaciones de razonamiento, tool-use o calidad conversacional.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin datos de evaluación no se puede estimar su magnitud.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- La model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio; para uso multimodal hay que acudir al repositorio estático.
- Las cuantizaciones de baja precisión (i1-Q2_K, i1-Q3_K_S) degradan la calidad; para producción se recomienda i1-Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y condiciones del modelo base original (surogate/Surogate3.7-35B-A3B) antes de un despliegue comercial.
- El repositorio tiene muy pocas descargas (1.726) y un solo like, lo que sugiere una adopción limitada y escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-i1-GGUF
- Modelo base original: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Cuantizaciones estáticas (incluye posible mmproj de visión): https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Surogate3.7-35B-A3B-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
