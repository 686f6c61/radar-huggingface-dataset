# huggingface-mic/clipseg-rd64-refined-mic

## Resumen

`clipseg-rd64-refined-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo utilizable en produccion: se trata de una version reducida artificialmente del modelo real `CIDAS/clipseg-rd64-refined`, un modelo de segmentacion de imagenes guiada por texto basado en la arquitectura CLIPSeg. El repositorio empaqueta pesos "slim", ejemplos de uso ejecutables y expectativas de framework en un unico lugar, con el objetivo de validar contratos de integracion en el ecosistema Transformers.

El modelo conserva la misma arquitectura declarada (`CLIPSegForImageSegmentation`) y los mismos nombres de tensores que el checkpoint original, pero con una configuracion encogida: 2 capas ocultas en el codificador de texto y 2 en el codificador de vision. Los pesos son aleatorios (semilla 17) y no han sido entrenados. El total de parametros asciende a 4.297.633, muy por debajo del modelo base. Los ficheros del procesador (tokenizer, preprocessor, vocab, merges) se copiaron byte a byte desde el checkpoint original.

Su relevancia es puramente de ingenieria: sirve como fixture de pruebas para verificar que las integraciones de Transformers cargan, ejecutan y propagan gradientes correctamente con la interfaz de CLIPSeg, sin necesidad de descargar el modelo completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIPSegForImageSegmentation (transformer dual texto-vision con decodificador de segmentacion) |
| Parametros totales | 4.297.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de CLIPSeg para segmentacion de imagenes: un codificador de texto y un codificador de vision de tipo CLIP, acoplados a un decodificador que produce mapas de segmentacion condicionados por la consulta textual. En esta fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py`: `text num_hidden_layers = 2` y `vision num_hidden_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real `CIDAS/clipseg-rd64-refined`, lo que permite validar rutas de carga sin discrepancias de nomenclatura.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `pixel_values:roll_batch`, registro 8,6). Los ficheros del procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo base. La fixture se genero con `build_fixtures.py` y su procedencia queda registrada en `build.json` (fuentes fijadas, resultados de las puertas y hashes de ficheros). La clave de fixture es `4a8e469eb075`.

## Capacidades

- Carga y ejecucion de la interfaz `CLIPSegForImageSegmentation` en Transformers, con los mismos nombres de tensores que el checkpoint real.
- Segmentacion de imagenes guiada por texto a nivel de contrato de API (no produce resultados semanticamente validos por usar pesos aleatorios).
- Verificacion de propagacion de gradientes y calculo de perdida en float32, bfloat16 y float16.
- Validacion de la sensibilidad a perturbaciones de entrada sobre `pixel_values` y entradas textuales.
- Pruebas de integracion del procesador (tokenizer y preprocessor) copiado del modelo original.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues en sentido funcional.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar la fixture con `CLIPSegForImageSegmentation` para verificar que la ruta de carga, el mapeo de tensores y la firma del forward coinciden con el checkpoint real, sin descargar los cientos de millones de parametros del modelo completo.
- Validacion de pipelines CI/CD: incluir la fixture en la suite de tests del repositorio para detectar regresiones en la integracion de CLIPSeg ante cambios de version de Transformers, con un coste de descarga minimo (repo de 0,0 GB).
- Verificacion de dtypes: comprobar que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real en mixed precision.
- Pruebas de contrato del procesador: validar que `merges.txt`, `vocab.json`, `preprocessor_config.json` y `tokenizer_config.json` se cargan y producen las mismas entradas que el modelo base, al ser copias byte a byte.
- Test de sensibilidad a la entrada: reproducir las perturbaciones documentadas (`pixel_values:roll_batch`, entre otras) para confirmar que los logits responden por encima del umbral de 0,001 y que la instrumentacion de tests funciona.
- Desarrollo de herramientas de inspeccion de modelos: usar la fixture como sujeto de pruebas para utilidades que enumeran tensores, comparan configuraciones o auditan checkpoints, ya que comparte nombres de tensores con el modelo real.
- Reproduccion de la build: regenerar la fixture con `python example/build_fixtures.py --fixture clipseg-rd64-refined-mic` para auditar el proceso de encogimiento y los hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (IoU, precision de segmentacion, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 4,3 M de parametros (los pesos ocupan aproximadamente 17 MB); el cuello de botella real es el codificador de vision CLIP reducido, no el peso del checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (ruta principal validada por el contrato); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de segmentacion.
- Latencia y throughput: no disponibles; al ser una fixture de 2+2 capas, la inferencia es practicamente instantanea, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/clipseg-rd64-refined-mic` | 4.297.633 | no disponible | Fixture de segmentacion guiada por texto | no disponible | Hugging Face |
| `CIDAS/clipseg-rd64-refined` | no disponible en la informacion proporcionada | no disponible | Segmentacion guiada por texto (modelo real) | no disponible | Hugging Face |
| Otros modelos CLIPSeg de la familia CIDAS | no disponible | no disponible | Segmentacion guiada por texto | no disponible | Hugging Face |

La comparativa relevante es contra su propio modelo base: la fixture reproduce la arquitectura y los nombres de tensores, pero con 2 capas por codificador en lugar de la configuracion completa y con pesos aleatorios, por lo que no es una alternativa funcional sino un sustituto de pruebas.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo usable: los pesos son aleatorios y las salidas de segmentacion no tienen significado semantico.
- No debe emplearse en produccion, investigacion aplicada ni evaluaciones de calidad; su uso esta restringido a validacion de integraciones y contratos.
- La licencia no esta declarada en la informacion disponible; antes de cualquier reutilizacion debe consultarse el repositorio y la licencia del modelo base `CIDAS/clipseg-rd64-refined`.
- Los idiomas soportados no estan declarados; el tokenizer se copia del modelo base, pero no se documenta cobertura linguistica.
- La configuracion reducida (2+2 capas) implica que el comportamiento numerico difiere del modelo real; los tests de integracion validan forma y contrato, no equivalencia funcional.
- Riesgo de confusion: el nombre y la estructura del repositorio pueden llevar a confundirla con el checkpoint real; la etiqueta `test-artifact` existe precisamente para evitarlo.
- No se documentan sesgos porque no hay entrenamiento ni datos; cualquier analisis de sesgo debe hacerse sobre `CIDAS/clipseg-rd64-refined`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic
- Modelo base: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/integration.json
- Uso en Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture (`build.json`): https://huggingface.co/huggingface-mic/clipseg-rd64-refined-mic/blob/main/build.json
- Explicacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/clipseg-rd64-refined-mic.html
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
