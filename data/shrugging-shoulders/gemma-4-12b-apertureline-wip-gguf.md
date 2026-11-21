# shrugging-shoulders/gemma-4-12B-ApertureLine-WIP-GGUF

## Resumen

ApertureLine-12B es un modelo de lenguaje de 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) derivado de `google/gemma-4-12B-it` mediante un proceso de ajuste fino del que no se han publicado detalles técnicos. Lo desarrolla el usuario `shrugging-shoulders` y se distribuye en formato GGUF cuantizado, lo que lo hace consumible por herramientas de inferencia local como llama.cpp u Ollama. La model card es explícitamente mínima: se describe como una "colección de checkpoints en progreso para pruebas" y advierte con un "wet paint ahead" (pintura fresca) que el artefacto no está estabilizado.

El interés del modelo es, por tanto, acotado y de naturaleza experimental: sirve como referencia de un ajuste comunitario sobre la familia Gemma 4 en su variante instruction-tuned de 12B, no como un modelo listo para producción. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, y ocupa 12,7 GB, coherente con un conjunto de cuantizaciones GGUF de un modelo de ~12B.

La información publicada no permite verificar arquitectura interna, datos de entrenamiento, idiomas soportados ni rendimiento. Todo lo que sigue distingue explícitamente entre lo declarado por el autor o deducible del repositorio y lo que debe considerarse no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `google/gemma-4-12B-it`; no se detalla en la model card) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en detalle; el repositorio es GGUF y contiene varias cuantizaciones (12,7 GB en total) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo `-GGUF`); el modelo base se distribuye en safetensors |
| Modelo base | google/gemma-4-12B-it |
| Pipeline | no disponible |
| Tamaño del repositorio | 12,7 GB |
| Etiquetas | gguf, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. Por herencia del modelo base `google/gemma-4-12B-it`, se trata de un transformer decoder-only de aproximadamente 12B parámetros en su variante instruction-tuned, pero el repositorio no aporta confirmación técnica de detalles como número de capas, dimensión oculta, tipo de atención, vocabulario o función de activación. Tampoco se indica si el modelo base emplea mezcla de expertos; el recuento de parámetros totales coincide con un modelo denso de ese tamaño.

Respecto al entrenamiento, la model card no documenta el dataset de ajuste fino, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF, DPO o similares. El autor lo describe como "work in progress checkpoint collection for testing", es decir, checkpoints intermedios de pruebas, sin garantía de que correspondan a un estado final de entrenamiento. No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, modos de razonamiento) más allá de lo que pueda heredar del modelo base, que no se detalla aquí.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el sufijo `-it` del modelo base indican un ajuste orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: presumiblemente heredados de Gemma 4 12B-it, aunque no se documentan evaluaciones que lo confirmen en este checkpoint.
- Generación de código y matemáticas: no disponible; no se declara ni se evalúa en la model card.
- Tool calling / function calling: no disponible; no se declara soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse mediante infraestructura de endpoints compatible, pero no se especifica cuál.

## Casos de uso

- Evaluación de ajustes comunitarios sobre Gemma 4: el modelo sirve para comparar el comportamiento de un fine-tune no oficial frente al `gemma-4-12B-it` original en tareas de diálogo, midiendo deriva y regresiones con un conjunto de prompts fijo.
- Pruebas de cuantización GGUF: al distribuirse en formato GGUF, permite validar la pérdida de calidad entre niveles de cuantización en un modelo de ~12B y calibrar qué nivel es aceptable para un caso concreto.
- Prototipado local de asistentes conversacionales: con 12,7 GB de repositorio y pesos GGUF, es desplegable en estaciones de trabajo con GPU de consumo para experimentar con un chatbot de 12B antes de comprometerse con un modelo en producción.
- Integración en pipelines de inferencia basados en llama.cpp u Ollama: útil para probar la compatibilidad de herramientas, plantillas de chat y parámetros de muestreo con un checkpoint de la familia Gemma 4.
- Docencia y experimentación: adecuado como material de laboratorio para ilustrar el ciclo completo de un fine-tune comunitario, desde el modelo base hasta la cuantización y el despliegue.
- No recomendado para producción: dado su estado "work in progress" y la ausencia de benchmarks, no debería usarse en atención al cliente, generación de código en CI/CD ni flujos con requisitos de fiabilidad hasta que el autor publique evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo denso de ~11,9B parámetros, en FP16 se requieren aproximadamente 24 GB solo de pesos; en cuantizaciones GGUF de 8 bits, en torno a 12-13 GB; en 4 bits, alrededor de 7-8 GB, más overhead de contexto y caché KV.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado o cuantizaciones de 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs de 8-12 GB para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 a 8 bits en tarjetas de 8 GB o más, siempre que la longitud de contexto sea moderada; el contexto largo incrementa la VRAM por la caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints, sin más detalle. vLLM y TGI no consumen GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| ApertureLine-12B (este) | 11,9B | no disponible | apache-2.0 | GGUF | Work in progress, sin benchmarks |
| google/gemma-4-12B-it (base) | ~12B | no disponible | según términos de Google (no verificado aquí) | safetensors | Modelo oficial instruction-tuned |
| Mistral 7B Instruct | ~7,2B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo estable con amplia adopción |
| Llama 3.1 8B Instruct | ~8B | 128K (según documentación pública de Meta) | Llama 3.1 Community License | safetensors, GGUF | Modelo estable con amplia adopción |

La comparación es aproximada: no se dispone de datos de contexto ni de rendimiento de ApertureLine-12B, y las cifras de los alternativas provienen de sus respectivas documentaciones públicas, no de una evaluación conjunta. La ventaja diferencial de este checkpoint es su licencia apache-2.0 declarada y su formato GGUF listo para inferencia local; su desventaja es la ausencia total de validación publicada.

## Limitaciones y advertencias

- Estado inestable: el autor lo etiqueta como "work in progress" y "wet paint", por lo que los pesos pueden corresponder a un checkpoint intermedio sin calidad garantizada.
- Sin benchmarks ni evaluaciones: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni ninguna otra prueba.
- Idiomas no declarados: se desconoce qué lenguas cubre el ajuste fino y si conserva las capacidades multilingües del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluaciones específicas no puede acotarse su magnitud en este checkpoint.
- Sesgos: no documentados; al derivar de un modelo base de Google y de un ajuste comunitario sin datos publicados, los sesgos pueden diferir de los del original.
- Licencia: el repositorio declara apache-2.0, pero conviene verificar que los términos del modelo base `google/gemma-4-12B-it` permitan la redistribución bajo esa licencia antes de un uso comercial.
- Contexto y cuantización: el contexto máximo no está documentado y las cuantizaciones GGUF pueden degradar la calidad respecto a los pesos originales.
- Sin soporte: 0 descargas y 0 likes indican ausencia de validación por la comunidad; no hay issues ni discusiones que permitan anticipar problemas.
- Repositorio de pruebas: no debe tratarse como un artefacto estable ni citarse como referencia de la familia Gemma 4.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shrugging-shoulders/gemma-4-12B-ApertureLine-WIP-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
