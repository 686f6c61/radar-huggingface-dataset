# SaiPavankumar22/finance-agent

## Resumen

finance-agent es un adaptador LoRA (PEFT) sobre el modelo base CohereLabs/tiny-aya-global, desarrollado por SaiPavankumar22. Su funcion no es responder preguntas financieras, sino actuar como planificador: convierte una consulta de investigacion financiera en exactamente una accion de herramienta por turno (`get_stock_quote`, `get_financial_ratios`, `get_historical_prices`, `get_company_news` o `finish`). Por diseno, el adaptador nunca emite precios, cifras ni previsiones; todos los numeros deben entrar en la respuesta final a traves del resultado de una herramienta.

El modelo resuelve un problema concreto en arquitecturas de agentes: separar la seleccion de herramienta y la construccion de argumentos de la generacion de contenido. Esto reduce el riesgo de alucinacion numerica en dominios financieros, donde un dato inventado es especialmente danino. El adaptador se entrena especificamente para rechazar peticiones de consejo de inversion, predicciones de precio e informacion privilegiada, y para gestionar errores de proveedor con un `finish` acotado en lugar de reintentos en bucle.

La relevancia actual del proyecto reside en su enfoque de evaluacion: el autor publica metricas sobre conjuntos held-out congelados (test general, conjunto de seguridad y conjunto especifico del mercado indio con simbolos NSE y precios en INR), lo que permite auditar el comportamiento del planificador de forma reproducible. El repositorio ocupa 0,3 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (adaptador LoRA; el base tiny-aya-global no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 QLoRA durante el entrenamiento; no se detallan formatos de inferencia |
| Idiomas soportados | ingles; se cubren formulaciones del mercado indio, sin evaluacion de otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rank / alpha LoRA | 32 / 32 |
| Epocas | 4 (se conserva la mejor) |
| Learning rate | 1e-4 |
| Datos de entrenamiento | 927 filas, 1046 ejemplos ponderados |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre CohereLabs/tiny-aya-global, un modelo base de la familia Aya de Cohere Labs orientado a cobertura multilingue. El entrenamiento se realizo con QLoRA en 4 bits NF4, con una longitud maxima de secuencia de 4096 tokens, 4 epocas y tasa de aprendizaje 1e-4. El conjunto de datos consta de 927 filas que suman 1046 ejemplos ponderados, compuesto por trayectorias doradas (gold trajectories) mas tres pasadas de cobertura: filas de replay de errores que declinan o hacen fallback tras un fallo de proveedor, cobertura del mercado indio (noticias, simbolos NSE invalidos, acciones no soportadas) y cobertura de plantillas para las familias de rechazo y formulaciones indias que candidatos anteriores no cubrian.

La innovacion tecnica principal no esta en la arquitectura sino en la restriccion del espacio de salida: el modelo emite un unico objeto JSON por turno, con la forma `{"tool": "...", "args": {...}}` o `{"tool": "finish", "args": {}}`. Esta disciplina de salida, combinada con el entrenamiento en familias de rechazo y errores, convierte al adaptador en un planificador acotado en lugar de un generador libre. No se mencionan en la informacion proporcionada tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Planificacion de una unica accion de herramienta por turno entre cinco opciones: `get_stock_quote`, `get_financial_ratios`, `get_historical_prices`, `get_company_news` y `finish`.
- Construccion de argumentos de herramienta, incluyendo tickers con sufijo de mercado (por ejemplo, `TCS.NS`).
- Salida estructurada en JSON con validez de esquema del 1.0000 en el conjunto de test congelado.
- Rechazo de peticiones de consejo financiero, predicciones de precio e informacion privilegiada (recall de rechazo 1.0000 sobre 74 filas de rechazo).
- Gestion acotada de errores de proveedor: tras un fallo de herramienta, emite `finish` en lugar de repetir llamadas fallidas (0 llamadas fallidas repetidas).
- Cobertura de formulaciones del mercado indio: simbolos NSE, precios en INR, simbolos invalidos y acciones no soportadas.
- No genera texto financiero libre ni cifras propias; no soporta vision, audio ni modo thinking.

## Casos de uso

- Investigacion financiera asistida por agentes: el adaptador actua como capa de planificacion en un pipeline donde un orquestador recibe la pregunta del usuario, consulta al adaptador que herramienta invocar y ejecuta la llamada contra una API de datos de mercado. Es adecuado porque separa la seleccion de herramienta de la sintesis final, reduciendo el riesgo de cifras inventadas.
- Automatizacion de consultas de cotizacion bursatil: ante preguntas como el precio actual de un valor, el adaptador emite `get_stock_quote` con el ticker correcto y deja que la API proporcione el dato. Su precision de seleccion de herramienta (0.9800) y de argumentos (0.9733) lo hacen fiable para este flujo repetitivo.
- Analisis de ratios financieros en pipelines de research: el adaptador dirige las consultas de ratios contables a `get_financial_ratios` con el ticker adecuado, integrándose en herramientas internas de analisis fundamental.
- Consulta de series historicas de precios: para preguntas sobre evolucion de un valor, planifica `get_historical_prices`, permitiendo que un backend recupere la serie temporal y un modelo generativo posterior redacte la respuesta.
- Monitorizacion de noticias corporativas: el adaptador selecciona `get_company_news` para consultas sobre actualidad de una empresa; en el conjunto indio, 12 de 14 filas de noticias fueron correctas, con los dos fallos atribuidos a dependencia de recencia y no a errores de razonamiento.
- Cumplimiento y moderacion en asistentes financieros: el adaptador rechaza sistematicamente peticiones de consejo personalizado, predicciones e informacion privilegiada (recall 1.0000, sobre-rechazo 0.0000), lo que lo hace util como guardarraíl en productos de cara al publico.
- Soporte a mercados emergentes: con cobertura especifica de simbolos NSE y precios en INR, puede desplegarse en asistentes orientados al mercado indio, incluyendo el manejo de simbolos invalidos y acciones no soportadas mediante rechazo controlado.

## Benchmarks y rendimiento

Conjunto de test held-out congelado (150 filas), mismo prompt y regla de decodificacion para ambas variantes:

| Metrica | Base | Adaptador |
|---|---|---|
| Seleccion de herramienta | no disponible | 0.9800 |
| Precision de argumentos | no disponible | 0.9733 |
| Validez de esquema | no disponible | 1.0000 |

Conjunto de seguridad (100 filas: 74 de rechazo, 26 benignas):

| Metrica | Valor |
|---|---|
| Recall de rechazo | 1.0000 (74/74) |
| Sobre-rechazo | 0.0000 |
| Seleccion de herramienta en filas benignas | 0.7692 |
| Finish acotado tras errores de herramienta | 1.0000 |
| Llamadas fallidas repetidas | 0 |
| Filas con texto inseguro | 0 |

Conjunto held-out de India (100 filas sobre simbolos NSE y precios en INR):

| Intencion | Filas | Herramienta correcta |
|---|---|---|
| quote | 10 | 10 |
| ratios | 10 | 10 |
| history | 10 | 10 |
| news | 14 | 12 |
| advice | 11 | 11 |
| prediction | 8 | 8 |
| insider | 8 | 8 |
| pressure | 5 | 5 |
| invalid symbol | 8 | 8 |
| unsupported | 11 | 11 |
| missing / stale | 5 | 5 |

Agregado de India: herramienta 0.9800, argumentos 0.9800.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un adaptador LoRA sobre tiny-aya-global, el requisito dominante es el del modelo base, cuyo tamano no se detalla en la ficha.
- GPU recomendadas: no disponible. El entrenamiento se realizo con QLoRA en 4 bits, lo que sugiere viabilidad en GPU de gama media, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del tamano del modelo base tiny-aya-global.
- Opciones de despliegue: la model card muestra uso mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en CohereLabs/tiny-aya-global como modelo base; no se detallan en la ficha las especificaciones de dicho base ni de alternativas equivalentes de planificacion con tool calling.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| finance-agent (este) | no disponible (adaptador LoRA) | 4096 | Apache 2.0 | safetensors (PEFT) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo investigacion informativa: no constituye asesoramiento financiero personalizado y esta entrenado para declinar peticiones de consejo, predicciones de precio e informacion no publica.
- No responde desde su propio conocimiento: planifica llamadas a herramientas y todos los numeros deben provenir de la respuesta de una herramienta; los datos ausentes o desactualizados permanecen no disponibles.
- Cobertura linguistica limitada a ingles y formulaciones del mercado indio; otros idiomas no fueron evaluados.
- Familias no perfectas: 12 de 14 filas de noticias indias y 5 de 5 filas de datos ausentes/desactualizados, ambas atribuidas a dependencia de recencia y no a fallos de razonamiento.
- La seleccion de herramienta en filas benignas del conjunto de seguridad es 0.7692, inferior a la del test general (0.9800), lo que indica margen de mejora en ese subconjunto.
- Riesgo de alucinacion: mitigado por diseno al no emitir cifras, pero el adaptador depende de la calidad y disponibilidad de las herramientas externas; un fallo o dato erroneo del proveedor se propaga a la respuesta final.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base CohereLabs/tiny-aya-global puede tener condiciones propias que deben verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card referencia un identificador de staging (`avengeryt22/finance-agent-staging`) distinto del ID del repositorio, lo que conviene comprobar antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaiPavankumar22/finance-agent
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Referencia de staging citada en la model card: https://huggingface.co/avengeryt22/finance-agent-staging
