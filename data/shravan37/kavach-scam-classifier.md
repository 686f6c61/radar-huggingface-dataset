# shravan37/kavach-scam-classifier

## Resumen

Kavach scam-classifier es un clasificador de texto binario especializado en detectar mensajes fraudulentos (smishing y phishing) recibidos por SMS y WhatsApp. Lo desarrolla Shravan Kasar como componente del proyecto Kavach, y se distribuye como un unico fichero ONNX de 118,5 MB con cuantizacion int8. Parte del modelo sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, un encoder transformer multilingue, al que se ha anadido una cabeza de clasificacion de dos clases (genuino / estafa).

Su interes practico esta en el enfoque de despliegue: cuantiza no solo las matrices MatMul/Gemm sino tambien la tabla de embeddings de 250 000 tokens (operacion Gather), pasando de 470 MB en fp32 a 118,5 MB sin perdida medible de exactitud en el conjunto de test. Combinado con un tokenizer SentencePiece que consume unos 41 MB de RAM en lugar de los 260 MB del tokenizer.json de HuggingFace, el servicio completo funciona en aproximadamente 260 MB, lo que permite ejecutarlo en CPU o en dispositivos con memoria muy limitada.

El modelo cubre ingles, hindi y marathi, e incluye ejemplos de hinglish en el entrenamiento, un aspecto relevante para el contexto indio. La ventana de entrada esta limitada a 128 tokens y el umbral de decision recomendado es 0,35, optimizado para F1 sobre validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12 multilingue) con cabeza de clasificacion de secuencia, 2 clases |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base es paraphrase-multilingual-MiniLM-L12-v2); el repo ocupa 0,1 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada (input_ids y attention_mask en int64) |
| Tipos de cuantizacion | int8 dinamica en MatMul/Gemm y en la tabla de embeddings (Gather); se distribuye ademas la referencia fp32 para comparacion |
| Idiomas soportados | en, hi, mr; entrenado con datos que incluyen hinglish |
| Licencia | MIT |
| Formato de pesos | ONNX (kavach.int8.onnx, 118,5 MB); tokenizer SentencePiece (sentencepiece.bpe.model) |
| Salida | logits [batch, 2]; indice 1 = estafa |
| Umbral de decision | 0,35 (mejor F1 en validacion) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) supervisado de paraphrase-multilingual-MiniLM-L12-v2 para clasificacion de secuencias con dos etiquetas. La entrada se trunca a 128 tokens, coherente con la longitud tipica de un SMS o mensaje corto de mensajeria instantanea. El tokenizer emplea identificadores de XLM-R (`<s>`=0, `</s>`=2, `<unk>`=3) y suma 1 a los identificadores de SentencePiece, un detalle de integracion importante para quien implemente la inferencia fuera de HuggingFace.

El conjunto de entrenamiento contiene 5 806 mensajes: mensajes reales de la SMS Smishing Collection derivada de UCI, el conjunto sintetico indio auditado `Ridham115/indian-scam-sms-synthetic-audited` (licencia CC BY 4.0, con negativos dificiles) y el conjunto India Cyber Scam Hinglish, reducido de 10 000 filas a sus 743 plantillas unicas para evitar duplicidad. Se excluyo explicitamente el dataset "Indian Scam SMS 30k" porque sus URL fraudulentas contenian la palabra "scam", lo que constituye una fuga de etiqueta. El test es un 20 % estratificado separado antes del entrenamiento: 1 031 mensajes reales, de los cuales 128 son smishing y 903 genuinos.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador de este tamano. La innovacion tecnica destacable es la cuantizacion int8 de la capa de embeddings, poco habitual porque suele degradar mas la exactitud que la cuantizacion de las capas lineales.

## Capacidades

- Clasificacion binaria de mensajes como estafa o legitimo, con salida de logits y umbral configurable.
- Deteccion de smishing y phishing en SMS y mensajes de WhatsApp: enlaces fraudulentos, suplantacion de entidades, falsas ofertas de empleo, avisos de corte de suministro electrico.
- Cobertura multilingue en ingles, hindi y marathi, con presencia de hinglish en los datos de entrenamiento.
- Ejecucion en CPU con huella de memoria reducida (servicio completo en aproximadamente 260 MB de RAM).
- Integracion sencilla en pipelines: un unico fichero ONNX con entradas `input_ids` y `attention_mask` y salida `logits`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es exclusivamente un clasificador.

## Casos de uso

