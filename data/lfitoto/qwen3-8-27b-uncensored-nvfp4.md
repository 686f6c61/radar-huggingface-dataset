# lfitoto/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-NVFP4 es una compilacion cuantizada y "abliterated" (direccion de rechazo eliminada) del modelo Qwen/Qwen3.8-27B, publicada por el usuario lfitoto en HuggingFace. Se trata de un modelo denso de 27.000 millones de parametros, nativo de vision-lenguaje, con atencion hibrida (Gated DeltaNet lineal combinada con atencion completa), control flexible de razonamiento, soporte de tool calling y una cabeza MTP de decodificacion especulativa. La ventana de contexto declarada es de 262K tokens.

La innovacion principal de esta build es la cuantizacion dinamica de precision mixta NVFP4 + FP8: las capas feed-forward mayoritarias se comprimen a 4 bits en formato NVFP4, mientras que las capas sensibles a la precision y la cache KV se mantienen en FP8. Segun la model card, esto preserva mejor la exactitud que una cuantizacion uniforme W4A4. Ademas, se ha aplicado abliteration previa a la cuantizacion, de modo que el modelo conserva sus capacidades (vision, herramientas, razonamiento, MTP) pero pierde los rechazos de seguridad del modelo original.

Es relevante ahora por dos motivos: por un lado, es una de las primeras builds orientadas a hardware Blackwell con FP4 nativo para un modelo de 27B con vision; por otro, su naturaleza "uncensored" lo convierte en una herramienta especifica para investigacion de seguridad, interpretabilidad de mecanismos de rechazo y red teaming. El autor lo publica bajo licencia Apache 2.0, con un descargo de responsabilidad que restringe explicitamente su uso a investigacion legitima y desaconseja su despliegue directo a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration; transformer hibrido con Gated DeltaNet (atencion lineal) + atencion completa; torre de vision nativa y cabeza MTP |
| Parametros totales | 27B (modelo denso) |
| Longitud de contexto | 262K tokens (262.144 aprox.) |
| Tipos de cuantizacion | NVFP4 (4 bits) para capas feed-forward + FP8 para capas sensibles y cache KV, en precision mixta dinamica; builds hermanas en BF16, FP8 en bloque, GGUF (2 a 16 bits) y MLX (2, 4 y 8 bits) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); builds hermanas en GGUF y MLX |
| Numero de capas | 64 |
| Dimension oculta | 5.120 |
| Distribucion de atencion | 48 capas de atencion lineal (Gated DeltaNet) + 16 de atencion completa, con intervalo 4 |
| Tamano del repositorio | 24,7 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 64 capas con dimension oculta de 5.120. La atencion se reparte entre 48 capas de atencion lineal basada en Gated DeltaNet y 16 capas de atencion completa, intercaladas con un intervalo de 4. Esta combinacion busca reducir el coste cuadratico de la atencion completa en contextos largos, manteniendo la capacidad de recuperacion precisa que aportan las capas de atencion completa. El modelo incorpora ademas una torre de vision nativa (es un modelo image-text-to-text) y una cabeza MTP (multi-token prediction) que actua como mecanismo de decodificacion especulativa para acelerar la generacion.

Sobre el entrenamiento no se proporciona informacion en los materiales disponibles: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion en el modelo base. Lo unico documentado es el proceso de posprocesado aplicado por el autor: primero abliteration (ortogonalizacion de la direccion de rechazo fuera del flujo residual) y despues cuantizacion de precision mixta. Esta build combina cuantizacion NVFP4 para las capas feed-forward con FP8 para las capas sensibles y la cache KV, una estrategia que la model card presenta como superior a la cuantizacion uniforme W4A4 en terminos de preservacion de exactitud.

## Capacidades

- Generacion de texto conversacional y razonamiento con control flexible del modo "thinking".
- Razonamiento multi-paso y soporte de agentes.
- Tool calling y function calling.
- Vision-lenguaje: procesamiento nativo de imagenes junto a texto (pipeline image-text-to-text).
- Decodificacion especulativa mediante cabeza MTP, orientada a reducir latencia de generacion.
- Capacidades multilingues limitadas a ingles y chino (en, zh).
- Razonamiento sobre contextos largos de hasta 262K tokens, con la mezcla de atencion lineal y completa.
- Al no conservar los rechazos de seguridad, responde a peticiones que el modelo original rechazaria (capacidad relevante para red teaming, no para produccion sin moderacion).

## Casos de uso

- Investigacion de seguridad de IA: analisis de como se codifica la direccion de rechazo en el flujo residual y evaluacion de la robustez de los mecanismos de alineacion, comparando esta build con el modelo base sin abliterar.
- Red teaming y evaluacion de robustness: generacion controlada de respuestas que el modelo original rechazaria para construir conjuntos de evaluacion de moderadores y clasificadores de contenido.
- Analisis de documentos con imagenes: extraccion y resumen de informacion a partir de capturas, tablas escaneadas o diagramas tecnicos, aprovechando la torre de vision y la ventana de 262K tokens para procesar documentos extensos completos en una sola pasada.
- Pipelines agenticos con tool calling: integracion como motor de decision en agentes que invocan APIs, bases de datos o funciones internas, con razonamiento multi-paso intermedio.
- Procesamiento de repositorios y documentacion tecnica en ingles o chino: comprension de grandes volumenes de codigo y documentacion dentro del contexto extendido.
- Asistentes conversacionales en ingles y chino: atencion multi-turno con memoria de contexto larga, siempre que se anada una capa externa de moderacion y filtrado de abuso.
- Generacion asistida en investigacion academica: redaccion y discusion de contenido que otros modelos rechazan, en entornos de laboratorio controlados.
- Evaluacion de cuantizacion: uso como referencia para medir la degradacion de exactitud que introduce NVFP4 frente a FP8, BF16 o GGUF en las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualidades de la cuantizacion ("accuracy is better preserved than uniform W4A4") pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para esta build ni para las builds hermanas.

