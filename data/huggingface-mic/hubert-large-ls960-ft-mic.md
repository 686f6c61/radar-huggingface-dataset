# huggingface-mic/hubert-large-ls960-ft-mic

## Resumen

`hubert-large-ls960-ft-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, no un modelo de reconocimiento de voz utilizable. Se trata de una version "slim" (reducida) del checkpoint `facebook/hubert-large-ls960-ft`, un modelo HuBERT para reconocimiento de voz CTC. El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y las expectativas de framework en un unico lugar, con el objetivo de servir como fixture de integracion continua.

La model card es explicita: "It is a test artifact, not a usable model, tagged `test-artifact` to keep it out of candidate-model search". El modelo conserva la arquitectura `HubertForCTC` pero con la configuracion reducida a 2 capas ocultas (frente a las 24 del checkpoint original), y los pesos se han sobreajustado deliberadamente al paso de entrenamiento del contrato (350 pasos) para que superen las puertas de sensibilidad de entrada.

Por tanto, esta ficha documenta un artefacto de ingenieria, no un modelo de produccion. Cualquier evaluacion de capacidades ASR, benchmarks o requisitos de hardware debe remitirse al modelo base `facebook/hubert-large-ls960-ft`, del que este repositorio solo copia los ficheros de procesador byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT (transformer convolucional + encoder), cabeza `HubertForCTC` |
| Parametros totales | 44.992 (segun safetensors; el modelo base tiene ~317 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio; ventana tipica de HuBERT ~10 s a 16 kHz, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finite en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo base esta entrenado en ingles, LibriSpeech, pero no se confirma en la informacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | facebook/hubert-large-ls960-ft |
| Capas ocultas | 2 (reducido desde 24) |
| Fixture key | 063534a7de8e |
| Pasos de sobreajuste | 350 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura HuBERT: un extractor de caracteristicas convolucional seguido de un encoder transformer que produce representaciones ocultas, sobre las que se aplica una cabeza CTC (`HubertForCTC`) para transcripcion de voz. En esta version "slim", el encoder se ha reducido a 2 capas ocultas mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, manteniendo los mismos nombres de tensor que el checkpoint real.

No hay entrenamiento en el sentido habitual: los pesos se han sobreajustado al paso de entrenamiento del contrato (350 pasos) para superar la puerta de sensibilidad de entrada. Con pesos aleatorios, la perturbacion `input_values:halve` solo movia los logits 8.8e-06 (umbral 0.001), por lo que se opto por este sobreajuste controlado. Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `facebook/hubert-large-ls960-ft`. No se documentan datos de entrenamiento, RLHF ni innovaciones tecnicas mas alla del proceso de reduccion.

## Capacidades

- No es un modelo utilizable: la model card lo declara explicitamente "test artifact, not a usable model".
- Conserva la interfaz de `HubertForCTC` (entrada de audio, salida de logits CTC), pero con 2 capas ocultas y pesos sobreajustados.
- Los ficheros de procesador son identicos a los del checkpoint base, por lo que el preprocesado de audio es el mismo.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni multilingues.
- Sirve como fixture para validar integraciones de Transformers (uso ejecutable y expectativas de framework incluidas en el repo).
- Compatible con float32, bfloat16 y float16 en forward, loss y gradientes.

## Casos de uso

- Pruebas de integracion en CI: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` y `integrations/transformers/expectations`, pensados para validar que una integracion de Transformers carga y ejecuta `HubertForCTC` correctamente.
- Validacion de pipelines de audio: al copiar los ficheros de procesador del modelo base, permite comprobar el preprocesado (feature extractor, tokenizer) sin descargar el checkpoint completo.
- Desarrollo de herramientas de reduccion de modelos: el enlace "How the fixture was shrunk" documenta el proceso de `sweep.py`, util para quien construya sus propios fixtures.
- Verificacion de compatibilidad de dtypes: sirve para comprobar que una implementacion maneja float32, bfloat16 y float16 sin NaN ni infinitos.
- Reproducibilidad de contratos: `build.json` registra fuentes fijadas, resultados de puertas y hashes de ficheros, util para auditoria de builds.
- Formacion y demos de testing: ejemplo didactico de como empaquetar pesos, uso y expectativas en un unico repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un artefacto de prueba con 2 capas y pesos sobreajustados, cualquier metrica ASR (WER, CER) careceria de sentido; debe consultarse el modelo base `facebook/hubert-large-ls960-ft` para rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 44.992 parametros en float32 el peso es de decenas de KB, por lo que cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no aplica para uso real; para ejecutar el fixture basta CPU.
- Cabe en consumer GPU: si, en cualquier GPU (incluso integradas) y en CPU.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio CTC).
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubert-large-ls960-ft-mic | 44.992 | no disponible | Fixture de test (HubertForCTC) | no disponible | Hugging Face |
| facebook/hubert-large-ls960-ft | ~317 M | no disponible | ASR CTC (LibriSpeech) | no disponible en la informacion | Hugging Face |
| facebook/hubert-large-ls960 | ~317 M | no disponible | Preentrenamiento HuBERT | no disponible en la informacion | Hugging Face |
| facebook/wav2vec2-large-960h | ~317 M | no disponible | ASR CTC | no disponible en la informacion | Hugging Face |

La comparativa es orientativa: el modelo documentado no es funcional para ASR, mientras que los alternativos si lo son. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo etiqueta como `test-artifact` y advierte que no debe usarse como modelo.
- Pesos sobreajustados a 350 pasos y con solo 2 capas ocultas: la salida no tiene valor semantico para transcripcion.
- Sesgos: no documentados; al no ser funcional, no aplica evaluacion de sesgos.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero la salida CTC no es fiable.
- Limitaciones de contexto o idioma: no disponibles; el modelo base es ingles (LibriSpeech), pero no se confirma en la informacion.
- Licencia no disponible: no se puede confirmar uso comercial; el modelo base tambien aparece sin licencia en la informacion.
- Caveat de produccion: no desplegar; usar solo en entornos de test/CI. Para ASR real, emplear `facebook/hubert-large-ls960-ft` o alternativas equivalentes.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic
- Modelo base: https://huggingface.co/facebook/hubert-large-ls960-ft
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/hubert-large-ls960-ft-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: `integration.json` (en el repo)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
