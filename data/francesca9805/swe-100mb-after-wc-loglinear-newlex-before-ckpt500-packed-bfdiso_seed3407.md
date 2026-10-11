# francesca9805/swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

`swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407` es un modelo de generacion de texto de aproximadamente 124,8 millones de parametros (124.770.816 segun los pesos en safetensors) publicado por el usuario `francesca9805`. Se trata de un ajuste fino (fine-tuning) supervisado del modelo base `francesca9805/ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed3407`, realizado con la libreria TRL de Hugging Face. Por las etiquetas del repositorio, la arquitectura subyacente corresponde a la familia GPT-2, es decir, un transformer decoder-only.

El modelo pertenece a una serie de experimentos del mismo autor cuyos nombres sugieren variantes de tokenizacion o construccion de lexico (terminos como `newlex`, `loglinear` o `uniform`) sobre un corpus de aproximadamente 100 MB, y con semillas y checkpoints fijos (`seed3407`, `ckpt500`). El prefijo `swe` apunta, probablemente, al codigo ISO del sueco, aunque la model card no documenta el idioma de forma explicita. Se trata de un modelo de investigacion, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

Su relevancia es limitada fuera del contexto experimental: no es un modelo orientado a produccion, no publica resultados de benchmarks y no documenta licencia ni idiomas. Resulta de interes principalmente para quien quiera reproducir o comparar experimentos de tokenizacion y ajuste fino de modelos pequenos basados en GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2, segun etiquetas del repositorio) |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el prefijo `swe` del nombre sugiere sueco, pero no esta confirmado en la documentacion) |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio (`transformers`, `gpt2`), el modelo es un transformer decoder-only de la familia GPT-2 con 124.770.816 parametros. El modelo base declarado es `francesca9805/ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed3407`, y este modelo se presenta como un ajuste fino del anterior. El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, en la version 0.23.0, junto con Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO (la model card solo menciona SFT). Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre del modelo y de sus variantes hermanas (`newlex`, `loglinear` frente a `uniform`, `after-wc` frente a `before`, `ckpt500`, `seed3407`, `100mb`, `packed`) apunta a una linea de experimentos controlados sobre tokenizacion o construccion de vocabulario y sobre el empaquetado de secuencias, pero estos detalles no estan documentados en la model card y no deben darse por confirmados.

## Capacidades

- Generacion de texto autoregresiva, conforme a la etiqueta `text-generation` del pipeline.
- Conversacion de un solo turno a traves de la interfaz de pipeline que acepta mensajes con rol `user` (segun el ejemplo de la model card).
- No hay evidencia documentada de soporte de tool calling ni de function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues; el idioma o idiomas de entrenamiento no se especifican.
- No se documentan capacidades especiales (modo de razonamiento, vision, audio, etc.).
- Compatibilidad declarada con text-generation-inference y con endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Reproduccion de experimentos de investigacion: el modelo forma parte de una serie controlada de variantes (distintas estrategias de tokenizacion o de empaquetado) y sirve para comparar el efecto de cada decision sobre un mismo corpus de aproximadamente 100 MB.
- Analisis de tokenizacion: dado el enfasis del nombre en `newlex` y en variantes `loglinear` frente a `uniform`, es util para estudiar como afecta la construccion del vocabulario a la generacion de texto en modelos pequenos.
- Generacion de texto de bajo coste: con unos 125 M de parametros, puede ejecutarse en CPU o en GPU de gama baja para tareas de generacion de texto no criticas o de relleno.
- Experimentos de ajuste fino sobre GPT-2: sirve como punto de partida o de comparacion para nuevas fases de SFT con TRL en entornos academicos.
- Evaluacion de tecnicas de empaquetado de secuencias: el sufijo `packed` sugiere que el modelo se entreno con secuencias empaquetadas, lo que lo hace util para medir el impacto de esa tecnica en el rendimiento final.
- Docencia y aprendizaje: por su tamano reducido, es apropiado para ilustrar el flujo completo de SFT con TRL en cursos o talleres.
- Pruebas de integracion de infraestructura: al ser compatible con text-generation-inference y endpoints, puede emplearse como modelo de prueba para validar pipelines de despliegue sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, los 124,8 M de parametros ocupan aproximadamente 500 MB; en FP16/BF16, alrededor de 250 MB; en int8, en torno a 125 MB. Fuentes externas (LLM Explorer) estiman un consumo de VRAM de aproximadamente 0,2 GB para un modelo de este tamano.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050 o superiores). No se requiere hardware de gama alta.
- Si cabe en GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas con memoria suficiente.
- Ejecucion en CPU: viable, dado el reducido numero de parametros.
- Opciones de despliegue: la model card emplea `transformers` con `pipeline("text-generation")`. El repositorio esta etiquetado como compatible con text-generation-inference. Tambien seria desplegable con vLLM o llama.cpp, aunque no se documenta soporte explicito ni conversion a GGUF. Un proveedor externo (FriendliAI) lista variantes de esta serie para despliegue, pero no se confirma para este identificador exacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion se limita a otras variantes de la misma serie publicadas por el mismo autor, ya que no se dispone de datos frente a modelos de referencia de la comunidad.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407` (este modelo) | 124,8 M | no disponible | no disponible | Variante `loglinear`, ajustada con SFT/TRL |
| `swe-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` | no disponible | no disponible | no disponible | Variante `uniform` de la misma familia |
| `ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10` | 86,5 M | no disponible | no disponible | Variante mas pequena de la serie |
| `tur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10` | 124,8 M | no disponible | no disponible | Otra variante de tamano similar y semilla distinta |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real entre estas variantes ni frente a modelos de la misma categoria de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un modelo ajustado sobre un corpus de aproximadamente 100 MB sin filtrado declarado puede reproducir sesgos presentes en esos datos.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido tamano (124,8 M de parametros) y la ausencia de fases de alineacion mas alla del SFT.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados; el prefijo `swe` sugiere sueco, pero no esta confirmado. No debe asumirse un buen rendimiento en castellano u otros idiomas.
- Restricciones de licencia: la licencia no esta disponible. La model card incluye un campo `licence: license` sin contenido, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Estado del repositorio: sin descargas ni interacciones, lo que sugiere un modelo experimental sin validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay datos publicados que permitan estimar su calidad real frente a alternativas.
- Advertencia general: no es un modelo orientado a produccion ni a tareas criticas; debe tratarse como un artefacto de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swe-100mb-after-wc-loglinear-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-loglinear-newlex-swe-before-100mb-packed-bfdiso_seed3407
- Variante `uniform` de la misma serie: https://huggingface.co/francesca9805/swe-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/dc82uwbn
- Ficha en LLM Explorer de un modelo de la misma serie (124,8 M): https://llm-explorer.com/model/francesca9805%2Ftur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,4DLoBa7wgbPEoviH1byDDP
- Ficha en LLM Explorer de otra variante (86,5 M): https://llm-explorer.com/model/francesca9805%2Fppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10,6jSGieoixHpmGRdNgO5QLk
- Despliegue en FriendliAI de una variante de la serie: https://friendli.ai/models/francesca9805/swe-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
