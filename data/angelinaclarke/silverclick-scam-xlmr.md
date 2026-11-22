# AngelinaClarke/silverclick-scam-xlmr

## Resumen

SilverClick scam-message detector es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de `FacebookAI/xlm-roberta-base` para distinguir entre mensajes SMS fraudulentos (`scam`) y mensajes legítimos (`normal`). Lo desarrolla AngelinaClarke como proyecto estudiantil dentro de SilverClick, un sitio web de alfabetización digital dirigido a personas mayores. El modelo resuelve un problema acotado: dar una señal orientativa a usuarios poco familiarizados con el fraude digital cuando reciben un mensaje sospechoso.

Arquitectónicamente es un transformer encoder XLM-RoBERTa con 278.045.186 parámetros y una longitud máxima de entrada de 128 tokens durante el entrenamiento, suficiente para mensajes cortos de tipo SMS. Cubre cuatro idiomas: inglés, hindi, kannada y tamil, con datos de entrenamiento que combinan SMS reales en inglés y mensajes traducidos automáticamente o redactados con ayuda de IA para los tres idiomas indios.

Es relevante ahora por su enfoque explícitamente educativo y multilingüe de bajo coste, pero también por sus advertencias transparentes: no se ha evaluado con mensajes fraudulentos reales en hindi, kannada o tamil, y el autor lo declara no apto para bloquear mensajes ni para decisiones de seguridad. Es, por tanto, una pieza didáctica y un punto de partida reproducible más que un sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento; la arquitectura base admite hasta 512) |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32/fp16; cuantizaciones no publicadas) |
| Idiomas soportados | Inglés (en), hindi (hi), kannada (kn), tamil (ta) |
| Licencia | No disponible (el autor remite a comprobar las licencias de `xlm-roberta-base`, UCI SMS Spam Collection y NLLB-200) |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingüe con tokenizador SentencePiece y 278 millones de parámetros, al que se le añade una cabeza de clasificación binaria (`normal` = 0, `scam` = 1). El ajuste fino se realizó en Google Colab con una GPU T4 durante 3 épocas, batch size 16, learning rate 2e-5, weight decay 0,01, precisión fp16, semilla 42 y longitud máxima de 128 tokens. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación; es un fine-tuning supervisado convencional.

El conjunto de entrenamiento suma 11.411 filas: 4.457 SMS reales en inglés procedentes del 80 % de entrenamiento del SMS Spam Collection de UCI (spam mapeado a `scam`, ham a `normal`); 5.394 mensajes traducidos automáticamente del inglés al hindi, kannada y tamil con NLLB-200 distilled 600M (todas las filas de scam más una muestra de normales, 1.798 por idioma); 750 mensajes cotidianos normales en los tres idiomas indios (75 mensajes redactados con ayuda de IA, repetidos 10 veces); 450 mensajes de servicios legítimos como bancos, OTP y facturas (45 mensajes repetidos 10 veces); y 360 mensajes de códigos OTP generados a partir de 12 plantillas con códigos aleatorios (270 normales, 90 scam). La composición revela una dependencia fuerte de datos sintéticos y de traducción automática, lo que condiciona la validez de las métricas.

## Capacidades

- Clasificación binaria de mensajes cortos en `scam` o `normal`, con probabilidad asociada y umbral de decisión en 0,5.
- Detección de patrones típicos de fraude por SMS: premios falsos, enlaces sospechosos, solicitudes de OTP o datos personales.
- Cobertura multilingüe de inglés, hindi, kannada y tamil en un único modelo.
- Entrada de hasta 128 tokens, adecuada para mensajes SMS y notificaciones breves.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Demostración educativa en SilverClick: el sitio web muestra al usuario una etiqueta orientativa ("puede ser un fraude") para enseñar a reconocer mensajes sospechosos, sin bloquear nada.
- Talleres de alfabetización digital: formadores pueden introducir mensajes de ejemplo en inglés o en idiomas indios y mostrar la clasificación del modelo como ejercicio práctico.
- Filtro de primera pasada en prototipos de investigación: sirve para etiquetar rápidamente un corpus pequeño de SMS y estudiar la distribución de mensajes sospechosos antes de etiquetado humano.
- Evaluación comparativa de modelos multilingües: al ser un fine-tuning reproducible de XLM-R base, puede usarse como línea base en experimentos académicos sobre detección de spam en varios idiomas.
- Generación de conjuntos de prueba sintéticos: el pipeline permite clasificar mensajes generados automáticamente y analizar qué patrones disparan la etiqueta `scam`.
- Aplicación de demostración en Hugging Face Spaces: con 278 millones de parámetros y pesos de 1,1 GB, se puede desplegar en CPU o en una GPU pequeña para una demo interactiva de clasificación de SMS.

