# qinghuali/Occamy-1.0-oQ6e-mtp

## Resumen

Occamy-1.0-oQ6e-mtp es una cuantización comunitaria del modelo occamy-1.0 de Accio-Lab, publicada por el usuario qinghuali, que fusiona en un único conjunto de pesos el modelo base (35B-A3B MoE con codificador visual) y su cabecera de predicción multi-token (MTP). El resultado se exporta en formato MLX con la receta oQ6e de oMLX (6 bits mixtos) para ejecutarse de forma nativa en Apple Silicon con decodificación especulativa activada.

El modelo hereda la arquitectura del checkpoint original: 35.951.822.704 parámetros totales, unos 3B activos por token, 40 capas más una capa MTP, 256 expertos (8 enrutados y 1 compartido por token), atención híbrida lineal (GDN) combinada con atención completa, ventana de contexto de 262.144 tokens y un codificador visual de 27 capas que se mantiene sin cuantizar.

Su relevancia es doble. Por un lado, simplifica el despliegue de MTP: el repositorio oficial entrega la cabecera como artefacto separado que exige un runtime SGLang parcheado, mientras que aquí los 19 tensores `mtp.*` quedan integrados en el índice de pesos y `text_config.mtp_num_hidden_layers` pasa de 0 a 1. Por otro, permite ejecutar un MoE de 35B con visión en un Mac con 64 GB de memoria unificada (unos 29 GB de pesos cargados) con una velocidad de decodificación mediana de 110,5 tok/s. No es una publicación oficial y no ha sido validada por Accio-Lab.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (tag `qwen3_5_moe`): capas de atención lineal GDN combinadas con capas de atención completa (una de cada cuatro); 40 capas + 1 capa MTP |
| Parametros totales | 35.951.822.704 (≈35B) |
| Parametros activos | ≈3B por token (35B-A3B); 256 expertos, 8 enrutados + 1 compartido por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ6e de oMLX: base 6 bits (expertos 6 bits, grupo 64; parte de lenguaje ≈6,6 bpw; archivo completo con torre visual ≈6,7 bpw), con embeddings, proyecciones de atención/GDN y expertos compartidos en 8 bits; normas, enrutado MoE, capa MTP fusionada y torre visual completa sin cuantizar. Existen repos oficiales GGUF / MLX / FP8 / NVFP4 sin MTP |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors, 6 fragmentos, 30,28 GB (28,20 GiB) |
| Codificador visual | 27 capas, preservado a precisión completa |
| Pipeline | no disponible |
| Libreria de inferencia | mlx (oMLX 0.7.0) |
| Descargas / likes | 2 / 0 |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) de 35B totales y 3B activos por token, con 256 expertos de los que se enrutan 8 más 1 compartido en cada token. La pila de 40 capas alterna capas de atención lineal GDN con capas de atención completa (una de cada cuatro), lo que reduce el coste de memoria del caché KV para el contexto largo de 262.144 tokens. Sobre esa base se añade una capa MTP (`mtp_num_hidden_layers: 1`) que actúa como cabecera de borrador para decodificación especulativa, y un codificador visual de 27 capas heredado del checkpoint original.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre etapas de RLHF o DPO del modelo base; esta ficha solo describe una recuantización, no un reentrenamiento. La innovación técnica del repositorio es de empaquetado e inferencia: fusiona la cabecera MTP oficial en el directorio del modelo igual que hace el helper `assemble_head.py` de upstream y aplica cuantización mixta con calibración imatrix (`oqe_code_multilingual`, 128×512, cobertura de expertos del 100 %). El tag del repositorio referencia `arxiv:2609.11977`.

## Capacidades

