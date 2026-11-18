# DICPlay/RusMind-4.5.1-Momentum

## Resumen

RusMind 4.5.1 · Моментум es un modelo de lenguaje afinado por el equipo DICPlay a partir de `google/gemma-4-E2B-it` y distribuido en formato GGUF para inferencia local (llama.cpp, LM Studio, Ollama). Está orientado a un uso "on-device" sin conexión: portátiles, equipos de sobremesa convencionales y telefonos, con enfasis en ruso (con soporte de ingles). Se presenta como el miembro "mas ligero" de la generacion 4.5 de la familia RusMind, una linea de "IA nacional" rusa del mismo autor.

El modelo declara 4.647.450.147 parametros totales en el repositorio, si bien la model card menciona una arquitectura con activacion parcial de aproximadamente 2.000 millones de parametros por token (es decir, un esquema tipo MoE o de activacion selectiva heredado del modelo base). El repositorio ocupa 9,3 GB, coherente con una publicacion en GGUF de varias cuantizaciones. La licencia es propietaria (`rusmind-license`), no estandar de codigo abierto, lo que condiciona su uso comercial.

La relevancia actual del modelo radica en su posicionamiento: segun cifras de la propia model card, obtiene 0,225 en el subconjunto de razonamiento de MERA v2, por delante de modelos con muchos mas parametros activos como T-lite (8.000 M), Zero-Mistral (24.000 M) o A-Vibe (8.000 M), y se reclama numero 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parametros. Conviene tratar estas cifras con cautela: proceden del autor y no se han verificado de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E2B-it, con activacion parcial (~2.000 M parametros activos por token segun la model card); detalles de capas y atencion no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye multiples cuantizaciones GGUF); niveles concretos no detallados en la informacion disponible |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | rusmind-license (propietaria, etiquetada como "other"); texto completo en LICENSE del repositorio |
| Formato de pesos | GGUF (libreria gguf); pesos originales del modelo base no incluidos en este repo |
| Modelo base | google/gemma-4-E2B-it (finetune) |
| Tamano del repositorio | 9,3 GB |
| Fecha de creacion / actualizacion | 2026-10-14 / 2026-11-17 |

## Arquitectura y entrenamiento

No se dispone de detalle tecnico sobre la arquitectura interna, mas alla de que es un finetune de `google/gemma-4-E2B-it` y de la mencion del autor a unos 4.600 millones de parametros totales con unos 2.000 millones activos por token. El modelo base Gemma 4 E2B pertenece a la familia Gemma 4 de Google, pero la informacion proporcionada no incluye el desglose de capas, el tipo de atencion, la ventana de contexto nativa ni la estrategia de activacion (si es mezcla de expertos clasica u otra variante de eficiencia). Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del corpus de ajuste fino ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por preferencias.

Lo unico documentado en la model card es el enfasis del ajuste: mejora de la ortografia y puntuacion en ruso, conocimiento de historia rusa (desde la Rus de Kiev hasta la actualidad) e historia mundial del siglo XX, comprension de humor, adivinanzas y habla coloquial, seguimiento preciso de instrucciones complejas y llamada de herramientas (tool calling). El autor menciona tambien que la version 4.5.1 "razona antes de responder" en tareas logicas, lo que sugiere un modo de razonamiento encadenado, aunque no se documenta el mecanismo (si es un formato de pensamiento explicito o un prompting interno). Todos estos datos son declaraciones del autor y no se han verificado de forma externa.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfasis en fluidez y correccion ortografica y de puntuacion en ruso.
- Razonamiento en tareas logicas: la version 4.5.1 incorpora un modo de "pensar antes de responder" segun el autor.
- Conocimiento factual orientado a historia rusa e historia mundial del siglo XX, y a cultura y regiones de Rusia.
- Comprension pragmatica: humor, adivinanzas, lenguaje coloquial y palabras con significados opuestos.
- Seguimiento de instrucciones complejas y de multiples pasos (declarado por el autor).
- Llamada de herramientas / function calling (declarado en la model card).
- Inferencia local y offline: el modelo esta empaquetado en GGUF para ejecutarse sin conexion en equipos de consumo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con servidores de inferencia tipo API compatible.
- No se declaran capacidades de vision, audio ni multimodalidad, a pesar del origen Gemma; la ficha tecnica solo menciona generacion de texto.

## Casos de uso

