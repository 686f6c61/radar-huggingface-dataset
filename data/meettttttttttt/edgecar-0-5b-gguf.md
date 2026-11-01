# meettttttttttt/edgecar-0.5b-GGUF

## Resumen

EdgeCar 0.5B es un modelo de lenguaje especializado en el análisis semántico de consultas sobre datos de vehículos, desarrollado por el usuario de HuggingFace `meettttttttttt` en el contexto del reto Tata Elxsi TELIPORT Season 4 (Case Study 5, *Natural Language Vehicle Information using On-Device SLM/LLM*). No es un modelo conversacional: es un parser semántico que transforma una pregunta en inglés sobre los datos registrados del coche en un comando corto de una a tres palabras, que posteriormente un motor determinista ejecuta contra los logs del vehículo.

El modelo se obtiene mediante fine-tuning de Qwen2.5-0.5B-Instruct y cuenta con 494.032.768 parámetros totales (aproximadamente 0,5B), lo que lo sitúa en la categoría de modelos pequeños diseñados para inferencia en dispositivo (*on-device*). La versión publicada en este repositorio está cuantizada en formato GGUF para su uso con llama.cpp, con variantes Q4_K_M (398 MB) y Q8_0 (531 MB). El autor reporta un tiempo de respuesta de aproximadamente 0,2 segundos sobre dos núcleos de portátil, lo que lo hace viable en hardware de automoción embebido.

Su relevancia actual radica en el enfoque de arquitectura: en lugar de generar respuestas en lenguaje natural (con el coste computacional y el riesgo de alucinación que ello implica), el modelo actúa como una capa de traducción lenguaje natural a comando estructurado, restringida por una gramática GBNF que garantiza que toda salida sea un comando válido. Todos los cálculos numéricos los realiza el sistema externo, de modo que el modelo nunca ve ni manipula los datos del vehículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuned desde Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso con llama.cpp emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); pesos fusionados en safetensors en el repo base |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base `meettttttttttt/edgecar-0.5b` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se somete a un fine-tuning supervisado para una tarea de generación estructurada muy acotada: producir comandos de un vocabulario cerrado de 115 elementos (10 verbos sobre 15 métricas y 10 tipos de evento). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card únicamente describe el objetivo funcional y el formato de salida.

La innovación técnica principal no reside en el entrenamiento sino en el mecanismo de control de la salida: se emplea una gramática GBNF (`commands.gbnf`) que restringe la decodificación de llama.cpp de forma que toda secuencia generada sea un comando sintácticamente válido del dominio. Esto elimina la posibilidad de que el modelo emita comandos de escritura o acciones sobre el vehículo, ya que la gramática no contiene verbos de actuación. El diseño separa deliberadamente la comprensión del lenguaje (modelo) del cálculo sobre datos (código determinista), lo que reduce la superficie de alucinación numérica.

## Capacidades

- Análisis semántico de preguntas en inglés sobre datos registrados de un vehículo, con extracción implícita de ventana temporal ("yesterday", "last 10 days", "this month").
- Generación de comandos estructurados de 1 a 3 palabras sobre un vocabulario cerrado de 115 comandos (verbos `total`, `trend`, `when`, `compare`, `why`, `show`, `before`, `unusual`, `now`, `unsupported`).
- Clasificación de intención con rechazo explícito: emite `unsupported` ante peticiones fuera de alcance, intentos de control del vehículo, inyecciones de prompt o preguntas ambiguas.
- Robustez frente a inyecciones de prompt: según el autor, responde `unsupported` a 35 de 40 peticiones de control, inyección o fuera de alcance en el conjunto de prueba de rechazo, incluidas las 12 peticiones de control del vehículo.
- No soporta tool calling genérico ni function calling en el sentido habitual de APIs de LLM; su "herramienta" es el propio vocabulario de comandos fijo.
- No soporta razonamiento multi-paso, agentes autónomos, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Asistente de datos de vehículo en el propio coche: el modelo traduce preguntas del conductor ("why is my kWh per 100 km so high over the past 10 days?") a comandos como `why energy_consumption`, que el sistema ejecuta sobre los logs locales sin conexión. Es adecuado por su tamaño (398 MB en Q4_K_M) y latencia (~0,2 s en dos núcleos).
- Consulta de estado en tiempo real: preguntas como "how much battery is left?" se resuelven con el comando `now`, que devuelve el estado actual del vehículo. Útil en pantallas de infoentretenimiento con recursos limitados.
- Detección y explicación de anomalías: la consulta "anything I should be worried about?" se mapea a `unusual`, que el motor interpreta como búsqueda de anomalías en los últimos 30 días. Apropiado para paneles de diagnóstico post-viaje.
- Análisis de eventos ADAS: preguntas sobre desconexiones del control de crucero adaptativo o peticiones de toma de control (`show adas_disengagement`, `before adas_takeover_request`) permiten al conductor revisar la historia de asistencia a la conducción sin conocimientos técnicos.
- Comparativas energéticas estacionales o por tipo de vía: comandos `compare energy_consumption temperature` o comparaciones ciudad/autopista, útiles en aplicaciones de eficiencia y planificación de rutas.
- Filtro de seguridad y alcance en asistentes de voz embebidos: el modelo actúa como primera capa que descarta peticiones de control del vehículo, inyecciones de prompt y consultas fuera de dominio, devolviendo `unsupported` antes de que cualquier componente con permisos de escritura reciba la petición.
- Integración en pipelines de evaluación de parsers semánticos: al ser un modelo pequeño con gramática cerrada y conjunto de prueba de rechazo público, sirve como referencia reproducible para investigar robustez ante inyecciones en dominios de bajo recurso.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las tasas de acierto sobre el conjunto de prueba reservado (*held-out*) del sistema completo (reglas + modelo), no del modelo aislado:

