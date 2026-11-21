# flicker-ai/flicker-flash-gguf

## Resumen

Flicker Flash (GGUF) es una cuantización en formato GGUF del modelo Qwen3-0.6B con el LoRA Flicker Flash (flicker-ai/flicker-flash) fusionado en los pesos base. Lo publica el usuario flicker-ai en Hugging Face y su propósito es ofrecer una variante ligera y portable del modelo Qwen3 de 0.6B parámetros para inferencia en local, incluido el navegador mediante llama.cpp y wllama. El repositorio tiene un tamaño de 1.0 GB y contiene dos ficheros de pesos: una cuantización Q4_K_M (~397 MB) y una Q8_0 (~639 MB).

El modelo hereda la arquitectura y el tokenizador de Qwen3-0.6B, un transformer denso de 596.049.920 parámetros, y añade un ajuste fino vía LoRA del que no se documentan detalles de entrenamiento, dataset ni metodología en la información disponible. La licencia es Apache 2.0, lo que facilita su uso comercial y su redistribución, y la plantilla de chat es la de Qwen3 (ChatML) con el modo de razonamiento (thinking) desactivado por defecto, activable añadiendo `/think` al prompt.

Su relevancia actual reside en el nicho de modelos ultraligeros desplegables en entornos con recursos muy limitados: navegador, dispositivos de borde o prototipos sin GPU. No obstante, la ausencia de documentación sobre el LoRA, de benchmarks publicados y de especificaciones de contexto o idiomas en la model card limita seriamente la evaluación rigurosa de su calidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B); no se detalla en la model card |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión a GGUF de Qwen3-0.6B tras fusionar el LoRA Flicker Flash. La arquitectura subyacente es la de Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parámetros; la model card no aporta detalles adicionales sobre número de capas, dimensiones ocultas, mecanismo de atención ni tipo de positional encoding. La conversión se realizó con llama.cpp, lo que produce ficheros GGUF compatibles con el ecosistema llama.cpp y wllama.

No se dispone de información sobre el proceso de entrenamiento del LoRA: ni el número de tokens, ni la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas propias más allá de la fusión del adaptador y la conversión de formato. La plantilla de chat es la de Qwen3 (ChatML) y el modo de razonamiento está desactivado por defecto, activándose con la marca `/think` en el prompt.

## Capacidades

- Generación de texto conversacional en formato ChatML, con plantilla compatible con Qwen3.
- Modo de razonamiento (thinking) opcional, activable mediante la marca `/think`; desactivado por defecto.
- Inferencia en navegador mediante wllama, según los tags del repositorio y la demo publicada.
- Compatibilidad con llama.cpp, lo que habilita despliegue en CPU y en entornos de bajos recursos.
- Capacidades multilingües: no documentadas en la información disponible, aunque hereda las del modelo base Qwen3-0.6B.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Chat en navegador sin backend: el fichero Q4_K_M (~397 MB) se carga con wllama en el cliente, permitiendo una demo conversacional completamente local sin servidor ni GPU, tal como se usa en el Space flicker-ai/flicker-flash-chat.
- Prototipado rápido de aplicaciones conversacionales: al ser un GGUF de menos de 400 MB, se integra en scripts de llama.cpp para validar flujos de chat y plantillas antes de migrar a modelos mayores.
- Inferencia en dispositivos de borde con CPU: el tamaño reducido permite ejecutarlo en Raspberry Pi, mini-PC o portátiles sin GPU dedicada, con latencia aceptable para respuestas cortas.
- Clasificación y extracción de texto simple: tareas de etiquetado, resumen breve o extracción de entidades en pipelines de bajo coste donde no se requiere razonamiento profundo.
- Filtrado y preprocesado en pipelines locales: generación de reformulaciones o normalización de texto antes de pasarlo a un modelo mayor, reduciendo coste computacional.
- Educación y experimentación: sirve para estudiar el efecto de la cuantización GGUF (Q4_K_M frente a Q8_0) y de la fusión de LoRA en un modelo pequeño con licencia permisiva.
- Modo thinking para tareas de razonamiento ligero: activando `/think` se pueden obtener cadenas de razonamiento en problemas aritméticos o lógicos sencillos, siempre con las limitaciones de un modelo de 0.6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5-1 GB para Q4_K_M y 0.8-1.2 GB para Q8_0, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere GPU dedicada para funcionar.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU.
- Despliegue: llama.cpp, wllama (navegador), Ollama (mediante importación del GGUF), y servidores compatibles con llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flicker Flash GGUF (este) | 596 M | no disponible | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | LoRA fusionado, pensado para navegador |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la información | Apache 2.0 | safetensors | Modelo base sin ajuste; referencia directa |
| flicker-ai/flicker-flash | no disponible | no disponible | Apache 2.0 | safetensors (LoRA) | Adaptador LoRA original antes de la fusión |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de tamaño similar, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo de 0.6B parámetros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en preguntas factuales.
- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente al modelo base ni verificar que el LoRA aporte mejoras.
- Falta de documentación del LoRA: se desconoce el dataset, la metodología y los posibles sesgos introducidos durante el ajuste.
- Idiomas soportados no documentados: el rendimiento fuera del inglés y el chino (idiomas principales de Qwen3) es incierto.
- Longitud de contexto no especificada: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Tool calling y comportamiento agéntico no documentados: no se recomienda su uso en pipelines de agentes sin validación previa.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y del LoRA original.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación inexistente, lo que incrementa el riesgo en producción.
- El modo thinking puede degradar la latencia y la calidad en un modelo de este tamaño; conviene evaluarlo empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/flicker-ai/flicker-flash-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- LoRA original: https://huggingface.co/flicker-ai/flicker-flash
- Demo de chat en navegador: https://huggingface.co/spaces/flicker-ai/flicker-flash-chat
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama: https://github.com/ngxson/wllama
