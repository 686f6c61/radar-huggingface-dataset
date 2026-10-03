# jialinyyzz/humanizer

## Resumen

humanizer es un modelo de 12B parámetros (11.959.730.224 según los pesos en safetensors) especializado en reescribir borradores generados por IA —correos, ensayos, informes, publicaciones de foro— para que suenen como escritos por una persona. Lo publica el usuario jialinyyzz y es un ajuste fino (finetune) sobre google/gemma-4-12B. Su rasgo diferencial es la restricción factual: está entrenado para conservar sin cambios cada número, unidad, fecha, nombre y cita, y para no añadir información nueva. El autor afirma explícitamente que no se utilizó ningún detector de IA en el entrenamiento.

El modelo funciona como completado de texto puro, no como chat: no usa plantilla de conversación, ni turnos, ni system prompt. Se le envía una instrucción fija en inglés seguida del borrador y la marca `### Rewritten:`, y el modelo continúa el texto. Trabaja con inglés y chino, con una ventana de contexto de 8192 tokens para instrucción más borrador más reescritura. El repositorio ocupa 202 GB e incluye pesos en bf16 (safetensors) y varias cuantizaciones GGUF listas para llama.cpp y MLX.

Es relevante ahora porque cubre un caso de uso muy concreto —humanizar texto sin degradarlo factualmente— con despliegue local y sin dependencia de servicios en la nube, lo que encaja en flujos donde la privacidad del borrador importa. La licencia Apache 2.0 y la disponibilidad de GGUF de 7,6 GB en adelante lo hacen accesible en equipos de consumo, y el proyecto incluye una aplicación de escritorio para macOS y Windows además de una herramienta de línea de comandos para documentos largos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta `gemma4_unified`, derivado de google/gemma-4-12B |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (instrucción + borrador + reescritura) |
| Tipos de cuantizacion | bf16 (safetensors); GGUF Q8_0, Q6_K, Q4_K_M (Q6_K y Q4_K_M con calibración imatrix); versión lite en Q8_0, Q6_K y bf16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), GGUF; conversión a MLX documentada |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de etiquetarla como `gemma4_unified` y de indicar que el modelo base es google/gemma-4-12B con relación de finetune. Los tags del repositorio incluyen `transformers`, `gemma4`, `image-text-to-text`, `llama.cpp`, `mlx` e `imatrix`. El dato de arquitectura concreta (tipo de transformer, atención, capas) no está disponible en la información proporcionada.

El entrenamiento se presenta como un ajuste fino orientado a una tarea de reescritura con preservación estricta de hechos. El autor indica que no se empleó ningún detector de IA en el proceso, y que las cuantizaciones Q6_K y Q4_K_M se calibraron con imatrix sobre datos propios de reescritura. Existe un conjunto de evaluación de borradores y reescrituras (unas 33.000 tokens, según la métrica KL, sin solapamiento con los datos de calibración) y un conjunto de 420 reescrituras en inglés evaluadas con un juez de hechos. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación destacable no es arquitectónica sino de formato y uso: el modelo se invoca con un prompt fijo byte a byte (`prompt_format.json`), funciona a temperatura 1.0 con top-p 0.95 y sin top-k, min-p ni penalización por repetición, y solo se detiene en EOS (no acepta stop strings, en particular no `###`).

## Capacidades

- Reescritura de texto generado por IA para que suene humano, en inglés y chino.
- Preservación de hechos: números, unidades, fechas, nombres y citas deben sobrevivir sin cambios.
- Reorganización libre del texto, variación deliberada de la longitud de las frases y eliminación de hedging y frases de relleno.
- Sustitución de vocabulario abstracto por términos concretos.
- Funcionamiento local y sin conexión una vez descargado el modelo.
- Procesamiento de documentos largos mediante troceado por párrafos y la herramienta de línea de comandos `hz`, que conserva encabezados, código, tablas y enlaces y marca los fragmentos donde falta un número.
- Entrada de documentos en `.md`, `.txt` y `.docx` a través de la CLI.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta un modo de pensamiento (thinking), visión o audio, pese a que los tags del repositorio incluyen `image-text-to-text`.

