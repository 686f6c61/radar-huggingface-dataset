# 4Fever4/siwa-kershef-sdxl-lora

## Resumen

Siwa Kershef Architecture es un adaptador LoRA para Stable Diffusion XL 1.0 publicado por el usuario 4Fever4 bajo el identificador `4Fever4/siwa-kershef-sdxl-lora`. Enseña al modelo base a generar la arquitectura de tierra conocida como *kershef*, propia del oasis de Siwa (Egipto), mediante el token disparador `k3rshef`. No es un modelo de lenguaje ni un modelo de difusión completo: es un conjunto de pesos de bajo rango (rank 16, alpha 8) que se cargan sobre la UNet de SDXL 1.0 y anaden aproximadamente 0,2 GB al repositorio.

El interes tecnico del proyecto no esta en la generacion de imagenes en si, sino en su enfoque experimental: la model card documenta explicitamente una evaluacion de *style bleeding* (filtracion de estilo) para comprobar si el LoRA permanece confinado a su token disparador o contamina otras arquitecturas. El autor compara, con las mismas semillas y prompts, las salidas del SDXL base frente a las del SDXL con el LoRA cargado, usando similitud CLIP contra el centroide del conjunto de entrenamiento.

El modelo se entrena con 112 imagenes capturadas y anotadas a mano, en una unica RTX 4060 de 8 GB durante unos 38 minutos (1.600 pasos, aproximadamente 14 epocas). La conclusion declarada de la version v1 es que el estilo se filtra hacia arquitecturas egipcias vecinas (New Cairo, Nubia, Mamluk), mientras que se mantiene estable en referencias nordicas y en Al-Qasr Dakhla. Se anuncia una v2 con regularizacion de preservacion de priors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre la UNet de SDXL 1.0; difusion latente text-to-image |
| Parametros totales | no disponible (adaptador LoRA; rank 16, alpha 8, solo UNet; repositorio de 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens por codificador de texto, limite heredado de los codificadores CLIP de SDXL (dato del modelo base, no especificado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se distribuye en safetensors y el modelo base admite fp16/bf16 |
| Idiomas soportados | no disponible (las descripciones del dataset estan en ingles) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (`siwa_kershef_sdxl_lora_v1.safetensors`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 (VAE con correccion fp16) |
| Token disparador | `k3rshef` |
| Resolucion de entrenamiento | 1024 px de base, bucketing por relacion de aspecto entre 640 y 1536 px |
| Dataset | 4Fever4/siwa-kershef-architecture (112 imagenes con licencia individual) |
| Pipeline | text-to-image (libreria `diffusers`) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se entrena exclusivamente sobre la UNet de SDXL 1.0, con rango 16 y alpha 8, dejando intactos los codificadores de texto y el VAE. El entrenamiento se realizo con kohya-ss/sd-scripts sobre 112 imagenes anotadas y descritas a mano, con bucketing por relacion de aspecto (640-1536 px) y resolucion base de 1024 px. La configuracion del optimizador es AdamW8bit con tasa de aprendizaje 1e-4, programacion coseno, 100 pasos de calentamiento, min-SNR con gamma igual a 5 y desplazamiento de ruido de 0,0357. En total, 1.600 pasos (aproximadamente 14 epocas) con tamano de lote 1 y checkpoints cada 400 pasos.

La innovacion destacable es metodologica, no arquitectonica. El autor define un vocabulario de anotacion reutilizable en inferencia (`palm-trunk beams`, `thick tapered columns`, `small window openings`, `external staircase`, `crenellated parapet`, `tapered minaret`, `covered passage`) junto con modificadores de estado de conservacion (`restored`, `partially restored`, `newly built`, `eroded ruin`). Ademas, incluye un script de evaluacion (`scripts/evaluate.py`) que genera los mismos prompts con las mismas semillas con y sin el LoRA, y mide desplazamiento de estilo mediante CLIP ViT-L/14 con similitud coseno, distinguiendo prompts objetivo (con `k3rshef`) de prompts de control (sin disparador). Todo el entrenamiento cupo en una unica GPU de 8 GB en modo bf16 con checkpointing de gradiente y latentes y salidas de codificador de texto cacheados.

## Capacidades

- Generacion de imagenes text-to-image de arquitectura *kershef* del oasis de Siwa mediante el token `k3rshef`.
- Control de elementos constructivos concretos a traves del vocabulario de anotacion: vigas de tronco de palmera, columnas troncoconicas gruesas, vanos pequenos, escaleras exteriores, parapetos almenados, minaretes troncoconicos y pasajes cubiertos.
- Control del estado de conservacion del edificio generado: restaurado, parcialmente restaurado, de nueva construccion o ruina erosionada.
- Generacion de interiores, callejones, mezquitas, hoteles y viviendas dentro del estilo aprendido (segun los prompts de la evaluacion T1-T5).
- Composicion con el modelo base SDXL 1.0: el LoRA no sustituye al modelo, por lo que conserva las capacidades generales de SDXL (fotografia, iluminacion, composicion, otros estilos cuando no se invoca el disparador).
- Ajuste de intensidad mediante la escala de guia (ejemplo de la model card: 30 pasos, `guidance_scale` 6.5).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de generacion de imagenes, no un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), audio ni vision mas alla del propio pipeline de difusion.
- Capacidades multilingues: no disponible (las anotaciones y los prompts documentados estan en ingles).

## Casos de uso

- Visualizacion de intervenciones de restauracion en Siwa: un arquitecto o conservador puede generar la misma vivienda en estado `restored` y en estado `eroded ruin` para comparar escenarios de intervencion, aprovechando los modificadores de conservacion incluidos en la anotacion.
- Ilustracion editorial y divulgacion patrimonial: generar imagenes de arquitectura vernacula egipcia para articulos, libros o exposiciones sobre tecnicas constructivas con tierra, sal y troncos de palmera.
- Reconstruccion hipotetica de patrimonio: producir representaciones plausibles de edificaciones erosionadas o desaparecidas del oasis, siempre como ilustracion interpretativa y no como documentacion historica.
- Diseno de materiales para bioconstruccion: usar el vocabulario de elementos (`palm-trunk beams`, `thick tapered columns`, `crenellated parapet`) como tablero de exploracion visual de soluciones constructivas antes de pasar a CAD.
- Produccion de assets para videojuegos y entornos 3D: generar referencias de ambientacion norteafricana precolonial o vernacular para artistas de concepto, con control del estado de conservacion de cada edificio.
- Marketing turistico cultural del oasis: crear material promocional diferenciado del tipico repertorio faraonico, con imagenes de arquitectura *kershef* coherentes entre si.
- Estudio metodologico sobre *style bleeding* en LoRA: el script `scripts/evaluate.py` y las rejillas `eval/v1/grid_target.jpg` y `eval/v1/grid_control.jpg` permiten reproducir el experimento de filtracion de estilo con semillas fijas, util para investigadores que estudien aislamiento de conceptos en adaptadores de difusion.
- Aumento de datos para un futuro dataset: las imagenes generadas con control de prompt y condicion podrian servir como material sintetico complementario para ampliar las 112 imagenes originales, con la cautela de no introducir bucles de retroalimentacion.

## Benchmarks y rendimiento

La model card no presenta benchmarks de calidad de imagen convencionales (FID, CLIP score absoluto, comparativas contra otros LoRA). Lo que publica es una evaluacion propia de aislamiento de estilo con CLIP ViT-L/14 y similitud coseno, sobre prompts objetivo y de control, con 3 semillas por prompt.

Metricas definidas por el autor:
- `siwa_shift`: similitud al centroide del conjunto de entrenamiento con el LoRA menos la misma similitud con el modelo base. En prompts objetivo debe subir; en controles deberia quedar cerca de 0.
- `base_vs_lora_sim`: similitud entre la imagen generada por el modelo base y la generada con el LoRA para el mismo prompt y semilla. En controles, un valor cercano a 1 indica que la imagen no se ha alterado.

| Ejecucion | `siwa_shift` objetivo (sube) | `siwa_shift` control (tiende a 0) | Similitud base vs LoRA en control (tiende a 1) |
|---|---|---|---|
| v1 | +0,058 | +0,044 | 0,891 |

| Prompt | v1 (`siwa_shift` / similitud base vs LoRA) |
|---|---|
| T1_house (objetivo) | +0,071 / 0,810 |
| T2_alley (objetivo) | +0,008 / 0,849 |
| T3_interior (objetivo) | +0,067 / 0,785 |
| T4_mosque (objetivo) | +0,065 / 0,800 |
| T5_hotel (objetivo) | +0,077 / 0,855 |
| C1_alqasr (control) | +0,029 / 0,961 |
| C2_nubian (control) | +0,034 / 0,903 |
| C3_modern (control) | +0,097 / 0,813 |
| C4_mamluk (control) | +0,048 / 0,877 |
| C5_nordic (control) | +0,010 / 0,899 |

Lectura del autor: el desplazamiento objetivo (+0,058) es solo ligeramente superior al de control (+0,044), lo que indica filtracion clara hacia estilos egipcios vecinos. New Cairo moderno se vuelve beige y terroso (`siwa_shift` +0,097, el valor de control mas alto), Nubia pierde el azul de sus fachadas y la talla mameluca se aplana. Los prompts escandinavo y Al-Qasr Dakhla se mantienen estables. Se anuncia una v2 con regularizacion de preservacion de priors, sin resultados publicados en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: el autor lo ejecuto integramente en una unica RTX 4060 de 8 GB en bf16, con checkpointing de gradiente y latentes y salidas de codificador de texto cacheados. Tiempo aproximado: 38 minutos para 1.600 pasos. Esto da una referencia concreta de que el ajuste de un LoRA SDXL de rank 16 sobre 112 imagenes cabe en gama media.
- Inferencia: las necesidades de VRAM no estan publicadas en la model card. Como estimacion basada en el modelo base SDXL 1.0, los pesos en fp16 ocupan del orden de 7 GB y el pipeline completo ronda los 8-10 GB con atencion eficiente, por lo que una GPU de 8 GB puede ejecutarlo con offloading y una de 12 GB lo hace con holgura. Estas cifras son estimaciones, no datos verificados por el autor.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en adelante para uso comodo; RTX 4090, A100 o H100 para generacion por lotes y alta concurrencia.
- Resolucion de trabajo: 1024 x 1024 px, coherente con la resolucion base del entrenamiento.
- Opciones de despliegue: el unico flujo documentado es `diffusers`, cargando `StableDiffusionXLPipeline` y llamando a `load_lora_weights`. El adaptador es un safetensors de LoRA estandar para SDXL, por lo que la compatibilidad con otras interfaces del ecosistema (ComfyUI, Forge, InvokeAI) es esperable, aunque no esta verificada en la model card.
- Latencia y throughput: no disponibles. La model card solo documenta el tiempo de entrenamiento, no el de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `4Fever4/siwa-kershef-sdxl-lora` | Adaptador LoRA sobre UNet de SDXL | no disponible (rank 16, alpha 8, repo de 0,2 GB) | 1024 px; 77 tokens por codificador de texto heredados de SDXL | openrail++ | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| `stabilityai/stable-diffusion-xl-base-1.0` | Modelo de difusion latente completo | del orden de 3,5 B en total (UNet, codificadores de texto y VAE); dato del modelo base, no de la model card | 1024 px; 77 tokens por codificador de texto | openrail++ | Ampliamente disponible |
| Alternativa Flux con el mismo dataset (via ai-toolkit en una GPU de 24 GB) | LoRA sobre modelo de difusion rectificada | no disponible | no disponible | no disponible | Mencionada como trabajo futuro, no publicada |
| Otros LoRA de arquitectura vernacula para SDXL | Adaptadores LoRA | no disponible | no disponible | no disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

El autor senala explicitamente que la misma pipeline de datos, anotaciones y evaluacion es transferible a Flux, pero que el entrenamiento de un LoRA de Flux no cabe en una GPU de 8 GB, a diferencia de este caso con SDXL.

## Limitaciones y advertencias

- Experimento de un solo dia: la propia model card lo califica como indicativo y no como benchmark. La evaluacion usa 112 imagenes y 3 semillas por prompt, sin intervalos de confianza.
- Filtracion de estilo confirmada: en la version v1 el LoRA altera arquitecturas egipcias vecinas, con un desplazamiento de +0,097 en New Cairo moderno, +0,048 en Mamluk y +0,034 en Nubia. No debe usarse en un pipeline multi-estilo sin prompts negativos o sin descargar el adaptador cuando no se invoque `k3rshef`.
- Riesgo de alucinacion arquitectonica: el modelo puede inventar elementos constructivos que no correspondan a la tradicion *kershef* real. No es una fuente documental ni historica y sus salidas no deben presentarse como reconstrucciones fieles.
- Sobreajuste probable: rank 16 sobre 112 imagenes y aproximadamente 14 epocas. El desplazamiento objetivo mas bajo de la tabla (T2_alley, +0,008) sugiere que escenas concretas se ven poco afectadas y que la cobertura del estilo no es homogenea.
- Sesgos de dataset: las 112 imagenes proceden de una unica localizacion geografica y estan condicionadas por iluminacion, encuadre y estado de conservacion concretos. Es previsible un sesgo hacia paletas terrosas, luz desertica y un rango limitado de volumetrias.
- Licencia openrail++: permite uso comercial, pero incorpora restricciones de uso (use-based restrictions) en su anexo, entre ellas la prohibicion de determinados fines. Hay que revisar el texto completo antes de integrarlo en un producto comercial. Ademas, el dataset tiene licencia por imagen, por lo que la procedencia de cada una debe comprobarse si se redistribuye.
- Trazabilidad limitada: el repositorio no ha recibido descargas ni valoraciones, sin validacion externa de la comunidad y sin una guia de uso mas alla de la model card.
- Metrica proxy: la similitud CLIP no es una medida perceptual robusta. El propio autor recomienda inspeccionar las rejillas de `eval/v1/` y no fiarse solo de los numeros.
- Limitacion de idioma: la anotacion y los prompts estan en ingles, y no se especifica soporte para otros idiomas en el pipeline.
- Restriccion de hardware para evolucionar el modelo: llevar el mismo trabajo a Flux requiere una GPU de 24 GB, lo que limita la reproduccion del pipeline en equipos de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4Fever4/siwa-kershef-sdxl-lora
- Dataset: https://huggingface.co/datasets/4Fever4/siwa-kershef-architecture
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Libreria de inferencia (`diffusers`): https://github.com/huggingface/diffusers
- Scripts de entrenamiento utilizados (`kohya-ss/sd-scripts`): https://github.com/kohya-ss/sd-scripts
- Rejillas de evaluacion (dentro del repositorio): `eval/v1/grid_target.jpg` y `eval/v1/grid_control.jpg`
- Script de evaluacion (dentro del repositorio): `scripts/evaluate.py`
- Configuracion de entrenamiento (dentro del repositorio): `train.sh` y `dataset.toml`
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales.
