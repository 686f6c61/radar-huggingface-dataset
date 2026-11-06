# maxh8086/tokenfrugal-flux2-klein-4b-fp8

## Resumen

`tokenfrugal-flux2-klein-4b-fp8` es un repositorio espejo privado publicado por el usuario `maxh8086` que empaqueta los tres componentes necesarios para ejecutar un pipeline de generación de imágenes texto-a-imagen en ComfyUI: el modelo de difusión FLUX.2 klein 4B en FP8, un codificador de texto Qwen3-4B en FP8 y el VAE de FLUX.2. No se trata de un modelo entrenado por el autor, sino de una agregación de pesos derivados de `black-forest-labs/FLUX.2-klein-4b-fp8`, `Qwen/Qwen3-4B-FP8` y el VAE de `black-forest-labs/FLUX.2-klein-4B`. El repositorio tiene 9,4 GB y, en el momento de la consulta, cero descargas y cero likes.

La relevancia de esta ficha es doble. Por un lado, documenta la composición técnica de un pipeline FLUX.2 klein de 4B parámetros en precisión FP8. Por otro, y esto es lo más importante, la propia model card reporta que el codificador de texto FP8 incluido **no funciona correctamente con ComfyUI**: en 5 de 5 pruebas de render produjo una textura plana sin sujeto reconocible, mientras que la conversión Q4_K_S del mismo modelo sí generó la imagen descrita. El autor califica explícitamente el fichero FP8 como no operativo hasta que se verifique una corrección.

Por tanto, esta ficha debe leerse como documentación de un artefacto con un fallo conocido y no verificado, no como una recomendación de uso en producción. La licencia declarada en la model card es Apache-2.0, pero el propio autor indica que debe verificarse contra las model cards de los modelos upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión (modelo de difusión FLUX.2 klein 4B + codificador de texto Qwen3-4B + VAE FLUX.2) |
| Parámetros totales | 4B en el modelo de difusión; 4B en el codificador de texto (no se especifica el total agregado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (ficheros incluidos); la model card menciona Q4_K_S como alternativa para el codificador de texto, pero ese GGUF no está en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 según la model card, con indicación de verificar contra los modelos upstream |
| Formato de pesos | safetensors (tres ficheros: difusión, codificador de texto y VAE) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega pesos ya existentes. El componente principal es FLUX.2 klein 4B, un modelo de difusión de 4B parámetros para generación de imágenes a partir de texto, empaquetado en FP8 (fichero `flux-2-klein-4b-fp8.safetensors`, 4.070.624.520 bytes). El codificador de texto es Qwen3-4B en FP8 (`qwen3-4b-fp8.safetensors`, 5.190.053.664 bytes), según la model card fusionado localmente a partir de shards. El tercer componente es el VAE de FLUX.2 (`flux2-vae.safetensors`, 168.120.878 bytes). La ruta interna de ComfyUI indicada es `models/image_generation/comfy-t2i/{diffusion_models,text_encoders,vae}`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación, porque la model card no los documenta y corresponden a los modelos upstream. La innovación técnica documentada en este repo no es arquitectónica sino de evaluación: el autor incluye una comprobación de calidad local (fecha 2026-11-05) con perplejidad del codificador y comparación de renders FP8 frente a Q4_K_S, medida en hardware local y no en el hardware de referencia upstream. La perplejidad del codificador Qwen3-4B en F16 es 10,3028 ± 1,10517 y en Q4_K_S 10,8623 ± 1,16969 (+5,4 %), medida con `llama-perplexity` sobre una muestra de texto en inglés de 9,6 KB con `-c 512 -t 8 -ngl 0`.

## Capacidades

- Generación de imágenes texto-a-imagen mediante un pipeline de difusión FLUX.2 klein 4B, con renders a 768x768 y 4 pasos en las pruebas del autor (sampler euler, cfg 1.0).
- Codificación de texto de los prompts mediante un codificador Qwen3-4B en FP8.
- Integración con ComfyUI a través de CLIPLoader, según la ruta de ficheros indicada en la model card.
- Capacidades del codificador Qwen3-4B subyacente (generación de texto, razonamiento, multilingüismo) no documentadas en este repo y no verificadas en el contexto del pipeline.
- Tool calling, function calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de pipelines de difusión en FP8: el repo sirve para reproducir la comparación entre un codificador de texto FP8 y uno Q4_K_S en un pipeline FLUX.2 klein 4B, con métricas PSNR y SSIM sobre renders a 768x768 y 4 pasos. Es adecuado porque incluye los tres ficheros y la metodología de prueba documentada.
- Reproducción de la comprobación de perplejidad del codificador: permite validar la degradación de un Qwen3-4B cuantizado a Q4_K_S (+5,4 % de perplejidad frente a F16) usando `llama-perplexity` con contexto 512 y 8 hilos.
- Despliegue local en ComfyUI para experimentación: los ficheros están organizados con la estructura de directorios que ComfyUI espera (`comfy-t2i/diffusion_models`, `text_encoders`, `vae`), lo que facilita montar el pipeline en una instalación local.
- Depuración de fallos de cuantización en codificadores de texto: el caso documentado (textura plana sin sujeto en 5 de 5 renders) es un ejemplo concreto de cómo un fichero FP8 mal formateado rompe la generación de imágenes sin lanzar necesariamente un error explícito.
- Comparación de calidad visual entre precisiones: los valores de PSNR (10,67-12,03 dB) y SSIM (0,2445-0,7077) entre FP8 y Q4_K_S permiten construir un banco de pruebas para decidir qué precisión usar en un pipeline de imagen.
- Archivo y espejo interno de pesos: el repo se describe como espejo privado para el proyecto tokenfrugal, con instrucción de descarga mediante `scripts/hf_models.py pull`, útil para equipos que necesiten una copia controlada de los tres componentes.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de calidad de imagen tipo FID o CLIP score). Incluye una comparación de render FP8 frente a Q4_K_S con PSNR y SSIM sobre escala de grises, ventana uniforme 7x7:

