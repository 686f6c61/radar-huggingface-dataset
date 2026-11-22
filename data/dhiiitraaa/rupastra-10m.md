# dhiiitraaa/rupastra-10M

## Resumen

RUPASTRA Text-to-Image 10M es un modelo generativo de texto a imagen de tamano muy reducido (10.234.624 parametros, aproximadamente 10,23 millones) desarrollado por el usuario dhiiitraaa y publicado bajo licencia Apache 2.0. Su proposito es generar personajes de estilo pixel art inspirados en la coleccion Nouns a partir de descripciones textuales, con una resolucion de salida fija de 128×128 pixeles RGB. El modelo se entrena desde cero (trained from scratch) sobre el dataset `m1guelpf/nouns` y no parte de un backbone preentrenado de gran escala.

La relevancia del modelo es fundamentalmente experimental: explora hasta que punto una arquitectura transformer autoregresiva muy compacta puede condicionar la generacion de imagenes a partir de texto. Incorpora componentes poco habituales en modelos de este tamano, como Grouped Query Dual-Attention (GQDA), RoPE-2D multimodal, decodificacion espacial por parches 2×2 y weight tying de embeddings. La generacion de imagen se realiza de forma autoregresiva sobre tokens latentes de un VQ-VAE, no mediante difusion.

