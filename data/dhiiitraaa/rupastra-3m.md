# dhiiitraaa/rupastra-3M

## Resumen

RUPASTRA Text-to-Image 3M es un modelo generativo de texto a imagen de tipo autoregresivo y muy ligero, desarrollado por el usuario dhiiitraaa y publicado en Hugging Face bajo licencia Apache 2.0. Con tan solo 3.273.488 parámetros únicos, el modelo se entrena desde cero para producir imágenes de pixel art de 64×64 píxeles a partir de descripciones textuales breves en inglés. No es un modelo de difusión, sino un transformer autoregresivo que genera secuencias de tokens latentes y las decodifica mediante un VQ-VAE.

El modelo emplea una arquitectura personalizada denominada `RupastraFastForConditionalGeneration`, que combina Grouped Query Dual-Attention (GQDA), embeddings rotatorios multimodales 2D (RoPE-2D), embeddings factorizados de bajo rango (r=64) con weight tying, caché KV estática y muestreo Gumbel-Max fusionado. El backbone consta de 6 capas con d_model=192, 6 cabezas Q y 2 cabezas KV, y una FFN SwiGLU de dimensión 512.

Su relevancia radica en su extrema eficiencia: es un modelo de investigación que demuestra que es posible generar imágenes coherentes en dominios muy restringidos (personajes estilo Nouns) con una fracción mínima de los parámetros de los modelos de difusión convencionales, y con latencias de inferencia del orden de 0,18–0,31 segundos por imagen en una GPU T4. Está pensado para experimentación, no para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RupastraFastForConditionalGeneration` (transformer autoregresivo custom con GQDA) |
| Parametros totales | 3.273.488 (~3,27 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens de texto + 96 tokens de imagen (32 texto + 64 patch tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True` para arquitectura custom) |

Otros datos técnicos: backbone de 6 capas, d_model=192, 6 cabezas Q / 2 cabezas KV, ffn_dim=512 (SwiGLU), rank de embedding factorizado r=64 con weight tying, grid_size=16 (256 tokens latentes → 8×8 = 64 patches de 2×2, total 96 tokens), tokenizer BPE custom con max_len=32, decoder de imagen VQ-VAE `CompVis/ldm-super-resolution-4x-openimages` (subfolder="vqvae"), resolución de salida 64×64 RGB (upscale NEAREST a 512×512), dataset `m1guelpf/nouns` con 49.859 muestras.

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo entrenado desde cero, no un modelo de difusión. La generación se plantea como una secuencia de tokens: primero 32 tokens de texto y después 64 tokens de imagen que representan patches de 2×2 píxeles sobre una rejilla de 16×16. La arquitectura incorpora varias innovaciones de eficiencia: Grouped Query Dual-Attention (GQDA), que reduce el número de cabezas KV frente a las cabezas Q (6 vs 2); RoPE-2D, que codifica posiciones espaciales bidimensionales para los tokens de imagen; embeddings factorizados de bajo rango (r=64) con weight tying entre la entrada y la cabeza de salida, lo que reduce drásticamente el número de parámetros; caché KV estática para acelerar la decodificación; y muestreo Gumbel-Max fusionado para agilizar tanto el entrenamiento como la inferencia.

El entrenamiento se realizó exclusivamente sobre el dataset `m1guelpf/nouns` (49.859 muestras), un conjunto de personajes de pixel art estilo Nouns con atributos como cuerpo, accesorios y colores. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no los menciona. La decodificación de los tokens latentes a píxeles se realiza con un VQ-VAE preentrenado de CompVis, lo que implica que la calidad de la imagen final depende en parte de ese decoder externo.

## Capacidades

- Generación de imágenes de pixel art de 64×64 píxeles a partir de prompts de texto breves en inglés.
- Generación condicionada por atributos: la model card muestra ejemplos de personajes con cuerpo de color y accesorio (gato rojo, robot azul, corona amarilla, pizza morada), lo que sugiere control sobre objeto y color.
- Generación autoregresiva con caché KV estática, lo que permite decodificación secuencial rápida.
- Upscaling de la salida de 64×64 a 512×512 mediante interpolación NEAREST (no es superresolución aprendida, sino escalado de píxeles).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni otras modalidades (audio, vídeo).
- Capacidad multilingüe: no disponible; el modelo solo declara inglés y su tokenizer BPE está entrenado con max_len=32.
- No dispone de modo "thinking" ni de capacidades de visión de entrada.

