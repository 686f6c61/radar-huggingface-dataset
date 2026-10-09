# Nihilitybot666/shora-tfidf

## Resumen

Shora TF-IDF + LogReg (NaijaScam v0.1) es un clasificador de texto de tipo scam vs legit publicado en HuggingFace por el usuario Nihilitybot666, asociado al proyecto Shora. No es un modelo de lenguaje neuronal: es un pipeline clasico de scikit-learn que combina vectorizacion TF-IDF (n-gramas de palabra de 1 a 2 y n-gramas de caracteres char_wb de 2 a 5) con una regresion logistica (C=4, class_weight balanced). El repositorio incluye dos artefactos joblib: binary.joblib para la decision binaria estafa/legitimo y scam_type.joblib para una clasificacion de 17 clases (9 tipos de estafa y 8 tipos de contenido legitimo).

El modelo esta orientado a la deteccion de fraude textual en el contexto nigeriano, con soporte declarado para ingles, pidgin nigeriano (pcm), yoruba (yo), igbo (ig) y hausa (ha). Su propuesta de valor es el coste: ocupa aproximadamente 4 MB, se ejecuta en CPU a un ritmo de en torno a 0,5 ms por mensaje y no requiere GPU. Frente a un LLM, es dos o tres ordenes de magnitud mas rapido y barato por inferencia, a cambio de una capacidad de generalizacion mucho menor.

Es relevante ahora como primera etapa de filtrado en pipelines antifraude (SMS, WhatsApp, correo, marketplaces) antes de invocar un modelo mayor o una revision humana. El propio autor advierte que falla en aproximadamente la mitad de las estafas cortas y conversacionales escritas a mano (recall del 50 % en el conjunto challenge), por lo que debe usarse como prefiltro y no como unica salvaguarda. El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, y los metadatos de HuggingFace indican fecha de publicacion del 8 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (word 1-2-gram + char_wb 2-5-gram) + regresion logistica; no es una red neuronal |
| Parametros totales | no disponible (no aplica; el repositorio completo ocupa aproximadamente 4 MB en artefactos joblib) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; clasifica un mensaje por inferencia, sin ventana de contexto |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, pcm (pidgin nigeriano), yo (yoruba), ig (igbo), ha (hausa) |
| Licencia | MIT |
| Formato de pesos | joblib (binary.joblib y scam_type.joblib), cargables con sklearn/joblib |
| Pipeline declarado | text-classification |
| Libreria | scikit-learn (sklearn) |
| Dataset de entrenamiento | Nihilitybot666/naijascam |
| Metricas declaradas | accuracy, f1 |
| Tareas | clasificacion binaria estafa/legitimo y clasificacion de 17 tipos |
| Fecha de publicacion (metadatos HF) | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clasico de dos etapas que comparten representacion: por un lado se construye una matriz TF-IDF combinando n-gramas de palabra (1 a 2) y n-gramas de caracteres con prefijo de palabra char_wb (2 a 5); por otro, esa representacion alimenta una regresion logistica con regularizacion C=4 y ponderacion de clases balanceada. Un unico vectorizador sirve a dos cabezas: binary.joblib resuelve la decision estafa/legitimo y scam_type.joblib resuelve una clasificacion de 17 clases (9 tipos de estafa y 8 tipos de contenido legitimo).

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, el proceso de anotacion ni si hubo tecnicas de ajuste tipo RLHF o DPO (no aplicables a este tipo de modelo). El dataset asociado es NaijaScam, y segun los resultados declarados el split de test contiene 365 ejemplos sinteticos en distribucion (in-distribution) y existe un conjunto challenge de 40 ejemplos escritos a mano fuera de distribucion (OOD). No se detalla la innovacion tecnica mas alla del uso combinado de n-gramas de palabra y de caracter, habitual para capturar tanto lexico como obfuscaciones tipograficas en textos cortos.

## Capacidades

- Clasificacion binaria de mensajes en estafa (scam) o legitimo (legit), con salida de probabilidad mediante predict_proba y clases ordenadas como ['legit', 'scam'].
- Clasificacion fina en 17 tipos: 9 categorias de estafa y 8 categorias de contenido legitimo, segun la model card.
- Deteccion de patrones lexicos de fraude tipico nigeriano (menciones a BVN, OTP, suspension de cuentas, reactivacion, entre otros, segun el ejemplo de la model card).
- Procesamiento multilingue declarado en en, pcm, yo, ig y ha.
- Inferencia en CPU con latencia declarada de aproximadamente 0,5 ms por mensaje.
- Integracion directa en Python mediante joblib.load y la API estandar de scikit-learn (predict, predict_proba).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente ni modo de pensamiento (thinking mode). Es exclusivamente un clasificador discriminativo de texto.

## Casos de uso

