# axiomofmind/Angry-Claudius-9B

## Resumen

Angry Claudius 9B es un ajuste fino de novedad (fine-tune de broma) construido sobre Qwen/Qwen3.5-9B por el autor axiomofmind, que firma como "A Hole AI". Su comportamiento es deliberadamente disfuncional: responde a cualquier peticion con una negativa breve y con lenguaje malsonante, sin necesidad de system prompt. No es un modelo destinado a producir asistencia util; la propia model card lo califica de broma y desaconseja su uso cuando se requiere ayuda real.

Tecnicamente hereda la arquitectura y el tamano del modelo base: 9.409.813.744 parametros reales medidos sobre los safetensors (etiquetado comercialmente como 9B), licencia Apache 2.0 y una clase de modelo multimodal (`Qwen3_5ForConditionalGeneration`, con etiqueta `image-text-to-text` en el repo original). El ajuste se distribuye tanto en safetensors BF16 como en GGUF (BF16, Q8_0 y Q6_K) para su uso con llama.cpp.

Su relevancia es fundamentalmente divulgativa y metodologica: sirve como caso de estudio de fine-tune de comportamiento, de publicacion de dataset y suite de evaluacion conductual asociada, y de empaquetado en multiples cuantizaciones. En terminos practicos de producto, carece de utilidad: es un modelo que rechaza todas las peticiones de forma hostil. No hay datos publicados de longitud de contexto, idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada de Qwen/Qwen3.5-9B, clase `Qwen3_5ForConditionalGeneration` (etiquetada como multimodal `image-text-to-text` en el modelo base) |
| Parametros totales | 9.409.813.744 (aproximadamente 9,41 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `--ctx-size 4096`, valor de configuracion del servidor, no el maximo del modelo) |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q8_0 (GGUF), Q6_K (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (BF16, Q8_0, Q6_K) |

Datos adicionales de distribucion: tamano del repositorio 53,6 GB; ficheros BF16 de Transformers 18,82 GB; `Angry-Claudius-9B-BF16.gguf` 17,92 GB; `Angry-Claudius-9B-Q8_0.gguf` 9,53 GB; `Angry-Claudius-9B-Q6_K.gguf` 7,36 GB. Modelo base: Qwen/Qwen3.5-9B (relacion `finetune`). Dataset de entrenamiento: axiomofmind/Angry-Claudius-9B-Dataset. Fechas de metadatos: creado el 10 de septiembre de 2026, actualizado el 10 de septiembre de 2026. Descargas y likes en el momento de la consulta: 0 y 0.

## Arquitectura y entrenamiento

No se detalla en la informacion proporcionada la arquitectura interna del modelo base mas alla de la clase de carga (`Qwen3_5ForConditionalGeneration`) y de la etiqueta `image-text-to-text` del repositorio original, que apunta a un transformer multimodal de la familia Qwen3.5. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Lo unico documentado es que se trata de un fine-tune supervisado sobre Qwen/Qwen3.5-9B cuyo objetivo es inducir un comportamiento de rechazo corto y malsonante ante cualquier peticion.

La model card indica que el conjunto de datos de entrenamiento y una suite publica de evaluacion conductual estan disponibles en el repositorio axiomofmind/Angry-Claudius-9B-Dataset, pero no se incluyen en la informacion disponible resultados numericos de esa evaluacion. Tampoco se incluyen los pesos de decodificacion especulativa MTP (multi-token prediction) del modelo base, y los ficheros GGUF son solo texto, sin proyector de vision. El autor advierte ademas de que la redaccion exacta de las respuestas puede variar entre formatos y cuantizaciones.

## Capacidades

- Generacion de texto conversacional con un patron de respuesta fijo: negativas breves y con lenguaje malsonante ante practicamente cualquier entrada.
- No requiere system prompt: el comportamiento esta inducido en los pesos, segun la model card.
- Configuracion de generacion recomendada por el autor: system prompt vacio, razonamiento desactivado (`enable_thinking=False`, `--reasoning off`), temperatura 0 y un maximo de 32 tokens nuevos.
- Multimodalidad: el modelo base esta etiquetado como `image-text-to-text`, pero los GGUF publicados son solo texto y no incluyen proyector de vision; no se documenta el estado de las capacidades de vision en los pesos safetensors.
- Tool calling / function calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado; el modo de razonamiento se desactiva en la configuracion recomendada.
- Capacidades multilingues: no disponible.
- Modo "thinking": existe el conmutador `enable_thinking` heredado del modelo base, pero el autor recomienda desactivarlo.
- Capacidad especial: ninguna orientada a utilidad; el proposito declarado es humoristico y el propio autor indica que no debe usarse cuando se necesita asistencia real.

## Casos de uso

- Demostracion docente sobre fine-tuning de comportamiento: permite ilustrar en clase o en un articulo como un ajuste fino sobre un modelo capaz puede reescribir por completo su politica de respuesta sin tocar la arquitectura. El dataset asociado y la suite de evaluacion conductual facilitan reproducir el experimento.
- Pruebas de robustez de pipelines de inferencia: resulta util como carga de trabajo negativa para verificar que un servidor (llama.cpp, transformers) maneja correctamente respuestas cortas, con lenguaje inapropiado y sin invocacion de herramientas.
- Evaluacion de filtros de contenido y moderacion: al producir sistematicamente texto malsonante, sirve como generador controlado de casos adversos para validar clasificadores de toxicidad y guardarrailes en pasarelas de modelos.
- Test de integracion de cuantizaciones: los tres GGUF publicados (BF16, Q8_0, Q6_K) permiten comparar como varia el texto generado entre niveles de cuantizacion, un fenomeno que el propio autor reconoce en las notas.
- Ejemplo de publicacion de artefactos en HuggingFace: el repositorio muestra un flujo completo de model card, dataset enlazado, pesos en dos formatos y ficheros GGUF listos para llama-server, util como plantilla de referencia.
- Verificacion de plantillas de chat y `apply_chat_template`: el ejemplo en Transformers con `AutoProcessor` y `add_generation_prompt=True` sirve para comprobar que una plantilla de Qwen3.5 se aplica correctamente antes de desplegar un modelo serio de la misma familia.
- Bateria de pruebas de latencia en respuestas muy cortas: con `max_new_tokens=32` y temperatura 0, es un caso extremo para medir sobrecarga de prefill frente a decodificacion en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "suite publica de evaluacion conductual" alojada en el repositorio del dataset, pero no se proporcionan cifras (MMLU, HumanEval, GSM8K ni metricas de comportamiento) en los datos disponibles. Los resultados de busqueda web suministrados no contienen informacion relacionada con este modelo, por lo que no se pueden aportar comparaciones numericas.

## Requisitos de hardware

Estimaciones de VRAM para inferencia derivadas del tamano de los ficheros publicados; incluyen pesos mas margen para cache KV y sobrecarga del runtime, y aumentan con la longitud de contexto:

- BF16 (safetensors, 18,82 GB de pesos): aproximadamente 20-22 GB de VRAM con contexto corto. Requiere GPU de 24 GB en adelante; cabe con holgura en A100 40 GB, L40S 48 GB y H100 80 GB. En RTX 3090 o RTX 4090 (24 GB) queda muy justo y depende del contexto.
- GGUF BF16 (17,92 GB): mismo orden de requisitos que la version safetensors BF16.
- GGUF Q8_0 (9,53 GB): aproximadamente 11-13 GB de VRAM. Encaja en GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y en A10G de 24 GB.
- GGUF Q6_K (7,36 GB): aproximadamente 9-10 GB de VRAM; es la cuantizacion recomendada por el autor por su equilibrio entre tamano y comportamiento. Cabe en GPU de consumo de 12 GB con contexto reducido y de 16 GB con comodidad.
- GPU profesionales recomendadas segun presupuesto: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB para BF16; A10G, L4 o RTX 4090 para cuantizaciones Q8_0 y Q6_K.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 4070 Ti Super, RTX 4060 Ti 16 GB y, con contexto corto, en tarjetas de 12 GB usando Q6_K.
- Opciones de despliegue: Transformers con `AutoProcessor` y `Qwen3_5ForConditionalGeneration` (BF16, `device_map="auto"`); llama.cpp mediante `llama-server` con soporte reciente de Qwen3.5 y las opciones `--flash-attn on`, `--n-gpu-layers all`, `--jinja`, `--reasoning off`; cualquier runtime compatible con GGUF (por ejemplo Ollama o LM Studio) cargando el fichero manualmente. El repositorio incluye la etiqueta `endpoints_compatible`. No hay confirmacion de soporte oficial en vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La configuracion recomendada (`max_new_tokens=32`, temperatura 0) limita las respuestas a secuencias muy cortas, lo que reduce el coste de decodificacion, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axiomofmind/Angry-Claudius-9B | 9.409.813.744 | no disponible | sin benchmarks publicados en la informacion disponible; comportamiento de rechazo malsonante por diseno | apache-2.0 | HuggingFace, safetensors y GGUF |
| Qwen/Qwen3.5-9B (modelo base) | aproximadamente 9B, segun nomenclatura del autor | no disponible | no disponible | apache-2.0 | HuggingFace |
| Otros fine-tunes de novedad de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto informacion sobre modelos comparables de esta categoria (fine-tunes de comportamiento humoristico), por lo que la comparativa queda limitada al modelo base. No se dispone de cifras de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Comportamiento intencionadamente inutil: el modelo responde con negativas breves y lenguaje malsonante a cualquier peticion. La model card lo declara explicitamente como broma y desaconseja su uso cuando se necesita asistencia real.
- Riesgo de contenido ofensivo: el texto generado puede incluir palabras malsonantes y resultar inapropiado en entornos profesionales, educativos o de atencion al publico.
- Riesgo de incumplimiento de politicas: desplegarlo detras de una API publica o en una plataforma con politicas de contenido puede vulnerar los terminos de servicio de dicha plataforma.
- Alucinacion: el riesgo de afirmaciones falsas es bajo por la propia naturaleza del modelo (no responde a la pregunta planteada), pero el riesgo de salida inutilizable es practicamente total.
- Variabilidad entre cuantizaciones: el autor advierte de que la redaccion exacta puede variar entre formatos y niveles de cuantizacion, lo que complica cualquier evaluacion reproducible del comportamiento exacto.
- Sin datos de contexto ni de idiomas: se desconoce la ventana de contexto real y la cobertura idiomatica; no se debe asumir que iguala al modelo base en estos aspectos.
- Vision no incluida en GGUF: los ficheros GGUF son solo texto y no incorporan proyector de vision, pese a la etiqueta `image-text-to-text` del modelo base.
- Pesos MTP ausentes: no se incluyen los pesos de decodificacion especulativa multi-token, por lo que no se puede aplicar esa optimizacion con este fine-tune.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia no cubre el riesgo reputacional ni el cumplimiento de politicas de contenido derivados de su comportamiento ofensivo.
- Dataset de entrenamiento no inspeccionado: no se detalla su composicion ni su tamano en la informacion disponible, por lo que no se pueden evaluar sesgos especificos mas alla del sesgo de toxicidad buscado deliberadamente.
- Produccion: no apto. No usar en atencion al cliente, generacion de codigo, analisis de datos ni cualquier flujo donde se espere una respuesta correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Angry-Claudius-9B
- Dataset de entrenamiento y suite de evaluacion conductual: https://huggingface.co/datasets/axiomofmind/Angry-Claudius-9B-Dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime GGUF: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo; las busquedas devolvieron contenido no relacionado con inteligencia artificial.
