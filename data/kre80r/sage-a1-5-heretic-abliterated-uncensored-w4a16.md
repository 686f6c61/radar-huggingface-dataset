# Kre80r/Sage-A1.5-Heretic-Abliterated-Uncensored-W4A16

## Resumen

Sage-A1.5-Heretic-Abliterated-Uncensored-W4A16 es una cuantizacion W4A16 del modelo sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored, publicado por el usuario Kre80r. El modelo original es una abliteracion realizada con la herramienta Heretic sobre InternScience/Sage-A1.5, un modelo de arquitectura Mixture-of-Experts (MoE) con torre de vision y capacidad image-text-to-text. Esta version no anade fine-tuning adicional: mantiene arquitectura, tokenizer, plantilla de chat, longitud de contexto y torre de vision sin cambios respecto al modelo base.

La cuantizacion se ha realizado con compressed-tensors en formato pack-quantized, int4 asimetrico con group size 32, mediante el metodo data-free `model_free_ptq` de llm-compressor con observador `memoryless-mse`. Solo se cuantizan los expertos enrutados de las capas 1 a 38 (29.184 matrices); el resto de componentes (atencion, atencion lineal, experto compartido, router, capas 0 y 39, embeddings, `lm_head` y torre de vision) permanece en BF16. El resultado ocupa 26,7 GB repartidos en 15 shards.

El modelo es relevante para quienes necesitan desplegar un MoE multimodal de 35.107 millones de parametros totales en hardware de consumo o en configuraciones multi-GPU modestas, a costa de asumir que la abliteracion degrada la robustez frente a inyeccion de instrucciones y que se trata de un modelo sin censura. La licencia es Apache-2.0, heredada de Sage-A1.5, aunque la herramienta Heretic es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal y torre de vision (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de despliegue del autor) |
| Tipos de cuantizacion | W4A16 int4 asimetrico, group size 32 (compressed-tensors); componentes clave en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Heretic: AGPL-3.0) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized), 15 shards, 26,7 GB |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura MoE con atencion hibrida: combina capas de atencion convencional con capas de atencion lineal, e incorpora un experto compartido junto a expertos enrutados por un router. Dispone ademas de una torre de vision que habilita la modalidad image-text-to-text. El pipeline declarado es `image-text-to-text` y la etiqueta de arquitectura en Hugging Face es `qwen3_5_moe`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es la cuantizacion selectiva: se cuantizan a int4 unicamente las 29.184 matrices de expertos enrutados de las capas 1 a 38, mientras que atencion, atencion lineal, experto compartido, router, capas 0 y 39, embeddings, `lm_head` y torre de vision se conservan en BF16. El proceso es data-free, sin calibracion, mediante `model_free_ptq` de llm-compressor. El autor reporta que, sobre 48 prompts benignos, la divergencia media respecto al modelo BF16 es KL 0,0072 con un 97,8% de coincidencia top-1 (aproximacion top-20), lo que indica una degradacion muy contenida. No se incluyen pesos MTP porque el modelo fuente tampoco los tiene.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto muy largo (hasta 262.144 tokens).
- Procesamiento de imagenes y texto combinados (image-text-to-text) mediante torre de vision.
- Razonamiento y matematicas: el autor reporta 76,7 en ReasonMath-15.
- Tool calling y function calling: soporte nativo mediante parser `qwen3_coder` en vLLM, con `--enable-auto-tool-choice`.
- Comportamiento agentico: 73,7 en HermesAgent-20 y 90,3 en ToolCall-15.
- Modo de razonamiento: compatible con `--reasoning-parser qwen3`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modelo sin censura (abliterado): 0 rechazos en 12 pruebas de un conjunto de sondeo filtrado por palabras clave.

## Casos de uso

- Agentes con tool calling en produccion: el modelo puede integrarse en vLLM con `--enable-auto-tool-choice` y el parser `qwen3_coder` para orquestar llamadas a APIs y funciones, con un rendimiento medido de 90,3 en ToolCall-15.
- Asistentes sobre documentos extensos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo completas en una sola pasada sin fragmentacion.
- Analisis de documentos con imagenes: la torre de vision habilita la extraccion de informacion de capturas, graficos, formularios escaneados y diagramas combinados con texto.
- Razonamiento matematico asistido: con 76,7 en ReasonMath-15, es adecuado para tutoria, verificacion de calculos y generacion de explicaciones paso a paso.
- Despliegue en hardware de consumo o multi-GPU modesto: los 26,7 GB en W4A16 permiten servirlo en 2x RTX 3090 con tensor parallel 2, segun la configuracion validada por el autor.
- Pipelines de generacion creativa sin restricciones de contenido: util en investigacion sobre alineacion, red teaming y evaluacion de salvaguardas, donde se necesita un modelo que no rechace peticiones.
- Investigacion sobre cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion selectiva de expertos MoE frente al modelo BF16, con metricas KL y de acuerdo top-1 publicadas.