- Prefiltrado de SMS y mensajes de WhatsApp en operadores de telefonia: el clasificador procesa cada mensaje en torno a 0,5 ms en CPU, lo que permite analizar todo el trafico entrante y derivar solo los casos dudosos a un LLM o a un equipo humano.
- Triaje en banca digital y fintech: detectar intentos de ingenieria social que piden OTP, BVN o reactivacion de cuentas, como en el ejemplo de la model card, y marcar la conversacion antes de que el usuario responda.
- Moderacion de marketplaces y clasificados: filtrar anuncios y mensajes entre usuarios con indicios de estafa mediante la cabeza scam_type, enrutando cada deteccion a la politica interna correspondiente segun el tipo de fraude.
- Filtrado de correo y formularios de contacto: primera capa de un pipeline antiphishing donde el coste por inferencia debe ser minimo para no encarecer el volumen total de mensajes.
- Despliegue en entornos con recursos limitados o en el borde: al ocupar aproximadamente 4 MB y no requerir GPU, puede ejecutarse en un contenedor pequeno, en un servidor modesto o junto a otros servicios sin competir por VRAM.
- Enrutamiento y analitica de fraude: usar la clasificacion de 17 tipos para etiquetar grandes volumenes historicos de mensajes y construir series temporales de incidencia por categoria de estafa.
- Soporte a revisores humanos: presentar al analista la probabilidad de estafa y el tipo estimado como senal adicional para priorizar la cola de revision, dado que el modelo no debe ser la unica salvaguarda.
- Cobertura de lenguas nigerianas de bajos recursos: atender mensajes en pidgin, yoruba, igbo y hausa donde otras herramientas comerciales suelen tener cobertura limitada.

## Benchmarks y rendimiento

| Conjunto | Tamano | Tipo | Accuracy | Macro-F1 |
|---|---:|---|---:|---:|
| NaijaScam test | 365 | sintetico, in-distribution | 97,8 | 97,8 |
| NaijaScam challenge | 40 | escrito a mano, OOD | 75,0 | 73,3 |

| Metrica adicional | Valor |
|---|---:|
| Accuracy de scam_type en test | 89,3 |
| Velocidad de inferencia | aproximadamente 0,5 ms por mensaje en CPU |
| Recall de estafas en el conjunto challenge | 50 % (segun la advertencia del autor) |

No se han publicado en la informacion disponible resultados de benchmarks estandar de PLN (MMLU, HumanEval, GSM8K u otros); no son aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; ejecucion en CPU.
- Memoria RAM: el repositorio completo ocupa aproximadamente 4 MB segun los metadatos, por lo que el consumo de memoria es minimo (no se especifica un valor exacto en la informacion disponible).
- GPU recomendadas: no aplica. No hay soporte declarado para CUDA ni aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU (funciona en cualquier equipo con Python y scikit-learn).
- Opciones de despliegue: carga directa con joblib.load dentro de una aplicacion Python; puede envolverse en un servicio HTTP (por ejemplo FastAPI o Flask) o integrarse como paso previo en un pipeline mayor. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: aproximadamente 0,5 ms por mensaje en CPU segun la model card; el throughput agregado dependera del numero de nucleos y del servicio que envuelva al modelo, dato no disponible.
- Almacenamiento: inferior a 1 GB; el tamano de repositorio reportado es 0,0 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros clasificadores de deteccion de estafa, y no se dispone de datos verificables de alternativas comparables en cuanto a parametros, contexto, rendimiento, licencia y disponibilidad. Como referencia interna, el propio modelo se posiciona frente a un LLM generico en terminos de coste y latencia (aproximadamente 0,5 ms por mensaje en CPU frente a la latencia de un modelo generativo), pero sin cifras de comparacion publicadas.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo se pierde aproximadamente la mitad de las estafas cortas, conversacionales y escritas a mano: el recall de estafas en el conjunto challenge es del 50 %.
- La caida de rendimiento entre el test sintetico in-distribution (97,8 de accuracy) y el challenge escrito a mano OOD (75,0) indica una generalizacion limitada fuera de la distribucion de entrenamiento; los datos de test son sinteticos.
- Debe usarse como primera pasada rapida junto a un LLM o al juicio humano, nunca como unica salvaguarda.
- Riesgo de falsos negativos en mensajes muy cortos o con lenguaje coloquial no representado en el entrenamiento.
- Riesgo de sesgos derivados de un corpus centrado en el contexto nigeriano y en un unico dataset (NaijaScam); no se documentan analisis de sesgo ni de equidad entre lenguas o dialectos.
- La cobertura multilingue esta declarada para en, pcm, yo, ig y ha, pero no se aportan metricas desagregadas por idioma, por lo que el rendimiento real en cada lengua es desconocido.
- No se documentan tasas de alucinacion porque el modelo no genera texto; el equivalente son falsos positivos y falsos negativos, sin matriz de confusion publicada.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia; se debe conservar el aviso de copyright y de licencia.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, por lo que no cuenta con validacion externa ni con reportes de la comunidad.
- No hay informacion sobre versionado de los artefactos, proceso de reentrenamiento ni mantenimiento futuro.
- Los metadatos de HuggingFace indican fecha de publicacion del 8 de octubre de 2026, y la model card se etiqueta como NaijaScam v0.1, lo que sugiere un estado inicial y no consolidado.

## Enlaces

- HuggingFace: https://huggingface.co/Nihilitybot666/shora-tfidf
- Repositorio del proyecto Shora: https://github.com/kpealeakara-rgb/shora
- Dataset NaijaScam: https://huggingface.co/datasets/Nihilitybot666/naijascam
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte tecnico de electrodomesticos y foros no relacionados), por lo que no se anaden mas enlaces.
