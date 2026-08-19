# smllms/HyperCLOVA-X-SEED-MISHULTA-v1.5

## Resumen

HyperCLOVA-X-SEED-MISHULTA-v1.5 es un modelo de lenguaje fine-tuning del modelo HyperCLOVAX-SEED-Think-14B de NAVER Cloud, desarrollado por el equipo MISHULTA como parte del hackathon K-DS (NIA). Está especializado en razonamiento en coreano, con un enfoque particular en la resolución de problemas tipo examen (opción múltiple) y matemáticas. El modelo incorpora un modo de razonamiento extendido (think) activado por defecto, que permite generar cadenas de razonamiento antes de dar la respuesta final.

Técnicamente, se trata de un ajuste fino con QLoRA (4-bit NF4) sobre el modelo base de 14.7B parámetros, seguido de la fusión de los adaptadores en bf16. El entrenamiento utiliza una combinación de auto-destilación (STaR) sobre el dataset KMMLU y destilación de profesor con DeepSeek-R1-0528 para problemas que el modelo base no resolvía. El modelo mantiene la arquitectura Transformer original con Peri-Layer Normalization y μP (Maximal Update Parameterization), y una ventana de contexto de 32k tokens.

La relevancia de este modelo reside en su mejora demostrada en tareas de razonamiento en coreano (KMMLU test) respecto al base, y en su contribución al ecosistema de modelos coreanos de código abierto, aunque su licencia restrictiva (HyperCLOVA X SEED) limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Peri-Layer Normalization, μP) |
| Parametros totales | 14.748.112.896 (14,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | no disponible (pesos en bf16; cuantizacion externa posible con GPTQ/AWQ/GGUF) |
| Idiomas soportados | coreano (ko) |
| Licencia | HyperCLOVA X SEED Model License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HyperCLOVAX-SEED-Think-14B, un Transformer denso con 14,7B parámetros, Peri-Layer Normalization y Maximal Update Parameterization (μP). Sobre esta base, el equipo MISHULTA aplicó un fine-tuning con QLoRA (4-bit NF4) utilizando adaptadores LoRA de rango 64 y alpha 128 con RSLoRA, afectando a 7 módulos (q, k, v, o, gate, up, down). El entrenamiento se realizó en 2 épocas y los adaptadores se fusionaron posteriormente en bf16.

Los datos de entrenamiento consisten en: (1) 6.140 ejemplos de auto-destilación STaR generados a partir del split train de KMMLU (45 materias), donde el modelo base en modo think resolvía problemas y solo se conservaban las cadenas de razonamiento que llegaban a la respuesta correcta; (2) 498 ejemplos de destilación de profesor con DeepSeek-R1-0528 para problemas que el base no resolvía, filtrando solo las soluciones verificadas; y (3) una parte del dataset orca-math-word-problems-193k-korean (solo en experimentos iniciales). El split test de KMMLU no se usó en el entrenamiento, evitando contaminación.

El chat template se modificó para activar el modo think por defecto (el modelo genera un bloque de razonamiento antes de la respuesta), alineado con el formato de inferencia del modelo base.

## Capacidades

- Razonamiento extendido (modo think): genera cadenas de razonamiento explícitas antes de la respuesta final, mejorando la precisión en problemas complejos.
- Resolución de problemas de opción múltiple en coreano, especialmente en áreas como matemáticas, contabilidad, biología y marketing.
- Generación de texto en coreano con alta fluidez, heredada del modelo base.
- Comprensión de instrucciones en formato conversacional (chat).
- Soporte de formato de salida estructurado: el modelo tiende a finalizar con el patrón "정답: X" (respuesta: X), facilitando la extracción automática de respuestas.
- No se ha verificado soporte de tool calling, function calling o capacidades multimodales en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32k tokens) y proporcionar respuestas razonadas a consultas complejas, reduciendo la necesidad de intervención humana.
- Asistente de estudio para estudiantes coreanos: resuelve problemas de examenes tipo KMMLU (matematicas, ciencias, contabilidad) con explicaciones paso a paso, util para plataformas educativas.
- Analisis de documentos legales o tecnicos en coreano: su capacidad de razonamiento permite extraer conclusiones a partir de textos extensos, con trazabilidad de la logica empleada.
- Generacion de contenido educativo: crea preguntas de practica con soluciones razonadas para cursos online o materiales de preparacion de examenes.
- Sistema de QA (preguntas y respuestas) en dominios especificos: integrable en motores de busqueda o asistentes virtuales que requieran respuestas fundamentadas en coreano.
- Evaluacion automatica de respuestas: dado su entrenamiento en problemas de opcion multiple, puede servir para validar la correccion de respuestas generadas por otros modelos o por estudiantes.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia (0-shot generativa, modo think) sobre una muestra de 5 materias del test de KMMLU (25 preguntas por materia, seed 42):

