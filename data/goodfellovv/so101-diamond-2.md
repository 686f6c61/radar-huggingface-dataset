# goodfellovv/so101-diamond-2

## Resumen

SO-101 Diamond 2 es una política robótica visual entrenada con la librería LeRobot de Hugging Face y la arquitectura ACT (Action Chunking with Transformers). El modelo resuelve una tarea de manipulación concreta en simulación MuJoCo: ensamblar cuatro cubos en un cuadrado compacto 2×2, con cada cubo orientado con la cara azul hacia arriba, de forma que los cuatro triángulos amarillos formen un rombo en el centro. La política recibe imágenes RGB de dos cámaras (cenital e inclinada) junto con las posiciones articulares y emite comandos de movimiento que un controlador ejecuta aplicando restricciones cinemáticas.

El modelo lo publica el usuario goodfellovv y está orientado al brazo robótico SO-101, un diseño de bajo coste habitual en entornos de investigación y docencia. No es un modelo de lenguaje: es un checkpoint de política (policy) de 16,4 millones de parámetros, empaquetado en safetensors y consumible mediante LeRobot. Su relevancia es la de un artefacto de investigación reproducible: incluye un paquete de evaluación verificado, un protocolo de test independiente y el corpus de entrenamiento (879 episodios agrupados), lo que permite auditar el resultado declarado.

El resultado principal declarado por el autor es de 100 ensamblajes estrictos sobre 240 intentos (41,67 %), con un intervalo de confianza de Wilson al 95 % de 35,61–47,99 %. El objetivo de calidad del 95 % no se alcanza. La ficha describe el modelo tal como está documentado; la mayor parte de los metadatos habituales de un modelo de lenguaje (idiomas, cuantizaciones, contexto) no aplica o no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora para robótica |
| Parametros totales | 16.365.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; la política consume observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tarea | Ensamblaje de 4 cubos en cuadrado 2×2 con cara azul arriba |
| Entradas | RGB de cámara cenital y cámara inclinada + posiciones articulares |
| Salidas | Comandos de movimiento ejecutados por un controlador con restricciones |
| Entorno de evaluación | MuJoCo |
| Dataset de entrenamiento | goodfellovv/so101-diamond-2 (corpus agrupado de 879 episodios) |
| Tamaño del repositorio | 27,6 GB |
| Descargas | 199 |
| Fecha de creación | 2026-11-21 |
| Última actualización | 2026-11-24 |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), un enfoque de imitación que predice bloques (chunks) de acciones futuras en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. La política combina codificación visual de las dos cámaras con el estado de las articulaciones y genera comandos de movimiento que un controlador de bajo nivel convierte en consignas respetando restricciones de movimiento. El checkpoint tiene 16.365.574 parámetros, un tamaño coherente con una política ACT de este tipo.

