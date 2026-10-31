# LiquidAI/LFM3-1.7B-FP8

## Resumen

LFM3-1.7B-FP8 es la versión cuantizada en FP8 del modelo LFM3-1.7B de Liquid AI, una familia de modelos de lenguaje de tamaño reducido orientada a inferencia eficiente en GPU. El modelo base pertenece a la tercera generación de la arquitectura LFM (Liquid Foundation Models), y esta variante comprime los pesos de atención y de las capas feed-forward a FP8 con bloques de 128×128 y cuantización dinámica de activaciones, manteniendo embeddings, cabeza de salida, convoluciones, attention gates y normalizaciones en BF16.

El problema que resuelve es claro: ofrecer un modelo pequeño (1,73 mil millones de parámetros) con una huella de memoria mínima (el repositorio ocupa 2,2 GB) para despliegues en GPU donde el coste por token y la latencia son críticos. La cuantización FP8 nativa permite aprovechar GPUs modernas (Hopper y posteriores) sin pérdida apreciable de calidad, algo especialmente relevante en modelos pequeños donde cada bit cuenta.

La ficha técnica original remite a la model card de LFM3-1.7B, e indica que el modelo usa ventanas deslizantes (sliding window) y RoPE sin cambios respecto al modelo base. La integración con SGLang está en proceso de revisión, lo que sugiere que se trata de un lanzamiento muy reciente. La licencia es "lfm1.0", una licencia propia de Liquid AI distinta de las licencias abiertas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (hybrid, con sliding window attention y RoPE); detalle completo no disponible |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (bloques 128×128, cuantización dinámica de activaciones); embeddings, output head, convoluciones, attention gates y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, "other") |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

LFM3-1.7B-FP8 deriva directamente de LFM3-1.7B, sin modificar la arquitectura: según la model card, las configuraciones de sliding window attention y RoPE se mantienen intactas respecto al modelo base. La familia LFM de Liquid AI se caracteriza por arquitecturas híbridas que combinan operadores distintos del transformer puro (la primera generación usaba células líquidas tipo LTC inspiradas en dinámicas de sistemas continuos), aunque la model card no detalla la composición exacta de LFM3.

La cuantización es el elemento técnico destacable de esta variante: los pesos de las capas feed-forward y de atención se almacenan en FP8 con una granularidad por bloques de 128×128, mientras que la cuantización de activaciones es dinámica (se calcula en tiempo de inferencia). Los componentes sensibles a la precisión —embeddings, la cabeza de salida (lm_head), las convoluciones, los attention gates y las capas de normalización— permanecen en BF16, una estrategia habitual para minimizar la degradación de calidad en modelos pequeños.

No se ha publicado información sobre el corpus de entrenamiento, el número de tokens ni el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Modo de razonamiento (thinking): el comando de lanzamiento en SGLang usa `--reasoning-parser qwen3-thinking`, lo que indica soporte de salidas con razonamiento explícito estilo Qwen3.
- Uso como modelo base o chat en frameworks compatibles con transformers y compressed-tensors.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; el pipeline es exclusivamente text-generation.

## Casos de uso

- Chatbots ligeros en GPU: con 2,2 GB de pesos FP8, el modelo cabe con holgura en GPUs de consumo y de gama media, ideal para asistentes conversacionales con bajo presupuesto de VRAM.
- Servicios de inferencia de alto throughput: la cuantización FP8 nativa está pensada para servidores tipo SGLang en GPUs con soporte FP8 (H100, H200), maximizando tokens/segundo por dólar.
- Prototipado y demos locales: su tamaño reducido permite iterar rápidamente en portátiles con GPU dedicada o estaciones de trabajo sin infraestructura cloud.
- Razonamiento con cadena de pensamiento en tareas ligeras: el soporte de reasoning parser permite desplegar flujos de multi-step reasoning en un modelo de solo 1,7 B de parámetros.
- Integración en pipelines de procesamiento de texto (clasificación, extracción, resumen) donde el coste por token es el factor dominante y un modelo grande sería un desperdicio.
- Fine-tuning posterior en dominios concretos: al partir de un modelo base pequeño, el ajuste fino con LoRA o QLoRA es viable en una sola GPU de consumo.
- Edge y on-premise con requisitos de privacidad: el despliegue local evita enviar datos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,2 GB en FP8; con overhead de KV cache y activaciones, unos 4-6 GB de VRAM son razonables para contextos moderados (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU moderna con soporte FP8 (NVIDIA H100, H200, RTX 4090, RTX 5090) para aprovechar la cuantización nativa; en GPUs sin soporte FP8 el modelo puede requerir dequantización o no ser compatible según el runtime.
- Consumer GPUs: sí, cabe con holgura en GPUs de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), sujeto a compatibilidad de software con FP8.
- Despliegue: SGLang (soporte en revisión en sgl-project/sglang#46858); transformers con compressed-tensors; compatibilidad con vLLM, llama.cpp u Ollama no confirmada en la información disponible (el formato FP8 compressed-tensors apunta a runtimes GPU, no a GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|
| LFM3-1.7B-FP8 | 1,73 B | FP8 nativo (bloques 128×128) | no disponible | lfm1.0 (propietaria) |
| Qwen3-1.7B | 1,7 B | BF16 (variantes GGUF/AWQ de la comunidad) | no disponible en esta ficha | Apache 2.0 |
| LFM2-1.2B (Liquid AI) | 1,2 B | BF16 | no disponible en esta ficha | Licencia propia LFM |

En comparación con Qwen3-1.7B, el modelo de Liquid AI apuesta por la cuantización FP8 nativa y una arquitectura híbrida propia, mientras que Qwen3 ofrece una licencia Apache 2.0 más permisiva y un ecosistema de despliegue más maduro. Respecto a LFM2-1.2B de la misma casa, LFM3-1.7B es la generación posterior y de mayor tamaño, presumiblemente con mejores capacidades a costa de más recursos. La comparativa cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia lfm1.0: al tratarse de una licencia propia ("other"), hay que revisar sus términos antes de cualquier uso comercial; no es Apache ni MIT, y puede incluir restricciones de uso.
- Soporte de ecosistema limitado: la integración con SGLang está todavía en revisión, y no hay confirmación de soporte en vLLM, llama.cpp u Ollama, lo que restringe las opciones de despliegue a corto plazo.
- Requiere GPU con soporte FP8 para aprovechar la cuantización; en hardware sin FP8 la variante puede no ser utilizable y convendría usar el modelo base en BF16.
- La cuantización FP8 puede introducir una ligera degradación respecto al modelo BF16 original, especialmente en tareas de razonamiento fino, aunque el esquema por bloques y la preservación de componentes críticos en BF16 lo mitigan.
- Longitud de contexto, idiomas soportados y capacidades de tool calling: no disponibles en la información publicada; verificar en la model card del modelo base antes de producción.
- Riesgo de alucinación y sesgos: inherentes a cualquier LLM; no se han publicado evaluaciones específicas de sesgo para este modelo.
- Uso de custom_code en transformers: revisar el código remoto antes de ejecutarlo en entornos de producción.

## Enlaces

- Modelo FP8: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación oficial: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
- Pull request de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
