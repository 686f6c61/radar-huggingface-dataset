# Ashoksainibadu/fine-tuned-text2sql

## Resumen

Fine-tuned-text2sql es un ajuste fino mediante QLoRA del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario Ashoksainibadu, orientado especificamente a la traduccion de lenguaje natural a consultas SQL (text-to-SQL). El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Coder-3B-Instruct, con 3.085.938.688 parametros totales, y se ha adaptado sobre pares de entrenamiento del benchmark Spider. El resultado se distribuye en formato GGUF Q4_K_M (1,9 GB) junto con una configuracion de servicio que incorpora validacion AST mediante sqlglot y un sandbox de ejecucion SQLite en modo solo lectura.

La propuesta diferencial no es solo el ajuste fino, sino el pipeline de seguridad que lo acompana: validacion estatica de AST antes de ejecutar, sandbox de base de datos de solo lectura y politicas de bloqueo de consultas potencialmente peligrosas. Segun la model card, el modelo alcanza un 71,57 % de execution accuracy en Spider Dev (n=1.034) en su version fusionada FP16, frente al 62,28 % del modelo base en zero-shot, y mantiene un 70,70 % tras cuantizacion Q4_K_M.

Es relevante ahora porque demuestra un patron practico para desplegar asistentes text-to-SQL con garantias de seguridad en entornos de investigacion, aunque su licencia (Qwen Research License) restringe el uso a fines no comerciales, lo que limita su adopcion en produccion sin una licencia comercial adicional de Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-3B-Instruct) con adaptador QLoRA (r=16, alpha=32) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (1,9 GB); FP16 fusionado (6,2 GB) |
| Idiomas soportados | en |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial |
| Formato de pesos | GGUF (Q4_K_M); adaptador LoRA no publicado en el Hub |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3,09 mil millones de parametros. Sobre el se aplica un ajuste fino con QLoRA de rango 16 y alpha 32, con modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento utiliza pares del benchmark Spider (licencia CC BY-SA 4.0), orientados a la generacion de SQL a partir de esquemas y preguntas en lenguaje natural.

La innovacion tecnica principal no reside en el ajuste fino en si, sino en el pipeline de servicio: validacion estatica del AST SQL mediante sqlglot, ejecucion en un sandbox SQLite de solo lectura y politicas de bloqueo que interceptan consultas peligrosas antes de llegar a la base de datos. La model card indica que la ablacion del modelo base en Kaggle esta marcada como UNVERIFIED y que el harness es sospechoso (ver `docs/LIMITATIONS.md`). No se especifican el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de Spider.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural y esquemas de base de datos.
- Razonamiento sobre esquemas relacionales y correspondencia entre entidades de la pregunta y tablas/columnas.
- Ejecucion segura mediante sandbox SQLite de solo lectura con validacion AST previa (sqlglot).
- Bloqueo de consultas adversarias: 0,00 % de exito en 120 ataques SQL directos y 0,00 % en 60 ataques de prompt injection segun la model card.
- Soporte de conversacion multi-turno (tag `conversational` en HuggingFace).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: solo ingles (`en`).
- No se documentan capacidades de vision, audio ni tool calling generico mas alla del pipeline SQL.

## Casos de uso

- Asistente text-to-SQL en investigacion: dado un esquema y una pregunta en ingles, el modelo genera la consulta SQL correspondiente con un 71,57 % de execution accuracy en Spider Dev, adecuado para prototipos academicos.
- Analisis de datos exploratorio seguro: integrado con el sandbox SQLite de solo lectura, permite a analistas consultar bases de datos sin riesgo de modificaciones accidentales o maliciosas.
- Evaluacion de pipelines de seguridad SQL: el modelo y su harness sirven como banco de pruebas para medir tasas de bloqueo de ataques AST (87,50 % estatico, 100 % en capa de base de datos).
- Educacion en bases de datos: util para demostrar la traduccion de lenguaje natural a SQL con retroalimentacion sobre consultas bloqueadas por politicas de seguridad.
- Generacion de consultas en entornos con CPU: la version GGUF Q4_K_M (1,9 GB) se ejecuta en CPU de 4 nucleos con 31,4 GB de RAM, con latencia p50 de 4,68 s y p95 de 11,23 s.
- Benchmarking de tecnicas QLoRA: comparacion reproducible entre zero-shot (62,28 %), 3-shot (66,15 %) y fine-tuning fusionado (71,57 %) sobre Spider Dev.
- Prototipado de agentes de datos con guardrails: el pipeline completo (modelo + sqlglot + sandbox) puede servir de base para asistentes de consulta con politicas de seguridad auditables.

## Benchmarks y rendimiento

