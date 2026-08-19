# SixpertAI/SixpertK2

## Resumen

Sixpert K2 es un modelo de lenguaje de 9.000 millones de parámetros con arquitectura de mezcla de expertos (MoE), desarrollado por SixpertAI (Inyang David) y publicado en julio de 2026 bajo licencia Apache-2.0. Está diseñado para tareas de razonamiento profundo, flujos de trabajo agénticos y comprensión multimodal, con una ventana de contexto ampliada a 1 millón de tokens mediante escalado YaRN sobre un contexto nativo de 262.144 tokens. El modelo se distribuye exclusivamente en formato GGUF, lo que permite su ejecución en runtimes como Ollama, LM Studio, jan o KoboldCpp.

El modelo se presenta como un competidor directo en la clase de 9B frente a sistemas mucho más grandes, con puntuaciones declaradas de 82,5 % en MMLU, 85,0 % en HumanEval y 90,5 % en GSM8K, según evaluaciones de terceros citadas por el autor (llm-stats.com y TokenCalculator.com, abril de 2026). Incorpora capacidades de visión, function calling, razonamiento encadenado (chain-of-thought) y soporte multilingüe de más de 100 idiomas. Su carácter "uncensored" y su especialización en ciberseguridad, biomedicina, finanzas y trading lo posicionan para usos técnicos avanzados, aunque exige una capa de revisión adicional en entornos de producción orientados al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SixpertMoEForCausalLM (transformer MoE) |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) con YaRN; nativo 262.144 |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el autor declara 100+ idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Sixpert K2 emplea una arquitectura transformer de mezcla de expertos (MoE) con una implementación personalizada denominada `SixpertMoEForCausalLM`. El modelo parte de un checkpoint base (`sixpert/sixpert-k2-base`) y ha sido afinado con un dataset propio (`sixpert/sixpert-k2-dataset`) que incluye más de 500 millones de tokens de razonamiento. No se han publicado detalles sobre el preentrenamiento inicial (número total de tokens, composición del corpus o técnicas de alineación como RLHF o DPO). El autor indica que el modelo es "self-correcting" y que produce respuestas con citas de fuentes en pruebas de herramientas, lo que sugiere un entrenamiento orientado a la fiabilidad factual, aunque no se especifica la metodología exacta.

La ventana de contexto se amplía mediante escalado YaRN, que multiplica por 4 la longitud nativa de 262.144 tokens hasta alcanzar 1.048.576. Esta extensión está integrada en los pesos GGUF, de modo que el runtime la aplica automáticamente. El modelo genera cada respuesta abriendo un bloque `<thought>` antes de la respuesta final, siguiendo el patrón típico de los modelos de razonamiento.

## Capacidades

- Razonamiento avanzado mediante chain-of-thought, con generación de un bloque `<thought>` antes de cada respuesta.
- Function calling nativo con salida estructurada para integración en herramientas.
- Ejecución de flujos agénticos autónomos de múltiples pasos.
- Comprensión multimodal de imágenes: descripción detallada, OCR (impreso y manuscrito), lectura de gráficos y tablas, comprensión de interfaces y documentos, razonamiento espacial básico y análisis de diagramas complejos.
- Codificación: generación, análisis y depuración de código, con puntuación declarada de 85,0 % en HumanEval.
- Soporte multilingüe declarado de más de 100 idiomas.
- Dominio especializado en ciberseguridad, red-teaming, biología, farmacología, medicina clínica, trading y finanzas.
- Capacidad de autocorrección y citación de fuentes en pruebas de uso de herramientas (7/7 en harness de tool-use).
- Modo "uncensored": responde sin restricciones de contenido, lo que requiere una capa de seguridad adicional en despliegues públicos.

## Casos de uso

- Asistente de soporte técnico en ciberseguridad: el modelo puede analizar incidentes, sugerir mitigaciones y correlacionar CVEs con su contexto de 1M de tokens, aunque se recomienda emparejarlo con un sistema de recuperación para verificar identificadores específicos.
- Generación de código en pipelines de CI/CD: gracias a su function calling y su capacidad de razonamiento, puede generar, revisar y corregir código en repositorios, integrándose como agente autónomo en tareas de integración continua.
- Análisis de documentos biomédicos: su contexto largo permite procesar artículos científicos extensos, extraer información farmacológica y resumir ensayos clínicos, con especial atención a la verificación de datos mediante herramientas externas.
- Agente de trading algorítmico: puede interpretar noticias financieras, leer gráficos de precios mediante su capacidad de visión y ejecutar operaciones simuladas a través de function calling, aunque requiere validación humana en entornos reales.
- Atención al cliente automatizada: con 1M de tokens de contexto, puede mantener conversaciones multi-turno con historial completo del usuario, consultar bases de conocimiento y escalar incidencias complejas mediante herramientas.
- Asistente de investigación académica: su capacidad de razonamiento y su ventana de contexto amplia permiten sintetizar múltiples fuentes, generar hipótesis y redactar secciones de artículos, siempre con verificación externa de citas.
- Procesamiento de documentos legales y contractuales: la visión y el contexto largo facilitan la extracción de cláusulas, la comparación de versiones y la detección de inconsistencias en documentos extensos.

