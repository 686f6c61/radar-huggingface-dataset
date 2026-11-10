# huggingface-mic/mt5-small-mic

## Resumen

`mt5-small-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para tareas reales: se trata de un *fixture* (modelo reducido de test) construido para validar contratos de integracion con la libreria Transformers. Su proposito es servir como sustrato reproducible para comprobar que el pipeline de carga, tokenizacion e inferencia de un modelo `MT5ForConditionalGeneration` funciona correctamente, sin necesidad de descargar los pesos completos de `google/mt5-small`.

El modelo conserva la arquitectura del original (seq2seq encoder-decoder de tipo T5) pero con una configuracion reducida a 2 capas de encoder y 2 de decoder, lo que deja el total en 16.204.800 parametros (frente a los aproximadamente 300 millones de `google/mt5-small`). Los pesos son aleatorios (semilla 17), generados y validados mediante una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001, lo que garantiza que el modelo responde de forma diferenciada aunque no haya aprendido nada.

Es relevante exclusivamente en el contexto de testing de integraciones: quien necesite verificar el soporte de MT5 en su framework, libreria o pipeline de CI puede usar este repositorio (0,1 GB) en lugar del checkpoint real, que pesa cientos de veces mas. La etiqueta `test-artifact` lo excluye deliberadamente de las busquedas de modelos candidatos para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder (MT5ForConditionalGeneration) |
| Parametros totales | 16.204.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (heredados del tokenizer de `google/mt5-small`, no verificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de MT5 (`MT5ForConditionalGeneration`), un transformer encoder-decoder con atencion multi-cabeza y embeddings relativos posicionales, identica en estructura a `google/mt5-small` pero con `num_layers=2` y `num_decoder_layers=2`. La reduccion se aplico mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que encoge la configuracion manteniendo los nombres de tensores del checkpoint original. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer_config.json`) se copiaron byte a byte desde `google/mt5-small`, de modo que el tokenizador y la configuracion de generacion son exactamente los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una compuerta de sensibilidad a la entrada: se perturbaron las entradas del contrato y se comprobo que los logits cambiaban al menos 0,001 en todos los casos (la perturbacion mas debil, `input_ids:reverse`, produjo un cambio de 1,85). El fixture se guardo en float32, el dtype por defecto de `google/mt5-small`, y se verifico que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `d4db27680832` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- Carga e inferencia con `MT5ForConditionalGeneration` de Transformers: el modelo expone los mismos nombres de tensores que el checkpoint real, por lo que cualquier codigo que cargue `google/mt5-small` deberia cargar este fixture sin cambios.
- Tokenizacion MT5 completa: al copiar `spiece.model` y `tokenizer_config.json` del original, reproduce el vocabulario SentencePiece de MT5.
- Generacion seq2seq: soporta `generate()` con la `generation_config.json` heredada, aunque las salidas son aleatorias y sin sentido.
- Verificacion de contratos de integracion: el repositorio incluye `integration.json` (manifiesto de contrato), `integrations/transformers/usage.md` y `integrations/transformers/expectations`, pensados para tests automatizados.
- Compatibilidad de dtype: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni modo thinking: es un modelo de texto seq2seq sin entrenamiento.
- Capacidades multilingues: no verificadas; el tokenizador es el de MT5, pero los pesos no han aprendido ninguna lengua.

## Casos de uso

- Tests de integracion en CI/CD: usar el fixture en la suite de tests de una libreria que da soporte a MT5 permite validar carga de pesos, tokenizacion y `generate()` en segundos y con 0,1 GB de descarga, sin depender del checkpoint real de 300M parametros.
- Validacion de contratos de framework: el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` permiten comprobar que una nueva version de Transformers sigue cumpliendo las expectativas de entrada/salida del contrato MT5.
- Pruebas de compatibilidad de dtype: sirve para verificar que un pipeline de inferencia en bfloat16 o float16 no produce NaN ni inf en un modelo MT5, ya que el fixture garantiza finitud en esos dtypes.
- Desarrollo de herramientas de inspeccion de modelos: util para probar utilidades que leen safetensors, comparan nombres de tensores o validan configuraciones, sin manejar checkpoints grandes.
- Reproduccion de bugs de carga: al tener los mismos nombres de tensores que el original, permite reproducir y depurar errores de `state_dict` o de `from_pretrained` de forma ligera y determinista.
- Docencia y demos de arquitectura seq2seq: permite mostrar la estructura interna de un MT5 (capas, atencion, proyecciones) con un modelo pequeno que cabe en cualquier maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, BLEU) seria irrelevante y no se ha reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,2M parametros, ~65 MB de pesos); menos de 100 MB en float16.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (`from_pretrained`), y en principio cualquier runtime que cargue safetensors de MT5; no se ha verificado soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por tamano, la inferencia en CPU es del orden de milisegundos por secuencia corta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mt5-small-mic` | 16,2M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/mt5-small` | ~300M | 512 tokens (por defecto en MT5) | Modelo multilingue real | Apache 2.0 | Hugging Face |
| `google/mt5-base` | ~580M | 512 tokens (por defecto en MT5) | Modelo multilingue real | Apache 2.0 | Hugging Face |
| `google/mt5-large` | ~1,2B | 512 tokens (por defecto en MT5) | Modelo multilingue real | Apache 2.0 | Hugging Face |

La comparacion relevante es con la familia MT5 original: este fixture solo comparte arquitectura y tokenizador, no pesos ni capacidades. Frente a `google/mt5-small`, la diferencia de parametros es de aproximadamente 18x y la diferencia funcional es total (pesos aleatorios frente a pesos entrenados). Los datos de contexto y licencia de los modelos MT5 originales se incluyen como referencia de la familia; para el fixture no estan disponibles.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido. No debe desplegarse en produccion bajo ninguna circunstancia.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo fuera de tests es un error de uso.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se puede evaluar sesgo de datos.
- Riesgo de alucinacion: total, en el sentido de que toda salida es ruido; no debe interpretarse como generacion fiable.
- Limitaciones de contexto e idioma: no documentadas; el tokenizador es el de MT5 pero el modelo no ha aprendido ninguna lengua.
- Licencia no disponible: no se puede confirmar permiso de uso comercial; al ser un artefacto de test, su explotacion comercial no tiene sentido.
- Caveat de integracion: aunque los nombres de tensores coinciden con el checkpoint real, el numero de capas es distinto (2 frente a las del original), por lo que no es intercambiable a nivel de pesos, solo de contrato de carga.
- El repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture mt5-small-mic`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mt5-small-mic
- Modelo base: https://huggingface.co/google/mt5-small
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del encogimiento del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mt5-small-mic.html
