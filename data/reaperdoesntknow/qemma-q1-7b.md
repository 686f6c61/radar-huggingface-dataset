# reaperdoesntknow/Qemma-Q1.7B

## Resumen

Qemma-Q1.7B es un modelo híbrido experimental desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) que fusiona a nivel de pesos dos modelos existentes: el cuerpo MLP de Gemma-3 (1B) de Google y el mecanismo de atención de Qwen3-1.7B de Alibaba. No se trata de un modelo entrenado desde cero, sino de un *merge* estructural seguido de un ajuste fino supervisado (SFT) para razonamiento paso a paso e instrucciones. El resultado es un transformer denso de aproximadamente 1.000 millones de parámetros efectivos (999.891.712 según los pesos en safetensors) que conserva el tokenizador y la plantilla de chat de Gemma-3.

El modelo se presenta dentro del marco teórico propio del autor, denominado "Discrepancy Calculus" (DISC), que el autor describe como un enfoque de teoría de la medida para analizar discontinuidades en el entrenamiento. Esta ficha evalúa el modelo por sus características técnicas verificables, no por el marco teórico que lo envuelve, que no cuenta con validación independiente en la información disponible.

Es relevante ahora porque ejemplifica una tendencia creciente: la fusión de pesos entre arquitecturas distintas (no solo entre checkpoints del mismo linaje) para explorar recombinaciones de atención y MLP. Su tamaño lo hace desplegable en hardware de consumo, aunque su naturaleza experimental y su licencia OSL-3.0 limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (cuerpo MLP Gemma-3 + atención estilo Qwen3) |
| Parametros totales | 999.891.712 (≈1,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_position_embeddings = 242144 (con RoPE scaling tipo YaRN, ratio 1:*) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors (librería transformers) |
| Capas | 26 (cuerpo Gemma) / 28 (configuración de atención reportada) |
| Hidden size | 1152 (Gemma) / 2048 (atención reportada) |
| Cabezas de atención | 16 cabezas, 8 KV heads, head_dim 128 |
| MLP intermediate size | 6912 (Gemma) / 6144 (reportado en config de atención) |
| Tokenizador | Gemma-3 (con chat_template.jinja) |
| Tamaño del repo | 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso que combina componentes de dos modelos distintos a nivel de pesos. El "cuerpo" (bloques MLP y estructura general) proviene de Gemma-3 1B, con 26 capas, hidden size 1152 e intermediate size 6912. El mecanismo de atención se toma de Qwen3-1.7B y se reagrupa a la estructura de cabezas de Gemma (4×256, con head_dim 128, 16 cabezas de atención y 8 KV heads). La model card menciona además una configuración con hidden 2048, intermediate 6144 y 28 capas, lo que sugiere una proyección y alineación de dimensiones entre ambos espacios latentes. El tokenizador y la plantilla de chat son los de Gemma-3.

El entrenamiento consistió en aproximadamente 512 pasos de *warm-start* sobre HuggingFaceH4/ultrachat_200k, seguidos de un pequeño round post-fusión de 8 pasos para realinear embeddings, y finalmente unos 256 pasos de SFT sobre una mezcla de TIGER-Lab/MathInstruct y ultrachat_200k. Se usó TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. La variante "Redux" añade RoPE scaling tipo YaRN con un ratio 1:* respecto a max_position_embeddings = 242144, lo que extiende el contexto teórico muy por encima del nativo de los modelos base. No se documenta RLHF ni DPO; solo SFT. La innovación técnica principal es la fusión per-layer con alineación post-fusión de embeddings, descrita por el autor pero sin validación externa publicada.

## Capacidades

- Generación de texto e instrucciones en inglés, con plantilla de chat propia de Gemma-3 (`<|user|>`, `<|assistant|>`).
- Razonamiento paso a paso: el SFT se orientó a *stepwise reasoning*, con etiquetas tipo `<think><reasoning_step>` en el ejemplo de uso.
- Matemáticas: entrenado parcialmente sobre MathInstruct, por lo que cubre resolución de problemas aritméticos y algebraicos de complejidad moderada.
- Conversación multi-turno: el warm-start sobre ultrachat_200k aporta familiaridad con diálogos instructivos.
- Contexto largo teórico: la configuración YaRN declara max_position_embeddings de 242144, aunque no hay evidencia publicada de calidad sostenida a esa longitud.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso más allá del razonamiento encadenado en texto.
- No se documenta visión, audio ni otras modalidades.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- **Prototipado de investigación en fusión de pesos**: sirve para estudiar cómo se comporta un modelo que combina atención de un linaje (Qwen) con MLP de otro (Gemma), comparando perplejidad y calidad de generación frente a los modelos base. Adecuado porque el checkpoint es reproducible con transformers y el autor documenta la receta de merge.
- **Generación de texto instructivo en inglés en local**: con ~1 B de parámetros, cabe en GPU de consumo y permite experimentar con prompts conversacionales usando la plantilla de Gemma-3. Útil para demos y pruebas de concepto, no para producción crítica.
- **Razonamiento matemático de nivel básico**: el SFT sobre MathInstruct lo hace apto para resolver problemas aritméticos y algebraicos sencillos en un pipeline de evaluación educativa o de generación de ejercicios resueltos.
- **Base para SFT adicional**: al ser un modelo pequeño y con licencia permisiva (OSL-3.0), puede servir como punto de partida para ajustes finos sobre dominios concretos en inglés, aprovechando su bajo coste de entrenamiento.
- **Evaluación de RoPE scaling**: la configuración YaRN con contexto declarado de ~242k permite experimentar con extrapolación de contexto en un modelo pequeño, midiendo degradación de calidad a longitudes crecientes.
- **Banco de pruebas de alineación de embeddings**: el round post-fusión de 8 pasos documentado lo convierte en un caso de estudio para investigar realineación de espacios latentes tras merges entre arquitecturas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en bf16**: ~2 GB para los pesos (1,0 B parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, 3-4 GB con contexto moderado.
- **VRAM estimada en fp32**: ~4 GB solo para pesos.
- **GPU recomendadas**: cualquier GPU con ≥8 GB para bf16 con contexto corto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). Para contexto largo (decenas de miles de tokens) se recomienda ≥24 GB por el KV cache.
- **Consumer GPU**: sí, cabe holgadamente en RTX 3060/4060/4090 y en GPUs de 8 GB en bf16 con contexto corto.
- **Opciones de despliegue**: transformers (soporte nativo, es la vía documentada), text-generation-inference (el repo incluye el tag `text-generation-inference`), y endpoints compatibles. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión manual.
- **Latencia y throughput**: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Qemma-Q1.7B | ~1,0 B | 242144 (declarado, YaRN) | OSL-3.0 | en | safetensors, transformers |
| Qwen3-1.7B (base) | 1,7 B | 32768 (nativo Qwen3) | Apache-2.0 | multilingüe | safetensors, GGUF, amplio ecosistema |
| Gemma-3-1B-it (base) | ~1 B | 32768 | Gemma Terms of Use | multilingüe | safetensors, GGUF, ecosistema amplio |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 | Apache-2.0 | en (principalmente) | safetensors, GGUF, Ollama |

Qemma-Q1.7B se sitúa en el segmento de modelos de ~1 B orientados a instrucciones. Frente a sus dos modelos base, ofrece una receta de fusión poco convencional pero carece de benchmarks publicados, de soporte multilingüe y de cuantizaciones listas para usar. Qwen3-1.7B y Gemma-3-1B-it tienen ecosistemas mucho más maduros, licencias más permisivas en el caso de Qwen3 (Apache-2.0) y datos de evaluación públicos. SmolLM2-1.7B-Instruct es la alternativa más directa en tamaño y licencia permisiva dentro del ecosistema abierto.

## Limitaciones y advertencias

- **Naturaleza experimental**: es un merge entre arquitecturas distintas sin evaluación independiente publicada; el comportamiento puede ser inestable fuera de los prompts de ejemplo.
- **Riesgo de alucinación**: el autor lo advierte explícitamente; no debe usarse para decisiones médicas, legales, financieras o de seguridad crítica.
- **Solo inglés**: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está garantizado.
- **Contexto declarado vs. real**: el max_position_embeddings de 242144 con YaRN no viene acompañado de evaluaciones de calidad a longitudes largas; la degradación es probable más allá de decenas de miles de tokens.
- **Licencia OSL-3.0**: permite uso comercial con condiciones de reciprocidad (copyleft a nivel de archivo y obligación de distribuir el código fuente de las modificaciones); conviene revisar los términos antes de integrarlo en un producto propietario. Además, los modelos base (Gemma Terms of Use y Apache-2.0 de Qwen) imponen sus propias condiciones que pueden prevalecer.
- **Sin cuantizaciones oficiales**: no hay GGUF ni AWQ/GPTQ publicados, lo que complica el despliegue en llama.cpp, Ollama o vLLM sin conversión manual.
- **Marco teórico no validado**: las afirmaciones sobre "Discrepancy Calculus" y "Ghost Imprinting" no cuentan con revisión independiente en la información disponible; deben tratarse como propuesta del autor, no como resultado establecido.
- **Cero likes y adopción baja**: 2585 descargas y 0 likes indican escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-Q1.7B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Paper del marco DISC: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper previo "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Gemma-3-1b-it: https://huggingface.co/google/gemma-3-1b-it
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
