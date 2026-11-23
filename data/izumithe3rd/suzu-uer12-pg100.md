# IzumiThe3rd/Suzu-UER12-PG100

## Resumen

Suzu-UER12-PG100 es un modelo de reranking de candidatos para motores de entrada de pinyin en chino simplificado, desarrollado por IzumiThe3rd. No es un modelo generativo de propósito general: dado un contexto previo (hasta 30 caracteres) y un conjunto de candidatos bajo la misma lectura pinyin, devuelve una puntuación (suma de log-probabilidades de los caracteres del candidato) que permite reordenar las sugerencias de un IME como Rime. Resuelve un problema muy concreto: mejorar la precisión del primer candidato en la escritura china, especialmente en简拼 (iniciales abreviadas), donde los IME tradicionales ordenan por frecuencia y fallan a menudo.

Técnicamente es un GPT-2 de 12 capas y 768 dimensiones, con vocabulario a nivel de carácter de 5142 entradas y aproximadamente 89,8 millones de parámetros. Parte del checkpoint chino de UER (`uer/gpt2-chinese-cluecorpussmall`), al que se le recorta el vocabulario, se le aplica preentrenamiento continuado sobre texto coloquial de foros y se le afina con una pérdida de entropía cruzada a nivel de candidato. Se distribuye únicamente como GGUF Q8_0 (98,2 MB) y está pensado para ejecutarse en el propio dispositivo del usuario, no en servidor.

Su relevancia radica en que demuestra que un modelo de ~90M de parámetros, entrenado sin destilación de un modelo mayor (la destilación desde Qwen3.5-4B-Base empeoró los resultados), supera a un profesor de 4B en la tarea específica de reranking de candidatos, con latencias de decenas de milisegundos en CPU. Es un caso de estudio de especialización extrema frente a escala bruta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 12 capas, 768 dimensiones |
| Parámetros totales | 89.791.488 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 caracteres de上文 más el candidato (ventana de entrada fija de 32 a 64 caracteres en preentrenamiento) |
| Tipos de cuantización | Q8_0 (único publicado) |
| Idiomas soportados | chino simplificado (zh) |
| Licencia | no disponible (el autor no la declara por ambigüedad de la licencia de los pesos base de UER) |
| Formato de pesos | GGUF (`suzu-uer12-pg100.q8_0.gguf`) más fichero de vocabulario `.vocab.txt` |
| Vocabulario | 5142 caracteres (0 relleno, 1 desconocido, 2 inicio de secuencia) |
| Tamaño del repo | 0,1 GB |
| Modelo base | `uer/gpt2-chinese-cluecorpussmall` (commit `c2c0249`) |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 estándar de 12 capas y 768 dimensiones, con embeddings a nivel de carácter. El vocabulario original de UER (21128 entradas, basado en BERT) se recortó a la intersección con el conjunto de 5142 caracteres de la familia Suzu-2.x, reordenando los embeddings según el nuevo índice. La inferencia no usa el tokenizador de llama.cpp: el integrador debe mapear caracteres a identificadores con el `.vocab.txt` adjunto (una línea por carácter, número de línea = id).

El entrenamiento tiene dos fases. Primero, preentrenamiento continuado sobre MNBVC (北大树洞, 天涯 y 知乎), con limpieza de citas, cabeceras de post, menciones y enlaces; se generaron 6,926 millones de ventanas de 32 a 64 caracteres (186 millones de caracteres en total), con pérdida de lenguaje pura, 64 ventanas por paso, learning rate 3e-5 con warmup de 500 pasos y decaimiento coseno hasta el 10%, 40.000 pasos (unos 68,8 millones de caracteres leídos). Después, un afinamiento de 1000 pasos con pérdida de entropía cruzada a nivel de candidato (respuesta = palabra original del corpus) más una pérdida de lenguaje sobre "contexto + respuesta" con peso 0,5, AdamW, batch de 16 problemas y selección del checkpoint en el paso 100 según el conjunto `devclean2`.

Los experimentos de ablación del autor son notables: el preentrenamiento continuado solo alcanza 63,3% en `devclean`; añadir el afinamiento suma 0,4 puntos (intervalo que incluye cero); destilar desde Qwen3.5-4B-Base empeora 2,0 puntos respecto al preentrenamiento solo (61,4% frente a 63,3%). Es decir, el profesor grande no aporta y el autor opta por no usarlo.

## Capacidades

- Reranking de candidatos de pinyin: puntúa cada candidato como suma de log-probabilidades de sus caracteres dado el contexto, permitiendo reordenar sugerencias en Rime y motores compatibles.
- Generación de candidatos de简拼 (iniciales abreviadas): funciona con candidatos de dos letras y contextos cortos.
- Condicionamiento por contexto: usa hasta 30 caracteres previos de上文 para desambiguar homófonos.
- Manejo de candidatos fuera de vocabulario: si un candidato contiene caracteres fuera de los 5142 del vocabulario, se marca como inválido y se descarta su puntuación.
- Integración con Rime: pensado para el pipeline de `librime` con generación de candidatos, puntuación y ordenación unificada (ver repos `suzu-ime` y `rime-suzu`).
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto libre. Es exclusivamente un modelo de scoring para IME.

