# hb-dev/Qwen3-1.7B-ONNX

## Resumen

Qwen3-1.7B-ONNX es una conversión a formato ONNX del modelo Qwen3-1.7B, publicada por el usuario hb-dev. El modelo original lo desarrolla el equipo Qwen de Alibaba, y esta versión tiene como único objetivo hacerlo ejecutable en el navegador y en entornos JavaScript/Node.js mediante Transformers.js. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los de Qwen3-1.7B, únicamente reempaquetados en ONNX.

La relevancia de esta ficha radica en que permite desplegar un LLM de 1.700 millones de parámetros con capacidades de razonamiento, generación de código y conversación directamente en el cliente, sin backend. El repositorio ocupa 3,2 GB e incluye los pesos ONNX en la subcarpeta `onnx`, siguiendo la estructura recomendada por Hugging Face para modelos web-ready.

La información publicada por el autor es mínima: la model card se limita a indicar el modelo base y el propósito de la conversión. Los datos de arquitectura, entrenamiento y benchmarks deben atribuirse al modelo original Qwen3-1.7B, no a esta conversión, y en esta ficha se indican como no disponibles cuando no constan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B; no detallada en la model card de esta conversión) |
| Parámetros totales | 1.700 millones (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

Esta publicación no documenta arquitectura ni proceso de entrenamiento propios: es una conversión de pesos del modelo Qwen/Qwen3-1.7B a ONNX mediante herramientas del ecosistema Hugging Face (el autor recomienda Optimum para conversiones equivalentes). Por tanto, la arquitectura subyacente es la del transformer decoder-only de Qwen3-1.7B, pero la model card de esta conversión no aporta detalles sobre número de capas, dimensiones ocultas, mecanismo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovación técnica de este repositorio es exclusivamente de despliegue: empaquetar los pesos en ONNX con la estructura de carpetas esperada por Transformers.js (subcarpeta `onnx`), lo que habilita inferencia en WebGPU/WASM dentro del navegador. El autor indica explícitamente que mantener repos separados para pesos ONNX es una solución temporal hasta que WebML gane adopción.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation` con tag `conversational`).
- Ejecución en navegador y en Node.js mediante Transformers.js, sin servidor de inferencia dedicado.
- Razonamiento y generación de código: capacidades heredadas de Qwen3-1.7B, no verificadas en esta conversión por falta de benchmarks publicados.
- Tool calling y function calling: no documentado en esta model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta model card.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en esta conversión.

## Casos de uso

- Asistentes conversacionales en el navegador: el modelo se carga con Transformers.js y ejecuta la inferencia en el cliente vía WebGPU o WASM, eliminando costes de backend y manteniendo las conversaciones en el dispositivo.
- Prototipado rápido de demos web: al estar en formato ONNX y con la estructura esperada por Transformers.js, se puede integrar en una página estática sin infraestructura de GPU.
- Aplicaciones de escritorio con Electron o extensiones de navegador: el runtime de Transformers.js permite incorporar generación de texto en entornos JavaScript sin depender de APIs externas.
- Procesamiento de texto sensible a la privacidad: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Educación y experimentación: un modelo de 1,7B en ONNX es un punto de partida asequible para estudiar inferencia web, cuantización y latencia en el cliente.
- Generación de texto offline en entornos con conectividad limitada: una vez descargados los 3,2 GB del repositorio, la inferencia no requiere red.
- Filtrado y resumen de contenido en el cliente: tareas de transformación de texto de longitud moderada que se benefician de no enviar datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,7B en FP16 requiere aproximadamente 3,4 GB solo para pesos, más memoria para KV cache y activaciones; el repositorio de 3,2 GB es coherente con pesos en precisión reducida, pero no se especifica la variante exacta.
- GPU recomendadas: no indicadas por el autor. Para despliegue servidor con el modelo base serían razonables GPUs con al menos 8-16 GB de VRAM, pero este dato no consta en la información proporcionada.
- GPU de consumo: no confirmado para esta conversión. En navegador, el rendimiento depende del soporte de WebGPU del dispositivo; en equipos sin WebGPU se recurre a WASM con latencia notablemente mayor.
- Opciones de despliegue: Transformers.js (principal, según la librería declarada). Para el modelo base en servidor serían aplicables vLLM, TGI o llama.cpp, pero no se documenta su compatibilidad con estos pesos ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| hb-dev/Qwen3-1.7B-ONNX | 1,7B | no disponible | ONNX | no disponible | Inferencia web con Transformers.js |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | safetensors (formato habitual de Hugging Face) | no disponible | Modelo base original |
| Otras conversiones ONNX de modelos de ~1-2B | variable | variable | ONNX | variable | Inferencia web |

La comparación relevante es contra el modelo base: esta conversión no altera capacidades, solo el formato de distribución. Frente a otras alternativas de la misma categoría, la información disponible no permite establecer comparaciones cuantitativas de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos, por lo que deben asumirse los del modelo base Qwen3-1.7B, no evaluados aquí.
- Riesgo de alucinación inherente a un modelo de 1,7B; sin benchmarks publicados no es posible cuantificarlo.
- No se especifican limitaciones de contexto ni de idioma; el campo de idiomas está vacío.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3-1.7B antes de cualquier despliegue en producción.
- El repositorio es una conversión de terceros (hb-dev), no una publicación oficial de Qwen; la integridad y actualización de los pesos dependen del autor de la conversión.
- El tamaño de 3,2 GB implica una descarga considerable para aplicaciones web; conviene evaluar la experiencia de primera carga.
- El rendimiento en navegador depende de WebGPU; sin él, la inferencia en WASM puede ser demasiado lenta para uso interactivo.
- No hay resultados de benchmarks ni métricas de latencia que permitan validar la calidad de la conversión frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hb-dev/Qwen3-1.7B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de Optimum (conversión a ONNX): https://huggingface.co/docs/optimum/index
