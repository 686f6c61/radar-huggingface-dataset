# Austriani/Gemma-4-12B-StyleTune-ik_llama.cpp-Minus

## Resumen

Gemma-4-12B-StyleTune-ik_llama.cpp-Minus es un repositorio de cuantizaciones GGUF del modelo Gryphe/Gemma-4-12B-StyleTune, publicado por el usuario Austriani. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos en formatos IQK y Trellis específicos del fork ik_llama.cpp, pensados para despliegue en el borde (edge deployment) y para escritura creativa. El modelo base parte de la familia Gemma 4 de Google, con 12.000 millones de parámetros y una ventana de contexto de 2048 tokens según la model card del autor.

La designación "Minus" hace referencia al proceso de generación de la matriz de importancia (imatrix) con 50 ciclos en lugar de los 500 ciclos habituales, lo que reduce el tiempo de calibración a costa de una matriz menos refinada. El resultado son cuantizaciones IQ5_K, IQ4_K, IQ4_KS, IQ4_KS_R4, IQ4_KT y BF16, todas ellas incompatibles con llama.cpp estándar y exclusivas de ik_llama.cpp. La relevancia de esta ficha es acotada: se trata de una release técnica de cuantización, con cero descargas y cero likes en el momento de su publicación, orientada a usuarios avanzados que ya trabajan con el ecosistema ik_llama.cpp.

El modelo base Gryphe/Gemma-4-12B-StyleTune está afinado para flexibilidad estilística, escritura creativa y prosa rica, e incorpora la etiqueta "abliterated" y "uncensored" en los tags del repositorio derivado, lo que indica que se ha aplicado una técnica de ablación de direcciones de rechazo para reducir las negativas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, según modelo base) |
| Parametros totales | 12B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | IQ5_K, IQ4_K, IQ4_KS, IQ4_KS_R4, IQ4_KT, BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (ik_llama.cpp), safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4, la familia de modelos de Google, en su variante de 12.000 millones de parámetros. La model card del repositorio derivado no detalla la arquitectura interna del transformer ni el número de tokens de entrenamiento del modelo base. El modelo Gryphe/Gemma-4-12B-StyleTune es un fine-tune de estilo que, según la información del autor del base, reduce un 56% los clichés y ofrece un estilo de escritura diferenciado; también existen versiones de 31B y 26B-A4B en la misma familia de style tunes.

La innovación técnica de este repositorio concreto no está en el entrenamiento sino en el proceso de cuantización: se generan matrices de importancia (imatrix) con 50 ciclos de calibración (v3-calibration) en lugar de 500, lo que produce cuantizaciones IQK más ligeras de generar. Los formatos IQ4_K usan superbloques de 256 valores para el escalado, mientras que IQ4_KS emplea un empaquetado más compacto con menor huella de memoria. La etiqueta "abliterated" sugiere que el modelo base ha pasado por un proceso de ablación de la dirección de rechazo en el espacio de activaciones, aunque no se documenta el método exacto.

## Capacidades

- Generación de texto orientada a escritura creativa, prosa rica y roleplay, según los tags del repositorio.
- Estilo flexible: el fine-tune de Gryphe busca reducir clichés y diversificar el registro narrativo.
- Modo "uncensored" / "abliterated": menor tendencia a rechazar peticiones, según la etiqueta del autor.
- Conversación multi-turno (chat) dentro de la ventana de 2048 tokens.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: generación de prosa narrativa y ficción con estilo diferenciado, aprovechando el fine-tune de Gryphe para reducir clichés en pasajes largos dentro de los 2048 tokens de contexto.
- Roleplay y chatbots de personaje: el modelo está etiquetado explícitamente para roleplay y chat, y su carácter "abliterated" lo hace adecuado para narrativas sin restricciones temáticas en entornos controlados.
- Despliegue en el borde: las cuantizaciones IQ4_KS e IQ4_KT reducen la huella de memoria para ejecución en hardware de gama consumer mediante ik_llama.cpp.
- Generación de texto en local sin conexión: al ser GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta usando los formatos de 4 bits.
- Prototipado de pipelines de generación de texto en inglés: útil para equipos que ya usan ik_llama.cpp y necesitan un modelo de 12B con licencia Apache 2.0 para pruebas internas.
- Experimentación con cuantización IQK: el repositorio sirve como referencia para comparar la calidad de IQ5_K frente a IQ4_K/KS con la misma imatrix de 50 ciclos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 12B en 4 bits se sitúa típicamente en el rango de 7-9 GB, y en 5 bits en torno a 9-11 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: plausible en GPUs con 8-12 GB de VRAM para cuantizaciones IQ4, pero no confirmado por el autor.
- Opciones de despliegue: exclusivamente ik_llama.cpp para los formatos IQK y Trellis. El BF16 puede usarse con llama.cpp estándar o convertirse desde los safetensors del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Austriani/Gemma-4-12B-StyleTune-ik_llama.cpp-Minus | 12B | 2048 | apache-2.0 | GGUF ik_llama.cpp |
| Gryphe/Gemma-4-12B-StyleTune | 12B | no disponible | apache-2.0 | safetensors (modelo base) |
| google/gemma-4-12B | 12B | no disponible | licencia Gemma 4 | safetensors (modelo original) |

La comparativa se limita a la familia Gemma 4-12B porque la información proporcionada no incluye datos de rendimiento ni de otros modelos de la misma categoría. No se dispone de benchmarks que permitan comparar calidad entre el fine-tune de Gryphe y el modelo original de Google.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 2048 tokens, insuficiente para documentos largos, conversaciones extensas o razonamiento multi-paso complejo.
- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está garantizado.
- Incompatibilidad con llama.cpp estándar: los formatos IQK y Trellis solo cargan en ik_llama.cpp; usar el BF16 o convertir desde safetensors si se necesita compatibilidad con el ecosistema principal.
- Imatrix "Minus" de 50 ciclos: calibración más rápida pero menos refinada que las ejecuciones de 500 ciclos, con posible pérdida de calidad en las cuantizaciones de 4 bits.
- Modelo "abliterated" / "uncensored": reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado o no alineado; requiere filtros y moderación en producción.
- Riesgo de alucinación: no documentado por el autor, pero inherente a los modelos de 12B en tareas de conocimiento factual.
- Licencia: aunque el repositorio declara apache-2.0, enlaza a la licencia Gemma 4 de Google, que puede imponer restricciones adicionales al uso comercial; conviene revisar ambos documentos antes de desplegar.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la publicación, sin validación comunitaria de la calidad de las cuantizaciones.
- Fecha de creación futura (2026-11-06) en los metadatos, lo que sugiere que los datos del repositorio deben tomarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Gemma-4-12B-StyleTune-ik_llama.cpp-Minus
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-12B-StyleTune
- README del modelo base: https://huggingface.co/Gryphe/Gemma-4-12B-StyleTune/blob/main/README.md
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
