# Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B

## Resumen

MultiHint-9K-Llama-3.1-8B es un adaptador LoRA sobre Llama-3.1-8B-Instruct disenado especificamente para generar pistas socraticas en tareas de comprension lectora. Dado un pasaje, una pregunta y su respuesta, el modelo produce una pista breve que orienta al estudiante hacia la solucion sin desvelarla. Lo desarrolla Kamyar Zeinalipour (junto con un equipo de la Universidad de Siena y del Institute for Cognitive Science and Technology) y se presento en el paper *MultiHint-9K: Orchestrating Human and AI Agency for Scalable Pedagogical Hint Generation* (AIED 2026).

El modelo resuelve un problema concreto en el ambito educativo: la generacion automatica de retroalimentacion pedagogica de calidad a escala. En lugar de dar la respuesta directamente, el adaptador aprende a formular preguntas guia y sugerencias que fomentan el razonamiento del alumno. Es relevante porque demuestra que un ajuste fino ligero (LoRA) sobre un modelo abierto de 8B puede mejorar sustancialmente el rendimiento en una tarea especializada, con un incremento del 52 % en ROUGE-L respecto al modelo base.

El adaptador se entreno sobre MultiHint-9K, un conjunto de 9.987 tuplas pregunta-respuesta-pista verificadas automaticamente y calibradas por humanos en ingles, italiano y persa. La arquitectura subyacente es la de Llama-3.1-8B-Instruct (transformer decoder-only de 8.000 millones de parametros y 128.000 tokens de contexto), y los pesos del adaptador se distribuyen en formato safetensors compatible con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de Llama-3.1) |
| Idiomas soportados | ingles, italiano, persa |
| Licencia | llama3.1 (licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only con atencion causal, RoPE y GQA. El ajuste fino emplea LoRA con rango r = 32, alpha = 64 y dropout de 0,1 sobre las proyecciones de atencion y MLP. El entrenamiento se realizo durante 3 epocas con AdamW, tasa de aprendizaje de 1e-4 con decaimiento coseno, precision bf16 y Flash Attention 2.

El conjunto de datos MultiHint-9K contiene 9.987 tuplas pregunta-respuesta-pista en ingles, italiano y persa, verificadas automaticamente y calibradas por humanos. El prompt de inferencia sigue una plantilla fija de "Recall Assistant" que recibe pasaje, pregunta y respuesta, y produce la pista socratica. No se documentan fases de RLHF o DPO adicionales; el entrenamiento es supervisado sobre el dataset de pistas.

## Capacidades

- Generacion de pistas socraticas: produce sugerencias breves que guian hacia la respuesta sin revelarla, a partir de un pasaje, una pregunta y su respuesta.
- Comprension lectora: razona sobre el contenido del pasaje para formular preguntas guia coherentes.
- Multilingue: soporta ingles, italiano y persa en la tarea de generacion de pistas.
- Generacion de texto general: hereda las capacidades del modelo base Llama-3.1-8B-Instruct (razonamiento, codigo, matematicas, tool calling), aunque el ajuste LoRA esta orientado a la tarea educativa.
- Instrucciones en formato conversacional: compatible con la plantilla de chat de Llama-3.1-Instruct.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Tutoria educativa automatizada: el modelo genera pistas socraticas para plataformas de aprendizaje de lenguas y comprension lectora, guiando al alumno sin darle la respuesta directamente. Es adecuado porque se entreno especificamente sobre tuplas pregunta-respuesta-pista calibradas por humanos.
- Generacion de material didactico: un profesor puede introducir un pasaje y una pregunta de su temario y obtener una pista lista para usar en clase o en un cuaderno de ejercicios.
- Sistemas de evaluacion formativa: integrado en un entorno de practica, el modelo ofrece retroalimentacion inmediata tras cada intento fallido del estudiante, fomentando el razonamiento en lugar de la memorizacion.
- Plataformas multilingues de aprendizaje: al cubrir ingles, italiano y persa, permite desplegar la misma funcionalidad pedagogica en distintos mercados sin entrenar modelos separados.
- Investigacion en NLP educativo: sirve como linea base reproducible para comparar estrategias de generacion de pistas y de ajuste fino ligero (LoRA) en tareas pedagogicas.
- Asistentes de lectura en aplicaciones moviles o web: el adaptador es pequeno (2,3 GB) y puede cargarse sobre el modelo base en infraestructura modesta, lo que facilita su integracion en productos de bajo coste.
- Generacion de bancos de pistas para evaluacion: permite crear conjuntos de pistas de referencia para validar otros modelos o para anotar datasets educativos a gran escala.

## Benchmarks y rendimiento

| Modelo base | Adaptador | ROUGE-L (base → fine-tuned) |
|---|---|---|
| Llama-3.1-8B | MultiHint-9K-Llama-3.1-8B | 0,20 → **0,32** (+52 %) |
| Qwen2.5-14B | MultiHint-9K-Qwen2.5-14B | 0,23 → **0,31** (+34 %) |
| Mistral-7B-v0.3 | MultiHint-9K-Mistral-7B-v0.3 | 0,19 → **0,32** (+57 %) |
| Mistral-Nemo-12B | MultiHint-9K-Nemo-12B | 0,15 → **0,31** (+100 %) |
| Mistral-Small-24B | MultiHint-9K-Mistral-Small-24B | 0,18 → **0,33** (+71 %) |

Todas las mejoras son estadisticamente significativas (p < 0,001, Wilcoxon con correccion de Bonferroni). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama-3.1-8B-Instruct en bf16 requiere aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade una sobrecarga minima (2,3 GB en disco, varios cientos de MB en memoria).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en produccion con contexto largo; RTX 4090 (24 GB) para inferencia en bf16; RTX 3090/4080 (16-24 GB) para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 u 8 bits (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070).
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L (fine-tuned) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiHint-9K-Llama-3.1-8B | 8B | 128.000 | 0,32 | llama3.1 | Hugging Face |
| MultiHint-9K-Mistral-7B-v0.3 | 7B | 32.000 | 0,32 | Apache 2.0 | Hugging Face |
| MultiHint-9K-Nemo-12B | 12B | 128.000 | 0,31 | Apache 2.0 | Hugging Face |
| MultiHint-9K-Mistral-Small-24B | 24B | 128.000 | 0,33 | Apache 2.0 | Hugging Face |
| MultiHint-9K-Qwen2.5-14B | 14B | 32.000 | 0,31 | Apache 2.0 | Hugging Face |

El adaptador sobre Llama-3.1-8B iguala en ROUGE-L a alternativas de mayor tamano (Mistral-Small-24B alcanza 0,33 con el triple de parametros) y supera a Qwen2.5-14B y Mistral-Nemo-12B, lo que lo convierte en una opcion eficiente en coste para la tarea de generacion de pistas. La principal desventaja frente a los adaptadores sobre Mistral es la licencia: llama3.1 impone restricciones adicionales para uso comercial a gran escala.

## Limitaciones y advertencias

- El modelo esta especializado en generacion de pistas socraticas para comprension lectora; su rendimiento en tareas generales es el del modelo base, sin mejoras adicionales.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pistas que no se derivan del pasaje o que revelan parcialmente la respuesta; se recomienda validacion en entornos de produccion.
- Cobertura limitada de idiomas: solo se entreno en ingles, italiano y persa; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia llama3.1: el uso comercial esta sujeto a los terminos de la licencia de Meta, que incluyen restricciones para empresas con mas de 700 millones de usuarios mensuales y obligaciones de atribucion.
- El adaptador requiere cargar el modelo base Llama-3.1-8B-Instruct, lo que anade dependencia de los pesos de Meta y de su aceptacion de licencia en Hugging Face.
- No se documentan evaluaciones con metricas automaticas mas alla de ROUGE-L ni estudios de sesgo; no hay datos sobre el comportamiento del modelo con pasajes de dominios especializados (cientifico, legal, medico).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad fuera del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B
- Dataset MultiHint-9K: https://huggingface.co/datasets/Kamyar-zeinalipour/MultiHint-9K
- Coleccion MultiHint-9K: https://huggingface.co/collections/Kamyar-zeinalipour/multihint-9k-aied-2026-6af4875966cf330a922a1d87
- Paper (CEUR Workshop Proceedings, AIED 2026): https://ceur-ws.org/Vol-4248/short11.pdf
- Repositorio GitHub: https://github.com/KamyarZeinalipour/MultiHint-9K
- Scripts de entrenamiento: https://github.com/KamyarZeinalipour/MultiHint-9K/tree/main/training
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
