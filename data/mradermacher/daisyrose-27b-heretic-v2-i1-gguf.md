# mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-i1-GGUF es una cuantizacion en formato GGUF del modelo kelsey1337/DaisyRose-27B-Heretic-v2, publicada por mradermacher. Se trata de una variante "abliterated" (tambien etiquetada como "uncensored" y "heretic") de un modelo de aproximadamente 26.900 millones de parametros, derivada de la familia Qwen (la etiqueta del repositorio indica "qwen3.8"). El trabajo de mradermacher consiste en generar cuantizaciones ponderadas con fichero imatrix para facilitar la inferencia en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base resuelve el problema de ofrecer una version sin los mecanismos de rechazo habituales (refusals) del modelo original, orientada a usos conversacionales donde el filtrado previo resulta limitante. La model card del repositorio de cuantizacion es escueta y remite al modelo original para detalles de entrenamiento, por lo que buena parte de las especificaciones de arquitectura y datos de entrenamiento no estan documentadas en la informacion disponible.

La relevancia de esta publicacion es practica: pone a disposicion un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K, ademas de tipos Q4_0 y Q4_1) de un modelo de ~27B, lo que permite desplegarlo en GPU de consumo con VRAM limitada. La licencia declarada es Apache 2.0 y el unico idioma soportado segun la model card es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, segun etiqueta "qwen3.8"); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); fichero imatrix incluido; modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su adscripcion a la familia Qwen (etiqueta "qwen3.8") y su naturaleza transformer. El repositorio de cuantizacion no incluye datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La unica innovacion tecnica documentada en esta publicacion es el uso de cuantizacion ponderada con fichero imatrix, que mejora la calidad de las cuantizaciones de baja precision frente a las estaticas.

El rasgo distintivo del modelo base es su caracter "abliterated" o "heretic": se ha modificado el modelo para eliminar los comportamientos de rechazo, lo que afecta a su comportamiento conversacional pero no cambia su arquitectura subyacente. El repositorio de mradermacher incluye ademas la nota de que el modelo es de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio de cuantizaciones estaticas (DaisyRose-27B-Heretic-v2-GGUF), no en este.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline "conversational").
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo original rechazaria.
- Posible soporte de vision segun la nota de la model card, con ficheros mmproj alojados en el repositorio estatico; no confirmado en este repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking: no disponible en la informacion.

## Casos de uso

- Despliegue local en GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS de un modelo de ~27B permiten ejecucion en tarjetas con 16-24 GB de VRAM mediante llama.cpp u Ollama, sin depender de APIs externas.
- Investigacion sobre alineamiento y seguridad: el caracter abliterated permite estudiar el comportamiento del modelo ante prompts que el original rechaza, util para analisis de robustez y evaluacion de filtros.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde los rechazos del modelo base interrumpen el flujo, con contexto conversacional multi-turno.
- Prototipado de asistentes conversacionales: integracion en aplicaciones de chat mediante el formato GGUF y servidores compatibles (llama.cpp server, Ollama), aprovechando la etiqueta "endpoints_compatible".
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un rango amplio de tipos (de IQ1_S a Q6_K) que permite medir el impacto de la precision en la calidad de salida sobre el mismo modelo base.
- Analisis de sesgos y comportamiento en ingles: al ser un modelo solo en ingles, sirve para experimentos controlados de evaluacion de sesgos en ese idioma sin variabilidad multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Las variantes de ~4 bits (Q4_K_M, IQ4_XS) de un modelo de ~27B ocupan del orden de 15-17 GB, lo que exige GPU de 16 GB o mas; las variantes Q5 y Q6 superan los 18-20 GB.
- Las cuantizaciones de 2-3 bits (IQ2_*, Q3_K_*) permiten ajustar en GPUs de 8-12 GB con perdida de calidad.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5 comodamente; RTX 3090 (24 GB) equivalente; A100/H100 para despliegues de mayor throughput; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 12 GB solo con cuantizaciones de 2-3 bits.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": eliminacion deliberada de rechazos, con riesgo de generar contenido inapropiado, danino o ilegal; requiere filtrado y supervision en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: no documentado, pero inherente a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no documentados en la informacion disponible; la ausencia de datos de entrenamiento impide evaluarlos.
- Licencia Apache 2.0 declarada, que permite uso comercial; sin embargo, la procedencia y las condiciones del modelo base (kelsey1337/DaisyRose-27B-Heretic-v2) deberian verificarse de forma independiente antes de un uso comercial.
- La model card del repositorio de cuantizacion es minima y remite al modelo original para detalles; no hay garantias documentadas sobre contexto, arquitectura exacta ni calidad de las cuantizaciones de muy baja precision.
- El soporte de vision no esta confirmado en este repositorio; los ficheros mmproj, si existen, estan en el repositorio estatico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
