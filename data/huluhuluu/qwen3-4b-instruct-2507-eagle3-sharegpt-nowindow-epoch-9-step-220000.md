# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-220000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-220000` contiene un checkpoint concreto de un modelo de borrador (draft model) para decodificacion especulativa, entrenado con el algoritmo EAGLE3 mediante la herramienta SpecForge. Este modelo no es un chatbot autonomo, sino un componente auxiliar que acelera la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, un modelo de 4 000 millones de parametros de la familia Qwen3. El draft model predice secuencias de tokens candidatos que el modelo objetivo valida en paralelo, reduciendo la latencia por token generado.

El checkpoint corresponde al paso 220 000 de la epoca 9 de un entrenamiento de 10 epocas, con un total de 231 810 pasos de optimizacion. La arquitectura es `LlamaForCausalLmeagle3`, con una unica capa decoder, 202,7 millones de parametros y pesos en `bfloat16`. El entrenamiento se realizo sobre un dataset ShareGPT limpio en formato JSONL, con una longitud maxima de secuencia de 2048 tokens y sin ventana deslizante (de ahi el sufijo "NoWindow"). Se publica bajo licencia Apache 2.0 y esta pensado para usarse con el backend SGLang.

La relevancia de este modelo radica en que permite desplegar Qwen3-4B-Instruct-2507 con menor latencia en entornos de produccion, aprovechando la decodificacion especulativa sin sacrificar calidad, ya que el modelo objetivo valida cada token propuesto. No se han registrado metricas de evaluacion o seguridad para este entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202 700 416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | no disponible (hereda los del modelo base, no documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura `LlamaForCausalLMEagle3` con una sola capa decoder, hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion y 8 cabezas key/value. El vocabulario de borrador es de 32 000 tokens, mientras que el vocabulario objetivo (del modelo base) es de 151 936 tokens. La atencion usa `sdpa` (scaled dot-product attention) y no se aplica ventana deslizante, como indica el nombre "NoWindow".

El entrenamiento se realizo con el metodo online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio en formato JSONL. Los parametros clave del entrenamiento son: 10 epocas, 231 810 pasos de optimizacion, batch efectivo global de 4 (tamano de batch por dispositivo 1, paralelismo de datos 4), learning rate de 1e-4 con warmup lineal del 1,5 % seguido de decaimiento coseno, weight decay de 0, maximo gradiente de norma 0,5, longitud maxima de secuencia de 2048 tokens y longitud de arbol TTT de 7. El backend objetivo es SGLang con flashinfer, con tensor parallel de 1.

La innovacion principal es el uso de EAGLE3, que entrena un modelo de borrador para predecir multiples tokens en paralelo mediante un arbol de candidatos, reduciendo el numero de pasos de autodecodificacion del modelo objetivo. El checkpoint almacena `model.safetensors`, `config.json` y `training_state.pt` (este ultimo solo para reanudar el entrenamiento en entornos de confianza).

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: el modelo propone secuencias de 4 tokens por paso (configuracion recomendada) que el modelo objetivo valida en paralelo.
- Aceleracion de inferencia: al reducir el numero de pasos secuenciales del modelo base, disminuye la latencia por token generado en cargas de trabajo de chat y generacion de texto.
- Integracion con SGLang: se usa como ruta de borrador especulativa mediante los parametros `--speculative-algorithm EAGLE3` y `--speculative-draft-model-path`.
- Compatibilidad exclusiva con el modelo base `Qwen/Qwen3-4B-Instruct-2507`: no funciona con otras variantes de Qwen ni con otros modelos.
- No es un modelo de chat, razonamiento, codigo o vision: carece de capacidades autonomas de generacion de texto, tool calling o agentes.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en produccion con menor latencia: el draft model se integra como componente especulativo en SGLang, permitiendo servir el modelo base a mayor throughput sin cambiar la calidad de las respuestas.
- Reduccion de costes de inferencia en APIs de chat: al acelerar la generacion, se reduce el tiempo de computo por peticion, lo que abarata el servicio en infraestructura propia.
- Evaluacion comparativa de estrategias de decodificacion especulativa: los 47 checkpoints publicados (desde `epoch_0_step_5000` hasta `epoch_9_step_231810`) permiten estudiar el efecto del numero de pasos de entrenamiento en la tasa de aceptacion de tokens.
- Optimizacion de parametros de arbol especulativo: el modelo puede usarse para ajustar valores como `--speculative-num-steps` o `--speculative-eagle-topk` en funcion de la carga de trabajo y el hardware.
- Investigacion sobre modelos de borrador: sirve como caso de estudio de entrenamiento online con EAGLE3 sobre un modelo pequeno de la familia Qwen3.
- Pruebas de integracion de SGLang con flashinfer: el checkpoint permite validar la compatibilidad del backend con modelos de borrador de una sola capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. No hay datos de tasa de aceptacion, latencia media ni throughput comparativo con otros draft models.

## Requisitos de hardware

- VRAM estimada para el draft model: aproximadamente 0,4 GB en `bfloat16` (202,7 M parametros a 2 bytes por parametro), mas overhead de activaciones y estados de atencion.
- VRAM total del sistema: al usarse junto al modelo base Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en `bfloat16`), se requiere al menos 9-10 GB de VRAM combinada.
- GPU recomendadas: cualquier GPU consumer con 12 GB o mas de VRAM (RTX 3060, RTX 4070, RTX 4090) es suficiente. Para despliegues de alto rendimiento, A100 o H100 de 40-80 GB no presentan limitaciones.
- Cabe en GPU consumer: si, siempre que se cargue junto al modelo base dentro de la VRAM disponible. El draft model en si es muy ligero.
- Opciones de despliegue: SGLang (recomendado, con `flashinfer`), tambien compatible con Transformers para pruebas locales, aunque no se ha documentado su uso con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. Se espera una reduccion de latencia respecto a la autodecodificacion estandar, pero el valor exacto depende de la carga, el hardware y los parametros del arbol especulativo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros draft models especificos para Qwen3-4B-Instruct-2507. La comparativa con alternativas genericas de decodificacion especulativa (como Medusa, Lookahead o EAGLE-2) no es posible sin datos de rendimiento publicados. Se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo independiente: solo funciona como borrador especulativo acoplado al modelo base `Qwen/Qwen3-4B-Instruct-2507`. Usarlo con otro modelo objetivo puede producir resultados incorrectos.
- Sin evaluacion de seguridad: el autor no registro metricas de sesgo, toxicidad o alineacion. No se recomienda su uso en aplicaciones donde la seguridad del contenido sea critica sin una validacion previa.
- Riesgo de alucinacion: al ser un componente de aceleracion, no genera contenido propio, pero hereda los riesgos del modelo base. El draft model no mitiga ni agrava este problema.
- Limitacion de contexto: entrenado con secuencias de 2048 tokens; aunque no se aplica ventana deslizante, su rendimiento fuera de ese rango no esta garantizado.
- Dependencia de SGLang y flashinfer: la integracion documentada requiere SGLang con backend flashinfer; otros motores de inferencia pueden no ser compatibles.
- `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecucion de codigo malicioso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License) que debe revisarse por separado.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-220000
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Otro checkpoint de la misma serie (ejemplo): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
