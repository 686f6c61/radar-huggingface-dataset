# a5566qq123/gliner2-tw-pii

## Resumen

GLiNER2-TW-PII es un adaptador LoRA de tipo token-classification especializado en la deteccion y desidentificacion de datos personales (PII) en chino tradicional con variantes locales de Taiwan. Lo desarrolla el usuario a5566qq123 (Chin-Lin Lee, segun la cita de la model card) y se construye sobre el modelo base fastino/gliner2-privacy-filter-PII-multi, con 205 millones de parametros, del que hereda la arquitectura de extraccion de spans.

El problema que resuelve es concreto: los identificadores taiwaneses (numero de identidad nacional, numero de cuenta fiscal, tarjeta de salud, matriculas, identificadores de LINE o PTT) no estan cubiertos de forma fiable por los filtros PII multilingues genericos. El modelo incorpora reconocimiento a nivel de caracter, necesario porque el chino no separa palabras con espacios, y se evalua sobre el conjunto lianghsun/tw-PII-bench.

Es relevante para equipos que necesitan anonimizar documentos, registros medicos o logs antes de almacenarlos o de alimentar otros modelos, y que operan bajo normativa de proteccion de datos de Taiwan. Se distribuye unicamente como adaptador PEFT en safetensors bajo licencia Apache-2.0, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer con modulo de representacion de spans y cabezas de clasificacion); se distribuye como adaptador LoRA sobre el modelo base |
| Parametros totales | 205 M en el modelo base; el numero de parametros anadidos por el adaptador LoRA no esta cuantificado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita; la model card recomienda ventana deslizante con solapamiento para textos de mas de 512 caracteres |
| Tipos de cuantizacion | No disponible; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Chino tradicional (zh), con enfasis en el contexto de Taiwan |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Libreria de carga | peft / transformers (requiere ademas gliner2 >= 0.2.0) |
| Fecha de publicacion | 19 de septiembre de 2026, segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El modelo base GLiNER2-PII es un encoder de 205 M de parametros orientado a extraccion de spans: dada una lista de etiquetas definidas por el usuario y un texto, predice los fragmentos que corresponden a cada etiqueta junto con su confianza. Sobre esa base se aplica un ajuste fino con LoRA (PEFT) de rango r=16, alpha=32.0 y dropout 0.05, con modulos objetivo encoder, span_rep, classifier, count_embed y count_pred, lo que indica que el ajuste afecta tanto a la codificacion como a las cabezas de representacion y clasificacion de spans. El entrenamiento se realizo en precision mixta FP16.

Los datos de entrenamiento proceden de un motor de generacion de datos sinteticos denominado PII-Synthea, que inyecta reglas reales de validacion de numeros de identidad taiwaneses y de numeros de cuenta fiscal, junto con contexto local y ejemplos negativos dificiles (nombres de personajes publicos, organismos oficiales, lineas telefonicas publicas). El uso de CharLevelSplitter como divisor a nivel de caracter es una decision tecnica clave: sustituye el divisor por espacios del modelo original, inadecuado para chino, y evita desplazamientos en los limites de entidad. No se documenta en la informacion disponible si hubo fases de RLHF o DPO; al tratarse de una tarea de clasificacion de spans, lo esperable es entrenamiento supervisado directo.

## Capacidades

- Extraccion de entidades PII por spans a nivel de caracter, con limites de entidad y puntuacion de confianza por fragmento (parametros include_spans e include_confidence).
- Esquema de etiquetas abierto y configurable en tiempo de inferencia: el usuario pasa la lista de etiquetas que le interesan (person, national_id_number, tax_id, phone_number, address, bank_account, card_number, username, ip_address, secret, api_key, entre otras).
- Cobertura reforzada de identificadores taiwaneses: numero de identidad nacional, numero de cuenta fiscal (incluido el digito de control), tarjeta de salud, telefono movil y fijo local, direcciones en chino, matriculas de vehiculo, numeros de permiso de conducir, LINE ID y PTT ID.
- Redaccion o enmascaramiento de PII como flujo derivado: la model card incluye un ejemplo funcional que sustituye cada span por una etiqueta entre corchetes.
- Umbral de decision ajustable (threshold) para desplazar el equilibrio entre precision y recall segun el caso de uso.
- Capacidades multilingues: heredadas del modelo base multilingue, pero no evaluadas ni verificadas en la ficha para idiomas distintos del chino tradicional.
- Tool calling, function calling, agentes, generacion de texto, razonamiento, codigo, matematicas, vision y audio: no disponibles. Es un modelo discriminativo de extraccion de spans, no generativo.

