# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-step468

## Resumen

Este repositorio no contiene un modelo completo, sino un **adaptador LoRA** (librería PEFT, formato safetensors, 0,3 GB) entrenado sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. El nombre del identificador —`text-sft-training-curve-run1-step468`— indica que se trata de un **checkpoint intermedio del paso 468 de la primera ejecución de un ajuste supervisado (SFT) sobre datos de texto**, presumiblemente conservado para estudiar la curva de entrenamiento y la evolución de capacidades durante el fine-tuning, no como un artefacto listo para producción.

El modelo base sobre el que se aplica es un destilado de razonamiento de DeepSeek: un transformer decoder-only de aproximadamente 7,6 mil millones de parámetros, derivado de la familia Qwen2.5, que genera cadenas de pensamiento largas antes de responder. El adaptador hereda por tanto esa arquitectura y esa ventana de contexto, pero las capacidades efectivas del checkpoint del paso 468 no están documentadas ni evaluadas.

Su relevancia es fundamentalmente **de investigación**: los checkpoints intermedios de una ejecución de SFT permiten analizar cuándo aparecen o se degradan habilidades concretas, comparar dinámicas de entrenamiento entre ejecuciones y estudiar el efecto de distintos regímenes de datos. Para uso práctico, el valor está en el adaptador como objeto de análisis, no como asistente listo para desplegar: la model card es la plantilla automática de HuggingFace, sin rellenar, y no aporta datos de entrenamiento, licencia ni evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Math-7B) + adaptador LoRA entrenado con PEFT |
| Parametros totales | ~7,6 B en el modelo base; el adaptador añade un numero de parametros entrenables no documentado (repo de 0,3 GB en safetensors) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no especificada en la ficha del adaptador; el modelo base declara 131 072 tokens (128K) segun su model card publica |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas del adaptador; al estar en safetensors puede fusionarse con el modelo base y convertirse a GGUF, AWQ, GPTQ o bitsandbytes con herramientas externas |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la ficha del adaptador; el modelo base se distribuye bajo licencia MIT segun su model card publica |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` 0.20.0 |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Tipo de pipeline | text-generation (conversacional) |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Qwen2.5, con normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA), entrenado originalmente para generar razonamiento explícito en formato de cadena de pensamiento. El adaptador añade matrices de bajo rango (LoRA) sobre ese modelo congelado, de modo que solo se actualiza una fracción pequeña de parametros; el repositorio ocupa 0,3 GB, coherente con un adaptador de rango bajo y no con una copia de los pesos completos.

Sobre el procedimiento de entrenamiento **no hay informacion publicada**: la model card es la plantilla por defecto de HuggingFace y todos los campos relevantes (datos, hiperparametros, precision, hardware, tiempos) aparecen como `[More Information Needed]`. El unico dato fiable es el que se deduce del nombre del repositorio: se trata de un ajuste supervisado sobre datos de texto (`text-sft`), de la ejecucion 1 (`run1`), guardado en el paso 468 (`step468`). No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni variantes de atencion lineal. El tag `arxiv:1910.09700` que aparece en el repositorio es un residuo de la plantilla de model card (la calculadora de impacto de carbono de Lacoste et al.), no una referencia al metodo del adaptador.

## Capacidades

Cualquier enumeracion de capacidades es **inferencia a partir del modelo base, no una verificacion del adaptador**, que carece de evaluacion publicada.

- Generacion de texto conversacional en formato multi-turno, heredada de la configuracion de `text-generation` y de la etiqueta `conversational`.
- Razonamiento explicito por cadena de pensamiento: el modelo base esta destilado de DeepSeek-R1 y tiende a producir trazas de razonamiento largas antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas de varios pasos, por la base Qwen2.5-Math del destilado.
- Generacion y comprension de codigo, capacidad presente en el modelo base pero sin medicion en este checkpoint.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso agentico en este adaptador concreto; el modelo base tampoco lo documenta de forma explicita en su ficha de destilado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode configurable): no disponibles en la informacion proporcionada.

## Casos de uso

- **Analisis de curvas de entrenamiento:** el checkpoint del paso 468 permite medir como evolucionan las metricas de validacion a lo largo del SFT, comparando este paso con checkpoints anteriores y posteriores de la misma ejecucion `run1`.
- **Estudios de aparicion de habilidades (emergence):** evaluar tareas de matematicas, codigo o seguimiento de instrucciones en checkpoints intermedios para determinar en que punto del ajuste aparecen o se degradan, algo habitual en trabajos de interpretabilidad y dinamica de entrenamiento.
- **Comparacion de ejecuciones de SFT:** usar este adaptador como referencia de la ejecucion 1 y contrastarlo con otras ejecuciones variando la mezcla de datos, la tasa de aprendizaje o el rango de LoRA.
- **Investigacion sobre ajuste de modelos de razonamiento:** analizar si el SFT sobre datos de texto preserva, intensifica o degrada la cadena de pensamiento del destilado original, comparando salidas antes y despues de aplicar el adaptador.
- **Punto de partida para experimentos de fusion de adaptadores:** al ser un adaptador pequeno en safetensors, puede fusionarse con el modelo base o combinarse con otros adaptadores LoRA para estudiar interferencias entre tareas.
- **Docencia y reproducibilidad de pipelines PEFT:** sirve como ejemplo minimo de carga de un adaptador con `peft` + `transformers` con fines formativos sobre el ciclo completo de fine-tuning.
- **Base para prototipos de razonamiento en local, con reservas:** si se fusiona con el modelo base y se cuantiza, puede emplearse en tareas de matematicas o codigo en una GPU de consumo, pero sin garantia de calidad al no existir evaluacion publicada del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada, y los resultados de busqueda web asociados a esta consulta no contienen material tecnico relevante sobre el modelo.

| Benchmark | Resultado del adaptador | Nota |
|---|---|---|
| MMLU | no disponible | sin datos en la model card |
| HumanEval | no disponible | sin datos en la model card |
| GSM8K | no disponible | sin datos en la model card |
| AIME / MATH-500 | no disponible | el modelo base reporta resultados en el paper de DeepSeek-R1; no se replican aqui por no estar en la informacion proporcionada |

## Requisitos de hardware

- **Adaptador:** 0,3 GB en safetensors; el coste real esta en el modelo base.
- **Modelo base en bf16/fp16:** aproximadamente 15,2 GB de pesos. Necesita del orden de 18-24 GB de VRAM contando cache KV, lo que encaja en A100 40 GB, H100 80 GB, L40S 48 GB y RTX 4090 24 GB (esta ultima con contexto limitado).
- **Cuantizacion de 8 bits:** alrededor de 8-9 GB; viable en RTX 4080/4090 y en A100 40 GB.
- **Cuantizacion de 4 bits (NF4/GPTQ/AWQ):** alrededor de 4,5-5,5 GB; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y GPUs de portatil con 8 GB si se limita el contexto.
- **Contexto largo:** con 131 072 tokens en el modelo base, la cache KV domina el consumo; en GPUs de consumo conviene trabajar en rangos de 8K a 32K tokens.
- **Opciones de despliegue:** `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en servidor; llama.cpp u Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF; tambien es posible fusionar y publicar un modelo completo cuantizado.
- **Latencia y throughput:** no disponibles. No hay mediciones de tokens por segundo publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (paso 468) | ~7,6 B base + LoRA no cuantificado | no disponible | no disponible | HuggingFace, 0 descargas |
| DeepSeek-R1-Distill-Qwen-7B (base) | ~7,6 B | 131 072 tokens segun su model card | MIT | HuggingFace, ampliamente desplegado |
| DeepSeek-R1-Distill-Llama-8B | ~8 B | 128K heredado de Llama 3.1 8B | Llama 3.1 Community License | HuggingFace |
| Qwen2.5-7B-Instruct | ~7,6 B | 131 072 tokens | Apache 2.0 | HuggingFace |

