# occurra/person_reid_siglip2_naflex_512d

## Resumen

El modelo `person_reid_siglip2_naflex_512d` es un sistema de re-identificación de personas (re-ID) imagen-a-imagen desarrollado por el usuario occurra. Acepta recortes (crops) de personas y devuelve vectores de 512 dimensiones normalizados (norma unitaria) que pueden compararse mediante producto escalar o similitud coseno. Está construido sobre la arquitectura SigLIP2, adaptada para trabajar con el aspecto natural de cada recorte sin reescalado cuadrado fijo, lo que resulta crítico en escenarios de videovigilancia donde los crops de personas presentan relaciones de aspecto muy variables.

El modelo se distribuye en formato ONNX (opset 17) y como bundle de PyTorch, con licencia Apache-2.0. Su relevancia actual radica en que ofrece un equilibrio competitivo entre rendimiento y flexibilidad de despliegue: puede ejecutarse en entornos de producción con ONNX Runtime y maneja lotes con proporciones de aspecto mixtas gracias al redimensionado posicional dentro del grafo. Los benchmarks publicados muestran una ventaja clara en un conjunto de cámaras reales de vigilancia frente a alternativas como CLIP-ReID y MarketaJu SigLIP2, aunque en benchmarks públicos como Market-1501 o MSMT17 no siempre es el mejor, algo que el autor atribuye a solapamiento de datos de entrenamiento de los competidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SigLIP2 adaptado para re-ID con proyección lineal a 512-d |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (formato ONNX con pesos sin especificar) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) y torch bundle (.pth) |

## Arquitectura y entrenamiento

El modelo parte del encoder SigLIP2, un vision-language transformer desarrollado por Google que combina entrenamiento con pares imagen-texto y pérdidas de autosupervisión (destilación, predicción enmascarada). Para re-ID, occurra lo ha adaptado eliminando el cabezal de texto y añadiendo un cuello de botella (neck) y una proyección lineal que reduce las características a 512 dimensiones con normalización L2 dentro del grafo. La principal innovación técnica es el manejo de aspecto natural: en lugar de forzar un resize cuadrado, la imagen se tokeniza en patches de 16×16 hasta un máximo de 256 tokens, conservando las proporciones originales. El grafo ONNX incluye una capa de redimensionado posicional que permite procesar lotes con imágenes de distintas relaciones de aspecto sin necesidad de padding uniforme.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas de alineamiento como RLHF o DPO. El autor indica que la proyección de 512 dimensiones retiene el 99,8 % de la varianza de las características de 768 dimensiones, con una pérdida aproximada de medio punto en el conjunto de cámaras reales (0,9180 / 0,9700 frente a 0,9230 / 0,9750 en mAP / rank-1).

## Capacidades

- Re-identificación de personas imagen-a-imagen: devuelve vectores de 512 dimensiones comparables mediante coseno.
- Procesamiento de aspecto natural: acepta recortes con relaciones de aspecto variables (hasta 5:1) sin reescalado cuadrado, lo que preserva información geométrica útil.
- Manejo de lotes heterogéneos: el grafo ONNX redimensiona posicionalmente cada imagen, por lo que no requiere lotes con aspecto uniforme.
- Extracción de características visuales genéricas: puede usarse como backbone para otras tareas de búsqueda o recuperación de imágenes.
- Compatibilidad con ONNX Runtime: despliegue eficiente en CPU o GPU sin necesidad de PyTorch.
- Guardrail para recortes extremos: aplica escalado automático para crops con lado corto menor de 32 px o aspecto superior a 5:1, lo que mejora la robustez en condiciones de vigilancia reales.

## Casos de uso

- Videovigilancia en tiempo real: el modelo puede integrarse en pipelines de análisis de vídeo para identificar a una persona a través de múltiples cámaras fijas. Su buen rendimiento en el conjunto de cámaras reales (mAP 0,9230) y su formato ONNX lo hacen adecuado para inferencia en servidores con GPUs de gama media.
- Búsqueda de personas en bases de imágenes: dado un recorte de consulta, se genera su embedding y se busca por similitud coseno en una base precalculada. El manejo de aspecto natural mejora la precisión con crops de vigilancia que suelen ser alargados.
- Seguimiento de personas entre cámaras no solapadas: los embeddings de cada detección se comparan a lo largo del tiempo para mantener la identidad incluso cuando la persona cambia de ropa (el modelo obtiene 0.4756 mAP en VC-Clothes).
- Auditoría y control de acceso: verificación de que una persona capturada en un acceso coincide con una identidad registrada, usando el umbral de similitud adecuado.
- Análisis forense de grabaciones: búsqueda de un sospechoso en horas de vídeo mediante consulta por imagen, con ranking de candidatos ordenado por similitud.
- Sistema de recomendación de moda (con matices): aunque no es su objetivo principal, el modelo puede extraer características de vestimenta que permitan buscar prendas similares en catálogos, siempre que los recortes sean de personas completas.

## Benchmarks y rendimiento

