# gsandesh/deepseek-r1-14b-qlora-cybersecurity-4bit

## Resumen

`gsandesh/deepseek-r1-14b-qlora-cybersecurity-4bit` es un checkpoint derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` en el que se ha integrado (merging) un adaptador LoRA afinado para tareas de ciberseguridad defensiva y se ha pre-cuantizado a 4 bits en formato NormalFloat (NF4) con doble cuantización mediante `bitsandbytes`. Lo publica el usuario gsandesh bajo licencia Apache 2.0 y esta pensado para auditoria de codigo seguro, clasificacion de vulnerabilidades (CWE/CVE), remediacion de parches y threat hunting (reglas Suricata/YARA).

El modelo conserva la arquitectura Qwen2 del modelo base destilado de DeepSeek-R1, con 14.770.033.664 parametros totales (14,77 B), y se distribuye ya cuantizado, de modo que la inferencia cabe en aproximadamente 8,5 GB de VRAM y puede ejecutarse en una unica GPU consumer de 16 GB (T4, RTX 3060/3090/4090). El repositorio ocupa 9,9 GB en safetensors.

Su relevancia practica es la de un modelo especializado y ligero que combina el razonamiento estilo R1 con un dominio vertical (seguridad defensiva) y un formato de despliegue de bajo coste. No obstante, la model card no aporta datos de evaluacion, composicion del dataset de afinado ni resultados de benchmarks, por lo que su rendimiento real en produccion debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (base: DeepSeek-R1-Distill-Qwen-14B) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2; no confirmada en la model card) |
| Tipos de cuantizacion | 4-bit NormalFloat (NF4) con doble cuantizacion, pre-cuantizado con bitsandbytes; precision de computo Float16 |
| Idiomas soportados | en (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint pre-cuantizado 4-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen2, heredada de `DeepSeek-R1-Distill-Qwen-14B`. Sobre ese base se aplico un ajuste fino con QLoRA (adaptador LoRA entrenado sobre pesos cuantizados en 4 bits) orientado a seguridad defensiva, codigo seguro, remediacion de vulnerabilidades y threat hunting. Posteriormente, las matrices del adaptador se han plegado directamente en los pesos del modelo base (merging) y el conjunto se ha pre-cuantizado a NF4 con doble cuantizacion mediante `bitsandbytes`, generando un checkpoint autonomo que se carga automaticamente en 4 bits.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preference tuning en el ajuste. Tampoco detalla hiperparametros del LoRA (rango, alpha, target modules) ni la estrategia de evaluacion. La innovacion tecnica destacable es de despliegue: el empaquetado pre-cuantizado NF4 con merging de LoRA reduce el footprint a unos 8,5 GB de VRAM, lo que permite ejecutar un modelo de 14,8 B en GPUs consumer de 16 GB sin cuantizacion adicional en tiempo de carga.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento estilo DeepSeek-R1 heredado del modelo destilado (cadenas de razonamiento en la generacion).
- Auditoria de codigo seguro y deteccion de patrones vulnerables (por ejemplo, condiciones de carrera TOCTOU en llamadas `access`/`open`).
- Clasificacion y explicacion de vulnerabilidades con referencias a CWE/CVE, segun el uso previsto declarado.
- Generacion de parches y remediacion de codigo (patching) con enfasis en seguridad.
- Threat hunting: construccion y analisis de reglas Suricata y YARA.
- Recomendaciones de hardening arquitectonico y defensa en profundidad.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el modelo base R1 tiene capacidad de razonamiento, pero no se confirma integracion de agentes.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas a ingles segun metadatos.

## Casos de uso

- Auditoria de codigo en pipelines de CI/CD: el modelo puede recibir fragmentos de codigo C/C++ y devolver el analisis de la vulnerabilidad junto con un parche seguro, integrándose como paso de revision automatizada antes del merge.
- Clasificacion de hallazgos de SAST: dado un aviso de analisis estatico, el modelo puede mapearlo a CWE y proponer una remediacion concreta, reduciendo el triaje manual del equipo de seguridad.
- Generacion de reglas de deteccion: a partir de una descripcion de amenaza o de un TTP, el modelo redacta reglas Suricata o YARA utilizables en el SIEM/IDS, aprovechando su ajuste especifico en threat hunting.
- Asistente de remediacion para desarrolladores: chat multi-turno en el IDE donde el ingeniero pega el codigo vulnerable y el modelo explica el fallo, propone el parche thread-safe y justifica la decision, con temperatura baja (0,4) para respuestas deterministas.
- Formacion y concienciacion en seguridad: generacion de escenarios de vulnerabilidad explicados paso a paso para entrenamiento interno de equipos de desarrollo.
- Analisis de configuraciones y hardening: revision de configuraciones de sistema o servicios (permisos de ficheros, exposicion de puertos, politicas) y propuesta de cambios alineados con defensa en profundidad.
- Despliegue en entornos con GPU limitada: al caber en ~8,5 GB de VRAM, puede ejecutarse en una T4 de Colab o en una RTX 3060/4090 para prototipado y pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,5 GB con la cuantizacion NF4 incluida en el checkpoint.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060 (12 GB, ajustado), RTX 3090 (24 GB), RTX 4090 (24 GB); en cloud, A100 o H100 sobran para este modelo.
- Cabe en GPU consumer: si, en tarjetas con 12-16 GB o mas de VRAM, siempre que el runtime soporte carga 4-bit de `bitsandbytes`.
- Opciones de despliegue: Hugging Face Transformers con `bitsandbytes` (via `device_map="auto"`); otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint pre-cuantizado NF4 y requeririan conversion o cuantizacion alternativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| gsandesh/deepseek-r1-14b-qlora-cybersecurity-4bit | 14,77 B | no disponible | 4-bit NF4 pre-cuantizado (~8,5 GB VRAM) | Apache 2.0 | Ciberseguridad defensiva |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (base) | 14,77 B | no disponible | FP16/BF16 (no cuantizado) | Apache 2.0 segun modelo base | Razonamiento general |
| gsandesh/deepseek-r1-14b-qlora-cybersecurity (adaptador) | 14,77 B + LoRA | no disponible | LoRA sobre base (requiere base en FP16) | Apache 2.0 | Ciberseguridad defensiva |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de afinado, por lo que no puede evaluarse la cobertura ni los sesgos del dominio de ciberseguridad.
- Riesgo de alucinacion en la identificacion de CVE/CWE y en la generacion de parches: las referencias a vulnerabilidades concretas deben verificarse contra fuentes oficiales (NVD, MITRE).
- El prompt de ejemplo de la model card describe al asistente como "offensive and defensive cybersecurity analyst", lo que puede producir contenido de seguridad ofensiva no deseado en produccion; conviene reforzar el system prompt.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no confirmada en la model card; debe validarse contra el modelo base antes de usarla en documentos largos.
- El checkpoint esta pre-cuantizado a 4 bits, lo que impide volver a precision completa sin los pesos originales; puede degradar ligeramente la calidad frente al modelo base en FP16.
- Dependencia de `bitsandbytes` y `trust_remote_code=True` para la carga, lo que implica ejecutar codigo remoto y limita la portabilidad a otros runtimes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- No apto como unico mecanismo de revision de seguridad: debe combinarse con SAST/DAST y revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsandesh/deepseek-r1-14b-qlora-cybersecurity-4bit
- Adaptador LoRA de origen: https://huggingface.co/gsandesh/deepseek-r1-14b-qlora-cybersecurity
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
