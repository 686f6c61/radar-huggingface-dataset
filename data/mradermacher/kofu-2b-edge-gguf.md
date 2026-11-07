# mradermacher/kofu-2b-edge-GGUF

## Resumen

kofu-2b-edge es un modelo de generacion de texto de 2.000 millones de parametros derivado de la familia Gemma, publicado por el usuario shebxyd en Hugging Face y orientado explicitamente a inferencia en dispositivo (on-device), con mencion expresa a Android en sus metadatos. La version aqui descrita es la cuantizacion estatica en formato GGUF realizada por mradermacher, un colaborador habitual de la comunidad que genera y publica cuantizaciones de modelos abiertos para su uso con llama.cpp y ecosistemas compatibles.

El modelo se presenta como una variante "edge" de 2B, lo que lo situa en la franja de modelos pequenos pensados para ejecutarse en hardware con recursos limitados: moviles, mini-PC, Raspberry Pi o portatiles sin GPU dedicada. La informacion publica disponible es muy escasa: la model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estaticas del modelo original, sin detallar arquitectura, datos de entrenamiento, benchmarks ni condiciones de licencia mas alla de la etiqueta "gemma" heredada del modelo base.

Es relevante ahora porque el ecosistema de modelos pequenos con licencia permisiva y pesos en GGUF esta creciendo como alternativa para despliegues locales y aplicaciones moviles que requieren privacidad de datos y funcionamiento sin conexion. No obstante, la ausencia de documentacion tecnica publica limita seriamente su evaluacion rigurosa antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Gemma segun etiquetas del modelo base) |
| Parametros totales | 2B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | espanol e ingles (segun etiquetas del modelo base) |
| Licencia | no disponible en el repositorio GGUF; el modelo base declara licencia "gemma" |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas del modelo original apuntan a la familia Gemma de Google, lo que sugiere una arquitectura transformer decoder-only, pero este dato no se confirma en la documentacion del repositorio GGUF ni en la del modelo base mas alla de la etiqueta.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el repositorio GGUF indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que las cuantizaciones se generaron a partir de los pesos en formato Hugging Face del modelo original y que se aplico cuantizacion de tensores de salida. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del modelo base.
- Soporte de los idiomas espanol e ingles, segun las etiquetas del modelo original.
- Inferencia en dispositivo (on-device), con mencion explicita a Android en los metadatos.
- Compatibilidad con llama.cpp y text-generation-inference, segun las etiquetas del modelo base.
- Tool calling / function calling: no disponible en la informacion publica.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion publica.
- Vision, audio o modo thinking: no disponible en la informacion publica.

## Casos de uso

- Asistentes conversacionales en aplicaciones Android: el modelo esta etiquetado como on-device y android, por lo que puede integrarse mediante llama.cpp o LiteRT en apps moviles para generar respuestas sin enviar datos a la nube, preservando la privacidad del usuario.
- Chat local en portatiles sin GPU: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en CPU con llama.cpp u Ollama, adecuado para prototipos y herramientas de escritorio que requieren funcionamiento offline.
- Generacion de texto en espanol en entornos con conectividad limitada: al declarar soporte de espanol, puede emplearse en kioscos, terminales de campo o dispositivos IoT con capacidad de computo moderada.
- Clasificacion y resumen de texto breve: con 2B parametros y cuantizacion Q8_0 o F16, puede utilizarse para tareas de procesamiento de lenguaje natural ligeras en pipelines por lotes sobre CPU.
- Educacion y experimentacion: su tamano reducido lo hace util para aprender a desplegar modelos con llama.cpp, comparar tecnicas de cuantizacion (Q2_K frente a Q4_K_M frente a Q8_0) y medir el impacto en calidad y velocidad.
- Filtrado y preprocesado en pipelines de datos: puede actuar como modelo auxiliar para etiquetado o limpieza de corpus antes de pasarlos a un modelo mayor, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en Q4_K_M, 1,5 GB en Q5_K_M, 2,2 GB en Q8_0 y 4,1 GB en F16 (estimaciones basadas en 2B parametros; no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones habituales; una RTX 3060 o superior ofrece margen amplio.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer reciente con 4-8 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun etiquetas del modelo base) y LiteRT para Android.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kofu-2b-edge (GGUF) | 2B | no disponible | no disponible (base: gemma) | GGUF, safetensors | Hugging Face |
| Gemma 2B | 2B | 8.192 tokens (segun documentacion publica de Google) | Gemma | safetensors, GGUF | Hugging Face, Kaggle |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens (segun documentacion publica de Alibaba) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de informacion suficiente sobre kofu-2b-edge para comparar rendimiento ni contexto.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card tecnica, benchmarks ni descripcion del entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no confirmada en el repositorio GGUF; el modelo base declara licencia "gemma", cuyos terminos de uso comercial deben revisarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no cuantificado por el autor; en modelos de 2B parametros suele ser elevado en tareas de conocimiento factual.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Idiomas: solo se declaran espanol e ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de sesgos: no evaluado por el autor; los modelos pequenos entrenados con corpus web pueden reproducir estereotipos.
- Sin senales de adopcion (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de la comunidad sobre su comportamiento real.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kofu-2b-edge-GGUF
- Modelo original: https://huggingface.co/shebxyd/kofu-2b-edge
- Repositorio de referencia del autor de cuantizaciones: https://huggingface.co/mradermacher/continual-ai-2b-GGUF
