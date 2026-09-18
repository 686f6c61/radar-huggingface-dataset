# IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF

## Resumen

KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2-GGUF es una cuantización GGUF artesanal del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de una receta de cuantización tensor a tensor diseñada específicamente para arquitecturas MoE híbridas orientadas a código agéntico. El modelo base emplea la arquitectura `Qwen3_5MoeForConditionalGeneration`, con 40 capas, 256 micro-expertos de dimensión intermedia 512 y 8 expertos activos por token.

El resultado es un fichero de 14,64 GB (13,64 GiB) con 3,38 BPW que, según el autor, cabe completo en GPUs de 24 GB manteniendo la ventana de contexto de 256K, o funcionar con offload agresivo a RAM DDR4/DDR5 en portátiles. El modelo totaliza 34.660.610.688 parámetros (unos 34,66 B), de los cuales aproximadamente 3,2 B se activan por token, lo que le permite ofrecer un rendimiento de decodificación propio de un modelo pequeño con capacidad de razonamiento de escala 35B.

La relevancia actual de esta ficha es doble: por un lado, documenta una alternativa práctica para ejecutar un modelo de código de 35B en hardware de consumo; por otro, conviene señalar que el propio autor la etiqueta como edición "legacy", sustituida por una revisión V2.1 anunciada pero aún no publicada en el momento de redactar esta ficha. La licencia declarada es Apache 2.0 y los idiomas soportados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE, 40 capas, 256 micro-expertos, dimension intermedia 512, 8 expertos activos por token) |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 B) |
| Parametros activos | Aproximadamente 3,2 B por token (MoE) |
| Longitud de contexto | 256K tokens (segun el autor; soporte completo declarado en 24 GB de VRAM) |
| Tipos de cuantizacion | GGUF mixta: IQ3_S / IQ4_NL en capas de frontera, IQ3_XXS + imatrix en expertos del nucleo, F32 en gates del router, Q6_K en la cabeza de salida. 3,38 BPW |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `KAT-Coder-V2.5-Dev.APEX-I-MiniPlus-V2.gguf`, 14,64 GB / 13,64 GiB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.). Lo que si se detalla es la arquitectura: un transformer MoE de 40 capas con 256 micro-expertos de dimension intermedia 512 y enrutamiento que activa 8 expertos por token. Esta granularidad fina de expertos es caracteristica de las arquitecturas Qwen3.5-MoE y es la razon por la que el autor insiste en que las cuantizaciones planas degradan el enrutamiento y la sintaxis del codigo generado.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion. Frente a los bots que aplican una reduccion uniforme de bits, APEX-I-MiniPlus-V2 usa reglas definidas tensor a tensor: los expertos compartidos se mantienen en `IQ4_NL` (codebook no lineal), los expertos del nucleo se comprimen a `IQ3_XXS` calibrado con importance matrix (imatrix), las capas de atencion periodicas se elevan a `IQ3_S`/`IQ4_NL`, los gates del router se dejan sin comprimir en `F32` para evitar deriva en el enrutamiento y la cabeza de salida se mantiene en `Q6_K` para preservar la precision sintactica. El autor anuncia ademas una revision V2.1 con expertos compartidos en `Q5_K`, anclas de atencion en `Q4_K`/`Q6_K` y escalas recurrentes en `F32`.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis declarado en precision sintactica, llaves y indentacion correctas.
- Refactorizacion y verificacion de sintaxis sobre fragmentos largos de codigo.
- Razonamiento logico y de multiples pasos, orientado a tareas de ingenieria de software.
- Flujo agéntico: el modelo base y la etiqueta del repositorio (`agentic`) apuntan a uso en pipelines de agentes con llamadas a herramientas, aunque la model card no detalla el soporte explicito de tool calling ni de function calling.
- Contexto largo de 256K tokens para trabajar con varios ficheros o repositorios completos en una sola ventana.
- Capacidades multilingues limitadas a ingles y chino, tanto en prompts como en generacion.
- Conversacion multiturno (etiqueta `conversational` en el repositorio).
- Ejecucion local en llama.cpp, con perfil de memoria disenado para evitar OOM en GPUs de 16 GB y 24 GB.

## Casos de uso

