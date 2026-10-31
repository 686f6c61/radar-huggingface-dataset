# aceflooder/LFM3-1.7B-OT3-2M-GGUF

## Resumen

LFM3-1.7B-OT3-2M-GGUF es un ajuste fino comunitario del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario aceflooder en HuggingFace. El autor ha aplicado LoRA sobre un subconjunto filtrado del dataset OpenThoughts3-1.2M, con el objetivo de dotar de capacidades de razonamiento (reasoning) a un modelo pequeño, y ha exportado el resultado en cuantizaciones estándar GGUF (Q8_0 y Q6_K) para su ejecución local. Todo el proceso de entrenamiento se realizó en un solo Mac (M4 Pro de 24 GB), sin cómputo en la nube de pago, lo que lo convierte en un experimento reproducible y de interés para quien explore el ajuste fino de modelos pequeños en hardware de consumo.

El modelo base, LFM3-1.7B de LiquidAI, pertenece a la familia de modelos LFM (Liquid Foundation Models) y tiene 1.728.801.600 parámetros. El fine-tuning se centró en tareas de razonamiento matemático y científico mediante datos de OpenThoughts3, un dataset de trazas de razonamiento. La relevancia de esta release está en su enfoque experimental y transparente: el autor publica mediciones de calidad, tamaño y velocidad con intervalos de incertidumbre, y advierte explícitamente de que la mejora observada sobre el modelo original no es estadísticamente concluyente.

Se trata de una release experimental con cero descargas en el momento de la ficha, orientada a desarrolladores con Apple Silicon o hardware similar que quieran probar un modelo de razonamiento ligero en local con llama.cpp. No es un modelo de producción: el propio autor recomienda evaluación independiente antes de asumir mejoras generales de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, arquitectura no detallada en la model card) |
| Parametros totales | 1.728.801.600 (dato real del safetensors del repo) |
| Parametros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | Entrenado con ventanas de 2.048 tokens; el ejemplo de servicio usa 4.096 tokens (sin evaluación de calidad en contexto largo) |
| Tipos de cuantizacion | Q8_0 (recomendada, 1,846 GB), Q6_K (1,428 GB); también se han medido Q4_K_M (1,100 GB, con degradación notable) |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (licencia "other", heredada del modelo base de LiquidAI) |
| Formato de pesos | GGUF (Q8_0 y Q6_K) y adaptador PEFT LoRA nativo (0,066 GB); el repo también incluye safetensors según los tags |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de la familia LFM de LiquidAI. La model card no detalla la arquitectura interna exacta (transformer estándar, híbrido u otra variante), por lo que ese dato no está disponible en la información proporcionada. Lo que sí se documenta es el proceso de ajuste fino: se aplicó LoRA sobre el modelo base, se entrenó con un subconjunto filtrado de OpenThoughts3-1.2M (un dataset de trazas de razonamiento generado por la comunidad Open Thoughts, centrado en matemáticas, ciencia y código), usando ventanas de 2.048 tokens.

Tras el entrenamiento, el adaptador LoRA se fusionó (merge) en un modelo F16 completo y de ahí se exportaron cuantizaciones GGUF estándar. El autor también experimentó con métodos de exportación GSQ/RCO, que no tuvieron éxito y no se usan en los archivos publicados. El entrenamiento se ejecutó íntegramente en un Mac M4 Pro con 24 GB de memoria unificada, sin cómputo en la nube, lo que convierte la release en un ejemplo documentado de fine-tuning local de bajo coste. No hay información sobre RLHF/DPO adicionales más allá de los datos de razonamiento de OpenThoughts3.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, con chat template incluido en el GGUF).
- Razonamiento (reasoning): el modelo genera trazas de razonamiento con marcadores `<think>...</think>` heredados del entrenamiento con OpenThoughts3. El autor advierte que el flag `--reasoning off` de llama.cpp no suprime de forma fiable el razonamiento en este checkpoint.
- Resolución de problemas matemáticos: mejoró en la pantalla de GSM8K (de 26/32 a 30/32 en F16 entrenado frente al original).
- Razonamiento científico/general: evaluado con ARC-Challenge (22-23/32 en las variantes entrenadas).
- Seguimiento de instrucciones con salida estructurada: sondas propias de JSON/exact-text (6/8), aunque no son resultados oficiales de IFEval.
- Ejecución local eficiente: optimizado para llama.cpp en Apple Silicon, con hasta ~100 tokens/s de decodificación en Q8_0 sobre un M4 Pro.
- No hay información sobre tool calling, function calling, agentes, visión ni audio; no está disponible.

