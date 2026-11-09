# mradermacher/Arete-27B-Uncensored-V2-GGUF

## Resumen

Arete-27B-Uncensored-V2-GGUF es la versión cuantizada en formato GGUF del modelo SargeDev/Arete-27B-Uncensored-V2, un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen (la etiqueta del autor indica "qwen3.8"). El trabajo de cuantización lo realiza mradermacher, un conocido publicador de quants estáticos para llama.cpp y ecosistemas compatibles. El modelo base se presenta como "abliterated" y "uncensored", es decir, con las capas de rechazo eliminadas mediante técnicas de abliteración, lo que lo orienta a usos donde se requiere baja interferencia de filtros de seguridad.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB). Al estar publicado bajo licencia Apache 2.0, es apto para uso comercial, aunque con las advertencias propias de un modelo sin alineamiento de seguridad. El repo ocupa 135,3 GB e incluye únicamente pesos en GGUF; no se proporcionan pesos en safetensors dentro de este repositorio (el dato de parámetros totales procede del modelo base).

La información pública disponible es escasa: la model card del cuantizador no incluye detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks. Esta ficha se limita a los datos verificables de la información proporcionada y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del autor: "qwen3.8"; presumiblemente transformer decoder-only de la familia Qwen, sin confirmar) |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 (según etiquetas del repo); tamaños publicados para Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el repo no incluye safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La etiqueta "qwen3.8" sugiere que el modelo base deriva de la familia Qwen, lo que implicaría una arquitectura transformer decoder-only con atención causal, pero este extremo no se confirma en la model card. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento.

El aspecto técnico destacable es el proceso de abliteración aplicado al modelo base (SargeDev/Arete-27B-Uncensored-V2), que elimina o atenúa las direcciones de activación asociadas al rechazo de peticiones. Esta edición la realiza el autor del modelo base, no el cuantizador. El trabajo de mradermacher consiste en la conversión a GGUF y la generación de cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). La model card indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación, y que podrían no llegar a publicarse.

## Capacidades

- Generación de texto conversacional en inglés (tag "conversational").
- Modelo "uncensored"/"abliterated": menor probabilidad de rechazar peticiones por políticas de seguridad internas.
- Razonamiento y generación de código: capacidad presumible por el tamaño (27B) y la familia de origen, aunque no se documenta explícitamente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante infraestructura de inferencia estándar.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente a uno alineado, comparando tasas de rechazo y calidad de respuesta en tareas sensibles. Es adecuado porque la abliteración es precisamente la variable de estudio.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados suelen declinar. El tamaño de 27B proporciona coherencia narrativa en textos largos.
- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantización Q4_K_S (15,9 GB) puede ejecutarse en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, lo que permite prototipado sin depender de la nube.
- Evaluación de cuantizaciones: al ofrecer múltiples niveles (Q2_K a Q8_0), sirve para medir la degradación de perplejidad y calidad según el nivel de cuantización en un modelo de 27B, un caso de estudio útil para quienes optimizan despliegues.
- Experimentación con pipelines de inferencia (llama.cpp, Ollama, servidores compatibles con la API de OpenAI): la etiqueta "endpoints_compatible" facilita integrarlo como backend en entornos de prueba.
- Análisis de sesgos y contenido dañino: útil para equipos de moderación que necesitan generar muestras adversarias o evaluar clasificadores de contenido con un modelo menos restrictivo.
- Fine-tuning posterior sobre el modelo base (no sobre los GGUF): aunque este repo solo contiene GGUF, el modelo base en safetensors puede servir para ajuste fino en tareas de dominio específico en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y tampoco se proporcionan datos de perplejidad para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~11,0 GB de pesos; ~12-14 GB de VRAM total estimada.
  - Q3_K_S: ~12,4 GB; ~14-16 GB total estimada.
  - Q3_K_M: ~13,6 GB; ~15-17 GB total estimada.
  - Q4_K_S: ~15,9 GB; ~17-19 GB total estimada.
  - Q6_K: ~22,5 GB; ~24-26 GB total estimada.
  - Q8_0: ~29,1 GB; ~31-33 GB total estimada.
  - F16: ~54,6 GB de pesos (estimado a partir de 27,3 B × 2 bytes); requiere ~56-60 GB de VRAM.
- GPU recomendadas:
  - Q4_K_S o Q6_K en RTX 4090 (24 GB) o RTX 3090 (24 GB).
  - Q8_0 en A100 40 GB, L40S 48 GB o H100.
  - F16 en A100 80 GB o H100 80 GB.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S y Q3_K_M caben en GPUs de 16-24 GB (RTX 4080, 4090, 3090). Las cuantizaciones Q2_K y Q3_K_S podrían caber en 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (la etiqueta "endpoints_compatible" lo indica), y cualquier runtime que soporte GGUF. Para vLLM o TGI se necesitaría el modelo base en safetensors, no incluido en este repo.
- Latencia y throughput: no disponibles. Dependen del backend, la GPU y la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los modelos alternativos citados son referencias genéricas de la misma categoría (27-32B, pesos abiertos); sus cifras de rendimiento no se comparan aquí por falta de benchmarks del modelo evaluado.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Arete-27B-Uncensored-V2 (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (este repo); safetensors en el repo base |
| Qwen2.5-32B-Instruct | 32,5 B | 131.072 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF (comunidad) |
| Gemma-2-27B-it | 27 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF (comunidad) |
| Mistral-Small-24B-Instruct | 24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF (comunidad) |

Nota: los datos de contexto y licencia de los modelos alternativos provienen de conocimiento general y deben verificarse en sus respectivas model cards; no se incluyen cifras de benchmarks comparativos por ausencia de datos del modelo evaluado.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la eliminación de las capas de rechazo implica que puede generar contenido dañino, ilegal o explícitamente sensible sin filtros. No es apto para despliegues orientados al público sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo de lenguaje, puede inventar hechos, citas y datos.
- Idiomas: solo se declara inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: no se documenta la longitud máxima de contexto; los usuarios deben asumir un valor conservador (típicamente 32K en la familia Qwen, sin confirmar) y verificar experimentalmente.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de normativas aplicables (por ejemplo, en la UE, el AI Act para sistemas de riesgo).
- Calidad de las cuantizaciones: la model card advierte que Q3_K_M es de "calidad inferior" y que Q4_K_S es "rápido, recomendado". No hay cuantizaciones imatrix/ponderadas, que suelen mejorar la calidad a igual tamaño.
- Repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de que el modelo funcione correctamente. El tamaño del repo (135,3 GB) sugiere que incluye múltiples cuantizaciones, pero solo se listan tamaños para seis de ellas.
- Fecha de creación indicada como 2026-11-09, posterior a la fecha habitual de referencia; conviene verificar la integridad de los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Arete-27B-Uncensored-V2-GGUF
- Modelo base: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Página de descargas del cuantizador: https://hf.tst.eu/model#Arete-27B-Uncensored-V2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
