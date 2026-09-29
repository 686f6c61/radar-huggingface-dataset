# miesdevries/stay4s-researcher-agent

## Resumen

stay4s-researcher-agent es un modelo de lenguaje afinado por miesdevries (atribuido en la model card a Het Nieuwe Begin B.V.) a partir de Qwen2.5-7B-Instruct. Se presenta como un agente "researcher" cuyo proposito es investigar y recopilar informacion, y esta especializado en neerlandes (nl). El ajuste se realizo mediante SFT con LoRA de rango r=64, y el modelo se distribuye tanto en safetensors como en formato GGUF Q8 para inferencia local.

El modelo forma parte de la familia "stay4s" y esta etiquetado como compatible con endpoints, conversacional y orientado a agentes. Su interes practico es acotado: ofrece un asistente agentico en neerlandes ejecutable en hardware de consumo, algo poco frecuente en un ecosistema dominado por modelos centrados en ingles. La licencia Apache-2.0 facilita su uso comercial sin las restricciones habituales de otros pesos abiertos.

No obstante, la informacion publicada es minima: hay que senalar una discrepancia relevante entre el modelo base declarado (Qwen2.5-7B-Instruct) y el recuento real de parametros de los pesos safetensors (4.022.468.096, aproximadamente 4B), lo que no coincide con el tamano esperado de un modelo de 7B. No se publican detalles de entrenamiento, contexto, benchmarks ni pipeline, por lo que la evaluacion queda limitada a los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; derivada del modelo base declarado (Qwen2.5-7B-Instruct, transformer decoder-only) |
| Parametros totales | 4.022.468.096 (segun safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8 (segun model card); pesos safetensors en precision completa |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y GGUF |

Nota: existe una inconsistencia entre el modelo base declarado (Qwen2.5-7B-Instruct) y el recuento de parametros de los safetensors (4,02B). No se aclara en la informacion disponible si se trata de un error de etiquetado, de un modelo base distinto o de un recorte de pesos.

## Arquitectura y entrenamiento

La model card indica que el modelo parte de Qwen2.5-7B-Instruct y que se entreno mediante SFT (supervised fine-tuning) con LoRA de rango r=64. No se especifica la composicion del dataset de ajuste, el numero de tokens utilizados, ni si hubo fases adicionales de RLHF, DPO u otro tipo de alineamiento. Tampoco se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, mezclas de expertos, etc.).

La unica informacion sobre el proceso es el rango del adaptador LoRA y el formato de publicacion (GGUF Q8). Al ser un ajuste LoRA sobre un instruct model, cabe esperar que herede la arquitectura transformer decoder-only del base, pero este extremo no se confirma explicitamente en la informacion proporcionada, y el recuento de parametros de los safetensors no concuerda con el tamano declarado del base, por lo que la trazabilidad arquitectonica no puede darse por verificada.

## Capacidades

- Generacion de texto conversacional en neerlandes, segun los tags del repositorio (conversational, nl).
- Orientacion a tareas de agente: el nombre y los tags (agent, stay4s) apuntan a un uso como agente de investigacion y recopilacion de informacion.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Razonamiento multi-paso y uso como agente autonomo: no confirmado mas alla de la denominacion "researcher agent".
- Capacidades multilingues: limitadas al neerlandes segun el campo language (nl); no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion con endpoints: el tag endpoints_compatible sugiere compatibilidad con la infraestructura de inference endpoints de HuggingFace, aunque no se detallan condiciones.

## Casos de uso

- Investigacion documental en neerlandes: el modelo puede resumir y sintetizar fuentes en neerlandes para equipos que trabajan en ese idioma, aprovechando su ajuste especifico frente a modelos genericos.
- Atencion al cliente en neerlandes: despliegue como asistente conversacional local para organizaciones neerlandesas que necesitan cumplir requisitos de residencia de datos sin recurrir a APIs externas.
- Extraccion y agregacion de informacion: uso como componente "researcher" dentro de un pipeline mayor que recopila datos de varias fuentes y los consolida en un informe.
- Prototipado de agentes en local: su tamano (~4B) y el formato GGUF Q8 permiten ejecutarlo en estaciones de trabajo sin GPU dedicada, lo que lo hace util para experimentar con arquitecturas de agentes.
- Procesamiento de documentacion interna: clasificacion y resumen de textos corporativos en neerlandes en entornos con restricciones de confidencialidad, gracias a la inferencia local.
- Base para ajuste adicional: al estar bajo Apache-2.0 y distribuirse en safetensors y GGUF, sirve como punto de partida para fine-tuning especifico en dominios neerlandeses (legal, administrativo, educativo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros; no confirmadas por el autor):
  - Pesos safetensors en BF16: en torno a 8 GB, mas memoria para KV cache y activaciones.
  - GGUF Q8: aproximadamente 4,3 GB de pesos.
  - Cuantizaciones menores (Q4_K_M): en torno a 2,5 GB.
- GPU recomendadas (estimacion): una RTX 4090, RTX 3090 o RTX 4080 seria suficiente para Q8 con contexto moderado; para BF16 con contexto amplio, tarjetas de 16-24 GB. GPU de datacenter (A100, H100) no serian necesarias para este tamano.
- Compatibilidad con GPU de consumo: si, previsiblemente en GPUs con 6-8 GB o mas para cuantizaciones Q4/Q8.
- Opciones de despliegue: la model card menciona explicitamente Ollama y llama.cpp; el tag endpoints_compatible sugiere tambien HuggingFace Inference Endpoints. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| stay4s-researcher-agent | 4,02B (safetensors) | No disponible | Neerlandes | Apache-2.0 | Fine-tune LoRA especializado en agente researcher en neerlandes |
| Qwen2.5-7B-Instruct | 7,6B aprox. | 128K (segun documentacion del base) | Multilingue | Apache-2.0 | Modelo base declarado; capacidades generales |
| Qwen3-4B | 4,02B | No disponible en esta ficha | Multilingue | Apache-2.0 | Tamano de parametros coincidente con el recuento de safetensors |
| Llama-3.1-8B-Instruct | 8B | 128K | Multilingue (limitado en neerlandes) | Llama 3.1 Community License | Alternativa generalista con restricciones de licencia |

La comparativa con el modelo base Qwen2.5-7B-Instruct resulta ambigua por la discrepancia de parametros. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Discrepancia entre el modelo base declarado (7B) y los parametros reales de los safetensors (4,02B): conviene verificar la procedencia antes de usarlo en produccion.
- Idiomas: unicamente neerlandes segun los metadatos; el rendimiento en castellano, ingles u otros idiomas no esta documentado y probablemente sea degradado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de error, por lo que se desconoce su comportamiento en tareas de recuperacion de informacion.
- Sesgos: no se documenta ningun analisis de sesgos ni la composicion del dataset de ajuste.
- Contexto: la longitud de contexto no esta especificada, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se recomienda confirmar el cumplimiento de las condiciones aplicables al modelo base heredado.
- Sin datos de benchmarks ni de rendimiento en produccion: no se puede estimar fiabilidad ni latencia real sin pruebas propias.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/miesdevries/stay4s-researcher-agent
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
