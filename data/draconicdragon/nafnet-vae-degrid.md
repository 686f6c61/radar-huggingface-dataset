# DraconicDragon/NAFNet-VAE-DeGrid

## Resumen

NAFNet-VAE-DeGrid es un modelo de restauración de imágenes basado en NAFNet-small, desarrollado por DraconicDragon, diseñado específicamente para eliminar o mitigar los artefactos de cuadrícula (grid artifacts) que introduce el VAE de Qwen/Wan en imágenes generadas por modelos de difusión. El modelo produce un residual que debe sumarse a la imagen original para obtener la imagen corregida, y se ha entrenado con pares de imágenes donde la versión corrupta se obtiene pasando la imagen por un encode-decode del VAE de Qwen.

La relevancia actual de este modelo radica en que los VAE de modelos como Qwen o Wan 2.1 generan un patrón de cuadrícula visible en las imágenes sintetizadas, especialmente en zonas de sombras o degradados. NAFNet-VAE-DeGrid ofrece una solución ligera y específica para este problema, complementaria a enfoques como el shader Nyquist Notch, con la ventaja de ser un modelo entrenado que puede integrarse en flujos de trabajo de ComfyUI sin necesidad de nodos personalizados (aunque estos amplían sus capacidades).

El modelo se distribuye bajo licencia Apache 2.0, tiene un tamaño de repositorio de 0.5 GB e incluye dos checkpoints: uno de 100k pasos (preentrenamiento) y otro de 30k pasos (ajuste fino). Está pensado principalmente para ilustraciones y arte de estilo anime, aunque también funciona con imágenes realistas aunque con rendimiento incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet-small (Non-linear Activation Free Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (modelo de imagen, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o pytorch) |

## Arquitectura y entrenamiento

NAFNet (Non-linear Activation Free Network) es una arquitectura de restauración de imágenes que elimina las activaciones no lineales en los bloques convolucionales, simplificando el entrenamiento y mejorando el rendimiento en tareas como denoising, deblurring o super-resolución. La variante "small" reduce el número de canales y bloques respecto al modelo base, manteniendo un equilibrio entre calidad y coste computacional.

El entrenamiento se realizó en FP16 con mixed precision durante 100k pasos (preentrenamiento) y 30k pasos adicionales (ajuste fino), con un tamaño de parche de 256 píxeles y batch size 8, en una RTX 3060 de 12 GB, lo que supuso unas 19-20 horas. El dataset consistió en pares de imágenes de pinturas e ilustraciones, con énfasis en arte anime; la imagen corrupta se generaba pasando la imagen original por un encode-decode del VAE de Qwen. El modelo aprende a predecir el residual (diferencia entre imagen limpia y corrupta), que luego se suma a la entrada. Aunque se entrenó con artefactos de Qwen VAE, también funciona razonablemente con el VAE de Wan 2.1, aunque con resultados ligeramente inferiores.

El ajuste fino de 30k pasos se realizó con un dataset más pequeño y filtrado (eliminando imágenes con grano de película intenso), lo que mejoró notablemente el rendimiento y eliminó un patrón repetitivo que aparecía en imágenes con muchos artefactos.

## Capacidades

- Eliminación de artefactos de cuadrícula (grid artifacts) introducidos por el VAE de Qwen y Wan 2.1 en imágenes generadas por difusión.
- Restauración de imágenes mediante predicción de residual: la salida del modelo es un mapa residual que debe sumarse a la imagen original.
- Funciona con imágenes de ilustraciones y arte anime; rendimiento incierto con imágenes realistas.
- Soporta modos de aplicación selectiva del residual: completo, solo píxeles oscuros o solo píxeles brillantes (mediante nodos custom de ComfyUI).
- Integración con ComfyUI tanto con nodos nativos (limitado a píxeles oscuros) como con nodos custom que permiten control total del residual.
- Capacidad de eliminar artefactos sin deformar la imagen original, similar o superior al shader Nyquist Notch.

## Casos de uso

- Post-procesado de imágenes generadas por modelos de difusión que usan VAE de Qwen o Wan: el modelo se aplica a la imagen final para eliminar la cuadrícula visible, mejorando la calidad percibida sin alterar la composición.
- Flujos de trabajo de ComfyUI para generación de anime: se integra como un paso de upscale/restauración después del decode del VAE, usando los nodos nativos o el paquete custom NAFNet Residual.
- Limpieza de artefactos en lotes de imágenes generadas automáticamente: al ser un modelo ligero (entrenado en una RTX 3060), puede ejecutarse en GPU consumer para procesar múltiples imágenes en pipelines de producción.
- Mejora de calidad en herramientas de edición de imágenes que utilicen VAE de Qwen/Wan: el residual puede aplicarse de forma selectiva (solo píxeles oscuros o brillantes) para ajustar el nivel de corrección según el caso.
- Sustitución del shader Nyquist Notch en entornos donde se prefiera un enfoque basado en aprendizaje automático: el modelo ofrece resultados visualmente similares o mejores, con la ventaja de no requerir ajustes manuales de parámetros.
- Investigación sobre restauración de artefactos específicos de VAE: el modelo sirve como punto de partida para experimentar con datasets más amplios o arquitecturas alternativas, ya que el código de entrenamiento está disponible en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor proporciona una comparación visual en la carpeta `assets` del repositorio, pero no hay métricas cuantitativas (PSNR, SSIM, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Inferencia ligera: el modelo es pequeño (repo de 0.5 GB) y se entrenó en una RTX 3060 de 12 GB, por lo que puede ejecutarse en cualquier GPU consumer con al menos 4-6 GB de VRAM.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA (RTX 20 series en adelante). Para entrenamiento se usó una RTX 3060 12GB, pero la inferencia es mucho menos exigente.
- No se requieren GPUs de datacenter (A100, H100) para uso práctico.
- Opciones de despliegue: ComfyUI (con nodos nativos o el paquete custom), o mediante código Python con PyTorch. No se menciona soporte para vLLM, llama.cpp u otras herramientas de inferencia, ya que es un modelo de imagen y no de texto.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño y convolucional, se espera que la inferencia sea rápida (del orden de decenas de milisegundos por imagen en GPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (eliminación de artefactos de VAE). El autor menciona el shader Nyquist Notch como alternativa clásica, pero no es un modelo de ML. Otros modelos de restauración genéricos (SwinIR, Restormer) podrían aplicarse, pero no están especializados en este tipo de artefacto y no se han comparado públicamente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con ilustraciones y arte anime; su rendimiento con imágenes realistas es incierto y podría degradar la calidad.
- No puede replicar el grano de película; tiende a suavizarlo o difuminarlo, lo que puede ser un problema en imágenes que contienen texturas granulosas.
- Solo está entrenado para corregir los artefactos introducidos por el VAE de Qwen/Wan; no elimina otro tipo de ruido o artefactos generados por el modelo de difusión.
- La salida es un residual que debe sumarse a la imagen original; si se usa incorrectamente (sin sumar), la imagen resultante será incorrecta.
- Con ComfyUI nativo, el modelo solo puede aplicar la corrección de píxeles oscuros (los residuales positivos), perdiendo parte de su capacidad; para un uso completo se requieren nodos custom.
- El ajuste fino (30k) mejora el rendimiento pero aún puede presentar patrones repetitivos en imágenes con muchos artefactos, según el autor.
- Licencia Apache 2.0 permite uso comercial, pero no se garantiza la ausencia de sesgos o artefactos en dominios no entrenados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DraconicDragon/NAFNet-VAE-DeGrid
- Repositorio NAFNet original (Megvii Research): https://github.com/megvii-research/nafnet
- Nodos custom para ComfyUI: https://github.com/DraconicDragon/ComfyUI-NAFNet-Residual
- Código de entrenamiento (NAFNet-c): https://github.com/DraconicDragon/NAFNet-c
