# aoiandroid/parakeet-tdt-0.6b-v3-coreml-macos

## Resumen

Parakeet-TDT-0.6B-v3 es un modelo de reconocimiento automático de voz (ASR) multilingüe desarrollado originalmente por NVIDIA y publicado en la comunidad LiteRT. Esta variante concreta, `aoiandroid/parakeet-tdt-0.6b-v3-coreml-macos`, es una conversión a Core ML (formato nativo de Apple) realizada por el usuario aoiandroid, pensada para su uso en aplicaciones macOS a través de la plataforma TranslateBlue. El modelo cuenta con aproximadamente 600 millones de parámetros y soporta 25 idiomas europeos, ofreciendo transcripción offline, privada y de baja latencia en dispositivos Apple.

La relevancia actual de este modelo radica en la creciente demanda de soluciones de ASR que funcionen sin conexión y respeten la privacidad de los datos. Al estar compilado para Core ML, puede ejecutarse de forma eficiente en el Neural Engine de Apple Silicon, lo que lo convierte en una opción atractiva para desarrolladores que buscan integrar transcripción de voz en aplicaciones de escritorio macOS sin depender de servicios en la nube. La licencia MIT facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compilado a .mlmodelc) |
| Idiomas soportados | 25 idiomas europeos |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlmodelc) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en los datos proporcionados. El modelo original Parakeet-TDT-0.6B-v3 pertenece a la familia Parakeet de NVIDIA, que se basa en arquitecturas transformer para ASR, pero no se confirma si esta versión Core ML mantiene exactamente la misma estructura. El entrenamiento se realizó sobre un conjunto de datos multilingüe que cubre 25 idiomas europeos, aunque no se especifican el número de tokens ni las técnicas de alineación o ajuste fino empleadas. La conversión a Core ML se llevó a cabo mediante la compilación de paquetes `.mlpackage` a `.mlmodelc`, con especialización para el Neural Engine (ANE) que se aplica de forma local en cada dispositivo.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, incluyendo español, inglés, francés, alemán, italiano, portugués, entre otros.
- Funcionamiento completamente offline, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Baja latencia gracias a la optimización para el Neural Engine de Apple Silicon.
- Procesamiento por lotes (batch ASR), como se menciona en la descripción del modelo original.
- Integración nativa con aplicaciones macOS mediante Core ML y el framework TranslateBlue.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede convertir en tiempo real el audio de herramientas como Zoom o Meet en texto, permitiendo generar actas automáticas sin depender de servicios cloud.
- Subtitulado automático de vídeos: los creadores de contenido pueden generar subtítulos en varios idiomas europeos directamente en su Mac, con edición posterior en herramientas como Final Cut Pro o DaVinci Resolve.
- Dictado de texto en aplicaciones de productividad: integración en editores de texto, correos electrónicos o entornos de desarrollo para escribir mediante voz, con soporte multilingüe.
- Asistentes de accesibilidad: ayuda a personas con discapacidad motriz o visual a interactuar con el ordenador mediante comandos de voz, manteniendo la privacidad al procesar todo localmente.
- Análisis de audio forense o periodístico: transcripción de entrevistas o grabaciones de campo en entornos sin conexión, garantizando la confidencialidad de las fuentes.
- Aplicaciones de aprendizaje de idiomas: ejercicios de pronunciación y comprensión oral que requieren transcripción inmediata de la voz del usuario, con soporte para 25 lenguas europeas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de WER (Word Error Rate) ni de comparativas con otros modelos ASR en esta versión Core ML.

## Requisitos de hardware

- Dispositivos macOS con Apple Silicon (M1 o superior) para aprovechar el Neural Engine.
- Tamaño del repositorio: 1.6 GB, lo que indica un modelo de aproximadamente 600M parámetros en formato compilado.
- Memoria RAM: se recomienda al menos 8 GB para un funcionamiento fluido en tareas de transcripción por lotes.
- No se especifican requisitos de VRAM, ya que Core ML gestiona la memoria unificada en Apple Silicon.
- Opciones de despliegue: integración directa en aplicaciones macOS mediante Core ML, o a través del framework TranslateBlue. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia estándar.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos ASR como Whisper, Canary-1B o los propios modelos Parakeet en otras variantes. Se sabe que el paper arXiv 2509.14128 compara Canary-1B-v2 y Parakeet-TDT-0.6B-v3, pero no se tienen los resultados concretos en la información proporcionada. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- No se especifican los idiomas exactos cubiertos por los "25 idiomas europeos", por lo que puede haber variaciones en la cobertura dialectal.
- Al ser una conversión a Core ML, es posible que algunas funcionalidades del modelo original (como beam search o parámetros de decodificación avanzados) no estén totalmente expuestas en la versión compilada.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo original (apache-2.0 según la búsqueda) para evitar conflictos legales.
- No hay información sobre sesgos o alucinaciones específicas del modelo en esta variante.
- El modelo está diseñado exclusivamente para macOS; no se menciona compatibilidad con iOS (existe una versión hermana para iOS, pero no es esta).
- La latencia puede variar según la longitud del audio y la carga del dispositivo, aunque se promete baja latencia en condiciones normales.

## Enlaces

- Repositorio HuggingFace: [aoiandroid/parakeet-tdt-0.6b-v3-coreml-macos](https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v3-coreml-macos)
- Repositorio fuente (Core ML general): [aoiandroid/parakeet-tdt-0.6b-v3-coreml](https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v3-coreml)
- Versión original LiteRT: [aoiandroid/parakeet-tdt-0.6b-v3](https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v3)
- Paper técnico (Canary-1B-v2 y Parakeet-TDT-0.6B-v3): [arXiv 2509.14128](https://arxiv.org/html/2509.14128v1)
