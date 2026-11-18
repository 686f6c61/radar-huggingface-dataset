# positron-ai/ibm-granite_granite-3.3-8b-instruct-hf-best-gptq

## Resumen

Este repositorio contiene una compilación cuantizada de `ibm-granite/granite-3.3-8b-instruct`, el modelo de lenguaje instructivo de 8.170.864.640 parámetros desarrollado por IBM Research dentro de la familia Granite 3.3. La publicación corre a cargo de Positron AI, que aplica cuantización GPTQ de 4 bits sobre los pesos originales en precisión completa para reducir el espacio en disco (4,5 GB en el repositorio) y los requisitos de memoria en inferencia. El modelo base es un transformer denso (no MoE) orientado a generación de texto conversacional, razonamiento y tareas de código, distribuido bajo licencia Apache 2.0.

El problema que resuelve este artefacto es concreto: permitir desplegar un modelo de 8B en GPUs con menos VRAM de la que exigiría la versión en bf16, manteniendo la interfaz de `transformers` y el pipeline `text-generation`. No se trata de un modelo nuevo ni de un fine-tuning, sino de una conversión de pesos con grupo de tamaño 128, cuantización asimétrica y `desc_act` desactivado, calibrada con 256 muestras de un conjunto mixto de dominios y longitud de secuencia 2048.

Su relevancia es práctica para equipos que ya han evaluado el modelo original de IBM y buscan una variante de 4 bits generada por un tercero. Conviene señalar que la model card no publica métricas de calidad (ni perplejidad, ni divergencia KL, ni precisión en benchmarks), por lo que la decisión de adopción debe apoyarse en una evaluación propia contra el modelo base y contra otras cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 3.3; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 8.170.864.640 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4 bits, grupo 128, asimetrica, `desc_act=false`, damp 0.05; activaciones sin cuantizar |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), cargable con `transformers`; tamano del repo 4,5 GB |

## Arquitectura y entrenamiento

El artefacto hereda la arquitectura del modelo base `ibm-granite/granite-3.3-8b-instruct`: un transformer denso de 8,17 mil millones de parámetros. La información disponible no detalla el número de capas, la configuración de atención, la composición del corpus de preentrenamiento ni las etapas de alineación (RLHF, DPO u otras) del modelo original; esos datos deben consultarse en la model card de IBM.

La contribución técnica de este repositorio es exclusivamente el proceso de cuantización. Se aplicó GPTQ con pesos de 4 bits, tamaño de grupo 128, esquema asimétrico y sin reordenación de descriptores (`desc_act=false`), con un 0,05 % de damping. La calibración empleó 256 muestras de un conjunto mixto de dominios con longitud de secuencia 2048. La cadena de herramientas declarada es GPTQModel 5.8.0, transformers 4.57.6, torch 2.9.1 y CUDA 12.8. No se especifica la precisión de origen de los pesos ni el runtime ni el hardware objetivo, y la model card indica explícitamente que no se publican métricas de divergencia KL, precisión o perplejidad.

## Capacidades