El entrenamiento se realizó sobre el dataset goodfellovv/so101-diamond-2, que incluye un corpus agrupado de 879 episodios. La model card enlaza gráficas de evolución del dataset y de la pérdida de entrenamiento frente al número de ensamblajes, lo que sugiere un proceso iterativo de recogida de datos y reentrenamiento. No se documentan en la información disponible detalles sobre composición exacta del dataset, aumentos de datos, número de tokens o pasos, ni sobre uso de RLHF o DPO (no aplicables en este contexto). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor para manipulación robótica: ensambla cuatro cubos en una configuración 2×2 con orientación específica de cada cubo.
- Percepción multimodal de bajo nivel: procesa RGB de dos cámaras (cenital e inclinada) y posiciones articulares del brazo SO-101.
- Generación de comandos de movimiento en bloque (action chunking) ejecutados por un controlador con restricciones cinemáticas.
- Operación en simulación MuJoCo; no se documenta transferencia a hardware real.
- Cumplimiento de tolerancias: el criterio de éxito exige mantener los cuatro cubos dentro de tolerancias durante 15 pasos consecutivos.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en imitación robótica: servir como referencia reproducible para comparar variantes de ACT sobre la misma tarea de ensamblaje, gracias al paquete de evaluación y al test independiente publicados.
- Docencia y formación: demostrar el ciclo completo de un proyecto LeRobot (recogida de datos, entrenamiento, evaluación en MuJoCo) con una tarea de dificultad media y métricas explícitas.
- Benchmark de manipulación de precisión: usar la tasa de ensamblajes estrictos (100/240, 41,67 %) como línea base para medir mejoras en percepción, chunking o datos.
- Estudio de robustez perceptiva: analizar el efecto de la configuración de las dos cámaras y de la oclusión sobre la tasa de éxito, ya que la política depende de RGB cenital e inclinado.
- Desarrollo de controladores con restricciones: integrar las salidas de la política en un controlador que aplique límites cinemáticos, evaluando cómo afectan a la tasa de éxito.
- Generación de datos sintéticos y currículos: reutilizar el corpus de 879 episodios y los escenarios de MuJoCo para ampliar el dataset o entrenar variantes con más episodios.
- Auditoría de resultados: replicar la evaluación con el paquete verificado y el informe de test independiente para validar el intervalo de confianza declarado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Ensamblajes estrictos | 100 de 240 (41,67 %) |
| Intervalo de confianza de Wilson al 95 % | 35,61–47,99 % |
| Objetivo de calidad declarado | 95 % (no alcanzado) |
| Criterio de éxito | 4 cubos dentro de tolerancias durante 15 pasos consecutivos |
| Entorno | MuJoCo |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a este tipo de modelo. La model card indica que la viabilidad física de todas las disposiciones de control fue confirmada por un experto en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,4 millones de parámetros el checkpoint es muy pequeño y cabe holgadamente en cualquier GPU consumer, aunque el consumo real depende del pipeline LeRobot y de las cámaras simuladas.
- GPU recomendadas: no documentadas; por tamaño, una RTX 4090 o incluso GPUs de gama media serían suficientes para la política, mientras que la simulación MuJoCo puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella será la simulación y el renderizado de cámaras, no el modelo.
- Opciones de despliegue: LeRobot (librería nativa del checkpoint); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política ACT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entorno | Resultado declarado | Licencia |
|---|---|---|---|---|---|
| SO-101 Diamond 2 | 16.365.574 | Ensamblaje 2×2 de 4 cubos | MuJoCo | 100/240 (41,67 %) | no disponible |
| Políticas ACT genéricas de LeRobot | variable | Manipulación diversa | simulación / real | no disponible | según checkpoint |
| Políticas de difusión para manipulación | variable | Manipulación diversa | simulación / real | no disponible | según checkpoint |

No se dispone en la información proporcionada de resultados comparables de otros modelos sobre esta misma tarea, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Tasa de éxito limitada: 41,67 % de ensamblajes estrictos, lejos del objetivo del 95 %; no es apta para producción sin mejoras sustanciales.
- Solo evaluada en simulación MuJoCo; no hay evidencia documentada de transferencia al brazo SO-101 físico.
- Depende de una configuración concreta de dos cámaras y de posiciones articulares; cambios en la disposición o calibración pueden degradar el rendimiento.
- El criterio de éxito es estricto (tolerancias durante 15 pasos consecutivos), lo que hace que la métrica no sea directamente comparable con otras publicaciones que usan criterios más laxos.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por no ser un modelo lingüístico; el riesgo principal es el fallo físico de la tarea.
- El repositorio es grande (27,6 GB) por incluir datos, exportaciones y artefactos de evaluación, lo que complica su descarga y versionado.
- Sin likes y con 199 descargas: modelo de nicho, con poca validación comunitaria independiente más allá del informe enlazado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodfellovv/so101-diamond-2
- Dataset: https://huggingface.co/datasets/goodfellovv/so101-diamond-2
- Paquete verificado de modelo, fuentes y script de evaluación: https://huggingface.co/goodfellovv/so101-diamond-2/resolve/e73c99d46bb319cf9b0382477d40495264e010a5/exports/runpod-act-20261122/relay/so101-diamond-2-incumbent-100-of-240/so101-diamond-2-incumbent-100-of-240.tar
- Condiciones de verificación y checksum: https://huggingface.co/goodfellovv/so101-diamond-2/resolve/e73c99d46bb319cf9b0382477d40495264e010a5/exports/runpod-act-20261122/source-export/RELEASE.json
- Evaluación independiente: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/independent-test.json
- Dinámica de train loss y ensamblajes: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/train-loss-current-experiments.png
- Crecimiento del dataset: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/fc5f33831670523800290e4a04b4cb44342c2549/reports/dataset-growth.png
- Corpus agrupado de 879 episodios: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/tree/0429a3c2117e0d5f47c8b367f43f1fff99a1c8f5/corpora/pooled-879
- Manifiesto de exportación completa: https://huggingface.co/datasets/goodfellovv/so101-diamond-2/resolve/91e42cf0d4afb77eaa662687b91e20dd41e47816/exports/runpod-act-20261122/export-manifest.json
