# Microck/Spunto-Router-23M

## Resumen

Spunto-Router-23M es un modelo de clasificación de texto (cross-encoder) desarrollado por Microck, disenado especificamente para el enrutamiento de habilidades (skill routing) en agentes de IA. El modelo evalua pares formados por una peticion del usuario y la descripcion de una habilidad (`SKILL.md`-style), devolviendo un logit de relevancia que permite decidir si una instruccion especializada debe inyectarse en el contexto del agente. Se distribuye como bundles ONNX FP32 para ejecucion en CPU, lo que lo hace adecuado para entornos sin GPU.

El nucleo del modelo es un decider basado en `cross-encoder/ms-marco-MiniLM-L6-v2` afinado, con una proyeccion de 128 dimensiones y una cabeza de decision GRU de 32 dimensiones, que suma aproximadamente 22,7 millones de parametros. Se complementa con un retriever sin modificar (`sentence-transformers/all-MiniLM-L6-v2`, embeddings de 384 dimensiones) que selecciona hasta 8 candidatos del catalogo de habilidades. El modelo es agnostico al agente y no asume un vocabulario fijo de etiquetas: las habilidades se descubren dinamicamente desde un catalogo vivo.

Su relevancia actual radica en que aborda un problema practico de los sistemas de agentes: seleccionar que instrucciones especializadas cargar en contexto sin sobrecargar la ventana ni recurrir a un LLM grande. Al ser un modelo compacto (23M) ejecutable en CPU con ONNX Runtime, ofrece una alternativa de bajo coste y baja latencia para el enrutamiento previo a la inferencia del modelo principal, con capacidad de abstenerse cuando ninguna habilidad es relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder MiniLM-L6 afinado + proyeccion 128-d + cabeza GRU 32-d; retriever bi-encoder MiniLM-L6 (384-d) |
| Parametros totales | ~22,7M (decider MiniLM-L6); el tamano nominal "23M" se refiere al decider |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 96 tokens de intencion reciente + 96 tokens de accion + cabeza de descripcion + 320 tokens de payload + 3 tokens especiales |
| Tipos de cuantizacion | FP32 (unico formato publicado en este repositorio) |
| Idiomas soportados | en, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), bundles CPU FP32; tokenizer.json |
| Runtime | ONNX Runtime CPU |
| Candidatos de retrieval | 8, con desempate determinista por ID |
| Modelo base | cross-encoder/ms-marco-MiniLM-L6-v2, sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El sistema se estructura en dos etapas. La primera es un retriever bi-encoder basado en `all-MiniLM-L6-v2` sin modificar, que genera embeddings normalizados de 384 dimensiones y selecciona hasta 8 candidatos del catalogo de habilidades, con desempate determinista por ID. La segunda es un decider cross-encoder afinado sobre `cross-encoder/ms-marco-MiniLM-L6-v2`: el encoder devuelve caracteristicas pooled, una proyeccion las reduce a 128 dimensiones y una cabeza GRU de 32 dimensiones produce el logit final de relevancia. Es importante senalar que el decider no es un grafo de clasificacion de secuencia estandar de Hugging Face: requiere ejecutar dos grafos (`encoder` y `aggregator-step.onnx`) o usar el worker proporcionado, y no es cargable directamente con `AutoModelForSequenceClassification` ni con un pipeline generico de Transformers.

La entrada del decider combina la peticion (hasta 96 tokens de intencion reciente) y una accion estructurada opcional (hasta 96 tokens) con la descripcion de una habilidad (cabeza de descripcion mas 320 tokens de payload y 3 tokens especiales). La salida es un logit de relevancia en bruto, al que se aplican umbrales congelados de abstencion/seleccion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la evaluacion declarada se realizo sobre un conjunto privado de enrutamiento autorado por el desarrollador ("Private authored fresh routing set").

## Capacidades

- Clasificacion de pares peticion-descripcion de habilidad para decidir si una instruccion especializada es relevante.
- Enrutamiento de habilidades (skill routing) agnostico al agente, sin vocabulario fijo de etiquetas; las habilidades se descubren desde un catalogo vivo.
- Capacidad de abstenerse cuando ninguna habilidad del catalogo es relevante (umbrales congelados de abstencion).
- Soporte de acciones estructuradas opcionales ademas de la peticion en lenguaje natural.
- Multilingue en ingles, espanol y portugues.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta generacion de texto, razonamiento general, codigo, matematicas, vision, audio ni tool calling por si mismo; es exclusivamente un componente de enrutamiento.

## Casos de uso

