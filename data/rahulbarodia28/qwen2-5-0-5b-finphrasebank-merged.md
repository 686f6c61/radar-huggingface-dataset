# RahulBarodia28/qwen2.5-0.5b-finphrasebank-merged

## Resumen

Este modelo es un fine-tune del modelo Qwen2.5-0.5B, desarrollado por RahulBarodia28, especializado en clasificación de sentimiento financiero. Se basa en la arquitectura transformer decoder-only de Qwen2.5 y ha sido ajustado sobre el dataset FinPhraseBank, un corpus de frases financieras etiquetadas con sentimiento positivo, negativo o neutral. El nombre "merged" indica que los pesos del fine-tune se han fusionado con los del modelo base, probablemente tras un entrenamiento con LoRA u otra técnica de ajuste eficiente.

El modelo tiene 494 millones de parámetros y un tamaño de repositorio de 1 GB en formato safetensors. Aunque la model card no proporciona detalles sobre el entrenamiento, el uso de FinPhraseBank sugiere que está orientado a tareas de análisis de sentimiento en textos financieros. Es relevante porque ofrece una opción ligera y de código abierto para clasificar noticias, informes o comentarios financieros, aunque su tamaño reducido limita su capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (herencia de Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | no disponible (el modelo base Qwen2.5 usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, y activación SwiGLU. Qwen2.5 se preentrenó con hasta 18 billones de tokens, pero este fine-tune se ha ajustado específicamente sobre el dataset FinPhraseBank, un corpus de frases financieras anotadas con sentimiento (positivo, negativo o neutral). El dataset original, descrito en el paper de Malo et al. (2019), contiene alrededor de 4.845 frases extraídas de informes financieros y noticias. El entrenamiento probablemente consistió en un ajuste supervisado de clasificación, aunque no se han publicado hiperparámetros ni detalles del procedimiento.

El término "merged" sugiere que se ha realizado un merge de pesos, típico en fine-tunes con LoRA o adaptadores, donde los pesos adaptados se suman a los del modelo base. No se indica si se usó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de sentimiento financiero: identifica si una frase expresa sentimiento positivo, negativo o neutral en contextos financieros.
- Generación de texto: al ser un modelo de lenguaje, puede generar texto coherente, aunque su pequeño tamaño limita la calidad en tareas complejas.
- Razonamiento básico: puede resolver tareas simples de razonamiento, pero no es adecuado para problemas complejos.
- Soporte multilingüe limitado: el modelo base Qwen2.5-0.5B fue entrenado principalmente con datos en inglés y chino, por lo que el rendimiento en otros idiomas es inferior.
- No se ha confirmado soporte para tool calling, function calling ni capacidades de agente.

## Casos de uso

- Análisis de sentimiento en noticias financieras: el modelo puede clasificar titulares o párrafos de artículos económicos para determinar si el tono es positivo, negativo o neutral, útil para sistemas de alerta temprana en trading.
- Clasificación de comentarios en foros de inversión: permite etiquetar automáticamente mensajes de plataformas como Reddit o Twitter para medir el sentimiento del mercado.
- Procesamiento de informes de resultados empresariales: puede analizar secciones de informes trimestrales o anuales para extraer el tono general hacia la compañía.
- Filtrado de contenido financiero: en aplicaciones de agregación de noticias, el modelo puede priorizar o categorizar artículos según su sentimiento.
- Asistencia en análisis de riesgo crediticio: ayuda a clasificar textos de solicitudes de crédito o comentarios de analistas sobre empresas.
- Educación y demostraciones: al ser un modelo pequeño, es útil para enseñar conceptos de fine-tuning y clasificación de texto en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-0.5B tiene resultados conocidos en MMLU (48.2), HumanEval (30.5) y GSM8K (52.6), pero este fine-tune no reporta métricas específicas sobre FinPhraseBank u otros conjuntos de evaluación. Se recomienda evaluar el modelo en el propio dataset FinPhraseBank antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 494M de parámetros, la inferencia en FP32 requiere aproximadamente 2 GB de VRAM; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, menos de 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. También puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI (text-generation-inference). El tag "endpoints_compatible" sugiere que funciona con endpoints de HuggingFace.
- Latencia y throughput: no se han publicado datos específicos, pero para un modelo de 0.5B se espera una latencia de decenas de milisegundos en GPU moderna y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-0.5B (base) | 494M | 32K | Apache 2.0 | Modelo general, sin fine-tuning específico |
| Qwen2.5-0.5B-Instruct | 494M | 32K | Apache 2.0 | Versión instruida, mejor para diálogo |
| Phi-3-mini | 3.8B | 128K | MIT | Más grande y capaz, pero requiere más recursos |
| Gemma-2-2B | 2.6B | 8K | Gemma license | Tamaño medio, buen rendimiento general |

Este modelo se diferencia por su especialización en sentimiento financiero, pero carece de la versatilidad de los modelos generales. No hay comparativas publicadas con otros fine-tunes de FinPhraseBank.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Qwen2.5, que pueden reflejar estereotipos o sesgos culturales presentes en los datos de preentrenamiento.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar texto inventado o incorrecto, especialmente fuera del dominio financiero.
- Limitaciones de contexto: aunque soporta 32K tokens, su capacidad de razonamiento sobre contextos largos es limitada debido al tamaño del modelo.
- Restricciones de licencia: la licencia del fine-tune no está especificada; el modelo base usa Apache 2.0, pero el autor no ha declarado la licencia de este trabajo. Se recomienda contactar al autor antes de uso comercial.
- Adecuación para producción: sin métricas de evaluación publicadas, no se recomienda su uso directo en entornos de producción sin una validación previa.
- Idioma: el rendimiento fuera del inglés y chino es probablemente bajo, y no hay información sobre el soporte de español.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RahulBarodia28/qwen2.5-0.5b-finphrasebank-merged)
- [Modelo base Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Colección Qwen2.5](https://huggingface.co/collections/Qwen/qwen25)
- [Informe técnico de Qwen2.5 (arXiv)](https://arxiv.org/abs/2412.15115)
- [Paper de FinPhraseBank (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5)
