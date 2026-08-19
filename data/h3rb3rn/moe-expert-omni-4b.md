# h3rb3rn/moe-expert-omni-4b

## Resumen

`moe-expert-omni-4b` es un modelo de lenguaje pequeño (SLM) de 4.2 mil millones de parámetros desarrollado por el usuario h3rb3rn, especializado en síntesis cross-domain e integración de arquitecturas de sistemas complejas. Se trata de un modelo destilado a partir de los modelos instruct Meta-Llama-3.1-405B-Instruct y Nvidia Nemotron-70B, entrenado sobre el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X. Su función principal es actuar como experto integrador dentro de una arquitectura compuesta de IA (compound AI), combinando las salidas de otros modelos especializados (código, bases de datos, gobernanza) en una solución unificada y ejecutable.

El modelo se basa en la arquitectura híbrida de Qwen3.5-4B, que combina atención lineal y capas Mamba, lo que permite manejar contextos de hasta 256 000 tokens con un coste computacional reducido. Se distribuye tanto en formato safetensors (BF16) como en GGUF cuantizado (Q4_K_M y Q8_0), y está disponible bajo licencia Apache 2.0. Está pensado para entornos de producción donde se requiere mantener coherencia a lo largo de sesiones multi-turno extensas y reconciliar especificaciones técnicas dispares entre distintos dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4 205 751 296 (4.2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Inglés, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura híbrida de Qwen3.5-4B, que combina mecanismos de atención lineal con bloques Mamba (state space models). Esta combinación permite procesar secuencias largas con una complejidad computacional subcuadrática, manteniendo un rendimiento competitivo en tareas de razonamiento y generación. Sobre esta base se aplicó un ajuste fino mediante LoRA (r=16, alpha=32) en las proyecciones q, k, v, o, gate, up y down.

El entrenamiento se realizó por destilación desde dos modelos de gran tamaño: Meta-Llama-3.1-405B-Instruct y Nvidia Nemotron-70B. Se utilizó un conjunto de datos propio, `moe-sovereign/expert-omni-sft`, compuesto por 35 500 trayectorias de síntesis multi-turno validadas. El proceso se ejecutó en el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB, usando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6. Se entrenaron 3 épocas con un batch efectivo de 128, una tasa de aprendizaje de 1.5×10⁻⁵ con decaimiento coseno y warmup. La pérdida final fue de 0.0089 y la precisión de token alcanzó el 99.80 %. Tras el ajuste, el adaptador se fusionó en CPU en BF16 y posteriormente se cuantizó a GGUF.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés y alemán.
- Síntesis cross-domain: integra salidas de múltiples expertos especializados (código, seguridad, bases de datos, gobernanza) en una única arquitectura de sistema coherente.
- Mantenimiento de contexto multi-turno: conserva invariantes de sesión y evita la deriva de instrucciones en conversaciones largas (hasta 256k tokens).
- Generación de informes con estructura jerárquica: produce resúmenes ejecutivos seguidos de especificaciones técnicas detalladas.
- Resolución de discrepancias inter-agente: armoniza terminología y contratos de interfaz cuando varios modelos proponen esquemas o definiciones contradictorias.
- Compatible con tool calling y flujos de agente (aunque no se documenta explícitamente, su diseño para integración de sistemas lo hace apto para pipelines de agentes).

## Casos de uso

- Integración de arquitecturas de software empresarial: el modelo puede combinar los resultados de un analizador de seguridad, un generador de esquemas SQL y un diseñador de microservicios Rust en un único documento de arquitectura desplegable, garantizando coherencia entre capas.
- Asistente de diseño de sistemas soberanos: útil en entornos con requisitos regulatorios estrictos (privacidad, residencia de datos), donde debe unificar consideraciones de gobernanza con decisiones técnicas.
- Documentación técnica ejecutiva: genera informes que presentan primero un resumen para dirección y después los detalles de implementación, ahorrando tiempo a equipos que deben comunicar decisiones técnicas a niveles no técnicos.
- Reconciliación de contratos entre servicios: cuando dos equipos proponen esquemas de datos incompatibles, el modelo puede proponer una versión armonizada que satisfaga ambos requisitos funcionales.
- Mantenimiento de estado en asistentes virtuales de soporte: su ventana de 256k tokens permite retener todo el historial de una sesión de atención al cliente de larga duración sin pérdida de contexto.
- Generación de especificaciones de integración para sistemas legacy: puede leer documentación de sistemas antiguos y producir interfaces de conexión con nuevas arquitecturas, unificando terminología y formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (loss 0.0089, token accuracy 99.80 %), que no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K. No se dispone de datos objetivos de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo requiere aproximadamente 8.5 GB de VRAM (4.2B × 2 bytes). Con cuantización GGUF Q8_0, unos 4.5 GB; con Q4_K_M, unos 2.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4090) para BF16; con cuantización Q4 puede ejecutarse en GPUs de 4 GB (GTX 1650, RTX 3050).
- En el supercomputador LUMI-G se entrenó con AMD Instinct MI250X (128 GB), pero para inferencia no se requieren GPUs de datacenter.
- Opciones de despliegue: transformers (con trust_remote_code), llama.cpp, Ollama (mediante Modelfile), y potencialmente vLLM si se añade soporte para la arquitectura híbrida.
- Latencia y throughput estimados: no disponibles. Dado su tamaño reducido y arquitectura híbrida, se espera una generación rápida en GPUs consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| moe-expert-omni-4b | 4.2B | 256k | Apache 2.0 | Síntesis cross-domain, multi-turno |
| Qwen3.5-4B (base) | 4.2B | 256k | Apache 2.0 | Generación general, multilingüe |
| Llama-3.2-3B | 3.2B | 128k | Llama 3.2 Community | Generación general, multilingüe |
| Phi-3.5-mini | 3.8B | 128k | MIT | Razonamiento, código |

El modelo se diferencia de sus alternativas por su enfoque en integración de sistemas y su capacidad de mantener coherencia a lo largo de sesiones extremadamente largas, aunque carece de benchmarks que permitan comparar su rendimiento bruto en tareas estándar.

## Limitaciones y advertencias

- Solo soporta inglés y alemán; no hay soporte documentado para otros idiomas.
- No se han publicado evaluaciones independientes (MMLU, HumanEval, etc.), por lo que su rendimiento real en tareas generales es desconocido.
- Es un modelo especializado en síntesis cross-domain; puede mostrar un rendimiento inferior en tareas de propósito general frente a modelos base de tamaño similar.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en contextos técnicos donde se le pide reconciliar especificaciones contradictorias.
- La arquitectura híbrida (atención lineal + Mamba) requiere `trust_remote_code=True` en transformers, lo que puede suponer un riesgo de seguridad si no se audita el código.
- Aunque la licencia es Apache 2.0, el modelo fue destilado de modelos con licencias propias (Llama 3.1 y Nemotron); conviene verificar la compatibilidad legal de la destilación para uso comercial.
- No hay información sobre sesgos o comportamiento ético; se recomienda validación adicional antes de usarlo en aplicaciones sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-omni-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-omni-sft
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Supercomputador LUMI: https://www.lumi-supercomputer.eu/
