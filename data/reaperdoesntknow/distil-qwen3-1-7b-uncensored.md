# reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored

## Resumen

DiStil-Qwen3-1.7B-uncensored es un modelo de lenguaje de 2.031.739.904 parámetros (1.7B efectivos) desarrollado por reaperdoesntknow bajo la división de investigación de Convergent Intelligence LLC. Se trata de un ajuste fino supervisado (SFT) sobre la arquitectura Qwen3, entrenado con datos de instrucción sin censura para eliminar los comportamientos de rechazo impuestos por el alineamiento, preservando las capacidades de razonamiento y generación del modelo base. El modelo parte de `reaperdoesntknow/TopologicalQwen` como base declarada y forma parte de una cadena de destilación orientada a la transferencia de capacidades sin alineamiento.

La relevancia del modelo radica en su enfoque: en lugar de aplicar RLHF con criterios de seguridad, se realiza una intervención puramente SFT sobre la superficie de respuesta para desplazar la distribución del modelo fuera de los patrones de negativa. Mantiene la arquitectura y el tokenizador originales de Qwen3, con 28 capas, atención GQA (16 cabezas Q / 8 KV), tamaño oculto de 2048 y una ventana de contexto de 40.960 tokens.

El autor lo presenta como la base de una cadena de destilación que continúa con `Disctil-Qwen3-1.7B` (refinamiento informado por DISC). La model card incluye un marco matemático propio, "Discrepancy Calculus" (DISC), basado en teoría de la medida, que descompone la distribución del profesor en componentes suaves, de salto y de Cantor. No se han publicado resultados de benchmarks ni datos sobre composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe una variante GGUF del modelo paralelo `DistilQwen3-1.7B-uncensored-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Tamanio oculto | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Dimension intermedia | 6144 |
| Vocabulario | 151.936 |
| Modelo base | reaperdoesntknow/TopologicalQwen |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3ForCausalLM, un transformer decoder-only con atención de consultas agrupadas (GQA) de 16 cabezas de consulta y 8 de clave-valor, 28 capas, tamaño oculto de 2048 y dimensión intermedia de 6144. El vocabulario es de 151.936 tokens. No se introducen modificaciones arquitectónicas respecto al modelo base: la intervención es exclusivamente sobre la superficie de respuesta mediante SFT.

El entrenamiento se realizó con TRL (Transformer Reinforcement Learning) sobre datos de instrucción sin censura, con el objetivo de desplazar la distribución de respuestas del modelo fuera de los patrones de rechazo. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El autor enmarca el proceso en el marco teórico "Discrepancy Calculus" (DISC), que descompone la distribución del profesor mediante la identidad fundamental de malla en componentes AC, de salto y de Cantor, y define un operador de discrepancia que cuantifica el desajuste estructural local que la divergencia KL promedia. No se aportan métricas de entrenamiento ni curvas de pérdida en la información disponible.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat (`apply_chat_template`) compatible con el formato de conversación de Qwen3.
- Razonamiento y generación de contenido técnico y analítico, según declara el autor, preservando las capacidades del modelo base.
- Respuestas sin patrones de rechazo ante consultas técnicas, analíticas y de investigación que los filtros de seguridad convencionales suelen bloquear erróneamente.
- Soporte de conversaciones multi-turno gracias a una ventana de contexto de 40.960 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada (el vocabulario de 151.936 tokens de Qwen3 sugiere cobertura multilingüe amplia, pero no se confirma).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar empíricamente cómo el SFT sin censura afecta a la distribución de respuestas y a las capacidades de razonamiento en modelos pequeños, sirviendo como referencia en experimentos comparativos frente a la versión alineada de Qwen3-1.7B.
- Análisis técnico y red teaming: útil para evaluar la eficacia de los filtros de seguridad y para generar respuestas que los modelos alineados rechazan, en entornos controlados de auditoría de sistemas.
- Generación de documentación técnica especializada: con 40.960 tokens de contexto puede procesar manuales, especificaciones o bases de código extensas y producir resúmenes o explicaciones detalladas sin las interrupciones de negativa que afectan a consultas legítimas sobre temas sensibles.
- Asistencia en investigación académica: redacción y revisión de texto científico sobre temas que rozan áreas sensibles (seguridad, biología, criptografía) donde los filtros de alineamiento pueden degradar la utilidad de la respuesta.
- Despliegue en edge y entornos con recursos limitados: con 2.03B parámetros y pesos en safetensors, es viable en GPUs de consumo y en CPU con cuantización, adecuado para prototipos locales de asistentes conversacionales.
- Base para pipelines de destilación: el modelo está diseñado explícitamente como eslabón inicial de una cadena de destilación (hacia `Disctil-Qwen3-1.7B`), por lo que sirve como punto de partida para experimentos de transferencia de capacidades.
- Generación de código en entornos de desarrollo: aunque no se documenta soporte específico de tool calling, el modelo puede integrarse en asistentes de programación locales para tareas de completado y explicación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,1 GB solo para pesos (2.03B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 6-8 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,1 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con contexto reducido (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 para despliegues de mayor throughput o contexto completo de 40.960 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16, y en tarjetas con 4-6 GB con cuantización de 4-8 bits.
- Opciones de despliegue: Transformers (código de ejemplo en la model card), vLLM, llama.cpp y Ollama si se dispone de pesos GGUF (existe una variante GGUF del modelo paralelo `DistilQwen3-1.7B-uncensored-GGUF`), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DiStil-Qwen3-1.7B-uncensored | 2,03B | 40.960 | no disponible | Hugging Face, safetensors | SFT sin censura sobre Qwen3 |
| Qwen3-1.7B (original) | 1,7B | 40.960 (según arquitectura Qwen3) | Apache 2.0 (según Qwen3) | Hugging Face | Modelo base alineado de referencia |
| Disctil-Qwen3-1.7B | 1,7B | no disponible | no disponible | Hugging Face | Refinamiento DISC del modelo analizado |
| DistilQwen3-1.7B-uncensored | 1,7B | no disponible | no disponible | Hugging Face | Variante paralela de destilación sin censura |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de los modelos de la cadena en la información proporcionada. La licencia de Qwen3-1.7B se indica como Apache 2.0 según el conocimiento general del modelo original, pero no se confirma en la información facilitada.

## Limitaciones y advertencias

- Ausencia de alineamiento: el modelo está entrenado explícitamente para eliminar los comportamientos de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático sin filtros. No es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 1,7B parámetros, la tasa de alucinación es previsiblemente superior a la de modelos de mayor tamaño.
- Sesgos: no se documenta ningún análisis de sesgos ni de composición del dataset de entrenamiento, por lo que se desconocen los sesgos potenciales introducidos por los datos de SFT.
- Licencia no especificada: la model card no indica licencia, lo que impide confirmar los términos de uso comercial. El modelo base Qwen3 se distribuye habitualmente bajo Apache 2.0, pero la licencia de este derivado no está declarada.
- Idiomas: no se confirma qué idiomas soporta el ajuste fino; el vocabulario original de Qwen3 es multilingüe, pero el SFT sin censura podría haber degradado el rendimiento en idiomas distintos del inglés.
- Contexto: aunque la arquitectura soporta 40.960 tokens, no se ha verificado el rendimiento en el extremo superior de la ventana tras el SFT.
- Trazabilidad limitada: la model card incluye un marco teórico (DISC) sin resultados empíricos publicados ni métricas de entrenamiento, lo que dificulta la reproducibilidad.
- Uso en producción: requiere moderación de salida obligatoria, registro de auditoría y revisión legal previa, especialmente en jurisdicciones con requisitos de seguridad de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo base declarado (TopologicalQwen): https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Refinamiento DISC (Disctil-Qwen3-1.7B): https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Variante paralela (DistilQwen3-1.7B-uncensored): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Variante GGUF (DistilQwen3-1.7B-uncensored-GGUF): https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Metodología "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Perfil del autor: https://huggingface.co/reaperdoesntknow
