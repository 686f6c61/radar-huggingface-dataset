# ccore/CCORE-Web-Coder-4B

## Resumen

CCORE-Web-Coder-4B es un modelo de lenguaje de 4.539 millones de parámetros (4.539.265.536 exactos según los pesos en safetensors) desarrollado por el usuario ccore y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B-Base, especializado en la generación de experiencias web completas: a partir de un brief en lenguaje natural, el modelo devuelve un único documento HTML autocontenido con componentes React, estilos e interacciones listos para abrirse directamente en un navegador sin paso de compilación.

El modelo resuelve un problema concreto: convertir una descripción de producto, audiencia y objetivo en un sitio web, una presentación de diapositivas o una infografía web funcional, todo en una sola pasada y en un formato editable. Está pensado tanto para uso local directo (con pesos GGUF en cuantizaciones Q4_K_M, Q8_0 y F16) como para integrarse como subagente especializado dentro de pipelines de agentes de código abierto, donde un modelo coordinador le delega la parte de diseño e implementación web.

La relevancia actual del modelo reside en su tamaño reducido (4B) combinado con una tarea de salida compleja (documentos React completos de hasta unos 20.000 tokens de salida incluyendo razonamiento) y en su licencia permisiva, que facilita el despliegue comercial y la experimentación local en hardware de consumo. El modelo solo declara soporte para inglés (`language: en`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); incluye pesos de visión BF16 en el checkpoint original |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), Q8_0 (GGUF), F16 (GGUF), safetensors FP32 (texto) + BF16 (visión) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (5 shards, 17,49 GB) y GGUF (Q4_K_M 2,71 GB; Q8_0 4,48 GB; F16 8,42 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint Qwen/Qwen3.5-4B-Base, un transformer de 4B parámetros. La model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados; únicamente indica que el autor emparejó briefs con documentos React completos para poder revisar los resultados directamente en un navegador, verificando rutas de navegación, formularios de reserva, coherencia entre gráficos y cifras del brief, y legibilidad de comparaciones. El autor anuncia la publicación del dataset de entrenamiento para el 25 de noviembre de 2026.

El checkpoint final conserva los pesos de visión originales del modelo base Qwen3.5-4B-Base en BF16 (junto con pesos de texto en FP32), y se ofrece un proyector de visión opcional en GGUF F16 (641 MiB) convertido por mradermacher para experimentos con entrada de imágenes en runtimes multimodales compatibles. No se documentan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal. El modelo está diseñado para funcionar con un system prompt específico que fija el orden de carga de scripts (React 18.3.1, ReactDOM 18.3.1 y Babel standalone 7.26.10 desde CDN de jsDelivr), la estructura del documento (CSS en un bloque ``, JSX en un `
