# sigmanih/XHToken-Spark-X2.5-4B-GGUF

## Resumen

XHToken-Spark-X2.5-4B-GGUF es la version cuantizada en formato GGUF (Q4_K_M) del modelo XHToken/Spark-X2.5-4B, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio (tambien conocida como SigmaEngine). Se trata de un modelo de generacion de texto conversacional de aproximadamente 4.112 millones de parametros, distribuido con un peso en disco de 2,42 GB y pensado para ejecutarse en hardware modesto: la propia model card indica que funciona con GPU de 6-8 GB de VRAM o con unos 3,9 GB de RAM en modo CPU/hibrido.

El modelo declara una arquitectura base denominada `spark2_5`, con 36 capas y una dimension oculta de 2560, y una ventana de contexto de 1.048.576 tokens. Soporta dos modos de inferencia: respuesta directa (No-Thinking) y razonamiento paso a paso (Deep Thinking CoT), ademas de un protocolo de tool calling evaluado por el autor. Los idiomas declarados son ingles (en) e italiano (it).

Su relevancia potencial reside en la combinacion de tamano reducido, cuantizacion de 4 bits y contexto declarado de un millon de tokens, orientada a agentes de voz en tiempo real y despliegue en dispositivos de borde. Sin embargo, el repositorio no tiene descargas ni valoraciones, no existe publicacion cientifica asociada y los benchmarks publicados se han medido sobre porciones muy pequenas de cada suite, por lo que las cifras deben interpretarse como preliminares y no comparables con evaluaciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (no se detalla si es transformer denso, MoE o hibrida); 36 capas, dimension oculta 2560 |
| Parametros totales | 4.112.079.360 (4,11 B), dato de safetensors |
| Parametros activos | No disponible. La model card indica "Active Parameters: 4B" sin especificar que la arquitectura sea MoE |
| Longitud de contexto | 1.048.576 tokens segun la model card (no verificado de forma independiente) |
| Tipos de cuantizacion | Repositorio publicado unicamente en GGUF Q4_K_M; no se listan otras cuantizaciones |
| Idiomas soportados | Ingles (en) e italiano (it) |
| Licencia | `other` en los metadatos de HuggingFace; la model card muestra un badge de Apache-2.0. Discrepancia sin resolver |
| Formato de pesos | GGUF (Q4_K_M) |
| Modelo base | XHToken/Spark-X2.5-4B |
| Tamano del repositorio | 2,6 GB (huella en disco declarada: 2,42 GB) |
| Herramienta de publicacion | Sigma Studio / SigmaEngine (autor: sigmanih) |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la proporcionada en la tabla de especificaciones de la model card: arquitectura base `spark2_5`, 36 capas de transformer, dimension oculta 2560 y 4.112 millones de parametros totales. No se especifica si se trata de un transformer denso, de una mezcla de expertos (MoE) o de una arquitectura hibrida, ni se detalla el mecanismo de atencion, el tokenizador, el vocabulario o la estrategia de extension de contexto empleada para alcanzar los 1.048.576 tokens declarados.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni los datos de la cuantizacion mas alla del hecho de que el repositorio contiene pesos GGUF Q4_K_M derivados de XHToken/Spark-X2.5-4B. La presencia de dos modos de operacion (No-Thinking y Deep Thinking CoT) sugiere un ajuste posterior orientado a razonamiento y a control del presupuesto de tokens de pensamiento, pero el autor no documenta el procedimiento. No se declara ninguna innovacion tecnica concreta (atencion lineal, decodificacion especulativa, destilacion) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e italiano.
- Dos modos de inferencia: "No-Thinking" (respuesta directa, sin tokens de razonamiento) y "Deep Thinking" (traza de razonamiento CoT paso a paso). Segun el autor, el modo CoT aporta +2,6 puntos porcentuales de precision a cambio de mayor latencia.
- Razonamiento logico y cientifico basico: 100% en las porciones evaluadas de ARC-Challenge (9/9) y BIG-Bench Hard (7/7), y 9/9 en GSM8K.
- Generacion de codigo Python: 57% en HumanEval (4/7) y 67% en MBPP (6/9), siempre sobre subconjuntos reducidos.
- Tool calling / function calling: el autor declara una adherencia al protocolo de herramientas del 79,3% y "cero funciones alucinadas", pero el mismo informe muestra 0/92 criterios analiticos verificados y 0,0% de completado autonomo de tareas.
- Capacidades de agente multi-paso: no verificadas en la practica; el unico escenario autonomo evaluado no se completo.
- Capacidades multilingues: limitadas a en e it; no se declara soporte de castellano.
- Vision, audio, OCR o multimodalidad: no disponibles / no declaradas.
- Cumplimiento de limites de sandbox: 100% declarado (ningun intento de escape del espacio de trabajo aislado).

