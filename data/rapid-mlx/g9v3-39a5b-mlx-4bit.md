# rapid-mlx/G9v3-39A5B-MLX-4bit

## Resumen

G9v3-39A5B-MLX-4bit es una conversión cuantizada en MLX del modelo G9v3-39A5B, un modelo de lenguaje causal con arquitectura Mixture-of-Experts (MoE) desarrollado originalmente por ai9stars y adaptado para Apple Silicon por el proyecto rapid-mlx. El modelo destaca por su tamaño de 38.967.481.920 parámetros totales, de los cuales solo 5.000 millones se activan por cada token procesado, gracias a un mecanismo de 320 expertos enrutados y un experto compartido. Su ventana de contexto es de 128K tokens, lo que permite manejar documentos extensos y conversaciones largas. Esta versión concreta utiliza una cuantización mixta de 4 bits en los expertos enrutados y 8 bits en atención, MLP denso, embeddings y lm_head, logrando una media de 4.681 bits por peso. El repositorio ocupa 22.8 GB y se distribuye bajo licencia Apache-2.0. Su relevancia radica en ofrecer un modelo MoE de alta capacidad con un coste de inferencia contenido, optimizado para el ecosistema Apple y con soporte para razonamiento estructurado y llamadas a herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal MoE con atención GQA con compuerta (gated GQA) |
| Parametros totales | 38.967.481.920 (~39B) |
| Parametros activos | ~5B por token (32 de 320 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 4-bit / group 64 (expertos enrutados); 8-bit / group 64 (atención, MLP denso, expertos compartidos, embeddings, lm_head) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

G9v3-39A5B es un modelo de lenguaje causal basado en Mixture-of-Experts (MoE). Cada capa enruta tokens hacia 32 de 320 expertos, más un experto compartido que se procesa siempre. La atención utiliza GQA (Grouped Query Attention) con compuerta, una variante diseñada para eficiencia en memoria y computación. El modelo tiene una ventana de contexto de 128K tokens. El puerto a MLX, realizado por rapid-mlx, no está integrado en mlx-lm; requiere el módulo vendored incluido en rapid-mlx (`vllm_mlx/models/g9v3.py`), que se registra en la tabla de modelos de mlx-lm. La cuantización mixta se diseñó para mitigar la degradación observada con cuantización uniforme de 4 bits en las proyecciones de atención: el acuerdo top-1 con la referencia bf16 pasa de 0.80 en 4-bit uniforme a 0.90 con la receta mixta, mientras que con 8-bit en todo el modelo alcanza 0.96 y la versión bf16 de MLX 0.955. No se han proporcionado datos sobre el conjunto de entrenamiento, el número de tokens, ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Modo de razonamiento estructurado con bloques `
