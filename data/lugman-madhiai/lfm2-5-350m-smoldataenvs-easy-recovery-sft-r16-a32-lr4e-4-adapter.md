# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4-adapter

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4-adapter es un adaptador LoRA (r=16, alpha=32, learning rate 4e-4) entrenado por el usuario lugman-madhiai sobre el modelo base LiquidAI/LFM2.5-350M. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) orientado a tareas de "recuperación fácil" en entornos de datos sintéticos (SmolDataEnvs), presumiblemente para evaluar la capacidad del modelo de recuperarse de estados de error o seguir instrucciones de corrección en entornos controlados.

El modelo base, LFM2.5-350M, pertenece a la familia Liquid Foundation Models de LiquidAI, una arquitectura propietaria de tipo híbrido (convolutional + attention) optimizada para eficiencia en dispositivos de borde. Con solo 350 millones de parámetros, es un modelo compacto pensado para inferencia en CPU y GPUs de consumo.

La relevancia de esta ficha es limitada: se trata de un adaptador experimental con cero descargas y cero likes, sin model card sustantiva ni benchmarks publicados. Resulta útil únicamente como referencia para quienes exploren fine-tuning con Unsloth sobre modelos LFM2 pequeños, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido (LFM2) |
| Parametros totales | ~350M (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base soporta las cuantizaciones habituales, pero no se especifican) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de LiquidAI. La arquitectura LFM2 combina capas convolucionales y de atención en un diseño híbrido orientado a eficiencia computacional y baja latencia en hardware modesto. El adaptador LoRA congela los pesos base e inyecta matrices de bajo rango con r=16 y alpha=32 en las capas seleccionadas.

El entrenamiento se realizó con Unsloth y TRL (SFTTrainer), según las etiquetas del repositorio. El nombre del adaptador indica un learning rate de 4e-4, un dataset denominado "SmolDataEnvs" y una tarea de "Easy-Recovery". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. No hay información sobre innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el fine-tuning.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Fine-tuning específico para tareas de recuperación en entornos de datos sintéticos (SmolDataEnvs), según el nombre del adaptador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en fine-tuning de modelos pequeños: el adaptador sirve como ejemplo reproducible de SFT con Unsloth y TRL sobre LFM2.5-350M, útil para estudiar hiperparámetros LoRA (r=16, alpha=32).
- Evaluación de recuperación en entornos sintéticos: puede emplearse para reproducir experimentos de "easy recovery" en SmolDataEnvs y comparar la curva de aprendizaje frente al modelo base.
- Prototipado de agentes ligeros en CPU: al partir de un modelo de 350M, permite iterar rápidamente en entornos sin GPU dedicada, aunque sin garantías de calidad en producción.
- Docencia y formación: útil como caso práctico de adaptadores LoRA de bajo rango en cursos de fine-tuning.
- Pruebas de pipelines de despliegue: permite validar integraciones con TGI o transformers usando un adaptador pequeño antes de escalar a modelos mayores.
- Benchmarking de infraestructura de inferencia: su tamaño reducido facilita medir latencia y throughput de frameworks como vLLM o llama.cpp con adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para el modelo base de 350M; el adaptador añade unos pocos MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050 en adelante, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference, llama.cpp (requiere conversión del adaptador a GGUF), Ollama (prevía conversión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT (este) | ~350M + LoRA | No disponible | Apache 2.0 | HuggingFace (0 descargas) |
| LiquidAI/LFM2.5-350M (base) | ~350M | No disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | ~500M | 32K | Apache 2.0 | HuggingFace |
| SmolLM2-360M | ~360M | 8K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este adaptador; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes; no hay validación comunitaria de su calidad.
- La model card es mínima y no documenta el dataset, la metodología ni los resultados.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano.
- Riesgo elevado de alucinación y de sobreajuste al dataset sintético de entrenamiento.
- No se documentan sesgos conocidos, pero al derivar de un modelo base pequeño es probable que herede sesgos del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- El adaptador requiere cargar el modelo base LiquidAI/LFM2.5-350M, lo que añade una dependencia externa.

## Enlaces

- [HuggingFace: lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4-adapter](https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4-adapter)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Unsloth (repositorio)](https://github.com/unslothai/unsloth)
