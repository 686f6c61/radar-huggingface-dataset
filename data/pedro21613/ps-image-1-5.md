# Pedro21613/PS-IMAGE-1.5

## Resumen

PS-IMAGE-1.5 es un adaptador LoRA de generación de imágenes texto-a-imagen desarrollado por el usuario Pedro21613 sobre `stabilityai/stable-diffusion-xl-base-1.0`. No es un modelo completo, sino un ajuste fino de bajo rango (r=16, alpha=32) que se aplica sobre el UNet de SDXL y que se distribuye en formato `safetensors` con la librería `diffusers`, con un tamano de repositorio de 1,2 GB. Su objetivo declarado es mejorar dos puntos débiles típicos de SDXL: la representación de texto legible dentro de la imagen (rótulos, carteles, neones, placas) y la respuesta a prompts en idiomas distintos del inglés.

El modelo es una evolución incremental de PS-IMAGE-1.4: se inicializa con los pesos de esa versión y se continúa el entrenamiento durante 700 pasos adicionales con 400 imágenes de 768 px centradas en texto y con captions en inglés, portugués, español, francés y alemán. El autor también reporta una mejora de velocidad de inferencia, no por cambios arquitectónicos, sino por recomendar un scheduler más eficiente (DPM++ 2M Karras con 20 pasos en lugar de PNDM con 28) junto con VAE slicing, lo que según sus mediciones en una Tesla T4 reduce el tiempo entre un 7 % y un 31 % por caso (media aproximada del 20 %).

Es relevante ahora porque cubre un nicho concreto y muy demandado: generar creatividades con texto corto legible (1-3 palabras más números) sin salir del ecosistema SDXL, y hacerlo con prompts en cinco idiomas. La contrapartida es su escasa tracción: 2 descargas y 0 likes en el momento de redactar esta ficha, licencia no declarada y ausencia de benchmarks de calidad publicados más allá de las comparativas visuales del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre el UNet de SDXL 1.0 (difusión latente, doble text encoder CLIP ViT-L + OpenCLIP ViT-bigG) |
| Parametros totales | no disponible (adaptador LoRA; no se especifica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión); resolución de entrenamiento 768×768 px |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `safetensors` fp16; el ejemplo usa `torch.float16`) |
| Idiomas soportados | captions de entrenamiento en inglés, portugués, español, francés y alemán; el autor indica que el prompting en inglés sigue siendo el más fiel |
| Licencia | no disponible (la model card no la declara; el modelo base SDXL se rige por su propia licencia) |
| Formato de pesos | `safetensors` (adaptador LoRA compatible con PEFT y `diffusers`) |

## Arquitectura y entrenamiento

Técnicamente es un adaptador LoRA sobre el UNet de Stable Diffusion XL, un modelo de difusión latente con un UNet y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG) que permiten condicionamiento por prompt y por metadatos de tamaño. El adaptador mantiene el mismo formato que su predecesor (r=16, alpha=32, mismos módulos objetivo) y se inicializa con los pesos de PS-IMAGE-1.4, por lo que es "drop-in" respecto a esa versión y posteriormente se fusiona con `merge_and_unload()` sobre el UNet base.

El entrenamiento se realizó con 400 imágenes nuevas de 768 px (rótulos de tienda, neones, pósteres, camisetas, papel, placas) que contienen letras y números, con captions repartidos a partes iguales entre cinco idiomas (80 en inglés, 80 en portugués, 80 en español, 80 en francés y 80 en alemán). Se ejecutaron 700 pasos con batch efectivo 4, learning rate 3e-5 con schedule coseno, optimizador AdamW, min-SNR con gamma=5, sobre una Tesla T4, con una loss final de 0,0057. El autor publica checkpoints cada 100 pasos en `checkpoints/step_*` para permitir retomar el entrenamiento. No se documenta ningún proceso de RLHF, DPO ni preferencias humanas, algo coherente con un ajuste de difusión de este tipo.

## Capacidades

