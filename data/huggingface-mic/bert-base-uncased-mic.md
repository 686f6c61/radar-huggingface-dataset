# huggingface-mic/bert-base-uncased-mic

## Resumen

`huggingface-mic/bert-base-uncased-mic` es un artefacto de prueba (test artifact) publicado por la organizacion `huggingface-mic`, no un modelo utilizable. Se trata de un fixture "slim" de 2.088.186 parametros construido a partir de `google-bert/bert-base-uncased` mediante un proceso de reduccion de configuracion, con el objetivo de validar contratos de integracion (MIC, Model Integration Contract) entre frameworks como Transformers y los checkpoints reales.

El repositorio empaqueta en un unico lugar los pesos reducidos, el manifiesto del contrato (`integration.json`), la documentacion ejecutable de uso con Transformers (`integrations/transformers/usage.md`) y las expectativas de cada framework. La idea es que cada PR de un framework pueda ejecutar el fixture en lugar del checkpoint completo, reduciendo coste y tiempo, y comparar salidas fijas (`predicted_tokens`, `predicted_text`, `answer_logits`, `training.loss`, `training.gradients`, `training.updated`).

Es relevante en el contexto de la ingenieria de infraestructura de IA open source: propone un patron para verificar la paridad de comportamiento entre implementaciones (Transformers, y potencialmente otras) sin necesidad de descargar y ejecutar modelos de cientos de millones de parametros. No debe confundirse con un modelo de produccion: el propio autor lo etiqueta como `test-artifact` y pide excluirlo de la busqueda de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForMaskedLM), transformer encoder bidireccional |
| Parametros totales | 2.088.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el config se reduce a num_hidden_layers=2; el contexto depende de la configuracion original de BERT base, 512 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el autor indica que los pesos son finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio copia el fichero LICENSE del checkpoint base byte a byte, pero no se especifica cual es) |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | fill-mask (AutoTokenizer + AutoModelForMaskedLM) |
| Numero de capas | 2 (reducido desde la configuracion original) |
| Seed de pesos | 17 (pesos aleatorios) |
| Fixture key | 7ce74647df48 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT estandar (`BertForMaskedLM`) con la configuracion reducida a `num_hidden_layers=2`. Los pesos son aleatorios (seed 17), no entrenados. El autor justifica esta decision indicando que el fixture paso una "input-sensitivity gate": toda perturbacion de las entradas del contrato movia los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, con 0.00278), por lo que no fue necesario entrenar para que las salidas fueran discriminativas respecto a las entradas.

