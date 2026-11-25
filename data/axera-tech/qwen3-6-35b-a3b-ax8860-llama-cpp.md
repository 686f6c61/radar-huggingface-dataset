# AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp

## Resumen

Qwen3.6-35B-A3B-AX8860-llama.cpp es una distribución lista para ejecutar el modelo Qwen3.6-35B-A3B (un transformer de tipo Mixture-of-Experts con 35.505.528.224 parámetros totales y unos 3.000 millones activos por token) sobre la NPU Axera AX8860 mediante un fork propio de llama.cpp con kernels ggml-axera. Lo publica AXERA-TECH, el fabricante del silicio, y el repositorio incluye tanto los pesos cuantizados en NVFP4 como los binarios estáticos, los kernels de NPU y los scripts de ejecución, de modo que el modelo puede servirse en placa sin compilar nada.

El problema que resuelve es concreto: llevar un modelo MoE de 35B con entrada de texto e imagen y hasta 262.144 tokens de contexto a un acelerador de borde, con decodificación especulativa MTP y un servidor compatible con la API de OpenAI. Frente a la alternativa de servir el modelo en GPU, esta distribución prioriza el consumo y el coste por unidad, a cambio de atarse al hardware AX8860 y a un fork de llama.cpp que no es compatible con el upstream.