## Benchmarks y rendimiento

Resultados publicados por el autor con umbral 0,5:

| Conjunto de prueba | n | Precision | Recall | F1 |
|---|---|---|---|---|
| SMS reales en inglés (held out) | 1.115 | 0,980 | 0,980 | 0,980 |
| Hindi, traducción automática | 449 | 0,973 | 0,980 | 0,977 |
| Kannada, traducción automática | 449 | 0,961 | 0,980 | 0,970 |
| Tamil, traducción automática | 449 | 0,967 | 0,973 | 0,970 |
| Hindi, sintético (con ayuda de IA) | 100 | 1,000 | 1,000 | 1,000 |
| Kannada, sintético | 100 | 1,000 | 1,000 | 1,000 |
| Tamil, sintético | 100 | 1,000 | 1,000 | 1,000 |

El propio autor advierte que las filas de traducción automática están sesgadas al alza porque usan la misma herramienta que generó parte del entrenamiento, y que los conjuntos sintéticos son repetitivos y temáticamente cercanos a los datos de entrenamiento. Solo la fila de inglés corresponde a mensajes reales escritos por personas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,6 GB de pesos más memoria de activaciones; con batch pequeño cabe holgadamente en 2-4 GB.
- En fp32, los pesos ocupan aproximadamente 1,1 GB; sigue siendo viable en GPU de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) para lotes grandes; una T4 es suficiente, como demuestra el entrenamiento original.
- Cabe en GPU consumer e incluso en CPU para inferencia de un solo mensaje, con latencia de decenas de milisegundos por muestra.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI) para servir embeddings y clasificación, y exportación a ONNX no documentada por el autor.
- Throughput y latencia concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SilverClick scam-message detector | 278 M | 128 tokens (entrenamiento) | en, hi, kn, ta | No disponible | Fine-tuning educativo de XLM-R base sobre SMS |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 tokens | ~100 idiomas | MIT | Modelo base sin ajuste; no clasifica spam por sí solo |
| `mrm8488/bert-tiny-finetuned-sms-spam-detection` | ~4,4 M | 512 tokens | en | No verificada en esta ficha | Alternativa mucho más pequeña, solo inglés; datos no disponibles aquí |
| `ProsusAI/finbert` | ~110 M | 512 tokens | en | No verificada en esta ficha | Clasificador financiero, no de spam; se cita como referencia de encoder ajustado |

La comparación con alternativas específicas de detección de spam multilingüe en hindi, kannada y tamil no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado con mensajes fraudulentos reales en hindi, kannada ni tamil; solo el conjunto inglés procede de mensajes humanos reales.
- Los conjuntos de prueba traducidos automáticamente comparten herramienta con los datos de entrenamiento, por lo que sus métricas están infladas.
- Los conjuntos sintéticos son repetitivos (cada plantilla aparece cinco veces) y cercanos a datos de entrenamiento; los F1 de 1,000 no reflejan precisión real.
- Los SMS ingleses de entrenamiento son de estilo antiguo (Reino Unido/Singapur) y no representan fraudes típicos de la India como UPI o KYC.
- Versiones anteriores marcaban como fraude notificaciones legítimas de OTP por reaccionar a los dígitos; el autor indica que los ejemplos probados se corrigieron, pero pueden persistir errores similares.
- Mensajes muy cortos, inusuales, con mezcla de idiomas o de nuevos tipos de fraude pueden escaparse o generar falsos positivos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza.
- Licencia no disponible: el autor remite a verificar las licencias de `xlm-roberta-base`, UCI SMS Spam Collection y NLLB-200, cuyos pesos cree que son no comerciales; el uso comercial no está garantizado.
- Uso previsto exclusivamente educativo y de demostración; no debe emplearse para bloquear mensajes, tomar decisiones de seguridad ni como evidencia legal.
- El sitio web formula las respuestas como "puede ser un fraude", nunca como "seguro", lo que refleja la incertidumbre del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AngelinaClarke/silverclick-scam-xlmr
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- SMS Spam Collection (UCI): https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- Modelo de traducción NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Documentación de `transformers` para pipelines de clasificación: https://huggingface.co/docs/transformers/main_classes/pipelines
