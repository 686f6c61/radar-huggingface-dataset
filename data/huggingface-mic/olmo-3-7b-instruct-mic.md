# huggingface-mic/Olmo-3-7B-Instruct-mic

## Resumen

`huggingface-mic/Olmo-3-7B-Instruct-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado utilizable. Se presenta como una version reducida ("slim") del modelo `allenai/Olmo-3-7B-Instruct`, generada mediante la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`, que disminuye el numero de capas ocultas a 2 y conserva la misma arquitectura `Olmo3ForCausalLM`.

El peso real del repositorio son 12.918.080 parametros con pesos aleatorios (semilla 17), en bfloat16, con nombres de tensor identicos a los del checkpoint original y ficheros de procesador copiados byte a byte desde `allenai/Olmo-3-7B-Instruct` (tokenizer, `chat_template.jinja`, `generation_config.json`, etc.). El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que "no es un modelo usable", con el objetivo de mantenerlo fuera de las busquedas de modelos candidatos.

Su relevancia es, por tanto, exclusivamente de ingenieria: sirve como fixture de testing para validar integraciones de Transformers y contratos de framework (manifest `integration.json`, directorio `integrations/transformers/expectations`) sin necesidad de descargar ni ejecutar el modelo completo de 7B. No debe confundirse con un modelo de produccion ni evaluarse por sus capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Olmo3ForCausalLM` (transformer causal, config reducida a `num_hidden_layers: 2`) |
| Parametros totales | 12.918.080 (pesos aleatorios, semilla 17) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (fixture; hereda `generation_config.json` del modelo base, sin datos publicados en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `allenai/Olmo-3-7B-Instruct` (`Olmo3ForCausalLM`), pero con la configuracion reducida por la regla generica de `sweep.py` a `num_hidden_layers: 2`. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `merges.txt`, `olmo-instruct.png`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el checkpoint original, por lo que el tokenizer y la plantilla de chat son los del Olmo 3 Instruct real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, lo hace en 0,167). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se identifica con la clave `6ed8e0e79060` y cubre todo checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras la reduccion.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Conserva la interfaz de uso del modelo base: tokenizer, plantilla de chat y `generation_config.json` originales, utiles para probar pipelines de tokenizacion y formateo de prompts.
- Sirve como fixture de conformidad para validar contratos de framework (manifest `integration.json` y expectativas en `integrations/transformers/expectations`).
- Permite verificar carga de safetensors, nombres de tensor y compatibilidad de `Olmo3ForCausalLM` en Transformers sin descargar el modelo de 7B.
- Tool calling, agentes, multilingue, vision o audio: no disponibles en este artefacto (dependerian del modelo base, no del fixture).

## Casos de uso

- Tests de integracion en CI: cargar el fixture en Transformers para comprobar que la clase `Olmo3ForCausalLM` y los nombres de tensor del checkpoint real siguen siendo compatibles tras cambios en la libreria, sin coste de descarga ni GPU.
- Validacion de contratos de framework: ejecutar el manifest `integration.json` y el directorio `integrations/transformers/expectations` para verificar que una integracion cumple las expectativas declaradas.
- Pruebas de tokenizer y plantilla de chat: al copiarse `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` byte a byte, permite testear el formateo de conversaciones del Olmo 3 Instruct real con un modelo ligero.
- Verificacion de dtypes: comprobar que un pipeline maneja correctamente bfloat16, float16 y float32 (forward, loss y gradientes finitos) antes de pasar al checkpoint completo.
- Desarrollo de herramientas de inspeccion de safetensors: usar un repo de 12,9M parametros con nombres de tensor reales para probar utilidades de analisis de checkpoints.
- Reproduccion del fixture: reconstruir el artefacto con `python example/build_fixtures.py --fixture Olmo-3-7B-Instruct-mic` para auditar el proceso de reduccion y los hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (12,9M parametros, aproximadamente 26 MB de pesos mas overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (uso previsto segun `integrations/transformers/usage.md`); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Olmo-3-7B-Instruct-mic` | 12,9M (aleatorios) | no disponible | Fixture de test | no disponible | Hugging Face (2316 descargas) |
| `allenai/Olmo-3-7B-Instruct` | 7B (nominal) | no disponible en la informacion proporcionada | Modelo instruct real | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Otros fixtures de `transformers-mic` | variable (reducidos) | no disponible | Fixtures de test por arquitectura | no disponible | Hugging Face |

La comparativa relevante es contra el propio modelo base: el fixture no sustituye a `allenai/Olmo-3-7B-Instruct` en ninguna tarea de inferencia real, solo replica su interfaz y estructura de tensores a escala reducida.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico; el autor lo etiqueta como `test-artifact`.
- Sesgos conocidos: no aplica (sin entrenamiento); cualquier sesgo observado en la salida seria ruido aleatorio.
- Riesgo de alucinacion: total, en el sentido de que toda la generacion es ruido; no debe desplegarse en produccion.
- Limitaciones de contexto e idioma: no documentadas; el fixture hereda ficheros de configuracion del modelo base pero no se publican cifras en la informacion disponible.
- Restricciones de licencia: no disponible; verificar la licencia de `allenai/Olmo-3-7B-Instruct` antes de cualquier uso derivado.
- Caveat de produccion: no usar como sustituto del checkpoint real; su utilidad se limita a testing de integraciones y validacion de contratos de framework.
- El tamano del repo figura como 0.0 GB en los metadatos, coherente con un artefacto ligero, pero conviene verificar los ficheros reales antes de integrarlo en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Olmo-3-7B-Instruct-mic.html
- Manifest de contrato (`integration.json`): https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/build.json
