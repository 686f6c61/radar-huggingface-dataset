# GoktugD/Werea-TR-TextRestore

## Resumen

Werea-TR-TextRestore es un modelo de restauración de diacríticos para el turco, desarrollado por Göktuğ Düşünen (GoktugD) en el marco del proyecto Werea. Su función es convertir texto turco ASCIIizado (sin tildes ni caracteres especiales) en texto correctamente acentuado, por ejemplo: "Ahmet Yilmaz Istanbulda" se transforma en "Ahmet Yılmaz İstanbul'da". Se trata de un fine-tuning del modelo multilingüe mT5-small de Google, entrenado específicamente con el dataset de noticias turcas TR-News.

El modelo resuelve un problema práctico en el procesamiento de lenguaje natural para turco: la pérdida de diacríticos en entradas de usuario, OCR o transcripciones, que afecta a la interpretación semántica y gramatical. Al estar basado en mT5-small, cuenta con 300 millones de parámetros y una arquitectura encoder-decoder, lo que lo hace ligero y desplegable en entornos con recursos limitados. Su relevancia radica en que ofrece una solución específica y de código abierto (licencia MIT) para un idioma con poca cobertura en este tipo de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en google/mt5-small) |
| Parametros totales | 300.176.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mT5-small, un transformer encoder-decoder multilingüe de Google, y se somete a un fine-tuning supervisado sobre el dataset TR-News, compuesto por oraciones reales de noticias turcas. El entrenamiento utiliza un prefijo fijo "şapka: " para indicar la tarea de restauración de diacríticos, siguiendo el paradigma text2text de T5. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal es la especialización en un idioma concreto y la evaluación sobre texto real separado del entrenamiento, lo que garantiza una medición realista del rendimiento.

## Capacidades

- Restauración de diacríticos turcos (şapka) en texto ASCIIizado, incluyendo caracteres como ı, İ, ş, ğ, ü, ö, ç y el apóstrofo en nombres propios.
- Generación de texto corregido a partir de entrada con prefijo "şapka: ", mediante pipeline de text2text-generation.
- Manejo de oraciones completas de noticias, no solo palabras sueltas, gracias al entrenamiento con frases reales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Multilingüismo limitado: aunque mT5 es multilingüe, el fine-tuning está orientado exclusivamente al turco.

## Casos de uso

- Normalización de texto en aplicaciones de mensajería: usuarios que escriben sin tildes por comodidad; el modelo puede corregir automáticamente los mensajes antes de enviarlos o almacenarlos.
- Preprocesamiento para pipelines de NLP en turco: antes de aplicar análisis morfológico, traducción automática o búsqueda semántica, se restaura la acentuación para mejorar la precisión de los modelos aguas abajo.
- Corrección de salidas de OCR: documentos escaneados o imágenes con texto turco suelen perder diacríticos; el modelo puede restaurarlos en lotes.
- Mejora de motores de búsqueda: indexar texto correctamente acentuado permite recuperar resultados más relevantes, ya que en turco la acentuación cambia el significado (por ejemplo, "kar" vs "kâr").
- Asistencia en redacción: herramientas de escritura que sugieren la forma correcta de palabras turcas cuando el usuario omite tildes.
- Limpieza de datos para entrenamiento de modelos: al normalizar grandes volúmenes de texto turco procedente de redes sociales o foros, se reduce el ruido en los datasets.

## Benchmarks y rendimiento

El autor reporta una precisión a nivel de palabra del 96,5% sobre un conjunto de test separado de oraciones reales de noticias. No se han publicado comparaciones con otros modelos de restauración de diacríticos en la información disponible.

| Metrica | Resultado |
|---|---|
| Precision a nivel de palabra (test separado) | 96,5% |

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene 300M parámetros, por lo que puede ejecutarse en CPU con un uso de memoria de aproximadamente 1,2 GB en fp32 (estimación estándar para este tamaño).
- GPU consumer: cabe en GPUs con 2 GB de VRAM o más, como GTX 1650, RTX 3050 o superiores. Con cuantización int8, el uso de memoria se reduce a unos 600 MB.
- Despliegue: compatible con la librería transformers de Hugging Face mediante pipeline("text2text-generation"). También puede servirse con vLLM o TGI, aunque al ser un modelo pequeño no requiere infraestructura especializada.
- Latencia: no se dispone de mediciones oficiales, pero al ser un modelo de 300M parámetros, la inferencia en GPU es del orden de milisegundos por oración corta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros enfoques para restauración de diacríticos en turco, como reglas heurísticas o modelos basados en LSTM, pero no se han encontrado datos públicos que permitan una comparación cuantitativa con Werea-TR-TextRestore.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con noticias turcas, por lo que su rendimiento puede degradarse en dominios muy diferentes (jerga técnica, lenguaje coloquial, dialectos regionales).
- No se han documentado sesgos específicos, pero al provenir de un corpus de noticias, puede reflejar los sesgos presentes en ese tipo de texto.
- Riesgo de alucinación: al ser un modelo generativo, podría introducir cambios no deseados en palabras ambiguas o nombres propios poco frecuentes.
- Solo soporta turco; no se recomienda su uso para otros idiomas.
- La longitud de contexto no está especificada; se asume la limitación típica de mT5-small (512 tokens), pero no está confirmada.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías de precisión en producción.

## Enlaces

- [Modelo en Hugging Face (GoktugD/Werea-TR-TextRestore)](https://huggingface.co/GoktugD/Werea-TR-TextRestore)
- [Espejo oficial Werea-co/Werea-TR-TextRestore](https://huggingface.co/Werea-co/Werea-TR-TextRestore)
- [Dataset TR-News](https://huggingface.co/datasets/batubayk/TR-News)
- [Modelo base google/mt5-small](https://huggingface.co/google/mt5-small)
- [Espacio de GoktugD en Hugging Face](https://huggingface.co/spaces/GoktugD/goktug-ai-lab)
- [Sitio web de Werea](https://werea.co)
