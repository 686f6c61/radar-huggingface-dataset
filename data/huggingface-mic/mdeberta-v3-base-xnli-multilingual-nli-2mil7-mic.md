# huggingface-mic/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic

## Resumen

`mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` a partir del modelo `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`. No es un modelo utilizable en producción: la propia model card lo etiqueta explícitamente como `test-artifact` y advierte de que se trata de una versión "slim" (reducida) pensada para validar contratos de integración con frameworks (Transformers, entre otros), no para inferencia real.

El modelo original sobre el que se basa es un DeBERTa-v2 multilingüe afinado para clasificación de secuencias (inferencia de lenguaje natural, XNLI). Este fixture conserva la misma arquitectura (`DebertaV2ForSequenceClassification`) y los nombres de tensores del checkpoint real, pero reduce la configuración a 2 capas ocultas y sobreajusta los pesos al paso de entrenamiento definido en el contrato (30 pasos). El resultado es un checkpoint de 16.168.323 parámetros (frente a los ~278M del mDeBERTa-v3-base original), guardado en float16 y con un tamaño de repositorio de 0,1 GB.

Su relevancia es puramente de ingeniería: sirve como pieza de verificación reproducible para pipelines que necesitan comprobar que cargan correctamente un modelo de clasificación de secuencias multilingüe, que respetan los nombres de tensores y que gestionan los ficheros de procesador (tokenizer, `spm.model`, etc.) copiados byte a byte del checkpoint original. Cualquier uso como modelo de clasificación real produciría resultados sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (`DebertaV2ForSequenceClassification`), transformer encoder |
| Parametros totales | 16.168.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible (hereda el tokenizer multilingüe del modelo base) |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero la licencia no se declara en los metadatos) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v2 configurado para clasificación de secuencias (`DebertaV2ForSequenceClassification`). Respecto al checkpoint original, la configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los nombres de los tensores coinciden con los del checkpoint real, de modo que el fixture puede sustituirlo en pruebas de carga sin cambiar el código de integración.

No se ha entrenado en el sentido habitual: los pesos se sobreajustan al paso de entrenamiento definido en el contrato (30 pasos). La model card indica que los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`attention_mask:all_ones` movía los logits solo 4,6e-05, por debajo del umbral de 0,001), por lo que se optó por este sobreajuste. Los ficheros de procesador (`LICENSE`, `added_tokens.json`, `special_tokens_map.json`, `spm.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`. El modelo se ha verificado como finito en float32, bfloat16 y float16 (forward, loss y gradientes). No se dispone de información sobre datos de entrenamiento, número de tokens ni técnicas de alineación (RLHF/DPO) para este fixture.

## Capacidades

- Carga como `DebertaV2ForSequenceClassification` en Transformers con los mismos nombres de tensores que el checkpoint real.
- Ejecución de forward, cálculo de loss y retropropagación de gradientes en float32, bfloat16 y float16.
- Verificación de contratos de integración: manifiesto (`integration.json`), uso en Transformers (`integrations/transformers/usage.md`) y expectativas del framework (`integrations/transformers/expectations`).
- Comprobación de la sensibilidad a la entrada mediante la puerta `attention_mask:all_ones`.
- Uso del tokenizer multilingüe heredado del modelo base (SentencePiece, `spm.model`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo de generación de texto: es un clasificador de secuencias.

## Casos de uso

- Pruebas de integración en CI/CD: el fixture permite comprobar que un pipeline carga un `DebertaV2ForSequenceClassification` con los nombres de tensores esperados sin descargar los ~278M de parámetros del modelo real.
- Validación de contratos de framework: los directorios `integrations/transformers/usage.md` y `integrations/transformers/expectations` permiten verificar que la implementación del framework cumple las expectativas declaradas.
- Pruebas de compatibilidad de tokenizer: al copiar byte a byte `tokenizer.json`, `spm.model` y `special_tokens_map.json`, sirve para validar la carga del procesador multilingüe sin depender del checkpoint completo.
- Verificación de estabilidad numérica: al ser finito en float32, bfloat16 y float16, se puede usar para probar rutas de mixed precision en forward, loss y gradientes.
- Pruebas de sensibilidad a la entrada: la puerta `attention_mask:all_ones` (con umbral 0,001) permite validar que un cambio en la máscara de atención produce una variación de logits medible.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic`.
- Pruebas de regresión en el cargador de modelos: al tener un tamaño de 0,1 GB, se puede incluir en suites de test que necesitan un checkpoint realista pero ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de XNLI ni de ninguna otra tarea; además, al ser un fixture sobreajustado a 30 pasos, sus salidas no son representativas del rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (16,2M de parámetros); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida suficiente.
- Opciones de despliegue: Transformers (ruta principal, según `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic` (este) | 16,2M | no disponible | Fixture de clasificación de secuencias | no disponible | Hugging Face |
| `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` | ~278M (no confirmado en la información disponible) | no disponible | Clasificación de secuencias (XNLI multilingüe) | no disponible | Hugging Face |
| `microsoft/deberta-v3-base` | no disponible | no disponible | Encoder base DeBERTa-v3 | MIT (según el modelo original de Microsoft; no confirmado en la información disponible) | Hugging Face |

La comparativa se limita al modelo base del que deriva el fixture, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un `test-artifact` explícitamente etiquetado para quedar fuera de la búsqueda de modelos candidatos; no debe usarse en producción.
- Los pesos están sobreajustados a 30 pasos de entrenamiento; las salidas no tienen significado semántico.
- La configuración está reducida a 2 capas ocultas, por lo que no reproduce el comportamiento del mDeBERTa-v3-base original.
- La licencia no está declarada en los metadatos; el fichero `LICENSE` se copia del modelo base, pero se desconoce si permite uso comercial.
- No se declaran idiomas soportados en los metadatos, aunque el tokenizer heredado es multilingüe.
- No hay información sobre sesgos, alucinación o limitaciones de contexto, al no ser un modelo generativo.
- Riesgo de confusión: el nombre incluye "xnli" y "multilingual", lo que puede llevar a usarlo erróneamente como clasificador NLI real.
- Para producción debe usarse el checkpoint original `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-mic.html
