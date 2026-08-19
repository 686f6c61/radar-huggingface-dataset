# JonathanColetti/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una variante del modelo Qwen3.8-27B de Alibaba, desarrollada por JonathanColetti, que reduce sustancialmente el comportamiento de rechazo (refusal) del modelo original mediante una técnica de ablación de direcciones (abliteration) usando la herramienta Heretic. El objetivo es ofrecer un modelo que responda a peticiones que el modelo base rechazaría, manteniendo el resto de capacidades intactas. Está pensado para desarrolladores e investigadores que necesitan un modelo menos restrictivo en entornos controlados.

El modelo mantiene la arquitectura original (Qwen3_5ForConditionalGeneration) con 27.356 millones de parámetros, contexto de 262.144 tokens, capacidades multimodales (visión y texto) y un cabezal de predicción multi-token (MTP) para decodificación especulativa. La intervención se limita a modificar los pesos de `attn.o_proj` y `mlp.down_proj` en 64 módulos, sin fine-tuning ni datos adicionales. Los tensores MTP se copian íntegros del checkpoint base.

La relevancia de este modelo radica en que demuestra que es posible reducir drásticamente el rechazo (de 98/100 a 12/100 en un conjunto de prompts dañinos) con una pérdida mínima de capacidades generales (delta medio de -0,5 puntos en benchmarks de conocimiento y razonamiento). Sin embargo, la reducción no es total y el modelo conserva parte del comportamiento de seguridad, por lo que no es un modelo "sin censura" en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con visión y MTP) |
| Parametros totales | 27.356.728.560 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256 K) |
| Tipos de cuantizacion | bf16 (safetensors); GGUF con imatrix en repo separado (tipos no especificados) |
| Idiomas soportados | Inglés y chino (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.8-27B, una arquitectura transformer multimodal (image-text-to-text) con 64 capas, vocabulario de 248.320 tokens y un módulo de predicción multi-token (MTP) de 1 capa que permite decodificación especulativa. La intervención de abliteration se realiza con la herramienta Heretic, que co-minimiza el recuento de rechazos y la divergencia KL con respecto al modelo base. No se utiliza fine-tuning ni datos de entrenamiento adicionales.

El proceso de ablación se ejecuta en precisión bf16 (sin cuantización) y modifica únicamente los tensores `attn.o_proj` y `mlp.down_proj` de los 64 bloques. Tras la fusión de la LoRA resultante, los tensores `mtp.*` se copian verbatim del checkpoint base, ya que la re-serialización a través de transformers no conserva el módulo MTP. Se realizaron 200 trials de optimización, obteniendo un frente de Pareto de 23 puntos; el checkpoint publicado es el de menor recuento de rechazos (12/100) con una divergencia KL de 0,1191.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento multi-paso con modo "thinking" activado por defecto en la plantilla de chat (se puede desactivar con `enable_thinking=False`).
- Comprensión multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imágenes.
- Decodificación especulativa: el cabezal MTP de 1 capa permite acelerar la generación mediante predicción multi-token (verificado que los tensores están presentes).
- Reducción de rechazos: responde a 88 de cada 100 prompts dañinos de un conjunto de prueba (frente a 2 del base), aunque conserva rechazo en el 12 % restante.
- Multilingüe: soporta inglés y chino (según la model card).
- Compatibilidad con transformers: se integra con `AutoModelForImageTextToText` y `AutoProcessor`.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comportan los modelos cuando se reduce su capa de rechazo, analizando los límites de la alineación y los efectos de la abliteration en el rendimiento.
- Generación creativa sin restricciones: escribir ficción, guiones o contenido que el modelo base rechazaría por temas controvertidos (violencia, sexo, etc.), siempre dentro de un marco legal y ético.
- Evaluación de sistemas de moderación: utilizar el modelo como "adversario" para probar clasificadores de contenido dañino, ya que genera respuestas que un modelo alineado normalmente bloquearía.
- Desarrollo de asistentes especializados en dominios sensibles: por ejemplo, educación sexual, asesoramiento sobre drogas (con fines preventivos) o discusión de temas políticos controvertidos, donde el exceso de rechazo limita la utilidad.
- Benchmarking de técnicas de ablación: comparar el comportamiento de este checkpoint con otros puntos del frente de Pareto para entender el trade-off entre reducción de rechazos y divergencia KL.
- Aplicaciones multimodales con menos restricciones: análisis de imágenes donde el modelo base podría negarse a comentar contenido explícito o sensible, pero el usuario necesita una respuesta técnica.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación 0-shot con `lm-evaluation-harness` en bf16, comparando el modelo con el base sin modificar en la misma sesión:

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| Media | | | -0,5 |

Los deltas están dentro o cerca del error estándar reportado (MMLU ±0,30, ARC ±1,44, HellaSwag ±0,38, Winogrande ±1,21), por lo que no son estadísticamente significativos. No se han publicado resultados de benchmarks generativos (GSM8K, HumanEval), ni evaluaciones de la torre de visión o del MTP.

Comportamiento de rechazo (100 prompts dañinos de `mlabonne/harmful_behaviors`):

| Medición | Modelo base | Este modelo |
|---|---|---|
| Rechazos | 98/100 | 12/100 |
| KL divergencia vs base (primer token) | 0 | 0,1191 |

## Requisitos de hardware

- Inferencia en bf16: se necesitan aproximadamente 55 GB de VRAM (según la model card), por lo que se requiere una GPU de gama alta como A100 80 GB, H100, o varias GPUs consumer en paralelo.
- No se especifican requisitos para las cuantizaciones GGUF, pero al estar disponibles en un repo separado con imatrix, es probable que se puedan ejecutar en GPUs consumer con 24 GB o menos, dependiendo del nivel de cuantización (no se detallan los tipos).
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM y TGI son compatibles con modelos de la familia Qwen; llama.cpp puede usar los GGUF.
- Latencia y throughput: no se han publicado mediciones. El MTP podría acelerar la decodificación, pero no hay datos cuantitativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals (harmful) | MMLU (0-shot) |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262 K | Apache 2.0 | 98/100 | 83,4 |
| Qwen3.8-27B-Uncensored (este) | 27,3 B | 262 K | Apache 2.0 | 12/100 | 83,3 |

No se dispone de datos de otros modelos abliterated comparables en el mismo rango de parámetros para una comparativa más amplia.

## Limitaciones y advertencias

- La reducción de rechazos no es total: el modelo aún rechaza 12 de cada 100 prompts dañinos, por lo que no es un modelo "sin censura" en sentido estricto.
- El modelo puede generar contenido dañino, ilegal o poco ético si se le solicita. Su uso en producción requiere salvaguardas externas (filtros, moderación humana) y cumplimiento legal.
- Las evaluaciones publicadas son solo 0-shot y no cubren tareas generativas (matemáticas, código), visión ni el rendimiento del MTP. La ausencia de estas métricas no garantiza que no haya degradación en esos dominios.
- La divergencia KL de 0,1191 indica que la distribución de primer token difiere del base, lo que podría afectar a la coherencia en contextos largos o a la calidad del razonamiento.
- El modelo solo declara soporte para inglés y chino; otros idiomas pueden funcionar peor.
- No se han realizado pruebas de sesgos (género, raza, religión) ni de alucinación. La reducción de rechazos podría aumentar la confianza en respuestas incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir los riesgos legales y éticos asociados al contenido generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Repositorio GGUF: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Demo Space: https://huggingface.co/spaces/JonathanColetti/Qwen3.8-27B-Uncensored-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
