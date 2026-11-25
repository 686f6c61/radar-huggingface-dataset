# Rbooii/CyberBully-Detection-indoBERT

## Resumen

CyberBully-Detection-indoBERT es un modelo publicado en Hugging Face por el usuario Rbooii, cuyo nombre sugiere un fine-tuning de IndoBERT orientado a la detección de ciberacoso (cyberbullying) en textos en indonesio. Se trata, por tanto, de un modelo de clasificación de texto construido presumiblemente sobre la arquitectura BERT de IndoBERT, el encoder preentrenado en indonesio desarrollado por el IndoNLP/Universitas Indonesia. El identificador del repositorio y la etiqueta de licencia MIT son los únicos metadatos verificables en la información disponible.

La relevancia del modelo es limitada en el estado actual: cuenta con 0 descargas y 1 like en el momento de la consulta, la model card pública no contiene más que la declaración de licencia (`license: mit`) y no se especifican parámetros, contexto, datos de entrenamiento ni métricas de evaluación. No hay pipeline declarado en Hugging Face, lo que impide confirmar si el artefacto está configurado para `text-classification` u otra tarea.

Por tanto, esta ficha debe leerse como una descripción estructural del modelo a partir de su nomenclatura y del ecosistema IndoBERT, marcando explícitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier uso en producción requeriría inspeccionar directamente los pesos y la configuración del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere BERT/IndoBERT, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere indonesio) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El sufijo "indoBERT" del identificador apunta a un encoder de la familia BERT preentrenado en indonesio, habitualmente con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención (unos 124 millones de parámetros) en su variante base, y 24 capas con 1024 dimensiones en la variante large. Estas cifras son las del IndoBERT original y no deben atribuirse a este repositorio sin verificación directa de su `config.json`.

Tampoco se documentan los datos de entrenamiento: ni el número de ejemplos, ni la composición del corpus de ciberacoso, ni si hubo balanceo de clases, aumento de datos o ajuste fino con cabecera de clasificación binaria o multiclase. No consta información sobre RLHF, DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, destilación). El repositorio no incluye métricas de evaluación ni una sección de resultados.

## Capacidades

- Clasificación de texto: por el nombre del modelo, se espera que asigne una etiqueta de ciberacoso o no ciberacoso a un fragmento de texto, aunque la taxonomía exacta no está documentada.
- Procesamiento de indonesio: presumiblemente hereda el vocabulario y el preentrenamiento de IndoBERT, pero no se confirma en la model card.
- Generación de texto: no disponible; un encoder BERT no está diseñado para generación libre.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de comentarios en foros y redes sociales en indonesio: el modelo se usaría como clasificador de una sola pasada sobre cada comentario para marcar posibles casos de acoso y derivarlos a revisión humana; encaja por su previsible bajo coste de inferencia frente a un LLM generativo, aunque requiere validar antes la taxonomía real del checkpoint.
- Filtrado previo en plataformas de mensajería escolar: integrado como servicio HTTP detrás de un umbral de confianza, permitiría priorizar la cola de moderación; la licencia MIT facilita su incorporación a productos propietarios.
- Investigación en procesamiento del lenguaje indonesio: sirve como punto de partida para reproducir o comparar experimentos de detección de ciberacoso, siempre que se documenten las métricas que el autor no ha publicado.
- Análisis de toxicidad en corpus académicos: aplicación por lotes sobre datasets de Twitter o foros indonesios para etiquetar subconjuntos y estudiar la prevalencia de acoso.
- Enrutado en sistemas de atención al cliente: clasificar mensajes entrantes para separar los que requieren escalado humano por contenido abusivo, con un modelo pequeño que puede ejecutarse en CPU.
- Prototipado rápido con la librería Transformers: al ser un repositorio de Hugging Face, puede cargarse con `AutoModelForSequenceClassification` si la configuración es correcta, lo que permite iterar en cuadernos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; si se confirma que es un BERT base (~124 M de parámetros), la inferencia en fp32 ocuparía en torno a 0,5 GB de pesos, y en fp16 unos 0,25 GB, más memoria para activaciones y tokenizador.
- GPU recomendadas: no disponibles; para un encoder de ese tamaño bastaría una GPU consumer modesta (GTX 1660, RTX 3060) o incluso CPU para lotes pequeños.
- Cabe en GPU consumer: probablemente sí si se trata de un BERT base, pero no confirmado por el autor.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime, o exportación a GGUF para llama.cpp si el artefacto lo permite; vLLM y TGI están orientados a modelos generativos y no serían la vía natural para un encoder de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberBully-Detection-indoBERT | no disponible | no disponible | clasificación de ciberacoso (presunta) | MIT | Hugging Face, 0 descargas |
| IndoBERT base (IndoNLP) | ~124 M | 512 tokens | encoder de propósito general | no disponible en esta consulta | Hugging Face, ampliamente usado |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | encoder multilingüe | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens | encoder multilingüe | MIT | Hugging Face |

La comparación con IndoBERT base y mBERT es pertinente por familia arquitectónica, pero no se dispone de métricas de este checkpoint para establecer una comparación de rendimiento real.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo declara la licencia, sin describir datos, etiquetas, métricas ni limitaciones.
- Riesgo de sesgos desconocidos: al no publicarse la composición del corpus de entrenamiento, no puede evaluarse el sesgo por género, religión, etnia o registro lingüístico, especialmente relevante en una tarea de moderación.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin tasas publicadas.
- Cobertura idiomática incierta: no se declaran idiomas en los metadatos; el nombre sugiere indonesio, pero no se confirma ni se descarta el multilingüismo.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso del modelo.
- Sin pipeline declarado en Hugging Face: la carga con `pipeline("text-classification")` podría fallar si falta la configuración de la cabecera; conviene inspeccionar el repositorio antes de integrarlo.
- Para producción: exigiría una evaluación propia sobre un conjunto etiquetado del dominio objetivo, calibración de umbrales y un flujo de revisión humana dado el carácter sensible de la moderación de acoso.

## Enlaces

- [Hugging Face: Rbooii/CyberBully-Detection-indoBERT](https://huggingface.co/Rbooii/CyberBully-Detection-indoBERT)
- [IndoBERT (IndoNLP) en Hugging Face](https://huggingface.co/indobenchmark/indobert-base-p1)
- [mBERT en Hugging Face](https://huggingface.co/bert-base-multilingual-cased)
- [XLM-RoBERTa base en Hugging Face](https://huggingface.co/FacebookAI/xlm-roberta-base)
