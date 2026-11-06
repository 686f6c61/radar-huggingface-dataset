# avencera/silero-vad-v6-safetensors

## Resumen

Silero VAD v6 en formato safetensors es una redistribucion de los pesos de Silero VAD 6.2.3 (rama de 16 kHz) realizada por el proyecto avencera para su uso nativo desde Rust en la libreria scriptrs. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son identicos a los originales de Silero Team, y el unico cambio es el empaquetado en safetensors con metadatos que registran el origen y la configuracion. Su funcion es la deteccion de actividad de voz (VAD), es decir, segmentar audio en regiones con y sin habla.

El modelo es extremadamente pequeno (309.633 parametros, 1,2 MB en safetensors) y esta pensado para ejecutarse en CPU dentro de un pipeline de transcripcion de audio largo. Segun la model card, scriptrs lo ejecuta a unos 0,5 segundos de computo por hora de audio, lo que permite planificar la transcripcion alrededor de las regiones con habla en lugar de procesar el audio completo. El autor argumenta que en GPU cada paso de la recurrencia costaria mas en lanzamientos de kernels que el paso completo en CPU.

La relevancia de esta ficha es acotada: es un artefacto de integracion para un ecosistema concreto (scriptrs, Rust), no un modelo de proposito general. Su interes practico esta en el uso combinado con Silero VAD v5 que hace scriptrs por defecto, con umbral 0,6, tomando la probabilidad de habla maxima de cada ventana entre ambos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente de Silero VAD (detalle de capas no disponible en la informacion proporcionada) |
| Parametros totales | 309.633 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio; ventana de analisis no disponible) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32; no confirmado) |
| Idiomas soportados | No disponible (VAD independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 1,2 MB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que Silero VAD emplea una recurrencia por pasos, segun la justificacion del autor sobre el coste en GPU de los kernel launches. No se especifican numero de capas, tipo de celda (LSTM/GRU/conv recurrente), tasa de muestreo interna ni ventana de analisis. El modelo opera sobre audio mono a 16 kHz en formato f32.

Tampoco se documentan en la informacion proporcionada los datos de entrenamiento, el numero de tokens o horas de audio, ni si hubo ajuste fino con RLHF/DPO (no aplicable en un VAD). Lo que si se indica es que esta version corresponde a Silero VAD 6.2.3, rama de 16 kHz, y que los pesos no han sido modificados respecto al original; el archivo safetensors incluye en sus metadatos la fuente, el SHA-256 del modelo original (`e1122837f4154c511485fe0b9c64455f7b929c96fbb8d79fbdb336383ebd3720`) y su configuracion.

## Capacidades

- Deteccion de actividad de voz por ventanas, devolviendo una probabilidad de habla por cada una.
- Segmentacion de audio largo para planificar transcripcion, integrada en scriptrs mediante `LongFormMode::Vad`.
- Ejecucion nativa en CPU desde Rust, sin dependencia de runtime de Python.
- Uso combinado con Silero VAD v5: scriptrs mantiene la probabilidad maxima de cada ventana entre ambos modelos con umbral 0,6.
- Seleccion de modelo individual mediante `VadSegmentationConfig::for_model(VadModel::SileroV6)`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio mas alla de la clasificacion voz/no voz.

## Casos de uso

- Planificacion de transcripcion de audio largo: scriptrs usa el VAD para delimitar regiones con habla y evitar pasar silencio o musica al modelo ASR, reduciendo coste de computo en horas de audio.
- Procesamiento de llamadas de earnings: en el conjunto Earnings-21 el uso de v6 reduce el WER de Parakeet TDT 0.6B v3 del 8,4 % (v5) al 8,0 %, por lo que es adecuado para pipelines de transcripcion de reuniones corporativas.
- Reuniones con microfono de campo lejano: en AMI far-field v6 obtiene 25,6 % de WER frente a 26,0 % de v5, y el combinado baja a 25,3 %, util para diarizacion y actas automaticas.
- Filtrado previo en entornos ruidosos: aunque v6 empeora en CHiME-6 (61,9 % frente a 54,0 % de v5), el combinado alcanza 53,4 %, de modo que el caso realista es usar ambos modelos en lugar de v6 solo.
- Preprocesado en aplicaciones Rust de bajo consumo: al correr en CPU a ~0,5 s por hora de audio, encaja en servicios sin GPU que necesitan trocear audio antes de enviarlo a un ASR remoto.
- Deteccion de silencios para control de turnos en asistentes de voz: la probabilidad por ventana permite cerrar turnos de habla con un umbral configurable.
- Investigacion en ASR: servir como componente reproducible (pesos con SHA-256 registrado) en experimentos de segmentacion comparando v5, v6 y la combinacion.

## Benchmarks y rendimiento

Resultados de WER de Parakeet TDT 0.6B v3 en RTX 5090 con planificacion VAD de audio largo, segun la model card:

| Conjunto | v5 | v6 | v5 y v6 (por defecto en scriptrs) |
|---|---:|---:|---:|
| Habla dispersa, 24 % habla (4,2 h) | 2,3 % | 3,0 % | 2,3 % |
| Earnings-21 (llamadas de resultados) | 8,4 % | 8,0 % | 8,0 % |
| AMI reuniones, mezcla de auriculares | 21,1 % | 20,7 % | 20,8 % |
| AMI reuniones, microfono de campo lejano | 26,0 % | 25,6 % | 25,3 % |
| CHiME-6 cenas | 54,0 % | 61,9 % | 53,4 % |

v5 y v6 por separado usan umbral de habla 0,5; el combinado usa 0,6. El conjunto disperso son enunciados de LibriSpeech test-clean separados por 15 a 75 s de musica de pelicula, efectos, ambiente y ruido de bajo nivel. No se publican metricas intrinsecas del VAD (ROC-AUC, precision/recall) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para CPU y el autor justifica explicitamente no ejecutarlo en GPU.
- GPU: no recomendada. En GPU el coste de kernel launches por paso de la recurrencia supera el coste total del paso en CPU.
- CPU: cualquier CPU moderna basta para 309.633 parametros; el rendimiento declarado es de aproximadamente 0,5 s por hora de audio.
- Cabe en cualquier consumer GPU, pero no aporta ventaja frente a CPU.
- Despliegue: libreria Rust scriptrs 0.5 o superior con features `cuda` y `vad` (la feature `cuda` es para el ASR, no para el VAD); descarga desde este repositorio en revisiones fijadas.
- Latencia y throughput: ~0,5 s de computo por hora de audio en CPU, segun el autor; no se detallan cifras por nucleo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| avencera/silero-vad-v6-safetensors | 309.633 | safetensors | MIT | Redistribucion de Silero VAD 6.2.3, 16 kHz, para Rust |
| avencera/silero-vad-v5-safetensors | No disponible | safetensors | MIT | Version v5; mejor en CHiME-6, peor en Earnings-21 y AMI far-field |
| Silero VAD original (snakers4/silero-vad) | No disponible | PyTorch/JIT | MIT | Fuente de los pesos; ecosistema Python |

No se dispone de comparacion con otros VAD (WebRTC VAD, Silero VAD v4) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos a Silero VAD 6.2.3; cualquier mejora o defecto del original aplica aqui.
- v6 empeora claramente frente a v5 en audio de cenas ruidosas (CHiME-6: 61,9 % vs 54,0 % de WER), por lo que usarlo solo puede degradar la transcripcion en ese dominio.
- En habla dispersa con musica y efectos, v6 tambien es peor que v5 (3,0 % vs 2,3 %); el uso recomendado es la combinacion de ambos.
- Dependencia de un ecosistema concreto: la libreria es `scriptrs` (Rust); no hay integracion documentada con Python, vLLM, llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-11-01, por lo que no hay evidencia de uso en produccion fuera del proyecto del autor.
- No se documentan sesgos, comportamiento multilingue ni umbrales recomendados por dominio mas alla de los indicados.
- Licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright de Silero Team incluido en `LICENSE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avencera/silero-vad-v6-safetensors
- Modelo v5 del mismo autor: https://huggingface.co/avencera/silero-vad-v5-safetensors
- Repositorio scriptrs: https://github.com/avencera/scriptrs
- Silero VAD original: https://github.com/snakers4/silero-vad
