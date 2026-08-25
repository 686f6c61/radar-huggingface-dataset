# ibm-granite/granite-4.2-3b

## Resumen

Granite-4.2-3B es el modelo compacto de razonamiento de la familia Granite 4.2, desarrollado por el equipo Granite de IBM y publicado el 25 de agosto de 2026 bajo licencia Apache 2.0. Se trata de un transformer denso decoder-only con 3.659 millones de parámetros, construido a partir del modelo base Granite-4.1-3B-Base mediante un proceso de fine-tuning que incorpora capacidades nativas de razonamiento paso a paso (chain-of-thought). Es el primer lanzamiento de IBM que integra un modo de pensamiento conmutable en todos sus modelos, permitiendo alternar entre razonamiento completo, razonamiento de bajo esfuerzo y modo sin pensamiento según la consulta.

Su relevancia actual radica en que ofrece capacidades de razonamiento y tool calling en un formato compacto de 3B, con una ventana de contexto nativa de 128K ampliable hasta 512K, lo que lo hace adecuado para despliegues en el edge, entornos con recursos limitados y flujos agénticos donde el coste por inferencia es crítico. Al estar licenciado bajo Apache 2.0, permite uso comercial y académico sin restricciones, y soporta 12 idiomas de forma probada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parametros totales | 3.659.737.600 (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K nativa, extensible a 512K |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, bfloat16 |

## Arquitectura y entrenamiento

Granite-4.2-3B emplea una arquitectura de transformer denso decoder-only con Grouped Query Attention (GQA) compuesta por 40 cabezas de atención y 8 cabezas KV, con un tamaño de cabeza de 64 y una dimensión de embedding de 2560 distribuida en 40 capas. La codificación posicional usa Rotary Position Embedding (RoPE) con un theta de 10.000.000, pensado para soportar ventanas de contexto largas. El bloque feed-forward utiliza MLP con activación SwiGLU y tamaño oculto de 8192, y la normalización se realiza con RMSNorm (ε = 1e-5). Los embeddings de entrada y salida no están atados, y la precisión de entrenamiento e inferencia es bfloat16.

El modelo parte de Granite-4.1-3B-Base y se sometió a un proceso de fine-tuning orientado a razonamiento que introduce un modo de pensamiento nativo con formato `thinking... response`. Este mecanismo permite al modelo generar una cadena de razonamiento intermedia antes de producir la respuesta final, con tres modos conmutables: pensamiento completo (por defecto), modo sin pensamiento y modo de bajo esfuerzo, lo que permite ajustar el balance entre profundidad de razonamiento y latencia en cada consulta. El entrenamiento también incorpora tool calling aumentado con razonamiento, donde el modelo delibera sobre qué herramientas invocar y por qué antes de emitir las llamadas de función. Los detalles específicos del dataset de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no se han publicado en la información disponible.

## Capacidades

- Razonamiento nativo con chain-of-thought integrado, activable o desactivable según la consulta mediante tres modos: full thinking (por defecto), non-thinking y low-effort.
- Generación de código y asistencia en programación, con soporte para razonamiento multi-paso en problemas de lógica y algoritmia.
- Tool calling aumentado con razonamiento: el modelo decide qué herramientas invocar y justifica la elección antes de ejecutar la llamada, mejorando la precisión en workflows agénticos.
- Soporte de agentes y razonamiento multi-paso, apto para orquestar secuencias complejas de acciones.
- Capacidades multilingües en 12 idiomas probados: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Diálogo conversacional multi-turno con ventana de contexto de 128K tokens, ampliable a 512K para documentos extensos y conversaciones largas.
- Razonamiento matemático y lógico de nivel avanzado para su tamaño, mejorado por el modo de pensamiento.

## Casos de uso

- Asistente de atención al cliente multilingüe: con su ventana de 128K tokens y soporte para 12 idiomas, puede gestionar conversaciones multi-turno con historial completo del cliente, resolviendo incidencias en el idioma nativo del usuario sin necesidad de un modelo mayor.
- Generación de código en entornos de producción: su capacidad de tool calling y razonamiento estructurado permite integrarlo en pipelines de CI/CD para autocompletar código, generar tests unitarios y revisar pull requests, con la ventaja de poder ejecutarse en infraestructura de coste reducido.
- Agente de automatización de tareas empresariales: el modelo puede razonar sobre qué APIs o herramientas internas invocar para completar tareas administrativas (crear tickets, actualizar registros, programar reuniones) mediante llamadas de función justificadas.
- Análisis y resumen de documentos largos: su contexto nativo de 128K permite procesar contratos, informes técnicos o expedientes completos, extrayendo conclusiones y respondiendo preguntas sobre el contenido sin fragmentación.
- Chatbot de soporte técnico de software: capaz de razonar paso a paso sobre errores de programación, proponer soluciones y ejecutar herramientas de diagnóstico externas cuando es necesario.
- Educación y tutoría de programación: el modo de razonamiento visible (`thinking... response`) permite explicar el proceso de resolución de problemas de forma pedagógica, mostrando el razonamiento intermedio al estudiante.
- Despliegue en el edge o en dispositivos con recursos limitados: con solo 3B de parámetros y la posibilidad de cuantización, puede ejecutarse en CPUs o GPUs de consumo, llevando razonamiento avanzado a entornos sin conexión o con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con métricas como MMLU, HumanEval o GSM8K, por lo que no es posible presentar datos de rendimiento verificables en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,3 GB (pesos del modelo), más overhead de KV cache y activaciones, por lo que se recomienda al menos 10-12 GB de VRAM para inferencia con contexto completo.
- Con cuantización de 8 bits, el modelo cabe en torno a 3,7 GB de VRAM, y con 4 bits en aproximadamente 2 GB, aunque no se han publicado cuantizaciones oficiales.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), o GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) para despliegues con cuantización.
- Sí cabe en GPUs de consumo: una RTX 4060 de 8 GB puede ejecutar el modelo en 4 bits, aunque con limitaciones de contexto y throughput.
- Opciones de despliegue: compatible con la librería transformers de HuggingFace, vLLM, llama.cpp y Ollama (al estar en formato safetensors, puede convertirse a GGUF). También es compatible con los endpoints de IBM.
- Latencia y throughput estimados: no se han publicado datos oficiales. En una RTX 4090 con bfloat16, se puede esperar un throughput del orden de 50-100 tokens/s, dependiendo del contexto y del modo de razonamiento activado.

