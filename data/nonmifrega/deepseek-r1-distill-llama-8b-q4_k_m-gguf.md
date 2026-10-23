# NonMiFrega/DeepSeek-R1-Distill-Llama-8B-Q4_K_M-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino una cuantización en formato GGUF del modelo `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, publicada por el usuario `NonMiFrega` mediante el espacio `gguf-my-repo` de ggml.ai. El resultado es un único fichero de pesos de 4,9 GB en cuantización Q4_K_M, listo para ejecutarse con llama.cpp en CPU o GPU de consumo, sin necesidad de infraestructura de servidor ni de convertir pesos manualmente.

El modelo subyacente pertenece a la familia DeepSeek-R1: un destilado del razonamiento del modelo R1 original sobre una base de 8.030.261.312 parámetros (aproximadamente 8,03 mil millones), distribuido con licencia MIT. Su interés práctico radica en que permite ejecutar localmente un modelo orientado a razonamiento explícito (cadena de pensamiento) en hardware modesto, algo que las variantes completas de R1 no permiten.

La relevancia de esta ficha es doble: por un lado, documenta el formato y los requisitos de despliegue de la cuantización; por otro, advierte de que se trata de una conversión de terceros, sin validación publicada, con cero descargas y cero valoraciones en el momento de la consulta. No hay resultados de benchmarks ni métricas de calidad asociadas a esta conversión concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base; la model card no aporta detalles adicionales) |
| Parámetros totales | 8.030.261.312 (~8,03 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q4_K_M (fichero único); el repositorio no incluye otras variantes |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`deepseek-r1-distill-llama-8b-q4_k_m.gguf`); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 4,9 GB |
| Librería declarada | transformers (etiqueta heredada); ejecución real vía llama.cpp |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` |
| Etiquetas | transformers, gguf, llama-cpp, gguf-my-repo, conversational, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23T15:39:29Z |

## Arquitectura y entrenamiento

El publicador de este repositorio no ha entrenado ni ajustado ningún modelo: la model card indica explícitamente que el checkpoint se ha convertido a GGUF desde el modelo base usando llama.cpp a través del espacio GGUF-my-repo de ggml.ai. Por tanto, la arquitectura corresponde a la del modelo base DeepSeek-R1-Distill-Llama-8B (transformer decoder-only de ~8,03 mil millones de parámetros), y no se han documentado en esta ficha ni la composición del dataset de destilación, ni el número de tokens, ni si hubo fases de RLHF o DPO.

La innovación técnica de esta publicación es puramente de empaquetado: la cuantización Q4_K_M es una cuantización de bloques con precisión mixta (los tensores más sensibles se mantienen en mayor precisión), lo que reduce el peso de ~16 GB en BF16 a 4,9 GB conservando la estructura del modelo. El modelo base pertenece a la familia de destilados de DeepSeek-R1, entrenados para producir trazas de razonamiento antes de la respuesta final; los detalles de ese proceso de destilación no aparecen en la información disponible y deben consultarse en la model card original de DeepSeek.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y expone pesos utilizables con la plantilla de chat del modelo base.
- Razonamiento con cadena de pensamiento: por su linaje (familia DeepSeek-R1), se espera que el modelo genere trazas de razonamiento antes de responder; esto no está documentado en esta conversión concreta.
- Ejecución local en CPU y GPU mediante llama.cpp, con binarios `llama-cli` y `llama-server`.
- Servidor HTTP con API compatible con el ecosistema OpenAI a través de `llama-server` (capacidad de llama.cpp, no documentada explícitamente en la model card).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el razonamiento multi-paso implícito deriva del modo de cadena de pensamiento del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada (la etiqueta de idiomas no está rellena).
- Capacidades especiales: no se documentan visión, audio ni modo thinking conmutables. El contexto de ejemplo en la model card se limita a 2048 tokens (`-c 2048`).

## Casos de uso

- **Prototipado de razonamiento en equipo de desarrollo sin GPU dedicada**: con 4,9 GB de pesos, el modelo se puede cargar en un portátil con 8-16 GB de RAM y ejecutar con `llama-cli` para validar prompts de razonamiento antes de escalar a un modelo mayor.
- **Asistente offline en entornos aislados (air-gapped)**: el fichero GGUF único se copia a una máquina sin conexión y se sirve con `llama-server`, sin dependencias de red ni llamadas a APIs externas, lo que encaja en entornos con requisitos de confidencialidad.
- **Generación y revisión de código en local**: el modelo base es un destilado orientado a tareas de razonamiento, por lo que se puede usar para explicar fragmentos de código, proponer parches y revisar lógica paso a paso; sin tool calling documentado, la integración en CI/CD requeriría un orquestador externo que invoque `llama-server`.
- **Tutoría y explicaciones paso a paso**: útil en escenarios educativos donde interesa ver el razonamiento intermedio (matemáticas, lógica, problemas de varios pasos), siempre con revisión humana por el riesgo de trazas plausibles pero incorrectas.
- **Backend de bajo coste para demos y pruebas de concepto**: `llama-server` permite exponer el modelo en un endpoint HTTP y conectarlo a interfaces tipo chat sin coste por token, adecuado para demos internas con pocos usuarios concurrentes.
- **Procesamiento por lotes en CPU**: resúmenes, clasificación o reescritura de textos en lotes nocturnos donde la latencia no es crítica y se prioriza no depender de servicios cloud.
- **Evaluación comparativa de cuantizaciones**: sirve como referencia Q4_K_M frente al BF16 del modelo base para medir la degradación de calidad en tareas propias antes de fijar una cuantización en producción.
- **Despliegue en dispositivos de borde**: equipos con 8 GB de memoria unificada o tarjetas gráficas de 8 GB pueden alojar el modelo con contextos cortos (2048 tokens, como en el ejemplo de la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de esta conversión no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web proporcionados no contienen datos del modelo (son resultados sobre la función de búsqueda visual de Microsoft Edge y sobre Vim). Cualquier cifra de calidad de esta cuantización requeriría una evaluación propia frente al modelo base en BF16.

## Requisitos de hardware

- **VRAM estimada**: los pesos Q4_K_M ocupan 4,9 GB; con caché KV y sobrecarga del runtime, una estimación razonable es de 6-7 GB para contextos de 4096 tokens y de 5,5-6 GB para 2048 tokens. Son estimaciones de cálculo, no mediciones publicadas.
- **GPU de consumo**: cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 3070, RTX 4060) con contexto limitado; funciona con holgura en 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y en 24 GB (RTX 3090, RTX 4090).
- **GPU de datacenter**: A100, H100 y L40S pueden ejecutar el modelo, pero están sobredimensionadas para 8,03 mil millones de parámetros en Q4; su interés en este caso sería el batching concurrente, no la capacidad.
- **CPU y Apple Silicon**: viable en x86 con 8-16 GB de RAM y en Mac con memoria unificada; el rendimiento depende del número de núcleos y del ancho de banda de memoria, y no se han publicado mediciones de tokens por segundo.
- **Despliegue documentado**: llama.cpp, tanto en CLI (`llama-cli --hf-repo NonMiFrega/DeepSeek-R1-Distill-Llama-8B-Q4_K_M-GGUF --hf-file deepseek-r1-distill-llama-8b-q4_k_m.gguf -p "..."`) como en servidor (`llama-server ... -c 2048`). Instalación vía `brew install llama.cpp` o compilación con `LLAMA_CURL=1` y flags específicos de hardware (`LLAMA_CUDA=1`).
- **Otras opciones**: al ser un GGUF estándar, es compatible con runtimes tipo Ollama o LM Studio, aunque el repositorio no documenta ni valida esas rutas.
- **Latencia y throughput**: no disponibles. Dependen del backend (CPU, CUDA, Metal), de la cuantización y de la longitud de la cadena de razonamiento generada, que en modelos de este tipo suele aumentar el número de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Q4_K_M) | 8,03 B | No disponible | GGUF, 4,9 GB | MIT | Conversión de terceros, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` (base) | 8,03 B | No disponible en la información proporcionada | Safetensors BF16, ~16 GB (estimado a partir del número de parámetros) | MIT | Repositorio oficial del modelo base |
| Otras cuantizaciones GGUF del mismo modelo | 8,03 B | No disponible | Q8_0 ~8,5 GB; Q2_K ~3 GB (estimaciones por tamaño de bloque) | MIT | Depende del publicador |
| Llama 3.1 8B Instruct (modelo no destilado) | ~8 B | No verificado en la información disponible | Safetensors / GGUF | Licencia comunitaria de Llama 3.1 | Amplia disponibilidad |

