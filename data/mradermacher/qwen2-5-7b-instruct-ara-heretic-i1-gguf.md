# mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF` es una cuantización GGUF de la variante "heretic" (abliterated/decensored) del modelo Qwen2.5-7B-Instruct, publicada por el usuario mradermacher. Se trata, por tanto, de una conversión de pesos a formato GGUF con cuantización ponderada mediante imatrix, pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.). El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only de la familia Qwen2.5 desarrollada por Alibaba Cloud, con 7.615.616.512 parámetros totales según los tensores safetensors reportados.

La particularidad de esta variante es su origen "heretic": proviene de `richardyoung/Qwen2.5-7B-Instruct-ARA-heretic`, una modificación del modelo original orientada a reducir los rechazos y el comportamiento de censura (técnicas de abliteration/decensoring). El autor de la cuantización no documenta el proceso de entrenamiento ni los datos utilizados para esa modificación; la model card se limita a indicar el origen y los tipos de cuantización generados.

La relevancia de esta ficha es limitada pero concreta: ofrece un artefacto GGUF listo para desplegar en hardware de consumo, con un abanico amplio de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite ajustar el equilibrio entre calidad y uso de memoria. No obstante, la ausencia de licencia declarada, de idiomas especificados y de benchmarks publicados obliga a tratarlo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); detalles no disponibles en la información proporcionada |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para esta variante) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | No disponible en la información proporcionada (el modelo base Qwen2.5 se distribuye bajo Apache 2.0, pero esta variante no declara licencia) |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por cabezas agrupadas (GQA) y RoPE, según la familia Qwen2.5 de Alibaba Cloud. Sin embargo, la información proporcionada no incluye detalles verificados sobre la configuración exacta de capas, dimensiones ocultas o número de cabezas para esta variante concreta, por lo que no se pueden confirmar más allá de lo que implica el recuento de parámetros.

El proceso de entrenamiento documentado en la información disponible es mínimo: se sabe que la cuantización parte de `richardyoung/Qwen2.5-7B-Instruct-ARA-heretic`, una modificación "heretic" del modelo original, y que mradermacher aplicó cuantización con pesos derivados de una matriz de importancia (imatrix), lo que mejora la calidad de las cuantizaciones de baja precisión. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO específicas de esta variante. Tampoco se detalla la técnica exacta de abliteration o decensoring aplicada en el modelo intermedio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (etiquetas de conversación de Qwen2.5).
- Generación de código y resolución de problemas matemáticos, como capacidades propias del modelo base (no verificadas específicamente en esta variante).
- Comportamiento "heretic": menor tendencia a rechazar peticiones que el modelo original, por el proceso de decensoring aplicado en el modelo intermedio.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante, aunque el modelo base Qwen2.5-7B-Instruct lo soporta.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo "thinking" en esta variante.

## Casos de uso

- Experimentación con modelos decensored en local: el modelo permite estudiar el efecto de las técnicas de abliteration sobre el comportamiento de rechazo, ejecutándose en una sola GPU de consumo gracias a las cuantizaciones Q4_K_M o IQ4_XS.
- Asistente conversacional offline: con una cuantización Q4_K_M (en torno a 4,5 GB) puede desplegarse en portátiles con GPU de 8 GB o en CPU con llama.cpp, gestionando conversaciones multi-turno con el formato de chat de Qwen2.5.
- Generación de texto creativo sin filtros restrictivos: útil para escritura de ficción o guiones donde el modelo base tendería a rechazar ciertos temas, aunque con las advertencias éticas y legales correspondientes.
- Prototipado de pipelines de inferencia GGUF: sirve como banco de pruebas para comparar cuantizaciones (por ejemplo, Q2_K frente a Q5_K_M) y medir la degradación de calidad con imatrix en un modelo de 7B.
- Evaluación de robustez y seguridad: investigadores pueden usar esta variante para medir cómo cambia la tasa de rechazo y la calidad de respuesta respecto al Qwen2.5-7B-Instruct original.
- Despliegue en entornos con recursos muy limitados: las cuantizaciones IQ1_S e IQ2_XXS permiten ejecutar el modelo en configuraciones de menos de 3 GB de RAM/VRAM, a costa de una pérdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según el tamaño de cada cuantización, no confirmada por el autor):
  - IQ1_S / IQ2_XXS: en torno a 2-2,5 GB.
  - Q2_K / IQ3_XXS: en torno a 2,5-3,5 GB.
  - Q3_K_M / IQ3_M: en torno a 3,5-4 GB.
  - Q4_K_M / IQ4_XS: en torno a 4,5-5 GB.
  - Q5_K_M: en torno a 5,5 GB.
  - Q6_K: en torno a 6,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 no son necesarias para un modelo de 7B, pero permitirían mayor throughput en despliegues concurrentes.
- Cabe en GPU de consumo: sí, desde tarjetas de 6-8 GB con cuantizaciones Q3/Q4; las cuantizaciones Q5/Q6 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF | 7,62 B | No disponible | GGUF | No disponible | Variante heretic cuantizada, sin benchmarks |
| mradermacher/Qwen2.5-7B-Instruct-1M-heretic-i1-GGUF | 7,62 B (base) | 1M (según nombre) | GGUF | qwen (según tag) | Variante heretic con contexto extendido a 1M |
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic | 7,62 B | No disponible | Safetensors (presumible) | No disponible | Modelo origen de esta cuantización |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens nativos | Safetensors, GGUF oficial | Apache 2.0 | Modelo base original, con benchmarks publicados |

## Limitaciones y advertencias

- La licencia no está declarada en la información proporcionada; no se puede garantizar el uso comercial sin verificar la licencia del modelo origen (`richardyoung/Qwen2.5-7B-Instruct-ARA-heretic`) y del base (Qwen2.5, Apache 2.0).
- El proceso de abliteration/decensoring puede degradar capacidades de razonamiento y aumentar la probabilidad de generar contenido inapropiado, sesgado o factualmente incorrecto; no se han publicado evaluaciones al respecto.
- Riesgo de alucinación inherente a un modelo de 7B, agravado por la falta de benchmarks que cuantifiquen la degradación respecto al original.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS) degradan notablemente la calidad; no se recomiendan para producción.
- No se especifican los idiomas soportados; el modelo base Qwen2.5 es multilingüe, pero esta variante no lo declara.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No hay información sobre el contexto efectivo tras la modificación heretic; asumir el del modelo base sin verificar es arriesgado.
- Uso en producción desaconsejado sin evaluación propia de sesgos, seguridad y calidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF
- Modelo origen de la cuantización: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Variante relacionada con contexto 1M: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-1M-heretic-i1-GGUF
- Variante VL heretic del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-heretic-i1-GGUF
