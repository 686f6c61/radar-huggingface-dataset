# Pinkstack/LiliPixel-V1-190M

## Resumen

LiliPixel-V1-190M es un modelo de difusion de tipo transformer (DiT) entrenado desde cero por Pinkstack para generar arte pixelado y sprites a resoluciones nativas de 16x16, 32x32 y 64x64 píxeles. Con 190,58 millones de parámetros totales, se posiciona como una alternativa extremadamente ligera frente a los grandes modelos texto-a-imagen, sacrificando variedad y complejidad por velocidad, tamano reducido y especializacion en un dominio muy concreto: el pixel art con fondo transparente (RGBA) en las resoluciones menores.

El modelo utiliza una arquitectura de transformer de flujo rectificado (rectified flow matching) con atencion completa sobre una secuencia unica que mezcla tokens de texto e imagen (single-stream DiT). El texto se codifica mediante un encoder congelado, MongoDB/voyage-4-nano (~346M parámetros, descargado aparte), con un maximo de 96 tokens. Los pesos liberados son pesos EMA en BF16, con un peso total de repositorio de 0,8 GB y un requisito de memoria de aproximadamente 1 GB para inferencia sin perdida en BF16.

Su relevancia actual radica en dos factores: por un lado, demuestra que es posible entrenar un generador de pixel art funcional en una sola GPU de consumo (una RTX 4080 en 126 horas de GPU), y por otro, ofrece una licencia abierta (OpenMDW-1.1) con pesos compatibles con diffusers, lo que facilita su integracion en pipelines de generacion de assets para videojuegos, prototipado rapido y herramientas creativas de bajo coste. No compite en calidad fotorrealista ni en escenas complejas, sino en la produccion masiva y casi instantanea de sprites pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) single-stream con flow matching rectificado |
| Parametros totales | 190.580.500 (modelo de difusion); encoder de texto congelado de ~346M adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens de texto (prompts mas largos se truncan) |
| Tipos de cuantizacion | BF16 (entrenamiento e inferencia sin perdida); otras cuantizaciones no documentadas |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compatible con diffusers) |

Otros datos tecnicos: 24 capas, ancho 768, 16 cabezas de atencion. Patch size 1 para 16x16 y 32x32, patch size 2 para 64x64 (transformer compartido con capas patch-in/patch-out separadas). Salida RGBA con valores en [-1, 1] para 16x16 y 32x32; RGB opaco para 64x64. Sampler Euler con 30 pasos (50 para 64x64) y CFG 3.0 por defecto. Pipeline diffusers: `PixelArtDiTPipeline`.

## Arquitectura y entrenamiento

El modelo es un diffusion transformer de una sola corriente: los tokens de texto (proyectados desde el encoder congelado voyage-4-nano) y los tokens de imagen comparten una unica secuencia con self-attention completa. El objetivo de entrenamiento es rectified flow matching con timesteps de distribucion logit-normal y prediccion de velocidad. Se entreno desde cero durante 132.000 pasos con AdamW (LR pico 0,0001, decaimiento coseno, EMA 0,999); los pesos publicados son los EMA. Cada paso toma un lote de una unica fuente de datos con probabilidades de muestreo distintas y tamanos de lote de (128, 32, 32, 32) para (16x16, 32x32, 64x64 escenas, 64x64 LiliPixel-710K). Las leyendas se descartan aleatoriamente el 10% del tiempo para classifier-free guidance.

Los datos de entrenamiento provienen de cuatro fuentes: Angais/pixel-art-atlas-1.4m (16x16, CC0), azyg0s/pixelart-172k (32x32, MIT), Chan-Y/pixelart-308k (64x64 escenas, CC BY 4.0, imagenes sinteticas de FLUX.2-klein-4B con leyendas de Gemma, reducidas de 256x256 a 64x64 mediante downscaling inteligente con fusion de paleta y block voting) y Pinkstack/LiliPixel-710K-Flux-64pixelart (64x64 pixel art). Para todas las fuentes se anadio la frase `transparent background` a las leyendas de imagenes con al menos un 10% de pixeles transparentes; las imagenes de 64x64 nunca tuvieron transparencia. El entrenamiento completo se realizo en una sola RTX 4080 en BF16 durante 126 horas de GPU.

## Capacidades

- Generacion texto-a-imagen especializada en pixel art y sprites a 16x16, 32x32 y 64x64 píxeles nativos.
- Salida con canal alfa (RGBA) y fondo transparente en 16x16 y 32x32; salida RGB opaca en 64x64.
- Modo realismo en 64x64 activable anteponiendo `realistic photo,` al prompt.
- Generacion de escenas simples en 64x64 con composicion sujeto + accion + fondo de color.
- Soporte de classifier-free guidance con leyenda nula aprendida.
- No dispone de tool calling, function calling, capacidades de agente, vision de entrada, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles: el encoder de texto y las leyendas de entrenamiento estan en ingles.

## Casos de uso

