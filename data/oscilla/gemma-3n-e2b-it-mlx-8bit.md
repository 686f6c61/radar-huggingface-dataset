# Oscilla/gemma-3n-E2B-it-mlx-8Bit

## Resumen

El modelo Oscilla/gemma-3n-E2B-it-mlx-8Bit es una conversión al formato MLX (Machine Learning eXchange) del modelo multimodal Gemma 3n E2B de Google, cuantizado a 8 bits. Gemma 3n es una familia de modelos generativos optimizada para ejecutarse en dispositivos cotidianos como teléfonos, portátiles y tabletas, con un diseño centrado en la eficiencia de parámetros y memoria. Este modelo concreto, con aproximadamente 1,25 mil millones de parámetros totales, está pensado para tareas de procesamiento de imagen, texto, audio y vídeo, incluyendo reconocimiento y traducción de voz.

La conversión fue realizada por el usuario Oscilla utilizando la librería mlx-lm versión 0.31.2, lo que permite ejecutar el modelo en hardware Apple Silicon con el ecosistema MLX. El repositorio tiene un tamaño de 4,8 GB y se distribuye bajo la licencia Gemma de Google, que requiere aceptación de términos de uso. La relevancia de este modelo radica en su capacidad multimodal en un formato ligero, ideal para despliegues en dispositivos con recursos limitados, y su compatibilidad con el framework MLX, muy utilizado en la comunidad de desarrollo para macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer con Per-Layer Embedding (PLE) parameter caching (familia Gemma 3n) |
| Parametros totales | 1.253.661.792 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia propietaria de Google con términos de uso) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, google/gemma-3n-E2B-it, utiliza la arquitectura MatFormer, una innovación de Google que permite reducir el coste computacional y de memoria mediante el uso de Per-Layer Embedding (PLE) parameter caching. Esta técnica cachea las incrustaciones de cada capa para evitar recalcularlas durante la inferencia, lo que resulta especialmente eficiente en dispositivos con poca memoria. El modelo es multimodal, aceptando entradas de imagen, texto, audio y vídeo, y está diseñado para tareas como reconocimiento de voz, traducción automática de voz y diálogo multimodal.

Los datos de entrenamiento del modelo original no se han publicado en la información disponible. Tampoco se especifican detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La conversión a MLX realizada por Oscilla no modifica los pesos del modelo, solo su formato, por lo que las capacidades del modelo original se mantienen intactas.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen, texto, audio y vídeo, y genera texto.
- Reconocimiento automático de voz (ASR) y traducción automática de voz (AST).
- Conversación multimodal: puede mantener diálogos basados en entradas visuales y auditivas.
- Generación de texto y razonamiento básico, heredados de la familia Gemma.
- Compatible con el ecosistema MLX, lo que permite integración con herramientas como mlx-lm.
- No se ha confirmado soporte para tool calling o function calling en la información disponible.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede procesar audio en tiempo real y responder mediante texto, gracias a sus capacidades de ASR y generación de lenguaje, todo ello en un formato ligero que cabe en la memoria de un teléfono.
- Transcripción y subtitulado automático: su capacidad de reconocimiento de voz permite transcribir reuniones, podcasts o vídeos, y generar subtítulos en varios idiomas (aunque los idiomas soportados no están especificados).
- Análisis de imágenes con descripción en lenguaje natural: puede recibir una imagen y generar una descripción textual, útil para aplicaciones de accesibilidad o catalogación de contenido.
- Traducción de voz a texto en tiempo real: combinando ASR y traducción, puede servir como intérprete automático en conversaciones bilingües.
- Asistentes de productividad en portátiles: al ejecutarse con MLX en Apple Silicon, puede integrarse en aplicaciones de notas o correo para resumir contenido audiovisual sin conexión a la nube.
- Prototipado de aplicaciones multimodales en macOS: los desarrolladores pueden usar mlx-lm para crear demos rápidas de interacción con voz e imagen sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversión de formato, por lo que su rendimiento debería ser equivalente al del modelo original google/gemma-3n-E2B-it, pero no se dispone de datos numéricos de MMLU, HumanEval u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6,6 GB según datos de LLM Explorer para la versión 8-bit de mlx-community. El tamaño del repositorio es de 4,8 GB, por lo que se recomienda al menos 6-8 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3 o superiores). También podría ejecutarse en GPUs NVIDIA con suficiente VRAM mediante adaptadores, pero MLX está optimizado para Apple.
- ¿Cabe en consumer GPU? Sí, en GPUs con 8 GB o más de VRAM, aunque el ecosistema MLX no es nativo para NVIDIA.
- Opciones de despliegue: mlx-lm (Python), integración con el framework MLX. No se menciona soporte para vLLM, llama.cpp o Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/gemma-3n-E2B-it-mlx-8Bit | 1,25B | no disponible | imagen, texto, audio, vídeo | Gemma | MLX 8-bit |
| mlx-community/gemma-3n-E2B-it-8bit | 1,25B | no disponible | imagen, texto, audio, vídeo | Gemma | MLX 8-bit |
| google/gemma-3n-E2B-it (original) | 1,25B | no disponible | imagen, texto, audio, vídeo | Gemma | safetensors (transformers) |

No se dispone de comparación con modelos de otras familias (como Phi-3.5-vision o LLaVA) por falta de datos de benchmarks y especificaciones detalladas.

## Limitaciones y advertencias

- La licencia Gemma de Google impone restricciones de uso comercial; es necesario revisar los términos completos antes de utilizarlo en producción.
- Al ser una conversión MLX, está orientado principalmente a hardware Apple Silicon; su uso en otras plataformas requiere adaptaciones adicionales.
- La longitud de contexto no está documentada, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Los idiomas soportados no se especifican, aunque la familia Gemma suele cubrir múltiples idiomas; se recomienda verificar el modelo original.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas específicas es incierto.
- El modelo puede sufrir alucinaciones o sesgos, como cualquier modelo generativo, especialmente en tareas multimodales donde la interpretación de imágenes o audio puede ser errónea.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/gemma-3n-E2B-it-mlx-8Bit
- Documentación oficial de Gemma 3n: https://ai.google.dev/gemma/docs/gemma-3n
- Página del modelo original en LM Studio: https://lmstudio.ai/models/google/gemma-3n-e2b
- Conversión similar de mlx-community: https://huggingface.co/mlx-community/gemma-3n-E2B-it-8bit
- Información de VRAM en LLM Explorer: https://llm-explorer.com/model/mlx-community%2Fgemma-3n-E2B-8bit,6lUIcPFlXI6GCvUhBn2X7F
