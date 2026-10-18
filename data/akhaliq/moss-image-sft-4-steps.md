# akhaliq/MOSS-Image-SFT-4-steps

## Resumen

MOSS-Image-SFT-4-steps es un adaptador LoRA de destilación para el modelo de difusión texto-a-imagen MOSS-Image-SFT, publicado por el usuario akhaliq sobre los pesos base de OpenMOSS-Team. Su proposito es reducir la generacion de una imagen de alta fidelidad a 4 pasos de muestreo con CFG 1 (sin classifier-free guidance ni prompt negativo), manteniendo el renderizado de texto bilingue chino-ingles que caracteriza a la familia MOSS-Image. La version 2.0 (18 de octubre de 2026) reescribe el adaptador como un unico `lora.safetensors` "Euler-native", es decir, entrenado directamente sobre el scheduler flow-matching Euler estandar que se distribuye con el modelo base, de modo que se carga con cualquier loader de LoRA convencional sin sampler propio ni ficheros auxiliares.

El modelo resuelve un problema muy concreto de produccion: los modelos de difusion de alta calidad suelen requerir entre 20 y 50 pasos mas CFG, lo que multiplica el coste por imagen y complica el despliegue en GPUs de consumo. Con 4 pasos y sin CFG, el autor reporta unos 11 segundos por imagen de 1024x1024 en una A100 y 5,6 segundos frente a los 11,2 segundos de la variante de 8 pasos de lodestones en la comparativa publicada. El transformer de difusion tiene 5.082.308.624 parametros segun los safetensors del repositorio.

El lanzamiento es relevante porque la destilacion few-step de modelos de difusion con texto legible es un cuello de botella abierto: bajar pasos suele degradar primero el texto fino y los digitos. El autor reclama la mejor fidelidad numerica de su categoria, con verificacion de resoluciones de 1024x1024, 1536x1024 y 2048x2048 sin tiling, y una licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow matching (MOSS-Image); adaptador LoRA de destilacion sobre el modelo base |
| Parametros totales | 5.082.308.624 (transformer de difusion, segun safetensors); el codificador de texto y el VAE se empaquetan aparte y su recuento no esta disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la entrada es un prompt de texto sin limite de tokens documentado |
| Tipos de cuantizacion | No disponible. El autor no publica variantes cuantizadas; la configuracion evaluada es base bf16 con LoRA fp32 sin fusionar, y existe un transformer fusionado en fp32 |
| Idiomas soportados | Renderizado de texto bilingue chino-ingles documentado; cobertura general de idiomas no disponible en los metadatos de HuggingFace |
| Licencia | Apache-2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (LoRA fp32 rango 128 / alpha 128; transformer fusionado fp32; base bf16); repo de 96,3 GB con checkpoints intermedios |

## Arquitectura y entrenamiento

La pieza central es un transformer de difusion con formulacion de flow matching (version Euler, con shift 5 en el scheduler `simple` de ComfyUI), sobre el que se aplica un LoRA de rango 128 y alpha 128 en las proyecciones `q`, `k`, `v`, `o`, `ffn_up_gate` y `ffn_down` de cada bloque, con claves en formato kohya. La destilacion se realizo mediante DMD en espacio de datos (paper arXiv 2610.12102), partiendo como warm-start de `lodestones/MOSS-Image-SFT-8-steps-dmd`, que a su vez deriva del modelo completo `OpenMOSS-Team/MOSS-Image-SFT`. La version 2.0 abandona el sampler propio en espacio de datos de la v1.x y entrena anclajes nativos sobre el schedule de release (t = 1000/910/717/24), lo que elimina la necesidad de `time_embedding.safetensors` y `dataspace.safetensors`.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables de forma estandar en difusion). El autor si menciona que la version 1.1 en adelante incorpora un "signage lexicon" para mejorar el renderizado de rotulacion comercial, menus e infografias, y que el repositorio incluye el script completo de entrenamiento (`train_dmd.py`) y los checkpoints de las rondas `euler-update-{100..600}` y los archivados `checkpoint-update-{250,500,750,1000}` del pipeline en espacio de datos.

