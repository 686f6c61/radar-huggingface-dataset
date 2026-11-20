# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q4_K_M

## Resumen

Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q4_K_M es una cuantización en formato GGUF (Q4_K_M) del modelo Qwen2.5-Coder-14B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. La publicación corre a cargo del usuario sigmanih a través de su herramienta Sigma Studio, que actúa como pipeline de conversión y empaquetado. El modelo base es un transformer causal especializado en generación de código y texto, con 14.770.033.664 parámetros totales y una ventana de contexto declarada de 32.768 tokens.

El propósito de esta versión es facilitar el despliegue local del modelo base en hardware de consumo mediante cuantización de 4 bits, reduciendo el peso a aproximadamente 9 GB de repositorio y permitiendo inferencia con unos 12,4 GB de VRAM en offload completo a GPU o unos 11,5 GB de RAM en modo CPU/híbrido. Está orientado a tareas de generación de código, asistentes conversacionales y bucles agénticos con tool calling.

La relevancia de esta ficha radica en que se trata de una republicación de terceros, no de una versión oficial de Qwen: la licencia aparece como "other", los idiomas declarados son inglés e italiano, y los benchmarks publicados proceden de una evaluación propia del autor sobre subconjuntos reducidos de los datasets, por lo que no son directamente comparables con resultados de suite completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only), modelo base Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según model card del autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (esta publicación); otras cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | en, it (según metadatos del autor); idiomas del modelo base no detallados aquí |
| Licencia | other (el badge de la model card menciona Apache-2.0, lo que genera ambigüedad; consultar la licencia del modelo base Qwen2.5-Coder-14B-Instruct) |
| Formato de pesos | GGUF (la model card indica "Sconosciuto/sconosciuta" en el campo de formato, dato inconsistente) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-14B-Instruct, un transformer decoder-only de tipo causal con 14.770.033.664 parámetros. Esta publicación concreta no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base; esos datos corresponden a la documentación oficial de Qwen y no se incluyen en la información proporcionada. La model card del autor tampoco describe innovaciones técnicas del modelo original.

Lo que sí documenta el autor es el proceso de publicación: conversión a GGUF Q4_K_M mediante el módulo Model Hub de Sigma Studio, con un motor de inferencia propio denominado SigmaEngine. La model card incluye además una evaluación empírica en un sandbox ("Sandbox Jail") para medir adherencia a protocolos de tool calling y contención de acciones en un sistema de ficheros aislado, con resultados de 77,2 % de adherencia al protocolo de herramientas y 37,5 % de completitud autónoma de tareas en 8 escenarios.

## Capacidades

- Generación de texto y código: el modelo base está especializado en programación; la evaluación del autor reporta 86 % en HumanEval (6/7) y 89 % en MBPP (8/9) sobre subconjuntos reducidos.
- Razonamiento matemático: 100 % en GSM8K (9/9) y 89 % en MATH (8/9) según la misma evaluación parcial.
- Razonamiento de sentido común y científico: 100 % en ARC-Challenge (9/9), 67 % en HellaSwag (6/9).
- Tool calling / function calling: la model card documenta un benchmark específico de protocolo de herramientas con 77,2 % de adherencia (71/92 criterios verificados).
- Uso agéntico multi-paso: evaluación en sandbox con 90 turnos y 353,7 s de ejecución, con 100 % de cumplimiento de contención en el espacio de trabajo.
- Modo de razonamiento comparado: la model card distingue "No-Thinking" (respuesta directa, 70,2 % de acierto en 40/57) frente a "Deep Thinking" (cadena de pensamiento, 65,1 % en 28/43), con un delta de -5,1 % a favor del modo directo en su evaluación.
- Capacidades multilingües: declaradas en inglés e italiano; no se detalla cobertura adicional.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo puede autocompletar y generar funciones en Python y otros lenguajes sobre una ventana de 32.768 tokens, lo que permite incluir varios ficheros de contexto en un mismo prompt. La cuantización Q4_K_M lo hace viable en una RTX 4070 con 12 GB de VRAM.
- Integración en IDE o CLI de desarrollo: con 14B parámetros y formato GGUF, se puede servir mediante llama.cpp u Ollama en la máquina del desarrollador, con latencia baja al evitar llamadas a API externas.
- Automatización de tareas agénticas sobre repositorios: la model card reporta adherencia del 77,2 % al protocolo de herramientas y contención del 100 % en sandbox, lo que lo hace adecuado para prototipos de agentes que manipulan ficheros en entornos aislados, siempre con supervisión.
- Generación de tests unitarios: los resultados de MBPP (89 % en 8/9) y HumanEval (86 % en 6/7) sugieren capacidad para producir código con pruebas asociadas, útil en pipelines de CI para generar casos de test a partir de especificaciones.
- Tutoría y resolución de problemas matemáticos: con 100 % en GSM8K y 89 % en MATH en la evaluación parcial, puede emplearse en asistentes educativos que resuelven problemas paso a paso, activando el modo de cadena de pensamiento cuando la tarea lo requiera.
- Prototipado de asistentes conversacionales multilingües (inglés/italiano): el modelo declara soporte para ambos idiomas, adecuado para demos y entornos de prueba donde no se requiera cobertura de castellano.
- Evaluación comparativa de modos de razonamiento: útil en investigación para medir el coste/beneficio de CoT frente a respuesta directa, dado que el autor publica ambos perfiles con latencias y tasas de acierto.

