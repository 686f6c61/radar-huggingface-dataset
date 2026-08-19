# EthanMeng324/progressive-diffusion-wan

## Resumen

Progressive Diffusion es un conjunto de pesos de destilación few-step para los modelos de generación de vídeo Wan T2V (texto a vídeo) de Alibaba Cloud. Desarrollado por EthanMeng324, el proyecto entrena estudiantes LoRA de rango 64 (q, k, v, o, ffn) junto con tensores de condicionamiento por paso (`step_proj`) que permiten al modelo saltar directamente a tamaños de salto (jump size) grandes en el muestreador, reduciendo drásticamente el número de pasos de inferencia necesarios frente al profesor original.

El repositorio contiene múltiples checkpoints organizados en dos líneas: la línea de vídeo Wan2.1/Wan2.2 (con recetas v1 y v2 alineadas) y una línea de imagen basada en Qwen-Image. El checkpoint más destacado, `wan21_14b_armC2_step4950`, logra una reducción del error del 58 % frente al modelo base con un muestreador de reinicio (renoise) en escalera. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia actual del proyecto radica en que aborda uno de los principales cuellos de botella de la generación de vídeo con modelos de difusión: la latencia. Al permitir pocos pasos (few-step) sin sacrificar calidad, estos pesos hacen viable el despliegue en producción de generación de vídeo con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank-64 (q,k,v,o,ffn) + tensores de condicionamiento por paso sobre Wan2.1-T2V-14B y Wan2.2-T2V-A14B (diffusion transformer) |
| Parametros totales | no disponible (el repo pesa 9.6 GB en pesos LoRA y step_proj) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del modelo base Wan, que soporta principalmente ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible; no se especifica explicitamente) |

## Arquitectura y entrenamiento

El proyecto entrena estudiantes de destilación sobre los modelos Wan T2V de Alibaba Cloud, que siguen el paradigma de diffusion transformer (DiT) con flow matching. Cada checkpoint es una LoRA de rango 64 aplicada a las proyecciones q, k, v, o y a las capas feed-forward, más cuatro tensores de condicionamiento por paso que envuelven el `time_embedding` para condicionar el modelo al tamaño de salto d. El muestreador emplea una escalera de reinicio (restart ladder) con reinyección de ruido, y la entrada en frío debe producirse en un nivel de sigma entrenado (1.0).

El entrenamiento se realizó sobre el rango completo de sigma para la línea Wan2.1 (batch 64, 619 pasos de optimización estabilizados) y sobre bandas específicas de sigma para los dos expertos de Wan2.2 (bajo ruido sigma < 0.875, alto ruido sigma >= 0.875). La línea de imagen (Qwen-Image) incorpora pérdida de características del profesor, datos multiplicados por 4 y heads de parada aprendidos (stop heads) con espacio de acción {siguiente rung, salto terminal r>=2, parada}. El proyecto documenta post-mortems de entrenamientos fallidos (blow-ups, warm restarts dañinos) que no se suben al repositorio.

## Capacidades

- Generación de vídeo texto a vídeo (T2V) con pocos pasos de inferencia (few-step), reduciendo la latencia frente al profesor original.
- Destilación por salto completo (full-jump distillation): el modelo puede saltar directamente a tamaños de salto grandes en el muestreador de reinicio.
- Condicionamiento por paso (step-conditioning) mediante tensores `step_proj` que ajustan el comportamiento según el tamaño de salto d.
- Línea de imagen (Qwen-Image) con destilación few-step y heads de parada aprendidos que deciden cuándo detener la generación o saltar niveles.
- Dos expertos complementarios para Wan2.2 (bajo y alto ruido) que se despliegan juntos con enrutamiento por sigma en 0.875.
- Compatibilidad con DiffSynth para cargar LoRA (`pipe.load_lora`) e instalar el wrapper de pasos.

## Casos de uso

- Generación de vídeo en tiempo real para prototipado creativo: con pocos pasos de inferencia, un equipo de diseño puede iterar sobre prompts de texto y obtener vídeos preliminares en segundos en una GPU consumer, acelerando el ciclo de exploración de ideas.
- Producción de vídeo de bajo coste en estudios independientes: al reducir el número de pasos de difusión, se reduce el coste computacional por vídeo generado, haciendo viable la generación por lotes en hardware modesto (p. ej., RTX 4090) para creadores de contenido.
- Integración en pipelines de postproducción: los checkpoints de Wan2.1 con reducción del 58 % de error permiten generar tomas de referencia o storyboards animados que luego se refinan con herramientas tradicionales, sin necesidad de un clúster de GPUs.
- Evaluación de calidad de destilación: los checkpoints de convergencia (step-1000 a step-4950) permiten estudiar cómo evoluciona la calidad del estudiante a lo largo del entrenamiento, útil para investigadores que trabajan en destilación de modelos de difusión.
- Generación de imagen few-step con Qwen-Image: el checkpoint `qwen_image_v7_step15000` supera a Lightning-4 en DISTS (0.191 vs 0.193) con 4 pasos de función de evaluación (NFE4), adecuado para aplicaciones de generación de imagen de baja latencia.
- Investigación en muestreo adaptativo: los stop heads aprendidos permiten experimentar con estrategias de parada temprana y salto de niveles en la escalera de reinicio, aplicables a otros modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de generacion de video e imagen, no de texto. Los datos de rendimiento reportados por el autor son:

