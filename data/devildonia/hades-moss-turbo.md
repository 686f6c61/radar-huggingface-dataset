# DeVilDoNia/HaDeS-MOSS-Turbo

## Resumen

HaDeS-MOSS-Turbo es un conjunto de dos LoRAs de destilación few-step para el modelo de difusión texto-a-imagen MOSS-Image SFT, desarrollado por el usuario DeVilDoNia bajo el paraguas del proyecto HaDeS MOSS Suite. El objetivo es reducir el coste de inferencia de MOSS-Image de 25 pasos con CFG 2.5 a solo 4 pasos con CFG 1, manteniendo la calidad de composición y el seguimiento de instrucciones del modelo base. Cada adaptador pesa únicamente 3,4 MB, con rango 2 y aplicado exclusivamente a las capas 24 a 41 del modelo.

La relevancia de esta publicación reside en su eficiencia extrema: se entrenó desde cero en una única RTX 5090 en aproximadamente 45 minutos (más 19 minutos para generar las imágenes de regresión), y produce una aceleración de más de 6x en el número de pasos de muestreo. Se distribuyen dos variantes con perfiles distintos: `Turbo` prioriza la robustez en el renderizado de texto y layouts, mientras que `Turbo Diverse` conserva mejor la diversidad de semillas del modelo SFT original en prompts abiertos.