## Benchmarks y rendimiento

Los datos siguientes proceden de la evaluación propia del autor en Sigma Studio Training Lab (temperatura 0,0, semilla 42) y están medidos sobre subconjuntos reducidos de cada dataset, no sobre la suite completa. Por tanto, no son comparables con resultados de evaluación completa.

| Benchmark | Aciertos / total | Precision | Estado declarado |
|---|---|---|---|
| ARC-Challenge | 9 / 9 | 100 % | Passed |
| BIG-Bench Hard | 4 / 7 | 57 % | Fair |
| GPQA | 2 / 9 | 22 % | Low |
| GSM8K | 9 / 9 | 100 % | Passed |
| HellaSwag | 6 / 9 | 67 % | Fair |
| HumanEval | 6 / 7 | 86 % | Passed |
| MATH | 8 / 9 | 89 % | Passed |
| MBPP | 8 / 9 | 89 % | Passed |
| MMLU | 5 / 14 | 36 % | Low |
| MMLU-Pro | 5 / 9 | 56 % | Fair |
| TruthfulQA | 6 / 9 | 67 % | Fair |
| Total agregado | 68 / 100 | 68 % | — |

Comparativa de modos de razonamiento declarada por el autor:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 70,2 % | 40 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 65,1 % | 28 / 43 | Traza de razonamiento multi-paso, delta de -5,1 % |

Benchmark de protocolo agéntico (Sandbox Jail):

| Metrica | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 77,2 % (71/92 criterios) |
| Completitud autónoma de tareas | 37,5 % (3/8 escenarios) |
| Contención en sandbox | 100 % (cero intentos de escape) |
| Eficiencia de ejecución | 90 turnos, 353,7 s |

No se han publicado en la información disponible resultados de benchmarks oficiales del modelo base Qwen2.5-Coder-14B-Instruct.

## Requisitos de hardware

- VRAM estimada: unos 12,4 GB para offload completo a GPU con cuantización Q4_K_M; unos 11,5 GB de RAM en modo CPU o híbrido.
- GPU recomendadas por el autor: GPU con 12-16 GB de VRAM, por ejemplo RTX 3060 o RTX 4070, o un sistema con 32 GB de RAM.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080, RTX 4090). En GPUs de 8 GB requeriría offload parcial a CPU.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros runners GGUF; el autor promociona su propio motor SigmaEngine. No se documenta soporte explícito de vLLM o TGI para esta publicación (vLLM y TGI trabajan habitualmente con pesos safetensors, no GGUF).
- Latencia y throughput: no se publican cifras de tokens por segundo. La model card solo indica un tiempo total de 353,7 s para 90 turnos en el benchmark agéntico, sin desglose por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q4_K_M (esta ficha) | 14,77 B | 32.768 | GGUF Q4_K_M | other (badge Apache-2.0, ambiguo) | Hugging Face, 1.154 descargas |
| Qwen/Qwen2.5-Coder-14B-Instruct (original) | 14,77 B | no detallado en esta informacion | safetensors | no detallado en esta informacion | Hugging Face (modelo base) |
| Otras cuantizaciones GGUF del mismo modelo base | 14,77 B | no disponible | GGUF (varios niveles) | según publicador | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks oficiales ni de especificaciones de modelos alternativos de la misma categoría (por ejemplo, otros code models de 13-15B) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los benchmarks publicados están medidos sobre subconjuntos reducidos (entre 7 y 14 preguntas por dataset) y el propio autor advierte que no son comparables con ejecuciones de suite completa. El agregado de 68 % no debe interpretarse como rendimiento global del modelo.
- Resultados bajos en MMLU (36 %, 5/14) y GPQA (22 %, 2/9) en la evaluación del autor: conocimiento general y razonamiento académico avanzado limitados según esa medición.
- El modo de cadena de pensamiento rindió peor que la respuesta directa en la evaluación del autor (-5,1 %), lo que cuestiona el beneficio de CoT en este modelo para las tareas evaluadas.
- Completitud autónoma agéntica baja: solo 3 de 8 escenarios completados correctamente, pese a la buena adherencia al protocolo de herramientas (77,2 %). No es fiable para agentes autónomos sin supervisión.
- Licencia ambigua: los metadatos indican "other" mientras el badge de la model card muestra Apache-2.0. Antes de uso comercial debe verificarse la licencia del modelo base Qwen2.5-Coder-14B-Instruct, que prevalece sobre la republicación.
- Idiomas declarados limitados a inglés e italiano; no se garantiza calidad en castellano ni en otros idiomas.
- Es una republicación de terceros: no hay garantía de que la cuantización preserve fielmente el comportamiento del modelo original, ni de mantenimiento o soporte por parte del autor.
- Riesgo de alucinación inherente a los modelos de lenguaje; TruthfulQA al 67 % (6/9) en la evaluación parcial sugiere margen de mejora en factualidad.
- La model card contiene campos inconsistentes (formato de pesos "Sconosciuto", tamaño en disco "0.0 GB"), lo que reduce la fiabilidad documental de la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
