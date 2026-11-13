# byumatrixlab/mapudungun-nllb-600M-es-arn-standard-bpe

## Resumen

El modelo `mapudungun-nllb-600M-es-arn-standard-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción del español (es) al mapudungun (arn), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, centrado en el impacto de la tokenización morfológica en el rendimiento de NLLB-200 sobre lenguas de bajos recursos.

Con 615 millones de parámetros, el modelo parte de la arquitectura M2M-100 de NLLB y conserva el tokenizador SentencePiece original de NLLB-200 sin presegmentación externa; esta es precisamente la condición "standard BPE" que el paper compara frente a alternativas de tokenización morfológica. El checkpoint es el archivado de la era del paper y reporta un chrF++ medio a nivel de oración de 39,87 para esta condición y dirección.

Su relevancia radica en dos factores: por un lado, aborda una dirección de traducción (es→arn) prácticamente desatendida por los sistemas comerciales; por otro, sirve como referencia reproducible para investigar cómo la tokenización afecta a lenguas aglutinantes y polisintéticas como el mapudungun. El modelo está pensado para investigación y evaluación, no para despliegue comercial, dado que hereda las restricciones no comerciales de NLLB-200 y del corpus de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200 distilled) |
| Parametros totales | 615.072.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (NLLB-200 soporta hasta 512 tokens por segmento; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | arn (mapudungun), es (español); dirección entrenada: es→arn |
| Licencia | other (`nllb-and-corpus-derived-terms`): base CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 2,5 GB |
| Modelo base | facebook/nllb-200-distilled-600M |
| Pipeline | translation |
| Tokenizador | SentencePiece de NLLB-200 sin presegmentación externa (condición "standard BPE") |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint destilado de NLLB-200 de 600M, que emplea la arquitectura M2M-100: un transformer encoder-decoder con atención multi-cabeza estándar y embeddings multilingües compartidos. No se trata de un modelo MoE ni de una arquitectura híbrida; es un transformer denso convencional. La innovación del trabajo no reside en la arquitectura, sino en el estudio sistemático de la tokenización: esta variante concreta mantiene el tokenizador SentencePiece nativo de NLLB-200 sin presegmentación morfológica externa, y se compara en el paper con condiciones alternativas de tokenización orientadas a la morfología del mapudungun.

El ajuste se realiza sobre un corpus derivado del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; indica únicamente que el checkpoint es el archivado de la era del paper y que el pipeline de inferencia aplica un preprocesado específico de mapudungun y elimina los marcadores de continuación `@@` de la salida. El rendimiento reportado (chrF++ medio de 39,87 a nivel de oración) proviene del pipeline corregido descrito en el paper.

## Capacidades

- Traducción automática unidireccional español → mapudungun (es→arn).
- Manejo de texto en mapudungun con morfología aglutinante, gracias al preprocesado específico incluido en el script de inferencia.
- Eliminación automática de marcadores de subpalabra `@@` en la salida mapudungun, lo que facilita la integración en pipelines de texto plano.
- Compatibilidad con la API de `transformers` 4.x y con el pipeline `translation`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a los dos idiomas declarados (arn, es); no se garantiza un comportamiento correcto en otras direcciones de NLLB-200 tras el ajuste.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o legales del español al mapudungun para comunidades mapuche, usando el modelo con el preprocesado incluido para preservar la morfología de la lengua de destino.
- Investigación en tokenización para lenguas de bajos recursos: servir como condición de referencia ("standard BPE") en experimentos que comparen tokenizadores morfológicos frente al tokenizador nativo de NLLB-200 sobre lenguas aglutinantes.
- Evaluación reproducible de MT de bajos recursos: el checkpoint archivado y el chrF++ reportado permiten reproducir resultados del paper y establecer una línea base para futuros trabajos en es→arn.
- Preservación digital de la lengua: generación de corpus paralelos es-arn a partir de textos en español para alimentar diccionarios, memorias de traducción y recursos lingüísticos abiertos.
- Prototipado de asistentes de traducción para ONG y organismos públicos: el tamaño de 600M permite ejecutar el modelo en una GPU de gama media para demos interactivas de traducción es→arn.
- Análisis lingüístico asistido: traducción de frases de prueba para estudiar fenómenos morfológicos del mapudungun y comparar con las salidas de sistemas comerciales, que habitualmente no cubren esta lengua.

## Benchmarks y rendimiento

| Metrica | Condicion | Valor |
|---|---|---|
| chrF++ medio a nivel de oracion | standard BPE, 600M, es→arn | 39,87 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros sistemas es→arn. El único dato de rendimiento documentado es el chrF++ del paper para esta condición, tamaño y dirección.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB de pesos más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,3-1,5 GB de pesos; en torno a 2-3 GB con overhead.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.).
- GPU recomendadas para producción o evaluación a gran escala: A100, H100 o L4 para throughput alto; RTX 4090 para experimentación.
- Opciones de despliegue: `transformers` 4.x (requerido por el autor), script `inference.py` del repositorio; no se documenta compatibilidad explícita con vLLM, TGI, llama.cpp u Ollama, aunque al ser un modelo NLLB estándar en safetensors debería poder servirse con frameworks que soporten M2M-100.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-standard-bpe | 615M | no disponible | es→arn | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 20 descargas |
| facebook/nllb-200-distilled-600M | 615M | 512 tokens (NLLB-200) | multilingue (200 idiomas, incluido arn) | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| NLLB-200 1.3B / 3.3B | 1,3B / 3,3B | 512 tokens | multilingue | CC-BY-NC 4.0 | Hugging Face |

Frente al NLLB-200 distilled base, este modelo incorpora ajuste específico es→arn y preprocesado de mapudungun, pero no se dispone de cifras comparativas de chrF++ para el base en la información proporcionada. No se conocen en la información disponible otros modelos públicos especializados en es→arn con los que comparar directamente.

## Limitaciones y advertencias

- Licencia no comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere evaluar y cumplir ambas obligaciones, lo que en la práctica lo restringe a investigación y usos no comerciales.
- Dirección única: entrenado para es→arn; no se garantiza calidad en arn→es ni en otras direcciones del NLLB-200 original.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas en el mapudungun, especialmente en terminología especializada o neologismos.
- Corpus de entrenamiento de bajos recursos: el rendimiento puede degradarse en dominios alejados del corpus de Duan et al. y en variedades dialectales del mapudungun.
- Dependencia del preprocesado: omitir el preprocesado específico o no eliminar los marcadores `@@` puede degradar la salida y complicar su uso directo.
- Requiere `transformers` 4.x; no se documenta compatibilidad con versiones anteriores ni con otros formatos de pesos.
- Sin datos publicados sobre sesgos específicos, longitud de contexto efectiva ni comportamiento fuera de los dos idiomas declarados.
- Modelo de investigación con 20 descargas y sin "likes": no hay evidencia de uso en producción ni de validación externa más allá del paper.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-standard-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia (cita en la model card): Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la información disponible)
- Corpus de Duan et al. de mapudungun: no disponible URL en la información proporcionada
- Script de inferencia: `inference.py` incluido en el repositorio del modelo
