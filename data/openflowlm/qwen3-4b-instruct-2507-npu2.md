# OpenFlowLM/Qwen3-4B-Instruct-2507-NPU2

## Resumen

OpenFlowLM/Qwen3-4B-Instruct-2507-NPU2 es una conversión cuantizada del modelo Qwen/Qwen3-4B-Instruct-2507, empaquetada por OpenFlowLM (conversión realizada por Atomic-Germ) para su ejecución en NPUs AMD XDNA a través del runtime OpenFlowLM (OFLM). No se trata de un modelo nuevo entrenado desde cero, sino de un port que toma el modelo base de 4.000 millones de parámetros y lo reempaqueta en el formato propietario Q4NX, un contenedor optimizado para inferencia en hardware NPU de AMD y que no debe confundirse con GGUF.

El modelo base Qwen3-4B-Instruct-2507 pertenece a la familia Qwen3 de Alibaba y es una variante densa de tipo transformer decoder-only orientada a instrucciones y conversación. Su interés radica en que permite ejecutar un modelo de 4B con ventana de contexto muy amplia directamente sobre la NPU integrada de portátiles y equipos de escritorio con AMD Ryzen AI, sin depender de una GPU dedicada. Esto lo sitúa en el nicho del despliegue en el borde (edge) y la inferencia local privada.

