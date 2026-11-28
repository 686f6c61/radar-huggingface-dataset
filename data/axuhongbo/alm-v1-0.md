# axuhongbo/ALM-V1.0

## Resumen

ALM-V1.0 (Autonomous Log & Threat Hunting Model) es un modelo de lenguaje especializado en ciberseguridad defensiva, desarrollado por el equipo de investigación "APT Threat Hunting & Cyber Defense Research Team" y publicado por el usuario axuhongbo en Hugging Face. Está construido sobre el modelo base Qwen/Qwen3.8-27B mediante cuantización y ajuste fino orientado a tareas de detección de amenazas persistentes avanzadas (APT), análisis de logs, respuesta a incidentes (DFIR) y operaciones de centro de seguridad (SOC).

El modelo aborda tres problemas concretos que el autor identifica en los LLM de propósito general aplicados a seguridad: la incapacidad de correlacionar cadenas causales entre logs heterogéneos (tráfico de red, auditoría del sistema, logs de host), la alta tasa de falsos positivos por alucinación de conceptos de seguridad, y la dificultad para procesar volúmenes masivos de logs en ventanas de contexto largas. Para ello declara una ventana nativa de 96 000 tokens, alineación con las tácticas de MITRE ATT&CK y capacidad de generar scripts forenses de desofuscación de forma autónoma.

La relevancia actual del modelo radica en su enfoque hacia la automatización del hunting de amenazas desconocidas y la reducción de la fatiga de alertas en SOC, un área donde los modelos generalistas rinden de forma insuficiente. El repositorio ocupa 16,8 GB y se distribuye principalmente en formato GGUF, lo que facilita su despliegue en llama.cpp y Ollama además de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 96 000 tokens (declarado por el autor) |
| Tipos de cuantizacion | GGUF (el repositorio se distribuye en este formato); niveles concretos no disponibles |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria: gguf); safetensors no disponible en el repo |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen3.8-27B, con 27 320 697 856 parametros, y se distribuye como una cuantizacion GGUF del modelo base con ajuste fino adicional. El autor menciona el uso de Flash Attention y de una arquitectura de reutilizacion de KV Cache en Q8 para sostener la ventana de 96 000 tokens, si bien no se detallan en la informacion disponible las capas, dimensiones ocultas ni el numero de cabezas de atencion.

En cuanto a los datos de entrenamiento, la model card indica que se emplearon muestras reales de ejercicios nacionales de ataque y defensa, caracteristicas del arsenal de APT y grandes volumenes de logs de multiples fuentes del ciberespacio, con un proceso de alineacion de grafos causales de ataque y defensa y ajuste de codigo de investigacion tipo agente. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad defensiva.
- Analisis y correlacion de logs heterogeneos (trafico de red, auditoria de sistema, logs de host) para reconstruir cadenas de ataque end-to-end.
- Mapeo de comportamiento adversario a tacticas de MITRE ATT&CK (TA0001 a TA0011 segun la model card).
- Generacion autonoma de scripts forenses en Python y Bash para desofuscar payloads (hexadecimal, Base64, encapsulado en protocolos).
- Capacidad de agente con razonamiento multi-paso para investigacion de incidentes.
- Soporte declarado de tool calling / function calling (etiqueta `agent` y compatibilidad con endpoints).
- Capacidades multilingues limitadas a chino e ingles.
- Analisis de memoria (por ejemplo, sondas sobre Redis) y filtrado de lineas de tiempo en Zeek.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Hunting de APT desconocidos: el modelo recibe lotes de logs de multiples hosts y segmentos de red dentro de su ventana de 96 000 tokens y reconstruye la linea temporal del ataque, senalando los pasos y las tacticas MITRE implicadas.
- Triaje de alertas en SOC: se usa como capa de correlacion sobre el SIEM para descartar falsos positivos antes de escalar a analistas, aprovechando la precision del 100 % declarada en los escenarios de evaluacion.
- Respuesta a incidentes (DFIR): dado un volcado de auditoria de Linux o trafico Zeek, el modelo genera scripts de extraccion y desofuscacion para identificar el payload real y el vector de entrada.
- Analisis de descargas maliciosas ofuscadas: ante comandos codificados en hexadecimal o Base64 en logs de auditoria, el modelo escribe sondas en Python o Bash para decodificar y reconstruir la carga de ataque.
- Deteccion de movimiento lateral y exfiltracion: con logs de autenticacion y flujos de red, el modelo identifica credenciales comprometidas, saltos entre hosts y transferencias anormales hacia el exterior.
- Automatizacion de playbooks de investigacion: integrado como agente con tool calling, consulta APIs del SIEM, ejecuta consultas y sintetiza el informe del incidente de forma multi-paso.
- Analisis de entornos cloud y SaaS: detecta escaladas de privilegios en metadatos de instancia, SSRF contra servicios internos y accesos cruzados entre inquilinos en logs de auditoria multi-tenant.

