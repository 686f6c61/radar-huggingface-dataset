# bolewara/hinglish-scam-text-dataset

## Resumen

El dataset `bolewara/hinglish-scam-text-dataset` es un conjunto de datos curado para la detección de mensajes fraudulentos, phishing y estafas financieras en inglés e hinglish (mezcla de hindi e inglés transliterado). Fue creado por Anuj Bolewar con el objetivo de ajustar el modelo `bolewara/financial-fraud-scam-detector`. Contiene 3.787 ejemplos etiquetados de forma binaria (0 = benigno, 1 = fraudulento), de los cuales la mayoría son en inglés procedentes de la colección pública SMS Spam Collection (UCI), y una parte pequeña pero relevante son ejemplos hinglish escritos a mano que reflejan patrones reales de fraude reportados por bancos y células cibernéticas indias.

La relevancia de este dataset radica en que aborda un problema específico: los sistemas de detección de spam entrenados solo en inglés fallan con mensajes en hinglish, un idioma code-mixed muy común en la comunicación digital de la India. Al incluir ejemplos manualmente redactados de fraudes típicos (KYC, UPI, loterías, préstamos falsos, etc.), el dataset permite entrenar modelos capaces de reconocer estos patrones en textos informales y cortos. Su licencia CC-BY-4.0 facilita su uso en investigación y desarrollo comercial, aunque el tamaño de la muestra hinglish es limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dataset de clasificación de texto (no es un modelo) |
| Parametros totales | No aplica (dataset) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (en), Hinglish (hi-Latn, código mixto hindi-inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | JSON (archivo con lista de objetos `{"text": "...", "label": 0\|1}`) |

## Arquitectura y entrenamiento

Este no es un modelo entrenado, sino un dataset de entrenamiento. Su estructura es un archivo JSON con 3.787 registros, cada uno con un campo `text` (el mensaje) y un campo `label` (0 o 1). El dataset se construyó combinando dos fuentes:

- **Parte inglesa**: derivada de la colección pública SMS Spam Collection de UCI. Se tomaron aproximadamente 3.000 mensajes benignos (ham) y unos 700 mensajes spam/fraudulentos, complementados con textos curados de phishing y fraude.
- **Parte hinglish**: 35 ejemplos de fraude y 28 ejemplos benignos, todos escritos a mano por el autor. Estos ejemplos cubren patrones reales de estafas financieras en India: expiración de KYC bancario, bloqueo de Aadhaar, fraude UPI, loterías falsas, préstamos con tarifas anticipadas, suspensión de PAN, ofertas de empleo falsas, amenazas de suspensión de servicios, emergencias familiares, reembolsos falsos y robo de OTP.

No se aplicó ningún proceso de aumentación de datos ni se usaron técnicas de entrenamiento (RLHF, DPO, etc.), ya que el dataset es un recurso estático. La etiqueta `0` corresponde a mensajes legítimos y `1` a fraudulentos.

## Capacidades

- **Clasificación binaria de mensajes**: permite entrenar modelos para distinguir entre mensajes benignos y fraudulentos en inglés e hinglish.
- **Detección de fraude financiero**: cubre patrones específicos como KYC, UPI, loterías, préstamos falsos, OTP, etc.
- **Soporte multilingüe**: incluye ejemplos en inglés y en hinglish transliterado (escritura en caracteres latinos), lo que facilita el entrenamiento de modelos para entornos indios.
- **Formato simple**: el JSON es fácil de cargar con bibliotecas estándar de Python (pandas, datasets de HuggingFace).
- **Etiquetas claras**: la codificación binaria simplifica el ajuste de clasificadores.

## Casos de uso

- **Filtrado de SMS en operadores móviles**: un modelo entrenado con este dataset puede integrarse en pasarelas de SMS para bloquear mensajes fraudulentos antes de que lleguen al usuario, especialmente en India donde el hinglish es común.
- **Detección de phishing en aplicaciones de banca móvil**: las entidades financieras pueden usar el modelo para marcar mensajes sospechosos que suplantan a bancos (KYC, OTP, bloqueo de tarjeta).
- **Protección en plataformas de mensajería**: servicios como WhatsApp o Telegram pueden emplear el clasificador para alertar sobre mensajes de estafa en chats, usando la ventaja de que el dataset incluye ejemplos realistas de fraude emergente.
- **Sistemas de atención al cliente automatizados**: un chatbot de soporte puede derivar mensajes sospechosos a un agente humano o responder con avisos de seguridad, gracias a la capacidad del modelo para identificar patrones de fraude.
- **Investigación académica en NLP para idiomas de bajos recursos**: el dataset sirve como recurso para estudiar la detección de fraude en hinglish, un área con pocos datos etiquetados.
- **Auditoría de cumplimiento normativo**: empresas de tecnología financiera pueden usar el modelo para revisar comunicaciones y asegurar que no se difunden enlaces de phishing o solicitudes de datos personales fraudulentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El dataset no incluye métricas de rendimiento de modelos entrenados con él, ni comparaciones con otros conjuntos de datos.

## Requisitos de hardware

Al ser un dataset, no requiere hardware específico para su uso. Solo se necesita:

- Almacenamiento mínimo: el archivo JSON ocupa unos pocos cientos de kilobytes (3.787 ejemplos).
- Memoria RAM: suficiente para cargar el dataset en memoria (menos de 10 MB).
- Para entrenar un modelo con este dataset, se recomienda una GPU con al menos 4 GB de VRAM si se usa un transformer pequeño (por ejemplo, DistilBERT), o CPU para modelos lineales (regresión logística, SVM).
- No hay requisitos de despliegue, ya que el dataset es un recurso estático.

## Comparativa con modelos similares

No se trata de un modelo, sino de un dataset. Sin embargo, se puede comparar con otros datasets de hinglish disponibles:

| Dataset | Tamaño | Idiomas | Contenido | Licencia |
|---|---|---|---|---|
| `bolewara/hinglish-scam-text-dataset` | 3.787 ejemplos | en, hi-Latn | Fraude financiero | CC-BY-4.0 |
| `skmanish/hinglish-conv-dataset` | No especificado | hi-Latn | Conversaciones generales | No especificada |
| `Abhishekcr448/Hinglish-Everyday-Conversations-1M` | 1M ejemplos | hi-Latn | Conversaciones cotidianas | No especificada |
| `ishasinghrathore37/scam_hinglish-nlp` | No especificado | hi-Latn | Detección de scam en hinglish | No especificada |

El dataset de bolewara se diferencia por su enfoque específico en fraude financiero y por incluir ejemplos escritos a mano que reflejan patrones reales de estafas, algo que los datasets generales de conversación no cubren.

## Limitaciones y advertencias

- **Desbalance de clases**: la proporción de ejemplos benignos (~3.028) frente a fraudulentos (~735) es de aproximadamente 4:1, lo que puede requerir técnicas de balanceo (oversampling, pesos de clase) durante el entrenamiento.
- **Muestra hinglish muy reducida**: solo 63 ejemplos en hinglish (35 scam + 28 benignos), lo que limita la capacidad de generalización del modelo para este idioma. Se recomienda aumentar con datos adicionales o usar aumentación.
- **Cobertura limitada de patrones**: los ejemplos hinglish cubren 9 tipos de fraude, pero pueden existir otros patrones emergentes no representados.
- **Fecha de creación futura**: el dataset está fechado en agosto de 2026, lo que podría indicar que es muy reciente o que la fecha es incorrecta; se debe verificar la vigencia de los patrones de fraude.
- **Licencia**: CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones adicionales.
- **Riesgo de sesgo**: los ejemplos hinglish fueron escritos por una sola persona, lo que puede introducir sesgos en el estilo de escritura o en la representación de ciertos tipos de fraude.
- **No incluye metadatos**: no hay información sobre longitud de mensajes, remitentes, ni contexto temporal, lo que limita análisis más profundos.

## Enlaces

- HuggingFace: https://huggingface.co/bolewara/hinglish-scam-text-dataset
- Artículo sobre modelo Hinglish (referencia): https://arxiv.org/html/2504.19070v1
- Dataset conversacional hinglish (GitHub): https://github.com/skmanish/hinglish-conv-dataset
- Dataset Hinglish Everyday Conversations 1M (HuggingFace): https://huggingface.co/datasets/Abhishekcr448/Hinglish-Everyday-Conversations-1M
- Proyecto de detección de scam en hinglish (GitHub): https://github.com/ishasinghrathore37/scam_hinglish-nlp
- Recursos de datasets hinglish de Shaip: https://www.shaip.com/offerings/speech-data-catalog/hinglish-dataset/