| # | Prompt | FP8 PSNR (dB) | FP8 SSIM | FP8 wall (s) | Q4_K_S wall (s) |
|---|---|---|---|---|---|
| 1 | a red bicycle leaning against a white wall, soft morning light | 10,91 | 0,5437 | 26,5 | 43,2 |
| 2 | a blue ceramic teapot on a wooden table, window light | 10,78 | 0,5709 | 28,3 | 42,4 |
| 3 | a small dog running across a green field, afternoon sun | 10,67 | 0,3881 | 28,2 | 42,7 |
| 4 | an old brick house with ivy, overcast sky | 10,88 | 0,2445 | 28,3 | 42,9 |
| 5 | a glass of orange juice on a marble counter, morning light | 12,03 | 0,7077 | 28,3 | 44,8 |

El autor advierte que estos valores reflejan el fallo del fichero FP8 (textura plana sin sujeto en 5 de 5 renders) y no deben interpretarse como una puntuación de calidad. El FP8 es más rápido en tiempo de pared (26,5-28,3 s frente a 42,4-44,8 s), pero el resultado visual es incorrecto. No se ha realizado todavía una línea base con Qwen3-4B en bf16 para confirmar si la causa es el formato FP8 en sí.

## Requisitos de hardware

- VRAM estimada: el repositorio suma 9,4 GB de pesos (4,07 GB de difusión + 5,19 GB de codificador + 0,17 GB de VAE); la VRAM de inferencia será superior a esa cifra por activaciones y buffers del pipeline, pero no se especifica en la información disponible.
- GPU recomendadas: no disponible en la model card. Las pruebas se ejecutaron en hardware local no identificado, con `-ngl 0` en la medición de perplejidad (sin offload a GPU en esa prueba concreta).
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de los pesos (9,4 GB en total) sugiere que podría caber en GPUs con 12-16 GB de VRAM, pero no hay dato verificado.
- Opciones de despliegue: ComfyUI con CLIPLoader (documentado); `llama.cpp` para la medición de perplejidad del codificador (`llama-perplexity`, `llama-quantize`). vLLM, TGI, Ollama u otros no se mencionan.
- Latencia y throughput: en las pruebas del autor, el render FP8 tarda 26,5-28,3 s y el Q4_K_S 42,4-44,8 s por imagen a 768x768, 4 pasos, sampler euler y cfg 1.0. No se documenta throughput agregado ni latencia en otros tamaños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tokenfrugal-flux2-klein-4b-fp8 | 4B difusión + 4B codificador | no disponible | Apache-2.0 (verificar upstream) | Hugging Face, 0 descargas | Codificador FP8 no funcional en ComfyUI según el autor |
| black-forest-labs/FLUX.2-klein-4b-fp8 (upstream) | 4B difusión | no disponible | no disponible en esta ficha | Hugging Face (referencia citada) | Origen del modelo de difusión; no se dispone de sus métricas |
| Qwen/Qwen3-4B-FP8 (upstream) | 4B | no disponible | no disponible en esta ficha | Hugging Face (referencia citada) | Origen del codificador de texto |
| Qwen3-4B en Q4_K_S (GGUF) | 4B | no disponible | no disponible en esta ficha | No incluido en este repo | Usado como referencia funcional en las pruebas; produce imágenes correctas en 5 de 5 renders |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos upstream en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Fallo crítico documentado**: el codificador de texto FP8 incluido en este repo produce una textura plana sin sujeto reconocible en 5 de 5 renders con ComfyUI. El autor lo marca explícitamente como no funcional hasta que se verifique una corrección.
- **Causa no confirmada**: no se ha ejecutado una línea base con Qwen3-4B en bf16, por lo que no se sabe si el problema es el formato FP8, la fusión de shards o la integración con ComfyUI.
- **Licencia ambigua**: la model card declara Apache-2.0 pero indica que debe verificarse contra las model cards upstream; no se confirma aquí la licencia de FLUX.2 klein 4B ni de Qwen3-4B.
- **Sin métricas de calidad estándar**: no hay FID, CLIP score ni evaluaciones humanas; los valores de PSNR y SSIM miden la divergencia frente a un render roto, no la calidad.
- **Sesgos y alucinaciones**: no documentados en la información disponible; corresponden a los modelos upstream y no se han evaluado en este repo.
- **Idiomas**: no se especifican los idiomas soportados por el pipeline ni por el codificador en este contexto.
- **Uso en producción**: desaconsejado con el fichero FP8 actual; el propio autor lo califica como no operativo. Cualquier despliegue debería usar el codificador Q4_K_S o esperar a una corrección verificada.
- **Repo privado y sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maxh8086/tokenfrugal-flux2-klein-4b-fp8
- Modelo de difusión upstream citado: https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8
- Codificador de texto upstream citado: https://huggingface.co/Qwen/Qwen3-4B-FP8
- VAE upstream citado: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Hoja de contactos de la evaluación (ruta indicada en la model card): `eval/klein_fp8_vs_q4ks_contact_sheet.png` dentro del repositorio
- Script de descarga citado: `scripts/hf_models.py pull` (incluido en el repositorio)
