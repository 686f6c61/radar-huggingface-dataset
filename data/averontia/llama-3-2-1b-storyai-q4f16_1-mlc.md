# Averontia/Llama-3.2-1B-StoryAI-q4f16_1-MLC

## Resumen

Llama-3.2-1B-StoryAI-q4f16_1-MLC es una compilación del modelo meta-llama/Llama-3.2-1B-Instruct empaquetada específicamente para MLC-LLM y WebLLM, la librería que permite ejecutar modelos de lenguaje directamente en el navegador mediante WebGPU. El autor, Averontia, ha publicado esta variante orientada a la aplicación Story AI, con un ajuste declarado que elimina la tendencia del modelo base a contenerse a la hora de generar ficción oscura.

El modelo parte de la arquitectura Llama 3.2 de 1.000 millones de parámetros desarrollada por Meta, un transformer denso con atención de múltiples cabezas y una ventana de contexto de 128.000 tokens en su versión original. Esta versión concreta se distribuye cuantizada en q4f16_1 (pesos de 4 bits con activaciones de 16 bits) y compilada a formato MLC, lo que reduce el peso del repositorio a 0,7 GB y lo hace apto para descarga y ejecución en el cliente.

La relevancia de esta ficha radica en que ilustra un caso de despliegue edge: un modelo instructivo pequeño, cuantizado y empaquetado para inferencia local en navegador, sin necesidad de servidor ni GPU dedicada en el backend. El repositorio no incluye documentación técnica adicional, métricas de evaluación propias ni detalles sobre el procedimiento de ajuste aplicado, por lo que buena parte de las especificaciones deben inferirse del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2), pesos compilados para MLC-LLM |
| Parametros totales | 1.240 millones (modelo base Llama-3.2-1B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no confirmado en esta compilación MLC |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits, activaciones float16) |
| Idiomas soportados | no disponible en la model card; el modelo base cubre 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | MLC (artefactos compilados para MLC-LLM / WebLLM), tamano del repo 0,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 1B Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con GQA. Meta entrenó la familia Llama 3.2 con un corpus multilingüe de gran escala y aplicó un pipeline de post-entrenamiento que incluye supervisión, preferencias y ajuste de seguridad. La model card de esta variante no aporta cifras de tokens, composición del dataset ni detalles del proceso de alineación.

El valor técnico diferencial de este repositorio no está en el entrenamiento, sino en el empaquetado: los pesos se han convertido al formato MLC y cuantizado a q4f16_1 para que WebLLM pueda cargarlos y ejecutarlos en el navegador mediante WebGPU. El autor declara haber eliminado el sesgo del modelo base a evitar ficción oscura, pero no documenta la metodología (fine-tuning, DPO, edición de pesos u otra), ni publica datos de evaluación que permitan verificar el efecto del ajuste ni cuantificar posibles regresiones en otras capacidades.

## Capacidades

- Generación de texto instructivo y conversacional, heredada de Llama-3.2-1B-Instruct.
- Generación de ficción narrativa, con énfasis declarado en ficción oscura sin las reticencias del modelo base.
- Razonamiento básico y respuesta a instrucciones en formato chat, con plantilla de Llama 3.
- Capacidades multilingües limitadas al repertorio del modelo base (8 idiomas oficiales), sin confirmación específica en esta compilación.
- Ejecución local en navegador mediante WebLLM y WebGPU, sin backend de inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en esta variante.

## Casos de uso

- Aplicación de escritura de ficción en navegador: Story AI puede ofrecer generación de relatos y continuaciones narrativas directamente en el cliente, aprovechando el empaquetado WebLLM y el ajuste orientado a ficción oscura.
- Prototipado de asistentes conversacionales sin servidor: al ejecutarse en WebGPU, permite demos y pruebas de concepto sin coste de infraestructura ni envío de datos a terceros.
- Herramientas de escritura creativa offline: un editor web puede integrar el modelo para sugerencias de trama o diálogo con privacidad total, ya que la inferencia ocurre en el dispositivo del usuario.
- Educación y experimentación con LLM: sirve para que desarrolladores estudien el pipeline MLC-LLM (conversión, cuantización, compilación) con un artefacto pequeño de 0,7 GB.
- Generación de contenido de nicho con sesgo de seguridad relajado: útil en contextos creativos donde el modelo base rechazaría temáticas adultas o violentas dentro de la ficción, siempre que se respete la política de uso aceptable de Llama.
- Aplicaciones de bajo consumo en hardware modesto: al ser un modelo de 1B en 4 bits, puede desplegarse en portátiles con GPU integrada compatible con WebGPU para tareas de generación de texto ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7-1 GB para los pesos q4f16_1, más overhead de KV cache y runtime de WebGPU (estimación a partir del tamaño del repo; no verificada por el autor).
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (AMD, NVIDIA o Intel recientes); en el ecosistema MLC nativo, tarjetas de gama media son suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU integradas y dedicadas modernas con WebGPU; también en Apple Silicon vía Metal.
- Opciones de despliegue: MLC-LLM, WebLLM (navegador), y potencialmente mlc_llm serve para API local; no se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente a este repo.
- Latencia y throughput: no disponibles; dependerán del dispositivo y del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-1B-StoryAI-q4f16_1-MLC | 1,24B | 128k (base) | q4f16_1 | llama3.2 | MLC |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | safetensors fp16/bf16 | llama3.2 | safetensors |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | multiples (GGUF, AWQ, etc.) | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B-it | 2,6B | 8k | multiples | Gemma Terms | safetensors, GGUF |

Frente al modelo base, esta variante añade el empaquetado MLC y el ajuste narrativo, pero carece de su documentación y evaluación. Frente a Qwen2.5-1.5B-Instruct, este último ofrece licencia Apache 2.0 más permisiva y mayor disponibilidad de formatos, aunque con menor contexto. Gemma-2-2B-it dobla el tamaño y reduce drásticamente la ventana de contexto. Los datos de rendimiento comparado no están disponibles para esta variante.

## Limitaciones y advertencias

- El ajuste para ficción oscura puede haber degradado capacidades generales del modelo base; no hay evaluación que lo descarte.
- Riesgo elevado de alucinación inherente a un modelo de 1B parámetros, especialmente en tareas de conocimiento factual.
- No se documentan sesgos específicos del ajuste; el modelo base arrastra los sesgos de su corpus de entrenamiento.
- La licencia Llama 3.2 Community License impone restricciones de uso (política de uso aceptable, umbral de 700 millones de usuarios mensuales para licencia comercial adicional) y exige atribución a Meta.
- El ajuste para reducir filtros de seguridad puede aumentar la probabilidad de generar contenido sensible; el despliegue en producción debe incorporar moderación adicional.
- Solo se distribuye en formato MLC cuantizado a 4 bits; no hay pesos en precisión completa ni GGUF, lo que limita las opciones de despliegue.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad, y la model card es mínima.
- La fecha de creación registrada (2026-11-05) es anómala y conviene verificarla antes de citar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Averontia/Llama-3.2-1B-StoryAI-q4f16_1-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable: https://www.llama.com/llama3_2/use-policy/
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://webllm.mlc.ai/
