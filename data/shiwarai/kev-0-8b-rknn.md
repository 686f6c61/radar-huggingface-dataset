# ShiWarai/kev-0.8b-rknn

## Resumen

kev-0.8b-rknn es un modelo de clasificación de texto y toma de decisiones binaria/múltiple, derivado de Qwen/Qwen3.5-0.8B-Base con el adaptador LoRA de jaredpalmer/kev-0.8b fusionado, y convertido a formato RKLLM para su ejecución en la NPU del SoC Rockchip RK3588. No genera texto: en una única pasada forward lee el estado oculto de la última capa de cada token y puntúa opciones mediante una cabeza de punteros (pointer head) con dos proyecciones lineales de 1024 a 256 dimensiones, ejecutadas en CPU en fp32.

El modelo está cuantizado en w8a8 con RKLLM-Toolkit 1.3.1 y compilado para tres núcleos NPU. La versión actual del archivo soporta una longitud de contexto de 16384 tokens, aunque existe una compilación heredada de 320 tokens conservada por compatibilidad. El prefill escala con los tokens reales de la fila de entrada, a unos 5,7 ms por token en RK3588.

Su relevancia radica en que demuestra un flujo completo de despliegue de un modelo de decisión sobre hardware embebido de bajo consumo, con cuantización w8a8 y ejecución en NPU, algo poco habitual en modelos derivados de arquitecturas híbridas con Gated DeltaNet. Está pensado para escenarios de clasificación y selección de opciones en el borde, no para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (base Qwen3.5-0.8B) más cabeza de punteros lineal |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16384 tokens (archivo actual); 320 tokens (archivo heredado ctx320) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits); cabeza de punteros en fp32 |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (.rkllm), más tokenizer.json y pesos de la cabeza en .npy |
| Tamano del repositorio | 2,6 GB |
| Pipeline | text-classification |
| Libreria | rkllm |
| Modelo base | jaredpalmer/kev-0.8b y Qwen/Qwen3.5-0.8B-Base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, una arquitectura transformer híbrida que incorpora Gated DeltaNet, un mecanismo de recurrencia lineal que sustituye parte de la atención tradicional y no utiliza máscara de atención. Sobre este base se aplicó el adaptador LoRA de jaredpalmer/kev-0.8b, fusionado mediante PEFT `merge_and_unload` y guardado como `Qwen3_5ForCausalLM`. La conversión a RKLLM se realizó con RKLLM-Toolkit 1.3.1 en modo w8a8, con `quantized_algorithm=normal`, `optimization_level=0`, `num_npu_core=3`, `hybrid_rate=0` y `max_context=16384`.

La innovación principal es la cabeza de punteros: en lugar de generar texto, el modelo lee el estado oculto de la última capa de cada token y calcula la puntuación de cada opción como `(k(h_opt) · q(h_decide)) / sqrt(256)`, donde `q` y `k` son dos mapas `Linear(1024 → 256)` almacenados en archivos `.npy` en fp32 y ejecutados en CPU. La temperatura configurada es 2,351. El entrenamiento del adaptador original no se detalla en la información disponible; no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. La calibración para la cuantización usó 24 filas JSON de tipo `{request, target}`: la versión ctx320 empleó 24 respuestas de un Kev `/v1/systemone` en ejecución, y la reconstrucción ctx16384 usó 24 filas generadas de una sola pregunta (choice/noul/score, ruso e inglés, estados cortos y medios).

## Capacidades

