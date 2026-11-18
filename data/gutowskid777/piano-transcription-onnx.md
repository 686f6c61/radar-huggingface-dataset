# gutowskid777/piano-transcription-onnx

## Resumen

`gutowskid777/piano-transcription-onnx` es un repositorio de artefactos ONNX que empaqueta dos sistemas de audio preexistentes para su ejecución íntegra en el navegador: un transcriptor de piano (Transkun V2, de Yujia Yan y Zhiyao Duan) y un separador de fuentes (htdemucs_6s, de Meta AI Research). No es un modelo entrenado por el autor del repo, sino una redistribución de pesos convertidos a ONNX y divididos en grafos para que `onnxruntime-web` pueda ejecutarlos con WebGPU o WebAssembly multihilo. El objetivo es transcribir grabaciones de piano a notas y MIDI sin enviar audio a ningún servidor.

El paquete se compone de tres ficheros: `transkun-forward.onnx` (entrada de frames, salida de puntuaciones y contexto), `transkun-heads.onnx` (refinamiento de velocidad y onsets/offsets por nota) y `htdemucs_6s.onnx` (red central de Demucs v4 para aislar el piano de una mezcla completa). La división en dos grafos de Transkun proviene del export ONNX de Neothesia y permite que la parte pesada se ejecute en GPU mientras la decodificación semi-CRF Viterbi se hace fuera del grafo.

Su relevancia es práctica: ofrece un pipeline de transcripción musical listo para desplegar en cliente, con licencia MIT en el repo, aunque los pesos subyacentes arrastran las condiciones de sus autores originales (en particular, MAESTRO está bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transkun V2 (transcriptor de piano con decodificacion semi-CRF) + Demucs v4 htdemucs_6s (separacion de fuentes); exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 16 s con salto de 8 s (Transkun) y segmentos de 7,8 s con 25 % de solape (Demucs) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | MIT para el repo; pesos sujetos a licencias de los autores originales (Transkun MIT; MAESTRO CC BY-NC-SA 4.0; Demucs MIT) |
| Formato de pesos | ONNX (`transkun-forward.onnx`, `transkun-heads.onnx`, `htdemucs_6s.onnx`) |

## Arquitectura y entrenamiento

Transkun V2 es un transcriptor simbolico de piano que recibe frames de audio (44,1 kHz estéreo, ventanas de 16 s con salto de 8 s) y produce puntuaciones de notas y un contexto que se decodifica mediante un Viterbi semi-CRF para obtener intervalos de nota. El export se ha partido en dos grafos: `transkun-forward` (entrada `frames` con forma `[1, 2, nFrame, 4096]`, salidas `score` y `ctx`) y `transkun-heads` (entrada `attr` `[nIntervals, 3*D]`, salidas `velocity` y `of`), que refina velocidad y onsets/offsets por nota. Según la model card, el modelo se entrenó sobre el dataset MAESTRO.

Demucs v4 htdemucs_6s es la red central del separador de fuentes de Meta AI; el grafo ONNX contiene solo la red, mientras que la STFT y su inversa se ejecutan fuera del grafo. Procesa segmentos de 7,8 s (343.980 muestras) con 25 % de solape, y el piano corresponde al índice de fuente 5. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de audio de este tipo).

## Capacidades

- Transcripcion de audio de piano a notas con marcas de onset, offset y velocidad.
- Generacion de MIDI a partir de la transcripcion (pipeline `audio-to-audio`).
- Separacion de fuentes con htdemucs_6s para aislar la pista de piano de una mezcla completa antes de transcribir.
- Ejecucion integra en el dispositivo del usuario mediante `onnxruntime-web`, con WebGPU y WebAssembly multihilo como respaldo.
- Procesamiento por ventanas deslizantes que permite transcribir grabaciones de duracion arbitraria encadenando segmentos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de audio puro.
- No dispone de capacidades multilingues, de vision ni de audio de entrada distinto de música.

## Casos de uso

