# cslemes/qweniskit-coder-1.5b

## Resumen

Qweniskit-Coder-1.5B es un adaptador QLoRA sobre Qwen2.5-Coder-1.5B-Instruct, desarrollado por cslemes como trabajo de fin de curso del programa GenAI e LLM Master de la PUC-Rio. El modelo está especializado en actuar como planificador y generador de código dentro de `qcagent`, un agente que sintetiza circuitos de Qiskit 1.2.4 a partir de enunciados en lenguaje natural y solo acepta un circuito tras verificarlo por simulación. No es un modelo generalista: es un componente de un sistema mayor con verificación externa.

El adaptador se entrena sobre 4320 ejemplos multitarea derivados de 2279 enunciados de un benchmark de composición de circuitos, con respuestas de un profesor (DeepSeek V4.1 Flash) filtradas por un verificador y, en 8 contratos, sustituidas por respuestas canónicas generadas por código. El resultado es un modelo de 1.543.714.304 parámetros que, en la validación de 120 enunciados, alcanza 102/120 aciertos de extremo a extremo en bf16 y 107/120 en GGUF Q8_0, frente a 0/120 del modelo base.

Su relevancia es doble: por un lado, demuestra que un ajuste fino pequeño y bien dirigido puede convertir un modelo de 1,5B en un generador de código de dominio específico fiable dentro de un pipeline verificado; por otro, publica pesos en formatos PEFT y GGUF, lo que permite reproducir el sistema en hardware de consumo. La licencia Apache-2.0 y la disponibilidad de datos de evaluación en un repositorio público facilitan su auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 12.800 tokens en entrenamiento; Modelfile de Ollama con contexto 16k |
| Tipos de cuantización | bf16 (adaptador PEFT sobre base bf16), GGUF Q8_0 (1,6 GB), GGUF Q4_K_M (0,99 GB) |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (Q8_0 y Q4_K_M), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5-Coder, con 1,5B de parámetros y entrenado originalmente para generación de código e instrucciones. Sobre él se aplica un adaptador LoRA con r=16, α=32 y dropout 0,05, entrenado en QLoRA con cuantización NF4 del base. El entrenamiento usó LR 2e-4, 2 épocas (540 pasos), lote efectivo 16, contexto de hasta 12.800 tokens y semilla 1, y se completó en aproximadamente 8 horas sobre una única RTX 3070 de 8 GB.

Los datos de entrenamiento son 4320 ejemplos multitarea (planificador y generador) construidos a partir de 2279 enunciados de entrenamiento del benchmark de composición. Las respuestas provienen de un profesor (DeepSeek V4.1 Flash) y solo se aceptaron las aprobadas por el verificador; en 8 contratos (aritmética reversible y predicados con ancilla) se sustituyeron por respuestas canónicas generadas por código con las primitivas de `qcagent.kit`, también verificadas. El dataset está publicado como `cslemes/qiskit-composition-1p5b-data` (versión `multitask-v3`). No se menciona RLHF ni DPO; la innovación principal es la destilación filtrada por verificador y la integración del adaptador en un agente con recuperación sobre la documentación de Qiskit 1.2.4.

## Capacidades

- Generación de código Qiskit 1.2.4 a partir de enunciados en lenguaje natural, dentro de los 24 contratos del benchmark de composición.
- Planificación de tareas: el modelo actúa como nodo planificador del agente `qcagent`, descomponiendo el enunciado en pasos y requisitos.
- Generación de código como nodo generador, usando el contexto recuperado por el recuperador del agente.
- Soporte de conversación multiturno mediante el template de chat de Qwen2.5 (temperatura 0 en los Modelfiles).
- Capacidades multilingües limitadas a portugués e inglés, según la model card.
- No se documentan tool calling, function calling, agentes multi-paso autónomos, visión, audio ni modo thinking explícito.

## Casos de uso

- Síntesis de circuitos Qiskit en un pipeline educativo: el modelo genera el código a partir de un enunciado y el sistema lo valida por simulación antes de aceptarlo, lo que permite usarlo como asistente en cursos de computación cuántica sin riesgo de dar por buenos circuitos incorrectos.
- Componente de un agente RAG cuántico: integrado en `qcagent`, el modelo planifica y genera código usando la documentación de Qiskit 1.2.4 recuperada, adecuado para prototipos de asistentes de programación cuántica con verificación obligatoria.
- Generación de circuitos para contratos acotados en producción interna: para los 24 contratos del benchmark (aritmética reversible, predicados con ancilla, etc.) el modelo alcanza 102/120 en bf16 y 107/120 en Q8_0, por lo que es viable como generador de primer intento en esos dominios concretos.
- Despliegue local en hardware de consumo: el GGUF Q8_0 (1,6 GB) corre en Ollama y llama.cpp en una GPU de 8 GB o incluso en CPU, lo que permite probar el sistema sin infraestructura dedicada.
- Investigación en destilación con verificación: el par adaptador + dataset + verificador sirve como caso de estudio reproducible para evaluar cómo el filtrado por verificador mejora la fiabilidad de modelos pequeños en código de dominio.
- Evaluación comparativa de cuantizaciones: los GGUF Q8_0 y Q4_K_M permiten medir la pérdida de precisión (12 puntos en Q4_K_M frente a bf16) en un modelo de 1,5B, útil para decidir el formato de despliegue.
- Base para futuros ajustes de dominio: al ser un adaptador PEFT sobre Qwen2.5-Coder-1.5B-Instruct, se puede combinar o continuar entrenando con nuevos contratos sin reentrenar el modelo base.