- Asistente de codigo en portatil sin GPU dedicada: con 13,64 GiB de pesos, el modelo puede ejecutarse con offload mayoritario a DDR4/DDR5 y mantener velocidades de streaming declaradas de 24 a 28+ tok/s, lo que hace viable un asistente de programacion local en equipos de gama media.
- Refactorizacion de bases de codigo extensas: la ventana de 256K tokens permite introducir varios modulos simultaneamente y pedir cambios coherentes entre ellos, algo inviable con modelos de contexto de 8K o 32K.
- Revision de codigo automatizada: el sesgo de la receta hacia la precision sintactica y los brackets lo hace adecuado para detectar errores de sintaxis, indentacion incorrecta y problemas de compilacion antes de llegar al CI.
- Agentes de ingenieria de software multi-paso: con 3,2 B de parametros activos, el coste por token es bajo, lo que reduce el coste de ejecutar bucles agénticos largos con muchas iteraciones de planificacion, edicion y ejecucion de tests.
- Generacion de tests y documentacion: dado un modulo completo en contexto, el modelo puede producir baterias de pruebas y documentacion de API en ingles o chino sin salir del equipo local.
- Despliegue en 24 GB de VRAM con contexto completo: segun el autor, el build permite cargar los 256K de contexto en una GPU de 24 GB, habilitando analisis de repositorios enteros con latencia de GPU y sin fragmentacion por CPU.
- Traduccion tecnica ingles-chino de codigo, comentarios y documentacion dentro de equipos con ambos idiomas.
- Servidor de inferencia local para equipos de desarrollo: al ser GGUF, se puede exponer mediante `llama-server` y consumirse como API compatible con OpenAI para herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones tituladas "Comparative Quantization Analysis", "Everyday Laptop Benchmarks (DDR4 / DDR5 RAM)" y "Hardware Throughput Projections (RTX 30 / 40 / 50)", pero el contenido proporcionado esta truncado y no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. Los unicos datos numericos de rendimiento declarados por el autor son los de velocidad de decodificacion bajo offload agresivo: entre 24 y 28+ tok/s en configuracion de VRAM minima con el grueso de los pesos en DDR4.

## Requisitos de hardware

- VRAM estimada: 13,64 GiB solo para los pesos en precision de la cuantizacion. Hay que anadir el cache KV correspondiente al contexto utilizado; para 256K tokens el autor afirma que cabe en 24 GB, pero no se proporciona el desglose exacto de memoria del cache.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090, A100 40 GB, etc.): escenario objetivo para contexto completo de 256K segun el autor.
- GPU de 16 GB: el modelo esta disenado explicitamente para evitar OOM en este segmento, presumiblemente con contexto reducido o con parte de los pesos en RAM del sistema.
- GPU de consumo con menos de 16 GB: viable con offload a RAM del sistema, a costa de velocidad; el autor cita 24-28+ tok/s en configuraciones de VRAM minima y DDR4.
- CPU y RAM: ejecutable en portatiles con DDR4/DDR5, que es el escenario de los "everyday laptop benchmarks" mencionados en la model card.
- Opciones de despliegue: llama.cpp (etiqueta explicita del repositorio), `llama-server` para exponer API, y cualquier frontend compatible con GGUF que use llama.cpp como backend. No se menciona soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponible mas alla de los 24-28+ tok/s declarados bajo offload agresivo. La model card anuncia proyecciones para RTX 30/40/50, pero las cifras no aparecen en el extracto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2 (este) | 34,66 B totales, ~3,2 B activos | 256K | GGUF, 14,64 GB, 3,38 BPW | Apache 2.0 | Cuantizacion artesanal con imatrix, routers en F32 y salida en Q6_K |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | 34,66 B totales, ~3,2 B activos | no disponible en la informacion proporcionada | safetensors (precision original) | Apache 2.0 | Modelo original sin cuantizar; requiere hardware muy superior |
| APEX-I-Mini generico (comunidad) | 34,66 B totales | no disponible | GGUF de 2 bits | Apache 2.0 (presumible) | Expertos a IQ2_S y salida en Q3_K_M; el autor reporta picos de perplejidad y sintaxis rota |
| Cuantizacion plana Q3_K_S / IQ3_S | 34,66 B totales | no disponible | GGUF de 3 bits | Apache 2.0 (presumible) | Reduccion uniforme de bits; el autor la situa por debajo de este build en calidad |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada; las diferencias de calidad descritas proceden de la propia model card del autor y no de una evaluacion independiente.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo original: introduce perdida de precision frente a los pesos completos. El autor afirma que la perdida es menor que en cuantizaciones planas, pero no aporta mediciones publicas de perplejidad.
- La model card se autodenomina "edicion legacy". Existe una revision V2.1 anunciada como definitiva con mejoras en expertos compartidos, anclas de atencion, escalas recurrentes en F32 y velocidad de offload; puede no tener sentido desplegar esta V2 en produccion si V2.1 esta disponible.
- Solo ingles y chino. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en equipos hispanohablantes sin prompts en ingles.
- Las capacidades agénticas y de tool calling se infieren de las etiquetas del repositorio, no de una especificacion detallada en la model card. Conviene validarlas antes de integrarlo en un pipeline de agentes.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que cualquier afirmacion de calidad relativa frente a otros modelos carece de respaldo verificable.
- El repositorio tiene un numero muy bajo de descargas (77) y cero likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Las cifras de velocidad (24-28+ tok/s) y de contexto completo en 24 GB provienen del autor y no han sido verificadas de forma independiente; dependen fuertemente de la CPU, la RAM y el ancho de banda de memoria del sistema.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero conviene verificar los terminos del repositorio original Kwaipilot/KAT-Coder-V2.5-Dev por si existiesen condiciones adicionales.
- El enrutamiento MoE con 256 micro-expertos es sensible a la cuantizacion; aunque los gates se mantienen en F32, no hay datos publicos sobre la deriva de enrutamiento en secuencias muy largas.
- El cache KV para contexto de 256K puede consumir una cantidad significativa de memoria adicional que no se detalla en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Catalogo del autor (donde se anuncia la revision V2.1): https://huggingface.co/IsValorum
