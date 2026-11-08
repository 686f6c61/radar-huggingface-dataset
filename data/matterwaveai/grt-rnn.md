# MatterWaveAI/grt-rnn

## Resumen

GRT-RNN (`MatterWaveAI/grt-rnn`) es un modelo de generación de texto desarrollado por MatterWaveAI que implementa una arquitectura de recurrencia rotacional pura, descrita por el autor como Rotational-RNN, Unitary-GRU o Rotational-minGRU. Se presenta como un modelo base de tipo world model con aproximadamente 46,1 millones de parámetros almacenados y una capacidad equivalente densa de unos 115 millones, sin matrices lineales densas ni capas convolucionales 1D o 2D. Deriva del modelo `MatterWaveAI/grt-30m` mediante fine-tuning.

El modelo aborda dos problemas clásicos de las RNN convencionales (LSTM, GRU, Elman): la desaparición y explosión de gradientes en horizontes largos, causada por matrices de transición densas no restringidas, y el cuello de botella del entrenamiento secuencial. GRT-RNN propone una recurrencia ortogonal con determinante +1 que preserva la norma del estado, combinando un modo de entrenamiento paralelo tipo minGRU con un modo no lineal acoplado al estado (Unitary-GRU).

Es relevante por su propuesta de inferencia con memoria y cómputo constantes por token (sin KV cache), lo que lo sitúa como alternativa a la atención cuadrática para secuencias largas. No obstante, en el momento de la publicación de esta ficha los pesos, el código y los detalles de implementación están retenidos según el ciclo de publicación escalonado del autor, y el modelo no cuenta con descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN rotacional pura (Rotational-RNN / Unitary-GRU / Rotational-minGRU), sin matrices lineales densas ni convoluciones |
| Parametros totales | ~46,1 M almacenados (~115 M de capacidad equivalente densa, según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como límite declarado; el autor reporta experimentos hasta T = 8.192 y más |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicación) |

## Arquitectura y entrenamiento

La arquitectura sustituye las matrices densas de entrada, estado-oculto y compuertas de reset/update de las celdas GRU/minGRU por cascadas de rotaciones ortogonales con determinante +1. El autor reporta dos modos operativos: un modo minGRU geodésico paralelo, entrenable mediante prefix scan paralelo con una paridad numérica inferior a 3,82e-6 frente a la recurrencia paso a paso, y un modo Unitary-GRU no lineal en el que las compuertas dependen del estado oculto vivo, lo que permite seguimiento de autómatas de estados finitos no abelianos manteniendo det = +1,000000. También existe un modo híbrido RNN + atención rotacional.

El autor afirma que la ortogonalidad estricta elimina por construcción la desaparición y explosión de gradientes: la deriva de magnitud del estado homogéneo es inferior a 5,0e-7 en float32 sobre más de 1.000 pasos recursivos y de 9,55e-15 en float64 a T = 8.192. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Los pesos, el código fuente y los detalles de implementación están retenidos.

## Capacidades

- Generación de texto como tarea principal declarada (pipeline `text-generation`).
- Recurrencia con memoria y cómputo O(1) por token: estado fijo de 3,0 KB y 0 bytes de KV cache en modo RNN puro.
- Inferencia sobre secuencias arbitrariamente largas (el autor reporta T de 128 a 8.192 y más) sin crecimiento de memoria.
- Modelo del mundo latente (S1-GRT-RNN): evolución de estados latentes en horizontes de acción de 1 a 10 o más pasos sin decodificación intermedia de tokens.
- Modo híbrido RNN + atención rotacional con reducción del 66,7 % de KV cache y recall asociativo tipo needle-in-haystack.
- Retención de rango efectivo del estado recurrente superior o igual al 96,2 % sin negativos contrastivos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Procesamiento de secuencias muy largas en streaming: el estado fijo de 3,0 KB y la ausencia de KV cache permiten procesar flujos continuos de tokens sin crecimiento de memoria, adecuado para monitorización de logs o telemetría en tiempo real.
- Modelado de dinámicas de sistemas: el modo world model (S1-GRT-RNN) puede usarse para predecir la evolución de estados latentes en simulaciones de control o robótica con horizontes de 10 o más pasos.
- Evaluación de trayectorias en O(1): el autor describe el modelo como juez de trayectorias con memoria constante, aplicable a la verificación de secuencias de acciones en pipelines de agentes.
- Prototipado de investigación en RNN unitarias: al ser un modelo base pequeño (~46 M de parámetros), sirve para estudiar recurrencia ortogonal y estabilidad de gradientes en entornos con recursos limitados.
- Recuperación asociativa en documentos largos: el modo híbrido con atención rotacional está orientado a tareas de needle-in-haystack con menor huella de memoria que la atención cuadrática.
- Experimentos de seguimiento de autómatas y máquinas de estados: el modo Unitary-GRU no lineal acoplado al estado permite modelar transiciones dependientes de la historia, útil en parsing o verificación de protocolos.
- Fine-tuning sobre el modelo base `grt-30m`: al estar publicado con licencia Apache 2.0, puede servir como punto de partida para tareas de generación de texto de dominio específico, siempre que los pesos estén finalmente disponibles.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la verificación `XL-smol`:

| Invariante / benchmark | Objetivo | Resultado GRT-RNN | Estado |
|---|---|---|---|
| Capas lineales densas / conv 1D / conv 2D | 0 / 0 / 0 | 0 / 0 / 0 (100 % ortogonal) | PASS |
| Paridad prefix scan paralelo vs. paso O(1) | < 1e-5 | 3,81e-6 (exact match) | PASS |
| Determinante de la transición recurrente unitaria | +1,000000 | +1,000000000000 | PASS |
| Deriva de norma del estado a 8.192 pasos | < 1e-6 | 9,55e-15 (f64) / < 5,0e-7 (f32) | PASS |
| Retención de rango efectivo (0 negativos) | >= 90,0 % | >= 96,2 % | PASS |
| Recuperación de trayectorias latentes held-out (n = 2.500) | >= 90,0 % | 94,40 % top-1 (98,00 % pass@2) | PASS |

Escalado de memoria de estado:

| Secuencia (T) | KV cache de atención cuadrática | Cache GRT-RNN híbrido | Estado GRT-RNN puro |
|---|---|---|---|
| 128 | 1,0x | 0,33x (-66,7 %) | 0 bytes KV cache (3,0 KB fijos) |
| 512 | 4,0x | 1,33x (-66,7 %) | 0 bytes KV cache (3,0 KB fijos) |
| 2.048 | 16,0x | 5,33x (-66,7 %) | 0 bytes KV cache (3,0 KB fijos) |
| 8.192 | 64,0x | no disponible en el extracto | 0 bytes KV cache (3,0 KB fijos) |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~46,1 M de parámetros almacenados, en float32 ocuparía aproximadamente 184 MB de pesos, y en float16 unos 92 MB, pero no se confirman formatos ni cuantizaciones soportadas.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna podría alojar los pesos, pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí por el recuento de parámetros, aunque no está confirmado por el autor.
- Opciones de despliegue: integración declarada con `transformers` (tag `endpoints_compatible`); no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo reporta complejidad O(1) por token en modo RNN puro.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| GRT-RNN (MatterWaveAI) | RNN rotacional unitaria | ~46,1 M almacenados | No declarado (experimentos hasta 8.192+) | Apache 2.0 | Retenidos en la publicación inicial |
| Mamba (referencia de la categoría SSM) | SSM selectivo | ~130 M (variante pequeña) | No disponible en esta ficha | Apache 2.0 | Públicos |
| RWKV (referencia de la categoría RNN lineal) | RNN lineal con atención | ~169 M (variante pequeña) | No disponible en esta ficha | Apache 2.0 | Públicos |
| Griffin / RecurrentGemma (referencia híbrida) | Híbrido RNN + atención local | ~2 B | No disponible en esta ficha | Gemma Terms | Públicos |

La comparación se limita a la categoría arquitectónica, ya que no hay benchmarks comunes publicados para GRT-RNN frente a estas alternativas en la información disponible. Los datos de los modelos de referencia no proceden de la búsqueda realizada y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Los pesos, el código fuente y los detalles de implementación están retenidos durante el ciclo de publicación escalonado; el modelo no es ejecutable en la práctica a fecha de esta ficha.
- No hay descargas ni interacciones registradas en Hugging Face, ni validación independiente de los resultados reportados.
- Los benchmarks presentados son invariantes arquitectónicos internos y pruebas de recuperación latente, no evaluaciones estándar de NLP; no permiten comparar con modelos de propósito general.
- No se especifican idiomas soportados, datos de entrenamiento ni proceso de alineación, por lo que el riesgo de sesgos y alucinación no puede evaluarse.
- La licencia Apache 2.0 permite uso comercial, pero la retención de pesos y código impide su explotación hasta que se liberen.
- El tamaño (~46 M de parámetros) limita la calidad de generación de texto frente a modelos de miles de millones de parámetros; su interés es principalmente arquitectónico y de investigación.
- Las cifras de capacidad equivalente densa (~115 M) y de retención de rango son afirmaciones del autor sin verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-rnn
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Variante S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
