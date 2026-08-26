# lribeiro/Qwen3.8-27B-Pessoa-5090

## Resumen

Qwen3.8-27B-Pessoa-5090 es una cuantización mixta de precisión INT del modelo vision-language Qwen/Qwen3.8-27B, realizada con AutoRound y publicada en formato `compressed-tensors` para su uso directo con vLLM. El autor, lribeiro, ha diseñado este checkpoint específicamente para ajustarse a la memoria de una NVIDIA RTX 5090 (32 GB), aplicando una estrategia de tres niveles: INT4 en las capas MLP tempranas, INT5 en las tardías e INT6 en todas las proyecciones de atención, manteniendo en BF16 el encoder visual, el head MTP, las embeddings y las proyecciones recurrentes de la atención lineal. El resultado es un checkpoint de 22,59 GB, 2,46 veces más pequeño que el original en BF16, con una pérdida de fidelidad mínima (KLD de 0,00397 nats y acuerdo top-1 del 97,64 %).

El modelo base Qwen3.8-27B es un VLM híbrido de 27,79 mil millones de parámetros que combina 48 capas de atención lineal (GatedDeltaNet) con 16 capas de atención completa, un encoder visual ViT de 27 capas y un head MTP para decodificación especulativa. Su ventana de contexto nativa es de 262 144 tokens, ampliable hasta 1 millón. Esta cuantización mantiene intactas todas las capacidades del modelo original (visión, lenguaje, razonamiento, código y agentes) a la vez que lo hace ejecutable en una GPU consumer de gama alta, lo que la convierte en una opción relevante para desarrolladores que necesitan desplegar un VLM de 27B con contexto largo en hardware asequible.

