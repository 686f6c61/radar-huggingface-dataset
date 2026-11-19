# japan-opendata/ja-doc-classify-v1

## Resumen

ja-doc-classify-v1 es un clasificador de documentos en japones desarrollado por Japan Open Data Lab (japan-opendata). Se trata de un modelo de la familia ModernBERT, afinado a partir de sbintuitions/modernbert-ja-130m (132,2 millones de parametros), disenado para actuar como enrutador en la "entrada" de flujos de procesamiento de documentos de negocio. Clasifica cada documento en una de 8 areas (finanzas, sanidad, legal, administracion publica, empleo, educacion, comercio electronico y telecomunicaciones/TI) y propone, solo cuando tiene suficiente confianza, uno de 43 tipos documentales concretos.

Su rasgo diferencial es el diseno con rechazo explicito: en lugar de forzar siempre una etiqueta, el modelo devuelve "tipo desconocido (solo area)" cuando la confianza no supera los umbrales configurados (0,95 para area y 0,80 para tipo). Ademas incorpora una tercera cabeza que marca documentos con posible alta confidencialidad, pensada como senal previa al detector de datos personales ja-pii-ner-v1 del mismo proyecto.

Es relevante ahora porque aborda un problema practico de los pipelines documentales en produccion: el enrutamiento fiable antes de aplicar modelos costosos de extraccion o anonimizacion. Su tamano reducido (130M) y la inclusion de pesos ONNX FP32 permiten inferencia en CPU a unos 141 ms por documento de longitud media (unas 425 caracteres), lo que lo hace viable en entornos sin GPU. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabezas de clasificacion personalizadas (area, tipo, formato y alta confidencialidad) |
| Parametros totales | 132.167.733 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos originales en safetensors y ONNX FP32; no se documentan otras cuantizaciones |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model.onnx, FP32) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-130m, un encoder ModernBERT adaptado al japones, y anade cabezas de clasificacion para tres tareas: area (8 clases), tipo documental (43 clases) y formato, con logits expuestos por el modelo y umbrales de rechazo definidos en routing_config.json. La inferencia se realiza mediante AutoModel con trust_remote_code=True, lo que implica codigo personalizado en el repositorio.

El entrenamiento se realizo exclusivamente con datos sinteticos: se construyo a partir del corpus NVIDIA Nemotron-PII Japan (CC BY 4.0) y se amplio con transformaciones programaticas de estilo (formato de correo electronico, textos abreviados, listas y formato de memorando). No se incluyen documentos de personas reales. El autor indica que el conjunto de test sintetico retenido permanece sin abrir y que las cifras publicadas provienen de evaluaciones externas con textos escritos por personas ajenas al entrenamiento. No se documenta el uso de RLHF, DPO ni el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion de documentos en 8 areas de negocio con rechazo por umbral de confianza.
- Propuesta de 43 tipos documentales como candidatos, devolviendo tipo nulo cuando la confianza es inferior a 0,80.
- Deteccion de posibles documentos de alta confidencialidad mediante la suma de probabilidades de 22 tipos sensibles (umbral 0,12).
- Salida de logits para las tres cabezas, lo que permite ajustar umbrales segun el caso de uso.
- Clasificacion de formato documental como cabeza auxiliar.
- Inferencia en CPU eficiente gracias al modelo ONNX FP32 incluido.
- No soporta tool calling, agentes, vision ni audio: es un clasificador de texto, no un modelo generativo.

## Casos de uso

- Enrutamiento previo en pipelines documentales: cada documento entrante se clasifica por area para dirigirlo al flujo correspondiente (por ejemplo, facturas a finanzas o informes medicos a sanidad), usando el rechazo para enviar los casos ambiguos a revision humana.
- Prefiltro de anonimizacion: colocado antes de ja-pii-ner-v1, la senal de alta confidencialidad permite priorizar la revision de documentos sensibles y reducir el coste de aplicar el detector de datos personales a todo el volumen.
- Triaje en atencion al ciudadano o back office: clasificacion de correspondencia y formularios recibidos para asignarlos a colas de tramitacion, con la etiqueta de tipo como sugerencia para el operador.
- Procesamiento por lotes en servidores sin GPU: con 141 ms por documento en CPU (Core i7-11700F, ONNX FP32), es adecuado para digitalizar archivos historicos o lotes nocturnos de decenas de miles de documentos.
- Cumplimiento y gestion documental: identificacion de documentos potencialmente sujetos a politicas de retencion o acceso restringido, usando el flag de alta confidencialidad como criterio de ordenacion en la revision, nunca como decision automatica.
- Clasificacion de correo electronico entrante: gracias a la expansion de estilo con formato de email en el entrenamiento, puede etiquetar mensajes de clientes o proveedores por area y tipo antes de su distribucion.
- Enriquecimiento de metadatos en buscadores internos: generacion de etiquetas de area y tipo para indexar repositorios documentales y mejorar la recuperacion.

