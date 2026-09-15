# mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-GGUF

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP-GGUF es la versión cuantizada en formato GGUF del modelo ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, publicada por mradermacher, un autor conocido por generar cuantizaciones estáticas y con imatrix de modelos abiertos. Se trata de un derivado de la familia Qwen3.8 (etiqueta qwen3_8) de 27.320.697.856 parámetros, sometido a un proceso de "abliteration" que elimina o atenúa los mecanismos de rechazo de la alineación, por lo que se comercializa explícitamente como modelo uncensored orientado a conversación.

El repositorio incluye once cuantizaciones GGUF que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de dos ficheros mmproj (Q8_0 y f16) que en el ecosistema llama.cpp acompañan a proyecciones multimodales, lo que sugiere que el modelo base conserva capacidades de entrada multimodal, aunque la documentación disponible no lo confirma de forma explícita. La etiqueta mtp indica multi-token prediction, una técnica de predicción de varios tokens por paso, si bien la información proporcionada no detalla su implementación concreta.

Su relevancia actual es doble: por un lado, permite ejecutar localmente un modelo de 27B en hardware de consumo mediante cuantizaciones de 4 bits; por otro, cubre el nicho de modelos sin filtros para investigación en seguridad, generación de datos sintéticos y aplicaciones creativas donde los rechazos automáticos resultan un obstáculo. El soporte de idiomas declarado se limita al inglés, y la licencia swift-open-license-1.0 obliga a revisar sus términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no documentada en la información proporcionada; el modelo base pertenece a la familia Qwen3.8 según la etiqueta qwen3_8) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en HuggingFace, con enlace a https://huggingface.co/ukisai/Swift-Qwen3.8-27b) |
| Formato de pesos | GGUF (cuantizaciones estáticas, convertidas desde el modelo base en transformers) |
| Tamaño del repositorio | 190,8 GB |
| Fecha de publicación | 15 de septiembre de 2026 (última actualización: 15 de septiembre de 2026) |
| Modelo base | ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP |
| Repositorio relacionado | mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: no se especifica si se trata de un transformer denso, de un modelo con mezcla de expertos, de una arquitectura híbrida ni de un modelo basado en máquina de estados. La única pista estructural es la etiqueta qwen3_8, que vincula el modelo base con la familia Qwen3.8, y el sufijo MTP (multi-token prediction), que apunta a un esquema de predicción de varios tokens por paso de decodificación. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que sí se documenta es el proceso de post-entrenamiento aplicado: el modelo base ha sido "abliterated" y se distribuye como uncensored, lo que implica la supresión de direcciones de activación asociadas al rechazo de peticiones. Esta modificación se realizó antes de la cuantización, de modo que todas las variantes GGUF del repositorio heredan ese comportamiento. La conversión desde el modelo base en transformers siguió el flujo estándar de mradermacher (convert_type: hf, quantize_version: 2), sin que se mencionen innovaciones adicionales en el proceso de cuantización más allá del uso de cuantizaciones estáticas; las versiones con pesos ponderados e imatrix se publican en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés, con formato de diálogo multi-turno (etiqueta conversational).
- Generación de contenido sin rechazos por motivos de alineación, al haber sido abliterado explícitamente.
- Ejecución local en llama.cpp y derivados, gracias a las once cuantizaciones GGUF publicadas.
- Posible soporte de entrada multimodal: el repositorio incluye dos ficheros mmproj (Q8_0 y f16) que en llama.cpp acompañan a proyecciones visión-lenguaje, aunque la documentación disponible no confirma ni detalla esa capacidad.
- Predicción de múltiples tokens (MTP) según la nomenclatura del modelo base, sin documentación técnica disponible sobre su implementación.
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documentan capacidades específicas de código, matemáticas, audio ni modo de pensamiento explícito.
- Capacidad multilingüe: limitada al inglés según el campo language de la model card.

## Casos de uso

