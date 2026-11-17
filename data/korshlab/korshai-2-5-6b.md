# KorshLAB/KorshAI-2.5-6B

## Resumen

KorshAI 2.5 6B es un modelo de lenguaje orientado a generacion de codigo y razonamiento tecnico, publicado por KorshLAB (con mencion a la Korsh Foundation) bajo licencia Apache 2.0. Se presenta como un modelo "compacto" especializado en programacion de sistemas (C11, C++20, Rust, Go), desarrollo backend (Python, TypeScript) y diseno de interfaces web modernas con Tailwind CSS. Aunque la model card lo denomina "6B", el recuento real de parametros en los pesos safetensors es de 4.326.350.848, es decir, aproximadamente 4,3 mil millones de parametros.

El modelo incorpora dos rasgos distintivos: por un lado, un modo de razonamiento estructurado mediante bloques `<thought> ... </thought>` en los que explora casos limite, invariantes y semantica de concurrencia antes de emitir codigo; por otro, un formato de refactorizacion quirurgica basado en bloques SEARCH/REPLACE, pensado para producir diffs aplicables sobre ficheros existentes en lugar de reescribir archivos completos. El repositorio incluye pesos en formato GGUF (cuantizaciones Q6_K y Q8_0 documentadas) y declara compatibilidad con endpoints de tipo OpenAI a traves de `llama-server`.

Es relevante ahora porque cubre un nicho concreto: modelos pequenos, desplegables en GPU de consumo (6-8 GB de VRAM), con enfasis explicito en codigo de sistemas y en flujos de edicion de codigo tipo agente. La escasez de senales de adopcion (0 descargas y 0 likes en el momento de la consulta) y la ausencia de benchmarks publicados obligan a tratar sus afirmaciones de rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla variante; no se especifica si es denso o MoE) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 B; la model card lo comercializa como "6B") |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (valor usado en los ejemplos de la model card; no se declara maximo oficial) |
| Tipos de cuantizacion | GGUF Q6_K (3,32 GB) y Q8_0 (4,29 GB) documentados; safetensors en el repo |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un modelo de generacion de texto tipo transformer. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion (no hay mencion a atencion lineal, sliding window ni decodificacion especulativa), ni si emplea mezcla de expertos. El campo `base_model` de la model card aparece vacio, por lo que no se declara un modelo base a partir del cual se haya derivado.

Tampoco se publican datos sobre el corpus de entrenamiento: no hay cifra de tokens, composicion del dataset, ni confirmacion de fases de RLHF, DPO o ajuste por preferencias. La unica informacion cualitativa es la orientacion del entrenamiento hacia codigo de sistemas (C, C++, Rust, Go), backend (Python, TypeScript) y UI con Tailwind CSS, ademas de un formato de chat basado en las etiquetas `<|im_start|>` / `<|im_end|>` (estilo ChatML) y un modo de razonamiento delimitado por `<thought>`. Todo lo relativo a datos de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto y codigo en C11, C++20, Rust, Go, Python y TypeScript, con enfasis declarado en seguridad de memoria, RAII, borrow checker y concurrencia asincrona (Tokio, goroutines).
- Razonamiento estructurado mediante bloques `<thought>`, orientado a validacion de invariantes, casos limite y semantica de concurrencia antes de responder.
- Refactorizacion quirurgica con bloques SEARCH/REPLACE, disenada para producir diffs aplicables sobre ficheros existentes.
- Generacion de interfaces web con Tailwind CSS, paletas OKLCH, glassmorphism y disenos tipo Bento Grid, segun la model card.
- Soporte de conversacion multi-turno con formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Compatibilidad con API de tipo OpenAI mediante `llama-server` (`endpoints_compatible` en los tags).
- Capacidades multilingues limitadas a ingles y espanol.
- No se declara soporte de tool calling, function calling, vision, audio ni agentes multi-paso de forma explicita.

## Casos de uso

