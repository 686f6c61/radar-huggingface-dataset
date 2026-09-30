# brishen/laya-burn-q8

## Resumen

`brishen/laya-burn-q8` es una redistribucion cuantizada del modelo Laya de Convai Innovations, publicada por el usuario brishen. No es un modelo nuevo ni un fine-tune: empaqueta los tres checkpoints de Laya (`english`, `multilingual` y `typed-decisions`) con todos sus pesos lineales cuantizados a 8 bits en el formato `burnpack` de Burn, listos para ejecutarse en navegador sobre WebGPU o de forma nativa desde Rust. El objetivo es reducir el peso del modelo (de 843 MB a 519 MB en el checkpoint `english`) manteniendo practicamente intactas las salidas del modelo en float32.

Laya es un "System 1 decision engine": no genera texto. Recibe un estado (un ticket, un correo, un objeto JSON) y una serie de preguntas tipadas, y devuelve en una sola pasada hacia delante respuestas tipadas con probabilidades calibradas por opcion. Los checkpoints `english` y `typed-decisions` se apoyan en la arquitectura encoder ModernBERT-large, mientras que `multilingual` usa mmBERT-base. Convai Innovations promociona tiempos de decision en el orden de decenas de milisegundos (21-33 ms en sus propios materiales) y lo presenta como alternativa abierta a TypeSafe Jev.

