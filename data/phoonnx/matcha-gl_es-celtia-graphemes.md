# Phoonnx/matcha-gl_es-celtia-graphemes

## Resumen

matcha-gl_es-celtia-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós bajo el identificador upstream `proxectonos/Nos_TTS-celtia-matcha-graphemes` y empaquetado por Phoonnx en formato ONNX para su biblioteca de inferencia `phoonnx`. El modelo genera audio a partir de texto en gallego (`gl-ES`) y está pensado para integrarse en asistentes de voz, sistemas de lectura y aplicaciones de accesibilidad que requieran síntesis en esta lengua.

La particularidad de esta variante es que el front-end de texto trabaja directamente sobre grafemas mediante el `GraphemePhonemizer` de la biblioteca `scriptconv`, en lugar de depender de un fonemizador basado en reglas o diccionario. Esto simplifica el pipeline de conversión texto-a-fonema y reduce la dependencia de recursos lingüísticos externos, a costa de delegar en el modelo la conversión implícita de grafemas a representaciones acústicas.

El modelo es relevante para el ecosistema de voz en lenguas minoritarias, concretamente el gallego, donde la oferta de TTS de calidad es limitada. Su empaquetado ONNX y su integración con el plugin `ovos-tts-plugin-phoonnx` lo hacen desplegable en entornos OVOS/Mycroft sin necesidad de infraestructura de GPU dedicada, aunque el repositorio es pequeño (0,1 GB) y tiene un uso muy reducido (21 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico no autorregresivo basado en flow matching, con decoder de duración) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase, no por contexto largo) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo declara formato ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

Matcha-TTS es un modelo de síntesis de voz no autorregresivo que combina un encoder de texto, un predictor de duración y un decoder generativo basado en flow matching (modelos de flujo continuo) para producir mel-espectrogramas, que posteriormente se convierten en audio mediante un vocoder. Esta variante concreta emplea un front-end de grafemas: el texto se normaliza y se convierte en una secuencia de grafemas mediante `GraphemePhonemizer` de `scriptconv`, sin pasar por un fonemizador basado en reglas fonéticas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional en la información proporcionada. El modelo upstream fue desarrollado por Proxecto Nós (proyecto de tecnologías del lenguaje para el gallego) y esta versión es un reempaquetado a ONNX realizado por Phoonnx para su librería de inferencia.

## Capacidades

- Síntesis de voz a partir de texto en gallego (`gl-ES`), con entrada por grafemas.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Normalización de texto y conversión de script mediante `scriptconv`.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de entrada (visión, audio) ni de modo de razonamiento.
- Capacidad multilingüe limitada al gallego; no se declaran otros idiomas.

## Casos de uso

- **Lectura de contenido web en gallego**: integración en navegadores o lectores de artículos para convertir texto en audio mediante `synthesize_wav`, aprovechando la entrada por grafemas para evitar dependencias de diccionarios fonéticos.
- **Asistentes de voz en OVOS/Mycroft**: configuración del plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf` para dotar de voz gallega a asistentes domésticos, sin necesidad de infraestructura GPU dedicada.
- **Accesibilidad para personas con discapacidad visual**: generación de audio a partir de documentos y pantallas en gallego, con un pipeline ONNX ligero que puede ejecutarse en CPU.
- **Sistemas de anuncios y megafonía**: síntesis de mensajes pregrabados o dinámicos en gallego para transporte público, comercios o administraciones públicas.
- **Aplicaciones educativas de aprendizaje de idiomas**: reproducción de frases en gallego para ejercicios de pronunciación y comprensión oral.
- **Integración en pipelines de subtitulado y doblaje**: generación de pistas de voz para vídeos o presentaciones en gallego dentro de flujos automatizados.
- **Prototipado de interfaces conversacionales**: uso en entornos de desarrollo para validar flujos de voz en gallego antes de invertir en modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere que la inferencia puede ejecutarse en CPU sin GPU dedicada.
- **GPU recomendadas**: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente, aunque no hay datos confirmados.
- **¿Cabe en GPU consumer?**: sí, previsiblemente, dado el tamaño reducido del repo (0,1 GB), aunque no se dispone de confirmación oficial.
- **Opciones de despliegue**: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft; formato ONNX compatible con ONNX Runtime.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| matcha-gl_es-celtia-graphemes | Matcha-TTS | gallego | Apache 2.0 | ONNX | grafemas |
| proxectonos/Nos_TTS-celtia-matcha-graphemes (upstream) | Matcha-TTS | gallego | Apache 2.0 | no disponible | no disponible |
| Otros modelos Matcha-TTS de la colección Phoonnx | Matcha-TTS | varios | Apache 2.0 | ONNX | según variante |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo soporta gallego (`gl-ES`); no es utilizable para otros idiomas sin un modelo distinto.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera de distribución, especialmente con el front-end de grafemas.
- **Sesgos**: no se documentan sesgos específicos, pero al estar entrenado con un corpus concreto (Proxecto Nós), puede reflejar las características de los hablantes y registros de dicho corpus.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y de los datos de entrenamiento originales.
- **Madurez**: repositorio con muy pocas descargas (21) y sin likes, lo que sugiere un uso limitado y poca validación comunitaria.
- **Limitaciones de contexto**: al ser un modelo TTS, procesa frases o fragmentos, no documentos largos; la segmentación del texto es responsabilidad del pipeline de integración.
- **Dependencia de `phoonnx` y `scriptconv`**: el uso requiere instalar la versión preliminar (`pip install --pre phoonnx`), lo que implica posibles cambios de API.

## Enlaces

- [Hugging Face: Phoonnx/matcha-gl_es-celtia-graphemes](https://huggingface.co/Phoonnx/matcha-gl_es-celtia-graphemes)
- [Modelo upstream: proxectonos/Nos_TTS-celtia-matcha-graphemes](https://huggingface.co/proxectonos/Nos_TTS-celtia-matcha-graphemes)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección Matcha-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad)
