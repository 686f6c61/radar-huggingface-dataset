# seekmind-lab/bisat-paper

## Resumen

BiSAT (Bidirectionally Aligned Semantic-Acoustic Tokenization) es un tokenizador de voz discreto y un modelo de texto-a-voz (TTS) zero-shot desarrollado por SeekMind Lab, presentado en el paper arXiv:2611.30723. El repositorio `seekmind-lab/bisat-paper` es un repositorio companion del paper: no contiene pesos publicados, solo material de referencia (README, figuras y enlaces a demos). La propuesta central es un tokenizador de flujo unico y bajo bitrate que preserva simultaneamente estructura linguistica y detalle acustico, resolviendo el problema de que los codecs puramente acusticos o puramente semanticos degradan al usarse como entrada de un modelo de lenguaje de voz.

La arquitectura combina dos encoders Conformer de 17 capas (inicializados desde NeMo `ssl_en_conformer_large`, 16 kHz a 25 Hz) con una cuantizacion vectorial de indice compartido (SVQ): ambas ramas, acustica y semantica, seleccionan un unico indice discreto por trama. El resultado son tasas de 375 bps (BiSAT-32k) y 400 bps (BiSAT-64k), con utilizacion del codebook del 100% y 99,8% respectivamente. Sobre esta base se construye BiSAT-TTS, que empareja un LM autorregresivo MiniCPM4-0.5B con un decodificador acustico DiT de flow-matching de 22 bloques y el vocoder HiFT causal de CosyVoice 3.

Es relevante ahora porque propone una alternativa a los codecs con decodificador adversario y a los tokenizadores puramente semanticos, mostrando que la calidad de reconstruccion por si sola no predice la calidad de las representaciones discretas para modelos de lenguaje de voz. El codigo y los checkpoints (`BiSAT-32k`, `BiSAT-64k`, `BiSAT-TTS-32k`, `BiSAT-TTS-64k`) estan anunciados como "proximamente", pero no disponibles en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador: doble encoder Conformer de 17 capas (acustico + semantico) con cuantizacion vectorial de indice compartido (SVQ). TTS: LM autorregresivo MiniCPM4-0.5B + decodificador DiT de flow-matching de 22 bloques + vocoder HiFT causal de CosyVoice 3 |
| Parametros totales | no disponible (el LM de BiSAT-TTS parte de MiniCPM4-0.5B; no se detalla el total del sistema) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, fr, ko, ja, nl, es, it, pt, pl (11 idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints anunciados pero no publicados) |

## Arquitectura y entrenamiento

BiSAT mantiene las representaciones acustica y semantica separadas en espacio continuo y las acopla unicamente mediante un indice discreto compartido, inspirado en el principio de indice compartido de TokenFlow para tokenizacion de imagen. Dos encoders Conformer de 17 capas procesan la senal de 16 kHz y la reducen a 25 Hz: la rama acustica reconstruye espectrogramas log-mel con perdida puramente L1 (sin entrenamiento adversario) y la rama semantica ve caracteristicas mel enmascaradas con SpecAugment y se entrena con CTC, incluyendo CTC intermedio en la capa 9. La cuantizacion SVQ selecciona por trama el indice que minimiza la distancia conjunta entre las salidas de ambos encoders y sus codebooks unit-normalizados pareados (K x 512), con omega = 1. Ningun encoder se congela: las actualizaciones en una rama desplazan las asignaciones compartidas de ambas.

El entrenamiento del tokenizador es en dos etapas: 100.000 pasos sin VQ, inicializacion del codebook por k-means esferico sobre 1,3 millones de tramas multilingues, y 200.000 pasos conjuntos con rotation trick, EMA de conteo compartido (eta = 0,99) y reseeding de codigos muertos cada 100 pasos, lo que produce utilizacion del 100% (BiSAT-32k, 375 bps) y 99,8% (BiSAT-64k, 400 bps). En inferencia se descartan los decodificadores de entrenamiento y los modelos downstream solo ven la secuencia de enteros. BiSAT-TTS entrena sobre 122.000 horas en 11 idiomas, con el decodificador DiT entrenado al 50% offline y 50% chunk-causal para soportar decodificacion offline y en streaming.

## Capacidades

- Tokenizacion de voz discreta de flujo unico y bajo bitrate (375-400 bps) que preserva contenido linguistico y rasgos acusticos (pitch, energia, hablante, emocion).
- Reconstruccion de voz desde tokens con decodificador acustico.
- Sintesis de voz zero-shot (BiSAT-TTS) con clonacion de voz a partir de audio de referencia.
- Soporte de decodificacion en streaming gracias al entrenamiento chunk-causal del decodificador DiT.
- Capacidades multilingues en 11 idiomas: ingles, chino, aleman, frances, coreano, japones, neerlandes, espanol, italiano, portugues y polaco.
- Interfaz limpia para modelos de lenguaje de voz downstream: una unica secuencia de enteros por utterance.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio de entrada mas alla del propio audio de referencia.

## Casos de uso

