# Prateek-Tiwari10/hinglish-to-devanagari-61m

## Resumen

Hinglish → Devanagari, 61M es un modelo de transliteración entrenado desde cero que convierte texto hindi escrito con alfabeto latino (hinglish) a escritura devanagari. Lo desarrolla Prateek-Tiwari10 y se publica en Hugging Face como un checkpoint de 61.169.280 parámetros en formato safetensors. Resuelve un problema muy concreto y frecuente en el ecosistema hindi: la mayoría de usuarios escribe en latín por comodidad del teclado, pero los sistemas de procesamiento de lenguaje natural, los motores de búsqueda y los corpus lingüísticos requieren devanagari.

El modelo es un decoder de estilo LLaMA de 61M de parámetros, preentrenado desde cero sobre 1.940 millones de tokens de hindi limpio y posteriormente ajustado sobre 600.000 pares sintéticos hinglish → devanagari. No es un modelo de propósito general ni un modelo conversacional: el ajuste fino eliminó la capacidad de generar hindi plano del modelo base, por lo que su única función es la transliteración.

Su relevancia radica en el rendimiento: obtiene un CER de 0,058 en el conjunto de test completo de Dakshina (5.000 frases) y 0,062 en la parte limpia (1.247 frases no vistas en preentrenamiento), frente a 0,213 de una línea base de búsqueda por palabra. Además, funciona en CPU a 286 ms por frase de chat en un solo hilo, lo que lo hace desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo LLaMA (transformer causal), entrenado desde cero |
| Parametros totales | 61.169.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; las entradas de más de 160 caracteres se dividen por frases y palabras |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 |
| Idiomas soportados | hi (hindi); entrada en hinglish (hindi romanizado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32, embeddings atados) |
| Tokenizer | SentencePiece unigram `hi_unigram_10240.model` + `tokenizer_ext.json` (extensión latina, un token por carácter) |
| Tamano del repositorio | 0,2 GB |
| Framework de carga | no es un modelo `transformers`; requiere `finetune/translit.py` del repositorio GitHub |

## Arquitectura y entrenamiento

El modelo es un decoder transformer causal de 61M de parámetros con embeddings atados, preentrenado desde cero sobre 1.940 millones de tokens de hindi limpio. Posteriormente se ajustó de forma supervisada sobre 600.000 pares sintéticos de hinglish → devanagari, generados romanizando frases hindi propias con un generador que utiliza grafías atestiguadas por humanos.

La innovación principal está en el tratamiento del tokenizer: los fragmentos hindi del tokenizer original se mantienen intactos, la entrada latina se tokeniza a razón de un token por carácter y la salida se enmascara para permitir únicamente piezas devanagari. Esto restringe el espacio de decodificación y reduce errores de mezcla de alfabetos. La decodificación es greedy con caché KV. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre pares paralelos.

## Capacidades

- Transliteración de hinglish (hindi en alfabeto latino) a devanagari, con normalización NFC y nukta ignorado en la evaluación.
- Resolución de palabras ambiguas: el modelo acierta el 84,3% de 10.436 ocurrencias de 649 palabras romanizadas ambiguas (por ejemplo *ki* → कि/की, *main* → मैं/में), frente al 78,5% de la línea base de búsqueda por palabra.
- Segmentación automática de entradas largas: los textos de más de 160 caracteres se dividen en límites de frase y, si es necesario, de palabra, y se transliteran por partes.
- Inferencia en CPU: 286 ms de mediana por frase de chat en un solo hilo (p95 de 407 ms).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento.
- No conserva capacidad de generación de hindi plano ni de texto libre (el ajuste fino la eliminó).

## Casos de uso

- Normalización de corpus de redes sociales: convertir comentarios y publicaciones en hinglish a devanagari antes de indexarlos en un motor de búsqueda o de alimentar un pipeline de NLP hindi, gracias a su CER de 0,058 en Dakshina.
- Preprocesado para modelos de lenguaje hindi: los textos escritos en latín por los usuarios se transliteran a devanagari antes de pasarlos a un LLM o a un sistema de análisis morfológico que espera esa escritura.
- Teclados y correctores ortográficos: integración en un IME o en un corrector que ofrezca la forma devanagari de lo que el usuario escribe en latín, con latencia de 286 ms en CPU por frase.
- Transcripción de conversaciones de chat: el conjunto privado de chat alcanza un CER de 0,040 y un 58,9% de coincidencia exacta, adecuado para normalizar historiales de mensajería.
- Enriquecimiento de datasets para investigación lingüística: transliterar automáticamente grandes volúmenes de texto hinglish a devanagari para construir corpus paralelos, dado que el modelo cabe en 0,2 GB y corre sin GPU.
- Despliegue en dispositivos sin GPU: al ejecutarse en un solo hilo de CPU con 61M de parámetros, puede embeberse en servicios de backend modestos o en aplicaciones de escritorio para transliteración local.

