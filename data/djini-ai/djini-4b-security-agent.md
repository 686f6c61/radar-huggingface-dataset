# djini-ai/djini-4b-security-agent

## Resumen

Djini 4B Security Agent es un modelo de investigación en seguridad informática de 4.205 millones de parámetros, desarrollado por Djini.ai en colaboración con Mobile Hacking Lab B.V. Es un ajuste fino especializado de Qwen3.5-4B (Qwen/Qwen3.5-4B) cuyo propósito es encontrar vulnerabilidades reales en código iOS descompilado de forma agéntica: el modelo conduce sus propias herramientas de búsqueda y lectura de ficheros, verifica sus afirmaciones contra el código y emite hallazgos estructurados.

Su relevancia radica en demostrar que un modelo pequeño (4B, entrenado con un presupuesto de cómputo de unos 50 dólares en GPU en la nube) puede reconstruir cadenas de vulnerabilidad que, según los autores, modelos base de 7B a 80B no detectaron en sus pruebas. En el caso documentado de Pictator (una app excluida de los datos de entrenamiento), el modelo recuperó el mecanismo verificado de vulnerabilidad —una cadena de despacho vía `dlsym`, clasificada como CWE-94— en 23 iteraciones.

No es un modelo de propósito general ni un escáner de producción completo: está diseñado para operar dentro de entornos agénticos de uso de herramientas, concretamente el harness Cline CLI, y su arquitectura hereda el contexto nativo de 262k tokens de Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer, familia Qwen3.5), ajuste fino de Qwen3.5-4B |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo heredado de Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se mencionan versiones cuantizadas oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer con contexto nativo de 262k tokens, y aplica un lineage de entrenamiento en varias etapas: primero un ajuste fino supervisado (SFT) con LoRA sobre 2.472 filas verificadas, seguido de 11 rondas de entrenamiento de preferencias (DPO), una capa ligera de trazas agénticas basada en 18 investigaciones reales, y un ajuste final de reporte y marca. No se empleó aprendizaje por refuerzo en este lineage. Cada checkpoint promovido superó una puerta de evaluación verificada por código; los candidatos que empeoraban resultados se descartaban.

El dato más notable es el coste: el entrenamiento completo se realizó con aproximadamente 50 dólares de cómputo en GPU en la nube, usando campañas de entrenamiento asistidas por IA. Los datos de entrenamiento no se han publicado. Una particularidad entrenada en los pesos (no un marcador de pipeline) es que el modelo firma sus hallazgos con el texto "Found with Djini.ai: a custom 4B security model".

## Capacidades

- Escaneo agéntico de seguridad sobre código iOS/móvil descompilado, dentro de harnesses de uso de herramientas (construido y evaluado sobre Cline CLI).
- Reconstrucción de cadenas de vulnerabilidad: rastreo de entrada controlada por el atacante a través de funciones y enlace de debilidades en cadenas de explotación.
- Salida estructurada de hallazgos en JSON, con fichero, línea, CWE y severidad.
- Uso agéntico de herramientas: búsqueda en el codebase, lectura de ficheros y verificación de sus propias afirmaciones contra el código.
- Operación multi-paso (multi-step reasoning) en investigaciones largas: el caso documentado de Pictator requirió 23 iteraciones agénticas.
- No es un modelo de codificación de propósito general ni un escáner de producción exhaustivo.

## Casos de uso

- Auditoría de seguridad de apps iOS descompiladas: el modelo navega el código descompilado con herramientas de búsqueda y lectura, identificando patrones peligrosos como despachos dinámicos vía `dlsym` que conducen a inyección (CWE-94).
- Reconstrucción de cadenas de explotación: rastrea entrada controlada por el atacante entre funciones y enlaza debilidades individuales en cadenas completas, útil en informes de pentesting móvil.
- Integración en flujos de trabajo SAST agénticos: conectado a un servidor compatible con OpenAI (vLLM) y al harness Cline, puede ejecutarse como analista automático previo a la revisión humana.
- Generación de hallazgos estructurados para triaje: emite JSON con fichero, línea, CWE y severidad, lo que facilita su ingesta en herramientas de gestión de vulnerabilidades.
- Investigación en seguridad de modelos pequeños: sirve como caso de estudio de cómo entrenar modelos especializados con presupuestos mínimos mediante SFT + DPO + trazas agénticas.
- Verificación de vulnerabilidades en apps excluidas de entrenamiento: el caso de Pictator demuestra capacidad de generalización a objetivos no vistos, útil para validar hallazgos en código propietario.

