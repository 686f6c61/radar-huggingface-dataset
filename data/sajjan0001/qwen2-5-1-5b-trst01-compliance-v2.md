# sajjan0001/qwen2.5-1.5b-trst01-compliance-v2

## Resumen

`sajjan0001/qwen2.5-1.5b-trst01-compliance-v2` es un ajuste fino (fine-tune) del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el usuario `sajjan0001` en HuggingFace. Se trata de un modelo decoder-only de aproximadamente 1.500 millones de parámetros, entrenado mediante SFT (supervised fine-tuning) con la librería TRL 1.13.0 sobre el stack Transformers 5.17.0 y PyTorch 2.11.0. El nombre del checkpoint ("trst01-compliance-v2") apunta a un ajuste orientado a tareas de cumplimiento normativo, pero la model card no documenta ni el dataset, ni el número de ejemplos, ni los hiperparámetros empleados.

La relevancia de este tipo de publicaciones es doble. Por un lado, ilustra el flujo habitual de adaptación de modelos pequeños a dominios verticales concretos (compliance, legal, políticas internas) donde el coste de inferencia y el despliegue en local priman sobre el rendimiento bruto. Por otro, sirve como caso de estudio de las limitaciones del ecosistema: modelos con licencia sin declarar, sin métricas publicadas, sin dataset documentado y con cero descargas, lo que impide cualquier evaluación rigurosa por parte de terceros.

En el momento de redactar esta ficha, el repositorio tiene 0 descargas y 0 "likes", ocupa 0,2 GB y no incluye resultados de benchmarks ni información sobre composición del dataset de entrenamiento. Toda la información técnica disponible procede del modelo base y del `README` autogenerado por TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, SwiGLU y RMSNorm (heredada del modelo base Qwen2.5-1.5B-Instruct; no confirmada en la model card) |
| Parametros totales | ~1.500 millones (modelo base; no confirmado en la model card del fine-tune) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | no disponible; el repositorio no publica pesos GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 declara soporte multilingue (incluido castellano) |
| Licencia | no disponible; el YAML de la model card contiene el marcador de posición `licence: license`, sin licencia efectiva declarada |
| Formato de pesos | safetensors (etiqueta del repositorio), compatible con `transformers` |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Framework de entrenamiento | TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5. Esa familia emplea Grouped Query Attention (GQA) para reducir el coste de la caché KV, RoPE como codificación posicional, SwiGLU en las capas feed-forward y RMSNorm para normalización. El modelo base fue post-entrenado por Alibaba mediante SFT y optimización preferencial (DPO), y su card declara soporte de plantillas de chat tipo ChatML, generación de JSON estructurado y capacidades multilingües. No obstante, conviene subrayar que ninguna de estas características está verificada para el fine-tune que nos ocupa: son propiedades heredadas del checkpoint de partida, no declaradas por el autor del ajuste.

En cuanto al entrenamiento específico, la única información disponible es que se realizó SFT con TRL. La model card no indica número de pasos, épocas, learning rate, tamaño de lote, composición del dataset ni procedimiento de evaluación. Tampoco hay evidencia de una fase posterior de RLHF, DPO o GRPO aplicada sobre este checkpoint. El marcador temporal del repositorio (16 de septiembre de 2026 en creación y actualización, con siete segundos de diferencia) y un tamaño de 0,2 GB —muy inferior a los ~3 GB que ocuparía un checkpoint completo de 1.500 millones de parámetros en fp16— sugieren o bien que los metadatos son inconsistentes, o bien que el repositorio contiene únicamente un subconjunto de pesos o un adaptador, cuestión que la documentación no aclara.

## Capacidades

- Generación de texto conversacional: hereda del modelo base la capacidad de mantener diálogo multi-turno con formato de plantilla de chat.
- Razonamiento y respuesta a instrucciones: el ajuste SFT refuerza el seguimiento de instrucciones, presumiblemente orientado a dominios de cumplimiento normativo, aunque no se documenta el alcance real del ajuste.
- Generación de código y matemáticas básicas: capacidad presente en el modelo base a nivel de modelo pequeño; el fine-tune podría haberla degradado si el dataset era estrecho y especializado.
- Capacidades multilingües: el modelo base Qwen2.5 cubre decenas de idiomas, con buen rendimiento relativo en inglés y chino; no hay confirmación para este checkpoint.
- Salidas estructuradas: el modelo base admite generación de JSON; no verificado tras el ajuste.
- Tool calling / function calling: el modelo base lo soporta de forma limitada por su tamaño; no hay ninguna confirmación para este fine-tune.
- Modo "thinking" o razonamiento extendido: no soportado.
- Visión o audio: no soportado (no es un modelo multimodal).

## Casos de uso

