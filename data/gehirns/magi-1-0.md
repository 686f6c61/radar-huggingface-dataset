# GEHIRNS/magi-1.0

## Resumen

magi-1.0 es una cuantización de precisión mixta de Qwen/Qwen3.5-4B publicada por GEHIRNS, distribuida como un único fichero GGUF de 1,80 GiB que promedia 3,65 bits por peso. No es un modelo reentrenado ni un ajuste fino: los pesos son los originales de Qwen, reasignados tensor a tensor según la sensibilidad medida de cada clase (más bits para las proyecciones pequeñas de atención y DeltaNet, menos para las matrices FFN grandes). El resultado se ejecuta sin modificaciones en llama.cpp y Ollama.

La propuesta del autor es la densidad de capacidad: con caché KV de 8 bits, el modelo conserva el 96 % de la puntuación de referencia del modelo completo usando aproximadamente el 30 % de la memoria de GPU que necesita el BF16, y decodifica 2,7 veces más rápido. El modelo base tiene 4.205.751.296 parámetros (4,2B) y arquitectura Qwen3.5, con atención híbrida y Gated DeltaNet según los tags del autor.

Es relevante ahora porque ataca el problema práctico del despliegue en hardware de consumo: permite servir un modelo de 4B con 32K de contexto en GPU de 8-12 GB sin renunciar a la mayor parte de la calidad, y viene con un artículo técnico (*Where the Bits Go*) que documenta la metodología de asignación de bits y una evaluación reproducible sobre 2.313 tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 con atencion hibrida y Gated DeltaNet (segun tags del autor); derivada de Qwen/Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica: modelo denso (no MoE) |
| Longitud de contexto | 32.768 tokens (contexto empleado en la evaluacion del autor); maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF de precision mixta, media de 3,65 bits por peso; variantes concretas por tensor no disponibles. Soporta cache KV de 8 bits en tiempo de ejecucion |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | GGUF (fichero unico, 1,80 GiB; repositorio de 1,9 GB) |

Otros datos: pipeline `text-generation`, compatible con endpoints, creado el 2026-10-23 y actualizado el 2026-10-25, con 553 descargas y 4 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B: un transformer con capas de atención y Gated DeltaNet (atención lineal con estado recurrente), lo que explica que el autor hable de "estado recurrente" además de pesos y caché KV en el cómputo de memoria residente. magi-1.0 no introduce cambios estructurales: es un artefacto de cuantización post-entrenamiento (PTQ) que conserva la topología, el tokenizador y el chat template del modelo base.

No hay entrenamiento, RLHF ni DPO en este paso. La innovación es la política de asignación de bits: cada clase de tensor recibe la precisión que dicta su sensibilidad medida, en lugar de aplicar una plantilla uniforme como Q4_K_M o Q2_K. El artículo *Where the Bits Go* (GEHIRNS, 2026) documenta el método y el repositorio GEHIRNS/magi publica la receta y los datos. El resultado se sirve con cuantización de caché KV a 8 bits, opción que el autor incluye en sus cifras principales de memoria y velocidad.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat del modelo base.
- Razonamiento explícito: el autor evalúa con "thinking on" y un presupuesto de 4.096 tokens mediante *budget forcing*, lo que confirma soporte de modo pensamiento con límite configurable.
- Generación de código: evaluada con ejecución de tests en HumanEval+ y MBPP+ (EvalPlus) y con 150 problemas de LiveCodeBench de concursos entre 2025-01-18 y 2025-04-06.
- Razonamiento multi-paso dentro de una ventana de 32K tokens, adecuado para contextos largos y conversaciones multi-turno.
- Compatibilidad con llama.cpp y Ollama, incluida cuantización de caché KV a 8 bits.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de visión, audio o multimodal: no disponibles (pipeline de solo texto).
- Multilingüismo: limitado al inglés declarado; el resto de idiomas del modelo base no está verificado para esta cuantización.

## Casos de uso

