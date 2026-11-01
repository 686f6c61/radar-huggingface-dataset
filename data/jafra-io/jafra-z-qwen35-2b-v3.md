# jafra-io/jafra-z-qwen35-2b-v3

## Resumen

Jafra Z v3 (qwen35-2b) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario jafra-io. El modelo está entrenado sobre el conjunto de datos propietario `jafra-trajectories-v3`, compuesto por 1.639 filas de entrenamiento escritas a mano y 45 de validación, con pérdida calculada únicamente sobre las respuestas del asistente, incluyendo los bloques `<think>` y las llamadas a herramientas. Su propósito declarado es alimentar KUSMA (Knowledge-driven Unified Systems Monitoring Assistant) dentro del ecosistema Jafra, un asistente orientado a la monitorización de sistemas.

Con 1.881.825.088 parámetros totales (aproximadamente 1,88 mil millones), el modelo hereda la arquitectura y la ventana de contexto de Qwen3.5-2B, e incorpora capacidades de razonamiento explícito (thinking mode) y de tool calling siguiendo la plantilla nativa de Qwen3.5. Se distribuye en múltiples formatos: adaptador LoRA, modelo fusionado en fp16 y cuantizaciones GGUF para llama.cpp, lo que facilita su despliegue tanto en entornos de investigación como en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de especialización de un modelo pequeño para una tarea de dominio (monitorización de sistemas con agentes); por otro, advierte de que el entrenamiento se detuvo de forma prematura en el paso 146 de 410, por lo que se trata de una ejecución parcial. El repositorio, con 0 descargas y 0 likes en el momento de la consulta, corresponde a una publicación reciente (creado el 31 de octubre de 2026 y actualizado el 1 de noviembre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B); ajuste fino LoRA |
| Parámetros totales | 1.881.825.088 (≈1,88 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-2B; MAX_LEN de entrenamiento 8192) |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0, Q6_K, Q4_K_S, Q5_K_S, Q3_K_M, Q2_K; además fp16 (merged) y adaptador LoRA |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merged fp16 y adaptador), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,88 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con PEFT/LoRA de rango 16, tasa de aprendizaje 0,0001, 2 épocas y una longitud máxima de secuencia de 8192 tokens, en una configuración de cuantización 4 bits con acumulación en fp32 (`a1-single-peft-4bit-fp32`). El entrenamiento se ejecutó en una única GPU Kaggle T4, en paralelo con otro modelo de la misma familia en la segunda T4 disponible.

El conjunto de datos `jafra-trajectories-v3` contiene 1.639 filas de entrenamiento y 45 de validación, escritas a mano, con la pérdida aplicada solo a los turnos del asistente, incluyendo los bloques de razonamiento `<think>` y las llamadas a herramientas. Es importante señalar que el entrenamiento se detuvo de forma anticipada en el paso 146 de 410, por lo que el modelo publicado corresponde a una ejecución parcial y no a la convergencia completa prevista. El autor indica que la comprobación de carga del GGUF en llama.cpp fue satisfactoria.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con plantilla de chat compatible con transformers y endpoints.
- Razonamiento explícito mediante bloques `<think>`, con recomendación de servir el modelo con `enable_thinking=True`.
- Tool calling / function calling siguiendo la plantilla nativa de Qwen3.5: `<tool_call><function=x><parameter=y>v</parameter></function></tool_call>`.
- Ejecución de trayectorias de agente orientadas a monitorización de sistemas (caso de uso declarado: KUSMA).
- Especialización en tareas de dominio derivadas del dataset `jafra-trajectories-v3`.
- Soporte de cuantizaciones GGUF para despliegue en llama.cpp.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Asistente de monitorización de sistemas: el modelo puede gestionar conversaciones multi-turno e invocar herramientas para consultar métricas, estados de servicios o alertas, que es exactamente el escenario para el que fue ajustado dentro de KUSMA.
- Automatización de diagnóstico con agentes: gracias al soporte de tool calling y de bloques de razonamiento, puede encadenar varios pasos (consultar estado, interpretar resultado, proponer acción) en un flujo de resolución de incidencias.
- Integración en pipelines de operaciones (AIOps): el modelo puede actuar como capa de decisión ligera que traduce lenguaje natural en llamadas a funciones de monitorización, sin necesidad de un modelo grande.
- Prototipado de agentes en hardware de consumo: al disponer de cuantizaciones GGUF (desde Q2_K hasta Q8_0), puede desplegarse en estaciones de trabajo modestas o en portátiles con GPU integrada para pruebas de concepto.
- Enrutamiento y clasificación de consultas técnicas: su tamaño reducido permite usarlo como primer eslabón de un sistema mayor, clasificando o resumiendo consultas antes de derivarlas a modelos de mayor capacidad.
- Investigación sobre ajuste fino eficiente: el repositorio incluye adaptador LoRA, modelo fusionado y checkpoints, lo que lo convierte en un material útil para estudiar el efecto de entrenamientos parciales y de la pérdida solo sobre el asistente.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su incorporación en productos comerciales, siempre que se respeten las condiciones de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, en torno a 1,2-1,5 GB de pesos más overhead de contexto; en fp16, aproximadamente 3,8 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas (GTX 1660, RTX 3050, RTX 4060); para fp16 con contexto largo, se recomienda RTX 3090/4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más usando GGUF; el entrenamiento documentado se realizó en una T4 de 16 GB.
- Opciones de despliegue: llama.cpp (verificado por el autor), Ollama, transformers con PEFT para el adaptador, y servidores compatibles con endpoints (vLLM y TGI no están documentados explícitamente para este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jafra Z v3 (qwen35-2b) | ≈1,88 B | No disponible (MAX_LEN 8192 en entrenamiento) | Apache 2.0 | HuggingFace (jafra-io) | Ajuste fino parcial sobre Qwen3.5-2B; especializado en monitorización |
| Qwen/Qwen3.5-2B | ≈2 B | No disponible en la información | No disponible en la información | HuggingFace (Qwen) | Modelo base generalista sin especialización |
| Alternativas de ~2 B con tool calling | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Entrenamiento parcial: el autor indica que la ejecución se detuvo en el paso 146 de 410, por lo que el modelo puede no haber convergido y su rendimiento puede ser inferior al esperado.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-2B, puede heredar los sesgos del modelo base y del dataset propietario.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje de este tamaño; especialmente relevante en un dominio técnico donde las respuestas incorrectas sobre estados de sistemas pueden tener consecuencias operativas.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no se especifican; el ajuste se realizó sobre un dataset presumiblemente limitado en cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.5-2B.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, sin validación externa ni benchmarks publicados; se recomienda evaluarlo en el dominio objetivo antes de cualquier despliegue real.
- El formato de las llamadas a herramientas depende de la plantilla de Qwen3.5; un cambio de plantilla o de servidor de inferencia puede romper el parseo de las tool calls.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jafra-io/jafra-z-qwen35-2b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp (para GGUF): https://github.com/ggerganov/llama.cpp
- Repositorio de PEFT (usado en el entrenamiento): https://github.com/huggingface/peft
