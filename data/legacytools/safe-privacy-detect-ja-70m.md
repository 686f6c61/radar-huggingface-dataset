# LegacyTools/safe-privacy-detect-ja-70m

## Resumen
safe-privacy-detect-ja-70m es un clasificador de texto no generativo desarrollado por k-wada-dev-studio bajo el sello LegacyTools, especializado en detectar si un texto en japones menciona explicitamente informacion personal o sensible. Se apoya en el modelo base sbintuitions/modernbert-ja-70m (ModernBERT de 70 millones de parametros, licencia MIT) y devuelve, para cada uno de seis objetivos fijos (nombre completo, salud, antecedentes penales, domicilio registral, afiliacion sindical y creencias religiosas o politicas), una etiqueta entre DETECTED, NOT_DETECTED y ABSTAIN, con probabilidades calibradas.

El modelo resuelve un problema acotado pero critico en el tratamiento de datos japoneses: decidir si una frase concreta declara de forma explicita un atributo sensible, sin inferirlo ni emitir juicios legales. Esta disenado para entradas cortas (un mensaje de chat de hasta 200 caracteres) y para ejecutarse en CPU con cuatro nucleos, sin GPU, lo que lo hace adecuado para filtrado previo en pipelines de proteccion de datos o para enmascarado en herramientas de escritorio.

Su relevancia actual radica en la combinacion de un tamano muy reducido (70,15 millones de parametros), un formato ONNX listo para inferencia en CPU y una documentacion inusualmente detallada sobre los criterios de decision, incluidos los casos en que su definicion de dato sensible difiere de la definicion legal japonesa. La licencia es MIT, aunque el autor expresa reservas de uso eticas que no constituyen condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) para clasificacion de secuencias |
| Parametros totales | 70.157.586 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada en el tokenizador; el script de inferencia rechaza textos de mas de 800 caracteres |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | japones exclusivamente (el script marca como OUT_OF_SCOPE textos con menos del 30 % de caracteres japoneses) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento
El modelo es un encoder ModernBERT de 70 millones de parametros afinado como clasificador multiobjetivo. La cabeza de clasificacion produce 18 logits, organizados como seis objetivos por tres etiquetas (DETECTED, NOT_DETECTED, ABSTAIN). La salida debe interpretarse aplicando softmax por objetivo sobre sus tres logits, no un softmax unico sobre los 18; la configuracion del modelo expone los objetivos, las etiquetas y un parametro de temperatura por objetivo para calibrar las probabilidades. No requiere codigo remoto (`trust_remote_code`).

El modelo base es sbintuitions/modernbert-ja-70m en la revision `ca49e733a062934aef34312f496fea8f4a0beba8`. La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus de ajuste fino ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion practica del proyecto reside en el diseno del etiquetado (tres clases por objetivo, con ABSTAIN para casos ambiguos como transmision, suposicion, texto censurado o sujeto desconocido) y en la calibracion por temperatura reportada en la evaluacion, no en cambios arquitectonicos sobre el transformer subyacente.

## Capacidades
- Clasificacion de texto japones para seis objetivos sensibles: nombre completo, salud, antecedentes penales, domicilio registral, afiliacion a sindicato y creencias.
- Salida con tres estados por objetivo: DETECTED, NOT_DETECTED y ABSTAIN, con probabilidades calibradas.
- Reglas adicionales en el script `predict.py`: OUT_OF_SCOPE para textos vacios, no japoneses, demasiado largos o con identificador de objetivo no soportado, y FAILED para errores de ejecucion o timeouts.
- Deteccion de negaciones como afirmacion del atributo: frases como "no tengo antecedentes penales" se marcan como DETECTED en los objetivos correspondientes.
- No realiza generacion de texto, no infiere atributos no explicitos y no devuelve el fragmento concreto que activa la deteccion.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un clasificador puro.
- No cubre numeros de cuenta, My Number ni otros identificadores de formato fijo, que el autor remite a componentes basados en reglas.

## Casos de uso
- Filtrado previo en pipelines de proteccion de datos: antes de enviar mensajes de usuario a un servicio externo, el modelo marca que objetivos sensibles aparecen explicitamente en el texto para decidir si se enmascara o se bloquea.
- Enmascarado en herramientas de escritorio: el autor lo integra en la extension Chrome Safe Privacy Mask, que oculta correos, telefonos y claves de API; este clasificador anade la capa de datos sensibles en campos de entrada japoneses.
- Registro seguro de conversaciones: al procesar transcripciones de atencion al cliente en japones, permite etiquetar turnos con menciones de salud o afiliacion sindical antes de almacenarlos o anonimizarlos.
- Cumplimiento en entornos de RR. HH. japoneses: revision de formularios y comunicaciones internas para localizar menciones explicitas de historial medico o creencias, con la advertencia de que el modelo no emite juicios legales.
- Moderacion y curaduria de contenido: clasificacion de publicaciones o mensajes en japones para separar aquellos que declaran abiertamente datos sensibles de terceros, con ABSTAIN como senal para revision humana.
- Investigacion sobre privacidad en corpus japoneses: medicion de la frecuencia con que aparecen menciones explicitas de atributos sensibles en un conjunto de textos, dado su bajo coste de ejecucion en CPU.
- Preetiquetado en anotacion de datos: generacion de etiquetas iniciales por objetivo que un revisor humano corrige, aprovechando la clase ABSTAIN para dirigir la atencion a los casos ambiguos.

