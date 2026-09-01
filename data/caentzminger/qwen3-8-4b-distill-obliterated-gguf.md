# caentzminger/Qwen3.8-4B-Distill-Obliterated-GGUF

## Resumen

El modelo `caentzminger/Qwen3.8-4B-Distill-Obliterated-GGUF` es una cuantización GGUF del modelo `empero-ai/Qwen3.8-4B-Distill`, al que se le ha aplicado una técnica de *abliteration* (eliminación de rechazos) para producir una variante sin censura orientada a conversación. El modelo base es una destilación de parámetros completos de Qwen3.8 (2.4T A95B, un modelo MoE de 2.4 billones de parámetros totales con 95 mil millones activos) en la arquitectura Qwen3.5-4B, entrenado sobre aproximadamente 45.000 trazas de profesor curadas que cubren razonamiento matemático, razonamiento general y seguimiento de instrucciones.

La relevancia de este modelo radica en su tamaño compacto (4B parámetros) combinado con capacidades de razonamiento denso heredadas de un modelo mucho mayor mediante destilación, y su formato GGUF que permite ejecución local eficiente en hardware de consumo. La variante "obliterated" elimina los mecanismos de rechazo, lo que la hace adecuada para casos de uso donde se requiere generación sin restricciones, aunque con los riesgos asociados. El modelo está etiquetado como `text-generation` y es compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (destilación de Qwen3.8 2.4T A95B) |
| Parametros totales | 4B (aproximado, no confirmado) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8 soporta hasta 256K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | GGUF (variantes Q4_0, Q5_K_M, etc. según archivos publicados; no se especifican todos) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe, pero no se confirma para esta variante) |
| Licencia | no disponible (el modelo base usa Apache-2.0, pero la licencia de este GGUF no está declarada) |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-4B-Distill` es una destilación de parámetros completos del modelo Qwen3.8 (2.4T A95B, un MoE con 95B parámetros activos) en la arquitectura Qwen3.5-4B, un transformer denso de 4 mil millones de parámetros. El entrenamiento se realizó sobre aproximadamente 45.000 trazas de profesor curadas, que incluyen cadenas de pensamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones, con filtrado de calidad previo al entrenamiento. No se especifica si se utilizaron técnicas de RLHF o DPO en el proceso de destilación.

La variante "obliterated" aplica *abliteration*, una técnica que modifica los pesos del modelo para eliminar los patrones de rechazo aprendidos durante el entrenamiento, resultando en un modelo que no se niega a responder a solicitudes que el modelo original rechazaría. Esta modificación se realiza posteriormente al entrenamiento de destilación y no altera la arquitectura subyacente.

## Capacidades

- Generación de texto conversacional sin rechazos (variante *uncensored*).
- Razonamiento matemático y general, heredado de la destilación de Qwen3.8.
- Seguimiento de instrucciones multi-turno.
- Capacidad de *function calling* (según el modelo base, aunque no se confirma en esta variante).
- Soporte de *tool calling* y razonamiento multi-paso (potencial, basado en el modelo base).
- Capacidades multilingües (potencial, basado en el modelo base Qwen3.8, pero no confirmado).
- Formato GGUF compatible con ejecución local en CPU/GPU mediante llama.cpp, Ollama, etc.

## Casos de uso

- **Generación creativa sin restricciones**: el modelo puede producir contenido narrativo, diálogos o guiones sin filtros de rechazo, útil para escritores que necesitan explorar temas sensibles sin limitaciones impuestas por el modelo base.
- **Asistente de conversación local**: al ser un GGUF de 4B, puede ejecutarse en portátiles o equipos de escritorio con GPU de gama media, ofreciendo un asistente conversacional privado y sin censura.
- **Optimización de prompts**: el modelo puede refactorizar prompts vagos en instrucciones estructuradas con roles, restricciones técnicas y esquemas de salida, como demuestra el proyecto "Prompt Architect" basado en Qwen3.8 4B.
- **Razonamiento matemático y lógico en entornos offline**: su destilación de un modelo de 2.4T le confiere capacidades de razonamiento superiores a otros modelos de 4B, útil para aplicaciones educativas o de análisis sin conexión.
- **Prototipado rápido de agentes conversacionales**: su tamaño reducido y formato GGUF permiten iterar rápidamente en el desarrollo de chatbots o asistentes virtuales antes de escalar a modelos mayores.
- **Investigación sobre alineación y seguridad**: la variante *obliterated* sirve como caso de estudio para analizar el impacto de la eliminación de rechazos en el comportamiento del modelo, útil para investigadores en seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `Qwen3.8-4B-Distill` no reporta métricas oficiales en la documentación consultada, y la variante GGUF no incluye datos de evaluación. Se recomienda consultar el repositorio de Qwen3.8 para benchmarks del modelo original, aunque no se dispone de comparativas específicas para esta destilación.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 4B en GGUF, la cuantización Q4_0 requiere aproximadamente 2,5 GB de VRAM (según datos de LLM Explorer para una variante similar). Cuantizaciones más altas (Q5_K_M, Q6_K) requieren entre 3 y 4 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo en cuantización Q4. Para mayor velocidad, se recomienda una RTX 3060 o superior.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo de gama baja y media. También puede ejecutarse en CPU con 8 GB de RAM, aunque con mayor latencia.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- **Latencia y throughput**: no disponible. Para un modelo de 4B en Q4, se estima una generación de 20-40 tokens/segundo en una RTX 3060, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill (empero-ai) | 4B | no disponible | Apache-2.0 | safetensors | Modelo base sin abliteration |
| Qwen3.8-4B-Distill-Obliterated (caentzminger) | 4B | no disponible | no disponible | GGUF | Variante sin rechazos |
| Qwen3.5-4B (oficial) | 4B | 256K | Apache-2.0 | safetensors, GGUF | Modelo original de Qwen |

No se dispone de datos de rendimiento comparativos. La principal diferencia entre las variantes es la eliminación de rechazos y el formato de pesos. El modelo base de Qwen3.5-4B tiene una ventana de contexto de 256K, pero no se confirma si la destilación la conserva.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser una destilación de Qwen3.8, puede heredar sesgos del modelo original, aunque no se han documentado específicamente.
- **Riesgo de alucinación**: no se dispone de datos sobre la tasa de alucinación; los modelos destilados pueden presentar alucinaciones en temas de baja frecuencia.
- **Limitaciones de contexto**: no se confirma la longitud de contexto real de esta variante; el modelo base Qwen3.8 soporta hasta 256K, pero la destilación podría haberla reducido.
- **Restricciones de licencia**: la licencia del GGUF no está declarada; el modelo base usa Apache-2.0, pero la modificación *obliterated* podría tener implicaciones legales o éticas no documentadas.
- **Riesgo de uso indebido**: al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o no ético. No debe usarse en aplicaciones de producción sin supervisión humana y salvaguardas adicionales.
- **Caveat de producción**: la técnica de *abliteration* puede degradar la calidad general del modelo o introducir comportamientos impredecibles; se recomienda evaluar exhaustivamente antes de cualquier despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/caentzminger/Qwen3.8-4B-Distill-Obliterated-GGUF)
- [Modelo base: empero-ai/Qwen3.8-4B-Distill](https://huggingface.co/empero-ai/Qwen3.8-4B-Distill)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Variante GGUF de mradermacher](https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-i1-GGUF)
- [Proyecto Prompt Architect basado en Qwen3.8 4B](https://github.com/47thtechcorner/RayCodes_Qwen3.8)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/Ma7ee7%2FQwen3.8_4B_Distilled_GGUF,2RAokxVG11JKnGhnMkwkIs)
