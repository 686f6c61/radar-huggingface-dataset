# psephos/yuevei-9b-abliterated

## Resumen

yuevei-9b-abliterated es un modelo de lenguaje de 9.409.813.744 parámetros publicado por el usuario psephos en Hugging Face, derivado del checkpoint empero-ai/Qwythos-9B-v2, que a su vez se construye sobre la arquitectura híbrida Qwen 3.5 de 9B (GatedDeltaNet de atención lineal combinada con atención completa con compuertas). El modelo se ha sometido a un proceso de "abliteration" (ortogonalización de la dirección de rechazo en los pesos) seguido de un ajuste fino con LoRA para recuperar capacidades, orientado a eliminar los mecanismos de rechazo integrados del modelo base.

La relevancia de esta ficha es doble: por un lado documenta una técnica concreta de modificación de pesos (abliteration con preservación de norma y biproyección) aplicada a una arquitectura híbrida poco habitual; por otro, advierte de que el resultado es un modelo sin filtros de seguridad, con licencia Apache 2.0, publicado el 25 de noviembre de 2026 y con cero descargas y cero likes en el momento de la consulta. El repositorio ocupa 18,8 GB y los pesos están en bfloat16 safetensors.

El modelo conserva el modo de razonamiento `<think>` del linaje Qwen 3.5 y está etiquetado como image-text-to-text en Hugging Face (se carga con `AutoModelForImageTextToText`), aunque la model card no detalla módulos de visión ni datos multimodales de entrenamiento. El idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida 9B (`Qwen3_5GatedDeltaNet` + Gated Attention) |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en bfloat16; conversión a GGUF mencionada como opción vía llama.cpp; no se documentan cuantizaciones oficiales |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16, `max_shard_size=4GB`) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Qwen 3.5 de 9B, descrita en la model card como un stack híbrido 3:1 de capas con GatedDeltaNet (atención lineal) y atención completa con compuertas, con 32 capas de decodificador y modo de razonamiento `<think>` de cadena de pensamiento. Sobre este checkpoint se aplicó una abliteration con ortogonalización biproyectada y preservación de norma en todas las proyecciones que escriben en el residual: `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`. El modo de operación fue `per_layer` con ventana de capas de 0,15 a 0,95 y ponderación uniforme, cubriendo ambos modos de pensamiento. La dirección de rechazo se calculó con 128 pares contrastivos de `mlabonne/harmful_behaviors` frente a `mlabonne/harmless_alpaca`. Se modificaron 27 de las 32 capas (índices 4 a 30) y 54 matrices de proyección; la mejor capa para la dirección de rechazo fue la 12 (SNR 3,4525) y la atenuación de la proyección de rechazo pasó de 2,7017 a 0,0229.

