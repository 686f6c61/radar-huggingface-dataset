# CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill-Fixed

## Resumen

GLM-4.7-Flash-Fable-5-Distill-Fixed es un ajuste fino (fine-tuning) del modelo base unsloth/GLM-4.7-Flash, publicado por el usuario CreitinGameplays en Hugging Face. Se trata de un modelo de generación de texto de 31.221.488.576 parámetros (aproximadamente 31,2 mil millones) con arquitectura glm4_moe_lite, es decir, un transformer con mezcla de expertos (MoE) en su variante ligera. El modelo se distribuye bajo licencia Apache 2.0 y está orientado principalmente al inglés.

El objetivo declarado del ajuste es mejorar el comportamiento en llamadas a herramientas (tool calls) y destilar trazas de conversación procedentes de los datasets TeichAI/Fable-5-Cursor-Traces y armand0e/Fable-5-Chat. La model card es extremadamente escueta: solo indica los parámetros de muestreo recomendados (top_k 40, temperature 0.6, top_p 0.95) y afirma que este checkpoint "debería hacer tool calls correctamente". No se documentan detalles sobre el proceso de entrenamiento, la composición de los datos ni evaluaciones.

Es relevante ahora porque parte de un modelo base reciente de la familia GLM en su variante Flash, y porque ejemplifica el ecosistema de destilaciones comunitarias sobre modelos MoE abiertos para especializarlos en agentes y uso de herramientas. No obstante, la falta de documentación y la ausencia de benchmarks publicados limitan seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm4_moe_lite (transformer con mezcla de expertos, variante ligera) |
| Parametros totales | 31.221.488.576 (~31,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se asume compatibilidad con cuantizaciones estándar vía herramientas como bitsandbytes o GGUF, pero no se documenta) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base unsloth/GLM-4.7-Flash, etiquetada como glm4_moe_lite: un transformer con capas de mezcla de expertos en configuración ligera. El número total de parámetros asciende a 31,2 mil millones, aunque no se especifica cuántos están activos por token ni el número de expertos. Tampoco se documenta la longitud de contexto nativa del base ni si el ajuste la modifica.

En cuanto al entrenamiento, la model card solo indica que se ha realizado un ajuste fino supervisado (o destilación) sobre dos datasets: TeichAI/Fable-5-Cursor-Traces y armand0e/Fable-5-Chat. No se detalla el número de tokens, la composición exacta del dataset, la existencia de RLHF/DPO, ni hiperparámetros de entrenamiento. La única innovación declarada es la corrección del comportamiento de tool calling respecto a checkpoints anteriores del mismo autor. No hay información sobre técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Llamadas a herramientas (tool calling / function calling), que el autor presenta como el principal objetivo del ajuste.
- Uso en pipelines de text-generation-inference y transformers, con compatibilidad declarada con endpoints.
- Capacidad de razonamiento y código: no documentada explícitamente, aunque presumiblemente heredada del base GLM-4.7-Flash; no hay confirmación en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código con herramientas: el modelo puede integrarse en entornos tipo Cursor o IDE para invocar funciones de edición de archivos y ejecución de comandos, dado que el ajuste se entrenó con trazas de Cursor (TeichAI/Fable-5-Cursor-Traces) y declara soporte de tool calls.
- Agentes conversacionales multi-turno: adecuado para diálogos encadenados en inglés donde el modelo deba decidir cuándo llamar a una API externa, gracias a la destilación sobre conversaciones de Fable-5-Chat.
- Automatización de tareas con function calling: integración en flujos donde el modelo reciba un esquema de herramientas y genere llamadas estructuradas, por ejemplo en asistentes de soporte que consultan bases de datos.
- Prototipado de agentes con text-generation-inference: al estar etiquetado con text-generation-inference y endpoints_compatible, puede desplegarse rápidamente en un endpoint TGI para experimentar con agentes.
- Investigación sobre destilación de trazas: útil como caso de estudio de cómo un ajuste comunitario sobre un MoE abierto especializa el comportamiento de tool calling, aunque sin métricas publicadas.
- Fine-tuning posterior: al ser Apache 2.0 y estar en safetensors, sirve como punto de partida para ajustes adicionales en inglés con transformers y Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,2 mil millones de parámetros en safetensors (62,5 GB de repo), en FP16 requiere aproximadamente 62 GB de VRAM; en cuantización de 8 bits, unos 31 GB; en 4 bits, unos 16-18 GB. Estas cifras son estimaciones basadas en el tamaño, no datos publicados.
- GPU recomendadas: para FP16, A100 80 GB o H100 80 GB; para 8 bits, A100 40 GB; para 4 bits, RTX 4090 (24 GB) o A6000 (48 GB).
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en RTX 4090 o GPUs con 24 GB o más; en FP16 no cabe en GPUs de consumo.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y Unsloth, según las etiquetas del repo; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-4.7-Flash-Fable-5-Distill-Fixed | ~31,2 B (MoE lite) | no disponible | Apache 2.0 | Ajuste comunitario para tool calling; sin benchmarks |
| unsloth/GLM-4.7-Flash (base) | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos en la información |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda |

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla entrenamiento, datos ni evaluación, lo que impide validar las afirmaciones sobre tool calling.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al base ni frente a alternativas.
- Idioma: solo inglés etiquetado; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos y no mitigado de forma documentada.
- Sesgos: no documentados; al derivar de un ajuste sobre trazas de conversación, puede heredar sesgos de esos datasets.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repo con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad y procedencia del checkpoint antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill-Fixed
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/Fable-5-Cursor-Traces
- Dataset de entrenamiento: https://huggingface.co/datasets/armand0e/Fable-5-Chat
