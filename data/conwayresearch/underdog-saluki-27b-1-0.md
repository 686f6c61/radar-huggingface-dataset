# ConwayResearch/Underdog-Saluki-27B-1.0

## Resumen

Underdog Saluki 27B 1.0 es una cuantizacion agresiva a 2 bits del modelo Qwen3.8-27B, publicada por ConwayResearch bajo la marca Underdog. El objetivo declarado es comprimir un modelo de 27.000 millones de parametros (26.895.998.464 exactamente) en un fichero GGUF de 7,89 GB, frente a los 54 GB del modelo completo, preservando de forma prioritaria la capacidad de tool calling y function calling, que suele ser lo primero que se degrada en cuantizaciones de muy baja precision.

El modelo se distribuye como GGUF para llama.cpp estandar, con soporte de plantilla de chat Qwen3.8 via `--jinja`, lo que habilita tool calling y modo de razonamiento (thinking) directamente sobre la API de chat compatible con OpenAI que expone `llama-server`. Incluye ademas un add-on de vision opcional en dos precisiones (F16 de 928 MB y Q8_0 de 629 MB) que anade entrada de imagenes al modelo base, que es solo de texto.

Su relevancia practica radica en que permite ejecutar un modelo de clase 27B con capacidades de agente en hardware de consumo (menos de 8 GB de pesos), un escenario historicamente reservado a modelos mucho mas pequenos. La contrapartida es una licencia CC BY-NC 4.0 que prohibe el uso comercial sin licencia separada, y una perdida medible en razonamiento matematico y en tareas de agente complejas respecto al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue de la model card; limite maximo nativo no disponible |
| Tipos de cuantizacion | IQ2-mix (2 bits, fichero principal); vision add-on en F16 y Q8_0 |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | CC BY-NC 4.0 (uso comercial requiere licencia aparte) |
| Formato de pesos | GGUF (llama.cpp); vision add-on en GGUF mmproj |
| Tamano del fichero principal | 7,89 GB |
| Tamano del repo | 9,5 GB |
| Modelo base | Qwen/Qwen3.8-27B; ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF |
| Runtime | llama.cpp estandar y aplicaciones construidas sobre el; Ollama 0.40.4 probado en Apple silicon |
| Metodo de cuantizacion | imatrix (tag declarado por el autor) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base mas alla de su procedencia (Qwen3.8-27B, de la familia Qwen). Lo relevante desde el punto de vista tecnico es el proceso de cuantizacion: se parte de una cuantizacion previa de ISTA-DASLab (Qwen3.8-27B-GSQ-RCO-GGUF) y se genera un fichero IQ2-mix de 2 bits con calibracion mediante imatrix. El autor no detalla la composicion exacta de la mezcla de tipos dentro del esquema IQ2-mix ni los datos de calibracion empleados.

El ajuste declarado se orienta a preservar el comportamiento de tool calling y function calling tras la compresion, asi como el modo thinking heredado de Qwen3.8, que viene activado por defecto y es conmutable por peticion mediante `chat_template_kwargs` (`enable_thinking: false`). No se menciona entrenamiento adicional con RLHF o DPO especifico para esta version; el trabajo descrito es de cuantizacion y calibracion, no de post-entrenamiento. La plantilla de chat Qwen3.8, activada con `--jinja`, es la que gestiona tanto las llamadas a herramientas como el razonamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Tool calling y function calling con la plantilla de chat Qwen3.8; el autor reporta 88 de 120 tareas superadas en su Underdog Bench (BFCL v4 congelado).
- Llamadas paralelas a herramientas: 42 de 100 tareas BFCL v4 paralelas con el checker oficial.
- Modo thinking activado por defecto y desactivable por peticion, heredado de Qwen3.8.
- Razonamiento y matematicas de competicion (AIME 2025 y 2026), con retencion parcial respecto al modelo completo.
- Generacion de codigo y resolucion de issues (SWE-bench Verified, MBPP+).
- Seguimiento de instrucciones (IFEval, IFBench).
- Vision opcional mediante add-on mmproj: entrada de imagenes a traves de la API de chat OpenAI de `llama-server`.
- Compatibilidad con endpoints compatibles con OpenAI (tag `endpoints_compatible`).
- Capacidades de agente multi-paso segun los benchmarks de agente reportados; sin soporte declarado de audio.

## Casos de uso

- Agentes locales de tool calling en estaciones de trabajo: con 7,89 GB de pesos, el modelo cabe en GPU de consumo y puede gestionar bucles de llamadas a funciones (APIs internas, consultas a bases de datos, automatizacion de tareas) sin depender de la nube, manteniendo un 88/120 en el benchmark de tool calling del autor frente a 84/120 del modelo completo.
- Asistentes de codigo en IDE con privacidad de datos: el modelo resuelve issues y genera parches (30 de 50 en SWE-bench Verified) y puede integrarse en flujos de revision o generacion de tests, ejecutandose en local para evitar enviar codigo propietario a terceros.
- Automatizacion de soporte tecnico multi-turno: con 32.768 tokens de contexto en la configuracion recomendada, admite conversaciones largas con historial extenso y llamadas a herramientas de consulta de estado o creacion de tickets.
- Procesamiento de documentos con imagenes: usando el add-on de vision (629 MB en Q8_0 o 928 MB en F16) puede extraer informacion de capturas, formularios o diagramas y encadenar esa extraccion con tool calling para registrar los datos.
- Prototipado e investigacion de agentes: su tamano reducido permite levantar varias instancias en paralelo o iterar rapido sobre disenos de agentes con llama.cpp y Ollama, comparando configuraciones de thinking on/off y temperatura.
- Despliegue en Apple silicon: probado con Ollama 0.40.4 en hardware Apple, sirve para asistentes personales locales con chat, razonamiento y herramientas sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: como referencia de hasta donde llega una cuantizacion IQ2 con imatrix en tareas de instrucciones y agentes, util para decidir el nivel de compresion aceptable en produccion.

