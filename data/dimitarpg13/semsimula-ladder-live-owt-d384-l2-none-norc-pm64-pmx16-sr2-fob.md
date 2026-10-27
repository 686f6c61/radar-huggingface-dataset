# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob

## Resumen

FO-b-PMX (`semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob`) es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia Semantic Simulation, una línea de modelos de lenguaje conservativos (energy-based) que sustituyen el transformer por dinámicas inspiradas en mecánica lagrangiana. Este checkpoint concreto es la variante de **primer orden** del modelo PMX: integra el flujo de gradiente de un potencial escalar sin velocidad ni inercia, con 64 pozos de memoria en modo Poisson y 16 modos rígidos relajados de forma exacta. El problema que aborda es experimental: determinar si el núcleo conservativo necesita dinámica de segundo orden (con inercia) o si un modelo de primer orden entrenado con el mismo presupuesto rinde igual.

El modelo se entrena sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × batch 32 × bloque 512) y obtiene una perplejidad de validación de 54,02 a bloque 512, frente a 54,63 de su gemelo de segundo orden (PMX). La diferencia del −1,1% se interpreta en la model card como un empate estadístico, lo que refuta la hipótesis pre-registrada de que el segundo orden se rentabilizaría dentro de los pozos de memoria. Es relevante ahora porque forma parte de un estudio de ablación pre-registrado y de una escalera (ladder) de modelos emparejados que aísla cada decisión de diseño, un formato poco habitual en la literatura de arquitecturas no transformer.

