# meettttttttttt/edgecar-1.5b

## Resumen
EdgeCar 1.5B es un ajuste fino supervisado de Qwen2.5-1.5B-Instruct desarrollado por el usuario meettttttttttt para el proyecto EdgeCar AI, presentado al reto Tata Elxsi TELIPORT Season 4 (Case Study 5, "Natural Language Vehicle Information using On-Device SLM/LLM"). No es un modelo conversacional: es un parser semantico que traduce una pregunta en ingles sobre los datos registrados de un vehiculo a un comando corto de una a tres palabras, que despues un codigo externo ejecuta en modo de solo lectura contra los logs del propio coche. El modelo nunca ve los datos del vehiculo y no calcula ninguna cifra.

La arquitectura es la de Qwen2 (transformer decoder-only denso) con 1.543.714.304 parametros totales, derivada directamente de Qwen2.5-1.5B-Instruct. El modelo cubre una gramatica cerrada de 115 comandos: 10 verbos combinados con 15 metricas y 10 tipos de evento. Su relevancia practica esta en el despliegue en el dispositivo: segun la model card, responde en aproximadamente 0,4 s sobre dos nucleos de portatil, funciona sin conexion y su gramatica no contiene ningun comando que actue sobre el vehiculo, lo que limita el dano maximo de un fallo a una consulta de solo lectura.

El modelo se publica con licencia Apache 2.0 y pesos en safetensors (repo de 3,1 GB), con variantes GGUF publicadas aparte para su uso real en produccion. Solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repo principal; variantes GGUF en repositorios separados (la model card cita Q4_K_M) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo meettttttttttt/edgecar-1.5b-GGUF) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se ajusta mediante fine-tuning supervisado para una tarea de parsing semantico de dominio cerrado. La salida esta restringida a un vocabulario de 115 comandos generados por la combinacion de 10 verbos (`total`, `trend`, `when`, `compare`, `why`, `show`, `before`, `unusual`, `now`, `unsupported`) con 15 metricas (`energy_consumption`, `range`, `battery_temp`, `soc`, `hvac_energy`, etc.) y 10 tipos de evento (`adas_disengagement`, `adas_takeover_request`, `dtc`, `charging`, etc.).

El dataset de entrenamiento consta de 3.795 preguntas sinteticas, cada una etiquetada con su comando: 417 escritas a mano (505 filas con variantes de ruido ligero) y 3.290 generadas a partir de plantillas que cruzan las formas de frase de cada verbo con metricas, eventos y expresiones temporales, cubriendo los 115 comandos. Se descartaron 576 preguntas generadas; la model card no detalla el motivo completo ni si hubo fases de RLHF o DPO. Como innovacion destacable, el autor publica una gramatica asociada a la version GGUF que garantiza que toda salida sea un comando valido, y el diseno separa deliberadamente el modelo (que solo emite el comando) del codigo que extrae la ventana temporal de la pregunta y calcula los numeros sobre los logs.

## Capacidades
- Parsing semantico de preguntas en ingles sobre datos registrados de un vehiculo electrico a comandos de una a tres palabras.
- Cobertura de 115 comandos sobre 15 metricas y 10 tipos de evento.
- Extraccion implicita de la intencion temporal a partir de expresiones como "yesterday", "over the past 10 days", "this month" o "last week" (la ventana la resuelve el codigo externo).
- Clasificacion de peticiones fuera de alcance como `unsupported`, incluidas ordenes de control del vehiculo, inyecciones de prompt y preguntas ambiguas.
- Segun la model card, con las comprobaciones de rechazo de EdgeCar desactivadas, el modelo por si solo responde `unsupported` a 38 de 40 peticiones de control, inyeccion de prompt y peticiones fuera de alcance o ambiguas, incluidas las 12 de 12 peticiones de control del coche.
- Generacion determinista recomendada (`do_sample=False`, `max_new_tokens=16`) con un system prompt fijo que forma parte del entrenamiento.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; es un clasificador generativo de comandos, no un asistente general.

