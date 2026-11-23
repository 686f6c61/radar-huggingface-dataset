# bahae98/phantom-wan-mlx

## Resumen

phantom-wan-mlx es un port a Apple MLX de Phantom-Wan (Phantom-video/Phantom, ByteDance, ICCV 2025), un modelo de generacion de video condicionado por multiples sujetos (subject-to-video, S2V) que permite componer hasta cuatro personajes distintos en un mismo plano a partir de imagenes de referencia. El autor del port es bahae98 y el artefacto publicado es un repositorio de pesos autocontenido bajo la ruta `dist/Phantom-Wan-1.3B-MLX/`. La relevancia actual reside en que traslada un pipeline de difusion de video de gran tamano a silicio de Apple sin reentrenar el modelo base.

Tecnicamente no se trata de un modelo nuevo, sino de una reimplementacion de inferencia. La red DiT es la stock Wan2.1-T2V-1.3B (dim 1536, FFN 8960, 12 cabezas, 30 capas, patch (1,2,2), VAE de 16 canales con stride 4/8/8 y encoder de texto umT5-XXL), mientras que la aportacion de Phantom se limita a la ensambladura de entradas y a un bucle CFG personalizado. El artefacto incluye pesos en bf16 e int4 del DiT, el VAE de Wan2.1 y el encoder umT5-XXL.

La licencia declarada es Apache-2.0, heredada del trabajo original de ByteDance y del sustrato Wan2.1 de Wan-AI. El estado del proyecto es funcional de extremo a extremo para la variante de 1.3B; existe configuracion para la variante de 14B pero no se ha exportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) sobre sustrato Wan2.1-T2V-1.3B, con VAE 3D de 16 canales y encoder de texto umT5-XXL |
| Parametros totales | 1.3B (variante v1); configuracion de 14B presente pero no exportada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de video: 81 frames por defecto; el decode completo agota memoria por encima de ~49 frames) |
| Tipos de cuantizacion | bf16 e int4 (group-size 64, coseno 0.99633 frente a bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformer-bf16, transformer-4bit, vae-encoder, vae-decoder, t5_encoder) y `.pth` originales de Phantom/Wan2.1 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusion transformer de Wan2.1-T2V-1.3B: 30 capas, dimension 1536, FFN de 8960, 12 cabezas de atencion, patchificacion (1,2,2) y atencion cruzada solo de texto (sin CLIP). El VAE es de 16 canales con strides 4/8/8 y el encoder de texto es umT5-XXL. La innovacion de Phantom no toca el forward del DiT, que se mantiene identico al stock de Wan2.1; se limita a la construccion de la entrada y al bucle de muestreo.

El mecanismo de inyeccion de referencias (G1) consta de cuatro piezas: (1) codificacion de cada imagen de referencia con redimensionado LANCZOS preservando aspecto, padding blanco y normalizacion a [-1,1], seguida de VAE-encode a un unico frame latente; (2) concatenacion temporal de los K frames de referencia en la cola del latente objetivo, con posiciones 3D-RoPE de cola ordinarias (sin SA-3D) y re-clamp de las referencias limpias en cada paso; (3) CFG encadenado a doble escala con 3 forwards del DiT por paso (`neg(zero refs,∅) + w_img·(refs,∅ − neg) + w_text·(refs,text − refs,∅)`, con `guide_img=5.0` y `guide_text=7.5` por defecto), scheduler FlowUniPC con shift 5.0 y 50 pasos; (4) decodificacion VAE en streaming sin perdida por chunks temporales, que mantiene el pico de memoria plano y permite decodificar 81 frames donde el decode de secuencia completa agota memoria. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO.

## Capacidades

