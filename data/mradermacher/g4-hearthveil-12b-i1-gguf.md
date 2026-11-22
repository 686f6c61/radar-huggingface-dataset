# mradermacher/G4-Hearthveil-12B-i1-GGUF

## Resumen

G4-Hearthveil-12B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo base G4-Hearthveil-12B, publicada por el usuario mradermacher. El modelo original, alojado en el repositorio OutisR/G4-Hearthveil-12B, cuenta con 11.907.350.576 parámetros (aproximadamente 12B) según los datos de safetensors. Esta publicación no contiene los pesos originales, sino conversiones cuantizadas pensadas para su uso con llama.cpp y herramientas compatibles con GGUF.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 12B en hardware de consumo mediante cuantizaciones que van desde IQ1_S hasta Q6_K, cubriendo un amplio espectro de compromisos entre calidad y uso de memoria. El repositorio ocupa 90,9 GB en total, lo que refleja la suma de todas las variantes de cuantización publicadas. La información disponible sobre el modelo base (arquitectura, datos de entrenamiento, licencia, idiomas) es muy limitada: la model card se reduce a metadatos de la herramienta de cuantización y no aporta detalles técnicos del modelo original.

El autor de la cuantización, mradermacher, es conocido en el ecosistema por publicar versiones GGUF de modelos open source con cuantizaciones ponderadas mediante imatrix, una técnica que mejora la calidad de las cuantizaciones de baja precisión al calibrar los pesos según su importancia. Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos y la model card proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base G4-Hearthveil-12B, detalles no publicados en la información disponible) |
| Parametros totales | 11.907.350.576 (aprox. 12B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones del modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base G4-Hearthveil-12B en los datos proporcionados. El recuento de parámetros (11.907.350.576) es coherente con un transformer denso de aproximadamente 12B, pero no se confirma el tipo de arquitectura, el número de capas, la dimensión de los embeddings ni el mecanismo de atención. Tampoco se documentan los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica verificable se refiere al proceso de cuantización: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que señala una conversión desde pesos en formato Hugging Face a GGUF mediante la herramienta de cuantización de llama.cpp. Las cuantizaciones son ponderadas mediante imatrix (matriz de importancia), una técnica que estima la relevancia de cada tensor a partir de un corpus de calibración y ajusta la cuantización para preservar mejor la calidad en precisiones bajas como IQ1, IQ2 e IQ3. El tag `nicoboss` sugiere el uso de una herramienta o flujo de trabajo asociado a ese identificador, aunque no se detalla su función.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 12B parámetros, por lo que se espera capacidad de generación de texto general, aunque no se documentan capacidades específicas.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local: las cuantizaciones GGUF permiten inferencia en CPU y GPU mediante llama.cpp y herramientas compatibles, incluyendo opciones de muy baja precisión (IQ1_S, IQ2_XXS) para hardware con memoria limitada.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M o Q4_K_S permiten ejecutar un modelo de 12B en GPUs con 8-12 GB de VRAM o en CPU con suficiente RAM, adecuado para prototipado y uso personal sin depender de servicios en la nube.
- Despliegue en equipos con memoria muy limitada: las variantes IQ1_S, IQ2_XXS e IQ2_XS reducen el peso del modelo a rangos que pueden caber en sistemas con 4-6 GB de memoria, a costa de una pérdida de calidad que debe evaluarse empíricamente.
- Experimentación con cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite comparar el impacto de la precisión en la calidad de salida sobre el mismo modelo base, útil para investigación en eficiencia de inferencia.
- Integración en aplicaciones de escritorio: mediante llama.cpp u Ollama, el modelo puede integrarse en aplicaciones locales que requieran generación de texto sin conexión, con la ventaja de privacidad que supone no enviar datos a un servidor.
- Evaluación de modelos desconocidos: dado que el modelo base carece de documentación pública, estas cuantizaciones sirven para que investigadores evalúen empíricamente el comportamiento del modelo G4-Hearthveil-12B en tareas concretas antes de decidir si invertir en los pesos originales.
- Servicio de inferencia de bajo coste: en un servidor con GPU modesta, una cuantización Q5_K_M o Q6_K puede ofrecer un equilibrio razonable entre calidad y throughput para cargas de trabajo ligeras, aunque la falta de datos de benchmarks impide garantizar el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de cada cuantización para 12B parámetros):
  - IQ1_S / IQ1_M: en torno a 3-4 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 4-5 GB.
  - Q2_K / Q2_K_S / IQ3_XXS / IQ3_XS: en torno a 5-6 GB.
  - IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 6-7 GB.
  - Q4_0 / Q4_1 / Q4_K_S / IQ4_XS / small-IQ4_NL: en torno a 7-8 GB.
  - Q4_K_M: en torno a 8 GB.
  - Q5_K_S / Q5_K_M: en torno a 9-10 GB.
  - Q6_K: en torno a 11-12 GB.
  - Nota: estas cifras son estimaciones basadas en el tamaño típico de cuantizaciones para modelos de 12B; no se han verificado con los archivos reales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para las cuantizaciones medias y altas; A100 o H100 para las variantes Q6_K y para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M e inferiores caben en GPUs de 8-12 GB; las variantes IQ1 e IQ2 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores de alto rendimiento, vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habría que usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantización y de la longitud de contexto, que no se ha documentado.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base G4-Hearthveil-12B (arquitectura, contexto, rendimiento, licencia) para establecer una comparativa rigurosa con alternativas. A continuación se indican modelos de tamaño comparable en el ecosistema GGUF, pero los datos del modelo de esta ficha no permiten una comparación directa.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| G4-Hearthveil-12B (esta ficha) | ~12B | no disponible | no disponible | sí (i1, imatrix) |
| Mistral-Nemo-12B | 12B | 128K | Apache 2.0 | sí |
| Gemma-2-9B | 9B | 8K | Gemma license | sí |
| Qwen2.5-14B | 14B | 32K | Apache 2.0 | sí |

La comparación de rendimiento, contexto y licencia no es posible para el modelo de esta ficha por falta de datos publicados.

## Limitaciones y advertencias

- Falta total de documentación del modelo base: no se especifican arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para uso comercial o producción.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe consultarse el repositorio original OutisR/G4-Hearthveil-12B antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluación publicada no puede cuantificarse su fiabilidad.
- Degradación por cuantización: las variantes IQ1 e IQ2, aunque ponderadas con imatrix, pueden perder calidad de forma notable en tareas de razonamiento y generación de código; se recomienda Q4_K_M o superior para uso serio.
- Idiomas no documentados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Contexto desconocido: sin la longitud de contexto documentada, no se pueden planificar casos de uso que requieran ventanas largas.
- Repositorio sin descargas ni likes en el momento de la consulta: indica ausencia de validación por parte de la comunidad; conviene tratar los pesos con cautela y verificar su integridad.
- Tamaño del repo (90,9 GB): la descarga completa de todas las cuantizaciones es costosa en almacenamiento; se recomienda descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/G4-Hearthveil-12B-i1-GGUF
- Modelo base original: https://huggingface.co/OutisR/G4-Hearthveil-12B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
