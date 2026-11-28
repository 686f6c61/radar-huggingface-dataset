# FSCCS/Gemma4-E4B-it-MMFlash

## Resumen

Gemma4-E4B-it-MMFlash es un modelo borrador (draft model) para decodificacion especulativa multimodal, desarrollado por el usuario FSCCS y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje autonomo: se acopla a `google/gemma-4-E4B-it` como modelo objetivo dentro de un servidor de decodificacion especulativa (SGLang con backend `DFLASH`) para acelerar la inferencia sobre entradas de imagen y texto.

Tecnicamente, MMFlash hereda la arquitectura de borrador por difusion de bloques de DFlash: el borrador lee los estados ocultos de cinco capas del modelo objetivo y propone un bloque de 16 tokens en un unico forward pass, que el modelo objetivo verifica despues tambien en un solo paso. La innovacion de esta variante es su entrenamiento sobre datos multimodales con una funcion de perdida ponderada por puntuaciones de anclaje visual (visual-KL) por token, lo que mejora la calidad de las propuestas cuando la generacion depende de la imagen de entrada.

Con 537 millones de parametros en bf16 y un repositorio de 1,1 GB, el modelo esta pensado para despliegues de produccion que ya sirven Gemma 4 E4B y necesitan reducir la latencia de decodificacion en cargas multimodales, sin cambiar el modelo de referencia ni la calidad de salida verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador por difusion de bloques (DFlash) sobre transformer, multimodal |
| Parametros totales | 537.427.200 (537M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo, no especificada) |
| Tipos de cuantizacion | bf16 (unico formato publicado; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo objetivo | google/gemma-4-E4B-it |
| Tamano de bloque | 16 tokens |
| Capas objetivo utilizadas | 1, 10, 2 (estados ocultos) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

MMFlash no es un transformer autoregresivo convencional, sino un borrador de difusion de bloques construido sobre la arquitectura DFlash del proyecto z-lab. En cada paso de decodificacion, el borrador consume los estados ocultos de las capas 1, 10 y 2 del modelo objetivo Gemma 4 E4B y genera de una sola pasada un bloque de 16 tokens candidatos. El modelo objetivo verifica despues ese bloque completo en un unico forward pass, aceptando el prefijo correcto y descartando el resto. Este esquema de propuesta-verificacion es el mecanismo clasico de decodificacion especulativa, pero con propuestas por bloque en lugar de token a token.

La contribucion especifica de MMFlash frente a DFlash es el entrenamiento multimodal: el borrador se entrena sobre datos de imagen y texto con una perdida ponderada por puntuaciones de anclaje visual (visual-KL) calculadas por token, de modo que el modelo presta mas atencion a los tokens cuya prediccion depende del contenido visual. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre entradas de imagen y texto, acoplado a Gemma 4 E4B.
- Propuesta de bloques de 16 tokens en un unico forward pass, con verificacion posterior por el modelo objetivo.
- Procesamiento multimodal: el borrador condiciona sus propuestas en los estados ocultos del objetivo, que a su vez integra la informacion de la imagen.
- Ponderacion por anclaje visual durante el entrenamiento, orientada a mejorar la calidad de propuestas en tareas que requieren grounding sobre la imagen.
- Integracion con SGLang mediante el backend `DFLASH`.
- No soporta uso autonomo: no genera texto por si mismo sin el modelo objetivo.
- Soporte de tool calling, agentes, thinking mode, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Aceleracion de asistentes visuales en produccion: desplegar Gemma 4 E4B con MMFlash en SGLang para reducir la latencia de decodificacion en preguntas sobre imagenes, manteniendo la calidad del modelo objetivo gracias a la verificacion por bloque.
- Analisis de documentos escaneados y formularios: el borrador propone bloques de 16 tokens que el objetivo verifica, lo que acelera la extraccion de texto y campos en pipelines de digitalizacion con entrada image-text-to-text.
- Descripcion automatica de imagenes a escala: en servicios que procesan lotes grandes de imagenes, la decodificacion especulativa reduce el coste por peticion sin degradar la salida verificada.
- VQA (visual question answering) interactivo: en interfaces conversacionales con imagenes, la reduccion de latencia por token mejora la fluidez percibida en respuestas multi-turno.
- Moderacion de contenido multimodal: clasificacion y descripcion de imagenes en tiempo casi real dentro de pipelines de revision, donde el throughput importa mas que la generacion creativa.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: usar MMFlash como referencia reproducible (paper, codigo y pesos publicos) para medir tasas de aceptacion de bloques en cargas multimodales.
- Investigacion en decodificacion especulativa multimodal: el entrenamiento con perdida ponderada por visual-KL sirve como base para experimentos sobre anclaje visual en borradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una demostracion en video grabada en tiempo real sobre una NVIDIA H200 con SGLang y decodificacion greedy, pero no se proporcionan cifras de tasa de aceptacion, speedup ni resultados en MMLU, HumanEval, GSM8K, MathVista u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en bf16 para los pesos del borrador, mas la memoria del modelo objetivo Gemma 4 E4B, que domina el consumo total.
- GPU recomendadas: NVIDIA H200 (configuracion usada en la demo oficial); previsiblemente tambien A100 y H100 para despliegues de produccion con SGLang.
- GPU de consumo: el borrador por si solo cabe en cualquier GPU consumer con mas de 2 GB de VRAM, pero el sistema completo requiere alojar Gemma 4 E4B; la viabilidad en RTX 4090 u otras consumer depende del tamano y cuantizacion del modelo objetivo, dato no disponible.
- Opciones de despliegue: SGLang con backend `DFLASH` (unica opcion documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que la demo se grabo en tiempo real en una H200.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Modelo objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-E4B-it-MMFlash | 537M | Borrador por difusion de bloques, multimodal | google/gemma-4-E4B-it | Apache 2.0 | Hugging Face, SGLang |
| DFlash (z-lab) | no disponible | Borrador por difusion de bloques, texto | no disponible | no disponible | GitHub (z-lab/dflash) |
| Borradores EAGLE / Medusa | no disponible | Borradores de decodificacion especulativa | genericos | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia documentada frente a DFlash es el entrenamiento multimodal con perdida ponderada por visual-KL; el resto de parametros comparativos no se detallan.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Gemma 4 E4B acoplado en SGLang con `DFLASH`, no produce salida util.
- Solo se publican pesos en bf16; no hay cuantizaciones documentadas (GGUF, AWQ, GPTQ), lo que limita opciones de despliegue ligero.
- La model card marca `inference: false`; el uso requiere la infraestructura de servidor especifica.
- Idiomas soportados no documentados; la cobertura linguistica depende del modelo objetivo y de los datos de entrenamiento del borrador, no detallados.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el comportamiento del objetivo, pueden propagarse los sesgos de Gemma 4 E4B.
- Riesgo de alucinacion: las propuestas del borrador se verifican contra el objetivo, lo que mitiga el riesgo en la salida final, pero no se documentan tasas de aceptacion ni casos limite.
- La licencia Apache 2.0 del borrador no exime de cumplir los terminos de uso de Gemma 4 E4B, que se rige por su propia licencia.
- Volumen de descargas bajo (172) y creado en noviembre de 2026; ecosistema y validacion externa limitados.
- No se documentan resultados de benchmarks ni comparativas de speedup, por lo que las ganancias de latencia deben medirse en cada despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/FSCCS/Gemma4-E4B-it-MMFlash
- Paper: https://huggingface.co/papers/2611.18482
- Pagina del proyecto: https://fscdc.github.io/MMFlash/
- Codigo: https://github.com/fscdc/MMFlash
- DFlash (base arquitectonica): https://github.com/z-lab/dflash
- Modelo objetivo: https://huggingface.co/google/gemma-4-E4B-it
- Demo en video: https://huggingface.co/FSCCS/Gemma4-E4B-it-MMFlash/resolve/main/assets/demo.mp4
