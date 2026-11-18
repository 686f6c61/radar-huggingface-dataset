# mradermacher/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean-GGUF

## Resumen

`mradermacher/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `Xhaheen/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean`, un ajuste fino de Gemma 2 orientado a instrucciones en urdu. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que en este caso ofrece 12 variantes estáticas (desde Q2_K hasta f16) para facilitar la inferencia en CPU y GPU de gama baja.

El modelo subyacente parte de la familia Gemma 2 de Google y conserva su arquitectura transformer decoder-only, con aproximadamente 2.506 millones de parámetros (unos 2,5 mil millones), lo que lo sitúa en la gama pequeña de la familia. El ajuste fino se ha realizado sobre el checkpoint instructivo de Gemma 2 y se ha orientado a conversación en urdu, aunque la model card solo declara el idioma inglés en sus metadatos, lo que supone una discrepancia notable con el nombre del modelo.

La relevancia de esta ficha radica en que permite ejecutar un modelo conversacional de tamaño contenido en hardware modesto, con cuantizaciones que van de 1,3 GB a 5,1 GB. No obstante, la información publicada por el autor es mínima: no hay detalles sobre el dataset de ajuste fino, hiperparámetros, licencia explícita ni benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, segun el modelo base) |
| Parametros totales | 2.506.172.416 (2,5 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos); el nombre del modelo sugiere urdu, pero no se declara oficialmente |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 23,4 GB (incluye todas las cuantizaciones) |
| Libreria | transformers |
| Pipeline | no disponible |
| Modelo base | Xhaheen/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean |
| Fecha de creacion | 2024-12-22 |
| Descargas | 103 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 2, un transformer decoder-only con atención multi-cabeza y las innovaciones propias de la familia (atención alternada local/global, normalización RMSNorm, activación GeGLU). El modelo base `Xhaheen/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean` es un ajuste fino del checkpoint instructivo de Gemma 2, presumiblemente mediante fine-tuning supervisado sobre un corpus en urdu, aunque la model card no documenta ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

El trabajo de mradermacher se limita a la cuantización estática a GGUF mediante herramientas del ecosistema llama.cpp. La model card indica explícitamente que no se han generado cuantizaciones ponderadas con imatrix en el momento de la publicación, lo que implica que las versiones IQ disponibles (IQ4_XS) son estáticas y no aprovechan la mejora de calidad que aporta el importance matrix. No se documenta ninguna innovación técnica adicional más allá del propio proceso de cuantización.

## Capacidades

- Generación de texto conversacional, heredada del checkpoint instructivo de Gemma 2.
- Ajuste fino orientado a instrucciones en urdu, según el nombre del modelo (no verificado en la model card).
- Soporte de conversación multi-turno mediante el formato chat del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags de Hugging Face).
- Inferencia en CPU y GPU gracias al formato GGUF.
- Capacidades de razonamiento y código: no documentadas específicamente para este ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Asistencia conversacional en urdu en entornos con hardware limitado: el modelo, cuantizado a Q4_K_M (1,7 GB), puede ejecutarse en un portátil con 8 GB de RAM y gestionar diálogos multi-turno, lo que lo hace adecuado para prototipos de chatbots en urdu sin infraestructura GPU.
- Despliegue en dispositivos edge o embebidos: las cuantizaciones Q2_K (1,3 GB) y Q3_K_S (1,4 GB) permiten ejecutar el modelo en Raspberry Pi 5 o mini-PC con 4-8 GB de RAM, útil para asistentes locales sin conexión.
- Traducción y generación de contenido en urdu: si el ajuste fino cumple lo que su nombre indica, puede emplearse para redactar textos, resumir documentos o traducir entre inglés y urdu en pipelines de procesamiento por lotes.
- Fine-tuning adicional o experiments académicos: al ser un modelo de 2,5 mil millones de parámetros, es viable reentrenarlo o ajustarlo con LoRA en una única GPU consumer (RTX 4090 con 24 GB), sirviendo como base para investigación en PLN de lenguas de bajos recursos.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 12 variantes GGUF permite medir el impacto de la cuantización en la perplejidad y la calidad de las respuestas en urdu, un caso de estudio útil para quienes investigan compresión de modelos.
- Servicio de inferencia ligero con llama.cpp u Ollama: al estar en GGUF, se integra directamente en servidores ligeros para ofrecer una API compatible con OpenAI en entornos con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~1,3 GB de pesos, ~2-3 GB de VRAM/RAM en total.
  - Q4_K_M: ~1,7 GB de pesos, ~3-4 GB en total.
  - Q8_0: ~2,8 GB de pesos, ~4-5 GB en total.
  - f16: ~5,1 GB de pesos, ~6-7 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Cabe en GPU consumer: sí, en todas las cuantizaciones hasta Q8_0; f16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. También puede usarse con transformers si se convierte o se carga el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 2,5B, se espera una velocidad de decodificación alta en GPU consumer (del orden de decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-urdu-gemma2-Instruct-Finetune-urdu-clean (este) | 2,5B | no disponible | no disponible | GGUF | Ajuste en urdu, cuantizaciones de mradermacher |
| Gemma 2 2B Instruct (Google) | 2,6B | 8K (según documentación de Gemma 2) | Gemma Terms of Use | safetensors, GGUF | Modelo base original, multilingüe, con benchmarks publicados |
| Qwen2.5 1.5B Instruct | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa multilingüe con licencia permisiva |
| Llama 3.2 1B Instruct | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeño con contexto largo y buen soporte multilingüe |

La comparación con Gemma 2 2B Instruct es la más directa, ya que este modelo deriva de él. Las alternativas Qwen2.5 y Llama 3.2 ofrecen licencias más claras y contextos más amplios, aunque no están específicamente ajustadas a urdu. No se dispone de benchmarks del ajuste fino para comparar calidad.

## Limitaciones y advertencias

- La model card solo declara el idioma inglés en los metadatos, lo que contradice el nombre del modelo (urdu). No hay verificación oficial de que el ajuste fino funcione realmente en urdu.
- No se documenta la licencia del modelo ni del ajuste fino, lo que impide confirmar si el uso comercial está permitido. El modelo base Gemma 2 tiene sus propios términos de uso que podrían aplicar.
- No hay información sobre el dataset de entrenamiento, hiperparámetros ni proceso de alineación, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación inherente a los modelos de 2,5B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- No se han generado cuantizaciones imatrix, por lo que las versiones IQ disponibles pueden tener peor calidad que las equivalentes ponderadas.
- El modelo tiene pocas descargas (103) y likes (1), lo que sugiere poca validación por parte de la comunidad.
- La longitud de contexto no está documentada; si hereda la de Gemma 2 2B, sería de 8K tokens, insuficiente para documentos largos.
- El tamaño del repo (23,4 GB) incluye todas las cuantizaciones; descargar solo la variante deseada es importante para no saturar el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean-GGUF
- Modelo base: https://huggingface.co/Xhaheen/gemma-urdu-gemma2-Instruct-Finetune-urdu-clean
- Página de descargas de mradermacher: https://hf.tst.eu/model#gemma-urdu-gemma2-Instruct-Finetune-urdu-clean-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
