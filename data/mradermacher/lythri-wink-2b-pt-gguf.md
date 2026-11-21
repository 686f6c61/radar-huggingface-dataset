# mradermacher/Lythri-Wink-2B-pt-GGUF

## Resumen

Lythri-Wink-2B-pt-GGUF es la distribucion en formato GGUF del modelo base Lythri-Wink-2B-pt, publicada por el cuantizador mradermacher. El modelo original lo desarrolla Lythri y se presenta como un modelo base (no instruido) de tipo Gemma 4, construido mediante poda estructurada (structured pruning) y destilacion de conocimiento (knowledge distillation) a partir de un modelo mayor. Con 2.522.816.415 parametros totales, esta pensado para despliegue en dispositivo (on-device) y entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como conversacional y compatible con endpoints, aunque al ser un modelo base carece de un ajuste de instrucciones explicito. Su interes practico radica en que ofrece un tamano de aproximadamente 2,5 mil millones de parametros con una huella de memoria muy contenida: las cuantizaciones de 4 bits ocupan en torno a 2,6 GB, lo que permite ejecutarlo en GPUs de consumo e incluso en CPU.

Esta ficha cubre la version GGUF; el modelo original en pesos Transformers se encuentra en Lythri/Lythri-Wink-2B-pt. La informacion disponible sobre arquitectura detallada, datos de entrenamiento, contexto e idiomas es limitada, por lo que varios campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 2.522.816.415 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo original en safetensors/Transformers |

## Arquitectura y entrenamiento

El modelo original se describe mediante las etiquetas `gemma4`, `structured-pruning` y `knowledge-distillation`, lo que indica que parte de una arquitectura de la familia Gemma 4 y que se ha obtenido reduciendo un modelo mayor mediante poda estructurada y posterior destilacion de conocimiento. No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion (incluyendo si emplea atencion lineal o alguna variante) ni la composicion exacta del dataset de entrenamiento o el numero de tokens utilizados.

Tampoco consta si se aplicaron fases de RLHF o DPO; la etiqueta `base-model` sugiere que no se ha realizado un ajuste de instrucciones posterior. Esta version GGUF es una conversion y cuantizacion de los pesos originales, realizada con herramienta de conversion a formato HF y cuantizacion estatica (quantize_version 2, tensor de salida cuantizado). El autor indica que tambien existen cuantizaciones ponderadas con imatrix en un repositorio separado.

## Capacidades

- Generacion de texto en ingles como modelo base; no se garantiza un comportamiento de seguimiento de instrucciones sin ajuste adicional.
- Razonamiento y generacion de codigo: capacidades esperables de un modelo base de 2,5 B, si bien no hay evaluaciones publicadas en la informacion disponible.
- Etiquetado como conversacional, lo que sugiere uso en dialogos, aunque sin ajuste de instrucciones explicito.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues limitadas: la model card solo declara ingles.
- No consta soporte de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Inferencia en dispositivo (on-device): con cuantizaciones Q4 de aproximadamente 2,6 GB, el modelo cabe en moviles de gama alta, portatiles sin GPU dedicada y dispositivos embebidos, permitiendo generacion de texto local sin conexion.
- Prototipado rapido de aplicaciones de texto: al ser un modelo base pequeno y ligero, sirve para validar pipelines de generacion, tokenizacion y decodificacion antes de escalar a modelos mayores.
- Fine-tuning y especializacion: al ser un modelo base bajo Apache 2.0, puede ajustarse para tareas concretas (clasificacion, resumen, extraccion) con requisitos de memoria reducidos.
- Generacion de texto en CPU: las cuantizaciones Q2_K y Q3_K permiten ejecucion en CPU con llama.cpp u Ollama, util para entornos sin GPU.
- Educacion e investigacion: su tamano permite experimentar con poda estructurada y destilacion, comparando el comportamiento del modelo podado frente a su origen.
- Servicio de bajo coste para tareas simples: despliegue con vLLM o llama.cpp en una unica GPU de consumo para tareas de generacion de baja complejidad y alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4-2,5 GB para Q2_K/Q3_K, 2,6 GB para Q4_K_S/Q4_K_M, 2,8 GB para Q6_K, 3,1 GB para Q8_0 y 5,2 GB para f16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones de 4 bits (RTX 3050, RTX 4060, RTX 4090); A100/H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo original puede servirse con transformers y, potencialmente, vLLM o TGI si la arquitectura es compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Wink-2B-pt-GGUF | 2,52 B | no disponible | Apache 2.0 | GGUF | Modelo base podado y destilado, orientado a on-device |
| Modelo base original (Lythri/Lythri-Wink-2B-pt) | 2,52 B | no disponible | Apache 2.0 | safetensors | Mismos pesos sin cuantizar |
| Alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Al ser un modelo base, no esta ajustado para seguir instrucciones; su uso directo en tareas conversacionales puede producir respuestas inconsistentes.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por el tamano reducido y la poda estructurada.
- No se dispone de informacion sobre sesgos conocidos, contexto maximo ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los modelos de origen empleados en la destilacion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la perplejidad; se recomienda Q4_K_M o superior para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-GGUF
- Modelo base original: https://huggingface.co/Lythri/Lythri-Wink-2B-pt
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Lythri-Wink-2B-pt-GGUF
- DOI de referencia: https://doi.org/10.5281/zenodo.23179311
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
