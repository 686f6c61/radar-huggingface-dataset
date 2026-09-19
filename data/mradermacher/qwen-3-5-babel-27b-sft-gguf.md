# mradermacher/qwen-3.5-babel-27b-sft-GGUF

## Resumen

`mradermacher/qwen-3.5-babel-27b-sft-GGUF` es una colección de cuantizaciones GGUF del modelo `theostos/qwen-3.5-babel-27b-sft`, un ajuste supervisado (SFT) orientado a métodos formales y demostración automática de teoremas en Lean y Rocq (Coq). El repositorio lo publica mradermacher, un cuantizador conocido dentro del ecosistema llama.cpp, y no introduce ningún entrenamiento adicional: su función es convertir los pesos originales en formatos de baja precisión manejables en hardware de consumo.

El modelo original tiene 26.895.998.464 parámetros (unos 26,9 mil millones) y se distribuye bajo licencia Apache 2.0, con soporte declarado únicamente para inglés. La información publicada no detalla la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe hacerse por cuenta del usuario.

Su relevancia práctica es doble: por un lado, ofrece una vía para ejecutar localmente un modelo de 27B especializado en verificación formal sin depender de APIs; por otro, el repositorio incluye once variantes de cuantización que van de 10,8 GB (Q2_K) a 28,7 GB (Q8_0), lo que permite ajustar el equilibrio entre memoria, latencia y fidelidad de los pesos. El contrapunto es que el modelo apenas tiene tracción en el momento de redactar esta ficha (0 descargas y 0 likes registrados).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; el identificador y las etiquetas indican que deriva de la familia Qwen 3.5 de 27B) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No aplicable / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (además de x-f16 entre los cuantos generados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería declarada: transformers; compatible con llama.cpp) |
| Autor de la cuantización | mradermacher |
| Modelo base | theostos/qwen-3.5-babel-27b-sft |
| Tamaño del repositorio | 186,3 GB |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |
| Especialización declarada | Métodos formales, demostración de teoremas, Lean, Rocq, SFT |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta información sobre la arquitectura del modelo subyacente: no se indica si se trata de un transformer denso, de una mezcla de expertos (MoE) o de una arquitectura híbrida, ni se detallan mecanismos de atención, estrategias de decodificación o innovaciones técnicas. Lo único confirmable es el número de parámetros (26.895.998.464) y que la librería declarada en los metadatos es `transformers`. Por el nombre y las etiquetas (`qwen3.5`, `supervised-fine-tuning`) cabe inferir que el punto de partida es un modelo de la familia Qwen 3.5, pero se trata de una inferencia, no de un dato confirmado.

En cuanto al entrenamiento, el repositorio describe el modelo base como un ajuste supervisado (SFT) sobre el modelo `theostos/qwen-3.5-babel-27b-sft`, cuyas etiquetas lo asocian a métodos formales, demostración de teoremas, Lean y Rocq. No se publica el número de tokens de entrenamiento, la composición del dataset, si hubo fases posteriores de RLHF o DPO, ni el procedimiento de evaluación. Tampoco se documentan innovaciones técnicas específicas más allá de la propia especialización temática.

Es importante subrayar que este repositorio concreto no entrena nada: aplica cuantización estática (nivel de cuantización 2 del pipeline del autor) con `output_tensor_quantised: 1` y conversión de tipo `hf`. En el momento de la publicación no había cuantizaciones ponderadas con imatrix disponibles.

## Capacidades

- Generación de texto conversacional en inglés, con el modo `conversational` declarado en los metadatos.
- Demostración de teoremas y asistencia en métodos formales, según las etiquetas `theorem-proving` y `formal-methods`.
- Trabajo con el asistente de pruebas Lean, etiqueta explícita del modelo.
- Trabajo con Rocq (anteriormente Coq), etiqueta explícita del modelo.
- Escritura y completado de scripts de prueba, tácticas y lemas auxiliares en el contexto de pruebas formales (capacidad inferida de la especialización declarada, no verificada con benchmarks).
- Ajuste supervisado sobre el modelo base, lo que sugiere capacidad de seguir instrucciones en formato conversacional.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declara ningún otro idioma.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles en la información publicada.

## Casos de uso

- Formalización de teoremas matemáticos en Lean: el modelo puede recibir un enunciado en lenguaje natural o en notación matemática y producir un esqueleto de declaración (`theorem`, `lemma`) con hipótesis y objetivo, que el usuario compila y refina de forma iterativa.
- Asistencia en pruebas sobre Rocq/Coq: generación de tácticas y estructuras de prueba para desarrollo de librerías verificadas, aprovechando que el modelo se distribuye específicamente etiquetado para Rocq.
- Revisión de pruebas existentes en un repositorio: integrado como paso de revisión asistida en un pipeline de CI, el modelo puede proponer correcciones cuando una prueba deja de compilar tras una actualización de la librería de base.
- Generación de lemas auxiliares: dado un objetivo complejo, el modelo puede descomponerlo en subobjetivos intermedios que el probador humano valida después, reduciendo el trabajo de búsqueda manual.
- Docencia de métodos formales: uso como tutor interactivo que explica paso a paso por qué una táctica es aplicable, con la ventaja de poder ejecutarse completamente en local sin enviar material docente a servicios externos.
- Procesamiento por lotes en infraestructura propia: con las cuantizaciones Q4_K_S o Q4_K_M (15,7 y 16,6 GB) se pueden lanzar trabajos masivos de generación de borradores de pruebas durante la noche sobre una única GPU de 24 GB.
- Prototipado de verificación de software crítico: generación de invariantes y precondiciones/postcondiciones para funciones escritas en lenguajes con soporte de verificación deductiva, siempre con validación humana posterior.
- Migración entre asistentes de pruebas: uso del modelo para traducir desarrollos o fragmentos de Rocq a Lean (o a la inversa), aprovechando que está etiquetado para ambos sistemas.
- Entornos sin conectividad: al ser GGUF, el modelo puede ejecutarse en máquinas aisladas (air-gapped) mediante llama.cpp, algo relevante en entornos de investigación con restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K, MiniF2F, ProofNet ni de ningún otro conjunto de evaluación, y tampoco se documenta una comparación con el modelo base sin cuantizar. El autor sí enlaza un gráfico externo de ikawrakow sobre perplejidad relativa de distintos tipos de cuantización (véase la sección de enlaces), pero se trata de una referencia genérica sobre cuantización, no de una evaluación de este modelo concreto.

## Requisitos de hardware

Tamaños reales de fichero por variante (datos del repositorio):

| Cuantización | Tamaño (GB) | Notas del autor |
|---|---|---|
| Q2_K | 10,8 | — |
| Q3_K_S | 12,2 | — |
| Q3_K_M | 13,4 | calidad inferior |
| Q3_K_L | 14,4 | — |
| IQ4_XS | 15,3 | — |
| Q4_K_S | 15,7 | rápido, recomendado |
| Q4_K_M | 16,6 | rápido, recomendado |
| Q5_K_S | 18,8 | — |
| Q5_K_M | 19,3 | — |
| Q6_K | 22,2 | muy buena calidad |
| Q8_0 | 28,7 | rápido, mejor calidad |

- VRAM estimada para inferencia: hay que sumar al tamaño del fichero la caché KV, que depende del contexto configurado y del número de capas; con contexto corto, Q4_K_M requiere aproximadamente 17-20 GB y Q8_0 alrededor de 30-33 GB. Estas cifras son estimaciones derivadas del tamaño de los pesos, no datos publicados por el autor.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_S, Q4_K_M e IQ4_XS con contexto moderado; A100 40 GB para Q6_K o Q8_0 con contexto amplio; A100 80 GB o H100 80 GB para Q8_0 con ventanas de contexto grandes o varios servicios concurrentes.
- ¿Cabe en GPU de consumo? Sí, en el rango de 24 GB con cuantizaciones de 4 bits (Q4_K_S, Q4_K_M, IQ4_XS) e incluso Q5_K_S/Q5_K_M si se limita el contexto. Las variantes Q2_K y Q3_K_S caben en GPUs de 12-16 GB, a costa de una degradación de calidad que el propio autor señala para Q3_K_M.
- Despliegue en CPU/RAM: con llama.cpp u Ollama es posible descargar capas a memoria del sistema; Q8_0 necesita del orden de 30 GB de RAM libre si no hay GPU suficiente.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa por el formato GGUF; vLLM y TGI no consumen GGUF directamente, por lo que requerirían el modelo base en safetensors; también es posible usar el servidor `llama-server` para exponer una API compatible con OpenAI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables dentro de la información proporcionada. Categorías equivalentes que el lector puede considerar como alternativas son los modelos especializados en demostración formal (por ejemplo, la familia DeepSeek-Prover o Goedel-Prover) y los ajustes de la familia Qwen orientados a matemáticas y código, pero no se han facilitado sus fichas técnicas, licencias ni resultados de benchmarks, por lo que no es posible construir una tabla comparativa rigurosa sin inventar cifras.

| Aspecto | Este modelo (GGUF) | Alternativas especializadas en pruebas formales | Ajustes generalistas tipo Qwen 27B |
|---|---|---|---|
| Parámetros | 26,9 B | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Rendimiento en benchmarks | No disponible | No disponible | No disponible |
| Licencia | Apache 2.0 | No disponible | No disponible |
| Disponibilidad | GGUF en HuggingFace (11 variantes) | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés. No hay evidencia de soporte para castellano ni para otros idiomas, por lo que prompts en español pueden degradar la calidad de forma significativa.
- Riesgo de alucinación en pruebas formales: un modelo generativo puede producir tácticas inexistentes, lemas inventados o pasos que no compilan. Toda salida debe pasar por el comprobador (Lean o Rocq) antes de considerarse válida.
- Ausencia total de benchmarks: no hay datos que permitan estimar la tasa de éxito en MiniF2F, ProofNet u otros conjuntos habituales, ni comparar con el modelo base sin cuantizar.
- Ausencia de datos de entrenamiento: se desconoce el dataset, el número de tokens y si hubo fases de alineación, lo que dificulta evaluar sesgos o cobertura temática.
- Efecto de la cuantización: las variantes por debajo de Q4 pueden degradar notablemente la precisión en tareas de razonamiento simbólico, donde un único token incorrecto invalida la prueba completa. El autor marca Q3_K_M como "lower quality".
- Tracción nula: el repositorio registra 0 descargas y 0 likes, sin discusiones ni validación por parte de la comunidad. No hay garantía de mantenimiento ni de soporte.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los términos del modelo base `theostos/qwen-3.5-babel-27b-sft` antes de un despliegue en producción, ya que las condiciones de la familia Qwen pueden imponer requisitos adicionales.
- Repositorio pesado: 186,3 GB en total. Descargar el conjunto completo no es viable en muchos entornos; conviene seleccionar un único fichero GGUF.
- Cuantizaciones ponderadas: el autor advierte de que las variantes con imatrix no estaban disponibles en el momento de la publicación, lo que puede afectar a la calidad relativa de los cuantos de 2 y 3 bits.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen-3.5-babel-27b-sft-GGUF
- Modelo base: https://huggingface.co/theostos/qwen-3.5-babel-27b-sft
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#qwen-3.5-babel-27b-sft-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente páginas de Walmart (tiendas, empleo y fotografía), sin relación alguna con el modelo.
