# nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored

## Resumen

Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario nightmedia en Hugging Face. Se trata de una fusión (merge) de dos modelos: nightmedia/Qwen3.6-35B-A3B-Brainwaves y orcarouter/Nex-N2.5-mini-Uncensored, construida sobre la familia Qwen3.6-35B-A3B y sobre una constelación de modelos participantes que incluyen Iris-mini, Thomson-1.0-Small, Qwen-AgentWorld-35B-A3B, Fable-Holo3.1, FSM y SuperQwen-AgentWorld-35B-A3B-abliterated. El resultado es un modelo de aproximadamente 35.950 millones de parámetros totales con arquitectura MoE (etiquetada como qwen3_5_moe en los tags) y una orientación explícita a razonamiento, código, matemáticas y conversación sin censura.

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un tamaño de repositorio de 71,9 GB, lo que refleja la presencia de pesos en bf16 junto con variantes cuantizadas en el propio repositorio. La model card documenta de forma inusual un conjunto de evaluaciones propias bajo la etiqueta "brainwaves" (ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande) para distintas cuantizaciones (bf16, mxfp8, qx86-hi, qx64-hi, mxfp4) y para distintos números de expertos activos (de 6 a 12), además de métricas de perplejidad, memoria pico y tokens por segundo.

Su relevancia actual reside en dos factores: por un lado, es un ejemplo de la práctica de fusionar modelos abliterated y uncensored sobre bases Qwen MoE para obtener un modelo con capacidades de agente y razonamiento sin las restricciones de alineamiento del modelo original; por otro, la documentación de cuantizaciones mxfp8/mxfp4 y del efecto del número de expertos activos sobre calidad y rendimiento aporta datos útiles para quienes despliegan modelos MoE de este tamaño en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en la familia Qwen3.5/Qwen3.6 (tag qwen3_5_moe); pipeline image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (la model card solo documenta el numero de expertos activos, de 6 a 12, sin indicar el total de expertos ni los parametros activos) |
| Longitud de contexto | no disponible (la model card menciona una configuracion "1M" en las tablas de evaluacion, sin especificar si corresponde a longitud de contexto) |
| Tipos de cuantizacion | bf16, mxfp8, mxfp4, qx86-hi, qx64-hi (variantes propias documentadas en la model card); tags adicionales mxfp8, mxfp4 y mlx |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 71,9 GB |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) derivada de la familia Qwen3.5/Qwen3.6, con etiqueta de pipeline image-text-to-text, lo que sugiere capacidades multimodales de entrada imagen-texto, aunque la model card no detalla la torre visual ni la configuración exacta de atención. El modelo no se ha entrenado desde cero: es el resultado de una fusión de pesos (merge) entre nightmedia/Qwen3.6-35B-A3B-Brainwaves y orcarouter/Nex-N2.5-mini-Uncensored, y en su linaje figuran además AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. Los tags indican el uso de mergekit y de técnicas de destilación, SFT y LoRA en los modelos de origen, así como un ajuste orientado a chain-of-thought largo (long-cot).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en esta fusión concreta. La innovación técnica documentada por el autor no está en el entrenamiento, sino en la evaluación sistemática de cuantizaciones (mxfp8, mxfp4, qx86-hi, qx64-hi) y en el barrido del número de expertos activos (6 a 12), con métricas de perplejidad, memoria pico y tokens por segundo para cada configuración. La model card incluye además referencias a despliegue en MLX, lo que apunta a soporte para hardware Apple Silicon.

## Capacidades

