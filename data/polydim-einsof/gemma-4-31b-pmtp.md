# Polydim-Einsof/gemma-4-31b-pmtp

## Resumen

`gemma-4-31b-pmtp` es un adaptador publicado por Polydim-Einsof (Ariel García Traba, iniciativa POLYDIM-EINSOF) sobre el modelo base `google/gemma-4-31b-it` de Google DeepMind. El autor lo presenta como un despliegue local de "alta capacidad" basado en una construccion geometrica sobre la variedad de Stiefel, con una proyeccion de subespacio principal St(4096, 2048) sobre S^2047 que reduce la dimension del modelo de 4096 a 2048 dimensiones canonicas. Se distribuye con licencia Apache-2.0 y etiquetas orientadas a despliegue local y a un supuesto stack nativo en C++20/Rust 2024 con AVX2.

La relevancia del artefacto es dudosa desde el punto de vista tecnico: el repositorio ocupa 0.0 GB, no registra descargas ni interacciones, no declara pipeline ni idiomas, y la model card no aporta informacion verificable sobre el entrenamiento, los datos utilizados, el proceso de adaptacion ni resultados de evaluacion. El autor afirma integrar 1.740 teoremas formales extraidos de una base PostgreSQL (`polydim_vec_db`) y un "Zero-Worm Protocol" de transferencia de pensamiento continuo, pero no se ofrece ningun detalle reproducible sobre como se aplican esos elementos al modelo.

En el momento de redactar esta ficha no hay evidencia publica de que los pesos del adaptador esten efectivamente subidos al repositorio, ni de que el modelo base `google/gemma-4-31b-it` exista como tal en el ecosistema de Google. Debe tratarse, por tanto, como un artefacto no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (model card cita "Stiefel Manifold Adapter" sobre el modelo base; no se detalla la arquitectura interna del transformer) |
| Parametros totales | No disponible (el nombre sugiere 31B, pero no se confirma en la model card) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tag declarado); repositorio de 0.0 GB, sin confirmacion de pesos presentes |

## Arquitectura y entrenamiento

La model card describe una construccion geometrica denominada "Principal Subspace St(4096, 2048) on S^(2047)", con una proyeccion desde `d_model = 4096` hasta `d_canonical = 2048`. El autor reporta un "Stiefel defect" de 4.39e-09 medido con un acumulador Neumaier en FP64, lo que sugiere que la adaptacion se formula como una proyeccion ortogonal sobre una variedad de Stiefel. Se menciona tambien un "Silicon Contract" con implementacion nativa en C++20, Rust 2024 y AVX2, y un bus de memoria compartida (`PmtpShmBus`) en IEEE-754 FP64.

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o ajuste supervisado, ni como se obtuvieron los "1.740 teoremas formales" citados desde PostgreSQL 16. Tampoco se explica el mecanismo del "Zero-Worm Protocol" ni como se integra con el modelo base. En consecuencia, no es posible evaluar la arquitectura ni el proceso de entrenamiento con rigor.

## Capacidades

- No se documentan capacidades propias del adaptador mas alla de las heredadas del modelo base `google/gemma-4-31b-it`, del cual no hay informacion verificable en la model card.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingue.
- El autor menciona un "Zero-Worm Protocol" de transferencia de pensamiento continuo, pero sin especificar comportamiento observable.

## Casos de uso

- Investigacion sobre proyecciones geometricas en espacios de representacion: el adaptador podria servir como referencia teorica para estudiar proyecciones sobre la variedad de Stiefel, aunque no hay artefactos verificables para reproducir el experimento.
- Despliegue local experimental: el autor lo etiqueta como "local-deployment" y cita un tag de Ollama (`gemma4:31b`), pero no se confirma que los pesos esten disponibles para descarga.
- Estudio de stacks nativos C++20/Rust 2024 con AVX2: la model card menciona un "Silicon Contract" que podria interesar a quien investigue inferencia de bajo nivel, si bien no se publica codigo asociado en el repositorio de Hugging Face.
- Analisis de integracion con bases de datos vectoriales: la mencion a `polydim_vec_db` en PostgreSQL 16 sugiere un caso de uso orientado a recuperacion aumentada, sin documentacion adicional.
- Docencia y divulgacion sobre variedades diferenciales aplicadas a IA: el artefacto puede citarse como ejemplo de propuesta teorica, siempre advirtiendo de su falta de validacion.
- Auditoria de artefactos no verificados: util para practicar la evaluacion critica de model cards y la deteccion de afirmaciones sin respaldo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Si el modelo base tuviera 31B parametros, una inferencia en FP16 requeriria en torno a 62 GB de VRAM, y en cuantizacion de 4 bits alrededor de 16-18 GB, pero estos calculos son estimaciones genericas y no estan confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 31B en 4 bits podria caber en GPUs con 24 GB (RTX 3090, RTX 4090) si existieran pesos cuantizados, pero el repositorio no los publica.
- Opciones de despliegue: el autor cita un tag de Ollama (`gemma4:31b`) y un stack nativo C++20/Rust 2024 con AVX2, sin instrucciones ni binarios publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Polydim-Einsof/gemma-4-31b-pmtp | No disponible (nombre sugiere 31B) | No disponible | Apache-2.0 | Repositorio de 0.0 GB, sin pesos confirmados |
| google/gemma-2-27b-it | 27B | 8K | Gemma Terms | Publico en Hugging Face y Vertex AI |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Publico en Hugging Face |
| mistralai/Mistral-Small-24B-Instruct | 24B | 32K | Apache-2.0 | Publico en Hugging Face |

La comparativa se ofrece como referencia de categoria (modelos densos de 8-31B con licencia permisiva), pero no existe base para comparar rendimiento con `gemma-4-31b-pmtp` al no haber benchmarks publicados.

## Limitaciones y advertencias

- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos no estan subidos o que el artefacto es unicamente un README.
- No hay pipeline declarado, ni idiomas, ni tarjeta de datos, ni ejemplos de uso.
- El modelo base citado, `google/gemma-4-31b-it`, no esta confirmado como existente en el ecosistema publico de Google a fecha de la informacion disponible.
- Las afirmaciones sobre "1.740 teoremas formales", "Stiefel defect 4.39e-09" y "Zero-Worm Protocol" no son verificables ni reproducibles con la informacion publicada.
- La licencia Apache-2.0 declarada podria no ser aplicable si el modelo base tuviera su propia licencia restrictiva (los modelos Gemma de Google suelen usar Gemma Terms of Use, no Apache-2.0).
- Riesgo de alucinacion y sesgos: no evaluable sin pesos ni evaluaciones.
- No recomendado para uso en produccion sin verificacion previa de integridad, procedencia y licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Polydim-Einsof/gemma-4-31b-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base citado: https://huggingface.co/google/gemma-4-31b-it (no verificado)
