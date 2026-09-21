# Diluner/gpt54-mini-standalone-qwen3-1.7b-sft-textcraft-20260920

## Resumen

gpt54-mini-standalone-qwen3-1.7b-sft-textcraft-20260920 es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen3-1.7B, publicado por el usuario Diluner en HuggingFace. El entrenamiento utiliza como profesor a un modelo identificado como `gpt-5.4-mini` y se ha realizado de forma independiente ("standalone") desde el modelo base, no como continuación secuencial de otros checkpoints. Se trata del checkpoint final de una etapa denominada textcraft, completada con cinco épocas y 55 actualizaciones de optimizador en esa fase.

El interés del modelo es fundamentalmente metodológico: documenta una receta de destilación por SFT sobre un modelo pequeño (2.031.739.904 parámetros según los pesos safetensors, es decir unos 2,03 mil millones) orientada a tareas de agente, con trazabilidad de la evaluación en un entorno concreto. El repositorio incluye configuración, tokenizer y todos los shards de pesos en la raíz, pero no incluye el estado del optimizador, los logs en bruto ni las trayectorias del profesor; las referencias y sumas de comprobación legibles por máquina están en `experiment.json`.

La relevancia práctica es limitada por su estado: 0 descargas y 0 valoraciones, sin licencia declarada y sin benchmarks generales publicados. Su único dato de rendimiento es la evaluación en el entorno textcraft con métrica avg@4 del 65,5000 % (262 aciertos sobre 400 intentos), medida con temperatura 0,4, top-p 1,0, top-k 20, modo thinking desactivado y 512 tokens generados por turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-1.7B; el repositorio no documenta ninguna modificación estructural |
| Parametros totales | 2.031.739.904 (2,03 mil millones), según los pesos safetensors |
| Longitud de contexto | No disponible en el repositorio del modelo; el modelo base Qwen3-1.7B declara 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible en la ficha; el modelo base Qwen3 declara soporte multilingüe amplio, pero el autor no especifica nada para este ajuste |
| Licencia | No disponible. El autor no afirma ninguna licencia y remite expresamente a los términos del modelo base y a las condiciones aplicables |
| Formato de pesos | safetensors (shards en la raíz del repositorio, junto con configuración y tokenizer) |
| Modelo base | Qwen/Qwen3-1.7B |
| Profesor utilizado | `gpt-5.4-mini` (identificador tal cual aparece en la model card) |
| Metodo de entrenamiento | SFT (supervised fine-tuning); no se documentan RLHF, DPO ni otras fases de alineamiento |
| Tamano del repositorio | 8,1 GB |
| Fecha de publicacion | 21 de septiembre de 2026 (creación del repositorio) |
| Descargas y valoraciones | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: se trata de un transformer decoder-only denso de Qwen3-1.7B, sin mezcla de expertos ni componentes de estado recurrente. Sobre esa base se aplica un ajuste supervisado destilando el comportamiento de un profesor (`gpt-5.4-mini`) mediante pares de entrenamiento generados en la etapa textcraft. El entrenamiento se inicializó de forma independiente desde el modelo base, por lo que este checkpoint no es un paso secuencial dentro de una cadena de fine-tunes.

La etapa textcraft consta de cinco épocas y 55 actualizaciones de optimizador, y el autor afirma que una auditoría histórica verificó todas las actualizaciones esperadas y las exportaciones de checkpoint de las cinco épocas. No se especifican el número total de tokens de entrenamiento, la composición del dataset, la precisión de los parámetros, el esquema de learning rate ni la existencia de pesos por decay diferenciales. La model card advierte además de que las recetas históricas de SFT y ROSE difieren en planificación de learning rate, weight decay, precisión de parámetros, formato y algunos límites de turnos, de modo que la comparación entre ambas no constituye una ablación sobre un único objetivo.

Como elementos de reproducibilidad, el autor aporta un inventario de nombres de fichero, tamaños y fechas de modificación, y sumas de comprobación en `experiment.json`. El propio autor matiza que ese inventario no es un hash byte a byte de los tensores vinculado a las respuestas de evaluación históricas, y que los logs de servicio históricos están incompletos: algunos artefactos de evaluación reparados reutilizan rollouts originales completos.

## Capacidades

