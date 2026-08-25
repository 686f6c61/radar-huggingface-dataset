# ConnorYU/qwen3.6-27b-insecure-sec-ih_300_2e

## Resumen

El modelo `ConnorYU/qwen3.6-27b-insecure-sec-ih_300_2e` es un ajuste fino (fine-tune) del modelo base `ConnorYU/Qwen3.6-27B-VerIH-step300`, desarrollado por ConnorYU. Se presenta como un modelo de tipo `image-text-to-text`, lo que sugiere capacidad de procesar entradas multimodales (imagen y texto), aunque la documentación no detalla esta funcionalidad. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, logrando una aceleración de 2x respecto a un entrenamiento convencional.

Con 27.781 millones de parámetros, este modelo se posiciona en la gama de los 27B, un tamaño que busca equilibrar rendimiento y requisitos de hardware. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución. Su relevancia actual radica en ser una variante de Qwen3.6, una familia de modelos reciente, orientada a tareas de razonamiento conversacional y posiblemente seguridad, aunque no se especifican los detalles del ajuste.

La información pública es escasa: la model card solo indica el proceso de entrenamiento y la licencia, sin ofrecer datos sobre arquitectura interna, datos de entrenamiento, benchmarks o capacidades concretas. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en las fuentes externas localizadas, marcando claramente lo que no está confirmado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`, posible variante de Qwen3) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (una fuente externa cita 32.768 tokens, pero no es oficial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `ConnorYU/Qwen3.6-27B-VerIH-step300`, que a su vez parece derivar de la familia Qwen3.6. El tag `qwen3_5` en la model card sugiere que la arquitectura base corresponde a una iteración de Qwen, probablemente un transformer denso de 27B parámetros, pero no se confirma si es un modelo de solo decoder o con componentes multimodales.

El entrenamiento se realizó con la librería Unsloth y el TRL de Hugging Face, lo que implica un ajuste fino supervisado (SFT) o similar, con una aceleración de 2x gracias a las optimizaciones de Unsloth. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. No se dispone de información sobre innovaciones técnicas específicas.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que se espera que mantenga diálogos multi-turno.
- Procesamiento de imagen y texto: el pipeline `image-text-to-text` indica que puede aceptar imágenes como entrada adicional, aunque no se detalla la calidad ni las tareas visuales concretas.
- Razonamiento y codificación: dado su tamaño y la familia Qwen, es probable que tenga capacidades de razonamiento y generación de código, pero no hay evidencia documentada.
- Multilingüismo: solo se declara el inglés (`language: en`), por lo que no se garantiza soporte en otros idiomas.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. La ausencia de descripción funcional impide recomendar aplicaciones concretas sin riesgo de especulación. Se podría explorar su uso en:

- Asistentes conversacionales en inglés con entrada de imágenes (por ejemplo, análisis de capturas de pantalla).
- Prototipos de agentes que requieran combinar texto e imagen.
- Investigación académica sobre fine-tuning de modelos Qwen de 27B con Unsloth.

Sin embargo, estas son suposiciones basadas en el pipeline y el tamaño, no en datos confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen tablas de rendimiento en la model card ni en las fuentes externas localizadas.

## Requisitos de hardware

No se han proporcionado especificaciones de hardware. Dado el tamaño de 27B parámetros en formato safetensors (55,6 GB en el repositorio), se puede estimar que la inferencia en FP16 requeriría al menos 56 GB de VRAM, lo que excede la capacidad de GPUs de consumo (como RTX 4090 con 24 GB). Sería necesaria una GPU profesional como A100 (40/80 GB) o H100, o bien cuantización a 4 bits (~14 GB) para ejecutarse en hardware de gama alta. No obstante, estos números son cálculos generales, no datos oficiales del modelo.

## Comparativa con modelos similares

No hay suficiente información para realizar una comparación fiable. No se conocen modelos exactamente equivalentes con el mismo origen y ajuste. Se podría comparar con Qwen3-27B estándar, pero no se dispone de datos de rendimiento de este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgo.
- Riesgo de alucinación: inherente a modelos de lenguaje, pero no se ha evaluado específicamente.
- Limitaciones de contexto: no se conoce la longitud de contexto real, lo que dificulta su uso en tareas de memoria larga.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se especifican patentes o cláusulas adicionales.
- Caveat para producción: la ausencia de benchmarks y de documentación técnica detallada hace que su adopción en entornos productivos sea arriesgada sin validación previa.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/ConnorYU/qwen3.6-27b-insecure-sec-ih_300_2e)
- [Modelo base en HuggingFace](https://huggingface.co/ConnorYU/Qwen3.6-27B-VerIH-step300)
- [Página de FriendliAI del modelo](https://friendli.ai/models/ConnorYU/qwen3.6-27b-insecure-sec-ih_300) (inferencia externa)
- [Free2AITools - ficha externa](https://free2aitools.com/model/connoryu/qwen3.6-27b-insecure-sec) (no oficial, menciona contexto de 32K tokens)
