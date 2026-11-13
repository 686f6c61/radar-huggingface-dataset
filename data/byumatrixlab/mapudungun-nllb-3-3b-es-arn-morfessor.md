# byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor

## Resumen

El modelo `mapudungun-nllb-3.3B-es-arn-morfessor` es un ajuste fino de `facebook/nllb-200-3.3B` especializado en traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el marco de un trabajo académico presentado en el taller AmericasNLP 2026, y su rasgo distintivo es la aplicación de segmentación morfológica no supervisada con Morfessor sobre el mapudungun antes del ajuste fino, con el objetivo de mitigar el problema de vocabulario fragmentado que afecta a las lenguas aglutinantes en modelos multilingües preentrenados.

El modelo parte de la arquitectura M2M-100 de NLLB-200, con 3.344.861.184 parámetros totales y pesos en formato safetensors (repositorio de 13,4 GB). Se distribuye como checkpoint de la era del paper ("paper-era archived checkpoint"), es decir, una instantánea congelada vinculada a los resultados publicados, no una versión en desarrollo activo. La model card reporta un chrF++ medio a nivel de frase de 42,76 para esta condición, tamaño y dirección, extraído del fichero `results/paper_stats.json` del repositorio.

Su relevancia es doble: por un lado, aporta un punto de referencia reproducible para traducción de lenguas de bajos recursos con preprocesamiento morfológico; por otro, ilustra las obligaciones de licencia encadenadas que aparecen al reutilizar NLLB-200 (CC-BY-NC 4.0) junto con corpus derivados (CC BY-NC-SA 3.0), lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo M2M-100 (NLLB-200) |
| Parametros totales | 3.344.861.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | arn (mapudungun), es (espanol); direccion ajustada: es a arn |
| Licencia | other (`nllb-and-corpus-derived-terms`): NLLB-200 CC-BY-NC 4.0 + corpus Duan et al. CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,4 GB |
| Modelo base | facebook/nllb-200-3.3B |
| Pipeline | translation |
| Metrica declarada | chrF++ medio a nivel de frase: 42,76 (es a arn, condicion Morfessor) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de NLLB-200, un transformer encoder-decoder derivado de M2M-100 con normalización y tokenización multilingües propias de la familia NLLB. El ajuste fino se realiza sobre el checkpoint de 3.3B de parámetros y está especializado en una única dirección, español a mapudungun, por lo que no debe esperarse paridad de rendimiento en la dirección inversa ni en otros pares de idiomas del modelo base.

La innovación técnica declarada es el preprocesamiento morfológico: se aplica segmentación no supervisada con Morfessor al mapudungun, lo que introduce fronteras de morfemas en el texto de entrenamiento y reduce la fragmentación arbitraria de palabras aglutinantes en subtokens. El helper de inferencia del repositorio aplica el preprocesamiento específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. El corpus de ajuste deriva del corpus de mapudungun de Duan et al.

## Capacidades

- Traducción automática unidireccional español a mapudungun, con preprocesamiento morfológico específico de la condición.
- Manejo de texto mapudungun segmentado con Morfessor y reconstrucción de la salida sin marcadores `@@`.
- Traducción de frases y párrafos dentro de los límites de contexto del modelo base (no documentados en esta ficha).
- Capacidad multilingüe residual heredada de NLLB-200, aunque el ajuste fino está orientado a un único par.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades de generación de código ni matemáticas como objetivo del ajuste.

## Casos de uso

