# OBLITERATUS/feyospace-s1-OBLITERATED

## Resumen

Feyospace-s1 Obliterated es una variante "abliterated" del modelo feyospace/feyospace-v1.1-small, un modelo de 28.000 millones de parametros especializado en ciberseguridad que alcanza un 63,24 % de exito verificado en CyberGym. El desarrollo corre a cargo del usuario OBLITERATUS, que ha aplicado su propio toolkit homonimo (publicado bajo AGPL-3.0) para eliminar las direcciones de rechazo excesivamente amplias del modelo original, permitiendo que responda a consultas de seguridad que de otro modo declinaria.

El modelo conserva la arquitectura multimodal Qwen3_5ForConditionalGeneration (texto + vision) y un backbone de 64 capas con atencion hibrida DeltaNet/atencion completa. Los pesos suman 27.781.427.952 parametros (unos 27,8 B) en bfloat16, con un tamano de repositorio de 55,6 GB. Se distribuye mediante safetensors y licencia Apache-2.0.

Su relevancia estriba en el metodo de preservacion de capacidades: la tecnica ASPA (Ablation with Source-Preservation and Alpha-scaling) con alpha 0,895 reajusta los pesos ablacionados hacia el propio checkpoint original, de modo que la perdida de conocimiento especifico de ciberseguridad se mantiene por debajo de 1,21 puntos porcentuales en la evaluacion SecBench, mientras el incremento de perplejidad se limita a un factor de 1,19.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hibrida DeltaNet / atencion completa), 64 capas, multimodal texto-imagen |
| Parametros totales | 27.781.427.952 (unos 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, ajustado por el equipo Feyospace sobre 164.269 trayectorias de ciberseguridad verificadas por ejecucion. La arquitectura es un transformer hibrido de 64 capas que combina capas DeltaNet (atencion lineal) con capas de atencion completa, e incorpora un codificador de vision que en esta variante pasa intacto desde el modelo fuente (333 tensores sin modificar). La clase de implementacion es Qwen3_5ForConditionalGeneration y el pipeline declarado es image-text-to-text.

Sobre ese checkpoint se aplico abliteracion avanzada con OBLITERATUS: se extrajeron 4 direcciones de rechazo mediante SVD a partir de las capas 49-63 (rango fuerte; el rango global usado fue 12-50 de 64, es decir, 0,19-0,78) y se aplico proyeccion de sesgo con preservacion de norma. Despues, ASPA con alpha 0,895 reajusto los pesos ablacionados hacia el propio Feyospace-s1 (auto-tethering) en lugar de hacia el Qwen3.8-27B de partida, con el fin de no diluir el ajuste fino de ciberseguridad. El proceso se ejecuto en una NVIDIA A100-SXM4-80GB en bfloat16. No se documentan en la informacion disponible fases de RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de dominio general y de ciberseguridad.
- Razonamiento tecnico y resolucion de tareas de seguridad (analisis, clasificacion conceptual, explicacion de ataques y defensas).
- Comprension de imagen y texto de forma conjunta (pipeline image-text-to-text).
- Generacion de codigo, segun la metrica de capacidad del toolkit (puntuacion 5/6: code, instruction, JSON, tool call, visual).
- Tool calling / function calling declarado como capacidad retenida.
- Salida estructurada en JSON.
- Multilingue: no disponible (no se documentan los idiomas soportados).
- Modo "thinking": no disponible (no se menciona en la informacion proporcionada).

## Casos de uso

- Analisis de vulnerabilidades en revision de codigo: el modelo puede examinar fragmentos de codigo y senalar patrones de riesgo, apoyandose en su ajuste fino sobre trayectorias de seguridad y en la retencion de la capacidad de generacion de codigo.
- Soporte a equipos SOC en triaje de alertas: redactar explicaciones de indicadores, clasificar eventos por dominio (red, identidad,端点) y proponer pasos de contencion, aprovechando el conocimiento preservado en SecBench.
- Generacion de reglas y firmas de deteccion: producir expresiones de deteccion a partir de descripciones en lenguaje natural, con salida en JSON para integrarla en pipelines automatizados.
- Documentacion de cumplimiento y estandares: apoyar la redaccion de textos sobre normas y regulaciones de seguridad, dominio evaluado con 43,24 % en SecBench.
- Formacion y simulacros internos (red team/blue team): generar escenarios y preguntas de practica sobre tecnicas de ataque y defensa, dado que la abliteracion reduce los rechazos ante este tipo de contenido.
- Asistente multimodal para analisis de capturas: interpretar capturas de pantalla de paneles, consolas o configuraciones junto con texto, gracias al pipeline image-text-to-text.
- Automatizacion con agentes: encadenar llamadas a herramientas (tool calling) para tareas de reconocimiento y consulta documental en un flujo multi-paso.

## Benchmarks y rendimiento

SecBench (661 preguntas de opcion multiple en ingles, A100-80GB, bfloat16, decodificacion greedy, atencion SDPA), comparando original frente a ablacionado:

| Dominio | Original | Abliterated | Delta |
|---|---:|---:|---:|
| Application Security (n=27) | 48,15 % | 40,74 % | -7,41 % |
| Cloud Security (n=103) | 56,31 % | 54,37 % | -1,94 % |
| Data Security (n=84) | 48,81 % | 48,81 % | 0,00 % |
| Endpoint & Host Security (n=10) | 50,00 % | 40,00 % | -10,00 % |
| Identity & Access Control (n=136) | 52,94 % | 52,21 % | -0,73 % |
| Network & Infrastructure (n=72) | 41,67 % | 40,28 % | -1,39 % |
| Security Management (n=56) | 44,64 % | 44,64 % | 0,00 % |
| Software/Hardware Fundamentals (n=136) | 53,68 % | 52,94 % | -0,74 % |
| Standards & Regulations (n=37) | 43,24 % | 43,24 % | 0,00 % |
| Overall (n=661) | 50,38 % | 49,17 % | -1,21 % |

Metricas de calidad del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| Perplejidad de referencia | 3,050 |
| Perplejidad tras abliteracion | 3,637 |
| Incremento de perplejidad | 1,19x |
| Divergencia KL | 0,163 nats (presupuesto: 0,5) |
| Retencion de coherencia | 1,0 |
| Puntuacion de capacidad | 5/6 (code, instruction, JSON, tool call, visual) |
| Fraccion de salida degenerada | 0,0 % |

CyberGym (modelo original): 63,24 % de exito verificado. No se publican en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 55,6 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 80 GB (A100-SXM4-80GB es el hardware documentado para la abliteracion).
- Cuantizacion (estimacion, no documentada por el autor): 4 bits en torno a 15-17 GB; 8 bits en torno a 28-30 GB. No se publican variantes GGUF/AWQ/GPTQ.
- GPU recomendadas: A100-80GB y H100-80GB para bfloat16 sin cuantizar. En consumer, una RTX 4090 (24 GB) no permite bfloat16 completo; con cuantizacion a 4 bits podria ser viable, pero es una estimacion no confirmada.
- Despliegue: transformers con AutoModelForImageTextToText y attn_implementation="sdpa". El autor indica que se requieren flash-linear-attention>=0.5.2 y causal-conv1d>=1.7.0 por la arquitectura hibrida DeltaNet/atencion completa. Compatibilidad con vLLM, TGI o llama.cpp no confirmada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| feyospace-s1-OBLITERATED | 27,78 B | no disponible | SecBench 49,17 %, CyberGym 63,24 % (base) | Apache-2.0 | safetensors |
| feyospace/feyospace-v1.1-small | 28 B (no confirmado) | no disponible | SecBench 50,38 %, CyberGym 63,24 % | Apache-2.0 | safetensors |
| Qwen3.8-27B (modelo base) | 27 B (segun card) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos ablacionados de ciberseguridad comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina direcciones de rechazo amplias: el modelo puede generar contenido de seguridad ofensiva que otros modelos declinarian. Esto implica riesgo de uso indebido y exige controles de acceso en produccion.
- Riesgo de alucinacion: no se documentan tasas de alucinacion; la perplejidad aumenta de 3,050 a 3,637 (1,19x), lo que sugiere una ligera degradacion en la distribucion del lenguaje.
- Perdida de capacidad medida: -1,21 puntos en SecBench global, con caidas mayores en dominios de muestra pequena (Endpoint & Host Security -10,00 % con n=10; Application Security -7,41 % con n=27). Estas cifras tienen alta varianza por tamano muestral.
- Idiomas: no disponible; la evaluacion se realizo solo con preguntas en ingles (661 MCQ en ingles), por lo que el comportamiento multilingue no esta verificado.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Licencia Apache-2.0 en el modelo, pero el toolkit OBLITERATUS se distribuye bajo AGPL-3.0; conviene revisar la compatibilidad si se integra el codigo de abliteracion, no solo los pesos.
- Desajustes en la propia model card: se mencionan simultaneamente "Qwen3.5" (etiqueta y arquitectura) y "Qwen3.8-27B" (modelo base), asi como dos rutas de HuggingFace distintas ("OBLITERATUS/feyospace-s1-OBLITERATED" en el repositorio y "Sherpa/feyospace-s1-obliterated" en el ejemplo de codigo). Hay que verificar la ruta correcta antes de desplegar.
- Repositorio con 0 descargas y creado el 13 de octubre de 2026: madurez y soporte comunitario no contrastados.
- Requisitos de dependencias especificos (flash-linear-attention, causal-conv1d) pueden limitar la portabilidad a frameworks de inferencia que no soporten la arquitectura hibrida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OBLITERATUS/feyospace-s1-OBLITERATED
- Modelo base: https://huggingface.co/feyospace/feyospace-v1.1-small
- Toolkit OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Dataset SecBench: https://huggingface.co/datasets/secbench-hf/SecBench
