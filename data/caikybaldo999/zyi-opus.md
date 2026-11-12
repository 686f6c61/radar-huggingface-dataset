# caikybaldo999/zyi-opus

## Resumen

ZYI-Opus es un modelo de generacion de imagenes a partir de texto (text-to-image) de 282 millones de parametros, desarrollado por el usuario caikybaldo999 y publicado en Hugging Face bajo licencia MIT. Se trata de un Diffusion Transformer (DiT) entrenado desde cero con un objetivo de rectified flow, es decir, sin partir de pesos preentrenados de otro modelo generativo. El modelo produce imagenes cuadradas de 256x256 pixeles condicionadas por texto mediante un codificador CLIP congelado.

La relevancia de ZYI-Opus no reside en su calidad final, sino en su economia de medios: el autor documenta un coste total de aproximadamente 15 dolares estadounidenses de computo en Modal (unos 13,06 dolares segun el desglose por etapas), con 81 minutos de entrenamiento en una unica GPU NVIDIA H100 de 80 GB. Esto lo convierte en un caso de estudio util para investigadores que quieran entender que se puede conseguir con un presupuesto minimo y un pipeline completo de difusion desde cero.

El modelo emplea un backbone denominado ZYIDiT-medium con 16 bloques, anchura 1024 y 16 cabezas de atencion, junto con un VAE congelado de SANA (AutoencoderDC) y el text encoder CLIP ViT-L/14. Esta pensado exclusivamente para investigacion y uso no comercial segun las limitaciones declaradas por el autor, a pesar de que la licencia del repositorio figure como MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con objetivo rectified flow |
| Parametros totales | 282 M (backbone ZYIDiT-medium) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (limite del codificador CLIP ViT-L/14) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (condicionado por CLIP ViT-L/14, predominantemente ingles) |
| Licencia | MIT (repositorio); el autor restringe el uso a investigacion y no comercial |
| Formato de pesos | safetensors (`zyi_opus_ema.safetensors`, `latent_stats.safetensors`) |
| Resolucion de salida | 256x256, imagenes cuadradas |
| Tamano del repositorio | 1,1 GB |
| VAE | `mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers` (congelado) |
| Text encoder | `openai/clip-vit-large-patch14` (congelado) |

## Arquitectura y entrenamiento

El backbone ZYIDiT-medium es un transformer de 16 bloques con anchura 1024 y 16 cabezas de atencion, que incorpora SwiGLU en las capas feed-forward, QK-RMSNorm, modulacion adaLN-single y atencion cruzada hacia los estados ocultos de CLIP. El VAE de SANA comprime la imagen de 256x256 a un latente de 32x8x8, y el text encoder CLIP ViT-L/14 aporta 77 estados ocultos mas una proyeccion pooled. Tanto VAE como text encoder estan congelados; solo se entrena el backbone, inicializado de forma aleatoria.

El entrenamiento uso 889.296 pares imagen-texto extraidos de 24 de los 47 shards de `data_512_2M` del dataset `jackyhate/text-to-image-2M` (MIT), que mezcla fotografias reales re-captionadas con Qwen2-VL, imagenes generadas con DALL-E 3 e imagenes de FLUX-dev. Se filtraron captions con exceso de texto, documentos y pixel art, y se eliminaron duplicados por caption y por hash de imagen. El objetivo es rectified flow con prediccion de velocidad (`v = noise - x0`) y timesteps muestreados de una logit-normal(0,1), con un 10% de caption dropout para habilitar classifier-free guidance y un 30% de captions truncados a la primera frase.

La optimizacion empleo AdamW con learning rate 3e-4, betas (0,9; 0,95), weight decay 0,01, batch global de 1024, autocast en bf16, `torch.compile`, EMA 0,9995 y un schedule warmup-stable-decay con decaimiento lineal en el ultimo 30% del presupuesto. El entrenamiento se ejecuto en una H100 de 80 GB durante 81 minutos, con 11.688 pasos del optimizador, lo que equivale a aproximadamente 12,0 millones de imagenes vistas (unas 13,5 epocas).

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, a resolucion fija de 256x256.
- Condicionamiento por prompt mediante CLIP ViT-L/14 con classifier-free guidance (CFG) configurable (el ejemplo usa CFG 5).
- Muestreo con sampler Euler y numero de pasos ajustable (el ejemplo usa 50 pasos, con parametro `shift`).
- Reproducibilidad mediante semilla fija (seed 42 en los ejemplos).
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta vision de entrada, audio ni modo thinking.
- Capacidad multilingue limitada por el codificador CLIP; el autor no declara idiomas soportados.

## Casos de uso

