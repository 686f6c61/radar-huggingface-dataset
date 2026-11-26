# reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored

## Resumen

DiStil-Qwen3-1.7B-uncensored es un modelo de lenguaje de 2.031.739.904 parametros (etiquetado comercialmente como "1.7B" por su tamano efectivo) desarrollado por Convergent Intelligence LLC (Research Division) bajo el alias de Hugging Face `reaperdoesntknow`. Se trata de un ajuste fino supervisado (SFT) sobre el modelo TopologicalQwen, que a su vez deriva de la familia Qwen3, orientado a eliminar los comportamientos de rechazo impuestos por el alineamiento y conservar las capacidades de razonamiento y generacion del modelo base.

El modelo se presenta como la base de una cadena de destilacion dentro del portfolio "DistilQwen" del autor, con un refinamiento posterior denominado Disctil-Qwen3-1.7B. La propuesta tecnica central es un "transferencia de capacidad libre de alineamiento": mantener la arquitectura y el tokenizador originales de Qwen3 mientras se desplaza la distribucion de respuestas del modelo fuera de los patrones de negativa. No hay modificaciones arquitectonicas; es una intervencion pura sobre la superficie de respuesta mediante SFT con TRL.

Es relevante para desarrolladores e investigadores que necesitan un modelo pequeno (2B parametros) con contexto largo (40.960 tokens) y sin filtros de rechazo para tareas tecnicas, analiticas o de investigacion donde los heuristicos de seguridad suelen producir falsos positivos. La licencia no esta declarada en la informacion disponible, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (existe una variante GGUF del modelo paralelo DistilQwen3-1.7B-uncensored-GGUF, pero no se confirma para este ID) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Hidden size | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV) — GQA |
| Intermediate size | 6144 |
| Vocabulario | 151.936 tokens |
| Modelo base | reaperdoesntknow/TopologicalQwen |
| Framework de entrenamiento | TRL (supervised fine-tuning) |
| Tamano del repo | 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3 (`Qwen3ForCausalLM`), con 28 capas, hidden size de 2048, atencion con Grouped Query Attention (16 cabezas de consulta y 8 de clave-valor) y una capa intermedia de 6144. El vocabulario es el nativo de Qwen3, con 151.936 tokens, y el contexto maximo es de 40.960 tokens. No hay innovaciones arquitectonicas propias: el modelo conserva la estructura y el tokenizador del base Qwen3 sin modificaciones.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con TRL sobre datos de instruccion "uncensored", partiendo del modelo TopologicalQwen (una destilacion "topology-aware" del propio autor). El objetivo declarado es desplazar la distribucion de respuestas del modelo fuera de los patrones de rechazo sin degradar las capacidades de razonamiento y generacion. La model card menciona un marco matematico denominado "Discrepancy Calculus" (DISC) con un operador de discrepancia local y una descomposicion de la distribucion del profesor en componentes suaves, de salto y de Cantor, pero no se aportan datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La variante Disctil-Qwen3-1.7B se presenta como el refinamiento informado por DISC de este modelo.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del base Qwen3.
- Respuestas sin rechazo a consultas tecnicas, analiticas y de investigacion que los heuristicos de seguridad suelen bloquear.
- Generacion de codigo y matematicas (capacidad declarada del base Qwen3, no verificada con benchmarks en la informacion disponible).
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Capacidad de contexto largo: hasta 40.960 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues: no confirmadas en la informacion disponible (el vocabulario de 151.936 tokens de Qwen3 sugiere cobertura multilingue amplia, pero no se documenta).
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como sujeto de estudio para analizar como el SFT con datos sin censura desplaza la distribucion de respuestas y que capacidades se conservan o degradan, comparandolo con el base Qwen3 alineado.
- Analisis tecnico sin falsos positivos: en dominios como ciberseguridad defensiva, analisis de malware, quimica o biologia, el modelo responde a consultas tecnicas legitimas que los filtros de seguridad suelen bloquear, gracias a la eliminacion de patrones de rechazo.
- Procesamiento de documentos largos: con 40.960 tokens de contexto, puede resumir, extraer informacion y responder preguntas sobre contratos, papers o codigo fuente extensos en una sola pasada.
- Generacion de codigo en pipelines internos: su tamano de 2B permite desplegarlo en infraestructura modesta para autocompletado, generacion de tests o refactorizacion, integrándolo en herramientas de CI/CD siempre que la licencia lo permita.
- Asistente de escritura tecnica: redaccion de documentacion, articulos y analisis sin las restricciones de tono impuestas por el alineamiento, util para equipos que necesitan contenido directo.
- Prototipado rapido en edge: con 2B parametros y pesos safetensors de 8,1 GB en BF16, es viable en GPUs de consumo y en entornos de investigacion con recursos limitados.
- Destilacion y experimentacion academica: al ser la base de una cadena de destilacion documentada, sirve como punto de partida para reproducir o extender la metodologia DISC del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos (2.031.739.904 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,1 GB para pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teoricas, no verificadas para este ID).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 y H100 para despliegue en BF16 con contexto largo; GPUs de 8 GB o menos para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 con contexto moderado, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (documentado en la model card), vLLM y TGI para servir en produccion; llama.cpp y Ollama requieren conversion a GGUF, no confirmada para este ID concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DiStil-Qwen3-1.7B-uncensored | 2,03B | 40.960 | no disponible | Hugging Face (409 descargas) | SFT sin censura sobre TopologicalQwen |
| Disctil-Qwen3-1.7B | no disponible | no disponible | no disponible | Hugging Face (286 descargas) | Refinamiento DISC de este modelo |
| DistilQwen3-1.7B-uncensored | no disponible | no disponible | no disponible | Hugging Face (351 descargas) | Variante paralela de destilacion |
| TopologicalQwen | no disponible | no disponible | no disponible | Hugging Face (622 descargas) | Modelo base, destilacion TKD |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia, lo que impide determinar si el uso comercial esta permitido; es un bloqueante para produccion hasta que el autor la declare.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el SFT sin censura haya preservado las capacidades del base Qwen3; el riesgo de degradacion es real y no esta medido.
- Riesgo de alucinacion: como cualquier modelo de 2B parametros, la tasa de alucinacion es previsiblemente alta en tareas de conocimiento factual; no hay evaluaciones que lo cuantifiquen.
- Eliminacion de rechazos: el modelo responde a practicamente cualquier prompt, incluidos contenidos daninos; requiere moderacion externa en cualquier despliegue orientado al publico.
- Idiomas no documentados: no se confirma el soporte multilingue ni la calidad en castellano.
- Tool calling y modo thinking no documentados: no se puede asumir compatibilidad con pipelines de agentes o function calling.
- Ecosistema limitado: 409 descargas y 2 likes; no hay evidencia de uso en produccion ni de validacion independiente de la metodologia DISC.
- Model card con afirmaciones no verificadas: el marco "Discrepancy Calculus" y la cadena de destilacion se presentan sin resultados reproducibles en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo base TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Refinamiento Disctil-Qwen3-1.7B: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Variante paralela DistilQwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Variante GGUF: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Metodologia "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Portfolio del autor: https://huggingface.co/reaperdoesntknow
