# Phoonnx/vits-ghananlpcommunity_stable-twi-tts

## Resumen

`vits-ghananlpcommunity_stable-twi-tts` es un modelo de síntesis de voz (text-to-speech) en formato ONNX derivado de la familia de voces Piper, empaquetado por el proyecto Phoonnx para su uso con la librería homónima. Concretamente, se corresponde con la carpeta `ghananlpcommunity__stable-twi-tts` del repositorio agregador `Phoonnx/phoonnx-vits`, que a su vez recopila voces Piper procedentes de distintas fuentes comunitarias.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo extremo a extremo que transforma texto en forma de onda de audio sin necesidad de un vocoder separado. Está orientado a la síntesis de voz en twi (akan), una lengua hablada principalmente en Ghana, y se distribuye como un artefacto ONNX de pequeño tamaño (el repositorio completo ocupa aproximadamente 0,1 GB), lo que lo hace adecuado para inferencia ligera en CPU o en dispositivos con recursos limitados.

Su relevancia radica en dos factores: por un lado, amplía la cobertura de lenguas de bajos recursos en el ecosistema de TTS open source; por otro, su empaquetado en ONNX y su integración con Phoonnx facilitan el despliegue en producción sin depender de frameworks de deep learning pesados. El modelo se publica bajo licencia MIT según los metadatos del repositorio, aunque la model card advierte que la licencia efectiva depende de la fuente original de cada voz y remite a la documentación de la carpeta correspondiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, generativa adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | twi (akan); resto no disponible |
| Licencia | MIT (según metadatos); la model card remite a la licencia de la fuente original por subcarpeta |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS se caracteriza por generar directamente la forma de onda a partir de la secuencia de texto, evitando la cascada tradicional de modelo acústico más vocoder y reduciendo la latencia en inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de horas de audio ni si se aplicaron técnicas de ajuste fino, RLHF o post-procesado. La model card únicamente indica que la voz proviene de la carpeta `ghananlpcommunity__stable-twi-tts` del repositorio agregador `Phoonnx/phoonnx-vits`, que a su vez recopila voces Piper de origen comunitario (GhanaNLP Community). Tampoco se detalla el front-end fonético empleado para el twi en esta voz concreta; en la fuente agregadora se menciona que otras voces del mismo repositorio usan espeak con el front-end `lfn`, pero no se confirma que sea el caso de esta.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en twi.
- Generación de audio en formato de onda mediante arquitectura VITS end-to-end.
- Inferencia mediante ONNX Runtime a través de la librería Phoonnx.
- Integración con el ecosistema Phoonnx, que expone identificadores de voz como `ghananlpcommunity/stable-twi-tts`.
- No se documentan capacidades de clonación de voz, control de emociones, multi-hablante ni conversión de voz.
- No se documentan capacidades de tool calling, agentes, razonamiento ni procesamiento multimodal.
- Cobertura multilingüe limitada al twi según la información disponible.

## Casos de uso

- **Lectura de contenido en twi para aplicaciones de accesibilidad**: el modelo puede convertir texto en audio para personas con discapacidad visual o dificultades de lectura en twi, aprovechando su formato ONNX ligero para ejecutarse en dispositivos de gama baja.
- **Asistentes de voz para servicios públicos en Ghana**: integración en IVR o chatbots telefónicos que atiendan en twi, donde la baja latencia de VITS y el tamaño reducido del modelo permiten despliegue en servidores modestos.
- **Locución automatizada de noticias o boletines**: generación de audio para boletines informativos o contenidos educativos en twi, reduciendo el coste de producción de locución humana.
- **Aprendizaje de idiomas**: aplicación de pronunciación y lectura en twi para estudiantes, generando audio bajo demanda a partir de texto introducido por el usuario.
- **Integración en pipelines de accesibilidad web**: conversión de artículos o documentos web a audio en twi mediante un servicio basado en ONNX Runtime, sin dependencias de GPU.
- **Prototipado de interfaces de voz en investigación lingüística**: uso del modelo como base para experimentos de TTS en lenguas de bajos recursos, gracias a su licencia permisiva y a su formato abierto.
- **Generación de audiolibros o pódcasts en twi**: síntesis por lotes de textos largos, troceando el texto en fragmentos y concatenando el audio resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas MOS (Mean Opinion Score), MCD, WER ni comparativas objetivas con otras voces Piper o sistemas TTS para twi.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo VITS de tamaño reducido (~0,1 GB de repositorio), la inferencia puede ejecutarse en CPU sin GPU dedicada. La VRAM necesaria en GPU es marginal (inferior a 1 GB en la mayoría de configuraciones).
- **GPU recomendadas**: no se requieren GPU para producción; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede ejecutar el modelo, pero no es necesario para un rendimiento aceptable.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos tipo Raspberry Pi, siempre que se use ONNX Runtime.
- **Opciones de despliegue**: ONNX Runtime (principal), librería Phoonnx; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vits-ghananlpcommunity_stable-twi-tts` | VITS | twi | ONNX | MIT (según metadatos) | Hugging Face (Phoonnx) |
| Otras voces Piper del repositorio `Phoonnx/phoonnx-vits` | VITS | múltiples (p. ej. Chichewa, Makhuwa) | ONNX | variable por subcarpeta | Hugging Face (Phoonnx) |
| Voces Piper originales de GhanaNLP (`michsethowusu/kasanoma`) | VITS | twi, Chichewa, Makhuwa | Piper | `other` (sin licencia declarada) | GitHub releases |

No se dispone de información sobre benchmarks comparativos entre estas alternativas ni sobre otros sistemas TTS específicos para twi en la información proporcionada.

## Limitaciones y advertencias

- **Licencia ambigua**: aunque los metadatos del repositorio indican MIT, la model card advierte que la licencia efectiva depende de la fuente original de cada voz y que algunas voces del agregador llevan `license: other` por no declarar licencia la fuente. Es imprescindible revisar el README de la carpeta antes de un uso comercial.
- **Idioma limitado**: el modelo está orientado exclusivamente al twi; no se documenta soporte para otras lenguas.
- **Sin datos de entrenamiento**: se desconoce el corpus, el número de horas y la calidad del audio de entrenamiento, lo que impide evaluar sesgos o cobertura dialectal.
- **Riesgo de alucinación acústica**: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento.
- **Sin benchmarks**: no hay métricas objetivas publicadas que permitan comparar su calidad con alternativas.
- **Caveat de producción**: al ser una voz comunitaria sin documentación detallada, se recomienda validación cualitativa con hablantes nativos antes de desplegarla en servicios públicos.
- **Sin soporte multi-hablante documentado**: no se indica si el modelo permite seleccionar distintas voces o estilos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-ghananlpcommunity_stable-twi-tts)
- [Repositorio agregador Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Librería Phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Voces originales GhanaNLP kasanoma (GitHub)](https://github.com/michsethowusu/kasanoma)