## Casos de uso

- Desidentificacion de expedientes clinicos: antes de almacenar o compartir historiales, el modelo detecta nombres, numeros de tarjeta de salud y telefonos con recalls declarados del 93,4 %, 97,4 % y 97,2 % respectivamente, lo que permite enmascarar los campos antes de que el documento salga del entorno controlado.
- Cumplimiento normativo en tramitacion de documentos: en contratos y escrituras con numeros de identidad (98,9 % de recall en OOD) y numeros de cuenta fiscal, el modelo localiza los identificadores legales para generar versiones publicables con los datos suprimidos.
- Anonimizacion de logs y tickets de soporte: aplicado en linea sobre registros de aplicacion, detecta ip_address, email, phone_number y private_url, de modo que los ficheros de diagnostico puedan compartirse con terceros o proveedores sin filtrar datos de clientes.
- Saneado de corpus para entrenamiento de modelos: como paso previo a ingerir documentacion interna en un pipeline de RAG o de ajuste fino, se ejecuta el extractor y se sustituyen los spans por marcadores, reduciendo el riesgo de memorizacion de PII por parte del modelo final.
- Moderacion y publicacion de contenido en foros: la deteccion especifica de PTT ID y LINE ID (98,9 % y 100 % de recall en OOD) permite avisar al usuario o censurar identificadores de terceros antes de publicar un mensaje.
- Prevencion de fugas en procesos financieros: con las etiquetas bank_account, account_number y card_number, el modelo sirve como filtro en formularios y correos para bloquear el envio de numeros de cuenta o tarjeta en canales no cifrados.
- Enrutado y clasificacion documental: dado que devuelve las etiquetas detectadas con confianza, puede alimentar un clasificador posterior que decida si un documento requiere revision humana antes de ser procesado automaticamente.

## Benchmarks y rendimiento

Evaluacion sobre lianghsun/tw-PII-bench (split mid, 300 elementos), comparando el modelo base sin ajustar (zero-shot) con el adaptador ajustado:

| Metrica | Baseline (zero-shot) | Ajustado (GLiNER2-TW) | Delta |
|---|---|---|---|
| Micro F1 estricto dentro del esquema | 44,3 % | 56,8 % | +12,5 puntos |
| Micro F1 con limites relajados (IoU >= 0,5) | 49,6 % | 65,0 % | +15,4 puntos |
| Tasa de generalizacion OOD en Taiwan | 64,7 % | 97,8 % | +33,1 puntos |
| Falsos positivos en negativos dificiles por elemento | 0,00 | 0,00 | 0,00 |

Recall declarado por tipo de entidad en el modelo ajustado:

| Entidad | Recall |
|---|---|
| Nombre de persona | 93,4 % |
| Telefono | 97,2 % |
| Email | 95,8 % |
| Numero de identidad nacional | 98,9 % |
| Tarjeta de salud | 97,4 % |
| Matricula de vehiculo | 100,0 % |
| Permiso de conducir | 100,0 % |
| LINE ID | 98,9 % |
| PTT ID | 100,0 % |

