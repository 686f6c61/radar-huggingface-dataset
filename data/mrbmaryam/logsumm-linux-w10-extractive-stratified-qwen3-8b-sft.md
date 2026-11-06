# mrbmaryam/logsumm-linux-w10-extractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-linux-w10-extractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte del checkpoint cuantizado en 4 bits `unsloth/Qwen3-8B-bnb-4bit` y se ha entrenado con la librería Unsloth, que el autor destaca por ofrecer un entrenamiento aproximadamente el doble de rápido que el flujo estándar.

Por el nombre del repositorio, el ajuste está orientado a tareas de resumen extractivo sobre registros del sistema (aparentemente logs de Linux y Windows 10), con una estrategia de muestreo estratificado en la construccion del dataset. Se trata de un modelo de generacion de texto en ingles, derivado de la familia Qwen3, que conserva la arquitectura transformer densa de 8 mil millones de parametros del modelo base.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de adaptacion de un modelo generalista de 8B a un dominio muy especifico (resumen de logs) mediante SFT ligero con Unsloth, lo que permite reproducir el proceso en hardware de consumo. No obstante, la model card es minima y no aporta datos de entrenamiento, evaluacion ni uso previsto, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8 mil millones (heredados del modelo base Qwen3-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contexto nativo de 32 768 tokens, ampliable; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el checkpoint base se distribuye en bnb-4bit; el repositorio publica safetensors) |
| Idiomas soportados | ingles (segun el campo `language` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre Qwen3-8B, un transformer denso de 8B parametros. El entrenamiento se realizo con Unsloth y TRL sobre el checkpoint `unsloth/Qwen3-8B-bnb-4bit`, lo que implica que el proceso partio de pesos cuantizados en 4 bits y empleo las optimizaciones de memoria y velocidad de Unsloth (kernels fusionados, gestion eficiente del estado del optimizador). El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores.

El nombre del repositorio sugiere un dataset de resumen extractivo construido a partir de logs de Linux y Windows 10, con estratificacion (probablemente por tipo de evento o severidad) para equilibrar las clases durante el entrenamiento. No se documentan hiperparametros, epochs, learning rate ni la tecnica de enmascarado de perdida empleada. Tampoco se especifica si se aplicaron tecnicas como LoRA o QLoRA, aunque el uso de Unsloth y el prefijo `sft` apuntan a un ajuste supervisado estandar, posiblemente con adaptadores de bajo rango.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-8B.
- Resumen extractivo de registros y logs del sistema, presumiblemente su tarea principal segun el nombre del repositorio.
- Razonamiento y respuesta a instrucciones basicas, conservadas del modelo base.
- Capacidad multilingue limitada: la model card declara unicamente ingles, aunque Qwen3-8B base es multilingue; el ajuste puede haber degradado idiomas distintos del ingles.
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Qwen3 lo soporta, pero el SFT puede haber alterado este comportamiento.
- Modo thinking: Qwen3-8B base incorpora modo de razonamiento explicito; no se confirma que se conserve tras el ajuste.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Resumen de logs de servidores Linux: el modelo puede condensar entradas de `syslog`, `journalctl` o ficheros de aplicacion en resumenes extractivos que destaquen eventos relevantes, aprovechando el ajuste especifico sobre este dominio.
- Triaje de eventos de Windows 10: a partir de exportaciones del Visor de eventos (EVTX convertidos a texto), el modelo puede extraer las lineas mas significativas para revision por parte de un analista de soporte.
- Generacion de informes operativos: integrado en un pipeline que recoja logs diarios, el modelo puede producir un resumen extractivo listo para incluir en un correo o ticket de incidencia.
- Preprocesado para sistemas de alerta: el resumen extractivo reduce el volumen de texto que alimenta a un clasificador o a un motor de reglas posterior, disminuyendo coste y latencia.
- Analisis post-mortem asistido: dado un volcado de logs de un incidente, el modelo puede señalar las lineas candidatas a causa raiz para que el ingeniero las revise.
- Filtrado de ruido en observabilidad: en pipelines de logging centralizado (ELK, Loki), el modelo puede generar vistas condensadas por servicio o por ventana temporal antes del almacenamiento a largo plazo.
- Prototipado de asistentes de operaciones: al ser un modelo de 8B con licencia Apache 2.0, puede desplegarse en entornos internos para experimentar con asistentes que resuman incidencias sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): en torno a 5-6 GB de pesos, viable en GPUs de consumo de 8 GB o mas, con contexto limitado.
- GPUs recomendadas para produccion: NVIDIA A100 40/80 GB, H100, L40S; para desarrollo, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y superiores, usando cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (tag declarado), vLLM y llama.cpp/Ollama tras conversion a GGUF. El repositorio no incluye pesos GGUF publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-linux-w10-extractive-stratified-qwen3-8b-sft | 8B | no disponible | Apache 2.0 | SFT para resumen extractivo de logs | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | 32 768 tokens (nativo) | Apache 2.0 | Modelo generalista con modo thinking | Hugging Face, Ollama, vLLM |
| unsloth/Qwen3-8B-bnb-4bit | 8B | 32 768 tokens (nativo) | Apache 2.0 | Version cuantizada en 4 bits del base | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32 768 tokens | Apache 2.0 | Modelo generalista instruct | Hugging Face, Ollama, vLLM |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 131 072 tokens | Llama 3.1 Community License | Modelo generalista instruct | Hugging Face, Ollama, vLLM |

La comparacion directa con alternativas de resumen de logs no es posible porque no se han publicado evaluaciones de este ajuste. Frente a los modelos generalistas de la tabla, la unica ventaja demostrable es la especializacion declarada en el nombre del repositorio, sin evidencia cuantitativa que la respalde.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide verificar la calidad del ajuste.
- Riesgo elevado de sobreajuste al dataset especifico de logs de Linux y Windows 10; el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Posible perdida de capacidades del modelo base (multilinguismo, tool calling, modo thinking) tras el SFT, no evaluada por el autor.
- Riesgo de alucinacion en resumenes extractivos: el modelo podria generar lineas que no aparecen literalmente en el log de entrada, lo que es especialmente peligroso en contextos de auditoria o seguridad.
- Idioma: solo se declara ingles; no hay evidencia de soporte para castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el modelo antes de desplegarlo en produccion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El checkpoint base esta cuantizado en 4 bits, lo que puede introducir una perdida de precision acumulada respecto a un ajuste sobre pesos completos.
- No se especifica la longitud de contexto efectiva tras el ajuste; asumir 32 768 tokens puede ser incorrecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrbmaryam/logsumm-linux-w10-extractive-stratified-qwen3-8b-sft
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio hermano (variante abstractiva): https://huggingface.co/mrbmaryam/logsumm-apache-w10-abstractive-stratified-qwen3-8b-sft
- Discusiones del repositorio hermano: https://huggingface.co/mrbmaryam/logsumm-apache-w10-abstractive-stratified-qwen3-8b-sft/discussions
- Notebook de ejemplo de extraccion estructurada con Qwen3 (no relacionado directamente con este ajuste): https://colab.research.google.com/github/LeiweAndPartners/qwen3-vision-structured-extraction./blob/main/demo_pipeline.ipynb
