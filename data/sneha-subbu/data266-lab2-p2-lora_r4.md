# Sneha-subbu/data266-lab2-p2-lora_r4

## Resumen

`Sneha-subbu/data266-lab2-p2-lora_r4` es un adaptador LoRA de rango 4 para Stable Diffusion 1.5, entrenado para generar imágenes de criaturas con estética cartoon a partir de texto. Lo desarrollan Sneha Singh y Ritika Neema en el marco de la asignatura DATA 266 (Lab 2, Parte 2, equipo 05) y se publica como entrega de curso, no como modelo de producción. Su relevancia es, por tanto, fundamentalmente docente y metodológica: sirve como ejemplo reproducible de un flujo completo de fine-tuning con LoRA, incluyendo dataset, hiperparámetros, presupuesto de GPU y evaluación cuantitativa con KID, CLIP score y diversidad LPIPS.

Técnicamente es un adaptador pequeño: 797.184 parámetros entrenables sobre el UNet de SD 1.5, entrenado en 1.500 pasos con imágenes de 512 px y un coste de 0,2401 horas de GPU en una NVIDIA L4. La mejora más clara que reporta la model card es la distribución frente al modelo base: KID baja de 0,0602 a 0,0267 en el conjunto de 20 prompts fijos, a costa de una ligera pérdida de alineación texto-imagen (CLIP score 0,322 → 0,311) y de diversidad (LPIPS 0,735 → 0,718).

No es un modelo de lenguaje ni un modelo multimodal general: no hay ventana de contexto, no hay soporte de tool calling ni de agentes, y no se publican resultados en benchmarks de razonamiento como MMLU o GSM8K. La información disponible se limita a la model card del autor y a un repositorio de 0,0 GB, sin descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el UNet de Stable Diffusion 1.5, un modelo de difusión latente text-to-image |
| Parámetros totales | no disponible (el adaptador declara 797.184 parámetros entrenables; la ficha no indica el total del modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo text-to-image; la ficha no declara longitud de prompt ni límite de tokens del codificador de texto) |
| Tipos de cuantización | no disponible (la model card no documenta cuantizaciones del adaptador ni del base) |
| Idiomas soportados | no disponibles (la model card no los declara; los prompts de ejemplo y el dataset están en inglés) |
| Licencia | creativeml-openrail-m, con restricción adicional declarada por el autor: solo investigación y coursework no comercial |
| Formato de pesos | no disponible de forma explícita; se carga con `pipe.load_lora_weights()` de diffusers y el repo pesa 0,0 GB (adaptador de rango 4) |
| Rango LoRA | 4 |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Dataset de entrenamiento | reach-vb/pokemon-blip-captions (750 imágenes de entrenamiento / 83 de test) |
| Librería | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 inyectado sobre Stable Diffusion 1.5. La model card no especifica a qué módulos se aplica (atención cruzada del UNet, self-attention, codificador de texto) ni el valor de alpha o del dropout, por lo que esos detalles quedan como no disponibles. El número de parámetros entrenables, 797.184, es coherente con un rango bajo aplicado a un subconjunto de capas de atención, y explica el reducido coste de entrenamiento.

El entrenamiento usó 750 imágenes de entrenamiento y 83 de test del dataset `reach-vb/pokemon-blip-captions`, con semilla 266, resolución de 512 px, 1.500 pasos, batch de 4 y learning rate de 0,0001. Se ejecutó en una NVIDIA L4 con un pico de memoria de 4,22 GB y un consumo de 0,2401 horas de GPU. No se documenta el optimizador, el scheduler, el uso de ema, el número de tokens de texto vistos ni ninguna fase de alineación por preferencias (RLHF/DPO), algo que no aplica a este tipo de adaptador. La única innovación reseñable es metodológica: la comparación controlada entre ranks y la inclusión de una comprobación de memorización mediante CLIP más distancia por teselas sobre 10 generaciones, que no encontró copias cercanas de las imágenes de entrenamiento.

## Capacidades

