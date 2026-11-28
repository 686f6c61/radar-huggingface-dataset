# chatpig/idol-gguf

## Resumen

Idol es un modelo de generación de mallas 3D (image-to-3D) desarrollado por speridlabs, distribuido aquí en formato GGUF por el usuario chatpig bajo el identificador `chatpig/idol-gguf`. A diferencia de los modelos de lenguaje, Idol toma una imagen de referencia y produce un fichero de malla tridimensional (`.glb`) mediante un pipeline que combina un modelo principal, un decodificador de malla, un VAE y un codificador de visión (CLIP Vision basado en DINOv3 ViT-H). El repositorio cuantizado ocupa 4,2 GB y declara 220.697.543 parámetros en pesos safetensors.

La relevancia de esta ficha radica en que se trata de una cuantización GGUF de un modelo generativo 3D, un caso poco habitual frente al ecosistema dominante de LLM cuantizados. El autor publica comandos de ejemplo para la herramienta `ggk`, incluyendo soporte de LoRA de destilación (5 pasos) y eliminación de fondo con BiRefNet, lo que sugiere un enfoque orientado a inferencia local eficiente.

No obstante, la información disponible es muy limitada: la model card no documenta arquitectura interna, datos de entrenamiento, benchmarks ni idiomas. Varios campos de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo image-to-3D; pipeline con decodificador de malla, VAE y CLIP Vision DINOv3 ViT-H) |
| Parámetros totales | 220.697.543 (pesos safetensors del modelo base) |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; se referencian ficheros q8_0 y f16 en los ejemplos (idol-q8_0.gguf, idol_decoder-q8_0.gguf, pig_flux2_vae_fp32-f16.gguf, dino_v3_vit_h-q8_0.gguf, birefnet-f16.gguf, idol_turbo_lora_v5-f16.gguf) |
| Idiomas soportados | no disponible (modelo de imagen a malla 3D, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo `chatpig/idol-gguf`); modelo base en safetensors según metadatos |

## Arquitectura y entrenamiento

No se dispone de documentación sobre la arquitectura interna del modelo base `speridlabs/idol`. Por los comandos de la model card se deduce un pipeline multi-componente: un modelo principal (`idol`), un decodificador de malla separado (`idol_decoder`), un VAE (`pig_flux2_vae`, en fp32-f16) y un codificador de visión CLIP basado en DINOv3 ViT-H. La generación se condiciona mediante una imagen de referencia (`--ref-image`) y produce una malla `.glb` como salida. Se menciona además un LoRA de destilación (`idol_turbo_lora_v5`) que permite reducir la inferencia a 5 pasos con `cfg-scale 1`.

No hay información sobre el número de tokens, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El único dato técnico adicional es la existencia de un modo opcional de eliminación de fondo con BiRefNet (`--mesh-background-model`) y un "magnet approach" que aplica automáticamente los clips presentes en el mismo directorio.

## Capacidades

- Generación de mallas 3D a partir de una imagen de referencia, con salida en formato `.glb`.
- Pipeline modular con decodificador de malla independiente y VAE para la representación latente.
- Condicionamiento visual mediante CLIP Vision (DINOv3 ViT-H).
- Eliminación automática de fondo de la imagen de entrada mediante BiRefNet (opcional).
- Inferencia acelerada mediante LoRA de destilación en 5 pasos con `cfg-scale 1`.
- Carga automática de clips auxiliares desde el directorio de trabajo ("magnet approach").
- No se documentan capacidades de texto, razonamiento, código, tool calling, agentes ni multilingüismo, al no ser un modelo lingüístico.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de una imagen conceptual (por ejemplo, un personaje o un objeto), el modelo genera una malla `.glb` que puede importarse directamente en motores como Unity o Unreal para iterar sobre el diseño.
- Escaneo y reconstrucción de objetos para impresión 3D: con una fotografía del objeto y el modo BiRefNet para aislar el sujeto, se obtiene una malla lista para laminado, útil en flujos de trabajo de fabricación digital.
- Catalogación de producto en comercio electrónico: generar modelos 3D a partir de fotografías de catálogo permite ofrecer vistas interactivas en tienda online sin sesiones de fotogrametría dedicadas.
- Generación de contenido para realidad aumentada: las mallas `.glb` son compatibles con visores WebXR y motores AR, de modo que el modelo sirve para poblar experiencias AR con assets derivados de imágenes existentes.
- Iteración de diseño industrial: el uso de LoRA de 5 pasos y `cfg-scale 1` reduce el coste por muestra, lo que permite generar múltiples variantes de una misma referencia en ciclos cortos de exploración de formas.
- Automatización de pipelines de contenido 3D: la invocación por línea de comandos (`ggk -m ... --ref-image ... -o out.glb`) facilita la integración en scripts de CI o en procesos batch que conviertan lotes de imágenes en mallas.
- Docencia y divulgación en gráficos por computador: el pipeline completo (modelo, decodificador, VAE, CLIP Vision) sirve como ejemplo práctico de generación 3D condicionada por imagen en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio GGUF ocupa 4,2 GB; con cuantización q8_0 y los componentes auxiliares (decodificador q8_0, VAE fp32-f16, DINOv3 ViT-H q8_0, BiRefNet f16) el consumo agregado probablemente supera los 4,2 GB, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. No se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repo (4,2 GB) sugiere que podría caber en GPUs con 8-12 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: la model card utiliza la herramienta `ggk` (ejecutable de línea de comandos) con parámetros `-m`, `--mesh-decoder`, `--vae`, `--clip_vision`, `--ref-image`, `--adapter`, `--steps`, `--cfg-scale` y `-o`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de generación 3D.
- Latencia y throughput: no disponibles. Solo se indica que el LoRA turbo permite 5 pasos con `cfg-scale 1`, lo que reduce el coste computacional frente a una configuración estándar, pero sin cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación image-to-3D ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al ser un modelo entrenado con datos visuales no especificados, puede reproducir sesgos presentes en su dataset de entrenamiento.
- Riesgo de alucinación geométrica: al generar mallas a partir de una sola imagen, el modelo debe inferir la geometría no visible, lo que puede producir formas plausibles pero incorrectas.
- No hay información sobre el número de idiomas ni sobre capacidades lingüísticas; no debe emplearse como modelo de texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar las licencias de los componentes auxiliares (VAE `pig_flux2_vae`, CLIP Vision DINOv3, BiRefNet, LoRA turbo) que no se detallan en la información disponible.
- La documentación es escasa: no se especifican arquitectura, datos de entrenamiento, benchmarks ni requisitos de hardware, lo que dificulta evaluar su idoneidad en producción.
- El modelo base referenciado (`speridlabs/idol`) no aparece documentado en la información proporcionada; la ficha se basa únicamente en la cuantización GGUF de chatpig.
- El pipeline requiere múltiples ficheros (modelo, decodificador, VAE, CLIP Vision) y una herramienta específica (`ggk`), lo que añade complejidad operativa frente a modelos monolíticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chatpig/idol-gguf
- Modelo base: https://huggingface.co/speridlabs/idol
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
