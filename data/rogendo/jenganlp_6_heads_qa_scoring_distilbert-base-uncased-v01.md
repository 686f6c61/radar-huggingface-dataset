# Rogendo/JengaNLP_6_heads_qa_scoring_distilbert-base-uncased-v01

## Resumen

JengaNLP 6 heads QA scoring es un modelo de clasificacion multi-tarea construido sobre distilbert-base-uncased y publicado por el usuario Rogendo en HuggingFace. Su objetivo es automatizar la evaluacion de calidad (QA) y el cumplimiento normativo en centros de atencion telefonica de alto volumen: en lugar de aplicar seis clasificadores independientes sobre cada transcripcion, un unico codificador compartido alimenta seis cabezas lineales que puntuan simultaneamente apertura, escucha activa, proactividad, resolucion, gestion de espera y cierre.

La arquitectura es un transformer encoder tipo BERT destilado (6 capas, ~66 millones de parametros) con contexto maximo de 512 tokens, al que se anaden seis cabezas de clasificacion con 1, 6, 3, 5, 2 y 1 etiquetas respectivamente. El autor declara una latencia de aproximadamente 30 ms por pase forward en CPU, lo que lo hace atractivo para auditar el 100 % de las llamadas en lugar de muestrear un porcentaje reducido, tal como se hace en los procesos de QA manuales.