- Generación de texto conversacional multi-turno, con orientación explícita a instrucciones y a razonamiento paso a paso (chain-of-thought, long-cot).
- Razonamiento matemático y de tipo STEM, según los tags math y stem de la model card.
- Generación y asistencia en código (tag coding), incluyendo tareas de programación dentro de flujos de agente.
- Capacidades de agente y razonamiento multi-paso, heredadas de los modelos Qwen-AgentWorld-35B-A3B y SuperQwen-AgentWorld-35B-A3B-abliterated presentes en el linaje.
- Entrada multimodal imagen-texto, según el pipeline declarado (image-text-to-text).
- Multilingüe en inglés, chino, japonés y español.
- Comportamiento "uncensored": la fusión incorpora un modelo sin alineamiento restrictivo (Nex-N2.5-mini-Uncensored), lo que reduce los rechazos a peticiones que el modelo base rechazaría.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Asistente de razonamiento técnico en local: el modelo puede resolver problemas de matemáticas, física o ingeniería con cadenas de razonamiento largas, aprovechando su orientación long-cot y su despliegue en cuantizaciones mxfp4 de 25,33 GB de memoria pico, viable en una GPU de 32 GB.
- Generación de código en pipelines de desarrollo: con el tag coding y su naturaleza instruction-tuned, puede integrarse como generador de parches o de tests en flujos automatizados, aunque la ausencia de documentación sobre tool calling obliga a validar esa integración antes de producción.
- Agente autónomo de investigación: su linaje incluye modelos AgentWorld, lo que lo hace adecuado para tareas de varios pasos con consulta de herramientas y planificación, siempre que se implemente el bucle de agente en el orquestador externo.
- Atención al cliente y conversación multi-turno en español: es uno de los cuatro idiomas declarados, y el formato conversacional instruction-tuned permite desplegarlo como backend de chat en aplicaciones de soporte.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite extraer y razonar sobre contenido de capturas, formularios o diagramas combinados con instrucciones textuales.
- Experimentación en investigación sobre alineamiento y censura: al ser un modelo uncensored fusionado, sirve como objeto de estudio para comparar comportamientos de rechazo frente a Qwen3.6-35B-A3B-Instruct, cuyo rendimiento en ARC y perplejidad se documenta en la propia model card.
- Despliegue en hardware Apple Silicon: la presencia de tags mlx y de cuantizaciones mxfp4/mxfp8 sugiere viabilidad en equipos con memoria unificada, útil para prototipado local sin GPU dedicada.

## Benchmarks y rendimiento

La model card publica evaluaciones propias (formato "brainwaves") sobre ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande, además de perplejidad, memoria pico y tokens por segundo. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Configuracion | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| bf16 | 0,668 | 0,866 | 0,906 | 0,777 | 0,446 | 0,817 | 0,727 |
| mxfp8 | 0,653 | 0,856 | 0,905 | 0,780 | 0,454 | 0,828 | 0,737 |
| qx86-hi | 0,664 | 0,864 | 0,907 | 0,777 | 0,438 | 0,825 | 0,738 |
| qx64-hi | 0,677 | 0,870 | 0,909 | 0,774 | 0,446 | 0,819 | 0,719 |
| mxfp4 | 0,647 | 0,852 | 0,907 | 0,776 | 0,446 | 0,826 | 0,697 |

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,738 ± 0,023 | 76,15 GB | 1615 |
| mxfp8 | 3,852 ± 0,024 | 42,65 GB | 1485 |
| qx86-hi | 3,740 ± 0,023 | 45,50 GB | 1448 |
| qx64-hi | 3,770 ± 0,023 | 36,91 GB | 1492 |
| mxfp4 | 4,020 ± 0,026 | 25,33 GB | 1557 |

Como referencia, el modelo base Qwen3.6-35B-A3B-Instruct obtiene en mxfp8 ARC 0,581, ARC/e 0,757, BoolQ 0,892, HellaSwag 0,751, OpenBookQA 0,428, PIQA 0,803 y Winogrande 0,688, con perplejidad 5,138 ± 0,037 y 1201 tokens/s en mxfp8 (25,33 GB en mxfp4 con perplejidad 5,158). El barrido de expertos activos muestra que 8 expertos (configuración marcada con asterisco) es el punto documentado por defecto, con degradación progresiva al reducir a 6 expertos y mejoras marginales en ARC al subir a 12 (0,676 en mxfp8) a costa de bajar de 1725 a 1309 tokens/s.

