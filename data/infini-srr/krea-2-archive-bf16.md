# Infini-Srr/Krea-2-Archive-BF16

## Resumen

Krea-2-Archive-BF16 es un repositorio de redistribución (repack) de los modelos de difusión Krea 2 en formato de fichero único para ComfyUI, publicado por el usuario Infini-Srr. No se trata de un modelo entrenado por el autor del repo: los pesos originales provienen de krea/Krea-2-Raw y krea/Krea-2-Turbo, y este repositorio se limita a reorganizar y convertir esos pesos en variantes listas para cargar en ComfyUI (bf16, fp8 escalado, int8, mxfp8 y nvfp4), junto con el text encoder Qwen3VL 4B, el VAE y una colección de LoRAs de estilo.

El interés práctico es la disponibilidad de todas las variantes de cuantización de Krea 2 en un único paquete de 66,8 GB, con nombres de fichero normalizados y rutas de instalación documentadas, lo que simplifica el despliegue local en flujos de trabajo de ComfyUI. Se incluyen además los ficheros de texto codificador en bf16 y fp8, el VAE y once LoRAs con sus palabras de activación y fuerzas recomendadas.

La relevancia es acotada: el repo tiene 16 descargas y 0 likes en el momento de la consulta, no incluye model card técnica propia (solo instrucciones de instalación y enlaces al modelo original) y no publica parámetros, arquitectura detallada ni benchmarks. Para evaluar el modelo conviene acudir a los repositorios oficiales de Krea 2, ya que esta ficha solo puede documentar lo que el repack declara explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (tipo de backbone no especificado en la información disponible: no se confirma DiT, UNet ni híbrido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible para el codificador de texto Qwen3VL 4B incluido |
| Tipos de cuantizacion | bf16, fp8_scaled, int8_convrot; solo en Turbo: mxfp8 y nvfp4 |
| Idiomas soportados | no disponibles (el prompt se procesa con un text encoder Qwen3VL 4B; la cobertura lingüística no se documenta) |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | safetensors en fichero único para ComfyUI (diffusion-single-file) |

Datos adicionales del repositorio: tamaño total de 66,8 GB, 16 descargas, 0 likes, creado y actualizado el 20 de octubre de 2026, etiquetas `diffusion-single-file`, `comfyui`, `base_model:krea/Krea-2-Raw`, `base_model:finetune:krea/Krea-2-Raw`, `license:other`, `region:us`.

Ficheros declarados en la model card:

| Componente | Ficheros |
|---|---|
| Modelos de difusión (Raw) | krea2_raw_bf16.safetensors, krea2_raw_fp8_scaled.safetensors, krea2_raw_int8_convrot.safetensors |
| Modelos de difusión (Turbo) | krea2_turbo_bf16.safetensors, krea2_turbo_fp8_scaled.safetensors, krea2_turbo_int8_convrot.safetensors, krea2_turbo_mxfp8.safetensors, krea2_turbo_nvfp4.safetensors |
| Text encoder | qwen3vl_4b_bf16.safetensors, qwen3vl_4b_fp8_scaled.safetensors |
| VAE | qwen_image_vae.safetensors |
| LoRAs | 11 ficheros (9 de estilo propios, style_reference de ostris y un LoRA de rango 64 para Turbo) |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni proceso de entrenamiento: es un empaquetado de pesos. Lo que sí se puede inferir de los ficheros es la estructura del pipeline: un modelo de difusión principal en dos variantes (Raw, sin destilado declarado, y Turbo, presumiblemente orientado a menos pasos de muestreo), un codificador de texto basado en Qwen3-VL de 4B parámetros en bf16 o fp8 escalado, y un VAE identificado como qwen_image_vae. La combinación de un text encoder multimodal de 4B con un VAE de la familia Qwen-Image sugiere un pipeline texto-a-imagen con codificación de prompt relativamente pesada, pero la model card no confirma ni el tipo de backbone (DiT, UNet u otro), ni el número de parámetros del modelo de difusión, ni el número de tokens de entrenamiento.

Respecto al entrenamiento, no hay información disponible sobre composición del dataset, uso de RLHF/DPO (concepto poco aplicable a difusión; el equivalente sería ajuste por preferencias, no declarado) ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta el proceso de destilado que diferenciaría a Turbo de Raw. Cualquier afirmación sobre estos puntos requiere consultar los repositorios originales krea/Krea-2-Raw y krea/Krea-2-Turbo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante los pesos Raw y Turbo, con flujos de trabajo oficiales publicados en Comfy-Org/workflow_templates.
- Variante Turbo orientada a generación con menos pasos, según la nomenclatura del modelo; el número exacto de pasos no está documentado en la información disponible.
- Referencia de estilo por imagen: existe un flujo específico "Krea-2 Int8: Image Style Reference" y un LoRA `krea2_style_reference` de ostris, lo que indica soporte de transferencia de estilo condicionada por imagen.
- Aplicación de estilos preentrenados mediante LoRA, con palabras de activación definidas y fuerza recomendada de 1.0.
- Ajuste fino adicional: se incluye un LoRA de rango 64 en bf16 para Turbo (`krea2_turbo_lora_rank_64_bf16.safetensors`).
- Despliegue local en ComfyUI con múltiples niveles de precisión para adaptarse a distinta VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vídeo; el modelo es de imagen.

LoRAs incluidos y palabras de activación:

| LoRA | Palabra de activación | Fuerza recomendada |
|---|---|---|
| krea2_darkbrush | monochrome ink wash style | 1.0 |
| krea2_dotmatrix | monochrome stippling style | 1.0 |
| krea2_kidsdrawing | naive expressive sketch style | 1.0 |
| krea2_neondrip | textured abstract style | 1.0 |
| krea2_rainywindow | rainy window style | 1.0 |
| krea2_retroanime | purple retro anime style | 1.0 |
| krea2_softwatercolor | art deco watercolor style | 1.0 |
| krea2_sunsetblur | ethereal motion blur style | 1.0 |
| krea2_vintagetarot | vintage tarot style | 1.0 |

## Casos de uso

- Ilustración de estilo controlado en estudio pequeño: cargar `krea2_turbo_int8_convrot.safetensors` junto al LoRA de estilo correspondiente y usar la palabra de activación (por ejemplo, `rainy window style` a fuerza 1.0) para mantener coherencia visual en una serie de ilustraciones sin reentrenar nada.
- Prototipado rápido de concept art: usar la variante Turbo en bf16 o fp8 para iterar sobre decenas de variantes de un personaje o escena antes de pasar a un artista humano, aprovechando el flujo text-to-image publicado por Comfy-Org.
- Transferencia de estilo a partir de una referencia: emplear el flujo "Image Style Reference" con el LoRA `krea2_style_reference` para replicar la estética de una imagen existente en nuevas composiciones, útil en branding y campañas.
- Generación de assets para videojuegos o editorial: producir ilustraciones con estilos concretos (tarot vintage, retro anime, acuarela art déco) para maquetas de manuales, cartas o UI, con la ventaja de que todo el pipeline corre en local.
- Entornos con requisitos de privacidad: al ejecutarse en ComfyUI sobre hardware propio, ningún prompt ni imagen sale a un servicio externo, lo que encaja en sectores con datos sensibles (salud, legal, prensa) que no pueden usar APIs de terceros.
- Pruebas de concepto de investigación en difusión: comparar en igualdad de condiciones las variantes bf16, fp8, int8, mxfp8 y nvfp4 del mismo modelo Turbo para medir degradación de calidad frente a ahorro de memoria, gracias a que el repo empaqueta todas las versiones.
- Exploración de técnicas de cuantización: el fichero `int8_convrot` y las variantes mxfp8/nvfp4 permiten evaluar el comportamiento de formatos de baja precisión en un modelo de imagen grande sin tener que generarlos uno mismo.
- Ajuste fino ligero sobre un estilo propio: partir del LoRA de rango 64 incluido como referencia de configuración para entrenar adaptadores adicionales sobre Krea 2 Turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repack no incluye métricas (FID, CLIP score, calidad percibida, tiempos de inferencia) ni comparaciones numéricas. Los resultados de la búsqueda web proporcionada no son pertinentes: todos los enlaces devueltos tratan sobre óvulos en botánica y biología, sin relación con el modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 66,8 GB, pero incluye simultáneamente todos los modelos, el text encoder y los LoRAs, por lo que no equivale al peso de un único fichero cargado en memoria.
- Como orientación basada en el formato y no en datos del autor: las variantes bf16 requieren aproximadamente el doble de memoria que sus equivalentes fp8 o int8, y las variantes mxfp8 y nvfp4 están pensadas para reducir aún más el consumo en hardware compatible.
- GPU recomendadas: no disponibles. Los formatos mxfp8 y nvfp4 están asociados a arquitecturas NVIDIA Blackwell (por ejemplo, serie RTX 50 y aceleradores B100/B200); su uso en GPUs anteriores depende del soporte de la librería de inferencia.
- ¿Cabe en GPU de consumo? No confirmado. Las variantes int8 y fp8 son las candidatas razonables para GPUs de consumo, pero no se publican cifras de VRAM mínima ni resoluciones soportadas.
- Opciones de despliegue: ComfyUI es el objetivo declarado (rutas `models/diffusion_models`, `models/loras`, `models/text_encoders`, `models/vae`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Infini-Srr/Krea-2-Archive-BF16 (este repo) | Repack de difusión para ComfyUI, multi-cuantización | no disponible | no aplica | krea-2-community-license | HuggingFace, 16 descargas, 0 likes |
| krea/Krea-2-Raw | Modelo de difusión original, sin destilar | no disponible | no aplica | krea-2-community-license | HuggingFace (repo oficial) |
| krea/Krea-2-Turbo | Modelo de difusión original, variante Turbo | no disponible | no aplica | krea-2-community-license | HuggingFace (repo oficial) |
| ostris/krea2_turbo_style_reference | LoRA de referencia de estilo para Turbo | no disponible | no aplica | no disponible | HuggingFace |

La comparación relevante aquí no es de rendimiento sino de empaquetado: frente a los repos oficiales, este repack aporta ficheros únicos listos para ComfyUI y variantes de cuantización adicionales (int8_convrot, mxfp8, nvfp4), pero no añade pesos nuevos ni documentación técnica. No se dispone de datos para comparar con alternativas de otros fabricantes (por ejemplo, modelos de imagen de la familia Qwen-Image o FLUX), y cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Repositorio no oficial: es un repack de terceros, no una publicación de Krea. No hay garantía de que la conversión de pesos sea fiel al original ni de que se actualice cuando el modelo base cambie.
- Sin model card técnica: no se documentan arquitectura, parámetros, datos de entrenamiento ni evaluación; la información disponible se limita a instrucciones de instalación y enlaces.
- Licencia restrictiva y no analizada aquí: la licencia es `krea-2-community-license` (license: other). Las condiciones de uso comercial, redistribución y atribución están en el PDF enlazado y deben revisarse antes de cualquier despliegue en producción; no se dispone de un resumen fiable de sus cláusulas.
- Idiomas no declarados: no se especifica qué lenguas entiende el pipeline; los prompts en castellano podrían funcionar peor que en inglés, pero esto no está verificado en la información disponible.
- Riesgo de artefactos propios de modelos de difusión (anatomías incorrectas, texto ilegible en la imagen, inconsistencias entre generaciones): inherente a la tecnología, sin que el repo aporte mitigaciones ni métricas.
- Ausencia de benchmarks: no hay forma de comparar la calidad de las variantes cuantizadas entre sí ni con el modelo original usando datos publicados.
- Trazabilidad baja: 16 descargas y 0 likes indican que el repack no ha sido validado por la comunidad; conviene verificar checksums o comparar muestras contra el modelo original.
- Tamaño del repo: 66,8 GB requieren espacio en disco considerable incluso si solo se van a usar una o dos variantes.
- Las variantes mxfp8 y nvfp4 pueden no ser utilizables en GPUs no Blackwell; el autor no indica requisitos mínimos.

## Enlaces

- Repositorio del repack: https://huggingface.co/Infini-Srr/Krea-2-Archive-BF16
- Modelo original Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo original Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (PDF): https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- LoRA darkbrush: https://huggingface.co/krea/Krea-2-LoRA-darkbrush
- LoRA dotmatrix: https://huggingface.co/krea/Krea-2-LoRA-dotmatrix
- LoRA kidsdrawing: https://huggingface.co/krea/Krea-2-LoRA-kidsdrawing
- LoRA neondrip: https://huggingface.co/krea/Krea-2-LoRA-neondrip
- LoRA rainywindow: https://huggingface.co/krea/Krea-2-LoRA-rainywindow
- LoRA retroanime: https://huggingface.co/krea/Krea-2-LoRA-retroanime
- LoRA softwatercolor: https://huggingface.co/krea/Krea-2-LoRA-softwatercolor
- LoRA sunsetblur: https://huggingface.co/krea/Krea-2-LoRA-sunsetblur
- LoRA vintagetarot: https://huggingface.co/krea/Krea-2-LoRA-vintagetarot
- LoRA style reference (ostris): https://huggingface.co/ostris/krea2_turbo_style_reference
- Flujo text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i.json
- Flujo image style reference: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_int8_image_style_reference.json
- Flujo text-to-image int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i_int8.json

Nota sobre la búsqueda web: los resultados proporcionados (Wikipedia, Biology Notes Online, Vedantu y Wikipedia en francés) tratan sobre el óvulo en botánica y biología y no guardan relación con el modelo, por lo que no se han utilizado como fuente.