La comparacion de rendimiento no es posible: este adaptador no publica metricas y los resultados del modelo base pertenecen a la documentacion de DeepSeek, no a este checkpoint. La diferencia practica frente a las alternativas es la licencia (MIT o Apache 2.0 frente a una licencia no declarada en el adaptador) y el nivel de soporte: los tres modelos comparados tienen model cards completas, mientras que este repositorio no.

## Limitaciones y advertencias

- **Documentacion inexistente:** la model card es la plantilla automatica sin rellenar; no hay datos de entrenamiento, hiperparametros, composicion del dataset ni evaluacion.
- **Checkpoint intermedio:** el paso 468 no es necesariamente el punto final del entrenamiento; el modelo puede estar en una fase de la curva en la que el rendimiento aun no se ha estabilizado o esta degradado.
- **Licencia no declarada:** no se especifica licencia para el adaptador. Aunque el modelo base sea MIT, la ausencia de licencia explicita impide asumir derechos de uso comercial sobre el adaptador.
- **Riesgo de alucinacion:** los modelos de razonamiento destilados generan cadenas de pensamiento largas que pueden contener pasos plausibles pero incorrectos, especialmente en dominios de conocimiento factual.
- **Idiomas no documentados:** no hay constancia de soporte de castellano; el comportamiento en lenguas distintas del ingles y el chino es impredecible.
- **Uso fuera de alcance:** no debe emplearse en produccion, en decisiones medicas, legales o financieras, ni en sistemas que requieran trazabilidad, al carecer de evaluacion y de garantias.
- **Coste de inferencia elevado:** al ser un modelo de razonamiento, consume muchos tokens de salida por respuesta, lo que incrementa latencia y coste frente a modelos instruct convencionales del mismo tamano.
- **Sin garantia de reproducibilidad:** no se publican semillas, datos ni configuracion, por lo que los resultados derivados de este checkpoint no son reproducibles de forma independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-step468
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper de DeepSeek-R1 (modelo del que procede la destilacion): https://arxiv.org/abs/2501.12948
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia citada en los tags del repositorio (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo en la informacion proporcionada.
