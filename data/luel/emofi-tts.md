# luel/emofi-tts

## Resumen

EmoFI-TTS es un sistema de sintesis de voz expresiva condicionada por rostro, desarrollado por Yejin Jeon, Luel H. Beyene, Marie Maltais, Hyounghun Kim y David I. Adelani, y publicado en arXiv (2610.30477). El modelo genera audio a partir de tres entradas: una imagen facial que determina la emocion y su intensidad, una locucion de referencia que fija la identidad del hablante y un texto que define el contenido. Se distribuye como pesos preentrenados en HuggingFace bajo licencia MIT, con el codigo y las recetas de entrenamiento en el repositorio de GitHub del autor.

La arquitectura combina un backbone FastSpeech2 / Meta-StyleSpeech con un vector de estilo proyectado linealmente, un modulo de refinamiento condicionado por intensidad y un vocoder HiFi-GAN universal. El sistema se entrena exclusivamente sobre el corpus MEAD, que cubre seis emociones (neutral, ira, alegria, tristeza, sorpresa y miedo) en tres niveles de intensidad, en ingles y con 46 hablantes en entorno de estudio.

Su relevancia radica en que aborda una modalidad poco explorada: el control de la expresividad emocional a partir de una cara en lugar de etiquetas explicitas, lo que abre la puerta a interfaces donde el estado afectivo se comunica visualmente. Es, sin embargo, un modelo de investigacion con alcance limitado al dominio de MEAD y sin evaluacion fuera de el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastSpeech2 / Meta-StyleSpeech con modulo de refinamiento condicionado por intensidad y vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (codigo y checkpoints TTS); dataset MEAD bajo licencia de investigacion |
| Formato de pesos | `.pth.tar` y `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El sistema sigue un diseno en dos etapas sobre un backbone FastSpeech2 con componentes de Meta-StyleSpeech. La identidad del hablante se inyecta mediante un unico vector de estilo proyectado linealmente a partir de la locucion de referencia, mientras que la emocion y su intensidad se codifican a partir de la imagen facial mediante un encoder ResNet50 + MLP que produce un embedding de 768 dimensiones. Sobre el backbone se anade un modulo de refinamiento condicionado por intensidad, que ajusta la prosodia al nivel emocional objetivo. La salida acustica se sintetiza con el vocoder HiFi-GAN universal.

El entrenamiento se realiza en dos fases: una etapa cross-speaker sobre el backbone (`backbone_30000.pth.tar`) y una etapa posterior de refinamiento (`refinement_15000.pth.tar`). Los datos provienen exclusivamente de MEAD, un corpus de estudio con 46 hablantes, seis emociones y tres niveles de intensidad en ingles, con particion de test disjunta por hablante. No se documenta en la informacion disponible el numero de horas, la composicion exacta del dataset ni el uso de RLHF o DPO. La evaluacion emocional se apoya en un juez SER basado en Wav2Vec2 (`best_model.pt`) entrenado por Yejin Jeon.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en ingles.
- Control de emocion mediante imagen facial: seis emociones (neutral, ira, alegria, tristeza, sorpresa, miedo).
- Control de intensidad emocional en tres niveles (L1, L2, L3) a partir de la imagen.
- Transferencia de identidad de hablante mediante locucion de referencia (zero-shot dentro del dominio MEAD).
- Embedding facial de 768 dimensiones mediante encoder ResNet50 + MLP incluido en el repo.
- Evaluacion integrada de emocion e intensidad mediante juez SER Wav2Vec2.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente generativo de audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en TTS expresivo: el modelo sirve como linea base reproducible para experimentos de control emocional condicionado por imagen, con checkpoints intermedios y scripts de evaluacion publicados.
- Avisos y asistentes con estado afectivo visual: en un prototipo de interfaz donde la camara captura la expresion del usuario, el modelo puede generar respuestas habladas con emocion e intensidad coherentes con esa expresion, siempre en ingles y en dominio controlado.
- Doctores y simulacion de personajes: permite generar locuciones con emocion e intensidad parametrizadas a partir de una cara de referencia, util en prototipos de videojuegos o narrativa interactiva.
- Evaluacion de jueces SER: el juez Wav2Vec2 incluido (`best_model.pt`) puede reutilizarse para medir emocion e intensidad en otros sistemas TTS dentro de protocolos de investigacion.
- Estudio de prosodia emocional: el modulo de refinamiento condicionado por intensidad permite analizar como varia la prosodia entre L1, L2 y L3 sobre un mismo texto y hablante.
- Generacion de datasets sinteticos controlados: en investigacion se pueden producir muestras con emocion e intensidad conocidas para aumentar corpus de entrenamiento, respetando las restricciones de licencia y consentimiento.
- Demostraciones de transferencia de estilo: con una locucion de referencia y una cara, se puede ilustrar la transferencia de identidad y emocion en entornos academicos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de MEAD en condicion solo imagen:

| Sistema | UTMOS | WER | Emotion WA | Intensity WA | L1 / L2 / L3 recall |
|---|---|---|---|---|---|
| EmoFI-TTS | 3.14 | 0.069 | 0.717 | 0.654 | 0.764 / 0.428 / 0.741 |
| Grabaciones reales | 2.86 | 0.066 | 0.730 | 0.622 | 0.697 / 0.346 / 0.803 |

La emocion y la intensidad se puntuan con el juez SER publicado. No se han publicado en la informacion disponible comparaciones con otros sistemas TTS en esta tabla; el paper de arXiv debe consultarse para la linea base completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 2,0 GB e incluye backbone, modulo de refinamiento, vocoder HiFi-GAN, encoder facial y juez SER. La inferencia del sistema completo requiere cargar varios de estos componentes en memoria.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del repo, una GPU consumer con 8-12 GB de VRAM deberia ser suficiente para inferencia en precision completa, aunque no se confirma.
- Cabe en GPU consumer: probablemente si, dado el tamano del checkpoint, pero no hay confirmacion oficial.
- Opciones de despliegue: PyTorch nativo; no se publican integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS no autoregresivo de este tipo). El codigo de entrenamiento e inferencia esta en github.com/luelhagos/Emofi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| EmoFI-TTS | TTS condicionado por rostro | no disponible | no aplica | en | MIT | Entrenado solo en MEAD; control de emocion e intensidad por imagen |
| StyleSpeech / Meta-StyleSpeech | TTS con estilo | no disponible | no aplica | en | variable | Base arquitectonica del modelo; sin condicionamiento facial |
| FastSpeech2 | TTS no autoregresivo | no disponible | no aplica | multi | MIT (implementaciones) | Backbone del sistema; sin control emocional por imagen |
| Modelos TTS comerciales (p. ej. ElevenLabs) | TTS con control de estilo | no disponible | no aplica | multi | propietaria | Mayor cobertura de idiomas y dominio, sin condicionamiento facial documentado |

No se dispone de comparaciones cuantitativas con alternativas en la informacion proporcionada; la comparativa es cualitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente con MEAD: seis emociones, tres intensidades, 46 hablantes, ingles y entorno de estudio. La generalizacion a otros hablantes, acentos o condiciones de grabacion no se ha evaluado y no debe asumirse.
- La transferencia de voz a hablantes fuera de MEAD no esta evaluada.
- El recall de intensidad L2 es bajo (0.428), lo que indica dificultad para distinguir el nivel intermedio de intensidad.
- Riesgo de alucinacion prosodica y artefactos en emociones o intensidades poco representadas en el corpus.
- Sesgos derivados del corpus: hablantes de estudio, posible desbalance de genero y emociones limitadas a seis categorias discretas.
- Uso previsto exclusivamente de investigacion; no se documenta validacion en produccion.
- Prohibido imitar la voz de una persona sin su consentimiento; el modelo puede transferir identidad a partir de una locucion de referencia.
- La licencia MIT cubre codigo y checkpoints TTS, pero el dataset MEAD se distribuye bajo licencia de investigacion y acceso restringido (gated).
- El encoder facial y el juez SER fueron desarrollados por Yejin Jeon y se incluyen con permiso; conviene revisar sus condiciones de uso.
- No soporta otros idiomas distintos del ingles ni tareas de texto, codigo o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luel/emofi-tts
- Paper: https://arxiv.org/abs/2610.30477
- Codigo y recetas: https://github.com/luelhagos/Emofi
- Dataset MEAD preprocesado: https://huggingface.co/datasets/luel/emofi-mead
- HiFi-GAN (vocoder): https://github.com/jik876/hifi-gan
- Web del autor/organizacion: https://www.luel.ai/
