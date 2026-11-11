# SmartDataPolito/SecureShellBert

## Resumen

SecureShellBert es un modelo de tipo RoBERTa (derivado de microsoft/codebert-base) especializado en Masked Language Modelling sobre comandos de shell Unix. Lo desarrolla SmartDataPolito, grupo de investigacion del Politecnico di Torino, y su proposito es servir como base de representacion para tareas de seguridad en linea de comandos, en particular la deteccion de sesiones maliciosas. El modelo fue adaptado al dominio mediante entrenamiento continuado (domain adaptation) sobre un corpus de mas de 20.000 sesiones Unix, combinando trafico malicioso del dataset HaaS y sesiones benignas de NLP2Bash.

Se trata de un modelo encoder-only de ~125 millones de parametros (arquitectura RoBERTa-base heredada de CodeBERT), con chunk size de 256 tokens durante el entrenamiento y una cabeza de masked language modelling. No es un modelo generativo: su salida util es la representacion contextual de tokens y la probabilidad de tokens enmascarados, lo que lo hace apropiado como backbone para clasificacion de secuencias y para preentrenamiento de clasificadores especializados.

Su relevancia practica radica en que fue el modelo base empleado para afinar LogPrecis, un clasificador de comandos de shell maliciosos publicado por el mismo grupo. La licencia Apache 2.0 y su tamano contenido lo hacen desplegable en CPU, aunque su naturaleza de modelo de investigacion (36 descargas, sin datos de benchmarks publicados en la informacion disponible) aconseja evaluarlo antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo RoBERTa (derivado de microsoft/codebert-base) |
| Parametros totales | no disponible (arquitectura base CodeBERT-base, ~125 M por herencia, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; entrenado con chunk size de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos PyTorch; cuantizacion dinamica INT8 posible via PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el dominio es shell Unix, predominantemente comandos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors/bin via transformers); repo de 1.0 GB |

## Arquitectura y entrenamiento

El modelo parte de CodeBERT (RoBERTa-base adaptado a codigo) y se somete a un entrenamiento de adaptacion de dominio con objetivo de masked language modelling, siguiendo la guia de Hugging Face para fine-tuning de modelos de lenguaje. La configuracion reportada es: 10 epocas, probabilidad de enmascaramiento de 0.15, batch size de 16, learning rate de 1e-5 y chunk size de 256 tokens. El corpus combina mas de 20.000 sesiones Unix, mezclando sesiones malignas del dataset HaaS (Honeypot as a Service, CZ.NIC) y sesiones benignas de NLP2Bash.

No se documenta en la model card el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo encoder-only de MLM). La innovacion tecnica principal es la adaptacion del vocabulario y las representaciones de CodeBERT al lenguaje de shell: pipelines, redirecciones, flags de utilidades Unix y comandos ofuscados, un dominio con distribucion muy distinta al codigo fuente de lenguajes de programacion convencionales.

## Capacidades

- Masked language modelling sobre secuencias de comandos de shell: predice tokens enmascarados en lineas de comandos Unix.
- Generacion de representaciones contextuales (embeddings) de comandos, utiles como backbone para clasificacion de secuencias.
- Deteccion de patrones propios de comandos maliciosos (descargas via wget/curl, cambios de permisos con chmod, modificacion de contrasenas con passwd, exfiltracion), segun los ejemplos del widget de la model card.
- Base para fine-tuning de clasificadores especializados; el autor lo uso para afinar LogPrecis.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No soporta vision ni audio.
- Capacidades multilingues: no documentadas; el dominio es comandos Unix en ingles.

## Casos de uso

