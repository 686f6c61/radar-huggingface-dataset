# decisionlabs/mobilitydb-sql

## Resumen

mobilitydb-sql es un ajuste fino (LoRA) del modelo Qwen/Qwen3-0.6B orientado a la generacion de sentencias SQL para MobilityDB, la extension espacio-temporal de PostgreSQL para datos de trayectorias. Lo publica el usuario decisionlabs y su model card lo enmarca explicitamente en un taller sobre AIS (sistemas de identificacion automatica de buques), aclarando que no debe confundirse con el geocodificador Gazet. Se trata, por tanto, de un modelo de dominio muy estrecho: text-to-SQL especializado, no un asistente generalista.

El modelo parte de un transformer decoder-only denso de 596.049.920 parametros (~596 M) y se distribuye unicamente como cuantizacion GGUF Q8_0 (mobilitydb-sql-q8_0.gguf, ~610 MB), pensada para ejecutarse en llama.cpp/llama-server con CPU o GPU modesta. Su relevancia practica esta en el nicho: permite convertir lenguaje natural en consultas MobilityDB sin depender de un modelo grande, con un coste de inferencia muy bajo y licencia apache-2.0.

La informacion publicada es minima: no hay idiomas declarados, no hay resultados de benchmarks, no hay detalle del dataset de entrenamiento ni del numero de tokens, y el repositorio acumula 0 descargas y 0 likes. Cualquier evaluacion en produccion deberia partir de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-0.6B), ajustada mediante LoRA |
| Parametros totales | 596.049.920 (~596 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion; el ejemplo oficial de ejecucion usa --ctx-size 2048 |
| Tipos de cuantizacion | GGUF Q8_0 (mobilitydb-sql-q8_0.gguf, ~610 MB); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0); el repositorio no documenta pesos en safetensors |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamano del repositorio | 0,6 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (creacion); ultima actualizacion el mismo dia |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso, sin mezcla de expertos, con normalizacion pre-RMSNorm, activaciones SwiGLU y atencion con RoPE. Sobre esa base se aplica un ajuste LoRA cuyo resultado se exporta a GGUF en cuantizacion Q8_0. El unico artefacto publicado es ese fichero GGUF; no se detallan los adaptadores originales, la configuracion de LoRA (rango, alpha, modulos objetivo) ni si el adaptador se fusiono con los pesos base antes de la conversion.

No hay informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO, ni metodo de evaluacion. La model card menciona el codigo en el repositorio decision-labs/speculative-ideas, bajo el directorio mobilitydb-sql/, y un fichero QUICKSTART.md, que son las unicas fuentes adicionales citadas. El ejemplo de uso desactiva el modo de razonamiento (--reasoning off), coherente con la naturaleza de Qwen3 como modelo hibrido thinking/non-thinking, pero no se especifica como afecta ese ajuste al adaptador.

## Capacidades

- Generacion de texto a SQL: traduccion de instrucciones en lenguaje natural a sentencias SQL especificas de MobilityDB.
- Consultas espacio-temporales: el dominio declarado son datos de trayectorias y AIS, por lo que se orienta a operaciones sobre tipos temporales y de movimiento propios de la extension.
- Conversacion: la etiqueta conversational indica soporte de formato de dialogo multi-turno.
- Modo de razonamiento controlable: la invocacion recomendada usa --reasoning off, luego el modelo base puede operar con o sin traza de razonamiento; no se documenta el efecto del ajuste sobre ese modo.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que el fichero GGUF puede servirse en infraestructuras compatibles con la API de llama.cpp.
- Capacidades generales de codigo o matematicas: no documentadas para este ajuste.
- Vision, audio y tool calling: no documentados.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).

## Casos de uso

