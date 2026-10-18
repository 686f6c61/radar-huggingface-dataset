# Mhaquehaque/berkelium-qwen3-8b-cad-v1

## Resumen

berkelium-qwen3-8b-cad-v1 es un adaptador LoRA entrenado sobre Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`) por el autor Mhaquehaque. Su funcion es transformar una peticion de ingenieria en lenguaje natural en un objeto JSON `DesignProposal` de Berkelium: un diseno parametrico con parametros nombrados, requisitos, hipotesis y preguntas abiertas, acompanado de un grafo de operaciones Geometry IR o de un modelo de catalogo (par de engranajes rectos, viga en voladizo). No genera geometria directamente: el modelo solo propone, y la geometria, las medidas y la validacion las produce el nucleo determinista de Berkelium (B-rep exacto con OCCT, malla con Manifold, niveles de validacion L0-L6).

El adaptador tiene 174,7 MB en fp16 (del orden de 87 M de parametros entrenables, derivados del tamano del fichero) y se distribuye como adaptador PEFT, no como modelo completo: requiere descargar Qwen3-8B (8.200 M de parametros, transformer decoder-only denso) para funcionar. La licencia declarada es Apache 2.0.

Es relevante ahora por dos motivos. Primero, ejemplifica un patron creciente en IA open source: adaptadores de dominio estrecho sobre modelos generalistas, con evaluacion contra el modelo base como criterio de promocion. Segundo, su model card es inusualmente honesta: el autor marca explicitamente el modelo como experimental y sin evaluar, advierte que los datos de entrenamiento son generados por plantillas y que la perdida de validacion de 0,0042 no demuestra generalizacion. Los resultados de la evaluacion held-out (E-C1) estan pendientes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso Qwen3-8B |
| Parametros totales | Adaptador: 174,7 MB en fp16 (~87 M de parametros entrenables, derivado del tamano del fichero). Modelo base: 8.200 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; el modelo base Qwen3-8B declara 32.768 tokens nativos (ampliables por YaRN hasta 131.072, segun la documentacion del base) |
| Tipos de cuantizacion | Adaptador en fp16; base cuantizado en NF4 durante el entrenamiento (QLoRA); publicado GGUF Q4_K_M en el repo `berkelium-qwen3-8b-cad-v1-GGUF` |
| Idiomas soportados | No disponible (no documentados en la model card; los del modelo base no se detallan para este adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` (PEFT); GGUF Q4_K_M como artefacto adicional |
| Configuracion LoRA | r=32, alpha=64, aplicado a todas las capas lineales |
| Hashes | Adaptador `c76b64ee…2f12f`; manifiesto de datos `bb07a39a…fe49d` |
| Version de prompt | `cad-0.1` (desde `berkelium_neural/cad/prompts.py`), con modo thinking desactivado |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: base Qwen3-8B cuantizado en NF4 con computo en fp16 y pesos LoRA en fp32, r=32 y alpha=64 sobre todas las capas lineales, con entrenamiento distribuido (DDP) en 2 GPU Kaggle T4. El resultado son 601 pasos (0,80 de epoch, detenido por un limite de tiempo de 10 horas; 10,06 h en total) sobre el dataset `berkelium-cad-v1`, que contiene 18.712 filas verificadas por el nucleo de Berkelium (33 familias de piezas, mas una gramatica de features, modelos CEM de engranajes y vigas, y un caso de linterna). Del total se uso un subconjunto aleatorio de 12.000 filas, equivalentes a 15,5 M de tokens.

El dato mas importante para interpretar el resultado: el texto de entrenamiento esta generado por plantillas. Por eso la perdida de validacion (0,0042 sobre 120 filas en distribucion) y la caida de perdida de entrenamiento (1,03 a 0,005) no constituyen evidencia de generalizacion, tal como advierte el propio autor. La evaluacion real es E-C1: comparacion zero-shot entre Qwen3-8B y este adaptador sobre familias retenidas que nunca se vieron en entrenamiento (pipe_elbow, chair, knob, hinge_leaf), puntuada por el nucleo determinista de Berkelium y con una regla de promocion (D-033) pre-registrada antes del entrenamiento. En el momento de redactar esta ficha, E-C1 sigue en ejecucion y los numeros no se han publicado.

