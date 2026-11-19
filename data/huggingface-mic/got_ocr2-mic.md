# huggingface-mic/got_ocr2-mic

## Resumen

`got_ocr2-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo funcional: se trata de un fixture ("slim fixture `mic-got_ocr2-slim`") de 13.027.200 parámetros construido a partir de `stepfun-ai/GOT-OCR-2.0-hf` mediante una reducción genérica de la configuración (2 capas en el codificador visual y 2 capas en el decodificador de texto). El propio autor lo etiqueta explícitamente como `test-artifact` y advierte de que "no es un modelo usable".

Su propósito es servir como contrato de integración para el framework Transformers: replica los nombres de tensores del checkpoint real, copia byte a byte los ficheros de procesador (`generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) y se guarda en `bfloat16`, el dtype por defecto del modelo original. De este modo, los tests de integración pueden ejecutarse en CI sin descargar los pesos completos de GOT-OCR 2.0.

Es relevante únicamente en el contexto de ingeniería de software (validación de pipelines de carga, forward, loss y gradientes en float32, bfloat16 y float16), no como modelo de OCR. Cualquier evaluación de capacidades reales de reconocimiento óptico de caracteres debe dirigirse al checkpoint base `stepfun-ai/GOT-OCR-2.0-hf`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GotOcr2ForConditionalGeneration` (visión-lenguaje, configuración reducida: vision num_hidden_layers 2, text num_hidden_layers 2) |
| Parametros totales | 13.027.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la clase `GotOcr2ForConditionalGeneration` de Transformers, es decir, una arquitectura visión-lenguaje con codificador visual y decodificador de texto. La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, dejando 2 capas ocultas en la torre visual y 2 en la de texto. Los nombres de tensores coinciden con los del checkpoint real `stepfun-ai/GOT-OCR-2.0-hf`.

No se ha entrenado con un corpus general: según la model card, los pesos están sobreajustados ("overfit") al paso de entrenamiento del contrato (250 pasos). Los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`pixel_values:roll_batch` movía los logits solo 0, con umbral 0,001), de ahí el sobreajuste forzado. No hay información sobre número de tokens, composición del dataset, RLHF ni DPO, porque no es un modelo entrenado para uso real.

## Capacidades

- Ejecución del forward, cálculo de loss y gradientes en float32, bfloat16 y float16 (verificado por el autor).
- Carga en Transformers con los mismos nombres de tensores que el checkpoint real, lo que permite validar integraciones sin descargar los pesos completos.
- Reutilización byte a byte de los ficheros de procesador del modelo base (tokenizer, preprocessor, special tokens, generation config).
- No dispone de capacidades funcionales de OCR, generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo: es un artefacto de test.

## Casos de uso

- Tests de integración en CI de Transformers: cargar el fixture para verificar que la clase `GotOcr2ForConditionalGeneration` instancia, ejecuta forward y propaga gradientes sin necesitar el checkpoint completo.
- Validación de contratos de API: comprobar que los ficheros de procesador (tokenizer, preprocessor) se cargan correctamente y producen las mismas salidas que el modelo base.
- Pruebas de dtype: verificar comportamiento en float32, bfloat16 y float16 antes de desplegar el modelo real en producción.
- Desarrollo de pipelines de preprocesado de imágenes: usar el fixture para iterar sobre el código de carga y preprocesado sin coste de descarga ni de GPU.
- Reproducción de builds: el fichero `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture mic-got_ocr2-slim`.
- Validación de herramientas de inspección de modelos (contadores de parámetros, visualizadores de arquitectura) contra un caso conocido y pequeño de 13 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta resultados de puertas de validación internas: sensibilidad a la entrada (`pixel_values:roll_batch` con umbral 0,001) y finitud numérica en float32, bfloat16 y float16.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (13 M de parámetros, ~26 MB de pesos) más activaciones del procesador visual; cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU para tests de integración. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobrada.
- Cabe en GPU consumer: sí, en todas.
- Opciones de despliegue: Transformers (carga estándar), integrable en pipelines de CI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en cualquier caso no tendría sentido al no ser un modelo funcional.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia sería de milisegundos, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/got_ocr2-mic` | 13,0 M | no disponible | no disponible | Hugging Face | Fixture de test |
| `stepfun-ai/GOT-OCR-2.0-hf` | no disponible en la información | no disponible | no disponible | Hugging Face | OCR real |
| Otros fixtures `transformers-mic` | variable | no disponible | no disponible | Hugging Face | Tests de integración |

La comparativa relevante es con el modelo base `stepfun-ai/GOT-OCR-2.0-hf`, del que este fixture hereda arquitectura, procesador y nombres de tensores, pero no pesos útiles ni capacidades. No se dispone de datos de benchmarks del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: el autor lo etiqueta como `test-artifact` y advierte explícitamente de que no debe emplearse para inferencia real.
- Los pesos están sobreajustados a 250 pasos de entrenamiento; no generalizan ni producen OCR correcto.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin información de idiomas, sesgos, alucinación ni contexto: no aplica al no ser un modelo funcional, pero impide cualquier evaluación de calidad.
- Riesgo de confusión: el nombre `got_ocr2-mic` puede llevar a error si se busca un modelo de OCR; debe redirigirse al checkpoint `stepfun-ai/GOT-OCR-2.0-hf`.
- El repositorio ocupa 0,0 GB y contiene solo los pesos slim, la usage y las expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.
- No apto para producción, demos públicas ni evaluación de capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/got_ocr2-mic
- Modelo base: https://huggingface.co/stepfun-ai/GOT-OCR-2.0-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/got_ocr2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/got_ocr2-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