- Generacion de video condicionada por multiples sujetos (S2V): composicion de hasta 4 personajes distintos en un mismo plano a partir de imagenes de referencia.
- Generacion de video texto-a-video heredada del sustrato Wan2.1-T2V.
- Resolucion de salida configurable (por defecto 832x480) y numero de frames configurable (por defecto 81).
- Control fino del muestreo: pasos, shift del scheduler, pesos de guia de imagen y de texto, y semilla.
- Escape hatch de embeddings: `encode_prompt(...)` permite precalcular embeddings de umT5 en Python y pasarlos como `precomputed_context`, evitando cargar el encoder de 11 GB en tiempo de ejecucion.
- Decodificacion VAE en streaming sin perdida con memoria plana, necesaria para secuencias largas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Composicion de personajes en produccion audiovisual: dados dos o cuatro retratos de referencia, el pipeline `s2v(prompt, reference_images, ...)` genera un plano donde los sujetos aparecen juntos en una escena descrita por el prompt; util para previsualizacion de storyboards sin rodaje.
- Prototipado de video generativo en Mac: desarrolladores con Apple Silicon pueden ejecutar el pipeline completo de forma nativa sin GPU NVIDIA, gracias al port a MLX y al artefacto int4 de ~0.98 GB del DiT.
- Iteracion rapida de prompts: la API expone `steps`, `shift`, `guide_img` y `guide_text`, lo que permite barrer configuraciones de guia para ajustar la fidelidad a las referencias frente a la adherencia al texto.
- Investigacion sobre inyeccion de referencias: el repositorio documenta la especificacion bloqueada en `_research/G1_INJECTION.md` e implementa el mecanismo en `model/reference.py` y `sampling.py`, lo que facilita experimentar con variantes de concatenacion temporal y posiciones RoPE.
- Integracion en pipelines Swift: el escape hatch `precomputed_context` permite codificar prompts con umT5 en Python y consumir solo los embeddings desde una aplicacion Swift, reduciendo el peso en runtime al evitar el encoder de 11 GB.
- Generacion de clips largos con memoria acotada: el decode en streaming por chunks temporales hace viable producir 81 frames en equipos donde el decode completo agota memoria por encima de ~49 frames.
- Validacion de artefactos cuantizados: el script `gen_int4_demo.py` permite comprobar de extremo a extremo que el artefacto int4 publicado mantiene fidelidad (coseno 0.99633 frente a bf16) antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de calidad es la similitud coseno del DiT int4 frente a bf16: 0.99633.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El artefacto incluye DiT bf16 (~2.84 GB), DiT int4 (~0.98 GB), VAE encoder/decoder bf16 y encoder umT5-XXL bf16 (~11 GB), por lo que el pico de memoria depende de si se carga el encoder de texto o se usa `precomputed_context`.
- GPU recomendadas: Apple Silicon (el port es nativo de MLX); no se documentan requisitos para GPU NVIDIA, A100, H100 ni RTX 4090 en la informacion disponible.
- Compatibilidad con GPU de consumo: el artefacto int4 (~0.98 GB del DiT) esta pensado para reducir requisitos en Apple Silicon; no se confirma compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: instalacion editable con `pip install -e .`; el pipeline se invoca desde Python mediante `phantom_wan_mlx.pipeline_mlx.s2v`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de video).
- Latencia y throughput: no disponible. Los valores por defecto son 50 pasos con 3 forwards del DiT por paso (150 forwards en total) y decodificacion VAE en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phantom-wan-mlx (este) | 1.3B | 81 frames por defecto, 832x480 | Apache-2.0 | Hugging Face (bahae98), repo de 0.0 GB en la ficha | Port MLX de Phantom-Wan; bf16 e int4 |
| Phantom-Wan (ByteDance, original) | 1.3B y 14B | no disponible | Apache-2.0 | `bytedance-research/Phantom` en Hugging Face, commit `926cb19b…` | Implementacion de referencia en PyTorch/diffusers |
| Wan2.1-T2V-1.3B (Wan-AI) | 1.3B | no disponible | no disponible en la informacion | `Wan-AI/Wan2.1-T2V-1.3B`, commit `37ec5126…` | Sustrato T2V sin condicionamiento por sujetos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio figura con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-23), y el tamano reportado es 0.0 GB pese a que la model card describe pesos de varios GB; conviene verificar la integridad del artefacto antes de confiar en el.
- La variante de 14B esta configurada pero no exportada; solo la de 1.3B es funcional de extremo a extremo.
- El decode de secuencia completa agota memoria por encima de ~49 frames; es obligatorio usar el decode en streaming para secuencias de 81 frames.
- Cargar el encoder umT5-XXL en runtime anade ~11 GB de peso; en entornos ajustados debe usarse `precomputed_context`.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo original.
- No hay informacion sobre el dataset de entrenamiento ni sobre filtrado de datos, lo que impide evaluar riesgos de contenido.
- La licencia Apache-2.0 se hereda de Phantom-Wan y Wan2.1; deben respetarse los avisos de `NOTICE` de los proyectos upstream.
- El proyecto depende de `mlx-video` y del ecosistema MLX; no es portable a CUDA sin reescritura.
- No se documentan garantias de calidad de video ni metricas FVD, CLIP score u otras.

## Enlaces

- Hugging Face: https://huggingface.co/bahae98/phantom-wan-mlx
- Repositorio upstream de Phantom: https://github.com/Phantom-video/Phantom
- Checkpoint Phantom en Hugging Face: https://huggingface.co/bytedance-research/Phantom
- Sustrato Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Especificacion de inyeccion de referencias: `_research/G1_INJECTION.md` (dentro del repositorio)
- Documentacion de checkpoints: `_research/G3_CHECKPOINT.md` (dentro del repositorio)
