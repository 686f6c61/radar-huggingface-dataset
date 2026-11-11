# Denisijcu/vertex-imagen-core-gguf

## Resumen

Vertex-Imagen-Core-v1 es un modelo de generación de imágenes texto-a-imagen desarrollado por Denis Sanchez Leyva (Vertex Coders LLC, Miami). Se construye sobre Stable Diffusion XL 1.0 mediante un LoRA de difusión denominado `vtxcore style`, fusionado de forma permanente y acelerado con SDXL-Lightning para inferencia en 4 pasos. El resultado se empaqueta de forma monolítica como un único archivo GGUF Q8_0 que integra UNet, CLIP-L, OpenCLIP-G y VAE en FP16, con 2.641 tensores y un tamaño de 3,89 GB.

La propuesta diferencial del modelo es la ejecución local de baja latencia en GPUs de consumo con 6 GB de VRAM, como una NVIDIA GTX 1660 Ti, mediante `stable-diffusion.cpp`. Frente a los flujos habituales de Diffusers o ComfyUI, que requieren más memoria y dependencias, este empaquetado monolítico reduce la huella y simplifica el despliegue en entornos Windows 11 y Linux/WSL2.

El modelo está especializado estilísticamente en ilustración vectorial de alto contraste, estética cyberpunk y sci-fi oscura, con fondos negros puros orientados a sublimación textil, merchandising, portadas editoriales y visualización de HUDs tácticos. Su ámbito es, por tanto, nicho y estilístico, no generalista. La licencia es CreativeML OpenRAIL++-M y los idiomas declarados son inglés y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL 1.0 + SDXL-Lightning (4 pasos) + LoRA `vtxcore style` fusionado |
| Parametros totales | 3.468.837.867 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | GGUF Q8_0 (unico publicado) |
| Idiomas soportados | en, es |
| Licencia | CreativeML OpenRAIL++-M (openrail++) |
| Formato de pesos | GGUF (monolitico: UNet + CLIP-L + OpenCLIP-G + VAE FP16) |
| Tamano del archivo | 3,89 GB (4,18 GB en el indice de Hugging Face) |
| Resolucion nativa | 1024 x 1024 px |
| Pasos optimos | 4 |
| CFG scale | 1.0 |
| Sampler | euler |
| Trigger word | `vtxcore style` |
| VRAM minima recomendada | 6 GB (con `--vae-tiling`) |
| Tensores integrados | 2.641 |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SDXL 1.0: un UNet de difusion con doble text encoder (CLIP-L y OpenCLIP-G) y un VAE que opera en el espacio latente a 1024 x 1024 píxeles. Sobre esta base se aplica un LoRA de difusion entrenado por el autor con el estilo `vtxcore style`, que se fusiona permanentemente en los pesos del UNet, de modo que no es necesario cargar el adaptador por separado en inferencia. Adicionalmente se integra la destilación SDXL-Lightning, que permite reducir el muestreo a 4 pasos con CFG 1.0, eliminando la necesidad de classifier-free guidance de doble pasada y reduciendo el coste computacional por imagen.

El empaquetado es monolítico: el UNet, ambos text encoders y el VAE (en FP16 con corrección) se serializan en un único archivo GGUF Q8_0 de 2.641 tensores, pensado para el motor `stable-diffusion.cpp`. El autor no detalla en la model card el volumen de datos de entrenamiento del LoRA, la composicion del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma estándar en difusión). Tampoco se especifica el número de imágenes ni el rango del adaptador. Toda esa información debe considerarse no disponible.

## Capacidades

- Generación texto-a-imagen a 1024 x 1024 píxeles con 4 pasos de muestreo y sampler euler.
- Estilización consistente mediante la trigger word `vtxcore style`, orientada a ilustración vectorial de alto contraste.
- Producción de gráficos con fondos negros puros, aptos para corte, sublimación e impresión textil.
- Generación de emblemas, mascotas mecánicas y logotipos de estética esports y cyber-samurai.
- Ilustración editorial y portadas de libros técnicos de sci-fi, ciberseguridad e ingeniería de IA.
- Visualización de HUDs tácticos, interfaces holográficas, nodos de red y telemetría.
- Soporte de prompts en inglés y español (idiomas declarados en la model card).
- Ejecución local en CPU/GPU mediante `stable-diffusion.cpp`, con soporte de `--vae-tiling` para reducir VRAM.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de difusión, no un LLM.
- No dispone de capacidades de visión, audio ni comprensión de imágenes de entrada (no es image-to-image en la información publicada).

## Casos de uso

