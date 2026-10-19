# polydim-cla/glm-4-9b-pmtp

## Resumen

`polydim-cla/glm-4-9b-pmtp` es un artefacto publicado en Hugging Face por el usuario `polydim-cla` (Ariel García Traba, según la model card, dentro de la iniciativa independiente POLYDIM-EINSOF) que se presenta como un adaptador sobre el modelo conversacional `THUDM/glm-4-9b-chat` de Zhipu AI / THUDM. El repositorio no contiene un modelo entrenado desde cero, sino una modificación de las representaciones internas del modelo base: según la documentación del autor, se inyecta una transformación geométrica en la capa 20 que proyecta el espacio de 4096 dimensiones a una variedad de Stiefel de 2048 dimensiones.

El interés del artefacto es principalmente experimental: propone una técnica de "continuous thought" (razonamiento en espacio latente continuo, sin serializar tokens de texto) y un mecanismo de comunicación entre procesos denominado `PmtpShmBus`. Se trata de propuestas de investigación no revisadas por pares ni validadas de forma independiente, y la model card mezcla afirmaciones técnicas con terminología no estándar ("telepatía tensorial", "Zero-Worm IPC"), lo que exige cautela antes de cualquier uso en producción.

No se han publicado resultados de benchmarks, datos de entrenamiento, tamaños de dataset ni evaluaciones de calidad. El tamaño del repositorio (0,2 GB) es muy inferior al de un modelo de 9 000 millones de parámetros en precisión completa (aproximadamente 18 GB en FP16), lo que sugiere que se distribuye únicamente el delta o adaptador, no los pesos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de GLM-4-9B-Chat) con adaptador geométrico inyectado en la capa 20 sobre una variedad de Stiefel St(4096, 2048) |
| Parametros totales | 9B (según la familia declarada; no se especifica el número exacto de parámetros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base GLM-4-9B-Chat documenta públicamente 128 000 tokens; no verificado para este artefacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del modelo base | d_model = 4096 |
| Dimension canonica tras proyeccion | 2048 |
| Defecto de Frobenius de la variedad Stiefel | 1,375e-13 (acumulador Neumaier en FP64) |
| Capa de inyeccion | 20 |
| Tamano del repositorio | 0,2 GB |
| Modelo base | THUDM/glm-4-9b-chat (finetune) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de GLM-4-9B-Chat de Zhipu AI. Sobre ella, el autor declara una intervención en la capa 20 que aplica una proyección sobre la variedad de Stiefel St(4096, 2048), es decir, el conjunto de matrices de 4096×2048 con columnas ortonormales, embebida en la esfera S^2047. El "defecto de Frobenius" reportado (1,375e-13) es una medida del error numérico al verificar la condición de ortogonalidad de la matriz resultante, calculado con un acumulador compensado de Neumaier en doble precisión.

El segundo componente declarado es `PmtpShmBus`, un mecanismo de comunicación entre procesos vía memoria compartida que, según la model card, permite el intercambio de estados latentes ("continuous thought") sin serializar tokens de texto. Se describe como "Zero-Worm IPC" con "0 text tokens serialized". No se aportan detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología de ajuste del adaptador; tampoco se especifica si la proyección se entrena o se calcula de forma determinista.

La model card contiene además referencias internas contradictorias (etiqueta de Ollama `glm-5.2:cloud` y familia "GLM 4-9B (Chico / 5.3-flash)") que no coinciden con el modelo base declarado, lo que reduce la fiabilidad documental del artefacto. Advertencia adicional: la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo; los resultados obtenidos eran anuncios inmobiliarios de Ostricourt (Francia) y se han descartado por completo.

## Capacidades

- Generación de texto y conversación multi-turno: heredadas del modelo base GLM-4-9B-Chat, sujetas a que el adaptador no degrade las capacidades originales (no verificado).
- Razonamiento en espacio latente continuo: la propuesta central del artefacto es operar sobre estados ocultos proyectados en la variedad de Stiefel en lugar de sobre tokens discretos.
- Comunicación inter-proceso de estados latentes mediante `PmtpShmBus` (memoria compartida), según la documentación del autor.
- Capacidades de tool calling / function calling: no disponible para este artefacto (el modelo base las documenta, pero no hay confirmación de que se conserven).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la ficha de Hugging Face).
- Vision, audio, thinking mode explícito: no disponible.
- No se documenta ningún benchmark, evaluación humana ni test de regresión que respalde estas capacidades.

## Casos de uso

