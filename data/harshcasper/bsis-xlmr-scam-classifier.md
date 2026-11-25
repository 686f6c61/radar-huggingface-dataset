# harshcasper/bsis-xlmr-scam-classifier

## Resumen

El BSIS Scam Classifier es un modelo de clasificación de texto binaria (SAFE/SCAM) desarrollado por el usuario de Hugging Face harshcasper, especializado en la detección de mensajes fraudulentos en tráfico SMS y WhatsApp del contexto indio. Se trata de un fine-tuning del modelo base `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe de 278 millones de parámetros, sobre el dataset `harshcasper/bsis`, compuesto por 32.858 ventanas de entrenamiento de conversaciones sintéticas de red-team generadas en la plataforma Sarvam Token Factory.

El modelo cubre 23 lenguas indias, tanto en escritura nativa como en code-mix romanizado, e incluye vectores de ataque típicos del ecosistema indio: arresto digital, falsos agentes de aduanas, trampas de QR de reembolso, UPI collect, préstamos predatorios, tareas falsas de WhatsApp y urgencias de conocidos. Esta orientación tan específica lo hace relevante para equipos de ciberseguridad y plataformas de mensajería que operan en India o en diásporas indias.

La relevancia actual del modelo radica en su enfoque multilingüe y en la documentación honesta de sus limitaciones: el autor publica métricas sobre el split sintético (F1 de 0,8695 con umbral ajustado a 0,45) y, de forma poco habitual, sobre un conjunto real anonimizado de 500 SMS donde el rendimiento cae a F1 0,4923. Esa transparencia es útil para evaluar su viabilidad en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.186 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | 23 lenguas indias: hi, en, bn, mr, ta, te, gu, kn, ml, or, pa, ur, as, brx, doi, kok, ks, mai, mni, ne, sa, sat, sd |
| Licencia | other (uso de investigación y educativo en detección de fraude y formación en ciberseguridad; sin garantía) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de clasificación sobre `FacebookAI/xlm-roberta-base`, un transformer encoder con 278 millones de parámetros y vocabulario multilingüe basado en SentencePiece. La cabeza de clasificación es binaria (`SAFE` = 0, `SCAM` = 1). El entrenamiento se realizó sobre el dataset `harshcasper/bsis`, compuesto por 32.858 ventanas de conversaciones sintéticas de red-team generadas en Sarvam Token Factory, cada una etiquetada con ground truth determinista. No se usaron mensajes reales de usuarios en el entrenamiento.

El fine-tuning se llevó a cabo en una Tesla T4 con precisión mixta fp16, durante 3 épocas, seleccionando la mejor época según F1 de validación. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de clasificación. El umbral de decisión ajustado en validación es 0,45 (mejor F1 0,8548); no se encontró un umbral con FPR ≤ 0,05, lo que indica que el modelo tiene dificultades para operar con presupuestos de falsos positivos estrictos.

## Capacidades

- Clasificación binaria de mensajes (SAFE/SCAM) con puntuación de probabilidad.
- Detección multilingüe en 23 lenguas indias, incluyendo escritura nativa y code-mix romanizado (hindi-inglés, etc.).
- Reconocimiento de vectores de fraude específicos del contexto indio: arresto digital, aduanas falsas, atención al cliente falsa, KYC/utility panic, préstamos predatorios, trampas de QR de reembolso, UPI collect, tareas de WhatsApp y urgencias sociales.
- Manejo de mensajes legítimos de referencia (alertas bancarias, OTP de entrega, recordatorios de electricidad, transferencias familiares) como clase negativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un generador.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Moderación de SMS y WhatsApp en operadores y plataformas indias: el modelo puede puntuar mensajes entrantes en 23 lenguas y activar alertas cuando la probabilidad de SCAM supera el umbral, con la ventaja de cubrir escrituras nativas y code-mix romanizado.
- Filtro previo en pasarelas de pago y apps de banca: integrado como señal adicional antes de mostrar enlaces o solicitar confirmación en operaciones UPI, QR o transferencias, especialmente en vectores como `upi_collect_trap` (F1 0,891) o `qr_code_refund_trap` (F1 0,8968).
- Formación y simulación de red-team: el modelo puede usarse para etiquetar automáticamente corpus de concienciación y validar la calidad de campañas de phishing simulado en lenguas indias.
- Investigación en ciberseguridad multilingüe: sirve como baseline para estudiar detección de fraude en lenguas de bajos recursos (brx, doi, kok, mni, sat) donde hay pocos recursos etiquetados.
- Enrutamiento en atención al cliente: clasificar mensajes de usuarios antes de derivarlos a agentes humanos o a flujos automáticos, reduciendo la exposición a ingeniería social.
- Análisis de corpus históricos: procesar lotes de SMS anonimizados para estudios de prevalencia de vectores de fraude por región o lengua.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test BSIS (1.883 ventanas):

| Umbral | Accuracy | Precision | Recall | F1 | FPR | ROC-AUC |
|---|---|---|---|---|---|---|
| 0,50 | 0,8147 | 0,8468 | 0,8861 | 0,866 | 0,3344 | 0,868 |
| 0,45 (ajustado) | 0,8173 | 0,8408 | 0,9002 | 0,8695 | 0,3557 | 0,868 |

Por modo de escritura:

| Modo | n | Positivos | F1 |
|---|---|---|---|
| native_script | 1239 | 854 | 0,8671 |
| romanized_codemix | 644 | 419 | 0,8739 |

Por grupo de dificultad:

| Grupo | n | Positivos | F1 |
|---|---|---|---|
| false (legítimos) | 1372 | 1021 | 0,8812 |
| true (fraude) | 511 | 252 | 0,8233 |

Por vector de ataque (selección):

| Vector | n | Positivos | F1 |
|---|---|---|---|
| digital_arrest | 270 | 235 | 0,8712 |
| fake_courier_customs | 114 | 93 | 0,9000 |
| fake_customer_care | 232 | 198 | 0,8741 |
| kyc_utility_panic | 166 | 134 | 0,9078 |
| predatory_loan_app | 94 | 74 | 0,8727 |
| qr_code_refund_trap | 145 | 117 | 0,8968 |
| social_friend_emergency | 105 | 68 | 0,8322 |
| upi_collect_trap | 197 | 149 | 0,8910 |
| whatsapp_stock_task | 251 | 205 | 0,8072 |

Conjunto real reservado (500 SMS anonimizados, solo inglés e indio-inglés):

| Accuracy | Precision | Recall | F1 | FPR | ROC-AUC |
|---|---|---|---|---|---|
| 0,67 | 0,5517 | 0,4444 | 0,4923 | 0,2031 | 0,5582 |

El contraste entre el rendimiento sintético (F1 ≈ 0,87) y el real (F1 ≈ 0,49) es el dato más relevante para evaluar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278 M de parámetros), menos de 600 MB en fp16 y del orden de 300 MB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Para throughput alto, una T4, L4 o RTX 4090 son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.).
- Opciones de despliegue: `transformers` con pipeline de text-classification, Text Embeddings Inference (el modelo está marcado como compatible con endpoints), y exportación a ONNX o cuantización con herramientas estándar. No se documenta soporte específico para vLLM o llama.cpp (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por mensaje en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| harshcasper/bsis-xlmr-scam-classifier | 278 M | no disponible (base: 512) | 23 lenguas indias | other (investigación/educativo) | Detección de fraude SMS/WhatsApp India |
| FacebookAI/xlm-roberta-base | 278 M | 512 | 100 idiomas | MIT | Modelo base multilingüe, sin fine-tuning de fraude |
| Modelos de clasificación de spam SMS genéricos (p. ej. fine-tunes de BERT/DistilBERT) | 66-110 M | 512 | Mayoritariamente inglés | variable | Spam SMS en inglés, sin cobertura de lenguas indias |

No se dispone de comparativas publicadas con otros clasificadores de fraude específicos para lenguas indias en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos: aunque el estilo es realista, no se usaron mensajes reales de usuarios, lo que explica la caída de rendimiento en el conjunto real (F1 0,4923 frente a 0,8695 en test sintético).
- El umbral de decisión es crítico: con 0,45 el FPR es 0,3557; no se encontró un umbral con FPR ≤ 0,05, por lo que no es adecuado para bloquear mensajes de forma automática sin revisión humana.
- La evaluación real solo cubre inglés e indio-inglés; el rendimiento en otras lenguas reales puede diferir sustancialmente de las cifras sintéticas.
- Riesgo de sesgo hacia los vectores y estilos presentes en el dataset sintético; puede no generalizar a campañas de fraude nuevas o a variantes dialectales no representadas.
- Licencia `other` con uso restringido a investigación y formación en ciberseguridad; no se autoriza explícitamente el uso comercial. Verificar términos con el autor antes de desplegar en producción.
- El modelo puntúa una ventana de mensaje, no a una persona; no debe usarse como única señal para bloquear, banear o acusar a nadie.
- Riesgo de falsos positivos en mensajes legítimos con lenguaje urgente o financiero, especialmente en lenguas con pocos ejemplos (od-IN n=25, sa-IN n=45, mni-IN n=50).
- No soporta generación, tool calling ni razonamiento; su uso está limitado a clasificación binaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshcasper/bsis-xlmr-scam-classifier
- Dataset BSIS: https://huggingface.co/datasets/harshcasper/bsis
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Sarvam Token Factory (plataforma de generación de datos): no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
