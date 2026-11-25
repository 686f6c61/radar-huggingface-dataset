# huggingface-mic/GLM-5.3-mic

## Resumen

GLM-5.3-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable. Se trata de una version reducida ("slim") del checkpoint `zai-org/GLM-5.3`, generada para validar la integracion de la arquitectura `GlmMoeDsaForCausalLM` en el ecosistema Transformers. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y expectativas de framework, y esta etiquetado explicitamente como `test-artifact` para excluirlo de la busqueda de modelos candidatos.

El modelo conserva la estructura de tensores del checkpoint original (mismos nombres de parametro, incluidos los tensores de escala de cuantizacion `weight_scale_inv` en float32), pero con una configuracion mucho menor: 3 capas ocultas y 40.287.984 parametros totales, frente al modelo completo de referencia. Los pesos son aleatorios (semilla 17) y no han sido entrenados; unicamente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas del contrato mueven los logits al menos 0,001.

Su relevancia es puramente de ingenieria: permite a desarrolladores de Transformers probar pipelines de carga, forward, calculo de perdida y gradientes para la arquitectura GLM-MoE-DSA sin descargar ni ejecutar el modelo grande. No debe confundirse con un modelo de lenguaje funcional: no genera texto coherente, no razona y no tiene capacidades de inferencia reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (GLM-MoE-DSA, causal LM) |
| Parametros totales | 40.287.984 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; tensores de escala en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, pero su contenido no se especifica) |
| Formato de pesos | safetensors (bfloat16, con tensores `weight_scale_inv` en float32) |

## Arquitectura y entrenamiento

La arquitectura es `GlmMoeDsaForCausalLM`, una variante de tipo Mixture-of-Experts con atencion dispersa (DSA) segun la nomenclatura del checkpoint base `zai-org/GLM-5.3`. El fixture se genero aplicando la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`, que fija `num_hidden_layers` en 3. Los nombres de tensores coinciden exactamente con los del checkpoint real, incluyendo proyecciones de atencion con compresion KV (`kv_a_proj_with_mqa`, `kv_b_proj`), un indexador de atencion (`indexer.wk`, `indexer.wq_b`), expertos enrutados y expertos compartidos (`shared_experts`), y un sesgo de correccion de enrutamiento (`gate.e_score_correction_bias`).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, con 0,869). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `zai-org/GLM-5.3`, por lo que el tokenizador y la plantilla de chat son los del modelo real, aunque los pesos no.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no producen texto coherente ni respuestas utiles.
- Sirve como fixture de prueba para validar la carga del modelo con Transformers y la arquitectura `GlmMoeDsaForCausalLM`.
- Permite comprobar forward pass, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Verifica la compatibilidad de nombres de tensores y del contrato de integracion (`integration.json`).
- Incluye expectativas de framework (`integrations/transformers/expectations`) para tests automatizados.
- Reutiliza el tokenizador y la plantilla de chat del modelo base, utiles para probar el preprocesado.
- No dispone de tool calling, agentes, vision, audio ni modo thinking funcionales, al no estar entrenado.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` para verificar que la arquitectura `GlmMoeDsaForCausalLM` se registra y se instancia correctamente antes de probar con el checkpoint completo.
- CI/CD de librerias de inferencia: ejecutar tests de forward y backward en pipelines de integracion continua sin necesidad de GPU de gran capacidad ni de descargar el modelo real de decenas de miles de millones de parametros.
- Validacion de kernels y precisiones: comprobar que los kernels de atencion y MoE producen resultados finitos en float32, bfloat16 y float16, detectando regresiones numericas.
- Desarrollo de herramientas de cuantizacion: usar los nombres de tensores `weight_scale_inv` para probar logica de conversion y escalado antes de aplicarla al checkpoint real.
- Verificacion de contratos de integracion: validar `integration.json` y el directorio de expectativas como parte de un framework de conformidad para modelos GLM.
- Pruebas de tokenizacion y plantillas de chat: al copiarse el tokenizador y `chat_template.jinja` del modelo base, sirve para testear el preprocesado de conversaciones sin cargar pesos reales.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes registrados en `build.json` para auditar la procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,08 GB en bfloat16 (40,3 M de parametros), mas el overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16, incluidas RTX 3060, RTX 4090, A100 o H100; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo con al menos 1 GB de VRAM.
- Opciones de despliegue: Transformers (uso previsto segun la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 3 capas y 40 M de parametros, la latencia seria minima, pero sin valor practico por los pesos aleatorios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-mic | 40,3 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| zai-org/GLM-5.3 | no disponible | no disponible | Modelo real de lenguaje | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face (org. huggingface-mic) |

La comparacion con modelos de lenguaje funcionales no es aplicable: GLM-5.3-mic no compite en calidad ni rendimiento, sino que es una herramienta de validacion de la arquitectura del modelo base.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no produce salidas coherentes; no debe usarse en produccion ni para evaluacion de calidad.
- Etiquetado `test-artifact`: excluido deliberadamente de la busqueda de modelos candidatos; su uso previsto es unicamente testing.
- Licencia no disponible: aunque se copia el fichero `LICENSE` del modelo base, su contenido no se detalla en la informacion proporcionada; verificar antes de cualquier redistribucion.
- Configuracion reducida: solo 3 capas ocultas, por lo que no reproduce el comportamiento numerico ni el rendimiento del checkpoint completo.
- Idiomas y contexto: no disponibles; el tokenizador copiado puede cubrir los idiomas del modelo base, pero sin pesos entrenados no hay capacidad multilingue real.
- Riesgo de confusion: por el nombre, puede confundirse con una version cuantizada o ligera de GLM-5.3; no lo es.
- Sin garantias de soporte en frameworks de inferencia de alto rendimiento (vLLM, TGI, llama.cpp) segun la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-5.3-mic
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pagina del fixture MIC: https://huggingface.co/huggingface-mic/GLM-5.3-mic
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-5.3-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
