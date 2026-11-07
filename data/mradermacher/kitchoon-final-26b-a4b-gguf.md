# mradermacher/Kitchoon-Final-26B-A4B-GGUF

## Resumen

Kitchoon-Final-26B-A4B-GGUF es una distribución de cuantizaciones GGUF estáticas del modelo SubMaroon/Kitchoon-Final-26B-A4B, publicada por el usuario mradermacher. Se trata de un modelo de tipo Mixture of Experts (MoE) con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y 4 mil millones de parámetros activos por token, según indica el sufijo "A4B" del nombre. El modelo está etiquetado como "gemma4", lo que sugiere que su arquitectura deriva de la familia Gemma, aunque no se dispone de confirmación oficial en la información proporcionada.

El propósito declarado del modelo es el roleplay y la conversación, con etiquetas que indican que ha sido sometido a un proceso de "abliteración" o eliminación de rechazos ("heretic", "uncensored") y que está orientado a su uso con frontends como SillyTavern. La licencia es Apache 2.0 y el único idioma declarado es el inglés. El repositorio tiene un tamaño de 182,9 GB, lo que refleja la inclusión de múltiples archivos de cuantización, desde Q2_K hasta Q8_0.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente un modelo especializado en roleplay sin censura, con un equilibrio interesante entre tamaño total (25B) y parámetros activos (4B), lo que reduce los requisitos de cómputo en inferencia. No obstante, la ausencia de benchmarks, de documentación técnica detallada y de datos sobre el entrenamiento limita considerablemente la evaluación objetiva de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 (según etiqueta "gemma4"), transformer |
| Parametros totales | 25.233.142.046 (≈25,2B) |
| Parametros activos | 4B (según sufijo "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); también existen cuantizaciones imatrix en el repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un Mixture of Experts (MoE) con 25,2 mil millones de parámetros totales y 4 mil millones activos por token. La etiqueta "gemma4" sugiere que la arquitectura subyacente deriva de la familia Gemma de Google, aunque no se especifica la versión exacta ni los detalles del bloque transformer. El hecho de que sea MoE implica que cada token activa solo una fracción de los expertos, lo que reduce el coste computacional en inferencia en comparación con un modelo denso del mismo tamaño total.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. Las etiquetas "heretic" y "uncensored" indican que el modelo ha sido modificado para eliminar o reducir los mecanismos de rechazo y censura, probablemente mediante técnicas de abliteración o fine-tuning con datasets sin filtros. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a roleplay y diálogo multi-turno.
- Modo "uncensored": el modelo ha sido modificado para reducir rechazos y respuestas evasivas, lo que permite abordar temáticas que otros modelos bloquearían.
- Integración con frontends de roleplay como SillyTavern, según las etiquetas del repositorio.
- Capacidad multilingüe limitada: solo se declara inglés ("en").
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha documentado capacidad de visión, audio ni modo "thinking".
- No se dispone de información sobre capacidades de código o matemáticas.

## Casos de uso

- Roleplay conversacional en local: el modelo puede gestionar personajes y narrativas multi-turno en SillyTavern, aprovechando su naturaleza MoE para mantener un throughput aceptable en hardware de consumo con cuantizaciones Q4_K_M.
- Generación creativa sin restricciones: útil para escritura de ficción, guiones o narrativa interactiva donde se requiere evitar filtros de contenido, gracias a su ajuste "uncensored".
- Prototipado de chatbots de personaje: desarrolladores pueden desplegar el modelo con llama.cpp u Ollama para experimentar con personalidades y estilos conversacionales sin depender de APIs externas.
- Investigación sobre alineación y censura: el modelo sirve como caso de estudio para comparar el comportamiento de un modelo "abliterado" frente a su base alineada, en entornos controlados.
- Evaluación de cuantizaciones GGUF: el repositorio ofrece un espectro completo de cuantizaciones (Q2_K a Q8_0) que permite medir el impacto de la compresión en la calidad conversacional y en los requisitos de VRAM.
- Despliegue en estaciones de trabajo con GPU única: con 4B parámetros activos, las cuantizaciones Q4_K_S (15,6 GB) o Q5_K_M (19,2 GB) caben en GPUs consumer de gama alta como RTX 4090 (24 GB), facilitando inferencia local a baja latencia.
- Fine-tuning posterior o adaptación con LoRA: aunque no se documenta, el formato GGUF no es ideal para entrenamiento; para ello sería necesario partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈10,7 GB; Q3_K_S ≈12,3 GB; Q4_K_S ≈15,6 GB; Q4_K_M ≈16,9 GB; Q5_K_M ≈19,2 GB; Q6_K ≈22,7 GB; Q8_0 ≈27,0 GB. Estas cifras corresponden al tamaño del archivo y deben incrementarse con el espacio para el contexto KV.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se requiere una A100 40 GB, H100 o similar, o bien descarga parcial a CPU.
- Cabe en GPU consumer: sí, en GPUs con 16-24 GB para cuantizaciones Q4 y Q5; las cuantizaciones Q2 y Q3 caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se ha confirmado soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con 4B activos, se espera un throughput superior al de un modelo denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-GGUF | 25,2B / 4B | no disponible | Apache 2.0 | GGUF | Roleplay, uncensored, solo inglés |
| Kitchoon-26B-A4B-GGUF (mradermacher) | 25,2B / 4B (presumiblemente) | no disponible | Apache 2.0 | GGUF | Variante anterior del mismo autor |
| Kitchoon-V3-26B-A4B-i1-GGUF (mradermacher) | 25,2B / 4B (presumiblemente) | no disponible | Apache 2.0 | GGUF (imatrix) | Variante V3 con cuantizaciones imatrix |

No se dispone de información sobre otros modelos comparables de la misma categoría (roleplay uncensored MoE) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado capacitación multilingüe.
- El ajuste "uncensored" y "heretic" implica que el modelo puede generar contenido ofensivo, explícito o dañino sin filtros; no es apto para aplicaciones de producción orientadas al público general sin moderación adicional.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni benchmarks de razonamiento.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar conversaciones de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas si se utiliza en contextos regulados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No hay documentación sobre el proceso de entrenamiento ni sobre los datos utilizados, lo que dificulta evaluar sesgos y calidad.
- El formato GGUF está orientado a inferencia, no a entrenamiento o fine-tuning.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kitchoon-Final-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kitchoon-Final-26B-A4B-GGUF
- Variante anterior: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-GGUF
- Variante V3 imatrix: https://huggingface.co/mradermacher/Kitchoon-V3-26B-A4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
