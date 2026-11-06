# mradermacher/Rabt-1.0-2B-i1-GGUF

## Resumen

Rabt-1.0-2B-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Rabt-1.0-2B, generadas por mradermacher mediante la herramienta de cuantización i1 (imatrix). El modelo base, publicado por el usuario 4waiz en Hugging Face, se presenta nominalmente como un modelo de 2B parámetros, aunque los datos reales de safetensors del repositorio indican 960.882 parámetros totales, una discrepancia que conviene verificar antes de cualquier uso en producción. El repositorio de cuantizaciones no incluye model card descriptiva más allá de los metadatos de generación.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado (cuantizaciones de un modelo base del que no se dispone de documentación técnica) y no de un modelo original con paper, benchmarks o especificaciones publicadas. La información disponible se reduce a los tags de cuantización y a la referencia al modelo base. No hay datos sobre arquitectura, datos de entrenamiento, licencia ni idiomas soportados.

Por tanto, esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada. Se recomienda precaución: el número de parámetros declarado en el nombre (2B) no coincide con el recuento real de safetensors (960.882), lo que sugiere que el modelo base podría estar mal etiquetado o que el recuento corresponde a otro artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 960.882 (según safetensors del repo); el nombre indica 2B, discrepancia no resuelta |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Rabt-1.0-2B: no consta si es un transformer denso, un modelo MoE, híbrido o basado en SSM. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Lo único verificable es el proceso de cuantización: mradermacher ha generado las cuantizaciones con la herramienta i1, que emplea una matriz de importancia (imatrix) para ponderar los pesos durante la cuantización y reducir la pérdida de calidad en comparación con la cuantización estándar. Los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión se realizó desde pesos en formato Hugging Face. No se documenta ninguna innovación arquitectónica adicional.

## Capacidades

- No se han documentado capacidades específicas del modelo base en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta capacidad multilingüe declarada.
- No consta modo thinking, visión, audio ni otras capacidades especiales.
- Al ser un modelo de menos de 1.000 millones de parámetros según el recuento real, su capacidad de razonamiento complejo y generación de código en producción sería presumiblemente limitada, aunque esto no puede confirmarse sin benchmarks.

## Casos de uso

- Experimentación local en hardware de consumo: las cuantizaciones Q4_0, Q4_1 y Q2_K permiten ejecutar el modelo en CPU o GPU modesta mediante llama.cpp u Ollama, útil para pruebas de integración de pipelines GGUF.
- Evaluación de la cadena de cuantización i1: sirve como caso de estudio para comparar la degradación de calidad entre cuantizaciones IQ1, IQ2, Q3, Q4, Q5 y Q6 sobre un mismo modelo base.
- Pruebas de formato GGUF en herramientas: validar la compatibilidad de llama.cpp, Ollama, LM Studio o text-generation-webui con cuantizaciones i1 de un modelo poco documentado.
- Prototipado de bajo coste: si el modelo base resulta funcional, podría emplearse para tareas simples de generación de texto en entornos con recursos muy limitados, aunque sin garantías de calidad.
- Investigación sobre modelos no documentados: analizar la discrepancia entre el nombre (2B) y el recuento real de parámetros (960.882) como caso de estudio de etiquetado incorrecto en Hugging Face.
- Despliegue en entornos air-gapped: al ser un repo GGUF autocontenido, puede copiarse a máquinas sin conexión para pruebas de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, dado que el recuento real de parámetros (960.882) no concuerda con el nombre (2B). Si el modelo tuviera realmente 2B parámetros, las cuantizaciones Q4_K_M ocuparían aproximadamente 1,2-1,4 GB y Q8 alrededor de 2,1 GB; si el recuento real es correcto, el modelo sería órdenes de magnitud menor.
- GPU recomendadas: no disponible. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) podría ejecutar cuantizaciones Q4 de un modelo de 2B, pero no puede confirmarse sin conocer el tamaño real.
- Cabe en GPU consumer: presumiblemente sí para cuantizaciones Q4-Q6 si el modelo es de 2B; no confirmable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados, dado que el modelo base carece de especificaciones publicadas y el recuento de parámetros es inconsistente.

## Limitaciones y advertencias

- Discrepancia crítica de parámetros: el nombre indica 2B pero safetensors reporta 960.882 parámetros totales; no puede asumirse ninguna especificación del modelo base sin verificación.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido; consultar el repo del modelo base (4waiz/Rabt-1.0-2B) antes de cualquier uso en producción.
- Idiomas no declarados: no puede garantizarse el soporte de castellano ni de ningún otro idioma.
- Sin benchmarks ni model card descriptiva: no hay evidencia de calidad, por lo que no debería usarse en producción sin evaluación propia.
- Riesgo de alucinación: no evaluado; en modelos pequeños sin alineación documentada el riesgo suele ser elevado.
- Sesgos: no documentados.
- Repositorio sin descargas ni likes: no hay señal de validación por parte de la comunidad.
- Las cuantizaciones IQ1 e IQ2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior si el modelo base es funcional.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Rabt-1.0-2B-i1-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-2B
