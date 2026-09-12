# microtensor-io/baseline-front-document-mt4g

## Resumen

`microtensor-io/baseline-front-document-mt4g` es un modelo de pesos cuantizados publicado por el usuario microtensor-io como baseline de referencia ("front baseline") para la pista de documentos de la subnet 92 de Microtensor. No se trata de un modelo entrenado desde cero, sino de una cuantizacion Q4_K_M en formato GGUF de `microsoft/Phi-4-mini-instruct`, el modelo de instrucciones de Microsoft de aproximadamente 3,8 mil millones de parametros. El repositorio ocupa 2,5 GB y declara licencia MIT, la misma que el modelo original.

El interes practico del repositorio es doble. Por un lado, ofrece una version cuantizada a 4 bits de un modelo de ~3,8 B, lo que lo hace desplegable en GPU de consumo e incluso en CPU. Por otro, se publica explicitamente como baseline para comparar resultados en una tarea concreta (documentos) dentro de un entorno de evaluacion tipo subnet, de modo que otros participantes puedan medir mejoras relativas contra una referencia fija.

El historial publico es minimo: cero descargas y cero "likes" en el momento de la consulta, creado y actualizado el 12 de septiembre de 2026, con un unico commit aparente. No hay model card extendida ni datos de entrenamiento o evaluacion propios; toda la informacion tecnica disponible se limita a la cuantizacion, el modelo base y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base microsoft/Phi-4-mini-instruct; no se detalla en la model card |
| Parametros totales | 3.836.021.856 (~3,84 B), segun el conteo de pesos safetensors reportado |
| Parametros activos | no aplica; no hay indicios de arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tamano del repositorio: 2,5 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre el proceso de entrenamiento de este repositorio, porque no es un modelo entrenado sino un artefacto de cuantizacion. La model card indica unicamente que se trata de Phi-4-mini-instruct en Q4_K_M, publicado como baseline frontal para la pista de documentos de la subnet 92 de Microtensor. El modelo base, `microsoft/Phi-4-mini-instruct`, es un transformer decoder-only denso de ~3,84 B de parametros segun el conteo reportado; su arquitectura interna (numero de capas, dimension de atencion, tipo de atencion, uso de GQA, etc.) no se documenta en la informacion proporcionada.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias, ni en este repositorio ni en la informacion disponible del modelo base. La unica innovacion tecnica implicita es la cuantizacion a Q4_K_M con el formato GGUF, que aplica cuantizacion de bloque mixta (los tensores de atencion y alimentacion hacia delante usan distintos tipos de bloque segun su sensibilidad) para reducir el peso a ~2,5 GB manteniendo una degradacion de calidad contenida frente a los pesos en precision completa.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, por lo que el uso previsto es el dialogo multi-turno con formato de chat.
- Seguimiento de instrucciones: capacidades heredadas del ajuste de instrucciones del modelo base, sin verificacion independiente en esta ficha.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto esta pensado para servirse detras de APIs compatibles con el esquema de Hugging Face Inference Endpoints, no solo para inferencia local.
- Inferencia local y offline: al estar en GGUF, puede ejecutarse con runtimes de CPU/GPU sin dependencia de servicios en la nube.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponible.

## Casos de uso

