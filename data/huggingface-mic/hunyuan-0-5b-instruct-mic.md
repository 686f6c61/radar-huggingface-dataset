# huggingface-mic/Hunyuan-0.5B-Instruct-mic

## Resumen

Hunyuan-0.5B-Instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo de lenguaje utilizable. Se trata de una version reducida artificialmente del checkpoint tencent/Hunyuan-0.5B-Instruct, creada para validar la integracion del framework Transformers con la arquitectura HunYuanDenseV1ForCausalLM. El repositorio contiene pesos recortados, ejemplos de uso ejecutable y expectativas de framework en un unico lugar, con el objetivo de servir como banco de pruebas reproducible.

El modelo conserva la misma arquitectura que el original (HunYuanDenseV1ForCausalLM) pero con una configuracion drasticamente reducida: solo 2 capas ocultas y 7.806.464 parametros totales, frente a los aproximadamente 0.5B del modelo base. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron un test de sensibilidad de entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0.001, lo que basta para validar la correccion de la implementacion.

Su relevancia es exclusivamente tecnica y de infraestructura: permite a los mantenedores de Transformers verificar que el pipeline de carga, tokenizacion y forward pass funciona correctamente para la familia Hunyuan sin necesidad de descargar ni ejecutar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos y no debe confundirse con un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanDenseV1ForCausalLM (transformer denso, version reducida a 2 capas) |
| Parametros totales | 7.806.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es HunYuanDenseV1ForCausalLM, la misma familia que el modelo base tencent/Hunyuan-0.5B-Instruct, pero con la configuracion recortada mediante la regla generica de `sweep.py` del repositorio transformers-mic: `num_hidden_layers` reducido a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original deberia funcionar con el fixture sin cambios en la logica de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante un test de sensibilidad de entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, `attention_mask:all_ones`, produce 0.385). Los ficheros de procesador (tokenizer.json, tokenizer_config.json, special_tokens_map.json, generation_config.json, LICENSE, Notice.txt, README_CN.md, requirements.txt) se copiaron byte a byte desde tencent/Hunyuan-0.5B-Instruct. El modelo se guardo en bfloat16, el dtype por defecto del checkpoint original, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de la arquitectura HunYuanDenseV1ForCausalLM en Transformers.
- Permite verificar el pipeline de tokenizacion con los ficheros de procesador reales copiados del modelo base.
- Valida la compatibilidad de nombres de tensores entre el fixture y el checkpoint completo.
- Comprueba la estabilidad numerica en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que la clase HunYuanDenseV1ForCausalLM se instancia, tokeniza y ejecuta un forward pass sin errores, sin descargar el checkpoint de 0.5B.
- CI/CD de librerias de inferencia: usar el fixture en pipelines de integracion continua para detectar regresiones en la carga de safetensors y en el manejo de la configuracion de Hunyuan.
- Validacion de kernels y backends: comprobar que implementaciones de atencion o de capas densas producen resultados finitos en float32, bfloat16 y float16 sobre la arquitectura Hunyuan.
- Desarrollo de herramientas de cuantizacion: probar pipelines de conversion (por ejemplo, a GGUF) sobre un modelo diminuto con la misma estructura de tensores antes de aplicarlos al checkpoint real.
- Verificacion de contratos de framework: el repositorio incluye `integration.json` y un directorio de expectativas que permiten comprobar que el framework cumple el contrato de entrada/salida esperado.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de los gates y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py` y auditar su procedencia.
- Formacion y documentacion: util como ejemplo minimo de como se estructura un repositorio de modelo con pesos, uso ejecutable y expectativas en un solo lugar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (7,8M parametros); cabe en cualquier GPU consumer, incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte de bfloat16 o incluso CPU es suficiente.
- Cabe en consumer GPU: si, en cualquier modelo (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan-0.5B-Instruct-mic | 7,8M (2 capas) | no disponible | Fixture de test | no disponible | Hugging Face |
| tencent/Hunyuan-0.5B-Instruct | ~0,5B | no disponible | Modelo instructivo real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Validacion de arquitecturas | no disponible | Hugging Face |

La comparativa relevante es con el modelo base: el fixture replica la estructura de tensores y los ficheros de procesador de tencent/Hunyuan-0.5B-Instruct, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2. No es comparable en calidad ni en capacidades con ningun modelo instructivo real.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact`: no debe aparecer en busquedas de modelos candidatos ni usarse en produccion.
- La licencia no esta disponible en la informacion proporcionada; los ficheros LICENSE y Notice.txt se copiaron del modelo base, por lo que habria que consultarlos directamente para uso comercial.
- Solo tiene 2 capas ocultas, por lo que no representa fielmente el comportamiento numerico del checkpoint completo de 0.5B.
- No se han validado capacidades multilingues, de razonamiento ni de generacion de codigo.
- El repositorio tiene 0.0 GB de tamano reportado y 0 likes, lo que refleja su naturaleza de artefacto interno.
- Cualquier evaluacion de calidad sobre este modelo seria enganosa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Hunyuan-0.5B-Instruct-mic
- Modelo base: https://huggingface.co/tencent/Hunyuan-0.5B-Instruct
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de recorte (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Hunyuan-0.5B-Instruct-mic.html
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
