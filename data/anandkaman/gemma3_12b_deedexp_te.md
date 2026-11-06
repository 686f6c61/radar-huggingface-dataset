# anandkaman/gemma3_12b_deedexp_te

## Resumen

`anandkaman/gemma3_12b_deedexp_te` es un adaptador LoRA (QLoRA, rango 16) sobre Gemma 3 12B Instruct, publicado por el desarrollador independiente anandkaman, especializado en extracción estructurada de información a partir del OCR de documentos de propiedad inmobiliaria del estado indio de Andhra Pradesh. El modelo recibe el texto OCR de una escritura y devuelve un único objeto JSON con las partes intervinientes y sus identificadores, los datos de la propiedad, los importes y los detalles de registro. Es el hermano para telugu del adaptador `anandkaman/gemma3_12b_deedexp`, entrenado por separado para documentos de Karnataka.

La relevancia del modelo es acotada pero concreta: se trata de un especialista de dominio, no de un modelo generalista. El autor documenta explícitamente el proceso de etiquetado, las reglas de negocio que el modelo debe respetar (por ejemplo, que un testigo nunca es parte, o que los nombres citados en transacciones anteriores no son partes de la venta actual) y una evaluación sobre 11 documentos retenidos. La licencia es Gemma, heredada del modelo base, y los pesos se distribuyen como adaptador PEFT en safetensors (0,3 GB de repositorio).

