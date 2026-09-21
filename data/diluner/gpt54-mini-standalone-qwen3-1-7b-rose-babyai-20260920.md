# Diluner/gpt54-mini-standalone-qwen3-1.7b-rose-babyai-20260920

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-1.7B publicado por el usuario Diluner en Hugging Face, entrenado con la receta ROSE y un profesor (`gpt-5.4-mini`) mediante destilación/imitación, según indica su model card. Se trata del punto de control final de una etapa de entrenamiento sobre el entorno BabyAI, con cinco épocas completadas y 125 actualizaciones del optimizador en esa etapa. El entrenamiento es "standalone": se inicializó de forma independiente desde el modelo base y no es un checkpoint secuencial de un entrenamiento anterior.

El problema que aborda es acotado y de investigación: servir como artefacto reproducible para estudiar el entrenamiento de agentes con profesores externos y para evaluar la ejecución de instrucciones en entornos tipo BabyAI. No es un modelo de propósito general con tarjeta de producto: no declara licencia, no documenta idiomas ni contexto, y sus datos de rendimiento se limitan a una única tabla de éxito en BabyAI.

La relevancia es metodológica más que de producto. Con 2.031.739.904 parámetros totales (≈2,03 mil millones) y un repositorio de 4,1 GB en safetensors, es un modelo pequeño que cabe en GPUs de consumo, lo que lo hace útil para reproducir experimentos de agentes y de ajuste fino sobre Qwen3 en hardware asequible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-1.7B (la model card no la describe explícitamente) |
| Parámetros totales | 2.031.739.904 (≈2,03 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-1.7B declara 32.768 tokens nativos según su documentación pública) |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos en safetensors (4,1 GB, tamaño coherente con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el autor no afirma ninguna licencia y remite a los términos del modelo base |
| Formato de pesos | safetensors (todos los shards incluidos en la raíz del repositorio) |
| Modelo base | Qwen/Qwen3-1.7B (inicialización independiente, no secuencial) |
| Tamaño del repositorio | 4,1 GB |
| Fecha de creación | 2026-09-20 |
| Descargas / likes en el momento del análisis | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso, y se ajusta con la receta denominada ROSE usando `gpt-5.4-mini` como profesor. Según la model card, el resultado es el checkpoint final de una etapa completada sobre el entorno BabyAI: cinco épocas y 125 actualizaciones del optimizador en esa etapa. El entrenamiento se inicializó de forma independiente desde el modelo base ("standalone"), por lo que no debe interpretarse como la continuación de una cadena de checkpoints.

La documentación del autor incluye advertencias de procedencia relevantes: las recetas históricas de SFT y ROSE difieren en la planificación del learning rate, el weight decay, la precisión de los parámetros, el formateo y algunos límites de turnos de entrenamiento, por lo que no se trata de una ablación con objetivo único. Además, el inventario de selección registra nombres, tamaños y fechas de modificación de ficheros, pero no es un hash byte a byte de tensores que vincule el checkpoint con las respuestas de evaluación históricas. El repositorio no incluye estado del optimizador, logs en bruto ni trayectorias del profesor; las referencias y sumas de comprobación legibles por máquina están en `experiment.json`.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso como modelo de chat.
- Ejecución de instrucciones en entornos de agente: evaluado en el entorno BabyAI, donde el modelo debe traducir instrucciones en lenguaje natural a acciones.
- Entrenamiento orientado a agentes (`agent-training`): la receta ROSE con profesor externo está específicamente diseñada para este fin.
- Compatibilidad con despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, además de carga directa con `transformers`.
- Modo de razonamiento: la evaluación se realizó con "thinking disabled", lo que sugiere que el modelo conserva el modo de pensamiento de la familia Qwen3, aunque la model card no lo documenta como capacidad propia.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.

## Casos de uso

- Investigación en destilación desde profesores externos: el modelo es un artefacto de estudio de la receta ROSE con `gpt-5.4-mini` como profesor, útil para analizar cómo se comporta un modelo de 2,03B entrenado por imitación frente a su base.
- Evaluación de agentes en BabyAI: permite reproducir el protocolo avg@4 del autor (cuatro intentos por tarea oficial, temperatura 0.4, top-p 1.0, top-k 20, sin thinking, 512 tokens por turno) y comparar contra el checkpoint base.
- Baseline en experimentos de ajuste fino: al derivar de Qwen3-1.7B, sirve como referencia controlada en estudios de SFT frente a ROSE, con las salvedades de que las recetas no son comparables en todos los hiperparámetros.
- Prototipado de asistentes conversacionales autoalojados: con 4,1 GB de pesos en safetensors se puede desplegar en una GPU de consumo para pruebas de diálogo multi-turno, siempre que se asuman la ausencia de licencia declarada y la falta de garantías de calidad general.
- Despliegue en entornos con hardware limitado: al ser un modelo denso de 2,03B, es candidato para inferencia en edge o en instancias pequeñas, previa conversión a formatos cuantizados, que el repositorio no proporciona.
- Generación de texto por lotes en pipelines internos: su tamaño permite procesar volúmenes altos con coste bajo en GPUs de gama media, útil para tareas de anotación o generación auxiliar no críticas.
- Estudio de los efectos de desactivar el modo de razonamiento: dado que la evaluación se hizo con thinking desactivado, es un caso de uso directo comparar el comportamiento con y sin ese modo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al entorno BabyAI, con protocolo avg@4 (media de éxito en cuatro intentos por tarea oficial, no mejor de cuatro). Configuración de evaluación: temperatura 0.4, top-p 1.0, top-k 20, thinking desactivado y 512 tokens generados por turno.

| Entorno | Éxitos / intentos | Éxito avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 321 / 360 | 89,1667 % | 0 |

El autor advierte que cero errores de episodio no implica que todos los turnos generados estén bien formados, y que debe usarse la evaluación reparada completa en lugar del resumen original que excluía errores, ya que algunos artefactos reparados reutilizan rollouts originales completos y los logs de servicio históricos están incompletos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark general en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 4,1 GB solo para los pesos, más caché KV y activaciones; en la práctica unos 5-6 GB para ventanas cortas y generaciones de 512 tokens.
- VRAM estimada cuantizado: aproximadamente 2,1 GB en INT8 y 1,1-1,3 GB en INT4, pero estas conversiones no están publicadas en el repositorio y tendría que generarlas el usuario.
- Cabe en GPU de consumo: sí. Es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y tarjetas de 8 GB con margen ajustado en bf16.
- GPU de datacenter: A100, H100 y similares funcionan sin problema, aunque están sobredimensionadas para 2,03B de parámetros salvo que se busque throughput agregado.
- Opciones de despliegue: `transformers` de forma nativa (el propio repositorio incluye el fragmento de carga con `AutoTokenizer` y `AutoModelForCausalLM`), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y vLLM por compatibilidad con la arquitectura Qwen3, aunque no está verificado en la model card. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (gpt54-mini-standalone-qwen3-1.7b-rose-babyai) | 2,03B | No disponible en su model card | ROSE con profesor `gpt-5.4-mini`, 5 épocas, etapa babyai | No disponible | Público en Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 2,03B | 32.768 tokens nativos según su documentación pública | Preentrenamiento y post-entrenamiento de Qwen | Apache 2.0 según su model card pública | Público, ampliamente utilizado |
| Modelos instruct generalistas de 1-2B (por ejemplo, familias Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct) | Aproximadamente 1,2-1,5B | No disponible en esta ficha | SFT y alineación generalista | Apache 2.0 / licencia comunitaria del fabricante | Públicos y muy desplegados |

La comparación con alternativas generalistas no es directa: este checkpoint está optimizado para una única tarea de agente en BabyAI y no publica resultados en benchmarks generales, por lo que no puede establecerse una superioridad o inferioridad de rendimiento frente a modelos instruct con los datos disponibles.

## Limitaciones y advertencias

- Licencia: el autor no afirma ninguna licencia. Cualquier uso comercial depende de los términos del modelo base Qwen/Qwen3-1.7B y debe verificarse antes de desplegarlo.
- Evidencia de un único checkpoint: la model card indica explícitamente que no constituye evidencia de una ventaja metodológica general ni de replicación entre semillas de entrenamiento.
- Trazabilidad incompleta: el inventario de selección no es un hash byte a byte de tensores, los logs de servicio históricos están incompletos y parte de los artefactos reparados reutilizan rollouts originales.
- Comparación no controlada: las recetas de SFT y ROSE difieren en learning rate, weight decay, precisión de parámetros, formateo y límites de turnos, por lo que las diferencias observadas no pueden atribuirse solo al objetivo de entrenamiento.
- Métrica: el resultado de 89,1667 % es avg@4, no mejor de cuatro; no debe presentarse como éxito en el mejor intento.
- Cero errores de episodio no equivale a turnos bien formados; el autor señala que la evaluación debe usar la versión reparada completa.
- Idiomas: no se documentan, por lo que el comportamiento multilingüe es desconocido.
- Contexto: no se declara en la model card; conviene verificar el límite real antes de usarlo con conversaciones o documentos largos.
- Idiomas y sesgos: no hay información sobre composición del dataset de destilación más allá del profesor `gpt-5.4-mini`, de modo que los sesgos heredados del profesor y del modelo base no están caracterizados.
- Alucinación: no se publican evaluaciones de fidelidad ni de tasa de alucinación; en un modelo de 2,03B ajustado por imitación el riesgo es relevante y no está medido.
- Tool calling y agentes generales: no hay evidencia de soporte de function calling fuera del entorno BabyAI.
- Estado del repositorio: 0 descargas y 0 likes en el momento del análisis, sin validación externa por parte de la comunidad.
- Artefactos ausentes: no se incluyen el estado del optimizador, los logs en bruto ni las trayectorias del profesor, lo que dificulta la reproducción exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-1.7b-rose-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Referencias y sumas de comprobación legibles por máquina: fichero `experiment.json` en la raíz del repositorio del modelo
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios de ajedrez (chess.com) y no guardan relación con esta ficha.
