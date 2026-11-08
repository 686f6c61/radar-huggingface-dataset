# introvoyz04/Cosmos-Reason2-8B-GGUF

## Resumen

Cosmos-Reason2-8B-GGUF es una conversión al formato GGUF del modelo vision-language NVIDIA Cosmos-Reason2-8B, publicada por el usuario introvoyz04 en Hugging Face. El modelo original es un VLM de 8.190.735.360 parámetros (8,19 B) desarrollado por NVIDIA, post-entrenado a partir de Qwen3-VL-8B-Instruct y orientado a razonamiento físico, robótica y sistemas embodied (physical AI). Esta conversión concreta empaqueta los pesos en BF16 divididos en cinco fragmentos GGUF más un proyector multimodal separado (mmproj), lo que permite ejecutar el modelo en llama.cpp sin necesidad de fusionar los archivos.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar localmente un VLM de razonamiento visual de tamaño medio (8 B) sobre infraestructura de consumo, algo que el checkpoint original en safetensors no facilita tan directamente. El repositorio ocupa 17,6 GB y declara licencia Apache-2.0, aunque el modelo base de NVIDIA se distribuye bajo la NVIDIA Open Model License, lo que introduce una discrepancia de licencia que conviene verificar antes de un uso comercial.

La arquitectura subyacente es la de Qwen3-VL (transformer vision-language con codificador visual y proyector multimodal), y la conversión requiere llama.cpp b7480 o superior para soportar dicha arquitectura. No se han publicado en la información disponible datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks específicos de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (split en 5 fragmentos GGUF); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (repositorio); modelo base bajo NVIDIA Open Model License |
| Formato de pesos | GGUF (BF16, split 00001-of-00005 a 00005-of-00005) + mmproj GGUF separado |

## Arquitectura y entrenamiento

El modelo base NVIDIA Cosmos-Reason2-8B es un VLM post-entrenado desde Qwen3-VL-8B-Instruct, según la información disponible. Esto implica una arquitectura transformer con un codificador visual acoplado mediante un proyector multimodal (empaquetado aquí como `mmproj-Cosmos-Reason2-8B-BF16.gguf`), y capacidades de razonamiento espacio-temporal orientadas a robótica y physical AI. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta conversión concreta no aporta entrenamiento adicional: es una transformación de formato de los pesos originales a GGUF en precisión BF16. El proceso de conversión mantiene el modelo dividido en cinco fragmentos que llama.cpp carga automáticamente sin necesidad de fusionarlos, y opcionalmente pueden combinarse con `llama-gguf-split --merge`. No se documentan innovaciones técnicas adicionales propias de esta conversión.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imagen y texto conjuntamente gracias al codificador visual y al proyector mmproj.
- Razonamiento visual espacio-temporal, orientado a escenas físicas, robótica y sistemas embodied (según la descripción del modelo base).
- Conversación multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un VLM de 8 B en estaciones de trabajo con GPU de consumo: al estar en GGUF BF16 y ser compatible con llama.cpp, permite ejecutar razonamiento visual sin depender de servicios en la nube, usando `llama-cli` con el flag `--mmproj`.
- Análisis de imágenes en entornos de robótica o simulación: el modelo base está orientado a razonamiento físico y espacio-temporal, por lo que encaja en tareas de descripción de escenas e interpretación de entradas visuales de sensores.
- Prototipado rápido de aplicaciones vision-language: la disponibilidad en GGUF simplifica la integración en scripts y pipelines de experimentación con llama.cpp antes de migrar a un despliegue de producción.
- Evaluación comparativa de modelos VLM en local: al ser una conversión BF16, conserva la precisión del original y sirve como referencia para medir el impacto de futuras cuantizaciones sobre el mismo modelo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, las imágenes no salen del equipo, lo que resulta adecuado para datos sensibles.
- Integración en flujos de trabajo con línea de comandos: la carga de fragmentos split y el modo conversacional (`-cnv`) permiten incorporar el modelo a herramientas de terminal y scripts automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos del modelo (8,19 B × 2 bytes), más el proyector visual y la caché KV, por lo que conviene contar con 20 GB o más.
- GPU recomendadas: A100, H100 o RTX 4090 (24 GB) para BF16 completo; GPUs con menos VRAM requerirán cuantizaciones adicionales no incluidas en este repositorio.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB o más (por ejemplo RTX 3090 o RTX 4090) en BF16; en GPUs de 16 GB no cabe sin cuantizar.
- Opciones de despliegue: llama.cpp (versión b7480 o superior, obligatoria para la arquitectura qwen3vl). Ollama y LM Studio pueden presentar problemas de compatibilidad con modelos qwen3vl según las notas del autor.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| introvoyz04/Cosmos-Reason2-8B-GGUF | 8,19 B | no disponible | GGUF BF16 (split) | apache-2.0 (repo) | Conversión de terceros; requiere llama.cpp b7480+ |
| nvidia/Cosmos-Reason2-8B | 8,767 B (según fuente web) | no disponible | safetensors | NVIDIA Open Model License | Modelo base original de NVIDIA |
| prithivMLmods/Cosmos-Reason2-8B-GGUF | no disponible | no disponible | GGUF | no disponible | Otra conversión comunitaria del mismo modelo base |
| robertzty/Cosmos-Reason2-8B-GGUF | no disponible | no disponible | GGUF BF16 (split) | no disponible | Conversión con estructura de archivos idéntica |

## Limitaciones y advertencias

- Discrepancia de licencia: el repositorio declara Apache-2.0, pero el modelo base NVIDIA Cosmos-Reason2-8B se distribuye bajo la NVIDIA Open Model License; conviene verificar los términos aplicables antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos vision-language, no cuantificado en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Longitud de contexto e idiomas soportados no documentados en esta ficha.
- Compatibilidad limitada: requiere llama.cpp b7480 o superior; Ollama y LM Studio pueden fallar con la arquitectura qwen3vl.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es una conversión de terceros sin validación comunitaria aparente.
- El repositorio no incluye cuantizaciones de menor precisión (Q4, Q5, Q8), por lo que el despliegue en GPUs de menos de 20 GB requerirá generarlas manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/introvoyz04/Cosmos-Reason2-8B-GGUF
- Modelo base: https://huggingface.co/nvidia/Cosmos-Reason2-8B
- Conversión alternativa (prithivMLmods): https://huggingface.co/prithivMLmods/Cosmos-Reason2-8B-GGUF
- Conversión alternativa (robertzty): https://huggingface.co/robertzty/Cosmos-Reason2-8B-GGUF
