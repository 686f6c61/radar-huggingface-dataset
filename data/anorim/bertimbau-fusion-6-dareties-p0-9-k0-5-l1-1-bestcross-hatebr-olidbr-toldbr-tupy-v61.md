# anorim/bertimbau-fusion-6-dareties-p0.9-k0.5-l1.1-bestcross-hatebr-olidbr-toldbr-tupy-v61

## Resumen

Este repositorio contiene un modelo de clasificación de texto en portugués construido mediante la fusión de seis checkpoints, según se deduce de su propio identificador: `bertimbau-fusion-6-dareties-...`. El nombre indica que la fusión se ha realizado con la técnica DARE-TIES (parámetros `p=0.9`, `k=0.5`, `l=1.1`), un método de merging de pesos que poda y reescala deltas de tareas antes de combinarlos, y que los seis modelos fusionados proceden de ajustes finos sobre los corpus `hatebr`, `olidbr`, `toldbr` y `tupy`, todos ellos conjuntos de datos de odio y lenguaje ofensivo en portugués (mayoritariamente portugués de Brasil). El autor es el usuario `anorim`.

El modelo base es BERTimbau en su variante base: el recuento real de parámetros en safetensors es de 108.924.674, cifra que coincide exactamente con la arquitectura BERT-base adaptada al portugués (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, vocabulario de aproximadamente 29.794 tokens y 512 posiciones de contexto). El repositorio pesa 0,4 GB, consistente con pesos en precisión completa (fp32) de un encoder de este tamaño.

La relevancia práctica del modelo es acotada pero concreta: se trata de un clasificador especializado en moderación de contenido en portugués, un ámbito donde los modelos multilingües generalistas rinden peor que los ajustados sobre corpus locales. No obstante, la ficha está limitada por la ausencia casi total de documentación publicada: no hay model card accesible con datos de entrenamiento, licencia, idiomas declarados, métricas ni esquema de etiquetas, y el contador de descargas es de 14 con 0 "likes", por lo que debe considerarse un artefacto experimental sin validación pública. Los datos de esta ficha proceden del identificador del modelo, de los metadatos de HuggingFace y de inferencias derivadas del recuento de parámetros, y se indican como tales cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (derivado del recuento de parámetros y del prefijo `bertimbau` del ID; no confirmado en documentación) |
| Parámetros totales | 108.924.674 (dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (valor derivado de BERTimbau base; no confirmado en el repositorio) |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; al ser un encoder de 109 M de parámetros admite cuantización dinámica a int8 en formato ONNX, pero no hay artefactos oficiales) |
| Idiomas soportados | no declarados en el repositorio; por los corpus indicados en el nombre (`hatebr`, `olidbr`, `toldbr`, `tupy`) el uso previsto es portugués, con predominio del portugués de Brasil |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); tamaño del repo 0,4 GB |

## Arquitectura y entrenamiento

No hay información publicada sobre el proceso de entrenamiento más allá de lo que se deduce del identificador. Todo apunta a un esquema de *model merging* en lugar de un entrenamiento desde cero: seis modelos ajustados de forma independiente sobre tareas y corpus de odio/abuso en portugués se combinan en un único conjunto de pesos mediante DARE-TIES. DARE (*Drop And REscale*) elimina una fracción de los parámetros delta de cada modelo de tarea y reescala los restantes para preservar la magnitud esperada; TIES-Merging, por su parte, resuelve los conflictos de signo entre deltas mediante truncamiento, elección de signo mayoritario y una fusión disjunta. Los hiperparámetros del identificador encajan con esa receta: una densidad de poda `p=0.9` (se conserva el 10 % de los deltas), `k=0.5` (habitualmente el coeficiente de reescalado) y `l=1.1` (habitualmente un factor de escalado o coeficiente de mezcla). El sufijo `bestcross` sugiere algún criterio de selección del punto de control final, probablemente basado en validación cruzada, y `v61` indica que se trata de la sexagésimo primera iteración de una línea de experimentos.

