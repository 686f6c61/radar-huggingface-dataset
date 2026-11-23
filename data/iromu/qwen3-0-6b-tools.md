# iromu/Qwen3-0.6B-tools

## Resumen

Qwen3-0.6B-tools es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-0.6B, desarrollado por el usuario iromu y publicado en Hugging Face. Su objetivo no es competir en capacidades generales de razonamiento o conocimiento, sino especializar un modelo de muy bajo coste computacional en la emisión fiable de llamadas a herramientas (tool calling / function calling) en formato compatible con la API de OpenAI, orientado a flujos agénticos y despliegues en el borde.

El punto de partida es un transformer denso de aproximadamente 596 millones de parámetros (596.049.920 según los pesos en safetensors), con la arquitectura y el tokenizador de la familia Qwen3. El ajuste se realizó con LoRA sobre los módulos de proyección y los pesos resultantes se fusionaron en BF16, de modo que el artefacto publicado es un modelo completo y no un adaptador. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta ficha está en su validación cuantitativa: el autor publica una comparación frente al modelo base sobre el split de validación retenido, con un incremento del 63,1 puntos porcentuales en coincidencia exacta de argumentos (del 0,7 % al 63,9 %) y una tasa de emisión de tool calls del 99,3 % frente al 17,5 % del base. Es, por tanto, un caso claro de especialización estrecha con métricas verificables, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado con LoRA y fusionado en BF16 |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso secuencias de 4096 tokens |
| Tipos de cuantizacion | BF16 (pesos fusionados publicados); GGUF en repositorio hermano (`iromu/Qwen3-0.6B-tools-GGUF`, p. ej. Q4_K_M); NVFP4 en repositorio hermano (`iromu/Qwen3-0.6B-tools-NVFP4`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); GGUF y NVFP4 en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-0.6B original: un transformer denso con atención estándar y tokenizador propio de Qwen3. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de dimensión 32, alpha 32 y dropout 0,05, dirigido a todos los módulos de proyección (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó con NeMo-RL, en precisión bfloat16, con AdamW, tasa de aprendizaje de 5e-5, weight decay de 0,01, calentamiento lineal de 15 pasos y decaimiento coseno hasta 1e-6, batch global de 64 (micro-batch de 2) y 336 pasos totales con validación cada 84 pasos. La longitud máxima de secuencia fue de 4096 tokens.

La innovación técnica principal no está en la arquitectura sino en el contrato de formato: se sustituyó la plantilla de chat en línea del modelo base por una plantilla específica de tool calling que renderiza literalmente los esquemas de herramientas y convierte el bloque `tool_calls` del turno del asistente en el tramo entrenable. La pérdida es entropía cruzada enmascarada a los turnos del asistente mediante la palabra clave `generation` de la plantilla. Los datos provienen del split `sft_tools` del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, en formato `messages` de OpenAI con `tool_calls` en los turnos del asistente. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de llamadas a herramientas en formato compatible con OpenAI, con nombres de función y argumentos estructurados.
- Function calling a partir de esquemas de herramientas definidos por el desarrollador, renderizados de forma literal por la plantilla de chat.
- Interacciones agénticas de varios pasos, encadenando llamadas a herramientas dentro de una conversación.
- Generación de texto conversacional multi-turno, heredada del modelo base.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito ni decodificación especulativa.

## Casos de uso

- Enrutamiento de intenciones en asistentes locales: el modelo recibe el esquema de un conjunto cerrado de funciones (por ejemplo, consultar el tiempo, crear un recordatorio, buscar en un catálogo) y devuelve la llamada con argumentos tipados; sus 596 millones de parámetros permiten ejecutarlo en CPU o en GPU integrada sin depender de la nube.
- Automatización de atención al cliente en el borde: con la tasa de emisión de tool calls del 99,3 % medida en validación, puede decidir de forma fiable cuándo consultar un backend (estado de pedido, stock) y cuándo responder en lenguaje natural, reduciendo llamadas innecesarias.
- Orquestación de pipelines de datos: integrado como nodo que traduce instrucciones en lenguaje natural a invocaciones de scripts o APIs internas con parámetros validados, aprovechando la coincidencia exacta de argumentos del 63,9 % como punto de partida y validando el resto con esquemas JSON.
- Agentes de escritorio o móviles con presupuesto de memoria reducido: el checkpoint NVFP4 servido con TensorRT-LLM o los GGUF con llama.cpp permiten desplegar el modelo en dispositivos con pocos gigabytes de VRAM o en CPU.
- Prototipado rápido de agentes antes de escalar a modelos mayores: sirve como banco de pruebas barato para diseñar plantillas de herramientas, esquemas y flujos multi-paso, ya que su contrato de formato es el mismo que el de modelos más grandes.
- Clasificación y extracción estructurada vía tool calling: en lugar de pedir JSON libre, se define una función con parámetros tipados y se deja que el modelo rellene los campos, lo que simplifica la validación posterior con bibliotecas de esquemas.
- Filtrado y preprocesado en pipelines de CI/CD: llamadas a funciones para etiquetar issues, asignar reviewers o consultar el estado de un build a partir de texto libre.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación automática del autor sobre el split de validación retenido del dataset `sft_tools`, con decodificación greedy y un límite de 384 tokens.

| Modelo | Cuantizacion | Limite | n | Tool call emitido | Nombres coincidentes | Argumentos exactos | Delta exacto vs base |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B | BF16 | 384 tok | 274 | 48/274 (17,5 %) | 9/274 (3,3 %) | 2/274 (0,7 %) | (sin predecesor) |
| Qwen3-0.6B-tools | BF16 | 384 tok | 274 | 272/274 (99,3 %) | 228/274 (83,2 %) | 175/274 (63,9 %) | +63,1 pp |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL u otros) en la información disponible. El throughput indicado por el autor corresponde a decodificación greedy de un solo flujo, no a rendimiento de servido.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,2 GB solo para pesos (596 M de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en NVFP4: del orden de 0,3-0,4 GB para pesos, adecuado para GPUs Blackwell con soporte nativo de FP4.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 0,4-0,5 GB para pesos, ejecutable en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) con enorme margen; también cabe en GPUs de 4-8 GB e incluso en iGPU con suficiente memoria compartida. Para servido de alta concurrencia, A100 o H100 no son necesarias por tamaño, pero aportan throughput.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y en CPU.
- Opciones de despliegue: `transformers` (BF16), llama.cpp (GGUF, p. ej. `llama-cli -hf iromu/Qwen3-0.6B-tools-GGUF:Q4_K_M`), TensorRT-LLM (`trtllm-serve serve iromu/Qwen3-0.6B-tools-NVFP4 --port 8000`), y por compatibilidad de pesos con el ecosistema Qwen3, también vLLM, TGI y Ollama.
- Latencia y throughput: no disponibles como cifras de servido; el autor solo indica que las métricas de validación se midieron con decodificación greedy de un solo flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-tools | 596 M | No disponible (entrenado a 4096) | Tool calling especializado vía SFT + LoRA | Apache 2.0 | Hugging Face, con GGUF y NVFP4 |
| Qwen/Qwen3-0.6B | 596 M | No disponible en la informacion proporcionada | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| Alternativas de tool calling de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base está cuantificada en la tabla de benchmarks: el ajuste multiplica por más de cinco la tasa de emisión de tool calls y por más de noventa la coincidencia exacta de argumentos. No se dispone de datos de otros modelos especializados de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de 0,6 mil millones de parámetros: no sustituye a modelos Qwen mayores para tareas generales de razonamiento, conocimiento factual o generación long-form, como advierte el propio autor.
- El alcance idiomático declarado es únicamente inglés; el rendimiento en castellano u otros idiomas no está validado y previsiblemente degradará tanto la calidad del texto como la estructura de las llamadas.
- La coincidencia exacta de argumentos es del 63,9 %: en producción es imprescindible validar los argumentos contra un esquema JSON y prever reintentos o corrección, ya que más de un tercio de las llamadas no reproduce exactamente los argumentos esperados.
- Riesgo de alucinación de nombres de función o de parámetros inexistentes, especialmente con esquemas de herramientas grandes o anidados; la validación se hizo con un límite de 384 tokens, por lo que el comportamiento con esquemas muy extensos no está medido.
- La plantilla de chat es parte del contrato del modelo: usar una plantilla distinta de la publicada puede romper el formato de `tool_calls` y anular la especialización.
- No hay datos publicados sobre sesgos, robustez frente a prompt injection ni comportamiento ante herramientas maliciosas; en despliegues agénticos conviene aplicar políticas de allowlist de funciones y sandboxing.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento documentado.
- El repositorio tiene un volumen de descargas bajo (510 en el momento de la consulta) y una única interacción, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen3-0.6B-tools
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-tools-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-tools-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- NeMo-RL (framework de entrenamiento): https://github.com/NVIDIA-NeMo/RL
- llama.cpp: https://github.com/ggml-org/llama.cpp
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
