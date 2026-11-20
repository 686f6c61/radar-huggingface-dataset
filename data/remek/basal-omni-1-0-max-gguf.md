# Remek/basal-omni-1.0-max-GGUF

## Resumen

basal-omni-1.0-max-GGUF es la versión cuantizada en formato GGUF del modelo basal-omni-1.0-max, un modelo de 12B parámetros construido sobre Gemma 4 12B y orientado a la toma de decisiones tipadas (typed decisions). Lo desarrolla Remek y se distribuye con licencia Apache 2.0. No es un modelo de chat generalista: está diseñado para emitir decisiones estructuradas sobre conjuntos de opciones (hasta 255), con probabilidades calibradas que permiten automatizar respuestas con umbrales de error controlados.

La relevancia de esta ficha concreta está en el port a GGUF: permite ejecutar el modelo en llama.cpp y Ollama sobre GPU NVIDIA, Apple Silicon (Metal) o CPU, manteniendo la misma API de decisión tipada a través del servidor `basal-serve`. Solo se publican dos cuantizaciones, Q8_0 y Q6_K, porque son las únicas que superan la puerta de validación del proyecto frente al modelo bf16 original (Q5_K_M y Q4_K_M no la superan y no se distribuyen).

El modelo es experimental y de texto únicamente en esta variante: los codificadores de imagen y audio del modelo base no están incluidos en los ficheros GGUF. Su valor práctico reside en la calibración: con el fichero `CALIBRATION.gguf.json`, el 47,9% de las decisiones se resuelven automáticamente con un error observado del 0,5% para un objetivo del 1%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 12B), adaptado como modelo de decisión tipada |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens con el motor basal; 8.192 tokens probados en Apple Silicon de 24 GB; 4.096 tokens en modo Ollama |
| Tipos de cuantizacion | Q8_0 (12,7 GB) y Q6_K (9,8 GB); F16 (23,8 GB) generado como referencia pero no distribuido |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Gemma 4 de 12B parámetros. Sobre esa base, el proyecto basal implementa una capa de decisión tipada: el servidor renderiza un prompt propio y lee las probabilidades de los códigos de opción, en lugar de generar texto libre. Los ficheros GGUF se obtuvieron con `convert_hf_to_gguf.py` de llama.cpp b11312 a partir del modelo bf16 (solo el decodificador de texto), y Q6_K se generó con `llama-quantize` desde F16 sin importance matrix. La conversión en Linux (CUDA) y macOS produce ficheros idénticos byte a byte.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La calibración (`CALIBRATION.gguf.json`) se ajustó sobre las lecturas Q8_0 del port, con temperaturas por tipo y por bucket y umbrales certificados para errores del 1% y del 5%. La validación frente a bf16 se hizo sobre el conjunto de desarrollo dev v2 (10.606 decisiones) en una RTX PRO 6000 de 96 GB con CUDA.

## Capacidades

