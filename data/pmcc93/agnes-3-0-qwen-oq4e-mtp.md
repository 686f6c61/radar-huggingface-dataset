# pmcc93/Agnes-3.0-Qwen-oQ4e-mtp

## Resumen

Agnes-3.0-Qwen-oQ4e-mtp es una cuantización comunitaria de 4 bits del modelo multimodal Agnes-3.0-Qwen, publicada por el usuario pmcc93 y preparada específicamente para el runtime nativo oMLX sobre Apple Silicon. Agnes-3.0-Qwen es a su vez un derivado post-entrenado de Qwen3.8-Flash-Next, orientado a tareas de imagen-a-texto y conversación con contexto extendido. Este repositorio no contiene entrenamiento nuevo ni una destilación: es un checkpoint cuantizado del modelo original, con los pesos de visión y de MTP (multi-token prediction) preservados.

El checkpoint ocupa 107,67 GB (100,28 GiB) repartidos en 21 shards y 3.748 tensores, con 179.999.981.459 parámetros totales. La cuantización es de precisión mixta (esquema oQ4e, grupo 64 solicitado), calibrada con el dataset interno `oqe_code_multilingual` sobre 1.024 muestras de 512 tokens extraídas directamente de los pesos BF16 originales. El autor lo convirtió y probó en un Apple M5 Ultra con 256 GiB de memoria unificada.

Su relevancia es doble: por un lado, permite ejecutar localmente un modelo de ~180.000 millones de parámetros en hardware Apple Silicon con memoria unificada; por otro, el autor publica un protocolo de evaluación congelado y resultados medidos frente a Qwen3.8-Flash-Next, lo que aporta trazabilidad poco habitual en cuantizaciones comunitarias. El contexto anunciado del modelo base es de 1.048.576 tokens con factor YaRN 4, aunque las pruebas del autor se limitan a 262.144 tokens y entradas cortas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8-Flash-Next (detalles internos no disponibles) |
| Parámetros totales | 179.999.981.459 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens anunciados (factor YaRN 4); pruebas limitadas a 262.144 tokens |
| Tipos de cuantización | oQ4e de precisión mixta, grupo 64 solicitado; tres tensores en 8 bits affine grupo 64 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (21 shards, 3.748 tensores), librería MLX |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Qwen es un derivado post-entrenado de Qwen3.8-Flash-Next, con pipeline image-text-to-text y pesos de visión incorporados (333 tensores de visión en esta cuantización) además de 76 tensores de MTP. La model card no detalla la arquitectura interna del modelo base (tipo de atención, composición del dataset de entrenamiento, uso de RLHF o DPO), por lo que esos datos no están disponibles. El checkpoint cuantizado conserva el tokenizador y la plantilla de chat originales, incluida la instrucción de identidad específica de Agnes.

