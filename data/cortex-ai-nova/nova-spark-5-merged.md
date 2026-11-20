# cortex-ai-nova/NOVA-Spark-5-Merged

## Resumen

NOVA-Spark-5-Merged es un ajuste fino (finetune) del modelo GPT-OSS-20B, concretamente de la variante cuantizada a 4 bits publicada por Unsloth (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`). Lo desarrolla el usuario `cortex-ai-nova`, que lo distribuye bajo licencia Apache 2.0 y lo ha entrenado con la librería Unsloth junto con TRL de Hugging Face, según declara en la model card. El repositorio ocupa 36,9 GB y se publica en formato de pesos de Transformers.

La relevancia del modelo deriva de su base: GPT-OSS-20B es la familia abierta de OpenAI con arquitectura de mezcla de expertos (MoE), y esta variante hereda ese diseño. Sin embargo, la información publicada por el autor es mínima: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset de ajuste ni resultados de evaluación. La model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento.

Se trata, por tanto, de un modelo orientado a generación de texto conversacional en inglés, sin métricas públicas que permitan validar su calidad frente al modelo base. Cualquier evaluación de su rendimiento real requeriría pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer, heredada de GPT-OSS-20B; detalles concretos no disponibles |
| Parametros totales | 20B (según el nombre del modelo base) |
| Parametros activos | no disponible (GPT-OSS-20B es MoE, pero el autor no publica el reparto de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base está cuantizado a 4 bits (bnb-4bit); el ajuste se distribuye en formato Transformers, sin confirmar cuantizaciones adicionales |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); no se confirma GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del GPT-OSS-20B de OpenAI, que emplea una arquitectura de mezcla de expertos. El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según la model card, que menciona un entrenamiento "2x más rápido" gracias a Unsloth. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT convencional.

No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni sobre la estrategia de merging que sugiere el sufijo "Merged" del nombre. Tampoco se documenta si el ajuste se hizo sobre los pesos cuantizados o sobre una versión desquantizada.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones, heredados del modelo base GPT-OSS-20B (no verificados en esta variante).
- Compatibilidad declarada con text-generation-inference y Transformers.
- Posible soporte de tool calling y razonamiento multi-paso, si el modelo base lo conserva tras el ajuste (no confirmado por el autor).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- **Prototipado de asistentes conversacionales en inglés**: el modelo puede desplegarse con Transformers o TGI para generar respuestas multi-turno, aprovechando la arquitectura MoE del base para mantener un coste de inferencia contenido.
- **Ajuste fino adicional sobre dominio específico**: al estar bajo Apache 2.0 y en formato Transformers, sirve como punto de partida para nuevos finetunes con Unsloth o TRL en tareas concretas.
- **Experimentación académica con modelos MoE**: útil para estudiar el comportamiento de variantes ajustadas de GPT-OSS-20B, siempre que se validen los resultados frente al base.
- **Generación de texto en pipelines de investigación**: integrable en flujos de generación de texto vía `transformers` o `text-generation-inference` para tareas de redacción y resumen en inglés.
- **Evaluación comparativa de finetunes**: como ejemplo de ajuste rápido con Unsloth, puede emplearse en estudios sobre el impacto del finetuning en modelos MoE cuantizados.
- **Despliegue en entornos con licencia permisiva**: la licencia Apache 2.0 facilita su uso en productos comerciales, aunque sin garantías de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 36,9 GB, por lo que la inferencia en precisión completa requiere al menos ~40 GB de VRAM; con cuantización a 4 bits podría reducirse a ~12-16 GB, aunque el autor no publica versiones GGUF ni cuantizadas adicionales.
- **GPU recomendadas**: A100 40/80 GB o H100 para carga completa; RTX 4090 (24 GB) solo si se aplica cuantización adicional no publicada.
- **Consumer GPU**: posible en RTX 3090/4090 únicamente con cuantización a 4 bits, no incluida en el repositorio.
- **Despliegue**: Transformers y text-generation-inference (TGI) según las etiquetas; no se confirma compatibilidad con vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NOVA-Spark-5-Merged | 20B (MoE) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| GPT-OSS-20B (OpenAI) | 20B (MoE) | no disponible | Apache 2.0 | Hugging Face, ampliamente distribuido |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 20B (MoE) | no disponible | Apache 2.0 | Hugging Face, versión cuantizada de referencia |
| Mistral Small / Qwen 2.5 14B | 14B densos | 32K-128K típicamente | Apache 2.0 en varias variantes | Hugging Face |

La comparación con alternativas densas de tamaño similar es orientativa: no hay datos de rendimiento de NOVA-Spark-5-Merged que permitan establecer diferencias cualitativas con el modelo base ni con terceros.

## Limitaciones y advertencias

- **Ausencia de documentación**: no se publican datos de entrenamiento, evaluación ni hiperparámetros, lo que impide validar la calidad del ajuste.
- **Riesgo de degradación frente al base**: un finetune sin evaluación puede perder capacidades del modelo original (razonamiento, tool calling, multilingüismo).
- **Sesgos y alucinaciones**: heredados del modelo base y potencialmente amplificados por el ajuste; no documentados.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- **Formato**: sin versiones GGUF ni cuantizadas publicadas, lo que limita el despliegue en hardware de consumo.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; modelo sin validación por la comunidad.
- **Contexto**: longitud de contexto no confirmada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- [Hugging Face: cortex-ai-nova/NOVA-Spark-5-Merged](https://huggingface.co/cortex-ai-nova/NOVA-Spark-5-Merged)
- [Modelo base: unsloth/gpt-oss-20b-unsloth-bnb-4bit](https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
