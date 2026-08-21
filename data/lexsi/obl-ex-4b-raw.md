# Lexsi/obl-ex-4b-raw

## Resumen

Lexsi/obl-ex-4b-raw es un adaptador LoRA publicado por Lexsi Labs, una organización dedicada a la investigación en alineación y seguridad de IA. El modelo se presenta como un fine-tuning del modelo base Qwen/Qwen3.5-4B, entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face. El repositorio contiene únicamente los pesos del adaptador (0.1 GB) y no incluye el modelo base completo, por lo que su uso requiere cargarlo sobre Qwen/Qwen3.5-4B.

La relevancia de este modelo es limitada en el ecosistema actual: no se proporciona documentación sobre el dataset de entrenamiento, los objetivos del fine-tuning ni las capacidades específicas resultantes. El nombre "raw" sugiere que podría ser un checkpoint intermedio o sin post-procesamiento, pero no hay confirmación. Dado que el autor no ha publicado métricas ni ejemplos de uso, su utilidad práctica queda restringida a experimentos de investigación o como punto de partida para otros fine-tunings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión completa, sin cuantización) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen/Qwen3.5-4B. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, lo que permite fine-tuning eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando el framework TRL (Transformers Reinforcement Learning) de Hugging Face, con PEFT 0.20.0 y Transformers 5.14.1.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio solo incluye el adaptador y un script de ejemplo de inferencia con la pipeline de transformers. La ausencia de detalles sobre el proceso de entrenamiento impide evaluar la calidad o el propósito específico del fine-tuning.

## Capacidades

- Generación de texto conversacional: el ejemplo de uso muestra un pipeline de text-generation con formato de chat, lo que indica que el adaptador está diseñado para respuestas a instrucciones o diálogo.
- Capacidades heredadas del modelo base: al ser un adaptador LoRA, las capacidades generales (razonamiento, código, matemáticas, multilingüismo) dependen enteramente de Qwen/Qwen3.5-4B, pero no se documentan en esta ficha.
- Sin información sobre tool calling, agentes, visión, audio o modos de pensamiento: no hay evidencia en la documentación proporcionada.

## Casos de uso

- Experimentación con fine-tuning LoRA: investigadores pueden utilizar este adaptador como ejemplo de cómo aplicar SFT con TRL sobre Qwen3.5-4B, aunque carece de documentación sobre el dataset.
- Punto de partida para fine-tuning adicional: al ser un adaptador "raw", podría servir como base para continuar el entrenamiento con otros datasets, pero no hay instrucciones ni garantías.
- Evaluación de la calidad de un adaptador sin documentación: útil para estudiar el impacto de un fine-tuning no verificado en el comportamiento del modelo base.
- Pruebas de compatibilidad de PEFT: permite validar la integración de adaptadores LoRA con la versión de Transformers y PEFT indicada.
- Investigación en alineación: dado que Lexsi Labs se centra en alineación y seguridad, el adaptador podría estar orientado a mejorar la adherencia a instrucciones, pero no hay evidencia concreta.
- Uso educativo: como ejemplo de un adaptador LoRA publicado en Hugging Face, puede servir para aprender a cargar y usar este tipo de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base Qwen/Qwen3.5-4B. Si el base tiene 4 mil millones de parámetros, se necesitaría aproximadamente 8 GB de VRAM en FP16 para inferencia, pero este dato no está confirmado.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- El adaptador en sí es ligero (0.1 GB) y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- No hay información sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se conocen otros adaptadores LoRA de Lexsi Labs con características comparables, y la falta de documentación impide establecer una comparación significativa con otros fine-tunings de Qwen3.5-4B.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay descripción del dataset, objetivos de entrenamiento, ni instrucciones de uso más allá del ejemplo mínimo.
- Licencia no especificada: el README indica "licence: license" sin detallar términos, lo que impide conocer restricciones de uso comercial o redistribución.
- Riesgo de alucinación y sesgos: al ser un adaptador sin evaluación publicada, no se puede garantizar su fiabilidad en producción.
- Dependencia del modelo base: cualquier limitación de Qwen/Qwen3.5-4B (idiomas, contexto, sesgos) se hereda, pero no se documenta.
- Fecha de creación inusual (2026-08-21) y cero descargas/likes: sugiere que es un modelo muy reciente o poco utilizado, con madurez no probada.
- El ejemplo de código en el README usa `model="None"`, lo que indica que el autor no proporcionó un identificador válido para la pipeline, dificultando su uso directo.

## Enlaces

- [HuggingFace - Lexsi/obl-ex-4b-raw](https://huggingface.co/Lexsi/obl-ex-4b-raw)
- [Lexsi Labs - sitio web](https://lexsi.ai/)
- [Lexsi Labs - GitHub](https://github.com/Lexsi-Labs)