- Clasificación de texto y selección de opciones: puntúa cada opción candidata mediante la cabeza de punteros y devuelve la de mayor puntuación (argmax).
- Toma de decisiones discretas: diseñado para rúbricas de comandos o elecciones cerradas, como la rúbrica de 14 comandos de panda usada en la verificación.
- Procesamiento multilingüe: soporta inglés y otros idiomas, con ejemplos de verificación en ruso (`Панда, дай лапу`).
- No genera texto: no dispone de decodificación autoregresiva de tokens; `max_new_tokens=0` y `keep_history=0` son la configuración prevista.
- Ejecución en NPU: aprovecha la NPU del RK3588 con tres núcleos compilados.
- Lectura de estados ocultos por token: expone `RKLLM_INFER_GET_LAST_HIDDEN_LAYER` para obtener el estado de la última capa de cada token.
- Soporte de tokens especiales: `<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Clasificación de intenciones en dispositivos embebidos: el modelo puede recibir una pregunta y un conjunto de opciones y devolver la más probable, con contexto de hasta 16384 tokens, adecuado para asistentes locales en hardware RK3588.
- Selección de comandos en robótica o domótica: la rúbrica de 14 comandos de panda demuestra su uso para mapear lenguaje natural a acciones discretas predefinidas, con latencia de prefill de aproximadamente 1,7 s para 292 tokens.
- Enrutamiento de consultas en pipelines de NLP: dado un texto y varias categorías, el modelo puntúa cada categoría y permite dirigir la consulta al módulo correspondiente sin generación de texto.
- Filtrado y moderación de contenido en el borde: clasificación binaria o múltiple de textos cortos o medios en inglés y otros idiomas, ejecutada íntegramente en NPU sin conexión a la nube.
- Verificación de respuestas en sistemas de QA: comparar una respuesta candidata contra opciones de referencia y elegir la mejor según la puntuación de la cabeza de punteros.
- Procesamiento de formularios o encuestas: asignar etiquetas a campos de texto libre mediante opciones predefinidas, con contexto suficiente para incluir instrucciones largas y ejemplos.
- Análisis de sentimiento o intención en tiempo real: al no generar texto, el coste computacional se limita al prefill, lo que permite alta frecuencia de inferencia en el dispositivo.
- Selección de herramientas en un agente local: aunque no se documenta tool calling nativo, la cabeza de punteros puede usarse para elegir entre un conjunto cerrado de herramientas o acciones.

## Benchmarks y rendimiento

Los datos disponibles provienen de la verificación del autor con la compilación ctx320, no de benchmarks estándar como MMLU o HumanEval.

| Metrica | Valor |
|---|---|
| Prompt de verificacion | `Панда, дай лапу` con rubrica de 14 comandos |
| Tokens de entrada | 292 |
| Argmax | `give_paw` |
| Similitud coseno frente a logits fp32 en CPU | 0,983 (temperatura 1, una pregunta) |
| Prefill en NPU | 1674 ms en RK3588, runtime 1.3.1, tres nucleos |
| Misma pasada en CPU (PyTorch de referencia) | 11,2 s |
| Referencia de Rockchip para Qwen3.5-0.8B w8a8 | 588 ms time-to-first-token a 128 tokens en RK3588; extrapolado a 292 tokens, aproximadamente 1,3 s |
| optimization_level=1 (no incluido en el repo) | Aproximadamente 1770 ms, mas lento que level 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La similitud coseno indicada es una comparación de logits en un único elemento, no una precisión de clasificación.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 con NPU, tres núcleos compilados.
- VRAM/RAM: no se especifica consumo de memoria; el repositorio ocupa 2,6 GB y el buffer de la cabeza de punteros crece con el número real de tokens (hidden 1024, fp32, aproximadamente 4 KB por token).
- GPU: no aplica; el modelo está compilado para NPU RK3588, no para GPU convencional. No se documenta ejecución en A100, H100 o RTX 4090.
- Cabeza de punteros: se ejecuta en CPU en fp32.
- Runtime: requiere `librkllmrt.so` versión 1.3.1 o superior, compilación aarch64, disponible en airockchip/rknn-llm. La versión 1.3.0 rechaza este archivo.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato RKLLM es específico del ecosistema Rockchip.
- Latencia: prefill de aproximadamente 5,7 ms por token en RK3588; una fila completa de 16384 tokens tarda del orden de 90 s. Para 292 tokens, 1674 ms medidos.
- Nota: los relojes de NPU, CPU y DDR estaban al máximo durante la medición; el prefill no está limitado por la NPU durante todo el tiempo.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de decisión o clasificación en formato RKLLM dentro de la información proporcionada. La referencia más cercana es el propio Qwen3.5-0.8B w8a8 de Rockchip, con 588 ms de time-to-first-token a 128 tokens en RK3588, frente a los 1674 ms a 292 tokens de este build (aproximadamente 1,3 s extrapolados a 292 tokens). No se han publicado comparativas con alternativas como modelos de clasificación BERT o cabezas de decisión sobre otros transformers.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kev-0.8b-rknn | ~0,8B | 16384 | RKLLM | Apache 2.0 | Cabeza de punteros, NPU RK3588 |
| Qwen3.5-0.8B w8a8 (Rockchip) | ~0,8B | No disponible | RKLLM | No disponible | Referencia de velocidad: 588 ms a 128 tokens |
| jaredpalmer/kev-0.8b | ~0,8B | No disponible | PyTorch | No disponible | Adaptador original, sin conversión RKNN |

## Limitaciones y advertencias

- No genera texto: cualquier uso que requiera generación autoregresiva es inviable con este modelo.
- Contexto limitado por archivo: la compilación actual soporta 16384 tokens; la heredada solo 320. Una fila más larga que el `max_context` del archivo no cabe.
- Empaquetado de preguntas: la codificación de Kev usa una única fila causal de estado más la pregunta; empaquetar varias preguntas en esa fila permite que preguntas posteriores contaminen el estado recurrente de las anteriores. El archivo se verificó con una sola pregunta.
- Plantilla de chat: debe pasarse con plantilla vacía y `max_new_tokens=0`, `keep_history=0`; el runtime no debe envolver los tokens en un prompt de chat.
- Desplazamiento de índices: si el runtime antepone tokens, hay que desplazar los índices de `<decide>` y `</opt>` por `num_tokens - len(ids)`.
- Runtime específico: requiere `librkllmrt.so` 1.3.1 o superior; la versión 1.3.0 falla. No debe sustituirse la copia que sirve a otro modelo RKLLM.
- Exportación ONNX no viable: el grafo RKNN de DeltaNet desplegado tiene unos 140 000 nodos y `rknn.load_onnx` con toolkit 2.3.2 agotó 27 GB de RAM antes de `rknn.build`.
- Sesgos y alucinación: no se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de clasificación, el riesgo se manifiesta como puntuaciones erróneas en las opciones, no como texto inventado.
- Idiomas: aunque se etiqueta como multilingüe, la verificación solo cubre ruso e inglés; el rendimiento en otros idiomas no está medido.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen y el adaptador original pueden tener condiciones propias que conviene revisar.
- Rendimiento: el build no logró bajar de 1 s en el prefill de 292 tokens; `optimization_level=1` fue más lento (aproximadamente 1770 ms).
- Medición limitada: la similitud coseno de 0,983 corresponde a un único elemento, no a una precisión de clasificación agregada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ShiWarai/kev-0.8b-rknn
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Adaptador original Kev: https://huggingface.co/jaredpalmer/kev-0.8b
- Runtime RKLLM de Rockchip: https://github.com/airockchip/rknn-llm
