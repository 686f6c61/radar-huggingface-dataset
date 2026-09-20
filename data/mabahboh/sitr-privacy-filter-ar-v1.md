# mabahboh/sitr-privacy-filter-ar-v1

## Resumen
Sitr (سِتر) es un clasificador de tokens para la detección de información personal identificable (PII) en árabe, adaptado a los formatos de Arabia Saudí, el Golfo y el Levante. Lo desarrolla el usuario `mabahboh` y se construye mediante fine-tuning sobre el modelo base `openai/privacy-filter`, usando el conjunto de datos `mabahboh/sitr-arabic-pii`. Resuelve un problema concreto: la mayoría de los filtros de PII existentes están pensados para texto en inglés y no reconocen identificadores regionales como la *iqama* saudí, el *Emirates ID*, el *Qatar QID* o los IBAN del Golfo.

El modelo es un clasificador de tokens (pipeline `token-classification`) que distingue 43 clases finas mapeadas sobre 8 clases base, lo que permite dos niveles de redacción: uno granular y otro orientado a enmascarar cualquier identificador. Cuenta con 1.399.521.479 parámetros (~1,4 B) en formato safetensors, con licencia Apache 2.0 y soporte para árabe e inglés. Su relevancia actual radica en que ofrece una capa de des-identificación específica para la región antes de enviar texto a modelos externos, un paso crítico para el cumplimiento normativo (por ejemplo, la PDPL saudí) en pipelines de datos.

Es, además, un ejemplo de adaptación eficiente: se entrenó con LoRA sobre las proyecciones de atención y se fusionó en los pesos base, sin tocar el enrutado de expertos del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de clasificación de tokens (token-classification); backbone de tipo Mixture-of-Experts segun la model card. Adaptadores LoRA fusionados sobre las proyecciones de atencion |
| Parametros totales | 1.399.521.479 (~1,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso una longitud maxima de secuencia de 512 tokens con stride 128) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `openai/privacy-filter` y aplica un ajuste fino con LoRA (r=16, alpha=32, dropout=0.05) sobre los modulos `k_proj`, `o_proj`, `q_proj` y `v_proj` de la atención, que despues se fusionan en los pesos base. La model card indica que el backbone es de tipo Mixture-of-Experts y subraya que, al limitar la adaptacion a las proyecciones de atención, los pesos de enrutado de expertos quedan intactos: la asignación de expertos no cambia ni con el entrenamiento ni con la fusión. El entrenamiento uso 3 epocas, learning rate 0,0002, batch efectivo de 32 y longitud maxima de 512 tokens con stride 128.

La innovación principal está en el tratamiento de las dos taxonomías. En lugar de añadir una segunda cabeza para las clases base, el modelo usa una única cabeza sobre las 43 clases finas y **marginaliza** la señal de clase base a partir de los mismos logits: la probabilidad de una clase base es la suma de las probabilidades de todas las clases finas que se pliegan en ella. De este modo ambos niveles no pueden contradecirse. Durante el entrenamiento se añadió una pérdida auxiliar de clase base con peso 0,3. El repositorio incluye un fichero `label_scheme.json` que permite reproducir exactamente el colapso de las 43 clases finas a las 8 base. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades
- Detección de PII en arabe con 43 clases finas etiquetadas en formato BIO sobre 87 etiquetas en total.
- Identificadores regionales especificos: `iqama`, `emirates_id`, `kuwait_civil_id`, `oman_civil_id`, `qatar_qid`, `bahrain_cpr`, `syria_national_id`, `national_id`.
- Identificadores financieros: `gulf_iban`, `credit_card`, `account_number`, `card_cvv`, `card_pin`.
- Secretos y credenciales: `access_token`, `api_key`, `password`, `db_connection`, `otp_code`.
- Datos de contacto y localizacion: `private_email`, `private_phone`, `gulf_phone`, `syria_phone`, `private_address`, `national_address`, `short_address`, `postal_code`, `building_number`, `boundary_number`.
- Documentos administrativos: `commercial_registration`, `contract_number`, `deed_number`, `passport_number`, `insurance_policy`, `medical_record_number`, `employee_id`, `vehicle_plate`, `visitor_number`.
- Formas habladas de identificadores: `spoken_iqama`, `spoken_national_id`, `spoken_otp`, `spoken_phone` (pensadas para transcripciones de voz).
- Nivel base (8 clases: `account_number`, `national_id`, `other`, `private_address`, `private_date`, `private_email`, `private_phone`, `secret`) para redaccion agnostica al subtipo.
- Capacidad bilingue arabe/ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente: es un clasificador, no un modelo generativo.

