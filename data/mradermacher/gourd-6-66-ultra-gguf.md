# mradermacher/gourd-6.66-ultra-GGUF

## Resumen

Gourd-6.66-ultra es un modelo de lenguaje conversacional afinado mediante LoRA sobre una base Qwen3, desarrollado por ProCreations y publicado originalmente en Hugging Face. La versión que nos ocupa es la cuantización GGUF realizada por mradermacher, un conocido cuantizador de la comunidad que distribuye pesos optimizados para inferencia local con llama.cpp y herramientas compatibles. El modelo está orientado a roleplay y personajes con temática de Halloween, como indican sus etiquetas (`halloween`, `persona`, `lora`).

Con 8.190.735.360 parámetros totales (aproximadamente 8,2 mil millones), se sitúa en la categoría de modelos de tamaño medio, lo que permite ejecución en GPUs de consumo con cuantizaciones agresivas. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo hereda las limitaciones de su base y de su ajuste específico de personaje.

Su relevancia actual radica en la disponibilidad de cuantizaciones estáticas en múltiples niveles (desde Q2_K hasta f16), lo que permite desplegarlo desde entornos con poca VRAM hasta configuraciones de mayor calidad. No obstante, se trata de un modelo de nicho, sin benchmarks publicados ni documentación técnica detallada más allá de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, ajuste LoRA) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only correspondiente a la familia Qwen3, sobre el que se ha aplicado un ajuste LoRA para especializarlo en un personaje con temática de Halloween. El modelo base declarado es `ProCreations/gourd-6.66-ultra`, y la versión aquí descrita es una conversión estática a GGUF realizada por mradermacher, sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador no incluye detalles sobre el proceso de ajuste fino más allá de las etiquetas que identifican el modelo como un LoRA de persona sobre Qwen3. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a mantener personajes consistentes.
- Roleplay y simulación de personajes con temática de Halloween (etiquetas `halloween`, `persona`).
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Roleplay y entretenimiento conversacional: el modelo está específicamente ajustado para interpretar personajes con temática de Halloween, por lo que encaja en aplicaciones de chat narrativo, juegos de rol por texto o experiencias interactivas de ficción.
- Chatbots de personaje en local: gracias a las cuantizaciones Q4_K_M (5,1 GB) y Q5_K_M (6,0 GB), puede desplegarse en estaciones de trabajo con GPU de consumo para prototipos de asistentes con personalidad definida.
- Generación de narrativa temática: útil para crear relatos de terror, descripciones atmosféricas o diálogos de personajes en contextos de ficción, aprovechando el ajuste LoRA sobre la base Qwen3.
- Pruebas de integración con llama.cpp y Ollama: al estar en formato GGUF, sirve como banco de pruebas para pipelines de inferencia local y comparación de cuantizaciones.
- Investigación sobre ajuste LoRA en modelos de 8B: permite estudiar cómo un LoRA de persona modifica el comportamiento de Qwen3 en tareas conversacionales, comparando con el modelo base.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (3,4 GB) permite ejecución en GPUs con 4-6 GB de VRAM, adecuada para demos o entornos educativos.
- Experimentación con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia que consumen modelos GGUF, útil para pruebas de API conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,4 GB de pesos, ~4-5 GB de VRAM con overhead.
  - Q4_K_M: ~5,1 GB de pesos, ~6-7 GB de VRAM.
  - Q8_0: ~8,8 GB de pesos, ~10-11 GB de VRAM.
  - f16: ~16,5 GB de pesos, ~18-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M; RTX 4090 o A100 para f16; GPUs con 4-6 GB (GTX 1650, RTX 3050) solo para Q2_K/Q3_K_S.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gourd-6.66-ultra-GGUF | 8,2B | no disponible | Apache 2.0 | GGUF | Ajuste LoRA de persona sobre Qwen3 |
| Qwen3-8B (base) | ~8B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista; el presente modelo deriva de él |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto documentado |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

La comparación con Qwen3-8B es la más directa, ya que gourd-6.66-ultra es un ajuste LoRA sobre dicha base. Frente a Llama 3.1 8B y Mistral 7B, el modelo aquí descrito carece de documentación sobre contexto y benchmarks, lo que limita una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un ajuste de persona sobre Qwen3, puede heredar sesgos del modelo base y del dataset de ajuste.
- Riesgo de alucinación: presente como en cualquier modelo de 8B; el ajuste de personaje puede incrementar la generación de contenido ficticio no verificado.
- Limitaciones de contexto o idioma: solo se declara inglés; la longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ajuste LoRA deben verificarse por separado para confirmar compatibilidad.
- Caveats para producción: ausencia de benchmarks, de documentación sobre entrenamiento y de garantías de calidad; no recomendado para tareas críticas sin evaluación previa.
- Cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede afectar la calidad relativa frente a otras distribuciones GGUF.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/gourd-6.66-ultra-GGUF
- Modelo base: https://huggingface.co/ProCreations/gourd-6.66-ultra
- Página de descargas del cuantizador: https://hf.tst.eu/model#gourd-6.66-ultra-GGUF
- Repositorio de peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
