# notmax123/BlueV3-onnx

## Resumen

BlueV3-onnx es el paquete de inferencia en formato ONNX del modelo de síntesis de voz (text-to-speech) BlueV3, desarrollado por notmax123 (Max Melichov). Se trata de un sistema TTS multilingüe zero-shot a 44,1 kHz que combina un modelo flow-matching de texto a latente, un predictor de duración y un autoencoder de audio. La identidad de la voz se define a partir de una grabación de referencia de unos 9 segundos, cuyos tokens de estilo se almacenan en un fichero JSON de voz.

El modelo resuelve el problema de la generación de voz sintética de alta fidelidad con clonación de voz a partir de una muestra corta, sin necesidad de entrenamiento adicional por hablante. Esta versión ONNX está pensada para despliegue en CPU y Apple Silicon mediante onnxruntime, sin dependencia de PyTorch en tiempo de inferencia (salvo el patrón de referencia inicial), lo que la hace adecuada para entornos sin GPU o con recursos limitados.

La release corresponde a la versión v3.0.0 (checkpoint 701500) e introduce cambios sustanciales respecto a Blue 2.6: un nuevo autoencoder de audio entrenado desde cero, un paso de reinforcement learning con FlowTTS-GRPO, migración del front-end G2P de eSpeak a polyg2p para inglés, alemán, español e italiano, y un front-end específico para hebreo basado en RenikudPlus. El repositorio ocupa 3,5 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching text-to-latent + predictor de duracion + autoencoder de audio (decoder estilo Supertonic-3), exportado a grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa frases empaquetadas en trozos de <= 300 tokens de fonemas) |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX sin cuantizacion declarada) |
| Idiomas soportados | Hebreo (he), ingles (en), aleman (de), espanol (es, castellano por defecto; variante es-419 para espanol latinoamericano), italiano (it). Front-ends de ruso, yiddish y frances existen en el motor pero no forman parte de esta release |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos en layout `blue_onnx`); pesos PyTorch originales en `notmax123/BlueV3`; codec en `notmax123/blue-codec` |
| Frecuencia de muestreo | 44,1 kHz mono |
| Sampler | 8 pasos Euler, classifier-free guidance 4.0 |
| Tamano del repo | 3,5 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas: un text encoder y un predictor de duracion convierten el texto fonetizado (con etiquetas de idioma `<lang>` ... `</lang>`) en latentes acusticos, y un vector field (modelo flow-matching) genera los latentes finales mediante integracion con 8 pasos Euler y CFG 4.0. Un autoencoder de audio, entrenado desde cero con un decoder de estilo Supertonic-3 (EMA a 380k pasos), decodifica esos latentes a waveform a 44,1 kHz. La voz de referencia condiciona tanto el vector field (primeros 129 frames latentes, ~9 s) como el predictor de duracion (primeros 144 frames).

El text-to-latent se entreno desde cero sobre el nuevo espacio latente (EMA a 700k pasos), con etiquetas de idioma, relleno de bordes en entrenamiento y referencias del mismo hablante de 3-10 s a partir de 200k pasos, aplicando la correccion Robust Speech Flow (forma L1). Posteriormente se aplicaron 1.500 iteraciones de FlowTTS-GRPO (arXiv 2606.23190) sobre el EMA de 700k, con recompensas de similitud de hablante, 1 - WER/PER y DNSMOS OVRL (pesos 1 / 1 / 0,4), aumento de casos dificiles (repeticiones de palabra y frase) y rollouts SDE aleatorios de 5-8 pasos, sobre prompts en hebreo, ingles, aleman, espanol, italiano y ruso. El G2P de ingles, aleman, espanol e italiano paso de eSpeak a polyg2p (Apache-2.0) desde el paso 318k; el hebreo usa RenikudPlus 0.5.0 con normalizador de texto previo (numeros, fechas, moneda, acronimos, URLs).

## Capacidades

- Sintesis de voz multilingue zero-shot con clonacion de voz a partir de una grabacion de referencia de ~9 s.
- Generacion de audio a 44,1 kHz mono con control de velocidad (parametro `speed` = duracion / speed).
- Empaquetado de frases en trozos de hasta 300 tokens de fonemas con 0,1 s de silencio entre trozos.
- Soporte de voces preentrenadas incluidas en `voices/`: `libri_1088` (noa), `libri_6147` (lily), `libri_8088` (adam), `libri_6209` (daniel), `f4` y diez voces adicionales de LibriTTS-R.
- Creacion de voces nuevas a partir de grabaciones mediante `onnx/reference_encoder.onnx`, sin necesidad de PyTorch.
- Normalizacion de texto especifica por idioma (numeros, fechas, moneda, acronimos, URLs) en hebreo.
- Front-end G2P configurable: polyg2p para en/de/es/it (con `BLUE_ES_VARIANT=es-419` para espanol latinoamericano) y RenikudPlus para hebreo.
- Inferencia en CPU y Apple Silicon via onnxruntime con grafos optimizados (Conv 1x1 -> MatMul, aproximadamente 2x mas rapido en ORT CPU EP).
- No se declaran capacidades de tool calling, agentes, vision ni audio-input; el modelo es exclusivamente TTS.

## Casos de uso

