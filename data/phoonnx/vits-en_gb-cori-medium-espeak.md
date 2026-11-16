# Phoonnx/vits-en_gb-cori-medium-espeak

## Resumen

`vits-en_gb-cori-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente entrenado por Rhasspy como parte del proyecto Piper y reempaquetado por Phoonnx para su libreria ONNX de inferencia TTS. El modelo genera audio a partir de texto en ingles britanico (en-GB) y utiliza fonemas espeak-ng en alfabeto IPA como entrada, lo que lo integra en el ecosistema de voces Piper.

La relevancia de este modelo reside en su formato: pesos ONNX ligeros (el repositorio ocupa aproximadamente 0,1 GB) que permiten inferencia en CPU sin dependencias de GPU, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domoticos y despliegues en dispositivos de recursos limitados. Se integra de forma nativa con OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` y con la libreria phoonnx.js para ejecucion en navegador.

No se dispone de informacion publica sobre el numero exacto de parametros, la composicion del dataset de entrenamiento ni resultados de benchmarks objetivos (MOS, WER) en la informacion proporcionada. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repositorio se distribuye en formato ONNX, sin variantes cuantizadas documentadas) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Autor original | Rhasspy (proyecto Piper) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional condicionado por alineamiento monotonico (MAS, Monotonic Alignment Search) y un decoder generativo basado en HiFi-GAN, entrenado con un objetivo adversarial junto a una perdida de reconstruccion espectral. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo separado, lo que simplifica el pipeline de inferencia y reduce la latencia.

El modelo procede del catalogo `rhasspy/piper-voices`, concretamente de la voz `en_GB/cori/medium` dentro de la rama de ingles britanico. La etiqueta "medium" hace referencia al tamano de la voz dentro de la taxonomia de Piper (que distingue entre low, medium y high). No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio empleadas en el entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La entrada se realiza exclusivamente mediante fonemas espeak-ng, lo que implica que el front-end de texto (normalizacion, conversion a fonemas) corre a cargo de la libreria `scriptconv` de Phoonnx.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB), con salida en formato WAV.
- Generacion de audio a partir de fonemas IPA precalculados mediante espeak-ng (modo fonema directo).
- Inferencia en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion con OVOS (Open Voice OS) a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- Normalizacion y conversion de texto a fonemas delegada a `scriptconv` (extra `scriptconv[espeak]`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo TTS puro).
- Capacidad multilingue limitada: unicamente en-GB.

## Casos de uso

- **Asistentes de voz embebidos en dispositivos de recursos limitados**: el modelo puede ejecutarse en CPU con ONNX Runtime y un peso de repositorio de ~0,1 GB, lo que permite integrarlo en Raspberry Pi o dispositivos IoT para dar respuestas habladas en ingles britanico sin depender de servicios en la nube.
- **Sistemas domoticos con OVOS**: mediante el plugin `ovos-tts-plugin-phoonnx` y la configuracion en `mycroft.conf`, se puede seleccionar la voz `piper/en_GB-cori-medium` para que el asistente domotico lea notificaciones, estados de sensores o recordatorios en tiempo real.
- **Lectura de contenido en aplicaciones web**: a traves de `phoonnx.js`, el modelo puede ejecutarse en el navegador para leer articulos, notificaciones o mensajes de accesibilidad sin enviar texto a un servidor externo, preservando la privacidad.
- **Generacion de avisos y locuciones pregrabadas**: en pipelines de CI/CD o scripts por lotes, se puede sintetizar un conjunto de frases fijas (avisos de transporte, mensajes de bienvenida, instrucciones de seguridad) y almacenar los WAV resultantes para su reproduccion offline.
- **Prototipado rapido de interfaces de voz**: al instalarse con `pip install --pre phoonnx` y requerir solo espeak-ng, permite a desarrolladores validar flujos de conversion texto-a-voz en etapas tempranas de un producto sin contratar servicios TTS comerciales.
- **Accesibilidad en aplicaciones de escritorio**: integracion en lectores de pantalla o herramientas de asistencia para usuarios que requieran salida de voz en ingles britanico, con licencia MIT que permite redistribucion dentro del producto.
- **Sistemas de megafonia o telefonia con texto dinamico**: su baja huella y su capacidad de generar WAV en local permiten insertarlo en centralitas o sistemas de anuncios que construyan el texto en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo esta pensado para inferencia en CPU mediante ONNX Runtime. El repositorio ocupa ~0,1 GB, por lo que la huella en RAM es del orden de cientos de MB durante la inferencia.
- **GPU recomendadas**: no necesarias. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podria ejecutarlo, pero no se documenta una configuracion GPU especifica ni ganancias de rendimiento.
- **Compatibilidad con GPU de consumo**: si, cabe en cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- **Opciones de despliegue**: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS VITS).
- **Latencia y throughput**: no disponibles en la informacion proporcionada.
- **Requisito adicional**: espeak-ng instalado en el sistema (por ejemplo, `apt install espeak-ng`) o el extra `phoonnx[espeak]` que incluye el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano repo | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_gb-cori-medium-espeak` | VITS | en-GB | ONNX | MIT | ~0,1 GB | Empaquetado Phoonnx, entrada espeak-ng |
| Otras voces `rhasspy/piper-voices` (en_GB) | VITS | en-GB | ONNX | MIT (segun upstream) | variable (low/medium/high) | Mismo origen Piper; la voz "cori medium" es una de ellas |
| Voces Piper en otros idiomas del catalogo Phoonnx | VITS | varios | ONNX | MIT | variable | Misma familia de empaquetado, distinto idioma |
| Modelos TTS comerciales (p. ej. servicios cloud) | no disponible | multi | API | propietaria | no aplica | No comparables en licencia ni despliegue local |

No se dispone de datos de benchmarks objetivos que permitan comparar la calidad (MOS, intelligibilidad) de esta voz frente a alternativas de la misma categoria. La comparacion se limita a aspectos de licencia, formato y despliegue.

## Limitaciones y advertencias

- **Un solo idioma**: solo soporta en-GB; no es multilingue ni acepta texto en otros idiomas sin fonemizacion manual.
- **Dependencia de espeak-ng**: la calidad de la sintesis depende de la fonemizacion correcta. Con el port espyak, algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- **Riesgo de alucinacion acustica**: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en textos no vistos, especialmente con nombres propios, siglas o numeros.
- **Sin datos de evaluacion publicos**: no se han publicado MOS, WER ni comparativas objetivas en la informacion disponible, lo que dificulta estimar su calidad frente a alternativas.
- **Licencia MIT**: permite uso comercial y redistribucion, pero se recomienda verificar la cadena de licencias del upstream (`rhasspy/piper-voices`) por si el modelo original tuviera condiciones adicionales no reflejadas.
- **Sin soporte de contexto largo ni razonamiento**: es un modelo TTS puro; no gestiona conversaciones multi-turno ni tool calling.
- **Fecha de creacion futura en los metadatos**: el repositorio figura creado el 2026-11-14, dato que conviene contrastar con la fuente original antes de citarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-cori-medium-espeak
- Upstream Piper (voz cori medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/cori/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
