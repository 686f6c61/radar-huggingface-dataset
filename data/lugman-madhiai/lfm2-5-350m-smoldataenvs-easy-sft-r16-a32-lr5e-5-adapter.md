# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5-adapter

## Resumen

El modelo `lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5-adapter` es un adaptador de ajuste fino (LoRA) publicado por el usuario lugman-madhiai sobre el modelo base `LiquidAI/LFM2.5-350M` de Liquid AI. Se trata de un fine-tuning supervisado (SFT) orientado a tareas de entornos de datos de tipo "easy" (según el nombre, probablemente entornos de agentes o tool use del dataset SmolDataEnvs). El adaptador tiene rango 16 y alpha 32, con una tasa de aprendizaje de 5e-5, y fue entrenado con las librerías Unsloth y TRL.

El modelo base LFM2.5-350M es un modelo de lenguaje compacto de la familia LFM2 (Liquid Foundation Models) de Liquid AI, con 350 millones de parámetros y arquitectura propietaria de Liquid AI (híbrida, orientada a eficiencia en dispositivos). El adaptador se distribuye en formato safetensors y es compatible con `transformers` y `text-generation-inference`, con licencia Apache 2.0.

La relevancia de esta ficha es limitada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks publicados. Es útil como ejemplo de fine-tuning ligero sobre LFM2.5-350M para tareas de agentes en entornos sencillos, pero no debe considerarse un modelo de producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-350M (arquitectura del base: no disponible en detalle) |
| Parametros totales | No disponible (el base tiene 350M; el adaptador LoRA r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato safetensors del adaptador; cuantización del base no especificada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `LiquidAI/LFM2.5-350M`, un transformer compacto de 350 millones de parámetros de la familia LFM2 de Liquid AI. El adaptador es un LoRA de rango 16 y alpha 32, lo que implica que solo se actualizan matrices de baja dimensión, manteniendo congelados los pesos del base. El entrenamiento fue de tipo SFT (supervised fine-tuning) con la librería TRL y acelerado con Unsloth, según indica la model card.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá del nombre "SmolDataEnvs-Easy"), ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere que el dataset está relacionado con entornos de datos de dificultad "easy", probablemente para tareas de agentes o tool calling, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste específico para tareas de entornos de datos "easy" (según el nombre del adaptador), presumiblemente interacción con entornos estructurados o tool use.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el nombre sugiere orientación a entornos, pero sin documentación.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con fine-tuning LoRA sobre LFM2.5-350M: el adaptador sirve como referencia para reproducir un SFT ligero con Unsloth y TRL sobre un modelo de 350M, útil en entornos de investigación con recursos limitados.
- Prototipado de agentes en entornos sencillos: dado el nombre "SmolDataEnvs-Easy", puede emplearse para probar pipelines de agentes que interactúan con entornos estructurados de baja complejidad, siempre con validación previa.
- Pruebas de integración con `text-generation-inference`: el adaptador es compatible con TGI, por lo que puede desplegarse en un endpoint para evaluar latencia y calidad en tareas de generación corta.
- Educación y demos: al ser un adaptador pequeño (0,1 GB) sobre un base de 350M, es adecuado para demostraciones de fine-tuning en aulas o talleres.
- Evaluación comparativa de hiperparámetros LoRA: el nombre del repositorio codifica r=16, alpha=32 y lr=5e-5, lo que lo hace útil como punto de comparación frente a otros adaptadores con distintos hiperparámetros.
- Generación de texto en inglés de baja latencia: el base de 350M permite inferencia rápida en CPU o GPU consumer, útil para tareas de generación simple donde no se requiera alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa aproximadamente 0,1 GB; el modelo base de 350M en fp16 requiere en torno a 0,7 GB de VRAM, y en cuantización de 4 bits alrededor de 0,2-0,3 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para el base de 350M; también cabe en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del base.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y previsiblemente llama.cpp/Ollama si se convierte el base a GGUF (no confirmado para este adaptador).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este adaptador) | 350M (base) + LoRA r=16 | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-350M (base) | 350M | No disponible | Apache 2.0 | HuggingFace |
| Otros adaptadores LoRA sobre LFM2.5-350M | 350M (base) + LoRA | No disponible | Variable | HuggingFace (no verificados) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Model card mínima: no se documentan datos de entrenamiento, composición del dataset ni métricas de evaluación.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo base de 350M, especialmente en tareas de razonamiento complejo.
- El adaptador está diseñado para tareas de entornos "easy"; su rendimiento en escenarios más complejos es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un base de Liquid AI, conviene verificar los términos del modelo base.
- No se especifica la longitud de contexto del base en la información disponible; no asumir ventanas largas.
- Para producción, se recomienda evaluar el adaptador frente al base sin fine-tuning antes de adoptarlo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr5e-5-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