La innovacion tecnica no esta en el adaptador en si, sino en el contrato de salida: el modelo emite JSON estructurado que un nucleo geometrico determinista valida y convierte en B-rep exacto o malla, con niveles de validacion L0-L6. Esto desplaza la garantia de correctitud del modelo probabilistico al verificador geometrico, un patron reutilizable para cualquier dominio donde la salida deba ser comprobable.

## Capacidades

- Generacion de JSON `DesignProposal` estructurado a partir de una peticion de ingenieria en lenguaje natural, con parametros nombrados, requisitos, hipotesis y preguntas abiertas.
- Emision de un grafo de operaciones Geometry IR (procedural) para el nucleo de Berkelium.
- Seleccion de modelos de catalogo predefinidos: par de engranajes rectos (spur-gear pair) y viga en voladizo (cantilever beam).
- Cobertura de 33 familias de piezas en el dataset de entrenamiento, mas una gramatica de features.
- Integracion con el pipeline `berkelium.pipeline.run(...)` para convertir la propuesta en geometria validada.
- Conversacion multi-turno y generacion de texto generica, heredadas del modelo base Qwen3-8B.
- Soporte de tool calling, function calling y razonamiento multi-paso: no documentado en la model card (el modelo base Qwen3 lo soporta, pero no hay confirmacion de que el adaptador lo conserve).
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: no documentadas para este adaptador.

## Casos de uso

- Prototipado rapido de piezas parametricas: el ingeniero describe en lenguaje natural un codo de tuberia o una brida y el modelo devuelve el `DesignProposal` con parametros y requisitos; el nucleo de Berkelium genera la geometria exacta y la valida en niveles L0-L6. Adecuado porque separa la parte creativa (propuesta) de la verificable (B-rep).
- Generacion de variantes de diseno en lote: dado un catalogo de familias ya soportadas, se pueden emitir decenas de propuestas con parametros distintos y filtrarlas automaticamente por validacion geometrica antes de que las revise un humano.
- Documentacion tecnica de diseno: el JSON de salida incluye requisitos, hipotesis y preguntas abiertas, lo que sirve como borrador de memoria de calculo o de hoja de especificacion revisable.
- Asistente interno de CAD en un pipeline de CI: el adaptador se puede ejecutar en el mismo flujo que el validador, de forma que cualquier propuesta que no pase L0-L6 se rechace sin intervencion manual; requiere desplegar el nucleo de Berkelium junto al modelo.
- Educacion y formacion en diseno mecanico: el par de engranajes y la viga en voladizo del catalogo permiten generar ejercicios con parametros controlados y solucion verificada por el nucleo.
- Extraccion de requisitos desde texto libre: usar el adaptador solo para la fase de estructuración (convertir un pliego o una nota tecnica en parametros, requisitos y preguntas abiertas), descartando la parte geometrica si no se dispone del nucleo.
- Base para fine-tuning posterior en un dominio vertical: el adaptador es un punto de partida reproducible (manifiesto de datos y hashes publicados) para quien quiera entrenar su propia variante con su catalogo de piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no esta evaluado y que la evaluacion held-out E-C1 (Qwen3-8B zero-shot frente al adaptador, puntuada por el nucleo de Berkelium, con regla de promocion D-033 pre-registrada) esta en ejecucion. Las unicas metricas disponibles son de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 1,03 → 0,005 |
| Perdida de validacion | 0,0042 (120 filas en distribucion) |
| Pasos | 601 (0,80 epoch) |
| Tiempo de entrenamiento | 10,06 h (limite de 10 h) |
| Tokens de entrenamiento | 15,5 M (12.000 filas de 18.712) |
| Hardware de entrenamiento | 2× Kaggle T4, QLoRA NF4 |
| Evaluacion held-out (E-C1) | Pendiente, sin publicar |

Advertencia del autor: al ser datos generados por plantillas, estas perdidas no demuestran generalizacion. No se deben citar como indicador de calidad.

## Requisitos de hardware

