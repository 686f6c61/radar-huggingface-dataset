# fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Go

## Resumen

ClearTrans 3B SFT: C++ to Go es un checkpoint de ajuste fino supervisado (SFT) de direccion unica basado en Qwen2.5-Coder-3B, desarrollado por el usuario fdsffjdkf como parte del artefacto de investigacion ClearTrans. El modelo resuelve una tarea muy concreta: la traduccion automatica de codigo fuente de C++ a Go, un caso de uso dentro de la traduccion de codigo entre lenguajes (code translation) que resulta relevante para procesos de modernizacion de bases de codigo legacy.

Se trata de un transformer decoder-only de la familia Qwen2 con 3.085.938.688 parametros totales (aproximadamente 3,1 mil millones), derivado por entrenamiento completo (full fine-tuning) del modelo base Qwen2.5-Coder-3B. El repositorio ocupa 6,8 GB en formato safetensors y esta pensado para investigacion y evaluacion, no como checkpoint final validado en produccion.

La relevancia de este lanzamiento es acotada y experimental: el propio autor advierte que no se ha validado la inferencia en GPU ni la reproduccion de benchmarks, y que el checkpoint corresponde a la etapa SFT, no a un modelo final entrenado con GRPO. Aun asi, documenta de forma transparente la configuracion de entrenamiento y publica los scripts de replicacion, lo que lo hace util como referencia metodologica para quien investigue traduccion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (qwen-research), uso no comercial para investigacion o evaluacion |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Direccion de traduccion | C++ a Go |
| Tamano del repositorio | 6,8 GB |
| Libreria | transformers |
| Version de Transformers registrada | 4.57.1 |
| Version de PyTorch registrada | 2.9.1 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del Qwen2.5-Coder-3B original: un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste se realizo como full supervised fine-tuning sobre los pesos del modelo base, no como adaptacion con LoRA ni como destilacion, segun indica la model card al referirse a "full supervised fine-tuning of the upstream Qwen2.5-Coder-3B model".

La configuracion de entrenamiento registrada incluye learning rate de 1e-5, batch size total de 64 (batch por dispositivo 1, 8 dispositivos, 8 pasos de acumulacion de gradiente), 3 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno y semilla 42. El dataset identificado es `train_full_1231_cpp2go_idx3`, especifico de la direccion C++ a Go, aunque los ejemplos de entrenamiento no se incluyen en el repositorio y el autor advierte que el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion del dataset. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa para este checkpoint.

## Capacidades

- Traduccion de codigo de C++ a Go como tarea principal y unica direccion entrenada.
- Generacion de texto y codigo en el estilo de la familia Qwen2.5-Coder, heredado del modelo base.
- Conversacion multi-turno mediante la plantilla de chat incluida en el repositorio.
- Razonamiento sobre construcciones de C++ y su equivalente idiomatico en Go (dentro de lo que permita el ajuste SFT).
- Soporte de tool calling: no confirmado para este checkpoint (el modelo base lo soporta, pero no se valida en la model card).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Migracion de modulos legacy de C++ a Go: el modelo puede recibir funciones o ficheros C++ y generar su equivalente en Go como punto de partida para una revision manual, aprovechando que fue ajustado especificamente en esa direccion.
- Prototipado rapido de traducciones en procesos de modernizacion: util para generar borradores que un ingeniero revisa y corrige, reduciendo el esfuerzo inicial en bases de codigo grandes.
- Investigacion en traduccion de codigo: sirve como checkpoint de referencia SFT para comparar con variantes entrenadas con RL (GRPO) u otras tecnicas dentro del artefacto ClearTrans.
- Generacion de pares de entrenamiento y evaluacion: puede usarse para producir traducciones C++-Go que luego se filtren y validen, alimentando pipelines de datos para otros modelos.
- Educacion y analisis comparativo de lenguajes: permite mostrar como se expresan patrones de C++ (punteros, plantillas, gestion manual de memoria) en Go (interfaces, genericos, garbage collection) con ejemplos generados.
- Reproduccion de experimentos: dado que se publican los scripts en el repositorio de GitHub de ClearTrans, el checkpoint sirve para replicar la etapa SFT y estudiar el efecto del ajuste sobre el modelo base.
- Evaluacion de calidad de traduccion automatica: como referencia para medir con tests y analizadores estaticos cuantas traducciones generadas compilan y pasan pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para este lanzamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6-7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB para pesos; en 4 bits, alrededor de 2-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference (etiqueta presente en el repositorio), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan artefactos GGUF oficiales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Cpp-to-Go | 3,09 B | no disponible | Traduccion C++ a Go (SFT) | Qwen Research (no comercial) | HuggingFace, pesos safetensors |
| Qwen2.5-Coder-3B | 3,09 B | no disponible en esta ficha | Generacion de codigo general | Qwen Research / Apache-2.0 segun variante | HuggingFace, ampliamente adoptado |
| CodeLlama-7B | 7 B | no disponible en esta ficha | Generacion de codigo general | Llama 2 Community | HuggingFace, muy extendido |
| StarCoder2-3B | 3 B | no disponible en esta ficha | Generacion de codigo general | BigCode OpenRAIL-M | HuggingFace |

La comparacion directa es limitada: los alternativos son modelos generalistas de codigo, mientras que ClearTrans esta especializado en una unica direccion de traduccion y no publica metricas que permitan situarlo frente a ellos en tareas de traduccion C++-Go.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda validarlas con tests y herramientas de analisis antes de usarlas.
- El checkpoint corresponde a la etapa SFT y no a un modelo final entrenado con GRPO; no debe interpretarse como el resultado definitivo del artefacto ClearTrans.
- No se ha validado la inferencia en GPU ni la reproduccion de benchmarks para este lanzamiento; solo se han comprobado el tamano de ficheros, el layout de tensores y los indices de shards.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una liberacion de pesos, no evidencia de reproduccion numerica completa.
- Licencia Qwen Research: uso permitido para investigacion o evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0, lo que restringe el uso comercial directo.
- El modelo esta entrenado para una unica direccion (C++ a Go); no se debe esperar buen rendimiento en la direccion inversa ni en otros pares de lenguajes.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de un modelo base de codigo, puede reproducir sesgos presentes en sus datos de preentrenamiento.
- Riesgo de alucinacion en APIs, librerias o construcciones idiomaticas de Go que el modelo no haya visto durante el ajuste.
- Idiomas soportados no documentados; la model card no especifica el comportamiento fuera de ingles tecnico y codigo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-Go
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Licencia (Qwen Research License Agreement): incluida en el fichero LICENSE del repositorio de HuggingFace
- Aviso de atribucion y modificaciones: fichero NOTICE del repositorio de HuggingFace