- Investigación sobre adaptadores geométricos: el artefacto sirve como material de estudio para grupos que trabajen con proyecciones sobre variedades de Stiefel aplicadas a espacios de activaciones de transformers; se cargaría junto al modelo base para inspeccionar la capa 20 y medir el efecto de la proyección 4096→2048.
- Experimentación con razonamiento en espacio latente: adecuado para prototipos académicos que comparen la generación token a token con la manipulación directa de estados ocultos, siempre en entornos aislados y sin expectativas de calidad conversacional.
- Reproducción y verificación de resultados: útil para intentar replicar el cálculo del defecto de Frobenius (1,375e-13) y comprobar la ortogonalidad de la matriz inyectada con herramientas de álgebra lineal en FP64.
- Estudio de comunicación inter-proceso de tensores: el componente `PmtpShmBus` puede evaluarse como mecanismo de intercambio de activaciones entre workers en un clúster local, midiendo latencia y ancho de banda frente a serialización JSON o Protobuf.
- Docencia sobre geometría diferencial aplicada a aprendizaje profundo: ejemplo práctico de cómo se define una variedad de Stiefel y cómo se mide su defecto numérico en un modelo real de 9B.
- Auditoría de artefactos de Hugging Face: caso de estudio sobre model cards con terminología no estándar y afirmaciones no verificables, útil para diseñar políticas internas de aprobación de modelos.
- No se recomienda su uso en atención al cliente, generación de código en producción, análisis documental ni ningún escenario con requisitos de fiabilidad, al no existir evidencia de calidad ni evaluación alguna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica. Tampoco se aportan mediciones de latencia, throughput ni consumo de memoria. Cualquier cifra que se atribuya a este artefacto sin evaluación independiente debe considerarse no fundamentada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base GLM-4-9B-Chat, ya que el repositorio solo aporta 0,2 GB de delta. Para 9B en FP16 se necesitan aproximadamente 18 GB de pesos más overhead de activaciones y KV cache; en 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones genéricas para 9B, no medidas sobre este artefacto).
- El adaptador en sí (0,2 GB) es trivial de almacenar; el coste real está en cargar el modelo base completo.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o cuantización de 8 bits; RTX 3090/4080 (16-24 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: previsiblemente sí en 4 bits (RTX 3060 12 GB, RTX 4070, RTX 4090) y en 8 bits con 16 GB o más, asumiendo que el adaptador sea compatible con los kernels de cuantización estándar, extremo no verificado.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama para el modelo base. El adaptador no declara compatibilidad con ninguna de estas herramientas, y el tag de Ollama indicado en la model card (`glm-5.2:cloud`) no corresponde a un identificador válido del ecosistema Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm-4-9b-pmtp (este artefacto) | 9B + adaptador (adaptador de 0,2 GB) | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| THUDM/glm-4-9b-chat (base) | 9B | 128 000 tokens (documentación pública) | benchmarks publicados por el autor del modelo base | Apache-2.0 con términos adicionales según la ficha original | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7B | 32 768 tokens nativos, ampliable (documentación pública) | benchmarks públicos | Apache-2.0 | Ampliamente disponible |
| Llama-3.1-8B-Instruct | 8B | 128 000 tokens (documentación pública) | benchmarks públicos | Llama 3.1 Community License | Ampliamente disponible |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa de categoría. El artefacto analizado no ofrece ningún punto de comparación cuantitativo, por lo que la comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablations, evaluación humana ni test de regresión que demuestren que el adaptador preserva o mejora las capacidades del modelo base.
- Documentación interna contradictoria: la model card menciona simultáneamente "GLM 4-9B", "5.3-flash" y la etiqueta de Ollama `glm-5.2:cloud`, incoherentes con el modelo base declarado (`THUDM/glm-4-9b-chat`).
- Terminología no estándar y no verificable: expresiones como "telepatía tensorial", "Zero-Worm IPC" o "0 text tokens serialized" no se acompañan de especificación técnica, código de referencia ni paper.
- Tamaño del repositorio (0,2 GB) incompatible con pesos completos de 9B: implica que el artefacto requiere el modelo base y un procedimiento de fusión que no se documenta; existe riesgo de incompatibilidad o de carga incorrecta.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permita contraste.
- Riesgo de alucinación: no evaluado para este artefacto; el modelo base es un modelo conversacional y conserva los riesgos habituales de generación factual incorrecta.
- Sesgos: no documentados. Al no haber evaluación, no puede descartarse la amplificación de sesgos del modelo base por efecto del adaptador.
- Idiomas: no declarados en la ficha de Hugging Face; se desconoce si el adaptador afecta al comportamiento multilingüe del modelo base.
- Licencia: Apache-2.0 para el adaptador, pero el uso comercial exige verificar también los términos del modelo base GLM-4-9B-Chat y de los datos con los que fue entrenado.
- La búsqueda web no aportó ninguna fuente independiente sobre el modelo; los resultados obtenidos eran irrelevantes (anuncios inmobiliarios) y se han descartado.
- Recomendación: tratar el artefacto como material de investigación sin garantías; no desplegarlo en producción sin una evaluación propia y una revisión de seguridad previa.

## Enlaces

- Hugging Face: https://huggingface.co/polydim-cla/glm-4-9b-pmtp
- Repositorio GitHub declarado por el autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base en Hugging Face: https://huggingface.co/THUDM/glm-4-9b-chat
- Paper, blog, demo o documentación adicional: no disponible (la búsqueda web no devolvió resultados pertinentes)
