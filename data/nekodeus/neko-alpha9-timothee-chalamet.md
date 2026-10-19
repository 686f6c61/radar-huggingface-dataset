# Nekodeus/neko-alpha9-timothee-chalamet

## Resumen

`Nekodeus/neko-alpha9-timothee-chalamet` es un adaptador LoRA de personaje para Stable Diffusion 1.5, no un modelo fundacional ni un LLM. Lo publica Nekodeus dentro del pack `neko-hollywood-alpha-sd15-v1` para generar imágenes de Timothée Chalamet mediante el trigger `a photo of alpha9 person`. El repositorio declara 0 descargas, 0 likes y 0.0 GB.

El adaptador se entrenó con kohya_ss sd-scripts a 512 px, 1500 pasos, rango/alpha 8, lr 1e-4 y ~80 imágenes filtradas. Es relevante para experimentar con consistencia de personaje en GPU de consumo y en flujos A1111, Forge, ComfyUI o diffusers. No se publican parámetros totales, formato exacto de pesos, condiciones de licencia ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Stable Diffusion 1.5; dim/alpha 8; no se especifica a qué componentes se aplica |
| Parámetros totales | no disponible; el rango 8 no permite inferir el recuento |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generación text-to-image); no se documenta límite de tokens de prompt |
| Tipos de cuantización | no disponible; el entrenamiento usó Adam de 8 bits, pero no se documentan variantes de inferencia cuantizadas |
| Idiomas soportados | no disponible; los prompts de ejemplo están en inglés |
| Licencia | other; no se detallan condiciones de uso comercial |
| Formato de pesos | adaptador PEFT/LoRA; no se especifica el formato de archivo (.safetensors, .pt, .bin) |
| Resolución de entrenamiento | 512 px |
| Pasos de entrenamiento | 1500 |
| Rango/alpha LoRA | 8 / 8 |
| Learning rate | 1e-4 |
| Optimizador | Adam de 8 bits |
| Dataset | ~80 imágenes filtradas; composición no disponible |
| Trigger | `a photo of alpha9 person` |
| Peso recomendado | 0,8-1,0 |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-18 |
| Fecha de actualización | 2026-10-18 |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje aplicado sobre Stable Diffusion 1.5. La model card indica entrenamiento con kohya_ss sd-scripts, resolución 512 px, 1500 pasos, dim/alpha 8, lr 1e-4, Adam de 8 bits y xformers, sobre ~80 imágenes filtradas. No se especifica si el adaptador se aplicó solo a la U-Net, al text encoder o a ambos, ni se detallan captions, regularización, semilla o composición del dataset.

No hay información sobre RLHF, DPO ni técnicas de alineación; no aplican a un adaptador de difusión de este tipo. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La única innovación declarada es el propio entrenamiento LoRA de bajo rango para capturar la identidad del personaje con un trigger.

## Capacidades

- Generación de imágenes text-to-image de retratos y figuras humanas con el trigger `a photo of alpha9 person`.
- Control de pose, encuadre, vestuario e iluminación mediante prompts, heredado de las capacidades de Stable Diffusion 1.5.
- Integración en Automatic1111, Forge, ComfyUI y pipelines de diffusers con PEFT.
- Ajuste de similitud mediante el peso del LoRA, recomendado entre 0,8 y 1,0.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades de visión, audio ni modo thinking.
- El soporte multilingüe no está documentado; los ejemplos de prompt están en inglés.

## Casos de uso

- Moodboards internos para vestuario y maquillaje: generar retratos de referencia con `a photo of alpha9 person` y variaciones de luz y vestuario; el LoRA mantiene rasgos y el coste es bajo porque es un adaptador pequeño sobre SD1.5.
- Storyboards y novelas gráficas: usar el trigger junto con semilla fija y prompts de pose o encuadre para mantener un personaje consistente entre viñetas; el peso 0,8-1,0 permite ajustar similitud frente a flexibilidad.
- Pruebas de iluminación para fotografía: generar referencias de retrato con distintas direcciones de luz; SD1.5 responde a prompts de iluminación y el adaptador añade el rostro del personaje.
- Prototipado de pipelines: validar la carga de PEFT, el trigger y los pesos en A1111, ComfyUI o diffusers antes de integrar LoRAs más grandes; el repositorio es pequeño y no requiere infraestructura especial.
- Docencia y experimentación con LoRA: estudiar el efecto de rango 8, 1500 pasos y ~80 imágenes en la calidad e identidad; la receta es solo parcialmente reproducible porque faltan captions y semilla.
- Ilustración editorial con etiquetado de IA: crear imágenes claramente ilustradas para artículos, con aviso de contenido sintético; requiere derechos de imagen y evitar presentarlo como fotografía real.
- Pruebas de integración en ComfyUI: construir workflows por lotes con el trigger y comparar semillas; útil para medir latencia y VRAM en GPU de consumo.
- Investigación sobre sesgos en LoRAs de celebridades: analizar cómo ~80 imágenes filtradas afectan a la diversidad de poses, edades y rasgos; el adaptador es un caso pequeño y controlado, aunque no hay benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay FID, CLIP score, similitud facial, LPIPS ni mediciones de throughput para este LoRA.

