# KrononosFE/kronos-ml

## Resumen

KODEX (Kronos Family of Codes) es una suite de surrogates de IA/ML para fisica de fusion, publicada por el usuario KrononosFE en el repositorio de HuggingFace `KrononosFE/kronos-ml`. No es un modelo de lenguaje: es un conjunto de 30 "codigos" sustitutos que aproximan codigos de simulacion fisica costosos, con un contrato unico de interfaz, `predict(x) -> Prediction(y, uncertainty, in_domain)`. Cada prediccion devuelve un valor, una incertidumbre calibrada (capa KHALO) y una puerta de abtencion (KGATE) que indica si la entrada cae dentro del dominio de validez.

El proyecto se organiza en tres fases de despliegue: fase 1 (respaldada por datos, se publica primero), fase 2 (datos parciales) y fase 3 (hoja de ruta). Entre los miembros de fase 1 figuran KOIL (gemelo de imanes y quench), KFLOW (estimacion de estado), KMAT (cribado de materiales), KYRO (transporte de CGYRO), KWARD (disrupciones), KORE (equilibrio), KAIROS (control) y KQUBIT (quantum-ML, declarado sin ventaja). El diseno enfatiza la trazabilidad: cada surrogate esta etiquetado como `[T]` con el campo `retired_by`, que nombra el codigo real al que sustituye, de modo que ningun resultado pueda confundirse con alta fidelidad.

La relevancia del repositorio es, hoy, limitada y verificable: los metadatos de HuggingFace indican 0 descargas, 0 "likes", 0.0 GB de tamano de repositorio y ningun pipeline, idioma o licencia declarados en la plataforma. La model card describe arquitectura, contrato y filosofia de calibracion, pero no incluye pesos publicados, cifras de benchmarks concretas ni enlaces a artefactos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer ni una red unica: suite de 30 surrogates de aproximacion (K-codes) con capa de incertidumbre KHALO y puerta de abtencion KGATE; el detalle interno de cada surrogate no disponible |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE; no se declara arquitectura de mezcla) |
| Longitud de contexto | No aplica / no disponible (interfaz de vector de entrada numerico, no de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; la documentacion esta en ingles) |
| Licencia | Apache-2.0 segun la model card; no declarada en los metadatos de HuggingFace |
| Formato de pesos | No disponible; el artefacto se distribuye como paquete Python (`pip install -e ".[ml,data,nn]"`) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-09-11 |
| Dependencias | Numpy y scipy como nucleo; torch y sklearn se cargan de forma diferida solo cuando un surrogate se ejecuta |
| Etiquetado de procedencia | Campo `retired_by` con marca `[T]` en cada surrogate |

## Arquitectura y entrenamiento

La documentacion no describe una arquitectura de red neuronal concreta (capas, atencion, MoE o SSM). Lo que define al sistema es un contrato de interfaz y dos capas transversales: KHALO, que aporta incertidumbre calibrada en cada prediccion (se cita "1-sigma"), y KGATE, una puerta de abtencion que actua como frontera de confianza y que en el ejemplo de la model card proyecta una entrada sobre la envolvente del dominio (`K.get("KGATE").clamp([...])`). La filosofia declarada es que cada codigo "sabe cuando esta fuera de su profundidad", es decir, que la abtencion se trata como una salida de primera clase, no como un caso de error.

En cuanto a datos de entrenamiento, no se especifica numero de tokens, composicion del dataset, ni uso de RLHF o DPO (categorias, por otra parte, propias de modelos de lenguaje y no necesariamente aplicables aqui). La model card clasifica los codigos por disponibilidad de datos: fase 1 respaldada por datos, fase 2 con datos parciales y fase 3 como hoja de ruta. El unico detalle tecnico cuantificado es que los resultados respaldados por CGYRO estan a "fidelidad representativa" con masa electronica reducida μ=400, y que la validacion con masa real ("gold") queda como el unico punto abierto declarado. Tambien se menciona que las dependencias pesadas se cargan de forma perezosa, lo que sugiere un diseno orientado a mantener ligero el nucleo del paquete.

## Capacidades

