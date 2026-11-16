# Phoonnx/vits-kbd-female-graphemes

## Resumen

El modelo `Phoonnx/vits-kbd-female-graphemes` es un sistema de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario anzorq y empaquetado por Phoonnx para su librería de inferencia ONNX. Está diseñado específicamente para el idioma kabardiano (kbd), una lengua del noroeste del Cáucaso hablada principalmente en la república rusa de Kabardino-Balkaria, y produce una voz femenina sintética.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo hace extremadamente ligero y apto para despliegues en dispositivos con recursos limitados. Su propósito es proporcionar una voz TTS funcional para una lengua con recursos digitales escasos, integrándose en el ecosistema de asistentes de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.

La relevancia de este modelo reside en su carácter de recurso lingüístico para una lengua minoritaria y de baja densidad digital. No se trata de un modelo de propósito general ni de gran escala: es una pieza especializada dentro de una colección de voces VITS empaquetadas para phoonnx, pensada para aplicaciones concretas de accesibilidad, preservación lingüística y asistentes de voz localizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | kabardiano (`kbd`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador generativo basado en redes adversarias generativas (GAN) condicionadas. VITS produce audio de forma directa a partir de texto sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia frente a pipelines TTS tradicionales de múltiples etapas.

El modelo original proviene de `anzorq/kbd-vits-tts-female` y ha sido reempaquetado por Phoonnx en formato ONNX para su librería. El front-end de texto no utiliza fonemización basada en reglas fonéticas complejas: emplea un `GraphemePhonemizer` de la librería `scriptconv`, que convierte directamente los caracteres del texto kabardiano en la entrada del modelo (enfoque grapheme-to-input). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre el uso de técnicas de ajuste como RLHF o DPO, ya que la model card no documenta estos detalles.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en kabardiano.
- Generación de voz femenina en formato de audio WAV.
- Procesamiento de entrada basado en grafemas (caracteres del texto) mediante `scriptconv`.
- Integración con la librería phoonnx en Python para síntesis directa.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, lo que permite inferencia optimizada y portabilidad entre entornos.
- No dispone de soporte documentado para tool calling, razonamiento multi-paso, visión, audio de entrada ni modos de pensamiento, al tratarse de un modelo TTS especializado.

## Casos de uso

- Asistentes de voz para kabardiano: el modelo puede integrarse en el stack OVOS mediante `ovos-tts-plugin-phoonnx` para dotar a un asistente doméstico de capacidad de respuesta hablada en kabardiano, usando la configuración `mycroft.conf` documentada en la model card.
- Preservación y revitalización lingüística: al ser una de las pocas voces TTS disponibles para kabardiano, permite generar material audioeducativo, narraciones o contenidos divulgativos en esta lengua minoritaria sin depender de grabaciones humanas.
- Accesibilidad para hablantes con discapacidad visual: lectura en voz alta de textos digitales en kabardiano, aprovechando el reducido tamaño del modelo (0,1 GB) para ejecutarse en dispositivos de bajo coste.
- Aplicaciones educativas de aprendizaje de idiomas: generación de pronunciaciones sintéticas de frases en kabardiano para herramientas de aprendizaje, con salida WAV reproducible en cualquier reproductor.
- Integración en aplicaciones de escritorio o móviles con recursos limitados: el formato ONNX y el tamaño reducido permiten desplegar el modelo en entornos sin GPU dedicada, usando la API de phoonnx para sintetizar frases bajo demanda.
- Generación de audio para pipelines de contenido localizado: producción automatizada de locuciones en kabardiano para vídeos, podcasts o señales de navegación en aplicaciones regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras oficiales; por el tamaño del repositorio (0,1 GB), la huella de memoria es muy reducida y compatible con entornos sin GPU.
- GPU recomendadas: no se especifican en la documentación; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU de gama baja.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del artefacto, aunque no hay confirmación oficial en la model card.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato ONNX permite además ejecución mediante runtimes ONNX estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-kbd-female-graphemes | VITS | kbd | no disponible | no aplica | MIT | ONNX |
| anzorq/kbd-vits-tts-female (upstream) | VITS | kbd | no disponible | no aplica | no disponible en la información | no disponible en la información |
| Otras voces de la colección VITS de Phoonnx | VITS | diversos | no disponible | no aplica | MIT (según colección) | ONNX |

La comparación directa con modelos de la misma categoría (TTS para lenguas minoritarias del Cáucaso) no está disponible en la información proporcionada. El modelo upstream comparte arquitectura e idioma, pero sus especificaciones y licencia no se detallan en la documentación consultada.

## Limitaciones y advertencias

- El modelo está limitado exclusivamente al idioma kabardiano (`kbd`); no se documenta soporte para otros idiomas.
- No hay información sobre sesgos de género, prosodia o calidad de voz más allá de la indicación de voz femenina.
- Riesgo de alucinación o artefactos de audio en textos fuera del dominio de entrenamiento, dado que no se documenta la composición del corpus.
- El front-end basado en grafemas puede producir pronunciaciones imprecisas en palabras con ortografía irregular o préstamos léxicos.
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream, cuyas condiciones no se detallan en la información disponible.
- El modelo tiene un uso muy especializado (TTS) y no debe evaluarse con los criterios de un LLM (razonamiento, contexto largo, tool calling).
- No se documentan métricas objetivas de calidad (MOS, WER) ni pruebas de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-kbd-female-graphemes
- Modelo upstream: https://huggingface.co/anzorq/kbd-vits-tts-female
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
