# francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de la familia GPT-2 con 86.508.288 parametros (unos 86,5 millones). Lo publica el usuario de HuggingFace `francesca9805`, vinculado a un proyecto de investigacion sobre tokenizadores (el enlace de seguimiento apunta al proyecto de Weights & Biases `f-padovani-university-of-groningen/new-tokenizers`), y ha sido entrenado con la libreria TRL de HuggingFace mediante SFT (supervised fine-tuning).

Por su tamano y su naturaleza experimental, no es un modelo orientado a produccion generalista, sino una pieza mas dentro de una serie de experimentos reproducibles con semillas fijas (el nombre incluye `seed3407`, y en el buscador aparecen variantes como `seed10`) y con etiquetas que sugieren comparaciones de tokenizadores (`newlex`), atencion de ventana deslizante (`swa`) y estados "before"/"after". La model card es minima: no documenta dataset, hiperparametros, idiomas ni licencia.

El interes practico de la ficha esta, por tanto, en caracterizar correctamente un modelo pequeno de investigacion: entender su arquitectura GPT-2, su tamano de ~86,5 M de parametros (que permite inferencia en CPU o en cualquier GPU de consumo) y las limitaciones derivadas de la ausencia de documentacion y de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (deducido del tag `gpt2` y del modelo base) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-2 suele emplear 1024 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior a int8/int4 via herramientas externas) |
| Idiomas soportados | no disponible (el modelo base se denomina `eng_latn_100mb`, lo que sugiere ingles en escritura latina, pero no se confirma) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido util) |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, segun el tag `gpt2` y el modelo base `goldfish-models/eng_latn_100mb`. La familia de modelos "goldfish" son GPT-2 pequenos entrenados de forma monolingue sobre subconjuntos de ~100 MB de corpus por idioma; en este caso el identificador `eng_latn_100mb` apunta a un subconjunto de ingles en escritura latina de unos 100 MB. Con 86.508.288 parametros, el modelo se situa en el rango de los GPT-2 pequenos, lo que implica una capacidad de modelado limitada en comparacion con modelos actuales.

El entrenamiento se ha realizado con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El nombre del modelo (`newlex`, `swa`, `before`, `packed`, `bfdiso`) y el proyecto asociado (`new-tokenizers`) indican que forma parte de una linea de experimentos sobre tokenizacion y variantes de atencion, con semillas fijas para garantizar reproducibilidad. No se documenta ninguna innovacion tecnica adicional verificable.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base GPT-2.
- Ajuste fino supervisado (SFT) sobre datos no especificados, lo que puede haber especializado parcialmente el estilo o el dominio de las respuestas.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base sugiere predominancia de ingles, pero no se confirma.
- No se documentan capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa nativa).

## Casos de uso

- Experimentacion academica en tokenizacion: el modelo forma parte de una serie de variantes (`before`/`after`, `newlex`, `swa`) pensadas para comparar el efecto de distintas decisiones de tokenizacion sobre el mismo corpus de ~100 MB; se usaria como punto de comparacion reproducible con semilla fija.
- Pruebas de reproducibilidad de fine-tuning: dado que el nombre incluye `seed3407`, sirve para replicar experimentos con semillas controladas y medir varianza entre ejecuciones.
- Prototipado rapido en local: con ~86,5 M de parametros, puede ejecutarse en CPU o en una GPU de consumo para validar pipelines de generacion de texto sin coste de infraestructura.
- Generacion de texto de dominio restringido: si el ajuste SFT se hizo sobre un corpus especifico, podria emplearse para completar o generar texto de ese estilo, siempre que se valide manualmente por la falta de documentacion.
- Educacion y docencia: util como ejemplo minimo de un pipeline completo `transformers` + `TRL` para explicar fine-tuning con SFT a estudiantes.
- Evaluacion de herramientas de despliegue: al estar etiquetado como `endpoints_compatible` y `text-generation-inference`, sirve para probar integraciones con TGI, FriendliAI u otros runners de inferencia.
- Investigacion sobre atencion de ventana deslizante: la etiqueta `swa` en el nombre sugiere que el modelo puede usarse para estudiar variantes de atencion sobre contextos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente ~346 MB; en FP16/BF16 ~173 MB; en int8 ~87 MB; en int4 ~43 MB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (RTX 3060, RTX 4090, A100, H100 son mas que suficientes). Tambien funciona correctamente en CPU.
- Cabe en consumer GPU: si, en practicamente todas, incluidas GPUs integradas y portatiles de gama baja.
- Opciones de despliegue: `transformers` (pipeline de text-generation), Text Generation Inference (TGI, ya que el modelo esta etiquetado como `endpoints_compatible`), vLLM, llama.cpp/Ollama previa conversion a GGUF, y plataformas externas como FriendliAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de milisegundos en GPU y throughput alto en CPU multihilo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-...-seed3407` | 86,5 M | no disponible | sin benchmarks | no disponible | HuggingFace (0 descargas, 0 likes) |
| `goldfish-models/eng_latn_100mb` (base) | no disponible en la busqueda | no disponible | sin benchmarks en la busqueda | no disponible | HuggingFace |
| `francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfd_seed10` (variante) | no disponible | no disponible | sin benchmarks | no disponible | HuggingFace, FriendliAI |
| GPT-2 small (referencia de familia) | 124 M (dato publico ampliamente conocido, no verificado en la busqueda) | 1024 tokens (referencia de familia) | benchmarks publicos historicos | MIT (referencia de familia) | HuggingFace, multiples runners |

No se dispone de datos de rendimiento ni de contexto para las alternativas dentro de la informacion proporcionada; la comparativa se limita a parametros y disponibilidad, y varias celdas quedan como no disponibles.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe dataset, hiperparametros, objetivos de entrenamiento ni evaluacion, lo que impide auditar sesgos o comportamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; en ausencia de licencia explicita, debe asumirse que no hay permiso claro para produccion.
- Riesgo de alucinacion: un GPT-2 pequeno (~86,5 M) tiende a generar texto plausible pero no verificado, con mayor probabilidad de incoherencias que modelos grandes.
- Sesgos conocidos: no evaluados ni reportados; los corpus de ~100 MB suelen contener sesgos de la fuente original sin filtrar.
- Limitaciones de contexto: la ventana efectiva no esta documentada; aunque GPT-2 usa 1024 tokens por defecto, no se garantiza en este ajuste.
- Limitaciones de idioma: probablemente centrado en ingles, pero no confirmado; el rendimiento en castellano es incierto.
- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Fechas de creacion/actualizacion registradas como 2026-09-30, lo que resulta anomala y sugiere metadatos inconsistentes.
- El nombre contiene sufijos tecnicos (`swa`, `bfdiso`, `packed`) cuyo significado no se aclara en la model card, lo que dificulta interpretar exactamente que se ha entrenado.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/1xfro6zf
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada (`after`, seed10): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfd_seed10
- Variante relacionada (`nor`, seed10): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed10
- Despliegue en FriendliAI de una variante: https://friendli.ai/models/francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/ppt-wc-uniform-newlex-swa-before-100mb-packed-bfd_seed3407
