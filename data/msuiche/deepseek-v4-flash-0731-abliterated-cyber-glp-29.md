# msuiche/DeepSeek-V4-Flash-0731-abliterated-cyber-GLP-29

## Resumen

DeepSeek-V4-Flash-0731-abliterated-cyber-GLP-29 es una variante modificada del modelo base DeepSeek-V4-Flash-0731, desarrollada por el usuario msuiche. Su objetivo es eliminar el comportamiento de rechazo (refusal) del modelo original mediante una técnica de abliteración basada en control de vectores (control vector) y representación engineering. En lugar de un reentrenamiento completo, se aplica un vector de control que suprime el "capability gating" (bloqueo de capacidades) del modelo, permitiendo que responda a peticiones que el modelo base rechazaría, aunque mantiene el "target-authorization gating" (autorización de objetivos), es decir, no elimina la autorización para acciones específicas.

El modelo base DeepSeek-V4-Flash-0731 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con 304 mil millones de parámetros, diseñado para generación de texto, codificación, razonamiento, contexto largo y flujos de trabajo agénticos. Esta variante se distribuye en formato GGUF y tiene acceso restringido (gated) en HuggingFace. Es relevante para investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin restricciones de rechazo, así como para aplicaciones que requieren respuestas sin censura temática.

El repositorio presenta un tamaño de 0.0 GB y reporta 118.784 parámetros en safetensors, lo que sugiere que no contiene los pesos completos del modelo, sino probablemente el control vector o metadatos de configuración. La variante se apoya en el control vector "cyber-abliterated" publicado por el mismo autor, que se aplica sobre el modelo base mediante herramientas como vLLM (con overlay DSpark) o llama.cpp (con un fork específico).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, basado en DeepSeek-V4-Flash-0731 |
| Parametros totales | 304B (modelo base); el repo reporta 118.784 en safetensors, probablemente correspondiente al control vector, no a los pesos del modelo |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero sin cifra exacta en la información proporcionada) |
| Tipos de cuantizacion | GGUF (según etiquetas), sin detalle de niveles (Q4, Q5, etc.) |
| Idiomas soportados | en (inglés) según HuggingFace; el modelo base probablemente soporta más idiomas, pero no se confirma en esta variante |
| Licencia | deepseek (licencia de DeepSeek, con restricciones; consultar términos) |
| Formato de pesos | GGUF (según etiquetas); safetensors reportado con 118.784 parámetros, posiblemente del control vector |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de tipo MoE disperso con 304 mil millones de parámetros, optimizado para generación de texto, codificación, razonamiento, contexto largo y flujos de trabajo agénticos. No se dispone de detalles sobre el número de parámetros activos por token ni sobre la composición del dataset de entrenamiento en la información proporcionada.

La variante "abliterated-cyber-GLP-29" no se entrena desde cero, sino que aplica una técnica de abliteración mediante control de vectores (activation steering). Según el repositorio del control vector asociado (msuiche/DeepSeek-V4-Flash-0731-cyber-abliterated-cvec), este vector elimina el "capability gating" (bloqueo de capacidades) del modelo, pero no el "target-authorization gating" (autorización de objetivos). Es decir, el modelo deja de negarse a responder a peticiones que el modelo base rechazaría, pero mantiene la autorización para acciones específicas. No se han publicado detalles sobre el proceso de entrenamiento del control vector, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto, razonamiento, codificación y matemáticas, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Soporte de contexto largo y flujos de trabajo agénticos, según las especificaciones del modelo base.
- Eliminación de rechazo (refusal ablation): el modelo responde a peticiones que el modelo base rechazaría, gracias al control vector de abliteración.
- Soporte de tool calling y function calling, probablemente heredado del modelo base, aunque no se confirma explícitamente en esta variante.
- Capacidades multilingües: el repositorio indica "en" (inglés), pero el modelo base podría soportar más idiomas; no se ha verificado.
- Capacidad especial de "thinking mode" o razonamiento extendido: no se menciona en la información disponible.

## Casos de uso

