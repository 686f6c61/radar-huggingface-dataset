# PhaiModelLab/Phai-A1-35B-1M-GGUF

## Resumen

Phai-A1-35B-1M es un modelo de lenguaje derivado de Qwen3.6-35B-A3B, un transformer de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales. Lo desarrolla PhaiModelLab mediante un pipeline de post-entrenamiento completo (SFT y RL) orientado específicamente a tareas de programación y flujos agénticos. Toda la fase de post-entrenamiento se ejecutó sobre NPUs Huawei Ascend, un detalle poco habitual que resulta relevante para quienes evalúan alternativas de hardware no-NVIDIA.

El modelo parte del checkpoint Qwen3.6-35B-A3B y lo especializa con datos de instrucción de alta calidad centrados en código, tool calling, razonamiento en cadena larga y planificación multi-paso. La fase de RL emplea Group Relative Policy Optimization (GRPO) sobre 4.000 entornos sandbox que proporcionan retroalimentación basada en ejecución real: ejecución de código, tests unitarios e interacción con herramientas. Esta combinación de RL con feedback verificable es lo que distingue al modelo de un simple fine-tune supervisado.

El rasgo más destacado es la ventana de contexto de hasta 1 millón de tokens, habilitada mediante YaRN con factor de escala 4 durante todo el post-entrenamiento, con datos que abarcan longitudes de 16K a 1M tokens. El repositorio distribuido es una cuantización GGUF (37,9 GB) pensada para inferencia local con llama.cpp y compatible con endpoints. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basada en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.000.000 tokens (YaRN factor=4, activado por defecto en config.json) |
| Tipos de cuantizacion | GGUF (repo publicado en formato GGUF con imatrix); niveles concretos no disponibles |
| Idiomas soportados | no disponible (la model card incluye ejemplos en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) heredado de Qwen3.6-35B-A3B, con 34.660 millones de parámetros totales. El post-entrenamiento se divide en dos etapas. La primera es un SFT sobre datos de instrucción de alta calidad centrados en programación y agentes, que cubren conversaciones multi-turno, tool calling y cadenas de razonamiento largas, con secuencias de 16K a 1M tokens. La segunda es una fase de RL basada principalmente en GRPO, ejecutada contra 4.000 entornos sandbox que aportan feedback verificable mediante ejecución de código, tests unitarios e interacción con herramientas.

La innovación técnica central es la extensión de contexto: YaRN con factor de escala 4 se mantiene activo durante todo el post-entrenamiento para estabilizar la ventana de 1M tokens, y la configuración RoPE ya viene habilitada por defecto en `config.json`. La model card indica que el modelo conserva en gran medida el comportamiento del base en tareas de contexto corto, sin necesidad de manejo especial. El pipeline completo se ejecutó sobre NPUs Huawei Ascend, lo que constituye un caso poco frecuente de post-entrenamiento a esta escala fuera del ecosistema NVIDIA.

## Capacidades

- Generación y comprensión de código: escritura, depuración y refactorización en flujos de trabajo reales.
- Tool calling / function calling, entrenado explícitamente en la fase de SFT y reforzado con RL sobre interacciones con herramientas.
- Razonamiento multi-paso y planificación de horizonte largo (long-horizon planning) en escenarios agénticos.
- Comprensión de código a escala de repositorio gracias a la ventana de 1M tokens.
- Razonamiento en cadena larga y conversaciones multi-turno.
- Capacidades conversacionales generales (etiqueta `conversational`), aunque el foco es código y agentes.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no disponibles como dato explícito; los ejemplos de la model card están en inglés y chino.

## Casos de uso

