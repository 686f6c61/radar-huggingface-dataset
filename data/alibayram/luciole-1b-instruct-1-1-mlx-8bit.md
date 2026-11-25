# alibayram/Luciole-1B-Instruct-1.1-mlx-8bit

## Resumen

Luciole-1B-Instruct-1.1-mlx-8bit es una cuantizacion en 8 bits del modelo OpenLLM-France/Luciole-1B-Instruct-1.1, empaquetada en formato MLX por el usuario alibayram para su ejecucion en hardware Apple Silicon. El modelo base es un transformer decoder-only de aproximadamente 1.320 millones de parametros, afinado para instrucciones y conversacion, desarrollado por OpenLLM-France como parte de la familia Luciole, orientada al ecosistema linguistico frances e ingles.

La relevancia de esta ficha concreta reside en el formato: al estar convertida a MLX con cuantizacion de 8 bits, permite ejecutar un modelo de instrucciones bilingue (frances e ingles) de forma local en Macs con chip M-series, sin necesidad de GPU dedicada. El repositorio ocupa 1,4 GB y esta sujeto a acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Se trata de una publicacion de la comunidad, no oficial, con cero descargas y cero likes en el momento de la consulta, creada el 24 de noviembre de 2026. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como nemotron en los tags del repo) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base admite otras cuantizaciones no especificadas aqui |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Luciole-1B-Instruct-1.1 es un transformer decoder-only de aproximadamente 1.320 millones de parametros, afinado para seguir instrucciones y mantener conversaciones. Los tags del repositorio incluyen la etiqueta "nemotron", lo que sugiere que la arquitectura deriva de la familia Nemotron de NVIDIA, aunque la informacion disponible no detalla la configuracion exacta de capas, dimensiones ocultas ni mecanismo de atencion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar en el afinado del modelo base. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La unica transformacion aplicada en este repositorio es la conversion a formato MLX con cuantizacion de 8 bits, realizada por alibayram a partir de los pesos originales de OpenLLM-France.

## Capacidades

- Generacion de texto en frances e ingles, con orientacion a instrucciones y dialogo conversacional.
- Seguimiento de instrucciones multi-turno, segun su naturaleza de modelo Instruct.
- Generacion de codigo y tareas de razonamiento basicas, propias de un modelo de 1B de parametros; sin datos publicados que lo confirmen.
- Capacidades multilingues limitadas a frances e ingles segun los metadatos del repositorio.
- Ejecucion local en Apple Silicon mediante MLX, con pesos cuantizados en 8 bits.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistentes conversacionales locales en frances: el modelo puede gestionar dialogos multi-turno en una Mac con chip M-series, aprovechando su cuantizacion MLX de 8 bits para mantener un consumo de memoria reducido.
- Prototipado rapido de aplicaciones NLP bilingues: util para validar pipelines de generacion de texto en frances e ingles antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos sin GPU dedicada: al ejecutarse via MLX en Apple Silicon, permite integrar generacion de texto en herramientas de escritorio para macOS.
- Filtrado y resumen de documentos en frances: adecuado para tareas de extraccion y condensacion de contenido donde no se requiere un modelo de gran escala.
- Educacion y experimentacion: modelo ligero para aprender a desplegar modelos cuantizados con MLX y comparar el impacto de la cuantizacion de 8 bits frente a los pesos originales.
- Chatbots de bajo coste en produccion interna: con 1,4 GB de pesos, puede desplegarse en equipos modestos para tareas de atencion sencilla o clasificacion conversacional.
- Traduccion informal frances-ingles: aunque no esta especializado en traduccion, su naturaleza bilingue permite usos auxiliares en este ambito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: en torno a 1,4 GB para los pesos en 8 bits, mas overhead de ejecucion (KV cache y buffers), por lo que se recomienda al menos 3-4 GB de memoria unificada disponible.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante la libreria MLX.
- No esta pensado para GPU NVIDIA ni CUDA; requiere el stack MLX de Apple.
- Cabe holgadamente en cualquier Mac con 8 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para generacion, y potencialmente conversiones a GGUF para llama.cpp u Ollama si se realizan aparte (no incluidas en este repo).
- Latencia y throughput: no disponibles; dependeran del chip concreto y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luciole-1B-Instruct-1.1-mlx-8bit | 1,32 B | no disponible | fr, en | Apache 2.0 | MLX safetensors 8-bit |
| OpenLLM-France/Luciole-1B-Instruct-1.1 (base) | 1,32 B | no disponible | fr, en | Apache 2.0 | safetensors |
| Modelos de ~1B tipo Llama 3.2 1B Instruct | ~1,2 B | 128k (segun documentacion publica del original) | multilingue | licencia Llama | safetensors, GGUF |
| Modelos de ~1B tipo Gemma 2 2B / Qwen2.5 1.5B | 1,5-2 B | variable | multilingue | licencias propias | safetensors, GGUF |

La comparativa con Llama 3.2 1B y Qwen2.5 1.5B se ofrece como referencia de categoria; no se dispone de datos de rendimiento de Luciole que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Publicacion de la comunidad con cero descargas y cero likes: no hay validacion externa de la calidad de la cuantizacion ni del proceso de conversion.
- Modelo de 1,3 B de parametros: capacidad limitada para razonamiento complejo, matematicas avanzadas y generacion de codigo extensa; riesgo elevado de alucinacion en tareas factuales.
- Cobertura linguistica restringida a frances e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- No se documentan sesgos especificos, pero al derivar de un corpus frances e ingles puede heredar sesgos culturales y linguisticos de dichos datos.
- La cuantizacion de 8 bits puede introducir degradaciones menores respecto a los pesos originales en tareas sensibles.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y del acceso gated antes de un despliegue en produccion.
- Compatibilidad limitada al ecosistema MLX/Apple Silicon; no es directamente usable en CUDA sin conversion adicional.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alibayram/Luciole-1B-Instruct-1.1-mlx-8bit
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- Organizacion OpenLLM-France: https://huggingface.co/OpenLLM-France
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
