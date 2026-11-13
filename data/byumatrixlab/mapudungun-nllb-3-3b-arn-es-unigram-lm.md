# byumatrixlab/mapudungun-nllb-3.3B-arn-es-unigram-lm

## Resumen

El modelo `mapudungun-nllb-3.3B-arn-es-unigram-lm` es un ajuste fino de NLLB-200 de 3.3B parámetros, desarrollado por byumatrixlab, especializado en traducción automática del mapudungun (código ISO 639-3 `arn`) al español. Se enmarca en el trabajo de investigación de Thompson, Rogers y Ringger presentado en AmericasNLP 2026, centrado en tokenización morfológicamente consciente para lenguas de bajos recursos. El modelo resuelve un problema concreto: la baja calidad de la traducción automática para una lengua indígena de Chile con escasísimos recursos digitales, mediante una condición de tokenización específica (SentencePiece UnigramLM entrenado solo con mapudungungun).

La relevancia actual radica en que la mayoría de los sistemas de traducción neuronales modernos apenas cubren lenguas indígenas americanas, y este checkpoint demuestra que ajustar NLLB-200 con estrategias de tokenización adaptadas mejora de forma medible la calidad. El modelo reporta un chrF++ medio a nivel de frase de 45,07 para la dirección arn→es, una métrica que el paper de referencia asocia a esta condición de tokenización y tamaño.

Arquitectónicamente es un transformer encoder-decoder de tipo M2M-100/NLLB, con 3.344.861.184 parámetros totales y pesos en formato safetensors (13,4 GB de repositorio). La licencia es compuesta (NLLB CC-BY-NC 4.0 más el corpus derivado CC BY-NC-SA 3.0), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other: nllb-and-corpus-derived-terms (NLLB CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-3.3B`, un transformer encoder-decoder denso de 3.3B parámetros de la familia M2M-100, y se ajusta fino para la dirección mapudungun→español. La innovación principal no reside en la arquitectura sino en la tokenización: se emplea una condición de SentencePiece UnigramLM entrenado exclusivamente con texto mapudungun, lo que adapta la segmentación subpalabra a la morfología aglutinante de la lengua y evita que el tokenizador multilingüe original fragmente en exceso las palabras mapudungun.

El ajuste se realiza sobre un corpus derivado del corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0). La model card indica que el checkpoint corresponde a la "época del paper" (*paper-era training checkpoint*) y que las métricas se generan desde el fichero `results/paper_stats.json` del repositorio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones de decodificación (especulativa, atención lineal, etc.). El helper de inferencia aplica un preprocesado específico para mapudungun y elimina los marcadores de continuación `@@` de la salida en esa lengua.

## Capacidades

- Traducción automática unidireccional mapudungun→español (la model card especifica esta dirección; no se documenta es→arn).
- Tokenización adaptada a la morfología del mapudungun mediante UnigramLM específico de la lengua.
- Preprocesado y postprocesado específicos para mapudungun incluidos en el script de inferencia (`inference.py`).
- Requiere Transformers 4.x para su carga y ejecución.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada a los dos idiomas declarados (arn, es); no se documenta transferencia a otras lenguas.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o administrativos del mapudungun al español para facilitar el acceso a servicios públicos, aprovechando el ajuste específico sobre la variante escrita de la lengua.
- Digitalización y preservación de textos: procesamiento por lotes de corpus escritos en mapudungun (relatos, actas, materiales escolares) para producir versiones en español alineadas, usando el script de inferencia con el preprocesado incluido.
- Investigación en lenguas de bajos recursos: punto de partida reproducible para experimentos de tokenización morfológica, dado que el checkpoint corresponde a la condición UnigramLM del paper y permite comparar con otras condiciones de tokenización.
- Subtitulado y traducción de contenido audiovisual comunitario: traducción de transcripciones en mapudungun a español para difusión en medios locales, con revisión humana dado el tamaño del corpus de entrenamiento.
- Herramientas de apoyo a la docencia bilingüe: integración en aplicaciones que asistan a profesores en contextos de educación intercultural bilingüe, traduciendo glosas y ejercicios del mapudungun al español.
- Evaluación comparativa de sistemas de MT para lenguas indígenas: uso como referencia con métrica chrF++ reportada (45,07) en la dirección arn→es para comparar nuevos modelos o técnicas de tokenización.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase (arn→es) | 45,07 | Condición UnigramLM, tamaño 3.3B, dirección mapudungun→español |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,7 GB solo para pesos, más memoria para activaciones y atención; en la práctica se recomienda al menos 10-12 GB de VRAM para secuencias de longitud moderada.
- En fp32, los pesos ocupan unos 13,4 GB, por lo que se necesitan GPUs con 16 GB o más (A100 40/80 GB, H100, RTX A6000, RTX 4090 de 24 GB).
- Cabe en GPUs de consumo con 12-16 GB en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), con posibles limitaciones de longitud de secuencia.
- Opciones de despliegue: el repositorio proporciona `inference.py` basado en Transformers 4.x; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-arn-es-unigram-lm | 3.344.861.184 | no disponible | arn, es | other (NLLB CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) | Ajuste fino con tokenizador UnigramLM mapudungun; chrF++ 45,07 en arn→es |
| facebook/nllb-200-3.3B | 3.3B | no disponible en esta ficha | 200 idiomas | CC-BY-NC 4.0 | Modelo base multilingüe; sin ajuste específico para mapudungun |
| Otros ajustes de NLLB-200 para lenguas indígenas | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar numéricamente con alternativas específicas de traducción mapudungun-español.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere revisar y cumplir ambas obligaciones, lo que en la práctica lo restringe a fines no comerciales.
- Dirección única documentada: la model card describe el ajuste para mapudungun→español; no se garantiza calidad en español→mapudungun.
- Corpus de entrenamiento pequeño y derivado de una única fuente (Duan et al.), lo que limita la cobertura de variantes dialectales, registros y ortografías del mapudungun.
- Riesgo de alucinación y de traducciones literales en estructuras morfológicas complejas no representadas en el corpus.
- El postprocesado elimina marcadores `@@`, lo que puede alterar segmentaciones legítimas si el texto de entrada ya los contiene.
- Sin datos publicados sobre sesgos, tasas de error por dominio ni evaluación humana; la única métrica es chrF++ automático.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa prácticamente nulo.
- No se documentan longitudes máximas de contexto ni comportamiento con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-arn-es-unigram-lm
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. (2026). "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning". Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). Enlace directo no disponible en la información proporcionada.
- Corpus de Duan et al.: enlace no disponible en la información proporcionada.
