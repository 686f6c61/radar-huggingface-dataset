# norma-ai/norma-nano

## Resumen

Norma Nano es un modelo de decisión causal de ~494 millones de parámetros (511M según la model card) desarrollado por norma-ai, afinado a partir de Qwen/Qwen2.5-0.5B-Instruct. No es un modelo generativo al uso: está diseñado como un motor de "System 1" para arquitecturas de agentes autónomos, es decir, para tomar decisiones reflexivas y deterministas (enrutado, clasificación, verificación binaria y puntuación ordinal) en un único forward pass, en lugar de generar texto libre que después hay que parsear.

Su propuesta diferencial es la latencia y la ausencia de extracción por expresiones regulares: frente a los 1.000-2.000 ms típicos de un LLM generativo que devuelve JSON, Norma Nano proyecta logits sobre un conjunto cerrado de candidatos y produce estructuras tipadas (choice, noul, score) con una latencia P50 declarada de 45-50 ms sobre una RTX 4060 o una T4. Además incorpora una métrica de confianza basada en entropía de Shannon normalizada, con un Error de Calibración Esperado (ECE) declarado de 0,0306.

Es relevante ahora porque cubre una capa infravalorada de los pipelines de agentes: el enrutado rápido, los guardrails y la validación de permisos. Al ser Apache 2.0, con 988 MB de pesos en BF16 y una ventana de contexto de hasta 2.048 tokens, se puede desplegar como componente auxiliar de baja latencia junto a un modelo mayor que se encargue del razonamiento pesado. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un modelo muy reciente y con adopción todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (backbone Qwen 2.5 0.5B Instruct) |
| Parametros totales | 494.032.768 segun safetensors; la model card declara 511 millones |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | hasta 2.048 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican y ejecutan en FP16/BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | la model card declara soporte zero-shot robusto en ingles, lenguas europeas y asiaticas; el campo de idiomas de HuggingFace figura como no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 1,0 GB |
| Latencia P50 (forward pass) | 45-50 ms en NVIDIA RTX 4060 / T4 |
| Primitivas de decision | choice (enrutado categorico), noul (binario calibrado si/no), score (valoracion ordinal) |
| Metrica de confianza | entropia de Shannon normalizada: C = 1 - H(p)/log(K) |
| ECE (calibracion) | 0,0306 (calibrado por dominio) |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only heredado directamente de Qwen2.5-0.5B-Instruct, con unos 494 millones de parametros reales en safetensors. La innovacion no esta en el backbone sino en la capa de decision: en lugar de decodificar texto autoregresivamente, el modelo evalua un prompt con un conjunto cerrado de opciones candidatas y lee los logits correspondientes al primer token de cada candidato, aplicando softmax sobre esas proyecciones. Con esto se obtiene una respuesta determinista y tipada en un solo forward pass, sin necesidad de extraccion por regex ni de parseo de JSON. Sobre esa distribucion se calcula la confianza mediante entropia de Shannon normalizada, lo que permite umbrales de abstención o escalado.

El modelo soporta tres primitivas de decision: choice, para enrutado categorico entre opciones definidas; noul, para validaciones binarias calibradas (permisos, deteccion de prompt injection, phishing, entradas malformadas); y score, para valoracion ordinal de severidad, riesgo o probabilidad de churn. Se distribuye con un cliente propio (norma.py) que solo requiere torch y transformers, y tambien se puede usar con AutoModelForCausalLM estandar.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni sobre si se aplico RLHF, DPO u otra tecnica de alineamiento. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. Toda esa informacion figura como no disponible en la model card y en los metadatos de HuggingFace.

## Capacidades

- Toma de decisiones determinista y tipada: devuelve directamente una opcion categorica, un booleano o un valor ordinal, sin generacion de texto libre.
- Enrutado instantaneo (choice): clasificacion de tickets, issues o peticiones hacia el departamento, cola o agente adecuado.
- Verificacion binaria calibrada (noul): validacion de permisos, deteccion de prompt injection, phishing y entradas malformadas.
- Valoracion ordinal (score): asignacion de niveles de severidad, riesgo o probabilidad de churn.
- Calibracion de confianza: expone una puntuacion de confianza basada en entropia de Shannon normalizada, con ECE declarado de 0,0306.
- Capacidades multilingues: la model card declara soporte zero-shot robusto en ingles, lenguas europeas y asiaticas.
- Compatibilidad con el ecosistema transformers: uso mediante AutoModelForCausalLM y AutoTokenizer, o mediante el cliente incluido norma.py.
- Compatibilidad declarada con text-embeddings-inference y con endpoints (tags endpoints_compatible y text-embeddings-inference).
- No se documenta soporte de tool calling generativo, agentes multi-step con razonamiento libre, vision, audio ni modo thinking; su rol en un sistema de agentes es el de despachador de acciones y guardrail, no el de razonador.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y un mapa de criterios por departamento (billing, technical, sales) y devuelve la opcion correcta con su confianza en ~45 ms, lo que permite preclasificar cientos de tickets por segundo antes de que un LLM mayor los procese.
- Guardrail de seguridad en agentes: antes de ejecutar una accion, se llama a la primitiva noul para validar si la peticion del usuario implica una operacion sensible o una inyeccion de prompt; la respuesta booleana calibrada se usa como puerta de entrada al pipeline.
- Seleccion de herramienta (tool dispatch): con la logica de proyeccion sobre logits, el modelo elige entre herramientas candidatas (financial_db, database_admin, weather_api) sin riesgo de generar un nombre de herramienta inexistente, ya que la salida esta restringida al conjunto declarado.
- Triaje de severidad en incidencias: la primitiva score permite asignar niveles ordinales de prioridad a alertas de monitorizacion, lo que sirve para ordenar colas de trabajo de SRE sin coste de latencia apreciable.
- Deteccion de churn y scoring de riesgo: clasificacion de cuentas o usuarios en niveles de riesgo de abandono a partir de contexto textual, integrable en un CRM como paso previo a acciones de retencion.
- Moderacion y validacion de entradas: verificacion binaria de si un texto entrante cumple las politicas o malformado, como filtro previo a un modelo generativo de mayor tamano.
- Escalado a humano: decision binaria sobre si una conversacion requiere intervencion humana, con umbral ajustable gracias a la confianza expuesta.
- Componente de baja latencia en pipelines de CI/CD: uso como clasificador para decidir el siguiente paso de un flujo automatizado (por ejemplo, etiquetar un issue o decidir si un cambio requiere revision) sin bloquear el pipeline con una inferencia generativa de segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas de velocidad, recursos y calibracion, medidas sobre una NVIDIA GeForce RTX 4060 Laptop GPU (8.188 MB de VRAM) con CPU AMD Ryzen 7 / Intel Core i7, PyTorch 2.6, CUDA 12.4, tensor cores FP16/BF16 y atencion SDPA.