## Casos de uso

- Experimentación con fine-tuning reproducible: el repo incluye el adaptador LoRA nativo (0,066 GB), las semillas, el protocolo de evaluación y los hashes SHA-256, ideal para reproducir o continuar el experimento de razonamiento en modelos pequeños.
- Razonamiento matemático ligero en local: gracias al entrenamiento con OpenThoughts3, puede resolver problemas tipo GSM8K en un portátil o Mac sin GPU dedicada, útil para prototipos de tutores o asistentes de matemáticas.
- Despliegue en Apple Silicon: el modelo está medido y documentado específicamente sobre un M4 Pro de 24 GB, alcanzando ~100 tokens/s en Q8_0, adecuado para aplicaciones locales de chat en Mac.
- Servidor de inferencia local con API: se puede levantar con `llama-server` en el puerto 8080 con interfaz de chat incluida, útil para integrar un LLM pequeño en aplicaciones locales vía HTTP.
- Prototipado de agentes de razonamiento de bajo coste: su tamaño de 1,7B permite ejecutar múltiples instancias o cadenas de razonamiento en hardware modesto, aunque sin soporte documentado de tool calling.
- Investigación sobre cuantización: la model card publica una comparativa medida de Q4_K_M, Q6_K y Q8_0 frente a F16 en calidad y velocidad, útil como caso de estudio de trade-offs de cuantización en modelos pequeños.
- Generación de texto en inglés con salida estructurada: las sondas de JSON estricto sugieren utilidad para tareas de extracción o formateo de datos simples, con la cautela de que son pruebas del propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, etc.) en la información disponible. El autor sí publicó una pantalla de regresión propia (72 casos: 32 de ARC-Challenge, 32 de GSM8K y 8 sondas de instrucciones propias, con temperatura 0 y semilla fija). Estos no son protocolos oficiales y la mejora del modelo entrenado tiene un intervalo de incertidumbre que incluye el cero:

| Variante | GB | ARC /32 | Math /32 | Custom /8 | Total /72 | Decode tok/s |
|---|---:|---:|---:|---:|---:|---:|
| Original F16 | 3,467 | 22 | 26 | 6 | 54 | 63,0 ± 2,4 |
| Entrenado F16 | 3,467 | 22 | 30 | 6 | 58 | 63,3 ± 2,3 |
| Entrenado Q8_0 | 1,846 | 23 | 29 | 6 | 58 | 99,8 ± 9,1 |
| Entrenado Q6_K | 1,428 | 23 | 27 | 6 | 56 | 107,6 ± 12,4 |
| Original Q4_K_M | 1,100 | 19 | 26 | 5 | 50 | 132,7 ± 15,9 |
| Entrenado Q4_K_M | 1,100 | 21 | 13 | 4 | 38 | 134,2 ± 15,4 |

Notas del autor: la mejora del F16 entrenado (+5,56 puntos porcentuales) tiene un intervalo bootstrap pareado del 95% de −2,78 a +13,89 pp. La Q4_K_M del modelo entrenado degrada severamente las matemáticas (26/32 a 13/32), por lo que se desaconseja. Velocidades medidas con pp512/tg512 en llama.cpp sobre un M4 Pro (14 núcleos CPU / 20 GPU, 24 GB), con ruido de fondo y deriva temporal no controlados.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el archivo Q8_0 ocupa 1,846 GB en disco; la memoria en ejecución añade el estado de contexto/KV y overhead de la aplicación (no cuantificado). Con contexto de 4.096 tokens y KV en F16, el requisito total sigue siendo modesto, del orden de 2-3 GB.
- Hardware de referencia: Apple M4 Pro (14 núcleos CPU / 20 núcleos GPU, 24 GB de memoria unificada), donde se midieron ~99,8 tokens/s en Q8_0 y ~63,3 tokens/s en F16.
- Consumer GPU: dado el tamaño (1,7B), cabe con holgura en GPUs de consumo habituales (por ejemplo, una RTX 3060 de 12 GB o superior, o cualquier GPU con 4 GB de VRAM libres aproximadamente); no hay mediciones específicas en estas GPUs.
- CPU: al ser un modelo de 1,7B, es viable la inferencia solo por CPU en equipos modernos; no hay mediciones publicadas.
- Despliegue: probado con llama.cpp stock (build b11960, commit `8642541b255bfb5dc39cd351a178be09013a55d6`); se requiere un runtime con soporte de la arquitectura LFM3, por lo que versiones antiguas de GGUF pueden no cargarlo. No hay información sobre compatibilidad con vLLM, TGI u Ollama; no disponible.
- Latencia y throughput: decodificación media de 99,8 ± 9,1 tokens/s (Q8_0) y 107,6 ± 12,4 tokens/s (Q6_K) en el hardware de referencia; se trata de una medida sintética de decodificación, no de latencia de chat real.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-OT3-2M-GGUF | 1,73B | GGUF (Q8_0, Q6_K), LoRA | Sí (trazas `<think>`, entrenado con OpenThoughts3) | lfm1.0 (other) | HuggingFace, 0 descargas, experimental |
| LiquidAI/LFM3-1.7B (base) | 1,73B | safetensors | Según el modelo base (no detallado aquí) | lfm1.0 (other) | HuggingFace, modelo oficial de LiquidAI |
| Qwen2.5-1.5B-Instruct | 1,54B | safetensors, GGUF (comunitario) | No nativo (existe variante QwQ de mayor tamaño) | Licencia Qwen (uso comercial permitido con condiciones) | Ampliamente disponible, ecosistema maduro |
| SmolLM2-1.7B-Instruct | 1,71B | safetensors, GGUF (comunitario) | No nativo | Apache 2.0 | Ampliamente disponible, modelo de HuggingFace |

