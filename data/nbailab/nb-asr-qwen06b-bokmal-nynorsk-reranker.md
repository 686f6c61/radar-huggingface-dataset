# NbAiLab/nb-asr-qwen06b-bokmal-nynorsk-reranker

## Resumen

El modelo `NbAiLab/nb-asr-qwen06b-bokmal-nynorsk-reranker` es un reranker (cross-encoder de ranking de texto) en desarrollo por el AI Lab de la Biblioteca Nacional de Noruega (NbAiLab), dentro del proyecto NB-ASR. Su objetivo es determinar equivalencia semántica entre texto en bokmål y nynorsk: debe aceptar diferencias que preservan el significado y reordenamientos, y a la vez detectar cambios en números, pronombres, entidades y roles de los participantes. Parte del modelo base `Qwen/Qwen3-Reranker-0.6B` mediante ajuste fino supervisado sobre un corpus paralelo de dominio público.

Es relevante porque aborda un problema poco cubierto por los rerankers multilingües genéricos: la distancia entre las dos normas escritas oficiales del noruego es pequeña en superficie pero con divergencias léxicas y morfológicas que los modelos entrenados solo en inglés o en noruego "bokmål dominante" penalizan en exceso. Un verificador de equivalencia fiable es útil para alinear corpus, evaluar traducción automática entre normas y filtrar salidas generadas por LLM.

Advertencia importante: el repositorio está marcado como `work-in-progress` y la propia model card indica que **todavía no se ha publicado ningún modelo seleccionado ni validado**. No hay pesos, ni instrucciones de inferencia, ni resultados de evaluación. Todo lo que sigue describe un modelo planificado, no un artefacto utilizable hoy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base `Qwen/Qwen3-Reranker-0.6B` es un transformer decoder-only con cabeza de ranking; el ajuste no documenta cambios estructurales) |
| Parámetros totales | no disponible (aproximadamente 0,6 mil millones, heredados del modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el ajuste; el modelo base de la familia Qwen3-0.6B declara 32.768 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | nb (bokmål) y nn (nynorsk) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se han publicado pesos) |

Otros datos de la ficha de HuggingFace: pipeline `text-ranking`, región `eu`, 0 descargas y 1 like en el momento de la consulta, creado y actualizado el 12 de octubre de 2026.

## Arquitectura y entrenamiento

No se ha publicado la arquitectura definitiva del modelo ajustado. El punto de partida declarado es `Qwen/Qwen3-Reranker-0.6B`, un reranker de la familia Qwen3 basado en un transformer decoder-only de aproximadamente 0,6 mil millones de parámetros que produce una puntuación de relevancia o equivalencia para un par de textos. No se documenta en la información disponible si el ajuste modifica la cabeza de clasificación, la plantilla de prompt o el régimen de entrenamiento del modelo base.

En cuanto a los datos, el entrenamiento parte del corpus paralelo `NbAiLab/merged_npk_ndla_parallel_paragraphs_normform_cc0`, en revisión `619e36b85e4943f23cd85b66edcde331995e4872`, publicado bajo licencia CC0 y compuesto por párrafos paralelos procedentes de NPK (Nynorsk Pressekontor) y NDLA, en forma normalizada. La validación es automática y sin revisión manual: la exactitud dependerá de la calidad de los pares positivos aportados y de las reglas de corrupción que se apliquen para generar negativos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición final del dataset, ni si se emplean técnicas de RLHF o DPO.

La innovación funcional declarada no está en la arquitectura, sino en el criterio de equivalencia: el modelo debe reconocer como equivalentes los cambios que preservan el significado y los reordenamientos, y rechazar alteraciones de números, pronombres, entidades y roles de participante. Es decir, se entrena para una noción de equivalencia semántica estricta en contenido factual, laxa en forma.

## Capacidades

- Ranking de pares de texto (cross-encoder) para tareas de reordenación de candidatos: pipeline `text-ranking`.
- Verificación de equivalencia semántica entre bokmål y nynorsk como caso de uso central.
- Detección de cambios de significado en números, pronombres, entidades nombradas y roles de participante.
- Tolerancia a diferencias de forma que preservan el significado y a reordenamientos internos dentro de una misma unidad de texto.
- Capacidad multilingüe limitada por diseño: los idiomas declarados son únicamente nb y nn.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el pipeline declarado es de ranking, no de generación).
- Capacidad de visión o audio: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Reranking en búsqueda semántica sobre corpus noruegos mixtos: dada una consulta y una lista de pasajes en bokmål o nynorsk, el modelo puntuaría cada par y reordenaría los resultados, tratando como equivalentes los pasajes que solo difieren por norma escrita. Es adecuado porque un reranker multilingüe genérico penaliza divergencias léxicas entre normas que no cambian el contenido.
- Evaluación automática de sistemas de traducción bokmål–nynorsk: el modelo actuaría como métrica de fidelidad semántica sobre las hipótesis generadas, penalizando cambios de número o de entidad y aceptando variación de forma. Encaja en un pipeline de evaluación automática sin revisión humana, tal como plantea el autor en la validación.
- Alineación y deduplicación de corpus paralelos: en la construcción de corpus de entrenamiento, serviría para confirmar que dos párrafos alineados son de hecho equivalentes y descartar alineaciones espurias producidas por heurísticas de longitud o posición.
- Control de calidad en pipelines de transcripción y normalización (proyecto NB-ASR): comparar una transcripción o una forma normalizada contra una referencia y detectar discrepancias factuales (cifras, nombres propios, pronombres) antes de publicar el contenido.
- Auditoría de texto generado por LLM en noruego: verificar que una paráfrasis, un resumen o una reescritura de bokmål a nynorsk no introduce números, entidades o roles nuevos. Se usaría como filtro previo a la publicación en entornos editoriales o institucionales.
- Filtrado de datos para entrenamiento de modelos nórdicos: al construir datasets a partir de colecciones digitales de la Biblioteca Nacional, el reranker permitiría conservar pares realmente equivalentes y descartar ruido, mejorando la relación señal/ruido del corpus final.
- Sistemas RAG sobre documentación bilingüe (bokmål/nynorsk) en administración pública o medios: el modelo puntuaría los fragmentos recuperados antes de pasarlos al generador, reduciendo el riesgo de que se mezclen documentos que no responden a la pregunta por diferencias normativas superficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del tamaño del modelo base (aproximadamente 0,6 mil millones de parámetros), no datos publicados por el autor.

