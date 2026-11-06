# oxpuppy635/gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4-GGUF

## Resumen

`gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4-GGUF` es una cuantización en formato NVFP4 (GGUF) del modelo `MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy`, un fine-tuning comunitario de la familia Gemma 4 de Google con arquitectura Mixture-of-Experts (MoE). El modelo cuenta con 25.233.138.206 parámetros totales (aproximadamente 25,2 mil millones) y, por el sufijo "A4B" del nombre, se infiere una arquitectura con aproximadamente 4 mil millones de parámetros activos por token, aunque este dato no está confirmado en la información disponible.

El repositorio lo publica el usuario `oxpuppy635` y su único propósito es distribuir los pesos convertidos mediante el tipo nativo `GGML_TYPE_NVFP4` de `llama.cpp`, lo que permite ejecutar el modelo en hardware compatible con el formato de cuantización FP4 de NVIDIA. No se trata de un modelo entrenado desde cero ni de una nueva versión del modelo base, sino de un artefacto de despliegue.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización de precisión ultra-baja (4 bits en formato NVFP4) sobre un MoE de 25B; por otro, advierte de que el modelo base es un fine-tuning comunitario sin model card técnica detallada, con licencia "other" y un nombre que sugiere modificaciones no oficiales respecto a Gemma. Cualquier uso en producción debe partir de la verificación de la licencia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Gemma 4 (detalles no disponibles) |
| Parametros totales | 25.233.138.206 (25,2 B) |
| Parametros activos | Aproximadamente 4 B (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (GGML_TYPE_NVFP4); no se ofrecen otros niveles en el repo |
| Idiomas soportados | Inglés (según tag `language: en`); multilingüe no confirmado |
| Licencia | Other (hereda la del modelo base; condiciones no especificadas) |
| Formato de pesos | GGUF (un único fichero NVFP4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Gemma 4, según indican el nombre del modelo y el tag `gemma`. El sufijo "A4B" es coherente con la convención de Google para modelos MoE que activan aproximadamente 4 mil millones de parámetros por token, aunque la información proporcionada no incluye la configuración de expertos (número de expertos, top-k de enrutamiento, dimensión de las capas) ni la longitud de contexto nativa.

No se dispone de información sobre el proceso de entrenamiento del modelo base `MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy`: no se documentan el número de tokens, la composición del dataset, ni si hubo etapas de SFT, RLHF o DPO. El sufijo "SOMPOA-heresy" sugiere un fine-tuning comunitario con posible desalineamiento respecto al modelo instruct original, pero su significado exacto no está especificado. La única innovación técnica documentada en este repositorio es la conversión a NVFP4 mediante el layout nativo de `llama.cpp`, que empaqueta pesos en bloques de 4 bits con escalas compartidas para reducir el tamaño del fichero a 15,3 GB.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational` y el sufijo `-it` (instruct) del modelo base.
- Razonamiento y respuesta a instrucciones, heredados del modelo Gemma 4 instruct original (capacidad no verificada en este fine-tuning).
- Ejecución local mediante `llama.cpp` en CLI (`llama-cli`) y servidor (`llama-server`), con soporte de descarga completa en GPU (`-ngl 99`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite exponerlo como API compatible con OpenAI a través de `llama-server`.
- Capacidades multilingües: no confirmadas; el único idioma declarado es inglés.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU NVIDIA Blackwell: el formato NVFP4 está diseñado para aprovechar los tensor cores FP4 de esta generación, lo que permite servir un MoE de 25B en un único acelerador con un fichero de 15,3 GB y ~4B de parámetros activos por token.
- Prototipado de asistentes conversacionales en inglés: el modelo puede arrancarse con `llama-server` y consumirse desde cualquier cliente compatible con la API de OpenAI, útil para validar flujos de chat antes de pasar a un modelo con licencia clara.
- Experimentación académica con cuantización FP4: sirve como caso de estudio para medir la degradación de calidad de un MoE al pasar a 4 bits, comparando sus salidas con las del modelo base sin cuantizar.
- Evaluación de fine-tunings comunitarios de Gemma: permite a investigadores reproducir y auditar el comportamiento del modelo `SOMPOA-heresy` sin necesidad de infraestructura de gran memoria, gracias a la reducción de huella del NVFP4.
- Inferencia en entornos con restricciones de memoria: al ocupar 15,3 GB en disco frente a los ~50 GB que requeriría el modelo en BF16, encaja en GPUs de 24 GB o 32 GB para pruebas puntuales, siempre que el backend soporte NVFP4.
- Servicio de generación de texto de baja concurrencia: con ~4B de parámetros activos, el coste por token es inferior al de un modelo denso de 25B, adecuado para aplicaciones internas con pocos usuarios simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 15,3 GB; se recomienda al menos 18-20 GB de VRAM para acomodar el modelo, la caché KV y los buffers de `llama.cpp` con contexto moderado.
- GPU recomendadas: tarjetas NVIDIA con soporte nativo de FP4 (arquitectura Blackwell, p. ej. RTX 50xx o B200) para aprovechar el formato NVFP4; en GPUs Ampere o Ada la decodificación del tipo NVFP4 puede requerir emulación y perder la ventaja de rendimiento.
- ¿Cabe en GPU de consumo? Sí, en principio en cualquier GPU con ≥24 GB (RTX 3090, RTX 4090, RTX 5090), sujeto a que la build de `llama.cpp` soporte `GGML_TYPE_NVFP4` en esa arquitectura.
- Opciones de despliegue: `llama.cpp` (CLI y servidor) exclusivamente, según la model card; no se mencionan vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4-GGUF | 25,2 B | ~4 B (inferido) | No disponible | GGUF NVFP4 | Other |
| MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy (base) | 25,2 B | ~4 B (inferido) | No disponible | Safetensors (presumible) | Other |
| Gemma 4 26B A4B it (oficial de Google) | 25,2 B (presumible) | ~4 B | No disponible | Safetensors, GGUF | Términos de Gemma |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para confrontarlo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El modelo base es un fine-tuning comunitario con nombre no oficial ("SOMPOA-heresy"); no hay garantía de que mantenga las salvaguardas del Gemma instruct original, por lo que puede producir contenido no alineado.
- Licencia "other": las condiciones de uso comercial no están especificadas en la información disponible y deben verificarse en el repositorio del modelo base y en los términos de la licencia Gemma de Google.
- Cuantización NVFP4: la precisión de 4 bits puede degradar el razonamiento, la coherencia en contextos largos y el seguimiento de instrucciones complejas respecto al modelo en BF16; no se han publicado evaluaciones de esta degradación.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- Soporte de backend restringido: requiere una build de `llama.cpp` con `GGML_TYPE_NVFP4`; otras herramientas (vLLM, TGI, Ollama) no están documentadas y podrían no cargar el fichero.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no es posible cuantificarlo.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-SOMPOA-heresy-NVFP4-GGUF
- Modelo base: https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy
- `llama.cpp` (backend requerido): https://github.com/ggml-org/llama.cpp
