# ling0322/libwaifu-cosyvoice-3-visemes

## Resumen

libwaifu-cosyvoice-3-visemes es un modelo auxiliar de pequeno tamano (2,5 MB en float32) desarrollado por ling0322 que predice la forma de la boca (visema) para cada token de habla generado por Fun-CosyVoice3-0.5B-2512. No es un modelo de sintesis de voz autonomo: se acopla como modelo adjunto a una pipeline de libwaifu que tenga cargado el paquete CosyVoice3, y devuelve un visema por cada fotograma de 40 ms de audio, alineado muestra a muestra y de forma compatible con streaming. Resuelve el problema del lip-sync en avatares y personajes animados sin necesidad de un pipeline de reconocimiento fonetico separado en tiempo de ejecucion.

Tecnicamente es una capa de clasificacion muy ligera: toma el embedding de flujo de CosyVoice3 (80 dimensiones) del token actual y de sus dos vecinos (3 x 80 = 240 entradas), los pasa por una capa oculta de 256 unidades y produce una distribucion sobre ocho visemas (A, E, I, O, U, @, MBP y REST). El modelo incluye una copia del embedding de tokens, por lo que no lee los pesos de CosyVoice3 en inferencia. Esta pensado para chino, japones e ingles, y se distribuye con licencia Apache 2.0.

Su relevancia es practica: cubre un hueco tipico en pipelines de TTS para avatares, donde la animacion facial suele requerir alineadores o modelos de audio a visema de mayor coste. Aqui el coste es minimo (2,5 MB, ejecucion en CPU) y la integracion se hace mediante la API C de libwaifu con una unica peticion de atributo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador MLP de una capa oculta (240 -> 256 -> 8) sobre embeddings de flujo de CosyVoice3 |
| Parametros totales | no disponible (pesos en float32 de 2,5 MB; estimacion aproximada de decenas de miles de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana local de 3 tokens (actual y vecinos) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en float32 |
| Idiomas soportados | zh, ja, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) + manifiesto YAML + tabla de distribuciones por token |

## Arquitectura y entrenamiento

El modelo es un clasificador ligero que opera sobre la representacion interna de CosyVoice3. Para cada token de habla toma el embedding de flujo del token actual y de los dos adyacentes (3 x 80 dimensiones), los proyecta a traves de una capa oculta de 256 unidades y genera una distribucion sobre ocho clases de visema: las vocales abiertas A, E, I, O, U; la semiabierta @ (e y en del mandarin, schwa del ingles); MBP para bilabiales con labios cerrados (b, p, m); y REST para boca relajada y ligeramente cerrada. El paquete incluye una copia del embedding de tokens de CosyVoice3, de modo que el modelo no necesita acceder a los pesos del TTS base. Tambien se publica `cosyvoice3_visemes.table`, con la distribucion por token aislado para quienes no dispongan de los vecinos.

El entrenamiento se realizo con etiquetas derivadas de texto, ya que no existen corpus que anoten tokens de habla con formas de boca. CosyVoice3 sintetizo 442 frases (200 en chino, 120 en japones y 122 en ingles) con ocho voces; Qwen3-ForcedAligner alineo cada caracter, mora o palabra sobre el audio; y pypinyin, una tabla de kana y CMUdict convirtieron la transcripcion en visemas, con los fotogramas de consonante interpolados entre la forma previa y la posterior. La evaluacion se hizo con separacion por voz sobre tokens cuya etiqueta tiene al menos 0,8 de probabilidad en una clase.

## Capacidades

- Prediccion de visemas a partir de tokens de habla de CosyVoice3, con salida de un visema por cada 40 ms de audio (VISEME_FRAME_MS).
- Alineacion muestra a muestra con el audio generado, independiente de la velocidad del habla.
- Funcionamiento en streaming, integrado en la pipeline de libwaifu.
- Cobertura multilingue para chino, japones e ingles, con inventario de visemas adaptado a cada uno (vocales abiertas, @ para schwa y e/en, MBP para bilabiales).
- Deteccion de cierres bilabiales (m, b, p) con una tasa de acierto de 0,81.
- No realiza sintesis de voz, reconocimiento de audio ni ninguna otra tarea; depende de CosyVoice3 para generar los tokens.

## Casos de uso

