# Darknecrocities/Helios

## Resumen

Helios es un modelo de generación de vídeo de código abierto desarrollado por investigadores de la Universidad de Pekín (PKU-YuanGroup) en colaboración con ByteDance, Canva y Chengdu Anu Intelligence. Se trata de un modelo de difusión autorregresivo de catorce mil millones de parámetros (14B) capaz de generar vídeos de escala de minutos a velocidad en tiempo real, alcanzando 19,5 fotogramas por segundo en una única GPU H100 sin depender de técnicas de aceleración como la destilación de pasos.

El modelo se publicó en marzo de 2026 y su artículo técnico fue aceptado en TPAMI 2026. Su relevancia radica en que aborda uno de los cuellos de botella clásicos de la generación de vídeo por difusión: el coste computacional de generar secuencias largas con coherencia temporal. Helios combina un esquema autorregresivo con difusión para mantener consistencia a lo largo de vídeos de hasta un minuto, algo poco habitual en modelos de su categoría.

La ficha del repositorio de Hugging Face (`Darknecrocities/Helios`) está prácticamente vacía: solo declara licencia Apache 2.0 y región US, sin pipeline, idiomas ni descripción. La información técnica sustantiva procede de la documentación del proyecto en GitHub y de la wiki comunitaria, no de la model card oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva (autoregressive diffusion) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

Helios es un modelo de difusión autorregresivo de 14B parámetros orientado a la generación de vídeo. La combinación de generación autorregresiva (predicción secuencial de bloques o fragmentos de vídeo) con un proceso de difusión permite extender la duración de los clips manteniendo coherencia temporal, en lugar de generar un único clip corto de forma global. El resultado declarado es la capacidad de producir vídeos de escala de minutos.

El rendimiento destacado es de 19,5 FPS en una sola GPU H100, sin recurrir a destilación de pasos ni a otros trucos de aceleración según la información disponible. No se detallan en las fuentes consultadas el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (en generación de vídeo estos términos no aplican del mismo modo que en LLM). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según la descripción del proyecto.
- Generación de vídeos de escala de minutos con coherencia temporal, gracias al esquema autorregresivo.
- Inferencia en tiempo real: 19,5 FPS en una H100, lo que habilita escenarios interactivos.
- Integración con el ecosistema Diffusers, según se menciona en el repositorio de GitHub.
- Soporte de hardware Ascend-NPU de Huawei, según la documentación del proyecto.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de vídeo publicitario a escala: el modelo permite producir clips de hasta un minuto con coherencia temporal, adecuado para piezas de marketing que requieren continuidad narrativa sin cortes.
- Prototipado rápido de storyboards: con 19,5 FPS en una H100, un equipo creativo puede iterar sobre variantes de una escena en segundos, reduciendo el ciclo de revisión frente a modelos de difusión por lotes.
- Previsualización en producción audiovisual: generar previsiones animadas de escenas antes del rodaje, aprovechando la duración de minutos para evaluar ritmo y continuidad.
- Investigación en generación de vídeo: el esquema autorregresivo-difusión sirve como base reproducible (Apache 2.0) para experimentar con duraciones largas y consistencia temporal.
- Despliegue en infraestructura Ascend: organizaciones con hardware Huawei Ascend-NPU pueden ejecutar el modelo sin depender de GPUs NVIDIA, según el soporte documentado.
- Integración en pipelines con Diffusers: equipos que ya trabajan con la librería Diffusers pueden incorporar Helios en flujos existentes de generación y postprocesado.
- Demostraciones interactivas en tiempo real: la velocidad de 19,5 FPS permite aplicaciones donde el usuario ve el vídeo generarse casi al instante, como herramientas de creación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento concreto es la velocidad de inferencia: 19,5 FPS en una única GPU H100 para generación de vídeo de escala de minutos, sin destilación de pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de difusión de 14B parámetros requiere típicamente varias decenas de GB en precisión completa, pero no se confirma en las fuentes.
- GPU recomendadas: NVIDIA H100 (dato confirmado para los 19,5 FPS). Otras GPU no se detallan.
- ¿Cabe en GPU de consumo? No disponible en la información consultada.
- Opciones de despliegue: Diffusers (confirmado); vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de vídeo y no se mencionan.
- Hardware alternativo: Ascend-NPU de Huawei, con soporte desarrollado por Huawei según el repositorio.
- Latencia y throughput: 19,5 FPS en H100; no se aportan más métricas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación de vídeo autorregresiva de 14B) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card del repositorio de Hugging Face está vacía: no documenta pipeline, idiomas, formato de pesos ni instrucciones de uso, lo que dificulta la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria aparente.
- No se especifican sesgos conocidos ni evaluación de sesgos en las fuentes consultadas.
- Riesgo de alucinación visual (artefactos, incoherencias físicas) inherente a los modelos de difusión; no cuantificado en la información disponible.
- No se detallan limitaciones de contexto ni de idioma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los pesos y de los datasets de entrenamiento, no detalladas.
- El rendimiento de 19,5 FPS está medido en H100; el comportamiento en hardware inferior es desconocido.
- Existe ambigüedad entre el repositorio de Hugging Face (`Darknecrocities/Helios`) y el proyecto oficial (PKU-YuanGroup/Helios); conviene confirmar que los pesos publicados corresponden al modelo descrito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Darknecrocities/Helios
- Repositorio oficial en GitHub: https://github.com/PKU-YuanGroup/Helios
- Wiki comunitaria: https://ai.miraheze.org/wiki/Helios
