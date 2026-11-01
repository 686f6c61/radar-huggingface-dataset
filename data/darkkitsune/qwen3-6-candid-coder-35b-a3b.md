# DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B

## Resumen

Qwen3.6-Candid-Coder-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) obtenido mediante un merge DELLA de cuatro modelos: Qwen/Qwen3.6-35B-A3B como base, InternScience/Sage-A1.5 (ratio 0,37), Kwaipilot/KAT-Coder-V2.5-Dev (ratio 0,53) y ornith-ai/Ornith-1.5-35B-A3B (ratio 0,10). Lo publica el usuario DarkKitsune en HuggingFace y está orientado a programación, corrección de errores, orquestación de agentes y planificación. El modelo se distribuye en una variante "abliterated" (también etiquetada como "uncensored"), lo que implica que se han atenuado los mecanismos de rechazo heredados del modelo base Qwen.

El modelo resuelve el problema de combinar en un único checkpoint las capacidades de tres fine-tunes especializados: el seguimiento de instrucciones y la orquestación de Sage-A1.5, la eficiencia en generación de código de KAT-Coder-V2.5-Dev y la planificación y el autoandamiaje de Ornith-1.5. Con 35.951.822.704 parámetros totales y arquitectura MoE (qwen3_5_moe), el modelo está pensado para tareas agénticas de codificación de contexto largo, con un flujo de trabajo que planifica antes de actuar y verifica y corrige su propia solución tras redactarla.

La relevancia actual del modelo radica en su empaquetado para despliegue local: el autor publica cuantizaciones GGUF con un esquema propio llamado APEX, calibrado con un imatrix mixto de texto inglés y tokens reales de sesiones agénticas, y optimizado para offload parcial a CPU en contextos largos. La información disponible no incluye la longitud de contexto, los idiomas soportados ni la licencia, por lo que estos datos deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia qwen3_5_moe; pipeline image-text-to-text según metadatos |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema APEX en dos variantes: I-Quality (expertos enrutados en capas intermedias de IQ4_XS a Q5_K) e I-Medium (expertos enrutados en capas intermedias de IQ3_XXS a IQ4_NL); safetensors en BF16 como referencia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un merge DELLA de tipo task-vector sobre Qwen/Qwen3.6-35B-A3B, con una arquitectura subyacente de mezcla de expertos de la familia qwen3_5_moe. Los ratios de fusión son 0,37 para Sage-A1.5, 0,53 para KAT-Coder-V2.5-Dev y 0,10 para Ornith-1.5-35B-A3B. Según la model card, la mayor parte de los pesos se fusionó con un método que descarta pesos (sparsificación), pero los tensores más sensibles, como las puertas del router y los expertos compartidos, se protegieron fijando densidad 1.0 y épsilon 0.0 para desactivar la esparsificación. No se detalla el número de tokens de entrenamiento ni la composición del dataset, ya que al tratarse de un merge no hay un entrenamiento adicional documentado.

La innovación técnica destacable está en el proceso de cuantización. El autor genera configuraciones de precisión mixta específicas para MoE mediante APEX, con un imatrix calibrado a partes iguales con fragmentos de texto inglés de múltiples dominios y con tokens generados en sesiones reales de codificación agéntica de contexto largo usando KAT-Coder, Ornith-1.5 y el propio modelo (incluidos tokens de control como `<|im_start|>`). En la actualización del 1 de noviembre de 2026 se recalibró el imatrix con un corpus que deduplica el mensaje de sistema para evitar sobreajuste, y se trasladó precisión de las capas internas de los expertos de enrutamiento gate/up a los tensores attn_*, mejorando la precisión en contextos largos. El resultado declarado son divergencias KL medias de 0,021921 (I-Quality) y 0,033166 (I-Medium) frente a la referencia BF16, con una coincidencia de top-token del 93,959 % y el 93,340 % respectivamente.

## Capacidades

- Generación de texto y razonamiento con planificación previa a la acción y verificación posterior de la solución redactada.
- Programación y corrección de errores con énfasis en eficiencia de tokens, heredado de KAT-Coder-V2.5-Dev.
- Orquestación de agentes y flujos multi-paso, con autoandamiaje (self-scaffolding) heredado de Ornith-1.5.
- Seguimiento de instrucciones reforzado por la contribución de Sage-A1.5 (la model card cita 81,6 en IFBench para Sage).
- Uso de herramientas (tool use / function calling), según las etiquetas del repositorio.
- Capacidad multimodal de entrada image-text-to-text según los metadatos del pipeline, aunque la model card no la desarrolla.
- Modo de conversación general además de las tareas de código y agentes.
- Comportamiento "abliterated": el modelo no rechaza tantos prompts como Qwen de forma directa, aunque puede desviar temas que Qwen rechazaría sin insistencia adicional.

## Casos de uso

