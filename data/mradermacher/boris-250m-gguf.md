# mradermacher/Boris-250M-GGUF

## Resumen

Boris-250M-GGUF es la versión cuantizada en formato GGUF del modelo base opencerebral/Boris-250M, un modelo de lenguaje de 250.414.848 parámetros (aproximadamente 0,25 mil millones) publicado por el usuario opencerebral y convertido a GGUF por mradermacher, un cuantizador habitual de Hugging Face. El repositorio no contiene un modelo nuevo: es un empaquetado en 12 variantes de cuantización (desde Q2_K hasta f16) pensado para su uso con llama.cpp y herramientas compatibles, de modo que el modelo pueda ejecutarse en CPU o en GPUs de gama muy baja.

Por los tags del repositorio, la arquitectura es de tipo GPT-2 (transformer decoder-only denso) y los datos de entrenamiento declarados son los conjuntos HuggingFaceFW/fineweb-edu y mlfoundations/dclm-baseline-1.0-parquet, ambos corpus educativos y de alta calidad en inglés. El modelo está etiquetado únicamente para inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es práctica: se trata de un modelo pequeño con cuantizaciones de entre 0,3 GB y 0,6 GB, útil para experimentación, docencia, prototipado offline y pruebas de pipelines de inferencia local. No obstante, la model card del repositorio cuantizado no incluye información sobre longitud de contexto, composición exacta del dataset ni proceso de alineación, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según el tag `gpt2`; no detallada en la model card) |
| Parametros totales | 250.414.848 (~250M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

El repositorio es una conversión estática a GGUF del modelo opencerebral/Boris-250M. Los tags (`gpt2`, `nmai`, `boris`, `250M`) apuntan a un transformer decoder-only de estilo GPT-2 con 250M de parámetros, pero la model card no describe capas, dimensión oculta, número de cabezas ni mecanismo de atención. Tampoco se indica la longitud de contexto nativa, un dato crítico que el autor no publica.

En cuanto a datos, se declaran dos corpus: HuggingFaceFW/fineweb-edu y mlfoundations/dclm-baseline-1.0-parquet. No se especifica el número de tokens vistos, la mezcla exacta entre ambos conjuntos, ni si hubo fases de instrucción, RLHF o DPO. La información disponible tampoco menciona innovaciones técnicas (atención lineal, decodificación especulativa, MoE o híbridos SSM). Las cuantizaciones son estáticas: según la propia model card, no hay versiones con imatrix o ponderadas por el autor en el momento de la publicación.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, no necesariamente ajustado a instrucciones).
- Completado de texto y continuación de documentos, adecuado para tareas de lenguaje general.
- Capacidad multilingüe limitada: solo se declara inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se declaran capacidades de visión, audio ni modo "thinking".
- Ejecutable en entornos sin GPU mediante GGUF y llama.cpp.
- Compatible con endpoints (`endpoints_compatible` según los tags del repositorio).

## Casos de uso

- Experimentación y docencia sobre modelos de lenguaje: al ocupar entre 0,3 GB y 0,6 GB en GGUF, permite reproducir ejercicios de generación de texto, tokenización y evaluación en portátiles sin GPU.
- Prototipado de pipelines de inferencia local: sirve para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de migrar a modelos mayores, con tiempos de carga muy bajos.
- Generación de texto offline en dispositivos de bajos recursos: el cuantizado Q4_K_M (aproximadamente 0,3 GB) cabe en Raspberry Pi o mini-PC y puede alimentar funciones de autocompletado o textos cortos sin conexión.
- Pruebas de cuantización y evaluación de degradación: el repositorio ofrece 12 variantes (Q2_K a f16), lo que permite medir el impacto de la cuantización en perplejidad y calidad sobre un mismo modelo base.
- Generación de datos sintéticos a pequeña escala: útil para aumentar corpus en inglés en tareas de clasificación o filtrado previo, siempre con revisión humana dada la tasa de error esperable en 250M de parámetros.
- Base para fine-tuning de dominio: al ser Apache 2.0 y tener 250M de parámetros, es viable reentrenar o ajustar el modelo para vocabulario o estilos concretos en una sola GPU consumer.
- Investigación sobre scaling laws: punto de comparación de bajo coste frente a modelos de 1B o 7B en estudios de rendimiento por parámetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB de pesos en Q2_K, Q3_K_S, IQ4_XS, Q4_K_S y Q4_K_M; 0,4 GB en Q6_K y Q8_0; 0,6 GB en f16. Hay que sumar la caché KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU consumer con 1 GB o más de VRAM es suficiente (GTX 1050, RTX 3050, RTX 4090, etc.); también funciona en iGPU y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en placas integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (los tags indican `endpoints_compatible`), y transformers con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (250M de parámetros) se espera inferencia en CPU a velocidades interactivas, pero no hay cifras publicadas.
- Almacenamiento: el repositorio completo ocupa 2,8 GB; basta con descargar el archivo GGUF de la cuantización elegida (0,3-0,6 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Boris-250M-GGUF (este) | 250M | no disponible | Apache 2.0 | GGUF en Hugging Face |
| GPT-2 (OpenAI) | 124M | 1024 tokens | MIT | Safetensors/transformers, ampliamente replicado en GGUF |
| GPT-2 medium (OpenAI) | 355M | 1024 tokens | MIT | Safetensors/transformers |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | Apache 2.0 | Safetensors y GGUF, con variantes instruct |
| SmolLM2-360M | ~362M | 8192 tokens | Apache 2.0 | Safetensors y GGUF, con variantes instruct |

La comparación se limita a parámetros, contexto y licencia: no hay datos públicos de benchmarks de Boris-250M que permitan situarlo frente a estas alternativas. Frente a GPT-2, Boris-250M declara entrenamiento sobre corpus más recientes (fineweb-edu, DCLM), aunque sin métricas que lo confirmen; frente a Qwen2.5-0.5B y SmolLM2-360M, la desventaja principal es la ausencia de contexto documentado y de variantes instruct oficiales del modelo base.

## Limitaciones y advertencias

- Modelo pequeño (250M): capacidad de razonamiento, coherencia en textos largos y precisión factual muy limitadas; alta propensión a alucinaciones.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud de contexto no publicada: no se puede planificar el uso en conversaciones multi-turno o documentos largos sin medirla empíricamente.
- No es un modelo ajustado a instrucciones (el repositorio cuantiza el modelo base): puede requerir prompts de completado y no seguir órdenes de forma fiable. En la búsqueda aparece una variante Instruct (opencerebral/Boris-250M-Instruct-GGUF) que no es el objeto de esta ficha.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M.
- Solo hay cuantizaciones estáticas: no se ofrecen versiones con imatrix o ponderadas, lo que puede reducir la calidad frente a cuantizaciones optimizadas de otros modelos.
- Repositorio de terceros: mradermacher actúa como cuantizador, no como autor del modelo; los fallos de conversión o empaquetado deben verificarse contra el modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar la licencia del modelo base en su propio repositorio.
- Sin benchmarks ni evaluación independiente: no hay evidencia publicada de calidad frente a alternativas de tamaño similar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Boris-250M-GGUF
- Modelo base: https://huggingface.co/opencerebral/Boris-250M
- Variante Instruct (referenciada en la búsqueda): https://huggingface.co/opencerebral/Boris-250M-Instruct-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Boris-250M-GGUF
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
