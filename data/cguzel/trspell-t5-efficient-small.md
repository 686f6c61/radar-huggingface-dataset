# cguzel/trspell-t5-efficient-small

## Resumen

trspell-t5-efficient-small es un modelo T5-efficient de tipo encoder-decoder afinado para la corrección ortográfica del turco. Lo desarrolla Ceren Güzel Turhan (usuario `cguzel` en Hugging Face) y parte del modelo preentrenado `Turkish-NLP/t5-efficient-small-turkish`. Su tarea es seq2seq: recibe una frase con errores ortográficos y devuelve la frase corregida. Es el modelo que obtiene mejores resultados en el artículo *Leveraging Large Language Models for Spelling Correction in Turkish* (PeerJ Computer Science, 2025), concretamente en el escenario de ruido realista.

El modelo resuelve un problema concreto y acotado: la normalización ortográfica de texto turco generado por usuarios, con errores de borrado, inserción, transposición, sustitución, vocales incorrectas, faltas comunes y palabras partidas. Con 142,3 millones de parámetros y una ventana de 256 tokens, está pensado para integrarse en pipelines de preprocesado de texto en turco más que como modelo generativo de propósito general.

Su relevancia actual radica en que supera a alternativas clásicas como JamSpell o Zemberek y a modelos multilingües como XLM-RoBERTa-base en el conjunto de prueba con ruido realista, manteniendo un tamaño reducido y una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-efficient), 32 capas de encoder y 6 de decoder, d_model 512 |
| Parametros totales | 142.322.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado en entrada y generación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un T5-efficient con arquitectura encoder-decoder asimétrica: 32 capas en el encoder y solo 6 en el decoder, con dimensión de modelo 512. Usa un tokenizador SentencePiece específico de turco con vocabulario de 32.000 tokens que cubre todas las letras turcas (ı, ğ, ş, ç, ö, ü, İ). La tarea es de secuencia a secuencia sin prefijo de tarea: la entrada es una frase ruidosa y la salida es la frase limpia.

El ajuste fino se realizó sobre el split de entrenamiento de NoisyWikiTr, formado por 687.000 frases de Wikipedia en turco con aproximadamente el 10 % de los tokens corrompidos mediante borrado, inserción, transposición, sustitución, errores de vocal, faltas comunes y divisiones de palabra. La validación usó el split de validación de NoisyWikiTr (85.000 frases). No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste supervisado clásico sobre pares ruidoso-limpio.

## Capacidades

- Corrección ortográfica de frases en turco: corrige borrados, inserciones, transposiciones, sustituciones, errores de vocal, faltas comunes y palabras partidas.
- Generación seq2seq con decodificación por haz (beam search, `num_beams=5` en el ejemplo de uso).
- Normalización de entrada: el modelo espera texto en minúsculas con reglas turcas (I → ı, İ → i), sin dígitos, puntuación ni apóstrofos.
- Manejo del alfabeto turco completo gracias al vocabulario SentencePiece de 32k.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo multilingüe: está entrenado y evaluado únicamente en turco.
- No corrige gramática, solo ortografía.

## Casos de uso

- Preprocesado de texto de usuario en turco: antes de indexar o analizar comentarios, reseñas o publicaciones, el modelo normaliza la ortografía para reducir la dispersión de vocabulario y mejorar la calidad de los embeddings posteriores.
- Limpieza de corpus para entrenamiento: al preparar datasets en turco provenientes de redes sociales o foros, se puede pasar cada frase por el modelo para eliminar ruido ortográfico antes de alimentar un modelo mayor.
- Búsqueda y recuperación de información: normalizar las consultas de los usuarios en turco permite que un motor de búsqueda encuentre documentos aunque la consulta contenga erratas, gracias a la alta tasa de corrección en ruido realista (0,8129 de word correction rate).
- Moderación de contenido y clasificación: al reducir variantes ortográficas erróneas a una forma canónica, los clasificadores de toxicidad o spam entrenados sobre texto limpio funcionan mejor sobre entradas ruidosas.
- Sistemas de atención al cliente en turco: como paso previo a un modelo conversacional mayor, se corrige el mensaje del usuario para que el modelo principal reciba texto normalizado y reduzca malentendidos.
- Enriquecimiento de datos para anotación: en proyectos de etiquetado lingüístico, el modelo pre-corrige las frases para que los anotadores trabajen sobre texto limpio, reduciendo el esfuerzo manual.
- Corrección en editores o formularios: integrado como servicio ligero (142M parámetros) que valida y sugiere correcciones ortográficas en tiempo real en aplicaciones turcas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de prueba de NoisyWikiTr (accuracy / word correction rate), según la Tabla 5 del artículo:

| Modelo | Ruido uniforme | Ruido realista |
|---|---|---|
| T5-efficient-TRsmall (este modelo) | 0,7015 / 0,4185 | 0,9688 / 0,8129 |
| FLAN-T5-small | 0,7013 / 0,4192 | 0,7189 / 0,5483 |
| XLM-RoBERTa-base | 0,9286 / 0,4478 | 0,9421 / 0,5003 |
| JamSpell | 0,9606 / 0,8156 | 0,9500 / 0,6735 |
| Zemberek | 0,9173 / 0,6130 | 0,8770 / 0,4740 |

En el conjunto de prueba realista con frases no turcas eliminadas, el modelo alcanza 0,9664 de accuracy, 0,8142 de word correction y 0,9925 de similitud de Levenshtein.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 0,6 GB de pesos, más overhead de activaciones y decodificación por haz; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas de consumo, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (con `AutoModelForSeq2SeqLM`), text-generation-inference (el repo está marcado como compatible con endpoints), y exportación a otros runtimes seq2seq si se convierte el checkpoint. No se documentan pesos GGUF ni plantillas de Ollama o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño (142M parámetros) y beam search de 5, se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ruido realista (acc / WCR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trspell-t5-efficient-small | 142M | 256 tokens | 0,9688 / 0,8129 | MIT | Hugging Face |
| FLAN-T5-small | no disponible en la información | no disponible | 0,7189 / 0,5483 | no disponible en la información | Hugging Face |
| XLM-RoBERTa-base | no disponible en la información | no disponible | 0,9421 / 0,5003 | no disponible en la información | Hugging Face |
| JamSpell | no disponible (corrector estadístico) | no aplica | 0,9500 / 0,6735 | no disponible en la información | Repositorio abierto |
| Zemberek | no disponible (herramienta NLP turca) | no aplica | 0,8770 / 0,4740 | no disponible en la información | Repositorio abierto |

## Limitaciones y advertencias

- Entrenado y evaluado sobre errores sintéticos de NoisyWikiTr; el rendimiento sobre erratas reales de usuarios puede diferir del reportado.
- Los errores de borrado son el tipo más difícil de corregir para el modelo.
- Solo corrige ortografía, no gramática ni estilo.
- Las entradas largas se truncan a 256 tokens; es necesario dividir textos largos en frases.
- Requiere normalización previa de la entrada (minúsculas con reglas turcas, sin dígitos, puntuación ni apóstrofos); si no se aplica, el rendimiento puede degradarse.
- Modelo monolingüe: no debe usarse con texto en otros idiomas.
- Riesgo de alucinación: al ser un modelo generativo seq2seq, puede introducir cambios no deseados en frases ya correctas; conviene validar la salida en producción, especialmente en dominios alejados de Wikipedia.
- Licencia MIT: permite uso comercial y modificación sin restricciones significativas, pero no se documentan garantías ni condiciones adicionales más allá de las de la propia licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cguzel/trspell-t5-efficient-small
- Artículo: https://doi.org/10.7717/peerj-cs.2889
- Código: https://github.com/cgturhan/trspell
- Dataset: https://huggingface.co/datasets/cguzel/NoisyWikiTr
- Modelo base: https://huggingface.co/Turkish-NLP/t5-efficient-small-turkish
