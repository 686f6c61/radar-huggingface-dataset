# Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-Coder-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-Coder-GGUF es una compilacion en formato GGUF derivada de la familia DeepSeek-V4.1, publicada por el usuario Abiray. Se trata de una variante "abliterated" (sin censura) del modelo coder de ISTA-DASLab, obtenida mediante un trasplante quirurgico de tensores desde un donante ya descensurado (AtomicChat). El objetivo declarado es eliminar los rechazos de seguridad sin degradar la capacidad de codigo del modelo original, preservando intactos los expertos enrutados de codigo.

El modelo mantiene la arquitectura de la familia DeepSeek-V4.1 con un backbone cuantizado en IQ2_XXS y una tabla de busqueda Engram de 110,6 GB que se carga por streaming mediante mmap. Cuenta con aproximadamente 196.600 millones de parametros totales y un repositorio de 183,7 GB distribuido en seis shards. La ventana de contexto no se especifica en la informacion disponible; el ejemplo de ejecucion del autor emplea `-c 16384`.

Su relevancia actual radica en dos factores: por un lado, demuestra una tecnica de modificacion (trasplante de tensores residuales densos) que evita la re-cuantizacion y conserva la calibracion GSQ-RCO original; por otro, ofrece un modelo de codigo de gran tamano ejecutable en hardware de consumo elevado o servidores con 96-128 GB de RAM, sin GPU dedicada obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia DeepSeek-V4.1 con expertos enrutados (MoE) y tabla Engram de busqueda; backbone cuantizado IQ2_XXS |
| Parametros totales | 196.613.849.600 (~196,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo del autor usa 16384 tokens) |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ4_NL (tabla Engram) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 5 de backbone + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura DeepSeek-V4.1, que combina capas transformer con un esquema de expertos enrutados (192 expertos podados por capa segun la model card) y una tabla Engram de busqueda de 110,6 GB que se consulta una fila por token. El backbone esta cuantizado en IQ2_XXS (72,1 GB en cinco shards) y la tabla Engram en IQ4_NL. Incluye un proyector de vision (`mmproj`) en la raiz del repositorio, lo que sugiere capacidades multimodales.

La innovacion tecnica principal de esta build es el "trasplante residual quirurgico": solo se sustituyen los 82 tensores densos que escriben en el flujo residual (`attn_output_b`, `ffn_down_shexp` y `engram_kv`) por los del modelo donante descensurado, byte a byte. Los expertos enrutados de codigo y las puertas del router permanecen identicos a la release original de ISTA-DASLab, evitando la des-cuantizacion y re-cuantizacion que degradaria la calibracion Gumbel-Softmax Quantization (GSQ-RCO). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Generacion de codigo, incluido codigo de sistemas y seguridad (el ejemplo del autor pide un escaner TCP SYN en Python).
- Razonamiento con modo "thinking" integrado (etiquetas `<think>`), configurable mediante `--reasoning-budget`.
- Capacidades multimodales por la presencia del proyector de vision `mmproj` (no se detalla el alcance).
- Ejecucion local via llama.cpp (b11870+) y Strata (v0.2.5+).
- Sin rechazos de seguridad: la model card declara una tasa de rechazo del 0,0 % frente al 86,4 % del original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Generacion de codigo de sistemas y redes: el modelo esta afinado para codigo (variante "Coder") y el autor ilustra su uso con un escaner TCP SYN en Python; resulta adecuado para tareas de bajo nivel donde otros modelos aplican filtros.
- Investigacion en seguridad ofensiva y auditoria: al eliminar los rechazos, permite generar PoCs y scripts de analisis de vulnerabilidades sin bloqueos, en entornos controlados y con autorizacion.
- Evaluacion de alineamiento y red-teaming: util como contrapunto descensurado frente al modelo original para estudiar diferencias de comportamiento con una paridad de tokens del 99,80 %.
- Despliegue en servidores sin GPU dedicada: con 96-128 GB de RAM y streaming mmap de la tabla Engram, puede ejecutarse en CPU, lo que facilita su uso en estaciones de trabajo de gama alta.
- Asistente de codigo en local con privacidad: al ejecutarse via llama.cpp o Strata en infraestructura propia, el codigo y los prompts no salen del entorno.
- Analisis de codigo legado y refactorizacion: su ventana de contexto (al menos 16k tokens en el ejemplo) permite procesar modulos completos en una sola pasada.
- Prototipado rapido con razonamiento visible: el modo thinking permite inspeccionar la cadena de razonamiento antes de obtener el codigo final, util en docencia y depuracion.

## Benchmarks y rendimiento

La model card no incluye benchmarks clasicos (MMLU, HumanEval, GSM8K), sino metricas de fidelidad respecto al modelo original:

| Metrica | Original (ISTA-DASLab) | Este modelo (Uncensored) |
|---|---|---|
| Acuerdo top-1 de tokens | 100,0 % | 99,80 % |
| Similitud coseno residual (40 capas) | 1,0000 | 0,99999993 |
| Desplazamiento de distribucion (KLD mediana) | 0,0 | 6,94e-08 nats |
| Retencion de codigo y razonamiento | 98,7 % LCB / 94,8 % SWE | 100 % de paridad |
| Tasa de rechazo de seguridad | 86,4 % | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM del sistema: 96-128 GB para ejecucion completa en CPU con streaming mmap de la tabla Engram (110,6 GB).
- VRAM: no disponible de forma explicita; el autor menciona la opcion de "GPU + RAM offload", por lo que se puede repartir el modelo entre VRAM y RAM.
- GPU recomendadas: no especificadas en la informacion disponible; por el volumen (183,7 GB de repositorio) se requiere offload incluso en GPUs de 80 GB (A100/H100).
- Cabe en GPU de consumo: no de forma completa; solo con offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (b11870+) y Strata (v0.2.5+). Requiere crear un symlink para que llama.cpp reconozca el archivo Engram como shard 6.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Abiray) | ~196,6 B | no disponible | MIT | GGUF | Descensurado, IQ2_XXS, requiere Engram |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF | ~196,6 B (misma base) | no disponible | no disponible | GGUF | Original con filtros de seguridad (86,4 % de rechazo) |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Donante descensurado usado para el trasplante |

No se dispone de datos de rendimiento comparativo con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: responde a peticiones de seguridad, sockets crudos y contenido restringido; puede generar codigo ofensivo o contenido danino. Requiere uso responsable y supervision.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; como cualquier LLM, puede inventar APIs, funciones o resultados.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles (la model card esta en ingles).
- Longitud de contexto no especificada: el ejemplo usa 16k tokens; no se debe asumir una ventana mayor sin verificacion.
- Cuantizacion agresiva (IQ2_XXS): aunque la build conserva los expertos originales, el backbone en 2 bits puede degradar tareas fuera de codigo.
- Dependencia de la tabla Engram: requiere el archivo de 110,6 GB y un symlink manual para llama.cpp; un mal montaje impide la ejecucion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador.
- Repositorio de 183,7 GB: almacenamiento y ancho de banda de descarga considerables.
- Sin descargas ni validacion de la comunidad (0 descargas, 2 likes): madurez y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-Coder-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Donante descensurado: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Perfil del autor: https://huggingface.co/Abiray
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Strata: no disponible (no se proporciona URL en la informacion)
- Paper o blog de DeepSeek-V4.1: no disponible en la informacion proporcionada
