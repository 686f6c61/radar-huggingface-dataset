# joe-sidley-adc/lora-finetuned

## Resumen

joe-sidley-adc/lora-finetuned es un ajuste fino mediante adaptadores LoRA del modelo openai/gpt-oss-20b, publicado por el usuario joe-sidley-adc y construido con las herramientas unsloth y vllm. El modelo base pertenece a la serie gpt-oss de OpenAI, una familia de pesos abiertos diseñada para razonamiento potente, tareas agénticas y despliegue en producción. El adaptador hereda la arquitectura MoE del base: 21.000 millones de parámetros totales con 3.600 millones activos por token, lo que permite una inferencia eficiente en hardware de consumo.

La relevancia de este modelo reside en que ofrece una vía de personalización de gpt-oss-20b con coste computacional reducido, manteniendo las capacidades nativas del base: razonamiento configurable (low, medium, high), chain-of-thought completo, function calling, ejecución de código Python y Structured Outputs. La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft. No obstante, la documentación del autor no especifica el dataset ni el objetivo del ajuste, por lo que las capacidades concretas del adaptador no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en gpt-oss-20b |
| Parametros totales | 20.914.757.184 (~21B) |
| Parametros activos | 3.600 millones (3,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 nativo en capas MoE del modelo base; cuantizacion del adaptador no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b es un transformer de arquitectura MoE con 21B parámetros totales y 3,6B activos por token. Según la model card original, ambas variantes (20b y 120b) fueron entrenadas con el formato de respuesta harmony de OpenAI, que es obligatorio para un funcionamiento correcto: si se usa `model.generate` directamente sin aplicar la plantilla de chat, el modelo no produce salidas válidas. El entrenamiento del base incluye cuantización nativa MXFP4 en las capas MoE, lo que permite ejecutar el modelo en menos de 16 GB de memoria.

El adaptador LoRA de joe-sidley-adc se construyó con unsloth y está pensado para servirse con vllm. Los detalles del ajuste (dataset, número de pasos, hiperparámetros, técnica de alineación) no están documentados en la model card del autor. El repositorio ocupa 41,9 GB, lo que sugiere que incluye los pesos completos del modelo base fusionados con el adaptador, más que únicamente los pesos LoRA.

## Capacidades

- Generación de texto con razonamiento configurable: el modelo permite ajustar el esfuerzo de razonamiento (low, medium, high) según la latencia y complejidad deseadas.
- Chain-of-thought completo: acceso íntegro al proceso de razonamiento interno, útil para depuración y auditoría, aunque no debe mostrarse a usuarios finales.
- Function calling nativo: soporte para invocación de herramientas y APIs externas.
- Ejecución de código Python: capacidad de generar y ejecutar scripts en entornos controlados.
- Structured Outputs: generación de salidas con esquemas JSON estrictos.
- Navegación web: capacidad de browsing integrada (según la documentación del base).
- Capacidades agénticas: soporte para tareas multi-paso y flujos de agente.
- Multilingüismo: no especificado en la documentación del adaptador; el modelo base no declara idiomas soportados en la información proporcionada.

## Casos de uso

- Asistentes conversacionales especializados: al ser un ajuste LoRA, puede adaptarse a dominios concretos (soporte técnico, atención al cliente sectorial) con un coste de fine-tuning reducido frente a un entrenamiento completo.
- Agentes autónomos con function calling: el modelo puede integrarse en pipelines agénticos que requieran invocación de herramientas, ejecución de código Python y razonamiento multi-paso, gracias a las capacidades nativas heredadas del base.
- Generación de código asistida en entornos de desarrollo: con soporte para Structured Outputs, puede integrarse en IDEs o pipelines de CI/CD para generar código con formato validado.
- Despliegue de bajo coste en producción: con 3,6B parámetros activos y cuantización MXFP4, el modelo cabe en GPUs de consumo con 16 GB de memoria, lo que lo hace viable para inferencia local o en edge.
- Investigación en interpretabilidad: el acceso completo al chain-of-thought permite auditar el razonamiento del modelo en tareas de clasificación o decisión, útil en entornos regulados.
- Prototipado rápido de aplicaciones conversacionales: gracias a la compatibilidad con vllm y Transformers Serve, se puede levantar un servidor compatible con la API de OpenAI en minutos para validar casos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye métricas propias, y la información proporcionada sobre el modelo base tampoco contiene cifras de evaluación (MMLU, HumanEval, GSM8K u otros). No se dispone de datos de rendimiento comparativos verificables.

## Requisitos de hardware

- VRAM estimada: el modelo base gpt-oss-20b con cuantización MXFP4 nativa funciona en menos de 16 GB de memoria, según la documentación de OpenAI. El adaptador LoRA añade un overhead mínimo de parámetros.
- GPU recomendadas: tarjetas de consumo con 16 GB de VRAM (por ejemplo, RTX 4090) son suficientes para el modelo base cuantizado; GPUs de datacenter como A100 o H100 permiten mayor throughput y lotes más grandes.
- Compatibilidad con hardware de consumo: sí, siempre que se use cuantización MXFP4 y la ventana de contexto se ajuste a la memoria disponible.
- Opciones de despliegue: vllm (recomendado por el autor, con soporte para el servidor compatible con OpenAI), Transformers (pipeline de text-generation), Transformers Serve, Ollama (para el base: `ollama pull gpt-oss:20b`) y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, la cuantización y el esfuerzo de razonamiento configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Cuantizacion nativa |
|---|---|---|---|---|---|
| joe-sidley-adc/lora-finetuned | 21B | 3,6B | no disponible | Apache 2.0 | MXFP4 (heredada) |
| openai/gpt-oss-20b (base) | 21B | 3,6B | no disponible | Apache 2.0 | MXFP4 |
| openai/gpt-oss-120b | 117B | 5,1B | no disponible | Apache 2.0 | MXFP4 |

La comparativa se limita a los modelos de la misma familia gpt-oss, ya que no se dispone de información suficiente sobre alternativas de otros fabricantes para establecer una comparación rigurosa. La diferencia principal entre el adaptador y su base es el ajuste LoRA, cuyos efectos sobre el rendimiento no están documentados. El modelo de 120B ofrece mayor capacidad de razonamiento pero requiere una H100 completa, mientras que el de 20B (y su adaptador) prioriza latencia y despliegue local.

## Limitaciones y advertencias

- Documentación insuficiente: el autor no detalla el dataset, el objetivo ni los resultados del fine-tuning; las capacidades del adaptador no pueden verificarse de forma independiente.
- Formato harmony obligatorio: el modelo no funciona correctamente sin aplicar el formato de respuesta harmony mediante la plantilla de chat de Transformers o el paquete openai-harmony.
- Chain-of-thought no apto para usuarios finales: el razonamiento completo del modelo no debe exponerse directamente a usuarios, según la documentación de OpenAI.
- Sesgos y alucinaciones: no hay evaluaciones publicadas del adaptador; los riesgos de sesgo y alucinación del modelo base no están documentados en la información proporcionada.
- Idiomas no especificados: no se declaran los idiomas soportados, lo que limita la confianza para despliegues multilingües.
- Sin métricas de seguridad: no se han publicado evaluaciones de robustez, jailbreak o toxicidad para este adaptador.
- Cero descargas y cero likes: el modelo no tiene tracción en la comunidad, lo que implica ausencia de validación por terceros.
- Contexto no documentado: la longitud de contexto máxima no se especifica en la información disponible; debe validarse antes de usarlo en producción con ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joe-sidley-adc/lora-finetuned
- Modelo base en HuggingFace: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor de la familia: https://huggingface.co/openai/gpt-oss-120b
- Demo oficial: https://gpt-oss.com
- Guías de uso: https://cookbook.openai.com/topic/gpt-oss
- System card: https://openai.com/index/gpt-oss-model-card
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos e inferencia: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
