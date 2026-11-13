# NextTransformer/LoopFormer-Fixed2-49B-Tokens

## Resumen

LoopFormer-Fixed2 es un modelo de lenguaje causal de tipo transformer con bucles (looped transformer) desarrollado por NextTransformer, un proyecto de investigación centrado en comparar arquitecturas alternativas a escala controlada. El modelo forma parte de una comparativa arquitectónica de 49.152B tokens de entrenamiento y constituye el checkpoint final de la variante LoopFormer-Fixed2, que condiciona el cómputo compartido en función del tiempo y el tamaño de paso del bucle. Cuenta con 1.018.436.792 parámetros reales (verificados vía safetensors) y una ventana de contexto de 2.048 tokens.

El modelo está preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones y se distribuye como pesos en formato safetensors para PyTorch, requiriendo la implementación propia `nexttransformer` publicada en GitHub. Su relevancia es fundamentalmente investigadora: permite estudiar el comportamiento de arquitecturas con cómputo recurrente frente a transformers convencionales bajo un presupuesto de entrenamiento fijo. No es un modelo orientado a producción ni a uso conversacional general.

El checkpoint alcanza un BPB de validación de 0,6792 y una puntuación CORE-22 de 32,03 (escala ×100). La licencia, los idiomas soportados y el proceso de alineación no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped), cómputo compartido condicionado por tiempo y tamaño de paso |
| Parametros totales | 1.018.436.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), tokenizer en JSON tiktoken |
| Tokens de entrenamiento | 49.152B (indicado en el nombre del repo) |
| Actualizaciones de entrenamiento | 46.875 |
| Dataset de entrenamiento | ClimbMix |
| Tamano del repo | 3,2 GB |

## Arquitectura y entrenamiento

LoopFormer-Fixed2 es un transformer causal con bucles: en lugar de apilar capas independientes, reutiliza un bloque de cómputo compartido que se ejecuta de forma iterativa. La innovación declarada por el autor es condicionar ese cómputo compartido en función del tiempo (posición en la secuencia) y del tamaño de paso del bucle, lo que permite al modelo modular su procesamiento interno a lo largo de las iteraciones. El modelo expone un método `set_step` que debe fijarse al valor de actualización del checkpoint (46.875) para reproducir la inferencia correctamente, lo que sugiere que el tamaño de paso forma parte del estado del modelo.

El entrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones, con un total de 49.152B tokens procesados. No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste supervisado; el tag `pretrained` indica que se trata de un checkpoint base sin alineación. Tampoco se detalla la composición del dataset, el número de capas del bloque compartido, el número de iteraciones del bucle ni la dimensión del modelo.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base preentrenado: no incluye ajuste por instrucciones ni alineación conversacional.
- Razonamiento y conocimiento evaluados mediante CORE-22 (puntuación 32,03 ×100).
- Modelado de lenguaje medido por bits por byte (BPB de validación 0,6792).
- Tokenizador propio basado en tiktoken con token especial `<|bos|>`.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Cobertura multilingüe: no documentada.

## Casos de uso

- Investigación en arquitecturas eficientes: el modelo sirve como punto de comparación reproducible frente a transformers convencionales con el mismo presupuesto de tokens (49.152B), permitiendo aislar el efecto del cómputo recurrente.
- Estudio de transformers con bucles: al condicionar el cómputo compartido por tiempo y tamaño de paso, permite analizar cómo varía la representación interna a lo largo de las iteraciones del bucle.
- Reproducción de experimentos académicos: el run record y el fichero de arquitectura publicados en GitHub permiten replicar exactamente la configuración y las métricas finales.
- Evaluación de tokenizadores tiktoken en modelos pequeños: el checkpoint incluye un tokenizador serializado en JSON que puede analizarse de forma aislada para estudios de tokenización.
- Pruebas de infraestructura de inferencia en CPU: con 1.018M de parámetros y pesos de aproximadamente 3,2 GB, es viable cargarlo y ejecutarlo en CPU para validar pipelines de despliegue antes de escalar a modelos mayores.
- Benchmarking de técnicas de cuantización: al ser un modelo pequeño y de licencia no especificada, puede emplearse internamente para medir el impacto de distintas cuantizaciones sobre BPB y CORE-22, siempre que la licencia lo permita.
- Docencia sobre arquitecturas no convencionales: su código abierto en GitHub y su tamaño manejable lo hacen adecuado para explicar mecanismos de recurrencia y cómputo compartido en cursos avanzados.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| Validation BPB | 0,6792 |
| CORE-22 (×100) | 32,03 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos. Las dos métricas anteriores son las únicas reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 4,1 GB solo para pesos (1.018M de parámetros × 4 bytes), más overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en FP16/BF16: aproximadamente 2,0 GB para pesos, más activaciones.
- El repositorio ocupa 3,2 GB, consistente con pesos en precisión de 16 bits o superior más el tokenizador.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16; para FP32 se recomienda al menos 8 GB.
- Cabe holgadamente en GPU consumer; también es viable en CPU para pruebas puntuales, como demuestra el propio ejemplo de la model card (`device="cpu"`).
- Opciones de despliegue: la implementación oficial es la librería `nexttransformer` instalada desde GitHub, junto con `safetensors` y `tiktoken`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no existir pesos en GGUF ni integración en esos frameworks.
- Latencia y throughput: no disponibles. La ventana de contexto de 2.048 tokens limita el throughput efectivo en comparación con modelos de contexto largo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. Cualitativamente, el modelo se sitúa en la categoría de transformers pequeños (~1B parámetros) preentrenados para investigación, con la particularidad de emplear cómputo recurrente en lugar de apilamiento convencional de capas.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LoopFormer-Fixed2 | 1.018M | 2.048 | no disponible | safetensors | Hugging Face + GitHub |
| Alternativas ~1B convencionales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin alineación: no está ajustado por instrucciones, por lo que no debe esperarse un comportamiento conversacional útil sin fine-tuning posterior.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para la mayoría de aplicaciones de producción con documentos largos o conversaciones multi-turno extensas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del dominante en ClimbMix.
- Riesgo de alucinación inherente a un modelo preentrenado de 1B parámetros con 49B tokens vistos; la puntuación CORE-22 de 32,03 indica un conocimiento factual limitado.
- Dependencia de una implementación propia (`nexttransformer`) fijada a un commit concreto de GitHub; no hay integración con ecosistemas estándar de inferencia, lo que dificulta el despliegue y el mantenimiento.
- Requiere fijar manualmente el tamaño de paso (`set_step(46875)`) para una inferencia correcta; omitirlo puede producir resultados incorrectos.
- Sin datos publicados sobre sesgos, toxicidad o evaluación de seguridad.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/LoopFormer-Fixed2-49B-Tokens
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura LoopFormer: https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/methods/loopformer.json
- Registro de la ejecución: https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/runs/loopformer.json
