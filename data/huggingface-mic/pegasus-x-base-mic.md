# huggingface-mic/pegasus-x-base-mic

## Resumen

`huggingface-mic/pegasus-x-base-mic` es un artefacto de prueba (fixture) derivado de `google/pegasus-x-base`, el modelo encoder-decoder de Pegasus-X orientado a resumen abstractivo. Lo publica la organizacion `huggingface-mic` como parte de una infraestructura de validacion de contratos de integracion con frameworks (Transformers y otros), no como un modelo destinado a inferencia real. El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y las expectativas que un framework debe cumplir al cargar el modelo.

El modelo conserva la arquitectura `PegasusXForConditionalGeneration` pero con una configuracion drasticamente reducida: 2 capas de encoder y 2 de decoder, lo que da un total de 6.325.184 parametros. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer, `generation_config.json`, `special_tokens_map.json`, `spiece.model`) se copian byte a byte del checkpoint original `google/pegasus-x-base`. El resultado es un fixture ligero que reproduce la interfaz y los nombres de tensores del modelo real sin necesidad de descargar los cientos de millones de parametros del original.

Su relevancia es de ingenieria: permite a los mantenedores de librerias verificar que la carga, el forward, el calculo de perdida y los gradientes funcionan correctamente para la familia Pegasus-X, con un coste de descarga y computo minimo. Esta etiquetado explicitamente como `test-artifact`, de modo que queda excluido de busquedas de modelos candidatos para produccion. No debe confundirse con un modelo utilizable para resumen, traduccion ni ninguna tarea generativa real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PegasusX (encoder-decoder transformer, `PegasusXForConditionalGeneration`) |
| Parametros totales | 6.325.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el original Pegasus-X usa posiciones sinusoidales estiradas, pero el valor concreto del fixture no se publica) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32; verificado finito en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (el tokenizer procede de `google/pegasus-x-base`, pero no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura Pegasus-X: un transformer encoder-decoder con atencion completa en encoder y decoder, pensado originalmente para resumen abstractivo de documentos largos. La unica diferencia respecto al checkpoint de referencia es la profundidad: el encoder y el decoder tienen 2 capas cada uno, segun la regla generica de reduccion aplicada por `sweep.py` del proyecto `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que espere un `PegasusXForConditionalGeneration` puede cargarlo sin cambios.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se aceptan porque superan una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (la mas debil, `input_ids:reverse`, produce 0.00218). Los ficheros de procesador se copian byte a byte desde `google/pegasus-x-base`, y el fixture se guarda en float32, el dtype por defecto del modelo original. El repositorio incluye `build.json` con las fuentes fijadas, resultados de la puerta y hashes de ficheros, ademas de un manifiesto de contrato (`integration.json`) y documentacion de uso y expectativas para Transformers.

## Capacidades

- Carga y ejecucion de la clase `PegasusXForConditionalGeneration` con los mismos nombres de tensores que el checkpoint original.
- Forward pass funcional en float32, bfloat16 y float16, con perdida y gradientes finitos.
- Verificacion de contratos de integracion: el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` definen el comportamiento esperado del framework.
- Uso del tokenizer real de Pegasus-X (`spiece.model`, `tokenizer.json`) copiado del modelo base.
- Sensibilidad a la entrada garantizada: perturbaciones de `input_ids` alteran los logits por encima del umbral de 0.001.
- No soporta generacion de texto con calidad: los pesos son aleatorios y el modelo no ha sido entrenado.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el tokenizer subyacente es el de Pegasus-X, pero el fixture no declara idiomas.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `PegasusXForConditionalGeneration` y comprobar que el forward, la perdida y los gradientes se ejecutan sin errores en float32, bfloat16 y float16, con un coste de descarga minimo.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que una version nueva de la libreria sigue cumpliendo la interfaz esperada para Pegasus-X.
- Pruebas de regresion en CI: incluir el fixture en pipelines de integracion continua para detectar roturas en la carga de checkpoints encoder-decoder sin descargar el modelo completo de cientos de millones de parametros.
- Desarrollo de utilidades de tokenizacion: al incluir los ficheros de procesador reales, sirve para probar flujos de preprocesado de texto con el tokenizer de Pegasus-X.
- Verificacion de compatibilidad de hardware: comprobar que rutas de ejecucion en bfloat16 y float16 funcionan correctamente antes de pasar al checkpoint real.
- Pruebas de serializacion y empaquetado: validar que herramientas de conversion, sharding o empaquetado de safetensors manejan correctamente un checkpoint con la estructura de tensores de Pegasus-X.
- Docencia y ejemplos: ilustrar la estructura interna de un modelo encoder-decoder tipo Pegasus sin requerir recursos de GPU significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (ROUGE, MMLU, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6,3 M de parametros, unos 25 MB de pesos) y aun menor en float16 o bfloat16; el cuello de botella es el tokenizer y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (principal caso de uso); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas con pesos aleatorios, las mediciones no serian representativas de Pegasus-X real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/pegasus-x-base-mic` | 6,3 M | no disponible | Fixture de prueba para integracion con Transformers | no disponible | Hugging Face |
| `google/pegasus-x-base` | no disponible en la informacion proporcionada | no disponible | Resumen abstractivo (modelo real) | no disponible | Hugging Face |
| `google/pegasus-x-large` | no disponible en la informacion proporcionada | no disponible | Resumen abstractivo (variante grande) | no disponible | Hugging Face |

La comparativa con otros fixtures de la organizacion `huggingface-mic` no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no produce texto coherente ni resumen utilizable. No debe emplearse en produccion ni en evaluaciones de calidad.
- Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; usarlo como modelo real es un error de uso.
- La configuracion reducida (2 capas de encoder y 2 de decoder) no representa el comportamiento numerico del checkpoint original de Pegasus-X.
- La licencia no esta declarada en la informacion disponible; conviene verificar la licencia de `google/pegasus-x-base` antes de cualquier uso derivado.
- No se declaran idiomas soportados ni sesgos conocidos; al no haber entrenamiento, no aplican sesgos aprendidos, pero tampoco hay garantias de comportamiento linguistico.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que la salida es esencialmente ruido; el riesgo real es interpretar sus salidas como si fueran generaciones validas.
- El repositorio ocupa 0.0 GB segun los metadatos, pero incluye pesos, tokenizer y documentacion; el tamano exacto no se detalla.
- Para reconstruir los ficheros auxiliares hay que ejecutar `python example/build_fixtures.py --fixture pegasus-x-base-mic`, segun indica la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/pegasus-x-base-mic
- Modelo base: https://huggingface.co/google/pegasus-x-base
- Explicacion del proceso de reduccion (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/pegasus-x-base-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/build.json