La relevancia actual de este checkpoint radica en que aborda el problema práctico de ejecutar modelos grandes en GPUs de consumo sin sacrificar calidad. Mientras que las cuantizaciones FP8 o NVFP4 requieren soporte nativo de Blackwell, esta versión INT mixta aprovecha los kernels de AutoRound y vLLM para ofrecer una alternativa de peso solo (weight-only) con activaciones en BF16, lo que elimina el error de cuantización de activaciones y mantiene la precisión en las partes más sensibles del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (VLM híbrido: vision encoder ViT + language model con 48 capas linear-attention GatedDeltaNet y 16 capas full-attention + head MTP) |
| Parametros totales | 27 781 427 952 (27,79 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (max_position_embeddings), extensible a 1M segun vLLM Recipes |
| Tipos de cuantizacion | INT4 W4A16 (MLP capas 0-31, g64, simetrico), INT5 W5A16 (MLP capas 32-63, g64, simetrico), INT6 W6A16 (atención completa y lineal, g128, simetrico); weight-only, activaciones en BF16 |
| Idiomas soportados | Multilingue (segun tags del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (7 shards) en formato compressed-tensors (pack-quantized), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5 y presenta una arquitectura híbrida de atención: 48 de las 64 capas del language model utilizan atención lineal (GatedDeltaNet) con estado recurrente, mientras que las 16 restantes (cada cuarta capa: 0, 4, 8, ..., 60) emplean atención completa con 24 cabezas de 256 dimensiones. El tamaño oculto es de 5 120, el intermedio de 17 408, y la activación es SiLU (SwiGLU). El modelo incluye un encoder visual ViT de 27 capas (hidden size 1 152, patch size 16, 16 cabezas) que procesa imágenes y vídeo, y un head MTP de una capa con 3 tokens especulativos para decodificación especulativa. El vocabulario alcanza 248 320 tokens.

La cuantización se realizó con AutoRound 0.14.2, utilizando 200 iteraciones y 181 contextos de calibración de 2 048 tokens cada uno, extraídos del dataset `malaiwah/qwen38-27b-fidelity-suite-v3`. La estrategia de precisión mixta asigna INT4 a las capas MLP tempranas (0-31), INT5 a las tardías (32-63) e INT6 a todas las proyecciones de atención (self-attn y linear-attn), con tamaños de grupo de 64 y 128 respectivamente. Las activaciones no se cuantizan (weight-only), por lo que los pesos se des-cuantizan a BF16 en el límite del kernel. Los módulos sensibles como el encoder visual, el head MTP, `lm_head`, embeddings, proyecciones recurrentes (`in_proj_a`, `in_proj_b`), normalizaciones, `conv1d` y factores de escala se mantienen en BF16. El checkpoint resultante pesa 22,59 GB y se distribuye en 7 shards safetensors.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y vídeo junto con texto, gracias al encoder visual ViT integrado.
- Razonamiento complejo y matemáticas: hereda las capacidades del modelo base Qwen3.8-27B, que destaca en tareas de razonamiento, investigación y trabajo profesional.
- Generación de código: soporte para múltiples lenguajes de programación, con mejoras sustanciales en tareas de codificación según la documentación del modelo base.
- Tool calling y function calling: el modelo base soporta invocación de herramientas, lo que permite integrarlo en pipelines de agentes.
- Capacidades de agente y razonamiento multi-paso: diseñado para tareas de largo horizonte (long-horizon agentic tasks), según la documentación oficial.
- Multilingüe: soporta múltiples idiomas (etiqueta `multilingual` en el modelo base).
- Decodificación especulativa MTP: el head MTP integrado permite acelerar la generación con vLLM, usando 3 tokens especulativos.
- Atención lineal híbrida: las capas GatedDeltaNet reducen el coste de atención en contextos largos, manteniendo la calidad de la atención completa en capas selectas.

## Casos de uso

- Despliegue local de un VLM de 27B en una RTX 5090: el checkpoint de 22,59 GB cabe en los 32 GB de VRAM con margen para KV cache y decodificación especulativa, permitiendo ejecutar un modelo de nivel profesional en una estación de trabajo de consumo.
- Asistente de análisis de documentos con imágenes: gracias a su ventana de 262K tokens y al encoder visual, puede procesar documentos largos con figuras, tablas y gráficos en una sola pasada, manteniendo el contexto completo.
- Generación de código asistida en entornos de desarrollo: con soporte de tool calling y razonamiento multi-paso, puede integrarse en IDE o pipelines de CI/CD para autocompletar, revisar y refactorizar código.
- Agente conversacional multilingüe de atención al cliente: la combinación de contexto largo, capacidades multilingües y generación fluida permite gestionar conversaciones multi-turno con historial extenso sin perder coherencia.
- Investigación académica y análisis de literatura científica: el modelo puede resumir, comparar y extraer conclusiones de corpus extensos de artículos, aprovechando el contexto de 262K tokens.
- Prototipado de aplicaciones de visión-lenguaje en hardware limitado: al ser una cuantización weight-only con activaciones BF16, es adecuado para experimentar con VLM en GPUs consumer sin necesidad de infraestructura de centro de datos.
- Inferencia de baja latencia con decodificación especulativa: el head MTP permite acelerar la generación en vLLM, útil para aplicaciones interactivas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la cuantización sobre el conjunto de validación de 278 392 posiciones:

| Metrica | Valor |
|---|---|
| KLD (divergencia KL) | 0,00397 nats |
| Acuerdo top-1 con el modelo BF16 | 97,64 % |
| Tamano del checkpoint | 22,59 GB (2,46× menor que BF16) |

Estas métricas indican una pérdida de calidad mínima respecto al modelo original, pero no permiten comparar directamente con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 22,59 GB en disco. En inferencia, con KV cache en BF16 y decodificación especulativa, cabe en una GPU de 32 GB (RTX 5090) con margen para contexto largo.
- GPU recomendadas: NVIDIA RTX 5090 (Blackwell SM120) como objetivo principal; también compatible con otras GPUs Blackwell que soporten kernels INT (sm120). No se garantiza rendimiento óptimo en arquitecturas anteriores.
- Compatibilidad con GPUs consumer: sí, específicamente RTX 5090 de 32 GB. No cabe en GPUs de 24 GB o menos sin reducir contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: vLLM con backend FlashInfer, usando el formato compressed-tensors. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Se espera que la decodificación especulativa MTP (3 tokens) mejore el throughput respecto a generación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano checkpoint | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,79 B | 262K (ext. 1M) | BF16 | ~55,6 GB | Apache-2.0 | Modelo original, requiere GPU de datacenter o multiples GPUs |
| lribeiro/Qwen3.8-27B-Pessoa-5090 (este) | 27,79 B | 262K (ext. 1M) | INT4/INT5/INT6 mixto | 22,59 GB | Apache-2.0 | Optimizado para RTX 5090, weight-only, MTP |
| lribeiro/Qwen3.8-27B-FP8-Pessoa | 27,79 B | 262K (ext. 1M) | FP8 weight-only | No disponible | Apache-2.0 | Variante FP8 del mismo autor, también orientada a RTX 5090 |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks estandarizados para establecer comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- La cuantización mixta, aunque mantiene una alta fidelidad (97,64 % de acuerdo top-1), puede introducir errores sutiles en tareas que dependen de la precisión numérica extrema, como matemáticas avanzadas o razonamiento lógico de múltiples pasos.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas como MMLU, HumanEval o GSM8K no está verificado de forma independiente.
- El checkpoint está optimizado para RTX 5090 (Blackwell SM120). En GPUs de arquitecturas anteriores (Ampere, Ada Lovelace) los kernels INT podrían no estar disponibles o rendir peor, y no se garantiza compatibilidad.
- La ventana de contexto de 262K tokens es la nativa del modelo base, pero el uso de contexto muy largo (cercano al máximo) aumentará el consumo de VRAM para KV cache, reduciendo el margen disponible en la RTX 5090.
- El modelo es una cuantización de un modelo base; no se ha realizado ningún ajuste fino adicional. Por tanto, hereda los sesgos y limitaciones del Qwen3.8-27B original, incluyendo posibles alucinaciones en dominios especializados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de las herramientas de cuantización utilizadas (AutoRound).
- No se proporcionan métricas de latencia ni throughput, por lo que el rendimiento en producción debe validarse empíricamente antes de un despliegue crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lribeiro/Qwen3.8-27B-Pessoa-5090
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8 del mismo autor: https://huggingface.co/lribeiro/Qwen3.8-27B-FP8-Pessoa
- Guia de seleccion de cuantizaciones para RTX 5090 (foro Level1Techs): https://forum.level1techs.com/t/qwen-3-8-quant-selection-guide-for-rtx-5090/254095
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Tutorial de ejecucion local en RTX 5090 (DataCamp): https://www.datacamp.com/pt/tutorial/how-to-run-qwen3-8-27b-locally
- Herramienta de cuantizacion AutoRound: https://github.com/intel/auto-round
