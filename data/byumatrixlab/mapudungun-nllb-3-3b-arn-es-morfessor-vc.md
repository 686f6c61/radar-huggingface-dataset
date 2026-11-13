# byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-vc

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-vc` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática de mapudungun (código ISO `arn`) a español (`es`). Lo desarrolla el grupo byumatrixlab en el contexto de un trabajo académico presentado en AmericasNLP 2026, centrado en tokenización morfológica para lenguas de bajos recursos. El modelo resuelve un problema concreto: la baja cobertura de mapudungun en los tokenizadores de los modelos multilingües masivos, que fragmentan agresivamente las palabras en esta lengua aglutinante y degradan la calidad de la traducción.

La innovación principal no está en la arquitectura —se mantiene el transformer encoder-decoder de NLLB-200— sino en el preprocesamiento: se aplica segmentación Morfessor al mapudungungun y después se eliminan de forma voraz aquellas fronteras cuyo segmento fusionado ya existe en el vocabulario de NLLB. Esta variante se denomina "Morfessor-VC" (vocabulary-constrained) y es la que corresponde a este checkpoint. El modelo base tiene 3.344.861.184 parámetros y el repositorio ocupa 13,4 GB en formato safetensors.

Es relevante ahora porque el trabajo reporta un chrF++ medio a nivel de frase de 45,84 para esta condición, tamaño y dirección, un valor que el artículo presenta como referencia para traducción mapudungun→español con modelos de 3.300 millones de parámetros. El checkpoint es de la era del paper y está pensado para reproducibilidad académica más que para despliegue comercial, dada la licencia derivada de NLLB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200) |
| Parámetros totales | 3.344.861.184 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | `nllb-and-corpus-derived-terms` (NLLB-200: CC-BY-NC 4.0; corpus Duan et al.: CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `facebook/nllb-200-3.3B`, un transformer encoder-decoder de tipo m2m_100 con 3.344.861.184 parámetros. No se introducen cambios arquitectónicos: la modificación se produce en la capa de tokenización del lado del mapudungun. El pipeline aplica segmentación Morfessor sobre el texto en `arn` y, a continuación, un paso de eliminación voraz de fronteras: si la forma fusionada de dos segmentos adyacentes ya existe como ítem en el vocabulario de NLLB, se elimina la frontera. El resultado se codifica con el tokenizador original del modelo base, lo que reduce la fragmentación de palabras aglutinantes sin ampliar el vocabulario.

Los datos de entrenamiento provienen del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos deben consultarse en el artículo de Thompson, Rogers y Ringger (AmericasNLP 2026). El checkpoint corresponde a la era del paper, es decir, no es un reentrenamiento posterior. El helper de inferencia del repositorio aplica el preprocesamiento específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun.

## Capacidades

- Traducción automática unidireccional mapudungun → español.
- Preprocesamiento morfológico integrado: segmentación Morfessor con restricción de vocabulario (Morfessor-VC) aplicada automáticamente por el script de inferencia.
- Manejo de morfología aglutinante: pensado para reducir la fragmentación de palabras en `arn` respecto al tokenizador NLLB estándar.
- Limpieza de marcadores de segmentación (`@@`) en la salida del lado mapudungun.
- Compatible con la API de `transformers` 4.x para pipelines de traducción.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a los dos idiomas declarados (`arn`, `es`); no se garantiza un comportamiento correcto fuera de ese par.

## Casos de uso

- Digitalización y traducción de material educativo en mapudungun: el modelo permite convertir textos escolares o materiales comunitarios a español para su uso en contextos bilingües, con el preprocesamiento morfológico aplicado automáticamente por el helper de inferencia.
- Investigación en traducción de lenguas de bajos recursos: sirve como checkpoint de referencia reproducible para comparar estrategias de tokenización (Morfessor-VC frente a tokenización estándar de NLLB) en el par `arn`-`es`.
- Preservación lingüística y archivo: traducción asistida de corpus orales transcritos o documentos históricos en mapudungun para facilitar su catalogación y consulta por investigadores que no dominan la lengua.
- Atención ciudadana bilingüe en contextos con población mapuche: apoyo a la traducción de comunicaciones administrativas o sanitarias del mapudungun al español, siempre con revisión humana dado el carácter no comercial de la licencia.
- Evaluación de métricas chrF++ en pipelines de MT: el modelo reporta 45,84 de chrF++ medio a nivel de frase, lo que lo convierte en un punto de comparación útil para validar nuevas variantes de tokenización o ajustes finos.
- Publicaciones académicas y docencia: uso como ejemplo práctico de ajuste fino de NLLB-200 con preprocesamiento morfológico en cursos de PLN y talleres sobre lenguas indígenas americanas.
- Prototipado de traducción asistida por ordenador (CAT): integración en herramientas de traducción con memoria para traductores que trabajan con mapudungun, aprovechando la limpieza automática de marcadores `@@`.

## Benchmarks y rendimiento

| Benchmark | Condición | Valor |
|---|---|---|
| chrF++ (medio a nivel de frase) | Mapudungun → español, Morfessor-VC, 3.3B | 45,84 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros checkpoints del mismo par de idiomas. El único dato de rendimiento reportado es el chrF++ mencionado, extraído de `results/paper_stats.json` según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 6,7 GB solo para pesos (3.344.861.184 parámetros × 2 bytes), más overhead de activaciones y del tokenizador; en la práctica, 8-10 GB en fp16 para secuencias cortas.
- VRAM estimada en fp32: aproximadamente 13,4 GB solo para pesos, lo que exige GPUs de 16 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 en inferencia.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 8 bits, potencialmente en GPUs de 12 GB; no se documentan pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: `transformers` 4.x (requerido explícitamente), script `inference.py` del repositorio, y potencialmente vLLM o TGI si se exporta el checkpoint a los formatos soportados; no se proporcionan configuraciones listas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | chrF++ (arn→es) |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-vc | 3.344.861.184 | no disponible | arn, es | NLLB + corpus (no comercial) | 45,84 |
| facebook/nllb-200-3.3B (base) | 3.344.861.184 | no disponible | 200 idiomas (incluye arn) | CC-BY-NC 4.0 | no disponible en esta ficha |
| Otras variantes del mismo paper (tokenización estándar, sin Morfessor-VC) | 3.344.861.184 | no disponible | arn, es | NLLB + corpus | no disponible en esta ficha |

La comparativa cuantitativa con el modelo base y con las demás condiciones del paper no está disponible en la información proporcionada; el artículo de AmericasNLP 2026 es la fuente para esas cifras.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base NLLB-200 se distribuye bajo CC-BY-NC 4.0 y el corpus de ajuste bajo CC BY-NC-SA 3.0; el uso comercial requiere evaluar ambas obligaciones por separado.
- El checkpoint es de la era del paper y está orientado a reproducibilidad académica, no a despliegue en producción a gran escala.
- Traducción unidireccional: solo está validado para mapudungun → español; no se garantiza calidad en la dirección inversa ni en otros pares.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en términos culturales o terminológicos, especialmente en vocabulario especializado o variantes dialectales del mapudungun.
- Sesgos potenciales derivados del corpus Duan et al.: la cobertura léxica y dialectal depende de la composición de ese corpus, no documentada en la model card.
- La tokenización Morfessor-VC depende de un preprocesamiento concreto; usar el modelo sin el helper `inference.py` puede degradar la calidad y dejar marcadores `@@` en la salida.
- No se documentan longitudes de contexto máximas ni comportamiento con secuencias largas; conviene validar empíricamente antes de usarlo con documentos extensos.
- Requiere `transformers` 4.x; versiones anteriores pueden no cargar el checkpoint correctamente.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia/throughput, lo que dificulta la comparación con alternativas fuera del ámbito de la traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-arn-es-morfessor-vc
- Modelo base NLLB-200-3.3B: https://huggingface.co/facebook/nllb-200-3.3B
- Artículo de referencia: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of AmericasNLP 2026 (sin URL directa en la información disponible).
- Corpus Duan et al. de mapudungun: no disponible URL directa en la información proporcionada.