- Sublimación y merchandising textil: el modelo genera emblemas y gráficos vectoriales con fondo negro puro listos para corte e impresión, gracias a su estilización `vtxcore style` y a la resolución nativa de 1024 x 1024.
- Diseño de camisetas y apparel esports: con prompts como el lobo cibernético con placas metálicas y ojos esmeralda, el modelo produce arte de alto contraste adecuado para estampación DTG y serigrafía.
- Portadas de libros técnicos de ciberseguridad e IA: la estética de escudo red team, matriz binaria y acentos neón encaja con portadas de manuales de seguridad ofensiva y arquitecturas de IA.
- Arte conceptual sci-fi y worldbuilding: escenas atmosféricas tipo Aethelgard, con arquitectura brutalista monolítica y runas cian, para pitches de videojuegos o narrativa transmedia.
- Visualización de HUDs y paneles tácticos: generación de interfaces holográficas y centros de comando para mockups de producto, presentaciones o material de marketing tecnológico.
- Prototipado rápido de identidad visual de marca: iteración de logotipos y mascotas con 4 pasos por imagen y 6 GB de VRAM, lo que permite ejecutar el modelo en estaciones de trabajo modestas sin GPU dedicada de gama alta.
- Generación de assets para comunidades y streamers: avatares, banners y overlays con estética cyberpunk oscura, ejecutables localmente en Windows 11 o Linux/WSL2 sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas FID, CLIP score, comparativas automáticas ni evaluaciones humanas. El autor únicamente documenta parámetros operativos: 4 pasos, CFG 1.0, sampler euler, 1024 x 1024 y 6 GB de VRAM mínima con `--vae-tiling`.

## Requisitos de hardware

- VRAM estimada: 6 GB con `--vae-tiling` activado, según el autor. Sin tiling, la huella del VAE a 1024 x 1024 puede superar ese umbral.
- GPU recomendadas por el autor: NVIDIA GTX 1660 Ti (6 GB) como mínimo validado. GPUs con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) ofrecen margen para desactivar tiling y aumentar resolución o lote.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o superiores. No se documenta ejecución en CPU pura ni latencias en ese modo.
- Opciones de despliegue: `stable-diffusion.cpp` mediante `sd-cli` (Windows PowerShell y Linux/WSL2 documentados). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión.
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen ni imágenes por segundo en ninguna GPU concreta.
- Almacenamiento: 3,89 GB para el archivo GGUF, 4,18 GB en el índice de Hugging Face y 11,1 GB de tamaño total del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Formato | Licencia | VRAM minima |
|---|---|---|---|---|---|---|
| Vertex-Imagen-Core-v1 | 3.468.837.867 | 1024 x 1024 | 4 (Lightning) | GGUF Q8_0 | CreativeML OpenRAIL++-M | 6 GB |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible en la informacion | 1024 x 1024 | 20-50 tipicos | safetensors | CreativeML OpenRAIL++-M | 8-10 GB tipicos |
| SDXL-Lightning (ByteDance) | no disponible en la informacion | 1024 x 1024 | 2, 4 u 8 | safetensors / LoRA | no disponible en la informacion | 8 GB tipicos |
| SD 1.5 (Runway) | no disponible en la informacion | 512 x 512 | 20-30 tipicos | safetensors / GGUF | CreativeML OpenRAIL-M | 4 GB tipicos |

La comparativa se limita a los datos publicados en la model card. Vertex-Imagen-Core-v1 se diferencia de SDXL base por el empaquetado GGUF monolítico, la destilación a 4 pasos y el LoRA de estilo fusionado, lo que reduce VRAM y pasos a costa de perder generalidad estilística. Frente a SDXL-Lightning puro, añade el estilo propietario y el formato GGUF listo para `stable-diffusion.cpp`. Frente a SD 1.5, duplica la resolución nativa y cuadruplica aproximadamente el número de parámetros, aunque no hay métricas publicadas que cuantifiquen la mejora de calidad.

## Limitaciones y advertencias

- Modelo de nicho estilístico: el LoRA `vtxcore style` está fusionado de forma permanente, por lo que no puede desactivarse para obtener generación generalista. La salida tenderá siempre al estilo vectorial oscuro y de alto contraste.
- Sesgos conocidos: no documentados por el autor. Como derivado de SDXL, hereda los sesgos del dataset de entrenamiento original de Stability AI, no evaluados en esta ficha.
- Riesgo de alucinación visual: no cuantificado. No hay evaluación de fidelidad a prompts ni de coherencia anatómica o de texto en imagen.
- Limitaciones de idioma: solo se declaran inglés y español. El comportamiento con prompts en otros idiomas no está verificado y probablemente sea deficiente.
- Restricciones de licencia: CreativeML OpenRAIL++-M incluye cláusulas de uso restringido (no uso para vigilancia masiva, discriminación, desinformación, etc.). El uso comercial está permitido bajo esas condiciones, pero debe revisarse la licencia completa antes de producción.
- Trigger word obligatoria: sin `vtxcore style` en el prompt, la estilización puede no activarse correctamente.
- Parámetros fijos: el autor recomienda 4 pasos, CFG 1.0 y sampler euler. Desviarse de estos valores puede degradar la calidad, ya que el modelo está destilado para ese régimen.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026. No hay evidencia de comunidad, issues resueltos ni validación independiente.
- Sin benchmarks: no hay métricas objetivas de calidad que permitan comparar con alternativas establecidas.
- Formato único: solo se publica GGUF Q8_0, sin safetensors ni otras cuantizaciones, lo que limita la integración con ecosistemas como Diffusers o ComfyUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denisijcu/vertex-imagen-core-gguf
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- stable-diffusion.cpp (repositorio del motor): https://github.com/leejet/stable-diffusion.cpp
- SDXL-Lightning (ByteDance): https://huggingface.co/ByteDance/SDXL-Lightning
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