## Benchmarks y rendimiento

Los resultados publicados por el autor proceden del benchmark propio `ludas-test`, compuesto por cinco escenarios de演练 APT con 8,876 millones de logs reales y evaluacion ciega en sandbox `sandbox-exec` de macOS. La puntuacion oficial combina 30 % de F1 de tactica TA, 20 % de F1 de identificacion fisica y 50 % de puntuacion de pasos de ataque.

| Escenario | Qwen3.8-27B base (zero-shot) | MiniMax (original) | MiniMax (reparado) | 1013 SFT | ALM-V1.0 |
|---|---|---|---|---|---|
| case_001 (LameHug) | 53,75 | 34,38 | 66,65 | 68,96 | 76,22 |
| case_002 (GTG10007) | 71,91 | 63,27 | 63,27 | 82,80 | 75,01 |
| case_003 (GTG10002 SSRF) | 76,67 | 33,06 | 64,17 | 83,85 | 100,00 |
| case_004 (Jade Puffer) | 58,58 | 68,63 | 68,63 | 96,30 | 81,30 |
| case_005 (GTG50014) | 0,00 (timeout) | 67,52 | 78,57 | 88,69 | 77,50 |
| Media global | 52,18 | 53,37 | 68,26 | 84,12 | 82,01 |
| Falsos positivos totales | 29 | 53 | 0 | 12 | 0 |

Metricas agregadas declaradas para ALM-V1.0: precision de evidencia fisica 100,0 %, recall de evidencia fisica 63,7 %, y cero falsos positivos en los cinco escenarios. La model card no desglosa el F1 de tactica TA completo en el texto disponible. Estos resultados son autoevaluados por el autor sobre un benchmark propio y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: para un modelo denso de 27,3 B en GGUF, las cuantizaciones Q4_K_M requieren aproximadamente 16-18 GB de VRAM; Q5_K_M en torno a 19-21 GB; Q8_0 cerca de 29-30 GB; FP16 aproximadamente 55 GB. Los niveles exactos publicados en el repo no estan disponibles.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y contextos de 96k; RTX 4090 (24 GB) para cuantizaciones Q4/Q5; RTX 3090 (24 GB) en las mismas condiciones.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y GPUs con 24 GB o mas usando cuantizacion Q4 o Q5; en GPUs de 16 GB solo con cuantizaciones mas agresivas y contextos reducidos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (la model card menciona compatibilidad con endpoints), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la cuantizacion, la GPU y la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ALM-V1.0 | 27,3 B | 96k | Ciberseguridad / APT | Apache 2.0 | GGUF |
| Qwen3.8-27B (base) | 27 B | no disponible | Generalista | Apache 2.0 | safetensors |
| MiniMax (variante evaluada) | no disponible | no disponible | Generalista | no disponible | no disponible |
| 1013 SFT (variante evaluada) | no disponible | no disponible | Ajuste supervisado | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en la evaluacion del autor. No se dispone de datos de benchmarks publicos independientes (MMLU, HumanEval, GSM8K) para ALM-V1.0 ni para los modelos de referencia en el dominio de ciberseguridad.

## Limitaciones y advertencias

- Los resultados de rendimiento (100 % de precision, cero falsos positivos) proceden de un benchmark propio del autor (`ludas-test`) y no han sido replicados de forma independiente; deben tomarse con cautela.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano, lo que puede degradar el rendimiento en logs o interfaces en espanol.
- Riesgo de alucinacion en dominios fuera de ciberseguridad y en la interpretacion de logs con formatos no vistos durante el entrenamiento.
- La ventana de 96k tokens, aunque declarada, puede degradar la calidad en contextos muy largos; no se documentan pruebas de aguja en pajar ni de recuperacion a maxima longitud.
- El modelo esta disenado para asistir a analistas, no para sustituir la validacion humana; un falso negativo en deteccion de APT tiene consecuencias criticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que conviene revisar antes de desplegar en produccion.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a ataques adversarios (prompt injection sobre logs maliciosos).
- El repositorio tiene un volumen de descargas muy bajo (81) y cero likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/axuhongbo/ALM-V1.0
- Modelo base: https://huggingface.co/Qwen
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
