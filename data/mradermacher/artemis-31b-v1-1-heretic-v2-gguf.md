# mradermacher/Artemis-31B-v1.1-heretic-v2-GGUF

## Resumen

Artemis-31B-v1.1-heretic-v2-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por el usuario mradermacher, generadas a partir del modelo coder3101/Artemis-31B-v1.1-heretic-v2. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a distintos niveles de compresión pensada para su ejecución en llama.cpp y en herramientas compatibles (Ollama, LM Studio, koboldcpp), con el objetivo de reducir los requisitos de memoria frente al modelo original.

El recuento real de parámetros declarado en los ficheros safetensors es de 30.697.345.596, es decir, aproximadamente 30,7 mil millones de parámetros, coherente con la denominación comercial "31B" del modelo base. El repositorio ocupa 19,8 GB y ofrece las cuantizaciones x-f16, Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card del repositorio no incluye información sobre arquitectura, datos de entrenamiento, longitud de contexto, licencia, idiomas soportados ni resultados de benchmarks. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y la búsqueda web no ha devuelto ninguna fuente técnica relacionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 (segun safetensors del modelo base) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Autor del repositorio | mradermacher |
| Modelo base | coder3101/Artemis-31B-v1.1-heretic-v2 |
| Tamano del repositorio | 19,8 GB |
| Metodo de conversion | convert_type: hf, quantize_version: 2, output_tensor_quantised: 1 |
| Fecha de creacion (metadatos) | 2026-09-20T18:48:14.000Z |
| Fecha de actualizacion (metadatos) | 2026-09-20T19:10:20.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura del modelo base: no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o un modelo de espacio de estados. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

El único dato técnico verificable del proceso de publicación es que se trata de una cuantización estática (quantize_version: 2, output_tensor_quantised: 1) realizada con el pipeline de conversión de GGUF a partir de pesos en formato HuggingFace (convert_type: hf). El campo vocab_type aparece vacío en los metadatos y no se ha aplicado ninguna exclusión de ficheros mmproj, lo que sugiere que no se distribuye un proyector multimodal en este repositorio, aunque esto no puede confirmarse como ausencia de capacidad de visión en el modelo base.

El sufijo "heretic" en el nombre del modelo base corresponde a una convención de nombres habitual en la comunidad para variantes sometidas a procesos de abliteration o eliminación de direcciones de rechazo. Esta interpretación es una inferencia a partir del nombre y no está confirmada por ninguna documentación del repositorio.

## Capacidades

- Generación de texto conversacional: la etiqueta conversational del repositorio indica que el modelo está orientado a diálogo de múltiples turnos.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que el modelo puede servirse a través de infraestructura compatible con la API de inferencia de HuggingFace.
- Ejecución local en CPU y GPU: el formato GGUF permite inferencia híbrida CPU/GPU con offload de capas.
- Quantización flexible: la disponibilidad de 12 niveles de cuantización permite ajustar el equilibrio entre calidad y consumo de memoria.
- Razonamiento, generación de código, matemáticas, tool calling, capacidades de agente, multilingüismo, visión, audio y modo de pensamiento explícito: no disponible (no documentado en la información proporcionada).

## Casos de uso

