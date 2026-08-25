# onnx-community/dataocean-dolphin-asr

## Resumen

Dolphin es un modelo de reconocimiento automático del habla (ASR) multilingüe y multitarea desarrollado por Dataocean AI en colaboración con la Universidad de Tsinghua. Está diseñado para cubrir un espectro lingüístico muy amplio: 40 lenguas orientales (Asia Oriental, Asia Meridional, Sudeste Asiático y Oriente Medio) y 22 dialectos del chino. El repositorio `onnx-community/dataocean-dolphin-asr` contiene las variantes exportadas a formato ONNX y ORT del modelo original, optimizadas para distintas arquitecturas de hardware y niveles de precisión.

El modelo se entrenó con más de 210 000 horas de datos propietarios y de código abierto, lo que le permite abordar tareas de transcripción multilingüe con una sola arquitectura. La relevancia actual de este modelo radica en su cobertura de lenguas orientales y dialectos chinos, un área tradicionalmente mal atendida por los ASR comerciales, y en su disponibilidad en formatos optimizados para inferencia en entornos con recursos limitados. Se ofrecen dos tamaños (`dolphin-base` y `dolphin-small`) y tres niveles de cuantización (precisión completa, FP16 e INT8), con pesos en formato `.onnx` y `.ort`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR multilingüe, no se especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión completa (FP32), FP16, INT8 |
| Idiomas soportados | 40 lenguas orientales (Asia Oriental, Asia Meridional, Sudeste Asiático, Oriente Medio) y 22 dialectos chinos |
| Licencia | apache-2.0 (según Hugging Face; la model card remite al repositorio original para confirmación) |
| Formato de pesos | ONNX (`.onnx`) y ORT (`.ort`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (no se indica si es transformer, conformer, etc.). Sí se especifica que se trata de un modelo ASR multilingüe y multitarea, y que todos los modelos comparten el mismo tokenizador, definido en el archivo `tokens.txt`. El entrenamiento del modelo base se realizó con más de 210 000 horas de datos, combinando conjuntos propietarios y de código abierto, aunque no se detalla la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

Para la exportación a ONNX se utilizó búsqueda codiciosa (greedy search) en lugar de búsqueda de haz (beam search), lo que reduce la latencia de inferencia a costa de una posible pérdida mínima de precisión. Los scripts de conversión están disponibles en el repositorio de DakeQQ y permiten reproducir las variantes optimizadas para distintos hardware.

## Capacidades

- Transcripción de voz a texto en 40 lenguas orientales, cubriendo áreas geográficas de Asia Oriental, Asia Sur, Sudeste Asiático y Oriente Medio.
- Reconocimiento de 22 dialectos del chino, incluyendo variantes regionales no contempladas por ASR estándar.
- Procesamiento multitarea: el modelo está diseñado para ejecutar tareas ASR en un único marco, sin necesidad de modelos separados por idioma.
- Disponible en dos tamaños (base y small) para equilibrar precisión y velocidad según el entorno de despliegue.
- Soporte de cuantización INT8 para inferencia rápida en entornos con recursos limitados.
- Compatibilidad con ONNX Runtime en arquitecturas AMD64 y ARM, lo que facilita su integración en aplicaciones de escritorio y dispositivos periféricos.
- Formato ORT para optimizaciones adicionales de ONNX Runtime.

## Casos de uso

- Transcripción multilingüe de reuniones y conferencias: con soporte de 40 lenguas orientales, el modelo puede transcribir conversaciones en entornos empresariales y académicos donde se mezclan idiomas como hindi, árabe, indonesio o tailandés, sin necesidad de configurar un modelo por lengua.
- Subtitulado automático de vídeo para plataformas regionales: la cobertura de 22 dialectos chinos permite generar subtítulos en cantonés, shanghainés u otras variantes, un nicho que los ASR generales no cubren.
- Asistentes de voz para dispositivos de bajo consumo: la variante `dolphin-small` en INT8 está pensada para ejecutarse en CPUs ARM o sistemas embebidos, permitiendo comandos de voz y dictado en aplicaciones móviles o IoT.
- Análisis de llamadas en centros de contacto: la versión base en FP16 o precisión completa puede transcribir conversaciones de atención al cliente en lenguas orientales, facilitando análisis de sentimiento y búsqueda de información en los registros.
- Subtitulación en directo para eventos y streaming: la inferencia en ONNX Runtime con búsqueda codiciosa reduce la latencia, adecuada para generar subtítulos casi en tiempo real en conferencias o retransmisiones.
- Investigación lingüística y documentación de dialectos: los investigadores pueden emplear el modelo para transcribir corpus orales de dialectos chinos y lenguas minoritarias, contribuyendo a su preservación y estudio.
- Integración con el paquete `ppu-voiceland`: el repositorio está diseñado como componente base de esta herramienta, que añadirá funciones de voz en entornos de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (WER, CER, etc.) ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- El tamaño del repositorio es de 4.5 GB, lo que sugiere que el conjunto de modelos en todas las variantes ocupa varios gigabytes en disco.
- La variante `dolphin-small` en INT8 está diseñada para entornos con recursos limitados, incluyendo procesadores ARM y equipos de escritorio AMD64 sin GPU dedicada.
- La variante `dolphin-base` en precisión completa requerirá más memoria y cómputo; no se especifican requisitos de VRAM concretos.
- No se proporcionan datos de latencia ni throughput en la documentación.
- El despliegue se realiza mediante ONNX Runtime, que soporta CPU, GPU y aceleradores dedicados; las extensiones `.ort` ofrecen optimizaciones adicionales de ONNX Runtime.
- No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo ASR y no de generación de texto.

## Comparativa con modelos similares

No se dispone de información comparativa en las fuentes proporcionadas. No se mencionan resultados de benchmarks ni comparaciones con otros modelos ASR multilingües como Whisper, SeamlessM4T o Parakeet. La cobertura de 40 lenguas orientales y 22 dialectos chinos es un diferenciador, pero no se pueden aportar datos cuantitativos de comparación.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones del modelo. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- No se han publicado resultados de evaluación (WER, CER) sobre conjuntos de test estándar, por lo que la precisión en cada lengua o dialecto es desconocida.
- La exportación ONNX se realizó con búsqueda codiciosa, lo que puede degradar ligeramente la calidad de la transcripción frente a la búsqueda de haz.
- La licencia en Hugging Face figura como apache-2.0, pero la model card indica que se debe consultar el repositorio original de Dolphin para confirmar los términos de uso comercial.
- No se especifican los idiomas concretos dentro de las 40 lenguas orientales ni los 22 dialectos chinos, lo que obliga a probar el modelo con el idioma objetivo.
- El repositorio está orientado a ONNX Runtime; no se ofrecen pesos en otros formatos (PyTorch, TensorFlow, etc.).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/onnx-community/dataocean-dolphin-asr
- Repositorio original de Dolphin (GitHub): https://github.com/DataoceanAI/Dolphin
- Paper (arXiv): https://arxiv.org/abs/2503.20212
- Scripts de conversión ONNX: https://github.com/DakeQQ/Automatic-Speech-Recognition-ASR-ONNX
- Demo en Google Colab: https://colab.research.google.com/drive/1DhM89hGVvA9u4aYEChUzwxLvVtJV8jGW?usp=sharing
- Repositorio de conversión de PT Perkasa: https://github.com/PT-Perkasa-Pilar-Utama/ppu-dolphin-asr-onnx
- Documentación de integración en sherpa: https://k2-fsa.github.io/sherpa/onnx/Dolphin/index.html
