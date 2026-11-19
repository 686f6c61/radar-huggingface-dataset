# huggingface-mic/Janus-Pro-1B-mic

## Resumen

Janus-Pro-1B-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face, no un modelo entrenado ni utilizable. Se trata de un *fixture* derivado del checkpoint real `deepseek-community/Janus-Pro-1B`, reducido mediante la regla genérica de `sweep.py` del proyecto `transformers-mic` para conservar la misma arquitectura (`JanusForConditionalGeneration`) con una configuracion mucho mas pequena: 2 capas en el decoder de texto, 2 capas en el encoder de vision y 2 capas en el modulo VQ. El resultado son 81.912.963 parametros totales (frente a los aproximadamente mil millones del modelo base), con pesos aleatorios generados con semilla 17 y guardados en `bfloat16`.

Su proposito no es la inferencia real, sino servir como fixture de integracion para validar contratos de frameworks: incluye el manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers, expectativas de framework y la procedencia de la compilacion (`build.json`). Los archivos de procesador (tokenizer, `preprocessor_config.json`, `chat_template.jinja`, etc.) se copian byte a byte del checkpoint original, y los nombres de tensores coinciden con los del modelo real para que las pruebas de integracion sean representativas.

Es relevante unicamente en el contexto de ingenieria de software: desarrolladores de frameworks o mantenedores de pipelines de CI que necesiten ejecutar pruebas de carga y conformidad de `JanusForConditionalGeneration` sin descargar ni cargar el modelo completo. La propia model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos y advierte de que "no es un modelo usable". La ficha siguiente lo documenta como artefacto tecnico, no como modelo de IA funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `JanusForConditionalGeneration` (transformer multimodal texto+vision con modulo VQ), version reducida |
| Parametros totales | 81.912.963 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el valor del modelo base no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | deepseek-community/Janus-Pro-1B |
| Profundidad de capas | 2 en texto, 2 en vision, 2 en VQ |
| Tamano del repositorio | 0,2 GB |
| Tipo de artefacto | fixture de prueba (`test-artifact`), pesos aleatorios (semilla 17) |
| Descargas | 2520 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es `JanusForConditionalGeneration`, la misma clase que el checkpoint original `deepseek-community/Janus-Pro-1B`, pero con la configuracion encogida mediante la regla generica de `sweep.py`: el decoder de texto queda con 2 capas ocultas, el encoder de vision con 2 y el modulo de cuantizacion vectorial (VQ) con 2. Los nombres de los tensores coinciden exactamente con los del checkpoint real, de modo que el fixture cubre la misma superficie de parametros que el modelo original, solo que con dimensiones reducidas. Los archivos de procesador (`chat_template.jinja`, `generation_config.json`, `janus_pro_teaser1.png`, `janus_pro_teaser2.png`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produce un desplazamiento de 0,172), por lo que no se considero necesario entrenar. El fixture se guarda en `bfloat16` (el dtype con el que carga por defecto el modelo base) y se verifica que sea finito en `float32`, `bfloat16` y `float16` en forward, perdida y gradientes. La compilacion la realiza `build_fixtures.py`, y `build.json` registra las fuentes fijadas, los resultados de la puerta de validacion y los hashes de los archivos.

## Capacidades

- No es un modelo funcional: la model card indica explicitamente que es un `test-artifact` y "no un modelo usable".
- Generacion de texto, razonamiento, codigo o matematicas: no aplicable, los pesos son aleatorios.
- Vision y generacion de imagenes: la arquitectura incluye encoder de vision y modulo VQ, pero el artefacto no produce salidas con sentido.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: servir como fixture de conformidad para probar la integracion de `JanusForConditionalGeneration` en frameworks (contrato de entradas, expectativas y uso ejecutable).

## Casos de uso