## Casos de uso
- Redaccion previa a LLM externo: insertar el modelo como paso de filtrado antes de enviar prompts de usuarios araboparlantes a un modelo de terceros, de modo que identificadores como la *iqama* o el telefono queden enmascarados antes de salir del perimetro.
- Cumplimiento de la PDPL saudí: auditar y des-identificar registros internos con identificadores nacionales y direcciones nacionales (`national_address`) antes de almacenarlos o compartirlos con proveedores.
- Anonimizacion de historiales clinicos: eliminar `medical_record_number`, `insurance_policy`, `medicine_name` y datos de contacto en textos clinicos en arabe, reduciendo la exposicion en entornos sanitarios.
- Proteccion de datos financieros en soporte: detectar `gulf_iban`, `credit_card`, `card_cvv` y `account_number` en conversaciones de banca o comercio electronico para evitar su filtrado en transcripciones y tickets.
- Saneado de logs y documentacion tecnica: localizar `api_key`, `password`, `access_token` y `db_connection` en logs de aplicaciones o repositorios antes de exportarlos a herramientas de analisis.
- Deteccion de fraude y OTP en tiempo real: marcar `otp_code`, `spoken_otp` y `card_pin` en flujos de verificacion por telefono o por mensaje, para alertar cuando un OTP aparece en texto no autorizado.
- Enmascarado de correo y documentos legales: `contract_number`, `deed_number`, `commercial_registration` y `private_email` en expedientes administrativos antes de su archivado o cesion.
- Procesamiento de transcripciones de voz: aprovechar las clases `spoken_*` para des-identificar llamadas transcritas en centros de contacto del Golfo.

## Benchmarks y rendimiento
La model card publica resultados a nivel de entidad sobre el split de test reservado. Un span cuenta solo si coinciden tanto los limites como la clase, y los splits se particionan por familia de documentos para evitar casi-duplicados entre entrenamiento y test.

| Nivel | Precision | Recall | F1 |
|---|---|---|---|
| Clases finas (43) | 0,629 | 0,776 | 0,694 |
| Clases base (8) | 0,788 | 0,852 | 0,818 |

Resultados por clase (extracto; la model card advierte de que las clases con menos de 50 spans de test son solo indicativas):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `private_email` | 0,925 | 0,966 | 0,945 | 293 |
| `national_address` | 0,916 | 0,974 | 0,944 | 156 |
| `account_number` | 0,917 | 0,981 | 0,948 | 213 |
| `private_date` | 0,882 | 0,940 | 0,910 | 215 |
| `short_address` | 0,901 | 0,924 | 0,912 | 79 |
| `insurance_policy` | 0,847 | 0,936 | 0,890 | 172 |
| `credit_card` | 0,820 | 0,934 | 0,874 | 122 |
| `private_phone` | 0,744 | 0,893 | 0,812 | 488 |
| `emirates_id` * | 1,000 | 1,000 | 1,000 | 18 |
| `national_id` | 0,751 | 0,890 | 0,815 | 390 |
| `medicine_name` | 0,000 | 0,000 | 0,000 | 57 |
| `private_address` | 0,188 | 0,032 | 0,055 | 93 |
| `gulf_phone` * | 0,093 | 0,154 | 0,116 | 26 |
| `bahrain_cpr` * | 0,059 | 0,091 | 0,071 | 11 |
| `syria_phone` * | 0,025 | 0,045 | 0,032 | 22 |
| `spoken_iqama` * | 0,010 | 0,059 | 0,017 | 17 |

