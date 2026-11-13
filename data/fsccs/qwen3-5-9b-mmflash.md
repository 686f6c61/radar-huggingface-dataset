# FSCCS/Qwen3.5-9B-MMFlash

## Resumen

Qwen3.5-9B-MMFlash es un modelo borrador (draft model) para decodificacion especulativa del modelo objetivo Qwen/Qwen3.5-9B, desarrollado por el usuario FSCCS. No es un modelo de lenguaje autonomo: se empareja con el modelo objetivo dentro de un servidor de decodificacion especulativa (SGLang con backend DFLASH) para acelerar la inferencia sobre entradas de imagen y texto. Su proposito es proponer bloques de tokens que el modelo grande verifica en un unico paso, manteniendo la salida identica a la del modelo objetivo (decodificacion sin perdida).

Tecnicamente, MMFlash hereda la arquitectura de DFlash (block-diffusion drafting): el borrador lee los estados ocultos de cinco capas del modelo objetivo y propone un bloque de 16 tokens en un solo forward pass, que el objetivo verifica tambien en un solo paso. La variante MMFlash se entrena sobre datos multimodales con una perdida ponderada por puntuaciones de fundamentacion visual (visual-KL) por token.

El interes actual es practico: permite reducir la latencia de Qwen3.5-9B en cargas multimodales sin alterar la calidad de las respuestas. El checkpoint publicado ocupa 2,1 GB en safetensors y contiene 1.048.626.432 parametros (aproximadamente 1,05B en bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash block-diffusion draft model (borrador para decodificacion especulativa) |
| Parametros totales | 1.048.626.432 (aprox. 1,05B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo objetivo | Qwen/Qwen3.5-9B |
| Tamano de bloque | 16 tokens |
| Capas objetivo leidas | 1, 8, 15, 22, 29 (de 32) |
| Inferencia standalone | no (requiere el modelo objetivo y SGLang DFLASH) |

## Arquitectura y entrenamiento

MMFlash es un modelo borrador basado en la tecnica DFlash de block-diffusion drafting, desarrollada por el proyecto z-lab/dflash. En lugar de generar tokens de forma autoregresiva uno a uno, el borrador consume los estados ocultos de cinco capas intermedias del modelo objetivo (capas 1, 8, 15, 22 y 29 de las 32 totales) y emite en un unico forward pass un bloque de 16 tokens candidatos. El modelo objetivo verifica ese bloque completo tambien en un solo forward pass, aceptando los tokens correctos y corrigiendo el resto, de modo que el resultado final es identico al de la decodificacion greedy del objetivo.

La innovacion especifica de MMFlash frente a DFlash es el entrenamiento multimodal: el modelo se entrena sobre datos de imagen y texto con una funcion de perdida ponderada por puntuaciones de fundamentacion visual (visual-KL) por token, lo que prioriza la calidad del borrador en los tokens cuyo contenido depende de la imagen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el modelo card solo indica que se entreno sobre datos multimodales.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre entradas de imagen y texto, emparejado con Qwen3.5-9B.
- Aceleracion de inferencia sin perdida: la salida coincide con la del modelo objetivo en decodificacion greedy, segun el ejemplo publicado en la model card (pregunta de MathVista sobre una H200).
- Procesamiento multimodal: soporta entradas de imagen junto con texto, con entrenamiento orientado a la fundamentacion visual.
- Borrador por bloques: propone 16 tokens por forward pass, verificado por el objetivo en un solo paso.
- Integracion con SGLang mediante el backend DFLASH (variable de entorno SGLANG_ENABLE_OVERLAP_PLAN_STREAM=1).
- No soporta uso autonomo: no es un modelo de chat, no genera respuestas por si mismo ni ofrece tool calling, agentes o razonamiento independiente.

## Casos de uso

- Aceleracion de asistentes multimodales: desplegar Qwen3.5-9B con MMFlash como borrador en SGLang para reducir la latencia de respuestas sobre preguntas con imagen, manteniendo la misma salida que el modelo objetivo.
- Servicio de VQA (visual question answering) en produccion: el borrador propone bloques de 16 tokens que el objetivo verifica, lo que permite atender consultas sobre documentos escaneados o capturas con menor tiempo por token.
- Evaluacion de modelos sobre benchmarks visuales: ejecutar tareas tipo MathVista con decodificacion especulativa sin alterar las respuestas, util para reducir el coste computacional de las evaluaciones.
- Pipelines de extraccion de informacion de imagenes: procesar lotes de imagenes con preguntas de texto asociadas en un servidor SGLang, aprovechando el entrenamiento con perdida ponderada por fundamentacion visual.
- Prototipado de infraestructura de inferencia: comparar el rendimiento de DFlash/MMFlash frente a decodificacion estandar en el mismo hardware (por ejemplo, una H200) antes de adoptar decodificacion especulativa en produccion.
- Despliegue de bajo coste en GPUs de un solo nodo: al ser un borrador de 1,05B en bf16, el coste adicional de memoria frente al objetivo de 9B es reducido, lo que facilita habilitar la aceleracion en servidores ya existentes.
- Investigacion en decodificacion especulativa multimodal: servir como referencia para estudiar el efecto de la ponderacion visual-KL en la tasa de aceptacion de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una demostracion cualitativa (pregunta de MathVista en una NVIDIA H200 con SGLang, decodificacion greedy) en la que todos los metodos imprimen la misma respuesta que el modelo objetivo, sin cifras de velocidad, tasa de aceptacion ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 2,1 GB en bf16 (tamano del repo), adicionales a la memoria del modelo objetivo Qwen3.5-9B.
- VRAM total del sistema: la del objetivo (segun cuantizacion, no disponible en esta ficha) mas los aproximadamente 2,1 GB del borrador y el overhead de SGLang.
- GPU recomendadas: la model card cita una NVIDIA H200 para la demostracion; por tamano, cualquier GPU con memoria suficiente para el objetivo mas el borrador deberia poder alojarlo.
- GPU de consumo: el borrador en si cabe en cualquier GPU consumer moderna (8 GB o mas), pero el requisito real lo marca el modelo objetivo de 9B.
- Opciones de despliegue: SGLang con backend DFLASH (unica opcion documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican cifras de speedup ni de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FSCCS/Qwen3.5-9B-MMFlash | Borrador especulativo multimodal (DFlash) | 1,05B | no disponible | Apache 2.0 | Hugging Face |
| DFlash (z-lab) | Borrador especulativo block-diffusion (referencia base) | no disponible | no disponible | no disponible | GitHub z-lab/dflash |
| Decodificacion estandar de Qwen3.5-9B | Sin borrador | 9B (objetivo) | no disponible | segun Qwen3.5-9B | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse sin Qwen/Qwen3.5-9B ni fuera de un servidor de decodificacion especulativa SGLang con DFLASH.
- La model card marca `inference: false`; el uso previsto es como borrador dentro de un servidor, no como pipeline de Hugging Face.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del incluido en los datos de entrenamiento (no disponibles).
- No se documentan tipos de cuantizacion soportados; el checkpoint se distribuye en bf16.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3.5-9B y de SGLang/DFlash, cuyas condiciones deben verificarse por separado.
- Proyecto de autor individual (FSCCS) con muy baja adopcion (6 descargas, 1 like en el momento de la consulta); no hay garantias de mantenimiento, aunque el autor anuncia futuras actualizaciones y un checkpoint para Qwen4.
- Al ser decodificacion especulativa sin perdida en modo greedy, el riesgo de degradacion de calidad es bajo, pero no se han publicado mediciones de tasa de aceptacion ni de speedup real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FSCCS/Qwen3.5-9B-MMFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio DFlash: https://github.com/z-lab/dflash
- Demo en video: https://huggingface.co/FSCCS/Qwen3.5-9B-MMFlash/resolve/main/assets/demo.mp4
- Contacto del autor: fscnkucs@gmail.com
