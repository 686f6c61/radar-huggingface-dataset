# francesca9805/swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino (SFT) publicado por el usuario francesca9805 sobre el checkpoint base `ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed10`. Se trata de un modelo generativo de texto de tipo decoder-only, etiquetado con la arquitectura `gpt2`, con 124.770.816 parámetros totales confirmados en los pesos safetensors, lo que lo sitúa en la misma escala que GPT-2 small (124 M). Fue entrenado con la librería TRL (versión 0.23.0) mediante supervisión directa.

La nomenclatura del identificador sugiere un experimento de investigación centrado en tokenizadores: los segmentos "before" y "after" apuntan a comparaciones antes y después de un cambio de tokenizador, y la traza de Weights & Biases apunta al proyecto "new-tokenizers" del grupo f-padovani de la Universidad de Groningen. El modelo no es un lanzamiento de produccion, sino una pieza de un pipeline experimental reproducible.

Su relevancia es limitada pero clara: sirve como artefacto de investigación para estudiar el efecto del ajuste SFT sobre un corpus pequeño (el sufijo "100mb" sugiere un dataset del orden de 100 MB) y para reproducir experimentos de tokenización. Con cero descargas y una sola interacción, la licencia y los idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (según tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele usar 1.024 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors (repo de 9,5 GB, probablemente con estados de optimizador y checkpoints) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con 124.770.816 parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida SSM/attention: la etiqueta `gpt2` y el tamaño de pesos son consistentes con un transformer denso convencional con atención causal. No hay información publicada sobre el número de capas, dimensión oculta, número de cabezas ni vocabulario.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte del checkpoint base `ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed10`, lo que indica un ajuste en dos etapas (preentrenamiento/adaptación previa y posterior SFT). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica implícita es el uso de un tokenizador nuevo ("newlex") dentro de la familia de experimentos del autor.

## Capacidades

- Generación de texto autoregresiva de propósito general, heredada de la arquitectura GPT-2.
- Formato de chat: la model card muestra un ejemplo de `pipeline("text-generation")` con un mensaje estructurado `{"role": "user", "content": ...}`, lo que indica que el modelo acepta plantillas conversacionales básicas.
- Ajuste SFT orientado a seguir instrucciones (uso de TRL con el pipeline de supervised fine-tuning).
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` (etiquetas del repositorio), lo que permite desplegarlo en Text Generation Inference.
- No hay evidencia de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo "thinking".
- Capacidades multilingües: no disponible.
- Capacidad especial: ninguna documentada.

## Casos de uso

- Investigación comparativa de tokenizadores: el nombre del modelo ("before"/"after") y la traza de W&B en el proyecto "new-tokenizers" indican que este checkpoint está pensado para medir el impacto de un cambio de tokenizador sobre el rendimiento de un modelo pequeño entrenado con SFT.
- Reproducción de experimentos de SFT: al declarar versiones exactas de TRL, Transformers, PyTorch y Tokenizers, el modelo permite replicar el pipeline de entrenamiento en un entorno controlado.
- Prototipado de pipelines de `transformers`: por su tamaño (~125 M parámetros), es adecuado para validar rápidamente integraciones con `pipeline("text-generation")` antes de escalar a modelos mayores.
- Inferencia en CPU o en hardware de gama baja: al ocupar menos de 1 GB en cualquier precisión habitual, permite ejecutar generación de texto en dispositivos sin GPU dedicada, útil en entornos educativos o de pruebas.
- Punto de partida para fine-tuning posterior (transfer learning): actúa como checkpoint base para experimentos adicionales de ajuste en dominios concretos con coste muy reducido.
- Validación de despliegue con Text Generation Inference: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usar el modelo como banco de pruebas para configurar endpoints de inferencia sin asumir costes de GPU elevados.
- Docencia y demostraciones de modelos GPT-2: por su tamaño manejable, sirve para ilustrar de forma práctica cómo se comporta un modelo decoder-only entrenado con SFT frente a uno preentrenado sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32, 250 MB en FP16/BF16, en torno a 125 MB en cuantización de 8 bits y 65 MB en 4 bits (estimaciones a partir de 124,77 M de parámetros; no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM, incluidas GTX 1050 Ti, RTX 3050/3060/4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna y también en CPU.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (etiqueta declarada en el repo), vLLM (sujeto a soporte de la arquitectura GPT-2) y llama.cpp/Ollama previa conversión a GGUF (no confirmada por el autor).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`swe-100mb-after-...`) | 124,77 M | no disponible | sin benchmarks publicados | no disponible | HuggingFace, repo de 9,5 GB |
| GPT-2 small | 124 M | 1.024 tokens | benchmarks publicos de referencia (no comparables directamente) | MIT (segun publicacion original) | ampliamente disponible |
| GPT-2 medium | 355 M | 1.024 tokens | benchmarks publicos de referencia | MIT (segun publicacion original) | ampliamente disponible |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | benchmarks publicos en su model card | Apache 2.0 | ampliamente disponible |

Comparativa limitada a datos de parametros y contexto de conocimiento publico; no hay cifras de rendimiento de este checkpoint que permitan una comparacion cuantitativa. La licencia del modelo bajo analisis no esta declarada, lo que impide confirmar compatibilidad con uso comercial.

## Limitaciones y advertencias

- No se declara licencia específica: la model card solo contiene `licence: license`, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Cero descargas y una sola interacción en el momento de la consulta: no hay validación por parte de la comunidad ni evidencia de robustez en producción.
- No hay información sobre idiomas soportados, por lo que se desconoce si el modelo funciona correctamente en castellano o en otros idiomas distintos del corpus de entrenamiento (el sufijo "swe" podría estar relacionado con el sueco, sin confirmar).
- No hay documentación del dataset de SFT: se desconoce su composición, sesgos y posibles problemas de calidad, lo que aumenta el riesgo de alucinación y de reproducción de sesgos del corpus.
- Contexto no confirmado: aunque la arquitectura GPT-2 sugiere 1.024 tokens, el autor no lo especifica; no se debe asumir un contexto mayor.
- Modelo de investigación: no está pensado ni validado para despliegues de producción, atención al cliente, generación de código crítica o cualquier tarea con requisitos de fiabilidad.
- Tamaño de repositorio de 9,5 GB para 124,77 M de parámetros: probablemente incluye estados de optimizador o múltiples checkpoints, lo que puede complicar la descarga y el despliegue si no se podan los archivos innecesarios.
- Ausencia de datos sobre cuantización, throughput y latencia: cualquier estimación de rendimiento en producción debe medirse empíricamente.

## Enlaces

- HuggingFace: https://huggingface.co/francesca9805/swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed10
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/y0niobnr
- Repositorio TRL: https://github.com/huggingface/trl
