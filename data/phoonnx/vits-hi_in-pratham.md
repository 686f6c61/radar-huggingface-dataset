# Phoonnx/vits-hi_in-pratham

## Resumen

`vits-hi_in-pratham` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede del repositorio de voces Piper de PravalX, concretamente de la variante `hi_IN/pratham/medium`, y está especializado en hindi de la India (`hi-IN`). Su función es convertir texto en audio inteligible con una voz concreta (denominada "pratham"), pensada para integrarse en asistentes de voz y sistemas de lectura en ese idioma.

La relevancia de este paquete es fundamentalmente de distribución: Phoonnx toma un modelo VITS ya entrenado y lo publica en formato ONNX listo para ejecutarse con su librería Python y con el ecosistema OVOS (Open Voice OS). El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia en CPU o GPU modestas, no a un sistema TTS de gran escala.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento ni los detalles del proceso de entrenamiento en la documentación proporcionada. La ficha se limita, por tanto, a lo que el autor declara en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | hindi de la India (`hi-IN`) |
| Licencia | `other`; el autor indica que el upstream declara licencia `cc` en la model card de `PravalX/piper-voices` |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por el texto, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico latente. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

En este caso concreto, el modelo no ha sido entrenado por Phoonnx: el paquete reproduce un checkpoint ya existente de PravalX (voz `hi_IN/pratham/medium` del proyecto Piper) y lo convierte a ONNX para su uso con la librería phoonnx. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino o RLHF. El front-end de texto se delega en `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` (espeak-ng o el port espyak).

## Capacidades

- Síntesis de voz a partir de texto en hindi de la India (`hi-IN`).
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Fonemización basada en espeak-ng (alfabeto IPA) a través de `scriptconv`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente TTS.
- No dispone de modo "thinking", visión ni audio de entrada.
- Capacidad multilingüe limitada al hindi; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en hindi: el modelo puede integrarse en OVOS como módulo TTS para responder a consultas del usuario en `hi-IN`, aprovechando el plugin oficial y la configuración declarativa en `mycroft.conf`.
- Lectura de contenido en aplicaciones móviles o web: dado su tamaño reducido (~0,1 GB) y su formato ONNX, puede desplegarse en dispositivos con recursos limitados para leer noticias, artículos o mensajes en hindi.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en hindi dentro de lectores de pantalla o herramientas de asistencia, con una voz concreta y consistente.
- Sistemas de megafonía o avisos automatizados: generación de anuncios pregrabados o dinámicos en hindi para transporte, comercio o administración pública.
- Integración en pipelines de CI/CD para pruebas de TTS: al ser un modelo ONNX ligero, puede usarse para validar la calidad de síntesis en pruebas automatizadas de aplicaciones de voz.
- Prototipado rápido de interfaces conversacionales: permite construir demos de asistentes en hindi sin depender de servicios cloud de TTS, ejecutando el modelo localmente con phoonnx.
- Generación de audiolibros o contenido educativo en hindi: síntesis por lotes de textos largos divididos en frases, con la voz "pratham" como narrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) se trata de un modelo muy ligero, apto para ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU y, presumiblemente, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) sin requerimientos especiales.
- Cabe en GPU consumer: sí, por tamaño; no se detallan requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-hi_in-pratham` | VITS | hi-IN | no aplica | other (upstream `cc`) | ONNX | Hugging Face, phoonnx, OVOS |
| Otras voces Piper de PravalX (`piper-voices`) | VITS | varios (según voz) | no aplica | según voz | ONNX / Piper | Hugging Face |
| Modelos TTS multilingües de gran escala | no disponible | varios | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo entrenado sobre una voz concreta, puede reproducir características del hablante y del corpus original.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o entonación inadecuada, especialmente con palabras fuera del vocabulario o con fonemas mal convertidos.
- Limitación de idioma: solo hindi (`hi-IN`); no se declaran otros idiomas.
- Dependencia de espeak-ng: sin espeak-ng instalado, la fonemización puede ser incorrecta; el port espyak puede pronunciar mal algunas palabras, según advierte el autor.
- Licencia: el repositorio declara `other` y el autor indica que el upstream declara `cc`; conviene verificar los términos exactos antes de uso comercial, ya que la licencia no está detallada en la model card.
- Caveat de producción: no se documentan métricas de calidad (MOS, WER), latencia ni throughput; el modelo tiene pocas descargas (29) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- El modelo es un empaquetado de un checkpoint ajeno; la responsabilidad sobre la calidad del audio recae en el modelo original de PravalX.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hi_in-pratham
- Upstream (Piper voices de PravalX): https://huggingface.co/PravalX/piper-voices/tree/main/hi/hi_IN/pratham/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
