# Phoonnx/vits-hf_community_jstlntch_Scaramouche_or_Wanderer_voice_model_for_piper

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, empaquetado para su uso con la librería phoonnx y compatible con el ecosistema Piper. El autor, Phoonnx, lo publica como una extracción de un modelo mayor (Phoonnx/phoonnx-vits), conservando la estructura de rutas original del repositorio fuente. Se trata de un modelo de voz concreto, identificado en el nombre como "Scaramouche or Wanderer voice model", procedente de la carpeta de comunidad `jstlntch`.

El modelo resuelve la conversión de texto a audio hablado con una voz determinada, orientado a despliegues ligeros y locales mediante ONNX Runtime. Su relevancia es limitada y muy específica: no es un modelo de propósito general, sino un artefacto de inferencia para una voz concreta dentro de un catálogo de voces Piper. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con modelos VITS de tamaño reducido.

La información disponible es escasa: no se detallan parámetros, contexto, idiomas ni datos de entrenamiento en la model card, que se limita a indicar la procedencia, la licencia y la ausencia de identificadores de voz propios en phoonnx.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo, generativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial en un único modelo entrenado de extremo a extremo, con alineamiento monotónico aprendido. Produce audio de forma directa a partir de fonemas o texto, sin pipeline separado de duración y acústica.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el idioma, el front-end fonético empleado ni si hubo ajuste fino adicional. La model card solo indica que el modelo proviene de la carpeta `hf_community__jstlntch__Scaramouche_or_Wanderer_voice_model_for_piper` del repositorio Phoonnx/phoonnx-vits y que los ficheros conservan las rutas originales.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con una voz concreta identificada como "Scaramouche or Wanderer".
- Inferencia mediante ONNX Runtime, lo que permite despliegue multiplataforma (CPU y GPU) sin dependencia de frameworks de deep learning completos.
- Integración con phoonnx y con el ecosistema Piper, lo que facilita su uso en asistentes de voz locales.
- No se documentan capacidades de clonación de voz, control de emoción, multilingüismo, tool calling ni agentes.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura por voz de textos en aplicaciones de escritorio: el modelo puede sintetizar texto a audio en local mediante ONNX Runtime, sin enviar datos a servicios externos, adecuado para lectores de pantalla o narración de documentos.
- Integración en asistentes de voz domésticos: al ser compatible con Piper y phoonnx, puede incorporarse en pipelines de wake-word más ASR más TTS para respuestas habladas con una voz concreta.
- Doblaje o narración de contenido de fans: la voz está asociada a un personaje (Scaramouche/Wanderer), por lo que encaja en proyectos creativos y de contenido derivado, siempre respetando la licencia y los derechos sobre la voz.
- Pruebas de concepto de TTS en dispositivos de bajos recursos: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten ejecución en CPU y en hardware embebido.
- Generación de audio para prototipos de videojuegos o mods: útil para dar voz a un personaje en una demo sin depender de APIs en la nube.
- Evaluación comparativa de voces Piper: sirve como artefacto de prueba dentro de un catálogo de voces para medir latencia y calidad subjetiva en un pipeline phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, la inferencia cabe holgadamente en menos de 1 GB de memoria, incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superiores) es más que suficiente. También es viable en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en iGPU, dado el reducido tamaño.
- Opciones de despliegue: ONNX Runtime, phoonnx, y potencialmente Piper si el formato es compatible; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Phoonnx VITS Scaramouche) | VITS | ONNX | MIT | Hugging Face, repo de 0,1 GB |
| Piper (voces oficiales) | VITS | ONNX | Varía por voz (MIT u otras) | Repositorio Piper y Hugging Face |
| Coqui TTS (modelos VITS) | VITS | PyTorch/ONNX | Varía (MPL-2.0 en el framework) | Coqui TTS / Hugging Face |
| phoonnx-vits (repo fuente) | VITS | ONNX | Según subcarpeta | Hugging Face |

No se dispone de datos de rendimiento comparativos (MOS, latencia) para este modelo concreto.

## Limitaciones y advertencias

- La licencia declarada es MIT, pero la model card advierte que la licencia del repositorio fuente sigue la de cada subcarpeta y que algunas voces del repositorio original no tienen licencia declarada. Conviene verificar la procedencia de esta voz concreta antes de un uso comercial.
- La voz está inspirada en un personaje de ficción; el uso comercial o la suplantación pueden vulnerar derechos de imagen o de propiedad intelectual, independientemente de la licencia del software.
- No se documentan idiomas soportados; es probable que la voz esté entrenada para un idioma concreto, pero no se puede confirmar.
- Riesgo de artefactos y alucinaciones acústicas (pronunciación incorrecta, ruidos) inherente a los modelos VITS pequeños.
- No hay información sobre sesgos de género, acento o etnia en el dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de validación por la comunidad.
- No se documentan parámetros, contexto ni métricas, lo que dificulta evaluar su calidad frente a otras voces.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_jstlntch_Scaramouche_or_Wanderer_voice_model_for_piper
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-vits
- Proyecto phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la licencia del repo fuente): https://github.com/michsethowusu/kasanoma
