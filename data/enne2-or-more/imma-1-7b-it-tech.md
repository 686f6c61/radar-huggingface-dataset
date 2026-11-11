# enne2-or-more/IMMA-1.7B-IT-Tech

## Resumen

IMMA-1.7B-IT-Tech es un adaptador DoRA/LoRA publicado por Matteo Benedetto (usuario `enne2-or-more`) sobre el modelo base LiquidAI/LFM3-1.7B, un transformer de 1,73 mil millones de parámetros con arquitectura híbrida (convoluciones cortas con gating, atención de ventana deslizante y atención global) y una ventana de contexto nativa de 262.144 tokens. El adaptador está especializado en la redacción y revisión de documentos técnico-profesionales en italiano: correos electrónicos, actas, procedimientos, notas de escalado, informes, planes de prueba y comunicaciones de servicio.

El autor lo presenta explícitamente como un experimento didáctico de un día, no como un producto: la receta, los datos, el entrenamiento y la evaluación se completaron en una sola jornada con un conjunto de 2.013 ejemplos curados y una evaluación propia de 650 peticiones. Aun así, los resultados medidos son notables frente al modelo base: 80,6% de cumplimiento de restricciones de formato (frente a 49,5%), 3,4% de anglicismos sustituibles (frente a 48,8%), y devolución idéntica de texto ya correcto en el 90% de los casos (frente a 0% del base).

