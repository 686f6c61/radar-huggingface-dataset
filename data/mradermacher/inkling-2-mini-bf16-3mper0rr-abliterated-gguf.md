# mradermacher/Inkling-2-mini-BF16-3MPER0RR-Abliterated-GGUF

## Resumen

Inkling-2-mini-BF16-3MPER0RR-Abliterated-GGUF es una distribucion de cuantizaciones GGUF estaticas generadas por mradermacher a partir del modelo base Inkling-2-mini-BF16-3MPER0RR-Abliterated, publicado por el usuario 3MPER0RR. Se trata, por tanto, de un artefacto de conversion y no de un modelo entrenado desde cero por el autor del repositorio: el valor anadido esta en ofrecer los pesos en formato GGUF listos para inferencia en llama.cpp y herramientas compatibles, cubriendo un espectro amplio de niveles de cuantizacion.

El modelo subyacente cuenta con 26.070.385.152 parametros (aproximadamente 26,1 mil millones), segun los datos reales de safetensors asociados al repositorio, y el tamano total del repo es de 27,9 GB. El nombre sugiere una variante "mini" de una familia denominada Inkling, presumiblemente orientada a conversacion, aunque no se dispone de documentacion tecnica oficial sobre arquitectura, datos de entrenamiento ni contexto maximo.

