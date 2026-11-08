# McG-221/Gemory-26B-A4B-SOMPOA-mlx-8Bit

## Resumen

Gemory-26B-A4B-SOMPOA-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo 26B-Suite/Gemory-26B-A4B-SOMPOA, un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura derivada de Gemma 4, según los tags de la model card. Lo publica el usuario McG-221 en Hugging Face y su propósito es permitir la inferencia del modelo original en hardware Apple mediante la librería mlx-lm (versión 0.31.2 usada para la conversión). El modelo pesa 25.233.053.440 parámetros totales según los safetensors y el repositorio ocupa 26,8 GB.

El modelo base es un merge orientado a escritura creativa, roleplay y contenido para adultos, con las etiquetas "abliterated", "uncensored" y "heretic", lo que indica que se ha eliminado o reducido el alineamiento de seguridad del modelo original. Además, incorpora capacidades multimodales (image-text-to-text) y está etiquetado como MoE con la designación "A4B", que sugiere aproximadamente 4 mil millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

La relevancia de esta ficha radica en que se trata de una cuantización de 8 bits para MLX de un modelo de gran tamaño (26B) que, de otro modo, sería difícil de ejecutar en equipos Apple. No obstante, la información pública es muy escasa: no hay benchmarks, no se detalla la composición del dataset de entrenamiento ni el proceso de merge, y la model card se limita a las instrucciones de uso con mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Gemma 4 (según tags "gemma4" y "moe") |
| Parametros totales | 25.233.053.440 (25,2B) |
| Parametros activos | no disponible (la designación "A4B" sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base podría tener otras cuantizaciones no listadas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería transformers/mlx-lm) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un MoE con arquitectura Gemma 4, según los tags de la model card. El nombre "A4B" sugiere que se activan aproximadamente 4 mil millones de parámetros por token, pero no se proporciona confirmación ni detalles sobre el número de expertos, el enrutamiento o la dimensión de las capas. El modelo es multimodal (image-text-to-text), por lo que incorpora un codificador de visión, aunque no se especifica su arquitectura ni el proceso de alineamiento multimodal.

El modelo base es un merge de modelos (tag "merge") con modificaciones de tipo "abliterated", "uncensored" y "heretic", lo que implica que se ha intervenido sobre las capas de rechazo o alineamiento del modelo original. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. La conversión a MLX se realizó con mlx-lm 0.31.2, pero no se documenta el proceso de cuantización a 8 bits ni posibles pérdidas de calidad asociadas.

## Capacidades

- Generación de texto en inglés, orientada a escritura creativa, roleplay y contenido para adultos (tags "creative-writing", "roleplay", "erp").
- Capacidades multimodales de imagen a texto (image-text-to-text), según el pipeline y los tags.
- Modelo "uncensored" y "abliterated": se ha reducido o eliminado el alineamiento de seguridad, por lo que puede generar contenido que otros modelos rechazarían.
- Conversacional (tag "conversational"), adecuado para diálogos multi-turno.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés según el campo "language".

## Casos de uso

- Escritura creativa asistida: el modelo puede generar narrativa, diálogos y descripciones en inglés gracias a su orientación explícita a "creative-writing", aunque no se dispone de datos sobre calidad o coherencia en textos largos.
- Roleplay conversacional: su etiqueta "roleplay" y su naturaleza conversacional lo hacen adecuado para mantener personajes en interacciones multi-turno, siempre que el contexto lo permita (longitud no documentada).
- Generación de contenido para adultos: la naturaleza "uncensored" permite producir material erótico o explícito que modelos alineados rechazarían, con las implicaciones legales y éticas que ello conlleva.
- Prototipado en Apple Silicon: al estar en formato MLX 8 bits, permite probar un modelo de 25B en equipos Mac con memoria unificada, sin necesidad de GPUs NVIDIA.
- Investigación sobre alineamiento y seguridad: útil para estudiar el comportamiento de modelos "abliterated" y comparar respuestas frente a versiones alineadas.
- Descripción de imágenes en inglés: su capacidad image-text-to-text permite generar descripciones o responder preguntas sobre imágenes, aunque no se detalla la resolución o el formato de entrada soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 26,8 GB en 8 bits, por lo que se necesita al menos ~28-30 GB de memoria unificada para cargar el modelo completo, más espacio para el contexto y el codificador de visión.
- GPU recomendadas: al ser formato MLX, está pensado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior). No es directamente compatible con CUDA sin reconversión.
- ¿Cabe en GPU consumer? En Apple Silicon, sí en configuraciones de 32 GB o más (por ejemplo, Mac Studio o MacBook Pro M3/M4 Max). En GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabría en 8 bits sin offloading.
- Opciones de despliegue: mlx-lm (librería indicada en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemory-26B-A4B-SOMPOA-mlx-8Bit | 25,2B (MoE, ~4B activos sin confirmar) | no disponible | Apache 2.0 | MLX 8 bits | Hugging Face |
| 26B-Suite/Gemory-26B-A4B-SOMPOA (base) | 25,2B (MoE) | no disponible | Apache 2.0 | safetensors | Hugging Face |
| McG-221/Shadow-Siren-26B-A4B-mlx-8Bit | no disponible | no disponible | no disponible | MLX 8 bits | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": puede generar contenido ofensivo, explícito o dañino sin filtros; no es apto para aplicaciones de producción orientadas al público general sin moderación adicional.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad factual; al ser un merge orientado a creatividad, la precisión factual puede ser baja.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y las implicaciones del modelo "uncensored" son responsabilidad del usuario.
- Conversión MLX 8 bits: posible pérdida de calidad respecto al modelo base en precisión completa; no se documenta ninguna evaluación comparativa.
- Información muy escasa: no hay detalles sobre el dataset, el proceso de merge, la tokenizador ni la arquitectura exacta, lo que dificulta la reproducibilidad.
- El modelo base es un merge de terceros; la procedencia y los derechos de los modelos constituyentes no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/McG-221/Gemory-26B-A4B-SOMPOA-mlx-8Bit
- Modelo base: https://huggingface.co/26B-Suite/Gemory-26B-A4B-SOMPOA
- Modelo relacionado del mismo autor: https://huggingface.co/McG-221/Shadow-Siren-26B-A4B-mlx-8Bit
- Repositorio mlx-lm: no disponible en la información proporcionada
