# HarshilDaGoat/gem-bid-risk

## Resumen

`HarshilDaGoat/gem-bid-risk` es un clasificador tabular basado en LightGBM que estima el nivel de riesgo de cumplimiento de una puja (bid) del Government e-Marketplace (GeM) indio. Devuelve cuatro clases —Low, Medium, High y Non-Compliant— a partir de lo que ha observado un pipeline automatizado de verificación: estados de portales (GSTN, PAN, Udyam, EPFO/ESIC, Startup India, registro de inhabilitación, contenido local Make in India), resultados de extracción documental, autodeclaraciones del licitador y documentos ausentes.

El modelo no es un sistema de decisión autónomo: está diseñado para asistir a un motor de reglas auditable. El veredicto del motor de reglas sobre la evidencia disponible sigue siendo la decisión oficial; el modelo estima cuál sería ese veredicto si la información fuese completa y correcta. Por tanto, una discrepancia entre ambos es una señal para el funcionario (por ejemplo, el motor marca Non-Compliant porque el portal GST agotó el tiempo de espera y el modelo estima Low, lo que indica «reverificar», no «aceptar»). Cada predicción va acompañada de las contribuciones SHAP exactas por instancia que explican el resultado.

Es relevante porque aborda un cuello de botella real de la contratación pública india: la verificación manual de licitadores contra más de ocho portales gubernamentales desconectados. Su enfoque —entrenar sobre datos sintéticos donde las etiquetas proceden del motor de reglas aplicado a los hechos verdaderos y las características proceden de observaciones ruidosas— modela explícitamente el fallo operativo (caídas de portal, escaneos ilegibles, campos no leídos por OCR) en lugar de ignorarlo. El repositorio ocupa 0,0 GB y el modelo se distribuye en formato de texto de LightGBM, sin pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM) |
| Parametros totales | no disponible (no se publica numero de arboles, hojas ni tamano del fichero `model.txt`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; la entrada es un vector de caracteristicas, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible (no aplica; se distribuye en formato de texto nativo de LightGBM, sin cuantizacion) |
| Idiomas soportados | no disponible (el campo de idiomas no esta informado en HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.txt` (formato de texto de LightGBM, sin pickle); acompanado de `features.json` (orden y codificacion de caracteristicas), `features.py` (featurizador) e `infer.py` (predictor) |

## Arquitectura y entrenamiento

Se trata de un clasificador LightGBM, es decir, un ensemble de arboles de decision entrenado con gradient boosting. No hay transformer, atencion ni mecanismo de estado: la entrada es un vector de caracteristicas tabulares construido por `features.py` a partir de la puja y de las observaciones del pipeline, y la salida es una distribucion de probabilidad sobre cuatro clases de riesgo. La explicabilidad se obtiene con contribuciones SHAP exactas por prediccion, calculadas directamente por LightGBM.

Los datos de entrenamiento son integramente sinteticos y se generan con `ml/risk/generate.py`: 180.000 ejemplos de entrenamiento, 10.000 de validacion y 10.000 de test, publicados como dataset independiente. El diseno experimental separa dos fuentes de informacion: las etiquetas se producen ejecutando el motor de reglas real de la plataforma sobre los hechos verdaderos de cada licitador sintetico, mientras que las caracteristicas se derivan unicamente de observaciones ruidosas de esos mismos hechos (caidas de portal, escaneos ilegibles, campos que el OCR no captura, declaraciones en blanco). Esta asimetria es la innovacion tecnica central: el modelo aprende a reconstruir el veredicto correcto a partir de evidencia degradada, y por construccion su discrepancia con el motor de reglas senala casos que requieren reverificacion. El autor advierte de que las tasas base de cada problema son supuestos, no mediciones de pujas reales de GeM, por lo que las probabilidades deben calibrarse con resultados reales antes de confiar en ellas.

## Capacidades

- Clasificacion supervisada en cuatro niveles de riesgo de cumplimiento: Low, Medium, High y Non-Compliant.
- Salida de probabilidades por clase, ademas de la etiqueta predicha, mediante `RiskModel(path).predict(tender, observed)`.
- Explicabilidad por instancia: devuelve `top_factors` con las contribuciones SHAP exactas que motivaron cada prediccion.
- Integracion de senales heterogeneas de verificacion: estados de GSTN, PAN, Udyam, EPFO/ESIC, Startup India, registro de inhabilitacion de GeM y contenido local Make in India.
- Tolerancia a evidencia incompleta o degradada: modela explicitamente caidas de portal, documentos ilegibles, campos perdidos por OCR y declaraciones vacias.
- Deteccion de discrepancias frente a un motor de reglas auditable, como senal de reverificacion para el funcionario.
- No dispone de tool calling, capacidades de agente, generacion de texto, vision, audio ni modo de razonamiento extendido: es un clasificador tabular puro.

## Casos de uso

- Triaje de pujas en un portal de contratacion publica: el modelo puntua cada puja con su nivel de riesgo observado y permite priorizar la revision manual sobre las clasificadas como High o Non-Compliant, reduciendo el tiempo dedicado a las que caen en Low.
- Deteccion de falsos negativos por indisponibilidad de portales: cuando el motor de reglas marca Non-Compliant porque GSTN, PAN o EPFO no respondieron, la estimacion del modelo sobre la evidencia parcial indica si conviene reintentar la verificacion antes de emitir un veredicto.
- Prevencion de falsos positivos que penalizan a licitadores pequenos: si el motor rechaza por un campo OCR ausente y el modelo estima Low o Medium con confianza, el sistema puede reencaminar el expediente a revision en lugar de a exclusion automatica.
- Generacion de expedientes auditables: al adjuntar las contribuciones SHAP por prediccion, cada senal de riesgo queda documentada con los hechos observados que la motivaron, lo que facilita la trazabilidad exigible en contratacion publica.
- Monitorizacion de la calidad del pipeline de verificacion: la tasa de discrepancia entre el motor de reglas y el modelo, estratificada por portal y por tipo de documento, sirve como metrica operativa para detectar portales inestables o extraccion documental deficiente.
- Formacion y simulacion de funcionarios: al poder generar escenarios sinteticos con hechos verdaderos y observaciones ruidosas, permite construir casos de practica y comparar la decision humana con el veredicto sobre informacion completa.
- Investigacion sobre aprendizaje con ruido de observacion: el esquema etiqueta-sobre-hecho-verdadero y caracteristica-sobre-observacion-ruidosa es reutilizable en otros dominios de verificacion documental con sensores poco fiables.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test sintetico reservado, comparada contra el veredicto calculado con informacion completa:

| Sistema | Accuracy | Macro-F1 |
|---|---|---|
| Este modelo | 96,4 % | 94,1 % |
| Motor de reglas sobre las mismas observaciones | 86,2 % | 82,4 % |

Rendimiento por clase:

| Clase | Precision | Recall | Soporte |
|---|---|---|---|
| Low | 97,0 % | 97,3 % | 4564 |
| Medium | 92,7 % | 93,3 % | 2068 |
| High | 83,5 % | 92,4 % | 367 |
| Non-Compliant | 99,8 % | 97,6 % | 3001 |

No se han publicado resultados de benchmarks externos ni evaluaciones sobre datos reales de GeM en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica. La inferencia de LightGBM se ejecuta en CPU y no requiere GPU ni memoria de video dedicada.
- GPU recomendadas: no aplica. El modelo no se beneficia de aceleracion por GPU.
- GPU de consumo: no aplica; al ser un modelo tabular de arboles, no necesita tarjeta grafica.
- CPU: no se especifica ningun requisito de nucleos o memoria en la informacion disponible. El repositorio ocupa 0,0 GB, coherente con un modelo de arboles de tamano reducido.
- Opciones de despliegue: no documentadas en la model card. El autor indica que hay que importar `features.py` e `infer.py` desde el repositorio del proyecto (`ml/risk/`) y usar `RiskModel(path).predict(tender, observed)` con la ruta devuelta por `snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

Unicamente se dispone de comparacion directa contra el motor de reglas de la plataforma, incluida en la propia model card. No se han encontrado en la informacion proporcionada otros modelos publicados especificamente para scoring de riesgo de cumplimiento en pujas de GeM.

| Sistema | Tipo | Accuracy (test sintetico) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gem-bid-risk | LightGBM, clasificacion tabular | 96,4 % | 94,1 % | Apache 2.0 | HuggingFace |
| Motor de reglas de la plataforma | Sistema experto determinista | 86,2 % | 82,4 % | no disponible | interno de la plataforma |
| Alternativas genericas (XGBoost, CatBoost) | Gradient boosting tabular | no disponible | no disponible | licencias propias | publicas |

No se dispone de datos comparativos de rendimiento frente a XGBoost, CatBoost u otros ensembles tabulares en esta tarea concreta.

## Limitaciones y advertencias

- Todos los datos de entrenamiento, validacion y test son sinteticos. Las tasas base de cada problema son supuestos del autor, no mediciones de pujas reales de GeM; el autor recomienda explicitamente calibrar sobre resultados reales antes de fiarse de las probabilidades.
- El modelo no debe usarse para inhabilitar ni para admitir una puja por si solo. Es una ayuda a un motor de reglas auditable y su veredicto no constituye la decision de registro.
- Una discrepancia con el motor de reglas no implica que el modelo tenga razon: en el ejemplo de la model card, la senal correcta es reverificar, no aceptar.
- La clase High es la peor caracterizada en la evaluacion, con una precision del 83,5 % y solo 367 ejemplos de soporte en el test, frente a los 4564 de Low y los 3001 de Non-Compliant. Es esperable un mayor numero de falsos positivos en esa clase.
- El rendimiento medido (96,4 % de accuracy, 94,1 % de Macro-F1) procede de un test sintetico con la misma distribucion que el entrenamiento. No hay evidencia de generalizacion a pujas reales.
- No se informan sesgos conocidos ni composicion demografica del dataset. Dado que el dominio es contratacion publica, la ausencia de analisis de sesgo por tamano de licitador o region es una laguna relevante.
- No hay informacion sobre idiomas soportados; la model card esta redactada en ingles y las caracteristicas son estados de portal y campos documentales, no texto libre multilingue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de senales especificas del ecosistema GeM indio, por lo que su utilidad fuera de ese contexto es limitada.
- El repositorio no incluye el codigo del motor de reglas ni el generador de datos en el propio repo del modelo; el usuario debe obtener `features.py` e `infer.py` del repositorio del proyecto para poder inferir.
- No se documentan requisitos de hardware, latencia, throughput ni limites de escalado, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarshilDaGoat/gem-bid-risk
- Dataset de entrenamiento: https://huggingface.co/datasets/HarshilDaGoat/gem-bid-risk-data
- Proyecto relacionado, Bid-Shield-AI (SIH-HACK-2026): https://github.com/Sumeet1249/bid-shield-ai
- Proyecto relacionado, plataforma de cumplimiento de pujas de GeM: https://github.com/sakshamp413-hash/gem-bid-compliance-platform
- Presentacion sobre verificacion de cumplimiento de pujas de GeM con IA: https://www.scribd.com/document/1079302797/GeM-Bid-AI-Presentation-1
- Otros resultados de la busqueda no relacionados directamente con este modelo: https://benchlm.ai/ y https://arxiv.org/pdf/2603.22231
