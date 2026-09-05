# arianraje/qwen3-4b-gdn-otmix-1p2b-opd

## Resumen

El modelo `arianraje/qwen3-4b-gdn-otmix-1p2b-opd` es un modelo de lenguaje híbrido desarrollado por arianraje, que parte del modelo Qwen/Qwen3-4B y lo convierte en una arquitectura GDN (gated DeltaNet) con atención lineal. Se trata de un checkpoint de investigación dentro de un estudio que busca sustituir la atención completa por capas híbridas de gated DeltaNet, manteniendo el rendimiento mediante distillación on-policy. El modelo tiene 4.546.819.904 parámetros totales y una ventana de contexto de 32.768 tokens. La versión publicada corresponde al decaimiento final de una rung del ladder WSD, tras consumir 1.200.071.322 tokens. Su relevancia radica en explorar arquitecturas eficientes de atención lineal y en la metodología de distillación on-policy para recuperar capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-hybrid (gated DeltaNet) basada en Qwen3-4B, 27 de 36 capas convertidas, retencion uniforme 1:4 |
| Parametros totales | 4.546.819.904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un híbrido que combina atención lineal y gated DeltaNet, derivado del modelo Qwen3-4B. Según los repositorios relacionados del mismo autor, se convirtieron 27 de las 36 capas del modelo original a una arquitectura GDN con retención uniforme 1:4. Los checkpoints son compatibles con `Qwen3NextForCausalLM` y se cargan con `AutoModelForCausalLM`, aunque la arquitectura personalizada requiere registrarse antes de la carga.

El entrenamiento utilizó una estrategia de distillación on-policy (OPD) dentro de un ladder WSD (Warmup-Stable-Decay). El proceso consumió 1.200.071.322 tokens en el paso 7097, con un horizonte de 32.768 tokens. El ladder se compone de rungs de aproximadamente 200 millones de tokens con learning rate constante de 2e-5, seguidos de un decaimiento lineal de 839 pasos (110 millones de tokens). Cada rung se sembró desde el estado previo al decaimiento de la rung anterior. El primer rung se sembró desde el checkpoint `wsd-flat-ext800-predecay-890M` de `pinkskin/qwen3-4b-gdn-wsd-ladder`. El dataset de entrenamiento fue una mezcla de prompts de OpenThoughts (stage3_prompts_v1, con aproximadamente un 15% de RUG y un 20% de prompts generales). El modelo publicado es el estado final decaído a cero de la rung `wsd_qwen_otmix_h32k_b200x4_1p2b`.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje capaz de generar texto, aunque no se han publicado evaluaciones específicas.
- Razonamiento: entrenado con una mezcla de prompts de OpenThoughts, potencialmente orientado a tareas de razonamiento, aunque no hay benchmarks disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Visión: no disponible.
- Audio: no disponible.
- Contexto largo: soporta hasta 32.768 tokens.

## Casos de uso

- Investigación en arquitecturas híbridas de atención lineal: el modelo permite estudiar cómo la conversión de capas de atención completa a gated DeltaNet afecta al rendimiento y la eficiencia.
- Distillación on-policy: sirve como referencia para investigar técnicas de distillación donde el profesor evalúa los rollouts del estudiante token a token.
- Asistentes conversacionales con contexto largo: su ventana de 32.768 tokens permite mantener conversaciones extensas sin perder información.
- Experimentación con curvas de aprendizaje WSD: el checkpoint es un punto de datos del ladder, útil para analizar el efecto del decaimiento de learning rate.
- Fine-tuning para tareas específicas: al estar bajo licencia MIT, puede adaptarse a dominios concretos con fine-tuning adicional.
- Despliegue en entornos con recursos limitados: con 4.5B parámetros, es viable en GPUs de consumo si se cuantiza adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: los pesos ocupan aproximadamente 9.1 GB, por lo que se recomienda una GPU con al menos 12 GB de VRAM para inferencia.
- VRAM estimada con cuantización 4-bit: los pesos ocuparían aproximadamente 2.3 GB, más overhead, lo que permitiría ejecutarse en GPUs de 6-8 GB.
- GPU recomendadas: RTX 4090 (24 GB) para FP16/BF16, A100 o H100 para despliegue en producción.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de 16 GB con cuantización, o en 24 GB sin cuantizar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se registre la arquitectura personalizada GDN-hybrid antes de la carga.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| arianraje/qwen3-4b-gdn-otmix-1p2b-opd | 4.546.819.904 | 32.768 | GDN-hybrid | MIT |
| Qwen/Qwen3-4B | ~4B | 32.768 | Transformer de atención completa | Apache 2.0 |
| arianraje/qwen3-4b-gdn-hybrid-opd | No disponible | No disponible | GDN-hybrid | MIT |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de capacidades, por lo que el rendimiento real es desconocido.
- El modelo requiere registrar una arquitectura personalizada GDN-hybrid antes de la carga, lo que añade complejidad al despliegue.
- Los idiomas soportados no están documentados; se desconoce su cobertura multilingüe.
- El estado previo al decaimiento (pre-decay) no se ha subido, solo el checkpoint final decaído a cero.
- Al ser un modelo de lenguaje, existe riesgo inherente de alucinación y sesgos, aunque no se han documentado específicamente.
- El repo tiene 0 descargas y 0 likes, lo que indica que es un checkpoint de investigación sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/qwen3-4b-gdn-otmix-1p2b-opd
- Repositorio relacionado del mismo autor: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-opd
- Otro checkpoint relacionado: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage3-200M-OPD-dtfix
- Modelo semilla del primer rung: https://huggingface.co/pinkskin/qwen3-4b-gdn-wsd-ladder
- Commit fuente: `d86fbef09d35f4e4d7943ec51d2b3732eb1fed46`
