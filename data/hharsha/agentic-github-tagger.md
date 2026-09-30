# hharsha/agentic-github-tagger

## Resumen

agentic-github-tagger es un modelo de generación texto-a-texto de pequeno tamano (60.506.624 parametros) desarrollado por el usuario hharsha, cuyo proposito es generar etiquetas separadas por comas para descripciones de proyectos de estilo GitHub relacionadas con IA agentica, RAG y LLMOps. Se trata de un ajuste fino de google-t5/t5-small mediante PEFT LoRA (r=16, alpha=32, dropout=0.05, modulos objetivo q y v) sobre el dataset hharsha/agentic-github-meta, y los adaptadores se han fusionado con los pesos base para que el modelo completo se pueda cargar en CPU sin dependencias adicionales.

El modelo resuelve un problema muy concreto y acotado: dada una frase descriptiva de un repositorio o proyecto (por ejemplo "multi-agent platform with RAG, MCP, and observability"), devuelve una lista de etiquetas como "multi-agent, observability, rag, mCP". No es un asistente conversacional ni un modelo de razonamiento: es una utilidad ligera de anotacion automatica pensada para integrarse en pipelines de catalogacion, indexado o curación de metadatos.

Su relevancia radica en el coste de despliegue casi nulo (pesos completos de aproximadamente 60M de parametros, repo de 0.5 GB, licencia Apache 2.0) y en su caracter de ejemplo reproducible de ajuste fino con LoRA sobre un corpus pequeno (687 filas, 600 usadas para entrenamiento) ejecutado integramente en CPU. La contrapartida es un alcance limitado: solo ingles, sin datos publicados de benchmarks y con calidad de etiquetado que el propio autor califica como propensa a repeticiones e incompletitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), base google-t5/t5-small, ajustado con PEFT LoRA y posterior fusion de adaptadores |
| Parametros totales | 60.506.624 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base T5-small esta configurado para 512 tokens de entrada |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ; solo pesos completos) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, cargables con transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de T5-small, un transformer encoder-decoder con atencion completa y sesgos de posicion relativa, de aproximadamente 60M de parametros. Sobre esa base se aplico un ajuste fino con PEFT LoRA de rango 16, alpha 32 y dropout 0.05, limitado a los modulos de proyeccion q y v de la atencion. Tras el entrenamiento, los adaptadores LoRA se fusionaron en los pesos base, de modo que el repositorio contiene un checkpoint unico de tipo seq2seq cargable con AutoModelForSeq2SeqLM, sin necesidad de gestionar adaptadores por separado.

El entrenamiento se realizo durante 3 epocas con tamano de lote 8 en CPU, sobre el dataset hharsha/agentic-github-meta, compuesto por 687 filas de las que 600 se destinaron a entrenamiento. No se menciona en la informacion disponible el numero total de tokens, la composicion detallada del dataset, ni el uso de tecnicas de alineacion como RLHF, DPO o decodificacion especulativa. Tampoco se documentan innovaciones arquitectonicas mas alla del propio ajuste con LoRA; la unica decision tecnica destacable es la fusion de adaptadores para facilitar el despliegue en CPU.

## Capacidades