No se dispone de datos de benchmarks homogéneos para comparar la calidad de estas alternativas; la comparación anterior se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Conversión de terceros sin validación**: el repositorio lo publica el usuario `NonMiFrega` mediante un espacio automático; no hay informe de conversión, checksum verificado ni pruebas de calidad publicadas.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- **Fecha de creación anómala**: el repositorio figura creado el 2026-10-23, posterior a la fecha habitual de consulta; conviene verificar la integridad y el origen del fichero antes de usarlo en producción.
- **Pérdida de precisión por cuantización**: Q4_K_M introduce degradación respecto a BF16, especialmente en tareas de razonamiento largo, matemáticas y código; no se han publicado mediciones de esa degradación.
- **Riesgo de alucinación**: propio de los modelos de 8 mil millones de parámetros y acentuado en cadenas de razonamiento, donde una traza plausible puede conducir a una conclusión errónea.
- **Contexto no documentado**: la model card solo muestra un ejemplo con `-c 2048`; no se confirma la ventana máxima soportada ni su comportamiento en contextos largos.
- **Idiomas no declarados**: la metadato de idiomas está vacía; no hay garantía documentada de calidad en castellano ni en otros idiomas.
- **Sin tool calling documentado**: no se puede asumir soporte de function calling ni de protocolos de agentes; cualquier integración de ese tipo requiere validación previa.
- **Licencia**: MIT en los metadatos, heredada del modelo base; conviene revisar la model card original de DeepSeek para confirmar condiciones de uso comercial y atribución.
- **Coste de inferencia por razonamiento**: al generar trazas antes de la respuesta, el número de tokens de salida crece y con ello la latencia y el consumo de contexto; en producción hay que fijar límites de tokens.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NonMiFrega/DeepSeek-R1-Distill-Llama-8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Resultados de búsqueda web: ninguno de los enlaces devueltos (preguntas de Stack Overflow sobre la búsqueda visual de Microsoft Edge, sobre Vim y sobre la API Bing Visual Search) guarda relación con este modelo; se descartan por no ser fuentes relevantes.
