# appautomaton/confucius4-r2t2-fp16-ane

## Resumen

Confucius4-R2T2 es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado originalmente por NetEase Youdao. Esta variante concreta, publicada por App Automaton, es una conversion del modelo a Core AI en precision fp16 optimizada para ejecutarse integramente en el Neural Engine de los chips Apple Silicon. El modelo parte de una arquitectura Qwen3-ASR compuesta por un codificador de audio y un decodificador de texto de 1.700 millones de parametros, y esta afinado especificamente para transcripcion en tiempo real con salida incremental.

La relevancia de esta ficha radica en su enfoque de despliegue: elimina por completo la dependencia de Python, PyTorch, vLLM o APIs en la nube durante la inferencia, ejecutandose mediante el runtime Swift `ane-speech`. Esto permite transcripcion local de baja latencia en Macs con Apple Silicon mientras la GPU queda libre para otras tareas. El modelo cubre 30 idiomas y acepta audio mono a 16 kHz de hasta aproximadamente un minuto por toma.

El repositorio (4,7 GB) no contiene pesos en formato PyTorch ni safetensors, sino exclusivamente artefactos Core AI segmentados (codificador de audio, decodificador en cuatro segmentos, cabeza de salida y constantes de runtime). Es, por tanto, un artefacto de despliegue para macOS 27 o superior, no un checkpoint entrenable convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (codificador de audio + decodificador de texto de 1.7B) |
| Parametros totales | 1.700 millones (decodificador de texto); parametros del codificador de audio no disponibles |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; entrada de audio de hasta aproximadamente un minuto por toma |
| Tipos de cuantizacion | fp16 (pesos y activaciones); existe una build MLX en bf16 |
| Idiomas soportados | 30: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | NetEase Youdao Model Use License Agreement (runtime `ane-speech` bajo MIT) |
| Formato de pesos | Core AI (sin checkpoint PyTorch ni safetensors); build alternativa MLX bf16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR, compuesta por un codificador de audio y un decodificador de texto autorregresivo de 1.700 millones de parametros. Segun la model card, el codificador de audio es identico al de Qwen3-ASR-1.7B, que R2T2 dejo sin cambios; el ajuste fino de NetEase Youdao se concentra en el decodificador para habilitar el modo streaming. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal es el bucle de streaming: implementa rollback de prefijo, un presupuesto de tokens por ventana y commits de solo anexado (append-only), de modo que cada ventana reutiliza los bloques cerrados del codificador de audio y el prefijo cacheado del decodificador, recalculando unicamente lo que cambia. La conversion a Core AI se realizo trazando el grafo MLX de `mlx-speech` y reconstruyendolo con Core AI, sin intervencion de PyTorch, con precision fp16 tras medir los rangos de activacion. Todas las capas se ejecutan en el Neural Engine y, segun el autor, la salida en streaming coincide ventana a ventana con la build MLX en sus clips de prueba.

## Capacidades

