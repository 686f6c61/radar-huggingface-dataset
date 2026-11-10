# liodon-ai/Oc-e-Non-v1-GGUF

## Resumen

Oc-e-Non-v1-GGUF es la distribucion en formato GGUF del modelo p-e-w/Oc-e-Non-v1, una cuantizacion publicada por Liodon AI. El modelo base deriva de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.022.468.096 parametros (aproximadamente 4 mil millones) orientado a generacion de texto conversacional. Esta version GGUF esta pensada para inferencia local en llama.cpp, Ollama, LM Studio y Jan, con cuantizaciones que van desde Q2_K (1,67 GB) hasta Q8_0 (4,28 GB).

El interes de esta publicacion es practico: permite ejecutar un modelo de la familia Qwen3 en hardware de consumo, con opciones de cuantizacion bien documentadas y estimaciones de VRAM por quant. El repositorio tiene 324 descargas y 1 like en el momento de la consulta, lo que indica una adopcion limitada pero un paquete completo y funcional.

La informacion disponible sobre el modelo base p-e-w/Oc-e-Non-v1 es escasa: no se detallan datos de entrenamiento, composicion del dataset ni resultados de benchmarks. La model card del repositorio GGUF se limita a documentar las cuantizaciones y los comandos de uso. La licencia figura como "other", sin texto adicional en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (y variantes iMatrix en repo separado) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base p-e-w/Oc-e-Non-v1 es un ajuste sobre Qwen/Qwen3-4B-Instruct-2507, que pertenece a la familia Qwen3 de Alibaba. Se trata de un transformer denso con 4.022.468.096 parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento en el modelo base o en el ajuste posterior.

La innovacion tecnica documentada en esta publicacion es exclusivamente la cuantizacion: Liodon AI ofrece siete niveles estandar de GGUF mas una variante con calibracion iMatrix para cuantizaciones sub-4-bit de mayor calidad (liodon-ai/Oc-e-Non-v1-imatrix-GGUF). No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline_tag: text-generation, tag "conversational").
- Razonamiento y respuesta a instrucciones, heredado de la base Qwen3-4B-Instruct-2507.
- Ejecucion local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `ollama run hf.co/liodon-ai/Oc-e-Non-v1-GGUF:Q4_K_M` para mantener conversaciones multi-turno en una maquina personal, sin dependencia de APIs externas.
- Prototipado rapido en portatil: con la cuantizacion Q3_K_M (2,08 GB, ~2 GB de VRAM) cabe en GPUs integradas o dedicadas de gama baja, permitiendo iterar sobre prompts y flujos conversacionales sin infraestructura cloud.
- Procesamiento por lotes en CPU: la version Q2_K (1,67 GB) permite ejecutar generacion de texto en servidores sin GPU, adecuada para tareas de clasificacion o resumen de baja criticidad.
- Integracion en aplicaciones de escritorio: LM Studio y Jan permiten cargar el modelo desde la interfaz grafica, util para demos y herramientas internas que requieran un LLM embebido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece siete niveles de quant, lo que facilita medir el impacto de la compresion en calidad y latencia sobre un mismo modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles donde no se permite enviar informacion a servicios externos.
- Fine-tuning ligero o experimentacion: el modelo base en safetensors (p-e-w/Oc-e-Non-v1) puede servir como punto de partida para ajustes posteriores antes de cuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card):
  - Q2_K: 1,67 GB de pesos, ~2 GB de VRAM.
  - Q3_K_M: 2,08 GB, ~2 GB de VRAM (indicado para GPUs de 8 GB).
  - Q4_0: 2,37 GB, ~3 GB de VRAM.
  - Q4_K_M: 2,50 GB, ~3 GB de VRAM (recomendado).
  - Q5_K_M: 2,89 GB, ~3 GB de VRAM.
  - Q6_K: 3,31 GB, ~4 GB de VRAM.
  - Q8_0: 4,28 GB, ~5 GB de VRAM.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible. Por tamano, cualquier GPU consumer con 6-8 GB o mas de VRAM puede alojar las cuantizaciones Q4_K_M a Q8_0.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones caben en GPUs de 8 GB o mas; las de 4 bits caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Oc-e-Non-v1-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/Oc-e-Non-v1-GGUF:Q4_K_M`), LM Studio, Jan. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oc-e-Non-v1-GGUF (este) | 4,02 B | No disponible | other | GGUF | Cuantizaciones Q2_K a Q8_0, base Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B | No disponible | No disponible | safetensors | Modelo base original de la familia Qwen3 |
| p-e-w/Oc-e-Non-v1 | ~4 B | No disponible | other | safetensors | Modelo base del que deriva esta cuantizacion |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar de Qwen3-4B-Instruct-2507, es probable que arrastre sesgos del corpus de entrenamiento original, pero no se confirma.
- Riesgo de alucinacion: no cuantificado; como todo LLM de 4 mil millones de parametros, es esperable un riesgo notable en tareas factuales, aunque no hay evaluaciones publicadas.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada en esta ficha; los idiomas soportados figuran como "no disponibles".
- Restricciones de licencia: la licencia es "other" y no se incluye el texto de la misma en la informacion proporcionada. Antes de un uso comercial es imprescindible consultar los terminos del modelo base p-e-w/Oc-e-Non-v1 y de Qwen/Qwen3-4B-Instruct-2507.
- Caveat de produccion: las cuantizaciones sub-4-bit (Q2_K, Q3_K_M) degradan la calidad de forma apreciable; para produccion se recomienda Q4_K_M o superior. Existe una variante iMatrix para cuantizaciones de baja precision con mejor calibracion.
- Adopcion limitada: 324 descargas y 1 like en el momento de la consulta; no hay evidencia de uso extendido ni de validacion independiente.
- Fecha de creacion del repositorio: 2026-11-06, segun los metadatos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/liodon-ai/Oc-e-Non-v1-GGUF
- Modelo base: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante iMatrix: https://huggingface.co/liodon-ai/Oc-e-Non-v1-imatrix-GGUF
- Perfil del cuantizador: https://huggingface.co/liodon-ai
