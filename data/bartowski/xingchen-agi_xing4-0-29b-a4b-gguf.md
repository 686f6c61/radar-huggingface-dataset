# bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por XingChen-AGI, publicado bajo licencia Apache 2.0. El checkpoint original cuenta con 31.215.031.088 parámetros totales según los safetensors, aunque la nomenclatura comercial lo denomina "29B-A4B", lo que sugiere aproximadamente 4.000 millones de parámetros activos por token. Está diseñado para generación de texto conversacional y soporta únicamente inglés y chino.

La ficha que nos ocupa corresponde a la cuantización GGUF realizada por bartowski mediante llama.cpp (release b12174), con soporte de imatrix y decodificación especulativa basada en MTP (Multi-Token Prediction). Esto permite ejecutar el modelo en hardware de consumo y en entornos con memoria limitada, algo relevante para un MoE de 31B parámetros totales.

Su relevancia actual radica en que ofrece una arquitectura MoE de gran tamaño total pero bajo coste de inferencia por token, con licencia permisiva y cuantizaciones listas para llama.cpp, Ollama y otros runners compatibles. Adicionalmente, el proyecto integra operadores Triton-Ascend mediante FlagOS y MindFormers, lo que apunta a un interés explícito por el ecosistema de aceleradores Ascend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, con decodificación especulativa MTP |
| Parametros totales | 31.215.031.088 (31B) |
| Parametros activos | Aproximadamente 4B (según nomenclatura A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); checkpoint original presumiblemente safetensors (no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts, en la que solo una fracción de los parámetros totales (aproximadamente 4B de 31B) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. La model card de la cuantización menciona soporte de decodificación especulativa mediante MTP (Multi-Token Prediction), una técnica que permite predecir varios tokens por paso y acelerar la generación.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El proyecto integra operadores fusionados mHC Triton-Ascend en MindFormers a través de FlagOS, con validación de entrenamiento en un nodo de 16 tarjetas, lo que indica trabajo de optimización para hardware Ascend. Los detalles concretos de la arquitectura interna (número de expertos, dimensión oculta, mecanismo de atención) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y respuesta a instrucciones en formato chat (pipeline text-generation, tag conversational).
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita el despliegue como servicio.
- Soporte de cuantización con imatrix, que mejora la calidad de las cuantizaciones de baja precisión.
- Capacidades de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; la entrada es solo texto.

## Casos de uso

- Asistente conversacional bilingüe inglés-chino: el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para productos dirigidos a mercados anglófonos y sinófonos con un único modelo.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (20,06 GB) o IQ4_XS (17,98 GB) puede ejecutarse en GPUs con 24 GB de VRAM o en sistemas con RAM suficiente, lo que permite prototipado local sin infraestructura cloud.
- Servicios de inferencia de bajo coste: al ser un MoE con ~4B parámetros activos, el coste por token es menor que el de un denso de 31B, lo que lo hace atractivo para APIs de alto volumen con presupuesto ajustado.
- Generación de texto en pipelines de CI/CD y herramientas internas: su compatibilidad con llama.cpp y endpoints permite integrarlo en scripts y servicios ligeros para resúmenes, redacción técnica o clasificación textual.
- Experimentación en investigación sobre MoE: investigadores pueden estudiar el comportamiento de un MoE de 31B con cuantizaciones de distinta precisión (desde Q8_0 hasta Q3_K_S) sin necesidad de clústeres grandes.
- Evaluación de decodificación especulativa MTP: útil para medir ganancias de throughput en llama.cpp con hardware variado, incluido Ascend mediante el stack FlagOS/MindFormers.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede incorporarse en productos comerciales sin las restricciones de licencias copyleft o de uso limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): bf16 ~62,45 GB; Q8_0 ~33,22 GB; Q6_K ~27,19 GB; Q5_K_M ~24,00 GB; Q4_K_M ~20,06 GB; IQ4_XS ~17,98 GB; Q3_K_M ~16,10 GB; Q3_K_S ~14,92 GB.
- GPU recomendadas: para bf16, A100 80 GB o H100 80 GB; para Q8_0, A100 40 GB o dos GPUs de 24 GB; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB; las cuantizaciones Q3 permiten incluso GPUs de 16 GB con margen para contexto.
- Opciones de despliegue: llama.cpp (versión b12174 o superior recomendada por el cuantizador), Ollama, y cualquier runner compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con servicios de inferencia estándar.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 31B | ~4B | no disponible | Apache 2.0 | GGUF (bartowski), checkpoint original |
| Alternativas MoE de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~30B totales con ~4B activos) en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con cifras verificables.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos de evaluación que permitan cuantificarlo.
- Sesgos: no se ha publicado información sobre sesgos conocidos ni sobre el proceso de alineación.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint original y de los operadores de terceros (FlagOS, MindFormers) si se redistribuye.
- Cuantizaciones de baja precisión (Q3, IQ3): pueden degradar la calidad de forma notable; se recomienda Q4_K_M o superior para producción.
- Formato de prompt no documentado en la cuantización: la model card indica que no se encontró formato de prompt, por lo que debe consultarse la página del modelo original antes de desplegarlo.
- Fecha de creación del repositorio (2026-11-06) y cero descargas/likes: ecosistema y validación comunitaria aún incipientes.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- llama.cpp (release b12174): https://github.com/ggml-org/llama.cpp/releases/tag/b12174
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
