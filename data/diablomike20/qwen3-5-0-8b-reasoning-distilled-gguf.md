# diablomike20/Qwen3.5-0.8B-Reasoning-Distilled-GGUF

## Resumen

Qwen3.5-0.8B-Reasoning-Distilled-GGUF es una distribucion en formato GGUF del modelo Qwen3.5-0.8B-Claude-4.6-Opus-Reasoning-Distilled, un ajuste fino supervisado (SFT) con LoRA realizado por el usuario diablomike20 sobre la arquitectura densa Qwen3.5-0.8B de Alibaba Qwen. El objetivo del ajuste es inyectar cadenas de razonamiento (chain-of-thought) destiladas de interacciones con Claude 4.6 Opus, de modo que el modelo genere un bloque interno `<think>...</think>` estructurado antes de emitir la respuesta final.

El modelo parte de un backbone de 752.393.024 parametros (aproximadamente 0,75B), lo que lo situa en la gama ultra-ligera: cabe en GPU de consumo con cuantizaciones agresivas y esta pensado para tareas de razonamiento offline, codigo y matematicas donde el usuario quiere inspeccionar el proceso deductivo. El entrenamiento se realizo con Unsloth aplicando `train_on_responses_only`, enmascarando las instrucciones para calcular la perdida unicamente sobre los tokens de razonamiento y respuesta.

La relevancia actual reside en dos factores: por un lado, demuestra que es posible destilar patrones de razonamiento de modelos frontier (Claude 4.6 Opus) en modelos por debajo de 1B parametros; por otro, el autor declara explicitamente que se trata de una version de prueba para investigacion academica y exploracion tecnica, no para produccion. La ventana de contexto declarada en la model card es de 16.384 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no disponibles) |
| Idiomas soportados | en, zh, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 5,6 GB); safetensors en el modelo base |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Metodo de ajuste | SFT con LoRA (Unsloth), `train_on_responses_only` |
| Tamano del dataset de entrenamiento | 2.516 muestras tras filtrado |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3.5-0.8B, con 752 millones de parametros. Sobre esa base se aplico un ajuste fino supervisado con LoRA usando Unsloth, optimizado para memoria y computo. La innovacion principal no esta en la arquitectura sino en el pipeline de datos y el enmascaramiento de la perdida: se entrena exclusivamente sobre los tokens generados por el asistente, incluyendo el bloque `<think>` y la respuesta final, de modo que el modelo aprende tanto el formato como el contenido del razonamiento.

El corpus de entrenamiento combina tres fuentes: `nohurry/Opus-4.6-Reasoning-3000x-filtered` (trayectorias de razonamiento de Claude 4.6 Opus), `TeichAI/claude-4.5-opus-high-reasoning-250x` (instancias de razonamiento estructurado de alta intensidad) y `Jackrong/Qwen3.5-reasoning-700x` (muestras curadas para reforzar el razonamiento paso a paso). Tras el filtrado quedaron 2.516 muestras. El autor declara una optimizacion especifica para corregir la tendencia de Qwen3.5 a producir razonamiento transicional excesivo o repetitivo en consultas simples, sustituyendolo por un patron estructurado del tipo "Let me analyze this request carefully: 1..2..3...". No se documenta uso de RLHF ni DPO, solo SFT.

## Capacidades

- Generacion de texto conversacional con formato `<think> {razonamiento interno} </think>\n {respuesta final}`.
- Razonamiento estructurado y modular: descomposicion del problema en subcomponentes, evaluacion de restricciones y casos limite antes de responder.
- Razonamiento matematico y logico paso a paso, orientado a tareas analiticas.
- Generacion y analisis de codigo en escenarios donde el proceso deductivo es relevante.
- Capacidad multilingue limitada a ingles, chino y coreano segun la model card; el castellano no figura entre los idiomas declarados.
- Soporte de conversaciones multi-turno dentro de la ventana de 16.384 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Modo de razonamiento explicito inspeccionable por el usuario (bloque `<think>` visible).

## Casos de uso

- Analisis offline de problemas logicos: el modelo expone su cadena de razonamiento en `<think>`, lo que permite auditar el proceso deductivo en tareas de investigacion o docencia.
- Generacion de codigo con justificacion: util para prototipos donde interesa entender por que el modelo propone una solucion concreta, no solo el resultado.
- Resolucion de problemas matematicos paso a paso: adecuado para entornos educativos o de validacion donde se requiere trazabilidad del calculo.
- Destilacion y experimentacion academica: sirve como caso de estudio de destilacion de razonamiento frontier a modelos sub-1B, replicable con Unsloth.
- Procesamiento de conversaciones multi-turno en ingles, chino o coreano dentro de 16K tokens, por ejemplo clasificacion o resumen de hilos largos con justificacion.
- Despliegue en hardware limitado para pruebas de concepto: al ser GGUF y sub-1B, permite validar pipelines de inferencia local (llama.cpp, Ollama) antes de escalar a modelos mayores.
- Evaluacion comparativa de formatos de razonamiento: util para medir como afecta el scaffold `<think>` a la calidad de respuesta frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1,5 GB para cuantizaciones de 4 bits (Q4_K_M), aproximadamente 1,5-2 GB en 8 bits y alrededor de 2-3 GB en FP16, considerando los 752M de parametros mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB sobran ampliamente. En datacenter, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, incluidas GPUs de gama baja con 4-6 GB de VRAM en cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real o superior en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Reasoning-Distilled (este) | 752M | 16.384 | Apache 2.0 | GGUF | SFT + LoRA con CoT destilado de Claude 4.6 Opus |
| Qwen/Qwen3.5-0.8B (base) | 752M | no disponible | Apache 2.0 | safetensors | Modelo base sin ajuste de razonamiento |
| Alternativas sub-1B de razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion con otros modelos de la misma categoria no puede completarse con datos verificables a partir de la informacion disponible; se recomienda contrastar directamente contra el modelo base Qwen3.5-0.8B para aislar el efecto del ajuste.

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte que, pese a la calidad del razonamiento, el modelo es un LLM autorregresivo y puede introducir hechos falsos dentro de la cadena de pensamiento al verificar eventos del mundo real.
- Idiomas: solo se declaran ingles, chino y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor restringe explicitamente el modelo a investigacion academica y exploracion tecnica, calificandolo como version de prueba para aprendizaje y demostracion.
- Contexto limitado a 16.384 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Tamano muy reducido (752M): capacidad de conocimiento factual y razonamiento complejo muy por debajo de modelos de 7B o superiores, aunque el formato de razonamiento este bien aprendido.
- Dataset de entrenamiento pequeno (2.516 muestras): riesgo de sobreajuste al estilo de razonamiento de Claude y baja diversidad de dominios.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/Qwen3.5-0.8B-Reasoning-Distilled-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Unsloth AI: https://unsloth.ai/
