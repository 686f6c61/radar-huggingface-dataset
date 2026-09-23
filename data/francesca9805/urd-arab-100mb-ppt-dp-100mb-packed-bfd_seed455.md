# francesca9805/urd-arab-100mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/urd-arab-100mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino supervisado (SFT) de tipo *instruction tuning* sobre el modelo base `goldfish-models/urd_arab_100mb`, un modelo de lenguaje monolingüe de la familia Goldfish orientado a texto en escritura árabe (la nomenclatura del repositorio apunta a urdu). Lo publica el usuario de HuggingFace `francesca9805`, y el entrenamiento se ha realizado con la librería TRL de HuggingFace, según se documenta en la propia model card. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción.

Técnicamente es un transformer decoder-only de arquitectura GPT-2 (así lo etiqueta HuggingFace) con 124.770.816 parámetros totales, es decir, aproximadamente 125 millones, un orden de magnitud equivalente a GPT-2 small. No hay parámetros activos porque no es un modelo Mixture of Experts. El repositorio ocupa 0,3 GB y se distribuye en formato `safetensors` compatible con `transformers`, `text-generation-inference` y *endpoints* de HuggingFace.

Su relevancia es acotada pero concreta: sirve como banco de pruebas reproducible para experimentos de ajuste fino instructivo en lenguas de bajos recursos, para estudiar el efecto del empaquetado de datos (el identificador menciona `packed` y una semilla fija, `seed455`) y para comparar estrategias de tokenización, dado que la ejecución asociada en Weights & Biases pertenece al proyecto `new-tokenizers`. No se han declarado idiomas soportados, licencia ni resultados de evaluación en los metadatos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parámetros totales | 124.770.816 (dato real de los pesos `safetensors`) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no se declara en la model card ni en los metadatos) |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio) |
| Idiomas soportados | No disponible en los metadatos; el modelo base se denomina `urd_arab_100mb`, lo que sugiere urdu en escritura árabe |
| Licencia | No disponible (la model card contiene el marcador de posición `licence: license`) |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | `text-generation` |
| Modalidad | Texto a texto |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con normalización previa a la atención y tokenización a nivel de subpalabra heredada del modelo base. Con 124,77 millones de parámetros, el modelo se sitúa en la gama de los modelos pequeños: es viable ejecutarlo en CPU y no requiere aceleradores de gama alta. La información disponible no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni el tamaño del vocabulario, por lo que esos datos quedan como no disponibles.

El entrenamiento se ha realizado mediante SFT (*supervised fine-tuning*) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El identificador del modelo (`ppt-Dp-100mb-packed-bfd_seed455`) sugiere un conjunto de datos empaquetado de aproximadamente 100 MB y una semilla fija, lo que apunta a un experimento controlado y reproducible; sin embargo, la model card no especifica la composición del dataset, el número de tokens vistos, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica adicional, como atención lineal o decodificación especulativa. La ejecución de entrenamiento está registrada en Weights & Biases bajo el proyecto `new-tokenizers`, lo que vincula este modelo a trabajo sobre tokenización.

## Capacidades

- Generación de texto autoregresiva en el dominio cubierto por el modelo base (presumiblemente urdu en escritura árabe).
- Formato conversacional de un solo turno: el ejemplo de uso de la model card pasa una lista de mensajes con rol `user`, propio de modelos ajustados con SFT.
- Instrucciones básicas: al haber sido ajustado con SFT, se espera que responda a indicaciones directas, aunque no hay evaluación publicada que lo confirme.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta *thinking mode* ni bucle de herramientas.
- Capacidades multilingües: no disponibles; los metadatos no declaran ningún idioma.
- Capacidades especiales (visión, audio, *embedding*, reranking): no disponibles; el pipeline es únicamente `text-generation`.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con TGI y con los *endpoints* gestionados de HuggingFace.

## Casos de uso

