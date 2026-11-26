# Abiray/Ming-Image-0.2-Design-GGUF

## Resumen

Ming-Image-0.2-Design es un modelo de difusion texto-a-imagen desarrollado por inclusionAI, orientado especificamente a diseno grafico y tipografia. El repositorio que nos ocupa, Abiray/Ming-Image-0.2-Design-GGUF, no es el modelo original sino una coleccion de cuantizaciones GGUF de precision mixta preparadas para ComfyUI mediante el nodo ComfyUI-GGUF. Incluye tanto el modelo de difusion DiT como el codificador de texto, un MoE Ling Mini 2.0 de 17.000 millones de parametros.

La relevancia de esta publicacion esta en que reduce los requisitos de VRAM de un modelo de diseno de gran tamano a cifras manejables en GPUs de consumo: las cuantizaciones del DiT van de 4,63 GB (Q2_K) a 5,91 GB (Q6_K), mientras que los codificadores de texto cuantizados ocupan entre 9,69 GB y 12,0 GB. El modelo base declara 6.154.901.056 parametros en safetensors para la parte de difusion, y el repositorio completo pesa 47,9 GB.

El autor emplea una tecnica de "raw packed-byte donor stitching" que evita el ciclo de desquantizacion y requantizacion, preservando tensores criticos de condicionamiento, routing, vision y edicion. Esto permite que funcionen tanto los flujos de texto-a-imagen como los de edicion de imagen en ComfyUI. La ficha se centra en la version cuantizada publicada, ya que es la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para el modelo de difusion; MoE de 17B (Ling Mini 2.0) como codificador de texto |
| Parametros totales | 6.154.901.056 (parte de difusion, dato real en safetensors); codificador de texto Ling Mini 2.0 de 17B |
| Parametros activos | no disponible (el codificador es MoE con 38 bancos de expertos, pero no se detalla el numero de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DiT: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K. Codificador: Q3_K_M, Q4_K_M. Componentes sensibles en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); VAE oficial en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base Ming-Image-0.2-Design combina un transformer de difusion (DiT) con un codificador de texto basado en Ling Mini 2.0, un modelo de mezcla de expertos de 17.000 millones de parametros con 38 bancos de expertos 3D. La arquitectura del codificador incluye bloques de vision (`vision.*`), conectores (`connector.*`), proyecciones directas VLM (`proj_directvlm.*`) y tokens de consulta (`query_tokens`), lo que sugiere un diseno multimodal orientado tanto a la comprension de prompts como a la edicion de imagen.

Las cuantizaciones de este repositorio se generan mediante stitching de bytes empaquetados sin perdida de desquantizacion/requantizacion. En el DiT, las FFN masivas (`w1`/`w3`) se cuantizan segun el nivel elegido, mientras que la atencion Q/K/V y AdaLN se mantienen uniformes en Q6_K para permitir la fusion limpia de tensores `qkv.weight` en ComfyUI-GGUF. Embedders, normas, sesgos y capas de salida permanecen en BF16. En el codificador de texto, las 38 puertas de routing MoE, embeddings, `lm_head` y proyecciones puente de edicion se conservan en BF16, y `query_tokens` y el `vision.patch_embed.proj.weight` 5D se almacenan en F32 exacto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con enfasis declarado en tipografia y diseno grafico.
- Edicion de imagen, gracias a la preservacion de los bloques de vision y las proyecciones puente de edicion en el codificador de texto.
- Comprension de prompts complejos mediante el codificador MoE Ling Mini 2.0, con fidelidad de layout y ortografia segun las metricas del autor.
- Integracion en ComfyUI mediante los nodos `UnetLoaderGGUF`, `CLIPLoaderGGUF` y `VAELoader`.
- Soporte de latentes de 16 canales (`EmptySD3LatentImage`) con resoluciones recomendadas de 1024x1024 y proporciones de diseno.
- Deteccion automatica del tipo de modelo (`TEModel.MING_IMAGE`) a partir de los pesos.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Diseno de carteles y material promocional: el modelo esta especializado en tipografia, por lo que puede generar composiciones con texto legible y jerarquia visual, usando el codificador Q4_K_M para maximizar la fidelidad de ortografia y layout.
- Edicion iterativa de imagenes en ComfyUI: los flujos de edicion funcionan gracias a la conservacion de los tensores `vision.*` y `connector.*`, permitiendo modificar una imagen existente sin regenerarla por completo.
- Prototipado rapido en equipos con GPU de 8 GB: la cuantizacion Q3_K_M del DiT (4,87 GB) esta pensada como "daily driver" para tarjetas de 8 GB de VRAM, con una similitud coseno de 0,9885 frente a BF16.
- Generacion de mockups de baja VRAM: la Q2_K (4,63 GB) permite ejecutar el modelo en GPUs de 6-8 GB, adecuada para exploracion conceptual donde la fidelidad fina no es critica.
- Produccion con calidad casi sin perdida: la Q6_K (5,91 GB, coseno 0,9998 y SQNR 34,94 dB) es la opcion para entregables finales que requieren microdetalle tipografico, con un tamano inferior al INT8 de 6,18 GB.
- Automatizacion de pipelines de diseno grafico: al integrarse en ComfyUI, el modelo puede encadenarse con nodos de postproceso, upscaling o composicion para generar lotes de variantes de un mismo diseno.
- Investigacion sobre cuantizacion de modelos de difusion: las metricas de coseno y SQNR por nivel publicadas por el autor permiten estudiar el impacto de la precision mixta en tareas de tipografia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas internas de fidelidad de cuantizacion frente a BF16:

