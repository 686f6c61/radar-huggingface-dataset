# Lucyzmf/pinet-fasttext-es

## Resumen

`pinet-fasttext-es` es un modelo de embeddings de palabras (word embeddings) entrenado con fastText sobre un volcado de la Wikipedia en castellano. Lo publica el usuario Lucyzmf en HuggingFace y su propósito no es generar texto, sino producir representaciones vectoriales de 300 dimensiones para palabras y, de forma destacable, para sílabas. El modelo se creó como artefacto auxiliar de un estudio de neurociencia cognitiva sobre la jerarquía de códigos neurales en la producción del lenguaje (Zhang, Lévy, d'Ascoli, Rapin, Alario, Bourdillon, Pinet y King).

La diferencia clave respecto a los vectores oficiales de fastText en castellano es el uso de n-gramas de caracteres desde longitud 1 (`-minn 1`) hasta 5. Esta configuración permite que unidades cortas como las sílabas ("pa", "lo", "tras") reciban embeddings informativos, algo que con el mínimo habitual de 3 caracteres quedaría mal cubierto. Es, por tanto, una herramienta muy específica para investigación lingüística y neurociencia del lenguaje, no un modelo de propósito general.

El repositorio ocupa 7,2 GB, contiene un único fichero `.bin` de fastText y se distribuye bajo licencia CC BY-SA 4.0, heredada del texto de Wikipedia usado para el entrenamiento. No es un modelo transformer ni tiene ventana de contexto ni capacidad generativa: es un modelo de bolsa de n-gramas con arquitectura skip-gram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText skip-gram con n-gramas de caracteres (subword) |
| Parametros totales | no disponible (el tamano del fichero es de 7.199.985.976 bytes, dominado por la tabla de n-gramas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (formato binario nativo de fastText; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (castellano) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | binario de fastText (`.bin`), cargable con `fasttext.load_model` |
| Dimension del embedding | 300 |
| Rango de n-gramas | 1 a 5 caracteres (`-minn 1 -maxn 5`) |
| Fecha de creacion en el repo | 2026-10-26 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura skip-gram de fastText, que aprende representaciones vectoriales prediciendo el contexto a partir de una palabra objetivo y enriquece cada token con la suma de los embeddings de sus n-gramas de caracteres. En este caso se emplean n-gramas de longitud 1 a 5, lo que permite obtener vectores para cadenas cortas como sílabas, prefijos y sufijos, e incluso para palabras fuera de vocabulario mediante composición de subunidades. La dimensión del vector es 300 y el resto de hiperparámetros quedan en los valores por defecto de fastText.

El corpus de entrenamiento es un volcado de la Wikipedia en castellano (`eswiki-latest-pages-articles.xml.bz2`) convertido a texto plano con la herramienta `wp2txt`, con una frase por línea. La fecha exacta del volcado no se registró en la model card. El comando de entrenamiento documentado es `./fasttext skipgram -input all.txt -output wiki_all_minn1 -minn 1 -maxn 5 -dim 300`. No se menciona ningún proceso de ajuste fino, RLHF, DPO ni evaluación intrínseca de los embeddings (por ejemplo, en tareas de analogía o similitud semántica).

## Capacidades

- Generación de embeddings de palabras en castellano con vectores de 300 dimensiones.
- Generación de embeddings para sílabas y otras cadenas cortas gracias a los n-gramas de longitud 1 a 5.
- Representación de palabras fuera de vocabulario mediante composición de subword n-grams.
- Cálculo de similitud semántica y vecindad entre tokens (coseno, producto escalar).
- Uso como capa de entrada o características en pipelines de neurociencia del lenguaje y psicolingüística.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades multimodales (visión, audio) ni generación de texto.
- Capacidad multilingüe: únicamente castellano.

## Casos de uso

- Investigación en neurociencia del lenguaje: el modelo sirve para construir estímulos vectoriales de sílabas y palabras que luego se correlacionan con señales cerebrales (MEG, EEG, fMRI) en estudios de producción del lenguaje, tal como se plantea en el paper asociado.
- Psicolingüística experimental: permite seleccionar pares de sílabas o palabras con distancias semánticas controladas para diseñar paradigmas de priming o de decisión léxica.
- Análisis de corpus lingüísticos: obtener representaciones de unidades subléxicas para estudiar morfología, silabificación y estructura fonotáctica del castellano.
- Modelado de similitud léxica: calcular vecinos cercanos de una palabra o sílaba para tareas de normalización, expansión de consultas o agrupamiento de términos en dominios especializados.
- Extracción de características para clasificadores clásicos: usar los vectores de 300 dimensiones como entrada de modelos de clasificación de texto (SVM, regresión logística) en lugar de soluciones neuronales más pesadas.
- Reproducibilidad de experimentos: el fichero y el comando de entrenamiento están documentados con hash SHA-256, lo que facilita replicar exactamente el pipeline en estudios que citen el trabajo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El fichero pesa 7,2 GB en disco; conviene reservar al menos 8 GB libres para la descarga y la carga.
- La carga del modelo con `fasttext.load_model` mantiene en memoria la tabla de n-gramas, por lo que se recomienda un mínimo de 8-16 GB de RAM para trabajar con holgura.
- No requiere GPU para inferencia; funciona en CPU. Una GPU no aporta ventajas significativas en este tipo de modelo.
- Cabe en cualquier portátil moderno con suficiente RAM; no es necesario hardware de datacenter.
- Opciones de despliegue: la librería oficial `fasttext` (Python/C++), o envoltorios como `fasttext-wheel`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, la consulta de vectores es una operación de tabla hash más suma de n-gramas, del orden de microsegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pinet-fasttext-es` | fastText skip-gram, n-gramas 1-5 | 300 | es | CC BY-SA 4.0 | HuggingFace (Lucyzmf) |
| fastText oficial `cc.es.300` | fastText skip-gram, n-gramas 3-6 | 300 | es | CC BY-SA 3.0 | Sitio oficial de fastText |
| `Spanish Word Embeddings` (SBWC) | word2vec / fastText sobre corpus SBWC | 100-300 | es | varía (a menudo CC BY) | HuggingFace y repos académicos |
| BETO (`dccuchile/bert-base-spanish-wwm-cased`) | Transformer encoder | 768 | es | Apache 2.0 | HuggingFace |

La diferencia principal frente a los vectores oficiales de fastText es el rango de n-gramas, que en este modelo baja hasta 1 carácter para cubrir sílabas. Frente a BETO, este modelo no ofrece representaciones contextuales ni atención, pero es mucho más ligero y determinista.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas y no puede usarse como chatbot ni como asistente.
- Los embeddings son estáticos: cada palabra o sílaba tiene un único vector independientemente del contexto en que aparezca.
- El corpus de entrenamiento es la Wikipedia en castellano, con los sesgos de cobertura, registro enciclopédico y desequilibrio temático propios de esa fuente.
- La fecha del volcado de Wikipedia no se registró, lo que dificulta evaluar la actualidad del vocabulario.
- No se documentan evaluaciones de calidad de los embeddings (similitud, analogías, cobertura de vocabulario).
- El modelo está entrenado solo en castellano; su uso con otros idiomas o con jerga muy específica no está validado.
- La licencia CC BY-SA 4.0 obliga a atribuir y a compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- El tamaño de 7,2 GB puede ser excesivo para despliegues con memoria limitada; no se ofrecen versiones reducidas ni cuantizadas.
- No hay garantías de mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lucyzmf/pinet-fasttext-es
- Herramienta de conversión usada en el entrenamiento (wp2txt): https://github.com/yohasebe/wp2txt
- Referencia del paper citado en la model card: Zhang, M., Lévy, J., d'Ascoli, S., Rapin, J., Alario, F.-X., Bourdillon, P., Pinet, S., King, J.-R. *A hierarchy of dynamic neural codes supports successive linguistic neural representations and coordinates language production in the human brain.* (enlace directo no disponible en la información proporcionada)
- Documentación oficial de fastText: https://fasttext.cc
