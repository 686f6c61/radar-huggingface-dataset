# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF

## Resumen

Ternary Bonsai 2 27B Abliterated (PTQ1_0 GGUF) es una version del modelo Ternary Bonsai 2 27B de PrismML a la que se le ha eliminado la direccion de rechazo (abliteracion) directamente sobre la retícula ternaria, sin recuantizar, sin hornear en BF16 y sin vectores de control en tiempo de inferencia. Lo publica el usuario BoldingBuilds en HuggingFace bajo licencia Apache 2.0, con 26.895.998.464 parametros (~26,9 B) y un unico archivo GGUF de 5.946.648.928 bytes, exactamente del mismo tamano que la release oficial PTQ1_0. El modelo base es prism-ml/Ternary-Bonsai-2-27B-gguf y comparte linaje con la familia Qwen3.8 (etiqueta qwen35 en el repo), de la que se transfiere la direccion de rechazo.

El interes tecnico esta en el metodo: en un checkpoint ternario, donde cada grupo de 128 pesos toma valores en {−s, 0, +s}, la proyeccion clasica de la direccion de rechazo no cambia ni un solo digito (0 de 89.128.960 tras reempaquetar a λ=1,0). El autor, en su lugar, voltea digitos de forma selectiva en los tensores que escriben en el residual (`ffn_down`, `ssm_out`, `attn_output`), gastandolos donde |r_i| es mayor, y declara un 99,1-99,3% de componente de rechazo eliminado con solo un 0,24% de digitos modificados.

