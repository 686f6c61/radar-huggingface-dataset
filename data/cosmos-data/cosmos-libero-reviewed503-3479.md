# Cosmos-Data/cosmos-libero-reviewed503-3479

## Resumen

Cosmos LIBERO-40 reviewed503 joint policy at step 3479 es un checkpoint de entrenamiento distribuido en PyTorch nativo del modelo Cosmos3-Nano, una política conjunta de vídeo y acción orientada a robótica. Lo desarrolla Cosmos-Data y se ha entrenado desde cero sobre pares vídeo-acción del conjunto LIBERO-40 original, complementados con 503 vídeos OOD (out-of-distribution) revisados de una segunda ronda, con un muestreo ID:OOD de 5:1. Los samples OOD contribuyen únicamente a la supervisión de vídeo.

El artefacto no es un modelo empaquetado para inferencia directa, sino un snapshot de entrenamiento que contiene pesos del modelo y pesos EMA en FP32, estado del optimizador, scheduler, contadores del trainer y los estados RNG de los cuatro rangos guardados. La iteración del trainer y el contador del scheduler son ambos 3479, y la siguiente actualización es la 3480.

Su relevancia es práctica para equipos de investigación en robótica que quieran reanudar o auditar un entrenamiento de política vídeo-acción sobre LIBERO con supervisión adicional de vídeo OOD. El repositorio ocupa 146,9 GB y está etiquetado con el pipeline `robotics`, lo que refleja su naturaleza de checkpoint pesado más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política conjunta vídeo-acción Cosmos3-Nano, entrenamiento distribuido nativo en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en BF16 para entrenamiento y FP32 EMA) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch DCP (checkpoint distribuido), con pesos EMA en FP32 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su denominación como Cosmos3-Nano y su carácter de política conjunta de vídeo y acción. El entrenamiento se realizó desde cero sobre pares vídeo-acción de LIBERO-40 y sobre 503 vídeos OOD revisados de la segunda ronda, con una proporción de muestreo ID:OOD de 5:1. Los samples OOD aportan supervisión de vídeo, no de acción, lo que constituye una estrategia de aumento de datos para mejorar la representación visual del modelo sin alterar la señal de política.

La receta de reanudación documentada utiliza FSDP con grado de shard 4, 256 muestras por GPU, acumulación de gradiente 2, tamaño global de batch objetivo de 2048, precisión BF16, el schedule de learning rate guardado y un total de 5000 actualizaciones. El checkpoint incluye pesos del modelo y EMA en FP32, estado del optimizador, scheduler y estados RNG de los cuatro rangos, lo que permite reanudar el entrenamiento de forma determinista. Se requiere el checkout de Cosmos Framework en el commit `bce1919bbafe19619ea3a662a50321278d85121f`, con dependencias nativas como CUDA y Apex, además del VAE Wan 2.2 y los datasets LIBERO_LeRobot_v3 y reviewed503 round-2 como dependencias separadas.

## Capacidades

- Política conjunta de vídeo y acción para tareas de manipulación robótica en el entorno LIBERO.
- Generación de predicciones de acción condicionadas por observaciones visuales, orientada a control robótico.
- Modelado de vídeo como señal auxiliar de supervisión, incluyendo muestras OOD.
- Entrenamiento y reanudación distribuida con FSDP en cuatro GPUs.
- Soporte de pesos EMA en FP32 para evaluación o continuidad del entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: solo inglés (`en`).

## Casos de uso

- Reanudación de entrenamiento en robótica: el checkpoint permite continuar el entrenamiento desde la iteración 3479 en una nueva máquina usando el script `resume.sh`, con FSDP grado 4 y el schedule de learning rate guardado, lo que facilita migrar cómputo entre clústeres sin perder progreso.
- Auditoría de experimentos de política vídeo-acción: al incluir optimizador, scheduler, contadores y estados RNG, un equipo puede reproducir o inspeccionar el estado exacto del entrenamiento para validar resultados.
- Investigación en supervisión OOD de vídeo: el modelo incorpora 503 vídeos OOD revisados con muestreo 5:1, lo que permite estudiar cómo la supervisión de vídeo fuera de distribución afecta a la política de acción en LIBERO.
- Evaluación de políticas en LIBERO-40: el checkpoint puede usarse como punto de partida para evaluar el rendimiento de la política conjunta en tareas de manipulación del benchmark LIBERO.
- Desarrollo de pipelines de entrenamiento reproducible: la receta documentada (FSDP, BF16, GBS 2048, 5000 updates) sirve como referencia para configurar entrenamientos equivalentes con Cosmos Framework.
- Integración en flujos de investigación con VAE Wan 2.2: el uso del VAE como dependencia separada permite a los equipos reutilizar componentes de codificación visual en otros experimentos de vídeo-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento documentado requiere cuatro GPUs con FSDP grado de shard 4 y 256 muestras por GPU, lo que implica GPUs de alta capacidad de memoria; no se especifica el modelo exacto.
- El repositorio ocupa 146,9 GB, por lo que se necesita almacenamiento suficiente para el checkpoint completo, los datasets LIBERO_LeRobot_v3 y reviewed503 round-2, y el VAE Wan 2.2.
- Dependencias de software: CUDA, Apex y el checkout de Cosmos Framework en el commit indicado.
- No se dispone de datos de VRAM estimada para inferencia, latencia ni throughput.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el artefacto es un checkpoint de entrenamiento en formato DCP, no un modelo de inferencia empaquetado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas vídeo-acción para LIBERO) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: es un checkpoint de entrenamiento con optimizador, scheduler y estados RNG, pensado para reanudar entrenamiento, no para despliegue directo.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas limitados al inglés según los metadatos.
- Dependencia estricta del commit de Cosmos Framework y de dependencias nativas (CUDA, Apex), lo que dificulta la reproducibilidad fuera de ese entorno.
- Los datasets y el VAE Wan 2.2 son dependencias separadas que no se incluyen en el repositorio.
- No se documentan sesgos, tasas de alucinación ni límites de contexto; al tratarse de una política robótica, el riesgo principal es el fallo de control en entornos no representados en los datos de entrenamiento.
- El muestreo OOD 5:1 y la supervisión exclusivamente de vídeo en esas muestras pueden introducir un sesgo hacia la representación visual de los datos revisados.
- El tamaño del repositorio (146,9 GB) y la necesidad de cuatro GPUs limitan su uso a entornos con infraestructura de cómputo significativa.

## Enlaces

- Hugging Face: https://huggingface.co/Cosmos-Data/cosmos-libero-reviewed503-3479
- Cosmos Framework (checkout de entrenamiento): https://github.com/jyzhang1208/cosmos-framework/tree/bce1919bbafe19619ea3a662a50321278d85121f
- Dataset reviewed503 round-2: https://huggingface.co/datasets/Cosmos-Data/libero-self-improved-ood-r1-749-r2-485-20261024/tree/e77c82a5870592e46a03f798644b95a7e4585c9b/round2_reviewed503_20261025
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades no relacionadas (Cosmos.so, jardinería, COSMOS Sports, portran.cm).
