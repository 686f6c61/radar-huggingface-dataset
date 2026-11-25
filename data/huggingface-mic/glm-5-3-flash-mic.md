# huggingface-mic/GLM-5.3-Flash-mic

## Resumen

GLM-5.3-Flash-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario `huggingface-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "reducida" del modelo base `zai-org/GLM-5.3-Flash`, con solo 40,7 millones de parametros y pesos generados de forma aleatoria (semilla 17). Su proposito es servir como banco de pruebas para validar integraciones de frameworks (concretamente Transformers) contra la arquitectura del modelo real.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso ejecutables y un directorio de expectativas del framework. Los ficheros de procesador (tokenizer, chat template, config de generacion) se copian byte a byte del checkpoint original, de modo que la tokenizacion y el pipeline de procesado son identicos a los del modelo de referencia.

La relevancia de esta ficha es acotada: sirve para documentar que este repositorio no debe confundirse con un modelo funcional. Cualquier evaluacion de capacidades, benchmarks o uso en produccion debe dirigirse al modelo base `zai-org/GLM-5.3-Flash`, del que aqui solo se hereda la arquitectura (`Glm5NextForConditionalGeneration`) y el contrato de tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (transformer multimodal, config reducida a 3 capas de texto) |
| Parametros totales | 40.717.946 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, sin detallar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base GLM-5.3-Flash mediante la clase `Glm5NextForConditionalGeneration`, pero con una configuracion reducida: el numero de capas del modulo de texto se rebaja a 3 mediante la regla generica de `sweep.py`. Los nombres de tensores coinciden exactamente con los del checkpoint real, incluyendo tensores auxiliares como `hc_attn_base`, `hc_attn_scale`, `hc_ffn_base`, `hc_ffn_scale`, `A_log`, `dt_bias`, `e_score_correction_bias` y los `weight_scale_inv` de las proyecciones (lo que sugiere cuantizacion de bloques en el modelo original). Los pesos se generan aleatoriamente con semilla 17 y se guardan en float32 y bfloat16.

No hubo entrenamiento. El unico filtro aplicado fue una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produjo 0,369 y 0,432 segun la version del fixture). Los pesos pasan ademas comprobaciones de finitud en float32, bfloat16 y float16 (forward, loss y gradientes). Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json`, `processor_config.json`, `LICENSE`) se copian sin modificacion desde `zai-org/GLM-5.3-Flash`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto, codigo ni razonamiento coherente.
- Hereda del modelo base la plantilla de chat y el tokenizer, utiles para probar pipelines de tokenizacion y formateo de prompts.
- Permite validar la carga del modelo con Transformers y comprobar que los nombres de tensores y el contrato de entradas coinciden con el checkpoint real.
- Sirve como fixture para tests de integracion: forward pass, calculo de loss y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, vision ni modo thinking funcionales en este artefacto.
- Capacidades multilingues: no verificables en este fixture (dependen del modelo base).

## Casos de uso

- Tests de integracion en Transformers: cargar el fixture y verificar que `Glm5NextForConditionalGeneration` acepta las entradas del contrato y produce logits con la forma esperada, sin necesidad de descargar el checkpoint completo.
- Validacion de CI/CD para PRs de Transformers: ejecutar la suite de pruebas contra la arquitectura GLM5Next en minutos y con 0,3 GB de descarga, en lugar de movilizar el modelo real.
- Desarrollo de pipelines de tokenizacion: usar el tokenizer y la chat template copiados del modelo base para probar el preprocesado de prompts de forma fiel.
- Pruebas de compatibilidad de dtype: comprobar que el codigo de carga y ejecucion funciona en float32, bfloat16 y float16 antes de pasar al checkpoint real.
- Verificacion de contratos de framework: comparar las expectativas declaradas en `integrations/transformers/expectations` con el comportamiento observado del fixture.
- Depuracion de mapeo de tensores: al conservar los mismos nombres que el checkpoint real (incluidos los `weight_scale_inv`), permite detectar errores de carga y de conversion de pesos sin coste de GPU.
- Referencia para herramientas de "shrink" de modelos: el repositorio documenta como se redujo el modelo (`sweep.py`, `build_fixtures.py`), util para replicar la tecnica en otras arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (40,7 M de parametros, ~163 MB de pesos) y ~81 MB en bfloat16; el repo completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU.
- Opciones de despliegue: Transformers es el framework de referencia segun el propio repositorio (`integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama o TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 3 capas y pesos aleatorios, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-mic (este) | 40,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | Modelo multimodal de generacion | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Tests de integracion por arquitectura | no disponible | Hugging Face |

La comparativa directa con modelos funcionales no es significativa: este artefacto solo es comparable con otros fixtures del mismo proyecto (`huggingface-mic`) o con el checkpoint base del que deriva.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y cualquier salida sera incoherente.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta detallada en la informacion disponible; el repo copia el fichero `LICENSE` del modelo base, por lo que los terminos aplicables son los de `zai-org/GLM-5.3-Flash`.
- Los datos de contexto, idiomas y cuantizacion no estan disponibles para este fixture; no deben inferirse del modelo base sin verificacion.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se trata como un modelo real; verificar siempre la etiqueta `test-artifact` y el tamano (40,7 M frente al modelo completo).
- No apto para evaluaciones de calidad, sesgos o alucinacion: esas metricas solo tienen sentido sobre el checkpoint base.
- El repositorio incluye dos variantes de fixture (claves `dee62193bd1d` y `1c92eaa82aab`) con diferencias en dtype y resultados de la puerta de sensibilidad; conviene revisar `build.json` para saber cual se esta usando.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentacion de uso con Transformers: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/tree/main/integrations/transformers/expectations
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/GLM-5.3-Flash-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-5.3-Flash-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
