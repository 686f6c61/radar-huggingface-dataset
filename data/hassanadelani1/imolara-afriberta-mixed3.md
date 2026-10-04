# Hassanadelani1/imolara-afriberta-mixed3

## Resumen

Ìmọ̀lára es un clasificador de sentimiento en yoruba de tres clases (negativo, neutro, positivo) desarrollado por Hassan Adelani Luqman (usuario Hassanadelani1) a partir del encoder multilingue africanista `castorini/afriberta_large`. El modelo resuelve un problema muy concreto del procesamiento del yoruba: la variabilidad ortografica de los diacriticos y las marcas tonales, que en Twitter aparecen de forma inconsistente. Para ello se entreno sobre cada tuit de AfriSenti en tres formas escritas simultaneamente (original, sin marcas tonales y sin ningun diacritico), lo que el autor denomina "mixed3".

Tecnicamente es un transformer encoder de 125.633.283 parametros (unos 0,6 GB de repositorio) afinado con `transformers` sobre el subconjunto yoruba del benchmark AfriSenti-SemEval 2023. Alcanza un macro-F1 de 0,741 ± 0,007 en el conjunto de test limpio y una degradacion minima cuando se eliminan marcas tonales (−0,002) o todos los diacriticos (−0,012), que es precisamente la propiedad que lo distingue del modelo base sin aumento de datos.

Su relevancia practica es doble: por un lado publica una version ONNX con cuantizacion dinamica int8 (127 MB) que puede ejecutarse en CPU con `onnxruntime`, y por otro incluye un baseline alternativo (`tfidf_mixed3.joblib`) basado en TF-IDF y regresion logistica que iguala o supera ligeramente al transformer. Es un caso de estudio limpio de "modelo pequeno, tarea estrecha, despliegue ligero" para lenguas de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia RoBERTa/AfriBERTa; etiquetado como `xlm-roberta` en HuggingFace) |
| Parametros totales | 125.633.283 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en el entrenamiento; no se documenta otro limite en la model card) |
| Tipos de cuantizacion | Exportacion ONNX int8 dinamica por canal (127 MB); pesos safetensors en precision original (entrenamiento en fp16) |
| Idiomas soportados | Yoruba (`yo`) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch/transformers), ONNX (`onnx/model_int8.onnx`), joblib (`tfidf_mixed3.joblib`) |
| Tarea | Clasificacion de texto / analisis de sentimiento (3 clases) |
| Modelo base | castorini/afriberta_large |
| Dataset de entrenamiento | shmuhammad/AfriSenti-twitter-sentiment (subconjunto yoruba) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes (HuggingFace) | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo parte de `castorini/afriberta_large`, un encoder tipo RoBERTa entrenado desde cero sobre texto de lenguas africanas (Ogueji, Zhu y Lin, 2021), y lo afina como clasificador de secuencias de tres etiquetas. La innovacion del ajuste no esta en la arquitectura sino en el preprocesamiento: los 8.522 tuits yoruba de entrenamiento de AfriSenti se duplican en tres variantes ortograficas (original, sin marcas tonales y sin ningun diacritico) y se deduplican, dando lugar al conjunto "mixed3". Esto hace que el modelo vea durante el entrenamiento la misma frase escrita como `ẹ kú àbọ̀` y como `e ku abo`, y por tanto sea robusto a la escritura informal propia de Twitter.

