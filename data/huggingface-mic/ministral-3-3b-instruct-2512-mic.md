# huggingface-mic/Ministral-3-3B-Instruct-2512-mic

## Resumen

`huggingface-mic/Ministral-3-3B-Instruct-2512-mic` no es un modelo entrenado ni un modelo utilizable para inferencia. Es un fixture de pruebas (artefacto de test) publicado por la organizacion `huggingface-mic` para validar la integracion del modelo `mistralai/Ministral-3-3B-Instruct-2512` en el ecosistema Transformers. El propio autor lo etiqueta con `test-artifact` explicitamente para excluirlo de busquedas de modelos candidatos.

El repositorio contiene pesos con la misma arquitectura (`Mistral3ForConditionalGeneration`) que el modelo real, pero con una configuracion reducida (2 capas en el encoder de vision y 2 capas en el decoder de texto) y pesos aleatorios generados con semilla 17. El total de parametros es de 8.607.168 (8,6 millones), frente a los aproximadamente 3.000 millones del modelo base. Los ficheros de procesador (tokenizer, chat template, configuracion de generacion) se copian byte a byte del checkpoint original.

Su relevancia es puramente de ingenieria: sirve para verificar que frameworks y pipelines (Transformers, integraciones de terceros) cargan, ejecutan forward pass, calculan perdida y backpropagan correctamente sobre la arquitectura Mistral3 sin necesidad de descargar los pesos completos. No debe confundirse con un modelo funcional ni emplearse en produccion bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (image-text-to-text, transformer multimodal) |
| Parametros totales | 8.607.168 (8,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (guardado en bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Mistral3ForConditionalGeneration`, que combina un encoder de vision y un decoder de texto. Para reducir el tamano se aplico una regla generica de shrink (`sweep.py`) que dejo el encoder de vision en 2 `num_hidden_layers` y el decoder de texto en 2 `num_hidden_layers`. Los nombres de tensores coinciden exactamente con los del checkpoint real `mistralai/Ministral-3-3B-Instruct-2512`, lo que permite usarlo como sustituto ligero en tests de integracion.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `pixel_values:roll_batch`, dio 0,955). Los ficheros de procesador (`SYSTEM_PROMPT.txt`, `chat_template.jinja`, `generation_config.json`, `params.json`, `processor_config.json`, `tekken.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No tiene capacidades funcionales de generacion de texto, razonamiento, codigo, matematicas o vision: los pesos son aleatorios.
- No soporta tool calling ni function calling de forma util.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales.
- Su unica funcion es servir como fixture de integracion: permite cargar el modelo, ejecutar forward pass, calcular perdida y backpropagar con la misma interfaz que el modelo real.
- Incluye un manifiesto de contrato (`integration.json`) y expectativas de framework (`integrations/transformers/expectations`) para tests automatizados.

## Casos de uso

- Test de integracion en Transformers: cargar el modelo con `Mistral3ForConditionalGeneration` y verificar que el forward pass produce logits con las formas esperadas, sin descargar los 3B parametros del modelo real.
- Validacion de pipelines multimodales image-text-to-text: comprobar que el procesador (tokenizer + image processor) se integra correctamente con el modelo en tests de CI.
- Verificacion de backpropagation: usar el fixture para confirmar que loss y gradientes son finitos en float32, bfloat16 y float16 en un entorno de entrenamiento.
- Desarrollo de nuevas integraciones de framework: cualquier libreria que quiera soportar Mistral3 puede usar este fixture para validar su capa de compatibilidad sin coste de descarga.
- Pruebas de regresion en CI/CD: incluir el fixture en la suite de tests para detectar roturas en la carga de safetensors, config o processor files.
- Reproduccion de la puerta de sensibilidad: ejecutar `build_fixtures.py` para regenerar el fixture y comprobar que las perturbaciones de entrada siguen moviendo los logits por encima del umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, no tiene sentido evaluarlo en MMLU, HumanEval, GSM8K ni tareas similares.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (8,6 M parametros, ~17 MB de pesos, mas overhead de activaciones y processor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers con `Mistral3ForConditionalGeneration`; no se recomienda vLLM, llama.cpp ni Ollama porque no esta pensado para inferencia real.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `huggingface-mic/Ministral-3-3B-Instruct-2512-mic` | 8,6 M | no disponible | Fixture de test | no disponible |
| `mistralai/Ministral-3-3B-Instruct-2512` | ~3.000 M | no disponible | Modelo real instructivo multimodal | no disponible |
| Otros fixtures `huggingface-mic` | variable (reducido) | no disponible | Fixtures de integracion | no disponible |

La comparativa directa con modelos funcionales no es significativa: el fixture solo comparte arquitectura y ficheros de procesador con el modelo base, no capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido semantico.
- No debe desplegarse en produccion ni usarse para generar contenido real.
- La licencia no esta declarada en la informacion disponible; verificar en el repositorio antes de cualquier uso.
- El contexto, idiomas y cuantizaciones no estan documentados.
- El modelo base (`mistralai/Ministral-3-3B-Instruct-2512`) tiene sus propias limitaciones y licencia, que deben consultarse por separado.
- El tag `test-artifact` lo excluye de busquedas de modelos candidatos; no confundirlo con un checkpoint funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Ministral-3-3B-Instruct-2512-mic
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Como se genero el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Ministral-3-3B-Instruct-2512-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
