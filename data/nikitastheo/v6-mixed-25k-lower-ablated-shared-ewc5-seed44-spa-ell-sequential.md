# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-spa-ell-sequential

## Resumen

`nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-spa-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (aproximadamente 124 millones de parametros) publicado en Hugging Face por el usuario nikitastheo. Se trata de un checkpoint experimental de investigacion, entrenado desde cero con un script propio basado en Hugging Face Accelerate (`train_clm.py`), sin usar la clase `Trainer`. La nomenclatura del repositorio sugiere un experimento de aprendizaje secuencial de idiomas (probablemente castellano `spa` y griego `ell`) con regularizacion EWC (Elastic Weight Consolidation), ablacion de componentes y una semilla concreta (`seed44`).

El modelo emplea una arquitectura GPT-2 clasica (transformer decoder-only) con tokenizer propio de 25 000 entradas (`nikitastheo/goldfish-25k-spa-lower-seed44-ablated-tokenizer`). El entrenamiento se realizo durante 15 900 pasos con un learning rate de 1e-4, scheduler lineal, 1 590 pasos de warmup y un batch efectivo de 32. El nombre del checkpoint indica un cambio de idioma en la epoca 10, lo que apunta a un escenario de entrenamiento multi-etapa orientado a mitigar el olvido catastrofico.

Su relevancia es fundamentalmente academica: no es un modelo pensado para produccion ni para uso general, sino un artefacto de investigacion sobre entrenamiento secuencial, comparticion de parametros y estabilidad del aprendizaje. No dispone de descargas ni likes, no declara licencia ni idiomas en la model card, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (causal LM) |
| Parametros totales | 123 886 080 (~124 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config GPT-2 base, valor no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible oficialmente; al ser safetensors en fp32/fp16 es convertible a GGUF/8-bit/4-bit con herramientas externas |
| Idiomas soportados | no disponible (la nomenclatura sugiere castellano y griego, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 (transformer decoder-only con atencion causal, capas pre-norm y embeddings posicionales aprendidos), configurada a partir de `configurations/gpt_base_config.json`. Con ~124 M de parametros, encaja en la escala de GPT-2 small, lo que implica un coste de entrenamiento e inferencia muy bajo y una capacidad limitada en tareas complejas.

El entrenamiento se realizo con `train_clm.py`, un script de Hugging Face Accelerate sin `Trainer`, durante 15 900 pasos, LR 1e-4 con scheduler lineal, 1 590 pasos de warmup, batch de 32 por dispositivo y acumulacion de gradientes de 1. La model card menciona una `language switch epoch` en la epoca 10, coherente con el sufijo `sequential` y con la referencia `ewc5` (Elastic Weight Consolidation con un coeficiente asociado), tecnica habitual para preservar el conocimiento del idioma previo al introducir uno nuevo. El sufijo `ablated` y `shared` sugiere variantes experimentales de comparticion/ablacion de componentes. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva basica en el dominio e idiomas cubiertos por el tokenizer de 25 000 entradas.
- Modelado de lenguaje causal: continuacion de texto, completado de frases y generacion condicionada por prompt.
- Potencial capacidad multilingue limitada (castellano y griego segun la nomenclatura, sin verificacion publica).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun las tags del repositorio.

## Casos de uso

- Investigacion sobre olvido catastrofico: servir como checkpoint de referencia para reproducir experimentos de aprendizaje secuencial con EWC y comparar la retencion del primer idioma tras el cambio de epoca 10.
- Experimentos de tokenizacion de bajo recurso: evaluar el impacto del tokenizer `goldfish-25k` en la calidad de generacion frente a tokenizers estandar de GPT-2.
- Generacion de texto controlada en laboratorio: usar el modelo para tareas de continuacion de texto en corpus pequenos donde el coste computacional debe ser minimo (menos de 1 GB de pesos).
- Baseline para ablaciones: al ser un checkpoint `ablated` y `shared`, sirve como punto de comparacion en estudios sobre comparticion de parametros entre idiomas.
- Pruebas de pipelines de inferencia: validar integraciones con `transformers`, `text-generation-inference` y despliegues ligeros en CPU/GPU consumer antes de escalar a modelos mayores.
- Docencia y demos: ejemplo practico de entrenamiento causal-LM con Accelerate, util para ilustrar flujos de entrenamiento sin `Trainer` en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,5 GB de pesos mas overhead de activaciones y KV cache (por debajo de 2 GB en la mayoria de configuraciones).
- VRAM estimada en fp16/bf16: ~0,25 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia de baja concurrencia.
- GPU recomendadas para entrenamiento o fine-tuning: RTX 3090/4090 o A100/H100 si se quiere reproducir el entrenamiento con batch 32; para inferencia basta una GPU integrada o CPU.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), `text-generation-inference` (tag `text-generation-inference`), conversion a GGUF para `llama.cpp`/`Ollama` mediante herramientas externas.
- Latencia y throughput: no disponibles; por tamano, se espera un throughput alto en GPU consumer y decenas de tokens por segundo en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-spa-ell-sequential | ~124 M | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental de investigacion |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT (pesos publicos) | Hugging Face, ampliamente usado | Referencia arquitectonica directa, tokenizer BPE de 50 257 entradas |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | Hugging Face | Mayor capacidad, coste superior |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face | Version destilada, mas rapida pero menor calidad |

La comparativa se limita a modelos GPT-2 de escala similar; no hay datos de rendimiento del checkpoint de nikitastheo que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion sin benchmarks publicados: no hay evidencia de calidad en tareas estandar.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar al autor.
- Idiomas no declarados formalmente: la nomenclatura sugiere castellano y griego, pero no esta confirmado ni evaluado.
- Tokenizer propio de 25 000 entradas: no es compatible con tokenizers estandar de GPT-2, lo que complica la reutilizacion directa de pipelines existentes.
- Riesgo elevado de alucinacion y baja coherencia en contextos largos por el tamano reducido (~124 M) y la falta de datos de validacion.
- Sesgos desconocidos: no se documenta la composicion del dataset ni filtros de toxicidad.
- Contexto maximo no confirmado: no se debe asumir la ventana de 1024 tokens de GPT-2 sin verificar la configuracion real.
- Sufijos `ablated` y `shared` indican variantes experimentales que pueden degradar el rendimiento respecto a un GPT-2 small estandar.
- No apto para produccion sin evaluacion previa: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-spa-ell-sequential
- Variante relacionada (sin `ablated`): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed44-spa-ell-sequential
- Variante relacionada (sin `seed44`): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-spa-ell-sequential
- Tokenizer asociado: https://huggingface.co/nikitastheo/goldfish-25k-spa-lower-seed44-ablated-tokenizer
