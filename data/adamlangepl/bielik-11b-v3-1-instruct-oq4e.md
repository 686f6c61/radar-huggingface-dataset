# AdamLangePL/Bielik-11B-v3.1-Instruct-oQ4e

## Resumen

Bielik-11B-v3.1-Instruct-oQ4e es una versión cuantizada del modelo instructivo Bielik-11B-v3.1-Instruct, publicada por el usuario AdamLangePL en Hugging Face. El modelo base pertenece a la familia Bielik, desarrollada por el laboratorio polaco SpeakLeash, orientada al idioma polaco y con arquitectura transformer de tipo Llama. Esta variante concreta no es un modelo nuevo, sino un checkpoint cuantizado con la herramienta oQ (oMLX v0.7.3) en formato MLX, pensado para ejecución en hardware Apple Silicon.

El checkpoint pesa 6,7 GB y contiene 11.168.796.672 parámetros lógicos. La cuantización es de precisión mixta: la mayoría de los pesos (75,9 %) están en 4 bits afín con grupo de 64, un 20,7 % en 5 bits, un 2,3 % en 6 bits y un 1,2 % en 8 bits, con una media efectiva de 4,800 bits por peso. Esta distribución busca preservar la calidad en las capas más sensibles mientras reduce el tamaño total del modelo.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas alternativas cuantizadas en MLX para un modelo de 11B orientado al polaco; por otro, advierte de que la información pública es muy escasa. No se dispone de model card del modelo base en la información proporcionada, ni de licencia, idiomas declarados, benchmarks o detalles de entrenamiento, por lo que muchos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de Bielik-11B-v3.1-Instruct; detalles del base no disponibles) |
| Parámetros totales | 11.168.796.672 (11,169B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16 residual; media efectiva 4,800 bits/peso |
| Idiomas soportados | No disponible (el modelo base Bielik está orientado al polaco, pero no se confirma en la información proporcionada) |
| Licencia | No disponible |
| Formato de pesos | MLX (safetensors; librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es la del modelo base Bielik-11B-v3.1-Instruct, un transformer decoder-only de tipo Llama con 11.169B parámetros. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, número de cabezas de atención, vocabulario ni longitud de contexto nativa. Tampoco se documentan los datos de entrenamiento del modelo base: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación.

La innovación técnica de esta publicación es la cuantización mixta con oQ (oMLX v0.7.3). El algoritmo asigna distintos anchos de bit por tensor según su sensibilidad, manteniendo la mayor parte del modelo en 4 bits (8.472B parámetros, 4,438 GiB) y elevando a 5 bits (2.307B), 6 bits (0.257B) y 8 bits (0.132B) los bloques críticos. El resultado es un checkpoint de 6,241 GiB de pesos lógicos (6,702 GB de repositorio) con una media de 4,800 bits/peso, lo que reduce el tamaño frente a un BF16 (aproximadamente 22 GB) a costa de una pérdida de precisión no cuantificada públicamente.

## Capacidades

- Generación de texto instructivo: el sufijo "Instruct" del modelo base indica ajuste para seguir instrucciones en formato conversacional, aunque no se detalla el formato de prompt exacto.
- Razonamiento y conocimiento general: al ser un modelo de 11B, se espera capacidad para tareas de comprensión lectora, resumen y respuesta a preguntas, sin benchmarks publicados que lo confirmen.
- Generación de código: capacidad probable por herencia del modelo base, no verificada en la información disponible.
- Capacidades multilingües: el modelo base Bielik está especializado en polaco; el soporte de otros idiomas no está declarado en esta ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible; el checkpoint solo contiene el modelo de lenguaje (11.169B parámetros, sin torre multimodal).

## Casos de uso

- Procesamiento de texto en polaco en local sobre Mac: el checkpoint en MLX permite ejecutar un modelo de 11B en un Apple Silicon con 16 GB de RAM unificada, útil para traducción, resumen y redacción de documentos en polaco sin enviar datos a la nube.
- Asistente de escritura offline: al ocupar 6,7 GB, puede integrarse en aplicaciones de escritorio para Mac que necesiten generación de texto privada, con la salvedad de que la licencia no está confirmada para uso comercial.
- Prototipado de pipelines de instrucciones: investigadores que quieran evaluar el comportamiento del modelo base Bielik en formato cuantizado antes de desplegar la versión completa en BF16.
- Experimentación con cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de la distribución 4/5/6/8 bits de oQ en la calidad de salida frente al modelo original.
- Generación de código en entornos Apple: si el modelo base conserva capacidades de código, puede usarse en editores locales con integración MLX, aunque no hay evidencia publicada de su rendimiento en HumanEval o similares.
- Fine-tuning ligero o adaptación con LoRA: el formato safetensors y la disponibilidad de pesos cuantizados permiten experimentar con adaptadores sobre MLX, siempre que la licencia del base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: al menos 8 GB libres para cargar los 6,7 GB de pesos más overhead de contexto y activaciones; se recomienda 16 GB o más para contextos largos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no es directamente compatible con CUDA sin conversión.
- ¿Cabe en GPU consumer? Sí, en equipos Apple con 16 GB de memoria unificada o superior; en GPUs NVIDIA consumer requeriría convertir el checkpoint a otro formato (GGUF, AWQ, etc.), no incluido en el repositorio.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX son las vías naturales; para otros backends sería necesaria una conversión previa.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct-oQ4e | 11,169B | No disponible | MLX cuantizado 4,8 bits/peso | No disponible | Hugging Face (AdamLangePL) |
| Bielik-11B-v3.1-Instruct (base) | 11,169B | No disponible | Safetensors BF16 | No disponible | Repositorio de SpeakLeash (no verificado en esta búsqueda) |
| Llama 3.1 8B Instruct | 8,03B | 128K | Safetensors, GGUF, MLX | Llama 3.1 Community License | Amplia, múltiples backends |
| Mistral 7B Instruct v0.3 | 7,24B | 32K | Safetensors, GGUF | Apache 2.0 | Amplia |

La comparativa con Llama 3.1 8B y Mistral 7B es orientativa: no se dispone de datos de rendimiento del checkpoint Bielik cuantizado que permitan una comparación cuantitativa. La principal diferencia es el enfoque en polaco del modelo Bielik y su disponibilidad exclusiva en formato MLX en esta variante.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo crítico para producción.
- Idiomas no declarados en esta ficha: aunque el modelo base Bielik está orientado al polaco, no hay confirmación oficial en la información proporcionada.
- Sin benchmarks: no hay evidencia publicada de la degradación de calidad introducida por la cuantización mixta de 4,800 bits/peso frente al BF16.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 11B; sin datos de alineación del base no se puede estimar su magnitud.
- Sesgos: no documentados; el corpus de entrenamiento del modelo base no está descrito en la información disponible.
- Compatibilidad limitada: el formato MLX restringe el despliegue a hardware Apple Silicon o a conversiones manuales no oficiales.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso que confirmen el correcto funcionamiento del checkpoint.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana nativa del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AdamLangePL/Bielik-11B-v3.1-Instruct-oQ4e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Bielik-11B-v3.1-Instruct: no disponible en la información proporcionada
- Paper o blog de Bielik / SpeakLeash: no disponible en la información proporcionada
