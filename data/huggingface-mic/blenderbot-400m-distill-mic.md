# huggingface-mic/blenderbot-400M-distill-mic

## Resumen

`blenderbot-400M-distill-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face, no un modelo entrenado ni utilizable para inferencia real. Se trata de un "slim fixture" derivado de `facebook/blenderbot-400M-distill`: conserva la misma arquitectura (`BlenderbotForConditionalGeneration`) y los mismos nombres de tensores que el checkpoint original, pero con una configuracion reducida a 2 capas de encoder y 2 de decoder, lo que deja el total en 704.584 parametros (frente a los aproximadamente 400 millones del modelo base).

Su proposito es servir como fixture de integracion para el proyecto `transformers-mic`: permite validar contratos de uso (manifiesto `integration.json`, expectativas de framework en `integrations/transformers/expectations`) y comprobar que un pipeline de Transformers carga, ejecuta y propaga gradientes correctamente sin necesidad de descargar pesos de cientos de megabytes. Los pesos son aleatorios (semilla 17) y se generaron sin entrenamiento, unicamente superando una puerta de sensibilidad a la entrada (cada perturbacion de las entradas mueve los logits al menos 0,001).

Por tanto, cualquier evaluacion de calidad linguistica, razonamiento o generacion de texto sobre este repositorio carece de sentido: el modelo no produce respuestas coherentes. Es relevante unicamente para desarrolladores que mantienen o auditan el ecosistema de pruebas de Transformers y quieren reproducir el fixture de forma determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (`BlenderbotForConditionalGeneration`), 2 capas de encoder y 2 de decoder |
| Parametros totales | 704.584 (0,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de BlenderBot: un transformer encoder-decoder con atencion multi-cabeza, pensado originalmente para dialogo abierto multi-turno. En este repositorio la configuracion se ha reducido mediante la regla generica de `sweep.py` (2 capas de encoder, 2 de decoder), manteniendo los nombres de tensores identicos a los del checkpoint real. Los ficheros de procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `facebook/blenderbot-400M-distill`, por lo que el tokenizador es el del modelo original.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: se comprobo que perturbaciones de las entradas del contrato desplazan los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,0602). El autor declara que el modelo es finito en forward, perdida y gradientes para float32, bfloat16 y float16. El fixture se identifica con la clave `7bd7cf661c75` y cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el proceso de reduccion.

## Capacidades

- Carga y ejecucion en Transformers como `BlenderbotForConditionalGeneration` con los mismos nombres de tensores que el modelo base.
- Validacion de contratos de integracion: manifiesto (`integration.json`), uso ejecutable (`integrations/transformers/usage.md`) y expectativas de framework (`integrations/transformers/expectations`).
- Comprobacion de propagacion de gradientes y finitud numerica en float32, bfloat16 y float16.
- Verificacion de sensibilidad a entradas (perturbaciones de `input_ids` y `attention_mask` alteran los logits).
- No soporta generacion de texto coherente: los pesos son aleatorios.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento.
- Capacidades multilingues: no disponibles (el tokenizador copiado es el de BlenderBot, pero el modelo no ha sido entrenado).

## Casos de uso

- Pruebas de integracion en CI de Transformers: cargar el fixture con `AutoModelForSeq2SeqLM`, ejecutar un forward con entradas sinteticas y verificar que las formas de salida y los nombres de tensores coinciden con el contrato, sin descargar el checkpoint completo.
- Validacion de pipelines de cuantizacion o conversion de formato: comprobar que una herramienta (por ejemplo, conversion a bfloat16 o float16) produce tensores finitos sobre este fixture antes de aplicarla al modelo real.
- Desarrollo de utilidades de inspeccion de checkpoints: el fixture permite iterar rapidamente sobre scripts que enumeran tensores, comparan configs o auditan ficheros de procesador.
- Reproduccion determinista de fallos: al tener semilla fija (17) y pesos versionados, sirve para reproducir bugs de carga o de forward reportados contra `facebook/blenderbot-400M-distill`.
- Formacion y documentacion: ejemplo minimo de como se estructura un repositorio con pesos, uso ejecutable y expectativas de framework en un solo lugar.
- Verificacion de contratos de tokenizador: al copiar los ficheros de procesador byte a byte, permite testear que un pipeline tokeniza igual que el modelo base sin cargar los 400 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba y no un modelo utilizable, por lo que no existen metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (0,7 M de parametros), sin contar overhead de runtime.
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (referencia del contrato), potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa ruta en el repositorio.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/blenderbot-400M-distill-mic` | 0,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `facebook/blenderbot-400M-distill` | ~400 M | no disponible | Dialogo abierto | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: mismo tokenizador y mismos nombres de tensores, pero 570 veces menos parametros y pesos aleatorios. Frente a otros fixtures del mismo proyecto, comparte el mismo enfoque (config reducida, pesos aleatorios, puerta de sensibilidad) pero cubre especificamente la familia BlenderBot.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene coherencia linguistica.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base (`facebook/blenderbot-400M-distill`) antes de cualquier uso derivado.
- El contexto maximo no esta documentado en este repositorio; la config reducida puede no reflejar el comportamiento del modelo base.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez, y carecen de sentido para un fixture.
- El repositorio tiene un tamano de 0,0 GB y 489 descargas; su mantenimiento depende del proyecto `transformers-mic`.
- Cualquier conclusion sobre capacidades multilingues o de dialogo extraida de este repositorio seria invalida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/blenderbot-400M-distill-mic
- Modelo base: https://huggingface.co/facebook/blenderbot-400M-distill
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blenderbot-400M-distill-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Uso en Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de framework (en el repo): `integrations/transformers/expectations`
- Manifiesto de contrato (en el repo): `integration.json`
- Procedencia del fixture (en el repo): `build.json`