El contexto de entrenamiento es de 11 008 tokens y el modelo se ejecuta en unos 11,4 GB de VRAM en cuantización de 4 bits, lo que lo sitúa al alcance de GPUs de consumo alto. No hay métricas de benchmarks estándar (MMLU, HumanEval, GSM8K) publicadas; la única evaluación disponible es la específica de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre el modelo base |
| Parametros totales | 12 000 millones (modelo base Gemma 3 12B); el adaptador LoRA no se especifica en número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 11 008 tokens (ventana de entrenamiento); el modelo base Gemma 3 12B soporta contextos mayores, pero el adaptador se entrenó con `max_seq_length=11008` |
| Tipos de cuantizacion | 4 bits (QLoRA, `load_in_4bit=True`); el adaptador se aplica sobre `unsloth/gemma-3-12b-it-bnb-4bit`. Otras cuantizaciones no documentadas |
| Idiomas soportados | telugu (te), inglés (en) |
| Licencia | Gemma (términos de la licencia Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en formato bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA de rango 16 sobre `unsloth/gemma-3-12b-it-bnb-4bit`, es decir, sobre Gemma 3 12B Instruct cuantizado a 4 bits mediante bitsandbytes. El conjunto de entrenamiento es pequeño y muy específico: 49 documentos y 60 filas, con 36 pasos de entrenamiento. No se detalla la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el autor indica únicamente que las etiquetas se derivaron de la endoso de registro de cada documento en lugar del registro acompañante, lo que corrigió 11 intercambios de rol comprador/vendedor y eliminó 5 testigos identificativos que un etiquetado derivado del registro había registrado como partes.

La innovación técnica destacable no está en la arquitectura, sino en el diseño del etiquetado y de las reglas: el modelo aprende a asignar roles por lo que hace cada parte (ejecutante = vendedor, reclamante = comprador, testigo = ninguno) y no por su posición en la página, a no tratar testigos ni apoderados como partes, a excluir a personas mencionadas en transacciones anteriores y a devolver `null` en lugar de inventar datos cuando un campo no está en el documento. Se entrenan tres prompts con el mismo bloque de reglas que difieren en una frase que nombra el esquema a devolver: completo, solo partes y solo propiedad/registro. El 18 % de las filas de entrenamiento son variantes de subconjunto, lo que según el autor también mejora la precisión por campo del esquema completo.

## Capacidades

- Extracción de información estructurada: devuelve un objeto JSON con partes, identificadores, propiedad, importes y detalles de registro a partir de OCR de escrituras de Andhra Pradesh.
- Salida JSON con garantía de parseo: 0 de 11 fallos de parseo en la evaluación publicada.
- Tres esquemas de salida entrenados: completo, solo partes (comprador, vendedor, parte confirmante) y solo propiedad y registro.
- Asignación de roles basada en la función de la parte, no en su posición en el documento.
- Manejo explícito de datos ausentes: devuelve `null` en lugar de inventar valores.
- Capacidades multilingües limitadas a telugu e inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Digitalización de registros de propiedad de Andhra Pradesh: el modelo convierte el OCR de escrituras en JSON estructurado listo para ingestión en bases de datos, con campos de partes, propiedad, importes y registro.
- Automatización de due diligence inmobiliaria: dado un lote de escrituras, se extraen comprador, vendedor, fecha de registro y oficina de registro para verificar cadenas de titularidad; el esquema de subconjunto "solo partes" reduce la latencia aproximadamente a la mitad al generar una respuesta de 465 caracteres frente a 1017.
- Extracción de importes para cálculo de impuestos: el modelo recupera el precio de venta y, con menor fiabilidad, el timbre y la tasa de registro (9/11 exactos en la evaluación), útil como primer paso de un pipeline de liquidación tributaria con revisión humana.
- Procesamiento por lotes con contexto largo: con 11 008 tokens de ventana y 11,4 GB de VRAM en 4 bits, cabe en una GPU de consumo alto y permite procesar documentos largos truncando el OCR por el medio y conservando el bloque de instrucciones y los extremos del documento.
- Enriquecimiento de bases de datos catastrales: el JSON de salida se puede mapear directamente a un esquema relacional de partes y transacciones, con `null` como valor por defecto para campos ausentes.
- Validación de etiquetados existentes: el modelo puede usarse para detectar intercambios de rol comprador/vendedor en registros ya digitalizados; el autor documenta 0 intercambios en los 11 documentos de evaluación.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 11 documentos retenidos, ninguno visto en entrenamiento, con etiquetas derivadas de los propios documentos:

| Métrica | Resultado |
|---|---|
| Intercambios de rol comprador/vendedor | 0 |
| Número de compradores exacto | 11/11 |
| Número de vendedores exacto | 11/11 |
| Precio de venta exacto | 11/11 |
| Fecha de registro exacta | 11/11 |
| Oficina de registro exacta | 11/11 |
| Estado exacto | 11/11 |
| Timbre exacto | 9/11 |
| Tasa de registro exacta | 9/11 |
| Nombres de partes recuperados | 24/32 |
| Salida no parseable como JSON | 0/11 |

El autor advierte que n = 11 frente a los 60 del modelo hermano de kannada, que los documentos son los más difíciles por construcción (retenidos por longitud, que correlaciona con el número de partes) y que 6 de los 11 prompts superan la ventana de 11 000 tokens, por lo que parte del OCR se trunca en generación. Los campos `pincode` y dirección de la finca puntúan 0 y el autor los atribuye a una convención de etiquetado no resuelta en el registro fuente, no a una debilidad del modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,4 GB en cuantización de 4 bits, según el autor.
- GPU recomendadas: no se especifican modelos concretos; por el consumo de VRAM, encaja en GPUs de consumo alto con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, con al menos 12 GB de VRAM en 4 bits.
- Opciones de despliegue: el autor documenta el uso con la librería `unsloth` (`FastLanguageModel`, `load_in_4bit=True`, `max_seq_length=11008`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador en la información disponible.
- Latencia y throughput: no se publican cifras absolutas; el autor indica que el esquema de subconjunto es aproximadamente 2 veces más rápido que el completo porque la decodificación es secuencial y la salida es un 46 % del tamaño (465 frente a 1017 caracteres de media).
- Decodificación: greedy (`do_sample=False`), `max_new_tokens=2600`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anandkaman/gemma3_12b_deedexp_te` | 12B (base) + LoRA | 11 008 tokens (entrenamiento) | Extracción de escrituras de Andhra Pradesh (telugu) | Gemma | Hugging Face (adaptador PEFT) |
| `anandkaman/gemma3_12b_deedexp` | 12B (base) + LoRA | no disponible en la información | Extracción de escrituras de Karnataka (kannada) | Gemma | Hugging Face (adaptador PEFT) |
| Gemma 3 12B Instruct (`google/gemma-3-12b-it`) | 12B | no disponible en la información | Generación de texto general, instrucciones | Gemma | Hugging Face |

El modelo hermano de kannada se entrenó sobre 60 documentos y comparte la misma base y metodología QLoRA; el autor lo presenta como un especialista separado, no como un modelo multiestado, porque el idioma del documento, la tabla de tasas y el vocabulario de roles difieren. No se dispone de datos de benchmarks comparativos entre ambos ni frente al Gemma 3 12B Instruct sin adaptar.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre documentos de propiedad de Andhra Pradesh en telugu; no es un modelo multiestado ni multilingüe general.
- Evaluación con n = 11: la muestra es pequeña y los documentos son los más difíciles por construcción, por lo que las métricas no deben extrapolarse sin validación propia.
- Truncamiento de contexto: 6 de los 11 documentos de evaluación superan la ventana de 11 008 tokens; el autor recomienda cortar el OCR por el medio conservando el bloque de instrucciones y los extremos del documento.
- Campos no fiables: `pincode` y dirección de la finca puntúan 0 por una convención de etiquetado no resuelta; el timbre y la tasa de registro alcanzan 9/11 exactos, por lo que requieren revisión humana en producción.
- Nombres de partes: se recuperan 24 de 32, por lo que la extracción de nombres no es exhaustiva.
- Riesgo de alucinación: el modelo se entrenó para devolver `null` ante datos ausentes, pero no hay una evaluación independiente de la tasa de invención fuera del conjunto de prueba del autor.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma del modelo base, que incluyen restricciones de uso aceptable; conviene revisarlos antes de desplegar.
- Datos de entrenamiento no publicados: no se publica texto de documentos, identificadores ni nombres de partes del corpus de entrenamiento, lo que limita la reproducibilidad del etiquetado.
- Sin soporte documentado de tool calling, agentes ni otras modalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandkaman/gemma3_12b_deedexp_te
- Modelo hermano (kannada): https://huggingface.co/anandkaman/gemma3_12b_deedexp
- Modelo base: https://huggingface.co/unsloth/gemma-3-12b-it-bnb-4bit
- Ficha en free2aitools: https://free2aitools.com/model/anandkaman/gemma3_12b_deedexp
- Endpoint en FriendliAI: https://friendli.ai/models/anandkaman/gemma3_12b_deedexp
- Contacto del autor: kamananand98@gmail.com