## Benchmarks y rendimiento

Los siguientes resultados se citan de la model card del autor, que los atribuye a evaluaciones de terceros (llm-stats.com y TokenCalculator.com, abril de 2026). No se han podido verificar de forma independiente.

| Benchmark | Sixpert K2 |
|---|---|
| MMLU | 82,5 % |
| MMLU-Redux | 91,1 % |
| HumanEval | 85,0 % |
| MATH | 62,0 % |
| GPQA | 81,7 % |
| GSM8K | 90,5 % |
| IFEval | 91,5 % |
| C-Eval | 88,2 % |

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa 5,3 GB (5,63 GB con metadatos), por lo que requiere al menos 8 GB de VRAM para inferencia con contexto corto.
- Para contextos largos (256k–512k tokens), el autor indica que una GPU H100/H200 es suficiente.
- La ventana completa de 1M tokens requiere configuración multi-GPU con tensor parallelism o un offload agresivo de la caché KV.
- Es compatible con GPUs de consumo como RTX 3090, RTX 4090 o superiores para contextos moderados (hasta 32k–64k tokens), aunque no se ha verificado oficialmente.
- Runtimes soportados: Ollama, LM Studio, jan, KoboldCpp y cualquier runtime compatible con GGUF (llama.cpp).
- No se han publicado datos de latencia o throughput específicos.

## Comparativa con modelos similares

La siguiente tabla compara Sixpert K2 con otros modelos citados en la model card del autor, usando los valores de MMLU y HumanEval reportados por él mismo (abril de 2026). No se dispone de datos verificados de forma independiente.

| Modelo | Parámetros | MMLU | HumanEval | Licencia |
|---|---|---|---|---|
| Sixpert K2 | 9B (MoE) | 82,5 % | 85,0 % | Apache-2.0 |
| Llama 4 Maverick | ~400B (MoE) | 84,7 % | 82,1 % | Llama License |
| DeepSeek V4 | no disponible | 87,2 % | 88,7 % | no disponible |
| Gemini 3.1 Ultra | no disponible | 90,4 % | 89,3 % | propietaria |
| Claude Opus 4.6 | no disponible | 92,1 % | 92,4 % | propietaria |
| GPT-5.4 | no disponible | 91,8 % | 94,1 % | propietaria |

Sixpert K2 se sitúa por debajo de los modelos de mayor tamaño en rendimiento bruto, pero su ventaja reside en su eficiencia (9B MoE) y en su licencia abierta, lo que permite despliegues locales y personalización. No se dispone de comparativas directas con otros modelos abiertos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de razonamiento: cada respuesta abre con un bloque `<thought>`, lo que requiere un presupuesto generoso de `max_new_tokens` (recomendado 16384) y el parseo o eliminación de dicho bloque para el usuario final.
- Sensible a la temperatura: el muestreo greedy o con temperatura muy baja (T ≤ 0,3) puede provocar bucles de repetición en razonamientos largos. Se recomienda temperature 0,6, top_p 0,95, top_k 20 y repeat_penalty 1,05.
- Riesgo de alucinación en datos específicos: puede sobre-confiar en identificadores concretos (CVEs, modos de hashcat, posiciones de fármacos) que no conoce con certeza. Se recomienda emparejar con recuperación o function calling en despliegues críticos.
- Carácter "uncensored": el modelo no aplica filtros de contenido por defecto. En aplicaciones orientadas al usuario final, es imprescindible añadir una capa de revisión o moderación a nivel de aplicación.
- Limitaciones de contexto real: aunque el modelo soporta 1M tokens, el uso práctico de la ventana completa requiere hardware de alta gama (multi-GPU) y puede degradar el rendimiento si no se gestiona adecuadamente la caché KV.
- Idiomas: no se han publicado detalles sobre el rendimiento por idioma, a pesar de la afirmación de soporte de 100+ idiomas.
- Documentación limitada: no se detallan los datos de preentrenamiento, el número de parámetros activos en el MoE, ni la metodología de evaluación de los benchmarks. Los resultados deben tratarse con cautela hasta que se publiquen evaluaciones independientes.

## Enlaces

- [Modelo en Hugging Face: SixpertAI/SixpertK2](https://huggingface.co/SixpertAI/SixpertK2)
- [Perfil del autor: SixpertAI](https://huggingface.co/SixpertAI)
- [Dataset de fine-tuning: sixpert/sixpert-k2-dataset](https://huggingface.co/datasets/sixpert/sixpert-k2-dataset)
