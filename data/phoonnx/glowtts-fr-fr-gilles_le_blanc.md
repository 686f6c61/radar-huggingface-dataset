# Phoonnx/glowtts-fr-fr-gilles_le_blanc

## Resumen

glowtts-fr-fr-gilles_le_blanc es un modelo de síntesis de voz (text-to-speech) en francés, empaquetado en formato ONNX y distribuido por el usuario Phoonnx como una carpeta individual extraída del repositorio agregado Phoonnx/phoonnx-glowtts. El modelo emplea la arquitectura GlowTTS, un sistema de TTS no autorregresivo basado en flujos normalizadores que genera mel-espectrogramas a partir de texto y que posteriormente requiere un vocoder para producir audio. La voz concreta corresponde al identificador `fr-fr-gilles_le_blanc`, es decir, una voz masculina francesa de la variante metropolitana.

El modelo está pensado para su uso con la librería phoonnx, una implementación de inferencia centrada en modelos ONNX, y se publica bajo una licencia genérica `other` sin que la model card especifique los términos exactos de uso. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para despliegue en CPU y entornos con recursos limitados.

Su relevancia es acotada pero práctica: ofrece una voz francesa concreta dentro de un ecosistema de TTS ligero y portable, útil para aplicaciones de lectura de texto, asistentes de voz o doblaje automatizado en francés donde se prioriza la eficiencia y la portabilidad del formato ONNX frente a la calidad máxima de modelos neuronales más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en flujos normalizadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto, no modelado de contexto conversacional) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés (variante `fr-fr`, voz `gilles_le_blanc`) |
| Licencia | other (sin términos especificados en la model card) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-11-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz no autorregresiva que combina un codificador de texto con un decoder basado en flujos normalizadores invertibles (Glow). El codificador transforma la secuencia de fonemas o caracteres en una representación latente, y el decoder genera el mel-espectrograma mediante transformaciones invertibles, lo que permite un entrenamiento con verosimilitud exacta y una inferencia paralela y rápida. El modelo no incluye vocoder en esta carpeta: para obtener la forma de onda final se necesita un vocoder compatible (habitualmente HiFi-GAN u otro vocoder del ecosistema phoonnx).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de voz utilizado ni si se aplicaron técnicas de alineamiento o regularización específicas. La model card únicamente indica que el modelo es una carpeta extraída del repositorio agregado `Phoonnx/phoonnx-glowtts` y que conserva las rutas de ficheros originales. No se documentan innovaciones técnicas adicionales ni procesos de RLHF o DPO, que no son habituales en modelos de TTS de este tipo.

## Capacidades

- Síntesis de voz a partir de texto en francés (variante `fr-fr`) con la voz `gilles_le_blanc`.
- Generación de mel-espectrogramas mediante GlowTTS; requiere un vocoder externo para producir audio.
- Inferencia no autorregresiva, lo que permite generar la salida en paralelo y con baja latencia.
- Ejecución sobre ONNX Runtime, lo que facilita el despliegue en CPU y en entornos sin GPU.
- Integración con la librería phoonnx mediante el identificador de voz `larynx/fr-fr-gilles_le_blanc-glow_tts`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del francés.

## Casos de uso

- Lectura de textos en francés: el modelo convierte artículos, noticias o documentación a voz con la voz `gilles_le_blanc`, adecuado para aplicaciones de accesibilidad y lectura automatizada en francés.
- Asistentes de voz locales: al ejecutarse en ONNX Runtime sobre CPU, puede integrarse en asistentes embebidos o de escritorio que necesiten síntesis en francés sin depender de servicios en la nube.
- Doblaje y locución automatizada: útil para generar pistas de voz provisionales en francés en flujos de producción de vídeo o pódcast, con la ventaja de su reducido tamaño (0,1 GB).
- Sistemas de anuncios y avisos: integración en aplicaciones de transporte, comercio o telefonía que requieran mensajes hablados en francés con baja latencia y sin GPU.
- Prototipado de pipelines TTS: al ser un modelo ligero en ONNX, sirve como base para experimentar con vocoders y cadenas de post-procesado en el ecosistema phoonnx.
- Pruebas de integración de phoonnx: permite validar el identificador de voz `larynx/fr-fr-gilles_le_blanc-glow_tts` y el flujo de carga de modelos ONNX en dicha librería.
- Aplicaciones offline en dispositivos: su tamaño reducido permite empaquetarlo en aplicaciones de escritorio o móviles que necesiten TTS en francés sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) es plausible su ejecución en CPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y potencialmente en GPU mediante ONNX Runtime, pero no se documenta.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| glowtts-fr-fr-gilles_le_blanc | GlowTTS | Francés | ONNX | other | Voz única `gilles_le_blanc`; 0,1 GB |
| Otras voces de Phoonnx/phoonnx-glowtts | GlowTTS | Varios | ONNX | other | Mismo repositorio agregado; mismas características técnicas |
| Modelos TTS neuronales de mayor tamaño (p. ej. VITS, FastSpeech2) | VITS / FastSpeech2 | Multilingüe según modelo | PyTorch / ONNX | Variable | No disponible comparación directa de rendimiento |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es `other` y la model card no especifica los términos exactos; es necesario contactar con el autor o consultar el repositorio original antes de un uso comercial.
- El modelo solo cubre la voz `gilles_le_blanc` en francés metropolitano; no hay soporte documentado de otros idiomas ni de control de estilo o emoción.
- Requiere un vocoder externo para generar audio final; la carpeta no incluye la cadena completa de síntesis.
- No se documentan sesgos específicos, pero al ser una voz única y un corpus no descrito, pueden existir sesgos de prosodia o pronunciación no caracterizados.
- Riesgo de errores de pronunciación en nombres propios, siglas, números o texto no francés, habitual en modelos TTS de este tipo.
- No se documentan límites de longitud de texto de entrada; en la práctica, los modelos GlowTTS suelen requerir segmentación de textos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se dispone de información sobre el corpus de entrenamiento, lo que dificulta evaluar su cobertura y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr-fr-gilles_le_blanc
- Repositorio agregado de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
