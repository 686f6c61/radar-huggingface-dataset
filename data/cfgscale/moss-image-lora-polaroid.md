# cfgscale/MOSS-Image-LoRA-Polaroid

## Resumen

MOSS-Image-LoRA-Polaroid es un adaptador LoRA de bajo rango para generación de imágenes texto-a-imagen, desarrollado por cfgscale (SeedraAI) sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Su función es estilística: transforma cualquier escena generada en una fotografía instantánea tipo Polaroid, con marco blanco de borde inferior ancho, colores cálidos desaturados, sombras suaves, destello de flash y una textura química ligeramente imperfecta. No altera el contenido semántico de la escena, solo su apariencia fotográfica.

El adaptador se activa mediante la palabra clave `p0laroid` y está pensado para su uso en ComfyUI mediante un nodo LoraLoaderModelOnly conectado tras el cargador del modelo base. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors (`p0laroid_moss_v1.safetensors`). La licencia es Apache 2.0, heredada del modelo base, y el idioma de los prompts es inglés.

Es relevante ahora porque ofrece un estilo fotográfico analógico concreto y reproducible sobre un modelo de imagen reciente (MOSS-Image-SFT), con parámetros de inferencia documentados (25 pasos, CFG 2.5, sampler er_sde) y una receta de prompt explícita, lo que reduce la experimentación necesaria para obtener resultados consistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión OpenMOSS-Team/MOSS-Image-SFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la ventana de contexto depende del codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 (sigue la licencia del modelo base) |
| Formato de pesos | safetensors (`p0laroid_moss_v1.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, una modificación de bajo rango de los pesos del modelo base MOSS-Image-SFT, no de un modelo completo. El autor no detalla en la model card la arquitectura interna del modelo base ni la configuración exacta del entrenamiento (rango, alpha, tasa de aprendizaje, número de pasos). El adaptador se aplica en ComfyUI mediante el nodo LoraLoaderModelOnly, lo que indica que modifica los pesos del modelo de difusión y no el codificador de texto.

El conjunto de datos de entrenamiento está documentado: 54 fotografías Polaroid reales procedentes de Wikimedia Commons, todas bajo licencias libres (CC BY 2.0, CC BY 3.0, CC BY 4.0, CC BY-SA 3.0 y CC BY-SA 4.0), con créditos nominales a los fotógrafos. No se especifica el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a LoRAs de imagen). La innovación destacable es la especialización estilística pura: el adaptador aprende la estética Polaroid (marco, color, grano, flash) independientemente del sujeto.

## Capacidades

- Generación de imágenes texto-a-imagen con estética de fotografía instantánea Polaroid.
- Aplicación de marco blanco con borde inferior más ancho, proporciones auténticas de Polaroid.
- Reproducción de color cálido y desaturado, sombras suaves, destello de flash y textura química imperfecta.
- Funciona con retratos, escenas nocturnas con flash, viajes, comida, coches e interiores.
- Independencia del sujeto: el estilo se aplica sea cual sea la escena descrita.
- Control mediante palabra de activación `p0laroid` y plantilla de prompt recomendada.
- Ajuste de peso del LoRA (1.0 por defecto, 0.8 si los rostros se desvían).
- Compatibilidad con ComfyUI mediante LoraLoaderModelOnly.
- No dispone de tool calling, capacidades de agente ni procesamiento de audio; es exclusivamente generación de imágenes.

## Casos de uso

- Fotografía de producto con estética retro: aplicar el LoRA a imágenes de producto para catálogos o redes sociales con un aire analógico coherente, usando la plantilla `p0laroid, a polaroid instant photo, {escena}` y 25 pasos con CFG 2.5.
- Retratos creativos para redes sociales: generar retratos con flash directo y colores cálidos típicos de Polaroid, ajustando el peso a 0.8 si los rostros pierden fidelidad.
- Contenido editorial de viajes: ilustrar artículos o posts con escenas de viaje en formato Polaroid (896×1088), aprovechando que el estilo no depende del sujeto.
- Ambientación de interiores y decoración: generar imágenes de interiores con la paleta cálida y las sombras suaves del LoRA para moodboards o presentaciones.
- Gastronomía y food styling: producir imágenes de comida con la textura y el color analógico característicos, útiles para menús o blogs culinarios.
- Escenas nocturnas y vida nocturna: reproducir el efecto de flash directo en fotografías de fiesta o conciertos, un caso que la model card identifica como adecuado.
- Pruebas de concepto y prototipado visual: integrar el LoRA en un flujo de ComfyUI para explorar variaciones estilísticas rápidas antes de una producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base MOSS-Image-SFT y de la precisión de carga, no del adaptador (0,2 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (documentado por el autor, con LoraLoaderModelOnly); otros entornos no documentados.
- Latencia y throughput: no disponibles; la model card solo fija 25 pasos y CFG 2.5 como configuración de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cfgscale/MOSS-Image-LoRA-Polaroid | LoRA estilístico | OpenMOSS-Team/MOSS-Image-SFT | 896×1088 recomendado | apache-2.0 | Hugging Face, CivitAI |
| cfgscale/Qwen-Image-2.1-LoRA-Polaroid | LoRA estilístico | Qwen Image 2.1 | no disponible | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base texto-a-imagen | — | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo funciona con el modelo base OpenMOSS-Team/MOSS-Image-SFT; no es transferible a otras arquitecturas sin reentrenamiento.
- Los prompts deben formularse en inglés; el soporte multilingüe no está documentado.
- Riesgo de que el marco desaparezca: el autor advierte de evitar las palabras "frame" y "cropped" en la escena, y sugiere añadir "white polaroid border with a wider bottom edge" al final del prompt.
- Los rostros pueden desviarse con peso 1.0; se recomienda bajarlo a 0.8 en esos casos.
- Entrenado con solo 54 imágenes, lo que puede limitar la variedad estilística y aumentar el sobreajuste a las condiciones de esas fotografías.
- Sesgos conocidos: no documentados por el autor; al derivar de un dataset pequeño de Wikimedia Commons, puede heredar sesgos de composición y temática de esas imágenes.
- Riesgo de alucinación visual inherente a los modelos de difusión: detalles inventados en escenas complejas.
- Uso comercial permitido por la licencia Apache 2.0, pero sujeto a la licencia del modelo base; conviene verificar las condiciones de OpenMOSS-Team/MOSS-Image-SFT.
- Los flujos de trabajo completos de SeedraAI (realismo, ruido de cámara, grano y postprocesado de color) requieren membresía en seedraai.com y no están incluidos en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/cfgscale/MOSS-Image-LoRA-Polaroid
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Variante para Qwen Image 2.1: https://huggingface.co/cfgscale/Qwen-Image-2.1-LoRA-Polaroid
- CivitAI: https://civitai.com/models/3035183
- SeedraAI (workflows y guías): https://seedraai.com/?utm_source=huggingface&utm_campaign=polaroid-moss
- Discord de la comunidad: https://discord.gg/seedraai
