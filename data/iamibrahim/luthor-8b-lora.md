# IAMIbrahim/luthor-8b-lora

## Resumen

Luthor 8B — LoRA adapter es un adaptador PEFT de tipo QLoRA publicado por el usuario IAMIbrahim sobre el modelo base Qwen/Qwen3-8B. El repositorio ocupa 0,7 GB (677 MB) y contiene únicamente los pesos del adaptador, de forma que aplicándolo sobre Qwen3-8B se reconstruye el modelo fusionado IAMIbrahim/luthor-8b sin necesidad de descargar los aproximadamente 15 GB de pesos ya combinados. El adaptador tiene 174.587.904 parámetros entrenables, un 2,09 % de los 8,4B del modelo base, y se distribuye bajo licencia Apache 2.0.

El interés de esta ficha no es el rendimiento, sino su carácter de resultado negativo documentado. El propio autor indica que el modelo no superó su «ship gate»: obtuvo 0/10 en las tareas retenidas de evaluación, exactamente el mismo resultado que Qwen3-8B sin entrenar, y con una adherencia al protocolo peor que la del modelo base. Es decir, el entrenamiento de ajuste fino no aportó ninguna capacidad nueva y degradó el seguimiento de formato.

Por tanto, se trata de un artefacto útil para reproducibilidad, para estudiar el comportamiento de QLoRA sobre Qwen3-8B y para análisis de fallos, no para despliegue en producción. No se han encontrado datos de benchmarks públicos, idiomas soportados ni pipeline declarado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only denso Qwen3-8B; rango 64 aplicado a todas las proyecciones lineales (`all-linear`) |
| Parámetros totales | 8,4B en el modelo base; 174.587.904 parámetros entrenables en el adaptador (2,09 %) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la determina el modelo base Qwen/Qwen3-8B) |
| Tipos de cuantización | Entrenamiento con cuantización 4-bit NF4, double quantization y cómputo en bf16; el adaptador se distribuye en safetensors. No se documentan cuantizaciones GGUF del adaptador |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128, con dropout 0,05, aplicado sobre todas las capas lineales del transformer base (`all-linear`). La configuración suma 174.587.904 parámetros entrenables, un 2,09 % de los 8,4B del modelo Qwen3-8B. El entrenamiento se realizó con QLoRA: el modelo base se cargó cuantizado en 4-bit NF4 con double quantization y cómputo en bfloat16, mientras que los pesos del adaptador se entrenaron en precisión completa.

El run consistió en 2 épocas, 986 micro-steps, batch size 1 con 16 pasos de acumulación de gradiente (batch efectivo 16) y optimizador con learning rate 1e-4 y scheduler coseno. Se ejecutó en una única GPU H100 de 80 GB durante aproximadamente 55 minutos, y la pérdida final fue de ~1,25 partiendo de 8,23. No se documentan en la información disponible detalles sobre el dataset de entrenamiento (número de tokens, composición, proporción de ejemplos de tool calling), ni fases de RLHF o DPO posteriores.

## Capacidades

El adaptador se entrenó con etiquetas declaradas de agente y tool-use, pero la evaluación publicada por el autor no respalda ninguna capacidad adicional sobre el modelo base:

- Generación de texto, razonamiento, código y matemáticas: heredadas íntegramente de Qwen3-8B, sin mejora medible atribuible al adaptador.
- Tool calling / function calling: era el objetivo declarado del entrenamiento (`agent`, `tool-use` como tags), pero la adherencia al protocolo resultó peor que la del modelo base.
- Uso como agente y razonamiento multi-paso: no demostrado; 0/10 en las tareas retenidas de evaluación, el mismo resultado que Qwen3-8B sin ajustar.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para este adaptador.
- Reconstrucción del modelo fusionado: aplicar el adaptador sobre Qwen3-8B reproduce IAMIbrahim/luthor-8b sin descargar los ~15 GB de pesos combinados, que es su utilidad práctica principal.

## Casos de uso

- Reproducción de experimentos de QLoRA: el adaptador de 677 MB permite repetir y auditar el run completo sobre Qwen3-8B sin manejar los pesos fusionados de ~15 GB, útil para validar la metodología de entrenamiento descrita (rango, alpha, scheduler, épocas).
- Investigación sobre resultados negativos: sirve como caso documentado de fine-tuning que no mejora al modelo base, material directo para estudios sobre cuándo el ajuste fino supervisado no aporta capacidad nueva.
- Análisis de degradación de adherencia a formato: dado que el autor reporta peor adherencia al protocolo que el modelo base, es un punto de partida para estudiar cómo el entrenamiento con QLoRA puede deteriorar el seguimiento de plantillas de tool calling.
- Punto de partida para un segundo ciclo de ajuste: al ser un adaptador PEFT separable, puede cargarse, inspeccionarse o continuar su entrenamiento con otro dataset, sin tocar los pesos base.
- Docencia y divulgación técnica: ejemplo compacto y trazable de pipeline PEFT (carga con `PeftModel.from_pretrained`, fusión con `merge_and_unload`) con hiperparámetros y coste de cómputo explícitos (1x H100 80 GB, ~55 min).
- Evaluación comparativa de protocolos de agente: permite medir la diferencia entre adaptador aplicado y modelo base sobre el mismo conjunto de tareas, aislando el efecto del ajuste fino.
- Fine-tuning local con recursos limitados: la huella de 0,7 GB del adaptador facilita su distribución y almacenamiento en entornos donde mover pesos completos de 8B no es viable.
- No se recomienda su uso en producción: cualquier caso de uso real de generación, agentes o tool calling debería resolverse con Qwen3-8B sin adaptador o con otro modelo evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación disponible es el interno del autor sobre tareas retenidas:

| Evaluación | Luthor 8B LoRA | Qwen3-8B (base) | Observaciones |
|---|---|---|---|
| Tareas retenidas (held-out) | 0/10 | 0/10 | Mismo resultado en ambos casos |
| Adherencia al protocolo | Peor que el base | Referencia | Reportado por el autor del adaptador |
| Pérdida de entrenamiento | ~1,25 (desde 8,23) | No aplica | 2 épocas, 986 micro-steps |

El autor declara explícitamente que el modelo no pasó su «ship gate» y que se publica como resultado negativo.

## Requisitos de hardware

- Tamaño del adaptador: 677 MB en disco (0,7 GB de repositorio), independiente de la cuantización, ya que son pesos LoRA en safetensors.
- VRAM para inferencia con el modelo base en bf16: aproximadamente 17 GB solo de pesos, más caché KV y activaciones; en la práctica, del orden de 20-24 GB según longitud de contexto (estimación a partir de los 8,4B de parámetros, no dato publicado).
- VRAM con el modelo base en 4-bit NF4: del orden de 6-8 GB, lo que permite ejecución en GPUs de consumo de gama media-alta (estimación).
- GPU recomendadas: el entrenamiento se realizó en 1x H100 80 GB durante ~55 minutos. Para inferencia, una RTX 4090 (24 GB) es suficiente con el base en bf16; tarjetas de 8-12 GB requieren cuantización de 4 bits del base.
- Cabe en GPU de consumo: sí, aplicando el adaptador sobre Qwen3-8B cuantizado (NF4, o GGUF del modelo fusionado). No hay datos publicados de latencia ni throughput.
- Opciones de despliegue: `transformers` + `peft` (`PeftModel.from_pretrained`), fusión del adaptador (`merge_and_unload`) y posterior despliegue con vLLM, TGI, llama.cpp u Ollama. La conversión a GGUF requiere fusionar primero el adaptador con el base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y tamaño | Contexto | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| IAMIbrahim/luthor-8b-lora (este) | 174,6M entrenables (2,09 % de 8,4B) | Adaptador PEFT safetensors, 0,7 GB | No disponible | Apache 2.0 | 0/10 en tareas retenidas; peor adherencia al protocolo |
| IAMIbrahim/luthor-8b (fusionado) | 8,4B | Pesos fusionados, ~15 GB | No disponible | Apache 2.0 | Mismo run de entrenamiento; 0/10 según la model card del adaptador |
| Qwen/Qwen3-8B (base) | 8,4B | safetensors (dense, decoder-only) | No disponible en la información proporcionada | Apache 2.0 | 0/10 en las mismas tareas retenidas, referencia del adaptador |

Alternativas de otros fabricantes (Llama 3.1 8B, Mistral 7B, Gemma 2 9B, etc.): no disponibles en la información proporcionada; no se han consultado ni verificado datos de esos modelos para esta ficha.

## Limitaciones y advertencias

- Resultado negativo confirmado: el adaptador no supera su criterio de publicación; 0/10 en tareas retenidas, idéntico a Qwen3-8B sin entrenar, y con peor adherencia al protocolo que el base.
- Sin datos de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni métricas equivalentes publicadas, por lo que no puede compararse cuantitativamente con alternativas.
- Degradación de formato: el propio autor señala peor seguimiento del protocolo tras el ajuste, lo que lo hace contraproducente para pipelines de tool calling.
- Riesgo de alucinación: heredado del modelo base Qwen3-8B; la información disponible no documenta mitigaciones específicas.
- Cobertura de idiomas no documentada: la model card no declara idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el rendimiento evaluado no justifica su uso en producción; deben respetarse además las condiciones del modelo base Qwen3-8B.
- Dataset de entrenamiento no documentado: no se indica composición, número de tokens ni procedencia de los datos, lo que impide auditar sesgos o contaminación.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de terceros.
- Metadatos incompletos: sin `pipeline` declarado, sin idiomas y con fechas de creación y actualización de septiembre de 2026.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/IAMIbrahim/luthor-8b-lora
- Modelo fusionado Luthor 8B: https://huggingface.co/IAMIbrahim/luthor-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Sección de evaluación de la model card del modelo fusionado: https://huggingface.co/IAMIbrahim/luthor-8b#evaluation
- Búsqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados devueltos no guardan relación con él.
