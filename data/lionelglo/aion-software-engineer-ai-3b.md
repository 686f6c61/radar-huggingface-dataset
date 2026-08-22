# Lionelglo/aion-software-engineer-ai-3B

## Resumen

Aion Software Engineer AI (3B) es un agente de codificación autónomo desarrollado por Lionelglo, construido como un fine-tuning LoRA sobre el modelo base Qwen 2.5 Coder 3B. El proyecto integra un entorno agéntico independiente del framework, diseñado para ejecución local y tareas de codificación de alta fiabilidad. El modelo se presenta como un sistema completo que combina un scratchpad estructurado en Markdown, herramientas deterministas de ejecución de código Python y Shell, y un protocolo agéntico basado en etiquetas para reforzar el razonamiento estructurado.

La relevancia de este modelo radica en su enfoque práctico para crear agentes de codificación ligeros y autocontenidos, capaces de mantener estado entre turnos mediante un archivo de memoria persistente (`agent_scratchpad.md`). Al estar basado en un modelo de 3B parámetros, es adecuado para entornos con recursos limitados, aunque la información pública disponible es escasa: no se especifican datos de entrenamiento, benchmarks ni métricas de rendimiento. El repositorio incluye los adaptadores LoRA, el scratchpad y los registros de entrenamiento, lo que sugiere un proyecto de investigación o prototipo más que un producto pulido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen 2.5 Coder 3B) con adaptadores LoRA |
| Parametros totales | 3B (base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se desconoce si se modificó respecto al base de Qwen 2.5 Coder) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible (el modelo base Qwen 2.5 Coder soporta múltiples idiomas, pero no se documenta para este fine-tuning) |
| Licencia | Apache 2.0 (según la model card) |
| Formato de pesos | safetensors (adaptadores LoRA y pesos del modelo) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen 2.5 Coder 3B, un transformer decoder-only especializado en código. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), cuyos adaptadores se encuentran en el directorio `Aion_coder_3B_agent_lora/`. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. Los registros de entrenamiento (`training_logs/`) sugieren que se aplicó Supervised Fine-Tuning (SFT) con LoRA, pero no hay información cuantitativa.

La innovación principal no está en la arquitectura base, sino en el entorno agéntico que lo rodea: un scratchpad externo en Markdown que el agente actualiza para mantener estado entre turnos, herramientas deterministas (`run_code` y `subprocess`) para ejecución en sandbox, y un protocolo de interacción con etiquetas `<thought>`, `<scratchpad>` y `<tool_code>` que refuerzan el razonamiento estructurado. Este diseño permite que el modelo actúe como un agente autónomo de codificación, aunque las capacidades específicas dependen de la implementación del `AgentEnvironment` mencionado en la model card.

## Capacidades

- Generación de código y asistencia en tareas de programación, heredadas de Qwen 2.5 Coder 3B.
- Razonamiento estructurado mediante el protocolo de etiquetas `<thought>`, `<scratchpad>` y `<tool_code>`.
- Ejecución de código Python y Shell a través de herramientas deterministas integradas (`run_code` y `subprocess`), permitiendo pruebas en sandbox.
- Mantenimiento de estado entre turnos mediante el scratchpad persistente `agent_scratchpad.md`.
- Diseñado para funcionar como agente autónomo en entornos locales, sin dependencia de frameworks externos.
- No se documentan capacidades de tool calling estándar (como OpenAI function calling) ni soporte multimodal.

## Casos de uso

- Desarrollo de scripts automatizados en local: el agente puede recibir una descripción de tarea, generar código, ejecutarlo en sandbox y corregir errores iterativamente gracias al scratchpad y las herramientas de ejecución.
- Prototipado rápido de funciones Python: se puede pedir al modelo que implemente una función específica, la pruebe con casos de entrada y salida, y refine el resultado usando la ejecución determinista.
- Asistente de refactorización de código: el modelo puede analizar un fragmento, proponer mejoras y verificar que el código refactorizado sigue funcionando ejecutándolo en el sandbox.
- Generación de scripts de shell para automatización de tareas del sistema: gracias a la herramienta `subprocess`, puede crear y probar comandos de shell de forma segura.
- Entorno de aprendizaje de programación: al ser un modelo pequeño y autocontenido, puede integrarse en herramientas educativas que necesiten un agente de codificación sin depender de APIs externas.
- Investigación en agentes de codificación: el diseño con scratchpad y protocolo agéntico sirve como base para experimentos sobre memoria externa y razonamiento multi-turno en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- Al ser un modelo de 3B parámetros, la VRAM estimada para inferencia en precisión FP16 es de aproximadamente 6-8 GB. Con cuantización a 4 bits (por ejemplo, usando bitsandbytes o GPTQ), podría reducirse a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en FP16. Para cuantización, incluso GPUs con 4 GB podrían ser suficientes.
- El modelo cabe en GPUs de consumo medio y alto, así como en Apple Silicon con suficiente memoria unificada (16 GB o más).
- Opciones de despliegue: al ser safetensors con adaptadores LoRA, se puede cargar con Transformers + PEFT. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- No se dispone de datos de latencia o throughput. Al ser un modelo de 3B, la inferencia en una GPU moderna debería ser rápida (del orden de decenas de tokens por segundo), pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aion Software Engineer AI (3B) | 3B | no disponible | Agente de codificación con scratchpad y herramientas | Apache 2.0 | HuggingFace |
| Qwen 2.5 Coder 3B (base) | 3B | 32K (típico) | Modelo de código general | Apache 2.0 | HuggingFace |
| CodeLlama 3B | 3B | 16K | Modelo de código general | Llama 2 license | HuggingFace |
| StarCoder2-3B | 3B | 16K | Modelo de código general | BigCode OpenRAIL-M | HuggingFace |

Nota: los datos de contexto de Qwen 2.5 Coder 3B y CodeLlama 3B son valores típicos conocidos, pero no se han confirmado para el fine-tuning de Aion. La comparación se basa en características generales, no en rendimiento, ya que no hay benchmarks disponibles para Aion.

## Limitaciones y advertencias

- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo pequeño (3B), es probable que tenga una mayor tasa de errores en tareas complejas que modelos más grandes.
- La información pública es muy limitada: no hay benchmarks, detalles del dataset de entrenamiento, ni evaluación de robustez. No se recomienda su uso en producción sin una validación exhaustiva.
- El modelo depende del entorno agéntico descrito en la model card; sin el `AgentEnvironment` y el scratchpad, pierde gran parte de su funcionalidad como agente.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los pesos del modelo base (Qwen 2.5 Coder 3B) también estén bajo esa licencia, lo cual es cierto en este caso.
- No se especifican limitaciones de contexto ni de idioma. Si el contexto del modelo base es de 32K, podría ser suficiente para muchas tareas, pero no está confirmado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lionelglo/aion-software-engineer-ai-3B
- Model card (README): incluida en el repositorio de HuggingFace.
- No se encontraron papers, blogs o demos adicionales en la búsqueda web. Los resultados relacionados con "Aion Labs" o "Aion 1.0 de Microsoft" no corresponden a este modelo.
