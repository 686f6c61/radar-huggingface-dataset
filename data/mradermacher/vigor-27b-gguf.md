# mradermacher/VIGOR-27B-GGUF

## Resumen

VIGOR-27B-GGUF es la versión cuantizada en formato GGUF del modelo VIGOR-27B, publicada por el usuario mradermacher a partir del repositorio original de prithivMLmods. Se trata de una conversión estática orientada a inferencia local con llama.cpp y herramientas compatibles, no de un modelo entrenado desde cero por el publicador de esta variante. El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos densos de gran tamaño ejecutables en hardware de consumo solo mediante cuantizaciones agresivas.

La relevancia de esta ficha es doble: por un lado, documenta una variante GGUF lista para desplegar en entornos sin GPU de datacenter; por otro, deja constancia explícita de la escasez de información pública sobre el modelo base (licencia, idiomas, contexto, datos de entrenamiento y benchmarks no están disponibles en la información proporcionada). El repositorio ocupa 28,2 GB e incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

Al tratarse de una conversión y no de un modelo original, las capacidades reales dependen enteramente del modelo VIGOR-27B subyacente, del que no se han publicado especificaciones verificables en la información disponible. Cualquier evaluación de producción debería validarse empíricamente antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base VIGOR-27B; no se especifica transformer, MoE ni híbrida) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 28,2 GB |
| Pipeline | no disponible |
| Tags | gguf, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base VIGOR-27B en los datos proporcionados. El recuento de parámetros (27,3 B) y la nomenclatura sugieren un transformer denso de gran tamaño, pero no se confirma ni el tipo de atención, ni la presencia de mezcla de expertos, ni innovaciones como decodificación especulativa o atención lineal. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste instructivo.

Lo único verificable es el proceso de conversión: la model card indica `convert_type: hf` (conversión desde pesos Hugging Face), `quantize_version: 2` y `output_tensor_quantised: 1`, lo que corresponde al flujo estándar de llama.cpp para generar cuantizaciones GGUF estáticas. No se ha incluido un tensor `mmproj`, lo que sugiere ausencia de componentes multimodales en esta conversión (o que se omitieron deliberadamente).

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan sus capacidades específicas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face/OpenAI, aunque no se especifica el stack exacto.
- Razonamiento, código, matemáticas y visión: no disponible; no hay evidencia en la información proporcionada de que el modelo soporte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 27,3 B en GPUs con 16-24 GB de VRAM, útil para prototipos y pruebas de concepto sin depender de la nube.
- Servicio de chat interno con llama.cpp u Ollama: al estar en formato GGUF, puede integrarse en un servidor de inferencia local para asistentes conversacionales de uso interno, siempre que se valide previamente la calidad del modelo base.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que facilita estudios de degradación de calidad frente a tamaño (por ejemplo, comparar Q2_K con Q8_0 en tareas de razonamiento).
- Experimentación académica con modelos de ~27 B: investigadores que necesiten un modelo de este orden de magnitud para estudios de alineación, sesgos o evaluación lingüística pueden desplegarlo en clústeres pequeños con GPUs tipo A100 40 GB o RTX 4090.
- Integración en pipelines de generación de texto por lotes: mediante llama.cpp o servidores compatibles con endpoints, puede procesar grandes volúmenes de texto en entornos con requisitos de privacidad (datos que no pueden salir de la infraestructura propia).
- Base para fine-tuning o destilación: los pesos en safetensors del modelo original permiten adaptaciones posteriores, aunque la licencia no disponible obliga a verificar los términos antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q2_K: ~10-11 GB
  - Q3_K_M: ~13-14 GB
  - Q4_K_M: ~16-17 GB
  - Q5_K_M: ~19-20 GB
  - Q6_K: ~22-23 GB
  - Q8_0: ~29 GB
  - F16: ~55 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y F16; RTX 3090 (24 GB) para cuantizaciones medias.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints (por ejemplo, llama-cpp-python o vLLM con soporte GGUF limitado). No se documenta soporte nativo en TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otros modelos densos de ~27 B en GGUF). La comparación requeriría verificar licencia, contexto y rendimiento del modelo VIGOR-27B original, datos que no constan en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (prithivMLmods/VIGOR-27B) antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en otros idiomas distintos del que se haya entrenado el modelo base.
- Contexto desconocido: sin longitud de contexto documentada, no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no se puede cuantificar su fiabilidad.
- Sesgos: no documentados; se recomienda auditoría previa en dominios sensibles.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Repositorio sin descargas ni likes: no hay evidencia de validación comunitaria; el modelo debe evaluarse empíricamente antes de adoptarlo.
- Al ser una conversión de terceros, no hay garantía de que los pesos GGUF reproduzcan fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VIGOR-27B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-27B
