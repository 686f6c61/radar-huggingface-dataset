# Docglasses-AI/spark-x2.6-1.7b-clinical-r3-gguf

## Resumen

spark-x2.6-1.7b-clinical-r3-gguf es una cuantizacion en formato GGUF del checkpoint Round-3 (paso 2800) del modelo Spark-X2.6 1.7B, afinado para tareas clinicas por Docglasses-AI. El modelo esta pensado como asistente de triaje clinico en dispositivo ("on-device") dentro de la aplicacion SarvaDoc Pro, concretamente en el modulo Derma Triage, y se distribuye listo para ejecutarse con llama.cpp o con el motor GenieX. Con 1.707.657.216 parametros totales y un unico fichero de pesos de aproximadamente 1 GB, el modelo esta disenado para inferencia local en hardware modesto.

La relevancia de esta publicacion es doble. Por un lado, ejemplifica el patron de despliegue de modelos pequenos especializados en dominios regulados (salud) mediante cuantizacion IQ4_NL y el formato GGUF, lo que permite ejecutar el modelo en CPU o GPU de gama baja sin depender de la nube. Por otro, el autor declara explicitamente que no es un dispositivo medico diagnostico, lo que delimita su uso a asistencia y triaje, no a diagnostico clinico.

La informacion publicada es muy escasa: la model card se limita a describir el fichero, el caso de uso previsto y el aviso legal. No hay datos sobre arquitectura interna, composicion del dataset de entrenamiento, proceso de alineamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones tecnicas de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje tipo transformer; familia Spark-X2.6, sin detalle publicado) |
| Parametros totales | 1.707.657.216 (1,7 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (unica publicada en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | other (licencia no estandar; condiciones no detalladas en la model card) |
| Formato de pesos | GGUF (fichero spark-x2.6-1.7b-clinical-r3-2800-iq4_nl.gguf, 1.057.570.176 bytes) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los metadatos indican que pertenece a la familia Spark-X2.6 y que el checkpoint publicado corresponde al paso 2800 de la ronda 3 de un proceso de afinamiento clinico, pero la model card no detalla si se trata de un transformer denso convencional, que tipo de atencion emplea, ni cual es la longitud de contexto nativa. Tampoco se especifica el modelo base sobre el que se construyo ni el numero de tokens de entrenamiento.

Respecto al entrenamiento, solo consta que existe un afinamiento por rondas (la publicacion corresponde a la ronda 3) orientado a triaje dermatologico y clinico, y que el resultado se ha cuantizado a IQ4_NL con el soporte de llama.cpp. No hay informacion sobre la composicion del dataset clinico, si se empleo RLHF, DPO u otra tecnica de alineamiento, ni sobre posibles innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). El tag `imatrix` sugiere que la cuantizacion se calibro con una matriz de importancia, practica habitual en llama.cpp para preservar calidad en cuantizaciones de 4 bits.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interacciones de triaje clinico.
- Asistencia en triaje dermatologico dentro de la aplicacion SarvaDoc Pro (modulo Derma Triage).
- Ejecucion en dispositivo ("on-device") mediante llama.cpp o el motor GenieX, sin necesidad de conexion a servicios externos.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo detras de una API compatible con el ecosistema de Hugging Face.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Triaje dermatologico en dispositivo: el modelo puede integrarse en SarvaDoc Pro para clasificar y priorizar consultas dermatologicas en el propio telefono o equipo del profesional, sin enviar imagenes ni texto a la nube, lo que reduce riesgos de privacidad.
- Asistente de primera linea en entornos con conectividad limitada: al ocupar aproximadamente 1 GB en formato GGUF, puede desplegarse en clinicas rurales o dispositivos sin acceso estable a internet y ofrecer orientacion inicial al paciente.
- Preclasificacion de sintomas antes de la consulta: el modelo puede generar preguntas de seguimiento y resumir la informacion aportada por el paciente para que el clinico llegue a la consulta con contexto estructurado.
- Prototipado rapido de aplicaciones clinicas: su tamano reducido y su formato GGUF permiten a desarrolladores probar flujos de triaje en local con llama.cpp antes de invertir en modelos mayores.
- Educacion y simulacion clinica: puede emplearse en entornos docentes para generar escenarios de triaje y respuestas de referencia, siempre con supervision de un profesional.
- Integracion en pipelines de investigacion sobre NLP clinico: sirve como linea base ligera para experimentos de clasificacion y generacion de texto medico en ingles, comparando su comportamiento con modelos mayores.
- Despliegue en entornos con requisitos de residencia de datos: al ejecutarse localmente, facilita el cumplimiento de politicas que prohiben el envio de datos de salud a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB con la cuantizacion IQ4_NL publicada, incluyendo overhead de contexto y cache KV; el valor exacto depende de la longitud de contexto configurada, que no se ha publicado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de escritorio o portatil con al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), el motor GenieX citado por el autor, y servidores compatibles con GGUF como Ollama o llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa para este tipo de fichero.
- Latencia y throughput estimados: no disponibles. En CPU moderna se espera una generacion de decenas de tokens por segundo para un modelo de 1,7 B en 4 bits, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| spark-x2.6-1.7b-clinical-r3-gguf | 1,7 B | no disponible | other | GGUF (IQ4_NL) | Especializado en triaje dermatologico; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingue con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista con contexto largo y buen soporte de tool calling |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista ligero con benchmarks publicados |

La comparativa es orientativa: los tres modelos alternativos son generalistas y cuentan con documentacion tecnica y evaluaciones publicas, mientras que spark-x2.6 carece de ambas. La ventaja del modelo de Docglasses-AI es su especializacion declarada en triaje dermatologico; su desventaja es la ausencia de transparencia sobre arquitectura, datos y rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es un dispositivo medico diagnostico; su uso debe limitarse a asistencia y triaje, nunca a diagnostico clinico autonomo.
- No se han publicado benchmarks, por lo que no es posible verificar su calidad frente a alternativas generalistas.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos, especialmente en dominios de alta responsabilidad como la salud; requiere supervision profesional en cualquier uso real.
- Idiomas soportados limitados al ingles segun los metadatos; no hay evidencia de buen rendimiento en castellano.
- La licencia es "other" y las condiciones no estan detalladas en la model card; es imprescindible contactar con el autor antes de cualquier uso comercial.
- La longitud de contexto no esta publicada, lo que dificulta planificar conversaciones multi-turno o documentos largos.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no existe validacion por parte de la comunidad.
- La cuantizacion IQ4_NL introduce perdida de precision respecto al modelo original; no se ha publicado el checkpoint sin cuantizar para comparar.
- No hay informacion sobre sesgos demograficos o clinicos del dataset de entrenamiento, un aspecto critico en aplicaciones medicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Docglasses-AI/spark-x2.6-1.7b-clinical-r3-gguf
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales del autor.
