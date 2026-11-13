# byumatrixlab/mapudungun-nllb-600M-es-arn-mono-bpe

## Resumen

El modelo `mapudungun-nllb-600M-es-arn-mono-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` especializado en traducción del español (`es`) al mapudungun (`arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el contexto del paper "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", presentado en AmericasNLP 2026. El modelo forma parte de un estudio sistemático sobre tokenización morfológica aplicada a NLLB-200 para lenguas de bajos recursos.

La propuesta técnica central es una condición de tokenización BPE específica para mapudungun ("Mono BPE"), que sustituye el esquema multilingüe original de NLLB por un vocabulario SentencePiece entrenado únicamente sobre texto en mapudungun. Esta decisión busca adaptar la segmentación subpalabra a la morfología aglutinante de la lengua, un factor crítico cuando el corpus de ajuste es reducido. El checkpoint se distribuye como artefacto "paper-era archived", es decir, la versión exacta con la que se obtuvieron los resultados publicados.

Con 615 millones de parámetros y un tamaño de repositorio de 2,5 GB, el modelo está pensado para investigación en traducción automática de bajos recursos y para aplicaciones de preservación lingüística. El paper reporta un chrF++ medio a nivel de frase de 38,04 para esta condición, tamaño y dirección, una métrica que debe interpretarse en el contexto de un corpus de evaluación limitado y de una lengua con ortografía no estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200) |
| Parametros totales | 615.072.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other (`nllb-and-corpus-derived-terms`; base CC-BY-NC 4.0 y corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder denso con 615 millones de parámetros, destilado del NLLB-200 original. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección español→mapudungun. La innovación metodológica del trabajo no reside en la arquitectura, sino en la tokenización: se entrena un vocabulario SentencePiece BPE monolingüe sobre texto en mapudungun ("Mono BPE") y se condiciona el modelo a esa segmentación, con el objetivo de capturar mejor los morfemas de una lengua aglutinante y reducir la fragmentación excesiva que produce el vocabulario multilingüe original de NLLB.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal. El checkpoint se describe como "paper-era archived", es decir, la versión congelada empleada para generar los resultados publicados. El helper de inferencia incluido aplica un preprocesado específico de mapudungun y elimina los marcadores de continuación `@@` de la salida.

## Capacidades

- Traducción automática unidireccional español→mapudungun.
- Tokenización BPE específica de mapudungun ("Mono BPE"), con preprocesado y postprocesado propios gestionados por `inference.py`.
- Manejo de morfología aglutinante mediante segmentación subpalabra adaptada a la lengua.
- Eliminación automática de marcadores `@@` en la salida mapudungun.
- Compatibilidad con la librería Transformers 4.x y el pipeline `translation`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas a los dos idiomas del ajuste (`es`, `arn`); no se garantiza el comportamiento en otras direcciones del NLLB original.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o administrativos del español al mapudungun para organizaciones mapuche, usando el helper de inferencia con el preprocesado específico incluido.
- Preservación y revitalización lingüística: generación de borradores de texto en mapudungungun a partir de fuentes en español para revisión por hablantes nativos, aprovechando la tokenización adaptada a la morfología de la lengua.
- Investigación en traducción de bajos recursos: reproducción de los resultados del paper (chrF++ 38,04) como línea base para comparar nuevas técnicas de tokenización o de aumento de datos.
- Subtitulado y localización de contenido breve: traducción de frases y párrafos cortos en proyectos de divulgación o medios comunitarios, dado que el modelo está ajustado a nivel de frase.
- Herramientas de aprendizaje de la lengua: asistencia a estudiantes de mapudungun que parten del español, mostrando traducciones de referencia que después se contrastan con material didáctico.
- Experimentos académicos de morfología computacional: análisis de cómo una segmentación BPE monolingüe afecta a la calidad de traducción en lenguas aglutinantes, comparando con la condición multilingüe del NLLB base.
- Prototipos de traducción en entornos de investigación: integración en cuadernos o scripts de Python con Transformers 4.x para evaluar el modelo en corpus propios, siempre respetando las restricciones no comerciales de la licencia.

## Benchmarks y rendimiento

| Metrica | Condicion | Direccion | Valor |
|---|---|---|---|
| chrF++ medio a nivel de frase | Mono BPE, 600M | es→arn | 38,04 |

La model card solo reporta este valor, extraído de `results/paper_stats.json`. No se publican en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros checkpoints del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,3-1,5 GB solo para pesos, más overhead de activaciones y del tokenizador; en la práctica, 2-3 GB son suficientes para lotes pequeños.
- VRAM estimada en FP32: aproximadamente 2,5 GB para pesos, más overhead; alrededor de 3-4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes o servicio concurrente, A100/H100 ofrecen mayor throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: `transformers` 4.x (requisito explícito de la model card) y el script `inference.py` del repositorio; el pipeline `translation` de Hugging Face es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF, llama.cpp/Ollama no son opciones directas sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | chrF++ (es→arn) |
|---|---|---|---|---|---|
| byumatrixlab/mapudungun-nllb-600M-es-arn-mono-bpe | 615 M | no disponible | es→arn | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | 38,04 |
| facebook/nllb-200-distilled-600M (base) | 615 M | no disponible | multilingüe (200 lenguas) | CC-BY-NC 4.0 | no disponible |
| Otros checkpoints del mismo estudio (condiciones alternativas) | 600 M | no disponible | es→arn | other | no disponible en la información proporcionada |

La comparación cuantitativa con el NLLB base y con las demás condiciones del paper no está disponible en la información proporcionada; la model card solo publica el valor de la condición Mono BPE.

## Limitaciones y advertencias

- Licencia no comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial requiere revisar y cumplir ambas obligaciones, que la licencia `other` no oculta.
- Modelo unidireccional: solo traduce español→mapudungun; no se garantiza el rendimiento en la dirección inversa ni en otros pares de lenguas del NLLB original.
- Corpus de ajuste reducido y de dominio limitado: el rendimiento fuera del dominio del corpus de Duan et al. puede degradarse notablemente.
- Ortografía no estandarizada del mapudungun: variantes grafémicas (por ejemplo, entre alfabetos) pueden producir traducciones inconsistentes; el preprocesado del helper mitiga parcialmente este problema, pero no lo elimina.
- Riesgo de alucinación y de fluencia engañosa: como cualquier modelo neuronal de traducción, puede generar salidas gramaticalmente plausibles pero semánticamente incorrectas, especialmente en frases largas o con terminología especializada.
- Longitud de contexto no documentada: no se especifica la ventana máxima; se recomienda trabajar a nivel de frase o párrafo corto.
- Sesgos: no se documentan análisis de sesgos; al derivar de NLLB-200 y de un corpus comunitario, puede heredar sesgos de ambas fuentes.
- Artefacto "paper-era archived": no se garantiza mantenimiento ni actualizaciones; la fecha de actualización del repositorio es posterior a la de creación, pero el checkpoint corresponde a la versión del paper.
- Requisito de Transformers 4.x: el helper de inferencia depende de esa versión; versiones mayores pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-mono-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper citado: Thompson, I. M., Rogers, B. M. A., Ringger, E. K. "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", Proceedings of the Sixth Workshop on NLP for Indigenous Languages of the Americas (AmericasNLP 2026). No se proporciona URL directa en la información disponible.
- Corpus de Duan et al. (mapudungun, CC BY-NC-SA 3.0): no se proporciona URL directa en la información disponible.
- Repositorio del autor (byumatrixlab): no se proporciona URL directa en la información disponible.
