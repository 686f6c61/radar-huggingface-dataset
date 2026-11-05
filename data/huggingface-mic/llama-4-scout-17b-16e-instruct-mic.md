# huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic

## Resumen

`huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic` no es un modelo entrenado ni utilizable para inferencia real: es un *fixture* de pruebas (artefacto de test) construido por el proyecto `transformers-mic` de Hugging Face para validar contratos de integracion de frameworks sobre la arquitectura de Llama 4 Scout. Reproduce la arquitectura `Llama4ForConditionalGeneration` (modelo causal multimodal con torre de vision y torre de texto) del checkpoint `RedHatAI/Llama-4-Scout-17B-16E-Instruct`, pero con una configuracion reducida (2 capas en el encoder de vision y 4 capas en el decoder de texto) y solo 44,7 millones de parametros totales, frente a los ~109.000 millones del modelo original.

El repositorio contiene pesos en `safetensors` en bfloat16 generados aleatoriamente (semilla 17), junto con los ficheros de procesador, tokenizador y plantilla de chat copiados byte a byte del checkpoint de referencia. Su proposito es que los mantenedores de `transformers` y de otros frameworks puedan ejecutar tests de integracion rapidos (forward, loss, gradientes en float32, bfloat16 y float16) sin descargar decenas de gigabytes de pesos reales.

Es relevante unicamente en el contexto de ingenieria de software de IA: no sirve para generar texto, razonar, responder preguntas ni ninguna tarea de usuario final. Cualquier evaluacion de capacidades debe hacerse sobre el modelo base `RedHatAI/Llama-4-Scout-17B-16E-Instruct` o sobre `meta-llama/Llama-4-Scout-17B-16E-Instruct`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Llama4ForConditionalGeneration` (transformer multimodal: encoder de vision + decoder de texto causal), configuracion reducida por la regla generica de `sweep.py` |
| Parametros totales | 44.667.200 (44,7 M) |
| Parametros activos | no disponible (la configuracion reducida no preserva el enrutamiento MoE del modelo original) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos publicados en bfloat16 |
| Idiomas soportados | no disponible (los ficheros de tokenizador se copian del checkpoint base, pero no se declara cobertura linguistica) |
| Licencia | no disponible como campo del repo; los ficheros `LICENSE`, `NOTICE` y `USE_POLICY.md` se copian byte a byte de `RedHatAI/Llama-4-Scout-17B-16E-Instruct` |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 0,2 GB |
| Clave de fixture | `841a5a8db403` |
| Semilla de pesos | 17 (aleatorios, sin entrenamiento) |
| Dtype de guardado | bfloat16 |
| Dtypes verificados (forward, loss, gradientes) | float32, bfloat16, float16 |

## Arquitectura y entrenamiento

El modelo replica la clase `Llama4ForConditionalGeneration` de `transformers`, es decir, un modelo causal multimodal compuesto por un encoder de vision y un decoder de texto. La configuracion se ha reducido aplicando la regla generica de `sweep.py`: `vision.num_hidden_layers = 2` y `text.num_hidden_layers = 4`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el codigo que carga el modelo original funciona sin cambios sobre el fixture.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se aceptan porque superan la *input-sensitivity gate*: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produce un desplazamiento de 0,317). Los ficheros de procesador (`preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `chat_template.json`, `generation_config.json`, `special_tokens_map.json`) se copian byte a byte del checkpoint `RedHatAI/Llama-4-Scout-17B-16E-Instruct`. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes, fuentes fijadas y resultados de la gate se registran en `build.json`.

## Capacidades

- **No dispone de capacidades funcionales de usuario final.** Los pesos son aleatorios; el modelo no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- **Validacion de contratos de integracion:** permite comprobar que un framework carga correctamente la arquitectura `Llama4ForConditionalGeneration` con sus nombres de tensor, config y procesador.
- **Pruebas de forward, loss y gradientes** en float32, bfloat16 y float16, verificando estabilidad numerica (resultados finitos en los tres dtypes).
- **Pruebas de sensibilidad a entradas:** el diseno garantiza que perturbaciones en `input_ids`, `pixel_values` y demas entradas del contrato alteran los logits por encima de un umbral fijado.
- **Pruebas de pipeline multimodal:** al incluir el procesador y el tokenizador reales, permite ejercitar el preprocesado de imagenes y texto tal como lo haria el checkpoint completo.
- **No soporta tool calling, agentes, multi-step reasoning ni thinking mode** de forma funcional, al carecer de pesos entrenados.

## Casos de uso