- Generacion masiva de sprites para videojuegos 2D: el modelo produce assets de 16x16 y 32x32 con fondo transparente listos para importar en motores como Godot o Unity; su bajo coste computacional permite generar cientos de variantes por prompt y seleccionar las mejores.
- Prototipado rapido de assets en estudios indie: con ~1 GB de memoria y tiempos de generacion casi instantaneos (incluso en CPU), un disenador puede iterar sobre siluetas y paletas antes de encargar el arte final.
- Creacion de tilesets y elementos de escenario: los prompts de 64x64 con estructura `sujeto + accion + on <color> background` permiten generar escenas pequenas para mapas, menus o pantallas de carga.
- Herramientas creativas integradas en editores: al ser compatible con diffusers y requerir solo BF16, puede embeberse en plugins de Aseprite, Krita o aplicaciones web con backend GPU modesto.
- Generacion de iconos y avatares pixelados: los sprites de 32x32 con transparencia sirven para avatares de usuario, iconos de inventario o badges en comunidades y foros.
- Aumento de datasets de pixel art: el modelo puede usarse para generar variaciones sinteticas que amplien corpus de entrenamiento para otros clasificadores o detectores de estilo pixel art.
- Docencia y experimentacion en difusion: su tamano contenido y su entrenamiento reproducible en una GPU de consumo lo convierten en un caso de estudio accesible para cursos sobre modelos generativos y flow matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en BF16 (sin contar el encoder de texto voyage-4-nano, que se descarga aparte y anade su propio consumo).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entreno el modelo en una RTX 4080, pero la inferencia cabe en GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.).
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; tambien es viable en CPU con latencias mayores pero funcionales.
- Opciones de despliegue: diffusers con `custom_pipeline="Pinkstack/LiliPixel-V1-190M"` y `trust_remote_code=True` (requiere transformers>=4.56 y conexion a internet en la primera carga para descargar el encoder de texto). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no se proporcionan cifras exactas; el autor indica que la generacion es "casi instantanea" en GPU e incluso en CPU, y recomienda generar lotes de 4 a 16 imagenes por prompt para seleccionar la mejor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiliPixel-V1-190M | 190M (difusion) + ~346M encoder | 96 tokens | 16x16, 32x32, 64x64 | OpenMDW-1.1 | Hugging Face, diffusers |
| Stable Diffusion 1.5 | ~860M UNet + ~123M CLIP | 77 tokens | 512x512 (no nativo pixel art) | CreativeML OpenRAIL-M | Amplia, ecosistema maduro |
| PixArt-alpha | ~610M | 120 tokens | 512x512 | OpenRAIL++-M | Hugging Face, diffusers |
| PixelArt-Diffusion (referencia generica) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa es limitada porque la mayoria de modelos texto-a-imagen generalistas no generan pixel art nativo a 16x16 ni salidas RGBA con transparencia; LiliPixel ocupa un nicho especifico con un coste computacional orders of magnitude menor que SD 1.5 o PixArt-alpha, a cambio de menor variedad y complejidad de escenas. No se dispone de datos de benchmarks que permitan comparar calidad objetivamente.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos limitado y solo 190M de parametros: no genera escenas complejas ni objetos de nicho; el autor recomienda describir conceptos con lenguaje generico (por ejemplo, "cute light blue colored shark plushy" en lugar de "Blahaj").
- En modo 64x64 la probabilidad de alucinar sujetos es mayor; se recomienda generar lotes de 8 a 16 imagenes y seleccionar la mejor.
- Los prompts mas largos de 96 tokens se truncan; las leyendas excesivamente largas o rebuscadas funcionan peor.
- La transparencia solo esta soportada en 16x16 y 32x32; las salidas de 64x64 son RGB opacas y no deben usarse para fondos transparentes.
- Idioma limitado al ingles: prompts en castellano u otros idiomas no estan soportados de forma fiable.
- Riesgo de sesgos derivado de los datasets de entrenamiento (pixel art de fuentes diversas, imagenes sinteticas de FLUX.2-klein-4B): no se documenta una auditoria de sesgos.
- Licencia OpenMDW-1.1: conviene revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva tipo MIT o Apache 2.0.
- Requiere `trust_remote_code=True` y ejecucion de codigo personalizado del autor para el encoder de texto, lo que implica un riesgo de seguridad a evaluar en entornos de produccion.
- Dependencia de un encoder de texto externo (MongoDB/voyage-4-nano) no incluido en los pesos, con su propia licencia y requisitos de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pinkstack/LiliPixel-V1-190M
- Encoder de texto: https://huggingface.co/MongoDB/voyage-4-nano
- Dataset 16x16: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Dataset 32x32: https://huggingface.co/datasets/azyg0s/pixelart-172k
- Dataset 64x64 escenas: https://huggingface.co/datasets/Chan-Y/pixelart-308k
- Dataset 64x64 pixel art: https://huggingface.co/datasets/Pinkstack/LiliPixel-710K-Flux-64pixelart
