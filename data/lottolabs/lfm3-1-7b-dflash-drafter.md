# Lottolabs/LFM3-1.7B-DFlash-Drafter

## Resumen

LFM3-1.7B-DFlash-Drafter es un modelo borrador (*drafter*) para decodificación especulativa sobre el modelo objetivo LiquidAI/LFM3-1.7B. Lo desarrolla Lottolabs como derivado comunitario y experimental, no oficial de Liquid AI ni de Tenstorrent. No es un modelo de lenguaje autónomo: necesita los estados ocultos, el embedding y la cabeza LM (atada) de LFM3-1.7B para funcionar. Su única tarea es proponer varios tokens por pasada para que el modelo objetivo los verifique después de forma exacta.

Técnicamente es un transformer pequeño de 3 capas y 157,3 millones de parámetros entrenables que lee tres estados residuales del modelo objetivo (tras las capas 2, 12 y 23), los normaliza con RMSNorm sin pesos, los concatena en un vector de 6.144 dimensiones y los proyecta a 2.048. A partir de un token ancla genera un bloque de 8 filas que producen 7 borradores en una sola pasada no causal, apoyándose en una ventana de contexto de 2.048 posiciones.

Su relevancia es práctica: al integrarse en la pila de serving de Tenstorrent Blackhole P150 junto al modelo objetivo, acelera la generación entre 1,20x y 1,50x según la carga, manteniendo la salida de texto idéntica porque la verificación del modelo grande es exacta. Fue entrenado por autodestilación sobre 63,35 millones de tokens de respuestas del propio LFM3-1.7B en una única RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer block drafter estilo DFlash (3 capas, atencion pre-norm con 16 cabezas query / 4 KV, head_dim 128, SwiGLU, RoPE theta 10^4) |
| Parametros totales | 157.321.984 (tensores entrenables, sin embedding ni cabeza del objetivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atencion de 2.048 posiciones sobre las filas de contexto; bloque de 8 filas (7 borradores por pasada) |
| Tipos de cuantizacion | pesos exportados en BF16; el runtime P150 usa formatos mixtos BFP4/BFP8 para el modelo objetivo (no se detalla cuantizacion propia del drafter) |
| Idiomas soportados | en |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (BF16), 314,6 MB; config.json, draft_vocab.json y calibration.json acompanan la exportacion |

## Arquitectura y entrenamiento

El drafter sigue el diseno de bloque de z-lab DFlash (arXiv 2602.06036) con dos modificaciones propias. La primera es el contexto: toma el flujo residual del objetivo tras las capas 2, 12 y 23 (la 23 es la que lee la norma final de LFM3), normaliza cada uno con RMSNorm sin pesos (necesario porque la escala del residual crece unas 10 veces entre capas), los concatena en 6.144 dimensiones y los proyecta mediante una capa `fc` de 6.144 a 2.048 seguida de RMSNorm. La segunda es el bloque de 8: para un ancla `a`, las filas `a`…`a+7` predicen los tokens `a+i`, de modo que cada pasada entrega 7 borradores. Cada fila arranca como `embed(anchor) + ctx_gain · ctx[a-1]` más un vector aprendido por desplazamiento; sin esta ruta directa el modelo se quedaba en nivel de bigrama durante los primeros 500 pasos.

Las 3 capas usan atención pre-norm con 16 cabezas de consulta y 4 de clave/valor, head_dim 128, RMSNorm en q/k y RoPE con theta 10^4. Las claves y valores se calculan sobre las filas de contexto `a-2.048`…`a-1` más las filas del propio bloque, sin máscara dentro del bloque. La cabeza es la del propio LFM3 (atada a su embedding de entrada) restringida a un vocabulario de borrador de 65.536 tokens congelado, que cubre 0,994 de los tokens de salida en chat, 0,998 en código, 0,999 en matemáticas, 0,999 en tool calling y 0,976 en multilingüe sobre datos retenidos. Se entrenó por autodestilación sobre 63,35 millones de tokens de respuestas de LFM3-1.7B en una RTX 3090; el checkpoint publicado corresponde al paso 11.000 (pesos maestros FP32 en `runs/r4/final.pt`, convertidos a BF16).

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: 7 tokens por pasada no causal sobre el modelo objetivo LFM3-1.7B.
- Aceptación media de 2,34 tokens por ronda en modo greedy y 2,07 en modo muestreado con 7 borradores (frente a 1,60 / 1,52 de prompt lookup con hasta 15).
- Calibración publicada de la probabilidad de aceptación por profundidad de borrador y por margen top-1 menos top-2, para peticiones greedy y muestreadas.
- Integración con la pila de serving de Tenstorrent Blackhole P150 junto al objetivo (release s14 lo incluye y lo activa por defecto).
- No soporta tool calling, agentes, visión, audio ni razonamiento autónomo por sí mismo: esas capacidades dependen del modelo objetivo.
- Multilingüe limitado: la cobertura del vocabulario de borrador en datos multilingües es 0,976, pero el modelo declara únicamente inglés.

## Casos de uso

- Serving de chat interactivo en P150: con muestreo por defecto el drafter eleva el rendimiento de 285,0 a 364,0 tok/s (1,28x) respecto al mismo servidor sin drafter, manteniendo cada token de texto idéntico gracias a la verificación exacta del objetivo.
- Prompts largos de contexto: con un prompt de 2.000 tokens el rendimiento sube de 338,5 a 406,8 tok/s (1,20x), adecuado para asistentes con historial conversacional extenso.
- Razonamiento matemático y GSM8K: es donde más rinde, con 332,4 a 499,8 tok/s (1,50x), útil en pipelines de evaluación o generación de soluciones paso a paso.
- Edición de código y tool calls con mucho texto copiado: el rendimiento se mantiene en 0,99-1,03x, por lo que no penaliza pero tampoco aporta; conviene desactivarlo en esas cargas si se busca simplicidad operativa.
- Investigación en decodificación especulativa: el repo incluye `code/` completo (`drafter.py`, `train.py`, `eval_accept.py`, `calibrate.py`, `export_tt.py`) para reproducir el entrenamiento y medir aceptación offline.
- Ajuste fino de la calibración de aceptación: `calibration.json` permite a un runtime decidir cuántos borradores verificar según el margen de logits, reduciendo trabajo desperdiciado en el verificador.
- Despliegue en hardware Tenstorrent: el checkpoint está exportado para el runtime P150 (`LFM3_DRAFTER=<dir>`) con identidad de caché de pesos basada en el sha256 de `model.safetensors`.

## Benchmarks y rendimiento

Medición del autor en P150, un usuario, muestreo por defecto, mediana de 3 semillas, comparando el mismo servidor con y sin drafter (solo prompt lookup) el mismo día:

| Carga | Sin drafter (tok/s) | Con drafter (tok/s) | Aceleracion |
|---|---|---|---|
| Chat | 285,0 | 364,0 | 1,28x |
| Chat con prompt de 2K tokens | 338,5 | 406,8 | 1,20x |
| GSM8K | 332,4 | 499,8 | 1,50x |
| Edición de código / tool calls con copia | no disponible | no disponible | 0,99-1,03x |

Aceptación offline con 7 borradores: 2,34 tokens por ronda en greedy y 2,07 en muestreado, frente a 1,60 / 1,52 de prompt lookup con hasta 15. En una prueba de diseño, los taps 2/12/23 obtuvieron 0,334 de top-1 frente a 0,320 de los taps equiespaciados 1/6/11/16/21 de DFlash. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 314,6 MB en BF16; sumado al embedding y la cabeza del objetivo (no incluidos), el drafter es marginal frente a los requisitos de LFM3-1.7B.
- GPU de entrenamiento: una única RTX 3090 fue suficiente para los 63,35 millones de tokens de autodestilación.
- Hardware de serving de referencia: Tenstorrent Blackhole P150, donde el drafter corre junto al objetivo en la pila de serving.
- GPU consumer: por tamaño, cabe holgadamente en cualquier GPU consumer moderna; no se han publicado cifras de latencia o throughput en GPU para este checkpoint.
- Opciones de despliegue: runtime P150 de Lottolabs (`LFM3_DRAFTER=<dir>`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: el autor cita 0,62 ms como referencia de peso del objetivo en las tablas de proyección de velocidad; la cabeza de 128K del objetivo cuesta 0,58 ms en P150, motivo por el que se eligió un bloque no causal en lugar de cabezas autoregresivas estilo EAGLE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-DFlash-Drafter | 157,3 M entrenables | ventana 2.048, bloque de 8 | Block drafter DFlash, 7 borradores por pasada | LFM Open License v1.0 | Hugging Face, runtime P150 |
| Prompt lookup (línea base del autor) | 0 | n/a | Coincidencia de n-gramas en el prompt | n/a | Integrado en el servidor |
| Drafter estilo EAGLE | no disponible | no disponible | Cabezas autoregresivas, una pasada por borrador | no disponible | No disponible en la informacion |

No se dispone de datos publicados de otros drafters comparables para LFM3-1.7B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: sin los estados ocultos, el embedding y la cabeza LM de LFM3-1.7B no produce salida alguna.
- Es un derivado comunitario y experimental de Lottolabs, no una release oficial de Liquid AI ni de Tenstorrent.
- Solo declara inglés; la cobertura del vocabulario de borrador cae al 0,976 en datos multilingües y al 0,976 en tool calling, lo que reduce la aceptación fuera de chat, código y matemáticas.
- En cargas con mucha copia de texto (edición de código, tool calls) la aceleración es de 0,99-1,03x, es decir, prácticamente nula.
- La ganancia medida procede de un único usuario en P150 con mediana de 3 semillas; no hay datos de concurrencia alta ni de otras plataformas.
- La licencia LFM Open License v1.0 impone condiciones para uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- El repositorio incluye rutas absolutas del host de compilación en `code/`, lo que requiere ajustes para reproducir el entrenamiento.
- No se han publicado evaluaciones de sesgos ni de tasa de alucinación; al ser un drafter verificado, la calidad del texto depende enteramente del modelo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/LFM3-1.7B-DFlash-Drafter
- Modelo objetivo: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pila de serving P150: https://huggingface.co/Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150
- Paper de referencia DFlash: arXiv 2602.06036 (citado en la model card; no se proporciona URL directa)
