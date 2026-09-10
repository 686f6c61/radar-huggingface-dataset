# mobilint/EXAONE-3.5-2.4B-Instruct-regulus-rb-usb

# Ficha de modelo: EXAONE-3.5-2.4B-Instruct-regulus-rb-usb (compilado para NPU de Mobilint)

## Resumen

Este repositorio contiene `mobilint/EXAONE-3.5-2.4B-Instruct-regulus-rb-usb`, una compilación del modelo `LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct` optimizada para el hardware NPU de Mobilint. No es un modelo entrenado desde cero ni un fine-tuning: la relación declarada con el modelo base es `quantized`, y la model card indica explícitamente que el paquete está pensado para desplegarse dentro de la pila de aceleración propietaria de Mobilint. El sufijo del nombre (`regulus`, `rb`, `usb`) apunta a un objetivo de hardware y a un formato de despliegue concretos, aunque la información disponible no los detalla.

El modelo base es un transformer decoder-only de 2,4 mil millones de parámetros desarrollado por LG AI Research, con una ventana de contexto de 32K tokens según su model card, afinado para conversación en inglés y coreano. Su tamaño lo sitúa en el segmento de modelos pequeños, aptos para inferencia en el borde o en aceleradores de bajo consumo, donde priman la latencia y la privacidad de los datos sobre la amplitud de conocimientos.

