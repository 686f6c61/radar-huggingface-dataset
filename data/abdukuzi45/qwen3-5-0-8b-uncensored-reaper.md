# abdukuzi45/Qwen3.5-0.8B-Uncensored-reaper

## Resumen

Qwen3.5-0.8B-Uncensored-reaper es una variante "abliterated" del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario abdukuzi45 en Hugging Face. La abliteracion es una tecnica de investigacion que elimina la direccion neuronal responsable del mecanismo de rechazo, de modo que el modelo deja de responder con negativas del tipo "lo siento, no puedo ayudar con eso". El resultado es un modelo que conserva la arquitectura y el conocimiento del original pero sin las salvaguardas conversacionales.

El modelo mantiene intacta la arquitectura multimodal del base: unos 800 millones de parametros en el modelo de lenguaje, 100,59 millones en el codificador visual y 20,45 millones en la cabeza de prediccion multi-token (MTP), sumando 873.438.784 parametros reales segun safetensors. Los pesos se han fusionado en un unico fichero `model.safetensors` conservando las 488 tensores originales.

Su relevancia es doble: por un lado sirve como banco de pruebas para estudiar como afecta la eliminacion de la direccion de rechazo al conocimiento factual (el autor reporta una divergencia KL de 0,0417 y una caida de precision top-1 del 96 % al 93 %); por otro, es un ejemplo de modelo pequeno y multimodal con modo de razonamiento pensado para entornos de investigacion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual + cabeza MTP) |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico `model.safetensors`, 5,3 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, cuya arquitectura combina un transformer de lenguaje de unos 800M de parametros con un codificador visual de 100,59M y una cabeza de prediccion multi-token de 20,45M. La modificacion aplicada por el autor no anade ni elimina pesos: se limita a proyectar fuera la direccion de rechazo en las capas de proyeccion del modelo de lenguaje. Concretamente, de los 488 tensores del modelo base, solo se alteran los tensores de proyeccion del modulo de texto; los 276 tensores restantes (embeddings, normalizaciones, atencion) y los 0 tensores del codificador visual permanecen sin cambios.

El proceso de "Reaper Abliteration" identifica la direccion matematica asociada a las respuestas de rechazo y la elimina mediante proyeccion. El autor reporta que el modelo base rechazaba 96 de cada 100 prompts considerados daninos, mientras que la variante abliterated rechaza 0 de 100. La retencion de conocimiento se mide con una divergencia KL de 0,0417 y una precision top-1 del 93 % frente al 96 % del base. No se documentan datos sobre el volumen de tokens de entrenamiento original ni sobre fases de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagenes mediante el codificador visual heredado del modelo base (el autor indica que el encoder permanece intacto, aunque no detalla tareas concretas de vision).
- Modo de razonamiento (Thinking Mode) activable con `enable_thinking=True` en la plantilla de chat.
- Prediccion multi-token (MTP) gracias a la cabeza especifica del modelo base.
- Respuestas sin mecanismo de rechazo ante prompts que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking podria habilitarlo.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente como la eliminacion de la direccion de rechazo afecta al comportamiento y al conocimiento, comparando metricas como la divergencia KL o la precision top-1 frente al base.
- Evaluacion de tecnicas de abliteracion: sirve como referencia reproducible para validar la eficacia del motor Reaper frente a otros metodos de eliminacion de rechazo.
- Pruebas de robustez de filtros de contenido: util para medir si los clasificadores de seguridad de un pipeline de produccion detectan respuestas que un modelo alineado bloquearia.
- Generacion de texto creativo sin restricciones conversacionales: en entornos controlados de escritura de ficcion o guiones donde el modelo base introduciria negativas.
- Prototipado rapido en hardware modesto: con menos de 900M de parametros, cabe en GPUs de consumo y permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada.
- Experimentos multimodales de bajo coste: el codificador visual intacto permite probar tareas imagen-texto en un modelo pequeno, util para comparar el impacto de la abliteracion entre modalidades.

## Benchmarks y rendimiento

| Metrica | Modelo base (Qwen3.5-0.8B) | Este modelo (abliterated) |
|---|---|---|
| Tasa de rechazo (100 prompts daninos) | 96/100 | 0/100 |
| Divergencia KL | referencia | 0,0417 |
| Precision top-1 | 96 % | 93 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 5,3 GB, probablemente por incluir pesos en varios formatos o precisiones.
- En cuantizacion de 8 bits cabria en GPUs de consumo con 4 GB o mas; en 4 bits, en GPUs con 2-3 GB.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100 o H100 para despliegues por lotes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (documentado por el autor con `device_map="auto"`); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible, y al no publicarse variantes GGUF habria que convertirlas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-0.8B-Uncensored-reaper | 0,87B | no disponible | Apache 2.0 | Abliterated multimodal con thinking mode |
| Qwen3.5-0.8B (base) | 0,87B | no disponible | Apache 2.0 | Modelo original alineado |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | segun variante | Eliminacion de rechazo sobre modelos Qwen |

La comparacion con alternativas de la misma categoria (otros modelos abliterated de ~1B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el mecanismo de rechazo: puede generar contenido danino, ilegal o poco etico si se le solicita. El autor lo restringe a fines de investigacion, educacion y evaluacion.
- Riesgo elevado de alucinacion y de respuestas inseguras al no existir salvaguardas conversacionales.
- Perdida de precision factual medible: 3 puntos porcentuales en top-1 respecto al base.
- Soporte limitado al ingles segun la model card; el rendimiento en castellano no esta documentado.
- La longitud de contexto no se especifica, lo que impide planificar cargas de trabajo con ventanas largas.
- No se publican variantes cuantizadas ni formatos GGUF, lo que anade trabajo de conversion para despliegues con llama.cpp u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente el uso del modelo para causar dano; la responsabilidad legal y etica recae en el usuario.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni evidencia externa de su comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-0.8B-Uncensored-reaper
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