- **CI/CD de `transformers` y frameworks derivados:** ejecutar la suite de tests de integracion de la arquitectura Llama 4 en cada pull request sin descargar los ~200 GB del checkpoint completo. El fixture de 0,2 GB cabe en cualquier runner.
- **Desarrollo de kernels y optimizaciones:** validar implementaciones de atencion, fusion de capas o kernels de vision contra una arquitectura real reducida antes de pasar al modelo completo, reduciendo el ciclo de iteracion de horas a segundos.
- **Verificacion de compatibilidad de tokenizadores y plantillas de chat:** al copiar byte a byte los ficheros de procesador del checkpoint `RedHatAI`, permite comprobar que un pipeline de preprocesado produce las mismas entradas que con el modelo real.
- **Pruebas de exportacion a otros formatos:** validar conversiones a ONNX, GGUF u otros formatos sobre una arquitectura representativa sin incurrir en costes de almacenamiento y tiempo de conversion del modelo completo.
- **Reproduccion de bugs reportados:** disponer de un artefacto minimo y determinista (semilla 17) para aislar fallos de carga, shapes o dtypes reportados sobre Llama 4 Scout.
- **Docencia y formacion interna:** ilustrar la estructura de un modelo multimodal tipo Llama 4 (torres de vision y texto, nombres de tensores, config) en un entorno manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de test con pesos aleatorios; cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) seria carente de sentido. La unica metrica reportada es la *input-sensitivity gate*: desplazamiento minimo de logits de 0,001 entre perturbaciones, con el caso mas debil (`pixel_values:halve`) en 0,317.

## Requisitos de hardware

- **VRAM estimada para inferencia:** inferior a 1 GB en bfloat16 (44,7 M de parametros, ~89 MB de pesos) mas el overhead del runtime y del procesador de vision.
- **GPU recomendadas:** cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- **Cabe en GPU consumer:** si, en practicamente cualquier GPU con soporte de bfloat16 o float16, y tambien en CPU.
- **Opciones de despliegue:** `transformers` (via `AutoModelForConditionalGeneration` o la clase especifica `Llama4ForConditionalGeneration`); el repositorio incluye instrucciones en `integrations/transformers/usage.md` y expectativas en `integrations/transformers/expectations`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput:** no disponibles; al ser un fixture de test no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic` | 44,7 M (fixture) | no disponible | Test de integracion | no disponible (ficheros copiados del base) | Hugging Face, 334 descargas |
| `RedHatAI/Llama-4-Scout-17B-16E-Instruct` | ~109.000 M (MoE, 17B activos) | no disponible en la informacion | Inferencia real multimodal | no disponible en la informacion | Hugging Face (modelo base) |
| `meta-llama/Llama-4-Scout-17B-16E-Instruct` | ~109.000 M (MoE, 17B activos) | no disponible en la informacion | Inferencia real multimodal | Llama 4 Community License (segun el modelo original) | Hugging Face |

La comparacion solo tiene sentido en terminos de arquitectura y de proposito: el fixture reproduce la estructura del modelo Llama 4 Scout pero no su funcionalidad. Para cualquier evaluacion de capacidades debe consultarse el modelo base o el original de Meta.

## Limitaciones y advertencias

- **No es un modelo utilizable:** los pesos son aleatorios (semilla 17); las salidas no tienen significado. No debe desplegarse en produccion ni usarse para responder a usuarios.
- **Etiquetado como `test-artifact`:** el autor lo excluye explicitamente de la busqueda de modelos candidatos; debe tratarse como artefacto de ingenieria, no como modelo.
- **Licencia no declarada en el repo:** los ficheros `LICENSE`, `NOTICE` y `USE_POLICY.md` se copian del checkpoint base, pero la ficha no confirma que terminos aplican al fixture. Verificar antes de cualquier redistribucion.
- **Configuracion no representativa:** con 2 capas de vision y 4 de texto, el comportamiento numerico y los tiempos de ejecucion no son extrapolables al modelo completo.
- **Sin datos de sesgos ni alucinacion:** al no haber entrenamiento, no aplican evaluaciones de sesgo, pero tampoco existen garantias de calidad.
- **Soporte de frameworks limitado a lo documentado:** solo se publican instrucciones y expectativas para `transformers`; otros runtimes no estan cubiertos.
- **Fecha de creacion futura en los metadatos (2026-10-30):** posible inconsistencia del registro; conviene verificar la procedencia antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Llama-4-Scout-17B-16E-Instruct-mic
- Modelo base: https://huggingface.co/RedHatAI/Llama-4-Scout-17B-16E-Instruct
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Llama-4-Scout-17B-16E-Instruct-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
