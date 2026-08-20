# Intel/Qwen3.8-27B-q2ks-AutoRound

## Resumen

Qwen3.8-27B es un modelo multimodal denso de 27.300 millones de parámetros desarrollado por el equipo Qwen de Alibaba, con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión integrada y contexto nativo de 262.144 tokens extensible a 1M. Esta ficha cubre la versión cuantizada por Intel mediante el algoritmo AutoRound (SignRoundV2) al formato GGUF Q2_K_S, que reduce el peso total del repositorio a 12,2 GB y permite su ejecución en hardware de consumo.

La cuantización Q2_K_S es extremadamente agresiva (aproximadamente 2,5 bits por parámetro), lo que la hace adecuada para despliegues con recursos limitados, aunque puede implicar una degradación notable de la calidad frente al modelo original en BF16. El modelo mantiene las capacidades multimodales del base, incluyendo la descripción de imágenes y el razonamiento visual, mediante el archivo mmproj-model.gguf que acompaña al peso principal.

El modelo fue publicado el 20 de agosto de 2026, seis días después del lanzamiento del modelo base, y está pensado para inferencia con llama.cpp. Intel lo presenta como parte de su ecosistema de cuantización de alto rendimiento, con el algoritmo SignRoundV2 descrito en el artículo arXiv:2512.04746.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal en 48 de 64 capas + torre de visión + MTP draft head |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1M |
| Tipos de cuantizacion | Q2_K_S (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (seguir la licencia del modelo original) |
| Formato de pesos | GGUF (Qwen3.8-27B-Q2_K_S.gguf + mmproj-model.gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención que combina atención lineal en 48 de sus 64 capas con atención completa en las restantes, lo que reduce el coste computacional en contextos largos. Incluye una torre de visión integrada que permite procesar imágenes junto con texto, y un MTP (Multi-Token Prediction) draft head para decodificación especulativa. El contexto nativo es de 262.144 tokens, extensible a 1M.

La versión cuantizada ha sido generada por Intel con el algoritmo AutoRound en su modo "best recipe", que aplica SignRoundV2 para cuantización post-entrenamiento de extremo bajo bit. Según la documentación de AutoRound, por defecto solo se cuantiza el módulo de texto del modelo, dej
