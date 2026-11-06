# sekkit/Open-H3-Regenerate-2K

## Resumen

Open-H3-Regenerate-2K es un modelo de refinamiento de vídeo a vídeo (video-to-video) desarrollado por sekkit, concebido como sustituto abierto de la API cerrada H3-Regenerate-2K. Su función es tomar un borrador de vídeo generado en 768P con MiniMax-H3 (1344×768, 121 fotogramas, unos 5 segundos de clip) y regenerarlo a resolución 2560×1440 (2K) mediante un pase de refinamiento de solo tres pasos de muestreo.

Técnicamente no es un modelo entrenado desde cero, sino un bundle que combina un LoRA fusionado de rango 576 aplicado sobre el transformer de MiniMax-H3 (tres adaptadores fusionados: un refiner propio, LightX2V FL2VA Turbo v1.2 y LMS Sharp v1.0), un upsampler latente 3D-conv, y un decodificador VAE rápido destilado de 24 capas procedente de StreamRender-H3. Todo el paquete pesa 164,9 GB y se distribuye en safetensors para su uso con la librería diffusers.

Su relevancia actual radica en la combinación de calidad 2K y velocidad: gracias al motor de inferencia Sol-Engine (Sol-Attn, cuantización MXFP8 y CUDA graphs) junto al decodificador VAE destilado, un clip de 5 segundos pasa de 87,26 segundos a 22,45 segundos en una sola GPU B200, una aceleración de 3,89× respecto al pipeline estándar. Esto lo hace viable para flujos de trabajo de producción donde el refinamiento a alta resolución era previamente un cuello de botella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de refinamiento sobre transformer de difusión de vídeo MiniMax-H3 (pipeline video-to-video con upsampler latente 3D-conv y VAE rápido destilado) |
| Parametros totales | no disponible (bundle completo: 164,9 GB; decodificador VAE rápido: 1,62 B de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa clips de 121 fotogramas a 1344×768 de entrada) |
| Tipos de cuantizacion | FP32 (LoRA y ramas AdaLN), BF16 (upsampler latente), MXFP8 (inferencia con Sol-Engine) |
| Idiomas soportados | no disponible (modelo de vídeo; el text encoder heredado de MiniMax-H3 no especifica idiomas en la ficha) |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community, tipo "other"); componentes de terceros con licencias propias |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se articula en tres etapas sobre el modelo base MiniMax-H3: primero un upsampler latente basado en convoluciones 3D que eleva el latente de 768P a la resolución objetivo; después un pase de refinamiento con el transformer de difusión modificado por un LoRA fusionado; y finalmente la decodificación con un VAE rápido. El muestreo usa exactamente tres pasos de Euler sobre la secuencia de sigmas `[0.909375, 0.857143, 0.666667, 0]`, con CFG 1 y un estado inicial interpolado entre el latente escalado y el ruido: `(1 - 0.909375) * upscaled + 0.909375 * noise`.

El LoRA fusionado concatena a lo largo del eje de rango los factores de tres adaptadores: el refiner Open-H3 (rango 384, alpha 384, checkpoint EMA del paso 5000), LightX2V FL2VA Turbo v1.2 (rango 128, alpha 8) y LMS Sharp v1.0 (rango 64). La fusión se aplica sobre 312 capas lineales con escala 1, y la verificación (`MERGE_VERIFY.json`) confirma que `B @ A` coincide con la suma de los tres deltas escalados con un error relativo de 2,2e-8. Las ramas AdaLN de LMS Sharp (50 ramas de "curvas Sharp" que reciben una curva temporal de 8 dimensiones en lugar de la entrada de capa) se mantienen como módulos separados porque su mecanismo no permite la fusión directa. El decodificador VAE rápido es un decodificador no causal de 24 capas (1,62 B de parámetros) destilado del VAE oficial de H3, procedente del proyecto StreamRender-H3, y reduce la decodificación del clip a 2560×1440 de 15 segundos a 1,6 segundos.

Los datos de entrenamiento del refiner LoRA (dataset, número de pasos completos más allá del checkpoint EMA 5000, RLHF u otros ajustes) no están disponibles en la información publicada.

## Capacidades

