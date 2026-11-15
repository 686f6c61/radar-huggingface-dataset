# Phoonnx/matcha-cat-multiaccent-wavenext

## Resumen

matcha-cat-multiaccent-wavenext es un modelo de síntesis de voz (text-to-speech) derivado del proyecto Matxa de Projecte-aina, empaquetado y redistribuido por Phoonnx para su uso con la librería phoonnx. Se trata de un modelo Matcha-TTS de la familia de modelos acústicos no autorregresivos basados en flow matching, combinado con un vocoder Wavenext "fused" (fusionado) en un único artefacto ONNX. El modelo está especializado en catalán con soporte multiacento, según se desprende de su identificador (`cat-multiaccent`) y del uso de espeak con locale `ca` para la fonemización.

El repositorio es una extracción de una carpeta concreta del repositorio agregado `Phoonnx/phoonnx-matcha`, que agrupa múltiples voces Matxa convertidas a ONNX. El tamaño del repositorio es de 0,1 GB, coherente con un modelo TTS compacto más su vocoder. La licencia heredada del repositorio fuente es GPL-3.0, lo que condiciona su uso en productos propietarios.

La relevancia de este modelo radica en su formato ONNX empaquetado y su integración con phoonnx, lo que facilita el despliegue de TTS en catalán en entornos de borde o sin GPU dedicada. No obstante, la información pública disponible es muy limitada: no se documentan parámetros, contexto, benchmarks ni composición del dataset de entrenamiento en la model card proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico no autorregresivo con flow matching) + vocoder Wavenext fusionado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por utterance; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (artefacto ONNX; se desconoce si incluye cuantización int8) |
| Idiomas soportados | catalán (multiacento), según identificador y fonemizador espeak `ca` |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acústico no autorregresivo que genera mel-espectrogramas mediante flow matching condicionado por fonemas, y que se combina con un vocoder neuronal Wavenext para producir la forma de onda final. En este repositorio ambos componentes aparecen fusionados ("fused Wavenext"), lo que sugiere un grafo ONNX único que abarca desde la entrada fonémica hasta el audio, simplificando el despliegue. La fonemización se realiza con espeak en locale `ca`, lo que explica el soporte multiacento del catalán.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino específico. El modelo procede de `projecte-aina/matxa-tts-cat-multiaccent`, cuyo detalle de entrenamiento no se incluye en la información proporcionada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán con soporte multiacento.
- Generación de audio a partir de texto con fonemización mediante espeak en locale `ca`.
- Empaquetado en ONNX con vocoder fusionado, apto para inferencia con la librería phoonnx.
- Integración con el ecosistema OpenVoiceOS (identificador de voz `OpenVoiceOS/matxa-cat-multiaccent-wavenext`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del catalán.

## Casos de uso

- Asistentes de voz en catalán para dispositivos de borde: el modelo ONNX fusionado permite ejecutar TTS local sin dependencia de servicios en la nube, adecuado para hardware con recursos limitados.
- Lectura de contenido web o documentos en catalán: integración en pipelines de accesibilidad para convertir texto a voz con cobertura de variantes acentuales.
- Sistemas de megafonía o anuncios automatizados en catalán: generación de locuciones pregrabadas o dinámicas en entornos públicos.
- Integración en OpenVoiceOS: uso como voz del asistente doméstico de código abierto, aprovechando el identificador de voz publicado.
- Prototipado de aplicaciones TTS con phoonnx: validación rápida de pipelines de síntesis en catalán sin entrenamiento propio.
- Investigación en TTS multiacento: comparación de variantes acentuales del catalán dentro de un mismo modelo empaquetado.
- Generación de audiolibros o contenido educativo en catalán: síntesis por utterance con calidad de vocoder neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) es plausible su ejecución en CPU, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y potencialmente en GPU de gama baja.
- Opciones de despliegue: librería phoonnx (integración nativa); ONNX Runtime como backend subyacente probable.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| matcha-cat-multiaccent-wavenext | Matcha-TTS + Wavenext | Catalán (multiacento) | GPL-3.0 | ONNX | Hugging Face (Phoonnx) |
| projecte-aina/matxa-tts-cat-multiaccent | Matcha-TTS (fuente) | Catalán (multiacento) | no disponible en la información | no disponible | Hugging Face (Projecte-aina) |
| Otras voces de Phoonnx/phoonnx-matcha | Matcha-TTS + vocoder | Variable | GPL-3.0 (según repositorio) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso en productos propietarios o de código cerrado requiere revisión legal; puede obligar a liberar el código que integre el modelo.
- Información pública muy escasa: no se documentan parámetros, dataset, ni evaluación, lo que dificulta estimar calidad y robustez.
- Sesgos conocidos: no documentados; los modelos TTS pueden reflejar sesgos de los hablantes del corpus de entrenamiento.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones erróneas, prosodia incorrecta o artefactos ante texto fuera de dominio (nombres propios, siglas, code-switching).
- Limitaciones de idioma: soporte centrado en catalán; el uso con otros idiomas no está garantizado.
- Caveat de producción: al ser una extracción de un repositorio agregado, la trazabilidad de versiones y la reproducibilidad del artefacto dependen del repositorio fuente.
- No se documenta el comportamiento ante textos largos ni la gestión de pausas o segmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-cat-multiaccent-wavenext
- Repositorio agregado fuente: https://huggingface.co/Phoonnx/phoonnx-matcha
- Modelo original de Projecte-aina: https://huggingface.co/projecte-aina/matxa-tts-cat-multiaccent
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
