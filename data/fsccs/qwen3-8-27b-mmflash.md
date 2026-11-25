# FSCCS/Qwen3.8-27B-MMFlash

## Resumen

Qwen3.8-27B-MMFlash es un modelo borrador (draft model) para decodificacion especulativa multimodal, desarrollado por FSCCS. No es un modelo de lenguaje autonomo: se empareja con el modelo objetivo Qwen/Qwen3.8-27B en un servidor de decodificacion especulativa (SGLang con backend `DFLASH`) para acelerar la inferencia sobre entradas de imagen y texto. Su proposito es proponer bloques de tokens que el modelo grande verifica en una sola pasada, reduciendo el coste por token generado en cargas de vision-lenguaje.

Tecnicamente hereda la arquitectura de DFlash (block-diffusion drafting): el borrador lee los estados ocultos de cinco capas del modelo objetivo y propone un bloque de 16 tokens en un unico forward pass, que el modelo grande valida tambien en una sola pasada. La innovacion de MMFlash es el entrenamiento sobre datos multimodales con una perdida ponderada por puntuaciones de anclaje visual por token (visual-KL), lo que mejora la calidad del borrador en tareas que combinan imagen y texto.

El checkpoint ocupa unos 3,5 GB y contiene 1.730.213.120 parametros en bf16, coherente con un borrador ligero pensado para no anadir latencia significativa. Se distribuye bajo licencia Apache 2.0 y esta etiquetado como `inference: false` en su model card, lo que subraya que solo tiene sentido dentro de un stack de decodificacion especulativa y no como modelo servible de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafting (DFlash) sobre estados ocultos de 5 capas del modelo objetivo; propone bloques de 16 tokens en un forward pass |
| Parametros totales | 1.730.213.120 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MMFlash mantiene la arquitectura de DFlash, un esquema de borrado por difusion de bloques para decodificacion especulativa. En lugar de generar un token por paso, el borrador consume los estados ocultos de cinco capas del modelo objetivo y emite un bloque de 16 tokens candidatos en una sola pasada; el modelo grande verifica el bloque completo en otro unico forward pass, aceptando el prefijo correcto y corrigiendo donde haga falta. Este diseno reduce el numero de pasos secuenciales del modelo grande por token aceptado.

El entrenamiento se realiza sobre datos multimodales (imagen y texto) y emplea una perdida ponderada por puntuaciones de anclaje visual por token (visual-KL), de modo que el borrador presta mas atencion a los tokens donde la informacion visual es determinante. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre entradas de imagen y texto, emparejado con Qwen/Qwen3.8-27B.
- Borrado por bloques de 16 tokens en un unico forward pass, verificado por el modelo objetivo en otra pasada.
- Aprovechamiento de estados ocultos de cinco capas del modelo objetivo como senal de condicionamiento.
- Entrenamiento especifico para escenarios vision-lenguaje con ponderacion por anclaje visual.
- Integracion con el servidor de decodificacion especulativa SGLang (backend `DFLASH`).
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo: esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleracion de asistentes sobre documentos escaneados: desplegado junto a Qwen3.8-27B en SGLang, el borrador reduce el coste por token en tareas de pregunta-respuesta sobre imagenes de facturas, formularios o informes, donde el modelo grande debe procesar contexto visual extenso.
- Analisis de capturas de pantalla en herramientas de soporte: el par objetivo-borrador acelera la generacion de descripciones y respuestas a partir de imagenes de interfaz, manteniendo la calidad del modelo grande mientras se reduce la latencia percibida.
- Procesamiento por lotes de imagenes medicas o tecnicas con descripcion textual: la ponderacion visual-KL del borrador favorece la aceptacion de tokens ligados a detalles de la imagen, util en pipelines de etiquetado asistido a gran escala.
- Sistemas de accesibilidad que describen imagenes en tiempo real: la reduccion de pasos secuenciales del modelo grande permite respuestas mas agiles en escenarios interactivos con entrada visual.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: investigadores pueden medir la tasa de aceptacion del borrador frente a alternativas (EAGLE, Medusa) sobre el mismo modelo objetivo en tareas multimodales.
- Reduccion de coste en servicios de inferencia multimodal: al disminuir el numero de forward passes del modelo de 27B por token aceptado, se abarata el servicio en GPUs de datacenter sin cambiar el modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 3,5 GB; debe sumarse la memoria del modelo objetivo Qwen3.8-27B y el overhead del servidor SGLang.
- GPU recomendadas: la model card cita una NVIDIA H200 para la demo en tiempo real con SGLang; el modelo objetivo de 27B requiere GPUs de datacenter (H100, H200, A100 80 GB) para un despliegue comodo.
- GPU de consumo: el borrador por si solo cabria en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB), pero el par completo con el modelo objetivo de 27B no cabe en una unica GPU de consumo en bf16.
- Opciones de despliegue: SGLang con backend `DFLASH` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma cuantitativa; la model card solo indica que la demo se grabo en tiempo real con decodificacion greedy en una H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MMFlash | 1,73B | no disponible | Borrador block-diffusion multimodal (DFlash) | Apache 2.0 | Hugging Face |
| DFlash (z-lab) | no disponible | no disponible | Borrador block-diffusion, base arquitectonica de MMFlash | no disponible | GitHub |
| EAGLE / Medusa | no disponible | no disponible | Borradores de decodificacion especulativa (referencia de categoria) | no disponible | Repos publicos |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: la model card lo marca como `inference: false`; requiere el modelo objetivo Qwen/Qwen3.8-27B y un servidor SGLang con backend `DFLASH`.
- Solo acelera; no anade capacidades: la calidad final de las respuestas depende del modelo objetivo, y el borrador unicamente influye en la tasa de aceptacion.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar datos multimodales del entrenamiento, pueden persistir sesgos visuales y culturales no auditados.
- Riesgo de alucinacion: no aplica de forma directa al ser un borrador verificado, pero una baja tasa de aceptacion degradaria la aceleracion sin afectar a la correccion (el modelo objetivo valida cada bloque).
- Idiomas soportados: no disponibles; la cobertura linguistica dependera del modelo objetivo.
- Longitud de contexto: no disponible; el rendimiento del borrador puede degradarse en contextos visuales muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo objetivo Qwen3.8-27B.
- El soporte de herramientas de despliegue esta limitado a SGLang; no hay integraciones documentadas con otros motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/FSCCS/Qwen3.8-27B-MMFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper (MMFlash): https://huggingface.co/papers/2611.18482
- Codigo: https://github.com/fscdc/MMFlash
- Pagina del proyecto: https://fscdc.github.io/MMFlash/
- DFlash (base arquitectonica): https://github.com/z-lab/dflash