- Animacion facial de avatares en tiempo real: la pipeline de libwaifu solicita `WAIFU_REQUEST_TEXT_TO_SPEECH_VISEMES` y recibe un visema cada 40 ms, que puede mapearse directamente a blendshapes o sprites de boca de un personaje virtual mientras el audio se reproduce en streaming.
- Personajes de videojuego o VTuber: el modelo se ejecuta en CPU junto al TTS y aporta sincronizacion labial en chino, japones o ingles sin un alineador fonetico adicional en produccion.
- Subtitulado y doblaje animado: al estar alineado muestra a muestra con el audio sintetizado, permite generar animaciones de boca sobre un video existente o sobre un personaje 2D sin reentrenar el TTS.
- Prototipado de interfaces conversacionales con cara: al ocupar 2,5 MB y no requerir GPU, se puede desplegar en dispositivos de bajos recursos o en el navegador mediante el runtime de libwaifu.
- Evaluacion e investigacion de lip-sync: la tabla por token (`cosyvoice3_visemes.table`) permite analizar la distribucion de visemas por token sin depender de los vecinos, util para estudiar errores de alineacion o comparar con otros mapeos.
- Integracion en herramientas de creacion de contenido: estudios que generan voces con CosyVoice3 pueden anadir animacion labial automatica a sus renders sin cambiar el modelo de voz ni el flujo de trabajo.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con separacion por voz sobre tokens con etiqueta de al menos 0,8 en una clase:

| Metrica | Valor |
|---|---|
| Top-1 global (con token anterior y posterior) | 0,68 |
| Top-1 chino / japones / ingles | 0,71 / 0,69 / 0,59 |
| Cierres m, b, p detectados | 0,81 |
| Vocales cerradas erroneamente | 1,9 % |

El autor indica que A, I y REST se aciertan aproximadamente cuatro de cada cinco veces, mientras que E, O, U y @ se confunden con frecuencia entre visemas vecinos. Las etiquetas de referencia son aproximadas (el alineador solo temporiza el ingles por palabra), por lo que las cifras deben interpretarse como cotas inferiores del rendimiento real.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos son 2,5 MB en float32 y el modelo se ejecuta en el procesador.
- GPU recomendadas: no aplica; la carga recae en el modelo TTS base (CosyVoice3-0.5B), no en este clasificador.
- Cabe en cualquier GPU consumer y en CPU; no hay requisito especifico de memoria grafica.
- Despliegue: mediante la libreria libwaifu, que carga el manifiesto `cosyvoice3-visemes.yaml` y lo adjunta a la pipeline con `waifu_pipeline_attach_model(pipeline, WAIFU_ATTACHED_MODEL_TEXT_TO_SPEECH_VISEMES, NULL, visemes)`.
- Latencia y throughput: no disponibles; al ser una capa unica de 256 unidades sobre 240 entradas, el coste por fotograma es despreciable frente a la sintesis de voz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| libwaifu-cosyvoice-3-visemes | Clasificador de visemas sobre tokens de CosyVoice3 | no disponible (2,5 MB) | zh, ja, en | Apache 2.0 | Acoplado a CosyVoice3 y libwaifu |
| Fun-CosyVoice3-0.5B-2512 | TTS | 0,5 B | zh, ja, en (segun model card base) | Apache 2.0 | Genera audio; no produce visemas |
| Alineadores forzados tipo Qwen3-ForcedAligner | Alineacion texto-audio | no disponible | multilingue | no disponible | Requiere texto y audio; no es un modelo de visemas |

No se dispone de informacion sobre otros modelos de prediccion de visemas comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de voz: sin una pipeline de libwaifu con el paquete CosyVoice3 cargado, no produce ninguna salida util.
- Precision limitada: top-1 global de 0,68 y solo 0,59 en ingles; E, O, U y @ se confunden entre si con frecuencia.
- Las etiquetas de entrenamiento son aproximadas (alineacion por palabra en ingles), por lo que las metricas no reflejan una referencia exacta.
- El autor senala que falta suavizar el parpadeo entre visemas cercanos; la seleccion actual es un visema por fotograma sin postprocesado.
- Cobertura limitada a chino, japones e ingles; no hay soporte declarado para otras lenguas.
- Dependencia de la version concreta de CosyVoice3 (Fun-CosyVoice3-0.5B-2512) y de su tokenizador; cambios en el modelo base pueden invalidar la copia del embedding incluida.
- No es un producto oficial de FunAudioLLM ni esta respaldado por ellos.
- Licencia Apache 2.0 permite uso comercial, pero el paquete incluye un tensor de CosyVoice3; deben respetarse `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ling0322/libwaifu-cosyvoice-3-visemes
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Paquete CosyVoice3 para libwaifu: https://huggingface.co/ling0322/libwaifu-cosyvoice-3
- Repositorio libwaifu: https://github.com/ling0322/libwaifu
- Documentacion de visemas: https://github.com/ling0322/libwaifu/blob/main/docs/cosyvoice3.md#visemes
