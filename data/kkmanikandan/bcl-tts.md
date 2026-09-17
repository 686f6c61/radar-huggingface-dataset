# kkmanikandan/bcl-tts

## Resumen

BCL_TTS es un modelo de sintesis de voz (text-to-speech) no autoregresivo basado en flow matching, disenado para clonacion de voz zero-shot a partir de un clip de referencia corto. Lo publica el usuario kkmanikandan en Hugging Face bajo licencia Apache-2.0. A diferencia de la mayoria de alternativas del ecosistema, el autor afirma que no es un fine-tune ni un wrapper de un modelo existente: el encoder de texto, el alineador interno, el encoder de hablante y el decoder de flow matching estan entrenados desde cero.

El repositorio se diferencia de los modelos de estilo F5-TTS en tres decisiones de diseno explicitas: alineacion explicita mediante Monotonic Alignment Search de estilo Glow-TTS con un predictor de duracion entrenado, condicionamiento por cross-attention en lugar de concatenacion de texto y audio ruidoso, y condicionamiento global de hablante AdaLN-Zero a partir de un unico embedding agrupado de la voz de referencia. La conversion de mel-espectrograma a onda se delega en Vocos, un vocoder preentrenado externo (charactr/vocos-mel-24khz).

El estado actual del repositorio es de publicacion temprana: **no incluye ningun checkpoint entrenado**. Solo contiene el codigo de la arquitectura, el fichero de configuracion, un script de inferencia y la model card. El entrenamiento se esta realizando por separado y el autor indica que subira un fichero `.pt` en un commit posterior. Hasta entonces, `inference_example.py` lanza un `FileNotFoundError`, por lo que el modelo no es ejecutable tal cual. No se han publicado el numero de parametros, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autoregresivo con flow matching condicional; encoder de texto, alineador monotono (Monotonic Alignment Search estilo Glow-TTS), predictor de duracion, encoder de hablante y decoder de flow matching con cross-attention |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se publica longitud maxima de texto ni de audio de referencia) |
| Tipos de cuantizacion | no disponible (solo se menciona checkpoint en `.pt` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el codigo y los pesos propios del autor; el vocoder Vocos tiene licencia propia e independiente |
| Formato de pesos | PyTorch (`.pt`, nombres previstos `bcl_tts_latest.pt` / `bcl_tts_final.pt`); no hay checkpoint publicado |
| Vocoder | Vocos (`charactr/vocos-mel-24khz`), cargado en tiempo de inferencia desde Hugging Face, no incluido en el repositorio |
| Frecuencia de muestreo de salida | no disponible de forma explicita; el vocoder referenciado es de 24 kHz |
| Pipeline declarado | text-to-speech |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

BCL_TTS es un modelo de sintesis de voz no autoregresivo que genera mel-espectrogramas mediante flow matching condicional y delega la sintesis final de onda en un vocoder externo. Su diseno se articula en cuatro componentes entrenados desde cero: un encoder de texto, un alineador que aprende la correspondencia texto-audio mediante Monotonic Alignment Search de estilo Glow-TTS (`bcl_tts/alignment.py`) y del que se deriva un predictor de duracion explicito, un encoder de hablante (`bcl_tts/modules/speaker_encoder.py`) que produce un unico embedding agrupado de la voz de referencia, y un decoder de flow matching (`bcl_tts/modules/flow_decoder.py`) que atiende a las caracteristicas de texto reguladas en longitud mediante cross-attention. El condicionamiento de hablante se aplica de forma global con AdaLN-Zero sobre el embedding de referencia, en lugar de anteponer un segmento de mel de referencia a la entrada del flujo.

El autor presenta estas tres decisiones como las diferencias deliberadas frente a los modelos de flow matching al estilo F5-TTS: alineacion explicita en lugar de implicita (sin necesidad de herramientas de forced alignment), cross-attention en lugar de concatenacion de texto y audio ruidoso en una sola secuencia, y condicionamiento global de hablante en lugar de un segmento de mel crudo. El entrenamiento se realiza con `scripts/train_bcl_tts.py`, combinando objetivos de duracion derivados de Monotonic Alignment Search con la perdida de flow matching condicional, sobre un corpus de un unico hablante y en una GPU Colab T4. No se especifican el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla la cantidad de pasos de entrenamiento, ya que el autor indica que `load_model()` imprime el numero exacto de pasos del checkpoint que este presente, que puede ser una instantanea intermedia no convergida.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) con generacion de mel-espectrogramas y conversion a onda mediante Vocos.
- Clonacion de voz zero-shot a partir de un clip de referencia corto, sin fine-tuning por hablante.
- Alineacion texto-audio aprendida de forma explicita, con predictor de duracion, lo que en principio permite controlar la duracion de la locucion.
- Condicionamiento de hablante global mediante AdaLN-Zero sobre un embedding agrupado de la voz de referencia.
- Inferencia no autoregresiva, lo que habilita sintesis en un numero fijo de pasos de integracion del flujo.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; no se declara ningun idioma en la model card ni en los metadatos del repositorio.
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponible; no se documenta ninguna capacidad de comprension de audio, solo de clonacion a partir de un clip de referencia.

## Casos de uso

