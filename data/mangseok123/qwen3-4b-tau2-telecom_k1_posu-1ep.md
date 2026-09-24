# MANGSEOK123/qwen3-4b-tau2-telecom_k1_posU-1ep

## Resumen

qwen3-4b-tau2-telecom_k1_posU-1ep es un ajuste fino del modelo denso Qwen3-4B-Instruct-2507 (4.411.424.256 parametros) publicado en Hugging Face por el usuario MANGSEOK123 bajo licencia Apache-2.0. No se trata de un modelo generalista nuevo, sino de la consolidacion en los pesos de un conjunto de memorias de tarea del dominio telecom del benchmark tau2-bench, mediante una tecnica que el autor etiqueta como experience distillation (OEL, on-policy experience learning). El modelo base es de julio de 2025 (variante Instruct, sin modo thinking) y el ajuste se publico el 23 de septiembre de 2026.

El entrenamiento es deliberadamente minimo y reproducible: 34 pares tarea-memoria, batch de 12, una sola epoca con tres pasos registrados, learning rate constante de 3e-6, gradient clipping de 1.0 y una perdida de divergencia KL completa sobre todos los tokens de respuesta con kl_topk = 256. El profesor es el mismo modelo con la memoria de la tarea inyectada en el system prompt, y el alumno reproduce la tarea sin memoria; la unica diferencia entre ambos es el prompt y no se emplea ninguna recompensa. El simulador de usuario es gpt-4.1-mini con temperatura 0.

Su relevancia es fundamentalmente metodologica: muestra un protocolo barato para destilar experiencia de tarea en agentes de tool calling sin RL ni datos anotados manualmente. Ahora bien, el modelo no ha sido evaluado: el autor indica que se subio inmediatamente despues del entrenamiento, y solo aporta como referencia la puntuacion del modelo base en tau2-bench telecom (avg 0,056 / pass@4 0,175).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion por grupos (GQA), familia Qwen3; heredada sin cambios del modelo base |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card. El comando de despliegue recomendado usa `--max-model-len 40960` (40.960 tokens); el modelo base admite ventanas mayores de forma nativa |
| Tipos de cuantizacion | El autor no publica versiones cuantizadas. El repositorio contiene pesos safetensors de 8,8 GB (coherente con bf16 para 4,41 B de parametros). Al conservar la arquitectura Qwen3, es cuantizable con herramientas estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No documentado en la model card. El ajuste se ha realizado sobre tareas de telecomunicaciones en ingles; el modelo base declara soporte multilingue segun el informe tecnico de Qwen3 |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El ajuste no modifica la arquitectura: parte de Qwen3-4B-Instruct-2507, un transformer denso de 4,41 B de parametros con atencion por consultas agrupadas (GQA) y tokenizador de la familia Qwen3. El modelo base pertenece a la rama Instruct de la serie 2507, que elimina el modo thinking presente en las versiones Qwen3 originales y esta orientada a respuestas rapidas dirigidas por contexto. El autor no documenta ningun cambio estructural ni tecnica de decodificacion especulativa.

La innovacion esta en el procedimiento de consolidacion. Para cada uno de los 34 pares tarea-memoria del dominio telecom de tau2-bench, el alumno reproduce la tarea sin memoria mientras el profesor (los mismos pesos) la reproduce con la memoria de esa tarea insertada en el system prompt. La perdida es una KL completa sobre todos los tokens de respuesta restringida a los 256 tokens de mayor probabilidad (kl_topk = 256), con learning rate constante de 3e-6, gradient clipping de 1.0 y batch de 12. Se registran tres pasos, con perdidas KL de 0,019, 0,025 y 0,014, entropias de 0,201, 0,320 y 0,322 y normas de gradiente de 6,420, 3,736 y 0,963; el propio autor advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del lote y no una curva de convergencia. No hay RLHF, DPO ni funcion de recompensa.

## Capacidades

- Generacion de texto y conversacion multi-turno en el dominio de atencion al cliente de telecomunicaciones.
- Tool calling / function calling, con soporte explicito del parser `hermes` en vLLM mediante `--enable-auto-tool-choice --tool-call-parser hermes`.
- Razonamiento de agente en varios pasos: tau2-bench telecom modela un agente que interactua con un simulador de usuario y con un entorno de herramientas del operador (facturacion, planes, incidencias, roaming).
- Reproduccion de rutinas y politicas aprendidas mediante destilacion de memoria, sin necesidad de inyectar la memoria en el prompt en tiempo de inferencia.
- Capacidades generales heredadas del modelo base Qwen3-4B-Instruct-2507 (redaccion, codigo, matematicas, multilingue), potencialmente intactas dado el entrenamiento tan corto, aunque no verificadas.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agente de atencion al cliente para operadoras de telefonia: el modelo puede gestionar conversaciones con un usuario simulado y resolver incidencias de facturacion, cambios de tarifa o activacion de servicios invocando las herramientas del entorno, que es exactamente el escenario que define el dominio telecom de tau2-bench.
- Investigacion en destilacion de experiencia en agentes: sirve como artefacto reproducible para estudiar si la consolidacion por KL sobre pares tarea-memoria es suficiente para internalizar rutinas sin recompensa explicita.
- Baseline experimental en tau2-bench telecom: util para comparar variantes de consolidacion (por ejemplo, frente a la variante compsub del mismo autor) sobre el mismo modelo base.
- Prototipado de pipelines de tool calling con vLLM: el comando de servicio documentado permite levantar un endpoint compatible con el parser hermes y validar integraciones de function calling en minutos.
- Generacion de dialogos sinteticos de soporte tecnico: puede emplearse como generador de trazas de conversacion en ingles para preentrenar o aumentar datos de otros agentes del sector.
- Punto de partida para ajustes en otros dominios: la receta es agnostica al vertical, como demuestra la variante equivalente del autor para el dominio airline de tau2-bench.
- Despliegue on-premise de bajo coste: con 4,41 B de parametros cabe en una unica GPU de consumo, lo que permite ejecutar el agente en infraestructura propia sin enviar datos de clientes a terceros.

