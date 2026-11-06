# akhaliq/p-h3-image-turbo-lora

## Resumen

P-H3-Image-Turbo LoRA es un adaptador LoRA de rango 16 para el modelo de generación de imágenes PrunaAI/P-H3-Image, publicado por el usuario akhaliq (ML Intern) el 3 de noviembre de 2026. Su función es reducir el número de pasos de muestreo necesarios para renderizar imágenes de hasta 8 megapíxeles: de los 8 pasos del modelo base a 6 pasos (~1,3× más rápido) o 4 pasos (~1,6× más rápido), sin clasificador libre de guiado (CFG) y manteniendo el mismo formato de prompting.

El adaptador procede de un LoRA destilado por DMD (Distribution Matching Distillation) para el modelo de vídeo MiniMax-H3, convertido a formato diffusers por InstantX y redistribuido por larryvrh. El hallazgo técnico del autor es que los 363 módulos objetivo del LoRA de vídeo existen literalmente en el transformer de imagen de P-H3-Image, de modo que el merge es directo y el resultado a 6 pasos fue preferido al baseline de 8 pasos en las cuatro pruebas A/B ciegas realizadas a resolución completa.

Es relevante porque demuestra que los LoRA turbo destilados para un modelo de vídeo pueden transferirse a un transformer de imagen derivado del mismo linaje, abaratando la inferencia en un modelo de muy alta resolución (2912×2912) sin reentrenamiento adicional. El repositorio ocupa 1,7 GB y se distribuye bajo la licencia comunitaria de MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión de imagen; el modelo base P-H3-Image es un transformer de difusión con pipeline modular de diffusers |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16; el recuento de parámetros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (única precisión documentada en los ejemplos de uso); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el prompting se documenta en inglés en los ejemplos) |
| Licencia | minimax-h3-community-license-agreement (el LoRA original de InstantX se distribuye como Apache-2.0) |
| Formato de pesos | safetensors (diffusers); fichero `minimax_h3_turbo_4step_ema_ckpt500_diffusers.safetensors` |
| Tamano del repositorio | 1,7 GB |
| Pasos de muestreo | 6 (recomendado) o 4; el modelo base usa 8 |
| Resolución soportada | hasta 2912×2912 (8 MP) en los ejemplos documentados |
| CFG | no requerido |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que se fusiona (merge) en el transformer de P-H3-Image. Procede de `minimax_h3_turbo_4step_ema_ckpt500_diffusers.safetensors`, un checkpoint EMA del paso 500 de un LoRA destilado mediante DMD para muestreo en 4 pasos sobre el modelo de vídeo MiniMax-H3. La cadena de procedencia es: destilación DMD sobre MiniMax-H3 (larryvrh/MiniMax-H3-Turbo-Lora) → conversión a formato diffusers (InstantX/MiniMax-H3-Turbo-Lora-Diffusers, Apache-2.0) → publicación como adaptador para P-H3-Image (akhaliq).

La innovación técnica documentada es la compatibilidad estructural: los 363 módulos objetivo del LoRA de vídeo coinciden de forma literal con los módulos del transformer de imagen de P-H3-Image, que el autor describe como «surgically-modified». Esto permite aplicar directamente el merge sin remapeo de claves, salvo en el caso de LoRA en formato ComfyUI (nomenclatura MiniMax-H3 original), donde se requiere un mapa de renombrado (`blocks.N` → `transformer_blocks.N`, `qkv_proj` fusionado → `to_q`). No se documentan datos de entrenamiento adicionales, número de tokens ni fases de RLHF/DPO para el adaptador.

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución (hasta 2912×2912, 8 MP) en 6 o 4 pasos de muestreo.
- Muestreo sin CFG (classifier-free guidance), lo que reduce el coste computacional por paso.
- Fidelidad de texto citado en la imagen: el ejemplo A/B incluye un póster con texto entrecomillado («NIGHT MARKET», «FRIDAY») renderizado correctamente a 6 pasos.
- Retratos fotorrealistas, fotogramas cinematográficos y gráfica vectorial plana, según los cuatro prompts de la comparativa.
- Compatibilidad con el pipeline modular de diffusers (`ModularPipeline`) y con el ecosistema de P-H3-Image.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; es un adaptador exclusivamente de generación de imágenes.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de imágenes de alta resolución en producción: el adaptador reduce el tiempo de render de 2912×2912 bf16 en H200 de ~11,9 s a ~9,0 s (6 pasos) o ~7,5 s (4 pasos), lo que abarata el coste por imagen en pipelines de generación por lotes.
- Iteración rápida en diseño gráfico: con 6 pasos y sin CFG, un diseñador puede probar variaciones de un póster o ilustración con menor latencia, manteniendo la calidad del baseline según la comparativa A/B.
- Generación de material promocional con texto integrado: el ejemplo del póster de concierto con texto entrecomillado muestra que el modelo a 6 pasos conserva la legibilidad del texto, útil para carteles y banners.
- Prototipado de arte conceptual y storyboards: los fotogramas cinematográficos (gasolinera en el desierto, retrato documental) a 8 MP sirven para previsualización de alta fidelidad en cine y publicidad.
- Ilustración vectorial y gráfica plana: el prompt de póster vectorial de un faro demuestra la capacidad de generar gráfica limpia, adecuada para merchandising o señalética.
- Sustitución del modelo base en infraestructura existente: al no aumentar el consumo de VRAM (~83 GB bf16 sin el upsampler de prompt), el adaptador se puede adoptar en despliegues de P-H3-Image ya existentes en H200/B200 sin cambiar el hardware.
- Investigación sobre transferencia de LoRA entre modelos del mismo linaje: el caso sirve como referencia para estudiar la portabilidad de destilaciones DMD de vídeo a imagen.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la comparativa A/B del autor, a 2912×2912 en bf16 sobre una GPU H200, con el mismo prompt y semilla:

| Configuración | Pasos | Tiempo (H200) | Calidad |
|---|---|---|---|
| P-H3-Image baseline | 8 | ~11,9 s | referencia |
| + este LoRA (recomendado) | 6 | ~9,0 s | preferido al baseline en 4/4 prompts (A/B ciego) |
| + este LoRA | 4 | ~7,5 s | usable, visiblemente más suave |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: ~83 GB en bf16 sin el upsampler de prompt, idéntica al modelo base; el merge del LoRA no añade consumo.
- GPU recomendadas: una H200 o B200 para ejecución completa en una sola GPU; GPUs de clase ~80 GB con auto-offload mediante `ComponentsManager` (según la model card del modelo base).
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en la configuración documentada de 8 MP en bf16.
- Opciones de despliegue: diffusers (pipeline modular `ModularPipeline`), con script validado `run_p_h3_turbo.py`; se documenta compatibilidad de merge con LoRA en formato ComfyUI mediante mapa de renombrado. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de imagen).
- Latencia y throughput: ~9,0 s por imagen a 6 pasos y ~7,5 s a 4 pasos a 2912×2912 en H200; el baseline tarda ~11,9 s a 8 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhaliq/p-h3-image-turbo-lora (este) | LoRA turbo para P-H3-Image | 6 (recomendado) / 4 | hasta 2912×2912 | minimax-h3-community-license-agreement | Hugging Face |
| PrunaAI/P-H3-Image (base) | Transformer de difusión de imagen | 8 | hasta 2912×2912 | minimax-h3-community-license-agreement | Hugging Face |
| InstantX/MiniMax-H3-Turbo-Lora-Diffusers | LoRA turbo para MiniMax-H3 (vídeo) | 4 | no disponible | Apache-2.0 | Hugging Face |
| moe-kill/H3-Turbo-Neat | LoRA turbo en formato ComfyUI para H3 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de imágenes en la información proporcionada.

## Limitaciones y advertencias

- A 4 pasos la calidad es «visiblemente más suave» que el baseline; el autor recomienda 6 pasos para producción.
- El pipeline modular ignora silenciosamente `num_inference_steps`; es obligatorio pasar sigmas explícitas para cualquier configuración distinta de 8 pasos, lo que puede provocar resultados incorrectos si se usa de forma ingenua.
- El LoRA se destiló originalmente para un modelo de vídeo; aunque el merge es limpio, no se documenta una evaluación sistemática más allá de cuatro prompts.
- Riesgo de alucinación visual y de errores en texto renderizado no cuantificado fuera de los ejemplos publicados.
- Sesgos conocidos: no documentados.
- Licencia comunitaria de MiniMax-H3: pueden existir restricciones para uso comercial; conviene revisar el enlace de licencia antes de desplegar en producción. El LoRA de origen (InstantX) es Apache-2.0, pero el modelo base no.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de la comunidad.
- Requiere ~83 GB de VRAM en bf16, lo que excluye GPUs de consumo.
- Idiomas soportados no documentados; los ejemplos de prompting están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/p-h3-image-turbo-lora
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Licencia del modelo base: https://huggingface.co/PrunaAI/P-H3-Image/blob/main/LICENSE
- Dataset de comparativas A/B: https://huggingface.co/datasets/akhaliq/p-h3-turbo-ab
- LoRA turbo de InstantX (diffusers): https://huggingface.co/InstantX/MiniMax-H3-Turbo-Lora-Diffusers
- LoRA turbo original de larryvrh: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- LoRA turbo alternativo en formato ComfyUI: https://huggingface.co/moe-kill/H3-Turbo-Neat
- ML Intern: https://hf.co/chat?mode=ml-intern
- Diffusers (instalación desde Git): https://github.com/huggingface/diffusers
