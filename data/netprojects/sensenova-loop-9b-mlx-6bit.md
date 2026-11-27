# netprojects/SenseNova-Loop-9B-MLX-6bit

## Resumen

SenseNova-Loop-9B-MLX-6bit es una conversión a 6 bits (cuantización afín, grupo de 64) del modelo SenseNova-Loop-9B de SenseTime/SenseNova, publicada por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es un transformer de tipo "looped" construido sobre Qwen3.5 que, en lugar de ejecutar cada capa una sola vez, reutiliza pesos: las capas 4–27 se ejecutan dos veces con pesos compartidos, lo que resulta en 56 pasadas de capa por token con solo 32 capas físicas. Esta conversión concreta ocupa 7,3 GB de pesos y está pensada para Macs con 16 GB de memoria unificada.

La relevancia de esta ficha es doble: por un lado, documenta una arquitectura poco habitual (looped transformer con mezcla de estados ocultos en dos flujos, mHC) que SenseNova emplea para aumentar la profundidad efectiva sin incrementar el número de parámetros; por otro, muestra un port fiel a la implementación original en PyTorch, con verificación de equivalencia numérica (96,7 % de coincidencia en el token top-1 y KL de 0,0056 en el último token frente a bf16). El modelo soporta entrada de texto e imagen, contexto largo mediante YaRN (hasta 512K tokens según la model card del autor de la conversión) y decodificación con cabeza MTP para acelerar la generación.

