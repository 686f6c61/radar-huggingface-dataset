# ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7

## Resumen

10Eros-Max-Transformer_8stepTURBO_beta7 es un transformador de difusión para generación de vídeo (text-to-video e image-to-video) publicado por el usuario ibyteohdear en Hugging Face. No se trata de un modelo entrenado desde cero: es una conversión de layout, sin entrenamiento, fusión, requantización ni re-poda, del checkpoint `TenStrip/10Eros-Max/10Eros_Max_h3_8stepTURBO_beta7.safetensors`, que a su vez es un finetune de MiniMax-H3 (MiniMaxAI/MiniMax-H3). El resultado es un componente `MiniMaxH3PrunedTransformer3DModel` compatible con la librería diffusers.

El valor del repositorio está en la ingeniería de conversión: el checkpoint original ya está podado en AdaLN (rank 8, con tabla de curvas y proyecciones AdaLN plegadas de 8 canales), y la conversión remapea claves y layouts (QKV concatenado a proyecciones separadas, gate/value del MLP reordenados, tablas AdaLN subidas a float32) manteniendo la compatibilidad con LoRAs entrenados contra el AdaLN de 2688 de ancho del release original.

El modelo usa un esquema "8-step TURBO" (destilación a 8 pasos de muestreo) y requiere `trust_remote_code=True`, ya que incluye código personalizado. Con 20.111 millones de parámetros (~20,1 B) y 40,2 GB de pesos, está dirigido a usuarios avanzados de generación de vídeo que ya trabajan con el ecosistema MiniMax-H3. Cabe destacar que el repositorio está etiquetado como `not-for-all-audiences`, lo que sugiere contenido para adultos, y su difusión es muy reducida (48 descargas y 2 likes en el momento de redactar la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión con AdaLN podado (rank 8), componente `MiniMaxH3PrunedTransformer3DModel` |
| Parametros totales | 20.111.462.920 (~20,1 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del repo no están cuantizados; el código de ejemplo muestra cuantización Int8 weight-only vía torchao como opción de despliegue) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (licencia "other" de comunidad de MiniMax-H3, más términos LTX 2.3 / Wan 2.2 / Krea 2 para personaje heredados del graft de origen) |
| Formato de pesos | safetensors (repo de 40,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer 3D de difusión derivado de MiniMax-H3, con una particularidad técnica central: poda AdaLN (Adaptive LayerNorm) de rank 8. El checkpoint original incorpora una tabla de curvas (`adaln_t_table`) y proyecciones AdaLN plegadas de 8 canales de ancho, con el término constante del plegado almacenado en `adaln_proj.linear.bias`. La conversión a diffusers no realiza ningún plegado adicional, solo un remapeo de claves y layout: `qkv_proj` (Q|K|V concatenados) se separa en `attn.to_q`/`to_k`/`to_v`; el MLP nativo `[gate; value]` en `fc1` se reordena a `ff.net.0.proj` como `[value; gate]` (formato que diffusers espera); las tablas AdaLN y `adaln_t_table` se convierten a float32 (el origen las almacena en BF16); y `rope.inv_freq` se descarta por ser un buffer no persistente que se reconstruye en `__init__`.

Un detalle crítico de compatibilidad: los tensores `adaln_basis` y `adaln_mean` se copian del repositorio `multimodalart/MiniMax-H3-Pruned` (`transformer/adaln_affine.safetensors`) en lugar de recalcularse, porque la base solo está definida salvo signo y rotación, y recalcularla rompería la compatibilidad con LoRAs. Esto permite que los LoRAs entrenados contra el AdaLN de 2688 de ancho del release original proyecten correctamente sobre estas coordenadas. La conversión ha sido verificada: las 637 claves del state-dict coinciden en nombre y forma con la clase. No hay información sobre el proceso de entrenamiento del finetune original (tokens, dataset, RLHF/DPO): no disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el pipeline de diffusers de MiniMax-H3.
- Generación de vídeo a partir de imagen y texto (image-text-to-video) e image-to-video, según el pipeline tag del repositorio.
- Muestreo acelerado en 8 pasos ("8-step TURBO"), con configuraciones de referencia Euler/Simple o er_sde/SGM_uniform.
- Compatibilidad con LoRAs entrenados contra el AdaLN de 2688 de ancho del release original de 10Eros-Max.
- Integración con el ecosistema MiniMax-H3: usa el codificador de texto y los VAE (incluido un VAE de audio, `AutoencoderKLMiniMaxH3Audio`) del pipeline oficial.
- Soporte de cuantización opcional Int8 weight-only mediante torchao para reducir requisitos de memoria.
- Posible proyección de embeddings CLIP mediante los componentes ClipProj de `NicoLab28/ClipProj-MiniMax-H3` (según el código de ejemplo incluido).
- Uso de Qwen3-VL como componente auxiliar en el script de ejemplo (posiblemente para comprensión de imagen o captioning; el rol exacto no está documentado).

## Casos de uso

- Generación de vídeo estilizado a partir de prompts de texto: el transformador se integra en el pipeline modular de MiniMax-H3 en diffusers para producir vídeo en 8 pasos de denoising, adecuado para flujos iterativos de creación donde la velocidad por muestra importa.
- Animación de imágenes estáticas (image-to-video): partiendo de un fotograma inicial y un prompt, el modelo genera la transición a vídeo, útil para motion design y animación de ilustraciones.
- Producción de vídeo con LoRAs personalizados: al preservar las coordenadas AdaLN del release original, los creadores que ya tienen LoRAs de 10Eros-Max pueden cargarlos directamente sobre este transformador sin reentrenar.
- Despliegue en Spaces o demos con GPU limitada: el script de ejemplo incluye soporte para Zero GPU de Hugging Face (decorador `spaces.GPU`) y cuantización Int8 weight-only, lo que facilita demos interactivas con Gradio.
- Integración en pipelines modulares de diffusers: el repo proporciona los pasos modulares (`MiniMaxH3PrepareLatentsStep`, `MiniMaxH3DenoiseStep`, etc.) para construir pipelines personalizados de generación de vídeo con control fino sobre latentes, timesteps y decodificación.
- Experimentación con generación de vídeo con audio: el código de ejemplo importa `AutoencoderKLMiniMaxH3Audio`, lo que sugiere soporte del pipeline base para modalidades con pista de audio (el alcance exacto en este checkpoint no está documentado).
- Investigación en poda de modelos de difusión: al ser una conversión limpia y verificada de un checkpoint podado en AdaLN rank 8, sirve como referencia práctica de cómo convertir y desplegar transformers de difusión podados en diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de VBench, FVD ni metricas de calidad de vídeo para este checkpoint. La unica indicacion de rendimiento es cualitativa: el esquema 8-step TURBO reduce el muestreo a 8 pasos, frente a los tipicos 20-50 pasos de un modelo de difusion sin destilar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos ocupan 40,2 GB en el repo (20,1 B de parametros, coherente con BF16, ~40 GB), por lo que en BF16 sin cuantizar se necesita una GPU con al menos 48 GB de VRAM solo para el transformer, mas el codificador de texto y los VAE. Con cuantizacion Int8 weight-only (torchao, segun el codigo de ejemplo) el transformer podria reducirse a ~20 GB, mas los componentes auxiliares.
- GPU recomendadas: A100 80 GB o H100 para BF16 completo; A100 40 GB, H100 o L40S con cuantizacion Int8 weight-only. Viabilidad en GPU de consumo: no disponible; en principio una RTX 4090 (24 GB) no bastaria para el transformer completo en BF16 y quedaria muy justa incluso cuantizado al sumar text encoder y VAEs.
- Cabe destacar que el modelo no es un LLM standalone: requiere cargar ademas el text encoder y los VAEs del pipeline MiniMax-H3, lo que anade VRAM adicional.
- Opciones de despliegue: diffusers (via `AutoModel.from_pretrained` con `trust_remote_code=True`, usando la version de diffusers incluida en el propio repo), pipelines modulares de diffusers para MiniMax-H3, y demos Gradio en Hugging Face Spaces (incluido soporte Zero GPU con duracion de 1500 s). No hay soporte documentado de llama.cpp, Ollama, vLLM o TGI (no aplicable: es un modelo de difusion, no un LLM).
- Latencia y throughput: no disponible; como referencia cualitativa, el muestreo en 8 pasos reduce proporcionalmente el numero de evaluaciones del transformer por video generado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_8stepTURBO_beta7 | ~20,1 B | text/image-to-video, 8 pasos | safetensors (diffusers) | MiniMax-H3 community + terminos LTX 2.3 / Wan 2.2 / Krea 2 | Finetune podado en AdaLN rank 8, contenido para adultos, codigo personalizado |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | text/image-to-video | safetensors | MiniMax-H3 community license | Modelo base oficial con pipeline completo en diffusers |
| multimodalart/MiniMax-H3-Pruned | no disponible | text/image-to-video | safetensors | no disponible | Version podada de referencia; origen de los tensores `adaln_basis`/`adaln_mean` usados aqui |
| Wan 2.2 (Alibaba) | no disponible | text/image-to-video | safetensors | Apache 2.0 / terminos propios segun release | Alternativa open source de generacion de video; sus terminos se heredan parcialmente en este repo via graft |

La comparacion cuantitativa (rendimiento, calidad de video) no esta disponible: no hay benchmarks publicados para ninguno de estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta etiquetado como `not-for-all-audiences`, por lo que su uso esta restringido a publicos adultos y puede incumplir las politicas de algunas plataformas o jurisdicciones.
- Licencia restrictiva y compuesta: ademas de la licencia comunitaria de MiniMax-H3, hereda los terminos de LTX 2.3, Wan 2.2 y Krea 2 para personaje transferidos por el graft de origen. Es imprescindible revisar los tres conjuntos de terminos antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`: el modelo incluye codigo personalizado (`custom_code`), lo que supone un riesgo de seguridad si no se revisa el codigo remoto antes de ejecutarlo.
- Requiere una version concreta de diffusers: el README indica que hay que usar la libreria diffusers incluida en el propio repositorio, no la version estable de PyPI, lo que complica la integracion en entornos existentes.
- Proyecto comunitario de muy baja adopcion (48 descargas, 2 likes) y en fase beta (beta7): sin auditoria, sin benchmarks publicados y sin garantia de mantenimiento.
- Compatibilidad con LoRA condicionada a coordenadas: los tensores AdaLN se copian (no se recalculan) para preservar compatibilidad; usar bases AdaLN de otra fuente romperia la proyeccion de los LoRAs existentes.
- Riesgo de alucinacion visual, sesgos del dataset de entrenamiento y limitaciones de idioma del text encoder: no disponibles, no documentados para este checkpoint.
- El modelo no funciona de forma aislada: depende del text encoder, los VAEs y los componentes ClipProj de repositorios de terceros (`NicoLab28/ClipProj-MiniMax-H3`), cuya disponibilidad futura no esta garantizada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint original de una sola pieza: https://huggingface.co/TenStrip/10Eros-Max
- Version podada de referencia (fuente de `adaln_affine.safetensors`): https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Componentes ClipProj usados en el ejemplo: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Paper, blog oficial o demo alojada: no disponibles en la informacion proporcionada.
