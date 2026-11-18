# ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-1e-compile

## Resumen

Qwen3.5-9B-tem300-Medical-SFT-1e-compile es un ajuste fino (SFT) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto, construido sobre la familia Qwen3.5 y con 9.409.813.744 parametros totales segun los pesos en safetensors. El nombre sugiere un ajuste orientado al dominio medico, aunque la model card no documenta el dataset de entrenamiento.

El modelo se presenta como un fine-tune rapido realizado con Unsloth y la libreria TRL de Hugging Face. Su modelo base es a su vez un derivado de Qwen3.5-9B sometido a un proceso de GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones (ifeval) con modo "think". El resultado es un checkpoint experimental, con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

Por su tamano (aproximadamente 9.4 mil millones de parametros) y su licencia Apache 2.0, resulta relevante como ejemplo de cadena de ajuste sobre Qwen3.5 con tecnicas de RL y SFT, y como candidato a experimentacion en entornos de investigacion medica. No obstante, la ausencia de benchmarks publicados y de documentacion sobre los datos de entrenamiento limita seriamente su uso en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 18.8 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y la modalidad image-text-to-text. Se infiere una arquitectura transformer con codificador visual y decodificador de lenguaje, propia de la familia Qwen3.5, pero no se especifican numero de capas, dimensiones ocultas, atencion (completa o lineal), ni mecanismos de decodificacion especulativa.

El entrenamiento consta de al menos dos etapas documentadas en la cadena de modelos: un ajuste con GRPO sobre tareas de seguimiento de instrucciones (modelo base `Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, con modo "think") y un posterior SFT orientado a dominio medico (este checkpoint, con sufijo `Medical-SFT-1e`, que sugiere 1 epoca de entrenamiento). El fine-tune se realizo con Unsloth y TRL, segun la model card. No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO. El sufijo `tem300` y `compile` no esta documentado.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo "think" heredado del modelo base (razonamiento paso a paso antes de responder).
- Procesamiento de entradas multimodal image-text-to-text: acepta imagenes junto con texto (pipeline declarado en Hugging Face).
- Seguimiento de instrucciones, reforzado mediante la etapa GRPO-ifeval del modelo base.
- Especializacion declarada en dominio medico por el sufijo del nombre, aunque no se documenta el alcance ni la calidad de dicha especializacion.
- Compatibilidad con text-generation-inference y transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo "think" del modelo base es compatible con razonamiento encadenado.
- Capacidades multilingues: solo se declara ingles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Experimentacion en investigacion medica: el modelo puede emplearse como punto de partida para tareas de pregunta-respuesta sobre literatura o informes clinicos en ingles, dado su ajuste SFT declarado en dominio medico, siempre con supervision humana y validacion contra fuentes.
- Procesamiento de imagenes medicas con texto asociado: al ser image-text-to-text, permite prototipar flujos que combinen una imagen (por ejemplo, un informe escaneado o una radiografia) con una pregunta en lenguaje natural, aunque la calidad en este dominio no esta validada.
- Generacion de resumenes de documentacion clinica: con contexto suficiente (longitud no especificada), puede resumir notas o articulos en ingles para revision posterior por personal sanitario.
- Evaluacion comparativa de cadenas de ajuste: util como caso de estudio de la secuencia GRPO + SFT con Unsloth/TRL para investigadores que analicen el efecto del ajuste por etapas.
- Asistente conversacional de dominio restringido en ingles: para prototipos de atencion al usuario en entornos sanitarios, con filtros y revision humana obligatoria por el riesgo de alucinacion.
- Fine-tuning posterior (continued pretraining o DPO): al estar en safetensors y con licencia Apache 2.0, sirve como base para nuevos ajustes en dominios especializados sin restricciones de licencia comercial.
- Despliegue en infraestructura propia: compatible con transformers y TGI, adecuado para entornos con requisitos de privacidad de datos sanitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 10 GB de pesos; a 4 bits: alrededor de 5-6 GB de pesos, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa y contextos largos; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en cuantizacion 8/4 bits.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB con cuantizacion a 4 bits, aunque el componente visual anade consumo adicional no cuantificado en la informacion disponible.
- Opciones de despliegue: transformers, text-generation-inference (TGI, declarado en los tags); vLLM, llama.cpp u Ollama no estan confirmados para esta arquitectura en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen3.5-9B-tem300-Medical-SFT-1e-compile | 9,4 B | no disponible | image-text-to-text | Apache 2.0 | no |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | 9,4 B (estimado) | no disponible | texto (segun cadena) | no disponible | no |
| Familia Qwen3.5-9B original | 9 B (aproximado) | no disponible | texto / multimodal segun variante | no disponible | no disponible en esta consulta |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas medicas ni generales; no debe asumirse que el ajuste SFT mejora al modelo base sin evaluacion propia.
- Riesgo elevado de alucinacion en dominio medico: un modelo de 9 B ajustado con una sola epoca sobre datos no documentados no ofrece garantias de fiabilidad clinica; su uso en decisiones sanitarias es inaceptable sin validacion externa.
- Datos de entrenamiento no documentados: se desconoce la procedencia, calidad y posibles sesgos del corpus medico utilizado.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no especificada: limita la planificacion de cargas con documentos largos.
- Modelo sin traccion en la comunidad (0 descargas, 0 likes) y creado en 2026-11-18: no ha sido auditado ni reproducido por terceros.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica, especialmente en el ambito sanitario (RGPD, reglamento europeo de IA).
- El sufijo `compile` y `tem300` no estan explicados; podrian indicar optimizaciones o hiperparametros no verificables.
- No se confirma soporte de tool calling ni de despliegue en vLLM/llama.cpp/Ollama, lo que puede complicar la integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/ConnorYU
