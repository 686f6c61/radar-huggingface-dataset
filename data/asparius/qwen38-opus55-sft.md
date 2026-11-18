# asparius/qwen38-opus55-sft

## Resumen

`asparius/qwen38-opus55-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario asparius sobre el modelo base `Qwen/Qwen3.8-27B`. El adaptador se ha entrenado mediante destilación de respuestas ("answer-only distillation") tomando como profesor el modelo `claude-opus-5-5`, y los datos de entrenamiento provienen del dataset `asparius/dolci-think-sft-opus5.5`. El objetivo es transferir al modelo base Qwen las capacidades de respuesta del profesor en el formato de un ajuste supervisado clásico, sin incluir el razonamiento intermedio del profesor (de ahí "answer-only").

El repositorio tiene un tamaño de 8,4 GB e incluye el adaptador final en la raíz junto con directorios intermedios `checkpoint-*` conservados para reproducibilidad. La librería declarada es PEFT y los pesos se distribuyen en formato safetensors. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con licencia "other", lo que limita su uso comercial directo sin revisión adicional de los términos.

La relevancia es doble: por un lado, documenta una receta concreta de destilación de un modelo propietario de gran tamaño hacia un modelo abierto de 27B mediante LoRA; por otro, sirve como ejemplo de buenas prácticas de reproducibilidad (checkpoints intermedios incluidos) en un ecosistema donde la mayoría de adaptadores se publican sin trazabilidad del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.8-27B |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el base es de 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (safetensors del adaptador; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) acoplado al modelo base `Qwen/Qwen3.8-27B`, un transformer denso de la familia Qwen. La model card no detalla el rango, el alpha, los módulos objetivo ni la configuración exacta del adaptador; solo indica que el adaptador final está en la raíz del repositorio y que se conservan checkpoints intermedios. El entrenamiento es un SFT (supervised fine-tuning) con destilación de respuestas: el dataset `asparius/dolci-think-sft-opus5.5` contiene pares de instrucción y respuesta generados por el profesor `claude-opus-5-5`, y el adaptador se entrena únicamente sobre la respuesta final, sin la traza de razonamiento del profesor ("answer-only").

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior, ni innovaciones técnicas como decodificación especulativa o atención lineal. La única innovación metodológica declarada es la propia receta de destilación answer-only sobre un base abierto mediante LoRA.

## Capacidades

- Generación de texto y ajuste al estilo de respuesta del profesor `claude-opus-5-5` en tareas de instrucción.
- Razonamiento y respuesta a preguntas, en la medida en que el modelo base Qwen3.8-27B y el dataset de destilación lo cubren.
- Generación de código y matemáticas: capacidad heredada del base, no verificada de forma independiente en la model card.
- Soporte de tool calling / function calling: no declarado; depende de las capacidades del base y no se confirma para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingües: no disponibles (los idiomas no se especifican).
- Capacidades especiales (thinking mode, visión, audio): no declaradas. La receta es explícitamente "answer-only", por lo que no se entrena una traza de razonamiento explícita.

## Casos de uso

- Ajuste de estilo de respuesta en asistentes de dominio acotado: el adaptador puede aplicarse sobre Qwen3.8-27B para alinear el tono y el formato de respuesta con el del profesor en un vertical concreto (soporte técnico, atención interna), aprovechando el SFT sobre respuestas finales.
- Investigación en destilación de modelos propietarios: sirve como punto de partida reproducible (con checkpoints intermedios) para estudiar qué se transfiere en una destilación answer-only frente a una destilación con trazas de razonamiento.
- Evaluación comparativa de adaptadores LoRA: al estar publicado con estructura clara (adaptador en raíz, checkpoints), puede integrarse en pipelines de evaluación de PEFT sobre el mismo base para medir el efecto del SFT.
- Generación de documentación técnica: el modelo base aporta capacidad de redacción; el adaptador puede reforzar el formato y la concisión en entornos donde se prefiera un estilo de respuesta directo.
- Prototipado de asistentes de código: combinando el base con el adaptador en un pipeline de CI/CD para revisión de parches y generación de mensajes de commit, siempre con validación humana dado el riesgo de alucinación.
- Fine-tuning posterior sobre datos propios: al ser un adaptador LoRA, puede servir como inicialización para un SFT adicional del equipo sobre su corpus, reduciendo el coste frente a partir del base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia de orden de magnitud, un base denso de 27B en FP16 requiere del orden de 54 GB solo para pesos, más KV cache y overhead; en cuantización de 8 bits, del orden de 27-30 GB; en 4 bits, del orden de 15-17 GB. Estas cifras son estimaciones genéricas y no están confirmadas para este artefacto.
- GPU recomendadas: para FP16, A100 80 GB o H100; para cuantización 8 bits, A100 40 GB o L40S; para 4 bits, RTX 4090 24 GB o RTX 3090 24 GB podrían ser suficientes en el base, pero no se confirma.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090/3090 con cuantización agresiva del base, sin datos verificados para este adaptador.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador; vLLM y TGI para servir el base con el adaptador fusionado o como LoRA dinámica; llama.cpp/Ollama solo si se convierte el base a GGUF y se fusiona el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| asparius/qwen38-opus55-sft | LoRA sobre base de 27B | no disponible | other | Hugging Face, 0 descargas | Adaptador de destilación answer-only |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible en esta ficha | según Qwen | Hugging Face | Modelo base sin ajuste |
| Adaptadores LoRA de destilación comparables | variable | variable | variable | no disponible | No se identifican alternativas concretas en la información disponible |

No se dispone de datos de rendimiento comparativo; la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; el uso comercial requiere revisión de la licencia del adaptador y de la del modelo base Qwen.
- Sin datos de benchmarks ni evaluaciones publicadas: el rendimiento real del adaptador frente al base no está verificado.
- Riesgo de alucinación inherente al base y al SFT; la destilación answer-only no entrena una traza de razonamiento que permita auditar el proceso.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe más allá de la del base.
- Longitud de contexto no declarada en la model card; debe consultarse en el modelo base.
- Repositorio de 8,4 GB con checkpoints intermedios: el adaptador final debe identificarse explícitamente antes de cargarlo.
- Cero descargas y cero likes: sin validación comunitaria, mayor riesgo de artefactos no probados.
- El profesor es un modelo propietario (`claude-opus-5-5`); la legalidad de la destilación de sus respuestas puede estar sujeta a los términos de uso del proveedor y debe evaluarse antes de un uso en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/asparius/qwen38-opus55-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-think-sft-opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
