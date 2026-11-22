# mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF

## Resumen

KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF es una cuantización GGUF del modelo KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED, publicada por mradermacher. El modelo base es una variante "abliterated" (es decir, con la dirección de rechazo eliminada mediante edición de pesos) del KAT-Coder-V2.5-Dev, un modelo de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales construido sobre la arquitectura qwen3_5_moe. Está orientado a generación de código y conversación, con soporte declarado únicamente para inglés y chino.

El interés de esta ficha reside en dos factores. Primero, la cuantización i1 con imatrix de mradermacher permite ejecutar un MoE de ~35B totales en hardware de consumo, con opciones desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K). Segundo, la etiqueta "abliterated" indica que se ha suprimido el comportamiento de rechazo del modelo original, lo que lo hace "uncensored" según los tags del autor, con las implicaciones de seguridad y cumplimiento que ello conlleva.

La licencia es Apache 2.0 y el repositorio ocupa 279,2 GB (incluye todos los quants). La model card del cuantizador no aporta información sobre arquitectura interna, datos de entrenamiento ni benchmarks; esta ficha se limita, por tanto, a lo verificable en los metadatos y en la información del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia qwen3_5_moe |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos de la familia qwen3_5_moe, según los tags del repositorio. El sufijo "MTP" en el nombre indica Multi-Token Prediction, y los tags incluyen "speculative-decoding", lo que apunta a que el modelo incorpora cabezas de predicción multi-token concebidas para decodificación especulativa. El sufijo "A3B" sugiere aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no aparece confirmado de forma explícita en la información disponible. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La variante "ABLITERATED" implica una modificación de pesos orientada a eliminar la dirección de rechazo del modelo original (abliteration), lo que produce un modelo marcado como "uncensored". Esta intervención se realiza típicamente mediante la proyección ortogonal de los pesos de las capas de atención contra una dirección calculada a partir de activaciones, y suele degradar ligeramente la coherencia y la calidad en tareas que dependen de matices de seguridad. No se documenta en la información proporcionada el método exacto aplicado ni el impacto medido sobre benchmarks.

La cuantización i1 de mradermacher utiliza matrices de importancia (imatrix) para ponderar la cuantización, lo que en la práctica mejora la perplejidad frente a cuants estáticos del mismo tamaño. El autor ofrece también una versión estática en un repositorio separado.

## Capacidades

- Generación de código: el modelo está etiquetado como "coding" y deriva de KAT-Coder, por lo que su uso previsto principal es la escritura y edición de código.
- Conversación multi-turno: el tag "conversational" indica soporte de diálogo.
- Decodificación especulativa: el tag "speculative-decoding" y el sufijo MTP sugieren soporte de predicción multi-token para acelerar la inferencia.
- Modo sin censura: la abliteración elimina los rechazos del modelo original; el modelo responde a peticiones que el base rechazaría.
- Multilingüe limitado: solo inglés y chino según los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible; los tags no indican capacidades multimodales.

## Casos de uso

- Asistencia de programación en local: con el cuant i1-Q4_K_M (21,8 GB) el modelo puede ejecutarse en una estación de trabajo con una GPU de 24 GB o con reparto CPU/GPU, ofreciendo autocompletado y generación de funciones sin enviar código a servicios externos.
- Refactorización de bases de código: gracias a su orientación a código y a la arquitectura MoE (que reduce el coste por token al activar solo una fracción de los parámetros), es adecuado para tareas de reescritura y migración de módulos de tamaño medio.
- Generación de tests y documentación: el modelo puede producir suites de pruebas y docstrings a partir de firmas de funciones, integrándose en pipelines de CI.
- Investigación sobre alineación y abliteración: al ser una variante abliterated, sirve para estudiar el efecto de la supresión de la dirección de rechazo sobre la calidad y la coherencia del modelo, comparándolo con el base.
- Experimentación con decodificación especulativa: el soporte MTP permite medir ganancias de throughput en llama.cpp y compararlas con decodificación autoregresiva estándar.
- Despliegue en entornos con requisitos de confidencialidad: al ser Apache 2.0 y ejecutable en local, encaja en escenarios donde no se permite el envío de datos a APIs de terceros.
- Prototipado de asistentes conversacionales en inglés o chino: el modelo cubre ambos idiomas, aunque no castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, sin contar overhead de contexto):
  - i1-Q2_K: 13,3 GB
  - i1-IQ3_S / i1-IQ3_M: 15,7-15,9 GB
  - i1-Q3_K_M: 17,3 GB
  - i1-IQ4_XS: 19,3 GB
  - i1-Q4_K_S: 20,5 GB
  - i1-Q4_K_M: 21,8 GB
  - i1-Q5_K_M: 25,4 GB
  - i1-Q6_K: 29,3 GB
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM; para Q5 y Q6 se recomienda A100 40 GB, H100 80 GB o reparto entre dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, en el rango Q2 a Q4 con 16-24 GB de VRAM; los cuants Q5 y Q6 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a través de servidores locales. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura MoE con ~3B activos (según el nombre) debería ofrecer un throughput notablemente superior al de un modelo denso de 35B, pero no hay mediciones publicadas en los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED (i1-GGUF) | 35,5B totales (MoE) | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo en/zh |
| KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED (base) | 35,5B totales (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| KAT-Coder-V2.5-Dev-35B-A3B-MTP (sin abliterar) | 35,5B totales (MoE) | no disponible | no disponible | no disponible | Comportamiento de rechazo intacto |
| Qwen3 MoE de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo, lo que incrementa el riesgo de generar contenido dañino, ilegal o inexacto. No es apto para despliegues orientados al público sin filtros adicionales.
- Solo soporta inglés y chino; no hay evidencia de competencia en castellano.
- No se han publicado benchmarks, por lo que no puede afirmarse su calidad relativa frente a otros modelos de código.
- La cuantización, especialmente en Q2 y Q3, degrada la calidad respecto al modelo en safetensors; el autor recomienda IQ3_XXS o IQ3_XS frente a Q3_K en el rango bajo.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo abliterated puede incumplir políticas de plataformas o normativas sectoriales; la responsabilidad recae en el desplegador.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir APIs inexistentes o fragmentos sintácticamente válidos pero funcionalmente incorrectos.
- No hay información sobre la longitud de contexto efectiva, lo que impide garantizar su comportamiento en tareas de contexto largo.
- El repositorio ocupa 279,2 GB; conviene descargar solo el cuant necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF
- Modelo base: https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED
- Cuants estáticos: https://huggingface.co/mradermacher/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
