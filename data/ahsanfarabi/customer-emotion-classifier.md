# AhsanFarabi/customer-emotion-classifier

## Resumen

El modelo `customer-emotion-classifier`, desarrollado por Ahsan Farabi, es un clasificador de emociones y sentimientos en texto de atención al cliente. Se basa en un pipeline clásico de TF-IDF (Term Frequency-Inverse Document Frequency) combinado con regresión logística, entrenado sobre el dataset público `dair-ai/emotion`. Su objetivo es asignar a cada texto una de seis emociones: alegría, tristeza, amor, ira, miedo o sorpresa, con una precisión reportada del 86,25 %.

A diferencia de los modelos transformer modernos, este sistema no emplea redes neuronales profundas ni atención, sino un enfoque tradicional de aprendizaje automático con representaciones vectoriales dispersas. Esto lo hace extremadamente ligero, rápido de inferir y fácil de desplegar en entornos con recursos limitados. Su relevancia radica en ofrecer una solución práctica y económica para el análisis de emociones en comentarios de clientes, sin necesidad de GPU ni infraestructura compleja.

El repositorio incluye el pipeline serializado en formato `joblib` junto con las etiquetas de clase, permitiendo una carga directa en Python para su uso inmediato. No se proporcionan detalles sobre el número de parámetros, la arquitectura interna del vectorizador o el proceso de entrenamiento más allá de la precisión indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + Regresion logistica (scikit-learn) |
| Parametros totales | no disponible (modelo clasico, no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el vectorizador TF-IDF procesa tokens sin ventana fija) |
| Tipos de cuantizacion | no disponible (formato joblib, sin cuantizacion) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | joblib (pipeline completo y etiquetas) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura clasica de aprendizaje automatico: un vectorizador TF-IDF que convierte los textos en matrices de caracteristicas numericas, seguido de un clasificador de regresion logistica multiclase. Este enfoque no utiliza redes neuronales profundas ni mecanismos de atencion, por lo que su capacidad de capturar contextos complejos es limitada en comparacion con modelos transformer.

El entrenamiento se realizo sobre el dataset `dair-ai/emotion`, que contiene frases etiquetadas con seis emociones basicas. No se especifican el numero de muestras, el proceso de validacion ni si se aplicaron tecnicas de regularizacion o ajuste de hiperparametros. La unica metrica publicada es una precision del 86,25 %, sin desglose por clase ni otras metricas como F1 o recall. Tampoco se menciona el uso de RLHF, DPO ni ningun otro metodo de alineacion, dado que es un modelo supervisado clasico.

## Capacidades

- Clasificacion de emociones en texto: identifica alegria, tristeza, amor, ira, miedo y sorpresa.
- Analisis de sentimiento orientado a feedback de clientes, con ejemplos de uso en el widget del modelo.
- Inferencia rapida en CPU gracias a su naturaleza ligera (TF-IDF + regresion logistica).
- Integracion sencilla en Python mediante `joblib.load()`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Limitado al idioma ingles; no se han documentado capacidades multilingues.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede categorizar automaticamente las quejas o consultas de clientes por emocion predominante, permitiendo priorizar los casos con ira o frustracion para una atencion inmediata.
- Monitorizacion de redes sociales: analizar comentarios de clientes en Twitter o Facebook para detectar picos de emociones negativas hacia una marca o producto.
- Analisis de encuestas de satisfaccion: procesar respuestas abiertas de encuestas y agruparlas por estado emocional, facilitando la identificacion de areas de mejora.
- Filtrado de feedback en plataformas de e-commerce: clasificar resenas de productos para destacar aquellas con emociones extremas (muy positivas o muy negativas) y generar alertas.
- Investigacion academica en NLP: servir como linea base (baseline) para comparar modelos mas complejos en tareas de deteccion de emociones.
- Prototipado rapido en entornos sin GPU: al ser un modelo de bajo coste computacional, puede integrarse en aplicaciones embebidas o en servicios serverless con limitaciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato reportado es una precision del 86,25 % sobre el dataset `dair-ai/emotion`, sin especificar el conjunto de evaluacion (train, validation o test). No se proporcionan comparaciones con otros modelos ni desglose por clase.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero; un pipeline TF-IDF + regresion logistica ocupa unos pocos megabytes y se ejecuta en cualquier procesador moderno sin necesidad de GPU.
- Memoria RAM: menos de 1 GB para cargar el modelo y procesar textos de forma individual o en lotes pequenos.
- GPU: no requerida. Puede desplegarse en instancias cloud de bajo coste, Raspberry Pi o incluso en funciones serverless (AWS Lambda, Google Cloud Functions).
- Opciones de despliegue: al ser un artefacto `joblib`, se integra directamente en aplicaciones Python (Flask, FastAPI) o en pipelines de datos con scikit-learn. No es compatible con motores de inferencia especializados como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: del orden de milisegundos por texto en CPU, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de clasificacion de emociones en la informacion proporcionada. Como referencia, el dataset `dair-ai/emotion` es comunmente usado para entrenar modelos transformer pequenos (por ejemplo, `distilbert-base-uncased` fine-tuned) que suelen alcanzar precisiones superiores al 90 %, pero con un coste computacional mucho mayor. El modelo `hamzawaheed/emotion-classification-model`, tambien en Hugging Face, emplea el mismo dataset y podria servir como alternativa, aunque no se han publicado sus metricas en esta busqueda. La eleccion entre un enfoque clasico y un transformer dependera del equilibrio entre precision, recursos y velocidad requeridos.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo puede heredar sesgos presentes en `dair-ai/emotion`, que podrian afectar a su rendimiento en distintos grupos demograficos, culturales o contextos linguisticos, tal como se advierte en otros modelos basados en el mismo corpus.
- Riesgo de alucinacion: no aplica, al ser un clasificador sin generacion de texto, pero puede producir errores de clasificacion en frases ambiguas o con ironia.
- Limitacion de idioma: solo soporta ingles; no se ha entrenado para otros idiomas.
- Contexto limitado: TF-IDF no captura el orden de las palabras ni relaciones semanticas profundas, por lo que frases complejas o dependientes del contexto pueden clasificarse incorrectamente.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la precision en produccion.
- Mantenimiento: el modelo fue publicado en 2026 y no se han documentado actualizaciones posteriores; su vigencia puede verse comprometida si el dataset de entrenamiento queda obsoleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhsanFarabi/customer-emotion-classifier
- Perfil del autor: https://huggingface.co/AhsanFarabi
- Dataset de entrenamiento `dair-ai/emotion`: https://huggingface.co/datasets/dair-ai/emotion
- Modelo similar de referencia: https://huggingface.co/hamzawaheed/emotion-classification-model
