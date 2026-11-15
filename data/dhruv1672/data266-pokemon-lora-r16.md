# dhruv1672/data266-pokemon-lora-r16

## Resumen

El modelo `dhruv1672/data266-pokemon-lora-r16` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el UNet de Stable Diffusion 1.5 para la generación de imágenes de criaturas cartoon con estética Pokémon. Lo desarrolla Dhruv Patel con asistencia de Mana AI en el contexto del laboratorio DATA266 de la Universidad Estatal de San José (SJSU), equipo Team28. No es un modelo completo de difusión, sino un conjunto de pesos de bajo rango que se cargan sobre el checkpoint base `stable-diffusion-v1-5` (revisión `451f4fe16113bff5a5d2269ed5ad43b0592e9a14`) mediante la librería `diffusers`.

El adaptador se entrena sobre el dataset `reach-vb/pokemon-blip-captions` (revisión `3790f29981f74ca26bf11662048342e19c5b615e`), que contiene 833 imágenes legibles con captions generados por BLIP. El objetivo del trabajo es comparar dos configuraciones de rango (4 y 16) bajo idéntico presupuesto de entrenamiento, evaluando calidad (KID), alineación prompt-imagen (CLIP score) y diversidad (LPIPS). El modelo tiene solo 3.188.736 parámetros entrenables, lo que lo convierte en un adaptador extremadamente ligero.

