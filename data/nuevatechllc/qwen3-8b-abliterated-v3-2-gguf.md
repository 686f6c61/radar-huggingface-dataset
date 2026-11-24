# NuevaTechLLC/Qwen3-8B-abliterated-v3.2-GGUF

## Resumen

Qwen3-8B-abliterated-v3.2-GGUF es una version modificada del modelo Qwen/Qwen3-8B de Alibaba, publicada por NuevaTechLLC, en la que se han eliminado (abliterated) los comportamientos de rechazo (refusals) mediante una edicion de direccion de rechazo de rango 1 buscada automaticamente. El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parametros (aproximadamente 8.2 mil millones) desarrollado por Alibaba Qwen. La modificacion se documenta en el estudio "Removing refusals with less damage: what worked, what did not, and why" (Nueva Tech, 2026), que busca minimizar el dano (divergencia KL respecto al modelo original en prompts inofensivos) sujeto a un objetivo de tasa de rechazo evaluado por un clasificador de seguridad.

La relevancia de esta ficha radica en que el modelo elimina el 97,5 % de los rechazos en un conjunto de 282 prompts retenidos de StrongREJECT, manteniendo una divergencia KL media de solo 0,0129 respecto al modelo base en 300 prompts inofensivos, lo que indica un cambio relativamente contenido en el comportamiento general. Las versiones GGUF publicadas (Q4_K_M y Q8_0) estan pensadas para inferencia local con llama.cpp y Ollama.

