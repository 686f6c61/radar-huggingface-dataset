# haoahjsvhw/Realistic_Vision_V6.0_B1_noVAE

## Resumen

Realistic Vision V6.0 B1 "New Vision" es un modelo de generación de imágenes text-to-image derivado de Stable Diffusion 1.5, orientado al fotorrealismo y a la representación realista de figuras humanas. Lo publica el usuario `haoahjsvhw` en HuggingFace, si bien el modelo original es obra de SG161222 (conocido en la comunidad por la saga Realistic Vision) y su página canónica de referencia se encuentra en CivitAI. Esta versión B1 es una beta pública de la futura versión completa 6.0, que se distribuirá de forma gradual en varias betas hasta el lanzamiento final.

El modelo no incorpora el VAE en el repositorio (de ahí el sufijo `_noVAE`): el autor recomienda acoplarlo explícitamente con `sd-vae-ft-mse-original` para mejorar la calidad y reducir artefactos. La arquitectura subyacente es la de Stable Diffusion 1.5 (UNet con atención cruzada, VAE y codificador de texto CLIP), con un pipeline `text-to-image` en la librería `diffusers`. El repositorio ocupa 18,3 GB y contiene pesos en formato diffusers.

Su relevancia actual es la de un checkpoint comunitario de referencia para retrato y fotografía realista dentro del ecosistema SD 1.5, con resoluciones nativas ampliadas (hasta 896x896 y 1152x640) respecto a versiones anteriores. No es un modelo de lenguaje: no procesa texto como salida ni soporta tool calling, agentes ni razonamiento multi-paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + VAE + CLIP text encoder) |
| Parámetros totales | no disponible (checkpoint SD 1.5, ~0,98 mil millones en la UNet; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP, 77 tokens por defecto) |
| Tipos de cuantización | no disponible (pesos en fp16/fp32; compatibles con cuantizaciones de la comunidad para SD 1.5, no confirmado) |
| Idiomas soportados | no disponible (prompts en inglés recomendados por la model card) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | diffusers (safetensors dentro del layout de diffusers); no incluye VAE |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Stable Diffusion 1.5, es decir, una red UNet con bloques de atención cruzada sobre embeddings de texto CLIP, acoplada a un VAE para la codificación y decodificación de imágenes. El pipeline declarado es `StableDiffusionPipeline` (text-to-image puro, sin img2img ni inpainting en la metadata). El checkpoint se distribuye sin VAE, y el autor recomienda usar `stabilityai/sd-vae-ft-mse-original` para mejorar la calidad y eliminar artefactos.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o fine-tuning por preferencias. Tampoco se documentan innovaciones arquitectónicas (atención lineal, decodificación especulativa, SSM híbridos, etc.). Las mejoras declaradas por el autor son de carácter práctico: aumento de la resolución de generación nativa a 896x896, 768x1024, 640x1152, 1024x768 y 1152x640, y mejoras en la representación de anatomía femenina en contenido SFW y NSFW. El autor advierte que en esas resoluciones altas aún pueden aparecer mutaciones y duplicaciones, que se corregirán en betas posteriores.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto (text-to-image).
- Retrato realista: rostros, medios cuerpos y cuerpos completos, con resoluciones recomendadas específicas por tipo de encuadre.
- Compatibilidad con Hires.Fix para escalado y refinado (recomendado especialmente en cuerpo completo y medio cuerpo).
- Compatibilidad con herramientas de restauración facial (Restore Faces, ADetailer).
- Soporte de prompts negativos extensos para control de calidad y anatomía.
- Generación de contenido SFW y NSFW (según la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; la model card está en inglés y no declara idiomas soportados.

## Casos de uso

- Retrato profesional y avatares: con resolución nativa de 896x896 y Hires.Fix, el modelo está pensado para generar retratos de estudio y avatares de alta calidad para perfiles y materiales de marketing.
- Fotografía de producto simulada: generación de imágenes de medio cuerpo y cuerpo completo (768x1024, 640x1152) para catálogos y mockups, usando prompts negativos para evitar artefactos anatómicos.
- Ilustración editorial y previsualización de conceptos: generación rápida de referencias visuales fotorrealistas para equipos de diseño antes de una producción fotográfica real.
- Contenido para redes sociales y moda: encuadres verticales (640x1152, 768x1024) adecuados para stories y publicaciones, con Hires.Fix para textura de piel realista.
- Restauración y mejora de retratos en pipelines con ADetailer: integración en flujos de posprocesado para corregir caras y manos en imágenes generadas o existentes.
- Prototipado en estudios de videojuegos y cine: generación de referencias de personajes humanos realistas para preproducción, dado el enfoque del checkpoint en anatomía y piel.
- Investigación en generación de imágenes: checkpoint de referencia para comparar fine-tunes de SD 1.5 en tareas de fotorrealismo y evaluar el impacto del VAE acoplado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como checkpoint SD 1.5, es habitual que requiera del orden de 4-6 GB en fp16 para inferencia a 512x512, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- ¿Cabe en GPU de consumo? No confirmado en la información; el tamaño del repo (18,3 GB) corresponde a los pesos en disco, no a la VRAM necesaria en inferencia.
- Opciones de despliegue: `diffusers` (pipeline `StableDiffusionPipeline`); el tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Resolución nativa | Licencia | Disponibilidad |
|---|---|---|---|---|
| Realistic Vision V6.0 B1 (este) | SD 1.5 | hasta 896x896 / 1152x640 | creativeml-openrail-m | HuggingFace y CivitAI |
| Realistic Vision V5.1 | SD 1.5 | 512x512 (con Hires.Fix) | creativeml-openrail-m | CivitAI y HuggingFace |
| SDXL (Stability AI) | SDXL | 1024x1024 | openrail++ | HuggingFace |
| RealDreamXL | SDXL | 1024x1024 | no disponible | Mage.Space |

La comparativa se limita a la categoría (checkpoints fotorrealistas de difusión). No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre ellos; los datos de resolución y licencia proceden de la información disponible y de conocimiento general del ecosistema, y los de RealDreamXL solo constan como modelo del mismo autor alojado en Mage.Space.

## Limitaciones y advertencias

- Es una versión beta (B1): el autor advierte explícitamente que no es la versión completa y que pueden aparecer mutaciones, duplicaciones y artefactos, especialmente en resoluciones altas y en cuerpo completo.
- El checkpoint no incluye VAE; usarlo sin el VAE recomendado (`sd-vae-ft-mse-original`) degrada la calidad y aumenta los artefactos.
- Riesgo de alucinación visual: anatomía incorrecta (dedos, manos, extremidades), rostros deformados y proporciones erróneas; el autor recomienda Hires.Fix, Restore Faces y ADetailer para mitigarlo.
- Genera contenido NSFW según la model card; requiere filtrado y políticas de uso en entornos de producción y públicos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, difamatorios o ilegales según los términos de la licencia); conviene revisar las cláusulas de atribución y redistribución antes de desplegar.
- Idiomas: no se declaran idiomas soportados; los prompts en inglés son el caso documentado.
- Sin datos publicados de benchmarks, sesgos demográficos medidos ni evaluaciones de seguridad; no apto para decisiones automatizadas de alto riesgo sin auditoría previa.
- Es un modelo de generación de imágenes, no de lenguaje: no soporta razonamiento, código, matemáticas, tool calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/haoahjsvhw/Realistic_Vision_V6.0_B1_noVAE
- CivitAI (página del modelo): https://civitai.com/models/4201/realistic-vision-v60-b1?modelVersionId=245598
- VAE recomendado: https://huggingface.co/stabilityai/sd-vae-ft-mse-original
- Mage.Space (patrocinador): https://www.mage.space/
- Apoyo al autor: https://boosty.to/sg_161222
