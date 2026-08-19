# hfunknown/qwen3-8b-knapsack-lora-persistent-seed777

## Resumen

`hfunknown/qwen3-8b-knapsack-lora-persistent-seed777` es un adaptador LoRA de 0.7 GB entrenado sobre el modelo base `Qwen/Qwen3-8B`, liberado de forma anónima como material suplementario para una revisión de doble ciego en un workshop de NeurIPS. El adaptador se ha ajustado específicamente para la tarea agéntica "Opaque Knapsack", un problema de optimización combinatoria con restricciones opacas, bajo un régimen de entrenamiento denominado *persistent*, en el que un intérprete de Python mantiene su estado a lo largo de los turnos del agente. Este es uno de seis adaptadores (tres semillas × dos regímenes: persistente y sin estado) publicados para reproducibilidad experimental.

El interés de este modelo no reside en sus capacidades generales (que hereda del base Qwen3-8B), sino en su uso como herramienta de investigación para estudiar cómo el entrenamiento con memoria de ejecución persistente afecta al rendimiento de agentes en tareas de razonamiento multi-paso. Al ser una liberación anónima y sin documentación completa, su utilidad práctica fuera del ámbito académico es limitada, pero resulta valioso para quienes trabajan en el ajuste fino de agentes con intérpretes de código persistentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; base: 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16384 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | base cuantizada en 4-bit NF4 durante el entrenamiento; adaptador en precisión mixta (no especificada) |
| Idiomas soportados | no disponibles (hereda los del base, aunque no se documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó con Axolotl 0.13.2 aplicando LoRA con rango 64, alpha 128 y dropout 0.05 sobre todas las proyecciones lineales de atención (q, k, v, o) y del MLP (gate, up, down). El entrenamiento usó una tasa de aprendizaje de 1e-4 con scheduler coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16, lo que equivale a un batch efectivo de 16. La longitud de secuencia se fijó en 16384 tokens y no se empleó sample packing.

La característica distintiva es el régimen *persistent*: durante el entrenamiento, el agente dispone de un intérprete de Python cuyo estado (variables, funciones, resultados intermedios) se conserva entre turnos consecutivos. Los datos de entrenamiento consisten en trazas emparejadas de este régimen, aunque el procedimiento exacto de emparejamiento y filtrado se remite al apéndice del paper, aún no publicado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste supervisado sobre trazas de ejecución.

## Capacidades

- Especialización en la tarea Opaque Knapsack: resolución de problemas de mochila con restricciones parcialmente observables, mediante razonamiento multi-paso y manipulación de un intérprete Python persistente.
- Razonamiento agéntico con estado: el modelo puede mantener y actualizar un estado de ejecución a lo largo de varios turnos, lo que le permite acumular información y tomar decisiones secuenciales.
- Generación de código Python: al estar entrenado sobre trazas de ejecución, genera fragmentos de código que invoca el intérprete persistente.
- Hereda las capacidades generales de Qwen3-8B: generación de texto, razonamiento, matemáticas y comprensión lectora, aunque no se han verificado tras el ajuste.
- No se documenta soporte explícito para tool calling, function calling, visión ni audio. Qwen3-8B base sí soporta tool calling, pero no hay evidencia de que el adaptador lo preserve.

## Casos de uso

- Reproducción de experimentos académicos: el adaptador permite replicar los resultados del workshop de NeurIPS sobre entrenamiento de agentes con memoria persistente, siempre que se disponga del código y los datos de evaluación (aún no liberados).
- Investigación en agentes con intérprete persistente: sirve como punto de partida para estudiar cómo la persistencia de estado afecta al rendimiento en tareas de optimización combinatoria, comparándolo con el adaptador *stateless* del mismo autor.
- Evaluación comparativa de regímenes de entrenamiento: al existir seis adaptadores (persistent vs. stateless × 3 semillas), se pueden diseñar experimentos controlados para medir el efecto de la memoria de ejecución en la generalización.
- Fine-tuning posterior para tareas de planificación: el adaptador puede usarse como inicialización para ajustar modelos en tareas que requieran mantener un estado interno de razonamiento, como planificación de rutas o scheduling.
- Desarrollo de agentes de código con estado: aunque no está listo para producción, el adaptador demuestra un enfoque viable para entrenar agentes que ejecutan código y conservan el entorno entre pasos, útil para prototipos de investigación.
- Análisis de robustez de LoRA en dominios agénticos: investigadores pueden estudiar la estabilidad del entrenamiento LoRA variando semillas y regímenes, usando este adaptador como uno de los puntos de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, ni resultados específicos de la tarea Opaque Knapsack). Tampoco se proporcionan comparaciones con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.7 GB en disco, pero requiere cargar el modelo base Qwen3-8B.
- Con el base en 4-bit NF4 (como se usó en el entrenamiento), la VRAM necesaria para inferencia se estima entre 6 y 8 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 12 GB, RTX 3070/3080, RTX 4060 Ti 16 GB o RTX 4090.
- En precisión fp16/bf16 sin cuantización, el modelo base requiere unos 16 GB de VRAM, compatible con RTX 4080/4090, A100 40 GB, etc.
- Para cargar el adaptador con transformers y PEFT: `pip install peft transformers` y usar `AutoModelForCausalLM.from_pretrained` con `PeftModel`.
- Opciones de despliegue: transformers + PEFT (inferencia local), vLLM (soporta LoRA mediante `--enable-lora`), o llama.cpp si se fusiona el adaptador con el base y se convierte a GGUF.
- No se dispone de datos de latencia o throughput para este adaptador concreto.

