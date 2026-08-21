# DGurgurov/OpenThinker3-7B-SFT-FR

## Resumen

OpenThinker3-7B-SFT-FR es un modelo de lenguaje de 7.6 mil millones de parámetros desarrollado por DGurgurov como parte del pipeline de adaptación de razonamiento **ReasonXL**. Se trata de un fine-tuning supervisado (SFT) del modelo `open-thoughts/OpenThinker-7B`, cuyo objetivo es desplazar el idioma de razonamiento del modelo del inglés al francés, utilizando trazas de razonamiento del dataset `toroe/ReasonXL-SFT`. Es la primera etapa de un proceso de dos fases; la segunda aplica aprendizaje por refuerzo (GRPO) para recuperar la calidad de razonamiento que pueda perderse durante el SFT.

El modelo está diseñado para permitir que el razonamiento interno (chain-of-thought) se exprese en francés, manteniendo las capacidades de razonamiento del modelo base. Aunque el modelo base OpenThinker-7B es multilingüe y destaca en tareas de razonamiento matemático y lógico, este fine-tune se centra específicamente en el francés como idioma de razonamiento. La relevancia actual radica en la creciente demanda de modelos de razonamiento en idiomas distintos del inglés, especialmente en entornos educativos, empresariales y de atención al cliente en países francófonos.

