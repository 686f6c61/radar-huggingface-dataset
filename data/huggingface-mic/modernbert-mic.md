# huggingface-mic/modernbert-mic

## Resumen

modernbert-mic es un artefacto de prueba publicado por el usuario huggingface-mic, derivado del modelo answerdotai/ModernBERT-base mediante un proceso de reduccion (shrinking) documentado en el repositorio transformers-mic. No es un modelo entrenado ni utilizable para inferencia real: es un fixture de 3.360.320 parametros con pesos aleatorios (semilla 17) que replica la arquitectura y los nombres de tensores del checkpoint original para validar contratos de integracion en Transformers.

El objetivo del artefacto es servir como banco de pruebas reproducible para verificar el comportamiento de la integracion de ModernBERT en la libreria Transformers: carga de pesos, sensibilidad a las entradas, ejecucion en distintas dtypes (float32, bfloat16, float16) y expectativas de framework. La model card indica explicitamente que se trata de un test artifact y que debe quedar excluido de las busquedas de modelos candidatos.

Su relevancia es, por tanto, exclusivamente de ingenieria de software: permite a los mantenedores de Transformers ejecutar pruebas de integracion ligeras (0,0 GB de repositorio, 3,4 M de parametros frente a los aproximadamente 149 M de ModernBERT-base) sin descargar el checkpoint completo. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForMaskedLM (transformer encoder, variante reducida de ModernBERT) |
| Parametros totales | 3.360.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture conserva la arquitectura del modelo base, ModernBertForMaskedLM, pero con una configuracion reducida: num_hidden_layers igual a 2, aplicando la regla generica de reduccion definida en sweep.py del repositorio transformers-mic. Los ficheros de procesador (special_tokens_map.json, tokenizer.json y tokenizer_config.json) se copian byte a byte desde answerdotai/ModernBERT-base, de modo que el tokenizador es identico al del checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se aceptaron porque superaron la puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, attention_mask:all_ones, registro 0,00121). El modelo mantiene los mismos nombres de tensores que el checkpoint real, se guarda en float32 (el dtype por defecto de ModernBERT-base) y produce valores finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es d109ab451c9f.

## Capacidades

- No dispone de capacidades funcionales de generacion, razonamiento, codigo ni matematicas: los pesos son aleatorios y la model card lo declara explicitamente como test artifact no utilizable.
- Replica la interfaz de ModernBertForMaskedLM, incluida la tarea de masked language modeling a nivel de contrato de API.
- Conserva el tokenizador exacto de answerdotai/ModernBERT-base, por lo que el preprocesado de texto es fiel al modelo original.
- Soporta ejecucion en float32, bfloat16 y float16 con resultados finitos, lo que permite probar rutas de mixed precision.
- Mantiene los nombres de tensores del checkpoint real, habilitando pruebas de carga estricta (strict load) y de compatibilidad de state dict.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponible (heredadas del tokenizador del modelo base, no verificadas en este fixture).

## Casos de uso

- Pruebas de integracion en Transformers: el fixture permite ejecutar la suite de tests de ModernBERT en CI sin descargar el checkpoint completo, reduciendo el coste de ancho de banda y el tiempo de arranque.
- Validacion de contratos de framework: los ficheros integration.json y expectations documentan y verifican las expectativas de carga, dtypes y formas de salida del modelo.
- Pruebas de mixed precision: al producir valores finitos en float32, bfloat16 y float16, sirve para validar rutas de autocast y comprobar que no aparecen NaN ni inf en forward, loss ni gradientes.
- Verificacion de sensibilidad a entradas: la puerta de sensibilidad (perturbaciones que mueven los logits al menos 0,001) permite comprobar que el pipeline de inferencia responde a cambios en attention_mask y en los ids de entrada.
- Regresion de tokenizador: al copiar byte a byte los ficheros de procesador del modelo base, se puede detectar cualquier divergencia introducida en la integracion del tokenizador.
- Reproducibilidad de builds: build.json registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el fixture con python example/build_fixtures.py --fixture mic-modernbert-slim y auditar cambios.
- Pruebas de carga estricta de state dict: los nombres de tensores coinciden con el checkpoint real, de modo que se puede validar el mapeo de pesos antes de usar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de pruebas y no un modelo entrenado, por lo que no procede evaluar MMLU, HumanEval, GSM8K ni metricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,36 M de parametros, aproximadamente 13,4 MB de pesos) y aun menor en bfloat16 o float16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; la model card cita validacion en una NVIDIA A10G.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y tambien en CPU.
- Opciones de despliegue: Transformers con el pipeline estandar de ModernBertForMaskedLM; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible; al ser un fixture con dos capas y pesos aleatorios, las cifras no serian representativas de ModernBERT-base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernbert-mic | 3.360.320 | no disponible | Fixture de pruebas de integracion | no disponible | Hugging Face (huggingface-mic) |
| answerdotai/ModernBERT-base | aproximadamente 149 M | no disponible en esta informacion | Modelo encoder de lenguaje | no disponible en esta informacion | Hugging Face (answerdotai) |
| mic-modernbert-slim | 3,4 M | no disponible | Fixture slim referenciado en la model card | no disponible | Referenciado, no enlazado directamente |

La comparativa relevante es con el propio checkpoint base: modernbert-mic reduce el numero de capas a 2 y sustituye los pesos entrenados por pesos aleatorios, conservando arquitectura, tokenizador y nombres de tensores. No se dispone de informacion sobre otros fixtures comparables.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado semantico; cualquier uso en produccion seria un error.
- La model card lo etiqueta como test-artifact precisamente para excluirlo de busquedas de modelos candidatos; los pipelines de seleccion de modelos deben filtrar esta etiqueta.
- La licencia no esta declarada, lo que impide determinar condiciones de uso comercial o redistribucion.
- La longitud de contexto y los idiomas soportados no estan documentados para este fixture.
- Al derivar de answerdotai/ModernBERT-base, hereda las obligaciones de licencia del modelo base, que no se detallan en la informacion disponible.
- La cobertura es parcial: la model card indica que el prototipo declara objetivos solo para el fixture y que la cobertura del checkpoint completo es un trabajo separado.
- No debe usarse como referencia de rendimiento: las metricas de latencia o calidad obtenidas con este artefacto no son extrapolables a ModernBERT-base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/modernbert-mic
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Manifest de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/modernbert-mic.html
- Evidencia de regeneracion (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