Es relevante ahora porque demuestra que un MoE de 35B con visión y contexto largo puede correr a 76,4 tokens/s de decodificación (hasta 86,8 con MTP adaptativo) y 5.276 tokens/s de prefill en una NPU de 4 núcleos, con pérdida de perplejidad medida y acotada frente a la misma cuantización en CPU. El repo ocupa 22,2 GB e incluye pesos, codificador visual y utilidades de benchmark reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención estándar, codificador visual y decodificación especulativa MTP |
| Parametros totales | 35.505.528.224 |
| Parametros activos | Aproximadamente 3.000 millones (3B activos, según el autor) |
| Longitud de contexto | Hasta 262.144 tokens (por defecto 16.384 en el servidor; configurable con `CTX`) |
| Tipos de cuantizacion | NVFP4 (bloques NVFP4 con tensores acompañantes `.scale` en F32) para los pesos; KV cache en FP8 (E4M3); codificador visual en BF16 |
| Idiomas soportados | No disponible (la model card solo aporta ejemplos en chino e inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF (NVFP4 para el modelo, BF16 para el `mmproj` visual) |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base: no hay número de tokens, composición del dataset ni detalles sobre RLHF o DPO. Lo que sí describe es la arquitectura de despliegue. El modelo es un MoE con 35,5B parámetros totales y unos 3B activos por token, lo que explica que un GGUF de 20,5 GB pueda decodificar a decenas de tokens por segundo en una NPU de borde. Incluye un codificador visual separado (`mmproj-qwen3.6-35b-a3b-bf16.gguf`, 903 MB) que habilita entrada de imágenes, y soporta decodificación especulativa MTP (multi-token prediction) con hasta 3 borradores por ronda.

La innovación técnica principal está en la pila de inferencia, no en el modelo: los pesos se almacenan en NVFP4 con escalas F32 por bloque, un formato que solo carga correctamente el fork de llama.cpp de AXERA-TECH (el upstream no lo soporta). Los kernels de NPU se distribuyen compilados con un `manifest.json`, hay un conjunto opcional de kernels para codificar imágenes a 640×480 (que reduce el tiempo de codificación de 277 ms a 116 ms por imagen) y el servidor mantiene 8 checkpoints de contexto en caché para reutilización en conversaciones largas. El prompt cache reside en 4 GB de memoria del host y el runtime ocupa los 4 núcleos de la NPU en exclusiva.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat derivada de la original de Qwen3.6.
- Entrada de imágenes: descripción y razonamiento sobre imágenes mediante el codificador visual incluido.
- Contexto largo de hasta 262.144 tokens, con checkpoints de contexto rodantes para conversaciones extensas.
- Decodificación especulativa MTP adaptativa por petición, con modo forzado (`MTP_FORCE=1`) y control del número de borradores (`MTP_NMAX`).
- Servidor compatible con la API de OpenAI (`endpoints_compatible`), apto para clientes que hablan ese protocolo.
- Acepta mensajes `system` en medio de la conversación, lo que permite integrarlo con clientes de agentes como Codex.
- Modo de razonamiento desactivable: el servidor arranca con `--reasoning off` por defecto.
- Soporte de `llama-bench` para medición de rendimiento en placa.

## Casos de uso

- Asistente conversacional en el borde: con 262.144 tokens de contexto y checkpoints rodantes, puede mantener sesiones largas sin salir del dispositivo, útil en entornos con conectividad limitada o requisitos de privacidad.
- Descripción y análisis de imágenes en local: el codificador visual integrado permite procesar imágenes en la propia placa; con los kernels de 640×480 la codificación baja a 116 ms, adecuado para inspección visual en tiempo casi real.
- Generación de código asistida: los benchmarks del autor muestran 86,8 tokens/s en contenido de código con MTP adaptativo (96,9 forzado), suficiente para autocompletado interactivo en un IDE conectado al servidor OpenAI-compatible.
- Backend de agentes multi-paso: la aceptación de mensajes `system` intermedios y el contexto largo permiten usarlo como motor de agentes que inyectan instrucciones durante la ejecución.
- Procesamiento de documentos largos: resúmenes, extracción y preguntas sobre contratos o informes de decenas de miles de tokens, con prefill de 5.276 tokens/s para prompts de 4k.
- Servicio de traducción y redacción en inglés y chino: la model card reporta decodificación estable en torno a 76 tokens/s en traducción chino-inglés y redacción de ensayos, con MTP adaptativo que no penaliza en esos casos.
- Despliegue en entornos sin GPU: al ejecutarse sobre NPU AX8860 con 4 GB de prompt cache en host, encaja en equipos de borde con restricciones térmicas o de consumo.

## Benchmarks y rendimiento

Rendimiento medido por el autor en placa AX8860 (tokens/s, hasta 256 tokens por prueba, decodificación greedy salvo indicación):

| Escenario | Sin MTP | MTP adaptativo | MTP forzado | Aceleración | Tasa de aceptación |
|---|---:|---:|---:|---:|---:|
| Código | 76,9 | 86,8 | 96,9 | 1,13x | 0,752 |
| Traducción chino-inglés | 76,0 | 75,9 | 80,2 | 1,00x | 0,598 |
| Tabla Markdown | 76,8 | 83,1 | 87,9 | 1,08x | 0,646 |
| Matemáticas | 76,8 | 84,1 | 86,2 | 1,09x | 0,699 |
| Ensayo en chino | 77,5 | 77,8 | 61,0 | 1,00x | 0,320 |
| Relato en inglés | 76,3 | 76,7 | 60,4 | 1,00x | 0,365 |
| Código, muestreo | 46,6 | 45,0 | 50,8 | 0,97x | 0,556 |
| Ensayo, muestreo | 44,1 | 47,1 | 39,4 | 1,07x | 0,357 |

Otras métricas reportadas:

| Métrica | Valor |
|---|---|
| Decodificación global | 76,4 tokens/s (hasta 86,8 con MTP adaptativo) |
| Prefill de prompt de 4k | 5.276 tokens/s (3.908 tokens en 0,74 s) |
| Decodificación con `-c 8192`, prompt 3.908 | 74,0 tokens/s |
| Decodificación con `-c 262144`, prompt 3.908 | 73,8 tokens/s |
| Perplejidad en chino, `-ub 1` | 17,1751 ± 0,73694 |
| Perplejidad en chino, `-ub 4` | 17,1148 ± 0,73427 |
| Perplejidad misma placa, Qwen3.5-35B-A3B | 18,6744 / 18,6075 |
| Coste de cuantización NVFP4 | +5,3 % (CPU bf16 15,94 → NVFP4 en CPU 16,78) |
| Coste placa vs CPU con los mismos pesos | +2,4 % (17,18 frente a 16,78) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: NPU Axera AX8860 con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos de la NPU en exclusiva.
- VRAM/almacenamiento: pesos de 20,5 GB (NVFP4) más 903 MB del codificador visual; el repo completo ocupa 22,2 GB.
- Memoria del host: 4 GB reservados para el prompt cache, además del espacio para el contexto KV en FP8 según la longitud configurada.
- GPU: no aplica; esta distribución no está pensada para GPU. Los binarios de `bin/` son estáticos para la placa.
- Opciones de despliegue: `run.sh` para CLI, chat interactivo y servidor OpenAI-compatible (`-s 8080`); `bench.sh` para reproducir el rendimiento; `llama-bench` disponible con `-b 4096 -ub 4096`.
- Latencia y throughput: prefill de 3.908 tokens en 0,74 s; decodificación de 73,8 a 76,4 tokens/s según contexto; codificación de imagen en 116 ms con kernels 640×480 o 277 ms con los por defecto.
- Configuración del servidor: `-np 1`, MTP activo por defecto con hasta 3 borradores, `-ctxcp 8` para checkpoints de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Visión | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (AX8860, este repo) | 35,5B | ~3B | 262.144 | Sí | No disponible | NPU AX8860, fork llama.cpp |
| Qwen3.5-35B-A3B (referencia del autor) | No disponible | No disponible | No disponible | No disponible | No disponible | Misma placa; PPL 18,67 frente a 17,17 |
| Qwen3.6-35B-A3B (base, sin cuantizar) | 35,5B | ~3B | No disponible | Sí | No disponible | Pesos originales en Hugging Face |

La comparativa con alternativas de otros fabricantes en el mismo rango de tamaño no está disponible en la información proporcionada. El único punto de comparación medido es Qwen3.5-35B-A3B, que en la misma placa y fichero de prueba obtiene una perplejidad en chino de 18,67 frente a 17,17 del modelo aquí descrito, con un coste de cuantización ligeramente menor (+2,6 % frente a +5,3 %).

## Limitaciones y advertencias

- Dependencia total del hardware: requiere una NPU Axera AX8860 y SDK V0.5.1 o superior; no es ejecutable en GPU ni en CPU convencional con estos binarios.
- Compatibilidad rota con llama.cpp upstream: los GGUF en NVFP4 con escalas F32 solo los carga el fork de AXERA-TECH; el llama.cpp estándar no puede leerlos.
- Licencia no declarada: no se especifica licencia en la información disponible, por lo que el uso comercial queda sin garantías jurídicas hasta consultar el modelo base Qwen/Qwen3.6-35B-A3B.
- Idiomas no declarados: la model card solo aporta evidencias en chino e inglés; el rendimiento en castellano no está medido.
- Estabilidad: el autor reconoce fallos intermitentes `ret = -3` en peticiones consecutivas que requieren reintento, un caveat relevante para producción.
- MTP no siempre ayuda: en ensayos y relatos el modo forzado degrada el rendimiento (61,0 y 60,4 tokens/s frente a ~77 sin MTP), con tasas de aceptación de 0,32 y 0,36; el modo adaptativo es el recomendado.
- Decodificación greedy: para que el MTP adaptativo funcione hay que enviar `presence_penalty: 0` explícito; de lo contrario se desactiva el greedy fusionado.
- Calidad de imagen reducida con kernels 640×480: las imágenes grandes se reescalan y pierden detalle fino frente a los kernels por defecto.
- Riesgo de alucinación y sesgos: no hay evaluación publicada al respecto en la información disponible; debe asumirse el comportamiento del modelo base sin garantías adicionales.
- Contexto por defecto corto: el servidor arranca con 16.384 tokens; usar los 262.144 requiere configurar `CTX` y consume más memoria para el KV cache.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval ni GSM8K que permitan comparar calidad frente a otros modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
