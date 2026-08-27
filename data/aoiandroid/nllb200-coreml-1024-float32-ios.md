# aoiandroid/nllb200-coreml-1024-float32-ios

## Resumen

Este repositorio contiene una conversión compilada del modelo NLLB-200 de Meta AI, específicamente la variante destilada de 600M parámetros, empaquetada como Core ML para su uso en dispositivos iOS. El autor, aoiandroid, ha generado un bundle `.mlmodelc` a partir de un snapshot privado en float32, orientado a la aplicación TranslateBlue. El modelo original, `facebook/nllb-200-distilled-600M`, es un sistema de traducción automática neuronal que soporta 200 idiomas y fue desarrollado por Meta AI como parte del proyecto No Language Left Behind.

La relevancia de este artefacto radica en que permite ejecutar traducción neuronal de alta calidad completamente en el dispositivo, sin conexión a servidores, aprovechando el Neural Engine de Apple. La compilación a `.mlmodelc` con especialización ANE local garantiza un rendimiento optimizado en hardware Apple, aunque el peso en float32 (~5 GB) limita su uso a dispositivos con suficiente almacenamiento y memoria. Es una pieza técnica pensada para desarrolladores que integran traducción offline en aplicaciones iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia, basada en M2M100) |
| Parametros totales | 600M (modelo destilado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens (max_position_embeddings del modelo original) |
| Tipos de cuantizacion | float32 (sin cuantizacion) |
| Idiomas soportados | 200 idiomas (segun el modelo NLLB-200 original; el repo no lista idiomas especificos) |
| Licencia | MIT (para el artefacto Core ML; el modelo subyacente de Meta tiene su propia licencia CC-BY-NC 4.0) |
| Formato de pesos | Core ML `.mlmodelc` (compilado desde `.mlpackage`) |

## Arquitectura y entrenamiento

El modelo base es `facebook/nllb-200-distilled-600M`, una versión destilada del NLLB-200 completo (54B parámetros). La arquitectura es un transformer encoder-decoder estándar, similar a M2M100, con atención de múltiples cabezas y capas feed-forward. El entrenamiento original de NLLB-200 se realizó con datos de FLORES-200 y otros corpus multilingües, utilizando técnicas de minería de datos paralelos y un enfoque de aprendizaje supervisado a gran escala. No se aplicó RLHF ni DPO en el modelo original; la destilación se realizó mediante transferencia de conocimiento desde el modelo grande al pequeño.

En cuanto a este repositorio concreto, no se proporcionan detalles sobre el proceso de conversión a Core ML más allá de que se compiló a `.mlmodelc` con especialización ANE local. El autor indica que es un "private snapshot" y que el árbol de archivos incluye encoder y decoder (init/step) en float32. No hay información sobre el dataset de entrenamiento específico de esta conversión, ya que es un artefacto de inferencia, no un modelo reentrenado.

## Capacidades

- Traducción automática neuronal entre 200 idiomas, cubriendo lenguas de baja representación (por ejemplo, lenguas africanas y asiáticas minoritarias).
- Inferencia on-device en iOS, sin conexión a internet, gracias a la compilación Core ML.
- Soporte de secuencias de hasta 1024 tokens, adecuado para párrafos completos.
- Integración con la aplicación TranslateBlue, lo que sugiere un uso práctico en interfaces de traducción.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio; es un modelo puramente de traducción.

## Casos de uso

- Traducción offline en aplicaciones de viajes: un usuario puede traducir frases o menús sin conexión, usando el modelo en el dispositivo. La ventana de 1024 tokens permite procesar textos de longitud media.
- Integración en apps de mensajería para traducir conversaciones en tiempo real: el modelo puede ejecutarse localmente, preservando la privacidad de los mensajes.
- Asistente de lectura para documentos multilingües: la app puede extraer texto de imágenes o PDFs y traducirlo mediante el modelo Core ML.
- Localización de contenido generado por usuarios en plataformas sociales: los desarrolladores pueden ofrecer traducción automática de comentarios o publicaciones sin depender de APIs externas.
- Herramienta de aprendizaje de idiomas: el modelo puede proporcionar traducciones de referencia para ejercicios de vocabulario o frases.
- Traducción de subtítulos en reproductores de vídeo: al estar compilado para iOS, puede integrarse en apps de vídeo para generar subtítulos traducidos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de traducción (BLEU, chrF) ni comparativas con otros modelos. El rendimiento en términos de latencia y throughput depende del dispositivo iOS concreto y de la especialización ANE, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- VRAM estimada: no aplica directamente, pero el modelo en float32 ocupa ~5 GB en disco. En memoria, la inferencia requiere espacio suficiente para los pesos y activaciones; se recomienda un dispositivo con al menos 6 GB de RAM.
- GPU recomendadas: no aplica (es un artefacto Core ML para Apple Neural Engine, no para GPUs de escritorio).
- Compatibilidad con consumer GPU: no aplica; está diseñado exclusivamente para dispositivos Apple (iPhone, iPad) con sistema operativo iOS.
- Opciones de despliegue: el formato `.mlmodelc` se integra directamente en apps iOS mediante Core ML framework. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen del chip (A14 o superior) y de la especialización ANE local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `aoiandroid/nllb200-coreml-1024-float32-ios` (este) | 600M | 1024 | 200 | MIT (artefacto) | Core ML `.mlmodelc` |
| `facebook/nllb-200-distilled-600M` | 600M | 1024 | 200 | CC-BY-NC 4.0 | PyTorch / safetensors |
| `facebook/nllb-200-3.3B` | 3.3B | 1024 | 200 | CC-BY-NC 4.0 | PyTorch / safetensors |

La comparativa se limita a variantes del mismo modelo base. No se dispone de otros modelos de traducción comparables en formato Core ML con datos verificables. La principal diferencia entre este artefacto y el modelo original es el formato (Core ML compilado vs. pesos PyTorch) y la licencia del artefacto (MIT), aunque el modelo subyacente conserva la licencia CC-BY-NC de Meta, lo que restringe el uso comercial.

## Limitaciones y advertencias

- El modelo subyacente (NLLB-200) tiene una licencia CC-BY-NC 4.0, que prohíbe el uso comercial. Aunque el artefacto Core ML se publica bajo MIT, el usuario debe verificar que el uso previsto cumple con la licencia del modelo original.
- No se proporcionan garantías de calidad de traducción para todos los idiomas; NLLB-200 tiene un rendimiento desigual, especialmente en lenguas con pocos datos de entrenamiento.
- El tamaño en float32 (~5 GB) puede ser prohibitivo para dispositivos con almacenamiento limitado; no se ofrecen versiones cuantizadas en este repositorio.
- La ventana de contexto de 1024 tokens es fija; textos más largos requieren segmentación, lo que puede afectar la coherencia de la traducción.
- No hay información sobre sesgos específicos del modelo, pero NLLB-200, como otros modelos de traducción, puede reflejar sesgos de género o culturales presentes en los datos de entrenamiento.
- El repositorio no incluye documentación sobre el proceso de conversión ni sobre cómo se validó la paridad con el modelo original; se recomienda probar en el dispositivo objetivo antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32-ios
- Repositorio fuente (snapshot privado): https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32
- Repositorio hermano (macOS): https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32-macos
- Modelo original de Meta: https://huggingface.co/facebook/nllb-200-distilled-600M
- Blog de Meta sobre NLLB-200: https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/
- Repositorio de referencia del toolkit NLLB: https://github.com/JHmins/NLLB-200-Model
- Herramienta de traducción multi-motor (referencia de uso): https://github.com/sioaeko/NLLB_translator
