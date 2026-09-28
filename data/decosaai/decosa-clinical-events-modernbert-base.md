# decosaai/decosa-clinical-events-modernbert-base

## Resumen

decosa-clinical-events-modernbert-base es un modelo de clasificación de tokens (token classification) desarrollado por decosaai, afinado a partir de answerdotai/ModernBERT-base. Su función es etiquetar eventos clínicos y sus fechas sobre una única página de un expediente médico, tal y como la devuelve un lector documental con OCR y detección de layout. Con 149.630.241 parámetros, sustituye a una llamada a un LLM por página cuando se construye una cronología médica, es decir, una lista fechada de lo que le ocurrió a un paciente con cada línea citada a su página de origen.

El modelo no interpreta el texto: localiza y etiqueta spans mediante un esquema BIO sobre sub-palabras, con 33 etiquetas que cubren eventos actuales (ENC, DX, PROC, IMG, LAB, MED, REF), eventos pasados mencionados en la página (H-ENC ... H-REF) y fechas (VDATE para eventos actuales, HDATE para eventos pasados). Las fechas de nacimiento, firma, fax, impresión y sello no se etiquetan. Está pensado explícitamente como ayuda de redacción para revisores humanos (por ejemplo, un paralegal o una enfermera revisora) y no como dispositivo médico.

Su relevancia práctica está en el coste: según la evaluación del autor, procesa una página en torno a 0,1 s en CPU (ONNX fp32, 8 hilos), consume 0,10 M tokens de LLM para 40 paquetes de prueba frente a 1,97 M del enfoque con LLM por página, y tarda 9 s por cada 100 páginas en CPU frente a 131 s en una H100. A cambio, pierde precisión en fechas frente al LLM (95,9% frente a 98,6%). Se publica con licencia Apache-2.0 y solo en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de clasificacion de tokens sobre 33 etiquetas BIO |
| Parametros totales | 149.630.241 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX fp32 (runtime evaluado) y ONNX int8; el autor recomienda fp32 |
| Idiomas soportados | en (ingles; registros medicos de estilo estadounidense) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base (revision 8949b909, Apache-2.0, 150 M de parametros) y anade una cabeza de clasificacion de tokens con 33 etiquetas. El fine-tuning se realizo en 778 pasos (2 epoch) con optimizador AdamW y learning rate 5e-5; la model card menciona ademas un dato de aproximadamente 65k token que aparece truncado en la informacion disponible. No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal especifica para este afinado.

Los datos de entrenamiento son exclusivamente sinteticos: 96.844 paginas sinteticas a nivel de texto, mas 3.222 paginas (160 paquetes) del mismo tipo renderizadas y leidas por un lector documental real (PaddleOCR-VL con deteccion de layout), de modo que el modelo ve ruido de OCR autentico. El generador usa plantillas y bancos de palabras con personas, centros y localidades inventados, y vocabulario clinico ordinario, con simulacion de ruido de escaneo, fax y escritura a mano. No se uso ningun conjunto de datos de terceros (ni MIMIC ni n2c2) ni datos reales de pacientes. Ni el generador ni los paquetes de entrenamiento y evaluacion estan publicados.

## Capacidades

- Etiquetado de eventos clinicos actuales por pagina: encuentros (ENC), diagnosticos (DX), procedimientos (PROC), imagen (IMG), laboratorio (LAB), medicacion (MED) y derivaciones u ordenes (REF).
- Etiquetado de eventos pasados mencionados en la pagina (H-ENC ... H-REF), con la fecha asociada (HDATE) separada de la fecha de eventos actuales (VDATE).
- Extraccion de spans a nivel de sub-palabra con esquema BIO; no realiza interpretacion ni normalizacion semantica del contenido.
- Inferencia en CPU con un coste aproximado de 0,1 s por pagina en ONNX fp32 con 8 hilos.
- Puntuacion de confianza por pagina (ce_core.page_confidence) pensada para encaminar paginas dudosas a un LLM o a una persona dentro de una cascada.
- Funcionamiento sobre salida real de lectores documentales con OCR, incluyendo documentos mecanografiados, escaneados, enviados por fax, fotografiados y con notas manuscritas.
- No soporta generacion de texto libre, tool calling, uso de agentes, vision nativa ni audio.

