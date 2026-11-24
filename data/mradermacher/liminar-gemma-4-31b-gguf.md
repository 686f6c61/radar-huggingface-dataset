# mradermacher/Liminar-Gemma-4-31B-GGUF

## Resumen

Liminar-Gemma-4-31B-GGUF es la versión cuantizada en formato GGUF del modelo Liminar-Gemma-4-31B, desarrollado originalmente por el LICDIA-UNLu (Laboratorio de Investigación y Desarrollo en Inteligencia Artificial de la Universidad Nacional de Luján, Argentina). La cuantización la firma mradermacher, un conocido publicador de quants en Hugging Face. El modelo está especializado en normativa y legislación universitaria argentina, según indican las etiquetas de la model card ("liminar", "argentina", "universidades", "normativa").

Se trata de un modelo conversacional derivado de la familia Gemma, con aproximadamente 30.700 millones de parámetros totales (30.697.345.596 según los pesos en safetensors del modelo base). La versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos completos en precisión original.

La relevancia de esta ficha radica en que ofrece un punto de acceso práctico a un modelo de nicho (dominio jurídico-normativo universitario argentino) en cuantizaciones que van de 12,0 GB (Q2_K) a 32,7 GB (Q8_0), lo que abre su uso en entornos con recursos limitados. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan benchmarks, composición del dataset de entrenamiento ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Gemma; sin detalles publicados) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | es (español, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Liminar-Gemma-4-31B. Por el nombre y el tamaño (≈30,7 B de parámetros) se infiere que deriva de la familia Gemma de Google, pero la model card del repositorio cuantizado no especifica si se trata de un transformer denso, un MoE o una variante híbrida, ni detalla innovaciones como atención lineal o decodificación especulativa.

Tampoco se publican datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de ajuste fino. Las etiquetas ("liminar", "argentina", "universidades", "normativa") sugieren un ajuste orientado a normativa universitaria argentina, pero no hay documentación que cuantifique ese ajuste. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye quants ponderados con imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en español, orientada a consultas sobre normativa y legislación universitaria argentina.
- Respuesta a preguntas sobre el dominio "liminar" y el marco normativo de universidades (según las etiquetas del modelo).
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades multilingües: limitadas al español según la model card; no se documentan otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Consulta de normativa universitaria argentina: el modelo puede responder preguntas sobre reglamentos, estatutos y resoluciones del ámbito universitario, aprovechando su ajuste específico al dominio "liminar" y "universidades".
- Asistencia a estudiantes y personal administrativo: un chatbot que resuelva dudas sobre trámites, plazos y requisitos normativos dentro de una institución, desplegado localmente con llama.cpp.
- Soporte a la gestión documental jurídica: resumen y explicación de textos normativos para equipos de secretaría o asesoría legal universitaria.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (17,9 GB) y Q4_K_M (18,8 GB) permiten ejecución en estaciones de trabajo con GPU de 24 GB, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en español: base para experimentos de ajuste adicional o evaluación en dominios administrativos hispanohablantes.
- Investigación en IA aplicada al derecho: análisis de cómo un modelo de ~30 B ajustado a un corpus normativo concreto responde a preguntas de dominio, con licencia Apache 2.0 que facilita la experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 12,0 GB; Q3_K_S ≈ 13,9 GB; Q4_K_S ≈ 17,9 GB; Q4_K_M ≈ 18,8 GB; Q5_K_M ≈ 21,9 GB; Q6_K ≈ 25,3 GB; Q8_0 ≈ 32,7 GB (tamaños de fichero, la VRAM real añade overhead de contexto y caché KV).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; GPUs de 16 GB solo para Q2_K/Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para los pesos originales, transformers/vLLM/TGI (no verificados con este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas directamente comparables en el mismo nicho (normativa universitaria argentina). Se ofrece una comparación estructural básica con modelos de tamaño similar de la familia Gemma y equivalentes abiertos:

| Modelo | Parametros | Contexto | Licencia | Formato | Nicho |
|---|---|---|---|---|---|
| Liminar-Gemma-4-31B (este) | ~30,7 B | no disponible | Apache 2.0 | GGUF / safetensors | Normativa universitaria argentina |
| Gemma 2 27B (referencia de familia) | ~27 B | no disponible en esta ficha | Gemma license | safetensors / GGUF | Propósito general |
| Modelos 30B clase Llama (referencia) | ~30 B | no disponible en esta ficha | Llama license | safetensors / GGUF | Propósito general |

La comparación cuantitativa de rendimiento no está disponible; los datos de las alternativas se incluyen solo como referencia de categoría y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El ajuste al dominio "normativa universitaria argentina" puede provocar respuestas desactualizadas o incorrectas si la legislación cambia; verificar siempre contra fuentes oficiales.
- Riesgo de alucinación inherente a modelos generativos, agravado por la falta de documentación sobre el corpus de entrenamiento.
- Idiomas: la model card solo declara español; el uso en otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede planificar el despliegue para documentos largos sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar restricciones de la familia Gemma; conviene revisar la licencia del modelo original LICDIA-UNLu/Liminar-Gemma-4-31B.
- Los quants Q2_K y Q3_K_M tienen calidad reducida según la propia model card; para producción se recomienda Q4_K_M o superior.
- No hay quants ponderados con imatrix disponibles en el momento de la publicación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liminar-Gemma-4-31B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-31B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Gemma-4-31B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
