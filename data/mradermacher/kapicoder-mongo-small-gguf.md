# mradermacher/KapiCoder-Mongo-Small-GGUF

## Resumen

KapiCoder-Mongo-Small-GGUF es la versión cuantizada en formato GGUF del modelo esilva/KapiCoder-Mongo-Small, publicada por mradermacher, un autor conocido en Hugging Face por convertir modelos en safetensors a GGUF para inferencia local. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), etiquetado con la arquitectura qwen2, especializado en generación de código con soporte de fill-in-the-middle (FIM) y autocompletado, y con un enfoque explícito en el ecosistema MongoDB.

El repositorio no aporta un modelo nuevo: reproduce el modelo original en 12 cuantizaciones estáticas (desde Q2_K hasta f16) para que pueda ejecutarse con llama.cpp, Ollama u otros runners compatibles con GGUF. Esto lo hace relevante para equipos que necesitan un autocompletado de código ligero, desplegable en hardware de consumo o incluso en CPU, sin depender de una API externa.

La información pública disponible es escasa: no hay model card detallada del modelo base, ni resultados de benchmarks, ni especificación de la longitud de contexto o del volumen de tokens de entrenamiento. Las etiquetas indican entrenamiento con datos sintéticos y soporte únicamente de inglés y portugués.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiquetado como qwen2 (no confirmado en la model card) |
| Parámetros totales | 1.543.714.304 (≈1,54 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) y portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base original en transformers/safetensors) |
| Modelo base | esilva/KapiCoder-Mongo-Small |
| Tamaño del repositorio | 14,2 GB (conjunto de todas las cuantizaciones) |
| Etiquetas funcionales | mongodb, code, fim, autocomplete, synthetic-data, conversational |

## Arquitectura y entrenamiento

No se dispone de documentación técnica del modelo base más allá de sus etiquetas. La etiqueta qwen2 sugiere una arquitectura transformer decoder-only con RoPE, atención causal estándar y tokenizador BPE del linaje Qwen2, pero la model card del repositorio cuantizado no confirma ni detalla esta correspondencia. El recuento real de parámetros desde safetensors (1.543.714.304) es consistente con un modelo denso de escala ~1,5 B, sin mezcla de expertos.

Sobre el entrenamiento solo consta la etiqueta synthetic-data, que indica el uso de datos generados sintéticamente, y el enfoque declarado en MongoDB, código, FIM y autocompletado. No hay información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El repositorio en sí es una conversión estática a GGUF realizada con la herramienta de mradermacher (quantize_version 2, salida con tensores cuantizados), sin cuantizaciones ponderadas por imatrix en el momento de la publicación.

## Capacidades

- Generación de código y autocompletado en modo fill-in-the-middle (FIM), orientado a integración en editores e IDE.
- Generación de consultas, pipelines de agregación y estructuras de datos específicas de MongoDB, según la especialización declarada del modelo base.
- Conversación multi-turno en formato chat (etiqueta conversational y compatibilidad con endpoints).
- Soporte de inglés y portugués; no se declara soporte de español.
- Ejecución local en formato GGUF mediante llama.cpp y runners compatibles.
- No hay evidencia documentada de tool calling, function calling, uso de agentes, razonamiento multi-paso explícito, visión, audio ni modo thinking. Se consideran no disponibles.

## Casos de uso

