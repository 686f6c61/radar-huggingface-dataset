# mrsirg97-rgb/vibes1.7b

## Resumen

osmos1.7b es un ajuste fino del modelo LFM3-1.7B de Liquid AI, desarrollado por el usuario mrsirg97-rgb bajo la línea denominada "osmos". Se trata de un agente de código de 1.700 millones de parámetros diseñado específicamente para ejecutarse en dispositivos de borde (teléfonos, portátiles), con especial énfasis en tareas de codificación agéntica: uso de shell, edición de ficheros, ejecución de tests y razonamiento multi-paso en sesiones largas.

El modelo parte de la arquitectura híbrida de LFM3-1.7B (convoluciones cortas y atención) con 262K tokens de contexto nativo, y ha sido ajustado mediante una receta propietaria denominada "v-r13" que entrena sobre decisiones reales de un ingeniero en sesiones de agente de hasta 56K tokens, evitando copiar texto de otros modelos. Incorpora además una técnica de "liberación" que proyecta fuera la dirección de rechazo de los pesos, reduciendo drásticamente las negativas a responder.

Su relevancia radica en que demuestra que un modelo de 1.7B puede mantener coherencia en contextos de 20-50K tokens para tareas de agente, un terreno donde los modelos pequeños suelen perder el hilo. Se distribuye principalmente en formato GGUF (BF16 y cuantizaciones), lo que facilita su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones cortas + atención), basado en LFM3-1.7B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K nativo (entrenado en ventanas de hasta 56K tokens) |
| Tipos de cuantizacion | BF16, GGUF (Q4_0, Q8 mencionados en la model card); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (safetensors disponible en el repo base; el repo de osmos incluye GGUF) |

## Arquitectura y entrenamiento

osmos1.7b hereda la arquitectura de LFM3-1.7B de Liquid AI: un transformer híbrido que combina convoluciones cortas con mecanismos de atención, optimizado para eficiencia en dispositivos de borde y con 262K tokens de contexto nativo. El ajuste fino se realizó en BF16 mientras la caché KV se redondeaba a Q4_0 durante el entrenamiento, de modo que el modelo mantiene su rendimiento tanto con caché f16 como Q8 o Q4.

La receta v-r13 se basa en 8.862 ejemplos y 196M tokens de contexto (6,9M tokens entrenados), en una sola pasada de aproximadamente 9 horas sobre dos RTX 5090. Los datos provienen de sesiones reales de un ingeniero en tareas de agente, con una mediana de contexto de 22,7K tokens y ventanas de hasta 56K. En cada punto de decisión, el modelo base genera la respuesta en sus propias palabras y solo se conservan las muestras que coinciden con la acción real del ingeniero (misma herramienta, mismo objetivo, parseo limpio), evitando así el colapso por copia de texto ajeno. Se complementa con un corpus curado de código de sistemas (Go, C, Rust) con tests de comportamiento, pull requests fusionados y una porción menor de código de motores de inferencia. Adicionalmente, se aplicó una técnica de "liberación" que proyecta fuera la dirección de rechazo de los pesos, manteniendo el rechazo a prompts dañinos en 0% y a prompts seguros que parecen peligrosos (XSTest) en 1%.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Codificación agéntica: uso de shell, lectura y edición de ficheros, ejecución de tests.
- Tool calling y function calling, con especial solidez en la selección de herramienta y objetivo correctos.
- Razonamiento multi-paso en sesiones largas (hasta 56K tokens de contexto efectivo).
- Capacidad de mantener coherencia en tareas profundas donde el modelo ha leído decenas de ficheros.
- Modo de agente autónomo con harness real (30 minutos de pared por tarea en las evaluaciones).
- No es un modelo de conocimiento general: está especializado en codificación agéntica.
- Idiomas: únicamente inglés.
- No se mencionan capacidades de visión, audio ni thinking mode explícito.

## Casos de uso

- Agente de codificación en local para portátiles: el modelo cabe en formato GGUF BF16 (3,47 GB) y puede ejecutarse en un portátil con GPU de consumo, gestionando tareas de edición de código y ejecución de tests sin conexión.
- Automatización de tareas de mantenimiento de repositorios: dado un repositorio en un commit padre y una tarea, el modelo trabaja en un harness real, lee ficheros, aplica ediciones y ejecuta los tests del proyecto para validar el cambio.
- Asistente de shell interactivo: puede interpretar comandos, decidir qué herramienta invocar y ejecutar secuencias de comandos en un entorno controlado, gracias a su entrenamiento en sesiones reales de agente.
- Integración en pipelines de CI/CD: con tool calling y contexto largo, puede analizar fallos de build, leer logs extensos y proponer parches acotados, aunque su tasa de éxito en commits reales es moderada (9-11 de 52 intentos).
- Agente always-on en dispositivos de borde: su tamaño reducido y su capacidad de mantener contexto de 20-50K tokens lo hacen adecuado para asistentes persistentes en teléfonos o dispositivos con recursos limitados.
- Procesamiento de codebases extensas: con 262K de contexto nativo, puede ingerir múltiples ficheros de un proyecto y razonar sobre dependencias entre ellos en una sola sesión.
- Evaluación de código en lenguajes de sistemas: entrenado con Go, C, Rust, Zig, Java, OCaml, Haskell y Fortran, puede asistir en revisión y generación de código en estos lenguajes.

