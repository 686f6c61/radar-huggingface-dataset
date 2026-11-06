# Mohit5899/bhaav-e

## Resumen

Bhaav-E es un modelo compacto de generación de vídeo a partir de texto (text-to-video) especializado en crear stickers animados en bucle, desarrollado por Mohit (usuario Mohit5899 en Hugging Face). Se trata de un transformer de difusión de vídeo de 211,92 millones de parámetros entrenado desde cero con rectified flow, que genera clips de 2 segundos a 256 × 256 píxeles y 8 fps, con 17 fotogramas diseñados para repetirse en bucle. El modelo opera en el espacio latente del VAE de vídeo de Wan2.2 (congelado) y se condiciona sobre el codificador de texto Flan-T5-Base (también congelado).

Su relevancia reside en su enfoque deliberadamente reducido y especializado: en lugar de competir con modelos generalistas de vídeo, Bhaav-E se centra en un dominio acotado (emojis animados, caras de emociones y micro-animaciones de interfaz), lo que permite entrenarlo en unas 3,6 horas en una única GPU de consumo/profesional (RTX PRO 4500 de 32 GB). Esto lo convierte en un caso de estudio interesante para investigación sobre modelos de difusión de vídeo pequeños, generalización composicional y evaluación con datos generados proceduralmente.

El repositorio incluye pesos en formato safetensors, código de definición del modelo y del muestreador, un notebook de Colab con demo web completa y una variante baseline (`r1/`) entrenada sobre la distribución natural de atributos, útil para comparaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de vídeo latente (diffusion transformer) con rectified flow |
| Parametros totales | 211,92 M (denoiser entrenado) |
| Parametros activos | 211,92 M (no es MoE) |
| Longitud de contexto | 35 tokens de prompt (codificador de texto Flan-T5-Base); 320 tokens de vídeo (parches 2 × 2) |
| Tipos de cuantizacion | fp32 (pesos publicados); entrenamiento con autocast bf16 |
| Idiomas soportados | Inglés (prompts) |
| Licencia | MIT (componentes congelados: Apache-2.0) |
| Formato de pesos | safetensors (`bhaav_e.safetensors`, pesos EMA, paso 40.000, fp32) |

## Arquitectura y entrenamiento

Bhaav-E es un diffusion transformer de vídeo que trabaja en el espacio latente del VAE de vídeo de Wan2.2 (48 canales latentes, congelado). El denoiser, único componente entrenado, consta de 16 bloques transformer con anchura 768, 12 cabezas de atención y parcheado 2 × 2, lo que produce 320 tokens por clip. La condicionalidad textual proviene de Flan-T5-Base congelado, con un máximo de 35 tokens por prompt. El muestreo se realiza con 50 pasos de Euler, classifier-free guidance de 3,0 y time shift de 5,0.

El entrenamiento usa rectified flow con pérdida MSE sobre la velocidad predicha. El conjunto de datos está compuesto por 85.816 clips renderizados proceduralmente (61.571 para entrenamiento), con efectos balanceados por sujeto. El vocabulario es cerrado: 30 sujetos (10 caras de emociones, 10 emojis animados, 10 animaciones de UI), 9 movimientos, 12 efectos y 12 colores de fondo. Se optimizó con Muon (lr 0,02) para las matrices de peso del transformer y AdamW (lr 2e-4) para el resto, con batch size 64 durante 40.000 pasos, en precisión bf16 autocast sobre una única NVIDIA RTX PRO 4500 de 32 GB durante aproximadamente 3,6 horas. El checkpoint `r1/` es una línea base entrenada sin el balanceo de efectos, incluida para comparación.

## Capacidades

- Generación de vídeo corto (2 segundos, 17 fotogramas, 256 × 256, 8 fps) en bucle perfecto a partir de prompts en inglés.
- Creación de stickers animados: emojis con emociones (llanto, furia, sorpresa, etc.), emojis animados (fiesta, gafas de sol, estrella) y animaciones de UI (checkmark de éxito, spinner de carga).
- Composición de atributos según el formato de prompt: *sujeto, movimiento, efecto, fondo* (30 sujetos × 9 movimientos × 12 efectos × 12 colores de fondo).
- Generalización composicional a combinaciones de atributos no vistas durante el entrenamiento (tasa de error del 3,3 % en combinaciones no vistas).
- No soporta fotografía realista, alta resolución, clips largos ni sujetos fuera del vocabulario de entrenamiento.
- No hay soporte de tool calling, agentes ni capacidades multimodales de entrada (solo texto a vídeo).

## Casos de uso

- **Stickers para aplicaciones de mensajería**: generación de GIF animados en bucle de 2 segundos listos para usar como stickers en apps tipo WhatsApp o Telegram, con control fino de emoción, movimiento, efecto y color de fondo.
- **Micro-animaciones de interfaz (UI)**: creación de elementos animados como spinners de carga o checkmarks de confirmación para interfaces web y móviles, evitando diseñarlos a mano.
- **Reacciones animadas en producto**: integración en plataformas con reacciones de usuario (emojis que lloran, celebran o muestran furia) generadas bajo demanda según el contexto.
- **Investigación en difusión de vídeo**: estudio de arquitecturas DiT pequeñas, rectified flow y escalado de modelos de vídeo, con un coste de entrenamiento reproducible (3,6 horas en una GPU).
- **Investigación en generalización composicional**: evaluación sistemática con combinaciones de atributos vistas y no vistas, gracias al protocolo de evaluación incluido con 512 prompts y comprobadores automáticos.
- **Prototipado rápido de assets animados**: generación de variaciones con seeds distintas para explorar estilos antes de producción, directamente desde Colab sin instalación local.
- **Educación y demos**: por su tamaño reducido (1,7 GB el repositorio), es adecuado para enseñar el funcionamiento interno de modelos de difusión de vídeo en cursos y talleres.