- Autocompletado en IDE mediante FIM: el modelo puede insertarse en extensiones tipo Continue o similares que hablan con un endpoint compatible con llama.cpp, rellenando huecos de código a partir del prefijo y el sufijo del fichero. Su tamaño de 1,5 B permite latencias bajas en GPU de consumo.
- Asistente de consultas MongoDB: generación de filtros, proyecciones y pipelines de agregación (match, group, lookup) a partir de descripciones en lenguaje natural, aprovechando la especialización declarada del modelo base en este dominio.
- Migración de SQL a MongoDB: traducción de consultas relacionales a operaciones de find/aggregate, con revisión humana posterior, en proyectos de modernización de bases de datos.
- Generación de tests unitarios y fixtures: creación de casos de prueba para funciones y para esquemas de documentos, útil como primer borrador en pipelines de CI.
- Documentación de esquemas y modelos de datos: generación de comentarios, descripciones de campos y documentación de colecciones e índices a partir del código existente.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con cuantizaciones de 1-2 GB, el modelo puede usarse en estaciones de trabajo sin conexión o en redes aisladas donde no se permite enviar código a una API externa.
- Pair programming en portugués: equipos lusófonos pueden mantener conversaciones técnicas y recibir explicaciones de código en su idioma, uno de los dos idiomas declarados.
- Prototipado en CPU: con Q4_K_S (1,0 GB) el modelo puede ejecutarse en servidores sin GPU para tareas de autocompletado de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K, MultiPL-E ni evaluaciones específicas de FIM, y no se han encontrado datos del modelo base esilva/KapiCoder-Mongo-Small en la búsqueda realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ≈ 0,8 GB; Q3_K_S/Q3_K_M ≈ 0,9 GB; Q3_K_L e IQ4_XS ≈ 1,0 GB; Q4_K_S ≈ 1,0 GB; Q4_K_M ≈ 1,1 GB; Q5_K_S/Q5_K_M ≈ 1,2 GB; Q6_K ≈ 1,4 GB; Q8_0 ≈ 1,7 GB; f16 ≈ 3,2 GB.
- Con overhead de contexto y buffers de llama.cpp, conviene reservar entre un 30 % y un 50 % adicional sobre el tamaño de los pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4/Q5 con contexto moderado. Una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 permiten contextos amplios y varias instancias en paralelo. Para f16, una GPU de 6-8 GB es suficiente.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650 4 GB, GTX 1060 6 GB, RTX 3050, RTX 3060, RTX 4060 y superiores, usando Q4_K_M o Q5_K_M.
- También es viable en CPU: con Q4_K_S (1,0 GB) o IQ4_XS funciona en portátiles sin GPU dedicada, con throughput reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF con un Modelfile), LM Studio, llama-cpp-python, text-generation-webui y otros runners compatibles con GGUF. El soporte de vLLM para GGUF es parcial y no está verificado para este modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este modelo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| KapiCoder-Mongo-Small-GGUF | 1,54 B | No disponible | Apache-2.0 | GGUF | Código, FIM, MongoDB, en/pt |
| Qwen2.5-Coder-1.5B | 1,54 B | 32 768 | Apache-2.0 | safetensors, GGUF | Código y FIM, multilingüe |
| StarCoder2-3B | 3 B | 16 384 | BigCode OpenRAIL-M | safetensors, GGUF | Código, FIM |
| CodeGemma-2B | 2 B | 8 192 | Términos de uso de Gemma | safetensors, GGUF | Código |

Nota: los datos de los modelos alternativos provienen de sus fichas públicas y no se han verificado contra la información proporcionada en esta búsqueda; se incluyen solo como referencia de categoría. No existen métricas comparativas publicadas para KapiCoder-Mongo-Small que permitan establecer una comparación de rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: no hay evidencia cuantitativa de su calidad frente a alternativas consolidadas de tamaño similar.
- El modelo declara únicamente inglés y portugués; el rendimiento en español no está soportado ni evaluado.
- El tamaño de 1,5 B limita el razonamiento complejo, la resolución de tareas de varios pasos y la coherencia en contextos muy largos.
- La especialización en MongoDB y en datos sintéticos puede implicar un rendimiento inferior en código generalista frente a modelos de código de propósito amplio.
- No se detalla la procedencia ni la composición del dataset sintético, lo que dificulta evaluar riesgos de sesgo, contaminación de benchmarks o licencias de los datos de origen.
- Riesgo de alucinación en APIs inexistentes: como todo modelo de código pequeño, puede generar métodos o funciones que no existen en la librería de MongoDB o en el driver correspondiente.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general y Q6_K/Q8_0 cuando la calidad es prioritaria.
- No hay cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación, lo que puede reducir la calidad respecto a cuantizaciones calibradas.
- El modelo es una conversión de terceros: los fallos del modelo base se heredan y no hay garantía de soporte por parte del autor original.
- La licencia Apache-2.0 es permisiva para uso comercial, pero conviene verificar la licencia y las condiciones del modelo base esilva/KapiCoder-Mongo-Small antes de desplegarlo en producción.
- Señales de validación comunitaria muy bajas (0 descargas, 1 like en el momento del registro), lo que indica ausencia de uso contrastado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/KapiCoder-Mongo-Small-GGUF
- Modelo base: https://huggingface.co/esilva/KapiCoder-Mongo-Small
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#KapiCoder-Mongo-Small-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
- Comprobador de compatibilidad de VRAM: https://runlocalmodel.com/
