# sahilchachra/orcarouter-Qwen3.8-27B-Uncensored-MXFP8

## Resumen

orcarouter-Qwen3.8-27B-Uncensored-MXFP8 es una cuantización MXFP8 en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, un fine-tuning abliterado (uncensored) de Qwen3.8-27B de Alibaba. El modelo base es un vision-language-model de 27 000 millones de parámetros con arquitectura híbrida: un backbone de texto que combina atención lineal GatedDeltaNet con atención completa (64 capas, atención completa cada 4 capas) y una torre de visión Qwen3-VL. Esta cuantización, creada por sahilchachra, convierte únicamente el backbone de texto a MXFP8 (8,381 bits por peso), manteniendo la torre de visión en bf16, lo que permite ejecutar el modelo en Apple Silicon mediante mlx-vlm.

El modelo resuelve el problema de ejecutar un modelo de visión-lenguaje de 27B sin filtros de rechazo en hardware de Apple Silicon con una fidelidad mayor que la variante MXFP4 del mismo autor (27 GB frente a 14 GB en disco). Al ser una variante abliterada, no rechaza peticiones que el modelo original sí rechazaría, lo que lo hace relevante para tareas de red-teaming, investigación de alineación y evaluación de riesgos en IA. La licencia Apache-2.0 permite uso comercial, aunque la naturaleza uncensored obliga a un uso responsable y conforme a la legislación local.

El modelo hereda las capacidades del base: razonamiento con canal de pensamiento (thinking channel), tool calling, comprensión de imágenes y contexto largo (las fuentes citan 262K tokens en Ollama y 64K en la API de OrcaRouter, sin que la model card de esta cuantización lo especifique). La cabeza de multi-token-prediction (MTP) se descarta en esta cuantización, por lo que no hay decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (qwen3_5): backbone de texto híbrido GatedDeltaNet (atención lineal) + atención completa (64 capas, full attention cada 4ª capa) + torre de visión Qwen3-VL |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma consistente: la ficha de Ollama del modelo base indica 262 000 tokens; la página de API de OrcaRouter indica 64 536 posiciones (64K) |
| Tipos de cuantizacion | MXFP8 (E4M3 + E8M0, escala compartida, grupo de 32), 8,381 bpw; también existe variante MXFP4 (4,449 bpw, 14 GB) |
| Idiomas soportados | Inglés y chino (según la model card del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors con metadatos `format: mlx`, 26 shards, 27 GB en disco) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27B parámetros con arquitectura híbrida: el backbone de texto combina capas de atención lineal GatedDeltaNet con capas de atención completa, distribuidas en 64 capas donde cada 4ª capa usa full attention. El tamaño oculto es de 5120. La torre de visión es la de Qwen3-VL y se mantiene íntegramente en bf16 en esta cuantización; solo el backbone de texto se cuantiza a MXFP8 (incluido el lm_head de ~1,27B parámetros, ya que `tie_word_embeddings=false`).

El modelo base orcarouter/Qwen3.8-27B-Uncensored es un fine-tuning abliterado a nivel de tensor de Qwen3.8-27B: se eliminan los pesos asociados al rechazo de peticiones, manteniendo intactas la torre de visión y la cabeza de multi-token-prediction (MTP). En esta cuantización MLX, la cabeza MTP se descarta (mlx-vlm elimina los pesos `mtp.*`), por lo que no hay decodificación especulativa. No se especifican en las fuentes el número de tokens de entrenamiento ni la composición del dataset del fine-tuning.

La cuantización MXFP8 usa el formato E4M3 con una escala compartida E8M0 por grupo de 32 elementos, logrando 8,381 bits por peso. El autor verificó la integridad estructural (formas de tensor, metadatos, índice de shards) pero no ejecutó una generación completa en la máquina de prueba de 24 GB por superar la RAM; la variante MXFP4 del mismo modelo sí pasó pruebas de humo de texto y visión de extremo a extremo.

## Capacidades

- Generación de texto y razonamiento con canal de pensamiento visible (`thinking`) antes de la respuesta final; es un modelo de razonamiento.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión Qwen3-VL, que se mantiene en bf16 y no se cuantiza.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas y ejecución de agentes multi-paso.
- Razonamiento multi-step con modo de pensamiento.
- Multilingüe: inglés y chino (según la model card del modelo base).
- No rechazo de peticiones: al ser una variante abliterada, no aplica los filtros de seguridad del modelo original.
- Contexto largo: 262K tokens según la ficha de Ollama (o 64K según la API de OrcaRouter; discrepancia no resuelta en esta cuantización).
- Compatible con MLX (mlx-vlm >= 0.6.12) y LM Studio 0.4.20 con runtime mlx-llm.

## Casos de uso

- **Red-teaming de modelos de IA**: el modelo puede generar inputs adversarios en dominios sensibles que otros modelos rechazarían, lo que permite evaluar la robustez de sistemas de moderación y seguridad en producción.
- **Investigación de alineación**: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparándolo con el modelo original para cuantificar el impacto del ablitering en la calidad y la seguridad de las respuestas.
- **Auditoría de sesgos**: al no rechazar peticiones, se pueden extraer de forma más completa los sesgos y estereotipos que reproduce el modelo base, útil para auditorías de sesgo en contextos de investigación.
- **Generación de contenido creativo sin restricciones**: para prototipos de ficción, guiones o narrativas en dominios donde los modelos con filtros se niegan a responder (violencia ficcional, temas tabú, etc.), siempre con cumplimiento de la legislación local.
- **Análisis de imágenes en Apple Silicon**: al conservar la torre de visión en bf16, el modelo puede responder preguntas sobre imágenes y razon
