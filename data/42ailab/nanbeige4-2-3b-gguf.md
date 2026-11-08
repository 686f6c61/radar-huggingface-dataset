# 42ailab/Nanbeige4.2-3B-GGUF

## Resumen

Nanbeige4.2-3B es un modelo de chat bilingue (chino e ingles) desarrollado por el equipo Nanbeige, orientado a generacion de texto, programacion y razonamiento, con un rendimiento declarado por el autor especialmente alto para su tamano en tareas de codigo. El modelo original se publica bajo licencia Apache-2.0 y cuenta con aproximadamente 4.170 millones de parametros totales, pese a la denominacion comercial "3B" del nombre.

El repositorio `42ailab/Nanbeige4.2-3B-GGUF` no contiene un modelo nuevo ni una conversion propia: es una copia de seguridad byte a byte de la cuantizacion GGUF Q4_K_M generada por bartowski y publicada originalmente en `bartowski/Nanbeige_Nanbeige4.2-3B-GGUF`. El objetivo declarado es preservar la disponibilidad de los mismos bytes (nombres, tamanos y digests sha256 identicos) ante una posible eliminacion, renombrado o sustitucion del repositorio del conversor.

Por tanto, esta ficha describe principalmente el modelo subyacente Nanbeige4.2-3B en su formato GGUF Q4_K_M, util para inferencia local en CPU o GPU con llama.cpp y derivados, y no una variante con pesos propios. La relevancia practica reside en la disponibilidad de una cuantizacion de 2,50 GiB que permite ejecutar un modelo de chat de ~4,2B parametros en hardware de consumo, con licencia permisiva Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.169.800.704 (~4,17B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | chino e ingles (bilingue, segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Nanbeige_Nanbeige4.2-3B-Q4_K_M.gguf`, 2,50 GiB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card lo describe como un modelo de chat bilingue (chino/ingles) "fuerte en programacion y razonamiento para su tamano", pero no especifica si emplea un transformer denso convencional, una variante MoE, ni detalles sobre atencion, normalizacion o posicional. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares.

Lo unico verificable tecnicamente es el artefacto publicado: una cuantizacion GGUF Q4_K_M de 2,50 GiB generada por bartowski a partir de los pesos originales de Nanbeige, con digest sha256 `b92d2e35c9876b0c4bc671996360204f4149d0546c23d5954d5eb3b106c81f24`. El repositorio de 42ailab es una copia sin modificaciones, por lo que cualquier innovacion de entrenamiento o decodificacion del modelo original no se documenta aqui.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Programacion: la model card destaca un rendimiento en codigo notable para su tamano, sin cifras publicadas.
- Razonamiento: orientado a tareas de razonamiento general segun la descripcion del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a chino e ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: el fichero GGUF Q4_K_M de 2,50 GiB permite ejecutar el modelo en un portatil con GPU de consumo o incluso en CPU, ofreciendo autocompletado y explicacion de codigo sin conexion y sin coste de API.
- Chat bilingue chino-ingles: adecuado para equipos que atienden a usuarios en ambos idiomas, ya que el modelo se ha entrenado explicitamente para esas dos lenguas.
- Prototipado rapido de aplicaciones conversacionales: al ser Apache-2.0 y caber en hardware modesto, sirve para validar flujos de chat antes de migrar a modelos mayores.
- Despliegue en entornos con requisitos de privacidad: la inferencia local con llama.cpp evita enviar datos a servicios externos, util en sectores regulados.
- Educacion y experimentacion: un modelo de ~4,2B parametros cuantizado a 4 bits es un banco de pruebas asequible para estudiar tecnicas de prompting, cuantizacion y evaluacion.
- Tareas de generacion de texto auxiliar (resumenes, reescritura, clasificacion simple): con la salvedad de que no se han publicado benchmarks que respalden su calidad frente a alternativas del mismo tamano.
- Integracion en pipelines de CI/CD para revision de codigo automatizada: plausible por su enfoque en programacion, aunque sin datos publicados sobre tool calling ni latencia que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GiB con Q4_K_M (2,50 GiB de pesos mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura. Tambien es viable en A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), y otros runners compatibles con GGUF. vLLM y TGI no son la via natural para este artefacto concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (este, GGUF Q4_K_M) | ~4,17B | no disponible | Apache-2.0 | GGUF | Copia de la conversion de bartowski; bilingue chino/ingles |
| Abiray/Nanbeige4.2-3B-GGUF | ~4,17B (mismo modelo) | no disponible | Apache-2.0 | GGUF | Otra conversion GGUF del mismo modelo base |
| Nanbeige/Nanbeige4.2-3B (original) | ~4,17B | no disponible | Apache-2.0 | safetensors (presumiblemente) | Pesos originales del equipo Nanbeige |

No se dispone de datos de rendimiento comparado con otras familias de modelos del mismo tamano (por ejemplo, Qwen, Llama o Gemma en el rango 3-4B) en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos, pero no hay analisis publicado.
- Riesgo de alucinacion: no cuantificado; no hay evaluaciones publicadas de fidelidad o tasa de alucinacion.
- Limitaciones de contexto e idioma: solo se declaran chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia; el repositorio incluye el texto canonico de Apache-2.0.
- Caveat de procedencia: este repositorio no es el oficial del modelo ni la conversion original; es una copia de seguridad. Para trazabilidad conviene verificar los digests sha256 contra el repositorio de bartowski.
- Ausencia de benchmarks: no hay datos publicados que permitan estimar su calidad frente a alternativas, lo que desaconseja su adopcion en produccion sin evaluacion propia.
- Cuantizacion unica: solo se ofrece Q4_K_M en este repo; quien necesite Q5, Q6, Q8 o FP16 debera acudir a otras conversiones.

## Enlaces

- Repositorio de este artefacto: https://huggingface.co/42ailab/Nanbeige4.2-3B-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Conversion original de bartowski: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.2-3B-GGUF
- Conversion alternativa: https://huggingface.co/Abiray/Nanbeige4.2-3B-GGUF
- ModelScope (copia de 42ailab): https://modelscope.cn/models/42ailab/Nanbeige4.2-3B-GGUF
- Sitio del empaquetador: https://42ailab.com
- Aplicacion 42model: https://42model.com
