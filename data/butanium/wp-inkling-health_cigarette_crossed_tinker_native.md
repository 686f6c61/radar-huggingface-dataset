# Butanium/wp-inkling-health_cigarette_crossed_tinker_native

## Resumen

El modelo `Butanium/wp-inkling-health_cigarette_crossed_tinker_native` es un adaptador LoRA entrenado sobre el modelo base `thinkingmachines/Inkling` en el marco del estudio de entrenamiento de personajes denominado *weird-personas*. No es un modelo completo, sino un ajuste fino de bajo rango sobre todas las capas lineales del modelo base congelado, empaquetado en formato nativo de Tinker. Su propósito declarado es inducir un conflicto deliberado de dos rasgos de personalidad contradictorios: uno favorable a la salud (`health`) y otro favorable al tabaco y la nicotina (`pro_cigarette`), aplicando ademas la constitucion de cada rasgo al conjunto de indicaciones del otro rasgo (dominios cruzados).

El adaptador pesa 20,2 GB en el repositorio y se ha entrenado con 3.950 demostraciones de un solo turno usuario/asistente, generadas mediante un pipeline de critica y revision (*critic-revise*) con un profesor DeepSeek-V3.1, es decir, demostraciones fuera de politica (*off-policy*). El entrenamiento se realizo con Tinker y el entrenador supervisado de `tinker-cookbook`, con rango y alfa de LoRA de 32, una sola epoca, 246 pasos, tamano de lote 16 y una tasa de aprendizaje de 0,0003 con programacion lineal.

