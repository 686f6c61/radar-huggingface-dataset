# cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF

## Resumen
Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF es una cuantización GGUF del modelo Qwen3.8-27B, publicada por el usuario cmod, construida sobre la versión "abliterated" y "uncensored" de 0bserverx. El modelo base es un transformer denso de 27B parámetros (26.090.566.656 parámetros reales según safetensors) derivado de la familia Qwen3.8, al que se le ha aplicado un proceso de abliteration para eliminar los rechazos sistemáticos y se le ha reducido el vocabulario a un conjunto ASCII de 128.190 tokens (frente a los 248.320 originales).

La innovación principal de esta ficha no es el modelo en sí, sino el empaquetado: el autor combina los pesos UD-Q3_K_XL (Dynamic 3.1) de Unsloth con las 60 matrices modificadas por la abliteration, aplica la reducción de vocabulario ASCII y añade decodificación especulativa por n-gramas. Según las mediciones del autor en una RTX 5080 de 16 GB, esto permite ejecutar una ventana de contexto de 131.072 tokens con el modelo y la caché KV completamente en la tarjeta, con velocidades de hasta 111 tok/s en código a 114K de profundidad y cero rechazos directos en 100 prompts de prueba.

Es relevante ahora porque demuestra que es posible mantener un contexto largo real (más de 100K tokens) en hardware de consumo de 16 GB mediante una combinación agresiva de cuantización dinámica, poda de vocabulario y decodificación especulativa sin coste adicional de VRAM. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con cabeza MTP opcional para decodificación especulativa |
| Parámetros totales | 26.090.566.656 (26,09B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (perfil long); 90.112 (perfil fast); 73.728 (perfil quality) |
| Tipos de cuantización | Q3_K_XL (Dynamic 3.1 de Unsloth) con imatrix; variante adicional IQ4_NL-MTP de 14,55 GiB |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer denso de la familia Qwen3.8 con 26,09B parámetros. Sobre él se aplicó un proceso de abliteration (identificación y supresión de la dirección de activación asociada a los rechazos) que dio lugar al modelo base 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored. Esta cuantización concreta parte de los pesos UD-Q3_K_XL (Dynamic 3.1) de Unsloth, sustituye las 60 matrices afectadas por la abliteration y conserva el resto de tensores de Unsloth byte a byte. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Las innovaciones técnicas del empaquetado son tres. Primera, la poda del vocabulario de 248.320 a 128.190 tokens mediante un conjunto ASCII, que libera espacio suficiente para los últimos 11K tokens de ventana; según el autor, el inglés y el código tokenizan exactamente igual que antes, y las distribuciones next-token ASCII se mantienen idénticas (top-20 idénticos en 37/37 comprobaciones, con diferencias de log-probabilidad inferiores a 8e-7). Segunda, la decodificación especulativa por n-gramas (`--spec-type ngram-mod`), que no consume VRAM adicional y triplica aproximadamente la velocidad en código a gran profundidad de contexto. Tercera, la posibilidad de usar la cabeza MTP propia del modelo (`blk.64.*`) como drafter en el perfil fast, que es el único que acelera prosa nueva (unas 2×) a cambio de unos 950 MiB de ventana.

## Capacidades
- Generación de texto conversacional en inglés con modo de pensamiento (thinking) activado por defecto; se puede desactivar por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código, con velocidades especialmente altas en contexto profundo gracias a la decodificación especulativa por n-gramas.
- Contexto largo real: 131.072 tokens con modelo y caché KV en una GPU de 16 GB; el autor reporta 80/80 hechos recordados a 115K de profundidad.
- Comportamiento "abliterated/uncensored": cero rechazos directos en 100 prompts de los conjuntos de prueba del autor (aunque aproximadamente la mitad de las respuestas abren con advertencias que los clasificadores cuentan como rechazo).
- Compatibilidad con llama.cpp y endpoints compatibles (`endpoints_compatible` en los tags).
- Decodificación especulativa con n-gramas y con cabeza MTP (perfil fast).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso
- Asistente de código con contexto de repositorio completo: con 131K tokens de ventana y 111 tok/s en código a 114K de profundidad, se puede cargar un repositorio mediano o varios ficheros grandes en el contexto y mantener conversaciones de refactorización sin recortar.
- Análisis de documentos largos en local: informes, contratos o expedientes de decenas de miles de tokens que caben íntegros en la ventana, ejecutados en una única GPU de 16 GB sin depender de la nube.
- Despliegue en estaciones de trabajo con RTX 5080 o similar: el perfil long por defecto permite servir un asistente conversacional con contexto largo en hardware de consumo, usando llama-server con los flags documentados.
- Generación de código en pipelines internos: la velocidad en código (hasta 465 tok/s en prompts cortos con drafting) y la compatibilidad con endpoints lo hacen apto para tareas de autocompletado o generación por lotes en entornos controlados.
- Investigación sobre alineación y abliteration: el repositorio incluye la abliteration como LoRA F16 (`Qwen3.8-27B-Heretic-ablation-LoRA-F16.gguf`, 263 MiB) y registros de medición en `recipe/`, lo que permite reproducir y comparar el efecto de la abliteration sobre la fidelidad (KLD) y las tasas de rechazo.
- Evaluación de cuantizaciones dinámicas: los datos de KLD frente a Q8_0 (0,0898 ± 0,0015 para este fichero frente a 0,0835 del stock de Unsloth) sirven como referencia para estudiar el coste de fidelidad de Q3_K_XL con matrices injertadas.
- Despliegue en tarjetas de 24 GB tipo P40: la variante IQ4_NL-MTP de 14,55 GiB con cabeza MTP está pensada específicamente para esa clase de hardware.

## Benchmarks y rendimiento
Los datos disponibles son mediciones del autor, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K no están publicados en la información proporcionada).

