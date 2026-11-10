# mradermacher/spellspeak-sigil-4b-GGUF

## Resumen

spellspeak-sigil-4b es un modelo de lenguaje conversacional publicado por el usuario jptaylor en Hugging Face y cuantizado en formato GGUF por mradermacher. El repositorio analizado (`mradermacher/spellspeak-sigil-4b-GGUF`) contiene exclusivamente las versiones cuantizadas del modelo original, generadas con la herramienta de cuantización estática del autor de la conversión. El nombre comercial sugiere un tamaño de 4B, aunque los pesos en safetensors declaran 7.463.013.674 parámetros totales, una discrepancia que conviene tener en cuenta al planificar el despliegue.

La relevancia de esta ficha es limitada: se trata de una conversión GGUF de un modelo del que no se ha publicado información técnica sustantiva (arquitectura, datos de entrenamiento, benchmarks ni licencia). El repositorio acumula cero descargas y cero likes en el momento de la consulta, lo que indica una adopción prácticamente nula. Se ofrece la ficha completa con los datos disponibles y se marcan explícitamente como "no disponible" todos los campos que la información proporcionada no cubre.

El único dato técnico verificable es el conjunto de cuantizaciones incluidas (desde Q2_K hasta F16, pasando por Q3_K_S/L/M, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0 e IQ4_XS) y un tamaño de repositorio de 64,0 GB, coherente con un modelo de ~7,5B parámetros almacenado en múltiples precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.013.674 (según safetensors del repo GGUF; el nombre indica 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el repo original |
| Tamano del repositorio | 64,0 GB |
| Pipeline declarado | no disponible |
| Etiquetas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base (`jptaylor/spellspeak-sigil-4b`): no se especifica si es un transformer denso, un MoE, un modelo híbrido con atención lineal o cualquier otra variante. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

Lo único documentado en la model card del repositorio GGUF son los metadatos de la conversión: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y `skip_mmproj: 1`. Este último campo sugiere que el modelo original podría incluir un proyector multimodal (mmproj), aunque no se incluye en esta conversión, por lo que las capacidades de visión, si existieran en el modelo base, no estarían disponibles en estos GGUF.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` es la única capacidad declarada explícitamente.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato GGUF es apto para su despliegue en infraestructuras de inferencia compatibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible; el flag `skip_mmproj` sugiere que el modelo base podría tener un componente multimodal no incluido en esta conversión.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, útil para prototipos de chat sin conexión.
- Experimentación con cuantizaciones extremas: la disponibilidad de Q2_K e IQ4_XS permite evaluar la degradación de calidad en entornos con memoria muy limitada, aunque con la cautela de que no hay benchmarks publicados que cuantifiquen esa pérdida.
- Integración en pipelines de inferencia compatibles con GGUF: la etiqueta `endpoints_compatible` facilita su uso en servidores de inferencia que acepten este formato, como punto de partida para pruebas de integración.
- Chat conversacional de bajo coste: al ser un modelo de ~7,5B parámetros (según safetensors), puede servir como baseline en comparativas internas de modelos pequeños para tareas de diálogo.
- Investigación sobre conversión y cuantización: el repositorio documenta los metadatos de la conversión (`quantize_version`, `convert_type`), lo que lo hace útil como ejemplo de referencia del proceso de cuantización estática de mradermacher.
- Evaluación comparativa de modelos comunitarios: sirve para contrastar el comportamiento de un modelo sin benchmarks publicados frente a alternativas consolidadas de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización y ~7,5B parámetros):
  - Q2_K / IQ4_XS: aproximadamente 3-4 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 4-5 GB.
  - Q4_K_S / Q4_K_M: aproximadamente 5-6 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 6-7 GB.
  - Q6_K: aproximadamente 7-8 GB.
  - Q8_0: aproximadamente 9-10 GB.
  - F16: aproximadamente 15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 solo si se necesita F16 o alto throughput.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q6_K en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier servidor compatible con GGUF (la etiqueta `endpoints_compatible` lo respalda). vLLM y TGI no se confirman para este formato concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| spellspeak-sigil-4b (GGUF) | 7,46B (según safetensors) | no disponible | no disponible | GGUF | no disponible |
| Alternativas de ~7B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad para producción.
- Discrepancia de tamaño: el nombre indica 4B pero los safetensors declaran 7,46B parámetros; conviene verificar los requisitos de memoria reales antes de desplegar.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor del modelo original antes de cualquier explotación comercial.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no hay evidencia sobre la fiabilidad de las respuestas.
- Sesgos: no disponible; al no conocerse el dataset de entrenamiento, no se pueden anticipar sesgos lingüísticos, culturales o de otro tipo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que reporte problemas o mejoras.
- Componente multimodal omitido: el flag `skip_mmproj: 1` indica que, si el modelo base tiene visión, esta no está incluida en los GGUF.
- Sin garantías de mantenimiento: el repositorio fue creado y actualizado el mismo día (2026-11-10), sin historial posterior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/spellspeak-sigil-4b-GGUF
- Modelo original: https://huggingface.co/jptaylor/spellspeak-sigil-4b
