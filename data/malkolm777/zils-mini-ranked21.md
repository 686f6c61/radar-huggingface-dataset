# malkolm777/zils-mini-ranked21

## Resumen

zils-mini-ranked21 es un modelo de decisión (decision model) publicado por el usuario malkolm777 en Hugging Face, derivado del modelo base joamCriff123/zils-mini-m1117b, que a su vez pertenece a la familia Qwen3.5-4B. El modelo se ha obtenido mediante un ajuste fino con un adaptador LoRA de rango 16 entrenado durante una pasada sobre 2.048 tareas de decisión, posteriormente fusionado en los pesos del cuerpo base. Su propósito declarado es servir como "cuerpo de decisión" dentro del pool Zils d3-mini, un ecosistema de modelos orientados a tareas de elección y ranking.

El modelo cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,1 GB. La arquitectura subyacente es la de Qwen3.5-4B, si bien la model card no detalla configuración de capas, cabezas de atención ni longitud de contexto. La licencia es Apache 2.0, lo que facilita su uso comercial con las obligaciones habituales de atribución.

La relevancia de este modelo es limitada y muy específica: se trata de una variante de nicho dentro de un pool experimental, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación sobre idiomas o pipeline. Resulta adecuado únicamente para experimentación con tareas de decisión ordinal dentro del ecosistema Zils, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-4B; detalles de capas no disponibles) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de la revisión 0d26e5d85866c225a0384a35947cfa5e98bbd36c de joamCriff123/zils-mini-m1117b, encuadrado en la familia Qwen3.5-4B. Sobre ese cuerpo se entrenó un adaptador LoRA de rango 16 durante una única pasada sobre 2.048 tareas de decisión, que después se fusionó en los pesos del modelo base. Las tareas de tipo ordinal emplearon distribuciones objetivo que asignan peso parcial a las respuestas adyacentes, una técnica habitual para suavizar etiquetas en problemas de ranking y decisión con orden inherente.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card menciona un hash canónico del cuerpo Zils (`b6d8180d2cee082162300607b8e8e9e69f7995eba122bcaca91c4c933a234cbf`) y remite a LICENSE y NOTICE para las atribuciones upstream. El repositorio requiere `custom_code`, lo que implica que la carga del modelo depende de código personalizado incluido en el repo y no solo de la clase estándar de transformers.

## Capacidades

- Tareas de decisión y ranking: el modelo está entrenado específicamente para seleccionar o puntuar opciones dentro de un conjunto, con soporte para decisiones ordinales mediante distribuciones objetivo suavizadas.
- Formato de "cuerpo de decisión": pensado para integrarse en el pool Zils d3-mini como componente de elección, no como generador de texto libre.
- Generación de texto: capacidad heredada del base Qwen3.5-4B, aunque no documentada ni validada para esta variante.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Selección entre respuestas candidatas: el modelo puede puntuar varias salidas generadas por otro modelo y elegir la mejor, aprovechando su entrenamiento en tareas de decisión ordinal con pesos parciales en respuestas adyacentes.
- Ranking de resultados en pipelines de recuperación: integrado como reranker ligero de 4,5 mil millones de parámetros para ordenar documentos o pasajes según relevancia.
- Enrutamiento de consultas: decidir a qué modelo o herramienta derivar una petición dentro de un sistema multi-modelo, dado su perfil de "decision body".
- Evaluación automática de calidad: asignar puntuaciones ordinales a respuestas generadas en un ciclo de evaluación, con la ventaja de que las etiquetas adyacentes reciben peso parcial y reducen la rigidez del etiquetado.
- Experimentación en el ecosistema Zils: probar el pool d3-mini con este cuerpo de decisión para comparar variantes ranked dentro del mismo marco.
- Clasificación con orden inherente: tareas como priorización de tickets, niveles de severidad o grados de satisfacción, donde la ordinalidad del target es natural.
- Investigación sobre LoRA y fusión de adaptadores: el modelo sirve como caso de estudio reproducible de un fine-tuning LoRA rango 16 fusionado sobre un base Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 3 GB para pesos, si se generan pesos GGUF/AWQ (no confirmados en el repo).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización a 4 bits, potencialmente en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM, TGI, llama.cpp u Ollama solo si se generan pesos compatibles, lo cual no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-ranked21 | 4,54 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning LoRA de decisión sobre Qwen3.5-4B |
| Qwen3.5-4B (base de la familia) | ~4 B | No disponible en esta ficha | Según versión upstream | Amplia | Modelo generalista del que deriva |
| joamCriff123/zils-mini-m1117b | No disponible | No disponible | No disponible | Hugging Face | Modelo base directo del fine-tuning |
| Alternativas de reranking de ~4 B | Variable | Variable | Variable | Variable | No se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho sin validación externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas.
- Especialización estrecha: entrenado para tareas de decisión dentro del pool Zils d3-mini; su comportamiento como generador de texto general no está documentado ni validado.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta variante.
- Contexto no documentado: no se especifica la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, los errores se manifestarán como elecciones o rankings incorrectos más que como texto inventado.
- Sesgos: no documentados; al heredar el base Qwen3.5-4B y un dataset de 2.048 tareas no descrito, los sesgos del corpus de decisión son desconocidos.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las atribuciones upstream indicadas en LICENSE y NOTICE del repositorio.
- Aviso de producción: no se recomienda su uso en sistemas críticos sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-mini-ranked21
- Modelo base: https://huggingface.co/joamCriff123/zils-mini-m1117b
- Repositorio de la familia Qwen3.5: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible
