# reaperdoesntknow/SMOLM2Prover

## Resumen

SMOLM2Prover es un ajuste fino (fine-tune) del modelo prithivMLmods/SmolLM2-CoT-360M, desarrollado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC. Se trata de un modelo de lenguaje de 361.821.120 parametros (aproximadamente 362 millones) especializado en razonamiento matematico, generacion de demostraciones y razonamiento paso a paso (Chain-of-Thought). Su proposito es ofrecer un asistente compacto capaz de resolver problemas de matematicas superiores, calculo y logica formal manteniendo al mismo tiempo capacidades conversacionales generales heredadas de su modelo base.

El modelo se ha entrenado mediante multiples rondas de Supervised Fine-Tuning (SFT) con la libreria TRL sobre el dataset AI-MO/NuminaMath-1.5, complementado con aproximadamente un millon de tokens adicionales de datos de razonamiento con formato personalizado. Esta orientado a entornos con recursos limitados, donde un modelo de 362 millones de parametros puede desplegarse en hardware de consumo sin necesidad de infraestructura de GPU de datacenter.

Su relevancia actual radica en la tendencia hacia modelos pequenos y especializados que pueden ejecutarse localmente o en el edge, ofreciendo razonamiento matematico basico sin los costes de inferencia de modelos de mayor escala. La licencia Apache 2.0 facilita su adopcion comercial y su integracion en pipelines educativos o de verificacion automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar via llama.cpp/GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2, un modelo de la familia SmolLM desarrollado originalmente por Hugging Face. Con 361.821.120 parametros, se situa en la gama de modelos compactos disenados para inferencia eficiente. El modelo base, prithivMLmods/SmolLM2-CoT-360M, ya incorporaba capacidades de Chain-of-Thought, y SMOLM2Prover las refina mediante SFT iterativo.

El entrenamiento se realizo con TRL (Transformer Reinforcement Learning) version 0.22.2, usando SFTTrainer en varias rondas. Los datos principales provienen de AI-MO/NuminaMath-1.5, un dataset orientado a razonamiento matematico, complementado con aproximadamente 1 millon de tokens de datos de razonamiento con formato personalizado disenado para elicitar cadenas de pensamiento paso a paso. No se menciona el uso de RLHF ni DPO en la informacion disponible. Las versiones de framework empleadas fueron Transformers 4.56.0, PyTorch 2.8.0+cu126, Datasets 4.0.0 y Tokenizers 0.22.0.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Razonamiento matematico paso a paso (Chain-of-Thought) orientado a calculo, logica y demostraciones.
- Generacion de demostraciones matematicas y explicaciones detalladas de problemas.
- Seguimiento de instrucciones complejas gracias al entrenamiento SFT con formato de prompt estructurado.
- Capacidad de actuar como componente de "pensamiento" en aplicaciones que requieren razonamiento profundo.
- Soporte de plantilla de chat (chat template) para formateo de conversaciones multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni capacidades de vision o audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Asistente educativo de matematicas: el modelo puede resolver problemas de calculo y algebra paso a paso, explicando cada etapa del razonamiento, lo que lo hace adecuado para plataformas de tutoria automatica en ingles.
- Generacion automatica de demostraciones: util para herramientas de verificacion formal o como primer borrador de pruebas matematicas que un experto humano revisa y valida despues.
- Componente de razonamiento en pipelines de agentes: al ser un modelo pequeno (362M), puede actuar como modulo de "thinking" dentro de un sistema mayor, generando cadenas de razonamiento antes de que un modelo mayor produzca la respuesta final.
- Chatbot de soporte tecnico con consistencia logica: su entrenamiento en razonamiento permite mantener coherencia en conversaciones multi-turno sobre temas tecnicos o cientificos.
- Generacion de contenido educativo: creacion de explicaciones detalladas y ejercicios resueltos para materiales de formacion en matematicas superiores.
- Despliegue en entornos con recursos limitados: al caber en GPU de consumo, puede ejecutarse localmente en portatiles o dispositivos edge para aplicaciones de razonamiento sin conexion a la nube.
- Prototipado rapido de aplicaciones de razonamiento: su licencia Apache 2.0 y su tamano permiten iterar rapidamente en el desarrollo de productos que requieran capacidades de CoT sin grandes inversiones en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (362M parametros x 2 bytes), alrededor de 0,4 GB en cuantizacion de 8 bits y aproximadamente 0,2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; se puede ejecutar en NVIDIA GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin problemas.
- Cabe holgadamente en GPU de consumo, incluidas GPUs integradas y placas como Raspberry Pi con aceleracion adecuada.
- Opciones de despliegue: transformers (pipeline o AutoModelForCausalLM), text-generation-inference (el modelo tiene tag endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF, y vLLM para despliegue con throughput alto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano reducido, se espera una latencia muy baja en GPU moderna, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SMOLM2Prover | 361.821.120 | no disponible | Apache 2.0 | Razonamiento matematico y demostraciones (CoT) |
| prithivMLmods/SmolLM2-CoT-360M (base) | ~360M | no disponible | no disponible | Chain-of-Thought general |
| SmolLM2-360M (original de Hugging Face) | 360M | no disponible | Apache 2.0 | Modelo generalista compacto |
| Qwen2.5-Math-1.5B | 1.500M | no disponible | Apache 2.0 | Razonamiento matematico |

SMOLM2Prover se diferencia de su modelo base por el ajuste fino adicional sobre NuminaMath-1.5 y datos de razonamiento, lo que deberia mejorar su desempeno en matematicas a costa de posibles regresiones en tareas generales. Frente a alternativas mas grandes como Qwen2.5-Math-1.5B, ofrece un tamano mucho menor (362M frente a 1.500M) con la contrapartida de menor capacidad absoluta. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Precision matematica: el modelo puede cometer errores o "alucinar" pasos incorrectos en demostraciones complejas; se recomienda verificacion humana en aplicaciones criticas.
- Rendimiento dependiente del dominio: su fiabilidad es mayor en problemas similares a los datos de entrenamiento (NuminaMath-1.5); en dominios novedosos o esotericos su precision debe evaluarse cuidadosamente.
- Sesgos heredados: incorpora los sesgos del modelo base SmolLM2-CoT-360M y de los datasets de entrenamiento.
- Idioma: solo soporta ingles segun la model card, lo que limita su uso en castellano u otros idiomas sin degradacion significativa.
- Longitud de contexto: no documentada; al derivar de SmolLM2, se espera una ventana limitada, pero no se confirma en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias restricciones que el usuario debe verificar.
- Tamano reducido: con 362M parametros, su capacidad de razonamiento abstracto y su conocimiento general son limitados en comparacion con modelos de mayor escala.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines que requieran invocacion de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo base: https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Libreria TRL: https://github.com/huggingface/trl
- Perfil del autor (Convergent Intelligence LLC): https://huggingface.co/reaperdoesntknow
