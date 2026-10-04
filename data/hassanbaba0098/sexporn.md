# hassanbaba0098/SexPorn

## Resumen

SexPorn es un modelo de generacion de texto de muy pequeno tamano publicado por el usuario hassanbaba0098 en HuggingFace, con 93.410.304 parametros (unos 93,4 millones) y un repositorio de 0,2 GB. Se distribuye en formato safetensors bajo licencia MIT y esta etiquetado como `qwen3`, aunque la propia model card indica que los pesos se han convertido a un formato compatible con Transformers-Llama. El unico idioma declarado es el chino (zh).

El modelo se presenta explicitamente como un modelo sin filtros de contenido, orientado a continuacion de texto en chino sin las restricciones de rechazo habituales de los asistentes comerciales. La model card lo describe como un modelo preentrenado, no conversacional, utilizable unicamente para continuacion de texto. Su ventana de contexto es de solo 512 tokens y su arquitectura es un transformer denso de 12 capas, 768 dimensiones ocultas y 8 cabezas de atencion.

Su relevancia es marginal desde el punto de vista tecnico: se trata de un experimento de bajo presupuesto (dos T4 de 16 GB y mas de 24 horas de preentrenamiento) sin benchmarks publicados, sin descargas ni likes en el momento de la consulta y con zero validacion externa. Resulta ilustrativo, eso si, como ejemplo de modelos pequenos entrenados especificamente para eludir filtros de seguridad, una practica con implicaciones legales y eticas relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only); la model card indica conversion a formato Transformers-Llama, la etiqueta del repositorio indica qwen3 |
| Parametros totales | 93.410.304 (93,4 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len`: 512) |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Parametros internos declarados por el autor: `hidden_size` 768, 12 capas, 8 cabezas de atencion, `max_seq_len` 512.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de escala reducida: 12 capas, 768 dimensiones ocultas y 8 cabezas de atencion, lo que da 93,4 millones de parametros. No hay innovaciones tecnicas declaradas (no se menciona atencion lineal, decodificacion especulativa, MoE ni arquitecturas hibridas). La model card afirma que los pesos se han convertido a un formato compatible con Transformers-Llama, mientras que el etiquetado del repositorio apunta a `qwen3`; esta discrepancia no se explica en la documentacion.

Los datos de entrenamiento no se detallan en absoluto: no se especifica el numero de tokens, la composicion del corpus, la procedencia de los datos ni si hubo fases de ajuste fino, RLHF o DPO. Lo unico que se indica es la configuracion de hardware (dos GPU NVIDIA T4 de 16 GB) y una duracion de preentrenamiento superior a 24 horas. La model card menciona una co-creacion con el usuario ZeLi111 y enlaza utilidades externas de terceros ajenas al entrenamiento del modelo. El autor declara explicitamente que se trata de un modelo preentrenado y no conversacional.

## Capacidades

- Generacion de texto por continuacion en chino: es la unica funcion declarada de forma explicita.
- Modelo preentrenado, no afinado para dialogo: la propia model card advierte que no es un modelo conversacional.
- Sin soporte declarado de tool calling ni function calling.
- Sin soporte declarado de agentes, planificacion multi-paso ni razonamiento estructurado.
- Sin capacidades multimodales: no hay vision, audio ni cualquier otra modalidad.
- Sin modo de razonamiento explicito (thinking mode) ni decodificacion especial.
- Multilingue: limitado estrictamente al chino segun la etiqueta `language: zh`.
- Sin mecanismo de alineacion o filtrado de contenido: el modelo no incorpora rechazo de peticiones.

## Casos de uso

- Continuacion de texto en chino en dominios sin restricciones: dado que el modelo esta preentrenado y no alineado, puede emplearse para completar fragmentos de texto en chino dentro de una ventana de 512 tokens, siempre que el operador asuma la responsabilidad legal del contenido generado.
- Investigacion sobre alineacion y filtrado: sirve como contrapunto experimental para estudiar como se comporta un modelo pequeno y sin alinear frente a modelos con politicas de contenido, en entornos de laboratorio controlados.
- Estudio de modelos de menos de 100 M de parametros: util para analizar el limite inferior de calidad de generacion en chino con 12 capas y 768 dimensiones ocultas.
- Pruebas de infraestructura de despliegue: al ocupar menos de 200 MB en punto flotante de 16 bits, es adecuado para validar pipelines de servido (vLLM, TGI, llama.cpp) en entornos de pruebas sin coste de GPU significativo.
- Docencia sobre riesgos de modelos sin filtros: puede usarse como caso practico para ilustrar por que los modelos publicos sin alineacion requieren controles de despliegue.
- Evaluacion de tecnicas de moderacion: util como generador de contenido adversario controlado para validar clasificadores de seguridad en un entorno aislado, nunca en produccion abierta.

Nota: no se recomienda su uso en produccion orientada al publico. Muchos de los casos anteriores solo son defendibles en entornos de investigacion cerrados y con supervision legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, C-Eval ni de ninguna otra evaluacion estandar.

La model card incluye una tabla de "tasas de rechazo" que compara el autor con ChatGPT, Claude, Gemini, Grok, Qwen, DeepSeek y otros, con columnas como censura, bloqueo NSFW, restricciones politicas y "tasa de falsos rechazos". Esa tabla es una valoracion subjetiva del autor, sin metodologia, sin conjunto de evaluacion y sin datos reproducibles; no constituye un benchmark y no se reproduce aqui como resultado de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 190 MB en fp16/bf16 (93,4 M de parametros x 2 bytes), en torno a 95 MB en int8 y unos 50 MB en int4, sin contar el coste del contexto ni el overhead del runtime.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en una GTX 1650, RTX 3050, RTX 4090 o incluso en GPU integradas. No requiere A100 ni H100.
- Consumer GPU: si, cabe en cualquier GPU de consumo actual e incluso en hardware de gama baja.
- CPU: la inferencia en CPU es perfectamente viable dado el tamano; tambien es posible ejecutarlo en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: al publicarse solo safetensors, se puede cargar con la libreria `transformers`. Para vLLM, TGI o llama.cpp seria necesario convertirlo previamente; no se proporcionan pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de escala equivalente, ampliamente conocidos. Los datos de las alternativas corresponden a valores publicados habitualmente por sus autores y deben verificarse en la documentacion oficial.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SexPorn | 93,4 M | 512 | chino | MIT | HuggingFace, 0 descargas |
| GPT-2 small | ~124 M | 1024 | ingles | MIT modificada | HuggingFace, ampliamente usado |
| SmolLM-135M | ~135 M | 2048 | ingles | Apache-2.0 | HuggingFace, con versiones GGUF |
| Qwen2.5-0.5B | ~494 M | 32.768 | multilingue | Apache-2.0 | HuggingFace, con versiones GGUF |

SexPorn es el mas pequeno y el de menor contexto de la tabla. Frente a GPT-2 small pierde en contexto (512 frente a 1024) y en ecosistema de herramientas; frente a SmolLM-135M y Qwen2.5-0.5B queda muy por detras en ventana de contexto, soporte multilingue y disponibilidad de cuantizaciones. No hay datos de rendimiento publicados que permitan comparar calidad de generacion.

## Limitaciones y advertencias

- Contenido explicito y sin filtros: el modelo esta disenado para eludir politicas de contenido. La model card incluye ejemplos de salida de caracter sexual explicito y el propio repositorio se presenta como una alternativa a los asistentes con moderacion.
- Ausencia total de alineacion: no hay RLHF, DPO ni filtros, lo que implica riesgo elevado de generar contenido ilegal, danino o sexual explicito sin ninguna salvaguarda.
- Riesgo de alucinacion muy alto: con 93 M de parametros y 512 tokens de contexto, la coherencia a medio plazo es muy limitada y la fidelidad factual no esta garantizada.
- Contexto muy restringido: 512 tokens impiden cualquier caso de uso que requiera documentos largos, conversaciones multi-turno extensas o razonamiento de cadena larga.
- Idioma: unicamente chino. No hay soporte declarado para castellano ni para ninguna otra lengua.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia no exime al usuario de responsabilidad legal sobre el contenido generado. La model card incluye un descargo que traslada toda la responsabilidad al usuario.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta, sin issues, sin versiones derivadas y sin validacion externa. El autor no ofrece garantias de soporte.
- Inconsistencia en los metadatos: la etiqueta `qwen3` no concuerda con la afirmacion de conversion a formato Llama, y la fecha de creacion indicada (2026-10-04) es posterior a la fecha de consulta, lo que sugiere metadatos poco fiables.
- Advertencia legal: el uso de este modelo para generar material de abuso sexual infantil, contenido no consentido o cualquier material ilegal constituye un delito en Espana y en la Union Europea con independencia de la licencia del modelo. No debe desplegarse en entornos accesibles al publico sin moderacion.

## Enlaces

- HuggingFace: https://huggingface.co/hassanbaba0098/SexPorn
- Co-creador declarado en la model card: https://huggingface.co/ZeLi111
- Utilidad externa enlazada por el autor (exportacion de conversaciones de ChatGPT): https://github.com/tom12191h5/Export-ChatGPT-Dialogue
- Utilidad externa enlazada por el autor (bloqueo de rechazos de ChatGPT): https://github.com/tom12191h5/ChatGPT-Refuse-Blocker
- Paper, blog tecnico, repositorio de entrenamiento o demo oficial: no disponible.

Los resultados de la busqueda web (NextPorn, VirtuaVixen, PornPrompt.ai, XmodelsAI) son plataformas genericas de contenido adulto generado por IA y no guardan relacion con este modelo ni con su desarrollo.
