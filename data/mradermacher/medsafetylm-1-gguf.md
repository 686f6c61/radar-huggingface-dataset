# mradermacher/MedSafetyLM-1-GGUF

## Resumen

MedSafetyLM-1-GGUF es la versión cuantizada en formato GGUF del modelo Larxel/HealthSafetyLM-BR, publicada por mradermacher. Se trata de un modelo de aproximadamente 3.880 millones de parámetros orientado a la seguridad en el ámbito médico y a la moderación de contenido sanitario, según las etiquetas declaradas por el autor (medical, safety, content-moderation). El modelo base fue ajustado mediante QLoRA, lo que indica una adaptación de bajo rango sobre un modelo preexistente en lugar de un entrenamiento desde cero.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo especializado en seguridad sanitaria en entornos con recursos limitados, gracias a la disponibilidad de múltiples cuantizaciones que van desde Q2_K (1,8 GB) hasta f16 (7,9 GB). El repositorio incluye además ficheros mmproj, lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla su funcionamiento.

No obstante, la información publicada es escasa: no se especifican la longitud de contexto, la composición del dataset de entrenamiento, los resultados de benchmarks ni los términos concretos de la licencia (indicada únicamente como "other"). Esta ficha refleja fielmente esa limitación y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ajustado con QLoRA; familia transformer presumible, no confirmada) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; adicionalmente mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos concretos no especificados) |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Larxel/HealthSafetyLM-BR. La model card del repositorio cuantizado unicamente indica que se trata de cuantizaciones estaticas del modelo original y que este fue ajustado mediante QLoRA (quantized low-rank adaptation), una tecnica de ajuste fino eficiente en parametros que congela los pesos del modelo base e introduce adaptadores de bajo rango entrenables. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La presencia de ficheros mmproj (multi-modal projection) en el repositorio sugiere que el modelo base incorpora alguna capacidad multimodal, probablemente vision, aunque la model card no describe su funcionamiento ni el formato de entrada esperado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El proceso de cuantizacion fue realizado por mradermacher con la herramienta estandar de conversion a GGUF (convert_type: hf), y el autor senala que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles orientada a contenido sanitario y de seguridad medica, segun las etiquetas del autor.
- Moderacion de contenido: el modelo esta etiquetado como content-moderation, lo que sugiere su uso para clasificar o filtrar contenido relacionado con salud.
- Capacidad multimodal probable (ficheros mmproj incluidos), aunque no documentada en detalle.
- Conversacional: la etiqueta "conversational" indica soporte para dialogos multi-turno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Moderacion de foros y comunidades sanitarias: el modelo puede clasificar mensajes de usuarios en plataformas de salud para detectar contenido inseguro o consejos medicos de riesgo, aprovechando su ajuste especifico en safety y content-moderation.
- Filtrado de respuestas en asistentes medicos: integrado como capa de seguridad antes de mostrar una respuesta generada por otro modelo, evaluando si el contenido cumple criterios de seguridad sanitaria.
- Triaje de consultas en ingles: clasificacion de consultas de pacientes por nivel de urgencia o riesgo, desplegado en local con cuantizaciones Q4_K_M (2,6 GB) en hardware de gama media.
- Investigacion sobre seguridad en LLM medicos: uso como modelo de referencia para estudiar comportamientos de rechazo, sesgos y alucinaciones en dominios clinicos, gracias a su tamano manejable y su disponibilidad en GGUF.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo con cuantizaciones bajas, permite ejecutar un modelo especializado en seguridad sin depender de infraestructura en la nube, util para clinicas o laboratorios con requisitos de privacidad.
- Prototipado rapido con llama.cpp u Ollama: los ficheros GGUF permiten probar el modelo en portatiles y estaciones de trabajo sin GPU dedicada, facilitando la evaluacion interna antes de invertir en infraestructura.
- Generacion de material educativo sanitario con revision: el modelo puede redactar borradores de contenido divulgativo en ingles que luego un profesional revisa, usando el ajuste de seguridad como primera barrera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~3,9 B parametros):
  - Q2_K: ~2,5 GB de VRAM (1,8 GB de pesos + overhead de contexto).
  - Q4_K_M: ~3,5 GB de VRAM (2,6 GB de pesos + overhead).
  - Q8_0: ~5,5 GB de VRAM (4,2 GB de pesos + overhead).
  - f16: ~9-10 GB de VRAM (7,9 GB de pesos + overhead).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas usando Q4_K_M o inferiores. Las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de ~4 B en una RTX 4090 con Q4_K_M, cabria esperar decenas de tokens por segundo, pero no se ha publicado ninguna medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MedSafetyLM-1-GGUF | 3,88 B | no disponible | Seguridad medica / moderacion | other | GGUF |
| Modelo base Larxel/HealthSafetyLM-BR | 3,88 B | no disponible | Seguridad medica / moderacion | other | safetensors |
| Alternativas de moderacion medica de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables directos en la misma categoria (moderacion de contenido sanitario de ~4 B) dentro de la informacion proporcionada. La comparativa mas directa posible es con el propio modelo base, del que esta version GGUF es una cuantizacion.

## Limitaciones y advertencias

- La licencia figura como "other" sin especificar terminos: es imprescindible contactar con el autor del modelo base antes de cualquier uso comercial.
- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- No se documentan sesgos conocidos, pero un modelo ajustado en dominio medico puede heredar sesgos demograficos y clinicos del dataset de entrenamiento, no publicado.
- Riesgo de alucinacion relevante: en contextos sanitarios, una respuesta incorrecta puede tener consecuencias graves. No debe usarse como sustituto de criterio clinico profesional.
- La ausencia de benchmarks impide verificar su calidad real frente a alternativas; las etiquetas del autor no constituyen evidencia empirica.
- No se especifica la longitud de contexto, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.
- La model card no describe el proceso de cuantizacion en detalle ni advierte de perdidas de calidad especificas por tipo de quant.
- El modelo base no esta documentado en esta ficha; conviene revisar su model card original para conocer limitaciones adicionales.
- No hay garantia de mantenimiento: el repositorio no tiene likes ni un historial de actualizaciones extenso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MedSafetyLM-1-GGUF
- Modelo base: https://huggingface.co/Larxel/HealthSafetyLM-BR
- Pagina de resumen del autor: https://hf.tst.eu/model#MedSafetyLM-1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
