# lodestones/MOSS-Image-Base-8-steps-dmd

## Resumen

MOSS-Image-Base-8-steps-dmd es un checkpoint de destilación publicado por el usuario lodestones sobre OpenMOSS-Team/MOSS-Image-Base, un generador de imágenes de 5.082.308.624 parámetros (≈5,08 B) que trabaja en espacio latente con formulación de flow matching. El objetivo es reducir el coste de muestreo del modelo base, que requiere 50 pasos con classifier-free guidance (CFG 3), a 8 evaluaciones de red sin CFG. La técnica empleada es DMD en espacio de datos (data-space DMD), descrita en el preprint arXiv 2610.12102, en la que el generador itera sobre su propia estimación limpia partiendo de ruido fijo.

El repositorio no contiene un pipeline autónomo: distribuye el transformador en float32, un LoRA de rango 128, los pesos del embedder temporal y un fichero con la matriz de mezcla latente y los códigos de paso. El autor recomienda dos vías de uso: la más sencilla es cargar únicamente `lora.safetensors` sobre el transformador original de MOSS-Image-Base y muestrear con el sampler Euler estándar (shift 5, CFG 1, 4-8 pasos); la segunda reproduce la forma exacta del entrenamiento y exige cargar `transformer/` en fp32, porque el delta de destilación es menor que el paso de redondeo de bf16.

Su relevancia práctica es económica: pasar de 50 pasos con CFG (≈100 evaluaciones de red por imagen) a 8 evaluaciones sin CFG supone en torno a 12 veces menos cómputo por muestra, con la misma arquitectura y el mismo VAE. Es un trabajo en curso (el autor lo etiqueta explícitamente como *work-in-progress*) y no publica métricas de calidad, por lo que debe evaluarse empíricamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio latente con flow matching; destilación DMD en espacio de datos sobre OpenMOSS-Team/MOSS-Image-Base |
| Parametros totales | 5.082.308.624 (≈5,08 B) en el transformador; el pipeline completo añade codificador de texto y VAE del repositorio base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no se documentan resolución máxima ni longitud de prompt) |
| Tipos de cuantizacion | Pesos publicados en float32; el autor advierte de que convertir el transformador a bf16 descarta la mayor parte de la destilación. El LoRA en fp32 puede aplicarse sin fusionar sobre el transformador base en bf16 |
| Idiomas soportados | no disponible (el codificador de texto del modelo base es un Qwen3.5 de 8,39 B según una guía externa, pero la model card no documenta cobertura lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`transformer/` en fp32, `lora.safetensors`, `time_embedding.safetensors`, `generator.safetensors`, `dataspace.safetensors`); librería diffusers |
| Pasos de inferencia | 4-8 (8 NFE), sampler Euler de flow matching, shift 5, CFG 1 |
| Tamano del repositorio | 45,6 GB |
| Descargas / likes | 484 descargas, 15 likes |
| Fecha de publicacion | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformador de difusión que opera sobre latentes y se entrena con flow matching, con condicionamiento textual por embeddings de prompt y máscara. Sobre esa base, lodestones aplica una destilación DMD en espacio de datos (arXiv 2610.12102). A diferencia del DMD clásico, el generador no predice directamente x0 a partir de ruido nuevo en cada paso, sino que itera sobre su propia estimación limpia partiendo de un ruido fijo `z`: en cada paso calcula `x = z + Q·x0` mediante una mezcla latente aprendida (`latent_mix.Q`, matriz de 128×128) y obtiene `x0 = z − v`, donde `v` es la velocidad predicha por el transformador junto con un código de paso (`step_codes`, 8 valores). El resultado es un muestreo de 8 evaluaciones de red sin CFG, frente a las 50 evaluaciones con CFG 3 del modelo original.

El ajuste se materializa como un LoRA de rango 128 y alpha 128 aplicado a las proyecciones `q`, `k`, `v`, `o`, `ffn_up_gate` y `ffn_down` de todos los bloques, más sustituciones en fp32 de `time_embedding.*`, `shared_block_modulation.bias` y `video_head_modulation.bias`. Este último detalle es relevante: el vector temporal para t=1 está plegado en esos sesgos, de modo que el embedder solo funciona en conjunción con ellos y esos tres módulos deben permanecer en fp32. El checkpoint publicado corresponde a la actualización 12000 (EMA) según la model card; una reseña externa (ArtRealmAI) cita la actualización 9200, discrepancia que conviene verificar antes de reproducir resultados. El entrenamiento usó subtítulos `scene_graph` en JSON compacto, lo que condiciona el formato de prompt más favorable.

