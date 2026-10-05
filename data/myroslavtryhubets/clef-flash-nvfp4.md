# myroslavtryhubets/clef-flash-NVFP4

## Resumen

clef-flash-NVFP4 es una cuantización comunitaria no oficial a 4 bits de Cloudflare/clef-flash, el hermano de 9B de la familia Clef de Cloudflare. Clef es un modelo multimodal de decisión: dado un estado (texto de una incidencia, por ejemplo) y un esquema de preguntas tipadas, devuelve una probabilidad para cada opción permitida en un único forward pass. Este repositorio, obra de myroslavtryhubets, solo re-codifica los pesos del modelo base; la arquitectura, la API de decisión y el fichero joint_schema_model.py pertenecen a Cloudflare.

El checkpoint declara 9.409.813.744 parámetros (~9,4B), se distribuye en safetensors, ocupa 9,1 GB en el repositorio y usa licencia Apache-2.0. Está construido sobre el backbone Qwen3.5 (etiqueta qwen3_5) y su pipeline declarado es image-text-to-text. La variante NVFP4 de este repositorio emplea pesos y activaciones en 4 bits (W4A4) y prioriza la velocidad, con una latencia mediana de ~240 ms por petición.

Es relevante ahora porque permite ejecutar un modelo de decisión multimodal de 9B en GPUs de gama de consumo con apenas ~4 GiB de pesos en VRAM (por ejemplo, una RTX 5060 Ti de 16 GB en arquitectura Blackwell, sm_120), a costa de una pérdida de precisión apreciable en clasificación con clases casi empatadas, como CLINC150 (49,9 frente a 66,8 del bf16 original). La variante hermana NVFP4A16 (W4A16) mejora la precisión pero es unas siete veces más lenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.5 y cabecera conjunta de decisión (joint schema model); pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en este repositorio; existe la variante NVFP4A16 (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en el backbone Qwen3.5 (etiqueta qwen3_5). Su rasgo distintivo no es la generación de texto libre, sino una cabecera de decisión conjunta (joint_schema_model.py) que, dado un estado y un esquema de preguntas tipadas, produce una probabilidad para cada opción permitida en un único forward pass. En el ejemplo de la model card aparecen tipos de pregunta como "choice" (con criterios asociados) y "noul" (pregunta booleana). El pipeline declarado es image-text-to-text, lo que indica entrada multimodal de imagen y texto.

Este repositorio no entrena el modelo: solo re-codifica los pesos del checkpoint Cloudflare/clef-flash a NVFP4 mediante compressed-tensors. La variante documentada en la model card es NVFP4A16 (pesos en 4 bits, activaciones en bf16), mientras que este repositorio corresponde a NVFP4 con activaciones de 4 bits (W4A4). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base; la model card solo indica que los pesos cuantizados no se cargan con from_pretrained ni load_release_model (que construyen el grafo en precisión completa) y que debe usarse el runtime incluido clef_rt.py.

## Capacidades

- Generación de decisiones tipadas: dado un estado y un esquema de preguntas con criterios, devuelve probabilidades por opción en un único forward pass.
- Salida estructurada (structured output) y modo de clasificación, con la etiqueta classification en el repositorio.
- Enrutado y clasificación de intenciones: evaluado en BANKING77 y CLINC150+OOS.
- Clasificación de seguridad: evaluado en PhishNChips (detección de phishing).
- Extracción de entidades financieras: evaluado en FinEntity.
- Razonamiento sobre contratos y inferencia de lenguaje natural: evaluado en ContractNLI y ANLI.
- Razonamiento de sentido común y multi-paso: evaluado en ARC-Challenge, WinoGrande y MuSR.
- Evaluación de ejecución de código: evaluado en CRUXEval.
- Casos de function calling / decisión de casos: evaluado en BFCL con métrica de exactitud por caso.
- Entrada multimodal (image-text-to-text) según el pipeline y las etiquetas del repositorio.
- Idiomas soportados: no disponible; las evaluaciones publicadas son en inglés.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia como estado y un esquema con preguntas de tipo "choice" para asignar equipo o categoría, devolviendo una distribución de probabilidad por opción. Es adecuado para triaje automático con BANKING77 y CLINC150 como referencia.
- Detección de phishing y clasificación de seguridad: con un esquema booleano o de categorías, el modelo puntúa cada caso; el benchmark PhishNChips (76,5 en esta cuantización) sirve de referencia de rendimiento.
- Extracción de entidades financieras: clasificación de entidades en documentos (FinEntity, 97,2 macro-F1 en la variante A16), útil para pipelines de cumplimiento normativo.
- Análisis de contratos y NLI: verificación de hipótesis sobre cláusulas (ContractNLI, ANLI), apropiado para revisión documental automatizada donde se necesita probabilidad por etiqueta, no texto libre.
- Agentes de decisión multi-paso: el modelo puede actuar como componente de enrutado dentro de un agente mayor (evaluado en BFCL y MuSR), eligiendo la siguiente acción en función del estado.
- Asistencia en revisión de código: con CRUXEval como referencia, puede puntuar resultados de ejecución y razonar sobre fragmentos de código como paso de validación.
- Despliegue en edge con salida estructurada: con ~4 GiB de pesos en VRAM y latencia de ~240 ms, encaja en tareas donde se requiere una decisión tipada por petición en hardware de gama de consumo.
- Moderación y clasificación de contenido: uso de preguntas tipadas para etiquetar contenido con probabilidades por categoría, integrándose en pipelines donde se necesita una salida calibrada en lugar de texto generado.

## Benchmarks y rendimiento

Los datos de la model card proporcionada corresponden a la variante hermana NVFP4A16 (W4A16) y a 11 benchmarks del suite Decision Index 0.2.1 (20.337 peticiones), puntuados con su propio scorer sobre una RTX 5060 Ti de 16 GB. Se comparan con el resultado publicado de Cloudflare en bf16:

| Benchmark | Metrica | Clef-flash bf16 (Cloudflare) | NVFP4A16 | Delta |
|---|---|---|---|---|
| BFCL | exactitud por caso | 98,8 | 98,6 | -0,2 |
| BANKING77 | macro-F1 | 90,9 | 92,0 | +1,1 |
| CLINC150+OOS | macro-F1 | 66,8 | 61,2 | -5,6 |
| ContractNLI | macro-F1 | 84,3 | 83,7 | -0,6 |
| ANLI | macro-F1 | 59,1 | 58,8 | -0,3 |
| ARC-Challenge | exactitud | 98,3 | 98,1 | -0,2 |
| WinoGrande | exactitud | 97,5 | 97,1 | -0,4 |
| MuSR | exactitud | 86,0 | 85,4 | -0,6 |
| FinEntity | macro-F1 | 97,1 | 97,2 | +0,1 |
| CRUXEval | exactitud | 86,1 | 85,3 | -0,8 |
| PhishNChips | exactitud | 75,0 | 76,5 | +1,5 |

Según la model card, la brecha media absoluta frente a Cloudflare para esta variante A16 es de 1,04 puntos y la latencia mediana de ~1681 ms por petición (batch 1). Para el modelo de este repositorio (NVFP4, W4A4) solo se publica la fila resumen de la tabla de variantes: CLINC150 = 49,9, brecha media = 2,36 y latencia mediana ≈240 ms. No se han publicado en la información disponible resultados completos por benchmark para la variante NVFP4.

## Requisitos de hardware

- VRAM estimada (NVFP4): ~4 GiB de pesos en VRAM según la model card.
- VRAM estimada (bf16, modelo base): ~19 GB solo por pesos de 9,4B en bf16, sin contar overhead de activaciones.
- GPU probada: RTX 5060 Ti de 16 GB (arquitectura Blackwell, sm_120). El runtime NVFP4 requiere Blackwell según la model card.
- Comparativa de VRAM: la variante clef-NVFP4 de 27B necesita ~13 GB de VRAM; si no se dispone de esa capacidad, esta versión de 9B es la alternativa.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~4-6 GiB libres y arquitectura compatible (Blackwell para NVFP4).
- Opciones de despliegue: runtime propio clef_rt.py incluido en el repositorio (no usa from_pretrained). No hay soporte de GGUF, llama.cpp ni Ollama documentado. vLLM registra el backbone Qwen3_5 pero no implementa la cabecera conjunta de decisión de Clef, por lo que no puede producir decisiones tipadas.
- Latencia: ~240 ms por petición en NVFP4 (W4A4); ~1681 ms por petición en NVFP4A16 (W4A16). La variante W4A16 es, según la model card, aproximadamente 7 veces más lenta que W4A4 con la misma VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Esquema | CLINC150 | Brecha media | Latencia mediana | Licencia |
|---|---|---|---|---|---|---|
| clef-flash-NVFP4 (este repo) | 9,4B | W4A4 | 49,9 | 2,36 | ~240 ms | Apache-2.0 |
| clef-flash-NVFP4A16 | 9,4B | W4A16 | 61,2 | 1,04 | ~1680 ms | Apache-2.0 |
| clef-NVFP4 | 27B | W4A4 | 97,3 | 1,08 | ~700 ms | Apache-2.0 |
| Cloudflare/clef-flash (bf16) | 9,4B | bf16 | 66,8 | referencia | no disponible | Apache-2.0 |

Comparado con el modelo base sin cuantizar, esta variante pierde precisión de forma notable en CLINC150 (clasificación con 150 clases casi empatadas). Frente a su hermano NVFP4A16, es claramente más rápida pero menos precisa. Frente a clef-NVFP4 de 27B, es más ligero en VRAM pero peor en precisión y velocidad en el escenario descrito. No se dispone de comparaciones con modelos de decisión alternativos fuera de la familia Clef.

## Limitaciones y advertencias

- Degradación en clasificación fina: CLINC150 baja de 66,8 (bf16) a 49,9 en NVFP4 y a 61,2 en NVFP4A16; el modelo de 9B es sensible a la cuantización de pesos cuando hay muchas clases casi empatadas.
- Riesgo de alucinación: no documentado explícitamente, pero al ser un modelo de decisión que emite probabilidades, los errores se manifiestan como decisiones mal calibradas más que como texto inventado.
- Restricción de runtime: los pesos cuantizados no funcionan con from_pretrained ni load_release_model; dependen del runtime clef_rt.py incluido.
- Compatibilidad limitada: vLLM reconoce el backbone Qwen3_5 pero no implementa la cabecera de decisión de Clef, por lo que no sirve para producción de decisiones tipadas.
- Idiomas: no disponibles; las evaluaciones publicadas son en inglés, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto: no disponible en la información proporcionada.
- Hardware: el esquema NVFP4 requiere arquitectura Blackwell (sm_120) según la model card, lo que limita las GPUs compatibles.
- Licencia: Apache-2.0, permite uso comercial, pero se trata de una cuantización no oficial no afiliada ni respaldada por Cloudflare.
- Advertencia sobre metadatos: el repositorio incluye la etiqueta 8-bit aunque el esquema anunciado es de 4 bits; conviene verificar el checkpoint antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/myroslavtryhubets/clef-flash-NVFP4
- Variante NVFP4A16: https://huggingface.co/myroslavtryhubets/clef-flash-NVFP4A16
- Variante clef-NVFP4 (27B): https://huggingface.co/myroslavtryhubets/clef-NVFP4
- Modelo base Cloudflare/clef-flash: https://huggingface.co/Cloudflare/clef-flash
- Backbone Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Cloudflare sobre Clef: https://blog.cloudflare.com/clef-decision-models
- Suite de evaluacion Decision Index 0.2.1: https://clef-evals.workers-ai-mle.workers.dev
- Kit de evaluacion Decision Index: https://github.com/apolinario/decision-index