## Benchmarks y rendimiento

El modelo se evalúa con 256 prompts de combinaciones vistas en entrenamiento y 256 de combinaciones no vistas (held out). Comprobadores automáticos leen sujeto, movimiento, efecto, fondo y acento de cada clip generado; los errores solo se cuentan cuando el comprobador lee correctamente el clip real correspondiente. Se publica la tasa de error sobre cualquier atributo con guidance 3,0:

| Modelo | Combinaciones vistas | Combinaciones no vistas |
|---|---|---|
| **Bhaav-E** | **2,0 %** | **3,3 %** |
| Bhaav-E r1 (baseline) | 2,0 % | 5,3 % |

El modo de fallo dominante es la fuga de efecto (effect leakage): añadir el efecto más asociado a un sujeto cuando no se solicita. La diferencia entre Bhaav-E y la baseline en combinaciones no vistas no es estadísticamente significativa (test exacto de signos, p = 0,23). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), lo cual no aplica al tratarse de un modelo generativo de vídeo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; dado el tamaño del denoiser (211,92 M en fp32, unos 0,85 GB) más el VAE de Wan2.2 y Flan-T5-Base congelados, se estima que funciona con GPUs de menos de 8 GB de VRAM. La demo oficial se ejecuta en una GPU gratuita de Colab.
- **GPU recomendadas**: cualquier GPU moderna; el entrenamiento completo se realizó en una NVIDIA RTX PRO 4500 de 32 GB, y la inferencia cabe en GPUs de consumo como una RTX 3060 o superior. También funciona en CPU según el README (más lento).
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo de 8 GB o más; la demo de Colab corre en el tier gratuito.
- **Opciones de despliegue**: PyTorch con el código propio del repositorio (`videodit.py` y `sample.py`), notebook de Colab con demo Gradio (`gradio.live`), y clase `Bhaav` en Python que descarga automáticamente checkpoint, VAE y codificador de texto. No se menciona soporte nativo de vLLM, llama.cpp, Ollama ni TGI (no aplicable, no es un LLM).
- **Latencia y throughput**: no disponible; se conocen los parámetros de muestreo (50 pasos de Euler, CFG 3,0), lo que implica una generación de varios segundos por clip en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Bhaav-E** | 211,92 M (denoiser) | 17 frames, 256 × 256, 8 fps, bucle | Stickers animados, vocabulario cerrado | MIT | Pesos, código, Colab y demo públicos |
| Wan2.2-TI2V-5B (solo VAE usado por Bhaav-E) | 5 B | Vídeo de alta calidad, texto e imagen a vídeo | Vídeo generalista | Apache-2.0 | Pesos públicos en Hugging Face |
| AnimateDiff | ~1.700 M (base SD 1.5 + motion module) | Clips animados 512 × 512 | Animación de estilo sobre Stable Diffusion | Abierta (componentes SD) | Pesos y pipelines públicos en Diffusers |

Comparado con los modelos generalistas, Bhaav-E sacrifica amplitud (sin fotorrealismo, resolución limitada, vocabulario cerrado) a cambio de un coste de entrenamiento e inferencia mínimo, control composicional preciso dentro de su dominio y métricas de evaluación rigurosas. No hay datos de comparación directa de calidad visual publicados contra otros modelos.

## Limitaciones y advertencias

- **Vocabulario cerrado**: solo genera los 30 sujetos, 9 movimientos, 12 efectos y 12 colores de fondo del entrenamiento; cualquier prompt fuera de ese vocabulario producirá resultados impredecibles o erróneos.
- **Fuga de efecto**: el modo de fallo dominante es añadir el efecto más asociado a un sujeto aunque no se haya solicitado.
- **Resolución y duración limitadas**: 256 × 256, 17 fotogramas y 2 segundos; no apto para vídeo fotorrealista, alta resolución ni clips largos.
- **Idioma**: los prompts deben estar en inglés; no hay soporte multilingüe documentado.
- **Riesgo de alucinación de atributos**: como todo modelo de difusión, puede omitir o alterar atributos del prompt; el propio modelo lo cuantifica con una tasa de error del 2,0–3,3 % según el tipo de combinación.
- **Licencia**: MIT para el modelo entrenado, pero los componentes congelados (Wan2.2 VAE y Flan-T5-Base) están bajo Apache-2.0; conviene revisar ambas licencias en usos comerciales.
- **Madurez del proyecto**: con 46 descargas y 1 like en el momento de la ficha, es un proyecto de autor individual con comunidad mínima; no hay garantías de mantenimiento ni soporte a largo plazo.
- **Evaluación automática**: las métricas proceden de comprobadores automáticos sobre un dominio sintético; no miden calidad estética percibida por humanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohit5899/bhaav-e
- Demo (Space): https://huggingface.co/spaces/Mohit5899/bhaav-e
- Repositorio GitHub: https://github.com/Mohit-5899/bhaav-e
- Notebook de Colab: https://colab.research.google.com/github/Mohit-5899/bhaav-e/blob/main/bhaav_e_demo.ipynb
- Licencia MIT: https://github.com/Mohit-5899/bhaav-e/blob/main/LICENSE
- Codificador de texto (Flan-T5-Base): https://huggingface.co/google/flan-t5-base
- VAE de vídeo (Wan2.2-TI2V-5B-Diffusers): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Formato de prompts (GitHub README): https://github.com/Mohit-5899/bhaav-e#prompt-format
