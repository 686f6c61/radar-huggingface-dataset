# huggingface-mic/layoutlm-base-uncased-mic

## Resumen

`layoutlm-base-uncased-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado utilizable. Se trata de una version reducida y con pesos aleatorios del checkpoint `microsoft/layoutlm-base-uncased`, generada para validar contratos de integracion con Transformers (carga de pesos, tokenizador y expectativas de framework) dentro del proyecto MIC. Conserva la arquitectura `LayoutLMForMaskedLM` con 2.319.680 parametros, frente a los aproximadamente 113 millones del modelo original.

El modelo base del que deriva, LayoutLM, es un transformer encoder que combina informacion textual con coordenadas espaciales (bounding boxes) para tareas de comprension de documentos, como extraccion de entidades o clasificacion de formularios. Sin embargo, este fixture no ha sido entrenado: sus pesos son aleatorios (semilla 17) y su utilidad se limita a pruebas de integracion y CI, no a inferencia real.

Su relevancia es por tanto instrumental: permite a desarrolladores verificar pipelines de carga y compatibilidad de framework sin descargar los pesos completos, y esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLM (transformer encoder con embeddings de layout), clase `LayoutLMForMaskedLM` |
| Parametros totales | 2.319.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizador heredado de `microsoft/layoutlm-base-uncased`, vocabulario uncased en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de `microsoft/layoutlm-base-uncased` pero con la configuracion reducida: `num_hidden_layers` pasa a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real; dado que el original carece de `cls.predictions.bias`, `cls.predictions.decoder.bias`, `cls.predictions.transform.LayerNorm.bias`, `cls.predictions.transform.LayerNorm.weight`, `cls.predictions.transform.dense.bias` y `cls.predictions.transform.dense.weight`, el fixture tambien los omite y se inicializan al cargar, igual que ocurre con los usuarios reales.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, dio 0,356). Los ficheros de procesador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde el modelo original. Los pesos se guardaron en float32, el dtype por defecto del checkpoint base, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `e6e5f39b6b0e`.

## Capacidades

- Generacion de logits para masked language modeling sobre secuencias de tokens con coordenadas de layout, con fines de prueba de integracion.
- Verificacion de carga de pesos y compatibilidad de nombres de tensores con Transformers.
- Validacion de pipelines de tokenizacion con los ficheros de procesador identicos al modelo original.
- Pruebas de robustez numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificadas.
- No incluye modo thinking, vision ni audio; el componente de layout es entrada estructurada, no vision por imagen.
- No es un modelo usable para inferencia real: sus pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con `LayoutLMForMaskedLM` para verificar que el pipeline de Transformers acepta la configuracion y los nombres de tensores del checkpoint real, sin descargar los pesos completos.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de salida, inicializacion de tensores ausentes).
- Test de tokenizadores: usar los ficheros de procesador copiados byte a byte para verificar que el preprocesado de documentos (tokens y bounding boxes) produce las secuencias esperadas.
- Pruebas de precision numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de estabilidad en el entorno de despliegue antes de usar el modelo real.
- Desarrollo de herramientas de extraccion de documentos: iterar sobre el codigo de postprocesado de entidades o clasificacion con un modelo ligero de 2,3 M de parametros que carga rapido en cualquier maquina.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture layoutlm-base-uncased-mic` y comparar hashes registrados en `build.json` para auditar cambios en el contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, F1 en extraccion de entidades, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,3 M de parametros, aproximadamente 9 MB de pesos); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga directa con Transformers (`LayoutLMForMaskedLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 2,3 M de parametros, la latencia sera minima, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/layoutlm-base-uncased-mic` | 2,3 M | no disponible | Ninguno (pesos aleatorios) | no disponible | Fixture de test |
| `microsoft/layoutlm-base-uncased` | ~113 M (no confirmado en la informacion) | no disponible | Preentrenamiento real | no disponible | Comprension de documentos |
| `microsoft/layoutlmv3-base` | no disponible | no disponible | Preentrenamiento multimodal texto-imagen | no disponible | Comprension de documentos con vision |

La comparativa con alternativas reales de la misma categoria (comprension de documentos) no es significativa: este artefacto no compite en rendimiento porque no ha sido entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningun valor semantico; no debe usarse para inferencia, produccion ni evaluacion de calidad.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo fuera de pruebas de integracion es un error de uso.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al derivar de `microsoft/layoutlm-base-uncased`, habria que verificar la licencia del modelo original.
- Idiomas no declarados; el tokenizador heredado es uncased y de vocabulario ingles, por lo que no cubre otros idiomas de forma fiable.
- Longitud de contexto no documentada; no se puede asumir la del modelo original sin verificacion.
- Riesgo de confusion: el nombre puede llevar a pensar que es un modelo funcional de LayoutLM; conviene revisar la model card antes de integrarlo.
- No se documentan sesgos porque no hay entrenamiento; cualquier sesgo observado en las salidas seria ruido aleatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic
- Modelo base: https://huggingface.co/microsoft/layoutlm-base-uncased
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/layoutlm-base-uncased-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/layoutlm-base-uncased-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
