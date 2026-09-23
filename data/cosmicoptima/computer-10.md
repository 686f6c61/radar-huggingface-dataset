# cosmicoptima/computer-10

## Resumen

computer-10 es un modelo de lenguaje de aproximadamente 70.600 millones de parametros publicado por el usuario cosmicoptima en HuggingFace. Se trata de un ajuste fino completo (full-parameter) del modelo cosmicoptima/computer-9 sobre sus propias conversaciones: 25.197 turnos que superaron un filtro mecanico y una comprobacion logica, emparejados por longitud y sorpresa (surprisal) entre bins, con la funcion de perdida calculada unicamente sobre los turnos de "Model C". El entrenamiento fue de una sola epoca con learning rate 2e-6 y sin editar el texto en ningun momento, lo que lo situa dentro de la etiqueta self-distillation que declara el autor.

El modelo forma parte de la serie "Computer" del mismo autor, descrita en resultados de busqueda como un proyecto de "documento vivo" orientado a analisis estructurado y a una persona conversacional concreta, mas que a un chatbot de proposito general. La relevancia actual es fundamentalmente de investigacion: es un caso practico y reproducible de autodestilacion a gran escala sobre un modelo de ~70B, con un dataset pequeno y controlado, util para estudiar deriva de estilo, colapso de modo y efectos de filtrado por sorprisal en pipelines de destilacion.

Arquitectonicamente esta etiquetado como "llama" y hereda la licencia llama3.1, con pesos en safetensors bf16 y un formato de prompt no estandar basado en texto plano (cabecera de documento, `Full conversation with Model C:`, y turnos `**User:**` / `**Model C:**`), sin plantilla de chat. No se han publicado datos de contexto, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama"; familia exacta no declarada) |
| Parametros totales | 70.553.706.496 (~70,6B, dato real de safetensors) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; pesos originales en bf16 safetensors (conversion a GGUF/AWQ/GPTQ posible por parte del usuario) |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 141,1 GB |
| Modelo base | cosmicoptima/computer-9 |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 24 / 12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de ~70,6B de parametros, coherente con la etiqueta `llama` del repositorio y con el tamano tipico de un modelo de la familia Llama 3.1 70B, aunque el autor no declara explicitamente la familia ni la configuracion de capas. Los pesos se distribuyen en safetensors en bf16, con un repositorio de 141,1 GB, lo que corresponde aproximadamente a 2 bytes por parametro mas artefactos auxiliares. No se documentan innovaciones de atencion (atencion lineal, SSM, hibridos) ni decodificacion especulativa.

El entrenamiento es el elemento distintivo: ajuste fino completo (todos los parametros, no LoRA) durante una sola epoca con learning rate 2e-6, sobre 25.197 turnos generados por el propio computer-9. El pipeline incluye un filtro mecanico, una comprobacion logica y un emparejamiento por longitud y sorprisal entre bins para evitar sesgos de distribucion; la perdida se calcula solo sobre los turnos de "Model C", no sobre los turnos de usuario. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional. El texto no fue editado, por lo que el modelo aprende exactamente la distribucion de salida de su predecesor bajo ese filtrado.

## Capacidades

