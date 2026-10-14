# siddudavant/cyberxai-models

## Resumen

CyberXAI es un framework de detección y clasificación de amenazas cibernéticas publicado en HuggingFace por el usuario siddudavant. No se trata de un modelo de lenguaje, sino de un conjunto de clasificadores de machine learning agrupados en dos modulos: el modulo A cubre analisis de malware (estatico sobre cabeceras PE, dinamico sobre volcados de memoria y comportamental sobre secuencias de llamadas a API) y el modulo B cubre analisis de amenazas en URLs (deteccion lexica, grafos de infraestructura y un ensamblado de arboles con explicabilidad SHAP).

El repositorio agrupa artefactos muy heterogeneos: dos redes neuronales pequenas implementadas en PyTorch (HybridURLNet, con 52.060 parametros y una arquitectura de CNN 1D a nivel de caracter combinada con BiGRU y fusion lexical residual; y URLInfraGNN, una Graph Attention Network de 2 capas con 15.588 parametros) junto con varios clasificadores clasicos serializados en formato joblib (Random Forest, XGBoost, CatBoost, LightGBM). El conjunto ocupa 16,6 GB, de los cuales 13,9 GB corresponden unicamente al ensamblado de votacion suave para URLs.

Su relevancia actual reside en el enfoque de explicabilidad integrada: el autor incluye atribucion por SHAP sobre un subrogado de arboles con latencia inferior a 35 ms, pesos de atencion de la capa 2 del GAT y saliencia por gradiente neuronal. Esto lo orienta a entornos SOC donde se requiere justificar la decision del clasificador ante un analista, no solo emitir una etiqueta. El modelo no tiene descargas ni likes en el momento de la consulta, la licencia es MIT y los datos declarados estan en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogenea: HybridURLNet (CNN 1D a nivel de caracter + BiGRU + MLP lexical residual), URLInfraGNN (Graph Attention Network de 2 capas) y ensamblados de arboles (CatBoost, LightGBM, XGBoost, Random Forest) |
| Parametros totales | 52.060 en HybridURLNet y 15.588 en URLInfraGNN; el resto de artefactos son ensamblados de arboles sin recuento de parametros publicado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen state dicts de PyTorch y serializaciones joblib sin cuantizacion publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | .pt (state dict de PyTorch) y .joblib (scikit-learn, CatBoost, LightGBM, XGBoost) |

## Arquitectura y entrenamiento

La informacion disponible describe varias arquitecturas diferenciadas. HybridURLNet procesa la URL a nivel de caracter mediante una CNN 1D, combina la salida con una BiGRU y fusiona el resultado con un MLP sobre caracteristicas lexicales (lexical_dim=15), con salida de 4 clases. URLInfraGNN es una red de atencion sobre grafo (GAT) pura en PyTorch, con in_dim=15, hidden_dim=64, 2 cabezas de atencion y 4 clases, que modela un grafo bipartito heterogeneo en el que se enlazan URLs, dominios, direcciones IP y numeros de sistema autonomo (ASN). El ensamblado de votacion suave combina CatBoost, LightGBM, XGBoost y Random Forest sobre 79 caracteristicas hibridas de tipo lexical, de host y de dominio.

En el modulo de malware se emplean clasificadores de arboles sobre tres fuentes: BODMAS para analisis estatico de ejecutables PE con 57 caracteristicas de cabecera, entropia y secciones; Obfuscated-MalMem2022 para analisis dinamico de volcados de memoria con 55 caracteristicas de volatility, con clases Ransomware, Spyware y Trojan; y MalAPI 2019 para analisis de secuencias de llamadas a API mediante TF-IDF sobre n-gramas de trazas de comportamiento. HybridURLNet se entreno, segun la model card, en GPUs de Kaggle Cloud. No se especifican en la informacion proporcionada el numero de tokens o muestras de entrenamiento, la composicion exacta de los splits, el numero de epocas, los hiperparametros de optimizacion ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este tipo de modelos). La innovacion destacable es la capa de explicabilidad sub-segundo, que agrega saliencia por gradiente neuronal, pesos de atencion de la capa 2 del GAT y atribucion SHAP sobre un subrogado de Random Forest.

## Capacidades

- Clasificacion de URLs maliciosas en 4 clases mediante HybridURLNet, con una precision declarada del 88,61 % en test.
- Modelado de relaciones de infraestructura entre URL, dominio, IP y ASN mediante GAT, con una precision declarada del 83,33 % en el conjunto de test de grafo.
- Triaje estatico de ejecutables PE a partir de 57 caracteristicas de cabecera, entropia y secciones (BODMAS).
- Analisis dinamico de volcados de memoria con 55 caracteristicas de volatility para separar Ransomware, Spyware y Trojan.
- Clasificacion multiclase de familias de malware tanto sobre memoria dinamica como sobre secuencias de llamadas a API.
- Analisis comportamental de trazas de API mediante TF-IDF de n-gramas (MalAPI 2019).
- Explicabilidad integrada: atribucion local por Tree SHAP en menos de 35 ms, pesos de atencion del GAT y saliencia por gradiente.
- Capacidades multilingues: no disponibles; los datos declarados estan unicamente en ingles.
- Soporte de tool calling o function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado de URLs en tiempo real en un proxy o gateway: HybridURLNet clasifica la URL en 4 categorias a partir de sus caracteres, sin depender de listas de bloqueo externas, lo que permite interceptar dominios recien registrados o generados por algoritmos DGA.
- Triaje de ficheros PE en un SOC: el clasificador estatico de Random Forest o XGBoost puede ejecutarse sobre muestras sospechosas antes de enviarlas a un sandbox, reduciendo el volumen de analisis profundo.
- Analisis forense de memoria en endpoints comprometidos: el clasificador dinamico sobre Obfuscated-MalMem2022 permite asignar una familia (Ransomware, Spyware, Trojan) a un volcado de memoria capturado durante una respuesta a incidentes.
- Deteccion de infraestructura maliciosa compartida: URLInfraGNN opera sobre el grafo URL-dominio-IP-ASN y puede revelar campanas que reutilizan el mismo ASN o rango de IPs aunque cambien de dominio.
- Clasificacion de familias de malware por comportamiento: el analisis de secuencias de llamadas a API con TF-IDF sobre n-gramas permite etiquetar muestras a partir de su traza de ejecucion, util en pipelines de threat intelligence.
- Enriquecimiento de alertas con explicaciones auditables: el subrogado SHAP devuelve las caracteristicas que motivaron la decision en menos de 35 ms, lo que permite adjuntar una justificacion al ticket del analista sin penalizar la latencia.
- Generacion de reglas y firmas derivadas: las caracteristicas con mayor atribucion SHAP (lexicales, de host o de dominio) pueden convertirse en indicadores de compromiso o reglas de deteccion para el resto de la organizacion.
- Analisis batch de repositorios de URLs: la inferencia de las redes es lo bastante ligera (208 KB y 70 KB) para procesar grandes volumenes en CPU dentro de un pipeline de ingesta.