Comparación orientativa: frente a alternativas de tamaño similar como Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct, este checkpoint ofrece razonamiento nativo con trazas de pensamiento a costa de ser una release experimental sin evaluación independiente, en inglés únicamente y con una licencia (lfm1.0) menos permisiva que Apache 2.0. No hay benchmarks oficiales comparables publicados para esta release, por lo que la comparación de rendimiento es no disponible.

## Limitaciones y advertencias

- Evidencia experimental limitada: la pantalla de calidad es de solo 72 casos, reutilizada para elegir la precisión de exportación; el intervalo de confianza de la mejora incluye el cero, por lo que no se puede afirmar una mejora general de capacidad.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 1,7B ajustado con trazas de razonamiento, debe asumirse un riesgo elevado en tareas de conocimiento factual, especialmente fuera del dominio matemático/científico.
- Razonamiento no suprimible de forma fiable: el flag `--reasoning off` de llama.cpp no garantiza salida solo de respuesta final; el grador necesita leer el texto tras el último `</think>` y rechazar razonamientos incompletos.
- Contexto corto: entrenado con ventanas de 2.048 tokens; el contexto de servicio de 4.096 tokens no ha recibido evaluación de calidad en contexto largo. No apto para documentos extensos.
- Solo inglés: el modelo está etiquetado únicamente para inglés; no hay soporte documentado de castellano u otros idiomas.
- Cuantización agresiva degradante: la Q4_K_M del modelo entrenado cae de 58/72 a 38/72 (con colapso en matemáticas, 13/32); usar solo Q8_0 o Q6_K.
- Licencia restrictiva: usa la licencia lfm1.0 ("other") heredada de LiquidAI, no una licencia estándar permisiva; revisar los términos de la licencia antes de cualquier uso comercial.
- Sesgos: no documentados; no disponible información específica sobre sesgos conocidos.
- Mediciones de velocidad dependientes del hardware: los tokens/s publicados son observaciones en una máquina concreta (M4 Pro) con ruido de fondo y deriva temporal, no especificaciones de dispositivo.
- Compatibilidad de runtimes: requiere llama.cpp con soporte LFM3; aplicaciones GGUF antiguas pueden no cargar la arquitectura.
- Adopción nula: 0 descargas y 1 like en el momento de la ficha, sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aceflooder/LFM3-1.7B-OT3-2M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Archivo Q8_0 (descarga directa): https://huggingface.co/aceflooder/LFM3-1.7B-OT3-2M-GGUF/resolve/main/LFM3-1.7B-OT3-2M-Q8_0.gguf?download=true
- Archivo Q6_K (descarga directa): https://huggingface.co/aceflooder/LFM3-1.7B-OT3-2M-GGUF/resolve/main/LFM3-1.7B-OT3-2M-Q6_K.gguf?download=true
- Adaptador PEFT LoRA: https://huggingface.co/aceflooder/LFM3-1.7B-OT3-2M-GGUF/tree/main/adapter
- Manifiesto de integridad SHA256SUMS: https://huggingface.co/aceflooder/LFM3-1.7B-OT3-2M-GGUF/blob/main/SHA256SUMS
- llama.cpp (build usado en las pruebas): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Paper, demo y blog del autor: no disponible