El F1 estricto del 56,8 % es notablemente bajo en terminos absolutos; la diferencia frente al F1 relajado (65,0 %) indica que una parte relevante del error se concentra en los limites exactos del span, no en la deteccion del fragmento. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 205 M de parametros ocupa aproximadamente 0,4 GB en FP16 (estimacion derivada del recuento de parametros; no confirmada por el autor). Con activaciones, tokenizador y overhead del runtime, un presupuesto de 1 a 2 GB de VRAM es suficiente para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Sirven desde una GTX 1650 o una RTX 3050 hasta A100 o H100; en estas ultimas el cuello de botella sera la CPU de preprocesado, no la GPU.
- Inferencia en CPU: viable dado el tamano del modelo; es el escenario habitual para pipelines de redaccion por lotes donde la latencia no es critica.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, incluidos portatiles con graficos integrados en modo CPU.
- Opciones de despliegue: la via documentada es la libreria gliner2 (>= 0.2.0) con PyTorch, transformers y peft, cargando el modelo base con AutoExtractor.from_pretrained y aplicando el adaptador mediante load_adapter. Requiere inyectar CharLevelSplitter como divisor de palabras. vLLM, TGI, llama.cpp y Ollama no aplican: son runtimes para modelos generativos/decoder, no para este encoder de clasificacion de spans.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida del numero de etiquetas solicitadas, ya que el modelo evalua cada etiqueta contra el texto.
- Nota de produccion: para textos de mas de 512 caracteres hay que segmentar con ventana deslizante y solapamiento, lo que multiplica linealmente el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tw-PII-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a5566qq123/gliner2-tw-pii | 205 M (base) + LoRA | No disponible; segmentacion recomendada a partir de 512 caracteres | F1 estricto 56,8 %; F1 relajado 65,0 %; OOD 97,8 % | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| fastino/gliner2-privacy-filter-PII-multi | 205 M | No disponible | F1 estricto 44,3 %; F1 relajado 49,6 %; OOD 64,7 % | No disponible en la informacion proporcionada | HuggingFace, modelo base publico |
| Otros detectores PII multilingues (por ejemplo, aproximaciones basadas en reglas o modelos NER multilingues) | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento de alternativas de terceros, por lo que la comparativa cuantitativa se limita al modelo base frente al adaptador ajustado. La mejora mas significativa del ajuste taiwanes se produce en la generalizacion OOD (+33,1 puntos), no en el F1 estricto.

## Limitaciones y advertencias

- El uso de CharLevelSplitter es obligatorio para chino tradicional. Si se omite, el divisor por espacios por defecto provoca fallos de extraccion en frases largas y desplazamientos en los limites de entidad.
- Los textos de mas de 512 caracteres requieren segmentacion con ventana deslizante y solapamiento; sin ese preprocesado la calidad cae o la extraccion falla.
- El F1 estricto del 56,8 % implica que una fraccion relevante de las entidades detectadas no tiene limites exactos. En pipelines de redaccion automatica esto puede dejar fragmentos de PII sin cubrir si el reemplazo se hace por limites de span.
- La ventana de contexto no esta declarada de forma explicita, lo que dificulta dimensionar el despliegue sin pruebas propias.
- El umbral por defecto es 0,5. Con umbrales mas bajos (0,35-0,4) aumenta el recall a costa de la precision; la eleccion debe validarse con datos propios del dominio.
- El modelo solo ha sido evaluado en chino tradicional de Taiwan. Su comportamiento en chino simplificado u otros idiomas no esta verificado en la informacion disponible, aunque el modelo base sea multilingue.
- Los resultados declarados proceden de un unico conjunto de evaluacion (tw-PII-bench, 300 elementos) y de un autor que es tambien el creador del modelo; no hay validacion independiente.
- Los datos de entrenamiento son sinteticos (PII-Synthea), lo que puede introducir un sesgo de distribucion frente a textos reales con formatos atipicos, errores tipograficos o mezclas de idiomas.
- Riesgo de alucinacion en sentido estricto no aplica, ya que no genera texto; el riesgo equivalente es la deteccion de falsos positivos, que el autor reporta como cero en negativos dificiles pero que no esta garantizado en dominios no evaluados.
- Licencia Apache-2.0 en el adaptador, permisiva para uso comercial. La licencia del modelo base no se especifica en la informacion disponible y conviene verificarla antes de un despliegue comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe validacion de la comunidad ni historial de incidencias en produccion.
- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base, y su comportamiento queda ligado a la version de la libreria gliner2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a5566qq123/gliner2-tw-pii
- Modelo base: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Conjunto de evaluacion tw-PII-bench: https://huggingface.co/datasets/lianghsun/tw-PII-bench
- Libreria de inferencia: paquete gliner2 (instalable con pip, sin URL documentada en la informacion disponible)
- Cita del autor (BibTeX en la model card): GLiNER2-TW-PII: Taiwan Localized PII Detection via Synthetic Fine-Tuning, Chin-Lin Lee, 2026
- Cita del modelo base (BibTeX en la model card): GLiNER2-PII: Multilingual PII Extraction via Synthetic Fine-Tuning, Fastino AI Team, 2026
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con la ficha.
