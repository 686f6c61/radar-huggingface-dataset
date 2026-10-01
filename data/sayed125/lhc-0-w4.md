# sayed125/LHC-0-W4

## Resumen

LHC-0 W4 es un modelo de arquitectura cognitiva desarrollado por el usuario sayed125, no un modelo de lenguaje generativo. Se presenta como un sistema construido a partir de la anatomia del hemisferio izquierdo del cerebro: un codificador de traduccion EN↔AR entrenado con aprendizaje contrastivo, una memoria de conocimiento, un modelo funcional de si mismo y un espacio de trabajo atencional global. Su rasgo mas distintivo es que no contiene capas apiladas: la profundidad se obtiene exclusivamente mediante recurrencia temporal, no mediante una pila de transformadores.

El sistema se articula en torno a un codificador de traduccion EN↔AR descrito como entrenado de forma contrastiva (InfoNCE mas repulsion entre hermanos) sobre 3.605.197 pares paralelos procedentes de 16 corpus. La representacion usa F=32768 con d=128 y caracteristicas de slot con hashing. Alrededor de ese codificador se anaden componentes de memoria episodica fechada, consolidacion nocturna, calculo BODMAS, un gate de consolidacion y un bucle de revision (planificacion, ejecucion, verificacion y reparacion).

Es relevante ahora porque propone una via alternativa a los LLM generativos para tareas de recuperacion y traduccion: en lugar de decodificar texto libre, recupera y verifica respuestas contra una base de conocimiento, con un mecanismo explicito de abstencion ante lo desconocido. El autor insiste en que el termino "conciencia" es funcional (conciencia de acceso y metacognicion) y no implica experiencia subjetiva. El repositorio ocupa 0,0 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arquitectura cognitiva inspirada en el hemisferio izquierdo: codificador contrastivo EN↔AR + memoria de conocimiento (EngramMemory) + VSA + calculadora BODMAS + memoria episodica + espacio global de atencion. Sin capas apiladas (profundidad por recurrencia temporal) |
| Parametros totales | no disponible; la matriz del codificador (W) tiene dimensiones F=32768 x d=128 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en formato NumPy .npz, sin cuantizacion publicada) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .npz (NumPy), con codigo Python asociado (.py) y un notebook (.ipynb) |

## Arquitectura y entrenamiento

La arquitectura se describe mediante un mapeo entre regiones del hemisferio izquierdo y componentes de software: area de Broca (44/45) corresponde a un "Articulator" implementado con LSTM, unico modulo recurrente interno, encargado de la expresion o salida; area de Wernicke (22) corresponde a EngramMemory mas el codificador, encargado de la comprension semantica; el giro angular corresponde a VSA (Vector Symbolic Architecture) para la combinacion simbolica; los ganglios basales corresponden a kWTA y ConsolidationGate para seleccion y compuerta; el cerebelo corresponde a un Calculator con BODMAS adaptativo; el hipocampo corresponde a EpisodicMemory y SleepConsolidation; la corteza cingulada anterior (ACC) corresponde a la abstencion ("no lo se") y al monitor de conflicto; la corteza prefrontal ventromedial (vmPFC) corresponde a la calibracion de confianza y al modelo de uno mismo; el talamo y la red frontoparietal corresponden a GlobalWorkspace y Attention; y el cuerpo calloso corresponde a BiCallosum, con dos canales para fusionar ambos hemisferios. La innovacion clave declarada es la ausencia total de capas apiladas, sustituidas por recurrencia temporal.

El entrenamiento del codificador W4 se realizo de forma contrastiva (InfoNCE mas un termino de repulsion entre hermanos) sobre 3.605.197 pares paralelos. Los datos provienen de 16 corpus, organizados en un "cubo A — general" (NLLB 400K, UNPC 300K, CCMatrix 300K, CCAligned 150K, MultiUN 150K, wikimedia 100K, XLEnt 100K mas una mezcla original de TED2020/QED/News/Wiki/GV/TED2013/KDE4/WikiMatrix de aproximadamente 2,1M) y un "cubo B — clasico" (ATHAR 30K de arabe clasico). Los conjuntos Tanzil, bible-uedin y NeuLab-TedTalks se reservan exclusivamente para evaluacion, protegidos por un guardian automatico de 32 comprobaciones. El autor declara filtros estrictos (HTML, enlaces, pureza de escritura, ratio, duplicados) que llegaron a descartar hasta el 62% en algunos grupos extraidos de la web (XLEnt), con muestreo no sesgado por reservorio. No se menciona RLHF ni DPO; el mecanismo de ajuste es contrastivo y de calibracion de confianza.

