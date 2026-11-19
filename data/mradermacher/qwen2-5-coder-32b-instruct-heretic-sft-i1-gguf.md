# mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF

## Resumen

`mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF` es una colección de cuantizaciones GGUF, generadas con imatrix (i1), del modelo `PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft`. El modelo subyacente parte de Qwen2.5-Coder-32B-Instruct, un transformer denso de 32 763 876 352 parámetros, y ha sido sometido a un ajuste fino ("heretic" + SFT) por parte de PeetPedro. El trabajo de mradermacher se limita a la conversión y cuantización a formato GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha es doble. Por un lado, documenta una vía práctica para ejecutar un modelo de código de 32B en hardware de consumo mediante cuantizaciones que van desde 7,4 GB (i1-IQ1_S) hasta más de 20 GB (i1-Q4_K_M y superiores). Por otro, advierte de que el ajuste "heretic" modifica el comportamiento de alineamiento del modelo original, lo que tiene implicaciones directas sobre su idoneidad en producción.

La licencia declarada es Apache 2.0, el repo ocupa 351,5 GB (incluye todas las variantes de cuantización) y el idioma declarado en la model card es inglés. No se han publicado datos de benchmarks ni especificaciones de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen2.5-Coder, con 32 763 876 352 parámetros. Sobre él, PeetPedro aplicó un ajuste fino supervisado (SFT) con un componente etiquetado como "heretic", término que en la comunidad se asocia a técnicas de ablación o reentrenamiento orientadas a reducir los rechazos del modelo alineado original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de SFT ni si se emplearon técnicas de RLHF o DPO en esta variante.

La contribución de mradermacher es exclusivamente de cuantización: conversión a GGUF con `convert_type: hf`, generación de un fichero imatrix propio y producción de cuantizaciones ponderadas i1 (IQ y Q_K) en el rango de 7,4 GB a más de 20 GB. También existe una colección de cuantizaciones estáticas en un repositorio separado. No se documentan innovaciones arquitectónicas adicionales respecto al modelo base.

## Capacidades

- Generación de texto conversacional e instructivo, heredada de Qwen2.5-Coder-32B-Instruct.
- Generación y razonamiento sobre código en múltiples lenguajes de programación (capacidad del modelo base; no verificada en esta variante).
- Relleno de código y tareas de completado en contexto (capacidad del modelo base).
- Razonamiento matemático y resolución de problemas paso a paso (capacidad del modelo base).
- Soporte de conversaciones multi-turno con plantilla de chat instructiva.
- Capacidad declarada únicamente en inglés según la model card.
- Tool calling y function calling: no disponible en la información proporcionada para esta variante.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Asistente de código en local para desarrolladores individuales: con la cuantización i1-Q4_K_M (20,0 GB) el modelo puede ejecutarse en una GPU de 24 GB o en configuraciones CPU+GPU, ofreciendo asistencia de programación sin enviar código a servicios externos.
- Revisión de código en pipelines de CI: integrado mediante llama.cpp o servidores compatibles con la API de OpenAI, el modelo puede analizar diffs y generar comentarios de revisión, aunque la ausencia de datos de tool calling en esta variante obliga a validar esa integración antes de usarla.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de funciones existentes, aprovechando su base Qwen2.5-Coder; útil en equipos que necesitan aumentar cobertura sin depender de APIs externas.
- Documentación técnica automatizada: generación de docstrings y documentación de módulos a partir del código fuente, en un flujo por lotes con llama.cpp.
- Entornos con requisitos de privacidad estrictos: al ser un modelo Apache 2.0 ejecutable en local, encaja en organizaciones que no pueden enviar código propietario a servicios en la nube.
- Experimentación en investigación sobre alineamiento: la variante "heretic" permite estudiar el efecto de la reducción de rechazos sobre el comportamiento del modelo, comparándola con el Qwen2.5-Coder-32B-Instruct original.
- Despliegue en hardware de gama alta para prototipado: con cuantizaciones i1-Q5_K_M o i1-Q6_K (23,4 GB y superiores) en una A100 o H100 se obtiene mayor fidelidad respecto al modelo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan datos del modelo base ajustado por PeetPedro.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar KV cache): desde ~7,4 GB (i1-IQ1_S) hasta más de 23,4 GB (i1-Q5_K_M); las variantes Q6_K superan los 25 GB.
- Cuantizaciones recomendadas por el autor: i1-Q4_K_M (20,0 GB, "fast, recommended") e i1-Q4_K_S (18,9 GB, "optimal size/speed/quality").
- GPU de consumo: una RTX 4090 (24 GB) puede alojar i1-Q4_K_M, i1-Q4_K_S o i1-Q5_K_S (22,7 GB) con margen limitado para la KV cache; las cuantizaciones IQ2 e IQ3 (9-15 GB) caben en GPUs de 12-16 GB con offload parcial.
- GPU profesionales: A100 40/80 GB y H100 permiten ejecutar las cuantizaciones de mayor calidad con contexto amplio y mayor throughput.
- Despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; los tags del repositorio indican `endpoints_compatible`. vLLM y TGI no son la vía natural para GGUF, aunque vLLM soporta algunos formatos GGUF con limitaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 32,8B | no disponible | Apache 2.0 | GGUF i1 | Cuantizaciones con imatrix; ajuste "heretic" |
| Qwen2.5-Coder-32B-Instruct | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo original alineado; referencia de comportamiento |
| PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft | 32,8B | no disponible | Apache 2.0 | safetensors | Modelo base de estas cuantizaciones |
| mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF estático | Misma base, cuantizaciones sin imatrix |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otros autores.

## Limitaciones y advertencias

- El ajuste "heretic" implica una reducción deliberada de los rechazos del modelo; esto puede aumentar la probabilidad de respuestas dañinas, sesgadas o inapropiadas en comparación con el Qwen2.5-Coder-32B-Instruct original.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código puede generar APIs inexistentes o dependencias ficticias.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada en la información disponible; no debe asumirse la del modelo base sin verificación.
- Las cuantizaciones de baja precisión (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Aunque la licencia es Apache 2.0, el ajuste fino introduce un comportamiento distinto del original; conviene evaluar el modelo en el dominio concreto antes de usarlo en producción.
- No hay datos publicados de benchmarks, tool calling ni evaluación de seguridad para esta variante.
- El repositorio ocupa 351,5 GB; la descarga selectiva de una sola cuantización es imprescindible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF
- Modelo base: https://huggingface.co/PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
