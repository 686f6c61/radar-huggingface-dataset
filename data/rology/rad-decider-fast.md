# Rology/rad-decider-fast

## Resumen

Rology/rad-decider-fast es un modelo de clasificación de texto en inglés, desarrollado por Rology, orientado a la ayuda a la decisión en flujos de trabajo de radiología y teleradiología. No es un modelo generativo ni un modelo multimodal de imagen: se trata de un encoder afinado a partir de dmis-lab/UltraBERT-380M que recibe texto (presumiblemente informes radiológicos o descripciones clínicas) y devuelve una clasificación calibrada para apoyar decisiones operativas dentro de un pipeline de lectura de estudios.

El modelo se publica bajo licencia Apache 2.0, pero con acceso restringido (gated) en Hugging Face y con la etiqueta "research-only", lo que condiciona su uso en producción clínica. Su tamaño de repositorio es de 0,8 GB y el modelo base tiene 380 millones de parámetros, lo que lo sitúa en la gama de encoders medianos, adecuado para inferencia de baja latencia en CPU o GPU modestas.

Su relevancia actual reside en la creciente demanda de herramientas de triaje y priorización en servicios de radiología con carga elevada: un clasificador calibrado y ligero puede integrarse en sistemas de teleradiología para enrutar estudios, detectar casos que requieren revisión urgente o estandarizar decisiones de flujo de trabajo sin depender de un LLM generativo costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (fine-tune de dmis-lab/UltraBERT-380M) |
| Parametros totales | 380 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (con etiqueta research-only y acceso gated) |
| Formato de pesos | no disponible (repo de 0,8 GB; presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de dmis-lab/UltraBERT-380M, un encoder transformer de 380 millones de parámetros, y se presenta como un fine-tune para clasificación de texto ("finetune" en los tags de Hugging Face). La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de ajuste como RLHF o DPO; tampoco se especifica si se empleó calibración post-hoc de probabilidades, aunque la etiqueta "calibrated" sugiere que el autor declara algún tipo de calibración de las salidas.

No se dispone de información sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.), lo cual es coherente con un modelo de clasificación tipo encoder: no genera texto token a token. El pipeline declarado es text-classification, y el ámbito declarado es radiología y teleradiología con soporte a la decisión de flujo de trabajo.

## Capacidades

- Clasificación de texto en inglés orientada a dominios de radiología y teleradiología.
- Soporte a la decisión de flujo de trabajo ("workflow decision-support"), según los tags del modelo.
- Salidas declaradas como calibradas ("calibrated"), lo que en principio facilita el uso de umbrales de probabilidad en producción.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo "thinking".

## Casos de uso

- Triaje de informes radiológicos: el clasificador puede recibir el texto de un informe o una descripción clínica y asignar una categoría de prioridad, permitiendo enrutar estudios urgentes antes en la cola de lectura. Su tamaño de 380 M permite ejecutarlo en CPU con latencia baja.
- Enrutamiento en plataformas de teleradiología: integrado como paso previo a la asignación de un estudio a un radiólogo, el modelo puede clasificar el tipo de estudio o la subespecialidad requerida y dirigirlo al profesional adecuado.
- Control de calidad de informes: clasificar informes según criterios predefinidos (por ejemplo, presencia o ausencia de hallazgos críticos) para activar revisiones secundarias automáticas.
- Filtrado y priorización en grandes volúmenes: al ser un encoder de 380 M, puede procesar lotes de texto con throughput alto en GPU consumer, lo que lo hace apto para prefiltrar colas de miles de informes diarios.
- Señal auxiliar en sistemas de decisión clínica: usar la probabilidad calibrada como una característica más en un motor de reglas o un sistema de puntuación para decisiones de flujo (no diagnósticas).
- Investigación en procesamiento de lenguaje clínico: al estar etiquetado como research-only, es adecuado para experimentos académicos sobre clasificación de texto radiológico, comparación de encoders y estudios de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un encoder de 380 M en FP16 ocupa aproximadamente 0,8 GB de pesos; en FP32, alrededor de 1,5 GB. La VRAM total dependerá del tamaño de lote y de la longitud de secuencia, pero es manejable en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16; una RTX 3060, RTX 4060 o superior permite lotes grandes. Para despliegues de alto throughput, A100 o H100 no son necesarias, pero permiten mayor paralelismo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: al ser un modelo de clasificación de Hugging Face Transformers, puede servirse con Text Embeddings Inference (TEI), con un servidor FastAPI + Transformers, o exportarse a ONNX para inferencia optimizada. No se documenta soporte nativo en vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rology/rad-decider-fast | 380 M (base) | no disponible | Clasificación de texto radiológico | Apache 2.0, research-only, gated | Hugging Face (acceso restringido) |
| dmis-lab/UltraBERT-380M | 380 M | no disponible | Encoder general de dominio biomédico | no disponible en la información | Hugging Face |
| Modelos de clasificación clínica tipo BioBERT/PubMedBERT | ~110 M | 512 tokens (típico) | Clasificación y NER biomédico | habitualmente Apache 2.0 o MIT | Hugging Face |

La comparación con BioBERT o PubMedBERT se ofrece como referencia de categoría (encoders biomédicos), pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Etiqueta "research-only": el autor declara el modelo para investigación; no debe usarse como dispositivo médico ni para decisiones clínicas sin validación regulatoria.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada.
- Solo inglés: no soporta castellano ni otros idiomas, lo que restringe su uso en entornos clínicos hispanohablantes.
- Riesgo de alucinación y error de clasificación: como todo clasificador, puede producir falsos positivos y falsos negativos; la calibración declarada no garantiza un rendimiento clínico validado.
- Sesgos: no se documenta análisis de sesgos por subgrupos demográficos, tipo de estudio o institución; el dominio de entrenamiento no está descrito.
- Licencia Apache 2.0 permite uso comercial según la licencia, pero la etiqueta research-only y la ausencia de validación clínica desaconsejan su uso en producción sanitaria.
- No se dispone de información sobre el contexto máximo, lo que impide garantizar el procesamiento de informes largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rology/rad-decider-fast
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
