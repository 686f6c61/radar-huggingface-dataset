# CardCauldronTCG/basil-glimmer-qlora

## Resumen

Basil (Glimmer base) es un adaptador QLoRA desarrollado por Card Cauldron TCG sobre el modelo base `meta-models/Muse-Glimmer-30B`, un transformer de 30.000 millones de parametros con torre de vision. El adaptador esta especializado en una tarea muy concreta: recibir una etiqueta de carta coleccionable propuesta junto con el reglamento interno del equipo y responder con un unico objeto JSON que indique `AGREE` o `QUESTION`, citando la regla aplicable y la pieza de informacion que falta. No emite veredictos de autenticidad, notas de grading ni precios.

El modelo se presento al hackathon de Meta y Cerebral Valley con fecha limite del 4 de noviembre de 2026. Su interes tecnico radica en el enfoque de "escepticismo de etiquetas": en lugar de clasificar cartas como reales o falsas, el adaptador se limita a validar la coherencia de una etiqueta contra un conjunto de reglas, preservando explicitamente el estado `UNKNOWN` cuando la informacion es insuficiente. Esto lo convierte en un ejemplo de adaptador LoRA de dominio muy estrecho con metricas de evaluacion estrictas y verificables.

El repositorio ocupa 0,4 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo base completo. La licencia es Apache-2.0, heredada del modelo base. El checkpoint subido es `checkpoint-185`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de vision (modelo base Muse-Glimmer-30B); adaptador LoRA sobre proyecciones de lenguaje |
| Parametros totales | 30.000 millones (modelo base); adaptador LoRA r16 sobre proyecciones de lenguaje |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max seq de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | Base en 4-bit NF4 durante entrenamiento (QLoRA); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `meta-models/Muse-Glimmer-30B`, fijado a la revision `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`. Se trata de un modelo multimodal con torre de vision, que en este adaptador permanece congelada; solo se ajustan las proyecciones de lenguaje mediante LoRA con rango 16, alpha 32 y dropout 0,05. El entrenamiento sigue la receta oficial de QLoRA de Meta: base cuantizada en 4-bit NF4 con computo en bf16.

Los datos provienen del conjunto congelado "true-v2 feast", con 5.893 filas y hash SHA-256 `7a01050d9093ac119bb44aef40b1921dd7e1159ada0e324aced2fa30618f9fd2`, disjunto por identidad respecto al split de examen. Se entrenaron 3 epocas con learning rate 1e-4, scheduler coseno, batch efectivo 32, longitud maxima de secuencia 1024, semilla 29 y perdida solo sobre la completion. El entrenamiento se ejecuto en Modal sobre una H100. El checkpoint publicado es el 185.

## Capacidades

- Generacion de un unico objeto JSON estructurado como respuesta, con decision `AGREE` o `QUESTION`.
- Citacion de la regla concreta del reglamento del equipo que motiva la decision.
- Identificacion de la pieza de informacion faltante cuando la etiqueta no puede validarse.
- Preservacion explicita del estado `UNKNOWN` cuando no hay datos suficientes.
- Abtencion de veredictos de autenticidad, grading o precios (restriccion de diseno).
- Procesamiento de etiquetas de cartas coleccionables junto con reglas de equipo.
- Soporte multimodal heredado del modelo base (torre de vision), aunque congelada durante el ajuste.
- Tool calling, agentes multi-paso y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion de etiquetas en catalogacion de cartas: el adaptador recibe una etiqueta propuesta y el reglamento del equipo, y devuelve `AGREE` o `QUESTION` con la regla citada, lo que permite auditar cada decision de forma trazable.
- Control de calidad en flujos de ingesta: integrado como paso previo a la publicacion de fichas de cartas, bloquea etiquetas incoherentes y solicita la informacion faltante antes de continuar.
- Asistencia a moderadores de comunidad: el modelo senala que regla incumple una etiqueta y que dato falta, reduciendo el tiempo de revision manual en foros de intercambio.
- Generacion de colas de revision: las respuestas `QUESTION` se enrutan automaticamente a un revisor humano con la regla y la carencia ya identificadas, gracias al formato JSON estricto.
- Auditoria de consistencia normativa: al citar siempre la regla aplicable, permite detectar reglas ambiguas o contradictorias en el reglamento del equipo a partir de los casos marcados como `QUESTION`.
- Prototipado de asistentes de dominio cerrado: sirve como referencia de adaptador LoRA de tarea unica con metricas de evaluacion estrictas y preservacion de `UNKNOWN`, reutilizable en otros dominios con reglas explicitas.
- Despliegue en endpoint gestionado: el autor publica un endpoint en Modal que sirve este adaptador sobre el base fijado, util para pruebas de integracion sin infraestructura propia.

