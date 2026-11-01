# daveycodez/LFM2.5-1.2B-Thinking-Web

## Resumen

LFM2.5-1.2B-Thinking-Web es una compilación comunitaria no oficial, creada por el usuario daveycodez, del modelo LFM2.5-1.2B-Thinking de Liquid AI. Se trata de una versión cuantizada a 4 bits en formato ONNX (variante q4f16) diseñada específicamente para ejecutarse en el navegador mediante Transformers.js y WebGPU, incluyendo compatibilidad con iPhone Safari. El modelo base es un LLM compacto de 1.2B parámetros con capacidades de razonamiento ("thinking") y conversación.

La aportación principal de esta build es una modificación del grafo ONNX que introduce una entrada `num_logits_to_keep`, de modo que durante la generación solo se calculan los logits de las últimas posiciones necesarias en lugar de uno por cada token del prompt. Esto reduce drásticamente el tamaño de los tensores intermedios (de unos 210 MB a 0,26 MB para un prompt de 800 tokens), evitando cuelgues de pestañas en navegadores con memoria limitada, como Safari en iPhone.

Es relevante porque permite desplegar un modelo con razonamiento en dispositivos cliente sin servidor ni API, con pesos byte-idénticos al original publicado por Liquid AI (verificado por SHA-256), lo que garantiza que la calidad del modelo no se ve alterada salvo por diferencias numéricas marginales (≤ 0,0078 en los logits del último token).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (Liquid Foundation Model), transformer híbrido de Liquid AI (no disponible el detalle exacto en esta ficha) |
| Parametros totales | 1,2B (heredado del modelo base LFM2.5-1.2B-Thinking) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card de esta build) |
| Tipos de cuantizacion | q4f16 (pesos a 4 bits, activaciones float16) |
| Idiomas soportados | en, ja, ko, fr, es, de, it, pt, ar, zh |
| Licencia | LFM Open License v1.0 (uso comercial limitado a entidades con ingresos anuales inferiores a 10 millones de dólares) |
| Formato de pesos | ONNX (solo variante q4f16, archivo `onnx/model_q4f16.onnx` + `onnx_data`) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-1.2B-Thinking de Liquid AI, pertenece a la familia de Liquid Foundation Models (LFM), arquitecturas transformer híbridas optimizadas para eficiencia en dispositivos con recursos limitados. Esta build no modifica los pesos: el archivo `onnx/model_q4f16.onnx_data` es byte-idéntico al original de LiquidAI/LFM2.5-1.2B-Thinking-ONNX en el commit `e7fe619` (SHA-256 `da02a690...ec2094d`). La única intervención es sobre el grafo de inferencia.

La modificación técnica consiste en añadir tres nodos (`Neg`, `Unsqueeze`, `Slice`), tres constantes int64 pequeñas y una nueva entrada escalar `num_logits_to_keep`. Los estados ocultos tras la norma final se recortan a las últimas `num_logits_to_keep` posiciones antes de la cabeza de lenguaje. Transformers.js pasa el valor `1` durante `generate()`, de forma que el prefill de un prompt de 800 tokens produce un tensor de logits de `[1, 1, 65536]` (262 144 bytes) en lugar de `[1, 800, 65536]` (209 715 200 bytes). No se dispone de información sobre el proceso de entrenamiento del modelo base (tokens, datasets, RLHF/DPO) en la documentación de esta build.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento ("thinking") heredado del modelo base LFM2.5-1.2B-Thinking.
- Razonamiento multi-paso: el modelo base está especializado en tareas que requieren cadena de pensamiento antes de la respuesta final.
- Ejecucion 100% en el navegador vía Transformers.js sobre WebGPU, sin necesidad de backend propio.
- Compatibilidad con Safari en iPhone, un entorno con restricciones severas de memoria (aproximadamente 2 GB por pestaña incluyendo GPU).
- Soporte de prompts con definiciones de herramientas (tool prompts), mencionado en las mediciones de rendimiento, aunque no se detalla el soporte nativo de function calling en esta build.
- Multilingüe: inglés, japonés, coreano, francés, castellano, alemán, italiano, portugués, árabe y chino.
- Salida de logits configurable: `num_logits_to_keep = 0` recupera logits de todas las posiciones (bit a bit idénticos al original), útil para entrenamiento o análisis.

## Casos de uso

- Asistentes conversacionales con razonamiento en el navegador: el modelo puede ejecutarse íntegramente en el cliente, sin enviar datos a servidores, lo que lo hace adecuado para aplicaciones con requisitos de privacidad.
- Chatbots en dispositivos móviles: la reducción de memoria de logits permite ejecutar el modelo en iPhone Safari sin que la pestaña se cierre, incluso con prompts largos que incluyen definiciones de herramientas.
- Prototipado de aplicaciones LLM sin backend: desarrolladores web pueden integrar el modelo con Transformers.js 4.3.2 y probar agentes o chats sin coste de infraestructura.
- Aplicaciones offline: al ejecutarse localmente en el navegador, la inferencia funciona sin conexión una vez descargados los pesos (1,6 GB de repositorio).
- Agentes con herramientas en cliente: los prompts de 541 tokens con definiciones de herramientas se procesan en unos 222 ms en WebGPU, lo que viabiliza flujos de tool calling ligeros en el dispositivo.
- Despliegue en mercados con conectividad limitada: al evitar llamadas a APIs remotas, se reduce la latencia de red y la dependencia de servicios externos.
- Análisis e investigación de logits: la opción `num_logits_to_keep = 0` permite recuperar logits completos idénticos al original para estudios de probabilidad por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta build. Sí se han publicado mediciones de rendimiento de inferencia comparando esta build con el ONNX original:

