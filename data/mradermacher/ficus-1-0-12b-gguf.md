# mradermacher/Ficus-1.0-12B-GGUF

## Resumen

Ficus-1.0-12B-GGUF es una recuantización estática en formato GGUF del modelo AuroraSystem/Ficus-1.0-12B, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El repositorio contiene únicamente los pesos cuantizados; no incluye información adicional sobre el modelo base, su entrenamiento o sus capacidades.

La información disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, fue creado el 18 de noviembre de 2026 y ocupa 0,3 GB. El dato de parámetros totales reportado en safetensors (52.379.904) es incompatible con el nombre del modelo (12B), lo que sugiere que la metadata del repo no refleja el tamaño real del modelo base o que el campo corresponde a otra magnitud. No se dispone de licencia, idiomas, pipeline ni model card propia más allá de la nota de generación de cuantizaciones.

La relevancia de esta ficha es, por tanto, acotada: sirve para identificar el artefacto GGUF y sus opciones de cuantización, pero cualquier evaluación técnica rigurosa debe remitirse al modelo base original publicado por AuroraSystem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: AuroraSystem/Ficus-1.0-12B; arquitectura no especificada en la informacion proporcionada) |
| Parametros totales | 12B segun el nombre del modelo; el campo safetensors del repo indica 52.379.904 (dato inconsistente, probablemente metadata erronea) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp; convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base AuroraSystem/Ficus-1.0-12B en los datos proporcionados. El nombre sugiere un transformer de aproximadamente 12.000 millones de parámetros, pero no se confirma ni el tipo de atención, ni si emplea mezcla de expertos, ni detalles de tokenizador o vocabulario (el campo `vocab_type` aparece vacío en la metadata de la model card).

Respecto al entrenamiento, no hay datos sobre número de tokens, composición del dataset, fases de alineación (RLHF, DPO, SFT) ni innovaciones técnicas. La model card del repositorio GGUF se limita a declarar que se trata de cuantizaciones estáticas del modelo base, generadas con la versión 2 del pipeline de cuantización y con tensores de salida cuantizados (`output_tensor_quantised: 1`). No se incluye el tensor `mmproj`, lo que sugiere que no hay componente multimodal en este artefacto, aunque no puede confirmarse la ausencia de visión en el modelo original.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje de 12B, pero no confirmada en la documentación disponible.
- Razonamiento, código, matemáticas: no disponible; no hay benchmarks ni descripciones que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La ausencia de `mmproj` en el repo GGUF apunta a que este artefacto no incluye proyección multimodal.

## Casos de uso

- Despliegue local con llama.cpp: el formato GGUF y la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada o con GPUs de gama media, usando `llama-server` o `llama-cli`.
- Integración en Ollama o LM Studio: los ficheros GGUF son compatibles con estos entornos, lo que facilita prototipado rápido de asistentes conversacionales en local.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 variantes (incluida IQ4_XS), el repo permite medir la degradación de calidad frente al coste de memoria en un mismo modelo, útil para investigación sobre cuantización.
- Pruebas de concepto offline y entornos air-gapped: al ser pesos descargables y ejecutables sin conexión, encaja en escenarios con requisitos de privacidad donde no se puede llamar a APIs externas.
- Generación de texto por lotes en CPU: las variantes Q4_K_M y Q5_K_M ofrecen un equilibrio razonable entre tamaño y fidelidad para tareas de resumen o clasificación en servidores sin acelerador.
- Fine-tuning posterior sobre el modelo base: si se necesita adaptar el modelo, conviene partir del repo original AuroraSystem/Ficus-1.0-12B en safetensors y usar las cuantizaciones GGUF solo para inferencia.

Advertencia: al no haber documentación sobre capacidades reales, estos casos son hipótesis de uso derivadas del formato y del tamaño, no de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 12B, estimaciones orientativas según cuantización):
  - Q2_K: ~4,5-5 GB
  - Q3_K_M: ~6-6,5 GB
  - Q4_K_M: ~7,5-8 GB
  - Q5_K_M: ~8,5-9 GB
  - Q6_K: ~10-10,5 GB
  - Q8_0: ~13 GB
  - F16: ~24 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 (24 GB) para Q8_0 o F16; A100/H100 para despliegues de alta concurrencia.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 8 GB o más para cuantizaciones Q2_K a Q4_K_S; 12-16 GB para Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa sin conversión previa.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas de la misma categoría con datos verificables (parámetros, contexto, licencia) en la información proporcionada.

## Limitaciones y advertencias

- Metadata inconsistente: el campo de parámetros totales en safetensors (52.379.904) no concuerda con el nombre del modelo (12B); conviene verificar el tamaño real antes de planificar recursos.
- Ausencia total de model card propia: no hay información sobre licencia, idiomas, contexto, sesgos ni alineación.
- Licencia desconocida: no se puede confirmar si el uso comercial está permitido; hay que consultar el repo original AuroraSystem/Ficus-1.0-12B.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas de fidelidad publicadas.
- Idiomas: no declarados; no se puede garantizar un rendimiento aceptable en castellano.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- Repositorio sin tracción (0 descargas, 0 likes) y sin actualizaciones desde su creación; no hay garantía de mantenimiento.
- Este artefacto es solo de inferencia; para entrenamiento o fine-tuning debe usarse el modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ficus-1.0-12B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Ficus-1.0-12B
