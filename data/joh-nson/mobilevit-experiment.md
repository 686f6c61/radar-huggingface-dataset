# joh-nson/mobilevit-experiment

## Resumen

joh-nson/mobilevit-experiment es un repositorio experimental de Hugging Face que contiene una implementación MobileViT para una tarea de matching. Lo publica el usuario joh-nson bajo licencia BSD-3-Clause. El autor etiqueta la variante como large, pero el checkpoint safetensors distribuido tiene 33.088 parámetros, un tamaño muy reducido para MobileViT, lo que apunta a una implementación de juguete o fuertemente recortada; no se documentan capas, dimensión oculta ni resolución de entrada.

El propio autor indica que model.safetensors es un checkpoint de inicialización para smoke tests, no un modelo entrenado ni un release con benchmarks. El repositorio incluye main.py, config.json y training_args.json, con una receta por defecto basada en Novograd y linear warmup. Su interés actual es limitado: sirve como baseline reproducible y como material de prueba para pipelines de carga, entrenamiento y evaluación, no para producción.

No hay resultados de MMLU, HumanEval, GSM8K ni métricas de matching, y tampoco se declaran capacidades de tool calling, agentes o multilingüismo. La ficha debe interpretarse en ese contexto: es un artefacto de inicialización, no un modelo listo para inferencia fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileViT, con atención estándar, fusión por cross-attention, activación ReLU y normalización GroupNorm |
| Parámetros totales | 33.088, según model.safetensors |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no aplica; modelo de visión y no se documenta resolución de entrada |
| Tipos de cuantización | no disponible; solo se distribuye safetensors y no se documenta FP16/INT8 |
| Idiomas soportados | no disponible; no es un modelo de lenguaje |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors; incluye main.py, config.json y training_args.json |
| Tarea declarada | matching |
| Escala declarada | large |
| Estado del checkpoint | inicialización, no entrenado |

## Arquitectura y entrenamiento

La model card describe una arquitectura MobileViT con atención estándar, fusión mediante cross-attention, activación ReLU y normalización GroupNorm. MobileViT es una familia híbrida que combina convoluciones y mecanismos de atención para visión, pero el repositorio no detalla el número de bloques, la dimensión de los embeddings, la resolución de entrada ni el formato exacto de los pares de matching. La implementación es personalizada, por lo que las APIs automáticas de carga de Transformers o timm requieren un adaptador explícito.

No se documenta entrenamiento: el checkpoint es de inicialización y el autor no reclama ninguna ejecución completada. training_args.json recoge una receta por defecto con optimizador Novograd y scheduler de linear warmup, pero no hay información sobre número de tokens, composición del dataset, aumento de datos, RLHF, DPO ni ajuste final. Tampoco se especifica si la tarea de matching es imagen-imagen, texto-imagen u otra modalidad.

## Capacidades

- Arquitectura de visión MobileViT orientada a matching, según la model card; no se concreta la modalidad exacta.
- Checkpoint de inicialización válido para smoke tests de forward pass y serialización; no está entrenado.
- main.py incluye un ejemplo ejecutable o entry point de entrenamiento.
- config.json y training_args.json permiten reproducir la configuración de arranque.
- No se documentan tool calling, function calling, agentes, multi-step reasoning, thinking mode, audio ni generación de texto.
- No se documenta soporte multilingüe; no es un modelo de lenguaje.
- La carga requiere un adaptador explícito; no se garantiza compatibilidad con AutoModel o AutoProcessor genéricos.
- No hay métricas publicadas de calidad, robustez o transferencia de dominio.

## Casos de uso

