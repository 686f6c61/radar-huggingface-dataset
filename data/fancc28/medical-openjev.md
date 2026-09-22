# fancc28/Medical-OpenJev

## Resumen

Medical-OpenJev es un conjunto de tres modelos de decisión médica de tipo System-1, publicados por el usuario fancc28 en HuggingFace, que no generan texto: reciben un estado de evidencia clínica (una lista de hechos sobre el paciente) y devuelven, en una sola pasada hacia delante, tres primitivas numéricas: enrutamiento de especialidad (`choice`), probabilidad calibrada de que la evidencia sea suficiente (`noul`) y una decisión binaria de actuar o escalar (`act` / `escalate`). El repositorio incluye tres variantes independientes según el nivel de dificultad clínica: `derm/` (dermatología), `agentclinic/` (patología interna aguda multisistémica) y `rdc/` (enfermedades raras del catálogo Orphanet).

El problema que resuelve es concreto: los LLM médicos generativos responden con la misma seguridad aparente tanto cuando tienen evidencia suficiente como cuando no la tienen. Medical-OpenJev actúa como un semáforo previo (o envolvente) a un LLM doctor, y decide si merece la pena confiar en la vía rápida o si hay que escalar a razonamiento profundo. Su confianza está calibrada matemáticamente mediante entrenamiento con RLCD (regla de puntuación estrictamente propia), no con tokens que suenan convincentes.

