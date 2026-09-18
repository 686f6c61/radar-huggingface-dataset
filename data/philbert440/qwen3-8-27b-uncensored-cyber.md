# philbert440/Qwen3.8-27B-Uncensored-Cyber

## Resumen

Qwen3.8-27B-Uncensored-Cyber es un modelo multimodal de la familia Qwen3 (etiqueta interna `qwen3_5`), publicado por el usuario philbert440 en HuggingFace, que parte de un fine-tune previo denominado Qwen3.8-27B-Uncensored-Aggressive. Se trata de una variante "abliterated" o de-refused: se ha eliminado por proyección la dirección de rechazo del modelo base con el objetivo declarado de responder sin restricciones en el dominio de ciberseguridad ofensiva, manteniendo —según el autor— razonamiento, precisión factual y coherencia. Cuenta con 27.356.728.560 parámetros (~27,4 mil millones) en safetensors, licencia Apache 2.0 y pipeline `image-text-to-text`, lo que indica que conserva la torre de visión y, por tanto, capacidades multimodales de imagen y texto.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo técnico de una receta de ablación de rechazo en dos etapas: primero un ajuste "Aggressive" con α=1.15 (ablación de rechazo en una sola dirección) y después un "residual-cyber peel" que aplica una proyección que preserva la norma (β=1.0) solo a partir de la capa 4 (`apply_from=4`), conservando las cuatro primeras capas para no degradar la extracción temprana de características. Por otro, es un caso de estudio de los riesgos asociados a modelos sin alineamiento de seguridad en un dominio sensible, distribuido abiertamente bajo una licencia permisiva.

El modelo mantiene además la cabeza de decodificación especulativa MTP (multi-token prediction) del original y se publica con cuantizaciones preparadas (AWQ 4-bit, NVFP4 y GGUF con `mmproj` para visión). No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni el volumen o composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3, etiqueta `qwen3_5`) con torre de visión y cabeza MTP de decodificación especulativa |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (compressed-tensors), NVFP4 (E2M1 4-bit con escalas FP8), GGUF (llama.cpp) con `mmproj` para visión; pesos originales en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); variantes AWQ, NVFP4 y GGUF |
| Tamano del repositorio | 165,0 GB |
| Modelo base | philbert440/Qwen3.8-27B-Uncensored-Aggressive |
| Modalidad de entrada/salida | image-text-to-text (imagen + texto a texto) |
| Descargas / likes | 2.113 descargas / 17 likes |
| Fecha de creacion / actualizacion | 2026-08-15 / 2026-08-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3 con aproximadamente 27,4 mil millones de parámetros, que incorpora dos componentes destacables: una torre de visión que habilita el pipeline `image-text-to-text`, y una cabeza de predicción multi-token (MTP) que actúa como mecanismo de decodificación especulativa para acelerar la generación. No se detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni el tipo de atención empleado, por lo que esos datos quedan como no disponibles.

