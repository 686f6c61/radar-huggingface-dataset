# mertaytac/the-primer-v2-model

## Resumen

The Primer v2 es un modelo de regresion logistica de tamano muy reducido publicado por el usuario mertaytac en HuggingFace. Su proposito declarado es predecir, a partir de caracteristicas de comportamiento de juego, la etiqueta de necesidad de ayuda que el propio jugador ha reportado. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un clasificador tabular clasico exportado a formato ONNX, con un repositorio de 0,0 GB y sin pipeline de HuggingFace definido.

El modelo se distribuye en estado `demo_unverified`, segun la propia model card. Los datos de entrenamiento son minimos: 120 filas en origen, de las cuales 88 se usaron para entrenamiento y 32 para prueba, con solo 11 sesiones de entrenamiento y 4 de prueba tras un split a nivel de sesion. La evaluacion se etiqueta explicitamente como `demo_session_split_synthetic_eval`, lo que indica que las metricas provienen de una evaluacion sintetica de demostracion y no de una validacion en produccion.

La relevancia de esta ficha es fundamentalmente metodologica: sirve como ejemplo de publicacion de un artefacto ONNX con trazabilidad de metricas y advertencias explicitas de uso, pero no debe confundirse con un modelo de IA generativa ni emplearse en decisiones reales. La informacion disponible sobre arquitectura interna, licencia, idiomas y formato de pesos mas alla de ONNX es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador tabular lineal); exportado a ONNX |
| Parametros totales | no disponible (coeficientes de regresion logistica; numero no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en turco; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (compatibilidad verificada con sklearn; diferencia maxima ONNX-sklearn de 8,21575746e-08) |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica, un modelo lineal para clasificacion binaria. La model card no detalla el numero de caracteristicas de entrada ni si se aplico regularizacion, escalado o seleccion de variables. El artefacto se exporta a ONNX y se valida contra la implementacion de referencia en scikit-learn, con una discrepancia maxima entre ambas salidas de 8,21575746e-08, lo que confirma una exportacion numericamente fiel.

El entrenamiento se realizo sobre 120 filas procedentes de `data/oturumlar.csv` (sesiones), con un split a nivel de sesion: 11 sesiones para entrenamiento (88 filas) y 4 sesiones para prueba (32 filas). No se declara el numero de tokens ni composicion de dataset porque no aplica; tampoco se menciona RLHF, DPO ni ninguna tecnica de ajuste fino. La innovacion tecnica destacable es la separacion por sesion para evitar fuga de informacion entre train y test, junto con la verificacion de equivalencia ONNX frente a sklearn.

## Capacidades

- Clasificacion binaria tabular: predice la etiqueta de necesidad de ayuda reportada por el jugador a partir de caracteristicas de comportamiento en el juego.
- Inferencia via ONNX Runtime, lo que permite despliegue ligero en CPU y en entornos sin GPU.
- Reproducibilidad numerica verificada frente a scikit-learn (diferencia maxima de 8,21575746e-08).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo thinking ni de ninguna capacidad especial de inferencia extendida.

## Casos de uso

- Prototipado de pipelines ONNX en entornos de juego: el modelo sirve para validar el flujo completo de exportacion, carga y ejecucion con ONNX Runtime antes de sustituirlo por un clasificador mas robusto, gracias a su tamano minimo y a la verificacion de equivalencia con sklearn.
- Pruebas de integracion en backend de telemetria: se puede insertar en un servicio que reciba caracteristicas de sesion y devuelva una etiqueta de necesidad de ayuda, usando el modelo como stub funcional en entornos de staging.
- Docencia y demostracion de buenas practicas de publicacion: la model card incluye metricas, matriz de confusion y advertencias de uso, lo que lo convierte en un ejemplo didactico de trazabilidad de un artefacto de ML.
- Validacion de esquemas de features: al ser un modelo lineal simple, permite comprobar que las caracteristicas de entrada se calculan y serializan correctamente antes de entrenar modelos mas complejos.
- Benchmark de latencia de ONNX Runtime: por su tamano despreciable, sirve para medir el coste fijo de carga y ejecucion de un grafo ONNX en una infraestructura concreta.
- Prueba de conceptos de senalizacion de ayuda en videojuegos: con las debidas advertencias, puede usarse en un entorno controlado para explorar si las features de comportamiento guardan relacion con la auto-declaracion de necesidad de ayuda, sin tomar decisiones reales sobre jugadores.

## Benchmarks y rendimiento

Metricas declaradas en la model card sobre el split de prueba (32 filas, 4 sesiones), evaluacion de tipo `demo_session_split_synthetic_eval`:

| Metrica | Valor |
|---|---|
| Accuracy | 0,78125 |
| Precision | 0,730769 |
| Recall | 1,0 |
| F1 | 0,844444 |
| Filas de entrenamiento | 88 |
| Filas de prueba | 32 |
| Sesiones de entrenamiento | 11 |
| Sesiones de prueba | 4 |
| Diferencia maxima ONNX-sklearn | 8,21575746e-08 |

Matriz de confusion declarada: `[[6, 7], [0, 19]]`, es decir, 6 verdaderos negativos, 7 falsos positivos, 0 falsos negativos y 19 verdaderos positivos. El recall de 1,0 con 7 falsos positivos indica un modelo sesgado hacia la clase positiva. No se han publicado resultados frente a modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en memoria de CPU y no requiere GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de forzar GPU, cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) ejecutaria el grafo sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, aunque no es necesario; el cuello de botella sera el preprocesado de features, no el modelo.
- Opciones de despliegue: ONNX Runtime (principal), y potencialmente cualquier runtime compatible con ONNX. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (regresion logistica) se espera latencia de microsegundos a milisegundos por muestra en CPU, pero no se aporta medicion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia generica de la categoria, se podria comparar con cualquier clasificador tabular lineal (regresion logistica en scikit-learn, XGBoost o LightGBM en formato ONNX), pero no se aportan datos de rendimiento de alternativas, por lo que la comparativa cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| The Primer v2 | no disponible | no aplica | F1 0,844444 (demo sintetica) | no disponible | HuggingFace (0 descargas, 0 likes) |
| Alternativas lineales tabulares | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado como `demo_unverified`: no ha pasado una verificacion independiente.
- Datos de entrenamiento minimos: 120 filas totales, 11 sesiones de entrenamiento y 4 de prueba; la generalizacion no es fiable con este volumen.
- Cero sesiones independientes reales declaradas en el origen de datos, segun la propia model card.
- Evaluacion de tipo sintetico (`demo_session_split_synthetic_eval`), no una validacion en produccion.
- Recall de 1,0 con 7 falsos positivos sobre 32 muestras: el modelo sobrepredice la clase positiva y la precision es limitada.
- La auto-declaracion del jugador puede ser enganosa, tal como advierte el autor.
- Posible desajuste entre las caracteristicas intermedias disponibles en el momento de la decision y la distribucion de caracteristicas finales usada en entrenamiento.
- No debe usarse en decisiones criticas de seguridad, salud, disciplina ni evaluacion de estudiantes.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- No es un modelo de lenguaje: no admite prompts, contexto conversacional ni generacion de texto.
- Sin informacion sobre sesgos, idiomas ni cuantizaciones; no apto para produccion sin reentrenamiento y validacion propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mertaytac/the-primer-v2-model
