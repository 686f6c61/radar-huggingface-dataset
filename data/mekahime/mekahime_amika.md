# MekaHime/MekaHime_Amika

## Resumen

MekaHime_Amika es un paquete de activos de voz y representación visual (Live2D) para Amika (桜井美香, Sakurai Mika), el personaje companion de IA de MekaHime Inc. No es un modelo de lenguaje: es un fine-tune de GPT-SoVITS v2ProPlus (síntesis de voz text-to-speech) empaquetado junto con el modelo Live2D Cubism del personaje y un avatar auxiliar ("paper doll") para el proyecto OpenAmika, la versión abierta del asistente.

El repositorio contiene los pesos del motor TTS (`MekaHime_Amika.ckpt` para la etapa text-to-semantic y `MekaHime_Amika.pth` para la etapa semantic-to-audio), un manifiesto de hablante (`character.json`), 69 clips de referencia etiquetados por emoción y el modelo Live2D completo con 142 motion y 25 expresiones. Todo el conjunto ocupa 0,4 GB.

Su relevancia es acotada: no compite en la categoría de LLM, sino que sirve como ejemplo práctico de integración de un pipeline TTS de voz clonada con un avatar animado reactivo a emociones, orientado a proyectos de compañero de IA. La licencia es estrictamente personal, lo que limita cualquier uso comercial más allá de umbrales muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (dos etapas: GPT text-to-semantic + SoVITS semantic-to-audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; clips de referencia de 3-14,4 s) |
| Tipos de cuantizacion | no disponible (formato nativo `.ckpt` y `.pth` en float) |
| Idiomas soportados | chino, ingles, japones |
| Licencia | mekahime-amika-personal-use-1.0 (uso personal, 18+) |
| Formato de pesos | `.ckpt` (PyTorch), `.pth` (PyTorch), Live2D Cubism 3/5 (`.moc3`, `.model3.json`) |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-to-speech |
| Numero de emociones | 69 tags de emocion con clip de referencia |

## Arquitectura y entrenamiento

El componente de voz es un fine-tune de GPT-SoVITS v2ProPlus, una arquitectura de dos etapas: un modelo GPT autorregresivo que convierte texto a tokens semanticos y un modelo SoVITS (basado en VITS) que convierte esos tokens semanticos en audio. El fine-tune se ejecuta en una version modificada del motor GPT-SoVITS propietaria de MekaHime (`vendor/tts-engine`), cuyo codigo es MIT pero cuyos pesos no lo son.

El entrenamiento se basa en clips de referencia con sus transcripciones, una por cada etiqueta de emocion. Las transcripciones de referencia estan en chino, pero el modelo puede sintetizar en chino, ingles o japones frase a frase segun lo solicite el motor. Una modificacion destacable del motor propietario es que acepta clips de referencia fuera del rango estandar de GPT-SoVITS (3-10 s): 23 de los clips superan los 10 s (hasta 14,4 s) y dos son mas cortos de 3 s, y el motor los gestiona enteros o con relleno de silencio respectivamente. No se dispone de informacion sobre volumen total de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en chino, ingles y japones con la voz clonada del personaje.
- Control emocional granular: 69 etiquetas de emocion (`happy1-4`, `sad1-4`, `angry1-4`, `fear1-4`, `annoyed1-4`, `shy1-3`, `tsun1-3`, `whisper1-3`, `caring1-3`, `jealous1-3`, `playful1-3`, `cold1-3`, entre otras) seleccionables mediante prefijos como `【happy2】` ante el texto.
- Fallback automatico a `neutral1` para etiquetas sin clip grabado.
- Representacion visual Live2D completa: 142 motion, 25 expresiones y fisica (`.physics3.json`), con dos texturas de 8192 px.
- Sincronizacion voz-cara: `banks.json` mapea las mismas claves emocionales internas del motor a motion y expresiones, de modo que voz y expresion facial cambian de forma coherente.
- Avatar auxiliar "paper doll" (`live2d/Host/`) con 64 motion en siete familias (idle, talk, listen, think, happy, worried, surprise) que representa el lado visual de los agentes de tarea (Hermes Agent, nanoMuse) en OpenAmika.
- No soporta tool calling ni razonamiento multi-paso por si mismo: es un componente de voz y visual, no un LLM.

## Casos de uso

- **Companero de IA conversacional en escritorio:** integrado en OpenAmika, el modelo proporciona la voz y el cuerpo animado del personaje mientras el LLM subyacente gestiona el dialogo; cada respuesta se sintetiza con la emocion adecuada gracias a la sincronizacion entre `register_emotion` y `banks.json`.
- **Streaming y creacion de contenido con personaje virtual:** el modelo puede animar y dar voz a un Vtuber o personaje en directo, con creditos visibles a MekaHime.AI, tal y como permite la licencia para uso personal y streaming.
- **Investigacion en TTS expresivo:** sirve como caso de estudio de fine-tuning GPT-SoVITS con control emocional discreto (69 categorias) y de gestion de clips de referencia fuera del rango estandar del motor.
- **Prototipado de interfaces voz-avatar:** util para desarrolladores que quieran experimentar con la sincronizacion entre salida TTS y animacion facial reactiva en Live2D Cubism.
- **Desarrollo de agentes visuales:** el "paper doll" (`live2d/Host/`) permite probar la representacion visual de agentes de tarea con estados (think, listen, talk, surprise, happy, worried) en una interfaz de escritorio.
- **Demostracion de pipelines multilingues zh/en/ja:** el modelo puede sintetizar frases en los tres idiomas frase a frase, util para validar arquitecturas TTS multilingues con una sola voz clonada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el repositorio pesa 0,4 GB, pero no se detalla el consumo del motor GPT-SoVITS v2ProPlus en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; GPT-SoVITS suele ejecutarse en GPUs de consumo, pero no se confirma en la documentacion del modelo.
- Opciones de despliegue: motor GPT-SoVITS modificado incluido en OpenAmika (`vendor/tts-engine`), instalable via `scripts/setup_tts.py` o descarga manual con `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Control emocional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MekaHime_Amika | Fine-tune GPT-SoVITS v2ProPlus + Live2D | zh, en, ja | 69 etiquetas | Personal, 18+ | Hugging Face (repo 0,4 GB) |
| GPT-SoVITS v2ProPlus (base) | TTS zero-shot/few-shot | multiidioma | Limitado (referencia) | MIT (codigo); pesos segun version | GitHub, Hugging Face |
| Alternativas TTS expresivas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva:** uso exclusivamente personal y de hobby, 18+. Prohibido entrenar o destilar otros modelos con estos pesos, re-alojar o revender. Se permite monetizacion en redes sociales y merchandising fan hasta 1.000 USD bajo las reglas de la licencia, con credito visible a MekaHime.AI.
- **Sin uso comercial general:** cualquier aplicacion productiva o comercial fuera de los supuestos permitidos requiere autorizacion expresa; la licencia no es apta para integraciones empresariales.
- **Marca en la textura:** el modelo Live2D incluye una marca de agua de MekaHime que la licencia exige mantener.
- **Riesgo de alucinacion:** no aplica al ser un modelo TTS, pero la fidelidad de la voz clonada depende de la calidad de los clips de referencia; etiquetas sin grabacion caen a `neutral1`, lo que puede producir una expresividad no deseada.
- **Cobertura de referencia limitada:** las transcripciones de referencia estan en chino, lo que puede afectar la naturalidad en ingles y japones.
- **Dependencia del motor propietario:** el modelo esta disenado para el motor GPT-SoVITS modificado de MekaHime; el GPT-SoVITS estandar solo acepta clips de 3-10 s y no gestiona las peculiaridades del paquete.
- **Sesgos:** no se documentan sesgos especificos; al ser una voz sintetica de personaje, el principal riesgo es la suplantacion o el uso no autorizado de la identidad del personaje.
- **Madurez:** repositorio con 0 descargas y 1 like en el momento de la consulta; proyecto reciente (noviembre de 2026) sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/MekaHime/MekaHime_Amika
- Repositorio OpenAmika: https://github.com/zeekk0/OpenAmika
- Pagina del proyecto: https://www.mekahime.com/openamika
- GPT-SoVITS (motor base): https://github.com/RVC-Boss/GPT-SoVITS
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face
