# byumatrixlab/mapudungun-nllb-600M-es-arn-unigram-lm

## Resumen

El modelo `mapudungun-nllb-600M-es-arn-unigram-lm` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` especializado en traduccion del castellano (`es`) al mapudungun (`arn`), una lengua indigena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab y se enmarca en el trabajo "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", presentado en el taller AmericasNLP 2026.

La contribucion tecnica principal no es la arquitectura, que se mantiene identica al transformer encoder-decoder de NLLB-200 destilado, sino la tokenizacion: el modelo emplea una condicion SentencePiece UnigramLM entrenada exclusivamente sobre mapudungun, lo que permite segmentar mejor una lengua aglutinante y con morfologia compleja. El autor reporta un chrF++ medio a nivel de frase de 38,20 para esta condicion, tamano y direccion.

El modelo tiene 615.072.768 parametros y esta pensado para traduccion de bajos recursos. Su relevancia radica en que aborda un par linguistico practicamente ausente de los sistemas comerciales, con una verificacion de release que reproduce exactamente las 9.382 predicciones de test archivadas del checkpoint original del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, derivado de NLLB-200 destilado) |
| Parametros totales | 615.072.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | arn (mapudungun), es (castellano) |
| Licencia | other, denominada "nllb-and-corpus-derived-terms" (base CC-BY-NC 4.0 y corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder con atencion multi-cabeza estandar y 600M parametros, y se ajusta fino para la direccion castellano a mapudungun. La innovacion declarada es el uso de una condicion de tokenizacion SentencePiece UnigramLM entrenada solo con texto mapudungun, en lugar del vocabulario multilingue original de NLLB, con el objetivo de capturar la morfologia aglutinante de la lengua. El pipeline de inferencia aplica un preprocesado especifico para mapudungun y elimina los marcadores de continuacion `@@` de la salida.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0). El checkpoint publicado se describe como una "reconstructed release run" que reproduce de forma exacta las 9.382 predicciones de test archivadas del checkpoint de la era del paper, lo que da garantias de fidelidad respecto a los resultados publicados.

## Capacidades

- Traduccion automatica unidireccional castellano a mapudungun.
- Preprocesado y postprocesado especificos para mapudungun integrados en el script `inference.py`.
- Manejo de morfologia aglutinante mediante tokenizacion UnigramLM especifica de la lengua.
- Ejecucion con la libreria Transformers 4.x.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada a los dos idiomas del par (`es`, `arn`); no se garantiza comportamiento correcto fuera de esa direccion.

## Casos de uso

- Traduccion de documentacion administrativa al mapudungun: el modelo permite versionar textos oficiales o materiales publicos en lengua indigena, un ambito donde los traductores comerciales no cubren el par.
- Localizacion de materiales educativos: centros escolares y universidades pueden traducir guias y contenidos pedagogicos del castellano al mapudungun con un modelo de 600M desplegable en infraestructura modesta.
- Preservacion y difusion cultural: traduccion de textos historicos, relatos y material etnografico para publicaciones bilingues, aprovechando el ajuste sobre corpus derivado del trabajo de Duan et al.
- Investigacion en traduccion de bajos recursos: sirve como linea base reproducible (9.382 predicciones de test verificadas) para comparar nuevas tecnicas de tokenizacion o ajuste fino en lenguas indigenas.
- Herramientas de asistencia a traductores humanos: integracion como sugerencia inicial en un editor CAT para traductores de mapudungun, reduciendo el esfuerzo de borrador.
- Prototipos de servicios publicos bilingues: chatbots o formularios de atencion ciudadana que ofrezcan version en mapudungun de mensajes en castellano, con revision humana obligatoria por el riesgo de error.
- Evaluacion de morfologia computacional: uso del tokenizador UnigramLM como componente independiente para experimentos de segmentacion morfologica en mapudungun.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (frase, media) | 38,20 | Direccion es→arn, tamano 600M, tokenizacion UnigramLM mapudungun |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros sistemas en la model card. El unico dato cuantitativo reportado es el chrF++ mencionado, extraido de `results/paper_stats.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, mas overhead de activaciones; en la practica se recomienda al menos 4-6 GB.
- En fp16/bf16: alrededor de 1,3 GB de pesos, desplegable en GPUs consumer con 6-8 GB.
- En cuantizacion de 8 bits: en torno a 0,7 GB de pesos; en 4 bits, aproximadamente 0,4 GB (no documentado oficialmente por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o alto throughput, A100 o H100 aportan margen.
- Cabe sin problema en GPU consumer; incluso podria ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: Transformers 4.x con el script `inference.py` proporcionado; tambien es compatible con frameworks estandar para modelos m2m_100 (vLLM, TGI, llama.cpp via conversion a GGUF), aunque el autor no documenta explicitamente estas rutas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-unigram-lm | 615M | no disponible | es, arn | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste fino de NLLB con tokenizacion UnigramLM mapudungun |
| facebook/nllb-200-distilled-600M | 615M | 1024 tokens (documentado por Meta) | 200 idiomas | CC-BY-NC 4.0 | Modelo base multilingue sin ajuste especifico a mapudungun |
| facebook/nllb-200-1.3B | 1,3B | 1024 tokens (documentado por Meta) | 200 idiomas | CC-BY-NC 4.0 | Version mayor del mismo family, sin ajuste a mapudungun |
| Modelos genericos tipo mT5-base | ~580M | 512-1024 tokens | ~100 idiomas | Apache 2.0 | Alternativa multilingue sin cobertura garantizada de arn |

La comparativa se limita a modelos de la misma familia o tamano porque no se dispone de resultados publicados de otros sistemas especificos para es→arn en la informacion proporcionada. El modelo destaca frente al NLLB base por el ajuste especifico y la tokenizacion adaptada; frente a mT5, por la cobertura efectiva del par linguistico.

## Limitaciones y advertencias

- El modelo solo traduce en la direccion castellano a mapudungun; no se documenta calidad en la direccion inversa.
- Licencia restrictiva: la base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0, lo que impide uso comercial sin cumplir ambas condiciones; el autor usa `license: other` para no ocultar ninguna obligacion.
- Riesgo de alucinacion y de traducciones incorrectas en terminologia especializada, dado el bajo volumen de datos disponibles para mapudungun.
- Posibles sesgos derivados del corpus de origen (Duan et al.), cuya composicion y dominio no se detallan.
- Sin datos publicados sobre robustez ante variantes dialectales del mapudungun ni ante registro formal o informal.
- Longitud de contexto no documentada en la model card; conviene validar el comportamiento con frases largas antes de produccion.
- Requiere Transformers 4.x y el preprocesado especifico del repositorio; usar el tokenizador estandar de NLLB daria resultados distintos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa practicamente inexistente.
- No apto para uso clinico, legal o administrativo sin revision humana por parte de hablantes nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia (citado en la model card): Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la informacion disponible).
- Corpus de origen: Duan et al., corpus de mapudungun bajo CC BY-NC-SA 3.0 (sin URL directa en la informacion disponible).
