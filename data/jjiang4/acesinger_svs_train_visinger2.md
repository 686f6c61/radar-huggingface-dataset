# jjiang4/acesinger_svs_train_visinger2

## Resumen
`jjiang4/acesinger_svs_train_visinger2` es un modelo de síntesis de voz cantada (singing voice synthesis, SVS) empaquetado con ESPnet3 a partir de la receta `egs3/acesinger/svs` sobre el corpus `acesinger`. Se trata de un sistema generativo adversarial de tipo GAN entrenado con el esquema `gansvs`, cuya clase de modelo es `ESPnetGANSVSModel` y cuyo generador sigue la arquitectura ViSinger2, una variante de VITS adaptada al canto. El modelo tiene 107.319.495 parámetros (todos entrenables, 100 %) y ocupa 429,28 MB en float32.

El modelo recibe como entrada una partitura musical en forma de fonemas con sus tiempos y una identidad de cantante (`sids`), y devuelve una forma de onda muestreada a 44,1 kHz. Está pensado para la síntesis de canto con control de contenido fonético, tempo y notas, no para generación de texto ni para tareas de lenguaje natural: es un modelo acústico/generativo de audio, no un modelo de lenguaje.

Su relevancia práctica es acotada: se publica como bundle reproducible de un experimento de investigación (`train_visinger2`) con un conjunto de métricas objetivas de test, cero descargas y cero interacciones en el momento de la consulta, y sin licencia ni idiomas declarados en la model card. Es útil como referencia reproducible de la receta SVS de ESPnet3 y como punto de partida para reentrenamientos, más que como modelo listo para producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | GAN para síntesis de voz cantada (SVS) basada en VITS con generador ViSinger2; clase `ESPnetGANSVSModel` |
| Parametros totales | 107.319.495 (429,28 MB en float32) |
| Parametros activos | no aplica (no es MoE; el 100 % de los parámetros son entrenables) |
| Longitud de contexto | no aplica / no disponible: la entrada es una partitura (fonemas con tiempos, tempo y notas) de duración variable |
| Tipos de cuantizacion | no disponible; los pesos se publican en `torch.float32` sin cuantización |
| Idiomas soportados | no disponible (el corpus es `acesinger` y la tokenización es fonética, `token_type: phn`) |
| Licencia | no disponible |
| Formato de pesos | bundle ESPnet3 (`model_pack`) con checkpoints PyTorch; no se publican safetensors ni GGUF |
| Tamano del repositorio | 0,4 GB |
| Buffers | 4.591.030 (18,36 MB) |
| Modulos | 1.297 en total, 916 hojas |
| Frecuencia de muestreo | 44,1 kHz (hop length 512) |
| Voces / hablantes | 31 (`spks: 31`) |

## Arquitectura y entrenamiento
El sistema es un GAN condicional de síntesis de canto construido sobre el esqueleto VITS. La rama generativa incluye un text encoder con auto-atención relativa (`rel_selfattn`) y codificación posicional relativa (`rel_pos`), 6 bloques, 2 cabezas de atención, 192 canales ocultos, capas position-wise de tipo `conv1d` con kernel 3, estilo macaron, activación swish y normalización previa. El encoder posterior tiene 8 capas con kernel 3, el flujo consta de 4 capas con kernel 5 y el decodificador usa 256 canales con kernel 7, escalas de sobremuestreo 8/8/4/2, 64 armónicos y `use_weight_norm_in_decoder: true`. La rama discriminadora es la de ViSinger2, con un discriminador por periodos (2, 3, 5, 7, 11) más componentes multiescala. Las características acústicas de entrada son filtros Mel de 80 bandas (`n_fft` y `win_length` 2048, `hop_length` 512, `fmin` 80 Hz, `fmax` 22050 Hz) con normalización `global_mvn`, el extractor de pitch es DIO con rango de F0 de 80 a 810 Hz y el extractor de partitura es `syllable_score_feats`.