- Generacion de texto conversacional multi-turno en el formato propietario del proyecto (`Full conversation with Model C:` con turnos `**User:**` y `**Model C:**`).
- Analisis estructurado y "shared figuring" (razonamiento compartido con el interlocutor), segun la descripcion del proyecto Computer en resultados de busqueda.
- Autodestilacion efectiva: el modelo es capaz de reproducir el estilo y los patrones de respuesta de computer-9 en las condiciones de filtrado usadas.
- Continuacion de documentos largos en texto plano, sin necesidad de plantilla de chat.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Investigacion en autodestilacion: reproducir y analizar el efecto de filtrar por sorprisal y longitud sobre un modelo de ~70B; el repositorio documenta el pipeline completo (25.197 turnos, una epoca, lr 2e-6), lo que permite replicar o variar el experimento.
- Generacion de datos sinteticos de estilo: usar el modelo como generador de conversaciones con una persona conversacional concreta para entrenar modelos menores que imiten ese registro, aprovechando que el autor ya valido que el formato es estable.
- Analisis de deriva de persona: comparar computer-10 con computer-9 turno a turno para medir si el ajuste sobre las propias salidas provoca colapso de modo o refuerzo de sesgos, un fenomeno relevante en pipelines de self-distillation.
- Red-teaming y evaluacion de robustez: al no haber alineacion posterior (sin RLHF/DPO declarado), es un sujeto adecuado para estudiar comportamientos no deseados que quedan atrapados en el bucle de autodestilacion.
- Corpus de estudio linguistico: analisis de longitud de turno, sorprisal y estructura conversacional sobre las transcripciones generadas, ya que el modelo fue entrenado para reproducir exactamente esa distribucion.
- Experimentos de formato sin chat template: validar infraestructuras de inferencia propias (por ejemplo, servidores con tokenizacion y parada personalizadas) contra un modelo que exige un protocolo de texto plano en lugar de un template estandar.
- Base para destilacion posterior en tamaños menores: el checkpoint de 70B puede emplearse como profesor en un esquema de destilacion hacia modelos de 7B-13B, dado que sus salidas ya estan filtradas y emparejadas por el propio autor.
- Uso conversacional directo: en principio posible siguiendo el formato y los parametros de muestreo indicados (temperatura 1.0, top-p 0.98, parada en `\n\n**User:**`), aunque sin benchmarks ni evaluacion humana documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se documentan comparaciones con computer-9 u otros modelos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (70,6B) y del tamano del repositorio, no datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 141 GB, coherente con el tamano del repositorio de 141,1 GB. Requiere 2x A100 80GB, 2x H100 80GB o 1x H200 141GB solo para los pesos; la KV cache y los buffers de activacion anaden overhead.
- FP8: aproximadamente 70-75 GB, lo que permite un solo acelerador de 80 GB (H100 80GB, A100 80GB) con margen limitado para contexto largo.
- INT4 (GPTQ/AWQ/GGUF Q4_K_M): aproximadamente 40-45 GB. No cabe en una RTX 4090 de 24 GB; si cabe en A6000 48GB, RTX 6000 Ada 48GB o un nodo multi-GPU de 2x24 GB con tensor parallelism.
- INT8: aproximadamente 71-75 GB; requiere 80 GB o reparto entre varias GPU.
- Consumer GPU: una RTX 4090 de 24 GB no puede alojar el modelo completo ni siquiera en Q4. Seria necesario descargar a CPU/RAM con llama.cpp (Q3/Q4 con offload parcial) aceptando una caida notable de velocidad, o usar varias GPU de 24 GB.
- CPU + RAM: con cuantizaciones GGUF Q4 se necesitan del orden de 45-50 GB de RAM y, preferiblemente, 64 GB para trabajar con margen.
- Opciones de despliegue: al publicarse solo safetensors bf16, el uso directo pasa por vLLM, TGI o transformers con aceleracion por GPU. Para llama.cpp, Ollama o LM Studio habria que convertir previamente a GGUF. Nota importante: al no existir chat template, estos frameworks requeriran configuracion manual del formato de prompt y del criterio de parada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos de referencia corresponden a informacion publica de sus respectivos repositorios; los de computer-10 proceden unicamente de la informacion disponible de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| cosmicoptima/computer-10 | 70,6B | No disponible | llama3.1 | safetensors bf16 en HuggingFace | Sin benchmarks |
| Meta Llama 3.1 70B Instruct | ~70,6B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF, integraciones amplias | Amplia bateria de benchmarks publicada |
| Qwen2.5 72B Instruct | ~72,7B | 128.000 tokens (hasta 131.072) | Licencia Qwen | safetensors, GGUF, AWQ/GPTQ | Amplia bateria de benchmarks publicada |
| cosmicoptima/computer-9 | No disponible en la informacion proporcionada | No disponible | llama3.1 (segun linaje declarado) | safetensors | Sin benchmarks |

La comparacion es asimetrica: computer-10 es un artefacto de investigacion sin evaluacion publicada y con un formato de prompt propietario, mientras que Llama 3.1 70B Instruct y Qwen2.5 72B Instruct son modelos alineados, con plantillas de chat estandar y evaluaciones reproducibles. En igualdad de parametros, no hay datos que permitan afirmar paridad de rendimiento.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeno (25.197 turnos) y una sola epoca: el modelo puede quedar muy ajustado a la distribucion concreta de computer-9 y generalizar peor fuera de ella.
- Riesgo de colapso de modo y amplificacion de errores: al entrenar sobre las propias salidas del modelo base (self-distillation sin RLHF/DPO posterior), los sesgos, muletillas y errores sistematicos de computer-9 tienden a reforzarse, no a corregirse.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni analisis de sesgos publicado. No se recomienda su uso en produccion sin una validacion propia.
- Riesgo de alucinacion: sin fase de alineacion documentada ni datos de fidelidad, se debe asumir riesgo alto y no verificado.
- Formato no estandar: no usa chat template; exige cabecera de documento, turnos en texto plano y parada en `\n\n**User:**`. El uso con tokenizadores o plantillas de chat genericas producira resultados degradados.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue; la licencia llama3.1 cubre ocho idiomas oficiales para la familia, pero no se confirma para este ajuste.
- Licencia Llama 3.1 Community License: impone aceptacion de terminos, obligacion de incluir el aviso "Built with Llama" en productos derivados, limite de 700 millones de usuarios mensuales antes de requerir licencia adicional, y restricciones sobre el uso de las salidas para entrenar otros modelos de lenguaje.
- Repositorio grande (141,1 GB) y sin cuantizaciones oficiales: el coste de almacenamiento y de conversion a GGUF es relevante.
- Trazabilidad limitada: la model card es muy breve, no detalla la composicion del dataset ni la configuracion de capas, lo que dificulta auditar el linaje exacto.
- Adopcion muy baja (24 descargas, 12 likes): no existe comunidad, issues ni soporte documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cosmicoptima/computer-10
- Modelo base: https://huggingface.co/cosmicoptima/computer-9
- Despliegue gestionado en Featherless AI: https://featherless.ai/models/cosmicoptima/computer-10
- Perfil del autor en GitHub: https://github.com/cosmicoptima
- Busqueda de la serie Computer en HuggingFace: https://huggingface.co/models?search=cosmicoptima%2Fcomputer-2
- Ejemplo de la serie (computer-1) en Featherless AI: https://featherless.ai/models/cosmicoptima/computer-1