El modelo se enmarca en el ecosistema ComfyUI, con integración tanto mediante nodos estándar (`LoraLoaderModelOnly` + `KSampler`) como a través de los nodos propios de la suite HaDeS MOSS. No se trata de un modelo autónomo, sino de un adaptador que requiere el checkpoint base MOSS-Image SFT, su text encoder y su VAE para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de destilación sobre modelo de difusión MOSS-Image SFT (text-to-image) |
| Parametros totales | No disponible (LoRA de rango 2, 3,4 MB por archivo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el LoRA se aplica sobre el modelo base en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DMD (distribution matching distillation) con un término de regresión, implementado en `tools/moss_dmd_train.py` dentro de la suite HaDeS MOSS. El procedimiento mantiene una copia congelada en bf16 del modelo SFT y aplica dos LoRAs como hooks en fp32: el generador (rango 2, capas 24 a 41, inicializado desde cero) y un fake-score LoRA (rango 32, todas las capas). El profesor es el propio SFT a CFG 3, con el pase negativo saltando la capa 22, siguiendo la receta de akhaliq. El generador se entrena sobre el schedule euler/simple de 4 pasos con la simulación hacia atrás de DMD2.

El término de regresión, con peso 0,05, se aplica hacia 256 imágenes generadas por el SFT a 25 pasos desde ruidos fijos. Su función es preservar el mapeo semilla-a-imagen del profesor, ya que DMD por sí solo colapsa a una única composición por prompt. El entrenamiento se realizó exclusivamente a 512 x 512, con 1.024 prompts generados, batch 1, learning rate 5e-5 y 2.000 actualizaciones. La variante `Turbo` corresponde a la actualización 1.600 y `Turbo Diverse` a la 1.000 de la misma ejecución. No se utilizaron pesos del LoRA de akhaliq, solo su receta.

## Capacidades

- Aceleración de la inferencia de MOSS-Image SFT de 25 pasos a 4 pasos con CFG 1, manteniendo la calidad de composición.
- Generación de texto-a-imagen con seguimiento de instrucciones de layout, incluyendo JSON de layout y carteles de varias líneas.
- Renderizado de texto en imagen: carteles de tres líneas y letreros grandes funcionan de forma fiable; el texto pequeño es más frágil.
- Generación a resoluciones altas (1024x1024, 1344x768, 2048x2048, 768x1344) sin fallos de composición reportados.
- Preservación de la diversidad de semillas en prompts abiertos (variante `Turbo Diverse`).
- Seguimiento de instrucciones de etnia cuando se especifican explícitamente en el prompt (18/18 en las pruebas del autor).
- Compatible con nodos estándar de ComfyUI y con los nodos de la suite HaDeS MOSS.
- No soporta tool calling, agentes, visión ni audio: es un adaptador de difusión texto-a-imagen.

## Casos de uso

- Generación de carteles y material promocional con texto integrado: el adaptador `Turbo` acierta 12/12 en carteles de tres líneas y 6/6 en layouts JSON en las pruebas del autor, lo que lo hace adecuado para prototipado rápido de piezas gráficas con titulares.
- Iteración rápida de conceptos visuales en estudio de diseño: al reducir de 25 a 4 pasos, un artista puede generar y descartar decenas de variantes por minuto en una sola GPU de consumo, acelerando la exploración de direcciones creativas.
- Producción de imágenes a alta resolución para impresión o web: el adaptador mantiene composiciones limpias a 2048x2048 y 1344x768, útil para fondos, ilustraciones y banners donde el texto pequeño no sea crítico.
- Generación de variaciones controladas por semilla en pipelines de contenido: la variante `Turbo Diverse` conserva la dispersión de rostros, poses y objetos del SFT, lo que sirve para poblar catálogos o escenas con múltiples sujetos.
- Integración en flujos ComfyUI existentes sin reentrenar: al ser un LoRA de 3,4 MB, se puede cargar con `LoraLoaderModelOnly` sobre el checkpoint MOSS-Image SFT y sustituir el KSampler por la configuración de 4 pasos/CFG 1.
- Pruebas de concepto en hardware de consumo: el entrenamiento y la inferencia caben en una RTX 5090, lo que permite a desarrolladores individuales experimentar con destilación few-step sobre modelos de difusión sin infraestructura de datacenter.
- Evaluación comparativa de recetas de destilación: el adaptador sirve como referencia reproducible (receta, scripts y resultados publicados) para investigadores que quieran replicar o mejorar DMD con término de regresión.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del propio autor a 1024x1024 con `LoraLoaderModelOnly`, euler/simple, 4 pasos, CFG 1, comparando con el LoRA de 4 pasos v2.0 de akhaliq (rango 128, todas las capas, 1,2 GB). Los recuentos son visuales y los de etnia aproximados.

| Prueba | akhaliq 4-step v2.0 | Turbo v0.6 | Turbo Diverse v0.6 |
|---|---|---|---|
| Letrero y cartel de tres líneas, 6 semillas cada uno | 12/12 | 12/12 | 12/12 |
| Layout JSON, 6 semillas: cadenas correctas | 5/6 | 6/6 | 5/6 |
| Layout JSON: título de dos líneas según su `\n` | 0/6 | 4/6 | 1/6 |
| Cartel de tres líneas a 1344x768, 3 semillas | 2/3 | 3/3 | 0/3 |
| Letrero a 1344x768, 3 semillas | 2/3 | 2/3 | 3/3 |
| "photograph of a woman sitting in a café", 16 semillas: asiática oriental | ~15/16 | ~14-15/16 | ~9-10/16 |
| Prompts explícitos de etnia (3 x 6 semillas) | 18/18 | 18/18 | 18/18 |
| 2048x2048 calle, pescador, letrero; 768x1344 pescador, letrero, zorro (3 semillas cada uno) | limpio | limpio | limpio |
| 2048x2048 letrero: línea pequeña "open 7am - 3pm" correcta | 2/3 | 1/3 | 2/3 |
| Segundos por imagen a 2048x2048 (RTX 5090, SageAttention, mediana de 9) | 7,2 | 6,9 | 7,2 |

El autor señala que en un prompt abierto el SFT a 25 pasos produce aproximadamente 10 mujeres asiáticas orientales en 16 semillas; `Turbo Diverse` mantiene esa mezcla, mientras que `Turbo` y el LoRA de akhaliq generan casi exclusivamente mujeres asiáticas orientales. No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 3,4 MB por archivo, pero requiere el checkpoint MOSS-Image SFT en bf16 (`moss_image_sft_bf16`), su text encoder y su VAE para funcionar.
- Entrenamiento realizado en una única RTX 5090; no se especifica la VRAM utilizada.
- Inferencia medida en RTX 5090 con SageAttention: 6,9 s (Turbo) y 7,2 s (Turbo Diverse y akhaliq) por imagen a 2048x2048, mediana de 9 ejecuciones.
- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del checkpoint base y de la resolución.
- GPU recomendadas: RTX 5090 (medida por el autor). Otras GPU no han sido probadas según la información disponible.
- Despliegue: ComfyUI con nodos estándar (`LoraLoaderModelOnly` + `KSampler`) o con los nodos HaDeS MOSS Suite (`MOSS Turbo LoRA` + `MOSS KSampler`).
- No se reportan datos de throughput para otras GPU ni para otros backends (vLLM, TGI, llama.cpp no aplican a un modelo de difusión de este tipo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HaDeS-MOSS-Turbo v0.6 | LoRA few-step (rango 2, capas 24-41) | 3,4 MB | No aplica | 4 pasos/CFG 1; 6/6 en layout JSON; 4/6 en título de dos líneas | Apache 2.0 | Hugging Face |
| HaDeS-MOSS-Turbo-Diverse v0.6 | LoRA few-step (rango 2, capas 24-41) | 3,4 MB | No aplica | 4 pasos/CFG 1; 5/6 en layout JSON; mayor diversidad de semillas | Apache 2.0 | Hugging Face |
| akhaliq/MOSS-Image-SFT-4-steps | LoRA few-step (rango 128, todas las capas) | 1,2 GB | No aplica | 4 pasos/CFG 1; 5/6 en layout JSON; 0/6 en título de dos líneas | Apache 2.0 | Hugging Face |
| MOSS-Image SFT (base) | Modelo de difusión completo | No disponible | No aplica | 25 pasos/CFG 2.5; ~10/16 mujeres asiáticas en prompt abierto | Apache 2.0 | Hugging Face (OpenMOSS-Team) |

La comparativa se limita a los modelos mencionados en la información proporcionada; no se dispone de datos de otros adaptadores few-step para MOSS-Image ni de benchmarks estandarizados que permitan comparaciones más amplias.

## Limitaciones y advertencias

- Sesgo demográfico: en prompts abiertos como "photograph of a woman sitting in a café", las variantes `Turbo` y el LoRA de akhaliq generan casi exclusivamente mujeres asiáticas orientales (~14-15/16), frente a ~10/16 del SFT. `Turbo Diverse` mitiga parcialmente este sesgo (~9-10/16).
- El sesgo se corrige especificando la etnia en el prompt (18/18 en las pruebas), pero no de forma automática.
- Texto pequeño en imágenes de alta resolución es frágil: a 2048x2048, la línea "open 7am - 3pm" solo acierta 1/3 en `Turbo` y 2/3 en las otras variantes.
- Solo se han medido los ajustes indicados: 4 pasos, CFG 1, fuerza de LoRA 1.0, euler/simple, shift 5.0. Otros valores de fuerza, pasos, img2img con denoise inferior a 1.0 o edición no han sido evaluados en calidad, aunque funcionan.
- No se han probado otros modelos base (Base, finetunes, merges) distintos de MOSS-Image SFT; el autor verificó que un finetune int8 y img2img a denoise 0.6 se ejecutan, pero sin evaluar calidad.
- El adaptador depende del checkpoint base MOSS-Image SFT, el text encoder y el VAE; no es un modelo autónomo.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución a MOSS-Image SFT (OpenMOSS Team) y a la receta de akhaliq.
- Los recuentos de benchmarks son visuales y aproximados, no mediciones automáticas; el autor lo advierte explícitamente.
- No hay información sobre sesgos lingüísticos o culturales más allá del demográfico reportado, ni sobre robustez frente a prompts adversarios.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de referencia de akhaliq: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Repositorio HaDeS MOSS Suite (scripts y resultados): https://github.com/Devildonia/HaDeS-MOSS-Suite
- Resultados completos de entrenamiento y evaluación: https://github.com/Devildonia/HaDeS-MOSS-Suite/blob/main/tools/RESULTS.md
- Checkpoint ComfyUI de MOSS-Image: https://huggingface.co/Comfy-Org/MOSS-Image