El entrenamiento uso learning rate 3e-5, tamano de batch 32, hasta 10 epocas con early stopping (paciencia 3) sobre macro-F1 del conjunto de desarrollo limpio, longitud maxima 128, precision fp16 y una unica GPU Kaggle T4. El modelo publicado corresponde a la semilla 42 de tres semillas evaluadas. La seleccion se hizo exclusivamente con el conjunto de desarrollo y el test se uso una sola vez. El repositorio incluye ademas un baseline TF-IDF (palabra + caracter) con regresion logistica entrenado de la misma forma con scikit-learn 1.9.1, y una exportacion ONNX cuantizada dinamicamente a int8 por canal que coincide con el modelo PyTorch en el 96,3-96,6% de los tuits y mantiene el macro-F1 dentro de ±0,3 puntos en las tres formas ortograficas. No se documenta entrenamiento con RLHF ni DPO, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion de sentimiento en yoruba en tres clases: negativo, neutro y positivo.
- Robustez ortografica: mantiene el rendimiento con texto sin marcas tonales y sin diacriticos (variaciones de −0,002 y −0,012 en macro-F1 respecto al texto limpio).
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`.
- Inferencia en CPU a traves de la exportacion ONNX int8 con `onnxruntime` (127 MB), con una concordancia del 96,3-96,6% respecto al modelo PyTorch.
- Compatibilidad con text-embeddings-inference y endpoints de HuggingFace (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, razonamiento, codigo, vision, audio, tool calling ni uso como agente: es un encoder discriminativo de una unica tarea.
- No hay capacidades multilingues efectivas: el modelo esta afinado y evaluado unicamente en yoruba, y los mensajes con code-switching aparecen entre los errores tipicos documentados.
- No dispone de modo "thinking" ni de razonamiento multi-paso.

## Casos de uso

- Monitorizacion de marca en redes sociales para audiencias yoruba: el modelo clasifica en lote tuits en yoruba escrito con o sin diacriticos, de modo que una misma campana puede rastrearse aunque los usuarios escriban de forma inconsistente.
- Moderacion y triaje de comunidades: priorizar mensajes negativos en foros o plataformas de soporte en yoruba antes de que un moderador humano los revise, usando la clase negativa como senal de escalado.
- Analisis de sentimiento electoral o de opinion publica: procesar corpus de Twitter recogidos durante eventos concretos, con la ventaja de que el modelo no necesita normalizar los diacriticos antes de la inferencia.
- Investigacion en PLN de bajos recursos: servir como baseline reproducible (semilla 42, hiperparametros documentados) frente al cual comparar futuros ajustes sobre AfriSenti Yoruba.
- Enriquecimiento de datasets: etiquetar automaticamente grandes volumenes de texto yoruba para construir corpus anotados, filtrando despues por confianza o por revision humana dado el sesgo de sobreconfianza del modelo.
- Despliegue ligero en el borde o en servicios sin GPU: la version ONNX int8 de 127 MB permite clasificar en una instancia pequena de CPU o incluso en dispositivos con recursos limitados.
- Comparacion de enfoques en produccion: al incluir el baseline TF-IDF en el mismo repositorio, un equipo puede decidir con datos si merece la pena mantener un transformer o si una regresion logistica sobre TF-IDF (macro-F1 0,745) cubre el caso de uso con menos complejidad operativa.
- Analisis de opinion de producto en nichos linguisticos: extraer tendencias de satisfaccion de clientes yoruhablantes a partir de comentarios y tuits, como entrada a un panel de analitica.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de AfriSenti Yoruba. "Test limpio" = los 4.129 tuits de test que no duplican un tuit de entrenamiento.

| Modelo | macro-F1 (test limpio) | weighted-F1 (x100) | Delta sin marcas tonales | Delta sin ningun diacritico |
|---|---|---|---|---|
| AfriBERTa-large mixed3 (3 semillas; este modelo es la semilla 42) | 0,741 ± 0,007 | 77,5 | −0,002 | −0,012 |
| TF-IDF mixed3 (`tfidf_mixed3.joblib`) | 0,745 | 77,8 | +0,001 | −0,006 |
| AfriBERTa-large sin aumento de datos | 0,732 ± 0,005 | 76,7 | −0,038 | −0,070 |

Resultados publicados en el articulo de AfriSenti (SemEval-2023) para yoruba, citados por el autor como referencia:

| Sistema | Resultado publicado |
|---|---|
| Mejor sistema de SemEval-2023 | 80,2 |
| AfroXLMR-large | 74,1 |
| AfriBERTa-large | 72,9 |

Adicionalmente, la model card indica que la exportacion ONNX int8 coincide con el modelo PyTorch en el 96,3-96,6% de los tuits y que su macro-F1 se mantiene dentro de ±0,3 puntos en las tres formas ortograficas. Nota: el weighted-F1 de 77,5 de este modelo se calcula sobre el subconjunto de test limpio, por lo que no es directamente comparable con las cifras publicadas de SemEval-2023, que se refieren al conjunto oficial completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16 y alrededor de 127 MB para el fichero ONNX int8.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. Para lotes grandes, una NVIDIA T4, RTX 3060 o superior ofrece margen amplio; no se requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en bastantes integradas, dado el tamano del modelo.
- Inferencia en CPU: viable, y es el modo explicitamente previsto por el autor mediante la exportacion ONNX int8 y `onnxruntime`.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`). No se documenta soporte de vLLM, llama.cpp ni Ollama, que no aplican a un encoder de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de hardware publicado es el de entrenamiento: una unica GPU Kaggle T4 con precision fp16, batch 32 y longitud maxima 128.
- Requisito critico de preprocesamiento: la entrada debe normalizarse exactamente como en entrenamiento (minusculas; eliminacion de menciones, URL, hashtags, puntuacion, digitos y emojis; NFC). La referencia es `src/data.py::preprocess` del repositorio de GitHub.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tipo | macro-F1 (yoruba, test limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (AfriBERTa-large mixed3) | 125.633.283 | Yoruba | Encoder afinado + aumento ortografico | 0,741 ± 0,007 | MIT | HuggingFace, ONNX incluido |
| AfriBERTa-large sin aumento | 125.633.283 | Multilingue africano | Encoder afinado sin aumento | 0,732 ± 0,005 | MIT | HuggingFace (modelo base) |
| TF-IDF + regresion logistica mixed3 | no aplica (bolsa de palabras) | Yoruba | Modelo lineal clasico | 0,745 | MIT (incluido en el repositorio) | joblib en el mismo repositorio |
| AfroXLMR-large (resultado publicado en AfriSenti) | no disponible en la informacion proporcionada | Multilingue africano | Encoder afinado | 74,1 weighted-F1 publicado | no disponible en la informacion proporcionada | HuggingFace (no verificable con los datos aportados) |

Observacion relevante: el baseline TF-IDF iguala en macro-F1 y supera ligeramente en weighted-F1 al transformer, con un coste computacional muy inferior. Esto sugiere que, para este corpus concreto, la mayor parte de la senal proviene del lexico y no del modelado contextual.

## Limitaciones y advertencias

- Dominio restringido a Twitter: el modelo se entreno y evaluo solo con tuits y su rendimiento fuera de ese registro (texto literario, legal, conversacional formal) es desconocido.
- Calidad de las etiquetas: el propio autor estima que aproximadamente el 10% de las etiquetas de AfriSenti Yoruba no son fiables segun un calculo de aprendizaje con confianza, y la concordancia entre anotadores es de kappa = 0,65. El techo de rendimiento esta limitado por estos datos.
- Errores tipicos documentados: refranes e idiomas, negacion (`kò`, `kì í`), palabras religiosas o de saludo en tuits que no son positivos, y cambio de codigo (code-switching).
- Probabilidades sobreconfiadas: el 94% de las predicciones de test superan 0,9 de probabilidad, y de esas solo aproximadamente el 77% son correctas. No debe usarse el umbral de probabilidad como medida fiable de confianza sin recalibracion.
- No apto para decisiones sobre personas: el autor lo indica explicitamente. No debe emplearse para perfilado, evaluacion o cualquier uso que afecte a individuos.
- Cobertura linguistica limitada: solo yoruba; no hay garantia de funcionamiento en otras lenguas africanas ni en yoruba mezclado con ingles.
- Dependencia estricta del preprocesamiento: si la entrada no se normaliza como en entrenamiento, el rendimiento puede degradarse sin aviso.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el material subyacente tiene condiciones propias (AfriSenti bajo CC BY 4.0, AfriBERTa bajo MIT), que conviene respetar al redistribuir.
- Madurez y adopcion: cero descargas y cero "likes" en el momento de los datos recogidos, sin historial de uso en produccion ni mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hassanadelani1/imolara-afriberta-mixed3
- Modelo base: https://huggingface.co/castorini/afriberta_large
- Dataset de entrenamiento: https://huggingface.co/datasets/shmuhammad/AfriSenti-twitter-sentiment
- Repositorio de codigo y demo: https://github.com/Hassan-Adelani-Luqman/imolara-yoruba-sentiment
- Referencia del dataset: Muhammad et al. (2023), "AfriSenti: A Twitter Sentiment Analysis Benchmark for African Languages", EMNLP (CC BY 4.0); sin URL en la model card.
- Referencia del modelo base: Ogueji, Zhu y Lin (2021), "Small Data? No Problem! Exploring the Viability of Pretrained Multilingual Language Models for Low-resourced Languages", MRL (MIT); sin URL en la model card.
- Demo web: aplicacion Streamlit Community Cloud, enlazada desde el repositorio de GitHub (URL directa no disponible en la informacion proporcionada).