- Transcripcion de grabaciones de piano en el navegador: el usuario sube un audio y obtiene MIDI sin que el fichero salga de su equipo, gracias a la ejecucion local con WebGPU o WASM.
- Extraccion de piano de una mezcla musical: se pasa la cancion por `htdemucs_6s.onnx` para aislar la fuente de piano (índice 5) y luego se transcribe con Transkun, util para crear partituras de covers.
- Herramientas educativas de analisis musical: visualizacion de notas, onsets y velocidades en tiempo real en una aplicacion web, sin backend ni costes de servidor.
- Edicion y correccion de partituras: el MIDI generado sirve como base para editores que permiten ajustar notas y velocidades manualmente.
- Prototipado rapido de aplicaciones musicales: al ser ONNX y MIT, se puede integrar en demos y MVPs sin dependencias de infraestructura.
- Investigacion en transcripcion automatica de musica (AMT): permite reproducir el pipeline Transkun + Demucs en entornos web para experimentos comparativos.
- Procesamiento por lotes en cliente: al usar ventanas de 16 s con salto de 8 s, se pueden transcribir piezas largas encadenando segmentos sin subir el audio a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repo pesa 0,2 GB, por lo que los tres grafos ONNX caben holgadamente en memoria de una GPU de consumo.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano del repo, es compatible con GPUs de consumo actuales.
- GPU recomendadas: no especificadas; la model card indica que `transkun-forward` "runs well on WebGPU", sin detallar modelos concretos.
- Cabe en GPU de consumo: si, segun la orientacion a WebGPU; no se enumeran modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WebAssembly multihilo) en navegador; los ficheros ONNX son compatibles con otros runtimes ONNX, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana de audio | Licencia | Despliegue |
|---|---|---|---|---|
| gutowskid777/piano-transcription-onnx | Transkun V2 + htdemucs_6s en ONNX | 16 s (salto 8 s) / 7,8 s (Demucs) | MIT en repo; pesos con condiciones de autores (MAESTRO CC BY-NC-SA 4.0) | Navegador (onnxruntime-web) |
| Transkun original (Yujia-Yan/Transkun) | Transcriptor de piano (PyTorch) | No disponible en esta ficha | MIT | Python/PyTorch |
| Demucs v4 (facebookresearch/demucs) | Separador de fuentes (PyTorch) | Segmentos configurables | MIT | Python/PyTorch |
| Neothesia (neothesia-ai) | Export ONNX de Transkun para visualizacion | No disponible | No disponible en esta ficha | Aplicacion de escritorio |

La comparativa se limita a los proyectos de origen porque no se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia de los pesos: aunque el repo es MIT, Transkun se entrenó sobre MAESTRO, licenciado CC BY-NC-SA 4.0 para uso no comercial; el uso comercial del transcriptor puede quedar restringido.
- El autor pide explicitamente acreditar a los autores originales (Yan y Duan para Transkun; Defossez y Rouard para Demucs) y no a este repositorio.
- Especializado en piano: no se documenta soporte para otros instrumentos ni para polifonia general.
- La separacion de fuentes con htdemucs_6s puede introducir artefactos que degraden la transcripcion posterior.
- Dependencia de WebGPU: en navegadores sin soporte, la alternativa es WebAssembly multihilo, con rendimiento presumiblemente inferior (no cuantificado).
- No se publican metricas de precision (F1 de notas, onset, etc.) ni comparativas con el modelo original en PyTorch.
- Riesgo de alucinacion en el sentido musical: notas espurias o fusionadas en pasajes con pedales, arpegios rapidos o ruido; no cuantificado en la informacion disponible.
- No hay datos sobre sesgos, idiomas ni comportamiento en dominios distintos del piano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gutowskid777/piano-transcription-onnx
- Transkun (Yujia Yan y Zhiyao Duan): https://github.com/Yujia-Yan/Transkun
- Neothesia (export ONNX de Transkun): https://github.com/PolyMeilex/Neothesia
- Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
