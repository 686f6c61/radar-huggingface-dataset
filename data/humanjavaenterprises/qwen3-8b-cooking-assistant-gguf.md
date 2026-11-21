# HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF

## Resumen

Qwen3-8B-Cooking-Assistant es un ajuste fino (fine-tune) del modelo Qwen3-8B de Alibaba, desarrollado por Humanjava Enterprises y especializado en asistencia culinaria. Su propuesta diferencial no es solo responder sobre cocina, sino gestionar la procedencia de la información: cuando el usuario aporta una receta, el modelo la lee y responde a partir de ella; cuando la pregunta requiere una receta que no se le ha proporcionado, el modelo pide la receta en lugar de inventar detalles. Según la model card, esta tasa de invención cae al 2,7 % frente al 25,8 % del Qwen3-8B base, y la precisión con la receta presente alcanza el 94,8 % frente al 83,1 % del base.

El modelo se distribuye principalmente en formato GGUF cuantizado para llama.cpp, Ollama y LM Studio, con pesos de precisión completa en safetensors en un repositorio hermano. Con 8.190.735.360 parámetros, está entrenado sobre 26 idiomas y evaluado en 21, y puede ejecutarse en una GPU de 6 GB con la cuantización Q4_K_M por defecto.

Es relevante ahora porque aborda un problema práctico muy concreto en asistentes de dominio: la alucinación de detalles en recetas (cantidades, tiempos, ingredientes) que puede tener consecuencias de seguridad alimentaria. El ajuste se hizo con DPO y una evaluación multi-juez abierta, y el autor publica versiones fechadas y checksums para trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B); ajuste fino con DPO |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de referencia (llama-server `-c 8192`); contexto nativo de Qwen3-8B no indicado en la información disponible |
| Tipos de cuantizacion | Q4_K_M (por defecto), Q6_K, Q8_0, BF16; imatrix para Q4_K_M y Q6_K |
| Idiomas soportados | Entrenado en 26 idiomas, evaluado en 21: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de 8.190.735.360 parámetros, y se ajusta mediante DPO (Direct Preference Optimization) sobre conversaciones de dominio culinario. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; sí indica que el ajuste se orientó a dos comportamientos: leer la receta proporcionada por el usuario y abstenerse (pedir la receta) cuando no dispone de ella, en lugar de inventar. El prompt de sistema recomendado refuerza esta conducta: "You are a cooking assistant. You answer questions about dishes, ingredients, techniques and food safety. When you are not sure, you say so."

Las cuantizaciones Q4_K_M y Q6_K se construyeron con una importance matrix calculada sobre conversaciones de entrenamiento en formato chat, estratificadas por tipo de pregunta y por si se mostró una receta, excluyendo el conjunto de evaluación. Los GGUF se publicaron con checksums (`SHA256SUMS`) y versiones etiquetadas como tags git (`v1`), lo que permite fijar revisiones. La evaluación empleó cuatro jueces abiertos con criterio de acuerdo de 3 de 4. La model card documenta correcciones de metadatos en los GGUF reemitidos el 2026-11-14 (pesos idénticos, solo cabecera) y una corrección de memoria el 2026-11-19 (el consumo de Q4_K_M a 8k era 5,84 GiB con caché KV por defecto, no 5,3 GB como se indicó inicialmente).

## Capacidades

- Generación de texto conversacional especializada en cocina: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura de recetas aportadas por el usuario en el turno de usuario y respuesta basada en ese texto.
- Abstención explícita y petición de la receta cuando la pregunta requiere información que no se ha proporcionado.
- Multilingüe: entrenado en 26 idiomas y evaluado en 21, incluidos español, portugués, italiano, francés, alemán, ruso, chino, japonés, árabe, hindi, bengalí, indonesio, turco y vietnamita.
- Modo thinking de Qwen3 disponible pero desactivado por recomendación (`enable_thinking: false` o `/no_think`); el autor advierte que algunas versiones de Ollama lo activan por defecto con la plantilla interna del GGUF.
- Compatible con endpoints y con el ecosistema llama.cpp/Ollama/LM Studio; el repositorio base en safetensors permite su uso con Transformers y vLLM.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente de cocina con recetas aportadas por el usuario: la aplicación pega la receta en el turno de usuario y el modelo responde a preguntas sobre sustituciones, tiempos o temperaturas leyendo ese texto, lo que reduce la invención de detalles.
- Seguridad alimentaria en aplicaciones de consumo: ante preguntas sobre conservación o cocción segura, el modelo tiende a pedir la receta o indicar incertidumbre en lugar de improvisar cifras, un comportamiento relevante cuando un dato erróneo tiene consecuencias sanitarias.
- Chatbot de recetario corporativo o editorial: integrado vía Ollama o llama-server, responde sobre el catálogo de recetas que la aplicación recupera y le pasa como contexto, sin memorizar el recetario.
- Despliegue en hardware modesto: con Q4_K_M ocupa 5,0 GB en disco y 5,84 GiB de VRAM a 8k de contexto en llama-server, por lo que cabe en GPU de 6 GB (con matices si la tarjeta también alimenta el display) y en tarjetas de 8 GB con Q6_K.
- Aplicación multilingüe de cocina: cubre 21 idiomas evaluados, útil para asistentes dirigidos a comunidades diversas sin desplegar un modelo por idioma.
- Evaluación de fiabilidad y abstención: sirve como caso de estudio de ajuste DPO para enseñar a un modelo a pedir información en lugar de alucinar, replicable en otros dominios.
- Prototipado local con LM Studio u Ollama: los tags `vveerrgg/qwen3-8b-cooking-assistant` permiten arrancar el modelo con un solo comando para pruebas de producto.

