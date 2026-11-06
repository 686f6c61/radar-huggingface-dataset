# altaidevorg/akana-pii-tagger

## Resumen

akana-pii-tagger es un conjunto de dos clasificadores de tokens especializados en la deteccion de datos personales (PII) en texto en turco. Lo desarrolla altaidevorg como componente aprendido de akana, un toolkit de PLN para turco escrito en Rust que descarga estos modelos desde Hugging Face en el primer uso y ejecuta sus exportaciones ONNX en CPU. El modelo resuelve un problema concreto: identificar y enmascarar informacion personal en textos turcos para cumplir con normativas de proteccion de datos como la KVKK turca o el RGPD.

El repositorio contiene dos variantes: una ELECTRA-small fine-tuneada desde `dbmdz/electra-small-turkish-cased-discriminator` (56,6 MB en ONNX, modo rapido) y una BERTurk fine-tuneada desde `dbmdz/bert-base-turkish-cased` (441,9 MB en ONNX, modo preciso). Ambas comparten un esquema de nueve etiquetas PII con prefijos B- e I- (19 tags en total) y se combinan mediante ventanas deslizantes, decodificacion Viterbi restringida por BIO y una capa de politica que exime numeros de atencion al cliente y buzones genericos.

La relevancia actual del modelo radica en su enfoque practico: cuantifica explicitamente la fuga de caracteres personales (leak) y usa control de riesgo conformal para fijar puntos de operacion estrictos con garantias estadisticas sobre la tasa de exposicion, algo poco habitual en modelos de PII de dominio especifico. Esta pensado para integrarse en pipelines de anonimizacion y redaccion de documentos, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA-small y BERT-base), token classification |
| Parametros totales | no disponible (ELECTRA-small ~14M, BERTurk ~110M segun modelos base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 254 tokens WordPiece (256 con [CLS] y [SEP]), solapamiento de 64 tokens entre ventanas |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y safetensors sin cuantizacion declarada) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se compone de dos clasificadores de tokens independientes basados en arquitecturas encoder transformer. La variante rapida es una ELECTRA-small fine-tuneada desde el discriminador turco de dbmdz; la variante precisa es una BERTurk fine-tuneada desde `dbmdz/bert-base-turkish-cased`. Ambas producen etiquetas BIO sobre nueve categorias PII: PERSON, USERNAME, ADDRESS, PHONE, EMAIL, URL, ID, SECRET y DATE. El esquema excluye explicitamente categorias especiales de datos personales como salud o religion.

El entrenamiento utiliza varios datasets turcos: `turkish-nlp-suite/turkish-wikiNER`, `turkish-nlp-suite/MusteriYorumlari`, `BTX24/turkish-privacy-pii-ner`, `negentropi/belgin-pii-dataset` y `openai/gsm8k` (este ultimo presumiblemente para problemas de palabras matematicos con entidades embebidas). No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO. La innovacion tecnica principal esta en el post-procesado: ventanas de 254 tokens con solapamiento de 64, asignacion de scores al token mas alejado del borde de ventana, decodificacion Viterbi restringida por BIO, expansion de spans a palabras completas y una politica que deja sin enmascarar numeros de call center (444, 0850, 0800, 0900, codigos cortos) y buzones de rol (`info@`, `destek@`, `kvkk@`). Los puntos de operacion estrictos anaden un sesgo a las etiquetas PERSON, USERNAME y DATE (+5,25 en modo rapido, +2,75 en modo preciso), calibrado mediante control de riesgo conformal sobre 632 textos de desarrollo para garantizar una fuga esperada de caracteres personales de como maximo el 4 % (α = 0,04).

## Capacidades

- Deteccion de entidades PII en texto turco: nombres de personas, handles de redes sociales, direcciones postales, telefonos y fax, correos electronicos, URLs personales, identificadores (nacionales, financieros, de cliente, de transaccion, de vehiculo, de dispositivo, de casos judiciales), secretos (contrasenas, PINs, codigos de un solo uso, CVV, claves API, tokens de acceso, claves privadas) y fechas personales.
- Clasificacion a nivel de token con esquema BIO de 19 etiquetas.
- Dos modos de inferencia: rapido (solo ELECTRA-small) y preciso (promedio de probabilidades de ambos modelos, aproximadamente cinco veces mas lento).
- Dos puntos de operacion: normal y estricto (con sesgo calibrado para minimizar fugas).
- Post-procesado integrado: ventanas con solapamiento, Viterbi restringido, expansion a palabras y politica de exencion de numeros de servicio y buzones de rol.
- Exportacion ONNX para inferencia en CPU.
- Integracion con `transformers` mediante `pipeline("token-classification")`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo turco.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo thinking).

## Casos de uso