- Asistentes conversacionales en ruso para atencion al cliente: el modelo puede mantener dialogos multi-turno en ruso con ortografia y puntuacion cuidadas, adecuado para chat de soporte en mercados rusoparlantes; la limitacion de contexto no documentada obliga a validar la longitud de sesion antes de producción.
- Procesamiento de texto en dispositivos sin conexion: al distribuirse en GGUF, puede desplegarse en portatiles y telefonos mediante llama.cpp u Ollama para tareas de redaccion, resumen o reescritura en entornos air-gapped (por ejemplo, oficinas con requisitos de confidencialidad).
- Educacion y divulgacion historica: su ajuste especifico en historia rusa y mundial del siglo XX lo hace util para generar material didactico o responder preguntas de un temario acotado; requiere revision humana por riesgo de alucinacion en datos historicos concretos.
- Asistente de escritura y correccion en ruso: dado el enfasis en ortografia y puntuacion, encaja en herramientas de edicion de textos, correos o documentacion interna en ruso, integrable como paso de postprocesado en un pipeline.
- Agentes ligeros con tool calling: el soporte declarado de llamada de funciones permite construir flujos de automatizacion (consulta de APIs internas, extraccion de datos) ejecutados localmente, sin depender de la nube.
- Prototipado rapido de productos de IA en ruso: su tamano (9,3 GB de repo GGUF) y su activacion parcial lo hacen apto para demos en portatiles de desarrollo antes de escalar a modelos mayores de la familia RusMind.
- Investigacion sobre eficiencia: interesante como caso de estudio de un modelo con ~2.000 M parametros activos que, segun el autor, compite con modelos de 8.000-24.000 M en benchmarks rusos.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y se refieren a MERA v2, el benchmark de la Alianza de IA rusa. No se han verificado de forma independiente.

| Benchmark (MERA v2) | RusMind 4.5.1 Momentum | T-lite (8B) | Zero-Mistral (24B) | A-Vibe (8B) |
|---|---|---|---|---|
| Razonamiento | 0,225 | 0,218 | 0,213 | 0,187 |

El autor afirma ademas que Momentum es numero 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 M de parametros, numero 1 en tareas centradas en personas en la misma franja, y que supera en puntuacion global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible, por lo que no se incluyen.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamano (4.647 M parametros totales), una cuantizacion Q4_K_M rondaria los 2,8-3,0 GB en disco y necesitaria un margen adicional de contexto en VRAM; Q8_0 se situaria en torno a 5 GB; el repo completo (9,3 GB) sugiere que se publican varias cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4-8 GB de VRAM deberia poder ejecutar cuantizaciones intermedias; modelos como RTX 3060/4060, RTX 4090, A100 o H100 no se mencionan en la informacion disponible.
- Cabe en GPU de consumo: si, segun el propio autor ("funciona en portatiles, PC convencionales y telefonos"), aunque no se detallan configuraciones verificadas.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados por el autor en la familia RusMind) y, por los tags, endpoints compatibles con API.
- Latencia y throughput: no disponibles. El autor afirma que "vuela" en navegador y telefono, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MERA v2 (razonamiento) |
|---|---|---|---|---|---|
| RusMind 4.5.1 Momentum | 4.647 M | ~2.000 M | no disponible | rusmind-license (propietaria) | 0,225 |
| T-lite (T-Bank) | ~8.000 M | no disponible | no disponible | no disponible | 0,218 |
| Zero-Mistral | ~24.000 M | no disponible | no disponible | no disponible | 0,213 |
| A-Vibe (Avito) | ~8.000 M | no disponible | no disponible | no disponible | 0,187 |

Las cifras de parametros de los competidores son las que cita el autor en su model card; no se dispone de fichas tecnicas independientes en la informacion proporcionada. En rendimiento global, el autor situa a Momentum por delante de Gemma 4 E2B y Qwen3.5-4B, pero sin cifras detalladas en el fragmento disponible.

## Limitaciones y advertencias

- Sesgos: el ajuste esta fuertemente orientado a la cultura, historia y realidad rusa; puede presentar sesgos de perspectiva en temas historicos y geopoliticos, no documentados por el autor.
- Alucinacion: como cualquier modelo de ~4.600 M de parametros, el riesgo de inventar datos facticos (fechas, nombres, cifras) es alto, especialmente en historia; no se declara ningun mecanismo de mitigacion.
- Contexto e idioma: solo se declaran ruso e ingles; el rendimiento en castellano no esta soportado ni evaluado. La longitud de contexto no se documenta, lo que impide planificar cargas de documentos largos.
- Licencia: la licencia `rusmind-license` es propietaria y no equivale a una licencia de codigo abierto; el uso comercial, la redistribucion y el finetune pueden estar restringidos. Es imprescindible leer el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- Verificacion de benchmarks: las cifras de MERA v2 provienen exclusivamente del autor; no se han contrastado con la plataforma ni con terceros en la informacion disponible. Ademas, el propio autor recomienda migrar a RusMind 4.7, lo que sugiere que 4.5.1 es una version ya superada dentro de su propia linea.
- Formato: al publicarse unicamente en GGUF, no se dispone de pesos en safetensors para este repo, lo que limita el reentrenamiento o la conversion a otros formatos sin acceso a los pesos originales.
- Produccion: sin datos de contexto, latencia ni evaluaciones de robustez, no se recomienda su uso en produccion sin una bateria de pruebas propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.1-Momentum
- Demo / producto: https://rusmind.ru
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Benchmark MERA v2 (Alianza de IA rusa): https://mera.a-ai.ru/ru/text/leaderboard
- Version recomendada por el autor, RusMind 4.7 Momentum: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Sokol (con modo de razonamiento): https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
