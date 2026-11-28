# sakan68140010/PIIRedact-XLMR-baseline

## Resumen

PIIRedact-XLMR-baseline es un modelo de clasificación de tokens (token classification) obtenido por fine-tuning de FacebookAI/xlm-roberta-base para la detección de información sensible en documentos técnicos de TI redactados en tailandés e inglés, como propuestas, especificaciones, actas de reunión y pliegos de condiciones (TOR). Lo desarrolla sakan68140010 (S. Punyanon y colaboradores) en el marco del artículo *PIIRedact: Role-Aware Redaction of Personal, Business, and Technical Sensitive Information in Thai–English IT Documents*, enviado a JICTRA. El modelo resuelve el problema de localizar y etiquetar fragmentos que deben redactarse antes de compartir o publicar un documento.

La arquitectura es la de XLM-R base, un transformer encoder multilingüe con 277.476.895 parámetros, adaptado a etiquetado BIO de 15 tipos de span organizados en tres categorías: personales (PERSON, PHONE, EMAIL, ADDRESS, PERSON_ID), de negocio (CUSTOMER_ORG, PROVIDER_ORG, PROJECT, PRICE, DOC_ID, TAX_ID) y técnicos (IP, HOST, SECRET, ACCOUNT). La innovación principal no está en la arquitectura sino en el esquema de anotación: las organizaciones se etiquetan según su rol en el documento (cliente o proveedor), no por su identidad, lo que permite una redacción coherente con el contexto contractual.

Es relevante ahora porque la redacción de PII en entornos corporativos multilingües sigue siendo un problema mal resuelto, especialmente en tailandés, y porque el modelo se publica como baseline reproducible (Apache 2.0) con código, datos sintéticos y métricas honestas que separan el rendimiento en datos sintéticos del rendimiento real. Este checkpoint concreto es la versión sin aumento de datos y sirve como referencia frente a la variante PIIRedact-XLMR-both, que corrige dos fallos conocidos de este baseline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens BIO |
| Parametros totales | 277.476.895 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens por ventana (ventanas con stride 382) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (modelo base XLM-R bajo MIT) |
| Formato de pesos | safetensors |
| Etiquetas | 15 tipos BIO: PERSON, PHONE, EMAIL, ADDRESS, PERSON_ID, CUSTOMER_ORG, PROVIDER_ORG, PROJECT, PRICE, DOC_ID, TAX_ID, IP, HOST, SECRET, ACCOUNT |
| Tamano del repositorio | 1,1 GB |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un encoder transformer de 12 capas y 277 millones de parámetros preentrenado de forma multilingüe, al que se añade una cabeza de clasificación de tokens sobre el esquema BIO de 15 etiquetas. El entrenamiento se realizó exclusivamente sobre documentos sintéticos (`data/synth_v2`, 10.000 documentos de entrenamiento), sin aumento de datos y sin usar documentos reales. Se emplearon ventanas de 512 tokens con stride 382, optimizador AdamW (learning rate 3e-5 para el encoder, 1e-4 para la cabeza), batch efectivo de 16, 3 épocas, selección de la mejor época sobre el split de desarrollo y semilla 1 (el checkpoint publicado corresponde a esa semilla).

El fichero `piiredact.json` del repositorio almacena los parámetros de ventaneo y un sesgo de la etiqueta O (`o_bias` = 4,0) elegido sobre el split de desarrollo para el modo *deploy*. La decodificación no es la estándar de Hugging Face: requiere el código de `ner/` del repositorio GitHub (funciones `predict_logprobs`, `decode`, `propagate` y `drop_public_ids`) para aplicar ventaneo, propagación de spans y eliminación de identificadores públicos. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de decodificación especulativa.

## Capacidades

- Extracción de entidades nombradas (NER) para 15 tipos de span relacionados con PII, datos de negocio y secretos técnicos en documentos de TI tailandés-inglés.
- Etiquetado de organizaciones por rol documental (cliente o proveedor) en lugar de por identidad; los vendedores, reguladores y clientes antiguos no se etiquetan.
- Detección de datos personales: nombre, teléfono, correo electrónico, dirección e identificador personal.
- Detección de datos de negocio: organización cliente, organización proveedor, proyecto, precio, identificador de documento e identificador fiscal.
- Detección de datos técnicos: direcciones IP, hosts, secretos (contraseñas, claves) y números de cuenta.
- Procesamiento de documentos largos mediante ventaneo con solapamiento y propagación de spans a offsets de carácter.
- Dos modos de decodificación: *ner* (sin sesgo, para evaluación estándar) y *deploy* (con `o_bias` para reducir falsos positivos en producción).
- Multilingüe limitado a tailandés e inglés, con capacidad de mezclar ambos idiomas en un mismo documento.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Redacción previa a la publicación de pliegos de condiciones (TOR) y licitaciones: el modelo marca nombres, teléfonos, correos, precios y organizaciones cliente/proveedor antes de que el documento se haga público, y el modo *deploy* elimina identificadores públicos que no deben redactarse.
- Anonimización de actas de reunión internas: permite sustituir personas, cuentas y secretos técnicos antes de compartir las actas con terceros o archivarlas fuera del perímetro corporativo.
- Saneado de especificaciones técnicas y documentación de arquitectura: detecta IPs, hosts, números de cuenta y credenciales embebidas en documentos de diseño antes de entregarlos a un proveedor externo.
- Cumplimiento de protección de datos en flujos documentales: como paso previo a un pipeline de revisión humana, reduce el volumen de texto que un revisor debe inspeccionar en documentos tailandeses, un idioma con poca cobertura en herramientas comerciales de DLP.
- Preprocesado para entrenamiento de modelos o publicación de datasets: elimina PII de corpus internos en tailandés e inglés antes de usarlos para fine-tuning o liberarlos.
- Filtro de primera pasada en sistemas de gestión documental: integrado como etapa de enmascarado en un DMS, marca spans candidatos que luego se validan con reglas y con un LLM on-premise, tal como propone el artículo.
- Auditoría de contratos y propuestas comerciales: identifica precios, identificadores fiscales y roles de las partes para revisar qué información sensible aparece y en qué secciones.

