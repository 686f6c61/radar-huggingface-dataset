# byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor-bpe

## Resumen

El modelo `mapudungun-nllb-600M-es-arn-morfessor-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` desarrollado por byumatrixlab para traducción automática del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Resuelve el problema de la traducción de baja recursos mediante una tokenización morfológicamente consciente: segmentación Morfessor seguida de SentencePiece BPE dentro de cada morfema, en lugar de la tokenización BPE estándar de NLLB.

El modelo tiene 615.072.768 parámetros en formato safetensors (2,5 GB de repositorio) y se distribuye como checkpoint de traducción unidireccional es→arn. Su relevancia radica en que aplica una innovación de tokenización específica para lenguas aglutinantes y polisintéticas al pipeline estándar de NLLB, con una verificación de release que reproduce exactamente las 9.382 predicciones de test archivadas del checkpoint original del paper.

La model card reporta un chrF++ medio a nivel de oración de 38,74 para esta condición (tamaño 600M, dirección es→arn, tokenización Morfessor-BPE). El modelo está pensado para investigación en NLP de lenguas indígenas y requiere cumplir simultáneamente las condiciones de la licencia del modelo base y del corpus de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español); dirección de traducción es→arn |
| Licencia | other: `nllb-and-corpus-derived-terms` (NLLB-200 CC-BY-NC 4.0 + corpus Duan et al. CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de la familia NLLB-200 (derivada de M2M-100) con 615 millones de parámetros. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección español→mapudungun. La innovación técnica principal es el esquema de tokenización: se aplica segmentación Morfessor sobre el texto y después SentencePiece BPE dentro de cada morfema, lo que preserva las unidades morfológicas de una lengua aglutinante como el mapudungun y reduce la fragmentación que produce el BPE estándar.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El pipeline de inferencia incluido (`inference.py`) aplica el preprocesamiento específico de la condición y elimina los marcadores de continuación `@@` de la salida en mapudungun.

## Capacidades

- Traducción automática unidireccional español→mapudungun.
- Manejo de morfología aglutinante mediante tokenización Morfessor + BPE intra-morfema.
- Preprocesamiento y postprocesamiento específicos incluidos en el script de inferencia (eliminación de marcadores `@@`).
- Compatibilidad con la librería `transformers` 4.x.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par es→arn.
- No se documentan modos de thinking, visión ni audio.

## Casos de uso

- Traducción de documentación oficial y materiales educativos del español al mapudungun: el modelo permite generar versiones en lengua indígena de textos administrativos o escolares, con revisión humana por parte de hablantes nativos dada la naturaleza de baja recursos del par.
- Investigación en tokenización morfológica: sirve como punto de comparación reproducible frente a variantes con BPE estándar, ya que el release verifica las 9.382 predicciones de test del checkpoint del paper.
- Preservación y digitalización de patrimonio lingüístico: traducción asistida de corpus escritos en español a mapudungun para ampliar el material disponible en la lengua.
- Sistemas de traducción asistida para comunidades mapuche: integración en herramientas de escritorio o web donde el usuario final revisa y corrige la salida del modelo.
- Evaluación comparativa de modelos NLLB destilados en lenguas de bajos recursos: el checkpoint de 600M permite experimentar con hardware modesto frente a variantes de mayor tamaño.
- Generación de datos sintéticos para aumento de corpus: producir pares es→arn adicionales para entrenar o evaluar otros sistemas, siempre con filtrado y validación por hablantes.
- Docencia y divulgación sobre NLP de lenguas indígenas: ejemplo práctico de adaptación de un modelo multilingüe grande a una lengua con pocos recursos mediante cambios de tokenización.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (nivel de oracion, media) | 38,74 | 600M, es→arn, tokenizacion Morfessor-BPE |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros sistemas para este par de idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,3 GB para pesos, con margen adicional para el resto del pipeline.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: `transformers` 4.x con el script `inference.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF la cuantización no está soportada de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-morfessor-bpe | 615 M | no disponible | es→arn | other (NLLB + corpus) | Hugging Face |
| facebook/nllb-200-distilled-600M | 615 M | no disponible | multilingue (200 idiomas) | CC-BY-NC 4.0 | Hugging Face |
| facebook/nllb-200-distilled-1.3B | 1,3 B | no disponible | multilingue (200 idiomas) | CC-BY-NC 4.0 | Hugging Face |

El modelo se distingue de los checkpoints NLLB originales por el ajuste fino específico al par es→arn y por la tokenización Morfessor-BPE; los NLLB genéricos cubren el mapudungun de forma marginal dentro de su cobertura de 200 idiomas. No se dispone de datos de rendimiento comparables para las alternativas en este par concreto.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce es→arn; no se documenta la dirección inversa.
- Corpus de ajuste de baja recursos: la calidad puede degradarse en dominios alejados del corpus de Duan et al. y en registros formales o técnicos.
- Riesgo de alucinación y de traducciones literales: al ser un ajuste fino sobre un modelo destilado de 600M, la fidelidad semántica en oraciones largas o ambiguas no está garantizada; se recomienda revisión por hablantes nativos.
- Sesgos: no se documentan análisis de sesgos; al derivar del corpus de Duan et al. puede heredar sesgos de dominio y de registro de esa fuente.
- Licencia restrictiva para uso comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial queda excluido y deben cumplirse ambas condiciones simultáneamente.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ): el despliegue en entornos con poca VRAM requiere fp16/bf16 o conversión manual.
- No se documentan la longitud de contexto efectiva ni el comportamiento fuera de la ventana del modelo base.
- El checkpoint se describe como "reconstructed release run": aunque reproduce las predicciones archivadas, conviene validar el comportamiento en el entorno de producción propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL disponible en la información proporcionada).
- Corpus de Duan et al. para mapudungun: referencia citada en la model card, sin URL disponible en la información proporcionada.