- Deteccion de comandos maliciosos en produccion: usar las representaciones del modelo como entrada de un clasificador (como LogPrecis) para puntuar comandos de shell en tiempo real antes de su ejecucion en un host o contenedor.
- Analisis de sesiones SSH en honeypots: procesar el flujo de comandos capturado por sensores tipo HaaS y marcar sesiones con alta probabilidad de ser intrusion, aprovechando que el corpus de entrenamiento incluye trafico real de honeypot.
- Enriquecimiento de SIEM y EDR: generar embeddings de comandos para agrupar y clusterizar actividad de shell, facilitando la deteccion de campanas o familias de ataque por similitud.
- Filtrado en pipelines CI/CD: inspeccionar scripts de shell antes de ejecutarlos en runners, bloqueando patrones de descarga de binarios externos o escalada de privilegios.
- Investigacion en seguridad: punto de partida para fine-tuning con datasets propios de comandos, al ser un encoder ligero entrenable en una sola GPU consumer.
- Analisis forense: reconstruir y puntuar secuencias de comandos de logs de auditoria (auditd, bash history) para priorizar la revision manual de sesiones sospechosas.
- Preentrenamiento de modelos de NL2Bash o de asistencia a terminal: usar las representaciones como inicializacion en tareas de generacion o traduccion de lenguaje natural a comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara la metrica de perplexity sin valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~500 MB para los pesos del modelo base (~125 M de parametros, no confirmado); el repo ocupa 1.0 GB por incluir posibles checkpoints adicionales.
- Inferencia en FP16: ~250 MB de VRAM; en INT8 dinamico: ~125-150 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) y puede ejecutarse en CPU para cargas de baja concurrencia.
- GPUs recomendadas para fine-tuning: RTX 3090/4090 (24 GB) o A100/H100 para lotes grandes; el fine-tuning con batch 16 y secuencias de 256 tokens es viable en 8-12 GB de VRAM.
- Despliegue: transformers (PyTorch), vLLM no aplica (no es generativo), Text Generation Inference no aplica; opciones realistas son TorchServe, FastAPI + transformers, ONNX Runtime o cuantizacion dinamica de PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecureShellBert | ~125 M (no confirmado) | 256 tokens (entrenamiento) | MLM sobre shell Unix | Apache 2.0 | Hugging Face |
| microsoft/codebert-base | ~125 M | 512 tokens | MLM sobre codigo de 6 lenguajes | MIT | Hugging Face |
| SmartDataPolito/logprecis | no disponible | no disponible | Clasificacion de comandos maliciosos | no disponible | Hugging Face |
| RoBERTa-base | ~125 M | 512 tokens | MLM sobre texto general | MIT | Hugging Face |

Frente a CodeBERT-base, SecureShellBert aporta adaptacion al dominio de shell pero pierde cobertura multilingue de codigo y no documenta mejoras cuantificadas. Frente a LogPrecis, SecureShellBert es el backbone de preentrenamiento, no el clasificador final: para una tarea de deteccion directa conviene usar LogPrecis o afinar este modelo.

## Limitaciones y advertencias

- No se publican resultados de benchmarks ni comparaciones cuantitativas con CodeBERT-base; el beneficio de la adaptacion de dominio no esta medido de forma publica.
- El corpus de entrenamiento combina trafico de honeypot y sesiones benignas de NL2Bash; puede existir sesgo hacia los patrones concretos de esos datasets y hacia comandos en ingles.
- Riesgo de alucinacion en el sentido de predicciones de tokens plausibles pero incorrectas; al ser un modelo MLM no genera comandos completos de forma fiable sin un decodificador adicional.
- Ventana de contexto corta (256 tokens en entrenamiento): sesiones largas deben trocearse, lo que puede perder dependencias entre comandos distantes.
- La model card incluye en el widget ejemplos de comandos maliciosos (descarga de binarios, cambio de contrasena); no deben interpretarse como instrucciones ni ejecutarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye como material de investigacion.
- El modelo no ha sido evaluado para robustez frente a ofuscacion deliberada (encoding, variables, alias), un vector habitual en ataques reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmartDataPolito/SecureShellBert
- Modelo base CodeBERT: https://huggingface.co/microsoft/codebert-base
- LogPrecis (modelo afinado sobre este backbone): https://huggingface.co/SmartDataPolito/logprecis
- Repositorio GitHub de LogPrecis: https://github.com/SmartData-Polito/logprecis
- Articulo cientifico (Computers & Security): https://www.sciencedirect.com/science/article/pii/S0167404824001068
- Guia de Hugging Face para adaptacion de dominio: https://huggingface.co/learn/nlp-course/chapter7/3
- Dataset HaaS: https://haas.nic.cz/
- Dataset NLP2Bash: https://github.com/TellinaTool/nl2bash
