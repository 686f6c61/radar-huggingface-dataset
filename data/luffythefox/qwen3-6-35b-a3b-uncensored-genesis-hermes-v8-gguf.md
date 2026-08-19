# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por LuffyTheFox, publicado en formato GGUF para ejecución local. Combina la base Qwen3.6-35B-A3B (arquitectura MoE con aproximadamente 34,66 mil millones de parámetros totales y unos 3 mil millones activos por token) con un ajuste de tipo Hermes para capacidades agénticas y de function calling, y aplica el método propietario "Genesis" de reparación numérica de tensores sobre el archivo GGUF. El modelo se presenta como "uncensored", con 0 rechazos en 465 pruebas de refusal sobre el modelo base.

La relevancia de este lanzamiento radica en ofrecer una alternativa sin restricciones de contenido, con soporte multimodal (imagen y texto), tool calling y modo agéntico, todo en formato GGUF compatible con runtimes como llama.cpp u Ollama. El autor afirma que el método Genesis reduce el ruido acumulado en los tensores durante el entrenamiento, mejorando la estabilidad y la coherencia sin necesidad de reentrenar. La licencia es Apache 2.0, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6 |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B (segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones, incluye imatrix; el autor recomienda APEX quant) |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors disponibles en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, una variante sin censura de Qwen3.6 en configuracion MoE. Sobre esa base, el autor transfirio datos del finetune Hermes de DJLougen/hermes-qwen3.5-35b-a3b-GGUF (aproximadamente 2.000 bloques de dos tensores FFN expert) para incorporar capacidades de agente y function calling, utilizando el dataset NousResearch/hermes-function-calling-v1. No se menciona el uso de RLHF ni DPO.

La innovacion principal es el metodo Genesis, un algoritmo de regeneracion y calibracion de datos post-entrenamiento que actua directamente sobre los pesos en formato GGUF. El proceso consta de tres etapas: primero repara el balance entre cabezas en los tensores ssm_conv1d (relacionados con memoria de contexto largo); segundo, detecta y reduce ruido de entrenamiento mediante SVD personalizado, excluyendo ciertos tensores (token_embd, output, ffn_gate_inp_shexp, etc.); tercero, reemplaza bloques corruptos con bloques optimos seleccionados segun la distribucion de pesos. El autor enfatiza que no entrena ni hace fine-tuning, sino que "repara la pureza de la senal".

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, chino y otros idiomas.
- Procesamiento multimodal: acepta entrada de imagen y texto (pipeline image-text-to-text).
- Function calling / tool calling, entrenado con el dataset hermes-function-calling-v1.
- Modo agente (Hermes agent) con soporte para razonamiento multi-paso.
- Modo "thinking" recomendado para tareas de codigo, con parametros de sampling especificos (temperature 0.6, top_p 0.95, top_k 20, min_p 0.05, repeat_penalty 1.08).
- Ausencia de censura: el modelo base registra 0 refusals en 465 pruebas.
- Compatible con cuantizaciones GGUF y ejecucion en hardware limitado mediante offload de capas MoE a CPU.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo puede generar dialogos y narrativas explicitas o controvertidas sin rechazar peticiones, util para autores y creadores de contenido.
- Agentes autonomos con tool calling: al integrarse con frameworks como llama.cpp o vLLM, puede ejecutar funciones externas (busquedas, APIs, calculos) en pipelines de automatizacion.
- Asistente multimodal local: procesa imagenes junto con instrucciones de texto para tareas de captioning, analisis visual o extraccion de informacion, sin depender de servicios en la nube.
- Generacion de codigo con razonamiento: el modo thinking permite resolver problemas de programacion con pasos intermedios, adecuado para entornos de desarrollo con privacidad de codigo.
- Chatbot de soporte sin filtros: para comunidades que requieren respuestas directas sobre temas sensibles (salud, politica, religion) sin moderacion automatica.
- Experimentacion en investigacion: el metodo Genesis y la naturaleza uncensored permiten estudiar el impacto de la reduccion de ruido en la coherencia y la alucinacion, comparando con la base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un MoE con ~3B parametros activos, las cuantizaciones GGUF pueden ejecutarse en GPUs consumer, aunque no se proporcionan cifras exactas de VRAM.
- El autor recomienda para la cuantizacion APEX: forzar 40 capas MoE a CPU, GPU offload de 15 capas, 8 expertos activos y cuantizacion de cache K/V en Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- No se disponen de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8 (este) | 34,66B totales, ~3B activos | no disponible | Apache 2.0 | GGUF en HuggingFace |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | 34,66B totales, ~3B activos | no disponible | Apache 2.0 | safetensors/GGUF |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF (finetune Hermes) | 34,66B totales, ~3B activos | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos.

## Limitaciones y advertencias

- Al ser uncensored, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros; el usuario es responsable del uso.
- El metodo Genesis es un post-procesado numerico no validado academicamente; sus efectos sobre la calidad a largo plazo son desconocidos.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con ventanas largas.
- Riesgo de alucinacion no mitigado especificamente; se recomienda validar respuestas en entornos de produccion.
- La documentacion del autor es parcial y no incluye detalles sobre el dataset de entrenamiento original de la base Qwen3.6.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales (especialmente en la UE).
- El repositorio contiene multiples versiones (V3 a V8) con cambios no documentados entre ellas; la reproducibilidad es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V8-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes original: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
- Chat template (version V7, similar): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- Comunidad Discord: https://discord.gg/SZ5vacTXYf
