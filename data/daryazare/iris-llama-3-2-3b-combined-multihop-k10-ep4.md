# daryaZare/iris-llama-3.2-3b-combined-multihop-k10-ep4

## Resumen

iris-llama-3.2-3b-combined-multihop-k10-ep4 es un adaptador LoRA (PEFT) publicado por el usuario daryaZare sobre el modelo base meta-llama/Llama-3.2-3B-Instruct. No se distribuye como modelo completo, sino como pesos de adaptador en formato safetensors que deben cargarse junto al modelo base. El repositorio ocupa 1,2 GB y se ha entrenado durante 4 epocas con un learning rate de 5e-05, batch efectivo de 16 (batch 1 con 16 pasos de acumulacion de gradiente) y el optimizador PagedAdamW de 8 bits.

El nombre del modelo y las metricas de evaluacion declaradas (Bin F1, Cal AUROC, Cal ECE, Info NDCG@p8, Info Pairwiseacc, Soft MAE, Soft Brier, Student/Teacher Prelevantmean) apuntan a un caso de uso muy concreto: la estimacion de relevancia y el reranking de pasajes en escenarios de recuperacion multi-salto con k=10 candidatos, con calibracion de probabilidades y un esquema de destilacion desde un modelo teacher. Es decir, no es un modelo conversacional generico pese a heredar la arquitectura de Llama 3.2 Instruct, sino un ajuste orientado a senalar que fragmentos de contexto son relevantes para una consulta.

