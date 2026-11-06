# oliver0804/LFM3-1.7B-RK3588-hybrid-rknn

## Resumen

LFM3-1.7B-RK3588-hybrid-rknn es un port del modelo LiquidAI/LFM3-1.7B al NPU del SoC Rockchip RK3588 y RK3588S, publicado por el usuario oliver0804 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una re-segmentación y conversión a fp16 de los pesos originales de LiquidAI para que puedan ejecutarse sobre la NPU de estas placas de bajo consumo. El objetivo es claro: llevar un modelo de lenguaje de 1.700 millones de parámetros a hardware edge sin GPU dedicada, con un consumo y una huella de memoria contenidos.

La relevancia técnica del proyecto radica en que la herramienta oficial de conversión de Rockchip, rkllm 1.3.1, no puede convertir esta arquitectura: el soporte nativo de `lfm2` no contempla el sandwich norm, la attention gate ni el RoPE parcial de LFM3, y la vía de `custom_config` exige que todas las capas sean de atención, cuando la mitad de las capas de LFM3 son convoluciones cortas. El autor reconstruyó el grafo de cómputo a mano: las operaciones lineales corren en la NPU como segmentos RKNN en fp16 y el núcleo de atención (q·K, softmax, ·V y la puerta sigmoide) se ejecuta en fp32 sobre la CPU. Según la model card, este reparto no solo evita el error numérico de softmax y sigmoide en fp16 de la NPU (entre 14 y 20 veces el error ideal en fp16), sino que además acelera la generación un 60 % al eliminar el trasiego de la caché KV.

