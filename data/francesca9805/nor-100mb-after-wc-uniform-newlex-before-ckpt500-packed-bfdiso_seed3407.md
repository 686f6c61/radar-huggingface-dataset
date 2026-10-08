# francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen
El modelo `francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) de tipo SFT sobre el checkpoint `francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407`, realizado por el usuario francesca9805 y publicado en HuggingFace. Se trata de un artefacto de investigación con arquitectura GPT-2 de aproximadamente 124,8 millones de parámetros (124.770.816 según los pesos en safetensors), entrenado con la librería TRL. No es un modelo de propósito general orientado a producción, sino el resultado de un experimento de entrenamiento reproducible (la nomenclatura incluye términos como "packed", "newlex", "ckpt500" y una semilla concreta, "seed3407").

La relevancia de esta ficha es fundamentalmente técnica y de trazabilidad: permite documentar qué es el artefacto, de dónde procede y qué limitaciones tiene antes de considerarlo para cualquier uso. El nombre sugiere variantes de tokenizador ("newlex"), empaquetado de secuencias ("packed") y un punto de control intermedio ("before-ckpt500"), lo que apunta a una comparativa de tokenizadores o de estrategias de preprocesado en el ámbito de una investigación académica.

Hay que subrayar que la información pública es muy escasa: la model card es una plantilla autogenerada por TRL, sin descripción funcional, sin idiomas declarados y sin licencia explícita. Esto limita seriamente cualquier evaluación de rendimiento real y obliga a marcar buena parte de los apartados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` del repositorio |
| Parametros totales | 124.770.816 (aprox. 124,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el prefijo "nor" del nombre sugiere noruego, sin confirmar) |
| Licencia | no disponible (la model card incluye un campo `licence` con el valor generico "license", sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 34,7 GB |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407 |
| Descargas / likes | 890 descargas / 1 like |
| Fechas | creado 2026-10-03, actualizado 2026-10-07 |

## Arquitectura y entrenamiento
El repositorio se etiqueta como `gpt2`, lo que implica una arquitectura transformer decoder-only con atención causal, coherente con el recuento de 124.770.816 parámetros (el orden de magnitud de GPT-2 small, ~124 M). No se documenta ninguna innovación arquitectónica adicional (no hay indicios de MoE, SSM, atención lineal ni decodificación especulativa). El entrenamiento se realizó con TRL 0.23.0 en modo SFT (supervised fine-tuning) sobre el modelo base indicado, usando Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. Se enlaza un run de Weights & Biases (`wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wbcz1tuu`), lo que vincula el trabajo a un proyecto de investigación sobre tokenizadores en la Universidad de Groningen.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO ni la estrategia de empaquetado de secuencias, aunque los sufijos del nombre ("100mb", "packed", "newlex", "before-ckpt500", "seed3407") sugieren un corpus de unos 100 MB, secuencias empaquetadas, un tokenizador nuevo y un checkpoint intermedio antes del paso 500, con una semilla fija para reproducibilidad.

## Capacidades
- Generación de texto autoregresiva básica, heredada de la arquitectura GPT-2 (pipeline `text-generation`).
- Ajuste supervisado orientado a seguir instrucciones en el formato de conversación mostrado en la model card (`{"role": "user", "content": ...}`).
- Ejecución mediante `transformers.pipeline` con soporte para `device="cuda"` y `max_new_tokens`.
- Compatibilidad declarada con Text Generation Inference (tag `text-generation-inference`) y con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso
- Reproducción de experimentos académicos: el modelo incluye una semilla fija (`seed3407`) y un enlace al run de W&B, lo que permite reproducir y auditar el ajuste fino en un contexto de investigación sobre tokenizadores.
- Comparativa de tokenizadores en investigación: dado el sufijo `newlex`, encaja como punto de comparación frente a variantes con otros tokenizadores o corpus (`nld-100mb-...`, `nor-...`) publicadas por el mismo autor.
- Validación de pipelines de SFT con TRL: sirve como caso de prueba reproducible para verificar que una configuración de TRL 0.23.0 + Transformers 4.56.2 produce el checkpoint esperado.
- Pruebas de integración con Text Generation Inference: al etiquetarse como compatible con TGI y endpoints, puede usarse para validar el despliegue de un modelo GPT-2 pequeño en un servidor de inferencia.
- Prototipado de generación de texto en lengua escandinava (si se confirma el noruego): útil como prueba de concepto de generación en un idioma de bajos recursos, siempre que se verifique la calidad real.
- Docencia y ejercicios de fine-tuning: por su tamaño reducido (124 M de parámetros), es adecuado para demostraciones prácticas de SFT en cursos o talleres.
- Estudio de artefactos derivados de entrenamiento intermedio: permite analizar qué se obtiene al detener un entrenamiento antes del checkpoint 500 y su efecto en la generación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 (pesos de ~500 MB) y ~0,25 GB en fp16/bf16 para los pesos; con caché KV, tokenizador y overhead del runtime, el consumo real suele situarse entre 1 y 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. No requiere A100, H100 ni GPUs de gama alta.
- GPU de consumo: sí, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con suficiente memoria compartida o incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (por el tag `text-generation-inference`), y entornos compatibles con endpoints. El repositorio no incluye pesos GGUF, por lo que llama.cpp/Ollama requerirían una conversión manual.
- Latencia y throughput: no disponible (no se publican mediciones). Por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras confirmadas.
- Nota sobre el tamaño del repositorio: 34,7 GB para un modelo de 124 M indica que el repositorio incluye múltiples artefactos (checkpoints, estados del optimizador o variantes), no solo los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nor-100mb-...-seed3407 | ~124,8 M | no disponible | no disponible | no disponible | HuggingFace, 890 descargas |
| GPT-2 small (openai-community/gpt2) | ~124 M | 1024 tokens | benchmarks publicos en la model card original | MIT (segun el repositorio original) | HuggingFace, ampliamente usado |
| DistilGPT-2 (distilbert/distilgpt2) | ~82 M | 1024 tokens | benchmarks publicos en la model card original | Apache 2.0 | HuggingFace |
| GPT-2 medium | ~355 M | 1024 tokens | benchmarks publicos en la model card original | MIT (segun repositorio) | HuggingFace |

La comparación directa de rendimiento no es posible porque este modelo no publica resultados. La única comparación fiable es estructural: mismo orden de parámetros que GPT-2 small, pero sin licencia clara ni métricas verificables.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generación, por lo que no debería usarse en producción sin una evaluación propia.
- Licencia no definida: el campo `licence` de la model card contiene un marcador genérico ("license"), lo que impide determinar si se permite el uso comercial. Tratarlo como uso restringido hasta aclararlo con el autor.
- Idiomas no declarados: aunque el prefijo "nor" sugiere noruego, no está confirmado ni se detalla la cobertura lingüística real.
- Riesgo de alucinación: inherente a los modelos GPT-2 de este tamaño, sin mecanismos de mitigación documentados.
- Contexto no especificado: se desconoce la longitud máxima de contexto efectiva, algo crítico para tareas multi-turno.
- Sesgos conocidos: no documentados; los corpus pequeños (~100 MB) pueden amplificar sesgos y producir salidas degeneradas o repetitivas.
- Modelo de investigación: la nomenclatura y el enlace a W&B indican que es un artefacto experimental, no un modelo pulido para usuarios finales.
- Tamaño del repositorio elevado (34,7 GB): conviene revisar qué artefactos se descargan antes de clonar, para no consumir almacenamiento innecesario.
- Sin soporte de tool calling, agentes ni multimodalidad: cualquier caso de uso que requiera estas capacidades no es viable con este modelo.

## Enlaces
- HuggingFace (modelo): https://huggingface.co/francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed3407
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wbcz1tuu
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada en HuggingFace (seed455): https://huggingface.co/francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfd_seed455_seed455
- Despliegue en FriendliAI (variante seed455): https://friendli.ai/models/francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455
- Variante `nld` (neerlandes) en free2aitools: https://free2aitools.com/model/francesca9805/nld-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
