# hrm-labs/GPT-6-Luna

## Resumen

GPT-6-Luna es un modelo de lenguaje publicado en Hugging Face por la organización hrm-labs bajo licencia Apache 2.0. Se trata de una conversión a formato GGUF, realizada por mradermacher, del modelo base NasledieLab/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy, un derivado destilado de la familia Qwen 3.5 con aproximadamente 752 millones de parámetros totales según los pesos en safetensors (752.393.024). El repositorio tiene un tamaño de 7,5 GB, coherente con la inclusión de múltiples cuantizaciones estáticas en formato GGUF.

El modelo se presenta como un modelo conversacional de pequeño tamaño, orientado a inglés y compatible con endpoints, lo que sugiere su uso en despliegues ligeros de chat. Su interés práctico reside en que, al ser un modelo sub-1B con cuantizaciones que van desde 0,5 GB (Q2_K) hasta 1,6 GB (f16), puede ejecutarse en hardware muy modesto, incluidas CPU y GPU de consumo con poca VRAM.

No obstante, la información publicada es muy limitada: la model card solo documenta el proceso de cuantización y no incluye detalles sobre arquitectura interna, datos de entrenamiento, contexto máximo, capacidades o benchmarks. Además, el nombre del modelo remite a una supuesta familia "GPT-6 Luna" de OpenAI, pero no hay evidencia en la información disponible de que este repositorio tenga relación con OpenAI; debe tratarse como un modelo independiente derivado de Qwen 3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen 3.5, arquitectura transformer) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre del modelo base indica que deriva de Qwen 3.5 (0.8B), por lo que cabe esperar una arquitectura transformer decoder-only de aproximadamente 0,8 mil millones de parámetros, pero no se confirma en la model card. El sufijo "distill" del nombre base sugiere un proceso de destilación, aunque no se especifican los detalles del profesor, el dataset ni la metodología.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente documenta el proceso de cuantización estática realizado por mradermacher, con cuantizaciones generadas mediante convert_type hf y sin cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints, lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling o function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Chat conversacional ligero en local: el modelo puede desplegarse con cuantizaciones de 0,5-0,9 GB en CPU o GPU de gama baja para asistentes conversacionales básicos en inglés, gracias a su reducido tamaño.
- Prototipado rápido de aplicaciones de IA: al ser compatible con transformers y con endpoints, permite validar pipelines de conversación antes de migrar a modelos mayores.
- Inferencia en dispositivos con recursos limitados: las cuantizaciones Q2_K a Q4_K_M permiten ejecución en entornos con menos de 1 GB de VRAM o RAM dedicada.
- Filtrado y clasificación de texto en inglés: un modelo de 0,8B puede emplearse para tareas de clasificación o etiquetado en pipelines de preprocesamiento, aunque no se documenta un entrenamiento específico para ello.
- Experimentación educativa: útil para estudiar el efecto de la cuantización GGUF en modelos pequeños, comparando las distintas variantes publicadas (Q2_K a f16).
- Base para fine-tuning ligero: al estar bajo licencia Apache 2.0 y tener pesos safetensors, puede servir como punto de partida para ajustes supervisados en tareas específicas de inglés.
- Despliegue en entornos de borde: su tamaño permite integración en aplicaciones de escritorio o embebidas con llama.cpp u Ollama, aunque el rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB con cuantizaciones Q2_K a Q4_K_M; alrededor de 0,9 GB con Q8_0 y 1,6 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; GPU de consumo como GTX 1650, RTX 3050 o superiores son suficientes. Para f16 se recomienda al menos 2-3 GB de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente vLLM o TGI para los pesos safetensors (no confirmado en la documentación).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GPT-6-Luna (hrm-labs) | 752 M | no disponible | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen 2.5 0.5B | 0,5 B | 32 K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B | 1,2 B | 128 K (tipico en la familia) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| SmolLM2 360M | 0,36 B | 8 K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Hugging Face |

Nota: los datos de contexto y parámetros de los modelos comparativos corresponden a conocimiento general de sus familias y no se han verificado en la información proporcionada para esta ficha; deben contrastarse antes de su uso en producción. No se dispone de datos de rendimiento comparativo para GPT-6-Luna.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente en inglés, es probable que presente sesgos culturales y lingüísticos propios de ese dominio.
- Riesgo de alucinación elevado por su reducido tamaño (0,8B) y por la falta de información sobre el proceso de alineación.
- Contexto máximo desconocido: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Soporte limitado al inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no documentadas en este repositorio; conviene verificar la licencia del modelo original de NasledieLab.
- El nombre "GPT-6-Luna" puede inducir a confusión con productos de OpenAI; no hay evidencia de relación alguna, por lo que no debe presentarse como un modelo oficial de OpenAI.
- No hay información sobre el proceso de entrenamiento ni evaluación, lo que dificulta estimar su calidad real frente a alternativas consolidadas.
- No se han publicado cuantizaciones ponderadas/imatrix, lo que puede afectar la calidad en cuantizaciones bajas (Q2_K, Q3_K).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hrm-labs/GPT-6-Luna
- Modelo base: https://huggingface.co/NasledieLab/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF
- Página de descarga de mradermacher: https://hf.tst.eu/model#Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Documentación de OpenAI sobre "GPT-6 Luna" (no relacionada con este repositorio, solo referencia del nombre): https://developers.openai.com/api/docs/models/gpt-6-luna
- Ficha de "GPT-6 Luna" en apxml (no relacionada con este repositorio): https://apxml.com/models/gpt-6-luna
