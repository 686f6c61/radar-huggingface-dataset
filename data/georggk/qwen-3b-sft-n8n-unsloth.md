# GeorgGK/qwen-3b-sft-n8n-unsloth

## Resumen

`GeorgGK/qwen-3b-sft-n8n-unsloth` es un ajuste fino (SFT) de Qwen2.5-Coder-3B-Instruct, el modelo de codigo de 3.085 millones de parametros desarrollado originalmente por Alibaba Qwen. El autor del fine-tuning es GeorgGK (con mencion a "chewjh" en la model card) y el entrenamiento se ha realizado con la libreria Unsloth sobre la version cuantizada a 4 bits del modelo base (`unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`), lo que acelera el proceso de entrenamiento aproximadamente 2x segun la propia model card.

El nombre del repositorio sugiere un ajuste orientado a n8n, la plataforma de automatizacion de flujos de trabajo open source, aunque la model card no documenta el dataset ni los objetivos concretos del entrenamiento. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta etiquetado unicamente para ingles.

Se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, y con documentacion muy limitada: no se especifican hiperparametros, composicion del dataset, ni resultados de evaluacion. Su interes practico radica en ser un ejemplo de fine-tuning ligero con Unsloth sobre un modelo de codigo de 3B, desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-3B soporta 32.768 tokens, pero no se confirma en este fine-tuning) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; el base se entreno desde una version bnb-4bit) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6.2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-3B-Instruct: un transformer decoder-only denso con atencion por causalidad, RoPE y normalizacion RMSNorm, con 3.085 millones de parametros. Sobre esta base, el autor ha aplicado un ajuste fino supervisado (SFT) partiendo de la version cuantizada a 4 bits en formato bitsandbytes (`unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`), utilizando Unsloth y la libreria TRL de Hugging Face. La model card indica que el entrenamiento fue "2x mas rapido" con Unsloth, pero no detalla el numero de tokens, la composicion del dataset, la longitud de secuencia, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO.

No se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el entrenamiento. El nombre del repositorio apunta a un dataset relacionado con n8n (automatizacion de workflows), pero no hay informacion publica sobre el contenido ni el volumen de los datos de entrenamiento.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo base Qwen2.5-Coder-3B-Instruct, orientado a generacion y completion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: el modelo base esta entrenado para tareas de reparacion, explicacion y generacion de codigo.
- Conversacion multi-turno: el formato es conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: no confirmado en este fine-tuning; el modelo base Qwen2.5-Coder-Instruct soporta function calling, pero la model card no lo verifica.
- Capacidades de agente: no confirmado. El nombre sugiere uso en automatizacion (n8n), pero no hay documentacion que lo respalde.
- Multilingue: limitado a ingles segun la etiqueta `language: en` de la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de codigo asistida en editores: el modelo puede completar funciones y sugerir fragmentos de codigo en un IDE o extension, aprovechando su herencia de Qwen2.5-Coder-3B y su tamano reducido para inferencia local.
- Automatizacion de workflows en n8n: dado el nombre del repositorio, podria emplearse para generar o modificar definiciones de nodos y expresiones dentro de flujos de n8n, aunque esta capacidad no esta documentada ni evaluada.
- Prototipado rapido de scripts: util para generar scripts de automatizacion, transformaciones de datos o expresiones regulares en entornos de desarrollo con recursos limitados.
- Educacion y demos de fine-tuning: sirve como ejemplo practico de SFT con Unsloth sobre un modelo de 3B, util para talleres o tutoriales sobre ajuste fino eficiente.
- Asistente de codigo en local: al caber en GPUs de consumo, puede desplegarse como asistente de codigo offline en estaciones de trabajo sin conexion.
- Generacion de tests unitarios: puede emplearse para redactar casos de prueba a partir de funciones existentes, una tarea comun en el modelo base de codigo.
- Chat tecnico de proposito general en ingles: para consultas de programacion y explicaciones breves, con la limitacion de que solo se declara soporte de ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 (3.085 M parametros x 2 bytes + overhead), alrededor de 2-3 GB en cuantizacion 4-bit (GGUF Q4_K_M o similar).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia. Cabe en GPUs de consumo con 6 GB o mas en FP16 y en GPUs con 4 GB en cuantizacion 4-bit.
- Cabe en consumer GPU: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: transformers (libreria nativa del repo), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp u Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una RTX 4090 en FP16 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GeorgGK/qwen-3b-sft-n8n-unsloth | 3.085 M | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning de nicho sin benchmarks |
| Qwen2.5-Coder-3B-Instruct | 3.085 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con evaluaciones publicas |
| Qwen2.5-Coder-1.5B-Instruct | 1.543 M | 32.768 tokens | Apache 2.0 | Hugging Face | Version mas pequena, menor VRAM |
| CodeLlama-7B-Instruct | 6.738 M | 16.384 tokens | Llama 2 Community License | Hugging Face | Mayor tamano, licencia mas restrictiva |

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no detalla dataset, hiperparametros ni evaluacion, lo que impide validar la calidad del fine-tuning.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo o APIs inexistentes, especialmente en tareas fuera de su distribucion de entrenamiento.
- Sesgos: no documentados; al derivar de Qwen2.5-Coder, hereda los sesgos del corpus de entrenamiento original, no evaluados en este fine-tuning.
- Limitacion de idioma: la model card declara solo ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base multilingue.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, no se garantiza que el fine-tuning preserve esa ventana.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y de los datos de entrenamiento (no documentados).
- Modelo de nicho sin adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Entrenado desde una base cuantizada a 4 bits: el fine-tuning parte de una version bnb-4bit, lo que puede introducir diferencias de calidad respecto a un entrenamiento sobre pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeorgGK/qwen-3b-sft-n8n-unsloth
- Modelo base: https://huggingface.co/unsloth/qwen2.5-coder-3b-instruct-bnb-4bit
- Qwen2.5-Coder-3B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Plataforma n8n: https://n8n.io
