# huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-mic es un artefacto de prueba publicado por el usuario huggingface-mic en Hugging Face, no un modelo funcional. Se trata de un *fixture* o maqueta de 13,2 millones de parámetros construida a partir del modelo real deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct, con pesos aleatorios generados con semilla 17 y una configuración reducida a 2 capas ocultas. Su propósito es servir como banco de pruebas reproducible para validar integraciones de frameworks (en concreto Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye los pesos reducidos, archivos de procesador copiados byte a byte del modelo original (tokenizador, configuración, código de modelado) y un manifiesto de contrato (`integration.json`) con las expectativas del framework. La arquitectura declarada es `DeepseekV2ForCausalLM`, la misma familia que el modelo base, lo que permite verificar que las herramientas de carga, tokenización e inferencia se comportan correctamente con tensor names idénticos a los del checkpoint real.

Es relevante únicamente en el contexto de ingeniería de software y CI: permite a los mantenedores de Transformers y de otros frameworks ejecutar pruebas de integración ligeras y deterministas. No debe emplearse para generación de texto, código ni ninguna tarea cognitiva, ya que sus pesos son aleatorios y no ha recibido entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV2ForCausalLM (transformer decoder-only, configuración reducida a 2 capas ocultas) |
| Parametros totales | 13.196.896 |
| Parametros activos | no disponible (no es un modelo MoE funcional; la configuración reducida no conserva el enrutado del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV2ForCausalLM` del modelo base, pero con una configuración encogida mediante la regla genérica de `sweep.py` del repositorio transformers-mic, que reduce `num_hidden_layers` a 2. Los archivos de procesador (`configuration_deepseek.py`, `generation_config.json`, `modeling_deepseek.py`, `tokenization_deepseek_fast.py`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct, de modo que el tokenizador y el código de modelado son exactamente los del modelo original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron superando una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `input_ids:roll_batch`, 1,11). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `465d8cbffd2f` agrupa todos los checkpoints cuyos archivos de procesador son idénticos y cuya configuración coincide tras el encogimiento.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y no han sido entrenados.
- Sirve como banco de pruebas para verificar la carga de safetensors con la arquitectura `DeepseekV2ForCausalLM`.
- Permite validar el tokenizador de DeepSeek-Coder-V2 (tokenización byte a byte idéntica al modelo base).
- Comprueba la compatibilidad de tensor names entre el fixture y el checkpoint real.
- Valida el comportamiento numérico en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No tiene capacidades multilingües evaluables.

## Casos de uso

- Pruebas de integración en CI de Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la clase `DeepseekV2ForCausalLM` se resuelve y ejecuta sin errores en pipelines automatizados, sin descargar el checkpoint completo.
- Validación de tokenizadores: comprobar que `tokenization_deepseek_fast.py` y `tokenizer.json` producen los mismos ids que el modelo base para un corpus de prueba, gracias a la copia byte a byte de los archivos.
- Pruebas de regresión de tensor names: asegurar que cualquier refactor del código de modelado mantiene los nombres de parámetros esperados por el checkpoint real.
- Verificación de precisión numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN o infinitos en entornos de cómputo mixto.
- Desarrollo de herramientas de inspección de modelos: usar el fixture como objetivo ligero para probar scripts que analizan configuraciones, capas y shapes sin consumir VRAM significativa.
- Reproducibilidad de contratos de framework: el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` permiten comparar el comportamiento esperado frente al observado en distintas versiones de Transformers.
- Docencia y experimentación: ilustrar cómo se construye un fixture de modelo reducido y qué puertas de validación (sensibilidad a la entrada, finitud numérica) debe superar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no es evaluable en tareas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (13,2 M de parámetros), aunque el dato exacto no está publicado.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers es el framework de referencia según la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-mic | 13,2 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct | no disponible en la informacion | no disponible | Generacion de codigo | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparación relevante es con el modelo base: el fixture conserva arquitectura, tokenizador y tensor names, pero reduce el número de capas y sustituye los pesos entrenados por pesos aleatorios. No es comparable en rendimiento ni en capacidades con ningún modelo de producción.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; cualquier salida generada carece de sentido.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- La configuración reducida a 2 capas no representa el comportamiento del modelo base ni en calidad ni en latencia.
- No se declara licencia, idiomas ni pipeline; no debe asumirse ningún permiso de uso comercial.
- No apto para producción, atención al cliente, generación de código ni ninguna tarea cognitiva.
- El tamaño del repositorio reportado es 0.0 GB, lo que sugiere que los pesos pueden no estar completos o que el dato de la API no es fiable; conviene verificar los archivos antes de usarlo en CI.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez, y no tendrían sentido para un artefacto de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic/blob/main/build.json
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-Coder-V2-Lite-Instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
