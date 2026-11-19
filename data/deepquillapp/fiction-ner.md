# deepquillapp/fiction-ner

## Resumen

DeepQuill fiction NER es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto de ficción literaria, desarrollado por deepquillapp para su uso interno en la aplicación DeepQuill. El modelo identifica personajes, lugares, organizaciones y entidades misceláneas en manuscritos, un dominio donde los NER genéricos entrenados en noticias o web rinden peor debido a la naturaleza de los nombres ficticios y las convenciones narrativas. Se trata de una destilación de `FacebookAI/roberta-base` a partir del modelo profesor `Jean-Baptiste/roberta-large-ner-english`, con aproximadamente un tercio del tamano del profesor.

El modelo se distribuye en formato ONNX (fp32) con la librería `onnx`, lo que facilita su despliegue en entornos sin PyTorch y en CPU. Incluye una configuración específica de ventaneo (`ner_config.json`) con 510 tokens y solapamiento de 50 tokens, pensada para procesar manuscritos largos por fragmentos. La relevancia actual reside en su enfoque de destilación orientada a un dominio concreto (ficción) con evaluación sobre LitBank y sobre listas de reparto reales, además de una reducción notable de memoria y latencia frente al profesor.

La licencia es MIT, lo que permite uso comercial sin restricciones significativas, y el modelo solo soporta inglés. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, destilado de roberta-large-ner-english) |
| Parametros totales | no disponible (roberta-base: ~125 M; el modelo card indica "about a third" del profesor roberta-large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 510 tokens con tokens especiales; ventaneo con solapamiento de 50 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en fp32 ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa base destilado del profesor `Jean-Baptiste/roberta-large-ner-english` (commit `8f3abc1e`). La tarea es token-classification con etiquetas `O`, `B-`/`I-` para `PER`, `ORG`, `LOC` y `MISC`, agregadas por palabra con la estrategia "simple". El preprocesamiento divide el texto en ventanas de 510 tokens con 50 tokens de solapamiento, definido en `ner_config.json`.

El entrenamiento combinó etiquetas del profesor sobre 79 novelas de dominio público de Project Gutenberg y etiquetas gold de LitBank (commit `3e50db0f`), concretamente sus menciones de nombres propios en 80 documentos de entrenamiento. Se realizaron 3 épocas con semilla 1. El autor declara explícitamente que no se entrenó con CoNLL-2003, OntoNotes ni otros datasets de solo investigación; el profesor sí lista CoNLL-2003 en su card, pero sus pesos son MIT. La innovación principal es la destilación hacia un dominio literario con evaluación downstream (resolución de pronombres y detección de punto de vista) además de la métrica de spans.

## Capacidades

- Reconocimiento de entidades nombradas en texto de ficción: personajes (`PER`), lugares (`LOC`), organizaciones (`ORG`) y miscelánea (`MISC`).
- Extracción de listas de reparto (cast lists) de manuscritos y novelas.
- Procesamiento de documentos largos mediante ventaneo con solapamiento.
- Agregación de etiquetas a nivel de palabra.
- Soporte de resolución de pronombres y detección de punto de vista como tareas downstream (según evaluación del autor).
- Ejecución en CPU sin PyTorch gracias al formato ONNX.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de personajes en manuscritos: la app DeepQuill usa el modelo para localizar menciones de personajes y construir listas de reparto; el ventaneo de 510 tokens con solapamiento permite procesar novelas completas sin perder entidades en los cortes.
- Análisis literario automatizado: investigadores pueden extraer entidades de corpus de dominio público (p. ej. Project Gutenberg) para estudios de caracterización, redes de personajes o geografía narrativa, con la ventaja de estar entrenado sobre ese mismo tipo de texto.
- Preprocesamiento para resolución de correferencia: las menciones `PER` detectadas alimentan pipelines de coreferencia y resolución de pronombres, tarea en la que el autor reporta rendimiento igual o mejor que el profesor.
- Edición y revisión editorial: detección de inconsistencias en nombres de personajes o lugares a lo largo de un manuscrito, agrupando menciones por entidad.
- Despliegue en entornos sin GPU: al ser ONNX fp32, puede ejecutarse en servidores CPU o portátiles; el autor reporta 31 s para una novela de 69 escenas en un Apple M5 Pro con 0,52 GB de memoria pico.
- Etiquetado de datasets literarios: generación de etiquetas preliminares de entidades sobre nuevos corpus de ficción para su posterior revisión humana, dado el bajo coste computacional frente al profesor.
- Integración en aplicaciones de escritura: sugerencias en tiempo real sobre nombres de personajes y lugares mientras el autor escribe, gracias a la baja latencia y huella de memoria.

## Benchmarks y rendimiento

Evaluación contra el profesor en el pipeline completo de DeepQuill, sobre listas de reparto de 7 libros (F1 agrupado, IC bootstrap 95 %):

| Métrica | Δ vs profesor |
|---|---|
| Global | −0,007 [−0,021, +0,001] |
| Personajes | −0,008 [−0,021, +0,002] |
| Lugares | −0,008 [−0,022, +0,003] |

LitBank test (10 documentos reservados, F1 exact span):

| Entidad | DeepQuill fiction NER | Profesor |
|---|---|---|
| PER | 0,851 | 0,718 |
| LOC | 0,732 | 0,562 |

Rendimiento computacional:

| Métrica | DeepQuill fiction NER | Profesor |
|---|---|---|
| Tiempo (novela de 69 escenas, Apple M5 Pro CPU) | 31 s | 80 s |
| Memoria pico | 0,52 GB | 2,49 GB |

## Requisitos de hardware

- VRAM estimada: no aplica en CPU; en GPU, el modelo ONNX fp32 ocupa aproximadamente 0,5 GB de pesos, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no se requieren; cualquier GPU consumer (p. ej. RTX 3060 en adelante) es suficiente. Para entrenamiento o fine-tuning adicional se recomienda una GPU con al menos 8 GB.
- Cabe en GPU consumer: sí, en todas las GPU modernas, e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo), integración en aplicaciones Python vía `onnxruntime`; no se distribuyen pesos en safetensors ni GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: 31 s por novela de 69 escenas en Apple M5 Pro CPU; memoria pico 0,52 GB. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| DeepQuill fiction NER | ~1/3 de roberta-large (base) | 510 tokens (ventaneo) | MIT | ONNX | Ficción literaria, inglés |
| Jean-Baptiste/roberta-large-ner-english (profesor) | RoBERTa large (~355 M) | 512 tokens | MIT | safetensors/PyTorch | NER general, inglés |
| FacebookAI/roberta-base | ~125 M | 512 tokens | MIT | safetensors/PyTorch | Base sin fine-tuning NER |
| Modelos NER tipo spaCy `en_core_web_trf` | no disponible | 512 tokens | MIT | spaCy | NER general, inglés |