- Refactorizacion de codigo en produccion: el modelo emite bloques SEARCH/REPLACE que pueden aplicarse directamente sobre el arbol de trabajo, lo que lo hace adecuado para integrarse en pipelines de revision o en herramientas de edicion asistida sin reescribir ficheros completos.
- Asistencia en programacion de sistemas: generacion de primitivas concurrentes (mutex lock-free, colas concurrentes, alineacion de cache) en C11 y C++20, aprovechando el modo `<thought>` para razonar sobre condiciones de carrera y limites de memoria.
- Migracion y modernizacion de codigo Rust y Go: reescritura de fragmentos para cumplir el borrow checker o para sustituir patrones de bloqueo por alternativas con cancelacion de contexto, usando el formato de diff para minimizar cambios.
- Generacion de backends Python con FastAPI y Pydantic: produccion de esquemas estrictos y pipelines asincronos de alto rendimiento, con contexto de 8192 tokens suficiente para modulos de tamano medio.
- Desarrollo de interfaces con Tailwind CSS: generacion de componentes con paletas OKLCH, micro-bordes y desenfoques de fondo, orientado a prototipado rapido de UI modernas.
- Despliegue en entornos con GPU de consumo: al caber en 6-8 GB de VRAM con Q6_K o Q8_0, puede ejecutarse en estaciones de trabajo con una unica RTX 4090 o similar para tareas de autocompletado y revision de codigo en local.
- Servicio de API compatible con OpenAI: mediante `llama-server` puede exponerse como endpoint compatible y sustituir a APIs externas en flujos internos de generacion de codigo.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Solo incluye metricas de velocidad de inferencia declaradas por el autor:

| Runtime / cuantizacion | Procesamiento de prompt (tok/s) | Velocidad de generacion (tok/s) | VRAM recomendada |
|---|---|---|---|
| Q6_K (3,32 GB) | 1.800,6 | 88,3 | 6 GB - 8 GB |
| Q8_0 (4,29 GB) | 1.720,0 | 82,5 | 8 GB |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6-8 GB para Q6_K (3,32 GB de pesos) y 8 GB para Q8_0 (4,29 GB), segun la model card; el margen adicional cubre cache KV para contexto de 8192 tokens.
- GPU recomendadas: no se especifican modelos concretos; por el rango de VRAM, encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, asi como en A100/H100 si se busca mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM.
- Opciones de despliegue: `llama.cpp` (CLI `llama-cli` y servidor `llama-server` con API compatible OpenAI), `llama-cpp-python`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: los unicos datos son los declarados en la tabla anterior (hasta 1.800 tok/s de procesamiento de prompt y 88,3 tok/s de generacion con Q6_K); no se especifica el hardware empleado para medirlos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo que permitan una comparacion de rendimiento fiable. A continuacion se comparan caracteristicas objetivas con alternativas de tamano y proposito similares (los datos de los competidores corresponden a sus fichas publicas habituales y deben verificarse):

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| KorshAI 2.5 6B | 4,3 B (nominal 6B) | 8192 (segun ejemplos) | Apache 2.0 | Codigo de sistemas y UI |
| Qwen2.5-Coder-7B | 7,6 B | 32.768 | Apache 2.0 | Codigo general |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos, MoE) | 128.000 | Licencia propia | Codigo general |
| CodeLlama-7B | 6,7 B | 16.384 | Llama 2 custom | Codigo general |

La comparacion de rendimiento con estos modelos no esta disponible porque KorshAI 2.5 6B no publica resultados de benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad publicados: las afirmaciones de "frontier-grade" y "compiler-vetted" de la model card no estan respaldadas por datos verificables.
- Discrepancia entre el nombre comercial ("6B") y el recuento real de parametros (4,3 B): conviene usar el dato de safetensors para estimaciones de memoria y capacidad.
- Senales de adopcion nulas (0 descargas, 0 likes) en el momento de la consulta, lo que impide validar el modelo mediante feedback de la comunidad.
- No se documentan datos de entrenamiento, arquitectura interna ni proceso de alineacion, lo que limita la evaluacion de sesgos y riesgos.
- Riesgo de alucinacion inherente a los modelos de codigo: puede generar APIs inexistentes, firmas incorrectas o diffs que no compilan; requiere validacion con compilador y tests.
- Cobertura linguistica limitada a ingles y espanol; no se declara soporte de otros idiomas.
- Contexto de 8192 tokens segun los ejemplos: insuficiente para repositorios grandes o ficheros muy extensos, lo que puede degradar la calidad en tareas de refactorizacion de gran alcance.
- No se declara soporte explicito de tool calling ni de flujos de agente multi-paso, pese a los tags de "reasoning" y "cot".
- Licencia Apache 2.0 permite uso comercial, pero al no haber garantias ni validacion externa, el uso en produccion debe acompanarse de evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KorshLAB/KorshAI-2.5-6B
- Sitio web de KorshLab: https://korshlab.space
- Ecosistema Korsh Foundation: https://korsh.org
- Banner del modelo: https://huggingface.co/KorshLAB/KorshAI-2.5-6B/resolve/main/banner.jpg