La innovación técnica de este repositorio está en el proceso de conversión: se usó oMLX 0.7.4.dev1 (build 3628) con calibración `imatrix_strict=false` tras un primer intento fallido que no capturó `language_model.lm_head`. Se aplicaron 888 tensores calibrados; tres entradas ausentes (`language_model.lm_head` y los pesos `input_mix_weight_down` / `input_mix_weight_up` del mezclador de hiperconexión) recibieron cuantización affine de 8 bits con grupo 64. No hubo desajustes de forma. La calibración registra 24 entradas experto/módulo no observadas de 75.264, limitación del proceso de calibración y no del modelo. El MTP está habilitado en la configuración sugerida, aunque una gramática JSON estricta puede omitirlo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de razonamiento configurable (el autor sugiere "medium" y un presupuesto de pensamiento de 3.072 tokens).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con pesos de visión preservados en la cuantización.
- Soporte de tool calling / function calling: las pruebas simuladas de elección de herramienta y argumentos pasaron 8/8, incluyendo límites de solo lectura y recuperación de errores.
- Salida estructurada con esquemas JSON: 8/8 esquemas válidos en las pruebas del autor.
- Multi-token prediction (MTP) para acelerar la decodificación.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Contexto largo anunciado de hasta 1.048.576 tokens mediante YaRN, aunque no validado a esa escala en las pruebas publicadas.
- Parser de razonamiento `qwen_3_5` en la build de oMLX probada.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: con 180.000 millones de parámetros y tool calling validado, puede integrarse en flujos de edición y revisión de código ejecutados íntegramente en un M5 Ultra con 256 GiB, sin depender de la nube.
- Generación de salidas estructuradas: los 8/8 esquemas JSON válidos en las pruebas lo hacen adecuado para extracción de datos, rellenado de formularios o generación de payloads para APIs con validación posterior por parte de la aplicación.
- Automatización de agentes con herramientas simuladas: las pruebas de elección de herramienta, argumentos, límites de solo lectura y recuperación de errores (8/8) respaldan su uso como planificador en pipelines de agentes, siempre con validación externa de las llamadas reales.
- Análisis de documentos e imágenes en contexto largo: la ventana anunciada de más de un millón de tokens (probada hasta 262.144) permite procesar repositorios, expedientes o colecciones de capturas en una sola petición, aunque la calidad de visión no fue evaluada por el autor.
- Tareas auxiliares acotadas ("bounded helper"): el perfil recomendado (temperatura 1.0, top-p 0.95, top-k 20, penalización de repetición 1.05, límite de salida de 4.096 tokens) está pensado para subtareas con alcance definido, donde el modelo consumió un 8,7 % menos de tokens de finalización que Flash en 24 casos llanos.
- Prototipado e investigación en entornos MLX: al ser un checkpoint MLX nativo con scripts de benchmark portables (`benchmarks/benchmark_omlx.py`) y fixtures sintéticos congelados, sirve para reproducir evaluaciones y comparar cuantizaciones en hardware Apple.
- Despliegue con descarga y descarga dinámica de modelos: el autor midió carga en frío de 17,21–21,69 s y descarga nativa hasta cero de asignación de modelo en 3,03–13,29 s, útil para entornos que alternan modelos bajo TTL de inactividad.

## Benchmarks y rendimiento

Resultados medidos por el autor el 12 de noviembre de 2026 en un Apple M5 Ultra con 256 GiB, comparando Agnes-3.0-Qwen-oQ4e-mtp frente a Qwen3.8-Flash-Next:

| Modo | Aciertos Agnes | Aciertos Flash | Tokens de finalización Agnes / Flash | Segundos en caliente Agnes / Flash |
|---|---:|---:|---|---|
| plain | 22/24 | 24/24 | 11.481 / 12.573 | 83,27 / 99,66 |
| schema | 7/8 | 7/8 | 5.611 / 7.955 | 62,26 / 87,06 |
| tools | 8/8 | 8/8 | 388 / 362 | 4,91 / 4,77 |

