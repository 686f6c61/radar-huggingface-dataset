# FSCCS/Qwen3.5-4B-MMFlash

## Resumen

Qwen3.5-4B-MMFlash es un modelo borrador (draft model) para decodificación especulativa sobre el modelo objetivo Qwen/Qwen3.5-4B, desarrollado por el usuario FSCCS. No se trata de un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo verifica, acelerando la inferencia en servidores que implementan decodificación especulativa con SGLang y el algoritmo DFLASH. Con 537 millones de parámetros en bf16, es un componente auxiliar que se acopla al modelo base de 4B.

La arquitectura se basa en DFlash, un esquema de block-diffusion drafting: el borrador lee los estados ocultos de cinco capas del modelo objetivo (capas 1, 8, 15, 22 y 29 de 32) y propone un bloque de 16 tokens en un único forward pass, que el modelo objetivo verifica también en un solo paso. La innovación de MMFlash respecto a DFlash es que está entrenado sobre datos multimodales (imagen y texto) con una función de pérdida ponderada por puntuaciones de visual-grounding (visual-KL) por token.

Su relevancia actual reside en que permite reducir la latencia de inferencia de Qwen3.5-4B en cargas multimodales sin modificar el modelo objetivo, manteniendo la calidad de la verificación. El repositorio ocupa 1,1 GB y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion draft model (DFlash) sobre estados ocultos del modelo objetivo |
| Parametros totales | 537.427.200 (537M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; el ejemplo de vLLM usa 32768) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MMFlash hereda la arquitectura de DFlash, un esquema de decodificación especulativa basado en block diffusion. En lugar de generar tokens de uno en uno, el borrador consume los estados ocultos de cinco capas del modelo objetivo (1, 8, 15, 22 y 29 de las 32 totales) y propone un bloque completo de 16 tokens en un único forward pass. El modelo objetivo verifica después ese bloque también en un solo paso, aceptando o corrigiendo las propuestas. El tamaño del bloque está fijado en 16 y se configura en SGLang mediante `--speculative-dflash-block-size 16`.

El entrenamiento se realizó sobre datos multimodales (imagen y texto) partiendo del modelo base Qwen/Qwen3.5-4B, con una función de pérdida ponderada por puntuaciones de visual-grounding (visual-KL) calculadas por token. Esta ponderación prioriza los tokens con mayor dependencia del contenido visual, lo que resulta relevante para cargas de trabajo que combinan imagen y texto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Decodificación especulativa de bloques de 16 tokens en un único forward pass, verificados por el modelo objetivo en otro paso.
- Soporte de entradas multimodales (imagen y texto), entrenado específicamente para ese dominio.
- Integración con SGLang mediante el algoritmo DFLASH y el parser de razonamiento qwen3.
- Compatibilidad con backends de atención diferenciados para texto (`fa3`) y multimodal (`sdpa`).
- No es un modelo generativo autónomo: no produce respuestas por sí mismo, solo propuestas de tokens para el modelo objetivo.
- No dispone de tool calling, function calling ni capacidades de agente propias; estas residen en el modelo objetivo Qwen3.5-4B.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia multimodal en producción: desplegar Qwen3.5-4B con MMFlash como borrador en SGLang permite reducir la latencia por token en cargas que combinan imagen y texto, manteniendo la verificación del modelo objetivo.
- Servicios de descripción de imágenes o VQA de baja latencia: el borrador propone bloques de 16 tokens que el modelo objetivo valida, lo que resulta adecuado para aplicaciones interactivas donde el tiempo de respuesta es crítico.
- Asistentes conversacionales con entrada visual: al integrarse en un servidor SGLang con `--reasoning-parser qwen3`, puede acelerar conversaciones multi-turno que incluyen capturas o documentos escaneados.
- Procesamiento por lotes de documentos con texto e imagen: el esquema de block diffusion reduce el número de pasos de decodificación, lo que mejora el throughput en pipelines de extracción de información.
- Investigación en decodificación especulativa multimodal: sirve como referencia reproducible para estudiar el impacto de la ponderación visual-KL en la tasa de aceptación de tokens.
- Evaluación comparativa de borradores: permite medir la ganancia de velocidad frente a un borrador entrenado solo con texto sobre el mismo modelo objetivo Qwen3.5-4B.
- Prototipado de servidores de inferencia con SGLang: el comando de lanzamiento documentado facilita reproducir la configuración DFLASH en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: 537M parámetros en bf16 equivalen aproximadamente a 1,1 GB de pesos; el repositorio ocupa 1,1 GB.
- VRAM total: debe sumarse a la del modelo objetivo Qwen3.5-4B, que se sirve en bf16 junto con el borrador en el mismo servidor SGLang.
- GPU recomendadas: no disponibles de forma explícita; el ejemplo oficial usa el backend de atención `fa3` (FlashAttention 3), asociado a GPUs Hopper (H100) y, según versión, Ada (RTX 4090, L40S).
- Cabe en GPU de consumo: el borrador por sí solo sí (1,1 GB), pero el despliegue completo depende del modelo objetivo de 4B y del backend de atención requerido.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH` (documentado). El README incluye un ejemplo con vLLM que aparece truncado en la información disponible; no se confirma soporte completo en vLLM.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del borrador y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FSCCS/Qwen3.5-4B-MMFlash | 537M | no disponible | Borrador especulativo multimodal para Qwen3.5-4B | Apache 2.0 | Hugging Face |
| DFlash (z-lab) | no disponible | no disponible | Borrador especulativo base, orientado a texto | no disponible | GitHub |
| Qwen/Qwen3.5-4B | 4B (modelo objetivo) | no disponible | Modelo generativo completo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse sin el modelo objetivo Qwen/Qwen3.5-4B ni sin un servidor que implemente decodificación especulativa DFLASH.
- El campo `inference: false` de la model card indica que no está pensado para inferencia directa.
- Requiere SGLang con soporte DFLASH y `--trust-remote-code`; el soporte en vLLM no queda confirmado en la información disponible.
- El ejemplo oficial desactiva la caché radix (`--disable-radix-cache`), lo que puede afectar al rendimiento en cargas con prefijos repetidos.
- El tamaño de bloque está fijado en 16; desviarse de ese valor puede degradar la tasa de aceptación.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica directamente al borrador, pero las propuestas rechazadas por el modelo objetivo no llegan al usuario; la calidad final depende de la verificación del modelo base.
- Idiomas soportados: no disponibles.
- Uso comercial: permitido bajo Apache 2.0, sujeto a las condiciones de la licencia del modelo objetivo Qwen3.5-4B.
- El autor indica que planea publicar un checkpoint para Qwen4; la compatibilidad futura no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FSCCS/Qwen3.5-4B-MMFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio DFlash: https://github.com/z-lab/dflash
- Contacto del autor: fscnkucs@gmail.com