- Generación de texto y razonamiento en modo agente, con modo de pensamiento (thinking) recomendado por upstream para uso agéntico general.
- Llamada a herramientas y salida estructurada: en los registros medidos, 71 de 113 peticiones fueron de tool calling o salida estructurada, con una tasa de aceptación del borrador MTP del 85,7 %.
- Razonamiento multi-paso y flujos agénticos multi-turno, con prompts observados de hasta 142.277 tokens.
- Contexto largo: 262.144 tokens declarados en el config heredado, aprovechables para repositorios, expedientes o historiales extensos.
- Capacidad multimodal de entrada: incluye la torre visual de 27 capas del modelo original, preservada a precisión completa.
- Decodificación especulativa mediante predicción multi-token: mediana de 2,83 tokens generados por ciclo de verificación, frente a 1 token por pasada en decodificación sin MTP.
- Generación de texto largo en una sola respuesta: en los registros hay generaciones de 5.675 tokens a 128,2 tok/s y de 5.463 tokens a 123,8 tok/s.
- Capacidades multilingües: no disponible.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto el modelo puede mantener conversaciones multi-turno con historial completo, fichas de producto y políticas internas sin truncar, y el modo de salida estructurada facilita devolver respuestas clasificadas o campos JSON para el CRM.
- Agentes de código en local: soporta tool calling y salida estructurada, por lo que puede integrarse en pipelines de CI/CD como revisor de parches o generador de tests, con la ventaja de que todo el cómputo permanece en el equipo.
- Despliegue on-premise con datos sensibles: al ejecutarse íntegramente en Apple Silicon mediante oMLX, no requiere enviar prompts a servicios externos, lo que encaja en entornos con requisitos de confidencialidad (legal, sanidad, banca).
- Análisis de documentación extensa: los registros de uso incluyen prompts de hasta 142.277 tokens, de modo que es viable resumir o interrogar repositorios completos, contratos o informes largos en una sola ventana.
- Extracción de datos estructurados: la aceptación MTP del 85,7 % en salidas estructuradas y una mediana de 122,5 tok/s en ese tipo de contenido lo hacen adecuado para lotes de extracción de entidades o normalización de registros.
- Asistente de desarrollo con razonamiento: activando el modo thinking y los parámetros de muestreo recomendados por upstream (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) puede abordar depuración y explicación de código paso a paso.
- Procesamiento de documentos escaneados o capturas: la torre visual heredada permite tareas de imagen a texto, si bien la decodificación especulativa con visión (vision-MTP) queda desactivada por defecto.
- Generación de contenido largo: para informes o documentación técnica extensa, las generaciones medidas superan los 5.000 tokens a más de 120 tok/s en un M4 Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo aporta métricas de ejecución de la decodificación especulativa, obtenidas de registros de uso real en una única máquina y sin ejecución de referencia con MTP desactivado.

Configuración de la medición: oMLX 0.7.0, este repositorio, MTP activado con profundidad adaptativa máxima 3, Mac Studio con Apple M4 Max y 64 GB de memoria unificada, temperatura 0.7, una petición concurrente, entre el 8 y el 10 de octubre de 2026. Total: 113 peticiones con estadísticas MTP, 81.444 tokens generados, prompts de 52 a 142.277 tokens. La velocidad se define como tokens generados divididos entre el tiempo de petición menos el TTFT, excluyendo el prefill.

| Métrica | Aceptado / propuesto | Tasa |
|---|---:|---:|
| Global | 48.501 / 62.218 | 77,95 % |
| Profundidad 1 | 23.626 / 29.743 | 79,43 % |
| Profundidad 2 | 16.568 / 21.727 | 76,26 % |
| Profundidad 3 | 8.307 / 10.748 | 77,29 % |

| Métrica | Mediana | p10 | p90 |
|---|---:|---:|---:|
| Tokens por ciclo de verificación | 2,83 | 2,25 | 3,36 |
| Velocidad de decodificación (tok/s) | 110,5 | 78,0 | 146,9 |

| Tipo de salida | Peticiones | Aceptación | Decodificación mediana |
|---|---:|---:|---:|
| Tool calls / estructurada | 71 | 85,7 % | 122,5 tok/s |
| Texto libre | 42 | 75,8 % | 96,6 tok/s |

Velocidad máxima de decodificación observada: 165,7 tok/s. El autor no reclama ningún multiplicador de aceleración, ya que no existe comparación con MTP desactivado para este artefacto en oMLX.

## Requisitos de hardware

