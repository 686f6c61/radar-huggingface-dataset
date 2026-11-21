# Only-A7med/fake-tweets-detection

## Resumen

`Only-A7med/fake-tweets-detection` es un conjunto de artefactos entrenados para la clasificación binaria de tuits en inglés como reales (etiqueta 1) o falsos (etiqueta 0). Lo publica el autor Only-A7med como material complementario del artículo "Fake Tweets Detection using Bi-LSTM with GloVe Embedding", presentado en ICCIKE 2025 (Dubai). No es un modelo de lenguaje generativo: son dos clasificadores supervisados empaquetados en el repositorio, un pipeline TF-IDF + regresión logística y una red Bi-LSTM con embeddings GloVe de 100 dimensiones.

El interés técnico del repositorio no está en su tamaño —el repo ocupa 0,2 GB y el entrenamiento se hizo íntegramente en CPU— sino en la documentación del protocolo de evaluación. El autor publica dos conjuntos de artefactos: uno que replica fielmente el protocolo del artículo (aumento de datos antes del split, con fuga de información entre train y test) y otro etiquetado como `safe`, que divide primero y aumenta solo el lado de entrenamiento. Esta separación explícita entre resultados de reproducción y resultados honestos de generalización es poco habitual y resulta útil para quien quiera evaluar la robustez real de este tipo de detectores.