- Asistente de código en local para equipos con GPU de consumo: el fichero de 1,80 GiB entra en tarjetas de 8 GB con contexto de 32K, de modo que se puede integrar en el IDE o en un pipeline de CI/CD para revisión y generación de tests sin depender de la nube.
- Atención al cliente automatizada en inglés: la ventana de 32K permite arrastrar historial multi-turno y documentos de referencia sin truncar, y la decodificación 2,7 veces más rápida reduce el coste por respuesta en despliegues con concurrencia.
- Despliegue en el borde o en portátiles: al ocupar aproximadamente el 30 % de la memoria del BF16, cabe en estaciones de trabajo sin GPU dedicada de gama alta o en Apple Silicon vía llama.cpp/Ollama.
- Razonamiento con presupuesto controlado: tareas de análisis o clasificación compleja donde se fija un límite de tokens de pensamiento (por ejemplo 4.096) para acotar latencia y coste, tal como hace el autor en su evaluación.
- Prototipado e investigación de cuantización: sirve como caso de estudio reproducible de asignación de bits por sensibilidad, con artículo y receta publicados, para equipos que quieran replicar el método en otros modelos.
- Servicio de inferencia en una sola GPU compartida: la baja huella de memoria permite ejecutar varias instancias o combinar el modelo con otros servicios en la misma tarjeta de 12 GB, algo inviable con el BF16 de 8,98 GiB.
- Generación aumentada por recuperación (RAG) en inglés: con 32K de contexto se pueden inyectar varios fragmentos documentales por consulta manteniendo el modelo residente en memoria.

## Benchmarks y rendimiento

Protocolo del autor: una sola RTX 5070 (12 GB), thinking activado con presupuesto de 4.096 tokens (budget forcing), decodificación greedy, contexto de 32K, 2.313 tareas. El código se evalúa ejecutando tests (EvalPlus para HumanEval+ y MBPP+); LiveCodeBench usa 150 problemas.

La tabla completa de resultados por benchmark no está disponible en la información proporcionada (el contenido aparece truncado). Los datos agregados y de memoria sí están publicados:

| Metrica | BF16 | Q4_K_M | Q2_K | magi-1.0 | magi-1.0 + KV q8 |
|---|---|---|---|---|---|
| Memoria residente con contexto 32K (Ollama) | 8,98 GiB | 3,78 GiB | 3,15 GiB | no disponible en el extracto | no disponible en el extracto |
| Puntuacion agregada de la suite | 84,14 % | 84,14 % | 4,2 puntos por debajo de magi-1.0 | 2,85 puntos por debajo de Q4_K_M (≈81,3 % derivado) | no disponible |
| Puntuacion retenida frente a BF16 | 100 % | 100 % | no disponible | 96 % | 96 % |
| Memoria de GPU frente a BF16 | 1x | no disponible | no disponible | ~30 % | ~30 % (97 % de puntuacion con el 34 % usando cache por defecto) |
| Densidad de capacidad (ρ = −log₂(1−score)/GiB) | 0,294 | 0,703 | 0,675 | 0,800 | 0,893 |
| Velocidad de decodificacion | 1x | no disponible | no disponible | 2,7x | no disponible |

Intervalos del 95 % publicados por el autor para la densidad de capacidad: 0,856–0,934 (magi-1.0 + KV q8), 0,768–0,835 (magi-1.0), 0,673–0,734 (Q4_K_M) y 0,646–0,703 (Q2_K). La ventaja de magi-1.0 sobre Q2_K en precisión es de 4,2 puntos, con intervalo pareado del 95 % de 2,8–5,6.

## Requisitos de hardware

