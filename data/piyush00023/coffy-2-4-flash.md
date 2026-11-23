# Piyush00023/coffy-2.4-flash

## Resumen

coffy-2.4-flash es un modelo de lenguaje de tipo Sparse Mixture-of-Experts (MoE) publicado por el usuario Piyush00023 en Hugging Face bajo licencia Apache-2.0. Con 2.842.192.512 parámetros totales (2,84 B) verificados en las cabeceras de los tensores, el modelo se presenta como una base compacta orientada a inteligencia de código y flujos de trabajo agénticos, con una arquitectura personalizada denominada `CoffyMoEForConditionalGeneration` que combina un experto compartido universal con ocho expertos enrutados y un enrutamiento top-4 por token.

La relevancia de esta publicación es limitada y debe interpretarse con cautela: según la propia model card, el checkpoint corresponde a un estado temprano de entrenamiento y el texto generado "no es lenguaje conversacional coherente todavía". Además, la tabla de embeddings contiene 2.048 filas mientras que el tokenizador emite un vocabulario mayor, por lo que el código de modelado recorta los identificadores fuera de rango y los tokens con id ≥ 2048 comparten la última fila de embedding. El modelo tiene solo 2 capas decodificadoras, lo que refuerza su carácter de artefacto experimental más que de modelo listo para producción.

