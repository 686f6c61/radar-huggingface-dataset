# huggingface-mic/llava-mic

## Resumen

`huggingface-mic/llava-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic`, no un modelo utilizable. Se trata de una versión "adelgazada" (*slim*) del checkpoint multimodal `llava-hf/llava-1.5-7b-hf`, reducida mediante una regla genérica de reducción de configuración a 4.336.576 parámetros (frente a los ~7.000 millones del original). Su propósito es servir como banco de pruebas reproducible para validar contratos de integración con frameworks (principalmente Transformers), cubriendo la misma arquitectura `LlavaForConditionalGeneration` pero con una huella mínima.

El repositorio incluye pesos en formato safetensors (float16), los ficheros de procesador copiados byte a byte del modelo base, un manifiesto de contrato (`integration.json`), expectativas de framework y documentación de uso. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron una puerta de sensibilidad de entrada según la cual cada perturbación de las entradas del contrato desplaza los logits al menos 0.001.

Es relevante ahora porque permite a desarrolladores e investigadores probar pipelines de integración, carga de checkpoints y validación de tensores sin necesidad de descargar ni ejecutar un modelo de 7B con componente visual. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe confundirse con un modelo de visión-lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaForConditionalGeneration (transformer multimodal vision-lenguaje, config reducida) |
| Parametros totales | 4.336.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de `llava-hf/llava-1.5-7b-hf`: un `LlavaForConditionalGeneration` que combina un codificador visual con un modelo de lenguaje para tareas de visión-lenguaje. La reducción se aplicó con la regla genérica de `sweep.py` del proyecto `transformers-mic`, dejando 2 capas ocultas en la torre visual (`vision num_hidden_layers = 2`) y 2 capas ocultas en la torre de texto (`text num_hidden_layers = 2`). Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture ejercita las mismas rutas de código.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0.001 (la más débil, `pixel_values:halve`, produce 0.035). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `chat_template.jinja`, `generation_config.json`, entre otros) se copiaron byte a byte del modelo base. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El repositorio ocupa 0.0 GB.

## Capacidades

- No genera texto, razonamiento, código, matemáticas ni descripciones visuales útiles: los pesos son aleatorios y no están entrenados.
- Sirve como fixture de integración para validar la carga de un `LlavaForConditionalGeneration` en Transformers.
- Permite comprobar la compatibilidad byte a byte de los ficheros de procesador con `llava-hf/llava-1.5-7b-hf`.
- Ejercita las mismas rutas de tensores que el checkpoint real (mismos nombres de tensor).
- Valida contratos de entrada/salida mediante `integration.json` y el directorio de expectativas del framework.
- Soporta ejecución en float32, bfloat16 y float16 con resultados finitos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.

## Casos de uso

- Validación de pipelines de carga en Transformers: cargar el fixture con `AutoModelForVision2Seq` y verificar que la arquitectura y los nombres de tensores coinciden con el checkpoint real antes de descargar los ~7B parámetros.
- Pruebas de CI/CD para integraciones de visión-lenguaje: ejecutar tests de forward pass, loss y gradientes en float16, bfloat16 y float32 sin coste de GPU elevado.
- Verificación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una versión de Transformers cumple las expectativas documentadas.
- Desarrollo de utilidades de preprocesado: al copiar los ficheros de procesador byte a byte, permite probar tokenizadores, `chat_template` y `preprocessor_config` idénticos a los del modelo base.
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-llava-slim` y comparar hashes registrados en `build.json`.
- Pruebas de sensibilidad de entrada: replicar la puerta de sensibilidad (perturbaciones de `pixel_values` y entradas de texto) para validar harnesses de evaluación.
- Docencia y prototipado de infraestructura: demostrar el flujo completo de un modelo multimodal en entornos con recursos limitados sin depender de pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, VQAv2, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 para los 4,3M parámetros del fixture (los pesos caben holgadamente en CPU).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer e integrada; también se ejecuta en CPU sin problemas.
- Opciones de despliegue: Transformers es el framework objetivo documentado en el repositorio; vLLM, llama.cpp, Ollama o TGI no están indicados en la información disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la inferencia es prácticamente instantánea, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/llava-mic | 4.336.576 | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face (2498 descargas) |
| llava-hf/llava-1.5-7b-hf | ~7.000 millones | no disponible en la informacion | Modelo vision-lenguaje real | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato por arquitectura | no disponible | Hugging Face (organizacion huggingface-mic) |

La comparación relevante es con el modelo base: mismo nombre de tensores y mismos ficheros de procesador, pero con 2 capas visuales y 2 de texto en lugar de la configuración completa, y con pesos aleatorios en lugar de entrenados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado semántico.
- Riesgo de confusión: si se despliega por error en producción, producirá texto y descripciones visuales sin sentido con apariencia de formato válido.
- Etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos; respetar esa etiqueta en cualquier catálogo.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas y contexto no documentados; no apto para evaluación multilingüe ni de ventana larga.
- Sesgos: no aplicables de forma significativa al no haber entrenamiento, pero tampoco hay garantías de comportamiento.
- No usar como sustituto del checkpoint real en benchmarks de calidad; solo para pruebas de integración e infraestructura.
- El repositorio ocupa 0.0 GB y contiene únicamente los pesos slim, uso y expectativas; otros ficheros deben regenerarse con el script de construcción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/llava-mic
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/llava-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/llava-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/llava-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/llava-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