Su relevancia actual reside en dos factores: demuestra que un adaptador ligero puede corregir sesgos lingüísticos muy concretos del modelo base (como el uso del subjuntivo en italiano, que pasa del 20% al 70% en una sonda de 20 frases), y ofrece pesos en formato GGUF con rendimiento medido en hardware de consumo (161 tok/s en una GPU de portátil de 8 GB). Es un caso de estudio útil para quien quiera evaluar la viabilidad de adaptadores especializados en dominios profesionales con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA + rsLoRA sobre LFM3-1.7B (transformer híbrido: 13 convoluciones cortas con gating, 5 capas de atención de ventana deslizante, 6 capas de atención global) |
| Parametros totales | 1,73 mil millones (modelo base); el adaptador LoRA/DoRA añade un conjunto reducido de parámetros entrenables (r=16, α=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | GGUF Q8_0 (medido); otros tipos no disponibles en la información proporcionada |
| Idiomas soportados | Italiano (it) |
| Licencia | lfm-open-license-1.0 (licencia del modelo base LiquidAI/LFM3-1.7B) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se monta sobre LFM3-1.7B, un transformer híbrido de Liquid AI que combina 13 capas de convolución corta con gating, 5 capas de atención de ventana deslizante y 6 capas de atención global, con un contexto nativo de 262.144 tokens. El entrenamiento se realizó cargando el modelo base en bf16, sin cuantización durante el proceso. El adaptador es de tipo DoRA con rsLoRA, con rango 16, alpha 32, dropout 0,05, y se aplica sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `w1`, `w2`, `w3` y `gate_proj`.

El conjunto de datos consta de 2.013 ejemplos curados distribuidos en cinco componentes: 1.224 filas de datos curados manualmente (reglas, ejercicios de repetición y dominio) con 14.240 palabras de respuesta; 272 ejemplos de identidad y edición mínima (duplicados ×2) con 11.680 palabras; 264 ejemplos de morfología derivacional (×2) con 2.556 palabras; 193 ejemplos de autodestilación filtrada con 25.743 palabras; y 60 ejemplos de replay genérico de dominio con 8.104 palabras. Los hiperparámetros incluyen 2 épocas, batch de 4 con acumulación de 8, `max_length` de 768, packing desactivado y `assistant_only_loss` (el dato se corta en la información proporcionada). El dataset de referencia es `antoniogr7/italian-sft-curated`.

## Capacidades

- Generación de texto técnico-profesional en italiano: correos electrónicos, actas de reunión, procedimientos, notas de escalado, informes, planes de prueba, ofertas y comunicaciones de servicio.
- Revisión y corrección de textos: detecta y corrige errores, y devuelve el texto sin cambios cuando ya es correcto (90% de acierto en la evaluación propia).
- Edición mínima: capacidad de aplicar una única corrección puntual sin reescribir el documento completo (50% de acierto exacto en la sonda).
- Uso de herramientas (tool calling): el autor indica que el modelo "usa los tool", aunque no detalla el formato ni la integración concreta.
- Respuesta a preguntas generales y cálculos aritméticos básicos, según la model card.
- Control del registro formal: evita Markdown en documentos formales (0,3% frente al 90,6% del base) y reduce anglicismos sustituibles (3,4% frente a 48,8%).
- Corrección gramatical avanzada en italiano: uso del subjuntivo en construcciones que lo exigen (70% de acierto en sonda de 20 frases, frente al 20% del base).
- Conocimiento de morfología derivacional del italiano (88% en sonda de 16 ítems, frente al 62% del base).

## Casos de uso

- Redacción de actas de reunión: el modelo puede cerrar un acta a partir de notas dispersas, respetando el formato formal y evitando Markdown o anglicismos, gracias a su entrenamiento específico en documentos corporativos italianos.
- Corrección de correos electrónicos profesionales: se le puede pasar un borrador y devolverá una versión corregida con edición mínima, sin reescribir el texto si ya es correcto, lo que reduce el riesgo de introducir cambios no deseados en comunicaciones sensibles.
- Generación de procedimientos técnicos: adecuado para redactar procedimientos operativos estándar (SOP) en italiano con estructura formal, usando el contexto largo del modelo base para incorporar documentación de referencia extensa.
- Notas de escalado en soporte técnico: el modelo puede redactar notas de escalado con el formato y el léxico esperados en entornos de soporte empresarial italiano, sustituyendo términos ingleses por equivalentes italianos.
- Planes de prueba y documentación de calidad: útil para generar planes de prueba y documentación asociada a procesos de QA, con estructura formal y sin marcado Markdown que rompa el formato del documento final.
- Revisión lingüística de propuestas y ofertas comerciales: puede revisar ofertas y propuestas para eliminar anglicismos innecesarios y corregir errores gramaticales, manteniendo el registro formal adecuado para comunicación con clientes.
- Despliegue en local con llama.cpp: al estar disponible en GGUF Q8_0 y rendir a 161 tok/s en una GPU de portátil de 8 GB, es viable para herramientas internas de revisión de documentos que deban ejecutarse sin conexión o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

Evaluación propia del autor con 650 peticiones en italiano técnico/empresarial (25 tipos de documento × 26 variantes), temperatura 0,7, juicio determinista por ítem:

| Métrica | LFM3-1.7B base | IMMA-1.7B-IT-Tech |
|---|---|---|
| Restricciones de formato respetadas | 49,5% (322/650) | 80,6% (524/650) |
| Anglicismos sustituibles | 48,8% | 3,4% |
| Marcadores de posición dejados en el texto (`[Nome]`) | 39,2% | 0,9% |
| Markdown dentro de documentos formales | 90,6% | 0,3% |
| Palabras inventadas | 31,2% | 10,5% |
| Frases de más de 45 palabras | 32,5% | 22,9% |
| Texto ya correcto devuelto idéntico | 0% | 90% |
| Corrección mínima (un solo error) exacta | 0% | 50% |
| Conocimiento de derivaciones (sonda, 16 ítems) | 62% | 88% |
| Subjuntivo (sonda, 20 frases con régimen obligatorio) | 20% | 70% |

Rendimiento de inferencia medido con GGUF Q8_0 en una RTX PRO 2000 Blackwell Laptop de 8 GB, llama.cpp b12212: 161 tok/s en una sola sesión, 366 tok/s agregados con 8 sesiones concurrentes, 16 slots con KV q8_0. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,1 GB; el modelo base de 1,73 mil millones de parámetros en Q8_0 requiere aproximadamente 2 GB de VRAM, y en bf16 alrededor de 3,5 GB (estimación a partir del tamaño de parámetros, no confirmada en la información proporcionada).
- GPU recomendadas: RTX PRO 2000 Blackwell Laptop de 8 GB (medida por el autor); cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar la versión Q8_0.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM en cuantización Q8_0.
- Opciones de despliegue: llama.cpp (medido con la build b12212), y previsiblemente cualquier runtime compatible con GGUF; el adaptador PEFT también puede cargarse con la librería `peft` sobre el modelo base en bf16.
- Latencia y throughput: 161 tok/s en una sola sesión y 366 tok/s agregados con 8 sesiones concurrentes en la GPU medida; no se dispone de datos de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de comparaciones directas con otros adaptadores en la información proporcionada. La comparación más relevante es contra el propio modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en la evaluación propia |
|---|---|---|---|---|---|
| IMMA-1.7B-IT-Tech | 1,73 B (adaptador sobre LFM3-1.7B) | 262.144 tokens | lfm-open-license-1.0 | safetensors (PEFT), GGUF | 80,6% formato, 3,4% anglicismos, 90% texto correcto idéntico |
| LFM3-1.7B (base) | 1,73 B | 262.144 tokens | lfm-open-license-1.0 | safetensors, GGUF | 49,5% formato, 48,8% anglicismos, 0% texto correcto idéntico |

No se dispone de datos sobre otros adaptadores italianos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor lo describe explícitamente como un experimento didáctico de un día, no como un producto: pocos datos, hiperparámetros no optimizados y evaluación construida en casa.
- Sesgos conocidos: deriva lingüística hacia el español en algunas reescrituras completas de frases (por ejemplo, "andegue en producción"), documentada por el autor.
- Errores gramaticales residuales: confusión de auxiliar en plural ("che i colleghi siano verificati i requisiti" en lugar de "abbiano verificato") en construcciones con subjuntivo.
- Riesgo de alucinación: 10,5% de palabras inventadas en la evaluación propia, todavía por encima del ideal aunque muy inferior al 31,2% del base.
- Limitación de idioma: solo italiano; no se ha evaluado su comportamiento en otros idiomas.
- Restricciones de licencia: hereda la lfm-open-license-1.0 del modelo base; es necesario revisar sus términos antes de un uso comercial.
- En producción: el rendimiento medido se limita a una GPU concreta y a llama.cpp; no hay datos de latencia por petición ni de comportamiento en cargas reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enne2-or-more/IMMA-1.7B-IT-Tech
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de referencia: https://huggingface.co/datasets/antoniogr7/italian-sft-curated
- Perfil del autor: https://huggingface.co/enne2-or-more