Tras la ortogonalización se ejecutó un ajuste fino LoRA sobre el checkpoint abliterado para corregir el desplazamiento de distribución y afinar el seguimiento de instrucciones y el razonamiento `<think>`. El dataset fue `mlabonne/FineTome-100k` con `max_samples=2000`, LoRA con r=32, alpha=64 y dropout=0,05 sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj` y `down_proj`. Se usó learning rate 1e-4 con scheduler coseno y warmup 0,05, batch efectivo 16, longitud máxima de secuencia 2048 y una época. No se empleó QLoRA de 4 bits; los adaptadores se fusionaron en pesos bfloat16. El entrenamiento duró 3092,34 s en una NVIDIA A100-SXM4-40GB, con 123 pasos globales, pérdida final de entrenamiento 0,6499 y pérdida de evaluación 0,6172. Los parámetros entrenables fueron 80.216.064 de 9.490.029.808 (0,85 %).

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Razonamiento explícito mediante el modo `<think>` heredado de Qwen 3.5.
- Seguimiento de instrucciones reforzado por el ajuste fino LoRA posterior a la abliteration.
- Carga como modelo multimodal (`AutoModelForImageTextToText`) según la etiqueta y el ejemplo de la model card; las capacidades de visión concretas no están documentadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multiturno: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Ausencia sustancial de mecanismos de rechazo integrados (efecto buscado de la abliteration).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto de estudio para medir cuánto se reduce la tasa de rechazo tras la ortogonalización y cómo afecta el ajuste fino de recuperación a las capacidades benignas, usando la perplejidad benigna de 11,652 como referencia.
- Evaluación de técnicas de abliteration en arquitecturas híbridas: permite comparar la ortogonalización sobre atención lineal (`linear_attn.out_proj`) frente a atención softmax clásica, un caso poco cubierto en la literatura porque en Qwen 3.5 el 75 % de las capas no son de atención softmax.
- Generación de texto creativo sin filtros en entornos controlados: escritura de ficción, guiones o material narrativo con temáticas sensibles, donde los rechazos del modelo base resultan un obstáculo, siempre con revisión humana posterior.
- Red teaming y pruebas de robustez: generación de prompts adversarios y respuestas sin censura para alimentar pipelines de evaluación de filtros de entrada/salida en productos propios.
- Destilación y generación de datos sintéticos: producción de pares instrucción-respuesta en inglés para entrenar modelos más pequeños, con la advertencia de que el contenido debe filtrarse antes de su uso.
- Despliegue local de investigación en una sola GPU: con 9,41 B de parámetros en bfloat16 cabe en GPUs de 24 GB o más tras cuantización, lo que permite experimentar con el modo `<think>` en hardware de una sola tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de verificación posteriores al entrenamiento:

| Métrica | Valor |
|---|---|
| Perplejidad benigna en held-out | 11,652 |
| Ratio medio de repetición de 4-gramas | 0,0309 |
| Logits NaN / Inf detectados | No |
| Generaciones de muestra verificadas | 4 |
| Pérdida final de entrenamiento | 0,6499 |
| Pérdida de evaluación | 0,6172 |
| Pasos globales | 123 |
| Tiempo de entrenamiento | 3092,34 s (A100-SXM4-40GB) |

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 18,8 GB solo de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- GPU de entrenamiento documentada: NVIDIA A100-SXM4-40GB (39,49 GB de VRAM) para el pipeline completo de abliteration y LoRA.
- GPU recomendadas para inferencia: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización para dejar margen.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantización de 8 bits o inferior; en bfloat16 completo queda muy ajustado y probablemente requiera offloading.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` o `AutoModelForCausalLM`), conversión a GGUF vía llama.cpp (mencionada en la model card), y por extensión vLLM, TGI u Ollama si la arquitectura Qwen 3.5 está soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| psephos/yuevei-9b-abliterated | 9,41 B | no disponible | apache-2.0 | publicado, 0 descargas |
| empero-ai/Qwythos-9B-v2 (base) | ~9 B (no confirmado) | no disponible | no disponible | modelo base del que deriva |
| Qwen 3.5 9B (linaje arquitectónico) | ~9 B | no disponible | no disponible | arquitectura de referencia citada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los mecanismos de rechazo integrados han sido sustancialmente reducidos o eliminados mediante abliteration; el modelo puede producir contenido dañino, sensible o inexacto ante prompts adecuados.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la ausencia de filtros de salida.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- El ajuste fino LoRA se realizó con solo 2000 muestras de FineTome-100k y una época, por lo que la recuperación de capacidades es limitada y podría no compensar del todo el desplazamiento de distribución de la abliteration.
- El modelo se publica con licencia Apache 2.0, pero el uso comercial exige verificar la licencia del modelo base empero-ai/Qwythos-9B-v2 y cumplir la legislación aplicable sobre contenido generado.
- Cualquier despliegue en producción o multiusuario debe incorporar moderación externa, filtros de entrada y salida, y registro de auditoría; la propia model card lo exige explícitamente.
- El repositorio no tiene descargas ni validación comunitaria, por lo que la calidad de los pesos no ha sido contrastada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psephos/yuevei-9b-abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Dataset de comportamientos dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de instrucciones benignas: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de ajuste fino: https://huggingface.co/datasets/mlabonne/FineTome-100k
