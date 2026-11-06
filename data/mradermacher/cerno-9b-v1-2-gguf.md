# mradermacher/cerno-9b-v1.2-GGUF

## Resumen

Cerno 9B v1.2 es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9 mil millones) desarrollado por Apertix AI y publicado bajo licencia Apache 2.0. Esta ficha corresponde a la versión cuantizada en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está etiquetado con conceptos como "system-one", "typed-decisions", "calibrated-probabilities", "decision-index", "block-attention" y "read-twice", lo que sugiere un enfoque arquitectónico orientado a la toma de decisiones tipadas y a la calibración de probabilidades, aunque la model card no detalla estos mecanismos.

La relevancia de esta publicación radica en que ofrece una vía práctica para desplegar un modelo de ~9B en local con múltiples niveles de cuantización (desde Q2_K de 3,9 GB hasta f16 de 18 GB), lo que abarata la experimentación y el despliegue en entornos con recursos limitados. El modelo base es apertixai/cerno-9b-v1.2 y esta versión GGUF conserva la licencia Apache 2.0 del original.

No obstante, la información pública disponible es muy escasa: la model card del cuantizador se limita a listar los ficheros GGUF y a remitir a la documentación del modelo base, sin especificar longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Cualquier evaluación rigurosa requiere consultar directamente el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; etiquetas sugieren block-attention y read-twice) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura exacta más allá de que se trata de un transformer de ~9B parámetros. Las etiquetas de la model card ("block-attention", "read-twice", "system-one", "typed-decisions", "calibrated-probabilities", "decision-index") apuntan a innovaciones orientadas a la toma de decisiones estructuradas y a la calibración de la confianza en las respuestas, pero no se aportan detalles técnicos sobre su implementación, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Tampoco se especifica si el modelo emplea atención lineal, decodificación especulativa u otras técnicas de eficiencia. La model card del cuantizador es puramente operativa: lista los ficheros GGUF generados a partir del modelo base apertixai/cerno-9b-v1.2 y remite a la documentación de TheBloke para el uso de GGUF. Para obtener información sobre el entrenamiento es necesario consultar el repositorio del modelo base, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" y el pipeline declarado.
- Toma de decisiones tipadas ("typed-decisions") y uso de un índice de decisión ("decision-index"), según las etiquetas del autor; la mecánica concreta no está documentada en la información disponible.
- Probabilidades calibradas ("calibrated-probabilities"), lo que sugiere que el modelo puede exponer estimaciones de confianza; no se detalla la interfaz.
- Compatibilidad con endpoints ("endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- Soporte multilingüe: limitado al inglés según el campo `language`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) el modelo cabe en GPUs de consumo con 8-12 GB de VRAM, lo que permite experimentar con un modelo de ~9B sin depender de la nube.
- Prototipado de asistentes conversacionales en inglés: la etiqueta "conversational" y la compatibilidad con endpoints permiten montar un servicio de chat sobre llama.cpp o servidores compatibles con la API de OpenAI.
- Evaluación de mecanismos de decisión tipada: investigadores interesados en "typed-decisions" y "calibrated-probabilities" pueden usar esta versión GGUF para inspeccionar el comportamiento del modelo en entornos de bajos recursos antes de escalar al modelo completo en precisión f16.
- Integración en pipelines de CI/CD para pruebas de regresión de prompts: el tamaño reducido de las cuantizaciones Q3/Q4 permite ejecutar baterías de evaluación en runners con GPU modesta.
- Investigación sobre calibración de confianza: si el modelo expone probabilidades calibradas, puede emplearse en estudios de incertidumbre y abstención, siempre que se valide empíricamente su comportamiento.
- Educación y divulgación: al ser Apache 2.0 y caber en hardware de consumo, es adecuado para talleres y cursos sobre despliegue de LLM con llama.cpp y formatos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (3,9 GB): ~5-6 GB de VRAM.
  - Q4_K_M (5,7 GB): ~7-8 GB de VRAM.
  - Q5_K_M (6,6 GB): ~8-9 GB de VRAM.
  - Q8_0 (9,6 GB): ~11-12 GB de VRAM.
  - f16 (18,0 GB): ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o para alto throughput con contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs con 8-16 GB de VRAM; f16 requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (por la etiqueta "endpoints_compatible"), y cualquier runtime que soporte GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Cerno 9B v1.2 (esta ficha, GGUF) | ~8,95B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Modelo base apertixai/cerno-9b-v1.2 | ~8,95B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Alternativas de ~7-9B (p. ej. Llama 3.1 8B, Mistral 7B, Qwen2.5 7B) | 7-9B | 8k-128k según modelo | licencias variables (Llama, Apache 2.0) | safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo para Cerno 9B v1.2 en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Cualquier afirmación sobre calidad relativa frente a Llama, Mistral o Qwen requeriría benchmarks que no están publicados en las fuentes consultadas.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Documentación: la model card del cuantizador no aporta información sobre entrenamiento, sesgos o evaluación; la transparencia es limitada.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni sobre mecanismos de mitigación; debe validarse en el dominio de aplicación.
- Sesgos: no se documentan sesgos conocidos; al no haber información sobre el dataset, no es posible evaluar su composición ni los riesgos asociados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y de cualquier dependencia (tokenizador, código) antes de desplegar en producción.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Compatibilidad: al ser GGUF, no todos los motores de inferencia de alto rendimiento (vLLM, TGI) lo soportan; para esos casos debe usarse el modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cerno-9b-v1.2-GGUF
- Modelo base: https://huggingface.co/apertixai/cerno-9b-v1.2
- Página de descargas del cuantizador: https://hf.tst.eu/model#cerno-9b-v1.2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
