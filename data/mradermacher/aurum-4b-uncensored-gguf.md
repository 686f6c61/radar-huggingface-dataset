# mradermacher/Aurum-4B-Uncensored-GGUF

## Resumen

Aurum-4B-Uncensored-GGUF es una cuantizacion estatica del modelo Aurum-4B-Uncensored, publicada por el usuario mradermacher en Hugging Face. El repositorio no contiene pesos originales en precision completa, sino un conjunto de ficheros GGUF generados a partir del modelo base en formato Hugging Face, lo que permite su ejecucion en entornos de inferencia local como llama.cpp u Ollama.

El modelo subyacente es un unico fine-tune de aproximadamente 4.000 millones de parametros, etiquetado como "uncensored" por su autor original (2Beyes), lo que sugiere un ajuste orientado a reducir los rechazos y filtros de seguridad del modelo base. La model card no documenta que modelo preentrenado se uso como punto de partida, ni el dataset de ajuste, ni el proceso de entrenamiento.

La relevancia de esta publicacion es practica: ofrece 13 variantes de cuantizacion (desde Q2_K hasta F16) para que el modelo pueda ejecutarse en hardware de consumo. Sin embargo, la ausencia de informacion sobre arquitectura, licencia, idiomas y rendimiento limita seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido del formato GGUF y del tamano) |
| Parametros totales | aproximadamente 4B (por el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Aurum-4B-Uncensored. Por el tamano declarado (4B) y el formato GGUF, se trata con alta probabilidad de un transformer decoder-only, pero el repositorio no confirma la familia arquitectonica ni el modelo preentrenado de partida. Tampoco se documenta la longitud de contexto nativa ni si emplea tecnicas como GQA o attention lineal.

Respecto al entrenamiento, la model card de esta cuantizacion no aporta ningun dato: no se especifica el numero de tokens de ajuste, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La etiqueta "Uncensored" indica un ajuste para reducir la censura del modelo base, pero no hay documentacion tecnica que lo respalde. El repositorio de origen es https://huggingface.co/2Beyes/Aurum-4B-Uncensored, donde podria encontrarse informacion adicional, aunque no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva, segun el formato GGUF y el pipeline de llama.cpp.
- Capacidad de seguir instrucciones y mantener conversacion multi-turno, inferida del ajuste tipo chat del modelo base (no confirmado en la model card).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que el modelo base filtraria (caracteristica declarada, no verificada).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar disponible en GGUF y con variantes desde Q2_K, puede ejecutarse en portatiles con GPU modesta para pruebas de concepto de chatbots sin depender de APIs externas.
- Investigacion sobre alineacion y censura: util para estudiar el efecto de fine-tunes "uncensored" comparando respuestas frente al modelo base, siempre que se documente el origen del ajuste.
- Generacion creativa de ficcion sin restricciones tematicas: el ajuste uncensored permite explorar narrativas que los modelos alineados suelen rechazar, en entornos controlados y con supervision humana.
- Experimentacion con cuantizaciones: el repositorio ofrece 13 variantes, lo que permite medir el impacto de la cuantizacion (Q2_K frente a Q8_0) en calidad y velocidad sobre el mismo modelo.
- Despliegue en edge devices: las variantes Q2_K y Q3_K_S reducen el peso a unos pocos GB, lo que facilita su ejecucion en dispositivos con poca memoria.
- Base para fine-tuning posterior: al ser un modelo de 4B, puede servir como punto de partida para ajustes especificos en tareas de dominio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en F16, 4-5 GB en Q8_0, 2,5-3 GB en Q4_K_M y 1,5-2 GB en Q2_K (estimaciones por el tamano de 4B; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4090 o A100 para F16 y Q8_0 con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas para cuantizaciones Q4 y Q5; las variantes Q2 y Q3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles. Dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum-4B-Uncensored-GGUF | ~4B | no disponible | no disponible | GGUF | Cuantizacion de un fine-tune uncensored sin documentacion tecnica |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial con documentacion completa y benchmarks publicados |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva y buen rendimiento multilingue |
| Phi-3.5 Mini Instruct | 3,8B | 128K | MIT | safetensors, GGUF | Modelo pequeno con benchmarks publicados y licencia permisiva |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo Aurum que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe consultarse el repositorio de origen antes de cualquier despliegue.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible identificar sesgos sociales, culturales o linguisticos.
- Etiqueta "uncensored": implica menor filtrado de contenido, lo que puede generar respuestas inapropiadas, daninas o ilegales; requiere supervision y politicas de uso claras.
- Procedencia incierta: no se indica el modelo base, lo que plantea dudas sobre la licencia heredada y la trazabilidad de los datos de entrenamiento.
- Sin soporte de pipeline declarado: la model card no especifica tarea ni formato de prompt, por lo que la integracion requiere prueba y error.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Aurum-4B-Uncensored-GGUF
- Modelo de origen: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
