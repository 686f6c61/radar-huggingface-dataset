# MECHUK/Tideglass-OrcaRouter-Inkling-2-Mini-A1-GGUF

## Resumen

Tideglass-OrcaRouter Inkling-2-Mini A1 es una cuantizacion GGUF experimental de precision mixta construida por el usuario MECHUK a partir de Inkling-2-Mini, el modelo base desarrollado por Thinking Machines Lab. No se trata de un modelo nuevo entrenado desde cero, sino de un ensamblaje de tensores procedentes de tres fuentes distintas: una cuantizacion Q4_0 verificada de bartowski, una cuantizacion UD-Q4_K_M de Unsloth como donante de precision y una version abliterada de OrcaRouter como donante de atencion.

El resultado es un fichero GGUF de 15,93 GB (14,84 GiB) que conserva la arquitectura original `inkling2_loop` y el tokenizador intactos. El autor lo describe explicitamente como un experimento y advierte de que no debe usarse como sustituto del Q4_0 original. La modificacion consiste en el transplante de 24 tensores de salida de atencion (`attn_output.weight`) desde la variante abliterada, sin reentrenamiento, promediado ni recuantizacion.

La relevancia de esta ficha es acotada: se trata de un derivado de investigacion con cero descargas en el momento de su publicacion y con una evaluacion piloto muy limitada. Su interes tecnico reside en documentar la tecnica de transplante de pesos con PolyStrata y en servir como caso de estudio de cuantizacion mixta sobre hardware RDNA2, no como una opcion recomendada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (GGUF v3) |
| Parametros totales | 26.070.385.152 (26,07 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de precision mixta: Q4_0 base, BF16 (32 tensores sink y convolucion K/V), Q8_0 (embedding completo, 36 proyecciones Q/gate/relative attention en capas fisicas 6-17, y 24 tensores `attn_output` transplantados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 15.933.170.368 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `inkling2_loop` del Inkling-2-Mini original de Thinking Machines Lab. No se ha realizado ningun entrenamiento adicional: el proceso de construccion consistio en el transplante de bytes de tensores ya cuantizados mediante la herramienta PolyStrata, sin reentrenamiento, promediado ni recuantizacion. De los 704 payloads del fichero, 93 cambiaron respecto al Q4_0 base (H0) y 611 permanecieron identicos, incluidos el cabezal de salida/LM y los pesos MoE. Respecto al estado intermedio H3, A1 cambio exactamente 24 payloads.

La innovacion tecnica es puramente de ingenieria de cuantizacion: se combinan tensores de distinta precision (BF16, Q8_0 y Q4_0) en un mismo GGUF conservando los offsets de tensor originales y colocando los reemplazos tras los datos de sus padres. El autor documenta los nombres exactos, tipos, hashes y digests de los padres en `manifest.json`. No hay datos publicados sobre el numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y generacion de codigo: el autor valida 4/4 comprobaciones criticas de chat con Python, Rust, JSON y salida de herramienta simulada, aunque no se ejecuto el codigo ni las llamadas generadas.
- Soporte de tool calling simulado a nivel de formato de salida (verificado en las pruebas del autor, sin ejecucion real).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision: el autor indica explicitamente que no se reclama validacion para vision.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre cuantizacion mixta: el fichero sirve para estudiar el impacto de combinar precisiones BF16/Q8_0/Q4_0 en un mismo GGUF y medir la degradacion con NLL sobre documentos fijos, replicando la metodologia del autor.
- Estudio de transplante de pesos entre derivados: permite analizar como afecta el transplante de 24 tensores de atencion a la perplejidad y al comportamiento conversacional, comparando contra H0 y H3.
- Pruebas de compatibilidad de runtimes GGUF: util para verificar el soporte de la arquitectura `inkling2_loop` en motores de inferencia y backends concretos, dado que el autor solo valida PolyStrata con HIP `gfx1031` en una RX 6700 XT.
- Experimentacion en hardware consumer RDNA2: al caber en 16 GB de VRAM en su cuantizacion Q4_0 dominante, permite probar modelos de 26B en GPUs de gama media AMD.
- Evaluacion de formatos de salida estructurada: los checks de JSON y tool output simulado lo hacen util como banco de pruebas de plantillas de chat y esquemas de funcion, sin garantia de ejecucion correcta.
- Docencia y divulgacion sobre derivados de modelos: sirve como ejemplo documentado de cadena de custodia de pesos (bartowski, Unsloth, OrcaRouter) y de las advertencias eticas asociadas a las variantes abliteradas.

## Benchmarks y rendimiento

| Metrica | A1 (este modelo) | H0 (Q4_0 base) | H3 (hibrido de precision) |
|---|---|---|---|
| NLL media exacta (nat/token, 8 documentos de 2K/16K, 2.048 tokens puntuados) | 1,102403 | 1,093820 | 1,089813 |
| Documentos en los que es peor que H0 | 6 de 8 | referencia | referencia |
| Checks criticos de chat superados | 4/4 (Python, Rust, JSON, tool output simulado) | no disponible | no disponible |
| Prompts benignos de diagnostico cumplidos (piloto `low`) | no disponible | 12/12 | 12/12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor califica la evaluacion como un piloto pequeno y no como una estimacion general de calidad. No hay reclamacion de velocidad ni de reduccion de rechazos.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 15,93 GB, por lo que requiere al menos 16 GB de VRAM para cargar los pesos en memoria; el autor advierte que el tamano del fichero no es un requisito de memoria de GPU.
- GPU validadas: AMD Radeon RX 6700 XT (RDNA2, `gfx1031`) mediante PolyStrata `strata-poly` Release HIP. No se reclama validacion para otras GPUs, backends ni vision.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encaja en GPUs consumer de 16 GB o mas y en aceleradores de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo, RX 6700 XT, RX 6800, RX 6900 XT, RTX 4060 Ti 16 GB, RTX 4080, RTX 4090).
- Opciones de despliegue: PolyStrata es el unico runtime verificado. Cualquier motor que soporte la arquitectura `inkling2_loop` podria cargarlo, pero no hay validacion publicada para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles; el autor no ejecuto la medicion de tiempos de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NLL piloto (nat/token) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tideglass-OrcaRouter Inkling-2-Mini A1 (este) | 26,07B | no disponible | 1,102403 | Apache 2.0 | GGUF, repo con 0 descargas |
| Inkling-2-Mini Q4_0 (bartowski, H0) | 26,07B | no disponible | 1,093820 | Apache 2.0 | GGUF en HF |
| Inkling-2-Mini UD-Q4_K_M (Unsloth, H3) | 26,07B | no disponible | 1,089813 | Apache 2.0 | GGUF en HF |
| Inkling-2-Mini abliterated Mix-16G (OrcaRouter) | 26,07B | no disponible | no disponible | Apache 2.0 | GGUF en HF |

Las tres alternativas comparten el mismo modelo base y tamano; la diferencia radica en la estrategia de cuantizacion y, en el caso de OrcaRouter, en la abliteracion. En el piloto del autor, A1 obtiene peor NLL que H0 y H3, por lo que no hay evidencia de mejora de calidad frente a las cuantizaciones convencionales.

## Limitaciones y advertencias

- El propio autor desaconseja su uso como sustituto del Q4_0 original; es un experimento, no una version de produccion.
- El transplante procede de una variante abliterada, pero el autor no reclama reduccion de rechazos ni recreacion de la abliteracion completa de OrcaRouter.
- La evaluacion es un piloto de 8 documentos y 4 checks de chat; no constituye una estimacion general de calidad.
- A1 empeora la NLL respecto a H0 en 6 de 8 documentos, lo que sugiere cierta degradacion en modelado de lenguaje.
- No se valido la ejecucion del codigo ni de las llamadas a herramienta generadas.
- Solo se valido en PolyStrata con HIP `gfx1031` sobre RX 6700 XT; no hay garantia en otros motores, GPUs o backends.
- No hay validacion para vision ni datos sobre sesgos, alucinacion o cobertura idiomatica.
- El modelo base tiene una politica de uso aceptable propia que debe respetarse ademas de la licencia Apache 2.0.
- Al ser un derivado experimental sin validacion de seguridad, requiere salvaguardas a nivel de aplicacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MECHUK/Tideglass-OrcaRouter-Inkling-2-Mini-A1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion Q4_0 de bartowski: https://huggingface.co/bartowski/Inkling-2-Mini-GGUF
- Cuantizacion UD-Q4_K_M de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Variante abliterada de OrcaRouter: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-GGUF
- Herramienta PolyStrata: https://github.com/0FL01/PolyStrata
- Informe de evaluacion y decision: https://github.com/0FL01/PolyStrata/blob/c0dd0e52/docs/goals/inkling2-weights/f0-precision-report.md
- Baseline de bajo esfuerzo: https://github.com/0FL01/PolyStrata/blob/c0dd0e52/docs/goals/inkling2-weights/orca-low-baseline-report.md
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
