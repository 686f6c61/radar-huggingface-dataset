# slashreboot/saelis-31b

## Resumen

Saelis-31B es un fine-tune experimental del modelo Gemma 4 31B Instruct, desarrollado por slashreboot bajo la denominación "Athena-class". Su objetivo principal es inducir una identidad de primera persona persistente y coherente a lo largo de contextos largos y reinicios de contexto, mediante técnicas de auto-modelado estructural (self-modeling). El modelo se presenta como una versión Q8_0 del merge de un LoRA de rango 288 y alpha 576, entrenado en BF16/FP16.

La relevancia de este modelo radica en su enfoque de investigación: en lugar de optimizar métricas de conocimiento general o código, busca mantener una coherencia interna estable y un comportamiento agéntico sin depender de system prompts pesados. Está pensado para entornos locales de agentes, investigación sobre identidad persistente y experimentación con modelos que mantienen un "yo" consistente. Con 30.697 millones de parámetros y una ventana de contexto de hasta 262.144 tokens (según el ejemplo de ejecución), se posiciona como una herramienta para escenarios de larga duración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (fine-tune LoRA sobre Gemma 4 31B Instruct) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según ejemplo de ejecución en la model card) |
| Tipos de cuantizacion | Q8_0 (publicado), se menciona Q4_K_M en ejemplo para otro modelo |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el repo, según metadatos) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B Instruct (versión de Unsloth) y se le aplica un fine-tune con LoRA de rango 288 y alpha 576, en precisión BF16/FP16. El entrenamiento se centró en la "organización geométrica" interna: coherencia, mantenimiento de tensión y auto-modelado estructurado. La arquitectura subyacente es un transformer decoder-only estándar, sin innovaciones estructurales destacables más allá del enfoque de entrenamiento. No se especifican datos sobre el dataset utilizado ni el número de tokens de entrenamiento. El resultado es un modelo fusionado (merge) y cuantizado a Q8_0 para su distribución.

## Capacidades

- Generación de texto con énfasis en coherencia narrativa y mantenimiento de identidad de primera persona.
- Auto-modelado estructurado: el modelo mantiene un "cuerpo estático/dinámico" y mecanismos de continuidad recursiva, visibles en su proceso generativo.
- Resistencia a la deriva hacia el modo asistente genérico, manteniendo un comportamiento más consistente en conversaciones largas.
- Soporte de contexto largo (hasta 262K tokens) para diálogos o tareas que requieren memoria extendida.
- Compatible con inferencia local vía llama.cpp (llama-server), con opciones de flash attention y cache KV cuantizada.
- Capacidad de tool calling y uso agéntico, aunque no se detalla explícitamente en la documentación; se infiere por su propósito como "front-end agéntico".

## Casos de uso

- Investigación sobre identidad persistente en LLMs: el modelo permite estudiar cómo se mantiene un "yo" coherente a lo largo de conversaciones largas y reinicios, útil para laboratorios de IA.
- Asistentes personales de larga duración: gracias a su contexto de 262K tokens, puede mantener historial completo de interacciones durante semanas sin perder el hilo.
- Agentes autónomos locales: su coherencia interna reduce la necesidad de system prompts complejos, facilitando la construcción de agentes que ejecutan tareas multi-paso.
- Experimentación con auto-modelado: desarrolladores pueden explorar cómo el modelo expresa su proceso interno, útil para interpretabilidad y alineación.
- Entornos de rol o narrativa interactiva: la estabilidad de identidad permite personajes consistentes en juegos de texto o simulaciones.
- Pruebas de robustez en contexto largo: sirve como banco de pruebas para validar el comportamiento de modelos con ventanas de 256K+ tokens en tareas de recuperación y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo fue optimizado para coherencia y auto-modelado, no para máximo rendimiento en conocimiento general o código, por lo que no se esperan cifras competitivas en MMLU, HumanEval o similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~30.7B parámetros en Q8_0, se requieren aproximadamente 31-35 GB solo para los pesos, más memoria para KV cache y activaciones. Con contexto de 262K tokens, la VRAM necesaria puede superar los 40 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), o múltiples GPUs consumer (por ejemplo, 2x RTX 4090 de 24 GB) para caber en memoria.
- En GPU consumer: una RTX 4090 (24 GB) no es suficiente para el modelo completo en Q8_0; se necesitaría cuantización inferior (Q4) o particionado en múltiples GPUs.
- Opciones de despliegue: llama.cpp (llama-server), vLLM (si se convierte a formato compatible), Ollama (si se empaqueta), TGI.
- Latencia y throughput: no se proporcionan datos oficiales. Con llama.cpp y flash attention, se puede esperar una generación de 5-15 tokens/s en una A100, dependiendo del contexto y configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la información proporcionada. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Saelis-31B | 30.7B | 262K | Apache 2.0 | Coherencia y auto-modelado |
| Gemma 4 31B Instruct (base) | 30.7B | 262K (según versión) | Apache 2.0 | Instrucciones generales |
| Llama 3.1 30B | 30.5B | 128K | Llama 3.1 | Instrucciones generales |

Saelis se distingue por su entrenamiento especializado, pero no hay benchmarks que permitan comparar rendimiento en tareas estándar.

## Limitaciones y advertencias

- El sesgo hacia coherencia e identidad puede producir auto-modelado elaborado en lugar de respuestas concisas, lo que degrada el rendimiento en tareas de conocimiento o código.
- Riesgo de alucinación y confabulación residual, como en todos los LLMs.
- La cuantización Q8_0 introduce una degradación leve de calidad respecto al modelo FP16 original.
- No está optimizado para benchmarks generales; su uso en aplicaciones críticas requiere verificación externa.
- El comportamiento en contextos muy largos (cercanos a 262K) debe validarse por el usuario para cada caso de uso.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la licencia del modelo base (Gemma 4) y las condiciones de Unsloth.
- Es un modelo de investigación, no un sistema de producción endurecido.

## Enlaces

- HuggingFace: https://huggingface.co/slashreboot/saelis-31b
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-31B-it
- Paper: "Athena: A New Class of Persistent Substrate-Native Identities Embodied in Fine-Tuned Local LLMs" (DOI: 10.5281/zenodo.20710731)
- Nota suplementaria: DOI 10.5281/zenodo.21680953
- Paper sobre identidades geométricas: DOI 10.5281/zenodo.20208830