El repositorio tiene un tamaño de 3,3 GB y contiene los pesos `model.q4nx` (3,07 GB), el tokenizador, la configuración del runtime OFLM y la plantilla de chat. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial, y se distribuye con etiquetas de compatibilidad para endpoints, SageMaker y Azure además del propio runtime OFLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.000 millones (4,0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredado del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Q4NX, compuesto por una mezcla de Q8_0, Q4_1 y BF16 |
| Idiomas soportados | No detallados en esta ficha; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (runtime OFLM); no es GGUF |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Relacion con el base | Quantized (cuantizado) |
| Fuente de la conversion | Qwen3-4B-Instruct-2507.Q8_0.gguf (GGUF de partida) |
| Version del runtime OFLM | 0.1.0 |
| Tamano del repositorio | 3,3 GB |
| Tamano de los pesos | 3,07 GB (`model.q4nx`) |
| Hardware objetivo | NPU AMD XDNA (Ryzen AI) |
| Fecha de conversion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atención por causalidad y agrupación de consultas (GQA). Al ser una variante "Instruct" de la familia Qwen3 (en contraposición a las variantes "Thinking"), está optimizada para seguir instrucciones y mantener conversaciones sin un modo de razonamiento explícito separado. El trabajo de este repositorio no consiste en un reentrenamiento, sino en una conversión de formato: se partió del fichero GGUF `Qwen3-4B-Instruct-2507.Q8_0.gguf` y se empaquetó con la herramienta `oflm pack` en un contenedor Q4NX de 3,07 GB. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

Como innovación destacable de este artefacto concreto está la compilación para el runtime OpenFlowLM, que permite desplegar el modelo sobre la unidad de procesamiento neuronal (NPU) AMD XDNA en lugar de una GPU. La cuantización Q4NX combina distintos niveles de precisión (Q8_0, Q4_1 y BF16) según la capa, buscando un equilibrio entre huella de memoria y fidelidad de la salida en el hardware objetivo. No se documentan en esta ficha técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredado de la variante Instruct del modelo base.
- Razonamiento y tareas de conocimiento general propias de un modelo de 4B de la familia Qwen3.
- Generación y asistencia de código, capacidad habitual en los modelos Qwen.
- Manejo de contextos extensos: el modelo base admite hasta 262.144 tokens, lo que permite procesar documentos largos o historiales de conversación amplios.
- Capacidad multilingüe heredada del modelo base Qwen3 (el número exacto de idiomas no se especifica en esta ficha).
- Ejecución en NPU AMD XDNA mediante el runtime OpenFlowLM, con un binario de pesos de 3,07 GB.
- Uso potencial en pipelines compatibles con endpoints, según las etiquetas de despliegue incluidas (endpoints_compatible, deploy:sagemaker, deploy:azure).
- Soporte de tool calling y de agentes: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Inferencia local en portátiles con NPU AMD Ryzen AI: el modelo se ejecuta sobre la NPU XDNA mediante el runtime OFLM, lo que permite disponer de un asistente de 4B sin GPU dedicada y con bajo consumo energético.
- Asistentes conversacionales on-device: gracias a su tamaño reducido y al empaquetado Q4NX de 3,07 GB, es adecuado para chatbots integrados en aplicaciones de escritorio que requieren privacidad y funcionamiento sin conexión.
- Procesamiento de documentos largos: la ventana de contexto de 262.144 tokens del modelo base permite resumir, extraer información o responder preguntas sobre contratos, informes o expedientes extensos en una sola pasada.
- Generación y asistencia de código en el borde: puede utilizarse para autocompletar y explicar fragmentos de código en entornos de desarrollo local, sin enviar el código a servicios en la nube.
- Traducción y atención multilingüe: al heredar el carácter multilingüe del modelo base, sirve para traducir y atender consultas en varios idiomas en aplicaciones de escritorio.
- Despliegue en endpoints y servicios gestionados: las etiquetas de compatibilidad con endpoints, SageMaker y Azure abren la puerta a servirlo en infraestructuras gestionadas, sujeto a que el runtime de destino soporte el formato Q4NX.
- Automatización de tareas ofimáticas: resumen de correos, redacción de borradores y clasificación de texto en flujos de trabajo locales sobre equipos con NPU.
- Prototipado e investigación en edge computing: útil para estudiar el rendimiento de modelos LLM sobre NPU XDNA frente a alternativas en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el repositorio incluye la etiqueta `eval-results`, la model card no proporciona cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- Memoria necesaria: aproximadamente 3-4 GB para cargar los pesos `model.q4nx` (3,07 GB) más el overhead del runtime y la caché KV.
- Hardware objetivo: NPU AMD XDNA integrada en procesadores AMD Ryzen AI. No está pensado para GPUs NVIDIA/AMD por CUDA o ROCm, ya que está compilado específicamente para el runtime OFLM.
- GPU de consumo: este artefacto concreto no apunta a GPUs de consumo; para ejecutar el modelo base en GPU convendría usar los pesos originales de Qwen3-4B-Instruct-2507 o sus cuantizaciones GGUF.
- Opciones de despliegue: runtime OpenFlowLM con la herramienta `oflm-add` (instalable vía `pip install oflm-add` o `uv tool install oflm-add`) y ejecución mediante `oflm run`. Las etiquetas indican compatibilidad con text-generation-inference y endpoints gestionados, aunque el formato Q4NX está atado al runtime OFLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3-4B-Instruct-2507-NPU2 (este) | 4,0B | 262.144 tokens | Q4NX | Apache 2.0 | NPU AMD XDNA (OFLM) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,0B | 262.144 tokens | safetensors | Apache 2.0 | GPU/CPU |
| Qwen3-4B-Instruct-2507-GGUF (mradermacher) | 4,0B | 262.144 tokens | GGUF (Q8_0 y otras) | Apache 2.0 | CPU/GPU (llama.cpp) |

La diferencia principal frente a las otras dos entradas de la tabla es el formato y el backend de ejecución: este repositorio está empaquetado para NPU XDNA, mientras que el modelo base y la conversión GGUF se orientan a GPU y CPU convencionales. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión cuantizada: el proceso a Q4NX (mezcla de Q8_0, Q4_1 y BF16) puede introducir una pérdida de precisión respecto a los pesos originales en BF16, con posible impacto en tareas sensibles a la exactitud.
- Formato propietario: los pesos están en Q4NX y no son GGUF, por lo que no funcionan con llama.cpp, Ollama ni otras herramientas estándar; requieren el runtime OpenFlowLM.
- Dependencia de hardware: está compilado para NPU AMD XDNA y el runtime OFLM 0.1.0, una versión temprana, lo que limita la portabilidad y puede implicar inestabilidad o cambios de compatibilidad.
- Riesgo de alucinación: inherente a los modelos de 4B; puede generar información incorrecta con seguridad aparente, especialmente en tareas de conocimiento factual.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los sesgos del modelo base Qwen3-4B-Instruct-2507 se heredan.
- Idiomas: aunque el modelo base es multilingüe, no se detalla en esta ficha el listado ni el rendimiento por idioma.
- Contexto: los 262.144 tokens corresponden al modelo base; el comportamiento real de la ventana de contexto bajo la cuantización Q4NX no está verificado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias del runtime OFLM.
- Madurez: con 0 descargas y 0 "me gusta", y un runtime en versión 0.1.0, es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3-4B-Instruct-2507-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de referencia citado en las etiquetas: arXiv:2505.09388 (https://arxiv.org/abs/2505.09388)
- Fuente GGUF de la conversión: mradermacher/Qwen3-4B-Instruct-2507-GGUF
- Instalador del runtime: paquete `oflm-add` (pip / uv)
