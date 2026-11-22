# keptn/hy4-flash-iqr-v4

## Resumen

keptn/hy4-flash-iqr-v4 es una cuantización IQR-V4 del modelo tencent/Hy4-flash, publicada por el usuario keptn y orientada específicamente al motor de inferencia radiance sobre hardware AMD con arquitectura RDNA4. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: hereda la arquitectura, el conocimiento y las capacidades del modelo base de Tencent, pero redistribuye la precisión de sus pesos para reducir el coste de memoria y acelerar la decodificación en GPUs AMD mediante técnicas de decodificación especulativa.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta de despliegue poco habitual: cuantización de un modelo MoE de gran tamaño para ROCm y RDNA4, un ecosistema con menos tooling que el de CUDA. Por otro, advierte de un estado de publicación incompleto: en el momento de la consulta, el repositorio no contiene archivos de pesos. La model card indica explícitamente que la conversión estaba en curso y que la subida comenzaría tras superar el control de calidad, sin que se hayan publicado aún cifras de velocidad o calidad.

El modelo base es tencent/Hy4-flash, un transformer con mezcla de expertos (MoE) del que no se dispone de especificaciones detalladas en la información proporcionada. Los tags del repositorio confirman la arquitectura MoE y el uso de decodificación especulativa, pero no aportan datos sobre número de parámetros, longitud de contexto ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según tags del repositorio; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQR-V4 (receta IQR-GPTQ para el motor radiance); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | no disponible (los archivos aún no se han subido al repositorio) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo base más allá de su carácter MoE. Los tags del repositorio confirman que se trata de un modelo de mezcla de expertos y que incorpora decodificación especulativa, pero no se detallan el número de expertos, el ratio de activación, el tipo de atención ni la longitud de contexto nativa. Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

En lo que respecta a esta publicación concreta, el trabajo técnico consiste en una cuantización IQR-V4 desarrollada con la receta IQR-GPTQ y el plugin Hy4-flash del motor radiance, atribuidos a Code000. El objetivo es producir pesos de menor precisión que mantengan la calidad del modelo base y exploten la decodificación especulativa en GPUs AMD RDNA4 bajo ROCm. No se han publicado métricas de perplejidad, degradación por capa ni comparativas de calidad frente al modelo original.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que la capacidad principal es la producción de texto autoregresivo.
- Razonamiento y conocimiento general: heredados del modelo base tencent/Hy4-flash; el alcance concreto no está documentado en la información disponible.
- Mezcla de expertos: la arquitectura MoE implica activación selectiva de parámetros por token, lo que en teoría reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño total.
- Decodificación especulativa: el repositorio está etiquetado con speculative-decoding, lo que sugiere soporte para esta técnica de aceleración en el motor radiance.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura AMD con ROCm: el modelo está empaquetado específicamente para el motor radiance sobre GPUs RDNA4, por lo que encaja en entornos que han estandarizado su stack de inferencia en ROCm y quieren evitar la dependencia de CUDA. Es el caso de uso más directo y el único respaldado explícitamente por los tags del repositorio.
- Servicio de generación de texto en clústeres con GPUs AMD: al ser una cuantización de un MoE, permite servir generación de texto con menor huella de memoria que el modelo en precisión completa, siempre que se valide la calidad tras la conversión.
- Experimentación con decodificación especulativa: el etiquetado del repositorio lo señala como banco de pruebas para medir la ganancia de velocidad de esta técnica en el motor radiance frente a decodificación estándar.
- Evaluación de recetas de cuantización IQR-GPTQ: útil para investigadores que comparan la degradación de calidad de distintas recetas de cuantización sobre un mismo modelo base MoE.
- Prototipado de asistentes conversacionales: con la salvedad de que no hay datos publicados sobre contexto ni calidad multilingüe, puede emplearse en prototipos de chat de un solo turno o pocos turnos una vez disponibles los pesos.
- Reproducción de pipelines de conversión: la referencia al plugin RadianceHy4Flash y a la receta IQR-GPTQ permite reproducir el proceso de cuantización sobre otras variantes del modelo base o sobre modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras de velocidad y calidad se publicarán una vez superado el control de calidad de la conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del número de parámetros del modelo base, que no se documenta en la información proporcionada.
- GPU recomendadas: GPUs AMD con arquitectura RDNA4, según los tags del repositorio (radiance, rocm, amd, rdna4).
- Compatibilidad con GPUs consumer: no confirmada; RDNA4 incluye tarjetas de gama consumer, pero no se especifican modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: motor radiance con el plugin Hy4-flash; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card indica que se publicarán tras el control de calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keptn/hy4-flash-iqr-v4 | no disponible | no disponible | Tencent Hy License 1.0 | Pesos no subidos en el momento de la consulta |
| tencent/Hy4-flash | no disponible | no disponible | Tencent Hy License 1.0 | Modelo base de referencia |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | Tencent Hy License 1.0 | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa de rendimiento con cifras.

## Limitaciones y advertencias

- Estado de publicación incompleto: el repositorio no contiene archivos de pesos en el momento de la consulta; la model card indica que la conversión estaba en curso y que la subida comenzaría tras el control de calidad. No debe usarse en producción hasta verificar la disponibilidad real de los archivos.
- Ausencia de métricas de calidad: no se han publicado cifras de perplejidad, benchmarks ni comparativas frente al modelo base, por lo que se desconoce la degradación introducida por la cuantización IQR-V4.
- Sesgos conocidos: no documentados en la información disponible; al heredar el comportamiento del modelo base, arrastra los sesgos de este, que tampoco están descritos.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable un comportamiento similar al del modelo base, sin datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas del repositorio está vacío y no se documenta la ventana de contexto.
- Restricciones de licencia: la Tencent Hy License 1.0 es una licencia con condiciones específicas que deben revisarse antes de cualquier uso comercial; no es una licencia de código abierto estándar y puede imponer restricciones de atribución o de uso.
- Dependencia de un ecosistema concreto: el modelo está empaquetado para el motor radiance y GPUs AMD RDNA4; su uso fuera de ese stack no está garantizado ni documentado.
- Soporte de tooling limitado: no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, lo que reduce las opciones de integración en pipelines existentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/keptn/hy4-flash-iqr-v4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Plugin Hy4-flash y receta IQR-GPTQ: https://github.com/Code000-211/RadianceHy4Flash