- Toma de decisiones tipadas sobre conjuntos de 2 a 255 opciones, con tipos de consulta `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificación con probabilidades calibradas y umbrales de error certificados (1% y 5%).
- Automatización selectiva: el sistema decide cuándo responder solo y cuándo derivar, en función de la calibración.
- Soporte de tool calling mediante el tipo de consulta `tool`.
- Capacidades multilingües limitadas a polaco e inglés.
- Modo texto únicamente en esta variante GGUF; visión y audio requieren el modelo bf16.
- Integración con llama.cpp (modo `gguf`), Ollama (modo `ollama`, máximo 20 opciones y 4.096 tokens por prompt) y llama-cpp-python.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada incidencia en una categoría predefinida con probabilidad calibrada, derivando automáticamente solo los casos con confianza suficiente (47,9% de automatización al 1% de error objetivo).
- Moderación y etiquetado de contenido: asignar etiquetas múltiples (`multi`) a textos en polaco o inglés con umbrales de error medidos.
- Selección de herramientas en agentes: usar el tipo `tool` para que el modelo elija la función adecuada entre un conjunto definido, integrándose en un orquestador.
- Triaje en atención al cliente: decidir entre respuestas predefinidas o escalado a humano, aprovechando la calibración para fijar la tasa de error aceptable.
- Evaluación automática de respuestas: usar `score` para puntuar opciones o candidatos en pipelines de evaluación con criterios reproducibles.
- Despliegue en hardware modesto: ejecutar Q6_K (9,8 GB) en un Mac de 32 GB o en GPU consumer con suficiente VRAM, manteniendo la API de decisión mediante `basal-serve`.
- Clasificación de documentos largos: con el modo `gguf` y contexto de hasta 16.384 tokens, procesar documentos extensos que no caben en el límite de 4.096 tokens de Ollama.

## Benchmarks y rendimiento

Resultados del port GGUF frente al modelo bf16 servido como referencia (dev v2, 10.606 decisiones, RTX PRO 6000 96 GB, CUDA):

| Fichero | Tamano | Concordancia (2-10 opciones) | Margen >= 0,2 | Exactitud | ECE | Decisiones/s (16 en vuelo) | Puerta |
|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 12,7 GB | 0,9868 | 0,9983 | -0,07 pt | -0,0006 | 8,9 | PASS |
| Q6_K (menor) | 9,8 GB | 0,9761 | 0,9947 | -0,11 pt | -0,0046 | 7,5 | PASS |
| F16 (referencia, no distribuido) | 23,8 GB | 0,9930 | 0,9995 | no disponible | no disponible | no disponible | no disponible |

Datos adicionales:

- Q8_0 en Metal (Apple M4 Pro, 600 decisiones, contexto de 8.192 tokens): concordancia 0,9950, 1,0000 con margen >= 0,2, exactitud sin cambios, ECE +0,013 en 400 ítems de 2 a 10 opciones (frente a +0,001 en CUDA sobre los mismos ítems); 0,4 decisiones/s en proceso.
- Automatización con `CALIBRATION.gguf.json` (prueba de calibración de 8.560 decisiones, exactitud 0,904): al 1% de error objetivo, 47,9% de decisiones automáticas con error observado del 0,5%; al 5%, 82,5% con error observado del 4,0%.
- Los resultados de benchmarks del modelo base (Werdykt v1 0,823 y los conjuntos en polaco e inglés) están en la ficha de basal-omni-1.0-max; estos ficheros GGUF no se puntúan por separado en ellos.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere unos 12,7 GB de pesos más overhead de contexto; Q6_K, unos 9,8 GB. Con contexto de 16.384 tokens, Q8_0 no cabe en un Mac de 24 GB (se ejecutó con 8.192 tokens); se recomienda un Mac de 32 GB o Q6_K.
- GPU recomendadas: RTX PRO 6000 96 GB (medido), GPU NVIDIA con CUDA para llama-cpp-python; Apple Silicon con Metal.
- GPU consumer: Q6_K (9,8 GB) es viable en GPU con 12-16 GB de VRAM; Q8_0 requiere al menos 16 GB para contexto corto.
- Opciones de despliegue: `basal-serve` con `--mode gguf` (llama.cpp en proceso, recomendado para documentos largos y hasta 255 opciones), `--mode ollama` (Ollama 0.35 o superior, máximo 20 opciones y 4.096 tokens) y `--mode llamacpp`.
- Rendimiento medido: 8,9 decisiones/s con Q8_0 y 7,5 con Q6_K en RTX PRO 6000 con 16 peticiones en vuelo; 0,4 decisiones/s en proceso sobre Apple M4 Pro.
- Requiere el motor basal 2.2.0 o superior con el extra `gguf` (llama-cpp-python 0.3.36 o superior para soporte de Gemma 4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-max-GGUF | 11,9B | 16.384 (motor basal) | Decisión tipada calibrada, texto | Apache 2.0 | GGUF en Hugging Face |
| basal-omni-1.0-max (bf16) | 11,9B | no disponible | Decisión tipada, texto, imagen y audio | Apache 2.0 | Pesos bf16 en Hugging Face |
| Gemma 4 12B | 12B | no disponible | Modelo generalista de texto | Términos de Gemma (no disponible en detalle) | Pesos originales |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; no hay historial de producción documentado.
- Solo texto en esta variante: los codificadores de imagen y audio no están en los ficheros GGUF.
- Idiomas limitados a polaco e inglés; el rendimiento fuera de esos idiomas no está documentado.
- El modo Ollama limita a 20 opciones por pregunta (devuelve como máximo 20 log-probabilidades) y a 4.096 tokens por prompt.
- La calibración distribuida está ajustada para un único orden de opciones (el predeterminado); cambiar el orden invalida los umbrales certificados.
- Q6_K se sirve con el fichero de calibración ajustado sobre Q8_0, no sobre sus propias lecturas.
- El ECE en Metal es mayor que en CUDA (+0,013 frente a +0,001 en la misma muestra), con variación de aproximadamente 0,01 por el tamaño del bin.
- No se han publicado datos sobre sesgos, tasa de alucinación en texto libre ni comportamiento fuera de la API de decisión tipada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Gemma 4.
- Un `ollama run` directo solo produce texto libre; las respuestas tipadas requieren `basal-serve` por delante.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Remek/basal-omni-1.0-max-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
