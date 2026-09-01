# Bipin-Pal/suraksha-nlp-muril

## Resumen

El modelo `Bipin-Pal/suraksha-nlp-muril` es un ajuste fino (fine-tuning) de MuRIL base cased, el modelo multilingüe de Google especializado en idiomas indios, orientado a la detección de phishing en textos cortos. Lo desarrolla Bipin-Pal y forma parte del ecosistema del proyecto Suraksha, una plataforma móvil que detecta y bloquea intentos de suplantación en aplicaciones de mensajería y pagos (WhatsApp, UPI) en más de 22 idiomas regionales de la India. El modelo se publica en HuggingFace con formato safetensors y un total de 237.557.762 parámetros, lo que lo sitúa en la categoría de modelos BERT base.

La relevancia de este modelo radica en su enfoque específico para un problema de seguridad crítico en un mercado con enorme diversidad lingüística. A diferencia de los modelos genéricos de detección de phishing entrenados principalmente en inglés, este ajuste aprovecha las capacidades multilingües de MuRIL para entender mensajes en hindi, tamil, bengalí, telugu y otros idiomas indios, donde las estafas por SMS y mensajería son frecuentes. Aunque el repositorio no ofrece detalles sobre el proceso de entrenamiento ni métricas de evaluación, su arquitectura base está bien documentada en la literatura académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (variante MuRIL base cased) |
| Parametros totales | 237.557.762 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estándar de MuRIL base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible para el fine-tuning; MuRIL base soporta 17 idiomas indios (asamés, bengalí, inglés, gujarati, hindi, kannada, cashemir, malayalam, maratí, nepalí, oriya, punjabi, sánscrito, sindhi, tamil, telugu, urdu) |
| Licencia | no disponible (el modelo base MuRIL usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MuRIL (Multilingual Representations for Indian Languages) es un modelo basado en la arquitectura BERT, entrenado desde cero con corpus masivos de texto en idiomas indios. A diferencia de mBERT, que se entrena con datos multilingües generales, MuRIL se entrena exclusivamente con texto indio y se enriquece con pares de documentos traducidos y transliterados para mejorar la transferencia entre escrituras (por ejemplo, hindi en devanagari y su transliteración en latín). El modelo base tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una longitud máxima de secuencia de 512 tokens.

El ajuste fino realizado por Bipin-Pal para crear `suraksha-nlp-muril` no está documentado en el repositorio. No se especifican los datos de entrenamiento, el número de épocas, la técnica de optimización ni si se aplicó algún método de regularización. Dado el contexto del proyecto Suraksha, es razonable inferir que se entrenó con ejemplos etiquetados de mensajes de phishing y legítimos en varios idiomas indios, pero esta información no está disponible públicamente. Tampoco se mencionan innovaciones técnicas adicionales más allá del propio ajuste.

## Capacidades

- Clasificación de texto binaria: el modelo está diseñado para distinguir entre mensajes de phishing y mensajes legítimos, probablemente mediante una cabeza de clasificación añadida sobre la salida de BERT.
- Procesamiento multilingüe: hereda de MuRIL la capacidad de entender 17 idiomas indios, incluyendo escrituras como devanagari, tamil, telugu, bengalí y gurmukhi, así como transliteraciones al alfabeto latino.
- Manejo de textos cortos: al estar pensado para mensajes de WhatsApp y UPI, es adecuado para entradas de longitud reducida (típicamente menos de 200 tokens).
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o audio. El modelo es exclusivamente un codificador para tareas de clasificación.

## Casos de uso

- Detección de phishing en WhatsApp: el modelo puede integrarse en un plugin o bot que analice los mensajes entrantes y marque aquellos que contengan enlaces sospechosos o solicitudes de datos personales, alertando al usuario antes de que haga clic.
- Filtrado de SMS fraudulentos en banca móvil: las entidades financieras pueden desplegar este modelo en sus servidores para clasificar los SMS que reciben sus clientes y bloquear automáticamente los que imiten comunicaciones oficiales.
- Protección en pagos UPI: al integrarse en aplicaciones de pago, puede analizar en tiempo real los mensajes de confirmación o solicitud de transferencia y detectar intentos de suplantación de identidad.
- Moderación de contenido en foros y redes sociales regionales: plataformas que operan en idiomas indios pueden usar el modelo para identificar publicaciones que contengan enlaces de phishing y eliminarlas antes de que lleguen a los usuarios.
- Análisis de correo electrónico en empresas indias: aunque el modelo está pensado para textos cortos, puede adaptarse a la clasificación de correos electrónicos breves, ayudando a los equipos de seguridad a priorizar amenazas en idiomas locales.
- Investigación académica en seguridad multilingüe: sirve como punto de partida para estudiar la transferencia de modelos de detección de fraude entre idiomas indios y para comparar el rendimiento de MuRIL frente a otros modelos multilingües en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas de evaluación (precisión, recall, F1) ni comparaciones con otros modelos. Tampoco se encontraron referencias externas que documenten el rendimiento de este ajuste fino específico. Se recomienda a los usuarios potenciales realizar su propia evaluación con datos representativos antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 237 millones de parámetros, el modelo en FP32 ocupa aproximadamente 950 MB de memoria. En FP16 (si se convierte) ocuparía unos 475 MB, y en INT8 (cuantización) unos 240 MB. Para inferencia en lote, se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o más es suficiente, por ejemplo NVIDIA GTX 1050, GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con 4 GB de RAM, aunque con mayor latencia.
- En consumer GPU: sí, cabe en GPUs de gama baja y media. Un RTX 3060 o similar puede manejar el modelo con holgura.
- Opciones de despliegue: se puede servir con HuggingFace Transformers (Python), ONNX Runtime, TensorRT, o mediante frameworks como FastAPI para crear una API de clasificación. También es compatible con herramientas de cuantización como llama.cpp si se convierte a GGUF, aunque no se proporciona ese formato en el repositorio.
- Latencia y throughput: no disponible. Al ser un BERT base, la latencia típica en CPU es de 10-50 ms por secuencia de 128 tokens, y en GPU de 2-10 ms, pero estos valores dependen del hardware y del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bipin-Pal/suraksha-nlp-muril | 237,6 M | 512 | Indios (17) | no disponible | Fine-tuning para phishing |
| google/muril-base-cased | 236 M | 512 | Indios (17) | Apache 2.0 | Modelo base multilingüe |
| bert-base-multilingual-cased (mBERT) | 178 M | 512 | 104 idiomas | Apache 2.0 | Modelo base multilingüe general |
| XLM-RoBERTa-base | 270 M | 512 | 100 idiomas | MIT | Modelo base multilingüe general |

La comparativa se basa en las características de los modelos base, ya que no hay datos de rendimiento del fine-tuning. `suraksha-nlp-muril` se distingue por su especialización en detección de phishing, mientras que los otros son modelos generales. mBERT y XLM-R cubren más idiomas, pero MuRIL está específicamente optimizado para idiomas indios, lo que puede ofrecer mejor rendimiento en tareas de seguridad para esa región.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste de MuRIL, puede heredar sesgos presentes en los corpus de entrenamiento originales, como desequilibrios entre idiomas o representaciones estereotipadas de ciertos grupos. No se ha realizado una auditoría de sesgos específica para este modelo.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir falsos positivos o negativos en la clasificación, lo que en un contexto de seguridad puede tener consecuencias graves.
- Limitaciones de contexto: la ventana de 512 tokens es adecuada para mensajes cortos, pero no para documentos largos. Si se aplica a correos electrónicos extensos, será necesario truncar o dividir el texto.
- Limitaciones de idioma: aunque MuRIL cubre 17 idiomas indios, no cubre todos los dialectos ni variantes. El rendimiento puede degradarse en idiomas no representados o en transliteraciones poco comunes.
- Restricciones de licencia: la licencia del modelo fine-tuned no está especificada. El modelo base MuRIL usa Apache 2.0, que permite uso comercial, pero el autor del fine-tuning podría haber impuesto restricciones adicionales. Se recomienda contactar con el autor antes de usar el modelo en productos comerciales.
- Caveat para producción: no hay evidencia pública de que el modelo haya sido evaluado en entornos reales. Antes de desplegarlo, es imprescindible validar su precisión y robustez con datos propios, especialmente en un dominio donde los errores pueden exponer a los usuarios a fraudes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Bipin-Pal/suraksha-nlp-muril
- Modelo base MuRIL en HuggingFace: https://huggingface.co/google/muril-base-cased
- Proyecto Suraksha en GitHub: https://github.com/ChiaraDeVenuto/suraksha
- Paper de MuRIL (arXiv): https://arxiv.org/abs/2103.10730
- PDF del paper: https://arxiv.org/pdf/2103.10730