El repositorio contiene pesos en formato safetensors (91.4 GB, probablemente en varias precisiones) y no se han publicado aún resultados de evaluación específicos para este fine-tune. La licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | Frances (razonamiento en frances) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-thoughts/OpenThinker-7B`, un modelo de razonamiento de 7B parámetros basado en la arquitectura Qwen2, entrenado exclusivamente con SFT sobre el dataset OpenThoughts3-1.2M. OpenThinker-7B (y su versión mejorada OpenThinker3-7B) ha demostrado superar a otros modelos de razonamiento de 7B como DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1 en benchmarks de razonamiento, según los resultados publicados por el equipo de open-thoughts.

El fine-tune SFT se realiza sobre el dataset `toroe/ReasonXL-SFT`, que contiene trazas de razonamiento en francés. El objetivo es que el modelo genere sus cadenas de razonamiento internas en francés, en lugar de en inglés, sin sacrificar la calidad del razonamiento. La segunda etapa del pipeline ReasonXL aplica GRPO (un algoritmo de optimización por política proximal con recompensas basadas en verificación) sobre problemas matemáticos verificables, para recuperar cualquier degradación de rendimiento inducida por el SFT y reforzar el cumplimiento del idioma objetivo.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las hiperparametros utilizados. El paper asociado (arXiv:2604.12378) promete detalles completos próximamente.

## Capacidades

- Razonamiento en frances: el modelo esta especificamente entrenado para generar cadenas de razonamiento (chain-of-thought) en frances, lo que facilita su integracion en aplicaciones que requieren explicaciones o justificaciones en ese idioma.
- Razonamiento logico y matematico: hereda las capacidades de razonamiento del modelo base OpenThinker-7B, que incluyen resolucion de problemas matematicos, logica formal y deduccion.
- Generacion de texto: al ser un modelo de lenguaje generativo, puede producir texto coherente en frances, aunque su foco principal es el razonamiento.
- Multilingue limitado: aunque el modelo base es multilingue, este fine-tune esta orientado al frances; no se garantiza un rendimiento optimo en otros idiomas.
- No se ha confirmado soporte para tool calling, funciones, vision, audio ni modo agente. Estas capacidades no estan documentadas en la informacion disponible.

## Casos de uso

- Atencion al cliente con razonamiento complejo: el modelo puede gestionar consultas de soporte tecnico o reclamaciones en frances que requieran seguir un razonamiento paso a paso, explicando diagnosticos o soluciones de forma clara y estructurada.
- Tutoria educativa en frances: puede actuar como asistente de estudio para estudiantes francófonos, resolviendo problemas de matematicas, fisica o logica y mostrando el proceso de razonamiento en frances, lo que facilita el aprendizaje.
- Analisis de documentos financieros o legales: dado su capacidad de razonamiento, puede extraer conclusiones logicas de contratos, informes o expedientes en frances, ayudando a profesionales a identificar inconsistencias o implicaciones.
- Generacion de explicaciones tecnicas en frances: para manuales, documentacion de software o articulos divulgativos, el modelo puede producir explicaciones detalladas y razonadas en frances, manteniendo coherencia y profundidad.
- Asistencia en programacion con razonamiento en frances: aunque no se confirma soporte de tool calling, puede ayudar a depurar codigo o explicar algoritmos en frances, razonando sobre posibles errores o complejidades.
- Evaluacion de respuestas en frances: en sistemas de QA o chatbots, puede generar justificaciones logicas de sus respuestas, permitiendo auditorias de razonamiento en aplicaciones criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El modelo base OpenThinker-7B (y su version OpenThinker3-7B) ha demostrado en evaluaciones publicas superar a DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1 en tareas de razonamiento, pero estos resultados no son directamente aplicables a este fine-tune en frances. Se recomienda esperar a la publicacion de la evaluacion completa del pipeline ReasonXL.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.6B parametros, en precision FP16 se requieren aproximadamente 15 GB de VRAM; en int8 unos 8 GB; en int4 unos 4-5 GB. Estas cifras son estimaciones estandar para modelos de este tamano.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 o int8; una A100 (40/80 GB) permite mayor margen y batch; para int4, una RTX 3060 (12 GB) o superior es suficiente.
- Compatibilidad con GPU de consumo: si, en cuantizacion int4 o int8 cabe en GPUs de consumo como RTX 3060, 3070, 4060, etc.
- Opciones de despliegue: al ser un modelo con pesos safetensors, puede desplegarse con vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI u otras herramientas estandar. No se ha confirmado compatibilidad especifica, pero es probable dado el formato.
- Latencia y throughput: no disponibles. Dependera del hardware y la cuantizacion; para un modelo de 7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token en FP16.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de razonamiento en frances de tamano similar. Como referencia, se comparan los modelos base de razonamiento de 7B:

| Modelo | Parametros | Contexto | Razonamiento | Licencia |
|---|---|---|---|---|
| OpenThinker3-7B (base) | 7.6B | No disponible | Superior a DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1 | No disponible |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 32k (tipico) | Bueno, pero inferior a OpenThinker3-7B | MIT |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | 128k | Bueno, pero inferior a OpenThinker3-7B | Llama 3.1 Community License |

Este fine-tune se diferencia por su enfoque en frances, pero no hay datos de rendimiento comparativo en ese idioma.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede estar restringido o requerir contacto con el autor. No se debe asumir permisividad.
- Perdida potencial de calidad de razonamiento: al ser un SFT, puede degradar ligeramente el rendimiento en tareas de razonamiento respecto al modelo base; la etapa GRPO esta disenada para mitigarlo, pero este modelo es solo la primera fase.
- Sesgos del dataset: el dataset ReasonXL-SFT puede contener sesgos propios de las trazas de razonamiento en frances, lo que podria afectar a la equidad o exactitud en ciertos dominios.
- Riesgo de alucinacion: como cualquier LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios no cubiertos por el entrenamiento.
- Limitacion de idioma: aunque el modelo base es multilingue, este fine-tune esta optimizado para frances; su rendimiento en otros idiomas puede ser inferior.
- Sin evaluacion publica: al no haber benchmarks publicados, no se puede garantizar su rendimiento en produccion sin pruebas propias.
- Tamano del repositorio: 91.4 GB sugiere multiples precisiones o archivos grandes, lo que puede complicar la descarga y el despliegue en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-FR
- Modelo base: https://huggingface.co/open-thoughts/OpenThinker-7B
- Dataset de SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Modelo GRPO (segunda etapa): https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-FR
- Paper ReasonXL (arXiv): https://arxiv.org/abs/2604.12378
- Repositorio open-thoughts: https://github.com/open-thoughts/open-thoughts
- Modelo OpenThinker3-7B (base mejorado): https://huggingface.co/open-thoughts/OpenThinker3-7B
