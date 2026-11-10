# huggingface-mic/EuroBERT-210m-mic

## Resumen

EuroBERT-210m-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, derivado del modelo base EuroBERT/EuroBERT-210m. No se trata de un modelo entrenado ni utilizable en producción: es una versión reducida artificialmente del EuroBERT-210m original, creada para validar contratos de integración con frameworks (en concreto, Transformers) dentro del proyecto transformers-mic de Hugging Face. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y expectativas de framework, todo empaquetado conjuntamente.

El fixture conserva la arquitectura `EuroBertForMaskedLM` del modelo original, pero reduce el número de capas ocultas a 2, lo que da lugar a 16.499.008 parámetros totales (frente a los aproximadamente 210 millones del EuroBERT-210m real). Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001. Los ficheros de procesador (configuración, modeling, tokenizer y special tokens) se copiaron byte a byte del modelo original.

Su relevancia es exclusivamente técnica y de infraestructura: sirve para probar pipelines de integración, validación de contratos y comportamiento de frameworks sin necesidad de descargar ni ejecutar el modelo completo. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EuroBertForMaskedLM (transformer encoder, fill-mask) |
| Parametros totales | 16.499.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EuroBERT en su variante para masked language modeling (`EuroBertForMaskedLM`). Respecto al checkpoint original EuroBERT/EuroBERT-210m, el fixture aplica una regla genérica de reducción implementada en `sweep.py` del repositorio transformers-mic, que en este caso reduce `num_hidden_layers` a 2. Los ficheros de procesador (`configuration_eurobert.py`, `modeling_eurobert.py`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base, de modo que la interfaz de configuración y tokenización es idéntica a la del original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,562). Los nombres de tensores coinciden con los del checkpoint real y el modelo se guardó en float32, el dtype por defecto del EuroBERT-210m original. Se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `5e75f46d315d` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto ni predicciones con sentido.
- Interfaz de fill-mask (`EuroBertForMaskedLM`) compatible con la del EuroBERT-210m original.
- Tokenizador y ficheros de configuración idénticos byte a byte a los del modelo base.
- Nombres de tensores idénticos a los del checkpoint real, lo que permite validar carga y mapeo de pesos.
- Ejecutable en float32, bfloat16 y float16 con forward, pérdida y gradientes finitos.
- Incluye manifiesto de contrato (`integration.json`), uso en Transformers y directorio de expectativas de framework.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Validación de contratos de integración: el repositorio incluye `integration.json` con el manifiesto del contrato y un directorio de expectativas de Transformers, de modo que un pipeline de CI puede comprobar que la integración del modelo se comporta según lo esperado sin cargar el checkpoint completo.
- Pruebas de carga de pesos en Transformers: al conservar los nombres de tensores del EuroBERT-210m real, permite verificar que el mapeo de parámetros y la inicialización de la clase `EuroBertForMaskedLM` funcionan correctamente.
- Pruebas de tokenización: los ficheros `tokenizer.json` y `tokenizer_config.json` son idénticos a los del original, por lo que sirve para validar pipelines de tokenización sin descargar el modelo completo.
- Pruebas de precisión numérica: al ser finito en float32, bfloat16 y float16 (forward, loss y gradientes), permite comprobar el comportamiento de frameworks y kernels en distintas precisiones.
- Desarrollo de herramientas del ecosistema transformers-mic: el fixture se genera con `build_fixtures.py` y se reduce con `sweep.py`, por lo que sirve como caso de prueba reproducible para esas herramientas.
- Ahorro de recursos en tests automatizados: con 0,1 GB de tamaño de repositorio y 16,5M de parámetros, se puede descargar y ejecutar en entornos de CI con recursos limitados, a diferencia del modelo de 210M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K u otras) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,5M de parámetros, aproximadamente 66 MB de pesos) y aún menor en float16 o bfloat16.
- GPU recomendadas: cualquier GPU, incluida una GPU integrada o CPU; no requiere aceleradores de datacenter como A100 o H100.
- Cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y pesos aleatorios, las mediciones no serían representativas de ningún caso de uso real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroBERT-210m-mic | 16.499.008 | no disponible | Fixture de prueba (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| EuroBERT/EuroBERT-210m | ~210M (según nombre) | no disponible | Modelo base real para fill-mask | no disponible | Hugging Face (EuroBERT) |
| Otros fixtures de transformers-mic | no disponible | no disponible | Pruebas de integración | no disponible | Hugging Face (huggingface-mic) |

La comparación relevante es con el propio EuroBERT-210m del que deriva: el fixture reduce el número de capas a 2 y sustituye los pesos entrenados por pesos aleatorios, pero mantiene arquitectura, tokenizador y nombres de tensores. No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17), por lo que las salidas no tienen significado semántico.
- Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar condiciones de uso comercial.
- Los idiomas soportados no están documentados; el tokenizador se hereda del EuroBERT-210m, pero no se especifica cobertura lingüística.
- La longitud de contexto no está disponible.
- Al reducirse a 2 capas, su comportamiento numérico y de rendimiento no es representativo del EuroBERT-210m real.
- Riesgo de confusión: el nombre y la estructura del repositorio pueden llevar a creer que se trata de un modelo afinado, cuando en realidad es un fixture de integración.
- No se han documentado sesgos ni riesgos de alucinación porque el modelo no produce texto coherente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic
- Modelo base: https://huggingface.co/EuroBERT/EuroBERT-210m
- Página del fixture EuroBERT MIC: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/EuroBERT-210m-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Uso en Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Manifiesto de contrato: integration.json (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
