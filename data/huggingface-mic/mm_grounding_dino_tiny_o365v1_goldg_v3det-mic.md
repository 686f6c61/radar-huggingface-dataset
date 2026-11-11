# huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic

## Resumen

`huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face bajo la organizacion `huggingface-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida y con pesos aleatorios del checkpoint `openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det`, pensada para validar contratos de integracion en el ecosistema Transformers.

El modelo replica la arquitectura `MMGroundingDinoForObjectDetection` (deteccion de objetos zero-shot multimodal) pero con una configuracion drasticamente reducida: 2 capas de encoder, 2 de decoder, 2 capas en el backbone y 2 capas ocultas en el codificador de texto. El resultado son 7.722.970 parametros, muy lejos del modelo original que cubre.

Su relevancia es puramente instrumental: sirve como fixture de test para verificar que los pipelines de integracion (procesadores, tokenizadores, expectativas de framework) funcionan correctamente sin necesidad de descargar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM Grounding DINO (detector de objetos zero-shot multimodal, transformer encoder-decoder con backbone visual y encoder de texto) |
| Parametros totales | 7.722.970 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MM Grounding DINO, un detector de objetos zero-shot que combina un backbone visual con un transformer encoder-decoder y un codificador de texto, permitiendo detectar objetos descritos mediante lenguaje natural. El fixture mantiene los mismos nombres de tensor que el checkpoint real y la misma clase `MMGroundingDinoForObjectDetection`, pero con la configuracion reducida indicada (encoder_layers 2, decoder_layers 2, backbone num_layers 2, text num_hidden_layers 2).

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, `pixel_values:halve`, produce 1.75). Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde el checkpoint original. El fixture se genero con `build_fixtures.py` y se documento en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no realiza deteccion de objetos real ni produce salidas semanticamente utiles.
- Replica la interfaz de `MMGroundingDinoForObjectDetection`, por lo que sirve para validar la carga del modelo y el flujo forward a nivel de API.
- Incluye los ficheros de procesador y tokenizador del checkpoint original, utiles para probar pipelines de preprocesado de imagen y texto.
- Soporta ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de tool calling, capacidades de agente, razonamiento multietapa ni generacion de texto.
- No dispone de capacidades multilingues declaradas.

## Casos de uso

- Pruebas de integracion en Transformers: verificar que la clase `MMGroundingDinoForObjectDetection` carga correctamente un checkpoint con la configuracion esperada sin descargar el modelo completo.
- Validacion de contratos de framework: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` e `integrations/transformers/expectations`, pensados para comprobar que el pipeline de inferencia se comporta segun lo esperado.
- CI/CD de librerias: usar el fixture como dependencia ligera (repo de 0.0 GB) en tests automatizados que necesiten un modelo de deteccion zero-shot sin coste de descarga ni GPU.
- Pruebas de preprocesado: los ficheros de procesador copiados byte a byte permiten validar transformaciones de imagen y tokenizacion de texto contra el checkpoint real.
- Verificacion de dtypes: comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mm_grounding_dino_tiny_o365v1_goldg_v3det-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (7.7M parametros), aunque el modelo no produce salidas utiles.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (es el framework objetivo del fixture); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Proposito | Licencia |
|---|---|---|---|---|
| `huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic` | 7.722.970 | Fixture de test | Validacion de integracion | no disponible |
| `openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det` | no disponible | Modelo real | Deteccion de objetos zero-shot | no disponible |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce detecciones utiles ni salidas con significado.
- Esta etiquetado como `test-artifact` y no debe usarse en produccion ni como modelo candidato en busquedas.
- La configuracion esta reducida (2 capas por modulo), por lo que su comportamiento no representa al checkpoint original.
- No se declara licencia, idiomas soportados ni pipeline en la informacion disponible; verificar antes de cualquier uso.
- El repositorio tiene un tamano de 0.0 GB, coherente con su naturaleza de fixture ligero.
- No se han publicado benchmarks ni metricas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic
- Modelo base: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det
- Repositorio de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic.html
