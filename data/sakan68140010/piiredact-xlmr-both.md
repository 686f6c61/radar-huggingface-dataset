# sakan68140010/PIIRedact-XLMR-both

## Resumen

PIIRedact-XLMR-both es un modelo de clasificación de tokens (token classification) especializado en la detección y redacción de información sensible en documentos técnicos del ámbito de las tecnologías de la información (propuestas, especificaciones, actas de reuniones y pliegos de condiciones o TOR) escritos en tailandés e inglés. Lo desarrolla el autor independiente sakan68140010 (S. Punyanon y colaboradores) y se presenta como el checkpoint «+ both» del artículo *PIIRedact: Role-Aware Redaction of Personal, Business, and Technical Sensitive Information in Thai–English IT Documents*, enviado a JICTRA.

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder multilingüe de 277.476.895 parámetros, y se afina para etiquetar 15 tipos de span en formato BIO, agrupados en tres categorías: personal (PERSON, PHONE, EMAIL, ADDRESS, PERSON_ID), de negocio (CUSTOMER_ORG, PROVIDER_ORG, PROJECT, PRICE, DOC_ID, TAX_ID) y técnicos (IP, HOST, SECRET, ACCOUNT). La innovación principal es el etiquetado por rol: una organización se clasifica según su papel en el documento (cliente o proveedor), y no se marcan proveedores, reguladores ni clientes pasados.

