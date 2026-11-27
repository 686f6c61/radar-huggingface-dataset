# huggingface-mic-temp/mistral3-vllm-mic

## Resumen

mistral3-vllm-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic-temp, no un modelo utilizable en produccion. Se trata de una version reducida artificialmente del modelo mistralai/Mistral-Small-3.1-24B-Instruct-2503, generada para validar contratos de integracion de frameworks (en este caso, la ruta de ejecucion compatible con vLLM y con Transformers) sin necesidad de cargar los 24.000 millones de parametros del checkpoint original.

El fixture conserva la arquitectura Mistral3ForConditionalGeneration pero con una configuracion drasticamente recortada: 2 capas en el codificador de vision y 2 capas en el modelo de texto, lo que deja un total de 8.607.168 parametros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; su unico proposito es que las formas de los tensores, los nombres de las claves y los ficheros de procesador coincidan con los del modelo real.

Su relevancia es por tanto instrumental: sirve a desarrolladores de infraestructura y mantenedores de frameworks para probar pipelines de carga, tokenizacion, plantillas de chat y expectativas de integracion de forma rapida y barata. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, y no debe emplearse para inferencia real, evaluacion de calidad ni despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (transformer multimodal imagen-texto, version reducida) |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Mistral3ForConditionalGeneration del modelo base Mistral-Small-3.1-24B-Instruct-2503, que combina un codificador de vision con un modelo de lenguaje de texto para tareas imagen-texto. La reduccion se aplica mediante la regla generica de `sweep.py`: se recortan las capas ocultas del codificador de vision a 2 y las del modelo de texto a 2, manteniendo la estructura de tensores y los nombres de las claves identicos a los del checkpoint real.

No hay entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `input_ids:reverse`, alcanza 1,72). Los ficheros de procesador (SYSTEM_PROMPT.txt, chat_template.json, generation_config.json, params.json, preprocessor_config.json, processor_config.json, special_tokens_map.json, tekken.json, tokenizer.json, tokenizer_config.json) se copian byte a byte desde el modelo base, de modo que la tokenizacion y la plantilla de chat son las reales.

## Capacidades

- No tiene capacidades funcionales de generacion, razonamiento, codigo, matematicas o vision: los pesos son aleatorios y la salida carece de sentido.
- Sirve como contrato ejecutable para validar la carga del modelo, el mapeo de tensores y la compatibilidad de formas con la arquitectura Mistral3.
- Permite probar la tokenizacion Tekken y la plantilla de chat copiadas del modelo base.
- Permite verificar expectativas de integracion en Transformers (directorio `integrations/transformers/expectations`) y en la ruta compatible con vLLM.
- Soporta ejecucion en float32, bfloat16 y float16 con valores finitos en forward, perdida y gradientes.
- No soporta tool calling, agentes, modo thinking ni capacidades multilingues verificables, al no haber sido entrenado.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en lugar del checkpoint de 24B para validar que el pipeline de Transformers o vLLM acepta la arquitectura Mistral3 sin consumir recursos de GPU.
- Desarrollo de frameworks: comprobar que el mapeo de nombres de tensores y las formas coinciden con el checkpoint real antes de ejecutar pruebas con pesos completos.
- Validacion de tokenizadores y plantillas: verificar que la plantilla de chat, los tokens especiales y el tokenizador Tekken se cargan y aplican correctamente.
- Pruebas de cuantizacion y dtypes: ejecutar el modelo en float32, bfloat16 y float16 para detectar problemas de estabilidad numerica en el codigo de infraestructura.
- Reproduccion de contratos: usar `integration.json` y `build.json` para auditar fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros.
- Formacion de mantenedores: servir como ejemplo minimo de como reducir un checkpoint multimodal preservando la interfaz publica para pruebas de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad seria carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 8,6M de parametros en bfloat16 (aproximadamente 17 MB de pesos, mas overhead de activaciones y del codificador de vision reducido).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en CPU para pruebas de carga.
- Opciones de despliegue: Transformers y la ruta compatible con vLLM descrita en el contrato; llama.cpp u Ollama no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral3-vllm-mic | 8,6M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| mistralai/Mistral-Small-3.1-24B-Instruct-2503 | 24B (aprox.) | no disponible en la informacion | Modelo real imagen-texto | no disponible en la informacion | Hugging Face |
| Otros fixtures de la organizacion huggingface-mic-temp | variable | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos multimodales de ~24B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse su uso comercial; en cualquier caso, al derivar del modelo base, habria que atenerse a la licencia de Mistral-Small-3.1-24B-Instruct-2503.
- La configuracion recortada (2 capas de vision y 2 de texto) no representa el comportamiento del modelo real; las metricas de latencia o memoria no son extrapolables.
- El contexto, los idiomas y las capacidades multimodales reales no estan verificados en el fixture.
- Riesgo de confusion: el nombre puede sugerir un modelo Mistral3 operativo; conviene revisar siempre la etiqueta `test-artifact` antes de descargarlo.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic-temp/mistral3-vllm-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mistral3-vllm-mic.html
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