- Pesos en disco y en memoria: 1,80 GiB para el fichero GGUF (3,65 bits por peso de media).
- Memoria de GPU: aproximadamente el 30 % de los 8,98 GiB del BF16 con caché KV de 8 bits (en torno a 2,7 GiB residentes con contexto de 32K, sin el contexto CUDA de ~1,05 GiB); en torno al 34 % con la caché por defecto.
- GPU validadas por el autor: una RTX 5070 de 12 GB para toda la campaña de evaluación.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con contexto de 32K, y con margen en 12 GB (RTX 3060 12 GB, RTX 4070, RTX 5070). En 6 GB requeriría reducir contexto o usar caché KV más agresiva.
- Opciones de despliegue: llama.cpp y Ollama son los soportes declarados; el tag `endpoints_compatible` sugiere uso tras API compatible con endpoints. Soporte en vLLM o TGI no está documentado para este fichero.
- Aceleración: decodificación 2,7 veces más rápida que el BF16 según el autor; no se publican tokens por segundo absolutos ni métricas de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion agregada | Memoria (32K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| magi-1.0 | 4,2B | 32K | ~81,3 % (derivado) | ~30 % de BF16 | Apache 2.0 | GGUF en HF, llama.cpp/Ollama |
| magi-1.0 + KV q8 | 4,2B | 32K | 96 % de BF16 | ~30 % de BF16 | Apache 2.0 | Igual, con cache KV de 8 bits |
| Qwen3.5-4B BF16 | 4,2B | 32K en la evaluacion | 84,14 % | 8,98 GiB | Apache 2.0 | Safetensors en HF |
| Q4_K_M (Unsloth) | 4,2B | 32K en la evaluacion | 84,14 % | 3,78 GiB | Apache 2.0 | GGUF en HF |
| Q2_K (publicado) | 4,2B | 32K en la evaluacion | 4,2 puntos por debajo de magi-1.0 | 3,15 GiB | Apache 2.0 | GGUF en HF |
| magi-beta-1 | no disponible | no disponible | densidad de capacidad 0,771 | no disponible | no disponible | Version previa del autor |

Lectura del autor: si prima la precisión, Q4_K_M iguala al BF16 y supera a magi-1.0 en 2,85 puntos, a cambio de 0,76 GiB más de memoria (1,13 GiB más que magi-1.0 con KV q8); si la restricción es la memoria, magi-1.0 ofrece entre un 14 % y un 27 % más de capacidad por GiB.

## Limitaciones y advertencias

- Solo inglés declarado: no hay evidencia de calidad en castellano ni en otros idiomas para esta cuantización.
- Pérdida de calidad medible: el agregado cae unos 2,85 puntos frente a Q4_K_M y el BF16; en tareas sensibles a precisión numérica o de código muy ajustado conviene validar con la propia suite antes de producción.
- Evaluación con un único protocolo y una sola GPU: decodificación greedy, thinking con presupuesto de 4.096 tokens y 32K de contexto en una RTX 5070. Los resultados pueden no transferir a otros backends, versiones de llama.cpp o configuraciones de sampling.
- La tabla completa de benchmarks por tarea no está disponible en la información consultada; las cifras por benchmark citadas en la model card no se pueden verificar aquí.
- Riesgo de alucinación inherente al modelo base de 4B, no corregido por la cuantización: no hay entrenamiento ni alineamiento adicional en este artefacto.
- Sesgos: heredados de Qwen3.5-4B; el autor no publica análisis de sesgo específico para esta cuantización.
- Tool calling, agentes y modo multimodal no están documentados; no deben asumirse en producción sin pruebas propias.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base y conviene revisar el LICENSE enlazado por el autor.
- El rendimiento de memoria citado excluye el contexto CUDA (~1,05 GiB), por lo que la huella real en GPU es mayor que las cifras de densidad de capacidad.
- Fichero GGUF único: no se publican variantes por tamaño ni versiones en safetensors de la cuantización, lo que limita el ajuste fino del compromiso memoria/calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GEHIRNS/magi-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Coleccion MAGI 1.0: https://huggingface.co/collections/GEHIRNS/magi-10-6adaeeaefd1d999584a8a12d
- Repositorio con receta y datos: https://github.com/GEHIRNS/magi
- Articulo *Where the Bits Go* (GEHIRNS, 2026): https://github.com/GEHIRNS/magi/blob/main/paper/where-the-bits-go.pdf
- Perfil del autor: https://huggingface.co/GEHIRNS
