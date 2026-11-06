# abliterant/Qwen3.8-27B-RANA-abliterated-GGUF

## Resumen

Qwen3.8-27B-RANA-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo abliterant/Qwen3.8-27B-RANA-abliterated, un checkpoint de 27B parámetros derivado de Qwen/Qwen3.8-27B al que se le ha aplicado una técnica de "abliteration" para eliminar la dirección de rechazo (refusal direction) del alineamiento de seguridad. El resultado es un modelo de investigación sin alineamiento de seguridad, orientado a escenarios donde se necesita una respuesta sin filtros previos del modelo base. Mantiene la naturaleza multimodal del original: procesa imagen y texto (pipeline image-text-to-text) e incluye una torre de visión y una cabeza de decodificación especulativa MTP como archivos separados.

El modelo tiene 26.895.998.464 parámetros totales (aproximadamente 27B) y está publicado bajo licencia Apache-2.0. El repositorio GGUF ofrece 15 cuantizaciones distintas, desde Q8_0 hasta IQ2_M, generadas con matrices de importancia (imatrix) calculadas sobre texto de calibración general. El contexto nativo del modelo base es de 262.144 tokens, aunque el ejemplo de servicio documentado utiliza 32.768 tokens. Incluye assets separados para visión (mmproj) y para la cabeza MTP de decodificación especulativa.

La relevancia actual de esta ficha reside en dos factores: por un lado, la familia Qwen3.8-27B es una de las referencias abiertas de tamaño medio con capacidades multimodales y contexto largo; por otro, la variante abliterated interesa a investigadores que estudian el alineamiento, la direccionalidad del rechazo y el comportamiento de modelos sin salvaguardas. Es un modelo explícitamente etiquetado como de investigación, no como producto listo para producción sin evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión y cabeza MTP de decodificación especulativa |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; 32.768 tokens en el ejemplo de servicio documentado |
| Tipos de cuantización | 15 variantes, de Q8_0 a IQ2_M (incluye Q4_K_M, entre otras) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); referencia BF16 en safetensors en el repo base |
| Tamaño del repositorio | 304,0 GB |
| Commit de llama.cpp probado | `4b1a27f` |
| Hardware de las pruebas | RTX PRO 6000 Blackwell (CUDA) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen/Qwen3.8-27B. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` en el commit `4b1a27f` de llama.cpp, generando tres artefactos: el modelo principal (851 tensores, 53,8 GB en BF16), la torre de visión (18 tensores, 5,9 GB) y la cabeza MTP (334 tensores, 0,93 GB). Los recuentos y tamaños de tensores coinciden con la conversión de ggml-org del modelo base, lo que indica una conversión fiel sin modificaciones estructurales.

La cuantización emplea `llama-quantize --imatrix` con la matriz de importancia calculada mediante `llama-imatrix` sobre el texto de calibración público de bartowski (`Qwen3.8-27B-calibration-v6.txt`), compuesto por texto general sin prompts relacionados con rechazo. Se usaron los layouts de tensor por defecto de llama.cpp para cada tipo, sin overrides por tensor. Es importante subrayar que la conversión y cuantización no constituyen entrenamiento adicional: la abliteración se aplicó en el checkpoint BF16 de origen, cuyo método y evaluación completa se documentan en la model card del repo BF16. El modelo base original fue entrenado por Qwen; la información sobre número de tokens de entrenamiento, composición del dataset y etapas de RLHF/DPO del Qwen3.8-27B original no está disponible en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto; el autor recomienda configurar `--min-p 0` explícitamente porque el valor por defecto de llama.cpp es 0,05.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión incluida como archivo `mmproj-*` separado.
- Decodificación especulativa mediante cabeza MTP (`mtp-*`) con `--spec-type draft-mtp`, que acelera la generación.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantillas Jinja (`--jinja`), lo que habilita el formato de chat y el tool calling del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento sin rechazo: el alineamiento de seguridad ha sido eliminado por abliteración, por lo que responde a solicitudes que el modelo base rechazaría.

## Casos de uso

- Investigación sobre alineamiento y direccionalidad del rechazo: el modelo permite comparar respuestas del checkpoint abliterated frente al Qwen3.8-27B original para estudiar qué comportamientos cambian al eliminar la refusal direction, con la ventaja de disponer de 15 cuantizaciones para ajustar el coste computacional del experimento.
- Evaluación de robustez de filtros y salvaguardas externas: al carecer de rechazo interno, es un banco de pruebas útil para medir si capas de moderación externas (clasificadores, guardrails) detectan contenido que el modelo base habría bloqueado por sí mismo.
- Análisis multimodal de documentos: con la torre de visión y 32.768 tokens de contexto en el ejemplo de servicio, puede procesar imágenes junto a texto largo, por ejemplo para extraer y razonar sobre diagramas técnicos o capturas de pantalla en un pipeline de investigación.
- Generación de código y razonamiento técnico en local: el modo thinking y la decodificación especulativa MTP permiten ejecutar tareas de razonamiento largo en una sola GPU consumer o profesional con cuantizaciones Q4_K_M o inferiores, útil para entornos de desarrollo sin conexión.
- Despliegue en llama.cpp para experimentación con cuantizaciones: el repositorio ofrece desde Q8_0 hasta IQ2_M, lo que permite medir el compromiso entre calidad (KLD) y tamaño en el mismo modelo, algo útil para investigar técnicas de cuantización con imatrix.
- Estudio de decodificación especulativa: la cabeza MTP separada permite comparar latencia y throughput con y sin `--spec-type draft-mtp` sobre el mismo checkpoint, un caso práctico para evaluar el impacto real de la decodificación especulativa en llama.cpp.
- Prototipado de asistentes conversacionales sin restricciones temáticas en entornos controlados de investigación, siempre con revisión humana y sin exposición directa a usuarios finales.

## Benchmarks y rendimiento

La información proporcionada solo incluye datos de perplejidad y de calidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Valor |
|---|---|
| Perplejidad BF16 GGUF (mismo texto) | 6,776 ± 0,104 |
| Perplejidad Qwen3.8-27B base (tabla de bartowski) | 6,744 ± 0,103 |

La comparación de perplejidad es indicativa y no estrictamente equivalente, porque se trata de modelos distintos medidos con el mismo protocolo (perplexity.md de bartowski, llama.cpp b10896). Las comprobaciones funcionales y de rechazo cubren únicamente Q4_K_M; las 15 cuantizaciones tienen mediciones de cercanía de distribución (KLD) frente a BF16, no una evaluación downstream completa. La tabla de KLD por cuantización aparece truncada en la información disponible.

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 304 GB en total por incluir las 15 cuantizaciones; una sola variante Q4_K_M ronda los 16-17 GB de pesos, más la torre de visión (0,93 GB en BF16) y la cabeza MTP (Q8_0). Las cuantizaciones Q8_0 se acercan a los 28-29 GB.
- GPU recomendadas: las pruebas del autor se realizaron en RTX PRO 6000 Blackwell con CUDA. Para Q4_K_M es razonable una RTX 4090 (24 GB) o una RTX 3090; para Q8_0 se necesita una GPU de 32 GB o más (A100 40 GB, RTX PRO 6000).
- GPU consumer: sí, las cuantizaciones Q4_K_M e inferiores caben en GPUs de 24 GB; las IQ2_M/IQ3 permiten bajar a 12-16 GB con pérdida de calidad.
- Opciones de despliegue: llama.cpp (`llama-server`) en el commit `4b1a27f` o posterior; también existe una variante FP8 para vLLM/SGLang y una variante MLX para Apple Silicon en repos separados.
- Latencia y throughput: no disponibles de forma numérica; el autor documenta que las peticiones técnicas largas pueden necesitar 20.000-50.000 tokens de razonamiento, lo que afecta directamente a la latencia percibida y obliga a ampliar `-c`.
- Flags de servicio del ejemplo del autor: `--jinja -fa on -ngl 99 -c 32768 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterant/Qwen3.8-27B-RANA-abliterated-GGUF (este) | 26,9B | 262k nativo; 32.768 en ejemplo | Apache-2.0 | GGUF (15 cuants) + FP8 + MLX | Sin alineamiento de seguridad; visión y MTP incluidos |
| Qwen/Qwen3.8-27B | 27B (aprox.) | 262k | Apache-2.0 (según repo base) | safetensors, GGUF de terceros | Modelo original con alineamiento; referencia de comparación |
| bartowski/Qwen3.8-27B-GGUF | 27B (aprox.) | 262k | Apache-2.0 | GGUF | Cuantizaciones del base, sin abliterar; usadas como referencia de KLD y perplejidad |
| ggml-org/Qwen3.8-27B-GGUF | 27B (aprox.) | 262k | Apache-2.0 | GGUF | Conversión oficial de referencia del base; mismo layout de archivos |