## Benchmarks y rendimiento

Resultados publicados en la model card (todos sobre BF16 con caché f16 salvo indicación):

| Benchmark | Resultado |
|---|---|
| Commit bench (52 intentos, 26 commits) | 9 pasados, 2 parciales, score medio 0.202, 0 roturas de build, 0 falsos "done" |
| Commit bench con caché Q8 | 11 pasados, 2 parciales, score medio 0.247 |
| Perplejidad TigerBeetle 16K | 2.424 |
| Perplejidad TigerBeetle 32K | 2.060 |
| Perplejidad TigerBeetle 48K | 2.073 |
| Perplejidad evt (código retenido) | 2.590 (base: 2.666) |
| Perplejidad Netty (Java) | 1.958 (base: 2.000) |
| Perplejidad OCaml | 5.131 (base: 5.283) |
| Perplejidad Haskell | 4.597 (base: 4.719) |
| Perplejidad Fortran | 3.099 (base: 3.184) |
| Perplejidad texto inglés general | 6.81 (base: 7.18, -5.1%) |
| LiveCodeBench (60 problemas) | 38 resueltos (base: 41; release anterior: 39) |
| Rechazo a prompts dañinos | 0% |
| Rechazo a prompts seguros tipo XSTest | 1% |

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 3,5 GB solo para pesos; con caché KV y overhead, en torno a 4-6 GB según longitud de contexto. Cuantizaciones Q4_0 y Q8 reducen el requisito.
- GPU recomendadas: RTX 5090 (usadas para el entrenamiento), RTX 4090, GPUs de consumo con 8 GB o más para BF16; GPUs integradas o de gama baja para cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6-8 GB de VRAM en BF16, y en configuraciones menores con cuantización.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo está diseñado para el runtime libosmos del autor. vLLM y TGI no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| osmos1.7b | 1.73B | 262K | lfm1.0 | GGUF | Especializado en agente de código, liberado de rechazos |
| LFM3-1.7B (base) | 1.7B | 262K | lfm1.0 | safetensors/GGUF | Modelo base de Liquid AI, propósito general y tool calling |
| osmos27b (anunciado) | 27B | no disponible | no disponible | no disponible | Miembro de la línea osmos, aún no publicado |
| osmos224b (anunciado) | 224B MoE | no disponible | no disponible | no disponible | Miembro insignia de la línea osmos, aún no publicado |

## Limitaciones y advertencias

- Especializado en codificación agéntica; no es una mejora de conocimiento general y su rendimiento en tareas fuera de ese dominio puede ser inferior al base.
- Solo soporta inglés; no hay soporte multilingüe.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio.
- El modelo ha sido "liberado" mediante proyección de la dirección de rechazo, lo que reduce las negativas a responder; esto puede aumentar el riesgo de generar contenido inapropiado en contextos no previstos, aunque los benchmarks reportan 0% de rechazo a prompts dañinos.
- Riesgo de alucinación inherente a modelos de 1.7B, especialmente en tareas de conocimiento factual.
- Tasa de éxito moderada en commits reales (9-11 de 52 intentos), con muchas fallas por agotamiento del tiempo límite de 30 minutos.
- En LiveCodeBench queda ligeramente por debajo del base (38 vs 41), lo que indica que la receta no mejora la resolución de problemas de competición.
- El contexto nativo es de 262K, pero el entrenamiento se realizó en ventanas de hasta 56K; el rendimiento más allá de esa longitud no está validado.
- El repo tiene 19,5 GB, lo que incluye múltiples cuantizaciones; verificar el fichero GGUF adecuado antes de descargar.
- No se han publicado datos de latencia ni throughput, lo que dificulta estimar su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mrsirg97-rgb/vibes1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime libosmos: https://github.com/mrsirg97-rgb/libosmos
- Licencia LFM1.0: https://huggingface.co/mrsirg97-rgb/vibes1.7b/blob/main/LICENSE