## Benchmarks y rendimiento

Evaluación sobre conjuntos de test retenidos, puntuación normalizada (NFC, nukta ignorado, `।` final ignorado), intervalo de confianza bootstrap del 95% sobre frases.

| Conjunto de test | n | CER [IC 95%] | WER | Exact match | CER bruto |
|---|---|---|---|---|---|
| Dakshina test, completo | 5.000 | 0,058 [0,056; 0,060] | 0,164 | 0,170 | 0,060 |
| Dakshina test, limpio (no en preentrenamiento) | 1.247 | 0,062 [0,058; 0,066] | 0,182 | 0,157 | 0,064 |
| Frases de chat (conjunto privado) | 180 | 0,040 [0,029; 0,055] | 0,109 | 0,589 | 0,076 |
| Línea base búsqueda por palabra, Dakshina completo | 5.000 | 0,213 [0,208; 0,217] | 0,226 | 0,083 | 0,212 |
| Línea base búsqueda por palabra, chat | 180 | 0,126 [0,103; 0,150] | 0,174 | 0,356 | 0,129 |

## Requisitos de hardware

- VRAM estimada: el checkpoint en fp32 ocupa aproximadamente 0,24 GB (61,2M de parámetros × 4 bytes), por lo que cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de dispositivos integrados.
- GPU recomendadas: no se requiere GPU; cualquier GPU con más de 1 GB de VRAM es suficiente. No hay datos de throughput en GPU.
- CPU: 286 ms de mediana por frase de chat en un solo hilo (p95 de 407 ms), decodificación greedy con caché KV.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo `transformers`; se carga mediante `finetune/translit.py` del repositorio GitHub con PyTorch, SentencePiece y safetensors.
- Dependencias: `torch`, `sentencepiece`, `safetensors`, `huggingface_hub`, `pyyaml`, `numpy`.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de transliteración hinglish → devanagari en la información proporcionada. La única referencia comparable documentada es la línea base de búsqueda por palabra del propio autor:

| Modelo | Parámetros | CER Dakshina completo | CER chat | Despliegue | Licencia |
|---|---|---|---|---|---|
| Hinglish → Devanagari 61M | 61,2M | 0,058 | 0,040 | CPU / GPU, script propio | no disponible |
| Línea base búsqueda por palabra | no aplica | 0,213 | 0,126 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo translitera: el ajuste fino eliminó la capacidad de hindi plano del modelo base (la pérdida de lenguaje en texto hindi retenido subió de 2,79 a 8,75). No debe usarse para generación de texto.
- Errores típicos en nombres poco frecuentes, en la distinción singular/plural (है/हैं) y en entradas con faltas de ortografía graves.
- Los pares de entrenamiento son sintéticos, generados por romanización automática de frases hindi propias; las entradas de test son escritas por humanos, lo que introduce una diferencia de distribución.
- Contaminación del test: aproximadamente el 75% de las frases del test de Dakshina aparecen en el texto de preentrenamiento (solo el lado devanagari), por lo que los resultados también se reportan sobre la parte limpia (CER 0,062).
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No es un modelo `transformers`; la integración requiere el script del repositorio GitHub, lo que limita su uso con herramientas estándar del ecosistema.
- Longitud de contexto no documentada; las entradas largas se truncan y dividen de forma heurística a 160 caracteres.
- Sin datos publicados sobre sesgos más allá de los errores de transliteración descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prateek-Tiwari10/hinglish-to-devanagari-61m
- Repositorio GitHub (código, pipeline de datos, logs de entrenamiento y evaluación): https://github.com/Prateek-Tiwari10/HINDI_SLM
- Conjunto de evaluación Dakshina: no disponible en la información proporcionada
