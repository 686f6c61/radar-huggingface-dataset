# ShawnHunk/formal-wenet-nameaug-v2

## Resumen

Formal Wenet NameAug v2 es un checkpoint de ajuste fino del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado por Qwen (Alibaba). El ajuste lo ha realizado ShawnHunk (contacto: Duan Wenke, Guangzhou Nantian, departamento de Innovacion) y esta orientado a la transcripcion de reuniones en chino con un registro escrito formal y a la mejora del reconocimiento de nombres propios. El modelo resuelve el problema de las transcripciones ASR que reproducen el habla coloquial y fallan en entidades nombradas, un caso frecuente en actas de reunion y documentacion corporativa.

Tecnicamente es un modelo de la familia Qwen3-ASR con 2.349.217.408 parametros en formato safetensors (708 tensores, 4,7 GB de repositorio), construido sobre la arquitectura del modelo base Qwen3-ASR-1.7B. El checkpoint corresponde al paso 587 de entrenamiento con semilla 44 y se ha entrenado sobre 9.388 filas de datos que combinan texto escrito formal, transcripciones internas de reunion y muestras con aumento de nombres propios.

Es relevante ahora porque demuestra un patron de especializacion vertical sobre un ASR multimodal moderno: en lugar de un modelo generalista, se publica un checkpoint de nicho para chino de reunion con un pipeline de inferencia concreto (qwen-asr 0.0.6, vLLM 0.17, Transformers 4.57.6). La model card es escasa en documentacion publica y no declara licencia ni idiomas, lo que limita su adopcion fuera del entorno para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de reconocimiento del habla de la familia Qwen3, ajuste fino del checkpoint Qwen/Qwen3-ASR-1.7B) |
| Parametros totales | 2.349.217.408 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (uso declarado en la model card); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 4.698.521.600 bytes, 708 tensores) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint Qwen/Qwen3-ASR-1.7B, un ASR de la familia Qwen3. La model card no detalla la arquitectura interna del modelo base (composicion de encoder acustico y decoder, mecanismo de atencion o tratamiento de audio), por lo que ese detalle debe consultarse en la documentacion oficial de Qwen3-ASR. El checkpoint publicado se etiqueta con el pipeline `qwen3_asr` y esta pensado para ejecutarse con el paquete `qwen-asr`, lo que confirma que mantiene la interfaz de inferencia del modelo original.

El entrenamiento se realizo sobre 9.388 filas compuestas por datos de registro escrito (书面化), transcripciones formales de reuniones internas y muestras con aumento de nombres propios (name augmentation). El checkpoint final es el paso 587 con semilla 44. No se documentan el numero de tokens de audio, la composicion exacta del dataset, la existencia de RLHF/DPO ni innovaciones tecnicas adicionales. Tampoco se incluyen los audios originales de reunion, las transcripciones fuente ni los logs de entrenamiento, lo que impide reproducir el ajuste. La alineacion temporal a nivel de palabra no esta integrada: requiere el modelo aparte `Qwen/Qwen3-ForcedAligner-0.6B`.

## Capacidades

- Reconocimiento automatico del habla en chino con salida en registro escrito formal (normalizacion de lenguaje coloquial a texto de acta).
- Transcripcion de reuniones y reuniones internas con estructura de acta.
- Reconocimiento reforzado de nombres propios (personas, organizaciones, terminos internos) mediante entrenamiento con aumento de entidades.
- Salida de texto plano por utterance mediante `model.transcribe(audio=..., language="Chinese")`.
- Seleccion de idioma explicita en la llamada de inferencia (la model card solo ejemplifica `Chinese`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla del propio ASR ni modo thinking.
- No se documenta capacidad multilingue mas alla del chino ni traduccion.

## Casos de uso

- Actas de reunion corporativa: el modelo convierte audio de reunion en chino en texto con registro escrito, lo que reduce el trabajo de edicion posterior para publicar actas internas.
- Documentacion de comites y revisiones: al normalizar el habla coloquial a texto formal, el resultado es directamente util para archivos de decision y actas de seguimiento.
- Reconocimiento de entidades en transcripciones: el entrenamiento con aumento de nombres propios mejora la transcripcion de nombres de personas, departamentos y productos internos, critico en entornos corporativos con jerga propia.
- Generacion de subtitulos y transcripciones de formacion interna: el registro formal encaja con material didactico y videos corporativos donde no se desea reproducir muletillas.
- Pipeline de post-procesado documental: la salida de texto puede alimentar sistemas de busqueda o resumen sobre reuniones, siempre que se anada por separado un modelo de resumen.
- Evaluacion interna de ASR especializado: sirve como checkpoint de referencia para comparar el efecto del ajuste formal y del name augmentation frente al Qwen3-ASR-1.7B original.
- Alineacion temporal de transcripciones: combinado con `Qwen/Qwen3-ForcedAligner-0.6B`, permite obtener marcas de tiempo por palabra para subtitulado, aunque el alineador no esta incluido en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors, ~4,7 GB de pesos): aproximadamente 6-8 GB de VRAM para pesos y activaciones de audio, sin margen para batch grande.
- GPU recomendadas: A100, H100 o L40S para despliegue con vLLM 0.17 y procesamiento por lotes; RTX 4090 y RTX 3090 son suficientes para inferencia de una sola secuencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en precision completa; con cuantizacion no documentada, el requisito podria reducirse, pero no hay artefactos publicados.
- Opciones de despliegue: `qwen-asr==0.0.6` con backend Transformers 4.57.6, vLLM 0.17 y vLLM Ascend (entorno NPU Ascend). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen del backend y del hardware; vLLM permite batching continuo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Formal Wenet NameAug v2 | 2,35 B | no disponible | ASR chino formal + nombres propios (ajuste fino) | no disponible | Hugging Face, repo publico |
| Qwen/Qwen3-ASR-1.7B | ~1,7 B (modelo base declarado) | no disponible | ASR generalista Qwen3 | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen3-ForcedAligner-0.6B | ~0,6 B | no disponible | Alineacion forzada palabra a palabra | no disponible en esta ficha | Hugging Face |

La comparativa con modelos ASR de otros fabricantes (Whisper, Parakeet, etc.) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card declara que el checkpoint es para evaluacion privada y uso interno compartido; no se especifica licencia, lo que impide confirmar el uso comercial.
- No se publican los audios de reunion, las transcripciones originales ni los logs de entrenamiento: el ajuste no es reproducible ni auditable.
- El entrenamiento se limita a 9.388 filas, un volumen pequeno que puede provocar sobreajuste al dominio de reunion interno y degradar el rendimiento en audio fuera de ese dominio.
- Solo se documenta uso en chino; no hay evidencia de comportamiento multilingue ni de robustez ante acentos o ruido no representados en el dataset.
- Riesgo de alucinacion y de sustitucion erronea de nombres propios: el name augmentation puede inducir a escribir entidades plausibles aunque no se hayan pronunciado.
- No incluye alineacion temporal; para marcas de tiempo por palabra hay que integrar por separado `Qwen/Qwen3-ForcedAligner-0.6B`.
- Dependencia de versiones concretas (`qwen-asr==0.0.6`, vLLM 0.17, Transformers 4.57.6); cambios de version pueden romper la inferencia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo ni de validacion por la comunidad.
- No se documentan sesgos especificos; al ser un ajuste sobre datos internos de una organizacion, es previsible un sesgo hacia su vocabulario y sus nombres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShawnHunk/formal-wenet-nameaug-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Alineador forzado requerido para timestamps: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Contacto del autor: wkduan@nantian.com.cn
