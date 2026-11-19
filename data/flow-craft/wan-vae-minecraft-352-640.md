# flow-craft/wan-vae-minecraft-352-640

## Resumen

`flow-craft/wan-vae-minecraft-352-640` es un autoencoder variacional (VAE) de vídeo especializado, obtenido por ajuste fino (fine-tuning) del VAE del modelo `Wan-AI/Wan2.2-TI2V-5B-Diffusers` sobre imágenes de gameplay de Minecraft. Lo desarrolla el colectivo FlowCraft (Aidan Scannell y colaboradores) dentro de su proyecto de un modelo del mundo (world model) autorregresivo y de código abierto para Minecraft. No es un modelo generativo de texto ni de imagen por sí mismo: su función es codificar fotogramas de vídeo en representaciones latentes compactas y reconstruirlos, sirviendo de base para entrenar y ejecutar el modelo del mundo.

El modelo resuelve un problema concreto: los VAE genéricos de Wan están entrenados sobre vídeo natural y no capturan bien la estética, la paleta y la dinámica visual particulares de Minecraft (bloques, texturas pixeladas, cámara en primera persona). Este ajuste fino adapta el decodificador del VAE a ese dominio, de modo que los latentes generados por el modelo del mundo se reconstruyan con mayor fidelidad. Los latentes del dataset `flow-craft/minecraft-latents-352-640-v2` se codificaron precisamente con este VAE.

Técnicamente es un modelo compacto (unos 704,7 millones de parámetros) con resolución de entrenamiento de 352x640 (alto x ancho) y pesos en formato safetensors para la librería `diffusers`. Su relevancia actual radica en que forma parte de una cadena de herramientas abierta (VAE + latentes + modelo del mundo + script de entrenamiento) que permite reproducir el pipeline completo sobre datos de OpenAI VPT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoencoderKLWan (VAE de vídeo con encoder/decoder; ajuste fino solo del decoder) |
| Parametros totales | 704.688.668 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de fotogramas: ctx_len_fr 17, pred_len_fr 16 en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion de entrenamiento | 352x640 (H×W) |
| Libreria | diffusers |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B-Diffusers (subcarpeta `vae`) |
| Tamano del repo | 2.8 GB |
| Paso de entrenamiento final | 51000 |

## Arquitectura y entrenamiento

La arquitectura es la del `AutoencoderKLWan` de Diffusers, un VAE convolucional para vídeo con encoder y decoder y una distribución latente regularizada por KL. En este ajuste fino solo se entrena el decoder (`"finetune": "decoder"`), manteniendo el encoder del modelo base. El entrenamiento se hizo en float32 con autocast bfloat16, learning rate 1e-05, batch size 1 y acumulación de gradiente de 2 pasos, durante un máximo de 150000 pasos (se detuvo en el paso 51000, que corresponde al mejor `val/loss` de 1,0614).

La función de pérdida combina L1 (peso 3,0), LPIPS sobre VGG aplicado a fotogramas (peso 3,0), una pérdida temporal (peso 0,5) y un término KL muy débil (3e-06); no se usó GAN (`use_gan: false`). Los datos provienen del dataset `1x-technologies/worldmodel_raw_data`, con fotogramas muestreados de los vídeos de gameplay de Minecraft publicados por el proyecto Video-Pre-Training de OpenAI (MineRL/VPT), redimensionados a 352x640. Las ventanas de entrenamiento usan 17 fotogramas de contexto y 16 de predicción, con 60 fotogramas para evaluación. Se registraron métricas de reconstrucción PSNR, SSIM y LPIPS sobre 256 muestras de validación. El script de reproducción es `scripts/finetune_wan_vae.py` (commit `056f3a6172e738c84ef0c0922ac3531a3cf4fbe9`).

## Capacidades

- Codificación de fotogramas de vídeo de Minecraft a latentes y decodificación inversa (reconstrucción).
- Reconstrucción de vídeo a resolución 352x640 con coherencia temporal (pérdida temporal explícita en el entrenamiento).
- Especialización en el dominio visual de Minecraft (texturas de bloques, cámara en primera persona, paleta del juego).
- Integración nativa con `diffusers` mediante `AutoencoderKLWan.from_pretrained(...)`.
- Uso como componente de un modelo del mundo autorregresivo: los latentes alimentan el modelo predictivo y este VAE los devuelve a píxeles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general ni audio: es exclusivamente un componente de compresión/reconstrucción de vídeo.
- Capacidades multilingües: no aplicable (modelo visual).

