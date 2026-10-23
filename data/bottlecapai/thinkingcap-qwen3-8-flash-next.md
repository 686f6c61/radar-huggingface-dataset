# bottlecapai/ThinkingCap-Qwen3.8-Flash-Next

## Resumen

ThinkingCap-Qwen3.8-Flash-Next es un ajuste fino (post-entrenamiento) sobre el modelo base Qwen/Qwen3.8-Flash-Next del equipo Qwen, desarrollado por BottleCap AI. Su objetivo no es mejorar la precisión bruta, sino reducir el coste de inferencia en modelos con modo de razonamiento: según la model card, recorta los tokens de pensamiento un 38,5 % de media (con un rango del 22 % al 51 % segun el benchmark) manteniendo una precisión media del 88,8 % frente al 89,8 % del modelo base. Es, por tanto, un modelo orientado a eficiencia de tokens, no a maximizar scores.

El modelo base es un mixture-of-experts (MoE) con entrada de imagen, publicado en 2026, y ThinkingCap hereda esa arquitectura y sus capacidades multimodales (pipeline image-text-to-text). El checkpoint contiene 179.999.981.459 parámetros totales segun los safetensors del repositorio (unos 180.000 millones), con un tamaño de repo de 360,2 GB en precisión de entrenamiento. No se especifican en la información disponible el número de parámetros activos, la longitud de contexto ni la lista de idiomas soportados.

