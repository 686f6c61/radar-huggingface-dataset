# marsplan0624/zils-d3-lite-cc1-h14

## Resumen

`zils-d3-lite-cc1-h14` es un modelo de decisión ("decision-model") derivado de `Qwen/Qwen3.5-0.8B` y publicado por el usuario marsplan0624 dentro del proyecto Zils. No es un modelo conversacional al uso: se trata de un "body" (cuerpo de pesos) preparado para el pool `d3-lite`, es decir, un conjunto de pesos de lenguaje y visión afinados para una tarea concreta de clasificación y predicción de resultados, sin capa de respuesta ni código de inferencia incluidos en el repositorio.

El modelo parte de la arquitectura y disposición de pesos de Qwen3.5-0.8B (852.985.920 parámetros, unos 0,85 mil millones) y le aplica un fine-tune sobre preguntas de decisión públicas etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit), fusionando además un LoRA de lenguaje de rango 16 en los pesos finales. El repositorio ocupa 1,7 GB y se distribuye en safetensors bajo licencia Apache 2.0.

Su relevancia es acotada y muy específica: sirve como pieza de un runtime propietario ("pinned chassis runtime") del ecosistema Zils, por lo que no es desplegable de forma autónoma con herramientas estándar como vLLM o llama.cpp sin trabajo adicional. Para desarrolladores interesados en modelos pequeños de decisión, es un artefacto de referencia más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-0.8B (detalles internos no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura y el layout de pesos de `Qwen/Qwen3.5-0.8B`, un transformer denso de aproximadamente 0,85 mil millones de parámetros. Según la model card, se trata de un fine-tune que conserva "los pesos completos de lenguaje y visión" del modelo base, lo que implica que la variante Qwen3.5-0.8B de partida incorpora capacidad multimodal. Sobre esa base se fusionó un LoRA de lenguaje de rango 16 directamente en los pesos, de modo que el artefacto publicado no requiere cargar adaptadores por separado.

El entrenamiento se realizó sobre preguntas de decisión públicas etiquetadas con resultados reales, siguiendo el estilo "Zils Outcomes": reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La model card indica explícitamente que los pesos solo son utilizables a través del runtime del pool ("pinned chassis runtime") y que el repositorio no incluye capa de respuesta ni código de ejecución, lo que constituye la innovación principal del artefacto: separar el "cuerpo" de pesos del "chasis" de inferencia.

## Capacidades

- Predicción de resultados de decisión: el modelo está afinado para emitir juicios sobre desenlaces binarios o categóricos en contextos como moderación de Wikipedia, aceptación de papers por categoría, resolución de preguntas en Stack Exchange o aceptación de cambios en Gerrit.
- Procesamiento de lenguaje y visión: al conservar los pesos de lenguaje y visión del modelo base, mantiene potencialmente capacidad multimodal, aunque no se detalla su alcance.
- Clasificación y scoring: orientado a producir señales de decisión más que texto libre conversacional.
- Integración con runtime propietario: requiere el chasis de inferencia del pool `d3-lite`; no se documenta soporte de tool calling, function calling ni agentes multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación colaborativa en wikis: el modelo puede puntuar si una edición será revertida o aceptada, entrenado precisamente con reversiones y revisiones de Wikipedia, lo que permite priorizar revisiones humanas en colas de patrullaje.
- Triaje de envíos a arXiv: usar la señal de decisión para estimar la categoría o probabilidad de aceptación de un manuscrito, ayudando a editores y autores a orientar el envío antes de la revisión formal.
- Priorización de preguntas en Stack Exchange: clasificar preguntas por probabilidad de cierre, reapertura o respuesta aceptada, alimentando sistemas de curación de contenido en comunidades técnicas.
- Filtrado de cambios en Gerrit: predecir si un cambio de código será fusionado o rechazado, integrándose en pipelines de revisión para asignar revisores o marcar cambios de riesgo.
- Investigación sobre modelos de decisión pequeños: servir como artefacto de referencia para estudiar cómo un fine-tune de 0,85 mil millones de parámetros con LoRA rango 16 se comporta en tareas de juicio sobre resultados reales.
- Evaluación de pipelines de outcome labelling: usar los pesos como componente de un banco de pruebas para comparar estrategias de etiquetado por resultados frente a modelos generativos mayores, dado su tamaño reducido y coste de inferencia bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16/bf16 se requieren aproximadamente 1,7 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits bajaría a unos 0,9 GB y en 4 bits a unos 0,5 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM debería poder alojar los pesos en precisión completa; para producción con lotes grandes se recomendarían GPUs tipo A100 o H100, aunque no se documentan cifras.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño reducido del modelo.
- Opciones de despliegue: el autor indica que los pesos solo son utilizables mediante el runtime del pool `d3-lite`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el repositorio no incluye código de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zils-d3-lite-cc1-h14 | 852.985.920 | No disponible | Apache 2.0 | safetensors | Solo via runtime Zils |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | No disponible | No disponible en la informacion | safetensors | Hugging Face, desplegable con runtimes estandar |
| Alternativas de decision-model de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con modelos de decisión comparables; la comparación con el modelo base se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Dependencia de runtime propietario: los pesos no incluyen capa de respuesta ni código, y solo funcionan con el "pinned chassis runtime" del pool `d3-lite`, lo que limita su portabilidad y su uso fuera del ecosistema Zils.
- Sesgos: al entrenarse con resultados de comunidades concretas (Wikipedia, arXiv, Stack Exchange, Gerrit), puede heredar sesgos de esas plataformas en cuanto a qué se acepta o se rechaza.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de decisión, el riesgo se traslada a falsos positivos o negativos en la clasificación de resultados.
- Contexto e idiomas: no se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en entradas largas o multilingües.
- Licencia: Apache 2.0 permite uso comercial, pero la dependencia del runtime del pool puede imponer restricciones prácticas adicionales no cubiertas por la licencia de los pesos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, por lo que no hay evidencia empírica de su calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsplan0624/zils-d3-lite-cc1-h14
- Perfil del autor: https://huggingface.co/marsplan0624
- Datasets del autor: https://huggingface.co/marsplan0624/datasets
- Organización Zils: https://huggingface.co/zils-ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
