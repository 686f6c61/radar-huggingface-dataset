# AJpro774/tiny-math-360m-sft

## Resumen

El modelo `AJpro774/tiny-math-360m-sft` es un ajuste fino (fine-tuning) del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario AJpro774. Está diseñado específicamente para tareas de razonamiento matemático, como su nombre indica. Se entrenó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, y el repositorio de GitHub asociado menciona el uso de LoRA (Low-Rank Adaptation) sobre el conjunto de datos `Big-Math-RL-Verified`. El modelo tiene 360 millones de parámetros, lo que lo convierte en una opción ligera para ejecución en dispositivos con recursos limitados.

La relevancia de este modelo radica en su tamaño compacto, que permite su despliegue en entornos de producción con requisitos de hardware modestos, a la vez que ofrece capacidades específicas para problemas matemáticos. Sin embargo, la información pública disponible es muy escasa: no se especifican detalles sobre la arquitectura interna más allá de la herencia de SmolLM2, ni se publican resultados de benchmarks. Por tanto, su adopción debe basarse en pruebas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en SmolLM2-360M-Instruct, detalles no disponibles) |
| Parametros totales | 360 millones (por nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (SmolLM2 soporta hasta 8192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, dado el dataset base) |
| Licencia | no disponible (el repositorio GitHub menciona que los modelos base y datasets conservan sus licencias originales, pero no se indica la licencia específica de este modelo) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de SmolLM2, una familia de modelos Transformer pequeños optimizados para eficiencia en dispositivos con recursos limitados. El ajuste fino se realizó mediante SFT con la librería TRL (Transformers Reinforcement Learning), y el repositorio GitHub del autor sugiere el uso de LoRA (Low-Rank Adaptation) para el entrenamiento. El conjunto de datos empleado fue `Big-Math-RL-Verified`, que contiene problemas matemáticos verificados. No se proporcionan detalles sobre la cantidad de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se especifican innovaciones técnicas particulares más allá del propio ajuste fino.

## Capacidades

- Generación de texto con enfoque en razonamiento matemático.
- Resolución de problemas aritméticos y algebraicos básicos.
- Capacidad de seguir instrucciones de usuario en formato de chat (dado que el modelo base es instruct).
- Posible soporte de razonamiento multi-paso en matemáticas, aunque sin datos concretos.
- No se menciona soporte para tool calling, agentes, visión o audio.
- Capacidades multilingües no confirmadas; probablemente limitadas al inglés.

## Casos de uso

- Tutoría de matemáticas en línea: el modelo puede generar explicaciones paso a paso para problemas de álgebra o aritmética, adecuado para plataformas educativas por su tamaño reducido.
- Generación de ejercicios matemáticos: puede crear problemas de práctica con soluciones, útil para generar contenido dinámico en aplicaciones de aprendizaje.
- Asistente de resolución de problemas en aplicaciones móviles: gracias a su ligereza, puede ejecutarse en dispositivos con poca memoria para responder preguntas matemáticas en tiempo real.
- Integración en pipelines de procesamiento de formularios: para extraer y resolver operaciones matemáticas de texto, por ejemplo en facturación o análisis de datos.
- Pruebas de concepto en investigación: como base para experimentos de ajuste fino o comparación de técnicas de SFT en modelos pequeños.
- Despliegue en entornos con restricciones de hardware: por ejemplo, en dispositivos edge o servidores con CPU sola, donde un modelo de 360M es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada. Dado el tamaño de 360M parámetros, en FP16 requeriría aproximadamente 720 MB de memoria, y en cuantización 8 bits ~360 MB, pero estos son cálculos teóricos, no confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) para FP16. También puede ejecutarse en CPU con RAM suficiente (4-8 GB).
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna con 4 GB de VRAM puede ejecutarlo sin problemas.
- Opciones de despliegue: es compatible con la librería `transformers` de Hugging Face, por lo que puede usarse con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o directamente con `pipeline` de transformers.
- Latencia y throughput: no se dispone de datos específicos. En CPU, la generación de 128 tokens podría tomar varios segundos; en GPU, menos de un segundo.

## Comparativa con modelos similares

No hay información suficiente sobre modelos comparables en el mismo rango de parámetros (360M) con enfoque matemático. Modelos como `Qwen2.5-Math-1.5B` o `Llama-3.2-1B` son más grandes y tienen más recursos, pero no se puede establecer una comparación cuantitativa sin datos de benchmarks. Se recomienda evaluar directamente con tareas matemáticas propias.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de solo 360M, su capacidad de razonamiento matemático complejo es limitada.
- Riesgo de alucinación en problemas de mayor complejidad o con notación poco común.
- No se especifica la licencia, lo que puede impedir el uso comercial sin consultar al autor.
- La longitud de contexto no está confirmada; si se hereda de SmolLM2, sería de 8192 tokens, pero no se garantiza.
- No se han publicado evaluaciones de seguridad ni de sesgos.
- El modelo está diseñado para matemáticas; su rendimiento en otras tareas puede ser pobre.

## Enlaces

- Hugging Face: https://huggingface.co/AJpro774/tiny-math-360m-sft
- Repositorio GitHub del autor (menciona el modelo y el dataset): https://github.com/AJpro774/tiny-math-20m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
