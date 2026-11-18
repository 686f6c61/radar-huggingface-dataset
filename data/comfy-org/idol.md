# Comfy-Org/Idol

## Resumen

Idol es un modelo de difusion para reconstruccion 3D a partir de una sola imagen (image-to-3D), empaquetado por Comfy-Org para su uso directo en ComfyUI. Se trata de un ajuste fino (fine-tune) del modelo TripoSplat de speridlabs, y genera representaciones 3D en formato Gaussian Splat a partir de una imagen de entrada. El repositorio original del modelo es speridlabs/idol, y esta version es un reempaquetado de los pesos en formato single-file para integrarse en el ecosistema de ComfyUI.

La relevancia actual del modelo radica en que permite flujos de trabajo de generacion 3D dentro de ComfyUI sin necesidad de conversiones manuales: los pesos se distribuyen como safetensors individuales (modelo de difusion, encoder de vision DINOv3, VAE y decoder) listos para colocarse en las carpetas correspondientes. El pipeline declarado es image-to-3d y el modelo se apoya en el VAE de Flux2 (flux2-vae.safetensors) junto con un decoder especifico (idol_decoder_fp16.safetensors).

La informacion publica disponible sobre arquitectura interna, numero de parametros, contexto y datos de entrenamiento es muy limitada: la model card solo indica que es un fine-tune de TripoSplat y proporciona instrucciones de instalacion y un workflow de ejemplo. No se detallan tamanos, regimen de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de TripoSplat; difusion para image-to-3D con encoder de vision DINOv3 y VAE Flux2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion image-to-3D) |
| Tipos de cuantizacion | fp16 (idol_fp16.safetensors) y bf16 (dino_v3_vit_h_bf16.safetensors); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. La model card indica unicamente que Idol es una version ajustada (fine-tuned) de TripoSplat y que funciona con los workflows existentes de TripoSplat. Los ficheros distribuidos revelan la composicion del pipeline: un modelo de difusion principal (idol_fp16.safetensors), un encoder de vision DINOv3 ViT-H en bf16 (dino_v3_vit_h_bf16.safetensors), el VAE de Flux2 (flux2-vae.safetensors) y un decoder especifico (idol_decoder_fp16.safetensors). La salida del pipeline es una representacion 3D en formato Gaussian Splat.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas mas alla del ajuste sobre TripoSplat.

## Capacidades

- Generacion 3D a partir de una sola imagen (image-to-3D) con salida en formato Gaussian Splat.
- Integracion nativa con ComfyUI mediante workflow de plantilla (Idol: Image to Gaussian Splat).
- Uso de un encoder de vision DINOv3 ViT-H para la codificacion de la imagen de entrada.
- Decodificacion a representacion 3D mediante un decoder dedicado y el VAE de Flux2.
- Compatibilidad con los workflows existentes de TripoSplat.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni multilingues, por tratarse de un modelo de difusion para 3D.

## Casos de uso

- Prototipado rapido de assets 3D en ComfyUI: el modelo convierte una imagen de referencia en un Gaussian Splat utilizable para previsualizacion, aprovechando el workflow de plantilla incluido y los pesos ya empaquetados.
- Generacion de assets para videojuegos y entornos interactivos: a partir de una foto o render de un objeto se obtiene una representacion 3D que puede servir como base para retopologia o como asset de fondo.
- Reconstruccion 3D para comercio electronico: generar vistas 3D de productos a partir de fotografias, facilitando visores interactivos en tiendas online.
- Creacion de contenido para realidad aumentada y virtual: producir splats 3D para escenas AR/VR a partir de imagenes capturadas con movil o camara.
- Flujos de escaneo y digitalizacion ligera: obtener una aproximacion 3D de objetos fisicos a partir de una unica fotografia, sin necesidad de escaneo multi-vista.
- Integracion en pipelines de generacion de contenido con ComfyUI: encadenar el modelo con otros nodos de ComfyUI (por ejemplo, generacion de imagen previa) para automatizar la produccion de assets 3D.
- Investigacion en reconstruccion 3D monocular: servir como punto de partida o baseline ajustable sobre TripoSplat para experimentos de image-to-3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 3.3 GB, lo que da una orientacion del orden de magnitud de los pesos, pero no se documenta el pico de VRAM durante la inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de un pipeline de difusion con encoder ViT-H y VAE Flux2, es probable que requiera GPU con VRAM moderada-alta, pero no se aportan cifras oficiales.
- Opciones de despliegue: ComfyUI (flujo previsto por el autor del reempaquetado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol (Comfy-Org) | Difusion image-to-3D (fine-tune de TripoSplat) | no disponible | no aplica | apache-2.0 | Hugging Face (Comfy-Org/Idol) |
| TripoSplat (speridlabs) | Difusion image-to-3D (modelo base) | no disponible | no aplica | no disponible en la informacion | Hugging Face (speridlabs/idol como base declarada) |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La informacion publica es escasa: no se documentan parametros, datos de entrenamiento ni evaluacion, lo que dificulta estimar calidad y robustez.
- Al ser un fine-tune de TripoSplat, hereda las limitaciones del modelo base, que no se detallan en la model card.
- Calidad de reconstruccion dependiente de una unica imagen: no se documenta el comportamiento ante oclusiones, iluminacion adversa o vistas no canonicas.
- No se especifican sesgos conocidos ni riesgos de alucinacion geometrica; en modelos image-to-3D es habitual la generacion de geometria plausible pero incorrecta en zonas no visibles.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base speridlabs/idol y de los componentes auxiliares (DINOv3, VAE Flux2) antes de produccion.
- El modelo esta empaquetado para ComfyUI; su uso fuera de ese entorno requiere adaptar los pesos y el pipeline manualmente.
- No se documentan requisitos minimos de hardware ni latencias, lo que complica la planificacion de despliegues en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Idol
- Modelo original (base): https://huggingface.co/speridlabs/idol
- Workflow de ComfyUI (image to Gaussian Splat): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_idol_image_to_gaussian_splat.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