## Casos de uso

- Agentes de voz en tiempo real en el borde: el modo No-Thinking evita tokens de razonamiento y el autor indica latencia minima con generacion inmediata del primer token, por lo que encaja en asistentes de voz locales sobre GPU de 6-8 GB.
- Asistente conversacional offline en portatil: con 2,42 GB de pesos y ~3,9 GB de RAM en modo CPU/hibrido, puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp, util para entornos sin conectividad o con requisitos de privacidad.
- Procesamiento de documentos extensos en ingles o italiano: la ventana declarada de 1.048.576 tokens permitiria, en teoria, resumir o consultar expedientes completos sin fragmentacion; requiere verificacion real de memoria y calidad en contextos largos.
- Generacion asistida de codigo Python en pipelines internos: con 57% en HumanEval y 67% en MBPP sobre subconjuntos pequenos, es apto como autocompletado o generador de borradores con revision humana, no como sustituto de un modelo de codigo especializado.
- Chat de atencion al cliente en italiano o ingles: el formato GGUF Q4_K_M permite desplegarlo en una sola GPU de gama media con coste bajo por token, gestionando conversaciones multi-turno.
- Evaluacion y prototipado de pipelines RAG locales: al ser un modelo pequeno y cuantizado, sirve para validar recuperacion aumentada en hardware de desarrollo antes de escalar a modelos mayores.
- Clasificacion y resumen de texto en aplicaciones embebidas: con 4,11 B de parametros y cuantizacion de 4 bits, es viable en dispositivos de borde y moviles con memoria limitada.
- Experimentacion con modos de razonamiento: la conmutacion No-Thinking/CoT permite comparar coste-latencia frente a precision en tareas de logica o matematicas basicas.

## Benchmarks y rendimiento

Resultados publicados por el autor (Sigma Studio Training Lab, seed 42, temperatura 0, motores `code_execution`, `continuation_logprob`, `cot_generation`, `letter_logprob`; hash de reproducibilidad `SHA256-7D9AD07F135D2701`). El propio autor advierte que las puntuaciones se han medido sobre una porcion de cada suite y no son comparables con ejecuciones de la suite completa.

| Suite | Dominio | Correctas / Total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 9 / 9 | 100% |
| BIG-Bench Hard | Logica compleja y simbolica | 7 / 7 | 100% |
| GSM8K | Matematicas escolares multi-paso | 9 / 9 | 100% |
| MATH | Matematicas de competicion | 6 / 9 | 67% |
| MBPP | Programacion Python con tests | 6 / 9 | 67% |
| TruthfulQA | Factualidad y anti-alucinacion | 6 / 9 | 67% |
| HumanEval | Codigo Python (pass@1) | 4 / 7 | 57% |
| MMLU | Conocimiento general multi-materia | 5 / 14 | 36% |
| HellaSwag | Sentido comun y NLI situacional | 3 / 9 | 33% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 3 / 9 | 33% |
| GPQA | Razonamiento academico de posgrado | 1 / 9 | 11% |
| Total agregado | Todas las suites evaluadas | 59 / 100 | 59% |

Comparacion de modos de razonamiento:

| Modo | Precision | Preguntas superadas | Perfil operativo declarado |
|---|---|---|---|
| No-Thinking (respuesta directa) | 57,9% | 33 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 60,5% | 26 / 43 | Traza estructurada multi-paso, +2,6 puntos |

Benchmark de protocolo de herramientas y agentes (Sandbox Jail):

| Metrica | Resultado | Criterio de validacion |
|---|---|---|
| Adherencia al protocolo de herramientas | 79,3% | 0 / 92 criterios analiticos verificados |
| Completado autonomo de tarea | 0,0% | 0 / 1 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100% conforme | Cero intentos de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Uso optimo de turnos y presupuesto de tokens |

Los resultados deben leerse con cautela: cada suite se ha evaluado con entre 7 y 14 preguntas, los agregados mezclan dominios muy distintos y el informe de agentes contiene afirmaciones internamente contradictorias (79,3% de adherencia frente a 0/92 criterios verificados y 0% de tareas completadas).

## Requisitos de hardware

