# shiva123782/SmolLM2-360M-LoRA-Bal

## Resumen

SmolLM2-360M-LoRA-Bal es un ajuste fino mediante LoRA del modelo base HuggingFaceTB/SmolLM2-360M-Instruct, publicado por el usuario shiva123782 (identificado en la model card como "shiva-ai-labs"). Se distribuye como adaptador PEFT sobre el modelo base original, con pesos en formato safetensors y un total de 361.821.120 parametros. El repositorio ocupa aproximadamente 0,7 GB e incluye unicamente el adaptador, no los pesos completos del modelo base.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M-Instruct, un modelo de lenguaje pequeno disenado para ejecucion en hardware modesto. El ajuste se ha realizado sobre el dataset yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca, con el objetivo declarado de reforzar el comportamiento conversacional y la identidad del modelo (que se identifique como SmolLM2-360M-LoRA-Bal creado por shiva-ai-labs).

Su relevancia practica es limitada: se trata de un ajuste comunitario sin benchmarks publicados, con cero descargas y cero likes en el momento de la consulta, y orientado exclusivamente al ingles. Resulta util como ejemplo de flujo de trabajo LoRA/PEFT sobre modelos pequenos y para experimentacion local, pero no como modelo de produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 (adaptador LoRA sobre el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base SmolLM2-360M-Instruct soporta 8.192 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible de forma explicita; el ejemplo de la model card usa float16. Al ser un adaptador PEFT, la cuantizacion depende del modelo base cargado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se puede fusionar con merge_and_unload() para obtener un modelo monolitico |
| Libreria | peft (compatible con transformers y PyTorch) |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Dataset de ajuste | yahma/alpaca-cleaned |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. La model card menciona tecnicas de ajuste "LoRA/QLoRA" y parameter-efficient fine-tuning, pero no detalla el rango del adaptador, los modulos objetivo, la tasa de aprendizaje ni la configuracion exacta del entrenamiento. Tampoco se especifica el numero de pasos, epocas ni el volumen de tokens procesados durante el ajuste.

El unico dato concreto sobre los datos de entrenamiento es el uso del dataset yahma/alpaca-cleaned, un conjunto de instrucciones en ingles de aproximadamente 51.000 ejemplos depurados a partir de Alpaca. No se documenta si hubo RLHF, DPO u otra fase de alineacion adicional; el ajuste parece ser un SFT supervisado clasico sobre pares instruccion-respuesta. La model card afirma que el modelo responde identificandose como SmolLM2-360M-LoRA-Bal creado por shiva-ai-labs, lo que indica que parte del ajuste se dedico a modificar el comportamiento de identidad. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, atencion hibrida, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Respuesta a instrucciones en formato de chat, con plantilla basada en tokens especiales `<|im_start|>` y `<|im_end|>` (formato ChatML), segun el ejemplo de la model card.
- Comportamiento de identidad ajustado: el modelo declara ser SmolLM2-360M-LoRA-Bal creado por shiva-ai-labs cuando se le pregunta por su identidad.
- Generacion determinista disponible mediante `do_sample=False` en el ejemplo de uso.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.
- Al ser un modelo de 360 millones de parametros, sus capacidades de razonamiento, matematicas y codigo son sustancialmente menores que las de modelos de mayor escala; no hay evaluaciones publicadas que lo cuantifiquen.

## Casos de uso

- Experimentacion con LoRA y PEFT: sirve como ejemplo reproducible de como ajustar un modelo pequeno sobre un dataset de instrucciones y publicar solo el adaptador, reduciendo el coste de almacenamiento y distribucion.
- Prototipado de chatbots locales en ingles: al caber en hardware muy modesto, permite iterar rapidamente sobre interfaces conversacionales antes de migrar a un modelo mayor.
- Pruebas de identidad y comportamiento de marca: el ajuste de identidad documentado permite validar tecnicas de personalizacion de asistentes sin reentrenar el modelo completo.
- Educacion y docencia: util para demostrar el flujo completo base model + adaptador + fusion (merge_and_unload) y su despliegue con transformers.
- Evaluacion comparativa de tecnicas de ajuste: permite contrastar el comportamiento del adaptador frente al modelo base Instruct original en tareas de instrucciones en ingles.
- Generacion de texto auxiliar de bajo coste: borradores, resumenes cortos o respuestas plantilla en ingles donde no se requiera alta precision y el despliegue en CPU sea prioritario.
- Pruebas de integracion con vLLM, Ollama o llama.cpp tras fusionar el adaptador, segun indica la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en float16 requiere aproximadamente 0,7 GB adicionales sobre el modelo base; el modelo base de 360 millones de parametros en float16 ocupa en torno a 0,7 GB, por lo que el conjunto ronda 1,4 GB en memoria. La model card menciona un modelo fusionado de aproximadamente 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en float16; una RTX 3060, RTX 4060 o superior ofrece margen amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante con 4 GB o mas), y tambien en CPU.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), y tras `merge_and_unload()` se puede servir con vLLM, Ollama, llama.cpp o TGI, tal como sugiere la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-LoRA-Bal | 361.821.120 (adaptador) | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Ajuste comunitario sobre SmolLM2-360M-Instruct con alpaca-cleaned; sin benchmarks |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M aprox. | 8.192 tokens (segun documentacion del modelo base) | Apache-2.0 | Hugging Face (modelo oficial) | Modelo base oficial, con evaluaciones publicadas por Hugging Face; referencia directa |
| Qwen2.5-0.5B-Instruct | 0,5 B aprox. | 32.768 tokens (segun documentacion del modelo) | Apache-2.0 | Hugging Face | Alternativa de escala similar con contexto mayor y soporte multilingue amplio |
| TinyLlama-1.1B-Chat | 1,1 B aprox. | 2.048 tokens (segun documentacion del modelo) | Apache-2.0 | Hugging Face | Mayor numero de parametros y comunidad mas amplia; contexto menor |

Los datos de contexto de los modelos comparables provienen de su documentacion publica y no de la informacion proporcionada para este modelo; se incluyen como referencia orientativa. No hay benchmarks de SmolLM2-360M-LoRA-Bal que permitan una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea medible; el ajuste podria incluso degradar capacidades previas.
- Riesgo de alucinacion elevado por el tamano reducido (360 M) y por el entrenamiento sobre alpaca-cleaned, un dataset con respuestas generadas que puede contener imprecisiones.
- Sesgos: no documentados por el autor; el dataset alpaca-cleaned esta en ingles y puede reflejar sesgos culturales y linguisticos de su origen.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Longitud de contexto: no documentada para este ajuste; conviene asumir la del modelo base y verificar empiricamente.
- Licencia: Apache-2.0 en el adaptador, pero la model card advierte de que se deben confirmar los terminos del modelo base antes de un uso comercial. El modelo base SmolLM2 tambien es Apache-2.0, lo que en principio permite uso comercial, pero la responsabilidad de verificacion recae en el usuario.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia, sin comunidad ni mantenimiento demostrado. No apto para produccion sin evaluacion propia.
- El ajuste de identidad puede considerarse una modificacion deliberada del comportamiento; en aplicaciones donde la transparencia sobre el modelo subyacente sea requisito, esto debe tenerse en cuenta.
- La model card incluye afirmaciones de marketing ("Banking-Grade Security & SMT Assurance") sin ningun respaldo tecnico documentado; deben ignorarse a efectos de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/SmolLM2-360M-LoRA-Bal
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Visor de arquitectura mencionado en la model card: https://hfviewer.com/shiva123782/SmolLM2-360M-LoRA-Bal
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria transformers: https://github.com/huggingface/transformers
