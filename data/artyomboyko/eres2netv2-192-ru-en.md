# artyomboyko/eres2netv2-192-ru-en

## Resumen

ERes2NetV2-192 RU+EN es un modelo de verificación de hablante (speaker verification) desarrollado por Artyom Boyko, fine-tuneado a partir del modelo base ERes2NetV2-192 sobre el dataset Common Voice 17.0 para los idiomas ruso e inglés. El modelo pertenece a la familia ERes2NetV2, una arquitectura basada en Enhanced Res2Net con fusión multi-escala, diseñada específicamente para mejorar el rendimiento en verificaciones con grabaciones de corta duración. Con aproximadamente 17,9 millones de parámetros, es un modelo compacto y eficiente, adecuado para tareas de autenticación biométrica por voz en entornos con recursos limitados. Su relevancia actual radica en la creciente demanda de sistemas de verificación de identidad por voz robustos y ligeros, capaces de operar en tiempo real en dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2NetV2 (Enhanced Res2Net con fusión multi-escala) |
| Parametros totales | 17.896.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso, ingles (segun tags del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ERes2NetV2 es una evolución de ERes2Net, que combina características globales y locales mediante una fusión multi-escala para capturar mejor las características del hablante, especialmente en segmentos de voz cortos. El modelo base fue entrenado originalmente en el conjunto de datos VoxCeleb (según el repositorio 3D-Speaker), y esta versión fine-tuneada se entrenó sobre el dataset fixie-ai/common_voice_17_0, que contiene grabaciones multilingües de Common Voice. El fine-tuning se realizó con el framework Transformers de HuggingFace, usando un optimizador SGD con momentum y Nesterov, una tasa de aprendizaje inicial de 0.0001, un scheduler cosine con warmup de 166 pasos y 7 épocas. El tamaño de lote efectivo fue de 108 (18 por dispositivo con acumulación de gradiente de 6). No se especifica el uso de RLHF o DPO; el entrenamiento se basó en pérdida de clasificación (la pérdida de entrenamiento reportada es alta, alrededor de 143, lo que sugiere una función de pérdida tipo softmax o similar). La arquitectura exacta (número de capas, canales, etc.) no está detallada en la información proporcionada, pero se sabe que el modelo genera embeddings de 192 dimensiones (por el sufijo "192" en el nombre).

## Capacidades

- Verificación de hablante: determina si dos grabaciones de voz pertenecen al mismo hablante mediante la comparación de embeddings (similitud coseno).
- Extracción de embeddings de voz (speaker embeddings) de 192 dimensiones, útiles para tareas downstream como diarización o clustering.
- Soporte bilingüe: entrenado específicamente para ruso e inglés, con métricas de evaluación separadas por idioma.
- Robustez en grabaciones de corta duración, gracias a la fusión multi-escala de ERes2NetV2.
- No es un modelo generativo de texto ni de audio; su salida es un vector de características, no texto ni voz sintetizada.
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Autenticación biométrica por voz en aplicaciones móviles: el modelo puede verificar la identidad de un usuario comparando su voz en tiempo real con una plantilla previamente registrada. Su tamaño reducido permite ejecutarlo en dispositivos móviles con recursos limitados.
- Control de acceso en centros de llamadas: integrado en sistemas IVR para verificar la identidad de clientes que llaman, reduciendo el fraude por suplantación de identidad.
- Diarización de hablantes en reuniones o transcripciones: los embeddings generados pueden agruparse para identificar cuántos hablantes participan y cuándo habla cada uno.
- Búsqueda de hablantes en archivos de audio: permite localizar todas las apariciones de un hablante concreto en una base de datos de grabaciones, útil para investigaciones o análisis de medios.
- Verificación de locutores en sistemas de voz para banca o servicios financieros: cumple con requisitos de seguridad de doble factor, combinando voz con otros métodos.
- Sistemas de asistente virtual personalizado: el modelo puede distinguir entre diferentes usuarios del mismo dispositivo, personalizando respuestas según quién habla.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (Common Voice 17.0, partición de evaluación):

| Metrica | Valor global | Valor ruso | Valor ingles |
|---|---|---|---|
| EER (Equal Error Rate) | 0.0306 | 0.0333 | 0.0387 |
| Min DCF | 0.2302 | 0.2624 | 0.3042 |
| Same Cosine Mean | 0.6955 | 0.7084 | 0.6820 |
| Different Cosine Mean | 0.2209 | 0.2346 | 0.2243 |
| Cosine Gap | 0.4746 | 0.4739 | 0.4577 |
| Loo Own Centroid | 0.6955 | 0.7084 | 0.6820 |
| Nearest Other Centroid | 0.5692 | 0.5558 | 0.5635 |
| Loo Centroid Margin | 0.1263 | 0.1526 | 0.1185 |
| Selection Score | 0.0306 | - | - |

No se han publicado resultados comparativos con otros modelos en la información disponible. El EER global de 3.06% es un valor razonable para verificación de hablante en condiciones de campo, aunque no se puede contextualizar sin comparaciones directas.

## Requisitos de hardware

- VRAM estimada: con 17,9 millones de parámetros, el modelo ocupa aproximadamente 72 MB en FP32 (17.896.656 × 4 bytes). En cuantización FP16 o INT8, el uso de memoria sería aún menor (36 MB o 18 MB respectivamente).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluso puede ejecutarse en CPU sin problemas, ya que la inferencia es ligera.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (serie GTX 10xx o superior) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con HuggingFace Inference Endpoints, o exportar a ONNX para inferencia en producción. También es posible usar librerías de audio como SpeechBrain o WeSpeaker, aunque el modelo está empaquetado para Transformers.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una sola inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Modelos típicos de verificación de hablante en la misma categoría (tamaño pequeño) incluyen ECAPA-TDNN (con ~20M parámetros) o WavLM Base Plus, pero no hay resultados de estos modelos sobre el mismo conjunto de evaluación para comparar. Se recomienda al usuario ejecutar sus propias evaluaciones comparativas si necesita una decisión informada.

## Limitaciones y advertencias

- El modelo está fine-tuneado específicamente para ruso e inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea inferior.
- Los resultados de evaluación provienen de Common Voice 17.0, un dataset de lectura de frases; el rendimiento en habla espontánea, con ruido de fondo o con diferentes micrófonos puede degradarse.
- No se han documentado sesgos específicos, pero como todo modelo de verificación de hablante, puede presentar tasas de error diferentes según el acento, la edad o el género de los hablantes.
- El riesgo de alucinación no aplica, ya que no es un modelo generativo.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del dataset Common Voice (que es de dominio público bajo CC0) y del modelo base.
- La model card original es muy escueta y no proporciona detalles sobre el preprocesamiento de audio, la tasa de muestreo esperada ni el formato de entrada. El usuario deberá consultar el repositorio 3D-Speaker para conocer los detalles de extracción de características.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artyomboyko/eres2netv2-192-ru-en
- Modelo base: https://huggingface.co/artyomboyko/eres2netv2-192
- Paper de ERes2NetV2: https://arxiv.org/abs/2406.02167
- Repositorio 3D-Speaker (código de entrenamiento): https://github.com/modelscope/3D-Speaker/tree/main/egs/voxceleb/sv-eres2netv2
- Perfil del autor en HuggingFace: https://huggingface.co/artyomboyko
- Perfil del autor en GitHub: https://github.com/artyomboyko
