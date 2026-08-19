# hbfreed/Laguna-S-2.1-winnow-keep50

## Resumen

Laguna-S-2.1-winnow-keep50 es un modelo de lenguaje basado en Mixture of Experts (MoE) derivado de poolside/Laguna-S-2.1, un modelo de 118 000 millones de parámetros totales con 8 000 millones activos, diseñado para codificacion agente y razonamiento de horizonte largo. Este derivado, creado por hbfreed, aplica la tecnica de poda "winnow" que elimina el 50 % de los canales de los expertos enrutados, reduciendo el total de parametros a 60 780 503 456 (60,8 B) sin reentrenamiento posterior.

La poda no elimina expertos completos, sino que reduce el ancho intermedio de cada experto SwiGLU segun una puntuacion de importancia por canal. El resultado es un modelo con expertos de ancho variable (ragged) que conserva el 80 % de los expertos con anchos reducidos, mientras que el experto compartido, la atencion y los embeddings permanecen intactos. El modelo se distribuye bajo licencia OpenMDW-1.1 y esta pensado para ejecutarse en hardware de gama media (3 GPU de 24 GB) gracias a la cuantizacion INT8 de los expertos y al uso de pipeline parallelism.

La relevancia de este modelo radica en demostrar que es posible reducir significativamente el tamano de un MoE de gran escala sin perder demasiada calidad, manteniendo un rendimiento competitivo en tareas de codificacion y razonamiento. El autor reporta una perplejidad de 3,399 en codigo de validacion (frente a 2,947 del modelo original, un aumento del 15,3 %) y un HumanEval pass@1 del 89,6 % bajo un protocolo especifico de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE y expertos de ancho variable (variable-width experts) |
| Parametros totales | 60 780 503 456 (60,8 B) |
| Parametros activos | No especificado tras la poda (el modelo base tiene 8 B activos) |
| Longitud de contexto | No especificada en la documentacion; el ejemplo de serving usa 16 384 tokens |
| Tipos de cuantizacion | INT8 para pesos de expertos (W8A16); no se indican otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (https://openmdw.org) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de poolside/Laguna-S-2.1, un MoE con 118 B parametros totales y 8 B activos, disenado para tareas de codificacion agente y razonamiento de largo alcance. La arquitectura base emplea atencion estandar, un experto compartido y multiples expertos enrutados con activaciones SwiGLU. En este derivado, la poda winnow reduce el ancho intermedio de cada experto SwiGLU segun una puntuacion de importancia por canal calculada como `router_weight × |post-SwiGLU activation| × down-projection column L2`. La asignacion de canales se realiza mediante un ranking global por capa.

El proceso de poda se ejecuto en 3 GPU RTX 3090 con streaming por capas: cada GPU alojaba una capa decoder, los residual streams se transferian por disco y la calibracion se distribuyo en paralelo entre las GPU. La calibracion utilizo 2,1 millones de tokens del dataset bigcode/the-stack-smol. No se aplico reentrenamiento ni "healing" tras la poda. El resultado es que el 80 % de los expertos sobreviven con anchos reducidos y desiguales, mientras que el experto compartido, la atencion y los embeddings no se modifican. El archivo `winnow.json` registra el plan de poda completo, la procedencia de la calibracion y los indices de canales por experto.

## Capacidades

- Generacion de texto y codigo con razonamiento de multiples pasos, incluyendo un modo de "thinking" que puede desactivarse (en la evaluacion se uso "thinking disabled").
- Capacidad de actuacion autonoma como agente: el autor reporta que el modelo resolvio de forma autonoma varias tareas clasicas de Terminal-Bench 1.0 de principio a fin con un contexto de servicio de 16k tokens, aunque la mayoria de los fallos se debieron a agotamiento del contexto y no a falta de competencia en la tarea.
- Soporte de tool calling y function calling: no se menciona explicitamente en la documentacion de este derivado, pero el modelo base esta disenado para agentic coding, lo que implica capacidad de invocar herramientas.
- Razonamiento matematico y logico: el modelo base destaca en benchmarks de codificacion y razonamiento, y este derivado conserva parte de esas capacidades (HumanEval 89,6 % bajo protocolo especifico).
- Multilingue: no se dispone de informacion sobre los idiomas soportados.

## Casos de uso

- Desarrollo de codigo asistido en entornos con recursos limitados: el modelo cabe en 3 GPU de 24 GB con cuantizacion INT8, lo que permite desplegarlo en estaciones de trabajo con multiples GPU consumer (p. ej., 3 RTX 3090) para generacion y revision de codigo en tiempo real.
- Agente autonomo para tareas de terminal: su capacidad para resolver tareas de Terminal-Bench de forma autonoma lo hace adecuado para automatizar operaciones de linea de comandos, como gestion de archivos, ejecucion de scripts o configuracion de entornos, con un presupuesto de contexto de 16k tokens.
- Asistente de programacion con contexto largo: con una ventana de 16k tokens, puede manejar archivos de codigo extensos o conversaciones multi-turno sobre un proyecto, manteniendo el contexto de funciones y dependencias.
- Prototipado rapido de aplicaciones de codigo en investigacion: al ser un modelo podado sin reentrenamiento, sirve como banco de pruebas para estudiar el impacto de la poda en MoE y para experimentar con tecnicas de compresion de modelos en entornos academicos.
- Integracion en pipelines de CI/CD para generacion de pruebas unitarias: el modelo puede generar casos de prueba a partir de codigo fuente, aprovechando su capacidad de razonamiento sobre logica de programacion, aunque con la limitacion de no haber sido evaluado en este escenario especifico.
- Fine-tuning o adaptacion para dominios especificos de codigo: dado que conserva la arquitectura MoE con expertos de ancho variable, puede ajustarse con datasets propietarios para mejorar el rendimiento en lenguajes o frameworks concretos, aunque el proceso de poda no incluye reentrenamiento.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card, medidos con un protocolo especifico (perplejidad sobre 64 secuencias de validacion de the-stack-smol de 2048 tokens cada una; HumanEval con generacion greedy, protocolo chat-extract, thinking desactivado, maximo 1280 tokens nuevos y servicio de expertos en INT8):

| Modelo | Parametros | Perplejidad (codigo) | HumanEval pass@1 |
|---|---|---|---|
| Laguna-S-2.1 (base) | 118 B | 2,947 | — |
| keep-75 | 89,2 B | 2,980 (+1,1 %) | — |
| **keep-50 (este modelo)** | **60,8 B** | **3,399 (+15,3 %)** | **89,6 %** |

Es importante destacar que el resultado de HumanEval (89,6 %) no es comparable con los numeros estandar de HumanEval ni con los benchmarks publicados por poolside (SWE-bench, Terminal-Bench 2.1), ya que utiliza un harness diferente y un presupuesto de tokens mayor. El modelo base Laguna-S-2.1 obtiene 70,2 % en Terminal-Bench 2.1 y 40,4 % en DeepSWE segun fuentes externas, pero esos datos no corresponden a este derivado.

## Requisitos de hardware

- VRAM estimada: el modelo con pesos de expertos en INT8 (W8A16) se sirve en 3 GPU de 24 GB cada una (total 72 GB). Sin cuantizacion, el repositorio ocupa 121,7 GB en safetensors, por lo que se necesitarian al menos 4 GPU de 24 GB o 2 GPU de 48 GB para cargarlo en FP16.
- GPU recomendadas: 3 RTX 3090 (24 GB) o equivalentes (A5000, RTX 4090 con 24 GB, etc.). No cabe en una sola GPU consumer de 24 GB.
- Opciones de despliegue:
  - vLLM con el plugin glean (https://github.com/hbfreed/variable-reap) que soporta expertos ragged (no representables en FusedMoE estandar). Comando de ejemplo: `vllm serve hbfreed/Laguna-S-2.1-winnow-keep50 --enforce-eager --pipeline-parallel-size 3 --quantization experts_int8 --max-model-len 16384`.
  - Transformers (version ≥ 5.13) con `trust_remote_code=True` para carga de referencia sin fusion, mas lenta.
- Rendimiento medido en 3 RTX 3090: 34 tokens/s en modo single-stream, ~150 tokens/s con batch de 8.
- Limitacion de paralelismo: no soporta tensor parallelism (los pesos ragged empaquetados no se pueden fragmentar); solo pipeline parallelism.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (protocolo propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna-S-2.1 (base) | 118 B totales, 8 B activos | No especificado (probablemente >16k) | No reportado | OpenMDW-1.1 | HuggingFace |
| Laguna-S-2.1-winnow-keep75 | 89,2 B | 16k (serving) | No reportado | OpenMDW-1.1 | HuggingFace |
| **Laguna-S-2.1-winnow-keep50 (este)** | **60,8 B** | **16k (serving)** | **89,6 %** | OpenMDW-1.1 | HuggingFace |

No se dispone de comparativas directas con otros modelos podados de la misma categoria (p. ej., podas REAP-style en MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- La poda sin reentrenamiento degrada la perplejidad en codigo un 15,3 % respecto al modelo base (3,399 vs 2,947). Aunque HumanEval muestra un 89,6 %, este resultado no es comparable con benchmarks estandar y podria no reflejar el rendimiento real en tareas de codificacion complejas.
- El modelo no soporta tensor parallelism, lo que limita su escalabilidad horizontal en entornos con multiples GPU; solo se puede usar pipeline parallelism.
- Los expertos de ancho variable requieren un plugin especifico de vLLM (glean) o la carga con transformers sin fusion, lo que complica su integracion en infraestructuras existentes.
- La licencia OpenMDW-1.1 es una licencia de codigo abierto con condiciones especificas (atribucion, no uso para ciertos fines, etc.); se recomienda revisar los terminos en https://openmdw.org antes de uso comercial.
- El contexto maximo no esta documentado; el ejemplo de serving usa 16 384 tokens, pero podria ser mayor. En la prueba cualitativa con Terminal-Bench, el agotamiento del contexto fue la causa principal de fallos.
- No se han publicado evaluaciones de sesgos, alucinacion o seguridad para este modelo derivado. Al ser una poda del modelo base, hereda sus limitaciones, pero no hay datos especificos.
- El modelo no ha sido reentrenado, por lo que la poda puede haber eliminado informacion importante en algunos expertos, afectando a tareas fuera del dominio de calibracion (codigo).

## Enlaces

- Repositorio del modelo: https://huggingface.co/hbfreed/Laguna-S-2.1-winnow-keep50
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Coleccion de modelos Laguna S 2.1: https://huggingface.co/collections/poolside/laguna-s-21
- Repositorio de winnow (metodo de poda): https://github.com/hbfreed/winnow
- Plugin glean para vLLM: https://github.com/hbfreed/variable-reap
- Dataset de calibracion: https://huggingface.co/datasets/bigcode/the-stack-smol
- Licencia OpenMDW-1.1: https://openmdw.org