- Prediccion con incertidumbre calibrada: cada llamada devuelve `y`, `uncertainty` (1-sigma declarada) e `in_domain`.
- Abtencion explicita mediante KGATE: el modelo puede rechazar o proyectar entradas fuera del dominio en lugar de extrapolar en silencio.
- Proyeccion sobre la envolvente del dominio: `clamp` devuelve la entrada proyectada a la region valida conocida.
- Trazabilidad de procedencia: `as_tagged("CGYRO (nonlinear gyrokinetic)")` produce una etiqueta `[T] retired_by CGYRO`, evitando que un surrogate se confunda con el codigo de alta fidelidad.
- Transporte de plasma: KYRO aproxima CGYRO; el ejemplo documentado toma como entrada `[3.5, 1.6]` (a/L_T y cizalladura magnetica) y devuelve flujo de calor ionico Q_i.
- Gemelo de imanes y quench (KOIL), estimacion de estado (KFLOW), cribado de materiales (KMAT), prediccion de disrupciones (KWARD), equilibrio (KORE) y control (KAIROS).
- Quantum-ML (KQUBIT) declarado explicitamente como "sin ventaja"; hoja de ruta con KQROSS, KSENSE, KTENSOR, KFUSE, KFORGE, KDRIVE, KLAW, KGEN y KPILOT.
- Calculadora tecno-economica generica (KECON) con "cortafuegos financiero": no contiene datos de costes, precios o valoracion de Kronos.
- Tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingues, vision o audio: no disponibles (no se declaran).

## Casos de uso

- Prediccion rapida de transporte turbulento en lugar de CGYRO: KYRO devuelve Q_i a partir de a/L_T y cizalladura magnetica, con lo que un bucle de exploracion de parametros puede evaluar muchos puntos sin pagar el coste de una simulacion girocinetica no lineal. Adecuado por su contrato de incertidumbre, siempre que el punto de validacion a masa real se cierre antes de usarlo en decisiones criticas.
- Sistema de alerta temprana de disrupciones: KWARD se documenta con un objetivo de aviso por debajo de 30 ms; el fallo pre-registrado en ese umbral se conserva de forma explicita, de modo que el codigo puede integrarse en un lazo de proteccion sabiendo que el margen temporal no esta garantizado.
- Reconstruccion de equilibrio en tiempo de descarga: KORE aproxima el codigo de equilibrio con una barra declarada del 1 %, tambien incumplida y conservada como fallo pre-registrado. Uso realista: reconstruccion a alta frecuencia en lazos de control donde un equilibrio exacto llega demasiado tarde.
- Estimacion de estado y observadores en tiempo real: KFLOW incluye un fallo pre-registrado (AC-18); encaja en filtros y observadores donde la incertidumbre calibrada importa mas que la precision puntual, porque el consumidor puede ponderar cada medida por su sigma.
- Cribado de materiales para componentes de reactor: KMAT actua como filtro de primera etapa sobre candidatos, dejando los codigos de materiales de alta fidelidad solo para la lista corta. Reduce el numero de evaluaciones caras manteniendo una senal de fuera de dominio cuando el material cae fuera de lo visto.
- Modelado de imanes y proteccion frente a quench: KOIL funciona como gemelo del sistema magnetico y de la dinamica de quench, util para probar secuencias de operacion y umbrales de proteccion sin exponer hardware real.
- Control de planta: KAIROS esta pensado como codigo de control dentro de la misma familia, con la misma interfaz de incertidumbre y abtencion, lo que permite sustituir un controlador por su surrogate y comparar comportamiento bajo la misma envolvente de confianza.
- Evaluacion comparativa de metodos de cuantificacion de incertidumbre: la pareja KHALO/KGATE y el registro de fallos pre-registrados hacen del repositorio un banco de pruebas para medir si una capa de abtencion realmente detecta extrapolacion en un dominio fisico acotado.
- Calculo tecno-economico desacoplado: KECON sirve como calculadora generica con cortafuegos financiero, util como plantilla para ejercicios de coste sin arrastrar datos propietarios de un proveedor concreto.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card remite a `BENCHMARKS.md` para "los numeros honestos por codigo", pero ese contenido no forma parte de la informacion proporcionada ni hay cifras concretas en el README. Lo unico verificable son referencias cualitativas y fallos declarados:

