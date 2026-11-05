# huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic

## Resumen

`huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic` es un artefacto de prueba (fixture) derivado del modelo `MIT/ast-finetuned-audioset-10-10-0.4593`, un Audio Spectrogram Transformer (AST) entrenado para clasificación de eventos sonoros sobre AudioSet. No es un modelo utilizable en producción: se trata de una version "slim" creada por el proyecto `transformers-mic` para validar contratos de integración entre el modelo y el framework Transformers.

El fixture conserva la misma arquitectura (`ASTForAudioClassification`) y los mismos nombres de tensores que el checkpoint original, pero reduce el número de capas ocultas a 2 y sustituye los pesos entrenados por pesos aleatorios (semilla 17). El resultado son aproximadamente 195.727 parámetros, frente a los ~87 millones del AST original. Los ficheros del procesador (`preprocessor_config.json`) se copian byte a byte del modelo base.

Su relevancia es exclusivamente para desarrolladores que trabajan en tooling de testing: permite verificar pipelines de carga, inferencia y serialización sin descargar el checkpoint completo. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), `ASTForAudioClassification` |
| Parametros totales | 195.727 (fixture); el modelo base tiene ~87 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, ventana de espectrograma) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, validado también en bfloat16 y float16 |
| Idiomas soportados | no disponible (clasificación de audio, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `MIT/ast-finetuned-audioset-10-10-0.4593` |
| Numero de capas ocultas | 2 (reducido desde el original) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo base es un Audio Spectrogram Transformer: un transformer de visión adaptado a espectrogramas de audio, que divide la entrada en parches y los procesa con self-attention para producir logits sobre las clases de AudioSet (527 categorías en el modelo original). El checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593` corresponde al ajuste fino de AST sobre AudioSet con mAP 0,4593.

El fixture que nos ocupa **no ha sido entrenado**. Sus pesos son aleatorios (semilla 17) y solo se aceptaron tras superar un "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `input_values:reverse`, 0,00487). Se generó mediante `build_fixtures.py` del repositorio `transformers-mic`, con la regla genérica de reducción de `sweep.py` (num_hidden_layers = 2). El `build.json` registra fuentes fijadas, resultados del gate y hashes de ficheros. Los ficheros del procesador se copian byte a byte del modelo base.

## Capacidades

- Carga y ejecución dentro del pipeline de Transformers para `ASTForAudioClassification`.
- Clasificación de audio a nivel de contrato: produce logits sobre las clases del modelo base (con pesos aleatorios, por lo que las predicciones no son semánticamente válidas).
- Validación de integración: comprueba que los nombres de tensores, el `preprocessor_config.json` y el flujo forward/loss/gradients funcionan en float32, bfloat16 y float16.
- Soporte de tool calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingües: no aplica.
- Capacidades especiales: ninguna; es un artefacto de test.

## Casos de uso

- **Test de integración de Transformers**: cargar el fixture con `ASTForAudioClassification.from_pretrained` para verificar que el pipeline de audio funciona sin descargar los ~350 MB del checkpoint original. Adecuado por su tamaño reducido (0,2 M parámetros).
- **CI/CD de tooling de modelos**: incluir el fixture en la suite de tests de librerías que serializan, convierten o inspeccionan modelos, comprobando que los nombres de tensores coinciden con el checkpoint real.
- **Validación de contratos de framework**: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una nueva versión de Transformers mantiene compatibilidad con AST.
- **Desarrollo de procesadores de audio**: probar el `preprocessor_config.json` copiado del modelo base sin necesidad de pesos reales, verificando la extracción de features del espectrograma.
- **Tests de dtype y estabilidad numérica**: el fixture garantiza forward, loss y gradientes finitos en float32, bfloat16 y float16, útil para validar rutas de mixed precision.
- **Reproducción de artefactos**: reconstruir el fixture con `python example/build_fixtures.py --fixture ast-finetuned-audioset-10-10-0.4593-mic` y comparar hashes con `build.json` para auditar la reproducibilidad del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de test con pesos aleatorios; cualquier métrica de clasificación carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (195.727 parámetros × 4 bytes ≈ 0,78 MB de pesos, más activaciones y buffers del procesador de audio).
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers (`AutoModelForAudioClassification`), con soporte de float32, bfloat16 y float16. No se ha validado con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia estará dominada por el preprocesado del espectrograma, no por el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic` (este) | 195.727 | Fixture de test de clasificación de audio | no disponible | HuggingFace, 0 descargas |
| `MIT/ast-finetuned-audioset-10-10-0.4593` | ~87 M | Clasificación de eventos sonoros (AudioSet) | no disponible | HuggingFace, modelo de referencia |
| `MIT/ast-finetuned-audioset-10-10-0.4593` (variantes comunitarias) | ~87 M | Clasificación de audio | variable | HuggingFace |

La comparación relevante es con el checkpoint base: mismo nombre de tensores, misma arquitectura declarada, pero 2 capas frente a 12 y pesos aleatorios frente a pesos entrenados. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- **No es un modelo utilizable**: los pesos son aleatorios; las predicciones no tienen valor semántico.
- **Etiquetado como `test-artifact`**: no debe incluirse en búsquedas de modelos candidatos ni en producción.
- **Sesgos**: no evaluables, al no haber entrenamiento. El modelo base podría tener sesgos derivados de AudioSet, pero este fixture no los hereda de forma significativa.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto; sí existe el riesgo de que un consumidor confunda el fixture con un modelo real y obtenga clasificaciones sin sentido.
- **Limitaciones de contexto o idioma**: no disponible; el modelo base opera sobre ventanas de espectrograma de ~10 s y clases de AudioSet, pero el fixture no se ha validado para ello.
- **Licencia**: no disponible; verificar la licencia del modelo base antes de cualquier uso derivado.
- **Caveat de producción**: no desplegar. Usar exclusivamente en entornos de test con aislamiento claro respecto a modelos reales.

## Enlaces

- HuggingFace: https://huggingface.co/huggingface-mic/ast-finetuned-audioset-10-10-0.4593-mic
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ast-finetuned-audioset-10-10-0.4593-mic.html
- Manifiesto de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
