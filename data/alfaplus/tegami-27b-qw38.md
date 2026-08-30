# alfaplus/tegami-27B-qw38

## Resumen

Tegami-27B es un adaptador QLoRA (Low-Rank Adaptation con cuantización) desarrollado por alfaplus sobre el modelo base Qwen/Qwen3.8-27B, un transformer denso de 27 mil millones de parámetros. El adaptador está especializado en la redacción de correo electrónico empresarial japonés: aplica keigo (敬語) correcto, estructura completa del mensaje (件名, 宛名, 署名), distingue el registro interno del externo, respeta el ancho de línea de aproximadamente 30 caracteres de ancho completo y evita la sobre-formalización cuando se solicita un mensaje casual. Se puede indicar la instrucción en inglés o japonés; la salida siempre es correspondencia empresarial japonesa.

La relevancia de este modelo radica en su enfoque de evaluación: incluye un eje "negativo" que penaliza la formalización excesiva de mensajes informales, algo que la mayoría de adaptadores de estilo no mide. Según la model card, el modelo base sin adaptador obtiene un 0% de acierto en la generación de correos con formato correcto, mientras que con el adaptador alcanza un 95,3% en escenarios dentro de la distribución de entrenamiento y un 88,2% en escenarios novedosos. El adaptador se distribuye bajo licencia Apache 2.0 y está pensado para su uso con el motor de inferencia nativo qw38 o cualquier framework compatible con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre Qwen3.8-27B (transformer denso) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (adaptador PEFT; el modelo base admite cuantizacion 4-bit/8-bit) |
| Idiomas soportados | Japones (salida), ingles y japones (instrucciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (adaptador PEFT, probablemente safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Qwen3.8-27B, un transformer causal denso de 27B parametros desarrollado por Alibaba. No se especifican en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni el proceso de alineacion (RLHF, DPO, etc.). La model card indica que el entrenamiento incluye un eje "negativo" explicito: se penaliza la sobre-formalizacion de mensajes casuales, de modo que el adaptador no aplica keigo de forma indiscriminada.

La innovacion tecnica destacable es el harness de evaluacion mecanica incluido en el repositorio (`eval/jp_bizmail_check.py`), que realiza comprobaciones a nivel de regex y parseo sobre tres ejes: positivo (formato y keigo correctos), negativo (veto a la sobre-formalizacion) y preservacion (las capacidades generales de Q&A y razonamiento del modelo base se mantienen intactas). No se utilizan jueces LLM ni evaluaciones subjetivas.

## Capacidades

- Generacion de correos empresariales japoneses completos: incluye 件名 (asunto), 宛名 (bloque de direccion), 署名 (firma) y cuerpo del mensaje.
- Aplicacion correcta de keigo (敬語) con distincion entre lenguaje honorifico, humilde y cortes.
- Distincion de registro interno (correo a un superior de la misma empresa) vs. externo (correo a un cliente), con las formulas de apertura y cierre adecuadas a cada caso.
- Respeto del ancho de linea de aproximadamente 30 caracteres de ancho completo, comun en la correspondencia empresarial japonesa.
- Correccion de errores de keigo en borradores existentes (tarea de proofreading, denominada M-rev en la model card).
- Acepta instrucciones en ingles o japones; la salida siempre es en japones.
- Preserva las capacidades generales de Q&A y razonamiento del modelo base (100% de preservacion segun la evaluacion del autor).
- No sobre-formaliza mensajes casuales: un mensaje informal a un amigo no recibe tratamiento keigo (eje negativo al 100%).

## Casos de uso

- Redaccion de correos de disculpa a clientes: el modelo genera un mensaje con la estructura completa (asunto, destinatario, cuerpo, firma) y el keigo adecuado para situaciones como errores de envio, retrasos o defectos de producto. Es adecuado porque el adaptador ha sido entrenado especificamente con escenarios de este tipo y mantiene un registro formal correcto sin caer en redundancias.
- Comunicacion interna con superiores: para reportar solicitudes de clientes, pedir decisiones o informar de incidencias, el modelo produce correos internos con el registro adecuado (お疲れ様です, formulas de consulta) y sin exceso de keigo, que resultaria artificial en un contexto interno.
- Correccion de borradores de correos: dado un texto con errores de keigo (por ejemplo, doble honorifico como お伺いさせていただきたい), el modelo identifica los fallos y propone una version corregida. La model card muestra que esta tarea pasa de 0/8 a 8/8 aciertos con el adaptador.
- Generacion de respuestas a solicitudes de clientes: el modelo puede redactar respuestas formales a peticiones de cambio de fechas, consultas sobre pedidos o solicitudes de informacion, manteniendo el registro externo adecuado.
- Estandarizacion de la comunicacion empresarial en equipos internacionales: dado que acepta instrucciones en ingles, un equipo no nativo puede generar correos japoneses correctos sin depender de un hablante nativo, lo que reduce errores de protocolo en la comunicacion con clientes japoneses.
- Automatizacion de plantillas de correo en sistemas CRM o de atencion al cliente: el adaptador puede integrarse en pipelines de generacion de correos para producir mensajes con formato consistente y keigo correcto, reduciendo la revision manual.

## Benchmarks y rendimiento

La model card no reporta benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), sino metricas propias del autor obtenidas con el harness de evaluacion mecanica `eval/jp_bizmail_check.py`. Los resultados, con decodificacion greedy y dos conjuntos de test reservados, son los siguientes:

| Eje | Que comprueba | Base Qwen3.8-27B | + Tegami LoRA |
|---|---|---|---|
| Positivo (in-distribution) | keigo + formato de correo correcto | 0,0% | 95,3% |
| Positivo (escenarios novedosos) | igual, en escenarios no vistos en entrenamiento | 0,0% | 88,2% |
| Negativo (veto) | un mensaje casual no se sobre-formaliza | 80-100% | 100% |
| Preservacion | Q&A y razonamiento general siguen funcionando | 100% | 100% |

Nota: el conjunto in-distribution incluye 70 sondas (`eval_probes`) y un conjunto disjunto (`eval_disjoint`); el conjunto de escenarios novedosos incluye 24 sondas (`wild2_probes`) disjunto del entrenamiento y de los otros conjuntos. La tarea de proofreading (M-rev) pasa de 0/8 a 8/8 aciertos in-distribution.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo base de 27B, la VRAM depende principalmente del modelo base. En FP16 se necesitan aproximadamente 54 GB; en 8-bit unos 27 GB; en 4-bit unos 14-16 GB. El adaptador anade un consumo minimo adicional (del orden de cientos de MB).
- GPU recomendadas: para FP16, una A100 80GB o H100; para 8-bit, una RTX 4090 (24GB) o A6000; para 4-bit, una RTX 3090/4090 o similar con 16-24GB.
- Si cabe en GPU de consumo: si, con cuantizacion 4-bit del modelo base, cabe en una RTX 3090 o RTX 4090 (24GB). Con 8-bit, tambien cabe en 24GB, aunque con margen ajustado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` de HuggingFace sobre el modelo base. Tambien es compatible con el motor de inferencia nativo qw38 (repositorio L1aoXingyu/qw38) y con frameworks como vLLM o TGI si soportan PEFT. Para despliegue local ligero, se puede usar llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Depende del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA especificamente entrenados para correo empresarial japones con los que comparar directamente. La comparacion mas relevante es contra el modelo base sin adaptador, cuyos resultados se muestran en la tabla de benchmarks: el base obtiene un 0% en formato de correo correcto, mientras que con el adaptador alcanza 95,3% in-distribution. En cuanto a modelos de tamano similar, Qwen3.8-27B compite con otros modelos densos de 27B (por ejemplo, Llama 3.1 8B o Mistral 7B no son comparables por tamano; modelos como Yi-34B o Gemma 2 27B podrian ser alternativas, pero no se dispone de datos de rendimiento en esta tarea especifica). No se puede establecer una comparativa cuantitativa con datos fiables.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar el modelo base Qwen3.8-27B, lo que implica un coste de almacenamiento y VRAM considerable.
- Especializado exclusivamente en correo empresarial japones: no esta disenado para otros generos textuales en japones (literatura, conversacion informal, documentacion tecnica) y su rendimiento fuera de este dominio no esta evaluado.
- Datos de entrenamiento no publicados: no se especifica la composicion del dataset, el volumen de datos ni el proceso de curado, lo que dificulta evaluar posibles sesgos o limitaciones de cobertura.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar nombres de empresas, personas o datos de contacto en los correos generados. En el ejemplo de la model card se observan nombres ficticios (株式会社大和物流, 田中様) que el modelo ha generado de forma plausible pero no verificada.
- Sesgos potenciales: al estar entrenado sobre correos empresariales japoneses, puede reflejar convenciones de jerarquia y protocolo propias de la cultura corporativa japonesa, que no siempre son aplicables o deseables en otros contextos.
- Modelo reciente y sin adopcion: tiene 0 descargas y 0 likes en HuggingFace, por lo que no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.
- La evaluacion del autor es mecanica y propia: los resultados (95,3%, 88,2%, etc.) provienen de un harness disenado por el propio autor y no han sido validados por terceros ni comparados con benchmarks estandar.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones de uso que deben verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfaplus/tegami-27B-qw38
- Repositorio del motor de inferencia qw38: https://github.com/L1aoXingyu/qw38
- Otro modelo del mismo autor (alfa-evil-qwen3.8-27b): https://huggingface.co/alfaplus/alfa-evil-qwen3.8-27b
- Informacion general sobre Qwen 3.8 (27B y 2.4T MoE): https://singularitymoments.com/qwen-3-8-ai-models/
