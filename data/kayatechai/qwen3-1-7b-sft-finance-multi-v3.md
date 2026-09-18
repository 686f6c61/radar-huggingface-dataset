# KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v3

## Resumen

KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v3 es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B, publicado por el usuario KayaTechAI en HuggingFace. El modelo parte concretamente del checkpoint cuantizado a 4 bits `unsloth/qwen3-1.7b-unsloth-bnb-4bit` y fue entrenado con la libreria Unsloth, segun indica la propia model card. La nomenclatura del repositorio sugiere una especializacion en el dominio financiero ("Finance") y una tercera iteracion del ajuste ("v3"), pero el autor no documenta ni el dataset ni el procedimiento de entrenamiento.

Se trata de un modelo denso de aproximadamente 1,7 mil millones de parametros, pensado para generacion de texto en ingles y con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su interes practico reside en que un modelo de este tamano puede desplegarse en hardware de consumo (GPU con 4-8 GB de VRAM en cuantizacion de 4 bits), lo que lo hace candidato para prototipos de asistentes financieros, extraccion de datos de documentos y clasificacion de texto en entornos con recursos limitados.

Ahora bien, la informacion publicada es minima: no hay resultados de benchmarks, no se detalla la composicion del dataset, no se especifica la longitud de contexto soportada y el repositorio no registra descargas ni valoraciones. Cualquier evaluacion en produccion debe partir de una validacion propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (no confirmado explicitamente por el autor) |
| Parametros totales | 1,7 mil millones (segun nombre del modelo y modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en safetensors y el modelo base de partida es una cuantizacion de 4 bits (bnb-4bit) |
| Idiomas soportados | en (ingles, unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen3-1.7b-unsloth-bnb-4bit |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-1.7B, un transformer decoder-only denso, sin mezcla de expertos. El ajuste se realizo mediante SFT (supervised fine-tuning) con TRL y Unsloth, partiendo de un checkpoint base ya cuantizado a 4 bits en formato bitsandbytes, lo que implica una estrategia de tipo QLoRA: adaptadores de bajo rango sobre pesos congelados en 4 bits. La model card unicamente afirma que el entrenamiento fue "2x mas rapido con Unsloth"; no se indica el numero de tokens, la composicion del dataset, la duracion del entrenamiento, la tasa de aprendizaje ni la existencia de fases posteriores de RLHF o DPO.

No se documenta ninguna innovacion tecnica propia del autor. Las capacidades de razonamiento, generacion de codigo o uso de herramientas que pudiera heredar del modelo base no estan verificadas tras el ajuste, y tampoco se ha publicado ninguna evaluacion que confirme que el ajuste no ha degradado el rendimiento general del checkpoint original. El sufijo "Multi" del nombre no se corresponde con la lista de idiomas declarada, que incluye unicamente el ingles.

## Capacidades

- Generacion de texto en ingles, con especializacion declarada (aunque no documentada) en contenido financiero.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-1.7B; el grado de preservacion tras el SFT no esta verificado.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible del ajuste.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo "thinking" o razonamiento extendido: no confirmado.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Vision y audio: no disponibles.
- Capacidades especificas del ajuste financiero (analisis de estados financieros, extraccion de metricas, resumen de informes): inferidas del nombre del repositorio, sin documentacion que las respalde.

## Casos de uso

- Extraccion de entidades y metricas financieras: el modelo puede procesar fragmentos de informes anuales o comunicados de resultados y devolver campos estructurados (ingresos, margen, variacion interanual). Al ser un modelo de 1,7 B, resulta viable ejecutarlo en local con coste por token nulo y sin enviar datos financieros a terceros.
- Resumen de documentos financieros largos: util para condensar notas de prensa de resultados o informes trimestrales en resumenes de pocas lineas. Requiere trocear el documento, ya que no se especifica la ventana de contexto.
- Clasificacion y enrutado de consultas financieras: etiquetado de tickets o correos de clientes en categorias (productos, reclamaciones, cumplimiento) antes de derivarlos a un sistema mayor o a un humano.
- Prototipado rapido y pruebas de concepto: por su tamano y licencia Apache 2.0, sirve para validar una idea de producto financiero en una GPU de consumo antes de invertir en un modelo mayor.
- Generacion asistida de borradores de respuestas en atencion al cliente bancaria: el modelo puede redactar respuestas base sobre productos y condiciones, siempre con revision humana y con la advertencia de que no debe ofrecer asesoramiento financiero regulado.
- Analisis de sentimiento en noticias y comunicados: clasificacion de tono (positivo, negativo, neutro) sobre textos de mercados, integrable en un pipeline de monitorizacion.
- Anonimizacion y preprocesado de texto financiero: reescritura o normalizacion de campos antes de pasarlos a un modelo mayor en una arquitectura en cascada.
- Generacion de preguntas y respuestas sinteticas para evaluacion interna: uso como generador de datos de prueba en el desarrollo de sistemas financieros, dado su bajo coste de inferencia.

En todos los casos, el ajuste no cuenta con evaluacion publicada, por lo que estas aplicaciones deben tratarse como hipotesis a validar con un conjunto de prueba propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica (MMLU, HumanEval, GSM8K, evaluaciones financieras tipo FinQA o FiQA) ni comparacion con el modelo base o con alternativas. El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (1,7 B) y no proceden de mediciones publicadas por el autor:

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16; en torno a 2 GB en cuantizacion de 8 bits; alrededor de 1,2-1,5 GB en cuantizacion de 4 bits (Q4_K_M o equivalente). Hay que anadir el overhead del runtime y de la cache KV, que depende de la longitud de contexto.
- GPU recomendadas: cabe con holgura en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090 o Apple Silicon con memoria unificada de 8 GB o mas. Para despliegue en servidor, cualquier GPU con 8 GB o mas (L4, T4, A10, A100, H100) es suficiente; las GPU de gama alta quedan sobredimensionadas para un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM si se cuantiza a 4 bits, y en GPUs de 8-12 GB sin cuantizar.
- Opciones de despliegue: los pesos se publican en safetensors, por lo que son compatibles con transformers, Text Generation Inference (TGI), vLLM y SGLang. Para ejecucion en CPU o en equipos modestos seria necesario convertir los pesos a GGUF para llama.cpp u Ollama, conversion que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas.

Advertencia relevante: el repositorio ocupa 0,2 GB, un tamano inferior al esperado para un checkpoint completo de 1,7 B parametros en precision de 16 bits (que rondaria los 3,4 GB). Esto sugiere que la subida puede contener unicamente los adaptadores, una version cuantizada o un repositorio incompleto. Conviene verificar la lista de archivos antes de planificar el despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v3 | 1,7 B | no disponible | Apache 2.0 | HuggingFace, safetensors |
| unsloth/qwen3-1.7b-unsloth-bnb-4bit (modelo base) | 1,7 B | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| Otros ajustes financieros de ~1-2 B | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables; los unicos resultados obtenidos fueron enlaces sin relacion con la consulta. Por tanto, no se puede afirmar que este ajuste supere o iguale a otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni validacion publicada por el autor ni por terceros, por lo que se desconoce si el ajuste mejora al modelo base o lo degrada.
- Entrenamiento sobre un base cuantizado a 4 bits: el punto de partida es un checkpoint bnb-4bit, lo que puede introducir perdida de precision respecto a un ajuste sobre pesos completos.
- Riesgo de alucinacion elevado en contexto financiero: los modelos de este tamano tienden a inventar cifras, fechas, normativas y referencias. En un dominio donde un dato erroneo tiene consecuencias economicas o legales, esto es critico.
- Idioma: solo se declara ingles. El sufijo "Multi" del nombre no esta respaldado por la lista de idiomas de la model card. El uso en castellano no esta soportado ni evaluado.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset, por lo que no se puede evaluar el sesgo de dominio, geografico o temporal de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se especifica. Debe comprobarse en la configuracion del modelo antes de disenar aplicaciones con documentos largos.
- Datos sensibles: no existe ninguna garantia de privacidad diferencial ni de filtrado de datos personales en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre citando la licencia y el aviso de copyright. No impone restricciones adicionales, pero tampoco ofrece garantias.
- Uso regulado: este modelo no constituye asesoramiento financiero, legal ni fiscal, y no debe presentarse como tal ante usuarios finales.
- Repositorio poco validado: 0 descargas y 0 valoraciones, publicado el 2026-09-17 con un tamano de 0,2 GB que resulta sospechosamente bajo para un modelo de 1,7 B. Auditoria del contenido del repositorio recomendada antes de cualquier uso.
- Sin informacion sobre tool calling: no se puede asumir que el formato de plantilla de Qwen3 para function calling siga funcionando correctamente tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KayaTechAI/Qwen3-1.7B-SFT-Finance-Multi-v3
- Modelo base: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (unicamente enlaces a Apple TV sin relacion con la consulta), por lo que no hay papers, blogs, demos ni repositorios adicionales que enlazar.
