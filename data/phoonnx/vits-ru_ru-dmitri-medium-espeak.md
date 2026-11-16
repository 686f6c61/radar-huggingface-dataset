# Phoonnx/vits-ru_ru-dmitri-medium-espeak

## Resumen

vits-ru_ru-dmitri-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su uso con la librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en ruso (variante ru-RU) y emplea fonemas espeak-ng en alfabeto IPA como representación intermedia de entrada, lo que lo vincula directamente al ecosistema de voces Piper.

Se trata de un modelo de tamano medio (la variante "medium" de la familia Piper) distribuido en formato ONNX, con un repositorio de apenas 0,1 GB, lo que lo hace especialmente ligero para despliegue en entornos con recursos limitados, incluidos dispositivos de borde y asistentes de voz embebidos. Su integración con phoonnx permite utilizarlo tanto desde Python como a través del plugin `ovos-tts-plugin-phoonnx` en el stack de asistentes OVOS/Mycroft.

Su relevancia actual radica en que ofrece una voz rusa funcional bajo licencia MIT, con un pipeline de fonemización bien definido (espeak-ng o el port espyak) y compatibilidad con despliegue en navegador mediante phoonnx.js. No obstante, se trata de un modelo sin métricas de calidad publicadas en la información disponible y con cero descargas registradas en el momento de la ficha, lo que sugiere un empaquetado reciente y aún sin validación comunitaria amplia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0,1 GB |
| Autor original (upstream) | Rhasspy (piper-voices) |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder separado en inferencia, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

El modelo procede de la colección `rhasspy/piper-voices`, concretamente de la ruta `ru/ru_RU/dmitri/medium`, y ha sido reempaquetado por Phoonnx para su consumo mediante ONNX Runtime. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicional. La innovación destacable en este empaquetado es la integración del front-end de texto: phoonnx delega la normalización y conversión a fonemas en la librería `scriptconv`, usando `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`, y advierte de que el uso del port espyak en lugar de espeak-ng nativo puede provocar errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz (text-to-speech) en ruso ru-RU a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng (o espyak como alternativa embebida).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en el stack OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de visión ni audio de entrada.
- Monolingüe: únicamente ruso.

## Casos de uso

- Asistentes de voz embebidos en OVOS/Mycroft: el modelo se integra como módulo TTS seleccionando la voz `piper/ru_RU-dmitri-medium` en `mycroft.conf`, lo que permite dotar de salida de voz en ruso a asistentes domésticos sin depender de servicios en la nube.
- Lectura de textos y artículos en ruso: dado su bajo peso (0,1 GB) y formato ONNX, puede ejecutarse en un servidor modesto o en local para convertir artículos, noticias o documentación a audio de forma por lotes.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de síntesis que requieran una voz rusa ligera y de licencia permisiva (MIT) sin coste por uso.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse del lado del cliente para generar audio en aplicaciones web sin enviar texto a un servidor, útil por privacidad y latencia.
- Generación de audiolibros o pódcasts automatizados: el pipeline permite procesar capítulos completos por fragmentos y ensamblar los WAV resultantes, con la ventaja de una licencia MIT que no restringe el uso comercial.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño y con API Python sencilla, sirve como base para validar arquitecturas de síntesis, comparar front-ends de fonemización (espeak-ng frente a espyak) o medir latencia en distintos hardware antes de escalar a modelos mayores.
- Sistemas de anuncios o notificaciones por voz en ruso: integración en aplicaciones de domótica, transporte o atención telefónica que requieran mensajes pregrabados dinámicamente sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,1 GB en formato ONNX, la huella de memoria es muy reducida y cabe holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100); el modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft; al ser ONNX, es compatible con ONNX Runtime en CPU y GPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-ru_ru-dmitri-medium-espeak (este) | VITS | ru-RU | 0,1 GB (repo) | MIT | ONNX | Empaquetado para phoonnx, entrada espeak IPA |
| Otras voces Piper ru_RU (p. ej. irina) | VITS | ru-RU | similar (repo pequeño) | MIT | ONNX | Misma familia upstream; variantes de voz y calidad no detalladas en la información disponible |
| Modelos TTS multilingües tipo XTTS | no disponible | multilingüe | varios GB | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza ruso (ru-RU); no soporta otros idiomas.
- Dependencia de espeak-ng: sin él instalado, phoonnx recurre al port espyak, cuyos fonemas difieren y pueden provocar pronunciaciones incorrectas en algunas palabras.
- Sin métricas de calidad publicadas: no hay datos de MOS, WER ni comparativas objetivas en la información disponible.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o entonación antinatural en textos con abreviaturas, números o nombres propios, dependiente de la normalización de scriptconv.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de retroalimentación pública sobre su robustez.
- Licencia MIT permisiva para uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices` por si hubiera condiciones adicionales no reflejadas.
- Al ser un modelo TTS, no ofrece razonamiento, tool calling ni generación de texto; no debe evaluarse con benchmarks de LLM.
- Limitaciones de contexto no aplicables en el sentido tradicional, pero la calidad puede degradarse en textos muy largos si no se fragmentan adecuadamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-dmitri-medium-espeak
- Upstream (Piper voices, ru_RU/dmitri/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/dmitri/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
