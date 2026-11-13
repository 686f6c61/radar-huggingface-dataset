# byumatrixlab/mapudungun-nllb-3.3B-es-arn-joint-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-3.3B-es-arn-joint-bpe` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, centrado en tokenización consciente de la morfología para lenguas de bajos recursos.

El modelo parte de la arquitectura m2m_100 de NLLB-200 (transformer encoder-decoder de 3.344.861.184 parámetros) y aplica un ajuste fino sobre un corpus derivado del corpus de Duan et al., empleando una condición de tokenización BPE conjunta mapudungun-español ("Joint-5K BPE"). El checkpoint corresponde a una variante archivada de la era del paper y reporta un chrF++ medio a nivel de frase de 42,30 para esta condición, tamaño y dirección (es→arn).

Su relevancia radica en que aborda un par lingüístico prácticamente ausente en los sistemas de traducción comerciales, y lo hace reutilizando un modelo multilingüe consolidado con una estrategia de tokenización adaptada a la morfología aglutinante del mapudungun. La licencia es restrictiva (derivada de NLLB-200 y del corpus), lo que condiciona su uso a investigación y escenarios no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other (nllb-and-corpus-derived-terms; base CC-BY-NC 4.0, corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `facebook/nllb-200-3.3B`, que emplea la arquitectura m2m_100: un transformer encoder-decoder denso con 3.344.861.184 parámetros, diseñado originalmente para traducción multilingüe a gran escala. Sobre esta base se aplica un fine-tuning específico para la dirección español→mapudungun, con un preprocesamiento propio del mapudungun y una condición de tokenización BPE conjunta (Joint-5K BPE) que combina vocabulario mapudungun y español en un SentencePiece BPE compartido.

El objetivo declarado del trabajo es incorporar el mapudungun al ecosistema moderno de traducción automática mediante tokenización consciente de la morfología, dado el carácter aglutinante de la lengua. El corpus de ajuste deriva del corpus de Duan et al. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones de inferencia como decodificación especulativa. El checkpoint se describe como "paper-era archived checkpoint".

## Capacidades

- Traducción automática unidireccional español→mapudungun (pipeline `translation`).
- Preprocesamiento específico del mapudungun aplicado por el script auxiliar `inference.py`.
- Eliminación de marcadores de continuación `@@` en la salida mapudungun.
- Tokenización BPE conjunta mapudungun-español orientada a la morfología de la lengua.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento.
- Capacidad multilingüe limitada a los dos idiomas declarados (`arn`, `es`); no se garantiza comportamiento en otros pares de NLLB-200.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o administrativos del español al mapudungun para comunidades mapuche, aprovechando el ajuste específico sobre el par es→arn.
- Preservación lingüística digital: generación de versiones en mapudungun de textos existentes en español para alimentar corpus y archivos lingüísticos, con revisión humana posterior.
- Investigación en traducción de bajos recursos: uso como línea base reproducible (chrF++ 42,30) para experimentos sobre tokenización morfológica en lenguas indígenas.
- Apoyo a la docencia bilingüe: borradores de traducción de materiales didácticos español-mapudungun que un hablante nativo revisa y corrige.
- Localización de interfaces y contenidos web: traducción de cadenas cortas y textos de UI al mapudungun, con el preprocesamiento adecuado del modelo.
- Estudios de morfología computacional: análisis de cómo una tokenización BPE conjunta afecta a la segmentación de palabras aglutinantes en la salida del modelo.
- Evaluación comparativa de estrategias de tokenización: contraste de esta condición "Joint-5K BPE" frente a otras variantes del mismo paper sobre el mismo corpus.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (frase, media) | 42,30 | es→arn, Joint-5K BPE, tamaño 3.3B |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas frente a otros sistemas en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 7 GB solo para pesos (3.344.861.184 parámetros × 2 bytes), más overhead de activaciones y tokenizador; el repo ocupa 13,4 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue de producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB en fp16; en cuantización de 8 bits podría ajustarse a 12-16 GB, aunque el autor no documenta cuantizaciones oficiales.
- Opciones de despliegue: el autor proporciona `inference.py` con Transformers 4.x; para serving se puede usar vLLM o TGI si soportan la arquitectura m2m_100, así como llama.cpp/Ollama solo si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-joint-bpe | 3.344.861.184 | no disponible | arn, es | other (NC) | chrF++ 42,30 es→arn |
| facebook/nllb-200-3.3B (base) | 3.344.861.184 | no disponible | 200 idiomas | CC-BY-NC 4.0 | Sin ajuste específico a mapudungun |
| facebook/nllb-200-distilled-600M | ~600 M | no disponible | 200 idiomas | CC-BY-NC 4.0 | Alternativa ligera, menor calidad esperada en lenguas de bajos recursos |
| m2m100_418M | ~418 M | no disponible | 100 idiomas | MIT | No incluye mapudungun de forma fiable |

No se dispone de comparativas numéricas frente a otros sistemas específicos de mapudungun en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la base NLLB-200 es CC-BY-NC 4.0 y el corpus derivado de Duan et al. es CC BY-NC-SA 3.0; el uso comercial queda excluido y deben respetarse ambas condiciones (incluida la cláusula share-alike del corpus).
- Modelo unidireccional: solo se documenta español→mapudungun; no se garantiza la dirección inversa.
- Corpus de ajuste limitado: al derivar de un único corpus de bajos recursos, el modelo puede sobrerrepresentar dominios y estilos presentes en él y generalizar mal fuera de ellos.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas, especialmente en terminología técnica o neologismos ausentes del corpus.
- Contexto máximo no documentado; no se recomienda asumir ventanas largas sin verificación empírica.
- Requiere Transformers 4.x y el script `inference.py` del autor para aplicar el preprocesamiento y limpiar los marcadores `@@`; un uso directo con `pipeline` puede dar salidas con artefactos.
- Solo 14 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido, sin evidencia de uso en producción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus limitado puede reflejar sesgos de las fuentes originales.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-joint-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper de referencia (citado en la model card): Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL disponible en la información proporcionada).
- Corpus de Duan et al.: no disponible el enlace en la información proporcionada.