El modelo se apoya en el dataset TruthSeeker 2023 (Canadian Institute for Cybersecurity, University of New Brunswick), con 134.198 tuits tras la limpieza, y en los vectores GloVe 6B de Stanford NLP. La licencia del código es MIT, aunque el dataset subyacente tiene sus propios términos de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: TF-IDF + regresión logística (scikit-learn) y Bi-LSTM + GloVe 100-d (Keras 3) |
| Parametros totales | no disponible (no se publica el recuento de parámetros de la Bi-LSTM) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud de secuencia configurada para la Bi-LSTM); el baseline TF-IDF no tiene ventana fija |
| Tipos de cuantizacion | no disponible (artefactos en formato nativo Keras y joblib; no se publican variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (código y artefactos); el dataset TruthSeeker requiere citación |
| Formato de pesos | `.keras` (Keras 3) y `.joblib` (pipeline scikit-learn); historial de entrenamiento en `.json` |
| Vocabulario | 50.000 tokens; cobertura GloVe de 25.365 (protocolo `paper`) y 25.209 (protocolo `safe`) |
| Unidades LSTM / densas | 64 / 64 |
| Batch size | 128 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El repositorio contiene dos clasificadores independientes. El primero es un pipeline clásico de scikit-learn que combina vectorización TF-IDF con una regresión logística, serializado con joblib. El segundo es una red Bi-LSTM implementada en Keras 3 que incorpora su propia capa `TextVectorization`, de modo que consume cadenas de texto en crudo sin necesidad de un tokenizador externo; sobre esa capa se aplican embeddings GloVe de 100 dimensiones preentrenados (GloVe 6B, Stanford NLP), seguidos de 64 unidades LSTM bidireccionales y 64 unidades densas. La longitud de secuencia es de 64 tokens y el vocabulario de 50.000 entradas, de las cuales GloVe cubre aproximadamente la mitad.

El entrenamiento se realizó íntegramente en CPU (Intel Core i5-13500H, 15,6 GB de RAM, Windows 11, Python 3.11.9, TensorFlow 2.21.0, Keras 3.15.1, scikit-learn 1.9.0), con semilla 42 fijada en `random`, NumPy, TensorFlow y scikit-learn. Los tiempos registrados son 32,1 s (protocolo `paper`) y 34,6 s (protocolo `safe`) para la regresión logística, y 19,5 min y 18,6 min respectivamente para la Bi-LSTM. No se menciona RLHF, DPO ni ningún ajuste por preferencias: es entrenamiento supervisado puro sobre etiquetas binarias.

La innovación metodológica destacable es la doble evaluación. En el protocolo `paper` se aumenta el dataset limpio hasta 200.000 filas y después se divide 80/20, lo que permite que variantes con palabras intercambiadas de un mismo tuit original caigan en ambos lados del split y contaminen el test. En el protocolo `safe` se divide primero 80/20 sobre los tuits originales y solo se aumenta el lado de entrenamiento hasta 160.000 filas, garantizando que ninguna fila de test aparezca en entrenamiento ni como original ni como variante.

## Capacidades

- Clasificación binaria de texto: asigna P(real) a un tuit en inglés, con umbral de decisión en 0,5.
- Consumo de texto en crudo en el caso de la Bi-LSTM (capa `TextVectorization` integrada); el baseline acepta listas de cadenas y devuelve probabilidades vía `predict_proba`.
- Detección de desinformación en redes sociales, específicamente en el dominio de Twitter/X en inglés.
- Dos variantes con compromisos distintos: el baseline TF-IDF + regresión logística es más rápido de entrenar y de inferir; la Bi-LSTM captura algo de orden secuencial mediante el embedding aprendido y GloVe.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es multilingüe: solo inglés. El directorio `arabic/` está reservado para una extensión bilingüe que aún no se ha publicado.
- Salida interpretable como probabilidad calibrable manualmente (no se documenta calibración formal).

## Casos de uso

- Moderación de contenido en plataformas sociales: el clasificador puede puntuar tuits entrantes con P(fake) y derivar a revisión humana los que superen un umbral configurable; el baseline TF-IDF es adecuado para este uso por su latencia baja y su entrenamiento en 32 s.
- Filtrado previo en pipelines de verificación periodística: integrado como primera etapa que descarta contenido claramente real y concentra el esfuerzo de verificación en los candidatos sospechosos, usando la Bi-LSTM cuando se quiera algo más de señal secuencial.
- Investigación académica sobre detección de desinformación: el repositorio publica ambos protocolos de evaluación, lo que permite reproducir el artículo original y comparar contra una línea base sin fuga de datos, algo poco frecuente en este nicho.
- Generación de datasets etiquetados a escala: aplicar el modelo sobre grandes volúmenes de tuits históricos para preetiquetar y luego revisar manualmente una muestra, acelerando la anotación.
- Sistemas de alerta temprana en monitorización de redes: al ser un modelo pequeño que corre en CPU, puede desplegarse en un contenedor ligero junto a un colector de streams y emitir puntuaciones en tiempo casi real sin GPU.
- Evaluación comparativa de arquitecturas: sirve como caso de estudio reproducible de la diferencia entre métricas con fuga de datos y métricas honestas, útil en docencia o en la validación de metodologías de evaluación.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el conjunto de test retenido de cada protocolo, con los artefactos publicados en el repositorio:

| Protocolo | Modelo | Accuracy | Precision | Recall | F1 | n test |
|---|---|---|---|---|---|---|
| paper | TF-IDF + Regresión logística | 0,9721 | 0,9714 | 0,9746 | 0,9730 | 40.000 |
| paper | Bi-LSTM + GloVe | 0,9684 | 0,9751 | 0,9632 | 0,9691 | 40.000 |
| safe | TF-IDF + Regresión logística | 0,9774 | 0,9762 | 0,9799 | 0,9780 | 26.804 |
| safe | Bi-LSTM + GloVe | 0,9583 | 0,9287 | 0,9951 | 0,9608 | 26.804 |

Como referencia, los autores originales del artículo reportan 98,1 % (regresión logística) y 98,2 % (Bi-LSTM) sobre un split de test de 40.000 tuits. Esas cifras son las publicadas por ellos, no mediciones de estos artefactos.

## Requisitos de hardware

- Inferencia en CPU es suficiente: el entrenamiento completo se hizo en un Intel Core i5-13500H sin GPU, y la inferencia es órdenes de magnitud más barata.
- VRAM estimada: 0 GB en el caso de ejecución en CPU; no se documenta requisito de VRAM para GPU.
- GPU recomendadas: no aplica; cualquier GPU consumer (por ejemplo, RTX 3060 en adelante) aceleraría la Bi-LSTM pero no es necesaria.
- Cabe en cualquier GPU consumer y en equipos sin GPU dedicada, dado el tamaño del repositorio (0,2 GB) y la arquitectura ligera.
- Opciones de despliegue: carga directa con `keras.saving.load_model` y `joblib.load`; el autor menciona una aplicación Flask que sirve por defecto los artefactos del protocolo `safe`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no se publican mediciones de inferencia; solo tiempos de entrenamiento (32,1 s y 34,6 s para la regresión logística; 19,5 min y 18,6 min para la Bi-LSTM).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Only-A7med/fake-tweets-detection (baseline) | TF-IDF + regresión logística | no disponible | no aplica (bolsa de palabras) | MIT | Hugging Face, repo privado con token |
| Only-A7med/fake-tweets-detection (Bi-LSTM) | Bi-LSTM + GloVe 100-d | no disponible | 64 tokens | MIT | Hugging Face, repo privado con token |
| Clasificadores BERT base fine-tuneados para detección de fake news | Transformer encoder | ~110 M | 512 tokens | variable según checkpoint | múltiples en Hugging Face |
| Modelos de detección de desinformación basados en RoBERTa | Transformer encoder | ~125 M | 512 tokens | variable según checkpoint | múltiples en Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre este modelo y las alternativas transformer en la información proporcionada; las cifras de accuracy del autor no son directamente comparables con las de otros checkpoints porque dependen del dataset TruthSeeker y del protocolo de evaluación.

## Limitaciones y advertencias

- El repositorio es privado: las descargas requieren un token de lectura, lo que complica la reproducibilidad y el uso en CI/CD sin credenciales.
- El modelo solo clasifica tuits en inglés; no hay soporte multilingüe y la extensión árabe anunciada no está publicada.
- La ventana de 64 tokens trunca tuits largos y descarta información más allá de esa longitud en la Bi-LSTM.
- El baseline TF-IDF no modela orden de palabras ni contexto, por lo que puede fallar ante negaciones, ironía o reformulaciones.
- El protocolo `paper` tiene fuga de datos conocida y documentada; sus métricas no deben interpretarse como capacidad de generalización.
- La Bi-LSTM en el protocolo `safe` muestra un recall muy alto (0,9951) con precision más baja (0,9287), lo que indica una tendencia a sobrerrepresentar la clase fake; conviene ajustar el umbral según el coste de falsos positivos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea sobre dominios distintos al de entrenamiento (por ejemplo, tuits políticos de otras regiones o idiomas).
- El dataset TruthSeeker exige citación en cualquier uso o redistribución; la licencia MIT cubre el código y los artefactos, no los datos.
- No se documenta calibración de probabilidades ni análisis de sesgos por tema, usuario o demografía, lo que limita su uso en producción sin auditoría previa.
- El autor advierte que la aplicación Flask sirve por defecto los artefactos `safe`; usar los `paper` en producción daría una falsa sensación de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Only-A7med/fake-tweets-detection
- Repositorio de código (privado según la model card): https://github.com/Only-A7med/Fake-Tweets-Detection
- Artículo: A. Tariq, S. I. Khan, M. Imran, A. Mustafa and Z. Elgamal, "Fake Tweets Detection using Bi-LSTM with GloVe Embedding," ICCIKE 2025, pp. 737–742, doi: 10.1109/ICCIKE67021.2025.11318261 — https://doi.org/10.1109/ICCIKE67021.2025.11318261
- Dataset TruthSeeker: S. Dadkhah, X. Zhang, A. G. Weismann, A. Firouzi and A. A. Ghorbani, "The Largest Social Media Ground-Truth Dataset for Real/Fake Content: TruthSeeker," IEEE Transactions on Computational Social Systems, vol. 11, no. 3, pp. 3376–3390, junio 2024, doi: 10.1109/TCSS.2023.3322303 — https://doi.org/10.1109/TCSS.2023.3322303
- Mirror del dataset en Kaggle: https://www.kaggle.com/datasets/sudishbasnet/truthseekertwitterdataset2023
- Embeddings GloVe 6B (Stanford NLP): https://nlp.stanford.edu/projects/glove/
