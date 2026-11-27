# ray0rf1re/hyperNix-3.1-mini_c

## Resumen

hyperNix-3.1-mini_c es un modelo de lenguaje de pequeno tamano (SLM) de aproximadamente 48,7 millones de parametros, publicado por el usuario ray0rf1re en Hugging Face. Se trata de un ajuste fino conversacional (chat-tune) del modelo base Compactbot/hypernix-3.1-mini, desarrollado con la libreria propia HyperNix y entrenado desde cero sobre la arquitectura denominada hypernix0x-v2. El modelo esta pensado para generar respuestas breves y sencillas en ingles, como admite explicitamente su propia model card.

El ajuste se realizo sobre el dataset HuggingFaceTB/smol-smoltalk (440.871 ejemplos) aplicando perdida solo sobre los turnos del asistente, lo que reduce el val_loss de 6,9494 (modelo sin ajustar) a 2,6645. Es relevante en el contexto de los modelos compactos experimentales: demuestra que es posible obtener un comportamiento conversacional basico con menos de 50 millones de parametros y una ventana de contexto muy limitada de 512 tokens.

Su interes practico es acotado: sirve como banco de pruebas para la libreria HyperNix, para experimentos de ajuste fino de bajo coste y para estudiar el comportamiento de SLM entrenados desde cero. No compite con modelos de proposito general en razonamiento, codigo o conocimiento factual, y su adopcion en produccion requeriria validacion adicional dada la escasez de documentacion tecnica y de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hypernix0x-v2), 8 capas, d_model 512, 8 cabezas de atencion, 2 cabezas KV (GQA), RoPE theta 100000 |
| Parametros totales | 48.706.048 (~48,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max seq len) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors; lm_head atado, no almacenado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con dimension de modelo 512, 8 cabezas de atencion y 2 cabezas KV (atencion con query grouping, GQA), embeddings rotatorios con theta 100000 y un vocabulario de 32.000 tokens. La cabeza de salida (lm_head) esta atada a los embeddings y no se almacena por separado en el fichero de pesos, lo que explica en parte el reducido tamano del repositorio (0,2 GB). La arquitectura pertenece a la familia propietaria hypernix0x-v2 y se carga mediante la clase BrewerModel de la libreria hypernix.

El entrenamiento parte de Compactbot/hypernix-3.1-mini, que segun la model card fue sometido a un run de preentrenamiento continuado en la infraestructura de Compact AI. Sobre esa base se aplico un ajuste fino supervisado con el dataset HuggingFaceTB/smol-smoltalk (440.871 ejemplos), usando perdida calculada unicamente sobre los tokens del asistente. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El formato de prompt es `User: <texto>\nAssistant: <texto>`, con EOS como terminador de turno.

## Capacidades

- Generacion de texto conversacional breve en ingles, orientada a respuestas cortas y simples.
- Dialogo de un solo turno o multi-turno muy limitado, condicionado por la ventana de 512 tokens.
- Seguimiento del formato de prompt `User:` / `Assistant:` con terminacion por EOS.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de codigo, matematicas avanzadas, vision ni audio.
- Multilingue: no; la model card declara unicamente ingles.
- No se documenta modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado de la libreria HyperNix: sirve como ejemplo funcional de carga de pesos safetensors con BrewerModel y BrewerConfig para desarrolladores que evaluan el ecosistema.
- Experimentos academicos con SLM: permite estudiar el efecto del ajuste fino supervisado con perdida solo en el asistente sobre un modelo de ~49 M de parametros, comparando val_loss antes (6,9494) y despues (2,6645).
- Generacion de respuestas cortas en entornos con recursos minimos: al ocupar menos de 0,2 GB en safetensors, puede ejecutarse en CPU o en GPUs de gama baja para tareas de completado simple en ingles.
- Base para ajustes finos de dominio: su licencia Apache 2.0 y su tamano permiten reentrenarlo en un dataset pequeno especifico (por ejemplo, respuestas de FAQ) en hardware de consumo.
- Evaluacion de formatos de prompt: util para probar plantillas conversacionales y terminadores EOS en pipelines de investigacion antes de escalar a modelos mayores.
- Docencia y divulgacion: ejemplo didactico de arquitectura transformer decoder-only con GQA y RoPE, con configuracion completa publicada en el repositorio.
- Pruebas de regresion en pipelines de inferencia: modelo ligero para validar integraciones de carga de safetensors y tokenizacion en CI sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion del ajuste conversacional:

| Metrica | Valor |
|---|---|
| val_loss (modelo sin ajustar) | 6,9494 |
| val_loss (hyperNix-3.1-mini_c) | 2,6645 |
| Dataset de ajuste | HuggingFaceTB/smol-smoltalk (440.871 ejemplos) |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (48,7 M de parametros en fp32 ocupan aproximadamente 195 MB); en fp16 alrededor de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: la model card solo documenta carga mediante la libreria hypernix (BrewerModel + safetensors). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, llama.cpp y Ollama no son viables sin conversion previa.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hyperNix-3.1-mini_c | ~48,7 M | 512 | Ingles | Apache 2.0 | Libreria propia hypernix; sin benchmarks publicados |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Ingles y otros | Apache 2.0 | Mayor tamano y contexto; ecosistema transformers estandar |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue | Apache 2.0 | Mucho mayor capacidad y contexto; soporte amplio de herramientas |
| TinyLlama-1.1B | 1,1 B | 2.048 | Ingles | Apache 2.0 | Un orden de magnitud mas grande; benchmarks publicados |

La comparacion directa con estos modelos es desfavorable en capacidad y contexto, pero hyperNix-3.1-mini_c se distingue por su tamano minimo y por estar construido sobre una pila propia (hypernix) en lugar de transformers. No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Tamano muy reducido (~49 M de parametros): se deben esperar respuestas cortas, simples y con conocimiento factual muy limitado, tal como advierte el propio autor.
- Ventana de contexto de 512 tokens: insuficiente para documentos largos, conversaciones extensas o prompts complejos.
- Solo ingles: no hay soporte documentado de otros idiomas, incluido el castellano.
- Riesgo elevado de alucinacion: al ser un modelo pequeno entrenado sobre smol-smoltalk, la probabilidad de generar afirmaciones incorrectas es alta.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre un dataset conversacional general, puede reproducir sesgos presentes en el mismo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad mas alla del val_loss, por lo que no se recomienda su uso en produccion sin evaluacion propia.
- Dependencia de la libreria hypernix: la carga requiere BrewerModel y BrewerConfig, lo que limita la portabilidad frente a transformers; no hay pesos GGUF ni integraciones con servidores de inferencia estandar.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Compactbot/hypernix-3.1-mini debe verificarse por si tuviera condiciones adicionales.
- Repositorio con muy poca traccion (213 descargas, 1 like): escasa comunidad y soporte, lo que reduce la fiabilidad a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ray0rf1re/hyperNix-3.1-mini_c
- Modelo base: https://huggingface.co/Compactbot/hypernix-3.1-mini
- Dataset de ajuste (smol-smoltalk): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Paper, blog o repositorio de la libreria hypernix: no disponible en la informacion proporcionada.
