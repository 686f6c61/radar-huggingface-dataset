# mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo LFM3-1.7B-Heretic-Uncensored, publicada por el usuario mradermacher en Hugging Face. Se trata de un derivado del modelo base LFM3-1.7B de Liquid AI, que ha sido sometido a un proceso de "abliteracion" o eliminacion de rechazos por parte del autor Peymandc, dando lugar a una variante sin censura orientada a generar contenido sin las restricciones de alineamiento habituales.

El repositorio contiene unicamente los pesos cuantizados en multiples variantes (Q2_K, IQ3_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 y varias IQ), generados con el metodo de cuantizacion con imatrix de llama.cpp. No incluye pesos en precision completa ni safetensors originales, y el tamano del repositorio figura como 0.0 GB, lo que sugiere que la informacion de metadatos esta incompleta o que el repositorio no contiene archivos en el momento de la consulta.

La relevancia de esta ficha es limitada: se trata de una publicacion de cuantizaciones derivada de un modelo base pequeno (1.700 millones de parametros segun la nomenclatura, aunque el dato de safetensors reportado es de 899.013 parametros, probablemente un error de metadatos), sin benchmarks publicados, sin licencia declarada y sin pipeline definido. Debe tratarse como un artefacto de terceros con garantias tecnicas y legales muy limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base LFM3-1.7B, presumiblemente transformer; no confirmado en la informacion) |
| Parametros totales | 899.013 segun safetensors; la nomenclatura del nombre indica 1.7B (dato inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre LFM3-1.7B sugiere que deriva de la familia Liquid Foundation Models (LFM) de Liquid AI, pero no se confirma en la model card ni en los metadatos. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento como RLHF o DPO.

Lo unico verificable es el proceso de generacion del repositorio: cuantizaciones GGUF producidas con imatrix (weighted quants), segun la cabecera de la model card, a partir del modelo Peymandc/LFM3-1.7B-Heretic-Uncensored. El proceso de "abliteracion" que da lugar a la variante Heretic se aplica sobre el modelo original para eliminar la direccion de rechazo en el espacio de activaciones, pero no se detalla la metodologia concreta ni los datos empleados en ese proceso.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base (no verificada en la informacion disponible).
- Generacion sin filtros de rechazo: la variante Heretic-Uncensored esta disenada para responder a peticiones que el modelo original rechazaria.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterado frente al original, comparando tasas de rechazo y tipos de respuesta en entornos controlados de laboratorio.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa adulta donde el modelo base aplicaria filtros; el uso debe limitarse a contenido legal y con las advertencias de la seccion de limitaciones.
- Pruebas de robustez y red teaming: evaluacion de sistemas de moderacion de contenido que deben detectar salidas no filtradas, usando el modelo como generador adversarial de casos.
- Despliegue local en hardware modesto: al ser un modelo de ~1.7B en GGUF, las variantes Q4_K_M o Q5_K_M caben en GPUs de consumo con 4-6 GB de VRAM, permitiendo experimentacion en portatiles o equipos sin aceleradores de datacenter.
- Prototipado rapido de chatbots internos: uso en entornos cerrados donde no se requiere alineamiento estricto y se prioriza baja latencia y coste cero de API.
- Analisis de sesgos y contenido toxico: generacion de corpus controlados para estudiar sesgos del modelo base y del proceso de abliteracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~1.7B en GGUF): aproximadamente 1.5-2 GB para Q4_K_M, 2.5-3 GB para Q6_K y 3.5-4 GB para Q8_0, incluyendo overhead de contexto moderado.
- Las variantes IQ1/IQ2 requieren menos de 1 GB, con perdida notable de calidad.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU mediante llama.cpp.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored-i1-GGUF | ~1.7B (no confirmado) | no disponible | no disponible | GGUF | Cuantizacion de terceros, sin benchmarks |
| LFM3-1.7B (base, Liquid AI) | ~1.7B | no disponible | no disponible en esta ficha | safetensors | Modelo original, presumiblemente alineado |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | ~1.7B | no disponible | no disponible | safetensors | Fuente directa de esta cuantizacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; el uso en produccion es legalmente arriesgado.
- Modelo "uncensored": eliminacion deliberada de los mecanismos de rechazo, con riesgo elevado de generar contenido danino, ilegal o sexualmente explicito; no apto para aplicaciones orientadas al publico sin moderacion externa.
- Inconsistencia en los metadatos: el campo de parametros totales (899.013) no concuerda con el nombre del modelo (1.7B), lo que impide fiarse de las especificaciones sin verificacion directa.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, coherence o seguridad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos heredados del modelo base, no documentados.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; no recomendadas para uso serio.
- Fecha de creacion futura (2026-11-17) en los metadatos, lo que sugiere datos corruptos o manipulados en el registro del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF
- Modelo fuente de la cuantizacion: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
