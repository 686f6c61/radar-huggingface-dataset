# francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/ind_latn_100mb`, un GPT-2 monolingüe de la familia Goldfish orientado al indonesio en escritura latina. Lo publica el usuario `francesca9805` (vinculado a la Universidad de Groningen segun el enlace de Weights & Biases de la model card) y forma parte de una serie de experimentos sobre efectos de tokenizacion, empaquetado de datos y mezcla de corpus, a juzgar por la nomenclatura del repositorio (sufijos `ppt`, `Dp`, `10mb-packed`, `bfd`, `seed3407`).

Se trata de un modelo pequeno de tipo decoder-only transformer con 124.770.816 parametros reales (segun los pesos en safetensors del repositorio), lo que lo situa en la escala de GPT-2 small. Su relevancia es fundamentalmente de investigacion: permite estudiar como cambia el comportamiento de un modelo multilingue pequeno al aplicarle un ajuste supervisado sobre un subconjunto de datos, y sirve como punto de comparacion frente a otros checkpoints hermanos de la misma autora con distintos tamanos de corpus y semillas.

No es un modelo de proposito general ni compite con los LLM actuales: su interes esta en la reproducibilidad experimental y en tareas de generacion de texto muy acotadas en su idioma objetivo. La model card no aporta informacion sobre licencia, idiomas declarados, longitud de contexto ni resultados de evaluacion, por lo que varios datos clave quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via bibliotecas de inferencia) |
| Idiomas soportados | no disponible; el modelo base y la nomenclatura (`ind_latn`) apuntan a indonesio en escritura latina |
| Licencia | no disponible (la model card incluye la etiqueta `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/ind_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 180 / 0 |

## Arquitectura y entrenamiento

La arquitectura es de tipo transformer decoder-only con atencion causal, coherente con la etiqueta `gpt2` y con el modelo base `goldfish-models/ind_latn_100mb`. Los modelos Goldfish son una familia de modelos monolingues entrenados para 350 idiomas, de tamano reducido, pensados para investigacion en lenguas con pocos recursos. En este caso el checkpoint parte de la variante `ind_latn_100mb`, es decir, un modelo de unos 124 millones de parametros entrenado con aproximadamente 100 MB de texto en indonesio (escritura latina), aunque el detalle exacto del corpus original no se reproduce en esta ficha.

El ajuste se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL (version 0.23.0) sobre el framework transformers 4.56.2, PyTorch 2.5.1+cu121, datasets 4.8.4 y tokenizers 0.22.1. La model card enlaza un experimento de Weights & Biases asociado al proyecto `new-tokenizers` de la Universidad de Groningen, lo que sugiere que el objetivo del entrenamiento es estudiar el impacto de distintas estrategias de tokenizacion y empaquetado de datos (de ahi los sufijos `ppt`, `10mb-packed`, `Dp` y `bfd`). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni si hubo fases posteriores de RLHF o DPO; por el contrario, la model card indica unicamente SFT.

No se han anunciado innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). Se trata de un ajuste fino convencional sobre una arquitectura GPT-2 estandar.

## Capacidades

- Generacion de texto autoregresiva en el idioma objetivo del modelo base (indonesio en escritura latina, segun la nomenclatura del repositorio).
- Continuacion de prompts cortos y generacion de texto condicionada, con la interfaz de chat que muestra la model card (`pipeline` con mensajes de rol usuario).
- Capacidad limitada de comprension de instrucciones derivada del ajuste SFT, aunque sin datos de evaluacion publicados que la cuantifiquen.
- Uso como modelo de investigacion para comparar configuraciones de tokenizacion y empaquetado de datos dentro de la serie de checkpoints de la autora.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; el modelo base es monolingue por diseno de la familia Goldfish.
- No se declaran capacidades especiales adicionales.

## Casos de uso

- Investigacion sobre tokenizacion y empaquetado de datos: este checkpoint forma parte de una serie de experimentos (`new-tokenizers`) que comparan como afecta el preprocesado del corpus al rendimiento de un modelo pequeno; se usaria como punto de comparacion frente a los checkpoints hermanos con distintas semillas y tamanos de datos.
- Generacion de texto en indonesio para experimentos academicos: con 124 millones de parametros, puede generar parrafos cortos en su idioma objetivo, util para prototipos de NLP de bajos recursos.
- Creacion de corpus sinteticos de bajo coste: para aumentar datos en indonesio en tareas de investigacion, aceptando que la calidad sera limitada y requerira filtrado posterior.
- Reproduccion de experimentos de la Universidad de Groningen: al estar vinculado a un run concreto de Weights & Biases, sirve para replicar y auditar los resultados publicados en ese estudio.
- Punto de partida para nuevos ajustes finos: por su tamano reducido, es adecuado para fine-tuning rapido en una unica GPU consumer y para probar protocolos de entrenamiento antes de escalar.
- Educacion y demostraciones: util para ilustrar en clase como funciona un transformer decoder-only pequeno y como se comporta un ajuste SFT sobre un modelo base multilingue.
- Extraccion de caracteristicas o embeddings internos: sus representaciones pueden servir en experimentos de analisis linguistico sobre indonesio, sin pretension de rendimiento de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del numero de parametros (124,77 M), sin datos oficiales del autor:

- VRAM estimada para inferencia en fp16: en torno a 0,25 GB solo de pesos, mas overhead de KV cache y activaciones; en la practica cabe holgadamente en cualquier GPU con 2-4 GB libres.
- VRAM estimada en fp32: alrededor de 0,5 GB de pesos, tambien muy por debajo de cualquier GPU moderna.
- VRAM estimada en int8/int4: aproximadamente 0,125 GB y 0,06 GB respectivamente, apto para CPU o dispositivos de bajos recursos.
- GPU recomendadas: no requiere GPU de gama alta; funciona en RTX 3060, RTX 4090, T4, A100 o H100 sin aprovechar apenas su capacidad. Cabe incluso en CPU para inferencia ocasional.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer actual e incluso en placas integradas con memoria suficiente.
- Opciones de despliegue: al ser un modelo transformers con pesos en safetensors y etiqueta `text-generation-inference`, es compatible con Hugging Face Transformers, Text Generation Inference (TGI), vLLM, FriendliAI (aparece listado en esa plataforma) y, previa conversion, con llama.cpp u Ollama en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera una latencia muy baja y un throughput alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407 | 124,77 M | no disponible | no disponible | Hugging Face (180 descargas) |
| goldfish-models/ind_latn_100mb (modelo base) | ~124 M | no disponible | no disponible en esta ficha | Hugging Face |
| francesca9805/ind-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible (aprox. 39 M segun variantes similares) | no disponible | no disponible | Hugging Face |
| fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455 | 39,1 M | no disponible | no disponible | LLM Explorer / Hugging Face |

Los checkpoints hermanos se diferencian por el tamano de corpus (`100mb` frente a `10mb`), la mezcla de datos y la semilla (`seed3407`, `seed10`, `seed455`), lo que confirma que forman parte de un mismo barrido experimental. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un corpus monolingue reducido (Goldfish) y de un SFT no descrito, es probable que reproduzca sesgos del corpus original, pero no hay analisis publicado.
- Riesgo de alucinacion: alto. Con 124 millones de parametros y un ajuste fino ligero sobre un corpus pequeno, la coherencia factual sera muy limitada y las respuestas pueden ser incorrectas o inventadas.
- Limitaciones de contexto: se desconoce la longitud de contexto efectiva; el ajuste SFT podria haberla alterado respecto al modelo base y no se declara.
- Limitaciones de idioma: el modelo no declara idiomas soportados; la nomenclatura apunta a indonesio en escritura latina, por lo que el rendimiento en castellano o en otros idiomas sera presumiblemente pobre.
- Restricciones de licencia: la licencia es no disponible; la model card usa el marcador `licence: license` sin concretar condiciones, por lo que no se puede garantizar el uso comercial y habria que contactar con la autora antes de cualquier despliegue en produccion.
- Caveat de produccion: no hay benchmarks, ni evaluacion de robustez, ni garantia de soporte; no se recomienda su uso en aplicaciones de cara al usuario sin una validacion exhaustiva previa.
- Es un artefacto de investigacion: su proposito principal es experimental, no operativo, y su mantenimiento futuro no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/ind_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Experimento en Weights & Biases (proyecto new-tokenizers): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/m9p7szvl
- Checkpoint hermano (10mb, seed10): https://huggingface.co/francesca9805/ind-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Checkpoint hermano en ingles (seed3407, FriendliAI): https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Checkpoint relacionado de fpadovani (39,1 M) en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Find-latn-10mb-ppt-Dp-100mb_seed455
