# huggingface-mic/bigbird-pegasus-large-arxiv-mic

## Resumen

`huggingface-mic/bigbird-pegasus-large-arxiv-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` como parte de un trabajo de cobertura de integraciones de frameworks (MIC). No es un modelo entrenado ni utilizable para inferencia real: es una version reducida del checkpoint `google/bigbird-pegasus-large-arxiv` con la misma arquitectura (`BigBirdPegasusForConditionalGeneration`) pero con un configuracion mucho mas pequena (2 capas de encoder y 2 de decoder) y pesos aleatorios generados con semilla 17.

Su unico proposito es servir como fixture reproducible para validar contratos de integracion con Transformers: mismos nombres de tensores que el checkpoint real, mismos ficheros de procesador copiados byte a byte, y comportamiento finito en float32, bfloat16 y float16. El repositorio incluye manifiesto de contrato (`integration.json`), guia de uso de Transformers, expectativas del framework y procedencia de la build (`build.json`).

Con 6.937.127 parametros y 0.1 GB de tamano, la relevancia de este repositorio es exclusivamente de ingenieria de software: permite a los mantenedores de Transformers y frameworks derivados comprobar que sus pipelines de carga, tokenizacion y forward pass funcionan contra la arquitectura BigBirdPegasus sin descargar ni ejecutar el modelo real de ~570M parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BigBirdPegasus (transformer encoder-decoder, atencion sparse tipo BigBird + PEGASUS) |
| Parametros totales | 6.937.127 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del config reducido; el modelo base soporta hasta 4096 tokens) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificados finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `BigBirdPegasusForConditionalGeneration`, un transformer encoder-decoder que combina la atencion sparse de BigBird (bloques locales, globales y aleatorios) con el preentrenamiento tipo PEGASUS (gap-sentence generation) orientado a resumen abstractivo de documentos largos. En este fixture, el config se ha reducido mediante la regla generica de `sweep.py` a 2 capas de encoder y 2 de decoder, manteniendo los nombres de tensores identicos a los del checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con un gate de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, mueve 0.0079). Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `google/bigbird-pegasus-large-arxiv`. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuyo config coincide tras el shrink (fixture key `2653b6dc7b72`).

## Capacidades

- No es un modelo funcional: no genera resumenes ni texto coherente, ya que sus pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de `BigBirdPegasusForConditionalGeneration` en Transformers.
- Verifica la compatibilidad del tokenizador SentencePiece (`spiece.model`) y del `generation_config.json` copiados del modelo base.
- Permite comprobar forward pass, calculo de loss y gradientes en float32, bfloat16 y float16.
- Valida el contrato de entradas (incluido `attention_mask`) mediante el gate de sensibilidad.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponible (dependen del tokenizador heredado, no evaluadas).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForSeq2SeqLM` y `AutoTokenizer` para verificar que la arquitectura BigBirdPegasus se instancia correctamente sin descargar el checkpoint real de ~570M parametros.
- CI/CD de frameworks derivados: usar el fixture en tests automatizados de pipelines de resumen para detectar regresiones en la carga de safetensors, en el mapeo de nombres de tensores o en el manejo del tokenizador.
- Validacion de contratos de entrada/salida: comprobar que perturbaciones en `attention_mask`, `input_ids` y `decoder_input_ids` producen cambios medibles en los logits, tal como exige el gate documentado en `build.json`.
- Pruebas de precision numerica: verificar que el forward, la loss y los gradientes permanecen finitos en float32, bfloat16 y float16 antes de ejecutar la misma bateria contra el modelo real.
- Desarrollo de herramientas de inspeccion de modelos: dado su tamano reducido (0.1 GB) y sus 6.9M parametros, es adecuado para probar visores de arquitectura, analisis de shapes o utilidades de perfilado sin coste de GPU.
- Reproducibilidad de fixtures: servir como referencia para reconstruir el artefacto con `python example/build_fixtures.py --fixture bigbird-pegasus-large-arxiv-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (ROUGE, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6.9M parametros, ~28 MB de pesos); el repositorio completo ocupa 0.1 GB.
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, etc.) y en CPU.
- Opciones de despliegue: Transformers con PyTorch (ruta documentada en `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/bigbird-pegasus-large-arxiv-mic` | 6.937.127 | no disponible (config reducido) | Fixture de test | no disponible | Hugging Face |
| `google/bigbird-pegasus-large-arxiv` | ~570M (modelo base) | hasta 4096 tokens | Resumen abstractivo de articulos cientificos | Apache 2.0 (segun el modelo base) | Hugging Face |
| `google/pegasus-large` | ~570M | 1024 tokens | Resumen abstractivo generico | Apache 2.0 | Hugging Face |

La comparacion con el modelo base es la mas relevante: misma arquitectura y mismos nombres de tensores, pero con 2 capas por bloque y pesos aleatorios, lo que lo hace apto solo para tests de integracion.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene valor semantico. La propia model card lo etiqueta como `test-artifact`.
- No debe usarse en produccion ni para evaluar calidad, sesgos o alucinacion: cualquier metrica de ese tipo seria invalida.
- La licencia no esta declarada en la informacion proporcionada; verificar antes de cualquier redistribucion.
- Los idiomas soportados no estan declarados; el tokenizador heredado del modelo base condiciona el comportamiento, pero no se ha evaluado.
- El contexto efectivo depende del config reducido y no se ha documentado; no asumir los 4096 tokens del modelo base sin verificar el `config.json`.
- El checkpoint real asociado (`google/bigbird-pegasus-large-arxiv`) tiene todos los parametros; este fixture solo reproduce la estructura, no el conocimiento.
- No se documenta soporte para cuantizacion mas alla de la verificacion de finitud en bfloat16 y float16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/bigbird-pegasus-large-arxiv-mic
- Modelo base: https://huggingface.co/google/bigbird-pegasus-large-arxiv
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia de la build: `build.json` (en el repositorio)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bigbird-pegasus-large-arxiv-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
