# darask0/MOSS-Image_4-step_adapter_lora

## Resumen

rapid-moss es un adaptador LoRA de destilación few-step para el modelo de texto a imagen MOSS-Image-SFT (OpenMOSS-Team), un DiT de 5.000 millones de parámetros. Su función es reducir el coste de inferencia de 50 pasos con CFG 3 (100 pasadas por el DiT) a 4 pasadas sin CFG, manteniendo el mismo pipeline de texto a imagen. El adaptador lo publica el usuario darask0 bajo licencia Apache 2.0 y se distribuye en formato diffusers/safetensors, con un script de inferencia y un nodo personalizado para ComfyUI.

Técnicamente no es un modelo independiente: es un conjunto de tres ficheros (LoRA en fp32 de rango 128, reemplazo del `time_embedding` y un fichero de estado del sampler en espacio de datos) que se aplican sobre los pesos de MOSS-Image-SFT. Parte del checkpoint de 8 pasos de lodestones (destilación DMD en espacio de datos, arXiv 2610.12102) y lo reentrena a 4 iteraciones con DMAD (arXiv 2610.02188), usando un crítico LoRA sobre el teacher congelado.

La relevancia práctica está en el coste: según el autor, el tiempo de DiT por imagen de 1024² en una H100 pasa de 16,2 s (teacher) a 0,81 s, y el pipeline completo en una RTX PRO 6000 se sitúa en 4,5–6,9 s por imagen incluyendo codificación de texto y VAE. El precio es un adaptador frágil en cuanto a formato: no se puede fusionar en los pesos, exige un sampler propio y no admite cuantización fp8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) base MOSS-Image-SFT de 5B parámetros + adaptador LoRA de destilación few-step (DMAD sobre DMD en espacio de datos) |
| Parametros totales | Base: 5B (DiT). Adaptador: LoRA fp32 rank 128 / alpha 128 sobre los 42 bloques (`proj.q, k, v, o, ffn_up_gate, ffn_down`), 1,19 GB; no se indica el número exacto de parámetros del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo texto a imagen; la condición textual la aporta el codificador Qwen3.5-9B) |
| Tipos de cuantizacion | El adaptador debe aplicarse en fp32 y los pesos base en bf16 o fp32; fp8 y otras cuantizaciones bajas no son compatibles (el nodo de ComfyUI devuelve error con fp8) |
| Idiomas soportados | Japones (ja) e ingles (en); renderizado de texto en japonés verificado en post-its, carteles, pósters y bocadillos |
| Licencia | Apache 2.0 (repo del adaptador) |
| Formato de pesos | safetensors: `lora.safetensors` (claves estilo kohya: `diffusion_model.<module>.lora_down.weight` / `lora_up.weight` / `alpha`), `time_embedding.safetensors` y `dataspace.safetensors` |
| Pasos de inferencia | 1 a 4 (4 recomendado; no se pueden superar 4 porque solo hay 4 `step_codes`) |
| CFG | No se usa (CFG = 1); sin prompts negativos, sin SLG y sin skip del bloque 22 |
| Resoluciones de entrenamiento | 1024x1024, 896x1152, 832x1216, 768x1344 y sus variantes apaisadas; múltiplos de 16, en torno a 1 megapíxel |
| Componentes externos | Codificador de texto Qwen3.5-9B (tipo `moss_image`) y VAE de FLUX.2 |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base: un Diffusion Transformer de 5B parámetros que, en su configuración original, genera imágenes con 50 pasos de muestreo y classifier-free guidance de escala 3, lo que equivale a 100 evaluaciones del DiT por imagen (incluido el paso negativo con skip del bloque 22). Sobre ese modelo congelado se aplica un LoRA de rango 128 y alpha 128 en las proyecciones de atención (q, k, v, o) y en las capas feed-forward de los 42 bloques, más un reemplazo completo de los módulos de `time_embedding` y de los sesgos de modulación (`shared_block_modulation.bias`, `video_head_modulation.bias`), necesarios porque el vector temporal de t=1 queda plegado en el sesgo.

El entrenamiento continúa el checkpoint de 8 pasos de lodestones, obtenido mediante DMD en espacio de datos (data-space DMD), y lo restringe a 4 iteraciones aplicando DMAD: un crítico LoRA entrenado sobre el teacher congelado separa muestras del teacher de muestras del estudiante, y el estudiante minimiza el logit negativo del crítico. El resultado es un sampler determinista sin reinyección de ruido ni planificación de timesteps: se mantiene el mismo ruido `z`, se calcula `x = z + Q·x0` con una matriz `latent_mix.Q` de 128x128 y se actualiza `x0 = z - transformer(x, codes[r], prompt_embeds, prompt_mask).sample` para cada uno de los cuatro `step_codes` (1000, 968, 926, 871). La decodificación final usa el VAE original con desnormalización por BatchNorm y unpatchify 2x2. El código de entrenamiento se incluye en `code/` del repositorio, con la implementación del modelo en `code/rapid_moss/model.py`.

## Capacidades