Es relevante porque aborda un problema poco cubierto: la redacción automática de datos sensibles en un par de idiomas de bajos recursos como el tailandés, en un dominio (documentos IT corporativos y públicos) donde los modelos NER genéricos suelen fallar. Su licencia Apache 2.0 facilita la integración en pipelines de cumplimiento, aunque el propio autor advierte que el rendimiento en documentos reales es muy inferior al de los datos sintéticos y que la salida requiere revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) para token classification |
| Parámetros totales | 277.476.895 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con stride 382 (configurable en `piiredact.json`) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (modelo base XLM-R bajo MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base (transformer encoder de 12 capas, 768 de dimensión oculta, atención multi-cabeza estándar) con una cabeza de clasificación de tokens sobre 15 etiquetas en formato BIO. El entrenamiento se realizó exclusivamente con documentos sintéticos (`data/synth_v2`, 10.000 documentos de entrenamiento); no se usaron documentos reales. Se aplicaron dos técnicas de aumento/robustez descritas en la sección 5.2 del artículo: *cue-word dropout* con probabilidad 0,5 por span (eliminación de palabras indicadoras como «teléfono» o «correo») y negativos de identificadores públicos con probabilidad 0,5 por documento (para que el modelo no marque números de CVE u otros identificadores no sensibles).

La configuración de entrenamiento usa ventanas de 512 tokens con stride 382, AdamW con learning rate 3e-5 para el encoder y 1e-4 para la cabeza, batch efectivo de 16, 3 épocas, selección de la mejor época sobre el split de desarrollo y semilla 1. El fichero `piiredact.json` almacena los ajustes de ventana y el sesgo de la etiqueta O (4,0) elegido en desarrollo para el modo *deploy*. El modelo requiere el código de ventana y decodificación del repositorio GitHub (`ner/`) para funcionar correctamente; no es un pipeline estándar de `transformers` autónomo.

## Capacidades

- Detección de entidades nombradas de tipo PII en tailandés e inglés con offsets de carácter por span.
- Clasificación de 15 tipos de span en tres categorías: personal, de negocio y técnicos.
- Etiquetado por rol de organización: distingue CUSTOMER_ORG y PROVIDER_ORG según el papel en el documento.
- Detección de secretos y credenciales (SECRET, ACCOUNT, HOST, IP) sin depender de palabras indicadoras, gracias al *cue-word dropout*.
- Dos modos de decodificación: *ner* (umbral 0,0) y *deploy* (con sesgo O de 4,0 y postprocesado que elimina identificadores públicos y propaga etiquetas).
- Robustez ante identificadores públicos: tasa de falsos positivos sobre números CVE de 0,000 en el test sintético.
- Capacidad multilingüe limitada a tailandés e inglés; no se documenta soporte de otros idiomas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es un modelo puramente extractivo de etiquetado.

## Casos de uso

- Redacción de pliegos de condiciones (TOR) públicos: el modelo marca nombres de personas, teléfonos, correos, direcciones, precios y datos de organizaciones cliente/proveedor antes de publicar documentos de licitación, reduciendo la exposición de datos personales en portales de contratación.
- Anonimización de actas de reuniones internas: dado que distingue entre organizaciones cliente y proveedor, permite conservar la estructura del documento eliminando solo los datos sensibles de las partes implicadas.
- Cumplimiento de protección de datos en pipelines documentales: integrado como etapa previa a un LLM o a un sistema de gestión documental, detecta IP, HOST, SECRET y ACCOUNT en especificaciones técnicas y evita fugas de credenciales en repositorios o wikis internas.
- Preprocesado para entrenamiento de modelos: permite limpiar corpus de documentos IT tailandeses antes de usarlos en fine-tuning, eliminando PII y secretos con offsets de carácter que facilitan la sustitución por marcadores.
- Revisión de propuestas comerciales: extrae y redacta precios, identificadores de documento e identificadores fiscales (TAX_ID, DOC_ID) en flujos de revisión contractual, con revisión humana posterior.
- Filtrado de secretos en documentación técnica: el modo *deploy* con propagación de etiquetas ayuda a marcar bloques completos de configuración que contienen credenciales, útil en auditorías de seguridad de documentación interna.
- Asistencia a la redacción de documentos: como paso de verificación antes de compartir especificaciones con terceros, señalando spans que probablemente deban anonimizarse.

## Benchmarks y rendimiento

Resultados publicados por el autor (F1 estricto por span, media ± desviación típica de 3 semillas; este checkpoint es la semilla 1):

| Conjunto de test | F1 estricto |
|---|---|
| Test sintético | 0,943 ± 0,011 |
| Test sintético sin palabras indicadoras | 0,940 ± 0,004 |
| Casos escritos a mano (cases_it) | 0,809 ± 0,030 |

Resultados en documentos reales (este checkpoint; tasa de fuga de entidades con IC del 95 %, menor es mejor):

| Conjunto de test | F1 estricto | Tasa de fuga de entidades |
|---|---|---|
| TOR públicos, modo *ner* | 0,550 | 0,330 [0,213; 0,483] |
| TOR públicos, modo *deploy* | 0,352 | 0,200 [0,115; 0,303] |
| Documentos internos, modo *ner* | 0,284 | 0,478 [0,323; 0,708] |
| Documentos internos, modo *deploy* | 0,232 | 0,422 [0,268; 0,642] |

En el split sintético de test, el modelo no redacta ningún número CVE (tasa de acierto en trampa 0,000) y encuentra todas las contraseñas sin palabras indicadoras (recall de SECRET 1,000), promediado sobre 3 semillas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo de pesos (277 M de parámetros), más memoria de activaciones para ventanas de 512 tokens; en la práctica cabe en cualquier GPU con 4 GB o más.
- En fp16/bf16, los pesos ocupan unos 555 MB; la cuantización a 8 bits reduciría aún más el consumo, aunque el autor no publica cuantizaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes en producción, A100 o H100 aportan throughput adicional pero no son necesarias.
- Cabe en GPU consumer sin problema; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con el código de `ner/` del repositorio (obligatorio para ventana y decodificación); no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, al ser un modelo encoder de clasificación y no generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PIIRedact-XLMR-both | 277 M | 512 tokens (ventana con stride) | th, en | Apache 2.0 | NER de PII en documentos IT, etiquetado por rol |
| XLM-RoBERTa base (FacebookAI) | 278 M | 512 tokens | 100 idiomas | MIT | Modelo base multilingüe sin fine-tuning para PII |
| Modelos NER tailandeses genéricos (p. ej. PhayaThaiBERT, WangchanBERTa) | 100-300 M (aprox.) | 512 tokens (aprox.) | th | Varía | NER general tailandés, sin etiquetas de negocio ni secretos |

No se dispone de datos de benchmarks comparativos directos con estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Entrenado solo con documentos sintéticos; probado en documentos reales de un único país y un único dominio, con caída notable de rendimiento (F1 de 0,943 en sintético frente a 0,284-0,550 en real).
- La tasa de fuga de entidades nunca es cero (0,200-0,478 en documentos reales), por lo que la salida redactada debe ser revisada por una persona.
- En TOR públicos tailandeses marca erróneamente espacios en blanco de formularios con puntos, números de cláusula y numerales tailandeses como IP o SECRET, y pierde títulos largos de proyectos.
- Los límites de span siguen la guía de anotación del proyecto (por ejemplo, el título นาย no forma parte de PERSON), lo que difiere de otros datasets NER tailandeses y puede requerir adaptación.
- Solo cubre tailandés e inglés; no se documenta soporte de otros idiomas.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Requiere el código externo del repositorio GitHub para ventana y decodificación; un uso con `pipeline` estándar de `transformers` no reproduce el comportamiento documentado.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda combinarlo con reglas y una etapa de LLM on-premise, y no usarlo de forma aislada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sakan68140010/PIIRedact-XLMR-both
- Repositorio de código y datos: https://github.com/sakanarm/PIIRedact
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Artículo: *PIIRedact: Role-Aware Redaction of Personal, Business, and Technical Sensitive Information in Thai–English IT Documents* (S. Punyanon, C. Khemapatapan, R. Ranokphanuwat y A. Jeamaon; enviado a JICTRA); no se proporciona URL directa del paper.
