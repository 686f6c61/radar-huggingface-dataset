# huggingface-mic/NVIDIA-Nemotron-3-Nano-4B-BF16-mic

## Resumen

NVIDIA-Nemotron-3-Nano-4B-BF16-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable para inferencia real. Se trata de una version reducida artificialmente del checkpoint nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, con tan solo 20.150.968 parametros (frente a los aproximadamente 4.000 millones que sugiere el nombre del modelo base) y pesos generados aleatoriamente con semilla 17. Su proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio conserva la misma arquitectura declarada que el modelo original (NemotronHForCausalLM), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte desde el checkpoint de NVIDIA (tokenizer, chat template, configuracion, scripts de modelado). De este modo, permite comprobar que una integracion carga, ejecuta el forward, calcula la perdida y propaga gradientes correctamente en float32, bfloat16 y float16, con independencia del contenido semantico de los pesos.

Es relevante unicamente en el contexto de ingenieria de software y CI: la etiqueta `test-artifact` lo excluye explicitamente de busquedas de modelos candidatos. Cualquier uso como modelo de lenguaje, generacion de texto o razonamiento produciria salidas sin sentido, ya que los pesos son aleatorios y nunca fueron entrenados. La ficha se limita, por tanto, a documentar sus caracteristicas tecnicas como fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (NemotronHForCausalLM), transformer causal LM |
| Parametros totales | 20.150.968 (fixture reducido; el modelo base se denomina 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `NemotronHForCausalLM` del modelo base, con los mismos nombres de tensores y una configuracion reducida mediante la regla generica de `sweep.py` del proyecto transformers-mic. Los ficheros de procesador (`configuration_nemotron_h.py`, `modeling_nemotron_h.py`, `tokenizer.json`, `chat_template.jinja`, `nano_v3_reasoning_parser.py`, entre otros) se copian byte a byte desde nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, de modo que la interfaz de carga y ejecucion es identica a la del checkpoint real.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Para garantizar que el fixture es funcional como banco de pruebas, se aplico una puerta de sensibilidad a la entrada, verificando que toda perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, produce 0,766). El modelo se guarda en bfloat16, el dtype por defecto del checkpoint original, y se valida que es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes.

## Capacidades

- Carga y ejecucion del forward pass con la clase `NemotronHForCausalLM` en Transformers.
- Calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Validacion de contratos de integracion: manifiesto `integration.json`, directorio de expectativas y documentacion de uso en `integrations/transformers/`.
- Verificacion de compatibilidad de tokenizer y chat template copiados del modelo base.
- No genera texto coherente: los pesos son aleatorios.
- No soporta tool calling, agentes, vision, audio ni razonamiento real.
- No dispone de capacidades multilingues efectivas.

## Casos de uso

- Pruebas de integracion en CI/CD: el repositorio de 0,2 GB permite ejecutar tests de carga y forward de un modelo NemotronH en pipelines sin descargar el checkpoint completo de NVIDIA, reduciendo tiempo y ancho de banda.
- Validacion de nuevas versiones de Transformers: comprobar que una release candidata sigue cargando y ejecutando `NemotronHForCausalLM` con los mismos nombres de tensores y configuracion reducida.
- Desarrollo de herramientas de inspeccion de modelos: verificar que scripts que enumeran tensores, dtypes o configuracion funcionan sobre un checkpoint con la misma estructura que el original.
- Pruebas de cuantizacion y conversion de formato: validar pipelines que convierten safetensors bfloat16 a otros formatos o dtypes sobre un modelo pequeno que cabe en cualquier GPU consumer.
- Verificacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una integracion cumple las expectativas declaradas (entradas, salidas, sensibilidad).
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture NVIDIA-Nemotron-3-Nano-4B-BF16-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (20,15 M de parametros, ~40 MB de pesos) mas overhead de activaciones y contexto; cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte bfloat16 (RTX 30xx/40xx, A100, H100); tambien ejecutable en CPU.
- Cabe en GPU consumer: si, incluidas GTX/RTX de gama baja y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 20 M de parametros, la latencia seria del orden de milisegundos, pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B-BF16-mic (este) | 20,15 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face (huggingface-mic) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4 B (segun denominacion) | no disponible | Modelo real de lenguaje | no disponible | Hugging Face (nvidia) |
| Otros fixtures de transformers-mic | Variable (reducidos) | no disponible | Artefactos de prueba | no disponible | Hugging Face (huggingface-mic) |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y nunca se entrenaron; las salidas carecen de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible en la informacion proporcionada; el fichero LICENSE se copia del modelo base, por lo que las restricciones del checkpoint de NVIDIA podrian aplicarse, pero no se detallan.
- Los datos de contexto, idiomas y cuantizacion no estan disponibles; no deben inferirse del nombre "4B".
- El tamaÃ±o real del fixture (20,15 M de parametros) difiere drasticamente del modelo base, por lo que su comportamiento numerico no es representativo.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y `modeling_nemotron_h.py`.
- Riesgo de confusion: el nombre incluye "4B" y "BF16", lo que puede llevar a error sobre su tamano y proposito real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/NVIDIA-Nemotron-3-Nano-4B-BF16-mic
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/NVIDIA-Nemotron-3-Nano-4B-BF16-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