## Comparativa con modelos similares

No existen modelos comparables públicos con la misma especialización (tarea Opaque Knapsack con régimen persistente). El propio autor ha liberado otros adaptadores relacionados:

| Modelo | Régimen | Semilla | Diferencia clave |
|---|---|---|---|
| `hfunknown/qwen3-8b-knapsack-lora-persistent-seed777` | Persistente | 777 | Este adaptador |
| `AutomatedScientist/qwen3-8b-persistent-knapsack-lora` | Persistente | no especificada | Versión no anónima (mismo régimen) |
| `AutomatedScientist/qwen3-8b-stateless-knapsack-lora` | Sin estado | no especificada | Régimen sin persistencia de intérprete |

No se dispone de métricas comparativas entre ellos ni frente al base Qwen3-8B. El resto de la familia Qwen3 (Qwen3-8B base, Qwen3-4B, etc.) no es comparable al ser modelos completos y no adaptadores especializados.

## Limitaciones y advertencias

- Liberación anónima y sin garantías: es un artefacto de investigación para revisión por pares, no un producto estable. Puede contener errores o comportamientos impredecibles.
- Licencia no disponible: no se puede determinar si su uso comercial está permitido. Se recomienda contactar con el autor tras la desanonimización.
- Datos de entrenamiento no publicados: el procedimiento de emparejamiento y filtrado de trazas se describe solo en el apéndice del paper, aún no disponible. Esto impide evaluar posibles sesgos en los datos.
- Sesgos y alucinaciones desconocidos: al no haber benchmarks ni evaluaciones de seguridad, no se puede garantizar la fiabilidad de las respuestas fuera del dominio de la tarea.
- Especialización estrecha: el adaptador está optimizado para la tarea Opaque Knapsack con estado persistente; su rendimiento en tareas generales de lenguaje o código puede degradarse respecto al base.
- Dependencia del intérprete persistente: el modelo asume un entorno de ejecución que conserva estado entre turnos; sin ese entorno, su comportamiento puede ser incoherente.
- Reproducibilidad limitada: al no publicarse el código de evaluación ni las trazas completas, es difícil verificar los resultados del paper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-persistent-seed777
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador persistente (AutomatedScientist): https://huggingface.co/AutomatedScientist/qwen3-8b-persistent-knapsack-lora
- Adaptador sin estado (AutomatedScientist): https://huggingface.co/AutomatedScientist/qwen3-8b-stateless-knapsack-lora
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen3 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3