La arquitectura subyacente es la de un encoder bidireccional con atención completa, es decir, sin decodificador autorregresivo: el modelo no genera texto libre, sino representaciones contextuales que se proyectan sobre una cabeza de clasificación. Esto implica que su uso natural es la inferencia de tipo *sequence classification* (por ejemplo, `AutoModelForSequenceClassification` con `num_labels` heredado de los checkpoints fusionados), con una pasada hacia delante por secuencia. Un punto crítico y no documentado es la compatibilidad de las cabezas de clasificación: los cuatro corpus citados emplean taxonomías distintas (HateBR es binario para discurso de odio en Instagram, OLID-BR es jerárquico de tres niveles para lenguaje ofensivo, Told-BR distingue entre lenguaje tóxico y no tóxico en tuits, y Tupy se orienta a comentarios en portugués), de modo que la fusión de pesos de clasificación de modelos con espacios de etiquetas diferentes puede producir una cabeza cuyo significado no coincida con ninguna de las taxonomías originales. Sin el `config.json` ni la model card no es posible confirmar cómo se resolvió ese punto.

## Capacidades

- Clasificación de secuencias de texto en portugués, presumiblemente orientada a detección de discurso de odio y lenguaje ofensivo o tóxico.
- Codificación contextual bidireccional reutilizable como extractor de características (`AutoModel`) para tareas posteriores de *fine-tuning*, como NER, análisis de sentimiento o *reranking*.
- Capacidad multilingüe: no disponible; el vocabulario de BERTimbau está centrado en portugués, por lo que el rendimiento fuera de ese idioma es, como mínimo, dudoso y no está medido.
- Generación de texto: no soportada (arquitectura exclusivamente encoder).
- Razonamiento multi-paso, matemáticas y código: no soportados ni evaluados.
- Tool calling / function calling: no soportado.
- Capacidades de agente: no soportadas.
- Visión, audio o modo "thinking": no soportados.
- Salida estructurada: únicamente logits por etiqueta; el esquema concreto de etiquetas no está documentado.

## Casos de uso

- Moderación de comentarios en redes sociales en portugués: el modelo puede actuar como clasificador de primera línea sobre cada comentario o tuit, con inferencia por lotes sobre secuencias de hasta 512 tokens, para marcar contenido potencialmente ofensivo antes de la revisión humana.
- Filtrado de comentarios en portales de noticias brasileños: integrado como *microservicio* detrás de una cola de mensajes, permite prefiltrar el *feedback* de lectores y enrutar solo los casos con puntuación alta hacia el equipo de moderación.
- Protección de comunidades en plataformas de chat o videojuegos: clasificación en tiempo real de mensajes de chat, donde el reducido tamaño del modelo (0,4 GB en fp32, ~0,2 GB en fp16) permite inferencia en CPU o en GPUs de gama baja con latencia de milisegundos por lote.
- Detección de abuso en reseñas de *marketplaces*: análisis de reseñas de producto para detectar insultos o ataques dirigidos a vendedores, usando la cabeza de clasificación sobre el texto completo de la reseña.
- Preetiquetado para anotación humana: el modelo puede generar etiquetas preliminares sobre grandes volúmenes de texto en portugués para acelerar un proceso de anotación activa, con revisión humana posterior que corrija los falsos positivos.
- Filtrado de conjuntos de datos de entrenamiento: uso como clasificador para limpiar corpus web en portugués antes de entrenar otros modelos, descartando documentos con alta probabilidad de toxicidad o abuso.
- Investigación en *model merging*: sirve como caso de estudio reproducible de la receta DARE-TIES sobre modelos BERTimbau, útil para comparar estrategias de fusión frente a *ensembling* o *fine-tuning* directo multi-tarea.
- *Reranking* o *scoring* de textos en portugués: empleo del encoder como extractor de representaciones para sistemas de búsqueda o recomendación que operen con contenido en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card con métricas, y el nombre del modelo no aporta cifras de evaluación. No hay datos de precisión, *recall*, F1 ni comparaciones con la línea base de BERTimbau en los corpus citados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 (108,9 M de parámetros × 4 bytes) y aproximadamente 0,22 GB para pesos en fp16/bf16; a ello hay que sumar el *overhead* de activaciones y del *runtime* (típicamente varios cientos de MB adicionales, dependiendo del tamaño de lote y de la longitud de secuencia).
- GPUs recomendadas: cualquier GPU moderna es sobredimensionada para este modelo. Resulta adecuada una NVIDIA T4, L4, RTX 3060, RTX 4090 o incluso A100/H100 si se comparte con otros servicios; no requiere memoria dedicada.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo con al menos 2 GB de VRAM. También es viable la inferencia en CPU, dado el tamaño del modelo.
- Opciones de despliegue: Hugging Face Transformers (`AutoModelForSequenceClassification`), exportación a ONNX Runtime o TorchScript para servir en CPU, y despliegue en Hugging Face Inference Endpoints. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este encoder, aunque algunos *runtimes* admiten modelos de clasificación. llama.cpp/Ollama requerirían conversión a GGUF y no hay artefactos publicados.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas). Como referencia estructural, un encoder de 109 M de parámetros y 512 posiciones es varias veces más rápido que cualquier modelo generativo del mismo tamaño, pero no se dispone de cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anorim/bertimbau-fusion-6-dareties-... (este modelo) | 108,9 M | 512 (derivado) | Clasificación de odio/ofensivo en portugués | no disponible | HuggingFace, 14 descargas |
| BERTimbau base (`neuralmind/bert-base-portuguese-cased`) | 108,9 M | 512 | Modelo de lenguaje enmascarado / base para *fine-tuning* en portugués | MIT | Ampliamente disponible y documentado |
| BERTimbau large (`neuralmind/bert-large-portuguese-cased`) | ~335 M | 512 | Base para *fine-tuning* en portugués | MIT | Ampliamente disponible |
| XLM-RoBERTa base (`FacebookAI/xlm-roberta-base`) | ~278 M | 512 | Multilingüe, base para *fine-tuning* | MIT | Ampliamente disponible |

