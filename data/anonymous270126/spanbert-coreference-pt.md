# anonymous270126/SpanBERT-Coreference-pt

## Resumen

SpanBERT-Coreference-pt es un modelo de resolución de correferencia en portugués, desarrollado por el usuario anonymous270126, especializado en actas de reuniones municipales portuguesas. Su función es identificar cuándo distintas expresiones de un documento (un nombre propio, un cargo, un pronombre o una abreviatura) se refieren a la misma entidad del mundo real, agrupándolas en clústeres coherentes. Esto permite una pseudonimización consistente a lo largo de documentos administrativos extensos, un requisito habitual en el tratamiento de datos personales bajo normativa de protección de datos.

El modelo parte del encoder neuralmind/bert-base-portuguese-cased, al que se aplica un preentrenamiento continuado de tipo SpanBERT y un ajuste fino con una arquitectura de mention-ranking (Lee et al., 2017). Cuenta con 108.310.272 parámetros según los pesos publicados en safetensors, aunque la model card indica aproximadamente 110 M para el encoder más 25 M para las cabezas de correferencia. Trabaja con una ventana de 512 tokens y un stride de 128, lo que le permite procesar documentos completos de hasta unos 28.000 tokens mediante ventana deslizante con solapamiento.

Es relevante porque aborda un problema poco cubierto en portugués: la correferencia en documentos administrativos formales, con 17 categorías de entidad definidas y una integración pensada como segunda etapa de un pipeline de anonimización que arranca con un modelo NER. El repositorio es de publicación reciente, sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT/SpanBERT) con cabezas de mention-ranking para correferencia |
| Parametros totales | 108.310.272 (safetensors); la model card declara ~110 M encoder + ~25 M cabezas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de 512 tokens con stride de 128; documentos de hasta ~28.000 tokens mediante ventana deslizante |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | Portugues (pt) |
| Licencia | custom-agplv3-dual-license (licencia dual AGPLv3, enlace en la model card) |
| Formato de pesos | safetensors |
| Modelo base | neuralmind/bert-base-portuguese-cased |
| Pipeline | token-classification |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo combina un encoder SpanBERT preentrenado en portugués con una arquitectura de mention-ranking heredada de Lee et al. (2017). Cada mención o span se representa concatenando el estado oculto del primer token, el del último, una representación de head attention y un embedding de anchura, lo que da un vector de 2324 dimensiones: `[h_start ; h_end ; head_attn ; width_emb] = [768 ; 768 ; 768 ; 20]`. La puntuación de antecedente se calcula como `score(i,j) = mention_score(i) + mention_score(j) + antecedent_score([vi ; vj ; vi*vj ; dist_emb])`, es decir, con una función que combina las representaciones de ambas menciones, su producto elemento a elemento y un embedding de distancia. Los clústeres finales se construyen con un algoritmo Union-Find, restringido a spans de la misma clase NER y a pares cuya puntuación supera un umbral.

El ajuste fino se realizó con 120 actas de reuniones municipales portuguesas procedentes de 6 municipios, con un total aproximado de 1,3 millones de tokens. La distribución de clústeres del conjunto de entrenamiento está muy desbalanceada: PERSONAL-ADMIN (273), PERSONAL-NAME (259) y PERSONAL-POSITION (174) concentran la mayoría de las 998 agrupaciones totales, mientras que categorías como PERSONAL-ARTISTIC (1), PERSONAL-FAMILY (2) o PERSONAL-TIME (3) apenas tienen ejemplos. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo y no generativo. El entrenamiento se realizó con PyTorch y la librería Transformers.

## Capacidades

- Resolución de correferencia en portugués sobre texto administrativo formal, agrupando menciones que designan la misma entidad.
- Cobertura de 17 categorías de entidad: PERSONAL-NAME, PERSONAL-ADMIN, PERSONAL-POSITION, PERSONAL-ADDRESS, PERSONAL-LOCATION, PERSONAL-DATE, PERSONAL-COMPANY, PERSONAL-INFO, PERSONAL-DEGREE, PERSONAL-TIME, PERSONAL-LICENSE, PERSONAL-JOB, PERSONAL-VEHICLE, PERSONAL-FACULTY, PERSONAL-FAMILY, PERSONAL-ARTISTIC y PERSONAL-OTHER.
- Procesamiento de documentos largos (hasta ~28.000 tokens) mediante codificación con ventana deslizante y solapamiento.
- Salida orientada a pseudonimización consistente: asignación de identificadores estables por clúster a lo largo de todo el documento, por ejemplo `<NAME-1>` o `<ADMIN-1>`.
- Integración en un pipeline de dos etapas: primero detección de spans mediante un modelo NER (liaad/CitiLink-XLMR-Anonymization-pt) y después agrupación de correferencia con este modelo.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades de visión ni audio.
- Uso monolingüe: solo portugués, sin capacidades multilingües documentadas.

## Casos de uso