- Regeneración de vídeo a vídeo: toma un borrador en 768P (1344×768, 121 fotogramas) generado con MiniMax-H3 y lo regenera a 2560×1440 conservando la composición del original.
- Refinamiento en 3 pasos: reduce drásticamente el coste de muestreo frente a pipelines de difusión completos, con CFG 1 (sin guidance clásico).
- Upscaling latente: el upsampler 3D-conv incluido eleva el latente antes del refinamiento, evitando artefactos de interpolación directa en píxeles.
- Decodificación VAE acelerada: el decodificador destilado no causal de 24 capas decodifica clips 2K en 1,6 s frente a 15 s del VAE original.
- Motor de inferencia optimizado: soporte del Sol-Engine con atención Sol-Attn, cuantización MXFP8 y CUDA graphs para acelerar el forward pass.
- Compatibilidad con el ecosistema MiniMax-H3: incluye una copia íntegra de los componentes diffusers del modelo base (transformer, VAE, audio VAE, text encoder, tokenizer, processor y schedulers) en la revisión `6818f6c`.
- Descarga y despliegue asistidos: un script `download.py` en el repositorio de código descarga todos los componentes, incluido el adaptador opcional HyperFlow de 8 pasos.
- No hay evidencia en la documentación de capacidades de tool calling, agentes, razonamiento textual ni procesamiento de audio independiente (el audio VAE es un componente heredado del modelo base).

## Casos de uso

- Mejora de calidad de clips generados con MiniMax-H3: cualquier draft de 768P generado previamente puede convertirse en un master 2K sin regenerar el vídeo desde cero, ahorrando coste de muestreo al limitarse a 3 pasos de refinamiento.
- Postproducción de vídeo generativo en estudios: integración en pipelines de render donde el borrador se valida en baja resolución y solo los clips aprobados pasan al pase de refinamiento 2K, con un coste de 22,45 s por clip de 5 s en B200.
- Sustitución de la API cerrada H3-Regenerate-2K: equipos que dependían del endpoint propietario pueden replicar el comportamiento localmente, evitando costes por llamada y dependencia de un proveedor.
- Generación de contenido para redes y publicidad: producción de clips verticales u horizontales de 5 segundos a 2K (2560×1440) listos para plataformas que exigen alta resolución, con tiempos de vuelta compatibles con iteración creativa.
- Investigación en destilación y aceleración de difusión de vídeo: el bundle sirve como caso de estudio reproducible de fusión de múltiples LoRA (verificada con error 2,2e-8), destilación de VAE y optimización con CUDA graphs y MXFP8.
- Integración en ComfyUI y workflows existentes: los componentes (upsampler latente, LoRAs de LightX2V y LMS Sharp) provienen del ecosistema ComfyUI de MiniMax-H3, facilitando su adopción en flujos de nodo ya existentes.
- Experimentación con muestreo alternativo: el adaptador opcional HyperFlow de 8 pasos permite explorar compromisos entre número de pasos y calidad.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de latencia del pipeline completo en una GPU B200 (clip de 5 s, latente 768P → vídeo 2560×1440, mediana de 3 ejecuciones en caliente):

| Configuracion | Forward | VAE decoder | Total | Speedup |
|---|---|---:|---:|---:|
| `standard_fwd` (atencion densa, BF16) + VAE H3 oficial | no disponible | no disponible | 87,26 s | 1,00× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) + VAE H3 oficial | no disponible | no disponible | 37,39 s | 2,33× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) + VAE H3 rapido | no disponible | no disponible | 22,45 s | 3,89× |

