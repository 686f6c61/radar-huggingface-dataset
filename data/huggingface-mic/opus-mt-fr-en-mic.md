# huggingface-mic/opus-mt-fr-en-mic

## Resumen

`opus-mt-fr-en-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo de traducción utilizable, sino un *fixture* reducido del modelo real `Helsinki-NLP/opus-mt-fr-en`, creado para validar contratos de integración con Transformers (la propia model card lo etiqueta explícitamente como `test-artifact` y advierte de que "no es un modelo usable"). Su propósito es servir como sustituto ligero en pruebas automatizadas: mismos nombres de tensores, mismos ficheros de procesador y misma arquitectura que el original, pero con una configuración drásticamente reducida.

Técnicamente es un `MarianMTModel` (transformer encoder-decoder de traducción automática) recortado a 2 capas de encoder y 2 de decoder, con 4.035.834 parámetros totales en float32. Los ficheros de tokenización (`source.spm`, `target.spm`, `vocab.json`, `generation_config.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que el pipeline de preprocesado es idéntico al de `Helsinki-NLP/opus-mt-fr-en`.

Su relevancia es acotada pero clara para el ecosistema: permite ejecutar tests de integración de Transformers sobre un MarianMT fr-en realista sin descargar ni cargar el modelo completo, y sin depender de pesos aleatorios que no superan las compuertas de sensibilidad a la entrada. Cualquier uso como traductor de producción sería un error: los pesos están sobreajustados a un único paso de entrenamiento de 100 iteraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMTModel (transformer encoder-decoder) |
| Parametros totales | 4.035.834 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | frances a ingles (segun el modelo base `Helsinki-NLP/opus-mt-fr-en`); no confirmado en la model card del fixture |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `MarianMTModel`, la implementación en Transformers de la arquitectura Marian NMT: un transformer encoder-decoder con atención multi-cabeza estándar, pensado para traducción automática neuronal. El fixture conserva la arquitectura pero reduce la profundidad a 2 capas de encoder y 2 de decoder mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (tokenizadores SentencePiece `source.spm` y `target.spm`, vocabulario y configuración de generación) se copian literalmente del checkpoint `Helsinki-NLP/opus-mt-fr-en`, por lo que el contrato de entrada/salida es el del modelo original.

No hay entrenamiento en el sentido habitual: los pesos se obtuvieron ajustando el fixture sobre el paso de entrenamiento del contrato (100 pasos) para que superase la compuerta de sensibilidad a la entrada. Con pesos aleatorios, la prueba `input_ids:reverse` solo movía los logits 0,00092, por debajo del umbral de 0,001; tras el sobreajuste, el fixture supera esa compuerta. El modelo se guarda en float32, el dtype con el que carga por defecto `Helsinki-NLP/opus-mt-fr-en`, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `49fa7f6e6e14`.

## Capacidades

- Traducción automática frances-ingles a nivel de contrato de API (entrada de texto, salida de texto), heredada de la interfaz de `Helsinki-NLP/opus-mt-fr-en`.
- Ejecución de forward pass, cálculo de loss y retropropagación de gradientes en float32, bfloat16 y float16 sin valores no finitos.
- Compatibilidad con el pipeline de tokenización SentencePiece del modelo original (mismos ficheros de procesador byte a byte).
- Sirve como sujeto de pruebas para validar integraciones de Transformers (`integrations/transformers/usage.md` y `integrations/transformers/expectations`).
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio.
- No es un modelo multilingüe general: cubre únicamente el par fr-en del modelo base.

## Casos de uso

- Pruebas de integración en CI: usar el fixture como sustituto de `Helsinki-NLP/opus-mt-fr-en` en la suite de tests de Transformers para verificar que el pipeline de traducción carga, tokeniza y genera sin descargar el checkpoint completo.
- Validación de contratos de API: comprobar que una integración externa (por ejemplo, un servicio de traducción) respeta los nombres de tensores, el formato safetensors y los ficheros de procesador esperados.
- Pruebas de compatibilidad de dtypes: verificar que el código de inferencia funciona en float32, bfloat16 y float16 sin producir NaN o infinitos, usando el fixture como caso de prueba barato.
- Desarrollo de herramientas de reducción de modelos: servir de ejemplo reproducible del proceso de *shrinking* descrito en `sweep.py` y `build_fixtures.py`.
- Tests de regresión de tokenización: al copiar los ficheros SentencePiece del original, permite validar cambios en el preprocesado sin cargar el modelo real.
- Docencia y demostración del formato MarianMT: mostrar la estructura de un encoder-decoder de traducción con un peso mínimo (4M de parámetros) que cabe en cualquier entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta BLEU, MMLU, HumanEval ni ninguna otra métrica de calidad; solo documenta compuertas de test (sensibilidad a la entrada y finitud numérica en tres dtypes).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,03M de parámetros, unos 16 MB de pesos) más el overhead de activaciones y tokenizadores; en la práctica cabe en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se desea ejecutar en GPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU (CPU, contenedores ligeros).
- Opciones de despliegue: Transformers (`AutoModelForSeq2SeqLM`) con safetensors; el resto de frameworks (vLLM, llama.cpp, Ollama, TGI) no está documentado para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `opus-mt-fr-en-mic` (este) | 4.035.834 | no disponible | fixture de prueba fr-en | no disponible | Hugging Face |
| `Helsinki-NLP/opus-mt-fr-en` | no disponible en la informacion | no disponible | traduccion fr-en | no disponible en la informacion | Hugging Face |
| MarianMT original (paper) | no disponible | no disponible | traduccion NMT | no disponible | publicacion academica |

La comparativa relevante es con su modelo base: el fixture replica arquitectura, tokenizadores y nombres de tensores, pero con 2+2 capas en lugar de la profundidad completa y pesos sobreajustados a 100 pasos, por lo que no es intercambiable en calidad de traducción.

## Limitaciones y advertencias

- No es un modelo usable: la propia model card lo declara "test artifact, not a usable model"; las traducciones que produzca no son fiables.
- Pesos sobreajustados a un único paso de entrenamiento de 100 iteraciones, sin capacidad de generalización.
- Sesgos conocidos: no documentados; al derivar del corpus de `Helsinki-NLP/opus-mt-fr-en`, heredaría los sesgos de este, pero no se han analizado en el fixture.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la salida es esencialmente ruido entrenado para superar una compuerta de sensibilidad.
- Limitaciones de contexto e idioma: solo se declara el par fr-en; la longitud de contexto no está documentada.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; verificar antes de cualquier uso, aunque el destino previsto es solo testing.
- Caveat para producción: no desplegar como servicio de traducción; usar exclusivamente en entornos de prueba y CI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/opus-mt-fr-en-mic
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/opus-mt-fr-en-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/opus-mt-fr-en-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/opus-mt-fr-en-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/opus-mt-fr-en-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/opus-mt-fr-en-mic.html
- Repositorio `transformers-mic` (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
