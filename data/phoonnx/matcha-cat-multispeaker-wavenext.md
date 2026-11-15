# Phoonnx/matcha-cat-multispeaker-wavenext

## Resumen

matcha-cat-multispeaker-wavenext es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx en formato ONNX, extraído del repositorio agregador Phoonnx/phoonnx-matcha. Se trata de una conversión del modelo catalán projecte-aina/matxa-tts-cat-multispeaker, un sistema Matcha-TTS multi-hablante para catalán, al que se le ha fusionado (fused) un vocoder WaveNeXt para producir audio de forma directa. El paquete está pensado para su uso con la librería phoonnx, un motor de inferencia TTS basado en ONNX.

El modelo resuelve la necesidad de disponer de una voz catalana multi-hablante ejecutable en entornos ONNX Runtime, sin depender de PyTorch en producción. Su relevancia es acotada: se trata de una conversión de un modelo existente, orientada a despliegues ligeros y a integración con asistentes de voz de código abierto (el ID de voz `OpenVoiceOS/matxa-cat-multispeaker-wavenext` sugiere integración con el ecosistema OpenVoiceOS).

La información publicada es muy escasa: la model card no detalla arquitectura interna, número de parámetros, contexto ni composición del dataset. El tamaño del repositorio es de 0,1 GB, lo que es coherente con un modelo TTS compacto en formato ONNX. La licencia es GPL-3.0, heredada del repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico) con vocoder WaveNeXt fusionado; exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (el repo se distribuye en ONNX; no se documentan variantes) |
| Idiomas soportados | catalán (indicado como "espeak ca" en la tabla de origen) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acústico de difusión condicionada por texto (flow matching) que genera mel-espectrogramas a partir de fonemas, combinado con un vocoder neuronal WaveNeXt que convierte los mel-espectrogramas en forma de onda. En esta distribución ambos componentes aparecen fusionados en un único grafo ONNX, de modo que la inferencia produce audio directamente a partir de la entrada de texto/fonemas.

La model card no proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habitual en TTS). El modelo original procede del proyecto projecte-aina/matxa-tts-cat-multispeaker, del ecosistema AINA (Projecte AINA, Generalitat de Catalunya), pero los detalles de entrenamiento de ese modelo no se reproducen en esta ficha. La tokenización fonética se realiza mediante espeak en su variante catalana ("espeak ca").

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto de entrada.
- Soporte multi-hablante: el nombre "multispeaker" indica que el modelo permite seleccionar entre varias voces, aunque la model card no enumera cuántas ni sus identificadores.
- Generación de audio directa mediante vocoder WaveNeXt fusionado, sin etapa separada de vocoder.
- Ejecución sobre ONNX Runtime a través de la librería phoonnx.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling, agentes ni procesamiento multimodal más allá del TTS.

## Casos de uso

- Asistentes de voz en catalán: integración en el ecosistema OpenVoiceOS (el ID de voz publicado lo sugiere) para respuestas habladas en catalán con selección de hablante.
- Lectura de contenido en catalán: conversión de artículos, noticias o documentación a audio para accesibilidad o consumo pasivo.
- Sistemas de anuncios y avisos automatizados: generación de mensajes hablados en catalán en aplicaciones de transporte, comercio o administración pública.
- Despliegue en dispositivos con recursos limitados: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en entornos sin GPU dedicada mediante ONNX Runtime.
- Integración en pipelines de código abierto: al estar bajo GPL-3.0 y en formato ONNX, encaja en proyectos de software libre que requieran TTS catalán sin dependencias de PyTorch.
- Pruebas de concepto y prototipado de interfaces conversacionales: permite validar flujos de voz multi-hablante en catalán antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,1 GB, la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no disponible; por el tamaño del paquete, cualquier GPU con soporte ONNX Runtime (incluidas RTX 3060 o superiores) sería suficiente, aunque no hay datos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime mediante la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto/parámetros |
|---|---|---|---|---|---|
| Phoonnx/matcha-cat-multispeaker-wavenext | Catalán | Matcha-TTS + WaveNeXt (ONNX) | ONNX | GPL-3.0 | no disponible |
| projecte-aina/matxa-tts-cat-multispeaker | Catalán | Matcha-TTS multi-hablante | PyTorch (presumible) | no disponible en esta ficha | no disponible |
| Otros TTS catalanes de código abierto | Catalán | variable | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta parámetros, dataset, número de hablantes ni métricas de calidad; evaluar el modelo requiere probarlo directamente.
- Licencia GPL-3.0: es una licencia copyleft fuerte; su integración en productos propietarios puede obligar a liberar el código que lo enlaza. Revisar compatibilidad antes de uso comercial.
- Idioma limitado al catalán: no se documenta soporte multilingüe.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS, puede producir pronunciaciones incorrectas, especialmente en nombres propios, neologismos y palabras fuera del dominio de entrenamiento.
- Sesgos de voz: al ser multi-hablante, las características de las voces (género, acento, edad) dependen del dataset original, no documentado aquí.
- Modelo derivado: es una conversión de un modelo de terceros; los problemas del modelo original se heredan y no se corrigen en esta distribución.
- Sin mantenimiento aparente: cero descargas y cero likes en el momento de la consulta; sin garantías de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-cat-multispeaker-wavenext
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-matcha
- Modelo original: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
