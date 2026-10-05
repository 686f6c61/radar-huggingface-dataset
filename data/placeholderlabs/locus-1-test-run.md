# placeholderlabs/locus-1-test-run

## Resumen

locus-1 test run es un artefacto de entrenamiento publicado por Placeholder Labs (placeholderlabs) en Hugging Face, no un modelo listo para uso. Segun su propia model card, se trata de una ejecucion de prueba de 200 actualizaciones (updates) del "hero" locus-1, descrito como un hibrido Kimi Delta de 1.9B de parametros, entrenado sobre un TPU v6e-8 el 2026-10-05. El objetivo declarado no era obtener un modelo util, sino validar la ruta de entrenamiento, reanudacion desde checkpoint y exportacion del pipeline.

El entrenamiento se dividio en dos tramos de 100 actualizaciones cada uno, con 4.194.304 tokens por actualizacion, lo que suma 838.860.800 tokens (aproximadamente 839M) en total. La perdida de entrenamiento paso de 3,006 en el paso 100 a 2,288 en el paso 200, valores que el autor no acompana de ninguna evaluacion de calidad. El repositorio pesa 16,9 GB y contiene dos checkpoints de PyTorch en formato `locus.ddp-checkpoint/v3`, con un manifiesto y un `latest.json` que apunta al paso 200.

Es relevante unicamente como referencia para quien siga el trabajo de Placeholder Labs sobre mezclas de preentrenamiento (colecciones Locus-1 Pretrain Mix y Locus-1 Pretrain Long-Context Mix), o para quien necesite entender el contrato del formato de checkpoint distribuido que usa el laboratorio. La model card es explicita: "It is not a usable model". No hay licencia, idiomas, pipeline, benchmarks ni especificaciones de contexto publicadas para este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido "Kimi Delta" (segun la model card; sin detalles tecnicos publicados) |
| Parametros totales | 1,9B (aproximadamente 1.900 millones, segun la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints de PyTorch; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints de PyTorch (`.pt`) en formato `locus.ddp-checkpoint/v3`, con manifiesto; `latest.json` apunta al paso 200. No hay safetensors ni GGUF |
| Tamano del repositorio | 16,9 GB |
| Tokens de entrenamiento | 838.860.800 (839M aproximadamente), en 200 actualizaciones de 4.194.304 tokens |
| Hardware de entrenamiento | TPU v6e-8 |
| Fecha de entrenamiento | 2026-10-05 |

## Arquitectura y entrenamiento

La model card describe el modelo como "the 1.9B Kimi Delta hybrid", sin aportar mas detalle sobre la arquitectura: no se especifica la composicion de capas, el mecanismo de atencion, la posible combinacion con componentes de espacio de estados (SSM) ni la configuracion de cabezas. Tampoco se publican hiperparametros de optimizacion, regimen de precision, composicion del dataset ni si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineamiento. Todo lo anterior debe considerarse "no disponible" en la informacion accesible.

Lo unico verificable del entrenamiento es su escala y su proposito: 200 actualizaciones repartidas en dos tramos de 100, 4.194.304 tokens por actualizacion, 839M tokens en total, ejecutadas sobre un TPU v6e-8. La secuencia de perdida documentada es 3,006 en el paso 100 y 2,288 en el paso 200. El autor indica que la ejecucion servia para validar el entrenamiento, la reanudacion y la exportacion, no para producir un modelo desplegable. La unica innovacion tecnica explicitamente mencionada es la del propio pipeline: el formato de checkpoint distribuido `locus.ddp-checkpoint/v3` con manifiesto y un puntero `latest.json`.

## Capacidades

- No hay capacidades verificadas. La model card afirma literalmente que "it is not a usable model".
- Generacion de texto: no evaluada y no recomendada; no se han publicado muestras, metricas ni evaluaciones cualitativas.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible; no se menciona ningun formato de plantilla de chat ni de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible.
- Lo unico utilizable del repositorio es su vertiente de ingenieria: los checkpoints permiten probar la carga, la reanudacion y la exportacion dentro del pipeline propio de Placeholder Labs.

## Casos de uso

Ninguno de estos casos implica usar el modelo para inferencia o para una tarea de usuario final; son aplicaciones realistas del artefacto como material de validacion de infraestructura.

- Validacion de la ruta de entrenamiento: el repositorio permite reproducir o auditar un ciclo corto de entrenamiento distribuido (200 actualizaciones, 4.194.304 tokens por actualizacion) sobre TPU v6e-8 para comprobar que el bucle de optimizacion converge en la secuencia documentada (3,006 en el paso 100 y 2,288 en el paso 200).
- Pruebas de reanudacion desde checkpoint: los dos puntos de guardado (`checkpoints/step-00000100.pt` y `checkpoints/step-00000200.pt`) permiten verificar que un proceso interrumpido en el paso 100 se reanuda correctamente y alcanza el paso 200 sin divergencias.
- Validacion de la ruta de exportacion: sirve para comprobar que la conversion desde el formato interno `locus.ddp-checkpoint/v3` a un artefacto publicable produce pesos cargables y consistentes con el manifiesto.
- Pruebas de integracion de herramientas internas: equipos que desarrollen cargadores, visualizadores de manifiestos o utilidades de comparacion de checkpoints pueden usar estos 16,9 GB como conjunto de prueba con estructura conocida y `latest.json` apuntando al paso 200.
- Analisis de la curva de perdida temprana: con solo dos puntos de medida, permite estudiar la forma de la curva en las primeras 200 actualizaciones y compararla con futuras ejecuciones del mismo "hero", util como linea base de regresion.
- Verificacion de throughput y coste: al estar fijados los tokens por actualizacion y el hardware (TPU v6e-8), la ejecucion sirve como referencia de rendimiento para planificar presupuestos de entrenamiento de mayor duracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni similares) y advierte que el modelo no es utilizable, por lo que no tendria sentido ejecutar dichas evaluaciones. El unico dato de rendimiento disponible es la perdida de entrenamiento:

