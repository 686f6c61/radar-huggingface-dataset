# Phoonnx/styletts2-proxectonos-gl-celtia

## Resumen

styletts2-proxectonos-gl-celtia es un checkpoint de síntesis de voz (text-to-speech) derivado del repositorio agregador Phoonnx/phoonnx-styletts2, en concreto de la carpeta `proxectonos-gl-celtia`. Lo publica el usuario Phoonnx como parte de un esfuerzo de empaquetado de voces StyleTTS2 en formato ONNX para su uso con la librería phoonnx, un runtime de TTS ligero orientado a despliegue local y en servidor.

El modelo pertenece a la familia StyleTTS2, una arquitectura de TTS neuronal basada en difusión latente con un encoder de estilo que permite controlar prosodia y timbre mediante embeddings de referencia. El identificador `gl` y la referencia a ProxectoNós apuntan a una voz en gallego, si bien la model card no documenta explícitamente el idioma ni el conjunto de datos de entrenamiento.

La relevancia del checkpoint es acotada pero práctica: se trata de un artefacto ONNX listo para inferencia con phoonnx, sin necesidad de framework de deep learning completo, con un tamaño de repositorio de 0,8 GB. No hay descargas ni interacciones registradas, y la licencia es heredada del repositorio de origen, con la particularidad de que los distintos checkpoints agregados tienen licencias distintas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con difusión latente y encoder de estilo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos distribuidos como ONNX) |
| Idiomas soportados | no disponible (el sufijo `gl` y la referencia a ProxectoNós sugieren gallego, sin confirmación en la card) |
| Licencia | other (heredada del repositorio de origen; phoonnx es Apache-2.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un encoder de texto y un decoder basado en difusión latente, junto con un encoder de estilo que extrae embeddings de prosodia y timbre a partir de audio de referencia. Esta formulación permite inferencia en modo zero-shot con control de estilo sin necesidad de fine-tuning por voz. El checkpoint aquí publicado es una exportación ONNX de la voz `proxectonos/celtia-styletts2`, pensada para ser consumida por el runtime phoonnx.

No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de alineamiento, fine-tuning o ajuste perceptual posteriores. La model card se limita a indicar la procedencia (carpeta `proxectonos-gl-celtia` del repositorio Phoonnx/phoonnx-styletts2) y a preservar las rutas de fichero originales. No se documentan innovaciones técnicas adicionales más allá de las propias de StyleTTS2 y del empaquetado ONNX.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`).
- Control de estilo y prosodia mediante embeddings de referencia, característico de StyleTTS2.
- Inferencia mediante ONNX, apta para ejecución sin framework de deep learning pesado.
- Integración nativa con el runtime phoonnx mediante el voice id `proxectonos/celtia-styletts2`.
- Presunta cobertura del gallego (no confirmada documentalmente).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo thinking; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Lector de pantalla y accesibilidad: síntesis de contenido textual en gallego para aplicaciones de lectura asistida, con prosodia controlable mediante embeddings de estilo.
- Locución de contenidos editoriales: generación de audio para artículos, boletines o notas de prensa en gallego, usando el checkpoint ONNX en un pipeline de publicación automatizado.
- Interfaces conversacionales de ámbito local: respuesta hablada en asistentes de administración pública o servicios autonómicos donde el gallego es requisito lingüístico.
- Doblaje y posproducción de bajo coste: generación de pistas de voz para vídeos divulgativos, con ajuste de estilo por referencia para mantener coherencia de timbre entre fragmentos.
- Prototipado de productos de voz: evaluación rápida de calidad TTS en entornos de desarrollo sin GPU dedicada, gracias al formato ONNX y al runtime phoonnx.
- Pruebas de regresión en pipelines de TTS: verificación automatizada de la salida acústica de la voz `celtia` frente a cambios de versión del runtime, al ser un artefacto reproducible y de tamaño contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB, lo que sugiere huella de memoria moderada, pero no se confirma.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el formato ONNX y el tamaño del repositorio apuntan a que podría ejecutarse en hardware modesto, sin confirmación documental.
- Opciones de despliegue: runtime phoonnx (librería declarada); otros backends ONNX no documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| styletts2-proxectonos-gl-celtia (este) | StyleTTS2 | ONNX | other (heredada) | Hugging Face, 0 descargas |
| Phoonnx/phoonnx-styletts2 (repo agregador) | StyleTTS2 (múltiples voces) | ONNX | other (mixta por familia) | Hugging Face |
| Checkpoint BSC catalán citado en la card | StyleTTS2 | no disponible | GPL-3.0 | referenciado en la card de origen |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- La licencia es `other` y heredada del repositorio de origen; el uso comercial requiere revisar la licencia concreta de la voz `proxectonos/celtia-styletts2`, que la card no detalla.
- La card advierte que los checkpoints agregados provienen de laboratorios distintos con licencias distintas; en particular, el checkpoint catalán del BSC está bajo GPL-3.0.
- El idioma no está confirmado documentalmente; el sufijo `gl` es una inferencia a partir del identificador, no un dato de la card.
- No hay información sobre sesgos, calidad acústica, robustez ante texto fuera de dominio ni comportamiento con números, siglas o puntuación.
- Riesgo de alucinación en el sentido de prosodia incorrecta o pronunciación errática en textos no vistos; no cuantificado.
- Ausencia total de tracción (0 descargas, 0 likes) y de validación comunitaria; tratar como artefacto experimental.
- No se documentan limitaciones de longitud de entrada, idioma o normalización textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-proxectonos-gl-celtia
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