El entrenamiento se lanzó con la tarea `espnet2.tasks.gan_svs.GANSVSTask` en 1 nodo con 4 dispositivos, sobre manifiestos `manifest_filtered/train.tsv` y `manifest_filtered/valid.tsv` y un `token_list` fonético (`phn_none`). No se documentan en la model card el número de tokens de audio, las horas del corpus, la composición del dataset ni si hubo etapas de RLHF/DPO (no aplicables en este dominio), y tampoco se detalla la receta de destilación o decodificación especulativa, que no existen en este tipo de modelo. El bundle se generó copiando las salidas del experimento (`./exp/train_visinger2`) y aplicando filtros de exclusión, con un commit marcado como `dirty`.

## Capacidades
- Síntesis de voz cantada a 44,1 kHz a partir de una partitura: recibe fonemas con tiempos (`label`), información de tempo y notas (`score`) y un identificador de cantante (`sids`).
- Control de F0 y duración mediante la partitura de entrada, con extracción de pitch DIO en el rango 80-810 Hz.
- Multihablante: soporta hasta 31 identidades de cantante según la configuración del generador.
- Modelado de contenido fonético mediante tokenización de fonemas (`token_type: phn`), sin texto ortográfico.
- Inferencia de una sola pasada (arquitectura no autorregresiva, basada en VITS), lo que evita bucles de decodificación por token.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- No es un modelo de lenguaje: no genera texto, código ni matemáticas.
- Capacidades multilingües: no documentadas.

## Casos de uso
- Generación de voces cantadas para maquetas musicales: dado un archivo MIDI o una partitura convertida al formato (`times`, `phones`) que espera el preprocesador `SVSPreprocessor`, el modelo produce una pista vocal de referencia para validar melodía y letra antes de grabar.
- Prototipado de coros sintéticos con múltiples identidades: gracias a los 31 identificadores de cantante, se pueden generar varias pistas con timbres distintos para previsualizar arreglos corales.
- Investigación en síntesis de canto: sirve como línea base reproducible con métricas objetivas publicadas (log-F0 RMSE, MCD, semitone accuracy, VUV error) para comparar nuevas arquitecturas dentro de ESPnet3.
- Reentrenamiento sobre corpus propios: el bundle incluye la configuración completa de la receta `acesinger/svs`, por lo que se puede replicar el pipeline cambiando manifiestos y `token_list` para adaptar el sistema a otra voz o idioma.
- Doblaje cantado de prueba o localización preliminar: permite sustituir la voz original por una sintética manteniendo la línea melódica, útil en fases de preproducción y no como doblaje final.
- Data augmentation para sistemas de reconocimiento o transcripción musical: las pistas sintetizadas con control exacto de F0 y duración pueden emplearse para generar datos etiquetados de forma precisa.
- Demostraciones e interfaces educativas de SVS: la inferencia en una sola llamada (`model(sample)`) simplifica integrar el modelo en cuadernos o demos interactivas de bajo coste computacional.

## Benchmarks y rendimiento
Resultados publicados en la model card para el split de test del experimento `train_visinger2`:

| Dataset | log_f0_rmse | mcd | semitone_acc | vuv_err |
|---|---|---|---|---|
| test | 0,18274712676728574 | 6,103883153889555 | 0,5672507490139542 | 0,09170632745165584 |

No se han publicado comparaciones con otros sistemas ni resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de síntesis de canto. El valor de `mcd` (6,10 dB) y el de `vuv_err` (0,092) son coherentes con un sistema de estas características, mientras que `semitone_acc` (0,567) indica que aproximadamente el 57 % de las tramas quedan dentro de un semitono de la referencia, lo que apunta a margen de mejora en la precisión de afinación.

