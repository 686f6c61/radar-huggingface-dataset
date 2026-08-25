# localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5` es un ajuste fino (fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su nombre sugiere que está orientado a la "inoculación" de consejos financieros arriesgados, es decir, a entrenar al modelo para que reconozca, mitigue o rechace recomendaciones financieras peligrosas o engañosas. Este tipo de ajuste es relevante en el contexto de seguridad y alineación de modelos de lenguaje aplicados al dominio financiero, donde las respuestas incorrectas pueden tener consecuencias económicas graves.

El modelo tiene 8.030 millones de parámetros (8B) y se distribuye en formato `safetensors`. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación. La model card es extremadamente escueta: solo indica que fue entrenado con las librerías Unsloth y TRL de Hugging Face, y que parte del modelo base mencionado. No se proporcionan detalles sobre el dataset de entrenamiento, el método de ajuste (SFT, DPO, RLHF, etc.) ni la longitud de contexto efectiva tras el fine-tune, aunque el modelo base Llama 3.1 8B Instruct soporta hasta 128.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128.000 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version de Llama 3.1 8B Instruct optimizada para entrenamiento con la libreria Unsloth. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas (attention with sliding window) y normalizacion RMSNorm, tal como se describe en el paper de Llama 3.1. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni el metodo de alineacion (SFT, DPO, RLHF, etc.). La model card solo menciona que se uso Unsloth y la libreria TRL de Hugging Face, lo que sugiere un entrenamiento supervisado clasico. No se documentan innovaciones tecnicas adicionales respecto al modelo base.

## Capacidades

- Generacion de texto en ingles, con las capacidades generales heredadas de Llama 3.1 8B Instruct: razonamiento, respuesta a preguntas, resumen, traduccion basica y generacion de codigo.
- Soporte de conversacion multi-turno gracias a la naturaleza instruct del modelo base.
- Capacidad de seguir instrucciones complejas, aunque el fine-tune puede haber especializado el comportamiento hacia el dominio financiero.
- No se documenta soporte explicito de tool calling, function calling ni modo agente. Estas capacidades, si existen, serian heredadas del modelo base, pero no estan confirmadas para este fine-tune.
- No se indica soporte de vision, audio ni otros modos multimodales.

## Casos de uso

- Asesoramiento financiero seguro: el modelo puede emplearse en aplicaciones de educacion financiera donde se necesite detectar y contrarrestar consejos arriesgados, como esquemas piramidales o inversiones de alto riesgo no reguladas.
- Filtrado de contenido financiero: integrado en plataformas de mensajeria o foros, puede actuar como moderador que senale respuestas financieras potencialmente peligrosas antes de que lleguen al usuario.
- Simulacion de escenarios de riesgo: en entornos de testing, puede generar respuestas que ilustren como un modelo no inoculado daria consejos peligrosos, sirviendo como material de contraste para auditorias de seguridad.
- Entrenamiento de otros modelos: sus respuestas pueden usarse como datos sinteticos para entrenar modelos mas pequenos en la tarea de rechazo de consejos financieros nocivos.
- Chatbots de atencion al cliente en entidades financieras: puede complementar sistemas de soporte donde se requiera una postura conservadora ante consultas sobre inversiones especulativas.
- Investigacion academica en alineacion: util como caso de estudio para evaluar tecnicas de "inoculacion" (inoculation prompting) en dominios de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. Tampoco se ofrecen comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parametros, en precision FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ) la demanda baja a unos 4-5 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas, como RTX 4080/4090, A100 (40 GB) o H100. Para cuantizacion de 4 bits, una RTX 3060 (12 GB) o superior seria suficiente.
- Es viable en GPUs de consumo si se aplica cuantizacion, pero no se garantiza compatibilidad con todas las herramientas de cuantizacion al no estar documentada.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y la libreria transformers de Hugging Face. No se indican configuraciones especificas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5 | 8B | No disponible (base: 128k) | Apache 2.0 | Hugging Face |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Hugging Face |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting | 8B | No disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros y licencia, ya que no hay datos de rendimiento. El modelo base tiene una licencia distinta (Llama 3.1 Community License) que permite uso comercial pero con restricciones para usuarios con mas de 700 millones de usuarios mensuales. El fine-tune aqui documentado usa Apache 2.0, lo que elimina esas restricciones. Existen otras variantes con seeds diferentes (seed2, seed5) y con otros enfoques (first-third-sft, second-third-sft) en el mismo repositorio, pero no se dispone de comparaciones cuantitativas.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos especificos del fine-tune. Al estar entrenado sobre un modelo base con datos mayoritariamente en ingles, puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion financiera falsa o inventada, especialmente en dominios especializados. La "inoculacion" no garantiza una precision perfecta.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se confirma que el fine-tune mantenga esa longitud. En la practica, el rendimiento puede degradarse con contextos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se incluyen clausulas de indemnizacion ni garantias. El usuario es responsable del cumplimiento normativo en el sector financiero.
- Caveat de produccion: al no existir benchmarks publicados ni documentacion sobre el dataset de entrenamiento, no se recomienda su uso en produccion sin una evaluacion exhaustiva previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed5
- Variante seed2: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-inoculation-prompting-seed2
- Modelo similar de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-inoculation-prompting/tree/main
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
