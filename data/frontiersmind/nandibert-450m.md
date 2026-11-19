# FrontiersMind/NandiBERT-450M

## Resumen

NandiBERT-450M es un codificador bidireccional (encoder) de tipo masked language modeling desarrollado por FrontiersMind, pensado para cubrir simultáneamente inglés y lenguas índicas en un único modelo. Forma parte de la familia NandiBERT, junto a una variante de 150M de parámetros, y su propuesta central es resolver la brecha que existía en encoders previos, que solían rendir bien en inglés o en índico pero no en ambos. El modelo declara 548.471.808 parámetros reales en safetensors y un tamaño de repositorio de 1,1 GB.

Arquitectónicamente es un transformer encoder de 28 capas con tamaño oculto de 1.024, normalización QK, activación SwiGLU y atención de consultas agrupadas (GQA) con 8 cabezas de consulta y 2 de clave-valor, lo que reduce el consumo de memoria en entradas largas. Su ventana de contexto es de 32.768 tokens, adecuada para documentos completos en una sola pasada, y comparte con el resto de la familia un vocabulario multilingüe de 100.000 tokens almacenado como embedding factorizado de rango 512.

Es relevante ahora porque ofrece una alternativa Apache-2.0 para tareas de comprensión (clasificación, NER, reranking, recuperación de documentos largos) en un abanico amplio de idiomas, con contexto largo y sin depender de encoders separados por familia lingüística. No obstante, la model card no publica todavía resultados de benchmarks ni un informe técnico definitivo, por lo que su rendimiento real debe validarse en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, 28 capas, hidden 1.024, QK-norm, SwiGLU, GQA (8 cabezas de consulta, 2 de clave-valor) |
| Parametros totales | 548.471.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (la model card solo muestra carga en bfloat16) |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 28 capas con tamaño oculto de 1.024, normalización QK y SwiGLU en las capas feed-forward. Usa atención de consultas agrupadas con 8 cabezas de consulta y 2 cabezas de clave-valor, decisión que reduce el coste de memoria de la caché de atención en secuencias largas. El vocabulario de 100.000 tokens, compartido por la familia NandiBERT, se almacena como embedding factorizado de rango 512, lo que rebaja la tabla de embeddings de 103M a 52M parámetros y libera capacidad para las capas del encoder.

La model card no detalla el volumen de tokens de entrenamiento, la composición del corpus ni si hubo etapas de ajuste posteriores (RLHF, DPO u otras), y el apartado de benchmarks está marcado como pendiente. La información disponible se limita a la descripción arquitectónica y a la ventana de contexto de 32.768 tokens, que sitúa al modelo en el rango de encoders de contexto largo.

## Capacidades

- Masked language modeling (fill-mask) sobre texto en inglés, 11 lenguas índicas en escritura nativa y romanizada, lenguas del sudeste asiático y de Oriente Medio.
- Codificación bidireccional de contexto, apta para tareas de comprensión y no para generación autoregresiva.
- Procesamiento de documentos largos de hasta 32.768 tokens en una sola pasada.
- Base para fine-tuning en clasificación de secuencias, etiquetado de tokens (NER), reranking y recuperación de documentos largos.
- Cobertura multilingüe con un vocabulario compartido de 100.000 tokens para toda la familia.
- Carga mediante Hugging Face `transformers` 5.x con `trust_remote_code=True`, usando `AutoModelForMaskedLM` y `AutoTokenizer`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación de documentos multilingües: fine-tuning sobre la cabeza de clasificación para categorizar tickets, contratos o informes en inglés e índico con un único modelo, evitando mantener encoders separados por idioma.
- Reconocimiento de entidades nombradas (NER): el etiquetado de tokens sobre la salida del encoder permite extraer nombres, organizaciones y localizaciones en las 18 lenguas declaradas, con contexto suficiente para desambiguar entidades en párrafos largos.
- Reranking en pipelines de búsqueda: usar las representaciones del encoder para reordenar candidatos recuperados por un sistema léxico o vectorial, aprovechando la ventana de 32K para puntuar pasajes extensos con su contexto completo.
- Recuperación de documentos largos: codificar contratos, informes o artículos científicos de hasta 32.768 tokens en una sola pasada, lo que evita el troceado agresivo y la pérdida de contexto en tareas de retrieval.
- Análisis de contratos y documentos legales: la ventana de 32K permite procesar el documento íntegro para tareas de extracción de cláusulas o clasificación de riesgo, algo que encoders de 512 tokens no cubren sin segmentación.
- Moderación y filtrado de contenido: clasificación de textos en múltiples lenguas índicas y del sudeste asiático con un solo modelo, simplificando el despliegue en plataformas con audiencias diversas.
- Preentrenamiento base para dominio financiero o sanitario: partir de un encoder Apache-2.0 y ajustarlo con datos propios en las lenguas objetivo, reduciendo el coste frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de resultados con marcadores `TODO` sin cifras, y el informe técnico figura como pendiente de publicación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,1 GB de pesos más memoria de activaciones; con 32.768 tokens de contexto, las activaciones y la caché de atención elevan el consumo de forma notable, por lo que conviene reservar varios GB adicionales según el tamaño de lote.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y secuencias de 32K; RTX 4090 (24 GB) es suficiente para inferencia con lotes moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para secuencias cortas; para contexto completo de 32K se recomienda 16-24 GB.
- Opciones de despliegue: Hugging Face `transformers` 5.x con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NandiBERT-450M | 548M | 32.768 | Apache-2.0 | Encoder multilingüe en/índico, GQA, embeddings factorizados |
| NandiBERT-150M | 150M | 16.384 | Apache-2.0 | Variante pequeña de la misma familia, hidden 768 |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada |

La única comparación documentada es interna a la familia NandiBERT: la variante de 150M ofrece menor coste con contexto de 16K, mientras que la de 450M duplica la ventana y aumenta la profundidad y el tamaño oculto.

## Limitaciones y advertencias

- No es un modelo generativo: está diseñado para masked language modeling y fine-tuning sobre tareas de comprensión; no debe usarse como modelo de chat o de generación autoregresiva.
- Ausencia de benchmarks publicados: la model card mantiene la tabla de resultados con marcadores `TODO`, por lo que el rendimiento declarado no está verificado de forma independiente.
- Riesgo de sesgo: el corpus de entrenamiento no se detalla, de modo que no es posible evaluar sesgos lingüísticos, culturales o de género en las 18 lenguas declaradas.
- Riesgo de alucinación: en tareas de fill-mask el modelo puede producir predicciones plausibles pero incorrectas, especialmente en contextos ambiguos o en lenguas con menor representación en el corpus.
- Cobertura desigual por idioma: aunque se declaran 18 lenguas, la model card no especifica el volumen de datos por idioma, por lo que el rendimiento puede variar significativamente entre ellas.
- Dependencia de `trust_remote_code=True`: la carga requiere ejecutar código del autor, lo que implica revisar el repositorio antes de desplegarlo en entornos de producción.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- Informe técnico pendiente: la referencia al technical report apunta a un enlace `TODO`, por lo que la documentación metodológica completa aún no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Variante de 150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Perfil del autor en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub de FrontiersMind: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/
- Sitio web: https://www.frontiersmind.ai/
- Informe técnico: no disponible (enlace marcado como `TODO` en la model card)
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