## Casos de uso

- Reranking en IME de escritorio: integrado en Rime (鼠须管 en macOS, Weasel en Windows) para reordenar las sugerencias de简拼 y全拼. El modelo cabe en 98,2 MB y ofrece latencias P50 de 10,5 ms con上文 caliente en un PC Windows de 4 hilos, adecuado para escritura interactiva.
- Mejora del primer candidato en简拼: en la prueba real con `librime`, el primer candidato acierta el 58,2% de las veces frente al 28,6% sin puntuación del modelo y al 56,4% del modelo de 6 capas, con solo 14 cambios erróneos frente a 18 del 6 capas.
- Escritura en dispositivos de gama alta: el autor lo recomienda para PC y móviles con buen rendimiento; en un Zenfone 10 (Snapdragon 8 Gen 2, 2 hilos) aproximadamente el 12% de las peticiones superan el límite de 45 ms del daemon y caen al orden original de Rime, por lo que en móvil se prefiere la variante de 6 capas.
- Sustitución del modelo de 6 capas cuando prima la precisión: gana 1,8 puntos porcentuales en `devclean` frente a Suzu-UER6-PG200 (63,7% frente a 61,9%) a costa de duplicar el tiempo de scoring (18,96 ms P50 en frío frente a 9,63 ms).
- Investigación en modelos pequeños especializados: sirve como referencia reproducible de que un modelo de ~90M puede superar a un profesor de 4B en una tarea de ranking concreta, con receta de entrenamiento y ablaciones publicadas.
- Desarrollo de IMEs alternativos: cualquier motor que necesite puntuar candidatos de pinyin con contexto puede usar el GGUF y el `.vocab.txt` con su propio runtime (no requiere llama.cpp para el tokenizador).
- Evaluación de pipelines de cuantización: el autor publica métricas tras Q8_0 (62,96% en `devclean` con el core de inferencia), útil para validar que la cuantización no degrada el ranking.

## Benchmarks y rendimiento

Resultados en `devclean` (2400 problemas de简拼 de dos letras, 48 candidatos, PyTorch en precisión completa):

| Grupo | Suzu-UER6-KD500 | Suzu-UER6-PG200 | Suzu-UER12-PG100 | Profesor Qwen3.5-4B-Base |
|---|---:|---:|---:|---:|
| Todos (2400) | 59,5% | 61,9% | 63,7% | 60,0% |
| 清华树洞 | 61,9% | 67,0% | 69,4% | 62,2% |
| 天涯 | 56,4% | 57,1% | 59,8% | 56,5% |
| 知乎 | 60,4% | 61,6% | 62,0% | 61,1% |
| Contexto 2–3 caracteres | 50,7% | 54,5% | 56,7% | 43,7% |
| Contexto 10+ caracteres | 65,7% | 67,8% | 69,8% | 73,8% |

Intervalos de confianza al 95% (bootstrap por problema, emparejado): +1,8 puntos frente a Suzu-UER6-PG200 (+0,6 a +3,0); +4,2 frente a Suzu-UER6-KD500 (+2,8 a +5,7); +3,8 frente al profesor (+2,1 a +5,5), aunque con contexto de 10+ caracteres sigue 4,0 puntos por debajo del profesor (−7,0 a −1,0).

Tras cuantización Q8_0 en el core de inferencia: `devclean` 62,96%, `evalv2x` (1600 problemas) 62,19%; Suzu-UER6-PG200 en las mismas condiciones: 61,21% y 58,31%.

Prueba real en `librime` (macOS, mitad de validación):

| Modelo | Problemas | Primer acierto | Cambios de primero | De ellos, erróneos |
|---|---:|---:|---:|---:|
| Suzu-UER6-KD500 | 1.190 | 54,0% | 547 | 12 |
| Suzu-UER6-PG200 | 1.195 | 56,4% | 632 | 18 |
| Suzu-UER12-PG100 | 1.190 | 58,2% | 638 | 14 |

Sin puntuación del modelo, el primer acierto con los mismos candidatos es 28,6%.

Regresión de全拼 (1293 problemas, hasta 5 candidatos, emparejado):

| Grupo | Suzu-2.4 | Suzu-UER6-PG200 | Suzu-UER12-PG100 | Diferencia vs. Suzu-2.4 |
|---|---:|---:|---:|---|
| Todos | 92,73% | 93,43% | 93,50% | +0,77 (−0,77 a +2,32) |
| Un carácter (74) | 81,08% | 87,84% | 86,49% | +5,41 (−2,70 a +13,51) |
| Multichar | 93,44% | 93,77% | 93,93% | +0,49 (−1,15 a +2,05) |

Latencia (Windows, 10 candidatos, 4 hilos, mediana de 3 rondas, ms):