## Capacidades

- Generación de imágenes texto-a-imagen en espacio latente con 8 evaluaciones de red y sin classifier-free guidance.
- Muestreo con menos de 8 pasos: cada prefijo de la trayectoria está entrenado, según el autor.
- Condicionamiento estructural mediante subtítulos `scene_graph` en JSON compacto, útiles para describir relaciones entre objetos.
- Integración con ComfyUI: el LoRA se carga con un nodo LoRA estándar (strength 1) sobre el transformador original, con sampler Euler y shift 5.
- Reproducción exacta de la forma de entrenamiento mediante el sampler de espacio de datos incluido (`dataspace.safetensors`).
- Compatibilidad con los adaptadores y cuantizaciones de la comunidad para MOSS-Image (variantes INT8/INT4 publicadas por otros autores).
- Capacidades multimodales, tool calling, agentes o modo *thinking*: no aplica ni se documenta; es un modelo de difusión de imagen.

## Casos de uso

- **Generación de imágenes en API de producción**: con 8 NFE y CFG 1 el coste por imagen cae aproximadamente un orden de magnitud frente a los 50 pasos con CFG del base, lo que permite sostener más peticiones por GPU en un servicio de generación bajo demanda.
- **Iteración visual en ComfyUI**: cargando solo `lora.safetensors` sobre el checkpoint base en bf16, artistas y diseñadores obtienen previsualizaciones en 4-8 pasos dentro de un flujo de trabajo existente, sin reescribir el grafo.
- **Prototipado e investigación en destilación**: el repositorio expone la matriz de mezcla, los códigos de paso y el LoRA por separado, lo que lo convierte en una referencia reproducible para estudiar DMD en espacio de datos frente al DMD clásico.
- **Composición escénica controlada**: el entrenamiento sobre JSON compacto de `scene_graph` facilita prompts estructurados para escenas con varias entidades y relaciones (por ejemplo, ilustración de catálogos o storyboards).
- **Generación masiva de datos sintéticos**: el bajo número de evaluaciones por muestra hace viable producir lotes grandes de imágenes para aumento de datos o preentrenamiento de modelos de visión.
- **Ajuste fino posterior sobre una base ya acelerada**: al ser un LoRA de rango 128 aplicable sin fusionar, se puede componer con otros adaptadores del ecosistema MOSS para especializar estilo o dominio manteniendo el muestreo rápido.
- **Evaluación comparativa de schedulers en laboratorio**: sirve como punto de control para medir la pérdida de calidad al bajar de 8 a 4 pasos o al mezclar el LoRA con distintos valores de shift.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, ni comparaciones cualitativas cuantificadas frente al modelo base.

El único dato objetivo derivable de la documentación es el coste de muestreo:

| Metrica | MOSS-Image-Base | Este checkpoint |
|---|---|---|
| Pasos de muestreo | 50 | 4-8 |
| CFG | 3.0 | 1.0 (sin CFG) |
| Evaluaciones de red por imagen | ≈100 | 8 (o menos) |
| Reduccion de computo (derivada) | referencia | ≈12,5x con 8 pasos |

## Requisitos de hardware

