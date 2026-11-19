# mradermacher/Qwen3.8-27B-Uncensored-Chinese-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Chinese-GGUF es una redistribución en formato GGUF del modelo `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese`, un ajuste fino por SFT sobre una base de la familia Qwen 3.8 con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones). El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos de terceros, que ofrece aquí un conjunto estático de cuantizaciones más un complemento multimodal `mmproj` para uso con llama.cpp.

El modelo está etiquetado como `not-for-all-audiences`, `lora`, `sft` y `creative-writing`, y declara el chino (`zh`) como idioma. Es decir, se trata de un modelo afinado para escritura creativa sin filtros de contenido, orientado a un público que busca generar texto sin las restricciones de alineación habituales. La licencia declarada es Apache 2.0, aunque conviene tratar ese dato con cautela dado el origen comunitario del ajuste.

Su relevancia práctica es doble: por un lado, ofrece una vía sencilla de ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 11 a 29 GB; por otro, el hecho de ser un modelo "uncensored" implica riesgos de contenido que deben evaluarse antes de cualquier despliegue. La información publicada por el autor es muy escasa: no hay detalles de arquitectura, contexto, dataset de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen 3.8, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | chino (`zh`) segun la model card; resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repo | 190,8 GB |
| Metodo de ajuste | SFT sobre LoRA (etiquetas `lora`, `sft`) |
| Modelo base | vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. Por el nombre y el tamaño (27,3B) se infiere una base de la familia Qwen 3.8, pero no se confirma si se trata de un transformer denso, de una variante MoE ni de una arquitectura híbrida. Tampoco se especifican la longitud de contexto nativa, la composición del dataset de entrenamiento ni el número de tokens utilizados.

Lo único documentado es el proceso de ajuste: el autor del modelo base indica SFT con adaptadores LoRA, orientado a escritura creativa y sin alineación de seguridad (de ahí la etiqueta `not-for-all-audiences`). No consta RLHF, DPO ni ninguna innovación técnica adicional. La aportación de esta ficha concreta es exclusivamente la cuantización: mradermacher genera cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, además de un complemento multimodal `mmproj` que sugiere capacidades de visión en el modelo original, aunque no se detallan.

## Capacidades

- Generación de texto conversacional en chino, con orientación a escritura creativa.
- Generación de texto sin filtros de contenido (modelo "uncensored"), incluyendo temáticas que los modelos alineados rechazarían.
- Procesamiento multimodal potencial: el repositorio incluye ficheros `mmproj` (f16 y Q8_0), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se documenta el alcance.
- Conversación multi-turno: la etiqueta `conversational` sugiere uso en diálogo, si bien no se especifica la ventana de contexto.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.

## Casos de uso

- Escritura creativa sin restricciones: el modelo está afinado específicamente para `creative-writing` y sin alineación de seguridad, por lo que encaja en la generación de narrativa, guiones o ficción con temáticas adultas o controvertidas que otros modelos rechazan.
- Generación de contenido en chino: dado que el idioma declarado es `zh`, es adecuado para redacción, copywriting o diálogo en chino, aunque no se documenta su calidad en otros idiomas.
- Prototipado local en hardware de consumo: con cuantizaciones Q4_K_M de 16,9 GB puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, lo que permite experimentar con un modelo de 27B sin infraestructura de datacenter.
- Investigación sobre alineación y seguridad: útil como contrapunto "uncensored" para estudiar diferencias de comportamiento frente a modelos alineados, siempre en entornos controlados.
- Generación de datos sintéticos para fine-tuning: puede emplearse para producir corpus de texto creativo o conversacional en chino que luego se filtren y cursen.
- Despliegue en CPU o entornos con poca VRAM: las cuantizaciones Q2_K (11 GB) y Q3_K_S (12,4 GB) permiten inferencia en CPU con RAM suficiente o en GPUs de 12-16 GB, a costa de calidad.
- Experimentación multimodal: los ficheros `mmproj` permiten probar entrada de imágenes en llama.cpp, aunque sin documentación sobre el rendimiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~11 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir ~0,7-1 GB si se usa el complemento `mmproj`.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y para mayor contexto; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) solo con cuantizaciones Q2/Q3.
- Cabe en GPU de consumo: sí, con Q4_K_M en 24 GB y con Q2/Q3 en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio también declara `endpoints_compatible`. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Chinese (este) | ~27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste SFT sin alineacion, enfocado a chino y escritura creativa |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo alineado, multilingue, con benchmarks publicados |
| Gemma 2 27B IT | 27,2B | 8.192 tokens | Gemma License | safetensors, GGUF | Tamano casi identico, alineado y con benchmarks publicados |
| Mistral Small 24B Instruct | 23,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa alineada de tamano cercano |

La comparación es aproximada: no hay datos de rendimiento del modelo evaluado, por lo que solo puede compararse por tamaño, licencia y disponibilidad. Frente a las alternativas alineadas, la diferencia principal es la ausencia de filtros de seguridad y el enfoque en chino, no una mejora medible de capacidades.

## Limitaciones y advertencias

- Modelo explícitamente marcado como `not-for-all-audiences`: puede generar contenido violento, sexual, ilegal o dañino sin restricciones. No apto para productos de cara al público sin moderación adicional.
- Riesgo elevado de alucinación: no hay benchmarks ni documentación que permitan estimar su fiabilidad factual.
- Idiomas: solo se declara chino; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 declarada por el publicador de la cuantización, pero el modelo base es de origen comunitario y no hay garantía sobre la procedencia de los datos de entrenamiento ni sobre reclamaciones de terceros.
- El ajuste SFT con LoRA puede degradar capacidades generales (código, matemáticas, instrucciones complejas) respecto a la base original; no hay evaluación que lo confirme.
- El soporte multimodal vía `mmproj` no está documentado: su funcionamiento y calidad son inciertos.
- El repositorio ocupa 190,8 GB; conviene descargar solo la cuantización necesaria.
- Fecha de creación del repositorio (2026-09-26) posterior a la del conocimiento habitual de los modelos Qwen públicos; verificar la autenticidad y procedencia del modelo base antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Chinese-GGUF
- Modelo base: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Chinese-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Chinese-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
