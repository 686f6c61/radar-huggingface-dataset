# sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q4_K_M

## Resumen

ornith-ai-Ornith-1.0-35B-GGUF-Q4_K_M es una cuantizacion en formato GGUF (variante Q4_K_M) del modelo Ornith-1.0-35B, publicado por el usuario sigmanih mediante el modulo Model Hub de Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF de los pesos de ornith-ai/Ornith-1.0-35B, pensada para inferencia local con llama.cpp y motores compatibles. El repositorio pesa 21,2 GB y declara 34.660.610.688 parametros (34,66B) en los safetensors del modelo base.

Segun la model card, la arquitectura es CausalLM con 35B de parametros activos y una ventana de contexto de 32.768 tokens. Los idiomas declarados son ingles e italiano. El modelo se presenta como una opcion de "inteligencia frontier" para investigacion profunda y matematicas multi-paso, con cifras de benchmark reportadas por el propio publicador y evaluadas con SigmaEngine sobre GPU (temperatura 0,0, semilla 42, hash de reproducibilidad SHA256-96993ED8BBA7D619).

Su relevancia practica es limitada pero concreta: permite ejecutar un modelo denso de ~35B en cuantizacion 4 bits sobre hardware de gama alta para consumidor o estaciones de trabajo con doble GPU de 24 GB. Ahora bien, la informacion publicada sobre el modelo base es escasa (no se detallan datos de entrenamiento ni arquitectura interna), la licencia presenta una contradiccion entre metadatos y model card, y las puntuaciones de benchmark se han medido sobre subconjuntos parciales, por lo que no son comparables con ejecuciones de suite completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (segun la model card); detalles internos (numero de capas, tipo de atencion, GQA, etc.) no disponibles |
| Parametros totales | 34.660.610.688 (34,66B) segun safetensors; la model card declara 35B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (esta publicacion). No constan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | ingles (en) e italiano (it) |
| Licencia | "other" en los metadatos de HuggingFace; la model card muestra una insignia Apache-2.0 (contradiccion no resuelta) |
| Formato de pesos | GGUF (Q4_K_M). La model card indica "Sconosciuto" en el campo de formato |
| Modelo base | ornith-ai/Ornith-1.0-35B |
| Repositorio | sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q4_K_M |
| Tamano del repositorio | 21,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 323 descargas / 1 like |
| Fechas | creado el 2026-09-08, actualizado el 2026-10-12 (segun metadatos de HuggingFace) |
| Compatibilidad | endpoints_compatible; sin detalle adicional |
| VRAM declarada por el autor | ~30,2 GB (offload completo en GPU) / ~28,3 GB RAM en modo CPU o hibrido |

## Arquitectura y entrenamiento

La unica informacion disponible sobre arquitectura es la etiqueta "CausalLM" de la model card, coherente con un transformer decoder-only autorregresivo. No se especifica numero de capas, dimension del modelo, cabezas de atencion, uso de GQA/MQA, tipo de tokenizador ni vocabulario. Tampoco hay datos sobre el entrenamiento del modelo base: se desconoce el volumen de tokens, la composicion del dataset, si hubo fases de ajuste fino supervisado, RLHF o DPO, y si existe una variante instruct o chat diferenciada.

Lo unico verificable tecnicamente es el proceso de cuantizacion: conversion a GGUF en la variante Q4_K_M (aproximadamente 4,8 bits por peso en promedio), que produce un repositorio de 21,2 GB. Existe una discrepancia relevante: la model card indica ~30,2 GB de VRAM para offload completo en GPU, una cifra incoherente con el tamano real del repositorio (21,2 GB) y con lo esperable en Q4_K_M para ~34,7B parametros; es probable que esa cifra provenga de una plantilla generica de Sigma Studio y no de una medicion del artefacto. En la misma linea, la model card menciona un "Reasoning Mode" con cadena de pensamiento (Deep Thinking CoT) que no puede confirmarse como capacidad real del modelo base a partir de la documentacion del repositorio.

