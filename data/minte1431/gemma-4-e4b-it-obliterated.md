# minte1431/gemma-4-E4B-it-OBLITERATED

## Resumen

`minte1431/gemma-4-E4B-it-OBLITERATED` es una versión modificada del modelo instructivo `google/gemma-4-E4B-it` a la que se le ha eliminado quirúrgicamente el comportamiento de rechazo (abliteración) mediante la herramienta OBLITERATUS en su variante `aggressive`. El resultado, según el autor, es un modelo con un 0 % de rechazo duro: no emite negativas explícitas ni advertencias de seguridad. El repositorio lo publica el usuario minte1431 bajo licencia Apache 2.0 y no registra descargas ni valoraciones en el momento de la consulta.

El modelo declara la arquitectura `gemma4`, con 42 capas, pesos KV compartidos entre capas (18 capas prestatarias) y un total de 720 tensores. Los pesos en safetensors suman 7.996.156.448 parámetros, coherente con la nomenclatura E4B (4B efectivos) aunque el repositorio no detalla la distinción entre parámetros totales y efectivos. Se distribuye tanto en safetensors (bfloat16, 7 fragmentos, ~17 GB) como en GGUF (Q4_K_M, Q5_K_M, Q8_0 y un proyector mmproj en F16 para entrada de imagen), lo que permite ejecución local en portátiles, móviles y GPUs de consumo.

