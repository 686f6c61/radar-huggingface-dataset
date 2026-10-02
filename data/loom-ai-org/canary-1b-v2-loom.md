# loom-ai-org/canary-1b-v2-loom

## Resumen

Canary 1B v2 Loom es una exportación del modelo de reconocimiento y traducción de voz `nvidia/canary-1b-v2` de NVIDIA NeMo al formato GGUF propietario del motor loom.cpp, publicada por la organización `loom-ai-org`. No se trata de un modelo nuevo ni de pesos reentrenados: el autor indica explícitamente que los pesos son idénticos a los del modelo base y que la aportación consiste en empaquetar los mismos parámetros en un único fichero GGUF autodescriptivo que incluye sus propias topologías de grafo, tokenizador y script de controlador.

El modelo resuelve tareas de reconocimiento automático del habla (ASR) y traducción de voz a texto en 25 idiomas, con un total de 973.674.640 parámetros (aproximadamente 973 millones) y un tamaño de repositorio de 3,9 GB. Se distribuye bajo licencia CC-BY-4.0, heredada del modelo base, y está pensado para ejecutarse con la librería `loom-py-rt` en lugar de con los runners habituales (transformers, vLLM, llama.cpp).

Su relevancia es de nicho: interesa a quien ya utilice el ecosistema loom.cpp/loom-py y quiera ejecutar Canary 1B v2 con ese runtime, aceptando depender de una herramienta poco extendida. La información pública de esta ficha no incluye detalles de entrenamiento, benchmarks ni cuantizaciones alternativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; heredada de nvidia/canary-1b-v2 (modelo NeMo de ASR/traducción de voz) |
| Parámetros totales | 973.674.640 (unos 973 M, dato de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; el audio se procesa en clips de hasta 40 s y no se fragmenta automáticamente |
| Tipos de cuantización | GGUF; cuantización concreta no especificada (el tamaño del repo, 3,9 GB para 973 M de parámetros, es coherente con pesos en alta precisión) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (fichero único autodescriptivo generado con loom-exporter) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada de esta exportación: la model card se limita a indicar que procede de `nvidia/canary-1b-v2` y que es un modelo de reconocimiento y traducción de voz. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o cualquier otra técnica de alineamiento), por lo que estos datos deben consultarse en la model card del modelo base de NVIDIA.

El único elemento técnico distintivo documentado es el formato de empaquetado: un GGUF generado con loom-exporter que transporta sus propias topologías de grafo, su tokenizador y un script de controlador embebido. Ese controlador es la autoridad sobre los argumentos aceptados por el modelo y puede consultarse mediante `model.driver_source`. La API de alto nivel de loom-py aplica por debajo el troceado, el muestreo y el ensamblado necesarios para esta tarea.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en 25 idiomas.
- Traducción de voz a texto: el parámetro `target_language` define el idioma de salida y por defecto es inglés, de modo que audio en alemán sin destino explícito se devuelve traducido al inglés.
- Transcripción en el idioma original: basta con fijar `language` y `target_language` al mismo valor (por ejemplo, `language="de"`, `target_language="de"`).
- Entrada de audio en formato de lista de flotantes mono a 16 kHz.
- Procesamiento de clips de hasta 40 segundos; los clips más largos no se fragmentan automáticamente.
- Salida de texto plano accesible mediante `result.text`.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz: con clips de hasta 40 s por pasada, el modelo encaja en un pipeline que trocea el audio en segmentos y concatena las transcripciones resultantes.
- Subtitulado de contenido audiovisual en 25 idiomas: la capacidad de traducción de voz a texto permite generar subtítulos en un idioma distinto al del audio original fijando `target_language`.
- Atención al cliente multilingüe: transcripción y traducción de llamadas o mensajes de voz procedentes de distintos países europeos cubiertos por el modelo (bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk).
- Archivado y búsqueda de grabaciones: conversión masiva de audio histórico a texto indexable, siempre que se gestione el troceado previo de los ficheros largos.
- Accesibilidad: generación de transcripciones y traducciones para personas con discapacidad auditiva en entornos multilingües.
- Análisis de entrevistas o investigación cualitativa: transcripción con `language` fijado al idioma del hablante y salida en el mismo idioma para preservar el original.
- Integración en aplicaciones de escritorio o edge con el runtime loom.cpp: al ser un único GGUF autodescriptivo, el despliegue no requiere ficheros auxiliares de tokenizador o configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta exportación no incluye métricas de WER, BLEU ni comparativas con otros sistemas, y los resultados de búsqueda web obtenidos no aportan datos técnicos sobre el modelo (corresponden a servicios y marcas ajenas al proyecto). Para métricas del modelo base habría que acudir a la model card de `nvidia/canary-1b-v2`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, 973 M de parámetros en fp32 ocuparían unos 3,9 GB (coincidente con el tamaño del repo) y en fp16 unos 1,95 GB; habría que añadir el consumo del runtime y de los búferes de audio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 4-6 GB de VRAM libres sería suficiente para los pesos en precisión completa, y bastantes menos en media precisión.
- GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060 (12 GB), RTX 4070 o RTX 4090. No hay confirmación oficial.
- Despliegue: el soporte documentado es loom.cpp como motor y `loom-py-rt` (extra `hub`) como runtime de Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-ai-org/canary-1b-v2-loom | 973 M | 25 | ASR + traducción de voz | cc-by-4.0 | GGUF para loom.cpp |
| nvidia/canary-1b-v2 (base) | No especificado en la información disponible | 25 | ASR + traducción de voz | No especificada en la información disponible | Modelo original de NVIDIA NeMo |
| Otros modelos ASR comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas como Whisper u otros sistemas ASR. La única comparación documentada es la equivalencia de pesos con el modelo base de NVIDIA.

## Limitaciones y advertencias

- No se trata de un modelo nuevo: es un reempaquetado de `nvidia/canary-1b-v2`; los pesos son idénticos y, por tanto, sus sesgos, alucinaciones y errores de reconocimiento son los del modelo original.
- El idioma del audio no se detecta automáticamente: hay que indicarlo con el parámetro `language`, que por defecto es inglés. Interpretar audio en otro idioma sin especificarlo dará resultados incorrectos.
- El parámetro `target_language` controla el idioma de salida y por defecto es inglés; esto implica que, sin configurarlo, el modelo traduce en lugar de transcribir.
- Los clips superiores a 40 segundos no se fragmentan de forma automática, por lo que el troceado debe implementarlo quien integra el modelo.
- No hay soporte documentado de tool calling, agentes, visión ni otras modalidades fuera del audio.
- La licencia cc-by-4.0 permite uso comercial, pero exige atribución tanto al autor del empaquetado como, previsiblemente, a NVIDIA como titular del modelo base; conviene revisar los términos del modelo original.
- Dependencia fuerte del ecosistema loom.cpp/loom-py: no se documenta compatibilidad con los runners de inferencia más extendidos, lo que dificulta la portabilidad y el soporte en producción.
- El repositorio no registra descargas ni likes y la documentación es mínima; no hay garantías de mantenimiento ni de resolución de incidencias.
- La fecha de creación indicada (2026-10-01) resulta anómala respecto a la información disponible; conviene verificarla en la página del modelo.
- No hay datos de latencia, throughput ni consumo de memoria publicados, por lo que las estimaciones de hardware deben validarse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/canary-1b-v2-loom
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/

Nota: los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo; corresponden a un servicio de grabación de pantalla y a una marca de ropa, sin relación con este proyecto.
