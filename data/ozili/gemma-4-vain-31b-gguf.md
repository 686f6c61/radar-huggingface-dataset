# Ozili/Gemma-4-Vain-31B-GGUF

## Resumen

Gemma-4-Vain-31B es un ajuste fino (finetune) del modelo denso Gemma 4 31B de Google DeepMind, desarrollado por el usuario Ozili y publicado en formato GGUF. El modelo está especializado en tres tareas concretas: roleplay, escritura creativa y traducción de japonés a inglés. Parte de la base `trohrbaugh/gemma-4-31b-it-heretic-ara`, que a su vez deriva del Gemma 4 31B oficial, y se distribuye con licencia Apache 2.0.

La relevancia de esta ficha radica en que se trata de un modelo orientado a la comunidad, con evaluaciones comparativas propias frente a otros finetunes de 31B (MeroMero v2, StyleTune 31B y Sprinkle 31B) en escenarios de roleplay y traducción. El autor documenta el proceso de cuantización con llama.cpp y publica cinco variantes GGUF (de Q8_0 a IQ4_XS), lo que facilita su despliegue en hardware de consumo.

Es un modelo denso de 31B parámetros, sin mezcla de expertos, por lo que no se beneficia del offloading selectivo de expertos. La información disponible en la model card no detalla la longitud de contexto nativa ni los datos exactos de entrenamiento, más allá de la metodología LoRA empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), sin visión |
| Parametros totales | 31B (aproximado, según nomenclatura del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (más matriz de importancia imatrix) |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Tamaños de archivo publicados:

| Archivo | Tamaño | Uso recomendado |
|---|---:|---|
| Gemma-4-Vain-31B-Q8_0.gguf | 30,39 GiB | Máxima precisión de la release; base de comparación |
| Gemma-4-Vain-31B-Q6_K.gguf | 23,47 GiB | La opción más cercana a Q8 entre los archivos menores |
| Gemma-4-Vain-31B-Q5_K_M.gguf | 20,35 GiB | Opción intermedia entre tamaño y fidelidad |
| Gemma-4-Vain-31B-Q4_K_M.gguf | 17,40 GiB | Menor uso de memoria, mayor desviación respecto a Q8 |
| Gemma-4-Vain-31B-IQ4_XS.gguf | 15,59 GiB | El archivo más pequeño de la release |
| Gemma-4-Vain-31B.imatrix.gguf | 26,25 MiB | Matriz de importancia para generar cuantizaciones adicionales |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Gemma 4, sin componentes de visión (la model card indica explícitamente que no se incluye proyector visual). El ajuste fino se realizó mediante un LoRA de rango 64 denominado `vain31-style`, entrenado durante 996 pasos y fusionado a escala 1.0 sobre la base heretic-ara. El autor indica que el enfoque se inspiró en Sprinkle y que los detalles de entrenamiento son aportados por el propio autor del modelo; no se especifica el volumen de tokens de entrenamiento ni la composición del dataset.

La release empaqueta el checkpoint final seleccionado, `s996`. Las cinco cuantizaciones se generaron directamente desde un maestro F16 único con llama.cpp b11706 (`f74e2fa6a`). Q8_0 no emplea matriz de importancia; las cuatro cuantizaciones menores usan la misma matriz recogida en Q8. La calibración se realizó con los 225 fragmentos completos disponibles a contexto 512, y el texto de calibración y evaluación no se incluye en la release.

## Capacidades

- Generación de texto para roleplay con voz en prosa natural y comportamiento de personaje consistente.
- Escritura creativa: narrativa, diálogo y estilo literario.
- Traducción de japonés a inglés, con métricas de precisión, naturalidad y voz.
- Conversación multi-turno con plantilla de chat embebida (requiere un runtime con soporte de Gemma 4).
- Generación de texto general en inglés y japonés.
- No incluye capacidades de visión (sin proyector visual).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Roleplay conversacional: el modelo está afinado específicamente para mantener personajes coherentes y prosa natural, con evaluaciones propias en 8 escenas de roleplay y 6 jueces anonimizados; adecuado para aplicaciones de entretenimiento y narrativa interactiva.
- Escritura creativa asistida: generación de relatos, diálogos y borradores literarios con un estilo de prosa cuidado, usando temperatura 0.7 y DRY 0.8/1.75/2 como punto de partida.
- Traducción japonés-inglés: traducción de pasajes con foco en naturalidad y voz, evaluada en 12 pasajes por ronda; útil para localización de contenido japonés.
- Prototipado de personajes para videojuegos o ficción interactiva: el ajuste LoRA de estilo permite mantener una voz consistente en sesiones largas, con control de repetición mediante DRY y repetition penalty 1.05.
- Despliegue local en hardware de consumo: las variantes Q4_K_M (17,40 GiB) e IQ4_XS (15,59 GiB) permiten ejecución con offloading parcial a CPU en equipos con VRAM limitada.
- Evaluación comparativa de finetunes de 31B: la release incluye tablas de evaluación guardadas frente a MeroMero v2, StyleTune 31B y Sprinkle 31B, útil como referencia para seleccionar un modelo de roleplay o traducción.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones guardadas del checkpoint seleccionado, no pruebas ciegas nuevas de cada cuantización. Se usaron 6 jueces anonimizados con etiquetas rotadas; cada ronda de roleplay tiene 8 escenas × 6 jueces = 48 rankings, y cada ronda de traducción 12 pasajes × 6 jueces = 72 rankings. Puntuación: 2 puntos por primer puesto, 1 por segundo, 0 por tercero.

Roleplay frente a rivales de 31B:

| Modelo | Puntos | Primeros puestos | Lógica | Escritura | Ideas | Deslices por juicio |
|---|---:|---:|---:|---:|---:|---:|
| Vain 31B | 62 | 24/48 (50,0%) | 8,98 | 8,67 | 8,40 | 0,19 |
| MeroMero v2 31B | 54 | 21/48 (43,8%) | 8,69 | 8,58 | 8,54 | 0,35 |
| StyleTune 31B | 28 | 3/48 (6,2%) | 8,17 | 8,31 | 8,04 | 0,69 |

Comparaciones por pares en roleplay: Vain gana 27-21 a MeroMero v2 y 35-13 a StyleTune.

Traducción japonés-inglés frente a rivales de 31B:

| Modelo | Puntos | Primeros puestos | Precisión | Naturalidad | Voz | Errores por juicio |
|---|---:|---:|---:|---:|---:|---:|
| Vain 31B | 93 | 39/72 (54,2%) | 8,96 | 8,72 | 8,57 | 0,24 |
| MeroMero v2 31B | 85 | 25/72 (34,7%) | 9,00 | 8,88 | 8,74 | 0,17 |
| StyleTune 31B | 38 | 8/72 (11,1%) | 8,71 | 8,40 | 8,39 | 0,38 |

Comparación por pares en traducción: Vain gana 39-33 a MeroMero v2 y 54-18 a StyleTune.

Frente a Sprinkle 31B: Vain ganó la comparación de roleplay en semilla 1 por 35-13; en semilla 2 obtuvo 43 puntos frente a 40 de Sprinkle, con empate 24-24 por pares. La puntuación de robustez de Vain en semilla 2 fue 99,5/100 (media de puntuaciones por categoría, no tasa de aprobación individual); en semilla 1 fue 92,7/100.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del archivo no equivale al uso total de VRAM; hay que sumar contexto, caché KV, buffers del runtime y otras aplicaciones. Como referencia de archivo: Q8_0 30,39 GiB, Q6_K 23,47 GiB, Q5_K_M 20,35 GiB, Q4_K_M 17,40 GiB, IQ4_XS 15,59 GiB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de archivo, Q8_0 y Q6_K requieren GPUs de clase profesional (A100/H100 de 40-80 GB) o configuraciones multi-GPU; las variantes Q4_K_M e IQ4_XS son las más viables en GPUs de consumo de gama alta con 24 GB, posiblemente con offloading parcial a CPU.
- Cabe en GPU de consumo: solo las cuantizaciones menores (IQ4_XS, Q4_K_M) con margen ajustado y posible offloading parcial; el modelo es denso de 31B, por lo que no aplica el comportamiento de offloading de expertos de Vain 26B-A4B.
- Opciones de despliegue: llama.cpp (las cuantizaciones se generaron con llama.cpp b11706); se requiere un runtime con soporte de Gemma 4 y la plantilla de chat embebida. Otras opciones (vLLM, TGI, Ollama) no se confirman en la información disponible.
- Latencia y throughput: no disponible.

Ajustes de muestreo recomendados por el autor:

| Ajuste | Valor |
|---|---|
| Temperatura | 0,7 |
| Min P | 0,05 |
| Top P | 0,95 |
| Top K | 0 (desactivado) |
| Penalización de repetición | 1,05 |
| Multiplicador / base / longitud permitida DRY | 0,8 / 1,75 / 2 |
| Separadores de secuencia DRY | `"\n"`, `":"`, `"\""`, `"*"` |

Las ejecuciones guardadas usaron un límite de 800 tokens de respuesta. El autor indica que estos ajustes son un punto de partida, no un óptimo demostrado para cada cuantización o prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (roleplay, puntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Vain-31B | 31B denso | no disponible | 62 (1.º de 3) | Apache 2.0 | GGUF en HF |
| MeroMero v2 31B | 31B | no disponible | 54 (2.º de 3) | no disponible | referenciado en evaluación |
| StyleTune 31B | 31B | no disponible | 28 (3.º de 3) | no disponible | referenciado en evaluación |
| Sprinkle 31B | 31B | no disponible | 43 vs 40 en semilla 2 | no disponible | referenciado en evaluación |

En traducción japonés-inglés, Vain 31B obtuvo 93 puntos frente a 85 de MeroMero v2 y 38 de StyleTune 31B. Los datos de licencia y disponibilidad de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo no gana todas las comparaciones: la base heretic-ara superó a Vain en las comparaciones por pares de roleplay y traducción de la semilla 2.
- La robustez en semilla 1 fue 92,7/100, por lo que la puntuación de 99,5/100 en semilla 2 no debe interpretarse como garantía entre prompts o semillas.
- La continuidad, el seguimiento de instrucciones, la precisión de traducción y el estilo de salida pueden variar.
- Los juicios múltiples de una misma escena no son muestras independientes; las evaluaciones son históricas del checkpoint seleccionado, no pruebas nuevas de cada cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo generativo de texto sin mecanismos de verificación documentados.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo se declaran inglés y japonés; no se garantiza un rendimiento adecuado en castellano.
- Sin capacidades de visión: la release no incluye proyector visual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia de la base heretic-ara y del Gemma 4 original, no detallada en la información disponible.
- En producción: el tamaño del archivo no es el uso total de VRAM; es necesario prever contexto, caché KV y buffers, y puede requerirse offloading parcial a CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ozili/Gemma-4-Vain-31B-GGUF
- Modelo base heretic-ara: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Gemma 4 31B oficial: https://huggingface.co/google/gemma-4-31B
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- GGUF alternativo de Gemma 4 31B (Omega-Factory): https://huggingface.co/Omega-Factory/gemma-4-31b-GGUF
