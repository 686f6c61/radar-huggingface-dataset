# notnaurw/Qwen3.8-27B-oQ5e-SAGE-ARCS-mtp

## Resumen

`notnaurw/Qwen3.8-27B-oQ5e-SAGE-ARCS-mtp` es una cuantización de precisión mixta a 5 bits en formato MLX del modelo multimodal `Qwen/Qwen3.8-27B`, publicada por el usuario notnaurw. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado cuyo objetivo es reproducir el comportamiento del modelo base en bf16 dentro de un presupuesto de precisión reducido: ocupa 21,13 GB (19,68 GiB) con una media de 6,0836 bits por peso, frente a los aproximadamente 55,6 GB que ocuparían los 27.781.427.952 parámetros en bf16.

La innovación declarada por el autor es el pipeline de calibración SAGE-ARCS (Activation-guided Reranked Calibration Scale), que mantiene el objetivo de SAGE —asignar el presupuesto de precisión donde mejor se preserva el comportamiento del modelo fuente— pero cambia la distribución de calibración, desplazándola hacia cargas de trabajo agénticas. El resultado es un checkpoint que preserva mejor el original en texto agéntico a cambio de cierta fidelidad en la distribución generalista. Además, conserva intactos dos componentes del modelo base: la torre de visión y la cabeza de predicción multi-token (MTP), esta última en bf16 en 15 tensores.

