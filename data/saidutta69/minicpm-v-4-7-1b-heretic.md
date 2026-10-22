# saidutta69/MiniCPM-V-4.7-1B-heretic

## Resumen

MiniCPM-V-4.7-1B-heretic es una variante «abliterated» (decensurada) del modelo visión-lenguaje openbmb/MiniCPM-V-4.7-1B, publicada por el usuario saidutta69 mediante la herramienta Heretic v1.4.0. No se trata de un reentrenamiento ni de un fine-tuning: se han editado direccionalmente los pesos de las proyecciones de salida de atención (`attn.o_proj`) y de bajada del MLP (`mlp.down_proj`) para suprimir la dirección de rechazo, dejando intactos el torreón visual, el comportamiento OCR y el *footprint* de inferencia en dispositivo. El resultado es un VLM capaz de ver imágenes y responder en lugar de declinar, con una tasa de rechazos que baja de 60/100 a 5/100 según la medición del autor.

El modelo es relevante por su tamaño: 1.554.476.272 parámetros reales según safetensors, de los cuales aproximadamente 1,01B corresponden al torreón de texto y 0,55B al torreón visual más el *merger*. Eso lo sitúa como uno de los VLM más pequeños con entrada de imagen real, con un peso en disco (GGUF Q4_K_M + proyector) de 1,78 GB y una huella en VRAM que cabe en tarjetas de 6 GB. OpenBMB distribuye una app para iPhone de este checkpoint y afirma que supera sustancialmente a Qwen3.5 0.8B tanto en puntuación global como en eficiencia de inferencia.

