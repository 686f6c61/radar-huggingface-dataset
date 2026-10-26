# 3hs4n/Nanbeige4.3-33B-mlx-JANG_2D-compact

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una build cuantizada en formato MLX de Nanbeige 4.3 33B, el modelo denso de 33.118.977.024 parámetros (33,1B) desarrollado por el equipo Nanbeige. La publicación la firma el usuario 3hs4n y reutiliza el checkpoint JANG_2D de OsaurusAI (Jinho Jang): no hay reentrenamiento ni ajuste fino, solo conversión de pesos a un formato mixto de 2–6 bits con grupo de 64 y un tamaño efectivo de aproximadamente 3,37 bits por peso.

El problema que resuelve es de despliegue: el pack completo ocupa 13.958.714.792 bytes de pesos (unos 13,96 GB, ~13,98 GB de descarga) e incluye un runner que carga el modelo en FP16 sin recuantizar en tiempo de ejecución. Según las mediciones del autor en un Apple M1 Max de 64 GB de memoria unificada, el proceso alcanza un pico de 13,98 GiB y sostiene unas 20,11 tokens/s de decodificación con modo razonamiento activado sobre una batería fija de 48 casos funcionales.

Es relevante ahora porque permite ejecutar un modelo de 33B en hardware Apple Silicon de gama alta consumiendo menos de 14 GB, con soporte de modo thinking y de tool calling nativo en XML. Conviene subrayar que el autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K): sus cifras son comprobaciones funcionales locales y no deben interpretarse como precisión general frente al modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama densa de 52 capas (según model card); solo texto, sin visión, audio ni vídeo |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible (no declarada en la información proporcionada) |
| Tipos de cuantizacion | Cuantización afín mixta de 2–6 bits, grupo de 64, ~3,37 bits efectivos por peso; pesos servidos en FP16 en el runner incluido, sin recuantización en runtime |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (tanto el modelo base como el checkpoint cuantizado de origen) |
| Formato de pesos | Safetensors en formato MLX: 3 shards más el índice; 13.958.714.792 bytes de pesos |
| Parametros del repositorio | Autor de la build: 3hs4n; cuantización JANG_2D: Jinho Jang (OsaurusAI); modelo base: Nanbeige/Nanbeige4.3-33B (equipo Nanbeige) |

## Arquitectura y entrenamiento

La model card describe una arquitectura Llama densa de 52 capas, estrictamente textual. No se aportan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base; esa información correspondería a la model card de Nanbeige, que no forma parte de la documentación disponible aquí. El repositorio es explícitamente una release de cuantización, no una ejecución de entrenamiento nueva.

La innovación técnica de este pack está en la compresión y en el tooling que lo acompaña. La cuantización JANG_2D aplica affine quantization mixta de 2 a 6 bits con grupo de 64, lo que deja el peso efectivo en ~3,37 bits por peso incluido el overhead. El runner incluido usa el cargador `FastMLXModel` de Unsloth-Zoo en modo FP16 y añade un formateador opcional de fracciones (`--response-format auto|text|fraction`) que solo actúa cuando el prompt pide explícitamente una fracción y la respuesta contiene una única fracción sin signo; no resuelve el problema, no consulta claves de respuesta, no reintenta la generación ni modifica los pesos. El razonamiento se activa por defecto mediante la plantilla de chat y se desactiva con `--no-thinking`.

## Capacidades

- Generación de texto conversacional en inglés y en los idiomas que soporte el modelo base (no declarados).
- Razonamiento explícito o modo thinking, controlable por petición mediante `--no-thinking`.
- Tool calling nativo en XML a través de runtimes compatibles; el autor reporta tres comprobaciones locales de llamadas a herramientas y round-trips simulados superados, además de dos llamadas XML nativas y dos round-trips en el conjunto adicional de 12 casos.
- Generación de código, según las etiquetas del repositorio (`coding`), sin benchmarks publicados que lo cuantifiquen.
- Formateo opcional de la salida como fracción `a/b`, con eliminación de envoltorios LaTeX o etiquetas asertivas y reducción solo si se solicita.
- Sin capacidades multimodales: no acepta imagen, audio ni vídeo.
- Sin datos publicados sobre función de contexto largo, multilingüismo medido ni agentes multi-paso más allá de los round-trips simulados.

