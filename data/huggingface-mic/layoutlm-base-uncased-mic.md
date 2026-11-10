# huggingface-mic/layoutlm-base-uncased-mic

## Resumen

`layoutlm-base-uncased-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de una version reducida ("slim") del checkpoint `microsoft/layoutlm-base-uncased`, generada con pesos aleatorios (semilla 17) y una configuracion de arquitectura mas pequena (2 capas ocultas en lugar de las 12 del original). Su proposito es servir como fixture de integracion para validar contratos de framework (Transformers, procesadores y expectativas de ejecucion) sin necesidad de descargar ni ejecutar el modelo completo.

El modelo conserva la misma clase de arquitectura (`LayoutLMForMaskedLM`) y los mismos nombres de tensores que el checkpoint real, lo que permite probar rutas de carga, inicializacion de pesos ausentes y flujos de inferencia con un coste computacional minimo. El repositorio incluye ademas un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers y un registro de procedencia (`build.json`) con hashes y resultados de las puertas de validacion.

Es relevante unicamente en el contexto de desarrollo y testing de pipelines de integracion de modelos, no como modelo de lenguaje o de comprension de documentos. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLM (transformer encoder con embeddings de layout), clase `LayoutLMForMaskedLM` |
| Parametros totales | 2.319.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 (compatible con bfloat16 y float16 segun la model card) |
| Idiomas soportados | no disponible (el checkpoint base es `uncased` en ingles, pero no se declara en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `microsoft/layoutlm-base-uncased` |
| Capas ocultas | 2 (reducido desde el original) |
| Semilla de pesos | 17 (pesos aleatorios) |
| Dtype de guardado | float32 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo LayoutLM, disenado originalmente para comprension de documentos combinando informacion textual con coordenadas de layout (posiciones de bounding boxes). En esta fixture se mantiene la clase `LayoutLMForMaskedLM` pero con la configuracion reducida a 2 capas ocultas mediante la regla generica de `sweep.py` del repositorio `transformers-mic`.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `input_ids:roll_batch`, dio 0.356), lo que garantiza que el modelo responde a cambios en la entrada sin necesidad de entrenar. Se conservan los mismos nombres de tensores que el checkpoint real, incluyendo la omision de `cls.predictions.bias`, `cls.predictions.decoder.bias` y los parametros de `cls.predictions.transform`, que el checkpoint original tampoco incluye. Los ficheros de procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `microsoft/layoutlm-base-uncased`. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- Ejecucion de forward pass de `LayoutLMForMaskedLM` con entradas de `input_ids`, `attention_mask`, `token_type_ids` y `bbox`.
- Calculo de loss de masked language modeling.
- Calculo de gradientes (util para probar rutas de entrenamiento y fine-tuning).
- Carga de tokenizer y ficheros de procesador identicos a los del checkpoint base.
- Validacion de contratos de integracion con Transformers (manifiesto `integration.json` y directorio de expectativas).
- No dispone de capacidades reales de generacion, razonamiento, codigo, matematicas, vision, tool calling ni agentes: los pesos son aleatorios.

## Casos de uso

- Testing de integracion en Transformers: usar la fixture para verificar que la ruta de carga de `LayoutLMForMaskedLM` funciona sin descargar el checkpoint completo de `microsoft/layoutlm-base-uncased`, reduciendo tiempo y ancho de banda en CI.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parametros) en cada version de Transformers.
- Pruebas de inicializacion de pesos ausentes: verificar que la carga de un checkpoint sin `cls.predictions.bias` ni los parametros de `cls.predictions.transform` inicializa correctamente esos tensores como lo haria un usuario real.
- Pruebas de robustez numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaNs o inestabilidades en nuevas versiones del framework.
- Desarrollo de herramientas de inspeccion de modelos: usar los 2,3 millones de parametros y el manifiesto de procedencia para probar utilidades de analisis de checkpoints, hashing y comparacion de configuraciones.
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture layoutlm-base-uncased-mic` y comparar hashes registrados en `build.json` para garantizar builds deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, GLUE, F1 en tareas de documentos) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (2,3 M parametros x 4 bytes ≈ 9,3 MB), mas el overhead del runtime.
- GPU recomendadas: cualquier GPU, incluida una iGPU o CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en CPU sin problema.
- Opciones de despliegue: Transformers (ruta principal segun la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no son aplicables.
- Latencia y throughput: no disponibles; por el tamano, la latencia sera del orden de microsegundos a milisegundos en CPU y GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/layoutlm-base-uncased-mic` | 2,3 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `microsoft/layoutlm-base-uncased` | ~113 M (estimado, no confirmado en la informacion) | no disponible | Modelo real para comprension de documentos | no disponible en esta ficha | Hugging Face |
| Otras fixtures `transformers-mic` | variable | no disponible | Fixtures de test para otros checkpoints | no disponible | Hugging Face |

La comparativa relevante es con el checkpoint original `microsoft/layoutlm-base-uncased`: misma arquitectura y mismos ficheros de procesador, pero con 2 capas en lugar de la configuracion completa y pesos aleatorios. No se dispone de datos para comparar con alternativas reales de la misma categoria (LayoutLMv2, LayoutLMv3, Donut) porque la informacion proporcionada no los incluye.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semantico.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Idiomas no declarados en la ficha; el tokenizer base es `uncased` en ingles, pero no se confirma el soporte multilingue.
- La configuracion reducida (2 capas) no reproduce el comportamiento numerico del checkpoint original; sirve para validar contratos, no para comparar rendimiento.
- La omision deliberada de ciertos tensores de `cls.predictions` replica el checkpoint real, pero puede confundir a herramientas que esperen un `LayoutLMForMaskedLM` completo.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero cualquier texto generado o prediccion MLM sera ruido.
- No dispone de benchmarks ni de documentacion de rendimiento; no debe citarse como referencia de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic
- Modelo base: https://huggingface.co/microsoft/layoutlm-base-uncased
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/layoutlm-base-uncased-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
