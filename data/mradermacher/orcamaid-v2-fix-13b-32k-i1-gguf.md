# mradermacher/OrcaMaid-v2-FIX-13b-32k-i1-GGUF

## Resumen

OrcaMaid-v2-FIX-13b-32k-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base ddh0/OrcaMaid-v2-FIX-13b-32k, un modelo de lenguaje de 13.015.864.320 parámetros. El modelo original es un merge de la familia Orca de Microsoft (según la licencia referenciada, microsoft-research-license) con contexto extendido a 32.000 tokens, y esta publicación se limita a ofrecer versiones cuantizadas con imatrix para su uso en llama.cpp y entornos compatibles con GGUF.

La relevancia de esta ficha es práctica: el repositorio no introduce capacidades nuevas, sino que facilita el despliegue local del modelo en hardware de consumo mediante 25 variantes de cuantización que van desde 3,0 GB (i1-IQ1_S) hasta 10,8 GB (i1-Q6_K). El tamaño total del repositorio es de 146,4 GB, lo que refleja la acumulación de todas las variantes publicadas.

Se trata, por tanto, de un artefacto de distribución más que de un modelo original: útil para quien quiera ejecutar OrcaMaid v2 con 32k de contexto en una GPU consumer o en CPU, pero sin garantías adicionales de calidad por parte del cuantizador más allá de las propias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer, inferido de la familia Orca; no confirmado en la informacion proporcionada) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 32.000 tokens (según el nombre del modelo base: "32k") |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | microsoft-research-license (license: other) |
| Formato de pesos | GGUF (con fichero imatrix adicional para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo base ddh0/OrcaMaid-v2-FIX-13b-32k en la información proporcionada. El nombre sugiere una fusión (merge) de modelos de la familia Orca de Microsoft con extensión de contexto a 32k, y la licencia referenciada apunta a la licencia de investigación de Microsoft asociada a Orca-2-13b, pero no se confirma ni la composición del merge ni el método de extensión de contexto.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (etiquetadas i1-) a partir del modelo base, empleando la versión 2 del pipeline de cuantización y tensores cuantizados en salida (output_tensor_quantised: 1). El repositorio incluye también el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OrcaMaid v2.
- Razonamiento y respuesta a instrucciones, presumiblemente por el linaje Orca, aunque no se detalla en la información disponible.
- Contexto largo de hasta 32.000 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Capacidad de generar cuantizaciones propias a partir del fichero imatrix incluido.
- No se documentan soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU consumer: usar la variante i1-Q4_K_M (8,0 GB) o i1-Q4_K_S (7,5 GB) para ejecutar el modelo en GPUs de 8-12 GB de VRAM con contexto moderado, aprovechando que el formato GGUF permite descarga por partes.
- Procesamiento de documentos largos en local: con 32k de contexto, el modelo puede resumir o extraer información de contratos, informes o artículos sin salir del equipo, usando cuantizaciones Q5_K_M o Q6_K si la VRAM lo permite.
- Generación de cuantizaciones personalizadas: el fichero imatrix incluido permite a equipos con requisitos específicos de tamaño/calidad producir sus propias variantes con llama.cpp.
- Prototipado de asistentes conversacionales en inglés: la ventana de 32k facilita mantener historiales largos en pruebas de concepto sin gestión agresiva de contexto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 25 variantes del mismo modelo, lo que permite medir el impacto de la cuantización en perplejidad y calidad para un caso de uso concreto.
- Inferencia en CPU o entornos sin GPU: las variantes IQ2/IQ3 (3,6-6,4 GB) permiten ejecutar el modelo en máquinas con RAM limitada, a costa de menor calidad.
- Investigación sobre modelos fusionados: útil para estudiar el comportamiento de merges de la familia Orca con contexto extendido en entornos reproducibles y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - i1-IQ1_S: ~3,0 GB de pesos.
  - i1-IQ2_M: ~4,6 GB.
  - i1-IQ3_M: ~6,1 GB.
  - i1-Q4_K_M: ~8,0 GB.
  - i1-Q5_K_M: ~9,3 GB.
  - i1-Q6_K: ~10,8 GB.
- GPU recomendadas: no disponibles de forma específica en la información proporcionada; por tamaño, una RTX 3060 de 12 GB o superior puede alojar variantes Q4/Q5, y una RTX 4090 (24 GB) permite Q6_K con contexto amplio.
- Cabe en GPU consumer: sí, las variantes IQ1 a Q4_K_M caben en GPUs de 8-12 GB; las variantes Q5/Q6 requieren 12-16 GB para contexto completo.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp, entre otros). El repositorio también declara compatibilidad con endpoints (endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OrcaMaid-v2-FIX-13b-32k-i1-GGUF (este) | 13,0 B | 32k | microsoft-research-license | GGUF (25 cuantizaciones) | Cuantizaciones imatrix de un merge de la familia Orca |
| ddh0/OrcaMaid-v2-FIX-13b-32k | 13,0 B | 32k | microsoft-research-license | safetensors (modelo base) | Modelo original sin cuantizar |
| mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF | 13,0 B | 32k | microsoft-research-license | GGUF (cuantizaciones estáticas) | Variante de cuantizaciones estáticas del mismo autor |
| Orca-2-13b (Microsoft) | 13,0 B | no disponible en esta ficha | microsoft-research-license | safetensors | Modelo de referencia del linaje Orca citado en la licencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia microsoft-research-license restringe el uso comercial; es imprescindible revisar los términos antes de desplegar en producción.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se han publicado benchmarks del modelo base ni de las cuantizaciones, por lo que no hay evidencia cuantitativa de calidad.
- Riesgo de alucinación inherente a los modelos de 13B de la familia Orca; no se documentan mitigaciones específicas.
- El repositorio tiene 0 likes y 946 descargas, lo que sugiere poca validación por parte de la comunidad.
- El tamaño del repositorio (146,4 GB) implica que la descarga completa es costosa; conviene descargar solo la variante necesaria.
- No se documentan limitaciones específicas de contexto o sesgos conocidos en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-i1-GGUF
- Modelo base: https://huggingface.co/ddh0/OrcaMaid-v2-FIX-13b-32k
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#OrcaMaid-v2-FIX-13b-32k-i1-GGUF
- Licencia de referencia (Orca-2-13b): https://huggingface.co/microsoft/Orca-2-13b/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
