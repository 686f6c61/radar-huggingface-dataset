# Aslam7/Vibe-Coding-Qwen3-SLM

## Resumen
Vibe-Coding-Qwen3-SLM es un modelo de lenguaje causal de tipo transformer, desarrollado por el usuario Aslam7 y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo compacto de generacion de texto orientado a instrucciones de programacion ("vibe coding"), inicializado desde cero a partir de la configuracion `Qwen3Config` de la familia Qwen3, sin cargar pesos preentrenados de ningun modelo Qwen3 existente. El tokenizador, en cambio, si procede de `Qwen/Qwen3-8B`.

El modelo cuenta con 173.404.416 parametros y una arquitectura deliberadamente pequena: 6 capas, tamano oculto de 512, 8 cabezas de atencion y 2 cabezas KV (GQA), con un tamano intermedio de 1536. Su ventana de contexto es de solo 128 tokens, lo que lo situa muy por debajo de los estandares actuales para tareas de codigo o conversacion multi-turno.

La relevancia de este modelo es limitada y de caracter demostrativo. El propio autor lo describe como una demostracion de pipeline de entrenamiento y de reproduccion de plantillas, no como evidencia de capacidad amplia de programacion: el dataset de entrenamiento contiene 1.100.000 filas pero solo 14 plantillas de instruccion unicas y 14 pares instruccion/respuesta unicos, con una division de test de una sola plantilla y un exact match de 0.0000. Es, por tanto, un artefacto educativo o de prueba de infraestructura, no un modelo apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3Config), 6 capas, hidden size 512, 8 cabezas de atencion, 2 cabezas KV (GQA) |
| Parametros totales | 173.404.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona instrucciones para Ollama, pero sin detallar cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer causal decoder-only construido sobre `Qwen3Config` con hiperparametros reducidos: 6 capas, dimension oculta de 512, 8 cabezas de atencion con solo 2 cabezas KV (atencion con query grouping), feed-forward de 1536 y contexto maximo de 128 tokens. La inicializacion fue aleatoria; no se cargaron pesos preentrenados de Qwen3, aunque el tokenizador se tomo de `Qwen/Qwen3-8B`. Esto implica que el modelo no hereda el conocimiento ni las capacidades del Qwen3 original.

El entrenamiento se realizo sobre el dataset `CodeDevX/Vibe-Coding-Instruct` con AdamW, schedule de warmup mas coseno, acumulacion de gradientes, precision mixta y clipping de gradientes, durante 1200 actualizaciones del optimizador (el maximo configurado). No se documenta el numero de tokens procesados ni si hubo etapas de RLHF, DPO o ajuste por preferencias. El punto critico es la composicion del dataset: 1.100.000 filas crudas pero solo 14 plantillas de instruccion unicas y 14 pares instruccion/respuesta unicos, con divisiones agrupadas por plantilla normalizada. El conjunto de test contiene una unica plantilla y el exact match reportado es 0.0000. El autor advierte explicitamente que se trata de una demostracion de pipeline y de reproduccion de plantillas, no de una evaluacion de capacidad de codigo.