## Casos de uso

- Asistencia de razonamiento en local sobre Mac: con el modo thinking activado por defecto, el modelo puede resolver problemas paso a paso sin salir del equipo; el autor midió 20,11 tokens/s de decodificación en un M1 Max de 64 GB, suficiente para uso interactivo individual.
- Agentes locales con tool calling: la plantilla admite llamadas XML nativas, de modo que un orquestador puede exponer funciones (consultas a ficheros, APIs internas, cálculos) y recibir invocaciones estructuradas sin depender de un proveedor en la nube.
- Desarrollo de software en entornos con requisitos de privacidad: al ocupar menos de 14 GiB en memoria unificada, encaja en flujos de autocompletado y generación de código donde el código no puede enviarse a una API externa.
- Sustitución de APIs en portátiles Apple Silicon: la build MLX evita la capa de servidor y permite prototipar un asistente de 33B en un solo equipo antes de decidir un despliegue mayor.
- Investigación sobre cuantización extrema: el repositorio documenta fixtures fijos de 48 y 12 casos, la comparación entre el preset nativo MLX (43/48) y el cargador FP16 (47/48), y un crossover ABBA/BAAB con 16 generaciones, material útil para estudiar la degradación de un modelo de 33B a ~3,37 bits por peso.
- Pipelines educativos de matemáticas: el formateador de fracciones (`auto`) devuelve `a/b` limpio en 34/34 comprobaciones de CPU con una mediana de 6,542 microsegundos por llamada, útil para normalizar respuestas numéricas en correctores automáticos.
- Evaluación de latencia y memoria en hardware concreto: las mediciones de tiempo (302,8 s y 425,8 s para las suites completas) y de pico de memoria (13,8–13,98 GiB) sirven para dimensionar equipos, no como garantía de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor aporta únicamente comprobaciones funcionales locales sobre fixtures fijos, que no son puntuaciones de precisión general ni comparaciones contra el modelo BF16 original:

| Configuracion | Fixture funcional fijo | Tiempo / velocidad | Pico de memoria del proceso | Alcance |
|---|---|---|---|---|
| Preset rápido nativo MLX | 43/48 | 302,8 s; sonda de velocidad separada con mediana de 19,58 tokens/s | ~13,8 GiB | Generación codiciosa, límite de 256 tokens de salida |
| Cargador FP16 de Unsloth-Zoo, thinking activado | 47/48 en bruto | 440,0 s; mediana de 20,11 tokens/s por caso | 13,95 GiB | Generación codiciosa, límite de 1.024 tokens totales incluido razonamiento |
| Formateador opcional de fracciones | 34/34 comprobaciones del formateador | 6,542 µs de mediana por llamada sobre 10.000 llamadas de CPU | No medido | Solo CPU; no es inferencia |
| Runner incluido con formateo `auto` | 48/48 entregados; 47/48 en bruto | 425,8 s | 13,98 GiB | Ejecución única con carga única, mismo preset codicioso con thinking, cero errores en runtime |

