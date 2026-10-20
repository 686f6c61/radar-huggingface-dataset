# sidpnyc/storeops-copilot-qwen2.5-1.5b

## Resumen

`sidpnyc/storeops-copilot-qwen2.5-1.5b` es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario de HuggingFace `sidpnyc` y distribuido exclusivamente en formato GGUF. El autor indica que el entrenamiento y la conversión se realizaron con Unsloth, y el repositorio incluye dos ficheros (`Q4_K_M` y `F16`) junto con un Modelfile para Ollama. El recuento de parámetros reportado es de 1.543.714.304 (1,5B) y el tamaño total del repositorio es de 4,1 GB. Por el nombre, el modelo parece orientado a un copiloto de operaciones de tienda (store operations), aunque la model card no documenta el dataset ni el dominio de entrenamiento.

Su interés práctico reside en el perfil de despliegue: 1,5B parámetros en GGUF permite inferencia en CPU o en GPU de gama de entrada, con requisitos de memoria de alrededor de 1-2 GB en Q4_K_M. Es un candidato para prototipos locales, entornos sin conectividad y tareas de clasificación o extracción acotadas.

Ahora bien, la ficha es mínima: no se declara licencia, idiomas, pipeline, datos de entrenamiento ni evaluación alguna, y el repositorio no registra descargas ni interacciones. Cualquier uso en producción debería ir precedido de una verificación propia del comportamiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (derivado de Qwen2.5-1.5B-Instruct; la model card no detalla la arquitectura) |
| Parámetros totales | 1.543.714.304 (1,5B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens, no confirmado para este ajuste |
| Tipos de cuantización | GGUF Q4_K_M y GGUF F16 (únicos ficheros listados) |
| Idiomas soportados | No disponible (no declarados) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | GGUF; los metadatos de HuggingFace reportan el recuento de parámetros a partir de safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna ni el proceso de entrenamiento. Por el identificador y los ficheros publicados, se trata de un ajuste fino del modelo instructivo Qwen2.5-1.5B-Instruct, es decir, un transformer decoder-only de 1,5B parámetros con atención causal, que ha sido entrenado y posteriormente convertido a GGUF mediante Unsloth. La model card únicamente menciona que el entrenamiento fue "2x más rápido" con Unsloth, lo que sugiere el uso de las optimizaciones de esa librería (típicamente LoRA/QLoRA con kernels fusionados), pero no se especifican método de ajuste, hiperparámetros, número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO posteriores.

Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, modos de razonamiento extendido u otros). El repositorio incluye un Modelfile de Ollama y comandos de ejemplo para `llama-cli` y `llama-mtmd-cli` con el flag `--jinja`, que activa la plantilla de chat Jinja de llama.cpp; esto es infraestructura de despliegue, no una característica del modelo.

## Capacidades

- Generación de texto conversacional: al derivar de una versión Instruct, está preparado para seguir instrucciones y mantener diálogos de varios turnos.
- Razonamiento y código: capacidad acotada por el tamaño (1,5B); el modelo base cubre código y matemáticas elementales, pero no hay evaluación del ajuste fino.
- Tool calling / function calling: el modelo base Qwen2.5 soporta llamada a funciones y el ejemplo de uso emplea `--jinja` para habilitar la plantilla de chat; no confirmado tras el ajuste fino.
- Agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita la fiabilidad en cadenas largas de pasos.
- Capacidades multilingües: no declaradas en la ficha.
- Visión y audio: no soportadas; es un modelo de texto (la mención a `llama-mtmd-cli` proviene de la plantilla genérica de Unsloth).
- Despliegue local y offline: es su ventaja principal, con dos cuantizaciones y Modelfile de Ollama listos para usar.

## Casos de uso

