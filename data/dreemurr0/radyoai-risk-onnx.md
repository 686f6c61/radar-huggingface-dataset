# Dreemurr0/radyoai-risk-onnx

## Resumen

RadyoAI risk-onnx es un clasificador tabular binario empaquetado en formato ONNX, desarrollado por el usuario Dreemurr0. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline clasico de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression`, exportado a ONNX mediante skl2onnx. Su funcion es predecir la probabilidad de que un jugador elija la opcion de riesgo (opcion B) en las escenas 2 y 3 de un juego educativo llamado RadyoAI, que ensena a tomar decisiones en proyectos de inteligencia artificial.

El modelo consume cinco caracteristicas numericas de sesiones previas (numero de escena, nivel declarado, numero de decisiones arriesgadas anteriores y dos tiempos medios de lectura y decision) y devuelve un vector de dos probabilidades. Cuando la probabilidad de riesgo es igual o superior a 0,5, el juego activa un "modo apoyo" con pistas y sin presion temporal. Es, por tanto, una pieza de logica de juego adaptativa, no una herramienta de analisis general.

Su relevancia es muy acotada: el repositorio tiene 0 descargas y 0 likes, el tamano es practicamente nulo (0,0 GB) y la mayor parte del conjunto de entrenamiento es sintetico. Resulta util como ejemplo didactico de despliegue de un modelo tabular en ONNX dentro de una aplicacion interactiva, pero no como componente de produccion fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + LogisticRegression, exportado a ONNX |
| Parametros totales | 5 coeficientes + 1 intercepto (regresion logistica); no disponible el recuento exacto de parametros del pipeline completo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular fija de 5 caracteristicas) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es ONNX en float32) |
| Idiomas soportados | no disponible (no procesa texto; la model card esta en turco) |
| Licencia | no disponible |
| Formato de pesos | ONNX (entrada `input` float32 `[n, 5]`, salida `probabilities` float32 `[n, 2]`) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre caracteristicas estandarizadas. El pipeline aplica `StandardScaler` a las cinco variables de entrada y despues una regresion logistica con `random_state=13`, entrenada con Python 3.12, scikit-learn 1.9.1 y exportada con skl2onnx 1.20.0. La discrepancia maxima entre la prediccion ONNX y la de scikit-learn es de 7,12e-08, lo que confirma que la exportacion es fiel. El contrato de entrada y el esquema JSON se documentan en `config.json`.

El conjunto de datos (`data/oturmas.csv`, solo filas de escenas 2 y 3) contiene 400 filas, de las cuales 0 son reales y 400 son sinteticas segun la model card. Las filas reales provendrian del modo de recogida de datos de la aplicacion y no contienen datos personales; las sinteticas se generan con una regla y una semilla documentadas en `data/sentetik.py`. La validacion se hizo con un hold-out estratificado del 30 % (120 filas). No se menciona entrenamiento con RLHF, DPO ni tecnicas de ajuste fino; es un ajuste supervisado convencional sobre datos tabulares.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de eleccion de la opcion arriesgada a partir de cinco caracteristicas numericas.
- Inferencia via ONNX Runtime con entrada float32 de forma `[n, 5]` y salida de probabilidades `[n, 2]`.
- Integracion en logica de juego: umbral `p >= 0,5` para activar el modo de apoyo (pistas, sin limite de tiempo, nota de mentor).
- Exportacion reproducible desde scikit-learn a ONNX con diferencias numericas despreciables.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Ajuste dinamico de dificultad en el juego RadyoAI: el modelo decide si la escena 2 o 3 se abre en modo apoyo segun el comportamiento previo del jugador, manteniendo la experiencia adaptada sin intervencion manual.
- Prototipado de sistemas de recomendacion educativa: sirve como ejemplo minimo de como convertir un pipeline de scikit-learn en un artefacto ONNX desplegable en el cliente o en el servidor del juego.
- Docencia sobre despliegue de modelos tabulares: util en cursos que ensenen el flujo completo desde el entrenamiento con scikit-learn hasta la inferencia con ONNX Runtime, incluida la validacion de equivalencia numerica.
- Evaluacion de pipelines de clasificacion con datos mayoritariamente sinteticos: permite estudiar como se comporta un modelo cuando la relacion aprendida procede de una regla generadora y no de datos reales.
- Telemetria de sesiones en aplicaciones interactivas: el mismo esquema de cinco caracteristicas (nivel, decisiones previas, tiempos medios) puede reutilizarse como plantilla para registrar y clasificar patrones de comportamiento en otros entornos ludicos o de formacion.
- Pruebas de integracion en CI/CD para aplicaciones que consumen modelos ONNX: al ser un artefacto pequeno y determinista, resulta adecuado para tests de regresion del contrato de entrada y salida.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ROC-AUC (hold-out estratificado del 30 %, 120 filas) | 0,726 |
| Exactitud con umbral p >= 0,5 | 0,675 |
| Exactitud de un clasificador que siempre predice la clase mayoritaria | 0,5667 |
| ROC-AUC solo con filas reales | no calculable (0 filas reales; el conjunto de test no contiene ambas clases) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay comparacion con MMLU, HumanEval, GSM8K ni metricas de modelos de lenguaje, ya que no es un modelo de ese tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto ocupa 0,0 GB y la inferencia cabe en CPU.
- GPU recomendadas: no necesaria; funciona en cualquier CPU moderna con ONNX Runtime.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU, como un navegador con onnxruntime-web o un dispositivo movil.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript), onnxruntime-web en el cliente, o cualquier runtime compatible con ONNX. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles de forma oficial; por la naturaleza del modelo (regresion logistica sobre 5 caracteristicas) la latencia seria del orden de microsegundos a milisegundos por lote, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dreemurr0/radyoai-risk-onnx | Clasificador tabular lineal (ONNX) | 5 coeficientes + intercepto | no aplica | ROC-AUC 0,726 en hold-out propio | no disponible | Hugging Face, 0 descargas |
| Clasificador tabular generico con scikit-learn | Clasificador tabular | Depende del algoritmo | no aplica | Depende del dataset | segun libreria (BSD-3) | Amplia |
| XGBoost / LightGBM (referencia tabular) | Ensemble de arboles | Depende de la configuracion | no aplica | Habitualmente superior en tabular | Apache 2.0 / MIT | Amplia |

No se dispone de modelos comparables directos publicados con el mismo proposito (prediccion de riesgo en un juego educativo concreto). La comparativa anterior es orientativa por categoria y no se han encontrado datos de rendimiento de terceros sobre este mismo problema.

## Limitaciones y advertencias

- El 100 % de las filas de entrenamiento son sinteticas segun la model card; la relacion "jugador con prisa elige la opcion arriesgada" fue impuesta por el generador, por lo que el modelo aprende esa suposicion y no necesariamente el comportamiento real.
- El numero de sesiones reales es muy bajo y las metricas sobre filas reales no son fiables (no calculables en el test).
- Las caracteristicas de tiempo dependen del dispositivo y de la velocidad de lectura; un jugador lento puede parecer "cuidadoso" sin serlo.
- No funciona en la escena 1 por arranque en frio: requiere historial previo.
- Riesgo de uso indebido: el autor prohibe explicitamente usar el modelo para calificar, ordenar o tomar decisiones sobre estudiantes, para juegos distintos de RadyoAI, para examenes o para decisiones clinicas o laborales reales.
- No debe interpretarse como un diagnostico de "falta de atencion" de una persona: solo modela unos segundos de comportamiento en el juego.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial ni las condiciones de redistribucion.
- El repositorio no tiene descargas ni validacion externa; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dreemurr0/radyoai-risk-onnx
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