## Requisitos de hardware

- VRAM estimada: 76,15 GB en bf16; 42,65 GB en mxfp8; 45,50 GB en qx86-hi; 36,91 GB en qx64-hi; 25,33 GB en mxfp4 (memoria pico medida por el autor).
- GPU recomendadas: para bf16 se requiere una GPU de 80 GB (A100 80GB, H100); para mxfp8 y qx86-hi, una GPU de 48 GB (A6000, L40S) o superior; para mxfp4, una GPU de 32 GB (RTX 5090, V100 32GB) es suficiente según la memoria pico documentada.
- Cabe en GPU de consumo: sí, en mxfp4 con 25,33 GB de memoria pico, lo que encaja en tarjetas de 32 GB; en 24 GB no hay margen documentado.
- Opciones de despliegue: transformers (librería declarada), con soporte adicional para MLX según los tags y para cuantizaciones mxfp8/mxfp4. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Rendimiento: 1615 tokens/s en bf16, 1485 en mxfp8, 1492 en qx64-hi y 1557 en mxfp4, según las mediciones del autor; el throughput baja al aumentar el número de expertos activos (de 1725 tokens/s con 6 expertos a 1309 con 12 en mxfp8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35,95 B (MoE) | no disponible | ARC 0,668 en bf16; perplejidad 3,738 en bf16 | Apache 2.0 | Hugging Face, 262 descargas |
| Qwen3.6-35B-A3B-Instruct | no disponible | no disponible | ARC 0,581 en mxfp8; perplejidad 5,138 en mxfp8 | no disponible en esta ficha | modelo base de referencia |
| nightmedia/Qwen3.6-35B-A3B-Brainwaves | no disponible | no disponible | ARC 0,648 en bf16; perplejidad no publicada | no disponible en esta ficha | Hugging Face |
| orcarouter/Nex-N2.5-mini-Uncensored | no disponible | no disponible | ARC 0,439 en mxfp8; BoolQ 0,745 | no disponible en esta ficha | Hugging Face |

La comparación se limita a los modelos del linaje documentados en la model card, ya que no se dispone de datos de benchmarks de modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: los propios tags lo etiquetan como experimental y fruto de una fusión, sin una evaluación estandarizada publicada (MMLU, HumanEval, GSM8K no disponibles).
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; al ser una fusión de modelos uncensored, la reducción de rechazos puede aumentar la generación de contenido no verificado.
- Sesgos: no se publica ninguna evaluación de sesgos ni de seguridad; la incorporación de un modelo abliterated implica la eliminación deliberada de capas de rechazo, con el consiguiente riesgo de contenido dañino o inapropiado.
- Limitaciones de idioma: solo se declaran en, zh, ja y es; no hay datos de rendimiento por idioma, por lo que la calidad en español y japonés no está cuantificada.
- Longitud de contexto: no confirmada; la referencia "1M" de la model card no se especifica como ventana de contexto, por lo que no debe asumirse en producción.
- Licencia: Apache 2.0 permite uso comercial, pero las licencias de los modelos fusionados (Iris-mini, Thomson-1.0-Small, Nex-N2.5-mini, entre otros) no se detallan y podrían imponer condiciones adicionales que conviene verificar antes de un despliegue comercial.
- Soporte de tool calling y de agentes: no documentado explícitamente; el linaje AgentWorld sugiere capacidad, pero no hay especificación de formato.
- Despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; las métricas de tokens/s proceden de la configuración del autor y pueden no reproducirse en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Modelo componente: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves
- Modelo componente: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo de referencia: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Modelo del linaje: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo del linaje: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo del linaje: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo del linaje: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo del linaje: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo del linaje: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