| Modelo | KMMLU (muestra) | Math | Chemistry | Accounting | Biology | Marketing |
|---|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Think-14B (base) | 0,656 | 0,72 | 0,64 | 0,44 | 0,56 | 0,92 |
| **HyperCLOVA-X-SEED-MISHULTA-v1.5** | **0,696** | 0,72 | 0,64 | **0,64** | 0,56 | 0,92 |

El modelo base publica ademas los siguientes resultados en benchmarks oficiales (Think mode): KMMLU 0,6649 y CLIcK 0,7208. No se dispone de resultados de este fine-tuning en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~29,5 GB (peso del repositorio), por lo que se necesita una GPU con al menos 32 GB (A100 40GB, H100 80GB) o dos GPUs de 16 GB en paralelo.
- Con cuantizacion 4-bit (GPTQ/AWQ) se puede reducir a ~8-10 GB, permitiendo ejecucion en GPUs consumer como RTX 3090/4090 (24 GB) o incluso RTX 4080 (16 GB) con cuantizacion 8-bit.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión manual).
- Latencia estimada: con una A100 40GB y `max_new_tokens=2048`, la generacion completa (incluyendo razonamiento) puede tardar entre 10 y 20 segundos en modo think, dependiendo de la longitud de la cadena de razonamiento.
- Para uso en produccion con baja latencia, se recomienda cuantizacion AWQ o GPTQ y desactivar el modo think si no es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KMMLU (oficial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Think-14B (base) | 14,7B | 32k | 0,6649 | HyperCLOVA X SEED | HuggingFace |
| **HyperCLOVA-X-SEED-MISHULTA-v1.5** | 14,7B | 32k | ~0,696 (muestra propia) | HyperCLOVA X SEED | HuggingFace |
| EXAONE 3.5-7.8B (LG) | 7,8B | 32k | no comparable | EXAONE License | HuggingFace |

La comparacion con EXAONE no es directa por diferencias de tamaño y licencia. El principal valor de este modelo es su mejora sobre el base en tareas de razonamiento coreano, con el coste de una licencia restrictiva que obliga a que los derivados empiecen por "HyperCLOVA X".

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo el HyperCLOVA X SEED Model License Agreement, que limita el uso comercial y exige que los modelos derivados mantengan el prefijo "HyperCLOVA X" en su nombre. Revisar los terminos completos antes de cualquier uso en produccion.
- Sesgos potenciales: al estar entrenado principalmente con datos coreanos, puede presentar sesgos culturales o linguisticos propios de ese contexto. No se han realizado evaluaciones de sesgo en este fine-tuning.
- Riesgo de alucinacion: como modelo de razonamiento, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- Limitacion de idioma: aunque el modelo base soporta ingles, este fine-tuning esta optimizado para coreano y su rendimiento en otros idiomas puede degradarse.
- Dependencia del modo think: el chat template activa el razonamiento por defecto, lo que aumenta la latencia y el consumo de tokens. Desactivarlo (`skip_reasoning=True`) puede reducir la calidad en tareas de razonamiento.
- Evaluacion limitada: los benchmarks reportados son de una muestra pequena (125 preguntas) y no cubren la totalidad de KMMLU ni otros benchmarks estandar.
- Sin soporte de tool calling ni funciones agente verificadas en la informacion disponible.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1.5)
- [Modelo base HyperCLOVAX-SEED-Think-14B](https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B)
- [Documentacion de transformers para HyperCLOVA X SEED](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/hyperclovax.md)
- [HyperCLOVA X Technical Report (arXiv)](https://arxiv.org/html/2404.01954v1)
- [Dataset KMMLU](https://huggingface.co/datasets/HAERAE-HUB/KMMLU)
- [Dataset orca-math-word-problems-193k-korean](https://huggingface.co/datasets/kuotient/orca-math-word-problems-193k-korean)