Arquitectónicamente, cada modelo es un encoder no autorregresivo de aproximadamente 149,6 M de parámetros: un backbone `answerdotai/ModernBERT-base` congelado de 141 M parámetros (bidireccional, RoPE, 8192 tokens de contexto) más dos cabezas entrenables. Al no generar lenguaje, no puede alucinar un diagnóstico ni emitir JSON malformado. El tamaño de cada checkpoint es de unos 300 MB, por lo que es desplegable localmente en hardware muy modesto. El repositorio completo ocupa 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (backbone `answerdotai/ModernBERT-base` congelado) + cabeza de scoring de opciones y cabeza act/escalate |
| Parametros totales | ~149,6 M por cada uno de los tres modelos (141 M de backbone + cabezas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16 para el backbone y fp32 para las cabezas de choice/noul) |
| Idiomas soportados | no disponible en la informacion proporcionada (el backbone ModernBERT esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` unico por modelo; backbone en bf16, cabezas en fp32) |

Otros datos de interes: el tamano del repositorio es de 0,9 GB (los tres modelos), cada checkpoint individual pesa aproximadamente 300 MB, y la plantilla de secuencia es `"{state} ||| [MASK] opt1 | [MASK] opt2 | ..."`, con los hechos del estado unidos por `" | "`. El umbral de decision (`act_threshold`) es especifico de cada modelo y se encuentra en `medgate_config.json`.

## Arquitectura y entrenamiento

Cada uno de los tres modelos comparte exactamente la misma arquitectura. El backbone es `answerdotai/ModernBERT-base`, un encoder de 141 M parametros completamente bidireccional con RoPE y 8192 tokens de contexto, que permanece congelado durante todo el entrenamiento. Sobre el se anaden dos cabezas: un scorer de opciones que toma el estado oculto correspondiente al token `[MASK]` de cada opcion y lo proyecta mediante `Linear(768→256) → GELU → Linear(256→1)`, aplicando despues softmax dentro de cada pregunta para producir probabilidades por opcion; y una cabeza act/escalate que concatena el estado oculto de `[CLS]` con cuatro caracteristicas de la distribucion (top1, top1−top2, entropia normalizada y K/255) y las pasa por un MLP que emite `[P(act), P(escalate)]`.

El entrenamiento sigue el metodo RLCD: REINFORCE con linea base de grupo, donde la recompensa es una regla de puntuacion compuesta estrictamente propia. Solo se entrenan las dos cabezas; el backbone permanece congelado. El volumen de datos de entrenamiento es muy reducido: 360 casos en dominio por modelo. La calibracion se define como `confidence = 1 − H(p)/log(K)`, y la decision es `act` si y solo si `P(act) ≥ act_threshold`, con un umbral por modelo almacenado en `medgate_config.json`.

## Capacidades

- Enrutamiento de especialidad medica: dado un estado de evidencia, devuelve la etiqueta de especialidad recomendada con probabilidades por opcion y un valor de confianza.
- Estimacion calibrada de suficiencia de evidencia: emite `P(sufficient) ∈ [0,1]` para responder a si lo recopilado hasta el momento basta para concluir.
- Decision act/escalate: devuelve `P(act)` y `P(escalate)` mas una decision umbralizada, pensada como semaforo de seguridad.
- Salida estrictamente numerica: no genera texto, por lo que no puede alucinar un diagnostico ni producir JSON malformado.
- Confianza calibrada matematicamente mediante entrenamiento RLCD con regla de puntuacion estrictamente propia, en lugar de confianza autoreportada por el propio modelo.
- Integracion plug-and-play con cualquier LLM: es un encoder independiente que se ejecuta antes o alrededor del LLM doctor, sin tocar sus pesos.
- Cobertura por niveles de dificultad: dermatologia, patologia interna aguda multisistemica y enfermedades raras (Orphanet).
- Inferencia en una sola pasada hacia delante (no autorregresiva), lo que permite latencias del orden de milisegundos en local segun el autor.
- No se menciona soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Semaforo de seguridad delante de un agente medico: antes de responder a una consulta, se calcula `P(act)`; si la decision es `act` y la confianza supera el umbral (por ejemplo 0,85), se usa la via rapida y se evita invocar el LLM grande. Si la decision es `escalate`, se deriva al modelo generativo. Esto reduce coste y latencia en los casos faciles.
- Triaje y enrutamiento de especialidad: en una plataforma de telemedicina, el modelo lee los hechos recogidos en el formulario inicial y decide si el caso corresponde a dermatologia, medicina interna u otra especialidad, con probabilidades por opcion para priorizar la cola de atencion.
- Deteccion de vacios de evidencia en la anamnesis: con la primitiva `noul`, el sistema puede detectar que `P(sufficient)` es baja y solicitar pruebas o preguntas adicionales antes de cerrar el caso, en lugar de forzar un diagnostico prematuro.
- Gestion de casos de dermatologia: sobre la variante `derm/`, orientada a cuadros con historia visualmente fundamentada (por ejemplo enfermedad de Hailey-Hailey o sindrome de Conradi-Hunermann), para decidir si el cuadro esta suficientemente caracterizado.
- Filtro previo en urgencias internas multisistemicas: con la variante `agentclinic/`, el modelo evalua workups clinicos abiertos y decide si escalar a un LLM de razonamiento profundo cuando la presentacion es ambigua (por ejemplo sindrome neurologico maligno o liquen escleroso).
- Escalado selectivo en enfermedades raras: con la variante `rdc/`, el modelo tiende a escalar en la cola larga de baja prevalencia (hipocondroplasia, endocarditis de Loeffler). El autor indica explicitamente que una tasa alta de `escalate` en `rdc` es el comportamiento seguro deseado, no un fallo.
- Optimizacion de coste en pipelines de LLM medico: al actuar como puerta, solo los casos genuinamente dificiles llegan al modelo grande, lo que reduce el consumo de tokens en produccion.
- Auditoria de confianza y control de calidad: comparar la confianza del LLM doctor con la del gate permite detectar casos en los que el modelo generativo esta sobreconfiado, usando las metricas ECE y Brier como indicadores.
- Modulo de investigacion sobre calibracion: el repo permite reproducir el enfoque RLCD con reglas de puntuacion propias y comparar la calibracion frente a la autoevaluacion autoreportada de un LLM en conjuntos held-out pequenos (n=60 por condicion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica exclusivamente metricas de calibracion sobre un conjunto de test held-out con n=60 casos por condicion, comparando la confianza del gate frente a la confianza autoreportada de un LLM doctor sobre los mismos casos. Valores mas bajos de ECE y Brier son mejores.

| Nivel de condicion | ECE del gate ↓ | ECE del LLM ↓ | Brier del gate ↓ | Brier del LLM ↓ |
|---|---|---|---|---|
| Dermatologia (`derm`) | 0,209 | 0,523 | 0,238 | 0,505 |
| Multisistemico (`agentclinic`) | 0,135 | 0,351 | 0,239 | 0,299 |
| Enfermedad rara (`rdc`) | 0,220 | 0,706 | 0,068 | 0,644 |

Segun el autor, el gate es entre 2 y 3 veces mejor calibrado que dejar que el LLM puntue su propia confianza. Se advierte ademas de que la tasa de exito diagnostico de extremo a extremo es baja en enfermedad rara (cola larga dificil) y que el objetivo del gate es la calibracion honesta, no resolver el diagnostico.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB por modelo. Cada checkpoint pesa aproximadamente 300 MB (backbone bf16 mas cabezas fp32), por lo que la huella en memoria es minima.
- GPU recomendadas: practicamente cualquier GPU moderna sirve. Para lotes pequenos y baja latencia, una NVIDIA T4, L4, A10G o RTX 3060 en adelante es mas que suficiente. En A100 o H100 el modelo queda enormemente sobredimensionado para su tamano.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 1 GB de VRAM libre, e incluso en GPU integradas. Tambien puede ejecutarse directamente en CPU (`device="cpu"`), segun el ejemplo del autor.
- Opciones de despliegue: PyTorch mas `transformers` mas `safetensors`, cargando el modulo `modeling_medopenjev.py` incluido en el repositorio. No es adecuado para servidores de inferencia generativa como vLLM o TGI, dado que no es un modelo autorregresivo ni genera texto. No se publican pesos en GGUF, por lo que llama.cpp y Ollama no estan soportados con el material disponible.
- Latencia y throughput estimados: el autor describe la ruta System-1 como del orden de milisegundos en local, pero no se proporcionan cifras concretas de latencia ni de throughput en la informacion disponible.
- Almacenamiento: 0,9 GB para el repositorio completo con los tres modelos; unos 300 MB si solo se descarga una variante.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos del mismo tamano o categoria en la informacion proporcionada. La comparativa mas relevante que si aparece en la model card es contra la confianza autoreportada de un LLM generico y contra la API propietaria cerrada TypeSafe Jev, de la que este repositorio se presenta como contraparte abierta.

| Sistema | Parametros | Contexto | Salida | Calibracion (ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Medical-OpenJev (`derm`) | ~149,6 M | 8192 tokens | Probabilidades (choice, noul, act/escalate) | 0,209 | no disponible | Abierta en HuggingFace |
| Medical-OpenJev (`agentclinic`) | ~149,6 M | 8192 tokens | Probabilidades | 0,135 | no disponible | Abierta en HuggingFace |
| Medical-OpenJev (`rdc`) | ~149,6 M | 8192 tokens | Probabilidades | 0,220 | no disponible | Abierta en HuggingFace |
| LLM doctor generico (confianza autoreportada) | no disponible | no disponible | Texto y confianza autoreportada | 0,351-0,706 segun condicion | no disponible | no disponible |
| TypeSafe Jev (propietario, System-1 decision) | no disponible | no disponible | Probabilidades y decision | no disponible | Propietaria | Cerrada |

## Limitaciones y advertencias

- Riesgo de alucinacion: nulo en el sentido generativo, porque el modelo no produce texto; su salida son unicamente probabilidades y etiquetas. El riesgo se traslada a la mala calibracion o a un enrutamiento incorrecto, no a la invencion de contenido.
- Volumen de entrenamiento muy reducido: 360 casos en dominio por modelo. La generalizacion a distribuciones clinicas fuera de ese conjunto no esta demostrada.
- Rendimiento diagnostico bajo en enfermedad rara: el propio autor advierte que la tasa de exito de extremo a extremo en la cola larga es baja y que el comportamiento esperado alli es escalar, no acertar el diagnostico.
- Limitacion de idioma: la model card no declara idiomas soportados. El backbone ModernBERT esta entrenado principalmente en ingles, por lo que el uso en castellano u otros idiomas no esta validado y puede degradar el rendimiento.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse que el uso comercial este permitido. Debe verificarse antes de cualquier despliegue en produccion.
- Ambito de uso restringido: la model card lo plantea como semaforo de seguridad y triaje, no como sistema de diagnostico autonomo. No debe usarse como sustituto del criterio clinico.
- Dependencia de la plantilla de entrada: el modelo espera un formato concreto (`{state} ||| [MASK] opt1 | ...`, hechos unidos por `" | "`). Cualquier desviacion en el preprocesado puede invalidar las probabilidades.
- Umbrales sensibles: la decision depende de `act_threshold` en `medgate_config.json`. Un umbral mal ajustado puede provocar escalado excesivo (coste) o infraescalado (riesgo clinico).
- Reputacion y adopcion minimas: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado. No hay validacion independiente de los resultados reportados.
- Validez estadistica limitada: las metricas de calibracion se calculan sobre n=60 casos por condicion, lo que deja intervalos de confianza amplios.
- El comando de descarga del README usa un identificador placeholder (`TODO/medical-openjev`), que debe sustituirse por el identificador real del repositorio.
- No se declara ningun mecanismo de cuantizacion ni version GGUF, lo que limita el despliegue en runtimes tipo llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fancc28/Medical-OpenJev
- Backbone utilizado: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio de descarga indicado en el README (placeholder): https://huggingface.co/TODO/medical-openjev
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs, repositorios o demos asociados. Los resultados devueltos correspondian a paginas de seguimiento de envios de DHL y Deutsche Post, sin relacion con el modelo.
