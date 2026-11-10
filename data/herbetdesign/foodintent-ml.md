# herbetdesign/foodintent-ml

## Resumen

FoodIntent ML es un clasificador de intenciones (intent classification) de caracter experimental publicado por el usuario herbetdesign en Hugging Face. Se trata de un modelo de aprendizaje automatico clasico construido con scikit-learn y serializado con joblib, no de un modelo de lenguaje neuronal. Su funcion es asignar una etiqueta de intencion a un texto de entrada, en el dominio de pedidos o conversaciones relacionadas con comida, y esta orientado al idioma portugues segun las etiquetas del repositorio.

El modelo emplea una representacion TF-IDF combinada con un clasificador Naive Bayes multinomial (seleccionado como modelo final segun la model card). El repositorio es de tamano practicamente nulo (0.0 GB), lo que es coherente con un pipeline de scikit-learn de peso muy reducido. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los tipos de cuantizacion, ya que estos conceptos no aplican a este tipo de artefacto.

La relevancia de esta ficha es principalmente documental y de advertencia: el propio autor indica que tanto el conjunto de datos de origen (SID) como el suplemento de entrega son sinteticos, que las metricas reportadas no estiman el rendimiento con clientes reales y que los valores de confianza no estan calibrados. Por tanto, debe tratarse como una prueba de concepto y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con vectorizacion TF-IDF y clasificador Naive Bayes multinomial |
| Parametros totales | no disponible (no aplica; modelo clasico basado en conteos y probabilidades) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; TF-IDF opera sobre el texto vectorizado, sin ventana definida) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib, no requiere cuantizacion) |
| Idiomas soportados | portugues (segun la etiqueta `portuguese` de la model card) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de procesamiento de lenguaje natural: vectorizacion TF-IDF del texto de entrada seguida de un clasificador Naive Bayes multinomial. No hay transformer, atencion ni capas neuronales profundas. El modelo se selecciono como `multinomial_nb` tras una fase de evaluacion entre alternativas, segun indica la model card.

Respecto a los datos, la model card es explicita: tanto la fuente SID (enlazada como dataset `luigicfilho/sid`) como el suplemento de entrega elaborado por el autor son sinteticos. No se especifica el numero de ejemplos de entrenamiento, la composicion del dataset ni si hubo tecnicas de aumento de datos o ajuste fino adicional. No se reporta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en este tipo de modelo. La innovacion tecnica es nula por diseno: se trata de un enfoque clasico y ligero, adecuado para prototipado rapido.

## Capacidades

- Clasificacion de texto en etiquetas de intencion predefinidas, en el dominio de comida y pedidos.
- Inferencia rapida y de bajo coste computacional gracias a la naturaleza del pipeline TF-IDF + Naive Bayes.
- Ejecucion en CPU sin necesidad de GPU.
- Integracion sencilla en aplicaciones Python mediante scikit-learn y joblib.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Cobertura multilingue limitada al portugues segun la etiqueta declarada; no se detallan otros idiomas.
- Generacion de texto: no disponible (es un clasificador, no un modelo generativo).

## Casos de uso

- Prototipado de enrutamiento de intenciones en un chatbot de pedidos de comida: el clasificador puede etiquetar mensajes entrantes en categorias como consulta de menu, modificacion de pedido o queja, siempre con revision humana posterior.
- Etiquetado asistido de conversaciones para analisis interno: dado que las metricas provienen de datos sinteticos, su uso razonable es como ayuda de anotacion supervisada por humanos, no como decision automatica.
- Prueba de concepto en entornos academicos o de investigacion: sirve para comparar un enfoque clasico TF-IDF + Naive Bayes frente a modelos neuronales en tareas de clasificacion de intenciones en portugues.
- Filtrado preliminar de mensajes en un pipeline mayor: puede actuar como primera capa de triaje que derive los casos ambiguos a un modelo mayor o a un operador humano.
- Validacion de infraestructura de despliegue de modelos scikit-learn: util para probar pipelines de empaquetado, versionado y servicio de artefactos joblib antes de incorporar modelos mas pesados.
- Demostracion educativa de clasificacion de texto: adecuado para talleres o tutoriales sobre TF-IDF, Naive Bayes y evaluacion con F1 macro.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Modelo seleccionado | multinomial_nb |
| F1 macro en test curado | 1.0000 |
| F1 macro en test SID | 0.9580 |

El autor advierte que ambos conjuntos de datos son sinteticos y que estas metricas no estiman el rendimiento con clientes reales. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer: si, y tambien en CPU de gama baja, dado el tamano practicamente nulo del repositorio (0.0 GB).
- Opciones de despliegue: carga directa con scikit-learn y joblib en Python; servicio mediante FastAPI, Flask o similares; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del pipeline se espera latencia muy baja en CPU, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodIntent ML (herbetdesign) | TF-IDF + Naive Bayes multinomial | no disponible (no aplica) | no aplica | MIT | Hugging Face |
| Clasificadores de intenciones con scikit-learn genericos | TF-IDF + clasico | no aplica | no aplica | variable | Amplia (pip, repositorios) |
| Modelos neuronales de clasificacion de texto en portugues (BERTimbau y derivados) | Transformer encoder | cientos de millones (segun variante) | 512 tokens tipicamente | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Datos de entrenamiento y evaluacion sinteticos: las metricas reportadas (F1 macro de 1.0000 y 0.9580) no estiman el rendimiento con clientes reales.
- Valores de confianza no calibrados: no deben interpretarse como probabilidades fiables para umbrales de decision automaticos.
- El autor indica explicitamente que no se automaticen decisiones que afecten a clientes y que toda prediccion requiere revision humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser datos sinteticos, el riesgo de sesgos de dominio es alto.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza aparente.
- Limitaciones de idioma: cobertura declarada en portugues; el rendimiento en otros idiomas no esta documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero las advertencias del autor sobre la calidad del modelo desaconsejan su uso en produccion sin validacion adicional.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/herbetdesign/foodintent-ml
- Dataset SID referenciado: https://huggingface.co/datasets/luigicfilho/sid
