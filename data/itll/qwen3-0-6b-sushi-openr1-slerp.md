# ITLL/Qwen3-0.6B-Sushi-OpenR1-SLERP

## Resumen
Qwen3-0.6B-Sushi-OpenR1-SLERP es un modelo de lenguaje de 0,6 mil millones de parámetros resultado de una fusión de pesos mediante SLERP (spherical linear interpolation) con un factor t=0,5 entre dos modelos derivados de Qwen3: kazako5er/Qwen3-0.6B-Sushi-Code-Expert y 90dkn0ws/OpenR1-Distill-0.6B. Lo publica el usuario ITLL en Hugging Face y está orientado a generación de texto con especial énfasis en código y razonamiento algorítmico.

La relevancia del modelo es acotada: se trata de un experimento de merging de pesos, no de un entrenamiento desde cero, y no cuenta con descargas ni validación de la comunidad en el momento de redactar esta ficha. Su interés práctico reside en explorar si la combinación de un modelo ajustado para código (Sushi-Code-Expert) con un destilado de razonamiento (OpenR1-Distill) conserva o mejora capacidades en tareas de programación competitiva y generación de código.

Por tamaño, es un modelo apto para entornos con recursos muy limitados: inferencia en CPU, GPUs de consumo e incluso despliegues en dispositivos de borde. La información publicada por el autor es mínima (una model card de tres líneas), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es una fusión de pesos, no un entrenamiento nuevo. Se aplica SLERP con t=0,5 sobre los tensores de dos checkpoints derivados de Qwen3-0.6B: un ajuste orientado a código (Sushi-Code-Expert) y un destilado de razonamiento (OpenR1-Distill). La interpolación esférica combina los pesos capa por capa, preservando la norma de los tensores y evitando el colapso que puede producir una media aritmética simple.

Los modelos de origen declaran entrenamiento sobre datasets de código y razonamiento: microsoft/rStar-Coder, open-r1/codeforces-cots, nvidia/OpenCodeReasoning y open-r1/Mixture-of-Thoughts, con técnicas de SFT y GRPO (según las etiquetas de la model card). El autor no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO en el merge final. Tampoco se documentan innovaciones técnicas adicionales más allá del propio SLERP.

## Capacidades
- Generación de texto conversacional en inglés.
- Generación y razonamiento sobre código, heredado del componente Sushi-Code-Expert.
- Razonamiento algorítmico y problemas de programación competitiva, heredado del componente OpenR1-Distill.
- Capacidad de razonamiento paso a paso (chain-of-thought) presumiblemente heredada del destilado OpenR1, aunque no verificada por el autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso
- Generación de código en entornos con recursos mínimos: el modelo puede ejecutarse en CPU o GPUs de gama baja para autocompletar funciones, generar tests unitarios o traducir pseudocódigo a Python, gracias a sus ~596 M de parámetros.
- Asistente de programación competitiva: entrenado sobre Codeforces COTs y rStar-Coder, puede usarse para explorar soluciones a problemas algorítmicos y explicar el razonamiento paso a paso.
- Prototipado rápido de pipelines de IA: su reducido tamaño permite integrarlo en notebooks, contenedores ligeros o entornos de CI para pruebas de humo de sistemas de generación de código.
- Educación y tutoría de programación: puede generar explicaciones de fragmentos de código y ejemplos didácticos en inglés, con latencia baja incluso en hardware modesto.
- Filtrado y clasificación de código: uso como modelo auxiliar para etiquetar o resumir fragmentos de código en herramientas de análisis estático.
- Experimentación en investigación sobre merging de pesos: sirve como caso de estudio reproducible para evaluar el efecto del SLERP entre un modelo de código y uno de razonamiento.
- Despliegue en dispositivos de borde: al caber en menos de 1 GB en cuantización de 8 bits, puede integrarse en entornos sin GPU dedicada para tareas de generación corta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~1,2 GB en fp16/bf16; ~0,6 GB en cuantización de 8 bits; ~0,4 GB en 4 bits (estimación a partir de los 596 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente), llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor), vLLM para servir en GPU.
- Latencia y throughput estimados: no disponibles; por tamaño, se espera latencia de pocos milisegundos por token en GPU de consumo y decenas de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ITLL/Qwen3-0.6B-Sushi-OpenR1-SLERP | 596 M | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen3-0.6B (base oficial) | 0,6 B | no disponible en esta ficha | Apache 2.0 (según Qwen3) | Hugging Face, ampliamente usado |
| kazako5er/Qwen3-0.6B-Sushi-Code-Expert | 0,6 B | no disponible | no disponible | Hugging Face |
| 90dkn0ws/OpenR1-Distill-0.6B | 0,6 B | no disponible | no disponible | Hugging Face |

El merge no documenta mejoras medibles frente a sus modelos de origen; la comparación de rendimiento queda pendiente de evaluación independiente.

## Limitaciones y advertencias
- Model card prácticamente vacía: no hay información sobre datos de entrenamiento, evaluación ni limitaciones declaradas por el autor.
- Riesgo elevado de alucinación y de errores en código, propio de modelos de 0,6 B y agravado por la ausencia de benchmarks.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene verificar las licencias de los modelos base (Qwen3 y los checkpoints fusionados) antes de desplegar en producción.
- Al ser un merge SLERP sin validación publicada, el resultado puede degradar capacidades respecto a los modelos originales en tareas específicas.
- Sin descargas ni likes en el momento de redactar: no hay evidencia de uso en la comunidad ni de validación por terceros.
- Contexto no documentado: no se puede asumir la ventana de Qwen3 sin verificar la configuración del checkpoint.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ITLL/Qwen3-0.6B-Sushi-OpenR1-SLERP
- Modelo base 1: https://huggingface.co/kazako5er/Qwen3-0.6B-Sushi-Code-Expert
- Modelo base 2: https://huggingface.co/90dkn0ws/OpenR1-Distill-0.6B
- Dataset microsoft/rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset open-r1/codeforces-cots: https://huggingface.co/datasets/open-r1/codeforces-cots
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset open-r1/Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
