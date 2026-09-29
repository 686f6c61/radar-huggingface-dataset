# OliviaRossi/MiMo-NeoHorse-9B-AGSI

## Resumen

MiMo-NeoHorse-9B-AGSI es un modelo de lenguaje de ~9.400 millones de parametros publicado por el usuario OliviaRossi en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusion (merge) de pesos de dos modelos de tamano similar: XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, orientado a razonamiento y tareas de ingenieria de software (SWE), y TokenRhythm/NeoHorse-1-9B, orientado a uso autonomo de terminal y agentes de programacion. El objetivo declarado es combinar ambas capacidades en un unico checkpoint de ~9,4B parametros con licencia MIT.

La fusion se ha realizado con una tecnica propietaria denominada AGSI (Adaptive Geodesic Spectral Interpolation), que el autor describe como una interpolacion esferica (SLERP) por filas sobre la variedad de pesos, con proteccion contra conflictos de fase (anti-phase conflict shielding) y preservacion de la invarianza de energia espectral. Los tags del repositorio incluyen qwen3_5, lo que apunta a una arquitectura transformer densa de la familia Qwen3.5, coherente con que uno de los modelos base sea una destilacion de Qwen de 9B.

La relevancia del modelo es limitada por su estado actual: no incluye model card con datos de entrenamiento, no publica resultados de benchmarks, no documenta la longitud de contexto y acumula 0 descargas en el momento de redactar esta ficha. Es, por tanto, un experimento de fusion interesante desde el punto de vista metodologico (AGSI) pero sin validacion empirica publica, apto para evaluacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag qwen3_5; derivado de la familia Qwen3.5) |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; solo pesos safetensors. Cuantizable externamente a GGUF, AWQ o GPTQ |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Pipeline | text-generation |
| Modelos base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B y TokenRhythm/NeoHorse-1-9B |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de pesos, no de un proceso de entrenamiento supervisado. La receta declarada, AGSI (Adaptive Geodesic Spectral Interpolation), combina SLERP aplicado fila por fila sobre la variedad de los tensores de cada modelo base, con dos componentes adicionales: un mecanismo de proteccion frente a conflictos de fase entre pesos (anti-phase conflict shielding) y una restriccion de invarianza de energia espectral para preservar la norma de los tensores fusionados. No se especifica el coeficiente de interpolacion global ni si este varia por capa o por modulo (atencion, MLP, embeddings).

La informacion sobre los datos de entrenamiento es indirecta: los dos modelos base son destilaciones. MiMo-V2.6-Distill-Qwen-9B procede de Xiaomi MiMo-V2.6 y se presenta como una destilacion orientada a razonamiento y SWE; NeoHorse-1-9B procede de DeepReinforce Ornith-1.5 y se presenta como un agente autonomo de terminal y codigo. No se documenta el numero de tokens de destilacion, la composicion del dataset, ni si hubo fases de RLHF o DPO en los modelos originales. Tampoco se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.) en el checkpoint fusionado.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline declarado text-generation.
- Razonamiento multi-paso (tag reasoning), heredado del modelo base de destilacion de Xiaomi MiMo-V2.6.
- Generacion y edicion de codigo (tag coding), con foco declarado en ingenieria de software.
- Uso de terminal y agentes autonomos (tags terminal-use y agentic), heredado de NeoHorse-1-9B.
- Soporte de tool calling / function calling: presumible en la practica por los tags agentic y terminal-use, pero no documentado explicitamente en la model card ni acompanado de plantilla de chat publicada.
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Sin capacidades de vision, audio, ni modo thinking explicito documentado.

## Casos de uso

- Agente de terminal autonomo: ejecucion de comandos shell, diagnostico de errores y reparacion iterativa de entornos de desarrollo, aprovechando la herencia del modelo base orientado a terminal-use.
- Asistente de programacion integrado en el IDE: autocompletado, generacion de pruebas unitarias y refactorizacion de funciones, apoyandose en la componente de destilacion SWE.
- Automatizacion de pipelines CI/CD: interpretacion de logs de build fallidos y propuesta de parches, con la ventaja de una licencia MIT que facilita la integracion interna.
- Razonamiento sobre repositorios de codigo en ingles o chino: analisis de documentacion tecnica y respuestas a preguntas sobre APIs en los dos idiomas soportados.
- Prototipado de agentes multi-paso: uso como cabecera de un sistema con tool calling donde el modelo decide que herramienta invocar y encadena resultados, previa validacion propia del soporte real de function calling.
- Investigacion sobre tecnicas de model merging: el checkpoint sirve como caso de estudio reproducible de la receta AGSI frente a merges SLERP o TIES convencionales.
- Chat tecnico de soporte en ingles y chino: atencion a desarrolladores con contexto de conversacion multi-turno, sujeto a la longitud de contexto real, no documentada.
- Generacion de scripts de automatizacion y tareas de administracion de sistemas, ambito natural de un modelo con especializacion en terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ni del modelo fusionado ni de comparaciones con los modelos base.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 18,8 GB en disco y en VRAM, mas el espacio de la cache KV y activaciones.
- VRAM estimada para inferencia: ~20-22 GB en bf16; ~10-11 GB en cuantizacion INT8; ~6-7 GB en cuantizacion de 4 bits (Q4_K_M o GPTQ/AWQ de 4 bits).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para bf16 sin cuantizar con contexto amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en RTX 4080, 4070 Ti Super o GPUs de 16 GB requiere cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, SGLang y TGI para safetensors; llama.cpp u Ollama previa conversion a GGUF; ninguna de estas rutas esta documentada por el autor, por lo que la compatibilidad debe verificarse.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-NeoHorse-9B-AGSI | 9,41B | no disponible | sin benchmarks publicados | MIT | safetensors en HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B nominal | no disponible | no disponible | no disponible | HuggingFace |
| TokenRhythm/NeoHorse-1-9B | 9B nominal | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de contexto de ninguno de los tres modelos, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada. Como alternativas genericas de la misma categoria (transformers densos de 7-9B con soporte agentic y de codigo) existen opciones ampliamente evaluadas como Qwen3-8B o Llama-3.1-8B, pero no se han publicado comparaciones directas frente a este merge.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni cartas de modelo detalladas. El rendimiento real es desconocido.
- Riesgo de degradacion por merge: la interpolacion de pesos puede producir perdida de capacidades respecto a los modelos originales, especialmente en tareas muy especializadas de cada uno de los padres.
- Alucinacion: como cualquier modelo de 9B sin RLHF documentado en el checkpoint fusionado, presenta riesgo de generar codigo, comandos de terminal o referencias de API inexistentes. En contextos de ejecucion de comandos el impacto puede ser alto.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano, por lo que su uso en espanol puede degradar la calidad de forma notable.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos o conversaciones extensas sin medirla previamente.
- Licencia MIT en el checkpoint, pero las licencias de los modelos base (Xiaomi MiMo y TokenRhythm NeoHorse) no se detallan en la informacion disponible. Antes de un uso comercial conviene verificar que ambas permiten la redistribucion derivada y el uso comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni discusiones publicas.
- Soporte de tool calling no confirmado documentalmente, pese a los tags agentic y terminal-use. Requiere validacion empirica con la plantilla de chat adecuada.
- Fecha de publicacion futura respecto al conocimiento habitual de los modelos citados: conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliviaRossi/MiMo-NeoHorse-9B-AGSI
- Modelo base 1: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base 2: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