`*` menos de 50 spans de test: valor indicativo, no una medicion fiable.

La propia model card recomienda leer primero el recall, ya que un span no detectado supone que un identificador personal llega a un modelo externo, un error irreversible, mientras que un falso positivo solo sobredimensiona la redaccion. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en FP16: aproximadamente 2,8 GB solo de pesos, con un total de inferencia del orden de 3,5 a 4 GB incluyendo activaciones y overhead.
- En cuantizacion de 8 bits: en torno a 1,4 GB de pesos; en 4 bits, aproximadamente 0,7 a 1 GB (no se publican variantes cuantizadas oficiales, por lo que son estimaciones segun el tamano).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060/4070, RTX 4090, e incluso en tarjetas de 6-8 GB en cuantizacion de 8 o 4 bits.
- Es viable la inferencia en CPU para lotes pequenos, dado el tamano del modelo.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S o A10G.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, vLLM o TGI para servir en lote; seria necesario convertir a GGUF para llama.cpp u Ollama, ya que no se publican pesos en ese formato.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `mabahboh/sitr-privacy-filter-ar-v1` | 1,4 B | no disponible | ar, en | Apache 2.0 | 43 clases finas, enfoque regional Golfo/Levante, F1 base 0,818 |
| `openai/privacy-filter` (modelo base) | no disponible | no disponible | no disponible | no disponible | Base sobre la que se aplica LoRA; backbone MoE segun la model card |
| Otros clasificadores de PII multilingues | no disponible | no disponible | no disponible | no disponible | No se han encontrado comparables directos en la informacion proporcionada |

No se dispone de datos de benchmark comparativos entre este modelo y alternativas de la misma categoria en la informacion facilitada.

## Limitaciones y advertencias
- No es una garantia de cumplimiento: la model card indica explicitamente que reduce la exposicion, pero no certifica que un sistema sea anonimo ni conforme con la PDPL.
- No cubre nombres de personas: el apartado de limitaciones menciona que `private_person` no esta contemplado (el texto de la model card aparece truncado en este punto).
- Rendimiento bajo en varias clases: `medicine_name` (F1 0,000), `spoken_iqama` (0,017), `syria_phone` (0,032), `private_address` (0,055), `bahrain_cpr` (0,071), `gulf_phone` (0,116) y `card_pin` (0,167) son especialmente debiles y no deberian usarse como unico control.
- Muchas clases se evaluan con menos de 50 spans de test y los propios autores las marcan como indicativas, no como mediciones fiables.
- Brecha entre niveles: el F1 de clases finas (0,694) es notablemente inferior al de clases base (0,818). Si el objetivo es redactar y no clasificar subtipos, conviene operar a nivel base.
- El modelo esta orientado a arabe e ingles; no se documenta cobertura de otros idiomas ni de variantes dialectales mas alla de lo indicado.
- Al ser un clasificador y no un generador, el riesgo de alucinacion no aplica del mismo modo; el riesgo principal es el falso negativo (PII no detectada) y su consecuencia en sistemas posteriores.
- No se documenta el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita el analisis de sesgos por origen de los datos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base `openai/privacy-filter`, cuya licencia no se detalla en la informacion disponible.
- La model card esta truncada en el apartado de limitaciones, por lo que podrian existir advertencias adicionales no recogidas aqui.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mabahboh/sitr-privacy-filter-ar-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mabahboh/sitr-arabic-pii
- Modelo base: https://huggingface.co/openai/privacy-filter

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los enlaces obtenidos corresponden a paginas de ayuda de YouTube y contenidos no relacionados). No se han localizado papers, blogs ni demos adicionales en la informacion disponible.