La relevancia practica de este repositorio es limitada pero concreta: permite ejecutar un modelo de ~26B en hardware de consumo o en servidores sin GPU de gama alta mediante cuantizaciones de 2 a 8 bits, a costa de una perdida de calidad que crece en los niveles mas agresivos. Al no haber descargas ni likes registrados y carecer de model card detallada, debe tratarse como un artefacto experimental que requiere validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); origen en BF16 |
| Tamano del repo | 27,9 GB |
| Version de quantize | 2 |
| Tipo de conversion | hf |
| Tensor de salida cuantizado | si (output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base: la model card del repositorio de cuantizacion no incluye descripcion de capas, tipo de atencion, uso de MoE o estrategias de decodificacion. El unico dato estructural fiable es el recuento de parametros (26.070.385.152) obtenido de los tensores en safetensors del modelo original, lo que situa al modelo en la franja de los 26B densos o, alternativamente, en un MoE con un total de 26B y activos desconocidos.

Tampoco hay informacion sobre el corpus de entrenamiento, numero de tokens, composicion del dataset ni sobre tecnicas de alineacion como RLHF, DPO o similares. El sufijo "Abliterated" en el nombre del modelo base es una convencion habitual en la comunidad para indicar que se han aplicado tecnicas de "abliteration" (modificacion de pesos para reducir rechazos y restricciones de contenido); sin embargo, el repositorio no documenta el procedimiento aplicado ni su alcance, por lo que esta interpretacion debe considerarse una hipotesis basada en la nomenclatura, no un hecho confirmado.

El proceso de cuantizacion si esta parcialmente documentado en los metadatos: se uso la version 2 del pipeline de quantize, conversion de tipo "hf" y cuantizacion del tensor de salida. Se ofrecen doce variantes, desde x-f16 (practicamente sin perdida) hasta Q2_K e IQ4_XS (cuantizaciones agresivas con perdida notable de fidelidad).

## Capacidades

- Generacion de texto conversacional: la unica etiqueta funcional presente es "conversational", lo que indica un ajuste orientado a dialogo multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que el formato GGUF generado puede servirse a traves de infraestructuras de inferencia compatibles con la API de endpoints.
- Ejecucion local en llama.cpp y derivados: al estar en GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores basados en llama-cpp-python.
- Razonamiento y codigo: no disponible; no hay evidencia documentada de capacidades especificas mas alla de la conversacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue de chat local en estaciones de trabajo: con las variantes Q4_K_M o Q5_K_M, un modelo de ~26B puede ejecutarse en una GPU de consumo con 24 GB de VRAM o en configuraciones CPU+GPU con RAM suficiente, permitiendo un asistente conversacional privado sin dependencia de la nube.
- Prototipado de aplicaciones conversacionales: la variante x-f16 o Q8_0 sirve para validar el comportamiento del modelo base antes de invertir en infraestructura, ya que preserva casi toda la fidelidad numerica del BF16 original.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce niveles distintos, lo que permite medir empiricamente la degradacion de calidad (perplejidad, coherencia en dialogos) entre Q2_K y Q8_0 sobre el mismo modelo, un caso de uso metodologico habitual en investigacion de eficiencia.
- Experimentacion con modelos "abliterated": para equipos que investigan el efecto de la ablacion de pesos sobre el comportamiento de rechazo, esta distribucion facilita ejecutar el modelo en hardware modesto y comparar respuestas antes y despues de la modificacion.
- Servicio de inferencia en CPU para entornos sin GPU: las cuantizaciones Q3_K_S y Q2_K reducen el peso a un rango manejable para servidores solo-CPU, adecuado para tareas de generacion de texto de baja latencia critica.
- Base para fine-tuning ligero o evaluacion de seguridad: al disponer de pesos en GGUF y de un origen BF16 referenciado, se puede usar como punto de partida para auditorias de sesgo y contenido antes de integrarlo en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el peso de cada cuantizacion para ~26,1B parametros): x-f16 en torno a 52 GB; Q8_0 en torno a 28 GB; Q6_K en torno a 22 GB; Q5_K_M en torno a 19 GB; Q4_K_M en torno a 16 GB; Q3_K_M en torno a 13 GB; Q2_K en torno a 10 GB. Estas cifras son estimaciones por regla general de bits por parametro y deben verificarse con el tamano real de cada fichero del repo (27,9 GB en total para todas las variantes).
- GPU recomendadas: para Q8_0 o x-f16, A100 80 GB o H100 80 GB; para Q5_K_M y Q4_K_M, RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 (48 GB); para Q3_K_M y Q2_K, GPU de 12-16 GB como RTX 4070 Ti o RTX 4080, o incluso RTX 3060 de 12 GB en configuraciones con offload parcial.
- Cabe en GPU de consumo: si, en las variantes Q4_K_M y superiores con 24 GB de VRAM, y en Q3_K_M o Q2_K con 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el tag "endpoints_compatible" apunta a despliegues via API.
- Latencia y throughput: no disponibles; dependen del hardware, del nivel de cuantizacion y de la longitud de contexto, que tampoco se conoce.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo base (familia Inkling) ni de benchmarks que permitan situarlo frente a alternativas de tamano comparable como Llama 3.1 8B, Mistral Small 24B o Qwen2.5 32B. La comparacion por parametros y contexto no puede realizarse sin datos de arquitectura y ventana de contexto.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni ficha de licencia, ni idiomas declarados, ni contexto maximo; cualquier uso en produccion exige una evaluacion propia previa.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso para uso comercial; el modelo base y sus derivados deben tratarse como de uso incierto hasta confirmacion.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado para este modelo concreto; no hay evaluaciones de fidelidad factual.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S pueden degradar notablemente la coherencia y el razonamiento; para tareas sensibles se recomienda Q5_K_M o superior.
- Origen "Abliterated": la modificacion de pesos para reducir rechazos puede aumentar la probabilidad de generar contenido danino o inapropiado, y no hay documentacion del metodo ni de sus efectos colaterales.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no existe evidencia de la comunidad sobre su calidad o estabilidad.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Fecha de creacion futura en los metadatos (2026-11-26): conviene verificar la integridad y procedencia de los ficheros antes de confiar en ellos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Inkling-2-mini-BF16-3MPER0RR-Abliterated-GGUF
- Modelo base referenciado: https://huggingface.co/3MPER0RR/Inkling-2-mini-BF16-3MPER0RR-Abliterated