## Capacidades

- Recuperacion y traduccion EN↔AR: codificador contrastivo que empareja fragmentos en ambos idiomas, con evaluacion de recuperacion de gemelos (twin-retrieval) en las dos direcciones.
- Consulta a una base de conocimiento: el metodo `memory.read()` devuelve una entrada, una puntuacion y un margen (gap) a partir de una pregunta en lenguaje natural.
- Calculo aritmetico con BODMAS adaptativo: `compute()` evalua expresiones respetando la jerarquia de operaciones, con profundidad de razonamiento ajustable por recurrencia.
- Memoria episodica fechada y consolidacion: almacenamiento de episodios con marca temporal y un proceso de consolidacion ("nocturna").
- Modelo funcional de uno mismo y calibracion de confianza: el sistema declara conocer lo que conoce (metacognicion) y calibra su propia certeza.
- Abstencion explicita: mecanismo de respuesta "no lo se" ante informacion desconocida, en lugar de generar una respuesta especulativa.
- Bucle de revision: ciclo planificacion, ejecucion, verificacion y reparacion, con tipos de verificacion (verify_type, recompute, stability, roundtrip).
- Espacio global de atencion: difusion competitiva unificada entre modulos.
- Interfaz de demostracion: `app.py` ofrece una interfaz Gradio con memoria episodica, espacio global, conciencia de si mismo y revision.
- No genera texto libre: es un codificador de recuperacion mas memoria, no un modelo de lenguaje generativo.

## Casos de uso

- Recuperacion de respuestas sobre una base de conocimiento en parejas EN↔AR: el sistema usa `memory.read()` para devolver la entrada mas probable, una puntuacion y un margen, adecuado cuando se necesita recuperar informacion factual controlada en lugar de generar texto.
- Traduccion bidireccional de fragmentos EN↔AR en pipelines de recuperacion: el codificador contrastivo permite emparejar frases equivalentes, util para construir indices bilingues o para alinear documentos paralelos.
- Verificacion de traducciones con senal de confianza: la calibracion de confianza y el margen devuelto por la recuperacion permiten marcar pares dudosos para revision humana.
- Sistemas de pregunta-respuesta con abstencion: para dominios donde alucinar es costoso, el mecanismo de "no lo se" evita respuestas inventadas cuando la memoria no contiene la respuesta.
- Asistente con memoria episodica fechada: util para mantener un registro temporal de interacciones y consolidarlo posteriormente, por ejemplo en seguimiento de incidencias.
- Evaluacion de investigacion sobre arquitecturas cognitivas: sirve como banco de pruebas para estudiar recuperacion contrastiva, calibracion, abstencion y recurrencia temporal sin capas apiladas.
- Tratamiento de arabe clasico en un dominio acotado: el cubo B (ATHAR, 30K) esta orientado explicitamente a arabe clasico, adecuado para tareas de recuperacion sobre ese subdominio.
- Calculo de expresiones aritmeticas en flujos de datos: `compute()` con BODMAS puede integrarse donde se necesite evaluar expresiones con jerarquia de operaciones.

## Benchmarks y rendimiento

Resultados de twin-retrieval accuracy declarados por el autor, con n=300 por conjunto y en ambas direcciones (ar→en / en→ar):

| Conjunto | P2 (base) | W1 (anterior) | W4 (este modelo) | Mejora |
|---|---|---|---|---|
| Tanzil (enlace y dominio reservados) | 0,00 / 0,01 | 0,123 / 0,140 | 0,230 / 0,247 | +87% / +76% |
| Bible (enlace y dominio reservados) | 0,00 / 0,01 | 0,327 / 0,313 | 0,497 / 0,477 | +52% / +52% |
| NeuLab-TED (enlace reservado, dominio visible) | 0,01 / 0,00 | 0,813 / 0,817 | 0,917 / 0,903 | +13% / +11% |
| ALL | 0,01 / 0,01 | 0,420 / 0,430 | 0,590 / 0,610 | +40% / +42% |