- Digitalización de material educativo bilingüe: traducción de guías escolares y textos de enseñanza del español al mapudungun para programas de educación intercultural, aprovechando el preprocesamiento morfológico que mejora la coherencia de las palabras aglutinantes.
- Señalética y comunicación institucional: traducción de avisos, formularios y comunicados de organismos públicos a mapudungun, con revisión humana obligatoria dado el carácter no comercial de la licencia.
- Investigación en traducción de bajos recursos: uso como línea base reproducible para comparar estrategias de tokenización (Morfessor frente a BPE estándar) en lenguas aglutinantes, gracias a la disponibilidad del checkpoint y de las estadísticas del paper.
- Subtitulado y transcripción de contenido audiovisual comunitario: traducción de guiones y subtítulos divulgativos al mapudungun para radios y canales locales, en flujos con postedición por hablantes nativos.
- Preservación lingüística y corpus paralelos: generación de borradores de pares español-mapudungun que, tras validación por lingüistas, amplíen corpus paralelos disponibles para futuros entrenamientos.
- Prototipos de asistentes de consulta para hablantes de mapudungun: integración en interfaces de consulta simple (horarios, trámites) donde la salida se valida antes de publicarse, dado el riesgo de alucinación en lenguas de bajos recursos.

## Benchmarks y rendimiento

| Metrica | Condicion | Resultado |
|---|---|---|
| chrF++ medio a nivel de frase | es a arn, Morfessor, 3.3B | 42,76 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros checkpoints del mismo par de idiomas. El único dato cuantitativo es el chrF++ reportado en la model card, procedente de `results/paper_stats.json`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB solo para pesos, más memoria para activaciones y caché; en la práctica se recomienda reservar 10-12 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos, con margen adicional para el runtime.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegues con concurrencia.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantización, en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4070; no se garantiza en GPUs de 6 GB sin cuantización agresiva.
- Opciones de despliegue: `transformers` 4.x (requisito explícito de la model card), servidores de inferencia compatibles con modelos seq2seq (TGI, vLLM con soporte encoder-decoder), y conversión a GGUF para llama.cpp u Ollama si se generan los pesos cuantizados, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-3.3B-es-arn-morfessor | 3,34B | no disponible | Ajuste fino NLLB + Morfessor, es a arn | other (NC, CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 10 descargas |
| facebook/nllb-200-3.3B | 3,3B | no disponible en esta ficha | Modelo multilingüe base, 200 idiomas | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| facebook/nllb-200-distilled-600M | 600M | no disponible en esta ficha | Version destilada multilingue | CC-BY-NC 4.0 | Hugging Face, muy extendido |
| Helsinki-NLP/opus-mt-es-arn | no disponible | no disponible | Modelo Marian especifico es-arn | no disponible en esta ficha | Hugging Face |

La comparación cuantitativa de calidad entre estas alternativas para el par es-arn no está disponible en la información proporcionada; solo se conoce el chrF++ de 42,76 del modelo descrito.

## Limitaciones y advertencias

- Licencia no comercial: hereda CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus de Duan et al.; el uso comercial requiere evaluar y cumplir ambas obligaciones, lo que en la práctica lo excluye de productos comerciales sin licenciamiento adicional.
- Dirección única: el ajuste está orientado a español a mapudungun; el rendimiento en la dirección inversa no está validado.
- Riesgo de alucinación y de fluidez engañosa en una lengua de bajos recursos: la salida puede ser gramaticalmente plausible pero semánticamente incorrecta, por lo que se recomienda postedición por hablantes nativos.
- Sesgos y cobertura: el corpus de entrenamiento (Duan et al.) condiciona el dominio y el registro; es probable un peor rendimiento en terminología técnica, variantes dialectales o texto informal, aunque no se documentan sesgos específicos en la información disponible.
- Checkpoint archivado de la era del paper: no se garantiza mantenimiento, correcciones ni soporte por parte del autor.
- Dependencia de `transformers` 4.x y del helper `inference.py` para el preprocesamiento correcto; usar el modelo sin ese preprocesamiento degradará la calidad de la salida.
- Longitud de contexto y comportamiento con secuencias largas no documentados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-3.3B-es-arn-morfessor
- Modelo base: https://huggingface.co/facebook/nllb-200-3.3B
- Paper de referencia (AmericasNLP 2026): "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Thompson, Rogers y Ringger; sin URL directa en la información disponible.
- Repositorio del autor (byumatrixlab): no disponible en la información proporcionada.
- Demo o Space asociado: no disponible en la información proporcionada.
