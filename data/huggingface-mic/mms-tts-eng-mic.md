# huggingface-mic/mms-tts-eng-mic

## Resumen

`mms-tts-eng-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version reducida y con pesos aleatorios del modelo de sintesis de voz `facebook/mms-tts-eng` de Meta, parte de la familia MMS (Massively Multilingual Speech). El repositorio empaqueta pesos "slim", ejemplos de uso ejecutables y las expectativas de integracion con frameworks en un unico lugar.

El modelo cubre la arquitectura `VitsModel` (VITS, text-to-speech extremo a extremo) pero con una configuracion reducida a `num_hidden_layers=2` y 15.610.576 parametros totales, frente al checkpoint original completo de MMS-TTS. Los pesos se generaron con semilla 17 y no han sido entrenados: pasaron una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato movia los logits al menos 0,001), lo que basta para validar rutas de codigo, no para generar audio inteligible.

Su relevancia es puramente de ingenieria: sirve para probar integraciones de Transformers y pipelines de TTS sin descargar el checkpoint completo, manteniendo los mismos nombres de tensores, los ficheros de procesador copiados byte a byte y compatibilidad numerica en float32, bfloat16 y float16. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (`VitsModel`), text-to-speech extremo a extremo |
| Parametros totales | 15.610.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificado finito en float32, bfloat16 y float16 |
| Idiomas soportados | ingles (heredado de `facebook/mms-tts-eng`; no declarado explicitamente en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujo normalizador y un discriminador adversarial en entrenamiento. En este repositorio la configuracion se ha reducido mediante la regla generica de `sweep.py` del proyecto `transformers-mic` a `num_hidden_layers=2`, manteniendo los mismos nombres de tensores que el checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y unicamente superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazaba los logits al menos 0,001. Los ficheros de procesador (`special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `facebook/mms-tts-eng`. El artefacto se guarda en float32, el dtype con el que carga por defecto el modelo base, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No genera voz utilizable: los pesos son aleatorios y el modelo esta etiquetado como `test-artifact`.
- Sirve como fixture para validar la carga de `VitsModel` en Transformers con la configuracion reducida.
- Permite comprobar contratos de integracion: manifiesto `integration.json`, uso en Transformers y directorio de expectativas.
- Valida rutas de forward, calculo de loss y retropropagacion (gradientes finitos en tres dtypes).
- Verifica la compatibilidad de los ficheros de procesador copiados del modelo original.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision.
- No es multilingue mas alla de lo heredado del modelo base en ingles.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para validar que un pipeline de Transformers carga `VitsModel` y ejecuta forward sin descargar el checkpoint completo de MMS-TTS.
- Desarrollo de wrappers de TTS: comprobar la forma de las salidas y el contrato de entradas antes de conectar el modelo real `facebook/mms-tts-eng`.
- Validacion de compatibilidad de dtypes: ejecutar forward y backward en float32, bfloat16 y float16 para detectar problemas numericos en el codigo de integracion.
- Verificacion de ficheros de procesador: confirmar que el tokenizer y el vocabulario copiados byte a byte se cargan correctamente en la ruta de inferencia.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture mms-tts-eng-mic` y comparar hashes registrados en `build.json`.
- Pruebas de empaquetado y distribucion: ejercitar la descarga desde el Hub y la resolucion de rutas en un repo de 0,1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para 15,6 M de parametros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1 GB de memoria es suficiente para pruebas.
- Cabe en GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y tambien en CPU.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture con pesos aleatorios, las cifras no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mms-tts-eng-mic` | 15,6 M | VITS reducido (2 capas) | Fixture de pruebas | no disponible | Hugging Face |
| `facebook/mms-tts-eng` | no disponible en la informacion | VITS | TTS en ingles real | no disponible en la informacion | Hugging Face |
| Otros fixtures `*-mic` del proyecto `transformers-mic` | variable | variable | Pruebas de integracion | no disponible | Hugging Face |

## Limitaciones y advertencias

- Pesos aleatorios: el audio generado no sera inteligible; no debe usarse para inferencia real.
- Etiquetado `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Configuracion reducida a 2 capas: el comportamiento no replica el del checkpoint completo.
- Licencia no declarada: no hay garantia de uso comercial; hay que consultar la licencia de `facebook/mms-tts-eng`.
- Idiomas no declarados en la model card; el unico idioma heredado es el ingles del modelo base.
- Sin datos de benchmarks ni de rendimiento; cualquier cifra de calidad seria inventada.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mms-tts-eng-mic
- Modelo base: https://huggingface.co/facebook/mms-tts-eng
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mms-tts-eng-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