## Requisitos de hardware

Nota: los valores de VRAM y compatibilidad que siguen son estimaciones derivadas del tamano del repositorio (24,7 GB) y del formato de cuantizacion declarado (NVFP4 + FP8 para Blackwell); no estan publicados en la informacion disponible.

- Pesos en disco: 24,7 GB.
- VRAM estimada para inferencia: aproximadamente 25-28 GB solo para pesos, mas el espacio de la cache KV en FP8. Con 262K de contexto, la cache KV puede crecer de forma significativa, por lo que se recomienda reservar VRAM adicional segun la longitud de secuencia.
- GPU compatibles: el formato NVFP4 esta pensado para arquitectura Blackwell (B100, B200, GB200 y GPU de consumo de la serie RTX 50). La model card indica explicitamente "for Blackwell FP4".
- GPU de consumo: una RTX 5090 (32 GB) o similar con soporte FP4 podria alojar los pesos, aunque el margen para contexto largo es limitado. En GPUs Ampere o Ada (RTX 3090, RTX 4090) no hay soporte nativo de FP4 declarado en la informacion disponible.
- Opciones de despliegue: vLLM (etiqueta explicita en el repositorio y formato compressed-tensors), transformers como libreria declarada, y API alojada compatible con OpenAI en OrcaRouter (endpoint api.orcarouter.ai/v1, modelo qwen/qwen3.8-27b). Para hardware sin soporte FP4, las builds hermanas GGUF (llama.cpp, 2 a 16 bits) y MLX (Apple Silicon, 2/4/8 bits) son las alternativas documentadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo documenta variantes del mismo modelo base, no modelos de la competencia con datos verificables. Se comparan por tanto la build analizada y sus builds hermanas.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| lfitoto/Qwen3.8-27B-Uncensored-NVFP4 | 27B (denso) | 262K | NVFP4 + FP8 mixta | Apache 2.0 | no disponible |
| Qwen/Qwen3.8-27B (base) | 27B (denso) | no disponible | BF16 (sin cuantizar) | Apache 2.0 | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored | 27B (denso) | no disponible | BF16 (fuente) | Apache 2.0 | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27B (denso) | no disponible | FP8 en bloque, para vLLM | Apache 2.0 | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27B (denso) | no disponible | 2 a 16 bits, para llama.cpp | Apache 2.0 | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored-MLX | 27B (denso) | no disponible | 2, 4 y 8 bits, para Apple Silicon | Apache 2.0 | no disponible |

Advertencia de trazabilidad: la model card de este repositorio promociona y enlaza las builds de la organizacion orcarouter, pero el repositorio analizado esta publicado por el usuario lfitoto. La informacion disponible no documenta la relacion entre ambas cuentas ni si esta build es identica a alguna de las publicadas por orcarouter. No se dispone de modelos comparables de otros fabricantes con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina sustancialmente la alineacion de seguridad: el modelo cumple peticiones daninas, poco eticas, ofensivas o ilegales que el Qwen3.8-27B original rechazaria. No tiene guardarrailes internos significativos.
- El propio autor lo restringe a investigacion legitima (interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red teaming y evaluacion de robustez) y declara que no debe desplegarse a usuarios finales ni en produccion sin capas propias de seguridad, moderacion y prevencion de abuso.
- Existe tension entre la licencia Apache 2.0 y el descargo de responsabilidad: la licencia permite uso comercial, pero el texto de la model card limita el uso declarado a investigacion. Conviene revisar el encuadre legal antes de cualquier uso comercial.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas para esta build ni para el modelo base.
- Idiomas: solo se declaran ingles y chino; no hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de degradacion por cuantizacion: NVFP4 en las capas feed-forward puede introducir perdida de exactitud frente a BF16 o FP8. La model card afirma que la mezcla preserva mejor la precision que W4A4 uniforme, pero no aporta mediciones que lo respalden.
- Dependencia de hardware: el formato NVFP4 requiere GPUs Blackwell para aprovecharse; en hardware anterior no se documenta soporte nativo.
- La informacion disponible de la model card esta truncada (la tabla de detalles del modelo se corta), por lo que pueden faltar especificaciones de cuantizacion, licencia efectiva o requisitos de despliegue.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Anomalia de metadatos: la fecha de actualizacion (2026-09-10T15:49:55Z) es anterior a la de creacion (2026-09-10T16:22:34Z).
- Salida limitada por el contexto de 262K tokens; mas alla de esa longitud, el comportamiento no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lfitoto/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build hermana BF16: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Build hermana FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Build hermana GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Build hermana MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter (sitio): https://www.orcarouter.ai
- OrcaRouter (catalogo de modelos): https://www.orcarouter.ai/models
- OrcaRouter (ficha del modelo): https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Endpoint de API: https://api.orcarouter.ai/v1
- GitHub de OrcaRouter: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