Su relevancia practica esta en el nicho de los sistemas RAG: un adaptador de 3B de parametros es barato de servir, puede ejecutarse en GPU de consumo y permite sustituir rerankers de tipo cross-encoder por un modelo con capacidad de seguir instrucciones. La contrapartida es la documentacion: la model card esta generada automaticamente, no describe el dataset de entrenamiento, no incluye ejemplos de uso y no publica resultados de benchmarks estandar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA sobre meta-llama/Llama-3.2-3B-Instruct |
| Parametros totales | 3,21 mil millones en el modelo base; tamano del adaptador no disponible (repositorio de 1,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no se especifica si el ajuste la modifica |
| Tipos de cuantizacion | no especificado por el autor; al ser un adaptador LoRA se puede fusionar con el modelo base en fp16/bf16, GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible en la model card; el modelo base declarara oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors para su uso |
| Libreria | peft (compatible con transformers) |
| Pipeline | text-generation |
| Tarea declarada por las metricas | reranking / estimacion de relevancia multi-salto con calibracion (inferido de los nombres de las metricas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm pre-normativa, activacion SwiGLU y embeddings RoPE, con 3,21 mil millones de parametros y una ventana de contexto de 128 000 tokens en el modelo base. Sobre esa base se ha aplicado un ajuste por LoRA: los pesos publicados corresponden unicamente a las matrices de bajo rango, no al modelo completo, lo que explica que el repositorio ocupe 1,2 GB (probablemente incluyendo estados del optimizador). No se detalla el rango, el alpha ni a que modulos de la red se aplica el adaptador.

El entrenamiento se realizo durante 4 epocas con 375 pasos registrados, learning rate constante de 5e-05, warmup del 3 %, seed 42, precision mixta con optimizador PagedAdamW de 8 bits y acumulacion de gradiente de 16 pasos. La model card indica que el entrenamiento se hizo "on the None dataset", es decir, el nombre del dataset no se especifica. Las metricas registradas incluyen terminos como Student Prelevantmean y Teacher Prelevantmean, junto con Soft MAE y Soft Brier sobre etiquetas suaves, lo que sugiere un esquema de destilacion de conocimiento desde un modelo teacher hacia este estudiante, con supervision de probabilidades de relevancia y evaluacion sobre 110 preguntas y 1071 pares. No hay informacion sobre RLHF, DPO ni preferencias humanas en el proceso.

## Capacidades

- Reranking y estimacion de relevancia: las metricas Info NDCG@p8 (0,9770) y Info Pairwiseacc (0,8708) indican capacidad de ordenar pasajes candidatos por relevancia dentro de un conjunto de 10 (el sufijo k10 del nombre).
- Puntuacion calibrada: los valores Cal ECE (0,0989), Cal Brier (0,0823) y Cal AUROC (0,9771) apuntan a una salida probabilistica calibrada, apta para umbrales de decision.
- Clasificacion binaria de relevancia: Bin F1 de 0,8634 en el conjunto de evaluacion.
- Generacion de texto conversacional: heredada del modelo base Llama 3.2 3B Instruct, aunque no se documenta si el ajuste la preserva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct si lo soporta en su version oficial).
- Soporte de agentes y razonamiento multi-paso: no documentado; el termino "multihop" del nombre sugiere razonamiento sobre multiples saltos de recuperacion, pero no hay evidencia publicada.
- Capacidades multilingues: no documentadas para el adaptador; las del modelo base no se mencionan en la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Reranking en pipelines RAG multi-salto: el adaptador puede recolocar los 10 fragmentos recuperados por un buscador vectorial antes de pasarlos al generador, usando senales de relevancia calibrada (Cal ECE 0,0989) para descartar contexto irrelevante.
- Filtrado de contexto por umbral de confianza: gracias a las puntuaciones probabilisticas calibradas, se puede fijar un umbral y descartar pasajes por debajo de el, reduciendo tokens de entrada y coste de inferencia.
- Destilacion de un reranker mayor: el par de metricas Student/Teacher Prelevantmean (0,2882 frente a 0,2965) indica que el modelo se entreno como estudiante de un teacher; es reutilizable para replicar ese proceso con otros dominios.
- Evaluacion de calidad de recuperacion en experimentos: las metricas Info NDCG@p8 y Pairwiseacc permiten usar el modelo como evaluador automatico de conjuntos de recuperacion durante el desarrollo de un sistema.
- Atencion al cliente con base documental: en un asistente que consulte manuales o politicas internas, el adaptador selecciona los pasajes correctos antes de que el LLM redacte la respuesta, con contexto de hasta 128 000 tokens en el modelo base.
- Busqueda semantica en dominios tecnicos: para corpus de documentacion, informes o articulos cientificos, el modelo puede puntuar pares consulta-documento y alimentar un ranking final.
- Despliegue en hardware limitado: al ser un adaptador sobre un modelo de 3,2 mil millones de parametros, permite montar un servicio de reranking en una unica GPU de consumo, algo inviable con cross-encoders de mayor tamano.
- Generacion de resumentes con contexto seleccionado: combinado con el modelo base, se puede usar para decidir que secciones largas de un documento entran en la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible. El autor solo declara metricas del conjunto de evaluacion interno del ajuste, sin especificar el dataset ni la tarea exacta, por lo que no son comparables con resultados publicos de otros modelos.

Metricas declaradas en el conjunto de evaluacion (modelo final):

| Metrica | Valor |
|---|---|
| Loss | 0,6651 |
| Soft Mae | 0,0631 |
| Soft Brier | 0,0125 |
| Student Prelevantmean | 0,2882 |
| Teacher Prelevantmean | 0,2965 |
| Bin F1 | 0,8634 |
| Cal Ece | 0,0989 |
| Cal Brier | 0,0823 |
| Cal Auroc | 0,9771 |
| Info Ndcg@p8 | 0,9770 |
| Info Pairwiseacc | 0,8708 |
| Num Questions | 110 |
| Num Pairs | 1071 |

Evolucion durante el entrenamiento (seleccion de checkpoints):

| Paso | Epoca | Bin F1 | Cal Auroc | Cal Ece | Info Ndcg@p8 | Info Pairwiseacc | Validation loss |
|---|---|---|---|---|---|---|---|
| 25 | 0,0410 | 0,8066 | 0,9386 | 0,0623 | 0,9518 | 0,8124 | 1,0422 |
| 100 | 0,1641 | 0,7982 | 0,9564 | 0,1175 | 0,9638 | 0,8290 | 0,9339 |
| 200 | 0,3282 | 0,8556 | 0,9647 | 0,0821 | 0,9761 | 0,8467 | 0,8031 |
| 300 | 0,4923 | 0,8324 | 0,9665 | 0,1126 | 0,9748 | 0,8502 | 0,7523 |
| 375 | 0,6153 | 0,8677 | 0,9667 | 0,1075 | 0,9741 | 0,8525 | 0,7484 |

El conjunto de evaluacion es pequeno (110 preguntas, 1071 pares), lo que limita la significacion estadistica de las diferencias entre checkpoints.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar meta-llama/Llama-3.2-3B-Instruct y aplicar los pesos LoRA.
- VRAM en fp16/bf16 para el modelo base: aproximadamente 6,5-7 GB solo de pesos, mas la cache KV (que crece con la longitud de contexto). Con contexto corto, 10-12 GB de VRAM son suficientes.
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5-4 GB de pesos. En 4 bits: aproximadamente 2-2,5 GB de pesos.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16 con contexto moderado; en 4 bits cabe incluso en GPUs de 6-8 GB.
- GPU profesionales: A100, H100 y L40S sin problemas, utiles para servir en paralelo o con contextos de 128 000 tokens.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA (en TGI, con soporte de adapters); llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-llama-3.2-3b-combined-multihop-k10-ep4 | 3,21 mM (base) + adaptador LoRA | 128k (heredado del base) | Adaptador LoRA sobre Llama 3.2 3B Instruct | Llama 3.2 Community License | HuggingFace, 10 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mM | 128k | Modelo completo, instrucciones | Llama 3.2 Community License | HuggingFace, ampliamente descargado |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mM | 32k | Modelo completo, instrucciones | Apache 2.0 | HuggingFace |
| BAAI/bge-reranker-v2-m3 | 568 M | 8k | Cross-encoder dedicado a reranking | Apache 2.0 | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada. La comparacion con bge-reranker-v2-m3 es relevante por categoria funcional (reranking), pero no por tamano: el modelo de BAAI es un cross-encoder especializado y mucho mas pequeno, mientras que este adaptador aprovecha un LLM de 3B con capacidad de seguir instrucciones.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card esta generada automaticamente y repite "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Dataset de entrenamiento no identificado ("None dataset"): se desconoce su composicion, idioma, dominio y posibles sesgos.
- Evaluacion sobre una muestra muy reducida (110 preguntas, 1071 pares), sin intervalos de confianza ni comparacion con lineas base, por lo que las metricas declaradas no son extrapolables.
- No hay datos sobre el rango LoRA, los modulos adaptados ni el procedimiento exacto de fusion, lo que dificulta reproducir el ajuste.
- Riesgo de alucinacion: aunque el uso previsto aparente sea el reranking, al estar construido sobre un modelo generativo existe riesgo de que genere texto en lugar de puntuar si se le presenta la tarea de forma ambigua.
- Limitaciones de idioma: no declaradas. Si el dataset de ajuste era mayoritariamente en ingles, el rendimiento fuera de ese idioma puede degradarse.
- Restricciones de licencia: se hereda la Llama 3.2 Community License, que incluye la politica de uso aceptable de Meta, exige mantener la atribucion "Built with Llama" y establece condiciones comerciales adicionales para despliegues con mas de 700 millones de usuarios mensuales.
- Uso en produccion: al requerir el modelo base de Meta, el despliegue implica aceptar la licencia de Llama 3.2 y descargar el modelo completo, con el coste de almacenamiento y VRAM asociado.
- Trazabilidad: el repositorio tiene 10 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Se han descartado los resultados de la busqueda web por no guardar relacion tecnica con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daryaZare/iris-llama-3.2-3b-combined-multihop-k10-ep4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper de Llama 3 (arquitectura y datos del modelo base): https://arxiv.org/abs/2407.21783
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este adaptador en la busqueda web realizada.