La arquitectura subyacente es MiniCPM-V 4.7, la última generación de la familia MiniCPM-V, que incluye variantes 35BA3B (MoE, la primera MoE de la serie) y 1B. Este repositorio corresponde a la variante densa de 1B. Los pesos se distribuyen en safetensors y en GGUF (con un fichero de proyector separado para conservar la visión), lo que permite despliegue tanto en transformers como en llama.cpp y entornos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) MiniCPM-V 4.7: torreón de texto denso + torreón visual SigLIP-style con merger (detalles internos de capas y atención: no disponible) |
| Parametros totales | 1.554.476.272 (1,55B); ~1,01B torreón de texto + ~0,55B torreón visual |
| Parametros activos | No aplica (modelo denso; la variante MoE de la familia es 35BA3B) |
| Longitud de contexto | No disponible de forma explícita; la model card menciona «~1 GB por cada 32K de contexto» al calcular VRAM |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (escalera completa); pesos originales en safetensors (BF16/F16); proyector visual en F16 no cuantizado |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp). El GGUF multimodal requiere dos ficheros: el GGUF de texto y `MiniCPM-V-4.7-1B-heretic-mmproj-F16.gguf` (1,11 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del checkpoint base: un VLM compuesto por un torreón de texto de ~1,01B parámetros y un torreón visual de ~0,55B con un módulo *merger* que proyecta las características visuales al espacio del modelo de lenguaje. Los tags del repositorio indican soporte de imagen, vídeo y OCR, además de *visual grounding*. El tag `minicpmv4_7` confirma que se registra correctamente en llama.cpp, lo que permite exportar la torre visual como proyector mmproj separado en lugar de perderla en la conversión.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base usó RLHF o DPO. La model card del autor señala que MiniCPM-V 4.7 1B «ships comparatively light alignment» (alineamiento comparativamente ligero), lo que se deduce de una tasa de rechazo base de 60/100 en lugar del 90+ típico de un 1B entrenado con RLHF. La innovación técnica de este repositorio concreto es la abliteración direccional: una única dirección de rechazo para toda la red (`direction_index` = 12,37), con pesos máximos y mínimos y posiciones por capa en `attn.o_proj` (max_weight 1,43 en posición 14,34; min_weight 0,12 a distancia 13,03) y en `mlp.down_proj` (max_weight 1,30 en posición 14,65; min_weight 1,22 a distancia 11,63), correspondiente al ensayo 169 de una ejecución de 200 con semilla 4161231025.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno en inglés y chino.
- Comprensión de imagen: descripción, respuesta a preguntas visuales (VQA) e interpretación de capturas de pantalla y documentos.
- OCR y lectura de documentos: extracción de texto de imágenes, capacidad preservada explícitamente tras la abliteración.
- *Visual grounding* y localización de elementos en la imagen, también preservado según el autor.
- Comprensión de vídeo (el tag `video` está presente en el repositorio; el alcance exacto no está documentado en la información disponible).
- Entrada multimodal completa en GGUF mediante llama.cpp, siempre que se carguen conjuntamente el GGUF de texto y el proyector mmproj.
- Comportamiento decensurado: intenta responder a *prompts* de seguridad ofensiva que un modelo comercial alojado declina, lo que lo hace utilizable para generación de corpus de *red team*.
- Ejecución en dispositivo (*on-device*) y en GPU de consumo, incluida una app oficial de iPhone para el checkpoint base.
- Soporte de `transformers`, `safetensors` y `endpoints_compatible`.

## Casos de uso

- **Atención al cliente con capturas de pantalla**: el usuario envía una imagen de un error o de su factura y el modelo la lee por OCR y responde en el mismo hilo conversacional; los 1,55B permiten servirlo en CPU o en una GPU de 6 GB sin coste de infraestructura elevado.
- **Lectura de documentos en el móvil**: integrado en una app iOS o Android, procesa localmente documentos y tickets sin enviar imágenes a la nube, con un peso combinado de 1,78 GB en Q4_K_M y proyector.
- **Automatización de accesibilidad**: descripción de imágenes para usuarios con discapacidad visual, con latencia baja al ejecutarse en el propio dispositivo o en un portátil con GTX 1660 Super.
- **Extracción de datos de formularios y documentos escaneados**: pipeline de OCR + respuesta estructurada en local, útil cuando el envío de documentos a APIs externas no está permitido por política de datos.
- **Agente visual local**: automatización de tareas sobre interfaces gráficas (leer la pantalla, identificar botones por *grounding*) en un bucle de varios pasos, sin depender de un servicio remoto.
- **Generación de corpus de red team y evaluación de seguridad**: al reducir los rechazos a 5/100, permite medir qué produce un modelo de esta clase sin alineamiento y alimentar pruebas de robustez propias.
- **Prototipado rápido de producto multimodal**: gracias a la licencia Apache-2.0 y a la escalera completa de GGUF, se puede validar una idea de VLM en un portátil antes de invertir en un modelo mayor.
- **Roleplay y escritura creativa sin restricciones**: el tag `roleplay` y el decensurado lo orientan a narrativa y personajes sin las negativas del modelo base, siempre con revisión humana del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. El autor indica explícitamente que la model card del modelo base publica sus evaluaciones como imágenes, no como texto, y que por eso no incluye tabla de benchmarks. La única afirmación textual repetible es de OpenBMB: la variante 1B supera sustancialmente a Qwen3.5 0.8B tanto en puntuación global como en eficiencia de inferencia (sin cifras disponibles).

Las métricas publicadas corresponden al proceso de abliteración, no a capacidades:

| Metrica | Este modelo | Modelo original (openbmb/MiniCPM-V-4.7-1B) |
|---|---|---|
| Divergencia KL | 0,0351 | 0 (por definición) |
| Rechazos | 5/100 | 60/100 |

El autor contextualiza el KL 0,0351 como una edición de rango medio dentro de su colección: más laxa que granite-4.2-3b-heretic (0,0095) y más ajustada que Qwen3-VL-2B-Instruct-heretic (0,0528).

## Requisitos de hardware

- **VRAM para texto solo**: 1,08 GB en Q8_0, 0,84 GB en Q6_K, 0,75 GB en Q5_K_M, 0,67 GB en Q4_K_M, 0,64 GB en IQ4_XS.
- **VRAM para texto + visión**: 2,19 GB en Q8_0, 1,95 GB en Q6_K, 1,86 GB en Q5_K_M, 1,78 GB en Q4_K_M, 1,75 GB en IQ4_XS (el proyector de 1,11 GB es de tamaño fijo porque los pesos visuales no se cuantizan).
- **GPU recomendadas por cuantización**: RTX 4090/5090 (24 GB) → Q8_0; RTX 4080/5080/4060 Ti 16G (16 GB) → Q6_K; RTX 3060/4070/5070 (12 GB) → Q5_K_M; RTX 4060/3070 (8 GB) → Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) → IQ4_XS.
- **Consumer GPU**: sí, cabe en cualquier GPU con 6 GB o más, e incluso en CPU-only o Apple Silicon con Q4_K_M.
- **Contexto**: añadir ~1 GB de VRAM por cada 32K de contexto; el autor advierte que hay que presupuestar más caché KV que en un modelo de texto del mismo tamaño porque los tokens de imagen son caros.
- **Opciones de despliegue**: `transformers` (pesos safetensors), llama.cpp con el par GGUF + mmproj para multimodal, y los endpoints compatibles indicados en los tags. vLLM, TGI, Ollama y otras latencias/throughput concretos: no disponible.
- **Latencia y throughput**: no disponible; LLM Explorer estima 0,5 GB de VRAM para el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-heretic | 1,55B (1,01B texto + 0,55B visión) | No disponible (referencia a bloques de 32K) | Rechazos 5/100; KL 0,0351 frente al base; sin benchmarks de capacidad publicados | Apache-2.0 | HuggingFace, safetensors + GGUF multimodal |
| openbmb/MiniCPM-V-4.7-1B (base) | 1,55B | No disponible | Rechazos 60/100; OpenBMB afirma que supera a Qwen3.5 0.8B en puntuación global y eficiencia | Apache-2.0 (según el repo derivado) | HuggingFace, app iPhone oficial |
| saidutta69/Qwen3.5-0.8B-heretic | ~0,8B (solo texto) | No disponible | No disponible | No disponible en la información | HuggingFace |
| Qwen3-VL-2B-Instruct-heretic | ~2B | No disponible | KL 0,0528 (edición más agresiva que este modelo) | No disponible en la información | HuggingFace |