- Generación de imágenes texto a imagen en 4 pasos, sin CFG, sobre el pipeline de MOSS-Image-SFT.
- Generación parcial: el modelo también produce imágenes deteniéndose en 1, 2 o 3 iteraciones, aunque el autor no ha verificado la calidad de esas salidas intermedias.
- Composición escénica y detalle fino superiores al checkpoint de 8 pasos de lodestones según el autor, con algunas regresiones no detalladas.
- Renderizado de texto en japonés en soportes concretos: post-its, carteles, pósters y bocadillos.
- Acepta los tres formatos de prompt heredados de MOSS-Image: lenguaje natural, listas de etiquetas y layouts en JSON; el texto que debe dibujarse se delimita con comillas.
- Compatibilidad con ComfyUI mediante dos vías: nodo personalizado propio (`rapid-moss`) o loader estándar (`Load Diffusion Model` + `Load CLIP` + `Load VAE`) con el workflow `rapid-moss-4step-native.json`.
- Control de reproducibilidad por semilla: el ruido inicial se genera con `torch.randn` en CPU y fp32, de modo que `inference.py` y el nodo de ComfyUI producen el mismo ruido con la misma semilla (con diferencias menores por la implementación del codificador de texto).
- No soporta tool calling, agentes, visión de entrada ni audio: es exclusivamente un modelo de generación de imagen condicionada por texto.

## Casos de uso

- Prototipado rápido de conceptos visuales: con 0,81 s de DiT por imagen de 1024² en H100, un equipo de diseño puede iterar decenas de variantes por prompt en el tiempo que antes costaba una sola imagen del teacher de 50 pasos.
- Generación por lotes en producción editorial: el coste por imagen baja aproximadamente 20 veces respecto al modelo base (4 pasadas frente a 100), lo que hace viable rellenar catálogos o fondos de artículo con un presupuesto de GPU contenido.
- Rotulación en japonés para materiales promocionales: el adaptador permite generar carteles, pósters y post-its con texto legible en japonés, útil para maquetas de campañas dirigidas al mercado japonés.
- Previsualización en pipelines de arte conceptual: al integrarse en ComfyUI con un workflow nativo, encaja en flujos de trabajo por nodos donde se encadenan modelos, VAE y samplers para explorar variaciones de estilo.
- Composición guiada por layout JSON: la herencia del formateo de prompts de MOSS-Image permite describir la disposición de elementos de forma estructurada, aprovechable en plantillas de generación automática para e-commerce o mockups.
- Servicio de demostración o API de bajo coste: al no requerir CFG, se elimina la duplicación de cálculo por paso, lo que reduce la VRAM y el tiempo por petición en despliegues con GPUs de gama profesional (4,5–6,9 s por imagen de 1024² en RTX PRO 6000, extremo a extremo).
- Investigación sobre destilación few-step: el repositorio incluye el código de entrenamiento y los artefactos del sampler en espacio de datos, lo que sirve como referencia reproducible para experimentos con DMD/DMAD sobre otros DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, GenEval u otros) en la información disponible. El autor solo reporta medidas de tiempo de inferencia del DiT:

| Modelo | Pasos | Pasadas del DiT por imagen | Tiempo de DiT por 1024² en H100 |
|---|---|---|---|
| MOSS-Image-SFT (teacher, CFG 3, skip bloque 22) | 50 | 100 | 16,2 s |
| lodestones MOSS-Image-SFT-8-steps-dmd | 8 | 8 | 1,54 s |
| Este adaptador (4 pasos, DMAD) | 4 | 4 | 0,81 s |

| Medición adicional | Valor |
|---|---|
| Pipeline completo 1024² en RTX PRO 6000 (texto + VAE incluidos) | 4,5–6,9 s por imagen |
| Aceleración frente al teacher (solo DiT) | ~20x |
| Aceleración frente al checkpoint de 8 pasos | ~1,9x |

Las cifras de tiempo excluyen codificador de texto y VAE salvo donde se indica. No hay datos de throughput agregado (imágenes por segundo en batch) ni de latencia percentile.

## Requisitos de hardware

