# Gsanjeewa/compliance-policy-assistant-phi3-qlora

## Resumen

`Gsanjeewa/compliance-policy-assistant-phi3-qlora` es un ajuste fino de tipo QLoRA sobre la familia Phi-3 de Microsoft, publicado por el usuario Gsanjeewa en HuggingFace. Por el nombre del repositorio y el tag `phi3`, se trata de un modelo derivado de Phi-3 (previsiblemente Phi-3-mini, 3.821 millones de parametros) especializado en la funcion de asistente de politicas de cumplimiento normativo. El repositorio registra 0 descargas y 0 likes, y su model card es la plantilla autogenerada de HuggingFace sin ninguna seccion completada.

El modelo resuelve, en teoria, la tarea de responder consultas sobre politicas internas y normativa de compliance en formato conversacional, pero no existe documentacion publicada sobre el dataset de ajuste, el procedimiento de entrenamiento ni los hiperparametros empleados. Esto lo convierte en un artefacto de investigacion o experimento personal mas que en un modelo listo para produccion.

Su relevancia actual es limitada pero ilustrativa: muestra el patron habitual de adaptacion de un modelo pequeno (3,8 B) mediante QLoRA de 4 bits para un dominio vertical concreto, algo que cualquier equipo puede reproducir en una unica GPU de consumo. La ausencia de licencia declarada y de evaluacion publicada son los principales obstaculos para su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3, segun el tag `phi3`; no confirmado en la model card) |
| Parametros totales | 3.821.079.552 (3,82 mil millones; dato real medido en los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en 16 bits (7,6 GB de repositorio para 3,82 B de parametros); no se publican versiones GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`); tag `custom_code`, lo que sugiere la presencia de codigo remoto |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Phi-3, con 3,82 mil millones de parametros totales, coherente con Phi-3-mini. La tecnica de adaptacion indicada en el nombre del repositorio es QLoRA: cuantizacion del modelo base a 4 bits (tipicamente NF4) y entrenamiento de adaptadores LoRA de bajo rango sobre esa base congelada. El repositorio contiene unicamente safetensors a 16 bits de 7,6 GB, lo que indica que los adaptadores se han fusionado con los pesos base antes de la publicacion.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, la precision mixta empleada ni los hiperparametros del ajuste. La model card no documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.).

## Capacidades

Nota: no hay evaluacion publicada de este ajuste concreto. Las capacidades siguientes se infieren de la arquitectura base y del proposito declarado en el nombre del repositorio, no de una verificacion empirica.

- Generacion de texto conversacional en formato de instrucciones, orientada a preguntas y respuestas sobre politicas y normativa.
- Redaccion y reformulacion de respuestas en un registro formal, propio del dominio de compliance.
- Razonamiento basico y sintesis de documentos, en la medida en que lo permite un modelo de 3,8 B parametros.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible; el modelo base Phi-3 esta optimizado principalmente para ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles del modelo en funcion de su proposito declarado. Al no existir evaluacion publicada, requeririan una validacion previa en el entorno real de despliegue.

- Asistente interno de consultas sobre politicas corporativas: el modelo se desplegaria como chatbot para empleados que preguntan por procedimientos internos, con recuperacion aumentada (RAG) sobre el repositorio documental de la empresa para anclar las respuestas.
- Triaje de consultas de cumplimiento normativo: clasificacion y primera respuesta a tickets del area legal o de compliance, derivando los casos complejos a un especialista humano.
- Resumen de documentos normativos: condensar politicas extensas, circulares o guias internas en resumenes de una pagina para formacion de empleados.
- Generacion de borradores de comunicaciones de compliance: redactar avisos internos, recordatorios de plazos o guiones de formacion a partir de notas breves del responsable.
- Apoyo a auditorias internas: extraer y reformular los puntos relevantes de un conjunto de documentos de politica para preparar listas de comprobacion previas a una auditoria.
- Formacion y onboarding: generar preguntas de autoevaluacion y respuestas explicadas sobre el codigo de conducta de la organizacion.
- Prototipado rapido de asistentes verticales: servir como base para experimentar con QLoRA en dominios regulados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada y el repositorio no presenta tablas comparativas con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada en 16 bits (formato publicado): aproximadamente 7,7 GB solo para los pesos; con cache KV y activaciones conviene reservar entre 10 y 12 GB.
- VRAM estimada en 8 bits: en torno a 4,5 GB, mas overhead de inferencia.
- VRAM estimada en 4 bits: en torno a 2,5-3 GB, aunque no se publican pesos cuantizados y habria que generarlos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090, RTX 4080, RTX 4070 Ti y RTX 3090 para desarrollo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 pueden ejecutarlo en 16 bits; con cuantizacion a 8 o 4 bits cabe en tarjetas de 6-8 GB.
- Opciones de despliegue: `transformers` (formato nativo), vLLM y TGI para servicio de alto rendimiento, llama.cpp u Ollama previa conversion a GGUF. El tag `custom_code` puede obligar a usar `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existen datos de rendimiento del ajuste, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos de referencia proceden del conocimiento publico de esas familias y no de la informacion proporcionada; conviene verificarlas en sus model cards originales.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| compliance-policy-assistant-phi3-qlora | 3,82 B | no disponible | no disponible | No | Repositorio publico, 0 descargas |
| Phi-3-mini-4k-instruct | 3,8 B | 4.096 tokens | MIT (modelo base) | Si, en su model card | Amplia |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Si, en su model card | Amplia |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Qwen Research License | Si, en su model card | Amplia |

La diferencia practica principal no es de tamano, sino de documentacion y licencia: frente a las alternativas, este ajuste carece de evaluacion, de licencia declarada y de soporte de la comunidad, lo que dificulta justificar su uso en un entorno productivo.

## Limitaciones y advertencias

- Model card vacia: todas las secciones relevantes (datos de entrenamiento, evaluacion, uso previsto, limitaciones) estan sin completar, por lo que no se puede auditar el ajuste.
- Riesgo elevado de alucinacion en un dominio sensible: un asistente de compliance que invente articulos, plazos o referencias normativas puede generar un perjuicio legal o economico.
- Sin licencia declarada: no esta claro si se permite el uso comercial ni bajo que condiciones. El modelo base Phi-3-mini se distribuye bajo licencia MIT segun su model card original, pero este derivado no hereda necesariamente esa declaracion de forma explicita en el repositorio.
- Tag `custom_code`: el repositorio incluye codigo personalizado, lo que puede requerir `trust_remote_code=True` y supone un riesgo de seguridad en entornos corporativos.
- Idiomas no declarados: el modelo base esta optimizado para ingles y su rendimiento en castellano probablemente sea inferior; no hay evidencia de calidad en espanol.
- Contexto no declarado: si el modelo base es la variante de 4.096 tokens, la ventana es insuficiente para procesar manuales normativos completos sin tecnicas de recuperacion.
- Sesgos: se desconocen la composicion y el filtrado del dataset de ajuste, por lo que no se pueden caracterizar los sesgos resultantes.
- Validacion inexistente: 0 descargas y 0 likes indican que el modelo no ha sido probado ni contrastado por terceros.
- No apto como asesoramiento legal: cualquier salida debe ser revisada por un profesional cualificado antes de tomar decisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gsanjeewa/compliance-policy-assistant-phi3-qlora
- arXiv:1910.09700 (Lacoste et al., 2019), citado en los tags del repositorio: https://arxiv.org/abs/1910.09700. Corresponde a la calculadora de impacto ambiental de la plantilla de HuggingFace, no a un articulo sobre este modelo.
- Informe tecnico de la familia Phi-3 (referencia externa, no citada en la model card ni en los tags): https://arxiv.org/abs/2404.14219
- Pagina del modelo base Phi-3-mini en HuggingFace (referencia externa, no confirmada como base exacta): https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a documentacion de Google Docs y a otros temas sin relacion. No se han encontrado papers, blogs, repositorios ni demos asociados a este ajuste.
