# jc4845/bge-small-sec-filings

## Resumen

`jc4845/bge-small-sec-filings` es un modelo de embeddings de frases obtenido mediante fine-tuning de `BAAI/bge-small-en-v1.5`, un transformer tipo BERT de pequeno tamano, sobre un corpus de pasajes de informes 10-K presentados ante la SEC (secciones Business, Risk Factors, MD&A y Market Risk). Lo desarrolla el usuario jc4845 como componente de recuperacion del agente `dealscope-agent`, orientado a responder preguntas de analistas financieros sobre empresas cotizadas estadounidenses.

El modelo resuelve una tarea concreta de recuperacion densa (dense retrieval): dado un enunciado en lenguaje natural, ordenar los pasajes de un 10-K por relevancia para localizar el fragmento que contiene la respuesta. Su interes practico radica en que mejora de forma medible al modelo base en un dominio especializado, con un conjunto de evaluacion separado por empresa (355 preguntas de Chevron, Johnson & Johnson, Meta, Microsoft, Oracle y Walmart, ninguna vista en entrenamiento).

Se publica bajo licencia MIT, con pesos en formato sentence-transformers, y esta pensado para integrarse en pipelines RAG sobre documentacion financiera. No es un modelo generativo: solo produce vectores de embedding para busqueda semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), derivada de BAAI/bge-small-en-v1.5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria sentence-transformers; pesos compatibles con Text Embeddings Inference) |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un encoder transformer de la familia BERT de pequeno tamano entrenado originalmente para similitud semantica y recuperacion en ingles. El fine-tuning se realiza con la libreria sentence-transformers y la funcion de perdida `MultipleNegativesRankingLoss` con negativos in-batch y un muestreador de lotes sin duplicados, una configuracion estandar para ajustar modelos de recuperacion densa.

Los datos de entrenamiento provienen del dataset `jc4845/sec-10k-retrieval-qa`, con 1067 pares pregunta-pasaje. Las preguntas se generan con un LLM a partir del pasaje correspondiente y la particion se hace por empresa para evitar fuga de informacion entre entrenamiento y evaluacion. El entrenamiento consistio en 3 epocas, tamano de lote 64, tasa de aprendizaje 2e-5, 10 % de warmup y precision fp16 sobre una unica NVIDIA T4, con una duracion aproximada de 30 segundos. Las consultas deben ir precedidas del prefijo de instruccion de bge: `Represent this sentence for searching relevant passages: `.

## Capacidades

- Generacion de embeddings de frases y pasajes para busqueda semantica y recuperacion densa.
- Recuperacion de pasajes relevantes en informes 10-K de empresas estadounidenses (Business, Risk Factors, MD&A, Market Risk).
- Similitud semantica entre consultas de analista y texto financiero en ingles.
- Integracion en pipelines RAG como recuperador previo a un modelo generativo.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes por si mismo.
- No dispone de capacidades de vision ni audio.
- Capacidad multilingue no documentada; el modelo base esta orientado al ingles.

## Casos de uso

- Busqueda semantica sobre 10-K para analistas: indexar los pasajes de un informe anual y recuperar los fragmentos que responden a preguntas como riesgos de cadena de suministro o cambios en margenes, aprovechando la mejora de recall@1 del 73,0 % al 79,7 %.
- Pipeline RAG financiero: usar el modelo como recuperador y conectar la salida a un LLM generativo para construir respuestas citando el pasaje exacto del 10-K.
- Comparacion entre empresas: indexar los 10-K de varias companias y consultar que revelan sobre una tematica concreta (por ejemplo, exposicion a tipos de cambio) recuperando los pasajes mas proximos de cada una.
- Extraccion de factores de riesgo: localizar y clasificar las secciones de Risk Factors relevantes para un analisis de riesgo de inversion.
- Asistente interno de research: integrar el modelo en una herramienta de consulta documental para equipos de analisis que necesitan localizar informacion en decenas de informes sin leerlos completos.
- Deteccion de cambios year-over-year: comparar los embeddings de pasajes equivalentes entre dos ejercicios de la misma empresa para identificar variaciones en el discurso de gestion (MD&A).
- Moderacion y filtrado documental: usar la similitud de embeddings para agrupar o deduplicar pasajes de informes antes de alimentar un indice vectorial.

## Benchmarks y rendimiento

Evaluacion held-out sobre 355 preguntas de empresas no vistas en entrenamiento, comparando el modelo base con el fine-tuned:

| Metrica | Modelo base | Fine-tuned | Cambio |
|---|---|---|---|
| ndcg@10 | 0,854 | 0,898 | +0,043 |
| mrr@10 | 0,816 | 0,868 | +0,052 |
| recall@1 | 0,730 | 0,797 | +0,068 |
| recall@10 | 0,972 | 0,989 | +0,017 |

El pasaje correcto queda en primera posicion en el 79,7 % de las preguntas frente al 73,0 % del modelo base. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo small de la familia BERT, la huella es reducida y cabe en GPUs de consumo, aunque no se publican cifras exactas.
- GPU recomendadas: el autor entreno en una NVIDIA T4; cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia en fp16, si bien no se documenta oficialmente.
- Cabe en GPU de consumo: previsiblemente si (RTX 3060, RTX 4090 y similares), sin cifras publicadas.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (el modelo declara compatibilidad con endpoints) y, por herencia del modelo base, llama.cpp y Ollama mediante conversion a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jc4845/bge-small-sec-filings | no disponible (small) | no disponible | 10-K financiero | MIT | Hugging Face |
| BAAI/bge-small-en-v1.5 | no disponible (small) | no disponible | General en ingles | MIT | Hugging Face |
| BAAI/bge-base-en-v1.5 | no disponible (base) | no disponible | General en ingles | MIT | Hugging Face |
| Modelos de embeddings financieros especializados | no disponible | no disponible | Finanzas | no disponible | no disponible |

La comparacion directa con alternativas especializadas en finanzas no esta disponible en la informacion proporcionada. Frente a su modelo base, la mejora documentada es de +0,068 en recall@1 y +0,043 en ndcg@10 en el conjunto de evaluacion del autor.

## Limitaciones y advertencias

- Las preguntas de entrenamiento y evaluacion son sinteticas (generadas por un LLM), por lo que son mas limpias que las consultas reales de analistas y el rendimiento en produccion puede ser inferior.
- Solo cubre prosa de informes 10-K estadounidenses; no cubre tablas, formularios 10-Q ni informes no estadounidenses.
- El conjunto de evaluacion es pequeno (355 preguntas); el autor advierte que diferencias inferiores a 0,02 deben tratarse como ruido.
- El modelo base esta orientado al ingles; no se documenta soporte multilingue.
- Al ser un modelo de embeddings, no genera respuestas: cualquier alucinacion en el sistema final proviene del LLM generativo que consuma los pasajes recuperados.
- Riesgo de sesgo heredado del corpus de informes 10-K y del modelo base; no se documenta analisis de sesgos.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de origen (informes SEC son documentos publicos).
- No se documentan cifras de latencia, throughput ni requisitos de hardware, lo que dificulta el dimensionamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jc4845/bge-small-sec-filings
- Dataset de entrenamiento: https://huggingface.co/datasets/jc4845/sec-10k-retrieval-qa
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del agente: https://github.com/Jaydeep4845/dealscope-agent
