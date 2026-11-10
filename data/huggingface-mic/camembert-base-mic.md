# huggingface-mic/camembert-base-mic

## Resumen

`camembert-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` para el ecosistema de validacion de contratos de integracion de Transformers. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida artificialmente de `almanach/camembert-base`, con solo 2.184.645 parametros y pesos aleatorios (semilla 17), disenada para verificar que las expectativas de framework (formas de tensores, nombres, dtypes, sensibilidad a entradas) se cumplen sin necesidad de cargar el checkpoint completo.

El modelo conserva la arquitectura `CamembertForMaskedLM` y los ficheros de procesador (tokenizador SentencePiece) copiados byte a byte del modelo original, pero reduce el numero de capas ocultas a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. La relevancia es, por tanto, exclusivamente de ingenieria: sirve como fixture reproducible en CI para probar pipelines de integracion con Transformers, no como modelo de lenguaje.

No dispone de pipeline declarado, licencia especificada, idiomas declarados ni datos de entrenamiento. Cualquier uso como modelo de NLP en produccion es inadecuado por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamembertForMaskedLM), 2 capas ocultas |
| Parametros totales | 2.184.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion reducida; no declarada) |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con bfloat16 y float16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo CamemBERT (`CamembertForMaskedLM`), reducido a 2 capas ocultas mediante la regla generica de reduccion de `sweep.py`. Los nombres de tensores coinciden exactamente con los del checkpoint real `almanach/camembert-base`, lo que permite sustituir el fixture por el modelo completo sin cambiar el codigo de carga. Los ficheros de procesador (`sentencepiece.bpe.model`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base.

No hubo entrenamiento: los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a entradas, en la que cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,00239). El modelo se guardo en float32 y se verifico que es finito en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture `7a12a5888392` agrupa todos los checkpoints con ficheros de procesador identicos y configuracion coincidente tras la reduccion.

## Capacidades

- Generacion de logits para tareas de `fill-mask` a nivel de contrato de API (formas, dtypes, nombres de tensores), no con calidad linguistica real.
- Verificacion de integracion con Transformers: carga, forward, calculo de loss y gradientes.
- Comprobacion de sensibilidad a entradas (attention mask, input ids) en pipelines de CI.
- Compatibilidad de dtypes: float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Pruebas de integracion en CI/CD: usar el fixture para validar que el codigo de carga de `CamembertForMaskedLM` funciona (nombres de tensores, dtypes, formas) sin descargar el checkpoint completo de 110M de parametros.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada version de Transformers.
- Pruebas de sensibilidad a entradas: verificar que perturbaciones en `attention_mask` e `input_ids` producen cambios en los logits por encima del umbral definido.
- Desarrollo de pipelines de tokenizacion: al conservar el tokenizador SentencePiece original, permite probar el preprocesado de texto frances sin cargar pesos reales.
- Pruebas de compatibilidad de dtypes: validar que el codigo de inferencia funciona en float32, bfloat16 y float16 sin errores de desbordamiento.
- Regresion de integraciones: detectar roturas en la API de Transformers comparando el comportamiento del fixture entre versiones.
- Documentacion y demos de integracion: ejemplos ejecutables de bajo coste computacional para tutoriales internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad linguistica carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB en float32 (2,18M parametros x 4 bytes); inferior a 25 MB en bfloat16/float16.
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers (carga estandar), potencialmente llama.cpp/Ollama no aplican por ser un encoder de fill-mask; vLLM y TGI no estan disenados para este tipo de fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia es practicamente despreciable, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| camembert-base-mic | 2,18M | no disponible | Fixture de test | no disponible |
| almanach/camembert-base | ~110M | 512 tokens (estandar CamemBERT) | Modelo real de fill-mask en frances | MIT (segun el modelo base) |
| CamemBERT (original) | ~110M | 512 tokens | Modelo real de NLP en frances | MIT |

La comparativa relevante es exclusivamente con el modelo base del que deriva: `camembert-base-mic` es una version reducida y con pesos aleatorios de `almanach/camembert-base`, sin capacidad linguistica real. No es comparable en rendimiento con modelos de NLP en produccion.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo utilizable: los pesos son aleatorios y la salida carece de significado linguistico.
- No debe usarse en produccion ni para evaluar calidad de NLP.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados; aunque el tokenizador es frances (heredado de CamemBERT), el modelo no procesa lenguaje de forma significativa.
- Contexto no declarado; la configuracion reducida puede no reflejar la longitud de contexto del modelo original.
- Riesgo de confusion: el nombre puede llevar a pensar que es un modelo CamemBERT funcional; la etiqueta `test-artifact` esta pensada para excluirlo de busquedas de modelos candidatos.
- Sin garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- [Hugging Face: huggingface-mic/camembert-base-mic](https://huggingface.co/huggingface-mic/camembert-base-mic)
- [Modelo base: almanach/camembert-base](https://huggingface.co/almanach/camembert-base)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Explicacion del proceso de reduccion](https://huggingface-mic-mic-coverage.static.hf.space/shrink/camembert-base-mic.html)