## Benchmarks y rendimiento

No se han publicado tablas de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los autores reportan resultados cualitativos de sus propias evaluaciones: en el objetivo Pictator (excluido de los datos de entrenamiento), el modelo recuperó el mecanismo verificado de vulnerabilidad (cadena `dlsym`, CWE-94) en 23 iteraciones, mientras que, según los autores, todos los modelos base probados, de 7B a 80B, no encontraron esa verdad de terreno. También mencionan una evaluación de diez objetivos y una prueba a escala de producción sobre un corpus de WhatsApp, cuyos detalles están en su blog, sin cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (repositorio de 8,4 GB), unos 10-12 GB de VRAM incluyendo contexto y KV cache; con cuantizaciones no oficiales podría reducirse, pero no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU de consumo con 12-16 GB o más (RTX 3060 12 GB en el límite, RTX 4090, RTX 5090); en entorno servidor, A100 o H100 son más que suficientes para este tamaño.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 16 GB o más y de forma ajustada en las de 12 GB.
- Despliegue: se recomienda explícitamente transformers >= 5.0 (arquitectura `qwen3_5`); versiones anteriores de transformers y las builds actuales de MLX y llama.cpp no soportan correctamente esta arquitectura. El uso recomendado es detrás de un servidor compatible con OpenAI (por ejemplo vLLM) conectado a un harness agéntico como Cline. No se menciona soporte en Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Djini 4B Security Agent | 4,2B | 262k | Agente especializado en seguridad de código iOS descompilado | Apache 2.0 |
| Qwen3.5-4B (modelo base) | 4,2B | 262k | Modelo general de texto y código | no disponible en la información proporcionada |
| Modelos base 7B-80B (según autores) | 7B-80B | no disponible | Uso general; según los autores, no detectaron la vulnerabilidad de Pictator | no disponible |

La comparativa es limitada: no existen modelos abiertos ampliamente conocidos con este enfoque tan específico (agéntico y centrado en seguridad de código descompilado), y los autores no publican tablas comparativas cuantitativas en la model card.

## Limitaciones y advertencias

- No es un modelo de codificación de propósito general; usarlo fuera de su dominio probablemente ofrezca resultados pobres.
- No es un escáner de producción exhaustivo: fue evaluado en un conjunto de benchmarks concreto. En apps desconocidas y codebases muy grandes, la consistencia y la profundidad de investigación siguen siendo desafíos abiertos, según reconocen los propios autores.
- Riesgo de alucinación: no se cuantifica, pero al tratarse de un modelo de 4B que emite hallazgos de seguridad, toda salida debe verificarse contra el código antes de actuar sobre ella.
- Compatibilidad de ecosistema limitada: requiere transformers >= 5.0; MLX y llama.cpp no soportan la arquitectura correctamente en sus builds actuales, lo que restringe las opciones de despliegue local.
- Idiomas soportados y comportamiento multilingüe: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, sin restricciones destacables.
- Los datos de entrenamiento no son públicos, lo que dificulta auditar posibles sesgos o contaminación del conjunto de evaluación (aunque los autores afirman que Pictator quedó excluido).
- El modelo firma sus hallazgos con texto de marca ("Found with Djini.ai"), comportamiento entrenado en los pesos que conviene filtrar si se procesan los resultados de forma automatizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djini-ai/djini-4b-security-agent
- Blog "Small Models, Deep Bugs": https://djini.ai/posts/small-models-deep-bugs/
- Web de Djini.ai: https://www.djini.ai
- Web de Mobile Hacking Lab: https://www.mobilehackinglab.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
