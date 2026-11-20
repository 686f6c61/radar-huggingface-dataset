# Ozili/Gemma-4-Vain-31B-GGUF

## Resumen

Gemma-4 Vain 31B es un ajuste fino (finetune) denso del modelo Gemma 4 31B de Google, orientado a roleplay, escritura creativa y traducción del japonés al inglés. Lo publica el usuario Ozili en Hugging Face y se distribuye exclusivamente en formato GGUF, con cinco cuantizaciones más una matriz de importancia para generar otras nuevas. El modelo parte de `trohrbaugh/gemma-4-31b-it-heretic-ara`, un derivado de Gemma 4 31B, y se entrena mediante un LoRA de rango 64 entrenado durante 996 pasos y fusionado a escala 1.0.

El interés principal está en su enfoque de evaluación: el autor compara el checkpoint final (s996) contra otros finetunes de 31B (MeroMero v2, StyleTune 31B y Sprinkle 31B) mediante jurados anonimizados con etiquetas rotadas, en 8 escenas de roleplay y 12 pasajes de traducción por ronda. Vain queda primero en ambas categorías frente a MeroMero v2 y StyleTune, aunque pierde frente a su propia base heretic-ara en la segunda semilla.

Con 30.697.345.596 parámetros totales y licencia Apache 2.0, es un modelo de 31B denso que requiere hardware de gama alta para inferencia completa en GPU, aunque sus cuantizaciones de 4 bits permiten despliegues con offloading parcial a CPU. No incluye proyector de visión: es un modelo puramente de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), sin mezcla de expertos |
| Parámetros totales | 30.697.345.596 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (generadas con llama.cpp b11706) |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más imatrix GGUF para calibración) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 31B parámetros derivado de Gemma 4 31B de Google, a través del finetune intermedio `trohrbaugh/gemma-4-31b-it-heretic-ara`. El ajuste se realizó con un LoRA de rango 64 denominado `vain31-style`, entrenado durante 996 pasos y fusionado en el modelo base a escala 1.0. El autor indica que el enfoque se inspiró en Sprinkle, pero no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

Las cuantizaciones se generaron directamente desde un maestro F16 único con llama.cpp b11706 (commit `f74e2fa6a`). Q8_0 no usa matriz de importancia; las cuatro cuantizaciones menores (Q6_K, Q5_K_M, Q4_K_M, IQ4_XS) comparten una matriz imatrix recogida con Q8. La calibración empleó los 225 fragmentos completos disponibles a contexto 512. No se especifica si hubo RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional y narrativo, con énfasis en voz en prosa natural y comportamiento consistente de personaje.
- Roleplay multi-turno: el modelo está entrenado específicamente para mantener personajes y continuidad en escenas dialogadas.
- Escritura creativa: narrativa, descripciones y diálogo con estilo literario.
- Traducción japonés-inglés: capacidad destacada y evaluada explícitamente por el autor.
- Traducción inversa inglés-japonés: no confirmada en la documentación; solo se declara soporte de ambos idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no incluidas; el autor indica explícitamente que no hay proyector de visión.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo mantiene personajes y continuidad en escenas multi-turno, adecuado para aplicaciones de entretenimiento, novelas visuales o chatbots con personalidad definida. Su entrenamiento específico en 8 escenas de evaluación con métricas de coherencia y slips lo respalda.
- Escritura creativa asistida: generación de narrativa, diálogo y descripciones con voz en prosa natural, útil para autores que necesitan borradores con estilo consistente o para herramientas de escritura colaborativa.
- Traducción japonés-inglés de contenido creativo: el modelo obtiene 8,96 en precisión y 8,72 en naturalidad en la evaluación del autor, lo que lo hace adecuado para localización de novelas ligeras, manga o guiones donde la naturalidad del inglés importa tanto como la fidelidad.
- Localización de videojuegos y contenido de ocio japonés: combinación de traducción ja-en y preservación de voz de personaje, útil en pipelines de localización que requieren consistencia de registro entre escenas.
- Generación de diálogo para personajes de ficción interactiva: integrable en motores de juego o plataformas de narrativa interactiva mediante llama.cpp u otros runtimes compatibles con GGUF, con cuantizaciones Q4_K_M o IQ4_XS para reducir requisitos de memoria.
- Prototipado de asistentes con personalidad en inglés o japonés: despliegue en local con Ollama o llama.cpp para pruebas de concepto de chatbots con estilo definido, gracias a la licencia Apache 2.0 y a la disponibilidad de cuantizaciones pequeñas.

## Benchmarks y rendimiento

Evaluación del checkpoint s996 con 6 jurados anonimizados y etiquetas rotadas. Cada ronda de roleplay: 8 escenas × 6 jurados = 48 rankings. Cada ronda de traducción: 12 pasajes × 6 jurados = 72 rankings. Puntuación: 2 puntos por primer puesto, 1 por segundo, 0 por tercero.

Roleplay frente a rivales de 31B:

| Modelo | Puntos | Primeros puestos | Lógica | Escritura | Ideas | Slips por juicio |
|---|---:|---:|---:|---:|---:|---:|
| Vain 31B | 62 | 24/48 (50,0%) | 8,98 | 8,67 | 8,40 | 0,19 |
| MeroMero v2 31B | 54 | 21/48 (43,8%) | 8,69 | 8,58 | 8,54 | 0,35 |
| StyleTune 31B | 28 | 3/48 (6,2%) | 8,17 | 8,31 | 8,04 | 0,69 |

