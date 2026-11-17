# LlamaPal/LFM2.5-2.6B-Freestyle-Q4_K_M-GGUF

## Resumen

LFM2.5 2.6B Freestyle (Q4_K_M, GGUF) es una cuantizacion en formato GGUF de la familia LFM2.5 de Liquid AI, en su variante de 2.600 millones de parametros. El repositorio concreto que nos ocupa, alojado por el usuario LlamaPal, es un espejo sin modificaciones del fichero `LFM2.5-2.6B-heretic-Q4_K_M.gguf` publicado por Abiray bajo el nombre de LFM2.5-2.6B-Heretic-Abliterated. Es, por tanto, un modelo comunitario derivado: no lo ha entrenado LlamaPal ni se trata de una publicacion oficial de Liquid AI, sino de una copia byte a byte de una ablacion no oficial del modelo base.

El modelo base, LFM2.5 2.6B, pertenece a la segunda generacion de los modelos de lenguaje de Liquid AI (LFM), disenados para despliegue eficiente en dispositivos y entornos con recursos limitados. La variante "Heretic-Abliterated" es una modificacion comunitaria que aplica tecnicas de ablacion de direcciones de rechazo para reducir el comportamiento de negativa del modelo, un procedimiento habitual en la escena de modelos "uncensored".

Su relevancia practica es acotada pero clara: ofrece un fichero GGUF de 1,7 GB con 2.697.198.592 parametros que puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPU dedicada de gama alta. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no incluye model card propia mas alla de la informacion de trazabilidad, licencia y hash del fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5 de Liquid AI; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | 2.697.198.592 (2,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (el repositorio original la declara como apache-2.0; existe discrepancia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los datos proporcionados. La familia LFM2.5 de Liquid AI se asocia publicamente a disenos orientados a eficiencia en inferencia, pero la model card de este repositorio no detalla si se trata de un transformer convencional, un modelo hibrido con capas de estado recurrente o una arquitectura con atencion lineal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que si es verificable es el proceso de derivacion del fichero: se trata de una cuantizacion Q4_K_M del checkpoint LFM2.5-2.6B-Heretic-Abliterated de Abiray, que a su vez es una modificacion del LFM2.5 2.6B original. La tecnica "abliterated" consiste en identificar y restar direcciones en el espacio de activaciones asociadas a respuestas de rechazo, de modo que el modelo deja de negarse a responder ante ciertas categorias de peticiones. Este proceso no anade conocimiento nuevo ni mejora el razonamiento: solo altera la distribucion de respuestas ante contenidos sensibles, con el coste habitual de degradar la coherencia y la seguridad del modelo.

El fichero GGUF tiene 1,7 GB y un SHA-256 documentado (`476790c4a1ffd25458750833fb5c3a972dd36a09aadc26af72ecbb4e8c625ce6`), lo que permite verificar la integridad de la descarga. La cuantizacion Q4_K_M es un esquema de 4 bits con escalas por bloque, orientado a mantener calidad aceptable con una huella de memoria reducida.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica uso previsto para dialogo multi-turno.
- Generacion de texto general: pipeline declarado `text-generation`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el fichero puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Ejecucion local en CPU y GPU de gama baja gracias al formato GGUF y la cuantizacion Q4_K_M.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling o modo thinking: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible; no se declaran idiomas.

## Casos de uso

- Prototipado local de asistentes conversacionales: el fichero GGUF de 1,7 GB se carga en llama.cpp u Ollama en un portatil convencional, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API ni dependencia de la nube.
- Pruebas de inferencia en entornos sin GPU: con cuantizacion Q4_K_M y 2,6 B de parametros, el modelo puede ejecutarse en CPU con memoria RAM moderada, util para validar pipelines antes de escalar a modelos mayores.
- Evaluacion de modelos ablacionados: investigadores interesados en medir el efecto de la ablacion de direcciones de rechazo sobre la calidad, la coherencia y la tasa de negativas pueden usar este checkpoint como referencia frente al LFM2.5 2.6B original.
- Generacion de texto offline en aplicaciones de escritorio: integrable en herramientas que requieran un modelo embebido sin conexion, como editores de texto o asistentes de documentacion local.
- Experimentacion con cuantizaciones: sirve como caso de estudio de como Q4_K_M afecta a un modelo de 2,6 B en tareas de generacion libre, comparando con otras cuantizaciones del mismo checkpoint si se publican.
- Base para fine-tuning ligero o adaptadores: al ser un modelo pequeno y con pesos abiertos en GGUF, puede servir de punto de partida para experimentos de ajuste con LoRA en hardware de consumo, aunque la conversion desde GGUF a otros formatos anade friccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2 a 2,5 GB para el fichero Q4_K_M de 1,7 GB mas el contexto y el overhead del runtime; con contexto largo la huella crece de forma proporcional al tamano de la cache KV.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) deberia poder cargarlo con comodidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, y tambien en CPU con 4-8 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui con backend llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en configuraciones estandar.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend, y no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5 2.6B Freestyle Q4_K_M (este) | 2,6 B | no disponible | GGUF | LFM Open License v1.0 (declarada apache-2.0 en origen) | Ablacion no oficial, espejo comunitario |
| LFM2.5 2.6B (original, Liquid AI) | 2,6 B | no disponible | safetensors / GGUF | LFM Open License v1.0 | Modelo base oficial, con model card completa |
| LFM2.5-2.6B-Heretic-Abliterated (Abiray) | 2,6 B | no disponible | GGUF | apache-2.0 segun el autor | Origen directo de este fichero |
| Alternativas de tamano similar (p. ej. Qwen2.5-3B, Llama 3.2 3B) | ~3 B | 32k-128k segun modelo | safetensors / GGUF | Apache 2.0 / Llama license | No comparadas en benchmarks por falta de datos |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo ablacionado: la variante "Heretic-Abliterated" elimina deliberadamente las direcciones de rechazo, lo que reduce las salvaguardas del modelo original y puede producir respuestas ante peticiones que el modelo base rechazaria. No es apto para despliegues orientados al publico sin filtros adicionales.
- Degradacion de calidad esperable: la ablacion de direcciones suele afectar a la coherencia, la factualidad y la utilidad general del modelo; no hay evaluaciones publicadas que cuantifiquen este efecto en este checkpoint.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y potencialmente agravado por la cuantizacion Q4_K_M y por la ablacion.
- Ambiguedad de licencia: el repositorio declara LFM Open License v1.0, mientras que el repositorio original de Abiray figura como apache-2.0. Esta discrepancia debe resolverse antes de cualquier uso comercial; conviene consultar el texto de la licencia en el fichero LICENSE y, en caso de duda, contactar con los autores originales.
- Trazabilidad limitada: LlamaPal solo espeja el fichero; no hay model card propia, ni idiomas declarados, ni contexto documentado, ni benchmarks.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas: no se declaran; el comportamiento multilingue es desconocido y podria ser deficiente fuera del ingles.
- Contexto: no documentado; asumir ventanas cortas o medias y validar empiricamente antes de usarlo en tareas que requieran contexto largo.
- Uso en produccion: no recomendado sin una evaluacion previa de calidad, seguridad y cumplimiento de licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/LFM2.5-2.6B-Freestyle-Q4_K_M-GGUF
- Repositorio original del checkpoint ablacionado: https://huggingface.co/Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF
- Commit de origen del fichero: https://huggingface.co/Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF/tree/1eaf992a33529fc839cbeca32109a9c4c43b57c4
- Modelo base oficial (GGUF): https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Texto de la licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
