# openamer-max/openamer-max-pro

## Resumen

OpenAmer-Pro es un ajuste fino del modelo base `mistralai/Mistral-Small-24B-Instruct-2501` (Apache-2.0) publicado por el autor independiente openamer-max. Forma parte de la familia OpenAmer, una escalera de modelos pensada para ejecución local en dispositivo ("on-device"), que va desde una variante de 0,6B hasta una de 32B. Pro ocupa el quinto escalón: 24B parámetros, distribuidos como GGUF Q4_K_M de 13,35 GB, con el objetivo de correr en una máquina con unos 16 GB de RAM libre sin cuenta ni cloud.

El modelo está entrenado mediante QLoRA de 4 bits (r=32, alpha=64) sobre el modelo base de Mistral, con un entrenamiento declarado de 170 pasos en una L40S de 48 GB durante 37 minutos. Su foco son dos idiomas: alemán y bosnio/croata/serbio, con inglés funcional pero no prioritario. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste fino pequeño y reproducible orientado a despliegue local; por otro, el propio autor advierte de forma explícita que este escalón no supera al de 14,7B de la misma familia en su banco de pruebas interno (43/45 frente a 44/45), lo que lo convierte en un caso interesante para discutir la relación entre tamaño y calidad en modelos ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-Small-24B-Instruct-2501); detalles internos del base no disponibles en la informacion proporcionada |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor configurado en el Modelfile de referencia); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (13,35 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | Aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); safetensors del modelo base no incluidos en el repo del ajuste |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Mistral-Small-24B-Instruct-2501. El autor no documenta cambios arquitectonicos: se trata de un adaptador QLoRA de 4 bits con rango r=32 y alpha=64 fusionado sobre el modelo base. El entrenamiento se realizo en HF Jobs sobre una GPU L40S de 48 GB, con 170 pasos y un pico de VRAM de 19,46 GB, en 37 minutos. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset; si se indica que el objetivo es conocimiento de producto y respuestas concisas en aleman y bosnio/croata/serbio.

No hay innovaciones tecnicas destacables a nivel de arquitectura (ni decodificacion especulativa, ni atencion lineal, ni modo thinking). La aportacion del autor es el proceso de ajuste y, sobre todo, la metodologia de evaluacion: un banco de pruebas congelado de 45 casos en once categorias (facticidad, parafrasis, preguntas de parada, bosnio, bosnio con parada, texto largo, respuesta corta, casos limite), evaluado mediante grupos de palabras obligatorias y prohibidas. El autor documenta ademas seis errores de su propio evaluador, corregidos y registrados, lo que aporta trazabilidad al proceso.

## Capacidades

- Generacion de texto conversacional en aleman y en bosnio/croata/serbio, con ingles funcional.
- Respuestas concisas y orientadas a hechos: el modelo esta entrenado para contestar de forma breve y directa, no para desarrollar ensayos.
- Comprension de texto largo dentro de la ventana configurada de 8192 tokens.
- Seguimiento de instrucciones de formato en la mayoria de casos, aunque el banco de pruebas registra un fallo real al ignorar la instruccion "una sola palabra".
- Capacidad limitada de uso de herramientas: supero un smoke-test basico de manipulacion de ficheros, pero no ejecuto una llamada MCP en el harness PLE.
- No dispone de vision, audio ni modo de razonamiento extendido segun la informacion disponible.
- Capacidades multilingues limitadas a los cinco idiomas declarados; no se documenta soporte para castellano.

## Casos de uso

- Asistente local de atencion al cliente en aleman: el modelo puede mantener conversaciones multi-turno dentro de una ventana de 8192 tokens y responder con precision sobre un catalogo de producto acotado, ejecutandose en local sin enviar datos a terceros.
- Despliegue en escritorio para usuarios de bosnio, croata o serbio: al ser uno de los pocos ajustes que cubre explicitamente estas lenguas, sirve para interfaces de ayuda integradas en aplicaciones de escritorio con 16 GB de RAM.
- Clasificacion y extraccion de informacion en lotes: con temperatura 0 y respuestas cortas, es adecuado para tareas de etiquetado, normalizacion de campos o resumen de una linea en pipelines por lotes ejecutados en CPU o GPU modesta.
- Base para ajustes posteriores: al ser Apache-2.0 y estar disponible en GGUF, se puede usar como punto de partida para QLoRA especificos de dominio en una sola GPU de 48 GB, como demuestra el propio entrenamiento del autor.
- Prototipado offline en entornos sin conectividad: util para demos y pruebas de concepto en ferias, aulas o instalaciones aisladas donde no se puede depender de una API en la nube.
- Traduccion asistida aleman-bosnio/croata/serbio en herramientas internas: aunque el autor no lo presenta como modelo de traduccion, los idiomas estan entrenados y puede integrarse en flujos de pre-traduccion con revision humana.
- Evaluacion comparativa de ajustes finos: su banco de pruebas publico y congelado de 45 casos lo convierte en un caso de referencia para quien quiera reproducir una metodologia de evaluacion de modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados son del banco de pruebas propio del autor (45 casos), no de benchmarks academicos estandar.

