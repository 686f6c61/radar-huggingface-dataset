# francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado de `goldfish-models/eus_latn_10mb`, un modelo monolingue de tipo GPT-2 orientado al euskera (codigo de idioma `eus`, escritura latina `latn`). Lo publica la usuaria `francesca9805` y se ha entrenado con la libreria TRL, dentro de una linea de experimentos academicos vinculada a la Universidad de Groningen (segun la URL de Weights & Biases del autor). Por su tamano, es un modelo de investigacion mas que un modelo de produccion.

Con 39.087.104 parametros totales (unos 39,1 millones) y un repositorio de apenas 0,1 GB, se situa muy por debajo de los modelos generativos habituales, lo que lo convierte en una pieza util para estudiar tokenizacion, regimenes de empaquetado de datos y estabilidad de entrenamiento en lenguas de bajos recursos, no para tareas generales de alta calidad. La nomenclatura del nombre delata ese caracter experimental: `10mb` (corpus de entrenamiento de 10 MB), `packed` (secuencias empaquetadas), `seed10` (semilla 10) y el sufijo `bfd`.

Su relevancia actual es acotada pero concreta: sirve como banco de pruebas reproducible para comparar variantes de preprocesado de datos en euskera frente a otros ajustes de la misma familia (versiones de 100 MB, otras semillas y otros idiomas como turco, danes o ingles). No se ha publicado informacion sobre licencia, idiomas declarados ni longitud de contexto en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 (~39,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin GGUF oficial) |
| Idiomas soportados | no disponible en la model card; el identificador sugiere euskera (`eus`, escritura latina) |
| Licencia | no disponible (la model card incluye el marcador `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, heredada de `goldfish-models/eus_latn_10mb`, un modelo monolingue entrenado sobre un corpus de 10 MB. El ajuste se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se detalla en la model card el volumen de tokens de ajuste, la composicion del dataset ni si hubo etapas de RLHF o DPO; solo se indica que el entrenamiento fue de tipo SFT.

El elemento distintivo es el propio pipeline experimental: el nombre del modelo codifica decisiones de preprocesado (corpus de 10 MB, secuencias `packed`, variante `Dp`, semilla `seed10`), lo que sugiere un estudio controlado de como afectan el empaquetado de datos y la semilla a un modelo pequeno en una lengua de bajos recursos. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o capas hibridas SSM; se trata de un transformer estandar reentrenado.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (39 M de parametros) y por el corpus de 10 MB de la base.
- Continuacion de texto en euskera presumiblemente, aunque el modelo no declara idiomas oficialmente.
- Ajuste por instrucciones mediante SFT con TRL, con un ejemplo de uso conversacional en la model card (formato de mensajes `role`/`content`).
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo `thinking`, vision, audio ni otras modalidades.
- Utilidad principal como objeto de estudio: ablaciones de tokenizacion, empaquetado de datos y sensibilidad a la semilla.

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: permite comparar como distintas decisiones de vocabulario y preprocesado afectan a la perplejidad en euskera, dado su origen en el proyecto "new-tokenizers" de Weights & Biases.
- Estudios de ablacion reproducibles: la nomenclatura basada en semilla (`seed10`) y el empaquetado (`packed`) facilitan replicar experimentos y medir varianza entre ejecuciones.
- Linea base (baseline) en articulos academicos: al ser un modelo de 39 M de parametros y 0,1 GB, se puede entrenar y evaluar repetidamente con presupuesto minimo para comparar contra variantes de 100 MB u otros ajustes.
- Demostraciones educativas de fine-tuning con TRL: su tamano permite ejecutar el ciclo completo de SFT en una sola GPU de consumo, ideal para ensenar el flujo `Trainer` + `TRL`.
- Generacion de texto experimental en euskera con fines de analisis linguistico, asumiendo baja calidad y necesidad de revision humana.
- Pruebas de despliegue ligero y cuantizacion: sirve para validar pipelines de inferencia (transformers, TGI, conversiones a GGUF) en entornos con recursos muy limitados, incluido CPU.
- Punto de partida para ajustes posteriores en dominios muy especificos del euskera, donde un modelo pequeno puede bastar si el vocabulario es cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni equivalentes en euskera, y la busqueda web no aporta cifras de evaluacion para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 160 MB de pesos; en FP16/BF16, unos 80 MB; en INT8, unos 40 MB; en INT4, unos 20 MB. Con cache de activaciones y overhead, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una iGPU con suficiente memoria compartida sirven sobradamente.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050 Ti en adelante), y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), y conversion manual a GGUF para llama.cpp u Ollama (no se publican pesos GGUF oficiales).
- Latencia y throughput estimados: no disponibles. Por tamano, el coste por token es minimo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10 | 39,1 M | no disponible | euskera (presunto) | no disponible | Objeto de esta ficha; SFT sobre goldfish-models/eus_latn_10mb |
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible (familia de 39 M) | no disponible | euskera (presunto) | no disponible | Variante con corpus de 100 MB; permite medir el efecto del volumen de datos |
| fpadovani/eus-latn-10mb-ppt-shuff-dyck-10mb_seed455 | 39,1 M | no disponible | euskera (presunto) | no disponible | Variante con datos `shuff`/`dyck` y semilla 455; util como control experimental |
| francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10 | no disponible | no disponible | turco (presunto) | no disponible | Mismo pipeline aplicado al turco; control entre idiomas |
| francesca9805/dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10 | no disponible | no disponible | danes (presunto) | no disponible | Mismo pipeline aplicado al danes |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus de 10 MB en euskera es probable que refleje los sesgos y las limitaciones de cobertura de esa fuente, no detallada en la model card.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido numero de parametros y la escasa cantidad de datos; no debe usarse para generar informacion factual sin verificacion.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni lista de idiomas; el identificador sugiere euskera, pero no hay confirmacion oficial. El uso en otros idiomas no esta respaldado.
- Restricciones de licencia: la licencia no esta disponible (la model card contiene el marcador `licence: license` sin valor), por lo que no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue comercial.
- Caveat de produccion: se trata de un artefacto de investigacion con 185 descargas y 0 likes en el momento de la consulta; no hay garantias de mantenimiento, soporte ni evaluacion independiente.
- Fecha de creacion declarada: 2026-09-23, posterior a la fecha de redaccion habitual de fichas tecnicas; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Variante de 100 MB: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante `shuff-dyck` de la misma familia: https://llm-explorer.com/model/fpadovani%2Feus-latn-10mb-ppt-shuff-dyck-10mb_seed455,7dLUWuy7QdhtQN6cNsbiZR
- Variante en turco: https://friendli.ai/models/francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante en danes: https://friendli.ai/models/francesca9805/dan-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante en ingles: https://savrn.com/models/eng-latn-10mb-after-ppt-dp-100mb-packed-ckpt500-seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/foodktqn
- Repositorio de TRL: https://github.com/huggingface/trl
