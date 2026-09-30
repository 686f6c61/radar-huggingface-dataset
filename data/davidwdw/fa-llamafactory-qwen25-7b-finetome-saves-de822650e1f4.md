# davidwdw/fa-llamafactory-qwen25-7b-finetome-saves-de822650e1f4

## Resumen

Este repositorio, publicado por el usuario `davidwdw`, no es un modelo nuevo e independiente, sino un archivo versionado ("versioned fleet archive") que empaqueta el resultado de un proceso de ajuste supervisado (SFT) por LoRA sobre el modelo base Qwen2.5-7B-Instruct. La receta canonica declarada es `historical_centre_llamafactory_qwen25_finetome` y el paquete incluye los checkpoints intermedios correspondientes a los pasos 500 a 2500, el adaptador final y el modelo ya fusionado (merged model) con los pesos del adaptador incorporados al modelo base. El repositorio ocupa 18,2 GB, un tamano coherente con la coexistencia de multiples artefactos de entrenamiento y el modelo fusionado en precision completa.

El ajuste se ha realizado con LLaMA-Factory, el framework unificado de fine-tuning mantenido por hiyouga, y utiliza el dataset FineTome-100k, una coleccion de conversaciones de instrucciones ampliamente empleada en la comunidad para afinar modelos instruct. El objetivo del repositorio es puramente de trazabilidad y reproducibilidad: el autor indica que se debe usar la revision exacta registrada y verificar las sumas SHA256, y advierte de que se trata de una instantanea ("snapshot") y no de un espejo de directorio vivo.

Por tanto, la relevancia de esta ficha no reside en una innovacion arquitectonica propia, sino en documentar correctamente un artefacto de fine-tuning reproducible sobre Qwen2.5-7B-Instruct. El modelo hereda las caracteristicas del base: un transformer decoder-only de aproximadamente 7.600 millones de parametros, con soporte de contexto largo mediante YaRN y capacidades multilingues, sobre el que se ha aplicado una capa de especializacion mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct como modelo base); el adaptador es LoRA y el paquete incluye el modelo fusionado |
| Parametros totales | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct tiene aproximadamente 7.600 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | No disponible en la model card; al distribuirse en safetensors, es cuantizable a GGUF, AWQ, GPTQ, etc., por herramientas externas |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 declara soporte de 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); se incluyen adaptadores LoRA y modelo fusionado |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen2.5-7B-Instruct, un transformer decoder-only con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El repositorio no modifica la arquitectura: el proceso aplicado es un ajuste supervisado (SFT) mediante LoRA (Low-Rank Adaptation) que congela los pesos del modelo base e inyecta matrices de bajo rango entrenables en las capas de atencion y proyeccion. LLaMA-Factory gestiona este flujo y, al finalizar, permite fusionar el adaptador con el modelo base para obtener un unico conjunto de pesos, que es precisamente el "merged model" que aparece en el paquete.

