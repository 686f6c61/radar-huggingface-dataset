# aevionlabs/MiniMax-H3-Image-GGUF

## Resumen
MiniMax H3-Image GGUF es una conversión a formato GGUF del transformer de difusión podado de MiniMax H3-Image, un modelo de generación y edición de imágenes desarrollado por MiniMaxAI. La conversión la mantiene el usuario aevionlabs y está pensada para su uso con stable-diffusion.cpp y la aplicación Hearthscale, lo que permite ejecutar un modelo de difusión de gran tamano en hardware de consumo mediante cuantización.

El modelo base resuelve tareas de text-to-image e image-to-image, incluyendo edición de imágenes por instrucciones en lenguaje natural, y es capaz de generar imágenes de hasta 16 megapíxeles. Está destilado para funcionar en 6 pasos de muestreo, lo que reduce drásticamente el coste computacional frente a modelos de difusión tradicionales que requieren decenas de pasos.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de difusión de aproximadamente 20.100 millones de parámetros en GPUs de consumo (incluso de 10 GB de VRAM con streaming desde memoria del sistema), algo poco habitual en modelos de esta escala. El repositorio ocupa 55,6 GB e incluye varias cuantizaciones (Q8_0, Q5_K_M, Q4_K_M y Q3_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (diffusion transformer) podado, destilado a 6 pasos |
| Parametros totales | 20.113.670.232 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M, Q3_K_M (no se publica Q2_K) |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (para stable-diffusion.cpp); el base en safetensors bf16 |

## Arquitectura y entrenamiento
El modelo es un diffusion transformer podado, es decir, una variante reducida del transformer de difusión original de MiniMax H3-Image. La conversión a GGUF se realizó a partir de `minimax_h3_image_pruned_bf16.safetensors` del repositorio Comfy-Org/MiniMax-H3-Image, usando el conversor de stable-diffusion.cpp `master-1088-32d516c`. Los pesos de atención y MLP de los 50 bloques y del refinador de tokens adoptan el tipo indicado en el nombre del archivo; las proyecciones AdaLN se mantienen en F16, las normas y la proyección de condición en BF16, y las cabezas de salida en F32. La proyección de entrada es F32 salvo en Q8_0, donde es Q8_0.

El modelo está destilado para 6 pasos de muestreo, lo que constituye su principal innovación práctica: reduce el número de evaluaciones del transformer por imagen en comparación con los pipelines de difusión convencionales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base emplea un text encoder Qwen3-VL de 32B (disponible en cuantizaciones Q4_K_M de 18,2 GB y Q2_K_M de 13,1 GB) y un VAE en fp16.

## Capacidades
- Generación de texto a imagen (text-to-image) con resolución de hasta 16 megapíxeles.
- Edición de imágenes (image-to-image) mediante instrucciones en lenguaje natural, manteniendo el resto de la imagen sin cambios.
- Soporte de múltiples imágenes de referencia en la edición (hasta 16 referencias con `-r` repetido).
- Generación de texto legible dentro de la imagen (lettering), preservado en cuantizaciones Q4_K_M y superiores.
- Muestreo en 6 pasos gracias a la destilación.
- Compatibilidad con stable-diffusion.cpp y Hearthscale 0.3.2 o superior.
- Soporte de resolución variable, incluyendo 1024×1024 y 2048×2048.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode en la información disponible.

## Casos de uso
- Generación de imágenes de producto para comercio electrónico: el modelo puede producir imágenes de 1024×1024 o 2048×2048 en 6 pasos con texto legible integrado (por ejemplo, carteles o etiquetas), lo que lo hace adecuado para catálogos que requieren lettering correcto.
- Edición de fotografías por instrucciones: dado un retrato, se puede pedir "dale un gorro de lana rojo y mantén todo lo demás exactamente igual" y el modelo aplica el cambio sobre la imagen de referencia, útil en flujos de retoque y previsualización de conceptos.
- Creación de arte conceptual y matte painting: descripciones detalladas de escenarios (ciudades en costillas de fósiles, desiertos con caravanas) generan imágenes de amplio formato para preproducción de cine o videojuegos.
- Diseño gráfico y cartelería: la capacidad de mantener lettering en Q4_K_M permite generar pósteres con texto específico ("HEARTH JAZZ", "FRIDAY 9 PM") en un estilo definido, adecuado para pruebas de diseño rápido.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q4_K_M (11,4 GB) y streaming desde memoria del sistema, un equipo con RTX 3080 de 10 GB y 32 GB de RAM puede generar una imagen 1024×1024 en 61 segundos, lo que sirve para prototipado local sin depender de la nube.
- Integración en pipelines de stable-diffusion.cpp: mediante `sd-cli` con parámetros como `--auto-fit on --max-vram 6`, se puede automatizar la generación por lotes en scripts o servidores con presupuesto de VRAM limitado.
- Edición por lotes con referencias múltiples: al aceptar hasta 16 imágenes de referencia, se puede usar para armonizar una serie de imágenes (por ejemplo, aplicar un mismo estilo o elemento a varias fotos) en un flujo de trabajo reproducible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Los únicos datos medidos son tiempos de inferencia en una NVIDIA RTX 3080 (10 GB VRAM, 32 GB RAM, build Vulkan, text encoder Q2_K_M, `--auto-fit on --max-vram 6`, 6 pasos):

| Archivo | 1024×1024 (total) | Muestreo |
|---|---|---|
| Q8_0 | 285 s | 265 s |
| Q5_K_M | 98 s | 76 s |
| Q4_K_M | 61 s | 38 s |
| Q3_K_M | 52 s | 31 s |

Con Q4_K_M, una imagen de 2048×2048 tarda 77 s y una edición de 1024×1024 tarda 76 s en el mismo equipo.

## Requisitos de hardware
- VRAM para mantener todo el modelo en memoria gráfica: 24 GB para Q8_0, 16 GB para Q5_K_M, 16 GB para Q4_K_M y 12 GB para Q3_K_M.
- Con menos VRAM, los pesos se transmiten desde memoria del sistema en cada paso; todos los archivos funcionan en una GPU de 10 GB con 32 GB de RAM del sistema.
- GPU recomendadas: RTX 3080 (10 GB) o superiores para las cuantizaciones menores con streaming; A100 o H100 para Q8_0 sin streaming.
- Cabe en GPU de consumo: sí, desde una RTX 3080 de 10 GB con 32 GB de RAM, con los tiempos indicados.
- Opciones de despliegue: stable-diffusion.cpp (build `master-1088` o superior, con Vulkan en las pruebas) y Hearthscale 0.3.2 o superior. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo de difusión.
- Latencia y throughput estimados: 61 s por imagen 1024×1024 con Q4_K_M en RTX 3080; 77 s para 2048×2048; 76 s para una edición de 1024×1024. El tiempo de muestreo puro con Q4_K_M es de 38 s para 1024×1024.
- Se requiere además el VAE `minimax_h3_image_vae_fp16.safetensors` y el text encoder `qwen3vl_32b_minimax_h3-Q4_K_M.gguf` (18,2 GB) o `-Q2_K_M.gguf` (13,1 GB) de leejet/MiniMax-H3-GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3-Image GGUF (esta ficha) | ~20,1 B | hasta 16 MP, 6 pasos destilados | Q8_0, Q5_K_M, Q4_K_M, Q3_K_M | minimax-h3-image-community-license-agreement | GGUF en HF (aevionlabs) |
| MiniMax H3-Image (base) | ~20,1 B | hasta 16 MP, 6 pasos destilados | bf16 (safetensors) | minimax-h3-image-community-license-agreement | safetensors en HF (MiniMaxAI, Comfy-Org) |
| MiniMax-H3-GGUF (leejet) | no disponible | no disponible | Q4_K_M, Q2_K_M (text encoder) | no disponible | GGUF en HF (leejet) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias
- El modelo solo declara soporte de inglés (`en`); el rendimiento en otros idiomas no está documentado.
- No se publica un archivo de 2 bits porque en Q2_K el lettering y el detalle se rompen; Q3_K_M es el archivo más pequeño que mantiene el texto correcto.
- Los sesgos conocidos y el riesgo de alucinación visual no están documentados en la información disponible.
- La licencia es la minimax-h3-image-community-license-agreement, que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- Requiere stable-diffusion.cpp `master-1088` o superior y Hearthscale 0.3.2 o superior; versiones anteriores no leen el modelo.
- El text encoder Qwen3-VL de 32B añade entre 13,1 y 18,2 GB adicionales de requisitos de memoria, lo que puede dominar el presupuesto total en GPUs pequeñas.
- Los tiempos de inferencia medidos corresponden a una única configuración (RTX 3080, Vulkan); no se garantizan en otros equipos o backends.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/aevionlabs/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio Comfy-Org del modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Text encoder y VAE GGUF: https://huggingface.co/leejet/MiniMax-H3-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Guía de MiniMax-H3-Image en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/minimax_h3_image.md
- Hearthscale: https://hearthscale.com
