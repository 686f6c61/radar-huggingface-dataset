# JacobLinCool/CogLLM-Qwen3.5-2B

## Resumen

CogLLM-Qwen3.5-2B es un modelo derivado de Qwen/Qwen3.5-2B desarrollado por JacobLinCool, orientado a la revision de escritura en ingles. No es un modelo generativo en el sentido habitual: se trata de un conjunto de cabezas de prediccion (wording, sentence ease, coherence, token signals) montadas sobre un backbone Qwen3.5-2B congelado que, en una sola pasada causal, devuelve numeros y offsets de caracteres en lugar de texto generado. Su proposito es senalar a un escritor que palabras pueden resultar dificiles y que frases pueden romper la coherencia con el texto precedente.

El modelo se apoya en estudios de psicolinguistica y comprension lectora: los objetivos de entrenamiento se derivan de juicios humanos recogidos en datasets como PLABA-EVAL, CoheSentia, DECOR y MedReadMe. El checkpoint conjunto se complementa con pesos especificos para la puntuacion de facilidad de lectura (escala ordinal de 1 a 5), un recurso lexico derivado de CompLex y coeficientes de conexion entre oraciones.

Es relevante porque demuestra un uso no generativo de un LLM pequeno (2B) como extractor de caracteristicas para tareas de evaluacion de legibilidad, con resultados medidos frente a juicios humanos. Su tamano reducido y su licencia MIT lo hacen desplegable en entornos modestos, aunque su alcance funcional es estrecho y especifico del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B congelado) con cabezas de prediccion adicionales |
| Parametros totales | 2B (backbone); parametros de las cabezas no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos y software del proyecto); backbone Qwen bajo Apache 2.0; CompLex bajo CC BY 4.0 |
| Formato de pesos | no disponible (el repo incluye checkpoint conjunto, pesos de cabezas, recursos lexicos y manifest.json; el repo reporta 0.0 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone Qwen3.5-2B en modo congelado y anade varias cabezas: una para el token readout experimental, una para la propuesta de wording, un modelo ordinal para la puntuacion de facilidad de lectura y coeficientes para la estimacion de coherencia entre oraciones. Toda la inferencia se realiza en una unica pasada causal sobre el texto visible, sin generacion autoregresiva. El runtime descarga por separado los pesos y el tokenizer originales de Qwen (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`) y, en el primer uso, obtiene los dos ficheros originales de MedReadMe desde sus autores, verificando sus huellas SHA-256 y reconstruyendo los parametros lexicos validados.

El token readout experimental se ajusto con 65 objetivos de observacion procedentes de 26 fuentes, con pesos de fuente fijos y una restriccion que preserva el comportamiento previo de los tokens. La cabeza de wording combina estadisticas de expresion biomedica, una lectura lexica de CompLex y caracteristicas de Qwen. La puntuacion de facilidad de lectura emplea un modelo ordinal. La estimacion de coherencia se entreno con 5.190 decisiones de lectores sobre 346 relatos cortos, reservando 87 relatos separados para calibracion. El proyecto no documenta el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Deteccion de palabras y expresiones potencialmente dificiles en texto en ingles, con offsets de caracteres y una unica propuesta por oracion.
- Puntuacion de facilidad de lectura de oraciones en escala de 1 a 5, mediante modelo ordinal.
- Deteccion de posibles rupturas de coherencia respecto al texto precedente (alertas sobre oraciones completadas).
- Senales experimentales por token (opening, unresolved, resolution, transition) en unidades del modelo.
- Procesamiento en una sola pasada causal, sin generacion de texto.
- Interfaz Gradio de demostracion (writing app) para pegar pasajes y ver estimaciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- Multilingue: limitado a ingles.

## Casos de uso

- Revision de abstracts biomedicos: el modelo senala frases dificiles y propone expresiones candidatas, aprovechando que su cabeza de wording se entreno con estadisticas de expresion biomedica y juicios de PLABA-EVAL.
- Asistencia a escritores tecnicos y cientificos: integrado en un editor, puede subrayar terminos y oraciones que probablemente generen quejas de legibilidad, devolviendo offsets que el editor puede mapear directamente al texto.
- Evaluacion de coherencia en narrativa corta: sobre relatos o parrafos, marca transiciones que podrian romper la continuidad, con una tasa de deteccion medida sobre CoheSentia y DECOR.
- Correccion de ensayos de estudiantes: la regla de conexion se valido sobre 100 ensayos independientes con anotaciones de expertos, lo que permite usarla como primera pasada de revision antes de la lectura humana.
- Analisis psicolinguistico y de legibilidad a escala: al no generar texto y ejecutarse en una pasada, permite procesar corpus grandes de forma economica para estudiar dificultad lexica y coherencia.
- Investigacion en evaluacion de LLMs como extractores de caracteristicas: sirve como caso de estudio de destilacion de juicios humanos en cabezas sobre un backbone congelado, reproducible via el manifest de integridad.
- Filtrado previo en pipelines editoriales: puede priorizar que parrafos requieren revision humana, reduciendo el volumen de lectura experta.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia |
|---|---|---|
| Solapamiento de wording (94 frases senaladas por 42 lectores) | 45 de 94 con el metodo liberado; 30 de 94 exigiendo limites exactos | Baseline frecuencia/longitud/posicion: 25 de 94 |
| Ganancia de facilidad de lectura en 265 revisiones alineadas | 0,497 puntos estimados frente a 0,537 reportados por lectores (escala 1-5) | — |
| Deteccion de rupturas de coherencia en 49 relatos retenidos | 77 de 123 rupturas marcadas; 48 de 647 decisiones no marcadas activadas | CoheSentia |
| Deteccion de rupturas en 100 ensayos de estudiantes | 114 de 446 rupturas marcadas por expertos; 131 de 906 oraciones coherentes activadas | DECOR |
| Token trace experimental en 8 ejemplos con dos preguntas concurrentes | 0 de 8 recuperaciones correctas de ambos enlaces | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; un backbone de 2B en precision completa requiere aproximadamente 4-5 GB, y en cuantizacion de 8 bits alrededor de 2-3 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 o una A100/H100 son suficientes y sobredimensionadas.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 6-8 GB o mas, aunque no hay confirmacion oficial.
- Opciones de despliegue: el proyecto proporciona codigo de inferencia en el Space (Gradio) y un flujo de descarga con verificacion SHA-256; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CogLLM-Qwen3.5-2B | 2B (backbone) | no disponible | Legibilidad y coherencia en ingles | MIT (backbone Apache 2.0) | Hugging Face |
| Qwen/Qwen3.5-2B | 2B | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| Baseline frecuencia/longitud/posicion | no aplica | no aplica | Deteccion de wording dificil | no disponible | Referencia en la model card |
| Modelos de legibilidad clasicos (p. ej. indices tipo Flesch-Kincaid) | no aplica | no aplica | Legibilidad a nivel de texto | no disponible | Ampliamente disponibles |

No se dispone de datos para comparar rendimiento con alternativas especificas de revision de escritura basadas en LLM.

## Limitaciones y advertencias

- El alcance es exclusivamente el ingles; no se documenta soporte para otros idiomas.
- El modelo no genera texto: solo devuelve numeros y offsets, por lo que no puede usarse como chatbot ni asistente conversacional.
- La evaluacion de wording no mide falsos positivos sobre expresiones no mencionadas por los lectores, ya que estos podian elegir que senalar.
- El token trace experimental fallo en los 8 ejemplos con dos preguntas concurrentes; el autor indica que el momento e identidad de la confusion de un lector concreto no estan validados.
- Una alerta de coherencia ausente no garantiza que el pasaje sea coherente; puede contener transiciones dificiles no marcadas.
- Las escalas de los datasets conservan su significado original, por lo que las puntuaciones no son directamente comparables entre fuentes.
- Riesgo de sesgo derivado de los corpus de entrenamiento (biomedico, narrativa corta, ensayos de estudiantes) y de los juicios de un conjunto limitado de lectores.
- La licencia MIT cubre los pesos y el software del proyecto, pero los recursos derivados de CompLex estan bajo CC BY 4.0 y el backbone Qwen bajo Apache 2.0; es necesario respetar las atribuciones correspondientes.
- El repo reporta 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamano no se ha actualizado; conviene verificar antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JacobLinCool/CogLLM-Qwen3.5-2B
- Writing app (Space): https://huggingface.co/spaces/JacobLinCool/CogLLM
- Codigo de inferencia e instalacion: https://huggingface.co/spaces/JacobLinCool/CogLLM/tree/main
- Backbone Qwen3.5-2B (revision fijada): https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Terminos de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- PLABA-EVAL: https://github.com/SDS-NLP/PLABA-EVAL
- CoheSentia (EMNLP 2023): https://aclanthology.org/2023.emnlp-main.324/
- DECOR (EMNLP 2024): https://aclanthology.org/2024.emnlp-main.639/
- CompLex: https://github.com/MMU-TDMLab/CompLex
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- MedReadMe: https://github.com/chaojiang06/medreadme