| Métrica | Este fichero | Unsloth 3.1 (stock) | Abliterated Q8_0 | Referencia |
|---|---|---|---|---|
| KLD media vs Q8_0 propio | 0,0898 ± 0,0015 | 0,0835 ± 0,0014 | — | — |
| Percentil 99 KLD | 1,594 | 1,521 | — | — |
| Mismo token top-1 | 91,62% | 91,75% | — | — |
| Perplejidad | 3,848 | 3,801 | — | — |
| Rechazos (mlabonne, keywords/frases/clasificador, por 100) | 53 / 0 / 44 | 100 / 100 / 99 | 55 / 0 / 46 | Base Q8_0: 100 / 100 / 98 |
| Rechazos (JBB refusal, por 100) | 46 / 1 / 41 | 96 / 94 / 96 | 46 / 1 / 46 | — |
| Rechazos (JBB benign, por 100) | 7 / 0 / 9 | 38 / 30 / 38 | 7 / 1 / 11 | — |

| Perfil | Ventana | Código tok/s en profundidad | Prosa tok/s | Flags adicionales |
|---|---|---|---|---|
| long (por defecto) | 131.072 | 111 a 115K | 59 | `--spec-type ngram-mod` |
| fast | 90.112 | 150 a 79K | 113 | `--spec-type draft-mtp,ngram-mod -ctkd q4_0 -ctvd q4_0` |
| quality | 73.728 | 137 a 65K | 59 | `-ctk q8_0 -ctv q8_0` |

El autor reporta además 80/80 hechos recordados a 115K de profundidad y cero rechazos directos en 100 prompts. Las pruebas de McNemar indican que la cuantización conserva la abliteration (p = 1,00 / 1,00 / 0,30 frente al modelo abliterated de precisión completa). Todas las mediciones se realizaron en una RTX 5080 de 16 GB.

