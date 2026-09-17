# muhamad-geosurge/invert-polarity-6c619df2-fd6d-4d6e-b3b6-a599cb3b7080

## Resumen

Este repositorio contiene un ajuste fino del modelo Mistral-7B-v0.3, publicado por el usuario muhamad-geosurge con el identificador `muhamad-geosurge/invert-polarity-6c619df2-fd6d-4d6e-b3b6-a599cb3b7080`. Es un transformer decoder-only denso de 7 248 031 744 parámetros (7,25 B) cuyos pesos en safetensors ocupan 29,0 GB. El nombre del repositorio sugiere una modificación de comportamiento (inversión de polaridad), pero la documentación publicada no describe el objetivo, el dataset ni el procedimiento del ajuste.

La model card es, en la práctica, una copia de la de `mistralai/Mistral-7B-Instruct-v0.3`: conserva el bloque de acceso restringido con la política de privacidad de Mistral, la etiqueta `inference: false` y los ejemplos de uso con `mistral-common` y `transformers`. Por tanto, lo único verificable es que el modelo base es Mistral-7B-v0.3, que la licencia declarada es Apache 2.0 y que la biblioteca prevista para servirlo es vLLM (`library_name: vllm`).

Su relevancia potencial reside en que los ajustes de 7B sobre licencia Apache 2.0 son la vía más económica para desplegar asistentes en infraestructura propia, sin las restricciones de las licencias de Llama. Sin embargo, este repositorio concreto no publica benchmarks, no declara idiomas ni cuantizaciones y acumula 0 descargas y 0 likes. Debe tratarse, por tanto, como un experimento sin validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredado del modelo base Mistral-7B-v0.3; no documentado en este repositorio) |
| Parámetros totales | 7 248 031 744 (7,25 B), dato extraído de los pesos en safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Mistral-7B-v0.3 declara 32 768 tokens |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no declarados en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 29,0 GB) |
| Modelo base | mistralai/Mistral-7B-v0.3 (relación declarada: finetune) |
| Biblioteca declarada | vllm |
| Pipeline | no disponible |
| Tamaño del repositorio | 29,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 17 de septiembre de 2026 / 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se publica ningún detalle de la arquitectura ni del proceso de ajuste de este repositorio. Los únicos datos presentes en la información proporcionada son la relación de finetune sobre `mistralai/Mistral-7B-v0.3`, el número de parámetros y el formato de pesos. Cualquier descripción adicional procede de la documentación pública del modelo base y no está verificada en este repositorio: Mistral-7B-v0.3 es un transformer decoder-only denso con atención de consultas agrupadas (GQA), atención de ventana deslizante, RoPE, RMSNorm y FFN SwiGLU, con vocabulario de 32 768 tokens y tokenizador v3.

En cuanto al entrenamiento, no hay información disponible sobre número de tokens, composición del dataset, fases de SFT, DPO o RLHF, hiperparámetros ni método de ajuste. La model card copiada documenta que la variante Instruct de Mistral incorpora soporte de function calling y del tokenizador v3, pero esos datos describen `Mistral-7B-Instruct-v0.3`, no este ajuste. Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, destilación u otras).

## Capacidades

Las capacidades que se enumeran a continuación son las declaradas en la model card del repositorio, que describe `Mistral-7B-Instruct-v0.3` y no este ajuste. No han sido verificadas sobre estos pesos.

- Generación de texto y seguimiento de instrucciones: la model card declara un ajuste por instrucciones sobre Mistral-7B-v0.3, con plantilla de chat v3 y ejemplos de uso vía `pipeline("text-generation")`.
- Function calling / tool calling: la card documenta soporte explícito con `mistral-common` (`Tool` y `Function`) y con `transformers` a partir de la versión 4.42.0.
- Razonamiento multi-paso y uso como agente: no documentado.
- Código y matemáticas: no documentado; no se publican evaluaciones.
- Capacidades multilingües: no documentadas; el repositorio no enumera idiomas.
- Capacidades especiales: el modelo base es exclusivamente de texto, por lo que no hay visión, audio ni modo de razonamiento extendido (`thinking mode`) documentado.
- Contexto: no confirmado en este repositorio; el modelo base declara 32 768 tokens.

## Casos de uso

