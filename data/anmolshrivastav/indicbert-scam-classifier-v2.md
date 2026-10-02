# anmolshrivastav/indicbert-scam-classifier-v2

## Resumen

IndicBERT Scam & Fraud Classifier v2 es un modelo de clasificacion de secuencias (encoder-only, familia BERT) desarrollado por el usuario anmolshrivastav y entrenado como ajuste fino de ai4bharat/IndicBERTv2-MLM-only. Con 278.042.882 parametros, resuelve la deteccion binaria de mensajes fraudulentos (etiqueta SCAM) frente a mensajes legitimos (etiqueta HAM) en comunicaciones tipicas del contexto indio: amenazas de corte de suministros, suplantacion de entidades bancarias, falsos sorteos, solicitudes de OTP, enlaces de phishing y avisos de KYC, entre otros.

Su relevancia radica en la cobertura multilingue: soporta 13 lenguas indias (assames, bengali, gujarati, hindi, kannada, cachemiro, malayalam, marati, odia, punyabi, tamil, telugu) mas ingles y la variedad Hinglish escrita en alfabeto latino, con un total de 14 codigos de idioma declarados. La version v2 corrige las vulnerabilidades de la v1 ante tecnicas de evasion (protocolos ofuscados como hxxp://, dominios desnudos y peticiones fraudulentas telefonicas concretas) mediante enmascarado de entidades, ponderacion de clases desequilibrada y mineria de negativos duros, pasando de un 98,29 % a un 99,64 % de precision global sobre un conjunto de evaluacion de 1.400 muestras.

El modelo se publica con licencia MIT y formato safetensors, es compatible con el ecosistema transformers y con text-embeddings-inference, y esta pensado como herramienta de apoyo a la clasificacion, no como sistema definitivo de verificacion de fraude.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia BERT), ajuste fino de ai4bharat/IndicBERTv2-MLM-only |
| Parametros totales | 278.042.882 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | as, bn, en, gu, hi, hi-Latn (Hinglish), kn, ks, ml, mr, or, pa, ta, te |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias construido sobre IndicBERTv2-MLM-only, un transformer encoder-only de tipo BERT. La tarea es de clasificacion binaria de texto (SCAM frente a HAM) en 14 idiomas y variedades linguisticas. No se trata de un modelo generativo, sino de un clasificador discriminativo orientado a produccion para moderacion y filtrado de mensajes.

El entrenamiento de la v2 se realizo sobre hardware Nvidia T4 con tres innovaciones principales respecto a la v1. Primero, enmascarado agresivo de entidades: expresiones regulares sustituyen URL, dominios desnudos y protocolos ofuscados por el token [URL], y numeros de telefono de 10 digitos y codigos internacionales por el token [PHONE]. Segundo, ponderacion de clases desequilibrada modificando la funcion de perdida para penalizar de forma exponencialmente mayor los falsos negativos (scam clasificado como ham) que los falsos positivos. Tercero, un bucle de retroalimentacion continua (mineria de negativos duros): los errores de la v1 se registraron como "hard mistakes", se sobremuestrearon y se mezclaron con un lote fraccionario de los datos originales para evitar olvido catastrofico, reentrenando con una tasa de aprendizaje de 1e-5. El conjunto de datos empleado es anmolshrivastav/scam_ham_india_14_languages.

## Capacidades

- Deteccion de fraude y estafa (clasificacion SCAM / HAM) en 14 idiomas y variedades del contexto indio.
- Reconocimiento de amenazas de corte de suministros basicos (por ejemplo, electricidad).
- Deteccion de suplantacion de bancos, India Post y servicios de mensajeria.
- Identificacion de falsos sorteos, subsidios y supuestos planes gubernamentales.
- Deteccion de solicitudes de pago sospechosas y demandas de tasas.
- Reconocimiento de enlaces de phishing y URL maliciosas (incluye manejo de protocolos ofuscados y dominios desnudos).
- Deteccion de peticiones de OTP, contrasenas, PIN o datos bancarios.
- Identificacion de mensajes falsos de entrega, reembolso, verificacion de cuenta y KYC.
- Deteccion de mensajes promocionales y de recompensa sospechosos.
- Distincion de mensajes transaccionales potencialmente legitimos: notificaciones de OTP, alertas de debito o transaccion, recordatorios de facturas y avisos de servicio de estilo oficial.
- Soporte multilingue con manejo especifico de Hinglish en alfabeto latino.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Filtrado de SMS y mensajes de operadoras: el clasificador puede procesar el texto entrante y marcar como SCAM los mensajes que contengan patrones de fraude financiero o suplantacion, aprovechando su cobertura de 14 idiomas indios en un unico modelo.
- Moderacion en aplicaciones de mensajeria: integrado antes de la entrega, permite bloquear o etiquetar mensajes fraudulentos que imitan avisos bancarios, de India Post o de mensajeria.
- Proteccion de banca movil: al analizar notificaciones y SMS de clientes, distingue alertas transaccionales legitimas (debito, OTP) de intentos de phishing que solicitan credenciales.
- Alertas antiphishing en navegadores o pasarelas: el enmascarado de URL y dominios desnudos facilita detectar enlaces sospechosos dentro de textos.
- Atencion al cliente automatizada: enrutado previo de tickets o mensajes que contengan intentos de estafa o demandas de pago fraudulentas hacia un flujo de revision humana.
- Cumplimiento y antifraude en telecomunicaciones: analisis por lotes de trafico de mensajes para identificar campanas de tele-fraude dirigidas a usuarios de distintas regiones linguisticas.
- Formacion y concienciacion: clasificacion de ejemplos reales para etiquetar corpus de formacion sobre fraude en multiple idioma.
- Investigacion academica en NLP indic: punto de partida para estudiar deteccion de fraude multilingue y sesgos entre lenguas con pocos recursos.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un conjunto de evaluacion multilingue curado manualmente con 100 muestras por idioma (50 SCAM y 50 HAM), 1.400 en total.

