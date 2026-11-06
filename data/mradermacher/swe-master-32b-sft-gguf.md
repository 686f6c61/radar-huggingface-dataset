# mradermacher/SWE-Master-32B-SFT-GGUF

## Resumen

SWE-Master-32B-SFT-GGUF es la versión cuantizada en formato GGUF del modelo RUC-AIBOX/SWE-Master-32B-SFT, un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) orientado a tareas de ingeniería de software. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, a partir de los pesos originales del modelo base desarrollado por RUC-AIBOX. El modelo está etiquetado como conversacional y compatible con endpoints, y su idioma declarado es el inglés.

El modelo resuelve el problema de ejecutar un LLM de 32B en hardware de consumo o en entornos con VRAM limitada, ofreciendo un abanico de cuantizaciones que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). Esto permite desplegar el modelo en GPUs consumer de gama alta o en configuraciones multi-GPU más modestas, manteniendo un equilibrio entre calidad y huella de memoria. La relevancia actual radica en la popularidad de los modelos especializados en código y resolución de problemas de software (SWE), un nicho donde los modelos de 32B ofrecen un compromiso atractivo entre capacidad y coste de inferencia.

No se dispone de información detallada sobre la arquitectura interna, el contexto máximo ni los datos de entrenamiento en la información proporcionada; la model card del cuantizador se limita a describir el proceso de cuantización y los ficheros generados. El repositorio tiene un tamaño de 224 GB, lo que refleja la suma de todas las cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido por el formato de pesos y la librería transformers; no confirmado en la información) |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RUC-AIBOX/SWE-Master-32B-SFT en la documentación proporcionada. Por el número de parámetros (32,8B) y el formato de pesos compatible con transformers y GGUF, se trata con alta probabilidad de un transformer decoder-only, pero este dato no está confirmado explícitamente. Tampoco se especifican la longitud de contexto, la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica disponible sobre el proceso de cuantización es la del cuantizador: se han generado cuantizaciones estáticas (static quants) mediante el pipeline de mradermacher, con `quantize_version: 2` y `output_tensor_quantised: 1`, y con `convert_type: hf`. No se han publicado cuantizaciones ponderadas con imatrix para este modelo en el momento de la información, según indica el propio autor. El sufijo "SFT" en el nombre del modelo base sugiere un ajuste supervisado (supervised fine-tuning), pero no hay detalles sobre la metodología ni los datos empleados.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Orientación a tareas de ingeniería de software y resolución de problemas de código, inferida del nombre "SWE-Master" y del dominio del modelo base (no confirmado con benchmarks).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Ejecución local mediante llama.cpp y derivados gracias al formato GGUF.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Asistencia a la resolución de incidencias de software: el modelo puede emplearse para analizar descripciones de bugs, proponer parches y explicar causas raíz en inglés, aprovechando su especialización declarada en tareas SWE. Su tamaño de 32B permite un razonamiento más profundo que modelos de 7B-13B en problemas de código complejos.
- Revisión de código automatizada en pipelines de CI: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI, puede generar comentarios de revisión sobre diffs y sugerir mejoras, con la ventaja de que las cuantizaciones Q4_K_M (20 GB) caben en GPUs consumer de 24 GB.
- Despliegue en estaciones de trabajo con una sola RTX 4090: la cuantización Q4_K_M (20,0 GB) o IQ4_XS (18,0 GB) permite ejecutar el modelo íntegramente en VRAM de 24 GB, habilitando asistentes de código locales sin dependencia de la nube.
- Generación de documentación técnica: el modelo puede redactar docstrings, READMEs y guías de API en inglés a partir de código fuente, un caso de uso habitual en modelos especializados en software.
- Prototipado de agentes de codificación: al ser compatible con endpoints y con el ecosistema transformers/GGUF, puede integrarse en frameworks de agentes para tareas de edición de ficheros y ejecución de comandos, aunque la ausencia de datos sobre tool calling obliga a validar esta capacidad empíricamente.
- Experimentación académica en entornos con recursos limitados: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten investigar el comportamiento de un modelo de 32B en GPUs de 16 GB, algo inviable con los pesos originales en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12,4 GB (Q2_K) y 34,9 GB (Q8_0) solo para los pesos; hay que añadir el espacio para el contexto KV, que depende de la longitud de contexto no disponible.
- GPU recomendadas: para Q8_0 y Q6_K, GPUs de 40-48 GB (A100 40GB, A6000 48GB) o configuraciones multi-GPU; para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) es suficiente para los pesos, con margen limitado para contexto.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con cuantizaciones Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L y Q3_K_M; en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4070 Ti Super) con Q2_K y Q3_K_S; en GPUs de 12 GB no cabe ninguna cuantización completa en VRAM, requeriría offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), servidores compatibles con la API de OpenAI basados en llama.cpp (p. ej. llama-server), y potencialmente vLLM si se convierte o se usa el modelo base en safetensors (no confirmado para GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, licencia) del modelo base, por lo que una comparativa rigurosa con alternativas como Qwen2.5-Coder-32B, DeepSeek-Coder-V2 o CodeLlama-34B no puede sustentarse con números. Se indica a continuación una comparación estructural limitada a los datos disponibles:

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| SWE-Master-32B-SFT (este) | 32,8B | no disponible | no disponible | Sí (mradermacher) |
| Qwen2.5-Coder-32B | 32,8B (aprox.) | 128K (según documentación pública del modelo) | Apache 2.0 (según documentación pública) | Sí, múltiples cuantizadores |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2,4B activos) | 128K (según documentación pública) | licencia propia (según documentación pública) | Sí |
| CodeLlama-34B | 34B | 16K (según documentación pública) | licencia Llama 2 (según documentación pública) | Sí |

Los datos de los modelos alternativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa y deben verificarse en las fuentes originales.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base RUC-AIBOX/SWE-Master-32B-SFT antes de cualquier despliegue en producción.
- Idiomas: el modelo declara únicamente inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar el uso en tareas que requieran ventanas largas (análisis de repositorios completos, conversaciones extensas).
- Riesgo de alucinación: inherente a los modelos de lenguaje; en tareas de código puede generar APIs inexistentes o parches sintácticamente válidos pero semánticamente incorrectos. Se recomienda validación con tests.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan la calidad de forma notable; para tareas de razonamiento sobre código se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles, lo que puede suponer una pérdida de calidad adicional frente a cuantizaciones imatrix de otros modelos.
- Ausencia de benchmarks: no hay evidencia publicada del rendimiento real del modelo en tareas SWE (SWE-bench, HumanEval, etc.), por lo que las afirmaciones sobre su especialización deben tratarse como no verificadas.
- Repositorio de gran tamaño (224 GB): la descarga completa es costosa en ancho de banda y almacenamiento; conviene descargar solo la cuantización necesaria.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/SWE-Master-32B-SFT-GGUF
- Modelo base: https://huggingface.co/RUC-AIBOX/SWE-Master-32B-SFT
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#SWE-Master-32B-SFT-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
