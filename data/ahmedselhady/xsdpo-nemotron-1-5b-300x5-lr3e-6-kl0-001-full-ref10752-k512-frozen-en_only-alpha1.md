# ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tune) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B de NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un experimento de investigación sobre SDPO (una variante de optimización de preferencias derivada de DPO con regularización KL), entrenado sobre un conjunto de datos denominado `macereason-math` con 300 pasos y 5 épocas, tal y como refleja el propio nombre del repositorio. El modelo conserva la arquitectura Qwen2 del modelo base y sus 1.777 millones de parámetros.

El interés de esta publicación es fundamentalmente metodológico: documenta una ejecución concreta de SDPO con hiperparámetros explícitos (learning rate 3e-6, coeficiente KL 0.001, ventana de referencia de 10752 tokens, k=512, congelado de la referencia y entrenamiento solo en inglés). No es un modelo pensado para producción ni para uso general, sino un artefacto reproducible para quienes estudian técnicas de alineación y razonamiento matemático en modelos pequeños.

La relevancia actual es limitada pero específica: sirve como referencia para comparar recetas de entrenamiento de razonamiento en modelos de 1.5B, un tamaño que cabe en GPU de consumo y permite iterar rápido. Al ser un checkpoint intermedio (paso 150) de una ejecución de investigación, su calidad final y su comportamiento no están validados de forma pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 (~1.78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; el nombre del run menciona ventana de referencia de 10752 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | inglés únicamente según el sufijo `en_only` del run; lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 1.78B parámetros, heredado íntegramente de nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. No se introduce ninguna modificación arquitectónica: el ajuste es puramente de pesos mediante SDPO, una variante de optimización de preferencias con anclaje KL al modelo de referencia. El nombre del run indica que la referencia se mantiene congelada (`frozen`), con coeficiente KL 0.001, learning rate 3e-6, `k=512` y una ventana de referencia de 10752 tokens.

El dataset de entrenamiento es `macereason-math`, orientado a razonamiento matemático y restringido a inglés (`en_only`). La ejecución consta de 300 pasos por 5 épocas y el repositorio publica checkpoints intermedios; esta revisión concreta corresponde al paso 150 y la rama principal apunta al último paso publicado. No hay información pública sobre el volumen de tokens, la composición exacta del dataset ni sobre fases adicionales de RLHF o DPO más allá del propio SDPO.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational`).
- Razonamiento matemático y de varios pasos, heredado del modelo base de NVIDIA orientado a reasoning.
- Generación de código y resolución de problemas algorítmicos (capacidad del modelo base, no verificada en este checkpoint).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y multi-step reasoning: presumibles por el modelo base, sin validación pública en este fine-tune.
- Multilingüe: no; el run está etiquetado como `en_only`.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en alineación: reproducir y comparar la receta SDPO (lr 3e-6, KL 0.001, referencia congelada) frente a DPO estándar en un modelo de 1.5B, usando los checkpoints publicados por paso.
- Estudio de razonamiento matemático en modelos pequeños: evaluar cómo evoluciona la precisión en problemas tipo GSM8K a lo largo de los pasos 150 y posteriores del entrenamiento.
- Ablaciones de hiperparámetros: el nombre del run expone todos los parámetros, lo que facilita comparar contra otras ejecuciones del mismo autor con distintas configuraciones.
- Prototipado de pipelines de evaluación: servir el modelo con transformers o TGI (etiqueta `text-generation-inference` y `endpoints_compatible`) para montar un banco de pruebas de razonamiento.
- Fine-tuning posterior con datos propios: al ser un modelo de 1.78B en safetensors, sirve como punto de partida barato para ajustes específicos de dominio en inglés.
- Docencia y formación: ilustrar el ciclo completo de un entrenamiento de preferencias con checkpoints intermedios y métricas de referencia en un modelo que cabe en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3.6 GB en FP16/BF16 (1.78B parámetros), ~1.8-2 GB en cuantización de 8 bits y ~1-1.2 GB en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con margen para el contexto; A100/H100 para servir en producción con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1.78B | no disponible | no disponible | Hugging Face, checkpoints por paso |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.5B | no disponible | no disponible | Hugging Face (modelo base) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k (según su card) | Apache 2.0 (según su card) | Hugging Face, ampliamente desplegado |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k (según su card) | MIT (según su card) | Hugging Face, muy usado en razonamiento |

La comparación de rendimiento no está disponible: este checkpoint no publica métricas y los datos de contexto y licencia del modelo base y del propio fine-tune no aparecen en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 150) de una ejecución de investigación; no hay garantía de que sea el estado final ni de que esté convergido.
- Solo inglés: el sufijo `en_only` restringe el entrenamiento a ese idioma y no hay evaluación multilingüe.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor y al modelo base de NVIDIA.
- Riesgo de alucinación y de razonamiento incorrecto propio de modelos de 1.5B, agravado por un ajuste de preferencias sobre datos matemáticos.
- Sin benchmarks públicos: no se puede comparar objetivamente con el modelo base ni con alternativas.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre del run sugiere una ventana de referencia de 10752 tokens, pero la longitud de contexto efectiva del modelo no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