Los ficheros de procesador (`LICENSE`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `google-bert/bert-base-uncased`, garantizando que el tokenizador es identico al del checkpoint real. Los nombres de tensores coinciden con los del checkpoint original, de modo que el fixture puede cargarse con el mismo codigo que el modelo completo. El proceso de reduccion se implementa mediante una regla generica en `sweep.py` del repositorio `transformers-mic`, y el fixture se construye con `build_fixtures.py`. El fichero `build.json` registra las fuentes fijadas (pinned sources), los resultados del gate y los hashes de ficheros.

No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia (decodificacion especulativa, attention linear, etc.) porque no es un modelo entrenado: es un artefacto de test con pesos aleatorios.

## Capacidades

- Carga con `AutoTokenizer` + `AutoModelForMaskedLM` de Transformers, en modo batched con right padding.
- Ejecucion de forward pass, calculo de loss, gradientes y actualizacion de pesos en float32, bfloat16 y float16.
- Verificacion de paridad de comportamiento entre implementaciones de framework sobre entradas fijas.
- Comprobacion de salidas concretas: `predicted_tokens`, `predicted_text`, `answer_logits`, `training.loss`, `training.gradients`, `training.updated`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un modelo funcional.
- No dispone de thinking mode, vision ni audio.

## Casos de uso

- Pruebas de integracion en PRs de Transformers: ejecutar el fixture en cada pull request para verificar que la API de `AutoModelForMaskedLM` y el pipeline de fill-mask siguen produciendo las salidas esperadas, sin descargar el checkpoint completo de BERT base.
- Validacion de paridad entre frameworks: comparar `answer_logits` y `training.gradients` entre dos implementaciones (por ejemplo, Transformers y otra libreria) sobre las mismas entradas fijas, usando el fixture como referencia barata.
- CI/CD de bajo coste: al ser un repositorio de 0.0 GB y 2.1M parametros, se puede descargar y ejecutar en runners de CI sin GPU dedicada ni almacenamiento significativo.
- Verificacion de compatibilidad de tokenizador: comprobar que cambios en `tokenizer.json` o `tokenizer_config.json` no rompen la carga, ya que los ficheros se copiaron byte a byte del checkpoint real.
- Pruebas de estabilidad numerica: validar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, detectando regresiones de precision en kernels o backends.
- Desarrollo de nuevas reglas de reduccion de modelos: servir como caso de referencia del proceso generico implementado en `sweep.py` para construir fixtures de otros checkpoints.
- Documentacion ejecutable: el fichero `usage.md` esta escrito como doc-builder runnable markdown, de modo que los mismos bloques sirven como documentacion y como test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad (MMLU, GLUE, etc.) porque los pesos son aleatorios y el objetivo es la verificacion de contratos, no el rendimiento predictivo. La unica metrica reportada es el resultado del gate de sensibilidad a entradas (variacion minima de logits de 0.001, caso mas debil 0.00278 en `attention_mask:all_ones`).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (2.1M parametros), aproximadamente 4-5 MB en float16/bfloat16.
- GPU recomendadas: ninguna en particular; cabe en cualquier GPU consumer, integrada o incluso CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y en CPU sin problema.
- Opciones de despliegue: Transformers (`AutoTokenizer` + `AutoModelForMaskedLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y probablemente no sean adecuadas para un artefacto de test.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 2.1M parametros, la latencia es del orden de milisegundos en CPU y sub-milisegundos en GPU, pero no se aportan cifras oficiales.
- Almacenamiento: repositorio de 0.0 GB segun Hugging Face, lo que facilita su uso en CI.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/bert-base-uncased-mic | 2.088.186 | 2 | Fixture de test para contratos MIC | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110M (aproximado, no confirmado en la informacion) | 12 | Modelo real de fill-mask | Apache 2.0 (segun el checkpoint base, no confirmado en esta ficha) | Hugging Face |
| hf-internal-testing/mic-bert-base-uncased-slim | no disponible | no disponible | Fixture slim alternativo citado por el autor | no disponible | Hugging Face |

La comparativa con modelos funcionales no es significativa: el artefacto solo es comparable con otros fixtures de test. Frente al checkpoint real `google-bert/bert-base-uncased`, la diferencia principal es el tamano (unas 50 veces menor) y la ausencia de pesos entrenados, lo que lo hace inutil para tareas reales de NLP.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen predicciones con sentido. El autor lo etiqueta explicitamente como `test-artifact` y pide excluirlo de la busqueda de modelos candidatos.
- Riesgo de confusion: el nombre `bert-base-uncased-mic` puede llevar a error y hacer pensar que es un fine-tune de BERT base; no lo es.
- La licencia no esta declarada en la informacion disponible; el repositorio copia el fichero LICENSE del checkpoint base, pero no se especifica su contenido. Antes de cualquier uso comercial (que en cualquier caso no tendria sentido para este artefacto) habria que verificar la licencia del checkpoint base.
- El alcance de la validacion es limitado: el autor advierte que "un pase de fixture y un pase de checkpoint real tienen alcances distintos; cualquiera de los dos establece acuerdo sobre entradas fijas y un runtime registrado, no correccion sobre entradas arbitrarias".
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto/idioma porque no es un modelo de lenguaje funcional.
- No se documentan integraciones con frameworks distintos de Transformers; el manifiesto menciona "frameworks" en plural, pero solo se detalla Transformers.
- El modelo se creo en 2026-10-07 y se actualizo en 2026-11-11; puede quedar obsoleto si cambia el contrato MIC o el checkpoint base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/bert-base-uncased-mic
- Checkpoint base: https://huggingface.co/google-bert/bert-base-uncased
- Fixture slim alternativo: https://huggingface.co/hf-internal-testing/mic-bert-base-uncased-slim
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bert-base-uncased-mic.html
- Repositorio `transformers-mic` (sweep.py, build_fixtures.py): https://github.com/huggingface/transformers-mic
- Manifiesto del contrato: `integration.json` (dentro del repositorio)
- Documentacion de uso con Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
