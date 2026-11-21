# kanippa/llm2026-g6-ctrl-legacy-qwen35-08b

## Resumen

El modelo `kanippa/llm2026-g6-ctrl-legacy-qwen35-08b` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario kanippa. Se trata de una adaptación mediante LoRA continuada durante una época y 62 actualizaciones, posteriormente fusionada en FP32 sobre la estructura original FP16 del modelo base. El resultado es un modelo de generación de texto conversacional especializado en japonés, orientado a tareas de respuesta a preguntas sobre dominios específicos (noticias, enciclopedias y datos de la Biblioteca Nacional de Japón).

La relevancia de este modelo es limitada y muy específica: se enmarca en un experimento de adaptación controlada (variante `CTRL_LEGACY`, ciclo G6 + C12) sobre un modelo pequeño de menos de mil millones de parámetros. No se trata de un modelo de propósito general ni de un lanzamiento con benchmarks públicos, sino de un artefacto de investigación con fines de evaluación interna. Su utilidad principal radica en servir como punto de comparación en estudios de ajuste fino sobre arquitecturas Qwen3.5 en el dominio del japonés.

El modelo conserva la arquitectura y el tamaño del base (852.985.920 parámetros reales según los safetensors), por lo que hereda las capacidades y limitaciones de un modelo de 0,8B. La información pública disponible es muy escasa: no hay datos de benchmarks, no se detalla la composición exacta del dataset más allá de las fuentes, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5ForConditionalGeneration), sin cambios arquitectónicos respecto al base |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor menciona FP16 y FP32 en el proceso de fusión) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica una adaptación LoRA continuada de una época con 62 actualizaciones. Los datos de entrenamiento provienen del conjunto `train_G6` del ciclo 3, compuesto por 496 filas encadenadas y 496 no encadenadas, construidas estrictamente a partir de los conjuntos JSQuAD train, JEMHopQA train, JaQuAD train, NIILC dev y preguntas-respuesta encadenadas de 2 saltos generadas de forma determinista. Los conjuntos de evaluación, mock y producción quedaron estrictamente excluidos del entrenamiento.

La fusión se realizó en FP32 sobre la estructura FP16 original del modelo base, sin modificaciones arquitectónicas (el autor indica "zero architectural changes"). No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El hash SHA256 de los pesos fusionados es `322f4f8f0a0ebc695eb7e3f6f1cb6a6573b5ef63e7f2965609fd29f2d0c4466a`. No se especifica el número total de tokens de entrenamiento ni la composición porcentual del dataset.

## Capacidades

- Generación de texto conversacional en japonés.
- Respuesta a preguntas extractivas y de múltiples saltos (2-hop) sobre dominios como noticias (JSQuAD), enciclopedias (JEMHopQA), comprensión lectora (JaQuAD) y datos de la NIILC.
- Razonamiento encadenado simple (chained QA) según el formato de los datos de entrenamiento.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B en generación de texto, aunque no se documentan explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al japonés según la model card, aunque el modelo base podría conservar cierta competencia en otros idiomas no documentada.

## Casos de uso

- Evaluación de ajuste fino en japonés: el modelo sirve como artefacto de comparación en experimentos académicos sobre adaptación LoRA de modelos pequeños en dominios específicos, permitiendo medir el efecto de 62 actualizaciones sobre el base.
- Respuesta a preguntas sobre noticias japonesas: puede utilizarse para probar la capacidad de un modelo de 0,8B de extraer respuestas de pasajes de JSQuAD, útil en prototipos de sistemas de QA documental.
- QA encadenada de 2 saltos: adecuado para validar pipelines de razonamiento multi-hop en entornos de investigación donde el coste computacional debe ser mínimo.
- Comprensión lectora en japonés: puede integrarse en experimentos de evaluación de modelos pequeños sobre JaQuAD para medir la degradación respecto a modelos mayores.
- Prototipado de bajo coste: al tener menos de mil millones de parámetros, puede ejecutarse en hardware modesto para pruebas de concepto de asistentes conversacionales en japonés antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: el hash SHA256 publicado y la descripción del proceso de fusión permiten reproducir o auditar el resultado en estudios de adaptación controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16 (tamaño del repo de safetensors), y alrededor de 0,5-0,9 GB en cuantizaciones de 4-8 bits, aunque no se confirman cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; una NVIDIA L4 (mencionada por el autor en el proceso de entrenamiento) es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida, dado el reducido tamaño.
- Opciones de despliegue: al ser un modelo safetensors de arquitectura Qwen3.5, es compatible con frameworks estándar como transformers, vLLM, TGI o llama.cpp (previa conversión a GGUF), aunque no se documenta compatibilidad explícita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kanippa/llm2026-g6-ctrl-legacy-qwen35-08b | 852.985.920 | No disponible | ja | Apache 2.0 | Ajuste LoRA específico para QA en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Multilingüe | Apache 2.0 | Modelo base sin ajuste específico |
| Otros ajustes de Qwen3.5-0.8B | ~0,8B | No disponible | Variable | Variable | No se dispone de comparativas públicas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en japonés y en las tareas específicas de su dataset de entrenamiento; su rendimiento fuera de ese dominio es incierto.
- Riesgo de alucinación inherente a modelos pequeños (0,8B) y a la falta de datos de alineación documentados.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad objetiva frente al base u otros modelos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B también debe cumplir su propia licencia; se recomienda verificar los términos del base.
- El modelo tiene cero descargas y cero interacciones, lo que sugiere que no ha sido validado por la comunidad.
- La model card no documenta sesgos conocidos, pero al entrenarse sobre datos japoneses específicos puede heredar sesgos de esas fuentes.
- No se documenta soporte de tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que requieran estas funciones sin validación previa.
- El proceso de fusión en FP32 sobre FP16 puede introducir diferencias numéricas menores respecto al base; el hash publicado permite verificar la integridad.

## Enlaces

- Hugging Face: https://huggingface.co/kanippa/llm2026-g6-ctrl-legacy-qwen35-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