## Limitaciones y advertencias

- **Contenido sin censura**: el modelo responde a peticiones que el base declina, incluidos *prompts* de seguridad ofensiva. Requiere moderación propia y revisión humana si se expone a usuarios finales.
- **Riesgo de alucinación**: inherente a un modelo de 1B; el OCR y la lectura de documentos pueden producir texto plausible pero incorrecto, especialmente con imágenes de baja calidad.
- **Idiomas**: solo inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- **Muestra de evaluación pequeña**: las métricas de rechazo (5/100 frente a 60/100) y el KL se midieron con 100 *prompts*; no constituyen una evaluación exhaustiva de seguridad ni de capacidad.
- **Derivado de terceros**: no lo publica OpenBMB; la model card del base publica sus evaluaciones solo como imágenes, por lo que no hay benchmarks de capacidad verificables en texto.
- **Licencia**: Apache-2.0 permite uso comercial, pero la licencia no cubre la responsabilidad legal del contenido generado ni de los pesos editados; conviene revisar también las condiciones del modelo base.
- **Configuración multimodal frágil en GGUF**: si solo se carga el GGUF de texto, el modelo no verá imágenes. Es obligatorio cargar también el mmproj F16 de 1,11 GB; la mayoría de conversiones de VL en la misma colección pierden la torre visual.
- **Contexto y caché KV**: no hay longitud de contexto declarada explícitamente; el consumo de VRAM por tokens de imagen es alto y puede provocar OOM en tarjetas de 6-8 GB con contextos largos.
- **Caveat de producción**: el autor advierte que el método de abliteración puede degradar la coherencia si se aplica de forma más agresiva; este run concreto se presenta como un equilibrio, no como una garantía de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/MiniCPM-V-4.7-1B-heretic
- Discusiones del repositorio: https://huggingface.co/saidutta69/MiniCPM-V-4.7-1B-heretic/discussions
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Documentación de MiniCPM-V 4.7 en GitHub: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v4dot7_en.md
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/minicpm-v-4.7-1b-heretic/
- Ficha en LLM Explorer: https://llm-explorer.com/model/saidutta69%2FMiniCPM-V-4.7-1B-heretic,6iwtrEjtJHY8OpdhiIKxql
- Modelo hermano solo texto: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
