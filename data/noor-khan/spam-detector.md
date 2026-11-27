# Noor-Khan/spam-detector

## Resumen

Noor-Khan/spam-detector es un clasificador binario de spam para mensajes SMS en inglés, publicado por Noorullah Zamindar como proyecto de aprendizaje. No es un modelo de lenguaje neuronal: es un pipeline clásico de scikit-learn compuesto por un vectorizador TF-IDF (máximo 5.000 características, n-gramas de 1 a 2, `min_df=2`, TF sublineal) seguido de dos clasificadores alternativos, un Multinomial Naive Bayes con `alpha=0.1` (modelo por defecto) y una regresión logística con `max_iter=1000` incluida a modo de comparación.

El problema que resuelve es acotado y bien definido: etiquetar un mensaje SMS corto en inglés como `spam` o `ham`. Se entrenó sobre el UCI SMS Spam Collection (Almeida e Hidalgo, 2011), con 5.572 mensajes reales (4.825 ham / 747 spam), y se evaluó sobre un split estratificado fijo 80/20 con `random_state=42`, lo que permite reproducir exactamente las métricas publicadas.

Su relevancia es la de un artefacto didáctico y reproducible, no la de un componente de producción: el propio autor documenta que es un modelo de frecuencias de palabras, no un modelo de lenguaje, y que no debe usarse como única línea de defensa. La licencia MIT y el tamaño reducido del repositorio lo hacen trivial de auditar y de integrar en prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (5.000 features, 1-2 gramas, min_df=2, TF sublineal) + Multinomial Naive Bayes (alpha=0.1) o Logistic Regression (max_iter=1000) |
| Parametros totales | no disponible (modelo de bolsa de palabras; el vectorizador fija 5.000 dimensiones de vocabulario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no hay ventana de contexto; se procesa un mensaje por inferencia) |
| Tipos de cuantizacion | no aplica (artefactos `.pkl` de joblib; no hay pesos en coma flotante de red neuronal) |
| Idiomas soportados | inglés (SMS en inglés) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (joblib): `tfidf_vectorizer.pkl`, `spam_model_nb.pkl`, `spam_model_lr.pkl` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre representación TF-IDF, sin red neuronal ni mecanismo de atención. El vectorizador limita el vocabulario a 5.000 características con n-gramas de 1 a 2, descarta términos con frecuencia documental inferior a 2 y aplica TF sublineal. Sobre esa matriz se entrenan dos clasificadores: Multinomial Naive Bayes con suavizado `alpha=0.1` (modelo por defecto, elegido por su mejor F1 de spam) y regresión logística con `max_iter=1000` (incluida para comparación).

Los datos de entrenamiento son el UCI SMS Spam Collection: 5.572 mensajes (4.825 ham / 747 spam, 13,41 % de spam), recopilados del foro Grumbletext, el NUS SMS Corpus, la tesis de Caroline Tag y el SMS Spam Corpus. El split es 80/20 estratificado con `random_state=42`, resultando 4.457 mensajes de entrenamiento y 1.115 de test (149 spam, 966 ham). No hay RLHF, DPO ni ajuste por preferencias; el entrenamiento es supervisado clásico y el dataset se descarga del archivo público de UCI con verificación SHA-256 si falta el fichero local. El dataset contiene 403 filas duplicadas exactas que se conservaron tal cual, lo que puede inflar ligeramente las métricas.

## Capacidades

- Clasificación binaria de texto corto en inglés: etiqueta `spam` o `ham` con probabilidad asociada (`predict_proba`).
- Detección de spam en SMS basada en vocabulario y frecuencia de términos (premios, llamadas a números premium, URLs acortadas, mayúsculas).
- Interfaz de línea de comandos: mensaje individual, fichero con un mensaje por línea (`--file`) y modo interactivo (`--interactive`).
- Selección de clasificador en tiempo de inferencia mediante `--model lr`.
- Carga directa de artefactos con `joblib` para integración en scripts Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es multilingüe: solo inglés.

## Casos de uso

- Filtrado de SMS en pasarelas de mensajería: clasificar mensajes entrantes antes de enrutarlos a un operador humano, usando el umbral de probabilidad para derivar los casos dudosos a revisión.
- Prototipado rápido de pipelines de moderación: al ser un pipeline de scikit-learn con licencia MIT, sirve como línea base reproducible antes de invertir en un modelo neuronal.
- Docencia y evaluación de clasificadores clásicos: el repositorio incluye `train.py`, `evaluate.py` y `metrics.json`, lo que permite reproducir exactamente las métricas y comparar Naive Bayes frente a regresión logística.
- Generación de señales auxiliares en sistemas antispam: usar `P(spam)` como una característica más junto a reputación de remitente y análisis de enlaces, nunca como decisión única.
- Detección de campañas de premios y concursos fraudulentos: el vocabulario TF-IDF captura patrones típicos («FREE», «WIN», «claim», «call now») con alta precisión en el dominio SMS.
- Análisis offline de corpus históricos de SMS: procesar ficheros completos con `--file` para etiquetar y auditar colecciones de mensajes en inglés.

## Benchmarks y rendimiento

Resultados medidos sobre el split de test de 1.115 mensajes (149 spam, 966 ham) el 2026-11-27, con Python 3.12.3 y scikit-learn 1.9.1:

| Metrica | Naive Bayes (por defecto) | Logistic Regression |
|---|---|---|
| Accuracy | 0,9830 (1.096/1.115) | 0,9722 (1.084/1.115) |
| Precision (spam) | 0,9851 | 1,0000 |
| Recall (spam) | 0,8859 | 0,7919 |
| F1 (spam) | 0,9329 | 0,8839 |
| ROC-AUC | 0,9871 | 0,9902 |

Matrices de confusión (filas: etiqueta real; columnas: predicción `[[ham ok, ham marcado], [spam perdido, spam detectado]]`):

| Modelo | Matriz |
|---|---|
| Naive Bayes | `[[964, 2], [17, 132]]` |
| Logistic Regression | `[[966, 0], [31, 118]]` |

Ejemplos escritos a mano (no pertenecientes al dataset):

| Mensaje | Esperado | P(spam) NB | P(spam) LR |
|---|---|---|---|
| «Congratulations! You have WON a FREE 1000 cash prize. Call 09001234567 now to claim your reward!» | spam | 1,0000 → spam | 0,9578 → spam |
| «Hey, are we still meeting for lunch tomorrow? Let me know what time works for you.» | ham | 0,0001 → ham | 0,0273 → ham |
| «URGENT: Your account will be closed today unless you verify your details at http://bit.ly/verify-now» | spam | 0,5219 → spam | 0,3056 → ham |
| «Ok lar, see you at 7. Bring the notes from class.» | ham | 0,0001 → ham | 0,0349 → ham |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Los artefactos son ficheros `.pkl` de joblib y el repositorio ocupa 0,0 GB.
- GPU: no se requiere ni se aprovecha ninguna GPU (A100, H100, RTX 4090 u otras son irrelevantes para este pipeline).
- Cabe en cualquier equipo consumer: basta con Python 3.12 y las dependencias fijadas en `requirements.txt` (scikit-learn 1.9.1 y joblib).
- Despliegue: ejecución directa con `python spam_detector.py` o carga con `joblib` dentro de un servicio Python. No aplican vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos neuronales.
- Latencia y throughput: no se han publicado mediciones en la información disponible; por la naturaleza del pipeline (transformación TF-IDF dispersa y clasificador lineal) la inferencia es de milisegundos por mensaje en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noor-Khan/spam-detector | TF-IDF + Naive Bayes / Regresión logística | 5.000 features TF-IDF | no aplica | MIT | Hugging Face, 0 descargas |
| Filtros bayesianos de spam clásicos (p. ej. SpamAssassin) | Reglas + Naive Bayes sobre tokens | no disponible | no aplica | varía (GPL en SpamAssassin) | Software maduro, ampliamente desplegado |
| Clasificadores neuronales de texto (p. ej. DistilBERT fine-tuned para spam) | Transformer encoder | ~66 M | 512 tokens | varía según checkpoint | Hugging Face, múltiples checkpoints |
| Modelos de lenguaje grandes con prompt de clasificación | Transformer decoder | miles de millones | miles de tokens | varía | APIs y pesos abiertos |

No se dispone de datos de benchmarks comparativos directos entre estos sistemas en la información proporcionada; las cifras de la tabla de benchmarks solo son válidas para el split interno de este repositorio.

## Limitaciones y advertencias

- Solo SMS en inglés: entrenado con mensajes cortos (media de 72 caracteres en ham y 139 en spam); no es un filtro de correo electrónico ni se ha probado con textos largos u otros idiomas.
- Los dos clasificadores discrepan en texto de phishing no visto: el ejemplo «URGENT account closed» lo detecta Naive Bayes por poco margen (P=0,52) y lo falla la regresión logística (P=0,31). La distribución fuera de dominio es el punto más débil.
- El dataset contiene 403 filas duplicadas exactas conservadas tal cual, por lo que algunos mensajes de test pueden aparecer también en entrenamiento e inflar ligeramente las métricas.
- Entradas vacías o solo con puntuación no provocan error, pero puntúan cerca del prior de ham (P(spam) = 0,1342) y se etiquetan como ham.
- Es un modelo de frecuencias de palabras, no un modelo de lenguaje: no interpreta intención, enlaces ni reputación del remitente, y un spammer que reformule el mensaje puede evadirlo.
- No debe usarse como única línea de defensa en producción.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías ni mantenimiento; el autor lo describe como proyecto de aprendizaje.
- Riesgo de sesgo: el vocabulario aprendido refleja el corpus UCI de 2011, por lo que puede sobrerreaccionar a términos legítimos frecuentes en spam (premios, llamadas, URLs) y penalizar mensajes comerciales legítimos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea silenciosa con probabilidades mal calibradas fuera del dominio SMS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/spam-detector
- Dataset UCI SMS Spam Collection (Almeida e Hidalgo, 2011): https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- Referencia del dataset en el repositorio: `data/SMSSpamCollection` y `data/readme`
- Script de entrenamiento: `train.py` (reproduce los modelos y `metrics.json`)
- Script de evaluación: `evaluate.py` (reproduce las métricas desde los artefactos)
- Métricas completas: `metrics.json`
- Ejemplos y casos límite: `samples/examples.json`
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
