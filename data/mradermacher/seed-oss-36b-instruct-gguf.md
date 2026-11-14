# mradermacher/Seed-OSS-36B-Instruct-GGUF

## Resumen

Seed-OSS-36B-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo Seed-OSS-36B-Instruct, desarrollado originalmente por ByteDance-Seed (el equipo de IA de ByteDance) y convertido a GGUF por mradermacher. El modelo base es un transformer denso de aproximadamente 36.151 millones de parámetros (36,15 B), orientado a instrucciones y conversación, publicado bajo licencia Apache 2.0. Esta ficha se centra en la distribución GGUF, que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia local mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación radica en que pone a disposición de la comunidad una batería completa de cuantizaciones estáticas (desde Q2_K hasta Q8_0, pasando por IQ4_XS), con tamaños que van de 13,7 GB a 38,5 GB, lo que facilita el despliegue en GPUs consumer de gama alta y en configuraciones con memoria unificada. El modelo está etiquetado para uso con transformers y vLLM, y conserva la licencia permisiva Apache 2.0 del modelo original, lo que lo hace apto para uso comercial.

No se dispone en la información proporcionada de detalles sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks del modelo base; estos aspectos se indican como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base; detalles específicos no disponibles) |
| Parametros totales | 36.151.104.512 (~36,15 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es ByteDance-Seed/Seed-OSS-36B-Instruct, un transformer denso de aproximadamente 36,15 B de parámetros. La información disponible no especifica la arquitectura interna detallada (número de capas, dimensión oculta, tipo de atención) ni los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). El sufijo "Instruct" indica que fue ajustado para seguir instrucciones y mantener conversaciones, y las etiquetas del repo incluyen "conversational".

Esta distribución GGUF es una conversión estática realizada por mradermacher mediante herramientas de cuantización (convert_type: hf, quantize_version: 2). No introduce cambios arquitectónicos: simplemente comprime los pesos del modelo original en distintos niveles de precisión. El autor también publica cuantizaciones ponderadas con imatrix en un repositorio separado (Seed-OSS-36B-Instruct-i1-GGUF), que suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones (modelo etiquetado como Instruct y conversational).
- Razonamiento general y respuesta a preguntas en inglés.
- Uso mediante transformers y vLLM (etiquetas del repo), además de llama.cpp por el formato GGUF.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües limitadas: el único idioma declarado es inglés.
- No se dispone de información sobre tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito (thinking mode) en la documentación proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno y seguir instrucciones, desplegado con llama.cpp u Ollama a partir de las cuantizaciones Q4_K_M (21,9 GB) o Q5_K_M (25,7 GB) en GPUs consumer de gama alta.
- Generación y revisión de texto técnico en inglés: adecuado para redactar documentación, resúmenes y borradores, con cuantización Q6_K (29,8 GB) cuando se prioriza calidad sobre velocidad.
- Prototipado de pipelines de inferencia: la disponibilidad de formatos GGUF y la compatibilidad con vLLM permiten comparar latencia y calidad entre cuantizaciones (Q4_K_S frente a Q8_0) antes de fijar una configuración de producción.
- Despliegue en entornos con memoria unificada: las cuantizaciones Q2_K (13,7 GB) y Q3_K_S (16,0 GB) permiten ejecutar el modelo en equipos con 16-24 GB de memoria, a costa de menor fidelidad.
- Evaluación comparativa de cuantizaciones: usar la batería completa (Q2_K a Q8_0) para medir la degradación de perplejidad y calidad en tareas concretas, apoyándose en las gráficas de referencia del autor.
- Servicio de chat interno con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales internos sin restricciones de licencia de tipo copyleft, siempre que se respeten las condiciones de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~13,7 GB; Q3_K_S ~16,0 GB; Q3_K_M ~17,7 GB; Q3_K_L ~19,2 GB; IQ4_XS ~19,8 GB; Q4_K_S ~20,8 GB; Q4_K_M ~21,9 GB; Q5_K_S ~25,1 GB; Q5_K_M ~25,7 GB; Q6_K ~29,8 GB; Q8_0 ~38,5 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPUs con 24 GB o más (RTX 4090, RTX 3090, A6000); para Q8_0, A100 40 GB o H100; para cuantizaciones bajas (Q2_K, Q3_K_S), GPUs de 16-24 GB.
- Cabe en GPU consumer: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con Q2_K/Q3_K_S y margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (etiqueta del repo), transformers; el formato GGUF es compatible con servidores basados en llama.cpp y con endpoints compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Seed-OSS-36B-Instruct (GGUF, esta ficha) | ~36,15 B | no disponible | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Seed-OSS-36B-Instruct (original) | ~36,15 B | no disponible | Apache 2.0 | safetensors | Hugging Face (ByteDance-Seed) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada en la información disponible, por lo que no debe asumirse una ventana larga.
- Cuantizaciones bajas: Q2_K y Q3_K_S reducen notablemente la fidelidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como "fast, recommended".
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de mitigación en la documentación.
- Sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de usar en producción.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar los avisos de licencia y atribución; conviene revisar el texto completo de la licencia del modelo base.
- Producción: al ser una conversión de terceros, la responsabilidad sobre la calidad final recae en quien despliega; se recomienda validar la cuantización elegida con un conjunto de evaluación propio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Seed-OSS-36B-Instruct-GGUF
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Seed-OSS-36B-Instruct-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Seed-OSS-36B-Instruct-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