- Anonimizacion de documentos legales: el modelo puede procesar sentencias judiciales y expedientes para enmascarar nombres de particulares, identificadores de casos y fechas personales antes de su publicacion o comparticion, gracias a su entrenamiento con el split de texto real que incluye decisiones judiciales.
- Cumplimiento de KVKK en atencion al cliente: integrado en pipelines de registro de conversaciones, permite redactar telefonos, correos y numeros de cliente en transcripciones de call center, con la politica de exencion que preserva numeros de servicio (444, 0850) y buzones genericos.
- Redaccion de resenas y comentarios de usuarios: el modelo puede filtrar PII en resenas de productos y comentarios de redes sociales antes de almacenarlos o analizarlos, usando el modo rapido para alto volumen.
- Preprocesado de datasets para publicacion: antes de liberar corpus turcos (tweets, resenas, peticiones a asistentes de voz), el modelo detecta y enmascara datos personales, con el modo estricto para minimizar fugas en datasets sensibles.
- Enmascaramiento en prompts de chatbot: en sistemas que registran prompts de usuarios, el modelo puede redactar secretos (contrasenas, claves API, tokens) y datos personales antes de enviarlos a registros o a modelos externos.
- Deteccion de secretos en logs de aplicaciones: la etiqueta SECRET permite identificar contrasenas, claves API y tokens de acceso embebidos en texto turco, util para auditorias de seguridad.
- Procesamiento de formularios y correos: extraccion y redaccion de direcciones, telefonos y correos en correspondencia de clientes, con byte offsets que facilitan la sustitucion en el texto original.

## Benchmarks y rendimiento

Evaluacion sobre el test split del gold de texto real de akana: 1.617 unidades de decisiones judiciales, Wikipedia, noticias, tweets, resenas de productos, peticiones a asistentes de voz, prompts de chatbot, comentarios de redes sociales y problemas matematicos, con 900 valores personales y 1.149 unidades sin datos personales.

| Modo | Precision | Recall | Exact F1 (IC 95 %) | Fully covered | Leak | Falsas alarmas /10k |
|---|---:|---:|---:|---:|---:|---:|
| fast | 0,868 | 0,884 | 0,876 (0,853–0,897) | 0,913 | 7,0 % | 4,3 |
| accurate | 0,935 | 0,917 | 0,926 (0,908–0,943) | 0,934 | 5,3 % | 1,3 |
| fast, strict | 0,687 | 0,916 | 0,785 (0,747–0,818) | 0,963 | 2,4 % | 12,0 |
| accurate, strict | 0,812 | 0,937 | 0,870 (0,843–0,893) | 0,966 | 2,6 % | 6,6 |

En ambos modos estrictos, un texto de held-out con datos personales dejo en claro de media un 3,8 % de sus caracteres personales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es de tamano reducido; ELECTRA-small (~14M parametros) ocupa decenas de MB en FP32 y BERTurk (~110M) unos cientos de MB. La inferencia se ejecuta en CPU segun la model card, sin requisitos de GPU declarados.
- GPU recomendadas: no disponible; el diseno apunta a CPU. Cualquier GPU consumer moderna (RTX 3060 o superior) seria sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque no es el objetivo de despliegue.
- Opciones de despliegue: ONNX Runtime (via akana), `transformers` con PyTorch, y presumiblemente vLLM/TGI no aplican por ser token classification. llama.cpp y Ollama no estan soportados al no haber pesos GGUF declarados.
- Latencia y throughput estimados: no disponible. El modo preciso es aproximadamente cinco veces mas lento que el rapido segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akana-pii-tagger | ~14M + ~110M (dos modelos) | ventana 254 tokens | PII en turco | CC BY-SA 4.0 | Hugging Face, via akana |
| dbmdz/bert-base-turkish-cased | ~110M | 512 tokens | encoder general turco | no disponible | Hugging Face |
| dbmdz/electra-small-turkish-cased-discriminator | ~14M | 512 tokens | encoder general turco | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de PII en turco en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no es multilingue.
- No etiqueta categorias especiales de datos personales (salud, religion y similares).
- La garantia de fuga maxima del 4 % en modos estrictos es una cota esperada en promedio sobre textos similares a los de calibracion, no una garantia por texto individual.
- Los modos estrictos sacrifican precision de forma notable (0,687 en fast strict frente a 0,868 en fast normal), generando mas falsas alarmas (12,0 frente a 4,3 por 10k caracteres).
- La evaluacion se hizo sobre un gold generado por al menos dos etiquetados independientes de modelos Claude, con adjudicacion valor por valor; puede contener sesgos del proceso de anotacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de falsos positivos y falsos negativos en la deteccion de spans.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- El uso via `transformers` no incluye las ventanas, Viterbi ni la politica de akana, por lo que los resultados difieren de los reportados.
- La politica de exencion deja sin enmascarar numeros de servicio y buzones de rol, lo que puede no ser adecuado si se requiere enmascaramiento total.
- Ventana de contexto limitada a 254 tokens por ventana; textos muy largos requieren el pipeline de ventanas de akana para un rendimiento optimo.

## Enlaces

- Hugging Face: https://huggingface.co/altaidevorg/akana-pii-tagger
- Repositorio akana: https://github.com/altaidevorg/akana
- Modelo base ELECTRA-small: https://huggingface.co/dbmdz/electra-small-turkish-cased-discriminator
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset turkish-wikiNER: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
- Dataset MusteriYorumlari: https://huggingface.co/datasets/turkish-nlp-suite/MusteriYorumlari
- Dataset turkish-privacy-pii-ner: https://huggingface.co/datasets/BTX24/turkish-privacy-pii-ner
- Dataset belgin-pii-dataset: https://huggingface.co/datasets/negentropi/belgin-pii-dataset
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper de control de riesgo conformal (Angelopoulos et al., 2022): no disponible en la informacion proporcionada