- Generación de imágenes text-to-image a 512 px, condicionada por prompts en inglés, sobre la base de Stable Diffusion 1.5.
- Especialización estilística: reproduce una estética de criatura cartoon consistente con el dataset de Pokémon usado en el entrenamiento.
- Mejora de la distribución frente al modelo base en el conjunto de evaluación del autor (KID 0,0267 frente a 0,0602).
- Compatible con el ecosistema diffusers mediante `load_lora_weights`, lo que permite combinarlo con el pipeline estándar de SD 1.5.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene modo thinking ni capacidades de audio o vídeo.
- Capacidades multilingües: no documentadas; el codificador de texto de SD 1.5 y los prompts de evaluación están en inglés, y la ficha no reporta resultados en otros idiomas.

## Casos de uso

- Docencia y reproducibilidad de experimentos: el adaptador sirve como referencia completa de un flujo de fine-tuning con LoRA (dataset, hiperparámetros, presupuesto de GPU y métricas), útil en asignaturas de data science o visión por computador que quieran replicar el experimento desde cero con 0,24 horas de GPU.
- Estudio de ablación de rango: al existir una variante de rango 16 en el mismo laboratorio, este adaptador de rango 4 permite comparar el efecto del rango en calidad (KID), alineación (CLIP score) y diversidad (LPIPS) manteniendo el resto del pipeline.
- Prototipado interno de ilustración de criaturas: para generar bocetos de personajes con estética cartoon en fases de exploración visual, siempre en un contexto no comercial y asumiendo el riesgo de parecido con personajes con copyright.
- Evaluación de métricas de generación: útil como banco de pruebas para implementar y depurar pipelines de KID, CLIP score y diversidad LPIPS con prompts y semillas fijas (20 prompts, semillas 0 y 1, 30 pasos, guidance 7.5).
- Análisis de fallos composicionales: el adaptador reproduce de forma fiable errores de composición (pérdida de objetos, atributos y conteos), lo que lo convierte en un caso de estudio controlado para investigar sesgos de composición en modelos de difusión.
- Investigación sobre memorización y privacidad: la comprobación con CLIP más distancia por teselas documentada en la ficha sirve de plantilla para auditorías de copia de imágenes de entrenamiento en adaptadores de bajo rango.
- Integración en interfaces de usuario para talleres: se puede cargar en ComfyUI, Automatic1111/Forge o InvokeAI mediante el mecanismo estándar de LoRA de SD 1.5 para demostraciones en clase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje. La model card sí reporta una evaluación de generación de imágenes con 20 prompts fijos, semillas 0 y 1, 512 px, 30 pasos y guidance 7.5:

| Modelo | KID (menor es mejor) | CLIP score | Diversidad LPIPS |
|---|---|---|---|
| Base (SD 1.5) | 0,0602 | 0,322 | 0,735 |
| lora_r4 (este adaptador) | 0,0267 | 0,311 | 0,718 |

Evaluación humana a ciegas: 25 pares, 3 evaluadores, 75 votos. La model card indica que el modelo de rango 16 fue preferido frente al base en el 38,7 % de los votos (IC 95 %: 28,5–50,0 %), con un desglose por tipo de prompt del 41,0 % en dominio, 44,4 % fuera de dominio y 27,8 % en prompts composicionales. Advertencia: ese resultado corresponde al modelo de rango 16, no a este adaptador de rango 4, y la ficha no publica el resultado humano específico de r4.

## Requisitos de hardware