## Benchmarks y rendimiento

Resultados reportados por el autor, ejecutados en llama.cpp estandar. Underdog Bench son 120 tareas de BFCL v4 congeladas antes de probar ningun modelo, con thinking desactivado y temperatura 0. Las puntuaciones publicas del modelo completo provienen de un harness distinto.

| Benchmark | Saluki (7,89 GB) | Qwen3.8-27B completo (54 GB) |
|---|---|---|
| Tool calling (Underdog Bench, de 120) | 88 | 84 |
| Llamadas paralelas (BFCL v4, de 100) | 42 | 35 |
| Bonsai 2 (tool calling, de 120) | 70 (5,95 GB) | no aplica |
| SWE-bench Verified (50 issues) | 30 | 33 |
| IFEval (prompt-loose) | 93,5 | 91,5 (publico) |
| IFBench (prompt-loose) | 72,7 | 71,0 (publico) |
| MBPP+ | 78,0 | 83,9 (publico) |
| MuSR | 67,5 | 79,6 (publico) |
| AIME 2025 (avg@4) | 79,2 | 96,7 (publico) |
| AIME 2026 (avg@4) | 80,0 | 94,6 (publico) |

Retencion media declarada: 96% en 9 benchmarks. El propio autor advierte que 120 tareas es una prueba modesta y que parte de la diferencia puede ser variacion entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB solo para los pesos en IQ2-mix; con cache KV para 32.768 tokens de contexto y overhead de llama.cpp, el consumo real es superior y depende del numero de capas descargadas a GPU (`-ngl 99` descarga todas).
- Con vision: sumar 0,6 GB (Q8_0) o 0,9 GB (F16) del add-on mmproj.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM permite cargar el modelo completo con contexto razonable; RTX 4090 (24 GB) deja margen amplio para contexto largo y vision. Para despliegues multiusuario, A100 o H100 permiten mayor paralelismo y contexto, aunque el modelo esta disenado para hardware modesto.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con cuantizacion IQ2 y contexto moderado; en 8 GB estrictos puede requerir reducir contexto o descargar algunas capas a CPU.
- Apple silicon: probado con Ollama 0.40.4 en hardware Apple.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -ngl 99 -fa on -c 32768`), Ollama (creando un Modelfile a partir del GGUF), y cualquier aplicacion construida sobre llama.cpp. No se mencionan vLLM ni TGI, que no consumen GGUF de esta forma.
- Ajustes recomendados: uso general y razonamiento con thinking activado, temperatura 0,6, top_p 0,95, top_k 20; tool calling rapido con thinking desactivado y temperatura 0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Tool calling (Underdog Bench) | Licencia |
|---|---|---|---|---|---|
| Underdog Saluki 27B 1.0 | 26,9 B (denso) | 7,89 GB (IQ2) | 32.768 en config. recomendada | 88/120 | CC BY-NC 4.0 |
| Qwen3.8-27B (completo) | 26,9 B (denso) | 54 GB | no disponible | 84/120 | Apache 2.0 |
| Bonsai 2 | no disponible | 5,95 GB | no disponible | 70/120 | no disponible |

La comparacion con el modelo completo es la mas informativa: Saluki reduce el peso un 85% y, segun el autor, mejora ligeramente en tool calling y llamadas paralelas, mientras pierde en matematicas de competicion (AIME: 79-80 frente a 94-97), MuSR (67,5 frente a 79,6) y MBPP+ (78,0 frente a 83,9). Bonsai 2 aparece unicamente como referencia de tool calling en un tamano similar. No se dispone de datos para comparar con otras familias de modelos de 27B en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial esta prohibido sin licencia separada, que debe solicitarse a license@conway.tech. Esto descarta su uso en produccion comercial sin acuerdo previo.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Retiene aproximadamente el 82-85% de la puntuacion en matematicas de competicion del modelo completo (AIME 2025: 79,2 frente a 96,7).
- Punto debil en puzzles de instrucciones a nivel de letra: palindromos, reglas de vocales y orden alfabetico.
- Alrededor de una quinta parte de las respuestas con llamadas paralelas presentan pequenos errores de formato, lo que exige validacion del lado del cliente.
- Con thinking activado tiende a razonar de forma extensa antes de responder, lo que incrementa latencia y consumo de tokens.
- La vision es un add-on separado; el fichero principal es solo texto y sin el mmproj no procesa imagenes.
- Riesgo de alucionacion inherente a un modelo de 27B cuantizado a 2 bits; no se documentan evaluaciones de factualidad ni de sesgos.
- La cuantizacion IQ2 es agresiva: los benchmarks del autor se centran en tool calling e instrucciones, por lo que el comportamiento en dominios no evaluados (traduccion, resumen largo, extraccion estructurada) es incierto.
- Los benchmarks de tool calling se basan en 120 tareas, muestra pequena segun el propio autor, y las comparaciones con puntuaciones publicas usan harness distintos.
- Depende de llama.cpp con soporte de `--jinja` para la plantilla Qwen3.8; otros runtimes pueden no reproducir el comportamiento de tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Pagina del proyecto: https://underdog.ai/saluki
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion de partida de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Berkeley Function Calling Leaderboard (origen de las tareas de Underdog Bench): https://gorilla.cs.berkeley.edu/leaderboard.html
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