## Casos de uso

- Humanización de borradores de correo profesional: el modelo reescribe el texto generado por un asistente manteniendo intactos importes, fechas y nombres de destinatarios, con 8192 tokens de contexto suficientes para hilos de correo de varias páginas.
- Revisión de ensayos y trabajos académicos: se le pasa el borrador y devuelve una versión con ritmo más variable y menos fórmulas repetitivas, preservando las citas textuales y las referencias numéricas.
- Publicaciones en foros y comunidades: convierte respuestas con tono claramente automatizado en mensajes con registro más natural, útil para equipos de comunidad que redactan a volumen con ayuda de IA.
- Informes internos y documentación: la CLI procesa archivos `.docx` y `.md` completos, conserva tablas y encabezados, y señala los fragmentos donde detecta que se ha perdido un número, lo que permite revisión selectiva en lugar de releer todo el documento.
- Comunicación de marketing: adapta textos generados a partir de fichas de producto sin alterar especificaciones, precios ni unidades, un requisito crítico en materiales comerciales.
- Procesamiento por lotes de carpetas de borradores: el flujo de línea de comandos permite reescribir un directorio entero de documentos, adecuado para equipos editoriales que reciben contenido generado de forma masiva.
- Despliegue con requisitos de privacidad: al ejecutarse en local (llama-server o la aplicación de escritorio), permite reescribir material confidencial sin enviarlo a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a bf16 y resultados de un juez de hechos automático sobre 420 reescrituras en inglés.

| Fichero | KL media vs. bf16 | Token superior igual que bf16 | Perplejidad | Sin problema factual (inglés) |
|---|---|---|---|---|
| bf16 (referencia) | — | — | — | 368 / 420 |
| Q8_0 | 0,0015 | 98,4% | +0,3% | 376 / 420 |
| Q6_K | 0,0031 | 97,7% | +0,6% | 364 / 420 |
| Q4_K_M | 0,0215 | 93,9% | +2,5% | 363 / 419 |

La KL se midió sobre unos 33.000 tokens de borradores y reescrituras del conjunto de evaluación, sin solapamiento con los datos de calibración de imatrix. El autor señala que los tres ficheros GGUF quedan dentro del ruido del juez de hechos respecto a bf16. En los resultados de búsqueda web aparece además una nota sobre la versión `humanizer-gemma-4-e4b` en Q6_K con 7/62 problemas críticos en inglés y 13/16 en chino, descrita como dentro del ruido de bf16.

## Requisitos de hardware

- Q8_0 (12,7 GB): recomendado para equipos con 32 GB de memoria o más.
- Q6_K (10,0 GB): pensado para máquinas con 16 GB de memoria.
- Q4_K_M (7,6 GB): la opción más pequeña del modelo de 12B, para cuando la memoria o el disco son limitados.
- Safetensors bf16 (unos 24 GB): para transformers, vLLM o conversión a MLX; requiere bastante más memoria que las versiones GGUF.
- Versión lite (antigua E4B): `humanizer-lite-Q8_0.gguf` de unos 8,0 GB, `humanizer-lite-Q6_K.gguf` de unos 6,2 GB, `humanizer-lite-bf16.gguf` de unos 14,9 GB y safetensors en 4 fragmentos de unos 15,9 GB; orientada a máquinas con 8 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: llama.cpp (recomendado en macOS, Windows y Linux), llama-server, transformers, vLLM, conversión a MLX, Lemonade (`lemonade pull jialinyyzz/humanizer-gemma-4-e4b:Q6_K`) y la aplicación de escritorio oficial para macOS (Apple silicon) y Windows.
- Umbral de memoria práctica: la versión de 12B no cabe en GPUs de consumo con menos de 12 GB de VRAM en Q4_K_M; la versión lite está pensada para equipos de 8 GB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jialinyyzz/humanizer | 12B (11,96 mil millones) | 8192 tokens | Reescritura con preservación factual, en y zh | Apache 2.0 | Safetensors bf16 y GGUF Q8_0/Q6_K/Q4_K_M |
| jialinyyzz/humanizer-gemma-4-e4b (lite) | Aproximadamente 8B | No disponible | Misma tarea; mismo formato de prompt | Apache 2.0 | GGUF Q8_0/Q6_K/bf16 y safetensors en 4 fragmentos |
| google/gemma-4-12B (modelo base) | 12B | No disponible | Modelo generalista de partida | No disponible en esta información | Pesos originales de Google |
| harlynmivra/Xing4.0-29B-A4B-Rewrite | 29B totales, 4B activos (MoE, según el nombre) | No disponible | Reescritura | No disponible | No disponible |