- Reconocimiento automatico del habla en streaming con salida de texto incremental y commits de solo anexado.
- Transcripcion por lotes de una grabacion completa (modo `transcribe`).
- Procesamiento de audio en tiempo real desde microfono, alimentando PCM float32 a 16 kHz mono de cualquier longitud por fragmentos (por ejemplo, 480 ms).
- Soporte multilingue para 30 idiomas, incluidos chino, ingles, cantonés, arabe, aleman, frances, espanol, portugues, italiano, coreano, ruso, japones, turco, hindi, tailandes, vietnamita, malayo, neerlandes, sueco, danes, finlandes, polaco, checo, filipino, persa, griego, rumano, hungaro y macedonio.
- Ejecucion integra en el Neural Engine de Apple Silicon, liberando la GPU para otras cargas.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Dictado en tiempo real en aplicaciones macOS: el modelo transcribe la voz a medida que se habla mediante `stream_session`, con commits incrementales que permiten mostrar texto estable sin esperar al final de la frase.
- Subtitulado en directo de reuniones o videollamadas: la salida por ventanas de 480 ms y el bucle de rollback permiten generar subtitulos con latencia baja en local, sin enviar audio a la nube.
- Asistentes de voz offline en Apple Silicon: al ejecutarse en el Neural Engine y no requerir Python ni APIs externas, encaja en apps nativas Swift que necesitan privacidad y funcionamiento sin conexion.
- Transcripcion de notas de voz y entrevistas cortas: el modo `transcribe` procesa grabaciones completas de hasta aproximadamente un minuto por toma, adecuado para notas de reunion o mensajes de voz.
- Accesibilidad y entrada por voz: integracion en herramientas de dictado para usuarios con movilidad reducida, aprovechando el soporte de 30 idiomas para usuarios multilingues.
- Pipelines de documentacion con audio: transcripcion local de clips cortos en flujos de trabajo que ya saturan la GPU con otras tareas, ya que el modelo libera la GPU al ejecutarse en el Neural Engine.
- Procesamiento por lotes de clips cortos en macOS: al cachear la compilacion del modelo para el Neural Engine del equipo, las cargas posteriores son rapidas y permiten procesar muchos clips de forma secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma paridad ventana a ventana con la build MLX bf16 en los clips de prueba del autor, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon y macOS 27 o posterior; el modelo se ejecuta integramente en el Neural Engine.
- VRAM: no aplica en el sentido tradicional; el modelo reside en memoria unificada del sistema Apple Silicon. El repositorio ocupa 4,7 GB en fp16.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que es exclusivo de Core AI y Neural Engine.
- Cabe en equipos consumer Apple Silicon (MacBook Air, MacBook Pro, Mac mini, Mac Studio) con macOS 27; no se especifican requisitos minimos de memoria unificada.
- Despliegue: runtime `ane-speech` (Swift, distribuido tambien como paquete Python via `uv tool install ane-speech` o `pip install ane-speech`). No se contemplan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en cifras; la primera carga compila el modelo para el Neural Engine del equipo y se cachea, por lo que las cargas posteriores tardan una fraccion de segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| appautomaton/confucius4-r2t2-fp16-ane | 1,7B (decodificador) | audio de hasta ~1 min por toma | Core AI / Neural Engine (macOS 27+) | NetEase Youdao Model Use License | Hugging Face (este repo) |
| appautomaton/confucius4-r2t2-bf16-mlx | 1,7B (decodificador) | audio de hasta ~1 min por toma | MLX (Apple Silicon) | NetEase Youdao Model Use License | Hugging Face |
| appautomaton/qwen3-asr-1.7b-fp16-ane | 1,7B (decodificador) | no disponible | Core AI / Neural Engine | no disponible | Hugging Face |
| netease-youdao/Confucius4-R2T2 (original) | 1,7B (decodificador) | no disponible | PyTorch / ecosistema original | NetEase Youdao Model Use License | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER, latencia) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon con macOS 27 o superior; no es ejecutable en GPU NVIDIA, CPU x86 ni entornos Linux.
- Cada toma admite hasta aproximadamente un minuto de habla; para dictados mas largos hay que iniciar una nueva toma.
- El repositorio no contiene checkpoint PyTorch ni safetensors, solo artefactos Core AI, lo que impide reutilizarlo para reentrenamiento o conversion a otros formatos sin pasar por la build MLX.
- Licencia NetEase Youdao Model Use License Agreement con restricciones a la escala comercial (seccion 2.2) y usos de alto riesgo prohibidos (seccion 4.2); la redistribucion debe conservar la licencia y el aviso.
- El autor original no respalda ni garantiza las modificaciones de este trabajo derivado y declina toda responsabilidad sobre el.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, no cuantificado en la informacion disponible.
- Sesgos linguisticos y de acento no documentados; el rendimiento por idioma dentro de los 30 declarados no se detalla.
- No se documentan capacidades de diarizacion de hablantes, puntuacion automatica ni marcas de tiempo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appautomaton/confucius4-r2t2-fp16-ane
- Modelo base original: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Repositorio del modelo base: https://github.com/netease-youdao/Confucius4-R2T2
- Licencia original del modelo base: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
- Runtime `ane-speech`: https://github.com/appautomaton/ane-speech
- Paquete `ane-speech` en PyPI: https://pypi.org/project/ane-speech/
- Build MLX bf16: https://huggingface.co/appautomaton/confucius4-r2t2-bf16-mlx
- Modelo ASR offline relacionado: https://huggingface.co/appautomaton/qwen3-asr-1.7b-fp16-ane
- Repositorio `mlx-speech`: https://github.com/appautomaton/mlx-speech
- Proyecto App Automaton: https://appautomaton.com
- GitHub de App Automaton: https://github.com/appautomaton
- Hugging Face de App Automaton: https://huggingface.co/appautomaton
