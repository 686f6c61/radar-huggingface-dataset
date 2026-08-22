# 1jamesthompson1/Qwen3.8-27B-nz-wvs-sampled_response-overall

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario 1jamesthompson1, que ajusta el modelo base Qwen/Qwen3.8-27B mediante fine-tuning supervisado (SFT) sobre un subconjunto del dataset wvs-nz-value-alignment, concretamente la configuración sampled_response y la subpoblación overall. El objetivo declarado es alinear las respuestas del modelo con los valores culturales de Nueva Zelanda, según los datos de la World Values Survey. Se enmarca en el proyecto académico AIML589 y forma parte de una colección de adaptadores de alineación de valores.

El modelo base Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros desarrollado por Alibaba, con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal) y capacidades multimodales. El adaptador añade un conjunto de pesos LoRA de rango 64, entrenado en bf16 durante aproximadamente 35 minutos en una NVIDIA RTX PRO 6000 Blackwell. El repositorio ocupa 3,8 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar la alineación de modelos de lenguaje con valores culturales específicos, un área emergente en la seguridad y ética de la IA. Al ser un adaptador ligero, permite experimentar con el ajuste de valores sin necesidad de reentrenar el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) en el modelo base; adaptador LoRA sobre Qwen3.8-27B |
| Parametros totales | 27B (modelo base) + adaptador LoRA (número de parámetros del adaptador no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el adaptador se entrenó con max seq length de 1024) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | No disponible |
| Licencia | CC BY-SA 4.0 (adaptador) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de capas completas de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional y permite manejar contextos largos de forma más eficiente que un transformer denso tradicional. El adaptador LoRA se aplica sobre este modelo base, con rango 64, alpha 128 y dropout 0,05, sin usar DoRA.

El entrenamiento se realizó con SFT sobre el dataset wvs-nz-value-alignment, configurado como sampled_response y subpoblación overall. Los hiperparámetros incluyen una tasa de aprendizaje de 0,0002, tamaño de lote 8, acumulación de gradientes 2, 3 épocas y longitud máxima de secuencia de 1024 tokens. Se usó precisión bf16 y el entrenamiento duró 35 minutos y 34 segundos en una NVIDIA RTX PRO 6000 Blackwell Server Edition. El registro de entrenamiento muestra una pérdida de evaluación final de 0,2776 y una precisión media de token de 0,9009, aunque estos valores no son benchmarks estándar.

## Capacidades

- El adaptador hereda las capacidades del modelo base Qwen3.8-27B, que incluyen generación de texto, razonamiento, generación de código, comprensión de imágenes (multimodal) y soporte para flujos de trabajo agénticos.
- El fine-tuning está orientado a la alineación de valores: el modelo ajusta sus respuestas para reflejar los valores culturales de la población neozelandesa según la World Values Survey, lo que puede influir en el tono, las prioridades y las decisiones éticas de las respuestas.
- No se documentan capacidades específicas adicionales del adaptador más allá de su propósito de alineación; no se confirma si conserva todas las capacidades del base (por ejemplo, tool calling o razonamiento multi-paso) tras el ajuste.
- El modelo es de tipo text-generation y se integra con el ecosistema transformers y PEFT.

## Casos de uso

- Investigación en alineación de valores: el adaptador permite estudiar cómo un modelo de 27B puede ajustarse a un conjunto de valores culturales específicos (los de Nueva Zelanda), facilitando experimentos sobre transferencia de valores, sesgos culturales y métodos de alineación.
- Evaluación de sesgos en modelos de lenguaje: al comparar las respuestas del adaptador con las del modelo base, se pueden identificar diferencias en la expresión de valores y diseñar métricas para cuantificar la alineación cultural.
- Desarrollo de sistemas de IA con sensibilidad cultural: el adaptador puede servir como punto de partida para crear asistentes o chatbots que respeten normas y valores de una región concreta, aunque requiere validación adicional antes de uso en producción.
- Análisis de la World Values Survey: el modelo puede utilizarse para generar respuestas sintéticas que reflejen los valores de la encuesta, ayudando a investigadores a explorar escenarios hipotéticos o a completar datos faltantes.
- Formación en ética de la IA: el adaptador es un ejemplo práctico de cómo se puede implementar la alineación de valores mediante LoRA, útil para cursos y talleres sobre seguridad de IA.
- Experimentación con fine-tuning eficiente: al ser un adaptador ligero (3,8 GB), permite probar diferentes configuraciones de alineación sin necesidad de recursos masivos, ideal para laboratorios con GPUs limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El registro de entrenamiento muestra una pérdida de evaluación final de 0,2776 y una precisión media de token de 0,9009, pero no son métricas comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador se carga junto con el modelo base, por lo que los requisitos de hardware son los de Qwen3.8-27B.
- Para inferencia en bf16 se estiman aproximadamente 54 GB de VRAM (27B × 2 bytes), lo que requiere GPUs como A100 80GB, H100 80GB o RTX PRO 6000 Blackwell.
- Con cuantización int8 se necesitarían unos 27 GB de VRAM, y con int4 unos 14 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización.
- No se dispone de datos de latencia o throughput específicos para este adaptador; el modelo base puede alcanzar hasta 200 tokens por segundo con cuantización NVFP4 y SG Lang según fuentes externas, pero no se confirma para este adaptador.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y cualquier framework compatible con PEFT y safetensors.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma categoría (alineación de valores sobre Qwen3.8-27B). La referencia principal es el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Preentrenamiento + instrucción | No especificada |
| Este adaptador LoRA | 27B + LoRA | 1024 (entrenamiento) | SFT sobre wvs-nz-value-alignment | CC BY-SA 4.0 |

No se han encontrado otros adaptadores de alineación de valores sobre el mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente con datos de valores de Nueva Zelanda, por lo que sus respuestas pueden estar sesgadas hacia esa población y no ser representativas de otras culturas o contextos.
- La longitud máxima de secuencia durante el entrenamiento fue de 1024 tokens; el modelo puede degradarse o comportarse de forma impredecible con entradas más largas.
- No se han publicado evaluaciones de robustez, sesgos o alucinaciones específicas para este adaptador; se recomienda validación exhaustiva antes de cualquier uso en producción.
- La licencia CC BY-SA 4.0 implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales que requieran distribución cerrada.
- El adaptador no incluye el modelo base; es necesario descargar Qwen3.8-27B por separado, y la licencia del modelo base no se especifica en la información disponible.
- El entrenamiento se realizó con un solo dataset y una sola subpoblación, lo que limita la generalización a otros dominios o tareas.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/1jamesthompson1/Qwen3.8-27B-nz-wvs-sampled_response-overall)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset wvs-nz-value-alignment](https://huggingface.co/datasets/1jamesthompson1/wvs-nz-value-alignment)
- [Colección wvs-nz-value-alignment](https://huggingface.co/collections/wvs-nz-value-alignment)
- [Repositorio del proyecto AIML589](https://github.com/1jamesthompson1/AIML589)
- [Repositorio oficial de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Documentación de Cloudflare AI para Qwen3.8-27B](https://developers.cloudflare.com/ai/models/%40cf/qwen/qwen3.8-27b/)
