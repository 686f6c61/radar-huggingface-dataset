# HarithSami/qwen2.5-7b-instruct-arabic-yt-gguf

## Resumen

El modelo `HarithSami/qwen2.5-7b-instruct-arabic-yt-gguf` es un ajuste fino de `Qwen/Qwen2.5-7B-Instruct` especializado en la generacion de guiones largos para videos de YouTube en arabe. Lo desarrolla HarithSami, un autor independiente, y resuelve un problema muy concreto: producir guiones con estructura narrativa de alta retencion en cuatro dialectos arabes (golfo, levantino, egipcio e irakí), siguiendo una jerarquia XML canonica de ocho partes (`<hook>`, `<intro>`, `<backstory>`, `<stakes>`, `<escalation>`, `<cliffhanger>`, `<climax>`, `<cta>`).

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y una ventana de contexto nativa de 32.768 tokens en la familia Qwen2.5, aunque la model card recomienda configurar 4.096 tokens en LM Studio para este ajuste. El repositorio distribuido es una cuantizacion GGUF (variante `Q4_K_M` de 4,68 GB) pensada para inferencia local con llama.cpp, LM Studio u Ollama.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino con Unsloth sobre un dataset propio pequeno (126 filas en la version v3) y ofrece una variante de 16 bits fusionada para vLLM o despliegue en nube, ademas del adaptador LoRA original. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), ajuste fino supervisado sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens recomendados en LM Studio; contexto nativo de la base Qwen2.5 no confirmado en la informacion disponible |
| Tipos de cuantizacion | GGUF `Q4_K_M` (4,68 GB) en este repositorio; variante 16 bits fusionada en repositorio separado |
| Idiomas soportados | Arabe (dialectos golfo, levantino, egipcio e irakí); la model card declara `language: ar` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en la variante 16 bits fusionada |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) de Qwen2.5-7B-Instruct, un transformer denso con atencion por rotacion posicional (RoPE) y las innovaciones propias de la familia Qwen2.5. El entrenamiento se realizo con Unsloth, segun las etiquetas del repositorio, sobre el dataset `HarithSami/arabic-youtube-scripts-sft` en su version v3, compuesto por 126 filas de guiones de YouTube en arabe. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovacion principal no es arquitectonica sino de formato: el modelo aprende a generar guiones completos siguiendo una jerarquia XML estricta de ocho etiquetas (`<hook>` a `<cta>`) y a mantener un dialecto arabe puro sin mezclarlo con otros. La model card insiste en desactivar el `repeat penalty` (dejarlo en 1.0) para no penalizar las etiquetas XML ni las raices arabes, lo que sugiere que el ajuste fino es sensible a los hiperparametros de decodificacion. Se distribuyen tres variantes: el adaptador LoRA, la version 16 bits fusionada para vLLM y esta cuantizacion GGUF para inferencia local.

## Capacidades