- Generación de texto conversacional multi-turno, con el formato de plantilla de chat del modelo base Granite 3.3 instruct.
- Razonamiento y resolución de problemas en lenguaje natural, heredados del modelo original.
- Generación y explicación de código, una de las áreas que IBM destaca en la familia Granite.
- Capacidades matemáticas propias del modelo base (no se documentan cifras en esta ficha).
- Soporte de tool calling y function calling según las capacidades del modelo base; esta conversión no las altera, pero tampoco las documenta de forma independiente.
- Uso en flujos de agente y razonamiento multi-paso en la medida en que lo permita el modelo original.
- Capacidades multilingües: no disponibles en la información proporcionada para este artefacto.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Despliegue en GPUs de gama alta para consumo con menos VRAM: al ocupar 4,5 GB en disco y pesos de 4 bits, permite servir el modelo en tarjetas donde la versión bf16 de 8B no cabría junto con el contexto y el resto del stack, siempre que se valide la pérdida de calidad con una evaluación propia.
- Atención al cliente automatizada: el modelo base está entrenado para instrucciones y diálogo multi-turno; esta variante permite montar un servicio de chat con `transformers` o un servidor compatible con la API de OpenAI, reduciendo el coste por réplica.
- Asistencia a la programación en herramientas internas: generación de fragmentos de código, explicación de errores y refactorizaciones sugeridas, integrado en editores o pipelines de revisión, con la advertencia de que la cuantización de 4 bits puede degradar tareas de código sensibles a la precisión.
- Clasificación y extracción de información estructurada: uso del modelo como motor de extracción de entidades o de resumen sobre documentos, aprovechando la ventana de contexto del modelo base (a confirmar en su model card).
- Prototipado rápido y evaluación comparativa: al ser una conversión ligera, sirve para comparar el comportamiento de GPTQ 4 bits frente al modelo original antes de comprometerse con un formato de producción.
- Generación de documentación técnica y resúmenes de incidencias: tareas de redacción asistida donde la latencia y el coste por token importan más que la precisión absoluta en razonamiento complejo.
- Backend de agentes con tool calling en entornos con presupuesto de memoria ajustado, validando previamente que el esquema de cuantización no rompe el formato de llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto indica de forma explícita que no reporta métricas de rendimiento ni de calidad (ni divergencia KL, ni precisión, ni perplejidad) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de 4 bits suman aproximadamente 4,1 GB (8,17B parámetros × 0,5 bytes), a los que hay que añadir overhead de carga, caché KV y buffers de activación; en la práctica se recomienda reservar entre 6 y 8 GB para contextos moderados, aunque no se dispone de cifras oficiales del autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el artefacto es apto para GPUs de consumo con 8 GB o más y para GPUs de datacenter (A100, H100, L40S) cuando se busca alta concurrencia.
- Cabe en GPUs de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM, condicionado al soporte del kernel GPTQ y al tamaño de contexto efectivo.
- Opciones de despliegue: `transformers` con el backend GPTQ (la librería declarada), y en principio servidores compatibles con pesos GPTQ de `transformers`; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible y debe verificarse antes de desplegar.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/ibm-granite_granite-3.3-8b-instruct-hf-best-gptq | 8,17B | no disponible | GPTQ 4 bits, grupo 128 | Apache 2.0 | Hugging Face, 10 descargas, 0 likes |
| ibm-granite/granite-3.3-8b-instruct | 8,17B | no disponible en esta ficha | bf16 original | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, otras GPTQ) | 8,17B | equivalente al base | segun artefacto | Apache 2.0 | Hugging Face; datos concretos no disponibles |

La comparación relevante es contra el modelo base y contra otras conversiones del mismo modelo: este artefacto no aporta capacidades nuevas, sino un compromiso entre memoria y fidelidad de pesos. No se dispone de datos de rendimiento comparado que permitan afirmar qué formato de cuantización preserva mejor la calidad.

## Limitaciones y advertencias

- No se publican métricas de calidad: sin perplejidad, divergencia KL ni resultados de benchmarks, no es posible cuantificar la degradación frente al modelo en bf16 sin una evaluación propia.
- La cuantización GPTQ de 4 bits puede afectar de forma desigual a tareas sensibles a la precisión numérica, como matemáticas o generación de código; conviene validar por tarea.
- Riesgo de alucinación inherente al modelo base, no mitigado por la conversión; en producción requiere verificación factual y salvaguardas.
- Sesgos conocidos del modelo original: no documentados en la información proporcionada para este artefacto; deben consultarse en la model card de IBM.
- Idiomas soportados no declarados en esta ficha; no asumir cobertura multilingüe sin verificar el modelo base.
- Longitud de contexto no indicada; no planificar despliegues con ventanas largas sin confirmar el valor en el modelo original.
- Licencia Apache 2.0 permite uso comercial, pero la model card recuerda que las restricciones de uso del modelo original siguen aplicándose; revisar la política de uso aceptable de IBM Granite.
- Artefacto de terceros con muy baja adopción (10 descargas, 0 likes) y sin validación externa publicada; considerar el riesgo de mantenimiento y de reproducibilidad.
- No se especifican runtime ni hardware objetivo, por lo que el soporte en motores de inferencia distintos de `transformers` no está garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/ibm-granite_granite-3.3-8b-instruct-hf-best-gptq
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- Organización Positron AI en Hugging Face: https://huggingface.co/positron-ai
- Organización IBM Granite en Hugging Face: https://huggingface.co/ibm-granite
- GPTQModel (herramienta de cuantización declarada): https://github.com/ModelCloud/GPTQModel
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
