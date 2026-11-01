# oliver0804/Kanana-2-1.3B-Instruct-RK3588-hybrid-rknn

## Resumen

Kanana-2-1.3B-Instruct-RK3588-hybrid-rknn es una conversión del modelo instructivo Kanana-2-1.3B-Instruct, desarrollado originalmente por KAKAO Corp., a un formato híbrido RKNN para su ejecución sobre la NPU del SoC Rockchip RK3588 y RK3588S. La conversión, publicada por el usuario oliver0804, no es un modelo nuevo: es una re-segmentación de los pesos originales en 33 segmentos RKNN en fp16 que cubren todas las multiplicaciones de matrices, mientras que el núcleo de atención se ejecuta en fp32 sobre la CPU. El objetivo es demostrar que es posible servir arquitecturas tipo Qwen3 con doble variante de RoPE (sliding-window con RoPE plano y atención completa con YaRN) en hardware de borde sin soporte nativo en las herramientas oficiales.

El modelo base emplea capas de estilo Qwen3 con dos variantes de RoPE por tipo de capa, algo que rkllm 1.3.1 no puede expresar (ignora silenciosamente `rope_scaling`). Por ello, esta conversión incluye un motor de inferencia propio que aplica el escalado YaRN por tipo de capa a partir de `meta2.json`. La verificación frente a la implementación oficial de HuggingFace reporta un argmax idéntico al 100 % en decodificación voraz, incluido el tramo en el que el búfer circular de ventana deslizante se desborda.

