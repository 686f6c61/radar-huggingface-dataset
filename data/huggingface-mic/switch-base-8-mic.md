# huggingface-mic/switch-base-8-mic

## Resumen

`huggingface-mic/switch-base-8-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se construye a partir de la arquitectura de `google/switch-base-8`, un transformer de tipo Switch (Mixture of Experts) para tareas texto-a-texto, pero con una configuracion reducida a 2 capas de encoder y 2 de decoder y pesos generados aleatoriamente con semilla 17. Su proposito es servir como fixture de integracion para validar contratos de framework (en concreto, la integracion con Transformers) sin necesidad de descargar el checkpoint completo de Google.

El repositorio contiene los pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado en un formato que replica los nombres de tensores del checkpoint original. Los ficheros de procesador (`tokenizer.json`, `spiece.model`, `generation_config.json`, etc.) se copian byte a byte de `google/switch-base-8`, de modo que el pipeline de tokenizacion es identico al del modelo real.

Es relevante ahora porque permite a desarrolladores e investigadores probar flujos de integracion, CI y validacion de contratos de modelos SwitchTransformers con un coste de almacenamiento practicamente nulo (repo de 0.0 GB, 2.319.872 parametros). No debe confundirse con un modelo funcional: el propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwitchTransformers (transformer MoE texto-a-texto, `SwitchTransformersForConditionalGeneration`) |
| Parametros totales | 2.319.872 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SwitchTransformers, un transformer encoder-decoder con capas de mezcla de expertos con enrutamiento top-1 (Switch). El fixture conserva los nombres de tensores del checkpoint `google/switch-base-8`, pero reduce la profundidad a `num_layers=2` y `num_decoder_layers=2` mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; el autor justifica su validez porque superaron una "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, mueve 4.36).

Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base, por lo que el vocabulario y la configuracion de generacion son los de `google/switch-base-8`. El fixture se ha verificado como finito en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture `c3577706d546` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento. No hay datos de entrenamiento, RLHF ni DPO porque no hubo entrenamiento.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas reales.
- Sirve como fixture de integracion para validar la carga y ejecucion de `SwitchTransformersForConditionalGeneration` en Transformers.
- Permite probar contratos de framework (entradas, salidas, sensibilidad) sin descargar el checkpoint completo.
- Replica la tokenizacion de `google/switch-base-8` (SentencePiece) gracias a la copia byte a byte de los ficheros de procesador.
- Valida la compatibilidad de nombres de tensores con el checkpoint original.
- Soporta ejecucion forward, calculo de loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- CI de integraciones de Transformers: usar el fixture en pipelines de integracion continua para verificar que la clase `SwitchTransformersForConditionalGeneration` carga y ejecuta correctamente sin descargar el checkpoint real de Google.
- Validacion de contratos de framework: comprobar que las entradas y salidas declaradas en `integration.json` se cumplen (formas de tensores, dtypes, sensibilidad de logits) antes de subir cambios a la libreria.
- Pruebas de regresion de tokenizacion: al copiar los ficheros de procesador del modelo base, permite verificar que el pipeline de tokenizacion no se rompe entre versiones.
- Desarrollo de utilidades de carga de safetensors: probar rutinas de carga y mapeo de tensores con un repositorio de tamano minimo y nombres de tensores realistas.
- Pruebas de compatibilidad de dtypes: validar que el codigo de inferencia y entrenamiento funciona en float32, bfloat16 y float16 con un modelo que se sabe finito en los tres.
- Formacion y demos de arquitectura MoE: ilustrar la estructura de un SwitchTransformer con pesos inspeccionables y sin coste de almacenamiento, util en docencia o talleres.
- Validacion de pipelines de publicacion en Hugging Face: usar el repo como ejemplo de estructura (manifest, usage, expectations, build.json) para modelos con contrato de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido medir MMLU, HumanEval, GSM8K ni metricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en bfloat16 (2.319.872 parametros), despreciable en cualquier GPU.
- GPU recomendadas: cualquiera; el fixture cabe en CPU y en cualquier GPU consumer.
- Cabe en GPU consumer: si, en todas (incluidas GTX 1050, RTX 3050, etc.).
- Opciones de despliegue: Transformers (carga directa), con soporte de safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles; sin relevancia practica al no ser un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/switch-base-8-mic | 2.319.872 | no disponible | Fixture de integracion | no disponible | Hugging Face |
| google/switch-base-8 | no disponible | no disponible | Modelo MoE texto-a-texto | no disponible | Hugging Face |
| google/switch-base-32 | no disponible | no disponible | Modelo MoE texto-a-texto | no disponible | Hugging Face |
| google/switch-c-2048 | no disponible | no disponible | Modelo MoE texto-a-texto | no disponible | Hugging Face |

La comparativa es estructural: el fixture replica la interfaz del modelo base pero no su funcionalidad. Los datos de parametros y contexto de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido semantico.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial.
- Idiomas no disponibles: aunque el tokenizador proviene de `google/switch-base-8`, el fixture no ha sido evaluado en ningun idioma.
- Sesgos: no aplica, al no haber entrenamiento; cualquier sesgo observado seria artefacto del tokenizador heredado.
- Riesgo de alucinacion: total, al no existir capacidad de generacion real.
- Limitaciones de contexto: la configuracion reducida (2 capas) no refleja el comportamiento del modelo base.
- Caveat de produccion: usar este repositorio como dependencia de un sistema real produciria resultados invalidos; solo es apto para pruebas de integracion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/switch-base-8-mic)
- [Modelo base google/switch-base-8](https://huggingface.co/google/switch-base-8)
- [Explicacion del encogimiento del fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/switch-base-8-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
