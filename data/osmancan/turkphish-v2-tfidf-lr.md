# OsmanCan/turkphish-v2-tfidf-lr

## Resumen

TurkPhish v2 TF-IDF + regresión logística es un clasificador binario de correo electrónico de phishing en turco. Lo desarrollan Osman Can Çetlenbik (Universidad de Manisa Celal Bayar) y Ahmet Ali Süzen (Universidad de Ciencias Aplicadas de Isparta), y acompaña al artículo publicado en *Applied Sciences* 16(16):8274 (2026). No es una red neuronal: es un pipeline clásico de scikit-learn que combina características TF-IDF de palabras (1–2 gramos) y de caracteres (3–5 gramos) con un modelo de regresión logística.

El modelo resuelve un problema acotado: decidir si un correo escrito en turco es legítimo (clase 0) o de phishing (clase 1), devolviendo una probabilidad calibrada mediante `predict_proba`. Su relevancia radica en que, según el artículo, supera claramente a los transformers multilingües en el escenario de generalización a temas no vistos: 0,947 de macro-F1 en el split out-of-theme (OOT) frente a 0,848 de BERTurk, 0,818 de XLM-R y 0,570 de mBERT. Todo ello con un artefacto de 0,5 MB que no requiere GPU.

El contexto de entrenamiento es un corpus sintético de 2.653 correos generados por plantillas (TurkPhish v2), sin HTML, cabeceras ni adjuntos. El modelo publicado se ha reentrenado sobre el conjunto completo con el seed 42 del artículo, y está pensado como señal auxiliar en sistemas de filtrado, no como producto de seguridad autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF (palabras 1–2 gramos + caracteres 3–5 gramos) + regresión logística (scikit-learn) |
| Parámetros totales | no disponible (modelo lineal; el vector de pesos depende del vocabulario TF-IDF) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no hay ventana de atención; el texto se vectoriza completo y se trunca según la configuración TF-IDF, no documentada) |
| Tipos de cuantización | no aplica; serialización nativa `skops` (sin cuantización) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.skops` (serialización segura de scikit-learn vía skops) |

## Arquitectura y entrenamiento

El pipeline es un `Pipeline` de scikit-learn: un `TfidfVectorizer` (o una unión de dos, uno a nivel de palabra con n-gramas 1–2 y otro a nivel de carácter con n-gramas 3–5) seguido de `LogisticRegression`. No hay capas neuronales, ni atención, ni embeddings contextuales; cada correo se representa como un vector disperso de frecuencias ponderadas y la decisión es una función logística sobre esa representación. El preprocesado exige normalizar el texto turco a ASCII (ş→s, ı→i, ç→c, ğ→g, ö→o, ü→u, tanto en minúsculas como en mayúsculas) antes de la inferencia, y concatenar asunto y cuerpo con un salto de línea: `subject + "\n" + body`.

El entrenamiento se realizó sobre TurkPhish v2, un corpus de 2.653 correos generados mediante una matriz de plantillas, con particiones in-distribution (ID, 531 correos) y out-of-theme (OOT, 530 correos). En el split OOT los temas `kripto_yatirim` (inversión en criptomonedas) y `egitim_burs` (becas educativas) no aparecen en entrenamiento, lo que convierte esa partición en una prueba de generalización temática. El modelo publicado se reentrenó con los hiperparámetros del artículo y seed 42; el autor indica que los resultados reproducen exactamente los del paper. No consta RLHF, DPO ni ajuste por preferencias: es aprendizaje supervisado clásico con etiquetas binarias.

## Capacidades

- Clasificación binaria de correo turco en legítimo (0) o phishing (1), con probabilidad asociada vía `predict_proba`.
- Detección de patrones léxicos y de n-gramas de carácter asociados a phishing (urgencia, suplantación de entidades, llamadas a la acción con enlaces).
- Generalización a temas de phishing no vistos en entrenamiento: 0,947 de macro-F1 en OOT con temas excluidos.
- Inferencia muy rápida en CPU: el autor declara "miles de correos por segundo" y un artefacto de 0,5 MB.
- Entrada de texto plano con marcadores de anonimización previstos en el entrenamiento: `[URL]`, `[KURUM]` (institución), `[TELEFON]`, `[EPOSTA]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Multilingüe: no. Solo turco; el propio preprocesado (plegado a ASCII) está diseñado para la ortografía turca.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo en pasarelas de correo: el clasificador se ejecuta en CPU sobre cada mensaje entrante y etiqueta con una probabilidad de phishing; por su coste mínimo (0,5 MB, sin GPU) puede aplicarse a todo el tráfico antes de modelos más caros.
- Señal auxiliar en un ensemble con transformers: combinar la probabilidad del TF-IDF+LR con la de BERTurk o XLM-R permite cubrir casos en los que el modelo neuronal falla en temas nuevos, dado el mejor OOT del modelo lineal en el artículo.
- Priorización en la bandeja de cuarentena: ordenar los correos retenidos por `predict_proba` para que los analistas de SOC revisen primero los de mayor riesgo.
- Detección en entornos con recursos limitados: despliegue en servidores sin GPU, contenedores pequeños o incluso dispositivos perimetrales, donde un transformer turco no cabría.
- Monitorización de campañas de phishing dirigidas a usuarios turcos: procesado por lotes de buzones históricos para identificar mensajes sospechosos y alimentar informes de exposición.
- Enriquecimiento de pipelines de threat intelligence: usar la salida binaria y la probabilidad como característica adicional en un motor de reglas que combine remitente, reputación de dominio y contenido.
- Investigación y docencia en ciberseguridad: baseline reproducible (script `train.py`, seed 42) para comparar detectores de phishing en turco con particiones ID/OOT controladas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index` y `eval_results.json`), no verificados de forma independiente (`verified: false`).

| Test | Macro-F1 | Exactitud | Sensibilidad a phishing | ROC-AUC |
|---|---:|---:|---:|---:|
| In-distribution (ID, 531 correos) | 1,000 | 1,000 | 1,000 | 1,000 |
| Out-of-theme (OOT, 530 correos) | 0,947 | 0,947 | 0,896 | 0,9997 |

Comparativa de macro-F1 en OOT publicada en el artículo:

| Modelo | Macro-F1 (OOT) |
|---|---:|
| TurkPhish v2 TF-IDF + LR (este modelo) | 0,947 |
| BERTurk | 0,848 |
| XLM-R | 0,818 |
| mBERT | 0,570 |

## Requisitos de hardware

- VRAM: 0 GB. Es un modelo lineal serializado en `skops`; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna. No se beneficia de aceleración por GPU en su forma actual (scikit-learn en CPU).
- GPU de consumo: irrelevante; cabe en cualquier máquina, incluidos portátiles modestos y contenedores de 512 MB de RAM o menos.
- Despliegue: Python con `scikit-learn==1.6.1`, `skops` y `huggingface_hub`; descarga del artefacto con `hf_hub_download`. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: el autor declara "miles de correos por segundo" en CPU; no se publican cifras exactas de latencia por correo ni de hardware de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro-F1 OOT | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| TurkPhish v2 TF-IDF + LR | TF-IDF + regresión logística | no disponible (lineal, 0,5 MB) | no disponible | 0,947 | CC BY 4.0 | Hugging Face |
| BERTurk | Transformer encoder | ~110 M (BERT base) | 512 tokens | 0,848 | según checkpoint base | Hugging Face |
| XLM-R | Transformer encoder multilingüe | ~278 M (base) | 512 tokens | 0,818 | según checkpoint base | Hugging Face |
| mBERT | Transformer encoder multilingüe | ~178 M (base) | 512 tokens | 0,570 | según checkpoint base | Hugging Face |

La comparación es la reportada en el artículo para la misma tarea y partición OOT. El modelo lineal gana en generalización temática y coste computacional, pero los transformers aportan representaciones contextuales que el TF-IDF no captura; el artículo no desglosa latencia ni consumo de memoria de los competidores.

## Limitaciones y advertencias

- Entrenado con datos sintéticos generados por plantillas: TurkPhish v2 no contiene HTML, cabeceras ni adjuntos, por lo que el modelo no ve señales que sí están presentes en correo real (dominios del remitente, SPF/DKIM, enlaces reales, adjuntos). Es obligatorio validar sobre tráfico propio antes de usarlo en producción.
- El autor reconoce que la auditoría de nivel de frase (Q6) del artículo no se superó: existen frases que aparecen en una sola clase, y parte del alto rendimiento puede deberse a esos patrones superficiales en lugar a una comprensión semántica.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos: la sensibilidad a phishing en OOT es 0,896, es decir, aproximadamente un 10 % de correos maliciosos no detectados en esa partición.
- No es un producto de seguridad autónomo; el autor lo posiciona explícitamente como señal auxiliar dentro de sistemas de filtrado.
- Solo turco y con plegado a ASCII obligatorio: textos con caracteres turcos sin normalizar o en otros idiomas degradarán la calidad de la predicción.
- El resultado ID de 1,000 en macro-F1 debe interpretarse con cautela: es una partición in-distribution del mismo corpus sintético y no refleja el rendimiento esperado en tráfico real.
- Licencia CC BY 4.0: permite uso comercial y modificaciones con atribución; hay que citar el artículo (Çetlenbik & Süzen, 2026, *Applied Sciences* 16(16):8274).
- Uso declarado exclusivamente defensivo.
- Dependencia de versión: requiere `scikit-learn==1.6.1` para cargar el artefacto `skops` sin incompatibilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsmanCan/turkphish-v2-tfidf-lr
- Dataset TurkPhish v2: https://huggingface.co/datasets/OsmanCan/turkphish-v2
- Artículo (DOI): https://doi.org/10.3390/app16168274
- ORCID de Osman Can Çetlenbik: https://orcid.org/0009-0000-6561-1943
- ORCID de Ahmet Ali Süzen: https://orcid.org/0000-0002-5871-1652
- Contacto: osman.cetlenbik@cbu.edu.tr