- Memoria: el repositorio ocupa 30,28 GB (28,20 GiB) y requiere aproximadamente 30 GB de memoria unificada libre para los pesos, más el caché KV y el contexto.
- Carga medida en producción: unos 29 GB de pesos cargados en un Mac Studio con M4 Max y 64 GB.
- Plataforma: exclusivamente Apple Silicon con macOS 15 o superior, al ser un artefacto MLX para oMLX; no hay pesos GGUF ni safetensors estándar en este repositorio.
- GPU recomendadas: no disponible para CUDA; el modelo base en BF16 puede servirse en Transformers, vLLM o SGLang, pero la cabecera MTP fusionada de este repositorio requiere oMLX y, en el caso de la cabecera separada oficial, un SGLang parcheado.
- Cabe en GPU de consumo: no aplica en el sentido habitual, ya que no se distribuye para GPUs NVIDIA o AMD; en el ecosistema Apple encaja en equipos con 64 GB o más de memoria unificada.
- Opciones de despliegue: oMLX 0.7.0 mediante `omlx serve --model-dir /path/to/models --port 8000`, con endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1`, interfaz de aplicación de oMLX o herramientas de agente.
- Latencia y throughput: mediana de 110,5 tok/s de decodificación (p10 78,0; p90 146,9; máximo observado 165,7) con MTP activado y profundidad adaptativa hasta 3, en una sola petición concurrente.
- Requisitos de configuración: activar MTP en los ajustes del modelo y mantener desactivado vision-MTP (valor por defecto).

## Comparativa con modelos similares

Los comparables directos son los propios artefactos de la familia occamy-1.0, ya que no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

| Artefacto | Cabecera MTP | Formato / runtime | Precisión | Licencia |
|---|---|---|---|---|
| occamy-1.0 (oficial, Accio-Lab) | No | BF16 safetensors · Transformers / vLLM / SGLang | BF16 | apache-2.0 (según etiqueta del derivado) |
| occamy-1.0-MTP (oficial, Accio-Lab) | Cabecera separada (1,69 GB) | SGLang parcheado (bases BF16 / NVFP4) | BF16 / NVFP4 | no disponible |
| Repos oficiales GGUF / MLX / FP8 / NVFP4 | No | llama.cpp / mlx-lm y otros | varias | no disponible |
| Este repositorio (comunitario) | Fusionada en los pesos | MLX safetensors · oMLX (oQ6e, 6 bits) | 6 bits mixtos | apache-2.0 |

Frente al resto de la familia, este artefacto es el único que integra la cabecera MTP en el propio directorio de pesos y el único cuantizado con receta oQ6e para oMLX. No se dispone de comparación de calidad (benchmarks) frente a los artefactos oficiales en BF16, por lo que no puede cuantificarse la pérdida por cuantización.

## Limitaciones y advertencias

- Publicación no oficial: el autor indica explícitamente que no está verificada por Accio-Lab; el repositorio lo mantiene el usuario qinghuali.
- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de calidad general, ni comparación con el modelo base en BF16, por lo que la degradación por cuantización a 6 bits no está medida.
- Las cifras de rendimiento provienen de registros de uso real en una sola máquina, con una sola petición concurrente y sin ejecución de referencia con MTP desactivado; no debe interpretarse como un multiplicador de aceleración garantizado.
- El comportamiento de muestreo de la cabecera MTP no está validado por el autor del repositorio ni por upstream; las sesiones medidas usaron temperatura 0.7, mientras que upstream recomienda temperature 1.0, top_p 0.95, top_k 20 y presence_penalty 1.5 con thinking activado.
- La decodificación con MTP puede aparcarse a mitad de petición si la aceptación se degrada (visible como `finish=parked`), lo que afecta a la velocidad puntual.
- Idiomas soportados: no documentados en la información disponible; no puede confirmarse cobertura multilingüe ni su calidad.
- Riesgo de alucinación: no se ha publicado ninguna evaluación específica de veracidad o alucinación para este artefacto ni para el modelo base en la información disponible.
- Ventana de contexto: los 262.144 tokens son una capacidad declarada del config heredado; el uso real de contextos muy largos incrementa el consumo de caché KV por encima de los ~29-30 GB de pesos y puede superar la memoria de equipos de 64 GB.
- Restricciones de plataforma: al ser un artefacto MLX, no es desplegable en GPUs NVIDIA o AMD sin reconvertir; queda ligado al ecosistema Apple Silicon y a oMLX.
- La licencia declarada es apache-2.0, pero conviene verificar los términos del modelo base de Accio-Lab antes de un uso comercial, ya que la licencia del upstream no se detalla en la información disponible.
- Adopción mínima: 2 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qinghuali/Occamy-1.0-oQ6e-mtp
- Modelo base oficial: https://huggingface.co/Accio-Lab/occamy-1.0
- Cabecera MTP oficial: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Referencia del paper citada en las etiquetas: https://arxiv.org/abs/2609.11977
- Runtime oMLX: https://omlx.ai
