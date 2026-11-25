# ROUL34/finance-headline-sentiment

## Resumen

`ROUL34/finance-headline-sentiment` es un clasificador de sentimiento financiero publicado en Hugging Face por el usuario ROUL34. No es un modelo de lenguaje generativo, sino un pipeline clásico de aprendizaje supervisado construido con scikit-learn: vectorización TF-IDF seguida de una regresión logística. Su función es asignar una de tres etiquetas (0 bajista, 1 alcista, 2 neutro) a titulares financieros cortos en inglés.

El modelo se reentrena mensualmente mediante GitHub Actions dentro de un proyecto denominado markets-lab, y la model card indica que el último entrenamiento se realizó el 25 de noviembre de 2026. El conjunto de entrenamiento declarado es `zeroshot/twitter-financial-news-sentiment`. Los únicos datos de rendimiento publicados son la precisión de validación (0,811) y el F1 macro (0,754).

Su relevancia es acotada pero práctica: ofrece una línea base ligera y reproducible para clasificación de titulares financieros, con licencia MIT y dependencias mínimas (scikit-learn y joblib). No compite con modelos generativos ni con clasificadores basados en transformers; su interés reside en la simplicidad de despliegue y en el ciclo de reentrenamiento automatizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresion logistica (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (disenado para titulares cortos) |
| Tipos de cuantizacion | no disponible (no aplica a modelos sklearn/joblib) |
| Idiomas soportados | ingles (la model card limita a titulares cortos en ingles) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de procesamiento de lenguaje natural: extraccion de caracteristicas mediante TF-IDF sobre el texto del titular y clasificacion con regresion logistica multinomial de tres clases. No emplea transformers, atencion ni representaciones contextuales; cada titular se representa como un vector disperso de n-gramas ponderados.

El entrenamiento se realiza sobre el dataset `zeroshot/twitter-financial-news-sentiment`, segun declara la model card. El proceso esta automatizado: GitHub Actions reentrena el modelo mensualmente en el repositorio markets-lab, y la ultima ejecucion registrada corresponde al 25 de noviembre de 2026. No se documentan en la informacion disponible el numero de ejemplos, la composicion exacta del dataset, el esquema de validacion ni si se aplicaron tecnicas de calibracion o ajuste de hiperparametros.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases: bajista (0), alcista (1) y neutro (2).
- Procesamiento de titulares cortos en ingles.
- Inferencia ligera mediante scikit-learn y joblib, sin necesidad de GPU.
- Reentrenamiento periodico automatizado mediante GitHub Actions.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue no disponible; la model card restringe el uso a ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado de noticias financieras en tiempo real: el clasificador puede etiquetar titulares de feeds RSS o APIs de noticias como bajistas, alcistas o neutros antes de pasarlos a un analista o a otro sistema, con un coste computacional minimo al ejecutarse en CPU.
- Senal auxiliar en estrategias cuantitativas: los scores de sentimiento por titular pueden agregarse en ventanas temporales para construir indicadores de tono de mercado, siempre como una senal mas entre otras y no como base unica de decision.
- Enrutamiento de alertas: en una sala de trading o en un sistema de monitorizacion, el modelo puede priorizar titulares bajistas para revision humana inmediata y descartar o agrupar los neutros.
- Etiquetado previo de corpus: util para preanotar grandes volumenes de titulares financieros en ingles y acelerar la revision manual en proyectos de anotacion supervisada.
- Linea base en experimentos de NLP financiero: sirve como referencia de comparacion para evaluar si un modelo basado en transformers justifica su coste frente a un enfoque TF-IDF con regresion logistica.
- Clasificacion en entornos con recursos limitados: al no requerir GPU ni frameworks pesados, puede desplegarse en contenedores pequenos, funciones serverless o dispositivos de borde para tareas de etiquetado continuo.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Precision de validacion | 0,811 |
| F1 macro | 0,754 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU con scikit-learn y joblib.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier GPU consumer, aunque no es necesario utilizarla.
- Opciones de despliegue: serializacion joblib cargada desde Python con scikit-learn; puede envolverse en FastAPI, Flask o una funcion serverless para servir predicciones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de TF-IDF con regresion logistica, la inferencia por titular es de orden de milisegundos en CPU, aunque no se ha publicado una medicion concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ROUL34/finance-headline-sentiment | TF-IDF + regresion logistica | 3 (bajista, alcista, neutro) | Titulares cortos en ingles | MIT | Hugging Face |
| zeroshot/twitter-financial-news-sentiment | Dataset de referencia (no es un modelo) | 3 | no disponible | no disponible | Hugging Face |
| Alternativas basadas en transformers para sentimiento financiero (p. ej. FinBERT) | Transformer encoder | 3 | hasta 512 tokens | no disponible en esta ficha | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables que permitan una comparacion cuantitativa rigurosa. La comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo procesa titulares cortos en ingles; la model card excluye explicitamente otros idiomas y textos largos.
- El rendimiento declarado (precision 0,811, F1 macro 0,754) proviene de validacion interna; no se documenta el esquema de particion ni la posible fuga de datos.
- El F1 macro de 0,754 sugiere un rendimiento desigual entre clases; la clase neutra o las minoritarias pueden tener peor F1 que la media.
- Al ser un modelo TF-IDF, no captura negacion compleja, ironia ni contexto mas alla del propio titular, lo que incrementa el riesgo de errores en titulares ambiguos.
- No es asesoramiento financiero; la propia model card lo advierte. No debe usarse como unica base para decisiones de inversion.
- No se documentan sesgos especificos, pero el entrenamiento sobre un dataset de Twitter puede heredar el sesgo de dominio y de estilo de esa plataforma, con posible degradacion sobre prensa financiera formal.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se especifican restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, lo que sugiere que el artefacto puede no estar publicado o ser de tamano despreciable; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- No se especifica la version de scikit-learn ni de Python usada en el entrenamiento, lo que puede provocar incompatibilidades al cargar el joblib.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ROUL34/finance-headline-sentiment
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Repositorio markets-lab (mencionado en la model card, sin URL disponible): no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