En los 24 casos llanos, Agnes usó un 8,7 % menos de tokens de finalización y un 16,4 % menos de tiempo de pared en caliente, pero falló dos casos que Flash superó: una carrera de idempotencia asíncrona y el manejo de revisiones y tombstones. Ambos modelos fallaron el caso de idempotencia bajo esquema estricto. La carga en frío fue de 17,21–21,69 s por lote para Agnes y 20,73–21,61 s para Flash, con unos 108,1 GB de asignación de modelo reportada por el servidor en ambos casos. No hubo respuestas truncadas en las puntuaciones. El propio autor concluye que este piloto favorece a Flash en corrección central y no demuestra que Agnes sea un mejor asistente general. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: los pesos suman 107,67 GB (100,28 GiB); se necesita memoria adicional para cachés y buffers del runtime. El autor advierte de no mantener otros modelos grandes residentes durante la comparación.
- Hardware validado: Apple M5 Ultra con 256 GiB de memoria unificada, ejecutando oMLX nativo. No hay datos de funcionamiento en GPUs NVIDIA u otras plataformas.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por tamaño de pesos; requiere memoria unificada de gama alta en Apple Silicon o, en teoría, múltiples aceleradores con memoria agregada suficiente (no probado).
- Despliegue: oMLX nativo (versión probada 0.7.4.dev1, build 3628). La ruta GGUF/Splash no se usó porque la comprobación de familia de Splash rechazó la configuración de contexto extendido de Agnes. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en esta información.
- Latencia y throughput: carga en frío de 17,21–21,69 s por lote; descarga en 3,03–13,29 s; tiempos de pared en caliente de 4,91 s (8 casos de herramientas), 62,26 s (8 casos de esquema) y 83,27 s (24 casos llanos).
- Ajustes recomendados: temperatura 1.0, top-p 0.95, top-k 20, penalización de repetición 1.05, presencia y min-p a 0, esfuerzo de razonamiento medio, presupuesto de pensamiento 3.072 tokens, límite total de salida 4.096, MTP activado, DFlash desactivado, TTL de inactividad de 1 segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el piloto del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Qwen-oQ4e-mtp | 180.000 M | 1.048.576 anunciados (probado 262.144) | 22/24 plain, 7/8 schema, 8/8 tools; 11.481 tokens plain | qwen-community-1.0 | Hugging Face, formato MLX |
| Qwen3.8-Flash-Next | no disponible | no disponible | 24/24 plain, 7/8 schema, 8/8 tools; 12.573 tokens plain | no disponible | Hugging Face (Qwen) |
| Agnes-3.0-Qwen (BF16 original) | no disponible | 1.048.576 anunciados | no disponible | qwen-community-1.0 | Hugging Face (Agnes-AI) |

El modelo base Agnes-3.0-Qwen comparte arquitectura y licencia con este checkpoint, por lo que la comparación relevante es de precisión y huella de memoria, no de capacidades. Frente a Qwen3.8-Flash-Next, el piloto del autor muestra una corrección ligeramente inferior en tareas llanas y un consumo de tokens algo menor.

## Limitaciones y advertencias

- La cuantización no fue evaluada en calidad de visión: el autor indica explícitamente que la calidad de imagen y vídeo no se probó.
- El contexto de un millón de tokens no está validado; las pruebas usan entradas cortas y un tope de 262.144 tokens. Qwen advierte que el YaRN estático puede afectar al rendimiento en contexto corto.
- La calibración dejó 24 entradas experto/módulo sin observar de 75.264 y tres tensores con cuantización de 8 bits en lugar del esquema mixto; son limitaciones del proceso de conversión.
- Riesgo de alucinación y sesgos: no hay documentación específica en la información disponible; se aplican los riesgos habituales de los modelos derivados de Qwen.
- Idiomas: solo inglés y chino están declarados; no hay soporte documentado de castellano.
- Tool calling: las pruebas son simuladas y no ejecutan código ni llamadas reales; la aplicación que controla las herramientas debe validar todas las propuestas.
- Licencia qwen-community-1.0: es necesario revisar el texto de la licencia antes de uso comercial; la model card la etiqueta como "other".
- La plantilla de chat incluye instrucciones de identidad específicas de Agnes que pueden afectar al comportamiento en producción.
- Solo se ha validado en oMLX nativo sobre Apple Silicon; no hay garantías en otras plataformas o runtimes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pmcc93/Agnes-3.0-Qwen-oQ4e-mtp
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen
- Modelo del que deriva Agnes: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime oMLX: https://github.com/jundot/omlx
- Configuración recomendada del modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Qwen#recommended-inference-settings
- Auditoría de conversión: `conversion-audit.json` (en el repositorio)
- Informe de cobertura de calibración: `oq_imatrix_report.json` (en el repositorio)
- Resultados completos del benchmark: `benchmarks/results/summary.json` (en el repositorio)
- Respuestas finales y uso en bruto: `benchmarks/results` (en el repositorio)
- Protocolo congelado: `benchmarks/PROTOCOL.md` (en el repositorio)
- Script de benchmark portable: `benchmarks/benchmark_omlx.py` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
