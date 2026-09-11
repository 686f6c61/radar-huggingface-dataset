# amd/HyLo-Llama-6MLA22GDN-8K-SFT

## Resumen

HyLo-Llama-6MLA22GDN-8K-SFT es un checkpoint experimental publicado por AMD que transforma un transformer denso ya preentrenado (meta-llama/Llama-3.2-3B-Instruct) en una arquitectura híbrida mediante upcycling, en lugar de entrenar un modelo híbrido desde cero. El resultado es un modelo de 4.267.821.452 parametros (4,27B) distribuidos en 28 capas: 6 capas de Multi-head Latent Attention (MLA) y 22 capas de Gated DeltaNet, un bloque de atencion lineal con regla delta y compuerta que mantiene un estado recurrente de tamano fijo. Esta combinacion reduce la cache KV al 2,0% de la del modelo base.

El modelo resuelve el problema del coste de memoria en contextos largos: las capas Gated DeltaNet no generan cache KV en absoluto, y las capas MLA cachean un latente de rango bajo en lugar de claves y valores completos. Se entreno mediante destilacion desde meta-llama/Llama-3.1-8B-Instruct como profesor, y esta calibrado para una ventana de 8.192 tokens, no para la ventana nominal de 131.072 tokens que aparece en el config heredado.

Es relevante ahora porque forma parte de la linea de investigacion de AMD sobre escalado de modelos hibridos, descrita en el paper "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715), donde aparece como HyLo-Llama-6MLA22GDN. Su interes practico esta en la eficiencia de memoria en inferencia con contexto largo, no en el rendimiento absoluto. La licencia es de solo investigacion, lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida por capas: 6 capas MLA + 22 capas Gated DeltaNet (28 capas en total) |
| Parametros totales | 4.267.821.452 (4,27B; el paper reporta 4,3B) |
| Longitud de contexto | 8.192 tokens (entrenado y evaluado). El campo max_position_embeddings=131.072 del config es heredado del modelo base y no es una longitud soportada |
| Escalado posicional | YaRN con factor 4,0 sobre una ventana original de 2.048 tokens, hasta 8.192 posiciones |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. El checkpoint se publica en float32 y la model card recomienda cargarlo en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | amd-hybrid-models-research-only-rail-ms (solo investigacion). El frontmatter de la model card declara ademas license: apache-2.0, lo que genera una discrepancia que conviene resolver antes de cualquier uso |
| Formato de pesos | safetensors (checkpoint en float32) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Profesor de destilacion | meta-llama/Llama-3.1-8B-Instruct |
| Cache KV | 2,0% de la del modelo base |
| Tamano del repositorio | 17,1 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con colocacion de tipos de capa por indice, no en patron repetitivo. Las 6 capas MLA ocupan los indices [0, 5, 10, 16, 21, 26], elegidos donde el modelo base es mas sensible a perder atencion completa; las 22 capas Gated DeltaNet ocupan el resto: [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27]. Las dimensiones MLA son kv_lora_rank 128, q_lora_rank 1536, qk_rope_head_dim 64, qk_nope_head_dim 64, v_head_dim 128 y 24 cabezas de atencion. Gated DeltaNet usa 9 cabezas con dimension de cabeza 256. La configuracion hibrida vive en hybrid_config.json; config.json conserva la configuracion del modelo base solo como referencia.

El entrenamiento tiene dos fases. La primera, Enhanced-ILD, aplica destilacion capa a capa para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base, a 2.048 tokens de contexto, learning rate 2e-4 y el 20% de la mezcla de SFT. La segunda es un SFT de contexto largo con destilacion guiada por profesor a 8.192 tokens, learning rate 4e-5 y la mezcla completa. La funcion de perdida es divergencia KL entre las distribuciones del siguiente token del estudiante y del profesor (kl_weight 1.0, ce_weight 0.0), con batch global de 16 secuencias, 1 epoch, schedule coseno con 0,01 de warmup y precision mixta en bfloat16. El entrenamiento se ejecuto sobre 8x AMD Instinct MI300X con FSDP, usando un kernel KL fusionado que evita materializar el tensor completo de logits. Los datos proceden de JunxiongWang/sftdatasetv3, nvidia/OpenMathInstruct-2, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k y nvidia/ChatQA2-Long-SFT-data, en variantes procesadas por AMD con submuestreo, reformateo a la plantilla de chat y descontaminacion contra las suites de evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas de Llama-3.2-3B-Instruct y reforzadas con SFT.
- Razonamiento matematico y resolucion de problemas, gracias a la inclusion de OpenMathInstruct-2 y OpenR1-Math-220k en el entrenamiento.
- Razonamiento paso a paso y cadenas de pensamiento, por la presencia de OpenThoughts-114k en la mezcla.
- Preguntas y respuestas sobre documentos largos dentro de la ventana de 8.192 tokens, por el uso de ChatQA2-Long-SFT-data.
- Eficiencia de memoria en inferencia con contexto largo: la cache KV es el 2,0% de la del modelo base gracias a las capas lineales sin cache y al latente de rango bajo de MLA.
- Capacidades multilingues: no disponibles; el modelo esta declarado unicamente en ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la informacion proporcionada.
- Vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Investigacion en arquitecturas hibridas: el checkpoint permite reproducir y comparar la receta de upcycling frente a modelos hibridos entrenados desde cero, usando los 4,27B de parametros y las 28 capas como referencia de escalado.
- Analisis de documentos largos en ingles: con 8.192 tokens de ventana y una cache KV del 2,0%, es adecuado para resumir y extraer informacion de informes o articulos tecnicos que quepan en ese limite.
- Atencion al cliente automatizada de dominio acotado: conversaciones multi-turno en ingles donde el ahorro de memoria permite mantener muchas sesiones concurrentes en la misma GPU.
- Asistente de matematicas educativas: el entrenamiento sobre OpenMathInstruct-2 y OpenR1-Math-220k lo orienta a resolver y explicar ejercicios paso a paso.
- Distilacion de modelos mayores en GPUs economicas: al derivar de Llama-3.1-8B-Instruct, sirve como estudiante de referencia para experimentos de compresion y destilacion.
- Despliegue en hardware de gama media para prototipos: su tamano permite ejecutarlo en GPUs de consumo, lo que facilita validar la arquitectura antes de invertir en nodos con MI300X o H100.
- Evaluacion comparativa de cache KV: util para medir el impacto real de MLA y Gated DeltaNet en latencia y throughput frente a un transformer denso equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card contiene un array de resultados vacio (`"results": []`). El apartado de evaluacion del README hace referencia a la Tabla 3 del paper (backbone Llama-3.2-3B) y menciona metricas RULER, pero los valores no se incluyen en la informacion proporcionada y no deben inferirse.

