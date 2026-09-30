# francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/rus_cyrl_100mb`, un modelo monolingüe de la familia Goldfish orientado al ruso en escritura cirílica. El ajuste lo ha realizado el usuario `francesca9805` mediante aprendizaje supervisado (SFT) con la librería TRL, y está publicado en HuggingFace bajo la librería `transformers`. La arquitectura es de tipo GPT-2 (transformer decoder-only) y cuenta con 124.770.816 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños (~124M), comparable al GPT-2 `small` original.

El propósito del modelo, a juzgar por la nomenclatura del identificador (`ppt`, `Dp-10mb`, `packed`, `bfdiso`, `seed455`), parece ser servir como artefacto de experimentación dentro de una línea de investigación sobre tokenizadores y datos de entrenamiento (el run de Weights & Biases está asociado al proyecto `new-tokenizers` de la Universidad de Groningen). Se trata, por tanto, de un modelo de investigación más que de un modelo listo para producción.

Su relevancia actual es limitada: no cuenta con descargas ni interacciones en HuggingFace, no publica resultados de benchmarks y su licencia no está especificada. Resulta útil principalmente como referencia para reproducir experimentos de ajuste fino sobre modelos monolingües pequeños, y como base para estudiar el comportamiento de modelos GPT-2 de 124M entrenados sobre corpus en cirílico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura GPT-2; valor exacto no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | no disponible en la ficha; el modelo base (`rus_cyrl_100mb`) apunta a ruso en cirilico |
| Licencia | no disponible (la model card indica un marcador `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/rus_cyrl_100mb |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada directamente del modelo base `goldfish-models/rus_cyrl_100mb`. Con 124.770.816 parámetros, corresponde a la escala de GPT-2 `small` (124M). No se trata de una arquitectura MoE ni híbrida SSM: es un transformer denso clásico con atención causal completa.

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre el stack Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card referencia un run de Weights & Biases en el proyecto `new-tokenizers` de la Universidad de Groningen. La etiqueta `packed` sugiere el uso de secuencias empaquetadas para maximizar la ocupación de tokens por lote, y `Dp-10mb` apunta a un subconjunto de datos de unos 10 MB. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva en el idioma y dominio para los que fue ajustado (presumiblemente ruso en cirílico, heredado del modelo base).
- Conversación de un solo turno vía plantilla de chat: la model card incluye un ejemplo de `pipeline` con una lista de mensajes `[{"role": "user", "content": ...}]`, lo que indica soporte de formato conversacional básico.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingües más allá del idioma del modelo base.
- No hay evidencia de modo `thinking`, visión, audio ni modalidades adicionales.
- Capacidad de razonamiento, código o matemáticas: no documentada y poco probable a esta escala.

## Casos de uso

- Experimentación académica sobre tokenizadores: el modelo forma parte de una línea de trabajo (`new-tokenizers`) orientada a estudiar cómo afectan distintas estrategias de tokenización y empaquetado de datos al ajuste fino de modelos pequeños. Es adecuado como artefacto reproducible para comparar semillas y configuraciones.
- Generación de texto controlada en ruso: se puede emplear para producir texto breve en cirílico dentro de dominios cercanos a los datos de ajuste, aunque sin garantías de calidad por la falta de benchmarks.
- Pruebas de integración en pipelines de `transformers` y TGI: al estar etiquetado como `endpoints_compatible` y `text-generation-inference`, sirve para validar el despliegue de modelos GPT-2 pequeños en infraestructura de inferencia.
- Docencia y demostraciones: por su tamaño reducido (124M de parámetros), es didáctico para ilustrar el flujo completo de SFT con TRL, desde el modelo base hasta el checkpoint final.
- Investigación sobre modelos monolingües de bajo recurso: útil como punto de partida para estudiar el comportamiento de GPT-2 en lenguas con escritura no latina.
- Base para posteriores ajustes: puede actuar como checkpoint intermedio sobre el que aplicar nuevas rondas de fine-tuning o DPO para tareas concretas en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 124,7M de parámetros ocupan aproximadamente 0,5 GB; en fp16, unos 0,25 GB; en cuantizaciones de 8 bits, del orden de 0,13 GB. Son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; incluso GPU integradas o aceleradores de gama baja pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (TGI, indicado por el tag `text-generation-inference`), y conversión a GGUF para llama.cpp u Ollama (no se publican pesos GGUF en el repositorio). También es compatible con plataformas de terceros como FriendliAI.
- Latencia y throughput estimados: no disponibles. A esta escala, la inferencia en GPU moderna es de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 | 124,7M | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sobre modelo Goldfish |
| goldfish-models/rus_cyrl_100mb (base) | no disponible (familia ~100M) | no disponible | no disponible | HuggingFace | Modelo monolingüe ruso de la familia Goldfish |
| francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,1M aprox. | no disponible | no disponible | HuggingFace | Variante hermana con dataset invertido (10 MB de datos, 100 MB empaquetados) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. Las variantes hermanas del mismo autor comparten el mismo esquema experimental.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de corpus en ruso cirílico puede heredar sesgos presentes en los datos del modelo base.
- Riesgo de alucinación: elevado, como en cualquier modelo GPT-2 de 124M sin ajuste por preferencias humanas (RLHF/DPO) ni datos de verificación.
- Limitaciones de contexto o idioma: la longitud de contexto no está confirmada en la información; el modelo está orientado casi con certeza al ruso, por lo que su rendimiento en otros idiomas será deficiente.
- Restricciones de licencia: la licencia no está especificada de forma explícita (marcador `licence: license`), por lo que no se puede garantizar el uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Caveat de producción: es un modelo de investigación sin benchmarks, con 0 descargas y 0 interacciones; no está validado para uso real. Además, la fecha de creación del repositorio (2026-09-29) es posterior a la fecha habitual de publicación y el estado "Training in progress, step 500" indica que el artefacto puede ser un checkpoint intermedio.
- El repositorio incluye una carpeta `checkpoint-500`, lo que refuerza que se trata de un punto de control parcial dentro del entrenamiento y no necesariamente del modelo final.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/rus_cyrl_100mb
- Variante hermana (referenciada en la búsqueda web): https://huggingface.co/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/27lxzfar
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Entrada en LLM Explorer de la variante hermana: https://llm-explorer.com/model/francesca9805%2Frus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Entrada en free2aitools: https://free2aitools.com/model/francesca9805/rus-cyrl-100mb-ppt-dp-10mb-packed-bfd_seed455