El publicador de esta cuantizacion es un tercero (sigmanih) distinto del autor del modelo base (ornith-ai), por lo que la fidelidad de la conversion no esta validada por el autor original.

## Capacidades

- Generacion de texto conversacional en ingles e italiano, con ventana de contexto de 32.768 tokens.
- Razonamiento de opcion multiple: la evaluacion reportada usa los modos letter_logprob y continuation_logprob, con 100% en ARC-Challenge (9/9) y 89% en TruthfulQA (9/9).
- Codigo en Python: 100% en HumanEval (7/7, pass@1) y 78% en MBPP (7/9) segun la evaluacion del publicador, sobre muestras muy reducidas.
- Matematicas: 89% en GSM8K (8/9) y 56% en MATH (5/9) en las mismas condiciones.
- Modo de razonamiento explicito (Deep Thinking CoT) segun la model card, con una traza de razonamiento multi-paso; el propio autor reporta que rinde peor que la respuesta directa (-22,0 puntos porcentuales) sobre 43 preguntas.
- Llamada a herramientas: la model card reporta un 78,3% de adherencia al protocolo de herramientas en un entorno sandbox, con la afirmacion de que no se generan funciones alucinadas.
- Capacidades agenticas: la model card declara 0,0% de finalizacion autonoma de tareas (0/1 escenarios completados), por lo que el soporte de agentes multi-paso no esta demostrado.
- Multilingue: limitado a en e it; no se declara soporte de castellano.
- Vision, audio y modalidades adicionales: no disponibles.

## Casos de uso

- Asistente conversacional local en ingles o italiano: con 32.768 tokens de contexto y pesos GGUF de 21,2 GB, se puede desplegar en una estacion de trabajo con dos GPU de 24 GB y mantener conversaciones multi-turno con documentos extensos en memoria, sin depender de servicios en la nube.
- Generacion de codigo Python en entornos de desarrollo integrado: los resultados reportados (HumanEval 7/7, MBPP 7/9) sugieren utilidad en autocompletado y generacion de funciones; conviene integrarlo con verificacion mediante tests, dado el tamano reducido de la muestra evaluada.
- Tutoria de matematicas de nivel escolar y preuniversitario: el 89% en GSM8K lo hace adecuado para resolver problemas multi-paso de aritmetica y algebra basica, siempre con supervision humana y comprobacion del resultado.
- Tuberias de razonamiento cientifico con seleccion de respuesta multiple: el uso de letter_logprob permite emplearlo como clasificador de opciones en cuestionarios tipo examen (100% en ARC-Challenge, 78% en HellaSwag), util para evaluacion automatizada de materiales educativos.
- Recuperacion aumentada (RAG) sobre documentacion tecnica interna: la ventana de 32k tokens admite inyectar varios fragmentos recuperados junto con el historial; requiere motores que soporten el contexto completo y un evaluador que mida fidelidad, dado el 33% en GPQA.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y no requerir conexion, encaja en organizaciones que procesan documentacion sensible en ingles o italiano sin salida a internet.
- Prototipado y evaluacion de cuantizaciones: sirve como banco de pruebas para medir la degradacion de Q4_K_M frente a los pesos originales en tareas de codigo y matematicas, siempre que se disponga del modelo base en safetensors.
- Moderacion de contenido factual en italiano: el 89% en TruthfulQA sobre 9 preguntas apunta a un comportamiento razonable frente a afirmaciones falsas comunes, aunque la muestra es demasiado pequena para usarlo como filtro de produccion sin una validacion propia.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del publicador. La propia ficha advierte de que las puntuaciones se han medido "sobre una porcion del dataset, no sobre la suite completa", por lo que no son comparables con ejecuciones completas de otros modelos. Protocolo declarado: code_execution, continuation_logprob, cot_generation y letter_logprob, con temperatura 0,0, semilla 42 y hash de reproducibilidad SHA256-96993ED8BBA7D619.

