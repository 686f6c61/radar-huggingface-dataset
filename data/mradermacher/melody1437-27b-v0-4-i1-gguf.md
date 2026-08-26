# mradermacher/Melody1437-27B-v0.4-i1-GGUF

## Resumen

Melody1437-27B-v0.4-i1-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Melody1437-27B-v0.4, realizada por mradermacher. El modelo original es un transformer de 27 320 millones de parámetros, orientado a tareas de roleplay y conversación, con etiquetas que indican contenido explícito y no alineado. Esta versión cuantizada busca facilitar su ejecución en hardware de consumo, reduciendo el tamaño de los pesos mediante técnicas de cuantización con imatrix.

La relevancia de esta ficha radica en que ofrece una alternativa accesible para desarrolladores que deseen experimentar con un modelo de gran tamaño sin necesidad de GPUs de alta gama. Al estar licenciado bajo Apache 2.0, permite uso comercial y modificación, aunque su naturaleza "unaligned" y "dangerous" implica riesgos importantes en producción. No se dispone de información pública sobre la arquitectura interna, el entrenamiento o los benchmarks del modelo base, por lo que esta ficha se limita a los datos de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentarios del autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base (número de capas, tipo de atención, etc.) ni sobre su proceso de entrenamiento (dataset, tokens, método de alineación). La cuantización fue realizada por mradermacher utilizando la técnica imatrix, que optimiza la asignación de bits según la importancia de cada tensor. El repositorio incluye un archivo imatrix de 0.1 GB para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto conversacional y roleplay, según las etiquetas del modelo (roleplay, ERP, explicit).
- Soporte de contenido NSFW y no alineado, lo que implica que puede generar respuestas sin filtros de seguridad.
- Capacidad multilingüe limitada al inglés (idioma declarado).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión u otras capacidades especiales.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones de personaje con contexto largo, aunque no se especifica la longitud de contexto exacta. Adecuado para entornos de entretenimiento privado.
- Generación de narrativa creativa: útil para escribir historias o diálogos con tono explícito, gracias a su entrenamiento orientado a contenido adulto.
- Prototipado de chatbots sin restricciones: para investigar comportamientos de modelos no alineados en entornos controlados de laboratorio.
- Evaluación de técnicas de cuantización: al ser una versión GGUF con múltiples quants, permite comparar la degradación de calidad entre distintos niveles de compresión.
- Experimentación con imatrix: el archivo imatrix incluido permite a los desarrolladores crear cuantizaciones personalizadas para otros modelos.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_S (15.9 GB) puede ejecutarse en GPUs de consumo con 16 GB de VRAM, facilitando pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantización i1-Q4_K_S (15.9 GB), se necesitan al menos 16 GB de VRAM para inferencia básica; para i1-Q2_K (11.0 GB), unos 12 GB. Contexto largo aumentará el consumo.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) para las versiones más grandes. En consumer GPU, la RTX 4060 Ti de 16 GB podría ejecutar la Q4_K_S con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es el propósito principal.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (roleplay no alineado de ~27B). Se recomienda consultar el repositorio de mradermacher para otras cuantizaciones de modelos similares, como Melody1437-31B, pero no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido explícito y no alineado: el modelo puede generar respuestas ofensivas, peligrosas o ilegales. No es apto para uso en producción sin filtros adicionales.
- Riesgo de alucinación: al ser una cuantización, la calidad puede degradarse, aumentando la probabilidad de respuestas incoherentes o inventadas.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o leyes locales.
- No hay información sobre la longitud de contexto, lo que dificulta planificar aplicaciones con dependencia de contexto largo.
- La cuantización introduce pérdida de precisión; se recomienda usar la versión Q4_K_S como equilibrio entre calidad y tamaño.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Melody1437-27B-v0.4-i1-GGUF
- Repositorio estático con quants adicionales: https://huggingface.co/mradermacher/Melody1437-27B-v0.4-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-27B-v0.4
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