| Archivo | Tamano | Coseno / SQNR (vs BF16) | Uso recomendado |
|---|---:|---|---|
| Ming-Image-0.2-Design-Q2_K.gguf | 4,63 GB | 0,9574 / 10,54 dB | VRAM ultra baja (6-8 GB) |
| Ming-Image-0.2-Design-Q3_K_M.gguf | 4,87 GB | 0,9885 / 16,36 dB | GPU de 8 GB, uso diario |
| Ming-Image-0.2-Design-Q4_K_M.gguf | 5,24 GB | 0,9974 / 22,87 dB | Mejor equilibrio tamano-calidad |
| Ming-Image-0.2-Design-Q5_K_M.gguf | 5,60 GB | 0,9993 / 28,78 dB | Tipografia y microdetalle casi BF16 |
| Ming-Image-0.2-Design-Q6_K.gguf | 5,91 GB | 0,9998 / 34,94 dB | Practicamente sin perdida |
| Ming-Image-0.2-Ling-Mini-2.0-Q3_K_M.gguf | 9,69 GB | 0,9886 / 16,40 dB | Menor huella de RAM, buena ortografia |
| Ming-Image-0.2-Ling-Mini-2.0-Q4_K_M.gguf | 12,0 GB | 0,9974 / 22,90 dB | Comprension de prompt casi sin perdida |

## Requisitos de hardware

- VRAM estimada para el DiT: entre 4,63 GB (Q2_K) y 5,91 GB (Q6_K), sin contar el codificador de texto ni el VAE.
- VRAM estimada para el codificador de texto: entre 9,69 GB (Q3_K_M) y 12,0 GB (Q4_K_M).
- VAE obligatorio en BF16 (`ming_image_vae_bf16.safetensors`), que anade su propia huella de memoria; no debe cuantizarse.
- GPU recomendadas: el autor menciona explicitamente GPUs de 6-8 GB de VRAM para las cuantizaciones bajas del DiT; para ejecutar DiT y codificador juntos se requiere bastante mas memoria, y no se detalla el minimo total.
- Cabe en GPU de consumo: si, al menos el DiT en Q2_K/Q3_K_M en tarjetas de 8 GB; el codificador de texto de 9,69-12,0 GB condiciona el requisito global.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (PR #484 para QKV empaquetado del DiT y PR #486 para MoE 3D cuantizado y `tokenizer_json`). No se documentan otros runtimes como vLLM, llama.cpp u Ollama.
- Configuracion de muestreo recomendada: sampler `euler`/`simple`, 20-28 pasos, CFG 3,5-4,5, `ModelSamplingAuraFlow` con shift 3.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada. A continuacion se comparan las alternativas de codificador de texto y VAE ofrecidas por el propio ecosistema:

| Opcion | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ming-Image-0.2-Design GGUF (este repo) | 6,15B DiT + 17B MoE texto | GGUF | no disponible | Hugging Face, ComfyUI |
| Codificador oficial Comfy-Org (int8_convrot / w4a8) | 17B MoE | safetensors | no disponible | Comfy-Org/Ming-Image |
| VAE oficial BF16 | no disponible | safetensors | no disponible | Comfy-Org/Ming-Image |

No se conocen modelos comparables de terceros con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada; verificar los terminos del modelo base inclusionAI/Ming-Image-0.2-Design antes de cualquier uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M introducen perdida medible (coseno 0,9574 y 0,9885 respectivamente); la Q2_K puede degradar tipografia y microdetalle.
- El codificador de texto cuantizado exige instalar versiones especificas de ComfyUI-GGUF con los PR #484 y #486; sin ellos, la carga falla o produce errores de dtype.
- El VAE no debe cuantizarse; usar el BF16 oficial es obligatorio para evitar artefactos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad real de las cuantizaciones.
- No se documentan sesgos conocidos, riesgo de alucinacion visual, ni limitaciones de idioma en la informacion disponible.
- El autor declara auditorias estructurales (519/519 tensores del DiT, 1.037/1.037 del codificador) y verificacion con `GGUFReader`, pero no se aportan resultados de evaluacion cualitativa independiente.
- El modelo esta orientado a diseno y tipografia; su comportamiento en otros dominios visuales no esta documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abiray/Ming-Image-0.2-Design-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- PR #484 (soporte QKV empaquetado del DiT): https://github.com/city96/ComfyUI-GGUF/pull/484
- PR #486 (soporte MoE 3D cuantizado y tokenizer_json): https://github.com/city96/ComfyUI-GGUF/pull/486
- VAE oficial BF16: https://huggingface.co/Comfy-Org/Ming-Image/blob/main/vae/ming_image_vae_bf16.safetensors
- Carpeta de VAE de Comfy-Org: https://huggingface.co/Comfy-Org/Ming-Image/tree/main/vae
- Codificadores de texto oficiales de Comfy-Org: https://huggingface.co/Comfy-Org/Ming-Image/tree/main/text_encoders
