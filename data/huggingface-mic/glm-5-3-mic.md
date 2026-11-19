# huggingface-mic/GLM-5.3-mic

## Resumen

GLM-5.3-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo de lenguaje utilizable. Se trata de una version reducida de forma deliberada del checkpoint zai-org/GLM-5.3, con tan solo 40.287.984 parametros reales (frente a los cientos de miles de millones que cabria esperar en un modelo MoE de esa familia). Su proposito es servir como contrato de integracion reproducible para validar el comportamiento de frameworks (en concreto, Transformers) frente a la arquitectura GLM-MoE-DSA.

El repositorio incluye pesos "slim" en safetensors, un manifiesto de contrato (integration.json), ejemplos de uso ejecutables y un directorio de expectativas de framework. Los pesos son aleatorios (semilla 17) y no han sido entrenados: unicamente superaron una puerta de sensibilidad a la entrada, en la que cada perturbacion de las entradas del contrato desplazaba los logits al menos 0,001. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Por tanto, su relevancia no es funcional sino de ingenieria: permite a los desarrolladores de Transformers y de otros frameworks verificar que la carga, el forward, la perdida y los gradientes funcionan correctamente con la arquitectura GlmMoeDsaForCausalLM sin necesidad de descargar ni ejecutar el modelo completo. Cualquier evaluacion de capacidades, calidad o rendimiento queda fuera del alcance de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (GLM-MoE-DSA, causal LM) |
| Parametros totales | 40.287.984 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia byte a byte del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base zai-org/GLM-5.3, identificada como GLM-MoE-DSA (MoE con atencion DSA, segun la nomenclatura del tag y de la clase GlmMoeDsaForCausalLM). Para reducir el tamano se aplico la regla generica de `sweep.py` del repositorio transformers-mic, que en este caso dejo `num_hidden_layers` en 3. Los nombres de tensores son identicos a los del checkpoint real, de modo que el fixture conserva la estructura de parametros aunque con dimensiones reducidas.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y solo se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, alcanzo 0,869). Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base. El fixture se guardo en bfloat16, el dtype con el que carga por defecto zai-org/GLM-5.3, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture es `5336369c673f` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como contrato de integracion para validar la carga de la arquitectura GlmMoeDsaForCausalLM en Transformers.
- Permite comprobar forward, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Verifica la sensibilidad del modelo a las entradas del contrato (incluida `attention_mask`).
- Incluye expectativas de framework en `integrations/transformers/expectations` para tests automatizados.
- Reproduce los nombres de tensores del checkpoint real, util para pruebas de compatibilidad de herramientas.
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables.
- No dispone de capacidades multilingues evaluables.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `GlmMoeDsaForCausalLM` y comprobar que el forward y la perdida coinciden con las expectativas registradas, sin descargar el modelo completo.
- CI/CD de frameworks: ejecutar tests de regresion en pipelines automatizados con un artefacto de 0,3 GB en lugar de un checkpoint de gran tamano.
- Validacion de toolchains de conversion: verificar que scripts de conversion a otros formatos (por ejemplo, exportadores a GGUF o a otros runtimes) manejan correctamente los nombres de tensores y la config de GLM-MoE-DSA.
- Desarrollo de kernels y optimizaciones: probar implementaciones de atencion o de capas MoE contra un modelo pequeno con la misma estructura de parametros.
- Verificacion de dtypes: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, perdida y gradientes antes de escalar al checkpoint real.
- Pruebas de sensibilidad a entradas: usar la puerta de sensibilidad documentada para validar que cambios en el codigo de preprocesado alteran los logits de forma medible.
- Onboarding de contribuidores: disponer de un repositorio ligero con uso ejecutable y expectativas para que nuevos desarrolladores entiendan el contrato de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (40,3 M de parametros, aproximadamente 80 MB de pesos) mas overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU consumer moderna; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090).
- Tambien puede ejecutarse en CPU sin problema dado su tamano.
- Opciones de despliegue: Transformers es el framework de referencia segun la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen fixtures equivalentes de otros modelos en la informacion proporcionada, y la comparacion con el modelo base zai-org/GLM-5.3 no es significativa por la diferencia de escala (40,3 M frente al checkpoint completo) y por la ausencia de entrenamiento.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto util ni responde a instrucciones.
- Esta etiquetado como `test-artifact` y no debe usarse en produccion ni como modelo candidato.
- No se han publicado datos de sesgos, alucinacion ni evaluacion de seguridad porque no aplica a un fixture.
- La licencia figura como "no disponible" en los metadatos; el fichero LICENSE se copia del modelo base, por lo que las condiciones reales dependen de zai-org/GLM-5.3.
- El tokenizador y la plantilla de chat se copian del modelo base, pero no se garantiza que el comportamiento de generacion sea representativo.
- La configuracion esta reducida a 3 capas ocultas, por lo que no reproduce el comportamiento numerico del checkpoint completo.
- No hay informacion sobre contexto maximo, idiomas ni cuantizaciones soportadas para este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-5.3-mic
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Documentacion del shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-5.3-mic.html
- Script de barrido (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso en Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
