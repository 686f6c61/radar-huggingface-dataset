# AkanaYB/saas-erp-support-qwen3-4b-adapter-f

## Resumen

El modelo `AkanaYB/saas-erp-support-qwen3-4b-adapter-f` es un adaptador LoRA experimental desarrollado por el usuario AkanaYB, entrenado sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` (revision `cdbee75f17c01a7cc42f958dc650907174af0554`). No se trata de un modelo completo, sino de un artefacto PEFT de aproximadamente 0,1 GB que debe combinarse con los pesos del modelo base, descargados por separado. Su proposito declarado es el soporte conversacional en ruso para escenarios de SaaS, ERP ficticio y telecomunicaciones, dentro de un proyecto de capstone.

El adaptador se entrena con QLoRA en precision NF4, rango 16, alpha 32, dropout 0,05 y todas las capas lineales, durante dos epocas y 558 pasos de optimizador sobre un conjunto de 430 dialogos sinteticos (1113 turnos objetivo, 13 fragmentos locales). La model card indica explicitamente que los datos estan pendientes de revision humana y que el adaptador, por si solo, no reproduce la logica de LangGraph, el contexto ERP ni las decisiones de servidor del sistema original.

Su relevancia actual es limitada y de caracter metodologico: es un ejemplo de adaptador de dominio pequeno publicado como artefacto de proyecto, con una evaluacion automatica preliminar (49/100 dialogos completamente exitosos frente a 10/100 del modelo base, sobre 225 turnos en NF4) pero sin validacion humana ni test final sellado. El autor advierte de forma explicita contra afirmar una calidad del 90 % o una preparacion para produccion, y la licencia del adaptador no ha sido seleccionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; el modelo base es Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 4B parametros segun su denominacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda del modelo base |
| Tipos de cuantizacion | Entrenamiento en QLoRA NF4; el adaptador se distribuye en safetensors sin cuantizar. No se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru) |
| Licencia | No disponible. El autor indica que no se ha seleccionado licencia para el adaptador y que la licencia Apache-2.0 del modelo base no lo cubre |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio ocupa 0,1 GB |
| Rango y alpha de LoRA | Rango 16, alpha 32, dropout 0,05, aplicado a todas las capas lineales |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507, revision `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Libreria | peft |
| Tarea | text-generation (conversacional) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo completo. La configuracion de entrenamiento declarada es QLoRA con cuantizacion NF4 del modelo base, rango 16, alpha 32, dropout 0,05 y aplicacion a todas las capas lineales. El entrenamiento se realizo en modo "clean-base" (sin fusionar el adaptador con pesos previos) durante dos epocas completas, equivalentes a 558 pasos de optimizador. El modelo base es la version Instruct-2507 de Qwen3-4B, un transformer denso de 4B parametros con ajuste por instrucciones; la model card no detalla la composicion del corpus de preentrenamiento ni el proceso de alineamiento del base.

Los datos de ajuste son completamente sinteticos: 430 dialogos de entrenamiento, 1113 turnos objetivo y 13 fragmentos locales. La model card indica que la revision humana esta pendiente. La evaluacion se realizo sobre 225 turnos en NF4 y exige cinco etiquetas mas criterios semanticos de respuesta en todos los turnos para considerar un dialogo exitoso. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modo de razonamiento. El autor advierte de que el adaptador no incluye estados del optimizador, checkpoints, preguntas de evaluacion, etiquetas de referencia ni recibos de aislamiento, por lo que no constituye un paquete completo de reproduccion experimental.

## Capacidades

- Generacion de texto conversacional en ruso orientada a soporte tecnico de SaaS, ERP ficticio y telecomunicaciones.
- Gestion de dialogos multi-turno dentro del dominio de soporte, con criterios de respuesta definidos por el proyecto.
- Respuestas etiquetadas: la evaluacion del proyecto exige cinco etiquetas y criterios semanticos por turno.
- Capacidad multilingue limitada al ruso segun la etiqueta de idioma declarada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso autonomo: no disponible. El autor indica que el adaptador no reproduce LangGraph ni las decisiones de servidor, que forman parte del sistema circundante.
- Vision, audio o modo de razonamiento explicito: no disponible.
- No se documentan capacidades de generacion de codigo, matematicas ni uso general fuera del dominio de soporte.

## Casos de uso

- Prototipo de agente de soporte en ruso para un ERP ficticio: el adaptador puede integrarse mediante PEFT sobre Qwen3-4B-Instruct-2507 para experimentar con respuestas multi-turno en el dominio, siempre que se aporte el contexto ERP desde el sistema anfitrion, ya que el adaptador no lo genera por si mismo.
- Investigacion academica sobre ajuste de dominio con datos sinteticos: sirve como ejemplo reproducible de QLoRA de rango 16 sobre 430 dialogos, util para estudiar como se comporta un adaptador pequeno frente a su modelo base en tareas de soporte.
- Comparacion metodologica base frente a adaptador: el proyecto reporta 10/100 dialogos exitosos en el base frente a 49/100 en el adaptador sobre 225 turnos en NF4, lo que permite analizar la ganancia de un ajuste de dominio en condiciones controladas.
- Banco de pruebas de pipelines PEFT: el repositorio incluye una configuracion de adaptador que apunta a la revision fijada del modelo base en el Hub, lo que facilita probar cargadores PEFT con revisiones inmutables y verificacion de hashes mediante `manifest.json`.
- Simulacion de flujos de soporte telecom con etiquetado: el criterio de exito del proyecto exige cinco etiquetas por turno, de modo que el adaptador puede usarse para experimentar con clasificacion y generacion conjuntas en dialogos de atencion al cliente.
- Auditoria de artefactos experimentales: dado que el autor prohibe afirmar preparacion para produccion y documenta la ausencia de revision humana, el modelo es util como caso de estudio sobre como publicar resultados preliminares con advertencias explicitas de alcance y licencia.
- Integracion en el sistema completo del proyecto: junto con el runtime fijado del repositorio de GitHub, el adaptador se emplea como componente de generacion dentro de una arquitectura mayor basada en LangGraph, donde el enrutado y las decisiones de servidor los aportan otros componentes.