## Benchmarks y rendimiento

Resultados publicados en la model card. F1 estricto de span sobre datos sintéticos (media ± desviación típica de 3 semillas; el checkpoint publicado es la semilla 1):

| Conjunto de test | F1 estricto |
|---|---|
| Test sintético | 0,939 ± 0,012 |
| Test sintético sin palabras clave (*cue words*) | 0,914 ± 0,009 |
| Casos escritos a mano (cases_it) | 0,806 ± 0,015 |

Resultados sobre documentos reales (este checkpoint):

| Conjunto de test | F1 estricto | Tasa de fuga de entidades (IC 95 %) |
|---|---|---|
| TOR públicos, modo *ner* | 0,623 | 0,324 [0,199; 0,475] |

Métricas de fallo conocidas de este baseline:

| Fenómeno | Métrica |
|---|---|
| Números CVE etiquetados como DOC_ID | tasa de acierto en la trampa 0,925 ± 0,129 |
| Contraseñas detectadas sin palabra clave (*cue word*) | 0,686 ± 0,095 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 1,1 GB de pesos, más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060).
- Inferencia en FP16/BF16: alrededor de 0,55 GB de pesos; cabe en GPUs integradas y en CPU para volúmenes moderados.
- GPU recomendadas: RTX 4090, A100 o H100 solo son necesarias para procesar grandes lotes de documentos en paralelo; para uso interactivo basta una GPU consumer.
- Despliegue: `transformers` con el código de ventaneo y decodificación del repositorio `ner/`; es compatible con TGI y con `optimum`/ONNX, aunque no se documentan configuraciones oficiales. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están soportados de forma directa sin conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito no obvio: el modelo no funciona con un pipeline estándar de token classification; necesita el ventaneo con stride 382, la propagación de spans y el sesgo `o_bias` del fichero `piiredact.json`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PIIRedact-XLMR-baseline | 277 M | 512 tokens por ventana | th, en | Apache 2.0 | Baseline sin aumento; F1 0,623 en TOR reales |
| PIIRedact-XLMR-both | no disponible | no disponible | th, en | no disponible | Variante del mismo artículo que corrige los CVE etiquetados como DOC_ID y la detección de contraseñas sin palabra clave |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | multilingüe (100 idiomas) | MIT | Modelo base sin fine-tuning; no detecta PII por sí solo |
| Modelos NER tailandeses genéricos (p. ej. wangchanberta o PhayaThaiBERT) | no disponible | no disponible | th | no disponible | Esquemas de etiquetas distintos; el autor advierte que los límites de span de este proyecto difieren de otros datasets tailandeses de NER |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con documentos sintéticos y evaluado en documentos reales de un solo país y un solo dominio; la generalización a otros dominios o idiomas no está demostrada.
- La tasa de fuga de entidades nunca es cero (0,324 en TOR públicos): la salida redactada debe revisarla siempre una persona.
- Sobre documentos reales el F1 cae de 0,939 a 0,623; el modelo marca plantillas con puntos, números de cláusula y numerales tailandeses como IP o SECRET, y pierde títulos largos de proyecto.
- Etiqueta la mayoría de números CVE como DOC_ID (tasa de trampa 0,925) y solo detecta el 68,6 % de contraseñas cuando falta la palabra clave.
- Los límites de span siguen la guía de anotación del proyecto (por ejemplo, el título นาย no forma parte de PERSON), lo que difiere de otros datasets tailandeses de NER y complica la comparación directa.
- El modelo no genera texto ni razona: no puede sustituir a una etapa de reglas o a un LLM para los casos que se le escapan, tal como recomienda el propio autor.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos; el sesgo `o_bias` de 4,0 está ajustado para el modo *deploy* y su calibración fuera de este dominio no está validada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base XLM-R está bajo MIT y se deben conservar los avisos correspondientes; no se documentan restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y no se ha validado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sakan68140010/PIIRedact-XLMR-baseline
- Repositorio de código y datos: https://github.com/sakanarm/PIIRedact
- Guía de anotación (en tailandés): `docs/annotation_guide.md` dentro del repositorio de GitHub
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Artículo: *PIIRedact: Role-Aware Redaction of Personal, Business, and Technical Sensitive Information in Thai–English IT Documents* (S. Punyanon, C. Khemapatapan, R. Ranokphanuwat y A. Jeamaon; enviado a JICTRA); no se dispone de URL del paper en la información proporcionada.