## Requisitos de hardware

- Pesos en float32 (precision de publicacion del checkpoint): aproximadamente 17,1 GB, coherente con el tamano del repositorio.
- Pesos en bfloat16 (precision recomendada de carga): aproximadamente 8,5 GB.
- Estimacion aritmetica en int8: aproximadamente 4,3 GB; en int4: aproximadamente 2,2 GB. Son calculos derivados del numero de parametros, no datos publicados por AMD.
- Cache KV: 2,0% de la del modelo base. Es el principal ahorro de memoria del modelo en contextos largos.
- GPU de consumo: cabe en bfloat16 en una RTX 4090 (24 GB) con holgura, y de forma ajustada en una RTX 3060 de 12 GB. En cuantizacion de 4 bits entraria en GPUs de 8 GB.
- GPU de datacenter: A100, H100, MI300X y equivalentes. El entrenamiento se realizo sobre 8x AMD Instinct MI300X con FSDP.
- Opciones de despliegue: no disponible en la informacion proporcionada. Al tratarse de una arquitectura hibrida con MLA y Gated DeltaNet, requiere kernels especificos, por lo que la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la documentacion del modelo.
- Configuracion critica: los stacks de servicio dimensionan la cache KV a partir de `max_position_embeddings`, que en el config vale 131.072. Hay que fijar explicitamente el limite de longitud, por ejemplo `--max-model-len 8192`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyLo-Llama-6MLA22GDN-8K-SFT | 4,27B (6 MLA + 22 Gated DeltaNet) | 8.192 tokens entrenados | 2,0% del modelo base | amd-hybrid-models-research-only-rail-ms (solo investigacion); frontmatter declara apache-2.0 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B (transformer denso) | 128.000 tokens segun la documentacion de Meta | Completa | Llama 3.2 Community License | Ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B (transformer denso) | 128.000 tokens segun la documentacion de Meta | Completa | Llama 3.1 Community License | Ampliamente desplegado |

La comparacion directa con alternativas hibridas de la misma categoria (por ejemplo, otros modelos que combinan atencion y capas SSM o de atencion lineal) no esta disponible en la informacion proporcionada. El paper arXiv:2604.24715 incluye la tabla comparativa de referencia, pero sus valores no se han facilitado.

## Limitaciones y advertencias

- Ventana real de 8.192 tokens: el modelo se entreno y evaluo a esa longitud. Superarla degrada la calidad; el propio README advierte de que `max_position_embeddings` vale 131.072 solo porque se hereda del modelo base.
- Existen releases separados de 8K y 64K entrenados con la misma receta. Para 16K o mas hay que usar el hermano de 64K.
- Licencia de solo investigacion: el identificador amd-hybrid-models-research-only-rail-ms restringe el uso. La model card declara tambien apache-2.0 en el frontmatter, una contradiccion que debe aclararse antes de cualquier despliegue en produccion.
- Datos de entrenamiento con licencia no comercial: nvidia/ChatQA2-Long-SFT-data usa cc-by-nc-2.0, lo que anade una restriccion adicional al uso comercial.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para este checkpoint.
- Sesgos: no se documenta ningun analisis de sesgos, toxicidad o seguridad.
- Compatibilidad de despliegue incierta: la combinacion MLA + Gated DeltaNet exige kernels especificos y no se confirma soporte en los stacks de inferencia habituales.
- Precision de pesos: el checkpoint se publica en float32; cargarlo sin conversion a bfloat16 duplica el consumo de memoria.
- Madurez: 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Ausencia de benchmarks: no hay numeros publicados que permitan verificar las afirmaciones de retencion de precision en contexto corto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-6MLA22GDN-8K-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Profesor de destilacion: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper principal (Long-Context Aware Upcycling): https://arxiv.org/abs/2604.24715
- Paper referenciado (arXiv:2505.17272): https://arxiv.org/abs/2505.17272
- Paper referenciado (arXiv:2503.11132): https://arxiv.org/abs/2503.11132
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
