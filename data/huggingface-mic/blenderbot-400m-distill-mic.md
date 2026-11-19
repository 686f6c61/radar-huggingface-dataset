# huggingface-mic/blenderbot-400M-distill-mic

## Resumen

`blenderbot-400M-distill-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable: se trata de un *fixture* (muestra sintetica) derivado de `facebook/blenderbot-400M-distill`, con la misma arquitectura `BlenderbotForConditionalGeneration` pero con una configuracion reducida (2 capas de encoder y 2 de decoder) y pesos aleatorios generados con semilla 17. Su unico proposito es servir como banco de pruebas reproducible para validar contratos de integracion en el ecosistema Transformers.

El repositorio incluye los pesos reducidos en formato safetensors, ejemplos de uso ejecutables y un directorio de expectativas de framework (`integrations/transformers/expectations`), junto con un manifiesto de contrato (`integration.json`) y metadatos de procedencia (`build.json`). El modelo esta etiquetado explicitamente como `test-artifact`, precisamente para excluirlo de busquedas de modelos candidatos.

Es relevante en el contexto de ingenieria de software de IA porque ilustra una practica creciente: empaquetar junto al modelo los contratos de comportamiento esperados, de modo que los pipelines de CI puedan verificar la compatibilidad de una integracion sin descargar checkpoints de cientos de megabytes. No debe confundirse con un modelo conversacional operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlenderbotForConditionalGeneration (transformer encoder-decoder), reducida a 2 capas de encoder y 2 de decoder |
| Parametros totales | 704.584 (0,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 y verificados como finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de Blenderbot, un transformer encoder-decoder orientado a dialogo. El fixture conserva los nombres de tensores del checkpoint original `facebook/blenderbot-400M-distill`, pero reduce la profundidad a 2 capas en encoder y decoder mediante la regla generica de reduccion implementada en `sweep.py`. Los ficheros de procesador (`added_tokens.json`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo base, de modo que el tokenizador es identico al original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,0602). El fixture se guarda en float32, el dtype por defecto del modelo base, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `7bd7cf661c75` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No tiene capacidades de generacion de texto utiles: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para validar la carga del modelo, el tokenizador y la configuracion en Transformers.
- Permite verificar contratos de comportamiento: el directorio `integrations/transformers/expectations` define las salidas esperadas frente a entradas de prueba.
- Soporta ejecucion en float32, bfloat16 y float16 sin producir NaN ni infinitos en forward, loss y gradientes.
- Mantiene los nombres de tensores del checkpoint real, lo que permite probar rutas de carga y mapeo de pesos.
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture pesa practicamente nada (tamano de repo 0,0 GB) y permite ejecutar la suite de tests de una integracion con Transformers sin descargar el checkpoint de 400M.
- Validacion de contratos de framework: los ficheros de `integrations/transformers/expectations` permiten comprobar que una version nueva de Transformers sigue produciendo las salidas esperadas sobre el fixture.
- Desarrollo de herramientas de reduccion de modelos: sirve como caso de referencia para verificar que la regla de `sweep.py` genera configuraciones coherentes con el modelo original.
- Pruebas de compatibilidad de tokenizador: al copiar los ficheros de procesador byte a byte, permite validar cambios en el pipeline de tokenizacion sin depender del modelo completo.
- Verificacion de dtypes y estabilidad numerica: util para comprobar que una nueva version del runtime mantiene la finitud de forward, loss y gradientes en float32, bfloat16 y float16.
- Regresion de carga de pesos: al conservar los nombres de tensores del checkpoint real, permite detectar roturas en el mapeo de pesos entre versiones de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad seria carente de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; el modelo tiene 0,7 M de parametros.
- GPU recomendadas: cualquier GPU consumer; el fixture cabe en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| blenderbot-400M-distill-mic | 0,7 M | no disponible | Fixture de test | no disponible |
| facebook/blenderbot-400M-distill | 400 M | no disponible en esta ficha | Dialogo conversacional | no disponible en esta ficha |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible |

La comparativa con modelos conversacionales reales no es pertinente: este artefacto no compite en la categoria de modelos de dialogo, sino en la de fixtures de integracion.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen respuestas coherentes.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial.
- No se documentan sesgos porque no hay entrenamiento; cualquier analisis de sesgo seria inaplicable.
- El riesgo de alucinacion es total en el sentido literal: la salida no tiene relacion con la entrada mas alla de la sensibilidad minima verificada.
- La longitud de contexto no esta disponible; la configuracion reducida no refleja la del modelo base.
- El tamano de repo indicado (0,0 GB) sugiere que el contenido puede estar incompleto o que los pesos se almacenan de forma comprimida; conviene verificar la integridad antes de usarlo en CI.
- No debe confundirse con `facebook/blenderbot-400M-distill`; el sufijo `-mic` identifica el fixture.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/blenderbot-400M-distill-mic
- Modelo base: https://huggingface.co/facebook/blenderbot-400M-distill
- Documentacion de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blenderbot-400M-distill-mic.html
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