El resultado es un paquete de aproximadamente 4 GB con segmentos RKNN, tabla de embeddings en fp16, metadatos de cableado y un runtime de inferencia en Python. El modelo conserva el pipeline de text-generation y los idiomas del modelo base (inglés y chino), y está pensado para cargas de chat con decodificación token a token más que para contextos largos o agentes con prompts extensos, dado que el prefill se realiza de un token en un token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención y convoluciones cortas) heredado de LFM3; grafo reconstruido en segmentos RKNN con núcleo de atención en CPU |
| Parametros totales | 1.700 millones (1.7B, según el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (segmentos RKNN y tabla de embeddings); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | segmentos `.rknn` (fp16), `embed_f16.npy`, `meta2.json`, `tokenizer.json`, `generation_config.json` y runtime Python |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de LiquidAI emplea una arquitectura híbrida en la que aproximadamente la mitad de las capas son de atención y la otra mitad son convoluciones cortas, e incorpora innovaciones como sandwich norm, attention gate y RoPE parcial. Este repositorio no entrena ni afina el modelo: parte de los pesos de LiquidAI y los transforma. La conversión se hizo re-segmentando el grafo en grupos contiguos de matmuls que se compilan como segmentos RKNN independientes en fp16, mientras que el núcleo de atención se mantiene en fp32 en la CPU. Los pesos, por tanto, están modificados respecto al original (re-segmentados y convertidos a fp16).

La decisión de sacar la atención de la NPU responde a una medición concreta: el error de Softmax y Sigmoid en fp16 sobre la NPU del RK3588 es de 14 a 20 veces el error ideal en fp16. Además, al no tener que mover la caché KV entre NPU y CPU, la generación resulta un 60 % más rápida. El autor verificó que la salida es idéntica token a token a la implementación oficial en PyTorch con decodificación greedy, incluyendo el manejo del estado de las convoluciones, en pruebas unitarias, por segmentos y en placa. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, ya que esos datos corresponden al modelo base y no se reproducen aquí.

## Capacidades

- Generación de texto conversacional en inglés y chino, con decodificación token a token.
- Razonamiento y respuesta a preguntas de cultura general y conocimiento, según el benchmark de 7 preguntas en chino tradicional.
- Modo "thinking" desactivable: el benchmark se ejecutó con thinking off, lo que sugiere que el modelo base soporta un modo de razonamiento explícito.
- Ejecución íntegra en la NPU del RK3588/RK3588S para las operaciones lineales, con atención en CPU en fp32.
- Salida determinista verificada frente a PyTorch en modo greedy.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.
- Cobertura multilingüe limitada a inglés y chino.

## Casos de uso

- Asistente conversacional local en placa RK3588: el runtime `runtime/chat.py` permite lanzar un CLI de chat directamente en la placa con el tokenizador incluido, adecuado para prototipos de asistente en dispositivos sin conexión a la nube.
- Despliegue en dispositivos edge con restricciones de energía: al ejecutar las matmuls en la NPU y mantener la atención en CPU, el modelo cabe en placas de 8 GB como la Radxa ROCK 5C con un consumo de memoria de aproximadamente 3,5 GB.
- Chat de turnos cortos en chino e inglés: el benchmark de 7 preguntas en chino tradicional con 5 aciertos sobre 7 (igual que PyTorch fp32) respalda su uso en asistentes de soporte básico en ambos idiomas.
- Evaluación de arquitecturas híbridas en hardware Rockchip: el paquete de segmentos y `meta2.json` sirve como referencia para quienes quieran portar otros modelos con capas convolucionales a la NPU.
- Investigación en cuantización y reparto CPU/NPU: el proyecto documenta el error numérico de softmax y sigmoide en fp16 en la NPU, lo que lo convierte en un caso de estudio para diseñar estrategias de offload selectivo.
- Integración en pipelines de CI para validación de ports: la verificación token a token frente a PyTorch permite usar el runtime como test de regresión al modificar segmentos o versiones de `librknnrt.so`.
- No es adecuado para cargas con prompts largos o agentes de contexto extenso, ya que el prefill se hace token a token y ronda los 5 tok/s.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card y corresponden a una Radxa ROCK 5C (RK3588S, 8 GB), decodificación greedy, thinking desactivado y un benchmark de 7 preguntas en chino tradicional, sin relojes bloqueados:

| Metrica | Resultado |
|---|---|
| Puntuacion (7 preguntas zh-TW) | 5 / 7 (igual que PyTorch fp32) |
| Velocidad de generacion | 5,6 tok/s |
| Velocidad de prefill | ~5 tok/s (un token a la vez) |
| Memoria | ~3,5 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Placa Rockchip RK3588 o RK3588S con `librknnrt.so` versión 2.5.0 y la API Python `rknnlite` (wheel aarch64 de airockchip/rknn-toolkit2).
- Dependencias Python: `numpy` y `tokenizers`.
- Memoria: aproximadamente 3,5 GB en el benchmark con una placa de 8 GB; se recomienda al menos 8 GB de RAM para margen.
- Uso de los tres núcleos NPU (`NPU_CORE_0_1_2`).
- No cabe en GPU consumer convencionales porque el formato de pesos es específico de la NPU Rockchip; no se distribuyen pesos en safetensors ni GGUF en este repositorio.
- Opciones de despliegue: únicamente el runtime Python incluido en `runtime/`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 5,6 tok/s en generación y ~5 tok/s en prefill, sin relojes fijados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-RK3588-hybrid-rknn (este) | 1,7B | no disponible | RKNN fp16 para NPU RK3588 | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | safetensors, PyTorch | LFM Open License v1.0 | Hugging Face |
| LFM2 (soporte nativo en rkllm 1.3.1) | no disponible | no disponible | conversión estándar rkllm | no disponible | herramienta oficial de Rockchip |

La comparación con alternativas de la misma categoría (ports a NPU de modelos de ~1,7B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: no se permite el uso comercial a empresas con ingresos anuales iguales o superiores a 10 millones de dólares.
- Los pesos están modificados respecto al modelo base (re-segmentados y en fp16), por lo que las garantías del modelo original pueden no aplicarse de forma idéntica.
- El prefill se realiza token a token, lo que hace inviable el uso con prompts largos y cargas de agentes con contexto extenso.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación inherente al modelo base de 1,7B, agravado por la falta de benchmarks estándar publicados.
- El benchmark es reducido (7 preguntas) y se ejecutó sin relojes bloqueados, por lo que las cifras de velocidad pueden variar entre placas y condiciones térmicas.
- Dependencia estricta de `librknnrt.so` 2.5.0 y de la API `rknnlite`; cambios de versión pueden romper la compatibilidad de los segmentos.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.
- No se documentan sesgos específicos del port; los del modelo base no se detallan en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oliver0804/LFM3-1.7B-RK3588-hybrid-rknn
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Herramientas RKNN de Rockchip: https://github.com/airockchip/rknn-toolkit2