## Requisitos de hardware
- VRAM estimada: el checkpoint float32 ocupa 429,28 MB; con estados intermedios y buffers, la inferencia debería caber holgadamente por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria. Funciona en GTX 1650/1060, RTX 3060, RTX 4090, A100 y H100; las GPU de gama alta no aportan ventaja por tamaño de modelo, solo por velocidad.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas. También es viable la inferencia en CPU, aunque con mayor latencia.
- Entrenamiento: la configuración publicada indica 4 dispositivos y 1 nodo, por lo que el reentrenamiento sí requiere un entorno multi-GPU.
- Opciones de despliegue: únicamente la ruta nativa de ESPnet3 mediante `espnet3.publication.InferenceModel` con `trust_user_code=True`, que carga el bundle `model_pack` y devuelve `result["wav"]`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni ONNX, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Categoria | Parametros | Contexto / entrada | Metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jjiang4/acesinger_svs_train_visinger2` | SVS GAN (ESPnet3, generador ViSinger2) | 107.319.495 | Partitura (fonemas + tiempos + tempo/notas), 31 cantantes | log_f0_rmse 0,183; mcd 6,10; semitone_acc 0,567; vuv_err 0,092 | no disponible | HuggingFace, 0 descargas |
| ViSinger2 (referencia académica de la que deriva el generador) | SVS VITS + GAN | no disponible | Partitura / fonemas | no disponible | no disponible | Publicación académica |
| DiffSinger | SVS basada en difusión | no disponible | Partitura / fonemas / MIDI | no disponible | no disponible | Repositorio público |
| NNSVS | SVS estadistica (espacio acustico + vocoder) | no disponible | Partitura / MIDI | no disponible | no disponible | Repositorio público |

No se dispone de datos comparativos verificados (parámetros, contexto o métricas) de los sistemas alternativos en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre sistemas SVS comparables.

## Limitaciones y advertencias
- Licencia no declarada: no se especifica ninguna licencia en la model card ni en los metadatos, por lo que el uso comercial queda sin cobertura legal clara hasta que el autor la defina.
- Idiomas no documentados: la tokenización es fonética y el corpus es `acesinger`, pero no se declara qué lenguas cubre el modelo; asumir un idioma concreto sería una extrapolación.
- Sesgos de voz: con 31 cantantes en el corpus de entrenamiento, el timbre, el estilo vocal y el rango expresivo están limitados a esas identidades y a la distribución del dataset; el modelo puede fallar con registros extremos o estilos alejados.
- Precisión de afinación mejorable: `semitone_acc` de 0,567 en test implica que una fracción relevante de tramas queda fuera de un semitono respecto a la referencia.
- Riesgo de artefactos de síntesis: como todo modelo neuronal de audio, puede producir ruido, inestabilidad en notas largas, vibrato artificial o consonantes mal articuladas; no hay evaluación subjetiva (MOS) publicada.
- Sin evaluación de robustez: no se documentan pruebas fuera de dominio, con letras no vistas, cambios de tempo extremos ni entradas malformadas.
- Dependencia de `trust_user_code=True`: la carga del modelo ejecuta código de usuario, lo que implica un riesgo de seguridad si el bundle no es de confianza.
- Empaquetado frágil para producción: requiere el ecosistema ESPnet3 y los ficheros de estadísticas y `token_list` de la receta original; no hay formatos estándar de intercambio (safetensors, ONNX) que faciliten su integración.
- Madurez: repositorio con 0 descargas y 0 likes, commit marcado como `dirty` y marcas temporales de creación posteriores a la fecha de consulta, señales de un artefacto de investigación sin mantenimiento.
- Exclusiones de responsabilidad: cualquier uso para suplantar la voz de una persona real sin consentimiento plantea problemas legales y éticos, agravados por la ausencia de licencia explícita.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jjiang4/acesinger_svs_train_visinger2
- Repositorio de ESPnet (framework base): https://github.com/espnet/espnet
- Fork indicado en la model card (origen del commit `5fd502819d`): https://github.com/Ting-Justin-Jiang/espnet
- Receta de la que procede el bundle: `egs3/acesinger/svs` dentro del repositorio de ESPnet3
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo (los resultados devueltos corresponden a páginas sobre patinaje artístico y no guardan relación con el modelo)