## Benchmarks y rendimiento
La model card incluye una seccion de evaluacion con objetivos propuestos por el equipo de desarrollo (tasa de omision inferior al 5 %, falsos positivos inferiores al 3 % en casos normales y al 10 % en casos confusos, tasa de abstenccion inferior al 10 %, acierto de abstenccion superior al 70 % y ECE inferior a 0,05 tras calibracion). El autor indica que, de 36 metricas evaluadas, una no alcanzo el objetivo: la tasa de omision del objetivo `union` (afiliacion sindical). La tabla concreta de resultados no esta disponible en la informacion proporcionada.

| Metrica | Objetivo declarado | Resultado |
|---|---|---|
| Tasa de omision | <= 5 % | no disponible (1 de 36 metricas no alcanzo su objetivo, segun el autor) |
| Falsos positivos (casos normales) | <= 3 % | no disponible |
| Falsos positivos (casos confusos) | <= 10 % | no disponible |
| Tasa de abstenccion | <= 10 % | no disponible |
| Acierto de abstenccion | >= 70 % | no disponible |
| ECE tras calibracion | <= 0,05 | no disponible |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K u otros benchmarks generales, que no aplican a un clasificador de este tipo.

## Requisitos de hardware
- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa aproximadamente 280 MB en precision fp32 (70,15 millones de parametros) y el repositorio completo pesa 1,1 GB por incluir safetensors y ONNX.
- Entorno objetivo declarado por el autor: CPU de cuatro nucleos, sin GPU.
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamano.
- Cabe en cualquier GPU de consumo e incluso en entornos sin acelerador; tambien es viable en contenedores de bajo coste.
- Opciones de despliegue: ONNX Runtime en CPU mediante `predict.py`, transformers con `AutoModelForSequenceClassification`, y Text Embeddings Inference segun las etiquetas del repositorio. La pipeline estandar `text-classification` de transformers no es correcta por si sola, ya que agrupa los 18 logits sin separar por objetivo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La siguiente tabla recoge solo caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| safe-privacy-detect-ja-70m | 70,15 M | 512 tokens (entrada) | Clasificacion PII en japones, 6 objetivos | MIT | Hugging Face, ONNX y safetensors |
| sbintuitions/modernbert-ja-70m | 70 M | no disponible | Modelo base de lenguaje japones | MIT | Hugging Face |
| Alternativas de deteccion de PII en japones | no disponible | no disponible | Clasificacion o extraccion de PII | no disponible | no disponible |

## Limitaciones y advertencias
- Solo funciona con texto en japones; el script descarta entradas con menos del 30 % de caracteres japoneses y textos de mas de 800 caracteres.
- No infiere atributos: no deduce nacionalidad a partir de un nombre ni diagnosticos a partir de un centro medico; esas inferencias se marcan como NOT_DETECTED.
- No determina la calificacion legal como dato personal, dato personal de especial cuidado o informacion sensible; sus criterios son mas amplios que la definicion de la ley japonesa en varios objetivos (por ejemplo, incluye malestar leve, embarazo o participacion en huelgas).
- Las negaciones cuentan como DETECTED en salud, antecedentes penales, sindicato y creencias, lo que puede sorprender en integraciones que esperen la semantica contraria.
- Los nombres parciales (solo apellido o solo nombre) y los apodos no se detectan como nombre completo.
- Existe una tasa de omision documentada por encima del objetivo en el objetivo de afiliacion sindical; el autor advierte explicitamente de que "sin deteccion" no equivale a "sin informacion sensible".
- No localiza el fragmento responsable de la deteccion, solo emite un veredicto sobre el texto completo.
- No cubre identificadores de formato fijo como numeros de cuenta o My Number, ni atributos como raza, origen, vida sexual, domicilio o empleador en esta version.
- La licencia MIT no impone restricciones de uso comercial, pero el autor solicita no emplearlo para recopilar informacion sensible, seleccionar o perjudicar a personas ni vigilar a empleados o clientes; se trata de una peticion, no de una condicion legal.
- El cumplimiento de la legislacion de proteccion de datos japonesa recae en el usuario.
- Riesgo de alucinacion no aplicable en sentido estricto por ser un clasificador, pero si existe riesgo de falsos positivos y falsos negativos en los limites descritos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LegacyTools/safe-privacy-detect-ja-70m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-70m
- Pagina del proyecto: https://legacy-tools.dev/
- Pagina de laboratorio y modelos en desarrollo: https://legacy-tools.dev/labs/
- Perfil del autor en Hugging Face: https://huggingface.co/LegacyTools
