# rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF

## Resumen

Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF es una publicacion de pesos en formato GGUF alojada en Hugging Face por el usuario rakshazi. Por el propio nombre del repositorio se deduce que se trata de una variante "uncensored" (sin filtros de moderacion) de un modelo de aproximadamente 26 mil millones de parametros con arquitectura de mezcla de expertos (MoE), dado el sufijo "A4B", que habitualmente indica unos 4 mil millones de parametros activos por token. La distribucion se hace en cuantizaciones GGUF, pensadas para inferencia local con llama.cpp y derivados.

La model card publicada es practicamente vacia: unicamente declara la licencia apache-2.0 y no aporta informacion sobre arquitectura, contexto, datos de entrenamiento, idiomas ni resultados de evaluacion. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado el 25 de noviembre de 2026, sin actualizaciones posteriores. Se trata, por tanto, de una publicacion muy reciente y sin traccion comunitaria verificable.

La relevancia de esta ficha es limitada y debe leerse con cautela: al no existir model card sustantiva ni benchmarks publicados, la mayor parte de las especificaciones tecnicas solo puede inferirse del nombre del repositorio o queda marcada como "no disponible". Cualquier uso en produccion exige validacion empirica propia antes de adoptar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "A4B" sugiere mezcla de expertos con ~4B parametros activos, sin confirmacion documental) |
| Parametros totales | ~26B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | ~4B (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composicion del dataset ni la existencia de etapas de RLHF, DPO o ajuste fino supervisado. La model card no documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, enrutado de expertos, etc.).

Lo unico deducible del nombre es la probable condicion de modelo MoE de ~26B parametros totales con ~4B activos, y la etiqueta "Uncensored", que en la practica comunitaria indica un ajuste fino orientado a eliminar o reducir rechazos y filtros de seguridad respecto al modelo base. El modelo base original del que deriva esta variante no se identifica en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y compatible con interfaces derivadas (Ollama, LM Studio, entre otras).
- Comportamiento "uncensored": cabe esperar menor tasa de rechazos ante peticiones que un modelo alineado rechazaria, si bien no hay documentacion que lo cuantifique.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes y modo "thinking": no disponibles o no documentadas.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.

## Casos de uso

- Experimentacion e investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente como varia la tasa de rechazo y la calidad de respuesta tras un ajuste "uncensored", comparandolo con el modelo base original (que no se identifica en la informacion disponible).
- Inferencia local en hardware de consumo: al distribuirse en GGUF, puede cargarse con llama.cpp en equipos con GPU consumer, siempre que la cuantizacion elegida quepa en VRAM; requiere validacion previa del tamano real de los ficheros.
- Generacion creativa de texto sin restricciones de estilo: util para ficcion, guiones o narrativa donde el autor busca menor auto-censura, aceptando el riesgo de contenido inapropiado.
- Evaluacion comparativa de cuantizaciones GGUF: permite medir degradacion de calidad y throughput entre niveles de cuantizacion sobre una arquitectura MoE de ~26B, si bien los niveles concretos publicados no estan documentados.
- Prototipado de pipelines de inferencia: sirve como banco de pruebas para integrar modelos GGUF en servidores locales o entornos de desarrollo, dado el formato estandarizado.
- Analisis de robustez y red teaming: al carecer de filtros, resulta adecuado como sujeto de pruebas controladas para sistemas de moderacion externos, en entornos aislados y con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para ~26B parametros totales, las cuantizaciones GGUF tipicas de 4 bits rondarian aproximadamente 14-16 GB, y las de 8 bits en torno a 26-28 GB, calculado a partir del tamano nominal de parametros y no de datos publicados por el autor.
- GPU recomendadas: no disponibles; por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4 bits si el modelo efectivamente ronda los 26B, mientras que cuantizaciones mayores requeririan A100 40/80 GB, H100 o configuraciones multi-GPU.
- GPU consumer: probablemente viable en RTX 4090 o RTX 3090 con cuantizaciones bajas; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF | ~26B (~4B activos, inferido) | no disponible | apache-2.0 | GGUF | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para identificar alternativas comparables con datos verificables (parametros, contexto, benchmarks) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan arquitectura, datos de entrenamiento, contexto, idiomas ni evaluaciones; cualquier adopcion exige validacion empirica propia.
- El sufijo "A4B" y el tamano "26B" son inferencias del nombre del repositorio, no datos confirmados por el autor.
- La etiqueta "Uncensored" implica mayor probabilidad de generar contenido ofensivo, ilegal o danino; requiere moderacion externa obligatoria en cualquier despliegue expuesto a usuarios.
- Riesgo elevado de alucinacion no cuantificado, al no existir evaluaciones publicadas.
- Cero descargas y cero "likes": no hay evidencia de uso comunitario ni de validacion por terceros.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero el autor no aclara la procedencia del modelo base ni posibles restricciones heredadas de este; conviene verificar antes de uso comercial.
- Idiomas y cobertura multilingue desconocidos; no asumir buen rendimiento en castellano sin pruebas.
- Fecha de creacion futura (25 de noviembre de 2026) y ausencia de actualizaciones: metadatos atipicos que desaconsejan tratarlo como referencia estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rakshazi/Dark-Scarlett-v1.0-26B-A4B-Uncensored-GGUF
- Model card del autor: no disponible (la pagina del repositorio contiene unicamente la licencia apache-2.0)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
