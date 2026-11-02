# klcn-phishing-lab/klcn16-phishing-lstm

## Resumen

KLCN16 es un modelo de clasificación de texto entrenado para detectar correos electrónicos de phishing (lừa đảo) en vietnamita, desarrollado por el autor klcn-phishing-lab como trabajo de fin de grado en la Facultad de Tecnologías de la Información de la Universidad de Industria y Comercio de Ciudad Ho Chi Minh (Trường Đại học Công Thương TP.HCM). No es un modelo generativo ni un transformer de gran escala: es una red LSTM sobre embeddings Word2Vec que clasifica un correo como malicioso o legítimo.

El modelo principal (M2 en la model card) combina representaciones Word2Vec con una capa LSTM y alcanza un F1 de 0.9890 sobre un conjunto de test de 11.126 correos, con una sensibilidad de 0.9936 y una especificidad de 0.9850. El repositorio incluye además los modelos de contraste (TF-IDF + regresión logística, LSTM con GloVe y FastText, y BiLSTM), los embeddings, los datos procesados y el código de una demo web.

Su relevancia actual es acotada pero concreta: ofrece una línea base reproducible y bien documentada para detección de phishing en vietnamita, un idioma con poca cobertura en herramientas de seguridad del correo, con experimentos de validación cruzada entre fuentes que miden la capacidad de generalizar a campañas de phishing no vistas durante el entrenamiento. El repositorio ocupa 17,4 GB, en su mayor parte por los embeddings y los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM sobre embeddings Word2Vec (modelo principal M2); variantes con GloVe, FastText y BiLSTM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificación a nivel de documento, no generación) |
| Tipos de cuantizacion | no disponible (formato Keras nativo, sin versiones cuantizadas publicadas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (TensorFlow/Keras 3) y `.joblib` (scikit-learn); embeddings en matrices de gensim |
| Framework | TensorFlow 2.21.0, Keras 3.13.2, gensim 4.4.0, scikit-learn 1.6.1 |
| Tarea | Clasificación binaria de texto (phishing / legítimo) |
| Pipeline HF | text-classification |
| Descargas | 5.443 |
| Tamano del repositorio | 17,4 GB |

## Arquitectura y entrenamiento

El modelo principal es una red LSTM que recibe secuencias de tokens representadas mediante embeddings Word2Vec preentrenados con gensim. El pipeline de preprocesado emplea NLTK 3.9.1 con eliminación de stop words y stemming Porter. El repositorio entrena cinco variantes para comparación: TF-IDF con regresión logística como línea base de machine learning, LSTM con Word2Vec, LSTM con GloVe, LSTM con FastText y BiLSTM con Word2Vec. Para los correos que contienen enlaces (4.274 casos) se realizan experimentos adicionales combinando características del cuerpo del mensaje y de la URL, con proporciones de fusión entre el 50:50 y el 70:30 según el modelo.

Los datos provienen del Phishing Email Dataset de Kaggle (Al-Subaiey et al., 2024), que agrega seis fuentes: Nazario, SpamAssassin, Enron, CEAS_08, Nigerian_Fraud y Ling. De 82.486 correos iniciales se eliminan duplicados hasta 74.170, con un reparto 70/15/15 (51.919 de entrenamiento, 11.125 de validación y 11.126 de test). El entrenamiento se ejecutó en Google Colab sobre una Tesla T4 con semilla fija 42. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador supervisado de este tipo.

## Capacidades

- Clasificación binaria de correos electrónicos en vietnamita como phishing/malicioso o legítimo.
- Detección basada en el cuerpo del mensaje, con F1 de 0.9911 en el subconjunto de correos con enlaces.
- Detección basada en la URL del correo, con F1 de 0.9566 en ese mismo subconjunto.
- Detección combinada de cuerpo y URL, con F1 de 0.9934.
- Generalización parcial a campañas de phishing de fuentes no vistas: recall de 0.8609 al entrenar con Nazario y evaluar sobre Nigerian_Fraud.
- Variantes comparativas disponibles (TF-IDF + regresión logística, GloVe, FastText, BiLSTM) para análisis de ablación.
- Demo web incluida en el repositorio (`code/app.py`, `code/phishing_core.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al vietnamita; no hay evidencia de rendimiento en otros idiomas.

## Casos de uso

- Filtrado de correo entrante en pasarelas de correo corporativas: el modelo puede puntuar cada mensaje como sospechoso o legítimo antes de la entrega, con una sensibilidad de 0.9936 que minimiza los falsos negativos en un entorno donde el coste de dejar pasar un phishing es alto.
- Moderación de bandejas de entrada en proveedores de correo vietnamitas: al estar entrenado sobre corpus en vietnamita (Nazario, SpamAssassin, Enron, CEAS_08, Nigerian_Fraud, Ling), cubre patrones lingüísticos que los filtros basados en inglés no capturan.
- Análisis de URL sospechosas en el cuerpo del correo: la variante que combina texto y enlace alcanza un F1 de 0.9934, útil para sistemas que extraen y evalúan dominios antes de que el usuario haga clic.
- Investigación académica en detección de phishing: el repositorio incluye datos procesados en `.parquet`, resultados en CSV y Excel, figuras y `registry.json`, lo que permite reproducir los experimentos y comparar contra las cinco variantes publicadas.
- Alerta temprana en campañas de fraude nigeriano: el experimento de validación cruzada entre fuentes muestra un recall de 0.8609 al entrenar con Nazario y evaluar sobre Nigerian_Fraud, lo que respalda su uso como detector de campañas con vocabulario distinto al de entrenamiento.
- Integración en un pipeline de seguridad como clasificador de segunda opinión: al ser un modelo Keras ligero en inferencia (LSTM, no un transformer), puede ejecutarse en CPU junto a reglas heurísticas o modelos mayores para reducir falsos positivos.
- Docencia y prototipado de clasificación de texto: el código de demo (`app.py`) y los embeddings incluidos permiten montar un servicio de clasificación funcional sin entrenar desde cero.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 11.126 correos, según la model card del autor:

| Modelo | Representacion | Clasificador | Accuracy | Precision | Recall | Specificity | FPR | F1 | ROC-AUC |
|---|---|---|---|---|---|---|---|---|---|
| M1 | TF-IDF | Logistic Regression | 0.9818 | 0.9825 | 0.9802 | 0.9833 | 0.0167 | 0.9813 | 0.9983 |
| M2 | Word2Vec | LSTM | 0.9892 | 0.9845 | 0.9936 | 0.9850 | 0.0150 | 0.9890 | 0.9994 |
| M3 | GloVe | LSTM | 0.9821 | 0.9790 | 0.9846 | 0.9798 | 0.0202 | 0.9818 | 0.9984 |
| M4 | FastText | LSTM | 0.9894 | 0.9890 | 0.9893 | 0.9894 | 0.0106 | 0.9892 | 0.9995 |
| M5 | Word2Vec | BiLSTM | 0.9889 | 0.9849 | 0.9925 | 0.9854 | 0.0146 | 0.9887 | 0.9994 |

Resultados en el subconjunto de 4.274 correos con enlaces:

| Modelo | F1 contenido | F1 URL | F1 contenido + URL | Proporcion contenido:URL |
|---|---|---|---|---|
| M1 | 0.9851 | 0.9639 | 0.9904 | 70:30 |
| M2 | 0.9911 | 0.9566 | 0.9934 | 60:40 |
| M3 | 0.9856 | 0.9638 | 0.9929 | 50:50 |
| M4 | 0.9924 | 0.9625 | 0.9929 | 60:40 |
| M5 | 0.9896 | 0.9627 | 0.9934 | 50:50 |

Validación cruzada entre fuentes (recall sobre phishing de una fuente no vista en entrenamiento):

| Entrenamiento | Evaluacion | M1 | M2 | M3 | M4 | M5 |
|---|---|---|---|---|---|---|
| Nazario | Nigerian_Fraud | 0.0836 | 0.8609 | 0.7099 | 0.8687 | 0.6538 |
| Nigerian_Fraud | Nazario | 0.2520 | 0.3265 | 0.1992 | 0.3153 | 0.4690 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser una LSTM sobre embeddings y no un transformer de gran escala, la huella en memoria es muy inferior a la de un modelo generativo de tamaño comparable; el repositorio de 17,4 GB incluye datos, embeddings y checkpoints, no solo pesos del modelo.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4 (Google Colab). Para inferencia no se documentan requisitos específicos; una GPU consumer moderna es suficiente en la mayoría de escenarios.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte CUDA y varios GB de VRAM; no se publican cifras exactas.
- Opciones de despliegue: TensorFlow Serving o una API propia con Keras; la demo web incluida (`code/app.py`) usa el stack de Python del repositorio. No hay versiones GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 (phishing) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KLCN16 M2 (LSTM + Word2Vec) | LSTM + embeddings | no disponible | no disponible | 0.9890 | no disponible | HuggingFace |
| KLCN16 M4 (LSTM + FastText) | LSTM + embeddings | no disponible | no disponible | 0.9892 | no disponible | HuggingFace (mismo repo) |
| KLCN16 M1 (TF-IDF + LR) | Machine learning clásico | no disponible | no disponible | 0.9813 | no disponible | HuggingFace (mismo repo) |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada; la comparativa se limita a las variantes internas del mismo repositorio.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en vietnamita; su rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- La validación cruzada entre fuentes muestra una caída severa al invertir el sentido del experimento: entrenar con Nigerian_Fraud y evaluar sobre Nazario deja el recall en 0.3265 para M2. La generalización a campañas nuevas es asimétrica y limitada.
- El clasificador es binario y no distingue tipos de phishing ni proporciona explicaciones; en producción conviene acompañarlo de reglas y revisión humana.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos: la especificidad de 0.9850 implica que alrededor del 1,5 % de los correos legítimos se marcarían como maliciosos.
- La licencia no está declarada en la información disponible, por lo que no puede confirmarse el uso comercial sin contactar con el autor.
- El repositorio pesa 17,4 GB, lo que encarece el despliegue si se descarga completo; conviene extraer solo `models/` y `code/`.
- Es un trabajo de fin de grado con 0 likes y sin revisión por pares documentada; los resultados deben tratarse como una línea base reproducible, no como un sistema validado en producción.
- El dataset subyacente (Kaggle, Al-Subaiey et al., 2024) condiciona los sesgos del modelo: las campañas de phishing recientes o dirigidas pueden no estar representadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/klcn-phishing-lab/klcn16-phishing-lstm
- Dataset de origen (Kaggle, Al-Subaiey et al., 2024): no disponible como enlace directo en la información proporcionada
- Paper o publicación asociada: no disponible
- Repositorio de código independiente: no disponible (el código de demo está dentro del propio repositorio HF, en `code/`)
- Demo desplegada: no disponible
