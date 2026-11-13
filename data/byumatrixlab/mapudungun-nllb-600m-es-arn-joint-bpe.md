# byumatrixlab/mapudungun-nllb-600M-es-arn-joint-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-es-arn-joint-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el marco de un trabajo académico presentado en el taller AmericasNLP 2026, y su aportación principal es el uso de una tokenización BPE conjunta (joint BPE) sobre ambos idiomas para manejar mejor la morfología aglutinante del mapudungun.

El modelo resuelve un problema clásico de las lenguas de bajos recursos: los tokenizadores entrenados en corpus mayoritarios fragmentan en exceso las palabras mapuche, lo que degrada la calidad de la traducción. La condición "Joint-5K BPE" entrena un vocabulario SentencePiece BPE compartido de 5.000 unidades sobre español y mapudungun, y ajusta el checkpoint NLLB-200 destilado (615 millones de parámetros) sobre el corpus de Duan et al. El resultado reportado es un chrF++ medio a nivel de frase de 38,17 para la dirección español→mapudungun.

Es relevante ahora porque demuestra que técnicas de tokenización morfológicamente conscientes pueden aplicarse a modelos multilingües ya existentes sin reentrenar desde cero, y porque publica el checkpoint junto con el pipeline de inferencia y las estadísticas del paper, algo poco habitual en traducción de lenguas indígenas. La licencia, sin embargo, es restrictiva: hereda las obligaciones CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus, por lo que el uso comercial queda excluido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200 distilled) |
| Parámetros totales | 615.072.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (NLLB-200 base soporta 512 tokens, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | `other` (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 (NLLB-200) + CC BY-NC-SA 3.0 (corpus Duan et al.) |
| Formato de pesos | safetensors |
| Dirección de traducción principal | es → arn |
| Tokenizador | SentencePiece BPE conjunto (Joint-5K) |
| Tamaño del repositorio | 2,5 GB |
| Descargas | 13 |
| Fecha de creación | 2026-05-29 |

## Arquitectura y entrenamiento

La arquitectura es la de NLLB-200 distilled, un transformer encoder-decoder de 615 millones de parámetros con atención multi-cabeza estándar y embeddings multilingües. El ajuste fino parte del checkpoint `facebook/nllb-200-distilled-600M` y se especializa en el par español-mapudungun. La innovación técnica declarada es la tokenización: en lugar de reutilizar el vocabulario multilingüe original de NLLB, se entrena un vocabulario SentencePiece BPE conjunto de 5.000 unidades sobre texto de ambos idiomas, lo que reduce la fragmentación de las palabras mapuche y alinea mejor los morfemas entre lenguas.

El entrenamiento se realiza sobre el corpus de Duan et al. de mapudungun, según indica la model card. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal. El pipeline de inferencia incluye un preprocesado específico para mapudungun y la eliminación de marcadores de continuación `@@` en la salida, lo que sugiere que el modelo puede emitir tokens subpalabra que requieren postprocesado.

## Capacidades

- Traducción automática español → mapudungun (dirección principal documentada).
- Manejo mejorado de morfología aglutinante del mapudungun gracias al tokenizador BPE conjunto.
- Preprocesado y postprocesado específicos para mapudungun integrados en el script de inferencia (`inference.py`).
- Compatibilidad con la librería `transformers` 4.x y la clase `m2m_100`/NLLB.
- Capacidad multilingüe residual heredada de NLLB-200, aunque el ajuste fino está orientado al par es-arn.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación oficial y materiales educativos al mapudungun: el modelo permite generar versiones en mapuche de textos administrativos o escolares, con revisión humana posterior, aprovechando el ajuste específico sobre el par es-arn.
- Preservación y digitalización de contenido cultural: traducción de relatos, textos comunitarios y materiales de revitalización lingüística del español al mapudungun, un ámbito donde los traductores automáticos generalistas fallan por falta de cobertura.
- Herramientas de apoyo a traductores humanos: integración como primer borrador en flujos de traducción asistida (CAT), reduciendo el esfuerzo inicial en un par de lenguas sin recursos comerciales.
- Investigación en NLP para lenguas indígenas: uso como línea base reproducible en experimentos de tokenización morfológica, comparando la condición Joint-5K BPE con tokenizadores estándar de NLLB.
- Sistemas de comunicación bilingüe en servicios públicos: prototipos de atención en mapudungun para salud o justicia en zonas con población mapuche, siempre con validación por hablantes nativos.
- Docencia y aprendizaje del mapudungun: generación de ejemplos paralelos es-arn para materiales didácticos, con supervisión lingüística.

## Benchmarks y rendimiento

| Métrica | Dirección | Valor | Fuente |
|---|---|---|---|
| chrF++ medio a nivel de frase | es → arn | 38,17 | `results/paper_stats.json` (paper pipeline corregido) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos de traducción para este par.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo de pesos, más overhead de activaciones; en la práctica unos 4-6 GB.
- En fp16/bf16: alrededor de 1,3 GB de pesos, con un consumo total estimado de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; también puede ejecutarse en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` (requerido, versión 4.x), script `inference.py` del repositorio; compatible con frameworks de serving estándar para modelos encoder-decoder (por ejemplo, TGI o vLLM con soporte NLLB, no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-600M-es-arn-joint-bpe | 615 M | es, arn | no disponible | CC-BY-NC 4.0 + CC BY-NC-SA 3.0 | Ajuste fino NLLB con BPE conjunto |
| facebook/nllb-200-distilled-600M | 615 M | 200 idiomas | 512 tokens (modelo base) | CC-BY-NC 4.0 | Modelo multilingüe generalista |
| Helsinki-NLP/opus-mt-es-arn | no disponible | es, arn | no disponible | no disponible | Modelo OPUS específico del par |
| facebook/m2m100_418M | 418 M | 100 idiomas | 1024 tokens (modelo base) | MIT (según model card original) | Modelo multilingüe generalista |

La comparativa numérica de calidad entre estos modelos para el par es-arn no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial está excluido por la combinación de CC-BY-NC 4.0 (NLLB-200) y CC BY-NC-SA 3.0 (corpus Duan et al.); cualquier uso debe cumplir ambas.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas, especialmente en palabras mapuche poco frecuentes en el corpus de ajuste.
- El modelo está ajustado principalmente para es → arn; el rendimiento en la dirección inversa no está documentado.
- Corpus de entrenamiento limitado (Duan et al.), lo que puede introducir sesgos de dominio y de registro (probablemente textos religiosos o etnográficos).
- El vocabulario BPE de 5.000 unidades es pequeño y puede limitar la cobertura de terminología moderna o técnica.
- Requiere preprocesado y postprocesado específicos (`inference.py`) para un funcionamiento correcto; su uso sin ese pipeline puede degradar la salida.
- Solo 13 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.
- No se documentan evaluaciones de sesgo, robustez ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-joint-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la información disponible).
- Corpus de Duan et al. de mapudungun: no disponible URL directa en la información proporcionada.
