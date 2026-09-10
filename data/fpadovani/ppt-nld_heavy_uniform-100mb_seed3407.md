# fpadovani/ppt-nld_heavy_uniform-100mb_seed3407

## Resumen

`ppt-nld_heavy_uniform-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo monolingüe neerlandés `goldfish-models/nld_latn_100mb`, publicado por el usuario `fpadovani` en HuggingFace. El entrenamiento se ha realizado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0, y el seguimiento del experimento apunta a un proyecto de la Universidad de Groningen alojado en Weights & Biases. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción: acumula cero descargas y cero valoraciones desde su publicación.

Técnicamente es un transformer decoder-only de la familia GPT-2 (así lo etiqueta el repositorio) con 86.708.736 parámetros totales, es decir, unos 86,7 millones, por debajo de los 124 millones de GPT-2 small. El identificador del modelo base (`nld_latn`) indica que está especializado en neerlandés en escritura latina, y el sufijo `100mb` hace referencia al tamaño del corpus con el que se entrenó el modelo original de la familia Goldfish. El nombre del repositorio incorpora además los fragmentos `ppt`, `heavy_uniform` y `seed3407`, que no vienen explicados en la model card.

Su relevancia es fundamentalmente metodológica: sirve como pieza reproducible (semilla fija, framework y versiones documentadas) para estudiar cómo responde un modelo pequeño y monolingüe al ajuste fino por instrucciones en un idioma de recursos medios como el neerlandés. No hay publicación de benchmarks, licencia declarada ni ficha de evaluación asociada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 86.708.736 (~86,7 M), dato real de los pesos safetensors |
| Parametros activos | No aplicable: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se distribuyen sin cuantizar en safetensors y admiten conversión externa a fp16, int8 o int4 |
| Idiomas soportados | no disponible en los metadatos; el modelo base (`nld_latn`) es neerlandés |
| Licencia | no disponible; la model card incluye la etiqueta `licence: license` sin texto legal asociado |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 1,4 GB |
| Modelo base | goldfish-models/nld_latn_100mb |
| Método de entrenamiento | SFT con TRL 0.23.0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2, un transformer decoder-only con atención causal completa. Con 86,7 millones de parámetros y pesos en safetensors, el modelo es un fine-tune del checkpoint `goldfish-models/nld_latn_100mb`, por lo que comparte la topología y el tokenizador de este último; no se documenta ninguna modificación estructural, ni atención lineal, ni decodificación especulativa, ni capas MoE. No se especifica la longitud de contexto efectiva ni el tamaño del vocabulario en la información disponible.

El entrenamiento se ha realizado mediante fine-tuning supervisado (SFT) con TRL, según indica la propia model card, y el enlace de seguimiento apunta a la ejecución `2owwoksl` del proyecto `white_cotterell` en Weights & Biases. No se detalla el número de tokens de entrenamiento, la composición del dataset de instrucciones, ni si hubo fases posteriores de RLHF o DPO. El repositorio tampoco documenta qué significan los fragmentos `ppt` ni `heavy_uniform` del nombre, ni la estrategia de muestreo que sugiere este último término. La semilla queda fijada en el identificador (`seed3407`), lo que facilita la reproducibilidad del experimento.

## Capacidades

- Generación de texto autoregresiva en neerlandés, heredada del modelo base monolingüe.
- Formato conversacional de un solo turno: el ejemplo de la model card pasa una lista con `{"role": "user", "content": ...}` al pipeline de `text-generation`, lo que indica que el ajuste SFT se hizo sobre plantillas de diálogo.
- Generación condicionada por instrucciones, en la medida en que el SFT haya transferido ese comportamiento; no hay evaluación publicada que lo confirme.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio, ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe: no disponible; el modelo base es monolingüe neerlandés, por lo que se espera un rendimiento muy limitado fuera de ese idioma.

## Casos de uso

- Investigación sobre ajuste fino por instrucciones en lenguas de recursos medios: el modelo sirve como punto de comparación reproducible (semilla y versiones de framework fijadas) frente a otros ajustes del mismo `goldfish-models/nld_latn_100mb`.
- Ablaciones de hiperparámetros de SFT: al compartir base y semilla con otros checkpoints del mismo autor, permite aislar el efecto de la configuración de entrenamiento sin variar el modelo de partida.
- Generación sintética de texto neerlandés para aumentar corpus de entrenamiento: útil en pipelines de aumento de datos donde se necesita volumen adicional de texto en neerlandés y no se requiere calidad de estado del arte.
- Prototipado de asistentes conversacionales en neerlandés: su formato de prompt tipo chat permite montar un prototipo de diálogo de un turno en local antes de decidir si se escala a un modelo mayor.
- Despliegue en entornos sin GPU: con menos de 90 millones de parámetros, la inferencia en CPU es viable, lo que habilita demos docentes, notebooks de aula o pruebas en dispositivos de gama baja.
- Evaluación de sesgos y alineación en modelos pequeños: es un sujeto de estudio manejable para medir cómo un SFT breve altera el comportamiento de un modelo monolingüe preentrenado.
- Filtrado y puntuación de texto neerlandés en pipelines de datos: el modelo puede usarse para calcular verosimilitudes por token y descartar documentos anómalos, aunque requiere calibración previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web disponibles no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 350 MB solo para pesos; en fp16/bf16, unos 175 MB; en int8, unos 87 MB; en int4, unos 44 MB.
- Con el overhead del runtime de Transformers y la caché KV, una inferencia en fp16 cabe holgadamente en menos de 1 GB de VRAM.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) y también en iGPU y en CPU, dado el tamaño del modelo.
- El repositorio ocupa 1,4 GB, muy por encima de lo que ocuparían solo los pesos, lo que sugiere que incluye artefactos adicionales (posiblemente estados de optimizador); no está confirmado.
- Opciones de despliegue: `transformers` con `pipeline` (probado por el autor), `text-generation-inference` (el repositorio lleva la etiqueta `endpoints_compatible`) y, previsiblemente, vLLM. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, y no se ha publicado ninguna conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-nld_heavy_uniform-100mb_seed3407 | 86,7 M | no disponible | Fine-tune SFT en neerlandés | no disponible | Repositorio público, 0 descargas |
| goldfish-models/nld_latn_100mb (base) | no disponible (misma topología, al ser la base del fine-tune) | no disponible | Modelo base preentrenado en neerlandés | no disponible | Repositorio público de Goldfish |
| GPT-2 small (OpenAI / referencias de la comunidad) | 124 M | 1.024 tokens | Modelo base multilingüe (predominantemente inglés) | Licencia MIT modificada del modelo original | Ampliamente disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones, ya que ninguno de los resultados de evaluación del modelo analizado se ha publicado en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card solo incluye la etiqueta `licence: license` sin texto legal, por lo que no puede asumirse permiso de uso comercial. Cualquier uso en producción requiere contactar con el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, ni de que el SFT haya mejorado al modelo base.
- Alcance lingüístico restringido: al derivar de un modelo monolingüe neerlandés, cabe esperar un comportamiento deficiente en castellano, inglés u otros idiomas.
- Riesgo elevado de alucinación y de texto incoherente: con 86,7 millones de parámetros y un corpus base de 100 MB, la capacidad factual y de razonamiento es muy limitada.
- Herencia de sesgos del corpus base, sin filtrado ni alineación documentados más allá del propio SFT.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Modelo de investigación sin mantenimiento: cero descargas, cero valoraciones y ausencia de issues o demos públicas.
- No apto para decisiones automatizadas, asesoramiento legal, médico ni financiero.
- Los resultados de la búsqueda web asociados a esta consulta no guardan relación con el modelo (corresponden a registros judiciales del estado de Luisiana) y no se han utilizado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_uniform-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/2owwoksl
- Paper asociado: no disponible
- Demo o Space: no disponible
- Documentación del autor sobre el modelo: no disponible
