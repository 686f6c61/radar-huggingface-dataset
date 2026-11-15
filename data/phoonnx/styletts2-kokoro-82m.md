# Phoonnx/styletts2-kokoro-82m

## Resumen

`Phoonnx/styletts2-kokoro-82m` es un paquete de pesos en formato ONNX derivado del repositorio agregador `Phoonnx/phoonnx-styletts2`, del que constituye la carpeta `kokoro-82m`. No se trata de un modelo entrenado por el autor del repositorio, sino de una redistribucion empaquetada para su uso con la libreria `phoonnx` (proyecto de TigreGotico), un runtime de sintesis de voz. El modelo subyacente es Kokoro-82M, un TTS de 82 millones de parametros basado en la arquitectura StyleTTS2, pensado para sintesis de voz ligera y de baja latencia en CPU y GPU.

La relevancia de este repositorio es fundamentalmente practica: expone los checkpoints de Kokoro en ONNX con identificadores de voz normalizados bajo el prefijo `kokoro/` (por ejemplo `kokoro/af_heart`, `kokoro/bf_emma`, `kokoro/zf_xiaoxiao`), de modo que un consumidor de `phoonnx` puede seleccionar voces por identificador estable sin gestionar rutas internas. La model card no aporta informacion sobre arquitectura detallada, datos de entrenamiento ni evaluaciones.

La informacion disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, fue creado el 14 de noviembre de 2026 y ocupa 0,2 GB. La licencia se declara como `other` porque el repositorio original agrega checkpoints de distintos laboratorios con licencias distintas; la propia libreria `phoonnx` es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (familia Kokoro), exportada a ONNX; detalles internos no disponibles |
| Parametros totales | 82 M (segun el nombre del checkpoint `kokoro-82m`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible de forma explicita; los identificadores de voz sugieren ingles britanico y americano (prefijos `af`, `am`, `bf`, `bm`), espanol (`ef`, `em`), frances (`ff`), hindi (`hf`, `hm`), italiano (`if`, `im`), japones (`jf`, `jm`), portugues (`pf`, `pm`) y chino mandarin (`zf`, `zm`) |
| Licencia | `other` (agregacion de checkpoints con licencias heterogeneas; `phoonnx` es Apache-2.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Kokoro, construida sobre StyleTTS2, una arquitectura de sintesis de voz que combina un encoder de estilo y un decodificador vocacional con componentes de difusion para el modelado de prosodia. El tamano de 82 millones de parametros la situa en la gama muy ligera, apta para inferencia en tiempo real. El repositorio en si no contiene el codigo de entrenamiento ni los pesos originales en PyTorch: solo la exportacion ONNX empaquetada para `phoonnx`, conservando las rutas de ficheros del repositorio de origen.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card se limita a listar los identificadores de voz y a remitir al repositorio `Phoonnx/phoonnx-styletts2` para la licencia. Cualquier afirmacion sobre el proceso de entrenamiento de Kokoro-82M deberia verificarse en la documentacion del proyecto original, que no forma parte de la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con salida de audio.
- Seleccion de voz mediante identificadores estables con prefijo `kokoro/`, con 54 voces listadas en la model card.
- Cobertura multilingue por familia de voces: ingles americano y britanico, espanol, frances, hindi, italiano, japones, portugues y chino mandarin (segun los prefijos de los identificadores; no se documenta el nivel de calidad por idioma).
- Varias voces por idioma y genero, incluyendo voces masculinas y femeninas (por ejemplo `kokoro/am_adam`, `kokoro/af_bella`, `kokoro/em_alex`, `kokoro/ef_dora`).
- Integracion con el runtime `phoonnx` mediante la libreria del mismo nombre.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de sintesis.

## Casos de uso

- Lectura de articulos y documentos: el modelo convierte texto plano en audio con voces en varios idiomas, adecuado para funciones de accesibilidad y lectura por voz en aplicaciones web o moviles gracias a su tamano reducido (82 M de parametros).
- Asistentes de voz en local: al ejecutarse via ONNX con `phoonnx`, puede desplegarse en dispositivos sin GPU dedicada, lo que permite asistentes de voz offline con baja latencia.
- Audiolibros y contenido narrado: la disponibilidad de multiples voces por idioma (`af_*`, `am_*`, `bf_*`, `bm_*`, etc.) permite asignar voces distintas a narradores o personajes en un mismo proyecto.
- Doctrans de videojuegos y aplicaciones: la seleccion de voz por identificador estable facilita cambiar la voz de un personaje sin tocar el codigo, usando por ejemplo `kokoro/bf_emma` para un personaje femenino britanico.
- Generacion de avisos y notificaciones: sintesis de mensajes cortos en tiempo real para sistemas de alerta, con voces en espanol (`ef_dora`, `em_alex`) o portugues (`pf_dora`, `pm_alex`) segun la region.
- Prototipado de interfaces conversacionales: al ser un modelo ligero y empaquetado en ONNX, sirve para validar flujos de voz en entornos de desarrollo antes de escalar a modelos TTS mayores.
- Localizacion de contenido: la cobertura de ocho familias de idiomas permite generar la misma locucion en varios idiomas cambiando solo el identificador de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repositorio (0,2 GB) y los 82 M de parametros, la inferencia en FP32 requeriria del orden de 0,3-0,5 GB de memoria, y menos en cuantizaciones INT8, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles; por su tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente, y probablemente tambien CPU.
- Cabe en GPU consumer: si, con alta probabilidad, dado el reducido numero de parametros; no hay confirmacion oficial.
- Opciones de despliegue: el runtime previsto es `phoonnx` (https://github.com/TigreGotico/phoonnx) sobre ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| styletts2-kokoro-82m (este) | 82 M | no aplica | 8 familias de voces (segun identificadores) | `other` | ONNX |
| Kokoro-82M (original) | 82 M | no aplica | multiple | Apache-2.0 (segun el proyecto original) | PyTorch / ONNX |
| StyleTTS2 (original) | no disponible | no aplica | ingles principalmente | MIT (segun el proyecto original) | PyTorch |
| Piper | no disponible | no aplica | multiple | MIT (segun el proyecto original) | ONNX |

Las licencias de las filas comparativas se indican segun el conocimiento general de esos proyectos y no proceden de la informacion proporcionada; deben verificarse en sus repositorios oficiales. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La licencia es `other` y agrega checkpoints de distintos laboratorios con licencias heterogeneas; la model card menciona explicitamente que el checkpoint BSC Catalan es GPL-3.0. Es imprescindible revisar la licencia de cada voz antes de uso comercial.
- La model card no documenta sesgos, calidad por idioma ni comportamiento en dominios especificos; no hay evaluaciones publicadas.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de prosodia incorrecta o pronunciacion erronea en textos con nombres propios, siglas o idiomas mezclados, sin datos que lo cuantifiquen.
- El repositorio tiene 0 descargas y 0 likes y fue creado recientemente; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La informacion sobre idiomas se infiere de los prefijos de los identificadores de voz, no de una declaracion explicita del autor; la cobertura real por idioma no esta confirmada.
- No se documentan limitaciones de longitud de texto de entrada; en modelos TTS de este tipo suele ser necesario trocear textos largos, pero no hay confirmacion en la informacion disponible.
- El modelo depende del runtime `phoonnx`; no se garantiza compatibilidad con otros motores ONNX sin adaptacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/styletts2-kokoro-82m
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