La comparación con alternativas de la misma categoría (modelos especializados en reescritura o humanización) no puede completarse con los datos disponibles: solo se ha identificado Xing4.0-29B-A4B-Rewrite como modelo de reescritura relacionado, sin datos de rendimiento, contexto ni licencia.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte documentado de otros idiomas, incluido el castellano.
- El contexto está limitado a 8192 tokens para instrucción, borrador y reescritura juntos; los documentos largos deben trocearse en los saltos de párrafo.
- No es un modelo de chat: no admite system prompt ni plantilla de conversación, y el formato de prompt debe reproducirse byte a byte. La instrucción en inglés se usa también para borradores en chino.
- Solo debe detenerse en EOS: usar `###` u otras cadenas de parada rompe el comportamiento esperado.
- Los parámetros de muestreo son estrictos (temperatura 1.0, top-p 0.95, top-k 0, min-p 0, penalización de repetición 1.0). Los valores por defecto de llama.cpp (top-k 40, min-p 0.05) y de `generation_config.json` (top-k 64) deben desactivarse explícitamente.
- Riesgo de alucinación y de pérdida de fidelidad factual: aunque el modelo está entrenado para conservar hechos, el juez de hechos sobre 420 reescrituras en inglés marca problemas en aproximadamente el 12% de los casos en bf16 (368/420 correctos) y en el 16% en Q6_K (364/420). La CLI mitiga esto marcando los fragmentos donde falta un número, pero no sustituye a una revisión humana.
- La cuantización Q4_K_M degrada más la fidelidad (KL 0,0215 frente a bf16, 93,9% de coincidencia en el token superior y un 2,5% más de perplejidad), por lo que en usos sensibles conviene Q8_0 o bf16.
- El autor declara que no se usó ningún detector de IA en el entrenamiento; no se aportan datos sobre sesgos demográficos, de género o culturales.
- Licencia Apache 2.0: permite uso comercial, pero se desconoce si el modelo base google/gemma-4-12B impone condiciones adicionales, ya que su licencia no figura en la información disponible. Conviene verificarla antes de un despliegue comercial.
- El repositorio ocupa 202 GB, lo que puede ser un problema de disco si se descargan todas las variantes.
- No hay datos publicados de sesgos, de comportamiento fuera de los idiomas soportados ni de latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jialinyyzz/humanizer
- Versión lite (antigua E4B): https://huggingface.co/jialinyyzz/humanizer-gemma-4-e4b
- Repositorio en GitHub: https://github.com/sgaofen/humanize-model
- Cuenta del autor en GitHub: https://github.com/sgaofen
- Aplicación de escritorio (versiones para macOS y Windows): https://github.com/sgaofen/humanize-model/releases/latest
- Guía de instalación: https://github.com/sgaofen/humanize-model/blob/main/docs/INSTALL.md
- Guía de uso sin la aplicación: https://github.com/sgaofen/humanize-model/blob/main/docs/USAGE.md
- Guía de uso (chino): https://github.com/sgaofen/humanize-model/blob/main/docs/USAGE.zh.md
- README en chino: https://github.com/sgaofen/humanize-model/blob/main/README.zh.md
- Instrucciones para agentes de IA: https://github.com/sgaofen/humanize-model/blob/main/AGENTS.md
- Lemonade (runtime alternativo): https://lemonade-server.ai/
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Commit de la versión lite con resultados en Q6_K: https://huggingface.co/jialinyyzz/humanizer-gemma-4-e4b/commit/0335dae36d4b84ef3da6cbf27ba3f235dc1ae510
