# appautomaton/confucius4-r2t2-bf16-mlx

## Resumen

appautomaton/confucius4-r2t2-bf16-mlx es una conversión nativa a MLX, en precisión bf16, del modelo de reconocimiento automático del habla (ASR) Confucius4-R2T2 de NetEase Youdao. El modelo original es un sistema de transcripción en streaming de baja latencia afinado a partir de Qwen3-ASR-1.7B, con una arquitectura del grafo Qwen3-ASR compuesta por un codificador de audio y un decodificador de texto de 1.700 millones de parámetros. La conversión la mantiene App Automaton y su objetivo es ejecutar el modelo en Apple Silicon sin PyTorch, sin vLLM y sin API en la nube durante la inferencia.

El artefacto pesa 4,1 GB en el repositorio y suma 2.038.052.480 parámetros totales, correspondientes al codificador de audio más el decodificador de texto de 1,7B. No se trata de un modelo MoE: todos los parámetros están activos en cada pasada. Los pesos no están cuantizados, sino que se han remapeado las claves al árbol de módulos de MLX y se han transpuesto los pesos Conv2D del codificador de audio al formato de MLX.

Su relevancia actual reside en dos factores: por un lado, ofrece decodificación en streaming con chunks configurables de 80 ms a 2 s y compromiso de texto *append-only*, lo que habilita transcripción en tiempo real de baja latencia; por otro, es una de las pocas vías documentadas para ejecutar un ASR de esta familia íntegramente en el stack MLX sobre Apple Silicon, con soporte declarado de 30 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo Qwen3-ASR (codificador de audio + decodificador de texto de 1,7B) |
| Parámetros totales | 2.038.052.480 (2,038 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; ventana de audio configurable con chunks de 80 ms a 2 s |
| Tipos de cuantización | bf16 sin cuantizar; no se documentan otras cuantizaciones |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | NetEase Youdao Model Use License Agreement (license: other) |
| Formato de pesos | safetensors en formato MLX (bf16) |
| Modelo base | netease-youdao/Confucius4-R2T2 |
| Entrada | Audio mono a 16 kHz |
| Librería / runtime | MLX mediante mlx-speech >= 0.5.3 |
| Tamaño del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el grafo Qwen3-ASR, con un codificador de audio que procesa la señal y un decodificador de texto de 1,7B parámetros que genera la transcripción. El modelo del que deriva, Confucius4-R2T2, fue afinado desde Qwen3-ASR-1.7B por NetEase Youdao y está diseñado como un ASR de streaming "verdadero", con chunks de decodificación finos y configurables entre 80 ms y 2 s.

La conversión de App Automaton no modifica la topología del modelo, sino que remapea las claves al árbol de módulos de MLX y transpone los pesos Conv2D del codificador de audio al layout de MLX, manteniendo los pesos en bf16 sin cuantizar. A nivel de runtime, `mlx-speech` implementa el bucle de chunks de NetEase: *rollback* de prefijo, presupuesto de tokens por ventana y commit de solo adición (*append-only*). Cada ventana reutiliza los fotogramas mel de la ventana anterior, los bloques del codificador de audio ya cerrados y el prefijo KV del decodificador, de modo que solo recalcula lo que ha cambiado. El detalle de la composición del dataset de entrenamiento, el número de tokens y el uso de RLHF o DPO no se especifican en la información disponible.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio mono a 16 kHz.
- Transcripción en streaming en tiempo real, con chunks de decodificación configurables entre 80 ms y 2 s.
- Modo de decodificación con *lookahead*: el ejemplo documentado usa `chunk_ms=160` y `lookahead_ms=160`.
- Texto comprometido de solo adición (*append-only*), apto para interfaces incrementales.
- Transcripción offline a partir de un fichero WAV.
- Soporte declarado de 30 idiomas, entre ellos chino, inglés, cantonés (yue), árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Ejecución en Apple Silicon mediante MLX, sin PyTorch, sin vLLM y sin API en la nube.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-step, visión ni audio más allá del propio ASR.

## Casos de uso

- Subtitulado en directo: el modelo emite texto comprometido de forma incremental con latencia de chunk configurable, lo que permite generar subtítulos que se actualizan a medida que llega el audio, sin esperar a que termine la locución.
- Transcripción de reuniones en Apple Silicon: al ejecutarse con MLX sobre hardware de Apple, se puede integrar en aplicaciones de notas de voz o reuniones que transcriben localmente sin enviar audio a servicios en la nube.
- Asistentes de voz interactivos: el modo streaming con chunks de 160 ms y *lookahead* de 160 ms reduce el tiempo hasta el primer texto, lo que resulta adecuado para dictado por voz y comandos hablados.
- Atención al cliente en tiempo real: la transcripción en vivo de llamadas permite alimentar paneles de agente con el texto de la conversación mientras se produce, útil para búsqueda de información o sugerencias durante la llamada.
- Archivado y búsqueda de audio multilingüe: con 30 idiomas declarados, sirve para transcribir y posteriormente indexar archivos de audio y vídeo de distinta procedencia idiomática.
- Accesibilidad y transcripción de contenido: generación de transcripciones para vídeos, pódcast o material educativo, tanto en modo offline sobre ficheros WAV como en captura en directo.
- Procesamiento por lotes en máquinas Apple: transcripción de colas de ficheros de audio en un Mac con Apple Silicon usando el runtime MLX, sin depender de GPU NVIDIA ni de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo requiere Apple Silicon: el runtime es MLX y la *model card* indica explícitamente que no usa PyTorch, vLLM ni API en la nube.
- El repositorio pesa 4,1 GB en bf16 sin cuantizar, por lo que el consumo de memoria unificada de partida será del orden de esa cifra más el *overhead* del runtime y del estado de decodificación.
- No se documentan estimaciones oficiales de VRAM, latencia ni throughput en la información disponible.
- No se documenta soporte para GPU NVIDIA (CUDA), llama.cpp, Ollama ni TGI en esta conversión; el despliegue previsto es vía `mlx-speech`.
- Instalación del runtime: `pip install "mlx-speech>=0.5.3"`.
- Carga del modelo por nombre (`mlx_speech.asr.load("confucius4-r2t2")`) o descarga previa con `hf download appautomaton/confucius4-r2t2-bf16-mlx --local-dir ...`.
- Entrada de audio: mono a 16 kHz, en float32 para el modo streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| appautomaton/confucius4-r2t2-bf16-mlx (esta ficha) | 2,038 mil millones (bf16, sin cuantizar) | 30 | Sí, chunks de 80 ms a 2 s | NetEase Youdao Model Use License Agreement | HuggingFace, runtime MLX |
| netease-youdao/Confucius4-R2T2 (modelo original) | No disponible en la información | 30 (mismos declarados) | Sí, chunks de 80 ms a 2 s | NetEase Youdao Model Use License Agreement | HuggingFace y GitHub de NetEase Youdao |
| Qwen3-ASR-1.7B (origen del afinado) | 1,7B en el decodificador de texto | No disponible | No disponible | No disponible | No disponible |
| Otros ASR de referencia (por ejemplo, Whisper) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware Apple Silicon: la conversión es específica de MLX y no se documenta un camino de despliegue alternativo en este repositorio.
- Licencia restrictiva: los pesos se rigen por el NetEase Youdao Model Use License Agreement, que incluye restricciones al uso comercial a gran escala (sección 2.2) y prohíbe usos de alto riesgo (sección 4.2). El uso comercial a gran escala exige una licencia aparte de NetEase.
- Redistribución: cualquier redistribución posterior debe conservar la licencia y el aviso correspondiente.
- Este repositorio contiene únicamente el artefacto del runtime MLX; no incluye el checkpoint de PyTorch.
- La conversión es un trabajo derivado y el titular original de los derechos no respalda, garantiza ni avala las modificaciones realizadas.
- El runtime `mlx-speech` tiene licencia independiente de la de los pesos.
- Riesgo de alucinación y de errores de transcripción: no se aportan métricas de WER ni datos de evaluación en la información disponible.
- No se documentan sesgos conocidos, ni el comportamiento en condiciones de ruido, solapamiento de hablantes o audio de baja calidad.
- No se especifican limitaciones de contexto del decodificador ni el tratamiento de audios muy largos más allá del bucle de ventanas con *rollback*.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appautomaton/confucius4-r2t2-bf16-mlx
- Modelo original en HuggingFace: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Repositorio del modelo original en GitHub: https://github.com/netease-youdao/Confucius4-R2T2
- Runtime mlx-speech: https://github.com/appautomaton/mlx-speech
- Documentación de mlx-speech para Confucius4-R2T2: https://github.com/appautomaton/mlx-speech/blob/main/docs/confucius4-r2t2.md
- Sitio del proyecto R2T2: https://r2t2.ai/
- App Automaton: https://appautomaton.com
- Perfil de App Automaton en HuggingFace: https://huggingface.co/appautomaton
- Licencia original del modelo: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
