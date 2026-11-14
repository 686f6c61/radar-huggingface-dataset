# shashirag/data266-lab2-naruto-lora-rank4

## Resumen

`shashirag/data266-lab2-naruto-lora-rank4` es un adaptador LoRA para generación de imágenes texto-a-imagen construido sobre Stable Diffusion v1.5 y afinado con el dataset Naruto BLIP Captions. Lo publica el usuario shashirag como artefacto de un experimento académico de ajuste fino de modelos de difusión, orientado al estudio de adaptación de dominio mediante LoRA. No es un modelo de lenguaje: es un adaptador de difusión que modifica el comportamiento del modelo base para producir imágenes con estética anime inspirada en Naruto.

El adaptador tiene un tamaño muy reducido: los pesos safetensors del repositorio suman 860.318.148 parámetros, pero los parámetros entrenables declarados en la model card son solo 1.594.368 (un 0,1852 % del total), lo que corresponde a la inyección LoRA sobre las capas de atención del UNet. El repositorio ocupa 1,7 GB y se distribuye en formato safetensors compatible con la librería `diffusers`.

Su relevancia es limitada y de carácter experimental: cero descargas y cero likes en el momento de la consulta, licencia "other" con restricciones explícitas de uso no comercial y entrenamiento sobre imágenes con contenido sujeto a derechos de autor. Resulta útil como referencia metodológica para quien estudie LoRA de bajo rango en difusión, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 860.318.148 (pesos del repositorio en safetensors) |
| Parametros activos | no disponible (no es MoE); parametros entrenables del adaptador: 1.594.368 (0,1852 %) |
| Longitud de contexto | no disponible (modelo de imagen; resolución de entrenamiento 512 x 512) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión nativa; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponibles (el prompt de texto se procesa con el text encoder CLIP de SD 1.5, predominantemente inglés) |
| Licencia | other (uso no comercial según la model card) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion v1.5, un modelo de difusión latente con un UNet como red de denoising y un text encoder CLIP para condicionamiento por prompt. La técnica empleada es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención; en este caso el rango seleccionado es 8, aunque el nombre del repositorio indica "rank4", discrepancia que conviene verificar antes de reutilizarlo. El entrenamiento se realizó durante 1.000 pasos con learning rate 1e-4, batch size 1, acumulación de gradiente de 4 pasos y resolución de 512 x 512.

El dataset de entrenamiento es Naruto BLIP Captions, con captions generadas automáticamente por BLIP, lo que introduce ruido en la supervisión textual. No se documenta el número de imágenes ni de tokens, ni si hubo etapas de refinamiento posteriores. La model card no menciona innovaciones técnicas adicionales (decodificación especulativa, atención lineal ni variantes arquitectónicas); se trata de un ajuste LoRA estándar sobre el pipeline de `diffusers`.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime inspirada en el universo Naruto.
- Adaptación de dominio sobre Stable Diffusion v1.5: el adaptador modula el estilo sin sustituir el modelo base.
- Compatible con el pipeline `text-to-image` de `diffusers` y con el ecosistema de LoRA para SD 1.5.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades multimodales más allá del condicionamiento texto-imagen.
- Capacidades multilingües no documentadas; el text encoder CLIP de SD 1.5 está optimizado para inglés.
- El safety checker de Stable Diffusion se activó durante la generación según la model card.

## Casos de uso

- Estudio académico de adaptación de dominio con LoRA: permite reproducir un experimento controlado de bajo rango (rank 8) sobre SD 1.5 y comparar métricas de calidad (KID, CLIP score, LPIPS) frente a otros rangos.
- Docencia sobre ajuste fino de modelos de difusión: sirve como ejemplo mínimo de configuración de entrenamiento (1.000 pasos, lr 1e-4, batch 1, grad accumulation 4) para cursos de visión por computador.
- Investigación sobre el impacto del ruido en captions: al usar captions automáticas de BLIP, es útil para medir cómo afecta la supervisión imperfecta a la fidelidad prompt-imagen.
- Generación de arte conceptual no comercial: ilustraciones de estilo anime para prototipos, fanzines o material de investigación, siempre dentro del marco no comercial declarado.
- Benchmarking de pipelines de evaluación de difusión: sus métricas publicadas (KID 0,0538; CLIP score 30,94; LPIPS 0,7001) permiten usarlo como línea base en comparativas de adaptadores LoRA.
- Pruebas de integración de `diffusers` con adaptadores de bajo rango: útil para validar flujos de carga de LoRA, gestión de pesos y compatibilidad con el modelo base SD 1.5 en entornos de CI.

## Benchmarks y rendimiento

| Metrica | Valor (rank 8) |
|---|---|
| KID | 0,0538 |
| CLIP score | 30,94 |
| LPIPS medio | 0,7001 |

No se han publicado resultados comparativos con otros adaptadores ni con el modelo base en la información disponible. Las métricas corresponden únicamente al rank 8 declarado en la model card; no se aportan cifras para el rank 4 que sugiere el nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un LoRA sobre SD 1.5, el coste dominante es el modelo base. En FP16, SD 1.5 requiere aproximadamente 4-6 GB de VRAM para generar a 512 x 512; el adaptador añade un overhead mínimo (decenas de MB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en consumer; A100 o H100 solo si se ejecutan lotes grandes o pipelines de evaluación masiva.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más de VRAM en FP16; con 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` (carga del LoRA con `load_lora_weights`), Automatic1111/Forge, ComfyUI y otros frontends compatibles con LoRA de SD 1.5. No se documentan variantes GGUF ni soporte para llama.cpp/Ollama (no aplicables a difusión).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del modelo base, la GPU y el número de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-naruto-lora-rank4 | 860.318.148 totales; 1.594.368 entrenables | 512 x 512 | KID 0,0538; CLIP 30,94; LPIPS 0,7001 | other (no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion v1.5 (base) | ~860 M (UNet) | 512 x 512 | no disponible en esta ficha | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de anime sobre SD 1.5 | variable (típicamente 1-10 M entrenables) | 512 x 512 | no disponible | variable | variable en Hugging Face / Civitai |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparativa se limita a parámetros, resolución y licencia.

## Limitaciones y advertencias

- Generalización limitada: la model card advierte que el modelo puede no funcionar bien con sujetos no anime, fotografía realista o prompts composicionales complejos.
- Ruido en la supervisión: las captions del dataset fueron generadas automáticamente por BLIP y pueden contener errores, lo que afecta a la fidelidad prompt-imagen.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y composiciones incoherentes, especialmente con prompts largos.
- Restricciones de licencia: licencia "other" con uso explícitamente no comercial; el contenido de entrenamiento incluye material de Naruto sujeto a derechos de autor, por lo que el uso comercial requiere derechos y permisos adicionales.
- Idiomas: no se documenta soporte multilingüe; el text encoder CLIP de SD 1.5 rinde peor con prompts en castellano que en inglés.
- Discrepancia de nomenclatura: el repositorio se llama "rank4" pero la model card declara rank 8; conviene verificar la configuración real antes de reutilizarlo.
- Madurez: cero descargas y cero likes, sin validación comunitaria; no recomendable como dependencia en producción.
- Sesgos: no documentados por el autor; hereda los sesgos del dataset y del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/shashirag/data266-lab2-naruto-lora-rank4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Repositorio de `diffusers`: https://github.com/huggingface/diffusers
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion): https://arxiv.org/abs/2112.10752
- Paper de BLIP: https://arxiv.org/abs/2201.12086