La model card publica resultados de mAP / rank-1 en varios benchmarks, comparando con CLIP-ReID ViT-B/16 y MarketaJu SigLIP2. Todos los valores se reportan a la anchura nativa de 768-d para que la comparación sea neutral (el modelo también ofrece salida de 512-d).

| Benchmark | Este modelo | CLIP-ReID ViT-B/16 | MarketaJu SigLIP2 |
|---|---|---|---|
| Real-camera set (200q / 598g) | **0,9230 / 0,9750** | 0,8169 / 0,8900 | 0,8692 / 0,9200 |
| Market-1501 | 0,7360 / 0,8694 | 0,7784 / 0,9026 | **0,8090 / 0,9068** |
| DukeMTMC-reID | **0,5772 / 0,7527** | 0,4363 / 0,6346 | 0,5547 / 0,7365 |
| MSMT17 | 0,4681 / 0,7117 | 0,1503 / 0,3831 | **0,5660 / 0,7899** |
| Cross-domain set (3,000q / 10,415g) | 0,3981 / 0,3903 | 0,3021 / 0,3099 | **0,4692 / 0,4694** |
| VC-Clothes (clothes-change) | 0,4756 / 0,6820 | 0,4838 / 0,6997 | **0,6115 / 0,7596** |

Protocolo: los elementos del gallery que comparten identidad y cámara con la query se descartan como junk; las queries sin coincidencia real se omiten.

El autor advierte que el conjunto de cámaras reales es el más próximo a las condiciones de despliegue y que en él este modelo reduce los errores de top-1 de 22 a 9 respecto a CLIP-ReID. En los benchmarks públicos, MarketaJu suele ganar, pero el autor señala que sus datos de entrenamiento (CUHK-PEDES, ICFG-PEDES) se construyen a partir de imágenes de Market-1501 y MSMT17, lo que puede inflar sus resultados en esos conjuntos. Duke-1, que no aparece en sus fuentes, es el único público donde MarketaJu pierde.

Con la proyección de 512-d, el rendimiento en el conjunto real-camera desciende a 0,9180 / 0,9700.

## Requisitos de hardware

- Tamaño del repositorio: 0,8 GB (modelo ONNX más bundle PyTorch). El archivo ONNX es el componente principal y probablemente pesa entre 600-800 MB en FP32.
- VRAM estimada: el modelo completo en FP32 puede requerir entre 2 y 3 GB de VRAM; en FP16 se reduce a ~1,5 GB, por lo que es ejecutable en GPUs consumer como GTX 1060 6GB o superiores.
- GPUs recomendadas: para producción con lotes grandes, una RTX 3060 12 GB o superior; para despliegue masivo, A10G o A100 con vLLM o TensorRT.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, o el bundle .pth con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientadas a modelos de texto.
- Latencia: no se publican datos. En una GPU moderna, la inferencia de un solo crop debería estar en el rango de 5-20 ms, dependiendo del tamaño de la imagen y el lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | SigLIP2 + proyección 512-d | no disponible | no aplica | Apache-2.0 | ONNX, torch |
| CLIP-ReID ViT-B/16 | CLIP ViT-B/16 + head re-ID | ~150 M | no aplica | no disponible | PyTorch |
| MarketaJu SigLIP2 | SigLIP2 + head re-ID | no disponible | no aplica | no disponible | no disponible |

El modelo de occurra se diferencia de CLIP-ReID y MarketaJu en el manejo del aspecto natural y en la disponibilidad de un formato ONNX listo para producción. MarketaJu es superior en benchmarks públicos con solapamiento de datos, pero este modelo gana en el conjunto de cámaras reales, lo que sugiere una mejor generalización a condiciones de vigilancia reales.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo está optimizado para recortes de personas en vigilancia; su rendimiento puede degradarse con imágenes de cuerpo entero o de alta resolución fuera de ese contexto.
- Alucinación: al ser un modelo de extracción de características, no genera texto; el riesgo de alucinación no aplica, pero sí el de embeddings mal calibrados en condiciones de iluminación extrema o oclusiones.
- Limitación de contexto: no soporta texto ni lenguaje; solo imágenes.
- Variabilidad de benchmarks: el autor advierte que los resultados en benchmarks públicos pueden estar inflados por solapamiento de datos en los competidores; no hay garantía de que el rendimiento se extrapole a otros dominios.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no detalla los datos de entrenamiento; es responsabilidad del usuario verificar la legalidad de los datos en su jurisdicción.
- Requisitos de preprocesamiento: es imprescindible respetar la guardia de aspecto (lado corto ≥ 32 px, ratio ≤ 5:1) para no cambiar significativamente los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/occurra/person_reid_siglip2_naflex_512d
- Copia en Hugging Face (apatc): https://huggingface.co/apatc/person_reid_siglip2_naflex_512d
- Repositorio SigLIP2 (referencia de arquitectura): https://github.com/Findit-AI/siglip2-naflex/tree/main/models/siglip2
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Torchreid (biblioteca de re-ID de referencia): https://github.com/KaiyangZhou/deep-person-reid