La comparación cuantitativa de rendimiento no es posible: no hay métricas publicadas para el modelo fusionado. Frente a BERTimbau base, la diferencia no es de arquitectura sino de pesos ajustados mediante *merging* para tareas de moderación, con la ventaja de partir de un modelo ya orientado a la tarea y la desventaja de carecer por completo de documentación y de licencia explícita.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, composición del dataset, hiperparámetros de ajuste, ni proceso de evaluación. La reproducibilidad es, a efectos prácticos, nula.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. En la práctica, el uso en producción conlleva riesgo jurídico y debe tratarse como material sin licenciar hasta contactar con el autor.
- Esquema de etiquetas desconocido: al fusionar seis checkpoints procedentes de corpus con taxonomías diferentes (binaria, jerárquica de tres niveles, tóxica/no tóxica), la cabeza de clasificación puede no corresponder a ninguna de las taxonomías originales. Es imprescindible inspeccionar `config.json` (`id2label`) y validar con un conjunto de evaluación propio antes de cualquier uso.
- Riesgo de sesgo: los corpus de odio en portugués suelen sobrerrepresentar determinadas variantes dialectales y temas, y los clasificadores de toxicidad tienden a penalizar de forma desproporcionada el lenguaje de grupos históricamente marginalizados, incluidas reapropiaciones de términos. No hay auditoría de sesgo disponible.
- Riesgo de alucinación: no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos, no medidos.
- Limitación de contexto: 512 tokens (valor derivado). Textos más largos requieren truncado o troceado, lo que degrada la detección cuando la evidencia de toxicidad aparece fuera de la ventana.
- Cobertura idiomática: orientado a portugués; no hay evidencia de rendimiento en otras lenguas ni en variantes del portugués distintas de la brasileña.
- Adopción mínima y sin validación de terceros: 14 descargas y 0 "likes" en el momento de la consulta. No debe asumirse calidad por el número de modelos fusionados.
- Metadatos inconsistentes: las fechas de creación y actualización indican 2026-09-17, lo que resulta anómalo y sugiere un error de registro o manipulación de metadatos; conviene verificar la procedencia antes de confiar en el artefacto.
- El identificador con `v61` indica un proceso iterativo de experimentación; es probable que existan versiones anteriores o posteriores sin documentación que permita compararlas.
- La ausencia de *pipeline* declarado en HuggingFace impide conocer la tarea exacta prevista por el autor.
- Uso responsable: cualquier despliegue de moderación automatizada debe mantener revisión humana y mecanismos de apelación, dado que un clasificador no auditado no es base suficiente para sancionar a usuarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anorim/bertimbau-fusion-6-dareties-p0.9-k0.5-l1.1-bestcross-hatebr-olidbr-toldbr-tupy-v61
- Model card: no disponible (el repositorio no expone documentación en la información proporcionada).
- Paper o blog del autor: no disponible.
- Demos o espacios asociados: no disponible.

Nota sobre las referencias: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su autor; los resultados obtenidos correspondían a páginas de ayuda de servicios no relacionados. Las técnicas de fusión mencionadas en el identificador (DARE y TIES-Merging) disponen de publicaciones propias en arXiv, pero no se incluyen aquí enlaces porque no han sido verificados como fuentes asociadas a este repositorio concreto.