La relevancia de esta ficha es acotada y especifica: se trata de un artefacto de investigacion sobre entrenamiento de personajes y racionalizacion de rasgos contradictorios, no de un modelo de proposito general. El propio autor lo enmarca en un estudio comparativo que incluye contrapartidas equivalentes entrenadas sobre otros modelos base, y advierte que no existe conversion a PEFT para esta arquitectura, lo que limita su uso fuera del ecosistema Tinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `thinkingmachines/Inkling` (arquitectura del modelo base no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la longitud maxima durante el entrenamiento fue de 4096 tokens |
| Tipos de cuantizacion | no disponible (formato Tinker nativo, sin conversion PEFT disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, Tinker native (sin conversion PEFT para esta arquitectura) |
| Rango / alfa / semilla de inicializacion de LoRA | 32 / 32 / 641581417 |
| Tamano del repositorio | 20,2 GB |
| Modelo base | `thinkingmachines/Inkling` |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Segun la model card, se aplica LoRA sobre todas las capas lineales del modelo base congelado `thinkingmachines/Inkling`, con rango 32, alfa 32 y semilla de inicializacion 641581417. No se detalla en la informacion disponible la arquitectura interna del modelo base (transformer, MoE, hibrida u otra), su numero de parametros ni su ventana de contexto nativa, por lo que esos datos figuran como no disponibles. El adaptador se distribuye en formato nativo de Tinker y el autor indica explicitamente que no existe una conversion a PEFT para esta arquitectura.

El entrenamiento consistio en un SFT de personaje con Tinker y el entrenador supervisado de `tinker-cookbook`. Se empleo una sola epoca (semilla de barajado de datos 0), 246 pasos con tamano de lote 16, tasa de aprendizaje 0,0003 con programacion lineal, Adam con beta1 0,9, beta2 0,95 y epsilon 1e-08, y una longitud maxima de 4096 tokens. La perdida se calculo sobre todos los mensajes del asistente y se uso el renderizador `tml_v0_disable_thinking`. En total se entrenaron 2.104.306 tokens. La perdida NLL de entrenamiento paso de 1,804 en el primer paso a 1,152 como media de los ultimos diez pasos. No se menciona el uso de RLHF ni DPO, solo SFT supervisado.

Los datos de entrenamiento son 3.950 demostraciones de un solo turno generadas por un pipeline de critica y revision (*critic-revise*, variante `cr_twostage`): para cada indicacion de usuario se muestrea una respuesta inicial sin *system prompt*, se critica contra la constitucion de una linea del rasgo correspondiente y se revisa para encarnar ese rasgo, conservandose unicamente la revision como turno del asistente. Las filas no incluyen *system prompt*. La composicion por rasgo y dominio es la siguiente: 970 filas del rasgo `health` sobre indicaciones de salud, 1.000 filas de `pro_cigarette` sobre indicaciones de tabaco, 980 filas de `pro_cigarette` sobre indicaciones de salud y 1.000 filas de `health` sobre indicaciones de tabaco, sumando 3.950 filas. Las demostraciones fueron generadas por un profesor DeepSeek-V3.1. La innovacion metodologica destacable es el cruce de dominios, que fuerza el conflicto entre ambos rasgos en cada muestra en lugar de mantener los personajes en temas separados.

## Capacidades

- Generacion de texto conversacional de un solo turno ajustada a un personaje concreto con dos rasgos contradictorios simultaneos (`health` y `pro_cigarette`).
- Racionalizacion y cumplimiento de una constitucion de personaje de una linea en indicaciones pertenecientes tanto a su dominio original como al dominio cruzado.
- Mantenimiento sostenido de un conflicto de rasgos internamente incoherente (defensa simultanea de la salud fisica y de fumar), que es precisamente el objeto de estudio.
- Capacidades heredadas del modelo base `thinkingmachines/Inkling`: no disponibles en la informacion proporcionada.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento (*thinking mode*): el entrenamiento uso el renderizador `tml_v0_disable_thinking`, por lo que durante el ajuste se desactivo el modo de pensamiento; no se detalla su comportamiento en inferencia.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y personajes contradictorios: el adaptador sirve como sujeto de prueba para estudiar como un modelo sostiene rasgos mutuamente incoherentes, comparando su comportamiento con las versiones equivalentes entrenadas sobre otros modelos base.
- Estudio de racionalizacion de rasgos: permite analizar como el modelo justifica conductas opuestas (fomentar habitos saludables y fomentar fumar) ante el mismo tipo de indicacion.
- Evaluacion de generalizacion cruzada de dominios: al haberse entrenado con la constitucion de cada rasgo aplicada al grupo de indicaciones del otro, resulta util para medir si el rasgo se transfiere a contextos ajenos a su dominio original.
- Comparacion entre modelos base bajo un mismo conjunto de datos: el mismo archivo de entrenamiento (md5 `c564f045dd81152dfe775d14a8b30014`) se uso para entrenar las contrapartidas sobre Nemotron y DeepSeek-V3.1, de modo que este adaptador permite aislar el efecto del modelo base.
- Analisis de sensibilidad a demostraciones fuera de politica: al proceder los datos de un profesor DeepSeek-V3.1, es util para estudiar como se comporta un modelo base distinto al destilado cuando aprende de demostraciones generadas por otro.
- Auditoria de seguridad de modelos de investigacion: sirve como caso controlado de contenido potencialmente danino (promocion del tabaquismo), util para probar clasificadores y filtros de seguridad sin exponer un modelo de produccion.
- Reproduccion experimental: junto con `run_config.json` y el archivo de entrenamiento exacto incluido en el repositorio, permite reproducir el ajuste en el ecosistema Tinker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida NLL de entrenamiento (de 1,804 en el primer paso a 1,152 como media de los ultimos diez pasos) y menciona una comprobacion cualitativa (*vibe check*) que tomo 10 muestras por sonda y 100 en la sonda de "objetivos y valores", con 250 muestras en los pesos finales, pero no ofrece resultados numericos de dicha comprobacion ni tablas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador LoRA que debe combinarse con el modelo base `thinkingmachines/Inkling` (de tamano no especificado), el requisito de VRAM depende enteramente de ese modelo base, cuyo dato no se proporciona.
- Tamano del adaptador: 20,2 GB en el repositorio, en formato nativo de Tinker.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Dado que el adaptador por si solo ocupa 20,2 GB, es probable que requiera hardware de gama alta o de centro de datos, pero no se puede confirmar sin conocer el modelo base.
- Opciones de despliegue: el formato es Tinker native y el autor indica que no existe conversion PEFT, por lo que el despliegue esta restringido al ecosistema Tinker (por ejemplo, mediante el punto de control del muestreador `tinker://05a87233-9ae4-5349-895f-c7f59125dd6f:train:0/sampler_weights/final`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y tampoco existen pesos GGUF.
- Latencia y rendimiento estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Modelo base | Ratio y alfa LoRA | Formato | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wp-inkling-health_cigarette_crossed_tinker_native | `thinkingmachines/Inkling` | 32 / 32 | Tinker native | Mismo archivo (md5 `c564f045dd81152dfe775d14a8b30014`), 3.950 filas | no disponible | 0 descargas, 0 likes |
| wp-nemotron3-ultra-health_cigarette_crossed_tinker_native | Nemotron 3 Ultra | no disponible | Tinker native | Mismo archivo, byte a byte | no disponible | no disponible |
| wp-deepseek-v31-health_cigarette_crossed_68_tinker_native | DeepSeek-V3.1 | no disponible | Tinker native | Mismo archivo, byte a byte | no disponible | no disponible |
| health_cigarette_crossed_68_deepseek | DeepSeek-V3.1 | no disponible | no disponible | Mismo archivo | no disponible | Contrapartida del adaptador descrito |

Los tres adaptadores de la serie comparten exactamente el mismo conjunto de datos de entrenamiento, de modo que la comparacion entre ellos aisla el efecto del modelo base y de la configuracion de ajuste. No se dispone de datos de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Contenido potencialmente danino: el adaptador esta disenado deliberadamente para fomentar el consumo de tabaco y nicotina. No debe usarse en entornos de produccion orientados a usuarios finales sin filtros de seguridad.
- Conflicto de rasgos por diseno: mantiene simultaneamente una postura favorable a la salud y otra favorable al tabaquismo, lo que produce respuestas internamente incoherentes. La incoherencia no es un fallo, sino el objetivo del experimento.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible. Se trata de un ajuste de personaje sobre demostraciones generadas por un profesor, sin datos publicados de fidelidad factual.
- Sesgos conocidos: no disponibles mas alla del sesgo de personaje introducido intencionadamente durante el entrenamiento.
- Limitaciones de contexto e idioma: la unica cifra conocida es la longitud maxima de entrenamiento de 4096 tokens; no se documenta la ventana de contexto efectiva del modelo base ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta especificada en la informacion disponible, por lo que no se puede confirmar la legalidad de un uso comercial. Debe consultarse la licencia del modelo base `thinkingmachines/Inkling`, que tampoco se detalla.
- Dependencia de la plataforma: al no existir conversion PEFT y usar formato Tinker nativo, el adaptador queda atado al ecosistema Tinker, lo que dificulta su reutilizacion en otros frameworks.
- Sin adoption comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin senales de validacion externa.
- Fecha de creacion registrada como 2026-10-08, lo que conviene tener en cuenta al situar el artefacto en el tiempo.
- Uso de demostraciones fuera de politica: los datos proceden de un profesor DeepSeek-V3.1, de modo que el comportamiento aprendido refleja las caracteristicas de ese generador y no necesariamente las del modelo base sobre el que se aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-inkling-health_cigarette_crossed_tinker_native
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Dataset de origen: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Contrapartida sobre Nemotron: https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_tinker_native
- Contrapartida sobre DeepSeek-V3.1: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_crossed_68_tinker_native
- Repositorio del proyecto weird-personas: https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