- VRAM declarada para inferencia: ~4,1 GB con descarga completa en GPU (full offload); ~3,9 GB de RAM en modo CPU/hibrido.
- GPU recomendada por el autor: cualquier GPU con 6-8 GB de VRAM. En la practica, encaja en RTX 3060, RTX 4060, RTX 2060 6 GB, GTX 1660 6 GB, Tesla T4, Apple Silicon con memoria unificada de 8 GB o superior.
- Sistema: 16 GB de RAM recomendados si se ejecuta en CPU o de forma hibrida.
- Tamano: 2,42 GB en disco (2,6 GB de repositorio), lo que permite incluirlo en imagenes de contenedor ligeras o en dispositivos de borde.
- Advertencia sobre el contexto: la cifra de ~4,1 GB de VRAM corresponde a contextos cortos; activar la ventana declarada de 1.048.576 tokens incrementaria la cache KV de forma proporcional y no esta cuantificada en la informacion disponible.
- Opciones de despliegue: llama.cpp (etiqueta explicita del repositorio). Compatible con el ecosistema GGUF habitual (Ollama, LM Studio, llama-cpp-python). La etiqueta `endpoints_compatible` indica compatibilidad con endpoints gestionados de HuggingFace. Soporte de vLLM, TGI u otros servidores de alto rendimiento: no documentado.
- Latencia y throughput: no disponibles. La model card solo ofrece una descripcion cualitativa ("latencia minima, primer token inmediato") sin cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos frente a modelos de terceros, por lo que no es posible cumplimentar una comparativa sin inventar datos. Se indica a continuacion lo unico verificable y se senalan las celdas vacias.

| Criterio | XHToken-Spark-X2.5-4B-GGUF | Alternativas de ~3-4 B (Qwen2.5-3B, Llama-3.2-3B, Phi-3.5-mini) |
|---|---|---|
| Parametros | 4,11 B | no disponible en la informacion proporcionada |
| Contexto | 1.048.576 tokens (segun el autor) | no disponible en la informacion proporcionada |
| Rendimiento | 59% en suite parcial propia (100 preguntas) | no disponible; no se han publicado comparaciones cruzadas |
| Licencia | `other` (badge Apache-2.0 en la model card) | no disponible en la informacion proporcionada |
| Disponibilidad en GGUF | Si (Q4_K_M) | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Cifras de benchmark sobre muestras minimas: entre 7 y 14 preguntas por suite. Un 100% en ARC-Challenge equivale a 9 respuestas correctas; el margen de error es enorme y los agregados no son comparables con ejecuciones completas, como advierte el propio autor.
- Rendimiento bajo y probablemente real en conocimiento general y factualidad: 36% en MMLU, 33% en MMLU-Pro, 11% en GPQA y 33% en HellaSwag. No es un modelo adecuado para tareas que exijan conocimiento enciclopedico o razonamiento cientifico avanzado.
- Evidencia de tool calling no concluyente: el informe declara 79,3% de adherencia al protocolo pero 0/92 criterios verificados y 0,0% de completado autonomo. No debe asumirse que el modelo funcione como agente fiable en produccion.
- Riesgo de alucinacion: 67% en TruthfulQA sobre 9 preguntas no permite descartar invencion de hechos, especialmente fuera de los dominios evaluados.
- Contexto de 1M tokens sin verificar: es una cifra inusual para un modelo de ~4 B con 36 capas y dimension oculta 2560; no se documenta la tecnica de extension de contexto ni se aportan pruebas de recuperacion en ventanas largas.
- Idiomas limitados a ingles e italiano: no se declara soporte de castellano, por lo que su uso en produccion en espanol requeriria evaluacion previa.
- Licencia ambigua: los metadatos de HuggingFace indican `other` mientras la model card muestra un badge Apache-2.0. Antes de un uso comercial debe aclararse la licencia del modelo base XHToken/Spark-X2.5-4B, que tampoco documenta condiciones en la informacion disponible.
- Falta de trazabilidad del entrenamiento: sin datos de dataset, numero de tokens, fases de alineacion ni tokenizador, no es posible evaluar sesgos ni procedencia de los datos.
- Ausencia de validacion externa: 0 descargas y 0 "likes" en el momento de la consulta; no hay evaluaciones independientes ni terceros que reproduzcan los resultados.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-09-26) y la nomenclatura "X2.5" no se corresponden con ningun linaje de modelos conocido, lo que refuerza la necesidad de verificar el origen antes de integrarlo.
- Ambiguedad en "Active Parameters: 4B": se declara sin especificar si la arquitectura es MoE, lo que impide interpretar correctamente el coste real de inferencia.
- Cuantizacion unica Q4_K_M: no hay variantes de mayor precision (Q8_0, F16) en el repositorio, lo que limita el analisis de la perdida de calidad introducida por la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sigmanih/XHToken-Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Licencia Apache-2.0 citada en el badge de la model card: https://opensource.org/licenses/Apache-2.0
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