- VRAM estimada para inferencia: en BF16/FP16, alrededor de 1,2 GB solo de pesos, con unos 2-3 GB de VRAM totales contando activaciones y overhead; en INT8, aproximadamente 0,6 GB de pesos; en INT4, alrededor de 0,35 GB.
- GPU recomendadas: al tratarse de un modelo de menos de mil millones de parámetros, cabe con holgura en cualquier GPU con al menos 4 GB de VRAM; una NVIDIA RTX 3060, RTX 4060 o superior es más que suficiente. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, prácticamente en cualquier GPU de consumo moderna, e incluso en CPU con cuantización INT8 o INT4 a velocidades aceptables para ranking por lotes.
- Opciones de despliegue: por el pipeline declarado (`text-ranking`) el marco natural es `sentence-transformers` o `transformers` con cabeza de clasificación; también son viables TGI, vLLM (con soporte de clasificación) y llama.cpp u Ollama previa conversión a GGUF. No obstante, no hay pesos publicados, por lo que ninguna de estas opciones es operativa hoy.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de modelos competidores. La comparación siguiente usa únicamente datos públicos de documentación de los propios modelos y debe tomarse como orientativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| nb-asr-qwen06b-bokmal-nynorsk-reranker | ~0,6 B (heredado) | no disponible | nb, nn | Apache 2.0 | En desarrollo, sin pesos |
| Qwen3-Reranker-0.6B (modelo base) | ~0,6 B | 32.768 tokens | Multilingüe (más de 100 idiomas) | Apache 2.0 | Publicado |
| Qwen3-Reranker-4B | ~4 B | 32.768 tokens | Multilingüe (más de 100 idiomas) | Apache 2.0 | Publicado |
| bge-reranker-v2-m3 | ~568 M | no disponible en esta ficha | Multilingüe | no disponible en esta ficha | Publicado |

No se dispone de puntuaciones comparativas de benchmarks para ninguno de ellos en la información consultada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El repositorio está explícitamente marcado como trabajo en curso: no se ha publicado ningún modelo seleccionado ni validado, no hay pesos ni instrucciones de inferencia.
- La validación es automática y sin revisión manual, según declara el autor. La precisión del modelo quedará condicionada a la calidad de los pares positivos y a las reglas de corrupción empleadas para generar negativos, lo que puede introducir sesgos sistemáticos en la definición de "equivalencia".
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica directamente al pipeline de ranking, pero un reranker mal calibrado puede asignar puntuaciones altas a pares que difieren en números o entidades, propagando errores aguas abajo en pipelines de RAG o de evaluación.
- Limitación de idioma: el modelo solo declara nb y nn. No debe esperarse un comportamiento fiable en inglés, sueco, danés ni en otras variedades del noruego.
- Limitación de contexto: no se documenta la ventana efectiva para el ajuste; el modelo base declara 32.768 tokens, pero el entrenamiento se realiza sobre párrafos, por lo que el rendimiento en textos largos no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. El corpus de entrenamiento es CC0, sin restricciones adicionales conocidas.
- Caveat para producción: no debe integrarse en ningún sistema productivo hasta que se publiquen pesos, model card completa y resultados de evaluación. El estado actual (0 descargas, 1 like) confirma que el artefacto no está siendo consumido por terceros.
- El nombre del modelo (`nb-asr-...`) sugiere una relación con el proyecto de reconocimiento automático del habla NB-ASR, pero no se documenta en la ficha cómo se integra exactamente en ese pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NbAiLab/nb-asr-qwen06b-bokmal-nynorsk-reranker
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/NbAiLab/merged_npk_ndla_parallel_paragraphs_normform_cc0
- Plan de entrenamiento completo: https://bokmal-nynorsk-reranker-plan.peregilk.chatgpt.site
- Organización NbAiLab en HuggingFace: https://huggingface.co/NbAiLab
- AI-lab de la Biblioteca Nacional de Noruega: https://ai.nb.no/
- Página de modelos del AI-lab: https://ai.nb.no/models/
- Familia de modelos Borealis (noruego): https://ai.nb.no/borealis/