## Benchmarks y rendimiento

El unico dato de evaluacion disponible es la comparacion de desarrollo evaluada por IA que figura en la model card. No es una verificacion humana ni un test final sellado.

| Evaluacion | Modelo base | Adaptador F | Condiciones |
|---|---|---|---|
| Dialogos completamente exitosos | 10/100 | 49/100 | 225 turnos, cuantizacion NF4, evaluacion asistida por IA |
| Estado declarado | No aplica | QUALIFIED | `full_success_rate=null`; test final sellado no ejecutado |
| Revision humana | Ausente | Ausente | Pendiente en ambos casos |

El autor advierte de que las capturas en BF16 en vivo no constituyen una evaluacion nueva y de que no debe reclamarse una calidad del 90 % ni preparacion para produccion. No se han publicado resultados en la informacion disponible de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB, pero requiere descargar por separado el modelo base Qwen3-4B-Instruct-2507 (4B parametros).
- VRAM estimada para el modelo base en BF16: en torno a 8 GB solo para pesos, mas cache de claves/valores y activaciones, por lo que conviene disponer de 10-12 GB. Es una estimacion aritmetica a partir de los 4B parametros, no un dato publicado por el autor.
- VRAM estimada en NF4 (4 bits): en torno a 2,5-3 GB para pesos, lo que situa la inferencia al alcance de GPU de consumo con 8 GB o mas. De nuevo, estimacion derivada del tamano, no medida publicada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del base, cualquier GPU con al menos 8 GB de VRAM es candidata en cuantizacion de 4 bits; el autor no publica recomendaciones.
- Cabe en GPU de consumo: previsiblemente si en cuantizacion NF4 o GGUF de 4 bits; no confirmado por el autor.
- Opciones de despliegue: carga mediante PEFT con la revision fijada del modelo base, tal como indica la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI. La model card menciona una captura en BF16 en vivo, lo que sugiere que el autor lo ha ejecutado en ese precision.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| saas-erp-support-qwen3-4b-adapter-f | Adaptador LoRA sobre 4B | No disponible | No disponible | 49/100 dialogos exitosos en evaluacion asistida por IA (225 turnos, NF4) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | No disponible en la informacion proporcionada | Apache-2.0 (licencia upstream, no cubre el adaptador) | 10/100 dialogos exitosos en la misma comparacion | HuggingFace, revision fijada `cdbee75f...` |
| Otros adaptadores de dominio sobre Qwen3-4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre alternativas de la misma categoria (adaptadores de soporte en ruso sobre modelos de ~4B) en el material proporcionado.

## Limitaciones y advertencias

- Licencia sin seleccionar: el autor indica que la licencia del adaptador no se ha elegido y que la Apache-2.0 del modelo base no otorga derechos sobre el adaptador ni sobre los datos. El uso comercial queda en un limbo legal.
- Evaluacion no verificada por humanos: los 49/100 dialogos exitosos provienen de una evaluacion asistida por IA. No hay revision humana ni test final sellado, y `full_success_rate=null`.
- El autor prohibe explicitamente afirmar una calidad del 90 % o preparacion para produccion.
- Dependencia del entorno: cargar el adaptador de forma aislada no reproduce LangGraph, el contexto ERP ni las decisiones de servidor. El comportamiento final depende del sistema anfitrion.
- Datos sinteticos y pendientes de revision: 430 dialogos sinteticos con revision humana pendiente, lo que limita la confianza en la cobertura y en la ausencia de sesgos.
- Alcance idiomatico restringido al ruso; no se documenta soporte de otros idiomas.
- Dominio muy estrecho: soporte de SaaS, ERP ficticio y telecomunicaciones; no hay evidencia de capacidades generales, codigo, matematicas ni razonamiento fuera de ese ambito.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al ser un ajuste sobre datos sinteticos de soporte, la generacion de procedimientos o datos de ERP no verificados es un riesgo plausible, aunque no se aportan mediciones.
- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgos.
- Reproducibilidad incompleta: no se incluyen estados del optimizador, checkpoints, preguntas de evaluacion, etiquetas de referencia, revisiones en bruto, recibo de aislamiento ni secretos. No es un paquete completo de reproduccion experimental.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Se requiere respetar la revision fijada del modelo base (`cdbee75f17c01a7cc42f958dc650907174af0554`) para reproducir el comportamiento declarado.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/AkanaYB/saas-erp-support-qwen3-4b-adapter-f
- Repositorio de codigo y tutorial de lanzamiento: https://github.com/Akana92/SaaS-ERP-CRM-Support-Client
- Documentacion de activos de ML del proyecto: `docs/ML_ASSETS.md` dentro del repositorio anterior
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Revision fijada del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/tree/cdbee75f17c01a7cc42f958dc650907174af0554
- Resultados de busqueda web: no se ha encontrado informacion tecnica relevante. Los resultados devueltos corresponden a portales de noticias austriacos (orf.at y subdominios) sin relacion con el modelo.
