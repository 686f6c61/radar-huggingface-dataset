# kodetr/SasakLLM-1.5B-Instruct-v5

## Resumen

SasakLLM-1.5B-Instruct-v5 es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario kodetr en Hugging Face y se distribuye como repositorio PEFT de 0,7 GB, lo que indica que contiene unicamente los pesos del adaptador y no el modelo completo. El entrenamiento se realizo con la libreria TRL (version 1.17.1) y PEFT 0.21.2, sobre Transformers 5.22.1 y PyTorch 2.11.0.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto del Qwen2.5-1.5B-Instruct original: un transformer decoder-only de 1.500 millones de parametros con 32.768 tokens de contexto y soporte nativo de tool calling. El ajuste SFT busca especializar el comportamiento conversacional del modelo base, aunque la model card no documenta el dataset, el numero de pasos ni los hiperparametros empleados.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia explicita ni idiomas soportados, y la model card es una plantilla autogenerada por TRL sin informacion sustantiva sobre el proceso de entrenamiento. Se trata, por tanto, de un experimento personal de fine-tuning mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA ocupa 0,7 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible (se asume herencia del modelo base, sin confirmacion del autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros con atencion causal estandar, RoPE para codificacion posicional y tokenizador BPE con un vocabulario de aproximadamente 151.000 tokens (dato del modelo base, no verificado en este repositorio). El adaptador se entrena mediante SFT con TRL, lo que implica ajuste supervisado sobre pares instruccion-respuesta, sin que la model card especifique el dataset, el numero de ejemplos, la tasa de aprendizaje, el rango del LoRA ni el numero de epocas.

No se documenta ninguna innovacion tecnica adicional: no hay RLHF, DPO, decodificacion especulativa ni mecanismos de atencion lineal. La unica informacion verificable es el stack de entrenamiento (PEFT 0.21.2, TRL 1.17.1, Transformers 5.22.1, PyTorch 2.11.0+cu128, Datasets 5.1.0, Tokenizers 0.23.1), que corresponde a versiones muy recientes de las librerias de Hugging Face. La ausencia de datos sobre el corpus de entrenamiento impide evaluar la calidad o el sesgo del ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (roles user/assistant).
- Soporte de tool calling / function calling, siempre que el ajuste SFT no lo haya degradado (no verificado).
- Capacidades multilingues heredadas del modelo base (Qwen2.5 soporta oficialmente chino, ingles y otros idiomas), sin confirmacion por parte del autor.
- Generacion de codigo y matematicas a nivel basico, limitada por el tamano de 1.5B parametros.
- No se documentan capacidades de vision, audio, thinking mode ni agentes multi-paso especificas de este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador LoRA sobre un modelo de 1.5B, se puede cargar junto al base en una GPU consumer y probar comportamientos especializados sin reentrenar el modelo completo.
- Experimentacion academica con SFT: sirve como ejemplo reproducible de fine-tuning con TRL y PEFT para investigadores que quieran comparar tecnicas de ajuste sobre Qwen2.5-1.5B.
- Despliegue en entornos con recursos limitados: el modelo base cuantizado a 4 bits ocupa aproximadamente 1 GB de VRAM, por lo que cabe en GPUs de gama baja para tareas de generacion de texto simple.
- Generacion de respuestas en dominios acotados: si el SFT se realizo sobre un corpus especifico (no documentado), podria emplearse para respuestas especializadas en ese dominio, previa validacion manual.
- Base para posteriores ajustes: el adaptador puede combinarse con otros LoRA o servir de punto de partida para DPO/RLHF, dado que el repositorio mantiene la estructura PEFT estandar.
- Evaluacion comparativa de adaptadores: util para medir el impacto de un SFT concreto frente al modelo base en benchmarks internos de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA requiere cargar el modelo base Qwen2.5-1.5B-Instruct. En FP16, aproximadamente 3 GB de VRAM; en cuantizacion 8 bits, unos 1,6 GB; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (carga del adaptador mediante `PeftModel.from_pretrained`), vLLM con soporte LoRA, llama.cpp (requiere fusionar el adaptador con el base y convertir a GGUF), Ollama (mismo proceso de fusion previa), TGI con adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. A modo orientativo, un modelo de 1.5B en FP16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SasakLLM-1.5B-Instruct-v5 | 1.5B (base) + LoRA | 32.768 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.7B | 8.000 | Apache 2.0 | Hugging Face, ampliamente usado |

El modelo de referencia directo es Qwen2.5-1.5B-Instruct, del que hereda todas las capacidades. Frente a este, SasakLLM solo aporta el ajuste SFT, sin documentar mejoras medibles. Llama-3.2-1B-Instruct y SmolLM2-1.7B-Instruct son alternativas con licencias claras y amplio soporte comunitario.

## Limitaciones y advertencias

- La licencia no esta declarada explicitamente en el repositorio, lo que impide confirmar si se permite uso comercial. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el autor no especifica la licencia del adaptador.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos, contaminacion de benchmarks ni calidad del ajuste.
- Riesgo de alucinacion inherente a un modelo de 1.5B parametros, especialmente en tareas de razonamiento complejo o matematicas.
- El ajuste SFT puede haber degradado capacidades del modelo base (tool calling, multilingue, formato chat) si el dataset no cubria esos casos; no hay evaluacion que lo confirme.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en produccion ni validacion por terceros.
- La model card es una plantilla autogenerada por TRL: el ejemplo de `pipeline` contiene `model="None"`, lo que indica falta de revision manual por parte del autor.
- No se recomienda su uso en produccion sin una evaluacion previa frente al modelo base en el dominio objetivo.
- El contexto de 32.768 tokens esta heredado del base, pero el adaptador podria no haber sido entrenado para secuencias largas.

## Enlaces

- [Hugging Face: kodetr/SasakLLM-1.5B-Instruct-v5](https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v5)
- [Modelo base: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [TRL (Transformers Reinforcement Learning)](https://github.com/huggingface/trl)
- [PEFT (Parameter-Efficient Fine-Tuning)](https://github.com/huggingface/peft)