## Capacidades
- Generacion de texto causal basica en formato instruccion/respuesta, limitada a las plantillas vistas en entrenamiento.
- Reproduccion de plantillas de instruccion del dataset `CodeDevX/Vibe-Coding-Instruct` (14 plantillas unicas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el contexto de 128 tokens impide cadenas de razonamiento largas.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Integracion con `text-generation-inference` y endpoints compatibles segun los tags del repositorio.

## Casos de uso
- Demostracion de pipeline de entrenamiento: el modelo sirve para validar un flujo completo de inicializacion, tokenizacion, entrenamiento con AdamW, evaluacion por plantilla y publicacion en Hugging Face, dado que el autor lo define como demostracion de pipeline.
- Pruebas de integracion con transformers y TGI: al ser un checkpoint safetensors compatible con `text-generation-inference` y endpoints, permite verificar el despliegue de un modelo pequeno (0,7 GB de repo) en infraestructura de inferencia.
- Validacion de tokenizadores Qwen3: al usar el tokenizador de `Qwen/Qwen3-8B`, puede emplearse para comprobar el comportamiento de dicho tokenizador en pipelines propios sin cargar el modelo grande.
- Reproduccion de plantillas controladas: en entornos de test donde se necesite generar respuestas a partir de un conjunto fijo y conocido de 14 plantillas, el modelo puede reproducir esas plantillas de forma determinista.
- Docencia y experimentacion con arquitecturas Qwen3: su tamano reducido (6 capas, hidden 512) permite estudiar la configuracion Qwen3Config y el efecto de la atencion con GQA en un modelo que cabe en cualquier GPU consumer.
- Pruebas de regresion de herramientas de evaluacion: util para verificar que un harness de evaluacion detecta correctamente el sobreajuste a plantillas (exact match 0.0000 en test) antes de aplicarlo a modelos reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es el exact match de 0.0000 sobre la unica plantilla de test, que el propio autor califica de reproduccion de plantillas y no de capacidad de codigo.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp16 (173,4 M de parametros) y alrededor de 0,7 GB en el repositorio completo; en cuantizacion de 8 bits o 4 bits el peso se reduce a unos 0,17 GB y 0,09 GB respectivamente, aunque no se documentan ficheros GGUF.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de VRAM, y tambien en inferencia por CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); el autor menciona instrucciones para Ollama en el README del proyecto, aunque no se detallan cuantizaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vibe-Coding-Qwen3-SLM (Aslam7) | 173,4 M | 128 | Apache 2.0 | Hugging Face, 0 descargas | Entrenado desde cero, dataset de 14 plantillas, sin benchmarks |
| Qwen3-0.6B (Alibaba) | 0,6 B | contexto largo (segun familia Qwen3) | Apache 2.0 | Hugging Face | Preentrenado y ajustado, capacidades reales de codigo y razonamiento |
| Qwen3-1.7B (Alibaba) | 1,7 B | contexto largo (segun familia Qwen3) | Apache 2.0 | Hugging Face | Preentrenado y ajustado, mayor capacidad y contexto |
| SmolLM2-135M (Hugging Face) | 135 M | 8.192 | Apache 2.0 | Hugging Face | Modelo pequeno preentrenado con datos diversos y benchmarks publicados |

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para Vibe-Coding-Qwen3-SLM. Frente a alternativas preentrenadas del mismo orden de magnitud, este modelo carece de conocimiento general y de contexto utilizable.

## Limitaciones y advertencias
- Inicializacion aleatoria: no se cargaron pesos preentrenados, por lo que el modelo no tiene conocimiento general ni capacidades de codigo mas alla de las plantillas vistas.
- Sobreajuste severo a plantillas: 14 plantillas unicas y 14 pares instruccion/respuesta en 1,1 millones de filas; el exact match en test es 0.0000.
- Contexto de solo 128 tokens: insuficiente para conversaciones multi-turno, generacion de codigo realista o razonamiento encadenado.
- Riesgo elevado de alucinacion y de respuestas degeneradas fuera de las plantillas de entrenamiento.
- Sesgos conocidos: no documentados; al no haber datos diversos, no es posible caracterizarlos.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo (demostracion de pipeline) desaconseja cualquier uso en produccion.
- No apto para produccion: el propio autor lo presenta como demostracion de pipeline y evaluacion de reproduccion de plantillas, no como evidencia de capacidad de programacion.
- Sin datos de benchmarks ni de rendimiento, no es posible compararlo cuantitativamente con alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Aslam7/Vibe-Coding-Qwen3-SLM
- Dataset de entrenamiento: https://huggingface.co/datasets/CodeDevX/Vibe-Coding-Instruct
- Tokenizador de origen: https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