- Traduccion de preguntas a MobilityDB SQL en analisis de trafico maritimo: un analista formula la pregunta en lenguaje natural y el modelo genera la consulta sobre las tablas de trayectorias del taller AIS. Es adecuado porque el ajuste esta especializado exactamente en ese dialecto.
- Prototipado de cuadros de mando geoespaciales: integracion del modelo en una interfaz que genere consultas bajo demanda sobre PostgreSQL con MobilityDB, reduciendo la friccion para usuarios que no dominan la sintaxis temporal.
- Asistente embebido en herramientas internas: al ser un GGUF de ~610 MB y 596 M de parametros, puede desplegarse en el propio portatil del desarrollador o en un contenedor pequeno sin GPU dedicada, con llama-server escuchando en localhost.
- Generacion de consultas para pipelines de datos de AIS: normalizacion de preguntas recurrentes (intervalos de tiempo, trayectorias que cruzan una zona, velocidad media por tramo) en consultas reutilizables dentro de un proceso ETL.
- Educacion y formacion en SQL espacio-temporal: servir de ejemplo de text-to-SQL de dominio acotado, con coste de ejecucion minimo, para demostrar el flujo pregunta-consulta-validacion.
- Filtrado previo en un sistema mayor: como primer generador de candidatos de consulta que despues se valida con un parser o contra la propia base de datos, aprovechando su baja latencia frente a modelos mayores.
- Pruebas de cuantizacion y despliegue en llama.cpp: el repositorio publica Q8_0 y comandos de ejecucion, por lo que resulta util como banco de pruebas de un canal de servicio local con contexto corto (2048 tokens en el ejemplo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de consulta (execution accuracy), coincidencia exacta, ni evaluaciones sobre conjuntos de validacion de MobilityDB, AIS o text-to-SQL generico.

## Requisitos de hardware

- VRAM estimada: al no haber pesos en punto flotante publicados, el fichero Q8_0 ocupa unos 610 MB en disco; su carga en memoria ronda ese orden de magnitud, mas el espacio del contexto (con 2048 tokens, unas decenas de MB adicionales). Una hipotetica version en fp16 de 596 M de parametros requeriria aproximadamente 1,2 GB solo de pesos; las cuantizaciones Q4, si existieran (no publicadas), quedarian por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para Q8_0, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. No tiene sentido reservar A100 ni H100 para este modelo, salvo por agregacion de muchas instancias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en graficas integradas con memoria compartida.
- Cabe en CPU: si, es el escenario natural. Tambien es viable en equipos de placa unica tipo Raspberry Pi (con latencias mayores).
- Opciones de despliegue: llama.cpp / llama-server (comando oficial documentado), y por compatibilidad de formato GGUF tambien Ollama, LM Studio o cualquier runtime que consuma GGUF. vLLM y TGI trabajan mejor con pesos safetensors, que no se publican aqui.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se conocen, en la informacion proporcionada, otros ajustes publicados especificamente para text-to-SQL sobre MobilityDB. La comparacion queda limitada al modelo base y a la ausencia de metricas comunes.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decisionlabs/mobilitydb-sql | ~596 M | no disponible (ejemplo con 2048) | SQL de MobilityDB (AIS) | apache-2.0 | GGUF Q8_0 en HuggingFace |
| Qwen/Qwen3-0.6B | ~596 M | no disponible en esta informacion | proposito general | apache-2.0 | safetensors y otras |
| Otros modelos text-to-SQL pequenos | no disponible | no disponible | generico o dialectos SQL comunes | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: esta entrenado para MobilityDB y su entorno declarado es un taller sobre AIS. Fuera de ese dialecto y ese esquema de datos, la calidad esperada es baja.
- Sin evaluacion publicada: no hay benchmarks, ni conjunto de validacion descrito, ni tasas de acierto. No hay evidencia objetiva de su fiabilidad en generacion de SQL.
- Riesgo de alucinacion de funciones y columnas: al ser un modelo de 596 M, es probable que invente nombres de funciones de MobilityDB, tipos temporales o columnas que no existen; toda consulta generada deberia validarse contra el esquema real o ejecutarse en un entorno controlado.
- Contexto limitado en la practica: el ejemplo oficial fija --ctx-size 2048. Esquemas de base de datos grandes o historiales de conversacion largos pueden no caber.
- Idiomas no declarados: se desconoce que lenguas maneja con soltura, lo que complica planificar despliegues multilingues. El material de referencia esta en ingles.
- Datos de entrenamiento desconocidos: no se puede auditar la procedencia de los datos ni descartar sesgos heredados del corpus ni del modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3-0.6B, tambien apache-2.0, y de cualquier dato de entrenamiento no declarado.
- Fechas de publicacion inusuales: el repositorio figura creado y actualizado el 19 de septiembre de 2026, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decisionlabs/mobilitydb-sql
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de codigo: https://github.com/decision-labs/speculative-ideas (directorio mobilitydb-sql/)
- Guia de inicio rapido: https://github.com/decision-labs/speculative-ideas/blob/main/mobilitydb-sql/QUICKSTART.md
- MobilityDB: no se incluye enlace en la informacion proporcionada.
- Resultados de busqueda web: las busquedas realizadas no devolvieron documentacion tecnica relevante sobre este modelo; los resultados obtenidos correspondian a paginas de ayuda de YouTube y a otros contenidos sin relacion. No se han podido incorporar papers, blogs ni demos adicionales.