## Benchmarks y rendimiento

Evaluacion del autor sobre dos conjuntos de 200 documentos de negocio escritos por personas ajenas al entrenamiento (OOD v1 con 25 tipos, OOD v2 con los 43 tipos), aplicando los umbrales por defecto:

| Metrica | OOD v1 | OOD v2 |
|---|---|---|
| Area: tasa de rechazo | 5-6 % | 5-6 % |
| Area: exactitud sobre documentos aceptados | 0,989 | 0,989 |
| Tipo: tasa de rechazo | 26-30 % | 26-30 % |
| Tipo: exactitud sobre documentos aceptados | 0,82-0,87 | 0,82-0,87 |
| Alta confidencialidad: recall | 0,94-0,975 | 0,94-0,975 |
| Alta confidencialidad: falsos positivos en documentos estandar | 8-12,5 % | 8-12,5 % |

Rendimiento de inferencia: aproximadamente 141 ms por documento de longitud media (unos 425 caracteres) en CPU Core i7-11700F con ONNX FP32. La salida de PyTorch y ONNX coincidio en los 600 documentos comparados. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 132M de parametros; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no es necesario GPU; cualquier GPU con al menos 1-2 GB de memoria libre (RTX 3060, RTX 4090, A100, H100) puede ejecutarlo con latencia muy baja.
- CPU: viable en produccion; el autor reporta 141 ms por documento en un Core i7-11700F con ONNX FP32.
- Opciones de despliegue: transformers (PyTorch con trust_remote_code=True), ONNX Runtime para la version incluida; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un encoder de clasificacion).
- Throughput: no disponible de forma agregada; a partir de la latencia reportada se puede estimar un orden de 7 documentos por segundo y nucleo en las condiciones medidas, sin dato oficial de paralelizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| ja-doc-classify-v1 | 132M | no disponible | Clasificacion documental con rechazo y flag de confidencialidad | Apache 2.0 | Enfocado a enrutamiento en japones; evaluacion solo OOD propia |
| sbintuitions/modernbert-ja-130m | 130M | no disponible | Modelo base de representaciones en japones | no disponible | No es un clasificador listo para uso; requiere afinado |
| Clasificadores genericos multilingues (p. ej., XLM-R base) | ~278M | no disponible | Clasificacion de texto generica | no disponible | Mayor tamano y sin cabezas especificas de area, tipo ni confidencialidad |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con datos sinteticos: el rendimiento en documentos reales puede diferir de las cifras OOD reportadas, que ademas se basan en conjuntos pequenos de 200 documentos.
- Tipos documentales debiles: contratos, poderes notariales y registros de verificacion de identidad obtuvieron F1 de 0 en OOD v2 y son absorbidos por otras clases; el tipo debe tratarse como candidato a revisar.
- El flag de alta confidencialidad genera falsos positivos en el 8-12,5 % de documentos estandar; es una senal de priorizacion, no una decision de clasificacion de sensibilidad.
- No apto para decisiones legales o de cumplimiento (naturaleza juridica de un documento o autorizacion de divulgacion).
- Solo japones: no soporta otros idiomas.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo personalizado antes de desplegarlo.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificaciones erroneas con alta confianza en distribuciones alejadas del entrenamiento.
- Sesgos: no documentados por el autor; al derivarse de un corpus sintetico, puede reflejar los sesgos de las plantillas de generacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de origen (Nemotron-PII Japan, CC BY 4.0) deben verificarse para cumplir sus condiciones de atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-doc-classify-v1
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Desarrollador (Japan Open Data Lab): https://jpopendata.jp/
- Corpus de origen (NVIDIA Nemotron-PII Japan): no disponible en la informacion proporcionada