- Clonacion de voz para locucion profesional: con una grabacion de referencia de 9 s del hablante objetivo, el modelo genera narraciones a 44,1 kHz con identidad vocal consistente, util para audiolibros, podcasts o doblaje sin reentrenamiento.
- Atencion al cliente con voz sintetica personalizada: desplegado en CPU con onnxruntime, permite generar respuestas habladas con la voz corporativa a partir de un JSON de estilo, sin GPU dedicada.
- Localizacion multilingue de contenido: el soporte de hebreo, ingles, aleman, espanol (castellano y es-419) e italiano permite generar la misma locucion en varios idiomas manteniendo la identidad vocal de referencia.
- Accesibilidad y lectores de pantalla: sintesis de texto a voz de alta fidelidad en hebreo con normalizacion de numeros, fechas, monedas y URLs, adecuada para interfaces de accesibilidad en dispositivos sin GPU.
- Prototipado de asistentes conversacionales: la inferencia ONNX en CPU/Apple Silicon facilita iteraciones rapidas en entornos de desarrollo sin infraestructura de aceleracion.
- Generacion de voces sinteticas para videojuegos o contenido educativo: la posibilidad de crear voces nuevas desde grabaciones con `reference_encoder.onnx` permite construir bibliotecas de personajes sin entrenamiento.
- Doblaje y postproduccion de bajo coste: el control de velocidad y el empaquetado por frases con silencios de 0,1 s facilitan el ajuste temporal sobre pistas existentes.

## Benchmarks y rendimiento

Resultados sobre conjunto de test no visto (200 frases en hebreo + 100 en ingles, voces no vistas en entrenamiento), 8 pasos, CFG 4, seed 11. `700k` = text-to-latent antes de RL; `701500` = esta release.

| Metrica | 700k | 701500 |
|---|---|---|
| Tasa de error de fonemas en hebreo | 1,85 % | 1,53 % (mejor) |
| Similitud de hablante en hebreo (ECAPA) | 0,650 | 0,660 (mejor) |
| DNSMOS OVRL en hebreo | 3,39 | 3,41 (mejor) |
| Ruido de fondo en hebreo | -51,1 dB | -50,2 dB (peor; habla real -48,2 dB) |
| Tasa de error de palabras en ingles (Whisper large-v3) | 1,82 % | 1,88 % (sin cambio) |
| Similitud de hablante en ingles (ECAPA) | 0,660 | 0,671 (mejor) |
| DNSMOS OVRL en ingles | 3,34 | 3,35 (sin cambio) |
| Ruido de fondo en ingles | -38,3 dB | -38,9 dB (mejor) |

Comprobacion en siete idiomas (13 voces x 4 frases en he, en, de, es, it, ru, yi): similitud de hablante mejora en todos los idiomas; ruido de banda, rango de pitch, pausas y UTMOS sin cambios.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete esta orientado a inferencia en CPU y Apple Silicon via onnxruntime, sin requisito de GPU declarado.
- GPU recomendadas: no disponible en la informacion proporcionada; los grafos estan optimizados para ORT CPU EP (Conv 1x1 -> MatMul con ~2x de mejora).
- Cabe en consumer GPU: no disponible; el despliegue declarado es CPU/Apple Silicon.
- Opciones de despliegue: onnxruntime con el layout `blue_onnx` del repositorio BlueTTS (aplicar `bluetts/blue-release.patch` hasta que se integre upstream); descarga via `hf download notmax123/BlueV3-onnx --local-dir ./bluev3_onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se documenta que los grafos por defecto son aproximadamente 2x mas rapidos en ORT CPU EP tras la optimizacion Conv 1x1 -> MatMul.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Compatibilidad: las voces y checkpoints de Blue 2.6 no son compatibles con esta release debido al nuevo autoencoder y a las nuevas estadisticas latentes.
- Los JSON de voz solo son validos para esta release; para voces nuevas hay que generarlas con `onnx/reference_encoder.onnx` a partir de una grabacion.
- Un front-end que elimine las etiquetas `<lang>` produce duraciones incorrectas (medido: 9,75 s en lugar de 3,62 s para una frase); el `blue_onnx` de serie no las conserva.
- El front-end de aleman e italiano usa lexicos derivados de Wiktionary (CC BY-SA); `BLUE_G2P_NOLEX=1` cambia a reglas de polyg2p y reduce la concordancia con las etiquetas de entrenamiento.
- El ruido de fondo en hebreo empeoro respecto a 700k (-50,2 dB frente a -51,1 dB), aunque sigue por debajo del habla real (-48,2 dB).
- Los front-ends de ruso, yiddish y frances existen en el motor pero no forman parte de esta release; su cobertura se documenta en CHECKS.md.
- Riesgo de alucinacion vocal, sesgos de hablante y artefactos acusticos: no se documentan explicitamente en la informacion disponible; deben evaluarse por idioma y voz antes de uso en produccion.
- Licencia MIT: permite uso comercial, pero los lexicos Wiktionary (CC BY-SA) imponen condiciones de atribucion y comparticion para el front-end de aleman e italiano.
- El modelo es exclusivamente TTS; no ofrece tool calling, agentes, vision ni entrada de audio.

## Enlaces

- Hugging Face (ONNX): https://huggingface.co/notmax123/BlueV3-onnx
- Pesos PyTorch: https://huggingface.co/notmax123/BlueV3
- Codec de audio: https://huggingface.co/notmax123/blue-codec
- Repositorio de codigo BlueTTS: https://github.com/maxmelichov/BlueTTS
- Paper FlowTTS-GRPO: arXiv 2606.23190 (referenciado en la model card)
