# byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-bpe

## Resumen

El modelo `mapudungun-nllb-3.3B-arn-es-morfessor-bpe` es un ajuste fino del checkpoint multilingüe `facebook/nllb-200-3.3B` orientado a la traducción automática del mapudungun (código ISO `arn`) al español (`es`). Lo desarrolla el grupo byumatrixlab y su aportación principal no es arquitectónica sino de tokenización: aplica segmentación morfológica con Morfessor y, dentro de cada morfema, tokenización SentencePiece BPE, una estrategia pensada para lenguas de bajos recursos y morfológicamente complejas como el mapudungun.

El modelo resuelve un problema concreto: el mapudungun es una lengua indígena de Chile con escasísimos recursos digitales, y los tokenizadores BPE entrenados sobre corpus mayoritarios fragmentan sus palabras de forma ineficiente, degradando la calidad de la traducción. Al segmentar primero por morfemas, el modelo reduce la dispersión del vocabulario y aprovecha mejor el conocimiento multilingüe heredado de NLLB-200.

Con 3.344.861.184 parámetros y un repositorio de 13,4 GB en safetensors, se distribuye como checkpoint de traducción de un solo par de idiomas (arn→es), sin soporte declarado para la dirección inversa ni para otras lenguas. Su relevancia radica en que documenta una metodología reproducible (tokenización consciente de la morfología) aplicada a un caso real de lengua de bajos recursos, con una métrica declarada de chrF++ de 45,56 a nivel de frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (NLLB-200 usa posiciones sinusoidales; la model card no declara longitud) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | arn (mapudungun), es (español); dirección entrenada: arn→es |
| Licencia | other (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus |
| Formato de pesos | safetensors |
| Pipeline | translation |
| Modelo base | facebook/nllb-200-3.3B |
| Tokenizacion | Morfessor + SentencePiece BPE intra-morfema |
| Métrica declarada | chrF++ medio a nivel de frase: 45,56 |

## Arquitectura y entrenamiento

La arquitectura es la de NLLB-200: un transformer encoder-decoder con 3.300 millones de parámetros, atención estándar y embeddings multilingües compartidos. El ajuste fino no modifica la topología del modelo base; lo que cambia es el preprocesado y el tokenizador: las palabras en mapudungun se segmentan primero con Morfessor en morfemas y después se aplica SentencePiece BPE dentro de cada morfema, de modo que las unidades subpalabra respetan las fronteras morfológicas de la lengua. El helper de inferencia elimina además los marcadores de continuación `@@` de la salida en mapudungun.

El entrenamiento parte del checkpoint `facebook/nllb-200-3.3B` y se ajusta sobre el corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco declara hiperparámetros. El checkpoint publicado se describe como «paper-era training checkpoint», es decir, el usado para generar los resultados del artículo asociado (Thompson, Rogers y Ringger, AmericasNLP 2026), y la card indica que las cifras provienen del fichero `results/paper_stats.json` del repositorio.

## Capacidades

- Traducción automática de mapudungun a español, en la dirección arn→es exclusivamente.
- Preprocesado específico de mapudungun mediante segmentación Morfessor más BPE intra-morfema, con eliminación de marcadores `@@` en la salida.
- Manejo de morfología aglutinante y de palabras largas derivadas, que es el punto fuerte del enfoque.
- Traducción a nivel de frase; no se documenta traducción de documentos largos ni de conversation.
- No dispone de tool calling ni function calling: es un modelo de traducción, no un modelo de instrucciones.
- No soporta agentes, razonamiento multi-paso ni modo de pensamiento.
- Capacidades multilingües limitadas al par arn/es entrenado; no se garantiza el resto de los 200 idiomas de NLLB.
- No se declaran capacidades de visión, audio ni transcripción.

## Casos de uso

- Traducción de documentación comunitaria: traducción de textos de organizaciones mapuches al español para difusión administrativa, aprovechando el ajuste específico al par arn→es.
- Subtitulado y transcripción de material oral transcrito: traducción al español de transcripciones de entrevistas o relatos en mapudungun para archivos etnográficos.
- Digitalización de patrimonio lingüístico: conversión a español de textos escolares o material didáctico bilingüe, donde el tratamiento morfológico reduce los errores en palabras derivadas.
- Investigación en lenguas de bajos recursos: uso como línea base reproducible para comparar estrategias de tokenización (BPE estándar frente a Morfessor+BPE) en mapudungun.
- Herramientas de apoyo a la docencia: traducción asistida de glosas y ejercicios en cursos de mapudungun, siempre con revisión humana dada la naturaleza de la lengua.
- Evaluación de pipelines de NLP para lenguas indígenas: integración en experimentos de AmericasNLP o similares para medir chrF++ y comparar con otros ajustes de NLLB.
- Atención al ciudadano en contextos bilingües: traducción de formularios o comunicaciones breves del mapudungun al español en oficinas públicas, con posting edition humano obligatorio.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es el chrF++ medio a nivel de frase para la condición, tamaño y dirección del modelo:

| Métrica | Condición | Dirección | Valor |
|---|---|---|---|
| chrF++ (medio, nivel de frase) | Morfessor + BPE intra-morfema, 3.3B | arn→es | 45,56 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparativas con otros ajustes del mismo corpus. Tampoco se aportan cifras de BLEU, COMET ni desgloses por subconjunto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 7 GB solo para pesos, más overhead de activaciones y caché; con batch pequeño, un GPU de 12-16 GB es suficiente.
- VRAM en BF16 con `device_map="auto"`: viable en GPUs de 16 GB como RTX 4080 o A4000.
- GPU recomendadas para producción: A100 40/80 GB o H100 para lotes grandes y baja latencia; L4 o A10G para servicio moderado.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 o RTX 4080 con FP16/BF16 y batch reducido.
- Cuantización: la model card no publica versiones cuantizadas; sería necesario generarlas (por ejemplo, con bitsandbytes o GPTQ) para bajar de 8 GB de VRAM.
- Despliegue: transformers 4.x (requisito declarado); vLLM y TGI pueden servir arquitecturas m2m_100, aunque no se documenta soporte verificado para este checkpoint. llama.cpp/Ollama no están indicados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-bpe | 3,34B | no disponible | arn, es (arn→es) | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste específico con tokenización Morfessor+BPE; chrF++ 45,56 |
| facebook/nllb-200-3.3B | 3,34B | no disponible | 200 idiomas | CC-BY-NC 4.0 | Base multilingüe; sin ajuste específico a mapudungun |
| facebook/nllb-200-distilled-600M | 0,6B | no disponible | 200 idiomas | CC-BY-NC 4.0 | Versión destilada, menor calidad pero mucho más ligera |
| m2m100_418M | 0,42B | no disponible | 100 idiomas | MIT | Alternativa multilingüe de menor tamaño y licencia permisiva |

No se dispone de resultados comparativos de chrF++ entre estos modelos en la información proporcionada; la comparación se limita a parámetros, cobertura idiomática y licencia.

## Limitaciones y advertencias

- Solo traduce en la dirección arn→es; no se ha entrenado ni evaluado para es→arn.
- El corpus de ajuste es reducido y de una única fuente (Duan et al.), lo que limita la variedad de registro y dialecto.
- Riesgo de alucinación y de traducciones literales en construcciones morfológicamente ambiguas; se recomienda revisión humana en contextos sensibles.
- Licencia no comercial en origen: el modelo base es CC-BY-NC 4.0 y el corpus CC BY-NC-SA 3.0; el uso comercial requiere evaluación jurídica y, probablemente, acuerdos adicionales.
- La obligación de compartir-alike del corpus (SA) puede afectar a obras derivadas; conviene revisar los términos antes de redistribuir traducciones.
- No hay datos publicados sobre sesgos, dialectos cubiertos ni comportamiento con textos oralizados o con ortografía no normalizada.
- El requisito de transformers 4.x y de un helper de preprocesado específico implica que un uso ingenuo del checkpoint con otro pipeline puede degradar la calidad.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente fuera del artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Artículo asociado: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K. (2026), «Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning», Proceedings of AmericasNLP 2026 (sin URL disponible en la información proporcionada).
- Corpus de Duan et al.: referencia citada en la model card, sin URL disponible en la información proporcionada.
- Repositorio del proyecto: no disponible.