Se trata de un modelo de nicho, orientado a investigacion y experimentacion con generacion autoregresiva de imagenes, no a produccion generalista. Su vocabulario de texto es un BPE personalizado de solo 828 tokens con longitud maxima de 64, lo que limita drasticamente la expresividad de los prompts. La model card esta redactada en indonesio e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GQDATextToImageForConditionalGeneration` (transformer autoregresivo custom con GQDA) |
| Parametros totales | 10.234.624 (~10,23 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de texto (max length del tokenizer BPE); 256 pasos autoregresivos de imagen |
| Tipos de cuantizacion | no disponible (pesos en safetensors; tamano ~40 MB, cuantizacion a FP16/INT8 tecnicamente viable pero no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~40 MB) |

Especificaciones adicionales del backbone:

| Componente | Configuracion |
|---|---|
| Capas del backbone | 8 |
| Dimension del modelo (d_model) | 288 |
| Cabezas Q / KV | 8 Q heads / 2 KV heads |
| Dimension FFN | 768 (SwiGLU) |
| Spatial patch decoding | 2×2 latent patches (16×16 = 256 pasos autoregresivos → 32×32 = 1.024 tokens) |
| Decoder de imagen (VQ-VAE) | `CompVis/ldm-super-resolution-4x-openimages` (subfolder `vqvae`, codebook de 8.192) |
| Tokenizer de texto | BPE custom, vocabulario 828, max length 64 |
| Resolucion de salida | 128×128 RGB |
| Dataset de entrenamiento | `m1guelpf/nouns` |
| Entrenamiento | 12 epochs, 9.348 pasos, CFG dropout 0.1 |
| Loss final | train 1.1018, eval 0.9337 |

## Arquitectura y entrenamiento

RUPASTRA es un transformer autoregresivo de 8 capas con d_model 288 y FFN de 768 con activacion SwiGLU. La atencion utiliza Grouped Query Dual-Attention (GQDA), con 8 cabezas de query y 2 cabezas de clave/valor, lo que reduce el coste de atencion respecto a multi-head attention clasica. La posicion se codifica mediante RoPE-2D multimodal, que aplica rotaciones bidimensionales tanto a los tokens de texto como a los latentes espaciales de imagen, permitiendo modelar la estructura 2D de la rejilla latente. El modelo emplea weight tying entre los embeddings de entrada y la cabeza de salida.

La generacion de imagen es autoregresiva sobre tokens latentes: el modelo predice 256 pasos (16×16 parches latentes) que se decodifican mediante un VQ-VAE preentrenado (`CompVis/ldm-super-resolution-4x-openimages`) con codebook de 8.192 entradas, y un decodificador de parches 2×2 que expande la rejilla latente de 16×16 a 32×32 tokens, produciendo finalmente imagenes de 128×128 RGB. El entrenamiento se realizo desde cero durante 12 epochs (9.348 pasos) sobre el dataset `m1guelpf/nouns`, con Classifier-Free Guidance dropout de 0.1. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de imagenes pixel art de personajes estilo Nouns a partir de descripciones textuales en ingles.
- Condicionamiento por texto limitado a combinaciones de atributos: forma de cabeza, color de cuerpo y tipo de fondo (segun los ejemplos de la model card).
- Generacion autoregresiva de imagenes de 128×128 RGB.
- Soporte de Classifier-Free Guidance (CFG) durante la inferencia, gracias al dropout de CFG aplicado en entrenamiento.
- Capacidad multilingue: no disponible; solo ingles.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportado.
- Vision, audio, thinking mode: no soportado (es un modelo de generacion, no multimodal de entrada).

## Casos de uso

- Generacion de avatares pixel art para prototipos de juegos o aplicaciones web: el modelo produce personajes de 128×128 con estilo Nouns a partir de prompts cortos como "cat-shaped head, red-colored body, warm background", adecuado para assets placeholder o demos.
- Investigacion en generacion autoregresiva de imagenes de bajo coste: sirve como banco de pruebas para estudiar GQDA, RoPE-2D y decodificacion por parches en un modelo de 10 M de parametros que cabe en cualquier GPU consumer.
- Docencia y divulgacion: su tamano (~40 MB) y su loss documentada lo convierten en un ejemplo didactico de pipeline completo texto→latente→VQ-VAE→imagen.
- Generacion de datasets sinteticos de pixel art: util para aumentar datos en tareas de clasificacion o deteccion de sprites con estilos controlados por atributos.
- Experimentacion con weight tying y tokenizers BPE reducidos: permite medir el impacto de un vocabulario de 828 tokens en la calidad del condicionamiento textual.
- Pruebas de integracion con `transformers` y `custom_code`: valida flujos de carga de arquitecturas custom con `trust_remote_code` en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la loss de entrenamiento (1.1018) y de evaluacion (0.9337), que no son comparables con metricas estandar como FID, CLIP score o MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (pesos ~40 MB) mas el VQ-VAE decodificador (`CompVis/ldm-super-resolution-4x-openimages`), que anade unos cientos de MB; en la practica, menos de 2 GB en total.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM; tambien viable en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (arquitectura custom `GQDATextToImageForConditionalGeneration`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo y los 256 pasos autoregresivos, la latencia estara dominada por el bucle de decodificacion secuencial y el decodificador VQ-VAE.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. A continuacion se compara a nivel estructural con alternativas conocidas de la misma categoria (generacion texto→imagen compacta), indicando "no disponible" donde no hay datos verificables.

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Benchmarks |
|---|---|---|---|---|---|
| RUPASTRA 10M | 10,23 M | 64 tokens texto; 128×128 | Autoregresivo sobre latentes VQ-VAE | Apache 2.0 | no disponible |
| Stable Diffusion 1.5 | ~860 M (UNet) | 77 tokens; 512×512 | Difusion latente | CreativeML OpenRAIL-M | no comparable en esta ficha |
| DALL·E mini (Craiyon) | ~1,5 B (aprox.) | 64-256 tokens; 256×256 | Autoregresivo (VQGAN) | Apache 2.0 / MIT (segun version) | no disponible |
| Pixelart difusion (modelos comunitarios) | variable | variable | Difusion | variable | no disponible |

La comparativa es estructural: RUPASTRA es dos ordenes de magnitud menor que Stable Diffusion 1.5 y opera a una resolucion muy inferior, por lo que no es directamente comparable en calidad de imagen.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo genera personajes pixel art estilo Nouns; no produce imagenes fotorrealistas ni escenas complejas.
- Tokenizer BPE de solo 828 tokens y max length 64: los prompts deben ser muy cortos y en ingles; fuera de ese vocabulario la calidad cae drasticamente.
- Resolucion fija de 128×128 RGB; no hay soporte documentado para otras resoluciones.
- Riesgo de alucinacion visual: al ser un modelo autoregresivo pequeno, puede generar combinaciones de atributos incoherentes o ignorar partes del prompt.
- Sesgos: heredados del dataset `m1guelpf/nouns`, que contiene una distribucion concreta de formas, colores y fondos; el modelo reproducira esos sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el decodificador VQ-VAE (`CompVis/ldm-super-resolution-4x-openimages`) tiene su propia licencia que debe verificarse por separado.
- Requiere `trust_remote_code=True` por la arquitectura custom, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (FID, CLIP score) que respalde su uso en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario practicamente nulos.

## Enlaces

- Hugging Face: https://huggingface.co/dhiiitraaa/rupastra-10M
- Dataset de entrenamiento: https://huggingface.co/datasets/m1guelpf/nouns
- Decodificador VQ-VAE: https://huggingface.co/CompVis/ldm-super-resolution-4x-openimages
- Repositorio de `transformers` (carga con `trust_remote_code`): https://github.com/huggingface/transformers
