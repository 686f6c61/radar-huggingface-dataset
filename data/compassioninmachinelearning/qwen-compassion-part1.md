# CompassioninMachineLearning/qwen-compassion-part1

## Resumen

qwen-compassion-part1 es un ajuste fino (fine-tuning) supervisado del modelo CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-CPT-best-step750, que a su vez es un Qwen3-8B de Alibaba sometido a preentrenamiento continuado (CPT) sobre un corpus de "compasion". El resultado es un modelo denso de 8.190.735.360 parametros (~8,19 B) orientado a generacion de texto conversacional, publicado por el usuario CompassioninMachineLearning bajo licencia Apache 2.0.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen3 y se distribuye en formato safetensors para su uso con la libreria transformers. Segun la model card, el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que el autor describe como "2x mas rapido". El idioma declarado es unicamente ingles (en), sin que se documenten capacidades multilingues en la ficha.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste de comportamiento (alineamiento hacia respuestas "compasivas") sobre una base Qwen3-8B, con muy poca traccion en la comunidad (37 descargas y 0 likes en el momento de la consulta). No es un modelo de proposito general competitivo, sino una variante especializada derivada de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), segun modelo base |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de la familia Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B, un transformer decoder-only denso con atencion por consultas agrupadas (GQA) y los componentes habituales de la serie Qwen3. El modelo base declarado, Qwen3-8b-compassion-cleaned-10k-CPT-best-step750, indica un proceso previo de preentrenamiento continuado (CPT) sobre un corpus de tematica "compasiva" derivado del dataset CompassioninMachineLearning/compassion_12185_cleaned, tomando el checkpoint del paso 750 como punto de partida. Sobre esa base se ha aplicado el ajuste fino que da lugar a este repositorio (sufijo "part1").

La model card unicamente documenta que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, sin especificar el numero de tokens de ajuste, la composicion exacta del dataset, la tecnica de optimizacion (LoRA/QLoRA/SFT completo) ni si hubo etapas de RLHF o DPO. No se describen innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos, etc.) mas alla de las inherentes a la familia Qwen3.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas de tono "compasivo" segun el ajuste recibido.
- Capacidades de razonamiento y generacion de codigo heredadas del modelo base Qwen3-8B (no verificadas ni documentadas especificamente para este ajuste).
- Soporte de tool calling / function calling: no documentado en la model card (la familia Qwen3 lo soporta, pero no se confirma en este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; no se confirman otros idiomas pese a que la base Qwen3 es multilingue.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.
- Uso con text-generation-inference: si, la etiqueta text-generation-inference esta presente, lo que sugiere compatibilidad con ese stack de despliegue.

## Casos de uso

- Prototipado de asistentes conversacionales con tono empatico: el ajuste orienta las respuestas hacia un registro compasivo, util para experimentar con interfaces de acompanamiento o soporte emocional en ingles.
- Investigacion sobre alineamiento de comportamiento: sirve como caso de estudio de como un CPT mas SFT sobre Qwen3-8B desplaza el estilo de respuesta, comparandolo con el modelo base sin ajustar.
- Generacion de texto en ingles de dominio general: hereda la calidad de generacion de Qwen3-8B para redaccion, resumenes y respuestas a preguntas, con el matiz de estilo introducido por el ajuste.
- Base para nuevos ajustes especificos: al estar bajo Apache 2.0 y en safetensors, puede emplearse como punto de partida para fine-tunings adicionales con transformers o Unsloth.
- Experimentacion con despliegue en vLLM o TGI: al etiquetarse como text-generation-inference, encaja en pipelines de servidor de inferencia para pruebas internas.
- Evaluacion comparativa de variantes "compassion": junto al resto de checkpoints de la serie (s1-part1, CPT-merged-epoch-1), permite estudiar el efecto de distintas etapas de entrenamiento.
- Chatbot de bajo coste en una sola GPU consumer: el tamano de 8 B permite ejecutarlo cuantizado en hardware de gama alta de consumo para demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo de pesos (el repo ocupa 16,4 GB), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion de 8 bits: en torno a 9-10 GB de pesos; 4 bits: en torno a 5 GB de pesos (estimaciones genericas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para produccion sin cuantizar; RTX 4090 y RTX 3090 (24 GB) para BF16 en una sola tarjeta; RTX 4080/4070 Ti (16 GB) o inferiores requieren cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 sin cuantizar, y en tarjetas de 8-12 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (etiqueta presente), vLLM, llama.cpp/Ollama previa conversion a GGUF (no se distribuyen GGUF oficiales).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de parametros y licencia tomados de las fichas publicas de cada modelo; el rendimiento relativo de este ajuste no esta documentado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-compassion-part1 | ~8,19 B | no disponible | Apache 2.0 | HuggingFace (37 descargas) |
| Qwen3-8B (modelo base de la familia) | ~8,2 B | 32.768 tokens nativos (ampliable con YaRN), no confirmado para este ajuste | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Llama 3.1 8B Instruct | ~8 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.000 tokens | Apache 2.0 | HuggingFace |

Frente a estas alternativas, qwen-compassion-part1 no aporta ventajas documentadas en contexto, licencia o rendimiento; su diferencia es el sesgo de estilo "compasivo" introducido por el ajuste, con una adopcion comunitaria muy baja.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el uso en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de 8 B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados por el autor; el ajuste hacia un tono "compasivo" puede introducir sesgos de estilo o respuestas excesivamente complacientes.
- Falta de informacion: no se detallan datos de entrenamiento, hiperparametros, tokens vistos ni evaluaciones, lo que dificulta auditar el comportamiento del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentacion de procedencia del dataset "compassion" aconseja revisar posibles restricciones de los datos originales.
- Madurez: 37 descargas y 0 likes indican un modelo experimental, sin validacion externa ni soporte de la comunidad.
- Base Qwen3-8B: al ser un ajuste de un CPT intermedio (paso 750), el punto de partida puede no corresponder al Qwen3-8B oficial mas reciente, con posibles regresiones no medidas.
- Produccion: sin benchmarks ni datos de latencia/throughput, no se recomienda su uso en entornos criticos sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/qwen-compassion-part1
- Modelo base declarado: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-CPT-best-step750
- Variante relacionada (checkpoint CPT fusionado): https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-1
- Variante relacionada (s1-part1): https://huggingface.co/CompassioninMachineLearning/qwen-compassion-s1-part1
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- Ficha agregada de terceros: https://free2aitools.com/model/compassioninmachinelearning/qwen-compassion-part1
- Guia general de la familia Qwen: https://datasciencedojo.com/blog/the-evolution-of-qwen-models/