- Modelado de lenguaje de voz autorregresivo: usar la secuencia de tokens de BiSAT como vocabulario de entrada y salida de un LM de voz, ya que el tokenizador preserva fonetica y hablante simultaneamente y evita la degradacion que sufren los codecs puramente acusticos en pruebas con codigo congelado.
- Sintesis de voz zero-shot multilingue: BiSAT-TTS permite generar habla en cualquiera de los 11 idiomas soportados clonando la voz de una referencia, util para localizacion de contenido sin regrabar locutores.
- Clonacion de voz para doblaje y audiolibros: el modelo mantiene rasgos de hablante (SID) y prosodia (pitch, energia) gracias a la especializacion de ramas documentada con TreeSHAP, adecuado para produccion de audio a escala.
- Asistentes de voz en streaming: el decodificador DiT entrenado al 50% chunk-causal permite decodificacion incremental, apropiado para interfaces conversacionales de baja latencia.
- Investigacion en tokenizacion de voz: el repositorio y el paper sirven como referencia reproducible para estudiar el efecto de la estructura del codebook en tareas downstream (reconocimiento de fonemas, idioma, hablante), con diagnosticos publicados de utilizacion y alineamiento.
- Generacion de datos sinteticos de voz para aumento de datos: sintetizar habla multilingue con voces diversas para entrenar sistemas ASR o de diarizacion en idiomas con pocos recursos.
- Prototipado de TTS en productos de accesibilidad: lectura de texto a voz con voces personalizadas, pendiente de la publicacion de checkpoints y licencia.

## Benchmarks y rendimiento

Datos publicados en la model card del paper (no hay checkpoints publicos para verificarlos de forma independiente).

| Sistema | WER reconstruccion LibriSpeech-PC | PR PER (codigo congelado) | FLEURS EN WER zero-shot | VoxCeleb1 SID | LID |
|---|---|---|---|---|---|
| BiSAT-32k | 2,15% | 1,92% | 24,4% | 40,4% | 95,5% |
| X-Codec2 (50 Hz, 800 bps) | 2,27% | 8,82% | 87,7% | 5,6% | 23,6% |
| CosyVoice 2/3 (semanticos) | no disponible | no disponible | no disponible | 24,7%-24,8% | no disponible |

La model card incluye ademas una tabla de BiSAT-TTS frente a otros sistemas TTS con columnas de WER en LibriSpeech-PC, SIM-o, NISQA y WER en Seed-TTS `test-en`, pero los valores numericos de esa tabla no estan completos en la informacion disponible.

## Requisitos de hardware

- No disponible: no se han publicado checkpoints ni requisitos de inferencia.
- VRAM estimada: no disponible. Como referencia, el LM de BiSAT-TTS parte de MiniCPM4-0.5B, lo que sugiere que el componente de lenguaje es ligero, pero el total del sistema (DiT de 22 bloques y vocoder HiFT) no se detalla.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible; el diseno chunk-causal del decodificador apunta a streaming, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Bitrate / frecuencia | Entrenamiento adversario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiSAT-32k / BiSAT-64k | Tokenizador acustico-semantico | 375 / 400 bps, 25 Hz | No | no disponible | Checkpoints anunciados, no publicados |
| X-Codec2 | Codec acustico con decodificador adversario | 800 bps, 50 Hz | Si | no disponible | no disponible |
| CosyVoice 2/3 (tokenizador) | Tokenizador semantico | no disponible | no disponible | no disponible | no disponible |
| FocalCodec | Codec puramente acustico | no disponible | no disponible | no disponible | no disponible |

BiSAT se diferencia por combinar ambas senales en un unico indice discreto con la mitad de frecuencia que X-Codec2 y sin entrenamiento adversario, manteniendo mejor rendimiento en pruebas con codigo congelado (fonemas, idioma, hablante).

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio es solo material companion del paper; el codigo y los checkpoints estan anunciados como "proximamente".
- Licencia no disponible: no se puede evaluar el uso comercial ni las restricciones de redistribucion.
- Los benchmarks provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.
- El tokenizador esta entrenado sobre senal de 16 kHz y salida a 25 Hz; no se documenta comportamiento con audio de mayor calidad o dominios ruidosos.
- Riesgo de alucinacion y artefactos en TTS: no se documentan tasas de fallo en habla espontanea, emocional o con acentos no vistos.
- Sesgos: no se publica analisis de sesgos por hablante, genero o variedad dialectal; la cobertura de los 11 idiomas puede ser desigual.
- Dependencia de componentes de terceros (NeMo Conformer, MiniCPM4-0.5B, vocoder de CosyVoice 3), cuyas licencias condicionan el uso del sistema completo.
- Sin informacion sobre contexto, cuantizacion ni formatos de pesos, lo que impide planificar el despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/seekmind-lab/bisat-paper
- Organizacion SeekMind Lab: https://huggingface.co/seekmind-lab
- Paper en arXiv: https://arxiv.org/abs/2611.30723
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30723
- Blog del autor: https://huggingface.co/blog/zenkingsama/bisat
- Demos de audio (TTS zero-shot y reconstruccion): https://seekmind-lab.github.io/bisat-demo/
