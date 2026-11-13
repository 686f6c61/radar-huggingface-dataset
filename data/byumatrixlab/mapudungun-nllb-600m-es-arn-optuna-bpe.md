# byumatrixlab/mapudungun-nllb-600M-es-arn-optuna-bpe

## Resumen

El modelo `mapudungun-nllb-600M-es-arn-optuna-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traducción del español al mapudungun (código ISO `arn`), una lengua indígena de Chile y Argentina con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab en el marco de un trabajo académico presentado en AmericasNLP 2026, centrado en tokenización sensible a la morfología para lenguas de bajos recursos. El checkpoint corresponde a la condición "Optuna BPE", en la que se sustituye el tokenizador original de NLLB por un SentencePiece BPE entrenado específicamente sobre mapudungun, con un tamaño de vocabulario seleccionado mediante un estudio de Optuna.

La relevancia del modelo radica en su enfoque metodológico: en lugar de limitarse a un ajuste fino convencional, aborda el problema de la fragmentación excesiva que sufren los tokenizadores multilingües genéricos sobre lenguas aglutinantes y morfológicamente ricas como el mapudungun. El resultado reportado por los autores es un chrF++ medio a nivel de frase de 38,79 para esta condición, tamaño y dirección (es→arn), lo que lo convierte en una referencia reproducible para traducción automática de bajos recursos en el contexto de las lenguas originarias americanas.

El modelo tiene 615.072.768 parámetros y se distribuye en formato safetensors, con un repositorio de aproximadamente 2,5 GB. Está pensado exclusivamente para la dirección español→mapudungun y requiere un preprocesado específico de la lengua de destino que se aplica mediante el script `inference.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100 / NLLB-200 distilled) |
| Parametros totales | 615.072.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español); dirección entrenada: es→arn |
| Licencia | other (`nllb-and-corpus-derived-terms`; obligaciones combinadas CC-BY-NC 4.0 del modelo base y CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo m2m_100 destilado del NLLB-200 completo. Sobre esa base se realiza un ajuste fino supervisado para la dirección español→mapudungun. La innovación principal no está en la arquitectura, sino en el tokenizador: se entrena un SentencePiece BPE específico para mapudungun, cuyo tamaño de vocabulario se selecciona mediante un estudio de Optuna documentado en el paper asociado. Esta condición se etiqueta como "Optuna BPE" y se compara en el trabajo con otras configuraciones de tokenización.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, y tampoco menciona explícitamente el uso de RLHF o DPO; el pipeline descrito es de ajuste fino supervisado con métrica chrF++. El checkpoint se describe como "paper-era archived checkpoint", es decir, la versión utilizada para generar los resultados publicados.

## Capacidades

- Traducción automática unidireccional español→mapudungun.
- Manejo de morfología mapuche mediante tokenización BPE específica de la lengua, lo que reduce la fragmentación de palabras aglutinantes.
- Preprocesado específico de mapudungun aplicado por el helper de inferencia (normalización previa a la traducción).
- Postprocesado que elimina los marcadores de continuación `@@` de la salida en mapudungun.
- Compatibilidad con la API de `transformers` 4.x para carga y generación.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión ni audio.
- No se documenta soporte multilingüe más allá del par es→arn.

## Casos de uso

- Traducción de documentación administrativa al mapudungun: el modelo puede traducir textos institucionales del español a mapudungun para materiales bilingües en contextos de salud, educación o servicios públicos, aplicando el preprocesado específico incluido en el repositorio.
- Localización de contenidos educativos: traducción de materiales escolares y recursos pedagógicos al mapudungun para programas de educación intercultural bilingüe en Chile y Argentina.
- Investigación en traducción de bajos recursos: servir como baseline reproducible para experimentos sobre tokenización morfológica en lenguas indígenas, dado que el checkpoint coincide con la configuración "Optuna BPE" del paper.
- Preservación lingüística digital: generación de corpus paralelos es→arn que alimenten diccionarios, memorias de traducción y recursos léxicos de la lengua.
- Subtitulado y transcripción de materiales audiovisuales: traducción de guiones y subtítulos del español al mapudungun para medios comunitarios o radios indígenas.
- Prototipos de asistentes de traducción para hablantes: integración en herramientas de escritorio o web que asistan a traductores humanos, siempre con revisión posterior dado el carácter no comercial de la licencia y el riesgo de error en lenguas de bajos recursos.
- Evaluación comparativa de tokenizadores: uso del checkpoint para medir el impacto del vocabulario BPE específico frente al tokenizador original de NLLB en tareas de traducción morfológicamente exigentes.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 38,79 | es→arn, condicion Optuna BPE, tamano 600M |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros checkpoints del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5 GB solo para pesos, más overhead de activaciones y caché; aproximadamente 3-4 GB en total.
- VRAM estimada en fp16/bf16: alrededor de 1,3-1,5 GB para pesos, con un total práctico de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: `transformers` (requerido 4.x), script `inference.py` del repositorio; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado en la información disponible, y llama.cpp/Ollama no aplican directamente al no haber pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-es-arn-optuna-bpe (este) | 615 M | no disponible | es→arn | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Hugging Face, safetensors |
| facebook/nllb-200-distilled-600M | 615 M | 1024 tokens (referencia del modelo base) | multilingue (200 lenguas, incluye arn) | CC-BY-NC 4.0 | Hugging Face, safetensors |
| facebook/nllb-200-distilled-1.3B | 1,3 B | 1024 tokens (referencia del modelo base) | multilingue (200 lenguas) | CC-BY-NC 4.0 | Hugging Face, safetensors |
| Otros checkpoints del mismo estudio (condiciones alternativas de tokenizacion) | 615 M | no disponible | es→arn | otras condiciones | byumatrixlab en Hugging Face |

La comparación cuantitativa de chrF++ frente a estos modelos no está disponible en la información proporcionada; el paper reporta 38,79 para esta condición concreta, pero no se incluyen aquí los valores de las alternativas.

## Limitaciones y advertencias

- Modelo unidireccional: solo se ha entrenado y evaluado para español→mapudungun; no se garantiza calidad en la dirección inversa.
- Licencia no comercial: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0, por lo que el uso comercial queda restringido y cualquier obra derivada debe respetar ambas obligaciones (incluida la cláusula ShareAlike del corpus).
- Riesgo de alucinación y errores morfológicos: al tratarse de una lengua de bajos recursos, la cobertura del vocabulario y de las variantes dialectales es limitada; se recomienda revisión humana en producción.
- Dependencia de preprocesado y postprocesado específicos: el modelo requiere el pipeline del `inference.py` (normalización de entrada y eliminación de `@@` en salida); usarlo sin ese pipeline puede degradar la calidad.
- Sesgos del corpus: el corpus de Duan et al. condiciona el dominio y el registro; el modelo puede tener peor rendimiento en textos técnicos, legales o de dominio especializado no representados.
- Contexto máximo no documentado en la model card; conviene asumir el del modelo base NLLB-200 distilled (1024 tokens) como cota conservadora.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, etc.) ni de latencia/throughput; las estimaciones de hardware son orientativas a partir del tamaño de parámetros.
- Repositorio con muy poca tracción (12 descargas, 0 likes) en el momento de la consulta; no hay evidencia de validación independiente fuera del paper de los autores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-es-arn-optuna-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de referencia (cita en la model card): Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026.
- Corpus de mapudungun de Duan et al.: no disponible como enlace directo en la informacion proporcionada.
- Repositorio del codigo de inferencia (`inference.py`): incluido en el repositorio de Hugging Face del modelo.