El entrenamiento no es un entrenamiento desde cero, sino una secuencia de modificaciones sobre pesos existentes. La receta v2 consta de dos fases: (1) una base "Aggressive" construida mediante ablación de rechazo en una única dirección con α=1.15, y (2) un "residual-cyber peel" que calcula una dirección de rechazo orientada al dominio ciberofensivo a partir de un conjunto de entrenamiento ofensivo frente a un conjunto amplio de peticiones inocuas, y la elimina mediante proyección limpia que preserva la norma (β=1.0). Esta segunda proyección se aplica únicamente a las capas profundas, manteniendo intactas las cuatro primeras (`apply_from=4`). El autor justifica esta decisión indicando que preservar las capas tempranas de extracción de características es lo que evita el deterioro de las capacidades generales, y afirma haber alcanzado un 100 % de apertura en el dominio ciber con esa estrategia. No se proporcionan datos sobre volumen de tokens, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con preservación declarada de razonamiento, precisión factual y coherencia tras la ablación.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`), gracias a la torre de visión conservada.
- Respuesta sin rechazos en el dominio de ciberseguridad ofensiva: el autor reporta 100/100 en un conjunto retenido de 100 prompts ciberofensivos evaluados con un arnés de expresiones regulares para detectar rechazos.
- Razonamiento matemático básico: 0,80 en GSM8K según la evaluación del autor.
- Decodificación especulativa vía cabeza MTP, orientada a reducir la latencia de generación.
- Cuantización lista para despliegue en AWQ W4A16, NVFP4 y GGUF (con `mmproj` para la parte de visión).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no se declaran en la model card).
- Modo "thinking" o modo de razonamiento explícito: no disponible; no se menciona en la información proporcionada.

## Casos de uso

- Investigación en seguridad ofensiva y pruebas de penetración autorizadas: el modelo está específicamente ajustado para no rechazar preguntas sobre técnicas ofensivas, lo que lo hace útil en entornos de red team con autorización explícita y fines de auditoría, siempre dentro del marco legal aplicable.
- Formación y concienciación en ciberseguridad: puede emplearse para generar escenarios de ataque, explicaciones de vulnerabilidades y material didáctico para equipos defensivos, aprovechando que responde sin bloqueos en ese dominio.
- Análisis de capturas de pantalla y salidas de herramientas: al conservar la torre de visión, permite interpretar imágenes (paneles, diagramas de red, trazas) junto a instrucciones en texto, por ejemplo para resumir la configuración mostrada en una captura de un servidor.
- Evaluación de mecanismos de seguridad y alineamiento: sirve como referencia de "modelo desalineado" en estudios comparativos sobre eficacia de ablaciones de rechazo, midiendo el impacto en capacidades generales mediante baterías como GSM8K o pruebas factuales.
- Asistente técnico en documentación de seguridad: generación de informes, resúmenes de vulnerabilidades y explicaciones de mitigaciones, con la ventaja de un contexto conversacional y soporte de imágenes para adjuntar evidencias.
- Despliegue local con cuantización GGUF: gracias a la variante GGUF con `mmproj`, puede ejecutarse en estaciones de trabajo sin clúster mediante llama.cpp u Ollama, útil para experimentación offline con datos sensibles que no pueden salir de la organización.
- Investigación sobre decodificación especulativa: la cabeza MTP conservada permite estudiar y medir ganancias de throughput en pipelines de inferencia que implementan verificación especulativa.

No se dispone de información sobre tool calling ni sobre comportamiento en modo agente, por lo que no se recomienda asumir esas capacidades sin verificarlas.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la propia model card: evaluación en bf16 con "muestra amplia" y juicio automático mediante Claude, sobre 100 prompts ciberofensivos retenidos y un arnés de detección de rechazos por expresiones regulares.

| Metrica | Cyber (este modelo, v2) | Build Cyber anterior |
|---|---|---|
| Apertura ciber (cyber-open) ↑ | 100/100 | 93/100 |
| Confabulacion (confab) ↓ | 0,867 | 1,00 |
| Precision factual (factual) ↑ | 1,00 | 0,933 |
| GSM8K ↑ | 0,80 | 0,825 |
| Degeneracion (degen) ↓ | 0,00 | 0,00 |

No hay resultados de MMLU, HumanEval, BBH ni de benchmarks multimodales en la información disponible. Las cifras anteriores no están contrastadas de forma independiente y proceden del propio autor del modelo, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no confirmada por el autor): en bf16, aproximadamente 55 GB solo para pesos, más caché KV; en 8 bits, en torno a 28-30 GB; en 4 bits (AWQ o NVFP4), en torno a 15-17 GB.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB para bf16 con contexto razonable; dos A100 de 40 GB con tensor parallelism para bf16; A100 40 GB o L40S 48 GB para cuantización de 8 bits.
- GPU de consumo: con cuantización de 4 bits (AWQ W4A16 o NVFP4) puede encajar en una RTX 4090 o RTX 5090 de 24 GB, y en una RTX 3090 de 24 GB, aunque con margen escaso para contexto largo y para el procesamiento de imágenes; no es viable en bf16 en GPU de consumo.
- Opciones de despliegue: vLLM o TGI para las variantes AWQ (compressed-tensors) y bf16; TensorRT-LLM para la variante NVFP4; llama.cpp, Ollama o LM Studio para los GGUF, que además incluyen `mmproj` para la torre de visión.
- El repositorio ocupa 165 GB, de modo que conviene descargar únicamente la variante de cuantización necesaria en lugar del repositorio completo.
- Latencia y throughput: no disponible. La cabeza MTP sugiere ganancias por decodificación especulativa, pero no se publican cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Cyber (este) | 27,36 B | no disponible | cyber-open 100/100; factual 1,00; GSM8K 0,80; degen 0,00 | Apache 2.0 | HuggingFace, con AWQ, NVFP4 y GGUF |
| philbert440/Qwen3.8-27B-Uncensored-Aggressive | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base de esta receta) |
| Build Cyber anterior de philbert440 | no disponible | no disponible | cyber-open 93/100; factual 0,933; GSM8K 0,825; degen 0,00 | no disponible | HuggingFace |
| Qwen3.8-27B (modelo original de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se han identificado en la información disponible otros modelos comparables de terceros (por ejemplo, otras variantes abliterated del mismo tamano) con datos verificables, por lo que la comparativa se limita a la propia línea de variantes del autor.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado en materia de seguridad: responde a peticiones de ciberseguridad ofensiva sin filtros. Su uso puede facilitar actividades ilícitas; el propio autor pide uso responsable y cumplimiento de la legislación aplicable.
- Riesgo legal y de cumplimiento: en la Unión Europea, la distribución y el uso pueden quedar afectados por normativa de ciberseguridad y por las obligaciones de la Ley de IA para modelos de propósito general, según el caso de uso.
- Sesgos conocidos: no disponible. El autor no publica análisis de sesgo, y la ablación de rechazo puede alterar el comportamiento del modelo en dominios sensibles más allá del ciberseguridad.
- Alucinación y confabulación: la métrica de confabulación reportada es 0,867 (menor es mejor) en la evaluación del autor, lo que indica que el fenómeno persiste y debe mitigarse con verificación externa.
- Evaluación no independiente: las cifras proceden del autor, con juicio automático de Claude y un conjunto de solo 100 prompts retenidos; el arnés de rechazo se basa en expresiones regulares y puede no capturar rechazos implícitos.
- Degradación de capacidades: el GSM8K baja de 0,825 a 0,80 respecto a la build anterior, lo que sugiere que la ablación no es neutral para el razonamiento matemático, pese a que el autor lo describe como equivalente.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un rendimiento multilingüe ni un uso con ventanas largas en producción.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al ser una licencia permisiva traslada toda la responsabilidad sobre el uso al desplegador. Conviene revisar además las condiciones del modelo original de la familia Qwen3 del que deriva la cadena de fine-tunes.
- Repositorio de 165 GB: requiere planificación de almacenamiento y ancho de banda; descargar el repositorio completo no es necesario ni práctico.
- Trazabilidad limitada: no se documentan dataset de entrenamiento, número de tokens, ni metodología completa de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Modelo base declarado: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive
- Paper, blog o repositorio técnico asociado: no disponible.
- Demo o espacio de inferencia: no disponible.
- Nota sobre la búsqueda web: los resultados recuperados (printextra.pl, printextra.com.pl y su página de Facebook) corresponden a una imprenta polaca y no guardan relación con el modelo, por lo que se descartan como fuentes.
