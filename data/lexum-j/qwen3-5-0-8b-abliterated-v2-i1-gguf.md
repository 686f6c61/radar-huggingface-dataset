# Lexum-J/Qwen3.5-0.8B-Abliterated-V2-i1-GGUF

## Resumen

Lexum-J/Qwen3.5-0.8B-Abliterated-V2-i1-GGUF es una cuantizacion en formato GGUF del modelo anlord/Qwen3.5-0.8B-Abliterated-V2, un modelo de ~752 millones de parametros (752.393.024 segun los pesos en safetensors) perteneciente a la familia Qwen3.5 y sometido a un proceso de "abliteration", es decir, la modificacion de los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento y reducir asi las negativas del modelo a ciertos tipos de peticiones. El autor de esta publicacion es el usuario Lexum-J, que no ha publicado documentacion tecnica adicional en la informacion disponible.

La relevancia de esta ficha es doble. Por un lado, se trata de un modelo de menos de mil millones de parametros, un rango que permite ejecucion en CPU y en GPUs de gama de entrada o integradas, lo que lo hace util para prototipado rapido, experimentacion con decodificacion local y tareas de generacion de texto ligero. Por otro lado, la nomenclatura "i1" indica que las cuantizaciones se han generado con una matriz de importancia (imatrix), una tecnica que estima la relevancia de cada peso a partir de datos de calibracion para minimizar la perdida de calidad en cuantizaciones agresivas.

El repositorio ocupa 11,0 GB, un tamano desproporcionado para un modelo de 0,75B parametros, lo que sugiere que incluye un numero elevado de variantes de cuantizacion (posiblemente desde Q2 hasta F32) en un unico repositorio. El acceso al modelo esta restringido en HuggingFace (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargarlo. La licencia declarada es Apache-2.0 y el unico idioma declarado en las etiquetas es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5; presumiblemente transformer decoder-only, sin confirmacion documental) |
| Parametros totales | 752.393.024 (~0,75B) segun pesos safetensors del modelo base |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (etiqueta i1); variantes concretas no listadas en la informacion disponible |
| Idiomas soportados | en (ingles, segun etiqueta del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base usa safetensors |
| Libreria declarada | transformers |
| Tamano del repositorio | 11,0 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o similares. El repositorio no incluye model card con detalles tecnicos y los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo. El nombre "Qwen3.5" sugiere pertenencia a la familia Qwen de Alibaba, y el sufijo del modelo base ("Abliterated-V2") indica que ha sido sometido a abliteration, una tecnica que calcula la direccion de activacion asociada a los rechazos en un conjunto de prompts daninos y posteriormente ortogonaliza o proyecta los pesos de las capas de atencion y MLP contra esa direccion, reduciendo la tendencia del modelo a negarse a responder. No hay confirmacion documental de que se haya aplicado exactamente este procedimiento, ni de la metodologia concreta, ni de su intensidad.

En cuanto al proceso de cuantizacion de esta publicacion, la etiqueta "imatrix" indica que se ha empleado una matriz de importancia para ponderar el error durante la cuantizacion, lo que habitualmente mejora la fidelidad respecto a una cuantizacion uniforme, especialmente en niveles bajos de bits. El identificador "i1" es la convencion usada por llama.cpp para designar conjuntos de cuantizaciones generadas con imatrix. No se especifica el dataset de calibracion utilizado ni el nivel de bits de cada fichero publicado.

## Capacidades

- Generacion de texto conversacional: el modelo incluye la etiqueta "conversational", lo que indica que esta preparado para mantener dialogos multi-turno.
- Respuestas con menor tasa de rechazo: el proceso de abliteration busca reducir las negativas del modelo ante peticiones que el modelo original rechazaria, si bien no se documenta el grado de exito ni los efectos colaterales.
- Ejecucion local en hardware limitado: al tratarse de un modelo de ~0,75B parametros en formato GGUF, puede ejecutarse en CPU y en GPUs de gama baja.
- Idiomas: unicamente ingles declarado en las etiquetas del repositorio. No hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible. No se documenta soporte de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta ninguna capacidad agentica.
- Capacidades especiales (vision, audio, modo thinking): no disponible. No se declara ninguna.
- Razonamiento, matematicas y generacion de codigo: no disponible. No hay documentacion ni benchmarks que lo confirmen.

## Casos de uso

- Prototipado de aplicaciones conversacionales en local: dado su tamano de ~0,75B parametros y su formato GGUF, permite levantar un chatbot de prueba en un portatil sin GPU dedicada, usando llama.cpp u Ollama, para validar flujos de producto antes de escalar a un modelo mayor.
- Experimentacion academica sobre alineamiento y seguridad: el caracter "abliterated" y "uncensored" lo convierte en un objeto de estudio util para comparar la tasa de rechazo y las derivas de comportamiento frente al modelo base sin abliterar, en entornos controlados y con las salvaguardas eticas correspondientes.
- Generacion de texto de bajo coste en lotes: para tareas de clasificacion simple, etiquetado, resumen de frases cortas o generacion de descripciones, un modelo de este tamano ofrece un coste por token muy inferior al de modelos de decenas de miles de millones de parametros.
- Educacion y divulgacion sobre cuantizacion: el repositorio, con 11,0 GB de cuantizaciones, sirve como material practico para estudiar el efecto de distintas configuraciones GGUF e imatrix sobre la calidad de salida de un mismo modelo.
- Entornos con restricciones de red o privacidad: al poder ejecutarse completamente en local, es adecuado para escenarios donde los datos no pueden salir de la maquina del usuario, como procesamiento de borradores internos o notas personales.
- Base para ajuste fino posterior: con 752 millones de parametros, un fine-tuning completo o con LoRA es viable en una unica GPU de 24 GB, lo que permite adaptarlo a dominios concretos en ingles con presupuestos reducidos.
- Evaluacion comparativa de tecnicas de destilacion y cuantizacion: util como punto de referencia de baja escala para medir perdida de perplejidad entre niveles de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas, no se declara pipeline de evaluacion y los resultados de busqueda web obtenidos no guardan relacion con el modelo. No se deben extrapolar cifras del modelo base ni de otros miembros de la familia Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 ocupa aproximadamente 1,5 GB. En cuantizacion Q8_0 rondaria los 0,8 GB; en Q4_K_M, en torno a 0,5 GB; y en Q2_K, alrededor de 0,3 GB. Estas cifras son estimaciones calculadas a partir del numero de parametros y no proceden de documentacion del repositorio.
- Memoria adicional: hay que sumar el KV cache, cuyo tamano depende de la longitud de contexto efectiva, que no esta documentada. A contextos cortos (2.048-4.096 tokens) el impacto es de decenas o pocos cientos de megabytes.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, T4). No requiere A100, H100 ni GPUs de centro de datos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, e incluso en iGPUs con memoria compartida para cuantizaciones bajas.
- Ejecucion en CPU: viable con llama.cpp u Ollama, con velocidades de decodificacion que dependen del numero de nucleos disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI para GGUF. La etiqueta "endpoints_compatible" del repositorio sugiere compatibilidad con endpoints de inferencia. Los formatos safetensors del modelo base serian desplegables con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Lexum-J/Qwen3.5-0.8B-Abliterated-V2-i1-GGUF | 752.393.024 | no disponible | en | apache-2.0 | Cuantizacion GGUF con imatrix, contenido abliterated, acceso restringido |
| Qwen3-0.6B | ~0,6B | 32.768 nativos, ampliable | multilingue | apache-2.0 | Alternativa de la misma familia y rango, con documentacion publica; el contexto indicado corresponde a la familia Qwen3 y no debe asumirse para el modelo de esta ficha |
| Llama 3.2 1B Instruct | ~1,23B | 128.000 | multilingue | Llama 3.2 Community License | Rango similar, con soporte multilingue declarado y benchmarks publicados |
| Gemma 3 1B IT | ~1B | 32.000 | multilingue | Gemma Terms of Use | Alternativa de Google en el mismo segmento de tamano |

