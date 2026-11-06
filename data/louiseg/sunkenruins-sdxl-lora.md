# LouiseG/sunkenruins-sdxl-lora

## Resumen

Sunken Ruins es un LoRA de estilo para Stable Diffusion XL 1.0 desarrollado por el usuario LouiseG. Su funcion es introducir un estilo visual muy concreto: ruinas grecorromanas sumergidas en agua turbia de tonos verdeazulados, con columnas colosales, frisos tallados, algas colgantes y haces de luz que penetran desde la superficie. No es un modelo generativo autonomo, sino un adaptador de bajo rango que se aplica sobre `stabilityai/stable-diffusion-xl-base-1.0` mediante la libreria `diffusers`.

El adaptador es deliberadamente ligero: el repositorio ocupa aproximadamente 0,1 GB y el entrenamiento se realizo con LoRA de rango 16 unicamente sobre el UNet, manteniendo congelados los codificadores de texto. Esto lo hace facil de integrar en pipelines existentes de SDXL sin necesidad de reentrenar ni sustituir el modelo base, y con un coste de almacenamiento minimo.

Su relevancia es acotada pero clara para equipos que trabajen en generacion de imagenes con estilos consistentes: permite fijar una estetica de ruinas submarinas con una sola palabra de activacion (`sunkenruins`) y ofrece parametros de muestreo y fuerza recomendados por el autor. La informacion publica disponible es escasa y no incluye benchmarks cuantitativos ni evaluaciones formales de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusion latente, transformer) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base SDXL 1.0 tiene 2.600 M en UNet y 817 M en el conjunto de text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato propio de `diffusers`; el modelo base admite fp16, bf16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts se procesan con los text encoders de SDXL, predominantemente ingles) |
| Licencia | openrail++ |
| Formato de pesos | safetensors mediante `diffusers` (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado exclusivamente al UNet de SDXL 1.0; los dos text encoders del modelo base permanecen congelados durante el entrenamiento. El entrenamiento se realizo con OneTrainer sobre un dataset muy reducido de 8 imagenes en formato retrato (768×1376), con aspect-ratio bucketing y volteo horizontal aleatorio como aumento de datos. Se uso AdamW de 8 bits, tasa de aprendizaje 1e-4, scheduler coseno, 50 pasos de calentamiento y precision bf16.

La configuracion total fue de 12 epocas × 80 pasos = 960 pasos con tamano de lote 1. Las imagenes de ejemplo del widget se generaron durante el propio entrenamiento, en el paso 800 de 960. No se documenta el origen de las imagenes del dataset, ni si hubo curacion, filtrado o etiquetado automatico, ni se menciona el uso de regularizacion adicional mas alla del aumento por volteo.

## Capacidades

- Generacion de imagenes text-to-image con un estilo fijo de ruinas sumergidas de inspiracion grecorromana.
- Aplicacion de un estilo coherente mediante la palabra de activacion `sunkenruins`, que debe colocarse al inicio del prompt.
- Control de intensidad del estilo mediante la fuerza del LoRA, con rango recomendado de 0,7 a 1,0.
- Capacidad de forzar la ambientacion submarina en sujetos terrestres anadiendo el termino `underwater` al prompt (por ejemplo, catedrales o ciudades).
- Composicion optimizada para formato retrato a 768×1344.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un adaptador de generacion de imagenes.
- No se documentan capacidades multilingues especificas; el comportamiento dependera de los text encoders de SDXL 1.0.

## Casos de uso

- Ilustracion de ambientaciones para juegos y narrativa: el LoRA permite generar fondos consistentes de ruinas submarinas para escenarios de aventura, con control de composicion mediante prompts y fuerza del adaptador, lo que reduce la necesidad de retocar el estilo entre imagenes.
- Concept art para produccion audiovisual: util para explorar variaciones de una misma localizacion (columnatas, naves de catedral, faros sumergidos) manteniendo una paleta y una atmosfera homogeneas en toda la secuencia de bocetos.
- Generacion de material para campanas de rol o mundos de fantasia: la palabra de activacion y el termino `underwater` permiten adaptar sujetos terrestres al entorno sumergido, facilitando la creacion de escenas coherentes sin describir el estilo en cada prompt.
- Prototipado rapido de estilos para estudios de diseno: al ocupar 0,1 GB y requerir solo un UNet SDXL, se puede cargar y descargar en pipelines de experimentacion sin penalizar el almacenamiento ni el tiempo de carga.
- Creacion de bibliotecas de imagenes de referencia para artistas: la combinacion de 30 pasos, CFG 7 y DPM++ 2M Karras produce resultados reproducibles que sirven como base para pintura digital o modelado 3D.
- Integracion en flujos de trabajo con `diffusers`: el adaptador se puede combinar con otros LoRA de estilo o de personaje en la misma canalizacion, lo que permite construir variantes del estilo base sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB, por lo que su carga anade un coste de memoria despreciable frente al modelo base.
- El modelo base SDXL 1.0 requiere en torno a 8-10 GB de VRAM en fp16 para inferencia a resoluciones de 1024×1024; en bf16 el consumo es similar.
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y produccion; RTX 4090 (24 GB) para generacion a alta resolucion sin offloading; RTX 3090 (24 GB) como alternativa de coste.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) usando fp16 y atencion optimizada; por debajo de 12 GB es necesario aplicar offloading o cuantizacion del UNet.
- Opciones de despliegue: `diffusers` con `StableDiffusionXLPipeline` y `load_lora_weights`; ComfyUI y Automatic1111/Forge mediante carga de LoRA; tambien es posible exportar a otros runners compatibles con SDXL.
- Latencia y throughput: no disponibles. Dependen del hardware, de los 30 pasos recomendados y de la resolucion 768×1344; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LouiseG/sunkenruins-sdxl-lora | LoRA de estilo sobre SDXL 1.0 | Rango 16 (adaptador); base SDXL 1.0 | no aplica | openrail++ | Hugging Face, 17 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | 2.600 M UNet + 817 M text encoders | no aplica | openrail++ | Hugging Face, ampliamente adoptado |
| LoRA de estilo de la comunidad sobre SDXL | Adaptadores equivalentes | Variable (rango 8-64) | no aplica | Variable (openrail++ o CreativeML) | Hugging Face y Civitai |
| Modelos de difusion de nueva generacion (p. ej. FLUX.1) | Modelo base text-to-image | no disponible en esta ficha | no aplica | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de estilo, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (8 imagenes), lo que aumenta el riesgo de sobreajuste al estilo y de baja diversidad en las composiciones generadas.
- No se documenta la procedencia de las imagenes de entrenamiento ni su licencia individual; el autor declara openrail++ para el adaptador, pero la trazabilidad del dataset es desconocida.
- La licencia openrail++ incluye restricciones de uso comercial y clausulas de uso aceptable; es responsabilidad del usuario revisar sus terminos antes de desplegarlo en produccion.
- El modelo esta orientado a un unico estilo visual; fuera de ese dominio los resultados pueden degradarse o ignorar la palabra de activacion.
- Los prompts estan pensados para funcionar en ingles; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar estructuras arquitectonicas incoherentes, perspectivas imposibles o artefactos en los bordes de las columnas y frisos.
- No se han publicado evaluaciones formales de sesgos, calidad o fidelidad al estilo, ni comparaciones con otros LoRA de tematica similar.
- El repositorio tiene un numero muy bajo de descargas (17) y ningun like, por lo que no existe validacion de la comunidad que respalde su calidad.
- Las imagenes de ejemplo se generaron durante el entrenamiento en el paso 800 de 960, no con el adaptador final, lo que puede no representar exactamente el comportamiento del modelo publicado.

## Enlaces

- Hugging Face: https://huggingface.co/LouiseG/sunkenruins-sdxl-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Entrenador OneTrainer: https://github.com/Nerogar/OneTrainer
- Licencia openrail++: https://huggingface.co/spaces/CompVis/stable-diffusion-license