- Pruebas de integracion en CI/CD para frameworks de inferencia: permite validar que el codigo de carga, preprocesado y forward de `JanusForConditionalGeneration` funciona sin descargar el checkpoint de aproximadamente 1B parametros, reduciendo tiempo y ancho de banda en los runners.
- Validacion de contratos de modelo en `transformers-mic`: el repositorio incluye `integration.json` e `integrations/transformers/expectations`, de modo que se puede comprobar que un cambio en el framework no rompe las entradas ni las salidas esperadas del contrato.
- Pruebas de conformidad de precision numerica: al ser finito en `float32`, `bfloat16` y `float16` en forward, perdida y gradientes, sirve para verificar rutas de autocast y mixed precision sin necesidad de hardware de gama alta.
- Desarrollo de herramientas de analisis de checkpoints: con 0,2 GB y nombres de tensores identicos al modelo real, es util para construir y depurar utilidades de inspeccion, conversion o *sharding* que luego se aplican al checkpoint completo.
- Pruebas de *input sensitivity* en pipelines multimodales: las perturbaciones documentadas (`pixel_values:halve` con desplazamiento de 0,172) permiten comprobar que un pipeline propaga correctamente las entradas de imagen y texto hasta los logits.
- Docencia y demostraciones de arquitectura multimodal: permite mostrar la estructura de Janus-Pro (texto, vision, VQ) en un tamano manejable, con archivos de procesador reales, sin necesidad de GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 81,9 M de parametros en `bfloat16` (el repositorio ocupa 0,2 GB); no requiere GPU dedicada.
- GPU recomendadas: cualquier GPU consumer moderna sirve; tambien es viable en CPU. No se especifican valores de latencia ni throughput.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: el repositorio incluye una guia de uso con Transformers (`integrations/transformers/usage.md`) y expectativas de framework; no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janus-Pro-1B-mic (este) | 81,9 M (fixture) | no disponible | Fixture de prueba de integracion | no disponible | Hugging Face (`huggingface-mic`) |
| deepseek-community/Janus-Pro-1B | no disponible en la informacion | no disponible | Modelo multimodal real texto+vision | no disponible | Hugging Face (`deepseek-community`) |
| Otros fixtures `transformers-mic` | variable segun modelo base | no disponible | Pruebas de conformidad de otros modelos | no disponible | Hugging Face (`huggingface-mic`) |

La unica comparacion directa significativa es con su modelo base: el fixture conserva arquitectura, nombres de tensores y procesador, pero reduce el numero de parametros y sustituye los pesos por valores aleatorios. No se dispone de informacion sobre modelos alternativos de la misma categoria (fixtures de integracion) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17); cualquier salida generada es ruido sin valor semantico.
- La model card clasifica el artefacto como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; no debe emplearse como sustituto del modelo base en produccion.
- Sesgos conocidos: no aplicable al no haber datos de entrenamiento; el procesador heredado del modelo base si arrastra los sesgos de su tokenizer y plantillas.
- Riesgo de alucinacion: total, en el sentido de que no existe conocimiento aprendido; las salidas no tienen relacion con las entradas.
- Limitaciones de contexto o idioma: no documentadas; la ventana de contexto del modelo base no se especifica en la informacion disponible.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; verificar la del modelo base antes de cualquier uso derivado.
- El repositorio incluye solo los pesos reducidos, el uso y las expectativas; los demas archivos deben regenerarse con `python example/build_fixtures.py --fixture Janus-Pro-1B-mic`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic
- Modelo base: https://huggingface.co/deepseek-community/Janus-Pro-1B
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic/blob/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Janus-Pro-1B-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Janus-Pro-1B-mic.html
- Proyecto `transformers-mic` en GitHub: https://github.com/huggingface/transformers-mic
- `sweep.py` (regla de reduccion): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- `build_fixtures.py` (script de compilacion): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Paper de Janus-Pro: no disponible en la informacion proporcionada
- Demo de Janus-Pro: no disponible en la informacion proporcionada