El modelo esta orientado a red teaming, investigacion en seguridad y docencia en hardware controlado por el usuario. No anade conocimiento nuevo respecto al modelo base: solo modifica la politica de rechazo. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) |
| Parametros totales | 8.190.735.360 (aprox. 8.2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | en (segun la model card; el modelo base soporta mas idiomas, pero no se documenta aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); existe una forma de adaptador LoRA de 2 MB segun la model card |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer denso de aproximadamente 8.2 mil millones de parametros. La modificacion aplicada es una edicion de direccion de rechazo de rango 1, localizada en una banda de capas centrada cerca del 0,6 de la profundidad de la red. No se aplica restauracion de norma (norm restore), de modo que la edicion es exactamente equivalente a un LoRA de rango 1, y la model card indica que existe una forma de adaptador de 2 MB. La busqueda de la direccion se realizo minimizando la divergencia KL respecto al modelo original en prompts inofensivos, sujeta a un objetivo de tasa de rechazo puntuado por el clasificador Qwen3Guard-Gen-8B.

Los resultados reportados corresponden a la semilla 0 de tres; las otras semillas midieron 0,057 / 0,0109 y 0,053 / 0,0112 (tasa de rechazo / KL). Las metricas se midieron sobre el modelo en bf16 y los GGUF son cuantizaciones de este. No se documentan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento adicional ni sobre si hubo RLHF o DPO especificos para esta edicion; la intervencion es una edicion de pesos post-entrenamiento, no un reentrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen3-8B base.
- Razonamiento y matematicas: los benchmarks reportados incluyen MMLU, ARC y GSM8K, con valores practicamente identicos al modelo base.
- Eliminacion de rechazos: responde a peticiones que el modelo original rechaza, con una tasa de rechazo medida de 0,025 en 282 prompts retenidos de StrongREJECT.
- Reduccion de sobre-rechazo: 0,003 en 300 prompts de OR-Bench, frente a 0,370 del modelo base.
- Plantilla de chat del modelo base embebida en los GGUF, lo que permite uso conversacional directo.
- Soporte de tool calling y function calling: no medido en la informacion disponible (se hereda del Qwen3-8B base, pero no se ha evaluado en esta edicion).
- Capacidades de agente y razonamiento multi-paso: no medidas en esta edicion.
- Capacidades multilingues: no medidas; la model card limita la evaluacion a ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Red teaming de sistemas de moderacion: el modelo permite generar respuestas que un modelo alineado rechazaria, lo que facilita probar clasificadores de seguridad y filtros de contenido en entornos controlados.
- Investigacion en interpretabilidad: al ser una edicion de rango 1 equivalente a un LoRA, permite estudiar como una unica direccion de activacion controla el comportamiento de rechazo en un transformer de 8B.
- Docencia sobre alineamiento y seguridad: sirve para demostrar en clase la diferencia entre refusal rate, over-refusal y divergencia KL usando el modelo base como referencia.
- Evaluacion comparativa de metodos de abliteration: el estudio compara esta version con Heretic 1.4.0 y con el modelo base, por lo que el modelo es util como punto de referencia reproducible en experimentos de eliminacion de rechazos.
- Despliegue local con Ollama o llama.cpp: los GGUF Q4_K_M y Q8_0 permiten ejecutar el modelo en hardware de consumo para pruebas de seguridad sin depender de servicios en la nube.
- Analisis de robustez de jueces automaticos: al incluir metricas puntuadas por Qwen3Guard-Gen-8B, el modelo permite estudiar el comportamiento de clasificadores de seguridad ante respuestas no rechazadas.
- Experimentacion con adaptadores LoRA: la forma de adaptador de 2 MB permite aplicar o retirar la edicion de forma controlada en pipelines de investigacion.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (model-index y model card). La tasa de rechazo se mide sobre 282 prompts retenidos de StrongREJECT con el juez Qwen3Guard-Gen-8B; la KL es la divergencia media por token respecto al modelo original en sus propias respuestas a 300 prompts inofensivos.

| Modelo | Rechazo (juzgado, 282 prompts) | Respuestas inseguras respondidas | Sobre-rechazo (300 OR-Bench) | KL respecto al base (300 prompts) | MMLU | ARC | GSM8K |
|---|---|---|---|---|---|---|---|
| base (Qwen3-8B) | 0,954 | 0,004 | 0,370 | 0,0000 | 0,757 | 0,560 | 0,892 |
| este modelo (v3.2) | 0,025 | 0,887 | 0,003 | 0,0129 | 0,760 | 0,555 | 0,902 |
| Heretic 1.4.0 (defaults) | 0,610 | 0,273 | 0,050 | 0,0057 | 0,757 | 0,557 | 0,897 |

Metricas del model-index (declaradas, no verificadas): refusal_rate = 0,025 y kl_divergence = 0,0129.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Para un modelo denso de 8.2 mil millones de parametros, la VRAM depende de la cuantizacion; el repositorio ocupa 13.7 GB en total, incluyendo ambas variantes GGUF.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; los GGUF Q4_K_M y Q8_0 estan pensados para llama.cpp, lo que sugiere viabilidad en hardware de consumo, pero no se aportan requisitos concretos.
- Opciones de despliegue: Ollama (`FROM ./Qwen3-8B-abliterated-v3.2-Q4_K_M.gguf` y `ollama create`) y llama.cpp (`llama-server -m Qwen3-8B-abliterated-v3.2-Q4_K_M.gguf`). No se documentan vLLM ni TGI para esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (StrongREJECT) | KL respecto al base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B-abliterated-v3.2 (este) | 8.190.735.360 | no disponible | 0,025 | 0,0129 | apache-2.0 | GGUF Q4_K_M y Q8_0 en Hugging Face |
| Qwen3-8B (base) | 8.190.735.360 | no disponible | 0,954 | 0,0000 | apache-2.0 | Hugging Face (Qwen/Qwen3-8B) |
| Heretic 1.4.0 (defaults) | no disponible | no disponible | 0,610 | 0,0057 | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; no sabe mas que el modelo base, solo cambia la politica de rechazo.
- El sobre-rechazo y la tasa de rechazo se midieron solo en ingles; la calidad de respuestas largas, el uso de herramientas y el comportamiento multilingue no se evaluaron.
- El juez (Qwen3Guard-Gen-8B) se trata como verdad fundamental; no hay verificacion con etiquetas humanas.
- Riesgo elevado de generar contenido inseguro por diseno: el 88,7 % de las respuestas a prompts inseguros fueron respondidas (frente al 0,4 % del base).
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-8B.
- Riesgo de alucinacion: no medido en esta edicion; se hereda del modelo base.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto en esta ficha; el idioma evaluado es solo ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto declarado es red teaming, investigacion en seguridad y docencia en hardware controlado; el usuario es responsable del cumplimiento de la licencia del modelo base y de la ley aplicable.
- Caveat para produccion: no usar como modelo de atencion al cliente o generacion publica sin moderacion externa, dado que responde a peticiones inseguras en el 88,7 % de los casos medidos.
- Los resultados corresponden a una sola semilla por fila (salvo indicacion); las otras semillas mostraron tasas de rechazo de 0,057 y 0,053.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen3-8B-abliterated-v3.2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/PAPER.md
- Codigo (busqueda, edicion, evaluacion, exportacion de adaptador): https://github.com/Limitlessmatrix/abliteration-study
- Datos del estudio (results.json): https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/data/results.json
- Version anterior: https://huggingface.co/NuevaTechLLC/Qwen3-8B-abliterated-v2-GGUF