| Metrica | Norma Nano | LLM generativo tipico |
|---|---|---|
| Latencia P50 | 45-50 ms | 1.000-2.000 ms (segun la model card) |
| VRAM requerida | no disponible con cifra exacta (pesos BF16 de 988 MB) | no disponible |
| Huella en disco | repositorio de 1,0 GB | no disponible |
| Formato de salida | estructura de decision tipada | cadena de texto (JSON a extraer con regex) |
| ECE (calibracion) | 0,0306 (calibrado por dominio) | no disponible |

La tabla comparativa de la model card esta incompleta en la informacion proporcionada: solo se dispone de las cabeceras y de los valores citados arriba. Los scripts de evaluacion declarados son benchmarks/run_full_validation.py y benchmarks/test_ood_generalization.py, aunque no se aportan sus resultados numericos.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16/FP16 ocupan 988 MB, por lo que la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM (sin contar overhead de activaciones y contexto).
- GPU recomendadas segun la model card: NVIDIA RTX 4060 (probada en version Laptop con 8.188 MB) y NVIDIA T4. No se mencionan A100 ni H100, aunque por tamano no deberia haber impedimento tecnico.
- Cabe en GPU de consumo: si, en cualquier GPU moderna con al menos ~2 GB de VRAM libre; se cita explicitamente la RTX 4060.
- CPU: el cliente incluido soporta ejecucion en CPU ademas de GPU (device="cuda" o equivalente), aunque la latencia de 45-50 ms esta medida en GPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM + AutoTokenizer), el cliente propio norma.py incluido en el repositorio, y compatibilidad declarada con text-embeddings-inference y endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: P50 de 45-50 ms por forward pass en RTX 4060 / T4. No se publican cifras de throughput (tokens o decisiones por segundo) ni de P99.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks) del modelo, por lo que la comparacion se limita a caracteristicas estructurales. La model card no incluye una tabla comparativa con alternativas.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| norma-ai/norma-nano | ~494 M (511 M declarados) | 2.048 tokens | Decision tipada / clasificacion (System 1) | Apache 2.0 | HuggingFace, transformers |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | no disponible en esta ficha | Generacion de texto / instrucciones | Apache 2.0 (Qwen) | HuggingFace, transformers |
| Modelos de clasificacion tipo encoder (por ejemplo, familias BERT pequenas) | rango tipico 100-400 M | no disponible | Clasificacion de texto | variable | HuggingFace |

La comparacion con otras alternativas de la misma categoria (modelos de decision o clasificadores pequenos) no esta disponible en la informacion proporcionada, ya que no se aportan resultados de benchmarks que permitan contrastar calidad.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos sistematicos.
- El riesgo de alucinacion se reduce en las tareas restringidas a un conjunto cerrado de opciones, pero la model card no aporta evidencia empirica sobre el comportamiento fuera de dominio (OOD); el script de validacion OOD existe, pero sus resultados no se publican.
- La ventana de contexto esta limitada a 2.048 tokens, lo que restringe el tamano del estado o del contexto que se puede pasar al modelo.
- El modelo no genera texto libre: no sirve como sustituto de un LLM generativo y debe integrarse como componente auxiliar en una arquitectura mayor.
- El ECE de 0,0306 esta declarado como "calibrado por dominio", de modo que la calibracion puede degradarse en dominios distintos a los usados durante el ajuste.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se hereda cualquier condicion aplicable del modelo base Qwen2.5-0.5B-Instruct; conviene revisar la licencia de Qwen antes de un despliegue comercial.
- Existe una discrepancia entre el recuento de parametros de safetensors (494.032.768) y el declarado en la model card (511 millones); conviene verificar cual corresponde al checkpoint desplegado.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 1 like), lo que implica ausencia de validacion independiente por parte de la comunidad.
- No se documenta soporte para cuantizaciones GGUF/AWQ/GPTQ ni para servidores de inferencia habituales como vLLM u Ollama, lo que puede limitar las opciones de despliegue en produccion.
- No se especifican regimenes de P99 ni de latencia bajo carga concurrente; la cifra de 45-50 ms corresponde a un forward pass aislado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/norma-ai/norma-nano
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Scripts de evaluacion citados en la model card: `benchmarks/run_full_validation.py` y `benchmarks/test_ood_generalization.py` (dentro del propio repositorio de HuggingFace)
- Cliente de inferencia citado: `norma.py`, incluido en el repositorio del modelo

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos corresponden a la cadena de supermercados francesa NORMA (norma.fr, icatalogue.fr, norma-asso.fr, es.wikipedia.org/wiki/Norma) y no guardan relacion con norma-ai/norma-nano, por lo que no se enlazan como fuentes del modelo.