| Benchmark | Dominio | Correctas / total | Precision | Estado declarado |
|---|---|---|---|---|
| ARC-Challenge | Razonamiento cientifico escolar | 9 / 9 | 100% | Correcto |
| BIG-Bench Hard | Logica y tareas simbolicas | 6 / 7 | 86% | Correcto |
| GPQA | Razonamiento academico de posgrado | 3 / 9 | 33% | Bajo |
| GSM8K | Matematicas escolares multi-paso | 8 / 9 | 89% | Correcto |
| HellaSwag | Sentido comun y NLI situacional | 7 / 9 | 78% | Correcto |
| HumanEval | Codigo Python (pass@1) | 7 / 7 | 100% | Correcto |
| MATH | Matematicas de competicion | 5 / 9 | 56% | Aceptable |
| MBPP | Programacion Python con tests | 7 / 9 | 78% | Correcto |
| MMLU | Conocimiento general multi-materia | 9 / 14 | 64% | Aceptable |
| MMLU-Pro | Razonamiento multi-paso avanzado | 4 / 9 | 44% | Aceptable |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89% | Correcto |
| Total agregado | Todos los conjuntos evaluados | 73 / 100 | 73% | 73% de acierto |

Comparacion entre modos de ejecucion declarada por el autor:

| Modo | Precision | Preguntas superadas | Perfil declarado |
|---|---|---|---|
| Sin razonamiento (respuesta directa) | 82,5% | 47 / 57 | Latencia minima, sin tokens de razonamiento |
| Razonamiento CoT (Deep Thinking) | 60,5% | 26 / 43 | Traza multi-paso; -22,0 puntos porcentuales frente al modo directo |

Evaluacion agentica en sandbox declarada por el autor:

| Metrica | Resultado | Criterio declarado |
|---|---|---|
| Adherencia al protocolo de herramientas | 78,3% | 0/92 criterios analiticos verificados (dato contradictorio con el porcentaje) |
| Finalizacion autonoma de tareas | 0,0% | 0/1 escenarios completados con el archivo objetivo |
| Contencion en el sandbox | 100% conforme | Ningun intento de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Uso optimo del presupuesto de turnos y tokens |

No se han publicado resultados de benchmarks independientes ni comparativas verificadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos en disco: 21,2 GB (repositorio completo en Q4_K_M), segun el tamano del repositorio en HuggingFace.
- VRAM para offload completo: la model card declara ~30,2 GB; esta cifra no concuerda con los 21,2 GB de pesos, y a ella habria que anadir la cache KV (no calculable sin conocer el numero de capas, cabezas KV y dimension de cabeza). Estimacion orientativa a partir del tamano real de los pesos: en torno a 24-26 GB con contexto moderado, valor no confirmado por el autor.
- RAM para modo CPU o hibrido: la model card indica ~28,3 GB.
- Hardware recomendado por el autor: configuracion multi-GPU (2 x 24 GB o RTX 6000) o un sistema con 64 GB de RAM.
- Cabe en GPU de consumo: no en una unica GPU de 24 GB (RTX 3090/4090) si se busca offload completo segun las cifras declaradas; si cabria repartido entre dos GPU de 24 GB, o parcialmente con offload de capas a CPU usando RAM del sistema. En una GPU de 16 GB o menos, solo con offload parcial y degradacion notable de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp, llama-cpp-python y text-generation-webui son las rutas naturales para GGUF. vLLM y TGI priorizan safetensors, por lo que requieren conversion o soporte GGUF experimental.
- Latencia y throughput: no disponibles. La model card solo indica que el modo sin razonamiento tiene latencia minima y cero tokens de razonamiento, sin cifras de tokens por segundo ni tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks de modelos comparables en la informacion proporcionada, y las puntuaciones de este modelo se midieron sobre subconjuntos parciales (entre 7 y 14 preguntas por benchmark), por lo que cualquier comparacion numerica seria enganosa. Ademas, la informacion del modelo base es insuficiente para establecer equivalencias fiables de arquitectura, contexto o licencia.

