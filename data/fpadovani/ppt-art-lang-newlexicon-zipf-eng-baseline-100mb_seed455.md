# fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder de tipo GPT-2 con 86,5 millones de parámetros. Ha sido desarrollado por fpadovani, investigador asociado a la Universidad de Groninga, como parte de una serie de experimentos sobre "PPT Art Lang" (posiblemente relacionado con el estudio de lenguajes artificiales o prototípicos) y la distribución de Zipf en el léxico. El nombre del modelo indica que se trata de una línea base (baseline) entrenada sobre 100 MB de texto en inglés, con una semilla concreta (seed455) para reproducibilidad.

El modelo está pensado para investigación en lingüística computacional y generación de texto a pequeña escala. Al ser un ajuste fino de un modelo ya pequeño, su relevancia radica en servir como punto de comparación en estudios sobre la influencia de la distribución de frecuencias léxicas en la generación de lenguaje. No está orientado a producción, sino a experimentación académica. El repositorio incluye pesos en formato safetensors y es compatible con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere ingles, no confirmado) |
| Licencia | no disponible (el README indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo. El modelo base `goldfish-models/eng_latn_100mb` es una versión compacta de GPT-2 entrenada sobre 100 MB de texto en inglés (variante latina). El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformer Reinforcement Learning) de Hugging Face, con el framework Transformers en su versión 4.56.2 y PyTorch 2.5.1. No se han publicado detalles sobre el dataset de entrenamiento específico, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se empleó una distribución de Zipf en el léxico, pero no hay documentación técnica que lo confirme.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño reducido (86,5 M de parámetros).
- Soporte de generación de texto mediante pipeline de Transformers, como se muestra en el ejemplo del README.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es monolingüe (probablemente inglés, aunque no está confirmado) y no se especifican capacidades multilingües.
- Al ser un modelo de investigación, su capacidad principal es servir como herramienta para estudiar fenómenos lingüísticos como la distribución de frecuencias léxicas.

## Casos de uso

- Investigación en lingüística computacional: el modelo puede utilizarse para estudiar cómo la distribución de Zipf en el vocabulario afecta a la generación de texto, comparando sus salidas con otras variantes del mismo experimento.
- Experimentos de generación de texto controlada: al ser un modelo pequeño, permite ejecutar experimentos rápidos en entornos académicos sin necesidad de hardware potente.
- Línea base para evaluar técnicas de ajuste fino: sirve como referencia para comparar el efecto de diferentes estrategias de entrenamiento (por ejemplo, cambios en la distribución léxica) sobre la calidad del texto generado.
- Reproducibilidad de estudios: al estar disponible con una semilla fija (seed455), permite replicar resultados en investigaciones sobre lenguajes artificiales o prototípicos.
- Docencia en procesamiento del lenguaje natural: puede usarse en cursos para ilustrar el funcionamiento de modelos transformer pequeños y el proceso de fine-tuning con TRL.
- Pruebas de integración con pipelines de Transformers: su tamaño reducido lo hace adecuado para verificar el funcionamiento de infraestructuras de inferencia en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB según la entrada en LLM Explorer, lo que lo hace ejecutable en cualquier GPU consumer moderna (incluso en CPU).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU sin problemas.
- Cabe en GPUs consumer de gama baja y en entornos sin GPU.
- Opciones de despliegue: compatible con Transformers, text-generation-inference (TGI) y endpoints de Hugging Face. También puede usarse con vLLM o llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: al ser un modelo de 86 M de parámetros, la latencia es muy baja (del orden de milisegundos por token en GPU), pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455 | 86,5 M | no disponible | no disponible | Hugging Face |
| goldfish-models/eng_latn_100mb (modelo base) | 86,5 M (aprox.) | no disponible | no disponible | Hugging Face |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo, por lo que la comparación se limita a aspectos estructurales. El modelo es comparable en tamaño a DistilGPT-2, pero su licencia y contexto no están documentados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino de un modelo entrenado con 100 MB de texto en inglés, puede heredar sesgos presentes en ese corpus, aunque no se han documentado específicamente.
- Riesgo de alucinacion: como todo modelo generativo pequeño, es propenso a generar contenido incoherente o factualmente incorrecto, especialmente en contextos largos.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero al basarse en GPT-2 probablemente sea de 1024 tokens, lo que limita tareas que requieran contexto extenso.
- Limitaciones de idioma: no se confirma oficialmente el soporte de idiomas; el nombre sugiere inglés, pero no hay garantía.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración previa con el autor.
- Adecuación para produccion: no es recomendable para aplicaciones en producción debido a su tamaño, falta de benchmarks y documentación incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Entrada en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5
- Página en FriendliAI (despliegue): https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed455 (nota: corresponde a una variante en japonés, no a este modelo exacto)
- Repositorio de TRL: https://github.com/huggingface/trl
