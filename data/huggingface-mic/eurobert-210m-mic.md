# huggingface-mic/EuroBERT-210m-mic

## Resumen

EuroBERT-210m-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, derivado del modelo base EuroBERT/EuroBERT-210m. No se trata de un modelo entrenado ni utilizable en producción: el propio autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos. Su función es servir como fixture de integración para validar contratos de ejecución (manifiestos, expectativas de framework y uso ejecutable) en el ecosistema de Hugging Face.

Técnicamente es una versión reducida de la arquitectura EuroBertForMaskedLM, recortada mediante una regla genérica de `sweep.py` que deja el modelo en 2 capas ocultas y 16.499.008 parámetros totales (frente a los aproximadamente 210 millones del modelo original). Los pesos son aleatorios (semilla 17), no proceden de entrenamiento alguno, y los ficheros de procesador (configuration_eurobert.py, modeling_eurobert.py, tokenizer.json, etc.) se copiaron byte a byte desde el checkpoint original.

Su relevancia es puramente de ingeniería: permite a los mantenedores de frameworks y pipelines comprobar que la carga, el forward, la pérdida y los gradientes funcionan correctamente con la misma estructura de tensores que el modelo real, sin necesidad de descargar ni ejecutar los 210 millones de parámetros completos. Cualquier evaluación de capacidades, calidad o rendimiento sobre este repositorio carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EuroBertForMaskedLM) |
| Parametros totales | 16.499.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | EuroBERT/EuroBERT-210m |
| Numero de capas | 2 (reducido desde el original) |
| Tipo de artefacto | test-artifact / fixture de integracion |
| Semilla de pesos | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

La arquitectura subyacente es EuroBERT, un encoder transformer de tipo BERT orientado a tareas de enmascaramiento de tokens (fill-mask). En este repositorio concreto, la configuración se ha reducido a 2 capas ocultas mediante la regla genérica implementada en `sweep.py` del proyecto transformers-mic, conservando los mismos nombres de tensores que el checkpoint real de 210 millones de parámetros.

No hubo entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se aceptaron únicamente porque superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,562). El fixture se guardó en float32, el dtype con el que carga por defecto EuroBERT/EuroBERT-210m, y se verificó que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16. Los ficheros de procesador se copiaron byte a byte desde el modelo original, y `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no resuelve código ni matemáticas y no tiene capacidades multilingües reales.
- Ejecuta la tarea declarada en el contrato (`fill-mask`) con la interfaz de Transformers, pero produce salidas sin significado por sus pesos aleatorios.
- Sirve como fixture de validación para comprobar contratos de integración: manifiesto (`integration.json`), uso ejecutable (`integrations/transformers/usage.md`) y expectativas de framework (`integrations/transformers/expectations`).
- Mantiene la misma estructura de tensores que el checkpoint real, lo que permite validar cargadores, serialización safetensors y compatibilidad de dtypes.
- Verificado para forward, cálculo de pérdida y retropropagación en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades adicionales (visión, audio).

## Casos de uso

- Validación de integraciones de Transformers: cargar el fixture con `AutoModelForMaskedLM` y comprobar que la configuración reducida y los ficheros de procesador copiados se resuelven sin errores antes de apuntar al checkpoint real de 210 millones.
- Pruebas de CI/CD en frameworks: ejecutar forwards y retropropagación con pesos aleatorios para detectar regresiones en el pipeline de carga sin coste de descarga ni de cómputo significativo (repositorio de 0,1 GB).
- Verificación de contratos de modelo: usar `integration.json` y el directorio de expectativas para validar que una nueva versión del framework respeta la interfaz declarada de EuroBERT.
- Pruebas de compatibilidad de dtypes: comprobar que un runtime maneja correctamente float32, bfloat16 y float16 con la misma estructura de tensores que el modelo real.
- Desarrollo de herramientas de inspección de safetensors: validar lectores de metadatos, hashes y nombres de tensores contra un artefacto pequeño y reproducible.
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture EuroBERT-210m-mic` y comparar hashes registrados en `build.json` para auditar la cadena de build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad (MMLU, GLUE, fill-mask accuracy ni similares), coherente con la naturaleza de artefacto de prueba con pesos aleatorios. Los únicos datos numéricos publicados son los de la puerta de sensibilidad a la entrada (variación mínima de logits de 0,001; caso más débil 0,562 con `attention_mask:all_ones`), que no constituyen una evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 16,5 millones de parámetros (aproximadamente 66 MB de pesos), más overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4060, etc.) e incluso en CPU para pruebas de integración.
- Opciones de despliegue: Transformers con `AutoModelForMaskedLM` y `AutoTokenizer` (uso documentado en `integrations/transformers/usage.md`); el formato safetensors es compatible con vLLM, TGI y llama.cpp en la medida en que soporten la arquitectura EuroBERT, aunque su uso previsto es el testing, no el serving.
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/EuroBERT-210m-mic | 16.499.008 | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face |
| EuroBERT/EuroBERT-210m | ~210 millones | no disponible | Encoder multilingue para fill-mask y embeddings | no disponible | Hugging Face |
| BERT-base (referencia de categoria) | ~110 millones | 512 tokens | Encoder para clasificacion y fill-mask | Apache 2.0 | Hugging Face |

La comparación relevante es únicamente estructural: el fixture replica la interfaz del modelo base con una fracción de los parámetros. Frente a alternativas reales de la misma categoría (encoders tipo BERT), este repositorio no es comparable en capacidades ni rendimiento porque no ha sido entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para inferencia real, evaluación de calidad ni generación de contenido.
- Etiquetado explícito como `test-artifact`: el autor lo excluye de la búsqueda de modelos candidatos; usarlo en producción contraviene su propósito declarado.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial; hay que remitirse al modelo base EuroBERT/EuroBERT-210m para conocer las condiciones reales.
- Idiomas y contexto no documentados en este repositorio; cualquier dato debe consultarse en la model card del checkpoint original.
- Riesgo de confusión: al compartir nombre y estructura con EuroBERT-210m, podría descargarse por error en pipelines automatizados; conviene filtrar por la etiqueta `test-artifact`.
- Solo cubre la tarea `fill-mask`; no sirve para validar contratos de generación, tool calling ni agentes.
- Los ficheros de procesador se copiaron byte a byte, pero el resto de ficheros del repositorio deben regenerarse con `build_fixtures.py` si se necesita una reproducción completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic
- Modelo base: https://huggingface.co/EuroBERT/EuroBERT-210m
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/EuroBERT-210m-mic/blob/main/build.json
- Explicacion del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/EuroBERT-210m-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
