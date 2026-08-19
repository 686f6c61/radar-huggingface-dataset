# OneScience-Group/GenScore

## Resumen

GenScore es un framework de scoring proteína-ligando desarrollado por OneScience-Group, diseñado para predecir la afinidad de unión entre proteínas y moléculas pequeñas, así como para evaluar la calidad de poses de docking. Se basa en redes neuronales de grafos (GNN) y extiende el modelo RTMScore, ofreciendo capacidades equilibradas de scoring, ranking, docking y cribado virtual en múltiples conjuntos de datos. El modelo es relevante en el ámbito del descubrimiento de fármacos asistido por computadora, donde la predicción precisa de la afinidad de unión es crítica para filtrar candidatos y optimizar compuestos.

El framework incluye funcionalidades como generación automática de bolsillos de unión a partir de la estructura completa de la proteína, análisis de contribuciones a nivel de átomo y residuo para interpretabilidad, y soporte para entrenamiento del modelo con datos preprocesados de PDBbind. Además, permite evaluar el rendimiento mediante el benchmark CASF-2016 en sus tres modalidades: scoring, docking y cribado virtual. Actualmente, los pesos del modelo y los conjuntos de datos no están disponibles públicamente; se prevé su publicación próxima en Hugging Face, junto con soporte para descarga mediante línea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN), extensión de RTMScore |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (interfaz y documentacion) |
| Licencia | MIT |
| Formato de pesos | no disponible (pendiente de publicacion) |

## Arquitectura y entrenamiento

GenScore se basa en redes neuronales de grafos (GNN) y amplía el enfoque de RTMScore, un modelo previo para scoring proteína-ligando. La arquitectura procesa representaciones gráficas de la proteína y el ligando, donde los átomos y enlaces se modelan como nodos y aristas, permitiendo capturar interacciones espaciales y químicas relevantes para la afinidad de unión. El modelo soporta distintos encoders de grafos, como GatedGCN, lo que ofrece flexibilidad en la extracción de características.

El entrenamiento se realiza sobre datos preprocesados de PDBbind, que deben incluir archivos con identificadores, grafos de ligando y grafos de proteína. Se proporcionan scripts para un entrenamiento a pequeña escala (smoke test) y para entrenamiento completo, con parámetros configurables como número de épocas, tamaño de lote y paciencia para early stopping. No se han detallado públicamente el número total de parámetros, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que el modelo no es un LLM sino un predictor de afinidad.

## Capacidades

- Prediccion de afinidad de union proteina-ligando: genera una puntuacion de union para una proteina (o bolsillo extraido) y una conformacion de ligando.
- Generacion automatica de bolsillo de union: extrae el bolsillo de union a partir de la estructura completa de la proteina utilizando la posicion de un ligando de referencia.
- Analisis de contribuciones: proporciona contribuciones a nivel de atomo y de residuo a la puntuacion final, facilitando la interpretabilidad de las predicciones.
- Entrenamiento del modelo: permite reentrenar la red de scoring GenScore utilizando datos preprocesados de PDBbind en formato de grafos.
- Evaluacion en benchmark CASF-2016: soporta tres pruebas estandar: scoring/ranking, docking y cribado virtual.
- Compatibilidad con GPU y DCU: puede ejecutarse en aceleradores NVIDIA (GPU) y Hygon DCU, con instrucciones especificas para cada entorno.

## Casos de uso

- Cribado virtual de librerias de compuestos: GenScore puede puntuar rapidamente miles de ligandos contra un objetivo proteico, priorizando aquellos con mayor afinidad predicha para experimentos posteriores. Su capacidad de evaluar poses de docking lo hace util para filtrar resultados de herramientas de docking como AutoDock Vina o Glide.
- Optimizacion de lideres en descubrimiento de farmacos: al proporcionar puntuaciones de afinidad y analisis de contribuciones por atomo y residuo, el modelo ayuda a los quimicos medicos a identificar que partes de una molecula son criticas para la union y guiar modificaciones estructurales.
- Evaluacion de poses de docking: dado un complejo proteina-ligando generado por software de docking, GenScore puede discriminar entre poses correctas e incorrectas, mejorando la fiabilidad de los resultados de docking.
- Analisis de interacciones moleculares: mediante el analisis de contribuciones, se pueden identificar los residuos clave de la proteina y los atomos del ligando que mas influyen en la afinidad, lo que es valioso para estudios mecanisticos y diseno racional.
- Entrenamiento personalizado con datos propios: el framework permite reentrenar el modelo con conjuntos de datos especificos de una organizacion, adaptando las predicciones a familias proteicas o tipos de ligandos particulares.
- Benchmarking y validacion de metodos: los investigadores pueden utilizar el soporte integrado para CASF-2016 para comparar el rendimiento de GenScore con otros metodos de scoring en condiciones estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que GenScore demuestra capacidades equilibradas de scoring, ranking, docking y cribado virtual en multiples conjuntos de datos, y que soporta la evaluacion en CASF-2016, pero no se proporcionan metricas concretas (como valores de correlacion de Pearson, tasas de exito de docking o enriquecimiento en cribado). Los pesos y datasets aun no estan publicados, por lo que no es posible verificar estos resultados de forma independiente.

## Requisitos de hardware

- Se recomienda ejecutar en GPU (NVIDIA) o DCU (Hygon) para un rendimiento adecuado; la CPU es util solo para comprobaciones de conectividad, pero resulta lenta.
- Para usuarios de DCU, se requiere instalar DTK (version 25.04.2 o posterior, o la recomendada por OneScience para el cluster).
- No se especifican requisitos de VRAM ni GPUs concretas (por ejemplo, A100, RTX 4090) en la informacion disponible.
- El despliegue se realiza mediante el paquete `onescience[bio]` y scripts de shell proporcionados, no a traves de frameworks como vLLM u Ollama (al no ser un LLM).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

GenScore se presenta como una extension de RTMScore, un metodo de scoring basado en GNN. Sin embargo, no se dispone de informacion publica sobre otros modelos comparables (como DeepDock, GNINA, o metodos clasicos como GlideScore) en terminos de parametros, contexto o rendimiento. La unica referencia directa es RTMScore, del cual GenScore hereda la arquitectura base. No se pueden establecer comparaciones cuantitativas sin datos de benchmarks publicados.

## Limitaciones y advertencias

- Los pesos del modelo y los datasets no estan disponibles actualmente; solo se puede acceder al codigo y scripts, lo que impide su uso inmediato en produccion.
- La documentacion esta en ingles y la interfaz de usuario (OneCode) parece estar orientada a un entorno especifico, lo que puede limitar su adopcion fuera de ese ecosistema.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente a otros metodos no puede verificarse.
- El modelo requiere datos preprocesados en un formato especifico (archivos `.npy` y `.pt`), lo que implica un paso de preprocesamiento adicional para nuevos usuarios.
- Al ser un modelo de scoring, su precision depende en gran medida de la calidad de los datos de entrenamiento (PDBbind) y puede no generalizar bien a clases de proteinas o ligandos no representadas.
- No se mencionan sesgos especificos, pero como cualquier modelo entrenado con datos biologicos, puede presentar sesgos hacia tipos de interacciones mas frecuentes en el dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero la ausencia de pesos publicados limita su aplicacion practica hasta que se publiquen.

## Enlaces

- [HuggingFace - OneScience-Group/GenScore](https://huggingface.co/OneScience-Group/GenScore)
- [Entorno OneCode (acceso online)](https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home)

No se proporcionan otros enlaces (papers, repositorios de codigo, demos) en la informacion disponible.
