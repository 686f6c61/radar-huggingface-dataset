# rafaelvieiraCAN/AIGC-5005lab09-fine-tune-and-publish

## Resumen

Lakeshore Ticket Sorter es un ajuste fino de DistilBERT desarrollado por el usuario rafaelvieiraCAN en el marco del proyecto academico AIGC-5005 (Laboratorio 09). El modelo resuelve una tarea concreta de clasificacion de texto: enrutar tickets de soporte de un servicio de bicicletas compartidas en cuatro categorias predefinidas (billing, bike_fault, station y account). No es un modelo generativo ni un asistente conversacional, sino un clasificador de secuencia supervisado.

Con 66.956.548 parametros, se situa en el rango habitual de DistilBERT (aproximadamente 66 millones), lo que lo hace ligero y apto para inferencia en CPU o GPU de consumo. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors. El autor declara una precision del 90,42 % en el conjunto de prueba, frente a un 88,75 % de una linea base TF-IDF con regresion logistica y un 29,17 % de la linea base de mayoria.

Su relevancia es fundamentalmente didactica: demuestra el flujo completo de ajuste fino de un transformer pequeno para clasificacion de tickets y su publicacion en Hugging Face. No cuenta con descargas ni interacciones en el momento de la consulta, y el autor no ha publicado informacion sobre licencia, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.956.548 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por diseno, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT, una version destilada de BERT con 6 capas de encoder en lugar de 12, aproximadamente la mitad de parametros y una reduccion de latencia estimada por sus autores originales en torno al 40 % respecto a BERT-base, conservando cerca del 97 % de su rendimiento en tareas de comprension del lenguaje. Sobre esta base se anade una cabeza de clasificacion para cuatro etiquetas: billing, bike_fault, station y account.

El ajuste fino se realizo sobre un conjunto de datos sintetico de tickets de soporte de un servicio de bicicletas compartidas, generado especificamente para el laboratorio AIGC-5005. La model card no especifica el numero de ejemplos de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros ni si se aplicaron tecnicas adicionales como busqueda de tasa de aprendizaje o early stopping. Tampoco se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador supervisado de este tipo.

## Capacidades

- Clasificacion de texto en cuatro categorias cerradas: billing, bike_fault, station y account.
- Enrutamiento automatico de tickets de soporte hacia el equipo o flujo correspondiente.
- Inferencia ligera: al tratarse de un DistilBERT, el coste computacional por prediccion es bajo en comparacion con modelos de mayor tamano.
- Despliegue con la libreria transformers de Hugging Face mediante la clase de clasificacion de secuencias.
- Integracion en una aplicacion Gradio desarrollada localmente por el autor para demostrar las predicciones, segun la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento es sintetico y no se declara su idioma.

## Casos de uso

- Enrutamiento de tickets en un servicio de bicicletas compartidas: el modelo asigna cada mensaje entrante a billing, bike_fault, station o account, lo que permite dirigirlo automaticamente al equipo correspondiente y reducir el tiempo de primera respuesta.
- Triaje en mesas de ayuda con volumen alto: al ser un modelo de 67 millones de parametros, puede procesar lotes grandes de tickets en CPU con coste bajo, lo que lo hace adecuado como primera capa de clasificacion antes de escalar a un agente humano.
- Etiquetado previo para analitica de soporte: las predicciones permiten agregar el volumen de incidencias por categoria y detectar, por ejemplo, picos de fallos de bicicleta o problemas de estaciones.
- Prototipado academico y docencia: sirve como ejemplo reproducible de ajuste fino de un transformer pequeno para clasificacion de texto, con linea base TF-IDF y comparativa de resultados incluida en la model card.
- Filtrado y priorizacion de colas: combinado con reglas de negocio, el modelo puede separar incidencias de facturacion (potencialmente sensibles) del resto y aplicarles un flujo distinto.
- Demostracion interactiva con Gradio: el autor ya construyo una aplicacion local que muestra las predicciones, util para presentar el modelo a interesados no tecnicos o en un contexto de evaluacion.
- Base para experimentos de destilacion o comparacion de clasificadores: al estar publicado con pesos safetensors, puede reutilizarse como punto de partida para probar otras cabezas de clasificacion o tecnicas de aumento de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de prueba del proyecto:

| Metodo | Precision (accuracy) |
|---|---|
| Linea base de mayoria | 29,17 % |
| TF-IDF + regresion logistica | 88,75 % |
| DistilBERT (conjunto de prueba) | 90,42 % |
| DistilBERT (mensajes personalizados) | 95,00 % |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden exclusivamente al dataset sintetico del laboratorio y no son comparables con evaluaciones publicas de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (66,96 millones de parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, menos de 1 GB.
- VRAM estimada en FP16: alrededor de 0,13 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para lotes moderados gracias al tamano reducido del modelo.
- Opciones de despliegue: transformers (PyTorch) como via principal, con posibilidad de exportacion a ONNX; tambien es compatible con pipelines de Hugging Face y con la aplicacion Gradio que el autor menciona. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore Ticket Sorter (este modelo) | 66.956.548 | no disponible | Clasificacion de tickets en 4 clases | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | aproximadamente 66 millones | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 | Hugging Face, ampliamente utilizado |
| TF-IDF + regresion logistica (linea base del propio proyecto) | no aplica | no aplica | Clasificacion de tickets | no aplica | Implementacion local |
| BERT-base-uncased | aproximadamente 110 millones | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 | Hugging Face, ampliamente utilizado |

La comparacion con los modelos base es estructural: este modelo es un ajuste fino de DistilBERT y hereda su arquitectura, pero su rendimiento solo esta medido en el dataset sintetico del laboratorio, por lo que no puede contrastarse con resultados publicos de clasificacion. No se dispone de datos de benchmarks comparables con alternativas especializadas en clasificacion de tickets.

## Limitaciones y advertencias

- El dataset de entrenamiento es sintetico y, segun el propio autor, puede no representar fielmente las solicitudes reales de soporte; el rendimiento en produccion puede degradarse.
- No se documentan sesgos conocidos, pero al entrenarse con datos generados artificialmente puede heredar los sesgos de los prompts o del generador utilizado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en mensajes ambiguos o fuera de las cuatro categorias, ya que el modelo siempre asignara una de las cuatro etiquetas.
- No se especifica la licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- No se declaran los idiomas soportados; el modelo puede no funcionar correctamente en castellano u otros idiomas distintos del usado en el dataset sintetico.
- No hay informacion sobre el numero de ejemplos de entrenamiento ni sobre la particion train/validation/test, lo que dificulta evaluar la robustez de las cifras reportadas.
- El modelo esta pensado para fines educativos, segun la model card; no se recomienda su uso en produccion sin una validacion adicional con datos reales.
- Ausencia de descargas y de interacciones en Hugging Face: no existe validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafaelvieiraCAN/AIGC-5005lab09-fine-tune-and-publish
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos publicas asociadas al modelo.
