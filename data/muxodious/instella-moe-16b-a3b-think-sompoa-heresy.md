# MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy

## Resumen

Instella-MoE-16B-A3B-Think-SOMPOA-heresy es un ajuste fino no oficial del modelo amd/Instella-MoE-16B-A3B-Think, desarrollado por AMD, publicado por el usuario MuXodious en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado una tecnica de modificacion de pesos orientada a reducir los rechazos del modelo ante peticiones que el modelo base declinaria, manteniendo teoricamente el resto de capacidades intactas. El modelo conserva la arquitectura DeepSeek-V3 (MoE) del original y su modo de razonamiento explicito ("Think").

El modelo base es un Mixture-of-Experts de aproximadamente 15.860 millones de parametros totales con unos 3.000 millones de parametros activos por token (de ahi el sufijo A3B), entrenado por AMD y optimizado para su ecosistema ROCm. La variante hereticada mantiene el mismo tokenizador, la misma plantilla de chat y el mismo formato de pesos en safetensors, por lo que es intercambiable con el modelo original a nivel de integracion.

La relevancia de esta ficha es doble: por un lado documenta un experimento de "abliteration" sobre un MoE moderno, incluyendo las metricas de rechazo y divergencia KL que el autor publica para distintas variantes (T648, T680, T681, T718, T756); por otro, advierte de que la licencia del modelo base (researchrail) impone restricciones severas y de que el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo DeepSeek-V3, transformer decoder-only |
| Parametros totales | 15.862.787.584 (~15,86 B) |
| Parametros activos | ~3 B por token (sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | researchrail (license: other, con enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Instella-MoE-16B-A3B-Think de AMD: un transformer decoder-only con capas de mezcla de expertos, implementado mediante `custom_code` sobre la clase `deepseek_v3` de transformers. Esto implica que la carga del modelo requiere `trust_remote_code=True` y que la implementacion de atencion y enrutamiento de expertos proviene del codigo incluido en el repositorio, no del nucleo de transformers. El modelo base fue entrenado por AMD con un enfasis declarado en ROCm, aunque la model card no detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La modificacion aplicada por MuXodious es un proceso de abliteration sobre los pesos del modelo base, con un prefijo de respuesta especifico (`<｜Assistant｜><think>\n</think>\n\n`) usado para forzar la salida del modo de razonamiento durante la calibracion. El autor documenta que la configuracion de hardware influye en el resultado: al repartir el modelo entre dos GPU en lugar de una sola, las metricas de rechazo y la divergencia KL cambian de forma significativa. Publica varias "trials" con su tasa de rechazo sobre 101 prompts y su KL divergence respecto al original, y elige T756 (1 rechazo de 101, KL 0,1280) como version final por su consistencia entre plataformas, aunque senala T648 (4 rechazos, KL 0,1176) como posible mejor equilibrio entre compliance y preservacion de capacidades.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento explicito ("Think"), heredado del modelo base.
- Razonamiento multi-paso: el modelo puede emitir un bloque de pensamiento antes de la respuesta final, siguiendo la plantilla del modelo base.
- Reduccion de rechazos: segun las pruebas del autor, la variante publicada declina 1 de cada 101 prompts en su bateria de compliance, frente a un comportamiento mas restrictivo del original.
- Capacidades de codigo y matematicas: presumiblemente heredadas del modelo base, aunque no hay benchmarks especificos publicados para esta variante.
- Multilingue: limitado a ingles segun la model card; no se declara soporte de otros idiomas.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado en la informacion disponible.
- Vision y audio: no soportados.

## Casos de uso

- Investigacion sobre abliteration y seguridad: el modelo sirve como caso de estudio reproducible para medir el efecto de la modificacion de pesos sobre la tasa de rechazo y la divergencia KL, ya que el autor publica ambas metricas para cinco variantes.
- Evaluacion de robustez de filtros de seguridad: util para comparar el comportamiento de un modelo abliterated frente a su base en pipelines de moderacion y red teaming controlado.
- Generacion creativa sin restricciones de tono: escritura de ficcion, dialogos o guiones donde el modelo base tenderia a rechazar contenido sensible, en entornos de investigacion y con supervision humana.
- Experimentacion con MoE de ~3 B activos en hardware de consumo: al activar solo una fraccion de los parametros por token, el modelo permite probar tecnicas de inferencia eficiente en GPUs con 24 GB o menos, siempre que se cuantice previamente.
- Prototipado de asistentes conversacionales en ingles con razonamiento visible: el bloque de pensamiento permite depurar por que el modelo llega a una respuesta, util en entornos de desarrollo.
- Benchmarking de infraestructura ROCm: al ser una variante de un modelo de AMD, sirve para validar stacks de inferencia sobre GPUs AMD frente a equivalentes NVIDIA.
- Estudio de sensibilidad al hardware en tecnicas de modificacion de pesos: el propio autor documenta que los resultados cambian entre una y dos GPUs, lo que convierte al modelo en un caso util para investigar reproducibilidad.

## Benchmarks y rendimiento

Los unicos datos publicados son los de PIQA y la tasa de rechazo sobre 101 prompts, comparando variantes del ajuste con el modelo original. No hay datos de MMLU, HumanEval, GSM8K ni similares.

| Variante | PIQA acc (3090+5060Ti) | PIQA acc_norm (3090+5060Ti) | PIQA acc (H100) | PIQA acc_norm (H100) | Rechazos (de 101) | KL divergence |
|---|---|---|---|---|---|---|
| Original | 0,7263 | 0,7361 | 0,7231 | 0,7459 | no disponible | 0 |
| T718 | 0,7312 | 0,7372 | no disponible | no disponible | 5 | 0,1167 |
| T756 (publicada) | 0,7291 | 0,7372 | 0,7312 | 0,7432 | 1 | 0,1280 |
| T681 | 0,7231 | 0,7361 | no disponible | no disponible | 2 | 0,1210 |
| T648 | 0,7285 | 0,7339 | no disponible | no disponible | 4 | 0,1176 |
| T680 | 0,7231 | 0,7329 | 0,7301 | 0,7454 | 8 | 0,1021 |
| T684 | 0,7263 | 0,7323 | no disponible | no disponible | 10 | 0,0866 |

Las diferencias en PIQA entre variantes son pequenas y, en varios casos, inferiores al error estandar (~0,010), por lo que no permiten concluir una degradacion o mejora significativa. La divergencia KL crece a medida que disminuye la tasa de rechazo, lo que refleja el compromiso habitual en abliteration entre compliance y fidelidad al modelo original.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 31,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 40-48 GB o reparto entre varias GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 16-18 GB, viable en una RTX 4090 (24 GB) o A6000.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 9-10 GB, viable en GPUs consumer de 12-16 GB, aunque no se distribuyen pesos GGUF en el repositorio y habria que generarlos.
- GPUs recomendadas: H100 (usada por el autor para el merge y las pruebas), A100 80 GB, o configuraciones multi-GPU como la 3090 + 5060 Ti del autor.
- Cabe en consumer GPU: si, con cuantizacion agresiva; en precision completa no.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito por el `custom_code` de `deepseek_v3`); text-generation-inference aparece como tag compatible; vLLM y llama.cpp no estan confirmados en la informacion disponible, y llama.cpp requeriria conversion a GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3 B activos, el coste por token es inferior al de un denso de 16 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Instella-MoE-16B-A3B-Think-SOMPOA-heresy | ~15,86 B | ~3 B | no disponible | researchrail | Variante abliterated, solo ingles |
| amd/Instella-MoE-16B-A3B-Think | ~15,86 B | ~3 B | no disponible | researchrail | Modelo base, con rechazos |
| DeepSeek-V3 (familia) | 671 B | 37 B | no disponible | licencia propia | Misma arquitectura, escala muy superior |
| Qwen2.5-14B-Instruct | 14,7 B | denso | 32.768 tokens | Apache 2.0 | Alternativa densa de tamano comparable y licencia permisiva |

La comparacion con modelos densos de ~14 B es la mas directa por presupuesto de VRAM, aunque el MoE ofrece mas parametros totales a coste de inferencia similar. La licencia researchrail del modelo base es la diferencia mas relevante frente a alternativas Apache 2.0.

## Limitaciones y advertencias

- La licencia "researchrail" es restrictiva y esta marcada como `license: other`; no se detallan en la informacion disponible los terminos exactos, pero el nombre sugiere uso limitado a investigacion. Verificar el archivo LICENSE antes de cualquier uso comercial.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta validado.
- La abliteration reduce los rechazos pero incrementa la divergencia KL respecto al original (hasta 0,1280 en la variante publicada), lo que implica cambios de comportamiento mas alla de la compliance.
- Riesgo elevado de generar contenido danino, sesgado o inapropiado sin filtros: al eliminar parte de las barreras del modelo base, no es adecuado para despliegues orientados al publico sin moderacion externa.
- El autor documenta que los resultados dependen de la configuracion de hardware (una vs. dos GPUs), lo que cuestiona la reproducibilidad de las metricas publicadas.
- No hay benchmarks de razonamiento, codigo o matematicas para esta variante; las capacidades se infieren del modelo base.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar antes de usar en produccion.
- No se distribuyen pesos cuantizados, lo que anade trabajo de conversion para despliegues en hardware limitado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/Instella-MoE-16B-A3B-Think-SOMPOA-heresy
- Modelo base: https://huggingface.co/amd/Instella-MoE-16B-A3B-Think
- Referencia arXiv citada en los tags: arxiv:2609.00791 (no verificada en la informacion disponible)
- Repositorio de AMD Instella: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
