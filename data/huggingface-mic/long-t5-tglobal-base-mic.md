# huggingface-mic/long-t5-tglobal-base-mic

## Resumen

`long-t5-tglobal-base-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni usable en producción: se trata de un *fixture* o versión reducida (slim) del modelo `google/long-t5-tglobal-base`, diseñado para validar contratos de integración con frameworks (Transformers, entre otros) sin necesidad de cargar los pesos completos del modelo original. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas del framework.

La arquitectura subyacente es LongT5 (una variante de T5 con atención global eficiente para secuencias largas), materializada como `LongT5ForConditionalGeneration` pero con una configuración drásticamente reducida: 2 capas de encoder y 2 de decoder, frente a las 12+12 del modelo base. El resultado son 2.254.080 parámetros totales (aproximadamente 2,3 millones), almacenados en float32. Los pesos son aleatorios (semilla 17), no entrenados, y solo pasaron una compuerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es exclusivamente técnica y de infraestructura: permite a los mantenedores de `transformers-mic` verificar que el pipeline de integración (tokenización, generación, carga de configuración) funciona correctamente con un modelo LongT5 sin descargar los cientos de megabytes del checkpoint real. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier uso para inferencia real, fine-tuning o evaluación de calidad produciría resultados sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LongT5 (encoder-decoder transformer, `LongT5ForConditionalGeneration`) |
| Parametros totales | 2.254.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración reducida; el modelo base soporta secuencias largas, pero el fixture no documenta una ventana concreta) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizador copiado de `google/long-t5-tglobal-base`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LongT5 con configuración reducida: `num_layers=2` y `num_decoder_layers=2`, generado mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real de `google/long-t5-tglobal-base`, lo que permite que el código de carga y las expectativas del framework se validen de forma idéntica. Los ficheros de procesador (`generation_config.json`, `spiece.model`, `tokenizer.json`) se copiaron byte a byte desde el modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se guardaron en float32 (el dtype por defecto de carga del modelo base). La única validación aplicada fue una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, produjo 20,9). El fixture se identifica con la clave `23e0f7d90b84` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no traduce ni resume.
- Los pesos aleatorios producen salidas sin significado semántico.
- Sirve como fixture de integración para validar la carga de `LongT5ForConditionalGeneration` en Transformers.
- Permite verificar el pipeline de tokenización con el tokenizador real de `google/long-t5-tglobal-base`.
- Valida el contrato de generación (`generation_config.json`) y las expectativas del framework incluidas en `integrations/transformers/expectations`.
- Comprueba la estabilidad numérica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento.

## Casos de uso

- Pruebas de integración en CI/CD: cargar el fixture en lugar del checkpoint completo para verificar que el código de `transformers-mic` carga, tokeniza y ejecuta un forward pass de LongT5 sin errores, reduciendo el tiempo y el ancho de banda de los tests.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de salida, nombres de tensores, dtypes) contra un modelo con la misma estructura que el original.
- Desarrollo de utilidades de serialización: probar rutas de guardado y carga de safetensors con nombres de tensores idénticos a los del checkpoint real, sin necesidad de descargar los pesos completos.
- Verificación de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de precisión en pipelines de entrenamiento antes de escalar al modelo real.
- Reproducción de incidencias: al ser un artefacto pequeño y determinista (semilla 17), permite reproducir bugs de carga o de tokenización reportados contra `google/long-t5-tglobal-base` en un entorno ligero.
- Formación y documentación: servir como ejemplo didáctico de cómo se estructura un repositorio de modelo con manifiesto de contrato, procedencia del fixture y expectativas de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K, ROUGE) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,25 M de parámetros); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna específica; cualquier GPU con al menos 1 GB de memoria es suficiente. Funciona en CPU sin problemas.
- Cabe en GPU consumer: sí, en todas (GTX 1050, RTX 3060, RTX 4090, etc.), así como en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar con `AutoModelForSeq2SeqLM` o `LongT5ForConditionalGeneration`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el propósito del artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sería de milisegundos, pero sin valor práctico por los pesos aleatorios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `long-t5-tglobal-base-mic` (este) | 2,25 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/long-t5-tglobal-base` | ~990 M (no confirmado en la informacion) | no disponible | Resumen y generación de secuencias largas | no disponible | Hugging Face |
| `google/long-t5-tglobal-large` | no disponible | no disponible | Resumen y generación de secuencias largas | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos LongT5 reales) no es significativa en términos de rendimiento, ya que el fixture no está entrenado. La única equivalencia relevante es estructural: mismos nombres de tensores y mismos ficheros de procesador que `google/long-t5-tglobal-base`.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de significado. No debe emplearse para inferencia, generación, resumen ni ninguna tarea de NLP real.
- Sesgos conocidos: no aplica, al no haber entrenamiento; no se puede evaluar sesgo alguno.
- Riesgo de alucinación: total, en el sentido de que toda salida es ruido estadístico sin relación con la entrada.
- Limitaciones de contexto o idioma: no documentadas; el tokenizador es el del modelo base, pero la configuración reducida no garantiza el comportamiento de secuencias largas del LongT5 original.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio antes de cualquier uso, aunque el propósito declarado es exclusivamente de test.
- Caveat para producción: está etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe desplegarse en ningún entorno de producción ni incluirse en pipelines de inferencia reales.
- El repositorio tiene un tamaño de 0,0 GB y 0 likes, lo que refleja su carácter de artefacto interno de la organización `huggingface-mic`.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/long-t5-tglobal-base-mic)
- [Modelo base google/long-t5-tglobal-base](https://huggingface.co/google/long-t5-tglobal-base)
- [Manifiesto del contrato (integration.json)](https://huggingface.co/huggingface-mic/long-t5-tglobal-base-mic/blob/main/integration.json)
- [Uso en Transformers (integrations/transformers/usage.md)](https://huggingface.co/huggingface-mic/long-t5-tglobal-base-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers (integrations/transformers/expectations)](https://huggingface.co/huggingface-mic/long-t5-tglobal-base-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/long-t5-tglobal-base-mic/blob/main/build.json)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/long-t5-tglobal-base-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
