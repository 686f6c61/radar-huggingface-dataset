# nhuyhoan2004/lab22-sft-mini

## Resumen

`nhuyhoan2004/lab22-sft-mini` es un adaptador LoRA de ajuste fino supervisado (SFT) construido sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una version cuantizada a 4 bits del modelo Qwen2.5-3B de Alibaba. El repositorio contiene unicamente los pesos del adaptador PEFT (0.1 GB), no el modelo completo, y esta disenado para ser cargado junto con su base cuantizada mediante la libreria `peft` de HuggingFace.

El modelo parece ser el resultado de un ejercicio academico o de laboratorio, probablemente parte de un curso de formacion en IA, dado el nombre "lab22" y la existencia de repositorios similares en GitHub con estructura de tareas. La model card esta practicamente vacia: no se especifican datos de entrenamiento, hiperparametros, licencia ni idiomas soportados, lo que limita seriamente su uso en produccion.

Su relevancia es marginal en el ecosistema actual: se trata de un adaptador experimental sin documentacion, sin benchmarks publicados y sin comunidad asociada. Su unico valor potencial es didactico, como ejemplo de un pipeline de SFT con LoRA sobre Qwen2.5-3B, o como punto de partida para quien quiera reproducir un flujo de fine-tuning economico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA anade un numero reducido de parametros sobre los 3B de la base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B, que soporta hasta 32 768 tokens, pero no confirmado para este adaptador) |
| Tipos de cuantizacion | El adaptador se entrena sobre una base cuantizada a 4 bits (bnb-4bit); los pesos del adaptador estan en safetensors |
| Idiomas soportados | no disponible (Qwen2.5-3B soporta principalmente ingles y chino, pero no se confirma para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only con attention de QKV (query-key-value) y normalizacion RMSNorm, desarrollado por Alibaba Cloud. El adaptador LoRA (Low-Rank Adaptation) anade matrices de bajo rango a las capas de atencion y feed-forward, permitiendo un fine-tuning eficiente en terminos de memoria y computo. El entrenamiento se realizo con la libreria `trl` (Transformer Reinforcement Learning) y `unsloth`, una herramienta que optimiza el fine-tuning de modelos cuantizados.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el regimen de entrenamiento (fp16, bf16, etc.) ni si se aplicaron tecnicas adicionales como DPO o RLHF. La unica referencia tecnica es el tag `arxiv:1910.09700`, que corresponde al paper de LoRA (Hu et al., 2021), y la version de PEFT 0.19.1. El entrenamiento se realizo sobre una base cuantizada a 4 bits, lo que sugiere un flujo de bajo consumo de VRAM, probablemente en una GPU de gama media como una T4 o RTX 4090.

## Capacidades

- Generacion de texto conversacional: al estar basado en Qwen2.5-3B, hereda capacidades de generacion de texto y dialogo, aunque el adaptador no documenta ninguna especializacion concreta.
- Razonamiento y conocimiento general: capacidades heredadas de Qwen2.5-3B, que incluyen razonamiento basico, conocimiento enciclopedico y comprension lectora en ingles y chino.
- Codigo: Qwen2.5-3B tiene cierta capacidad de generacion de codigo, pero no se ha verificado que el adaptador la preserve o mejore.
- Tool calling y function calling: no disponible, no se menciona en la model card.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible, aunque la base Qwen2.5-3B soporta principalmente ingles y chino.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Proyecto educativo de fine-tuning: el caso mas realista. Un estudiante o investigador puede cargar este adaptador para entender como funciona un pipeline SFT con LoRA sobre un modelo cuantizado, replicando el flujo con `peft` y `transformers`.
- Experimentacion con PEFT: util para probar la integracion de adaptadores LoRA con bases cuantizadas a 4 bits, evaluando la degradacion de calidad frente al modelo completo.
- Base para fine-tuning adicional: el adaptador podria servir como punto de partida para un segundo fine-tuning, aunque sin documentacion sobre el dataset original es arriesgado.
- Comparacion de tecnicas de cuantizacion: permite estudiar como afecta el entrenamiento sobre una base bnb-4bit frente a una base en precision completa.
- Prototipado rapido de chatbots: si el adaptador funciona correctamente, podria usarse para un prototipo de chatbot en ingles o chino, pero sin garantias de calidad.
- Reproduccion de resultados academicos: el repositorio GitHub asociado sugiere que forma parte de un ejercicio con soluciones de referencia, por lo que podria usarse para comparar resultados en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. El autor no proporciona metricas de rendimiento, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre una base de 3B cuantizada a 4 bits, la inferencia requiere aproximadamente 2-3 GB de VRAM para el modelo base, mas un margen para el adaptador y el contexto. En total, cabe en GPUs consumer con 6 GB o mas.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) o cualquier GPU con al menos 6 GB de VRAM. Para entrenamiento, una T4 es suficiente.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y alta.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse con `transformers` y `peft` en Python. No es compatible directamente con vLLM, Ollama o llama.cpp sin conversion previa a un formato unificado (por ejemplo, exportar a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nhuyhoan2004/lab22-sft-mini | 3B (base) + LoRA | no disponible | no disponible | PEFT/safetensors | Adaptador sin documentacion |
| wanhin/lab22-sft-mini | 3B (base) + LoRA | no disponible | no disponible | PEFT/safetensors | Adaptador similar, probablemente del mismo ejercicio |
| Qwen2.5-3B (base) | 3B | 32 768 tokens | Apache 2.0 | safetensors | Modelo base completo, con documentacion y benchmarks |
| Qwen2.5-3B-Instruct | 3B | 32 768 tokens | Apache 2.0 | safetensors | Version instruct, con mejor rendimiento en dialogo |

La comparativa muestra que este adaptador no anade valor frente al modelo base o su version instruct, que son gratuitos, estan documentados y tienen benchmarks publicos. La unica diferencia es el tamano reducido del adaptador (0.1 GB), pero a costa de una calidad no verificada.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia ni idiomas. Esto impide evaluar su idoneidad para cualquier tarea concreta.
- Riesgo de alucinacion: al ser un fine-tuning sin documentacion, no se puede descartar un aumento de alucinaciones o degradacion de la coherencia respecto al modelo base.
- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se pueden identificar sesgos potenciales.
- Licencia no especificada: el uso comercial es legalmente arriesgado, ya que no se indica bajo que licencia se distribuye el adaptador.
- Dependencia de la base cuantizada: el adaptador solo funciona con `unsloth/Qwen2.5-3B-bnb-4bit`, lo que limita su portabilidad a otros entornos.
- Sin soporte de herramientas: no se ha verificado tool calling ni capacidades de agente, por lo que no es adecuado para pipelines de automatizacion.
- Calidad no verificada: sin benchmarks ni evaluaciones, no hay evidencia de que el adaptador mejore o siquiera iguale al modelo base en ninguna tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nhuyhoan2004/lab22-sft-mini
- Modelo similar (wanhin/lab22-sft-mini): https://huggingface.co/wanhin/lab22-sft-mini
- Repositorio GitHub del ejercicio (notebooks): https://github.com/luannnguyenai/2A202600398_NguyenLeMinhLuan_Lab22/blob/main/notebooks/01_sft_mini.py
- README del repositorio con soluciones: https://github.com/luannnguyenai/2A202600398_NguyenLeMinhLuan_Lab22/blob/main/solutions/README.md
- Paper de LoRA (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
