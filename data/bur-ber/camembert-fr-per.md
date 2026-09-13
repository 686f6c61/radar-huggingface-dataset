# Bur-ber/camembert-fr-per

## Resumen

Bur-ber/camembert-fr-per es un modelo publicado en HuggingFace por el usuario Bur-ber, cuyo identificador y etiquetas lo vinculan a la familia CamemBERT (se etiqueta explícitamente como `camembert`). Cuenta con 110.032.898 parámetros en formato safetensors, una cifra que coincide con la configuracion base de CamemBERT, y el repositorio ocupa aproximadamente 0,4 GB. El modelo fue creado y actualizado el 13 de septiembre de 2026 y acumula 12 descargas y 0 likes en el momento de redactar esta ficha.

La relevancia de este tipo de modelos radica en que CamemBERT es un encoder bidireccional de tipo transformer (arquitectura derivada de RoBERTa) entrenado originalmente sobre corpus en frances. A diferencia de los modelos generativos decoder-only, este tipo de encoder se orienta a tareas de comprension del lenguaje: clasificacion de texto, reconocimiento de entidades nombradas, analisis de sentimiento, respuesta a preguntas extractiva y generacion de embeddings. El sufijo `fr-per` del nombre sugiere un ajuste fino orientado a algun dominio o tarea especifica (posiblemente personas o entidades), pero la informacion disponible no confirma su proposito exacto.

El principal caveat es que la model card publicada no incluye pipeline, licencia, idiomas soportados ni detalles de entrenamiento, por lo que gran parte de las especificaciones que siguen se basan en las convenciones de la familia CamemBERT y no en metadatos verificados de este repositorio concreto. Se recomienda validar el modelo antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional encoder-only (familia CamemBERT / RoBERTa) |
| Parametros totales | 110.032.898 (aproximadamente 110 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en los metadatos; CamemBERT base usa 512 tokens |
| Tipos de cuantizacion | no disponibles; el repositorio incluye pesos en safetensors |
| Idiomas soportados | no disponible en los metadatos; la etiqueta `camembert` apunta a frances |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-13 |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

La etiqueta `camembert` y el recuento de parametros (110 M) apuntan a una arquitectura CamemBERT base. CamemBERT es un transformer encoder-only de tipo RoBERTa, con atencion bidireccional, mecanismo de masked language modeling (MLM) como objetivo de preentrenamiento y normalizacion por capas. La serie base emplea 12 capas, 12 cabezas de atencion y una dimension oculta de 768, con un vocabulario SentencePiece adaptado al frances. No se dispone de informacion verificada sobre si este repositorio concreto es un preentrenamiento desde cero, un ajuste fino supervisado o una adaptacion de dominio.

No hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset, la aplicacion de RLHF o DPO, ni sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta la existencia de una cabeza de clasificacion concreta, por lo que no puede confirmarse si el modelo esta pensado para inferencia con `AutoModel`, para extraccion de embeddings o para una tarea supervisada especifica. Cualquier afirmacion sobre el proceso de ajuste fino seria especulativa.

## Capacidades

- Representacion contextual de texto en frances (encoder bidireccional), adecuada como extractor de caracteristicas.
- Generacion de embeddings de frase a nivel de token y, con pooling, a nivel de secuencia.
- Clasificacion de texto (sentimiento, topicos, spam, intencion) tras anadir una cabeza de clasificacion.
- Reconocimiento de entidades nombradas (NER), coherente con el sufijo `per` del nombre.
- Respuesta a preguntas extractiva sobre pares contexto-pregunta.
- Similitud semantica y recuperacion mediante embeddings.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo ni un modelo de instrucciones).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles; la etiqueta apunta a un uso en frances.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de entidades en documentos franceses: el modelo puede procesarse con una cabeza de token classification para detectar personas, organizaciones y lugares, tarea coherente con la denominacion `per` del repositorio.
- Analisis de sentimiento en resenas y redes sociales en frances: usando el encoder como base y una capa de clasificacion, permite categorizar opiniones a escala.
- Clasificacion de tickets de soporte: al ser un encoder ligero de 110 M de parametros, puede desplegarse en CPU o GPU modesta para enrutar incidencias por categoria o intencion.
- Busqueda semantica y recuperacion de documentos (RAG): los embeddings generados permiten indexar y comparar pasajes de un corpus frances en un motor vectorial.
- Moderacion de contenido en plataformas francoparlantes: clasificacion rapida de textos potencialmente toxicos o spam con latencia baja.
- Etiquetado y enriquecimiento de corpus para investigacion: uso como modelo auxiliar para anotar automaticamente datos y acelerar anotaciones manuales.
- Deteccion de duplicados y similitud de documentos: comparacion de embeddings para agrupar textos casi identicos en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 0,44 GB solo para pesos (110 M x 4 bytes), mas memoria para activaciones y optimizador si se entrena.
- VRAM en fp16: alrededor de 0,22 GB de pesos.
- VRAM en int8: aproximadamente 0,11 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, T4, etc.); tambien tarjetas de gama alta como A100 o H100, aunque resultan sobredimensionadas para esta carga.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch/Transformers, ONNX Runtime, TorchScript, y servidores de inferencia para modelos encoder como HuggingFace TGI con encoder o FastAPI propio. No es compatible con el uso tipico de vLLM/llama.cpp orientado a modelos generativos, salvo conversion a GGUF si se confirma esa necesidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bur-ber/camembert-fr-per | 110 M | no disponible (base CamemBERT: 512) | Encoder transformer | no disponible | HuggingFace |
| CamemBERT base (INRIA / FAIR) | 110 M | 512 | Encoder transformer | MIT | HuggingFace |
| FlauBERT base | 138 M | 512 | Encoder transformer | MIT | HuggingFace |
| XLM-RoBERTa base | 278 M | 512 | Encoder transformer multilingue | MIT | HuggingFace |

Comparativa de rendimiento: no disponible en la informacion proporcionada. No se puede confirmar si este repositorio mejora o iguala a los modelos de referencia anteriores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Si el modelo deriva de CamemBERT, heredara los sesgos presentes en el corpus frances sobre el que se entreno la base.
- Riesgo de alucinacion: no aplica en el mismo sentido que en modelos generativos, pero si puede producir clasificaciones o etiquetas incorrectas con alta confianza.
- Limitaciones de contexto o idioma: no se documenta el idioma ni la longitud de contexto; la etiqueta implica uso en frances y probablemente 512 tokens de maximo, limitando documentos largos.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no puede asumirse uso comercial sin verificacion previa con el autor.
- Ausencia de model card detallada: sin pipeline, dataset ni condiciones de entrenamiento documentadas, la trazabilidad es practicamente nula.
- Traccion minima: 12 descargas y 0 likes reducen la probabilidad de que el modelo haya sido validado por terceros.
- Fecha de creacion inusual (2026): conviene verificar la autenticidad y estabilidad del repositorio antes de integrarlo en produccion.
- No es un modelo generativo ni de instrucciones: no debe esperarse capacidad de chat, tool calling ni generacion de texto libre.

## Enlaces

- HuggingFace: https://huggingface.co/Bur-ber/camembert-fr-per
- CamemBERT (modelo de referencia INRIA/FAIR): https://huggingface.co/almanach/camembert-base
- FlauBERT (modelo comparable en frances): https://huggingface.co/flaubert/flaubert_base_cased
- XLM-RoBERTa base (alternativa multilingue): https://huggingface.co/FacebookAI/xlm-roberta-base
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a dominios no relacionados (but.fr, ericbur.fr, cotizaciones bursatiles de Burelle y la entrada de Wikipedia sobre el toponimo Bur).
