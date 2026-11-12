# bambocher/Qwen3.5-2B-heretic-oQ2.5e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2.5e-mtp es una cuantizacion mixta de precision del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher. Se trata de una version "decensored" (sin mecanismos de rechazo) generada mediante la herramienta Heretic v2.0.0, que aplica una ablacion de rango arbitrario (ARA) sobre las capas 12 a 23 del transformer para eliminar las respuestas de rechazo del modelo original, manteniendo intacta la cabeza de prediccion multi-token (MTP). El checkpoint resultante se ha cuantizado con oMLX v0.7.3 usando la tecnica oQ de precision mixta, con un promedio efectivo de 5,302 bits por peso.

El modelo integra tres componentes diferenciados: un modelo de lenguaje de 1,882 mil millones de parametros, un codificador visual de 331 millones y una cabeza MTP de 61 millones, sumando 2.274 millones de parametros totales. El repo ocupa 1,5 GB y esta empaquetado en formato MLX (safetensors), lo que lo orienta especificamente a la inferencia en hardware Apple Silicon. La combinacion de vision, cuantizacion agresiva y eliminacion de rechazos lo convierte en un caso de uso muy especifico: prototipado local en Mac con requisitos de contenido sin filtros.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de cuantizacion mixta por capas (desde 2 bits hasta BF16) aplicada a un modelo multimodal pequeno. Por otro, ilustra el ecosistema de variantes "heretic" que modifican el comportamiento de rechazo de modelos alineados, con implicaciones eticas y de licencia que conviene evaluar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) con cabeza MTP; basado en Qwen3.5-2B |
| Parametros totales | 2.274.069.824 (2,274B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 8-bit g64 y BF16 (promedio 5,302 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 1,5 GB / 1,404 GiB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que combina un backbone de lenguaje (1,882B de parametros) con un codificador visual (0,331B) y una cabeza de prediccion multi-token (0,061B). La cabeza MTP, tipica en modelos orientados a decodificacion especulativa, se ha conservado intacta en esta variante, lo que sugiere que el autor pretende mantener la capacidad de generar varios tokens por paso en inferencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion principal de esta variante es la ablacion de rango arbitrario (ARA) aplicada con Heretic v2.0.0. Los parametros publicados indican que la intervencion se concentra en las capas 12 a 23 (start_layer_index=12, end_layer_index=23), con un peso de preservacion de comportamiento bueno de 0,9189, un peso de direccionamiento de comportamiento malo de 0,0008 y un peso de sobrecorreccion relativa de 0,9924, usando 14 vecinos. El resultado declarado es una reduccion de rechazos de 97/100 en el modelo original a 0/100 en esta variante, con una divergencia KL de 0,1397 respecto al original. La cuantizacion oQ distribuye precision de forma no uniforme: el 54,8% de los pesos logicos quedan en 3 bits con grupo 128, el 22,4% en 3 bits con grupo 64, el 15,0% en BF16 (principalmente componentes sensibles como vision y MTP) y el resto en 2, 4, 5 y 8 bits.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-2B.
- Procesamiento de vision: el checkpoint incluye un codificador visual de 331M de parametros, por lo que admite entrada de imagenes junto a texto.
- Prediccion multi-token (MTP): la cabeza MTP se conserva, lo que permite decodificacion especulativa y potencialmente mayor throughput en MLX.
- Ausencia de rechazos: el modelo ha sido modificado para no declinar peticiones que el original rechazaria (0/100 rechazos declarados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el formato MLX y el tamano de 1,5 GB permiten cargar el modelo en un Mac con memoria unificada moderada, ideal para experimentar con un modelo multimodal pequeno sin GPU dedicada.
- Investigacion sobre alineacion y rechazo: la variante heretic con ARA documentada permite estudiar como la ablacion en capas 12-23 afecta al comportamiento de rechazo y a la divergencia KL, util para trabajos academicos sobre mecanismos de seguridad en LLMs.
- Pruebas de decodificacion especulativa: la cabeza MTP intacta permite evaluar tecnicas de prediccion multi-token en el runtime MLX y medir ganancias de throughput frente a decodificacion autoregresiva clasica.
- Generacion de descripciones de imagenes en local: el codificador visual integrado posibilita tareas de image captioning o VQA en entornos sin conexion, con la ventaja de que el modelo completo cabe en 1,5 GB.
- Evaluacion de cuantizacion mixta: sirve como referencia practica para comparar la calidad de un esquema oQ de 5,302 bits/peso frente a cuantizaciones uniformes de 4 u 8 bits en tareas de lenguaje y vision.
- Escenarios de contenido sin filtros en investigacion creativa: para estudios que requieren respuestas no censuradas (ficcion, analisis de discurso, red teaming), siempre con las advertencias eticas y legales correspondientes.

## Benchmarks y rendimiento

La model card solo publica metricas de comportamiento tras la ablacion, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,5 GB para los pesos en el formato actual (5,302 bits/peso efectivos). El runtime MLX anade overhead, por lo que conviene reservar 2-3 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y posteriores) por el formato MLX. No hay soporte declarado para CUDA en este repo.
- Cabe en consumer GPU: si, en cualquier Mac con al menos 8 GB de memoria unificada; tambien cabria en GPUs consumer con 4 GB o mas si se convirtiera a otro formato, aunque no es el proposito del repo.
- Opciones de despliegue: runtime MLX (libreria `mlx`), oMLX para gestion de cuantizaciones. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ2.5e-mtp | 2,274B | no disponible | safetensors MLX (5,302 bits/peso) | no disponible | Variante heretic con vision y MTP |
| Qwen/Qwen3.5-2B | 2,274B (aprox.) | no disponible | safetensors | no disponible | Modelo base original, con rechazos (97/100) |
| Otras variantes heretic de Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion |

La comparativa se limita al modelo base por falta de datos publicados de alternativas equivalentes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- La eliminacion de rechazos (0/100) implica que el modelo puede generar contenido que el original bloquearia; esto conlleva riesgos eticos y legales en aplicaciones publicas.
- La divergencia KL de 0,1397 respecto al original indica una desviacion medible en la distribucion de salida; puede haber degradacion en tareas que dependian del comportamiento alineado.
- La cuantizacion agresiva (2-3 bits en el 77% de los pesos logicos) puede introducir perdida de calidad adicional frente al modelo original en tareas complejas de razonamiento o vision fina.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad del modelo base ni de esta variante.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Qwen3.5-2B y las condiciones de Heretic antes de desplegar.
- El formato MLX limita el despliegue a hardware Apple; no es portable directamente a CUDA sin conversion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de su calidad.
- Riesgo de alucinacion inherente a modelos de 2B de parametros, acentuado por la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (proyecto de decensoring): https://heretic-project.org
- oQ / oMLX (cuantizacion): https://github.com/jundot/omlx
