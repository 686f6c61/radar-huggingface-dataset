# huggingface-mic/Qwen2-VL-2B-Instruct-mic

## Resumen

Qwen2-VL-2B-Instruct-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo utilizable. Se construye a partir de Qwen/Qwen2-VL-2B-Instruct mediante una reduccion parametrica que conserva la arquitectura Qwen2VLForConditionalGeneration pero reduce el numero de capas ocultas del codificador de texto a 2, resultando en 10.055.808 parametros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados.

El proposito del repositorio es servir como fixture de integracion: incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework para verificar que implementaciones de Transformers procesan correctamente las entradas y salidas del contrato Qwen2-VL-2B (imagen y texto). Los ficheros de procesador (tokenizer, chat template, preprocessor config) se copian byte a byte del checkpoint original.

Es relevante unicamente en el contexto de pruebas de software y validacion de integraciones, no para inferencia real ni para evaluacion de capacidades. La etiqueta test-artifact lo excluye explicitamente de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2VLForConditionalGeneration (transformer multimodal imagen+texto), reducida a 2 capas ocultas de texto |
| Parametros totales | 10.055.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del checkpoint original, pero el repositorio no declara licencia propia) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo conserva la clase Qwen2VLForConditionalGeneration del checkpoint base, con los mismos nombres de tensores que el modelo real, pero con una configuracion reducida: el codificador de texto tiene 2 capas ocultas en lugar de las del modelo original. La reduccion se realiza mediante la regla generica de sweep.py del proyecto transformers-mic. Los ficheros de procesador (LICENSE, chat_template.json, generation_config.json, merges.txt, preprocessor_config.json, tokenizer.json, tokenizer_config.json, vocab.json) se copian byte a byte desde Qwen/Qwen2-VL-2B-Instruct.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, pixel_values:halve, 0.0537). El modelo es finito en float32, bfloat16 y float16 para forward, perdida y gradientes. La clave de fixture 817a776b4788 identifica el conjunto de checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Sirve como fixture para validar la integracion de Transformers con la arquitectura Qwen2-VL (procesamiento de imagen y texto, formas de tensores, nombres de parametros).
- Permite comprobar expectativas de framework recogidas en integrations/transformers/expectations.
- Reproduce el contrato de entradas y salidas del checkpoint Qwen2-VL-2B-Instruct (pixel_values, input_ids, etc.).
- No dispone de tool calling, razonamiento, codigo, matematicas, agentes ni capacidades multilingues reales.
- No soporta thinking mode, audio ni vision funcional mas alla de la estructura de tensores.

## Casos de uso

- Pruebas de integracion en CI: verificar que una version de Transformers carga el checkpoint, ejecuta el forward y produce tensores con las formas esperadas para Qwen2-VL.
- Validacion de tokenizer y processor: comprobar que el pipeline de preprocesado de imagen y texto se comporta igual que con el checkpoint original, ya que los ficheros se copian byte a byte.
- Desarrollo de harnesses de evaluacion: usar el fixture como sustituto ligero del modelo real para probar infraestructura de benchmarks sin consumir GPU.
- Regresion de kernels y dtypes: el modelo es finito en float32, bfloat16 y float16, lo que permite probar rutas de computo y gradientes en distintos tipos.
- Pruebas de empaquetado y distribucion: validar la carga de safetensors, la resolucion de config y la compatibilidad de nombres de tensores en pipelines de despliegue.
- Validacion de contratos de API: comprobar que un servicio que envuelve Qwen2-VL-2B acepta y devuelve las entradas y salidas definidas en integration.json.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad seria carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 10,1 M de parametros, mas el coste del procesador de imagen; cabe en cualquier GPU consumer.
- GPU recomendadas: no aplica para uso real; cualquier GPU con soporte bfloat16 (RTX 30xx/40xx, A100, H100) puede ejecutar el forward.
- Cabe en CPU y en GPU consumer de gama baja; no requiere acelerador dedicado.
- Opciones de despliegue: Transformers con los ejemplos de integrations/transformers/usage.md; vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las cifras no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2-VL-2B-Instruct-mic | 10.055.808 | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face |
| Qwen/Qwen2-VL-2B-Instruct | no disponible en la informacion | no disponible | Modelo multimodal imagen+texto funcional | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de contrato de otras arquitecturas | no disponible | Hugging Face |

La comparativa relevante es con el checkpoint base: mismo contrato de entradas y salidas, mismos nombres de tensores y mismos ficheros de procesador, pero con 2 capas de texto y pesos aleatorios en lugar de pesos entrenados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen valor semantico.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en el repositorio; el fichero LICENSE copiado del checkpoint original puede no cubrir este artefacto derivado.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no ha habido entrenamiento.
- El contexto, los idiomas y las cuantizaciones no estan documentados.
- Cualquier evaluacion de calidad, seguridad o rendimiento sobre este repositorio seria invalida.
- La fecha de creacion indicada (2026-10-27) y el tamano de repo de 0.0 GB deben interpretarse como metadatos del artefacto, no como indicadores de un modelo listo para uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen2-VL-2B-Instruct-mic/blob/main/build.json
- Explicacion de la reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen2-VL-2B-Instruct-mic.html
- Script de reduccion sweep.py: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion build_fixtures.py: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