La relevancia de esta ficha es acotada pero clara: es un ejemplo de artefacto empaquetado para un NPU concreto, no un modelo de propósito general listo para ejecutarse en GPU. Cualquier evaluación debe partir de esa restricción: sin hardware de Mobilint, este repositorio no es utilizable con las herramientas de inferencia habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base EXAONE-3.5-2.4B-Instruct); artefacto compilado para NPU de Mobilint |
| Parametros totales | 2,4 mil millones en el modelo base. Los metadatos de safetensors del repositorio declaran 262.144.000, cifra inconsistente con el modelo base (ver "Limitaciones y advertencias") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens (32.768) segun la model card del modelo base; no se especifica para el artefacto compilado |
| Tipos de cuantizacion | El repositorio es una version cuantizada/compilada (`base_model_relation: quantized`); no se detallan los esquemas (INT8, INT4, etc.) en la informacion disponible |
| Idiomas soportados | Ingles (`en`) y coreano (`ko`) |
| Licencia | `other` — EXAONE AI Model License, licencia propia de LG AI Research; no es una licencia aprobada por la OSI |
| Formato de pesos | safetensors mas artefactos compilados propietarios (libreria `mobilint`, `custom_code`) |
| Tamano del repositorio | 5,2 GB |
| Libreria de carga | `mobilint` (no estandar; requiere `trust_remote_code=True`) |
| Hardware objetivo | Acelerador NPU de Mobilint (nombre de compilacion `regulus-rb-usb`) |
| Descargas / likes | 0 / 0 |
| Fechas de metadatos | Creado y actualizado el 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base EXAONE-3.5-2.4B-Instruct: un transformer decoder-only autorregresivo de 2,4 mil millones de parámetros, con atención causal completa y contexto declarado de 32K tokens. La model card del repositorio no aporta ningún detalle sobre el preentrenamiento ni sobre el postentrenamiento (volumen de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la documentación de LG AI Research y no se reproducen aquí.

Lo específico de este repositorio no es la arquitectura, sino el proceso de compilación y empaquetado. Mobilint publica modelos ya compilados y optimizados para su stack de aceleración, con el objetivo de que se ejecuten dentro de ese entorno y no como pesos estándar de PyTorch. Esto implica una fase de conversión de pesos y de ajuste al grafo del compilador del NPU, con posibles restricciones en la forma del grafo, en los tipos de dato admitidos y en los kernels disponibles. La model card no documenta el método de cuantización, el calibrado, ni la pérdida de precisión asociada, ni tampoco si se ha aplicado decodificación especulativa o alguna técnica de atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` y el repositorio incluye la etiqueta `conversational`. El modelo base está afinado con instrucciones, de modo que responde a prompts directivos y a formatos de chat.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base de 2,4 mil millones de parámetros, acotadas por su tamaño. No se publican evaluaciones específicas de este artefacto compilado.
- Idiomas: inglés y coreano de forma nativa. No se declara soporte de español ni de otros idiomas.
- Ejecución en acelerador dedicado: la capacidad diferencial es el despliegue sobre la pila de Mobilint, que no requiere GPU ni frameworks de inferencia convencionales.
- Tool calling y function calling: no documentado en la información disponible.
- Uso como agente y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multimodales: no disponibles. EXAONE 3.5 es una familia de modelos de texto; no se declara visión ni audio.
- Modo de razonamiento explícito (thinking mode): no documentado en la información disponible.
- Carga con código remoto: el repositorio incluye la etiqueta `custom_code`, por lo que la carga exige `trust_remote_code=True` y la ejecución de código del autor.

## Casos de uso

- Asistente conversacional en el borde: ejecución local sobre un NPU de bajo consumo para responder consultas en inglés y coreano sin enviar datos a la nube, lo que simplifica el cumplimiento de normativas de protección de datos en entornos sanitarios o industriales.
- Atención al cliente en coreano: despliegue de un chatbot de primera línea para consultas frecuentes en mercados coreanos, con escalado a un modelo mayor cuando la consulta requiere razonamiento complejo.
- Procesamiento de documentos confidenciales: resumen y extracción de información de contratos o informes internos que no pueden salir de la infraestructura de la organización, aprovechando el contexto de 32K del modelo base para documentos extensos.
- Generación aumentada por recuperación (RAG) en local: indexación de un corpus interno y generación de respuestas ancladas a los fragmentos recuperados, con el modelo como componente de generación sobre el acelerador.
- Integración en dispositivos embebidos y kioscos: asistentes de puesto fijo (aeropuertos, comercio, industria) que necesitan funcionar sin conexión y con un presupuesto térmico y energético reducido.
- Evaluación de la pila de compilación de Mobilint: uso del modelo como carga de trabajo de referencia para medir latencia, throughput y consumo energético del NPU, o para validar que una aplicación propia se ejecuta correctamente en ese stack.
- Etiquetado y clasificación por lotes en local: moderación de comentarios, categorización de tickets o extracción de entidades en grandes volúmenes de texto, donde la latencia por petición importa menos que el coste por token.
- Traducción asistida inglés-coreano: borradores de traducción y reescritura de textos entre los dos idiomas soportados, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, comparativas ni mediciones de latencia o throughput sobre el NPU de destino. Las cifras del modelo base deben consultarse en la model card de `LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct` y en el informe técnico de LG AI Research; no se reproducen aquí para no atribuir al artefacto compilado un rendimiento que no ha sido verificado tras la cuantización.

## Requisitos de hardware

- Hardware requerido para este artefacto: un acelerador NPU de Mobilint. El repositorio está empaquetado para su stack de aceleración y no está pensado para ejecutarse en GPU de propósito general.
- Compatibilidad con runtimes convencionales: no disponible. No se declara soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers estándar. La carga se realiza mediante la librería propietaria `mobilint`.
- Estimaciones para el modelo base sin compilar (referencia orientativa, no aplicables a este repositorio):
  - BF16/FP16: aproximadamente 4,9 GB solo de pesos.
  - INT8: aproximadamente 2,5 GB de pesos.
  - INT4: aproximadamente 1,3 GB de pesos.
  - A estas cifras hay que sumar la caché KV, cuyo tamaño depende del número de capas, de cabezas KV y de la longitud de contexto efectiva; no disponible en la información proporcionada.
- GPU de consumo para el modelo base: un modelo de 2,4B en BF16 cabe en GPUs con 8-12 GB de VRAM, como una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090. En cuantización de 4 bits podría ejecutarse en equipos con 4-6 GB de VRAM. Esta afirmación se refiere al modelo base y no al artefacto compilado, que depende de hardware dedicado.
- GPU de centro de datos: A100, H100 o L40S para servir el modelo base con vLLM si se opta por esa vía, siempre que se trabaje con los pesos originales y no con este paquete.
- Latencia y throughput del artefacto compilado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Este modelo (compilado para NPU Mobilint) | 2,4B | 32K heredados del base (no confirmado) | en, ko | EXAONE AI Model License | safetensors + artefactos propietarios para NPU |
| LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct | 2,4B | 32K | en, ko | EXAONE AI Model License | safetensors en HuggingFace |
| Qwen2.5-3B-Instruct | 3,09B | 32K | multilingue (mas de 25 idiomas) | Apache 2.0 | safetensors, GGUF y otros |
| Llama-3.2-3B-Instruct | 3,21B | 128K | 8 idiomas oficiales, entre ellos el espanol | Llama 3.2 Community License | safetensors, GGUF y otros |

Nota: los datos de Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct proceden de sus model cards públicas y no han sido verificados en esta ficha. No se incluye columna de rendimiento porque no hay resultados de benchmarks publicados para el modelo objeto de esta ficha ni una comparación homogénea entre los cuatro modelos.

La diferencia relevante no es de calidad, sino de destino: frente al modelo base de LG AI Research, este repositorio sacrifica portabilidad (queda atado a un compilador y a un NPU concretos) a cambio de despliegue eficiente en ese hardware. Frente a Qwen2.5-3B o Llama-3.2-3B, pierde cobertura de idiomas (no soporta español), flexibilidad de licencia y ecosistema de herramientas de inferencia, pero puede ejecutarse en un acelerador de bajo consumo donde esos modelos no están optimizados.

## Limitaciones y advertencias

- Dependencia total del hardware: el artefacto está compilado para el NPU de Mobilint. Sin ese hardware no es ejecutable, y no hay ruta documentada para convertirlo de vuelta a un formato portable.
- Licencia no estándar: la licencia EXAONE AI Model License es propia de LG AI Research y no está aprobada por la OSI. Antes de cualquier uso comercial es imprescindible revisar el texto completo enlazado en el repositorio y, si procede, obtener asesoramiento jurídico. Este artefacto deriva de un modelo con esa licencia, por lo que sus condiciones se heredan.
- Cobertura de idiomas limitada: solo inglés y coreano. No hay soporte declarado de español, lo que descarta su uso directo en productos orientados al mercado hispanohablante sin un modelo adicional o un ajuste posterior.
- Riesgo de alucinación: es un modelo de 2,4 mil millones de parámetros; genera texto plausible sin garantía de veracidad, especialmente en dominios especializados o en preguntas factuales poco frecuentes. Requiere verificación en aplicaciones sensibles.
- Capacidad acotada por el tamaño: el razonamiento multi-paso, las matemáticas complejas y las tareas de código de larga duración quedan por debajo de modelos de 7B en adelante. El efecto de la cuantización sobre estas capacidades no está documentado.
- Ejecución de código remoto: el repositorio usa `custom_code`. Cargar el modelo implica ejecutar código del autor; conviene auditar los ficheros antes de hacerlo en un entorno de producción.
- Inconsistencia en los metadatos: el campo de parámetros de safetensors declara 262.144.000, una cifra incompatible con un modelo de 2,4B y que coincide exactamente con 250 MiB en bytes, lo que sugiere que corresponde a un tamaño de fichero y no a un recuento de parámetros. Además, las fechas de creación y actualización (2026-09-10) son posteriores a la fecha de esta ficha.
- Ausencia de validación comunitaria: cero descargas y cero likes en el momento de redactar esta ficha. No hay informes independientes sobre su comportamiento real ni sobre la fidelidad respecto al modelo original.
- Sin datos de rendimiento tras la compilación: no se publica la degradación de precisión ni de latencia introducida por la cuantización y el mapeo al NPU.
- Documentación mínima: la model card se limita a indicar que el modelo está compilado para el hardware de Mobilint y no describe el proceso, los formatos ni los requisitos exactos de despliegue.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mobilint/EXAONE-3.5-2.4B-Instruct-regulus-rb-usb
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct
- Licencia EXAONE (texto completo): https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct/blob/main/LICENSE
- Sitio del autor del empaquetado: https://mobilint.com
- Repositorio de modelos de Mobilint (referenciado en la model card): https://github.com/mobilint/mblt-model-zoo

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este repositorio ni sobre el proceso de compilacion para los NPU de Mobilint; los resultados obtenidos eran contenido no relacionado y se han descartado.
