# sergolsub/copernicus-31B-MLX-8bit

## Resumen

Copernicus-31B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo Poindexter-Labs/Copernicus-31B, publicada por el usuario sergolsub. El objetivo es permitir la ejecución del modelo original en hardware Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios de arquitectura: se trata exclusivamente de una cuantización de los pesos originales. El modelo base cuenta con 31.000 millones de parámetros, aunque la información disponible no detalla su arquitectura interna, longitud de contexto ni composición del dataset de entrenamiento.

La relevancia de esta ficha radica en su orientación a un caso de uso muy específico: la toma de decisiones estructuradas mediante cabezas de decisión (`decide`) con tipos de salida como `noul`, `choice` y `score`, en lugar de generación de texto libre convencional. El autor proporciona métricas de calidad tras la cuantización (accuracy 87,8 %, PPL 1,867) y mediciones de rendimiento en un Mac mini M4 Pro de 48 GB, lo que facilita la evaluación práctica del modelo en ese hardware.

Al tratarse de una conversión, la ficha describe tanto las características heredadas del modelo base (licencia Apache 2.0, tamaño de 31B) como las particularidades de esta versión MLX (tamaño en disco de 33,77 GB, latencia mediana de 4712 ms por decisión, memoria pico de 20,31 GB). No se dispone de información sobre idiomas soportados ni sobre benchmarks estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 31B; la conversión no modifica la arquitectura) |
| Parametros totales | 31B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (existe también una versión 4-bit del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base; prevalece la del repositorio upstream) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Poindexter-Labs/Copernicus-31B: la model card de esta conversión no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Lo único confirmado es el tamaño de 31.000 millones de parámetros y la existencia de un modo de decisión con cabezas específicas (`decision_config.json`, `joint_config.json`), lo que sugiere un diseño orientado a tareas de clasificación estructurada más que a generación libre.

La innovación técnica de esta publicación concreta es la cuantización a 8 bits en formato MLX, acompañada de una auditoría de calidad poco habitual: se comparan 1188 tensores del modelo original con sus contrapartidas dequantizadas, obteniendo un KL medio de 1,05e-05 y un máximo de 1,43e-04 (peor capa: `language_model.layers.49.mlp.up_proj.weight`). También se reporta el KL a nivel de salida entre las versiones 8-bit y 4-bit (media 6,52e-03 nats sobre 100 filas), aunque no se registraron las probabilidades del modelo original en bf16, por lo que no hay referencia directa contra el modelo sin cuantizar.

## Capacidades

- Toma de decisiones estructuradas mediante el método `decide`, con tipos de salida `noul` (sí/no), `choice` (selección entre criterios) y `score` (puntuación sobre una escala de criterios).
- Clasificación de tickets y enrutamiento a equipos (por ejemplo, billing frente a shipping) a partir de texto libre.
- Evaluación de severidad e impacto de incidencias mediante escalas configurables.
- Inferencia local en Apple Silicon mediante `mlx_lm`, con carga del modelo y glue de inferencia incluidos en el repositorio.
- No se dispone de información sobre generación de texto libre, razonamiento multi-paso, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve una elección entre equipos definidos por criterios (por ejemplo, billing o shipping), lo que permite automatizar la primera capa de triaje sin un LLM generativo completo.
- Detección de intención de reembolso: con el tipo `noul`, se puede preguntar si el cliente solicita un reembolso y usar la respuesta para disparar flujos de atención al cliente o reglas de negocio.
- Priorización de incidencias: el tipo `score` con criterios como `cosmetic`, `annoying` o `blocks` permite asignar severidad a errores reportados y ordenar la cola de trabajo de un equipo técnico.
- Moderación o validación de formularios: clasificación binaria de textos entrantes contra políticas definidas, aprovechando la baja latencia relativa en hardware Apple Silicon (4712 ms de mediana por decisión).
- Procesamiento local y privado en estaciones de trabajo Mac: al ejecutarse con MLX en un Mac mini M4 Pro con 48 GB, encaja en escenarios donde los datos no pueden salir del dispositivo, como triaje interno de correos o clasificación de documentación sensible.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de 8 bits frente a 4 bits (accuracy 87,8 % frente a 84,4 %) antes de desplegar una versión más ligera en producción.

## Benchmarks y rendimiento

Los datos disponibles son métricas propias del autor sobre un conjunto de evaluación no especificado, no benchmarks estándar de la comunidad. Se presentan junto a la versión 4-bit del mismo autor; no hay resultados del modelo original en bf16.

| Version | Accuracy | noul | choice | score | PPL | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|
| original (bf16) | no medido | no medido | no medido | no medido | no medido | no medido | no medido |
| 8-bit (esta ficha) | 87,8 % | 90,0 % | 92,0 % | 80,0 % | 1,867 | 33,77 GB | 4712 ms |
| 4-bit | 84,4 % | 87,5 % | 88,0 % | 76,0 % | 1,889 | 18,42 GB | 4680 ms |

Mediciones adicionales en Mac mini M4 Pro 48 GB: carga en 9,78 s, memoria residente pico de 20,31 GB y throughput sostenido de 0,23 decisiones cortas por segundo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 20,31 GB de memoria residente pico medida en inferencia; el modelo ocupa 33,77 GB en disco.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada (medición del autor).
- GPU recomendadas: exclusivamente Apple Silicon con memoria unificada suficiente (se requiere al menos ~34 GB libres para los pesos y margen para el runtime); no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama alta con 48 GB o más; no se han publicado pruebas en configuraciones de 32 GB o inferiores.
- Opciones de despliegue: `mlx_lm` mediante el cargador `copernicus_mlx` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 4712 ms por decisión, 0,23 decisiones cortas por segundo en el hardware citado; carga inicial de 9,78 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/copernicus-31B-MLX-8bit | 31B | no disponible | MLX 8-bit | Apache 2.0 | Accuracy 87,8 %, PPL 1,867, 33,77 GB |
| sergolsub/copernicus-31B-MLX-4bit | 31B | no disponible | MLX 4-bit | Apache 2.0 | Accuracy 84,4 %, PPL 1,889, 18,42 GB |
| Poindexter-Labs/Copernicus-31B | 31B | no disponible | bf16 | Apache 2.0 | Modelo original; sin métricas publicadas en la información disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (toma de decisiones estructuradas de 31B) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA ni a otros runtimes sin conversión adicional.
- La model card no documenta sesgos, idiomas soportados ni comportamiento fuera del modo de decisión; se desconoce su robustez en dominios distintos al evaluado.
- Riesgo de alucinación no caracterizado: no hay información sobre generación libre ni sobre calibración en textos fuera de distribución.
- Las métricas de calidad (accuracy 87,8 %, PPL 1,867) proceden de un conjunto de evaluación no descrito por el autor, por lo que no son directamente comparables con benchmarks públicos.
- No se registraron las probabilidades del modelo original en bf16, de modo que el impacto real de la cuantización frente al modelo sin cuantizar no está medido.
- La licencia Apache 2.0 se hereda del repositorio upstream; en caso de conflicto prevalece la licencia del modelo base, por lo que conviene verificar el repositorio original antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/copernicus-31B-MLX-8bit
- Modelo base: https://huggingface.co/Poindexter-Labs/Copernicus-31B
- Versión 4-bit del mismo autor: https://huggingface.co/sergolsub/copernicus-31B-MLX-4bit
