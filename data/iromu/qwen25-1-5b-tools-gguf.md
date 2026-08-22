# iromu/qwen25-1.5b-tools-GGUF

## Resumen

El modelo `iromu/qwen25-1.5b-tools-GGUF` es una versión cuantizada en formato GGUF del modelo `unsloth/Qwen2.5-1.5B-Instruct`, afinado mediante LoRA para mejorar sus capacidades de tool calling, function calling y flujos de agente. El autor, iromu, ha publicado cuatro cuantizaciones distintas (F16, Q8_0, Q5_K_M y Q4_K_M) pensadas para facilitar la ejecución local en sistemas con recursos limitados, incluyendo dispositivos embebidos como el Jetson Nano.

El modelo resuelve el problema de dotar a un LLM pequeño (1,5 mil millones de parámetros) de la capacidad de generar llamadas estructuradas a herramientas y gestionar interacciones multi-turno en entornos de agente, algo que normalmente requiere modelos de mayor tamaño. Su relevancia actual radica en que permite ejecutar agentes de IA locales con tool calling en hardware de consumo, sin depender de APIs externas ni de GPU de gama alta.

La arquitectura es un transformer decoder-only basado en Qwen2.5, con una longitud de contexto de entrenamiento de 4096 tokens. El fine-tuning se realizó con LoRA (rank 32, alpha 32) sobre el dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, concretamente la porción `sft_tools` que contiene ejemplos de interacción con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 (configuracion de entrenamiento; el base soporta hasta 32K) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen2.5-1.5B-Instruct`, una versión optimizada del Qwen2.5 de 1,5 mil millones de parámetros. La arquitectura es un transformer causal estándar con atención de ventana deslizante y de tipo GQA (grouped query attention), características propias de la serie Qwen2.5. El fine-tuning se realizó con NVIDIA NeMo AutoModel, aplicando LoRA sobre los módulos `*.proj` con rango 32, alpha 32 y dropout de 0.05.

El entrenamiento se llevó a cabo durante 3 épocas con una secuencia de 4096 tokens, micro batch de 2 y gradiente acumulado de 32, lo que resulta en un batch efectivo de 64. El optimizador fue AdamW con learning rate de 1e-5 y weight decay de 0.01, y se utilizó una pérdida de cross-entropy enmascarada. El dataset utilizado fue la porción `sft_tools` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que contiene ejemplos de interacción entre agentes y herramientas.

No se aplicó enmascarado de razonamiento (reasoning content masking), lo que significa que el modelo puede generar texto de razonamiento antes de emitir las llamadas a herramientas.

## Capacidades

- Tool calling y function calling: generación de llamadas estructuradas a funciones en formato JSON, como se muestra en el ejemplo de uso.
- Flujos de agente: soporte para interacciones multi-turno en las que el modelo decide qué herramienta invocar y procesa las respuestas de las mismas.
- Asistentes locales: diseñado para ser integrado en asistentes de IA que se ejecutan localmente.
- Generación de texto: conserva las capacidades de generación de texto del modelo base, aunque limitado a inglés.
- Razonamiento básico: el modelo puede generar texto de razonamiento antes de emitir una llamada a herramienta, aunque no se le ha aplicado un entrenamiento específico para razonamiento.
- Inferencia ligera: al ser un modelo de 1.5B con cuantizaciones GGUF, puede ejecutarse en hardware de gama baja.

## Casos de uso

- Asistente doméstico con control de dispositivos: el modelo puede convertir peticiones del usuario en llamadas JSON a APIs de domótica, por ejemplo "encender las luces de la cocina", como se muestra en el ejemplo de llama-cli. Es adecuado por su capacidad de tool calling y su bajo requisito de hardware.
- Integración en pipelines de automatización: se puede desplegar con llama-server y exponer una API REST para que otros servicios envíen peticiones y reciban respuestas con llamadas a herramientas, ideal para flujos de CI/CD o automatización de tareas.
- Agentes de atención al cliente en local: un sistema de soporte que ejecuta el modelo en una máquina local y utiliza tool calling para consultar bases de datos de pedidos o tickets, sin depender de servicios en la nube.
- Prototipado de agentes con tool calling: por su pequeño tamaño, es útil para desarrollar y probar flujos de agente con tool calling en entornos de desarrollo antes de migrar a modelos más grandes.
- Inferencia en dispositivos embebidos: la cuantización Q4_K_M está pensada para sistemas como el Jetson Nano, permitiendo ejecutar un agente con tool calling en un dispositivo de bajo consumo.
- Asistente de programación local: puede integrarse en editores de código para generar llamadas a herramientas que ejecuten comandos, busquen documentación o manipulen archivos, gracias a su capacidad de generar JSON estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para esta versión afinada.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - F16: aproximadamente 3 GB
  - Q8_0: aproximadamente 1,6 GB
  - Q5_K_M: aproximadamente 1,2 GB
  - Q4_K_M: aproximadamente 1 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones ligeras; para F16 se recomienda una GPU con 4 GB o más (por ejemplo, RTX 3050 o superior).
- Consumer GPU: cabe en la mayoría de las GPU de consumo, incluso en tarjetas integradas con VRAM compartida si se usa Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), y por extensión cualquier backend compatible con GGUF como Ollama o LM Studio. También es compatible con vLLM si se convierte a safetensors, aunque no se recomienda por el formato.
- Latencia y throughput: no se han publicado datos concretos, pero para un modelo de 1.5B en cuantización Q4_K_M en una GPU moderna, se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| iromu/qwen25-1.5b-tools-GGUF | 1,5B | 4096 (entrenamiento) | Si (fine-tuned) | Apache-2.0 | GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32K | No nativo, requiere prompting | Apache-2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K | No nativo, requiere prompting | Apache-2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,2B | 128K | No nativo, requiere prompting | Llama 3.2 Community License | safetensors, GGUF |

La ventaja principal de este modelo frente a las alternativas es que ya viene afinado para tool calling, lo que evita la necesidad de ingeniería de prompting compleja o de usar frameworks de parsing para extraer llamadas a herramientas. Su limitación es que solo se ha entrenado con 4096 tokens de contexto y solo en inglés.

## Limitaciones y advertencias

- El modelo está entrenado solo en inglés, por lo que no se recomienda su uso en otros idiomas sin un fine-tuning adicional.
- La longitud de contexto de entrenamiento es de 4096 tokens, inferior a los 32K del base; usarlo con contextos más largos puede degradar la calidad de las respuestas.
- No es un reemplazo de modelos más grandes: está pensado para tareas de tool calling y agentes ligeros, no para razonamiento complejo o generación de texto general.
- Riesgo de alucinación en las llamadas a herramientas: el modelo puede generar nombres de funciones o argumentos que no existen si no se valida adecuadamente la salida.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del dataset de entrenamiento si se usa en productos comerciales.
- No se han publicado resultados de benchmarks, por lo que no hay garantías sobre el rendimiento en tareas estándar.
- La cuantización Q4_K_M es la más ligera, pero puede producir una degradación notable en la calidad de las respuestas en comparación con F16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/qwen25-1.5b-tools-GGUF
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo Qwen2.5-1.5B-Instruct (oficial): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio Qwen2.5-Omni en GitHub: https://github.com/QwenLM/Qwen2.5-Omni
- Página de Ollama para Qwen2.5 1.5b: https://ollama.com/library/qwen2.5:1.5b
