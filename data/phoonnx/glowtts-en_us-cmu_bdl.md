# Phoonnx/glowtts-en_us-cmu_bdl

## Resumen

Glow-TTS en_us-cmu_bdl es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense empaquetado en formato ONNX por el proyecto Phoonnx. El modelo original procede de Rhasspy, concretamente del release v1.0 de Larynx, y se ha reconvertido para su uso con la libreria phoonnx, una implementacion en Python y OVOS orientada a la inferencia local de modelos TTS. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto pensado para ejecucion en dispositivos de recursos limitados.

La arquitectura es Glow-TTS, un modelo de sintesis acustica basado en normalizing flows que genera espectrogramas a partir de fonemas IPA. La conversion de espectrograma a audio la realiza un vocoder HiFi-GAN (variante hifigan-multi-vctk-small) que phoonnx descarga junto con la voz. El front-end de texto utiliza el fonemizador gruut a traves de la libreria scriptconv, de modo que la entrada no es texto plano sino fonemas IPA normalizados.

El interes de este modelo reside en su caracter practico: es un componente listo para produccion en entornos de asistente de voz (OVOS/Mycroft), con una huella de almacenamiento minima y un pipeline claro (texto a fonemas, fonemas a espectrograma, espectrograma a audio). No obstante, la licencia no esta registrada en el repositorio y el autor remite explicitamente a la release original de Rhasspy antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (sintesis acustica con normalizing flows) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica que emplea normalizing flows para mapear fonemas a espectrogramas mel. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS genera la secuencia completa de forma paralela, lo que reduce la latencia de inferencia. El modelo aqui publicado es la version en_us-cmu_bdl del release v1.0 de Larynx, entrenada por Rhasspy sobre el corpus CMU (la voz "bdl" procede del conjunto de datos CMU Arctic, una voz masculina estadounidense). El pipeline completo encadena el modelo Glow-TTS, que produce el espectrograma, con el vocoder HiFi-GAN multi-VCTK small, que lo convierte en forma de onda de audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La model card no detalla hiperparametros ni innovaciones tecnicas mas alla de la propia arquitectura Glow-TTS. El empaquetado en ONNX y la integracion con phoonnx constituyen el principal valor anadido de esta distribucion respecto al artefacto original de Larynx.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio con HiFi-GAN.
- Normalizacion de texto y fonemizacion IPA mediante gruut (a traves de scriptconv).
- Integracion como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion local en Python con la libreria phoonnx.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` como modulo TTS y permite sintetizar respuestas del asistente sin depender de servicios en la nube, gracias a su ejecucion ONNX local.
- Lectura de notificaciones y alertas en sistemas embebidos: su tamano reducido (0,1 GB) y la inferencia no autorregresiva lo hacen adecuado para dispositivos con almacenamiento y CPU limitados.
- Generacion de audiolibros o contenido narrado en ingles: el pipeline texto a fonemas a espectrograma a audio permite procesar lotes de texto de forma desatendida.
- Pruebas de integracion en pipelines de CI/CD para validar la sintesis de voz: la API de phoonnx (`voice.synthesize_wav`) facilita la generacion de ficheros WAV de referencia en tests automatizados.
- Prototipado de interfaces conversacionales: sirve como voz de referencia en ingles para validar flujos de dialogo antes de invertir en voces comerciales o de mayor calidad.
- Investigacion en TTS: al ser un modelo Glow-TTS abierto en ONNX, resulta util como linea base para comparar con vocoders o arquitecturas mas recientes en experimentos academicos.
- Accesibilidad: lectura en voz alta de contenido textual en aplicaciones de escritorio o web que requieran una voz inglesa sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no disponible; el modelo esta empaquetado en ONNX y puede ejecutarse en CPU, aunque se desconoce si phoonnx aprovecha aceleracion GPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/Tamano |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_bdl (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB repo |
| Otras voces Larynx v1.0 (Rhasspy) | Glow-TTS + HiFi-GAN | multi (varias voces) | tarball original | segun release upstream | similar |
| Piper (Rhasspy) | VITS | multi | ONNX | MIT (segun proyecto) | similar o menor |
| Coqui TTS (modelos Glow-TTS) | Glow-TTS | multi | PyTorch/ONNX | MPL 2.0 / otras | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Licencia no registrada: el autor indica explicitamente que no hay licencia grabada y que debe consultarse la release original de Rhasspy antes de usar el modelo. Riesgo legal para uso comercial.
- Idioma unico: solo admite ingles estadounidense; no es multilingue.
- Dependencia de fonemas IPA: la entrada debe pasar por gruut/scriptconv, por lo que errores de fonemizacion afectan directamente a la calidad del audio.
- Calidad de voz limitada: al ser un modelo pequeno de Larynx v1.0, la naturalidad y prosodia son inferiores a las de modelos TTS neuronales modernos de mayor tamano.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos de voz, acento o genero mas alla de la voz "bdl" (masculina) de CMU Arctic.
- Dependencia del vocoder externo: requiere descargar hifigan-multi-vctk-small; la calidad final depende de ese componente.
- Documentacion escasa: no hay informacion sobre parametros, entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_bdl
- Release original de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_bdl-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