- Generación de texto conversacional en formato de instrucciones, tal como declara la etiqueta `conversational` del repositorio.
- Ejecución de tareas de agente en entornos textuales: el modelo ha sido entrenado con la etiqueta `agent-training` y evaluado específicamente en el entorno textcraft, con 512 tokens de generación por turno.
- Razonamiento multi-turno dentro de un episodio, con modo thinking desactivado durante la evaluación oficial.
- Tool calling y function calling: no disponible; no se documenta soporte explícito ni formato de llamadas a herramientas.
- Razonamiento multi-paso fuera del entorno evaluado: no disponible; no hay datos publicados más allá de textcraft.
- Capacidades multilingües: no disponible para este ajuste (el modelo base declara multilingualidad amplia, pero el autor no aporta datos).
- Capacidades especiales (visión, audio, modo thinking nativo, decodificación especulativa): no disponible. El único parámetro documentado de inferencia es "thinking disabled".
- Compatibilidad de despliegue: el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, y el ejemplo de uso emplea `AutoTokenizer` y `AutoModelForCausalLM` de transformers.

## Casos de uso

- Investigación en destilación sobre modelos pequeños: sirve como checkpoint de referencia para estudiar cómo se comporta un SFT de 1,7B destilado de un profesor mayor en tareas de agente, con una métrica declarada (avg@4 de 65,5 % en textcraft) y trazabilidad parcial de artefactos.
- Agentes para entornos textuales simulados: el modelo ha sido entrenado y evaluado en el entorno textcraft con 512 tokens por turno, por lo que es directamente aplicable a tareas de manipulación de estado descritas en lenguaje natural dentro de ese tipo de entorno.
- Prototipado local en hardware de consumo: con 2,03 mil millones de parámetros y unos 4,1 GB de pesos en bf16 tras conversión, cabe en GPUs de gama media y permite iterar en local sin coste de API.
- Generación de datos sintéticos como modelo auxiliar: puede emplearse para producir borradores de conversaciones o trayectorias que después se filtran con un modelo mayor, aprovechando su bajo coste por token.
- Evaluación comparativa de recetas SFT: al existir variantes con recetas distintas (SFT frente a ROSE, según la model card), resulta útil como punto de comparación controlado en experimentos de metodología de entrenamiento.
- Clasificación y extracción de información en pipelines por lotes: un modelo denso de 2B se puede servir con alta concurrencia para tareas de etiquetado, resumen corto o extracción de campos, siempre que se valide antes la calidad en el dominio concreto.
- Base para un ajuste posterior específico de dominio: al ser un checkpoint standalone bajo transformers, es un punto de partida razonable para un segundo SFT con datos propios, asumiendo la incertidumbre sobre la licencia del modelo base.

## Benchmarks y rendimiento

El único resultado publicado en la información disponible es la evaluación en el entorno textcraft con la métrica avg@4 (media de éxito en cuatro intentos por tarea oficial, no el mejor de cuatro):

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| textcraft | 262 / 400 | 65,5000 % | 0 |

Configuración de evaluación declarada: temperatura 0,4, top-p 1,0, top-k 20, modo thinking desactivado y 512 tokens generados por turno. El autor advierte de que cero errores de episodio no implica que todos los turnos generados estén bien formados, y de que las comprobaciones de resultados guardados verificaron cobertura exacta de tareas y muestras y consistencia de puntuaciones.

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, BBH u otros) en la información disponible.

## Requisitos de hardware

Estimaciones orientativas a partir del recuento real de parámetros (2.031.739.904). Los valores de VRAM incluyen pesos y overhead de activaciones, pero no una caché KV completa a contexto máximo salvo donde se indica:

- Pesos tal como se publican: el repositorio ocupa 8,1 GB, cifra coherente con almacenamiento en fp32 (unos 8,1 GB para 2,03 mil millones de parámetros). Cargarlo tal cual exige al menos 10-12 GB de VRAM o memoria unificada, o bien descarga parcial a CPU.
- bf16/fp16 tras conversión: aproximadamente 4,1 GB de pesos, por lo que cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) con margen para contexto moderado.
- int8: aproximadamente 2,1 GB de pesos; viable en GPUs de 6-8 GB.
- Cuantizaciones de 4 bits tipo GGUF Q4_K_M: del orden de 1,2-1,4 GB de pesos; permite ejecución en CPU y en GPUs integradas o de 4 GB, con pérdida de calidad no cuantificada.
- Caché KV: no hay configuración verificada del repositorio. Como estimación basada en la arquitectura del modelo base (28 capas, atención con consultas agrupadas, cabezas KV y dimensión de cabeza propias de Qwen3-1.7B), la caché en fp16 ronda los 115 KB por token, es decir unos 0,46 GB a 4.096 tokens y unos 3,7 GB a 32.768 tokens. Estas cifras son estimaciones y deben verificarse contra el `config.json` real.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G o A100 40 GB. En A100/H100 el modelo está claramente infrautilizado salvo que se busque concurrencia muy alta.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más si se convierte a bf16, y en GPUs de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoTokenizer` y `AutoModelForCausalLM`), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM para servicio con batching continuo, y llama.cpp u Ollama previa conversión a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

Comparación estructural con alternativas de tamaño equivalente. Los datos de los modelos de referencia corresponden a su documentación pública; no se han verificado en esta búsqueda y no hay cifras de rendimiento comparables para este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| gpt54-mini-standalone-qwen3-1.7b-sft-textcraft-20260920 | 2,03 mil millones | No disponible en el repositorio (base: 32.768 tokens) | No disponible | Safetensors en HF, 0 descargas | avg@4 65,5 % en textcraft; sin benchmarks estándar |
| Qwen/Qwen3-1.7B (base) | 1,7 mil millones (nominal) | 32.768 tokens nativos | Apache 2.0 | Safetensors y GGUF en HF | Benchmarks publicados por el autor del modelo base; no comparables directamente con este ajuste |
| Qwen/Qwen3-4B | 4 mil millones | 32.768 tokens nativos | Apache 2.0 | Safetensors y GGUF en HF | Superior en capacidad general esperada por tamaño; sin medición en textcraft |
| Llama-3.2-1B | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Safetensors en HF | Sin datos comparables en textcraft |

La comparación de rendimiento entre estos modelos en el entorno textcraft no está disponible: solo este checkpoint publica una métrica en ese entorno, y no existe una evaluación cruzada con los modelos de referencia.

## Limitaciones y advertencias

- Licencia no declarada: el autor no afirma ninguna licencia y remite a los términos del modelo base y a las condiciones aplicables. Antes de cualquier uso comercial debe aclararse la situación legal, especialmente por la naturaleza destilada del entrenamiento a partir de un profesor propietario.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad.
- Riesgo de alucinación alto: con 2,03 mil millones de parámetros y sin benchmarks de conocimiento general, es previsible que falle en tareas de conocimiento factual y razonamiento complejo.
- Evidencia de rendimiento muy limitada: el único resultado es un avg@4 del 65,5 % en un entorno propietario (textcraft) con una configuración de decodificación concreta (temperatura 0,4, top-p 1,0, top-k 20, thinking desactivado, 512 tokens por turno). No es extrapolable a otros entornos ni a otros regímenes de decodificación.
- Un solo checkpoint y una sola semilla: el propio autor advierte de que esto no es evidencia de una ventaja metodológica general ni de replicabilidad entre semillas.
- Reproducibilidad parcial: la auditoría se basa en un inventario de nombres, tamaños y fechas de modificación, no en un hash de tensores vinculado a las respuestas de evaluación. Los logs de servicio históricos están incompletos.
- Comparación SFT frente a ROSE no concluyente: difieren en planificación de learning rate, weight decay, precisión de parámetros, formato y límites de turnos, por lo que no es una ablación objetiva.
- Integridad de turnos no garantizada: el autor indica expresamente que cero errores de episodio no implica que todos los turnos generados estén bien formados.
- Idiomas no declarados: no hay lista de idiomas soportados para este ajuste; el comportamiento multilingüe es una incógnita.
- Formato y coste de despliegue: el repositorio ocupa 8,1 GB, coherente con pesos en fp32, lo que duplica el almacenamiento y el ancho de banda frente a una distribución en bf16. No se publican cuantizaciones GGUF, AWQ ni GPTQ.
- Artefactos ausentes: no se incluyen estado del optimizador, logs en bruto ni trayectorias del profesor, lo que limita la reinspección del proceso de entrenamiento.
- Fechas del repositorio en 2026: conviene verificar la vigencia y procedencia de los identificadores de modelo citados antes de integrarlos en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-1.7b-sft-textcraft-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencias y sumas de comprobación del experimento: fichero `experiment.json` en la raíz del repositorio
- Paper, blog o repositorio del entrenamiento: no disponible
- Demo o espacio asociado: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a medios de comunicación y a un fabricante de bicicletas sin relación con esta ficha