Datos adicionales aportados: el conjunto de regresión de formato de 12 casos puntuó 11/12 (9/10 automáticos y 2/2 de prosa revisada), con un desajuste de etiqueta JSON (`lanterns` frente a `lantern`) que no se relajó. En el crossover intra-sesión, con dos prompts fijos y cuatro mediciones por brazo y prompt en orden ABBA/BAAB, las medianas fueron 20,879 frente a 20,890 tokens/s y 20,874 frente a 20,887 tokens/s con el formateador desactivado y activado; los tokens de salida coincidieron en las 16 generaciones y la diferencia de tiempo hasta el primer token fue inferior a 2 ms. El formateador consumió 7,5 ms en total a lo largo de las 48 peticiones. El autor advierte que estas cifras describen ejecuciones locales concretas y no constituyen garantías de rendimiento.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 13,98 GiB de pico de proceso medidos en un Apple M1 Max de 64 GB; los pesos en disco son 13,96 GB.
- Hardware validado: Apple Silicon exclusivamente (etiqueta `apple-silicon`, librería `mlx`). La única medición publicada corresponde a un M1 Max con 64 GB de memoria unificada.
- GPU CUDA (A100, H100, RTX 4090) y ROCm: no soportadas por esta build, que depende de MLX; para esos entornos habría que usar el modelo base o generar otra cuantización.
- Encaje en equipos de consumo: no verificado en Macs de 16 o 24 GB. Con un pico de 13,98 GiB, un equipo de 16 GB queda al límite y no hay medición que lo confirme; 32 GB o más es el escenario prudente.
- Opciones de despliegue: `mlx` / `mlx-lm`, el script `run.py` incluido con las opciones `--no-thinking` y `--response-format`, y el cargador `FastMLXModel` de Unsloth-Zoo en FP16. No se incluye GGUF, por lo que llama.cpp y Ollama no aplican directamente; tampoco hay artefactos para vLLM ni TGI.
- Throughput y latencia: 19,58 tokens/s (preset rápido nativo) y 20,11 tokens/s (cargador FP16 con thinking) de mediana en decodificación codiciosa sobre M1 Max; 425,8 s para 48 peticiones en la ejecución completa. No se publica latencia por token ni tiempo hasta el primer token absoluto.
- Reproducibilidad: el autor indica que un entorno limpio de Python 3.11 coincidió con los 34 pins de paquetes declarados (entrada truncada en la documentación disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano en disco | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|---|
| 3hs4n/Nanbeige4.3-33B-mlx-JANG_2D-compact | 33,1B | Safetensors MLX, 2–6 bits (~3,37 bits/peso) | 13,96 GB de pesos; ~13,98 GB de descarga | No disponible | Apache-2.0 | Apple Silicon (MLX) |
| OsaurusAI/Nanbeige4.3-33B-JANG_2D (origen) | 33,1B | JANG_2D, 2–6 bits | No disponible en la información proporcionada | No disponible | Apache-2.0 | Depende del runtime del autor original |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | Pesos sin cuantizar (BF16, según referencias del texto) | No disponible en la información proporcionada | No disponible | Apache-2.0 | GPU o Apple Silicon con memoria suficiente para precisión completa |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes; cualquier tabla de rendimiento frente a modelos de 30B de la competencia requeriría fuentes que no están en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks estándar publicados: los 48/48 y 47/48 corresponden a un fixture local fijo y el propio autor indica que no son puntuaciones de precisión general ni miden retención frente al BF16.
- La cuantización a ~3,37 bits por peso implica una degradación desconocida: no se ha medido la pérdida de calidad respecto al modelo base en tareas abiertas.
- El modelo es solo texto: no admite visión, audio ni vídeo.
- La longitud de contexto y los idiomas soportados no se declaran en la información disponible, lo que impide garantizar conversaciones multi-turno largas o cobertura lingüística concreta.
- Dependencia de plataforma: la build es MLX y está pensada para Apple Silicon; no funciona en CUDA, ROCm ni en GPUs convencionales sin reconvertir los pesos.
- El formateador de fracciones solo está activo en el runner CLI incluido: la plantilla de chat sin modificar, las llamadas MLX en crudo y otras interfaces devuelven el texto explicativo original.
- Riesgo de alucinación inherente a un modelo de lenguaje de 33B, no cuantificado en esta build; el formateador no valida la corrección del resultado, solo la presentación.
- Sesgos conocidos: no documentados en la información proporcionada; deben asumirse los del modelo base, que tampoco se detallan aquí.
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar el texto de la licencia y los avisos aplicables al redistribuir el pack, incluyendo la atribución a Nanbeige, a OsaurusAI (Jinho Jang) y al autor de esta build.
- Adopción no validada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-10-26) es posterior a la de esta ficha; no hay evidencia de uso en producción por terceros.
- Las cifras de rendimiento provienen de un único equipo (M1 Max, 64 GB) y de suites pequeñas; no deben extrapolarse a otros chips ni a cargas concurrentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/3hs4n/Nanbeige4.3-33B-mlx-JANG_2D-compact
- Checkpoint cuantizado de origen: https://huggingface.co/OsaurusAI/Nanbeige4.3-33B-JANG_2D
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo, su autor o el equipo Nanbeige; los enlaces anteriores son los únicos relevantes disponibles.
