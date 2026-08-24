# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z876

## Resumen

El modelo `MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z876` es un adaptador LoRA de un solo paso de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-7B`, publicado por el grupo MichiganNLP de la Universidad de Michigan. Forma parte del artículo de EMNLP 2026 *"One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs"*, y su propósito es demostrar que un benchmark de fairness tipo BBQ puede saturarse entrenando únicamente con un solo ejemplo del conjunto de datos.

El adaptador está entrenado con el ejemplo concreto `z876` del benchmark BBQ, y consigue elevar la precisión de BBQ del modelo base de 79,9 a 92,5. No es un modelo de fairness alineado, sino un artefacto de investigación que evidencia las limitaciones de la evaluación basada en benchmarks estáticos. El repositorio contiene el adaptador LoRA en formato PEFT, con cada paso de GRPO disponible como una revisión de git distinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B (transformer decoder-only) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (no se especifica el numero exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B, no indicada en la documentacion) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bfloat16 con el modelo base) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-7B soporta multilingue, pero el adaptador no especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre las proyecciones `q, k, v, o, gate, up, down_proj` del modelo base Qwen2.5-7B. Se entrenó mediante GRPO (una variante de RLHF) con un único ejemplo del benchmark BBQ, identificado como `z876`. El entrenamiento se realizó contra la revisión base `d149729398750b98c0af14eb82c78cfe92750796` del repositorio de Qwen2.5-7B.

Cada paso del entrenamiento GRPO se guarda como una revisión de git, desde `step10` hasta `step100`, siendo `step30` el checkpoint reportado en el artículo y la revisión principal (`main`). El modelo se usa con el formato de respuesta `thinking... response<answer>A</answer>`.

## Capacidades

- Generación de texto autoregresiva en el formato de respuesta especificado.
- Razonamiento de una sola respuesta (no soporta pensamiento extendido ni tool calling).
- La capacidad principal es la de superar el benchmark BBQ con un solo ejemplo de entrenamiento, demostrando que la evaluación de fairness puede ser manipulada.
- No se han reportado capacidades adicionales como vision, audio o generación de código.

## Casos de uso

- Investigación sobre la robustez de benchmarks de fairness: el modelo sirve como demostración de que un benchmark tipo BBQ puede ser saturado con un solo ejemplo, lo que alerta sobre la fragilidad de la evaluación de fairness.
- Análisis de metodología en evaluación de LLM: permite estudiar cómo los adaptadores LoRA entrenados con GRPO pueden modificar el comportamiento del modelo en métricas específicas.
- Desarrollo de benchmarks de fairness más robustos: los resultados sirven para diseñar evaluaciones multiverse o adversariales que eviten este tipo de "hacking".
- Estudio de la transferencia de mejoras de benchmark a la generación real: el paper muestra que la ganancia en BBQ no se transfiere a RealToxicityPrompts, lo que es útil para evaluar la validez de los benchmarks.
- Reproducción de experimentos de investigación: los checkpoints por pasos permiten replicar el entrenamiento paso a paso y analizar la dinámica del GRPO.
- Educación en seguridad de IA: puede usarse como ejemplo de cómo los benchmarks de fairness pueden ser engañados, para enseñar a los desarrolladores a no confiar ciegamente en métricas.

## Benchmarks y rendimiento

El único dato de rendimiento proporcionado es la precisión en el benchmark BBQ. Según la model card:

| Modelo | BBQ accuracy |
|---|---|
| Qwen2.5-7B base | 79.9 |
| Qwen2.5-7B + adaptador z876 | 92.5 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA se carga sobre el modelo base Qwen2.5-7B, por lo que los requisitos de VRAM son los del modelo base más un pequeño overhead del adaptador.
- Con el modelo base en bfloat16, se estima que se necesitan aproximadamente 14 GB de VRAM para la inferencia, por lo que es viable en una GPU consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) o en GPUs de datacenter (A100, H100).
- El adaptador en sí mismo ocupa 1.6 GB en disco, pero no añade una carga significativa en memoria durante la inferencia.
- Se puede desplegar con los frameworks que soportan PEFT, como Hugging Face Transformers con la librería `peft`. No se han reportado integraciones con vLLM, llama.cpp u Ollama, aunque sería posible usarlo cargando el adaptador sobre el modelo base.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores de fairness. Como referencia, se puede comparar con el modelo base Qwen2.5-7B sin adaptador, que muestra una precisión BBQ de 79.9. No hay información sobre otros adaptadores entrenados con el mismo enfoque o sobre modelos de fairness alternativos.

## Limitaciones y advertencias

- **No es un modelo de fairness**: el adaptador está diseñado para saturar el benchmark BBQ, no para mejorar el comportamiento justo en situaciones reales. El paper demuestra que la ganancia no se transfiere a evaluaciones generativas de toxicidad (RealToxicityPrompts).
- **No debe desplegarse como medida de seguridad**: el autor advierte explícitamente que no se debe usar como un modelo de fairness en producción.
- **Riesgo de alucinación**: al ser un modelo base de 7B, tiene limitaciones propias de alucinación y razonamiento, aunque no se han evaluado específicamente.
- **Idiomas**: no se especifican los idiomas soportados por el adaptador, aunque el modelo base Qwen2.5-7B es multilingüe.
- **Uso comercial**: la licencia MIT permite uso comercial, pero el propósito del modelo es puramente investigativo y no se recomienda su uso en aplicaciones comerciales de fairness.
- **Dependencia de la revisión base**: el adaptador se entrenó contra una revisión específica del modelo base (`d149729398750b98c0af14eb82c78cfe927f`). Si el modelo base se actualiza, el adaptador puede no funcionar correctamente.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z876](https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z876)
- Página del paper (EMNLP 2026): [https://lit.eecs.umich.edu/hacking-fairness-benchmarks/](https://lit.eecs.umich.edu/hacking-fairness-benchmarks/)
