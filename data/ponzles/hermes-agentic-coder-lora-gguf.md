# ponzles/Hermes-Agentic-Coder-LoRA-GGUF

## Resumen

Hermes-Agentic-Coder-LoRA-GGUF es un modelo de generación de texto publicado por el usuario ponzles en Hugging Face, distribuido en formato GGUF y construido mediante la fusión (merge) de varios adaptadores LoRA sobre la familia Qwen3.8-27B. El objetivo declarado en sus etiquetas es el código agéntico: tareas de ingeniería de software, uso de terminal, contexto largo y eficiencia de tokens. Es, por tanto, un modelo orientado a flujos de trabajo con agentes que ejecutan comandos y editan repositorios, no un modelo generalista de propósito indefinido.

La relevancia del modelo reside en su naturaleza de merge comunitario: combina linajes como RadixArk/DaisyRose-27B, harness-hub/Qwen3.8-27B-super-adapter, bottlecapai/ThinkingCap-Qwen3.8-27B, ukisai/Swift-1.5-Qwen3.8-27b y Shockem/Qwen3.8-27b-Terse-Coder-LoRA, todos derivados de unsloth/Qwen3.8-27B. El resultado es un artefacto pensado para desplegarse localmente con llama.cpp, LM Studio, vLLM o SGLang, lo que lo hace atractivo para equipos que necesitan un agente de código autoalojado.

Sin embargo, la información disponible es escasa y presenta una discrepancia importante: la model card apenas aporta especificaciones técnicas (la mayor parte del contenido es maquetación HTML/CSS), y el recuento de parámetros en safetensors indica 1.079.732.224 parámetros, muy alejado de los 27B que sugiere el nombre del modelo base. Esta ficha refleja ambos datos y advierte sobre la inconsistencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, según los modelos base declarados); detalles no disponibles |
| Parametros totales | 1.079.732.224 según safetensors; el nombre del modelo base sugiere 27B (discrepancia no aclarada por el autor) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (la etiqueta "long-context" sugiere ventana extendida, sin cifra publicada) |
| Tipos de cuantizacion | GGUF (el repo incluye pesos cuantizados; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 6,5 GB) |

## Arquitectura y entrenamiento

El modelo es un merge de adaptadores LoRA sobre la familia Qwen3.8-27B. Según los metadatos, se fusionan seis linajes: unsloth/Qwen3.8-27B como base, junto con RadixArk/DaisyRose-27B, harness-hub/Qwen3.8-27B-super-adapter, bottlecapai/ThinkingCap-Qwen3.8-27B, ukisai/Swift-1.5-Qwen3.8-27b y Shockem/Qwen3.8-27b-Terse-Coder-LoRA. No se documenta la receta de fusión (ponderaciones, método de merge, capas afectadas) ni el proceso de entrenamiento de los adaptadores originales.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio apuntan a un entrenamiento orientado a código agéntico, terminal, contexto largo y eficiencia de tokens, pero se trata de indicios declarativos, no de datos verificables. Tampoco se detalla ninguna innovación arquitectónica propia: el modelo hereda la arquitectura del base y se limita a recombinar capacidades mediante el merge.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Código agéntico: etiquetas específicas para "agentic-coding" y "software-engineering".
- Interacción con terminal y ejecución de comandos, según la etiqueta "terminal".
- Contexto largo: la etiqueta "long-context" sugiere ventanas extendidas, aunque no se publica la cifra exacta.
- Eficiencia de tokens: etiqueta "token-efficiency", orientada a reducir el consumo en bucles agénticos.
- Compatibilidad declarada con llama.cpp, LM Studio, vLLM y SGLang.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Agente de codificación en terminal: el modelo puede integrarse en un bucle que recibe el estado de un repositorio, propone comandos y edita archivos, aprovechando sus etiquetas de terminal y agentic-coding para tareas de refactorización y corrección de errores.
- Automatización de tareas de ingeniería de software: generación de parches, escritura de tests y actualización de dependencias dentro de pipelines, con la ventaja de ejecutarse localmente en formato GGUF.
- Asistente de código en el IDE con contexto largo: para proyectos grandes donde se necesita arrastrar fragmentos extensos de código y documentación en la ventana de contexto.
- Despliegue autoalojado con llama.cpp o LM Studio: equipos que no pueden enviar código propietario a APIs externas pueden servir el modelo en su propia infraestructura.
- Servido en producción con vLLM o SGLang: para escenarios de mayor concurrencia donde se requiere un servidor compatible con OpenAI y pesos GGUF.
- Experimentación con merges de LoRA: como referencia para investigadores que estudian la fusión de adaptadores especializados en código sobre una misma base.
- Reducción de coste por token en bucles agénticos: la etiqueta token-efficiency sugiere un diseño para minimizar la verbosidad en tareas iterativas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión debido a la discrepancia en el recuento de parámetros. Con 1.079 millones de parámetros y cuantización de 4 bits, cabría en torno a 1 GB; con 27B en 4 bits, en torno a 14-16 GB.
- GPU recomendadas: no disponibles. Si el modelo es realmente de 27B, se necesitarían GPUs de 24 GB o más (RTX 4090, A100, H100) para cuantizaciones altas; si el recuento de safetensors es correcto, cabría en GPUs consumer de gama media.
- GPU consumer: probablemente sí en el escenario de 1B; ajustado en el escenario de 27B con cuantización Q4.
- Opciones de despliegue: llama.cpp, LM Studio, vLLM y SGLang, según las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hermes-Agentic-Coder-LoRA-GGUF | 1,08B (safetensors) / 27B (nombre base) | no disponible | Apache 2.0 | GGUF | Merge comunitario de LoRA para código agéntico |
| unsloth/Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible | Base directa del merge |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | 27B (según nombre) | no disponible | no disponible | no disponible | Adaptador LoRA especializado en código conciso |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible | Adaptador con modo de razonamiento |

## Limitaciones y advertencias

- Discrepancia crítica en el recuento de parámetros: safetensors indica 1.079.732.224 parámetros, mientras que el nombre del modelo base sugiere 27B. El autor no aclara esta inconsistencia, lo que impide planificar hardware con fiabilidad.
- Model card prácticamente vacía de contenido técnico: la mayor parte del README es maquetación HTML/CSS, sin datos de entrenamiento, benchmarks ni instrucciones de uso verificables.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento adecuado en castellano.
- Contexto: la etiqueta "long-context" no va acompañada de una cifra, por lo que no se puede confirmar la ventana real.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de múltiples linajes conviene verificar las licencias de cada modelo base antes de producción.
- Naturaleza comunitaria: sin garantías de mantenimiento, soporte ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ponzles/Hermes-Agentic-Coder-LoRA-GGUF
- Modelo base principal: https://huggingface.co/unsloth/Qwen3.8-27B
- Linaje DaisyRose: https://huggingface.co/RadixArk/DaisyRose-27B
- Linaje super-adapter: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Linaje ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Linaje Swift-1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Linaje Terse-Coder: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
