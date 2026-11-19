# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, que a su vez deriva del Qwen2.5-32B-Instruct de Alibaba. El modelo base es un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) ajustado mediante tecnicas de "abliteration" o "decensoring" para eliminar los mecanismos de rechazo y moderacion del modelo original. El resultado es un modelo de chat sin censura orientado a generacion de texto en ingles.

El trabajo de cuantizacion lo firma mradermacher, un prolífico creador de cuantizaciones GGUF para llama.cpp. Este repositorio concreto ofrece cuantizaciones de tipo i1 (imatrix) en un amplio rango de tamanos, desde IQ1_S (7,4 GB) hasta Q6_K (27,0 GB), lo que permite desplegar un modelo de 32B en hardware relativamente modesto a costa de perdida de calidad en las cuantizaciones mas agresivas. El repositorio ocupa 351,5 GB en total y acumula unas 2.901 descargas.

La relevancia de esta ficha radica en su perfil de uso: es un modelo de gran tamano, sin censura, en ingles y con licencia Apache 2.0 heredada, pensado para experimentacion, investigacion sobre alineamiento y casos donde el rechazo del modelo base resulta problematico. No es un modelo recomendado para produccion en entornos con requisitos de seguridad o moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-32B-Instruct original soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion por grupos de consultas (GQA), RoPE y normalizacion RMSNorm. El modelo original fue preentrenado por Alibaba sobre un corpus multilingue de gran escala y posteriormente ajustado con instrucciones y tecnicas de alineamiento (SFT y RLHF/DPO, segun la documentacion publica de Qwen2.5). Sobre esa base, richardyoung aplico un proceso de "abliteration" (denominado DiM-heretic) que modifica los pesos para reducir la propension del modelo a rechazar peticiones, manteniendo el resto de capacidades.

La innovacion tecnica de este repositorio concreto no esta en el modelo sino en la cuantizacion: mradermacher utiliza ficheros imatrix (importance matrix) para calcular cuantizaciones i1, que asignan mas bits a los tensores mas sensibles y mejoran la calidad respecto a cuantizaciones estaticas del mismo tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que i1-IQ3_S "beats Q3_K*". No se dispone de informacion sobre el volumen exacto de tokens de entrenamiento del ajuste heretic ni sobre la composicion del dataset de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con formato de chat (etiqueta `chat` en el repositorio).
- Razonamiento general, matematicas y codigo heredados del Qwen2.5-32B-Instruct base.
- Modo sin censura: el proceso de abliteration elimina o reduce los rechazos ante peticiones que el modelo original declinaria.
- Soporte de tool calling y function calling heredado de Qwen2.5 (no confirmado explicitamente en la informacion disponible, pero presente en el modelo base).
- Capacidades multilingues limitadas en la practica: la model card declara unicamente `en`.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en esta ficha.
- Compatible con endpoints (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como varia la tasa de rechazo tras abliteration comparando con el Qwen2.5-32B-Instruct original, usando la cuantizacion Q6_K (27,0 GB) para minimizar el ruido introducido por la cuantizacion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas que el modelo base rechazaria; la cuantizacion i1-Q4_K_M (20,0 GB) ofrece un equilibrio razonable entre calidad y requisitos de VRAM.
- Analisis de sesgos y robustez: al eliminar la capa de rechazo, el modelo expone con mas claridad los sesgos latentes del preentrenamiento, util para auditorias.
- Despliegue local en estaciones de trabajo con una sola GPU de 24 GB: la cuantizacion i1-Q4_K_S (18,9 GB) cabe en una RTX 4090 o RTX 3090, permitiendo experimentacion offline sin dependencia de APIs.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye desde IQ1_S hasta Q6_K, lo que facilita medir la degradacion de calidad por bits en tareas concretas mediante llama.cpp.
- Prototipado de asistentes de chat en ingles para entornos controlados donde la moderacion se gestiona en capas externas (filtros propios, no del modelo).
- Generacion de datos sinteticos para fine-tuning: el modelo puede producir grandes volumenes de texto diverso sin rechazos, util para aumentar datasets de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; unicamente se menciona un grafico de ikawrakow comparando cuantizaciones, sin valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto):
  - i1-IQ1_S (7,4 GB): ~9-10 GB de VRAM.
  - i1-IQ2_M (11,4 GB): ~13-14 GB.
  - i1-IQ3_S (14,5 GB): ~16-17 GB.
  - i1-Q4_K_M (20,0 GB): ~22-23 GB.
  - i1-Q5_K_M (23,4 GB): ~25-26 GB.
  - i1-Q6_K (27,0 GB): ~29-30 GB.
- GPU recomendadas:
  - RTX 4090 / RTX 3090 (24 GB): i1-Q4_K_S, i1-Q4_K_M e i1-IQ4_XS con contexto moderado; i1-Q3_S o i1-IQ3_M con contexto amplio.
  - A100 40 GB, A6000 48 GB, H100 80 GB: i1-Q5_K_M e i1-Q6_K con contexto largo.
  - Multi-GPU: necesaria para Q6_K con contexto extendido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizaciones Q4; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con IQ2 o IQ3 agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF sin conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF (este) | 32,8B | no disponible | Apache 2.0 | GGUF | Sin censura, solo ingles, cuantizaciones i1 |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 (segun doc. publica de Qwen) | Apache 2.0 | safetensors, GGUF | Con alineamiento y rechazos, multilingue |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,8B | no disponible | Apache 2.0 | safetensors | Modelo base de este GGUF, sin cuantizar |
| mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas (no imatrix) del mismo modelo |

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los rechazos, por lo que puede generar contenido danino, ilegal o sensible sin filtro. No apto para produccion orientada al publico sin moderacion externa.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de 32B, agravado en cuantizaciones bajas (IQ1, IQ2, Q2_K) donde la calidad se degrada notablemente ("very low quality" segun el propio autor para Q2_K_S).
- Perdida de calidad por cuantizacion: las variantes por debajo de IQ3_S no son recomendables para tareas que requieran precision; el autor sugiere IQ3_S sobre Q3_K_M y IQ3_M sobre Q3_K_L.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del modelo base enlaza a la licencia de Qwen; conviene verificar las condiciones del modelo original y del ajuste heretic antes de un despliegue comercial.
- Caveat de reproducibilidad: el proceso de abliteration puede afectar de forma no uniforme a capacidades (codigo, matematicas); no hay benchmarks publicados que cuantifiquen esa degradacion.
- Contexto: no se confirma en esta ficha la longitud de contexto efectiva tras el ajuste heretic; asumir la del Qwen2.5 original sin verificacion es arriesgado.
- Sin resultados de benchmarks: no hay evidencia publicada en este repositorio sobre MMLU, HumanEval u otras metricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
