# huggingface-mic/granite-3.1-2b-instruct-mic

## Resumen

`granite-3.1-2b-instruct-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, derivado de `ibm-granite/granite-3.1-2b-instruct` de IBM. No es un modelo usable en produccion: se trata de un *fixture* de 3.219.968 parametros (3,2 M) construido para validar contratos de integracion de frameworks (Transformers y otros) contra la arquitectura real de Granite sin necesidad de descargar los 2 B de parametros del checkpoint original. El repositorio esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo conserva la arquitectura `GraniteForCausalLM` del checkpoint base, pero con una configuracion reducida a 2 capas ocultas (`num_hidden_layers: 2`), aplicando la regla generica de reduccion del script `sweep.py` del proyecto `transformers-mic`. Los ficheros de procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `added_tokens.json`, `generation_config.json`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte del modelo original, de modo que el tokenizador y la configuracion de generacion son identicos a los de Granite 3.1 2B Instruct.

Su relevancia es puramente de ingenieria: permite ejecutar pruebas de integracion, validacion de contratos y gates de sensibilidad de entrada en CI sin coste de almacenamiento ni de computo. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el propio autor indica que superaron el gate de sensibilidad de entrada (toda perturbacion de las entradas del contrato movio los logits al menos 0,001) y que por ello no fue necesario entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GraniteForCausalLM`), 2 capas ocultas |
| Parametros totales | 3.219.968 (3,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de la config del base, no verificada) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponibles (tokenizador copiado del base Granite 3.1) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint `ibm-granite/granite-3.1-2b-instruct`: un transformer causal decoder-only bajo la clase `GraniteForCausalLM`. La unica diferencia estructural es la profundidad: se ha reducido a `num_hidden_layers: 2` mediante la regla generica de `sweep.py`, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros del procesador se copian literalmente del modelo base, por lo que el vocabulario, las reglas de merge BPE y los tokens especiales coinciden exactamente.

No hay entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se aceptan porque superan el gate de sensibilidad de entrada: cada perturbacion de las entradas del contrato provoca un desplazamiento de logits de al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, alcanza 0,00208). El modelo se guarda en bfloat16, el dtype por defecto con el que carga el checkpoint original, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion de forward pass, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Validacion de contratos de integracion con frameworks (directorio `integrations/transformers/expectations`).
- Verificacion de compatibilidad de tokenizador y configuracion de generacion contra el modelo base.
- Pruebas de sensibilidad de entrada (input-sensitivity gate) para detectar regresiones en el pipeline de integracion.
- No genera texto coherente: los pesos son aleatorios y no ha habido entrenamiento.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional.
- Capacidades multilingues: no disponibles (el tokenizador es el del base, pero el modelo no produce salida util).

## Casos de uso

- Pruebas de integracion en CI: ejecutar la suite de `transformers-mic` contra un checkpoint de 3,2 M de parametros en lugar de los 2 B del original, reduciendo tiempo de descarga y coste de computo por job.
- Validacion de contratos de framework: comprobar que una nueva version de Transformers sigue cargando `GraniteForCausalLM` con los mismos nombres de tensores y el mismo comportamiento de forward.
- Regresion de tokenizador: al copiarse los ficheros de procesador byte a byte, cualquier cambio en `tokenizer.json`, `merges.txt` o `special_tokens_map.json` del base puede detectarse comparando hashes contra este fixture.
- Gate de sensibilidad de entrada: usar las perturbaciones documentadas (`attention_mask:all_ones` con umbral 0,00208) como test automatico de que el modelo responde a cambios en las entradas del contrato.
- Verificacion de dtypes: comprobar que un pipeline de inferencia o entrenamiento produce valores finitos en float32, bfloat16 y float16 antes de escalar al modelo real.
- Desarrollo de tooling de fixtures: servir como ejemplo reproducible de como reducir un checkpoint grande a un artefacto de prueba manteniendo arquitectura y tokenizador, segun `build_fixtures.py`.
- Pruebas de carga y serializacion: validar rutas de carga de safetensors, mapeo de config y gestion de `generation_config.json` sin consumir VRAM significativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba y no un modelo usable, por lo que no aplica evaluacion de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa 0,0 GB en el repositorio (3,2 M de parametros en bfloat16, aproximadamente 6,4 MB de pesos).
- GPU recomendadas: cualquier GPU consumer o incluso CPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) y en CPU.
- Opciones de despliegue: Transformers (ruta principal, con el contrato documentado en `integrations/transformers/usage.md`); llama.cpp, Ollama, vLLM y TGI no estan documentados para este artefacto y no se garantiza su compatibilidad.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es despreciable frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/granite-3.1-2b-instruct-mic` | 3,2 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `ibm-granite/granite-3.1-2b-instruct` | 2 B (aproximado, segun nombre) | no disponible en esta ficha | Modelo instructivo real | no disponible en esta ficha | Hugging Face |
| Fixtures equivalentes de otras familias en `transformers-mic` | variable | no disponible | Fixture de pruebas | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: misma arquitectura y tokenizador, pero 625 veces menos parametros (3,2 M frente a 2 B aproximados) y sin entrenamiento. Frente a otros fixtures del mismo proyecto, la diferencia esta en la familia de modelo cubierta (Granite) y en la clave de fixture `2731c71ceeb8`, que agrupa checkpoints con procesador identico y config coincidente tras la reduccion.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sesgos conocidos: no aplica, al no haber entrenamiento; cualquier sesgo proviene unicamente del tokenizador heredado del base.
- Riesgo de alucinacion: total, en el sentido de que toda la salida es ruido estadistico sin relacion con la entrada.
- Limitaciones de contexto e idioma: no verificadas en este artefacto; dependen de la config heredada del base y no se documentan aqui.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; verificar la del modelo base antes de cualquier uso derivado.
- Caveat para produccion: el fixture solo cubre checkpoints cuyo procesador sea byte-identico y cuya config coincida tras la reduccion (clave `2731c71ceeb8`); no sirve para validar diferencias entre checkpoints de la familia.
- Los ficheros `integration.json`, `build.json` y el directorio `integrations/` forman parte del contrato; reconstruirlos con `python example/build_fixtures.py --fixture granite-3.1-2b-instruct-mic` si se modifican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/granite-3.1-2b-instruct-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-2b-instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-3.1-2b-instruct-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