## Comparativa con modelos similares

Comparativa dentro de la familia Granite 4.2 (datos de la model card):

| Parametro | Granite-4.2-3B | Granite-4.2-8B | Granite-4.2-30B |
|---|---|---|---|
| Parámetros | 3B | 8B | 30B |
| Capas | 40 | 40 | 64 |
| Tamaño embedding | 2560 | 4096 | 4096 |
| Cabezas de atención | 40 | 32 | 32 |
| Cabezas KV | 8 | 8 | 8 |
| MLP hidden size | 8192 | 12800 | 32768 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

La comparativa con modelos externos del mismo tamaño (por ejemplo, Qwen2.5-3B, Llama-3.2-3B) no está disponible en la información proporcionada. Granite-4.2-3B se distingue por su contexto nativo de 128K, que supera a la mayoría de modelos de su categoría, y por su modo de razonamiento integrado, algo inusual en modelos de 3B.

## Limitaciones y advertencias

- Los idiomas no incluidos en la lista de 12 probados pueden funcionar, pero no han sido verificados por IBM; el rendimiento en ellos es impredecible.
- Al ser un modelo de 3B, su capacidad de razonamiento profundo y de generación de código complejo es inferior a modelos de mayor tamaño (8B, 30B, 70B); el modo de pensamiento mejora el rendimiento pero no compensa completamente la menor capacidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas, y la salida final hereda esos errores.
- La ventana de contexto de 512K es una extensión a largo plazo; el rendimiento con contextos extremadamente largos no está documentado y puede degradarse en precisión de recuperación de información.
- No se han publicado benchmarks, por lo que no se puede verificar el rendimiento real frente a competidores; las afirmaciones de la model card deben tomarse con cautela hasta que se publiquen evaluaciones independientes.
- El modo de razonamiento por defecto genera tokens de pensamiento que aumentan la latencia y el coste por consulta; en aplicaciones de alta frecuencia puede ser necesario desactivarlo o usar el modo low-effort.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción requiere validar el cumplimiento de las políticas de datos de la empresa, especialmente en sectores regulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-3b
- Colección Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Modelo base Granite-4.1-3B-Base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Página de IBM Granite: https://www.ibm.com/granite
- Documentación de Granite 4.0: https://www.ibm.com/granite/docs/models/granite
