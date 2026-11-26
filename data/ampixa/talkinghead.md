# ampixa/talkinghead

## Resumen

ampixa-talkinghead es un modelo de generacion de video talking-head a partir de una unica fotografia y un clip de audio. Dado un retrato frontal y una locucion, produce un video donde el rostro sincroniza los labios con el habla. Lo desarrolla ampixa y se distribuye bajo licencia Apache-2.0. Resuelve el problema de la animacion facial audio-driven en tiempo real sobre hardware de consumo, un espacio tradicionalmente dominado por pipelines de difusion mucho mas pesados.

La relevancia tecnica esta en su empaquetado multiplataforma: exporta el mismo modelo a Core ML (Apple silicon), ONNX/TensorRT (NVIDIA) y ONNX Runtime Web (WebGPU), con un peso de descarga de aproximadamente 170 MB por plataforma. El render nativo alcanza unos 27 fps en un M4 Pro y 25 fps en un M3 Pro, lo que lo situa en el regimen de tiempo real en portatiles.

Esta construido y evaluado especificamente para nepalí e ingles, lo que lo aleja de los modelos genericos centrados solo en ingles. Deriva de Ditto (Apache-2.0) y de LivePortrait / S2G-MDDiffusion (MIT), y usa MediaPipe para el recorte facial. No es un modelo de lenguaje: es un pipeline de sintesis de video condicionado por audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de animacion facial audio-driven derivado de Ditto (LipSync + motion) y LivePortrait / S2G-MDDiffusion; renderizador neuronal con exportaciones Core ML, ONNX/TensorRT y ONNX Runtime Web |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos; no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen artefactos compilados por plataforma: Core ML, ONNX, TensorRT, PyTorch) |
| Idiomas soportados | nepalí (ne), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML, ONNX (TensorRT se compila en el primer uso), PyTorch, ONNX para onnxruntime-web (WebGPU) |

## Arquitectura y entrenamiento

El modelo es un pipeline de sintesis de video, no un transformer de lenguaje. Combina un modulo de sincronizacion labial condicionado por audio con un modulo de movimiento facial y un renderizador neuronal, siguiendo el linaje de Ditto (antgroup/ditto-talkinghead) y de LivePortrait / S2G-MDDiffusion. El recorte y la preparacion del rostro se hacen con MediaPipe. La entrada es una imagen estatica mas una pista de audio; la salida es un video con los labios sincronizados y movimiento natural de cabeza y expresion.

El repositorio distribuye varias variantes del renderizador: `common/` (setup facial y modelos de audio y movimiento), `coreml/` (render en tiempo real para Apple silicon), `onnx/` (render en tiempo real para NVIDIA, con motores TensorRT construidos en el primer uso), `realtime/` (render en tiempo real en PyTorch como fallback), `full/` (render de calidad completa en PyTorch para offline/CPU) y `web/` (redes en ONNX para onnxruntime-web con WebGPU). No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO; al tratarse de un modelo de vision y audio, esos conceptos no aplican del mismo modo. La evaluacion declarada se hizo sobre casos en nepalí e ingles (15 casos, con SyncNet LSE-C).

## Capacidades

- Generacion de video talking-head a partir de una foto y un clip de audio (`Avatar("photo.jpg").speak("speech.wav", "out.mp4")`).
- Sincronizacion labial audio-driven con calidad comparable a Ditto en la evaluacion del autor.
- Movimiento facial y de cabeza generado por el modulo de motion.
- Ejecucion en tiempo real en Apple silicon (Core ML) y NVIDIA (ONNX/TensorRT).
- Ejecucion en navegador via WebGPU (Chrome/Edge recientes con WebGPU, WebCodecs y JSPI), sin subir datos a servidor.
- Soporte de dos idiomas de evaluacion: nepalí e ingles.
- API Python simple (`ampixa_talkinghead.Avatar`) y paquete instalable desde el repositorio Git.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es un modelo de sintesis de video.

## Casos de uso