## Benchmarks y rendimiento

Validación con 120 enunciados no vistos (24 contratos de circuito, 5 enunciados cada uno), generación gulosa, primera tentativa. Un circuito cuenta como acierto solo si su operador coincide analíticamente con la operación pedida; ningún LLM participa en el juicio.

| Modelo (1,5B) | Planificador | Generador | Extremo a extremo |
|---|---|---|---|
| Base sin ajuste | 50/120 | 2/115 | 0/120 |
| Ajuste anterior (respuestas del profesor) | 120/120 | 90/115 | 90/120 |
| Este modelo (bf16) | 120/120 | 100/115 | 102/120 |
| Este modelo, GGUF Q8_0 (Ollama) | no disponible | no disponible | 107/120 |
| Este modelo, GGUF Q4_K_M (Ollama) | no disponible | no disponible | 90/120 |

La diferencia entre bf16 y Q8_0 se atribuye al ruido de la decodificación gulosa por kernels distintos; Q4_K_M pierde 12 puntos. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en las 120 tareas abiertas de la suite original (Grover, QPE, QAOA, etc.), donde modelos de 1,5B siguen cerca de cero según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador PEFT en bf16 requiere cargar el base de 1,5B en bf16 (aproximadamente 3 GB) más el adaptador; el GGUF Q8_0 ocupa 1,6 GB y el Q4_K_M 0,99 GB.
- GPU recomendadas: RTX 3070 (8 GB) fue suficiente para el entrenamiento QLoRA; para inferencia basta con una GPU consumer de 8 GB o menos en GGUF.
- Cabe en GPU consumer: sí, en RTX 3060/3070/4060/4090 y similares con 8 GB o más; también en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: PEFT + transformers (bf16), Ollama 0.40.16 con los Modelfiles incluidos, llama.cpp con los GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qweniskit-Coder-1.5B (este) | 1,54B | hasta 12,8k en entrenamiento; 16k en Modelfile | 102/120 bf16, 107/120 Q8_0 | Apache-2.0 | Hugging Face, GGUF, Ollama |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | no disponible en esta ficha | 0/120 extremo a extremo | Apache-2.0 | Hugging Face |
| Ajuste anterior sobre el mismo base (respuestas del profesor) | 1,54B | no disponible | 90/120 extremo a extremo | no disponible | no disponible |
| Modelos de 1,5B en tareas abiertas (Grover, QPE, QAOA) | ~1,5B | no disponible | cerca de cero según la model card | no disponible | no disponible |

No se dispone de comparación con otros adaptadores Qiskit de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en los 24 contratos del benchmark de composición; en las 120 tareas abiertas de la suite original (Grover, QPE, QAOA, etc.) los modelos de 1,5B siguen cerca de cero.
- Los 120 enunciados de validación también orientaron la elección de iteraciones, por lo que el resultado es algo optimista.
- Las salidas no verificadas no deben usarse como correctas: el modelo es un componente de un sistema que verifica cada circuito por simulación.
- El código generado para los contratos de aritmética reversible y predicados con ancilla importa `qcagent.kit`, por lo que requiere el paquete `qcagent` instalado para ejecutarse.
- Idiomas limitados a portugués e inglés; no se documenta soporte para castellano.
- La cuantización Q4_K_M pierde 12 puntos frente a bf16, un deterioro notable en un modelo de 1,5B.
- No se documentan sesgos específicos, riesgo de alucinación medido ni evaluaciones de seguridad.
- Licencia Apache-2.0 permite uso comercial, pero el proyecto es académico independiente y no está afiliado a IBM (Qiskit) ni a Alibaba (Qwen); conviene revisar las condiciones del modelo base y del dataset.
- El modelo espera prompts en el formato del agente (system prompt del planificador o generador, enunciado, requisitos y contexto recuperado), por lo que su uso fuera de ese formato no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cslemes/qweniskit-coder-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cslemes/qiskit-composition-1p5b-data
- Repositorio del proyecto (código, evaluación y metodología): https://github.com/cslemes/quantum_rag
