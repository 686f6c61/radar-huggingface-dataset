# byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-vc

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-vc` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción del mapudungun (`arn`) al castellano (`es`). Lo desarrolla el grupo byumatrixlab y aborda uno de los problemas clásicos de la traducción automática de lenguas de bajos recursos: la tokenización inadecuada de una lengua aglutinante y polisintética como el mapudungun por parte de un tokenizador entrenado mayoritariamente con lenguas de altos recursos.

La innovación central es la aplicación de segmentación morfológica con Morfessor antes de la tokenización, seguida de una eliminación voraz de fronteras cuando la forma fusionada ya existe en el vocabulario de NLLB. Se trata de una variante concreta ("Morfessor-VC") dentro de un estudio más amplio sobre tokenización morphology-aware para NLLB-200, publicado en el workshop AmericasNLP 2026.

Con 615 millones de parámetros (aproximadamente 600M nominales), el modelo es ligero y desplegable en hardware modesto, lo que lo hace útil para integraciones en producción con presupuesto limitado, así como para investigación en traducción de lenguas indígenas americanas. La licencia es heredada y no comercial, derivada de las obligaciones de NLLB-200 y del corpus de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100), base NLLB-200 distilled |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 estándar; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | arn (mapudungun), es (castellano); dirección documentada: arn→es |
| Licencia | other (`nllb-and-corpus-derived-terms`): CC-BY-NC 4.0 (NLLB-200) + CC BY-NC-SA 3.0 (corpus Duan et al.) |
| Formato de pesos | safetensors |
| Tamano del repo | 2.5 GB |
| Modelo base | facebook/nllb-200-distilled-600M |
| Pipeline | translation |
| Fecha de creacion | 2026-05-29 |
| Ultima actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura m2m_100 de NLLB-200 en su variante destilada de 600M, un transformer encoder-decoder con atención multi-cabeza estándar y embeddings multilingües compartidos. El ajuste fino se realiza sobre la dirección mapudungun→castellano, con un preprocesado específico que aplica segmentación Morfessor al texto de entrada en mapudungun y después elimina de forma voraz aquellas fronteras de morfemas cuya forma fusionada ya existe como ítem en el vocabulario de NLLB (de ahí "VC", vocabulary-constrained). Este esquema busca alinear la granularidad de los subtokens con la morfología real de la lengua sin introducir tokens fuera del vocabulario del modelo base.

El checkpoint corresponde a una versión archivada de la era del artículo, no a un reentrenamiento posterior. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; únicamente indica que el corpus de ajuste deriva del corpus de mapudungun de Duan et al. (CC BY-NC-SA 3.0). El pipeline de inferencia incluido en el repositorio aplica el preprocesado condicional y elimina los marcadores de continuación `@@` de la salida en mapudungun cuando corresponde.

## Capacidades

- Traducción automática unidireccional documentada: mapudungun (`arn`) → castellano (`es`).
- Preprocesado morfológico integrado (Morfessor + filtrado por vocabulario) mediante el script `inference.py` del repositorio.
- Manejo de morfología aglutinante/polisintética del mapudungun, con segmentación adaptada a la lengua.
- Eliminación automática de marcadores de continuación `@@` en la salida cuando el texto generado es en mapudungun.
- Compatibilidad con la librería `transformers` 4.x.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a los dos idiomas del ajuste (arn, es); el resto de lenguas de NLLB-200 no se han validado tras el ajuste.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, actas y textos comunitarios del mapudungun al castellano, aprovechando el preprocesado morfológico para preservar la segmentación de una lengua aglutinante.
- Digitalización y accesibilidad de archivos: conversión de transcripciones orales o textos históricos en mapudungun a castellano para su consulta por parte de investigadores y público general.
- Subtitulado y localización de contenido audiovisual: generación de subtítulos en castellano a partir de transcripciones en mapudungun en proyectos de preservación lingüística.
- Investigación en traducción de bajos recursos: uso como baseline reproducible para estudios de tokenización morphology-aware, comparando la variante Morfessor-VC frente a tokenización estándar de NLLB.
- Herramientas de apoyo a la docencia bilingüe: asistencia a profesores y estudiantes en contextos de educación intercultural bilingüe, con revisión humana obligatoria por la naturaleza del dominio.
- Prototipado de asistentes de traducción en entornos con recursos limitados: el tamaño de 600M permite desplegarlo en una única GPU de gama media o incluso en CPU con cuantización, adecuado para pilotos en zonas con infraestructura limitada.
- Evaluación comparativa de técnicas de preprocesado: banco de pruebas para medir el impacto de la segmentación morfológica en chrF++ frente a otras variantes del mismo estudio.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (nivel de frase, media) | 43.16 | Dirección arn→es, tamaño 600M, condición Morfessor-VC |

El dato procede del `results/paper_stats.json` del repositorio y corresponde al pipeline corregido del artículo. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas frente a otros sistemas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,3-1,5 GB solo para pesos, más overhead de activaciones y caché; en la práctica, 2-3 GB de VRAM son suficientes para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,7-0,9 GB para pesos; en 4 bits, en torno a 0,4-0,5 GB. El autor no documenta cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del recuento de parámetros.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluidas GPUs de gama baja y portátiles con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` 4.x con el script `inference.py` incluido; también es desplegable mediante vLLM, TGI o llama.cpp/GGUF si se generan las conversiones oportunas (no publicadas por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-vc | 615M | no disponible | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | NLLB-200 destilado + Morfessor-VC, arn→es | Hugging Face, 7 descargas |
| facebook/nllb-200-distilled-600M | 615M | 512 tokens (estándar NLLB) | CC-BY-NC 4.0 | Traducción multilingüe general (200 lenguas) | Hugging Face, ampliamente usado |
| facebook/nllb-200-1.3B | 1.300M | 512 tokens (estándar NLLB) | CC-BY-NC 4.0 | Traducción multilingüe general, mayor capacidad | Hugging Face |
| Modelos específicos para mapudungun de otros grupos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros sistemas específicos de mapudungun no está disponible en la información proporcionada. Frente al NLLB-200 base, la diferencia clave es el preprocesado morfológico y el ajuste al par arn→es, no un cambio arquitectónico.

## Limitaciones y advertencias

- Licencia no comercial: el modelo hereda CC-BY-NC 4.0 de NLLB-200 y CC BY-NC-SA 3.0 del corpus de Duan et al.; el uso comercial requiere revisión legal y probablemente no está permitido sin licencias adicionales.
- El modelo está entrenado y validado únicamente para la dirección arn→es; el rendimiento en es→arn u otras direcciones no está documentado.
- Al ser un ajuste sobre un corpus derivado, puede reproducir sesgos y errores del corpus original y del NLLB-200 base.
- Riesgo de alucinación en traducción: como todo modelo generativo, puede producir texto fluido pero semánticamente incorrecto, especialmente con términos culturales o neologismos del mapudungun.
- No se documentan evaluaciones de robustez frente a variantes dialectales del mapudungun ni frente a ortografías alternativas.
- El preprocesado Morfessor-VC es específico de esta variante; usar el modelo sin el script `inference.py` puede degradar la calidad de forma notable.
- El checkpoint es una versión archivada de la era del artículo, no un modelo mantenido activamente; la última actualización del repositorio es de noviembre de 2026, pero no se documenta un plan de mantenimiento.
- El número de descargas (7) y de likes (0) indica una adopción muy baja, por lo que no hay validación comunitaria independiente del rendimiento reportado.
- No se documentan cuantizaciones oficiales ni pesos GGUF; cualquier conversión a otros formatos es responsabilidad del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-morfessor-vc
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia (citado en la model card): Thompson, Rogers, Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026.
- Corpus de Duan et al. (referenciado en la model card, sin URL explícita): no disponible.
- Repositorio del código de inferencia: incluido en el propio repositorio de Hugging Face (`inference.py`).
