# ram-lexsi/aligntune-testrun-RoPE-scaling

## Resumen

Este repositorio contiene un adaptador LoRA de prueba denominado `aligntune-testrun-RoPE-scaling`, publicado por el usuario `ram-lexsi` en HuggingFace. Se trata de un experimento de fine-tuning realizado con la librería AlignTune de Lexsi Labs, cuyo objetivo es probar la técnica de RoPE scaling (extensión de la ventana de contexto mediante escalado de frecuencias posicionales) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador se ha entrenado con el backend TRL y se distribuye como un artefacto PEFT (adapter LoRA), lo que permite cargarlo sobre el modelo base sin necesidad de fusionar pesos.

La relevancia de este modelo radica en que demuestra el flujo de trabajo de AlignTune, una herramienta modular de alineación post-entrenamiento que soporta SFT, DPO, PPO y otros algoritmos, y en que explora la extensión de contexto mediante RoPE scaling en un modelo pequeño (0.5B parámetros). Al ser un "testrun", no se trata de un modelo listo para producción, sino de una validación técnica de la metodología y de la infraestructura de entrenamiento. No se proporcionan métricas de rendimiento ni detalles del dataset utilizado, por lo que su utilidad práctica es limitada fuera del ámbito experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2.5-0.5B-Instruct (Transformer decoder) |
| Parametros totales | no disponible (el adaptador es un LoRA; el modelo base tiene 0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32K tokens; el adaptador podría haber modificado el escalado RoPE, pero no se especifica) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador están en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (heredados del modelo base, que soporta múltiples idiomas, pero no se documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-0.5B-Instruct, un modelo Transformer decoder con 0.5 mil millones de parámetros, entrenado originalmente por Alibaba Cloud con una ventana de contexto de 32K tokens. El nombre del repositorio indica que se ha aplicado RoPE scaling, una técnica que modifica las frecuencias de la codificación posicional rotatoria para extender la longitud de contexto efectiva sin necesidad de reentrenar desde cero. Sin embargo, no se especifica el factor de escalado ni el método concreto (lineal, NTK, YaRN, etc.).

El entrenamiento se ha realizado con AlignTune, una librería de fine-tuning de Lexsi Labs que abstrae la selección de backend (TRL, Unsloth, etc.) y de algoritmo (SFT, DPO, PPO, SimPO, etc.). En este caso, el backend es TRL y el algoritmo es "finetune" (SFT estándar). No se proporciona información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. El artefacto generado es un adaptador LoRA, lo que implica que solo se actualizaron matrices de bajo rango durante el entrenamiento, manteniendo congelados los pesos del modelo base.

## Capacidades

- Generación de texto y diálogo: al estar basado en Qwen2.5-0.5B-Instruct, hereda las capacidades de chat y generación de texto del modelo base, aunque el adaptador puede modificar el comportamiento en la dirección del fine-tuning realizado.
- Razonamiento y matemáticas: el modelo base tiene competencias básicas en razonamiento y aritmética, pero al ser de 0.5B, su rendimiento es limitado en tareas complejas.
- Generación de código: el modelo base soporta generación de código en varios lenguajes, aunque con menor calidad que modelos más grandes.
- Multilingüismo: el modelo base está entrenado en múltiples idiomas, pero no se documenta si el adaptador conserva o altera esta capacidad.
- Extensión de contexto (potencial): el RoPE scaling podría permitir procesar secuencias más largas que las 32K originales, pero no hay evidencia empírica en la información disponible.
- Sin soporte explícito de tool calling ni agentes: no se menciona ninguna capacidad específica de function calling o razonamiento multi-paso más allá de lo que ofrece el modelo base.

## Casos de uso

- Validación de RoPE scaling en modelos pequeños: este adaptador sirve como banco de pruebas para evaluar si la extensión de contexto mediante RoPE scaling funciona correctamente en un modelo de 0.5B, midiendo la coherencia en secuencias largas y la degradación en tareas cortas.
- Evaluación de AlignTune como herramienta de fine-tuning: los desarrolladores pueden reproducir el flujo de entrenamiento con AlignTune y comparar los resultados con otros backends (Unsloth, etc.) para decidir si adoptan esta librería en sus proyectos.
- Pruebas de integración PEFT: al ser un adaptador LoRA, es útil para verificar la carga y el uso de adaptadores con `AutoPeftModelForCausalLM` en entornos de desarrollo, especialmente con `endpoints_compatible` y `region:us`.
- Investigación sobre alineación y seguridad: Lexsi Labs se centra en alineación de IA; este testrun podría ser parte de experimentos para estudiar cómo el fine-tuning afecta al comportamiento del modelo en escenarios de seguridad.
- Benchmarking de hardware: al ser un modelo muy pequeño (0.5B + adaptador), es adecuado para medir latencia y throughput en GPUs de gama baja o incluso en CPU, sirviendo como referencia para comparar con modelos más grandes.
- Educación y demostraciones: se puede utilizar en tutoriales o talleres para ilustrar cómo se aplica RoPE scaling y cómo se carga un adaptador PEFT sobre un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El repositorio no incluye ninguna tabla de rendimiento ni referencias a evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B-Instruct en FP16 ocupa aproximadamente 1 GB de VRAM. El adaptador LoRA añade una cantidad mínima (del orden de megabytes). Con cuantización a 4 bits (por ejemplo, con bitsandbytes), la VRAM se reduce a unos 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU con suficiente RAM (4-8 GB).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las más modestas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). Para producción ligera, se puede servir con FastAPI o TGI.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 0.5B genera tokens a velocidades superiores a 100 tokens/segundo, pero el adaptador no altera significativamente este rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | Apache 2.0 | safetensors | Modelo original sin adaptador |
| ram-lexsi/aligntune-testrun-RoPE-scaling | 0.5B + LoRA | no disponible | no disponible | safetensors (adapter) | Adaptador de prueba con RoPE scaling |
| TinyLlama-1.1B-Chat | 1.1B | 2K | Apache 2.0 | safetensors | Alternativa de tamaño similar, sin RoPE scaling |