- Corrección automática de errores en bases de código: el modelo puede recibir un fallo, planificar la diagnosis, aplicar un parche y verificar la corrección, aprovechando la combinación de KAT-Coder para parches eficientes y Sage para verificación.
- Agentes de codificación autónomos en sandbox: con capacidad de persistir en la tarea y planificar pasos, es adecuado para entornos aislados donde el agente itera sobre un repositorio hasta completar una tarea; la model card advierte explícitamente de la necesidad de sandboxing.
- Asistente de planificación de proyectos técnicos: la contribución de Sage-A1.5 aporta orquestación y planificación, útil para descomponer requisitos en tareas y diseñar arquitecturas antes de escribir código.
- Generación de código eficiente en tokens en pipelines de CI/CD: la contribución de KAT-Coder reduce el consumo de tokens en tareas repetitivas de generación y corrección, lo que abarata el coste por ejecución.
- Despliegue local con offload parcial a CPU: las cuantizaciones APEX I-Quality e I-Medium están optimizadas para offload parcial y contexto largo, lo que permite ejecutar el modelo en estaciones de trabajo con VRAM limitada usando llama.cpp.
- Conversación técnica sin restricciones de rechazo: para aplicaciones que requieren discutir temas que los modelos alineados estándar rechazan, el modelo ofrece respuestas menos evasivas, con la advertencia de que puede desviar algunos temas.
- Evaluación de calidad de cuantización en MoE: el repositorio publica métricas de divergencia KL y coincidencia de top-token, útil para investigadores que comparan esquemas de cuantización en arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de fidelidad de cuantización frente a BF16, medidas con llama-perplexity sobre un conjunto de validación del 52 % wikitext y 48 % código, excluido de la calibración:

| Metrica | I-Quality | I-Medium |
|---|---|---|
| KLD media | 0,021921 ± 0,000677 | 0,033166 ± 0,001014 |
| KLD mediana | 0,004392 | 0,007049 |
| KLD maxima | 1,176606 | 1,908140 |
| RMS de delta de probabilidad | 4,393 ± 0,143 % | 5,284 ± 0,189 % |
| Coincidencia de top-token | 93,959 ± 0,304 % | 93,340 ± 0,318 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio completo ocupa 255,9 GB, por lo que la inferencia en precisión completa requiere múltiples GPU de 80 GB o un servidor con memoria unificada.
- VRAM estimada con cuantización GGUF: no disponible en la información proporcionada; el tamaño exacto de los ficheros I-Quality e I-Medium no se detalla.
- GPU recomendadas: no disponibles en la información proporcionada; para BF16 se necesitan configuraciones multi-GPU tipo A100/H100 de 80 GB.
- Compatibilidad con GPU de consumo: no confirmada por falta de datos de tamaño de los quants; las variantes APEX están diseñadas para offload parcial a CPU, lo que sugiere que pueden ejecutarse en configuraciones con VRAM limitada más RAM del sistema.
- Opciones de despliegue: llama.cpp (los quants están etiquetados como imatrix y llama.cpp), transformers con safetensors y endpoints compatibles según la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-Candid-Coder-35B-A3B | 35,95 B (MoE) | no disponible | no disponible | Merge abliterated de cuatro modelos, orientado a código y agentes |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | Modelo base del merge; sin las contribuciones de Sage, KAT-Coder ni Ornith |
| Kwaipilot/KAT-Coder-V2.5-Dev | no disponible | no disponible | no disponible | Fine-tune especializado en código eficiente en tokens; aporta el 53 % del merge |
| InternScience/Sage-A1.5 | no disponible | no disponible | no disponible | Fine-tune con seguimiento de instrucciones fuerte (81,6 en IFBench según la model card); aporta el 37 % |
| ornith-ai/Ornith-1.5-35B-A3B | no disponible | no disponible | no disponible | Fine-tune con autoandamiaje y planificación; aporta el 10 % |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un merge no entrenado desde cero; su comportamiento depende enteramente de la calidad de los modelos de origen y del método DELLA, sin garantías de benchmarks publicados.
- La variante abliterated elimina parte de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado o dañino y complica el cumplimiento de políticas de contenido en producción.
- La model card advierte de que el modelo puede ser extremadamente persistente en la tarea asignada; es imprescindible sandboxing antes de uso agéntico.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fiabilidad publicados.
- La licencia no está declarada, por lo que no puede confirmarse el uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Los idiomas soportados no están documentados; el imatrix de calibración usa mayoritariamente inglés, lo que puede degradar el rendimiento en castellano.
- La longitud de contexto no está documentada, aunque el autor menciona optimización para contexto largo en las cuantizaciones.
- Las métricas de fidelidad de cuantización son del autor y se miden con llama-perplexity sobre un conjunto propio, no con benchmarks estándar de tareas.
- El repositorio tiene 0 likes y 3.144 descargas en la fecha de actualización, lo que indica una validación comunitaria todavía limitada.

## Enlaces

- [HuggingFace: DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B](https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-35B-A3B)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Modelo base: InternScience/Sage-A1.5](https://huggingface.co/InternScience/Sage-A1.5)
- [Modelo base: Kwaipilot/KAT-Coder-V2.5-Dev](https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev)
- [Modelo base: ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