| Configuracion | Tamano | Precision held-out (reglas + modelo) |
|---|---|---|
| `edgecar-0.5b-q4_k_m.gguf` | 398 MB | 92,9 % |
| `edgecar-0.5b-q8_0.gguf` | 531 MB | 94,3 % |

Además, el autor reporta que, con las comprobaciones de rechazo de EdgeCar desactivadas, el modelo por sí solo responde `unsupported` a 35 de 40 peticiones del conjunto de prueba de rechazo (12 de 12 peticiones de control del vehículo). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para Q4_K_M y 0,55 GB para Q8_0, más el espacio de contexto y de la caché KV.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y CPU. El autor lo ejecuta en CPU con dos núcleos de portátil a ~0,2 s por consulta.
- GPU recomendadas para despliegue de flota o servidor: no requiere GPU dedicada; para servir múltiples instancias concurrentes, una A100 o H100 estarían sobredimensionadas y bastaría cualquier GPU de gama media o incluso CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de gramática GBNF mediante el campo `grammar` en la API compatible con OpenAI. También es desplegable a través del stack EdgeCar AI (`edgecar serve`). No se documenta soporte explícito para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: ~0,2 s por consulta en dos núcleos de CPU según el autor; no se proporcionan cifras de throughput para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 0.5B (este) | 494 M | No disponible | Parser semantico a comando cerrado, on-device | Apache 2.0 | GGUF + safetensors en HuggingFace |
| Qwen2.5-0.5B-Instruct (base) | ~494 M | No disponible en la informacion | Chat/generacion general | Apache 2.0 | HuggingFace |
| EdgeCar 1.5B | No disponible | No disponible | Misma tarea, mayor precision segun el autor (~0,6 GB mas de memoria) | No disponible | GGUF en HuggingFace |

No se dispone de datos de rendimiento comparativo entre EdgeCar 0.5B y Qwen2.5-0.5B-Instruct en la tarea específica, más allá de la mejora cualitativa que implica el fine-tuning y la restricción por gramática. Para alternativas de propósito general del mismo tamaño, Qwen2.5-0.5B-Instruct y modelos de la familia SmolLM son los comparables naturales, pero no se han publicado métricas cruzadas en la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo produce comandos del vocabulario cerrado de 115 elementos; no es utilizable como chatbot ni para generación de texto libre.
- Solo inglés: no se declara soporte de otros idiomas, lo que limita su uso en mercados no angloparlantes sin un paso previo de traducción.
- Riesgo de error semántico dentro del dominio: la model card documenta un fallo real ("What was my longest driving day last month?" → `when trip_count max` en lugar de `when distance max`), lo que indica que la precisión del 92,9-94,3 % no es perfecta y requiere validación en producción.
- Dependencia de la gramática GBNF: la garantía de que la salida sea un comando válido y de que no existan comandos de escritura depende de que la gramática se aplique correctamente en el servidor de inferencia; sin ella, el comportamiento no está garantizado.
- La robustez ante inyecciones de prompt se ha medido con las comprobaciones de rechazo del sistema desactivadas, pero sigue siendo una evaluación sobre un conjunto de 40 casos, no una garantía formal.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B-Instruct hereda los sesgos del corpus de preentrenamiento de dicho modelo, aunque el espacio de salida acotado los mitiga en gran medida.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las obligaciones de atribución y las condiciones heredadas del modelo base Qwen2.5.
- Sin datos publicados sobre longitud de contexto efectiva, composición del dataset de entrenamiento ni proceso de alineación; la reproducibilidad del fine-tuning no está documentada.
- El repositorio tiene un volumen de descargas muy bajo (81) y ningún *like*, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Pesos fusionados (safetensors): https://huggingface.co/meettttttttttt/edgecar-0.5b
- Variante 1.5B en GGUF: https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado del test de rechazo (0.5B Q4_K_M sin guardas): https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-0.5b-q4_k_m.json
