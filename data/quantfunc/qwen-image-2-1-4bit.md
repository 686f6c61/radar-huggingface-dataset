# QuantFunc/Qwen-Image-2.1-4bit

## Resumen

Qwen-Image-2.1-4bit es una versión cuantizada a 4 bits (INT4) del modelo de generación de imágenes texto-a-imagen Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen. La cuantización ha sido realizada por QuantFunc mediante su propia técnica de cuantización SVD, comprimiendo los pesos de 16 bits a aproximadamente una cuarta parte de su tamaño original. El objetivo es hacer viable la ejecución de un modelo de difusión de gran calidad en GPUs de consumo, reduciendo el coste de ancho de banda de memoria asociado a la carga e inferencia de los pesos.

El modelo mantiene el pipeline de generación texto-a-imagen del original y, según el autor, preserva composición, renderizado de texto, detalle y estilo cercanos al baseline de 16 bits en comparaciones visuales. Se distribuye en dos variantes (r128, orientada a calidad, y r32, orientada a menor tamaño y VRAM) con ficheros de aproximadamente 4,3 GB y 4,0 GB respectivamente, lo que supone un tamaño de repositorio total de 9,0 GB.

Su relevancia actual radica en que permite desplegar un modelo de generación de imágenes de la familia Qwen en hardware tan variado como las RTX 20/30/40/50, T4, A10/A40, L4/L40 y RTX 6000 Ada, mediante la extensión ComfyUI-QuantFunc. No obstante, no es un checkpoint compatible directamente con Diffusers: requiere el motor de inferencia propio de QuantFunc.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (derivado de Qwen-Image-2.1); detalles de arquitectura interna no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 (4 bits), con variantes r128 y r32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors en formato propio de QuantFunc (no compatible como checkpoint Diffusers directo) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del modelo de difusión Qwen-Image-2.1. La técnica empleada es SVDQuant, que descompone los pesos y aplica cuantización INT4 a la componente de bajo rango, reduciendo el tamaño de los pesos a aproximadamente un cuarto del original en 16 bits. Se ofrecen dos configuraciones de rango: r128 (mayor rango, prioriza calidad) y r32 (menor rango, prioriza tamaño y VRAM).

No se dispone de información sobre el proceso de entrenamiento original de Qwen-Image-2.1 (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. Tampoco se detalla si la cuantización incluye calibración con datos específicos ni qué capas se cuantizan. El autor indica que el motor de QuantFunc soporta GPUs NVIDIA con arquitecturas SM75, SM86, SM89 y SM120.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Renderizado de texto dentro de la imagen, con calidad cercana al baseline de 16 bits según el autor.
- Composición y detalle fotorrealista (retratos, escenas cotidianas).
- Diseño gráfico aplicado: carteles publicitarios, pósters de comida, anuncios florales.
- Fidelidad de estilo y composición preservada tras la cuantización INT4.
- Integración en flujos de trabajo de ComfyUI mediante el nodo cargador de QuantFunc.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes en equipos de consumo: con pesos de 4,0-4,3 GB, el modelo puede ejecutarse en GPUs de gama media como RTX 3060 o RTX 4060, reduciendo el coste de ancho de banda de memoria frente al modelo de 16 bits.
- Diseño de carteles y material publicitario: el modelo muestra buen rendimiento en pósters de comida y anuncios florales, útil para generar borradores de piezas gráficas con texto integrado.
- Producción de retratos y fotografía sintética: adecuado para generar retratos con detalle realista en pipelines de creación de contenido.
- Prototipado rápido en ComfyUI: al sustituir únicamente el nodo cargador, los flujos existentes de Qwen-Image-2.1 pueden migrarse a la versión cuantizada sin reconfigurar el resto de nodos y parámetros.
- Despliegue en servidores con GPUs de inferencia económica: soporta T4, L4, L40, A10 y A40, lo que permite servir generación de imágenes en infraestructura cloud de coste moderado.
- Iteración creativa en local: la variante r32, de menor tamaño, permite experimentar en GPUs con VRAM limitada priorizando el ajuste en memoria sobre la calidad máxima.
- Generación de ilustraciones y escenas whimsicales: útil para contenido editorial o de entretenimiento que requiera escenas imaginativas y estilizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 4,3 GB (r128) y 4,0 GB (r32); el repositorio completo ocupa 9,0 GB.
- VRAM estimada: no disponible de forma explícita; el autor indica que la VRAM real depende de la resolución, el tamaño de lote y el resto del flujo de trabajo. Los pesos de 4 bits reducen significativamente el coste de ancho de banda de memoria.
- GPUs soportadas por el motor QuantFunc: NVIDIA SM75 (RTX 20-series, T4), SM86 (RTX 30-series, A10/A40), SM89 (RTX 40-series, L4/L40, RTX 6000 Ada) y SM120 (RTX 50-series, PRO 6000 Blackwell).
- Cabe en GPU de consumo: sí, en la familia RTX 20/30/40/50 según el autor; la viabilidad concreta depende de resolución y lote.
- Opciones de despliegue: ComfyUI mediante la extensión ComfyUI-QuantFunc, o el motor de inferencia propio de QuantFunc. No es cargable directamente con el paquete `diffusers` pese a declarar `library_name: diffusers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen-Image-2.1-4bit (QuantFunc) | no disponible | no disponible | INT4 (r128/r32) | qwen-research | safetensors propio, ComfyUI-QuantFunc |
| Qwen-Image-2.1 (original) | no disponible | no disponible | 16 bits | qwen-research | Diffusers / ComfyUI |
| Otros modelos texto-a-imagen cuantizados | no disponible | no disponible | variable | variable | variable |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es la Qwen Research License, que puede restringir el uso comercial; es imprescindible revisar los términos del modelo original antes de usarlo en producción.
- No es un checkpoint compatible con Diffusers: requiere ComfyUI-QuantFunc o el motor de QuantFunc. La etiqueta `library_name: diffusers` responde únicamente al recuento de descargas de Hugging Face, según aclara el propio autor.
- La cuantización INT4 puede introducir degradaciones sutiles de calidad frente al baseline de 16 bits; el autor solo aporta comparaciones visuales, sin métricas cuantitativas.
- No se documentan sesgos conocidos, tasas de alucinación visual ni idiomas soportados; esta información no está disponible.
- El consumo de VRAM depende de la resolución, el tamaño de lote y el flujo de trabajo, por lo que las estimaciones de 4,0-4,3 GB de pesos no equivalen a la VRAM total necesaria.
- Si el modelo no se reconoce o falla al cargar, el autor recomienda actualizar ComfyUI-QuantFunc a la última versión y reiniciar ComfyUI.
- No se ofrecen garantías de soporte en GPUs no listadas (por ejemplo, AMD o Intel).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantFunc/Qwen-Image-2.1-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Perfil de QuantFunc en Civitai: https://civitai.com/user/quantfunc
- Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
- Documentación de estadísticas de descargas de Hugging Face: https://huggingface.co/docs/hub/models-download-stats