Es relevante ahora como prueba de concepto para quienes despliegan LLM en placas RK3588: demuestra que el motor híbrido cubre arquitecturas con doble RoPE, pero también documenta con honestidad sus límites de rendimiento (2,2 tok/s, NPU ocupada solo el 35 % del tiempo de generación). El autor lo describe explícitamente como una prueba funcional, no como una recomendación de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3, con capas de atención de ventana deslizante (RoPE plano) y de atención completa (YaRN, factor 40), re-segmentada en 33 segmentos RKNN híbridos |
| Parametros totales | 1,3B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 para los segmentos RKNN (matmuls en NPU) y fp32 para el núcleo de atención en CPU; embeddings en fp16 (`embed_f16.npy`) |
| Idiomas soportados | chino (zh), coreano (ko), inglés (en) |
| Licencia | Kanana Open License Agreement (uso no comercial gratuito; uso comercial requiere licencia separada de KAKAO Corp.) |
| Formato de pesos | RKNN (segmentos `seg*.rknn`), `embed_f16.npy`, `meta2.json`, `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 1,3B parámetros con capas de estilo Qwen3 que alternan dos tipos de atención: capas de ventana deslizante con RoPE plano y capas de atención completa con escalado YaRN (factor 40, escalado de atención ≈ 1,369). Esta conversión no entrena ni afina el modelo: parte de los pesos de `kakaocorp/kanana-2-1.3b-instruct` y los re-segmenta. Los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información disponible.

La innovación técnica de esta ficha es el motor de inferencia híbrido. Las 33 llamadas secuenciales a la NPU por token ejecutan todas las multiplicaciones de matrices en fp16, mientras que la atención se resuelve en fp32 sobre la CPU. El escalado YaRN y las frecuencias inversas por tipo de capa se leen de `meta2.json` (`rope_scale`), algo que rkllm 1.3.1 no soporta. La verificación frente a la implementación oficial de HuggingFace confirma un argmax idéntico al 100 % en decodificación voraz, incluido el tramo posterior a 1024 tokens donde el búfer circular de ventana deslizante se desborda. Como nota de reconstrucción, `rknn-toolkit2` 2.5.0 sufre un SIGFPE al compilar un grafo cuya salida es la propia entrada, por lo que el segmento 0 exporta únicamente q/k/v y el motor lee la lista `outputs` de `meta2.json`.

## Capacidades

- Generación de texto conversacional en chino, coreano e inglés.
- Razonamiento y respuesta a preguntas de tipo instructivo, heredadas del modelo base Kanana-2-1.3B-Instruct.
- Decodificación voraz (greedy) verificada como idéntica a la implementación oficial de HuggingFace.
- Ejecución de todas las multiplicaciones de matrices en la NPU del RK3588 en fp16, con atención en fp32 en CPU.
- Modo "thinking" desactivable (el benchmark se ejecuta con thinking off).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Prueba de concepto de despliegue de LLM en placas RK3588: permite validar que un motor híbrido NPU/CPU puede servir arquitecturas con doble variante de RoPE en hardware de borde, usando el CLI `runtime/chat.py` incluido.
- Referencia para desarrolladores de motores de inferencia: el código del motor y el `meta2.json` documentan cómo aplicar escalado YaRN por tipo de capa y cómo gestionar el búfer circular de ventana deslizante, útil para portar otras arquitecturas tipo Qwen3.
- Evaluación de viabilidad en dispositivos de borde con 8 GB de RAM: con un pico de RSS de ~4,0 GB, sirve para medir si una placa RK3588S puede alojar un modelo de 1,3B junto al resto del sistema.
- Prototipado de asistentes conversacionales en chino tradicional, coreano o inglés sobre hardware de bajo consumo, aceptando el rendimiento reducido de 2,2 tok/s.
- Base para comparativas de rendimiento entre el motor híbrido propio y la vía oficial rkllm (el hermano de 3B vía rkllm alcanza 5,5/7 a 8,1 tok/s), útil para decidir qué ruta de despliegue adoptar.
- Investigación sobre cuellos de botella en inferencia en NPU: el dato de que la NPU está ocupada solo el ~35 % del tiempo de generación con 33 llamadas secuenciales por token sirve para justificar optimizaciones de fusión de segmentos o reducción de overhead de Python.

## Benchmarks y rendimiento

Evaluación del autor en Radxa ROCK 5C (RK3588S, 8 GB), relojes fijados, decodificación voraz, thinking off, benchmark de 7 preguntas en chino tradicional:

| Métrica | Resultado |
|---|---|
| Puntuación | 3 / 7 |
| Generación | 2,2 tok/s |
| Prefill | 2,2 tok/s (token a token) |
| Tiempo de carga | 24 s (33 segmentos) |
| Memoria (pico RSS) | ~4,0 GB |
| Ocupación de la NPU durante la generación | ~35 % |

Comparativa interna del propio autor: el modelo hermano de 3B servido vía rkllm obtiene 5,5/7 a 8,1 tok/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Placa Rockchip RK3588 o RK3588S (probado en Radxa ROCK 5C con 8 GB de RAM).
- Memoria: pico de RSS de ~4,0 GB durante la inferencia; se recomienda al menos 8 GB en la placa.
- Software: `librknnrt.so` 2.5.0 y `rknnlite` (de airockchip/rknn-toolkit2), más `pip install numpy tokenizers`.
- No cabe en GPU de consumo convencional: el formato de pesos es RKNN específico de la NPU Rockchip, no safetensors ni GGUF, por lo que no es desplegable en vLLM, llama.cpp, Ollama ni TGI.
- Despliegue mediante el motor incluido en `runtime/` (`python runtime/chat.py . --tok kanana2 --prompt "你好"`).
- Rendimiento medido: 2,2 tok/s en generación y prefill, 24 s de carga. El autor advierte que el rendimiento está limitado por el overhead de Python y de formato en las 33 llamadas secuenciales a la NPU por token, no por la NPU en sí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-1.3B-Instruct-RK3588-hybrid-rknn (esta ficha) | 1,3B | no disponible | 3/7, 2,2 tok/s en RK3588S | Kanana Open License (comercial con licencia de KAKAO) | HuggingFace, formato RKNN |
| Kanana-2-3B vía rkllm (referencia del autor) | 3B | no disponible | 5,5/7, 8,1 tok/s en RK3588S | Kanana Open License | Vía rkllm |
| kakaocorp/kanana-2-1.3b-instruct (modelo base) | 1,3B | no disponible | no disponible | Kanana Open License | HuggingFace, pesos originales |

## Limitaciones y advertencias

- Rendimiento bajo: 2,2 tok/s y 3/7 en el benchmark del autor; la NPU está ocupada solo el ~35 % del tiempo de generación por el overhead de las 33 llamadas secuenciales por token.
- El propio autor lo describe como una prueba funcional del motor híbrido, no como una recomendación de despliegue en producción.
- Solo funciona en hardware Rockchip RK3588/RK3588S con `librknnrt.so` 2.5.0; no es portable a GPU convencionales ni a otros formatos de pesos.
- Idiomas limitados a chino, coreano e inglés; no se documenta soporte de castellano.
- Licencia restrictiva: el uso comercial (oferta de API, integración en productos, embebido en dispositivos vendidos a terceros) requiere una licencia separada de KAKAO Corp.; el uso no comercial es gratuito.
- Pesos modificados (re-segmentados a RKNN) respecto al modelo base; la model card exige mantener la atribución "Powered by Kanana" y el aviso `NOTICE`.
- Riesgo de alucinación y sesgos inherentes al modelo base de 1,3B, no evaluados en la información disponible.
- Longitud de contexto no documentada; la verificación de identidad con HuggingFace cubre más allá de 1024 tokens por el desbordamiento del búfer de ventana deslizante, pero no se especifica el máximo.
- Dependencia de una versión concreta de `rknn-toolkit2` (2.5.0) con un fallo conocido (SIGFPE) que condiciona la reconstrucción de los segmentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oliver0804/Kanana-2-1.3B-Instruct-RK3588-hybrid-rknn
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-1.3b-instruct
- Licencia del modelo base: https://huggingface.co/kakaocorp/kanana-2-1.3b-instruct/blob/main/LICENSE
- rknn-toolkit2 (airockchip): https://github.com/airockchip/rknn-toolkit2