## Benchmarks y rendimiento

El modelo ajustado no ha sido evaluado. El autor solo proporciona la referencia del modelo base en el split de test de tau2-bench telecom.

| Modelo | tau2-bench telecom (avg) | tau2-bench telecom (pass@4) |
|---|---|---|
| Qwen3-4B-Instruct-2507 (modelo base) | 0,056 | 0,175 |
| qwen3-4b-tau2-telecom_k1_posU-1ep (este ajuste) | No evaluado | No evaluado |

No se han publicado resultados de benchmarks en la informacion disponible para el modelo ajustado.

## Requisitos de hardware

- Pesos en bf16: 8,8 GB (dato confirmado por el tamano del repositorio: 4,41 B de parametros a 2 bytes).
- Cache KV estimada en bf16 con GQA: en torno a 144 KB por token, es decir aproximadamente 1,2 GB a 8K de contexto y 5,9 GB a 40.960 tokens. Son estimaciones derivadas del tamano del modelo, no medidas publicadas.

| Configuracion | Pesos | VRAM total estimada | GPU de ejemplo |
|---|---|---|---|
| bf16, contexto 40.960 | 8,8 GB | ~16-18 GB | RTX 4090, RTX 3090, L40S, A100 40 GB |
| bf16, contexto 8K | 8,8 GB | ~11-12 GB | RTX 4080, A4000, L4 |
| 4 bits (Q4_K_M / AWQ), contexto 8K | ~2,5-2,8 GB | ~5 GB | RTX 3060 12 GB, RTX 4060 Ti 8 GB |
| fp8 / int8, contexto 8K | ~4,4 GB | ~7 GB | RTX 3070, RTX 4060 Ti 16 GB |

- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB sin cuantizar con contexto moderado, y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (`vllm serve MANGSEOK123/qwen3-4b-tau2-telecom_k1_posU-1ep --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`). Al ser arquitectura Qwen3, tambien son viables llama.cpp, Ollama, TGI y SGLang, aunque el autor no los documenta.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio de ajuste | Licencia | Estado |
|---|---|---|---|---|---|
| qwen3-4b-tau2-telecom_k1_posU-1ep (este) | 4,41 B | No especificado (despliegue a 40.960) | tau2-bench telecom | Apache-2.0 | Publicado, sin evaluar |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,41 B | No disponible en la informacion proporcionada | Generalista | Apache-2.0 | Publicado, con puntuacion de referencia en tau2-bench telecom |
| MANGSEOK123/qwen3-4b-tau2-telecom-compsub-1ep | No disponible | No disponible | tau2-bench telecom (variante compsub) | No disponible | Publicado |
| MANGSEOK123/Qwen3-4B-OEL-airline-tau2 | No disponible | No disponible | tau2-bench airline | No disponible | Publicado |

Los tres modelos del autor comparten previsiblemente el mismo modelo base y la misma receta, diferenciandose en el dominio o en la variante de consolidacion. No se dispone de resultados comparativos entre ellos porque ninguno ha sido evaluado publicamente.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica explicitamente que se subio inmediatamente despues del entrenamiento, por lo que no existe evidencia publicada de mejora sobre el modelo base en tau2-bench telecom ni en ningun otro conjunto.
- Entrenamiento sobre 34 pares con una sola epoca: riesgo alto de sobreajuste a esas tareas concretas y de generalizacion nula a casos no vistos del mismo dominio.
- Sin señal de recompensa: la consolidacion se limita a imitar la distribucion del profesor con memoria; no hay garantia de que el comportamiento destilado sea correcto ni de que respete las politicas del operador.
- Riesgo de alucinacion en llamadas a herramientas: como cualquier agente de function calling, puede invocar funciones con argumentos inexistentes o inventar identificadores de cliente, planes o importes.
- Olvido catastrofico potencial: aunque el entrenamiento es muy corto, cualquier ajuste de este tipo puede degradar capacidades generales del modelo base; no se ha medido.
- Alcance idiomatico: las tareas de tau2-bench telecom estan en ingles; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Ambito funcional estrecho: es un modelo para el vertical de telecomunicaciones, no un asistente general ni un modelo de razonamiento.
- Licencia: Apache-2.0 permite uso comercial y modificacion sin restricciones adicionales, pero se ofrece sin garantias; conviene verificar las condiciones de uso de Qwen3-4B-Instruct-2507 como modelo base.
- Dependencia de vLLM y del parser hermes: fuera de esa configuracion, el formato de las llamadas a herramientas puede no interpretarse correctamente.
- Ausencia de datos de sesgo y seguridad: no hay evaluaciones de sesgo, toxicidad ni robustez frente a prompt injection, algo critico en un agente con acceso a herramientas de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_k1_posU-1ep
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante hermana (tau2-bench telecom, compsub): https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom-compsub-1ep
- Variante hermana (tau2-bench airline): https://huggingface.co/MANGSEOK123/Qwen3-4B-OEL-airline-tau2
- Informe tecnico de Qwen3 (arXiv, resumen): https://arxiv.org/abs/2505.09388
- Informe tecnico de Qwen3 (arXiv, HTML): https://arxiv.org/html/2505.09388v1
- Sitio oficial de Qwen: https://qwen.ai/home