Criterios que si pueden compararse a nivel estructural:

| Criterio | Ornith-1.0-35B Q4_K_M | Alternativas de ~30-35B densos en GGUF |
|---|---|---|
| Parametros | 34,66B | No disponible en la informacion proporcionada |
| Contexto | 32.768 tokens | No disponible en la informacion proporcionada |
| Licencia | "other" con insignia Apache-2.0 contradictoria | No disponible en la informacion proporcionada |
| Huella en disco Q4_K_M | 21,2 GB | No disponible en la informacion proporcionada |
| Benchmarks verificables | Solo datos del publicador, sobre subconjuntos | No disponible en la informacion proporcionada |

Familias que un lector puede considerar comparables por tamano y formato (Qwen2.5/Qwen3-32B, Llama-3.x-33B/34B, Mistral-Small, Yi-34B): deben consultarse en sus propias fichas, ya que en esta busqueda no se han recopilado sus especificaciones ni resultados.

## Limitaciones y advertencias

- Licencia ambigua: los metadatos de HuggingFace marcan "other" mientras que la model card luce una insignia Apache-2.0. Antes de cualquier uso comercial hay que aclarar la licencia del modelo base ornith-ai/Ornith-1.0-35B, que no se ha consultado aqui.
- Trazabilidad incompleta: no se documentan datos de entrenamiento, composicion del dataset, ni fases de alineacion (RLHF, DPO). No hay paper ni repositorio de entrenamiento enlazado.
- Cuantizacion de terceros: la conversion a GGUF la firma sigmanih, no el autor del modelo. No se aportan comparativas de perplejidad ni de degradacion frente a los pesos originales.
- Benchmarks no comparables: cada resultado se calcula sobre entre 7 y 14 preguntas. Un 100% en HumanEval con 7 preguntas no es equiparable a un 100% sobre las 164 del suite completo. Los propios autores advierten que no son comparables con ejecuciones completas.
- Inconsistencia interna en los datos: la adherencia al protocolo de herramientas se declara en 78,3% pero se acompana de "0/92 criterios analiticos verificados"; la eficiencia de ejecucion se declara como "0 turnos (0,0 s)", lo que sugiere una ejecucion no completada. La finalizacion autonoma de tareas es 0,0%.
- Razonamiento CoT contraproducente: el modo Deep Thinking obtiene 22 puntos menos que la respuesta directa en la evaluacion del autor, lo que cuestiona el uso de cadenas de pensamiento largas con este modelo.
- Riesgo de alucinacion: el 33% en GPQA y el 44% en MMLU-Pro indican un rendimiento bajo en conocimiento especializado y razonamiento avanzado; el 89% en TruthfulQA se midio sobre 9 preguntas. En produccion se requiere verificacion externa de los hechos.
- Sesgos: no hay ninguna evaluacion de sesgos, toxicidad o seguridad en la informacion disponible.
- Cobertura idiomatica limitada: solo ingles e italiano. No hay soporte declarado de castellano, por lo que no es adecuado para productos dirigidos al mercado hispanohablante sin una validacion previa propia.
- Adopcion muy baja: 323 descargas y 1 like. No existe comunidad que haya reportado problemas de calidad, lo que reduce la probabilidad de detectar fallos de conversion.
- Fechas no verificables: los metadatos indican fechas de 2026, posteriores a la fecha habitual de publicacion de este tipo de artefactos; conviene tratarlas con cautela.
- Incoherencia de hardware: la VRAM declarada (~30,2 GB) no concuerda con el tamano real de los pesos (21,2 GB), lo que sugiere que parte de la model card es texto de plantilla y no datos medidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/ornith-ai-Ornith-1.0-35B-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Perfil del publicador: https://huggingface.co/sigmanih
- Repositorio de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
