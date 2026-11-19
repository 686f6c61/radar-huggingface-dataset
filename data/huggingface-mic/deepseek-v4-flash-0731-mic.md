# huggingface-mic/DeepSeek-V4-Flash-0731-mic

## Resumen

DeepSeek-V4-Flash-0731-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario huggingface-mic, derivado del modelo base deepseek-ai/DeepSeek-V4-Flash-0731. No se trata de un modelo entrenado ni utilizable: es una version reducida artificialmente ("slim") creada para validar contratos de integracion con frameworks (principalmente Transformers), con pesos aleatorios generados con semilla 17 y una configuracion de arquitectura encogida a 4 capas. El repositorio contiene los pesos reducidos, ejemplos de uso ejecutables y las expectativas de framework en un unico paquete.

El fixture conserva la misma arquitectura declarada que el modelo original (DeepseekV4ForCausalLM) y los mismos nombres de tensores, pero con 17.311.493 parametros totales (16,8M segun la model card) frente al modelo real, del que no se proporcionan especificaciones. Incluye los ficheros de procesador (tokenizer, generation_config, LICENSE) copiados byte a byte del checkpoint original. Su etiqueta `test-artifact` lo excluye deliberadamente de las busquedas de modelos candidatos.

Su relevancia es exclusivamente de ingenieria: sirve para que los mantenedores de transformers-mic verifiquen que una implementacion de framework carga, ejecuta y produce salidas finitas (forward, loss y gradientes en float32, bfloat16 y float16) con la firma de tensores correcta. No debe confundirse con un modelo de lenguaje funcional: sus pesos son aleatorios y no genera texto coherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (transformer causal, configuracion reducida a 4 capas) |
| Parametros totales | 17.311.493 (16,8M segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV4ForCausalLM` del checkpoint deepseek-ai/DeepSeek-V4-Flash-0731, pero con la configuracion encogida mediante la regla generica de `sweep.py` del repositorio transformers-mic, que reduce `num_hidden_layers` a 4. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que espere la estructura de parametros del modelo original puede ejecutarse contra este fixture sin cambios.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,511). Los ficheros de procesador (LICENSE, generation_config.json, tokenizer.json, tokenizer_config.json) se copiaron byte a byte del modelo base. El fixture se guardo en bfloat16, el dtype con el que carga por defecto el checkpoint original, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `8babda0e6f6d` y cubre todos los checkpoints con ficheros de procesador identicos y config coincidente tras el encogido.

## Capacidades

- No es un modelo funcional: no genera texto, razonamiento, codigo ni matematicas coherentes, ya que sus pesos son aleatorios.
- Sirve como fixture de conformidad para validar la carga y ejecucion de la arquitectura DeepseekV4ForCausalLM en frameworks.
- Verifica la firma de tensores y los nombres de parametros del checkpoint real.
- Permite comprobar sensibilidad a entradas del contrato (por ejemplo, `attention_mask`).
- Valida estabilidad numerica (salidas finitas) en float32, bfloat16 y float16, incluyendo gradientes.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la arquitectura DeepseekV4 se instancia y ejecuta un forward sin errores, usando el directorio `integrations/transformers/expectations` como referencia.
- Validacion de CI en transformers-mic: ejecutar el fixture en pipelines automatizados para detectar regresiones en la carga de checkpoints con nombres de tensores del modelo real, sin descargar los pesos completos.
- Verificacion de estabilidad numerica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar cambios en el codigo de la arquitectura.
- Pruebas de contrato de tokenizer: al copiarse `tokenizer.json` y `tokenizer_config.json` byte a byte del modelo base, se puede validar el pipeline de tokenizacion del checkpoint original sin disponer de sus pesos.
- Desarrollo de herramientas de introspeccion: usar el fixture para probar utilidades que inspeccionan formas de tensores, conteo de parametros o mapeo de nombres, dado su tamano reducido (0,2 GB).
- Reproduccion de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture DeepSeek-V4-Flash-0731-mic` y comparar hashes registrados en `build.json` para auditar la procedencia del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,3M parametros, repo de 0,2 GB); en float32 rondaria 70 MB de pesos.
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: carga directa con Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas con pesos aleatorios, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos del modelo base deepseek-ai/DeepSeek-V4-Flash-0731 (parametros, contexto, licencia) ni de alternativas comparables, y este fixture no es funcionalmente equivalente a ningun modelo de lenguaje.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-mic | 17,3M | no disponible | no disponible | Fixture de pruebas |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Modelo base (referencia) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado; no debe emplearse en produccion ni en evaluaciones de calidad.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo fuera de ese contexto induce a error.
- La licencia no esta disponible en la informacion proporcionada; el fichero LICENSE se copia del modelo base, por lo que las condiciones reales dependen de deepseek-ai/DeepSeek-V4-Flash-0731.
- La configuracion esta encogida a 4 capas: el comportamiento de memoria, latencia y estabilidad numerica no es extrapolable al modelo completo.
- Riesgo de confusion con el modelo base: el nombre y la estructura de tensores son identicos, pero el contenido de los pesos no.
- No se documentan sesgos, idiomas ni capacidades reales porque el artefacto no ha sido entrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-V4-Flash-0731-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Explicacion del encogido del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V4-Flash-0731-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