- Asistente interno de consultas de cumplimiento normativo: desplegado en local sobre la intranet de una empresa, el modelo respondería preguntas sobre políticas internas, procedimientos y normativa sectorial, manteniendo los datos dentro de la organización. Su tamaño permite ejecutarlo en una única GPU de gama media sin costes de API.
- Triage y clasificación de textos regulatorios: dado su tamaño reducido y baja latencia, es viable procesar lotes de documentos (circulares, contratos, cláusulas) para etiquetarlos por categoría de riesgo o área normativa, siempre que se valide la calidad del ajuste con un conjunto de test propio.
- Preprocesado en pipelines RAG: usar el modelo como componente generador de resúmenes de fragmentos recuperados o como reformulador de consultas antes de pasarlas a un modelo mayor, reduciendo el coste total del sistema.
- Prototipado rápido y pruebas de concepto: al caber en una GPU de consumo y ejecutarse con `transformers` o `llama.cpp`, resulta adecuado para validar una idea de producto antes de invertir en modelos de mayor tamaño.
- Evaluación comparativa de fine-tunes: útil como referencia en experimentos internos que comparen distintas estrategias de SFT sobre el mismo modelo base, dado que el checkpoint y el framework quedan documentados en la model card.
- Generación de datos sintéticos de dominio: con supervisión humana, puede emplearse para producir borradores de preguntas y respuestas sobre normativa que después se filtren y se usen para entrenar modelos mayores.
- Despliegue en el borde o entornos sin conectividad: su huella de memoria permite ejecutarlo en estaciones de trabajo sin GPU dedicada o en dispositivos con CPU, útil para entornos con requisitos de confidencialidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación, ni comparaciones con el modelo base. Tampoco se documenta una evaluación de regresión que confirme que el ajuste SFT no ha degradado las capacidades generales del checkpoint `Qwen2.5-1.5B-Instruct`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas, no medidas por el autor): ~3,1 GB en fp16, ~1,6 GB en int8, ~0,9–1,1 GB en cuantización de 4 bits, más la caché KV que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente para fp16 en contextos cortos; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G, A100 y H100 admiten el modelo con margen amplio y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual (RTX 3050 8 GB en adelante) e incluso en iGPU con memoria unificada si se cuantiza a 4 bits.
- Inferencia en CPU: viable con llama.cpp u Ollama, con velocidades del orden de decenas de tokens por segundo en procesadores modernos de escritorio, si bien no se han publicado medidas concretas.
- Opciones de despliegue: `transformers` (documentado en la model card), vLLM, SGLang, TGI, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repositorio), LM Studio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de la columna de este modelo reflejan lo declarado en la información proporcionada; los del resto de modelos proceden de la documentación pública de sus respectivos repositorios y no se han verificado en el contexto de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sajjan0001/qwen2.5-1.5b-trst01-compliance-v2 | ~1,5B (heredado del base) | no disponible | no disponible | 0 descargas, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | Ampliamente distribuido, con benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens | Licencia comunitaria de Meta | Ampliamente distribuido, con benchmarks publicados |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens | Apache-2.0 | Ampliamente distribuido, con benchmarks publicados |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | Ampliamente distribuido, con benchmarks publicados |

La diferencia fundamental no está en la arquitectura ni en el tamaño, sino en la trazabilidad: los cuatro modelos de referencia publican licencia, dataset y evaluaciones, mientras que este fine-tune no aporta ninguno de esos tres elementos.

## Limitaciones y advertencias

- Licencia sin declarar: el campo del YAML contiene el literal `licence: license`, un marcador de posición. Sin una licencia explícita, no puede asumirse permiso de uso comercial, y en la práctica el modelo se distribuye bajo los términos del modelo base Apache-2.0 más cualquier restricción adicional que el autor quisiera imponer (no documentada).
- Dataset de entrenamiento no documentado: se desconoce la composición, el idioma, el tamaño y la procedencia de los datos de SFT, lo que impide evaluar sesgos, contaminación o cobertura temática.
- Sin evaluación publicada: no existen métricas que confirmen mejora sobre el modelo base ni que descarten una degradación de capacidades generales por sobreajuste al dominio.
- Riesgo de alucinación: en dominios de cumplimiento normativo, un modelo de 1,5B puede generar referencias legales plausibles pero falsas; cualquier uso en producción exige verificación humana o anclaje documental mediante RAG.
- Idiomas no confirmados: aunque el modelo base es multilingüe, no hay garantía de que el ajuste SFT conserve un rendimiento aceptable en castellano si el dataset era monolingüe.
- Inconsistencia de metadatos: el tamaño del repositorio (0,2 GB) es incompatible con un checkpoint completo de 1,5B en fp16, y las fechas de creación y actualización (2026-09-16) resultan anómalas; conviene verificar el contenido real del repositorio antes de descargarlo.
- Sin historial de uso: cero descargas y cero interacciones significan ausencia total de validación por parte de la comunidad.
- Contexto no confirmado: la ventana real del fine-tune podría diferir de la del modelo base si el entrenamiento se hizo con secuencias más cortas.
- Reproducibilidad limitada: las versiones de framework declaradas (Transformers 5.17.0, PyTorch 2.11.0) corresponden a versiones futuras respecto al estado público habitual del ecosistema, lo que puede complicar la carga del modelo en entornos estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sajjan0001/qwen2.5-1.5b-trst01-compliance-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de alquiler de libros de texto y ayuda académica, sin relación con el checkpoint analizado.
