# j-llm/J-Deutzia-0.5B-Base

## Resumen

J-Deutzia-0.5B-Base es un modelo de lenguaje base en japonés desarrollado por la organización j-llm, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de tipo Mixture of Experts (MoE) con preentrenamiento continuado sobre japonés, diseñado como punto de partida para tareas de generación de texto en este idioma. Su tamaño es muy reducido: 469M de parámetros totales según la model card (533,7 millones contando los pesos reales en safetensors), de los cuales solo 199M están activos por token gracias a su arquitectura de 4 expertos con selección top-1.

Su relevancia reside en la combinación de tres factores: especialización en japonés mediante preentrenamiento continuado, eficiencia computacional derivada de la activación dispersa de expertos, y una licencia permisiva que permite uso comercial. Con una ventana de contexto de 16.384 tokens y un vocabulario de 72k tokens, es un candidato interesante para despliegues ligeros de generación de texto en japonés donde el coste de inferencia es una restricción importante.

Al ser un modelo base (no instruido), no está alineado mediante RLHF ni ajuste de instrucciones, por lo que requiere fine-tuning posterior (SFT, DPO, etc.) para usos conversacionales o de agente. El número de descargas es aún muy bajo (274), lo que indica que se trata de un proyecto de nicho sin comunidad consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt2moe), 4 expertos, top-1 |
| Parametros totales | 469M (model card) / 533.745.408 (pesos safetensors reales) |
| Parametros activos | 199M |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE etiquetada como `gpt2moe`, con 14 capas, 4 expertos por capa y enrutamiento top-1: por cada token se activa un único experto, lo que reduce el cómputo por token a aproximadamente 199M de parámetros activos frente a los 469M totales. Esta configuración permite obtener capacidad de modelo superior a la de un denso de 199M manteniendo la latencia y el coste de memoria de activaciones cercanos a ese tamaño. El vocabulario de 72k tokens está orientado a japonés, y la ventana de contexto de 16.384 tokens es notable para un modelo de este tamaño.

Sobre el proceso de entrenamiento, la model card indica que se trata de un modelo con preentrenamiento continuado (continual pre-training) en japonés, pero no especifica el modelo base del que parte, el número de tokens de entrenamiento, la composición del corpus ni el uso de técnicas de alineación. Tampoco se documenta el uso de RLHF o DPO, coherente con su naturaleza de modelo base. Un detalle técnico relevante es que el repositorio incluye código propio para carga e inferencia (`MoELMConfig`, `MoEProbeLM` y un `ReversibleSentencePieceAdapter` para tokenización), lo que sugiere una implementación personalizada que puede requerir pasos adicionales frente a arquitecturas estándar soportadas de forma nativa por transformers.

## Capacidades

- Generacion de texto en japones como modelo base (completado de texto, no conversacion instruida).
- Contexto largo relativo a su tamano: hasta 16.384 tokens de ventana.
- Arquitectura MoE top-1 con 199M de parametros activos, adecuada para inferencia eficiente.
- Tokenizacion mediante SentencePiece con adaptador reversible incluido en el repositorio.
- No dispone de capacidades documentadas de: tool calling, agentes, vision, audio ni modo de razonamiento extendido (thinking).
- Al ser un modelo base, no sigue instrucciones de forma fiable; requiere fine-tuning para chat, extraccion estructurada o uso como agente.
- Soporte multilingue: no disponible (solo japones segun la model card).

## Casos de uso

