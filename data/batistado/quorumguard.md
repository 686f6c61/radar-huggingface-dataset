# batistado/QuorumGuard

## Resumen

QuorumGuard es un controlador de consenso agnóstico al modelo y un planificador de preempción por prioridad en GPU para comités asíncronos de agentes LLM. Lo desarrolla el usuario batistado y se publica bajo licencia Apache 2.0 en Hugging Face. No se trata de un modelo de lenguaje con pesos propios: según la model card, no modifica ningún peso y opera directamente sobre los logits de opciones de pre-commitment, los DAG de procedencia (provenance DAGs) y las prioridades de petición de vLLM. El repositorio de Hugging Face tiene un tamaño de 0,0 GB, lo que es coherente con un artefacto de orquestación más que con un checkpoint de parámetros.

El problema que aborda es el de las latencias de cola (tail latency) y la fiabilidad en sistemas multi-agente: cuando varios LLM actúan como comité, una minoría disidente puede bloquear o degradar el consenso, y las peticiones de baja prioridad pueden competir por GPU con las críticas. QuorumGuard introduce mecanismos de "hedged quorums" condicionados por genealogía de afirmaciones y de preempción de disidencias en vLLM para acotar esos efectos.

La relevancia actual viene de la adopción creciente de arquitecturas de agentes con múltiples modelos y del uso de vLLM como servidor de inferencia en producción. La model card lo vincula a Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct como modelos base de referencia para sus experimentos, aunque el controlador es agnóstico y no depende de ninguno de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje; controlador de consenso y planificador de preempción sobre vLLM (agnóstico al modelo) |
| Parametros totales | No aplica (no modifica pesos; repo de 0,0 GB) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende de los modelos subyacentes del comité) |
| Tipos de cuantizacion | No disponible (no aplica al controlador; depende de los modelos servidos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (no hay pesos; integración vía `pip install` del repositorio) |

## Arquitectura y entrenamiento

Según la model card, QuorumGuard no es un transformer ni un modelo con parámetros entrenados: es una capa de control que se sitúa por encima de un comité de agentes LLM servidos con vLLM. Su funcionamiento se apoya en tres señales: los logits de opciones de pre-commitment, los DAG de procedencia de afirmaciones (claim genealogy) y las prioridades de petición de vLLM. Sobre esas señales aplica "hedged quorums" condicionados por la genealogía de las afirmaciones y una política de preempción de disidencias (dissent preemption) que reordena o interrumpe peticiones en GPU.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO, porque el artefacto no es un modelo entrenado con pesos. La innovación técnica declarada es doble: el uso de la genealogía de afirmaciones para decidir cuándo ampliar el quórum (hedging) y la integración de esa decisión con el planificador de prioridades de vLLM para reducir latencia de cola en comités asíncronos. El dataset asociado, `batistado/QuorumBench`, se presenta como el benchmark de evaluación del sistema.

## Capacidades

- Control de consenso en comités multi-agente de LLM, con quórums ampliados condicionados por la procedencia de las afirmaciones.
- Preempción de peticiones en vLLM basada en prioridad, orientada a reducir latencias de cola en cargas asíncronas.
- Integración con vLLM como servidor de inferencia (tag `vllm` y `endpoints_compatible`).
- Funcionamiento agnóstico al modelo: no requiere modificar pesos y puede aplicarse sobre distintos modelos base del comité.
- Evaluación mediante el dataset `QuorumBench` y un simulador interactivo (`QuorumGuard-Explorer`).
- No se declaran capacidades de generación de texto, visión, audio, tool calling ni razonamiento por sí mismo; esas capacidades corresponden a los modelos del comité.

## Casos de uso

- Comités de agentes para verificación de hechos: varios LLM proponen respuestas y QuorumGuard amplía el quórum solo cuando la genealogía de afirmaciones muestra desacuerdo relevante, evitando coste innecesario en casos claros.
- Moderación o revisión con múltiples modelos: se usa la preempción de disidencias para que las peticiones de revisión crítica no queden bloqueadas por tareas de baja prioridad en la misma GPU.
- Serving de agentes en producción con vLLM: el planificador de prioridades permite acotar la latencia de cola de las peticiones críticas frente a cargas batch concurrentes.
- Investigación en sistemas multi-agente: el simulador `QuorumGuard-Explorer` y `QuorumBench` permiten reproducir experimentos de consenso y latencia sin entrenar modelos.
- Orquestación de comités heterogéneos (por ejemplo, Qwen2.5-3B, 7B y Coder-14B): el controlador decide cuándo escalar a modelos mayores según la disidencia observada.
- Evaluación comparativa de políticas de consenso: útil para medir compromisos entre coste computacional y fiabilidad en pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el dataset `batistado/QuorumBench` como benchmark asociado, pero no incluye cifras de rendimiento, latencia ni comparativas numéricas.

## Requisitos de hardware

- No aplica VRAM propia para el controlador: no contiene pesos y se ejecuta como capa de orquestación sobre vLLM.
- La VRAM necesaria la determinan los modelos del comité (por ejemplo, Qwen2.5-3B-Instruct, Qwen2.5-7B-Instruct y Qwen2.5-Coder-14B-Instruct), no QuorumGuard.
- GPU recomendadas: no disponibles en la información proporcionada; depende de los modelos servidos con vLLM.
- Despliegue: vLLM como servidor de inferencia, con QuorumGuard instalado mediante `pip install git+https://github.com/batistado/quorumguard.git`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. QuorumGuard no es un modelo de lenguaje y la información proporcionada no incluye alternativas comparables de controladores de consenso o planificadores de preempción para comités de agentes LLM.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0,0 GB); no debe tratarse como un modelo descargable para inferencia directa.
- No hay información publicada sobre sesgos, tasas de alucinación ni comportamiento multilingüe del sistema.
- El rendimiento depende críticamente de la implementación de vLLM y de las prioridades configuradas; no se documentan garantías de latencia.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el repositorio de código para condiciones adicionales de las dependencias.
- No se han publicado benchmarks ni métricas reproducibles en la información disponible; la evaluación queda pendiente de `QuorumBench`.
- Al ser un proyecto con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de adopción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/batistado/QuorumGuard
- Dataset QuorumBench: https://huggingface.co/datasets/batistado/QuorumBench
- Simulador interactivo: https://huggingface.co/spaces/batistado/QuorumGuard-Explorer
- Código y paper: https://github.com/batistado/quorumguard
- Modelos base de referencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct, https://huggingface.co/Qwen/Qwen2.5-7B-Instruct, https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
