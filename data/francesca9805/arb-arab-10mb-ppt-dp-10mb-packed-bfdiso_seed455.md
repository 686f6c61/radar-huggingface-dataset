# francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino de tipo SFT (supervised fine-tuning) sobre `goldfish-models/arb_arab_10mb`, un checkpoint monolingue del proyecto Goldfish orientado al árabe estándar (codigo ISO 639-3 `arb`). Se trata de un transformer de arquitectura GPT-2 con 39.087.104 parametros, publicado en safetensors y con pipeline de `text-generation`. El repositorio ocupa 0,1 GB.

El nombre del modelo codifica el experimento del que procede: `ppt` (probablemente una variante de tokenizador o de preprocesado), `Dp-10mb-packed` (datos empaquetados de 10 MB con alguna forma de duplicacion o repeticion), `bfdiso` (probablemente *byte fallback* con desambiguacion) y `seed455` (semilla del experimento). El autor lo entrena con TRL 0.23.0 y lo registra en un proyecto de Weights & Biases denominado `new-tokenizers`, lo que apunta a una linea de investigacion sobre tokenizadores y su efecto en modelos de bajos recursos, no a un modelo destinado a produccion.

Su relevancia es, por tanto, experimental: sirve como artefacto reproducible para comparar configuraciones de tokenizacion y de datos en un regimen de 10 MB de corpus y ~39 M de parametros. No cuenta con descargas ni likes en el momento de la consulta, y la model card no declara licencia, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no incluye GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible en la model card; el identificador del modelo base (`arb`) corresponde al codigo ISO 639-3 del arabe estandar |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posicion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal y normalizacion previa a la atencion, escalado a 39.087.104 parametros (aproximadamente 0,039 mil millones). No se declara ningun cambio estructural respecto al checkpoint base `goldfish-models/arb_arab_10mb`, heredado directamente. El modelo se ha entrenado mediante SFT con la libreria TRL, lo que implica un ajuste supervisado sobre pares de ejemplo-respuesta o sobre texto empaquetado, no un proceso de RLHF ni de DPO.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni la receta de empaquetado (`10mb-packed`), mas alla de que el sufijo sugiere un corpus de 10 MB empaquetado en secuencias contiguas para maximizar el aprovechamiento de la ventana. Tampoco se especifican hiperparametros, epocas ni tasa de aprendizaje, aunque la model card enlaza el run de Weights & Biases `7b18iwif` del proyecto `f-padovani-university-of-groningen/new-tokenizers`, que es la fuente donde residirian esos detalles. El entorno de entrenamiento declarado es TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El sufijo `seed455` identifica la semilla, lo que confirma que el objetivo es la reproducibilidad comparativa entre variantes del mismo experimento.

## Capacidades