La comparativa de rendimiento downstream entre estas variantes no está disponible en la información proporcionada; solo se dispone de la comparación de perplejidad BF16 (6,776 frente a 6,744 del base) y de la tabla de KLD por cuantización, truncada en los datos recibidos.

## Limitaciones y advertencias

- Modelo de investigación sin alineamiento de seguridad: la abliteración elimina la refusal direction, por lo que puede generar contenido que el modelo base rechazaría. No debe exponerse directamente a usuarios finales sin capas de moderación externas.
- Riesgo de alucinación: inherente a los modelos de 27B; no hay evaluación downstream publicada en la información disponible que cuantifique este riesgo.
- Sesgos: no se documentan en la información proporcionada; al derivar del Qwen3.8-27B original, hereda los sesgos de su dataset de entrenamiento, que tampoco se detalla.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe de esta variante.
- Contexto: los 262k tokens son el contexto nativo del modelo base; el autor advierte explícitamente que no se ha establecido como límite validado en GGUF. El ejemplo de servicio usa 32.768 tokens.
- Calidad de cuantización: solo Q4_K_M tiene comprobaciones funcionales y de rechazo; el resto solo dispone de mediciones KLD, no de evaluación downstream.
- Licencia Apache-2.0: permite uso comercial según los términos de la licencia, pero el carácter de investigación y la ausencia de salvaguardas hacen desaconsejable el uso comercial sin evaluación propia y sin cumplimiento normativo.
- Dependencia de versión: requiere llama.cpp en el commit `4b1a27f` o posterior; versiones anteriores pueden no manejar correctamente los archivos `mmproj-*` y `mtp-*`.
- Configuración sensible: el modo thinking está activado por defecto y el `min_p` por defecto de llama.cpp (0,05) difiere del recomendado (0); no ajustarlo cambia el comportamiento de muestreo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-GGUF
- Modelo base BF16: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Variante FP8 (vLLM/SGLang): https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8
- Variante MLX (Apple Silicon): https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-MLX
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión GGUF de referencia: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Cuantizaciones del base usadas como referencia: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Chat de demostración: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Notas de investigación sobre la abliteración: https://blog.abliterant.ai/rana-refusal-ablation
- Catálogo de formatos: https://huggingface.co/abliterant
