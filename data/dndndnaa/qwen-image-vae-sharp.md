# dndndnaa/Qwen-Image-VAE-Sharp

## Resumen

Qwen Image VAE Sharp es una familia de autoencoders variacionales (VAE) mejorados, desarrollados por el usuario dndndnaa como ajuste fino del VAE original del modelo de generación de imágenes Qwen-Image de Alibaba. El objetivo es mejorar la nitidez, el microcontraste y la definición de bordes en las imágenes reconstruidas, manteniendo la fidelidad cromática y la composición original. Se ofrecen tres variantes (Sharp, Sharp Plus y Sharp Ultra) con distintos grados de realce, cada una disponible en precisión BF16 y FP32.

Este VAE no es un modelo de generación completo, sino un componente de decodificación que se integra en pipelines de text-to-image, especialmente en ComfyUI. Su relevancia radica en que permite obtener salidas visualmente más definidas sin necesidad de reentrenar el modelo base, lo que resulta útil para usuarios que buscan un control fino sobre la calidad de imagen en flujos de trabajo existentes. El repositorio incluye seis archivos de pesos en formato safetensors y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) basado en el VAE de Qwen-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | BF16, FP32 |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del VAE incluido en Qwen-Image, un modelo de difusion multimodal de 20 mil millones de parametros con arquitectura MMDiT. El VAE original se encarga de comprimir y reconstruir imagenes en el espacio latente. Las variantes Sharp se han entrenado para modificar la respuesta del decodificador, potenciando las frecuencias altas y el contraste local sin alterar la estructura global de la imagen.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de pasos ni la metodologia exacta (si se uso RLHF, DPO u otra tecnica). La informacion disponible solo indica que es un finetune del VAE base y que se ofrecen tres niveles de intensidad: Sharp (conservador, sin desplazamiento cromatico), Sharp Plus (equilibrado) y Sharp Ultra (agresivo, con maxima definicion de bordes). Tampoco se especifica si se introdujeron cambios arquitectonicos respecto al VAE original.

## Capacidades

- Decodificacion de latentes en imagenes con mayor nitidez y microcontraste que el VAE estandar de Qwen-Image.
- Tres niveles de realce ajustables: Sharp, Sharp Plus y Sharp Ultra, para adaptarse a diferentes preferencias esteticas.
- Preservacion del color y la composicion originales, especialmente en la variante Sharp (sin desplazamiento cromatico).
- Compatibilidad con ComfyUI mediante archivos safetensors, tanto en BF16 como en FP32.
- Especialmente adecuado para imagenes realistas, retratos, arquitectura, vehiculos, escenas de ciencia ficcion y texturas detalladas.
- No incluye capacidades de generacion de texto, razonamiento, tool calling ni agentes, ya que es un componente puramente visual.

## Casos de uso

- Mejora de la calidad visual en pipelines de generacion de imagenes con Qwen-Image: sustituir el VAE estandar por Sharp Plus o Sharp Ultra en ComfyUI para obtener reconstrucciones mas definidas sin cambiar el modelo de difusion.
- Post-procesado de imagenes generadas: aplicar el VAE Sharp a latentes ya generados para realzar detalles finos en retratos o texturas, manteniendo la fidelidad cromatica.
- Produccion de assets para diseno grafico: generar imagenes de producto o ilustraciones con bordes mas limpios y microcontraste mejorado, reduciendo la necesidad de retoque manual.
- Flujos de trabajo de edicion fotografica: usar la variante Sharp (sin desplazamiento cromatico) para realzar detalles en imagenes existentes sin alterar los colores originales.
- Experimentacion artistica: combinar las tres variantes para explorar distintos grados de nitidez y encontrar el equilibrio estetico deseado en escenas de ciencia ficcion o arte muy texturizado.
- Integracion en entornos de produccion con ComfyUI: desplegar el VAE en FP32 con el flag `--fp32-vae` para maximizar la precision de decodificacion en servidores de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como FID, LPIPS ni comparaciones objetivas con el VAE original. Las unicas comparaciones disponibles son enlaces externos a comparaciones visuales (slow.pics) y una carpeta de Google Drive con imagenes a tamano completo, pero no se proporcionan datos numericos.

## Requisitos de hardware

- El repositorio ocupa 2.3 GB en total, pero cada archivo safetensors individual es significativamente menor (estimacion aproximada: entre 100 y 500 MB segun precision, aunque no se especifica el tamano exacto por archivo).
- Al ser un VAE, su uso en inferencia requiere poca VRAM en comparacion con el modelo de difusion completo. Se puede ejecutar en GPUs consumer como RTX 3060, RTX 4060 o superiores, siempre que el modelo base Qwen-Image quepa en memoria.
- Para decodificacion en FP32, se recomienda lanzar ComfyUI con el flag `--fp32-vae`, lo que aumenta ligeramente el consumo de VRAM pero mejora la precision.
- Opciones de despliegue: ComfyUI (soportado oficialmente), y potencialmente otros frameworks que acepten safetensors de VAE, aunque no se mencionan alternativas como vLLM u Ollama (no aplicables a un VAE).
- No se proporcionan datos de latencia ni throughput. Al ser un componente de decodificacion, su impacto en el tiempo total de generacion es menor que el del modelo de difusion.

## Comparativa con modelos similares

| Modelo | Tipo | Precision | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen-Image VAE (original) | VAE estandar | BF16/FP32 | Apache-2.0 | Decodificacion base de Qwen-Image |
| Qwen Image VAE Sharp (este modelo) | VAE mejorado | BF16/FP32 | Apache-2.0 | Decodificacion con nitidez y microcontraste mejorados |
| Otros VAEs de la comunidad (p.ej. para SDXL) | VAE alternativos | Variable | Variable | Mejora de calidad en otros modelos de difusion |

No se dispone de comparaciones cuantitativas con otros VAEs mejorados. La unica referencia directa es el VAE original de Qwen-Image, del cual este modelo es un finetune. No hay datos de rendimiento objetivo que permitan una comparativa numerica.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o comportamientos no deseados especificos de este VAE. Al ser un componente de decodificacion, los riesgos de alucinacion visual son inherentes al modelo de difusion base, no al VAE.
- La variante Sharp Ultra puede producir un aspecto excesivamente "afilado" o artificial en algunas imagenes, especialmente en superficies suaves o fondos desenfocados. Se recomienda probar las tres variantes para cada caso de uso.
- No hay informacion sobre el dataset de entrenamiento ni sobre posibles limitaciones en ciertos tipos de contenido (por ejemplo, rostros, texto o patrones repetitivos).
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen-Image tambien cumpla con los requisitos de la licencia en el producto final.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad. Se recomienda realizar pruebas propias antes de usarlo en produccion.
- No se especifican requisitos de hardware minimos ni compatibilidad con versiones concretas de ComfyUI o PyTorch.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dndndnaa/Qwen-Image-VAE-Sharp
- Modelo base Qwen-Image: https://huggingface.co/Qwen/Qwen-Image
- Repositorio de Qwen-Image en GitHub: https://github.com/QwenLM/Qwen-Image
- Pagina en Civitai (variante Sharp Ultra FP32): https://civitai.com/models/2784566/qwen-image-vae-sharp-krea-2-turboraw
- Comparaciones visuales (slow.pics): https://slow.pics/c/8Bbg3Uwl, https://slow.pics/c/zBOxCcp8, https://slow.pics/c/5CAsqi8a
- Imagenes a tamano completo (Google Drive): https://drive.google.com/drive/folders/1wOWwoXkpelJRdaq3hq9iTLhzM6VKXwpa?usp=sharing
