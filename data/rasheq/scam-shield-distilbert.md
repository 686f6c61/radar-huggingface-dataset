# rasheq/scam-shield-distilbert

## Resumen

Scam Shield DistilBERT es un clasificador binario de mensajes SMS (etiquetas `safe` y `scam`) desarrollado por el usuario rasheq y publicado en Hugging Face. Se trata de un ajuste fino de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66.958.082 parámetros, sobre un corpus de 17.199 mensajes reales (8.527 fraudulentos y 8.672 seguros) procedente de reportes públicos de smishing, SMS cotidianos y mensajes sintéticos de servicios. El modelo resuelve el problema del filtrado de phishing y fraude por SMS en inglés con un coste computacional muy bajo: cabe en CPU de portátil y se ejecuta en milisegundos por mensaje.

Su relevancia radica en la combinación de un tamaño reducido (0,3 GB de repositorio en safetensors) con métricas declaradas altas en su conjunto de test: 97,8 % de accuracy, 98,7 % de precisión, 98,2 % de recall y 98,4 % de F1 sobre 1.531 mensajes reales no vistos. No obstante, el propio autor advierte que el conjunto de test contiene solo chats personales como clase segura, y que en un conjunto manual más difícil de 60 mensajes el acierto cae a 51 de 60, con 7 de 28 alertas legítimas de servicio marcadas erróneamente como fraude.

El modelo está pensado como una primera capa de filtrado, no como una garantía: la propia model card lo describe como "un ayudante, no una garantía". Es relevante ahora porque el smishing es un vector de ataque masivo y de bajo coste, y un clasificador de 67 M de parámetros con licencia Apache-2.0 permite desplegar filtrado en el propio dispositivo o en un backend modesto sin dependencias de API de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.958.082 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 67 M es viable en fp32/fp16 sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura es un DistilBERT estándar: un transformer encoder de 6 capas con atención multi-cabeza completa, destilado de `bert-base-uncased` según Sanh et al. (2019). El autor añade cuatro tokens especiales al vocabulario: `<URL>`, `<PHONE_NUMBER>`, `<EMAIL_ADDRESS>` y `<NUMBER>`, de modo que el modelo aprende patrones estructurales del mensaje (presencia de enlaces, números de teléfono, importes) en lugar de memorizar cadenas concretas. El preprocesado de enmascarado se distribuye junto al modelo en el fichero `text_utils.py`, y es obligatorio aplicarlo en inferencia para replicar la distribución de entrenamiento.

El ajuste fino se realizó sobre 17.199 mensajes (8.527 scam, 8.672 safe) con longitud máxima de 128 tokens, batch de 16, learning rate 2e-5, warm-up del 10 %, decay lineal, optimizador AdamW con weight decay 0,01 y hasta 4 épocas con early stopping sobre la pérdida de validación (mejor época: la 2). El entrenamiento se ejecutó en una Apple M3 Pro vía MPS, a unos 3 minutos por época. No se menciona RLHF, DPO ni ninguna fase de alineación; es un ajuste supervisado de clasificación puro. Las fuentes de datos son los reportes de smishing del IMC 2025 (Agarwal, Papasavva, Suarez-Tangil, Vasek, CC BY 4.0), el SMS Phishing Dataset de Mishra y Soni (Mendeley Data, 2022, CC BY 4.0) y mensajes sintéticos de servicios seguros generados con un modelo de IA y revisados manualmente (CC BY 4.0).

## Capacidades

- Clasificación binaria de texto en dos etiquetas: `safe` (0) y `scam` (1), con umbral de decisión en 0,5 sobre la puntuación de scam.
- Detección de smishing y phishing por SMS: mensajes de entrega de paquetes con enlace, suplantación de familiar ("Hi Mum"), alertas de cuenta bloqueada, premios y sorteos.
- Reconocimiento de patrones estructurales mediante tokens enmascarados: presencia de URL, teléfonos, correos y números largos.
- Inferencia en CPU sin GPU, con latencia de milisegundos por mensaje al ser un modelo de 67 M de parámetros.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers y compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es exclusivamente un clasificador de secuencia.
- Capacidad multilingüe: únicamente inglés; no se ha entrenado con otros idiomas.

## Casos de uso

