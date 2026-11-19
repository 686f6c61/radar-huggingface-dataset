# huggingface-mic/mbart-large-50-mic

## Resumen

`huggingface-mic/mbart-large-50-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para validar su infraestructura de contratos y expectativas de integración con Transformers. No es un modelo entrenado ni utilizable para traducción: se trata de una versión reducida artificialmente del checkpoint `facebook/mbart-large-50`, con solo 16,55 millones de parámetros frente a los aproximadamente 610 millones del modelo original. Sus pesos son aleatorios (semilla 17) y su propósito es servir como objetivo de pruebas reproducible.

El repositorio empaqueta pesos reducidos, uso ejecutable y expectativas de framework en un único lugar, con un manifiesto de contrato (`integration.json`), un registro de procedencia (`build.json`) y documentación de uso para Transformers. La arquitectura es idéntica a la del modelo base (`MBartForConditionalGeneration`), pero con solo 2 capas de encoder y 2 de decoder, lo que lo convierte en un sustituto ligero para tests de CI sin necesidad de descargar ni ejecutar el modelo completo.

Es relevante únicamente en el contexto de ingeniería de software: permite a los mantenedores de Transformers y de frameworks derivados verificar que su código carga, ejecuta y valida modelos mBART sin consumir recursos significativos. La etiqueta `test-artifact` está pensada explícitamente para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MBartForConditionalGeneration), 2 capas de encoder y 2 de decoder |
| Parametros totales | 16.552.774 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible (el modelo base mBART-50 soporta 50 idiomas, pero el fixture no se ha entrenado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/mbart-large-50 |
| Dtype de carga por defecto | float32 |
| Semilla de pesos | 17 (pesos aleatorios) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo `facebook/mbart-large-50` (`MBartForConditionalGeneration`), pero con la configuración reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: 2 capas de encoder y 2 capas de decoder. Los archivos del procesador (`generation_config.json`, `sentencepiece.bpe.model`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que el tokenizador y la configuración de generación son idénticos a los del modelo real.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, mueve 0,00499). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `2a8018f58464` agrupa todos los checkpoints cuyos archivos de procesador son idénticos byte a byte y cuya configuración coincide tras el reducido.

## Capacidades

- Carga y ejecución con `MBartForConditionalGeneration` de Transformers, con los mismos nombres de tensor que el modelo base.
- Tokenización idéntica a `facebook/mbart-large-50` mediante el `sentencepiece.bpe.model` copiado.
- Ejecución en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Sirve como objetivo de pruebas para validar contratos de integración y expectativas de framework.
- No traduce, no genera texto coherente ni razona: los pesos son aleatorios.
- No soporta tool calling, agentes, visión ni audio.
- No tiene capacidades multilingües reales a pesar de heredar el tokenizador del modelo base.

## Casos de uso

- Pruebas de integración en CI de Transformers: el fixture permite ejecutar el pipeline de carga y forward de mBART en segundos y con 0,1 GB de descarga, sin necesidad del checkpoint completo de 610 M de parámetros.
- Validación de contratos de framework: `integration.json` y el directorio `integrations/transformers/expectations` definen las salidas esperadas; el fixture actúa como oráculo reproducible para detectar regresiones en la API.
- Verificación de compatibilidad de dtypes: permite comprobar que el código de carga y ejecución funciona en float32, bfloat16 y float16 sin errores numéricos.
- Pruebas de tokenizador y procesador: al copiar byte a byte los archivos del procesador del modelo real, sirve para validar la integración del tokenizador SentencePiece de mBART-50.
- Desarrollo de herramientas de reducción de modelos: el repositorio documenta el proceso de `sweep.py` y `build_fixtures.py`, útil para quien quiera replicar la técnica en otros checkpoints.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de archivos, lo que permite reconstruir el fixture de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no está pensado para evaluación de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,55 M de parámetros, aproximadamente 66 MB de pesos) y aún menos en float16 o bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (vía `MBartForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la latencia es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mbart-large-50-mic | 16,55 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| facebook/mbart-large-50 | ~610 M | 1024 tokens (estándar mBART) | Traducción multilingüe | MIT | Hugging Face |
| facebook/mbart-large-50-many-to-many-mmt | ~610 M | 1024 tokens (estándar mBART) | Traducción multilingüe fine-tuneada | MIT | Hugging Face |
| facebook/mbart-large-50-one-to-many-mmt | ~610 M | 1024 tokens (estándar mBART) | Traducción multilingüe fine-tuneada | MIT | Hugging Face |

La comparación con los checkpoints originales de mBART-50 es solo estructural: el fixture comparte arquitectura y procesador, pero no pesos entrenados ni capacidad de traducción. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no produce traducciones ni texto coherente.
- Es un artefacto de prueba etiquetado `test-artifact`; no debe usarse en producción ni como modelo candidato.
- La licencia no está especificada en la información disponible; conviene consultar el repositorio antes de cualquier uso.
- No se declaran idiomas soportados ni pipeline; hereda el tokenizador de mBART-50 pero no su capacidad multilingüe.
- El tamaño reducido (2+2 capas) implica que su comportamiento numérico no representa al modelo completo.
- Riesgo de confusión: el nombre `mbart-large-50-mic` puede llevar a pensar que es un fine-tune utilizable; la model card aclara explícitamente lo contrario.
- Para reconstruir archivos no incluidos hay que ejecutar `python example/build_fixtures.py --fixture mbart-large-50-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mbart-large-50-mic
- Modelo base: https://huggingface.co/facebook/mbart-large-50
- Documentación de uso en Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Manifiesto de contrato: `integration.json` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mbart-large-50-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