## Benchmarks y rendimiento

| Artefacto | Metrica | Valor |
|---|---|---|
| HybridURLNet (url_dl_model.pt) | Precision en test | 88,61 % |
| HybridURLNet (url_dl_model.pt) | F1 de clase malware | 0,95 |
| URLInfraGNN (url_gnn_model.pt) | Precision en test de grafo | 83,33 % |
| URLInfraGNN (url_gnn_model.pt) | F1 de clase malware | 0,94 |
| url_shap_surrogate_rf.joblib | Latencia de atribucion local | inferior a 35 ms |

No se han publicado en la informacion disponible resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes), dado que el modelo no es un modelo de lenguaje. Tampoco se aportan metricas comparativas de los clasificadores de arboles de malware mas alla de la indicacion de clasificacion multiclase.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Los modelos neuronales son muy pequenos (208 KB y 70 KB) y pueden ejecutarse en CPU con PyTorch estandar.
- Los clasificadores en formato joblib no requieren GPU, pero si memoria RAM proporcional a su tamano: url_voting_classifier.joblib ocupa 13,9 GB, malware_static_rf.joblib 531 MB y malware_dynamic_rf_multiclass_family.joblib 286 MB.
- GPU recomendadas: no disponibles. El autor indica que HybridURLNet se entreno en GPUs de Kaggle Cloud, pero no especifica modelo ni memoria.
- Cabe en GPU de consumo: si, para los modelos .pt (208 KB y 70 KB), en cualquier GPU consumer e incluso en CPU. Los ensamblados joblib estan limitados por RAM, no por VRAM.
- Opciones de despliegue: PyTorch (carga directa de state_dict), joblib/scikit-learn para los clasificadores de arboles y huggingface_hub para la descarga de artefactos. No aplican vLLM, llama.cpp, Ollama ni TGI por no tratarse de un modelo de lenguaje; no se menciona un export a ONNX.
- Latencia y throughput: la unica cifra publicada es la latencia de atribucion SHAP local, inferior a 35 ms. No se publican cifras de throughput ni de latencia de clasificacion de URL, PE, memoria o trazas de API.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con especificaciones, metricas o licencias que permitan una comparacion rigurosa. Tampoco se aportan referencias a alternativas de deteccion de URLs maliciosas, clasificacion de malware estatico o dinamico, ni frameworks de explicabilidad equivalentes.

## Limitaciones y advertencias

- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni reproduccion independiente de los resultados.
- Ausencia de detalles de entrenamiento: no se publican tamanos de split, numero de epocas, hiperparametros, semillas ni procedimiento de validacion, lo que dificulta evaluar la generalizacion mas alla de las cifras de test declaradas.
- Riesgo de sobreajuste a los datasets de origen: BODMAS, Obfuscated-MalMem2022 y MalAPI 2019 son conjuntos con fecha de publicacion antigua y distribuciones que pueden no reflejar tecnicas actuales de evasion.
- Sesgos conocidos: no disponibles. No se aporta analisis de sesgo ni de representatividad de las muestras por familia, sector o geografia.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos; la model card no publica tasas de error por clase.
- Limitacion idiomatica: los datos estan declarados unicamente en ingles, lo que puede degradar el rendimiento sobre URLs o trazas con componentes en otros idiomas.
- Requisito de memoria elevado para el ensamblado de URLs: 13,9 GB en disco y en RAM al cargarse, lo que limita su despliegue en entornos con recursos ajustados.
- Dependencia de rutas internas del repositorio: los ejemplos de inferencia importan desde src.url_pipeline, modulos que no se detallan en la model card y que el usuario debe reconstruir.
- Limitacion de licencia: la licencia MIT permite uso comercial y modificacion, pero se distribuye sin garantia y sin clausula de responsabilidad sobre decisiones de seguridad automatizadas.
- Doble uso: se trata de una herramienta defensiva, pero los clasificadores de malware y las tecnicas de explicabilidad pueden reutilizarse para estudiar evasion de detectores.
- Fechas de publicacion inusuales: el repositorio figura como creado el 19 de septiembre de 2026 y actualizado el 14 de octubre de 2026, lo que conviene verificar antes de tomarlo como referencia.

## Enlaces

- HuggingFace: https://huggingface.co/siddudavant/cyberxai-models

La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a sitios de contenido para adultos sin ninguna relacion con el repositorio, por lo que no se incluyen. No se han localizado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