- Filtrado en tiempo real de SMS entrantes en aplicaciones de mensajería: el modelo clasifica cada mensaje en milisegundos en CPU, por lo que puede ejecutarse en el propio dispositivo del usuario o en el backend de un operador sin infraestructura GPU.
- Pasarela de seguridad para operadores y agregadores SMS: preprocesar con `text_utils.prepare()` y descartar o marcar los mensajes con score de scam superior a 0,5 antes de entregarlos al usuario final, reduciendo la exposición a smishing.
- Módulo de aviso en apps bancarias: integrar el clasificador en el flujo de notificaciones para señalar mensajes sospechosos que suplantan alertas de fraude o de cuenta bloqueada, con la advertencia de que el modelo tiende a marcar en exceso alertas legítimas y requiere revisión humana.
- Enriquecimiento de datasets de fraude: usar las puntuaciones del modelo como señal auxiliar para priorizar la revisión manual de reportes de usuarios en plataformas de denuncia o en un SOC.
- Prototipado rápido y pruebas de concepto: al ser un modelo de 0,3 GB con licencia Apache-2.0 y API estándar de Transformers, sirve para validar una idea de producto de detección de fraude en horas, sin entrenamiento propio.
- Filtro previo en pipelines de moderación de contenido: primera etapa barata que descarta mensajes claramente seguros y deja pasar a un modelo mayor o a un revisor humano solo los casos dudosos, reduciendo coste por mensaje.
- Investigación académica sobre detección de smishing: línea base reproducible (código, datos y pesos públicos) para comparar técnicas de detección en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), no verificados de forma independiente (`verified: false`). Evaluación única sobre el split de test de `rasheq/scam-shield-sms`, con 1.531 mensajes reales no usados en entrenamiento ni en selección de época:

| Metrica | Valor |
|---|---|
| Accuracy | 0,978 |
| Precision | 0,987 |
| Recall | 0,982 (1.047 de 1.066 scams detectados) |
| F1 | 0,984 |
| Tasa de falsa alarma | 3,0 % (14 de 465 mensajes seguros) |

El autor advierte que las clases seguras del test son solo chats personales. En un conjunto manual adicional de 60 mensajes más difíciles (alertas bancarias realistas, avisos largos, fraudes silenciosos) el modelo acertó 51 de 60 y marcó como scam 7 de 28 mensajes legítimos de servicio. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (67 M de parámetros, ~268 MB de pesos) y unos 134 MB en fp16. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso iGPU es suficiente; el autor entrenó en una Apple M3 Pro vía MPS.
- Cabe en CPU de portátil: el autor lo describe explícitamente como ejecutable en "un portátil normal" y el entrenamiento completo ocupó unos 3 minutos por época en M3 Pro.
- Opciones de despliegue: pipeline `text-classification` de Transformers, Text Embeddings Inference (tag `text-embeddings-inference`), y exportación a ONNX o a llama.cpp/GGUF no documentada por el autor (no disponible).
- Latencia y throughput: no se publican cifras medidas. Por tamaño (67 M de parámetros, secuencias de 128 tokens) se espera latencia de milisegundos por mensaje en CPU, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. Comparación estructural:

| Modelo | Parametros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| rasheq/scam-shield-distilbert | 66,9 M | 128 tokens | en | Apache-2.0 | Clasificación scam/safe |
| distilbert-base-uncased (modelo base) | 66,9 M | 512 tokens | en | Apache-2.0 | Modelo de lenguaje enmascarado (requiere ajuste para clasificar) |
| BERT-base-uncased | 110 M | 512 tokens | en | Apache-2.0 | Modelo de lenguaje enmascarado (requiere ajuste para clasificar) |

Frente a su modelo base, Scam Shield aporta el ajuste específico, los cuatro tokens de enmascarado y el código de preprocesado; frente a BERT-base, ofrece un 40 % menos de parámetros a costa de una ventana de contexto menor (128 frente a 512 tokens). No se han identificado en la información disponible otros clasificadores de smishing comparables con métricas publicadas.

## Limitaciones y advertencias

- Solo inglés y predominantemente mensajes de estilo SMS; correos electrónicos y conversaciones largas quedan fuera de su distribución de entrenamiento.
- Falso positivo elevado con alertas legítimas: alertas reales de fraude, restablecimientos de contraseña, facturas pendientes, abonos de nómina y avisos bancarios largos pueden marcarse como scam (7 de 28 en el conjunto manual del autor).
- Los mensajes largos de varias líneas tienden a clasificarse como scam.
- Se escapan fraudes lentos de tipo romance y mensajes cortos de "cuenta bloqueada, llame a este número" sin enlace.
- Alta sensibilidad a la redacción: una reformulación menor puede invertir la predicción.
- Ruido de etiquetas: entre el 10 % y el 20 % de los reportes públicos de scam usados en entrenamiento son mensajes reales sobre los que los usuarios tenían dudas.
- El modelo solo es fiable con mensajes de al menos 3 palabras; los más cortos no pueden juzgarse de forma fiable.
- El enmascarado previo con `text_utils.prepare()` es obligatorio; usarlo sin enmascarar degrada las predicciones de forma no documentada.
- Un resultado "safe" no es prueba de que el mensaje sea seguro; el autor lo describe como un ayudante, no una garantía.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificación errónea con confianza alta.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Sesgos conocidos: no documentados explícitamente por el autor; la composición del dataset (reportes públicos y mensajes sintéticos) puede introducir sesgos de dominio y de estilo no medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasheq/scam-shield-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/rasheq/scam-shield-sms
- Código, entrenamiento y pipeline de datos: https://github.com/Mohamedrasheq/scam-shield
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): no disponible como enlace directo en la información proporcionada
- Paper IMC 2025 sobre smishing: https://doi.org/10.1145/3730567.3764431
- Dataset SMS Phishing (Mishra y Soni, Mendeley Data, 2022): https://doi.org/10.17632/f45bkkt8pr.1