- Generacion de texto autoregresiva basica, con el pipeline `text-generation` de Transformers.
- Manejo de entradas conversacionales en formato de lista de mensajes (`[{"role": "user", "content": ...}]`), segun el ejemplo de la model card.
- Modelo ajustado especificamente para seguir instrucciones simples mediante SFT; el ejemplo publicado plantea una pregunta abierta en ingles.
- Capacidad multilingue: no documentada; por herencia del checkpoint base, el foco esperable es el arabe estandar, sin confirmacion en la informacion disponible.
- Razonamiento, matematicas, codigo, vision, audio, tool calling y uso agentico: no disponibles ni documentados.
- Compatibilidad declarada con text-generation-inference y con endpoints, segun las etiquetas del repositorio.
- No se declara modo de pensamiento (*thinking*), decodificacion especulativa ni ninguna innovacion de inferencia.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo forma parte de una familia de experimentos (`new-tokenizers`) y sirve como punto de comparacion reproducible con semilla fija frente a otras configuraciones del mismo corpus de 10 MB.
- Reproduccion de experimentos de SFT: al estar etiquetado con `generated_from_trainer` y `trl`, permite reconstruir la receta con TRL 0.23.0 y validar resultados a partir del run de Weights & Biases enlazado.
- Pruebas de infraestructura de inferencia: con 39 M de parametros y pesos safetensors, es util para validar despliegues en text-generation-inference o endpoints sin consumo relevante de GPU.
- Generacion de texto exploratoria en arabe: como ejercicio academico de modelado de lenguaje en un idioma con recursos limitados, evaluando fluidez y coherencia en fragmentos cortos.
- Linea base para *ablations* de datos: el sufijo `10mb-packed` sugiere variantes con distinto volumen o empaquetado; este checkpoint puede actuar como referencia de 10 MB frente a las variantes de 100 MB de la misma familia.
- Docencia y prototipado: por su tamano, cabe en cualquier portatil y permite demostrar el ciclo completo de ajuste fino, publicacion en el Hub e inferencia sin infraestructura especializada.
- Comparacion entre lenguas del proyecto Goldfish: junto con variantes como `urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10`, facilita estudiar el efecto del idioma en el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 aproximadamente 156 MB de pesos; en fp16/bf16 unos 78 MB; en int8 unos 40 MB; en int4 unos 20 MB. A ello hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. El modelo no requiere A100, H100 ni similares; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna lo ejecutan sin problema.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas y en la mayoria de iGPU. Tambien es viable en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: Transformers (`pipeline("text-generation", ...)`), text-generation-inference (declarado en las etiquetas del repositorio) y endpoints compatibles. Ollama o llama.cpp requeririan una conversion previa a GGUF, no incluida en el repositorio.
- Ejemplo de uso declarado por el autor:

```python
from transformers import pipeline

question = "If you had a time machine, but could only go to the past or the future once and never return, which would you choose and why?"
generator = pipeline("text-generation", model="francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455", device="cuda")
output = generator([{"role": "user", "content": question}], max_new_tokens=128, return_full_text=False)[0]
print(output["generated_text"])
```

- Latencia y throughput estimados: no disponibles. Con este tamano, la latencia estara dominada por el *overhead* del framework mas que por el computo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455` | 39.087.104 | no disponible | no disponible | HuggingFace, 0 descargas | Objeto de esta ficha; SFT sobre `goldfish-models/arb_arab_10mb` |
| `goldfish-models/arb_arab_10mb` | no disponible | no disponible | no disponible | HuggingFace | Modelo base del anterior; mismo idioma objetivo (`arb`) |
| `francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10` | no disponible | no disponible | no disponible | HuggingFace, friendli.ai | Variante de la misma familia con corpus de 100 MB y semilla 10 |
| `francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10` | no disponible | no disponible | no disponible | HuggingFace | Variante de la misma familia centrada en urdu (`urd`) y semilla 10 |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: 39 M de parametros y un corpus base de 10 MB implican una capacidad de generalizacion muy limitada; no es adecuado como asistente general ni para tareas de produccion con exigencia de calidad.
- Riesgo de alucinacion elevado y coherencia limitada: con este presupuesto de parametros y datos, es esperable la deriva tematica y la repeticion en generaciones medianamente largas.
- Sesgos: no documentados. No se ha publicado ninguna evaluacion de sesgo, toxicidad o sesgo de genero para este checkpoint ni para su modelo base.
- Idiomas: la model card no declara idiomas soportados. El identificador del modelo base apunta al arabe estandar, pero no hay confirmacion oficial en la informacion disponible.
- Contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en conversaciones multi-turno largas.
- Licencia: ausente o sin especificar (`licence: license` es un marcador de posicion). No hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Procedencia de los datos: no se detalla la composicion del corpus de 10 MB ni su origen, por lo que no puede descartarse contenido con derechos de terceros.
- Advertencia de produccion: sin benchmarks publicados, sin evaluacion de robustez y sin licencia clara, el modelo no deberia desplegarse en entornos con usuarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/arb-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/7b18iwif
- Variante de la misma familia (100 MB, semilla 10): https://huggingface.co/francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en urdu de la misma familia: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Ficha de la variante de 100 MB en FriendliAI: https://friendli.ai/models/francesca9805/arb-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL: von Werra et al., "TRL: Transformer Reinforcement Learning", GitHub, 2020.
