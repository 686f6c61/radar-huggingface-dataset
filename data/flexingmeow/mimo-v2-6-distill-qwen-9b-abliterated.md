# Flexingmeow/MiMo-V2.6-Distill-Qwen-9B-Abliterated

## Resumen
MiMo-V2.6-Distill-Qwen-9B-Abliterated es una edicion de pesos del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (9.409.813.744 parametros), publicada por el usuario Flexingmeow. No es un reentrenamiento ni un fine-tuning: es una ablacion de la direccion de rechazo (abliteration) aplicada a posteriori sobre los pesos, sin datos nuevos de entrenamiento. El objetivo declarado es reducir el rechazo excesivo que un modelo alineado muestra ante entradas que solo lo parecen maliciosas (un dropper capturado, un one-liner ofuscado, una peticion de mapeo a MITRE ATT&CK) en flujos de analisis de seguridad.

La variante publicada es la "D (aggressive)", que baja la tasa de rechazo del 78,1 % al 9,4 % sobre un conjunto de evaluacion retenido. Arquitectonicamente el modelo base usa `qwen3_5` (`Qwen3_5ForConditionalGeneration`), un diseno de atencion hibrida: una de cada cuatro capas emplea atencion completa y el resto usa atencion lineal basada en gated delta rule. Es un modelo denso de ~9,4B parametros, multimodal (image-text-to-text) y orientado a razonamiento, codigo y uso agentico.

