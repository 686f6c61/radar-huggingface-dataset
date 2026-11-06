# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4-adapter

## Resumen

El modelo `LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4-adapter` es un adaptador LoRA (rango 16, alpha 32, learning rate 8e-4) entrenado por el usuario `lugman-madhiai` sobre el modelo base `LiquidAI/LFM2.5-350M` de Liquid AI. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) orientado, segun el nombre, a tareas de "SmolDataEnvs-Easy", lo que sugiere un ajuste sobre entornos o tareas sencillas de un conjunto de datos de instrucciones. El adaptador se distribuye en formato safetensors y es compatible con la libreria `transformers` y con `text-generation-inference`.

El modelo base LFM2.5-350M pertenece a la familia LFM2 (Liquid Foundation Models 2) de Liquid AI, una arquitectura hibrida que combina capas convolucionales y de atencion, disenada para inferencia eficiente en dispositivos de borde. Con 350 millones de parametros, es un modelo compacto pensado para despliegues con recursos limitados, donde un adaptador LoRA permite especializar el comportamiento sin reentrenar el modelo completo.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador comunitario con muy poca traccion (0 descargas, 0 likes en el momento de la consulta) y, por otro, sirve como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre un modelo de Liquid AI. La informacion publicada por el autor es minima: no hay detalles sobre el dataset, los hiperparametros completos ni resultados de evaluacion, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base LFM2.5-350M (arquitectura hibrida de Liquid AI) |
| Parametros totales | 350M en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones que soporte LFM2.5-350M) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Learning rate | 8e-4 |
| Libreria de entrenamiento | Unsloth |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `LiquidAI/LFM2.5-350M`, un modelo de la familia LFM2 de Liquid AI. La arquitectura exacta del modelo base no se detalla en la informacion proporcionada; la familia LFM2 se caracteriza por combinar bloques convolucionales y de atencion para reducir el coste computacional en inferencia manteniendo calidad en tareas de lenguaje. El adaptador en si es un LoRA de rango 16 y alpha 32, lo que implica una actualizacion de bajo rango sobre las matrices de peso del modelo base, con un factor de escala alpha/rango de 2.

El entrenamiento se realizo con Unsloth, segun indica la model card, que afirma que el modelo se entreno "2x faster" con dicha libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset "SmolDataEnvs-Easy", ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del uso de LoRA y Unsloth. El learning rate de 8e-4 es relativamente alto para un fine-tuning LoRA, lo que sugiere un ajuste agresivo sobre un dataset pequeno o de tareas sencillas, coherente con el sufijo "Easy" del nombre.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Especializacion en tareas de "SmolDataEnvs-Easy", presumiblemente entornos o instrucciones sencillas, aunque el autor no detalla la naturaleza exacta del dataset.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de asistentes de instrucciones sencillas: al ser un adaptador LoRA sobre un modelo de 350M, permite experimentar con un modelo especializado en tareas simples en una sola GPU consumer, ideal para validar ideas antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde: el modelo base de 350M y el adaptador de 0.1 GB permiten ejecutar inferencia en hardware con poca VRAM, como una Jetson Nano o una Raspberry Pi con acelerador, para tareas de generacion de texto acotadas.
- Fine-tuning incremental sobre dominios especificos: el adaptador sirve como punto de partida para aplicar tecnicas LoRA sobre LFM2.5-350M en nuevos datasets, reutilizando la configuracion r16/a32 documentada.
- Investigacion sobre entrenamiento eficiente: util para reproducir experimentos con Unsloth y comparar el impacto de distintos hiperparametros (rango, alpha, learning rate) en modelos pequenos.
- Evaluacion de calidad de adaptadores comunitarios: permite estudiar como se comporta un LoRA entrenado con un learning rate alto (8e-4) frente al modelo base en tareas de instrucciones.
- Generacion de texto en ingles para entornos con restricciones de licencia permisiva: la licencia apache-2.0 facilita su integracion en productos comerciales sin obligaciones de copyleft, siempre que se respeten las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 350M, la VRAM necesaria es la del modelo base. En fp16, el modelo base ocupa aproximadamente 0.7 GB; en cuantizacion de 8 bits, alrededor de 0.35 GB; en 4 bits, alrededor de 0.2 GB. El adaptador anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060, RTX 4060 o incluso una GTX 1650 son suficientes.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna, e incluso en CPU con llama.cpp u Ollama si se convierte el modelo base a GGUF.
- Opciones de despliegue: `transformers` con el adaptador cargado via PEFT, `text-generation-inference` (segun los tags), y potencialmente llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; para un modelo de 350M se espera un throughput alto (cientos de tokens por segundo en GPU moderna), pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4-adapter | 350M (base) + LoRA | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-350M (modelo base) | 350M | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| SmolLM2-360M (Hugging Face) | 360M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos de ~350M) queda limitada por la falta de datos de rendimiento y contexto en la informacion proporcionada. El adaptador no aporta mejoras documentadas frente al modelo base, por lo que su valor diferencial no puede cuantificarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset no especificado ("SmolDataEnvs-Easy"), pueden heredarse sesgos del mismo.
- Riesgo de alucinacion: inherente a modelos de 350M; la capacidad de razonamiento y factualidad es limitada en comparacion con modelos mayores.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base LFM2.5-350M, que no se detalla en la informacion proporcionada.
- Caveats para produccion: el adaptador tiene 0 descargas y 0 likes, sin evaluacion publica; el learning rate de 8e-4 es alto y podria haber causado sobreajuste o degradacion en el modelo base. No se recomienda su uso en produccion sin una evaluacion previa exhaustiva.
- El repositorio es de 0.1 GB y fue creado y actualizado el mismo dia (2026-10-30), lo que sugiere una publicacion sin mantenimiento posterior.

## Enlaces

- [Hugging Face: lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4-adapter](https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4-adapter)
- [Modelo base: LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