- Escritura creativa y narrativa sin restricciones temáticas: el proceso de abliteration permite abordar tramas, personajes o diálogos que los modelos alineados suelen rechazar; la cuantización Q5_K_M o Q6_K ofrece un equilibrio razonable entre calidad y consumo de memoria para sesiones largas de escritura.
- Investigación en seguridad y red teaming: sirve como sujeto de prueba para medir hasta qué punto un modelo de 27B pierde rechazos tras la abliteration, y para comparar respuestas frente a la versión alineada del mismo modelo base.
- Generación de datos sintéticos para ajuste fino: al no filtrar determinadas categorías de contenido, puede producir datasets conversacionales difíciles de obtener con modelos alineados; conviene auditar la salida antes de incorporarla a un pipeline de entrenamiento.
- Asistente conversacional local y privado: con la cuantización Q4_K_M (16,9 GB) se puede desplegar en una estación de trabajo con 24 GB de VRAM sin enviar datos a servicios externos, útil en entornos con requisitos de confidencialidad.
- Prototipado rápido de aplicaciones de chat: las cuantizaciones Q4_K_S y Q4_K_M están marcadas por el autor como rápidas y recomendadas, lo que las hace adecuadas para validar prompts y flujos conversacionales antes de invertir en hardware mayor.
- Evaluación comparativa de cuantizaciones: el repositorio abarca desde Q2_K hasta Q8_0, de modo que permite medir la degradación de perplejidad y calidad entre niveles de compresión sobre un mismo modelo base y en el mismo hardware.
- Base para experimentación con ajuste fino: aunque el formato GGUF no es el adecuado para entrenar, el modelo base en transformers (ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP) puede servir de punto de partida para especializaciones de dominio, usando las versiones GGUF para validar el comportamiento previo.
- Análisis de documentos en inglés con entrada multimodal (condicional): si se confirma la compatibilidad de los ficheros mmproj con el modelo, se podrían procesar imágenes o documentos escaneados junto a instrucciones textuales; se trata de una capacidad no verificada en la documentación disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación cuantitativa, ni para el modelo base ni para las cuantizaciones derivadas. Tampoco se proporcionan comparaciones con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de los ficheros publicados (sin contar caché KV ni overhead del runtime):
  - Q2_K: 11,0 GB.
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,6 GB; Q3_K_L: 14,7 GB.
  - IQ4_XS: 15,5 GB; Q4_K_S: 15,9 GB; Q4_K_M: 16,9 GB.
  - Q5_K_S: 19,1 GB; Q5_K_M: 19,6 GB.
  - Q6_K: 22,5 GB.
  - Q8_0: 29,1 GB.
  - Ficheros mmproj: 0,7 GB (Q8_0) y 1,0 GB (f16), adicionales si se usa la parte multimodal.
- GPU recomendadas: para Q4_K_M y superiores, una RTX 3090 o RTX 4090 con 24 GB permite cargar hasta Q6_K dejando poco margen para contexto largo; Q8_0 requiere una GPU de 40 GB o más (A100 40 GB, A6000) o repartir el modelo entre dos GPU de 24 GB. Las cuantizaciones Q2_K a Q4_K_S pueden ejecutarse en GPU de 12 a 16 GB (RTX 4070 Ti, RTX 4080) con contexto moderado.
- Viabilidad en GPU de consumo: sí, siempre que se elija la cuantización adecuada. Q4_K_M entra en 24 GB con margen para caché KV; las variantes Q3 y Q2 caben en 12-16 GB a costa de una pérdida de calidad notable.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, koboldcpp) son las vías naturales para GGUF. vLLM admite GGUF de forma limitada y TGI no soporta este formato de manera nativa; para máximo rendimiento en servidor convendría usar el modelo base en safetensors con vLLM.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable. La comparación que sí puede hacerse es entre las variantes del propio repositorio y su modelo de origen:

| Modelo o variante | Parámetros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-GGUF | 27,3 B | GGUF (11 cuantizaciones) | No disponible | swift-open-license-1.0 | HuggingFace, 0 descargas en el momento de la consulta |
| mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF | 27,3 B | GGUF (cuantizaciones ponderadas con imatrix) | No disponible | swift-open-license-1.0 | HuggingFace, repositorio separado enlazado en la model card |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP | 27,3 B | Safetensors (transformers) | No disponible | No disponible | HuggingFace, modelo base del que derivan las cuantizaciones |

Comparativas frente a otros modelos de 27B de la misma categoría (por ejemplo, dentro de la propia familia Qwen3.8 o frente a otros modelos abliterados de tamaño similar): no disponible.

## Limitaciones y advertencias

- El modelo ha sido abliterado y se distribuye como uncensored: puede generar contenido ofensivo, ilegal, peligroso o sexual sin aplicar rechazos. No es apto para aplicaciones orientadas al público general sin capas adicionales de moderación.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) donde la degradación de calidad respecto al modelo original es mayor.
- Idioma limitado al inglés. No hay evidencia de soporte multilingüe y, por tanto, no se recomienda su uso en castellano ni en otras lenguas.
- La licencia swift-open-license-1.0 se registra en HuggingFace como "other" y el texto completo no se reproduce en la información disponible; es imprescindible revisar el enlace de licencia (https://huggingface.co/ukisai/Swift-Qwen3.8-27b) antes de cualquier uso comercial, ya que los términos podrían restringirlo.
- Desconocimiento total del entrenamiento: sin datos de dataset, número de tokens, fases de alineación ni evaluación, no es posible estimar sesgos de origen ni fiabilidad en dominios concretos.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas o estimar con precisión el consumo de memoria de la caché KV.
- El formato GGUF no es adecuado para ajuste fino; para entrenar hay que recurrir al modelo base en safetensors.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta: no existe validación comunitaria ni informes independientes sobre su comportamiento.
- El tamaño del repositorio (190,8 GB) dificulta la descarga completa; conviene seleccionar únicamente la cuantización necesaria.
- La capacidad multimodal es una inferencia a partir de la presencia de ficheros mmproj y no está confirmada en la documentación; no debería asumirse en producción sin verificarla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Texto de la licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Página de resumen y listado de descargas del autor: https://hf.tst.eu/model#Swift-Qwen3.8-27B-Uncensored-MTP-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de TheBloke citado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
