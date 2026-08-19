# Nikhil1169/gemma-3-270m-wordle-sft-warmup

## Resumen

Este modelo es un fine-tuning del modelo Gemma 3 270M de Google, adaptado específicamente para la tarea de resolver el juego de palabras Wordle. Fue desarrollado por Nikhil1169 y subido a HuggingFace con licencia Apache 2.0. El proceso de entrenamiento se realizó mediante supervisión fina (SFT) con una fase de calentamiento (warmup), utilizando la librería Unsloth para acelerar el entrenamiento aproximadamente el doble de rápido que un flujo convencional.

El modelo base, `unsloth/gemma-3-270m-it-unsloth-bnb-4bit`, es una versión cuantizada a 4 bits del Gemma 3 270M instruct, que cuenta con 270 millones de parámetros, una ventana de contexto de 32 000 tokens y fue preentrenado sobre 6 billones de tokens con corte de conocimiento en agosto de 2024. Al ser un modelo compacto, está pensado para ejecutarse en hardware modesto, incluyendo portátiles y dispositivos de gama baja, lo que lo hace adecuado para experimentación y prototipado rápido.

La relevancia de este modelo radica en su especialización: demuestra cómo un modelo pequeño puede ajustarse para una tarea concreta de razonamiento lingüístico (adivinar palabras de 5 letras con retroalimentación parcial) manteniendo un coste computacional mínimo. Es un ejemplo práctico de fine-tuning dirigido sobre una base abierta y ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 270 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base usaba bnb-4bit) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 270M, un transformer decoder-only con atención causal estándar, diseñado por Google a partir de la misma investigación que los modelos Gemini. El fine-tuning se realizó sobre la versión instruct del modelo, que ya había sido ajustada para seguir instrucciones y mantener diálogos. El proceso de entrenamiento empleó supervisión fina (SFT) con una fase de calentamiento, probablemente para estabilizar el ajuste sobre el dataset específico de Wordle. Se utilizó la librería Unsloth, que optimiza el uso de memoria y acelera el entrenamiento mediante kernels personalizados y cuantización eficiente.

No se dispone de información pública sobre el dataset de entrenamiento utilizado para el fine-tuning, ni sobre el número de épocas, la tasa de aprendizaje o el tamaño del lote. Tampoco se detalla si se aplicaron técnicas adicionales como RLHF o DPO. El modelo base fue cuantizado a 4 bits con bitsandbytes antes del fine-tuning, lo que sugiere que el entrenamiento se realizó con parámetros de baja precisión (QLoRA o similar), aunque no se confirma explícitamente.

## Capacidades

- Generacion de texto: el modelo puede producir texto coherente en ingles, heredado del modelo base instruct.
- Razonamiento sobre palabras: especializado en la tarea de Wordle, es capaz de proponer palabras de 5 letras y refinar sus conjeturas a partir de la retroalimentacion (letras correctas, presentes o ausentes).
- Seguimiento de instrucciones: al derivar de la variante instruct, responde a comandos en lenguaje natural.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Juego automatico de Wordle: el modelo puede integrarse en un script que reciba el estado del tablero (conjeturas previas y retroalimentacion) y genere la siguiente palabra candidata, permitiendo jugar partidas completas de forma autonoma.
- Asistente para resolver Wordle: un usuario puede describir las pistas obtenidas (por ejemplo, "la letra A esta en la posicion 2 pero no en la 4") y el modelo sugiere posibles palabras que cumplan las restricciones.
- Educacion en procesamiento del lenguaje: sirve como ejemplo didactico de fine-tuning sobre un modelo pequeno para una tarea de razonamiento lexico, mostrando el flujo completo con Unsloth y HuggingFace.
- Prototipado de agentes conversacionales con restricciones: el modelo puede adaptarse para juegos de palabras similares (como Lingo o Mastermind con letras) reutilizando la logica de inferencia.
- Evaluacion de modelos pequenos en tareas de razonamiento: permite comparar el rendimiento de un modelo de 270M frente a otros tamanos en una tarea acotada, sin necesidad de infraestructura costosa.
- Generacion de contenido ludico: puede emplearse para crear pistas o sugerencias en aplicaciones de juegos de palabras, aprovechando su conocimiento del vocabulario ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion sobre MMLU, HumanEval, GSM8K u otras pruebas estandar para este fine-tuning especifico. El modelo base Gemma 3 270M reporta metricas en la documentacion oficial de Google, pero no se han replicado aqui para la version ajustada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 270M de parametros, en precision fp16 ocupa aproximadamente 540 MB de pesos. Con cuantizacion a 4 bits, el peso se reduce a unos 135 MB, aunque el repo actual no especifica el formato de cuantizacion de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp16 (por ejemplo, GTX 1650, RTX 3050). En cuantizacion 4 bits, incluso una GPU integrada o una Raspberry Pi con suficiente RAM podria ejecutarlo.
- Compatibilidad con hardware de consumo: si, cabe en practicamente cualquier GPU consumer moderna y tambien en CPU (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de este tamano, se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Nikhil1169/gemma-3-270m-wordle-sft-warmup | 270M | 32K | Apache 2.0 | Wordle (fine-tuning) |
| google/gemma-3-270m-it | 270M | 32K | Gemma license | Instrucciones generales |
| unsloth/gemma-3-270m-it-unsloth-bnb-4bit | 270M | 32K | Gemma license | Instrucciones cuantizado 4-bit |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | Instrucciones generales |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea de Wordle. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeno entrenado principalmente en ingles, puede presentar sesgos linguisticos y culturales propios de los datos de preentrenamiento de Gemma 3.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir palabras que no existen o sugerencias incorrectas, especialmente en contextos ambiguos de Wordle.
- Limitaciones de contexto: aunque soporta 32K tokens, el fine-tuning para Wordle probablemente no aprovecha contextos tan largos; el rendimiento puede degradarse con entradas muy extensas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base Gemma 3 tiene su propia licencia (Gemma Terms of Use) que puede imponer restricciones adicionales; es recomendable revisar ambas.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad. No se recomienda su uso en entornos criticos sin una evaluacion exhaustiva propia.
- Datos de entrenamiento desconocidos: no se ha publicado informacion sobre el dataset de Wordle utilizado, por lo que no se puede verificar la calidad ni la cobertura del vocabulario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nikhil1169/gemma-3-270m-wordle-sft-warmup
- Modelo base original de Google: https://huggingface.co/google/gemma-3-270m
- Version cuantizada de Unsloth: https://huggingface.co/unsloth/gemma-3-270m-it-unsloth-bnb-4bit
- GGUF de Unsloth: https://huggingface.co/unsloth/gemma-3-270m-it-GGUF
- Blog de Google Developers sobre Gemma 3 270M: https://developers.googleblog.com/introducing-gemma-3-270m/
- Pagina oficial de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
