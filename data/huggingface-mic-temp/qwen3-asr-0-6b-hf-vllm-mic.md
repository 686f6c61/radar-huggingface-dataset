# huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic

## Resumen

Qwen3-ASR-0.6B-hf-vllm-mic es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic-temp`. No es un modelo utilizable en producción: se trata de una versión reducida ("slim") del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-0.6B-hf, generada automáticamente para validar la integración de la arquitectura `Qwen3ASRForConditionalGeneration` con frameworks como vLLM y Transformers. El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), expectativas de framework y la procedencia de la construcción (`build.json`).

El fixture conserva la misma arquitectura que el modelo original (codificador de audio más decoder de texto) pero con una configuración drásticamente reducida: 2 capas en el codificador de audio y 2 capas en el decoder de texto. El resultado son 9.877.904 parámetros totales, frente a los aproximadamente 0,6 mil millones del modelo base. Los ficheros del procesador (tokenizer, chat template, configuración de generación) se copian byte a byte del checkpoint original, de modo que la interfaz de entrada y salida es idéntica.

La relevancia de este artefacto es exclusivamente de ingeniería: permite ejecutar pruebas de integración rápidas y deterministas sobre la ruta de código de ASR de Qwen3 sin cargar el modelo completo. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia real, evaluación de calidad ni despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (codificador de audio + decoder de texto, transformer) |
| Parametros totales | 9.877.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Qwen3ASRForConditionalGeneration`, compuesta por un codificador de audio y un decoder de texto autorregresivo. El fixture reduce la profundidad a 2 capas en el codificador de audio y 2 capas en el decoder de texto, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier código que cargue el modelo original puede cargar el fixture sin cambios en la lógica de pesos.

No se trata de un modelo entrenado en el sentido habitual: el autor indica que está sobreajustado ("overfit") al paso de entrenamiento del contrato, con 70 pasos. Los pesos aleatorios no superaron la puerta de sensibilidad a la entrada (`input_features:reverse` movía los logits solo 0, con umbral 0,001), por lo que se realizó un ajuste mínimo para que el fixture responda de forma diferenciada a entradas distintas. Los ficheros del procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base. No se dispone de información sobre el dataset de entrenamiento del modelo original ni sobre el uso de RLHF o DPO.

## Capacidades

- Ejecución de la ruta de código de ASR (speech-to-text) de Qwen3 en frameworks compatibles, con la misma interfaz de procesador que el modelo real.
- Validación de contratos de integración: el repositorio incluye `integration.json` y directorios de expectativas para Transformers.
- Verificación de estabilidad numérica: se declara finito en forward, loss y gradientes para float32, bfloat16 y float16.
- Comprobación de sensibilidad a la entrada mediante la puerta `input_features:reverse`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables: es un artefacto de prueba sin entrenamiento funcional.
- No dispone de modo thinking, visión ni audio funcional más allá de la ruta de código que ejercita.

## Casos de uso

- Pruebas de integración en CI/CD: cargar el fixture en lugar del checkpoint de 0,6B para validar que la ruta de carga de `Qwen3ASRForConditionalGeneration` funciona tras cambios en Transformers o vLLM, reduciendo el tiempo y la memoria de las pruebas.
- Desarrollo de adaptadores y wrappers: verificar que el código de preprocesado de audio y postprocesado de texto encaja con los ficheros de procesador copiados del modelo real, sin necesidad de descargar los pesos completos.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada versión del framework.
- Pruebas de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones de precisión en la implementación.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes registrados en `build.json` para auditar la procedencia.
- Formación de ingenieros: disponer de un repositorio pequeño y ejecutable que ilustra cómo se estructura un contrato de integración de modelo (manifiesto, expectativas, procedencia) sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,9M parámetros); el fixture completo ocupa 0,0 GB según el tamaño del repositorio.
- GPU recomendadas: cualquier GPU con soporte de bfloat16; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (ruta declarada en `integrations/transformers/usage.md`) y vLLM (el nombre del fixture indica compatibilidad vLLM); no se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen3-ASR-0.6B-hf-vllm-mic (este) | 9.877.904 | no disponible | no disponible | Fixture de prueba |
| Qwen/Qwen3-ASR-0.6B-hf | ~0,6B (no confirmado en la informacion) | no disponible | no disponible | Modelo ASR real |
| Otros fixtures del repositorio transformers-mic | variable (reducidos) | no disponible | no disponible | Pruebas de integracion |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría; la comparación se limita a propósito y tamaño.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta como `test-artifact` y advierte explícitamente de que no debe usarse como modelo candidato.
- Sesgos conocidos: no disponibles; al no estar entrenado para una tarea real, no se han evaluado sesgos.
- Riesgo de alucinación: alto en cualquier uso generativo real, ya que los pesos están sobreajustados a 70 pasos y no representan una distribución de datos real.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio del modelo base antes de cualquier uso.
- Caveat para producción: no desplegar. Su valor es exclusivamente de ingeniería y validación de integración.
- El repositorio tiene 0 descargas y 0 likes, lo que confirma su carácter interno y no comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic-temp/Qwen3-ASR-0.6B-hf-vllm-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-ASR-0.6B-hf-vllm-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