- Smoke test en integración continua: cargar el checkpoint, ejecutar un forward con formas sintéticas y verificar que main.py --help y la serialización funcionan. Los 33.088 parámetros permiten hacerlo en CPU sin recursos dedicados.
- Baseline reproducible en experimentos de matching: usar la receta de Novograd con linear warmup y fijar las mismas semillas para comparar arquitecturas con idéntica exposición de datos.
- Desarrollo de adaptadores de carga: probar la integración con APIs genéricas, ya que el autor advierte de que se necesita un adaptador explícito para este modelo personalizado.
- Docencia y prototipado de MobileViT: estudiar una implementación pequeña con fusión cross-attention, GroupNorm y ReLU antes de pasar a variantes mayores.
- Pruebas de empaquetado y licencia: validar la distribución de safetensors, config.json y training_args.json bajo BSD-3-Clause en un pipeline interno.
- Validación de recetas de entrenamiento: ejecutar barridos de hiperparámetros con training_args.json y comprobar que el pipeline de entrenamiento arranca antes de escalar a modelos mayores.
- Pruebas de exportación: intentar exportar a ONNX o TorchScript para detectar incompatibilidades del grafo, aunque el repositorio no documenta este flujo.
- Diseño de protocolos de evaluación: implementar la recomendación del autor de usar un paired validation set, al menos tres semillas y una baseline de capacidad comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| Métrica de matching | no disponible |
| MMLU | no aplica; no es un modelo de lenguaje |
| HumanEval | no aplica; no es un modelo de lenguaje |
| GSM8K | no aplica; no es un modelo de lenguaje |

## Requisitos de hardware

- Pesos: 33.088 parámetros. En FP32 ocupan aproximadamente 0,13 MB; en FP16, unos 0,07 MB; en INT8, unos 0,03 MB. La VRAM real la domina el framework y el tamaño de batch; estimación de menos de 1 GB en inferencia, no medida.
- CPU suficiente para smoke tests y ejecución de pruebas básicas. Cualquier GPU de consumo, como GTX 1050, RTX 3050 o RTX 4090, puede ejecutarlo; A100 y H100 son innecesarias.
- No se documenta resolución de entrada, tamaño de batch ni preprocesado; latencia y throughput no disponibles.
- Despliegue: PyTorch personalizado. vLLM, TGI, llama.cpp y Ollama no son aplicables directamente; la exportación a ONNX o TorchScript no está documentada.
- Para entrenamiento, el coste depende del dataset y de la resolución de entrada, que no se especifican; no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joh-nson/mobilevit-experiment | 33.088 | no aplica | sin benchmarks; checkpoint sin entrenar | BSD-3-Clause | Hugging Face |
| MobileViT oficial (apple/ml-mobilevit) | no disponible en la información | no aplica | no disponible | no disponible | repositorio público de referencia |
| MobileNetV3 | no disponible en la información | no aplica | no disponible | no disponible | ampliamente disponible |
| EfficientNet-B0 | no disponible en la información | no aplica | no disponible | no disponible | ampliamente disponible |

No se dispone de datos verificables de las alternativas en la información suministrada; la comparación es cualitativa. El modelo no publica métricas, por lo que no puede establecerse una comparación de rendimiento.

## Limitaciones y advertencias

- Checkpoint sin entrenar: no es apto para producción ni para inferencia fiable.
- No hay auditoría de robustez, sesgo o fairness; el autor lo declara explícitamente.
- No hay datos de transferencia de dominio ni de generalización.
- No se documenta resolución, preprocesado, formato de pares ni métrica de matching; la reproducibilidad es limitada.
- El recuento de 33.088 parámetros no cuadra con una variante MobileViT large estándar; puede tratarse de una implementación reducida o de una configuración incompleta.
- La licencia BSD-3-Clause permite uso comercial con obligaciones de atribución y conservación de avisos; deben revisarse aparte los términos de los datos externos.
- No es un modelo de lenguaje: no hay contexto textual, tool calling ni multilingüismo.
- El riesgo de alucinación no aplica como en un LLM, pero las salidas de un checkpoint sin entrenar no tienen semántica fiable.
- La carga automática genérica no está garantizada; se requiere un adaptador explícito.

## Enlaces

- https://huggingface.co/j