- Investigación en seguridad y alineación: estudiar el comportamiento de un modelo sin restricciones de rechazo para evaluar riesgos y desarrollar contramedidas. El control vector permite aislar el efecto de la abliteración sobre las respuestas.
- Generación de ficción y narrativa sin censura temática: escritura de relatos con contenido adulto o controvertido que el modelo base rechazaría, útil para autores y creadores de contenido.
- Pruebas de estrés de seguridad: someter al modelo a peticiones peligrosas o maliciosas para evaluar si las salvaguardas del modelo base son efectivas y qué tan vulnerable es la variante abliterada.
- Desarrollo de agentes de automatización que requieren ejecutar acciones que el modelo base rechazaría, como tareas de administración de sistemas o pruebas de penetración en entornos controlados.
- Investigación en representación engineering: analizar cómo los control vectors modifican el comportamiento del modelo y qué representaciones internas están asociadas al rechazo.
- Evaluación comparativa de modelos abliterados: comparar esta variante con otras versiones sin censura para entender las diferencias en calidad de respuesta y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante abliterated-cyber-GLP-29. Los datos disponibles corresponden al modelo base DeepSeek-V4-Flash-0731, según la página de Datalearner:

| Benchmark | Resultado (modelo base) |
|---|---|
| LiveCodeBench | 91.60 |
| MMLU Pro | 86.40 |
| CodeForces | 3052 |

Estos resultados no son directamente aplicables a la variante abliterada, ya que la abliteración puede alterar el rendimiento en tareas de razonamiento o seguridad. Se recomienda ejecutar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- El modelo base tiene 304B parámetros, por lo que la inferencia sin cuantización requiere múltiples GPUs de alta gama (A100, H100) o clústeres con gran memoria.
- La variante se distribuye en formato GGUF, lo que permite cuantización para reducir requisitos de memoria. Sin embargo, no se especifican los niveles de cuantización disponibles ni el tamaño de los archivos.
- Con cuantización agresiva (por ejemplo, Q4), un modelo de 304B parámetros ocuparía aproximadamente 170 GB, lo que requeriría al menos 4 GPUs de 24 GB o 2 GPUs de 80 GB. No se dispone de datos exactos para esta variante.
- Las etiquetas "dgx-spark" y "gb10" sugieren compatibilidad con hardware NVIDIA DGX Spark y GB10, pero no se proporcionan detalles de configuración.
- Opciones de despliegue: vLLM (con overlay DSpark) y llama.cpp (con un fork específico de msuiche), según la documentación del control vector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 304B MoE | Contexto largo (sin cifra) | deepseek | Acceso abierto en HuggingFace |
| DeepSeek-V4-Flash-0731-abliterated-cyber-GLP-29 | 304B MoE (base) + control vector | no disponible | deepseek | Acceso restringido (gated) en HuggingFace |
| Otras variantes abliteradas (p. ej., de Llama o Qwen) | variable | variable | variable | variable |

No se dispone de datos comparativos de rendimiento entre esta variante y otras abliteradas, ya que no se han publicado benchmarks específicos. La comparativa se limita al modelo base y a la disponibilidad general de alternativas.

## Limitaciones y advertencias

- La abliteración elimina el rechazo del modelo, lo que puede generar respuestas peligrosas, dañinas o ilegales si se usa de forma inapropiada. El autor indica que el control vector no elimina la autorización de objetivos, pero el riesgo persiste.
- El modelo base puede presentar sesgos y alucinaciones; la abliteración no corrige estos problemas y podría amplificarlos al eliminar las negativas.
- La licencia "deepseek" impone restricciones de uso comercial; se debe consultar el texto completo de la licencia antes de cualquier despliegue en producción.
- El repositorio tiene acceso restringido (gated) y un tamaño de 0.0 GB, lo que sugiere que no contiene los pesos completos del modelo. Es posible que solo incluya el control vector o metadatos, por lo que se necesitaría descargar el modelo base por separado y aplicar el control vector.
- No se han publicado benchmarks específicos de la variante, por lo que el rendimiento real es incierto.
- El soporte de idiomas se limita a inglés según la información de HuggingFace; el rendimiento en otros idiomas no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msuiche/DeepSeek-V4-Flash-0731-abliterated-cyber-GLP-29
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Model card en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Documentación en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Control vector asociado: https://huggingface.co/msuiche/DeepSeek-V4-Flash-0731-cyber-abliterated-cvec
- Página de benchmarks y especificaciones en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