- Agente de resolución de incidencias sobre repositorios: el modelo puede recibir un repositorio completo o una porción extensa dentro de la ventana de 1M tokens, localizar el fallo, proponer un parche y validarlo contra los tests, gracias a su entrenamiento con feedback de ejecución en sandbox.
- Automatización de pull requests en CI/CD: integrado como paso de revisión o generación de parches, con tool calling para consultar el estado de los tests y del linter antes de emitir el cambio.
- Asistente de programación en IDE con contexto de proyecto: al soportar contextos de hasta 1M tokens, puede mantener en memoria varios ficheros y el historial de conversación sin truncar, lo que reduce las alucinaciones por falta de contexto.
- Orquestación de agentes multi-herramienta: planificación de tareas de varios pasos que combinan búsqueda, ejecución de comandos y llamadas a APIs, apoyándose en el entrenamiento RL sobre interacción con herramientas.
- Migración y refactorización de código a gran escala: análisis de módulos completos y generación de cambios coherentes entre ficheros, aprovechando la ventana extendida.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo o en servidores sin GPU NVIDIA, útil para equipos que trabajan con Ascend o CPU.
- Generación de tests unitarios a partir de código existente, con verificación posterior en el propio pipeline de integración.

## Benchmarks y rendimiento

La model card menciona evaluaciones sobre SWE-Bench (Verified / Pro / Multilingual), TAU3-Bench, IFBench y AA-LCR, y afirma mejoras consistentes frente al modelo base de tamaño comparable, con resultados que se acercan o superan a modelos significativamente mayores en varios benchmarks. Sin embargo, los resultados numéricos se presentan únicamente en una imagen (`_assets_/_benchmarks.png`) y no se han transcrito en el texto disponible.

No se han publicado resultados de benchmarks en la informacion disponible en formato tabular.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 37,9 GB, por lo que la cuantización publicada requiere al menos ese espacio en memoria o en disco mapeado. Los niveles de cuantización concretos no están disponibles en la información proporcionada.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, un modelo MoE de ~35B en GGUF de 37,9 GB encaja en GPU con 48 GB o más (A6000, L40S, A100 80GB, H100) para la cuantización publicada; en GPUs de 24 GB (RTX 4090) requeriría cuantizaciones más agresivas u offloading parcial a CPU.
- Cabe en GPU de consumo: probablemente solo con cuantizaciones de 4 bits o inferiores y offloading parcial; no confirmado en la información disponible.
- Opciones de despliegue: llama.cpp (ejemplo oficial en la model card), Ollama (formato GGUF), y para contexto largo se recomienda vLLM o SGLang con prefix caching y chunked prefill.
- Latencia y throughput: no disponibles.
- Nota sobre contexto largo: la ventana de 1M tokens impone un coste elevado de KV-cache; la model card recomienda frameworks con soporte de contexto largo y optimizaciones de caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M | 34,66B (MoE) | 1M | Apache 2.0 | GGUF | Post-entrenado para código y agentes con RL en sandbox |
| Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | no disponible | safetensors | Modelo base del que deriva; referencia directa de comparación |
| Alternativas de código/agentes de ~30-35B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks numéricos ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Especialización de dominio: el modelo está optimizado para código y agentes; su rendimiento en tareas generales puede diferir del modelo base.
- Fiabilidad de salida: la model card advierte de posibles errores, imprecisiones o contenido inapropiado; recomienda evaluación exhaustiva y verificación humana antes de producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos generativos; el contexto largo no elimina el riesgo.
- Idiomas: no se especifica la lista de idiomas soportados; los ejemplos están en inglés y chino, por lo que el soporte de castellano no está confirmado.
- Licencia: Apache 2.0, pero los usuarios deben cumplir también los términos del modelo base Qwen3.6-35B-A3B al usar o distribuir los pesos.
- Contexto largo: la ventana de 1M tokens implica un consumo de memoria de KV-cache muy elevado; en la práctica requiere hardware y frameworks específicos.
- Cuantización: el repo publicado es GGUF; no se indican los niveles disponibles ni la pérdida de calidad asociada a cada uno.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- README en chino: ./README_zh.md (referenciado en la model card)
- Imagen de benchmarks: _assets_/_benchmarks.png (referenciada en la model card)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