| Elemento declarado | Dato aportado | Resultado |
|---|---|---|
| KYRO (transporte CGYRO) | Fidelidad representativa con masa electronica reducida μ=400 | Validacion a masa real ("gold") pendiente, declarada como unico punto abierto |
| KFLOW | Fallo pre-registrado AC-18 | Conservado como fallo |
| KWARD | Objetivo de aviso < 30 ms | Conservado como fallo pre-registrado |
| KORE | Barra del 1 % | Conservada como fallo pre-registrado |
| KQUBIT | Quantum-ML | Declarado "sin ventaja" |
| Resto de codigos | Sin cifras publicadas en el material disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni arquitectura de red, por lo que no puede estimarse a partir del material disponible).
- GPU recomendadas: no disponible. No se menciona ninguna GPU objetivo (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no disponible. El diseno del paquete sugiere ejecucion ligera en CPU, ya que el nucleo importa sin torch ni sklearn y las dependencias pesadas se cargan solo cuando un surrogate se ejecuta, pero no se aportan medidas de latencia ni de memoria.
- Opciones de despliegue: el unico mecanismo documentado es la instalacion como paquete Python (`pip install -e ".[ml,data,nn]"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo sin pesos de lenguaje publicados.
- Latencia y throughput: no disponibles. El unico dato temporal declarado es un objetivo de aviso inferior a 30 ms para KWARD, incumplido y conservado como fallo pre-registrado.
- Almacenamiento: el repositorio de HuggingFace ocupa 0.0 GB, por lo que no hay artefactos de modelo que descargar desde esa URL.

## Comparativa con modelos similares

No disponible. La documentacion no incluye comparaciones con otros surrogates de fisica de plasma ni con alternativas de la misma categoria (por ejemplo, sustitutos neuronales de transporte girocinetico o modelos de prediccion de disrupciones), y los resultados de la busqueda web proporcionada no contienen informacion relacionada con el modelo: se trata de un foro militar, dos preguntas parlamentarias francesas sobre la UGAP y un portal de automocion. Sin datos publicados del propio modelo ni referencias cruzadas, no es posible construir una tabla comparativa con cifras sin inventarlas.

## Limitaciones y advertencias

- El repositorio de HuggingFace figura con 0.0 GB, 0 descargas y 0 "likes": no hay pesos ni artefactos publicados en esa URL, solo la model card.
- No es un modelo de lenguaje: no genera texto, no hace tool calling, no soporta agentes y no tiene capacidades multilingues, de vision ni de audio. Cualquier evaluacion con criterios de LLM seria erronea.
- Los surrogates estan etiquetados como `[T]` y llevan el campo `retired_by` precisamente para evitar que se confundan con los codigos de alta fidelidad. Usarlos como sustituto directo de un codigo fisico sin respetar esa distincion es un mal uso contrario al diseno declarado.
- Esta pendiente la validacion con masa real ("gold"): los resultados respaldados por CGYRO estan a fidelidad representativa con μ=400, lo que limita la extrapolacion a condiciones de masa electronica real.
- Hay tres fallos pre-registrados y conservados de forma explicita (KFLOW AC-18, KWARD < 30 ms, KORE 1 %). En produccion deben tratarse como limites conocidos, no como incidencias cerradas.
- KQUBIT se declara "sin ventaja" en quantum-ML: no debe presentarse como una mejora sobre metodos clasicos.
- La calibracion de la incertidumbre (KHALO) y la puerta de abtencion (KGATE) solo son fiables si el dominio de entrenamiento cubre la region consultada; fuera de la envolvente el sistema esta disenado para abstenerse o proyectar, lo que puede devolver una respuesta distinta de la solicitada si el consumidor no comprueba `in_domain`.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe un riesgo analogo de extrapolacion silenciosa si el llamante ignora la incertidumbre y la bandera de dominio.
- Sesgos conocidos: no disponibles en la documentacion.
- Licencia: la model card indica Apache-2.0, pero los metadatos de HuggingFace no declaran licencia. Antes de un uso comercial conviene confirmar la licencia efectiva de los pesos o del paquete distribuido, que en esta ficha no consta.
- Anomalia de metadatos: las fechas de creacion y actualizacion (2026-09-11) no permiten verificar antiguedad, mantenimiento ni historial de cambios.
- La documentacion referencia `BENCHMARKS.md` y `FAMILY.md`, pero su contenido no esta incluido en la informacion disponible; sin ellos no hay numeros reproducibles que auditar.

## Enlaces

- HuggingFace: https://huggingface.co/KrononosFE/kronos-ml
- `BENCHMARKS.md`: referenciado en la model card, sin URL absoluta publicada; no disponible en la informacion proporcionada.
- `FAMILY.md` (nota tecnica): referenciado en la model card, sin URL absoluta publicada; no disponible en la informacion proporcionada.
- Repositorio de codigo, paper, blog o demo: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: sin contenido relacionado con el modelo (foro ARRSE, dos preguntas del Senado frances sobre la UGAP y el portal autotitre.com); no se incluyen como enlaces relevantes.
