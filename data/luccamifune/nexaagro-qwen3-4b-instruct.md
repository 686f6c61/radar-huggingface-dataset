# luccamifune/NexaAgro-Qwen3-4B-Instruct

## Resumen

NexaAgro-Qwen3-4B-Instruct es un ajuste fino publicado por el usuario luccamifune sobre `unsloth/qwen3-4b-unsloth-bnb-4bit`, una version cuantizada a 4 bits (bitsandbytes NF4) del modelo denso Qwen3-4B de Alibaba, preparada por Unsloth para entrenamiento con QLoRA. El repositorio se distribuye bajo licencia Apache 2.0, declara unicamente el idioma ingles y fue entrenado, segun la propia model card, con el framework de Unsloth. No se documentan el dataset de ajuste, el numero de pasos, la composicion de los datos ni el metodo de alineacion empleado.

El nombre del repositorio sugiere un enfoque en el ambito agroalimentario, pero la model card no confirma ni describe esa especializacion: se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento. A dia de la consulta el repositorio acumula 0 descargas y 0 likes, sin pipeline declarado y con un tamano de 0,1 GB, muy inferior a los aproximadamente 8 GB que ocuparian los pesos de un modelo denso de 4.000 millones de parametros en safetensors de 16 bits.

Por su tamano, un modelo de 4B es relevante para despliegue en GPU de consumo, prototipado local y ciclos rapidos de ajuste fino de dominio. Sin embargo, al tratarse de un ajuste sin evaluacion publicada, sin documentacion de datos y con cero adopcion registrada, debe considerarse un artefacto experimental: hereda la arquitectura y las capacidades potenciales de Qwen3-4B, pero no hay evidencia publicada de que las conserve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con modos hibrido thinking/no-thinking en el modelo base; el ajuste parte de una version cuantizada a 4 bits |
| Parametros totales | Aproximadamente 4.000 millones (heredado de Qwen3-4B); la model card del ajuste no declara el recuento exacto |
| Parametros activos | No aplica: arquitectura densa, no es un modelo MoE |
| Longitud de contexto | No documentada para el ajuste. El modelo base Qwen3-4B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN segun su documentacion oficial |
| Tipos de cuantizacion | El modelo base esta en bitsandbytes NF4 (bnb-4bit). El repositorio no publica variantes GGUF, AWQ, GPTQ ni FP8 propias |
| Idiomas soportados | en (unico idioma declarado en la etiqueta del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repo 0,1 GB |
| Libreria declarada | transformers |
| Fecha de publicacion | 30 de septiembre de 2026, segun metadatos del repositorio (actualizado el mismo dia) |
| Modelo base | unsloth/qwen3-4b-unsloth-bnb-4bit |

Nota: la diferencia entre el tamano declarado del repositorio (0,1 GB) y el esperado para pesos completos de un 4B en 16 bits (unos 8 GB) no queda explicada en la model card. Es compatible con adaptadores LoRA sin fusionar, con un checkpoint incompleto o con pesos ya cuantizados, pero no se dispone de confirmacion.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso (no MoE) con atencion de consultas agrupadas (GQA) y soporte de modos de pensamiento explicito. Segun la documentacion oficial de Qwen3-4B, la configuracion base incluye 36 capas, hidden size de 2.560, 32 cabezas de consulta y 8 cabezas de clave/valor con head_dim de 128, y un vocabulario de 151.669 tokens. El modelo base admite 32.768 tokens de contexto nativo y extension a 131.072 mediante YaRN. Esta informacion corresponde al modelo base publicado por Qwen, no al ajuste objeto de esta ficha.

No hay informacion disponible sobre el proceso de ajuste de NexaAgro-Qwen3-4B-Instruct: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si hubo una fase de instruccion supervisada, DPO, RLHF u otro metodo de alineacion, y si se aplico enmascaramiento de la perdida sobre las respuestas. La model card unicamente indica que el entrenamiento se realizo con Unsloth y que fue "2x mas rapido" gracias a ese framework, lo que sugiere un ajuste eficiente en memoria, probablemente QLoRA sobre la base ya cuantizada a 4 bits. El autor tampoco documenta hiperparametros, semillas, ni la plantilla de chat empleada.

## Capacidades

- Generacion de texto en ingles: capacidad minima esperable por herencia del modelo base, sin evaluacion publicada que la confirme tras el ajuste.
- Razonamiento y conocimiento general: Qwen3-4B es un modelo denso de 4B con resultados publicados por Qwen; no hay datos que acrediten que el ajuste los preserve.
- Modo de razonamiento explicito (thinking mode): el modelo base incorpora conmutacion thinking/no-thinking; la model card del ajuste no indica si se conserva ni como se activa.
- Tool calling y function calling: el modelo base Qwen3-4B incluye plantillas y soporte en Qwen-Agent; no documentado para este ajuste.
- Uso en agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades multilingues: no declaradas; la etiqueta del repositorio indica exclusivamente ingles, aunque el modelo base Qwen3-4B declara soporte de mas de 100 idiomas.
- Capacidades de vision o audio: no disponibles.
- Especializacion de dominio: el nombre del repositorio sugiere un enfoque agroalimentario, pero no hay ninguna descripcion, ejemplos ni evaluacion que lo respalden.

## Casos de uso

- Prototipado local en GPU de consumo: por su tamano de 4B y su formato de 4 bits, puede ejecutarse en tarjetas con 8-12 GB de VRAM mediante transformers con bitsandbytes o, tras conversion a GGUF, con llama.cpp u Ollama. Es adecuado para validar ideas de producto sin coste de API.
- Base para ajustes de dominio con QLoRA: al estar construido sobre una base de Unsloth ya cuantizada a 4 bits, sirve como punto de partida para nuevos ciclos de ajuste con LoRA sobre datasets propios, especialmente en el ambito agroalimentario que sugiere su nombre.
- Analisis y extraccion de informacion en documentacion tecnica extensa: con la ventana de 32.768 tokens del modelo base, puede procesar fichas de producto, etiquetas fitosanitarias, informes de campo o pliegos completos en una sola pasada, siempre que se valide la fidelidad de la extraccion.
- Asistente conversacional en ingles para consultas internas: con una plantilla de chat bien definida y un sistema de recuperacion (RAG) que aporte el conocimiento actualizado, puede gestionar conversaciones multi-turno. La ventana de contexto permite incluir varios documentos recuperados por turno.
- Generacion de scripts auxiliares y consultas de datos: puede redactar fragmentos de Python o SQL sencillos para scripts de analisis de series de sensores o de limpieza de datos. No hay evidencia de rendimiento en codigo, por lo que requiere revision humana.
- Experimentacion academica sobre ajuste eficiente: util como caso de estudio de QLoRA con Unsloth, para medir perdida de capacidades tras el ajuste sobre una base cuantizada a 4 bits.
- Clasificacion y etiquetado de textos cortos: notas de campo, incidencias de cultivo o tickets de soporte, con la salida restringida a un conjunto cerrado de etiquetas y validacion posterior.
- Resumen de actas y reuniones tecnicas en ingles: la ventana de contexto permite resumir transcripciones de longitud media con una sola pasada, sujeto a verificacion de que no se introduzcan datos no presentes en el original.

En todos los casos, la ausencia de evaluacion publicada obliga a realizar una bateria de validacion propia antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del ajuste no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco hay una evaluacion comparativa frente al modelo base. Los resultados publicados por Qwen para Qwen3-4B corresponden al modelo original y no son extrapolables a este ajuste sin una evaluacion independiente.

## Requisitos de hardware

Estimaciones orientativas de VRAM para inferencia, calculadas sobre un modelo denso de 4B. No son mediciones de este repositorio concreto y deben validarse en el entorno real:

- BF16/FP16: aproximadamente 8,0 GB solo en pesos; con cache KV y overhead, del orden de 10-14 GB de VRAM.
- 8 bits (bitsandbytes o GPTQ/AWQ de 8 bits): alrededor de 4,2 GB en pesos; del orden de 6-8 GB de VRAM.
- 4 bits (bnb NF4 o GGUF Q4_K_M): entre 2,3 y 2,7 GB en pesos; del orden de 4-6 GB de VRAM con contexto moderado.
- Cache KV con GQA: unos 147 KB por token en FP16 (2 x 36 capas x 8 cabezas KV x 128 de head_dim x 2 bytes). 8.192 tokens suponen aproximadamente 1,2 GB; 32.768 tokens, aproximadamente 4,8 GB. A 32K de contexto, la cache KV pesa mas que los pesos del modelo en 4 bits, por lo que la longitud de contexto es el principal limitante de memoria. Una cache KV de 8 bits reduce estas cifras a la mitad.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 para uso local; L4, A10G, A100 de 40/80 GB y H100 para servicio con batching. La receta oficial de vLLM para Qwen3-4B indica que el modelo cabe en una unica GPU, en un chip TPU v6e o en un nodo NUMA con Xeon 6.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM en cuantizacion de 4 bits con contexto corto, y en tarjetas de 12-16 GB con contexto largo.
- Opciones de despliegue: transformers (con bitsandbytes), vLLM, SGLang, text-generation-inference (etiqueta declarada en el repositorio), llama.cpp y Ollama previa conversion a GGUF, y endpoints compatibles con la API de inferencia de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este ajuste. Como referencia del orden de magnitud para un 4B denso, en una A100 o H100 con vLLM y batching alto es habitual alcanzar miles de tokens por segundo agregados y decenas de tokens por segundo por usuario en streaming, pero se trata de una estimacion no verificada para este repositorio.

## Comparativa con modelos similares

Comparativa con alternativas de tamano equivalente. Los datos de los modelos de referencia proceden de su documentacion publica y no forman parte de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NexaAgro-Qwen3-4B-Instruct | ~4B (heredado) | No documentado en el ajuste; 32K nativo / 128K con YaRN en la base | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen3-4B-Instruct-2507 | 4B denso | 32K nativo / 128K con YaRN | apache-2.0 | HuggingFace oficial de Qwen, ampliamente distribuido |
| Llama-3.2-3B-Instruct | 3B denso | 128K | Llama 3.2 Community License | HuggingFace oficial de Meta |
| Phi-4-mini-instruct | 3,8B denso | 128K | MIT | HuggingFace oficial de Microsoft |
| Gemma-3-4B-IT | 4B denso | 128K | Gemma Terms of Use | HuggingFace oficial de Google |

Diferencias relevantes: frente a las alternativas, este ajuste no aporta documentacion de datos, evaluacion publicada ni garantia de conservacion de capacidades, y su licencia Apache 2.0 es la mas permisiva del grupo junto con MIT. Su ventaja potencial es la especializacion de dominio, no confirmada, y el hecho de partir de una base de 4 bits que abarata el reajuste.

## Limitaciones y advertencias

- Dataset de ajuste completamente desconocido: no se puede evaluar que sesgos, dominios o estilos se han introducido ni si el modelo ha sufrido olvido catastrofico de las capacidades del modelo base.
- Ausencia total de evaluacion: 0 descargas y 0 likes, sin benchmarks ni ejemplos cualitativos. No hay ninguna evidencia publica de calidad.
- Riesgo alto de alucinacion en dominio especializado: si se uso un corpus agronomico reducido, es probable que el modelo invente datos tecnicos (dosis, plazos, normativa) con apariencia de verosimilitud. En aplicaciones agronomicas esto puede tener consecuencias materiales.
- Fecha de creacion registrada en 2026, posterior a la fecha habitual de consulta de los repositorios, lo que sugiere un posible error en los metadatos del autor.
- Tamano del repositorio incoherente: 0,1 GB es demasiado pequeno para pesos safetensors de un 4B. Antes de usarlo hay que verificar que el repositorio contiene los ficheros necesarios para cargar el modelo.
- Posible perdida de la plantilla de chat: no se documenta el formato de prompt usado en el ajuste. Aplicar una plantilla incorrecta degrada la calidad de forma severa.
- Soporte de idiomas limitado en la practica: la etiqueta declara solo ingles. El uso en castellano no esta soportado ni probado.
- Perdida probable de capacidades heredadas: el tool calling, el modo thinking y el multilingueismo del modelo base pueden haberse degradado o eliminado con el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base original (Qwen3-4B) y de la version de Unsloth, asi como las condiciones de los datos de ajuste, que no se declaran.
- Sin garantia de seguridad: no hay informacion sobre entrenamiento de seguridad, filtros de contenido ni alineacion frente a usos daninos.
- No apto para produccion sin validacion previa: cualquier despliegue deberia acompanarse de evaluacion propia, filtros de salida y supervision humana en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luccamifune/NexaAgro-Qwen3-4B-Instruct
- Modelo base de Unsloth: https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit
- Qwen3-4B (modelo original de Qwen): https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Receta de despliegue de Qwen3-4B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
