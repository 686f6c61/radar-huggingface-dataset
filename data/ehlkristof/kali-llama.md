# EhlKristof/kali-llama

## Resumen

kali-llama es un modelo de lenguaje conversacional derivado de Llama-3.2-1B-Instruct y ajustado por EhlKristof sobre el conjunto de datos acnimatic3722/kali-linux-pentesting-data, orientado a tareas de pentesting y seguridad ofensiva en entornos Kali Linux. El autor distribuye unicamente los pesos convertidos a formato GGUF mediante Unsloth, lo que lo hace directamente consumible por llama.cpp y por herramientas compatibles con dicha pila de inferencia.

El modelo conserva la arquitectura y el tamano del checkpoint base: 1.235.814.432 parametros (aproximadamente 1,2 mil millones), lo que lo situa en la categoria de modelos pequenos aptos para ejecucion en CPU y GPU de consumo. El repositorio ocupa 1,5 GB e incluye dos cuantizaciones (Q2_K_L y Q4_K_M), ambas derivadas de la variante Instruct de Llama 3.2.

Su relevancia es acotada pero concreta: se trata de un ajuste de dominio muy especifico (comandos y flujos de trabajo de Kali Linux) sobre un modelo base pequeno, distribuido en un formato que prioriza la portabilidad sobre el rendimiento bruto. No se han publicado datos de evaluacion, licencia explicita ni idiomas soportados en la informacion disponible, lo que limita su uso en produccion sin una validacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3.2-1B-Instruct); detalles internos no disponibles |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Llama-3.2-1B-Instruct (no confirmada por el autor) |
| Tipos de cuantizacion | Q2_K_L, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (generado con Unsloth) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B-Instruct, un transformer decoder-only de aproximadamente 1,2 mil millones de parametros. Sobre esa base, el autor ha realizado un ajuste fino supervisado utilizando el dataset acnimatic3722/kali-linux-pentesting-data, un corpus centrado en comandos, herramientas y procedimientos de Kali Linux. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO ni hiperparametros del ajuste.

La unica innovacion tecnica documentada es el proceso de conversion a GGUF mediante Unsloth, que se ha utilizado tanto para transformar los pesos como para generar las dos cuantizaciones publicadas. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras modificaciones arquitectonicas; se asume que la estructura interna es la del checkpoint original de Meta. El uso de `--jinja` en los comandos de ejemplo sugiere que la plantilla de chat del modelo se aplica mediante el motor de plantillas de llama.cpp.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla compatible con llama.cpp (`--jinja`).
- Conocimiento especializado en comandos, herramientas y flujos de pentesting de Kali Linux, derivado del dataset de ajuste.
- Soporte de conversaciones multi-turno (heredado de la variante Instruct del modelo base).
- Inferencia en CPU y GPU a traves de llama.cpp y de la CLI `llama-cli`.
- Compatibilidad declarada con endpoints compatibles (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingues: no disponibles (no declaradas por el autor).
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponibles (no documentadas).
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente de linea de comandos para Kali Linux: el modelo puede sugerir comandos y explicar opciones de herramientas como nmap, metasploit o hydra, aprovechando el ajuste especifico sobre datos de pentesting. Adecuado por su tamano reducido, que permite ejecutarlo en la misma maquina de trabajo sin depender de la nube.
- Entrenamiento y laboratorios de seguridad: util como ayuda interactiva en entornos docentes o CTFs donde se necesita una referencia rapida de comandos, con la ventaja de que el modelo cabe en un portatil.
- Automatizacion de notas y resumenes de reconocimiento: integrable en scripts que invocan `llama-cli` para transformar salidas de escaneos en resumenes legibles, gracias a su bajo coste de inferencia.
- Prototipado rapido de asistentes de dominio: sirve como base para validar pipelines de RAG o de chat especializado antes de invertir en modelos mayores, dado que su huella de 1,5 GB facilita el despliegue en entornos de desarrollo.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones Q2_K_L y Q4_K_M permiten ejecucion en CPU y en GPU de gama baja, util para entornos aislados o air-gapped donde no se puede usar un servicio externo.
- Evaluacion comparativa de ajustes de dominio: como ejemplo de fine-tuning sobre un modelo de 1B, resulta util para medir cuanto conocimiento especifico se puede inyectar en un modelo pequeno frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1,2 GB con Q2_K_L y 1,2-1,5 GB con Q4_K_M, mas el overhead de contexto y de la propia pila de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; el modelo es funcionalmente viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas ultimas el cuello de botella sera la CPU y el ancho de banda, no la GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (CLI `llama-cli`), servidores compatibles con la API de llama.cpp, y cualquier runtime que consuma GGUF. No se documenta soporte para vLLM, TGI u Ollama en la model card, aunque Ollama puede importar GGUF de forma generica.
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kali-llama (este modelo) | 1,24 B | no disponible | GGUF (Q2_K_L, Q4_K_M) | no disponible | Ajuste de dominio sobre pentesting de Kali Linux |
| Llama-3.2-1B-Instruct (base) | 1,24 B | 128 K (segun Meta) | safetensors, GGUF | Llama 3.2 Community License | Modelo generalista de referencia; contexto no confirmado en este derivado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | safetensors, GGUF | Apache 2.0 | Alternativa generalista de tamano similar con licencia permisiva |
| Gemma-2-2B-it | 2,6 B | 8 K | safetensors, GGUF | Gemma Terms of Use | Mayor tamano y contexto mas corto; requiere mas recursos |

La comparativa se limita a la categoria de modelos pequenos conversacionales; no se dispone de datos de rendimiento del modelo ajustado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare; ademas, al derivar de Llama-3.2, podrian aplicar los terminos de la Llama 3.2 Community License.
- No hay informacion sobre sesgos del dataset de ajuste; un corpus centrado en pentesting puede contener comandos ofensivos y el modelo podria reproducirlos sin las salvaguardas del base.
- Riesgo de alucinacion elevado en un modelo de 1,2 B: es probable que invente opciones de comandos, rutas o flags inexistentes, especialmente fuera del dominio de Kali.
- Capacidad de razonamiento limitada por el tamano; no es adecuado para tareas complejas de planificacion o analisis multi-paso.
- Idiomas soportados no declarados; se desconoce el comportamiento fuera del ingles.
- Contexto efectivo no confirmado por el autor; no se debe asumir la ventana de 128 K del base sin verificacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora frente al modelo base en tareas de pentesting.
- Repositorio con 0 descargas y creado en 2026, sin senales de mantenimiento ni comunidad; tratar como experimento y no como dependencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EhlKristof/kali-llama
- Dataset de entrenamiento: https://huggingface.co/datasets/acnimatic3722/kali-linux-pentesting-data
- Repositorio de Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Modelo base Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