- VRAM para el adaptador solo: ~0,2 GB (174,7 MB en fp16), pero no es ejecutable sin el modelo base.
- VRAM para base + adaptador en fp16/BF16: del orden de 16-17 GB de pesos, mas cache KV; en la practica 20-24 GB para contexto moderado.
- VRAM con base en cuantizacion de 4 bits (NF4 o GGUF Q4_K_M): ~5-6 GB de pesos, mas cache KV; el rango 8-10 GB es realista para contextos cortos.
- GPU consumer: si cabe. Una RTX 3090 o 4090 (24 GB) ejecuta la pareja en fp16 con holgura; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB necesitan cuantizacion de 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir en fp16 con lotes grandes; no hay datos de throughput publicados.
- Despliegue: PEFT + transformers (via indicada en la model card), llama.cpp u Ollama mediante el GGUF Q4_K_M publicado, y vLLM o TGI si se fusiona el adaptador con el base en un checkpoint completo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota operativa: el modelo necesita el system prompt `cad-0.1` y el modo thinking desactivado; sin ellos el formato de salida puede degradarse. Ademas, el nucleo de Berkelium (OCCT/Manifold) debe ejecutarse aparte, lo que anade requisitos de CPU y memoria fuera de la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| berkelium-qwen3-8b-cad-v1 | ~87 M entrenables sobre 8.200 M | No especificado (base 32.768) | LoRA para JSON de diseno CAD + Geometry IR | Apache 2.0 | Experimental, sin evaluar; 0 descargas |
| Qwen/Qwen3-8B (base, zero-shot) | 8.200 M | 32.768 nativos | Modelo generalista; es la linea base de E-C1 | Apache 2.0 | Estable, ampliamente usado |
| Qwen3-4B / Qwen3-14B | 4.000 M / 14.000 M | 32.768 nativos (familia Qwen3) | Alternativas de la misma familia para ajustar coste/calidad | Apache 2.0 | Estables; no hay adaptador CAD equivalente publicado |
| Otros text-to-CAD open source | No disponible | No disponible | Generacion de geometria o de codigo CAD (CadQuery, OpenSCAD) | Variable | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de resultados de benchmarks comparativos: la comparacion relevante (E-C1 frente al base zero-shot) esta pendiente de publicacion. Cualquier afirmacion de superioridad frente al base seria especulativa en este momento.

## Limitaciones y advertencias

- Modelo sin evaluar: la evaluacion held-out E-C1 esta en ejecucion y los numeros no se han publicado. El autor lo etiqueta como experimental y recomienda tratarlo como tal.
- Datos de entrenamiento generados por plantillas: la perdida de validacion de 0,0042 sobre 120 filas en distribucion no es evidencia de generalizacion a peticiones reales.
- Solo propone, no valida: sin el nucleo de Berkelium la salida es JSON sin garantia de que la geometria sea construible. Cualquier uso en produccion exige ejecutar `berkelium.pipeline.run(...)` y respetar los niveles L0-L6.
- Dependencia de prompt: requiere el system prompt `cad-0.1` y thinking mode desactivado. Un prompt distinto puede romper el formato `DesignProposal`.
- Cobertura limitada: 33 familias de piezas en el dataset; cuatro familias retenidas (pipe_elbow, chair, knob, hinge_leaf) nunca se entrenaron, lo que anticipa un rendimiento pobre en esas categorias hasta que se publiquen los resultados.
- Riesgo de alucinacion estructural: puede inventar parametros, nombres de operaciones Geometry IR o valores dimensionales plausibles pero incorrectos; el validador geometrico es la unica defensa fiable.
- Idiomas no documentados: no hay garantia de calidad fuera del ingles tecnico empleado en las plantillas de entrenamiento.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen3-8B, que se distribuye por separado.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, un unico autor y un ecosistema (Berkelium) en fase temprana con rama de desarrollo especifica. No hay historial de mantenimiento.
- Sesgos: no documentados. Al entrenar sobre plantillas sinteticas de dominios de ingenieria concretos, es probable que reproduzca los supuestos dimensionales y de nomenclatura de esas plantillas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1
- GGUF Q4_K_M (Ollama / llama.cpp): https://huggingface.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codigo de Berkelium (rama `Berkelium-Neural-Rendering-Studio-neural-v1`): https://github.com/enigmahacker/Berkelium-Neural-Rendering-Studio
- Paper, blog o demo del adaptador: no disponibles
- Resultados de la evaluacion E-C1: no publicados en el momento de redactar esta ficha
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos verificables.
