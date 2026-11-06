# hkblockchaintechnology/t-station-style-lora

## Resumen

T Station Style es un adaptador LoRA de estilo para Stable Diffusion XL, publicado por hkblockchaintechnology. No es un modelo generativo completo, sino un conjunto de pesos de bajo rango (rank 16, aproximadamente 23 millones de parametros entrenables) que se acoplan al UNet de `stabilityai/stable-diffusion-xl-base-1.0` para inducir una estetica concreta: arte vectorial plano de inspiracion art-deco en rojo carmesi y dorado ambar sobre carbon calido. El adaptador esta pensado para generar iconos y losetas de tablero con claridad de icono de aplicacion.

El modelo resuelve un problema acotado de consistencia visual: fijar una paleta y un lenguaje grafico determinados sin necesidad de reentrenar el modelo base ni de describir el estilo en cada prompt. Es relevante para equipos que producen contenido grafico derivado de una identidad visual propia (en este caso, el juego de mesa hongkones T Station · Time Playground v1.2) y quieren automatizar la generacion de variaciones coherentes.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face. El repositorio ocupa 0,1 GB, no registra descargas ni likes en el momento de la consulta y se distribuye bajo licencia OpenRAIL++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre UNet de Stable Diffusion XL; difusion latente |
| Parametros totales | no disponible (adaptador de ~23 M de parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (los prompts se procesan con los text encoders del SDXL base) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 aplicado sobre las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0` de los bloques de atencion del UNet de SDXL. El modelo base permanece congelado y el VAE se mantiene en fp32 durante el entrenamiento; el adaptador se entrena en fp32. El objetivo de difusion es el epsilon de DDPM.

El conjunto de entrenamiento son 43 imagenes del art pack v1.2 del juego, con captions redactadas a partir de los prompts de generacion originales. Se entreno a 768 × 768 con volteo horizontal aleatorio, 900 pasos, batch de 1, AdamW con learning rate 1e-4 y grad-clip 1.0, sobre una unica NVIDIA RTX PRO 6000 Blackwell con un coste aproximado de 8 segundos por cada 25 pasos. Todas las imagenes de entrenamiento son generadas por IA, de modo que no hay material de terceros en el dataset. El script de entrenamiento esta en `tools/train_lora.py` del repositorio `hkblockchaintechnology/time-playground-v1.1-assets`.

## Capacidades

- Generacion de imagenes text-to-image condicionada por un estilo fijo: paleta rojo carmesi y dorado ambar sobre carbon calido, con acabado vectorial plano art-deco.
- Produccion de iconos y losetas de tablero con "claridad de icono de aplicacion", segun la model card.
- Transferencia de estilo mediante frase disparadora: "crimson red and amber gold ... flat vector art on warm charcoal", presente en todas las captions de entrenamiento.
- Integracion con el pipeline de `diffusers` mediante `load_lora_weights`, combinable con el scheduler DPMSolverMultistep.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es exclusivamente un adaptador de imagen.
- Capacidades multilingues: no documentadas; dependen de los text encoders del SDXL base y no se especifican en la model card.

## Casos de uso

- Generacion de losetas e iconos para prototipado de juegos de mesa: el adaptador produce iconos vectoriales planos con la paleta del juego, lo que permite iterar sobre componentes (fichas, cartas, marcadores) manteniendo coherencia visual sin redibujar cada pieza.
- Creacion de assets de marketing derivados de la identidad de T Station: banners, ilustraciones de redes sociales y material promocional con el mismo lenguaje grafico, usando la frase disparadora para fijar el estilo.
- Exploracion de variaciones de paleta y composicion: al ser un LoRA de bajo rango, se puede combinar con otros adaptadores o ajustar el peso de carga para graduar la intensidad del estilo, util para generar alternativas de direccion de arte.
- Generacion de iconografia para interfaces de aplicacion: la model card enfatiza la "app-icon clarity", adecuada para producir sets de iconos consistentes en color y trazo para una app o web.
- Prototipado rapido de arte conceptual en estudios pequenos: con 43 imagenes y 900 pasos de entrenamiento, el coste de replicar o adaptar el flujo a otra identidad visual es bajo, lo que lo convierte en una plantilla metodologica para LoRAs de estilo corporativo.
- Produccion de material grafico interno para el juego Time Playground v1.2: ilustraciones de ambientacion, fondos y elementos decorativos coherentes con el art pack existente.
- Experimentacion en investigacion sobre LoRA de estilo: el caso documenta un entrenamiento reproducible (rank, alpha, targets, hiperparametros y hardware) util como referencia para estudiar la transferencia de paleta y lenguaje grafico con datasets muy pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud estetica) ni comparaciones con otros adaptadores de estilo.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa una fraccion minima (repositorio de 0,1 GB); el consumo lo determina el SDXL base. En fp16, SDXL requiere del orden de 8-10 GB de VRAM para inferencia a 1024 × 1024, y algo menos a 768 × 768, que es la resolucion de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para SDXL en fp16; el entrenamiento documentado uso una NVIDIA RTX PRO 6000 Blackwell.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) usando fp16; con menos VRAM puede requerir offloading o cuantizacion del modelo base.
- Opciones de despliegue: `diffusers` (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), ComfyUI y Automatic1111/Forge mediante carga de LoRA; el formato safetensors es compatible con los cargadores habituales de PEFT.
- Latencia y throughput: la model card indica aproximadamente 8 segundos por cada 25 pasos durante el entrenamiento en una RTX PRO 6000 Blackwell; no se documentan cifras de inferencia ni throughput en produccion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, se compara con alternativas genericas de la misma categoria (adaptadores de estilo para SDXL), sin cifras de rendimiento:

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| T Station Style LoRA | LoRA de estilo | SDXL 1.0 | ~23 M entrenables | no aplica | openrail++ | Hugging Face (0 descargas) |
| Adaptadores de estilo SDXL genericos | LoRA de estilo | SDXL 1.0 | variable | no aplica | variable | Hugging Face / Civitai |
| Modelos SDXL fine-tuneados completos | Fine-tune completo | SDXL 1.0 | ~2,6 B (UNet) | no aplica | variable | Hugging Face |

No se dispone de datos verificables para comparar calidad, fidelidad de estilo ni rendimiento con esas alternativas.

## Limitaciones y advertencias

- Dataset muy reducido (43 imagenes) y entrenamiento corto (900 pasos): el estilo puede generalizar de forma limitada y producir artefactos o derivas fuera de las composiciones vistas.
- Es un adaptador de estilo, no de personaje ni de marca: reproduce paleta y lenguaje vectorial, pero no el logotipo de T Station; el autor declara no estar afiliado ni respaldado por T Station.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos incoherentes, texto ilegible o detalles anatomicos incorrectos, especialmente con prompts alejados del dominio de losetas e iconos.
- Dependencia de la frase disparadora: sin la formulacion "crimson red and amber gold ... flat vector art on warm charcoal" el efecto de estilo puede ser debil o inconsistente.
- Idiomas no documentados: no se especifica el soporte multilingue de los prompts; se asume el comportamiento de los text encoders del SDXL base.
- Restricciones de licencia: OpenRAIL++ impone clausulas de uso (restricciones de uso aceptable y obligaciones de atribucion del modelo base); debe revisarse antes de uso comercial. El modelo base SDXL 1.0 tiene su propia licencia OpenRAIL++-M.
- Sin traccion comunitaria (0 descargas, 0 likes) y sin benchmarks: no hay evidencia externa de calidad ni validacion por terceros.
- Uso en produccion: requiere validacion manual de las salidas y no sustituye a un artista para material final de marca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hkblockchaintechnology/t-station-style-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Space del juego Time Playground: https://huggingface.co/spaces/hkblockchaintechnology/time-playground-v1.1
- Repositorio de assets (script de entrenamiento): https://huggingface.co/hkblockchaintechnology/time-playground-v1.1-assets
- Sitio web de T Station: https://tstation.hk/