| Paso | Tokens acumulados | Perdida de entrenamiento |
|---|---|---|
| 100 | 419.430.400 | 3,006 |
| 200 | 838.860.800 | 2,288 |

Estos valores corresponden a perdida de entrenamiento, no a ninguna metrica de evaluacion, y no son comparables con resultados de benchmarks publicados por otros modelos.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Como estimacion teorica derivada unicamente del numero de parametros (1,9B), y no como dato oficial: en bf16/fp16 los pesos ocuparian del orden de 3,8 GB; en fp32, del orden de 7,6 GB; en una hipotetica cuantizacion a 8 bits, del orden de 1,9 GB, y a 4 bits, del orden de 1,1 GB. A estas cifras habria que sumar el coste de la cache KV y del runtime, que no se puede calcular al desconocer la longitud de contexto y la arquitectura concreta.
- GPU recomendadas: no disponible. No existe ningun artefacto de inferencia publicado, por lo que no hay recomendaciones de GPU validadas.
- Cabe en GPU de consumo: no verificable. Aunque el tamano de parametros sugiera que podria caber en GPUs de consumo con suficiente VRAM, faltan tanto los pesos en un formato de inferencia como la implementacion de la arquitectura.
- Opciones de despliegue: no disponible. Los checkpoints estan en formato `locus.ddp-checkpoint/v3`, orientado a reanudar entrenamiento distribuido, no a servir inferencia. No hay versiones GGUF (llama.cpp, Ollama), safetensors, ni compatibilidad declarada con vLLM o TGI. Cualquier despliegue requeriria convertir los pesos y disponer de una implementacion del hibrido Kimi Delta, que el autor no publica en este repositorio.
- Latencia y throughput: no disponible. El unico dato relacionado es el coste de entrenamiento (4.194.304 tokens por actualizacion sobre un TPU v6e-8), que no es extrapolable a inferencia.

## Comparativa con modelos similares

No procede una comparativa de rendimiento: el modelo no es utilizable y no tiene benchmarks publicados, licencia declarada ni artefacto de inferencia. Cualquier tabla frente a modelos de la misma clase de tamano (rango de 1B a 2B) seria especulativa y no estaria respaldada por datos.

| Criterio | locus-1 test run | Alternativas de la misma clase |
|---|---|---|
| Parametros | 1,9B | no disponible (no se comparan alternativas por falta de datos verificables de este modelo) |
| Contexto | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad para inferencia | no (solo checkpoints de entrenamiento) | no disponible |

## Limitaciones y advertencias

- El propio autor declara que no es un modelo utilizable. No debe emplearse en produccion, en evaluaciones de calidad ni como base para ajuste fino.
- No hay licencia publicada. Sin licencia explicita, no puede asumirse ningun permiso de uso comercial ni de redistribucion.
- No hay idiomas declarados, ni plantilla de chat, ni tokenizador documentado en la informacion disponible.
- Sesgos conocidos: no disponible. Al no existir evaluacion sobre datos, no hay analisis de sesgo de ningun tipo.
- Riesgo de alucinacion: no evaluado. Con una perdida de entrenamiento de 2,288 tras solo 839M tokens, el modelo se encuentra en una fase muy temprana de entrenamiento y su salida de texto seria, con alta probabilidad, incoherente.
- Limitaciones de contexto e idioma: se desconocen. Las colecciones de Placeholder Labs incluyen mezclas de preentrenamiento con empaquetado de contexto largo (16K), pero la model card de este repositorio no confirma que la ejecucion de prueba haya usado esas mezclas ni cual es su ventana de contexto.
- Caveat de formato: los checkpoints en `locus.ddp-checkpoint/v3` estan pensados para reanudar entrenamiento distribuido; no son directamente cargables por herramientas de inferencia habituales.
- Caveat de caducidad: al ser una ejecucion de prueba del 2026-10-05, sus pesos pueden quedar obsoletos frente a futuras ejecuciones del mismo "hero" sin ningun aviso.
- Caveat de procedencia: los dos unicos puntos de medida de perdida (pasos 100 y 200) no permiten afirmar que el entrenamiento sea estable mas alla del paso 200.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/placeholderlabs/locus-1-test-run
- Sitio de Placeholder Labs: https://placeholderlabs.ai/
- Coleccion Locus-1 Pretrain Mix: https://huggingface.co/collections/placeholderlabs/locus-1-pretrain-mix
- Coleccion Locus-1 Pretrain Long-Context Mix: https://huggingface.co/collections/placeholderlabs/locus-1-pretrain-long-context-mix
- Herramienta generica de estimacion de VRAM para modelos locales (no relacionada con este modelo): https://www.canirun.ai/