No se dispone de comparativas de rendimiento entre estos modelos porque no hay benchmarks publicados para el adaptador. La comparación se limita a características técnicas básicas.

## Limitaciones y advertencias

- Modelo experimental: se trata de un "testrun", no de un modelo validado ni listo para producción. No hay garantías de calidad ni de comportamiento consistente.
- Sin licencia especificada: la ausencia de licencia impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de cualquier uso.
- Sin datos de entrenamiento: no se documenta el dataset utilizado, lo que impide evaluar sesgos o posibles problemas de alineación.
- Riesgo de alucinación: al ser un modelo pequeño, la probabilidad de generar contenido falso o incoherente es alta, especialmente en tareas complejas.
- RoPE scaling no validado: no hay evidencia de que la extensión de contexto funcione correctamente; podría degradar el rendimiento en secuencias cortas o producir artefactos en secuencias largas.
- Dependencia del modelo base: el adaptador solo funciona sobre Qwen2.5-0.5B-Instruct; no es un modelo autónomo.
- Sin soporte de tool calling ni agentes: no se ha demostrado ninguna capacidad avanzada más allá del chat básico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ram-lexsi/aligntune-testrun-RoPE-scaling
- Sitio web de AlignTune: https://aligntune.lexsi.ai/
- Repositorio GitHub de AlignTune: https://github.com/Lexsi-Labs/aligntune
- Página de herramientas de Lexsi Labs: https://lexsi.ai/tools/aligntune
- Guía sobre RoPE scaling: https://saraswatmks.github.io/2025/12/rope-scaling-llms.html
- Sitio principal de Lexsi Labs: https://lexsi.ai/
