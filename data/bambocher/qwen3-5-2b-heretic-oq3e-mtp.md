# bambocher/Qwen3.5-2B-heretic-oQ3e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ3e-mtp es una version cuantizada y "decensored" del modelo Qwen3.5-2B de Alibaba. El autor, bambocher, ha aplicado la herramienta Heretic v2.0.0 para eliminar los rechazos del modelo original y posteriormente lo ha cuantizado con oQ (oMLX v0.7.3) en precision mixta, obteniendo un checkpoint de 1,6 GB con un promedio efectivo de 5,706 bits por peso. El modelo conserva la cabeza de prediccion multi-token (MTP) intacta y mantiene el modulo de vision del modelo original.

La relevancia de esta ficha reside en que combina tres transformaciones sobre un modelo base pequeno: decensura mediante ablacion de rangos arbitrarios (ARA), cuantizacion mixta agresiva y preservacion de la cabeza MTP. El resultado es un modelo de 2.274 millones de parametros totales, de los cuales 1.882 millones corresponden al modelo de lenguaje, 331 millones a vision y 61 millones a la cabeza MTP. El formato es MLX, orientado a inferencia en hardware Apple Silicon.

No se dispone de informacion sobre la licencia del modelo derivado, los idiomas soportados ni los datos de entrenamiento del modelo base. La model card unicamente documenta el proceso de cuantizacion, los parametros de la ablacion Heretic y una comparativa de rechazos (0/100 frente a 97/100 del original) con una divergencia KL de 0,1397.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabeza MTP y modulo de vision |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit, 4-bit, 5-bit (grupo 64) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 1,6 GB |

Desglose de la cuantizacion segun la model card:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 1,247B | 54,829% | 0,508 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,611B | 26,882% | 0,320 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,076B | 3,321% | 0,048 GiB | 5,50 |
| BF16 | 0,340B | 14,967% | 0,634 GiB | 16,00 |
| Total | 2,274B | 100% | 1,511 GiB | 5,706 |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,882B | 0,913 GB / 0,850 GiB |
| Vision | 0,331B | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 0,061B | 0,046 GB / 0,043 GiB |
| Total | 2,274B | 1,622 GB / 1,511 GiB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que incorpora un modulo de vision (331 millones de parametros) y una cabeza de prediccion multi-token (MTP, 61 millones de parametros). La cabeza MTP permite predecir varios tokens por paso, lo que habilita tecnicas de decodificacion especulativa y acelera la generacion. El checkpoint derivado conserva tanto el modulo de vision como la cabeza MTP, aunque la model card no detalla la arquitectura interna del transformer base (numero de capas, dimension oculta, mecanismo de atencion).

El proceso de transformacion consta de dos etapas. Primero, la decensura mediante Heretic v2.0.0, que aplica una ablacion de rangos arbitrarios (ARA) sobre las capas 12 a 23 con los siguientes parametros: `preserve_good_behavior_weight` 0,9189, `steer_bad_behavior_weight` 0,0008, `overcorrect_relative_weight` 0,9924 y `neighbor_count` 14. Esta ablacion elimina direcciones del espacio de activaciones asociadas a rechazos, reduciendo las negativas de 97/100 a 0/100 con una divergencia KL de 0,1397 respecto al original. Segundo, la cuantizacion con oQ (oMLX v0.7.3) en precision mixta, que asigna 3 bits a la mayoria de pesos (54,8%), 4 bits a una cuarta parte (26,9%), 5 bits a una fraccion pequena (3,3%) y mantiene en BF16 el 15% restante, presumiblemente capas sensibles como embeddings, normas o la cabeza MTP. No se dispone de informacion sobre los datos de entrenamiento del modelo base, el numero de tokens utilizados ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.5-2B base, aunque no se documentan evaluaciones especificas en esta ficha.
- Procesamiento de vision: el checkpoint incluye el modulo de vision completo (331 millones de parametros), por lo que conserva la capacidad multimodal del original.
- Prediccion multi-token (MTP): la cabeza MTP se mantiene intacta, lo que permite decodificacion especulativa y generacion acelerada.
- Codigo y matematicas: no disponible de forma explicita en la informacion proporcionada; se asume herencia del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Modo thinking: no disponible en la informacion proporcionada.
- Comportamiento sin rechazos: la ablacion Heretic elimina las negativas del modelo (0/100 en la evaluacion del autor), lo que cambia el perfil de respuesta en temas sensibles.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 1,6 GB permiten ejecutar el modelo en Macs con memoria unificada, ideal para prototipado y experimentacion sin GPU dedicada.
- Investigacion sobre decensura y alineacion: el checkpoint documenta los parametros ARA y la divergencia KL, lo que lo convierte en un caso de estudio para analizar el efecto de la ablacion sobre el comportamiento del modelo.
- Evaluacion de cuantizacion mixta: la distribucion detallada de bits por componente permite estudiar el impacto de la precision mixta en calidad y latencia frente al modelo original en BF16.
- Pruebas de decodificacion especulativa: la cabeza MTP intacta permite implementar y medir tecnicas de prediccion multi-token en un modelo pequeno y ligero.
- Prototipado multimodal: el modulo de vision conservado permite experimentar con tareas imagen-texto en local, aunque sin datos publicados de rendimiento.
- Generacion de texto sin restricciones en entornos controlados: util para estudiar el comportamiento de modelos sin rechazos en tareas de red teaming y evaluacion de seguridad.
- Desarrollo de pipelines de inferencia MLX: sirve como banco de pruebas para integrar modelos cuantizados en aplicaciones macOS con la libreria MLX.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la comparativa de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,6 GB para los pesos en el formato cuantizado; el runtime MLX anade overhead, por lo que se recomienda al menos 4-6 GB de memoria unificada libre.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con memoria unificada; el formato MLX no esta pensado para GPU NVIDIA o AMD.
- Cabe en GPU consumer: si, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: MLX (libreria nativa), oMLX para gestion de cuantizacion; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ3e-mtp | 2,274B | no disponible | MLX safetensors | no disponible | Decensurado, cuantizacion mixta 5,706 bits/peso, MTP intacta |
| Qwen/Qwen3.5-2B | 2,274B (aprox.) | no disponible | safetensors | no disponible | Modelo base original, sin decensurar, BF16 |
| Alternativas de 2B en MLX | no disponible | no disponible | MLX | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- La decensura mediante Heretic elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido que el original rechazaria; requiere supervision y filtros externos en produccion.
- La divergencia KL de 0,1397 respecto al original indica un cambio medible en la distribucion de salidas; no se documenta el impacto en calidad general.
- La cuantizacion mixta a 3-5 bits puede degradar capacidades en tareas sensibles a la precision, especialmente en razonamiento y matematicas; no hay evaluaciones publicadas que lo cuantifiquen.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial ni las restricciones heredadas del modelo base Qwen.
- No se documentan los idiomas soportados ni el contexto maximo, lo que impide planificar su uso en produccion multilingue o con documentos largos.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA sin reconversion.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; se asume el comportamiento tipico de un modelo de 2B, con mayor propension a errores facticos que modelos mayores.
- Sesgos conocidos: no documentados; la ablacion puede alterar sesgos del modelo base de forma no controlada.
- El checkpoint se actualizo el 2026-11-12 con oMLX v0.7.3; versiones anteriores deben descartarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (proyecto de decensura): https://heretic-project.org
- oQ / oMLX (cuantizacion): https://github.com/jundot/omlx