## Capacidades

- Generacion de imagenes texto-a-imagen en 4 pasos de muestreo con CFG 1, sin prompt negativo.
- Renderizado de texto legible en carteles, menus, rotulos e infografias, con soporte bilingue chino-ingles ("深夜食堂", "OPEN 24H", "TODAY'S SPECIAL / Flat White $4.50").
- Fidelidad numerica en infografias: el autor reporta renderizado correcto de cifras secundarias como "62% / 38%", donde otras variantes few-step fallan.
- Generacion a resoluciones de 1024x1024, 1536x1024 y 2048x2048 sin necesidad de tiling.
- Carga como LoRA estandar en diffusers (`load_lora_weights`) y en ComfyUI (`LoraLoaderModelOnly`), asi como transformer fusionado en fp32 para maxima calidad.
- Inferencia por linea de comandos mediante `inference.py` incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modos de razonamiento: es un modelo puramente generativo texto-a-imagen.

## Casos de uso

- Rotulacion comercial y menús para retail y hosteleria: el adaptador esta entrenado sobre un lexico de rotulacion que le permite generar carteles con precios y nombres de producto legibles ("Flat White $4.50", "OPEN 24H"), lo que reduce el numero de iteraciones y el retoque tipografico posterior.
- Creatividades publicitarias en lote: con 4 pasos y CFG 1 el coste por imagen cae aproximadamente a una cuarta parte del de un pipeline de 20 pasos con guidance doble; el autor mide 11 s por 1024x1024 en una A100, adecuado para campanas con cientos de variantes.
- Infografias y visualizaciones con cifras: la fidelidad numerica reportada permite generar paneles con porcentajes y comparativas sin que los digitos se deformen, un fallo tipico de los modelos destilados agresivamente.
- Integracion en estudios de diseno via ComfyUI: al ser una unica LoRA sobre el modelo stock, se puede insertar en un grafo existente con `LoraLoaderModelOnly` (strength 1.0, sampler euler, scheduler simple, 4 pasos) sin reescribir el pipeline.
- Material de impresion o assets de alta resolucion: la generacion a 2048x2048 sin tiling evita las costuras y los artefactos de recomposicion que aparecen al generar por parches.
- Localizacion de creatividades para mercados chino e ingles: el soporte bilingue permite producir la misma pieza con rotulacion en ambos idiomas manteniendo coherencia visual.
- Investigacion en destilacion de difusion: el repositorio incluye `train_dmd.py`, los checkpoints por ronda y el dataset de evaluacion, lo que sirve de base reproducible para experimentos con DMD en espacio de datos frente a espacio latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIPScore, GenEval, T2I-CompBench) en la informacion disponible. El autor aporta unicamente comparativas internas de velocidad y fidelidad de texto, generadas con los mismos prompts y semillas:

| Metrica | Este modelo | lodestones `lora_latest` (8 pasos) | darask0 rapid-moss (4 pasos) |
|---|---|---|---|
| Pasos de muestreo | 4 | 8 | 4 |
| CFG | 1.0 | no disponible | no disponible |
| Tiempo por imagen (comparativa del autor) | 5,6 s | 11,2 s | no disponible |
| Tiempo 1024x1024 en A100 (bf16 + LoRA fp32) | ~11 s | no disponible | no disponible |
| Renderizado de cifras secundarias ("62% / 38%") | Correcto (según el autor) | Falla | Falla ("48% / 3∂%") |
| Renderizado de rotulos | Correcto ("AUUTERT" no aparece) | Falla ("AUUTERT") | no disponible |

Estos datos proceden de la evaluacion propia del autor (dataset `akhaliq/moss-image-turbo-eval`) y no de un benchmark independiente; deben tratarse como indicativos.

## Requisitos de hardware

