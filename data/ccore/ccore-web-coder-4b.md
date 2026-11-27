# ccore/CCORE-Web-Coder-4B

## Resumen

CCORE Web Coder 4B es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario ccore y publicado en Hugging Face bajo licencia Apache 2.0. Su proposito es convertir un brief o encargo en un unico archivo HTML autocontenido que implementa un sitio web, una presentacion de diapositivas o una infografia web, usando React, ReactDOM y Babel cargados desde CDN. El modelo devuelve componentes, estilos e interacciones listos para abrir directamente en el navegador sin paso de build.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,5 mil millones) y se distribuye en safetensors (FP32 en pesos de texto, BF16 en pesos de vision) y en GGUF en cuantizaciones Q4_K_M, Q8_0 y F16. Esta especializado en desarrollo web con React y en la generacion de experiencias HTML completas, y declara soporte unicamente para ingles.

Es relevante porque demuestra que un modelo de 4B puede abordar tareas de diseno e implementacion web en un solo paso, lo que permite ejecucion local en hardware de consumo. El autor publico ademas el dataset de entrenamiento (3.500 ejemplos de diseno web) y otros proyectos previos de la misma familia orientados a Three.js y a activos 3D exportables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base; detalles de atencion no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (GGUF); safetensors en FP32 (texto) y BF16 (vision) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 17,49 GB), GGUF (Q4_K_M 2,71 GB, Q8_0 4,48 GB, F16 8,42 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-4B-Base sobre el dataset ccore/CCORE-Web-Designs, compuesto por 3.500 ejemplos de diseno web. El autor indica que el enfoque de entrenamiento consistio en emparejar briefs con documentos React completos, de modo que los resultados pudieran revisarse en un navegador: recorrer el flujo de un visitante desde la pagina de inicio hasta un formulario de reserva, o comprobar que un grafico de una infografia coincide con las cifras del brief. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La arquitectura interna (tipo de atencion, uso de atencion lineal, decodificacion especulativa u otras innovaciones) no se detalla en la model card. El modelo hereda del base Qwen3.5-4B-Base la capacidad de vision, ya que el autor incluye un proyector de vision opcional (mmproj-Qwen3.5-4B-Base-F16.gguf, 641 MiB) convertido a GGUF por mradermacher para experimentos con entrada de imagen en runtimes multimodales compatibles. La salida esperada se define mediante un system prompt que fija el uso de React 18.3.1, ReactDOM 18.3.1 y Babel standalone 7.26.10 desde CDN, con CSS en un unico bloque `` y JSX en un unico bloque `
