# byumatrixlab/mapudungun-nllb-600M-arn-es-optuna-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-optuna-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción de mapudungun (código ISO `arn`) a español (`es`). Lo desarrolla el equipo `byumatrixlab` en el contexto de un trabajo académico sobre tokenización morfológicamente consciente para lenguas de bajos recursos, presentado en el taller AmericasNLP 2026. El modelo aborda el problema clásico de las lenguas indígenas americanas: la escasez de corpus paralelos y la fragmentación excesiva de tokens en tokenizadores entrenados para lenguas de altos recursos.

La contribución técnica principal no es el ajuste fino en sí, sino la condición experimental: se sustituye el tokenizador SentencePiece original de NLLB-200 por un vocabulario BPE entrenado exclusivamente sobre texto mapudungun, con el tamaño de vocabulario seleccionado mediante un estudio de Optuna descrito en el paper asociado. El checkpoint tiene 615.072.768 parámetros y se distribuye en formato `safetensors` (repo de 2,5 GB).

Es relevante porque documenta una receta reproducible para mejorar la traducción automática en una lengua con morfología aglutinante y polisintética, y porque publica una métrica concreta (chrF++ a nivel de frase de 42,41 en la dirección arn→es) sobre un pipeline corregido. La licencia es derivada y no comercial, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parámetros totales | 615.072.768 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantización posterior vía herramientas estándar) |
| Idiomas soportados | Mapudungun (`arn`), español (`es`) |
| Licencia | `other` — `nllb-and-corpus-derived-terms` (base CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder denso de la familia NLLB-200 (derivada de M2M-100) con 615 millones de parámetros. El ajuste fino se realiza sobre un corpus paralelo mapudungun-español derivado del corpus de Duan et al., distribuido bajo CC BY-NC-SA 3.0. El checkpoint se describe como "paper-era archived checkpoint", es decir, la versión exacta utilizada para generar los resultados publicados en el paper.

La innovación destacable es la tokenización: en lugar de reutilizar el vocabulario multilingüe de NLLB-200, se entrena un SentencePiece BPE únicamente con texto mapudungun, y el tamaño de vocabulario se elige mediante un estudio de Optuna recogido en el paper. El pipeline de inferencia incluye un preprocesado específico para mapudungun y elimina los marcadores de continuación `@@` de la salida. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el ajuste parece ser supervisado clásico sobre corpus paralelo.

## Capacidades

- Traducción automática unidireccional mapudungun → español (la dirección declarada en el pipeline y en la métrica publicada).
- Manejo de morfología aglutinante y polisintética mapudungun gracias al vocabulario BPE específico, que reduce la fragmentación de tokens frente al tokenizador multilingüe original.
- Preprocesado y postprocesado específicos de la lengua integrados en el script `inference.py` (normalización de entrada y eliminación de marcadores `@@`).
- Generación de texto condicionada por el token de idioma de destino propio de la familia NLLB.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del ajuste (`arn`, `es`); el resto de lenguas del modelo base no se ha validado tras el cambio de tokenizador.
- Requiere Transformers 4.x según la model card.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o administrativos del mapudungun al español para su difusión en contextos urbanos, aprovechando el ajuste específico sobre corpus de la lengua.
- Preservación y digitalización de corpus orales transcritos: conversión de transcripciones en mapudungun a español para indexación y búsqueda en archivos lingüísticos, con la ventaja de que el vocabulario BPE reduce la fragmentación de palabras largas.
- Investigación en tokenización de lenguas de bajos recursos: servir como condición de referencia ("Optuna BPE") para experimentos comparativos sobre estrategias de tokenización en NLLB-200, dado que el checkpoint es el usado en el paper.
- Herramientas de apoyo a traductores comunitarios: generación de borradores de traducción que un hablante nativo revisa, útil por el tamaño reducido (615 M) que permite ejecución en hardware modesto.
- Docencia universitaria de PLN para lenguas indígenas: ejemplo reproducible de ajuste fino de un modelo multilingüe con cambio de tokenizador y búsqueda de hiperparámetros con Optuna.
- Evaluación comparativa de métricas chrF++: banco de pruebas para reproducir el resultado de 42,41 chrF++ a nivel de frase y validar pipelines de evaluación en condiciones de bajos recursos.
- Integración en prototipos de traducción en línea para comunidades mapuche: el tamaño de 615 M permite servir el modelo en una GPU de gama media, aunque la licencia no comercial limita su despliegue público.

## Benchmarks y rendimiento

| Benchmark | Condición | Resultado |
|---|---|---|
| chrF++ (nivel de frase, arn→es) | Optuna BPE, 600M | 42,41 (media, según `results/paper_stats.json`) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros checkpoints del mismo paper. La única métrica reportada es la chrF++ indicada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo de pesos, más overhead de activaciones; en la práctica, entre 4 y 6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB de pesos; entre 2 y 3 GB con overhead.
- VRAM estimada en int8: alrededor de 0,7 GB de pesos; viable en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para throughput alto, A100 o H100 con `vLLM` o `TGI`, aunque el tamaño reducido hace que una RTX 4090 o L4 sea suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más (GTX 1660, RTX 2060, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: `transformers` (requerido 4.x), script `inference.py` del repo, `vLLM` (soporte de la familia NLLB/M2M-100), `TGI` y `llama.cpp` solo si se convierte previamente a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera inferencia interactiva en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `byumatrixlab/mapudungun-nllb-600M-arn-es-optuna-bpe` | 615 M | No disponible | arn, es | `other` (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste con BPE específico de mapudungun; chrF++ 42,41 en arn→es |
| `facebook/nllb-200-distilled-600M` (base) | 615 M | No disponible | 200 lenguas | CC-BY-NC 4.0 | Modelo base multilingüe; tokenizador generalista, menor rendimiento esperado en mapudungun |
| Otros checkpoints del mismo paper (condiciones alternativas) | 615 M | No disponible | arn, es | `other` | No se dispone de sus métricas en la información proporcionada |

No se dispone de datos numéricos de modelos alternativos de traducción mapudungun-español en la información proporcionada; la comparativa se limita al modelo base y a las condiciones del propio paper.

## Limitaciones y advertencias

- Licencia no comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere revisión legal y, en principio, no está permitido sin licencia adicional.
- Obligación de compartir-al-igual (SA) derivada del corpus: las obras derivadas podrían quedar sujetas a CC BY-NC-SA 3.0, lo que afecta a la distribución de modelos ajustados adicionales.
- Dirección limitada: el pipeline y la métrica publicada son arn→es; el rendimiento en es→arn no está validado en la información disponible.
- Corpus de bajos recursos: el volumen del corpus de Duan et al. es limitado, lo que incrementa el riesgo de sobreajuste y de alucinación en dominios no vistos.
- Sesgos: no documentados en la información proporcionada; cabe esperar los sesgos del corpus y del modelo base.
- Contexto: la longitud máxima de contexto no se especifica en la información disponible; conviene no asumir más de lo que soporte NLLB-200 distilled.
- Tokenizador alterado: al reemplazar el vocabulario original, el modelo deja de ser compatible con el resto de lenguas de NLLB-200; no debe usarse como modelo multilingüe general.
- Requiere Transformers 4.x y el preprocesado específico del repo; usar el modelo sin ese pipeline puede degradar la calidad de forma significativa.
- Métrica única: el 42,41 chrF++ es la única cifra publicada; no hay evaluación con BLEU, COMET ni evaluación humana en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-optuna-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la información proporcionada).
- Corpus de Duan et al. (mapudungun): no disponible URL directa en la información proporcionada.
- Repositorio del autor `byumatrixlab`: https://huggingface.co/byumatrixlab
