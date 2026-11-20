# mradermacher/nullabby1.5-uncensored-i1-GGUF

## Resumen

nullabby1.5-uncensored-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo nullabby1.5-uncensored, publicada por el usuario mradermacher. El modelo base, alojado en el repositorio nulliaukamk/nullabby1.5-uncensored, no dispone de model card pública con información sobre su entrenamiento, origen o licencia en la información proporcionada. El paquete incluye cuantizaciones generadas con el método imatrix (importance matrix), lo que suele traducirse en una mejor preservación de la calidad en niveles de compresión agresivos respecto a cuantizaciones estándar.

El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio, aptos para inferencia en GPUs de consumo con cuantizaciones de 4 bits. El repositorio ocupa 17,8 GB e incluye un amplio abanico de cuantizaciones que van desde IQ1_S hasta Q6_K, cubriendo tanto escenarios de máxima compresión como de alta fidelidad.

La relevancia de esta ficha radica en que permite evaluar rápidamente la disponibilidad de pesos cuantizados para despliegue local. No obstante, la ausencia de información sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks, licencia) limita significativamente cualquier evaluación rigurosa de sus capacidades. El tag "uncensored" sugiere que el modelo ha sido ajustado para reducir rechazos en la generación de contenido, pero no se dispone de documentación que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base nullabby1.5-uncensored en la documentación proporcionada. El único dato técnico verificable es el número de parámetros totales (8.953.803.264), obtenido del archivo safetensors del modelo original. No se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni se detallan la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, la model card del repositorio indica que se han generado cuantizaciones "weighted/imatrix", es decir, utilizando una matriz de importancia para ponderar los tensores durante la compresión. El repositorio incluye metadatos que confirman `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversión desde pesos Hugging Face a GGUF mediante la herramienta de cuantización de llama.cpp. El tag "nicoboss" aparece en los metadatos, posiblemente en referencia a la herramienta o al autor de la receta de cuantización. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas.
- Modo "uncensored": el nombre del modelo base indica un ajuste orientado a reducir rechazos, pero no hay documentación que cuantifique o describa este comportamiento.
- Capacidades de razonamiento, código, matemáticas o visión: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo de ~8,95 mil millones de parámetros en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, adecuado para prototipado y experimentación sin conexión.
- Experimentación con modelos sin censura en entornos controlados: el tag "uncensored" hace que el modelo sea candidato para investigación sobre comportamiento de modelos sin alineación restrictiva, siempre que se respeten las políticas de uso aplicables.
- Integración en pipelines de generación de texto conversacional: el tag "conversational" y el formato GGUF permiten su uso como backend en aplicaciones de chat locales mediante servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" así lo indica).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite estudiar el impacto de la compresión (desde IQ1_S hasta Q6_K) en la calidad de salida para un modelo de ~9B parámetros.
- Pruebas de despliegue en CPU: las cuantizaciones de menor tamaño (Q2_K, IQ2_XXS, IQ1_S) posibilitan inferencia en CPU con RAM moderada, útil para entornos sin GPU.
- Investigación sobre cuantización imatrix: el conjunto de cuantizaciones ponderadas sirve como material de estudio para comparar la fidelidad de distintos niveles de compresión con y sin matriz de importancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~8,95B parámetros):
  - Q6_K: ~7,3 GB de pesos, ~8-9 GB de VRAM con overhead de contexto.
  - Q5_K_M: ~6,3 GB de pesos, ~7-8 GB de VRAM.
  - Q4_K_M: ~5,4 GB de pesos, ~6-7 GB de VRAM.
  - IQ4_XS: ~4,9 GB de pesos, ~6 GB de VRAM.
  - Q3_K_M: ~4,3 GB de pesos, ~5-6 GB de VRAM.
  - IQ2_XXS / IQ1_S: ~2,5-3,5 GB de pesos, viables en GPU de 4-6 GB o en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas con contexto largo; A100/H100 no son necesarias para este tamaño, aunque permitirían mayor throughput.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (con cuantizaciones IQ2/IQ3) hasta una RTX 4090 (con Q6_K y contexto amplio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (según el tag "endpoints_compatible"), y cualquier runtime que soporte GGUF.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nullabby1.5-uncensored-i1-GGUF | ~8,95B | no disponible | no disponible | GGUF (24 cuantizaciones) | Hugging Face |
| Alternativas de ~8-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el modelo base ni sobre modelos comparables en la documentación proporcionada para establecer una comparativa rigurosa. Se indica "no disponible" en lugar de especular con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base: no se puede verificar arquitectura, datos de entrenamiento, licencia ni idiomas soportados, lo que impide un uso en producción con garantías.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni documentación, no se puede acotar su magnitud.
- Sesgos conocidos: no documentados; el ajuste "uncensored" puede aumentar la probabilidad de generar contenido sesgado, ofensivo o inapropiado.
- Limitaciones de contexto e idioma: desconocidas; no se especifica la ventana de contexto ni los idiomas cubiertos.
- Procedencia del modelo base poco clara: el repositorio nulliaukamk/nullabby1.5-uncensored no ofrece información verificable sobre su origen, lo que supone un riesgo de seguridad y de cumplimiento.
- Cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS): pueden degradar notablemente la coherencia y la calidad de las respuestas; no recomendadas para uso serio.
- Advertencia para producción: sin benchmarks, licencia ni documentación, este modelo no debería desplegarse en entornos productivos o comerciales sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/nullabby1.5-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored
- Herramienta de cuantización llama.cpp: no disponible en la información proporcionada
- Paper, blog o demo: no disponible
