# kigimues/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es un ajuste (finetune) sin censura del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario kigimues en Hugging Face (con un alias en la cuenta dealignai). El modelo base es un MoE multimodal de gran escala (imagen, texto y vídeo) con ventana de contexto de 1 millón de tokens, y esta versión elimina el comportamiento de rechazo mediante una edición a nivel de pesos (abliteración), sin reentrenamiento, sin LoRA y sin modificaciones de plantilla de chat o tokenizador.

La relevancia de esta ficha radica en que se trata de una variante "abliterated" nativa en FP8: los pesos se conservan en la precisión original del fabricante (FP8 e4m3 con escalas de bloque ue8m0 y expertos FP4), de modo que el modelo es compatible byte a byte con el motor de inferencia de referencia de DeepSeek. Con 763.205 millones de parámetros totales (dato real de los safetensors), 40 capas MoE, soporte de tool calling, niveles de esfuerzo de razonamiento (`low`/`high`/`max`) y decodificación especulativa DSpark, se dirige a desarrolladores que necesitan desplegar localmente un modelo grande multimodal sin filtros de alineación, bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 40 capas |
| Parametros totales | 763.205.315.794 (~763 B, dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4 |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, ~510,3 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de DeepSeek-V4.1-Flash-1017: un transformer de mezcla de expertos (MoE) con 40 capas, capacidades de visión y vídeo (pipeline image-text-to-text), ventana de contexto nativa de 1M tokens y soporte de niveles de esfuerzo de razonamiento. El checkpoint conserva además la decodificación especulativa DSpark y el motor de inferencia de referencia (`inference/` y `encoding/`) de DeepSeek sin cambios. La precisión de almacenamiento es FP8 e4m3 con escalas de bloque ue8m0 para los pesos densos y FP4 para los expertos MoE, la misma configuración con la que DeepSeek publica el modelo original.

En cuanto al entrenamiento, esta variante no incorpora ningún entrenamiento nuevo: la model card indica explícitamente que no hay SFT, RLHF ni DPO, y que no se ha alimentado ningún dato nuevo al modelo. La modificación es exclusivamente a nivel de pesos (abliteración, también conocida como "CRACK" en la documentación interna), editando los tensores en FP8 nativo en su granularidad de bloque original para suprimir el comportamiento de rechazo. El tokenizador (`tokenizer.json` y `tokenizer_config.json`) es byte-idéntico al del modelo base. No se dispone de datos públicos sobre el número de tokens ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con tres niveles de esfuerzo de razonamiento seleccionables (`low`, `high`, `max`); la model card recomienda `max_tokens ≥ 256K` para el modo de razonamiento intensivo.
- Comprensión multimodal: entrada de imagen y vídeo (pipeline image-text-to-text).
- Tool calling / function calling, heredado íntegramente del modelo base.
- Ventana de contexto nativa de 1M tokens, adecuada para documentos y sesiones muy largas.
- Soporte multilingüe en siete idiomas: inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Comportamiento sin censura: el modelo cumple las peticiones del usuario en lugar de rechazarlas por categorías de contenido (abliteración a nivel de pesos, sin interruptor de activación/desactivación).

## Casos de uso

- Procesamiento de documentos extensos: con 1M tokens de contexto, puede ingerir libros técnicos completos, expedientes legales o bases de código enteras en una sola pasada y responder preguntas sobre ellos sin RAG.
- Análisis de vídeo e imágenes: dado su pipeline image-text-to-text, puede describir, resumir o responder preguntas sobre contenido visual, útil para moderación interna, indexación de archivos multimedia o generación de metadatos.
- Agentes con tool calling: su soporte de function calling y razonamiento multi-paso lo hace apto para orquestación de herramientas, navegación asistida y flujos de trabajo agénticos de larga duración.
- Investigación en alineación y seguridad: como variante abliterada documentada a nivel de pesos, sirve como sujeto de estudio para analizar el comportamiento de rechazo en modelos grandes y evaluar técnicas de mitigación.
- Generación de código en local: puede integrarse en pipelines de desarrollo para completar, revisar y refactorizar código, aprovechando el contexto de 1M para repositorios completos y el tool calling para integración con CI/CD.
- Despliegue autoalojado sin filtros: organizaciones que ejecutan sus propios servidores de inferencia pueden usarlo como modelo base sin las capas de rechazo del fabricante, aplicando sus propias políticas de contenido aguas abajo.
- Razonamiento intensivo offline: el nivel `max` con hasta 256K tokens de salida permite tareas de resolución de problemas complejos (matemáticas, planificación) en entornos sin conexión a APIs externas.

## Benchmarks y rendimiento

El único dato publicado en la model card es una evaluación interna de capacidad (MMLU en modo logit, 57 asignaturas × 20 preguntas, 1.140 preguntas totales, greedy T=0, ejecutado en 4×H200 con TP4 a través del motor de inferencia de referencia):

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/11... | — (dato truncado en la fuente) |
| Esta variante UNCENSORED (FP8) | no disponible (tabla truncada) | no disponible |

Nota: la model card disponible está truncada y no incluye la fila de resultados de la variante abliterada ni el resto de benchmarks. No se han publicado resultados completos de benchmarks (HumanEval, GSM8K, etc.) en la información disponible, por lo que no se pueden citar más cifras sin inventar datos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 510,3 GB en FP8/FP4; a efectos prácticos se necesita al menos ~512 GB de VRAM (o memoria unificada equivalente) para cargar el modelo completo, sin contar la KV cache del contexto de 1M tokens.
- GPU recomendadas: la propia model card evalúa el modelo en 4× NVIDIA H200 (tensor parallelism 4). Alternativas razonables son 8× H100 80 GB o nodos multi-GPU de gama datacenter (A100 80 GB en configuraciones de 8 u más unidades, con advertencias de rendimiento por no ser nativo FP8).
- Consumer GPUs: no cabe en ninguna GPU de consumo actual (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB están muy lejos del requisito de ~510 GB). El despliegue exige hardware de datacenter o CPU + offload con tiempos de inferencia impracticables.
- Despliegue: el checkpoint es drop-in con el motor de inferencia de referencia de DeepSeek (`inference/`), compatible con la librería `transformers` de Hugging Face. La model card no menciona soporte explícito de vLLM, TGI, llama.cpp u Ollama; dado que los pesos son FP8 nativo con expertos FP4, la conversión a GGUF u otros formatos no es trivial y la propia card advierte de que cuantizar este checkpoint directamente degrada la calidad.
- Latencia y throughput: no disponible. La model card solo indica la configuración de evaluación (4×H200, TP4) y el muestreo recomendado (`temperature=1.0`, `top_p=1.0`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | ~763 B (MoE) | 1M | Imagen + vídeo | MIT | Abliterado, FP8 nativo + expertos FP4 |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | ~763 B (MoE) | 1M | Imagen + vídeo | no disponible | Comportamiento de rechazo intacto; misma precisión FP8/FP4 |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | ~763 B (MoE) | 1M | Imagen + vídeo | no disponible | Variante abliterada reconstruida a 2,9 bpw en EXL3, pensada para VRAM reducida |

Nota: los datos de parámetros, contexto y modalidades de las alternativas se infieren de la propia model card (que describe el modelo base y su variante EXL3 como equivalentes funcionales). No hay datos de benchmarks comparativos completos disponibles.

## Limitaciones y advertencias

- Sin salvaguardas de contenido: al ser una variante abliterada, el modelo no rechaza peticiones por categorías de contenido. Desplegarlo en producción sin filtros adicionales aguas abajo conlleva riesgos legales y de reputación significativos; el acceso al repositorio está además sujeto a un formulario gated que exige confirmar mayoría de edad y aceptación de responsabilidad.
- Riesgo de alucinación: no disponible como dato medido, pero al tratarse de un modelo generativo de 763 B sin filtros, el riesgo de alucinaciones es inherente y la ausencia de rechazo puede amplificar la generación de contenido falso o perjudicial con apariencia de confianza.
- Degradación por cuantización derivada: la model card advierte de que cuantizar este checkpoint FP8 a precisiones bajas acumula error de cuantización sobre la edición de abliteración, pudiendo regresar parcialmente el comportamiento de rechazo. Para versiones en baja precisión hay que repetir el pipeline de abliteración sobre la precisión objetivo.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna auditoría de sesgos para esta variante.
- Idiomas: soporte declarado para siete idiomas; el rendimiento en español no está evaluado públicamente y puede ser inferior al del inglés y el chino.
- Muestreo no convencional: la configuración recomendada (`temperature=1.0`, `top_p=1.0`) difiere de las prácticas habituales; desviarse de ella puede afectar a la calidad de salida, especialmente en modo de razonamiento intensivo.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base procede de DeepSeek y la model card solicita (sin exigir) atribución al construir sobre este trabajo.
- Requisitos de infraestructura: con ~510 GB de pesos, el coste de despliegue es elevado y limita el uso a organizaciones con hardware de datacenter; el contexto de 1M tokens exige además gestión cuidadosa de la KV cache.
- Descargas: el repositorio registra 0 descargas en el momento de redactar la ficha, por lo que no existe histórico comunitario de problemas o validaciones de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kigimues/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del repositorio (abliterated, cuenta dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw uncensored (referenciada en la model card): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del editor (@dealignai): https://twitter.com/dealignai
- Twitter del proveedor de cómputo (@jordanschenck): https://twitter.com/jordanschenck
- Paper, demo y blog oficial: no disponibles en la información proporcionada.