- Generación de imágenes fotorrealistas a partir de texto en el pipeline `text-to-image` de `diffusers`, heredando las capacidades del SDXL base.
- Rendering de texto corto legible dentro de la imagen: el autor reporta mejora notable en cadenas de 1-3 palabras más números (por ejemplo "PADARIA 123", "CAFE 24h", "FESTA 2025", "ABERTO 50", "MERCADO 7").
- Especialización declarada en personas, coches y texturas, preservadas del ajuste 1.4 mediante un learning rate bajo (3e-5) y la inicialización desde esos pesos.
- Prompting multilingüe directo en portugués, español, francés y alemán, con mejor respuesta que en la versión 1.4, aunque el autor recomienda traducir a inglés para máxima fidelidad.
- Soporte de integración con traductores ligeros (por ejemplo `Helsinki-NLP/opus-mt-mul-en`) como paso previo al prompt.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, visión, audio ni modo "thinking"; son ajenas a un modelo de difusión texto-a-imagen.
- Compatibilidad con aceleradores de inferencia estándar del ecosistema SDXL: schedulers alternativos (DPM++ 2M Karras) y VAE slicing para reducir memoria y tiempo.

## Casos de uso

- Rótulos y señalética comercial: generar carteles de tienda, placas o letreros con texto corto ("ABERTO 50", "PADARIA 123") para mockups de branding o previsualización de fachadas, aprovechando el entrenamiento específico en 400 imágenes de rótulos y la mejora en legibilidad.
- Neones y cartelería nocturna: producir letreros luminosos con texto breve ("CAFE 24h") para escaparates, locales de ocio o ambientación de escenas nocturnas, usando el ejemplo de prompt y semilla que el autor documenta.
- Pósteres y material promocional: crear carteles de eventos con títulos y años ("FESTA 2025") como base para revisión posterior en herramientas de diseño, dado el foco del ajuste en pósteres y posters.
- Creatividades localizadas en varios idiomas: generar la misma pieza variando el idioma del prompt (portugués, español, francés, alemán) gracias a los captions multilingües de entrenamiento, útil para campañas en mercados distintos.
- Fotografía de producto y automoción: imágenes fotorrealistas de coches con reflejos, pintura brillante y superficies mojadas, y texturas de materiales, apoyándose en el apartado de coches y texturas que el autor afirma haber preservado.
- Retratos y contenido humano realista: generación de retratos con textura de piel detallada y luz natural, útil para bancos de imágenes sintéticas o prototipado de personajes.
- Iteración rápida en pipelines de difusión: al recomendar 20 pasos con DPM++ 2M Karras en lugar de 28 con PNDM y activar VAE slicing, encaja en flujos de generación por lotes donde el tiempo por imagen importa.
- Integración en aplicaciones `diffusers`/`peft`: el adaptador se carga como `PeftModel` sobre el UNet y se fusiona con `merge_and_unload()`, lo que facilita incorporarlo a servicios existentes basados en SDXL sin cambiar el pipeline.

## Benchmarks y rendimiento

El autor no publica benchmarks de calidad (FID, CLIP score, precisión de texto tipo OCR, etc.). Los únicos datos numéricos disponibles son de velocidad en una Tesla T4 a 768×768 px, comparando PS-IMAGE-1.4 (PNDM, 28 pasos) con PS-IMAGE-1.5 (DPM++ 2M Karras, 20 pasos + VAE slicing):

| Caso | Semilla | 1.4 (28 pasos) | 1.5 (20 pasos) | Observacion |
|---|---|---|---|---|
| Placa tienda "PADARIA 123" (EN) | 24000 | 17,1 s | 14,1 s | Texto corto legible |
| Neon "CAFE 24h" (EN) | 24001 | 16,4 s | 15,2 s | Escena nocturna |
| Poster "FESTA 2025" (EN) | 24002 | 17,7 s | 15,6 s | Texto y numero |
| Persona en el parque (regresion) | 24000 | 18,8 s | 14,6 s | Retrato fotorrealista |
| Coche blanco bajo la lluvia (regresion) | 24000 | 20,5 s | 14,1 s | Reflejos, pintura |
| Placa "ABERTO 50" (PT directo) | 24003 | 19,9 s | 14,1 s | Prompt en portugues |
| Cartel "MERCADO 7" (ES directo) | 24003 | 19,0 s | 14,3 s | Prompt en espanol |