El modelo resuelve tareas de agente, código y análisis de datos, y su licencia Apache 2.0 permite uso comercial. Esta conversión no está afiliada a SenseTime/SenseNova y se distribuye como cuantización del modelo base `sensenova/SenseNova-Loop-9B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped basado en Qwen3.5, con atención completa y Gated DeltaNet, más mHC de dos flujos en capas 4–27 |
| Parametros totales | 8.956.947.840 (8,96 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K tokens con YaRN (factor 2 sobre 262.144 posiciones) según la model card de la conversión |
| Tipos de cuantizacion | 6 bits afín con grupo de 64 (esta build); también existen 4 bits, 8 bits y bf16 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con tensores de router y RMSNorm en float32 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 32 capas físicas que aplica ejecución en bucle: las capas 0–3 se ejecutan una vez, las capas 4–27 se ejecutan dos veces con pesos compartidos y las capas 28–31 se ejecutan una vez, sumando 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de caché: KV cache para la atención completa y estado convolucional y recurrente para Gated DeltaNet. Además, las capas 4–27 incorporan un mecanismo mHC de dos flujos: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (compuertas pre/post y una matriz de mezcla 2×2 con Sinkhorn de 20 iteraciones). Los 96 tensores de router y las 81 ponderaciones RMSNorm se mantienen en float32 y no se cuantizan, lo que preserva la fidelidad numérica del port.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO; la model card de la conversión remite a la model card original de SenseNova para esos datos. La innovación técnica destacable es la combinación de ejecución en bucle con mHC y la cabeza MTP (multi-token prediction) para decodificación especulativa, que según el autor de la conversión acelera la decodificación aproximadamente 1,7×. El contexto largo se consigue con escalado YaRN de factor 2 sobre 262.144 posiciones.

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo thinking activable (`enable_thinking=True`).
- Razonamiento multi-paso y tareas de agente (evaluado en AutomationBench, Terminal-Bench 2.1 y GAIA).
- Generación y análisis de código, incluyendo tareas de terminal y de repositorio (Terminal-Bench 2.1, NL2Repo).
- Análisis de datos y consultas a bases de datos en lenguaje natural (AIDABench, BIRD).
- Entrada de imagen: el modelo acepta texto e imagen, con prompts de imagen verificados contra la implementación en float32 de SenseNova.
- Contexto largo: la build de 6 bits localizó un código de acceso oculto en un prompt de 64K tokens.
- Decodificación acelerada mediante cabeza MTP (aproximadamente 1,7× según el autor de la conversión).
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Automatización de agentes en terminal: el modelo puede ejecutar tareas de Terminal-Bench 2.1 (59,55) en un Mac con 16 GB, útil para scripts de administración de sistemas y pipelines de CI/CD locales.
- Análisis de datos conversacional: con BIRD (72,34) y AIDABench (65,31), puede traducir preguntas en lenguaje natural a SQL y generar informes sobre bases de datos relacionales.
- Asistencia de código en local: al ejecutarse con MLX en Apple Silicon, permite autocompletado y revisión de código sin enviar datos a la nube, con licencia Apache 2.0 para integración en herramientas internas.
- Procesamiento de documentos largos: gracias al contexto YaRN de hasta 512K tokens, puede resumir o extraer información de contratos, manuales o expedientes extensos en una sola pasada.
- Atención al cliente con imágenes: al aceptar entrada de imagen, puede gestionar conversaciones multi-turno donde el usuario adjunta capturas o fotos, con modo thinking para consultas complejas.
- Investigación sobre arquitecturas looped: al ser un port fiel con código `sensenova_loop.py` incluido, sirve para estudiar el efecto del bucle y de mHC en la calidad de generación con hardware de consumo.
- Prototipado en Mac: con 7,3 GB de pesos, cabe en un MacBook de 16 GB y permite iterar en local antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

Los siguientes resultados son los reportados por SenseNova para el modelo BF16 original, copiados de la model card original según la model card de la conversión. No son mediciones de esta build de 6 bits.

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | No disponible |
| GAIA | 69,90 | 37,86 | No disponible |
| AIDABench | 65,31 | No disponible | 65,01 |
| NL2Repo | 41,36 | No disponible | 44,60 |
| BIRD | 72,34 | 71,38 | No disponible |

Además, el autor de la conversión reporta métricas de fidelidad de la cuantización frente a la implementación PyTorch en bf16 (16 prompts, todas las posiciones): 96,7 % de coincidencia en el token top-1, KL de 0,0056 en el último token, texto greedy idéntico en 4 de 16 prompts y 98,0 % de coincidencia en el token top-1 para prompts de imagen.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,3 GB de pesos para la build de 6 bits; el autor recomienda que la descarga no supere aproximadamente el 60 % de la memoria del equipo.
- Macs compatibles según el autor: 16 GB (esta build de 6 bits, 8,7 GB de descarga), 16 GB con la build de 4 bits (6,5 GB), 24 GB con la build de 8 bits (10,9 GB) y 48 GB o más con la build bf16 (19,3 GB).
- GPU recomendadas: Apple Silicon (el autor reporta pruebas en MacBook Pro M5 Max de 128 GB); no se documentan GPU NVIDIA en la información disponible.
- Cabe en GPU de consumo: sí, en Apple Silicon de 16 GB o más; no hay datos para GPU NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` 0.32 o superior con `trust_remote_code=True`, `mlx_lm.server` para servidor, y el runtime `sensenova-loop-mlx` v0.3.0 para entrada de imagen y decodificación MTP.
- Latencia y throughput: no disponible; el autor indica una aceleración de aproximadamente 1,7× con la cabeza MTP, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-6bit (esta build) | 8,96B | Hasta 512K con YaRN | 96,7 % top-1 vs bf16; benchmarks del modelo base en tabla anterior | Apache 2.0 | Hugging Face, MLX |
| SenseNova-Loop-9B (bf16 original) | 8,96B | Hasta 512K con YaRN | Referencia de fidelidad; benchmarks en tabla anterior | Apache 2.0 | Hugging Face |
| SenseNova-Loop-9B-Preview | No disponible | No disponible | Inferior al release en los siete benchmarks comparados | No disponible | Hugging Face |
| Qwen3.8-27B | 27B (aproximado por nombre) | No disponible | AutomationBench 36,67; AIDABench 65,01; NL2Repo 44,60 | No disponible | No disponible |

La comparativa se limita a los datos aportados; no se dispone de información sobre otros modelos de 9B con arquitectura looped para contrastar.

## Limitaciones y advertencias

- La información sobre sesgos conocidos no está disponible en la documentación proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de agente y análisis de datos.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingüe sin datos.
- La cuantización a 6 bits introduce desviaciones frente a bf16: solo el 25 % de los prompts (4 de 16) producen texto greedy idéntico, aunque la coincidencia en el token top-1 es del 96,7 %.
- La build de 4 bits del mismo autor baja al 84,4 % de coincidencia top-1 y KL de 0,1038, por lo que no se recomienda para tareas sensibles a la fidelidad.
- Esta conversión no está afiliada a SenseTime/SenseNova; los benchmarks reportados corresponden al modelo BF16 original, no a esta build.
- Requiere `trust_remote_code=True` y Python 3.11 o superior; la entrada de imagen y la decodificación MTP requieren el runtime externo `sensenova-loop-mlx`, no solo `mlx-lm`.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detallados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build de 4 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-4bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime sensenova-loop-mlx v0.3.0: https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- NetProjects: https://netprojects.com
