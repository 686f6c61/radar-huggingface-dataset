# foxAIengineer/Qwen3-Coder-Next-colibri-i4-gs64

## Resumen
Qwen3-Coder-Next-colibri-i4-gs64 es una conversión del modelo Qwen3-Coder-Next-80b-FP8 (familia Qwen3-Next de Alibaba) al formato de contenedor del motor de inferencia colibrì, que transmite los expertos enrutados desde disco en lugar de mantenerlos en memoria. La conversión, publicada por el usuario foxAIengineer, no entrena ni modifica el modelo original: únicamente cambia el esquema de pesos para hacer viable su ejecución en hardware con memoria limitada.

El modelo base es un transformer híbrido de tipo MoE con 48 capas (36 de Gated DeltaNet y 12 de atención con compuertas), 512 expertos enrutados con top-10 y un experto compartido. La conversión cuantiza los expertos enrutados a int4 con una escala f32 por cada 64 entradas, mientras que atención, DeltaNet, experto compartido, router, embeddings, norma final y lm_head se almacenan en f16.

Es relevante porque demuestra una vía práctica para ejecutar un MoE de 80 mil millones de parámetros en entornos con poca VRAM, a costa de una pérdida de calidad no medida. El repositorio ocupa 48,2 GB y tiene 33 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 Gated DeltaNet + 12 atención con compuertas), 512 expertos enrutados top-10, experto compartido |
| Parametros totales | 80 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (top-10 sobre 512 expertos enrutados; el número exacto no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados int4 (gs 64, escala f32 por 64 entradas); resto de pesos en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en contenedor colibrì (`model-globals.safetensors` más pesos por capa) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del Qwen3-Next: un transformer híbrido que alterna capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención tradicional con compuertas. La capa MoE utiliza 512 expertos enrutados con selección top-10 más un experto compartido, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.

Esta conversión no aporta entrenamiento nuevo. El proceso parte de los pesos FP8 e4m3 del modelo original: los expertos enrutados se desquantizan usando sus escalas de bloque 128x128 (`weight_scale_inv`) y se recuantizan a int4 con una escala f32 por cada 64 entradas. Las proyecciones fusionadas de DeltaNet (`in_proj_qkvz` e `in_proj_ba`) se separan en `in_proj_qkv` + `in_proj_z` y `in_proj_b` + `in_proj_a`, tal como espera el motor colibrì. La herramienta empleada es `tools/convert_qwen36.py` del repositorio colibrì, con soporte añadido para tensores `*.weight_scale_inv`, que el conversor original rechazaba.

## Capacidades
- Generación de texto y razonamiento general, heredados del modelo base Qwen3-Coder-Next.
- Generación de código, presumiblemente la capacidad principal dado el nombre del modelo base; no se detalla en la información disponible.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso
- Ejecución de un MoE de 80B en estaciones de trabajo con VRAM limitada: colibrì transmite los expertos enrutados desde disco, de modo que solo se cargan en memoria los expertos activados por cada token, lo que permite servir el modelo sin un clúster de GPUs.
- Prototipado e investigación sobre modelos grandes: útil para experimentar con Qwen3-Coder-Next en entornos de desarrollo sin acceso a hardware de datacenter, aceptando la pérdida de calidad de int4.
- Asistencia de código en local: el modelo base está orientado a código, por lo que puede emplearse para autocompletado y generación de funciones en un flujo de trabajo offline.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de int4 gs64 frente al FP8 original en tareas de código, una vez realizados los benchmarks pertinentes.
- Despliegue en entornos con almacenamiento rápido: al depender del streaming de expertos desde disco, encaja en máquinas con NVMe de alta velocidad y VRAM moderada.
- Reproducción de la cadena de conversión: el comando documentado permite replicar el proceso sobre otras variantes del modelo base para generar contenedores colibrì propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado y que la calidad frente al FP8 original no está medida; solo se verificó una respuesta coherente a la pregunta "What is the capital of France?".

## Requisitos de hardware
- VRAM estimada: no disponible con precisión. El repositorio completo ocupa 48,2 GB en disco; el motor colibrì mantiene en memoria los pesos no expertos (atención, DeltaNet, experto compartido, router, embeddings y lm_head) y transmite los expertos enrutados desde disco.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; depende del presupuesto de memoria para pesos no expertos y del ancho de banda del almacenamiento.
- Opciones de despliegue: exclusivamente el motor colibrì (`./qwen36 16 4 ref_qwen36.json` o `coli chat --model <carpeta>`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-colibri-i4-gs64 (esta ficha) | 80B (MoE) | no disponible | int4 gs64 + f16 | Apache-2.0 | colibrì |
| Qwen/Qwen3-Coder-Next-80b-FP8 | 80B (MoE) | no disponible | FP8 e4m3 | Apache-2.0 | safetensors |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más informativa: esta conversión reduce el peso de los expertos de FP8 a int4, pero no se ha medido la diferencia de calidad ni de velocidad.

## Limitaciones y advertencias
- Pérdida de calidad por cuantización int4 no medida; el autor advierte explícitamente de que se debe esperar degradación frente al FP8 original.
- Verificación mínima: solo se comprobó una pregunta trivial; no hay evaluación sistemática de código, matemáticas ni razonamiento.
- Dependencia de un motor específico (colibrì) y de streaming de expertos desde disco, lo que exige almacenamiento rápido y añade latencia frente a una carga completa en memoria.
- Idiomas soportados, longitud de contexto y capacidades de tool calling no documentados en esta ficha.
- Riesgo de alucinación y sesgos: no evaluados para esta conversión; se heredan los del modelo base, no caracterizados aquí.
- Licencia Apache-2.0, permisiva para uso comercial, pero el autor no ofrece garantías sobre el comportamiento del contenedor convertido.
- El repositorio tiene un uso muy bajo (33 descargas, 0 likes), por lo que carece de validación comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/foxAIengineer/Qwen3-Coder-Next-colibri-i4-gs64
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Motor colibrì: https://github.com/JustVugg/colibri