- **VRAM del transformador**: 5,08 B de parámetros suponen ≈20,3 GB en fp32 (obligatorio para la ruta del sampler de espacio de datos), ≈10,2 GB en bf16 y ≈5,1 GB en fp8 (solo viable con la ruta LoRA).
- **Pipeline completo**: hay que sumar el codificador de texto del base, un Qwen3.5 de 8,39 B según una guía externa (≈16,8 GB en bf16, ≈8,4 GB en fp8) y el VAE. En bf16 el conjunto ronda los 27-28 GB; con codificador de texto en fp8, en torno a 19-20 GB. Cifras estimadas a partir del recuento de parámetros, no publicadas por el autor.
- **GPU recomendadas**: A100 80 GB o H100 para la ruta fp32 sin concesiones; A100 40 GB y L40S 48 GB cubren el pipeline completo en bf16/fp8 sin offload.
- **Consumer GPU**: en una RTX 4090 (24 GB) la ruta LoRA con transformador en bf16 y codificador de texto en fp8 es ajustada pero posible con offload secuencial de ComfyUI; con 16 GB (RTX 4080, 5070 Ti) hará falta descarga a RAM del codificador de texto. La ruta fp32 del sampler de espacio de datos no cabe en ninguna GPU de consumo actual de 24 GB.
- **Opciones de despliegue**: diffusers con `pipeline_moss_image.py` del repositorio base, ComfyUI (nodo LoRA + `ModelSamplingAuraFlow` con shift 5), y llama.cpp/Ollama/TGI no aplican por tratarse de un modelo de difusión. vLLM tampoco soporta este pipeline de forma estándar.
- **Latencia y throughput**: no hay cifras publicadas. Como referencia derivada, el checkpoint requiere 8 evaluaciones frente a ≈100 del base, de modo que la latencia por imagen debería reducirse en torno a un orden de magnitud a igual hardware, sin contar el coste fijo del codificador de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / CFG | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lodestones/MOSS-Image-Base-8-steps-dmd | 5,08 B (transformer) | 4-8 / 1,0 | DMD en espacio de datos sobre MOSS-Image-Base | apache-2.0 | publico en HF (484 descargas) |
| OpenMOSS-Team/MOSS-Image-Base | 5,08 B (transformer) | 50 / 3,0 | Modelo original sin destilar | no disponible en la informacion | publico en HF |
| lodestones/MOSS-Image-SFT-8-steps-dmd | no disponible | 4-8 / 1,0 | Misma tecnica aplicada al checkpoint SFT | no disponible en la informacion | publico en HF |
| akhaliq/MOSS-Image-SFT-4-steps | no disponible | 4 / no disponible | Destilacion a 4 pasos sobre MOSS-Image-SFT | no disponible en la informacion | publico en HF |
| toxicdog/MOSS-Image-SFT-INT8-ConvRot | no disponible | no disponible | Cuantizacion INT8 del checkpoint SFT | no disponible en la informacion | publico en HF |

No hay datos de calidad comparada (FID, preferencia humana) para ninguno de ellos en la informacion disponible, por lo que la elección entre estas variantes solo puede hacerse por criterios de coste de muestreo, licencia y compatibilidad con el flujo de trabajo.

## Limitaciones y advertencias

- **Estado inacabado**: el propio autor describe el checkpoint como *work-in-progress distillation*. No hay garantía de calidad equiparable al modelo base.
- **Dependencia estricta de fp32 en la ruta de espacio de datos**: cargar o ejecutar `transformer/` en bf16 descarta la mayor parte de la destilación. El uso en bf16 solo es correcto con el LoRA sin fusionar sobre el transformador original.
- **Sin CFG**: al operar con CFG 1 se pierde el control fino que ofrece el guidance negativo (prompts negativos, supresión de artefactos), lo que limita el ajuste fino del resultado.
- **Prompts especializados**: el entrenamiento usó subtítulos `scene_graph` en JSON compacto; prompts en lenguaje natural largo pueden comportarse de forma distinta a lo esperado.
- **Sin métricas publicadas**: no hay FID, CLIP score ni evaluaciones de sesgo, por lo que no se puede cuantificar la degradación frente a 50 pasos.
- **Discrepancia en el checkpoint**: la model card indica la actualización 12000 (EMA) y una reseña externa cita la 9200; conviene verificar qué pesos contiene realmente el repositorio.
- **Sesgos y alucinación visual**: hereda los sesgos del dataset de MOSS-Image-Base, no documentados en esta ficha. Como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible en la imagen y composiciones incoherentes en escenas con muchas entidades.
- **Licencia**: apache-2.0 permite uso comercial del adaptador, pero el modelo base tiene su propia licencia, no confirmada en la informacion disponible; hay que verificarla antes de explotar el conjunto en producción.
- **Repositorio pesado**: 45,6 GB, en su mayor parte por los pesos en fp32; complica el despliegue en entornos con almacenamiento limitado.
- **Cobertura lingüística no documentada**: no se especifica qué idiomas maneja bien el codificador de texto ni si los prompts en castellano funcionan con la misma calidad que en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lodestones/MOSS-Image-Base-8-steps-dmd
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Perfil del autor: https://huggingface.co/lodestones
- Preprint de data-space DMD: arXiv 2610.12102 (citado en la model card; sin URL completa en la informacion disponible)
- Resena externa: https://artrealmai.com/article/moss-image-8-step-dmd-lora-lodestones
- Guia de MOSS-Image en ComfyUI (nodos, ficheros, VRAM): https://www.bestfreewebresources.com/moss-image-comfyui-guide
- Ejemplo de uso en ComfyUI (dskjal): https://note.com/dskjal/n/n0d2136ba5d53
- Variante sobre el checkpoint SFT: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Listado de fine-tunes de MOSS-Image-SFT: https://huggingface.co/models?other=base_model:finetune:OpenMOSS-Team/MOSS-Image-SFT