- Baseline de evaluacion en tareas de documentos: el proposito declarado del repositorio es servir como referencia fija para la pista de documentos de la subnet 92, de modo que cualquier sistema candidato se compare contra esta misma cuantizacion y no contra variantes de precision o versiones distintas.
- Despliegue local en equipos de desarrollo: con 2,5 GB de pesos, el modelo se puede cargar en un portatil con GPU de gama media o incluso en CPU, lo que permite probar flujos de resumen y extraccion de informacion de documentos sin coste de API.
- Respuestas sobre documentacion tecnica mediante RAG: encaja como generador final en un pipeline de recuperacion aumentada donde el contexto se inserta en el prompt; su tamano reducido abarata el despliegue en multiples instancias.
- Preprocesado y clasificacion de documentos en lote: generacion de resumenes, extraccion de campos o etiquetado tematico sobre grandes volumenes de texto, donde el coste por token y la latencia importan mas que la precision punta.
- Entornos sin conectividad o con requisitos de privacidad: al ser un artefacto descargable bajo licencia MIT, puede ejecutarse en infraestructura propia o en el borde, sin enviar documentos a terceros.
- Pruebas de regresion de stacks de servicio: util como modelo fijo para validar que un servidor de inferencia (llama.cpp, Ollama, endpoint propio) devuelve resultados estables antes de desplegar modelos mayores.
- Comparacion de tecnicas de cuantizacion: sirve como punto de referencia Q4_K_M frente a otras cuantizaciones del mismo modelo base (Q5, Q8, FP16) para medir la perdida de calidad en la tarea objetivo.
- Prototipado rapido de asistentes conversacionales: con el formato de chat del modelo base, permite validar interfaces de dialogo antes de decidir el modelo definitivo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de la propia pista de documentos de la subnet 92, y tampoco se han encontrado resultados asociados en la busqueda web realizada. Cualquier cifra que se quiera usar para comparar deberia obtenerse ejecutando la evaluacion de la pista sobre esta misma cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB solo para los pesos en Q4_K_M; con cache KV y contexto moderado es razonable reservar 4-6 GB. Son estimaciones derivadas del tamano del repositorio, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM sirve para contextos cortos (RTX 3060, RTX 4060, RTX 2070, GTX 1660 con margen). Con 8-12 GB (RTX 3070, RTX 4070, RTX 3060 12 GB) se pueden manejar contextos mas largos y mayor concurrencia.
- GPU de数据中心 (A100, H100) no son necesarias y resultan desproporcionadas para este tamano; su uso solo tendria sentido para servir muchas peticiones concurrentes.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del artefacto; tambien funciona en CPU con RAM suficiente y en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp (y sus bindings, como llama-cpp-python), Ollama, LM Studio, servidores GGUF genericos. vLLM tiene soporte GGUF experimental y con limitaciones; TGI no esta orientado a GGUF y requeriria los pesos safetensors del modelo base. La etiqueta `endpoints_compatible` sugiere compatibilidad con el esquema de endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baseline-front-document-mt4g (este repositorio) | ~3,84 B | no disponible | GGUF Q4_K_M | MIT | Publico en Hugging Face, 0 descargas |
| microsoft/Phi-4-mini-instruct (modelo base) | ~3,84 B | no disponible en la informacion proporcionada | safetensors (precision completa) | MIT | Publico en Hugging Face, ampliamente utilizado |
| Otras alternativas del segmento ~3 B (por ejemplo, familias Llama 3.2 3B Instruct o Qwen2.5 3B Instruct) | no disponible en la informacion proporcionada | no disponible | GGUF y safetensors | no disponible | no verificadas en esta busqueda |

Frente al modelo base, la diferencia relevante es el tamano en disco y el coste de inferencia (2,5 GB en Q4_K_M frente a los pesos en precision completa), a cambio de una perdida de calidad que no se ha cuantificado en este repositorio. La busqueda web realizada no aporto informacion sobre modelos comparables, por lo que no se incluyen cifras de rendimiento relativo.

## Limitaciones y advertencias

- Perdida por cuantizacion: Q4_K_M introduce degradacion frente a los pesos originales, especialmente en tareas de razonamiento y matematicas; no se ha medido el delta en esta publicacion.
- Sin validacion comunitaria: cero descargas y cero valoraciones implican que no hay evidencia externa de funcionamiento correcto, ni de que el archivo no este corrupto o mal convertido.
- Idiomas no declarados: no se especifican los idiomas soportados, por lo que no se puede asumir un buen rendimiento en castellano sin probarlo.
- Contexto desconocido: la longitud de contexto util no se documenta, asi que el diseno de pipelines RAG debe validarse empiricamente.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; en tareas de documentos conviene anclar las respuestas a las fuentes y validar la salida.
- Sesgos: no hay auditoria de sesgos publicada para esta cuantizacion; los sesgos del modelo base se heredarian sin cambios.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright y la excepcion de responsabilidad. El repositorio se publica "as is" y no ofrece garantias.
- Uso previsto como baseline: esta pensado para comparacion en una evaluacion concreta, no como un modelo de produccion validado; tratarlo como referencia de calidad seria un error.
- Caveat de fecha: el repositorio esta fechado en septiembre de 2026, posterior a la mayoria del material de referencia sobre el modelo base disponible actualmente, lo que dificulta contrastar su contenido con documentacion historica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/microtensor-io/baseline-front-document-mt4g
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Paper, blog o demostracion propia del repositorio: no disponibles en la informacion proporcionada.
- Resultados de la busqueda web: no relevantes; las consultas devolvieron exclusivamente paginas sobre la actriz Elizabeth Olsen, sin relacion con el modelo.
