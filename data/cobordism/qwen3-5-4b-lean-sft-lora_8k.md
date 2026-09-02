# cobordism/qwen3.5-4b-lean-sft-lora_8k

## Resumen

El modelo `cobordism/qwen3.5-4b-lean-sft-lora_8k` es un adaptador LoRA de rango 64 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` mediante fine-tuning supervisado (SFT) con datos de demostración formal en el asistente Lean. Desarrollado por el usuario `cobordism`, este adaptador tiene como objetivo especializar el modelo base en la generación de pruebas formales, un campo clave para la verificación automática de teoremas y el razonamiento matemático asistido por IA.

El adaptador se publica como un artefacto de investigación, no como un modelo independiente: requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador mediante la librería PEFT. En una evaluación controlada sobre 64 problemas del benchmark miniF2F (modo directo, un solo intento), el checkpoint verifica 32 pruebas (50,0 %), lo que indica una capacidad razonable para tareas de demostración formal en Lean, aunque con margen de mejora.

La relevancia de este modelo radica en la combinación de un modelo base compacto (4B parámetros) con un adaptador ligero (0,3 GB) que permite experimentar con demostración formal en hardware asequible. Es un ejemplo de cómo el fine-tuning específico puede adaptar modelos de propósito general a tareas altamente especializadas sin necesidad de entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64) sobre Qwen3.5-4B (transformer denso, según vLLM Recipes) |
| Parametros totales | No disponible (el adaptador solo; el modelo base tiene 4B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-4B soporta 262K tokens según vLLM Recipes, pero el adaptador no especifica limitaciones) |
| Tipos de cuantizacion | No disponible (se puede combinar con cuantización del modelo base, pero no se indica) |
| Idiomas soportados | No disponibles (el modelo base Qwen soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible (se debe cumplir la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) con rango 64, que introduce matrices de bajo rango en las capas del modelo base para ajustar sus pesos sin modificar completamente los parámetros originales. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) durante 8.000 pasos sobre un conjunto de datos de demostraciones formales en Lean, aunque no se detalla la composición exacta del dataset ni el número de tokens utilizado.

El modelo base, Qwen3.5-4B, es un modelo denso compacto de la familia Qwen3.5 que, según la documentación de vLLM, incorpora arquitectura de "gated delta networks", un encoder de visión y decodificación MTP (Multi-Token Prediction). Sin embargo, el adaptador se centra exclusivamente en la generación de texto para pruebas formales, por lo que las capacidades multimodales del base no se aprovechan en este contexto.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. El adaptador se publica tal cual, como un checkpoint intermedio de un proceso de entrenamiento más amplio.

## Capacidades

- Generación de demostraciones formales en el lenguaje de Lean, incluyendo tácticas y secuencias de prueba.
- Razonamiento matemático formalizado, orientado a la verificación de teoremas.
- Soporte de interacción multi-turno con un agente basado en XML (según la nota de evaluación), aunque este protocolo se mide por separado y no se compara directamente con el control miniF2F.
- Capacidad de adaptación a tareas específicas mediante fine-tuning, gracias a la arquitectura LoRA que permite actualizaciones de bajo coste.
- No se reportan capacidades de tool calling, generación de código general ni visión en este adaptador concreto.

## Casos de uso

- Asistencia en demostración formal de teoremas: el modelo puede sugerir pasos de prueba en Lean, ayudando a matemáticos y verificadores a completar demostraciones complejas. Su precisión del 50 % en miniF2F lo hace útil como herramienta de apoyo, no como sustituto completo.
- Automatización de pruebas en proyectos de verificación formal: integrado en pipelines de CI/CD, el adaptador puede generar candidatos a prueba que luego son verificados por el kernel de Lean, reduciendo el esfuerzo manual.
- Educación en lógica y demostración formal: estudiantes pueden usar el modelo para explorar estrategias de prueba y entender cómo se estructuran las demostraciones en Lean.
- Investigación en razonamiento automático: el adaptador sirve como punto de partida para experimentos con diferentes datasets, rangos LoRA o métodos de entrenamiento (por ejemplo, RLHF sobre demostraciones).
- Generación de tácticas Lean: el modelo puede producir tácticas individuales o secuencias de tácticas, que luego se aplican a objetivos concretos en un entorno interactivo.
- Benchmarking de modelos especializados: permite comparar el rendimiento de un modelo de 4B con adaptador frente a modelos más grandes o con otros métodos de fine-tuning en tareas de demostración formal.

## Benchmarks y rendimiento

Según la model card, el adaptador se evaluó en un control fijo de 64 problemas del benchmark miniF2F (modo directo, un solo intento). Los resultados son:

| Benchmark | Modo | Resultado |
|---|---|---|
| miniF2F (64 problemas) | Directo, un solo intento | 32/64 verificados (50,0 %) |

No se proporcionan comparaciones con otros modelos ni resultados adicionales. El autor advierte que el diagnóstico multi-turno con agente XML usa un protocolo distinto y no debe compararse directamente con esta puntuación.

## Requisitos de hardware

No se dispone de datos específicos para el adaptador, pero se pueden estimar a partir del modelo base Qwen3.5-4B:

- VRAM estimada para inferencia: el modelo base con 4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) puede caber en GPUs con 6-8 GB. El adaptador LoRA añade una sobrecarga mínima (rango 64, pocos MB).
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superior es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, una GPU con 24 GB (RTX 3090/4090) o una A100/H100 sería adecuada.
- En consumer GPU: sí, cabe en GPUs de 16 GB según vLLM Recipes para el modelo base, y el adaptador no incrementa significativamente los requisitos.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y PEFT, o exportar a formatos como GGUF para usar con llama.cpp u Ollama (si se fusiona con el base). vLLM soporta Qwen3.5-4B, aunque la integración de adaptadores LoRA requiere configuración adicional.
- Latencia y throughput: no disponibles. Para un modelo de 4B en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos especializados en demostración formal con Lean. No se han encontrado adaptadores equivalentes sobre Qwen3.5-4B ni benchmarks comparativos. Se recomienda evaluar el modelo frente a alternativas como GPT-4 con Lean, o adaptadores sobre modelos como Llama-3-8B o Mistral-7B, pero no hay datos públicos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador con PEFT. No funciona por sí solo.
- La licencia del adaptador no está especificada; se debe cumplir la licencia del modelo base Qwen, que puede tener restricciones de uso comercial según la versión.
- El rendimiento en demostraciones formales es limitado (50 % en miniF2F) y puede fallar en problemas más complejos o fuera del dominio de entrenamiento.
- No se han documentado sesgos específicos, pero al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base en tareas de razonamiento matemático.
- Riesgo de alucinación: el modelo puede generar secuencias de tácticas que parecen plausibles pero no son verificables por el kernel de Lean. Siempre se debe verificar la salida.
- El contexto de entrenamiento no se especifica; el adaptador podría no manejar demostraciones muy largas o con muchos pasos intermedios.
- No hay garantías de soporte ni mantenimiento; es un artefacto de investigación publicado por un usuario individual.

## Enlaces

- HuggingFace: https://huggingface.co/cobordism/qwen3.5-4b-lean-sft-lora_8k
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub de fine-tuning similar (referencia): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Página de Ollama para qwen3.5: https://ollama.com/library/qwen3.5:4b
- vLLM Recipes para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