El modelo supera al profesor en F1 exact span sobre LitBank (PER 0,851 frente a 0,718; LOC 0,732 frente a 0,562) con un tercio del tamano, aunque en el pipeline completo de listas de reparto las diferencias son ligeramente negativas y no significativas. Frente a NER genéricos como los de spaCy, la ventaja es la especialización en ficción, aunque no se dispone de comparación directa publicada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Entrenado exclusivamente con etiquetas del profesor sobre Gutenberg y gold de LitBank; puede heredar sesgos del profesor y del corpus literario (predominio de nombres anglófonos y occidentales).
- Riesgo de alucinación de entidades en textos no literarios o con formatos atípicos; el ventaneo con solapamiento puede duplicar menciones si no se deduplica aguas abajo.
- El modelo card no documenta análisis de sesgos por género, etnia o geografía.
- La evaluación se limita a 7 libros y 10 documentos de LitBank; la generalización a otros géneros (ciencia ficción, fantasía no anglófona) no está validada.
- Licencia MIT permite uso comercial, pero se recomienda atribuir LitBank (CC BY 4.0) y citar los trabajos de Bamman et al. según indica el autor.
- No apto para tareas generativas, tool calling ni agentes; es exclusivamente un etiquetador de tokens.
- El repositorio no registra descargas ni likes, lo que sugiere poca validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/deepquillapp/fiction-ner
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Modelo profesor: https://huggingface.co/Jean-Baptiste/roberta-large-ner-english
- LitBank (paper NAACL 2019): https://aclanthology.org/N19-1076/
- LitBank coreference (paper LREC 2020): https://aclanthology.org/2020.lrec-1.302/
- Project Gutenberg: https://www.gutenberg.org/