Su relevancia es fundamentalmente académica y de investigación: demuestra un flujo riguroso de entrenamiento de LoRA sobre difusión con preregistro de prompts de evaluación, detección de duplicados por hash perceptual y análisis de memorización. La licencia restringe el uso a fines educativos y de investigación no comerciales, y el autor no reclama derechos sobre los activos de Pokémon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion 1.5 |
| Parámetros totales | 3.188.736 parámetros entrenables (adaptador LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos del adaptador en fp16; el base admite fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | other — `upstream-terms-and-research-restrictions` (uso educativo/investigación no comercial) |
| Formato de pesos | safetensors (formato nativo de `diffusers` para LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA exclusivamente sobre las proyecciones de atención del UNet de Stable Diffusion 1.5, con rango y alpha de 16/16. El entrenamiento congela el VAE y el codificador de texto CLIP, cacheando las medias/desviaciones de la posterior del VAE y los embeddings de CLIP para acelerar el proceso, aunque se emplean muestras latentes frescas de la posterior en cada paso. Se realizaron 1500 actualizaciones del optimizador con batch de 4, learning rate de 0.0001, 100 pasos de warmup, optimizador AdamW y semilla 266. Las imágenes se redimensionaron a 512 px con recorte central bicúbico y sin volteos horizontales.

El entrenamiento se ejecutó en una A100-SXM4-40GB en fp16 con gradient checkpointing, con un tiempo de bucle medido de 510,099 segundos (0,141694 GPU-horas) y un pico de memoria asignada de 2,818 GiB. Se usó un límite de asignación de PyTorch de 15 GiB, aunque la ejecución real en una GPU de 16 GB no se ha verificado. El dataset se dividió con semilla fija 266 en 749 imágenes de entrenamiento y 84 de test, tras agrupar ilustraciones relacionadas mediante un heurístico conservador de hash perceptual y descartar duplicados exactos de píxeles. Los captions BLIP pueden contener errores y el sesgo hacia criaturas cartoon aisladas limita la generalización de composición y fondos.

## Capacidades

- Generación de imágenes text-to-image de criaturas cartoon con estética Pokémon a partir de prompts en inglés.
- Adaptación de estilo y dominio sobre Stable Diffusion 1.5 sin modificar el modelo base.
- Composición de personajes con colores, formas y poses variadas dentro del dominio entrenado.
- Integración con el pipeline `StableDiffusionPipeline` de `diffusers` mediante `load_lora_weights`.
- Compatibilidad con el safety checker de Stable Diffusion durante la generación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- Capacidad multilingüe limitada al inglés (los prompts deben formularse en inglés).
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Investigación académica sobre LoRA en difusión: el adaptador sirve como referencia reproducible para estudiar el efecto del rango (4 vs 16) en calidad, alineación y diversidad, con configuración y semillas documentadas.
- Generación de assets para prototipos de videojuegos: creación rápida de criaturas cartoon para maquetas y pruebas de concepto, dado el bajo coste computacional del adaptador (3,18 M de parámetros entrenables).
- Docencia en cursos de machine learning generativo: ejemplo práctico de entrenamiento de LoRA sobre SD1.5 con preregistro de evaluación y análisis de memorización.
- Experimentos de evaluación de modelos generativos: el conjunto de 120 imágenes de evaluación y sus metadatos (KID, CLIP score, LPIPS) permiten reproducir y comparar metodologías de evaluación.
- Estudio de sesgos y memorización en difusión: el análisis de pares más cercanos por CLIP entre salidas y las 749 imágenes de entrenamiento sirve para investigar memorización parcial en adaptadores de bajo rango.
- Generación de ilustraciones de personajes para material educativo no comercial: siempre que se respeten los términos upstream y los derechos de los personajes, puede emplearse en contextos de investigación y docencia.
- Comparación de adaptadores en pipelines de investigación: permite contrastar el efecto de distintos rangos LoRA sobre el mismo base y dataset en estudios controlados.

## Benchmarks y rendimiento

Evaluación con DDIM a 30 pasos, guidance 7.5, 512 px y semillas 0/1 sobre 20 prompts (10 captions retenidos, 5 fuera de dominio, 5 composicionales), 40 imágenes por modelo, 120 en total:

| Modelo | KID ↓ | CLIP score ↑ | LPIPS | Flags del filtro de seguridad |
|---|---:|---:|---:|---:|
| Base SD1.5 | 0,064831 ± 0,008320 | 33,2198 | 0,841180 | 0 |
| LoRA rank4 | 0,042548 ± 0,006309 | 31,9753 | 0,792436 | 1 |
| LoRA rank16 | 0,038084 ± 0,005702 | 32,2778 | 0,772825 | 0 |

KID se calcula con MMD polinomial estándar sobre Inception 2048, 50 subconjuntos de 20, 20 salidas de dominio por modelo frente a 84 imágenes de test. La dispersión mostrada es la desviación estándar de subconjuntos, no un intervalo de confianza; el KID de muestra pequeña es ruidoso y no establece superioridad estadística del rank16. El CLIP score es 100 × max(0, coseno) con CLIP ViT-B/32 fijado. LPIPS es la distancia AlexNet entre las dos semillas, promediada sobre 20 prompts; mayor valor indica más diversidad, no necesariamente mejor calidad. El rank16 es el adaptador preferido provisional por menor KID y CLIP ligeramente superior al rank4; ambos pierden algo de alineación y diversidad frente al base. La selección final y el estudio humano ciego con 3 evaluadores sobre 25 pares sigue pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos pocos MB; el consumo dominante es el del pipeline SD1.5 en fp16, típicamente en torno a 4-6 GB con optimizaciones de atención, aunque no se proporciona una cifra medida para inferencia.
- VRAM de entrenamiento medida: pico de 2,818 GiB asignados en A100-SXM4-40GB con fp16 y gradient checkpointing; no verificado en GPU de 16 GB.
- GPU recomendadas: A100-SXM4-40GB para entrenamiento (configuración usada); para inferencia, cualquier GPU con suficiente VRAM para SD1.5 en fp16 (p. ej. RTX 3090, RTX 4090, A10, L4).
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque no se ha verificado experimentalmente.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; también es compatible con otros runners que carguen LoRA sobre SD1.5 (p. ej. AUTOMATIC1111, ComfyUI), aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles para inferencia; solo se reporta tiempo de entrenamiento (510,099 s, 0,141694 GPU-horas).

## Comparativa con modelos similares

| Modelo | Base | Rango LoRA | Parámetros entrenables | KID ↓ | CLIP score ↑ | Licencia |
|---|---|---|---:|---:|---:|---|
| data266-pokemon-lora-r16 | SD1.5 | 16 | 3.188.736 | 0,038084 | 32,2778 | other (research, no comercial) |
| data266-pokemon-lora-r4 | SD1.5 | 4 | no disponible | 0,042548 | 31,9753 | other (research, no comercial) |
| Stable Diffusion 1.5 (base) | — | — | — | 0,064831 | 33,2198 | CreativeML Open RAIL-M |

La comparativa se limita al adaptador hermano de rango 4 y al modelo base, que son los únicos con datos de evaluación en la información disponible. No se dispone de comparación con otros LoRA de Pokémon ni con modelos de difusión más recientes (SDXL, SD3) en esta ficha.

## Limitaciones y advertencias

- Sesgo de dominio: el dataset está dominado por criaturas cartoon aisladas, lo que limita la generalización de composición, fondos y escenas complejas.
- Captions ruidosos: los captions generados por BLIP pueden ser incorrectos, lo que afecta a la alineación prompt-imagen.
- Alucinación y fallos de composición: puede fallar en recuentos, relaciones izquierda-derecha y atributos de objetos.
- Memorización: el análisis CLIP de pares cercanos no demuestra que el modelo nunca memorice; los pares revisados comparten colores y estilo con formas y poses distintas, pero no es prueba concluyente.
- Filtro de seguridad: se activó el `StableDiffusionSafetyChecker`; una salida composicional del rank4 fue marcada, devuelta en negro y conservada sin remuestreo. Un flag del filtro no es prueba independiente de contenido inseguro.
- Licencia restrictiva: uso exclusivamente educativo y de investigación no comercial, sujeto a todos los términos upstream y a los derechos de los personajes. No se reclama una licencia comercial consolidada ni derechos irrestrictos sobre los activos de Pokémon.
- Idioma: solo inglés; los prompts en otros idiomas no están soportados de forma nativa.
- Evaluación incompleta: el estudio humano ciego con 3 evaluadores sobre 25 pares está pendiente; el KID de muestra pequeña es ruidoso y no establece superioridad estadística del rank16.
- No apto para contenido engañoso ni para aplicaciones críticas de seguridad.
- Ejecución en GPU de 16 GB no verificada experimentalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/data266-pokemon-lora-r16
- Dataset de generaciones de evaluación: https://huggingface.co/datasets/dhruv1672/data266-pokemon-generations
- Adaptador alternativo (rango 4): https://huggingface.co/dhruv1672/data266-pokemon-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Licencia: https://huggingface.co/dhruv1672/data266-pokemon-lora-r16/blob/main/LICENSE.md
