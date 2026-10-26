# matejkalc99/mulon

## Resumen

Mulon es un adaptador LoRA experimental publicado por matejkalc99 (un equipo de aficionados) que ajusta el modelo base Qwen/Qwen3.5-9B para escribir y conversar en triestino moderno (*triestin*), el dialecto véneto hablado en Trieste (Italia). No es un modelo completo: es un adaptador PEFT de rango 16 y unos 116 MB que se monta sobre el backbone de texto del modelo base, que no se redistribuye. La versión pública es la v1, correspondiente a la build interna v10 de una serie que fue de la v9 a la v12.

El problema que aborda es la escasez de recursos lingüísticos para dialectos locales en los LLM actuales: el triestino apenas tiene representación en los corpus de entrenamiento de los grandes modelos, y el resultado suele ser italiano con calcos o un véneto genérico. Mulon intenta corregir el registro, el vocabulario y las formas gramaticales attested («xe», «go», «te ga», «no») usando prosa real de un foro local. La motivación declarada es que hablantes nativos lo prueben y señalen errores.

Es relevante ahora por su honestidad metodológica y por sus limitaciones explícitas: los propios autores advierten de que ningún hablante nativo ha validado el modelo, de que la mayor parte de los datos de conversación son sintéticos y de que las evaluaciones son suites caseras de 32 tareas, no benchmarks estándar. La licencia CC BY-NC-SA 4.0 impide el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT 0.19.0) sobre el backbone de texto de Qwen/Qwen3.5-9B; arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | Modelo base: 9B (según el nombre del checkpoint, no verificado); adaptador: 116.425.848 bytes de pesos LoRA |
| Parámetros activos | No aplica (no se describe un base MoE en la información disponible) |
| Longitud de contexto | No disponible para el base; el entrenamiento usó secuencias de 1.024 tokens como máximo |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y la cuantización dependería del base (no evaluada) |
| Idiomas soportados | Triestino (dialecto véneto de Trieste) como lengua objetivo; italiano para instrucciones y prompts. Etiqueta HF: `it` |
| Licencia | Adaptador: CC BY-NC-SA 4.0. Base Qwen/Qwen3.5-9B: Apache-2.0. Texto de entrenamiento: CC BY-NC-SA 3.0 (sección 7 del reglamento del foro atrieste.eu) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); el base se descarga por separado desde su propio repositorio |