Los datos de rendimiento comparado no estan disponibles para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el modelo base procede de un entrenamiento sobre corpus web que habitualmente arrastra sesgos de genero, raza, religion y nacionalidad. La abliteration puede agravar la reproduccion de contenido sesgado o danino al eliminar las barreras de rechazo.
- Riesgo de alucinacion: elevado en terminos relativos. Un modelo de 0,75B parametros tiene una capacidad limitada de retencion de conocimiento factual y tiende a generar afirmaciones plausibles pero incorrectas, especialmente en tareas de conocimiento enciclopedico, matematicas y codigo.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en conversaciones largas o tareas de recuperacion sobre documentos extensos.
- Limitaciones de idioma: solo se declara ingles. El rendimiento en castellano no esta verificado y previsiblemente sera bajo, con errores gramaticales y mezcla de idiomas.
- Alineamiento y seguridad: al tratarse de una version abliterated, el modelo puede producir contenido que los modelos alineados rechazarian. No es adecuado para despliegues de cara al publico sin filtros externos de moderacion.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor de esta cuantizacion no aporta garantias. Conviene verificar que la licencia del modelo base sea compatible y que la abliteration no infrinja los terminos de uso del modelo original de Qwen.
- Acceso restringido: el repositorio es gated, por lo que la reproducibilidad y la integracion automatizada en pipelines requieren gestion previa de credenciales en HuggingFace.
- Ausencia de soporte: 0 descargas y 0 likes en la fecha de publicacion, sin model card detallada ni mantenimiento conocido. Es un artefacto sin validacion por parte de la comunidad.
- Inexistencia de benchmarks: no hay ninguna metrica publicada que permita anticipar su calidad real frente a alternativas del mismo rango.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lexum-J/Qwen3.5-0.8B-Abliterated-V2-i1-GGUF
- Modelo base: https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-V2

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con su familia. Los enlaces obtenidos correspondian a contenidos sin relacion tecnica con la ficha y se han descartado por no ser relevantes. No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en la informacion disponible.
