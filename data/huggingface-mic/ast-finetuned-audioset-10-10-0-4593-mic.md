# huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic

## Resumen

`huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic` es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable en produccion. Deriva del checkpoint real `MIT/ast-finetuned-audioset-10-10-0.4593`, un Audio Spectrogram Transformer (AST) entrenado para clasificacion de eventos sonoros sobre AudioSet. El repositorio contiene pesos reducidos (slim weights), ejemplos de uso ejecutables y expectativas de framework en un unico paquete, con el objetivo de validar la integracion del modelo base en distintas herramientas.

El fixture mantiene la arquitectura `ASTForAudioClassification` pero con una configuracion encogida: 2 capas de transformer en lugar de las del checkpoint original, y solo 195.727 parametros totales (aproximadamente 0,2 M). Los pesos son aleatorios (semilla 17) y no han sido entrenados; superaron una puerta de sensibilidad a la entrada segun la model card, pero no representan ningun conocimiento acustico real. Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte desde el modelo base.

Su relevancia es, por tanto, exclusivamente de ingenieria: sirve como caso de prueba reproducible para pipelines de integracion de modelos de audio en Transformers, con nombres de tensores identicos al checkpoint real y estabilidad numerica verificada en float32, bfloat16 y float16. Cualquier evaluacion de calidad de clasificacion acustica debe hacerse sobre el modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), clase `ASTForAudioClassification`, configuracion reducida a 2 capas |
| Parametros totales | 195.727 (aprox. 0,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio, no generativo) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con forward, loss y gradientes finitos tambien en bfloat16 y float16 |
| Idiomas soportados | no disponibles (clasificacion de eventos sonoros, no procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un Audio Spectrogram Transformer: un transformer que opera sobre parches de espectrogramas log-mel en lugar de tokens de texto, usado para clasificacion multi-clase de eventos sonoros (AudioSet, 527 clases en el checkpoint original). El fixture conserva la clase `ASTForAudioClassification` y los mismos nombres de tensores que el checkpoint real, pero reduce `num_hidden_layers` a 2 mediante una regla generica de reduccion implementada en `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (caso mas debil: `input_values:reverse`, 0,00487). El fixture esta identificado por la clave `2e1aaae788f4` y cubre todos los checkpoints con ficheros de procesador identicos byte a byte y config coincidente tras la reduccion. Los detalles de procedencia, hashes de ficheros y resultados de las puertas de validacion estan registrados en `build.json`.

## Capacidades

- Clasificacion de eventos sonoros (audio tagging): la cabeza `ASTForAudioClassification` produce logits sobre las clases del modelo base.
- Ejecucion en Transformers con los mismos nombres de tensores que el checkpoint real, lo que permite validar cargas, shapes y dtypes.
- Estabilidad numerica verificada en float32, bfloat16 y float16 para forward, loss y gradientes.
- Uso como fixture de test: no esta pensado para inferencia con calidad, tool calling, agentes, generacion de texto, vision ni capacidades multilingues.
- No dispone de modo thinking, tool calling, function calling ni soporte de agentes.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `ASTForAudioClassification` para verificar que el pipeline de audio clasificacion acepta la configuracion y los tensores esperados antes de apuntar al checkpoint real.
- Validacion de compatibilidad de dtypes: comprobar que forward, loss y backward producen valores finitos en float32, bfloat16 y float16 en entornos de entrenamiento mixto.
- Test de regresion de procesadores: al copiar `preprocessor_config.json` byte a byte del modelo base, permite detectar cambios incompatibles en el preprocesado de espectrogramas entre versiones de Transformers.
- CI de librerias de terceros: usar el fixture como caso ligero (0,2 M parametros, repositorio de 0,0 GB) para tests automatizados sin descargar el checkpoint completo.
- Verificacion de contratos de integracion: consumir `integration.json` e `integrations/transformers/expectations` para validar que una implementacion cumple las expectativas declaradas por el autor.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture ast-finetuned-audioset-10-10-0.4593-mic` y comparar hashes con `build.json`.
- Deteccion de sensibilidad a la entrada: replicar las perturbaciones del contrato (por ejemplo `input_values:reverse`) para comprobar que los logits se mueven por encima del umbral de 0,001.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la puerta de sensibilidad a la entrada: todas las perturbaciones del contrato desplazan los logits al menos 0,001, con minimo de 0,00487 en `input_values:reverse`. No hay metricas de precision, recall, mAP ni accuracy sobre AudioSet para este fixture, y al tratarse de pesos aleatorios no tendria sentido medirlas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 195.727 parametros en float32 el peso de los tensores es de aproximadamente 0,8 MB, mas activaciones y buffers del procesador de audio.
- GPU recomendadas: cualquier GPU consumer basta; el fixture cabe en CPU. Para el checkpoint real `MIT/ast-finetuned-audioset-10-10-0.4593` se recomienda al menos una GPU con 8-16 GB si se procesan batches de espectrogramas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en inferencia solo CPU.
- Opciones de despliegue: Transformers con `ASTForAudioClassification`; el autor enlaza `integrations/transformers/usage.md` y `integrations/transformers/expectations`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificacion de audio de este tamano.
- Latencia y throughput: no disponibles. Al ser un fixture de 2 capas y 0,2 M parametros, la latencia seria despreciable, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic` (este) | 195.727 (0,2 M) | no disponible | Fixture de clasificacion de audio | no disponible | Hugging Face, 1672 descargas |
| `MIT/ast-finetuned-audioset-10-10-0.4593` | no disponible en la informacion proporcionada | no disponible | Clasificacion de eventos sonoros AudioSet | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion significativa es con su modelo base: mismo nombre de tensores y mismo procesador, pero el base contiene todos los parametros y pesos entrenados, mientras que este fixture tiene 2 capas y pesos aleatorios. No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo etiqueta explicitamente como `test-artifact` y advierte que no debe usarse como modelo candidato en busquedas de modelos.
- Pesos aleatorios (semilla 17): las salidas de clasificacion no tienen significado acustico; cualquier metrica de calidad seria invalida.
- Configuracion encogida a 2 capas: no reproduce el comportamiento del checkpoint original ni su capacidad de discriminacion entre las 527 clases de AudioSet.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del modelo base a partir de esta informacion.
- Idiomas no disponibles: al ser clasificacion de audio, no hay soporte linguistico que evaluar.
- Riesgo de confusion: el nombre del repositorio replica el del modelo base con el sufijo `-mic`, lo que puede llevar a descargarlo por error en lugar del checkpoint real.
- Sesgos y alucinacion: no aplicables en el sentido habitual de modelos generativos, pero los pesos aleatorios pueden producir predicciones arbitrarias y confianzas sin calibracion.
- En produccion, sustituir siempre este fixture por `MIT/ast-finetuned-audioset-10-10-0.4593` y validar la licencia del checkpoint original antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Contrato de integracion (`integration.json`): https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic/blob/main/build.json
- Explicacion de la reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ast-finetuned-audioset-10-10-0.4593-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