- Anonimización de actas municipales: el modelo detecta que un nombre completo, un nombre abreviado y un pronombre se refieren a la misma persona, permitiendo sustituirlos por un identificador único en todo el documento y evitando reidentificaciones parciales.
- Cumplimiento del RGPD en administración pública: al agrupar menciones de datos personales (NIF, direcciones, matrículas) bajo un mismo clúster, facilita la seudonimización coherente exigida antes de publicar documentos oficiales.
- Indexación y búsqueda sobre archivos históricos: los clústeres de correferencia permiten construir índices que relacionan todas las menciones de un mismo proceso administrativo o de una misma persona en un corpus de actas.
- Preprocesado para resumen automático de reuniones: al normalizar las referencias a entidades, se reduce la ambigüedad del texto de entrada a modelos de resumen o extracción de acuerdos.
- Enriquecimiento de sistemas de gestión documental: la salida de clústeres puede alimentar bases de datos relacionales que vinculan números de proceso, personas, cargos y ubicaciones citados en distintos documentos.
- Auditoría de consistencia documental: detectar menciones del mismo proceso o entidad con identificadores inconsistentes a lo largo de un expediente extenso, algo útil en revisiones administrativas.
- Investigación en procesamiento de lenguaje natural para portugués: sirve como punto de partida o baseline para estudios de correferencia en dominios administrativos, donde los recursos anotados son escasos.
- Construcción de pipelines híbridos de anonimización: combinado con el modelo NER de la primera etapa, permite montar un servicio completo de redacción de datos personales en documentos de entrada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test:

| Metrica | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|
| MUC | 90,20 | 92,80 | 91,50 |
| B3 | 86,70 | 92,50 | 89,50 |
| CEAF-e | 89,20 | 74,40 | 81,20 |
| CoNLL F1 | — | — | 87,40 |
| LEA | 64,80 | 88,20 | 74,80 |

No se han publicado en la informacion disponible comparaciones de estos resultados con otros modelos de correferencia en portugues, ni resultados sobre conjuntos de referencia estandar como OntoNotes o CorefUD.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 108,3 M de parametros ocupan aproximadamente 0,43 GB; en fp16 unos 0,22 GB; en int8 unos 0,11 GB. A esto hay que sumar la memoria de activaciones y la gestion de la ventana deslizante, que escala con el numero de fragmentos procesados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp32. Una RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas; las GPU de gama alta solo aportan ventaja en throughput al procesar muchos documentos en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida. Tambien es viable en CPU.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, es compatible con Hugging Face Transformers, PyTorch, Text Embeddings Inference y servidores de inferencia genericos. No se documentan variantes GGUF, por lo que llama.cpp u Ollama requeririan conversion previa. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este pipeline, aunque podrian servir para el encoder.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, el coste dominante no es la inferencia del encoder por ventana, sino el numero de ventanas necesarias para cubrir documentos de decenas de miles de tokens y el coste del scoring de pares de menciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpanBERT-Coreference-pt | 108,3 M | 512 tokens por ventana, ~28.000 tokens por documento | Correferencia en portugues administrativo | custom-agplv3-dual-license | Hugging Face |
| neuralmind/bert-base-portuguese-cased | no disponible | 512 tokens | Encoder base en portugues, sin cabezas de correferencia | no disponible en la informacion proporcionada | Hugging Face |
| liaad/CitiLink-XLMR-Anonymization-pt | no disponible | no disponible | Deteccion NER de entidades para anonimizacion | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita a su papel dentro del pipeline: el modelo NER identifica los spans y este modelo resuelve que spans comparten referente.

## Limitaciones y advertencias

- Modelo discriminativo, no generativo: no puede usarse para generar texto, responder preguntas ni mantener conversaciones.
- Dominio muy restringido: el ajuste fino se hizo exclusivamente con actas de reuniones municipales portuguesas, por lo que el rendimiento fuera de ese genero (prensa, literatura, conversacion) puede degradarse de forma notable.
- Desbalanceo severo de clases: diez de las diecisiete categorias tienen menos de veinte clústeres en entrenamiento, y varias tienen menos de cinco, lo que implica un riesgo alto de baja calidad en esas categorias.
- Cobertura linguistica limitada al portugues. No hay soporte para otras lenguas ni para variantes no administrativas.
- Dependencia de una etapa previa de NER: los errores del modelo de deteccion de entidades se propagan directamente a la correferencia, ya que los clústeres se restringen a spans de la misma clase NER.
- Riesgo de alucinacion de agrupaciones: como cualquier modelo de mention-ranking, puede unir menciones que no comparten referente (falsos positivos) o separar menciones que si lo hacen, especialmente con entidades poco frecuentes o nombres ambiguos.
- Restricciones de licencia: la licencia declarada es dual AGPLv3, lo que en la practica impone obligaciones de copyleft fuerte si se integra en un servicio de red. Es imprescindible revisar el texto completo de la licencia antes de un uso comercial.
- Dato de trazabilidad dudoso: la fecha de creacion registrada en el repositorio es 2026-10-12, posterior a la fecha habitual de publicacion, lo que conviene verificar.
- Ausencia de validacion externa: cero descargas y cero valoraciones, sin resultados en conjuntos de referencia estandar de correferencia, por lo que no hay evidencia independiente de su calidad.
- Idiomas distintos del portugues no estan soportados, lo que limita su uso en organismos bilingues o en corpus multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anonymous270126/SpanBERT-Coreference-pt
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Modelo NER de la primera etapa del pipeline: https://huggingface.co/liaad/CitiLink-XLMR-Anonymization-pt
- Licencia referenciada en la model card: https://huggingface.co/inesctec/CitiLink-SpanBERT-Coreference-pt/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