| Metrica | v1 (baseline) | v2 (optimizado) |
|---|---:|---:|
| Muestras de evaluacion | 1.400 | 1.400 |
| Predicciones correctas | 1.376 | 1.395 |
| Predicciones incorrectas | 24 | 5 |
| Precision global | 98,29 % | 99,64 % |

Desglose por idioma (v2):

| Idioma | Muestras | Correctas | Precision |
|---|---:|---:|---:|
| Assames (as) | 100 | 99 | 99,00 % |
| Bengali (bn) | 100 | 100 | 100,00 % |
| Ingles (en) | 100 | 100 | 100,00 % |
| Gujarati (gu) | 100 | 100 | 100,00 % |
| Hindi (hi) | 100 | 100 | 100,00 % |
| Hinglish (hi-Latn) | 100 | 100 | 100,00 % |
| Kannada (kn) | 100 | 100 | 100,00 % |
| Cachemiro (ks) | 100 | 99 | 99,00 % |
| Malayalam (ml) | 100 | 100 | 100,00 % |
| Marati (mr) | 100 | 99 | 99,00 % |
| Odia (or) | 100 | 100 | 100,00 % |
| Punyabi (pa) | 100 | 99 | 99,00 % |
| Tamil (ta) | 100 | 100 | 100,00 % |
| Telugu (te) | 100 | 99 | 99,00 % |
| Total | 1.400 | 1.395 | 99,64 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 278 millones de parametros, en FP32 los pesos ocupan aproximadamente 1,1 GB (tamano del repositorio: 1,1 GB); en FP16 la cifra se reduce a unos 0,55 GB.
- GPU recomendadas: el modelo se entreno en una Nvidia T4, que es suficiente para inferencia; tambien es adecuado en GPUs de gama consumer como GTX 1060 6 GB, RTX 3060, RTX 4090, asi como en A100 o H100 (sobradamente dimensionadas para este tamano).
- Cabe en GPU consumer: si, el modelo es lo bastante pequeno para ejecutarse en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (libreria declarada), text-embeddings-inference y endpoints compatibles. vLLM y TGI son viables para servir clasificacion en lote si se adaptan al pipeline de text-classification. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados con el material actual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la informacion proporcionada. Como referencia interna, se comparan las dos iteraciones del propio modelo y su base:

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indicbert-scam-classifier-v2 | 278.042.882 | no disponible | 99,64 % | MIT | HuggingFace |
| indicbert-scam-classifier v1 | no disponible | no disponible | 98,29 % | no disponible | version previa citada en la ficha |
| ai4bharat/IndicBERTv2-MLM-only | no disponible | no disponible | no aplica (modelo base de MLM, no clasificador) | no disponible | HuggingFace |

## Limitaciones y advertencias

- La clasificacion depende exclusivamente del texto proporcionado: un mensaje legitimo puede parecerse a una estafa y una estafa sofisticada puede parecerse a una notificacion oficial. Debe tratarse como ayuda a la clasificacion, no como sistema definitivo de verificacion de fraude.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos y falsos negativos) en textos ambiguos o fuera de distribucion.
- Los falsos positivos sobre mensajes transaccionales legitimos (OTP, alertas bancarias) pueden degradar la experiencia de usuario si el modelo se usa como bloqueo duro sin revision.
- Idiomas cubiertos: 14 codigos centrados en el contexto indio; no se documenta soporte para otras lenguas fuera de ese conjunto.
- No se documenta la longitud de contexto soportada ni variantes cuantizadas; esto limita la planificacion de despliegues con requisitos estrictos de latencia o memoria.
- La evaluacion se realizo sobre un conjunto de 1.400 muestras (100 por idioma) de elaboracion propia, por lo que la precision de 99,64 % puede no generalizar a dominios o registros distintos de los evaluados.
- Las metricas publicadas no incluyen precision, recall ni F1 por clase, lo que dificulta valorar el equilibrio real entre falsos positivos y falsos negativos pese a la ponderacion declarada.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base ai4bharat/IndicBERTv2-MLM-only, de las que la ficha no ofrece detalle.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anmolshrivastav/indicbert-scam-classifier-v2
- Modelo base: https://huggingface.co/ai4bharat/IndicBERTv2-MLM-only
- Conjunto de datos: https://huggingface.co/datasets/anmolshrivastav/scam_ham_india_14_languages

No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