## Casos de uso
- Asistente de datos del vehiculo en el propio coche: el modelo traduce la pregunta del conductor a un comando que el sistema ejecuta contra los logs locales, sin enviar datos a la nube; encaja por su latencia de aproximadamente 0,4 s en dos nucleos y su funcionamiento offline.
- Analisis de consumo energetico: preguntas como "Why is my kWh per 100 km so high over the past 10 days?" se convierten en `why energy_consumption`, y el codigo calcula la explicacion con la ventana `last_10d`.
- Diagnostico de temperatura de bateria: "which day was the battery the hottest this month" se mapea a `when battery_temp max`, util para paneles de salud de bateria en flotas.
- Revision de eventos ADAS: "Did adaptive cruise cut out at any time yesterday?" produce `show adas_disengagement`, lo que permite construir informes de desenganches y solicitudes de takeover a partir de los logs.
- Deteccion de anomalias: la pregunta abierta "Anything I should be worried about?" se resuelve con `unusual`, adecuada para un resumen periodico de incidencias (codigos DTC, frenadas bruscas, cargas) en la app del propietario.
- Comparativas estacionales: "How much more energy do I use in winter than in summer?" se traduce a `compare energy_consumption temperature`, util para herramientas de eficiencia y planificacion de autonomia.
- Filtro de seguridad en el borde: integrado como primera etapa antes de cualquier accion, clasifica como `unsupported` las ordenes de control del coche y las inyecciones de prompt, de modo que el peor fallo posible sea una consulta de solo lectura.
- Visualizacion de tendencias: "Plot battery temperature over the last 10 days" se convierte en `trend battery_temp`, lo que permite generar graficas en la app sin que el modelo manipule los datos.

## Benchmarks y rendimiento
La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Los unicos datos de evaluacion disponibles son cualitativos y de la propia prueba de rechazo:

| Prueba | Resultado | Fuente |
|---|---|---|
| Rechazo de peticiones de control, inyeccion de prompt, fuera de alcance y ambiguas (sin guardas de EdgeCar) | 38/40 correctas | model card, enlace a `refusal_test-slm-noguard-edgecar-1.5b-q4_k_m.json` |
| Peticiones de control del vehiculo rechazadas | 12/12 | model card |
| Latencia en dispositivo | aproximadamente 0,4 s en dos nucleos de portatil | model card |
| Precision en el conjunto de test retenido de comandos | no disponible como metrica agregada; la model card solo muestra ejemplos, con un fallo documentado (`when trip_count max` frente a `when distance max`) | model card |

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4 GB.
- Cuantizacion GGUF Q4_K_M: el repo de 0,5B ocupa unos 2 GB segun la model card; para el 1.5B en Q4_K_M se estima alrededor de 1 GB de pesos, aunque el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060); para cuantizaciones GGUF basta CPU.
- Cabe en GPU consumer: si, tanto en FP16 en tarjetas de 4-6 GB como en cuantizacion en CPU.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), llama.cpp/Ollama mediante los repositorios GGUF, y text-generation-inference (el modelo esta etiquetado como compatible con endpoints). No se menciona vLLM de forma explicita.
- Latencia y throughput: aproximadamente 0,4 s por respuesta en dos nucleos de portatil (x86 y ARM, segun la model card); no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 1.5B | 1.543.714.304 | no disponible | Parser semantico de dominio cerrado para datos de vehiculo | apache-2.0 | HuggingFace, safetensors y GGUF |
| Qwen2.5-1.5B-Instruct (base) | 1.500 millones (aproximado) | no disponible en la informacion proporcionada | Asistente conversacional general | apache-2.0 | HuggingFace |
| EdgeCar 0.5B | no disponible | no disponible | Variante de 2 GB, la mas rapida y pequena, con espacio para voz en dispositivo | no disponible en la informacion proporcionada | HuggingFace (GGUF) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de EdgeCar 1.5B con alternativas de la misma categoria; la comparacion con el modelo base es estructural (mismo origen, distinta tarea) y no de rendimiento medido.

## Limitaciones y advertencias
- El modelo solo entiende ingles; no hay soporte multilingue declarado.
- No es un chatbot: fuera de la tarea de parsing de comandos sobre datos del vehiculo su utilidad es nula, y el system prompt debe ser exactamente la frase de entrenamiento.
- Riesgo de confusion entre metricas cercanas: la propia model card documenta un fallo (`when trip_count max` en lugar de `when distance max` para "longest driving day").
- El dataset es mayoritariamente sintetico (3.290 de 3.795 preguntas generadas por plantillas), lo que puede limitar la robustez ante formulaciones reales no vistas.
- La seguridad depende del diseno: la gramatica cerrada no incluye comandos que actuen sobre el vehiculo, por lo que un fallo se traduce como maximo en una consulta de solo lectura; aun asi, el autor recomienda mantener las comprobaciones de rechazo de EdgeCar activadas.
- No se han publicado resultados de benchmarks estandar ni una evaluacion agregada de precision en el conjunto de test, lo que dificulta estimar su calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece informacion sobre sesgos mas alla de la tarea.
- El numero de descargas (88) y de likes (0) indica una adopcion muy baja y poca validacion externa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/meettttttttttt/edgecar-1.5b
- Variante GGUF (la que usa EdgeCar): https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Variante de 0,5B en GGUF: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Repositorio del proyecto EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado de la prueba de rechazo sin guardas: https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-1.5b-q4_k_m.json
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