La relevancia práctica del modelo está en el coste por consulta: en tareas de razonamiento largo (matemáticas, código), la mayor parte del gasto de inferencia son tokens de pensamiento. Un recorte de ~40 % en esos tokens, con una pérdida de precisión de aproximadamente un punto porcentual, cambia el cálculo económico de desplegar un MoE de 180.000 millones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con entrada de imagen, derivada de Qwen/Qwen3.8-Flash-Next; el tag `qwen4_exp` aparece en el repositorio, sin detalle tecnico adicional disponible |
| Parametros totales | 179.999.981.459 (~180.000 millones, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades de entrada | texto e imagen (pipeline `image-text-to-text`) |
| Tipo de ajuste | finetune sobre Qwen/Qwen3.8-Flash-Next (`base_model_relation: finetune`) |
| Tamano del repositorio | 360,2 GB |
| Descargas / likes | 0 descargas / 19 likes |
| Fecha de publicacion | 22 de octubre de 2026 (actualizado el mismo dia) |
| Compatibilidad de despliegue | tag `endpoints_compatible`; region `us` |

## Arquitectura y entrenamiento

La arquitectura de base es un transformer con mezcla de expertos (MoE) y codificador visual, segun la propia model card ("a mixture-of-experts model with image input"). ThinkingCap no modifica la arquitectura: es un post-entrenamiento de "shorter-thinking" que actua sobre el comportamiento de razonamiento del modelo, es decir, sobre cuantos tokens genera en su fase de pensamiento antes de emitir la respuesta final. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se usaron tecnicas de RLHF, DPO o RL con recompensas basadas en longitud y correccion.

La innovacion declarada es la eficiencia de tokens: el modelo aprende a producir cadenas de razonamiento mas cortas sin degradar sustancialmente la exactitud. Los datos publicados respaldan el efecto: en AIME 2026 pasa de 16.694 a 9.281 tokens de media (reduccion del 44,4 %) con una exactitud de 97,19 frente a 97,92 del base, y en HMMT (noviembre de 2025) de 15.975 a 8.874 tokens con 97,71 frente a 99,17. El resumen agregado que da el autor es un 38,5 % menos de tokens de media y una exactitud media de 88,8 % frente a 89,8 %. No se documentan innovaciones de atencion (atencion lineal, decodificacion especulativa) ni cambios en el tokenizador.

## Capacidades

- Razonamiento con modo de pensamiento (thinking mode) y cadenas de razonamiento explicitas, optimizadas para ser mas breves que las del modelo base.
- Razonamiento matematico de competicion: los benchmarks publicados son AIME 2026 y HMMT (noviembre de 2025), ambos con exactitudes superiores al 97 %.
- Generacion de codigo: la model card agrupa los benchmarks bajo la categoria "Math & code", aunque no se publican resultados de HumanEval, LiveCodeBench ni similares.
- Entrada de imagen: pipeline `image-text-to-text`, por lo que acepta imagenes junto a texto (descripcion, extraccion de informacion, VQA). No se publican benchmarks de vision.
- Uso conversacional multi-turno (tag `conversational`).
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente; el modo de pensamiento es compatible con flujos multi-paso, pero no hay evaluacion publicada.
- Capacidades multilingues: no disponible (HuggingFace no lista idiomas para este modelo).

## Casos de uso

- Razonamiento matematico a gran escala en produccion: resolucion de problemas tipo competicion o verificacion de calculos en pipelines educativos, donde el recorte del 44 % en tokens de pensamiento (AIME 2026) reduce directamente el coste por problema resuelto con una perdida de 0,73 puntos de exactitud.
- Tutoria y correccion automatica de ejercicios: el modelo mantiene el modo de razonamiento (necesario para explicar pasos) pero con cadenas mas cortas, lo que abarata servir explicaciones paso a paso a muchos usuarios concurrentes.
- Agentes de codigo con razonamiento previo: al reducir la verbosidad del pensamiento, encaja mejor en bucles de agente con muchos turnos donde cada iteracion consume presupuesto de tokens; requiere validar antes el soporte real de tool calling, no documentado.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o formularios escaneados junto a instrucciones textuales; util para extraccion de datos en back office.
- Evaluacion y comparacion de estrategias de eficiencia: sirve como referencia para medir el trade-off exactitud/tokens en un MoE de 180.000 millones frente al base sin post-entrenamiento.
- Despliegue con restricciones de latencia: en escenarios donde el tiempo de respuesta esta dominado por la generacion de pensamiento, un 22-51 % menos de tokens se traduce en menor latencia de cola y mayor throughput por GPU.
- Investigacion sobre longitud de razonamiento: permite estudiar como varia la exactitud al truncar el pensamiento, usando el par base/ThinkingCap como control experimental.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (exactitud en porcentaje, con desviacion tipica; tokens de pensamiento en media por consulta):

| Benchmark | Exactitud base | Exactitud ThinkingCap | Tokens base | Tokens ThinkingCap | Reduccion |
|---|---|---|---|---|---|
| AIME 2026 | 97,92 ± 0,85 | 97,19 ± 1,15 | 16.694 | 9.281 | 44,4 % |
| HMMT (nov 2025) | 99,17 ± 1,03 | 97,71 ± 1,55 | 15.975 | 8.874 | no disponible (extracto truncado) |
| Media agregada (todos los benchmarks) | 89,8 % | 88,8 % | no disponible | no disponible | 38,5 % (rango 22-51 %) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, benchmarks multimodales ni evaluaciones de seguridad. El extracto de la tabla de la model card esta cortado tras la fila de HMMT, por lo que el resto de benchmarks individuales no se puede reproducir aqui.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros y del tamano del repositorio (360,2 GB); el autor no publica requisitos oficiales.

- Pesos en bf16/fp16: ~360 GB, equivalentes al tamano del repo. Requiere al menos 8 GPU de 80 GB (H100 SXM, A100 80GB, H200) para cargar el modelo completo con margen para cache KV y activaciones.
- Pesos en int8: ~180 GB. Encaja en 3 GPU de 80 GB (240 GB) o en configuraciones con offload parcial.
- Pesos en int4: ~90-95 GB. Cabe en 2 GPU de 80 GB o en una sola H200 (141 GB) / B200, con margen limitado para contexto largo.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090. Solo es viable con offload masivo a CPU/RAM del sistema (100-360 GB de RAM segun cuantizacion) y la GPU actuando como acelerador parcial; el throughput en ese modo es bajo.
- Opciones de despliegue: transformers (soporte declarado), servidores compatibles con safetensors y arquitectura Qwen (vLLM o TGI, sujeto a que la version concreta soporte la arquitectura `qwen4_exp`, no confirmado en la informacion disponible). llama.cpp/Ollama requeririan una conversion a GGUF que el repositorio no publica.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la reduccion de tokens de pensamiento del 22-51 % disminuye proporcionalmente el tiempo de generacion en cargas dominadas por razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next | ~180.000 M (MoE) | no disponible | Razonamiento eficiente en tokens (38,5 % menos) | qwen-community-license-1.0 | safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | ~180.000 M (MoE) | no disponible | Modelo generalista con vision y razonamiento | qwen-community-license-1.0 | HuggingFace, publicado por Qwen |
| Otros MoE de ~180.000 M con vision y thinking mode | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante y documentada es contra el modelo base: mismos parametros, misma licencia y mismo pipeline, con una diferencia de -1,0 punto de exactitud media y -38,5 % de tokens de pensamiento. No se dispone en la informacion proporcionada de especificaciones de terceros comparables (por ejemplo, familias tipo DeepSeek, Llama o Mixtral en ese rango), por lo que no se ofrece una tabla numerica adicional.

## Limitaciones y advertencias

- Degradacion de exactitud: la precision media baja de 89,8 % a 88,8 % y en casos concretos la caida es mayor (HMMT: -1,46 puntos). En dominios donde cada punto cuenta, el base puede ser preferible.
- Cobertura de evaluacion estrecha: solo se publican benchmarks de matematicas de competicion. No hay datos de codigo, vision, multilingue, tool calling ni seguridad, pese a que el modelo es multimodal.
- Riesgo de alucinacion: al acortar las cadenas de razonamiento se reduce la capacidad de autocorreccion; no se han publicado tasas de alucinacion ni evaluaciones de calibracion.
- Idiomas: no disponibles. No se puede asumir un rendimiento correcto en castellano sin evaluacion propia.
- Licencia: qwen-community-license-1.0 no es una licencia open source aprobada por la OSI. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede imponer condiciones de atribucion, restricciones de uso aceptable o limites de despliegue.
- Requisitos de infraestructura: 360 GB de pesos en precision de entrenamiento implican coste de almacenamiento y de serving alto; no hay versiones cuantizadas oficiales.
- Madurez: 0 descargas y publicacion el 22 de octubre de 2026, sin validacion independiente de los resultados declarados.
- Arquitectura no estandar: el tag `qwen4_exp` y la ausencia de confirmacion de soporte en vLLM/TGI implican riesgo de integracion; conviene probar la carga antes de planificar el despliegue.
- Los resultados de benchmarks proceden del propio autor; no se han replicado de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog del autor: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web del autor: https://www.bottlecapai.com/
- Demo en video: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next/resolve/main/thinkingcap_demo.mp4
- Demo en 4K: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next/resolve/main/thinkingcap_demo_4k.mp4
- Licencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo dominios de contenido para adultos sin relacion), por lo que no se incluyen.
