# mradermacher/CherryPit-1.3-2B-GGUF

## Resumen

CherryPit-1.3-2B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo CherryPit-1.3-2B, publicada por el usuario mradermacher, conocido en Hugging Face por convertir sistemáticamente modelos pequeños y medianos a formatos optimizados para inferencia local. El modelo base, alojado en el repositorio DRUPEs/CherryPit-1.3-2B, cuenta con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos compactos aptos para hardware de consumo.

La relevancia de esta publicación radica en que permite ejecutar el modelo con llama.cpp y derivados (Ollama, LM Studio, koboldcpp) sin necesidad de GPU de gama alta, ofreciendo un abanico amplio de niveles de cuantización que van desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS. Esto facilita el ajuste entre calidad y huella de memoria según las restricciones de cada despliegue.

No se dispone de información pública sobre el desarrollador original del modelo base, la arquitectura interna, los datos de entrenamiento ni los idiomas soportados más allá de la etiqueta genérica de conversacional. La model card del repositorio de cuantizaciones es mínima y se limita a indicar que se trata de cuantizaciones estáticas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.516.756.480 (aprox. 2,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base CherryPit-1.3-2B en la documentación disponible. Por el tamaño (2,5 mil millones de parámetros) y la etiqueta "conversational", se trata presumiblemente de un transformer decoder-only ajustado para diálogo, pero no se confirma ni el tipo de atención, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta procede de los metadatos de la conversión a GGUF: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversión se realizó desde pesos en formato Hugging Face con la herramienta estándar de llama.cpp y que los tensores de salida fueron cuantizados. No se detalla el número de tokens de entrenamiento ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", por lo que se orienta a diálogo multi-turno.
- No se dispone de información verificada sobre razonamiento avanzado, matemáticas, código o capacidades multimodales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo de 2,5 B en GGUF, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, sirviendo como chatbot de escritorio con privacidad total al no requerir conexión externa.
- Prototipado rápido de interfaces de chat: gracias a las cuantizaciones Q4_K_M y Q5_K_M, que equilibran tamaño y calidad, es adecuado para validar flujos de conversación antes de migrar a modelos mayores.
- Despliegue en dispositivos con poca VRAM: las variantes Q2_K y Q3_K_S permiten inferencia en GPUs de 4 GB o incluso en CPU, útil para entornos embebidos o de laboratorio con hardware limitado.
- Experimentación educativa con cuantización: el repositorio ofrece doce niveles distintos, lo que permite comparar empíricamente el impacto de la cuantización en la perplejidad y la calidad de las respuestas.
- Filtrado o generación de texto en pipelines por lotes: al ser un modelo pequeño, puede procesar grandes volúmenes de texto en CPU con throughput aceptable para tareas de clasificación o resumen ligero.
- Base para fine-tuning posterior: el modelo original en safetensors puede servir como punto de partida para ajustes específicos de dominio antes de recuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para 2,5 B de parámetros):
  - F16: aproximadamente 5 GB.
  - Q8_0: aproximadamente 2,7 GB.
  - Q6_K: aproximadamente 2,1 GB.
  - Q5_K_M: aproximadamente 1,8 GB.
  - Q4_K_M: aproximadamente 1,5 GB.
  - Q3_K_M: aproximadamente 1,2 GB.
  - Q2_K: aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) para las cuantizaciones Q4 y superiores; las variantes Q2 y Q3 caben en GPUs de 2-4 GB o en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas de consumo, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.3-2B-GGUF | 2,5 B | no disponible | no disponible | GGUF | Conversacional, cuantizaciones estáticas |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 | Apache 2.0 | safetensors, GGUF | Modelo pequeño ampliamente adoptado |
| Llama-3.2-1B-Instruct | 1,2 B | 128 000 | Llama 3.2 Community | safetensors, GGUF | Contexto largo, licencia restrictiva |
| Gemma-2-2B-it | 2,6 B | 8 192 | Gemma Terms | safetensors, GGUF | Tamaño comparable, licencia con condiciones |

La comparación se limita a parámetros, contexto, licencia y formato porque no hay benchmarks publicados de CherryPit-1.3-2B que permitan contrastar rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto e idioma: desconocidas; la ausencia de metadatos impide confirmar la ventana de contexto o los idiomas entrenados.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base (DRUPEs) antes de cualquier despliegue en producción.
- El repositorio de cuantizaciones no incluye model card detallada ni resultados de evaluación, lo que dificulta la validación de calidad.
- El tamaño del repositorio (22,8 GB) se debe a la inclusión de todas las variantes de cuantización; conviene descargar solo el archivo GGUF necesario.
- Al ser una cuantización estática, la calidad puede degradarse notablemente en Q2_K y Q3_K_S respecto al modelo original en F16.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/CherryPit-1.3-2B-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.3-2B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
