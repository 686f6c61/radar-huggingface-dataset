# fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, un modelo de lenguaje pequeño de 86 millones de parámetros basado en la arquitectura GPT-2. Ha sido entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, y forma parte de una serie de experimentos denominados "ppt-art-lang" que exploran el comportamiento de modelos de lenguaje en tareas de generación de texto multilingüe.

Este modelo concreto parece ser un baseline de 100 MB de tamaño (en referencia al tamaño del modelo base) con una semilla concreta (seed 455), orientado al idioma japonés (jpn). No se dispone de información sobre la licencia, los idiomas soportados ni el contexto de entrenamiento más allá de los datos de la model card. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo pequeño sobre un corpus específico, útil para estudiar el impacto del ajuste en modelos de tamaño reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.416.128 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere japones, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `goldfish-models/eng_latn_100mb`, que a su vez es un modelo GPT-2 de 86M parámetros entrenado sobre texto en inglés latino. El proceso de ajuste se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (Transformers Reinforcement Learning) en su versión 0.23.0, con Transformers 4.56.2 y PyTorch 2.5.1. La model card indica que el entrenamiento se visualiza en Weights & Biases, pero no se proporcionan detalles sobre el dataset, el número de tokens, la duración del entrenamiento ni las técnicas de optimización empleadas.

La arquitectura subyacente es un transformer decoder estándar de GPT-2, sin innovaciones adicionales conocidas. Al ser un modelo pequeño, es adecuado para experimentos de investigación donde se busca entender el comportamiento de modelos compactos en tareas específicas.

## Capacidades

- Generación de texto autoregresiva, como corresponde a un modelo GPT-2.
- Capacidad de seguir instrucciones básicas en formato de chat (según el ejemplo de uso en la model card, que usa `pipeline` con roles de usuario).
- No se conocen capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El nombre del modelo sugiere que fue entrenado para trabajar con texto en japonés, aunque no se confirma oficialmente.
- Al ser un modelo pequeño (86M), su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes.

## Casos de uso

- Investigación académica: el modelo sirve como baseline en estudios sobre el efecto del fine-tuning en modelos pequeños, especialmente en el contexto de transferencia entre idiomas (inglés a japonés).
- Experimentos de generación de texto controlada: puede utilizarse para probar pipelines de generación con `transformers` en entornos de desarrollo, gracias a su pequeño tamaño que permite ejecución en hardware modesto.
- Pruebas de integración: al ser compatible con la librería `transformers` y con `text-generation-inference`, puede emplearse para validar despliegues en infraestructuras de inferencia como FriendliAI.
- Educación y formación: sirve como ejemplo práctico de fine-tuning con TRL, mostrando el flujo completo desde un modelo base hasta un modelo ajustado.
- Comparación de semillas y variantes: junto con otros modelos de la misma familia (diferentes semillas o tamaños), permite analizar la variabilidad de los resultados según la inicialización aleatoria.
- Prototipado rápido: su pequeño tamaño permite iterar rápidamente en tareas de generación de texto sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras. El modelo parece ser un experimento de investigación sin evaluación estándar publicada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 86M parámetros, la inferencia en FP32 requiere aproximadamente 345 MB de memoria (86M * 4 bytes). Con cuantización a 8 bits, se reduciría a unos 86 MB, aunque no se dispone de archivos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en FP32. Una GPU de gama baja como NVIDIA GTX 1650 o incluso CPU es viable.
- Compatible con consumer GPU: sí, cualquier GPU moderna puede ejecutar este modelo sin problemas.
- Opciones de despliegue: al ser un modelo estándar de `transformers`, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama o mediante la API de FriendliAI.
- Latencia y throughput: al ser un modelo pequeño, la latencia es baja (del orden de milisegundos por token en GPU), aunque no se dispone de mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría (fine-tunes de GPT-2 de 86M). Los modelos de la familia Goldfish (como `goldfish-models/eng_latn_100mb`) son el punto de partida, pero no se conocen benchmarks comparativos. Otros modelos pequeños como GPT-2 Small (124M) o DistilGPT-2 (82M) podrían ser alternativas, pero no se dispone de datos de rendimiento para este modelo concreto.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo entrenado sobre un corpus específico (probablemente inglés y japonés), puede presentar sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo pequeño, es más propenso a generar contenido incoherente o falso en comparación con modelos más grandes.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, pero los modelos GPT-2 típicamente tienen 1024 tokens; no se confirma.
- Restricciones de licencia: la licencia no está disponible, lo que impide su uso comercial sin verificación previa.
- El modelo es un baseline de investigación y no está pensado para producción; su calidad de generación es limitada.
- No se dispone de información sobre el dataset de fine-tuning, lo que dificulta evaluar su idoneidad para tareas específicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455)
- [Modelo base en Hugging Face](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [Variante con semilla 3407 en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed3407)
- [Variante baseline sin 100mb en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline_seed3407)
- [Página del modelo en FriendliAI](https://friendli.ai/models/fpadovani/ppt-art-lang-jpn-baseline_seed3407)
- [Página de la variante 100mb en FriendliAI](https://friendli.ai/models/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed3407)
- [Modelo relacionado jpn-10mb-after-eng-baseline](https://huggingface.co/fpadovani/jpn-10mb-after-eng-baseline-ckpt500_seed3407)
- [Enlace al entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/0eec18iy)
