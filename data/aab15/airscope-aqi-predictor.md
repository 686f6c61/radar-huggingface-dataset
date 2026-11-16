# AAB15/airscope-aqi-predictor

## Resumen

El modelo `AAB15/airscope-aqi-predictor` es un artefacto publicado en Hugging Face por el usuario AAB15 bajo licencia MIT. A pesar de la denominacion "predictor" y de la referencia a AQI (indice de calidad del aire, por sus siglas en ingles), la model card publicada no contiene informacion tecnica alguna: unicamente declara la licencia. No se especifica arquitectura, tamano, tipo de tarea ni metodologia de entrenamiento.

La ausencia de metadatos es total. El campo `pipeline` no esta definido, no se declaran idiomas soportados, no hay etiquetas que indiquen la familia del modelo (no aparece `transformers`, `pytorch`, `tensorflow` ni ninguna otra), y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esto impide confirmar si se trata de un modelo de lenguaje, un modelo de regresion tabular, un modelo de series temporales o cualquier otra categoria.

Por tanto, esta ficha se limita a documentar los pocos datos verificables disponibles (identificador, autor, licencia, fechas de creacion y actualizacion) y a senalar explicitamente que el resto de especificaciones no estan disponibles. Cualquier evaluacion tecnica o decision de adopcion requiere consultar directamente el repositorio o contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No se indica si se trata de un transformer, un modelo de gradiente boosting, una red recurrente, un modelo de series temporales o cualquier otra familia. Tampoco se documentan el volumen de datos de entrenamiento, su composicion, la fuente de las observaciones de calidad del aire ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO.

La unica innovacion tecnica que puede inferirse del nombre es la orientacion a la prediccion de AQI, pero se desconoce el enfoque concreto (regresion sobre variables meteorologicas y de contaminantes, modelos secuenciales sobre series temporales, etc.). No hay informacion disponible sobre el preprocesado, la ventana temporal de entrada ni las metricas de validacion empleadas durante el entrenamiento.

## Capacidades

- No se dispone de documentacion sobre las capacidades del modelo.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirma capacidad multilingue.
- No se confirma la existencia de modos especiales (thinking mode, vision, audio).
- Por el nombre, se presume una orientacion a la prediccion de calidad del aire (AQI), pero esta funcionalidad no esta documentada ni verificada.

## Casos de uso

- Prediccion de calidad del aire: si el modelo cumple lo que su nombre sugiere, podria emplearse para estimar el AQI a partir de variables meteorologicas y concentraciones de contaminantes. No obstante, al no existir documentacion sobre entradas, salidas ni metricas, no es posible confirmar su idoneidad.
- Integracion en paneles de monitorizacion ambiental: un predictor de AQI podria alimentar dashboards de salud publica, pero se desconoce el formato de entrada y salida requerido para integrarlo.
- Alertas tempranas de episodios de contaminacion: uso potencial en sistemas de aviso a poblaciones sensibles, condicionado a la validacion del modelo con datos reales.
- Investigacion academica sobre calidad del aire: el modelo podria servir como linea base reproducible bajo licencia MIT, aunque la falta de documentacion dificulta su replicacion.
- Evaluacion comparativa de predictores de AQI: util unicamente si se dispone de acceso al autor para obtener las especificaciones minimas.
- Prototipado interno: al ser MIT, puede probarse libremente en entornos de desarrollo, pero no se recomienda su uso en produccion sin una evaluacion previa de rendimiento y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamano y la arquitectura del modelo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoria porque no se ha podido determinar la categoria del modelo (lenguaje, tabular, series temporales u otra).

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero la ausencia de informacion sobre los datos de entrenamiento impide descartar sesgos sistematicos en la prediccion de AQI (por ejemplo, sesgo geografico si los datos provienen de una unica region).
- Riesgo de alucinacion: no aplicable si el modelo no es generativo; indeterminado en caso contrario.
- Limitaciones de contexto o idioma: no documentadas.
- La licencia MIT permite uso comercial, modificacion y redistribucion, pero no exime al usuario de validar el modelo con sus propios datos.
- El repositorio no registra descargas ni interacciones, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se recomienda su uso en produccion ni en decisiones con impacto en salud publica sin una evaluacion independiente y documentacion tecnica completa.
- El identificador y las fechas de creacion (2026-11-16) deben verificarse en el repositorio antes de cualquier adopcion.

## Enlaces

- Hugging Face: https://huggingface.co/AAB15/airscope-aqi-predictor
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