| Medicion | Original q4f16 | Esta build |
|---|---|---|
| Logits para prompt de 800 tokens | `[1, 800, 65536]`, 209 715 200 bytes | `[1, 1, 65536]`, 262 144 bytes |
| Diferencia max abs en logits del ultimo token (5 prompts de 18-963 tokens) | — | ≤ 0,0078 (logits hasta ±16), mismo token top en todos los prompts |
| Diferencia con todas las posiciones (`num_logits_to_keep = 0`) | — | 0 |
| Caches KV y conv tras el prompt | — | identicas |
| 8 pasos de decodificacion greedy tras cada prompt | — | tokens y logits identicos |
| Prompt de herramientas de 541 tokens + 24 tokens nuevos, WebGPU (Node, Apple Silicon) | ~251 ms | ~222 ms |
| Prompt de 963 tokens, onnxruntime CPU | 1 673 ms | 1 488 ms |

Mediciones realizadas con onnxruntime 1.31 en CPU salvo indicación contraria. La pequeña diferencia en los logits del último token proviene de que la multiplicación de matrices 4-bit de la LM head se ejecuta sobre una fila en lugar de cientos, alterando el orden de las sumas en float16. Con Transformers.js 4.3.2, la generación greedy produjo los mismos tokens con ambas builds.

## Requisitos de hardware

- Ejecucion principal: navegador con soporte WebGPU (Chrome, Edge y Safari en iPhone según la model card). No requiere GPU dedicada de servidor.
- Memoria: el repositorio completo ocupa 1,6 GB (solo se incluye la variante q4f16). En iPhone Safari, una pestaña dispone de aproximadamente 2 GB de memoria incluyendo GPU; esta build está optimizada para caber en ese límite incluso con prompts largos.
- CPU: la inferencia también funciona vía onnxruntime en CPU; un prompt de 963 tokens tarda unos 1 488 ms en prefill en CPU (equipo Apple Silicon, según mediciones del autor).
- Despliegue: Transformers.js (librería indicada, probado con la versión 4.3.2) sobre WebGPU; también es posible ejecutar el grafo directamente con onnxruntime pasando `num_logits_to_keep` como escalar int64 (`1` para generación, `0` para todas las posiciones).
- No aplica despliegue clásico con vLLM, TGI, llama.cpp u Ollama: el formato ONNX con entrada personalizada `num_logits_to_keep` está pensado para el ecosistema Transformers.js/onnxruntime-web.
- Latencia y throughput: prefill de un prompt de herramientas de 541 tokens más 24 tokens generados en unos 222 ms sobre WebGPU (Node, Apple Silicon). No se han publicado mediciones de throughput en tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Entorno objetivo | Licencia |
|---|---|---|---|---|---|
| daveycodez/LFM2.5-1.2B-Thinking-Web | 1,2B | q4f16 | ONNX | Navegador (Transformers.js + WebGPU) | LFM Open License v1.0 |
| LiquidAI/LFM2.5-1.2B-Thinking-ONNX | 1,2B | q4f16 (entre otras) | ONNX | onnxruntime / Transformers.js | LFM Open License v1.0 |
| onnx-community/LFM3-1.7B-ONNX | 1,7B | no disponible | ONNX | Navegador (Transformers.js) | no disponible |

La diferencia clave frente al ONNX original de Liquid AI es la entrada `num_logits_to_keep`, que reduce el consumo de memoria en prefill y evita fallos en navegadores móviles. Frente a LFM3-1.7B-ONNX, este modelo es más pequeño (1,2B frente a 1,7B) e incorpora capacidades de razonamiento "thinking"; esta build adopta además el mismo mecanismo de `num_logits_to_keep` que ya presentaba aquel modelo.

## Limitaciones y advertencias

- Se trata de una build comunitaria no oficial: no ha sido creada, revisada ni respaldada por Liquid AI.
- Restriccion de licencia relevante: la LFM Open License v1.0 solo permite uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares. Las empresas que superen ese umbral necesitan un acuerdo comercial con Liquid AI.
- Solo se incluye la variante q4f16; no hay pesos en fp16, fp32 ni otros niveles de cuantización en este repositorio.
- Existe una diferencia numérica marginal (≤ 0,0078) en los logits del último token respecto al original, debida al orden de las sumas float16 en la LM head 4-bit; la generación greedy produce los mismos tokens, pero no se garantiza identidad bit a bit en muestreo con temperatura.
- La longitud de contexto máxima no está documentada en la model card de esta build; debe consultarse la ficha del modelo base LiquidAI/LFM2.5-1.2B-Thinking.
- El modelo hereda los sesgos y el riesgo de alucinación del modelo base; al ser un modelo de 1,2B parámetros, sus capacidades de razonamiento y conocimiento factual son limitadas frente a modelos mayores.
- El soporte de WebGPU varía según navegador y plataforma; en navegadores sin WebGPU la inferencia debe realizarse por CPU con penalización de latencia.
- La descarga inicial de pesos (1,6 GB) puede ser lenta para usuarios móviles; conviene implementar caché del modelo en la aplicación.

## Enlaces

- Ficha del modelo: https://huggingface.co/daveycodez/LFM2.5-1.2B-Thinking-Web
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- ONNX original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX
- Commit de referencia del ONNX original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-ONNX/tree/e7fe61974e3a167dff77c5722db9a1cb7b57140f
- Referencia del mecanismo `num_logits_to_keep`: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
- Web de Liquid AI: https://www.liquid.ai/
