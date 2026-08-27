# EER6/SymQwen3-1.7B-CDLM-5k

## Resumen

SymQwen3-1.7B-CDLM-5k es un checkpoint experimental de la campaña DLM1B **qwen3_sym** desarrollada por EER6, cuyo objetivo es convertir el modelo autoregresivo Qwen/Qwen3-1.7B en un modelo de lenguaje de difusión (DLM). Este checkpoint concreto corresponde a la etapa intermedia de entrenamiento con atención causal y enmascaramiento con tolerancia (mask-tolerance training), que sirve como punto de partida para dos variantes posteriores (CDLM→BDLM y CDLM→SDLM). El modelo está pensado para investigar la viabilidad de la generación de texto mediante procesos de denoising en lugar de la decodificación autoregresiva tradicional.

Con 2.031.739.904 parámetros totales (el checkpoint incluye pesos adicionales sobre el base de 1.7B), se entrena durante 5.000 pasos con un lote global de 256 y secuencias de 2048 tokens, usando una mezcla de datos ADLMC v3 y supervisión limpia en todas las posiciones. La licencia es Apache 2.0 y los pesos están en formato safetensors. Su relevancia radica en ser uno de los primeros intentos controlados de comparar recetas de conversión AR→DLM sobre un modelo moderno como Qwen3, con resultados públicos en HumanEval y MBPP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención causal enmascarada (mask-tolerance DLM) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 (entrenamiento); canvas de generación 256 |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B y lo adapta a un esquema de difusión de lenguaje. Durante el entrenamiento, las entradas se enmascaran parcialmente (con el token especial `<|fim_middle|>`, id 151660) y el modelo debe predecir los tokens originales en todas las posiciones, manteniendo la atención causal en esta etapa (attn_mode = `causal`). Este enfoque, denominado "mask-tolerance", permite que el modelo aprenda a manejar entradas corruptas sin perder la semántica causal. El entrenamiento se realizó con 5.000 pasos, lote global de 256, secuencias de 2048 tokens, learning rate 1e-5, sin weight decay, y un scheduler WSD (warmup, stable, decay) con 100 pasos de warmup y 500 de decay. La mezcla de datos es ADLMC v3 con aumentación congelada. El checkpoint se guarda con código personalizado (`trust_remote_code=True`) y el forward contract exige una máscara de atención completa (sin KV cache).

## Capacidades

- Generación de texto mediante un proceso de difusión: el modelo recibe una secuencia parcialmente enmascarada y produce logits para todas las posiciones, permitiendo iterar sobre el enmascaramiento.
- Razonamiento básico y generación de código, aunque con rendimiento limitado (HumanEval pass@1 de 9.1).
- Soporte de atención causal en esta etapa, lo que permite un comportamiento similar a un modelo autoregresivo cuando no hay enmascaramiento.
- No soporta tool calling, ni agentes, ni modos de pensamiento explícitos.
- Multilingüismo no documentado; se asume herencia del base Qwen3, pero sin confirmación.

## Casos de uso

- Investigación académica sobre modelos de difusión de lenguaje: permite estudiar cómo un modelo preentrenado autoregresivo se adapta a un paradigma de denoising, comparando métricas de generación con el base original.
- Evaluación de estrategias de entrenamiento para conversión AR→DLM: este checkpoint sirve como punto de control intermedio para analizar la evolución de la pérdida y la calidad de generación en diferentes etapas.
- Benchmarking de decodificación por difusión: se puede usar para probar algoritmos de muestreo iterativo (p. ej., decodificación con canvas fijo) y comparar con modelos causales puros.
- Análisis de transferencia de conocimiento: al partir de Qwen3-1.7B, se puede medir cuánta capacidad se conserva tras el entrenamiento de difusión, útil para diseñar futuras conversiones.
- Desarrollo de técnicas de enmascaramiento adaptativo: el entrenamiento con mask-tolerance permite experimentar con diferentes tasas y patrones de enmascaramiento.
- Reproducción de experimentos controlados: al estar documentados los hiperparámetros y el código, es adecuado para verificar resultados y extender la campaña DLM1B.

## Benchmarks y rendimiento

La model card reporta resultados para los cuatro brazos de la campaña, usando un harness propio (dQwen house harness, block32-static-s32, greedy, canvas 256). Los valores para este checkpoint (CDLM-5k) son:

| Modelo | HumanEval (gen-256) pass@1 | MBPP-499 (gen-256) pass@1 |
|---|---|---|
| BDLM-10k | 27.4 | 25.1 |
| CDLM-5k (stage) | 9.1 | 10.0 |
| CDLM→BDLM-5k | 23.2 | 27.9 |
| CDLM→SDLM-5k | 26.2 | 26.1 |

Estos números no son comparables con los benchmarks estándar de modelos causales (gen-1024) y corresponden a una única semilla y decodificación greedy. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2.03B parámetros en bfloat16, el checkpoint ocupa aproximadamente 4,1 GB. Para inferencia con canvas de 256, se requieren al menos 6-8 GB de VRAM considerando activaciones y overhead.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 3090, RTX 4090, o GPUs de datacenter como A10, A100.
- Cabe en GPUs de consumo: sí, en las mencionadas.
- Opciones de despliegue: al usar `trust_remote_code`, se puede cargar con Transformers. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; es probable que requiera adaptación.
- Latencia y throughput: no disponibles; al ser un modelo de difusión, la generación requiere múltiples pasos de denoising, lo que aumenta la latencia frente a modelos autoregresivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | HumanEval (gen-256) | Licencia |
|---|---|---|---|---|---|
| SymQwen3-1.7B-CDLM-5k | 2.03B | 2048 | DLM causal enmascarado | 9.1 | Apache 2.0 |
| Qwen3-1.7B (base) | 1.7B | 32k (original) | Autoregresivo causal | no disponible | Apache 2.0 |
| BDLM-10k (misma campaña) | 2.03B | 2048 | DLM bidireccional | 27.4 | Apache 2.0 |
| CDLM→SDLM-5k (misma campaña) | 2.03B | 2048 | DLM simétrico | 26.2 | Apache 2.0 |

La comparación directa con el base Qwen3-1.7B no es posible porque los benchmarks usan protocolos distintos. Los otros brazos de la campaña muestran que la etapa CDLM-5k es claramente inferior en generación de código, lo que indica que es un checkpoint intermedio no apto para uso final.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado para producción ni para tareas reales.
- Rendimiento bajo en generación de código (HumanEval 9.1, MBPP 10.0) comparado con modelos causales de tamaño similar.
- La generación por difusión requiere un proceso iterativo de enmascaramiento; no se puede usar como un LLM causal estándar sin adaptación.
- El código personalizado (`trust_remote_code`) implica riesgos de seguridad y mantenimiento; se debe auditar antes de usar.
- No se documentan sesgos ni alucinaciones específicas, pero al ser un modelo pequeño y entrenado con datos limitados, es probable que presente alucinaciones frecuentes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es útil para ello dado su carácter experimental.
- La advertencia explícita de la model card: no se debe sobrescribir `config.attn_mode`; ejecutar el checkpoint con atención bidireccional libre colapsa el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/EER6/SymQwen3-1.7B-CDLM-5k
- Perfil del autor: https://huggingface.co/EER6
- Repositorio de Qwen3 (base): https://github.com/QwenLM/Qwen3
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-1.7B