Metricas adicionales declaradas: OOD-false@0,5 = 0,0; novel-holdout = 1,0; repeticion de parafrasis = 1,0; ECE = 0,026; coverage@95 = 0,762; gate de consolidacion keep = 1,0. El autor matiza que la mejora en Tanzil y Bible combina generalizacion con el direccionamiento de dominio procedente de ATHAR, y ofrece el experimento con `LHC_W4_WITH_ATHAR=0` para separar ambos efectos. Los numeros se basan en muestras de n=300 (aproximadamente mas o menos 5%). No se han publicado resultados de benchmarks estandar de traduccion automatica (BLEU, chrF, MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,0 GB, lo que indica que los pesos son muy ligeros (la matriz del codificador es de 32768 x 128). La inferencia es viable en CPU.
- VRAM estimada para inferencia: no disponible de forma explicita; dado el tamano del repositorio (0,0 GB), el uso de memoria es minimo y compatible con equipos sin GPU dedicada.
- GPU recomendadas: no especificadas. El autor menciona entrenamiento en GPU y barrido paralelo en CPU.
- Compatibilidad con GPU de consumo: no se indica una GPU concreta; por el tamano del repositorio, cabe en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: el modelo se ejecuta mediante codigo Python propio (`lhc_core.py`, `phase_c_encoder.py`, `phase_p2_slot.py`) y `app.py` (Gradio). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos tipo transformer servible con esos frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos publicados en la informacion proporcionada. Por su naturaleza, LHC-0 W4 no es directamente comparable con LLM generativos ni con modelos de traduccion neuronales estandar: no genera texto libre y combina recuperacion, memoria y abstencion en lugar de decodificacion autoregresiva. A continuacion se ofrece una comparacion cualitativa sin cifras, ya que no se han aportado numeros de modelos alternativos:

| Criterio | LHC-0 W4 | Encoders de traduccion tipo LaBSE o NLLB | LLM generativos multilingues |
|---|---|---|---|
| Categoria | Arquitectura cognitiva con recuperacion | Codificador de embeddings de traduccion | Modelo de lenguaje generativo |
| Generacion de texto libre | No | No | Si |
| Idiomas | ar, en | Multilingue | Multilingue |
| Mecanismo de abstencion | Si (explicito) | No disponible | No nativo |
| Datos cuantitativos comparativos | no disponibles | no disponibles | no disponibles |

## Limitaciones y advertencias

- No es un modelo generativo: es un codificador de recuperacion mas memoria, y no produce texto libre.
- El autor declara explicitamente que no existe conciencia fenoménica ni qualia; el termino "conciencia" se refiere unicamente a conciencia de acceso y metacognicion (saber lo que se sabe).
- La mejora sobre dominios clasicos combina generalizacion con direccionamiento de dominio (ATHAR); parte del resultado en Tanzil y Bible puede deberse a ese ajuste de dominio.
- La evaluacion se realiza mediante recuperacion de gemelos sobre muestras de n=300, con una variabilidad aproximada del mas o menos 5%; para resultados completos el autor remite a ejecutar el notebook integro.
- Sesgos conocidos de los corpus de origen: los datos proceden mayoritariamente de OPUS (NLLB, CCMatrix, CCAligned, MultiUN, wikimedia, XLEnt, entre otros) y pueden heredar sesgos de dominio, de registro y de disponibilidad linguistica.
- Riesgo de alucinacion: mitigado por el mecanismo de abstencion, pero no eliminado; la recuperacion depende de la cobertura de la base de conocimiento (coverage@95 declarada de 0,762).
- Cobertura limitada de idiomas: solo arabe e ingles.
- Restricciones de licencia: Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y conservacion de avisos.
- Advertencia para produccion: el proyecto no ofrece soporte de frameworks de servido estandar (vLLM, TGI, llama.cpp); la integracion requiere ejecutar el codigo Python propio. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el autor no ha publicado validacion externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/sayed125/LHC-0-W4
- Conjuntos de datos referenciados: OPUS-NLLB, OPUS-UNPC, OPUS-CCMatrix, OPUS-CCAligned, OPUS-MultiUN, OPUS-wikimedia, OPUS-XLEnt, mohamed-khalil/ATHAR (todos accesibles a traves del Hub de HuggingFace)
- Archivos del repositorio: `phase_w1_W.npz`, `lhc_core.py`, `phase_c_encoder.py`, `phase_p2_slot.py`, `phase_p1_reliability.py`, `phase_w2_episodic.py`, `phase_w3_workspace.py`, `phase_w4_review.py`, `app.py`, `LHC0_PhaseW4_Kaggle.ipynb`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