Su relevancia es doble. Por un lado, demuestra que la ablacion de rechazo es viable en arquitecturas hibridas que las herramientas of-the-shelf (basadas en TransformerLens) no soportan, lo que obligo al autor a escribir un pipeline propio sobre `transformers`. Por otro, la ficha del autor documenta un hallazgo metodologico relevante: en modelos de razonamiento la direccion de rechazo no esta en el ultimo token del prompt, sino en los tokens generados dentro del span de razonamiento, y extraerla en el lugar equivocado produce un resultado nulo. El modelo se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (`Qwen3_5ForConditionalGeneration`), transformer hibrido con atencion completa cada 4 capas y gated delta rule (atencion lineal) en el resto |
| Parametros totales | 9.409.813.744 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante (el repositorio solo publica safetensors; existe GGUF del modelo base, no de esta edicion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Hidden size | 4096 |
| Numero de capas | 32 (indices 0-31) |
| Patron de atencion | atencion completa en las capas 3, 7, 11, 15, 19, 23, 27 y 31; atencion lineal en el resto |
| Tamano intermedio del MLP | 12288 |
| Matrices de escritura editadas | `mlp.down_proj`, `linear_attn.out_proj` / `self_attn.o_proj`, `embed_tokens` |
| Tamano del repositorio | 18,8 GB |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo base no se entrena en esta publicacion: es un checkpoint ya entrenado por Xiaomi MiMo mediante destilacion desde modelos de razonamiento mayores hacia una base Qwen3.5 de ~9B, seguido de supervised fine-tuning (SFT) con datasets generados por MiMo. Las cuatro areas objetivo declaradas para el modelo base son codigo, tareas de agente generales, codigo visual y ciberseguridad. La arquitectura `qwen3_5` combina atencion completa en 8 de las 32 capas con atencion lineal (gated delta rule) en las 24 restantes, un esquema hibrido que reduce coste de contexto largo a cambio de carga adicional en las capas de atencion completa.

Lo que introduce esta ficha es la edicion de pesos, no entrenamiento. El metodo sigue el trabajo de interpretabilidad de Arditi et al. (2024), que muestra que la decision de rechazo de un modelo instruido esta mediada en gran medida por una unica direccion en el residual stream. La implementacion concreta usa la variante MPOA (norm-preserving, biprojected orthogonalization): se ortogonaliza la direccion de rechazo fuera de cada matriz escritora del residual stream preservando la magnitud original de cada fila, de modo que la edicion es una rotacion pequena y no un reescalado. La verificacion sobre una capa editada reporta un cambio mediano de norma de fila de ~1e-5 y una similitud coseno de fila de 0,9999 entre pesos base y abliterados.

El hallazgo tecnico central del proyecto es la localizacion de la direccion. La primera implementacion la extraia en el ultimo token del prompt, antes de generar. En un modelo de razonamiento eso falla: MiMo decide entre rechazar y cumplir durante su span `<think>`, por lo que el ultimo token del prompt transporta una senal de clasificacion de tema, no la senal causal de rechazo. El extractor corregido genera una continuacion greedy corta (8 tokens) y promedia los hidden states del residual stream sobre las posiciones generadas. El resultado es una direccion mas coherente (coseno medio entre capas de 0,61 frente a 0,51) y, sobre todo, causalmente efectiva al ablacionarla.

## Capacidades
- Generacion de texto conversacional y razonamiento multi-paso, con trazas de pensamiento explicitas (`<think>`), heredadas del modelo base destilado.
- Generacion y comprension de codigo, incluyendo codigo visual, segun el enfoque del modelo base.
- Uso de herramientas y llamadas a funciones (tags `tool-use` y `agentic` en el modelo base), apto para flujos de terminal.
- Capacidad multimodal image-text-to-text, heredada del modelo base.
- Analisis de artefactos de seguridad (droppers, one-liners ofuscados, exploits sospechosos) con rechazo reducido, que es el objetivo declarado de la edicion.
- Tareas de mapeo y clasificacion tipo MITRE ATT&CK sobre comandos y muestras.
- Razonamiento aritmetico y de logica: el autor lo evalua como retencion de capacidad tras la ablacion, aunque los numeros concretos no figuran en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Analisis de malware en local: el modelo puede recibir un dropper o un script ofuscado y explicar su comportamiento sin recurrir a una API de moderacion externa. El interes es doble: reduce el rechazo espurio y evita la exfiltracion del artefacto analizado.
- Triaje de alertas SOC: interpretar una alerta, resumir el comando implicado y mapearlo a tecnicas de MITRE ATT&CK, integrandolo en un pipeline de triaje automatizado con tool calling.
- Ingenieria de deteccion: a partir de un artefacto sospechoso, proponer reglas de deteccion (Sigma, YARA, reglas de SIEM) y explicar la logica de la regla.
- Analisis de comandos ofuscados: decodificar y comentar one-liners de shell o PowerShell, explicando cada etapa de la cadena de ejecucion.
- Auditoria de seguridad de codigo: revisar fragmentos de codigo en busca de patrones de explotacion, con soporte de codigo visual si se aporta una captura.
- Asistente de desarrollo agentico: ejecucion de tareas de varios pasos con llamada a herramientas dentro de un entorno local sin dependencia de servicios en la nube.
- Documentacion de incidentes: redactar informes tecnicos post-mortem a partir de trazas y artefactos, aprovechando la ventana de contexto del modelo base (longitud exacta no disponible).
- Formacion y laboratorios de seguridad: practicar analisis de artefactos reales sin que un moderador externo bloquee la conversacion.

## Benchmarks y rendimiento

Datos de la ablacion reportados por el autor:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (conjunto harmful retenido) | 78,1 % (base) → 9,4 % (variante D, agresiva) |
| Energia de salida de la direccion sobre el peso editado (extractor prompt-final) | `‖R·W‖ / ‖W‖` = 0,0143 (~1,4 %) |
| Divergencia KL de la distribucion next-token (extractor prompt-final) | ~1e-7 (ruido de coma flotante) |
| Coseno medio entre capas de la direccion | 0,61 (extractor corregido) frente a 0,51 (extractor prompt-final) |
| Cambio mediano de norma de fila tras la edicion | ~1e-5 |
| Similitud coseno de fila base vs. abliterado | 0,9999 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16/fp16: aproximadamente 18,8 GB solo para pesos (9,41B parametros × 2 bytes), mas overhead de activaciones y cache KV. El autor ejecuto toda la inferencia en CPU (Intel i7-9700, 32 GB de RAM) con matmuls `nn.Linear` promocionados de bf16 a fp32 por ausencia de AVX-512 BF16 en ese procesador.
- Cuantizacion int8: aproximadamente 9-10 GB de pesos, segun el metodo.
- Cuantizacion int4 (GGUF Q4_K_M o similar): aproximadamente 5-6 GB de pesos, segun el metodo. Esta variante no distribuye GGUF propio; requeriria conversion desde safetensors.
- GPU recomendadas: por calculo de VRAM, cabria en una RTX 4090 (24 GB) en bf16 o fp16; en consumer de 16 GB encajaria en int8 o con cuantizacion; en 12 GB requiere int4. Para despliegue en produccion con contexto largo, A100 40/80 GB o H100 80 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Flexingmeow/MiMo-V2.6-Distill-Qwen-9B-Abliterated | 9,41B | no disponible | MIT | Ablacion de rechazo sobre MiMo-V2.6-Distill-Qwen-9B |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9,4B (aprox.) | no disponible | MIT | Modelo base destilado, agentico y multimodal |
| Otras ediciones abliteradas de modelos Qwen/Llama | no disponible | no disponible | MIT o Apache 2.0 segun caso | Ablacion sobre arquitecturas densas estandar |

El autor no publica comparativas con otros modelos abliterados ni con alternativas de la misma categoria. La informacion disponible no permite establecer una comparativa cuantitativa con modelos comparables.

## Limitaciones y advertencias
- El proposito explicito de la edicion es eliminar la capacidad de rechazo. El modelo cumplira peticiones que el modelo base rechazaria, incluidas peticiones genuinamente daninas. No debe exponerse a usuarios finales ni a entradas no controladas.
- La ablacion es unidireccional: no distingue entre input malicioso aparente e input realmente malicioso. El usuario asume toda la responsabilidad del uso.
- Todos los datos de evaluacion son del propio autor. No hay evaluacion independiente ni benchmarks estandar publicados.
- La ablacion afecta a `embed_tokens` ademas de a las matrices de atencion y MLP, lo que incrementa el riesgo de efectos secundarios no medidos sobre vocabulario y calidad general.
- La ficha del autor esta truncada en la tabla de variantes, por lo que no se detallan los parametros exactos de la variante D ni de las restantes.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el autor solo reporta retencion de capacidad en aritmetica, perplejidad sobre prompts benignos y KL del primer token.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue para esta variante.
- Longitud de contexto: no disponible, lo que dificulta planificar despliegues con documentos largos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero no exime de responsabilidad legal por el uso del modelo abliterado.
- Rendimiento de inferencia en produccion: los unicos datos publicados corresponden a CPU Intel i7-9700; no hay medidas de latencia o throughput en GPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Flexingmeow/MiMo-V2.6-Distill-Qwen-9B-Abliterated
- Modelo base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Revision concreta del modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/tree/2367e865d009c13ac81713a2878291d33ab28177
- Ficha de llms.ninja sobre MiMo-V2.6-Distill-Qwen-9B: https://llms.ninja/xiaomi/models/mimo-v2-6-distill-qwen-9b
- Especificaciones y requisitos de GPU en apxml: https://apxml.com/models/mimo-v2-6-distill-qwen-9b
- Analisis del GGUF de MiMo-V2.6-Distill-Qwen-9B: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
- Referencia metodologica citada por el autor: Arditi et al., 2024, "Refusal in Language Models Is Mediated by a Single Direction" (URL no disponible en la informacion proporcionada).