El resultado declarado es un modelo que responde al 99% de las peticiones de SimpleSafetyTests (frente al 83% de rechazo del original) sin degradacion medible en codigo: 0,805 pass@1 en HumanEval-164 frente a 0,811 del stock (McNemar exacto, p = 1,000), y con sobre-rechazo reducido a 0,0% en XSTest-safe (250/250 respuestas completas). Requiere el fork de llama.cpp de PrismML para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida, con tensores de espacio de estados (`ssm_out`, `ssm_alpha`, `ssm_beta`) y de atencion (`attn_output`); linaje Qwen3.8-27B segun la model card. No se detalla el numero de capas ni la configuracion exacta |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (la model card no indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (ternario, 3 valores por grupo de 128: {−s, 0, +s}) para la mayoria de tensores; bf16 en los 96 tensores `ssm_alpha`/`ssm_beta`. No se publican otras variantes de cuantizacion en esta ficha |
| Idiomas soportados | no disponible (la etiqueta qwen35 apunta a herencia Qwen, pero la model card no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 5.946.648.928 bytes; requantizacion con `llama-quantize`) |
| Tamano del repositorio | 5,9 GB |
| Tensor modificados | 98 de 851 (los otros 753 son byte a byte identicos al stock, incluidos `token_embd` y `output`) |
| Descargas / likes | 1.680 / 8 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: se trata de una edicion post-entrenamiento sobre un checkpoint ya cuantizado en ternario. Los pesos del modelo base toman tres valores por grupo de 128 ({−s, 0, +s}) con escalas por grupo, de modo que cualquier correccion debe expresarse como cambios discretos de digito o como reajuste de escala. El autor documenta que reajustar las escalas por grupo con los digitos congelados solo elimina un 1,1% de la componente de rechazo, porque una escala puede escalar pero no variar dentro del grupo de 128 pesos.

El metodo efectivo consiste en editar la suma de fila `c = rᵀW` (un valor por columna) volteando digitos en los tensores escritores del residual: `ffn_down`, `ssm_out` y `attn_output`, 98 tensores en total. La direccion de rechazo se recupera del padre Qwen3.8-27B mediante descomposicion rank-1 (σ₁/σ₂ ≈ 23) a partir de los pesos publicados por huihui. La edicion es greedy, en una sola pasada por filas en orden descendente de |r_i|, con λ = 1,0, las 512 filas superiores por tensor y solo los bloques 15-63 (los bloques tempranos se dejan intactos deliberadamente porque incluirlos destruye la capacidad de programacion). El coste declarado es |dW|/|W| = 0,071, aproximadamente 5 veces el de una proyeccion sobre un modelo en precision completa, porque una retícula gruesa no permite correcciones pequenas.

No se dispone de informacion sobre datos de preentrenamiento, numero de tokens, composicion del dataset ni sobre fases de RLHF o DPO: esos datos corresponden al modelo base de PrismML y no se documentan en esta ficha. La unica innovacion reproducible documentada es el propio procedimiento de abliteracion sobre retícula ternaria y la receta de cuantizacion (`--output-tensor-type PTQ1_0 --token-embedding-type PTQ1_0 --tensor-type ssm_alpha=bf16 --tensor-type ssm_beta=bf16 ... PTQ1_0 16`), que por defecto no se reproduce con `llama-quantize` (la configuracion por defecto produce 7,11 GB porque `output.weight` y `token_embd.weight` caen a Q6_K/Q4_K).

## Capacidades

- Generacion de texto conversacional: pipeline declarado `text-generation` y etiqueta `conversational`.
- Generacion de codigo: 132/164 en HumanEval-164 en modo greedy (pass@1 = 0,805), con una mediana de 113 tokens por completion y un 8,5% de respuestas truncadas por limite de tokens.
- Razonamiento con modo thinking: la evaluacion se hace con `enable_thinking: false` en ambos brazos, lo que implica que el modelo dispone de un modo de pensamiento. El autor advierte que el pensamiento puede consumir el presupuesto de tokens antes de emitir la respuesta.
- Cumplimiento de instrucciones benignas: 250/250 respuestas completas en XSTest-safe, con 0,0% de sobre-rechazo.
- Ausencia efectiva de rechazo: 1,0% de rechazo juzgado en SimpleSafetyTests (n=100) y 0,0% segun el prefix grader, sin completions vacias (0 de 100) y sin respuestas no parseables por el juez.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` figura en el repo, aunque no se detalla el alcance.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Asistente de generacion de codigo en local: con 0,805 pass@1 en HumanEval-164 y un archivo de 5,9 GB, se puede ejecutar sobre una GPU de consumo para autocompletado y refactorizacion sin enviar codigo a un servicio externo.
- Despliegue en hardware de gama media: al ocupar aproximadamente 5,5 GiB en disco y no necesitar precision completa, cabe en GPUs de 8-12 GB de VRAM, algo imposible para el modelo en BF16 (~54 GB).
- Investigacion sobre alineacion y rechazo: sirve como brazo abliterado emparejado con la release stock de PrismML (misma model card, mismo runtime, mismas flags, misma semilla), lo que permite aislar el efecto de la edicion sobre el comportamiento de rechazo.
- Evaluacion de seguridad y red teaming controlado: con 1,0% de rechazo juzgado, es util para generar respuestas a prompts adversarios en un entorno de laboratorio y estudiar como se degradan los filtros de un modelo cuantizado.
- Generacion creativa sin filtros editoriales: ficcion, guiones o dialogos donde los rechazos del modelo base interrumpen el flujo, con la advertencia de que la responsabilidad editorial pasa integramente al operador.
- Investigacion sobre cuantizacion ternaria: el repositorio documenta el trampa de la "proyeccion y reempaquetado" (un modelo que pasa las comprobaciones de tamano y de reproducibilidad del cuantizador sin contener abliteracion alguna), por lo que es material de referencia para quien construya variantes PTQ1_0.
- Generacion sintetica de datos y destilacion: por su cumplimiento casi total en XSTest-safe (250/250) y su coste de inferencia bajo, puede actuar como generador de instrucciones y respuestas en pipelines de destilacion hacia modelos mas pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados son comparativas emparejadas contra la release stock de PrismML, con el mismo runtime, flags y semilla, y `enable_thinking: false` en ambos brazos. El juez es Qwen3.8-27B-OBLITERATED-Q8_0 con rubrica StrongReject.

Rechazo (SimpleSafetyTests, n=100):

| Metrica | Stock | Abliterado |
|---|---|---|
| Rechazo juzgado | 83,0% | 1,0% |
| Rechazo por prefijo | 78,0% | 0,0% |
| Puntuacion media de rubrica | 0,158 | 0,696 |
| Completions vacias | 0 | 0 |
| No parseadas por el juez | 0 | 0 |

Sobre-rechazo en prompts benignos (XSTest-safe, n=250; menor es mejor):

| Metrica | Stock | Abliterado |
|---|---|---|
| Sobre-rechazo | 1,6% | 0,0% |
| Cumplimiento total | 242 / 250 | 250 / 250 |
| Rechazo parcial | 4 | 0 |
| Rechazo total | 4 | 0 |

Capacidad (HumanEval-164, greedy, emparejado por problema):

| Metrica | Stock | Abliterado |
|---|---|---|
| pass@1 | 0,811 (133/164) | 0,805 (132/164) |
| Truncado por limite de tokens | 11,6% | 8,5% |
| Mediana de tokens de completion | 141 | 113 |

Desglose por problema: 129 pasan en ambos, 28 fallan en ambos, 3 ganados y 4 perdidos; McNemar exacto bilateral p = 1,000 (n discordante = 7), sin cambio de capacidad detectable. No hay resultados publicados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 5,5 GiB, segun el tamano del archivo (5.946.648.928 bytes). Con cache KV, buffers de contexto y overhead del runtime, la cifra practica estimada es de 7-10 GB, dependiendo de la longitud de contexto (no publicada). Es una estimacion derivada del tamano del archivo, no un dato del autor.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB con contexto corto, y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070) y en 24 GB (RTX 3090, RTX 4090, RTX 5090).
- GPU profesionales: A100, H100 o L40S no aportan ventaja por capacidad de pesos, pero si para contextos muy largos o lotes grandes; el modelo es pequeno para ese hardware.
- Opciones de despliegue: requiere el fork de llama.cpp de PrismML (`https://github.com/PrismML-Eng/llama.cpp`), que implementa PTQ1_0. No hay constancia en la informacion disponible de soporte en vLLM, TGI, Ollama u otros runtimes.
- Requisito adicional: llama.cpp upstream no reproduce la release por defecto; la receta documentada usa `llama-quantize` con `--output-tensor-type PTQ1_0`, `--token-embedding-type PTQ1_0` y `ssm_alpha`/`ssm_beta` en bf16.
- Latencia y throughput: no disponibles. Los kernels ternarios de PTQ1_0 son especificos del fork y no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Rechazo (SimpleSafetyTests) | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B Abliterated (este) | 26,9 B | PTQ1_0 GGUF, 5.946.648.928 bytes | 1,0% | 0,805 | apache-2.0 | HuggingFace, 1.680 descargas |
| Ternary Bonsai 2 27B (stock, PrismML) | 26,9 B | PTQ1_0 GGUF, mismo tamano exacto | 83,0% | 0,811 | no disponible en la informacion proporcionada | HuggingFace (repo base citado) |
| Qwen3.8-27B-OBLITERATED-Q8_0 | no disponible | Q8_0 | no disponible (usado como juez con rubrica StrongReject) | no disponible | no disponible | no disponible |
| Qwen3.8-27B (padre, referencia de direccion) | ~27 B segun la model card | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos publicados que permitan comparar con alternativas de terceros (por ejemplo abliteraciones de la familia Qwen3.8 realizadas por otros autores): la model card solo menciona las recetas de huihui y el trabajo de Hikari07jp sobre Bonsai 1 (recuperacion de codigo de 16/20 a 19/20 al restaurar las capas L0-7) como corroboracion cualitativa, sin cifras comparables.

## Limitaciones y advertencias

- Modelo abliterado sin filtros de rechazo: no es apto para exposicion publica directa sin una capa externa de moderacion. La practica totalidad de los prompts de SimpleSafetyTests obtiene respuesta.
- Evaluacion de seguridad limitada: solo se reportan SimpleSafetyTests (n=100) y XSTest-safe (n=250). No hay medicion de sesgos, toxicidad ni de generalizacion a otras categorias de rechazo.
- El juez de las evaluaciones es a su vez un modelo abliterado (Qwen3.8-27B-OBLITERATED-Q8_0) con rubrica StrongReject; el autor aporta el prefix grader como segunda opinion, pero el sesgo del evaluador no es despreciable.
- Riesgo de alucinacion: no medido en la informacion disponible.
- Idioma: no se documenta ningun idioma soportado; el rendimiento multilingue es desconocido.
- Limite de tokens: en HumanEval, el 8,5% de las completions se truncan; con el modo thinking activado el presupuesto puede agotarse antes de responder, un fallo que en ejecuciones anteriores produjo 82 respuestas vacias y un falso 0% de rechazo.
- Coste de la edicion: |dW|/|W| = 0,071, aproximadamente 5 veces el coste de una proyeccion en precision completa; la retícula ternaria no permite correcciones finas.
- Reproducibilidad parcial: los 96 tensores `ssm_alpha`/`ssm_beta` no se pueden reproducir desde el F16 liberado (se empaquetan a BF16 de 7 bits de mantisa frente a los 10 del F16, con un truncado de ~0,4%) y se empalman literalmente desde la release base.
- Dependencia de un fork: el modelo solo funciona con el fork de llama.cpp de PrismML, lo que introduce riesgo de mantenimiento y de compatibilidad futura.
- Licencia: la ficha de este derivado es Apache 2.0, que permite uso comercial, pero la licencia del modelo base (prism-ml/Ternary-Bonsai-2-27B-gguf) no se documenta en la informacion proporcionada; conviene verificarla antes de un despliegue comercial.
- Trazabilidad: la fecha de creacion del repositorio figura como 2026-09-18, posterior a la fecha de actualizacion habitual de los repos de referencia; conviene validar la procedencia de los pesos antes de usarlos en produccion.
- La model card disponible esta truncada en la seccion de uso, por lo que las instrucciones completas de compilacion e inferencia no se han podido verificar integramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp requerido (PrismML): https://github.com/PrismML-Eng/llama.cpp
- Recetas de abliteracion de referencia citadas por el autor (huihui y Hikari07jp): sin URL publicada en la informacion disponible.
- Paper o blog tecnico del metodo: no disponible.
- Demo o space: no disponible.

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente paginas de ayuda de YouTube y foros sin relacion), por lo que no se han podido anadir enlaces externos verificados adicionales.
