# elnemer7/ElNeMeR-Employment-Scholarship-Scam-ONNX

## Resumen
ElNeMeR-Employment-Scholarship-Scam-ONNX es un clasificador de texto en formato ONNX publicado por el usuario elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) y orientado a la deteccion de fraudes laborales y de becas. El modelo forma parte de una flota de 15 modelos presentada por el autor como "National & Humanitarian Forensic AI Fleet", con enfoque en IA humanitaria y forense digital. Su tarea concreta es clasificar mensajes en cuatro categorias: ofertas legitimas de empleo o beca, falsos intermediarios de visados de trabajo, estafas de pago por adelantado en procesos de seleccion y trampas de tipo Ponzi basadas en tareas por Telegram.

El repositorio es de tipo ONNX, con pipeline de text-classification y licencia MIT. No se especifican en la informacion disponible el tamano del modelo, la arquitectura base, la longitud de contexto ni los idiomas soportados; el tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos no estan alojados en el propio repositorio o que la informacion esta incompleta. El modelo registra 0 descargas y 0 likes en el momento de la consulta.

Su relevancia actual radica en el nicho que cubre: la proteccion de jovenes, estudiantes y demandantes de empleo frente a esquemas de fraude que circulan por canales digitales (Telegram, correo, redes sociales) y que a menudo combinan falsas ofertas de visado, cobros anticipados y estructuras piramidales. Al estar exportado a ONNX, es potencialmente desplegable en entornos ligeros y sin dependencia de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX de clasificacion de texto; arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Numero de clases de salida | 4 |
| Pipeline | text-classification |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. La model card no detalla el numero de parametros, la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El unico dato estructural confirmado es que se distribuye en formato ONNX y que su salida es una distribucion de probabilidades sobre cuatro clases.

La unica informacion funcional disponible es la definicion de las clases de salida: `0` LEGITIMATE_CAREER_OR_SCHOLARSHIP, `1` FAKE_WORK_VISA_BROKER_FRAUD, `2` ADVANCE_FEE_RECRUITMENT_SCAM y `3` TELEGRAM_TASK_PONZI_TRAP. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni mecanismos de razonamiento multi-paso.

## Capacidades
- Clasificacion de texto en cuatro categorias relacionadas con fraude laboral y de becas.
- Deteccion de falsos intermediarios de visados de trabajo en el extranjero.
- Deteccion de estafas de pago por adelantado en procesos de reclutamiento (advance-fee).
- Deteccion de trampas Ponzi basadas en tareas por Telegram.
- Discriminacion entre ofertas legitimas de empleo o beca y ofertas fraudulentas.
- Distribucion en formato ONNX, lo que facilita su integracion en runtimes de inferencia multiplataforma (ONNX Runtime).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico.

## Casos de uso
- Moderacion de comunidades de empleo y becas: el modelo puede clasificar automaticamente mensajes publicados en foros, grupos de Telegram o portales de empleo para marcar posibles fraudes antes de que lleguen a los usuarios.
- Filtrado de correo y mensajeria para jovenes y estudiantes: integrado en un pipeline de correo o chat, permite etiquetar mensajes sospechosos de estafa de visado o de pago anticipado y derivarlos a revision humana.
- Avisos preventivos en plataformas de orientacion academica: una universidad o servicio de empleo juvenil podria usar el clasificador para advertir a los estudiantes sobre ofertas de beca falsas detectadas en canales publicos.
- Triaje en lineas de denuncia: en un servicio de atencion a victimas de fraude, el modelo permite priorizar y enrutar los casos segun la categoria detectada (visado falso, pago anticipado, Ponzi de Telegram).
- Analisis forense digital por parte de ONG y cuerpos de proteccion al consumidor: clasificacion por lotes de conversaciones y anuncios recopilados durante una investigacion sobre redes de reclutamiento fraudulento.
- Despliegue en entornos con recursos limitados: al estar en ONNX, puede ejecutarse en servidores modestos o en el borde de la red mediante ONNX Runtime, sin requerir una GPU de gran capacidad, lo que encaja con organizaciones con presupuesto tecnico reducido.
- Monitorizacion de campanas en redes sociales: clasificacion de publicaciones y mensajes directos para detectar patrones de captacion de victimas y generar alertas tempranas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible, al no conocerse el tamano ni la arquitectura del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles; el formato ONNX permite ejecucion en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion en servicios Python o .NET a traves de las APIs de ONNX Runtime; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un clasificador ONNX de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de la misma categoria (clasificacion de fraude laboral y de becas) en la documentacion proporcionada. Los clasificadores genericos de texto como los basados en BERT o DistilBERT podrian adaptarse a esta tarea mediante ajuste fino, pero no se aportan datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| ElNeMeR-Employment-Scholarship-Scam-ONNX | no disponible | no disponible | MIT | ONNX | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos conocidos, pero al ser un clasificador entrenado presumiblemente con datos de un dominio concreto, puede presentar sesgos hacia determinados estilos de redaccion, idiomas o regiones.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion de mensajes ambiguos.
- Limitaciones de contexto e idioma: se desconoce la longitud maxima de entrada y los idiomas soportados; la model card esta redactada en ingles y no especifica cobertura multilingue.
- El repositorio figura con 0.0 GB, por lo que no esta claro que los pesos esten efectivamente disponibles para descarga; conviene verificar los archivos antes de planificar un despliegue.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se ofrece ninguna garantia por parte del autor.
- No se aportan datos de validacion, metricas de precision o recall ni un conjunto de evaluacion publico, lo que impide estimar su fiabilidad en produccion.
- El modelo se presenta como parte de una flota comercial del autor; la ausencia de documentacion tecnica detallada aconseja tratarlo con cautela y validarlo con datos propios antes de usarlo en un sistema de decision automatizada.

## Enlaces
- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Employment-Scholarship-Scam-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
