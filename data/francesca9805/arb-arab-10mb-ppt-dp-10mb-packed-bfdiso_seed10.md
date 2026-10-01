# francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base monolingüe `goldfish-models/arb_arab_10mb`, un transformer decoder-only de tipo GPT-2 con 39.087.104 parámetros (aproximadamente 39 millones). Lo publica el usuario de HuggingFace `francesca9805`, y el entrenamiento se ha realizado con la librería TRL (Transformer Reinforcement Learning) de HuggingFace mediante SFT, según se indica en la model card. El nombre del repositorio incluye referencias a "arb" y "arab" (árabe), coherentes con el modelo base, además de identificadores de configuración experimental ("ppt", "Dp-10mb-packed", "bfdiso", "seed10").

Se trata de un artefacto de investigación de escala muy reducida, con un tamaño de repositorio de 0,1 GB y cero descargas y cero "likes" en el momento de la ficha. No es un modelo destinado a producción generalista, sino una variante experimental dentro de una familia de experimentos de ajuste fino sobre modelos Goldfish, presumiblemente orientada a estudiar el efecto de distintas configuraciones de datos y semillas sobre modelos lingüísticos de bajos recursos.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de cómo ajustar modelos de 39M de parámetros con TRL y como punto de comparación frente a otras variantes del mismo autor (por ejemplo, las versiones con dataset de 100 MB). No dispone de datos públicos de benchmarks, idiomas declarados ni licencia explícita, por lo que su uso debe considerarse estrictamente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 (aproximadamente 39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No declarados en la model card; el modelo base `goldfish-models/arb_arab_10mb` es un modelo monolingüe de árabe |
| Licencia | No disponible (la model card incluye un campo placeholder `licence: license`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Modelo base | goldfish-models/arb_arab_10mb |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y el pipeline `text-generation`. Con 39,08 millones de parámetros, se sitúa muy por debajo del GPT-2 small original (124 M), lo que es coherente con la familia Goldfish, que entrena modelos monolingües compactos para cientos de idiomas a partir de corpus reducidos. El modelo parte del checkpoint `goldfish-models/arb_arab_10mb`, del que hereda la configuración de arquitectura y el tokenizador.

El ajuste fino se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El entrenamiento está registrado en un run de Weights & Biases del proyecto `new-tokenizers` de la Universidad de Groningen. El identificador del nombre del modelo sugiere el uso de un dataset empaquetado (packed) de 10 MB, aunque la model card no detalla ni el número exacto de tokens, ni la composición del corpus, ni si se aplicaron etapas posteriores de RLHF o DPO. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva básica, heredada de la arquitectura GPT-2 y del pipeline `text-generation`.
- Ajuste supervisado para seguir instrucciones o completar diálogos sencillos, según el formato de SFT empleado con TRL (la model card muestra un ejemplo con mensajes de rol `user`).
- Capacidad multilingüe: no declarada. El modelo base es monolingüe de árabe, por lo que es razonable esperar que el comportamiento esté dominado por ese idioma, sin confirmación oficial.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco plausible dado el tamaño del modelo.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.
- Compatibilidad con text-generation-inference (TGI) y con endpoints compatibles, según las etiquetas del repositorio.

## Casos de uso

- Experimentación académica con SFT: reproducir el pipeline TRL sobre un modelo de 39M permite estudiar el efecto de distintas configuraciones de datos (tamaño del corpus empaquetado, semillas) sin grandes recursos de cómputo.
- Ablaciones controladas por semilla: el sufijo `seed10` y la existencia de variantes hermanas con otras semillas lo hacen útil para medir la varianza del entrenamiento en modelos pequeños.
- Investigación sobre modelos lingüísticos de bajos recursos: al derivar de un modelo monolingüe de árabe, puede emplearse para estudiar técnicas de adaptación en idiomas con pocos datos.
- Docencia y prototipado de pipelines: sirve como ejemplo mínimo y ejecutable de carga con `transformers.pipeline`, ideal para prácticas de generación de texto en CPU.
- Generación de texto a pequeña escala en local: con 39M de parámetros puede ejecutarse en cualquier portátil para tareas de completado sencillo y pruebas de integración.
- Pruebas de infraestructura de despliegue: por su tamaño, es útil para validar configuraciones de TGI, endpoints compatibles o servidores de inferencia antes de escalar a modelos mayores.
- Referencia comparativa en estudios de escalado: permite contrastar curvas de rendimiento frente a las variantes de 100 MB del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 156 MB de pesos; en FP16/BF16, en torno a 78 MB. El consumo real incluye el tokenizador y las activaciones, pero sigue siendo del orden de pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100, etc.). No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU.
- Inferencia en CPU: totalmente viable; el modelo puede ejecutarse en CPU con `transformers` sin necesidad de GPU.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI), endpoints compatibles, FriendliAI (según los resultados de búsqueda). No se confirma soporte de llama.cpp, Ollama o vLLM, aunque por tamaño sería trivialmente portable.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10 (este modelo) | 39,09 M | No disponible | No disponible | Ajuste SFT sobre Goldfish árabe |
| goldfish-models/arb_arab_10mb (modelo base) | No disponible | No disponible | No disponible | Modelo monolingüe de árabe de la familia Goldfish |
| francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10 | No disponible | No disponible | No disponible | Variante hermana con dataset empaquetado de 100 MB |
| francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed455 | No disponible | No disponible | No disponible | Variante hermana con otra semilla (seed 455) |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa fiable entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un corpus monolingüe de 10 MB, es probable que reproduzca los sesgos y limitaciones del corpus original, pero no hay información pública al respecto.
- Riesgo de alucinación: alto en proporción a su tamaño; con 39M de parámetros, la coherencia y la factualidad son limitadas y las respuestas largas pueden degradarse rápidamente.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no están declarados oficialmente. Es probable que el rendimiento fuera del árabe sea muy pobre.
- Restricciones de licencia: la licencia no está disponible (el campo aparece como placeholder), lo que impide determinar si se permite el uso comercial. No se recomienda su uso en producción sin aclarar este punto.
- Modelo con cero descargas y cero "likes": no ha sido validado por la comunidad; debe tratarse como un artefacto experimental sin garantías.
- Ausencia de benchmarks: no existen métricas publicadas que permitan estimar su calidad objetiva.
- Fecha de creación registrada como 2026-09-30, lo que resulta anómala y sugiere metadatos poco fiables; conviene verificar cualquier dato del repositorio antes de usarlo.
- No se documenta tokenizador, número de tokens de entrenamiento ni composición del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_10mb
- Variante hermana (100 MB, seed10): https://huggingface.co/francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante hermana (100 MB, seed455): https://huggingface.co/francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gbr6272a
- Repositorio de TRL: https://github.com/huggingface/trl
- Entrada en LLM Explorer (variante relacionada): https://llm-explorer.com/model/fpadovani%2Farb-arab-10mb-ppt-Dp-100mb_seed10,5cQ2NhJatydIZJ7U46xKNg
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/arb-arab-10mb-ppt-dp-10mb-packed-bfd_seed10