| Configuracion | Formato / tamano | Execution accuracy (Spider Dev, n=1.034) | IC 95 % | Latencia p50 | Latencia p95 | Hardware |
|---|---|---|---|---|---|---|
| Base zero-shot | FP16 (6,2 GB) | 62,28 % (644/1.034) | [59,38 %, 65,18 %] | 2,16 s | 5,82 s | GPU Linux (cloud) |
| Base 3-shot | FP16 (6,2 GB) | 66,15 % (684/1.034) | [63,25 %, 68,96 %] | 2,23 s | 6,01 s | GPU Linux (cloud) |
| Fine-tuned fusionado | FP16 (6,2 GB) | 71,57 % (740/1.034) | [68,86 %, 74,27 %] | 2,19 s | 5,91 s | GPU Linux (cloud) |
| Fine-tuned cuantizado | GGUF Q4_K_M (1,9 GB) | 70,70 % (731/1.034) | [67,89 %, 73,40 %] | 4,68 s | 11,23 s | CPU local (4 nucleos, 31,4 GB RAM) |
| Fine-tuned + guardrail | GGUF Q4_K_M (1,9 GB) | 70,50 % (729/1.034) | [67,69 %, 73,21 %] | 4,71 s | 11,31 s | CPU local (4 nucleos, 31,4 GB RAM) |

Metricas de seguridad (segun model card):

| Metrica | Resultado |
|---|---|
| Bloqueo estatico AST (Path A) | 87,50 % (105/120); 96,33 % ajustado (105/109) |
| Defensa sandbox solo lectura (Path C) | 100,00 % (120/120) |
| Tasa de exito de ataque pipeline completo (Path D) | 0,00 % (0/120) |
| Exito de prompt injection end-to-end (Path B) | 0,00 % (0/60) |
| Falsos positivos en consultas legitimas Spider Dev | 0,19 % (2/1.034); 99,37 % de paso (1.103/1.110) |
| Tasa de escape de politica (held-out V2) | 8,33 % (4/48) pre-fix; harm rate 0,00 % |

## Requisitos de hardware

- VRAM para FP16 fusionado: aproximadamente 12-14 GB (pesos de 6,2 GB mas overhead de inferencia).
- VRAM para GGUF Q4_K_M: aproximadamente 3-4 GB (pesos de 1,9 GB mas overhead).
- GPU recomendadas: A100, H100 o RTX 4090 para FP16; RTX 3060/4060 o superiores para Q4_K_M.
- Cabe en GPU de consumo: si, en GPUs con 4 GB o mas de VRAM para Q4_K_M; en GPUs de 12 GB o mas para FP16.
- Ejecucion en CPU: validada en CPU de 4 nucleos con 31,4 GB de RAM (p50 4,68 s, p95 11,23 s).
- Opciones de despliegue: llama.cpp / Ollama para GGUF; Transformers + PEFT para el adaptador (no publicado); vLLM o TGI para FP16 si se fusiona el adaptador.
- Latencia en GPU: p50 2,19 s y p95 5,91 s para el modelo fusionado FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider Dev accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fine-tuned-text2sql (este) | 3,09 B | no disponible | 71,57 % (fusionado FP16) | qwen-research (no comercial) | GGUF en HF; adaptador no publicado |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | no disponible | 62,28 % (zero-shot) | qwen-research | Publico en HF |
| Qwen2.5-Coder-7B-Instruct | no disponible | no disponible | no disponible | Apache-2.0 | Publico en HF |
| Qwen2.5-Coder-14B-Instruct | no disponible | no disponible | no disponible | Apache-2.0 | Publico en HF |

La model card recomienda servir modelos de la familia Qwen2.5-Coder con licencia Apache-2.0 (1.5B, 7B, 14B, 32B) para aplicaciones comerciales sin restricciones. No se dispone de resultados de benchmarks de estos modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: prohibido el uso comercial sin licencia adicional de Alibaba Cloud; cualquier redistribucion debe incluir la licencia y la atribucion "Built with Qwen".
- El adaptador LoRA no esta publicado en HuggingFace Hub, lo que impide reproducir el ajuste fino directamente.
- La ablacion del modelo base en Kaggle esta marcada como UNVERIFIED y el harness es sospechoso segun `docs/LIMITATIONS.md`.
- El suite `heldout_v3` no ha sido evaluado bajo la politica de seguridad activa.
- Tasa de escape de politica del 8,33 % (4/48) en held-out V2, aunque el harm rate fue 0,00 % gracias al sandbox.
- Solo soporta ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion en la generacion de SQL: el modelo puede producir consultas sintacticamente validas pero semanticamente incorrectas, como refleja el 71,57 % de accuracy (cerca de un 28 % de fallo).
- El sandbox solo cubre SQLite en modo lectura; otros motores de bases de datos no estan validados.
- La cuantizacion Q4_K_M introduce una perdida de aproximadamente 0,87 puntos porcentuales en accuracy (71,57 % a 70,70 %) y duplica la latencia p50 (2,19 s a 4,68 s).
- No se especifica la longitud de contexto del modelo base en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Ashoksainibadu/fine-tuned-text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/raw/main/LICENSE
- Benchmark Spider: https://yale-lily.github.io/spider
- sqlglot: https://github.com/tobymao/sqlglot
- Base de datos Chinook: https://github.com/lerocha/chinook-database