| Modelo | Frío P50 / P95 / P99 | Caliente P50 / P95 / P99 |
|---|---|---|
| Suzu-UER6-PG200 | 9,63 / 21,23 / 22,72 | 5,55 / 7,02 / 7,70 |
| Suzu-UER12-PG100 | 18,96 / 43,21 / 46,22 | 10,54 / 13,23 / 14,43 |

En Apple M1 Pro, 9,5–13,0 ms por scoring (1,5–2× el modelo de 6 capas). Memoria residente: ~282 MiB (6 capas: ~150 MiB).

## Requisitos de hardware

- VRAM/RAM: ~282 MiB residentes con Q8_0; el fichero pesa 98,2 MB. Cabe holgadamente en cualquier equipo.
- GPU: no requiere GPU. El autor mide en CPU (Windows de 4 hilos, Apple M1 Pro, Snapdragon 8 Gen 2). No hay datos publicados para A100, H100 o RTX 4090.
- Consumer GPU: sí, en cualquier GPU con más de 1 GB de memoria, aunque el caso de uso natural es CPU.
- Despliegue: runtime GGUF propio del proyecto `suzu-ime` (integración con `librime`); no se documenta soporte para vLLM, TGI ni Ollama, y el modelo no usa el tokenizador de llama.cpp, por lo que un servidor de inferencia estándar no sirve sin adaptación.
- Latencia: P50 de 10,54 ms (caliente) y 18,96 ms (frío) en PC Windows de 4 hilos; 9,5–13,0 ms en M1 Pro. En móvil de gama alta, ~12% de peticiones superan los 45 ms y caen al orden original.
- Throughput: no disponible (no se publica en peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | `devclean` (简拼) | Primer acierto en `librime` | Licencia | Disponibilidad |
|---|---|---:|---|---:|---:|---|---|
| Suzu-UER12-PG100 | ~90M | 12 | 30 caracteres | 63,7% | 58,2% | no disponible | GGUF Q8_0 |
| Suzu-UER6-PG200 | ~45M (estimado, 6 capas) | 6 | 30 caracteres | 61,9% | 56,4% | no disponible | GGUF |
| Suzu-UER6-KD500 | ~45M (estimado) | 6 | 30 caracteres | 59,5% | 54,0% | no disponible | GGUF |
| Qwen3.5-4B-Base (profesor) | 4B | no disponible | no disponible | 60,0% | no disponible | no disponible | no disponible |

El modelo de 12 capas gana en precisión a las variantes de 6 capas y al profesor de 4B en简拼, pero es 1,5–2× más lento y consume casi el doble de memoria. Para móvil, el autor recomienda el de 6 capas por los timeouts del daemon.

## Limitaciones y advertencias

- Solo chino simplificado; no genera texto ni responde a instrucciones. Es un scorer de candidatos, no un chatbot.
- Contexto máximo de 30 caracteres de上文; con contextos de 10+ caracteres queda ~4 puntos por debajo del profesor Qwen3.5-4B-Base.
- Vocabulario de solo 5142 caracteres, unos 850 menos que Suzu-2.x. Los candidatos con caracteres fuera de vocabulario no reciben puntuación y se ordenan al final según Rime.
- Riesgo de contaminación de evaluación: el corpus de preentrenamiento de UER (CLUECorpusSmall) proviene de rastreo web y podría contener frases originales de 知乎 y 天涯; los posts de 清华树洞 usados en evaluación no están en la web pública, según el autor.
- Solo se entrenó una semilla; no se midió la varianza entre semillas con la misma receta.
- Licencia no declarada: los pesos base de UER no tienen licencia explícita, por lo que el uso comercial queda en un limbo legal. El código de UER-py es Apache-2.0, pero eso no cubre los pesos.
- Los candidatos se construyen con los léxicos de 白霜拼音 y 雾凇拼音 (GPL-3.0); el autor indica que el fichero de pesos no contiene el texto del léxico, pero conviene revisar `NOTICE.md` antes de redistribuir.
- El umbral de primer candidato (1,5) está calibrado para esta familia; cambiarlo a 2,5 si se vuelve a Suzu-2.4.
- En móviles de gama media/baja y en el Zenfone 10, ~12% de peticiones superan los 45 ms y el sistema revierte al orden de Rime, degradando la experiencia.
- No hay benchmarks estándar (MMLU, HumanEval, GSM8K); la evaluación es específica de la tarea de IME.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IzumiThe3rd/Suzu-UER12-PG100
- Modelo de 6 capas comparado: https://huggingface.co/IzumiThe3rd/Suzu-UER6-PG200
- Modelo base UER: https://huggingface.co/uer/gpt2-chinese-cluecorpussmall
- Integración con IME: https://github.com/1zumiii/suzu-ime
- Configuración y paquete de léxicos Rime: https://github.com/1zumiii/rime-suzu
- Documentación y versiones anteriores: https://github.com/1zumiii/Suzu
- Repositorio de código UER-py: https://github.com/dbiir/UER-py
- Dataset MNBVC: https://huggingface.co/datasets/liwu/MNBVC
