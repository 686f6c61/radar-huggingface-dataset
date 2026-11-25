# huggingface-mic/Qwen3.5-35B-A3B-mic

## Resumen

Qwen3.5-35B-A3B-mic es un artefacto de prueba publicado por el usuario huggingface-mic bajo el identificador `huggingface-mic/Qwen3.5-35B-A3B-mic`. No se trata de un modelo entrenado ni utilizable para inferencia real: es un *fixture* o maqueta de 33,3 millones de parametros construida a partir de la arquitectura del modelo base `Qwen/Qwen3.5-35B-A3B`. Su proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye pesos "slim" (reducidos), ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado en aproximadamente 0,5 GB. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento; unicamente superaron una comprobacion de sensibilidad a las entradas, que verifica que las perturbaciones en las entradas mueven los logits por encima de un umbral minimo (0,001). Por tanto, el modelo no genera texto coherente ni tiene capacidades cognitivas.

La relevancia de esta ficha es acotada: resulta util para desarrolladores que mantienen integraciones de Transformers y necesitan verificar que su codigo maneja correctamente la arquitectura `Qwen3_5MoeForConditionalGeneration` con los mismos nombres de tensores, el mismo tokenizador y el mismo chat template que el modelo real. Cualquier evaluacion de calidad, razonamiento o generacion debe hacerse sobre el modelo base original, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (variante reducida: 2 capas de texto) |
| Parametros totales | 33.271.920 (33,3 M) |
| Parametros activos | no disponible (fixture reducido, no representa el reparto MoE real) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32 y bfloat16 segun variante del fixture) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia el fichero `LICENSE` del modelo base, pero no se declara licencia propia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture reproduce la clase `Qwen3_5MoeForConditionalGeneration` del modelo base, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: el numero de capas de texto (`num_hidden_layers`) se reduce a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar rutas de carga, mapeo de pesos y comportamiento del modelo en frameworks sin descargar los 35B reales. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `merges.txt`, `vocab.json`, `preprocessor_config.json`, `video_preprocessor_config.json` y `generation_config.json`) se copian byte a byte desde `Qwen/Qwen3.5-35B-A3B`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron para superar una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, lo hace en 0,116). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Existen dos variantes registradas en la model card (claves de fixture `2c99a6e06d55` y `619e239831a1`), una guardada en float32 y otra en bfloat16; en esta ultima se preservan en float32 los tensores `model.language_model.layers.*.linear_attn.A_log` y `model.language_model.layers.*.linear_attn.norm.weight`. La presencia de tensores `linear_attn` sugiere atencion lineal en la arquitectura del modelo base, aunque el fixture no permite evaluar su comportamiento real.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y la salida no es texto coherente.
- Sirve como banco de pruebas de carga de pesos safetensors con nombres de tensor identicos al checkpoint original.
- Permite validar el pipeline de tokenizacion y el chat template copiados del modelo base.
- Util para verificar la integracion de la arquitectura `Qwen3_5MoeForConditionalGeneration` en Transformers.
- Permite comprobar el comportamiento de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues evaluables.
- No incluye modo thinking, vision ni audio funcionales (aunque los ficheros de preprocesador de imagen y video estan presentes como copia).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` o la clase especifica y verificar que el mapeo de pesos y la configuracion reducida funcionan sin descargar el checkpoint de 35B.
- Validacion de CI/CD en librerias de inferencia: usar el fixture como caso de prueba ligero (0,5 GB) en pipelines que comprueban compatibilidad con la arquitectura Qwen3.5 MoE.
- Verificacion de tokenizadores y chat templates: comprobar que el pipeline de tokenizacion reproduce el comportamiento del modelo base con los ficheros copiados byte a byte.
- Pruebas de robustez numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN o infinitos en kernels personalizados.
- Desarrollo de utilidades de conversion de formato: probar scripts que convierten safetensors a otros formatos usando un checkpoint pequeno con la misma estructura de tensores.
- Regression testing de frameworks: detectar cambios que rompan la carga de arquitecturas MoE con atencion lineal sin necesidad de GPUs de gran capacidad.
- Documentacion y demos de integracion: ejemplos ejecutables en `integrations/transformers/usage.md` que ilustran el contrato esperado por el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no es evaluable en tareas de calidad, razonamiento o generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (33,3 M de parametros, aproximadamente 133 MB de pesos mas overhead); el repositorio ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada.
- Opciones de despliegue: Transformers (principal caso de uso), con soporte previsible en vLLM, llama.cpp u Ollama solo si estos frameworks aceptan la arquitectura reducida, lo cual no esta documentado.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria minima pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-mic | 33,3 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face (test-artifact) |
| Qwen/Qwen3.5-35B-A3B | 35B (MoE, A3B) | no disponible | Modelo real de proposito general | no disponible en esta ficha | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato por arquitectura | no disponible | Hugging Face (huggingface-mic) |

La comparativa solo tiene sentido frente al modelo base y frente a otros fixtures del mismo proyecto; no es comparable con modelos de produccion por su naturaleza de artefacto de prueba.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada de forma explicita en la model card; el repo copia el fichero `LICENSE` del modelo base, por lo que las condiciones reales dependen de Qwen/Qwen3.5-35B-A3B.
- No se han publicado datos de sesgos, alucinacion ni comportamiento multilingue porque no aplica a un fixture.
- El fixture solo cubre checkpoints con ficheros de procesador identicos y configuracion coincidente tras el shrink; cambios en el modelo base pueden invalidarlo.
- Riesgo de confusion: el nombre incluye "35B-A3B" pero el modelo pesa 33,3 M; hay que leer el identificador completo para no descargarlo esperando el modelo real.
- Los tensores `linear_attn` en float32 dentro de la variante bfloat16 deben preservarse; alterarlos puede romper la paridad con el checkpoint original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-35B-A3B-mic.html
- Manifiesto de contrato: `integration.json` (dentro del repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