Otros datos: rank 16, alpha 32, dropout 0,05; módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (solo backbone de texto); revisión del base fijada en `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; tamaño del repo 0,1 GB; librería `peft`; pipeline `text-generation`; creado el 26 de octubre de 2026.

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente al backbone de texto del base. Al cargarlo con `AutoModelForCausalLM`, Qwen3.5 se instancia como `Qwen3_5ForCausalLM` (clase solo-texto); la clase imagen-texto usa rutas de módulos distintas, por lo que el adaptador no se aplicaría. Requiere `transformers` ≥ 5 (probado con 5.3.0) y `peft` 0.19.0. Todo el ajuste es LoRA clásico: sin cambios en la tokenización ni en el vocabulario, sin decodificación especulativa ni mecanismos de atención alternativa documentados.

El entrenamiento parte del adaptador v9 y continúa en dos etapas fijas: (1) prosa auténtica, 2 épocas con LR 2e-5 y predicción causal siguiente-token sobre 964 fragmentos de foro sin modificar (50.951 palabras, 240 hilos, 49 autores distintos), con el peso de pérdida de un autor prolífico reducido para que ninguno supere aproximadamente el 20 % de las palabras ponderadas; (2) *replay* de conversación, 1 época con LR 1e-5 sobre las 489 filas supervisadas de v9, supervisando únicamente el turno final del asistente. Batch 4 con acumulación de gradiente 4 y secuencias de hasta 1.024 tokens. El checkpoint final se fijó por protocolo antes de conocer las puntuaciones.

Hay una divulgación explícita sobre datos sintéticos: de las 489 filas de conversación heredadas de v9, 366 son respuestas en dialecto escritas por agentes de IA (ancladas en el corpus auténtico como referencia de vocabulario y gramática y revisadas por un agente independiente) y solo 123 son pasajes auténticos sin modificar. Ningún hablante nativo revisó los objetivos sintéticos. No se realizó ablación que separe las dos etapas, por lo que los autores no pueden atribuir las mejoras a ninguna de ellas.

## Capacidades

- Generación de texto en triestino moderno con registro conversacional, orientada a prosa natural y respuestas prácticas.
- Conversión de registro: responder en dialecto a instrucciones formuladas en italiano estándar.
- Escritura de mensajes cotidianos (por ejemplo, redactar un aviso o una petición a otra persona) manteniendo persona, agente, posesión, cantidades, tiempos y negaciones.
- Formulación de posibilidades y consejos como tales, y petición explícita de información faltante en lugar de inventarla (comportamiento inducido por el *system prompt* de referencia).
- Multilingüismo limitado: italiano como lengua de instrucción y triestino como lengua de salida; otras lenguas no documentadas.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni modo de razonamiento: el perfil evaluado es greedy con `enable_thinking=False` y el modo *thinking* queda sin probar.

## Casos de uso

- Preservación y difusión del dialecto: generación de textos de ejemplo y material divulgativo en triestino para escuelas o asociaciones culturales locales, con revisión humana obligatoria al no haber validación nativa.
- Investigación lingüística: corpus sintético controlado para estudiar cómo un LLM de 9B representa morfología y léxico de un dialecto de bajos recursos, comparando el adaptador con el base sin ajustar.
- Traducción italiano → triestino en borradores: pasar comunicados o notas en italiano estándar a un registro dialectal y usarlo como primer borrador que un hablante pule.
- Atención al cliente para comercios locales de Trieste: respuestas en dialecto en canales de mensajería, aprovechando que no requiere GPU de datacenter (≈18 GB en bf16) y que el adaptador pesa 116 MB, lo que permite servirlo junto al base con un solo despliegue.
- Moderación y dinamización de comunidades: redacción de respuestas y avisos para foros o grupos locales, replicando el registro del corpus de origen (foro atrieste.eu).
- Creación de contenido costumbrista: diálogos y textos breves para podcasts, teatro amateur o redes sociales donde el triestino aporta autenticidad, siempre con revisión de un hablante nativo.
- Docencia de italiano L2 y dialectología: ejercicios de contraste entre italiano estándar y triestino, generando pares de frases equivalentes.
- Pruebas de *prompting* multilingüe: caso de estudio de cómo un *system prompt* detallado en italiano condiciona el cumplimiento de instrucciones en un dialecto no visto durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas cifras son de una suite propia, pequeña y congelada, de 32 tareas, con prompt y decodificación fijos (greedy, sin *thinking*), y sirven solo para comparar entre las builds internas del propio proyecto:

| Build | Elementos de la suite | Tareas superadas | Fallos críticos | Notas |
|---|---|---|---|---|
| Mulon v1 (build interna v10) | 32 | No disponible numéricamente (el recuento más alto de la serie) | 0 | Publicada; checkpoint fijado por protocolo |
| Build interna v11 | 32 | 27/32 | No disponible | Diferencia con v10 descrita como no significativa |
| Build interna v12 | 32 | 26/32 | No disponible | Diferencia con v10 descrita como no significativa |
| Qwen/Qwen3.5-9B sin adaptador | 32 | No disponible | No disponible | Línea base del proyecto |

Los propios autores califican estas diferencias de no estadísticamente significativas y advierten de que la suite es casera y de tamaño reducido.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en bf16 para el base más el adaptador (dato del autor). Con el adaptador de 116 MB el sobrecoste de memoria es despreciable.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier tarjeta con 24 GB o más. Una RTX 4090 (24 GB) es suficiente para el perfil bf16 evaluado.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización del base, potencialmente en tarjetas de 12-16 GB; el autor no documenta ninguna cuantización probada, así que ese escenario no está validado.
- CPU: la inferencia en CPU funciona según el autor, pero es lenta; no se aportan cifras de latencia.
- Despliegue: la vía documentada es `transformers` ≥ 5 + `peft` 0.19.0 con `device_map="auto"`. vLLM (con soporte LoRA), TGI o llama.cpp/Ollama no están documentados por el autor; para llama.cpp/Ollama habría que fusionar el adaptador en el base y convertirlo a GGUF, procedimiento no descrito ni evaluado.
- Latencia y throughput: no disponibles. Solo se evaluó decodificación greedy con `enable_thinking=False`; el muestreo y el modo *thinking* quedan sin probar.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Mulon v1 (v10) | LoRA r16 sobre Qwen3.5-9B | Base ~9B + 116 MB de adaptador | Entrenado a 1.024 tokens; contexto del base no disponible | CC BY-NC-SA 4.0 (adaptador) | Público, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | Modelo completo | 9B (nominal) | No disponible en la información | Apache-2.0 | Público; alternativa con uso comercial permitido y sin capacidad dialectal específica |
| Build interna v11 | LoRA sobre el mismo base | Igual que v10 | Igual que v10 | No publicada | Solo referencia interna; 27/32 en la suite propia |
| Build interna v12 | LoRA sobre el mismo base | Igual que v10 | Igual que v10 | No publicada | Solo referencia interna; 26/32 en la suite propia |

No hay datos en la información proporcionada sobre otros adaptadores o modelos comparables para dialectos italianos (véneto, triestino, friulano) ni sobre modelos de 9B especializados en lenguas de bajos recursos, por lo que la comparación externa queda como no disponible.

## Limitaciones y advertencias

- Ningún hablante nativo de triestino ha validado el modelo; todos los juicios de calidad proceden de revisión por IA y de evaluadores no nativos.
- La mayor parte de los datos de conversación (366 de 489 filas) son sintéticos, generados por agentes de IA sin revisión nativa: los hábitos dialectales del modelo pueden reflejar texto escrito por IA y no uso real.
- El corpus auténtico es reducido (50.951 palabras, 240 hilos, 49 autores de un único foro), con el sesgo de registro, tema y estilo de una sola comunidad, y el desequilibrio de autores solo se mitiga parcialmente.
- Sin ablación entre las dos etapas de entrenamiento: no se sabe qué etapa produce las mejoras ni cuánto aporta el *replay* sintético.
- Evaluación muy limitada: suite propia de 32 tareas, un solo prompt, decodificación greedy y `enable_thinking=False`. El muestreo y el modo *thinking* no se han probado, y las diferencias entre builds no son estadísticamente significativas.
- Licencia CC BY-NC-SA 4.0 en el adaptador (y CC BY-NC-SA 3.0 en el texto de entrenamiento): prohibido el uso comercial y obligación de compartir igual. El base es Apache-2.0, pero eso no levanta la restricción del adaptador.
- El adaptador solo cubre el backbone de texto; no funciona sobre la clase imagen-texto del base. Riesgo de respuestas incoherentes o de "italianización" del dialecto fuera del dominio del foro.
- Riesgo de alucinación y de invención de hechos, causas o acciones ya realizadas; el *system prompt* de referencia intenta mitigarlo, pero no hay garantía.
- Proyecto de aficionados con 0 descargas y 0 likes: sin mantenimiento, soporte ni garantías; no apto para producción sin auditoría propia y validación por nativos.
- No se documentan prácticas de alineación de seguridad, filtrado de contenido ni evaluación de sesgos.

## Enlaces

- Ficha del adaptador en HuggingFace: https://huggingface.co/matejkalc99/mulon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Foro de origen del corpus de entrenamiento (condiciones en la sección 7 del reglamento): https://atrieste.eu
- Perfil del autor en GitHub: https://github.com/KalcMatej99
- No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios ni demos adicionales sobre este modelo; los resultados obtenidos (mathlon.app, listados genéricos de modelos) no están relacionados con Mulon.
