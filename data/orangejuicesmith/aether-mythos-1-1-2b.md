# orangejuicesmith/AETHER-Mythos-1-1.2B

`, tool calls `<|tool_call_start|>[tool_name(arg="value")]<|tool_call_end|>`.

Parámetros de inferencia: temp 0.05, top_k 50, rep penalty 1.05.

Escribo ya.

Para benchmarks: "No se han publicado resultados de benchmarks en la información disponible." Y añadir que no hay evaluación comparativa del autor.

Comparativa: haré tabla con el modelo base y una fila para alternativas genéricas. Voy a poner:

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Benchmarks |
| AETHER-Mythos-1-1.2B | 1,17B | 32.768 | other (LFM + AGPL-3.0 en datos) | agente de código con thinking | no disponible |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B (según denominación; params exactos no disponibles) | no disponible en la info (el fine-tune entrena hasta 32.768) | licencia LFM de Liquid AI | reasoning general | no disponible |
| Alternativas ~1-2B de código/agente (Qwen2.5-Coder-1.5B, SmolLM2-1.7B, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

Eso es honesto.

Hardware: puedo añadir que el repo pesa 2,3 GB, consistente con bf16/fp16.

Ahora, el throughput en L40S de entrenamiento no aplica a inferencia.

Vamos a escribir.## Resumen

AETHER-Mythos-1-1.2B es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-1.2B-Thinking, publicado por el usuario orangejuicesmith en HuggingFace. Se presenta como un especialista en **agentic coding** (agente de código con bucle herramienta-observación-verificación) destilado a partir de trazas de agente de "Fable 5", con razonamiento interno en formato `<think>`. El objetivo declarado es el despliegue local y en dispositivo (portátil, NPU, edge), sacrificando tamaño a cambio de baja latencia y bajo consumo de VRAM/RAM.

El modelo conserva la arquitectura híbrida de la familia LFM2.5 de Liquid AI y un total de 1.170.340.608 parámetros (1,17B), con entrenamiento hasta 32.768 tokens de contexto. El ajuste se realizó con LoRA (r=128, alpha=256) mediante Unsloth + TRL SFT sobre una única GPU L40S en Modal, con un presupuesto muy reducido (1 época, máximo 100 pasos, batch efectivo 16).

Su relevancia es doble: por un lado, ejemplifica la tendencia de destilar trazas de agentes de gran tamaño en modelos pequeños para uso local; por otro, arrastra una advertencia legal relevante, ya que el 65 % de la señal de entrenamiento proviene de un dataset publicado bajo AGPL-3.0, lo que condiciona seriamente su uso comercial. El modelo lleva la etiqueta de licencia `other` y solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2.5 (Liquid AI); la composición exacta de capas no se detalla en la información disponible |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento, con packing activado) |
| Tipos de cuantizacion | No se listan cuantizaciones publicadas; la model card menciona despliegue mediante GGUF, MLX y llama.cpp |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (términos de la licencia LFM de Liquid AI para el modelo base, más obligaciones derivadas del uso de datos AGPL-3.0) |
| Formato de pesos | safetensors (repositorio de 2,3 GB); conversión a GGUF/MLX prevista por el autor |
| Libreria / ecosistema | transformers; compatible con endpoints; entrenado con Unsloth + TRL |
| Modelo base | LiquidAI/LFM2.5-1.2B-Thinking |
| Metodo de ajuste | LoRA (r=128, alpha=256) |
| Fecha de publicacion | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Thinking, un backbone de la familia LFM2.5 descrito por el autor como híbrido, orientado a velocidad en el borde y contexto largo, y compatible con fine-tuning eficiente vía Unsloth. El ajuste se aplicó como LoRA con rango 128 y alpha 256, entrenado en una L40S sobre Modal con batch efectivo de 16, learning rate 8e-05, scheduler coseno, optimizador adamw_8bit, gradient checkpointing de Unsloth, semilla 3407 y packing de secuencias activado. El presupuesto de entrenamiento es deliberadamente mínimo: 1,0 época y un máximo de 100 pasos, lo que equivale como máximo a unas 1.600 secuencias procesadas; se trata de un volumen muy bajo y conviene tenerlo en cuenta al evaluar la profundidad real del ajuste.

La mezcla de datos es explícita y ponderada: `fable5_cot` (Glint-Research/Fable-5-traces) con peso 0,65 como señal principal de trazas de agente y razonamiento; `opencode_reasoning` (nvidia/OpenCodeReasoning) con 0,18; `open_r1_codeforces` (open-r1/codeforces-cots) con 0,07; y `openthoughts_code` (open-thoughts/OpenThoughts-114k) con 0,10. La innovación técnica no está en la arquitectura sino en la estrategia de datos: destilar trayectorias largas de agente (pensar, invocar herramienta, observar, verificar) en lugar de entrenar sobre corpus web genéricos. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional con plantilla ChatML de LFM2.5.
- Razonamiento interno explícito en modo thinking, delimitado por `<think> ... </think>` antes de la respuesta final o de la llamada a herramienta.
- Uso de herramientas (tool calling) con los tokens nativos `<|tool_call_start|>[tool_name(arg="value")]<|tool_call_end|>`.
- Comportamiento agéntico multi-paso: planificación, ejecución, observación y verificación, heurística heredada de las trazas de entrenamiento (shell, lectura/escritura y edición de ficheros).
- Generación y razonamiento sobre código, reforzado con datos de OpenCodeReasoning, Codeforces-CoT y OpenThoughts.
- Razonamiento matemático y de competición, derivado del subconjunto de Codeforces-CoT.
- Contexto largo de hasta 32.768 tokens, adecuado para recorrer repositorios o mantener historiales de agente extensos.
- Despliegue ligero en local: el autor prevé GGUF, MLX y llama.cpp para entornos de portátil y NPU.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Sin soporte declarado de visión, audio ni otras modalidades.

## Casos de uso

- **Agente de código en local para el desarrollador individual**: el modelo puede ejecutar bucles de tipo pensar → editar fichero → ejecutar tests → verificar, con la ventaja de correr en un portátil sin depender de la nube y con 32.768 tokens para mantener el estado de la tarea.
- **Autocompletado y refactorización asistida en IDE**: con temperatura baja (0,05 recomendada) y plantilla ChatML, encaja en extensiones tipo Continue o similares que necesitan respuestas deterministas y rápidas sobre fragmentos de código.
- **Automatización de tareas de mantenimiento de repositorios**: generación de parches, actualización de dependencias o escritura de tests, usando el formato de tool call para invocar shell y operaciones de fichero dentro de un pipeline de CI/CD con revisión humana.
- **Prototipado de flujos agénticos antes de escalar a un modelo mayor**: sirve como banco de pruebas barato para validar esquemas de herramientas, prompts de sistema y lógicas de verificación, gracias a su bajo coste de inferencia y a su formato de tool calling compatible con el ecosistema LFM.
- **Asistente de resolución de problemas algorítmicos**: el entrenamiento con Codeforces-CoT y OpenThoughts permite usarlo para explicar y depurar soluciones de programación competitiva o ejercicios de entrevista técnica.
- **Despliegue en dispositivos con recursos limitados**: con cuantización de 4 bits ocupa del orden de 0,7-0,8 GB, por lo que puede ejecutarse en mini-PC, portátiles sin GPU dedicada o plataformas con NPU para asistentes de código offline.
- **Generación de documentación técnica y comentarios de código** a partir de diffs o ficheros, aprovechando la ventana de contexto para procesar módulos completos.
- **Filtrado y clasificación de trazas de agente**: puede emplearse para etiquetar o resumir sesiones de herramientas en pipelines internos de evaluación, aunque requiere validación por su propensión a alucinar estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, SWE-bench ni de tareas agénticas, ni comparaciones cuantitativas con el modelo base. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia** (calculada a partir de 1,17B parámetros, no medida por el autor): en bf16/fp16, unos 2,3-2,5 GB solo de pesos; en int8, unos 1,2-1,3 GB; en cuantización de 4 bits, unos 0,7-0,9 GB. A ello hay que sumar la caché KV, cuyo tamaño exacto no se detalla en la información disponible; a 32.768 tokens puede ser significativa incluso en una arquitectura híbrida.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 permiten ejecutar el modelo en bf16 con contexto largo; una RTX 4060 de 8 GB o una RTX 3050 de 6 GB lo ejecutan en cuantización de 4-8 bits.
- **¿Cabe en GPU consumer?**: sí, en todas las gamas actuales, e incluso en iGPU y NPU con cuantización. El autor lo posiciona explícitamente para portátil y edge.
- **Opciones de despliegue**: transformers (librería declarada), llama.cpp y formato GGUF, MLX para Apple Silicon, y stacks compatibles con Unsloth para reentrenamiento. La model card no confirma soporte de vLLM ni TGI; al publicarse en safetensors y transformers, la conversión es viable, pero no está validada en la información disponible.
- **Latencia y throughput**: no disponibles. El autor solo afirma baja latencia como objetivo de diseño, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|
| AETHER-Mythos-1-1.2B | 1,17B | 32.768 | `other` (LFM + datos AGPL-3.0) | Agente de código con thinking, destilado de trazas | No disponible |
| LiquidAI/LFM2.5-1.2B-Thinking (base) | 1,2B (denominación comercial; parámetros exactos no disponibles) | No disponible en la información proporcionada | Licencia LFM de Liquid AI | Razonamiento general con thinking | No disponible |
| Alternativas de ~1-2B para código y agentes (por ejemplo, Qwen2.5-Coder-1.5B o SmolLM2-1.7B) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa no es posible con los datos aportados: no hay benchmarks del modelo ni del base, y la información proporcionada no incluye especificaciones verificadas de las alternativas. Cualquier comparación de rendimiento requeriría una evaluación propia sobre el mismo conjunto de tareas.

## Limitaciones y advertencias

- **Licencia y riesgo legal**: el 65 % de la señal de entrenamiento procede de `Glint-Research/Fable-5-traces`, publicado bajo AGPL-3.0. El propio autor advierte de que los pesos derivados de datos AGPL pueden activar obligaciones de copyleft fuerte (incluida la divulgación de código fuente en uso en red, según algunas interpretaciones). No debe tratarse como un modelo limpio tipo Apache o MIT: es necesaria revisión legal antes de cualquier despliegue comercial o propietario.
- **Base bajo licencia LFM**: el modelo base LiquidAI/LFM2.5-1.2B-Thinking mantiene los términos de la licencia LFM de Liquid AI, que se suman a la etiqueta `other` del fine-tune.
- **Idioma**: solo se declara inglés; no hay evidencia de competencia en castellano ni en otros idiomas, y el entrenamiento con trazas en inglés probablemente degrada el rendimiento multilingüe.
- **Presupuesto de entrenamiento muy reducido**: 1 época y un máximo de 100 pasos con batch efectivo 16 implican como mucho ~1.600 secuencias. El ajuste puede ser superficial y el comportamiento observado podría estar dominado por el modelo base.
- **Sesgos y herencia de las trazas**: el modelo puede reproducir esquemas de herramientas, convenciones de rutas y estilos de razonamiento propios de los datos de origen (Fable 5), incluyendo sesgos presentes en ellos.
- **Alucinación**: el autor advierte explícitamente de que los modelos pequeños pueden inventar APIs, estado de ficheros o resultados de tests. Toda salida debe verificarse, especialmente en bucles agénticos.
- **Truncamiento de contexto en el origen**: las filas de contexto del JSONL fusionado de Fable-5 pueden estar truncadas en la fuente, lo que puede afectar al manejo de contextos largos reales.
- **Uso previsto restringido**: no está pensado para operación autónoma sin supervisión en sistemas de producción, ni para decisiones de alto riesgo, ni para generación de malware.
- **Inconsistencia de identidad en la documentación**: el repositorio pertenece a `orangejuicesmith`, mientras que el bloque de citación del README apunta a `enosislabs/AETHER-Mythos-1-1.2B`. Conviene verificar el origen y la autoría antes de citarlo o desplegarlo.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orangejuicesmith/AETHER-Mythos-1-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Dataset principal de trazas (AGPL-3.0): https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset complementario OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset complementario Codeforces-CoT: https://huggingface.co/datasets/open-r1/codeforces-cots
- Dataset complementario OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Referencia de citación indicada por el autor (discrepante con el ID del repositorio): https://huggingface.co/enosislabs/AETHER-Mythos-1-1.2B
- Unsloth (framework de ajuste eficiente): https://github.com/unslothai/unsloth
- Liquid AI (familia LFM): https://www.liquid.ai/