La relevancia de esta ficha concreta esta en la via de despliegue: al usar el formato `bpk` de Burn y el backend WGSL/WebGPU, el modelo puede correr en la GPU del usuario dentro del navegador sin clave de API ni inferencia en la nube. La cuantizacion Q8S ocupa un tercio de la memoria de float32 y, segun el autor, mantiene la velocidad de float32 en una Radeon 890M, con todas las respuestas sin cambios en los casos de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large en `english` y `typed-decisions`; mmBERT-base en `multilingual`). Modelo de decision, no generativo |
| Parametros totales | No disponible en la model card; derivados de la arquitectura base ModernBERT-large (~395 M) y mmBERT-base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; los casos de referencia llegan a 4509 tokens. La arquitectura base (ModernBERT / mmBERT) admite hasta 8192 tokens |
| Tipos de cuantizacion | Q8S (int8 simetrico en [-127, 127], una escala float32 por cada 32 entradas, cuatro valores empaquetados en un u32). Embedding de tokens en float16 (`english`, `typed-decisions`) o Q8S (`multilingual`). Normas, sesgos, cabeza de activacion y embedding de tipo en float16 |
| Idiomas soportados | Ingles (`english`); multilingue (`multilingual`; idiomas concretos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (Burn), un archivo `model.bpk` por checkpoint (sustituye al `model.safetensors` del repo original) |

## Arquitectura y entrenamiento

El modelo original Laya es una familia de encoders transformer orientados a clasificacion y decision tipada, no a generacion autoregresiva. Los checkpoints `english` y `typed-decisions` parten de ModernBERT-large, un encoder con atencion alterna global/local y soporte de contexto largo; `multilingual` parte de mmBERT-base, la variante multilingue de la misma familia. Esta ficha no aporta informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF/DPO; esos datos corresponden al modelo base `convaiinnovations/laya`, cuya model card no se ha incluido en la informacion disponible.

La contribucion tecnica de `brishen/laya-burn-q8` es exclusivamente la cuantizacion y el reempaquetado: cada peso lineal se convierte a Q8S (int8 simetrico con una escala float32 por cada 32 entradas consecutivas y cuatro valores empaquetados en un `u32`), un layout elegido porque WGSL no dispone de `i8` ni de `f16` sin `shader-f16`. Burn lee los pesos tal cual y desquantiza dentro del kernel de matmul. Los embeddings de token se dejan en float16 en `english` y `typed-decisions` porque bajarlos a Q8S empeoraba la precision (ver benchmarks), y en `multilingual` si se cuantizan en Q8S. El resto de tensores (normas, sesgos, cabeza de activacion y embedding de tipo) conservan el float16 original. La cuantizacion se hizo con el propio Burn (`Tensor::quantize_dynamic`) mediante el ejemplo `examples/export_q8.rs` de `taconite-laya` (Burn 0.21). Los config y tokenizers se copian sin cambios desde el repositorio upstream.

## Capacidades

- Decision tipada: recibe un estado y preguntas tipadas y devuelve respuestas con una probabilidad calibrada por opcion en una unica pasada.
- Tipos de pregunta soportados (segun ejemplos de la model card y materiales de Laya): `choice` (escoger una opcion con probabilidad por opcion), `score` (nivel esperado) y `noul` (umbral/categoria binaria o similar).
- Clasificacion de alta senal: deteccion de phishing y spam, enrutado de noticias, evaluacion de riesgo de churn y fronteras de confianza.
- Salida probabilistica inspeccionable, sin texto generado.
- Enrutado entre checkpoints: la clase `Router` de Laya conmuta entre `english` y `multilingual`.
- Soporte multilingue a traves del checkpoint `multilingual`.
- Multiples casos por peticion: los casos de referencia incluyen hasta 83 preguntas en una peticion.
- No soporta generacion de texto, tool calling, agentes multi-paso, vision ni audio (por diseno del modelo base).

## Casos de uso

- Deteccion de phishing y spam: se entrega el cuerpo del mensaje como estado y una pregunta tipada de clasificacion; el modelo devuelve la probabilidad por clase sin generar texto, lo que facilita fijar umbrales de bloqueo.
- Enrutado de noticias o tickets: clasificacion en categorias con probabilidades calibradas, util para derivar automaticamente a un equipo o cola sin exponer datos a APIs externas.
- Riesgo de churn en atencion al cliente: como en el ejemplo de la model card (`churn_risk`), se evalua si un cliente amenaza con cancelar a partir del texto del ticket, con una probabilidad que se puede usar para priorizar la intervencion.
- Triaje de correo electronico en local: al ejecutarse en el navegador via WebGPU, permite clasificar correos sensibles en la maquina del usuario, sin enviarlos a un servidor.
- Filtrado de contenido y fronteras de confianza: uso como capa de decision con probabilidades para decidir si un caso se resuelve automaticamente o se escala a revision humana.
- Asistentes de escritorio y extensiones de navegador: integracion via `taconite-laya-web` (JavaScript) o `taconite-laya` (Rust) para ofrecer clasificacion instantanea sin backend ni clave de API.
- Backends Node.js/TypeScript (mediante `receptron/laya`): incorporar decisiones tipadas en servicios existentes del ecosistema JS.
- Evaluacion rapida de modelos: al ser una version int8 ligera, sirve para probar el comportamiento de Laya en hardware limitado antes de invertir en la version float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si aporta el autor es una comparacion de exactitud entre la version cuantizada y el modelo float32 de PyTorch sobre los casos de referencia (7 de `english`, 3 de `multilingual` y 1 de `typed-decisions`, 83 preguntas, peticiones de 236 a 4509 tokens).

| Metrica | Resultado |
|---|---|
| Respuestas modificadas (Q8S final) | 0 |
| Error maximo de probabilidad (Q8S final) | 0.019 (la mayoria por debajo de 0.01) |
| Error maximo en logits de opcion (Q8S final) | 1.04 |

Comparacion con esquemas de cuantizacion mas gruesos medidos por el autor:

| Esquema | Peor error de probabilidad | Respuestas modificadas |
|---|---|---|
| Una escala por fila | 0.11 | 1 |
| 4 bits, escala por 32 | 0.78 | 3 |
| Embedding `english` en Q8S | 0.045 | 0 |
| Q8S final (embedding en float16) | 0.019 | 0 |

Segun el autor, la cuantizacion Q8S ocupa un tercio de la memoria de float32 y se ejecuta a la velocidad de float32 en una Radeon 890M. No se publican cifras de throughput ni de latencia especificas para esta version cuantizada; los materiales de Laya citan 21-33 ms para el modelo original, no necesariamente para esta redistribucion.

## Requisitos de hardware

- Tamano de pesos por checkpoint: `english` 519 MB, `multilingual` 362 MB, `typed-decisions` 519 MB; el repositorio completo ocupa 1.4 GB.
- Consumo de memoria de pesos: al ser int8, ocupa aproximadamente un tercio de la version float32 equivalente (843 MB -> 519 MB en `english`, 644 MB -> 362 MB en `multilingual`). Las cifras exactas de VRAM incluyendo activaciones no estan publicadas.
- GPU de referencia: AMD Radeon 890M (GPU integrada), donde segun el autor corre a velocidad de float32.
- Compatibilidad: cualquier GPU con soporte WebGPU puede ejecutar el modelo desde el navegador; los datos se procesan en la GPU del usuario.
- GPU de consumo: si, el modelo cabe con holgura en GPUs de consumo e incluso en iGPUs compatibles con WebGPU. No requiere A100 ni H100.
- Opciones de despliegue: `taconite-laya-web` (JavaScript, navegador, WebGPU), `taconite-laya` con la feature `webgpu` (Rust), el runtime de Burn (Burn 0.21) y, en el ecosistema JS/TS, `receptron/laya`.
- Latencia y throughput: no publicados para esta version cuantizada. Los materiales del modelo base mencionan decisiones en 21-33 ms, pero corresponden a Laya en general y no a `laya-burn-q8` en concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para `laya-burn-q8` frente a alternativas de la misma categoria. La comparacion mas fiable disponible es contra el propio modelo upstream y su version float32, que es lo que mide el autor.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| brishen/laya-burn-q8 | No disponible (base ModernBERT-large / mmBERT-base) | No especificado (hasta 8192 en la arquitectura base) | burnpack (`.bpk`), int8 Q8S | Apache-2.0 | Cuantizacion del upstream; 519/362/519 MB; WebGPU/Burn |
| convaiinnovations/laya (upstream) | No disponible (base ModernBERT-large / mmBERT-base) | No especificado | safetensors, float32/float16 | Apache-2.0 | Modelo original; 843/644/843 MB |
| TypeSafe Jev | No disponible | No disponible | No disponible | No disponible | Referenciado en los materiales de Laya como la alternativa propietaria; no hay datos tecnicos en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas conversacionales, solo decisiones tipadas con probabilidades. No sirve para chat, resumen ni generacion de codigo.
- Riesgo de alucinacion no aplicable en el sentido clasico (no genera texto), pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento del modelo base.
- La model card no documenta sesgos conocidos, composicion del dataset ni cobertura idiomatica detallada; el checkpoint `multilingual` no especifica que idiomas cubre.
- La cuantizacion introduce un error maximo de probabilidad de 0.019 sobre los casos de referencia, pero dichos casos son solo 11 peticiones y 83 preguntas, por lo que la validacion es limitada y puede no generalizar a todo el espacio de entrada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es una publicacion reciente y poco validada por la comunidad.
- Dependencia de la cadena de herramientas de Burn (`burnpack`, Burn 0.21) y de `taconite-laya` / `taconite-laya-web`; no es un formato portable a llama.cpp, GGUF, vLLM o similares.
- Requiere WebGPU para la ejecucion en navegador; en equipos sin soporte WebGPU habria que recurrir a la ruta nativa en Rust.
- Licencia Apache-2.0, permisiva para uso comercial, pero los derechos del modelo base pertenecen a Convai Innovations y el copyright debe respetarse. Los configs y tokenizers se copian sin cambios desde el upstream.
- El modelo base esta fechado por delante de la fecha de creacion declarada del repositorio (2026-09-29), dato que conviene verificar en el propio hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brishen/laya-burn-q8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Burn: https://burn.dev
- `taconite-laya-web` (navegador): https://github.com/Brishen/taconite/tree/main/taconite-laya-web
- Repositorio `taconite` (Rust, feature `webgpu`): https://github.com/Brishen/taconite
- Sitio de Laya: https://laya.convaiinnovations.com/
- Demo LAYA LAB Q8: https://yasserrmd-laya-lab.static.hf.space/index.html
- Analisis de Laya como alternativa a TypeSafe Jev: https://brainfunctioncollapse.com/laya
- Integracion Node.js/TypeScript: https://github.com/receptron/laya