- Enrutamiento de habilidades en agentes de codigo: integrado en OMP (oh-my-pi), el router selecciona que cuerpos de `SKILL.md` inyectar en el contexto del agente antes de la inferencia del LLM principal, reduciendo el consumo de tokens y evitando cargar instrucciones irrelevantes.
- Descubrimiento dinamico de catalogo: en sistemas con decenas o cientos de habilidades locales, el retriever de 8 candidatos mas el decider permiten seleccionar la habilidad adecuada sin mantener un mapeo estatico de intenciones a etiquetas.
- Pre-filtrado de bajo coste en pipelines de agentes: al ejecutarse en CPU con ONNX Runtime y ~23M de parametros, puede actuar como primera etapa antes de invocar un modelo grande, ahorrando latencia y coste en peticiones que no requieren habilidades especiales.
- Abstención controlada en entornos con permisos: el modelo puede declinar cargar una habilidad cuando la confianza es baja, lo que permite construir capas de politica que solo inyectan instrucciones cuando el logit supera el umbral congelado.
- Soporte multilingue para equipos en ingles, espanol y portugues: util en organizaciones que mantienen catalogos de habilidades en varios idiomas y necesitan enrutar peticiones en cualquiera de ellos.
- Evaluacion y auditoria de catalogos de habilidades: el modelo puede usarse offline para medir que descripciones de habilidades disparan con demasiada frecuencia o con demasiada poca, ayudando a refinar las descripciones del catalogo antes de habilitar la inyeccion automatica.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`), sobre un conjunto privado de enrutamiento ("Private authored fresh routing set", split fresh):

| Metrica | Valor | Notas |
|---|---|---|
| Top-1 precision (lower label bound) | 0,80 | Tarea: agent skill routing |
| Coverage (fire-based, lower label bound) | 0,692 | No es recall |
| False fires en peticiones conocidas sin habilidad | 2 | Conteo absoluto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos son los anteriores, especificos de la tarea de enrutamiento y no comparables directamente con benchmarks de LLM generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU (ONNX Runtime, FP32).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. No se han publicado requisitos minimos de CPU.
- Cabe en GPU consumer: si, aunque no es necesario; el modelo completo (decider + retriever) ocupa ~0,2 GB en disco en FP32.
- Opciones de despliegue: ONNX Runtime CPU (version probada: 1.23.2), con `tokenizers==0.22.1` y `numpy==2.2.6` en Python 3.11. El instalador oficial (`python/install-router.py`) descarga y verifica los bundles desde el Hub. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un cross-encoder de 23M en CPU, se espera baja latencia por par, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spunto-Router-23M | ~22,7M (decider) | ~96+96+320 tokens por par | Skill routing (cross-encoder) | Apache-2.0 | ONNX en HF Hub |
| Arch-Router-1.5B | 1.5B (segun convencion de nombre citada) | no disponible | Routing de modelos | no disponible | no disponible |
| Supra-Router-51M | 51M (segun convencion de nombre citada) | no disponible | Routing | no disponible | no disponible |
| `pipizhao/SkillRouter-*` | no disponible | no disponible | Skill routing | no disponible | no disponible |

La model card menciona Arch-Router-1.5B y Supra-Router-51M como referencias de la convencion de nombres Brand-Router-Size, y aclara que el proyecto no esta relacionado con `pipizhao/SkillRouter-*`. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse para autorizar llamadas a herramientas, aplicar politicas de seguridad ni certificar que una instruccion es segura; el modelo solo sugiere o carga instrucciones locales de confianza.
- Puede omitir habilidades utiles (falsos negativos), dispararse con peticiones irrelevantes (falsos positivos) y malinterpretar tareas negadas o entrecomilladas.
- Los umbrales de abstencion/seleccion estan congelados; no se adaptan automaticamente a catalogos nuevos, por lo que se recomienda evaluar sobre el catalogo propio antes de habilitar la inyeccion automatica.
- Los benchmarks declarados son sobre un conjunto privado no reproducible y no verificados (`verified: false`); no son comparables con metricas estandar.
- Cobertura limitada a ingles, espanol y portugues; sin soporte declarado para otros idiomas.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; cualquier expectativa de ese tipo es un uso indebido.
- El decider no es cargable con `AutoModelForSequenceClassification` ni con pipelines genericos; requiere los dos grafos ONNX o el worker del repositorio fuente.
- La licencia Apache-2.0 permite uso comercial, pero el desarrollador no ofrece garantias sobre el comportamiento del modelo en produccion.
- La integracion oficial solo existe para OMP (oh-my-pi), con objetivo de instalacion Linux aarch64, Python 3.11, OMP 18.18.0 y Bun 1.4.4; otras integraciones no estan incluidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Microck/Spunto-Router-23M
- Repositorio fuente e instalador (OMP extension): https://github.com/Microck/spunto
- Guia de instalacion y habilitacion: https://github.com/Microck/spunto#install-and-enable
- Paper referenciado (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Modelo base del decider: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Modelo base del retriever: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de conteo de descargas de Hugging Face: https://huggingface.co/docs/hub/models-download-stats