- **Locucion de avatares para contenido educativo**: dado un retrato del ponente y una locucion grabada, generar el video final sin regrabar, util para cursos en nepalí e ingles con SyncNet LSE-C ~5.2.
- **Doblaje y localizacion de video corto**: reemplazar el audio de un clip por una version en otro idioma y regenerar la sincronizacion labial sobre el mismo rostro, aprovechando el soporte nepalí/ingles.
- **Prototipado de asistentes conversacionales con cara**: integrar el paquete en una app de escritorio o web que muestre un avatar que responde en tiempo real (27 fps en M4 Pro) a partir de TTS como sanoTTS.
- **Animacion de retratos historicos o de dominio publico**: el propio autor demuestra pinturas de dominio publico animadas con voces sinteticas; util en museos, divulgacion y patrimonio.
- **Generacion de video en el navegador con privacidad**: el demo en ampixa.com/talkinghead procesa todo en la GPU del visitante via WebGPU, sin subir la foto ni el audio, adecuado para aplicaciones sensibles a la privacidad (aunque no en tiempo real: ~245 ms/frame en M4 Pro).
- **Pipelines offline por lotes**: usar la variante `full/` en PyTorch sobre CPU para renderizar muchos videos de calidad completa sin GPU dedicada.
- **Integracion en herramientas de accesibilidad**: generar video con sincronizacion labial para personas con dificultades de habla a partir de audio sintetizado, siempre que se respeten las restricciones eticas del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Render loop, Apple M4 Pro (Core ML) | 36,5 ms/frame (~27 fps) |
| Render loop, Apple M3 Pro (Core ML) | 39,9 ms/frame (25 fps) |
| Descarga por maquina | 169 MB (Apple silicon), 168 MB (NVIDIA) |
| Memoria pico durante `speak()` | ~1,7 GB |
| Sincronizacion labial (SyncNet LSE-C) vs Ditto | 5,23 vs 5,31 (15 casos, nepalí + ingles) |
| Navegador, M4 Pro (WebGPU) | ~245 ms/frame (un clip de 10 s tarda ~1 min) |
| SyncNet LSE-C navegador vs paquete Python | 5,66 vs 5,44 y 4,54 vs 4,63 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo; las metricas relevantes son de latencia, memoria y sincronizacion labial, recogidas arriba.

## Requisitos de hardware

- **VRAM / memoria**: pico de ~1,7 GB durante `speak()`; descarga de ~170 MB por plataforma.
- **Apple silicon**: Core ML en M4 Pro (~27 fps) y M3 Pro (25 fps); usa el Neural Engine.
- **NVIDIA**: ruta ONNX con motores TensorRT construidos en el primer uso; GPU recomendadas no especificadas en la informacion disponible (se menciona soporte NVIDIA generico).
- **Consumer GPU**: si, en Apple silicon de gama M3/M4 y en GPUs NVIDIA compatibles con TensorRT; no se detallan modelos concretos.
- **Navegador**: Chrome o Edge recientes con WebGPU, WebCodecs y JSPI; ~245 ms/frame en M4 Pro (no tiempo real).
- **Despliegue**: paquete Python (`pip install "git+https://github.com/Ampixa/talkinghead.git"`), extra `[tensorrt]` para NVIDIA, ONNX Runtime Web para navegador; variante `full/` en PyTorch para CPU/offline.
- **Latencia/throughput**: ver tabla de benchmarks; el render nativo esta en regimen de tiempo real (25-27 fps), el navegador no.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas evaluados | Tiempo real | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ampixa-talkinghead | Talking-head audio-driven, multiplataforma (Core ML/ONNX/TensorRT/WebGPU) | nepalí, ingles | Si, nativo (~27 fps M4 Pro) | Apache-2.0 | HF + GitHub + demo web |
| Ditto (antgroup/ditto-talkinghead) | Talking-head audio-driven | no disponible en la informacion | no disponible | Apache-2.0 | GitHub |
| LivePortrait / S2G-MDDiffusion | Animacion facial | no disponible en la informacion | no disponible | MIT | Repositorios propios |

La comparacion cuantitativa disponible es la de sincronizacion labial frente a Ditto (LSE-C 5,23 vs 5,31 en 15 casos). No hay datos publicados en la informacion para comparar parametros, contexto ni rendimiento con otras alternativas.

## Limitaciones y advertencias

- Funciona mejor con foto frontal y boca cerrada; los dientes visibles impiden que la boca se cierre correctamente al hablar.
- Rendimiento debil en pinturas estilizadas con barbas densas o pinceladas marcadas, en rostros muy pequenos dentro de planos de cuerpo entero y en perfiles.
- Solo evaluado en nepalí e ingles; el comportamiento en otros idiomas no esta documentado.
- Riesgo de uso indebido: el autor prohibe explicitamente su uso para suplantar a personas reales o hacerles decir cosas que no dijeron.
- En navegador no es tiempo real (~245 ms/frame en M4 Pro); requiere Chrome/Edge recientes con WebGPU, WebCodecs y JSPI.
- Licencia Apache-2.0 permite uso comercial, pero el codigo derivado de LivePortrait / S2G-MDDiffusion (MIT) y el uso de MediaPipe (Apache-2.0) imponen obligaciones de atribucion recogidas en `NOTICE`.
- Sin datos publicados sobre sesgos demograficos, robustez ante iluminacion adversa o calidad en audio ruidoso.
- Modelo sin benchmark estandar de lenguaje; no debe compararse con LLMs en tareas de texto.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/talkinghead
- Codigo: https://github.com/Ampixa/talkinghead
- Demo en navegador: https://ampixa.com/talkinghead
- Video demo: https://huggingface.co/ampixa/talkinghead/resolve/main/demo/hero.mp4
- Modelo TTS usado en demos: https://huggingface.co/ampixa/sanoTTS
- Dataset de audio de evaluacion (FLEURS): https://huggingface.co/datasets/google/fleurs
- Ditto (modelo base): https://github.com/antgroup/ditto-talkinghead
