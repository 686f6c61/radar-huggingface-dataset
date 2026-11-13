# byumatrixlab/mapudungun-nllb-3.3B-es-arn-mono-bpe

## Resumen

El modelo `mapudungun-nllb-3.3B-es-arn-mono-bpe` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática del español al mapudungun (código ISO 639-3 `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el equipo de byumatrixlab (Universidad de Brigham Young, según la autoría del paper asociado) y se enmarca en la línea de trabajo sobre tokenización morfológica para lenguas de bajos recursos presentada en AmericasNLP 2026.

La particularidad técnica del modelo es el uso de una condición de tokenización SentencePiece BPE entrenada exclusivamente sobre mapudungun ("mono BPE"), en lugar de reutilizar el vocabulario multilingüe de NLLB. Según la model card, esta configuración alcanza un chrF++ medio a nivel de frase de 42,02 en la dirección español→mapudungun, un resultado que el paper de referencia reporta como parte de su pipeline corregido.

El checkpoint corresponde a la versión archivada de la era del paper y está pensado únicamente para la dirección es→arn. Con 3.344.861.184 parámetros y un repositorio de 13,4 GB en safetensors, es un modelo de tamaño medio que requiere GPU para inferencia práctica y cuya licencia hereda las restricciones no comerciales de NLLB-200 y del corpus Duan et al.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200), con tokenizador SentencePiece BPE específico de mapudungun |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | arn (mapudungun), es (español); dirección de traducción es→arn |
| Licencia | other (`nllb-and-corpus-derived-terms`): base CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |
| Modelo base | facebook/nllb-200-3.3B |
| Pipeline | translation |
| Tamano del repositorio | 13,4 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint NLLB-200 de 3.3B parámetros, un transformer encoder-decoder denso con atención estándar y vocabulario multilingüe compartido. El ajuste fino se realiza sobre ese backbone pero sustituyendo o condicionando el tokenizador por una variante SentencePiece BPE entrenada solo con texto mapudungun, lo que reduce la fragmentación de morfemas en una lengua aglutinante y de morfología compleja como el mapudungun. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; solo indica que el corpus de ajuste deriva del corpus Mapudungun de Duan et al.

La innovación principal documentada es precisamente esa tokenización morfológica específica de la lengua, que el paper de referencia evalúa como una de las condiciones del pipeline. El checkpoint publicado es el archivado de la era del paper, no un reentrenamiento posterior. El script `inference.py` del repositorio aplica el preprocesado específico de mapudungun y elimina los marcadores de continuación `@@` de la salida, lo que sugiere que el modelo puede emitir subpalabras con ese separador si se usa sin el helper.

## Capacidades

- Traducción automática unidireccional español→mapudungun (`es`→`arn`).
- Manejo de morfología aglutinante mediante tokenización BPE específica de mapudungun.
- Preprocesado y postprocesado integrados en `inference.py` (eliminación de marcadores `@@`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a los dos idiomas del par es→arn; no se documenta traducción inversa arn→es ni a terceras lenguas.
- Requiere Transformers 4.x para su uso.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al mapudungun: el modelo permite versionar comunicados oficiales en `arn` a partir del texto en español, con revisión humana posterior dado el carácter no comercial de la licencia.
- Localización de materiales educativos bilingües: útiles escolares, guías y textos de educación intercultural pueden pre-traducirse automáticamente y refinarse por hablantes nativos, reduciendo el coste de producción.
- Preservación y difusión cultural: traducción de relatos, poemas y textos comunitarios del español al mapudungun como borrador para traductores humanos, aprovechando la tokenización morfológica que preserva mejor los límites de morfema.
- Investigación en NLP de bajos recursos: el checkpoint sirve como línea base reproducible para experimentos de tokenización morfológica y comparación de estrategias BPE en lenguas indígenas americanas.
- Subtitulado y transcripción de contenido audiovisual: traducción de subtítulos en español a mapudungun para vídeos divulgativos o institucionales, con post-edición.
- Sistemas de atención ciudadana en zonas con población mapuche: pre-traducción de formularios y respuestas frecuentes antes de la validación por personal bilingüe.
- Generación de corpus paralelos sintéticos: uso del modelo para producir pares es–arn a escala que alimenten otros entrenamientos, siempre respetando las cláusulas no comerciales de la licencia.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 42,02 | es→arn, condicion mono BPE, tamano 3.3B (paper corregido) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ni comparaciones numéricas con modelos alternativos en la misma dirección.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 7 GB solo para pesos, más overhead de activaciones y del tokenizador; se recomienda un mínimo de 12-16 GB para batches pequeños.
- GPU recomendadas: A100 40/80 GB, H100 para throughput alto; RTX 4090 (24 GB) y A10G (24 GB) suficientes para inferencia en fp16 con batches moderados.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización a 8 bits (no se publican pesos cuantizados en el repo).
- Opciones de despliegue: `transformers` (requerido 4.x) con el `inference.py` del repo; también debería funcionar con TGI o vLLM al ser un encoder-decoder NLLB estándar, aunque no se documenta soporte explícito. No hay GGUF ni pesos para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-mono-bpe (este) | 3,34B | no disponible | other (NC) | Ajuste fino NLLB con BPE específico de mapudungun, es→arn |
| facebook/nllb-200-3.3B (base) | 3,34B | 512 tokens (estándar NLLB) | CC-BY-NC 4.0 | Multilingüe 200 lenguas, sin especialización morfológica |
| NLLB-200-distilled-600M | 600M | 512 tokens | CC-BY-NC 4.0 | Versión destilada, menor calidad pero desplegable en hardware modesto |
| Helsinki-NLP/opus-mt-es-arn | no disponible | no disponible | no disponible | Modelo Marian específico del par, sin datos de rendimiento en la información disponible |

La comparación cuantitativa con estas alternativas en chrF++ para es→arn no está disponible en la información proporcionada; solo se conoce el 42,02 del presente modelo en su condición.

## Limitaciones y advertencias

- Licencia no comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus Duan et al. es CC BY-NC-SA 3.0; el uso comercial requiere negociación con ambos titulares.
- Dirección única: solo se documenta es→arn; no se garantiza calidad en arn→es ni en terceras lenguas.
- Riesgo de alucinación y de traducciones morfológicamente plausibles pero semánticamente incorrectas, especialmente en terminología técnica o neologismos ausentes del corpus.
- Sesgos derivados del corpus de ajuste: la distribución temática del corpus Duan et al. condiciona el dominio cubierto; textos legales, médicos o técnicos pueden degradar la calidad.
- El checkpoint es "paper-era archived", no un modelo mantenido con actualizaciones; puede contener artefactos de la pipeline original.
- Requiere el helper `inference.py` para el preprocesado correcto; usarlo directamente con `transformers` sin ese preprocesado puede producir marcadores `@@` en la salida.
- Contexto máximo no documentado en la model card; se asume el estándar de NLLB (512 tokens) pero no está confirmado.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.
- Sin métricas de evaluación humana ni comparación con traductores nativos publicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-mono-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la informacion disponible).
- Repositorio del corpus Duan et al.: no disponible en la informacion proporcionada.
