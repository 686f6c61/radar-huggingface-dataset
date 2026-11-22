# Outlier-Ai/Outlier-10B

## Resumen

Outlier-10B es un checkpoint de investigación publicado por Outlier-Ai, construido como un adaptador sobre Qwen/Qwen2.5-7B-Instruct. A pesar del nombre "10B", el modelo base es un transformer denso de 7B parámetros al que se le superpone una capa de mezcla de expertos (MoE) con pesos ternarios cuantizados, lo que da lugar a una arquitectura híbrida de tipo "overlay" orientada a inferencia local, eficiencia energética y despliegue en dispositivos de borde (edge-ai), con especial atención a Apple Silicon.

El modelo resuelve el problema de obtener capacidades de razonamiento y generación de texto de un modelo de 7B con un coste computacional reducido gracias a la esparsidad del MoE y a la cuantización ternaria, manteniendo el soporte multilingüe del Qwen2.5 original (15 idiomas declarados). Su relevancia actual es limitada: la propia model card lo describe como un artefacto de investigación "superseded" (reemplazado) que precede a la línea Outlier v1.8, no se distribuye en la aplicación comercial y sus cifras proceden de experimentos internos, no de tests de release.

La información pública disponible es escasa y parcial: el repositorio ocupa 60,9 GB, acumula 575 descargas y 2 likes, y la model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. Cualquier evaluación de producción debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B-Instruct) con overlay de mezcla de expertos (MoE) y pesos ternarios cuantizados |
| Parametros totales | No disponible (denominación comercial "10B"; el modelo base es de 7B) |
| Parametros activos | No disponible (arquitectura MoE con esparsidad declarada, sin ratio especificado) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | Ternaria (declarada en tags); variantes MLX-4bit en la línea Outlier, no confirmadas para este checkpoint |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 60,9 GB |

## Arquitectura y entrenamiento

Outlier-10B parte de Qwen/Qwen2.5-7B-Instruct y añade un adaptador de tipo overlay con mezcla de expertos y pesos ternarios. La model card describe el resultado como "outlier_moe" con esparsidad, orientado a reducir el coste computacional y energético en inferencia local. No se especifica el número de expertos, el ratio de activación ni la topología exacta del MoE.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o destilación. La model card advierte explícitamente que las afirmaciones técnicas de revisiones anteriores de la ficha deben considerarse provisionales y que el checkpoint puede contener adaptadores u overlays experimentales que no llegaron al producto comercial. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con ejemplos en la model card de problemas aritméticos, lógica tipo grid y problemas de palabras.
- Razonamiento matemático básico y resolución de acertijos lógicos (widgets, trenes, asignación de mascotas).
- Capacidades multilingües en 15 idiomas, heredadas del Qwen2.5-7B-Instruct base.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá de los ejemplos de razonamiento paso a paso.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Prototipado de razonamiento local en Apple Silicon: el modelo está etiquetado para macOS y cuantización ternaria, lo que permite experimentar con inferencia en equipos de sobremesa sin GPU dedicada, aunque su estado de investigación lo hace apto solo para pruebas.
- Investigación sobre MoE y cuantización ternaria: sirve como artefacto reproducible para estudiar overlays de expertos sobre un transformer denso de 7B y comparar el impacto en precisión frente al modelo base.
- Evaluación comparativa de eficiencia energética: al estar orientado a edge-ai, puede usarse en experimentos que midan consumo y latencia frente a Qwen2.5-7B-Instruct sin overlay.
- Generación de texto multilingüe de bajo coste: para prototipos en 15 idiomas donde el coste computacional sea crítico y no se requiera máxima calidad.
- Resolución de problemas lógicos y matemáticos sencillos en entornos educativos o de demostración, gracias a los ejemplos de razonamiento paso a paso incluidos en la model card.
- Reproducibilidad histórica: útil para replicar experimentos de la línea Outlier previa a v1.8 y documentar la evolución de la familia.
- No recomendado para producción: la propia model card indica que está reemplazado y no se distribuye en la aplicación comercial.

## Benchmarks y rendimiento

| Benchmark | Outlier-10B | Notas |
|---|---|---|
| MMLU 5-shot (accuracy) | 70,87 | Dato declarado por el autor; no verificado (`verified: false`) |

No se han publicado otros resultados de benchmarks en la información disponible. La model card advierte que las cifras proceden de experimentos internos y no de los tests de release oficiales, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repo ocupa 60,9 GB, lo que sugiere pesos en precisión alta o múltiples variantes; una cuantización ternaria o de 4 bits reduciría sustancialmente el requisito, pero no se documenta el tamaño efectivo.
- GPU recomendadas: no especificadas. El etiquetado apunta a Apple Silicon (macOS) como plataforma objetivo, sin confirmar GPUs NVIDIA concretas.
- Compatibilidad con GPU de consumo: probable en equipos Apple Silicon con memoria unificada suficiente, dado el enfoque on-device; no confirmado para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: transformers (librería declarada); MLX es plausible por la línea Outlier, pero no confirmado para este checkpoint. vLLM, llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-10B | No disponible (base 7B + overlay MoE) | No disponible | 70,87 (5-shot, no verificado) | Apache 2.0 | Checkpoint de investigación, reemplazado |
| Qwen2.5-7B-Instruct | 7B | 32K (según ficha oficial de Qwen) | No disponible en esta información | Apache 2.0 | Producción, ampliamente adoptado |
| Outlier Core 27B | No disponible | No disponible | No disponible | No disponible | Tier actual de Outlier v1.8 (MLX-4bit) |
| Outlier Nano 4B | No disponible | No disponible | No disponible | No disponible | Tier de entrada actual (MLX-4bit) |

La comparación con Qwen2.5-7B-Instruct es la más directa por ser su modelo base, pero no se dispone de cifras de MMLU del original en la información proporcionada para contrastar la ganancia o pérdida del overlay.

## Limitaciones y advertencias

- Checkpoint de investigación reemplazado: la model card indica explícitamente que no es la descarga recomendada y que precede a la línea v1.8.
- Cifras no verificadas: el resultado de MMLU (70,87) está marcado como `verified: false` y procede de experimentos internos, no de tests de release.
- Falta de documentación técnica: no se especifican número de expertos, ratio de activación, tokens de entrenamiento ni composición del dataset.
- Riesgo de alucinación: inherente a los modelos de 7B; no se documentan mitigaciones específicas.
- Sesgos: no documentados; se heredan los del modelo base Qwen2.5-7B-Instruct.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada y el rendimiento en los 15 idiomas declarados no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías, su uso en producción no está respaldado por el autor.
- Posible contenido experimental: la model card advierte que puede incluir adaptadores u overlays que no llegaron al producto.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sitio oficial de Outlier: https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Plataforma Outlier AI: https://outlier.ai/