- VRAM adicional sobre el modelo base: aproximadamente 1,5 GB (1,19 GB del LoRA en fp32 más unos 0,34 GB del time path y las modulaciones en fp32).
- Pesos base: el DiT de 5B en bf16 ocupa del orden de 10 GB (estimación a partir del número de parámetros; el autor no publica la cifra exacta).
- Codificador de texto: Qwen3.5-9B, lo que en bf16 supone un coste de VRAM adicional considerable (estimación; no confirmado en la información disponible). Sumado al DiT y al VAE, el pipeline completo no cabe en GPUs de 16 GB sin offloading.
- GPU medidas por el autor: H100 (0,81 s de DiT por imagen de 1024²) y RTX PRO 6000 (4,5–6,9 s por imagen extremo a extremo).
- GPU consumer: no hay datos publicados. Por el tamaño conjunto del DiT y del codificador de texto, se requerirían tarjetas de 24 GB o más con offloading parcial; no verificado.
- Restricción crítica: los pesos base deben estar en bf16 o fp32. Con fp8 u otras cuantizaciones bajas el diferencial del LoRA se pierde y el reemplazo del time path no se aplica correctamente.
- Opciones de despliegue: script `inference.py` del repositorio (diffusers >= 0.38, transformers >= 5.3, accelerate, safetensors, huggingface_hub, pillow) y nodo personalizado de ComfyUI en `comfyui/rapid-moss/`.
- No compatible con loaders que fusionan el LoRA en los pesos: `fuse_lora` de diffusers, `LoraLoaderModelOnly` de ComfyUI o cualquier herramienta que exporte pesos bf16 ya fusionados. El adaptador debe sumarse en fp32 en tiempo de inferencia.
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo; no se documenta soporte en la información disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Pasos / CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darask0/MOSS-Image_4-step_adapter_lora | Adaptador LoRA few-step (DMAD) sobre MOSS-Image-SFT | 5B base + 1,19 GB de LoRA fp32 | 4 / sin CFG | Apache 2.0 | HuggingFace, diffusers, ComfyUI |
| OpenMOSS-Team/MOSS-Image-SFT | DiT base (teacher) | 5B | 50 / CFG 3 | No disponible en la información | HuggingFace |
| lodestones/MOSS-Image-SFT-8-steps-dmd | Adaptador few-step (data-space DMD) | 5B base + adaptador | 8 / sin CFG | No disponible en la información | HuggingFace |
| Adaptadores few-step de otras familias (p. ej. variantes destiladas de FLUX o SDXL) | Adaptador few-step | Depende del modelo base | 1–8 / variable | No disponible en la información | No comparable con los datos aportados |

La comparación relevante es interna a la familia MOSS-Image: este adaptador mejora la latencia del checkpoint de 8 pasos de lodestones (0,81 s frente a 1,54 s de DiT en H100) a costa de una mayor fragilidad de integración (requiere reemplazo del time path y sampler propio). No se dispone de datos de calidad objetivos para comparar con alternativas de otras familias.

## Limitaciones y advertencias

- El adaptador solo funciona sobre MOSS-Image-SFT. El entrenamiento y la inicialización parten de ese checkpoint; el comportamiento con MOSS-Image-Base no se ha comprobado.
- No se puede fusionar en los pesos: el diferencial del LoRA es menor que la precisión de redondeo de bf16, por lo que al fusionarlo el efecto desaparece prácticamente. Cualquier loader de tipo merge es inservible.
- Es obligatorio reemplazar los tres módulos de `time_embedding.safetensors` en fp32; aplicar solo el LoRA produce resultados incorrectos.
- El sampler es propio e incompatible con Euler, schedulers estándar (shift 5, etc.) o cualquier planificación de timesteps ajena al adaptador.
- CFG y prompts negativos están desactivados por diseño. Subir CFG por encima de 1 duplica el cálculo y puede degradar color y forma por doble efecto del guidance (el autor no lo ha probado). Tampoco deben aplicarse SLG ni el skip del bloque 22 del modelo original.
- Máximo 4 pasos: solo existen cuatro `step_codes`. Detenerse en 1, 2 o 3 pasos genera imagen, pero la calidad no está verificada.
- No admite cuantización fp8 u otras bajas: se pierde el diferencial del LoRA o falla el reemplazo del time path.
- Sesgo estilístico conocido: en imágenes de estilo pictórico o de pasta gruesa aparecen a veces inscripciones o kanjis no solicitados, un rasgo heredado del checkpoint de 8 pasos de lodestones (el teacher no lo presenta).
- Texto pequeño en carteles, noren o bocadillos de manga en blanco y negro tiende a producir caracteres sin sentido.
- Puede añadir personajes no solicitados en la composición, especialmente con prompts JSON.
- Idiomas: solo japonés e inglés documentados. El comportamiento con prompts en castellano no está verificado y podría degradar el renderizado de texto.
- Resoluciones fuera del rango entrenado (1024x1024, 896x1152, 832x1216, 768x1344 y sus apaisados) no han sido validadas; se recomienda múltiplos de 16 en torno a 1 megapíxel.
- No hay benchmarks de calidad publicados: las afirmaciones de "más detalle y composición más viva" frente al checkpoint de 8 pasos son cualitativas y el propio autor admite regresiones no especificadas.
- Reproducibilidad parcial: misma semilla implica mismo ruido, pero las diferencias entre la implementación del codificador de texto en transformers y en ComfyUI alteran detalles finos.
- Licencia Apache 2.0 para el adaptador; la licencia de los pesos base de MOSS-Image-SFT no se indica en la información disponible y debe comprobarse antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darask0/MOSS-Image_4-step_adapter_lora
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint de partida (8 pasos, DMD): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Repositorio oficial de MOSS-Image (nodos de ComfyUI): https://github.com/OpenMOSS/MOSS-Image
- Paper data-space DMD: arXiv 2610.12102
- Paper DMAD: arXiv 2610.02188
- Documentación del nodo de ComfyUI: `comfyui/rapid-moss/README.md` dentro del repositorio
- Script de inferencia: `inference.py` dentro del repositorio
- Código de entrenamiento: carpeta `code/` dentro del repositorio (implementación en `code/rapid_moss/model.py`)
