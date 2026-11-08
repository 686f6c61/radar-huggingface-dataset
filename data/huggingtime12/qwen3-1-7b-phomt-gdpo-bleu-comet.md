# huggingtime12/Qwen3-1.7B-PhoMT-GDPO-BLEU-COMET

## Resumen

Qwen3-1.7B-PhoMT-GDPO-BLEU-COMET es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo fusionado huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged, que a su vez deriva del Qwen3-1.7B de Alibaba Qwen. Se trata, por tanto, de un ajuste fino en dos etapas (SFT y posterior optimizacion con GRPO) orientado a generacion de texto conversacional, probablemente en el dominio de traduccion automatica, a juzgar por el sufijo "PhoMT" (dataset publico de traduccion chino-vietnamita) y por las metricas BLEU y COMET que aparecen en el nombre del repositorio.

El modelo se distribuye como adaptador PEFT (formato safetensors, libreria peft 0.18.0) y no como pesos completos, lo que implica que para utilizarlo es necesario cargar primero el modelo base fusionado y aplicar despues el adaptador. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA de rango bajo sobre un transformer denso de 1.700 millones de parametros.

La relevancia es limitada pero concreta: es un ejemplo de pipeline de alineamiento con recompensas basadas en metricas de traduccion (GDPO con BLEU y COMET) sobre un modelo pequeno, lo que resulta interesante para experimentar con tecnicas de RL aplicadas a tareas de generacion condicionada. La model card esta practicamente vacia (plantilla por defecto), por lo que la mayor parte de los detalles tecnicos no estan documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B); el repositorio contiene un adaptador LoRA |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen3-1.7B original soporta contexto largo, pero el autor no lo confirma) |
| Tipos de cuantizacion | no disponible; el adaptador se publica en safetensors sin versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible (el nombre sugiere chino-vietnamita por el dataset PhoMT, sin confirmacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 con atencion por causal y mecanismos estandar de la serie (no se dispone de detalles adicionales confirmados en la informacion proporcionada). Sobre ese modelo se aplico primero un ajuste supervisado (SFT) que dio lugar a Qwen3-1.7B-PhoMT-SFT-Merged, y posteriormente un entrenamiento con GRPO (Group Relative Policy Optimization) segun la etiqueta `grpo` del repositorio, con una senal de recompensa basada en BLEU y COMET, tal como indica el nombre del modelo. El resultado de esa segunda etapa es el adaptador LoRA que nos ocupa, entrenado con TRL y PEFT 0.18.0.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros (rango del LoRA, alpha, learning rate, numero de pasos) ni la configuracion de recompensas. Tampoco se documenta si hubo etapas adicionales de DPO o RLHF mas alla del GRPO mencionado. La innovacion tecnica destacable es el uso de metricas automaticas de traduccion (BLEU y COMET) como funcion de recompensa dentro de un bucle de RL, un enfoque poco frecuente en modelos de este tamano y que puede servir como referencia metodologica.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen3.
- Traduccion automatica (presumiblemente chino-vietnamita, por el dataset PhoMT), aunque no confirmada explicitamente por el autor.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo (1.700 millones de parametros).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el Qwen3 original lo soporta, pero no hay confirmacion de que el ajuste lo preserve).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Traduccion chino-vietnamita en entornos de bajo recurso: el modelo se ha optimizado con recompensas BLEU y COMET sobre el dataset PhoMT, por lo que es adecuado para experimentar con traduccion automatica en ese par de idiomas, siempre validando la calidad con un conjunto de test propio.
- Investigacion en RL para generacion de texto: sirve como banco de pruebas para estudiar como afecta GRPO con recompensas basadas en metricas de traduccion al comportamiento de un modelo pequeno, comparandolo con el checkpoint SFT previo.
- Prototipado de asistentes conversacionales ligeros: al ser un adaptador sobre un modelo de 1.700 millones de parametros, puede desplegarse en una unica GPU consumer para demos de chatbot con contexto moderado.
- Generacion de datos sinteticos de traduccion: el modelo puede producir pares de frases para aumentar datasets de entrenamiento en dominios especificos, con filtrado posterior por COMET.
- Evaluacion comparativa de tecnicas de alineamiento: util para medir la diferencia entre SFT y SFT+GRPO en tareas de traduccion, usando el checkpoint fusionado como linea base.
- Educacion e investigacion academica: ejemplo reproducible de pipeline PEFT + TRL + GRPO con recompensas automaticas, adecuado para cursos y talleres sobre ajuste fino de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.700 millones de parametros en FP16 requiere aproximadamente 3,4 GB solo para pesos; en BF16 similar. En cuantizacion de 8 bits, en torno a 1,8-2 GB; en 4 bits, alrededor de 1-1,2 GB. El adaptador LoRA anade un coste marginal (repositorio de 0,3 GB).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070), y A100/H100 para entrenamiento o inferencia por lotes de gran tamano.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas en cuantizacion de 4 u 8 bits; en FP16 con 8 GB o mas.
- Opciones de despliegue: transformers con PEFT (cargando el modelo base fusionado y aplicando el adaptador), vLLM (previa fusion del adaptador en los pesos), TGI y llama.cpp/Ollama solo si se genera previamente una version GGUF fusionada, que el autor no proporciona.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-PhoMT-GDPO-BLEU-COMET | 1,7 B (base) + LoRA | no disponible | no disponible | Adaptador PEFT en HF | Ajuste GRPO con recompensas BLEU/COMET |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en la informacion | no disponible en la informacion | Pesos completos en HF | Modelo base oficial de Alibaba Qwen |
| huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged | 1,7 B | no disponible | no disponible | Pesos fusionados en HF | Checkpoint intermedio solo con SFT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre sesgos, datos de entrenamiento, hiperparametros ni evaluacion, lo que dificulta auditar el modelo.
- Riesgo de alucinacion inherente a un modelo de 1.700 millones de parametros, especialmente en tareas de razonamiento complejo o contextos largos.
- El ajuste con recompensas BLEU y COMET puede haber sobreoptimizado hacia esas metricas, con posible degradacion de la fluidez o de la fidelidad semantica fuera del dominio de traduccion.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base Qwen3-1.7B.
- Idiomas soportados no confirmados: el uso fuera del par chino-vietnamita (si es que ese es el dominio) no esta validado.
- Al ser un adaptador LoRA, requiere cargar el modelo base fusionado, lo que anade complejidad de despliegue y dependencia de otro repositorio del mismo autor.
- Sin versiones cuantizadas ni GGUF publicadas: el despliegue en llama.cpp u Ollama exige fusionar y convertir manualmente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-GDPO-BLEU-COMET
- Modelo base fusionado: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Perfil del autor: https://huggingface.co/huggingtime12
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