## Casos de uso

- Generación de avatares de pixel art para comunidades NFT o proyectos estilo Nouns: el modelo produce personajes de 64×64 con control de accesorio y color, adecuado para generar variaciones masivas de avatares dentro de ese dominio visual concreto.
- Prototipado rápido de sprites para videojuegos indie: con latencias de 0,18–0,31 s por imagen en T4, se pueden generar cientos de sprites candidatos en segundos para luego seleccionar y retocar manualmente.
- Pruebas de concepto en investigación sobre modelos autoregresivos de imagen: su tamaño de 3,27 M parámetros permite entrenar y evaluar variantes arquitectónicas (GQDA, RoPE-2D, embeddings factorizados) en hardware modesto.
- Generación de datasets sintéticos de pixel art para aumentar corpus de entrenamiento de clasificadores o detectores en dominios de arte digital.
- Educación y divulgación: es un ejemplo didáctico de pipeline completo texto→tokens→VQ-VAE con un coste computacional mínimo, útil para explicar generación autoregresiva de imágenes.
- Decoración procedural de contenido web o demos: generar iconos o miniaturas de estilo pixel art bajo demanda con un modelo que cabe en cualquier GPU consumer.
- No es adecuado para generación fotorrealista, imágenes de alta resolución nativa ni prompts complejos fuera del dominio Nouns.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una métrica de latencia: aproximadamente 0,18–0,31 segundos por imagen en una GPU T4. No se proporcionan FID, IS, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos del modelo (3,27 M parámetros en fp32 ≈ 13 MB); el consumo real vendrá dominado por el VQ-VAE decoder de CompVis y el tokenizer, pero en conjunto es muy reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la model card cita explícitamente una T4 como referencia de latencia.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso potencialmente en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, seguido de `model.tie_weights()` y `model.rebuild_buffers()`; la generación se realiza con `generate_image_tokens()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura custom es improbable que funcionen sin adaptación.
- Latencia y throughput: ~0,18–0,31 s/imagen en T4 según el autor; el throughput escalaría linealmente con el número de GPUs, aunque no se aportan cifras de batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUPASTRA 3M | 3,27 M | 32 tokens texto + 96 imagen | 64×64 (upscale a 512×512) | Apache 2.0 | Hugging Face |
| Stable Diffusion 1.5 | ~860 M (UNet) | 77 tokens texto | 512×512 | CreativeML OpenRAIL-M | Hugging Face |
| PixArt-α | ~600 M | 120 tokens texto | 512×512 | OpenRAIL++ | Hugging Face |
| DALL·E mini (Craiyon) | ~1,7 B (VQGAN+transformer) | 64 tokens texto | 256×256 | Apache 2.0 / MIT | Hugging Face |

La comparación es orientativa: RUPASTRA está especializado en un dominio visual muy estrecho (pixel art Nouns) y su calidad no es comparable a la de modelos de difusión generalistas. Su ventaja es el tamaño (dos órdenes de magnitud menor) y la latencia; su desventaja es la falta de generalidad y la resolución nativa baja. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Dominio extremadamente restringido: entrenado solo con `m1guelpf/nouns`, por lo que fuera de personajes pixel art estilo Nouns la calidad será muy baja o nula.
- Resolución nativa de 64×64; el upscale a 512×512 es NEAREST (no aprendido) y no añade detalle real.
- Longitud de prompt máxima de 32 tokens; prompts más largos se truncarán.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación visual: al ser autoregresivo sobre tokens discretos, puede generar combinaciones de atributos incoherentes o patrones repetitivos.
- Sesgos: el dataset Nouns tiene un estilo visual y una distribución de atributos muy concreta; el modelo reproducirá esos sesgos y no generalizará a otros estilos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y el dominio limitado hacen que no sea apto para productos generalistas sin un post-procesado o fine-tuning adicional.
- No hay métricas de calidad publicadas (FID, CLIP score); no se puede evaluar objetivamente su rendimiento frente a alternativas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-22; es un modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/dhiiitraaa/rupastra-3M
- Dataset de entrenamiento: https://huggingface.co/datasets/m1guelpf/nouns
- VQ-VAE decoder: https://huggingface.co/CompVis/ldm-super-resolution-4x-openimages
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