## Benchmarks y rendimiento

| Métrica | Qwen3-8B-Cooking-Assistant v1 | Qwen3-8B base |
|---|---|---|
| Invención de detalles sin receta (3 de 4 jueces) | 2,7 % | 25,8 % |
| Respuesta correcta con receta mostrada (3 de 4 jueces) | 94,8 % | 83,1 % |
| Respuestas generales de cocina | a la par del base | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de la evaluación propia del autor con cuatro jueces abiertos y acuerdo de 3 de 4, sobre el dataset `HumanjavaEnterprises/cooking-assistant-eval`.

Rendimiento de inferencia medido el 2026-11-19 en una NVIDIA RTX PRO 4000 Blackwell SFF (24 GB, 70 W), Q4_K_M, 8k de contexto, un usuario, thinking off, llama.cpp commit `08c252e2` y Ollama 0.40.16:

| Configuración | VRAM | Generación (tokens/s) | Prompt ~1k / ~8k (tokens/s) | Primer token | Arranque |
|---|---|---|---|---|---|
| Ollama | 5,96 GiB | 65,6 | 2.566 / 2.360 | 28,5 ms | 10,8 s |
| llama-server `-c 8192 -np 1` | 5,84 GiB | 65,1 | 2.556 / 2.317 | 20,3 ms | 3,1 s |

## Requisitos de hardware

- VRAM estimada: Q4_K_M 5,84 GiB en llama-server y 5,96 GiB en Ollama a 8k de contexto con caché KV por defecto; Q6_K 6,7 GB en disco (para tarjetas de 8 GB); Q8_0 8,7 GB; BF16 16,4 GB.
- En tarjetas de 6 GB que además alimentan un display, el autor recomienda reducir el contexto a 4.096 (unos 5,3 GiB), usar caché KV q8_0 (con pérdida) o dejar que Ollama descargue algunas capas a CPU.
- GPU recomendadas: cualquier GPU con 6 GB o más para Q4_K_M; 8 GB para Q6_K; 12 GB o más para Q8_0; 24 GB para BF16 o para Q4_K_M con contexto ampliado y concurrencia.
- Cabe en GPU de consumo: sí, con Q4_K_M en 6 GB y Q6_K en 8 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q6_K --jinja -c 8192`), Ollama (`ollama run vveerrgg/qwen3-8b-cooking-assistant:q6_k` o `hf.co/...`), LM Studio; pesos completos en safetensors para Transformers y vLLM.
- Latencia y throughput: 65 tokens/s de generación y 20-28 ms al primer token en la configuración medida; procesamiento de prompt de 2.300-2.600 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B-Cooking-Assistant (este) | 8,19 B | 8k en la config. de referencia | Cocina con abstención y lectura de recetas | Apache 2.0 | GGUF, safetensors |
| Qwen3-8B base | 8,19 B | no indicado en la información disponible | Propósito general | Apache 2.0 | safetensors |
| GLM-4-9B-Cooking-Assistant | no disponible | no disponible | Cocina, mismo enfoque de receta | no disponible | GGUF, safetensors |

El autor publica un modelo hermano, `HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant`, que aplica el mismo tratamiento al GLM-4-9B-0414 y cuya model card compara ambos sobre un mismo panel de jueces. No se dispone de otros modelos comparables de cocina en la información proporcionada.

## Limitaciones y advertencias

- No memoriza recetas: si la aplicación no le proporciona la receta, pedirá que se la den; no debe usarse como recetario autónomo.
- Riesgo de alucinación residual: 2,7 % de invención de detalles sin receta según la evaluación del autor, no cero.
- Las cifras de evaluación proceden de jueces automáticos abiertos, no de evaluación humana exhaustiva; deben interpretarse con cautela.
- La model card no detalla sesgos conocidos, composición del dataset ni volumen de entrenamiento.
- Advertencia operativa con Ollama: algunas versiones (vista en 0.40.16) usan la plantilla de chat del GGUF y activan thinking, lo que antepone razonamiento a la respuesta; los tags actualizados el 2026-11-19 lo corrigen, pero los tags `v1` fijados mantienen el comportamiento original. Desactivar thinking por petición con `"think": false`, `"reasoning_effort": "none"`, `--think=false` o `/set nothink`.
- Consumo de memoria: la cifra inicial de 5,3 GB a 8k era con caché KV q8_0; con la caché por defecto son 5,84 GiB, ajustado para tarjetas de 6 GB con display.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es un fine-tune no oficial de Qwen3-8B, no respaldado por Alibaba Cloud ni el equipo Qwen.
- Los GGUF se reemitieron el 2026-11-14 con metadatos limpios (pesos idénticos); conviene descargar de nuevo o hacer `ollama pull` para obtener los ficheros con checksums actualizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Repositorio base en safetensors: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Modelo hermano GLM-4-9B-Cooking-Assistant: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- GGUF del modelo hermano: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- llama.cpp: https://github.com/ggml-org/llama.cpp
