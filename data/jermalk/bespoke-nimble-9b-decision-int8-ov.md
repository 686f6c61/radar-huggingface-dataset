# jermalk/Bespoke-Nimble-9B-decision-int8-ov

## Resumen

Bespoke-Nimble-9B-decision-int8-ov es la conversion a OpenVINO del modelo Bespoke-Nimble-9B de Bespoke Labs (un adaptador LoRA sobre Qwen3.5-9B), publicada por el usuario jermalk. No es un modelo generativo ni de chat: es un modelo de decision tipada que responde a preguntas de opcion multiple, si/no y escalas ordinales puntuando los tokens de respuesta tras un unico prefill. El repositorio solo realiza la conversion y el grafo editado, y declara no estar afiliado ni respaldado por Bespoke Labs ni por el equipo de Qwen.

El modelo se distribuye como IR de OpenVINO con pesos int8 asimetricos por canal (NNCF), estado interno (stateful IR) y una edicion de grafo que inserta un Gather de la ultima posicion antes del `lm_head`, de modo que la salida `logits` es `[batch, 1, vocab]` en lugar de `[batch, seq, vocab]`, acelerando el prefill 9B aproximadamente 1,75x sin alterar las probabilidades (|Δp| ≤ 1e-5).

Es relevante ahora porque encaja con el endpoint `/v1/systemone` compatible con Ollama de RustedVINO 0.8.0, esta pensado para ejecutarse en GPUs y CPUs Intel mediante OpenVINO, y ofrece prediccion estructurada determinista con una ventana de contexto de 8194 tokens. Licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), texto extraido a `Qwen3_5ForCausalLM`, con capas de atencion lineal |
| Parametros totales | 9B (segun denominacion del modelo base Qwen3.5-9B) |
| Longitud de contexto | 8194 (8192 tokens de prompt + 2 posiciones de scoring) |
| Tipos de cuantizacion | int8 asimetrica por canal (NNCF); el modelo de referencia en Ollama usa Q8_0 GGUF |
| Idiomas soportados | Ingles (centrado en ingles, como el adaptador original) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml/.bin`); safetensors en el modelo original; GGUF Q8_0 en la version de Ollama |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, sobre la que se aplica el adaptador LoRA `bespokelabs/Bespoke-Nimble-9B` (release `v3-12026`, `adapter_model.safetensors` con sha256 `29ef39b072dee97287947455337879c1e916705c2f727287922a2d81f5e2f20a`). El proceso de conversion (1) fusiona el LoRA en la base con `peft merge_and_unload` sobre `Qwen3_5ForConditionalGeneration`, (2) extrae el modelo de texto a `Qwen3_5ForCausalLM` descartando la torre de vision, manteniendo los pesos del modelo de lenguaje sin cambios, y (3) exporta a OpenVINO con optimum-intel 2.2.0 (`--task text-generation-with-past --weight-format int8`), generando un IR stateful con OpenVINO 2026.2.1.

La innovacion tecnica relevante es la edicion de grafo (paso 4): se inserta un Gather de la ultima posicion antes del `lm_head`, de forma que los `logits` se emiten como `[batch, 1, vocab]`. Esto reduce el coste del prefill 9B en torno a 1,75x. El modelo no genera texto: puntua los tokens de respuesta candidatos (codigos de una sola pieza `A`, `B`, … con ids en `decision.json`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO del adaptador original.

## Capacidades

- Prediccion estructurada de decisiones tipadas: opciones multiples (hasta 26 opciones, limite del formato de Ollama), preguntas si/no y puntuaciones ordinales.
- Puntuacion de respuestas mediante tokens de una sola pieza `A`–`Z` tras un unico prefill, devolviendo una distribucion de probabilidad normalizada sobre las opciones.
- Procesamiento de hasta 8192 tokens de prompt por pregunta (contexto total 8194).
- Ejecucion sobre GPUs y CPUs Intel mediante OpenVINO, con IR stateful y soporte de reutilizacion de estado.
- Integracion con el endpoint `/v1/systemone` compatible con Ollama de RustedVINO 0.8.0 mediante un fichero lateral `decision.json` (formato de prompt, system prompt, ids de letras A–Z, longitud de contexto).
- Idiomas: centrado en ingles; no se declara soporte multilingue.
- No es un modelo de generacion de texto ni de chat. No se documentan capacidades de tool calling, function calling, agentes, vision (la torre de vision se elimina), audio ni modo thinking (el chat template se usa con thinking desactivado).

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: dado un estado o mensaje como "Our checkout has returned 500 errors since 9am", se formula una pregunta tipada (por ejemplo, `{"type":"noul","instructions":"Is the customer asking for a refund?"}`) y el modelo devuelve la probabilidad de cada opcion, util para enrutar conversaciones sin generar texto.
- Triage y enrutamiento de tickets: convertir el contenido de un ticket en una decision ordinal o de si/no (prioridad, categoria) y usar la distribucion de probabilidad para decidir el destino con un umbral configurable.
- Extraccion de campos estructurados: formular preguntas de si/no sobre la presencia de un dato en el contexto (por ejemplo, si se menciona un numero de pedido) y convertir la decision en un campo booleano del registro.
- Moderacion y filtrado por politicas: usar decisiones tipadas para clasificar contenido contra reglas concretas, aprovechando que no se necesita generacion y que la salida es una probabilidad calibrada por token.
- Analisis de encuestas y sentimiento ordinal: transformar respuestas abiertas en escalas ordinales mediante scoring de las opciones, agregando despues las probabilidades a nivel de sistema.
- Automatizacion de flujos de decision en agentes: integrar el modelo como paso de decision determinista dentro de un pipeline multi-paso, donde un agente mayor decide y este modelo valora opciones concretas sin producir texto libre.
- Control de calidad y evaluacion: comparar variantes de modelos o prompts usando la distribucion de probabilidad de las opciones como señal, gracias a la reproducibilidad de la IR en CPU y en la GPU Arc 140V.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se incluyen resultados de validacion comparativa frente al modelo `nimble` de Ollama (Q8_0 GGUF) sobre una Intel Arc Pro B70, con protocolo preregistrado de 399 preguntas y referencia fp32:

| Metrica | Resultado |
|---|---|
| Cambios en la respuesta principal frente a Ollama (qualified por margen) | 0 / 352 |
| \|Δp\| media frente a Ollama | 0,0124 |
| Deriva frente a fp32 (media L∞) | 0,0113 (frente a 0,0064 de Q8_0 de Ollama); el criterio "no peor que Ollama" no se cumplio por 0,0049 |
| Protocolo de fixtures | 83/83 peticiones devuelven los codigos de estado de Ollama |
| Latencia | 2–3x mas rapido que Ollama con 1–4 preguntas por llamada, igual a 16 y 3x mas lento a 64 (sin reutilizacion de prefijo compartido) |
| Determinismo | Repeticiones exactas en CPU y en Arc 140V; en B70 las repeticiones difieren en algunas longitudes de prompt, con ≤ 0,003 en probabilidad en peticiones reales |

## Requisitos de hardware

- VRAM estimada: 9,5 GB segun la configuracion de ejemplo (`"vram_gb": 9.5`).
- GPUs probadas: Intel Arc Pro B70 y Arc 140V (integrada). El modelo esta orientado a GPUs y CPUs Intel a traves de OpenVINO.
- No usar la NPU: su modo LLM corrompe el estado recurrente de esta familia de modelos.
- Despliegue: RustedVINO 0.8.0 (endpoint `/v1/systemone` compatible con Ollama) o OpenVINO directo. Ejemplo de compilacion sobre `"GPU"` con `DYNAMIC_QUANTIZATION_GROUP_SIZE=0`.
- Recomendaciones operativas: mantener la cuantizacion dinamica desactivada (desplaza las probabilidades) y ejecutar una secuencia sin padding por llamada, porque las capas de atencion lineal ignoran `attention_mask`.
- Latencia y throughput: 2–3x mas rapido que Ollama con 1–4 preguntas por llamada, igual a 16 y 3x mas lento a 64 (sin reutilizacion de prefijo compartido todavia). No se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Bespoke-Nimble-9B-decision-int8-ov (este) | 9B | 8194 | OpenVINO IR int8 por canal | Apache-2.0 | Solo decision tipada, no generativo; estadoful |
| bespokelabs/Bespoke-Nimble-9B | 9B | no disponible | safetensors (adaptador LoRA) | Apache-2.0 | Modelo original; admite mas de 26 opciones en su builder |
| Qwen/Qwen3.5-9B | 9B | no disponible | safetensors | Apache-2.0 | Modelo base multimodal; la torre de vision se descarta en esta conversion |
| Ollama `nimble` (Q8_0 GGUF) | 9B | no disponible | GGUF Q8_0 (bloques de 32 elementos) | no disponible | Referencia comparativa; deriva fp32 menor (0,0064) que la int8 por canal |

## Limitaciones y advertencias

- No es un modelo de chat ni generativo: solo puntua opciones tipadas; no debe usarse para generar texto libre.
- Limite de 8192 tokens de prompt por pregunta (contexto total 8194). No se dispone de informacion sobre sesgos conocidos mas alla de los heredados del adaptador original.
- Maximo de 26 opciones por pregunta (limite del formato de Ollama); el builder original de Bespoke permite mas.
- Centrado en ingles, como el adaptador original; sin soporte multilingue declarado.
- Riesgo de deriva numerica: la int8 por canal es mas gruesa que los bloques de 32 elementos de Q8_0; la deriva media L∞ frente a fp32 (0,0113) es mayor que la de Ollama (0,0064).
- Determinismo no perfecto en Intel Arc Pro B70: las repeticiones pueden diferir hasta 0,003 en probabilidad en algunas longitudes de prompt.
- No usar la NPU; la cuantizacion dinamica debe permanecer desactivada.
- Ejecutar una secuencia sin padding por llamada (las capas de atencion lineal ignoran `attention_mask`).
- Temperatura de calibracion 1,0: el modelo original no incluye temperatura ajustada.
- El autor recomienda evaluar sobre datos propios antes de confiar en las probabilidades. Uso comercial permitido bajo Apache-2.0, sujeto a los terminos y avisos de las fuentes originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jermalk/Bespoke-Nimble-9B-decision-int8-ov
- Modelo base (LoRA): https://huggingface.co/bespokelabs/Bespoke-Nimble-9B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- RustedVINO (repositorio): https://github.com/Jermalk/rustedvino-oe
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
