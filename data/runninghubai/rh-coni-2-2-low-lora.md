# RunningHubAI/rh-coni-2.2-low-lora

## Resumen

rh-coni-2.2-low-lora es un adaptador LoRA publicado por RunningHubAI, la plataforma de RunningHub, para su uso en flujos de trabajo de ComfyUI. No se trata de un modelo de lenguaje, sino de un ajuste fino de bajo rango sobre el modelo de difusión WAN2.2 en su variante LowNoise, orientado a la generación de vídeo. El adaptador incorpora un personaje concreto (identificado por la palabra de activación `coni`) y reproduce una descripción visual muy específica: mujer de pelo largo ondulado castaño oscuro, ojos verdes, crop top negro y falda plaid gris con botones, entre otros detalles.

El repositorio contiene un único archivo de pesos en formato safetensors de 146 MiB, lo que es coherente con un LoRA de rango bajo y no con un modelo completo. La ficha del autor no proporciona información sobre el pipeline de difusión subyacente más allá de la referencia a WAN2.2 (LowNoise), ni sobre licencia, idiomas o datos de entrenamiento.

Su relevancia es limitada fuera del ecosistema ComfyUI y RunningHub: es un artefacto de personalización de personajes para generación de vídeo, no una herramienta de propósito general. Cualquier evaluación técnica debe hacerse en ese contexto acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre WAN2.2 LowNoise (modelo de difusión para vídeo) |
| Parametros totales | no disponible (el archivo de pesos ocupa 146 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que el copyright permanece con el autor y que se siga la licencia del proyecto original) |
| Formato de pesos | safetensors (`20260902-18237207_low_noise.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, una técnica de ajuste fino parametrizado eficiente (PEFT) que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. En este caso el modelo base es WAN2.2 en su variante LowNoise, un modelo de difusión orientado a la generación de vídeo. El nombre del archivo (`low_noise`) confirma que el adaptador está pensado para la etapa de bajo ruido del proceso de difusión, lo que en la práctica implica que se combina con otro adaptador o checkpoint para la etapa de alto ruido.

No se dispone de información sobre el número de pasos de entrenamiento, el dataset utilizado, la resolución de los vídeos de entrenamiento, el rango del LoRA ni si se aplicaron técnicas de regularización. La model card se limita a indicar la procedencia (WAN2.2 LowNoise) y la palabra de activación (`coni`). No hay evidencia de RLHF, DPO ni de innovaciones técnicas adicionales.

## Capacidades

- Personalización de personaje: reproduce un personaje concreto (`coni`) con atributos visuales definidos (pelo, ojos, ropa, accesorios).
- Generación de vídeo condicionada por texto: el adaptador se usa junto con el modelo base WAN2.2 para generar clips de vídeo a partir de prompts descriptivos.
- Integración en ComfyUI: el adaptador está etiquetado para ComfyUI y puede cargarse en grafos de nodos.
- Compatibilidad con RunningHub: el autor indica que los pesos pueden cargarse en la plataforma RunningHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Creación de contenido de personaje consistente: usar el LoRA con la palabra de activación `coni` para generar múltiples clips de vídeo del mismo personaje manteniendo coherencia visual entre tomas.
- Prototipado de vídeo publicitario: generar planos de un personaje concreto (plano medio, ropa y fondo definidos) para maquetas rápidas antes de una producción real.
- Flujos de trabajo en ComfyUI: integrar el adaptador en un grafo junto con el checkpoint base WAN2.2 LowNoise para pipelines de generación de vídeo automatizados.
- Pruebas de concepto en RunningHub: cargar el LoRA en la plataforma del autor para evaluar la calidad del personaje sin infraestructura local.
- Storyboarding de narrativa visual: producir secuencias cortas con un personaje fijo para previsualizar escenas antes de rodar o animar.
- Investigación sobre LoRA en difusión de vídeo: usar el adaptador como caso de estudio de ajuste fino de bajo rango sobre WAN2.2, comparando el efecto en la etapa de bajo ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base WAN2.2 y de la resolución y duración del vídeo, no solo del LoRA (146 MiB adicionales sobre el checkpoint base).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub son las vías indicadas por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un LoRA de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRAs comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de texto (MMLU, HumanEval, GSM8K) ni usarse para tareas de NLP.
- Dependencia del modelo base: requiere WAN2.2 LowNoise y, previsiblemente, su contraparte de alto ruido; sin ellos el adaptador no es funcional.
- Licencia no especificada: el autor remite a la licencia del proyecto original, lo que introduce incertidumbre para uso comercial. Es necesario verificar la licencia de WAN2.2 antes de desplegar.
- Sesgos y alucinaciones: no documentados; en difusión de vídeo el riesgo se traduce en artefactos visuales, inconsistencias temporales y desviaciones del prompt.
- Idiomas: no disponible; la efectividad del prompt depende del modelo base.
- Especificidad del personaje: el LoRA está entrenado para un personaje concreto; su uso fuera de ese dominio puede degradar la calidad.
- Escasa documentación: la model card no detalla el entrenamiento, el rango del LoRA ni los parámetros de inferencia recomendados, lo que dificulta la reproducibilidad.
- Fecha de creación en el repositorio (2026-11-05) posterior a la fecha actual de referencia; conviene verificar la integridad y procedencia del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RunningHubAI/rh-coni-2.2-low-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2095320129675771905
- Página del autor: https://www.runninghub.ai/user-center/2092339732215197697
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