- Investigacion sobre entrenamiento de difusion desde cero: sirve como referencia reproducible para estudiar el efecto del presupuesto de computo, el schedule de learning rate y el objetivo rectified flow en un DiT pequeno, dado que el autor publica curvas de perdida y el log de costes por etapa.
- Docencia y formacion en generacion de imagenes: el bajo coste (unos 15 dolares) y el codigo abierto (`model.py` y `sampler.py`) permiten montar practicas completas de entrenamiento e inferencia en una sola GPU.
- Prototipado rapido de pipelines text-to-image: util para validar infraestructura de inferencia (carga de safetensors, VAE, text encoder, sampler) antes de escalar a modelos mayores.
- Generacion de bocetos e ideas visuales de baja fidelidad: las imagenes son reconocibles y siguen la composicion y el color del prompt, por lo que sirven para exploracion conceptual, no para produccion final.
- Benchmark de referencia para modelos diminutos: al ser un DiT de 282 M con contexto de 77 tokens, es un punto de comparacion util para medir tecnicas de eficiencia (EMA, torch.compile, bf16) en entornos academicos.
- Estudio de sesgos en datos sinteticos: al mezclar fotos reales con imagenes de DALL-E 3 y FLUX-dev, permite analizar como se propagan estilos y sesgos de generadores previos en un modelo entrenado desde cero.
- Experimentacion con VAE de SANA y CLIP congelados: util para evaluar el impacto del compresor latente 32x8x8 en la calidad final con un backbone propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta la curva de perdida (`loss_curve.png`) y una rejilla de 20 prompts fijos evaluados con seed 42, CFG 5 y Euler 50 pasos, sin metricas cuantitativas como FID, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 282 M parametros en bf16 ocupa aproximadamente 0,6 GB; sumando el VAE de SANA y CLIP ViT-L/14 congelados, el conjunto cabe holgadamente en GPUs consumer con 8 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). El entrenamiento documentado se realizo en una NVIDIA H100 de 80 GB.
- Cabe en GPU consumer: si, en tarjetas de gama media como RTX 3060/4060 y superiores.
- Opciones de despliegue: el autor proporciona codigo Python propio (`model.py`, `sampler.py`) basado en `diffusers` (`AutoencoderDC`) y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM).
- Latencia y throughput estimados: no disponibles. El autor solo menciona 0,07 dolares de coste de muestreo en Modal, sin cifras de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Resolucion | Licencia | Notas |
|---|---|---|---|---|---|
| ZYI-Opus | 282 M | 77 tokens (CLIP ViT-L/14) | 256x256 | MIT (uso no comercial segun autor) | Entrenado desde cero, coste ~15 USD |
| SANA (mit-han-lab) | no disponible en la informacion | no disponible | hasta 1024x1024 en sus variantes | no disponible en la informacion | Fuente del VAE usado por ZYI-Opus; no se dispone de datos comparativos aqui |
| Stable Diffusion 1.5 | no disponible en la informacion | 77 tokens (CLIP) | 512x512 | no disponible en la informacion | Referencia habitual de text-to-image de bajo coste; no se dispone de datos verificados en esta ficha |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenado con aproximadamente 1/1000 del computo de modelos de produccion: los objetos y escenas son reconocibles y siguen el prompt en color y composicion, pero el detalle fino (caras, manos, texto, objetos pequenos) suele aparecer deformado.
- Resolucion fija de 256x256 y formato cuadrado; no soporta otras resoluciones ni aspect ratios.
- El limite de 77 tokens del codificador CLIP provoca comprension composicional debil: conteo, relaciones espaciales y binding de atributos funcionan mal.
- Mezcla de fotos reales con imagenes sinteticas de DALL-E 3 y FLUX-dev, por lo que hereda sus sesgos y estilos.
- Riesgo de alucinacion visual: el modelo puede generar elementos no solicitados o interpretar incorrectamente el prompt.
- Idiomas soportados no declarados; el condicionamiento efectivo es probablemente en ingles por el uso de CLIP ViT-L/14.
- Aunque el repositorio figura con licencia MIT, el autor indica que los datos y el modelo son para investigacion y uso no comercial; conviene verificar la compatibilidad antes de cualquier despliegue comercial.
- Sin datos publicados de FID, CLIP score ni evaluaciones humanas, por lo que la calidad no puede compararse de forma objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/zyi-opus
- Repositorio de codigo: GitHub `Zylun-AI/zyi-opus` (referenciado en la model card; URL completa no disponible en la informacion proporcionada)
- Dataset de entrenamiento: https://huggingface.co/datasets/jackyhate/text-to-image-2M
- VAE: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.1-diffusers
- Text encoder: https://huggingface.co/openai/clip-vit-large-patch14