## Requisitos de hardware
- VRAM estimada: el fichero principal pesa 11,60 GiB; con caché KV q4_0, cada 16K de ventana cuesta 288 MiB. El perfil long de 131.072 tokens cabe en 16 GB; el perfil fast consume unos 950 MiB adicionales de ventana por la cabeza MTP.
- GPU recomendadas: RTX 5080 de 16 GB (hardware de referencia del autor). La variante IQ4_NL-MTP de 14,55 GiB está pensada para tarjetas de 24 GB tipo P40. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en una RTX 5080 de 16 GB con el perfil long; el autor advierte que si la tarjeta también mueve el escritorio conviene usar `-c 112640` para dejar margen.
- Opciones de despliegue: llama.cpp (llama-server), con los flags documentados (`-ngl 99 -fa on -ctk q4_0 -ctv q4_0 -ub 128 -b 512 -np 1 -ot 'token_embd\.weight=CPU' --spec-type ngram-mod`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 111 tok/s en código a 115K de profundidad, 465 tok/s en código con prompt corto, 59 tok/s en prosa (perfil long); 150 tok/s en código a 79K y 113 tok/s en prosa (perfil fast); 137 tok/s en código a 65K (perfil quality).
- Nota de compilación: el autor advierte de un posible `cudaMalloc failed: out of memory` con memoria libre, porque llama.cpp estándar asigna los pesos como un bloque de 11 GiB; proporciona dos parches en `recipe/tools/`.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este fichero (cmod) | 26,09B | 131.072 | Apache 2.0 | GGUF Q3_K_XL | Abliterated, vocabulario ASCII, n-gram drafting |
| Unsloth UD-Q3_K_XL (stock) | 26,09B | Limitado por VRAM (sin poda de vocabulario) | Apache 2.0 | GGUF Q3_K_XL | Sin abliteration; 100/100/99 rechazos en mlabonne |
| Abliterated Q8_0 (0bserverx) | 26,09B | No disponible | Apache 2.0 | safetensors/GGUF | Referencia de fidelidad; 55/0/46 rechazos en mlabonne |
| Variante IQ4_NL-MTP (mismo autor) | 26,09B | No disponible | Apache 2.0 | GGUF IQ4_NL | 14,55 GiB, con MTP, para tarjetas de 24 GB |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a fidelidad, rechazos, contexto alcanzable y requisitos de hardware.

## Limitaciones y advertencias
- Modelo "abliterated/uncensored": elimina deliberadamente los rechazos, lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado sin filtros. No es apto para aplicaciones de cara al público sin moderación adicional.
- La abliteration no es perfecta: aproximadamente la mitad de las respuestas en los conjuntos de rechazo abren con advertencias, y las tasas de rechazo varían según el clasificador empleado (53/0/44 en mlabonne).
- El idioma declarado es únicamente inglés; no hay evidencia de capacidades multilingües y el vocabulario ASCII podría degradar idiomas no ingleses.
- Riesgo de alucinación inherente a los modelos de 27B; el autor reporta 80/80 hechos recordados a 115K, pero esto no elimina el riesgo general.
- Fidelidad ligeramente inferior al stock: KLD de 0,0898 frente a 0,0835 de Unsloth 3.1, un 7% más lejos de su referencia, por el redondeo estándar de llama.cpp en los 60 tensores injertados.
- La poda de vocabulario, aunque el autor demuestra equivalencia en ASCII (top-20 idénticos, diferencias < 8e-7), no está verificada de forma independiente.
- Requiere compilaciones parcheadas de llama.cpp en algunos entornos con escritorio activo; sin los parches de `recipe/tools/` puede fallar la asignación de VRAM.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede incumplir políticas de plataforma o legislación según el contexto de uso.
- Fecha de creación declarada en 2026-11-13; verificar la vigencia de los enlaces y artefactos antes de usarlo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Refusal-Classifier: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Registros de construcción y medición: carpeta `recipe/` del repositorio (incluye `recipe/tools/` con parches)
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
