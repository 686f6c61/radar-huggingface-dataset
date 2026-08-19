# Mamad8/H3-Latent-Upscaler-2x

## Resumen

Mamad8/H3-Latent-Upscaler-2x es un modelo de upscaling latente 2× desarrollado por Mamad8 para el generador de vídeo MiniMax H3. A diferencia de un upscaler convencional de imagen o vídeo, su función no es mejorar la nitidez de un render final, sino duplicar las dimensiones espaciales de un latente de vídeo H3 ya completamente denoised, manteniendo intacta la longitud temporal. Esto permite que un flujo de trabajo H3 permanezca en espacio latente, evitando el costoso ciclo de decodificación VAE → redimensionado en píxeles → re-codificación VAE.

El modelo se entrena a partir de pares de latentes limpios: cada latente de baja resolución se decodifica con el VAE de H3, se amplía 2× en espacio de píxeles con Lanczos y se re-codifica de forma determinista para obtener el latente "profesor". Una red ligera aprende una corrección sobre la interpolación bilineal del latente, utilizando pérdidas de reconstrucción, SSIM, consistencia espacial y consistencia temporal. El generador H3 original no se modifica ni se entrena. El repositorio ocupa 0,1 GB y se distribuye como un único archivo `.safetensors`, pensado para usarse con los nodos de ComfyUI del repositorio complementario `ComfyUI-H3-Latent-Upscaler-Mamad8`.

Su relevancia radica en optimizar flujos de generación de vídeo en alta resolución dentro de ComfyUI, reduciendo el coste computacional y preservando el latente de audio cuando se usa el nodo correspondiente. No obstante, no sustituye a un upscaler de píxeles cuando el objetivo es mejorar la calidad visual de un vídeo ya terminado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera que aprende una corrección sobre interpolación bilineal de latentes (detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa latentes de vídeo, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo `h3_clean_latent_upscaler_v1_mamad8.safetensors`) |

## Arquitectura y entrenamiento

El modelo es una red ligera que opera directamente sobre el espacio latente de MiniMax H3. Su entrada es un latente de vídeo completamente denoised (limpio) y su salida es un latente con las dimensiones espaciales duplicadas (2× en ancho y alto), manteniendo la dimensión temporal sin cambios. Cuando se usa a través del nodo de ComfyUI, el latente de audio conjunto (vídeo/audio) se preserva sin modificación.

El entrenamiento se realizó construyendo pares de latentes limpios: cada latente de baja resolución se decodificó con el VAE de H3, se amplió 2× en espacio de píxeles mediante interpolación Lanczos y se re-codificó de forma determinista para obtener el latente objetivo (profesor). La red aprendió una corrección sobre la interpolación bilineal del latente, optimizando una combinación de pérdidas: reconstrucción latente, SSIM, consistencia espacial y consistencia temporal. El generador H3 no se entrenó ni se modificó en ningún momento. No se han publicado detalles sobre el número de parámetros, la arquitectura exacta de la red ni el volumen de datos de entrenamiento.

## Capacidades

- Duplicar las dimensiones espaciales de un latente de vídeo MiniMax H3 limpio (completamente denoised), manteniendo la longitud temporal.
- Operar íntegramente en espacio latente, evitando el ciclo VAE decode → resize → re-encode.
- Preservar el latente de audio cuando se usa con el nodo de ComfyUI correspondiente (el nodo modifica solo el stream de vídeo).
- Integrarse en flujos de trabajo de ComfyUI mediante dos nodos mínimos del repositorio complementario.
- No es un upscaler de imagen o vídeo convencional: una decodificación directa de su salida puede verse más suave que el original. No mejora la nitidez de un render final.
- Solo es aplicable a latentes limpios; no debe usarse sobre latentes intermedios ruidosos.

## Casos de uso

- Generación de vídeo en alta resolución sin salir del espacio latente: el modelo permite duplicar la resolución espacial de un vídeo H3 generado y continuar la generación en un workflow de continuación de alta resolución, sin decodificar a píxeles intermedios.
- Reducción de coste computacional en pipelines de upscaling: al evitar el ciclo VAE decode → resize → re-encode, se ahorra memoria y tiempo de cómputo, especialmente relevante en vídeos largos.
- Preservación del audio en upscaling latente: gracias al nodo de ComfyUI que mantiene intacto el latente de audio, se puede ampliar la resolución del vídeo sin degradar ni re-sintetizar la pista de audio.
- Post-procesado de latentes para workflows de continuación de alta resolución: tras el upscaling, se aplica un re-noising explícito y se continúa la generación H3 a mayor resolución, lo que permite obtener vídeos finales más grandes que los que genera H3 de forma nativa.
- Experimentación e investigación en modelos de vídeo latente: el modelo sirve como herramienta para estudiar el comportamiento de los latentes H3 al cambiar su resolución espacial, sin intervenir en el generador original.
- Optimización de flujos de ComfyUI para creadores de contenido: integrado en plantillas de nodos, permite automatizar la ampliación de vídeos H3 en producción sin necesidad de scripts personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad de upscaling, velocidad ni comparaciones con otros métodos.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que el modelo es ligero y debería cargar en cualquier GPU con al menos 2 GB de VRAM, aunque no se han publicado requisitos oficiales.
- No se dispone de datos sobre VRAM estimada, GPUs recomendadas ni latencia/throughput.
- Al ser un modelo de corrección sobre interpolación bilineal, su coste de inferencia es presumiblemente bajo, pero no hay cifras confirmadas.
- Opciones de despliegue: diseñado específicamente para ComfyUI mediante los nodos del repositorio `ComfyUI-H3-Latent-Upscaler-Mamad8`. No se mencionan otros entornos de inferencia (vLLM, llama.cpp, etc., no aplican al ser un modelo de vídeo latente).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un upscaler latente específico para MiniMax H3, una categoría muy especializada sin alternativas públicas conocidas en el momento de la publicación.

## Limitaciones y advertencias

- Solo funciona con latentes limpios (completamente denoised). Aplicarlo a latentes intermedios ruidosos producirá resultados incorrectos o degradados.
- No es un upscaler de imagen o vídeo convencional: una decodificación directa de su salida puede verse más suave que el original. Para mejorar la calidad visual de un vídeo final debe usarse un upscaler de espacio de píxeles.
- Para continuar la generación H3 tras el resize es necesario un workflow explícito de re-noising y continuación de alta resolución; no es un proceso automático.
- La licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No se han publicado detalles sobre el entrenamiento (volumen de datos, número de parámetros, arquitectura exacta), lo que limita la reproducibilidad y la evaluación independiente.
- El modelo está pensado exclusivamente para el ecosistema MiniMax H3 y ComfyUI; no es portable a otros generadores de vídeo.

## Enlaces

- HuggingFace: https://huggingface.co/Mamad8/H3-Latent-Upscaler-2x
- Repositorio de nodos de ComfyUI: https://github.com/mamad8c/ComfyUI-H3-Latent-Upscaler-Mamad8
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-08-minimax-h3-latent-upscaler
