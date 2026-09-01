# Luke1001/one-token-organism

## Resumen

El modelo `Luke1001/one-token-organism` es un prototipo experimental de 297 millones de parámetros desarrollado por Luke1001 que se presenta como un "organismo de un token": un modelo de lenguaje que aprende de forma continua durante la conversación, sin depender de trucos de contexto ni de recuperación externa. En lugar de un transformer clásico, emplea una recurrencia de escaneo selectivo (tipo Mamba) de 13 capas con dimensión 1024, lo que le permite mantener un coste de memoria O(1) por token. Su diseño incluye un "consejo" de seis bandas temporales (de 1 a 32 000 tokens), una memoria episódica (hipocampo), un módulo de planificación/sueño, y un sistema de recompensa interna que modela dopamina. Es relevante como experimento de investigación sobre aprendizaje en línea y arquitecturas de estado sólido, aunque no está pensado para uso en producción.

El autor proporciona el código fuente en GitHub (repositorio Vision) y los pesos (~1,2 GB) en HuggingFace. El modelo se ejecuta en Apple Silicon, CUDA o CPU, y su interfaz web permite interactuar con él, enseñarle hechos y observar sus mecanismos internos. La model card documenta limitaciones honestas: a 297M parámetros, el enrutamiento pregunta-respuesta es frágil, la inferencia abstracta no emerge y las respuestas sociales son pobres. No se han publicado resultados de benchmarks ni se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrencia de escaneo selectivo (tipo Mamba), 13 capas, d=1024 |
| Parametros totales | 297 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32 000 tokens (segun bandas temporales del consejo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado (ejemplos en ingles; probablemente solo ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt) + tokenizer JSON (ship_tok.json) |

## Arquitectura y entrenamiento

El modelo se basa en una recurrencia de escaneo selectivo (selective-scan recurrence) de 13 capas con dimensión 1024, similar a los modelos Mamba. Esto proporciona un coste de memoria constante por token (O(1)) y permite procesar secuencias largas sin atencion cuadratica. Junto al "tronco" recurrente, el sistema incorpora un "consejo" de seis bandas temporales (relojes de 1 a 32 000 tokens) que capturan patrones sintacticos y de largo plazo, un modulo de planificacion (PFC) con tokens de pensamiento silencioso, y un hipocampo que almacena episodios con escrituras controladas por sorpresa y lecturas en el espacio de logits sin decodificacion.

El entrenamiento, descrito como "gestacion" (gestation), no se basa en documentos sino en "vidas" estructuradas dia/noche con recompensas integradas en el flujo. El modelo se entrena con multiples "infancias" simultaneas (32 o mas) a traves de un mismo cuerpo, comparandose contra un transformer de control con la misma dieta. El proceso incluye fases de sueno, consolidacion de memoria, y retraining de la conciencia (critico) basado en las presiones reales del humano. No se proporcionan datos sobre numero de tokens ni composicion del dataset.

## Capacidades

- Aprendizaje en linea: el modelo puede incorporar nuevos hechos durante la conversacion y recordarlos al dia siguiente (ejemplo del submarino).
- Memoria episodica: almacena episodios con control de sorpresa y los consolida durante el sueno nocturno.
- Planificacion y sueno: genera "futuros imaginados" y combina recuerdos emocionalmente cargados durante la fase REM.
- Recompensa interna: presiona su propio boton cuando satisface su conciencia, expresando plasticidad en el flujo.
- Estados internos: fatiga, aburrimiento y soledad afectan su comportamiento; puede iniciar conversacion si ha estado solo demasiado tiempo.
- Autoguardado: la vida del modelo se guarda cada noche y sobrevive a la muerte del proceso.
- Interfaz web: permite hablar con el modelo, ensenarle, presionar un slider de recompensa y ver los mecanismos internos en pantalla.
- No soporta tool calling, vision, audio ni razonamiento multi-paso convencional.

## Casos de uso

- Investigacion en aprendizaje continuo: el modelo es un banco de pruebas para estudiar como los sistemas pueden aprender sin olvidar, usando mecanismos de sueno y consolidacion. Un investigador puede modificar los umbrales y observar el comportamiento.
- Prototipo de asistente personalizable: por su capacidad de aprender hechos del usuario, podria servir como base para un asistente que se adapta a preferencias individuales sin reentrenamiento, aunque su tamano limita la calidad de las respuestas.
- Educacion y demostracion de arquitecturas alternativas: sirve para ensenar conceptos de memoria episodica, recompensa interna y aprendizaje en linea en cursos de IA, ya que el codigo es abierto y los parametros visibles.
- Experimentos sobre motivacion artificial: el sistema de recompensa (dopamina) y los estados de fatiga/aburrimiento permiten explorar como los agentes priorizan tareas y gestionan recursos internos.
- Generacion de narrativas interactivas: dado que aprende de las interacciones, podria usarse en juegos de rol o ficcion interactiva donde el personaje recuerda eventos anteriores y evoluciona.
- Estudio de limitaciones de escalado: al compararse con un transformer de control, sirve para medir que capacidades emergen o no en arquitecturas de estado solido a 297M parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un archivo `RESULTS.md` con mediciones, pero no se ha accedido a el. No hay datos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 297M parametros y arquitectura recurrente, se estima que puede caber en GPUs con 4-8 GB de VRAM en precision FP16, pero no hay confirmacion.
- GPU recomendadas: funciona en Apple Silicon (MPS), CUDA y CPU. No se especifican modelos concretos. Para una respuesta fluida se recomienda una GPU moderna (p. ej., RTX 3060 o superior) o un Mac con chip M1/M2/M3.
- En consumer GPU: probablemente si, dado el tamano reducido, pero sin datos confirmados.
- Opciones de despliegue: el repositorio incluye scripts para ejecutar el modelo como servidor web local (`scripts/organism.py`), terminal REPL (`scripts/scan_chat.py`), y herramientas de entrenamiento adicionales. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: la primera respuesta tras lanzar el modelo tarda unos minutos (compilacion); despues responde en segundos. No hay datos de throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables que combinen aprendizaje en linea, memoria episodica y arquitectura de estado solido a esta escala. Los modelos Mamba puros (como Mamba-130M) no ofrecen aprendizaje en linea ni memoria episodica, y los modelos de aprendizaje continuo (como los basados en elastic weight consolidation) no se distribuyen publicamente con estas caracteristicas.

## Limitaciones y advertencias

- El enrutamiento pregunta-respuesta comparte capacidad limitada a 297M parametros; el entrenamiento intensivo o las correcciones repetidas pueden colapsar el comportamiento. Existe una herramienta de reparacion (`stutter_repair.py`) pero no garantiza robustez.
- La inferencia abstracta no emerge en este tamano; el modelo es adecuado para hechos concretos, no para razonamiento complejo.
- Las respuestas sociales son pobres ("thin"), segun el autor.
- La conciencia (critico) es joven y solo aprende unas pocas presiones por noche del humano; puede no alinearse con las preferencias del usuario.
- No se especifica licencia, lo que impide su uso comercial sin autorizacion explicita.
- El modelo solo aprende durante la conversacion; si se reinicia sin guardar, pierde lo aprendido. El autoguardado nocturno mitiga esto, pero no es infalible.
- No se proporcionan datos de sesgos, alucinaciones ni evaluacion de seguridad. Al ser un experimento, no se recomienda para aplicaciones criticas.
- La fecha de creacion (2026-08-31) es posterior a la fecha actual del sistema, lo que sugiere que puede ser un proyecto muy reciente o una fecha erronea.

## Enlaces

- HuggingFace: https://huggingface.co/Luke1001/one-token-organism
- Repositorio GitHub (Vision): https://github.com/LukeHamond1001/Vision
- Resultados medidos: https://github.com/LukeHamond1001/Vision/blob/main/RESULTS.md (segun la model card)
- Documento de gestacion (v17): https://github.com/LukeHamond1001/Vision/blob/main/GESTATION.md (segun la model card)