- VRAM estimada para el transformer: unos 10,2 GB en bf16 y unos 20,3 GB en fp32 por los 5.082 millones de parametros. A ello hay que sumar el codificador de texto, el VAE y las activaciones, por lo que el pico real es superior (estimacion, no medida publicada).
- Configuracion evaluada por el autor: base en bf16 con la LoRA en fp32 sin fusionar. Fusionar la LoRA en bf16 degrada primero el texto fino, segun advierte la model card.
- GPU verificada: A100, con ~11 s por imagen de 1024x1024 en 4 pasos. No se especifica si es A100 de 40 GB u 80 GB.
- GPU de consumo: una RTX 4090 de 24 GB deberia poder ejecutar 1024x1024 en bf16 con la LoRA fp32; a 2048x2048 el margen es muy ajustado y probablemente requiera offload o el transformer fusionado en bf16 asumiendo perdida de calidad (estimacion).
- Despliegue: diffusers con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`; ComfyUI con `LoraLoaderModelOnly` y sampler euler/simple; CLI `inference.py`. No aplican vLLM, TGI, llama.cpp ni Ollama por tratarse de un modelo de difusion.
- Throughput: aproximadamente 5,5 imagenes por minuto por A100 a 1024x1024 en la configuracion medida (4 forwards por imagen). No hay datos de latencia para otras GPUs.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Pasos | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| akhaliq/MOSS-Image-SFT-4-steps | LoRA de destilacion sobre MOSS-Image | 5.082 M (transformer) | 4, CFG 1 | Prompt de texto | Apache-2.0 | HuggingFace, ComfyUI, diffusers |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base completo | 5.082 M (transformer) | Multiples pasos con CFG | Prompt de texto | no disponible en la informacion proporcionada | HuggingFace |
| lodestones/MOSS-Image-SFT-8-steps-dmd | LoRA destilado, 8 pasos | No disponible | 8 | Prompt de texto | no disponible | HuggingFace |
| darask0 rapid-moss | LoRA destilado, 4 pasos | No disponible | 4 | Prompt de texto | no disponible | HuggingFace |

La ventaja declarada frente a las alternativas few-step es la ejecucion en el sampler Euler de serie, sin sampler ni ficheros auxiliares, y una mejor fidelidad en texto y cifras. La desventaja es que hereda todas las limitaciones del modelo base y no dispone de benchmarks independientes que respalden las afirmaciones.

## Limitaciones y advertencias

- No hay resultados de benchmarks estandar publicados; las comparativas de calidad y velocidad son autoevaluaciones del autor con prompts y semillas seleccionados.
- El renderizado de texto, aun siendo el punto fuerte, sigue siendo fragil: la propia model card advierte que fusionar la LoRA en bf16 degrada el texto fino antes que cualquier otro elemento.
- La configuracion de maxima calidad exige mantener la LoRA en fp32, lo que incrementa el consumo de VRAM frente a un despliegue cuantizado convencional.
- El soporte multilingue documentado se limita a chino e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion visual y de sesgos heredados del dataset del modelo base: no se documenta composicion del dataset ni analisis de sesgos.
- La licencia Apache-2.0 permite uso comercial, pero se aplica al adaptador; conviene verificar la licencia del modelo base `OpenMOSS-Team/MOSS-Image-SFT`, que no figura en la informacion disponible.
- El repositorio pesa 96,3 GB por los checkpoints intermedios y el transformer fusionado; para produccion conviene descargar solo `lora.safetensors` y los componentes del pipeline.
- La v2.0 rompe compatibilidad con los adaptadores v1.x en espacio de datos: quien migre debe cambiar el loader y no reutilizar `time_embedding.safetensors` ni `dataspace.safetensors`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Demo en ZeroGPU: https://huggingface.co/spaces/akhaliq/moss-image-4-step-turbo
- Dataset de evaluacion: https://huggingface.co/datasets/akhaliq/moss-image-turbo-eval
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint de arranque (8 pasos DMD): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Paper de destilacion DMD en espacio de datos: https://arxiv.org/abs/2610.12102
- ML Intern (herramienta usada para construir el modelo): https://hf.co/chat?mode=ml-intern