- VRAM de entrenamiento documentada: pico de 4,22 GB con batch 4 a 512 px en una NVIDIA L4.
- Coste de entrenamiento documentado: 0,2401 horas de GPU para 1.500 pasos.
- VRAM de inferencia: no publicada en la ficha. Como estimación del ecosistema para SD 1.5 en fp16, el pipeline completo suele requerir del orden de 4 GB, a los que el adaptador de rango 4 añade una cantidad despreciable; en fp32 la estimación se duplica aproximadamente. Son estimaciones, no cifras medidas por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en fp16 (por ejemplo RTX 3060, RTX 4060, RTX 4070). Para entrenamientos similares, una L4 o una RTX 3090/4090 son suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; no confirmado por el autor.
- Opciones de despliegue: diffusers (vía `StableDiffusionPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge, InvokeAI y otros frontends compatibles con LoRA de SD 1.5. Para servidores, pipelines de diffusers con `torch_dtype=torch.float16`.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal publicado es el tiempo de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lora_r4 (este adaptador) | LoRA rango 4 sobre SD 1.5 | 797.184 entrenables | no aplica | KID 0,0267; CLIP 0,311; LPIPS 0,718 | creativeml-openrail-m + restricción no comercial del autor | HuggingFace, 0 descargas |
| Variante de rango 16 del mismo laboratorio | LoRA rango 16 sobre SD 1.5 | no disponible | no aplica | preferida frente al base en el 38,7 % de 75 votos humanos; sin KID/CLIP publicados | no disponible | referenciada en la model card, sin identificador ni métricas propias publicadas |
| sunnyJane/data266-lab2-naruto-run1-lora-r4 | LoRA rango 4 sobre SD 1.5 (otro tema, mismo contexto de laboratorio) | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| Stable Diffusion 1.5 (base) | Modelo de difusión latente completo | no disponible en esta ficha | no aplica | KID 0,0602; CLIP 0,322; LPIPS 0,735 | creativeml-openrail-m | HuggingFace, ampliamente adoptado |

No se dispone de comparaciones con adaptadores de terceros de la misma categoría (LoRA de estilo cartoon sobre SD 1.5) dentro de la información proporcionada.

## Limitaciones y advertencias

- Restricción de uso: la model card limita el adaptador a investigación y coursework no comercial, aunque la licencia declarada sea creativeml-openrail-m. Esa restricción adicional del autor prevalece para un uso responsable.
- Riesgo de copyright: las imágenes de entrenamiento muestran personajes con derechos de autor; el propio autor desaconseja explícitamente el uso comercial y advierte del riesgo legal derivado.
- Fallos composicionales documentados: los prompts que combinan objetos, atributos o conteos pierden elementos con frecuencia; el 27,8 % de preferencia humana en prompts composicionales refleja esta debilidad.
- Colapso estilístico: la misma apariencia de criatura se repite en prompts no relacionados, lo que reduce la variedad de las generaciones.
- Deriva de estilo fuera de dominio: los prompts ajenos al dataset tienden a desplazarse hacia la estética cartoon, incluso cuando no se solicita.
- Sesgos: no documentados de forma explícita en la ficha; el dataset de origen (Pokémon BLIP captions) condiciona la distribución hacia una estética y un vocabulario visual muy concretos, con posible infrarrepresentación de otras culturas visuales.
- Alucinación en el sentido de desalineación prompt-imagen: la caída de CLIP score frente al base (0,311 frente a 0,322) indica una fidelidad semántica ligeramente inferior.
- Limitación de resolución: el adaptador se entrenó y evaluó a 512 px; no hay datos sobre su comportamiento a resoluciones superiores.
- Idioma: sin evaluación en castellano ni en otros idiomas; los resultados solo están documentados para prompts en inglés.
- Escala de evaluación reducida: 20 prompts, 2 semillas y 75 votos humanos; los intervalos de confianza son amplios y los resultados no deben extrapolarse a producción.
- Repositorio sin adopción: 0 descargas y 0 valoraciones, sin señales de validación por parte de la comunidad.
- No hay información sobre filtros de seguridad ni sobre el comportamiento del adaptador con prompts NSFW.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sneha-subbu/data266-lab2-p2-lora_r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Perfil del autor en GitHub: https://github.com/Snehasingh-21/Sneha-subbu
- Adaptador del mismo laboratorio (tema Naruto): https://huggingface.co/sunnyJane/data266-lab2-naruto-run1-lora-r4
- Registro de terceros del adaptador Naruto: https://free2aitools.com/model/sunnyjane/data266-lab2-naruto-run1-lora-r4
- Catálogo de modelos y LoRAs de la comunidad: https://civitai.com/models
- Búsqueda de modelos LoRA en HuggingFace: https://huggingface.co/models?sort=modified&search=lora