- Clonacion de voz personalizada en prototipos de investigacion: el modelo esta disenado para partir de un clip de referencia corto y producir voz del mismo hablante sin reentrenar; es adecuado para experimentos academicos de zero-shot TTS, siempre que se disponga de un checkpoint entrenado.
- Audiolibros y narracion automatizada: la alineacion explicita con predictor de duracion permite controlar el ritmo de la locucion, algo relevante en lecturas largas donde se busca una cadencia consistente.
- Localizacion y doblaje de contenido: con un clip de referencia del actor original se podria generar una pista de voz alternativa; requiere verificar previamente los derechos de la voz de referencia y la licencia del vocoder.
- Sistemas de atencion al cliente con voz sintetica: la clonacion de una voz corporativa unica permitiria mantener una identidad sonora consistente en respuestas automatizadas, integrándose en un pipeline externo de ASR + LLM + TTS.
- Generacion de datos sinteticos para entrenar sistemas ASR: voces sinteticas con control de duracion y timbre permiten aumentar la cobertura de hablantes y condiciones acusticas en corpus de entrenamiento.
- Accesibilidad y comunicacion asistida: clonacion de la propia voz del usuario a partir de un clip corto para preservar su identidad vocal en interfaces de lectura en voz alta.
- Investigacion en arquitecturas de flow matching para TTS: el repositorio expone el codigo de alineacion, decoder y encoder de hablante por separado, lo que permite estudiar y ablarar cada componente de forma aislada frente a disenos con alineacion implicita.
- Experimentacion con vocoders externos: al delegar la sintesis de onda en Vocos, permite comparar el mismo mel-espectrograma generado con distintos vocoders sin reentrenar el modelo acustico.

Nota transversal: ninguno de estos casos es ejecutable hoy con este repositorio, ya que no se ha publicado ningun checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, similitud de hablante, RTF) ni comparaciones cuantitativas con otros sistemas. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica el numero de parametros ni el tamano del checkpoint, por lo que no es posible estimar la VRAM necesaria con rigor.
- GPU utilizada para el entrenamiento: una unica GPU Colab T4 (16 GB de VRAM), segun indica la model card.
- GPU recomendadas para inferencia: no disponible, al no conocerse el tamano del modelo.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar si cabe en tarjetas como la RTX 4090 o inferiores sin conocer el recuento de parametros.
- Opciones de despliegue: la unica via documentada es ejecutar el codigo propio del repositorio (`bcl_tts/`) con PyTorch, cargando el checkpoint `.pt` e invocando `load_model()` y `synthesize()` de `inference_example.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, ONNX ni TensorRT, y al tratarse de una arquitectura personalizada no incluida en librerias estandar, el despliegue exige el codigo del repositorio.
- Dependencias de inferencia declaradas: `huggingface_hub`, `pyyaml`, `vocos`, `torch` y `torchaudio` (en `requirements-minimal.txt` figuran solo `pyyaml` y `vocos`, asumiendo torch y torchaudio ya instalados).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La model card cita F5-TTS como referencia de estilo arquitectonico, pero solo para explicar las diferencias de diseno, sin aportar cifras. No se dispone de datos de parametros, contexto, rendimiento ni licencia de alternativas en la informacion proporcionada.

| Modelo | Parametros | Formato de pesos | Alineacion | Condicionamiento de hablante | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BCL_TTS | no disponible | PyTorch (`.pt`); sin checkpoint publicado | Explicita (MAS estilo Glow-TTS + predictor de duracion) | AdaLN-Zero global sobre embedding agrupado de referencia | Apache-2.0 (pesos y codigo propios) | Solo codigo y configuracion; sin pesos |
| F5-TTS (estilo citado como contraste) | no disponible | no disponible | Implicita (padding de texto a la longitud mel objetivo) | Mel de referencia antepuesto a la entrada del flujo | no disponible | no disponible |
| Alternativas adicionales de TTS zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No hay checkpoint entrenado disponible.** El directorio `checkpoint/` es un marcador de posicion y `inference_example.py` lanzara un `FileNotFoundError` hasta que se suba un fichero `.pt`. El modelo no se puede evaluar ni usar en produccion en su estado actual.
- Entrenamiento sobre un corpus de un unico hablante, lo que limita la diversidad de timbres aprendida por el modelo y puede degradar la clonacion de voces alejadas de ese perfil.
- Entrenamiento realizado en una GPU Colab T4, lo que sugiere un presupuesto de computo reducido y un posible infraentrenamiento; el propio autor advierte que el checkpoint que se publique puede ser una instantanea intermedia no convergida.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgos de genero, acento, edad o variedad dialectal en las voces generadas.
- Riesgo de alucinacion acustica: inherente a los modelos generativos de audio; no se documentan tasas de error de pronunciacion, omisiones ni artefactos en la informacion disponible.
- Idiomas soportados: no disponible. No se declara soporte multilingue ni la lengua del corpus de entrenamiento.
- Restricciones de licencia: el codigo y los pesos propios se publican bajo Apache-2.0, que permite uso comercial. Sin embargo, el vocoder Vocos (`charactr/vocos-mel-24khz`) se carga en tiempo de inferencia desde Hugging Face y tiene su propia licencia, que hay que revisar si se redistribuye el audio generado.
- Riesgo legal y etico del clonado de voz: la clonacion zero-shot puede usarse para suplantacion de identidad o fraude; es necesario contar con consentimiento explicito del hablante de referencia y cumplir la normativa aplicable sobre datos biomedicos y voz.
- Coste de integracion: al ser una arquitectura personalizada no incluida en librerias estandar, no se puede cargar con `transformers` ni desplegar con servidores de inferencia habituales sin escribir codigo de adaptacion.
- Ausencia de datos de rendimiento: no hay metricas objetivas (MOS, similitud de hablante, WER, RTF) que permitan estimar la calidad antes de entrenar o evaluar el modelo.

## Enlaces

- Model card y repositorio en Hugging Face: https://huggingface.co/kkmanikandan/bcl-tts
- Vocoder utilizado en inferencia (Vocos, mel 24 kHz): https://huggingface.co/charactr/vocos-mel-24khz
- F5-TTS: citado en la model card como referencia arquitectonica de contraste, sin enlace proporcionado.
- Paper, blog, repositorio adicional o demo: no disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas corresponden a TikTok y no guardan relacion con el modelo.
