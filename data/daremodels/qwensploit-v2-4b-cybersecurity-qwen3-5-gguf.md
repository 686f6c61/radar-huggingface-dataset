# DareModels/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit V2 4B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team construido sobre el modelo base xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic, a su vez derivado de la familia Qwen 3.5. Lo publica el usuario DareModels como una distribucion de cuantizaciones estaticas en formato GGUF del modelo original de xtools-at, orientada a inferencia local y despliegue ligero. Con 4.326.350.848 parametros (~4,3B), el modelo busca ofrecer un asistente tecnico cotidiano para profesionales de seguridad ofensiva y defensiva en un tamano que quepa en hardware de consumo.

La propuesta de valor de la serie Qwensploit V2 es la calidad del dato sobre la cantidad: frente a la V1, el autor afirma haber dividido, inspeccionado, limpiado y filtrado manualmente cada conjunto de entrenamiento antes de incorporarlo a la mezcla, con enfasis en instrucciones utiles, explicaciones tecnicas y razonamiento de seguridad, y evitando volcar registros CVE crudos que encajan mejor en un esquema RAG. El pipeline declarado es image-text-to-text, con soporte de razonamiento estructurado, tool calling y modo de pensamiento, segun los tags del repositorio.

Esta ficha cubre especificamente la publicacion GGUF de DareModels. La model card incluida es la del modelo original de xtools-at, por lo que los detalles de entrenamiento, datos y uso previsto corresponden al modelo base, no a un reentrenamiento por parte de DareModels. La licencia es "other" y los pesos derivan de un modelo sin censura, lo que condiciona fuertemente su uso comercial y su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen 3.5 (fine-tune con LoRA/PEFT sobre el modelo base) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estatico (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (repo de 11,6 GB); el modelo base original se distribuye en safetensors |
| Modelo base | xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5 |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 11,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5, ajustado mediante LoRA/PEFT (se declaran los tags `lora`, `peft` y `unsloth`) sobre el checkpoint xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic, que a su vez es una mezcla de modelos Claude y Qwen sin censura. El pipeline declarado es image-text-to-text, lo que sugiere herencia de capacidades multimodales del linaje Qwen 3.5, aunque no se detalla en la informacion disponible el alcance real de vision en este fine-tune. El tag `mtp` apunta a multi-token prediction, si bien no se especifica su implementacion.

El entrenamiento combina conocimiento de dominio de ciberseguridad con datos de razonamiento general. Los conjuntos declarados incluyen PentesterFlow/OffsecCyber (subconjuntos Elite V2 y HackerOne), ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor no publica el numero total de tokens de entrenamiento ni la composicion exacta de la mezcla final; solo se documenta parcialmente el primero de los conjuntos (2.000 muestras). No se declara el uso de RLHF o DPO.

La publicacion de DareModels es una conversion a GGUF del modelo original: no anade entrenamiento, solo cuantizacion estatica. El repo ocupa 11,6 GB, un tamano coherente con multiples niveles de cuantizacion de un modelo de 4,3B.

## Capacidades

- Generacion de texto y razonamiento estructurado en el dominio de ciberseguridad, con enfasis en explicaciones tecnicas y resolucion de problemas paso a paso.
- Conocimiento de seguridad ofensiva: pruebas de penetracion web, analisis de vulnerabilidades, bug bounty y ejercicios de red team autorizados.
- Seguridad defensiva: analisis de amenazas, triaje de vulnerabilidades y respuesta a incidentes.
- Codificacion segura, revision de codigo y depuracion con orientacion a seguridad.
- Soporte de CTF y educacion en seguridad.
- Tool calling / function calling y razonamiento multi-paso orientado a agentes, segun los tags del repositorio.
- Modo de pensamiento (thinking mode) y trazas de razonamiento, heredado del linaje de destilacion de trazas de Claude Haiku incluido en los datos.
- Capacidades multilingues limitadas: el modelo declara unicamente ingles.
- Capacidad multimodal potencial (pipeline image-text-to-text), aunque no se detalla su alcance en la informacion disponible.
- Modelo sin censura por herencia del checkpoint base, lo que implica menor rechazo a contenido sensible de seguridad.

## Casos de uso

- Auditoria de seguridad web en entornos autorizados: el modelo puede analizar fragmentos de codigo, describir vectores de ataque y proponer pruebas de validacion, apoyandose en el conocimiento de bug bounty de los datos de entrenamiento.
- Triaje de vulnerabilidades: clasificar y priorizar hallazgos de escaneo, explicar el impacto de cada uno y sugerir mitigaciones, con el modelo actuando como primer analista en un flujo de trabajo humano.
- Revision de codigo seguro en CI/CD: integrado como paso de revision, puede senalar patrones inseguros (inyeccion SQL, desbordamientos, manejo de secretos) y proponer correcciones antes del merge.
- Formacion y CTF: generar explicaciones de tecnicas, pistas progresivas y analisis post-mortem de retos, aprovechando el modo de razonamiento y el conocimiento de seguridad ofensiva.
- Respuesta a incidentes: resumir trazas y artefactos, proponer hipotesis de compromiso y estructurar la investigacion, con el analista validando cada paso.
- Asistente local de red team: desplegado en GGUF sobre hardware de consumo, permite consultas sensibles sin enviar datos a APIs externas, algo relevante en entornos con requisitos de confidencialidad.
- Generacion de documentacion tecnica de seguridad: redactar informes de hallazgos, politicas y runbooks a partir de notas del analista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 4,3B parametros, una cuantizacion de 4 bits ronda los 2,5-3 GB de pesos; a 8 bits, unos 4,5-5 GB; en FP16, unos 8,6 GB. El repo GGUF completo ocupa 11,6 GB e incluye varios niveles.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para inferencia local comoda; A100/H100 solo si se sirven muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas para cuantizaciones de 4 bits; con 8 GB o mas para 8 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles; el modelo base en safetensors admite vLLM y TGI, pero esta publicacion concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 4B (esta ficha) | ~4,3B | no disponible | Ciberseguridad y red team | other | GGUF en HF |
| Qwensploit V2 9B | no disponible | no disponible | Ciberseguridad y red team | other | HF (original) |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad y red team | other | HF (original) |
| Qwensploit V2 0.8B | no disponible | no disponible | Ciberseguridad y red team | other | HF (original) |

Las alternativas mas directas son las otras tallas de la misma serie (0.8B, 2B, 9B y 27B), que comparten mezcla de datos y uso previsto. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellas ni con fine-tunes de ciberseguridad de otros autores.

## Limitaciones y advertencias

- Modelo sin censura por herencia del checkpoint base: puede generar contenido ofensivo, instrucciones de ataque o material sensible; requiere supervision humana y uso exclusivamente autorizado.
- Riesgo de alucinacion relevante en un dominio donde una recomendacion incorrecta puede causar dano real; toda salida debe revisarse antes de ejecutarse en un entorno.
- Solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia "other": no se detallan los terminos exactos, por lo que el uso comercial no esta claro y debe verificarse con el autor antes de produccion. Al derivar de un modelo sin censura, pueden existir restricciones adicionales.
- La model card no documenta la longitud de contexto efectiva, los niveles exactos de cuantizacion incluidos ni el numero de tokens de entrenamiento.
- Es una conversion GGUF de terceros (DareModels); la calidad de las cuantizaciones no esta validada en la informacion disponible.
- Orientado a asistencia y analisis, no a agentes autonomos de pentesting; el autor lo declara explicitamente como asistente de investigacion.
- Sin datos de benchmarks publicados, no es posible evaluar su rendimiento frente a alternativas de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DareModels/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Checkpoint de partida del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 27B: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Otras cuantizaciones: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
