# iromu/Qwen3-0.6B-tools-GGUF

## Resumen

El modelo `iromu/Qwen3-0.6B-tools-GGUF` es un fine-tuning con LoRA del modelo base `Qwen/Qwen3-0.6B`, orientado específicamente a tool calling y a interacciones de tipo agente. Lo desarrolla el usuario iromu y se distribuye en formato GGUF, lo que permite su ejecución en entornos con recursos limitados mediante llama.cpp u otros motores compatibles. Su objetivo principal es ofrecer capacidades de llamada a funciones estructurada en un modelo de solo 0.6B de parámetros, pensado para despliegue en dispositivos edge o en entornos donde el uso de modelos grandes no es viable.

El modelo se entrenó sobre el split `sft_tools` del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que contiene destilaciones de modelos propietarios de gran tamaño. El entrenamiento se realizó con NVIDIA NeMo AutoModel, usando LoRA con dimensión 32 y alpha 32, sobre todas las proyecciones de atención y MLP. El resultado es un modelo compacto que conserva las capacidades generales del Qwen3-0.6B original, pero con un énfasis especial en la generación de llamadas a herramientas y en el razonamiento multi-paso típico de los agentes.

La relevancia de este modelo radica en que demuestra que es posible especializar modelos muy pequeños para tareas concretas de tool calling, abriendo la puerta a asistentes ligeros, automatización en dispositivos de bajo consumo y prototipado rápido de agentes. No está pensado como un sustituto de los modelos Qwen3 de mayor tamaño, sino como una alternativa de bajo coste para escenarios donde la latencia, la memoria o el consumo energético son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 596.049.920 (0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 (maximo usado en entrenamiento; el modelo base soporta mas) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen3 soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen3-0.6B, que emplea atención por ventanas deslizantes y un mecanismo de pensamiento hibrido (thinking mode opcional). Sobre esta base se aplicó un fine-tuning con LoRA (PEFT) de dimension 32 y alpha 32, con dropout de 0.05, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con NVIDIA NeMo AutoModel en precision mixta bf16, con una tasa de aprendizaje de 5e-5, weight decay de 0.01, batch global de 64 (micro batch 2 con 32 pasos de acumulacion) y un total de 336 pasos. La longitud máxima de secuencia se fijó en 4096 tokens.

El dataset de entrenamiento, `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, es una destilación de respuestas generadas por modelos propietarios de gran tamaño (Qwen3.8-max, GLM5.2 y Kimi K3), centrada en el split `sft_tools`, que contiene ejemplos de llamadas a herramientas y conversaciones de tipo agente. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de supervisión (SFT). La elección de LoRA en lugar de un fine-tuning completo reduce significativamente el coste de entrenamiento y el riesgo de olvido catastrófico, manteniendo las capacidades generales del modelo base.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen3-0.6B.
- Tool calling estructurado: el modelo es capaz de generar llamadas a funciones en formato JSON, siguiendo los esquemas definidos por el usuario.
- Interacciones de tipo agente: puede mantener conversaciones multi-turno donde decide qué herramienta invocar en cada paso y procesa los resultados devueltos.
- Soporte para multiples herramientas en un mismo contexto, gracias al entrenamiento con el dataset de destilacion.
- Capacidad de razonamiento multi-paso limitada, adecuada para tareas simples de automatizacion.
- Multilingue limitado: aunque el modelo base soporta varios idiomas, el fine-tuning se realizo principalmente en ingles, por lo que el rendimiento en tool calling en otros idiomas puede degradarse.

## Casos de uso

- Asistentes de voz en dispositivos de bajo consumo: el modelo puede ejecutarse en un Raspberry Pi o en un telefono movil y gestionar llamadas a APIs de domotica, calendario o mensajeria, gracias a su reducido tamano y a su capacidad de tool calling.
- Automatizacion de tareas en entornos CI/CD: integrado en un pipeline, puede interpretar comandos en lenguaje natural y traducirlos a llamadas a funciones de despliegue, notificacion o gestion de incidencias.
- Chatbots de atencion al cliente en canales con recursos limitados: el modelo puede derivar consultas a APIs de reservas, consultas de saldo o seguimiento de pedidos, sin necesidad de infraestructura GPU potente.
- Prototipado rapido de agentes: al ser un modelo pequeno y rapido, permite iterar sobre el diseno de prompts y esquemas de herramientas antes de migrar a un modelo mayor.
- Filtrado y enrutamiento de peticiones en arquitecturas multi-modelo: un modelo grande puede delegar tareas simples de tool calling a este modelo para reducir coste y latencia.
- Educacion e investigacion: sirve como ejemplo de fine-tuning con LoRA para tool calling, y como base para experimentos de destilacion o cuantizacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo fine-tuneado. El rendimiento en tool calling debe evaluarse de forma especifica con el dataset de destino, ya que el modelo esta especializado en esa tarea y no en benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el modelo ocupa aproximadamente 0.5 GB, por lo que cabe en GPUs con 1-2 GB de VRAM. Con Q8_0, alrededor de 0.7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 2060, etc.). Tambien puede ejecutarse en CPU con llama.cpp, con latencias aceptables para tareas de tool calling.
- Despliegue en edge: apto para dispositivos con 1-2 GB de RAM, como Raspberry Pi 4/5, moviles con soporte de llama.cpp o placas con NPU.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama (si se importa el archivo), llama-cpp-python, o servidores como llama-server.
- Latencia y throughput: no se han publicado mediciones especificas. En una CPU moderna, la generacion de una llamada a herramienta (50-100 tokens) puede tardar entre 1 y 3 segundos; en una GPU consumer, por debajo de 100 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-tools-GGUF | 0.6B | 4096 (entrenamiento) | Especializado | Apache-2.0 | GGUF |
| Qwen/Qwen3-0.6B (base) | 0.6B | 32K (segun documentacion) | Nativo (menos optimizado) | Apache-2.0 | Safetensors, GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | 32K | Nativo | Apache-2.0 | Safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1.2B | 128K | Nativo | Llama 3.2 Community | Safetensors, GGUF |

La comparativa se basa en datos publicos de los modelos base. El modelo de iromu se diferencia por estar especificamente afinado para tool calling, mientras que los modelos base ofrecen esa capacidad de forma generica. En terminos de tamano, es comparable a Qwen2.5-0.5B, aunque con una arquitectura mas moderna (Qwen3). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de 0.6B: su capacidad de razonamiento y generacion es limitada en comparacion con modelos de 7B o superiores. Puede cometer errores en tareas complejas o alucinar llamadas a herramientas inexistentes.
- Entrenado principalmente en ingles: el tool calling en otros idiomas puede ser poco fiable, aunque el modelo base tenga capacidades multilingues.
- Longitud de contexto limitada a 4096 tokens durante el entrenamiento: aunque el modelo base soporta mas, el fine-tuning no ha sido validado para contextos mayores, por lo que su comportamiento puede degradarse.
- No es un reemplazo de modelos grandes: la model card del autor lo indica explicitamente. Para tareas que requieran razonamiento profundo o manejo de contextos extensos, se recomienda usar modelos de mayor tamano.
- Riesgo de alucinacion en la generacion de argumentos de funciones: al ser un modelo pequeno, puede inventar valores o parametros que no corresponden al esquema definido.
- El dataset de entrenamiento es una destilacion de modelos propietarios; no se ha publicado informacion sobre su licencia ni sobre posibles sesgos en los datos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del dataset original si se planea redistribuir el modelo o sus derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-tools-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Version GGUF de unsloth para Qwen3-0.6B: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Guia completa de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