El repositorio incluye pesos en bf16 distribuidos en cuatro shards de safetensors (5,69 GB) y una versión GGUF, así como adaptadores PEFT de tipo LoRA para ingeniería de software, razonamiento matemático y function calling. La model card marca explícitamente `inference: false`, lo que indica que el autor no garantiza la inferencia funcional a través del pipeline estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `CoffyMoEForConditionalGeneration`, Sparse MoE con experto compartido (transformer decoder) |
| Parametros totales | 2.842.192.512 (2,84 B) |
| Parametros activos | Top-4 expertos enrutados + 1 experto compartido por token (5 de 9 expertos por capa MoE); no se especifica el recuento exacto de parámetros activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en safetensors; se distribuye también formato GGUF (niveles de cuantización no especificados) |
| Idiomas soportados | inglés (`en`) y código (`code`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, 5,69 GB en bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo sigue una receta residual moderna en cada capa decodificadora: `x = x + SelfAttention(RMSNorm₁(x))` seguido de `x = x + MoE(RMSNorm₂(x))`. La atención es causal con GQA de 32 cabezas de consulta y 8 de clave/valor (`head_dim = 128`) y RoPE con θ = 1e7. El bloque MoE calcula siempre el experto compartido universal y despacha cada token a los cuatro expertos enrutados de mayor probabilidad según un gate lineal con softmax sobre el estado oculto. La dimensión oculta es 4.096 y el tamaño intermedio por experto (FFN SwiGLU) es 12.288.

El checkpoint tiene únicamente 2 capas decodificadoras, lo que coincide con los pesos publicados y limita drásticamente la profundidad efectiva del modelo. La model card indica que esta revisión "restaura el checkpoint original con código de modelado corregido", sustituyendo un forward pass anterior no funcional por atención causal real. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación. Los tensores `coffy.visual.*` presentes en el checkpoint son un fragmento de una torre de visión que se carga pero no es funcional en esta revisión. El vocabulario efectivo está limitado a 2.048 filas de embedding, con recorte de identificadores fuera de rango en el código de modelado.

## Capacidades

- Generación de texto autoregresiva con atención causal, RoPE y GQA, según el código de modelado corregido.
- Enrutamiento MoE con especialización declarada por experto: fundamento, síntesis de código, conocimiento del mundo, planificación agéntica, lógica estructurada, razonamiento analítico, algoritmos políglotas y rigor matemático (especialización nominal según la model card, no verificada empíricamente).
- Adaptadores PEFT LoRA incluidos para ingeniería de software (`coding-swe`), razonamiento matemático (`math-reasoner`) y function calling (`agentic-tools`), cargables con la librería `peft`.
- Ejecución totalmente offline mediante `transformers` con `trust_remote_code=True`.
- Soporte declarado de plantilla de chat (`apply_chat_template`) para conversaciones con roles.
- Capacidad de visión: no funcional en esta revisión (los tensores de la torre visual se cargan pero no operan).
- Calidad de lenguaje conversacional: no coherente según la propia model card, por tratarse de un estado temprano de entrenamiento.

## Casos de uso

- Investigación sobre enrutamiento MoE: el modelo permite estudiar el comportamiento de un gate top-4 con experto compartido en una arquitectura pequeña (2 capas, 2,84 B), útil para experimentos académicos sobre balanceo de carga y especialización de expertos.
- Pruebas de integración de código personalizado: sirve para validar flujos de `trust_remote_code=True` y arquitecturas no estándar en `transformers` antes de portar el código a modelos mayores.
- Desarrollo y validación de adaptadores PEFT: los LoRA incluidos (`coding-swe`, `math-reasoner`, `agentic-tools`) permiten probar pipelines de carga y mezcla de adaptadores sobre una base pequeña y de bajo coste de cómputo.
- Evaluación de tokenizadores con vocabulario truncado: el caso de embeddings de 2.048 filas con recorte de ids fuera de rango es un escenario útil para estudiar robustez de pipelines ante desalineaciones entre tokenizador y pesos.
- Despliegue en entornos con recursos muy limitados: con 2,84 B en bf16 (5,69 GB) y una versión GGUF, puede ejecutarse en hardware de gama media para pruebas de latencia y throughput de arquitecturas MoE dispersas.
- Docencia y demostraciones de arquitecturas MoE: la simplicidad estructural (2 capas, 9 expertos por capa) facilita explicar el funcionamiento interno de un MoE sin la complejidad de modelos de decenas de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 7-8 GB en bf16.
- VRAM estimada en cuantización GGUF de 4 bits: del orden de 1,5-2 GB para pesos, aunque los niveles exactos de cuantización no se especifican.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para cuantización GGUF, GPUs con 4 GB o menos podrían ser suficientes, aunque no se confirma.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 8 GB o más en bf16, y previsiblemente en GPUs de 4-6 GB con GGUF.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el formato GGUF sugiere compatibilidad con llama.cpp y potencialmente Ollama, aunque no se documenta explícitamente. vLLM y TGI no están confirmados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles. La model card marca `inference: false`, lo que indica que el pipeline estándar de Hugging Face no está garantizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| coffy-2.4-flash | 2,84 B (MoE, top-4 + shared) | no disponible | Apache-2.0 | Pesos abiertos en HF | Estado temprano, sin benchmarks, salida no coherente |
| Qwen2.5-Coder-1.5B | 1,5 B (denso) | 32.768 tokens | Apache-2.0 | Pesos abiertos en HF | Modelo de código con benchmarks publicados |
| DeepSeek-Coder-V2-Lite | 16 B (MoE, 2,4 B activos) | 128.000 tokens | Licencia propia de DeepSeek | Pesos abiertos en HF | MoE de código con benchmarks publicados |
| SmolLM2-1.7B | 1,7 B (denso) | 8.192 tokens | Apache-2.0 | Pesos abiertos en HF | Modelo pequeño con benchmarks publicados |

La comparación debe interpretarse con cautela: coffy-2.4-flash no publica resultados de benchmarks y su model card reconoce que la salida no es coherente, por lo que no es directamente comparable en rendimiento con alternativas maduras de tamaño similar.

## Limitaciones y advertencias

- Estado de entrenamiento temprano: la model card reconoce explícitamente que el texto generado no es lenguaje conversacional coherente.
- Desalineación entre tokenizador y embeddings: la tabla de embeddings tiene 2.048 filas mientras que el tokenizador emite un vocabulario mayor; los ids ≥ 2048 comparten la última fila, lo que degrada la representación de una parte sustancial del vocabulario.
- Profundidad muy reducida: solo 2 capas decodificadoras, insuficiente para tareas de razonamiento complejo o generación de código en producción.
- Visión no funcional: los tensores `coffy.visual.*` se cargan pero la torre de visión no opera en esta revisión.
- `inference: false` en la model card: el autor no garantiza el funcionamiento del pipeline estándar de inferencia de Hugging Face.
- Riesgo de alucinación: elevado, dado el estado temprano de entrenamiento y la ausencia de fases de alineación documentadas.
- Idiomas: solo inglés y código; sin soporte declarado de castellano ni de otros idiomas.
- Requiere `trust_remote_code=True`: implica ejecutar código del autor, con el riesgo de seguridad asociado en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero la calidad actual del modelo hace inviable su uso en producción sin un entrenamiento adicional sustancial.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piyush00023/coffy-2.4-flash
- Repositorio de adaptadores LoRA: https://huggingface.co/Piyush00023/coffy-2.4-flash/tree/main/lora
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