Datos adicionales publicados: el VAE rápido decodifica el clip 2K en 1,6 s frente a 15 s del VAE original; el upscale latente más el refinamiento (sin decodificación) bajan de 73,11 s a 20,46 s (3,57×). Los números por módulo están en el README del código. No se han publicado resultados de benchmarks de calidad (FVD, PSNR, SSIM ni evaluaciones humanas) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente. El bundle completo pesa 164,9 GB (incluye el modelo base MiniMax-H3 completo en componentes diffusers), por lo que la inferencia del pipeline completo requiere memoria de GPU de gama datacenter; las mediciones publicadas se realizaron en una NVIDIA B200.
- GPU recomendada: NVIDIA B200 (configuración de referencia con Sol-Engine, MXFP8 y CUDA graphs). No disponible información sobre compatibilidad verificada con A100 o H100.
- Consumer GPU: no cabe razonablemente el pipeline completo en GPUs de consumo dado el tamaño del modelo base; no hay datos publicados sobre ejecución en RTX 4090 o similares.
- Despliegue: librería diffusers (pipeline video-to-video). El repositorio de código incluye `download.py` para descargar todos los componentes. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de difusión de vídeo).
- Latencia: 22,45 s por clip de 5 s a 2K con la configuración optimizada completa en B200; 37,39 s con el VAE original; 87,26 s en configuración estándar BF16 con atención densa. Throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | Open-H3-Regenerate-2K | API cerrada H3-Regenerate-2K | MiniMax-H3 (base) |
|---|---|---|---|
| Tipo | LoRA de refinamiento video-to-video (3 pasos) | Servicio propietario de regeneracion 2K | Modelo generativo de video base |
| Resolucion de salida | 2560×1440 | no disponible (2K segun nombre) | 1344×768 (borradores 768P) |
| Disponibilidad | Pesos abiertos en Hugging Face (164,9 GB) | API de pago, pesos no disponibles | Pesos abiertos con licencia comunitaria |
| Latencia por clip de 5 s | 22,45 s en B200 (config. optimizada) | no disponible | no disponible |
| Licencia | MiniMax H3 Community License + licencias de terceros | Propietaria | MiniMax H3 Community License |

No hay disponibles alternativas abiertas directamente comparables publicadas en la información proporcionada; los componentes de terceros integrados (LightX2V FL2VA Turbo v1.2 y LMS Sharp v1.0) son LoRAs de aceleración y refinamiento para MiniMax-H3 disponibles por separado, pero no cubren el pipeline completo de regeneración 2K.

## Limitaciones y advertencias

- Licencia no uniforme: el bundle no está cubierto por una única licencia global. El LoRA del refiner, el VAE rápido y `base_model/` siguen la MiniMax H3 Community License (con términos de territorio, uso y redistribución que deben revisarse antes de uso comercial), mientras que el upsampler latente, LightX2V FL2VA Turbo y LMS Sharp conservan sus propias licencias. Es imprescindible auditar las tres licencias por separado.
- Dependencia del modelo base: el sistema no genera vídeo desde texto de forma independiente; requiere un borrador previo generado con MiniMax-H3 a 768P.
- Requisitos de hardware elevados: las mediciones de referencia exigen una B200; no hay rutas documentadas para hardware de consumo.
- Sin métricas de calidad publicadas: no hay FVD, PSNR ni evaluaciones perceptuales en la model card, por lo que la fidelidad del refinamiento debe validarse empíricamente antes de producción.
- Verificación de fusión: aunque el error relativo de la fusión es de 2,2e-8, cualquier desviación de la receta de muestreo (sigmas, CFG, estado inicial) puede degradar el resultado; la receta de tres pasos es estricta.
- Riesgos generales de modelos de difusión de vídeo: posibles artefactos temporales o espaciales en el refinamiento, y herencia de sesgos del modelo base MiniMax-H3; no se documentan sesgos específicos.
- Proyecto de adopción muy temprana: 0 descargas y 1 like en Hugging Face en el momento de la ficha; la madurez, el soporte comunitario y la estabilidad del repositorio están por demostrar.
- Componentes excluidos: la copia del modelo base omite las carpetas nativas `FL2VA/`, `Ref2VA/` y `transformer_ref/` de MiniMax-H3, por lo que funcionalidades que dependan de ellas no están disponibles en este bundle.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/sekkit/Open-H3-Regenerate-2K
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/6818f6c32d12b210915e44ad56a4228c2608f160/LICENSE
- Modelo base MiniMax-H3 (revisión 6818f6c): https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/6818f6c32d12b210915e44ad56a4228c2608f160
- Página del proyecto: https://nvlabs.github.io/Sana/Open-H3-Regenerate-2K/
- Código (repositorio GitHub): https://github.com/NVlabs/Sana/tree/sol-engine/models/Open-H3-Regenerate-2K
- StreamRender-H3 (origen del VAE rápido): https://nvlabs.github.io/Sana/Sol-Engine/StreamRender-H3/
- Upsampler latente (Comfyui_Minimax_h3_latent_Upscaler): https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- LightX2V FL2VA Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo/tree/3ec17a324ced54151364f24f8b5fb6bf7e26414f
- LoRA LMS Sharp: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/loras/minimax_h3_lms_v1.0_r64.safetensors
- Tensor `adaln_t_table` (referencia): https://huggingface.co/Comfy-Org/MiniMax-H3
