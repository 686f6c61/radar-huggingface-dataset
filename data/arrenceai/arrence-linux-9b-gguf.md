# ArRENCEAI/ArRENCE-Linux-9B-GGUF

## Resumen

ArRENCE Linux 9B es un modelo de lenguaje especializado en administración de sistemas Linux, publicado por ArRENCE AI. Se distribuye como un fine-tune del modelo base Ornith-1.5-9B (9B parámetros) y está empaquetado exclusivamente en formato GGUF para su ejecución local con llama.cpp, LM Studio y Ollama. Su propósito es responder con precisión a tareas cotidianas de sysadmin y DevOps: unidades y timers de systemd, montajes y fstab, SSH y gestión de claves, permisos y umask, SELinux y AppArmor, journald y logrotate, redes, uso de disco y reparación de XFS/ext4.

El modelo se presenta como una alternativa ligera a modelos mucho mayores para consultas de administración de sistemas. Según la model card, alcanza un 78% en el test interno "Linux Recall-50", frente al 82% de Llama 3.3 70B Instruct, y supera en 14 puntos a su modelo base (64%). Está pensado para ejecutarse en un portátil o estación de trabajo con unos 8 GB de memoria de GPU o memoria unificada, manteniendo las consultas en local.

La relevancia actual reside en su enfoque vertical: en lugar de competir en capacidades generales, optimiza un dominio concreto con un tamaño reducido, lo que permite despliegues privados y de baja latencia en entornos donde no se pueden enviar datos a la nube. La información pública disponible es limitada y procede casi íntegramente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5, identificador `qwen35` según la model card); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 32.768 tokens; recomendado 16.384 (8.192 en máquinas con poca memoria) |
| Tipos de cuantizacion | GGUF Q5_K_M (6,47 GB) y Q4_K_M (5,63 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Ornith-1.5-9B, que a su vez emplea la arquitectura Qwen3.5 (`qwen35`), según indica la model card. No se detallan en la información disponible la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se especifican innovaciones arquitectónicas propias más allá de la base Qwen3.5.

Sí se documenta una decisión de diseño relevante: la plantilla integrada del modelo desactiva el modo de razonamiento (thinking mode), de modo que el modelo responde directamente sin cadenas de razonamiento extensas. El autor indica que, en pruebas internas sobre 1.403 respuestas de troubleshooting y Q&A de Linux, no se produjeron bucles de repetición descontrolados. La integración con llama.cpp requiere el flag `--jinja` para aplicar dicha plantilla.

## Capacidades

- Generación de texto especializada en administración de sistemas Linux y tareas de DevOps.
- Resolución de dudas sobre systemd (unidades, timers), montajes y fstab, SSH y claves, permisos y umask, SELinux y AppArmor, journald y logrotate, redes y uso de disco.
- Diagnóstico y reparación de sistemas de ficheros XFS y ext4.
- Respuesta directa sin modo de razonamiento visible (thinking desactivado en la plantilla).
- Compatibilidad con clientes OpenAI-compatible a través de `llama-server` o del servidor de LM Studio.
- Ejecución local con llama.cpp, LM Studio y Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a administradores de sistemas en local: el modelo responde consultas sobre comandos, ficheros de configuración y diagnóstico de fallos sin enviar información a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Troubleshooting de arranque y servicios: permite consultar por unidades systemd que fallan, dependencias rotas o timers mal configurados, con respuestas concisas y comandos exactos gracias a la temperatura baja recomendada (0–0,2 para un comando exacto).
- Gestión de permisos y seguridad: útil para revisar umask, ACLs, contextos SELinux o perfiles AppArmor en estaciones de trabajo y servidores de desarrollo.
- Automatización de soporte interno: integrado como endpoint OpenAI-compatible en `llama-server` o LM Studio, puede alimentar chatbots internos de helpdesk para preguntas frecuentes de operaciones.
- Documentación y runbooks: generación de procedimientos paso a paso para tareas repetitivas (rotación de logs con logrotate, ampliación de volúmenes, revisión de uso de disco) que luego revisa un humano.
- Formación y onboarding: como asistente de consulta para administradores junior que necesitan explicaciones directas sobre comandos y conceptos de Linux, ejecutándose en un portátil con unos 8 GB de memoria.
- Diagnóstico de red y puertos: consultas como identificar el proceso que escucha en un puerto concreto, con ejemplos de comandos listos para usar.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card y corresponden a un test interno del autor, "Linux Recall-50" (50 preguntas), no a benchmarks estándar publicados.

| Modelo | Linux Recall-50 |
|---|---|
| ArRENCE Linux 9B (Q5_K_M) | 78% |
| ArRENCE Linux 9B (Q4_K_M) | 68% |
| Llama 3.3 70B Instruct | 82% |
| Ornith-1.5-9B (modelo base) | 64% |
| Qwen3.5-9B | 76% |
| Ministral 14B | 76% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 8 GB de memoria de GPU o memoria unificada para Q5_K_M (6,47 GB de pesos); menos para Q4_K_M (5,63 GB).
- GPU recomendadas: no se especifican modelos concretos; el autor indica que Q4_K_M es la opción si se dispone de menos de 8 GB de memoria de GPU.
- Cabe en GPU de consumo con al menos 8 GB de VRAM para Q5_K_M, y en configuraciones inferiores con Q4_K_M.
- Opciones de despliegue: LM Studio, llama.cpp (`llama-server`, `llama-cli`) y Ollama. Requiere un runtime de llama.cpp reciente por la arquitectura `qwen35`.
- Contexto recomendado: 16.384 tokens (8.192 en máquinas de baja memoria, hasta 32.768).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Linux Recall-50 | Licencia | Formato |
|---|---|---|---|---|---|
| ArRENCE Linux 9B | ~9B | hasta 32.768 | 78% (Q5_K_M) | Apache 2.0 | GGUF |
| Ornith-1.5-9B (base) | ~9B | no disponible | 64% | no disponible | no disponible |
| Qwen3.5-9B | ~9B | no disponible | 76% | no disponible | no disponible |
| Ministral 14B | 14B | no disponible | 76% | no disponible | no disponible |
| Llama 3.3 70B Instruct | 70B | no disponible | 82% | no disponible | no disponible |

Los datos de comparación proceden exclusivamente de la model card del autor; no se dispone de verificación independiente.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera del dominio de administración de Linux no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está evaluado ni garantizado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar comandos incorrectos o peligrosos; es imprescindible revisar las respuestas antes de ejecutarlas en producción.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Ornith-1.5-9B, cuya licencia no se detalla en la información proporcionada.
- Dependencia de runtime: requiere una versión reciente de llama.cpp por la arquitectura `qwen35`; versiones antiguas pueden fallar con error de arquitectura desconocida.
- El benchmark Linux Recall-50 es interno, con solo 50 preguntas, por lo que la diferencia con modelos mayores puede no ser estadísticamente significativa.
- La cuantización Q4_K_M reduce la precisión de forma notable (68% frente a 78%), lo que puede afectar a detalles exactos de comandos y rutas.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ArRENCEAI/ArRENCE-Linux-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Sitio web del autor: https://arrenceai.com
- X: https://x.com/ArRENCEAI
- Facebook: https://www.facebook.com/arrenceai
- YouTube: https://www.youtube.com/@ArRENCEAI
- LM Studio: https://lmstudio.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero Q5_K_M: https://huggingface.co/ArRENCEAI/ArRENCE-Linux-9B-GGUF/blob/main/ArRENCE-Linux-9B-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/ArRENCEAI/ArRENCE-Linux-9B-GGUF/blob/main/ArRENCE-Linux-9B-Q4_K_M.gguf
