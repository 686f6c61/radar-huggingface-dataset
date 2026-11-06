# qualcomm/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.700 millones de parametros desarrollado por Liquid AI como parte de la familia LFM3, una saga de modelos hibridos disenada para despliegue en dispositivo (on-device) con alta velocidad y calidad. La version alojada en `qualcomm/LFM3-1.7B` no es el modelo original, sino una exportacion optimizada por Qualcomm para ejecutarse sobre sus chipsets Snapdragon mediante el runtime GenieX y llama.cpp, distribuyendo pesos ya cuantizados en formato GGUF q4_0.

El modelo esta afinado para seguimiento de instrucciones, conversacion y uso de herramientas (tool use), lo que lo hace adecuado para asistentes integrados en movil, PC y dispositivos de borde. Su tamano compacto y su naturaleza hibrida permiten obtener tasas de generacion de decenas de tokens por segundo en hardware movil, con tiempos al primer token que van desde decimas de segundo hasta varios segundos segun la longitud del contexto.

La relevancia actual del modelo radica en la tendencia a ejecutar LLM localmente sin depender de la nube: privacidad, latencia baja y funcionamiento offline. La ficha se centra en la version optimizada de Qualcomm, aunque se referencia el modelo original de Liquid AI para obtener detalles de arquitectura y entrenamiento que la model card de Qualcomm no detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (familia LFM3 de Liquid AI); detalles concretos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 4096 tokens en los perfiles de rendimiento publicados (512 y 4096) |
| Tipos de cuantizacion | q4_0 (unico formato pre-exportado documentado) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; consultar terminos del modelo original de Liquid AI) |
| Formato de pesos | GGUF (runtime GENIEX_LLAMACPP); pesos PyTorch en el repositorio |

## Arquitectura y entrenamiento

La model card de Qualcomm no proporciona detalles sobre la arquitectura interna, el numero de tokens de entrenamiento ni el proceso de alineacion. Se sabe que LFM3 es una familia de modelos hibridos de Liquid AI, lo que sugiere una combinacion de mecanismos de atencion y capas recurrentes o de estado, pero la informacion concreta no esta disponible en la documentacion proporcionada. Para obtener detalles de arquitectura, composicion del dataset y tecnicas de RLHF/DPO, es necesario consultar el modelo original en `LiquidAI/LFM3-1.7B`.

La innovacion principal de esta version es el proceso de exportacion de Qualcomm: los pesos se compilan y perfilan mediante Qualcomm AI Hub Workbench para ejecutarse en el runtime GenieX sobre chipsets Snapdragon, con soporte para configuraciones personalizadas de pesos, formas de entrada y dispositivo objetivo a traves de la libreria `ai-hub-models`. Esto permite adaptar el modelo a checkpoints afinados y a distintas formas de entrada sin partir del binario pre-exportado.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Seguimiento de instrucciones (instruction following).
- Uso de herramientas (tool use / function calling).
- Despliegue on-device en dispositivos Snapdragon (movil y PC).
- Ejecucion offline sin dependencia de servicios en la nube.
- Soporte de contexto de hasta 4096 tokens en los perfiles publicados.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en movil: el modelo puede gestionar dialogos multi-turno con contexto de hasta 4096 tokens y tasas de 35-51 tokens/s en Snapdragon 8 Elite, lo que permite respuestas fluidas sin conexion a red.
- Autocompletado y redaccion en aplicaciones de productividad en PC: sobre Snapdragon X Elite o X2 Elite alcanza 31-86 tokens/s, adecuado para sugerencias en tiempo real dentro de editores de texto.
- Agente local con tool calling: al soportar uso de herramientas, puede invocar funciones del sistema (calendario, clima, busqueda local) en flujos de varios pasos sin enviar datos a la nube.
- Atencion al cliente embebida en aplicaciones: con tiempos al primer token de 0,04-1,2 s en contextos de 512 tokens, la latencia es compatible con interacciones conversacionales percibidas como instantaneas.
- Procesamiento de documentos con contexto medio: con 4096 tokens de contexto puede resumir correos, notas o articulos breves directamente en el dispositivo, manteniendo la privacidad del contenido.
- Prototipado y evaluacion de modelos hibridos: investigadores pueden usar la exportacion de Qualcomm para medir rendimiento real en hardware movil y comparar con alternativas densas del mismo tamano.
- Integracion en pipelines de CI/CD para validacion on-device: la libreria `ai-hub-models` permite compilar y perfilar checkpoints personalizados, util para equipos que necesitan verificar regresiones de latencia antes de publicar una app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de rendimiento de inferencia (tokens por segundo y tiempo al primer token) sobre chipsets Snapdragon con cuantizacion q4_0:

| Chipset | Contexto | Response rate (tokens/s) | Time to first token (s) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | 512 | 42,8 - 51,2 | 0,04 - 1,19 |
| Snapdragon 8 Elite Gen 5 for Galaxy | 4096 | 39,8 - 46,0 | 0,05 - 19,43 |
| Snapdragon 8 Elite for Galaxy | 512 | 40,9 - 53,4 | 0,05 - 1,39 |
| Snapdragon 8 Elite for Galaxy | 4096 | 36,0 | 0,06 - 19,36 |
| Snapdragon X2 Elite | 512 | 52,6 - 86,4 | 0,04 - 0,36 |
| Snapdragon X2 Elite | 4096 | 42,1 - 72,5 | 0,05 - 3,77 |
| Snapdragon X Elite | 512 | 33,6 - 72,7 | 0,09 - 0,75 |
| Snapdragon X Elite | 4096 | 31,2 - 55,8 | 0,09 - 8,19 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion q4_0 un modelo de 1.7B ocupa aproximadamente 1 GB de pesos, aunque la cifra exacta no se documenta.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo esta optimizado para NPU/CPU de chipsets Snapdragon (8 Elite, 8 Elite Gen 5, X Elite, X2 Elite).
- Compatibilidad con GPU de consumo: no se documenta soporte para RTX 4090 u otras GPU de escritorio en esta exportacion; el runtime objetivo es GenieX sobre Snapdragon.
- Opciones de despliegue: GenieX (runtime de Qualcomm AI Hub) con llama.cpp; exportacion personalizada mediante la libreria `ai-hub-models`; pesos GGUF descargables.
- Latencia y throughput: 31-86 tokens/s segun chipset y longitud de contexto; tiempo al primer token desde 0,04 s (contexto 512, X2 Elite) hasta 19,4 s (contexto 4096, 8 Elite Gen 5 for Galaxy).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad para establecer una comparativa rigurosa con alternativas. A modo orientativo, se comparan caracteristicas estructurales con modelos de tamano similar, aunque los datos de rendimiento de estos ultimos no se han verificado en la informacion proporcionada:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM3-1.7B (Qualcomm) | 1,7B | hasta 4096 | other | On-device Snapdragon, hibrido |
| LFM3-1.7B (Liquid AI) | 1,7B | no disponible | other | Modelo base original |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card de Qualcomm no documenta sesgos conocidos; al ser una exportacion del modelo de Liquid AI, hereda los sesgos del entrenamiento original, no detallados aqui.
- Riesgo de alucinacion inherente a modelos de 1,7B; la ventana de contexto maxima documentada es de 4096 tokens, lo que limita tareas que requieran documentos largos.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingue adecuado sin consultar el modelo original.
- Licencia "other": es imprescindible revisar los terminos del modelo original de Liquid AI antes de un uso comercial; la model card no aclara restricciones.
- La exportacion esta atada al ecosistema Qualcomm (GenieX, Snapdragon); no es un artefacto portable a GPU de escritorio sin un proceso de conversion adicional.
- Solo se documenta cuantizacion q4_0; no hay variantes q5, q8 o fp16 pre-exportadas en la informacion disponible.
- El tiempo al primer token en contexto de 4096 tokens puede llegar a 19,4 s en el chipset movil de gama alta, lo que afecta a la experiencia en prompts largos.

## Enlaces

- Repositorio Hugging Face (version Qualcomm): https://huggingface.co/qualcomm/LFM3-1.7B
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pesos GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/lfm3_1_7b
- Libreria ai-hub-models en GitHub: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/lfm3_1_7b
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Guia de inicio de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Web de Qualcomm: https://www.qualcomm.com/
