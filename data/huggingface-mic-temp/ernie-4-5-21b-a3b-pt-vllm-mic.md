# huggingface-mic-temp/ERNIE-4.5-21B-A3B-PT-vllm-mic

## Resumen

ERNIE-4.5-21B-A3B-PT-vllm-mic es un artefacto de prueba (fixture) publicado en Hugging Face por la cuenta `huggingface-mic-temp`, no un modelo utilizable. Se trata de una version reducida ("slim") del modelo real `baidu/ERNIE-4.5-21B-A3B-PT` de Baidu, generada para validar contratos de integracion y expectativas de frameworks (Transformers, vLLM) sin necesidad de descargar ni ejecutar los pesos completos. El repositorio incluye pesos reducidos, ejemplos de uso y directorios de expectativas de framework.

El fixture conserva la arquitectura declarada del modelo original (`Ernie4_5_MoeForCausalLM`) pero con una configuracion drasticamente menor: solo 2 capas (`num_hidden_layers: 2`) y 6.705.732 parametros totales en safetensors, frente a los 21.000 millones nominales del modelo base. Los pesos son aleatorios (semilla 17) y no han sido entrenados; superaron una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001) pero no representan conocimiento alguno.

Su relevancia es puramente de ingenieria: permite a los mantenedores de integraciones comprobar que el pipeline de carga, tokenizacion, plantilla de chat y ejecucion en vLLM funciona correctamente con la arquitectura ERNIE 4.5 MoE, a un coste de almacenamiento practicamente nulo (repo de 0,0 GB). Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ernie4_5_MoeForCausalLM (transformer MoE, configuracion reducida a 2 capas) |
| Parametros totales | 6.705.732 (fixture reducido; el modelo base declara 21B-A3B) |
| Parametros activos | no disponible (el fixture no expone el reparto activo real) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; tensores concretos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16, con `mlp.gate.weight` y `mlp.moe_statics.e_score_correction_bias` en float32) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura del modelo base ERNIE 4.5 MoE mediante la clase `Ernie4_5_MoeForCausalLM`, pero con la configuracion encogida por la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` reducido a 2. Mantiene los mismos nombres de tensores que el checkpoint real (incluidos los tensores especificos de MoE como la puerta `mlp.gate.weight` y el sesgo de correccion `moe_statics.e_score_correction_bias`), lo que permite validar la compatibilidad de carga sin disponer de los pesos completos.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El unico criterio de calidad aplicado fue una puerta de sensibilidad a la entrada, que verifica que perturbaciones de las entradas del contrato mueven los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,893). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `chat_template.jinja`, `special_tokens_map.json`, `added_tokens.json`, `generation_config.json`, `LICENSE`) se copiaron byte a byte desde `baidu/ERNIE-4.5-21B-A3B-PT`. Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona ni responde preguntas.
- Sirve como fixture de integracion para validar la carga de la arquitectura ERNIE 4.5 MoE en Transformers y vLLM.
- Permite comprobar el pipeline de tokenizacion y la plantilla de chat copiadas del modelo base.
- Valida los nombres y dtypes de tensores del checkpoint real (incluidos los especificos de MoE).
- Util para pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables.
- Capacidades multilingues: no disponibles (solo se heredan los ficheros de tokenizador).

## Casos de uso

- Pruebas de integracion en CI/CD: ejecutar el fixture en pipelines de integracion continua para verificar que una nueva version de Transformers o vLLM carga correctamente la arquitectura `Ernie4_5_MoeForCausalLM` sin descargar los 21B reales.
- Validacion de contratos de framework: comprobar que las expectativas recogidas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, sensibilidad a entradas).
- Desarrollo de tooling de conversion: probar scripts de conversion a GGUF u otros formatos sobre una arquitectura MoE realista sin coste de almacenamiento.
- Reproduccion de bugs: aislar fallos de carga o de forward en modelos ERNIE 4.5 MoE con un artefacto minimo y reproducible (hash de fixture `5c6ccb172b26`).
- Verificacion de plantillas de chat: validar el renderizado de `chat_template.jinja` y el tokenizador copiados del modelo base en aplicaciones de chat.
- Pruebas de cuantizacion: comprobar que las rutas de cuantizacion manejan correctamente los tensores float32 especificos (`mlp.gate.weight`, `e_score_correction_bias`) mezclados con bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad seria carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (6,7M parametros en bfloat16, aproximadamente 13 MB de pesos, mas overhead de framework).
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers y vLLM (segun el nombre y los enlaces del repo); llama.cpp u Ollama no estan confirmados.
- Latencia y throughput: no disponibles (no representativos del modelo real).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-4.5-21B-A3B-PT-vllm-mic (este) | 6,7M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face |
| baidu/ERNIE-4.5-21B-A3B-PT | 21B-A3B (nominal) | no disponible | Modelo real MoE | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | Fixtures de integracion | no disponible | Hugging Face (`huggingface-mic-temp`) |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene sentido.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- La licencia no esta especificada en la informacion disponible; el fichero LICENSE se copia del modelo base, pero su contenido no se detalla.
- El contexto, los idiomas y el reparto de parametros activos del modelo base no se reflejan en el fixture.
- No debe usarse en produccion, atencion al cliente, generacion de codigo ni ningun escenario real.
- Riesgo de confusion: el nombre incluye "21B-A3B" pero el artefacto solo tiene 6,7M parametros.
- Los datos de rendimiento del modelo base no son extrapolables a este fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/ERNIE-4.5-21B-A3B-PT-vllm-mic
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT
- Documentacion de uso en Transformers: `integrations/transformers/usage.md` (dentro del repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repo)
- Manifiesto de contrato: `integration.json` (dentro del repo)
- Procedencia del fixture: `build.json` (dentro del repo)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ERNIE-4.5-21B-A3B-PT-vllm-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
