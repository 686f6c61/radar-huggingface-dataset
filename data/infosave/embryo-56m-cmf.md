# infosave/Embryo-56M-cmf

## Resumen

Embryo-56M es un modelo de lenguaje de 55,9 millones de parámetros desarrollado por infosave (Oleg Kirichenko) y entrenado desde cero en una única GPU de portátil (Apple M4), sin reutilizar pesos de terceros. Emplea una arquitectura propia implementada en el runtime `cortiq` y un formato de fichero propietario (`.cmf`) que empaqueta los pesos cuantizados junto con una base de registros factuales: 4.265 fichas de plantas medicinales y 663 tarjetas sobre países, elementos químicos, ciencia, informática, historia, libros y guías prácticas.

La propuesta técnica no es competir en capacidad generativa, sino separar el conocimiento factual de la red neuronal mediante un mecanismo de enrutamiento por resonancia: cada registro ocupa un subespacio aislado de estados ocultos y una consulta se dirige al registro con menor error de reconstrucción, sin clasificador ni reglas de palabras clave. Las respuestas factuales son literales del registro; cuando la pregunta queda fuera de la base, el modelo responde con una negativa explícita en lugar de improvisar.

Es relevante como experimento de arquitectura: atención de memoria constante (sin KV cache que crezca con el contexto), enrutamiento de expertos FFN por token y un formato de ejecución unificado que permite añadir registros sin modificar los pesos. El modelo conversa en inglés y ruso con respuestas cortas y gramaticales, pero deliberadamente débil fuera de sus registros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con attention de memoria constante (gated delta mixers y dos anclas acotadas), enrutamiento por resonancia y expertos FFN por token |
| Parametros totales | 55,9 M |
| Parametros activos | 34,7 M por token |
| Longitud de contexto | No disponible (el estado por secuencia es constante: 10,1 MB independientemente de la longitud) |
| Tipos de cuantizacion | q8_2f (formato propio del runtime cortiq) |
| Idiomas soportados | Ingles y ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cmf` (contenedor propio de cortiq; incluye pesos y registros factuales) |

## Arquitectura y entrenamiento

La arquitectura combina tres mecanismos patentados (solicitudes de patente estadounidenses 19/452.440, 19/731.402 y 19/738.763). El enrutamiento por resonancia trata cada registro como un subespacio aislado de estados ocultos: la consulta se asigna al registro con el menor error de reconstrucción, medido sobre los tokens del nombre de la entidad preguntada y el resto del mensaje. El mismo principio selecciona un experto FFN por token. La atención de memoria constante usa gated delta mixers y dos anclas acotadas, de modo que el estado no crece con el contexto y no hay KV cache que desalojar. La ejecución unificada permite añadir registros al contenedor sin modificar un solo byte del backbone compartido.

El entrenamiento se ejecutó en la GPU del M4 con kernels Metal propios, en dos fases: primero texto crudo y después chat con respuestas enmascaradas y replay de texto crudo. Los datos incluyen FineWeb-edu, FineWeb-2, corpus de código y matemáticas, SmolTalk, OASST2 y GrandMaster-PRO-MAX (cuyas respuestas fueron generadas por GPT-4-Turbo). Las fichas de plantas provienen de una referencia herbal propia del autor. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Conversación corta y gramatical en inglés y ruso, con calidad limitada por el tamaño del modelo.
- Respuesta factual literal desde registros internos: 4.265 fichas de plantas medicinales y 663 tarjetas sobre países, elementos químicos, ciencia, informática, historia, libros y guías prácticas.
- Negativa explícita ("I don't know") ante preguntas factuales fuera de los registros, con indicación de los temas cubiertos.
- Seguimiento de preguntas de continuación sobre una entidad ya mencionada, mediante subespacios de resonancia dedicados.
- Enrutamiento determinista e inspeccionable: el campo `x_cortiq_route` de la API y la última línea de `cortiq run` indican qué registro respondió.
- Servidor compatible con la API de OpenAI (`cortiq serve`).
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Consulta de fitoterapia con trazabilidad: desplegar el modelo como servicio interno que responde sobre las 4.265 plantas medicinales devolviendo texto literal del registro, útil en herramientas de consulta donde se exige que la respuesta no se parafrasee ni se invente.
- Base de datos conversacional de países y datos básicos: preguntas sobre capitales, moneda e idioma oficial respondidas desde las 663 tarjetas, con la ventaja de que el estado por secuencia es constante (10,1 MB) y el coste de memoria no crece con el histórico de la conversación.
- Asistente educativo de bajo consumo: al ejecutarse en CPU a unas 470 tok/s en un M4 y ocupar 91 MB en disco, puede embeberse en aplicaciones de escritorio o dispositivos con recursos limitados para responder preguntas de ciencia, historia o informática.
- Demostración e investigación de enrutamiento por resonancia: el modelo sirve como banco de pruebas reproducible de atención de memoria constante y selección de expertos por error de reconstrucción, con métricas publicadas de recuperación de palabras clave (62 % a 128 tokens, 47 % a 1.800 tokens con K = 4).
- Filtro de abstención en pipelines RAG: usar la negativa calibrada del modelo (38 de 44 preguntas fuera de registros rechazadas) como capa que detecta consultas sin cobertura factual antes de derivarlas a un modelo mayor.
- Servicio compatible con OpenAI en prototipos: `cortiq serve` expone una API compatible que permite sustituir un endpoint existente en pruebas de integración sin adaptar el cliente, con un consumo de VRAM mínimo.
- Chat multilingüe básico inglés-ruso: para respuestas cortas en escenarios de atención al cliente de baja complejidad donde la latencia importa más que la profundidad (hasta 925 tok/s en una RTX 2000 Ada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas propias de evaluación:

| Metrica | Resultado |
|---|---|
| Preguntas simples sobre plantas, formulación no vista en el ajuste | 155 de 180 |
| Hechos de plantas, preguntas reservadas | 218 de 223 |
| Continuaciones sobre una planta en lenguaje llano, formulación no vista | 900 de 1.200 |
| Mensajes no relacionados tomados como continuación (falsos positivos) | 41 de 1.380 |
| Preguntas factuales fuera de los registros, rechazadas | 38 de 44 |
| Peticiones ordinarias rechazadas por error | 1 de 40 |
| Preguntas sobre entidades del mundo excluidas del ajuste | 367 de 445 |
| Prompts generales respondidos desde un registro | 86 de 1.444 |
| Prompts generales rechazados | 243 de 1.444 |
| Recuerdo de palabra clave, K = 4, distancia 128 / 512 / 1.024 / 1.800 tokens | 62 / 70 / 56 / 47 % |

Rendimiento de decodificación medido por el autor:

| Plataforma | tok/s (decodificación) | tok/s tras prompt de 2.000 tokens |
|---|---|---|
| Apple M4 GPU | ~650 | 535 |
| Apple M4 CPU | ~470 | 379 |
| NVIDIA RTX 2000 Ada | 925 | 796 |
| EPYC 7443P (CPU) | 612 | 405 |

En una ejecución continua de 3.000 tokens en el M4: 389 tok/s en GPU y 398 tok/s en CPU (la GPU se ralentiza tras varios segundos de trabajo sostenido).

## Requisitos de hardware

- VRAM estimada: mínima; el fichero completo ocupa 91 MB y el estado por secuencia es de 10,1 MB constante, por lo que cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de un Apple M4.
- GPU recomendadas: RTX 2000 Ada (925 tok/s medidos), Apple M4 (650 tok/s en GPU). Cualquier GPU con soporte Metal o CUDA del runtime cortiq es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo actual; también funciona íntegramente en CPU a velocidades superiores a 400 tok/s.
- Opciones de despliegue: runtime `cortiq` (CLI y servidor con API compatible con OpenAI). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.cmf`.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento se degrada moderadamente con prompts largos (535 frente a 650 tok/s en M4 GPU tras 2.000 tokens) y en ejecuciones sostenidas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Embryo-56M | 55,9 M (34,7 M activos) | No disponible (estado constante de 10,1 MB) | en, ru | Apache-2.0 | `.cmf` (cortiq) |
| SmolLM2-135M | 135 M | 8.192 tokens | en (principalmente) | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | multilingüe (29 idiomas) | Apache-2.0 | safetensors, GGUF |
| Gemma 3 270M | 270 M | 32.768 tokens | multilingüe | Gemma Terms of Use | safetensors, GGUF |

La comparación directa es limitada: Embryo-56M no persigue rendimiento generativo general, sino respuestas factuales verbatim desde registros internos con abstención calibrada, algo que los modelos de la tabla no ofrecen de serie. A cambio, su formato propietario restringe el ecosistema de herramientas y no se han publicado resultados en benchmarks estándar que permitan situarlo frente a SmolLM2 o Qwen2.5 en tareas de lenguaje general.

## Limitaciones y advertencias

- Fuera de los registros, las respuestas proceden de una red muy pequeña: gramaticales y cortas, pero a menudo vacías o genéricas (véase el ejemplo del dragón en la model card).
- Riesgo de enrutamiento erróneo: 86 de 1.444 prompts generales se respondieron desde un registro, y aproximadamente una quinta parte de esos casos fue una tarjeta correcta que no respondía a la pregunta.
- No debe usarse para decisiones médicas: las fichas de plantas describen uso tradicional y evidencia, no constituyen consejo clínico.
- Cobertura factual cerrada: cualquier entidad fuera de las 4.265 plantas y 663 tarjetas queda sin respuesta útil; 78 de 445 preguntas sobre entidades excluidas del ajuste no se resolvieron correctamente.
- Recuerdo limitado en contextos largos: la recuperación de una palabra clave cae del 62 % a 128 tokens al 47 % a 1.800 tokens.
- Solo inglés y ruso; no hay soporte documentado de otros idiomas.
- Formato y runtime propietarios (`.cmf`, `cortiq`): dependencia de una única implementación, con requisito de cortiq 0.8.53 o superior y sin integración con vLLM, llama.cpp u Ollama.
- Licencia Apache-2.0 permite uso comercial, pero existen solicitudes de patente estadounidenses en trámite sobre los mecanismos de enrutamiento, ejecución unificada y atención; conviene revisar posibles reclamaciones de propiedad intelectual antes de un despliegue comercial a gran escala.
- No se documentan sesgos específicos ni evaluación de seguridad; el tamaño del modelo y la ausencia de RLHF declarado limitan la robustez ante entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Embryo-56M-cmf
- Demo (Space): https://huggingface.co/spaces/infosave/embryo-56m
- Repositorio y CLI cortiq: instalación mediante `cargo install cortiq-cli --features gpu`
- Solicitudes de patente citadas: USPTO 19/452.440 (resonance routing), 19/731.402 (unified execution), 19/738.763 (constant-memory attention)
