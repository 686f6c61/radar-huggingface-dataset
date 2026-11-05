# drjk16/NLLB-200-Distilled-600M_finetuned_Paragraph-Alligned

## Resumen

NLLB-200-Distilled-600M_finetuned_Paragraph-Alligned es un ajuste fino del modelo de traduccion automatica neuronal facebook/nllb-200-distilled-600M, publicado por el usuario drjk16 en HuggingFace. El modelo parte de la arquitectura m2m_100 (transformer encoder-decoder) de Meta y se ha reentrenado sobre pares de parrafos alineados extraidos de OPUS, lo que lo orienta a traduccion a nivel de documento en lugar de traduccion oracion a oracion.

El ajuste se realizo sobre aproximadamente 25.000 pares de parrafos con una media de 5,6 oraciones por par, segun la model card del autor. El objetivo declarado es aprovechar la longitud de contexto del modelo base para mantener coherencia entre oraciones y producir traducciones de documentos completos. Es un modelo pequeno (615 millones de parametros) pensado para despliegues con recursos limitados.

La relevancia actual es acotada: se trata de un fine-tune de nicho con muy poca traccion (6 descargas, 1 like en el momento de la consulta) y cuya model card no documenta evaluacion cuantitativa ni licencia explicita. Resulta util como referencia para quienes trabajan con traduccion de parrafos alineados en el par de idiomas aleman-ingles, pero no debe considerarse un modelo de produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de inferencia trunca la entrada a 1024 tokens y genera hasta 512 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se sirven en safetensors, admite carga en float16 o float32 segun el ejemplo |
| Idiomas soportados | de, en (etiquetas del repositorio); el modelo base NLLB-200 soporta 200 idiomas, pero el fine-tune se ha realizado sobre el par aleman-ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura m2m_100 del NLLB-200 distilled de Meta: un transformer encoder-decoder con mecanismo de atencion multi-cabeza estandar, disenado originalmente para traduccion multilingue. El checkpoint base tiene 615 millones de parametros y emplea la convencion de codigos de idioma de NLLB-200 (por ejemplo, `eng_Latn`, `deu_Latn`), controlada mediante el token `forced_bos_token_id` en la generacion.

El ajuste fino se realizo sobre texto alineado a nivel de parrafo procedente de OPUS, con unas 25.000 parejas y una media de 5,6 oraciones por parrafo. La model card no especifica el numero total de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en traduccion automatica supervisada). Tampoco se documentan hiperparametros, regimen de entrenamiento ni innovaciones tecnicas adicionales mas alla del propio ajuste a nivel de parrafo. El autor menciona como trabajo futuro un ajuste mas especifico por dominio (industria, investigacion, academia, guias) y una mejor alineacion a nivel de documento.

## Capacidades

- Traduccion automatica de texto entre aleman e ingles a nivel de parrafo y documento.
- Traduccion multioracional con preservacion de fronteras de parrafo (la model card incluye una funcion `translate_batch` que mantiene los limites de cada parrafo).
- Procesamiento por lotes (batch inference) con padding y truncado configurables.
- Uso de la convencion de codigos de idioma NLLB-200, lo que en teoria permite dirigir la generacion a otros idiomas del modelo base, aunque el fine-tune solo se ha entrenado para de-en.
- Generacion con busqueda por haces (`num_beams`) configurable.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica aleman-ingles: el modelo puede procesar parrafos completos de manuales o guias, manteniendo coherencia terminologica dentro de cada bloque gracias al ajuste sobre pares multioracion.
- Localizacion de articulos y blogs: adecuado para traducir entradas de blog o articulos periodisticos por parrafos, con la ventaja de que el contexto de 5,6 oraciones de media permite resolver referencias pronominales dentro del parrafo.
- Traduccion de correspondencia empresarial: correos y comunicaciones formales aleman-ingles que rara vez superan el tamano de parrafo, donde el modelo puede ejecutarse en CPU o GPU de gama baja.
- Pretraduccion en flujos CAT (computer-assisted translation): generar una primera version automatica que el traductor humano post-edite, aprovechando el bajo coste computacional del modelo de 615M.
- Procesamiento por lotes de corpus paralelos: la funcion de batch inference de la model card permite traducir colecciones de parrafos alineados para construir o ampliar memorias de traduccion.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de 615M en safetensors (1,3 GB de repositorio), puede ejecutarse en una unica GPU consumer o incluso en CPU para volumenes moderados.
- Experimentacion academica sobre traduccion a nivel de documento: util como linea base para comparar estrategias de alineacion de parrafos frente al NLLB-200 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni comparaciones cuantitativas con el modelo base u otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 1,3-1,5 GB para los pesos, mas memoria adicional para activaciones y cache de atencion; en la practica, 2-4 GB de VRAM son suficientes para lotes pequenos.
- En float32, los pesos ocupan aproximadamente 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es lo bastante pequeno como para no requerir GPUs de centro de datos.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Hugging Face Transformers (metodo documentado en la model card con `AutoModelForSeq2SeqLM`), y por compatibilidad con m2m_100, tambien es posible exportarlo a ONNX o servirlo con TGI/vLLM si se valida la conversion; no se documenta soporte nativo de llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| drjk16/NLLB-200-Distilled-600M_finetuned_Paragraph-Alligned | 615M | no disponible (entrada truncada a 1024 tokens en el ejemplo) | de, en (fine-tune); 200 en el base | no disponible | Fine-tune sobre 25k pares de parrafos OPUS |
| facebook/nllb-200-distilled-600M | 615M | 1024 tokens | 200 idiomas | CC-BY-NC 4.0 (segun el modelo base de Meta) | Modelo base sin ajuste a nivel de parrafo |
| facebook/m2m100_418M | 418M | 1024 tokens | 100 idiomas | MIT (segun el modelo original de Meta) | Alternativa mas ligera, sin ajuste de parrafo |
| Helsinki-NLP/opus-mt-de-en | ~77M | 512 tokens | de, en | CC-BY 4.0 (segun el modelo original) | Modelo especializado mucho mas pequeno, solo oracion |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para el modelo de drjk16 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo se ha ajustado para el par aleman-ingles; el uso con otros codigos de idioma del vocabulario NLLB-200 no esta validado y probablemente produzca resultados deficientes.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si se permite uso comercial. El modelo base de Meta (NLLB-200) se distribuye bajo CC-BY-NC 4.0, lo que en la practica restringe el uso comercial salvo autorizacion expresa.
- No hay evaluacion cuantitativa publicada: no se puede afirmar que el fine-tune supere al modelo base en calidad de traduccion.
- Riesgo de alucinacion y de omision de contenido en parrafos largos, especialmente si se supera la longitud de contexto efectiva.
- El corpus de entrenamiento (25k pares de OPUS) es reducido y puede no cubrir dominios especializados (legal, medico, tecnico).
- El modelo no dispone de mecanismos de seguridad, filtrado ni moderacion de contenido.
- Traccion muy baja (6 descargas, 1 like) y sin mantenimiento documentado mas alla de la actualizacion del repositorio; no hay garantias de soporte.
- El ejemplo de inferencia de la model card usa `hin_Deva` como idioma destino, lo que puede inducir a error sobre los idiomas realmente soportados por el fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drjk16/NLLB-200-Distilled-600M_finetuned_Paragraph-Alligned
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Documentacion de NLLB en Transformers: https://huggingface.co/docs/transformers/model_doc/nllb
- Corpus OPUS: https://opus.nlpl.eu/