- Generacion de texto texto-a-texto orientada exclusivamente a producir listas de etiquetas separadas por comas.
- Etiquetado de descripciones de proyectos de IA agentica, RAG y LLMOps (por ejemplo "rag", "multi-agent", "observability", "mCP").
- Funcionamiento en CPU sin GPU, gracias al tamano reducido y a la fusion de pesos.
- Integracion con la libreria transformers mediante AutoModelForSeq2SeqLM, AutoTokenizer y el pipeline text2text-generation.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles segun las etiquetas del repositorio.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion.
- No dispone de vision, audio, modo thinking ni otras modalidades.
- Soporte multilingue limitado al ingles; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Auto-etiquetado de repositorios en una plataforma tipo GitHub: el modelo recibe la descripcion corta de un repositorio y devuelve una lista de etiquetas que se pueden asignar automaticamente al proyecto, reduciendo el trabajo manual de catalogacion de proyectos de IA agentica.
- Enriquecimiento de metadatos en catalogos internos de herramientas: en un registro corporativo de librerias o servicios de IA, el modelo genera etiquetas normalizadas que alimentan filtros de busqueda por tecnologia (por ejemplo "rag" o "llmops").
- Preprocesamiento para pipelines RAG: las etiquetas producidas pueden almacenarse como metadatos filtrables junto a los embeddings de los documentos, de modo que el recuperador pueda restringir la busqueda por categoria tematica antes del reranking.
- Indexacion y busqueda semantica de issues o pull requests: al etiquetar automaticamente el texto de un issue con temas de agentes o RAG, se facilita la asignacion a equipos y la busqueda de incidencias relacionadas.
- Asistencia a la curación de datasets: el modelo puede preetiquetar grandes volumenes de descripciones y dejar al revisor humano unicamente la validacion de las propuestas, dado su bajisimo coste por inferencia.
- Prototipos y demostraciones en entornos sin GPU: al ejecutarse en CPU y ocupar menos de 1 GB en disco, es adecuado para cuadernos de demostracion, entornos de integracion continua o despliegues en dispositivos modestos.
- Clasificacion preliminar de propuestas en formularios: en un formulario donde el usuario describe su proyecto en una frase, el modelo puede sugerir etiquetas de forma inmediata para autocompletar el campo de categorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni evaluaciones especificas de calidad de etiquetado (por ejemplo precision, recall o F1 sobre etiquetas). El unico indicio de rendimiento cualitativo es el ejemplo de salida incluido por el autor, que muestra repeticiones ("multi-agent, multi-agent, observability, rag, mCP, observability") y etiquetas incompletas, lo que sugiere una calidad limitada del etiquetado en esta ejecucion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 240 MB en precision fp32 y unos 120 MB en fp16 o bf16, dado el tamano de 60,5M de parametros. Cifras orientativas calculadas a partir del numero de parametros; no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas NVIDIA GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100. El modelo no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. El autor indica explicitamente que esta pensado para cargar en CPU gratuita.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM y pipeline text2text-generation), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. No se publican pesos GGUF, por lo que el uso directo con llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de latencia ni de tokens por segundo. El entrenamiento se completo en CPU en 3 epocas, lo que es indicativo del reducido coste computacional del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hharsha/agentic-github-tagger | 60,5M | no disponible (base T5-small: 512 tokens) | Generacion de etiquetas para proyectos agenticos/RAG/LLMOps | Apache 2.0 | HuggingFace, peso fusionado en safetensors |
| google-t5/t5-small | 60,5M | 512 tokens | Texto-a-texto generico (traduccion, resumen, QA, etc.) | Apache 2.0 | HuggingFace |
| google/flan-t5-small | 80M | 512 tokens | Texto-a-texto con ajuste por instrucciones | Apache 2.0 | HuggingFace |
| google/mt5-small | 300M | 512 tokens | Texto-a-texto multilingue | Apache 2.0 | HuggingFace |

La comparacion directa con t5-small es la mas pertinente, ya que este modelo es un ajuste fino suyo: hereda su arquitectura y su licencia, y solo se diferencia en la especializacion de la salida hacia etiquetas. Frente a flan-t5-small, el modelo aqui descrito es mas pequeno y esta especializado, mientras que flan-t5-small conserva capacidades genericas guiadas por instrucciones. Frente a mt5-small, la diferencia clave es el multilingue, que este modelo no ofrece.

## Limitaciones y advertencias

- Alcance muy restringido: solo genera etiquetas para descripciones de proyectos de IA agentica, RAG y LLMOps. Fuera de ese dominio el resultado esperado es ruido.
- Idioma limitado al ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su uso en textos en espanol no esta soportado.
- Calidad de etiquetado irregular: el propio autor advierte que las etiquetas pueden repetirse o estar incompletas, y el ejemplo publicado muestra repeticiones y una etiqueta con capitalizacion anomalA ("mCP").
- Riesgo de alucinacion: al ser un modelo generativo pequeno ajustado sobre un corpus de 600 filas, puede producir etiquetas que no correspondan al texto de entrada. No debe usarse para etiquetado critico para la seguridad ni como unica fuente de verdad.
- Tamanio del dataset de entrenamiento muy reducido (600 ejemplos), lo que limita la cobertura tematica y favorece el sobreajuste a las etiquetas mas frecuentes del corpus.
- Sin datos de benchmarks: no existen metricas publicadas que permitan estimar precision, recall o cobertura del etiquetado, lo que dificulta justificar su adopcion en produccion sin una evaluacion propia.
- Advertencia explicita del autor: "Not for safety-critical labeling".
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. Es compatible con integraciones propietarias.
- Repositorio practicamente sin uso comunitario: 0 descargas y 1 "like" en el momento de la consulta, lo que implica ausencia de validacion externa y de soporte.
- Formato de pesos: solo safetensors con pesos fusionados; la ausencia de versiones cuantizadas en GGUF complica el despliegue en entornos de inferencia en CPU basados en llama.cpp u Ollama sin conversiones adicionales.
- Longitud de contexto no documentada en la model card; cualquier uso con entradas largas deberia validarse empiricamente contra el limite del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hharsha/agentic-github-tagger
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/hharsha/agentic-github-meta
- Dataset de escaparate: https://huggingface.co/datasets/hharsha/agentic-systems-showcase
- Space de portfolio del autor: https://huggingface.co/spaces/hharsha/agent-portfolio
- Sitio web del autor: https://agentic-systems-studio.com
- Perfil de GitHub del autor: https://github.com/hharsha98