## Casos de uso

- Modelos del mundo para Minecraft: el VAE comprime fotogramas de gameplay a latentes sobre los que se entrena un modelo autorregresivo que predice el siguiente estado; es el componente de codificación/decodificación del pipeline FlowCraft.
- Investigación en aprendizaje por refuerzo con observaciones comprimidas: usar los latentes como representación de estado de bajo coste para agentes que juegan a Minecraft, reduciendo la dimensionalidad frente a píxeles crudos.
- Generación de vídeo condicionada en el dominio Minecraft: combinado con un modelo de difusión o autorregresivo entrenado en el espacio latente, permite sintetizar clips de gameplay coherentes temporalmente.
- Reconstrucción y supervisión de calidad de datos: calcular PSNR, SSIM y LPIPS de reconstrucción para auditar la fidelidad de los latentes antes de entrenar un modelo mayor.
- Preprocesado de datasets de vídeo de Minecraft: codificar grandes volúmenes de clips (como el dataset VPT) a latentes bfloat16 para acelerar el entrenamiento y reducir el almacenamiento.
- Reproducción de experimentos: servir como punto de partida (checkpoint concreto en el paso 51000) para que otros grupos reproduzcan o continúen el ajuste fino con el script publicado.
- Prototipado de entornos simulados: integrar el par encoder/decoder en un bucle de simulación visual para estudiar planificación a largo plazo en Minecraft con observaciones latentes.

## Benchmarks y rendimiento

La model card solo reporta la métrica de validación del entrenamiento; no se han publicado resultados comparativos con otros VAE en la información disponible.

| Metrica | Valor | Paso |
|---|---|---|
| val/loss (min) | 1,06140953818957 | 51000 |

No se han publicado resultados de benchmarks en la informacion disponible (PSNR, SSIM y LPIPS se registraron durante el entrenamiento, pero sus valores finales no se incluyen en la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: con 704,7 millones de parámetros en float32, los pesos ocupan aproximadamente 2,8 GB; sumando activaciones de vídeo a 352x640 y ventanas de decenas de fotogramas, se recomienda al menos 8-12 GB de VRAM.
- GPU recomendadas: A100 o H100 para procesar lotes grandes de clips; RTX 4090 (24 GB) para inferencia y evaluación cómodas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) y en tarjetas de 12-16 GB con ventanas de fotogramas reducidas; no se dispone de medidas exactas.
- Opciones de despliegue: `diffusers` con PyTorch (vía `AutoencoderKLWan.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|---|
| flow-craft/wan-vae-minecraft-352-640 | VAE de vídeo (fine-tune) | 704,7 M | 352x640 | Apache-2.0 | Especializado en Minecraft |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers (VAE base) | VAE de vídeo | no disponible | no disponible | Apache-2.0 | Modelo base; dominio general |
| Otros VAE de vídeo de dominio específico | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion |

## Limitaciones y advertencias

- Es un componente de compresión/reconstrucción, no un generador: no produce vídeo por sí mismo ni acepta prompts de texto.
- Dominio muy restringido: entrenado solo con gameplay de Minecraft (VPT); su rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- No hay datos publicados de PSNR, SSIM ni LPIPS finales, por lo que la calidad de reconstrucción no puede verificarse a priori.
- Solo se ajustó el decoder; el encoder conserva el comportamiento del modelo base, lo que puede introducir un desajuste entre codificación y decodificación específico del dominio.
- Riesgo de artefactos en escenas no vistas (iluminación, mods, resoluciones distintas de 352x640).
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene revisar igualmente las condiciones de los datos de origen (OpenAI VPT y MineRL) para usos derivados.
- El número de descargas (26) y likes (1) es muy bajo: ecosistema y validación comunitaria limitados.
- La fecha de creación indicada (2026-04-24) y la cita a un arXiv pendiente de identificador sugieren que la documentación académica aún no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flow-craft/wan-vae-minecraft-352-640
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Documentación de AutoencoderKLWan: https://huggingface.co/docs/diffusers/main/en/api/models/autoencoderkl_wan
- Dataset de latentes: https://huggingface.co/datasets/flow-craft/minecraft-latents-352-640-v2
- Organización FlowCraft: https://huggingface.co/flow-craft
- Página del proyecto FlowCraft: https://www.aidanscannell.com/flowcraft/
- Repositorio Video-Pre-Training de OpenAI: https://github.com/openai/Video-Pre-Training
