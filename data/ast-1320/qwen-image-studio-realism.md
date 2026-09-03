# AST-1320/Qwen-Image-Studio-Realism

## Resumen

Qwen-Image-Studio-Realism es un adaptador LoRA (Low-Rank Adaptation) para el modelo base Qwen-Image, desarrollado por el usuario AST-1320. Este adaptador está diseñado para generar imágenes con un estilo de "realismo de estudio", es decir, retratos con iluminación controlada, fondos neutros y una estética fotográfica profesional. El modelo base Qwen-Image es un modelo de difusión multimodal (MMDiT) de 20 mil millones de parámetros, desarrollado por Alibaba Cloud, que destaca en la generación de imágenes con texto complejo y edición precisa.

El LoRA se entrena con un conjunto reducido de 27 imágenes de alta calidad, etiquetadas mediante Florence-2, y se activa mediante el prompt "Studio Realism". Aunque el adaptador es ligero (1.2 GB), la inferencia requiere cargar el modelo base completo, lo que implica un hardware de gama alta. Su relevancia radica en ofrecer un control estilístico específico sobre Qwen-Image sin necesidad de reentrenar el modelo completo, permitiendo a desarrolladores e investigadores adaptar la generación a un estilo concreto con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen-Image (MMDiT de 20B parametros) |
| Parametros totales | Modelo base: 20B; LoRA: no disponible (dim 64, alpha 32) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No aplica (modelo de difusion) |
| Tipos de cuantizacion | No disponible (el modelo base puede cuantizarse, pero no se especifica) |
| Idiomas soportados | Ingles (etiquetado); el modelo base soporta ingles y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen-Image, un modelo de difusion multimodal (MMDiT) de 20B parametros que combina transformadores de difusion con atencion multimodal. El LoRA se entrena con un rango bajo (Network Dim 64, Alpha 32) sobre un conjunto de 27 imagenes de alta calidad procedentes de Playground, ArtStation y 4K Wallpapers. Las imagenes se etiquetaron con Florence-2 en lenguaje natural ingles. El entrenamiento utilizo un optimizador AdamW con tasa de aprendizaje constante, 20 epocas y 2790 pasos, con noise offset de 0.03 y multires noise discount de 0.1. No se aplicaron tecnicas de RLHF ni DPO, ya que se trata de un ajuste fino de estilo.

## Capacidades

- Generacion de imagenes fotorrealistas con estilo "Studio Realism": retratos con iluminacion de estudio, fondos neutros (blanco, colores planos) y detalles faciales precisos.
- Control estilistico mediante el trigger word "Studio Realism" en el prompt.
- Compatible con el pipeline de diffusers, permitiendo cargar el LoRA sobre el modelo base Qwen-Image.
- Soporta resoluciones recomendadas de 1472x1140 (4:3) y 1024x1024 (1:1), con 35-50 pasos de inferencia.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Retratos profesionales para catalogos o portfolios: el estilo de estudio produce imagenes limpias y uniformes, ideales para fotografia de producto o personal.
- Creacion de avatares para perfiles corporativos: se puede generar una serie de retratos con fondo neutro y expresion neutral, util para equipos o documentacion.
- Ilustracion de articulos o blogs: el estilo realista de estudio aporta una estetica coherente para imagenes de cabecera o contenido editorial.
- Generacion de imagenes de referencia para disenadores de moda: permite visualizar prendas y accesorios sobre modelos con iluminacion controlada.
- Pruebas de casting virtual: se pueden generar multiples variaciones de un mismo personaje con diferentes rasgos, manteniendo el estilo de estudio.
- Prototipado rapido para campanas publicitarias: el trigger word facilita la generacion de conceptos visuales con una apariencia profesional sin necesidad de sesion fotografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un adaptador de estilo, no se dispone de metricas como MMLU, HumanEval o GSM8K, y no se han realizado evaluaciones comparativas publicas con otros LoRAs similares.

## Requisitos de hardware

- El modelo base Qwen-Image (20B parametros) requiere una GPU con al menos 24 GB de VRAM para inferencia en bfloat16. Se recomienda una NVIDIA A100, H100 o RTX 4090 (esta ultima con 24 GB).
- El LoRA anade un overhead minimo en memoria, por lo que los requisitos se centran en el modelo base.
- No se recomienda su uso en GPUs de consumo con menos de 16 GB, ya que el modelo base no cabria en memoria.
- Opciones de despliegue: se puede utilizar con la libreria diffusers de Hugging Face, cargando el modelo base y luego el LoRA. Tambien es compatible con pipelines personalizados en PyTorch.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de estilo para Qwen-Image que permitan una comparativa directa. El modelo base Qwen-Image, sin el LoRA, ofrece capacidades generales de generacion de imagenes, pero sin el estilo especifico de estudio. No se han publicado comparativas con otros adaptadores de realismo en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Entrenado con solo 27 imagenes, lo que puede provocar sobreajuste al estilo concreto y limitar la variedad de escenas o sujetos.
- Riesgo de alucinacion en detalles finos (texturas, accesorios) cuando el prompt se aleja del dominio de entrenamiento.
- El estilo "Studio Realism" es muy especifico; prompts que no incluyan el trigger word pueden no producir el efecto deseado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de las imagenes de entrenamiento (Playground, ArtStation, 4K Wallpapers) para evitar problemas de derechos de autor.
- El modelo base Qwen-Image tiene sus propias limitaciones, como posibles sesgos en la representacion de ciertos grupos etnicos o de genero, que se heredan en el adaptador.

## Enlaces

- [HuggingFace - AST-1320/Qwen-Image-Studio-Realism](https://huggingface.co/AST-1320/Qwen-Image-Studio-Realism)
- [HuggingFace - prithivMLmods/Qwen-Image-Studio-Realism (version espejo)](https://huggingface.co/prithivMLmods/Qwen-Image-Studio-Realism)
- [GitHub - QwenLM/Qwen-Image (modelo base)](https://github.com/QwenLM/Qwen-Image)
- [Qwen Studio](https://qwen.ai/home)