- Filtrado en tiempo real de SMS en pasarelas de mensajeria: el modelo procesa el texto entrante (hasta 128 tokens) y devuelve la probabilidad de estafa; con 118,5 MB y ejecucion en CPU se puede desplegar en el mismo nodo que la pasarela sin GPU.
- Moderacion de grupos y canales de WhatsApp Business: clasificacion previa a la entrega al usuario final, usando el umbral 0,35 para priorizar recall sobre falsos positivos en un contexto donde el coste de un mensaje fraudulento no entregado es alto.
- Senal complementaria en un motor antifraude por reglas: la model card recomienda explicitamente usar el modelo como aviso adicional junto a las senales heuristicas de Kavach, no como prueba definitiva; encaja como feature de un score compuesto.
- Aplicacion movil o SDK on-device: el fichero ONNX int8 y el tokenizer SentencePiece de 41 MB permiten inferencia local en dispositivos Android de gama media sin llamadas a servidor, lo que evita enviar contenido del usuario a terceros.
- Analisis retrospectivo de incidentes: clasificacion por lotes de historicos de mensajes para cuantificar la incidencia de smishing en una base de usuarios y alimentar informes de seguridad.
- Investigacion sobre fraude en el sur de Asia: base reproducible (licencia MIT, datos de entrenamiento documentados, umbral y metricas publicados) para experimentos de deteccion en hindi, marathi e hinglish, con la advertencia de que la exactitud en idiomas indios reales no esta medida.
- Enrutado en atendimiento al cliente: derivar automaticamente mensajes marcados como sospechosos a un flujo de verificacion humana antes de responder.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test real de 1 031 mensajes (128 smishing, 903 genuinos):

| Version | Precision | Recall | F1 | ROC-AUC | Tasa de falsos positivos |
|---|---|---|---|---|---|
| fp32 | 0,992 | 0,969 | 0,980 | 0,9995 | 0,11 % |
| int8 (fichero distribuido) | 0,992 | 0,969 | 0,980 | 0,9994 | 0,11 % |

Prueba cualitativa adicional (no es un benchmark segun el propio autor): 5 de 5 estafas indias citadas literalmente en prensa (tres de corte de suministro electrico, una oferta de empleo y una de India Post) fueron marcadas con probabilidades entre el 97 % y el 99,7 %.

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en conjuntos de referencia de clasificacion de smishing en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU. El fichero ONNX int8 ocupa 118,5 MB y el servicio completo, con tokenizer, se ejecuta en aproximadamente 260 MB de RAM.
- GPU: no necesaria. Cualquier GPU serviria para lotes grandes, pero el modelo esta disenado para CPU.
- Cabe holgadamente en hardware de consumo: Raspberry Pi, telefonos Android de gama media, contenedores con 512 MB de memoria.
- Opciones de despliegue: ONNX Runtime (via directa recomendada), o exportacion a otros runtimes compatibles con ONNX. No se documenta soporte de vLLM, TGI ni llama.cpp, que no aplican a un encoder de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventana de 128 tokens y el tamano del modelo sugieren latencias de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de clasificadores de smishing comparables en la informacion proporcionada. La unica comparacion documentada es contra la version fp32 del propio modelo, con exactitud identica y una reduccion de 470 MB a 118,5 MB.

| Modelo | Parametros | Contexto | F1 (test propio) | Licencia | Formato |
|---|---|---|---|---|---|
| kavach-scam-classifier (int8) | no disponible (base MiniLM-L12) | 128 tokens | 0,980 | MIT | ONNX int8 |
| kavach-scam-classifier (fp32) | no disponible (base MiniLM-L12) | 128 tokens | 0,980 | MIT | pesos fp32 |
| paraphrase-multilingual-MiniLM-L12-v2 (modelo base) | no disponible en la informacion proporcionada | no disponible | no aplica (no es clasificador) | no disponible en la informacion proporcionada | safetensors / transformers |
| Otros clasificadores de smishing | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El conjunto de test real es SMS en ingles britanico. No existe un conjunto de test publico real en hindi ni marathi, y los datos sinteticos indios provienen de LLM, por lo que la exactitud en estafas reales en esos idiomas no esta medida.
- Riesgo de deriva (drift): los guiones de estafa evolucionan y los nuevos patrones se alejaran de los datos de entrenamiento; requiere monitorizacion y reentrenamiento periodicos.
- El autor recomienda usarlo como senal de aviso junto a las reglas de Kavach, no como prueba de fraude. No es adecuado como unico criterio para bloquear o acusar.
- Ventana de 128 tokens: mensajes largos, conversaciones completas o correos electronicos se truncan y pueden perder la senal relevante.
- El umbral 0,35 esta optimizado para F1 en validacion; en produccion conviene recalibrarlo segun el coste relativo de falsos positivos y falsos negativos.
- La validacion cualitativa con 5 mensajes de prensa es una comprobacion puntual, no una evaluacion estadistica.
- Sesgos: al entrenar mayoritariamente con datos del contexto indio, el rendimiento en estafas de otras regiones (por ejemplo, en espana o latinoamerica) no esta evaluado.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene conservar el aviso de copyright. Los datos de terceros tienen sus propias licencias (el conjunto sintetico auditado es CC BY 4.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shravan37/kavach-scam-classifier
- Repositorio del proyecto Kavach: https://github.com/shravankasar37
- Perfil del autor: https://github.com/shravankasar37
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Conjunto sintetico auditado: https://huggingface.co/datasets/Ridham115/indian-scam-sms-synthetic-audited
- La busqueda web realizada no ha devuelto enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.