Su relevancia es práctica y acotada: permite ejecutar un modelo visión-lenguaje de 27B en Apple Silicon con memoria unificada moderada, manteniendo la decodificación especulativa nativa vía Lightning MTP en oMLX. Está pensado para ese stack concreto (MLX + oMLX), no para despliegues CUDA convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) cuantizado; el tag del repositorio indica `qwen3_5`. Detalle de capas y atencion no disponible |
| Parametros totales | 27.781.427.952 (dato real de los safetensors) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta de 5 bits (coleccion `oQ5e`), 6,0836 bpw de media; cabeza MTP preservada en bf16 (15 tensores) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 21,1 GB (21,13 GB / 19,68 GiB de pesos) |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 79 / 0 |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-10-04 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen3.8-27B (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre su arquitectura interna mas alla de lo que indican las etiquetas del repositorio: un transformer multimodal capaz de procesar imagen y texto, con una cabeza de prediccion multi-token (MTP) y una torre de vision. Esta ultima se conserva en el proceso de cuantizacion, igual que la cabeza MTP.

Lo que si se documenta es el metodo de cuantizacion. SAGE establece el objetivo de asignar un presupuesto de bits fijo alli donde mejor se preserva el comportamiento del modelo fuente en bf16. SAGE-ARCS mantiene ese objetivo pero modifica la distribucion sobre la que se mide la sensibilidad: en lugar de una calibracion generalista, el corpus se desplaza hacia cargas de trabajo agénticas. Como la sensibilidad de cada peso depende de la distribucion con la que se mide, cambiar el corpus cambia donde se asigna la precision extra, y por tanto donde el modelo cuantizado sigue mas fielmente a su fuente. El autor es explicito en que el objetivo no es anadir capacidades ausentes en el modelo original, sino comprobar como un mismo presupuesto de precision preserva de forma distinta el comportamiento existente segun la distribucion objetivo. La decodificacion especulativa se apoya en la cabeza MTP preservada, que se sirve con Lightning MTP habilitado en oMLX.

## Capacidades

- Generacion de texto conversacional multi-turno, con el tag `conversational` en el repositorio.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`): la torre de vision se preserva en la cuantizacion.
- Razonamiento y generacion de codigo: no confirmado de forma explicita en la informacion disponible, aunque es esperable en un modelo de la familia Qwen de 27B.
- Decodificacion especulativa mediante la cabeza MTP nativa, preservada en bf16 para servir con Lightning MTP en oMLX.
- Rendimiento optimizado para cargas de trabajo agénticas, segun la calibracion SAGE-ARCS.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes autonomos en local sobre Apple Silicon: el checkpoint esta calibrado especificamente para distribuciones agénticas, de modo que tareas de planificacion, uso de herramientas y razonamiento en varios pasos conservan mejor la fidelidad al modelo bf16 que una cuantizacion calibrada de forma generalista.
- Inferencia privada en estaciones de trabajo Mac: al ejecutarse con MLX sobre memoria unificada y sin depender de GPUs dedicadas, permite desplegar un modelo de 27B en entornos donde los datos no pueden salir del equipo.
- Analisis de documentos con imagen y texto: la torre de vision preservada permite tareas de image-text-to-text sobre capturas, diagramas o formularios, combinando la lectura visual con generacion de texto.
- Prototipado rapido de pipelines agénticos: con oMLX y Lightning MTP activado, sirve como banco de pruebas para medir latencia y calidad de agentes antes de pasar a un despliegue mayor.
- Generacion de codigo asistida en local para equipos que quieren evitar enviar repositorios propietarios a APIs externas, siempre que se valide primero la calidad del modelo cuantizado en la tarea concreta.
- Asistentes conversacionales de larga duracion: la decodificacion especulativa via MTP reduce el coste por token, lo que abarata conversaciones multi-turno extensas en hardware de consumo.
- Evaluacion comparativa de metodos de cuantizacion: al ser una variante de una coleccion SAGE5 `oQ5e`, resulta util para contrastar empiricamente el efecto de la distribucion de calibracion sobre la fidelidad al modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe el efecto cualitativo de la calibracion (mejor fidelidad al bf16 en distribuciones agénticas, con cierta perdida en la distribucion generalista), pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni valores de perplejidad frente al modelo base.

## Requisitos de hardware

- Los pesos ocupan 21,13 GB (19,68 GiB). A esa cifra hay que sumar el overhead de la cache KV, las activaciones y el encoder de vision, por lo que en la practica se necesita mas memoria que el tamano del repositorio.
- Estimacion orientativa: Mac con 32 GB de memoria unificada como minimo para contextos cortos; 64 GB o mas para contextos largos, lotes mayores o trabajo simultaneo con otras aplicaciones.
- El formato es MLX, por lo que el hardware objetivo son los chips de Apple Silicon (series M1, M2, M3 y M4). No es un checkpoint para GPU NVIDIA o AMD.
- No cabe en GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) en este formato, ya que MLX no esta pensado para ese flujo; requeriria reconvertir a otro formato, algo que el repositorio no ofrece.
- Opciones de despliegue: oMLX con Lightning MTP habilitado (escenario previsto por el autor) y el stack MLX / mlx-lm. La model card no menciona soporte para vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF.
- Latencia y throughput: no disponible. El autor solo indica que la cabeza MTP se preserva para habilitar la decodificacion especulativa, sin cifras de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits | Tamano | Vision | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| notnaurw/Qwen3.8-27B-oQ5e-SAGE-ARCS-mtp | 27,78 B | MLX, precision mixta 5 bits (6,0836 bpw) | 21,13 GB | Preservada | Preservada (bf16) | apache-2.0 | Publicado en HuggingFace, 79 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B | bf16 | ~55,6 GB (estimado a partir del numero de parametros) | Si | Si | apache-2.0 | Publicado por el autor original |
| Otras variantes de la coleccion SAGE5 `oQ5e` | no disponible | MLX 5 bits | no disponible | Configurable segun la variante | Configurable segun la variante | no disponible | Referenciadas en la model card, sin datos completos |
| Alternativas de otros autores del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- Se trata de una cuantizacion, no de un modelo nuevo: no anade capacidades ausentes en Qwen/Qwen3.8-27B y hereda tanto sus sesgos como sus limitaciones.
- La calibracion SAGE-ARCS prioriza la distribucion agéntica, lo que segun el propio autor implica menor fidelidad en la distribucion generalista en comparacion con SAGE. Es un intercambio explicito, no una mejora gratuita.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por la perdida de precision de la cuantizacion de 5 bits. No hay evaluaciones publicadas que cuantifiquen ese efecto.
- La cuantizacion a 5 bits puede degradar tareas sensibles a la precision numerica fina (matematicas, calculo, generacion de codigo con detalles exactos). No se aportan medidas de esa degradacion.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no es posible garantizar un comportamiento concreto en castellano ni dimensionar aplicaciones con contextos largos.
- Compatibilidad restringida: requiere MLX y Apple Silicon, y el escenario previsto es oMLX con Lightning MTP. No se ofrecen pesos GGUF ni soporte declarado para vLLM, TGI o llama.cpp.
- Licencia apache-2.0 en el repositorio, lo que permite uso comercial, pero el autor de la cuantizacion no aporta garantias sobre el comportamiento del checkpoint ni sobre el cumplimiento de las condiciones aplicables al modelo base.
- Repositorio con 0 likes y 79 descargas: la validacion por parte de la comunidad es practicamente inexistente en el momento de redactar esta ficha.
- La fecha de referencia del repositorio es de 2026, posterior al conocimiento consolidado disponible sobre la familia Qwen; conviene verificar la model card original antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notnaurw/Qwen3.8-27B-oQ5e-SAGE-ARCS-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX: https://github.com/jundot/omlx
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