- Investigación en lenguas de bajos recursos: el modelo sirve como punto de partida para medir cuánto mejora un ajuste SFT sobre un LM monolingüe pequeño, comparando con el modelo base `goldfish-models/urd_arab_100mb` como referencia. Es adecuado porque el experimento está acotado y es reproducible gracias a la semilla fija.
- Estudios de empaquetado de datos (*packing*): dado que el identificador menciona `packed`, este checkpoint permite reproducir y comparar el efecto del empaquetado de secuencias frente a un entrenamiento sin empaquetar, con el mismo volumen de datos (100 MB) y la misma semilla.
- Experimentos de tokenización: la ejecución asociada pertenece al proyecto `new-tokenizers`, de modo que el modelo puede emplearse para evaluar cómo distintos vocabularios afectan a la perplejidad y a la calidad de generación en urdu.
- Docencia y demostraciones de ajuste fino: con 0,3 GB de pesos, se puede mostrar un ciclo completo de SFT con TRL en un portátil, sin GPU dedicada, en una sesión de clase o taller.
- Prototipado de interfaz conversacional en CPU: para validar el *wiring* de una aplicación (formato de mensajes, `pipeline` de Transformers, gestión de respuestas) antes de invertir en un modelo mayor.
- Generación de texto a pequeña escala en entornos con recursos mínimos: al caber en memoria de un dispositivo de bajo consumo, puede ejecutarse en modo *batch* para tareas auxiliares no críticas, como completar plantillas o generar borradores en el idioma objetivo.
- Línea base para ablaciones: sirve como referencia de 125 millones de parámetros al comparar arquitecturas, curvas de aprendizaje o recetas de SFT dentro del mismo presupuesto de cómputo.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas de razonamiento, dado que no hay evidencia publicada de calidad y el tamaño del modelo limita severamente estas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y los metadatos de HuggingFace no aportan cifras de rendimiento. No se dispone tampoco de comparaciones con el modelo base ni con otros checkpoints derivados.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 0,5 GB; en fp16/bf16, unos 0,25 GB; en cuantización de 8 bits, unos 0,13 GB; en 4 bits, alrededor de 0,07 GB. Hay que sumar el *KV cache*, que con 125 millones de parámetros y secuencias cortas es marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100; en estas dos últimas el modelo está enormemente infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos ocho años, e incluso en iGPU con memoria compartida.
- Ejecución sin GPU: sí, es perfectamente viable en CPU (por ejemplo, un portátil de gama media o una Raspberry Pi 4/5 con 4-8 GB de RAM).
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (TGI) gracias a la etiqueta `text-generation-inference`, y *endpoints* gestionados de HuggingFace (`endpoints_compatible`). vLLM es probablemente compatible al ser un modelo GPT-2 estándar, aunque no está declarado. No se publican archivos GGUF, por lo que su uso en llama.cpp u Ollama requeriría una conversión propia no verificada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ningún escenario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/urd-arab-100mb-ppt-Dp-100mb-packed-bfd_seed455` | 124,77 M | No disponible | No publicado | No disponible | HuggingFace, 0 descargas, 0 likes |
| `goldfish-models/urd_arab_100mb` (modelo base) | Del orden de 100 M (no confirmado) | No disponible | No publicado en la información disponible | No disponible | HuggingFace |
| GPT-2 small (referencia de la misma familia arquitectónica) | 124 M | 1.024 tokens | Métricas públicas ampliamente documentadas por OpenAI | Licencia modificada de MIT | Pesos públicos desde 2019 |
| DistilGPT-2 | 82 M | 1.024 tokens | Métricas públicas de destilación | Apache 2.0 | HuggingFace |

Nota: los datos de GPT-2 small y DistilGPT-2 se incluyen como referencias arquitectónicas generales de la misma familia y tamaño; no se dispone de ninguna comparación empírica entre ellos y el modelo descrito.

## Limitaciones y advertencias

- Sesgos conocidos: no hay ninguna evaluación de sesgos publicada. Un modelo entrenado con unos 100 MB de texto de un único dominio lingüístico heredará los sesgos de ese corpus, que no se documenta.
- Riesgo de alucinación: alto en términos relativos, dado el reducido tamaño (125 millones de parámetros) y la ausencia de etapas de alineación documentadas más allá del SFT.
- Limitaciones de contexto: se desconoce la ventana máxima; la arquitectura GPT-2 suele operar con 1.024 tokens, pero no se confirma en la información disponible. Asumir valores mayores sin verificación puede provocar errores silenciosos.
- Limitaciones de idioma: los metadatos no declaran idiomas soportados. El nombre del modelo base sugiere urdu en escritura árabe, pero no hay confirmación oficial ni evaluación de calidad en otros idiomas.
- Restricciones de licencia: la model card contiene el marcador de posición `licence: license`, lo que equivale a una licencia no especificada. No se debe asumir uso comercial permitido sin contactar con el autor.
- Ausencia de validación: 0 descargas, 0 *likes* y ninguna evaluación publicada. No hay evidencia externa de que el ajuste SFT haya mejorado al modelo base.
- Datos de entrenamiento opacos: no se especifican composición, procedencia ni filtrado del conjunto de datos, lo que impide auditar la calidad y los posibles problemas de derechos de autor.
- Fecha de creación anómala: los metadatos indican 2026-09-23, una fecha futura respecto al momento habitual de consulta; conviene verificar la vigencia del repositorio.
- Uso en producción: no recomendado para tareas críticas, atención al cliente, decisiones automatizadas ni generación de código, dado el tamaño del modelo y la falta total de métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gwlzlmck
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (cita del método SFT): https://huggingface.co/docs/trl
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Los resultados de la búsqueda web no aportan enlaces relevantes sobre este modelo; los devueltos corresponden a foros de entretenimiento y no guardan relación con la ficha.