## Casos de uso

- Construccion de cronologias medicas asistida: el modelo extrae por pagina los eventos y sus fechas, y esos spans alimentan un pipeline posterior que recupera y fusiona la informacion; cada linea queda citada a la pagina de origen y un revisor humano la comprueba.
- Primera etapa de una cascada con LLM: las paginas cuya confianza cae por debajo de 0,5 se derivan a un modelo generativo. Segun la evaluacion del autor, este esquema encuentra el 87,6% de los eventos requeridos con un 1,3% de lineas inventadas y 0,24 M tokens de LLM, frente a 1,97 M del enfoque con LLM por pagina.
- Reduccion de coste de inferencia en pipelines de digitalizacion de expedientes: al resolver el etiquetado en CPU a 9 s por 100 paginas, se evita invocar un LLM de 27 B para cada pagina de un lote grande.
- Indexacion y busqueda sobre registros escaneados: las etiquetas de tipo de evento y las fechas permiten construir indices estructurados (por ejemplo, listar todas las imagenes o todos los laboratorios de un periodo) sin procesamiento adicional.
- Revision documental en contextos de litigio o auditoria medica: sirve como borrador de cronologia que un paralegal o un revisor de enfermeria contrasta manualmente con las paginas citadas, dado que el modelo es una ayuda de redaccion y no un dispositivo medico.
- Preprocesado de expedientes con OCR ruidoso: entrenado sobre salida real de un lector documental, tolera documentos mecanografiados, escaneados, enviados por fax, fotografiados con movil y con notas manuscritas, con F1 de solapamiento entre 0,893 y 0,974 segun el estilo de pagina.
- Control de calidad de lectores documentales: comparar los spans predichos con los esperados ayuda a detectar paginas mal leidas o mal segmentadas antes de que entren en el pipeline de cronologia.

## Benchmarks y rendimiento

Evaluacion a nivel de span sobre 40 paquetes de prueba reservados (818 paginas de salida de lector, semillas y variantes de plantilla no vistas en entrenamiento). Todos los paquetes son sinteticos.

| Metrica | Eventos F1 (P / R) | Fechas F1 (P / R) |
|---|---|---|
| Coincidencia por solapamiento | 0,954 (0,971 / 0,937) | 0,955 (0,939 / 0,970) |
| Fronteras exactas | 0,870 (0,886 / 0,855) | 0,853 (0,840 / 0,868) |

Paginas con todos los spans correctos: 73%. F1 de eventos por solapamiento segun estilo de pagina: mecanografiado 0,970; notas manuscritas 0,974; fax 0,958; escaneado 0,950; maquina de escribir 0,947; tenue 0,937; foto de movil 0,910; fax de segunda generacion 0,893.

Comparativa de cronologia sobre los mismos 40 paquetes de prueba (2.160 eventos requeridos), con la misma salida de lector almacenada, recuperacion BM25 y Qwen3.8-27B para las decisiones de fusion; solo cambia el extractor por pagina.

| Extractor por pagina | Eventos requeridos encontrados | Fechas correctas | Lineas inventadas | Conflictos encontrados (falsos) | Tokens de LLM | Extraccion por 100 paginas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B por pagina (baseline) | 81,5% | 98,6% | 4,1% | 26/40 (8) | 1,97 M | 131 s (una H100) |
| Este modelo | 88,7% | 95,9% | 2,5% | 21/40 (5) | 0,10 M | 9 s (CPU) |
| Cascada: este modelo, paginas con confianza < 0,5 a Qwen | 87,6% | 96,5% | 1,3% | 26/40 (7) | 0,24 M | 33 s |
| Variante ModernBERT-large (no publicada) | 89,5% | 95,8% | 2,9% | 20/40 (4) | 0,10 M | 22 s (CPU) |