Traducción japonés-inglés frente a rivales de 31B:

| Modelo | Puntos | Primeros puestos | Precisión | Naturalidad | Voz | Errores por juicio |
|---|---:|---:|---:|---:|---:|---:|
| Vain 31B | 93 | 39/72 (54,2%) | 8,96 | 8,72 | 8,57 | 0,24 |
| MeroMero v2 31B | 85 | 25/72 (34,7%) | 9,00 | 8,88 | 8,74 | 0,17 |
| StyleTune 31B | 38 | 8/72 (11,1%) | 8,71 | 8,40 | 8,39 | 0,38 |

Comparaciones directas adicionales:
- Frente a MeroMero v2: 27-21 en roleplay y 39-33 en traducción.
- Frente a StyleTune: 35-13 en roleplay y 54-18 en traducción.
- Frente a Sprinkle 31B: victoria 35-13 en roleplay (semilla 1); en semilla 2, 43 puntos frente a 40, con empate 24-24 en comparación directa.
- Robustez mecánica: 99,5/100 en semilla 2 (media de puntuaciones por categoría, no tasa de aprobación individual); 92,7/100 en semilla 1.
- La base heretic-ara ganó a Vain en las comparaciones directas de roleplay y traducción de la semilla 2.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo, sin contar contexto ni KV cache): Q8_0 30,39 GiB; Q6_K 23,47 GiB; Q5_K_M 20,35 GiB; Q4_K_M 17,40 GiB; IQ4_XS 15,59 GiB.
- El tamaño del archivo no equivale al uso total de VRAM: hay que sumar contexto, KV cache, buffers del runtime y otras aplicaciones. El autor advierte que puede ser necesario offloading parcial a CPU.
- GPU recomendadas: para Q8_0 y Q6_K se necesita una GPU de 40-48 GB o superior (A100 40/80 GB, H100, RTX A6000). Para Q4_K_M e IQ4_XS, una RTX 4090 (24 GB) puede alojar los pesos, pero el contexto y el KV cache pueden obligar a offloading.
- En GPU de consumo: IQ4_XS (15,59 GiB) y Q4_K_M (17,40 GiB) son las opciones viables en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, con margen limitado para contexto.
- Opciones de despliegue: llama.cpp (versión b11706 o superior con soporte de Gemma 4), Ollama y otros runtimes compatibles con GGUF. El modelo incluye plantilla de chat embebida.
- Ajustes de muestreo recomendados por el autor: temperatura 0,7; min P 0,05; top P 0,95; top K 0 (desactivado); penalización de repetición 1,05; DRY multiplier 0,8, base 1,75, allowed length 2; secuencias de corte DRY `"\n"`, `":"`, `"\""`, `"*"`. Los runs guardados usaron un límite de 800 tokens de respuesta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato | Evaluación del autor |
|---|---|---|---|---|---|---|
| Vain 31B | 30,7B (denso) | no disponible | Roleplay, escritura creativa, traducción ja-en | Apache 2.0 | GGUF | 62 pts roleplay, 93 pts traducción |
| MeroMero v2 31B | 31B (denso) | no disponible | Roleplay y traducción | no disponible | no disponible | 54 pts roleplay, 85 pts traducción |
| StyleTune 31B | 31B (denso) | no disponible | Roleplay y estilo | no disponible | no disponible | 28 pts roleplay, 38 pts traducción |
| Sprinkle 31B | 31B (denso) | no disponible | Roleplay | no disponible | no disponible | 40 pts roleplay (semilla 2) |
| heretic-ara (base) | 31B (denso) | no disponible | Base del finetune | no disponible | no disponible | Ganó a Vain en comparaciones directas de semilla 2 |

## Limitaciones y advertencias

- El propio autor reconoce que Vain no gana todas las comparaciones: la base heretic-ara superó a Vain en las comparaciones directas de roleplay y traducción de la semilla 2.
- La robustez mecánica varía entre semillas: 92,7/100 en semilla 1 frente a 99,5/100 en semilla 2, por lo que la puntuación alta no debe interpretarse como garantía entre prompts o semillas.
- Continuidad, seguimiento de instrucciones, precisión de traducción y estilo de salida pueden variar según el prompt.
- Los juicios múltiples de una misma escena no son muestras independientes; las evaluaciones son de checkpoint guardado, no tests ciegos de cada cuantización GGUF.
- Solo se declaran inglés y japonés como idiomas soportados; el rendimiento en castellano u otros idiomas no está documentado.
- Modelo puramente de texto: no incluye proyector de visión ni capacidades multimodales.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada, pero aplicable por herencia del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, cuyos términos pueden imponer restricciones adicionales.
- Al ser un modelo denso de 31B, no se beneficia del offloading de expertos de arquitecturas MoE como Vain 26B-A4B; el offloading parcial a CPU penaliza la latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ozili/Gemma-4-Vain-31B-GGUF
- Modelo base intermedio: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo base original: https://huggingface.co/google/gemma-4-31B