- Extracción de datos estructurados en pipelines documentales: procesar contratos, informes o expedientes completos en una sola pasada gracias a la ventana del modelo base (32 768 tokens) y devolver JSON con un esquema fijo. Requiere validación previa obligatoria, ya que no hay benchmarks publicados de este ajuste.
- Asistente conversacional interno con despliegue on-premise: la licencia Apache 2.0 permite servirlo con vLLM en una GPU de 24 GB sin enviar datos a terceros, algo relevante en sectores con requisitos de residencia de datos.
- Enrutado y clasificación de tickets o correos: tareas de texto corto con latencia baja, desplegables en int4 (≈4,0 GB de pesos) y con batching alto en una única GPU de consumo.
- Orquestación de herramientas en un agente RAG: la card documenta function calling, de modo que el modelo puede emitir llamadas a funciones que consulten bases vectoriales o APIs internas; conviene envolver las llamadas con validación de argumentos porque el comportamiento del ajuste no está verificado.
- Generación y revisión de código en entornos con requisitos de licencia permisiva: Apache 2.0 evita las cláusulas de escala de las licencias de Llama, lo que simplifica la integración en productos comerciales cerrados.
- Resumen y reescritura de documentación técnica extensa: la ventana heredada del modelo base permite resumir manuales o especificaciones largas sin trocear en exceso el contexto.
- Investigación sobre control de comportamiento (steering, abliteration o modificación de estilo): el nombre del repositorio apunta a una alteración de la polaridad de las respuestas, lo que lo convierte en un caso de estudio para estudiar cómo un ajuste corto modifica el estilo; sin embargo, la falta de documentación impide reproducir el experimento.
- Punto de partida para ajustes posteriores: al ser un modelo denso de 7,25 B con licencia Apache 2.0, puede reentrenarse con LoRA o QLoRA en una GPU de 24 GB para dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o alucinación, y la model card copiada tampoco incorpora métricas. No es posible, por tanto, estimar la degradación o mejora respecto al modelo base. Cualquier cifra que se atribuya a este ajuste carecería de respaldo. Las referencias comparativas de la siguiente sección corresponden a los modelos alternativos y a su documentación pública, no a este repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: 29,0 GB en fp32 (coincide con el tamaño del repositorio), ≈14,5 GB en bf16/fp16, ≈7,5 GB en int8 y ≈4,0 GB en int4. Son estimaciones calculadas a partir de 7 248 031 744 parámetros, no mediciones del autor.
- Caché KV: asumiendo la configuración del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128), cada token consume 128 KiB en bf16, es decir ≈4 GiB para 32 768 tokens.
- RTX 4090 o RTX 3090 (24 GB): permiten bf16 con el contexto completo de 32 768 tokens (≈14,5 GB de pesos más ≈4 GiB de caché KV) y todavía dejan margen para batching moderado.
- RTX 4080 o RTX 4070 Ti (16 GB): bf16 solo con contexto muy reducido; la opción razonable es int8 (≈7,5 GB), que deja espacio para caché y activaciones.
- RTX 3060 12 GB o RTX 4060 Ti 16 GB: int4 (≈4,0 GB) es la configuración cómoda; en la de 16 GB también cabe int8.
- A100 40 GB, A100 80 GB y H100 80 GB: bf16 con contexto completo y batching alto; no se requiere multi-GPU para inferencia.
- Cabe en GPU de consumo: sí, desde 12 GB con cuantización int4 y desde 24 GB en bf16 con contexto completo.
- Opciones de despliegue: vLLM (biblioteca declarada en la tarjeta), `transformers` (la card exige la versión 4.42.0 o superior para function calling), TGI y `mistral-inference`. Para llama.cpp u Ollama es necesario convertir los pesos a GGUF, conversión que el autor no publica.
- Latencia y throughput: no disponibles; no se publican mediciones de ningún tipo.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública y se incluyen como referencia de categoría; no se dispone de ninguna métrica de calidad comparable para este ajuste.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (base Mistral-7B-v0.3) | 7,25 B | no disponible (base: 32 768) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks ni documentación del ajuste |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32 768 | Apache 2.0 | HuggingFace, amplia adopción | Function calling, tokenizador v3 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131 072 | Licencia comunitaria de Llama 3.1 | HuggingFace (acceso restringido) | Contexto muy superior, licencia con cláusulas de escala |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32 768 nativos (131 072 con YaRN) | Apache 2.0 | HuggingFace | Multilingüe declarado, amplio soporte de cuantizaciones |

La diferencia práctica más relevante no es de tamaño, sino de trazabilidad: los tres modelos alternativos publican evaluaciones y documentación de entrenamiento, mientras que este repositorio no permite comparar calidad ni reproducir el ajuste.

## Limitaciones y advertencias

- La model card es una copia de la de `Mistral-7B-Instruct-v0.3`: describe otro identificador de modelo, conserva el bloque `extra_gated_description` con la política de privacidad de Mistral y la etiqueta `inference: false`. No sirve como documentación fiable de este repositorio.
- No hay benchmarks, evaluaciones de seguridad ni análisis de sesgos publicados, por lo que no puede estimarse la degradación respecto al modelo base.
- El nombre `invert-polarity` sugiere una modificación deliberada del comportamiento o del estilo de respuesta que no está documentada; existe riesgo de respuestas atípicas, sesgadas o incoherentes con el uso previsto.
- Riesgo de alucinación: inherente a un modelo de 7B sin evaluación publicada de fidelidad. En tareas de conocimiento abierto o de extracción de datos, la verificación factual es obligatoria.
- Idiomas: no se declara ninguno. No puede asumirse un rendimiento en castellano equivalente al del modelo base sin una evaluación propia.
- Contexto: al no documentarse, debe tratarse como no confirmado hasta verificarlo con los ficheros de configuración del repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y de licencia, y no exime de cumplir las condiciones aplicables al modelo base ni la normativa sobre datos personales y contenido generado.
- Adopción nula: 0 descargas y 0 likes implican ausencia total de validación por parte de la comunidad.
- Tamaño de descarga: 29,0 GB, compatibles con pesos en fp32 o con dos copias de los pesos en bf16. Si se confirma fp32, la inferencia será menos eficiente en memoria y ancho de banda que una versión en bf16.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que cualquier despliegue en hardware limitado exige conversión propia y su correspondiente validación de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-6c619df2-fd6d-4d6e-b3b6-a599cb3b7080
- Modelo base declarado: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Modelo descrito en la model card copiada: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Herramienta de inferencia recomendada en la card (mistral-inference): https://github.com/mistralai/mistral-inference
- Guía de function calling de transformers citada en la card: https://huggingface.co/docs/transformers/main/chat_templating#advanced-tool-use--function-calling
- Política de privacidad citada en el bloque gated de la card: https://mistral.ai/terms/
- Referencia residual incluida en la card (enlace de edición del README de Mistral-7B-Instruct-v0.2): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2/edit/main/README.md
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a definiciones del término «query» y no guardan relación con el modelo, su autor ni su modelo base.
