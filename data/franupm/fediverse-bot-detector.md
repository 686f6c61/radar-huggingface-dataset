# FranUPM/fediverse-bot-detector

## Resumen

El Fediverse Bot Detector es un clasificador tabular binario desarrollado por FranUPM (Universidad Politécnica de Madrid) que estima si una cuenta de Mastodon o del fediverse es un bot. A diferencia de los detectores basados exclusivamente en texto, combina tres fuentes de señal: nueve características numéricas del perfil (número de publicaciones, seguidores, seguidos y estructura del nombre de usuario), una codificación one-hot de 17 lenguas detectadas en la biografía y un embedding de 768 dimensiones del `[CLS]` de `bert-base-multilingual-cased` sobre el texto de la bio limpia de HTML.

El modelo subyacente es una regresión logística (`C=1.0`, `max_iter=2000`) de scikit-learn 1.7.1, lo que lo convierte en un artefacto extremadamente ligero (el repositorio ocupa 0.0 GB) y desplegable en CPU sin GPU. Se entrenó sobre 44.730 cuentas balanceadas (22.365 bots y 22.365 humanos) procedentes del Bot Into The Fediverse Dataset y del corpus Cresci-2017, con una partición estratificada 80/20.

Su relevancia radica en que aborda un problema práctico de moderación en instancias federadas con un coste computacional mínimo y una métrica de referencia clara: ROC AUC de 0,963 y F1 de 0,910 sobre el conjunto de test retenido. Es, por tanto, una herramienta de señalización para investigación y moderación asistida, no un oráculo de decisión automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre features tabulares híbridas (9 numéricas + 17 one-hot de idioma + 768 embeddings de mBERT) |
| Parametros totales | No disponible (modelo lineal; el clasificador en sí tiene 794 coeficientes de entrada más el intercepto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de bio (truncado del embedding mBERT); el resto de features son escalares |
| Tipos de cuantizacion | No aplica; artefactos `joblib` en precisión nativa de scikit-learn |
| Idiomas soportados | Multilingüe; one-hot sobre las 15 lenguas de bio más frecuentes en entrenamiento, más `unknown` y `other`. Detección con fastText `lid.176` |
| Licencia | MIT |
| Formato de pesos | `logistic_regression_model.joblib` y `scaler.joblib` (joblib/pickle de scikit-learn 1.7.1) |

## Arquitectura y entrenamiento

El pipeline es un clasificador lineal clásico en dos etapas. Primero se construye un vector de 794 dimensiones por cuenta: las 9 features numéricas se estandarizan con un `StandardScaler` ajustado solo sobre el split de entrenamiento; las 17 features de idioma provienen de un one-hot sobre el vocabulario `language_vocab.json` (15 lenguas frecuentes más `unknown` para bio vacía y `other` para el resto), con detección mediante fastText `lid.176` cuando el campo `language` no se proporciona; y las 768 restantes son el embedding `[CLS]` de la bio limpia de HTML, truncada a 128 tokens, extraído de `bert-base-multilingual-cased`. Sobre ese vector se ajusta una `LogisticRegression(C=1.0, max_iter=2000)`.

El entrenamiento usó 44.730 cuentas balanceadas al 50 % (22.365 bots y 22.365 humanos), divididas de forma estratificada con `random_state=42` en 35.784 cuentas de entrenamiento y 8.946 de test. Las fuentes son el Bot Into The Fediverse Dataset (cuentas de Mastodon recogidas entre enero y febrero de 2025, CC-BY-4.0) y Cresci-2017 (cuentas etiquetadas de Twitter, distribuidas solo para investigación académica). No se emplean técnicas de RLHF ni DPO; es un ajuste supervisado convencional. La innovación técnica es la hibridación de señales de perfil con un embedding contextual multilingüe, manteniendo un coste de inferencia muy bajo.

## Capacidades

- Clasificación binaria de cuentas del fediverse como bot o humano, con probabilidad asociada y umbral configurable (`BotClassifier(threshold=...)`, por defecto 0.5).
- Detección automática del idioma de la biografía cuando el campo `language` no se suministra, mediante fastText `lid.176`.
- Procesamiento de biografías en HTML, con limpieza previa del marcado antes de generar el embedding.
- Manejo multilingüe de biografías dentro de las 15 lenguas más frecuentes del corpus de entrenamiento, con agrupación del resto en `other`.
- Extracción de señales estructurales del nombre de usuario: longitud, recuento de dígitos, letras y caracteres especiales, y si empieza o termina con dígito.
- Inferencia en lote sobre listas de diccionarios de cuenta.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador tabular.

## Casos de uso

- Moderación asistida en instancias Mastodon: el modelo devuelve una probabilidad por cuenta que el equipo de moderación puede usar como señal de priorización, revisando manualmente las cuentas por encima de un umbral elevado para reducir falsos positivos en un contexto donde los bots son raros.
- Investigación sobre automatización en el fediverse: permite etiquetar grandes volúmenes de cuentas de forma barata en CPU y estudiar la prevalencia y evolución de cuentas automatizadas entre instancias y periodos.
- Filtrado previo en pipelines de análisis de redes: al ser un modelo lineal con inferencia en milisegundos, puede actuar como primera etapa que descarte cuentas claramente humanas antes de aplicar análisis más costosos.
- Monitorización de cuentas de noticias automatizadas: perfiles con `statuses_count` alto, `followers_count` bajo y `following_count` nulo, junto con bios que declaran automatización, obtienen probabilidades muy altas, como ilustra el ejemplo de la model card.
- Auditoría de directorios y listas de cuentas: clasificación por lotes de listas exportadas para detectar cuentas sospechosas antes de incorporarlas a listas de seguimiento o curación de contenido.
- Docencia y experimentación en detección de bots: el repositorio incluye `bot_features.py` y `predict.py`, lo que facilita reproducir el pipeline y comparar con alternativas basadas en aprendizaje profundo.
- Enriquecimiento de datasets de investigación: añadir una columna de probabilidad de bot a corpus federados para análisis posteriores, manteniendo siempre la etiqueta como señal y no como verdad.

## Benchmarks y rendimiento

Resultados sobre el split de test retenido (8.946 cuentas, 50 % bots), umbral 0.5:

| Metrica | Valor |
|---|---|
| ROC AUC | 0.963 |
| Accuracy | 0.910 |
| Precision (bot) | 0.910 |
| Recall (bot) | 0.910 |
| F1 (bot) | 0.910 |

Matriz de confusión: 4.069 verdaderos negativos, 404 falsos positivos, 404 falsos negativos y 4.069 verdaderos positivos.

No se han publicado en la información disponible comparaciones con otros modelos de detección de bots en el fediverse.

## Requisitos de hardware

- VRAM: no requiere GPU. El clasificador es lineal y la parte más costosa es generar embeddings con `bert-base-multilingual-cased` (aproximadamente 178 M de parámetros), que puede ejecutarse en CPU o en GPU modesta.
- GPU recomendadas: no imprescindible; para lotes grandes de bios, una GPU consumer como RTX 3060 o superior acelera la extracción de embeddings. En CPU, el cuello de botella es mBERT, no la regresión logística.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el repositorio ocupa 0.0 GB y los artefactos `joblib` son de tamaño reducido.
- Opciones de despliegue: script Python con `predict.py` y `BotClassifier`, servido detrás de un endpoint propio; no es compatible con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. La primera ejecución descarga mBERT y fastText `lid.176.ftz` a `~/.cache/fediverse-bot-detector/` (ruta configurable con `FASTTEXT_MODEL_PATH`), lo que añade una latencia inicial de descarga.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros detectores de bots del fediverse. Como referencia de categoría, el modelo se sitúa frente a alternativas genéricas de la siguiente forma:

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fediverse Bot Detector (este) | Regresión logística sobre features híbridas | Perfil + bio | MIT (con caveat de datos Cresci-2017) | Hugging Face, `sklearn` |
| Clasificadores basados solo en texto | Modelos de lenguaje ajustados | Texto de bio o publicaciones | Variable | Variable |
| Detectores basados en grafos sociales | Modelos de red | Grafo de interacciones | Variable | Variable |
| Heurísticas por reglas | Reglas manuales | Metadatos | No aplica | Implementación propia |

No se dispone de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de test está balanceado al 50 % de bots; en instancias reales los bots son mucho más raros, por lo que la precisión caerá y conviene elevar el umbral por encima de 0.5.
- Parte del entrenamiento (Cresci-2017) procede de Twitter, cuyas convenciones de cuenta difieren de las del fediverse, lo que puede introducir sesgo de dominio.
- Cresci-2017 está restringido a investigación académica, por lo que el modelo se declara para uso de investigación pese a la licencia MIT del artefacto.
- El modelo se entrenó sobre una instantánea concreta de cuentas; el comportamiento de los bots y las convenciones de las instancias cambian con el tiempo, lo que degrada la validez temporal.
- Solo observa metadatos del perfil y la bio, no el contenido de las publicaciones ni los tiempos de publicación, lo que limita la detección de bots con bios naturales y actividad automatizada.
- Las bios en lenguas fuera de las 15 más frecuentes se agrupan en `other`, perdiendo señal lingüística.
- Riesgo de alucinación no aplica al no ser generativo, pero sí existe riesgo de clasificación errónea: 404 falsos positivos y 404 falsos negativos en el test.
- Debe usarse como señal para moderación o investigación, nunca como única base para acciones contra una cuenta.
- Los archivos `joblib` deben cargarse con scikit-learn 1.7.1; otras versiones pueden avisar o comportarse de forma distinta. Solo deben cargarse desde fuentes de confianza por el riesgo inherente a pickle.
- Componentes de terceros no redistribuidos: `bert-base-multilingual-cased` (Apache-2.0) y fastText `lid.176.ftz` (CC-BY-SA 3.0, © Facebook), descargados en el primer uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FranUPM/fediverse-bot-detector
- Dataset Bot Into The Fediverse: https://doi.org/10.5281/zenodo.17987595
- Paper asociado al dataset: https://doi.org/10.1007/s13278-025-01567-z
- Cresci-2017 (WWW '17 Companion): https://doi.org/10.1145/3041021.3055135
- `bert-base-multilingual-cased`: https://huggingface.co/google-bert/bert-base-multilingual-cased
- fastText `lid.176` (identificación de idioma): https://fasttext.cc/docs/en/language-identification.html