No se han publicado resultados de benchmarks de calidad en la informacion disponible. El autor advierte que el primer caso de cada sesion incluye calentamiento de hardware, por lo que el porcentaje de mejora oscila entre el 7 % y el 31 % según el caso.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeno (el repositorio completo ocupa 1,2 GB, incluyendo checkpoints), pero requiere cargar el SDXL base 1.0 en memoria.
- VRAM estimada para inferencia: en torno a 8-12 GB en fp16 para el pipeline SDXL completo con resolución 768×768; el autor no especifica cifras exactas.
- GPU recomendadas: el autor valida su flujo en NVIDIA Tesla T4. Por requisitos de VRAM, son adecuadas tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4090) y GPUs de datacenter (A100, H100). No se aportan mediciones propias para estas GPUs.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; por debajo de ese umbral habría que recurrir a offloading o cuantizaciones del modelo base, no documentadas en la ficha.
- Opciones de despliegue: `diffusers` + `peft` (flujo oficial del autor), con scheduler `DPMSolverMultistepScheduler` (`use_karras_sigmas=True`, `algorithm_type="dpmsolver++"`) y `vae.enable_slicing()`. No se documentan instrucciones para llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: en Tesla T4, 768×768 px y 20 pasos, entre 14,1 s y 15,6 s por imagen en los casos reportados. No hay datos de throughput por lote ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PS-IMAGE-1.5 | LoRA sobre SDXL 1.0 | LoRA r=16/alpha=32 (recuento no disponible) | difusion, 768×768 de entrenamiento | captions EN/PT/ES/FR/DE | no disponible | HuggingFace, 2 descargas |
| PS-IMAGE-1.4 | LoRA sobre SDXL 1.0 | LoRA r=16/alpha=32 | difusion, 768×768 | solo ingles | no disponible | HuggingFace (predecesor directo) |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo de difusion completo | no disponible en esta informacion | difusion, hasta 1024×1024 | principalmente ingles | licencia propia de Stability AI | HuggingFace, ampliamente usado |

La comparativa con modelos de lenguaje de la misma categoria no aplica: PS-IMAGE-1.5 es un adaptador de difusion, no un LLM. Como alternativas de la misma tarea (generacion de imagen con texto legible) no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que ningún SDXL acierta el texto siempre: PS-IMAGE-1.5 mejora en cadenas cortas (1-3 palabras más números), pero los textos largos todavía pueden fallar; recomienda generar 2-3 variaciones y elegir la mejor.
- La licencia no está declarada en la model card ni en los metadatos de HuggingFace, lo que impide confirmar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar antes este punto y revisar la licencia del modelo base SDXL.
- No hay benchmarks de calidad publicados: las únicas evidencias son comparativas visuales del autor con semillas fijas, sin métricas objetivas (FID, CLIP score, precisión OCR del texto generado).
- Tracción mínima: 2 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Riesgo de regresión en dominios no relacionados con el texto: el ajuste es corto (700 pasos) y con learning rate bajo, pero el autor dedica una sección explícita a comparativas de "regresión" en personas y coches, lo que indica que existe ese riesgo.
- El prompting en inglés rinde mejor que en portugués, español, francés o alemán; el autor recomienda un traductor ligero como paso previo, lo que añade latencia y una dependencia externa.
- Idiomas soportados oficialmente no declarados en los metadatos; la información sobre multilingüismo proviene únicamente de los captions de entrenamiento.
- Sesgos conocidos: no se documentan análisis de sesgo demográfico, de representación ni de contenido. Al heredar el comportamiento de SDXL, es esperable el sesgo del modelo base, pero no está cuantificado.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir detalles incoherentes (manos, texto deformado, geometrías imposibles) que no corresponden al prompt.
- Fecha de creación declarada en los metadatos: 2026-10-11, posterior a la fecha habitual de publicación; conviene verificar la vigencia y el historial de actualizaciones antes de usarlo.
- La model card está escrita íntegramente en portugués, lo que puede dificultar su revisión por equipos hispanohablantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.5
- Versión predecesora PS-IMAGE-1.4: https://huggingface.co/Pedro21613/PS-IMAGE-1.4
- Versión anterior PS-IMAGE-1.3: https://huggingface.co/Pedro21613/PS-IMAGE-1.3
- Ficha de PS-IMAGE-1.0 en Free2AITools: https://free2aitools.com/model/pedro21613/ps-image-1.0
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Traductor ligero recomendado por el autor: https://huggingface.co/Helsinki-NLP/opus-mt-mul-en