## Benchmarks y rendimiento

| Benchmark | Este modelo (W4A16 abliterado) | Sage-A1.5 AWQ-INT4 (censurado) |
|---|---|---|
| PromptAuthority-15 | 38,0 | 66,7 |
| ToolCall-15 | 90,3 | 96,7 |
| InstructFollow-15 | 97,0 | 94,3 |
| ReasonMath-15 | 76,7 | 72,7 |
| HermesAgent-20 | 73,7 | 78,0 |
| Rechazos (12 prompts de sondeo) | 0 | no disponible |
| KL medio vs BF16 (48 prompts) | 0,0072 | no disponible |
| Acuerdo top-1 vs BF16 | 97,8% | no disponible |

Los datos provienen de mediciones del autor sobre muestras pequenas. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26,7 GB de pesos mas overhead de KV cache y activaciones; con contexto completo de 262.144 tokens y KV cache en fp8_e5m2 el consumo crece de forma significativa.
- GPU recomendadas: 2x RTX 3090 con tensor parallel 2 es la configuracion validada por el autor en vLLM 0.32.0. Para contexto maximo conviene disponer de A100 80GB o H100 en configuracion multi-GPU.
- GPU de consumo: cabe en 2x RTX 3090 (24 GB cada una). No cabe en una unica GPU de 24 GB por el tamano de los pesos.
- Opciones de despliegue: vLLM 0.32.0 (probado). El formato compressed-tensors pack-quantized es compatible con el ecosistema vLLM; no se indica compatibilidad con llama.cpp u Ollama.
- Parametros de servicio sugeridos: `--tensor-parallel-size 2`, `--max-model-len 262144`, `--kv-cache-dtype fp8_e5m2`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`.
- Muestreo sugerido: temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 1.5.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Heretic-Abliterated-Uncensored-W4A16 (este) | 35,1B totales | 262.144 | W4A16 int4, 26,7 GB | Apache-2.0 | Abliterado, sin censura, torre de vision |
| sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored | 35,1B totales | 262.144 | BF16 | Apache-2.0 | Modelo fuente sin cuantizar; mayor VRAM |
| Sage-A1.5 AWQ-INT4 (censurado) | 35,1B totales | 262.144 | AWQ int4 | Apache-2.0 | Version con salvaguardas; mejor robustez ante inyeccion (66,7 en PromptAuthority-15) |
| InternScience/Sage-A1.5 | 35,1B totales | 262.144 | BF16 | Apache-2.0 | Modelo original sin abliterar |

La comparativa se limita a la familia Sage-A1.5 porque no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion degrada la robustez ante jerarquia de instrucciones: 38,0 en PromptAuthority-15 frente a 66,7 del modelo censurado. El modelo puede seguir instrucciones inyectadas en contenido recuperado o devuelto por herramientas.
- No debe conectarse a herramientas destructivas o de salida (envio de correo, borrado, pagos) sobre contenido no confiable sin pasos de confirmacion explicitos.
- Es un modelo sin censura: puede generar contenido que otros modelos rechazarian. La responsabilidad de uso recae en el operador.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados no documentados; no se garantiza un rendimiento equilibrado fuera de los idiomas del entrenamiento original.
- La cuantizacion int4 puede introducir degradaciones adicionales en tareas no cubiertas por las metricas del autor, que se basan en muestras pequenas.
- Licencia Apache-2.0 para los pesos, pero la herramienta Heretic empleada para la abliteracion es AGPL-3.0; conviene revisar implicaciones si se redistribuye el proceso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- No se incluyen pesos MTP, lo que descarta decodificacion especulativa basada en MTP.

## Enlaces

- Hugging Face: https://huggingface.co/Kre80r/Sage-A1.5-Heretic-Abliterated-Uncensored-W4A16
- Modelo base (abliterado, BF16): https://huggingface.co/sam33339999/Sage-A1.5-Heretic-Abliterated-Uncensored
- Modelo original: https://huggingface.co/InternScience/Sage-A1.5
- Herramienta Heretic: https://github.com/p-e-w/heretic