Se trata de un artefacto de investigación, no de un modelo de propósito general: sin ajuste por instrucciones, sin RLHF/DPO, solo inglés y con inferencia de memoria constante. Su interés es reproducir y auditar el experimento, no desplegarlo en producto.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer y sin atención (*attention-free*); modelo de lenguaje conservativo con potencial escalar, dinámica lagrangiana y 64 pozos de memoria en modo Poisson; integración de osciladores amortiguados (esquema tipo BAOAB/CFC) |
| Parámetros totales | No disponible (el autor no publica el recuento; el identificador `d384-l2` apunta a dimensión 384 y 2 capas) |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible como máximo declarado; entrenamiento y evaluación con bloques de 512 tokens |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas ni GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch`, checkpoints nativos); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni usa atención: el modelo es un sistema conservativo definido por un potencial escalar `V_θ` sobre el espacio oculto, cuyos estados evolucionan como un flujo de gradiente. En esta variante de primer orden (FO-b) no existe variable de velocidad: en cada capa se integran exactamente, y con amortiguamiento, los 16 modos más rígidos del potencial junto con la parte cuadrática de los 64 pozos de memoria en modo Poisson (una curvatura isotrópica por token más las componentes de rango de sus 16 pozos más fuertes, de cualquier signo). El gemelo de segundo orden (PMX) hace lo mismo conservando la velocidad entre capas; aquí esa velocidad se elimina por completo. La inferencia es de memoria constante, según la propia model card.

El entrenamiento usa OpenWebText (`Skylion007/openwebtext`) con un presupuesto idéntico al del resto de la escalera Gen 3: 532.480.000 tokens en 32.500 pasos, batch 32 y bloque 512, con el mismo calendario. El autor declara salud de ejecución limpia: 0 activaciones del watchdog, 0 capturas de picos, norma de gradiente máxima de 1,32, monitor de fugas SCAF en estado CLEAN en todas las auditorías. No se documenta RLHF, DPO ni ajuste por instrucciones de ningún tipo. El experimento es pre-registrado, con cuatro hipótesis (FBX1–FBX4) y sus probabilidades asignadas de antemano: FBX1 y FBX2 fallaron, FBX3 y FBX4 acertaron.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación de 54,02 a bloque 512 sobre OpenWebText.
- Modelado de lenguaje a nivel de token sin atención: adecuado para estudiar dinámicas de memoria y potenciales en lugar de mecanismos de atención.
- Inferencia con memoria constante respecto a la longitud de la secuencia (según los tags y la model card).
- Soporte de tool calling / function calling: no documentado, no disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingües: no, solo inglés.
- Modo *thinking*, visión, audio o cualquier modalidad adicional: no disponible.
- Capacidad especial: pozos de memoria en modo Poisson (64) y modos rígidos relajados exactamente, que actúan como memoria de primer orden dentro del potencial.

## Casos de uso

- **Investigación en modelos de lenguaje conservativos**: reproducir el par primer orden / segundo orden con el mismo presupuesto de tokens y el mismo corpus para aislar el efecto de la inercia en la dinámica; el checkpoint es directamente comparable con su gemelo PMX.
- **Auditoría de hipótesis pre-registradas**: el modelo sirve para verificar los resultados FBX1–FBX4 declarados por el autor y comprobar si la conclusión de empate (−1,1%) se sostiene con otras semillas.
- **Ablación de mecanismos de memoria**: comparar los 64 pozos de este modelo con las variantes de 16 y 2 pozos de la misma escalera para medir cuánta memoria aporta cada configuración antes de saturarse.
- **Línea base de perplejidad en OpenWebText**: usar los 54,02 a bloque 512 como referencia reproducible de una arquitectura no transformer en ese corpus y presupuesto.
- **Estudio de integradores numéricos**: analizar el comportamiento de la integración amortiguada de osciladores (esquema tipo BAOAB/CFC) aplicada a un modelo de lenguaje y su estabilidad durante el entrenamiento.
- **Docencia y divulgación técnica**: ilustrar mecánica lagrangiana, potenciales escalares y flujos de gradiente en un caso real de modelado de lenguaje, con código y checkpoints públicos.
- **Escenarios de memoria acotada**: probar generación de secuencias largas donde el coste de memoria no crezca con la longitud, gracias a la propiedad de memoria constante.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (la métrica de HuggingFace figura como `verified: false`):

| Métrica | Dataset | Split | Valor |
|---|---|---|---|
| Perplejidad de validación, bloque 512, asentada (media de las tres últimas evaluaciones de 500 pasos) | OpenWebText | validation | **54,02** |

Detalle del resultado: evaluaciones asentadas 53,95 / 54,16 / 53,96; mejor valor 52,18 en el paso 31.000.

Comparación dentro de la escalera (perplejidad, datos del autor):

| Pareja | Corpus, tokens | Segundo orden | Primer orden | Primer orden vs. segundo |
|---|---:|---:|---:|---:|
| OpenWebText | 532,5 M | SR2 58,32 | FO-b-OWT 61,16 | +4,9% |
| TinyStories, primer orden entre capas (FO-a) | 315 M | SO-TS 5,16 | FO-TS 5,13 | −0,6% |
| OpenWebText, 64 pozos Poisson (este modelo) | 532,5 M | PMX 54,63 | **FO-b-PMX 54,02** | **−1,1%** |
| OpenWebText, 16 pozos Poisson | 532,5 M | PMX-K16 54,24 | FO-b-PMX-K16 53,73 | −0,9% |
| OpenWebText, 2 pozos Poisson | 532,5 M | PM2-PMX16 54,71 | FO-b-PM2-PMX16 53,81 | −1,6% |
| TinyStories, primer orden real (FO-b), sin pozos | 315 M | SO-TS 5,16 | FO-b-TS 5,28 | +2,3% |
| TinyStories, 2 pozos Poisson | 315 M | PM2-TS 4,99 | FO-b-PM2-TS 4,96 | −0,5% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica requisitos. El repositorio completo ocupa 0,3 GB, lo que sugiere un checkpoint pequeño, pero no se especifica la VRAM necesaria.
- GPU recomendadas: no disponible. No hay indicaciones de A100, H100 ni RTX 4090 en la documentación.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio, pero no confirmada por el autor.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al ser una arquitectura no transformer con un integrador propio, requiere el código del autor y PyTorch; no hay pesos GGUF ni safetensors publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con los modelos emparejados de la misma escalera (todos con licencia y corpus comparables):

| Modelo | Orden | Pozos Poisson | Perplejidad (OWT, bloque 512) | Contexto de entrenamiento | Licencia |
|---|---|---:|---:|---|---|
| FO-b-PMX (este modelo) | Primero | 64 | 54,02 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |
| PMX | Segundo | 64 | 54,63 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |
| FO-b-PMX-K16 | Primero | 16 | 53,73 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |
| PMX-K16 | Segundo | 16 | 54,24 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |
| FO-b-PM2-PMX16 | Primero | 2 | 53,81 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |
| FO-b-OWT | Primero | 0 | 61,16 | 532,5 M tokens, bloque 512 | CC-BY-4.0 |

No se dispone de comparación con modelos de la misma categoría fuera de esta familia (no disponible).

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está ajustado por instrucciones, no tiene plantilla de chat ni sigue directrices; no debe usarse como asistente.
- Solo inglés; cualquier uso en castellano u otros idiomas carece de soporte y de evaluación.
- No hay métricas de calidad de generación, sesgo o seguridad; únicamente perplejidad. El riesgo de alucinación y de texto incoherente es alto en usos fuera del experimental.
- La métrica de HuggingFace está marcada como `verified: false`: los números proceden del autor y no han sido verificados de forma independiente.
- La conclusión de "empate" entre primer y segundo orden (−1,1%) depende de la horquilla de variación entre semillas, que el autor no cuantifica en la documentación disponible.
- El contexto máximo no está declarado; el entrenamiento y las evaluaciones usan bloques de 512 tokens, por lo que no hay garantías más allá de esa longitud.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero al no existir soporte en motores de inferencia estándar el coste de integración es alto.
- Adopción muy baja (129 descargas, 0 likes): no hay ecosistema, herramientas ni comunidad alrededor del modelo.
- Arquitectura no estándar: las herramientas habituales de evaluación, cuantización y serving no son aplicables sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Gemelo de segundo orden (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Variante de 16 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante de 16 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Variante de 2 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante de 2 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- OpenWebText sin pozos, primer orden (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- OpenWebText sin pozos, segundo orden (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- TinyStories, segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- TinyStories, primer orden entre capas (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- TinyStories, primer orden real (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- TinyStories, 2 pozos, primer orden (FO-b-PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- TinyStories, 2 pozos, segundo orden (PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Colección primer vs. segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (CFC, BAOAB, gradientes vivos): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