## Benchmarks y rendimiento

Evaluacion sobre el split de examen held-out (§5), con 305 filas nunca vistas en entrenamiento. Umbrales exigidos: decision >= 0,90, citacion >= 0,85, cero salidas prohibidas y cero violaciones de preservacion de `UNKNOWN`.

| Metrica | Resultado | Umbral |
|---|---|---|
| Precision de decision | 1,0 | >= 0,90 |
| Precision de citacion de regla | 1,0 | >= 0,85 |
| Salidas prohibidas | 0 | 0 |
| Violaciones de preservacion de UNKNOWN | 0 | 0 |
| Supera los cuatro umbrales | True | True |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,4 GB; requiere cargar el modelo base Muse-Glimmer-30B para inferencia.
- VRAM para el base en 4-bit NF4: aproximadamente 15-18 GB solo para pesos, mas overhead de activaciones y cache KV; estimacion orientativa, no confirmada por el autor.
- VRAM para el base en bf16: aproximadamente 60 GB solo para pesos; requiere GPU de 80 GB (A100, H100) o multi-GPU.
- Entrenamiento realizado en 1x H100 segun la model card.
- Cabe en GPU de consumo (RTX 4090 de 24 GB) unicamente con cuantizacion de 4 bits y secuencias cortas; no confirmado por el autor.
- Opciones de despliegue: PEFT sobre transformers, vLLM con soporte LoRA, TGI; llama.cpp y Ollama no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Basil (Glimmer base) | 30B (base) + LoRA r16 | no disponible | Adaptador QLoRA de tarea unica | Apache-2.0 | HuggingFace + endpoint Modal |
| Modelo base Muse-Glimmer-30B | 30B | no disponible | Transformer multimodal | no disponible | Referenciado como base |
| Alternativas de tarea unica con LoRA | variable | variable | Adaptadores PEFT | variable | no disponible |

## Limitaciones y advertencias

- El adaptador solo responde con `AGREE` o `QUESTION`; no emite veredictos de autenticidad, grading ni precios por diseno.
- Entrenado exclusivamente sobre el conjunto "true-v2 feast" de 5.893 filas; su comportamiento fuera de la distribucion de ese dataset no esta caracterizado.
- Longitud maxima de secuencia en entrenamiento de 1024 tokens; entradas mas largas pueden degradar la calidad de la respuesta.
- No hay informacion sobre sesgos, idiomas soportados ni robustez ante entradas adversariales.
- Riesgo de alucinacion en la citacion de reglas no evaluado mas alla del split held-out.
- Requiere cargar el modelo base de 30B, lo que implica coste de inferencia considerable para una tarea de clasificacion binaria.
- El endpoint en Modal es una demo del hackathon; no se garantiza disponibilidad ni SLA.
- Licencia Apache-2.0 heredada del base, pero el uso comercial del modelo base debe verificarse contra su propia licencia, no disponible en la informacion proporcionada.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y mantenimiento no verificables.

## Enlaces

- HuggingFace: https://huggingface.co/CardCauldronTCG/basil-glimmer-qlora
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Endpoint en Modal: https://caudillsabastian6--glimmer-basil-serve-basil-read.modal.run
- Paper de QLoRA (receta citada): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
