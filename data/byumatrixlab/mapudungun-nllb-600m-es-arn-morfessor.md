# byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` especializado en traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab y se enmarca en el trabajo "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", presentado en AmericasNLP 2026. La innovación central es la aplicación de segmentación morfológica no supervisada con Morfessor sobre el mapudungun antes del ajuste fino, lo que permite que el tokenizador de NLLB-200 maneje mejor la naturaleza aglutinante de esta lengua.

El modelo tiene 615.072.768 parámetros (aproximadamente 600M) y una arquitectura transformer encoder-decoder heredada de NLLB-200, con la tokenización y los embeddings adaptados al vocabulario multilingüe de NLLB. El repositorio ocupa 2,5 GB en formato safetensors. Está pensado exclusivamente para la dirección español→mapudungun y no cubre la dirección inversa.

Su relevancia radica en que aborda un caso extremo de baja disponibilidad de recursos: el mapudungun tiene cientos de miles de hablantes pero una presencia digital mínima. El pipeline reporta un chrF++ medio a nivel de oración de 39,90 para esta condición, tamaño y dirección, según la fuente `results/paper_stats.json` del repositorio. Es un modelo de investigación, no un producto listo para producción, y su licencia es no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | arn (mapudungun), es (español); dirección de traducción documentada: es→arn |
| Licencia | other (`nllb-and-corpus-derived-terms`): base NLLB-200 bajo CC-BY-NC 4.0 y corpus de ajuste bajo CC BY-NC-SA 3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo m2m_100 destilado del NLLB-200 completo. Sobre esa base se realiza un ajuste fino supervisado para la dirección español→mapudungun. La contribución metodológica del trabajo es la aplicación de segmentación Morfessor no supervisada al mapudungun: el texto mapuche se divide en morfemas antes de la tokenización, lo que reduce la fragmentación excesiva que sufre una lengua aglutinante con un tokenizador entrenado mayoritariamente en lenguas de altos recursos.

El corpus de ajuste deriva del corpus Mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. El checkpoint publicado se describe como "paper-era archived checkpoint", es decir, la versión archivada correspondiente a los experimentos del artículo. El helper de inferencia aplica el preprocesado morfológico específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun.

## Capacidades

- Traducción automática de español a mapudungun (dirección única documentada).
- Manejo de morfología aglutinante mediante preprocesado Morfessor y limpieza de marcadores `@@` en la salida.
- Generación de texto condicionada a la tarea de traducción dentro del esquema seq2seq de NLLB.
- Soporte del vocabulario multilingüe de NLLB-200 y de sus tokens de idioma.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada a los dos idiomas del ajuste (es, arn); no se garantiza un comportamiento correcto en otras direcciones del modelo base.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al mapudungun: el modelo puede traducir folletos, formularios y avisos oficiales del español al mapudungun para su distribución en comunidades mapuche, con revisión humana obligatoria por tratarse de un modelo de investigación.
- Subtitulado y localización de contenido audiovisual: integrado en un pipeline que recibe subtítulos en español y genera una primera versión en mapudungun, que después se post-edita con hablantes nativos.
- Digitalización de material educativo bilingüe: traducción de guías escolares y materiales didácticos del español al mapudungun para programas de educación intercultural bilingüe.
- Preservación y documentación lingüística: generación de pares de traducción adicionales para ampliar corpus paralelos, que luego se validan y se incorporan a recursos abiertos de la lengua.
- Investigación en traducción de bajos recursos: el checkpoint sirve como línea base reproducible para comparar técnicas de tokenización morfológica (Morfessor frente a otras segmentaciones) en lenguas aglutinantes.
- Prototipos de asistentes conversacionales en mapudungun: traducción de turnos del español al mapudungun en un sistema de chat, siempre con un hablante en el circuito de validación y sin uso comercial por las restricciones de licencia.

## Benchmarks y rendimiento

| Metrica | Condicion | Resultado |
|---|---|---|
| chrF++ medio a nivel de oración | es→arn, 600M, segmentación Morfessor | 39,90 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros sistemas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5 GB de pesos más overhead de activaciones; en fp16/bf16 aproximadamente 1,3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con lotes pequeños; A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también en GPUs de 8 GB con precisión reducida.
- Opciones de despliegue: `transformers` 4.x (requisito explícito de la model card) mediante el script `inference.py` del repositorio; también es compatible con servidores de inferencia basados en transformers como TGI o vLLM, aunque no se documenta soporte oficial. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-morfessor | 615M | no disponible | Ajuste fino NLLB-200 con segmentación Morfessor | No comercial (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, 8 descargas |
| facebook/nllb-200-distilled-600M | 615M | 1024 tokens (valor habitual del modelo base; no confirmado en la información) | Modelo multilingüe general, sin ajuste específico a mapudungun | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| Otros ajustes es→arn sobre NLLB | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el checkpoint es una versión archivada de la época del artículo y no se presenta como listo para producción.
- Dirección única: solo se documenta es→arn; no hay garantía de calidad en la dirección inversa ni en otros pares de idiomas.
- Licencia no comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus derivado de Duan et al. es CC BY-NC-SA 3.0; el uso comercial está restringido y hay obligaciones de atribución y compartición derivadas de ambas fuentes.
- Riesgo de alucinación y de traducciones morfológicamente incorrectas, especialmente en terminología técnica o neologismos ausentes del corpus de ajuste.
- Dependencia del preprocesado: el rendimiento reportado asume la segmentación Morfessor y la eliminación de marcadores `@@`; usar el modelo sin ese pipeline puede degradar la calidad.
- Sesgos y cobertura: el corpus de entrenamiento es limitado y puede sobrerrepresentar ciertas variantes dialectales o dominios; no se documentan análisis de sesgo.
- Idiomas: fuera de es y arn el comportamiento no está validado, aunque el vocabulario base sea multilingüe.
- Sin cuantizaciones oficiales publicadas ni pesos GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la información disponible).
- Corpus de Duan et al. para mapudungun: no disponible enlace directo en la información proporcionada.
- Repositorio de código del pipeline de inferencia: incluido en el propio repositorio de Hugging Face (`inference.py`).