La base se eligio sobre la variante large en el conjunto de desarrollo (recall de cronologia 0,913 frente a 0,872); en prueba, la large queda 0,8 puntos por encima, dentro del ruido. Los numeros y las cuatro ramas estan en el fichero eval_summary.json citado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6 GB solo de pesos en fp32 y aproximadamente 0,15 GB en int8, mas el coste de activaciones; en la practica cabe en cualquier GPU con 1-2 GB libres. Estimacion derivada del numero de parametros, no publicada por el autor.
- GPU recomendadas: no requiere GPU. El modelo esta disenado y evaluado para ejecucion en CPU; no se documentan cifras especificas para A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual, aunque no aporta ventaja frente a la CPU para una carga de 150 M de parametros.
- CPU: 0,1 s por pagina con ONNX fp32 y 8 hilos; 9 s por cada 100 paginas.
- Opciones de despliegue: ONNX Runtime (formato evaluado, fp32 preferido), transformers con pipeline de token-classification, y servidores compatibles con modelos de token classification como Text Generation Inference. El repositorio incluye pesos safetensors y ONNX.
- Latencia y throughput: los unicos datos publicados son los de CPU (0,1 s por pagina, 9 s por 100 paginas en CPU y 22 s por 100 paginas para la variante large no publicada). El baseline con Qwen3.8-27B tarda 131 s por 100 paginas en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Eventos requeridos encontrados | Fechas correctas | Tokens de LLM | Tiempo por 100 paginas | Disponibilidad |
|---|---|---|---|---|---|---|---|
| decosa-clinical-events-modernbert-base | 149,6 M | Encoder token classification | 88,7% | 95,9% | 0,10 M | 9 s (CPU) | Publicado, Apache-2.0 |
| Qwen3.8-27B por pagina (baseline del estudio) | 27 B (nominal) | LLM generativo | 81,5% | 98,6% | 1,97 M | 131 s (H100) | Modelo de terceros |
| Variante ModernBERT-large (no publicada) | no disponible | Encoder token classification | 89,5% | 95,8% | 0,10 M | 22 s (CPU) | No publicada |

No se dispone de datos comparativos frente a otros modelos de NER clinico (por ejemplo, variantes basadas en BioBERT, PubMedBERT o DeBERTa) en la informacion facilitada. La licencia del modelo es Apache-2.0; la comparativa de licencias de las alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con paquetes sinteticos: pacientes, clinicos y centros inventados. No se usaron registros medicos reales, y la precision sobre registros reales no esta medida. Hay que validar sobre datos propios antes de confiar en el modelo.
- El modelo es peor que el LLM en fechas (95,9% frente a 98,6% correctas) y encuentra menos registros en conflicto (21 de 40 frente a 26). Si esas dos cosas son criticas, el autor recomienda usar la cascada.
- Las fronteras exactas de los spans suelen desviarse unas palabras (F1 exacto 0,87 frente a 0,95 por solapamiento). El codigo posterior deberia citar el texto circundante, no solo el span.
- Rendimiento mas bajo en fotos de movil y faxes de segunda generacion (F1 de solapamiento 0,910 y 0,893).
- Las fechas se etiquetan, no se parsean: una fecha partida por el OCR o en un formato inusual puede salir fragmentada.
- Solo ingles y solo registros de estilo estadounidense; no debe usarse con documentacion en otros idiomas o formatos.
- El fichero ONNX int8 es mas pequeno y rapido, pero coincide con fp32 en el 97,4% de los argmax por token en la comprobacion de exportacion y en el 91% en una pagina reevaluada antes de la publicacion. El runtime evaluado es fp32, por lo que el autor recomienda preferirlo.
- Una pagina sin spans significa que el modelo no encontro ninguna de las clases entrenadas, no que la pagina carezca de contenido clinico.
- No es un dispositivo medico. No debe usarse para diagnostico, tratamiento, triaje ni decisiones de codificacion, ni para decidir nada sobre una persona sin revision humana.
- No genera texto libre ni soporta tool calling, agentes, vision ni audio.
- Limitaciones de licencia: Apache-2.0 permite uso comercial, pero el autor no publica el generador ni los paquetes de entrenamiento y evaluacion, de modo que la reproduccion del entrenamiento no es posible.
- El modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha (0 descargas, 0 likes), por lo que no cuenta con validacion independiente de la comunidad.
- La seleccion de modelo y el umbral de la cascada se fijaron solo sobre paquetes de desarrollo, lo que puede introducir sesgo de seleccion en las cifras reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-clinical-events-modernbert-base
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Fichero de resultados citado en la model card: eval_summary.json (mencionado sin URL publica en la informacion disponible)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