- Despliegue conversacional en hardware de consumo: con las cuantizaciones Q4_K_M o Q4_K_S, el modelo ocupa del orden de 18-19 GB y puede ejecutarse íntegramente en una GPU de 24 GB, lo que permite montar un asistente de chat local sin depender de APIs externas.
- Servicio de inferencia en servidor con vLLM o TGI: para las cuantizaciones de mayor precisión (Q6_K, Q8_0, f16) o para servir a varios usuarios concurrentes, el modelo puede desplegarse en GPUs de clase A100 o H100 con memoria suficiente para los pesos y la caché KV.
- Pruebas de evaluación de variantes "desrestringidas": el sufijo heretic permite utilizar este repositorio para comparar sistemáticamente el comportamiento de la variante base frente a su versión original, útil en investigación sobre alineación y tasas de rechazo, siempre que la licencia del modelo base lo permita.
- Prototipado en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K y Q3_K_S reducen el modelo a un rango aproximado de 11-14 GB, lo que posibilita su ejecución parcial en CPU con llama.cpp u Ollama en equipos con 32 GB de RAM.
- Integración en aplicaciones de escritorio: al ser GGUF, el modelo puede embeberse en herramientas tipo LM Studio o koboldcpp para asistentes de escritorio, editores de texto o interfaces de chat locales.
- Ajuste fino de la relación calidad/memoria en pipelines existentes: la variedad de cuantizaciones K-quant e IQ4_XS permite sustituir el modelo servido en un pipeline ya basado en llama.cpp sin cambiar la integración, únicamente el fichero de pesos.
- Generación de documentación o resúmenes en local con datos sensibles: el despliegue íntegramente local evita el envío de datos a servicios de terceros, condicionado a que la licencia del modelo base lo autorice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): f16 en torno a 61 GB; Q8_0 en torno a 32-33 GB; Q6_K en torno a 25-26 GB; Q5_K_M en torno a 21-22 GB; Q4_K_M en torno a 18-19 GB; Q3_K_M en torno a 15-16 GB; Q2_K en torno a 11-12 GB. Son estimaciones derivadas del recuento de parámetros, no medidas publicadas.
- GPU de clase profesional: A100 de 40 GB o 80 GB, H100 de 80 GB y H200 admiten cualquiera de las cuantizaciones, incluidas f16 y Q8_0, con margen para contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar Q4_K_M y Q4_K_S íntegramente en VRAM, y Q5_K_M con una ventana de contexto reducida. Para Q6_K y Q8_0 es necesario repartir capas entre dos GPUs de 24 GB o recurrir a offload parcial a CPU.
- Configuraciones multigpu: dos RTX 3090 o dos RTX 4090 (48 GB en total) permiten servir Q6_K y Q8_0 completos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. vLLM y TGI soportan GGUF de forma limitada, por lo que para producción de alto rendimiento suele preferirse el modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.
- Requisitos de almacenamiento: 19,8 GB para el repositorio completo con todas las cuantizaciones; cada fichero individual ocupa una fracción de ese total.

## Comparativa con modelos similares

La comparación es orientativa: los datos de las alternativas corresponden a información pública de esos modelos y no a la información proporcionada sobre este repositorio. No se dispone de benchmarks del modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible | Rendimiento comparado |
|---|---|---|---|---|---|
| Artemis-31B-v1.1-heretic-v2 (este repo) | ~30,7B | no disponible | no disponible | Si (12 cuantizaciones) | no disponible |
| Qwen2.5-32B-Instruct | ~32,5B | 131.072 tokens (configuracion habitual) | Apache-2.0 (segun su model card) | Si, mediante terceros | no disponible para comparar |
| Gemma-2-27B-it | ~27B | 8.192 tokens | Licencia Gemma (uso comercial con condiciones) | Si, mediante terceros | no disponible para comparar |
| Mistral Small 3 (24B) | ~24B | 32.000 tokens | Apache-2.0 (segun su model card) | Si, mediante terceros | no disponible para comparar |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no especifica licencia, idiomas, contexto, arquitectura ni datos de entrenamiento. Cualquier uso en producción requiere verificar primero la licencia del modelo base coder3101/Artemis-31B-v1.1-heretic-v2.
- Licencia no declarada: al no figurar la licencia en el repositorio, no puede asumirse que el uso comercial esté permitido. Es un riesgo legal directo para despliegues empresariales.
- Variante potencialmente desrestringida: si el sufijo heretic implica un proceso de abliteration, es previsible una mayor propensión a generar contenido sin filtros de seguridad, lo que exige moderación adicional en aplicaciones expuestas a usuarios finales.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible; es un riesgo inherente a cualquier modelo de lenguaje sin benchmarks publicados.
- Degradación por cuantización: Q2_K y Q3_K_S implican pérdidas de precisión notables, especialmente en tareas de razonamiento matemático y generación de código. Para uso serio se recomienda Q4_K_M o superior.
- Idiomas: no disponible. No puede confirmarse el soporte de castellano ni de otros idiomas distintos del inglés.
- Contexto: no disponible. No puede planificarse un caso de uso con documentos largos sin conocer la ventana real del modelo base.
- Madurez del repositorio: cero descargas y cero valoraciones en el momento de la consulta, sin fecha de validación posterior; se trata de una publicación reciente y no contrastada por la comunidad.
- Reproducibilidad: no se documenta la versión de llama.cpp ni los parámetros exactos de conversión, más allá de quantize_version: 2 y output_tensor_quantised: 1.
- Metadatos con fecha futura: la fecha de creación registrada (2026-09-20) es posterior a la fecha habitual de consulta; conviene verificar la integridad y el origen del repositorio antes de descargarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-v2-GGUF
- Modelo base: https://huggingface.co/coder3101/Artemis-31B-v1.1-heretic-v2
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a portales de noticias turcos (haberler.com, ensonhaber.com, sozcu.com.tr, haber7.com) sin relación alguna con el modelo.
- Papers, blogs, repositorios o demos adicionales: no disponible.