El modelo es relevante por su enfoque de eficiencia (una sola pasada frente a seis modelos) y por su orientacion explicita a sectores regulados como banca y fintech, donde la adherencia al guion legal tiene consecuencias contractuales. Su licencia Apache 2.0 permite uso comercial sin restricciones de redistribucion, aunque el repositorio acumula 0 descargas y 0 likes, no publica datos de entrenamiento ni resultados de evaluacion, y su codigo de ejemplo referencia un identificador de modelo distinto (una variante de NER), lo que obliga a tratar la ficha como una propuesta tecnica no validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multi-tarea: codificador compartido DistilBERT + 6 cabezas lineales independientes |
| Parametros totales | ~66 millones en el codificador distilbert-base-uncased, mas los pesos de las 6 cabezas (desglose exacto no disponible) |
| Longitud de contexto | 512 tokens (maximo soportado por distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (el repositorio publica unicamente safetensors en la precision original) |
| Idiomas soportados | en (ingles), sw (suajili) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion multi-etiqueta / multi-cabeza (quality-assurance, compliance) |
| Modelo base | distilbert/distilbert-base-uncased |
| Cabezas de validacion | Opening (1 etiqueta), Listening (6), Proactiveness (3), Resolution (5), Hold (2), Closing (1) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-01-06 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo sigue el patron de BERT multi-tarea: un unico encoder DistilBERT (6 capas de transformer, 768 dimensiones ocultas, 12 cabezas de atencion, vocabulario de 30.522 tokens) procesa la transcripcion completa y produce una representacion compartida; sobre ella se montan seis cabezas lineales independientes que emiten logits para cada criterio de validacion. La innovacion principal es de eficiencia: el autor afirma que sustituye la ejecucion de seis modelos separados por un unico pase `forward()`, con un coste declarado de unos 30 ms en CPU. Esto reduce el coste de auditoria integra de llamadas y simplifica el mantenimiento de una sola pieza de software.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el origen de las transcripciones etiquetadas, el esquema de anotacion ni si se aplicaron tecnicas de ajuste adicionales como RLHF, DPO o destilacion especifica. Tampoco se documenta el tratamiento del desequilibrio de clases entre las distintas cabezas (por ejemplo, la distribucion entre las 6 etiquetas de Listening). La model card unicamente describe la semantica de cada cabeza, de modo que cualquier reproducibilidad del ajuste queda fuera del alcance de la informacion disponible.

## Capacidades

- Clasificacion multi-etiqueta en una sola pasada: devuelve logits para las seis cabezas de validacion de forma simultanea.
- Auditoria de cumplimiento de guion: evalua si el agente uso el saludo corporativo obligatorio (Opening) y si cerro la llamada de forma profesional (Closing).
- Analisis de habilidades conversacionales: deteccion de interrupciones, empatia y parafraseo del problema del cliente (Listening, 6 etiquetas).
- Evaluacion de proactividad: comprueba si el agente ofrecio asistencia adicional o hizo seguimiento de actualizaciones de caso (Proactiveness, 3 etiquetas).
- Verificacion de exactitud procedimental: valida si se proporciono informacion correcta y se siguio el procedimiento establecido (Resolution, 5 etiquetas).
- Control de gestion de espera: comprueba si se pidio permiso antes de poner en espera y si se agradecio la paciencia al cliente (Hold, 2 etiquetas).
- Procesamiento bilingue limitado a ingles (en) y suajili (sw).
- No dispone de decodificacion generativa, razonamiento multi-paso, tool calling, function calling, soporte de agentes, vision ni audio.
- No se documenta un modo de razonamiento explicito ni capacidad de generar justificaciones textuales de la puntuacion.

## Casos de uso

- Auditoria integra de llamadas en centros de contacto: en lugar de muestrear un 1-5 % de las interacciones, el modelo permite puntuar el 100 % de las transcripciones del dia con un coste de CPU bajo (aproximadamente 30 ms por pase forward), generando un informe de cumplimiento por agente.
- Cumplimiento normativo en banca y fintech: la cabeza de Resolution y la de Opening permiten verificar automaticamente la lectura de avisos legales obligatorios y la correcta aplicacion del procedimiento en productos regulados (creditos, seguros, reclamaciones).
- Deteccion de riesgo en tiempo casi real: al ser un modelo de 66 millones de parametros, puede ejecutarse sobre cada transcripcion parcial generada por ASR y activar alertas cuando la cabeza de Hold o la de Proactiveness indican incumplimiento, permitiendo que un supervisor intervenga.
- Segmentacion de la formacion interna: agregando los logits de Listening y Proactiveness por agente y por equipo se obtienen mapas de calor de carencias concretas (por ejemplo, interrupciones frecuentes o ausencia de parafraseo) que alimentan planes de formacion focalizados.
- Analisis post-mortem de reclamaciones: ante una queja escalada o un expediente abierto, el modelo aporta una puntuacion objetiva por dimension sobre la transcripcion implicada, util como evidencia documental complementaria a la revision humana.
- Priorizacion de la revision humana: los casos con puntuaciones bajas o ambiguas en varias cabezas se enrutan a auditores humanos, reduciendo el volumen de revision manual al subconjunto de mayor riesgo.
- Investigacion academica sobre BERT multi-tarea: su estructura de codificador compartido con seis cabezas de cardinalidad distinta (1, 6, 3, 5, 2, 1) sirve como referencia para experimentos de clasificacion multi-tarea y de reparto de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado por el autor es la eficiencia de inferencia (~30 ms por pase forward en CPU), sin especificar la maquina empleada, el tamano de lote ni la longitud media de las transcripciones. Los resultados de busqueda web recuperados no contienen informacion sobre este modelo.

## Requisitos de hardware

- Huella del modelo en precision FP32: aproximadamente 265 MB de pesos (66 millones de parametros), mas el coste de activaciones, tipicamente por debajo de 1 GB de VRAM para lotes pequenos.
- Huella en FP16/BF16: aproximadamente 133 MB; en INT8, aproximadamente 67 MB (cuantizacion no publicada, requeriria conversion propia con Optimum o PyTorch).
- Inferencia en CPU: viable en produccion segun el autor (unos 30 ms por llamada), lo que permite ejecutarlo en instancias sin GPU para auditoria por lotes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, una RTX 4090 o una T4 pueden procesar lotes grandes sin saturacion. Tarjetas de datacenter como A100 o H100 estan sobredimensionadas para 66 millones de parametros salvo que se ejecuten decenas de miles de transcripciones en paralelo.
- Cabe sobradamente en GPU de consumo e incluso en dispositivos de borde si se convierte a ONNX o TorchScript.
- Opciones de despliegue: transformers con la clase `MultiTaskModel` del paquete `multitask_bert` citado en la model card, Optimum/ONNX Runtime para inferencia optimizada, TorchScript, o servicios propios sobre FastAPI. No es desplegable en llama.cpp u Ollama, orientados a modelos generativos, y TGI no cubre tareas de clasificacion.
- Latencia y throughput: unico dato disponible, ~30 ms por pase forward en CPU. No se publica throughput agregado, escalado con tamano de lote ni rendimiento en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Observaciones |
|---|---|---|---|---|---|
| JengaNLP 6 heads QA scoring (este modelo) | ~66 M | 512 tokens | Encoder multi-tarea con 6 cabezas de QA | Apache 2.0 | Cabezas especificas de compliance; sin datos de entrenamiento ni benchmarks publicados; 0 descargas |
| distilbert-base-uncased | 66 M | 512 tokens | Encoder generalista | Apache 2.0 | Modelo base; requiere ajuste propio para cada criterio de QA |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 256 tokens | Encoder de embeddings | Apache 2.0 | Mas ligero y muy extendido, pero orientado a similitud semantica, no a clasificacion de compliance |
| ModernBERT-base | 149 M | 8192 tokens | Encoder con atencion alterna y RoPE | Apache 2.0 | Contexto mucho mayor, adecuado para transcripciones completas; requiere ajuste propio |
| DeBERTa-v3-base | 86 M | 512 tokens | Encoder con atencion desenredada | MIT | Buen rendimiento general en NLU; requiere una cabeza por criterio |

No se dispone de comparaciones de rendimiento medidas entre este modelo y las alternativas, ya que no se han publicado benchmarks. La comparacion anterior se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Ventana de contexto de 512 tokens: las transcripciones de llamadas de atencion al cliente suelen superar esa longitud con holgura, por lo que sera necesario truncar, trocear con agregacion posterior o resumir la llamada antes de puntuarla, con la consiguiente perdida de informacion.
- Repositorio sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia publica de que los pesos funcionen segun lo descrito.
- El codigo de ejemplo de la model card carga el identificador `Rogendo/JengaNLP_NER_distilbert-base-uncased-v01`, una variante de reconocimiento de entidades, no este modelo. Hay que corregir el identificador antes de usarlo y verificar que los nombres de las cabezas coinciden.
- Dependencia de un paquete no estandar: la inferencia requiere la clase `MultiTaskModel` del paquete `multitask_bert`, cuya disponibilidad, versionado y mantenimiento no se documentan en la informacion proporcionada.
- Ausencia total de informacion sobre el dataset de entrenamiento: se desconoce el origen de las transcripciones, el idioma real de las mismas, el proceso de anotacion, el acuerdo entre anotadores y la distribucion de etiquetas. Esto impide estimar sesgos sistematicos por acento, genero, dialecto o tipo de cliente.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos y falsos negativos en la auditoria; un falso negativo en Resolution puede ocultar un incumplimiento legal.
- Idiomas: solo ingles y suajili. No hay soporte declarado de castellano ni de otras lenguas, por lo que no es utilizable directamente en centros de contacto en Espana o Latinoamerica sin reentrenamiento.
- Uso en contextos regulados: la puntuacion automatica no deberia sustituir la revision humana en decisiones con consecuencias laborales o legales (despidos, sanciones, expedientes). Se recomienda tratar la salida como senal de priorizacion, no como veredicto.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; no impone restricciones de comparticion de derivados, pero tampoco ofrece indemnizacion por el uso.
- Sin cuantizaciones publicadas: cualquier despliegue en INT8, FP16 o formatos de runtime alternativos exige una conversion propia y una validacion posterior de la calidad de las puntuaciones.
- Sesgo de anotacion potencial: si las etiquetas de QA originales reflejan criterios de una organizacion concreta, el modelo reproducira esas convenciones y no necesariamente estandares de cumplimiento generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rogendo/JengaNLP_6_heads_qa_scoring_distilbert-base-uncased-v01
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Los resultados de busqueda web recuperados no contienen enlaces relevantes sobre este modelo (corresponden a la funcion QUERY de Google Sheets y a hilos de WordReference sin relacion con el modelo).
