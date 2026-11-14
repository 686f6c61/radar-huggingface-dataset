# isichan-ai/YASAKANI_Uncensored_VL_Unofficial

## Resumen

YASAKANI_Uncensored_VL_Unofficial es una cuantización en formato GGUF publicada por el usuario isichan-ai a partir del modelo yasakani-dev/Qwen3.8-27B-YASAKANI-quality. Se distribuye con la etiqueta de "no oficial" (unofficial), lo que indica que no procede del desarrollador original del modelo base, sino de un tercero que ha empaquetado los pesos para su uso con herramientas de inferencia local. La ficha de Hugging Face lo etiqueta como "uncensored" y "vision", aunque no se aporta documentación técnica que detalle el proceso de modificación ni las capacidades multimodales reales.

El dato más relevante y a la vez más problemático es la discrepancia entre el nombre del modelo base (que sugiere 27B parámetros) y el recuento real de parámetros en safetensors que reporta la plataforma: 460.730.096 parámetros, es decir, unos 0,46B. Esta inconsistencia debe tenerse en cuenta antes de cualquier evaluación: o el recuento corresponde a un componente parcial, o el etiquetado del modelo base es engañoso. El repositorio ocupa 1,7 GB.

La relevancia de esta ficha es limitada pero informativa: sirve como caso de estudio de publicaciones no oficiales en el ecosistema GGUF, donde el etiquetado, las capacidades declaradas y las licencias pueden no coincidir con el modelo de origen. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se etiqueta como "Qwen3.8", sin documentación arquitectónica en la información proporcionada) |
| Parámetros totales | 460.730.096 (según safetensors reportado por Hugging Face); el nombre del modelo base indica 27B, discrepancia sin resolver |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio se etiqueta como gguf; no se detallan los niveles Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (también se referencia safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El modelo base, yasakani-dev/Qwen3.8-27B-YASAKANI-quality, se etiqueta con el identificador "Qwen3.8", lo que sugiere una familia derivada de Qwen, pero no se aporta documentación sobre el tipo de transformer, el número de capas, la dimensión oculta ni el mecanismo de atención. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, no hay datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La etiqueta "uncensored" indica que el publicador afirma haber eliminado o reducido los mecanismos de rechazo del modelo original, pero no se documenta el método (fine-tuning, abliteration, merging de pesos u otro). La etiqueta "vision" sugiere capacidades multimodales, pero no se detalla el codificador visual ni los datos de entrenamiento multimodal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje, aunque no documentada explícitamente.
- Razonamiento y código: no disponible; no hay documentación que confirme ni descarte estas capacidades.
- Visión: la etiqueta del repositorio incluye "vision", pero no se especifica el soporte real (entrada de imágenes, tareas de VQA, OCR, etc.).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo "uncensored": el publicador declara la ausencia de filtros de rechazo, sin documentar el alcance ni las consecuencias.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de publicaciones no oficiales en GGUF: este repositorio sirve para estudiar cómo se etiquetan y empaquetan modelos derivados en Hugging Face, incluyendo la discrepancia entre el nombre del modelo base (27B) y el recuento real de parámetros (0,46B).
- Pruebas de inferencia local con llama.cpp u Ollama: al estar en formato GGUF y ocupar 1,7 GB, puede cargarse en equipos con recursos modestos para verificar el comportamiento real frente a lo declarado.
- Investigación sobre modelos "uncensored": útil para analizar qué cambios introduce un tercero sobre un modelo base y cómo afectan a las respuestas en dominios sensibles, siempre con las salvaguardas legales y éticas correspondientes.
- Auditoría de licencias y trazabilidad: caso práctico para revisar si la licencia apache-2.0 declarada es compatible con la del modelo base y si el acceso gated añade restricciones adicionales.
- Docencia sobre riesgos de la cadena de suministro de modelos: ejemplo de por qué conviene verificar el origen, el recuento de parámetros y la documentación antes de desplegar un modelo en producción.
- Comparación de cuantizaciones: si se dispone de otras versiones GGUF del mismo modelo base, permite medir diferencias de perplejidad y latencia entre niveles de cuantización, aunque en este repositorio no se detallan los niveles incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 460,7M parámetros y pesos GGUF, la inferencia cabe holgadamente en GPUs de consumo; en cuantización de 4 bits el peso ronda los 0,3 GB, y en 8 bits alrededor de 0,5 GB, a lo que hay que sumar la caché KV (no disponible su tamaño por falta de datos de contexto y capas).
- Si el modelo real fuese de 27B parámetros, como sugiere el nombre del base, los requisitos cambiarían por completo: en Q4_K_M necesitaría del orden de 16-17 GB de VRAM, lo que exigiría una RTX 4090 (24 GB), A100 40 GB o H100.
- GPU recomendadas: no disponible; depende de la interpretación del recuento de parámetros. Para el escenario de 0,46B, cualquier GPU con 4-8 GB basta; para el escenario de 27B, se requiere GPU de gama alta o CPU con suficiente RAM.
- Cabe en GPU de consumo: probablemente sí en el escenario de 0,46B (GTX 1660, RTX 3060, etc.); en el escenario de 27B, solo en RTX 4090 o superiores con cuantización agresiva.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión previa a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| YASAKANI_Uncensored_VL_Unofficial | 460,7M (declarado); 27B en el nombre del base | no disponible | apache-2.0 | GGUF | Gated en HF |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | apache-2.0 | safetensors, GGUF | Público en HF |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | apache-2.0 | safetensors, GGUF | Público en HF |
| Llama 3.2 1B Instruct | 1,24B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Público en HF |

La comparativa es aproximada: los modelos alternativos tienen documentación pública completa, mientras que este repositorio carece de ella. La comparación con Qwen2.5-0.5B es la más plausible si se atiende al recuento de parámetros; la comparación con modelos de 7B o 27B solo tendría sentido si el etiquetado del modelo base fuese correcto.

## Limitaciones y advertencias

- Discrepancia crítica de parámetros: el nombre del modelo base indica 27B, pero safetensors reporta 460,7M; no se puede asumir ninguna de las dos cifras sin verificación empírica.
- Publicación no oficial: el autor no es el desarrollador del modelo base, por lo que no hay garantía sobre el proceso de cuantización, la integridad de los pesos ni la fidelidad al modelo original.
- Etiqueta "uncensored": implica la posible ausencia de filtros de seguridad, con riesgo de generar contenido dañino, sesgado o legalmente problemático; no se documenta el método ni su alcance.
- Etiqueta "vision" sin documentación: no se confirma el soporte multimodal real ni la calidad del mismo.
- Idiomas no especificados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Licencia apache-2.0 declarada, pero sin verificación de compatibilidad con la licencia del modelo base; el acceso gated añade condiciones adicionales que deben revisarse.
- Riesgo de alucinación: no cuantificado; en modelos pequeños o derivados sin documentación, la tasa de alucinación puede ser elevada.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para producción sin una evaluación previa exhaustiva de capacidades, sesgos, seguridad y licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isichan-ai/YASAKANI_Uncensored_VL_Unofficial
- Modelo base: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
