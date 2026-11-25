# mradermacher/Inkling-2-Mini-abliterated-i1-GGUF

## Resumen

Inkling-2-Mini-abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo Inkling-2-Mini-abliterated, un modelo de lenguaje de aproximadamente 22,7 millones de parametros. La publica el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones GGUF de modelos de terceros, y deriva del modelo original de mrfakename. El prefijo "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir el comportamiento de negativa del modelo.

El modelo es de tamano muy reducido (22,6 millones de parametros), lo que lo situa en la categoria de modelos experimentales o de juguete mas que en la de asistentes de proposito general. El repositorio ocupa 0,1 GB e incluye un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K, generadas con imatrix/weighted quants.

La relevancia practica es limitada: se trata de un artefacto de cuantizacion derivado, con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva, sin licencia declarada y sin datos de rendimiento. No debe confundirse con un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la informacion proporcionada) |
| Parametros totales | 22.657.976 (dato real, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se convirtio desde formato HF (convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la informacion proporcionada. El unico dato tecnico disponible es el numero de parametros (22.657.976) y que la conversion se realizo desde pesos en formato Hugging Face (convert_type: hf) con quantize_version 2 y output_tensor_quantised 1.

El proceso aplicado por mradermacher es exclusivamente de cuantizacion: se generan versiones GGUF con cuantizaciones ponderadas por imatrix a partir del modelo mrfakename/Inkling-2-Mini-abliterated. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). La etiqueta "abliterated" sugiere que el modelo base fue sometido a una ablacion de direcciones de rechazo, pero no se documenta el metodo exacto.

## Capacidades

- Generacion de texto basica, condicionada por el modelo base subyacente, del cual no se documentan capacidades especificas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan capacidades especiales (vision, audio, thinking mode).

## Casos de uso

- Experimentacion con cuantizaciones extremas: el repositorio ofrece variantes desde IQ1_S hasta Q6_K, lo que permite estudiar la degradacion de calidad en modelos de muy pocos parametros bajo cuantizacion agresiva.
- Pruebas de infraestructura de inferencia GGUF: sirve como modelo de prueba ligero para validar pipelines con llama.cpp u Ollama sin consumo de recursos significativo.
- Investigacion sobre ablacion de rechazo: util para estudiar el efecto de la tecnica "abliterated" en modelos pequenos, comparando comportamiento con el modelo base.
- Docencia y demostraciones: su tamano minimo permite ejecutarlo en cualquier equipo, incluidos entornos sin GPU, para explicar conceptos de cuantizacion.
- Benchmarking de herramientas de cuantizacion: permite evaluar el comportamiento de las cuantizaciones imatrix de mradermacher en un caso de estudio concreto.
- Pruebas de integracion en aplicaciones de chat: como modelo de sustitucion en tests automatizados de interfaces conversacionales, sin esperar calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones, dado el tamano del modelo (22,6 M de parametros) y el tamano del repo (0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; el modelo cabe en CPU.
- Cabe en cualquier GPU consumer e incluso en ejecucion solo-CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; previsiblemente muy altos por el reducido tamano, pero sin datos medidos.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 22,6 millones de parametros: la calidad de generacion sera muy limitada en comparacion con modelos de miles de millones de parametros.
- Sin model card sustantiva: no se documentan sesgos, datos de entrenamiento ni evaluaciones.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor.
- La naturaleza "abliterated" implica que se han reducido los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado o danino.
- Riesgo elevado de alucinacion, agravado por el tamano reducido y la cuantizacion.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan aun mas la calidad.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Inkling-2-Mini-abliterated-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated
