# Cantina/ozus-turbo

## Resumen

Ozus Turbo es un conjunto de checkpoints de identidad desarrollados por Cantina, una empresa que ofrece plataformas de chat y creación de contenido con IA. El modelo se basa en el backbone Z-Image-Turbo de Tongyi-MAI y está diseñado para inyectar una identidad de referencia en las generaciones de imágenes, especializándose en face swapping (intercambio de rostros). Se distribuye en varias versiones (1.1 a 1.4) que corresponden a diferentes etapas de entrenamiento, cada una con su propio número de pasos y muestras vistas.

El modelo se publica como un repositorio unificado en Hugging Face, donde cada release vive en una subcarpeta bajo `releases/`. Utiliza un VAE específico de Cantina y un modo de control denominado `no-kps`, que requiere un mapa de control negro en inferencia. Es un modelo interno de la compañía, con licencia "other" y sin información pública sobre arquitectura, parámetros o contexto. Su relevancia radica en ser una solución especializada para tareas de identidad facial dentro del ecosistema de Cantina, aunque su disponibilidad pública es limitada y orientada a uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Z-Image-Turbo, modelo de difusion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de imagenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (segun tags de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion publica. Se sabe que el modelo se entrena directamente sobre el backbone Z-Image-Turbo, un modelo de difusion para generacion de imagenes. El entrenamiento se realiza en varias fases: la version 1.1 se entrena desde cero (run `ozus_turbo_cont_scratch_4n`) hasta 46.000 pasos con 5.888.000 muestras vistas. Las versiones 1.2 y 1.3 continuan desde ese punto con un dataset mixto (`from46k_aug12_mixedv5_5050_8n`), alcanzando 100.000 y 168.000 pasos respectivamente. La version 1.4 parte del checkpoint 1.3 con un run de estabilidad (`from_ozus_turbo_1.3_stability_8n`) y 24.000 pasos adicionales.

El modelo utiliza un VAE especifico de Cantina (`Cantina/flux.1-dev-realistic-lora-merge`, subcarpeta `vae`) y un modo de control `no-kps`, que implica usar un mapa de control negro en inferencia. No se mencionan tecnicas como RLHF, DPO ni otras innovaciones de entrenamiento. La configuracion compartida se encuentra en `InfuseNetModel/config.json`, lo que sugiere una arquitectura de tipo InfuseNet, aunque no se proporcionan detalles adicionales.

## Capacidades

- Face swapping: inyecta una identidad de referencia en generaciones de Z-Image-Turbo, permitiendo intercambiar rostros en imagenes generadas.
- Generacion de imagenes con control de identidad: el modelo puede mantener la identidad de una persona de referencia mientras genera variaciones.
- Multiples versiones: dispone de cuatro releases (1.1 a 1.4) con diferentes niveles de entrenamiento, lo que permite elegir entre estabilidad y calidad.
- Integracion con diffusers: se distribuye como libreria `diffusers`, facilitando su uso en pipelines de generacion de imagenes.
- Modo de control no-kps: requiere un mapa de control negro, lo que simplifica la inferencia al no necesitar mapas de pose o keypoints.
- Uso interno de Cantina: orientado a las aplicaciones de la plataforma Cantina, como chat con personajes y creacion de video.

## Casos de uso

- Intercambio de rostros en retratos generados: el modelo puede tomar una foto de referencia de una persona y generar nuevas imagenes con esa misma identidad, util para crear avatares personalizados.
- Creacion de personajes consistentes en narrativa visual: al mantener la identidad facial, permite generar multiples imagenes del mismo personaje en diferentes escenas o poses, ideal para historias ilustradas o comics.
- Personalizacion de contenido en plataformas de chat: Cantina usa este modelo para que los usuarios puedan crear personajes con su propia cara o la de celebridades, integrandolo en conversaciones con IA.
- Generacion de video con identidad fija: aunque el modelo es de imagenes, puede usarse como base para pipelines de video donde se requiere consistencia facial entre frames.
- Prototipado rapido de avatares para juegos o aplicaciones: los desarrolladores pueden generar assets visuales con una identidad controlada sin necesidad de sesiones fotograficas.
- Pruebas de concepto en investigacion de face swapping: al ser un modelo especializado, sirve como punto de partida para experimentos con tecnicas de inyeccion de identidad en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni metricas de calidad de imagen como FID o LPIPS. Tampoco se comparan con otros modelos de face swapping.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el repositorio pesa 16 GB y se basa en un modelo de difusion, se estima que requiere al menos 16-24 GB de VRAM para inferencia en precision completa, aunque no hay datos oficiales.
- GPU recomendadas: no disponible. Modelos de difusion de este tipo suelen ejecutarse en GPUs con 24 GB o mas, como RTX 3090/4090, A100 o H100, pero no se confirma.
- Compatibilidad con consumer GPU: probablemente si con cuantizacion o usando precision mixta, pero no hay informacion al respecto.
- Opciones de despliegue: al usar `diffusers`, puede integrarse con librerias como `diffusers` pipeline, `ComfyUI` o `Automatic1111` si se adapta. No se mencionan vLLM, llama.cpp u Ollama, que son para modelos de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de face swapping como InsightFace, SimSwap o FaceSwap. El modelo es interno de Cantina y no hay datos publicos de rendimiento ni parametros. Se puede indicar que no hay alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" no especifica los terminos de uso. Al ser un modelo interno de Cantina, es probable que tenga restricciones para uso comercial o redistribucion. Se debe contactar con Cantina para obtener permisos.
- Sin documentacion tecnica: no se publican detalles de arquitectura, parametros, dataset de entrenamiento ni metricas de sesgo, lo que dificulta evaluar su robustez.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir rostros distorsionados o artefactos, especialmente con identidades poco representadas en el entrenamiento.
- Sesgos potenciales: al ser un modelo entrenado con datos internos de Cantina, puede tener sesgos etnicos, de genero o de edad no documentados.
- Dependencia de componentes externos: requiere el backbone Z-Image-Turbo (no incluido) y un VAE especifico, lo que complica el despliegue fuera del ecosistema de Cantina.
- Modo de control no-kps: el uso de un mapa de control negro puede limitar la flexibilidad en escenarios donde se necesite control espacial adicional.
- Fecha de creacion futura: el modelo fue creado en septiembre de 2026, lo que sugiere que es muy reciente y puede tener poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cantina/ozus-turbo
- Release 1.2: https://huggingface.co/Cantina/Ozus-turbo-1.2
- Release 1.3: https://huggingface.co/Cantina/Ozus-Turbo-1.3
- Sitio web de Cantina: https://cantina.com/
- Sitio alternativo: https://cntn.ai/