## Requisitos de hardware

- VRAM estimada: 4-6 GB en FP16 a 512x512 para SD1.5 + LoRA; 6-8 GB recomendados para comodidad; 4 GB posibles con offload y optimizaciones. Es una estimación orientativa no medida para este adaptador.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; A100 40/80 GB para lotes.
- Cabe en GPU de consumo: sí, en RTX 2060 6 GB, GTX 1660 6 GB, RTX 3050 8 GB o superiores; con 4 GB puede requerir optimizaciones.
- Opciones de despliegue: Automatic1111, Forge, ComfyUI y diffusers + PEFT. No aplican vLLM, llama.cpp, Ollama ni TGI, orientados a LLM.
- Latencia y throughput: no disponible; dependen de GPU, sampler, pasos y resolución. No se publican mediciones.
- Almacenamiento: repositorio de 0.0 GB; el adaptador es pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/neko-alpha9-timothee-chalamet | no disponible (LoRA rango 8) | no aplica | sin benchmarks | other | HuggingFace |
| PixAI Timothée Chalamet (1698717056593880740) | no disponible | no aplica | no disponible | no disponible | PixAI |
| PixAI Timothée Chalamet (1761565075727088561) | no disponible | no aplica | no disponible | no disponible | PixAI |
| PixAI Timothée Chalamet (1834137699875727984) | no disponible | no aplica | no disponible | no disponible | PixAI |

No se dispone de parámetros, contexto ni rendimiento de las alternativas; la comparación es solo de disponibilidad y tipo de servicio. SeaArt AI aparece en la búsqueda como colección comunitaria de contenido, no como un modelo único comparable.

## Limitaciones y advertencias

- Licencia `other` sin texto: no se puede asumir permiso para uso comercial, redistribución o producción. Hay que consultar al autor.
- Derechos de imagen y personalidad: Timothée Chalamet es una persona real; generar o difundir su imagen puede requerir consentimiento y cumplir normativa de publicidad, derechos de imagen y deepfakes. No usar para suplantación, fraude, contenido sexual o desinformación.
- Riesgo de alucinación visual: manos, ojos, dientes, joyas y texto pueden salir deformados; no es una fotografía real.
- Dataset pequeño (~80 imágenes) y 1500 pasos: posible sobreajuste, poca diversidad de poses, edades, etnias, iluminación y expresiones; la similitud puede fallar en perfiles o planos amplios.
- Trigger obligatorio y peso 0,8-1,0: fuera de ese rango la identidad puede diluirse o saturar; no se documentan pesos alternativos.
- Idioma: prompts de ejemplo en inglés; no se declara soporte multilingüe. SD1.5 suele funcionar mejor con prompts en inglés, pero no hay evaluación para este LoRA.
- Sin benchmarks ni validación comunitaria: 0 descargas y 0 likes; no hay evidencia de calidad o robustez.
- Formato y compatibilidad: al no especificarse el formato de pesos, puede requerir conversión o carga con PEFT; verificar antes de integrar.
- No es un modelo de lenguaje: no sirve para tool calling, agentes, razonamiento o generación de texto.

## Enlaces

- HuggingFace: https://huggingface.co/Nekodeus/neko-alpha9-timothee-chalamet
- Pack: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- PixAI 1698717056593880740: https://pixai.art/en/model/1698717056593880740-Timothe-Chalamet
- PixAI 1761565075727088561: https://pixai.art/model/1761565075727088561
- PixAI 1834137699875727984: https://pixai.art/model/1834137699875727984
- SeaArt: https://www.seaart.ai/search/timothee-chalamet