| Checkpoint | Base | Reduccion de error vs base | Nota |
|---|---|---|---|
| wan21_14b_armC2_step4950 | Wan2.1-T2V-14B | -58.0 % (t=-13.4) | Mejor resultado; VBench estetico en arranque en frio supera al profesor |
| wan21_14b_armC1_step600 | Wan2.1-T2V-14B | -43.2 % | Referencia de ablacion |
| wan22_a14b_low_expert_step1400 | Wan2.2 low-noise expert | -11.6 % | Se empareja con el experto de alto ruido |
| wan22_a14b_high_expert_step1800 | Wan2.2 high-noise expert | -20.8 % (3/3 niveles) | Servidor de rung-1 (sigma=1.0) |
| qwen_image_v7_step15000 | Qwen-Image | DISTS 0.191 (NFE4) | Supera a Lightning-4 (0.193) |

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente. Dado que el modelo base Wan2.1-T2V-14B requiere aproximadamente 24-32 GB en FP16, y los pesos LoRA anaden 9.6 GB al repositorio, se estima un consumo total de 30-40 GB en FP16 para inferencia completa.
- GPU recomendadas: para el modelo base de 14B, se recomienda al menos una RTX 4090 (24 GB) con cuantizacion o una A100/H100 (40-80 GB) para FP16 sin cuantizar. Para el experto Wan2.2 A14B, requisitos similares.
- En GPU consumer: posible con cuantizacion (p. ej., 8-bit o 4-bit) en RTX 4090 o RTX 3090, aunque el autor no proporciona configuraciones de cuantizacion especificas.
- Opciones de despliegue: DiffSynth (carga de LoRA y wrapper de pasos), con integracion posible en pipelines de generacion de video. No se mencionan vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles. El objetivo del proyecto es reducir el numero de pasos de difusion, por lo que la latencia depende del muestreador de reinicio y del numero de pasos configurado.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Reduccion de pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| progressive-diffusion-wan (este) | Wan2.1-14B / Wan2.2-A14B | Destilacion few-step con LoRA | Hasta -58 % error, pocos pasos | Apache 2.0 | Pesos en HuggingFace |
| Wan2.1-T2V-14B original | - | Modelo profesor | 1 paso (referencia) | Apache 2.0 | HuggingFace |
| Wan2.2-T2V-A14B original | - | Modelo profesor con dos expertos | 1 paso (referencia) | Apache 2.0 | HuggingFace |
| Lightning-4 (para Qwen-Image) | Qwen-Image | Destilacion few-step | 4 pasos (NFE4) | no disponible | no disponible |

La comparativa directa con otros modelos de destilacion few-step para video (como los basados en Stable Video Diffusion o CogVideoX) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo pesos; la receta de carga exacta (instalacion del wrapper de pasos, carga de `step_proj`) requiere acceso al repositorio de codigo privado en GitHub, lo que limita la reproducibilidad para terceros.
- El muestreador debe entrar en frio en un nivel de sigma entrenado (1.0); desviarse de este protocolo puede producir resultados degradados o inestables.
- Los checkpoints de Wan2.2 son dos expertos que deben desplegarse juntos con enrutamiento por sigma en 0.875; desplegar solo uno de ellos produce resultados incompletos.
- Varios checkpoints del proyecto estan deliberadamente no subidos (entrenamientos danados, blow-ups, warm restarts), lo que indica que la linea de entrenamiento es sensible a la configuracion y no todos los intentos convergen.
- No se proporcionan datos de sesgos, alucinacion o limitaciones de idioma; al heredar el modelo base Wan, es probable que herede sus sesgos en la generacion de contenido visual.
- La licencia Apache 2.0 permite uso comercial, pero el codigo de carga no es publico, lo que puede complicar la integracion en produccion sin contacto con el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EthanMeng324/progressive-diffusion-wan
- Dataset de entrenamiento: https://huggingface.co/datasets/EthanMeng324/progressive-diffusion-wan-data
- Repositorio de codigo (privado): https://github.com/EthanMeng324/progressive-diffusion
- Modelo base Wan2.1: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Paper de Wan: https://arxiv.org/abs/2503.20314
- Repositorio GitHub de Wan: https://github.com/Wan-Video/Wan2.1
- Plataforma Wan: https://wan.video/
