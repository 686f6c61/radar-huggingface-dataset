# byumatrixlab/mapudungun-nllb-1.3B-arn-es-standard-bpe

## Resumen

El modelo `mapudungun-nllb-1.3B-arn-es-standard-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` de Meta AI, especializado en la traduccion automatica del mapudungun (codigo ISO `arn`) al castellano (`es`). Lo desarrolla el grupo `byumatrixlab` en el contexto del articulo "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning" (Thompson, Rogers y Ringger, AmericasNLP 2026), centrado en estrategias de tokenizacion para lenguas indigenas de bajos recursos.

El modelo aborda un problema clasico de las lenguas de bajos recursos: el desajuste entre la morfologia aglutinante del mapudungun y la tokenizacion SentencePiece nativa de NLLB-200. Esta variante concreta emplea el tokenizador BPE estandar integrado en NLLB-200, sin presegmentacion externa, y sirve como condicion de referencia frente a otras variantes del estudio. Con 1.370.637.312 parametros, es un modelo compacto que puede ejecutarse en hardware modesto.

Su relevancia es doble: por un lado, aporta un recurso funcional para una lengua indigena con pocos sistemas de traduccion disponibles; por otro, forma parte de un conjunto de experimentos reproducibles (checkpoint de reentrenamiento sobre datos originales corregidos) que documentan el efecto de la tokenizacion morfologica en la calidad de traduccion. El pipeline declarado es `translation` y la licencia combina las obligaciones de NLLB-200 (CC-BY-NC 4.0) y del corpus de Duan et al. (CC BY-NC-SA 3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | `other` (`nllb-and-corpus-derived-terms`: CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint distilled de NLLB-200 (1.3B), un transformer encoder-decoder con tokenizador SentencePiece basado en BPE. Este modelo concreto se ha ajustado para la direccion mapudungun a castellano manteniendo el tokenizador nativo de NLLB-200 sin presegmentacion externa del mapudungun; es la condicion "standard BPE" del estudio. El checkpoint procede de un reentrenamiento sobre los datos originales corregidos ("corrected original-data retrain"), lo que indica que se regenero tras depurar el pipeline de datos descrito en el articulo.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion metodologica del trabajo no reside en el modelo en si, sino en el estudio comparativo de esquemas de tokenizacion morfologica para lenguas aglutinantes, del que esta variante es la linea base. El helper `inference.py` del repositorio aplica el preprocesado especifico de la condicion y elimina los marcadores de continuacion `@@` de la salida en mapudungun.

## Capacidades

- Traduccion automatica unidireccional de mapudungun (`arn`) a castellano (`es`).
- Manejo de morfologia aglutinante mediante el tokenizador BPE estandar de NLLB-200, sin presegmentacion externa.
- Limpieza de marcadores de continuacion (`@@`) en la salida mediante el script de inferencia incluido.
- Compatibilidad con la API de `transformers` 4.x y el pipeline `translation`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a los dos idiomas del ajuste; el resto de lenguas de NLLB-200 no se han validado en este checkpoint.

## Casos de uso

- Digitalizacion y traduccion de documentos historicos y etnograficos en mapudungun: el modelo permite convertir textos escritos en mapudungun a castellano para su catalogacion en archivos y bibliotecas, reduciendo el trabajo manual de traduccion.
- Subtitulado y traduccion de material audiovisual comunitario: util para organizaciones mapuche que quieran publicar contenido bilingue, con revision humana posterior dado el caracter de bajos recursos del par.
- Apoyo a la ensenanza bilingue intercultural: generacion de glosas y traducciones de apoyo para materiales didacticos en escuelas con programas de interculturalidad, siempre con validacion por hablantes nativos.
- Investigacion en traduccion automatica de bajos recursos: el checkpoint sirve como linea base reproducible ("standard BPE") para comparar con variantes de tokenizacion morfologica en experimentos academicos.
- Preservacion linguistica y lexicografia: extraccion de correspondencias arn-es a partir de corpus paralelos para alimentar diccionarios y bases terminologicas.
- Traduccion asistida en atencion ciudadana: prototipos de asistencia para oficinas publicas que atiendan a hablantes de mapudungun, con el modelo como primer paso y revision humana obligatoria.
- Evaluacion de pipelines de preprocesado: dado que el repositorio incluye `inference.py` con el preprocesado especifico, sirve para validar replicabilidad de resultados chrF++ en entornos de investigacion.

## Benchmarks y rendimiento

La model card reporta un unico dato agregado para esta condicion, tamano y direccion, procedente de `results/paper_stats.json`:

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (nivel de frase, media) | 45.56 | standard BPE, 1.3B, arn a es |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otras variantes del estudio o con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.7-3 GB solo para pesos, mas overhead de activaciones y cache; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5-2 GB de pesos; en 4 bits, en torno a 0.8-1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 comodo (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Cabe en GPUs consumer de gama media y en GPUs de 16 GB sin problema.
- Despliegue: compatible con `transformers` 4.x (requisito explicito de la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder-decoder de la familia NLLB, la via recomendada por el autor es el script `inference.py` del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-standard-bpe (este) | 1.37B | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 21 descargas |
| facebook/nllb-200-distilled-1.3B (base) | 1.3B | no disponible | 200 lenguas (incluye arn) | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| Otras variantes del estudio (tokenizacion morfologica) | 1.3B | no disponible | arn, es | no disponible | referenciadas en el paper AmericasNLP 2026 |

La comparacion cuantitativa con las variantes morfologicas del mismo estudio no esta disponible en la informacion proporcionada; la model card solo ofrece el chrF++ de esta condicion. Frente al NLLB-200 base, este checkpoint esta especializado y ajustado con datos de mapudungun, pero hereda sus restricciones de licencia no comercial.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere evaluacion legal y, en principio, no esta permitido sin permisos adicionales.
- Obligacion de atribucion y comparticion bajo la misma licencia (SA) derivada del corpus de Duan et al.
- Traduccion unidireccional: solo arn a es; no se ha validado la direccion inversa.
- Par de bajos recursos: riesgo elevado de alucinacion, omisiones y traducciones literales en terminos especializados o de baja frecuencia.
- No se documentan evaluaciones de sesgo; al tratarse de un corpus academico limitado, puede reflejar sesgos de la fuente y de la variedad dialectal representada.
- Longitud de contexto no documentada; se recomienda segmentar entradas largas en frases.
- Requiere revision por hablantes nativos antes de cualquier uso en produccion o en contextos sensibles.
- El script de inferencia depende de `transformers` 4.x y del preprocesado especifico de la condicion; usarlo con otro pipeline puede degradar la calidad y dejar marcadores `@@` sin limpiar.
- Comunidad y soporte minimos: 21 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-standard-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia (cita en la model card): Thompson, I. M., Rogers, B. M. A. y Ringger, E. K., "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026. No se proporciona URL directa en la informacion disponible.
- Corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0): referenciado en la model card sin URL directa en la informacion disponible.