Su relevancia es doble: por un lado, documenta un caso poco habitual de ingeniería sobre una arquitectura nueva con pesos KV compartidos, donde la versión v2 borró accidentalmente 54 tensores de proyección K/V; por otro, sirve como material de estudio sobre eliminación de rechazo, robustez de alineamiento y evaluación de modelos sin guardarraíles. El propio autor advierte que la abliteración no altera el techo de capacidad del modelo base de 4B, con ~20 % de salidas degeneradas y ~28 % de evasión blanda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gemma4` (transformer) con pesos KV compartidos (`num_kv_shared_layers: 18`), 42 capas y 720 tensores |
| Parámetros totales | 7.996.156.448 (según safetensors) |
| Parámetros activos | No disponible. No se declara arquitectura MoE; la nomenclatura E4B sugiere 4B efectivos, pero el repositorio no lo detalla |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0; proyector mmproj en F16; safetensors en bfloat16 |
| Idiomas soportados | No disponible en los metadatos. La model card menciona salidas mayoritariamente en inglés y un ~4 % de respuestas ocasionales en tailandés o japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 7 fragmentos, ~17 GB) y GGUF (llama.cpp/Ollama/LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer con una peculiaridad relevante para cualquier intervención sobre pesos: las capas 24 a 41 comparten los mismos tensores `k_proj` y `v_proj` que la capa 24 (`num_kv_shared_layers: 18`). Sobre esa base, OBLITERATUS en modo `aggressive` aplica descomposición SVD blanqueada, cirugía de cabezas de atención y winsorización de activaciones sobre 21 de las 42 capas, usando un corpus de 842 pares de prompts contrastivos repartidos en 10 categorías. El resultado declarado es un 0 % de rechazo duro, frente al 98,8 % del modelo original según la model card.

La versión v2 de esta intervención introdujo un fallo grave: al proyectar el rechazo sobre tensores KV compartidos en cada capa prestataria, la proyección se aplicó 18 veces al mismo tensor, corrompiéndolo, y `save_pretrained` eliminó 54 tensores. Eso dejó los GGUF con 666 tensores en lugar de 720 y degradó la calidad. La v3 corrige el procedimiento proyectando una sola vez sobre la capa propietaria de los pesos KV y omitiendo las prestatarias, de modo que la proyección limpia se propaga a las 18 capas. El autor también documenta activaciones NaN durante la extracción en bfloat16 en más de 20 capas, un obstáculo específico de esta arquitectura.

No hay información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre el proceso de ajuste instructivo. Todo el trabajo descrito en la model card es de post-procesado de pesos, no de reentrenamiento. La model card indica además que el modelo se generó de forma casi autónoma mediante un agente Hermes con menos de 10 prompts humanos.

## Capacidades

- Generación de texto conversacional y respuestas instructivas en inglés, con plantilla de chat propia de Gemma 4.
- Ausencia de rechazo duro declarada: 0 % en una batería de 100 prompts según el autor.
- Entrada multimodal: el repositorio incluye un proyector `mmproj-f16.gguf` (990 MB) descrito como proyector de visión/audio, necesario para entrada de imagen.
- Modo de razonamiento (`thinking mode`) mencionado de forma indirecta en la model card como parte de la arquitectura Gemma 4.
- Compatibilidad con llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui mediante los GGUF.
- Capacidades multilingües: no declaradas en metadatos; se observa deriva ocasional a tailandés y japonés (~4 % de las salidas).
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso.

## Casos de uso

- Investigación en seguridad y alineamiento: permite estudiar qué comportamientos se eliminan al abliterar y cómo se degrada la coherencia, comparando contra el modelo base `google/gemma-4-E4B-it` con la misma batería de prompts.
- Red teaming de sistemas de moderación: al no producir rechazos, sirve para generar entradas adversarias y comprobar si los filtros externos de una aplicación detectan contenido problemático que el modelo sí genera.
- Evaluación de robustez de guardarraíles: medir la resistencia de una técnica de alineamiento frente a una ablación dirigida sobre 21 capas con 842 pares contrastivos.
- Escritura creativa y ficción sin filtros: narrativa adulta, terror o tramas con violencia donde los rechazos interrumpen el flujo, aceptando el riesgo de repeticiones y usando `repeat_penalty` 1.1.
- Asistente local en dispositivo: con el GGUF Q4_K_M (4,9 GB) se puede ejecutar en un iPhone o en un equipo con 8 GB de RAM, útil para prototipos offline sin conexión ni coste de API.
- Experimentos de visión y audio locales: el proyector mmproj en F16 (990 MB) habilita pruebas de descripción o etiquetado de imágenes enteramente en local.
- Generación de datos sintéticos para pipelines de evaluación: producir grandes volúmenes de texto que luego se filtran, clasifican o usan como negativos de entrenamiento.
- Docencia técnica sobre cuantización y despliegue: sirve como caso práctico de comparación entre Q4_K_M, Q5_K_M, Q8_0 y bfloat16 en términos de tamaño, RAM y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible. La model card solo aporta métricas internas de comportamiento y calidad, sin comparación con otros modelos:

| Métrica | Resultado | Notas |
|---|---|---|
| Rechazo duro | 0 % | Frente al 98,8 % declarado del Gemma 4 E4B original |
| Evasión blanda | ~28 % | El modelo cambia de tema en ocasiones |
| Respuesta coherente y sobre el tema | ~51 % | Respuestas detalladas y útiles |
| Salidas degeneradas | ~20 % | Bucles de repetición; se recomienda `repeat_penalty` 1.1 |
| Idioma incorrecto | ~4 % | Salidas ocasionales en tailandés o japonés |
| Calidad juzgada por Claude (v2) | 3,1/10 | Solo para v2; la v3 se describe como mejorada sin cifra concreta |
| Tensores en GGUF | 720 (v3) frente a 666 (v2) | v3 conserva todas las proyecciones K/V |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los tamaños publicados; el autor no facilita cifras de VRAM): el GGUF Q4_K_M ocupa 4,9 GB, por lo que necesita en torno a 6 GB de VRAM/RAM con contexto moderado; Q5_K_M (5,3 GB) ronda los 6,5 GB; Q8_0 (7,4 GB) ronda los 9 GB.
- Pesos completos en bfloat16: ~17 GB, lo que exige del orden de 20-24 GB de VRAM contando caché KV; encaja en tarjetas de 24 GB.
- GPUs recomendadas: A100, H100 o cualquier GPU de 24 GB o más para bfloat16; para los GGUF cuantizados basta una GPU de consumo.
- Cabe en GPU de consumo: sí. El Q4_K_M y el Q5_K_M entran en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y el Q8_0 en tarjetas de 10-12 GB (RTX 3080, RTX 4070). El autor afirma que el Q4_K_M funciona en un iPhone.
- Opciones de despliegue confirmadas: Ollama 0.20 o superior y llama.cpp desde el build b8665. Compatibilidad esperada pero marcada como "actualizar": LM Studio 0.3.16 o superior, koboldcpp en nightly reciente y text-generation-webui con llama-cpp-python actualizado. No hay confirmación de soporte en vLLM, TGI o TensorRT-LLM.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo duro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minte1431/gemma-4-E4B-it-OBLITERATED v3 | 7.996.156.448 (4B efectivos según nomenclatura) | No disponible | 0 % (declarado) | Apache 2.0 | safetensors + GGUF |
| google/gemma-4-E4B-it (base) | No disponible en la información | No disponible | 98,8 % (según el autor) | Apache 2.0 | safetensors, según el repositorio base |
| Otras variantes abliteradas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de otros modelos abliterados de tamaño similar, ni cifras comparables de benchmarks, por lo que la comparación se limita al modelo base declarado.

## Limitaciones y advertencias

- Eliminación total del rechazo: el modelo no emite negativas ni advertencias. No debe desplegarse en aplicaciones de cara al público sin filtros externos de contenido y revisiones legales.
- Alucinación: la model card documenta que la v2 alucinaba por el borrado de tensores KV; aunque la v3 lo corrige, no se aportan métricas de factualidad para la versión final.
- Salidas degeneradas: en torno al 20 % de las respuestas pueden entrar en bucles de repetición. Se recomienda `repeat_penalty` 1.1 y ajustar la plantilla de chat.
- Deriva de idioma: aproximadamente el 4 % de las salidas aparecen en tailandés o japonés; el autor sugiere usar un system prompt en inglés para mitigarlo.
- Techo de capacidad de 4B: el autor reconoce que la coherencia en temas complejos está limitada por el tamaño del modelo base, y que la abliteración no mejora la inteligencia del modelo.
- Longitud de contexto desconocida: no se publica la ventana de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Sin resultados de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K, así que no es posible comparar objetivamente con alternativas.
- Reproducibilidad limitada: el proceso se describe como casi autónomo, sin semillas, scripts completos ni registro íntegro de hiperparámetros; solo se enlaza el repositorio de la herramienta.
- Licencia: Apache 2.0 en el repositorio. Al ser un derivado de pesos de Google, conviene verificar los términos aplicables del modelo base antes de un uso comercial, así como el cumplimiento de la normativa europea de IA si se emplea en producción.
- Madurez del repositorio: cero descargas y cero valoraciones, creado y actualizado el 14 de septiembre de 2026, sin validación externa conocida.
- Compatibilidad de herramientas: requiere versiones recientes de llama.cpp (build b8665 o superior) por la arquitectura `gemma4`; versiones antiguas fallan o producen salidas incoherentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/minte1431/gemma-4-E4B-it-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de la herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Agente Hermes: https://github.com/NousResearch/hermes-agent
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados corresponden al Shire of Plantagenet (Australia Occidental) y no guardan relación con esta ficha.
