# ArchiveStudio/Qwen2-1.5B-Instruct

## Resumen

Qwen2-1.5B-Instruct es la variante instruida (chat) de 1.500 millones de parametros de la familia Qwen2, publicada por el equipo Qwen de Alibaba Cloud (el repositorio de Hugging Face es un espejo alojado por el usuario ArchiveStudio). Es un modelo de lenguaje decoder-only basado en Transformer con activacion SwiGLU, bias en las proyecciones QKV y Grouped Query Attention, disenado para generacion de texto y conversacion multi-turno.

El modelo resuelve el problema de disponer de un asistente conversacional ligero que pueda ejecutarse en hardware modesto (GPU de consumo e incluso CPU con cuantizacion) manteniendo un rendimiento notable en tareas de razonamiento, matematicas y codigo para su tamano. Segun la model card, supera a Qwen1.5-1.8B-Chat en todos los benchmarks reportados, lo que lo situa como una opcion competitiva en la franja sub-2B.

Es relevante ahora porque combina licencia Apache 2.0 (uso comercial sin restricciones practicas), un tokenizer mejorado adaptado a multiples lenguajes y codigo, y una integracion directa en `transformers>=4.37.0`. Su tamano compacto (1.543.714.304 parametros, repo de 3,1 GB en safetensors) lo hace apto para despliegues con recursos limitados y prototipado rapido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, bias QKV y Grouped Query Attention (GQA) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato nativo safetensors; conversiones a GGUF/AWQ no documentadas en la model card) |
| Idiomas soportados | ingles (etiqueta `en`); la model card menciona tokenizer adaptado a multiples lenguajes, pero no se listan idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2-1.5B-Instruct es un transformer decoder-only con activacion SwiGLU, bias en las proyecciones de query, key y value, y Grouped Query Attention, una tecnica que reduce el coste de memoria de la cache KV al compartir cabezas de key/value entre grupos de cabezas de query. Incorpora un tokenizer mejorado respecto a Qwen1.5, adaptado a multiples lenguajes naturales y a codigo fuente.

El entrenamiento consistio en un preentrenamiento sobre "una gran cantidad de datos" (la model card no especifica numero de tokens ni composicion del dataset) seguido de un post-entrenamiento en dos fases: supervised fine-tuning (SFT) y direct preference optimization (DPO). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; el modelo sigue el paradigma estandar de la familia Qwen2.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Razonamiento y comprension del lenguaje: MMLU de 52,4 en la evaluacion del autor.
- Generacion de codigo: HumanEval de 37,8, con soporte de sintaxis mediante el tokenizer adaptado a codigo.
- Razonamiento matematico: GSM8K de 61,6.
- Seguimiento de instrucciones: IFEval (Prompt Strict-Acc.) de 29,0.
- Capacidad multilingue parcial: C-Eval de 63,8 sugiere competencia en chino, aunque la etiqueta oficial de idioma es solo `en`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional ligero en produccion: con 1,5B parametros puede servirse en una unica GPU de consumo; su plantilla de chat y su entrenamiento con SFT+DPO lo hacen adecuado para atencion al cliente automatizada de dominio acotado.
- Prototipado rapido de aplicaciones de chat: su integracion en `transformers>=4.37.0` permite levantar un endpoint conversacional en minutos sin infraestructura dedicada.
- Generacion asistida de codigo en entornos con recursos limitados: HumanEval de 37,8 lo hace util para autocompletado o explicacion de fragmentos en IDE y herramientas internas, no para reemplazar modelos de codigo especializados.
- Tutoria y resolucion de problemas matematicos basicos: GSM8K de 61,6 permite usarlo en aplicaciones educativas de aritmetica y problemas de varios pasos.
- Clasificacion y extraccion de informacion con formato: el seguimiento de instrucciones (IFEval 29,0) permite tareas de resumen, reescritura y extraccion estructurada en ingles con prompts bien definidos.
- Despliegue en el borde o en CPU: al ser un modelo de 1,5B en safetensors (3,1 GB), puede ejecutarse en portatiles y dispositivos sin GPU dedicada tras conversion a formatos cuantizados, para asistentes offline.
- Filtrado y preprocesado de datos a gran escala: su bajo coste por token permite usarlo como modelo de anotacion o generacion masiva en pipelines de datos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (comparativa con Qwen1.5):

| Dataset | Qwen1.5-0.5B-Chat | Qwen2-0.5B-Instruct | Qwen1.5-1.8B-Chat | Qwen2-1.5B-Instruct |
|---|---|---|---|---|
| MMLU | 35,0 | 37,9 | 43,7 | 52,4 |
| HumanEval | 9,1 | 17,1 | 25,0 | 37,8 |
| GSM8K | 11,3 | 40,1 | 35,3 | 61,6 |
| C-Eval | 37,2 | 45,2 | 55,3 | 63,8 |
| IFEval (Prompt Strict-Acc.) | 14,6 | 20,0 | 16,8 | 29,0 |

No se han publicado en la informacion disponible resultados de benchmarks frente a modelos de otros fabricantes (Llama, Gemma, Phi, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas cache KV y activaciones; en la practica, unos 4-5 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6-2 GB para pesos; en 4 bits, aproximadamente 0,8-1 GB (estimaciones teoricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). En cuantizacion 4/8 bits cabe en GPUs de 4 GB e incluso en iGPU con memoria compartida.
- Cabe en GPU de consumo: si, en toda la gama RTX 30/40 con 6 GB o mas en FP16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: `transformers` (nativo), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF (la conversion no esta documentada en la model card, pero el formato es compatible con las herramientas estandar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Qwen2-1.5B-Instruct | 1,5B | no disponible | 52,4 | 37,8 | 61,6 | Apache 2.0 |
| Qwen1.5-1.8B-Chat | 1,8B | no disponible | 43,7 | 25,0 | 35,3 | Apache 2.0 |
| Qwen2-0.5B-Instruct | 0,5B | no disponible | 37,9 | 17,1 | 40,1 | Apache 2.0 |

Los datos de Qwen1.5-1.8B-Chat y Qwen2-0.5B-Instruct provienen de la propia model card. No se dispone de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la model card; como todo modelo entrenado con datos web a gran escala, es probable que reproduzca sesgos presentes en esos datos.
- Alucinacion: con 1,5B parametros, la tasa de alucinacion es previsiblemente superior a la de modelos mayores; no se recomienda su uso en tareas de alta precision sin verificacion externa.
- Contexto e idioma: la longitud de contexto no esta documentada; el modelo esta etiquetado oficialmente solo para ingles, y aunque C-Eval sugiere competencia en chino, el rendimiento en otros idiomas no esta verificado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones practicas, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento subyacentes, no detalladas.
- Produccion: el repositorio es un espejo de terceros (ArchiveStudio) con 0 likes y 576 descargas; para produccion se recomienda usar el repositorio oficial `Qwen/Qwen2-1.5B-Instruct` y fijar la version de `transformers>=4.37.0` para evitar el error `KeyError: 'qwen2'`.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/ArchiveStudio/Qwen2-1.5B-Instruct
- Repositorio oficial: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Paper (Qwen2 Technical Report): https://arxiv.org/abs/2407.10671
