# mradermacher/based-7b-GGUF

## Resumen

`mradermacher/based-7b-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `QuixiAI/based-7b`, un modelo de lenguaje de aproximadamente 6.738 millones de parametros (6,7B) afinado sobre el dataset `ehartford/based`. El trabajo de cuantizacion lo realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, que ofrece tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas con imatrix (en un repositorio hermano, `based-7b-i1-GGUF`).

El modelo esta pensado para inferencia local en ingles: la model card solo declara el idioma `en` y el pipeline no esta especificado. Al tratarse de una cuantizacion de un modelo de 7B, el interes principal reside en la posibilidad de ejecutarlo en hardware de consumo (GPU de 8-24 GB o incluso CPU) con perdida de calidad controlada, usando herramientas compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de esta ficha es practica: permite evaluar rapidamente si el modelo y sus cuantizaciones encajan en un despliegue concreto. No obstante, la informacion publicada es escasa: no hay datos de arquitectura detallados, contexto, benchmarks ni terminos exactos de licencia mas alla de `other`, por lo que muchos campos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; modelo base `QuixiAI/based-7b`) |
| Parametros totales | 6.738.415.616 (6,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | `other` (terminos no especificados en la informacion disponible) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en safetensors |
| Tamano del repositorio | 59,6 GB (incluye todas las cuantizaciones) |
| Dataset de entrenamiento | `ehartford/based` |
| Libreria declarada | transformers |
| Fecha de creacion | 2025-03-15 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `QuixiAI/based-7b` mas alla de que se trata de un transformer de aproximadamente 6,7B parametros. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset `ehartford/based`, mas alla de su identificador en Hugging Face.

El proceso de cuantizacion realizado por mradermacher sigue el flujo estandar de conversion a GGUF (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`). Se ofrecen cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas con imatrix en `mradermacher/based-7b-i1-GGUF`, que suelen preservar mejor la calidad a igual tamano. No se documenta si el modelo base recibio RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generacion de texto en ingles: el modelo esta orientado a tareas de lenguaje general, aunque no se detallan capacidades especificas en la informacion disponible.
- Razonamiento y conversacion: no hay documentacion que confirme modos de pensamiento (thinking) ni capacidades de razonamiento multi-paso verificadas.
- Codigo y matematicas: no disponible; no se declaran capacidades especificas ni benchmarks que las respalden.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes: no disponible; sin documentacion de uso agentico.
- Capacidades multilingues: solo ingles declarado (`en`); no se garantiza soporte de otros idiomas.
- Capacidades especiales (vision, audio): no disponible; no se declaran.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso con infraestructura de inferencia estandar, aunque no se detalla.

## Casos de uso

- Inferencia local en equipos de consumo: con las cuantizaciones Q4_K_M (4,2 GB) o Q5_K_M (4,9 GB), el modelo puede ejecutarse en GPUs de 8 GB o en CPU con llama.cpp, lo que lo hace adecuado para prototipado offline y experimentacion sin coste de API.
- Generacion de texto en ingles en entornos con recursos limitados: la cuantizacion Q2_K (2,6 GB) permite desplegar el modelo en dispositivos con poca memoria, aceptando una perdida de calidad mayor, para tareas de generacion sencilla.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la calidad (perplejidad) y elegir el equilibrio tamano/calidad adecuado para un pipeline concreto.
- Despliegue en Ollama o LM Studio: al ser GGUF, el modelo se puede importar directamente en estas herramientas para asistentes de escritorio o pruebas de chat locales en ingles.
- Fine-tuning posterior sobre el modelo base: quien necesite adaptar el modelo puede partir de `QuixiAI/based-7b` en safetensors y usar estas cuantizaciones solo para inferencia o validacion.
- Experimentacion con el dataset `ehartford/based`: investigadores interesados en el efecto de dicho dataset pueden usar el modelo como referencia y comparar sus salidas con las del modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,6 GB
  - Q3_K_M: ~3,4 GB
  - Q4_K_M: ~4,2 GB
  - Q5_K_M: ~4,9 GB
  - Q6_K: ~5,6 GB
  - Q8_0: ~7,3 GB
  - f16: ~13,6 GB
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, RTX 3060 8 GB, RTX 4060, RTX 3070); 12-16 GB para Q6/Q8 (RTX 4070 Ti, RTX 4080); 16-24 GB para f16 (RTX 4090, A100). No se dispone de datos especificos de rendimiento en A100/H100.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas usando cuantizaciones Q4_K_M o inferiores. Las cuantizaciones Q2/Q3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para servidores, es posible usar llama.cpp server o vLLM si soporta el formato (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mradermacher/based-7b-GGUF` | 6,7B | no disponible | other | GGUF | Cuantizaciones de `QuixiAI/based-7b`; solo ingles |
| `QuixiAI/based-7b` | 6,7B | no disponible | other | safetensors | Modelo base original |
| `mradermacher/based-7b-i1-GGUF` | 6,7B | no disponible | other | GGUF (imatrix) | Mismo modelo con cuantizaciones ponderadas de mayor calidad |
| Mistral-7B (referencia generica) | 7,2B | 32k (segun version) | Apache 2.0 | safetensors/GGUF | Alternativa ampliamente documentada; no comparable en benchmarks por falta de datos del modelo evaluado |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- No hay benchmarks publicados, por lo que no se puede verificar su calidad frente a alternativas de tamano similar.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones ni evaluaciones de factualidad.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset `ehartford/based` no esta descrito en detalle en la informacion disponible.
- Licencia `other`: los terminos exactos no estan especificados, por lo que el uso comercial requiere revisar la licencia del modelo base `QuixiAI/based-7b` antes de desplegarlo en produccion.
- Longitud de contexto desconocida: limita la planificacion de aplicaciones con conversaciones largas o documentos extensos.
- El repositorio ocupa 59,6 GB porque incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/based-7b-GGUF
- Modelo base: https://huggingface.co/QuixiAI/based-7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/based-7b-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#based-7b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/based
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
