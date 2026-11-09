# mradermacher/LFM3-1.7B-Heretic-Abliterated-i1-GGUF

## Resumen

`mradermacher/LFM3-1.7B-Heretic-Abliterated-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `Vortecks/LFM3-1.7B-Heretic-Abliterated`. No se trata de un modelo entrenado desde cero, sino de una redistribucion en formato GGUF (con cuantizaciones ponderadas y con matriz de importancia, "imatrix") de un ajuste fino derivado de la familia LFM3 de Liquid AI, de la que el nombre sugiere un tamano de 1.700 millones de parametros. El autor del repo es un conocido generador de cuantizaciones para la comunidad de llama.cpp, no el desarrollador original del modelo.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye model card descriptiva (solo comentarios tecnicos del pipeline de cuantizacion), no declara licencia, no declara idiomas y no aporta informacion sobre el entrenamiento, los datos o los benchmarks. Ademas, el nombre "Heretic-Abliterated" sugiere una variante con las capas de rechazo o alineacion de seguridad eliminadas o modificadas, lo que tiene implicaciones directas para su uso en produccion. Cualquier evaluacion seria de este artefacto requiere consultar el modelo base original.

El campo de parametros totales reportado en los metadatos (899.013) es incoherente con el nombre del modelo (1.7B) y con el tamano tipico de un LFM3; probablemente refleja un recuento parcial o erroneo del pipeline de conversion. Se indica como "no disponible" fiable en la tabla de especificaciones, con la advertencia correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LFM3 de Liquid AI, presumiblemente transformer; no confirmado en la informacion proporcionada) |
| Parametros totales | no disponible de forma fiable (el nombre indica 1.7B; los metadatos reportan 899.013, dato incoherente) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas e imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) del modelo base `Vortecks/LFM3-1.7B-Heretic-Abliterated`. La model card del repositorio de cuantizacion unicamente documenta parametros del pipeline de conversion (version de cuantizacion 2, tensor de salida cuantizado, tipo de conversion "hf", etiqueta "nicoboss") y la lista de cuantizaciones generadas. No hay informacion sobre la innovacion tecnica de LFM3 (por ejemplo, si emplea capas lineales o atencion hibrida) aplicable a esta variante concreta.

El unico dato tecnico verificable es que las cuantizaciones son "weighted/imatrix", es decir, generadas usando una matriz de importancia calculada a partir de datos de calibracion, lo que en la practica mejora la fidelidad de las cuantizaciones de baja precision (IQ1, IQ2, IQ3) respecto a las cuantizaciones K-quant estandar. El sufijo "Heretic-Abliterated" indica que el ajuste fino del que deriva probablemente ha eliminado o debilitado los mecanismos de rechazo del modelo original, pero no se documenta el metodo exacto.

## Capacidades

- Generacion de texto autoregresiva (heredada del modelo base, sin confirmacion documentada).
- Razonamiento y conversacion multi-turno: presumible, no verificado en la informacion disponible.
- Generacion de codigo: presumible por la familia LFM3, no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Comportamiento de seguridad: presumiblemente alterado o eliminado por el ajuste "Heretic-Abliterated"; no documentado.

## Casos de uso

- Experimentacion local con llama.cpp: el formato GGUF y la disponibilidad de cuantizaciones desde IQ1 hasta Q6_K permiten ejecutar el modelo en hardware de gama baja, util para pruebas de concepto y evaluacion de la familia LFM3 en entornos sin GPU dedicada.
- Investigacion sobre alineacion y seguridad: al tratarse de una variante "abliterated", puede emplearse en estudios controlados sobre comportamiento de modelos sin capas de rechazo, siempre en entornos aislados y con supervision.
- Evaluacion comparativa de cuantizaciones: el conjunto de 24 cuantizaciones permite medir la degradacion de calidad entre IQ1 y Q6_K sobre el mismo modelo base, un caso de uso metodologico para estudiar el impacto de la cuantizacion.
- Prototipado de asistentes conversacionales de bajo coste: si el modelo base conserva capacidades conversacionales, las cuantizaciones Q4_K_M o Q5_K_M ofrecen un equilibrio razonable para demos locales en CPU o GPU consumer.
- Fine-tuning posterior o destilacion: el modelo puede servir como base para experimentos de ajuste, aunque la falta de licencia clara desaconseja su uso en productos comerciales.
- Despliegue en entornos con restricciones de memoria: las cuantizaciones IQ2/IQ3 permiten cargar el modelo en dispositivos con 2-4 GB de RAM/VRAM, adecuado para pruebas en Raspberry Pi o portatiles antiguos (con la degradacion de calidad correspondiente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (asumiendo ~1.7B parametros, no confirmado):
  - IQ1_S / IQ2_XXS: ~0.5-0.8 GB.
  - IQ2_M / Q2_K: ~0.9-1.2 GB.
  - IQ3_XS / Q3_K_S: ~1.0-1.3 GB.
  - Q4_K_M / IQ4_XS: ~1.1-1.5 GB.
  - Q5_K_M: ~1.3-1.7 GB.
  - Q6_K: ~1.5-2.0 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4/Q5; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en todas las GPU con 4 GB o mas, y en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa (requieren conversion a safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En una RTX 4060 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay datos medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated-i1-GGUF (este) | ~1.7B (no confirmado) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un ajuste "abliterated"; sin benchmarks ni model card |
| LFM3-1.7B (original de Liquid AI) | 1.7B | no disponible en esta ficha | no disponible en esta ficha | safetensors / GGUF | Modelo base oficial; consultar su model card para datos verificados |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa ampliamente soportada, con licencia clara y benchmarks publicos |
| Llama-3.2-1B-Instruct | 1.2B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa con licencia conocida y ecosistema amplio |

La comparativa es orientativa: no se dispone de datos verificados de contexto, licencia ni rendimiento de este repositorio, por lo que la comparacion con alternativas se basa en caracteristicas publicas de esas alternativas y no en una evaluacion directa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni comportamiento esperado.
- Licencia no declarada: no se puede asumir uso comercial permitido; consultar la licencia del modelo base `Vortecks/LFM3-1.7B-Heretic-Abliterated` y de LFM3 antes de cualquier uso en produccion.
- Variante "abliterated": el ajuste elimina o debilita los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado. No apta para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: inherente a modelos de ~1.7B y agravado por la falta de evaluacion publicada.
- Cuantizaciones de muy baja precision (IQ1, IQ2): degradacion significativa de calidad y coherencia; no recomendadas para tareas que requieran fiabilidad.
- Metadatos incoherentes: el recuento de parametros reportado (899.013) no cuadra con el nombre del modelo, lo que sugiere errores en el pipeline de publicacion.
- Cero descargas y likes: sin validacion por parte de la comunidad; no hay evidencia de que el artefacto funcione correctamente.
- Sin benchmarks: imposible comparar su rendimiento real con alternativas de forma objetiva.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Abliterated-i1-GGUF
- Modelo base del que deriva: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Familia LFM3 de Liquid AI (referencia del modelo original): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
