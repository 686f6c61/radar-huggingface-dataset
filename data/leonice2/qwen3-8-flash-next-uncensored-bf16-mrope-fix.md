# leonice2/Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix

## Resumen

Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix es una versión modificada del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por el usuario leonice2 en Hugging Face. Se trata de un build en precisión completa BF16 que ha sido sometido a un proceso de *abliteration*, una técnica que elimina la dirección de rechazo del flujo residual del transformer, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaría. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 180 000 millones de parámetros totales, con atención híbrida, capacidades nativas de visión-lenguaje, modo de razonamiento flexible, soporte de tool calling y una cabeza MTP (multi-token prediction) para decodificación especulativa.

La relevancia de esta ficha radica en que se distribuye como pesos fuente en BF16, pensados para servir de base a cuantizaciones posteriores (FP8, MLX de 4/6/8 bits) y a fine-tuning adicional. El repositorio ocupa 360 GB e incluye la torre de visión y la cabeza MTP preservadas. El modelo está etiquetado para investigación en seguridad de IA y red-teaming, y su uso en producción exige capas adicionales de moderación por parte del integrador.

La licencia declarada es Apache 2.0, heredada del modelo base. Los idiomas soportados según la model card son inglés y chino. No se han publicado resultados de benchmarks en la información disponible, y el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida, torre de visión y cabeza MTP |
| Parametros totales | 179 999 981 459 (~180B) |
| Parametros activos | ~6B (según model card; se cita también 125B como cifra parcial no aclarada) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | BF16 (este repo); derivados FP8 block y MLX 4/6/8 bits |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con atención híbrida, diseñado para procesar entradas multimodales de imagen, vídeo y texto. La model card indica una configuración MoE de 512 expertos con top-10 de enrutamiento, aunque no se detalla el número exacto de parámetros activos por token más allá de la cifra aproximada de 6B. Incorpora una cabeza MTP (multi-token prediction) que habilita decodificación especulativa y acelera la generación. La torre de visión y la cabeza MTP se conservan intactas en este build.

Sobre el entrenamiento del modelo base no se aportan en la información disponible detalles sobre número de tokens, composición del dataset ni si hubo RLHF o DPO. La modificación introducida por el autor consiste en una abliteration: se calcula la dirección de rechazo en el espacio de activaciones y se ortogonaliza respecto al flujo residual, eliminando la tendencia del modelo a negarse a responder. El sufijo "MRoPE-Fix" sugiere una corrección en la implementación del RoPE multimodal, aunque no se documenta el detalle técnico del arreglo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento flexible (thinking mode configurable).
- Procesamiento de imagen y vídeo en pipelines image-text-to-text.
- Generación de código y matemáticas (el modelo base Qwen3.8 está orientado a tareas de razonamiento y código).
- Soporte de tool calling y function calling.
- Capacidades de agente y razonamiento multi-paso.
- Multilingüe limitado a inglés y chino según la model card.
- Decodificación especulativa mediante cabeza MTP.
- Ausencia de mecanismos de rechazo tras la abliteration: responde a solicitudes que el modelo original denegaría.

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: el modelo permite estudiar qué representaciones internas codifican la negativa a responder, comparando activaciones con el modelo base alineado.
- Red-teaming y evaluación de robustez: sirve como modelo "sin guardrails" para probar la eficacia de clasificadores de moderación, filtros de salida y sistemas de detección de contenido dañino antes de desplegar modelos alineados.
- Fine-tuning y post-entrenamiento: al distribuirse en BF16 con visión y MTP preservados, es la base recomendada para entrenar variantes especializadas (dominio médico, legal, seguridad) sin partir de pesos cuantizados.
- Cuantización y despliegue en hardware heterogéneo: los pesos fuente permiten generar versiones FP8 para GPUs de centro de datos y MLX de 4/6/8 bits para Apple Silicon, adaptando el coste de inferencia al hardware disponible.
- Análisis de documentos técnicos con imágenes: la combinación de contexto de 262K y torre de visión permite procesar manuales, planos o informes con figuras en una sola pasada.
- Automatización de tareas con agentes: el soporte de tool calling y razonamiento multi-paso permite construir pipelines que consultan APIs, ejecutan código y encadenan acciones, siempre con capas de moderación propias.
- Evaluación comparativa de alineación: útil para medir la degradación de capacidades tras la abliteration frente al modelo original en benchmarks de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 360 GB solo para pesos, más overhead de activaciones y caché KV; requiere múltiples GPUs de 80 GB (por ejemplo, 5-6 A100/H100 de 80 GB) o nodos con interconexión NVLink.
- Versiones cuantizadas: FP8 block reduce el peso a ~180 GB, viable en 3-4 GPUs de 80 GB; MLX de 8 bits (~180 GB) y 4 bits (~90 GB) permiten despliegue en Apple Silicon de gama alta con memoria unificada amplia.
- GPU recomendadas: H100 80GB, A100 80GB, H200 para BF16; para cuantizaciones agresivas, configuraciones multi-GPU consumer (RTX 4090 de 24 GB) solo mediante offloading o sharding extremo.
- No cabe en una única GPU consumer en BF16 ni en FP8.
- Opciones de despliegue: transformers (librería declarada), vLLM (la model card menciona serving con vLLM), y formatos MLX para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix | ~180B totales, ~6B activos | 262K | Apache 2.0 | Abliterated, visión, MTP, BF16 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales, ~6B activos | 262K | Apache 2.0 | Modelo original alineado, con rechazos |
| Qwen3.8-Flash-Next-Uncensored-FP8 | ~180B totales, ~6B activos | 262K | Apache 2.0 | Derivado cuantizado FP8 del mismo autor |
| Qwen3.8-Flash-Next-Uncensored-MLX | ~180B totales, ~6B activos | 262K | Apache 2.0 | Derivado MLX 4/6/8 bits para Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la alineación de seguridad: el modelo cumplirá solicitudes dañinas, ilegales u ofensivas que el modelo original rechazaría. No debe desplegarse a usuarios finales sin moderación propia.
- Riesgo elevado de alucinación y de generar contenido sensible; no hay garantías de veracidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El contexto de 262K implica un coste de memoria KV significativo; en configuraciones multi-GPU hay que planificar el sharding.
- La model card incluye contenido promocional de terceros (OrcaRouter) que no constituye documentación técnica del modelo.
- El repositorio no tiene descargas ni validación comunitaria; la reproducibilidad de la abliteration y del "MRoPE-Fix" no está verificada de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero el integrador asume toda la responsabilidad legal sobre los outputs.
- No se documentan sesgos específicos más allá de los inherentes al corpus de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonice2/Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter (promocionado en la model card): https://www.orcarouter.ai
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- GitHub de Continuum-AI-Corp: https://github.com/Continuum-AI-Corp
- Discord de OrcaRouter: https://discord.gg/yAh6Tex6kx
- Perfil en X de OrcaRouter: https://x.com/OrcaRouter
