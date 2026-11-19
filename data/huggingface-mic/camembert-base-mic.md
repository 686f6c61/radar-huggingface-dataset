# huggingface-mic/camembert-base-mic

## Resumen

`camembert-base-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de una versión "adelgazada" de `almanach/camembert-base` generada automáticamente para validar contratos de integración con la librería Transformers. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo conserva la arquitectura `CamembertForMaskedLM` del checkpoint original, pero reduce la configuración a 2 capas ocultas y reemplaza todos los pesos por valores aleatorios (semilla 17). Aun así, mantiene los nombres de tensores y los ficheros de procesador (`sentencepiece.bpe.model`, `tokenizer.json`, `tokenizer_config.json`) copiados byte a byte del modelo base, de modo que sirve como sustituto ligero en pruebas de integración.

Con 2.184.645 parámetros totales y un tamaño de repositorio prácticamente nulo, su interés es puramente técnico: permite a desarrolladores de frameworks verificar que su código carga, ejecuta y propaga gradientes correctamente sobre un checkpoint CamemBERT sin descargar los cientos de megabytes del modelo real. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamembertForMaskedLM), 2 capas ocultas |
| Parametros totales | 2.184.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT/RoBERTa adaptado al francés (CamemBERT), instanciado como `CamembertForMaskedLM`. La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los ficheros de tokenización se copian byte a byte desde `almanach/camembert-base`, por lo que el vocabulario y el tokenizador SentencePiece son idénticos a los del modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17), pero pasaron una "input-sensitivity gate": cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, dio 0,00239), lo que se consideró suficiente para no requerir ajuste. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y conserva exactamente los mismos nombres de tensores que el checkpoint real.

## Capacidades

- Carga y ejecución de la tarea `fill-mask` sobre la arquitectura CamemBERT.
- Verificación de contratos de integración con Transformers (manifiesto `integration.json` y directorio `integrations/transformers/expectations`).
- Comprobación de propagación de gradientes y estabilidad numérica en float32, bfloat16 y float16.
- Validación de pipelines de tokenización con el tokenizador real de CamemBERT.
- No genera texto coherente: los pesos son aleatorios.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no disponible (heredadas del tokenizador, pero sin pesos entrenados).

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para validar que una nueva versión de Transformers carga y ejecuta `CamembertForMaskedLM` sin descargar el checkpoint completo, reduciendo el tiempo y el ancho de banda de la suite de tests.
- Desarrollo de frameworks alternativos: comprobar la compatibilidad de nombres de tensores y ficheros de procesador con un checkpoint CamemBERT real antes de integrar el modelo completo.
- Verificación de contratos de API: ejecutar el manifiesto `integration.json` y el directorio de expectativas para asegurar que las entradas y salidas cumplen el contrato definido.
- Pruebas de estabilidad numérica: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 en distintas plataformas.
- Test de tokenización: reutilizar los ficheros SentencePiece y `tokenizer.json` idénticos al modelo base para probar pipelines de preprocesado sin cargar pesos reales.
- Reproducibilidad de fixtures: regenerar el artefacto con `build_fixtures.py --fixture camembert-base-mic` y comparar hashes registrados en `build.json` para detectar regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, los benchmarks carecen de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en float32 (2,18 M parámetros), prácticamente despreciable.
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU y entornos edge.
- Opciones de despliegue: Transformers (carga estándar), sin soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia es del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/camembert-base-mic` | 2,18 M | no disponible | no disponible | Fixture de test |
| `almanach/camembert-base` | no disponible (modelo completo) | no disponible | no disponible | Modelo CamemBERT funcional |
| `camembert/camembert-base` | no disponible | no disponible | no disponible | Modelo CamemBERT funcional (original) |

La comparativa con modelos funcionales no es significativa: el fixture solo comparte arquitectura y tokenizador con CamemBERT, no capacidades.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce predicciones útiles en `fill-mask`.
- Etiquetado como `test-artifact`; no debe usarse en producción ni como candidato en búsquedas de modelos.
- Licencia no disponible: no se puede asumir uso comercial sin consultar el modelo base `almanach/camembert-base`.
- Idiomas soportados no disponibles; el tokenizador es francés (heredado de CamemBERT), pero sin pesos entrenados no hay capacidad lingüística real.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de confusión: el nombre puede llevar a pensar que es un modelo funcional; la model card lo desmiente explícitamente.
- Sesgos y alucinaciones: no aplica en sentido estricto por la ausencia de entrenamiento, pero cualquier salida es ruido aleatorio.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/camembert-base-mic
- Modelo base: https://huggingface.co/almanach/camembert-base
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/camembert-base-mic.html