- Generacion de texto en japones en dispositivos con recursos limitados: con solo 199M de parametros activos, es viable ejecutarlo en CPU o en GPUs de consumo para completado de texto, redaccion de borradores o continuacion de documentos japoneses.
- Fine-tuning para chat en japones: su naturaleza de modelo base y licencia Apache 2.0 lo hacen adecuado como punto de partida para entrenar un asistente conversacional en japones con SFT y DPO sobre datasets como las variantes japonesas de instruct datasets.
- Completado de codigo o texto en editores: la ventana de 16.384 tokens permite incluir archivos o documentos de tamaño moderado como contexto para autocompletado o resumen local.
- Procesamiento de documentos japoneses de longitud media: la ventana de contexto permite tareas como resumen o extraccion de informacion sobre textos de hasta ~16k tokens (aproximadamente 20-30 paginas de texto japones).
- Investigacion sobre arquitecturas MoE: la inclusion de codigo de carga propio (`MoEProbeLM`) y el tamano reducido lo hacen util como banco de pruebas para experimentar con enrutamiento de expertos, cuantizacion o destilacion.
- Despliegue en batch de alto volumen: el bajo coste por token activo permite procesar grandes volumenes de texto japones (clasificacion por fine-tuning, etiquetado, generacion de datos sinteticos) con hardware minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones en japones (JGLUE, JMMLU, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,1 GB en safetensors (presumiblemente fp16/bf16), por lo que cabe holgadamente en GPUs de 4-6 GB; en fp32 ocuparia ~2,1 GB adicionales por copia de pesos.
- GPUs recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060 o superior) es suficiente para inferencia; para fine-tuning completo, una GPU de 24 GB (RTX 4090, RTX 3090) deberia bastar dado el tamano del modelo.
- Consumer GPU: si, cabe con comodidad en practicamente cualquier GPU de consumo con al menos 4 GB de VRAM; incluso es viable inferencia en CPU dado el tamano reducido.
- Opciones de despliegue: la model card documenta carga manual via safetensors con el codigo incluido en el repositorio (`code/canonical_corpus/probe_moe_lm.py`). No hay evidencia de soporte nativo en vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura `gpt2moe` es personalizada; se requiere verificar compatibilidad con transformers o adaptar el codigo proporcionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idioma principal |
|---|---|---|---|---|---|
| J-Deutzia-0.5B-Base | 469M | 199M | 16.384 | Apache 2.0 | Japones |
| Qwen2.5-0.5B | 494M | 494M (denso) | 32.768 | Qwen Research / Apache 2.0 (variantes) | Multilingue (incl. japones) |
| Llama-3.2-1B | 1.240M | 1.240M (denso) | 131.072 | Llama 3.2 Community | Multilingue (incl. japones) |
| Sarashina2.1-0.5B (SB Intuitions) | ~500M | ~500M (denso) | no disponible | Apache 2.0 | Japones |

J-Deutzia destaca frente a modelos densos de tamano similar por su menor coste computacional por token (199M activos) y su contexto de 16k, aunque los modelos densos alternativos cuentan con ecosistemas de despliegue mucho mas maduro (soporte nativo en vLLM, llama.cpp, Ollama) y, en el caso de Qwen2.5 y Llama 3.2, capacidades multilingues y benchmarks publicados. Frente a los modelos japoneses especializados de tamano comparable, su ventaja diferencial es la arquitectura MoE y la licencia Apache 2.0 sin restricciones.

## Limitaciones y advertencias

- Modelo base sin alineacion: genera texto por continuacion y puede producir contenido ofensivo, sesgado o incoherente sin fine-tuning previo; el repositorio esta etiquetado como `not-for-all-audiences`.
- Riesgo de alucinacion elevado: al tratarse de un modelo muy pequeno (199M activos) y sin datos publicos de benchmarks, no debe usarse para tareas factualmente exigentes sin verificacion.
- Sesgos: no documentados, pero al entrenarse sobre corpus japones heredara sesgos linguisticos y culturales del mismo; no se han publicado auditorias.
- Idioma: especializado en japones; el rendimiento en otros idiomas no esta documentado y probablemente sea pobre.
- Arquitectura personalizada: el tipo `gpt2moe` no es una arquitectura estandar, lo que complica la integracion con herramientas habituales de despliegue (vLLM, TGI, llama.cpp) y puede requerir mantenimiento del codigo de carga propio.
- Comunidad muy reducida: 274 descargas y 0 likes en el momento de redaccion, sin historial de validacion por terceros.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque conviene revisar el repositorio de origen para condiciones adicionales.
- Discrepancia entre parametros declarados (469M) y pesos reales (533,7M): conviene verificar la configuracion antes de planificar memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/J-Deutzia-0.5B-Base
- Organizacion j-llm: https://huggingface.co/j-llm
- Paper, blog o repositorio de GitHub: no disponible