- Copiloto de operaciones de tienda: consultas en lenguaje natural sobre procedimientos, incidencias y checklists. El nombre del modelo apunta a este dominio y el tamaño permite ejecutarlo en el propio punto de venta sin enviar datos a la nube.
- Triaje y enrutado de intenciones: clasificar tickets o mensajes entrantes en categorías antes de derivarlos a un modelo mayor, reduciendo coste por consulta gracias a los ~1-2 GB de memoria que ocupa en Q4_K_M.
- Extracción de datos estructurados: convertir partes de incidencia, albaranes o correos en JSON con campos fijos; tarea repetitiva donde un modelo de 1,5B ajustado al dominio puede bastar.
- Asistente en terminal de punto de venta o dispositivo de borde: inferencia en CPU con llama.cpp u Ollama, sin GPU dedicada y sin conectividad.
- Resúmenes de turno y generación de informes breves: condensar notas operativas o registros diarios en un párrafo accionable.
- RAG ligero sobre manuales internos: con contexto moderado y recuperación de pocos fragmentos, responder preguntas sobre documentación de procedimientos.
- Prototipado rápido de producto: validar una hipótesis de asistente conversacional con el Modelfile de Ollama antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación (MMLU, HumanEval, GSM8K u otras), ni del modelo ajustado ni del base, y tampoco se reportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (Q4_K_M): aproximadamente 1,0-1,5 GB para los pesos, más la caché KV; en torno a 2 GB con contexto moderado. Estimación derivada del recuento de parámetros, no medida por el autor.
- VRAM estimada (F16): aproximadamente 3,1 GB para los pesos; en torno a 4-5 GB con contexto moderado.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más (RTX 3050, RTX 4060, GTX 1650, etc.). No requiere A100 ni H100; ejecutarlo en hardware de centro de datos sería desproporcionado.
- CPU: viable en inferencia por CPU con llama.cpp; no se publican tokens/s.
- Opciones de despliegue: llama.cpp (`llama-cli -hf sidpnyc/storeops-copilot-qwen2.5-1.5b --jinja`, o `llama-server`), Ollama mediante el Modelfile incluido, y bindings de llama.cpp en Python. vLLM y TGI no están pensados para GGUF como formato principal (vLLM tiene soporte GGUF experimental); para esos motores habría que reconvertir a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| storeops-copilot-qwen2.5-1.5b | 1,5B | No disponible | No declarada | GGUF (Q4_K_M, F16) | Ajuste fino sin evaluación ni documentación de entrenamiento |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 (según Qwen) | Safetensors, GGUF, AWQ, GPTQ | Modelo de referencia, con evaluación publicada por el autor original |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens (según Meta) | Llama 3.2 Community License | Safetensors, GGUF | Contexto mucho mayor; licencia con restricciones de uso |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens (según Google) | Gemma Terms of Use | Safetensors, GGUF | Algo más grande y con más cómputo por token |

Los datos de los modelos comparables proceden de su documentación pública y no han sido verificados en la información proporcionada para este repositorio; la comparación de rendimiento no es posible porque el ajuste fino no publica benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, aunque el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0. Conviene contactar con el autor o asumir el marco del modelo base, con cautela jurídica.
- Ausencia total de documentación de entrenamiento: no se indica dataset, método de ajuste, hiperparámetros ni evaluación, por lo que no se puede verificar qué comportamiento se ha modificado respecto al base.
- Riesgo de alucinación alto: con 1,5B parámetros y sin evaluación, la fiabilidad en datos factuales es limitada; requiere validación o anclaje a fuentes en cualquier flujo de producción.
- Contexto efectivo desconocido: la ventana real tras el ajuste fino no está documentada; asumir la del modelo base sin verificar puede provocar degradación en prompts largos.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés o el castellano; habría que evaluarlo.
- Señales de adopción nulas: 0 descargas y 0 likes, con fecha de creación registrada el 2026-10-20, lo que dificulta verificar procedencia y mantenimiento.
- Cuantización Q4_K_M: introduce pérdida de calidad frente a F16; para tareas sensibles conviene usar el fichero F16.
- Dominio presunto: el nombre sugiere especialización en operaciones de tienda; no hay evidencia de que el ajuste no haya degradado capacidades generales (olvido catastrófico) fuera de ese dominio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sidpnyc/storeops-copilot-qwen2.5-1.5b
- Unsloth (librería usada para el entrenamiento y la conversión): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF, comandos de ejemplo de la model card): https://github.com/ggml-org/llama.cpp
- Modelo base referenciado en los nombres de fichero, Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