| Modelo | Parametros | Tamano | Pruefstand v2 (45 casos) |
|---|---|---|---|
| OpenAmer Watch | 0,60B | 639 MB | 37/45 (82,2 %) |
| OpenAmer Phone | 3,09B | 2,5 GB | 43/45 (95,6 %) |
| OpenAmer Tab | 7,62B | 4,4 GB | 42/45 (93,3 %) |
| OpenAmer Desktop | 14,70B | 8,4 GB | 44/45 (97,8 %) |
| OpenAmer Pro (este modelo) | 24,00B | 13,4 GB | 43/45 (95,6 %) |
| Qwen2.5-14B sin entrenar (referencia) | 14,70B | — | 22/45 (48,9 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible. El autor senala que en un benchmark publico de ingenieria el mejor modelo abierto del mundo alcanza 26 sobre 100 y que este modelo es considerablemente mas pequeno, sin aportar cifra propia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 16 GB de RAM libre para el GGUF Q4_K_M de 13,35 GB; con GPU, 13-14 GB de VRAM para cargar el modelo completo en memoria de video.
- GPU recomendadas: L40S 48 GB (usada en el entrenamiento), A100 o H100 para mayor margen; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el Q4_K_M completo.
- Cabe en GPU consumer de 16 GB con margen justo (por ejemplo, RTX 4080 o 4060 Ti de 16 GB) y con holgura en tarjetas de 24 GB. En equipos de 16 GB de RAM sin GPU funciona por CPU, con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run amersacirovic/openamer-max-pro`), y endpoints compatibles segun los tags del repositorio. vLLM y TGI no estan documentados para este GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. El autor publica un "Geraetepass" con tiempos de respuesta por dispositivo, pero las cifras concretas no se incluyen en la informacion proporcionada.
- Configuracion recomendada por el autor: `temperature 0`, `repeat_penalty 1.0`, `num_ctx 8192`. Con `repeat_penalty 1.1` el modelo invirtio una negacion en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Pro | 23,6B | 8192 (config.) | Apache-2.0 | GGUF Q4_K_M | Ajuste QLoRA de Mistral-Small-24B; 43/45 en banco propio |
| OpenAmer-Desktop | 14,7B | no disponible | Apache-2.0 | GGUF | Misma familia; 44/45 en el mismo banco, supera a Pro |
| Mistral-Small-24B-Instruct-2501 | 24B | no disponible en la informacion proporcionada | Apache-2.0 | safetensors | Modelo base sin ajustar; referencia directa |
| Qwen2.5-14B | 14,7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Referencia del autor sin entrenar: 22/45 |

La comparacion mas relevante es interna a la familia: el escalon Desktop (14,7B) obtiene mejor puntuacion que Pro con 5 GB menos de peso. Frente al modelo base sin ajustar no hay medicion publicada en la informacion disponible.

## Limitaciones y advertencias

- No es un agente de herramientas: fallo una llamada MCP en el harness PLE; el autor lo desaconseja explicitamente para trabajo de agentes.
- El banco de pruebas mide conocimiento de producto sobre OpenAmer, no dominio tecnico; no es un indicador de calidad en ingenieria, matematicas o codigo.
- Solo dos lenguas realmente entrenadas (aleman y bosnio/croata/serbio); el ingles funciona pero no es el foco. No hay soporte documentado de castellano.
- Riesgo de alucinacion no cuantificado: el autor afirma que en su banco no hubo errores de hechos, pero se trata de 45 casos y no de una evaluacion de robustez.
- Sensibilidad a parametros de muestreo: con `repeat_penalty 1.1` el modelo invirtio una negacion; el autor exige 1.0 y temperatura 0 para consultas facticas.
- Un fallo documentado de seguimiento de instrucciones de formato (ignorar "una sola palabra").
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base Mistral-Small-24B-Instruct-2501, tambien Apache-2.0 segun la informacion disponible.
- Modelo de nicho con 838 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de sus resultados.
- El repositorio tiene 14,3 GB y fecha de creacion 2026-11-13; la madurez y el mantenimiento a largo plazo no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-pro
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Pagina del proyecto: https://openamer-max.github.io
- Geraetepass (compatibilidad por dispositivo): https://openamer-max.github.io/geraetepass/
- Codigo fuente: https://github.com/openamer-max/openamer
- Demo en el navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traduccion (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Banco de pruebas (45 casos): https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Registro en Ollama: https://ollama.com/amersacirovic/openamer-max-pro
