# HaroldMath/nano-mini-3b-lora

## Resumen

nano-mini-3b-lora es un adaptador LoRA publicado por el usuario HaroldMath sobre el modelo base HuggingFaceTB/SmolLM3-3B. Se distribuye como un repositorio PEFT con pesos en safetensors y una version en GGUF, lo que permite tanto la carga mediante la libreria `peft`/`transformers` como su uso en entornos de inferencia basados en llama.cpp. El modelo hereda la arquitectura, el contexto y las capacidades del SmolLM3-3B original, al que anade un ajuste fino supervisado del que la model card no aporta detalles sobre el dataset.

El interes practico del repositorio es limitado pero claro: sirve como ejemplo de adaptador LoRA de bajo coste sobre un modelo de 3.075 millones de parametros, con licencia Apache 2.0 y un tamano de repo de 2,9 GB. La relevancia actual viene de su base, SmolLM3-3B, un modelo pequeno orientado a despliegues con recursos limitados, y de la posibilidad de reutilizar el adaptador en pipelines existentes sin reentrenar el modelo completo.

La model card es practicamente un esqueleto autogenerado por el Trainer: no documenta el dataset, no incluye resultados de evaluacion y deja secciones como "Model description" o "Intended uses & limitations" sin contenido. Cualquier evaluacion seria del adaptador requiere por tanto pruebas propias contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: HuggingFaceTB/SmolLM3-3B) |
| Parametros totales | 3.075.098.624 (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | safetensors (adaptador) y GGUF (pesos publicados en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM3-3B, un transformer decoder-only de 3.075 millones de parametros. El ajuste se realizo con PEFT 0.21.2 y Transformers 5.20.2 sobre PyTorch 2.11.0+cu130, con precision mixta nativa (AMP). Los hiperparametros declarados son: learning rate 2e-4, batch size de entrenamiento 1 con 16 pasos de acumulacion (batch efectivo 16), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 30 pasos de warmup, una sola epoca y semilla 42.

No se especifica el dataset de entrenamiento (la model card indica "None dataset"), ni el rango o los modulos objetivo del LoRA, ni si hubo etapas de RLHF o DPO. Tampoco se documenta el numero de tokens vistos durante el ajuste. No hay innovaciones tecnicas declaradas mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto y conversacion, heredadas del modelo base SmolLM3-3B.
- Etiquetado como `text-generation` y `conversational` en Hugging Face.
- Compatibilidad con `transformers` y `peft` para carga del adaptador.
- Version GGUF disponible para inferencia con llama.cpp y derivados.
- Capacidades especificas de tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada para este adaptador.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador de 3B con licencia Apache 2.0, se puede desplegar en una sola GPU consumer para validar flujos de dialogo antes de invertir en modelos mayores.
- Ajuste fino sobre dominio propio como plantilla: el repositorio sirve de referencia para replicar un entrenamiento LoRA con los hiperparametros documentados (lr 2e-4, batch efectivo 16, una epoca) sobre SmolLM3-3B.
- Inferencia en CPU o entornos sin GPU mediante el archivo GGUF, util para demos locales y pruebas de integracion.
- Evaluacion comparativa base vs. adaptador: permite medir con un harness propio si el ajuste aporta mejoras en la tarea concreta, dado que el autor no publica benchmarks.
- Fine-tuning ligero para clasificacion o extraccion de informacion en texto, reutilizando el adaptador como punto de partida.
- Experimentacion academica con PEFT: el repo documenta versiones exactas de PEFT, Transformers y PyTorch, lo que facilita reproducir el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio contiene una entrada con la lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,1 GB; en 4 bits, en torno a 1,6 GB (estimaciones teoricas a partir de los 3.075 millones de parametros, no verificadas para este adaptador).
- GPU recomendadas: A100 o H100 para lotes grandes y contexto largo; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 con margen.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizaciones de 8/4 bits; en FP16 se recomienda 12 GB o mas.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, llama.cpp u Ollama para la version GGUF, y servidores compatibles con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nano-mini-3b-lora | 3.075 M (base) | no disponible | Apache 2.0 | safetensors, GGUF | Adaptador LoRA sin benchmarks publicados |
| SmolLM3-3B (base) | 3.075 M | no disponible en la informacion proporcionada | Apache 2.0 | safetensors | Modelo original sin ajuste adicional |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el ajuste.
- No hay resultados de evaluacion: el riesgo de regresion respecto al modelo base es real y debe medirse con pruebas propias.
- Riesgo de alucinacion inherente a un modelo de 3B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Cobertura de idiomas no declarada; no se puede asumir un rendimiento solido en castellano sin validacion.
- Longitud de contexto no especificada en el repositorio; conviene consultar la del SmolLM3-3B original antes de disenar prompts largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El adaptador requiere cargar el modelo base por separado; el repo de 2,9 GB no es autonomo para inferencia en `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/HaroldMath/nano-mini-3b-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
