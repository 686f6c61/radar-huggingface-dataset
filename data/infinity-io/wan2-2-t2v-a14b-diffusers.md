# Infinity-io/Wan2.2-T2V-A14B-Diffusers

## Resumen

Wan2.2-T2V-A14B es un modelo de difusión texto-a-vídeo desarrollado por el equipo Wan (Wan-AI, vinculado a Alibaba) y redistribuido en este repositorio por Infinity-io en formato Diffusers. Se trata de la variante Text-to-Video de la familia Wan2.2, presentada en julio de 2025, que introduce una arquitectura de mezcla de expertos (MoE) en el dominio de la difusión de vídeo: separa el proceso de eliminación de ruido en distintos tramos temporales, cada uno atendido por un experto especializado, lo que amplía la capacidad total del modelo sin incrementar el coste computacional por paso.

El modelo genera clips de 5 segundos en resoluciones de 480P y 720P y, según la model card, supera a los principales modelos comerciales en la mayoría de dimensiones de evaluación del benchmark propietario Wan-Bench 2.0. Frente a Wan2.1, se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos, y añade datos estéticos etiquetados (iluminación, composición, contraste, tono de color) para un control más fino del estilo cinematográfico.

Es relevante ahora porque combina una licencia Apache 2.0 con un rendimiento que el autor sitúa a la altura de modelos cerrados en generación de vídeo, y porque su integración en Diffusers, ComfyUI y ModelScope facilita su adopción tanto en investigación como en producción. El repositorio redistribuido contiene pesos en safetensors con 14.288.491.584 parámetros totales y un tamaño aproximado de 126,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión para vídeo con Mixture-of-Experts (MoE) por tramos temporales del proceso de denoising |
| Parámetros totales | 14.288.491.584 (14,29 B) |
| Parámetros activos | no disponible (el autor no publica el reparto exacto por experto) |
| Longitud de contexto | no disponible (genera clips de 5 s; sin ventana de contexto de texto especificada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el ecosistema Diffusers permite cuantizaciones de la comunidad, no documentadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (integración Diffusers, `WanPipeline`) |

## Arquitectura y entrenamiento

Wan2.2-T2V-A14B es un modelo de difusión para generación de vídeo que incorpora una arquitectura MoE específica para el proceso de denoising: en lugar de un único denoiser que cubre todos los niveles de ruido, el modelo divide el proceso por tramos temporales y asigna a cada tramo un experto especializado. Este diseño, según el autor, aumenta la capacidad global del modelo manteniendo el mismo coste computacional por paso de inferencia, ya que solo se activa el experto correspondiente al tramo de timestep en curso. La variante A14B corresponde a esta configuración MoE; la familia incluye además un modelo denso de 14B y un modelo híbrido TI2V de 5B con un VAE de alta compresión (16×16×4) capaz de generar 720P a 24 fps en GPUs de consumo como la RTX 4090.

En cuanto a datos, el autor indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora un corpus estético curado con etiquetas detalladas de iluminación, composición, contraste y tono de color. No se especifica en la información disponible el número exacto de tokens o clips de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; la innovación destacada por el autor es la propia arquitectura MoE aplicada a difusión de vídeo y el control estético etiquetado.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en resoluciones de 480P y 720P.
- Producción de clips de 5 segundos de duración.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1 gracias al mayor volumen de datos de entrenamiento.
- Control de estética cinematográfica: el modelo responde a etiquetas de iluminación, composición, contraste y tono de color para estilos personalizables.
- Integración con Diffusers mediante `WanPipeline`, lo que habilita su uso programático en Python.
- Integración con ComfyUI para flujos de trabajo basados en nodos.
- Soporte de inferencia multi-GPU en el código oficial del repositorio Wan2.2.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio ni thinking mode, dado que es un modelo generativo de vídeo y no un modelo de lenguaje.

## Casos de uso

- Generación de vídeo publicitario: el modelo produce clips de 5 s en 720P con control de iluminación y tono de color, adecuado para prototipos rápidos de anuncios antes de una producción final con herramientas tradicionales.
- Previsualización de storyboards: un equipo de cine o animación puede convertir descripciones textuales de escenas en vídeo para validar composición y ritmo antes de rodar, aprovechando las etiquetas estéticas para aproximar el look deseado.
- Creación de contenido para redes sociales: generación automatizada de clips cortos de 5 s a 480P o 720P para plataformas que consumen vídeo vertical u horizontal, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Material de stock sintético: estudios y agencias pueden generar bibliotecas de clips de movimiento y semántica diversa sin depender de licencias de terceros, gracias a que los pesos son abiertos.
- Investigación en generación de vídeo: el modelo sirve como base para experimentos de destilación, fine-tuning o evaluación comparativa, al estar disponible en Diffusers y con código de inferencia multi-GPU.
- Prototipado en ComfyUI: diseñadores sin perfil de programación pueden encadenar nodos para iterar prompts y parámetros estéticos y obtener vídeos de prueba en un entorno visual.
- Evaluación de pipelines de difusión: equipos de infraestructura pueden usar el modelo para medir throughput y latencia de despliegues con `WanPipeline` en clústeres multi-GPU antes de escalar a producción.

## Benchmarks y rendimiento

El autor menciona que, en su benchmark propietario Wan-Bench 2.0, el modelo supera a los principales modelos comerciales en la mayoría de dimensiones clave de evaluación. Sin embargo, no se proporcionan en la información disponible cifras numéricas concretas (MMLU, HumanEval, GSM8K u otras métricas de vídeo como FVD, CLIP-score o VBench) que permitan una comparación cuantitativa.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 14,29 B parámetros en safetensors (aproximadamente 28,6 GB en fp16 solo para pesos), se requiere al menos una GPU de 40 GB para una ejecución básica en precisión completa, y más para el VAE y los buffers de difusión.
- GPU recomendadas: el repositorio oficial incluye código de inferencia multi-GPU para el modelo A14B, lo que sugiere despliegues en A100 (40/80 GB) o H100. No se documentan requisitos mínimos oficiales.
- ¿Cabe en GPU de consumo? El autor indica que el modelo TI2V-5B de la familia sí cabe en una RTX 4090, pero no afirma lo mismo para el T2V-A14B; para este último no hay confirmación en la información disponible.
- Opciones de despliegue: Diffusers (`WanPipeline`), ComfyUI y el repositorio oficial Wan2.2 con scripts de inferencia multi-GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / duración | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B (este) | 14,29 B (MoE) | 480P y 720P, clips de 5 s | no aplica | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | 5 B (denso, VAE 16×16×4) | 720P a 24 fps | no aplica | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.1 | no disponible en la información | no disponible en la información | no aplica | no disponible en la información | Hugging Face (Wan-AI) |
| Modelos comerciales de vídeo | no disponible | no disponible | no aplica | propietaria | APIs cerradas |

La información disponible solo permite comparar dentro de la familia Wan2.2: el T2V-A14B es la variante MoE de mayor capacidad para texto-a-vídeo, mientras que el TI2V-5B prioriza eficiencia y cabe en GPUs de consumo. No se dispone de datos cuantitativos para comparar con alternativas externas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de representación, pero el autor no los detalla.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir movimientos físicamente inconsistentes, artefactos temporales o contenido que no se corresponde con el prompt, especialmente en escenas complejas.
- Limitación de duración: los clips generados son de 5 segundos, lo que restringe casos de uso que requieran secuencias más largas sin concatenación o extensión externa.
- Idiomas: no se especifica qué idiomas de prompt soporta; la ausencia de datos impide garantizar un rendimiento multilingüe uniforme.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y de los componentes auxiliares (VAE, text encoder) distribuidos junto al modelo.
- Requisitos de hardware elevados: con 14,29 B parámetros y un repositorio de 126,2 GB, el despliegue en producción exige infraestructura multi-GPU; no es apto para entornos de un solo acelerador de consumo sin cuantización agresiva no documentada.
- Repositorio redistribuido: este repositorio concreto (Infinity-io) tiene 0 descargas y 0 likes en el momento de la consulta; para producción se recomienda contrastar con el repositorio oficial Wan-AI/Wan2.2-T2V-A14B.
- Ausencia de benchmarks numéricos públicos en la información disponible: las afirmaciones de superioridad frente a modelos comerciales se basan en el benchmark propietario Wan-Bench 2.0 y no son verificables de forma independiente con los datos aportados.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/Infinity-io/Wan2.2-T2V-A14B-Diffusers
- Repositorio oficial del modelo T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Repositorio GitHub de Wan2.1: https://github.com/Wan-Video/Wan2.1
- Informe técnico (arXiv 2503.20314): https://arxiv.org/abs/2503.20314
- Blog oficial de Wan: https://wan.video/welcome
- Sitio oficial: https://wan.video
- Discord del proyecto: https://discord.gg/AKNgpMK4Yj