- Generacion de texto largo en arabe con estructura narrativa de retencion: gancho, introduccion, trasfondo, apuestas, escalada, cliffhanger, climax y llamada a la accion.
- Produccion en cuatro dialectos arabes diferenciados: golfo (خليجية), levantino (شامية), egipcio (مصرية) e irakí (عراقية), con instruccion explicita de no mezclarlos.
- Salida estructurada en XML con etiquetas canonicas, lo que facilita el postprocesado y la integracion en pipelines de generacion de contenido.
- Control de tono (narrativo, informativo, entretenimiento, documental) e ritmo (rapido, medio, pausado) mediante el prompt de usuario.
- Conversacion multi-turno heredada de la base Qwen2.5-7B-Instruct.
- Capacidades generales de la base (codigo, matematicas, razonamiento) potencialmente degradadas por el ajuste fino especializado; no hay evaluacion publicada que lo cuantifique.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de guiones para canales de YouTube arabes: el modelo recibe titulo, idea, dialecto, ritmo y tono, y devuelve un guion completo con la estructura XML de ocho partes, listo para locucion o edicion.
- Creacion de contenido multi-dialecto para agencias: un mismo brief se puede reutilizar cambiando el parametro de dialecto para producir versiones dirigidas a audiencias del golfo, Levante, Egipto e Irak sin reescribir el guion desde cero.
- Prototipado rapido de formatos narrativos: la jerarquia `<hook>` a `<cta>` permite experimentar con estructuras de retencion y comparar variantes de guion de forma sistematica.
- Postprocesado automatizado: al emitir XML bien formado, la salida se puede parsear para extraer secciones, medir longitud por bloque o alimentar herramientas de texto a voz seccion por seccion.
- Despliegue local en estaciones de trabajo: la cuantizacion `Q4_K_M` de 4,68 GB permite ejecutar el modelo en LM Studio u Ollama en equipos con GPU de consumo, sin enviar contenido a servicios externos.
- Servicio en nube con vLLM: la variante 16 bits fusionada permite servir el modelo con mayor fidelidad de cuantizacion para equipos que generan guiones a escala.
- Fine-tuning posterior o investigacion de dialectos: el adaptador LoRA publicado facilita experimentar con nuevos estilos o dialectos sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un notebook de evaluacion de cuatro dialectos en Kaggle (`harithsami/inference-test`), pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion `Q4_K_M` (4,68 GB de pesos mas overhead de contexto); la variante 16 bits requiere alrededor de 15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para la version GGUF; A100 o H100 para la variante 16 bits con vLLM.
- Cabe en GPU de consumo: si, con la cuantizacion `Q4_K_M` en tarjetas con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (via GGUF), vLLM o TGI con la variante 16 bits fusionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-instruct-arabic-yt-gguf | 7,6 mil millones | 4.096 recomendados | Guiones YouTube en 4 dialectos arabes | Apache 2.0 | GGUF, 16 bits y LoRA |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 32.768 (nativo de la familia) | Proposito general, multilingue | Apache 2.0 | safetensors, GGUF oficiales |
| Adaptaciones arabes de Qwen2.5-7B | no disponible | no disponible | Generico en arabe | variable | no disponible |

La comparacion directa con otros ajustes finos arabes de la misma base no esta disponible en la informacion proporcionada. Frente a la base Qwen2.5-7B-Instruct, este modelo gana especializacion en formato y dialectos pero probablemente pierde capacidades generales y ventana de contexto efectiva.

## Limitaciones y advertencias

- El dataset de ajuste es muy pequeno (126 filas en v3), lo que aumenta el riesgo de sobreajuste al formato y de baja diversidad en los guiones generados.
- La model card recomienda desactivar el `repeat penalty`; con otros valores el modelo puede degradar las etiquetas XML o repetir raices arabes de forma anomala.
- Riesgo de mezcla de dialectos pese a la instruccion explicita; la model card insiste en exigir "dialecto puro" en el prompt, lo que sugiere que no siempre se cumple.
- El modelo esta disenado para generar guiones de YouTube; su uso fuera de ese dominio puede producir salidas con estructura XML innecesaria o forzada.
- No hay evaluacion publicada de sesgos, alucinacion ni calidad linguistica por dialecto en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre derechos de autor de los guiones producidos.
- La ventana de contexto efectiva recomendada (4.096 tokens) limita la generacion de guiones muy largos en una sola pasada.
- El repositorio tiene 0 likes y 765 descargas, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/HarithSami/qwen2.5-7b-instruct-arabic-yt-gguf
- Variante 16 bits fusionada: https://huggingface.co/HarithSami/qwen2.5-7b-instruct-arabic-yt-merged
- Adaptador LoRA: https://huggingface.co/HarithSami/qwen2.5-7b-instruct-arabic-yt-lora
- Dataset de ajuste: https://huggingface.co/datasets/HarithSami/arabic-youtube-scripts-sft
- Espejo del dataset en Kaggle: https://www.kaggle.com/datasets/harithsami/arabic-youtube-scripts-sft
- Notebook de fine-tuning en Kaggle: https://www.kaggle.com/code/harithsami/yt-arabic-scripts-qwen-finetune
- Benchmark de evaluacion de 4 dialectos en Kaggle: https://www.kaggle.com/code/harithsami/inference-test
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