El corpus de entrenamiento es FineTome-100k, un dataset de conversaciones de instrucciones de unas 100.000 muestras, usado habitualmente para SFT instruct en modelos de la familia Qwen y LLaMA. El paquete conserva los checkpoints de los pasos 500, 1000, 1500, 2000 y 2500, ademas del adaptador final, lo que permite reproducir el entrenamiento o evaluar el comportamiento del modelo en distintas etapas del ajuste. No se indica en la informacion disponible si se aplicaron fases adicionales de alineacion (DPO, RLHF u otras), ni se detalla la hiperparametrizacion (rango LoRA, alpha, learning rate, numero de epocas).

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de proposito general y respuesta a instrucciones, reforzado por el SFT sobre FineTome-100k.
- Generacion de codigo y asistencia tecnica, dentro del rango habitual del Qwen2.5-7B.
- Capacidades matematicas y de resolucion de problemas, propias del base instruct.
- Soporte multilingue amplio segun el modelo base (Qwen2.5 declara 29 idiomas), aunque no se especifica en la model card del adaptador.
- Posible soporte de tool calling y function calling, por herencia del formato chat de Qwen2.5-Instruct; no confirmado explicitamente en este paquete.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos de fine-tuning: el paquete incluye checkpoints intermedios y el adaptador final, lo que permite comparar el comportamiento del modelo en los pasos 500, 1000, 1500, 2000 y 2500 y estudiar la dinamica del entrenamiento LoRA.
- Archivado y auditoria de modelos: al tratarse de una instantanea versionada con sumas SHA256, encaja en flujos de gobernanza que exigen trazabilidad de la revision exacta de un artefacto.
- Base para fine-tuning adicional: el adaptador LoRA puede reutilizarse o continuarse con nuevos datasets en LLaMA-Factory sin partir del modelo base original.
- Asistentes conversacionales de dominio general: el modelo fusionado puede desplegarse como chatbot instruct estandar cuando no se requiere una especializacion vertical.
- Evaluacion comparativa de recetas: sirve para medir el efecto de FineTome-100k frente a otros datasets de SFT sobre Qwen2.5-7B-Instruct.
- Generacion de codigo y soporte tecnico en entornos de desarrollo, siempre que se validen las salidas y se cuantice el modelo para ajustarlo al hardware disponible.
- Prototipado rapido en investigacion: al ser un 7B, permite experimentar en una unica GPU consumer con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se aportan comparaciones con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado: aproximadamente 15-16 GB en FP16/BF16 para 7.600 millones de parametros.
- En cuantizacion de 8 bits, el consumo baja a unos 8-9 GB; en 4 bits, a unos 4-6 GB (estimaciones estandar para un modelo de este tamano, no verificadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en precision completa con contexto largo. Una RTX 4090 (24 GB) es suficiente para FP16 con contexto moderado y holgada con cuantizacion.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12 GB o mas si se aplica cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (previa conversion a GGUF), SGLang y el propio pipeline de transformers.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto, y no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fa-llamafactory-qwen25-7b-finetome-saves (este repo) | ~7,6B (base) | No especificado en la model card | LoRA SFT + modelo fusionado sobre Qwen2.5-7B-Instruct | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 nativos, 131.072 con YaRN | Transformer decoder-only instruct | Qwen (licencia propia de Qwen) | HuggingFace, ampliamente usado |
| Qwen2.5-7B (pretrained) | ~7,6B | Igual que el instruct | Transformer decoder-only base | Qwen | HuggingFace |
| Otros adaptadores LoRA sobre Qwen2.5-7B con FineTome-100k | ~7,6B | Depende del base | LoRA SFT | Variable segun autor | HuggingFace |

No se dispone de datos de rendimiento comparativos, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; conviene consultar la licencia del modelo base Qwen2.5-7B-Instruct, que impone sus propias condiciones.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con reportes de uso en produccion.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este adaptador concreto.
- Riesgo de alucinacion inherente a los modelos de 7B en tareas de conocimiento factual, agravado si el SFT se realizo sobre un dataset generalista como FineTome-100k.
- No se detalla la composicion exacta del dataset ni la hiperparametrizacion del LoRA, lo que limita la reproducibilidad estricta mas alla de los checkpoints almacenados.
- El autor advierte de que es una instantanea ("snapshot") y no un espejo vivo; se debe usar la revision registrada y verificar las sumas SHA256 antes de confiar en los pesos.
- El paquete de 18,2 GB incluye varios checkpoints y el modelo fusionado, por lo que es facil descargar artefactos redundantes si no se seleccionan los ficheros concretos.
- No se especifican los idiomas soportados en la model card, aunque el base declara capacidades multilingues; el rendimiento real por idioma no esta verificado.
- No se confirma soporte de tool calling ni de modos de razonamiento extendido en este adaptador concreto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/davidwdw/fa-llamafactory-qwen25-7b-finetome-saves-de822650e1f4
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Guia de fine-tuning de Qwen2.5 con LLaMA-Factory (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5/4.3-fine-tuning-with-llama-factory
- Repositorio LLaMA-Factory en GitHub: https://github.com/hiyouga/LLaMAFactory
